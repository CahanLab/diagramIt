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

export type EmbryoPartTag =
  | 'body' | 'limb' | 'hand' | 'foot' | 'tail'
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
const LUCIDA = { outline: 1.1, feature: 0.9, dot: 1.2 }

function lucidaPart(p: EmbryoPart): string {
  switch (p.draw) {
    case 'fill':
    case 'fill-white':
    case 'ring-secondary':
      return `<path d="${p.d}" fill="#ffffff" stroke-width="${LUCIDA.outline}"/>`
    case 'sausage': {
      const w = p.w ?? 10
      return `<path d="${p.d}" stroke-width="${w - 5 + 2 * LUCIDA.outline}"/><path d="${p.d}" stroke="#ffffff" stroke-width="${w - 5}"/>`
    }
    case 'fill-secondary':
      // the pigmented eye is solid ink; the otic vesicle and pinna are outlined
      return p.tag === 'eye'
        ? `<path d="${p.d}" fill="#PRIMARY" stroke-width="${LUCIDA.feature}"/>`
        : `<path d="${p.d}" fill="#ffffff" stroke-width="${LUCIDA.feature}"/>`
    case 'fill-dark':
      return `<path d="${p.d}" fill="#PRIMARY" stroke-width="${LUCIDA.feature}"/>`
    case 'dots':
      return `<path d="${p.d}" stroke-width="${LUCIDA.dot}" stroke-linecap="round"/>`
    case 'stroke':
    case 'stroke-secondary':
      return `<path d="${p.d}" stroke-width="${LUCIDA.feature}"/>`
    case 'stroke-white':
      return `<path d="${p.d}" stroke="#ffffff"${sw(p.w, 1.5)}/>`
  }
}

export function renderEmbryo(model: EmbryoModel, style: DrawingStyle): string {
  switch (style) {
    case 'basic':
      return wrapSvg(model.viewBox, 2.5, model.parts.map((p) => withTransform(p, basicPart(p))).join(''))
    case 'lucida':
      return wrapSvg(model.viewBox, LUCIDA.outline, model.parts.map((p) => withTransform(p, lucidaPart(p))).join('')).replace(`stroke="${OUTLINE}"`, 'stroke="#PRIMARY"')
    case 'realistic':
      // Phase 2 of the spec; until then the basic drawing stands in.
      return renderEmbryo(model, 'basic')
  }
}

/** Default palette per style for embryo items. */
export const EMBRYO_PALETTE: Record<DrawingStyle, { primary: string; secondary?: string }> = {
  basic: { primary: '#e8c9a0', secondary: '#374151' },
  lucida: { primary: OUTLINE },
  realistic: { primary: '#e8c9a0', secondary: '#374151' },
}
