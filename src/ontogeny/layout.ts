import { cmdBounds, estimateTextWidth, INK, translateCmds, type Cmd, type Layout } from '../draw/types'
import type { Ontogeny, OntogenyNode, OntogenyView } from './types'

export interface PlacedNode {
  id: string
  label: string
  /** Level coordinate (depth or stage) and cross coordinate, before orientation. */
  level: number
  cross: number
  /** Final absolute position. */
  x: number
  y: number
  color: string
  faded: boolean
  terminal: boolean
  markers?: string
  iconId?: string
  /** Number of descendants hidden by collapsing this node. */
  collapsedCount: number
  isLeaf: boolean
}

export interface OntogenyLayout extends Layout {
  nodes: PlacedNode[]
}

// ---------------------------------------------------------------------------
// Graph helpers (pure)
// ---------------------------------------------------------------------------

export function childrenMap(nodes: OntogenyNode[]): Map<string, OntogenyNode[]> {
  const m = new Map<string, OntogenyNode[]>()
  const ids = new Set(nodes.map((n) => n.id))
  for (const n of nodes) {
    const p = n.parents.find((x) => ids.has(x))
    if (p) {
      if (!m.has(p)) m.set(p, [])
      m.get(p)!.push(n)
    }
  }
  return m
}

export function rootOf(nodes: OntogenyNode[]): OntogenyNode | undefined {
  const ids = new Set(nodes.map((n) => n.id))
  return nodes.find((n) => !n.parents.some((p) => ids.has(p)))
}

/** All descendants (via primary parent among `nodes`) of `id`. */
export function descendants(nodes: OntogenyNode[], id: string): Set<string> {
  const ch = childrenMap(nodes)
  const out = new Set<string>()
  const stack = [...(ch.get(id) ?? [])]
  while (stack.length) {
    const n = stack.pop()!
    if (out.has(n.id)) continue
    out.add(n.id)
    stack.push(...(ch.get(n.id) ?? []))
  }
  return out
}

/** Ids on the primary-parent path from the root to `id` (inclusive). */
export function rootPath(graph: Ontogeny, id: string): string[] {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]))
  const path: string[] = []
  let cur = byId.get(id)
  const seen = new Set<string>()
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id)
    path.unshift(cur.id)
    cur = cur.parents[0] ? byId.get(cur.parents[0]) : undefined
  }
  return path
}

export interface VisibleGraph {
  nodes: OntogenyNode[]
  collapsedCounts: Map<string, number>
}

/** Apply hidden / collapsed / stage filters. Hidden and collapsed subtrees are removed. */
export function visibleGraph(graph: Ontogeny, view: OntogenyView): VisibleGraph {
  const stageSet = view.stages.length ? new Set(view.stages) : null
  let nodes = graph.nodes.filter((n) => !stageSet || !n.stage || stageSet.has(n.stage))
  const remove = new Set<string>()
  for (const h of view.hidden) {
    remove.add(h)
    for (const d of descendants(graph.nodes, h)) remove.add(d)
  }
  const collapsedCounts = new Map<string, number>()
  for (const c of view.collapsed) {
    if (remove.has(c)) continue
    const d = descendants(nodes.filter((n) => !remove.has(n.id)), c)
    collapsedCounts.set(c, d.size)
    for (const x of d) remove.add(x)
  }
  nodes = nodes.filter((n) => !remove.has(n.id))
  // keep connectivity: a node whose primary parent was removed is dropped too (unless it is the root)
  const root = rootOf(graph.nodes)
  let changed = true
  while (changed) {
    changed = false
    const ids = new Set(nodes.map((n) => n.id))
    const next = nodes.filter((n) => n.id === root?.id || n.parents.some((p) => ids.has(p)))
    if (next.length !== nodes.length) {
      nodes = next
      changed = true
    }
  }
  return { nodes, collapsedCounts }
}

