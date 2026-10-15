/**
 * Assembly of a LimbStage from the authored silhouettes (shapes.ts) plus a per-stage tissue
 * recipe. Used by forelimb.ts and hindlimb.ts. Pure.
 */
import { add, blob, bounds, clipToSlab, crescent, lerp, len, mapToSegment, mul, normal, phalanxShape, polygon, polyline, smoothClosed, smoothOpen, sub, unit, type Pt } from './geometry'
import { BONE_SHAPES, LIMB_SHAPES, type LimbShape, type RayShape } from './shapes'
import type { Element, ElementName, ElementState, Limb, LimbStage, Muscle, Nerve, Stage, Tendon, Vessel } from './types'

export interface Geometry {
  limb: Limb
  stage: Stage
  shape: LimbShape
  shoulder: Pt
  elbow: Pt
  wrist: Pt
  palm: Pt
  stylopodDir: Pt
  zeugopodDir: Pt
  autopodDir: Pt
  rays: RayShape[]
  /** points of the distal margin (anterior to posterior) */
  margin: Pt[]
}

export interface Recipe {
  limb: Limb
  stage: Stage
  theiler: number
  /** state per skeletal element; absent = element not yet present */
  state: (name: ElementName, digit?: 1 | 2 | 3 | 4 | 5) => ElementState | undefined
  /** which digits have which phalanges: e.g. digit 1 has no middle phalanx */
  phalanges: (digit: 1 | 2 | 3 | 4 | 5) => ('proximal-phalanx' | 'middle-phalanx' | 'distal-phalanx')[]
  aer: boolean
  /** cartilage elements are relatively broad early: width factor across the bone axis */
  boneWidth?: number
  hairPlacodes?: (g: Geometry) => [number, number][]
  decor?: (g: Geometry, style: 'basic' | 'lucida') => string
  /** muscles; when absent, the muscle groups of the authored shape are used */
  muscles?: (g: Geometry) => Muscle[]
  tendons: (g: Geometry) => Tendon[]
  nerves: (g: Geometry) => Nerve[]
}

const DIGITS: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5]
const n1 = (v: number): number => +v.toFixed(1)

export function geometryOf(limb: Limb, stage: Stage): Geometry {
  const shape = LIMB_SHAPES[limb][stage]
  const { shoulder, elbow, wrist, palm } = shape.landmarks
  const [m0, m1] = shape.margin
  return {
    limb,
    stage,
    shape,
    shoulder,
    elbow,
    wrist,
    palm,
    stylopodDir: unit(sub(elbow, shoulder)),
    zeugopodDir: unit(sub(wrist, elbow)),
    autopodDir: unit(sub(palm, wrist)),
    rays: shape.rays,
    margin: shape.outline.slice(m0, m1 + 1),
  }
}

function element(name: ElementName, state: ElementState, p: Pt, d: Pt, r: number, poly: Pt[], digit?: 1 | 2 | 3 | 4 | 5, tension = 0.7): Element {
  const e: Element = { name, state, p: [n1(p[0]), n1(p[1])], d: [n1(d[0]), n1(d[1])], r: n1(r), shape: smoothClosed(poly, tension), polygon: poly.map(([x, y]) => [n1(x), n1(y)]) }
  if (digit) e.digit = digit
  return e
}

/** A bone from the E14.5 model outlines mapped onto the axis p → d. */
function bone(limb: Limb, key: string, name: ElementName, state: ElementState, p: Pt, d: Pt, across: number, digit?: 1 | 2 | 3 | 4 | 5): Element {
  const src = BONE_SHAPES[limb][key]!
  const poly = mapToSegment(src, p, d, across)
  const L = len(sub(d, p))
  const r = Math.max(...src.map(([, y]) => Math.abs(y))) * L * across
  return element(name, state, p, d, r, poly, digit)
}

function capsulePoly(p: Pt, d: Pt, r: number): Pt[] {
  const u = unit(sub(d, p))
  const n = normal(u)
  const out: Pt[] = []
  for (let i = 0; i <= 6; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / 6
    out.push(add(d, add(mul(u, Math.cos(a) * r), mul(n, -Math.sin(a) * r))))
  }
  for (let i = 0; i <= 6; i++) {
    const a = Math.PI / 2 + (Math.PI * i) / 6
    out.push(add(p, add(mul(u, Math.cos(a) * r), mul(n, -Math.sin(a) * r))))
  }
  return out
}

