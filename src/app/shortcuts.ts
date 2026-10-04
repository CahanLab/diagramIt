import { IText } from 'fabric'
import { copySelection, deleteSelection, duplicateSelection, fitPage, groupSelection, nudge, pasteClipboard, reorder, selectAll, ungroupSelection, zoomTo } from '../canvas/commands'
import { useEditor } from '../canvas/editorStore'
import { redo, undo } from '../canvas/FabricCanvas'
import { isTyping } from '../canvas/tools'
import type { ToolId } from '../canvas/types'

const TOOL_KEYS: Record<string, ToolId> = { v: 'select', h: 'pan', t: 'text', r: 'rect', u: 'roundRect', o: 'ellipse', l: 'line', a: 'arrow', e: 'elbowArrow', p: 'pen' }

export function installShortcuts(actions: { save: () => void; open: () => void; exportDialog: () => void; newDoc: () => void }): () => void {
  const onKey = (e: KeyboardEvent) => {
    const { canvas, page, setTool, setZoom, dialog } = useEditor.getState()
    if (!canvas || dialog) return
    if (isTyping(e)) return
    const active = canvas.getActiveObject()
    if (active instanceof IText && active.isEditing) return
    const mod = e.metaKey || e.ctrlKey
    const key = e.key.toLowerCase()

    if (mod) {
      switch (key) {
        case 'z': e.preventDefault(); void (e.shiftKey ? redo() : undo()); return
        case 'y': e.preventDefault(); void redo(); return
        case 'd': e.preventDefault(); void duplicateSelection(canvas); return
        case 'c': e.preventDefault(); void copySelection(canvas); return
        case 'v': e.preventDefault(); void pasteClipboard(canvas); return
        case 'x': e.preventDefault(); void copySelection(canvas).then(() => deleteSelection(canvas)); return
        case 'a': e.preventDefault(); selectAll(canvas); return
        case 'g': e.preventDefault(); if (e.shiftKey) ungroupSelection(canvas); else groupSelection(canvas); return
        case 's': e.preventDefault(); actions.save(); return
        case 'o': e.preventDefault(); actions.open(); return
        case 'e': e.preventDefault(); actions.exportDialog(); return
        case 'n': if (e.shiftKey) { e.preventDefault(); actions.newDoc() } return
        case '0': e.preventDefault(); setZoom(fitPage(canvas, page)); canvas.requestRenderAll(); return
        case '1': e.preventDefault(); zoomTo(canvas, 1); setZoom(1); return
        case '=': case '+': e.preventDefault(); zoomTo(canvas, canvas.getZoom() * 1.2); setZoom(canvas.getZoom()); return
        case '-': e.preventDefault(); zoomTo(canvas, canvas.getZoom() / 1.2); setZoom(canvas.getZoom()); return
        case ']': e.preventDefault(); reorder(canvas, e.shiftKey ? 'front' : 'forward'); return
        case '[': e.preventDefault(); reorder(canvas, e.shiftKey ? 'back' : 'backward'); return
      }
      return
    }
    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        e.preventDefault(); deleteSelection(canvas); return
      case 'Escape':
        canvas.discardActiveObject(); canvas.requestRenderAll(); setTool('select'); return
      case 'ArrowLeft': e.preventDefault(); nudge(canvas, e.shiftKey ? -10 : -1, 0); return
      case 'ArrowRight': e.preventDefault(); nudge(canvas, e.shiftKey ? 10 : 1, 0); return
      case 'ArrowUp': e.preventDefault(); nudge(canvas, 0, e.shiftKey ? -10 : -1); return
      case 'ArrowDown': e.preventDefault(); nudge(canvas, 0, e.shiftKey ? 10 : 1); return
      case 'Enter': {
        if (active instanceof IText) { e.preventDefault(); active.enterEditing(); active.selectAll(); canvas.requestRenderAll() }
        return
      }
    }
    const tool = TOOL_KEYS[key]
    if (tool && !e.altKey) {
      setTool(tool)
    }
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}
