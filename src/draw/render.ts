import { Circle, FabricObject, FabricText, Group, Line, Path, Polygon, Rect, Textbox } from 'fabric'
import { arrowHead, shortenEnd } from '../canvas/arrows'
import type { ObjectData } from '../canvas/types'
import { buildIconGroup } from '../library/insert'
import { findItem } from '../library/registry'
import { INK, type Cmd, type Layout } from './types'

async function cmdToObjects(c: Cmd, font: string): Promise<FabricObject[]> {
  const opacity = c.opacity ?? 1
  switch (c.t) {
    case 'line': {
      const out: FabricObject[] = []
      const end = c.arrow ? shortenEnd(c.x1, c.y1, c.x2, c.y2, c.width * 3) : { x: c.x2, y: c.y2 }
      out.push(new Line([c.x1, c.y1, end.x, end.y], { stroke: c.stroke, strokeWidth: c.width, originX: 'left', originY: 'top', strokeLineCap: 'round', strokeDashArray: c.dash ?? null, opacity }))
      if (c.arrow) {
        const [tip, a, b] = arrowHead(c.x1, c.y1, c.x2, c.y2, c.width * 5)
        out.push(new Polygon([tip, a, b], { fill: c.stroke, stroke: c.stroke, strokeWidth: 1, strokeLineJoin: 'round', originX: 'left', originY: 'top', opacity }))
      }
      return out
    }
    case 'rect':
      return [new Rect({ left: c.x, top: c.y, width: c.w, height: c.h, fill: c.fill, stroke: c.stroke ?? '', strokeWidth: c.stroke ? (c.strokeWidth ?? 1) : 0, rx: c.rx ?? 0, ry: c.rx ?? 0, originX: 'left', originY: 'top', opacity })]
    case 'circle':
      return [new Circle({ left: c.cx - c.r, top: c.cy - c.r, radius: c.r, fill: c.fill, stroke: c.stroke ?? '', strokeWidth: c.stroke ? (c.strokeWidth ?? 1) : 0, originX: 'left', originY: 'top', opacity })]
    case 'path': {
      const out: FabricObject[] = []
      out.push(new Path(c.d, { stroke: c.stroke, strokeWidth: c.width, fill: c.fill ?? '', strokeLineCap: 'round', strokeLineJoin: 'round', strokeDashArray: c.dash ?? null, originX: 'left', originY: 'top', opacity, objectCaching: false }))
      if (c.arrowEnd) {
        const [tip, a, b] = arrowHead(c.arrowEnd.fromX, c.arrowEnd.fromY, c.arrowEnd.x, c.arrowEnd.y, c.width * 4)
        out.push(new Polygon([tip, a, b], { fill: c.stroke, stroke: c.stroke, strokeWidth: 1, strokeLineJoin: 'round', originX: 'left', originY: 'top', opacity }))
      }
      return out
    }
    case 'text': {
      const common = {
        fontFamily: font,
        fontSize: c.size,
        fontWeight: c.weight ?? 'normal',
        fontStyle: c.italic ? ('italic' as const) : ('normal' as const),
        fill: c.color ?? INK,
        textAlign: c.align,
        originY: c.baseline === 'middle' ? ('center' as const) : ('top' as const),
        opacity,
      }
      let obj: FabricObject
      if (c.maxWidth) {
        const originX = c.align === 'center' ? 'center' : c.align === 'right' ? 'right' : 'left'
        obj = new Textbox(c.text, { ...common, width: c.maxWidth, originX, left: c.x, top: c.y, splitByGrapheme: false })
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
      const w = g.width * g.scaleX
      const h = g.height * g.scaleY
      g.set({ left: c.x + (c.w - w) / 2, top: c.y + (c.h - h) / 2, opacity })
      return [g]
    }
  }
}

/** Build a non-interactive Fabric Group from a layout; `data` is attached for re-editing. */
export async function renderLayout(layout: Layout, font: string, data: ObjectData): Promise<Group> {
  const objects: FabricObject[] = []
  for (const c of layout.cmds) objects.push(...(await cmdToObjects(c, font)))
  for (const o of objects) o.set({ selectable: false, evented: false })
  const group = new Group(objects, { originX: 'left', originY: 'top', subTargetCheck: false, interactive: false })
  group.set('data', data)
  return group
}
