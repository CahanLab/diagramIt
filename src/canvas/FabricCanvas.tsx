import { Canvas, FabricObject, IText, Point, type TPointerEventInfo } from 'fabric'
import { useEffect, useRef } from 'react'
import { useEditor } from './editorStore'
import { History } from './history'
import { disposeGuides, installGuides } from './guides'
import { clampZoom } from './page'
import { ensurePage, fitPage, restore, snapshot } from './commands'
import { attachTools } from './tools'
import { findItem } from '../library/registry'
import { insertLibraryItem } from '../library/insert'
import { protocolOf } from '../protocol/render'
import { ontogenyOf } from '../ontogeny/render'

/** Shared history instance so toolbar/shortcuts can call undo/redo. */
export const history = new History(100)
let suspend = 0
export function withHistorySuspended<T>(fn: () => Promise<T>): Promise<T> {
  suspend++
  return fn().finally(() => {
    suspend--
  })
}

export async function undo(): Promise<void> {
  const { canvas, page, setHistoryFlags } = useEditor.getState()
  if (!canvas) return
  const prev = history.undo(snapshot(canvas))
  if (prev === null) return
  await withHistorySuspended(() => restore(canvas, prev, page))
  setHistoryFlags(history.canUndo(), history.canRedo())
  useEditor.getState().setSelection([])
}

export async function redo(): Promise<void> {
  const { canvas, page, setHistoryFlags } = useEditor.getState()
  if (!canvas) return
  const next = history.redo(snapshot(canvas))
  if (next === null) return
  await withHistorySuspended(() => restore(canvas, next, page))
  setHistoryFlags(history.canUndo(), history.canRedo())
  useEditor.getState().setSelection([])
}

export function recordHistory(): void {
  const { canvas, setHistoryFlags, markDirty } = useEditor.getState()
  if (!canvas || suspend > 0) return
  // While a text is being edited, wait for text:editing:exited to avoid partial-word snapshots.
  const active = canvas.getActiveObject()
  if (active instanceof IText && active.isEditing) return
  history.push(snapshot(canvas))
  setHistoryFlags(history.canUndo(), history.canRedo())
  markDirty(true)
}

let pendingTimer: number | undefined
function scheduleHistory(): void {
  if (suspend > 0) return
  window.clearTimeout(pendingTimer)
  pendingTimer = window.setTimeout(recordHistory, 250)
}

export function resetHistory(): void {
  const { canvas, setHistoryFlags, markDirty } = useEditor.getState()
  if (!canvas) return
  window.clearTimeout(pendingTimer)
  history.reset(snapshot(canvas))
  setHistoryFlags(false, false)
  markDirty(false)
}

export function FabricCanvas() {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tool = useEditor((s) => s.tool)
  const toolsRef = useRef<ReturnType<typeof attachTools> | null>(null)

  useEffect(() => {
    const host = hostRef.current
    const el = canvasRef.current
    if (!host || !el) return
    const store = useEditor.getState()
    const canvas = new Canvas(el, {
      preserveObjectStacking: true,
      fireRightClick: true,
      stopContextMenu: true,
      selectionColor: 'rgba(37, 99, 235, 0.12)',
      selectionBorderColor: '#2563eb',
      selectionLineWidth: 1,
      enableRetinaScaling: true,
      uniformScaling: true,
    })
    FabricObject.ownDefaults.transparentCorners = false
    FabricObject.ownDefaults.cornerColor = '#ffffff'
    FabricObject.ownDefaults.cornerStrokeColor = '#2563eb'
    FabricObject.ownDefaults.borderColor = '#2563eb'
    FabricObject.ownDefaults.cornerSize = 9
    FabricObject.ownDefaults.cornerStyle = 'circle'
    FabricObject.ownDefaults.padding = 2

    canvas.setDimensions({ width: host.clientWidth, height: host.clientHeight })
    ensurePage(canvas, store.page)
    store.setCanvas(canvas)
    store.setZoom(fitPage(canvas, store.page))

    installGuides(canvas)

    // --- history wiring (debounced)
    canvas.on('object:added', scheduleHistory)
    canvas.on('object:removed', scheduleHistory)
    canvas.on('object:modified', scheduleHistory)
    canvas.on('text:editing:exited', scheduleHistory)

    // --- selection wiring
    const syncSel = () => store.setSelection(canvas.getActiveObjects())
    canvas.on('selection:created', syncSel)
    canvas.on('selection:updated', syncSel)
    canvas.on('selection:cleared', syncSel)
    canvas.on('object:modified', () => store.bumpSelection())
    canvas.on('object:scaling', () => store.bumpSelection())
    canvas.on('object:moving', () => store.bumpSelection())
    canvas.on('object:rotating', () => store.bumpSelection())

    // --- double-click: edit protocol
    canvas.on('mouse:dblclick', (e: TPointerEventInfo) => {
      const t = e.target
      if (t && protocolOf(t)) store.openDialog({ kind: 'protocol', target: t })
      else if (t && ontogenyOf(t)) store.openDialog({ kind: 'ontogeny', target: t })
    })

    // --- wheel: zoom with ctrl/cmd, otherwise pan
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        const zoom = clampZoom(canvas.getZoom() * Math.exp(-e.deltaY * 0.0015))
        const rect = el.getBoundingClientRect()
        canvas.zoomToPoint(new Point(e.clientX - rect.left, e.clientY - rect.top), zoom)
        store.setZoom(zoom)
      } else {
        canvas.relativePan(new Point(-e.deltaX, -e.deltaY))
      }
    }
    host.addEventListener('wheel', onWheel, { passive: false })

    // --- resize
    const ro = new ResizeObserver(() => {
      canvas.setDimensions({ width: host.clientWidth, height: host.clientHeight })
      canvas.requestRenderAll()
    })
    ro.observe(host)

    // --- drag & drop from library
    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('application/x-diagramit-item')) {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
      }
    }
    const onDrop = async (e: DragEvent) => {
      const id = e.dataTransfer?.getData('application/x-diagramit-item')
      if (!id) return
      e.preventDefault()
      const item = findItem(id)
      if (!item) return
      const rect = el.getBoundingClientRect()
      const p = canvas.getScenePoint({ clientX: e.clientX, clientY: e.clientY } as MouseEvent)
      void rect
      await insertLibraryItem(canvas, item, { x: p.x, y: p.y })
      store.setTool('select')
    }
    host.addEventListener('dragover', onDragOver)
    host.addEventListener('drop', onDrop)

    toolsRef.current = attachTools(canvas, {
      onDone: (keep) => {
        if (!keep) useEditor.getState().setTool('select')
      },
    })
    toolsRef.current.setTool(useEditor.getState().tool)
    resetHistory()

    return () => {
      ro.disconnect()
      host.removeEventListener('wheel', onWheel)
      host.removeEventListener('dragover', onDragOver)
      host.removeEventListener('drop', onDrop)
      toolsRef.current?.dispose()
      disposeGuides()
      store.setCanvas(null)
      void canvas.dispose()
    }
  }, [])

  useEffect(() => {
    toolsRef.current?.setTool(tool)
  }, [tool])

  return (
    <div ref={hostRef} id="canvas-host" className="canvas-host">
      <canvas ref={canvasRef} />
    </div>
  )
}
