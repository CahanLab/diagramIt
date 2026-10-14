/**
 * Mouse embryo lateral views, E10.5 (TS17), E11.5 (TS19) and E12.5 (TS20).
 *
 * Head to the left, dorsal side to the right, ventral side and limbs facing
 * left/down, tail curling under the belly. Silhouettes follow the eMouseAtlas
 * Theiler stage plates; limb morphology follows Martin (1990) Fig. 1 SEM series.
 *
 * Each stage is an `EmbryoModel`: a list of tagged path parts that the style
 * renderers in ./model.ts turn into the basic or camera lucida drawing. The
 * body is one closed `body` part; limbs are separate `limb` parts on top so
 * their outlines show; lens, eye and otic vesicle use #SECONDARY.
 */
import type { LibraryItem } from '../../types'
import { EMBRYO_PALETTE, renderEmbryo } from './model'
import type { EmbryoModel, EmbryoPart } from './model'

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

/** Closed body silhouette, filled #PRIMARY with the standard outline. */
const body = (pts: Pt[]): EmbryoPart => ({ tag: 'body', d: spline(pts, true), draw: 'fill' })
/** Open feature line (heart bulge, arches, nasal pit). */
const line = (tag: EmbryoPart['tag'], pts: Pt[], w = 2): EmbryoPart => ({ tag, d: spline(pts, false), draw: 'stroke', w })
/** Ellipse as two arcs, so every part is path data. */
const ellipse = (cx: number, cy: number, rx: number, ry: number): string =>
  `M${f(cx - rx)} ${f(cy)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0z`

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
const somites = (pts: Pt[], from: number, to: number, n: number, inset: number, len: number): EmbryoPart => {
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
  return { tag: 'somites', d: parts.join(''), draw: 'stroke', w: 1.5 }
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
const limbPlate = (b0: Pt, b1: Pt, c: Pt, r: number, digits: number): EmbryoPart => {
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
  return { tag: 'limb', d, draw: 'fill', w: 2 }
}

/** Rounded limb bud (early stages): an ellipse filled #PRIMARY. */
const limbBud = (cx: number, cy: number, rx: number, ry: number): EmbryoPart => ({ tag: 'limb', d: ellipse(cx, cy, rx, ry), draw: 'fill', w: 2 })
/** Umbilical loop / physiological hernia at the belly. */
const hernia = (cx: number, cy: number, rx: number, ry: number): EmbryoPart => ({ tag: 'hernia', d: ellipse(cx, cy, rx, ry), draw: 'fill', w: 1.8 })
/** Closed lens vesicle ring in #SECONDARY, white inside. */
const lensRing = (cx: number, cy: number, r: number): EmbryoPart => ({ tag: 'lens', d: ellipse(cx, cy, r, r), draw: 'ring-secondary', w: 2 })
/** Pigmented eye: solid #SECONDARY disc, no outline. */
const eyeDot = (cx: number, cy: number, r: number): EmbryoPart => ({ tag: 'eye', d: ellipse(cx, cy, r, r), draw: 'fill-secondary', w: 0 })
/** Otic vesicle: #SECONDARY disc, no outline. */
const otic = (cx: number, cy: number, r: number): EmbryoPart => ({ tag: 'ear', d: ellipse(cx, cy, r, r), draw: 'fill-secondary', w: 0, opacity: 0.55 })

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

const e105: EmbryoModel = {
  stage: 'E10.5',
  theiler: 17,
  viewBox: '0 0 100 100',
  parts: [
    body(e105Body),
    somites(e105Body, 1.7, 8.3, 20, 3, 4),
    // heart bulge outlined on the ventral surface
    line('heart', [[41, 45], [50, 48], [57, 55], [62, 63]]),
    // branchial arches 1 to 3 below and behind the eye
    line('arches', [[33, 36], [34, 43], [38, 49]]),
    line('arches', [[40, 32], [41, 40], [45, 47]]),
    line('arches', [[47, 30], [47, 38], [50, 44]]),
    // forelimb bud (rounded dome) and hindlimb bud (small bump)
    limbBud(73, 57, 6.5, 5.5),
    limbBud(69, 80, 4.5, 4),
    // lens pit: open ring (a stroke, not a filled ring, so the body shows through the gap)
    { tag: 'lens', d: 'M29.4 33.8A4 4 0 1 1 31.8 31.4', draw: 'stroke-secondary', w: 2 },
    otic(49, 23, 2.5),
  ],
}

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

const e115: EmbryoModel = {
  stage: 'E11.5',
  theiler: 19,
  viewBox: '0 0 100 100',
  parts: [
    body(e115Body),
    somites(e115Body, 3.2, 8.6, 16, 3, 4),
    // heart bulge
    line('heart', [[40, 50], [49, 52], [56, 58], [60, 66]]),
    // branchial arches (mandibular, hyoid)
    line('arches', [[36, 40], [38, 48], [43, 53]]),
    line('arches', [[44, 36], [45, 44], [49, 51]]),
    // nasal pit
    line('nasal', [[19, 44], [21, 49], [26, 49]], 1.8),
    // umbilical loop at the belly
    hernia(60, 68, 3.5, 4),
    // forelimb paddle: flat handplate on a short stalk, pointing ventrally
    limbPlate([76, 46], [67, 43], [70, 58], 8, 0),
    // hindlimb bud, rounded
    limbBud(67, 79, 6.5, 6),
    lensRing(28, 36, 4.5),
    otic(52, 27, 3),
  ],
}

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

const e125: EmbryoModel = {
  stage: 'E12.5',
  theiler: 20,
  viewBox: '0 0 100 100',
  parts: [
    body(e125Body),
    somites(e125Body, 6, 8.6, 8, 3, 4),
    // heart bulge
    line('heart', [[40, 50], [48, 52], [55, 58], [59, 66]]),
    // mandibular prominence under the eye and hyoid groove
    line('arches', [[33, 43], [35, 51], [41, 56]]),
    line('arches', [[42, 39], [44, 47], [48, 53]]),
    // nasal pit
    line('nasal', [[18, 44], [20, 49], [25, 49]], 1.8),
    // umbilical hernia loop
    hernia(61, 72, 4.5, 5),
    // forelimb: handplate with five shallow scallops (digital rays) on a stalk
    limbPlate([77, 47], [67, 43], [69, 60], 10.5, 5),
    // hindlimb: rounded footplate on a stalk
    limbPlate([78, 80], [72, 72], [65, 85], 7, 0),
    eyeDot(27, 36, 4.5),
    // pinna anlage: crescent behind the eye (an open line, so it stays a stroke)
    { tag: 'ear', d: 'M47 29c-3.5 2-4.5 7-1.5 10', draw: 'stroke-secondary', w: 2 },
  ],
}

export const models: EmbryoModel[] = [e105, e115, e125]

const item = (model: EmbryoModel, id: string, name: string, keywords: string[], size: number): LibraryItem => ({
  id,
  name,
  category: 'development',
  keywords: [...KEYWORDS, ...keywords],
  width: size,
  height: size,
  primary: EMBRYO_PALETTE.basic.primary,
  secondary: EMBRYO_PALETTE.basic.secondary,
  svg: renderEmbryo(model, 'basic'),
  styles: { lucida: { svg: renderEmbryo(model, 'lucida'), ...EMBRYO_PALETTE.lucida }, realistic: { svg: renderEmbryo(model, 'realistic'), ...EMBRYO_PALETTE.realistic } },
})

export const items: LibraryItem[] = [
  item(
    e105,
    'development.mouse-embryo-e10-5',
    'Mouse embryo E10.5',
    [
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
    90,
  ),
  item(
    e115,
    'development.mouse-embryo-e11-5',
    'Mouse embryo E11.5',
    [
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
    97,
  ),
  item(
    e125,
    'development.mouse-embryo-e12-5',
    'Mouse embryo E12.5',
    [
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
    105,
  ),
]
