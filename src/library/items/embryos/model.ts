/**
 * Structural model of a mouse embryo icon and its style renderers.
 * Spec: docs/superpowers/specs/2026-10-14-drawing-styles-design.md
 *
 * Each embryo is a list of tagged parts (path data plus how the basic style
 * draws it). Renderers turn the same model into the basic, camera lucida or
 * realistic drawing, so the three styles never drift apart.
 */
import type { Stage } from '../limbs/types'
import type { DrawingStyle } from '../../types'
import { OUTLINE } from '../../types'
import { bbox, distToPolygon, distToPolyline, flattenPath, hash, pointInPolygon, stippleField, type Polygon } from '../../generators/tone'

export type EmbryoPartTag =
  | 'body' | 'limb' | 'hand' | 'foot' | 'tail' | 'detail'
  | 'eye' | 'lens' | 'eyelid' | 'ear' | 'nasal' | 'arches' | 'somites'
  | 'heart' | 'hernia' | 'vibrissae' | 'whiskers' | 'wrinkles' | 'claws' | 'pads' | 'detail'

/**
 * How the basic style draws a part:
 * - fill: `#PRIMARY` fill with the standard outline
 * - stroke: outline only
 * - dots: round-capped stroke (vibrissae, somite ticks drawn as zero-length segments)
 * - sausage: outline stroke of width w, then `#PRIMARY` stroke of width w-5 on the same path (rounded limbs)
 * - fill-secondary: `#SECONDARY` fill (pigmented eye, ear)
 * - ring-secondary: white fill with `#SECONDARY` stroke (lens vesicle before pigmentation)
 * - fill-white: white fill with outline
 * - fill-dark: solid outline-coloured fill (claws)
 */
export type EmbryoDraw =
  | 'fill' | 'stroke' | 'dots' | 'sausage' | 'fill-secondary' | 'ring-secondary' | 'fill-white' | 'fill-dark'
  /** outline-only stroke in #SECONDARY (eyelid lines, lens pit arc) */
  | 'stroke-secondary'
  /** white stroke (the slit of fusing eyelids) */
  | 'stroke-white'

export interface EmbryoPart {
  tag: EmbryoPartTag
  /** SVG path data in the model's viewBox */
  d: string
  draw: EmbryoDraw
  /** stroke width for the basic style (default 2.5); for sausage the outer diameter; for dots the dot diameter */
  w?: number
  /** optional SVG transform applied to the part */
  transform?: string
  /** fill opacity for the basic style (otic vesicle seen through the skin) */
  opacity?: number
}

export interface EmbryoModel {
  stage: Stage
  theiler: number
  viewBox: string
  parts: EmbryoPart[]
  /** outline width in viewBox units (about 1.3 px at the default insert size); feature lines are thinner */
  strokeWidth: number
}

const wrapSvg = (viewBox: string, sw: number, body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><g fill="none" stroke="${OUTLINE}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`

const withTransform = (p: EmbryoPart, inner: string): string => (p.transform ? `<g transform="${p.transform}">${inner}</g>` : inner)
const sw = (w: number | undefined, fallback?: number): string => (w !== undefined ? ` stroke-width="${w}"` : fallback !== undefined ? ` stroke-width="${fallback}"` : '')

const op = (p: EmbryoPart): string => (p.opacity !== undefined ? ` fill-opacity="${p.opacity}"` : '')

function basicPart(p: EmbryoPart): string {
  switch (p.draw) {
    case 'fill':
      return `<path d="${p.d}" fill="#PRIMARY"${sw(p.w)}${op(p)}/>`
    case 'stroke':
      return `<path d="${p.d}"${sw(p.w)}/>`
    case 'dots':
      return `<path d="${p.d}"${sw(p.w, 2)} stroke-linecap="round"/>`
    case 'sausage': {
      const w = p.w ?? 10
      return `<path d="${p.d}" stroke-width="${w}"/><path d="${p.d}" stroke="#PRIMARY" stroke-width="${w - 5}"/>`
    }
    case 'fill-secondary':
      return `<path d="${p.d}" fill="#SECONDARY"${sw(p.w, 2)}${op(p)}/>`
    case 'stroke-secondary':
      return `<path d="${p.d}" stroke="#SECONDARY"${sw(p.w)}/>`
    case 'stroke-white':
      return `<path d="${p.d}" stroke="#ffffff"${sw(p.w)}/>`
    case 'ring-secondary':
      return `<path d="${p.d}" fill="#ffffff" stroke="#SECONDARY"${sw(p.w, 2)}/>`
    case 'fill-white':
      return `<path d="${p.d}" fill="#ffffff"${sw(p.w, 2)}/>`
    case 'fill-dark':
      return `<path d="${p.d}" fill="${OUTLINE}" stroke-width="1"/>`
  }
}

/** Camera lucida: ink is #PRIMARY, interiors white, thin uniform lines, no colour. */
const LUCIDA = { outline: 1.1, feature: 0.9, dot: 1.2, toneSpacing: 1.4, toneSizes: [0.55, 0.85, 1.2] as [number, number, number] }

const dotPositions = (d: string): [number, number][] => [...d.matchAll(/M(-?[\d.]+)[ ,](-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])])

