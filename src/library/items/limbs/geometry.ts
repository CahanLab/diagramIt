/**
 * Parametric limb silhouette used to author the stage data. Pure maths, no DOM.
 * Frame: proximal left, distal right, anterior (digit 1) up; angles in degrees,
 * 0 = right, positive = clockwise on screen (down).
 */
export type Pt = [number, number]

const rad = (deg: number): number => (deg * Math.PI) / 180
export const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]]
export const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k]
export const dir = (deg: number): Pt => [Math.cos(rad(deg)), Math.sin(rad(deg))]
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
export const smoothClosed = (pts: Pt[]): string => spline(pts, true, 0.8)
export const smoothOpen = (pts: Pt[]): string => spline(pts, false)
export const polyline = (pts: Pt[]): string => pts.map((p, i) => `${i ? 'L' : 'M'}${P(p)}`).join('')

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

export interface Segment {
  len: number
  angle: number
  width: number
}
export interface Digit {
  /** angle relative to the autopod axis */
  angle: number
  len: number
  width: number
}
export interface LimbParams {
  shoulder: Pt
  stylopod: Segment
  zeugopod: Segment
  /** palm: direction, distance from wrist to the digit bases, half-width at the wrist, spacing between digit bases, arc = proximal drop of the outer digits */
  autopod: { angle: number; palm: number; width: number; spacing: number; arc?: number }
  digits: Digit[]
  /** 0 = digits free to the base, 1 = solid plate */
  web: number
}
export interface Ray {
  base: Pt
  tip: Pt
  dir: Pt
  width: number
}
export interface LimbGeometry {
  outline: string
  /** open path along the distal margin (for the AER) */
  margin: string
  shoulder: Pt
  elbow: Pt
  wrist: Pt
  palm: Pt
  stylopodDir: Pt
  zeugopodDir: Pt
  autopodDir: Pt
  rays: Ray[]
  /** content bounds [minX, minY, maxX, maxY] of the silhouette points */
  bounds: [number, number, number, number]
}

export function buildLimb(p: LimbParams): LimbGeometry {
  const sd = dir(p.stylopod.angle)
  const zd = dir(p.zeugopod.angle)
  const ad = dir(p.autopod.angle)
  const shoulder = p.shoulder
  const elbow = add(shoulder, mul(sd, p.stylopod.len))
  const wrist = add(elbow, mul(zd, p.zeugopod.len))
  const palm = add(wrist, mul(ad, p.autopod.palm))
  const sn = normal(sd)
  const zn = normal(zd)
  const an = normal(ad)
  const jn = (a: Pt, b: Pt): Pt => {
    const m = add(a, b)
    const l = Math.hypot(m[0], m[1]) || 1
    return mul(m, 1 / l)
  }
  const en = jn(sn, zn)
  const wn = jn(zn, an)
  const upper: Pt[] = [
    add(shoulder, mul(sn, p.stylopod.width)),
    add(elbow, mul(en, (p.stylopod.width + p.zeugopod.width) / 2)),
    add(wrist, mul(wn, (p.zeugopod.width + p.autopod.width) / 2)),
  ]
  const lower: Pt[] = [
    add(wrist, mul(wn, -(p.zeugopod.width + p.autopod.width) / 2)),
    add(elbow, mul(en, -(p.stylopod.width + p.zeugopod.width) / 2)),
    add(shoulder, mul(sn, -p.stylopod.width)),
  ]
  const mid = (p.digits.length - 1) / 2
  const rays: Ray[] = p.digits.map((dg, i) => {
    const d = dir(p.autopod.angle + dg.angle)
    const k = mid - i
    const base = add(add(palm, mul(an, k * p.autopod.spacing)), mul(ad, -Math.abs(k) * (p.autopod.arc ?? 0)))
    return { base, tip: add(base, mul(d, dg.len)), dir: d, width: dg.width }
  })
  const distal: Pt[] = []
  const margin: Pt[] = []
  if (rays.length === 0) {
    // bud or paddle: rounded tip
    const r = p.autopod.width
    const tipC = add(wrist, mul(ad, p.autopod.palm))
    for (let i = 0; i <= 6; i++) {
      const a = -90 + (180 * i) / 6
      const d = dir(p.autopod.angle + a)
      const pt = add(tipC, [d[0] * r * 0.55, d[1] * r])
      distal.push(pt)
      if (i >= 1 && i <= 5) margin.push(pt)
    }
  } else {
    // palm corners: the plate flares from the wrist to the digit bases
    const first = rays[0]!
    const last = rays[rays.length - 1]!
    const cornerA = add(add(first.base, mul(normal(first.dir), first.width * 1.1)), mul(ad, -p.autopod.palm * 0.3))
    distal.push(lerp(upper[2]!, cornerA, 0.5), cornerA)
    rays.forEach((r, i) => {
      const n = normal(r.dir)
      const w = r.width
      const len = Math.hypot(r.tip[0] - r.base[0], r.tip[1] - r.base[1])
      const tipR = add(r.base, mul(r.dir, len - w))
      distal.push(add(tipR, mul(n, w)))
      const apex = add(r.tip, mul(r.dir, w * 0.1))
      distal.push(apex)
      margin.push(apex)
      distal.push(add(tipR, mul(n, -w)))
      const next = rays[i + 1]
      if (next) {
        const m = lerp(r.base, next.base, 0.5)
        const md = jn(r.dir, next.dir)
        const depth = Math.min(len, Math.hypot(next.tip[0] - next.base[0], next.tip[1] - next.base[1])) * p.web
        const webPt = add(m, mul(md, depth))
        distal.push(webPt)
        margin.push(webPt)
      }
    })
    const cornerP = add(add(last.base, mul(normal(last.dir), -last.width * 1.1)), mul(ad, -p.autopod.palm * 0.3))
    distal.push(cornerP, lerp(cornerP, lower[0]!, 0.5))
  }
  const pts = [...upper, ...distal, ...lower]
  const xs = pts.map((q) => q[0])
  const ys = pts.map((q) => q[1])
  return {
    bounds: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
    outline: smoothClosed(pts),
    margin: smoothOpen(margin),
    shoulder,
    elbow,
    wrist,
    palm,
    stylopodDir: sd,
    zeugopodDir: zd,
    autopodDir: ad,
    rays,
  }
}
