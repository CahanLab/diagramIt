/**
 * Realistic ("dissecting microscope") renderer for mouse limb stage icons:
 * gradient-shaded translucent tissue with a dark rim and specular sheen,
 * condensations as soft glows, cartilage as translucent rods with an axial
 * highlight, muscle with sheen, pearly tendons, nerves with a dark core.
 * Uses the tint tokens #PRIMARYL/#PRIMARYD/#SECONDARYL/#SECONDARYD. Pure.
 * Spec: docs/superpowers/specs/2026-10-14-drawing-styles-design.md
 */
import type { Element, LimbStage, LimbVersion, Muscle, Nerve } from '../items/limbs/types'
import { blob } from '../items/limbs/geometry'

export const REALISTIC = {
  muscle: '#b3463b',
  muscleEdge: '#7a2a23',
  tendon: '#ded6c8',
  tendonCore: '#ffffff',
  nerve: '#e8c45c',
  nerveCore: '#7d5f16',
  bone: '#f3e9d2',
  boneEdge: '#cdbb94',
  ossifying: '#c0392b',
  ossifyingCore: '#e8857a',
  nerveWidth: { 1: 1.2, 2: 2, 3: 3 } as Record<Nerve['width'], number>,
} as const

const n = (v: number): string => {
  const s = v.toFixed(1)
  return s.endsWith('.0') ? s.slice(0, -2) : s
}
const seg = (a: [number, number], b: [number, number]): string => `M${n(a[0])} ${n(a[1])}L${n(b[0])} ${n(b[1])}`

function frame(e: Element): { u: [number, number]; v: [number, number]; L: number } {
  const dx = e.d[0] - e.p[0]
  const dy = e.d[1] - e.p[1]
  const L = Math.hypot(dx, dy) || 1
  return { u: [dx / L, dy / L], v: [dy / L, -dx / L], L }
}
/** The element's axis shifted toward the anterior (upper) side by k and shortened at both ends by s. */
function shifted(e: Element, k: number, s = 0): [[number, number], [number, number]] {
  const { u, v } = frame(e)
  return [
    [e.p[0] + v[0] * k + u[0] * s, e.p[1] + v[1] * k + u[1] * s],
    [e.d[0] + v[0] * k - u[0] * s, e.d[1] + v[1] * k - u[1] * s],
  ]
}
function bandOf(e: Element): Element {
  const dx = e.d[0] - e.p[0]
  const dy = e.d[1] - e.p[1]
  const mx = (e.p[0] + e.d[0]) / 2
  const my = (e.p[1] + e.d[1]) / 2
  return { ...e, p: [mx - dx * 0.2, my - dy * 0.2], d: [mx + dx * 0.2, my + dy * 0.2] }
}

function element(e: Element): string {
  const cls = `el ${e.name}${e.digit ? `-${e.digit}` : ''} ${e.state}`
  const axis = seg(e.p, e.d)
  const r = e.r
  if (e.state === 'condensation') {
    const [a, b] = shifted(e, -r * 0.25, r * 0.2)
    return (
      `<g class="${cls}">` +
      `<path d="${axis}" stroke="#SECONDARY" stroke-width="${n(r * 2 + 3)}" stroke-opacity="0.16"/>` +
      `<path d="${axis}" stroke="#SECONDARY" stroke-width="${n(r * 2 + 0.5)}" stroke-opacity="0.3"/>` +
      `<path d="${seg(a, b)}" stroke="#SECONDARYL" stroke-width="${n(r * 0.9)}" stroke-opacity="0.4"/>` +
      `</g>`
    )
  }
  const [ha, hb] = shifted(e, -r * 0.32, r * 0.35)
  const parts = [
    `<path d="${axis}" stroke="#SECONDARYD" stroke-width="${n(r * 2 + 1.2)}" stroke-opacity="0.85"/>`,
    `<path d="${axis}" stroke="#SECONDARY" stroke-width="${n(r * 2)}" stroke-opacity="0.95"/>`,
    `<path d="${seg(ha, hb)}" stroke="#SECONDARYL" stroke-width="${n(Math.max(0.6, r * 0.6))}" stroke-opacity="0.75"/>`,
  ]
  if (e.state === 'sleeve' || e.state === 'ossifying') {
    const band = bandOf(e)
    const bandAxis = seg(band.p, band.d)
    const [ba, bb] = shifted(band, -r * 0.3)
    if (e.state === 'sleeve') {
      parts.push(
        `<path d="${bandAxis}" stroke="${REALISTIC.boneEdge}" stroke-width="${n(r * 2 + 1.2)}" stroke-linecap="butt"/>`,
        `<path d="${bandAxis}" stroke="${REALISTIC.bone}" stroke-width="${n(r * 2)}" stroke-linecap="butt"/>`,
        `<path d="${seg(ba, bb)}" stroke="#ffffff" stroke-width="${n(Math.max(0.5, r * 0.5))}" stroke-opacity="0.7" stroke-linecap="butt"/>`,
      )
    } else {
      parts.push(
        `<path d="${bandAxis}" stroke="${REALISTIC.ossifying}" stroke-width="${n(r * 2 + 0.6)}" stroke-linecap="butt"/>`,
        `<path d="${seg(ba, bb)}" stroke="${REALISTIC.ossifyingCore}" stroke-width="${n(Math.max(0.6, r * 0.7))}" stroke-opacity="0.85" stroke-linecap="butt"/>`,
      )
    }
  }
  return `<g class="${cls}">${parts.join('')}</g>`
}

