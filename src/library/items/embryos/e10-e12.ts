/**
 * Mouse embryo lateral views, E10.5 (TS17), E11.5 (TS19) and E12.5 (TS20).
 *
 * Head to the left, dorsal side to the right, ventral side and limbs facing
 * left/down, tail curling under the belly. Silhouettes follow the eMouseAtlas
 * Theiler stage plates; limb morphology follows Martin (1990) Fig. 1 SEM series.
 * The body is one closed #PRIMARY path; limbs are separate #PRIMARY paths on
 * top so their outlines show; eye and ear use #SECONDARY.
 */
import type { LibraryItem } from '../../types'

const wrap = (viewBox: string, body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><g fill="none" stroke="#1f2937" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`

type Pt = [number, number]
const f = (v: number): string => (Math.round(v * 10) / 10).toString()

/** Catmull-Rom spline through `pts`, closed when `close` is true. `t` scales the handle length. */
const spline = (pts: Pt[], close: boolean, t = 1): string => {
  const n = pts.length
  const at = (i: number): Pt => (close ? pts[((i % n) + n) % n] : pts[Math.min(Math.max(i, 0), n - 1)])
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  const segs = close ? n : n - 1
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    const c1: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * t, p1[1] + ((p2[1] - p0[1]) / 6) * t]
    const c2: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * t, p2[1] - ((p3[1] - p1[1]) / 6) * t]
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`
  }
  return close ? d + 'Z' : d
}

const body = (pts: Pt[]): string => `<path d="${spline(pts, true)}" fill="#PRIMARY"/>`
const stroke = (pts: Pt[], w = 2): string => `<path d="${spline(pts, false)}" stroke-width="${w}"/>`

/** Cubic Bezier control points of closed-spline segment `i` (p1 -> p2). */
const segment = (pts: Pt[], i: number, t = 1): [Pt, Pt, Pt, Pt] => {
  const n = pts.length
  const at = (k: number): Pt => pts[((k % n) + n) % n]
  const p0 = at(i - 1)
  const p1 = at(i)
  const p2 = at(i + 1)
  const p3 = at(i + 2)
  return [
    p1,
    [p1[0] + ((p2[0] - p0[0]) / 6) * t, p1[1] + ((p2[1] - p0[1]) / 6) * t],
    [p2[0] - ((p3[0] - p1[0]) / 6) * t, p2[1] - ((p3[1] - p1[1]) / 6) * t],
    p2,
  ]
}

/**
 * Somite marks: `n` short strokes along the closed body spline between
 * segment parameters `from` and `to` (segment index + fraction), set `inset`
 * px inside the outline and `len` px long, pointing inward, as one path.
 */
const somites = (pts: Pt[], from: number, to: number, n: number, inset: number, len: number): string => {
  const parts: string[] = []
  for (let k = 0; k < n; k++) {
    const s = from + ((to - from) * k) / (n - 1)
    const i = Math.floor(s)
    const u = s - i
    const [a, b, c, d] = segment(pts, i)
    const m = 1 - u
    const x = m * m * m * a[0] + 3 * m * m * u * b[0] + 3 * m * u * u * c[0] + u * u * u * d[0]
    const y = m * m * m * a[1] + 3 * m * m * u * b[1] + 3 * m * u * u * c[1] + u * u * u * d[1]
    const dx = 3 * m * m * (b[0] - a[0]) + 6 * m * u * (c[0] - b[0]) + 3 * u * u * (d[0] - c[0])
    const dy = 3 * m * m * (b[1] - a[1]) + 6 * m * u * (c[1] - b[1]) + 3 * u * u * (d[1] - c[1])
    const l = Math.hypot(dx, dy) || 1
    // Inward normal of a clockwise outline (screen coordinates) is to the right of travel.
    const nx = -dy / l
    const ny = dx / l
    parts.push(`M${f(x + nx * inset)} ${f(y + ny * inset)}L${f(x + nx * (inset + len))} ${f(y + ny * (inset + len))}`)
  }
  return `<path d="${parts.join('')}" stroke-width="1.5"/>`
}

/** Point on a circle at angle `deg` (SVG orientation). */
const polar = (cx: number, cy: number, r: number, deg: number): Pt => {
  const a = (deg * Math.PI) / 180
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
}

/**
 * Limb on a stalk: a disc (c, r) joined to the flank by straight edges from
 * the base points `b0` (posterior) and `b1` (anterior) tangent to the disc; the
 * distal edge between the tangent points carries `digits` scallops (0 = smooth).
 */
