/**
 * Camera lucida renderer for mouse limb stage icons: thin ink line, white
 * interior, open at the flank, skeleton as stipple whose density encodes
 * maturity, muscle as hatching, tendons as paired lines, nerves as solid ink
 * (after Grüneberg 1963, Fig. 28). Ink is #PRIMARY. Pure.
 * Spec: docs/superpowers/specs/2026-10-14-drawing-styles-design.md
 */
import type { Element, LimbStage, LimbVersion, Muscle, Nerve } from '../items/limbs/types'

export const LUCIDA = {
  outline: 1.1,
  feature: 0.9,
  dot: 0.9,
  hatch: 0.7,
  hatchSpacing: 2.2,
  spacing: { condensation: 2.6, cartilage: 1.4, band: 0.9 },
  nerveWidth: { 1: 0.8, 2: 1.2, 3: 1.8 } as Record<Nerve['width'], number>,
} as const

const n = (v: number): string => {
  const s = v.toFixed(1)
  return s.endsWith('.0') ? s.slice(0, -2) : s
}

/** Deterministic PRNG (mulberry32). */
function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/**
 * Stipple inside a capsule from p to d with half-width r. `falloff` thins the
 * dots toward the edge and the ends (precartilaginous condensation); `inset`
 * keeps dots away from an outline. Returns path data of zero-length segments.
 */
export function stippleCapsule(e: Element, spacing: number, falloff: boolean, random: () => number, inset = 0): string {
  const dx = e.d[0] - e.p[0]
  const dy = e.d[1] - e.p[1]
  const L = Math.hypot(dx, dy) || 1
  const u: [number, number] = [dx / L, dy / L]
  const v: [number, number] = [u[1], -u[0]]
  const r = Math.max(0.4, e.r - inset)
  const out: string[] = []
  for (let s = -r; s <= L + r; s += spacing) {
    for (let t = -r; t <= r; t += spacing) {
      const ss = s + (random() - 0.5) * spacing * 0.9
      const tt = t + (random() - 0.5) * spacing * 0.9
      let inside: boolean
      let endFactor = 0
      if (ss < 0) {
        inside = Math.hypot(ss, tt) < r
        endFactor = Math.min(1, -ss / r)
      } else if (ss > L) {
        inside = Math.hypot(ss - L, tt) < r
        endFactor = Math.min(1, (ss - L) / r)
      } else inside = Math.abs(tt) < r
      if (!inside) continue
      if (falloff) {
        const edge = Math.min(1, Math.abs(tt) / r)
        const keep = (0.25 + 0.75 * (1 - edge * edge)) * (1 - 0.7 * endFactor)
        if (random() > keep) continue
      }
      const x = e.p[0] + u[0] * ss + v[0] * tt
      const y = e.p[1] + u[1] * ss + v[1] * tt
      out.push(`M${n(x)} ${n(y)}h0.01`)
    }
  }
  return out.join('')
}

/** Parallel hatch lines across an ellipse, clipped analytically. Returns path data. */
export function hatchEllipse(el: NonNullable<Muscle['ellipse']>, spacing: number, angleOffset = 45): string {
  const a = (el.angle * Math.PI) / 180
  const u: [number, number] = [Math.cos(a), Math.sin(a)]
  const v: [number, number] = [-Math.sin(a), Math.cos(a)]
  const h = (angleOffset * Math.PI) / 180
  // hatch direction and its perpendicular in the ellipse's local frame
  const hd: [number, number] = [Math.cos(h), Math.sin(h)]
  const pd: [number, number] = [-Math.sin(h), Math.cos(h)]
  const R = Math.max(el.rx, el.ry)
  const out: string[] = []
  for (let k = -R; k <= R; k += spacing) {
    // line: P(l) = k*pd + l*hd ; inside ellipse when (x/rx)^2 + (y/ry)^2 <= 1
    const A = (hd[0] / el.rx) ** 2 + (hd[1] / el.ry) ** 2
    const B = 2 * ((k * pd[0] * hd[0]) / el.rx ** 2 + (k * pd[1] * hd[1]) / el.ry ** 2)
    const C = (k * pd[0] / el.rx) ** 2 + (k * pd[1] / el.ry) ** 2 - 1
    const disc = B * B - 4 * A * C
    if (disc <= 0) continue
    const l1 = (-B - Math.sqrt(disc)) / (2 * A)
    const l2 = (-B + Math.sqrt(disc)) / (2 * A)
    const pt = (l: number): [number, number] => {
      const lx = k * pd[0] + l * hd[0]
      const ly = k * pd[1] + l * hd[1]
      return [el.c[0] + u[0] * lx + v[0] * ly, el.c[1] + u[1] * lx + v[1] * ly]
    }
    const p1 = pt(l1 + 0.3)
    const p2 = pt(l2 - 0.3)
    if (Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) < 0.8) continue
    out.push(`M${n(p1[0])} ${n(p1[1])}L${n(p2[0])} ${n(p2[1])}`)
  }
  return out.join('')
}

