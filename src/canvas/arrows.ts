/** Geometry helpers for connectors (pure). */

export interface Pt { x: number; y: number }

/** Points of a triangular arrowhead whose tip is at (x2,y2), pointing from (x1,y1). */
export function arrowHead(x1: number, y1: number, x2: number, y2: number, size = 12): [Pt, Pt, Pt] {
  const ang = Math.atan2(y2 - y1, x2 - x1)
  const half = 0.45 // half-angle in radians-ish via ratio
  const bx = x2 - size * Math.cos(ang)
  const by = y2 - size * Math.sin(ang)
  const wx = -Math.sin(ang) * size * half
  const wy = Math.cos(ang) * size * half
  return [
    { x: x2, y: y2 },
    { x: bx + wx, y: by + wy },
    { x: bx - wx, y: by - wy },
  ]
}

/** Shorten a segment at the end so the line does not poke through the arrowhead. */
export function shortenEnd(x1: number, y1: number, x2: number, y2: number, by: number): Pt {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  return { x: x2 - (dx / len) * by, y: y2 - (dy / len) * by }
}

/** Orthogonal (elbow) route: horizontal first then vertical, bending at the midpoint x. */
export function elbowPoints(x1: number, y1: number, x2: number, y2: number): Pt[] {
  if (Math.abs(x2 - x1) < 1e-6 || Math.abs(y2 - y1) < 1e-6) return [{ x: x1, y: y1 }, { x: x2, y: y2 }]
  const mx = (x1 + x2) / 2
  return [
    { x: x1, y: y1 },
    { x: mx, y: y1 },
    { x: mx, y: y2 },
    { x: x2, y: y2 },
  ]
}

/** SVG path "d" for a polyline through points. */
export function pathD(points: Pt[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${round(p.x)} ${round(p.y)}`).join(' ')
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}
