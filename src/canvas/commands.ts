import { ActiveSelection, Canvas, FabricObject, Group, Point, Rect } from 'fabric'
import { alignBoxes, distributeBoxes, type AlignMode, type DistributeMode } from './arrange'
import { clampZoom, fitZoom } from './page'
import type { ObjectData, PageSpec } from './types'

export const SERIALIZE_PROPS = ['data', 'selectable', 'evented', 'hasControls', 'lockMovementX', 'lockMovementY', 'lockScalingX', 'lockScalingY', 'lockRotation', 'strokeUniform', 'objectCaching']

export function dataOf(o: FabricObject | undefined): ObjectData | undefined {
  return o?.get('data') as ObjectData | undefined
}

export function isPage(o: FabricObject): boolean {
  return dataOf(o)?.kind === 'page'
}

/** Create (or recreate) the non-selectable page rectangle at the back of the stack. */
export function ensurePage(canvas: Canvas, page: PageSpec): Rect {
  let rect = canvas.getObjects().find(isPage) as Rect | undefined
  if (!rect) {
    rect = new Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: page.width, height: page.height, fill: page.background, stroke: '', strokeWidth: 0 })
    rect.set('data', { kind: 'page' } satisfies ObjectData)
    canvas.add(rect)
  }
  rect.set({ width: page.width, height: page.height, fill: page.background, selectable: false, evented: false, hasControls: false, hoverCursor: 'default', excludeFromExport: false })
  rect.setCoords()
  canvas.sendObjectToBack(rect)
  return rect
}

export function contentObjects(canvas: Canvas): FabricObject[] {
  return canvas.getObjects().filter((o) => !isPage(o))
}

export function snapshot(canvas: Canvas): string {
  return JSON.stringify(canvas.toObject(SERIALIZE_PROPS))
}

export async function restore(canvas: Canvas, json: string, page: PageSpec): Promise<void> {
  const vpt = [...canvas.viewportTransform] as typeof canvas.viewportTransform
  await canvas.loadFromJSON(json)
  canvas.viewportTransform = vpt
  ensurePage(canvas, page)
  canvas.requestRenderAll()
}

export function zoomTo(canvas: Canvas, zoom: number, around?: Point): void {
  const z = clampZoom(zoom)
  if (around) canvas.zoomToPoint(around, z)
  else {
    const c = new Point(canvas.getWidth() / 2, canvas.getHeight() / 2)
    canvas.zoomToPoint(c, z)
  }
}

export function fitPage(canvas: Canvas, page: PageSpec): number {
  const { zoom, panX, panY } = fitZoom({ w: canvas.getWidth(), h: canvas.getHeight() }, page)
  canvas.setViewportTransform([zoom, 0, 0, zoom, panX, panY])
  return zoom
}

export function sceneCenter(canvas: Canvas): Point {
  const vpt = canvas.viewportTransform
  const zoom = vpt[0]
  return new Point((canvas.getWidth() / 2 - vpt[4]) / zoom, (canvas.getHeight() / 2 - vpt[5]) / zoom)
}

export function deleteSelection(canvas: Canvas): void {
  const objs = canvas.getActiveObjects().filter((o) => !isPage(o) && !dataOf(o)?.locked)
  if (!objs.length) return
  canvas.discardActiveObject()
  canvas.remove(...objs)
  canvas.requestRenderAll()
}

export async function cloneObjects(objs: FabricObject[]): Promise<FabricObject[]> {
  return Promise.all(objs.map((o) => o.clone(SERIALIZE_PROPS)))
}

export async function duplicateSelection(canvas: Canvas, offset = 20): Promise<void> {
  const active = canvas.getActiveObject()
  if (!active || isPage(active)) return
  const clone = await active.clone(SERIALIZE_PROPS)
  canvas.discardActiveObject()
  if (clone instanceof ActiveSelection) {
    const items: FabricObject[] = []
    clone.forEachObject((o) => items.push(o))
    clone.removeAll()
    for (const o of items) {
      o.set({ left: o.left + offset, top: o.top + offset })
      canvas.add(o)
    }
    const sel = new ActiveSelection(items, { canvas })
    canvas.setActiveObject(sel)
  } else {
    clone.set({ left: clone.left + offset, top: clone.top + offset })
    canvas.add(clone)
    canvas.setActiveObject(clone)
  }
  canvas.requestRenderAll()
  canvas.fire('object:modified', { target: clone } as never)
}

/** Internal clipboard (survives across documents in this tab). */
let clipboard: FabricObject | null = null

export async function copySelection(canvas: Canvas): Promise<void> {
  const active = canvas.getActiveObject()
  if (!active || isPage(active)) return
  clipboard = await active.clone(SERIALIZE_PROPS)
}

export async function pasteClipboard(canvas: Canvas): Promise<void> {
  if (!clipboard) return
  const clone = await clipboard.clone(SERIALIZE_PROPS)
  canvas.discardActiveObject()
  if (clone instanceof ActiveSelection) {
    const items: FabricObject[] = []
    clone.forEachObject((o) => items.push(o))
    clone.removeAll()
    for (const o of items) {
      o.set({ left: o.left + 20, top: o.top + 20 })
      canvas.add(o)
    }
    canvas.setActiveObject(new ActiveSelection(items, { canvas }))
  } else {
    clone.set({ left: clone.left + 20, top: clone.top + 20 })
    canvas.add(clone)
    canvas.setActiveObject(clone)
  }
  // keep pasting at increasing offsets
  clipboard.set({ left: clipboard.left + 20, top: clipboard.top + 20 })
  canvas.requestRenderAll()
  canvas.fire('object:modified', { target: clone } as never)
}