export function digitElements(rec: Recipe, g: Geometry): Element[] {
  const out: Element[] = []
  const metaName: ElementName = rec.limb === 'forelimb' ? 'metacarpal' : 'metatarsal'
  const mid = (g.rays.length - 1) / 2
  const an = normal(g.autopodDir)
  const palmLen = len(sub(g.palm, g.wrist))
  const across = rec.boneWidth ?? 1
  g.rays.forEach((ray, i) => {
    const digit = DIGITS[i]!
    const k = mid - i
    const L = len(sub(ray.tip, ray.base))
    const r = ray.width * 0.5
    const gap = 1.2
    const ms = rec.state(metaName, digit)
    if (ms) {
      const spacing = i > 0 ? len(sub(g.rays[1]!.base, g.rays[0]!.base)) : 7
      const mStart = add(add(g.wrist, mul(g.autopodDir, palmLen * 0.3)), mul(an, k * spacing * 0.45))
      const mEnd = add(ray.base, mul(ray.dir, -gap))
      out.push(bone(rec.limb, `${metaName}-${digit}`, metaName, ms, mStart, mEnd, across * 0.9, digit))
    }
    const names = rec.phalanges(digit)
    const fractions = names.length === 3 ? [0.42, 0.3, 0.24] : names.length === 2 ? [0.55, 0.4] : [0.9]
    let t = 0
    names.forEach((nm, j) => {
      const st = rec.state(nm, digit)
      const f = fractions[j]!
      const a = add(ray.base, mul(ray.dir, t * L + (j ? gap / 2 : 0)))
      const b = add(ray.base, mul(ray.dir, (t + f) * L - gap / 2))
      const rr = (j === 2 ? r * 0.8 : r) * across
      if (st) out.push(element(nm, st, a, b, rr, phalanxShape(a, b, rr, j === 2 ? 0.85 : 0.72), digit, 0.5))
      t += f
    })
  })
  return out
}

/** Four blocks along a segment: proximal/distal × dorsal/ventral (early muscle blocks). */
export function blocks(from: Pt, to: Pt, width: number, names: [string, string, string, string], spread = 0.45): Muscle[] {
  const n = normal(unit(sub(to, from)))
  const L = len(sub(to, from))
  const angle = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI
  const o = (k: number): Pt => mul(n, k * width * spread)
  const mk = (name: string, c: Pt, rx: number, ry: number): Muscle => ({ name, path: blob(c, rx, ry, angle), polygon: ellipsePoly(c, rx, ry, angle) })
  return [
    mk(names[0], add(lerp(from, to, 0.3), o(1)), L * 0.22, width * 0.3),
    mk(names[1], add(lerp(from, to, 0.72), o(1)), L * 0.2, width * 0.28),
    mk(names[2], add(lerp(from, to, 0.3), o(-1)), L * 0.22, width * 0.3),
    mk(names[3], add(lerp(from, to, 0.72), o(-1)), L * 0.2, width * 0.28),
  ]
}

function ellipsePoly(c: Pt, rx: number, ry: number, angle: number): Pt[] {
  const a = (angle * Math.PI) / 180
  const out: Pt[] = []
  for (let i = 0; i < 16; i++) {
    const t = (2 * Math.PI * i) / 16
    const x = Math.cos(t) * rx
    const y = Math.sin(t) * ry
    out.push([c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)])
  }
  return out
}

/** Two masses (dorsal, ventral) along a segment: the premuscle masses of the early bud. */
export function masses(from: Pt, to: Pt, width: number, names: [string, string]): Muscle[] {
  const n = normal(unit(sub(to, from)))
  const L = len(sub(to, from))
  const angle = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI
  const c = lerp(from, to, 0.5)
  const mk = (name: string, cc: Pt): Muscle => ({ name, path: blob(cc, L * 0.36, width * 0.3, angle), polygon: ellipsePoly(cc, L * 0.36, width * 0.3, angle) })
  return [mk(names[0], add(c, mul(n, width * 0.42))), mk(names[1], add(c, mul(n, -width * 0.42)))]
}

