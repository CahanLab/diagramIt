/**
 * Mouse limb stage icon generator. Pure: LimbStage data in, SVG string out.
 * Spec: docs/superpowers/specs/2026-10-14-mouse-embryo-limb-icons-design.md
 */
import type { Element, LimbStage, LimbVersion, Nerve } from '../items/limbs/types'
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

const NERVE_WIDTH: Record<Nerve['width'], number> = { 1: 1.2, 2: 2, 3: 3 }

const n = (v: number): string => {
  const s = v.toFixed(1)
  return s.endsWith('.0') ? s.slice(0, -2) : s
}
const seg = (a: [number, number], b: [number, number]): string => `M${n(a[0])} ${n(a[1])}L${n(b[0])} ${n(b[1])}`

/** Band across the mid-diaphysis covering the middle 40 % of the element. */
function band(e: Element, colour: string): string {
  const dx = e.d[0] - e.p[0]
  const dy = e.d[1] - e.p[1]
  const mx = (e.p[0] + e.d[0]) / 2
  const my = (e.p[1] + e.d[1]) / 2
  const a: [number, number] = [mx - dx * 0.2, my - dy * 0.2]
  const b: [number, number] = [mx + dx * 0.2, my + dy * 0.2]
  return `<path d="${seg(a, b)}" stroke="${colour}" stroke-width="${n(e.r * 2)}" stroke-linecap="butt"/>`
}

function element(e: Element): string {
  const cls = `el ${e.name}${e.digit ? `-${e.digit}` : ''} ${e.state}`
  const line = seg(e.p, e.d)
  if (e.state === 'condensation') {
    return `<g class="${cls}"><path d="${line}" stroke="#SECONDARY" stroke-width="${n(e.r * 2)}" stroke-opacity="${LIMB_COLORS.condensationOpacity}"/></g>`
  }
  const parts = [
    `<path d="${line}" stroke-width="${n(e.r * 2 + 2.5)}"/>`,
    `<path d="${line}" stroke="#SECONDARY" stroke-width="${n(e.r * 2)}"/>`,
  ]
  if (e.state === 'sleeve') parts.push(band(e, LIMB_COLORS.sleeve))
  if (e.state === 'ossifying') parts.push(band(e, LIMB_COLORS.ossifying))
  return `<g class="${cls}">${parts.join('')}</g>`
}

function nerve(nv: Nerve): string {
  const w = NERVE_WIDTH[nv.width]
  return `<path d="${nv.path}" stroke-width="${n(w + 1.5)}"/><path d="${nv.path}" stroke="${LIMB_COLORS.nerve}" stroke-width="${n(w)}"/>`
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
  if (stage.aer) parts.push(`<path d="${stage.aer}" stroke="${LIMB_COLORS.aer}" stroke-width="3"/>`)
  for (const [x, y] of stage.hairPlacodes ?? []) {
    parts.push(`<circle cx="${n(x)}" cy="${n(y)}" r="1.2" fill="${OUTLINE}" fill-opacity="0.45" stroke="none"/>`)
  }
  if (stage.decor) parts.push(stage.decor)
  if (version !== 'outline') parts.push(...stage.elements.map(element))
  if (version === 'muscle') {
    for (const m of stage.muscles) parts.push(`<path d="${m.path}" fill="${LIMB_COLORS.muscle}" fill-opacity="${LIMB_COLORS.muscleOpacity}" stroke-width="1.2"/>`)
    for (const t of stage.tendons) parts.push(`<path d="${t.path}" stroke-width="4"/><path d="${t.path}" stroke="${LIMB_COLORS.tendon}" stroke-width="2.4"/>`)
  }
  if (version === 'nerves') parts.push(...stage.nerves.map(nerve))
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${stage.viewBox}"><g fill="none" stroke="${OUTLINE}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${parts.join('')}</g></svg>`
}

/** Default insert size: 70 px wide at 0.9 mm (E10.5 forelimb bud) to 140 px at 6 mm (E18.5). */
export function limbDefaultSize(stage: LimbStage): { width: number; height: number } {
  const [, , w, h] = stage.viewBox.split(' ').map(Number) as [number, number, number, number]
  const width = Math.round(Math.min(140, Math.max(70, 70 + (70 * (stage.lengthMm - 0.9)) / 5.1)))
  return { width, height: Math.round((width * h) / w) }
}
