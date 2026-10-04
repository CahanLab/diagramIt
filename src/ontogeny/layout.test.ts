import { describe, expect, it } from 'vitest'
import { DEFAULT_VIEW, type Ontogeny, type OntogenyView } from './types'
import { emphasisSet, layoutOntogeny, rootPath, rootsOf, visibleGraph, wrapLabel } from './layout'
import type { Cmd } from '../draw/types'

const G: Ontogeny = {
  id: 'test', name: 'Test', organism: 'x',
  stages: [{ id: 's0', label: 'S0', time: 0 }, { id: 's1', label: 'S1', time: 1 }, { id: 's2', label: 'S2', time: 3 }],
  lineages: [{ id: 'a', label: 'A', color: '#ff0000' }, { id: 'b', label: 'B', color: '#0000ff' }],
  nodes: [
    { id: 'root', label: 'Root', parents: [], stage: 's0' },
    { id: 'a1', label: 'A1', parents: ['root'], stage: 's1', lineage: 'a' },
    { id: 'a2', label: 'A2', parents: ['a1'], stage: 's2', terminal: true },
    { id: 'a3', label: 'A3', parents: ['a1'], stage: 's2', terminal: true },
    { id: 'b1', label: 'B1', parents: ['root'], stage: 's1', lineage: 'b' },
    { id: 'b2', label: 'B2', parents: ['b1', 'a1'], stage: 's2', terminal: true },
  ],
  edges: [{ from: 'root', to: 'root', kind: 'self' }],
}
const V: OntogenyView = { ...DEFAULT_VIEW }

const allNums = (cmds: Cmd[]) => cmds.flatMap((c) => Object.values(c).filter((v): v is number => typeof v === 'number'))

describe('visibleGraph', () => {
  it('hides a node and its descendants', () => {
    const v = visibleGraph(G, { ...V, hidden: ['a1'] })
    expect(v.nodes.map((n) => n.id).sort()).toEqual(['b1', 'b2', 'root'])
  })
  it('collapses a subtree and counts hidden descendants', () => {
    const v = visibleGraph(G, { ...V, collapsed: ['a1'] })
    expect(v.nodes.map((n) => n.id)).toContain('a1')
    expect(v.nodes.map((n) => n.id)).not.toContain('a2')
    expect(v.collapsedCounts.get('a1')).toBe(2)
  })
  it('filters by stage', () => {
    const v = visibleGraph(G, { ...V, stages: ['s0', 's1'] })
    expect(v.nodes.map((n) => n.id).sort()).toEqual(['a1', 'b1', 'root'])
  })
  it('excluding early stages keeps progeny and re-roots them', () => {
    const v = visibleGraph(G, { ...V, stages: ['s1', 's2'] })
    expect(v.nodes.map((n) => n.id).sort()).toEqual(['a1', 'a2', 'a3', 'b1', 'b2'])
    expect(rootsOf(v.nodes).map((n) => n.id).sort()).toEqual(['a1', 'b1'])
    const L = layoutOntogeny(G, { ...V, stages: ['s1', 's2'] })
    expect(L.nodes.length).toBe(5)
  })
  it('hiddenSelf removes one node and reconnects its children to the grandparent', () => {
    const v = visibleGraph(G, { ...V, hiddenSelf: ['a1'] })
    const a2 = v.nodes.find((n) => n.id === 'a2')!
    expect(a2.parents).toEqual(['root'])
    const b2 = v.nodes.find((n) => n.id === 'b2')!
    expect(b2.parents).toEqual(['b1', 'root'])
    expect(v.nodes.some((n) => n.id === 'a1')).toBe(false)
  })
  it('a forest lays out every root with finite geometry', () => {
    const L = layoutOntogeny(G, { ...V, hiddenSelf: ['root'] })
    expect(L.nodes.map((n) => n.id).sort()).toEqual(['a1', 'a2', 'a3', 'b1', 'b2'])
    const pos = Object.fromEntries(L.nodes.map((n) => [n.id, n]))
    expect(pos.a1!.x).toBeCloseTo(pos.b1!.x)
    expect(Math.abs(pos.a1!.y - pos.b1!.y)).toBeGreaterThan(V.nodeGap)
  })
})

describe('rootPath / emphasisSet', () => {
  it('walks primary parents to the root', () => {
    expect(rootPath(G, 'b2')).toEqual(['root', 'b1', 'b2'])
  })
  it('unions paths of emphasised nodes', () => {
    expect([...emphasisSet(G, { ...V, emphasis: ['a2', 'b2'] })!].sort()).toEqual(['a1', 'a2', 'b1', 'b2', 'root'])
    expect(emphasisSet(G, V)).toBeNull()
  })
})

describe('layoutOntogeny tree', () => {
  const L = layoutOntogeny(G, V)
  const pos = Object.fromEntries(L.nodes.map((n) => [n.id, n]))
  it('places parents centred over children (horizontal: same y as children midpoint)', () => {
    expect(pos.a1!.y).toBeCloseTo((pos.a2!.y + pos.a3!.y) / 2)
    expect(pos.root!.y).toBeCloseTo((pos.a1!.y + pos.b1!.y) / 2)
  })
  it('advances x by depth', () => {
    expect(pos.a1!.x).toBeGreaterThan(pos.root!.x)
    expect(pos.a2!.x).toBeGreaterThan(pos.a1!.x)
    expect(pos.a2!.x).toBeCloseTo(pos.b2!.x)
  })
  it('separates leaves by at least nodeGap', () => {
    expect(Math.abs(pos.a2!.y - pos.a3!.y)).toBeGreaterThanOrEqual(V.nodeGap)
  })
  it('colours by lineage with inheritance', () => {
    expect(pos.a2!.color).toBe('#ff0000')
    expect(pos.b2!.color).toBe('#0000ff')
  })
  it('draws a dashed secondary edge and a self loop', () => {
    const paths = L.cmds.filter((c) => c.t === 'path') as Extract<Cmd, { t: 'path' }>[]
    expect(paths.some((p) => p.dash)).toBe(true)
    expect(paths.some((p) => p.arrowEnd)).toBe(true)
  })
  it('has finite geometry and positive size', () => {
    expect(allNums(L.cmds).every(Number.isFinite)).toBe(true)
    expect(L.width).toBeGreaterThan(0)
    expect(L.height).toBeGreaterThan(0)
  })
})

