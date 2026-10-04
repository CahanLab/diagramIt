/** Sentinel colours used while parsing so that recolourable regions can be tagged. */
export const PRIMARY_TOKEN = '#PRIMARY'
export const SECONDARY_TOKEN = '#SECONDARY'
export const PRIMARY_SENTINEL = '#010101'
export const SECONDARY_SENTINEL = '#020202'

/** Replace the #PRIMARY / #SECONDARY tokens (case-insensitive) with concrete colours. */
export function applyColors(svg: string, primary: string, secondary?: string): string {
  return svg
    .replace(/#primary\b/gi, primary)
    .replace(/#secondary\b/gi, secondary ?? primary)
}
