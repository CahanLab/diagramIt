import type { Canvas } from 'fabric'
import { isPage } from '../canvas/commands'
import { sanitizeCustomSvg, type SanitizedSvg } from './svg'

/**
 * Serialise the current selection as a standalone SVG whose viewBox starts at
 * (0,0). Uses Fabric's own SVG export so text, strokes and transforms match
 * what is on the canvas. Returns null when nothing (or only the page) is selected.
 */
export function selectionToSvg(canvas: Canvas): SanitizedSvg | null {
  const active = canvas.getActiveObject()
  if (!active || isPage(active)) return null
  const { left, top, width, height } = active.getBoundingRect()
  if (!(width > 0 && height > 0)) return null
  const w = Math.ceil(width)
  const h = Math.ceil(height)
  const body = active.toSVG()
  const r = (n: number) => Math.round(n * 100) / 100
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><g transform="translate(${r(-left)} ${r(-top)})">${body}</g></svg>`
  return sanitizeCustomSvg(svg)
}
