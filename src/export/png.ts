import type { Canvas } from 'fabric'
import type { PageSpec } from '../canvas/types'
import { isPage } from '../canvas/commands'
import { withoutGuides } from '../canvas/guides'

/** Raster export of the page area at a scale factor (1 = page pixels). */
export function exportPngDataUrl(canvas: Canvas, page: PageSpec, opts: { scale: number; transparent: boolean }): string {
  const pageRect = canvas.getObjects().find(isPage)
  const active = canvas.getActiveObject()
  canvas.discardActiveObject()
  const prevVisible = pageRect?.visible ?? true
  if (pageRect && opts.transparent) pageRect.visible = false
  const vpt = [...canvas.viewportTransform] as typeof canvas.viewportTransform
  const retina = canvas.enableRetinaScaling
  try {
    canvas.viewportTransform = [1, 0, 0, 1, 0, 0]
    canvas.enableRetinaScaling = false
    return withoutGuides(() => canvas.toDataURL({ format: 'png', multiplier: opts.scale, left: 0, top: 0, width: page.width, height: page.height, enableRetinaScaling: false }))
  } finally {
    canvas.viewportTransform = vpt
    canvas.enableRetinaScaling = retina
    if (pageRect) pageRect.visible = prevVisible
    if (active) canvas.setActiveObject(active)
    canvas.requestRenderAll()
  }
}
