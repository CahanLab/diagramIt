export type WellCount = 6 | 12 | 24 | 48 | 96 | 384

const GRID: Record<WellCount, { rows: number; cols: number }> = {
  6: { rows: 2, cols: 3 },
  12: { rows: 3, cols: 4 },
  24: { rows: 4, cols: 6 },
  48: { rows: 6, cols: 8 },
  96: { rows: 8, cols: 12 },
  384: { rows: 16, cols: 24 },
}

/**
 * Top-view multi-well plate. Wells are `#PRIMARY` (medium colour); plate body is light grey.
 * `filled` optionally marks a subset of wells (by index, row-major) with #SECONDARY.
 */
export function wellPlateSvg(wells: WellCount, opts: { filled?: number[] } = {}): { svg: string; width: number; height: number } {
  const { rows, cols } = GRID[wells]
  const W = 128
  const H = 86
  const padX = 9
  const padY = 9
  const cellW = (W - padX * 2) / cols
  const cellH = (H - padY * 2) / rows
  const r = Math.min(cellW, cellH) * (wells >= 384 ? 0.38 : 0.4)
  const filled = new Set(opts.filled ?? [])
  const parts: string[] = []
  parts.push(`<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="5" fill="#e5e7eb" stroke="#1f2937" stroke-width="2.5"/>`)
  parts.push(`<rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="3" fill="#f3f4f6" stroke="#9ca3af" stroke-width="1"/>`)
  // corner notch (A1 orientation)
  parts.push(`<path d="M 5 14 L 14 5" stroke="#9ca3af" stroke-width="1"/>`)
  let i = 0
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = padX + cellW * (col + 0.5)
      const cy = padY + cellH * (row + 0.5)
      const fill = filled.has(i) ? '#SECONDARY' : '#PRIMARY'
      const sw = wells >= 96 ? 0.8 : 1.5
      if (wells >= 384) parts.push(`<rect x="${(cx - r).toFixed(2)}" y="${(cy - r).toFixed(2)}" width="${(r * 2).toFixed(2)}" height="${(r * 2).toFixed(2)}" rx="0.6" fill="${fill}" stroke="#1f2937" stroke-width="${sw}"/>`)
      else parts.push(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="${fill}" stroke="#1f2937" stroke-width="${sw}"/>`)
      i++
    }
  }
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${parts.join('')}</svg>`, width: 160, height: Math.round((160 * H) / W) }
}
