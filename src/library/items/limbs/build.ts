/**
 * Shared assembly of a LimbStage from parametric geometry plus a per-stage
 * tissue recipe. Used by forelimb.ts and hindlimb.ts. Pure.
 */
import { add, blob, buildLimb, lerp, mul, normal, polyline, smoothOpen, type LimbGeometry, type LimbParams, type Pt, type Ray } from './geometry'
import { flattenPath, resample } from '../../generators/tone'
import type { Element, ElementName, ElementState, Limb, LimbStage, Muscle, Nerve, Stage, Tendon, Vessel } from './types'

export interface Recipe {
  limb: Limb
  stage: Stage
  theiler: number
  lengthMm: number
  params: LimbParams
  /** state per skeletal element; absent = element not yet present */
  state: (name: ElementName, digit?: 1 | 2 | 3 | 4 | 5) => ElementState | undefined
  /** which digits have which phalanges: e.g. digit 1 has no middle phalanx */
  phalanges: (digit: 1 | 2 | 3 | 4 | 5) => ('proximal-phalanx' | 'middle-phalanx' | 'distal-phalanx')[]
  aer: boolean
  /** hair placode positions, derived from the geometry (see `placodes`) */
  hairPlacodes?: (g: LimbGeometry, p: LimbParams) => [number, number][]
  decor?: (g: LimbGeometry, style: 'basic' | 'lucida') => string
  muscles: (g: LimbGeometry, p: LimbParams) => Muscle[]
  tendons: (g: LimbGeometry, p: LimbParams) => Tendon[]
  nerves: (g: LimbGeometry, p: LimbParams) => Nerve[]
}

const DIGITS: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5]

function capsule(name: ElementName, state: ElementState, p: Pt, d: Pt, r: number, digit?: 1 | 2 | 3 | 4 | 5): Element {
  const e: Element = { name, state, p: [+p[0].toFixed(1), +p[1].toFixed(1)], d: [+d[0].toFixed(1), +d[1].toFixed(1)], r }
  if (digit) e.digit = digit
  return e
}

/** Capsule along a segment between parametric positions t0..t1, shifted across by `offset` (positive = anterior). */
export function longBone(name: ElementName, state: ElementState, from: Pt, to: Pt, t0: number, t1: number, offset: number, r: number): Element {
  const n = normal([to[0] - from[0], to[1] - from[1]])
  const l = Math.hypot(n[0], n[1]) || 1
  const o = mul(n, offset / l)
  return capsule(name, state, add(lerp(from, to, t0), o), add(lerp(from, to, t1), o), r)
}

export function digitElements(rec: Recipe, g: LimbGeometry, p: LimbParams): Element[] {
  const out: Element[] = []
  const metaName: ElementName = rec.limb === 'forelimb' ? 'metacarpal' : 'metatarsal'
  const mid = (g.rays.length - 1) / 2
  const an = normal(g.autopodDir)
  g.rays.forEach((ray: Ray, i) => {
    const digit = DIGITS[i]!
    const k = mid - i
    const len = Math.hypot(ray.tip[0] - ray.base[0], ray.tip[1] - ray.base[1])
    const r = ray.width * 0.55
    const gap = 1.3
    const ms = rec.state(metaName, digit)
    if (ms) {
      const mStart = add(add(g.wrist, mul(g.autopodDir, p.autopod.palm * 0.32)), mul(an, k * p.autopod.spacing * 0.5))
      out.push(capsule(metaName, ms, mStart, add(ray.base, mul(ray.dir, -gap)), r, digit))
    }
    const names = rec.phalanges(digit)
    const fractions = names.length === 3 ? [0.42, 0.3, 0.24] : names.length === 2 ? [0.55, 0.4] : [0.9]
    let t = 0
    names.forEach((nm, k) => {
      const st = rec.state(nm, digit)
      const f = fractions[k]!
      const a = add(ray.base, mul(ray.dir, t * len + (k ? gap / 2 : 0)))
      const b = add(ray.base, mul(ray.dir, (t + f) * len - gap / 2))
      if (st) out.push(capsule(nm, st, a, b, r * (k === 2 ? 0.8 : 1), digit))
      t += f
    })
  })
  return out
}

