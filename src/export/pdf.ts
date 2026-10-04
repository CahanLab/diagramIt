import { jsPDF } from 'jspdf'
import 'svg2pdf.js'
import type { PageSpec } from '../canvas/types'

/** Vector PDF from an SVG string (page-sized, in px units). */
export async function exportPdf(svg: string, page: PageSpec): Promise<Blob> {
  const doc = new jsPDF({ unit: 'px', format: [page.width, page.height], orientation: page.width >= page.height ? 'landscape' : 'portrait', hotfixes: ['px_scaling'] })
  const el = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement
  await doc.svg(el, { x: 0, y: 0, width: page.width, height: page.height })
  return doc.output('blob')
}
