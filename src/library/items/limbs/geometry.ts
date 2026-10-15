/**
 * Geometry helpers for the mouse limb icons. Pure maths, no DOM.
 * Frame: proximal left, distal right, anterior (digit 1) up; angles in degrees,
 * 0 = right, positive = clockwise on screen (down).
 *
 * The silhouettes themselves are authored by scripts/limbs/author.py and live in
 * shapes.ts; this module turns those point lists into SVG path data and maps the
 * normalised bone outlines into each stage (spec: "Reference-built limbs").
 */
export type Pt = [number, number]

const rad = (deg: number): number => (deg * Math.PI) / 180
export const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]]
export const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]]
export const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k]
export const dir = (deg: number): Pt => [Math.cos(rad(deg)), Math.sin(rad(deg))]
export const len = (v: Pt): number => Math.hypot(v[0], v[1])
export const unit = (v: Pt): Pt => {
  const l = len(v) || 1
  return [v[0] / l, v[1] / l]
}
/** Unit normal on the anterior (upper) side of a direction. */
export const normal = (d: Pt): Pt => [d[1], -d[0]]
export const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

const f = (v: number): string => {
  const s = v.toFixed(1)
  return s.endsWith('.0') ? s.slice(0, -2) : s
}
export const P = (p: Pt): string => `${f(p[0])} ${f(p[1])}`

/** Catmull-Rom spline through the points as cubic beziers. */
function spline(pts: Pt[], closed: boolean, tension = 1): string {
  const n = pts.length
  if (n < 2) return ''
  const at = (i: number): Pt => (closed ? pts[((i % n) + n) % n]! : pts[Math.min(n - 1, Math.max(0, i))]!)
  const segs = closed ? n : n - 1
  let d = `M${P(pts[0]!)}`
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    const c1: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension]
    const c2: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension]
    d += `C${P(c1)} ${P(c2)} ${P(p2)}`
  }
  return closed ? d + 'z' : d
}
export const smoothClosed = (pts: Pt[], tension = 0.8): string => spline(pts, true, tension)
export const smoothOpen = (pts: Pt[], tension = 1): string => spline(pts, false, tension)
export const polyline = (pts: Pt[]): string => pts.map((p, i) => `${i ? 'L' : 'M'}${P(p)}`).join('')
export const polygon = (pts: Pt[]): string => polyline(pts) + 'z'

/** Closed elliptical blob (four beziers) centred on c, semi-axes rx along `angle`, ry across. */
export function blob(c: Pt, rx: number, ry: number, angle = 0): string {
  const u = dir(angle)
  const v = normal(u)
  const k = 0.5523
  const pt = (a: number, b: number): Pt => add(c, add(mul(u, a * rx), mul(v, b * ry)))
  return (
    `M${P(pt(1, 0))}` +
    `C${P(pt(1, k))} ${P(pt(k, 1))} ${P(pt(0, 1))}` +
    `C${P(pt(-k, 1))} ${P(pt(-1, k))} ${P(pt(-1, 0))}` +
    `C${P(pt(-1, -k))} ${P(pt(-k, -1))} ${P(pt(0, -1))}` +
    `C${P(pt(k, -1))} ${P(pt(1, -k))} ${P(pt(1, 0))}z`
  )
}

/**
 * Map a shape authored in the unit frame (proximal end at [0,0], distal end at [1,0],
 * anterior up) onto the segment p → d: scaled by the segment length along the axis and
 * by `across` times that across it.
 */
export function mapToSegment(points: Pt[], p: Pt, d: Pt, across = 1): Pt[] {
  const u = sub(d, p)
  const L = len(u) || 1
  const ux = u[0] / L
  const uy = u[1] / L
  // y in the unit frame is positive downwards (posterior); the normal points anterior
  return points.map(([x, y]) => [p[0] + ux * x * L - uy * y * L * across, p[1] + uy * x * L + ux * y * L * across])
}

/** Half-width profile of a phalanx: flared ends, waisted shaft (fraction of the end half-width). */
export function phalanxShape(p: Pt, d: Pt, r: number, waist = 0.72): Pt[] {
  const u = unit(sub(d, p))
  const n = normal(u)
  const L = len(sub(d, p))
  const stations: [number, number][] = [
    [0.04, 0.78],
    [0.12, 1],
    [0.3, waist + (1 - waist) * 0.35],
    [0.5, waist],
    [0.7, waist + (1 - waist) * 0.35],
    [0.88, 1],
    [0.96, 0.78],
  ]
  const side = (sign: number): Pt[] => stations.map(([t, w]) => add(add(p, mul(u, t * L)), mul(n, sign * w * r)))
  return [...side(1), ...side(-1).reverse()]
}

/** Points of a polygon inside the slab t0..t1 (fractions along the axis p → d), clipped by two half-planes. */
export function clipToSlab(points: Pt[], p: Pt, d: Pt, t0: number, t1: number): Pt[] {
  const u = unit(sub(d, p))
  const L = len(sub(d, p))
  const along = (q: Pt): number => ((q[0] - p[0]) * u[0] + (q[1] - p[1]) * u[1]) / L
  const clip = (poly: Pt[], inside: (t: number) => boolean, at: number): Pt[] => {
    const out: Pt[] = []
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i]!
      const b = poly[(i + 1) % poly.length]!
      const ta = along(a)
      const tb = along(b)
      const ia = inside(ta)
      const ib = inside(tb)
      if (ia) out.push(a)
      if (ia !== ib) {
        const s = (at - ta) / (tb - ta || 1e-9)
        out.push(lerp(a, b, s))
      }
    }
    return out
  }
  return clip(clip(points, (t) => t >= t0, t0), (t) => t <= t1, t1)
}

/** Bounds [minX, minY, maxX, maxY] of a point set. */
export function bounds(points: Pt[]): [number, number, number, number] {
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const [x, y] of points) {
    if (x < x0) x0 = x
    if (y < y0) y0 = y
    if (x > x1) x1 = x
    if (y > y1) y1 = y
  }
  return [x0, y0, x1, y1]
}

/**
 * Crescent along an open polyline: the line itself and a parallel edge offset outward
 * (to the left-hand normal side flipped by `side`) by `height · sin(π s / L)^0.6`, so the
 * band tapers to nothing at both ends. Returns a closed polygon.
 */
export function crescent(line: Pt[], height: number, side = 1): Pt[] {
  if (line.length < 2) return []
  const cum: number[] = [0]
  for (let i = 1; i < line.length; i++) cum.push(cum[i - 1]! + len(sub(line[i]!, line[i - 1]!)))
  const L = cum[cum.length - 1]! || 1
  const outer: Pt[] = line.map((q, i) => {
    const prev = line[Math.max(0, i - 1)]!
    const next = line[Math.min(line.length - 1, i + 1)]!
    const n = normal(unit(sub(next, prev)))
    const h = height * Math.pow(Math.sin((Math.PI * cum[i]!) / L), 0.6)
    return add(q, mul(n, -side * h))
  })
  return [...line, ...outer.reverse()]
}