/** Node ids to draw at full opacity when emphasis is active: union of root paths of emphasised nodes. */
export function emphasisSet(graph: Ontogeny, view: OntogenyView): Set<string> | null {
  if (!view.emphasis.length) return null
  const s = new Set<string>()
  for (const id of view.emphasis) for (const p of rootPath(graph, id)) s.add(p)
  return s
}

export function lineageColorOf(graph: Ontogeny, id: string): string {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]))
  const lin = new Map(graph.lineages.map((l) => [l.id, l.color]))
  let cur = byId.get(id)
  const seen = new Set<string>()
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id)
    if (cur.lineage && lin.has(cur.lineage)) return lin.get(cur.lineage)!
    cur = cur.parents[0] ? byId.get(cur.parents[0]) : undefined
  }
  return '#6b7280'
}

const STAGE_PALETTE = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac']

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export function layoutOntogeny(graph: Ontogeny, view: OntogenyView): OntogenyLayout {
  const { nodes, collapsedCounts } = visibleGraph(graph, view)
  const fs = view.fontSize
  const horizontal = view.orientation === 'horizontal'
  const emph = emphasisSet(graph, view)
  const ch = childrenMap(nodes)
  const root = rootOf(nodes)
  const placed = new Map<string, PlacedNode>()
  if (!root) return { width: 10, height: 10, cmds: [], nodes: [] }

  // --- level (depth or stage)
  const stageIds = view.stages.length ? graph.stages.filter((s) => view.stages.includes(s.id)).map((s) => s.id) : graph.stages.map((s) => s.id)
  const stageIndex = new Map(stageIds.map((s, i) => [s, i]))
  const levelOf = new Map<string, number>()
  const assignLevels = (n: OntogenyNode, depth: number, parentLevel: number) => {
    let level = depth
    if (view.layout === 'staged') {
      level = n.stage && stageIndex.has(n.stage) ? stageIndex.get(n.stage)! : parentLevel + 1
      if (level <= parentLevel && n.id !== root.id) level = parentLevel + 1
    }
    levelOf.set(n.id, level)
    for (const c of ch.get(n.id) ?? []) assignLevels(c, depth + 1, level)
  }
  assignLevels(root, 0, -1)
  const maxLevel = Math.max(...levelOf.values())

  // --- level positions (px). Staged layouts can be proportional to stage time.
  const levelPos: number[] = []
  const stageTimes = stageIds.map((s) => graph.stages.find((x) => x.id === s)?.time)
  const proportional = view.layout === 'staged' && stageTimes.every((t) => typeof t === 'number') && stageTimes.length > 1 && view.proportional
  const nodeStyleW = (label: string) => (view.nodeStyle === 'pill' ? estimateTextWidth(label, fs) + fs * 1.4 : 0)
  const maxPill = Math.max(0, ...nodes.map((n) => nodeStyleW(n.label)))
  const levelGap = Math.max(view.levelGap, horizontal && view.nodeStyle === 'pill' ? maxPill + 24 : 0)
  /** Max label width before wrapping: internal labels must fit between levels; leaf labels may run long. */
  const wrapW = (isLeaf: boolean) => (horizontal ? (isLeaf ? Math.max(levelGap * 1.6, 220) : levelGap - view.nodeSize * 2 - 14) : Math.max(view.nodeGap * 2.2, 90))
  const displayLabel = (n: OntogenyNode, isLeaf: boolean) => wrapLabel(labelOf(n, collapsedCounts), wrapW(isLeaf), fs)
  if (proportional) {
    const times = stageTimes as number[]
    const t0 = times[0]!
    const span = Math.max(1, times[times.length - 1]! - t0)
    const total = levelGap * (stageIds.length - 1)
    for (let i = 0; i <= maxLevel; i++) levelPos.push(i < times.length ? ((times[i]! - t0) / span) * total : levelGap * i)
  } else {
    for (let i = 0; i <= maxLevel; i++) levelPos.push(levelGap * i)
  }

  // --- cross positions: post-order leaves, parents centred over children
  const iconSize = view.nodeSize * 4
  const extentOf = (n: OntogenyNode): number => {
    const label = displayLabel(n, true)
    const lines = label.split('\n').length + (view.showMarkers && n.markers ? 1 : 0)
    if (view.nodeStyle === 'icon') return Math.max(view.nodeGap, iconSize + 10, horizontal ? lines * fs * 1.3 : estimateTextWidth(label, fs) + 10)
    if (view.nodeStyle === 'pill') return Math.max(view.nodeGap, fs * 2.2 + (lines - 1) * fs * 1.2)
    const widest = Math.max(...label.split('\n').map((l) => estimateTextWidth(l, fs)))
    return horizontal ? Math.max(view.nodeGap, lines * fs * 1.3 + 6) : Math.max(view.nodeGap, widest * 0.8 + 10)
  }
  let cursor = 0
  const place = (n: OntogenyNode): number => {
    const kids = ch.get(n.id) ?? []
    let cross: number
    if (kids.length === 0) {
      const ext = extentOf(n)
      cross = cursor + ext / 2
      cursor += ext
    } else {
      const cs = kids.map(place)
      cross = (cs[0]! + cs[cs.length - 1]!) / 2
    }
    const faded = !!emph && !emph.has(n.id)
    const color = view.colorBy === 'lineage' ? lineageColorOf(graph, n.id) : view.colorBy === 'stage' ? STAGE_PALETTE[(n.stage ? stageIndex.get(n.stage) ?? 0 : levelOf.get(n.id)!) % STAGE_PALETTE.length]! : '#6b7280'
    placed.set(n.id, {
      id: n.id, label: displayLabel(n, kids.length === 0), level: levelOf.get(n.id)!, cross, x: 0, y: 0, color, faded,
      terminal: !!n.terminal, markers: n.markers, iconId: n.iconId, collapsedCount: collapsedCounts.get(n.id) ?? 0, isLeaf: kids.length === 0,
    })
    return cross
  }
  place(root)

  // --- to absolute coordinates
  const marginL = 40
  const marginT = 40
  const axisH = view.layout === 'staged' && view.showStageAxis ? fs * 2.6 : 0
  for (const p of placed.values()) {
    const lp = levelPos[p.level]!
    if (horizontal) {
      p.x = marginL + lp
      p.y = marginT + axisH + p.cross
    } else {
      p.x = marginL + p.cross
      p.y = marginT + axisH + lp
    }
  }

  const cmds: Cmd[] = []
  const fade = (id: string) => (placed.get(id)?.faded ? view.fadeOpacity : 1)
  const r = view.nodeSize
  const edgeW = view.edgeStyle === 'metro' ? view.edgeWidth * 2.6 : view.edgeWidth

  // --- stage bands & axis (staged layout)
  const crossExtent = cursor
  if (view.layout === 'staged') {
    stageIds.forEach((sid, i) => {
      if (i > maxLevel) return
      const stage = graph.stages.find((s) => s.id === sid)!
      const lp = levelPos[i]!
      const prev = i > 0 ? (levelPos[i - 1]! + lp) / 2 : lp - levelGap / 2
      const next = i < levelPos.length - 1 ? (levelPos[i + 1]! + lp) / 2 : lp + levelGap / 2
      if (view.showStageBands && i % 2 === 0) {
        if (horizontal) cmds.push({ t: 'rect', x: marginL + prev, y: marginT + axisH - 6, w: next - prev, h: crossExtent + 12, fill: '#f3f4f6' })
        else cmds.push({ t: 'rect', x: marginL - 6, y: marginT + axisH + prev, w: crossExtent + 12, h: next - prev, fill: '#f3f4f6' })
      }
      if (view.showStageAxis) {
        if (horizontal) {
          cmds.push({ t: 'text', x: marginL + lp, y: marginT, text: stage.label, size: fs, weight: 'bold', align: 'center', baseline: 'top', color: INK })
          cmds.push({ t: 'line', x1: marginL + lp, y1: marginT + fs * 1.5, x2: marginL + lp, y2: marginT + axisH - 4, stroke: '#9ca3af', width: 1 })
        } else {
          cmds.push({ t: 'text', x: marginL - 10, y: marginT + axisH + lp, text: stage.label, size: fs, weight: 'bold', align: 'right', baseline: 'middle', color: INK })
        }
      }
    })
    if (view.showStageAxis && horizontal) {
      const x0 = marginL + levelPos[0]!
      const x1 = marginL + levelPos[maxLevel]! + levelGap * 0.4
      cmds.push({ t: 'line', x1: x0, y1: marginT + axisH - 4, x2: x1, y2: marginT + axisH - 4, stroke: INK, width: 1.5, arrow: true })
    }
  }

  // --- edges
  const edgeAnn = new Map((graph.edges ?? []).map((e) => [`${e.from}>${e.to}`, e]))
  const edgePath = (a: PlacedNode, b: PlacedNode): string => {
    const ax = a.x
    const ay = a.y
    const bx = b.x
    const by = b.y
    switch (view.edgeStyle) {
      case 'straight':
        return `M ${f(ax)} ${f(ay)} L ${f(bx)} ${f(by)}`
      case 'orthogonal': {
        if (horizontal) { const mx = (ax + bx) / 2; return `M ${f(ax)} ${f(ay)} L ${f(mx)} ${f(ay)} L ${f(mx)} ${f(by)} L ${f(bx)} ${f(by)}` }
        const my = (ay + by) / 2
        return `M ${f(ax)} ${f(ay)} L ${f(ax)} ${f(my)} L ${f(bx)} ${f(my)} L ${f(bx)} ${f(by)}`
      }
      case 'metro': {
        // octilinear: straight, 45° diagonal, straight
        if (horizontal) {
          const L = Math.abs(bx - ax)
          const d = Math.abs(by - ay)
          if (d < 0.5) return `M ${f(ax)} ${f(ay)} L ${f(bx)} ${f(by)}`
          const diag = Math.min(d, L)
          const sx = ax + (L - diag) / 2
          const ex = sx + diag
          const sy = ay
          const ey = ay + Math.sign(by - ay) * diag
          if (diag < d) return `M ${f(ax)} ${f(ay)} L ${f(sx)} ${f(sy)} L ${f(ex)} ${f(ey)} L ${f(bx)} ${f(by)}`
          return `M ${f(ax)} ${f(ay)} L ${f(sx)} ${f(sy)} L ${f(ex)} ${f(ey)} L ${f(bx)} ${f(by)}`
        }
        const L = Math.abs(by - ay)
        const d = Math.abs(bx - ax)
        if (d < 0.5) return `M ${f(ax)} ${f(ay)} L ${f(bx)} ${f(by)}`
        const diag = Math.min(d, L)
        const sy = ay + (L - diag) / 2
        const ey = sy + diag
        const ex = ax + Math.sign(bx - ax) * diag
        return `M ${f(ax)} ${f(ay)} L ${f(ax)} ${f(sy)} L ${f(ex)} ${f(ey)} L ${f(bx)} ${f(by)}`
      }
      default: {
        if (horizontal) { const mx = (ax + bx) / 2; return `M ${f(ax)} ${f(ay)} C ${f(mx)} ${f(ay)}, ${f(mx)} ${f(by)}, ${f(bx)} ${f(by)}` }
        const my = (ay + by) / 2
        return `M ${f(ax)} ${f(ay)} C ${f(ax)} ${f(my)}, ${f(bx)} ${f(my)}, ${f(bx)} ${f(by)}`
      }
    }
  }
  for (const n of nodes) {
    const b = placed.get(n.id)!
    n.parents.forEach((pid, i) => {
      const a = placed.get(pid)
      if (!a) return
      const op = Math.min(fade(n.id), fade(pid))
      const emphasised = emph ? emph.has(n.id) && emph.has(pid) : true
      const w = emphasised ? edgeW : edgeW
      const secondary = i > 0
      cmds.push({ t: 'path', d: edgePath(a, b), stroke: b.color, width: secondary ? Math.max(1, w * 0.6) : w, dash: secondary ? [w * 2, w * 2] : undefined, opacity: op })
      const ann = edgeAnn.get(`${pid}>${n.id}`)
      if (ann?.label) {
        cmds.push({ t: 'text', x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - fs * 0.9, text: ann.label, size: fs * 0.85, italic: true, align: 'center', baseline: 'top', color: '#6b7280', opacity: op })
      }
    })
  }
  // self-renewal loops
  for (const e of graph.edges ?? []) {
    if (e.kind !== 'self') continue
    const p = placed.get(e.from)
    if (!p) continue
    const lr = r * 1.4
    const cx = p.x
    const cy = p.y - r - lr
    cmds.push({ t: 'path', d: `M ${f(cx - lr * 0.7)} ${f(cy + lr * 0.7)} A ${f(lr)} ${f(lr)} 0 1 1 ${f(cx + lr * 0.7)} ${f(cy + lr * 0.7)}`, stroke: p.color, width: Math.max(1, edgeW * 0.6), opacity: fade(e.from), arrowEnd: { x: cx + lr * 0.7, y: cy + lr * 0.7, fromX: cx + lr, fromY: cy } })
  }

  // --- nodes
  for (const p of placed.values()) {
    const op = p.faded ? view.fadeOpacity : 1
    const labelLines = view.showMarkers && p.markers ? `${p.label}\n${p.markers}` : p.label
    if (view.nodeStyle === 'icon' && p.iconId) {
      cmds.push({ t: 'icon', x: p.x - iconSize / 2, y: p.y - iconSize / 2, w: iconSize, h: iconSize, iconId: p.iconId, color: p.color, opacity: op })
      if (horizontal && !p.isLeaf) cmds.push({ t: 'text', x: p.x, y: p.y - iconSize / 2 - fs * 1.3 * (labelLines.split('\n').length) - 2, text: labelLines, size: fs, align: 'center', baseline: 'top', opacity: op })
      else if (horizontal) cmds.push({ t: 'text', x: p.x + iconSize / 2 + 6, y: p.y, text: labelLines, size: fs, align: 'left', baseline: 'middle', opacity: op })
      else cmds.push({ t: 'text', x: p.x, y: p.y + iconSize / 2 + 4, text: labelLines, size: fs, align: 'center', baseline: 'top', opacity: op })
      continue
    }
    if (view.nodeStyle === 'pill') {
      const w = estimateTextWidth(p.label, fs) + fs * 1.4
      const h = fs * 1.8 + (view.showMarkers && p.markers ? fs * 1.2 : 0)
      cmds.push({ t: 'rect', x: p.x - w / 2, y: p.y - h / 2, w, h, fill: p.color, stroke: INK, strokeWidth: 1.2, rx: h / 2, opacity: op })
      cmds.push({ t: 'text', x: p.x, y: p.y, text: labelLines, size: fs, align: 'center', baseline: 'middle', color: textOn(p.color), opacity: op })
      continue
    }
    if (view.nodeStyle === 'label') {
      // text only, with a small dot
      cmds.push({ t: 'circle', cx: p.x, cy: p.y, r: Math.max(2, r * 0.45), fill: p.color, opacity: op })
    } else if (view.edgeStyle === 'metro') {
      cmds.push({ t: 'circle', cx: p.x, cy: p.y, r: p.terminal ? r * 1.15 : r, fill: '#ffffff', stroke: p.color, strokeWidth: Math.max(2, edgeW * 0.45), opacity: op })
    } else {
      cmds.push({ t: 'circle', cx: p.x, cy: p.y, r: p.terminal ? r * 1.15 : r, fill: p.color, stroke: INK, strokeWidth: 1.2, opacity: op })
    }
    const labelOffset = r + 6
    if (horizontal) {
      if (p.isLeaf) cmds.push({ t: 'text', x: p.x + labelOffset, y: p.y, text: labelLines, size: fs, align: 'left', baseline: 'middle', opacity: op })
      else cmds.push({ t: 'text', x: p.x - r, y: p.y - r - 3 - fs * 1.3 * labelLines.split('\n').length + fs * 0.25, text: labelLines, size: fs, align: 'left', baseline: 'top', opacity: op })
    } else {
      if (p.isLeaf) cmds.push({ t: 'text', x: p.x, y: p.y + labelOffset, text: labelLines, size: fs, align: 'center', baseline: 'top', opacity: op })
      else cmds.push({ t: 'text', x: p.x + labelOffset, y: p.y, text: labelLines, size: fs, align: 'left', baseline: 'middle', opacity: op })
    }
  }

  // --- legend & title
  let bounds = cmdBounds(cmds)
  if (view.showLineageLegend && view.colorBy === 'lineage' && graph.lineages.length) {
    const used = new Set(nodes.map((n) => lineageColorOf(graph, n.id)))
    const items = graph.lineages.filter((l) => used.has(l.color))
    let ly = bounds.maxY + fs * 1.5
    const lx = marginL
    let cx = lx
    for (const l of items) {
      const w = estimateTextWidth(l.label, fs) + fs * 2.4
      if (cx + w > Math.max(bounds.maxX, 600) && cx > lx) { cx = lx; ly += fs * 1.6 }
      cmds.push({ t: 'circle', cx: cx + fs * 0.5, cy: ly + fs * 0.5, r: fs * 0.42, fill: l.color, stroke: INK, strokeWidth: 1 })
      cmds.push({ t: 'text', x: cx + fs * 1.3, y: ly + fs * 0.5, text: l.label, size: fs, align: 'left', baseline: 'middle' })
      cx += w
    }
    bounds = cmdBounds(cmds)
  }
  if (view.title) {
    cmds.unshift({ t: 'text', x: marginL, y: 8, text: view.title, size: fs * 1.3, weight: 'bold', align: 'left', baseline: 'top' })
    bounds = cmdBounds(cmds)
  }
  // normalise so nothing is at negative coordinates
  const dx = bounds.minX < 10 ? 10 - bounds.minX : 0
  const dy = bounds.minY < 10 ? 10 - bounds.minY : 0
  const finalCmds = dx || dy ? translateCmds(cmds, dx, dy) : cmds
  const placedNodes = [...placed.values()].map((p) => ({ ...p, x: p.x + dx, y: p.y + dy }))
  const fb = cmdBounds(finalCmds)
  return { width: fb.maxX + 30, height: fb.maxY + 30, cmds: finalCmds, nodes: placedNodes }
}

/** Greedy word-wrap so that no line exceeds `maxW` px (estimated). Never breaks inside a word. */
export function wrapLabel(text: string, maxW: number, fs: number): string {
  if (estimateTextWidth(text, fs) <= maxW) return text
  const words = text.split(/\s+/)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (cur && estimateTextWidth(next, fs) > maxW) {
      lines.push(cur)
      cur = w
    } else cur = next
  }
  if (cur) lines.push(cur)
  return lines.join('\n')
}

function labelOf(n: OntogenyNode, collapsed: Map<string, number>): string {
  const c = collapsed.get(n.id)
  return c ? `${n.label} (+${c})` : n.label
}

function textOn(bg: string): string {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(bg)
  if (!m) return INK
  const lum = (0.299 * parseInt(m[1]!, 16) + 0.587 * parseInt(m[2]!, 16) + 0.114 * parseInt(m[3]!, 16)) / 255
  return lum > 0.6 ? INK : '#ffffff'
}

function f(n: number): string {
  return (Math.round(n * 100) / 100).toString()
}