/** Four blocks along a segment: proximal/distal × dorsal/ventral. */
export function blocks(from: Pt, to: Pt, width: number, names: [string, string, string, string], spread = 0.45): Muscle[] {
  const n = normal([to[0] - from[0], to[1] - from[1]])
  const l = Math.hypot(n[0], n[1]) || 1
  const len = Math.hypot(to[0] - from[0], to[1] - from[1])
  const angle = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI
  const o = (k: number): Pt => mul(n, (k * width * spread) / l)
  const mk = (name: string, c: Pt, rx: number, ry: number): Muscle => ({ name, path: blob(c, rx, ry, angle), ellipse: { c, rx, ry, angle } })
  return [
    mk(names[0], add(lerp(from, to, 0.3), o(1)), len * 0.22, width * 0.3),
    mk(names[1], add(lerp(from, to, 0.72), o(1)), len * 0.2, width * 0.28),
    mk(names[2], add(lerp(from, to, 0.3), o(-1)), len * 0.22, width * 0.3),
    mk(names[3], add(lerp(from, to, 0.72), o(-1)), len * 0.2, width * 0.28),
  ]
}

/** Two masses (dorsal, ventral) along a segment. */
export function masses(from: Pt, to: Pt, width: number, names: [string, string]): Muscle[] {
  const n = normal([to[0] - from[0], to[1] - from[1]])
  const l = Math.hypot(n[0], n[1]) || 1
  const len = Math.hypot(to[0] - from[0], to[1] - from[1])
  const angle = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI
  const c = lerp(from, to, 0.5)
  const mk = (name: string, cc: Pt): Muscle => ({ name, path: blob(cc, len * 0.36, width * 0.3, angle), ellipse: { c: cc, rx: len * 0.36, ry: width * 0.3, angle } })
  return [mk(names[0], add(c, mul(n, (width * 0.42) / l))), mk(names[1], add(c, mul(n, (-width * 0.42) / l)))]
}

/** Tendon band from the distal zeugopod along each digit ray to a fraction of the digit length. */
export function digitTendons(g: LimbGeometry, toFraction: number, prefix: string): Tendon[] {
  const origin = lerp(g.elbow, g.wrist, 0.55)
  return g.rays.map((r, i) => {
    const len = Math.hypot(r.tip[0] - r.base[0], r.tip[1] - r.base[1])
    const end = add(r.base, mul(r.dir, len * toFraction))
    const mid = add(r.base, mul(r.dir, -8))
    return { name: `${prefix} ${i + 1}`, path: smoothOpen([origin, lerp(origin, g.wrist, 0.6), mid, end]) }
  })
}

/** Three mixed trunks (anterior, central, posterior) from shoulder to wrist. */
export function trunks(g: LimbGeometry, p: LimbParams, names: [string, string, string], toWrist = 1): Nerve[] {
  const sn = normal(g.stylopodDir)
  const zn = normal(g.zeugopodDir)
  const w1 = p.stylopod.width
  const w2 = p.zeugopod.width
  const route = (k: number): Pt[] => {
    const pts: Pt[] = [add(g.shoulder, mul(sn, k * w1 * 0.3)), add(lerp(g.shoulder, g.elbow, 0.55), mul(sn, k * w1 * 0.42)), add(g.elbow, mul(zn, k * w2 * 0.45))]
    if (toWrist > 0) pts.push(add(lerp(g.elbow, g.wrist, toWrist), mul(zn, k * w2 * 0.35)))
    return pts
  }
  return [
    { name: names[0], path: smoothOpen(route(1)), width: 3 },
    { name: names[1], path: smoothOpen(route(0)), width: 3 },
    { name: names[2], path: smoothOpen(route(-1)), width: 3 },
  ]
}

/** Digital nerves from the wrist along each ray to a fraction of the digit length. */
export function digitalNerves(g: LimbGeometry, toFraction: number, width: 1 | 2): Nerve[] {
  return g.rays.map((r, i) => {
    const len = Math.hypot(r.tip[0] - r.base[0], r.tip[1] - r.base[1])
    const end = add(r.base, mul(r.dir, len * toFraction))
    return { name: `digital ${i + 1}`, path: smoothOpen([g.wrist, lerp(g.wrist, r.base, 0.5), add(r.base, mul(r.dir, -3)), end]), width }
  })
}

