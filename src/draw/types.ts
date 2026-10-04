/** Primitive drawing commands shared by the smart-object layout engines (absolute px, origin top-left). */
export type Cmd =
  | { t: 'line'; x1: number; y1: number; x2: number; y2: number; stroke: string; width: number; arrow?: boolean; dash?: number[]; opacity?: number }
  | { t: 'rect'; x: number; y: number; w: number; h: number; fill: string; stroke?: string; strokeWidth?: number; rx?: number; opacity?: number }
  | { t: 'circle'; cx: number; cy: number; r: number; fill: string; stroke?: string; strokeWidth?: number; opacity?: number }
  | { t: 'path'; d: string; stroke: string; width: number; fill?: string; dash?: number[]; opacity?: number; arrowEnd?: { x: number; y: number; fromX: number; fromY: number } }
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
      opacity?: number
    }
  | { t: 'icon'; x: number; y: number; w: number; h: number; iconId: string; color: string; opacity?: number }

export interface Layout {
  width: number
  height: number
  cmds: Cmd[]
}

export const INK = '#1f2937'

/** Rough text width estimate (px) used only for sizing; the renderer measures real text. */
export function estimateTextWidth(text: string, size: number): number {
  return text.length * size * 0.55
}

/** Bounding box of a command list (ignores text wrapping). */
export function cmdBounds(cmds: Cmd[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  const add = (x: number, y: number) => {
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
  }
  for (const c of cmds) {
    switch (c.t) {
      case 'line': add(c.x1, c.y1); add(c.x2, c.y2); break
      case 'rect': add(c.x, c.y); add(c.x + c.w, c.y + c.h); break
      case 'circle': add(c.cx - c.r, c.cy - c.r); add(c.cx + c.r, c.cy + c.r); break
      case 'icon': add(c.x, c.y); add(c.x + c.w, c.y + c.h); break
      case 'path': {
        const nums = c.d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
        for (let i = 0; i + 1 < nums.length; i += 2) add(nums[i]!, nums[i + 1]!)
        break
      }
      case 'text': {
        const w = c.maxWidth ?? estimateTextWidth(c.text, c.size)
        const h = c.size * 1.3 * (c.text.split('\n').length)
        const x0 = c.align === 'center' ? c.x - w / 2 : c.align === 'right' ? c.x - w : c.x
        const y0 = c.baseline === 'middle' ? c.y - h / 2 : c.y
        add(x0, y0); add(x0 + w, y0 + h)
        break
      }
    }
  }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  return { minX, minY, maxX, maxY }
}

/** Shift all commands by (dx, dy). */
export function translateCmds(cmds: Cmd[], dx: number, dy: number): Cmd[] {
  return cmds.map((c) => {
    switch (c.t) {
      case 'line': return { ...c, x1: c.x1 + dx, y1: c.y1 + dy, x2: c.x2 + dx, y2: c.y2 + dy }
      case 'rect': return { ...c, x: c.x + dx, y: c.y + dy }
      case 'circle': return { ...c, cx: c.cx + dx, cy: c.cy + dy }
      case 'icon': return { ...c, x: c.x + dx, y: c.y + dy }
      case 'text': return { ...c, x: c.x + dx, y: c.y + dy }
      case 'path': {
        const d = translatePathD(c.d, dx, dy)
        const arrowEnd = c.arrowEnd ? { x: c.arrowEnd.x + dx, y: c.arrowEnd.y + dy, fromX: c.arrowEnd.fromX + dx, fromY: c.arrowEnd.fromY + dy } : undefined
        return { ...c, d, arrowEnd }
      }
    }
  })
}

/** Translate an absolute SVG path (M, L, C, Q, S, T, A, H, V, Z) by (dx, dy). */
export function translatePathD(d: string, dx: number, dy: number): string {
  const tokens = d.match(/[MLCQSTAHVZmlcqstahvz]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? []
  const out: string[] = []
  let cmd = ''
  let nums: number[] = []
  const r = (n: number) => (Math.round(n * 100) / 100).toString()
  const flush = () => {
    if (!cmd) return
    const arity: Record<string, number> = { M: 2, L: 2, T: 2, C: 6, Q: 4, S: 4, A: 7, H: 1, V: 1, Z: 0 }
    const n = arity[cmd] ?? 2
    out.push(cmd)
    if (n === 0) return
    for (let i = 0; i + n <= nums.length; i += n) {
      const chunk = nums.slice(i, i + n)
      if (cmd === 'A') out.push(r(chunk[0]!), r(chunk[1]!), r(chunk[2]!), r(chunk[3]!), r(chunk[4]!), r(chunk[5]! + dx), r(chunk[6]! + dy))
      else if (cmd === 'H') out.push(r(chunk[0]! + dx))
      else if (cmd === 'V') out.push(r(chunk[0]! + dy))
      else for (let k = 0; k < n; k += 2) out.push(r(chunk[k]! + dx), r(chunk[k + 1]! + dy))
    }
  }
  for (const t of tokens) {
    if (/^[A-Za-z]$/.test(t)) {
      flush()
      cmd = t.toUpperCase()
      nums = []
    } else nums.push(Number(t))
  }
  flush()
  return out.join(' ')
}
