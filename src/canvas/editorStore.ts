import type { Canvas, FabricObject } from 'fabric'
import { create } from 'zustand'
import { DEFAULT_PAGE } from './page'
import type { Ontogeny } from '../ontogeny/types'
import type { Protocol } from '../protocol/types'
import type { PageSpec, ToolId } from './types'
import type { DrawingStyle } from '../library/types'
import { DOT_STYLES, type DotStyle } from './sketch'

const STYLE_KEY = 'diagramit.drawingStyle.v1'
const STYLES: DrawingStyle[] = ['basic', 'lucida', 'realistic']
function loadStyle(): DrawingStyle {
  try {
    const v = localStorage.getItem(STYLE_KEY)
    return STYLES.includes(v as DrawingStyle) ? (v as DrawingStyle) : 'basic'
  } catch {
    return 'basic'
  }
}

/** Settings of the camera lucida sketch tools; persisted in localStorage. */
export interface SketchSettings {
  ink: string
  penWidth: number
  penSmooth: number
  brushRadius: number
  dotDensity: number
  dotSize: number
  dotStyle: DotStyle
  eraserRadius: number
}
export const DEFAULT_SKETCH: SketchSettings = { ink: '#1f2937', penWidth: 1.2, penSmooth: 1, brushRadius: 12, dotDensity: 4, dotSize: 1.6, dotStyle: 'dot', eraserRadius: 10 }
const SKETCH_KEY = 'diagramit.sketch.v1'
function loadSketch(): SketchSettings {
  try {
    const raw = localStorage.getItem(SKETCH_KEY)
    if (!raw) return DEFAULT_SKETCH
    const v = JSON.parse(raw) as Partial<SketchSettings>
    const out = { ...DEFAULT_SKETCH, ...v }
    if (!DOT_STYLES.includes(out.dotStyle)) out.dotStyle = 'dot'
    return out
  } catch {
    return DEFAULT_SKETCH
  }
}

/** What File ▸ "Save selection as library item" and the editors' "Save as template" hand to the SaveEntryDialog. */
export type SaveEntryRequest =
  | { kind: 'icon'; svg: string; width: number; height: number }
  | { kind: 'protocol'; protocol: Protocol }
  | { kind: 'ontogeny'; graph: Ontogeny }

export interface EditorState {
  canvas: Canvas | null
  tool: ToolId
  page: PageSpec
  zoom: number
  selection: FabricObject[]
  /** Incremented whenever selected objects' properties change so panels re-render. */
  selectionVersion: number
  canUndo: boolean
  canRedo: boolean
  dirty: boolean
  /** Drawing style used by the library panel for developmental icons; persisted in localStorage. */
  drawingStyle: DrawingStyle
  /** Camera lucida sketch tool settings; persisted in localStorage. */
  sketch: SketchSettings
  /** Which modal dialog is open. */
  dialog:
    | null
    | { kind: 'protocol'; target?: FabricObject; template?: { protocol: Protocol; libraryId: string } }
    | { kind: 'ontogeny'; target?: FabricObject; template?: { graph: Ontogeny; libraryId: string } }
    | { kind: 'export' }
    | { kind: 'page' }
    | { kind: 'templates' }
    | { kind: 'about' }
    | { kind: 'shortcuts' }
    | { kind: 'libraries' }
    | { kind: 'saveEntry'; request: SaveEntryRequest }
  setCanvas: (c: Canvas | null) => void
  setTool: (t: ToolId) => void
  setPage: (p: PageSpec) => void
  setZoom: (z: number) => void
  setSelection: (o: FabricObject[]) => void
  bumpSelection: () => void
  setHistoryFlags: (canUndo: boolean, canRedo: boolean) => void
  markDirty: (dirty?: boolean) => void
  openDialog: (d: EditorState['dialog']) => void
  setDrawingStyle: (s: DrawingStyle) => void
  setSketch: (patch: Partial<SketchSettings>) => void
}

export const useEditor = create<EditorState>((set) => ({
  canvas: null,
  tool: 'select',
  page: DEFAULT_PAGE,
  zoom: 1,
  selection: [],
  selectionVersion: 0,
  canUndo: false,
  canRedo: false,
  dirty: false,
  drawingStyle: loadStyle(),
  sketch: loadSketch(),
  dialog: null,
  setCanvas: (canvas) => set({ canvas }),
  setDrawingStyle: (drawingStyle) => {
    try {
      localStorage.setItem(STYLE_KEY, drawingStyle)
    } catch {
      /* private mode */
    }
    set({ drawingStyle })
  },
  setSketch: (patch) =>
    set((s) => {
      const sketch = { ...s.sketch, ...patch }
      try {
        localStorage.setItem(SKETCH_KEY, JSON.stringify(sketch))
      } catch {
        /* private mode */
      }
      return { sketch }
    }),
  setTool: (tool) => set({ tool }),
  setPage: (page) => set({ page }),
  setZoom: (zoom) => set({ zoom }),
  setSelection: (selection) => set((s) => ({ selection, selectionVersion: s.selectionVersion + 1 })),
  bumpSelection: () => set((s) => ({ selectionVersion: s.selectionVersion + 1 })),
  setHistoryFlags: (canUndo, canRedo) => set({ canUndo, canRedo }),
  markDirty: (dirty = true) => set({ dirty }),
  openDialog: (dialog) => set({ dialog }),
}))