/** Short side twigs off a segment, alternating sides. */
export function twigs(from: Pt, to: Pt, width: number, count: number, len: number, w: 1 | 2): Nerve[] {
  const n = normal([to[0] - from[0], to[1] - from[1]])
  const l = Math.hypot(n[0], n[1]) || 1
  const d = mul([to[0] - from[0], to[1] - from[1]], 1 / (Math.hypot(to[0] - from[0], to[1] - from[1]) || 1))
  const out: Nerve[] = []
  for (let i = 0; i < count; i++) {
    const side = i % 2 ? -1 : 1
    const t = 0.25 + (0.55 * i) / Math.max(1, count - 1)
    const a = add(lerp(from, to, t), mul(n, (side * width * 0.1) / l))
    const b = add(add(a, mul(n, (side * width * 0.75) / l)), mul(d, len))
    out.push({ name: `twig ${i + 1}`, path: polyline([a, lerp(a, b, 0.6), b]), width: w })
  }
  return out
}

export function assemble(rec: Recipe): LimbStage {
  const g = buildLimb(rec.params)
  const p = rec.params
  const elements: Element[] = []
  const sty = rec.limb === 'forelimb' ? 'humerus' : 'femur'
  const ant = rec.limb === 'forelimb' ? 'radius' : 'tibia'
  const post = rec.limb === 'forelimb' ? 'ulna' : 'fibula'
  const carp = rec.limb === 'forelimb' ? 'carpal' : 'tarsal'
  const s1 = rec.state(sty)
  if (s1) elements.push(longBone(sty, s1, g.shoulder, g.elbow, 0.1, 0.9, 0, p.stylopod.width * 0.42))
  const s2 = rec.state(ant)
  if (s2) elements.push(longBone(ant, s2, g.elbow, g.wrist, 0.12, 0.94, p.zeugopod.width * 0.42, p.zeugopod.width * 0.26))
  const s3 = rec.state(post)
  if (s3) elements.push(longBone(post, s3, g.elbow, g.wrist, 0.04, 0.94, -p.zeugopod.width * 0.42, p.zeugopod.width * (rec.limb === 'forelimb' ? 0.26 : 0.18)))
  const s4 = rec.state(carp)
  if (s4) {
    const an = normal([g.palm[0] - g.wrist[0], g.palm[1] - g.wrist[1]])
    const l = Math.hypot(an[0], an[1]) || 1
    const c = lerp(g.wrist, g.palm, 0.16)
    elements.push(capsule(carp, s4, add(c, mul(an, (p.autopod.width * 0.35) / l)), add(c, mul(an, (p.autopod.width * 0.05) / l)), 2.2))
    elements.push(capsule(carp, s4, add(c, mul(an, (-p.autopod.width * 0.05) / l)), add(c, mul(an, (-p.autopod.width * 0.35) / l)), 2.2))
  }
  elements.push(...digitElements(rec, g, p))
  // Tight viewBox around the silhouette (margin for outline, claws and spline overshoot).
  const m = 6
  const [bx0, by0, bx1, by1] = g.bounds
  const vb = [Math.floor(bx0 - m), Math.floor(by0 - m), Math.ceil(bx1 + m), Math.ceil(by1 + m)]
  const stage: LimbStage = {
    limb: rec.limb,
    stage: rec.stage,
    theiler: rec.theiler,
    lengthMm: rec.lengthMm,
    viewBox: `${vb[0]} ${vb[1]} ${vb[2]! - vb[0]!} ${vb[3]! - vb[1]!}`,
    outline: g.outline,
    outlineOpen: g.outlineOpen,
    flank: g.flank,
    landmarks: { shoulder: g.shoulder, elbow: g.elbow, wrist: g.wrist, stylopodWidth: p.stylopod.width, zeugopodWidth: p.zeugopod.width },
    elements,
    muscles: rec.muscles(g, p),
    tendons: rec.tendons(g, p),
    nerves: rec.nerves(g, p),
  }
  if (rec.aer) {
    stage.aer = g.margin
    stage.vessels = vessels(g, p)
  }
  if (rec.hairPlacodes) stage.hairPlacodes = rec.hairPlacodes(g, p)
  if (rec.decor) {
    stage.decor = rec.decor(g, 'basic')
    stage.decorLucida = rec.decor(g, 'lucida')
  }
  return stage
}

