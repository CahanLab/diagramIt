/**
 * Camera lucida renderer for mouse limb stage icons: thin ink line, white interior,
 * open at the flank, skeleton as stipple inside the cartilage contours whose density
 * encodes maturity, muscle groups as hatched shapes, tendons as paired lines, nerves as
 * solid ink (after Grüneberg 1963, Fig. 28, and Carter 1954). Ink is #PRIMARY. Pure.
 * Spec: docs/superpowers/specs/2026-10-14-drawing-styles-design.md
 */
import type { Element, LimbStage, LimbVersion, Muscle, Nerve } from '../items/limbs/types'
import { diaphysisBand } from '../items/limbs/build'
import { polygon } from '../items/limbs/geometry'
import { distToPolygon, flattenPath, hash as hashStr, hatchPolygon, pointInPolygon, resample, stippleField, type Polygon } from './tone'

export const LUCIDA = {
  outline: 0.8,
  /** tonal stipple over the mesenchyme (Carter 1954): grid spacing and dot diameters */
  toneSpacing: 1.5,
  toneSizes: [0.5, 0.8, 1.1] as [number, number, number],
  feature: 0.55,
  bone: 0.45,
  dot: 0.85,
  hatch: 0.45,
  hatchSpacing: 1.9,
  spacing: { cartilage: 1.35, band: 0.9 },
  nerveWidth: { 1: 0.6, 2: 0.9, 3: 1.4 } as Record<Nerve['width'], number>,
} as const

const n = (v: number): string => {
  const s = v.toFixed(1)
  return s.endsWith('.0') ? s.slice(0, -2) : s
}
const hash = hashStr

const dots = (layers: { d: string; width: number }[]): string => layers.map((l) => `<path d="${l.d}" stroke-width="${l.width}" stroke-linecap="round"/>`).join('')

/** Uniform stipple inside a polygon, kept `inset` away from its edge. */
function stipplePolygon(poly: Polygon, spacing: number, seed: string, inset = 0.7, density = 0.92): string {
  return dots(stippleField([poly], (x, y) => (distToPolygon([x, y], poly) < inset ? 0 : density), { spacing, seed: hash(seed), sizes: [LUCIDA.dot, LUCIDA.dot, LUCIDA.dot] }))
}

function element(e: Element, seed: string): string {
  const cls = `el ${e.name}${e.digit ? `-${e.digit}` : ''} ${e.state}`
  switch (e.state) {
    case 'condensation':
      // the blastema is a density halo in the tonal field (see toneField); a sparse core marks its axis
      return `<g class="${cls}">${dots(stippleField([e.polygon], (x, y) => 0.35 * Math.max(0, 1 - (distToPolygon([x, y], e.polygon) < 0.6 ? 1 : 0)), { spacing: 2.4, seed: hash(seed), sizes: [0.7, 0.7, 0.7] }))}</g>`
    case 'cartilage':
      return `<g class="${cls}"><path d="${e.shape}" fill="#ffffff" stroke-width="${LUCIDA.bone}"/>${stipplePolygon(e.polygon, LUCIDA.spacing.cartilage, seed)}</g>`
    case 'sleeve':
    case 'ossifying': {
      const band = diaphysisBand(e)
      const bandPath = band.length > 2 ? `<path d="${polygon(band)}" fill="#ffffff" stroke-width="${LUCIDA.bone}"/>` : ''
      const fill = e.state === 'ossifying' && band.length > 2 ? stipplePolygon(band, LUCIDA.spacing.band, seed + ':band', 0.4, 1) : ''
      return `<g class="${cls}"><path d="${e.shape}" fill="#ffffff" stroke-width="${LUCIDA.bone}"/>${stipplePolygon(e.polygon, LUCIDA.spacing.cartilage, seed)}${bandPath}${fill}</g>`
    }
  }
}

function muscle(m: Muscle, i: number): string {
  // hatch direction follows the muscle's long axis, offset by 40 degrees
  const [x0, y0] = m.polygon[0] ?? [0, 0]
  let far: [number, number] = [x0, y0]
  let best = 0
  for (const p of m.polygon) {
    const d = Math.hypot(p[0] - x0, p[1] - y0)
    if (d > best) {
      best = d
      far = p
    }
  }
  const angle = (Math.atan2(far[1] - y0, far[0] - x0) * 180) / Math.PI + (i % 2 ? 40 : -40)
  return `<path d="${m.path}" fill="#ffffff" stroke-width="${LUCIDA.feature}"/><path d="${hatchPolygon(m.polygon, angle, LUCIDA.hatchSpacing)}" stroke-width="${LUCIDA.hatch}"/>`
}

function flankExtensions(stage: LimbStage): string {
  const { anterior, posterior, inward } = stage.flank
  const ext = (p: [number, number], side: number): string => {
    const nx = inward[1] * side
    const ny = -inward[0] * side
    const q: [number, number] = [p[0] + inward[0] * 6 + nx * 0.8, p[1] + inward[1] * 6 + ny * 0.8]
    const e: [number, number] = [p[0] + inward[0] * 12 + nx * 2.2, p[1] + inward[1] * 12 + ny * 2.2]
    return `<path d="M${n(p[0])} ${n(p[1])}Q${n(q[0])} ${n(q[1])} ${n(e[0])} ${n(e[1])}" stroke-width="${LUCIDA.outline}" stroke-opacity="0.45"/>`
  }
  return ext(anterior, 1) + ext(posterior, -1)
}

