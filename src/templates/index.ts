import { Canvas, Textbox } from 'fabric'
import { insertLibraryItem } from '../library/insert'
import { findItem } from '../library/registry'
import { renderProtocol } from '../protocol/render'
import { MESENDODERM_STRIP_TEMPLATE, PODOCYTE_TEMPLATE } from '../protocol/templates'
import { createText } from '../canvas/tools'

export const TEMPLATES: { id: string; name: string; description: string }[] = [
  { id: 'blank', name: 'Blank figure', description: 'Empty 16:9 page' },
  { id: 'ipsc-classic', name: 'iPSC differentiation (classic)', description: 'Day axis, cells with markers, media boxes' },
  { id: 'ipsc-strip', name: 'iPSC differentiation (compact strip)', description: 'Day ruler with coloured media bands' },
  { id: 'workflow', name: 'Experimental workflow', description: 'Dish → treatment → assay → analysis' },
]

export async function loadTemplate(canvas: Canvas, id: string): Promise<void> {
  if (id === 'ipsc-classic') {
    const g = await renderProtocol(PODOCYTE_TEMPLATE)
    g.set({ left: 120, top: 120 })
    g.setCoords()
    canvas.add(g)
    const dish = findItem('composites.ipscs-in-dish')
    if (dish) {
      const d = await insertLibraryItem(canvas, { ...dish, width: 110, height: 110 }, { x: 150, y: 820 })
      void d
    }
    const title = createText(120, 40, 'Directed differentiation of hiPSCs')
    title.set({ fontSize: 28, fontWeight: 'bold', width: 800 })
    canvas.add(title)
    canvas.discardActiveObject()
    return
  }
  if (id === 'ipsc-strip') {
    const g = await renderProtocol(MESENDODERM_STRIP_TEMPLATE)
    g.set({ left: 120, top: 120 })
    g.setCoords()
    canvas.add(g)
    canvas.discardActiveObject()
    return
  }
  if (id === 'workflow') {
    const steps: { icon: string; label: string }[] = [
      { icon: 'composites.ipscs-in-dish', label: 'iPSC culture' },
      { icon: 'consumables.well-plate-96', label: 'Treatment' },
      { icon: 'instruments.flow-cytometer', label: 'Flow cytometry' },
      { icon: 'molbio.scrna-seq-droplet', label: 'scRNA-seq' },
      { icon: 'analyses.umap-scatter', label: 'Analysis' },
    ]
    const x0 = 200
    const dx = 300
    for (let i = 0; i < steps.length; i++) {
      const item = findItem(steps[i]!.icon) ?? findItem('cells.generic-cell')
      if (item) await insertLibraryItem(canvas, { ...item, width: 130, height: Math.round((130 * item.height) / item.width) }, { x: x0 + i * dx, y: 420 })
      const t = new Textbox(steps[i]!.label, { left: x0 + i * dx - 90, top: 520, width: 180, originX: 'left', originY: 'top', fontFamily: 'Helvetica', fontSize: 20, textAlign: 'center', fill: '#1f2937' })
      t.set('data', { kind: 'text' })
      canvas.add(t)
      if (i < steps.length - 1) {
        const { connectorPath } = await import('../canvas/tools')
        canvas.add(connectorPath(x0 + i * dx + 90, 420, x0 + (i + 1) * dx - 90, 420, { elbow: false, arrow: true, stroke: '#1f2937', strokeWidth: 3 }))
      }
    }
    canvas.discardActiveObject()
  }
}
