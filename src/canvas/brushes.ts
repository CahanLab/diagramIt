/**
 * Fabric brushes for the camera lucida sketch tools: the ink pen (a PencilBrush whose
 * result is a re-renderable sketch path) and the stipple brush.
 * Spec: docs/superpowers/specs/2026-10-15-lucida-sketch-tools-design.md
 */
import { BaseBrush, Path, PencilBrush, Point, util, type Canvas } from 'fabric'
import type { SketchSettings } from './editorStore'
import { mulberry32, scatterDots, sketchPaint, sketchPathD, stampCount, sweepCount, type Dot, type SketchData } from './sketch'
import type { ObjectData } from './types'

type BrushEvent = { e: Event }

/** A sketch as a Fabric path: stroke and fill from the ink, `data.sketch` for later re-rendering. */
export function makeSketchPath(sketch: SketchData, ink: string, width: number): Path {
  const paint = sketchPaint(sketch, ink, width)
  const path = new Path(sketchPathD(sketch) || 'M0 0h0.01', {
    fill: paint.fill ?? '',
    stroke: paint.stroke ?? '',
    strokeWidth: paint.strokeWidth,
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    originX: 'left',
    originY: 'top',
  })
  path.set('data', { kind: 'sketch', sketch } satisfies ObjectData)
  return path
}

/**
 * Replace a path's data keeping its geometry where it is on the canvas (or inside its group).
 * Fabric's own `adjustPosition` assumes path coordinates are parent coordinates, which is not
 * true once the object has been moved or lives in a group; so the centre is re-derived from the
 * change in `pathOffset` through the object's own matrix.
 */
export function setPathInPlace(path: Path, d: string): void {
  const po0 = new Point(path.pathOffset.x, path.pathOffset.y)
  path._setPath(d, false)
  const po1 = path.pathOffset
  const centre = util.transformPoint(new Point(po1.x - po0.x, po1.y - po0.y), path.calcOwnMatrix())
  path.setPositionByOrigin(centre, 'center', 'center')
  path.set('dirty', true)
  path.setCoords()
}

/** Re-render a sketch path in place from its data (after smoothing, dot size or style changes, or erasing). */
export function rerenderSketch(path: Path, ink?: string, width?: number): void {
  const data = path.get('data') as ObjectData | undefined
  const sketch = data?.sketch
  if (!sketch) return
  const currentInk = ink ?? (typeof path.stroke === 'string' && path.stroke ? path.stroke : typeof path.fill === 'string' && path.fill ? path.fill : '#1f2937')
  const paint = sketchPaint(sketch, currentInk, width ?? (sketch.tool === 'stipple' ? 0 : path.strokeWidth))
  path.set({ fill: paint.fill ?? '', stroke: paint.stroke ?? '', strokeWidth: paint.strokeWidth })
  setPathInPlace(path, sketchPathD(sketch) || 'M0 0h0.01')
}

const mainEvent = (canvas: Canvas, e: Event): boolean => (canvas as unknown as { _isMainEvent(e: Event): boolean })._isMainEvent(e)

/** Freehand ink line: Fabric's pencil, finished as a sketch run so it can be smoothed and erased later. */
export class InkBrush extends PencilBrush {
  settings: () => SketchSettings
  private smooth = 1

  constructor(canvas: Canvas, settings: () => SketchSettings) {
    super(canvas)
    this.settings = settings
  }

  override onMouseDown(pointer: Point, ev: BrushEvent): void {
    const s = this.settings()
    this.color = s.ink
    this.width = s.penWidth
    this.smooth = s.penSmooth
    super.onMouseDown(pointer, ev as never)
  }

  override _finalizeAndAddPath(): void {
    const ctx = this.canvas.contextTop
    ctx.closePath()
    const pts = (this.decimate ? this.decimatePoints(this._points, this.decimate) : this._points).map((p): [number, number] => [+p.x.toFixed(2), +p.y.toFixed(2)])
    this.canvas.clearContext(ctx)
    if (pts.length === 0) {
      this.canvas.requestRenderAll()
      return
    }
    const path = makeSketchPath({ tool: 'pen', runs: [pts], smooth: this.smooth }, this.color, this.width)
    this.canvas.add(path)
    path.setCoords()
    this.canvas.requestRenderAll()
    this._resetShadow()
    this.canvas.fire('path:created', { path })
  }
}

