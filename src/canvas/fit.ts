import type { Canvas, FabricObject } from 'fabric'
import type { PageSpec } from './types'
import { sceneCenter } from './commands'

/**
 * Place a freshly built object at the view centre, scaled down (never up) so it
 * fits within `fraction` of the page.
 */
export function placeFitted(canvas: Canvas, obj: FabricObject, page: PageSpec, fraction = 0.9): void {
  const w = obj.width * obj.scaleX
  const h = obj.height * obj.scaleY
  const k = Math.min(1, (page.width * fraction) / w, (page.height * fraction) / h)
  obj.set({ scaleX: obj.scaleX * k, scaleY: obj.scaleY * k })
  const c = sceneCenter(canvas)
  obj.set({ left: c.x - (obj.width * obj.scaleX) / 2, top: c.y - (obj.height * obj.scaleY) / 2 })
  obj.setCoords()
}
