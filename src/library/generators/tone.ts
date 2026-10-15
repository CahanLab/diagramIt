/**
 * Tone engine for stippled drawings: SVG path flattening, polygon geometry
 * and a tonal stipple sampler (after Carter 1954 as reproduced in Grüneberg
 * 1963). Pure maths, no DOM.
 * Spec: docs/superpowers/specs/2026-10-14-drawing-styles-design.md (phase 3)
 */
export type Pt = [number, number]
export type Polygon = Pt[]

/** Deterministic PRNG (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

// ---------------------------------------------------------------- transforms

export type Matrix = [number, number, number, number, number, number]
const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0]
const mulM = (a: Matrix, b: Matrix): Matrix => [
  a[0] * b[0] + a[2] * b[1],
  a[1] * b[0] + a[3] * b[1],
  a[0] * b[2] + a[2] * b[3],
  a[1] * b[2] + a[3] * b[3],
  a[0] * b[4] + a[2] * b[5] + a[4],
  a[1] * b[4] + a[3] * b[5] + a[5],
]
export const applyM = (m: Matrix, p: Pt): Pt => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]]

/** Parse `translate(x y) rotate(a [cx cy]) scale(s [sy]) matrix(...)` into one matrix. */
export function parseTransform(t: string | undefined): Matrix {
  if (!t) return IDENTITY
  let m: Matrix = IDENTITY
  for (const [, name, args] of t.matchAll(/(\w+)\s*\(([^)]*)\)/g)) {
    const a = args!.trim().split(/[\s,]+/).filter(Boolean).map(Number)
    let n: Matrix = IDENTITY
    switch (name) {
      case 'translate':
        n = [1, 0, 0, 1, a[0] ?? 0, a[1] ?? 0]
        break
      case 'scale':
        n = [a[0] ?? 1, 0, 0, a[1] ?? a[0] ?? 1, 0, 0]
        break
      case 'rotate': {
        const r = ((a[0] ?? 0) * Math.PI) / 180
        const c = Math.cos(r)
        const s = Math.sin(r)
        const cx = a[1] ?? 0
        const cy = a[2] ?? 0
        n = mulM(mulM([1, 0, 0, 1, cx, cy], [c, s, -s, c, 0, 0]), [1, 0, 0, 1, -cx, -cy])
        break
      }
      case 'matrix':
        n = [a[0] ?? 1, a[1] ?? 0, a[2] ?? 0, a[3] ?? 1, a[4] ?? 0, a[5] ?? 0]
        break
    }
    m = mulM(m, n)
  }
  return m
}

// ------------------------------------------------------------ path flattening

function tokens(d: string): (string | number)[] {
  const out: (string | number)[] = []
  const re = /([MmLlHhVvCcSsQqTtAaZz])|(-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)/g
  for (const m of d.matchAll(re)) out.push(m[1] ? m[1] : Number(m[2]))
  return out
}