/**
 * Tonal stipple over the body (Carter 1954, Fig. 125): denser toward the
 * silhouette edge and in the creases against limbs, hands, feet and tail.
 */
function embryoTone(model: EmbryoModel): string {
  const body = model.parts.find((p) => p.tag === 'body')
  if (!body) return ''
  const poly = flattenPath(body.d, body.transform)[0]?.points
  if (!poly || poly.length < 3) return ''
  const k = model.strokeWidth / 2.5
  const spacing = model.strokeWidth * 1.15
  const reach = 4 * k
  const creases: { line: Polygon; hw: number; closed: boolean; box: [number, number, number, number] }[] = []
  for (const p of model.parts) {
    if (!['limb', 'hand', 'foot', 'tail', 'hernia', 'detail'].includes(p.tag)) continue
    for (const sub of flattenPath(p.d, p.transform, 4)) {
      const [bx0, by0, bx1, by1] = bbox([sub.points])
      const hw = p.draw === 'sausage' ? (p.w ?? 10) / 2 : 0
      const pad = hw + reach * 2.2
      const box: [number, number, number, number] = [bx0 - pad, by0 - pad, bx1 + pad, by1 + pad]
      if (p.draw === 'sausage') creases.push({ line: sub.points, hw, closed: false, box })
      else if (p.draw === 'fill' || p.draw === 'fill-white') creases.push({ line: sub.points, hw: 0, closed: true, box })
      else if (p.draw === 'stroke') creases.push({ line: sub.points, hw: 0, closed: false, box })
    }
  }
  const tone = (x: number, y: number): number => {
    const q: [number, number] = [x, y]
    const edge = Math.max(0, 1 - distToPolygon(q, poly) / (6 * k))
    let t = 0.06 + 0.7 * Math.pow(edge, 1.6)
    for (const c of creases) {
      if (x < c.box[0] || y < c.box[1] || x > c.box[2] || y > c.box[3]) continue
      let d: number
      if (c.closed) {
        if (pointInPolygon(q, c.line)) return 0
        d = distToPolygon(q, c.line)
      } else {
        d = distToPolyline(q, c.line) - c.hw
        if (d < 0) return 0
      }
      t += (c.hw || c.closed ? 0.75 : 0.5) * Math.exp(-Math.pow(d / reach, 2))
    }
    return Math.min(1, t)
  }
  return stippleField([poly], tone, { spacing, seed: hash(`embryo:${model.stage}`), sizes: [0.42, 0.62, 0.85].map((v) => v * model.strokeWidth) as [number, number, number] })
    .map((l) => `<path d="${l.d}" stroke-width="${l.width}" stroke-linecap="round"/>`)
    .join('')
}

