import type { Canvas, FabricObject } from 'fabric'
import { create } from 'zustand'
import { DEFAULT_PAGE } from './page'
import type { PageSpec, ToolId } from './types'

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
  /** Which modal dialog is open. */
  dialog: null | { kind: 'protocol'; target?: FabricObject } | { kind: 'ontogeny'; target?: FabricObject } | { kind: 'export' } | { kind: 'page' } | { kind: 'templates' } | { kind: 'about' } | { kind: 'shortcuts' }
  setCanvas: (c: Canvas | null) => void
  setTool: (t: ToolId) => void
  setPage: (p: PageSpec) => void
  setZoom: (z: number) => void
  setSelection: (o: FabricObject[]) => void
  bumpSelection: () => void
  setHistoryFlags: (canUndo: boolean, canRedo: boolean) => void
  markDirty: (dirty?: boolean) => void
  openDialog: (d: EditorState['dialog']) => void
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
  dialog: null,
  setCanvas: (canvas) => set({ canvas }),
  setTool: (tool) => set({ tool }),
  setPage: (page) => set({ page }),
  setZoom: (zoom) => set({ zoom }),
  setSelection: (selection) => set((s) => ({ selection, selectionVersion: s.selectionVersion + 1 })),
  bumpSelection: () => set((s) => ({ selectionVersion: s.selectionVersion + 1 })),
  setHistoryFlags: (canUndo, canRedo) => set({ canUndo, canRedo }),
  markDirty: (dirty = true) => set({ dirty }),
  openDialog: (dialog) => set({ dialog }),
}))