/** Muscle groups of the authored shape (from the E14.5 models), as closed smooth paths. */
export function shapeMuscles(g: Geometry): Muscle[] {
  return g.shape.muscles.map((m) => ({ name: m.name, path: smoothClosed(m.points, 0.7), polygon: m.points }))
}

/** Tendon band from the distal zeugopod along each digit ray to a fraction of the digit length. */
export function digitTendons(g: Geometry, toFraction: number, prefix: string): Tendon[] {
  const origin = lerp(g.elbow, g.wrist, 0.55)
  return g.rays.map((r, i) => {
    const L = len(sub(r.tip, r.base))
    const end = add(r.base, mul(r.dir, L * toFraction))
    const mid = add(r.base, mul(r.dir, -6))
    return { name: `${prefix} ${i + 1}`, path: smoothOpen([origin, lerp(origin, g.wrist, 0.6), mid, end]) }
  })
}

/** Three mixed trunks (anterior, central, posterior) from shoulder to wrist. */
export function trunks(g: Geometry, names: [string, string, string], toWrist = 1): Nerve[] {
  const sn = normal(g.stylopodDir)
  const zn = normal(g.zeugopodDir)
  const w1 = g.shape.landmarks.stylopodWidth
  const w2 = g.shape.landmarks.zeugopodWidth
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
export function digitalNerves(g: Geometry, toFraction: number, width: 1 | 2): Nerve[] {
  return g.rays.map((r, i) => {
    const L = len(sub(r.tip, r.base))
    const end = add(r.base, mul(r.dir, L * toFraction))
    return { name: `digital ${i + 1}`, path: smoothOpen([g.wrist, lerp(g.wrist, r.base, 0.5), add(r.base, mul(r.dir, -3)), end]), width }
  })
}

/** Short side twigs off a segment, alternating sides. */
export function twigs(from: Pt, to: Pt, width: number, count: number, length: number, w: 1 | 2): Nerve[] {
  const d = unit(sub(to, from))
  const n = normal(d)
  const out: Nerve[] = []
  for (let i = 0; i < count; i++) {
    const side = i % 2 ? -1 : 1
    const t = 0.25 + (0.55 * i) / Math.max(1, count - 1)
    const a = add(lerp(from, to, t), mul(n, side * width * 0.1))
    const b = add(add(a, mul(n, side * width * 0.75)), mul(d, length))
    out.push({ name: `twig ${i + 1}`, path: polyline([a, lerp(a, b, 0.6), b]), width: w })
  }
  return out
}

/** `count` hair placodes scattered along the stylopod and zeugopod, alternating sides. */
export function placodes(g: Geometry, count: number): [number, number][] {
  const out: [number, number][] = []
  const lm = g.shape.landmarks
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count
    const onStylopod = t < 0.5
    const from = onStylopod ? g.shoulder : g.elbow
    const to = onStylopod ? g.elbow : g.wrist
    const w = onStylopod ? lm.stylopodWidth : lm.zeugopodWidth
    const nrm = normal(onStylopod ? g.stylopodDir : g.zeugopodDir)
    const side = (i % 3) - 1
    const q = add(lerp(from, to, 0.1 + (t % 0.5) * 1.6), mul(nrm, side * w * 0.45))
    out.push([n1(q[0]), n1(q[1])])
  }
  return out
}

/** Claw wedges at each digit tip. */
export function claws(g: Geometry, style: 'basic' | 'lucida' = 'basic'): string {
  return g.rays
    .map((r) => {
      const n = normal(r.dir)
      const a = add(r.tip, mul(n, r.tipWidth * 0.55))
      const b = add(r.tip, mul(n, -r.tipWidth * 0.55))
      const t = add(r.tip, mul(r.dir, r.tipWidth * 1.9))
      const d = `M${n1(a[0])} ${n1(a[1])}Q${n1(t[0] - r.dir[0] * r.tipWidth * 0.3)} ${n1(t[1] - r.dir[1] * r.tipWidth * 0.3)} ${n1(t[0])} ${n1(t[1])}Q${n1(t[0] - r.dir[0] * r.tipWidth * 0.3)} ${n1(t[1] - r.dir[1] * r.tipWidth * 0.3)} ${n1(b[0])} ${n1(b[1])}z`
      return style === 'basic' ? `<path d="${d}" fill="#4b5563" stroke-width="0.6"/>` : `<path d="${d}" fill="#ffffff" stroke-width="0.6"/>`
    })
    .join('')
}

