import { Canvas, FabricObject, FabricText, Group, Line, Polygon, Rect, Textbox } from 'fabric'
import { arrowHead, shortenEnd } from '../canvas/arrows'
import type { ObjectData } from '../canvas/types'
import { buildIconGroup } from '../library/insert'
import { findItem } from '../library/registry'
import { layoutProtocol, INK, type Cmd } from './layout'
import type { Protocol } from './types'

async function cmdToObjects(c: Cmd, p: Protocol): Promise<FabricObject[]> {
  const font = p.fontFamily
  switch (c.t) {
    case 'line': {
      const out: FabricObject[] = []
      const end = c.arrow ? shortenEnd(c.x1, c.y1, c.x2, c.y2, c.width * 3) : { x: c.x2, y: c.y2 }
      out.push(new Line([c.x1, c.y1, end.x, end.y], { stroke: c.stroke, strokeWidth: c.width, originX: 'left', originY: 'top', strokeLineCap: 'round' }))
      if (c.arrow) {
        const [tip, a, b] = arrowHead(c.x1, c.y1, c.x2, c.y2, c.width * 5)
        out.push(new Polygon([tip, a, b], { fill: c.stroke, stroke: c.stroke, strokeWidth: 1, strokeLineJoin: 'round', originX: 'left', originY: 'top' }))
      }
      return out
    }
    case 'rect':
      return [new Rect({ left: c.x, top: c.y, width: c.w, height: c.h, fill: c.fill, stroke: c.stroke ?? '', strokeWidth: c.stroke ? (c.strokeWidth ?? 1) : 0, rx: c.rx ?? 0, ry: c.rx ?? 0, originX: 'left', originY: 'top' })]
    case 'text': {
      const common = {
        fontFamily: font,
        fontSize: c.size,
        fontWeight: c.weight ?? 'normal',
        fontStyle: c.italic ? ('italic' as const) : ('normal' as const),
        fill: c.color ?? INK,
        textAlign: c.align,
        originY: c.baseline === 'middle' ? ('center' as const) : ('top' as const),
      }
      let obj: FabricObject
      if (c.maxWidth) {
        obj = new Textbox(c.text, { ...common, width: c.maxWidth, originX: 'center', left: c.x, top: c.y, splitByGrapheme: false })
        if (c.align === 'left') obj.set({ originX: 'left', left: c.x })
      } else {
        const originX = c.align === 'center' ? 'center' : c.align === 'right' ? 'right' : 'left'
        obj = new FabricText(c.text, { ...common, originX, left: c.x, top: c.y })
      }
      return [obj]
    }
    case 'icon': {
      const item = findItem(c.iconId) ?? findItem('cells.generic-cell')
      if (!item) return []
      const g = await buildIconGroup({ ...item, width: c.w, height: c.h }, { primary: c.color })
      // centre the icon in its box
      const w = g.width * g.scaleX
      const h = g.height * g.scaleY
      g.set({ left: c.x + (c.w - w) / 2, top: c.y + (c.h - h) / 2 })
      return [g]
    }
  }
}

/** Build a Fabric Group for a protocol; the group carries the protocol in data for re-editing. */
export async function renderProtocol(p: Protocol): Promise<Group> {
  const layout = layoutProtocol(p)
  const objects: FabricObject[] = []
  for (const c of layout.cmds) objects.push(...(await cmdToObjects(c, p)))
  for (const o of objects) o.set({ selectable: false, evented: false })
  const group = new Group(objects, { originX: 'left', originY: 'top', subTargetCheck: false, interactive: false })
  const data: ObjectData = { kind: 'protocol', protocol: p }
  group.set('data', data)
  return group
}

/** Re-render a protocol in place, keeping position/scale/rotation and z-order. */
export async function replaceProtocolGroup(canvas: Canvas, old: Group, p: Protocol): Promise<Group> {
  const fresh = await renderProtocol(p)
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