function lucidaPart(p: EmbryoPart, stage: Stage, lw: number): string {
  const outline = lw * 0.65
  const feature = lw * 0.5
  switch (p.draw) {
    case 'fill':
      if (p.tag === 'body') return `<path d="${p.d}" fill="#ffffff" stroke="none"/>` // stroked after the tonal field
      return `<path d="${p.d}" fill="#ffffff" stroke-width="${outline}"/>`
    case 'fill-white':
    case 'ring-secondary':
      return `<path d="${p.d}" fill="#ffffff" stroke-width="${outline}"/>`
    case 'sausage': {
      const w = p.w ?? 10
      return `<path d="${p.d}" stroke-width="${w - 5 + 2 * LUCIDA.outline}"/><path d="${p.d}" stroke="#ffffff" stroke-width="${w - 5}"/>`
    }
    case 'fill-secondary': {
      // the pigmented eye is a ring with a pupil; the otic vesicle and pinna are outlined
      if (p.tag !== 'eye') return `<path d="${p.d}" fill="#ffffff" stroke-width="${feature}"/>`
      const c = circleOf(p.d)
      if (!c) return `<path d="${p.d}" fill="#PRIMARY" stroke-width="${feature}"/>`
      return `<path d="${p.d}" fill="#ffffff" stroke-width="${feature}"/><circle cx="${c.cx.toFixed(1)}" cy="${c.cy.toFixed(1)}" r="${(c.r * 0.45).toFixed(1)}" fill="#PRIMARY" stroke="none"/>`
    }
    case 'fill-dark':
      return `<path d="${p.d}" fill="#PRIMARY" stroke-width="${feature}"/>`
    case 'dots':
      if (p.tag === 'vibrissae' && stage >= 'E13.5') {
        const r = (p.w ?? LUCIDA.dot) * 0.6
        return dotPositions(p.d).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r.toFixed(2)}" fill="#ffffff" stroke-width="${Math.max(0.2, r * 0.5).toFixed(2)}"/>`).join('')
      }
      return `<path d="${p.d}" stroke-width="${p.w ?? LUCIDA.dot}" stroke-linecap="round"/>`
    case 'stroke':
    case 'stroke-secondary':
      return `<path d="${p.d}" stroke-width="${p.w ?? feature}"/>`
    case 'stroke-white':
      return `<path d="${p.d}" stroke="#ffffff"${sw(p.w, 1.5)}/>`
  }
}

/** Centre and radius when the path is the two-arc circle emitted by the embryo helpers. */
function circleOf(d: string): { cx: number; cy: number; r: number } | null {
  const m = /^M(-?[\d.]+) (-?[\d.]+)a(-?[\d.]+) (-?[\d.]+) 0 1 0 (-?[\d.]+) 0/i.exec(d.trim())
  if (!m) return null
  const x0 = Number(m[1])
  const y0 = Number(m[2])
  const rx = Number(m[3])
  const ry = Number(m[4])
  if (Math.abs(rx - ry) > 0.01) return null
  return { cx: x0 + rx, cy: y0, r: rx }
}

