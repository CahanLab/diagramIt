/**
 * Mouse limb stage icon generator (basic style). Pure: LimbStage data in, SVG string out.
 * Thin outline, cartilage elements drawn with their contour, muscle groups as filled
 * shapes, the apical ectodermal ridge as a crescent that tapers into the ectoderm.
 * Spec: docs/superpowers/specs/2026-10-14-mouse-embryo-limb-icons-design.md
 */
import type { Element, LimbStage, LimbVersion, Nerve } from '../items/limbs/types'
import { diaphysisBand } from '../items/limbs/build'
import { polygon } from '../items/limbs/geometry'
import { OUTLINE } from '../types'

export const LIMB_COLORS = {
  condensationOpacity: 0.4,
  sleeve: '#f3e9d2',
  ossifying: '#c0392b',
  muscle: '#b84a3f',
  muscleOpacity: 0.85,
  tendon: '#f5efe0',
  nerve: '#d9a400',
  aer: '#c9a57c',
} as const

/** Line widths in viewBox units (icons are about 100 units long). */
export const BASIC = { outline: 1.2, bone: 0.55, muscle: 0.5, feature: 0.7 } as const

const NERVE_WIDTH: Record<Nerve['width'], number> = { 1: 1, 2: 1.5, 3: 2.2 }

const n = (v: number): string => {
  const s = v.toFixed(1)
  return s.endsWith('.0') ? s.slice(0, -2) : s
}

function element(e: Element): string {
  const cls = `el ${e.name}${e.digit ? `-${e.digit}` : ''} ${e.state}`
  if (e.state === 'condensation') {
    // a blastema has no sharp edge: a soft halo around a denser core
    return (
      `<g class="${cls}">` +
      `<path d="${e.shape}" fill="#SECONDARY" fill-opacity="${LIMB_COLORS.condensationOpacity * 0.45}" stroke="#SECONDARY" stroke-width="${n(e.r * 0.9)}" stroke-opacity="0.12"/>` +
      `<path d="${e.shape}" fill="#SECONDARY" fill-opacity="${LIMB_COLORS.condensationOpacity}" stroke="none"/>` +
      `</g>`
    )
  }
  const parts = [`<path d="${e.shape}" fill="#SECONDARY" stroke-width="${BASIC.bone}"/>`]
  if (e.state === 'sleeve' || e.state === 'ossifying') {
    const band = diaphysisBand(e)
    if (band.length > 2) parts.push(`<path d="${polygon(band)}" fill="${e.state === 'sleeve' ? LIMB_COLORS.sleeve : LIMB_COLORS.ossifying}" stroke-width="${BASIC.bone}"/>`)
  }
  return `<g class="${cls}">${parts.join('')}</g>`
}

function nerve(nv: Nerve): string {
  const w = NERVE_WIDTH[nv.width]
  return `<path d="${nv.path}" stroke-width="${n(w + 1)}"/><path d="${nv.path}" stroke="${LIMB_COLORS.nerve}" stroke-width="${n(w)}"/>`
}

export function availableVersions(stage: LimbStage): LimbVersion[] {
  const out: LimbVersion[] = ['outline']
  if (stage.elements.length) out.push('skeleton')
  if (stage.muscles.length || stage.tendons.length) out.push('muscle')
  if (stage.nerves.length) out.push('nerves')
  return out
}

export function limbSvg(stage: LimbStage, version: LimbVersion): string {
  const parts: string[] = [`<path d="${stage.outline}" fill="#PRIMARY"/>`]
  if (stage.aerBand) parts.push(`<path d="${stage.aerBand}" fill="${LIMB_COLORS.aer}" stroke="none"/>`)
  else if (stage.aer) parts.push(`<path d="${stage.aer}" stroke="${LIMB_COLORS.aer}" stroke-width="2"/>`)
  for (const [x, y] of stage.hairPlacodes ?? []) {
    parts.push(`<circle cx="${n(x)}" cy="${n(y)}" r="1.1" fill="${OUTLINE}" fill-opacity="0.45" stroke="none"/>`)
  }
  if (stage.decor) parts.push(stage.decor)
  if (version !== 'outline') parts.push(...stage.elements.map(element))
  if (version === 'muscle') {
    for (const m of stage.muscles) parts.push(`<path d="${m.path}" fill="${LIMB_COLORS.muscle}" fill-opacity="${LIMB_COLORS.muscleOpacity}" stroke-width="${BASIC.muscle}"/>`)
    for (const t of stage.tendons) parts.push(`<path d="${t.path}" stroke-width="3"/><path d="${t.path}" stroke="${LIMB_COLORS.tendon}" stroke-width="1.8"/>`)
  }
  if (version === 'nerves') parts.push(...stage.nerves.map(nerve))
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${stage.viewBox}"><g fill="none" stroke="${OUTLINE}" stroke-width="${BASIC.outline}" stroke-linejoin="round" stroke-linecap="round">${parts.join('')}</g></svg>`
}

/** Default insert size: 70 px wide at 0.9 mm (E10.5 forelimb bud) to 140 px at 6 mm (E18.5). */
export function limbDefaultSize(stage: LimbStage): { width: number; height: number } {
  const [, , w, h] = stage.viewBox.split(' ').map(Number) as [number, number, number, number]
  const width = Math.round(Math.min(140, Math.max(70, 70 + (70 * (stage.lengthMm - 0.9)) / 5.1)))
  return { width, height: Math.round((width * h) / w) }
}
