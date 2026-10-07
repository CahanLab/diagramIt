import { Canvas, FabricObject, Group } from 'fabric'
import type { ObjectData } from '../canvas/types'
import { renderLayout } from '../draw/render'
import { layoutProtocol } from './layout'
import type { Protocol } from './types'

/** Build a Fabric Group for a protocol; the group carries the protocol in data for re-editing. */
export async function renderProtocol(p: Protocol, libraryId?: string): Promise<Group> {
  const data: ObjectData = { kind: 'protocol', protocol: p, ...(libraryId ? { libraryId } : {}) }
  return renderLayout(layoutProtocol(p), p.fontFamily, data)
}

/** Re-render a protocol in place, keeping position/scale/rotation and z-order. */
export async function replaceProtocolGroup(canvas: Canvas, old: Group, p: Protocol): Promise<Group> {
  const fresh = await renderProtocol(p, (old.get('data') as ObjectData | undefined)?.libraryId)
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

export function protocolOf(obj: FabricObject | undefined): Protocol | undefined {
  const d = obj?.get('data') as ObjectData | undefined
  return d?.kind === 'protocol' ? (d.protocol as Protocol) : undefined
}
