import { Canvas, Color, FabricObject, Group, loadSVGFromString } from 'fabric'
import type { ObjectData } from '../canvas/types'
import { applyColors, PRIMARY_SENTINEL, SECONDARY_SENTINEL } from './color'
import type { LibraryItem } from './types'

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
export async function buildIconGroup(item: LibraryItem, colors?: { primary?: string; secondary?: string }): Promise<Group> {
  const primary = colors?.primary ?? item.primary
  const secondary = colors?.secondary ?? item.secondary ?? primary
  const svg = applyColors(item.svg, PRIMARY_SENTINEL, SECONDARY_SENTINEL)
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
    if (stroke === PRIMARY_SENTINEL) o.set('stroke', primary)
    if (stroke === SECONDARY_SENTINEL) o.set('stroke', secondary)
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
  group.set('data', data)
  return group
}

/** Insert an icon centred at a scene point. */
export async function insertLibraryItem(
  canvas: Canvas,
  item: LibraryItem,
  at: { x: number; y: number },
  colors?: { primary?: string; secondary?: string },
): Promise<Group> {
  const group = await buildIconGroup(item, colors)
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
