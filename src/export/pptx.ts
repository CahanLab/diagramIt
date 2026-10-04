import PptxGenJS from 'pptxgenjs'
import type { PageSpec } from '../canvas/types'
import { svgToDataUrl } from './svg'

/**
 * One 16:9 (or 4:3) slide with the diagram as an embedded SVG picture.
 * In PowerPoint: right-click the picture → Convert to Shape to get editable native shapes.
 */
export async function exportPptx(svg: string, page: PageSpec, title: string): Promise<Blob> {
  const pptx = new PptxGenJS()
  const wide = page.width / page.height >= 1.4
  pptx.layout = wide ? 'LAYOUT_16x9' : 'LAYOUT_4x3'
  pptx.title = title || 'DiagramIt figure'
  const slideW = wide ? 10 : 10
  const slideH = wide ? 5.625 : 7.5
  const margin = 0.25
  const availW = slideW - margin * 2
  const availH = slideH - margin * 2
  const scale = Math.min(availW / page.width, availH / page.height)
  const w = page.width * scale
  const h = page.height * scale
  const slide = pptx.addSlide()
  slide.addImage({ data: svgToDataUrl(svg), x: (slideW - w) / 2, y: (slideH - h) / 2, w, h })
  slide.addNotes('Made with DiagramIt. To edit the figure natively: select the picture → right-click → Convert to Shape (then Ungroup).')
  const out = await pptx.write({ outputType: 'blob' })
  return out as Blob
}