describe('layoutOntogeny staged', () => {
  it('uses stage index for the level coordinate', () => {
    const L = layoutOntogeny(G, { ...V, layout: 'staged' })
    const pos = Object.fromEntries(L.nodes.map((n) => [n.id, n]))
    expect(pos.a1!.x).toBeCloseTo(pos.b1!.x)
    expect(pos.a2!.x).toBeGreaterThan(pos.a1!.x)
    const texts = L.cmds.filter((c) => c.t === 'text').map((c) => (c as Extract<Cmd, { t: 'text' }>).text)
    expect(texts).toContain('S0')
    expect(texts).toContain('S2')
  })
  it('vertical orientation swaps axes', () => {
    const L = layoutOntogeny(G, { ...V, layout: 'staged', orientation: 'vertical' })
    const pos = Object.fromEntries(L.nodes.map((n) => [n.id, n]))
    expect(pos.a2!.y).toBeGreaterThan(pos.a1!.y)
    expect(pos.a1!.y).toBeCloseTo(pos.b1!.y)
  })
})

describe('emphasis and styles', () => {
  it('fades non-emphasised nodes', () => {
    const L = layoutOntogeny(G, { ...V, emphasis: ['a2'] })
    const pos = Object.fromEntries(L.nodes.map((n) => [n.id, n]))
    expect(pos.a2!.faded).toBe(false)
    expect(pos.a1!.faded).toBe(false)
    expect(pos.b1!.faded).toBe(true)
    const faded = L.cmds.filter((c) => c.opacity !== undefined && c.opacity < 1)
    expect(faded.length).toBeGreaterThan(0)
  })
  it('metro edges are octilinear (segments horizontal, vertical or 45°)', () => {
    const L = layoutOntogeny(G, { ...V, edgeStyle: 'metro' })
    const paths = L.cmds.filter((c) => c.t === 'path' && !(c as Extract<Cmd, { t: 'path' }>).arrowEnd) as Extract<Cmd, { t: 'path' }>[]
    for (const p of paths) {
      const pts = p.d.match(/-?\d+(\.\d+)?/g)!.map(Number)
      for (let i = 2; i + 1 < pts.length; i += 2) {
        const dx = Math.abs(pts[i]! - pts[i - 2]!)
        const dy = Math.abs(pts[i + 1]! - pts[i - 1]!)
        const ok = dx < 0.02 || dy < 0.02 || Math.abs(dx - dy) < 0.05
        expect(ok).toBe(true)
      }
    }
  })
  it('renders all node styles and edge styles without NaN', () => {
    for (const nodeStyle of ['circle', 'pill', 'label', 'icon'] as const)
      for (const edgeStyle of ['curve', 'straight', 'orthogonal', 'metro'] as const)
        for (const layout of ['tree', 'staged'] as const)
          for (const orientation of ['horizontal', 'vertical'] as const) {
            const L = layoutOntogeny(G, { ...V, nodeStyle, edgeStyle, layout, orientation, showMarkers: true, showStageBands: true })
            expect(allNums(L.cmds).every(Number.isFinite)).toBe(true)
          }
  })
  it('collapsed nodes show a +N suffix', () => {
    const L = layoutOntogeny(G, { ...V, collapsed: ['a1'] })
    expect(L.nodes.find((n) => n.id === 'a1')!.label).toBe('A1 (+2)')
  })
})

describe('wrapLabel', () => {
  it('leaves short labels alone and wraps long ones at word boundaries', () => {
    expect(wrapLabel('Short', 100, 13)).toBe('Short')
    const w = wrapLabel('Megakaryocyte-erythroid progenitor (MEP)', 150, 13)
    expect(w.split('\n').length).toBeGreaterThan(1)
    expect(w.replace(/\n/g, ' ')).toBe('Megakaryocyte-erythroid progenitor (MEP)')
  })
})

describe('style overrides', () => {
  it('applies node colour, shape and edge overrides', () => {
    const L = layoutOntogeny(G, { ...V, nodeStyles: { a2: { color: '#123456', shape: 'square', labelBold: true, sizeScale: 2 } }, edgeStyles: { 'a1>a2': { color: '#abcdef', dashed: true, label: 'commit' } } })
    const rects = L.cmds.filter((c) => c.t === 'rect') as Extract<Cmd, { t: 'rect' }>[]
    expect(rects.some((r) => r.fill === '#123456' && r.w === V.nodeSize * 2 * 2 * 1.15)).toBe(true)
    const paths = L.cmds.filter((c) => c.t === 'path') as Extract<Cmd, { t: 'path' }>[]
    expect(paths.some((p) => p.stroke === '#abcdef' && p.dash)).toBe(true)
    const texts = L.cmds.filter((c) => c.t === 'text') as Extract<Cmd, { t: 'text' }>[]
    expect(texts.some((t) => t.text === 'commit')).toBe(true)
    expect(texts.some((t) => t.text === 'A2' && t.weight === 'bold')).toBe(true)
  })
})
