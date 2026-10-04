import { describe, expect, it } from 'vitest'
import { layoutProtocol, protocolExtent, sortedStages, type Cmd } from './layout'
import { BLANK_PROTOCOL, MESENDODERM_STRIP_TEMPLATE, PODOCYTE_TEMPLATE } from './templates'
import type { Protocol } from './types'

function allNumbers(cmds: Cmd[]): number[] {
  const out: number[] = []
  for (const c of cmds) for (const [k, v] of Object.entries(c)) if (typeof v === 'number') out.push(v), void k
  return out
}
const texts = (cmds: Cmd[]) => cmds.filter((c) => c.t === 'text').map((c) => (c as Extract<Cmd, { t: 'text' }>).text)

describe('protocolExtent', () => {
  it('spans min start to max end across stages and rows', () => {
    expect(protocolExtent(PODOCYTE_TEMPLATE)).toEqual({ min: 0, max: 28 })
    expect(protocolExtent(MESENDODERM_STRIP_TEMPLATE)).toEqual({ min: 0, max: 9 })
  })
  it('falls back to [0,1] with no stages', () => {
    expect(protocolExtent({ ...BLANK_PROTOCOL, stages: [], rows: [] })).toEqual({ min: 0, max: 1 })
  })
})

describe('sortedStages', () => {
  it('sorts by start and fixes reversed ranges', () => {
    const p: Protocol = { ...BLANK_PROTOCOL, stages: [
      { ...BLANK_PROTOCOL.stages[0]!, id: 'a', start: 5, end: 2 },
      { ...BLANK_PROTOCOL.stages[0]!, id: 'b', start: 0, end: 2 },
    ] }
    const s = sortedStages(p)
    expect(s.map((x) => x.id)).toEqual(['b', 'a'])
    expect(s[1]).toMatchObject({ start: 2, end: 5 })
  })
})

describe('layoutProtocol classic', () => {
  const L = layoutProtocol(PODOCYTE_TEMPLATE)
  it('produces finite geometry and positive size', () => {
    expect(L.width).toBeGreaterThan(0)
    expect(L.height).toBeGreaterThan(0)
    expect(allNumbers(L.cmds).every(Number.isFinite)).toBe(true)
  })
  it('labels each stage start and the overall end with "Day N"', () => {
    const t = texts(L.cmds)
    for (const d of [0, 2, 16, 21, 28]) expect(t).toContain(`Day ${d}`)
  })
  it('draws one media box per stage spanning its day range', () => {
    const rects = L.cmds.filter((c) => c.t === 'rect') as Extract<Cmd, { t: 'rect' }>[]
    const px = PODOCYTE_TEMPLATE.pxPerUnit
    const widths = rects.slice(0, 4).map((r) => r.w)
    expect(widths).toEqual([2 * px, 14 * px, 5 * px, 7 * px])
  })
  it('includes cell labels, markers and icons', () => {
    const t = texts(L.cmds)
    expect(t).toContain('hiPS cells')
    expect(t).toContain('Nephrin+')
    const icons = L.cmds.filter((c) => c.t === 'icon')
    expect(icons.length).toBe(4)
  })
  it('includes the ECM row text', () => {
    expect(texts(L.cmds)).toContain('ECM: Laminin 511-E8 or Laminin 511')
  })
  it('omits cells and media when toggled off', () => {
    const L2 = layoutProtocol({ ...PODOCYTE_TEMPLATE, showCells: false, showMedia: false })
    expect(L2.cmds.filter((c) => c.t === 'icon')).toHaveLength(0)
    expect(texts(L2.cmds)).not.toContain('100 ng/mL BMP-7')
    expect(L2.height).toBeLessThan(L.height)
  })
})

describe('layoutProtocol strip', () => {
  const L = layoutProtocol(MESENDODERM_STRIP_TEMPLATE)
  it('draws one ruler cell per unit', () => {
    const t = texts(L.cmds)
    for (let d = 0; d < 9; d++) expect(t).toContain(String(d))
  })
  it('draws every row span with its text', () => {
    const t = texts(L.cmds)
    expect(t).toContain('CHIR + AA + BSA')
    expect(t).toContain('RPMI')
    expect(t).toContain('Factors')
  })
  it('is finite with empty stages and rows', () => {
    const L2 = layoutProtocol({ ...MESENDODERM_STRIP_TEMPLATE, stages: [], rows: [], endpoint: undefined })
    expect(allNumbers(L2.cmds).every(Number.isFinite)).toBe(true)
    expect(L2.width).toBeGreaterThan(0)
  })
})

describe('robustness', () => {
  it('handles overlapping and unsorted stages without NaN', () => {
    const p: Protocol = { ...BLANK_PROTOCOL, stages: [
      { ...BLANK_PROTOCOL.stages[0]!, id: 'x', start: 3, end: 8 },
      { ...BLANK_PROTOCOL.stages[1]!, id: 'y', start: 0, end: 5 },
    ] }
    for (const layout of ['classic', 'strip'] as const) {
      const L = layoutProtocol({ ...p, layout })
      expect(allNumbers(L.cmds).every(Number.isFinite)).toBe(true)
    }
  })
  it('handles pxPerUnit of 0 by clamping', () => {
    const L = layoutProtocol({ ...BLANK_PROTOCOL, pxPerUnit: 0 })
    expect(allNumbers(L.cmds).every(Number.isFinite)).toBe(true)
  })
})
