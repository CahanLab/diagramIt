/**
 * Parametric limb silhouette used to author the stage data. Pure maths, no DOM.
 * Frame: proximal left, distal right, anterior (digit 1) up; angles in degrees,
 * 0 = right, positive = clockwise on screen (down).
 *
 * Shapes follow the eMouseAtlas 3D models and Theiler plates (TS17 to TS26):
 * buds are domes, the stylopod is a convex drumstick that tapers into the
 * zeugopod, the plate flares from a narrow wrist/ankle to the digit bases,
 * digits taper to the tip. Spec: docs/superpowers/specs/2026-10-14-drawing-styles-design.md
 * ("Silhouette fidelity").
 */
export type Pt = [number, number]

const rad = (deg: number): number => (deg * Math.PI) / 180
export const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]]
export const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k]
export const dir = (deg: number): Pt => [Math.cos(rad(deg)), Math.sin(rad(deg))]
/** Unit normal on the anterior (upper) side of a direction. */
export const normal = (d: Pt): Pt => [d[1], -d[0]]
export const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const unit = (v: Pt): Pt => {
  const l = Math.hypot(v[0], v[1]) || 1
  return [v[0] / l, v[1] / l]
}

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
  /** half-width at the segment's proximal end (the joints take the mean of the adjoining segments) */
  width: number
  /** convexity: extra half-width at 45 % of the segment as a fraction of `width` (a drumstick thigh); 0 = straight sides */
  bulge?: number
}
export interface Digit {
  /** angle relative to the autopod axis */
  angle: number
  len: number
  /** half-width at the base */
  width: number
  /** half-width at the tip as a fraction of `width` (default 1 = blunt, 0.55 = tapered) */
  tip?: number
}
export interface LimbParams {
  shoulder: Pt
  stylopod: Segment
  zeugopod: Segment
  /**
   * palm: direction, distance from wrist to the digit bases, half-width at the wrist, spacing between digit bases,
   * arc = proximal drop of the digit bases, quadratic in the distance from the middle ray (k² · arc), so the bases lie on a round plate
   */
  autopod: { angle: number; palm: number; width: number; spacing: number; arc?: number }
  digits: Digit[]
  /** fraction of the digit length that is webbed: 1 = solid plate, >= PLATE_WEB draws a scalloped plate, below it separate digits with clefts */
  web: number
  /** half-width at the flank attachment (default: stylopod width) */
  base?: number
  /**
   * profile of a bud (no digits): half-width at the base, maximum half-width and
   * where along the bud (0 base, 1 apex) the maximum occurs; the tip is a quarter ellipse
   */
  bud?: { base: number; width: number; at: number }
}
/** From this webbing fraction the autopod is drawn as a plate with a scalloped margin rather than separate digits. */
export const PLATE_WEB = 0.75