const limbPlate = (b0: Pt, b1: Pt, c: Pt, r: number, digits: number): string => {
  const tangent = (bp: Pt, sign: number): number => {
    const d = Math.hypot(bp[0] - c[0], bp[1] - c[1])
    const phi = (Math.atan2(bp[1] - c[1], bp[0] - c[0]) * 180) / Math.PI
    return phi + sign * ((Math.acos(r / d) * 180) / Math.PI)
  }
  const a0 = tangent(b0, 1)
  let a1 = tangent(b1, -1)
  while (a1 <= a0) a1 += 360
  const p0 = polar(c[0], c[1], r, a0)
  const p1 = polar(c[0], c[1], r, a1)
  let d = `M${f(b0[0])} ${f(b0[1])}L${f(p0[0])} ${f(p0[1])}`
  if (digits > 0) {
    let prev = p0
    for (let k = 1; k <= digits; k++) {
      const q = polar(c[0], c[1], r, a0 + ((a1 - a0) * k) / digits)
      const chord = Math.hypot(q[0] - prev[0], q[1] - prev[1])
      d += `A${f(chord * 0.58)} ${f(chord * 0.58)} 0 0 1 ${f(q[0])} ${f(q[1])}`
      prev = q
    }
  } else {
    d += `A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${f(p1[0])} ${f(p1[1])}`
  }
  d += `L${f(b1[0])} ${f(b1[1])}Z`
  return `<path d="${d}" fill="#PRIMARY" stroke-width="2"/>`
}

/** Closed lens vesicle ring in #SECONDARY. */
const lensRing = (cx: number, cy: number, r: number): string =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" stroke="#SECONDARY" stroke-width="2"/>`
/** Pigmented eye. */
const eyeDot = (cx: number, cy: number, r: number): string =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#SECONDARY" stroke="none"/>`
/** Otic vesicle. */
const otic = (cx: number, cy: number, r: number): string =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#SECONDARY" stroke="none" fill-opacity="0.55"/>`

const KEYWORDS = ['mouse', 'mus musculus', 'embryo', 'embryonic day', 'development', 'organogenesis']

/* ------------------------------------------------------------------ E10.5 */

const e105Body: Pt[] = [
  [40, 10], // top of head (midbrain)
  [58, 9],
  [72, 18], // nape
  [84, 32],
  [91, 50], // back
  [88, 70],
  [76, 86], // lumbar
  [60, 94], // tail root
  [44, 93],
  [31, 86], // tail curling under the belly
  [23, 74],
  [24, 65], // tail tip
  [30, 69],
  [39, 80], // tail inner edge
  [52, 84],
  [63, 80],
  [68, 70],
  [65, 61], // belly
  [58, 58], // heart bulge
  [48, 56],
  [38, 52], // mandibular arch
  [28, 45], // face / forebrain
  [19, 34],
  [20, 20],
  [28, 12],
]

const e105 =
  body(e105Body) +
  somites(e105Body, 1.7, 8.3, 20, 3, 4) +
  // heart bulge outlined on the ventral surface
  stroke([[41, 45], [50, 48], [57, 55], [62, 63]]) +
  // branchial arches 1 to 3 below and behind the eye
  stroke([[33, 36], [34, 43], [38, 49]]) +
  stroke([[40, 32], [41, 40], [45, 47]]) +
  stroke([[47, 30], [47, 38], [50, 44]]) +
  // forelimb bud (rounded dome) and hindlimb bud (small bump)
  `<ellipse cx="73" cy="57" rx="6.5" ry="5.5" fill="#PRIMARY" stroke-width="2"/>` +
  `<ellipse cx="69" cy="80" rx="4.5" ry="4" fill="#PRIMARY" stroke-width="2"/>` +
  // lens pit: open ring
  `<path d="M29.4 33.8A4 4 0 1 1 31.8 31.4" stroke="#SECONDARY" stroke-width="2"/>` +
  otic(49, 23, 2.5)

/* ------------------------------------------------------------------ E11.5 */

const e115Body: Pt[] = [
  [40, 7], // top of head
  [56, 6],
  [67, 14], // nape
  [70, 27],
  [81, 38], // back bulging right
  [89, 55],
  [88, 75],
  [77, 90], // lumbar
  [61, 96], // tail root
  [45, 94],
  [33, 86], // tail under the belly
  [26, 74],
  [26, 63], // tail tip
  [32, 66],
  [38, 76], // tail inner edge
  [48, 84],
  [59, 82],
  [64, 72],
  [61, 63], // belly / umbilicus
  [53, 58], // heart
  [44, 56],
  [35, 57], // mandible
  [25, 55], // nasal process
  [15, 47],
  [12, 33],
  [17, 16],
  [28, 8],
]

