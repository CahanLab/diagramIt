import { cellClusterSvg } from './cellCluster'

export type DishView = 'top' | 'side'

/**
 * Petri dish with an optional cluster of cells (or several colonies) inside.
 * #PRIMARY = medium colour; #SECONDARY = cell colour (cells have fixed dark nuclei).
 */
export function dishWithCellsSvg(opts: { view: DishView; colonies: number; cellsPerColony: number; seed?: number }): { svg: string; width: number; height: number } {
  const seed = opts.seed ?? 3
  if (opts.view === 'side') {
    const parts: string[] = []
    // base dish: side view (perspective ellipse rim)
    parts.push(`<path d="M 8 40 L 12 62 Q 60 70 108 62 L 112 40 Z" fill="#e5e7eb" stroke="#1f2937" stroke-width="2.5" stroke-linejoin="round"/>`)
    parts.push(`<path d="M 10 50 L 12 62 Q 60 70 108 62 L 110 50 Q 60 58 10 50 Z" fill="#PRIMARY" stroke="none"/>`)
    parts.push(`<ellipse cx="60" cy="40" rx="52" ry="8" fill="#f3f4f6" stroke="#1f2937" stroke-width="2.5"/>`)
    parts.push(`<ellipse cx="60" cy="40" rx="46" ry="5.5" fill="#PRIMARY" stroke="#9ca3af" stroke-width="1"/>`)
    // lid, offset above
    parts.push(`<path d="M 4 22 L 6 30 Q 60 38 114 30 L 116 22 Z" fill="#ffffff" fill-opacity="0.85" stroke="#1f2937" stroke-width="2.5" stroke-linejoin="round"/>`)
    parts.push(`<ellipse cx="60" cy="22" rx="56" ry="8" fill="#ffffff" stroke="#1f2937" stroke-width="2.5"/>`)
    // cells on the floor line
    const n = Math.max(0, Math.min(12, opts.colonies * 3))
    for (let i = 0; i < n; i++) {
      const x = 24 + (i * 72) / Math.max(1, n - 1)
      parts.push(`<circle cx="${x.toFixed(1)}" cy="${(41 + (i % 2) * 2).toFixed(1)}" r="3.2" fill="#SECONDARY" stroke="#1f2937" stroke-width="1"/>`)
    }
    return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 76">${parts.join('')}</svg>`, width: 150, height: 95 }
  }
  // top view
  const parts: string[] = []
  parts.push(`<circle cx="60" cy="60" r="57" fill="#e5e7eb" stroke="#1f2937" stroke-width="2.5"/>`)
  parts.push(`<circle cx="60" cy="60" r="50" fill="#PRIMARY" stroke="#1f2937" stroke-width="1.5"/>`)
  parts.push(`<path d="M 24 36 A 44 44 0 0 1 44 20" fill="none" stroke="#ffffff" stroke-opacity="0.7" stroke-width="4" stroke-linecap="round"/>`)
  const colonies = Math.max(1, Math.min(9, opts.colonies))
  const per = Math.max(1, Math.min(20, opts.cellsPerColony))
  const positions: { x: number; y: number }[] = colonies === 1 ? [{ x: 60, y: 60 }] : Array.from({ length: colonies }, (_, i) => {
    const a = (i / colonies) * Math.PI * 2 - Math.PI / 2
    const d = colonies <= 3 ? 22 : 28
    return { x: 60 + Math.cos(a) * d, y: 60 + Math.sin(a) * d }
  })
  positions.forEach((p, i) => {
    const cl = cellClusterSvg({ count: per, radius: colonies === 1 ? 7 : 4.2, seed: seed + i, nuclei: true, nucleusRatio: 0.4 })
    // inline the cluster's circles, translated so that the cluster centre sits at p
    const inner = cl.svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')
    const vb = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(cl.svg)!
    const w = Number(vb[1])
    const h = Number(vb[2])
    parts.push(`<g transform="translate(${(p.x - w / 2).toFixed(2)} ${(p.y - h / 2).toFixed(2)})">${inner.replace(/#PRIMARY/g, '#SECONDARY').replace(/fill="#SECONDARY"\/>/g, 'fill="#4b3a2a"/>')}</g>`)
  })
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${parts.join('')}</svg>`, width: 120, height: 120 }
}
