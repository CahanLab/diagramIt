import type { Protocol, Stage } from './types'
import { UNIT_LABEL } from './types'

/** Primitive drawing commands produced by the layout engine (absolute coordinates, origin top-left). */
export type Cmd =
  | { t: 'line'; x1: number; y1: number; x2: number; y2: number; stroke: string; width: number; arrow?: boolean }
  | { t: 'rect'; x: number; y: number; w: number; h: number; fill: string; stroke?: string; strokeWidth?: number; rx?: number }
  | {
      t: 'text'
      x: number
      y: number
      text: string
      size: number
      weight?: 'bold'
      italic?: boolean
      align: 'left' | 'center' | 'right'
      baseline: 'top' | 'middle'
      color?: string
      /** Wrap width in px (omit for single-line). */
      maxWidth?: number
    }
  | { t: 'icon'; x: number; y: number; w: number; h: number; iconId: string; color: string }

export interface Layout {
  width: number
  height: number
  cmds: Cmd[]
}

export const INK = '#1f2937'

/** Time extent of the protocol in units. Falls back to [0, 1] when empty. */
export function protocolExtent(p: Protocol): { min: number; max: number } {
  const nums: number[] = []
  for (const s of p.stages) nums.push(s.start, s.end)
  for (const r of p.rows) for (const sp of r.spans) nums.push(sp.start, sp.end)
  const finite = nums.filter((n) => Number.isFinite(n))
  if (finite.length === 0) return { min: 0, max: 1 }
  const min = Math.min(...finite)
  const max = Math.max(...finite)
  return max > min ? { min, max } : { min, max: min + 1 }
}

export function sortedStages(p: Protocol): Stage[] {
  return [...p.stages]
    .filter((s) => Number.isFinite(s.start) && Number.isFinite(s.end))
    .map((s) => (s.end < s.start ? { ...s, start: s.end, end: s.start } : s))
    .sort((a, b) => a.start - b.start)
}

/** Rough text width estimate (px) used only for sizing boxes; real text is measured by the renderer. */
export function estimateTextWidth(text: string, size: number): number {
  return text.length * size * 0.55
}

export function layoutProtocol(p: Protocol): Layout {
  return p.layout === 'strip' ? layoutStrip(p) : layoutClassic(p)
}

