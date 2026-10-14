import { Canvas, Color, FabricObject, Group, loadSVGFromString } from 'fabric'
import type { ObjectData } from '../canvas/types'
import { applyColors, PRIMARY_SENTINEL, SECONDARY_SENTINEL } from './color'
import type { DrawingStyle, LibraryItem } from './types'
import { findItem, renderingFor } from './registry'

function hexOf(fill: unknown): string | null {
  if (typeof fill !== 'string' || !fill) return null
  try {
    return '#' + new Color(fill).toHex().toLowerCase()
  } catch {
    return null
  }
}

/**
 * Parse an icon's SVG into a Fabric Group. Recolourable regions are tagged with
 * data.role so they can be recoloured later, then painted with the final colours.
 */
export async function buildIconGroup(item: LibraryItem, colors?: { primary?: string; secondary?: string }, style: DrawingStyle = 'basic'): Promise<Group> {
  const rendering = renderingFor(item, style)
  const primary = colors?.primary ?? rendering.primary
  const secondary = colors?.secondary ?? rendering.secondary ?? primary
  const svg = applyColors(rendering.svg, PRIMARY_SENTINEL, SECONDARY_SENTINEL)
  const { objects, options } = await loadSVGFromString(svg)
  const parts = objects.filter((o): o is FabricObject => !!o)
  if (parts.length === 0) throw new Error(`Icon "${item.id}" produced no drawable elements`)
  for (const o of parts) {
    const fill = hexOf(o.fill)
    const stroke = hexOf(o.stroke)
    const data: ObjectData = { kind: 'shape' }
    if (fill === PRIMARY_SENTINEL) {
      data.role = 'primary'
      o.set('fill', primary)
    } else if (fill === SECONDARY_SENTINEL) {
      data.role = 'secondary'
      o.set('fill', secondary)
    }
    if (stroke === PRIMARY_SENTINEL) {
      data.strokeRole = 'primary'
      o.set('stroke', primary)
    } else if (stroke === SECONDARY_SENTINEL) {
      data.strokeRole = 'secondary'
      o.set('stroke', secondary)
    }
    o.set('data', data)
    o.set({ selectable: false, evented: false, strokeUniform: false })
  }
  const vbW = (options.width as number) || item.width
  const vbH = (options.height as number) || item.height
  const group = new Group(parts, {
    originX: 'left',
    originY: 'top',
    subTargetCheck: false,
    interactive: false,
  })
  // Scale from viewBox units to the requested size.
  const scale = Math.min(item.width / vbW, item.height / vbH)
  group.set({ scaleX: scale, scaleY: scale })
  const data: ObjectData = { kind: 'icon', libraryId: item.id, primaryColor: primary, secondaryColor: secondary }
  if (item.styles) data.style = style
  group.set('data', data)
  return group
}

/** Insert an icon centred at a scene point. */
export async function insertLibraryItem(
  canvas: Canvas,
  item: LibraryItem,
  at: { x: number; y: number },
  colors?: { primary?: string; secondary?: string },
  style: DrawingStyle = 'basic',
): Promise<Group> {
  const group = await buildIconGroup(item, colors, style)
  group.set({ left: at.x - (group.width * group.scaleX) / 2, top: at.y - (group.height * group.scaleY) / 2 })
  group.setCoords()
  canvas.add(group)
  canvas.setActiveObject(group)
  canvas.requestRenderAll()
  return group
}

/** Recolour the primary/secondary regions of an icon group in place. */
export function recolorIcon(obj: FabricObject, primary?: string, secondary?: string): void {
  if (!(obj instanceof Group)) return
  const data = (obj.get('data') as ObjectData | undefined) ?? { kind: 'icon' }
  const walk = (o: FabricObject) => {
    const d = o.get('data') as ObjectData | undefined
    if (d?.role === 'primary' && primary) o.set('fill', primary)
    if (d?.role === 'secondary' && secondary) o.set('fill', secondary)
    if (d?.strokeRole === 'primary' && primary) o.set('stroke', primary)
    if (d?.strokeRole === 'secondary' && secondary) o.set('stroke', secondary)
    if (o instanceof Group) o.getObjects().forEach(walk)
  }
  obj.getObjects().forEach(walk)
  obj.set('data', { ...data, primaryColor: primary ?? data.primaryColor, secondaryColor: secondary ?? data.secondaryColor })
  obj.set('dirty', true)
}

export function iconDataOf(obj: FabricObject | undefined): ObjectData | undefined {
  const d = obj?.get('data') as ObjectData | undefined
  return d?.kind === 'icon' ? d : undefined
}

/**
 * Re-render an inserted developmental icon in another drawing style, in place:
 * same position, angle and displayed width, same stacking order, that style's
 * default colours (a style is a change of medium, so colours reset).
 */
export async function restyleIcon(canvas: Canvas, old: Group, style: DrawingStyle): Promise<Group | null> {
  const data = iconDataOf(old)
  const item = data?.libraryId ? findItem(data.libraryId) : undefined
  if (!item || !item.styles) return null
  const fresh = await buildIconGroup(item, undefined, style)
  const shownWidth = old.width * old.scaleX
  const scale = shownWidth / fresh.width
  fresh.set({ left: old.left, top: old.top, angle: old.angle, scaleX: scale, scaleY: scale, flipX: old.flipX, flipY: old.flipY })
  const index = canvas.getObjects().indexOf(old)
  canvas.remove(old)
  canvas.add(fresh)
  if (index >= 0) canvas.moveObjectTo(fresh, index)
  fresh.setCoords()
  canvas.setActiveObject(fresh)
  canvas.requestRenderAll()
  return fresh
}