/** Tonal stipple over the whole silhouette: edge darkening, proximal-to-distal gradient, blastema halos. */
function toneField(stage: LimbStage, version: LimbVersion, poly: Polygon): string {
  const lm = stage.landmarks
  const axisLen = Math.hypot(lm.wrist[0] - lm.shoulder[0], lm.wrist[1] - lm.shoulder[1]) || 1
  const elements = version === 'outline' ? [] : stage.elements
  const tone = (x: number, y: number): number => {
    const p: [number, number] = [x, y]
    const along = Math.max(0, Math.min(1, ((x - lm.shoulder[0]) * (lm.wrist[0] - lm.shoulder[0]) + (y - lm.shoulder[1]) * (lm.wrist[1] - lm.shoulder[1])) / (axisLen * axisLen)))
    // the proximal cut is not a surface edge: fade the edge term out within 8 units of the flank
    const flankFade = Math.min(1, (along * axisLen) / 8)
    const edge = Math.max(0, 1 - distToPolygon(p, poly) / 6) * flankFade
    let t = 0.08 + 0.1 * (1 - along) + 0.6 * Math.pow(edge, 1.6)
    for (const e of elements) {
      const inside = pointInPolygon(p, e.polygon)
      const d = inside ? 0 : distToPolygon(p, e.polygon)
      if (e.state === 'condensation') {
        t += 0.7 * Math.exp(-Math.pow(d / (e.r * 1.1), 2))
      } else {
        if (inside) return 0
        t += 0.35 * Math.exp(-Math.pow(d / (e.r * 0.8), 2))
      }
    }
    return Math.min(1, t)
  }
  return dots(stippleField([poly], tone, { spacing: LUCIDA.toneSpacing, seed: hash(`${stage.limb}:${stage.stage}:${version}:tone`), sizes: LUCIDA.toneSizes }))
}

/**
 * The apical ectodermal ridge as a band of epithelial cells: the margin line, an outer edge
 * that rises from the surface ectoderm and sinks back into it, and cell boundaries between.
 */
function aerBand(aer: string, band: string): string {
  const line = flattenPath(aer)[0]?.points
  const crescent = flattenPath(band)[0]?.points
  if (!line || line.length < 2 || !crescent) return ''
  const samples = resample(line, 1.3)
  const cum: number[] = [0]
  for (let i = 1; i < line.length; i++) cum.push(cum[i - 1]! + Math.hypot(line[i]![0] - line[i - 1]![0], line[i]![1] - line[i - 1]![1]))
  const L = cum[cum.length - 1]! || 1
  const total = samples.length
  const ticks: string[] = []
  samples.forEach(({ p, n: nn }, i) => {
    const s = (i / Math.max(1, total - 1)) * L
    const h = 2.2 * Math.pow(Math.sin((Math.PI * s) / L), 0.6)
    if (h < 0.5) return
    const a: [number, number] = [p[0] - nn[0] * 0.15, p[1] - nn[1] * 0.15]
    const b: [number, number] = [p[0] - nn[0] * h, p[1] - nn[1] * h]
    ticks.push(`M${n(a[0])} ${n(a[1])}L${n(b[0])} ${n(b[1])}`)
  })
  // outer edge: the far side of the crescent polygon (second half of its points)
  const outer = crescent.slice(line.length).reverse()
  const outerPath = outer.map((q, i) => `${i ? 'L' : 'M'}${n(q[0])} ${n(q[1])}`).join('')
  return `<path d="${outerPath}" stroke-width="0.6"/><path d="${ticks.join('')}" stroke-width="0.4"/>`
}

export function limbLucidaSvg(stage: LimbStage, version: LimbVersion): string {
  const poly = stage.polygon
  const parts: string[] = [`<path d="${stage.outline}" fill="#ffffff" stroke="none"/>`, toneField(stage, version, poly)]
  if (version !== 'outline') parts.push(...stage.elements.map((e, i) => element(e, `${stage.limb}:${stage.stage}:${i}`)))
  if (version === 'skeleton') {
    for (const v of stage.vessels ?? []) parts.push(`<path d="${v.path}" stroke-width="${n(Math.min(v.width, 0.9))}"${v.dash ? ` stroke-dasharray="${v.dash}"` : ''}/>`)
  }
  if (version === 'muscle') {
    parts.push(...stage.muscles.map(muscle))
    for (const t of stage.tendons) parts.push(`<path d="${t.path}" stroke-width="2.4"/><path d="${t.path}" stroke="#ffffff" stroke-width="1.3"/>`)
  }
  if (version === 'nerves') for (const nv of stage.nerves) parts.push(`<path d="${nv.path}" stroke-width="${LUCIDA.nerveWidth[nv.width]}"/>`)
  parts.push(`<path d="${stage.outlineOpen}" stroke-width="${LUCIDA.outline}"/>`, flankExtensions(stage))
  if (stage.aer && stage.aerBand) parts.push(aerBand(stage.aer, stage.aerBand))
  for (const [x, y] of stage.hairPlacodes ?? []) parts.push(`<circle cx="${n(x)}" cy="${n(y)}" r="0.9" fill="#ffffff" stroke-width="0.5"/>`)
  if (stage.decorLucida) parts.push(stage.decorLucida)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${stage.viewBox}"><g fill="none" stroke="#PRIMARY" stroke-width="${LUCIDA.outline}" stroke-linejoin="round" stroke-linecap="round">${parts.join('')}</g></svg>`
}