export interface Ray {
  base: Pt
  tip: Pt
  dir: Pt
  /** half-width at the base */
  width: number
  /** half-width at the tip */
  tipWidth: number
}
export interface LimbGeometry {
  outline: string
  /** same silhouette as an open path from the anterior flank point round the autopod to the posterior flank point */
  outlineOpen: string
  /** flank attachment points (anterior, posterior) and the proximal direction into the body */
  flank: { anterior: Pt; posterior: Pt; inward: Pt }
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

/** Bud outline: a dome from the anterior flank point to the posterior one, widest at `bud.at`. */
function budPoints(shoulder: Pt, apex: Pt, bud: { base: number; width: number; at: number }): { pts: Pt[]; margin: Pt[] } {
  const u = unit([apex[0] - shoulder[0], apex[1] - shoulder[1]])
  const n = normal(u)
  const L = Math.hypot(apex[0] - shoulder[0], apex[1] - shoulder[1])
  const at = Math.min(0.95, Math.max(0, bud.at))
  const side = (sign: number): { p: Pt; s: number }[] => {
    const out: { p: Pt; s: number }[] = []
    const put = (s: number, w: number) => out.push({ p: add(add(shoulder, mul(u, s * L)), mul(n, sign * w)), s })
    const baseSteps = at > 0 ? 3 : 0
    for (let i = 0; i < baseSteps; i++) {
      const s = (at * i) / baseSteps
      put(s, bud.base + (bud.width - bud.base) * Math.sin((Math.PI / 2) * (s / at)))
    }
    // quarter ellipse from the widest point to the apex, sampled uniformly in angle
    for (let i = 0; i < 6; i++) {
      const th = ((Math.PI / 2) * i) / 6
      put(at + (1 - at) * Math.sin(th), bud.width * Math.cos(th))
    }
    return out
  }
  const ant = side(1)
  const post = side(-1).reverse()
  const pts = [...ant.map((q) => q.p), apex, ...post.map((q) => q.p)]
  const margin = [...ant.filter((q) => q.s >= 0.5).map((q) => q.p), apex, ...post.filter((q) => q.s >= 0.5).map((q) => q.p)]
  return { pts, margin }
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
  const jn = (a: Pt, b: Pt): Pt => unit(add(a, b))
  const en = jn(sn, zn)
  const wn = jn(zn, an)
  const base = p.base ?? p.stylopod.width
  const flank = { anterior: add(shoulder, mul(sn, base)), posterior: add(shoulder, mul(sn, -base)), inward: mul(sd, -1) }
  const mid = (p.digits.length - 1) / 2
  const rays: Ray[] = p.digits.map((dg, i) => {
    const d = dir(p.autopod.angle + dg.angle)
    const k = mid - i
    const rayBase = add(add(palm, mul(an, k * p.autopod.spacing)), mul(ad, -k * k * (p.autopod.arc ?? 0)))
    return { base: rayBase, tip: add(rayBase, mul(d, dg.len)), dir: d, width: dg.width, tipWidth: dg.width * (dg.tip ?? 1) }
  })
  const finish = (pts: Pt[], margin: Pt[]): LimbGeometry => {
    const xs = pts.map((q) => q[0])
    const ys = pts.map((q) => q[1])
    // the silhouette is the open spline round the limb closed by a straight cut along the flank
    const open = smoothOpen(pts)
    return {
      bounds: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
      outline: open + 'z',
      outlineOpen: open,
      flank,
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

  if (rays.length === 0) {
    const bud = p.bud ?? { base, width: p.autopod.width, at: 0.4 }
    const { pts, margin } = budPoints(shoulder, palm, bud)
    return finish(pts, margin)
  }

  const sideOf = (sign: number, seg: Segment, from: Pt, to: Pt, nrm: Pt): Pt[] =>
    seg.bulge ? [add(lerp(from, to, 0.45), mul(nrm, sign * seg.width * (1 + seg.bulge)))] : []
  const upper: Pt[] = [
    flank.anterior,
    ...sideOf(1, p.stylopod, shoulder, elbow, sn),
    add(elbow, mul(en, (p.stylopod.width + p.zeugopod.width) / 2)),
    ...sideOf(1, p.zeugopod, elbow, wrist, zn),
    add(wrist, mul(wn, (p.zeugopod.width + p.autopod.width) / 2)),
  ]
  const lower: Pt[] = [
    add(wrist, mul(wn, -(p.zeugopod.width + p.autopod.width) / 2)),
    ...sideOf(-1, p.zeugopod, elbow, wrist, zn),
    add(elbow, mul(en, -(p.stylopod.width + p.zeugopod.width) / 2)),
    ...sideOf(-1, p.stylopod, shoulder, elbow, sn),
    flank.posterior,
  ]
  const distal: Pt[] = []
  const margin: Pt[] = []
  // the plate fans out in a straight line from the wrist edge to the outer side of the outer digit's base,
  // which continues into that digit's outer edge (the outer digits point outward at about the fan angle)
  const first = rays[0]!
  const last = rays[rays.length - 1]!
  // (a scalloped plate is a disc: its flare bows outward instead)
  const plate = p.web >= PLATE_WEB
  const flare = (edge: Pt, ray: Ray, sign: number): Pt[] => {
    const corner = add(add(ray.base, mul(normal(ray.dir), sign * ray.width * 0.9)), mul(ad, -p.autopod.palm * 0.08))
    const mid = lerp(edge, corner, 0.5)
    const chord = Math.hypot(corner[0] - edge[0], corner[1] - edge[1])
    return [plate ? add(mid, mul(an, sign * chord * 0.12)) : mid, corner]
  }
  distal.push(...flare(upper[upper.length - 1]!, first, 1))
  rays.forEach((r, i) => {
    const n = normal(r.dir)
    const len = Math.hypot(r.tip[0] - r.base[0], r.tip[1] - r.base[1])
    const next = rays[i + 1]
    const nextLen = next ? Math.hypot(next.tip[0] - next.base[0], next.tip[1] - next.base[1]) : len
    if (plate) {
      // scalloped plate: apexes and the clefts between them, no rounded tips
      const apex = add(r.tip, mul(r.dir, r.tipWidth * 0.1))
      distal.push(apex)
      margin.push(apex)
      if (next) {
        const m = lerp(r.base, next.base, 0.5)
        const webPt = add(m, mul(jn(r.dir, next.dir), Math.min(len, nextLen) * p.web))
        distal.push(webPt)
        margin.push(webPt)
      }
      return
    }
    // separate digit: a rounded tip (never wider than the gap to the neighbour), then the cleft
    const ws = Math.min(r.tipWidth, p.autopod.spacing * 0.42)
    const tipR = add(r.base, mul(r.dir, len - ws))
    const k = 0.71
    const apex = add(tipR, mul(r.dir, ws * 1.05))
    distal.push(add(tipR, mul(n, ws)), add(add(tipR, mul(r.dir, ws * k)), mul(n, ws * k)), apex, add(add(tipR, mul(r.dir, ws * k)), mul(n, -ws * k)), add(tipR, mul(n, -ws)))
    margin.push(apex)
    if (next) {
      const m = lerp(r.base, next.base, 0.5)
      const depth = Math.min(Math.min(len, nextLen) * p.web, Math.min(len, nextLen) - ws - 1)
      const webPt = add(m, mul(jn(r.dir, next.dir), depth))
      distal.push(webPt)
      margin.push(webPt)
    }
  })
  distal.push(...flare(lower[0]!, last, -1).reverse())
  return finish([...upper, ...distal, ...lower], margin)
}
