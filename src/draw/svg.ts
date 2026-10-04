import { applyColors } from '../library/color'
import { findItem } from '../library/registry'
import { arrowHead, shortenEnd } from '../canvas/arrows'
import { INK, type Layout } from './types'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Convert a layout to standalone SVG markup (used for live previews in dialogs). */
export function layoutToSvg(layout: Layout, font: string): string {
  const parts: string[] = []
  for (const c of layout.cmds) {
    const op = c.opacity !== undefined && c.opacity < 1 ? ` opacity="${c.opacity}"` : ''
    switch (c.t) {
      case 'line': {
        const end = c.arrow ? shortenEnd(c.x1, c.y1, c.x2, c.y2, c.width * 3) : { x: c.x2, y: c.y2 }
        parts.push(`<line x1="${c.x1}" y1="${c.y1}" x2="${end.x}" y2="${end.y}" stroke="${c.stroke}" stroke-width="${c.width}" stroke-linecap="round"${c.dash ? ` stroke-dasharray="${c.dash.join(' ')}"` : ''}${op}/>`)
        if (c.arrow) {
          const [t, a, b] = arrowHead(c.x1, c.y1, c.x2, c.y2, c.width * 5)
          parts.push(`<polygon points="${t.x},${t.y} ${a.x},${a.y} ${b.x},${b.y}" fill="${c.stroke}"${op}/>`)
        }
        break
      }
      case 'rect':
        parts.push(`<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="${c.rx ?? 0}" fill="${c.fill}" stroke="${c.stroke ?? 'none'}" stroke-width="${c.strokeWidth ?? 1}"${op}/>`)
        break
      case 'circle':
        parts.push(`<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="${c.fill}" stroke="${c.stroke ?? 'none'}" stroke-width="${c.strokeWidth ?? 1}"${op}/>`)
        break
      case 'path': {
        parts.push(`<path d="${c.d}" fill="${c.fill ?? 'none'}" stroke="${c.stroke}" stroke-width="${c.width}" stroke-linecap="round" stroke-linejoin="round"${c.dash ? ` stroke-dasharray="${c.dash.join(' ')}"` : ''}${op}/>`)
        if (c.arrowEnd) {
          const [t, a, b] = arrowHead(c.arrowEnd.fromX, c.arrowEnd.fromY, c.arrowEnd.x, c.arrowEnd.y, c.width * 4)
          parts.push(`<polygon points="${t.x},${t.y} ${a.x},${a.y} ${b.x},${b.y}" fill="${c.stroke}"${op}/>`)
        }
        break
      }
      case 'text': {
        const anchor = c.align === 'center' ? 'middle' : c.align === 'right' ? 'end' : 'start'
        const lines = c.text.split('\n')
        const lineH = c.size * 1.3
        const y0 = c.baseline === 'middle' ? c.y - ((lines.length - 1) * lineH) / 2 : c.y + c.size * 0.9
        const baseline = c.baseline === 'middle' ? 'central' : 'auto'
        const style = `font-family="${esc(font)}" font-size="${c.size}"${c.weight ? ' font-weight="bold"' : ''}${c.italic ? ' font-style="italic"' : ''} fill="${c.color ?? INK}" text-anchor="${anchor}" dominant-baseline="${baseline}"${op}`
        parts.push(`<text x="${c.x}" y="${y0}" ${style}>${lines.map((l, i) => `<tspan x="${c.x}" dy="${i === 0 ? 0 : lineH}">${esc(l)}</tspan>`).join('')}</text>`)
        break
      }
      case 'icon': {
        const item = findItem(c.iconId) ?? findItem('cells.generic-cell')
        if (!item) break
        const inner = applyColors(item.svg, c.color, item.secondary).replace(/<svg([^>]*)>/, (_m, attrs: string) => `<svg${attrs} x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" preserveAspectRatio="xMidYMid meet"${op}>`)
        parts.push(inner)
        break
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.max(1, layout.width)} ${Math.max(1, layout.height)}" width="${layout.width}" height="${layout.height}">${parts.join('')}</svg>`
}