function capsuleOutline(e: Element, r = e.r): string {
  const dx = e.d[0] - e.p[0]
  const dy = e.d[1] - e.p[1]
  const L = Math.hypot(dx, dy) || 1
  const vx = (dy / L) * r
  const vy = (-dx / L) * r
  const a1 = [e.p[0] + vx, e.p[1] + vy]
  const b1 = [e.d[0] + vx, e.d[1] + vy]
  const b2 = [e.d[0] - vx, e.d[1] - vy]
  const a2 = [e.p[0] - vx, e.p[1] - vy]
  return `M${n(a1[0]!)} ${n(a1[1]!)}L${n(b1[0]!)} ${n(b1[1]!)}A${n(r)} ${n(r)} 0 0 1 ${n(b2[0]!)} ${n(b2[1]!)}L${n(a2[0]!)} ${n(a2[1]!)}A${n(r)} ${n(r)} 0 0 1 ${n(a1[0]!)} ${n(a1[1]!)}z`
}

/** Mid-diaphysis band (middle 40 %) as a sub-capsule element. */
function bandOf(e: Element): Element {
  const dx = e.d[0] - e.p[0]
  const dy = e.d[1] - e.p[1]
  const mx = (e.p[0] + e.d[0]) / 2
  const my = (e.p[1] + e.d[1]) / 2
  return { ...e, p: [mx - dx * 0.2, my - dy * 0.2], d: [mx + dx * 0.2, my + dy * 0.2] }
}

function element(e: Element, seed: string): string {
  const random = rng(hash(seed))
  const dots = (d: string): string => (d ? `<path d="${d}" stroke-width="${LUCIDA.dot}" stroke-linecap="round"/>` : '')
  const cls = `el ${e.name}${e.digit ? `-${e.digit}` : ''} ${e.state}`
  switch (e.state) {
    case 'condensation':
      return `<g class="${cls}">${dots(stippleCapsule(e, LUCIDA.spacing.condensation, true, random))}</g>`
    case 'cartilage':
      return `<g class="${cls}"><path d="${capsuleOutline(e)}" stroke-width="0.8"/>${dots(stippleCapsule(e, LUCIDA.spacing.cartilage, false, random, 0.9))}</g>`
    case 'sleeve': {
      const band = bandOf(e)
      return `<g class="${cls}"><path d="${capsuleOutline(e)}" stroke-width="0.8"/>${dots(stippleCapsule(e, LUCIDA.spacing.cartilage, false, random, 0.9))}<path d="${capsuleOutline(band, e.r + 0.6)}" fill="#ffffff" stroke-width="0.8"/></g>`
    }
    case 'ossifying': {
      const band = bandOf(e)
      return `<g class="${cls}"><path d="${capsuleOutline(e)}" stroke-width="0.8"/>${dots(stippleCapsule(e, LUCIDA.spacing.cartilage, false, random, 0.9))}<path d="${capsuleOutline(band, e.r + 0.6)}" fill="#ffffff" stroke-width="0.8"/>${dots(stippleCapsule(band, LUCIDA.spacing.band, false, random, 0.5))}</g>`
    }
  }
}

function muscle(m: Muscle): string {
  if (m.ellipse) return `<path d="${m.path}" stroke-width="${LUCIDA.feature}"/><path d="${hatchEllipse(m.ellipse, LUCIDA.hatchSpacing)}" stroke-width="${LUCIDA.hatch}"/>`
  return `<path d="${m.path}" stroke-width="${LUCIDA.feature}"/>`
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

export function limbLucidaSvg(stage: LimbStage, version: LimbVersion): string {
  const parts: string[] = [
    `<path d="${stage.outline}" fill="#ffffff" stroke="none"/>`,
    `<path d="${stage.outlineOpen}" stroke-width="${LUCIDA.outline}"/>`,
    flankExtensions(stage),
  ]
  if (stage.aer) parts.push(`<path d="${stage.aer}" stroke-width="1.7" stroke-opacity="0.8"/>`)
  for (const [x, y] of stage.hairPlacodes ?? []) parts.push(`<circle cx="${n(x)}" cy="${n(y)}" r="1" stroke-width="0.6"/>`)
  if (stage.decorLucida) parts.push(stage.decorLucida)
  if (version !== 'outline') parts.push(...stage.elements.map((e, i) => element(e, `${stage.limb}:${stage.stage}:${i}`)))
  if (version === 'muscle') {
    parts.push(...stage.muscles.map(muscle))
    for (const t of stage.tendons) parts.push(`<path d="${t.path}" stroke-width="3.2"/><path d="${t.path}" stroke="#ffffff" stroke-width="1.6"/>`)
  }
  if (version === 'nerves') for (const nv of stage.nerves) parts.push(`<path d="${nv.path}" stroke-width="${LUCIDA.nerveWidth[nv.width]}"/>`)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${stage.viewBox}"><g fill="none" stroke="#PRIMARY" stroke-width="${LUCIDA.outline}" stroke-linejoin="round" stroke-linecap="round">${parts.join('')}</g></svg>`
}
