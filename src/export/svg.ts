import type { Canvas } from 'fabric'
import type { PageSpec } from '../canvas/types'
import { isPage } from '../canvas/commands'

/** Ensure the root <svg> has width/height/viewBox matching the page (pure, testable). */
export function cropSvgToPage(svg: string, page: Pick<PageSpec, 'width' | 'height'>): string {
  const vb = `0 0 ${page.width} ${page.height}`
  return svg.replace(/<svg\b([^>]*)>/, (_m, attrs: string) => {
    let a = attrs
    a = a.replace(/\s(width|height|viewBox)="[^"]*"/g, '')
    return `<svg${a} width="${page.width}" height="${page.height}" viewBox="${vb}">`
  })
}

/** Vector export of the page area. */
export function exportSvg(canvas: Canvas, page: PageSpec, opts: { background: boolean }): string {
  const pageRect = canvas.getObjects().find(isPage)
  const active = canvas.getActiveObject()
  canvas.discardActiveObject()
  const prevVisible = pageRect?.visible ?? true
  if (pageRect && !opts.background) pageRect.visible = false
  let svg: string
  try {
    svg = canvas.toSVG({
      viewBox: { x: 0, y: 0, width: page.width, height: page.height },
      width: `${page.width}`,
      height: `${page.height}`,
      suppressPreamble: false,
    })
  } finally {
    if (pageRect) pageRect.visible = prevVisible
    if (active) canvas.setActiveObject(active)
    canvas.requestRenderAll()
  }
  return cropSvgToPage(svg, page)
}

export function svgToDataUrl(svg: string): string {
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
}