function muscle(m: Muscle): string {
  const base = `<path d="${m.path}" fill="${REALISTIC.muscle}" fill-opacity="0.92" stroke="${REALISTIC.muscleEdge}" stroke-width="0.6" stroke-opacity="0.8"/>`
  if (!m.ellipse) return base
  const { c, rx, ry, angle } = m.ellipse
  const a = (angle * Math.PI) / 180
  const hc: [number, number] = [c[0] - Math.sin(a) * ry * 0.3, c[1] + Math.cos(a) * ry * 0.3 * -1]
  return base + `<path d="${blob(hc, rx * 0.55, ry * 0.3, angle)}" fill="#ffffff" fill-opacity="0.22" stroke="none"/>`
}

function nerve(nv: Nerve): string {
  const w = REALISTIC.nerveWidth[nv.width]
  return `<path d="${nv.path}" stroke="${REALISTIC.nerve}" stroke-width="${n(w + 1)}" stroke-opacity="0.95"/><path d="${nv.path}" stroke="${REALISTIC.nerveCore}" stroke-width="${n(Math.max(0.5, w * 0.4))}" stroke-opacity="0.75"/>`
}

/** Specular sheen along the dorsal side of a segment. */
function sheen(from: [number, number], to: [number, number], width: number, opacity: number): string {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const len = Math.hypot(dx, dy) || 1
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI
  const nx = dy / len
  const ny = -dx / len
  const c: [number, number] = [(from[0] + to[0]) / 2 + nx * width * 0.42, (from[1] + to[1]) / 2 + ny * width * 0.42]
  return `<path d="${blob(c, len * 0.3, width * 0.16, angle)}" fill="#ffffff" fill-opacity="${opacity}" stroke="none"/>`
}

export function limbRealisticSvg(stage: LimbStage, version: LimbVersion): string {
  const id = `rl-${stage.limb[0]}-${stage.stage.toLowerCase().replace('.', '-')}-${version.slice(0, 2)}`
  const defs =
    `<defs><radialGradient id="${id}-body" cx="0.42" cy="0.3" r="0.85">` +
    `<stop offset="0" stop-color="#PRIMARYL"/><stop offset="0.5" stop-color="#PRIMARY"/><stop offset="1" stop-color="#PRIMARYD"/>` +
    `</radialGradient></defs>`
  const lm = stage.landmarks
  const parts: string[] = [
    `<path d="${stage.outline}" fill="#000000" fill-opacity="0.1" stroke="none" transform="translate(1.2 2)"/>`,
    `<path d="${stage.outline}" fill="url(#${id}-body)" stroke="#PRIMARYD" stroke-width="0.7" stroke-opacity="0.6"/>`,
    sheen(lm.shoulder, lm.elbow, lm.stylopodWidth, 0.3),
    sheen(lm.elbow, lm.wrist, lm.zeugopodWidth, 0.22),
  ]
  if (stage.aer) parts.push(`<path d="${stage.aer}" stroke="#PRIMARYD" stroke-width="2.2" stroke-opacity="0.45"/><path d="${stage.aer}" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.6"/>`)
  for (const [x, y] of stage.hairPlacodes ?? []) parts.push(`<circle cx="${n(x)}" cy="${n(y)}" r="1.3" fill="#PRIMARYD" fill-opacity="0.35" stroke="none"/>`)
  if (stage.decor) parts.push(stage.decor)
  if (version !== 'outline') parts.push(...stage.elements.map(element))
  if (version === 'skeleton') for (const v of stage.vessels ?? []) parts.push(`<path d="${v.path}" stroke="#b03a2e" stroke-width="${n(v.width)}" stroke-opacity="0.55"${v.dash ? ` stroke-dasharray="${v.dash}"` : ''}/>`)
  if (version === 'muscle') {
    parts.push(...stage.muscles.map(muscle))
    for (const t of stage.tendons) parts.push(`<path d="${t.path}" stroke="${REALISTIC.tendon}" stroke-width="3.2" stroke-opacity="0.9"/><path d="${t.path}" stroke="${REALISTIC.tendonCore}" stroke-width="1.3" stroke-opacity="0.85"/>`)
  }
  if (version === 'nerves') parts.push(...stage.nerves.map(nerve))
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${stage.viewBox}">${defs}<g fill="none" stroke="#1f2937" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${parts.join('')}</g></svg>`
}
