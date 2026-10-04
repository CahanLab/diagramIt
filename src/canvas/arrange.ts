/** Pure alignment / distribution math on bounding boxes. */
export interface Box { left: number; top: number; width: number; height: number }
export type AlignMode = 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom'
export type DistributeMode = 'horizontal' | 'vertical'

/** Returns the new (left, top) for each box so they align to the group's extent. */
export function alignBoxes(boxes: Box[], mode: AlignMode): { left: number; top: number }[] {
  if (boxes.length === 0) return []
  const minL = Math.min(...boxes.map((b) => b.left))
  const maxR = Math.max(...boxes.map((b) => b.left + b.width))
  const minT = Math.min(...boxes.map((b) => b.top))
  const maxB = Math.max(...boxes.map((b) => b.top + b.height))
  const cx = (minL + maxR) / 2
  const cy = (minT + maxB) / 2
  return boxes.map((b) => {
    switch (mode) {
      case 'left': return { left: minL, top: b.top }
      case 'right': return { left: maxR - b.width, top: b.top }
      case 'centerX': return { left: cx - b.width / 2, top: b.top }
      case 'top': return { left: b.left, top: minT }
      case 'bottom': return { left: b.left, top: maxB - b.height }
      case 'centerY': return { left: b.left, top: cy - b.height / 2 }
    }
  })
}

/** Even gaps between boxes along one axis; first and last stay put. Returns new positions in input order. */
export function distributeBoxes(boxes: Box[], mode: DistributeMode): { left: number; top: number }[] {
  if (boxes.length < 3) return boxes.map((b) => ({ left: b.left, top: b.top }))
  const key = mode === 'horizontal' ? 'left' : 'top'
  const size = mode === 'horizontal' ? 'width' : 'height'
  const order = boxes.map((b, i) => ({ b, i })).sort((a, c) => a.b[key] - c.b[key])
  const first = order[0]!.b
  const last = order[order.length - 1]!.b
  const totalSize = order.reduce((s, o) => s + o.b[size], 0)
  const span = last[key] + last[size] - first[key]
  const gap = (span - totalSize) / (order.length - 1)
  const out = boxes.map((b) => ({ left: b.left, top: b.top }))
  let cursor = first[key]
  for (const o of order) {
    out[o.i] = { left: mode === 'horizontal' ? cursor : o.b.left, top: mode === 'vertical' ? cursor : o.b.top }
    cursor += o.b[size] + gap
  }
  return out
}
