import { Canvas, Ellipse, FabricObject, Path, Point, Polygon, Rect, Textbox, type TPointerEventInfo } from 'fabric'
import { arrowHead, elbowPoints, pathD, shortenEnd } from './arrows'
import { InkBrush, StippleBrush, makeSketchPath } from './brushes'
import type { SketchSettings } from './editorStore'
import { eraseAt } from './eraser'
import { runsPathD } from './sketch'
import type { ObjectData, ToolId } from './types'

export const DEFAULT_FONT = 'Helvetica'
export const DEFAULT_STYLE = { fill: '#dbe4ee', stroke: '#1f2937', strokeWidth: 2 }

const sceneOf = (canvas: Canvas, e: TPointerEventInfo) => canvas.getScenePoint(e.e)

function tag(o: FabricObject, data: ObjectData) {
  o.set('data', data)
  return o
}

/** Build a connector path (straight or elbow) with optional arrowhead at the end. */
export function connectorPath(x1: number, y1: number, x2: number, y2: number, opts: { elbow: boolean; arrow: boolean; stroke: string; strokeWidth: number }): Path {
  const head = opts.strokeWidth * 5
  const pts = opts.elbow ? elbowPoints(x1, y1, x2, y2) : [{ x: x1, y: y1 }, { x: x2, y: y2 }]
  let d: string
  if (opts.arrow) {
    const prev = pts[pts.length - 2]!
    const last = pts[pts.length - 1]!
    const shortened = shortenEnd(prev.x, prev.y, last.x, last.y, head * 0.6)
    const body = [...pts.slice(0, -1), shortened]
    const [tip, a, b] = arrowHead(prev.x, prev.y, last.x, last.y, head)
    d = `${pathD(body)} M ${tip.x} ${tip.y} L ${a.x} ${a.y} L ${b.x} ${b.y} Z`
  } else {
    d = pathD(pts)
  }
  const path = new Path(d, {
    stroke: opts.stroke,
    strokeWidth: opts.strokeWidth,
    fill: opts.arrow ? opts.stroke : '',
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    originX: 'left',
    originY: 'top',
    objectCaching: false,
  })
  tag(path, { kind: 'connector', arrow: { start: false, end: opts.arrow, headSize: head } })
  return path
}

function polygonPoints(kind: 'triangle' | 'diamond' | 'hexagon' | 'star', w: number, h: number) {
  switch (kind) {
    case 'triangle':
      return [{ x: w / 2, y: 0 }, { x: w, y: h }, { x: 0, y: h }]
    case 'diamond':
      return [{ x: w / 2, y: 0 }, { x: w, y: h / 2 }, { x: w / 2, y: h }, { x: 0, y: h / 2 }]
    case 'hexagon':
      return [{ x: w * 0.25, y: 0 }, { x: w * 0.75, y: 0 }, { x: w, y: h / 2 }, { x: w * 0.75, y: h }, { x: w * 0.25, y: h }, { x: 0, y: h / 2 }]
    case 'star': {
      const pts = []
      const cx = w / 2
      const cy = h / 2
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 1 : 0.45
        const a = -Math.PI / 2 + (i * Math.PI) / 5
        pts.push({ x: cx + Math.cos(a) * r * (w / 2), y: cy + Math.sin(a) * r * (h / 2) })
      }
      return pts
    }
  }
}

