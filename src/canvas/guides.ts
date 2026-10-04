import type { Canvas } from 'fabric'
import { AligningGuidelines } from 'fabric/extensions'

let guides: AligningGuidelines | null = null
let boundCanvas: Canvas | null = null

export function installGuides(canvas: Canvas): void {
  disposeGuides()
  boundCanvas = canvas
  guides = new AligningGuidelines(canvas, { margin: 6, color: '#ec4899', width: 1 })
}

export function disposeGuides(): void {
  guides?.dispose()
  guides = null
}

/**
 * Run `fn` with snapping guides detached. Needed for raster export: Fabric
 * nulls `contextTop` inside toCanvasElement and the guidelines' before:render
 * hook would throw.
 */
export function withoutGuides<T>(fn: () => T): T {
  const c = boundCanvas
  disposeGuides()
  try {
    return fn()
  } finally {
    if (c) installGuides(c)
  }
}