export function groupSelection(canvas: Canvas): void {
  const active = canvas.getActiveObject()
  if (!(active instanceof ActiveSelection)) return
  const items = active.getObjects()
  canvas.discardActiveObject()
  canvas.remove(...items)
  const group = new Group(items, { subTargetCheck: false, interactive: false })
  group.set('data', { kind: 'group' } satisfies ObjectData)
  canvas.add(group)
  canvas.setActiveObject(group)
  canvas.requestRenderAll()
  canvas.fire('object:modified', { target: group } as never)
}

export function ungroupSelection(canvas: Canvas): void {
  const active = canvas.getActiveObject()
  if (!(active instanceof Group) || active instanceof ActiveSelection) return
  const kind = dataOf(active)?.kind
  if (kind === 'icon' || kind === 'protocol') {
    // Allow ungrouping icons/protocols into raw shapes (one-way, loses re-edit ability).
    if (!window.confirm('Ungrouping this object converts it to plain shapes and it can no longer be re-edited as a unit. Continue?')) return
  }
  const items = active.removeAll()
  canvas.remove(active)
  for (const o of items) {
    o.set({ selectable: true, evented: true })
    if (!dataOf(o)) o.set('data', { kind: 'shape' } satisfies ObjectData)
    canvas.add(o)
  }
  canvas.setActiveObject(new ActiveSelection(items, { canvas }))
  canvas.requestRenderAll()
  canvas.fire('object:modified', { target: active } as never)
}

export function selectAll(canvas: Canvas): void {
  const objs = contentObjects(canvas).filter((o) => o.selectable)
  canvas.discardActiveObject()
  if (objs.length === 1) canvas.setActiveObject(objs[0]!)
  else if (objs.length > 1) canvas.setActiveObject(new ActiveSelection(objs, { canvas }))
  canvas.requestRenderAll()
}

export function reorder(canvas: Canvas, how: 'front' | 'back' | 'forward' | 'backward'): void {
  const objs = canvas.getActiveObjects()
  for (const o of objs) {
    if (how === 'front') canvas.bringObjectToFront(o)
    else if (how === 'back') canvas.sendObjectToBack(o)
    else if (how === 'forward') canvas.bringObjectForward(o, true)
    else canvas.sendObjectBackwards(o, true)
  }
  const page = canvas.getObjects().find(isPage)
  if (page) canvas.sendObjectToBack(page)
  canvas.requestRenderAll()
  canvas.fire('object:modified', { target: objs[0] } as never)
}

function absBox(o: FabricObject) {
  const r = o.getBoundingRect()
  return { left: r.left, top: r.top, width: r.width, height: r.height }
}

/** Align selected objects (2+), or a single object relative to the page. */
export function alignSelection(canvas: Canvas, mode: AlignMode, page: PageSpec): void {
  const active = canvas.getActiveObject()
  if (!active) return
  const objs = canvas.getActiveObjects()
  if (objs.length <= 1) {
    const o = objs[0] ?? active
    const b = absBox(o)
    const target = alignBoxes([b, { left: 0, top: 0, width: page.width, height: page.height }], mode)[0]!
    o.set({ left: o.left + (target.left - b.left), top: o.top + (target.top - b.top) })
    o.setCoords()
  } else {
    // Operate in absolute coordinates: temporarily dissolve the selection
    canvas.discardActiveObject()
    const boxes = objs.map(absBox)
    const targets = alignBoxes(boxes, mode)
    objs.forEach((o, i) => {
      o.set({ left: o.left + (targets[i]!.left - boxes[i]!.left), top: o.top + (targets[i]!.top - boxes[i]!.top) })
      o.setCoords()
    })
    canvas.setActiveObject(new ActiveSelection(objs, { canvas }))
  }
  canvas.requestRenderAll()
  canvas.fire('object:modified', { target: active } as never)
}

export function distributeSelection(canvas: Canvas, mode: DistributeMode): void {
  const objs = canvas.getActiveObjects()
  if (objs.length < 3) return
  canvas.discardActiveObject()
  const boxes = objs.map(absBox)
  const targets = distributeBoxes(boxes, mode)
  objs.forEach((o, i) => {
    o.set({ left: o.left + (targets[i]!.left - boxes[i]!.left), top: o.top + (targets[i]!.top - boxes[i]!.top) })
    o.setCoords()
  })
  canvas.setActiveObject(new ActiveSelection(objs, { canvas }))
  canvas.requestRenderAll()
  canvas.fire('object:modified', { target: objs[0] } as never)
}

export function nudge(canvas: Canvas, dx: number, dy: number): void {
  const active = canvas.getActiveObject()
  if (!active || isPage(active)) return
  active.set({ left: active.left + dx, top: active.top + dy })
  active.setCoords()
  canvas.requestRenderAll()
  canvas.fire('object:modified', { target: active } as never)
}

export function flipSelection(canvas: Canvas, axis: 'x' | 'y'): void {
  for (const o of canvas.getActiveObjects()) {
    if (axis === 'x') o.set('flipX', !o.flipX)
    else o.set('flipY', !o.flipY)
  }
  canvas.requestRenderAll()
  canvas.fire('object:modified', { target: canvas.getActiveObject() } as never)
}

export function setLocked(canvas: Canvas, locked: boolean): void {
  for (const o of canvas.getActiveObjects()) {
    const d = dataOf(o) ?? { kind: 'shape' }
    o.set('data', { ...d, locked })
    o.set({ lockMovementX: locked, lockMovementY: locked, lockScalingX: locked, lockScalingY: locked, lockRotation: locked, hasControls: !locked })
  }
  canvas.requestRenderAll()
  canvas.fire('object:modified', { target: canvas.getActiveObject() } as never)
}
