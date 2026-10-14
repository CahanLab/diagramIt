/**
 * Recolourable-region tokens. Icons use literal `#PRIMARY` / `#SECONDARY` and,
 * for shaded (realistic) drawings, derived tints `#PRIMARYL` / `#PRIMARYD`
 * (lighter / darker) and `#SECONDARYL` / `#SECONDARYD`. Every token is
 * substituted by applyColors; at insert time they are first replaced by
 * sentinel colours so the parsed Fabric objects can be tagged with a role.
 */
export const PRIMARY_TOKEN = '#PRIMARY'
export const SECONDARY_TOKEN = '#SECONDARY'
export const PRIMARY_SENTINEL = '#010101'
export const SECONDARY_SENTINEL = '#020202'

export type ColorRole = 'primary' | 'secondary'
export type ColorVariant = 'base' | 'light' | 'dark'

/** Sentinel colour for every role/variant pair (distinct near-black values no icon uses on purpose). */
export const SENTINELS: Record<ColorRole, Record<ColorVariant, string>> = {
  primary: { base: PRIMARY_SENTINEL, light: '#010102', dark: '#010103' },
  secondary: { base: SECONDARY_SENTINEL, light: '#020203', dark: '#020204' },
}

/** Reverse lookup from a sentinel hex (lower case) to its role and variant. */
export function roleOfSentinel(hex: string): { role: ColorRole; variant: ColorVariant } | null {
  const h = hex.toLowerCase()
  for (const role of ['primary', 'secondary'] as const) {
    for (const variant of ['base', 'light', 'dark'] as const) {
      if (SENTINELS[role][variant] === h) return { role, variant }
    }
  }
  return null
}

const clamp = (v: number): number => Math.max(0, Math.min(255, Math.round(v)))
function parseHex(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const v = parseInt(m[1]!, 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}
const toHex = (r: number, g: number, b: number): string => '#' + [r, g, b].map((c) => clamp(c).toString(16).padStart(2, '0')).join('')

/** Mix a colour toward white (amount > 0) or black (amount < 0); amount in [-1, 1]. Non-hex input is returned unchanged. */
export function tint(hex: string, amount: number): string {
  const rgb = parseHex(hex)
  if (!rgb) return hex
  const target = amount >= 0 ? 255 : 0
  const a = Math.abs(amount)
  return toHex(rgb[0] + (target - rgb[0]) * a, rgb[1] + (target - rgb[1]) * a, rgb[2] + (target - rgb[2]) * a)
}

export const LIGHT_AMOUNT = 0.38
export const DARK_AMOUNT = -0.32

/** The concrete colour for a role and variant given the chosen base colours. */
export function colorFor(role: ColorRole, variant: ColorVariant, primary: string, secondary?: string): string {
  const base = role === 'primary' ? primary : (secondary ?? primary)
  return variant === 'base' ? base : tint(base, variant === 'light' ? LIGHT_AMOUNT : DARK_AMOUNT)
}

/** Replace the colour tokens (case-insensitive) with concrete colours. Tint tokens must be replaced before the plain ones. */
export function applyColors(svg: string, primary: string, secondary?: string): string {
  const s = secondary ?? primary
  return svg
    .replace(/#primaryl\b/gi, tint(primary, LIGHT_AMOUNT))
    .replace(/#primaryd\b/gi, tint(primary, DARK_AMOUNT))
    .replace(/#secondaryl\b/gi, tint(s, LIGHT_AMOUNT))
    .replace(/#secondaryd\b/gi, tint(s, DARK_AMOUNT))
    .replace(/#primary\b/gi, primary)
    .replace(/#secondary\b/gi, s)
}

/** Replace every token with its sentinel so parsed objects can be tagged. */
export function applySentinels(svg: string): string {
  return svg
    .replace(/#primaryl\b/gi, SENTINELS.primary.light)
    .replace(/#primaryd\b/gi, SENTINELS.primary.dark)
    .replace(/#secondaryl\b/gi, SENTINELS.secondary.light)
    .replace(/#secondaryd\b/gi, SENTINELS.secondary.dark)
    .replace(/#primary\b/gi, SENTINELS.primary.base)
    .replace(/#secondary\b/gi, SENTINELS.secondary.base)
}