/** Create the shape for a drag from (x1,y1) to (x2,y2). Returns null for tools that are not drag-to-create. */
export function createShape(tool: ToolId, x1: number, y1: number, x2: number, y2: number): FabricObject | null {
  const left = Math.min(x1, x2)
  const top = Math.min(y1, y2)
  const w = Math.max(1, Math.abs(x2 - x1))
  const h = Math.max(1, Math.abs(y2 - y1))
  const base = { ...DEFAULT_STYLE, left, top, originX: 'left' as const, originY: 'top' as const, strokeUniform: true }
  switch (tool) {
    case 'rect':
      return tag(new Rect({ ...base, width: w, height: h }), { kind: 'shape' })
    case 'roundRect':
      return tag(new Rect({ ...base, width: w, height: h, rx: Math.min(16, w / 4, h / 4), ry: Math.min(16, w / 4, h / 4) }), { kind: 'shape' })
    case 'ellipse':
      return tag(new Ellipse({ ...base, rx: w / 2, ry: h / 2 }), { kind: 'shape' })
    case 'triangle':
    case 'diamond':
    case 'hexagon':
    case 'star':
      return tag(new Polygon(polygonPoints(tool, w, h), { ...base, strokeLineJoin: 'round' }), { kind: 'shape' })
    case 'line':
      return connectorPath(x1, y1, x2, y2, { elbow: false, arrow: false, stroke: '#1f2937', strokeWidth: 2.5 })
    case 'arrow':
      return connectorPath(x1, y1, x2, y2, { elbow: false, arrow: true, stroke: '#1f2937', strokeWidth: 2.5 })
    case 'elbowArrow':
      return connectorPath(x1, y1, x2, y2, { elbow: true, arrow: true, stroke: '#1f2937', strokeWidth: 2.5 })
    default:
      return null
  }
}

export function createText(x: number, y: number, text = 'Text'): Textbox {
  const tb = new Textbox(text, {
    left: x,
    top: y,
    originX: 'left',
    originY: 'top',
    fontFamily: DEFAULT_FONT,
    fontSize: 20,
    fill: '#1f2937',
    width: 160,
    splitByGrapheme: false,
  })
  tag(tb, { kind: 'text' })
  return tb
}

export interface ToolController {
  setTool(tool: ToolId): void
  dispose(): void
}

/**
 * Attach pointer handlers implementing the drawing tools. The `onDone` callback
 * fires when a creation tool finishes so the app can revert to the select tool.
 */