/** Footpads at the digit bases and two skin wrinkles across the zeugopod. */
export function padsAndWrinkles(g: Geometry, pads: boolean, wrinkles: boolean, style: 'basic' | 'lucida' = 'basic'): string {
  const parts: string[] = []
  const palmLen = len(sub(g.palm, g.wrist))
  if (pads) {
    ;[1, 2, 3].forEach((i) => {
      const r = g.rays[i]!
      const c = add(r.base, mul(r.dir, -palmLen * 0.22))
      parts.push(
        style === 'basic'
          ? `<circle cx="${n1(c[0])}" cy="${n1(c[1])}" r="2" fill="#1f2937" fill-opacity="0.18" stroke="none"/>`
          : `<circle cx="${n1(c[0])}" cy="${n1(c[1])}" r="1.8" stroke-width="0.5"/>`,
      )
    })
  }
  if (wrinkles) {
    const n = normal(g.zeugopodDir)
    const w = g.shape.landmarks.zeugopodWidth
    ;[0.35, 0.6].forEach((t) => {
      const c = lerp(g.elbow, g.wrist, t)
      const a = add(c, mul(n, w * 0.7))
      const b = add(c, mul(n, -w * 0.7))
      const d = `M${n1(a[0])} ${n1(a[1])}Q${n1(c[0])} ${n1(c[1] + 1.5)} ${n1(b[0])} ${n1(b[1])}`
      parts.push(style === 'basic' ? `<path d="${d}" stroke-width="0.7" stroke-opacity="0.5"/>` : `<path d="${d}" stroke-width="0.5"/>`)
    })
  }
  return parts.join('')
}

/** Marginal blood sinus just inside the AER and the limb axial artery (Carter 1954, Fig. 123 in Grüneberg 1963). */
export function vessels(g: Geometry): Vessel[] {
  const margin = g.margin
  // the margin runs anterior to posterior round the distal end, so its left-hand normal points outward
  const sinus: Pt[] = margin.map((q, i) => {
    const prev = margin[Math.max(0, i - 1)]!
    const next = margin[Math.min(margin.length - 1, i + 1)]!
    const n = normal(unit(sub(next, prev)))
    return add(q, mul(n, -3.4))
  })
  const palmLen = len(sub(g.palm, g.wrist))
  const axisEnd = add(g.wrist, mul(g.autopodDir, palmLen * 0.55))
  const prox = lerp(g.shoulder, g.elbow, 0.05)
  const mid = lerp(g.elbow, g.wrist, 0.5)
  const out: Vessel[] = []
  if (sinus.length > 2) out.push({ name: 'marginal sinus', path: smoothOpen(sinus), width: 1.3, dash: '7 1.6' })
  out.push({ name: 'axial artery (proximal)', path: smoothOpen([prox, lerp(g.shoulder, g.elbow, 0.55), g.elbow, mid]), width: 1.2 })
  out.push({ name: 'axial artery (distal)', path: smoothOpen([mid, g.wrist, lerp(g.wrist, axisEnd, 0.5), axisEnd]), width: 0.8 })
  return out
}

/** Band polygon across the mid-diaphysis (middle 40 %) of an element, clipped to its outline. */
export function diaphysisBand(e: Element): Pt[] {
  return clipToSlab(e.polygon, e.p, e.d, 0.3, 0.7)
}