function arcPoints(p0: Pt, rx: number, ry: number, phi: number, large: number, sweep: number, p1: Pt, n: number): Pt[] {
  // SVG arc endpoint to centre parameterisation (W3C implementation notes F.6.5)
  if (rx === 0 || ry === 0) return [p1]
  const rad = (phi * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dx = (p0[0] - p1[0]) / 2
  const dy = (p0[1] - p1[1]) / 2
  const x1 = cos * dx + sin * dy
  const y1 = -sin * dx + cos * dy
  let Rx = Math.abs(rx)
  let Ry = Math.abs(ry)
  const lambda = (x1 * x1) / (Rx * Rx) + (y1 * y1) / (Ry * Ry)
  if (lambda > 1) {
    Rx *= Math.sqrt(lambda)
    Ry *= Math.sqrt(lambda)
  }
  const num = Rx * Rx * Ry * Ry - Rx * Rx * y1 * y1 - Ry * Ry * x1 * x1
  const den = Rx * Rx * y1 * y1 + Ry * Ry * x1 * x1
  let coef = Math.sqrt(Math.max(0, num / (den || 1)))
  if (large === sweep) coef = -coef
  const cx1 = (coef * (Rx * y1)) / Ry
  const cy1 = (coef * -(Ry * x1)) / Rx
  const cx = cos * cx1 - sin * cy1 + (p0[0] + p1[0]) / 2
  const cy = sin * cx1 + cos * cy1 + (p0[1] + p1[1]) / 2
  const ang = (ux: number, uy: number, vx: number, vy: number): number => {
    const dot = ux * vx + uy * vy
    const len = Math.hypot(ux, uy) * Math.hypot(vx, vy) || 1
    let a = Math.acos(Math.max(-1, Math.min(1, dot / len)))
    if (ux * vy - uy * vx < 0) a = -a
    return a
  }
  const t1 = ang(1, 0, (x1 - cx1) / Rx, (y1 - cy1) / Ry)
  let dt = ang((x1 - cx1) / Rx, (y1 - cy1) / Ry, (-x1 - cx1) / Rx, (-y1 - cy1) / Ry)
  if (!sweep && dt > 0) dt -= 2 * Math.PI
  if (sweep && dt < 0) dt += 2 * Math.PI
  const pts: Pt[] = []
  for (let i = 1; i <= n; i++) {
    const t = t1 + (dt * i) / n
    const ex = Rx * Math.cos(t)
    const ey = Ry * Math.sin(t)
    pts.push([cos * ex - sin * ey + cx, sin * ex + cos * ey + cy])
  }
  return pts
}

/** Flatten path data into polylines (one per subpath). `closed` tells whether each ended with Z. */
export function flattenPath(d: string, transform?: string, segmentsPerCurve = 10): { points: Polygon; closed: boolean }[] {
  const m = parseTransform(transform)
  const tk = tokens(d)
  const out: { points: Polygon; closed: boolean }[] = []
  let cur: Pt = [0, 0]
  let start: Pt = [0, 0]
  let lastC: Pt | null = null
  let lastQ: Pt | null = null
  let poly: Polygon = []
  let cmd = ''
  let i = 0
  const push = (p: Pt) => {
    poly.push(applyM(m, p))
    cur = p
  }
  const finish = (closed: boolean) => {
    if (poly.length) out.push({ points: poly, closed })
    poly = []
  }
  const num = (): number => {
    const v = tk[i++]
    return typeof v === 'number' ? v : 0
  }
  const cubic = (c1: Pt, c2: Pt, p: Pt) => {
    const p0 = cur
    for (let k = 1; k <= segmentsPerCurve; k++) {
      const t = k / segmentsPerCurve
      const u = 1 - t
      push([
        u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p[0],
        u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p[1],
      ])
    }
    lastC = c2
    lastQ = null
  }
  const quad = (c: Pt, p: Pt) => {
    const p0 = cur
    for (let k = 1; k <= segmentsPerCurve; k++) {
      const t = k / segmentsPerCurve
      const u = 1 - t
      push([u * u * p0[0] + 2 * u * t * c[0] + t * t * p[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p[1]])
    }
    lastQ = c
    lastC = null
  }
  while (i < tk.length) {
    const t = tk[i]
    if (typeof t === 'string') {
      cmd = t
      i++
      if (cmd === 'Z' || cmd === 'z') {
        finish(true)
        cur = start
        lastC = lastQ = null
        continue
      }
    }
    const rel = cmd === cmd.toLowerCase()
    const o: Pt = rel ? cur : [0, 0]
    switch (cmd.toUpperCase()) {
      case 'M': {
        finish(false)
        const p: Pt = [o[0] + num(), o[1] + num()]
        start = p
        poly.push(applyM(m, p))
        cur = p
        cmd = rel ? 'l' : 'L'
        lastC = lastQ = null
        break
      }
      case 'L':
        push([o[0] + num(), o[1] + num()])
        lastC = lastQ = null
        break
      case 'H':
        push([o[0] + num(), cur[1]])
        lastC = lastQ = null
        break
      case 'V':
        push([cur[0], o[1] + num()])
        lastC = lastQ = null
        break
      case 'C': {
        const c1: Pt = [o[0] + num(), o[1] + num()]
        const c2: Pt = [o[0] + num(), o[1] + num()]
        cubic(c1, c2, [o[0] + num(), o[1] + num()])
        break
      }
      case 'S': {
        const c1: Pt = lastC ? [2 * cur[0] - lastC[0], 2 * cur[1] - lastC[1]] : cur
        const c2: Pt = [o[0] + num(), o[1] + num()]
        cubic(c1, c2, [o[0] + num(), o[1] + num()])
        break
      }
      case 'Q':
        quad([o[0] + num(), o[1] + num()], [o[0] + num(), o[1] + num()])
        break
      case 'T': {
        const c: Pt = lastQ ? [2 * cur[0] - lastQ[0], 2 * cur[1] - lastQ[1]] : cur
        quad(c, [o[0] + num(), o[1] + num()])
        break
      }
      case 'A': {
        const rx = num()
        const ry = num()
        const phi = num()
        const large = num()
        const sweep = num()
        const p: Pt = [o[0] + num(), o[1] + num()]
        for (const q of arcPoints(cur, rx, ry, phi, large, sweep, p, segmentsPerCurve)) push(q)
        lastC = lastQ = null
        break
      }
      default:
        i++
    }
  }
  finish(false)
  return out
}

// --------------------------------------------------------------- geometry

export function pointInPolygon(p: Pt, poly: Polygon): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!
    const b = poly[j]!
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside
  }
  return inside
}

export function distToSegment(p: Pt, a: Pt, b: Pt): number {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const l2 = dx * dx + dy * dy
  const t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)) : 0
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))
}

/** Distance from a point to the nearest edge of a polygon (closed). */
export function distToPolygon(p: Pt, poly: Polygon): number {
  let best = Infinity
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const d = distToSegment(p, poly[j]!, poly[i]!)
    if (d < best) best = d
  }
  return best
}

