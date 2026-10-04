import { Canvas, FabricObject, Group } from 'fabric'
import type { ObjectData } from '../canvas/types'
import { renderLayout } from '../draw/render'
import { layoutOntogeny } from './layout'
import type { OntogenyDocument } from './types'

export async function renderOntogeny(doc: OntogenyDocument): Promise<Group> {
  const data: ObjectData = { kind: 'ontogeny', ontogeny: doc }
  return renderLayout(layoutOntogeny(doc.graph, doc.view), doc.view.fontFamily, data)
}

/** Re-render an ontogeny in place, keeping position/scale/rotation and z-order. */
export async function replaceOntogenyGroup(canvas: Canvas, old: Group, doc: OntogenyDocument): Promise<Group> {
  const fresh = await renderOntogeny(doc)
  fresh.set({ left: old.left, top: old.top, scaleX: old.scaleX, scaleY: old.scaleY, angle: old.angle })
  const index = canvas.getObjects().indexOf(old)
  canvas.remove(old)
  canvas.add(fresh)
  if (index >= 0) canvas.moveObjectTo(fresh, index)
  fresh.setCoords()
  canvas.setActiveObject(fresh)
  canvas.requestRenderAll()
  return fresh
}

export function ontogenyOf(obj: FabricObject | undefined): OntogenyDocument | undefined {
  const d = obj?.get('data') as ObjectData | undefined
  return d?.kind === 'ontogeny' ? (d.ontogeny as OntogenyDocument) : undefined
}