let strokeSeed = 1

/** Stipple brush: scatters dots over the swept area; one sketch path per stroke. */
export class StippleBrush extends BaseBrush {
  settings: () => SketchSettings
  private dots: Dot[] = []
  private last: Point | null = null
  private carry = 0
  private rng = mulberry32(1)
  private angle = 0
  private radius = 12
  private density = 4
  private dotSize = 1.6
  private style: SketchSettings['dotStyle'] = 'dot'

  constructor(canvas: Canvas, settings: () => SketchSettings) {
    super(canvas)
    this.settings = settings
  }

  _render(): void {
    this.drawDots(this.dots)
  }

  onMouseDown(pointer: Point, { e }: BrushEvent): void {
    if (!mainEvent(this.canvas, e)) return
    const s = this.settings()
    this.color = s.ink
    this.radius = s.brushRadius
    this.density = s.dotDensity
    this.dotSize = s.dotSize
    this.style = s.dotStyle
    this.rng = mulberry32(strokeSeed++)
    this.dots = []
    this.carry = 0
    this.angle = 0
    this.last = pointer
    this.canvas.clearContext(this.canvas.contextTop)
    const fresh = scatterDots(this.rng, pointer.x, pointer.y, this.radius, stampCount(this.density, this.radius), this.dotSize, this.angle)
    this.dots.push(...fresh)
    this.drawDots(fresh)
  }

  onMouseMove(pointer: Point, { e }: BrushEvent): void {
    if (!this.last || !mainEvent(this.canvas, e)) return
    const dx = pointer.x - this.last.x
    const dy = pointer.y - this.last.y
    const dist = Math.hypot(dx, dy)
    if (dist < 0.5) return
    this.angle = Math.atan2(dy, dx)
    const { n, carry } = sweepCount(this.density, this.radius, dist, this.carry)
    this.carry = carry
    this.last = pointer
    if (!n) return
    const fresh = scatterDots(this.rng, pointer.x, pointer.y, this.radius, n, this.dotSize, this.angle)
    this.dots.push(...fresh)
    this.drawDots(fresh)
  }

  onMouseUp({ e }: BrushEvent): boolean {
    if (!mainEvent(this.canvas, e)) return true
    this.canvas.clearContext(this.canvas.contextTop)
    if (this.dots.length) {
      const path = makeSketchPath({ tool: 'stipple', dots: this.dots, style: this.style, size: this.dotSize }, this.color, 0)
      this.canvas.add(path)
      path.setCoords()
      this.canvas.fire('path:created', { path })
    }
    this.dots = []
    this.last = null
    this.canvas.requestRenderAll()
    return false
  }

  private drawDots(dots: Dot[]): void {
    const ctx = this.canvas.contextTop
    this._saveAndTransform(ctx)
    ctx.fillStyle = this.color
    ctx.strokeStyle = this.color
    ctx.lineCap = 'round'
    for (const [x, y, size, angle] of dots) {
      ctx.beginPath()
      if (this.style === 'tick') {
        const l = size * 1.25
        ctx.lineWidth = Math.max(0.2, this.dotSize * 0.45)
        ctx.moveTo(x - Math.cos(angle) * l, y - Math.sin(angle) * l)
        ctx.lineTo(x + Math.cos(angle) * l, y + Math.sin(angle) * l)
        ctx.stroke()
      } else if (this.style === 'ring') {
        ctx.lineWidth = Math.max(0.2, this.dotSize * 0.3)
        ctx.arc(x, y, size / 2, 0, 2 * Math.PI)
        ctx.stroke()
      } else {
        ctx.arc(x, y, size / 2, 0, 2 * Math.PI)
        ctx.fill()
      }
    }
    ctx.restore()
  }
}