// ---------------------------------------------------------------------------
// Classic layout (Nature Protocols style)
// ---------------------------------------------------------------------------
function layoutClassic(p: Protocol): Layout {
  const fs = p.fontSize
  const lineH = fs * 1.3
  const unitLabel = UNIT_LABEL[p.unit]
  const { min, max } = protocolExtent(p)
  const px = Math.max(1, p.pxPerUnit)
  const stages = sortedStages(p)
  const marginL = 70
  const marginR = 70
  const marginT = 10
  const x = (t: number) => marginL + (t - min) * px
  const axisY = marginT + fs * 2.2 + 16
  const axisEnd = x(max) + 50
  const cmds: Cmd[] = []

  if (p.title) {
    cmds.push({ t: 'text', x: marginL, y: marginT, text: p.title, size: fs * 1.25, weight: 'bold', align: 'left', baseline: 'top' })
  }
  const titleOffset = p.title ? fs * 1.8 : 0
  const ay = axisY + titleOffset

  // Axis with arrowhead
  cmds.push({ t: 'line', x1: x(min), y1: ay, x2: axisEnd, y2: ay, stroke: INK, width: 2.5, arrow: true })

  // Ticks: stage starts + overall end
  const tickTimes = Array.from(new Set([...stages.map((s) => s.start), max])).sort((a, b) => a - b)
  for (const t of tickTimes) {
    const isEnd = t === max && !stages.some((s) => s.start === t)
    const tickH = isEnd && !p.endpoint ? 10 : 24
    cmds.push({ t: 'line', x1: x(t), y1: ay - tickH, x2: x(t), y2: ay + tickH, stroke: INK, width: 2.5 })
    cmds.push({ t: 'text', x: x(t), y: ay - tickH - 6 - fs, text: `${unitLabel} ${fmt(t)}`, size: fs, align: 'center', baseline: 'top' })
  }
  // Stage names between ticks, just above the axis
  for (const s of stages) {
    const mid = (x(s.start) + x(s.end)) / 2
    cmds.push({ t: 'text', x: mid, y: ay - 8 - fs, text: s.name, size: fs, align: 'center', baseline: 'top' })
  }

  // Cells row
  const iconSize = fs * 5.6
  const cellLabelY = ay + 30
  const iconY = cellLabelY + lineH + 6
  let markersBottom = iconY
  const cellCols: { t: number; label?: string; iconId?: string; color?: string; markers?: string[] }[] = stages.map((s) => ({
    t: s.start, label: s.cellLabel, iconId: s.cellIconId, color: s.cellColor, markers: s.markers,
  }))
  if (p.endpoint) cellCols.push({ t: max, label: p.endpoint.cellLabel, iconId: p.endpoint.cellIconId, color: p.endpoint.cellColor, markers: p.endpoint.markers })
  if (p.showCells) {
    for (const c of cellCols) {
      if (!c.label && !c.iconId) continue
      const cx = x(c.t)
      if (c.label) cmds.push({ t: 'text', x: cx, y: cellLabelY, text: c.label, size: fs, align: 'center', baseline: 'top' })
      let bottom = iconY
      if (c.iconId) {
        cmds.push({ t: 'icon', x: cx - iconSize / 2, y: iconY, w: iconSize, h: iconSize, iconId: c.iconId, color: c.color ?? '#c9a46b' })
        bottom = iconY + iconSize
      }
      if (p.showMarkers && c.markers && c.markers.length) {
        let my = bottom + 8
        for (const m of c.markers) {
          cmds.push({ t: 'text', x: cx, y: my, text: m, size: fs, align: 'center', baseline: 'top' })
          my += lineH
        }
        bottom = my
      }
      markersBottom = Math.max(markersBottom, bottom)
    }
  } else {
    markersBottom = ay + 20
  }

  // Media boxes
  let y = markersBottom + 24
  if (p.showMedia && stages.length) {
    const maxLines = Math.max(1, ...stages.map((s) => s.media.length))
    const boxH = Math.max(lineH * 2.5, maxLines * lineH + lineH * 1.2)
    for (const s of stages) {
      const bx = x(s.start)
      const bw = x(s.end) - bx
      cmds.push({ t: 'rect', x: bx, y, w: bw, h: boxH, fill: s.color || '#ffffff', stroke: INK, strokeWidth: 1.5 })
      const lines = s.media.length ? s.media : ['']
      const textH = lines.length * lineH
      let ty = y + (boxH - textH) / 2
      for (const line of lines) {
        cmds.push({ t: 'text', x: bx + bw / 2, y: ty, text: line, size: fs, align: 'center', baseline: 'top', maxWidth: Math.max(20, bw - 12) })
        ty += lineH
      }
    }
    y += boxH + 10
  }

  // Extra rows (labelled bands)
  for (const row of p.rows) {
    const rowH = lineH * 1.9
    if (row.label) cmds.push({ t: 'text', x: x(min) - 10, y: y + rowH / 2, text: row.label, size: fs, align: 'right', baseline: 'middle' })
    for (const sp of row.spans) {
      const sx = x(Math.min(sp.start, sp.end))
      const sw = Math.abs(x(sp.end) - sx)
      cmds.push({ t: 'rect', x: sx, y, w: sw, h: rowH, fill: sp.color, stroke: INK, strokeWidth: 1.5 })
      cmds.push({ t: 'text', x: sx + sw / 2, y: y + rowH / 2, text: sp.text, size: fs, align: 'center', baseline: 'middle', maxWidth: Math.max(20, sw - 12) })
    }
    y += rowH + 8
  }

  // ECM full-width row
  if (p.ecm) {
    const rowH = lineH * 1.9
    cmds.push({ t: 'rect', x: x(min), y, w: x(max) - x(min), h: rowH, fill: '#ffffff', stroke: INK, strokeWidth: 1.5 })
    cmds.push({ t: 'text', x: (x(min) + x(max)) / 2, y: y + rowH / 2, text: p.ecm, size: fs, align: 'center', baseline: 'middle' })
    y += rowH + 8
  }

  const width = Math.max(axisEnd + marginR, marginL + estimateTextWidth(p.title ?? '', fs * 1.25) + marginR)
  return { width, height: y + 10, cmds }
}