/** `count` hair placodes scattered along the stylopod and zeugopod, alternating sides. */
export function placodes(g: LimbGeometry, p: LimbParams, count: number): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count
    const onStylopod = t < 0.5
    const from = onStylopod ? g.shoulder : g.elbow
    const to = onStylopod ? g.elbow : g.wrist
    const w = onStylopod ? p.stylopod.width : p.zeugopod.width
    const nrm = normal(onStylopod ? g.stylopodDir : g.zeugopodDir)
    const side = (i % 3) - 1
    const q = add(lerp(from, to, 0.1 + (t % 0.5) * 1.6), mul(nrm, side * w * 0.45))
    out.push([+q[0].toFixed(1), +q[1].toFixed(1)])
  }
  return out
}

/** Claw wedges at each digit tip. */
export function claws(g: LimbGeometry, style: 'basic' | 'lucida' = 'basic'): string {
  return g.rays
    .map((r) => {
      const n = normal(r.dir)
      const a = add(r.tip, mul(n, r.tipWidth * 0.55))
      const b = add(r.tip, mul(n, -r.tipWidth * 0.55))
      const t = add(r.tip, mul(r.dir, r.tipWidth * 1.9))
      const d = `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${t[0].toFixed(1)} ${t[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}z`
      return style === 'basic' ? `<path d="${d}" fill="#4b5563" stroke-width="1"/>` : `<path d="${d}" fill="#ffffff" stroke-width="0.9"/>`
    })
    .join('')
}

/** Footpads at the digit bases and two skin wrinkles across the zeugopod. */
export function padsAndWrinkles(g: LimbGeometry, p: LimbParams, pads: boolean, wrinkles: boolean, style: 'basic' | 'lucida' = 'basic'): string {
  const parts: string[] = []
  if (pads) {
    ;[1, 2, 3].forEach((i) => {
      const r = g.rays[i]!
      const c = add(r.base, mul(r.dir, -p.autopod.palm * 0.3))
      parts.push(
        style === 'basic'
          ? `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="2" fill="#1f2937" fill-opacity="0.18" stroke="none"/>`
          : `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="1.8" stroke-width="0.7"/>`,
      )
    })
  }
  if (wrinkles) {
    const n = normal(g.zeugopodDir)
    ;[0.35, 0.6].forEach((t) => {
      const c = lerp(g.elbow, g.wrist, t)
      const a = add(c, mul(n, p.zeugopod.width * 0.7))
      const b = add(c, mul(n, -p.zeugopod.width * 0.7))
      const d = `M${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${c[0].toFixed(1)} ${(c[1] + 1.5).toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`
      parts.push(style === 'basic' ? `<path d="${d}" stroke-width="1" stroke-opacity="0.5"/>` : `<path d="${d}" stroke-width="0.7"/>`)
    })
  }
  return parts.join('')
}

/** Marginal blood sinus just inside the AER and the limb axial artery (Carter 1954, Fig. 123 in Grüneberg 1963). */
export function vessels(g: LimbGeometry, p: LimbParams): Vessel[] {
  const margin = flattenPath(g.margin)[0]?.points ?? []
  const sinus = resample(margin, 1.2).map(({ p: q, n }) => add(q, mul(n, -3.2)))
  const axisEnd = add(g.wrist, mul(g.autopodDir, p.autopod.palm * 0.55))
  const prox = lerp(g.shoulder, g.elbow, 0.05)
  const mid = lerp(g.elbow, g.wrist, 0.5)
  const out: Vessel[] = []
  if (sinus.length > 2) out.push({ name: 'marginal sinus', path: smoothOpen(sinus), width: 1.6, dash: '7 1.6' })
  out.push({ name: 'axial artery (proximal)', path: smoothOpen([prox, lerp(g.shoulder, g.elbow, 0.55), g.elbow, mid]), width: 1.5 })
  out.push({ name: 'axial artery (distal)', path: smoothOpen([mid, g.wrist, lerp(g.wrist, axisEnd, 0.5), axisEnd]), width: 1 })
  return out
}