export function assemble(rec: Recipe): LimbStage {
  const g = geometryOf(rec.limb, rec.stage)
  const s = g.shape
  const elements: Element[] = []
  const sty: ElementName = rec.limb === 'forelimb' ? 'humerus' : 'femur'
  const ant: ElementName = rec.limb === 'forelimb' ? 'radius' : 'tibia'
  const post: ElementName = rec.limb === 'forelimb' ? 'ulna' : 'fibula'
  const carp: ElementName = rec.limb === 'forelimb' ? 'carpal' : 'tarsal'
  const across = rec.boneWidth ?? 1
  const L1 = len(sub(g.elbow, g.shoulder))
  const L2 = len(sub(g.wrist, g.elbow))
  const zn = normal(g.zeugopodDir)
  const w2 = s.landmarks.zeugopodWidth
  const s1 = rec.state(sty)
  if (s1) elements.push(bone(rec.limb, sty, sty, s1, add(g.shoulder, mul(g.stylopodDir, L1 * 0.06)), add(g.elbow, mul(g.stylopodDir, -L1 * 0.03)), across))
  const s2 = rec.state(ant)
  if (s2) elements.push(bone(rec.limb, ant, ant, s2, add(add(g.elbow, mul(g.zeugopodDir, L2 * 0.1)), mul(zn, w2 * 0.36)), add(add(g.wrist, mul(g.zeugopodDir, -L2 * 0.05)), mul(zn, w2 * 0.3)), across))
  const s3 = rec.state(post)
  if (s3) elements.push(bone(rec.limb, post, post, s3, add(add(g.elbow, mul(g.zeugopodDir, -L2 * 0.03)), mul(zn, -w2 * 0.38)), add(add(g.wrist, mul(g.zeugopodDir, -L2 * 0.05)), mul(zn, -w2 * 0.32)), across))
  const s4 = rec.state(carp)
  if (s4) {
    const an = normal(g.autopodDir)
    const c = lerp(g.wrist, g.palm, 0.14)
    const row = [-0.3, 0, 0.3].map((k) => add(c, mul(an, k * w2 * 0.9)))
    row.forEach((q, i) => {
      const rr = (i === 1 ? 2.4 : 2.1) * across
      const p = add(q, mul(g.autopodDir, -rr * 0.6))
      const d = add(q, mul(g.autopodDir, rr * 0.6))
      elements.push(element(carp, s4, p, d, rr, capsulePoly(p, d, rr), undefined, 0.6))
    })
    const distal = lerp(g.wrist, g.palm, 0.26)
    ;[-0.18, 0.18].forEach((k) => {
      const q = add(distal, mul(an, k * w2 * 0.9))
      const rr = 1.9 * across
      const p = add(q, mul(g.autopodDir, -rr * 0.5))
      const d = add(q, mul(g.autopodDir, rr * 0.5))
      elements.push(element(carp, s4, p, d, rr, capsulePoly(p, d, rr), undefined, 0.6))
    })
  }
  elements.push(...digitElements(rec, g))
  const pts = s.outline
  const [bx0, by0, bx1, by1] = bounds(pts)
  const m = rec.stage >= 'E16.5' ? 7 : 5
  const vb = [Math.floor(bx0 - 3), Math.floor(by0 - m), Math.ceil(bx1 + m), Math.ceil(by1 + m)]
  // the authored outline is dense (about one point per 1.5 units): a low tension avoids loops at sharp bends
  const outlineOpen = smoothOpen(pts, 0.6)
  const stage: LimbStage = {
    limb: rec.limb,
    stage: rec.stage,
    theiler: rec.theiler,
    lengthMm: s.lengthMm,
    viewBox: `${vb[0]} ${vb[1]} ${vb[2]! - vb[0]!} ${vb[3]! - vb[1]!}`,
    outline: outlineOpen + 'z',
    outlineOpen,
    polygon: pts,
    flank: s.flank,
    landmarks: { shoulder: g.shoulder, elbow: g.elbow, wrist: g.wrist, stylopodWidth: s.landmarks.stylopodWidth, zeugopodWidth: s.landmarks.zeugopodWidth },
    elements,
    muscles: rec.muscles ? rec.muscles(g) : shapeMuscles(g),
    tendons: rec.tendons(g),
    nerves: rec.nerves(g),
  }
  if (rec.aer && g.margin.length > 2) {
    stage.aer = smoothOpen(g.margin)
    // the ridge is a thickening of the margin ectoderm: a crescent just inside the outline
    stage.aerBand = polygon(crescent(g.margin, rec.stage <= 'E11.5' ? 2.4 : 2.0, 1))
    stage.vessels = vessels(g)
  }
  if (rec.hairPlacodes) stage.hairPlacodes = rec.hairPlacodes(g)
  if (rec.decor) {
    stage.decor = rec.decor(g, 'basic')
    stage.decorLucida = rec.decor(g, 'lucida')
  }
  return stage
}