const e115 =
  body(e115Body) +
  somites(e115Body, 3.2, 8.6, 16, 3, 4) +
  // heart bulge
  stroke([[40, 50], [49, 52], [56, 58], [60, 66]]) +
  // branchial arches (mandibular, hyoid)
  stroke([[36, 40], [38, 48], [43, 53]]) +
  stroke([[44, 36], [45, 44], [49, 51]]) +
  // nasal pit
  stroke([[19, 44], [21, 49], [26, 49]], 1.8) +
  // umbilical loop at the belly
  `<ellipse cx="60" cy="68" rx="3.5" ry="4" fill="#PRIMARY" stroke-width="1.8"/>` +
  // forelimb paddle: flat handplate on a short stalk, pointing ventrally
  limbPlate([76, 46], [67, 43], [70, 58], 8, 0) +
  // hindlimb bud, rounded
  `<ellipse cx="67" cy="79" rx="6.5" ry="6" fill="#PRIMARY" stroke-width="2"/>` +
  lensRing(28, 36, 4.5) +
  otic(52, 27, 3)

/* ------------------------------------------------------------------ E12.5 */

const e125Body: Pt[] = [
  [38, 6], // top of head
  [54, 5],
  [66, 13], // nape
  [70, 26],
  [82, 37], // back
  [91, 55],
  [89, 76],
  [78, 91], // lumbar
  [62, 97], // tail root
  [46, 95],
  [34, 87], // tail lies along the belly
  [27, 74],
  [28, 62], // tail tip
  [34, 65],
  [39, 76], // tail inner edge
  [49, 84],
  [59, 82],
  [63, 72], // belly
  [60, 63],
  [52, 58], // heart
  [43, 57],
  [34, 59], // mandibular prominence
  [24, 56], // nasal process
  [13, 47],
  [10, 32],
  [16, 15],
  [26, 7],
]

const e125 =
  body(e125Body) +
  somites(e125Body, 6, 8.6, 8, 3, 4) +
  // heart bulge
  stroke([[40, 50], [48, 52], [55, 58], [59, 66]]) +
  // mandibular prominence under the eye and hyoid groove
  stroke([[33, 43], [35, 51], [41, 56]]) +
  stroke([[42, 39], [44, 47], [48, 53]]) +
  // nasal pit
  stroke([[18, 44], [20, 49], [25, 49]], 1.8) +
  // umbilical hernia loop
  `<ellipse cx="61" cy="72" rx="4.5" ry="5" fill="#PRIMARY" stroke-width="1.8"/>` +
  // forelimb: handplate with five shallow scallops (digital rays) on a stalk
  limbPlate([77, 47], [67, 43], [69, 60], 10.5, 5) +
  // hindlimb: rounded footplate on a stalk
  limbPlate([78, 80], [72, 72], [65, 85], 7, 0) +
  eyeDot(27, 36, 4.5) +
  // pinna anlage: crescent behind the eye
  `<path d="M47 29c-3.5 2-4.5 7-1.5 10" stroke="#SECONDARY" stroke-width="2"/>`

export const items: LibraryItem[] = [
  {
    id: 'development.mouse-embryo-e10-5',
    name: 'Mouse embryo E10.5',
    category: 'development',
    keywords: [
      ...KEYWORDS,
      'e10.5',
      '10.5 dpc',
      'ts17',
      'theiler 17',
      'theiler stage 17',
      'limb bud',
      'forelimb bud',
      'hindlimb bud',
      'somites',
      'branchial arches',
      'pharyngeal arches',
      'lens pit',
      'otic vesicle',
      'tail bud',
    ],
    width: 90,
    height: 90,
    primary: '#e8c9a0',
    secondary: '#374151',
    svg: wrap('0 0 100 100', e105),
  },
  {
    id: 'development.mouse-embryo-e11-5',
    name: 'Mouse embryo E11.5',
    category: 'development',
    keywords: [
      ...KEYWORDS,
      'e11.5',
      '11.5 dpc',
      'ts19',
      'theiler 19',
      'theiler stage 19',
      'limb bud',
      'forelimb paddle',
      'handplate',
      'hindlimb bud',
      'somites',
      'lens vesicle',
      'nasal pit',
      'umbilical loop',
    ],
    width: 97,
    height: 97,
    primary: '#e8c9a0',
    secondary: '#374151',
    svg: wrap('0 0 100 100', e115),
  },
  {
    id: 'development.mouse-embryo-e12-5',
    name: 'Mouse embryo E12.5',
    category: 'development',
    keywords: [
      ...KEYWORDS,
      'e12.5',
      '12.5 dpc',
      'ts20',
      'theiler 20',
      'theiler stage 20',
      'handplate',
      'digital rays',
      'footplate',
      'pigmented eye',
      'pinna',
      'umbilical hernia',
      'mandibular prominence',
    ],
    width: 105,
    height: 105,
    primary: '#e8c9a0',
    secondary: '#374151',
    svg: wrap('0 0 100 100', e125),
  },
]