export function attachTools(canvas: Canvas, opts: { onDone: (keep: boolean) => void; sketch: () => SketchSettings }): ToolController {
  let tool: ToolId = 'select'
  let start: Point | null = null
  let draft: FabricObject | null = null
  let panning = false
  let lastClient: { x: number; y: number } | null = null
  let spaceHeld = false
  // segmented line in progress
  let verts: Point[] = []
  let rubber: Path | null = null
  // eraser drag
  let erasing = false
  let eraseChanged = false
  let lastErase: Point | null = null

  const ink = new InkBrush(canvas, opts.sketch)
  const stippler = new StippleBrush(canvas, opts.sketch)

  const applyMode = () => {
    const drawing = tool === 'pen' || tool === 'stipple'
    const creating = tool !== 'select' && tool !== 'pan' && !drawing
    canvas.isDrawingMode = drawing
    canvas.selection = tool === 'select'
    canvas.defaultCursor = tool === 'pan' ? 'grab' : tool === 'eraser' ? 'none' : creating ? 'crosshair' : 'default'
    canvas.hoverCursor = tool === 'select' ? 'move' : canvas.defaultCursor
    canvas.skipTargetFind = tool !== 'select'
    if (tool === 'pen') canvas.freeDrawingBrush = ink
    if (tool === 'stipple') canvas.freeDrawingBrush = stippler
  }

  /** Snap the segment from `from` to `to` to a multiple of 45°. */
  const snap45 = (from: Point, to: Point): Point => {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const len = Math.hypot(dx, dy)
    const a = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * Math.PI) / 4
    return new Point(from.x + Math.cos(a) * len, from.y + Math.sin(a) * len)
  }
  const clearRubber = () => {
    if (rubber) canvas.remove(rubber)
    rubber = null
  }
  const updateRubber = (cursor?: Point) => {
    clearRubber()
    const pts = [...verts, ...(cursor ? [cursor] : [])].map((q): [number, number] => [q.x, q.y])
    if (pts.length < 2) return
    const s = opts.sketch()
    rubber = new Path(runsPathD([pts], 0), { stroke: s.ink, strokeWidth: s.penWidth, fill: '', strokeLineCap: 'round', strokeLineJoin: 'round', selectable: false, evented: false, objectCaching: false, excludeFromExport: true })
    canvas.add(rubber)
    canvas.requestRenderAll()
  }
  const cancelPolyline = () => {
    verts = []
    clearRubber()
    canvas.requestRenderAll()
  }
  const finishPolyline = () => {
    const last = verts[verts.length - 1]
    const prev = verts[verts.length - 2]
    if (last && prev && Math.hypot(last.x - prev.x, last.y - prev.y) < 3) verts.pop() // the double click's second vertex
    const pts = verts.map((q): [number, number] => [+q.x.toFixed(2), +q.y.toFixed(2)])
    cancelPolyline()
    if (pts.length < 2) return
    const s = opts.sketch()
    const path = makeSketchPath({ tool: 'polyline', runs: [pts], smooth: 0 }, s.ink, s.penWidth)
    canvas.add(path)
    path.setCoords()
    canvas.requestRenderAll()
  }
  const drawEraserCursor = (p: Point) => {
    const ctx = canvas.contextTop
    canvas.clearContext(ctx)
    const v = canvas.viewportTransform
    ctx.save()
    ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5])
    ctx.beginPath()
    ctx.arc(p.x, p.y, opts.sketch().eraserRadius, 0, 2 * Math.PI)
    ctx.strokeStyle = '#2563eb'
    ctx.lineWidth = 1 / v[0]
    ctx.setLineDash([3 / v[0], 3 / v[0]])
    ctx.stroke()
    ctx.restore()
    ;(canvas as unknown as { contextTopDirty: boolean }).contextTopDirty = true
  }

  const onDown = (e: TPointerEventInfo) => {
    const ev = e.e as MouseEvent
    if (tool === 'pan' || spaceHeld || ('button' in ev && ev.button === 1)) {
      panning = true
      lastClient = { x: ev.clientX, y: ev.clientY }
      canvas.setCursor('grabbing')
      return
    }
    if (tool === 'select' || tool === 'pen' || tool === 'stipple') return
    const p = sceneOf(canvas, e)
    if (tool === 'polyline') {
      const prev = verts[verts.length - 1]
      const q = prev && ev.shiftKey ? snap45(prev, p) : p
      verts.push(new Point(q.x, q.y))
      updateRubber(q)
      return
    }
    if (tool === 'eraser') {
      erasing = true
      lastErase = p
      if (eraseAt(canvas, p, opts.sketch().eraserRadius)) eraseChanged = true
      drawEraserCursor(p)
      return
    }
    if (tool === 'text') {
      const tb = createText(p.x, p.y, 'Text')
      canvas.add(tb)
      canvas.setActiveObject(tb)
      tb.enterEditing()
      tb.selectAll()
      opts.onDone(false)
      return
    }
    start = p
    draft = null
  }

  const onMove = (e: TPointerEventInfo) => {
    const ev = e.e as MouseEvent
    if (panning && lastClient) {
      canvas.relativePan(new Point(ev.clientX - lastClient.x, ev.clientY - lastClient.y))
      lastClient = { x: ev.clientX, y: ev.clientY }
      return
    }
    if (tool === 'eraser') {
      const p = sceneOf(canvas, e)
      if (erasing && lastErase) {
        const r = opts.sketch().eraserRadius
        const d = Math.hypot(p.x - lastErase.x, p.y - lastErase.y)
        const steps = Math.max(1, Math.ceil(d / (r / 2)))
        for (let i = 1; i <= steps; i++) {
          const q = new Point(lastErase.x + ((p.x - lastErase.x) * i) / steps, lastErase.y + ((p.y - lastErase.y) * i) / steps)
          if (eraseAt(canvas, q, r)) eraseChanged = true
        }
        lastErase = p
      }
      drawEraserCursor(p)
      return
    }
    if (tool === 'polyline') {
      if (verts.length) {
        const p = sceneOf(canvas, e)
        updateRubber(ev.shiftKey ? snap45(verts[verts.length - 1]!, p) : p)
      }
      return
    }
    if (!start) return
    const p = sceneOf(canvas, e)
    let x2 = p.x
    let y2 = p.y
    if (ev.shiftKey) {
      // constrain: square / 45°
      const dx = x2 - start.x
      const dy = y2 - start.y
      if (tool === 'line' || tool === 'arrow' || tool === 'elbowArrow') {
        if (Math.abs(dx) > Math.abs(dy)) y2 = start.y
        else x2 = start.x
      } else {
        const s = Math.max(Math.abs(dx), Math.abs(dy))
        x2 = start.x + Math.sign(dx || 1) * s
        y2 = start.y + Math.sign(dy || 1) * s
      }
    }
    if (draft) canvas.remove(draft)
    draft = createShape(tool, start.x, start.y, x2, y2)
    if (draft) {
      draft.set({ selectable: false, evented: false })
      canvas.add(draft)
      canvas.requestRenderAll()
    }
  }

  const onUp = (e: TPointerEventInfo) => {
    if (panning) {
      panning = false
      lastClient = null
      canvas.setCursor(tool === 'pan' ? 'grab' : 'default')
      return
    }
    if (tool === 'eraser' && erasing) {
      erasing = false
      lastErase = null
      if (eraseChanged) {
        eraseChanged = false
        canvas.fire('object:modified', {} as never)
      }
      return
    }
    if (!start) return
    const ev = e.e as MouseEvent
    if (draft) {
      canvas.remove(draft)
      const bb = draft.getBoundingRect()
      if (bb.width < 3 && bb.height < 3) {
        draft = null
        start = null
        return
      }
      draft.set({ selectable: true, evented: true })
      canvas.add(draft)
      draft.setCoords()
      canvas.setActiveObject(draft)
      canvas.fire('object:modified', { target: draft } as never)
      opts.onDone(ev.shiftKey)
    } else {
      // simple click: create a default-size shape
      const obj = createShape(tool, start.x, start.y, start.x + 120, start.y + 80)
      if (obj) {
        canvas.add(obj)
        obj.setCoords()
        canvas.setActiveObject(obj)
        opts.onDone(ev.shiftKey)
      }
    }
    draft = null
    start = null
    canvas.requestRenderAll()
  }

  const onPathCreated = (e: { path: FabricObject }) => {
    if (!e.path.get('data')) tag(e.path, { kind: 'shape' })
  }

  const onDblClick = () => {
    if (tool === 'polyline' && verts.length >= 2) finishPolyline()
  }

  const onKey = (ev: KeyboardEvent) => {
    if (tool === 'polyline' && ev.type === 'keydown' && !isTyping(ev)) {
      if (ev.key === 'Enter' && verts.length >= 2) {
        ev.preventDefault()
        finishPolyline()
        return
      }
      if (ev.key === 'Escape') cancelPolyline()
    }
    if (ev.code === 'Space' && !isTyping(ev)) {
      if (ev.type === 'keydown' && !spaceHeld) {
        spaceHeld = true
        canvas.setCursor('grab')
        canvas.skipTargetFind = true
        ev.preventDefault()
      } else if (ev.type === 'keyup') {
        spaceHeld = false
        applyMode()
      }
    }
  }

  canvas.on('mouse:down', onDown)
  canvas.on('mouse:move', onMove)
  canvas.on('mouse:up', onUp)
  canvas.on('path:created', onPathCreated as never)
  canvas.on('mouse:dblclick', onDblClick)
  window.addEventListener('keydown', onKey)
  window.addEventListener('keyup', onKey)
  applyMode()

  return {
    setTool(t) {
      tool = t
      start = null
      if (draft) canvas.remove(draft)
      draft = null
      cancelPolyline()
      erasing = false
      lastErase = null
      canvas.clearContext(canvas.contextTop)
      applyMode()
      canvas.requestRenderAll()
    },
    dispose() {
      canvas.off('mouse:down', onDown)
      canvas.off('mouse:move', onMove)
      canvas.off('mouse:up', onUp)
      canvas.off('path:created', onPathCreated as never)
      canvas.off('mouse:dblclick', onDblClick)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKey)
    },
  }
}

export function isTyping(ev: Event): boolean {
  const t = ev.target as HTMLElement | null
  if (!t) return false
  const tag = t.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable
}