/** Distance from a point to a polyline (open). */
export function distToPolyline(p: Pt, line: Polygon): number {
  let best = Infinity
  for (let i = 1; i < line.length; i++) {
    const d = distToSegment(p, line[i - 1]!, line[i]!)
    if (d < best) best = d
  }
  return best
}

export function bbox(polys: Polygon[]): [number, number, number, number] {
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const poly of polys) for (const [x, y] of poly) {
    if (x < x0) x0 = x
    if (y < y0) y0 = y
    if (x > x1) x1 = x
    if (y > y1) y1 = y
  }
  return [x0, y0, x1, y1]
}

// ----------------------------------------------------------------- stipple

export interface StippleOptions {
  spacing: number
  seed: number
  /** dot diameters for the small / medium / large buckets */
  sizes?: [number, number, number]
}
export interface StippleLayer {
  d: string
  width: number
}

const f1 = (v: number): string => {
  const s = v.toFixed(1)
  return s.endsWith('.0') ? s.slice(0, -2) : s
}

/**
 * Sample dots inside `polys` (even-odd over all polygons) with keep probability
 * `tone(x, y)` in [0, 1]; dot size grows with tone. Returns up to three layers
 * (one per size bucket) as path data of zero-length round-capped segments.
 */
export function stippleField(polys: Polygon[], tone: (x: number, y: number) => number, opts: StippleOptions): StippleLayer[] {
  const random = rng(opts.seed)
  const sizes = opts.sizes ?? [0.6, 0.9, 1.3]
  const [x0, y0, x1, y1] = bbox(polys)
  const buckets: string[][] = [[], [], []]
  const s = opts.spacing
  for (let y = y0; y <= y1; y += s) {
    for (let x = x0; x <= x1; x += s) {
      const px = x + (random() - 0.5) * s * 0.9
      const py = y + (random() - 0.5) * s * 0.9
      let inside = false
      for (const poly of polys) if (pointInPolygon([px, py], poly)) inside = !inside
      if (!inside) continue
      const t = Math.max(0, Math.min(1, tone(px, py)))
      if (random() > t) continue
      const b = t < 0.35 ? 0 : t < 0.7 ? 1 : 2
      buckets[b]!.push(`M${f1(px)} ${f1(py)}h0.01`)
    }
  }
  return buckets.map((b, i) => ({ d: b.join(''), width: sizes[i]! })).filter((l) => l.d)
}

/** Resample a polyline at roughly even arc-length steps, returning points and unit normals (left-hand). */
export function resample(line: Polygon, step: number): { p: Pt; n: Pt }[] {
  const out: { p: Pt; n: Pt }[] = []
  if (line.length < 2) return out
  let carry = 0
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1]!
    const b = line[i]!
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy)
    if (!len) continue
    const n: Pt = [dy / len, -dx / len]
    let t = carry
    while (t <= len) {
      out.push({ p: [a[0] + (dx * t) / len, a[1] + (dy * t) / len], n })
      t += step
    }
    carry = t - len
  }
  return out
}

// ----------------------------------------------------------------- hatching

/**
 * Parallel hatch lines across a polygon (even-odd), at `angle` degrees, `spacing` apart.
 * Returns path data of the clipped segments.
 */
export function hatchPolygon(poly: Polygon, angle: number, spacing: number, inset = 0.4): string {
  if (poly.length < 3) return ''
  const a = (angle * Math.PI) / 180
  const u: Pt = [Math.cos(a), Math.sin(a)]
  const v: Pt = [-Math.sin(a), Math.cos(a)]
  // rotate the polygon into the hatch frame: s along u, t along v
  const rot = poly.map(([x, y]): Pt => [x * u[0] + y * u[1], x * v[0] + y * v[1]])
  const [, t0, , t1] = bbox([rot])
  const out: string[] = []
  for (let t = t0 + spacing / 2; t < t1; t += spacing) {
    const xs: number[] = []
    for (let i = 0; i < rot.length; i++) {
      const p = rot[i]!
      const q = rot[(i + 1) % rot.length]!
      if ((p[1] <= t && q[1] > t) || (q[1] <= t && p[1] > t)) xs.push(p[0] + ((t - p[1]) * (q[0] - p[0])) / (q[1] - p[1]))
    }
    xs.sort((m, n) => m - n)
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const s0 = xs[k]! + inset
      const s1 = xs[k + 1]! - inset
      if (s1 - s0 < 0.6) continue
      const p0: Pt = [s0 * u[0] + t * v[0], s0 * u[1] + t * v[1]]
      const p1: Pt = [s1 * u[0] + t * v[0], s1 * u[1] + t * v[1]]
      out.push(`M${f1(p0[0])} ${f1(p0[1])}L${f1(p1[0])} ${f1(p1[1])}`)
    }
  }
  return out.join('')
}