// ---------------------------------------------------------------------------
// Strip layout (compact day ruler with coloured bands)
// ---------------------------------------------------------------------------
function layoutStrip(p: Protocol): Layout {
  const fs = p.fontSize
  const lineH = fs * 1.3
  const unitLabel = UNIT_LABEL[p.unit]
  const { min, max } = protocolExtent(p)
  const px = Math.max(1, p.pxPerUnit)
  const stages = sortedStages(p)
  const labelW = Math.max(60, ...p.rows.map((r) => estimateTextWidth(r.label, fs) + 16), estimateTextWidth(unitLabel, fs) + 16)
  const marginL = 10 + labelW
  const marginT = 10
  const x = (t: number) => marginL + (t - min) * px
  const cmds: Cmd[] = []
  let y = marginT

  if (p.title) {
    cmds.push({ t: 'text', x: 10, y, text: p.title, size: fs * 1.25, weight: 'bold', align: 'left', baseline: 'top' })
    y += fs * 1.9
  }

  // Day ruler: one cell per unit interval [t, t+1)
  const rulerH = lineH * 1.4
  cmds.push({ t: 'text', x: marginL - 8, y: y + rulerH / 2, text: unitLabel, size: fs, weight: 'bold', align: 'right', baseline: 'middle' })
  const units = Math.max(1, Math.ceil(max - min))
  for (let i = 0; i < units; i++) {
    const t = min + i
    cmds.push({ t: 'rect', x: x(t), y, w: px, h: rulerH, fill: i % 2 === 0 ? '#e5e7eb' : '#f3f4f6', stroke: '#ffffff', strokeWidth: 1 })
    cmds.push({ t: 'text', x: x(t) + px / 2, y: y + rulerH / 2, text: fmt(t), size: fs, weight: i === 0 ? 'bold' : undefined, align: 'center', baseline: 'middle' })
  }
  y += rulerH + 4

  // Band rows
  for (const row of p.rows) {
    const rowH = lineH * 1.4
    if (row.label) cmds.push({ t: 'text', x: marginL - 8, y: y + rowH / 2, text: row.label, size: fs, align: 'right', baseline: 'middle' })
    for (const sp of row.spans) {
      const sx = x(Math.min(sp.start, sp.end))
      const sw = Math.abs(x(sp.end) - sx)
      cmds.push({ t: 'rect', x: sx, y, w: sw, h: rowH, fill: sp.color, stroke: '#ffffff', strokeWidth: 1 })
      cmds.push({ t: 'text', x: sx + 6, y: y + rowH / 2, text: sp.text, size: fs, align: 'left', baseline: 'middle', maxWidth: Math.max(20, sw - 10) })
    }
    y += rowH + 3
  }

  // Stage bar + names
  if (stages.length) {
    const barH = 10
    y += 4
    for (const s of stages) {
      const sx = x(s.start)
      cmds.push({ t: 'rect', x: sx, y, w: x(s.end) - sx, h: barH, fill: s.color, stroke: INK, strokeWidth: 1, rx: 3 })
      cmds.push({ t: 'text', x: (sx + x(s.end)) / 2, y: y + barH + 4, text: s.name, size: fs, align: 'center', baseline: 'top', maxWidth: Math.max(30, x(s.end) - sx) })
    }
    y += barH + 4 + lineH * 2 + 4
  }

  // Cells row (optional, compact)
  if (p.showCells) {
    const iconSize = fs * 4
    const cols = stages.map((s) => ({ t: s.start, label: s.cellLabel, iconId: s.cellIconId, color: s.cellColor, markers: s.markers }))
    if (p.endpoint) cols.push({ t: max, label: p.endpoint.cellLabel, iconId: p.endpoint.cellIconId, color: p.endpoint.cellColor, markers: p.endpoint.markers })
    let bottom = y
    for (const c of cols) {
      if (!c.label && !c.iconId) continue
      const cx = x(c.t)
      let cy = y
      if (c.iconId) {
        cmds.push({ t: 'icon', x: cx - iconSize / 2, y: cy, w: iconSize, h: iconSize, iconId: c.iconId, color: c.color ?? '#c9a46b' })
        cy += iconSize + 4
      }
      if (c.label) {
        cmds.push({ t: 'text', x: cx, y: cy, text: c.label, size: fs, align: 'center', baseline: 'top' })
        cy += lineH
      }
      if (p.showMarkers && c.markers) {
        for (const m of c.markers) {
          cmds.push({ t: 'text', x: cx, y: cy, text: m, size: fs * 0.9, align: 'center', baseline: 'top' })
          cy += lineH * 0.9
        }
      }
      bottom = Math.max(bottom, cy)
    }
    y = bottom + 6
  }

  if (p.ecm) {
    const rowH = lineH * 1.4
    cmds.push({ t: 'rect', x: x(min), y, w: x(max) - x(min), h: rowH, fill: '#f3f4f6', stroke: '#ffffff', strokeWidth: 1 })
    cmds.push({ t: 'text', x: x(min) + 6, y: y + rowH / 2, text: p.ecm, size: fs, align: 'left', baseline: 'middle' })
    y += rowH + 4
  }

  const width = Math.max(x(max) + 20, 10 + estimateTextWidth(p.title ?? '', fs * 1.25) + 20)
  return { width, height: y + 6, cmds }
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100)
}