/** Realistic: gradient-shaded tissue with a soft shadow, organs showing through, glossy eye. */
function realisticPart(p: EmbryoPart, gradientId: string, lw: number): string {
  const w = p.w
  switch (p.draw) {
    case 'fill': {
      if (p.tag === 'body') {
        return (
          `<path d="${p.d}" fill="#000000" fill-opacity="0.1" stroke="none" transform="translate(1.5 2.5)"/>` +
          `<path d="${p.d}" fill="url(#${gradientId})" stroke="#PRIMARYD" stroke-width="${lw * 0.55}" stroke-opacity="0.7"/>`
        )
      }
      if (p.tag === 'hernia') return `<path d="${p.d}" fill="url(#${gradientId})" stroke="#PRIMARYD" stroke-width="0.7" stroke-opacity="0.6"/>`
      return `<path d="${p.d}" fill="url(#${gradientId})" stroke="#PRIMARYD" stroke-width="0.8" stroke-opacity="0.7"/>`
    }
    case 'sausage': {
      const ww = w ?? 10
      return (
        `<path d="${p.d}" stroke="#PRIMARYD" stroke-width="${ww}" stroke-opacity="0.85"/>` +
        `<path d="${p.d}" stroke="#PRIMARY" stroke-width="${ww - 2.4}"/>` +
        `<path d="${p.d}" stroke="#PRIMARYL" stroke-width="${Math.max(0.8, (ww - 5) * 0.4)}" stroke-opacity="0.55"/>`
      )
    }
    case 'stroke':
      if (p.tag === 'heart') return `<path d="${p.d}" fill="#c0392b" fill-opacity="0.2" stroke="#c0392b" stroke-width="1.1" stroke-opacity="0.35"/>`
      if (p.tag === 'somites') return `<path d="${p.d}" stroke="#PRIMARYD" stroke-width="1.1" stroke-opacity="0.5"/>`
      if (p.tag === 'whiskers') return `<path d="${p.d}" stroke="#1f2937" stroke-width="0.7" stroke-opacity="0.7"/>`
      if (p.tag === 'detail') return `<path d="${p.d}" stroke="#PRIMARYD" stroke-width="${(w ?? lw * 0.7).toFixed(2)}" stroke-opacity="0.6"/>`
      if (p.tag === 'hand' || p.tag === 'foot') return `<path d="${p.d}" stroke="#PRIMARYD" stroke-width="${w ?? 2}" stroke-opacity="0.75"/>`
      return `<path d="${p.d}" stroke="#PRIMARYD" stroke-width="${Math.max(0.7, (w ?? 2.5) * 0.45)}" stroke-opacity="0.6"/>`
    case 'stroke-secondary':
      return `<path d="${p.d}" stroke="#SECONDARYD" stroke-width="${Math.max(0.7, (w ?? 2.5) * 0.6)}" stroke-opacity="0.8"/>`
    case 'stroke-white':
      return `<path d="${p.d}" stroke="#ffffff" stroke-width="${w ?? 1.5}" stroke-opacity="0.9"/>`
    case 'dots':
      return `<path d="${p.d}" stroke="#PRIMARYD" stroke-width="${(w ?? 2) * 0.9}" stroke-opacity="0.6" stroke-linecap="round"/>`
    case 'fill-secondary': {
      if (p.tag === 'eye') {
        const c = circleOf(p.d)
        const gloss = c ? `<circle cx="${(c.cx - c.r * 0.3).toFixed(1)}" cy="${(c.cy - c.r * 0.3).toFixed(1)}" r="${(c.r * 0.32).toFixed(1)}" fill="#ffffff" fill-opacity="0.85" stroke="none"/>` : ''
        return `<path d="${p.d}" fill="#SECONDARY" stroke="#SECONDARYD" stroke-width="0.6"/>${gloss}`
      }
      return `<path d="${p.d}" fill="#SECONDARY" fill-opacity="${p.opacity ?? 0.6}" stroke="#PRIMARYD" stroke-width="0.6" stroke-opacity="0.6"/>`
    }
    case 'ring-secondary':
      return `<path d="${p.d}" fill="#ffffff" fill-opacity="0.7" stroke="#SECONDARY" stroke-width="1.2"/>`
    case 'fill-white':
      return `<path d="${p.d}" fill="#ffffff" stroke="#PRIMARYD" stroke-width="0.7" stroke-opacity="0.7"/>`
    case 'fill-dark':
      return `<path d="${p.d}" fill="#374151" stroke="#1f2937" stroke-width="0.5"/>`
  }
}

export function renderEmbryo(model: EmbryoModel, style: DrawingStyle): string {
  switch (style) {
    case 'basic':
      return wrapSvg(model.viewBox, model.strokeWidth, model.parts.map((p) => withTransform(p, basicPart(p))).join(''))
    case 'lucida': {
      const body = model.parts.find((p) => p.tag === 'body')
      const lw = model.strokeWidth
      const parts = model.parts.map((p) => withTransform(p, lucidaPart(p, model.stage, lw)))
      // tonal field goes right after the body fill, the body outline right after the field
      const i = model.parts.findIndex((p) => p.tag === 'body')
      if (body && i >= 0) parts.splice(i + 1, 0, embryoTone(model), withTransform(body, `<path d="${body.d}" stroke-width="${(lw * 0.65).toFixed(2)}"/>`))
      return wrapSvg(model.viewBox, lw * 0.65, parts.join('')).replace(`stroke="${OUTLINE}"`, 'stroke="#PRIMARY"')
    }
    case 'realistic': {
      const gid = `re-${model.stage.toLowerCase().replace('.', '-')}-body`
      const defs =
        `<defs><radialGradient id="${gid}" cx="0.45" cy="0.3" r="0.8">` +
        `<stop offset="0" stop-color="#PRIMARYL"/><stop offset="0.55" stop-color="#PRIMARY"/><stop offset="1" stop-color="#PRIMARYD"/>` +
        `</radialGradient></defs>`
      const body = model.parts.map((p) => withTransform(p, realisticPart(p, gid, model.strokeWidth))).join('')
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${model.viewBox}">${defs}<g fill="none" stroke="${OUTLINE}" stroke-width="${model.strokeWidth}" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`
    }
  }
}

/** Default palette per style for embryo items. */
export const EMBRYO_PALETTE: Record<DrawingStyle, { primary: string; secondary?: string }> = {
  basic: { primary: '#e8c9a0', secondary: '#374151' },
  lucida: { primary: OUTLINE },
  realistic: { primary: '#e9b99b', secondary: '#2b2b33' },
}
