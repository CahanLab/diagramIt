import { Group } from 'fabric'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ensurePage, fitPage, zoomTo } from '../canvas/commands'
import { useEditor } from '../canvas/editorStore'
import { FabricCanvas, recordHistory, resetHistory, withHistorySuspended } from '../canvas/FabricCanvas'
import { DEFAULT_PAGE } from '../canvas/page'
import { downloadText, safeFilename } from '../export/download'
import { exportPdf } from '../export/pdf'
import { exportPngDataUrl } from '../export/png'
import { exportPptx } from '../export/pptx'
import { AUTOSAVE_KEY, loadProject, normalizeProjectJson, serializeProject } from '../export/project'
import { exportSvg } from '../export/svg'
import { OntogenyEditor } from '../ontogeny/OntogenyEditor'
import { ProtocolEditor } from '../protocol/ProtocolEditor'
import { loadTemplate, TEMPLATES } from '../templates'
import { ExportDialog } from '../ui/ExportDialog'
import { LibraryPanel } from '../ui/LibraryPanel'
import { PageDialog } from '../ui/PageDialog'
import { ParametricDialog } from '../ui/ParametricDialog'
import { PropertiesPanel } from '../ui/PropertiesPanel'
import { Toolbar } from '../ui/Toolbar'
import { DocName, Logo, Menu, MenuItem } from '../ui/TopBar'
import { AboutDialog } from '../ui/AboutDialog'
import { ABOUT } from './about'
import { installShortcuts } from './shortcuts'
import './layout.css'

export default function App() {
  const canvas = useEditor((s) => s.canvas)
  const page = useEditor((s) => s.page)
  const zoom = useEditor((s) => s.zoom)
  const dialog = useEditor((s) => s.dialog)
  const openDialog = useEditor((s) => s.openDialog)
  const setZoom = useEditor((s) => s.setZoom)
  const selection = useEditor((s) => s.selection)
  const [docName, setDocName] = useState('Untitled figure')
  const [toast, setToast] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const booted = useRef(false)

  const notify = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2500)
  }, [])

  const save = useCallback(() => {
    if (!canvas) return
    downloadText(serializeProject(canvas, page, docName), safeFilename(docName, 'diagramit.json'), 'application/json')
    useEditor.getState().markDirty(false)
    notify('Project saved')
  }, [canvas, page, docName, notify])

  const openFile = useCallback(() => fileRef.current?.click(), [])

  const onFileChosen = async (file: File | undefined) => {
    if (!file || !canvas) return
    try {
      const f = normalizeProjectJson(JSON.parse(await file.text()))
      await withHistorySuspended(() => loadProject(canvas, f))
      useEditor.getState().setPage(f.page)
      setDocName(f.name)
      setZoom(fitPage(canvas, f.page))
      resetHistory()
      useEditor.getState().setSelection([])
      notify(`Opened ${file.name}`)
    } catch (err) {
      notify(`Could not open file: ${(err as Error).message}`)
    }
  }

  const newDoc = useCallback(async (templateId = 'blank') => {
    if (!canvas) return
    if (useEditor.getState().dirty && !window.confirm('Discard unsaved changes and start a new figure?')) return
    await withHistorySuspended(async () => {
      canvas.clear()
      useEditor.getState().setPage(DEFAULT_PAGE)
      ensurePage(canvas, DEFAULT_PAGE)
      await loadTemplate(canvas, templateId)
    })
    setZoom(fitPage(canvas, DEFAULT_PAGE))
    canvas.requestRenderAll()
    resetHistory()
    useEditor.getState().setSelection([])
    useEditor.getState().markDirty(false)
    setDocName(TEMPLATES.find((t) => t.id === templateId)?.name ?? 'Untitled figure')
  }, [canvas, setZoom])

  // Dev-only handle for automated testing.
  useEffect(() => {
    if (!canvas || !import.meta.env.DEV) return
    ;(window as unknown as { __diagramit: unknown }).__diagramit = {
      canvas,
      store: useEditor,
      exportSvg: (bg = true) => exportSvg(canvas, useEditor.getState().page, { background: bg }),
      exportPng: (scale = 1) => exportPngDataUrl(canvas, useEditor.getState().page, { scale, transparent: false }),
      exportPptx: () => exportPptx(exportSvg(canvas, useEditor.getState().page, { background: false }), useEditor.getState().page, docName),
      exportPdf: () => exportPdf(exportSvg(canvas, useEditor.getState().page, { background: true }), useEditor.getState().page),
      serialize: () => serializeProject(canvas, useEditor.getState().page, docName),
    }
  }, [canvas, docName])

  // Boot: restore autosave or load the sample template.
  useEffect(() => {
    if (!canvas || booted.current) return
    booted.current = true
    ;(async () => {
      let restored = false
      try {
        const raw = localStorage.getItem(AUTOSAVE_KEY)
        if (raw) {
          const f = normalizeProjectJson(JSON.parse(raw))
          const objs = (f.canvas.objects as unknown[]) ?? []
          if (objs.length > 1 && window.confirm('Restore your previous unsaved figure?')) {
            await withHistorySuspended(() => loadProject(canvas, f))
            useEditor.getState().setPage(f.page)
            setDocName(f.name)
            restored = true
          }
        }
      } catch {
        restored = false
      }
      if (!restored) {
        await withHistorySuspended(() => loadTemplate(canvas, 'ipsc-classic'))
        setDocName('iPSC differentiation')
      }
      setZoom(fitPage(canvas, useEditor.getState().page))
      canvas.requestRenderAll()
      resetHistory()
      useEditor.getState().markDirty(false)
    })()
  }, [canvas, setZoom])

  // Autosave (debounced) whenever history records a change.
  useEffect(() => {
    if (!canvas) return
    let timer: number | undefined
    const unsub = useEditor.subscribe((s, prev) => {
      if (s.canUndo === prev.canUndo && s.canRedo === prev.canRedo && s.dirty === prev.dirty) return
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        try {
          localStorage.setItem(AUTOSAVE_KEY, serializeProject(canvas, useEditor.getState().page, docName))
        } catch {
          /* quota exceeded: ignore */
        }
      }, 1000)
    })
    return () => {
      unsub()
      window.clearTimeout(timer)
    }
  }, [canvas, docName])

  useEffect(() => installShortcuts({ save, open: openFile, exportDialog: () => openDialog({ kind: 'export' }), newDoc: () => void newDoc() }), [save, openFile, openDialog, newDoc])

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (useEditor.getState().dirty) e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  const close = () => openDialog(null)

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand"><Logo /> DiagramIt</div>
        <Menu label="File">
          <MenuItem label="New blank figure" shortcut="⌘⇧N" onClick={() => void newDoc('blank')} />
          {TEMPLATES.filter((t) => t.id !== 'blank').map((t) => <MenuItem key={t.id} label={`New: ${t.name}`} onClick={() => void newDoc(t.id)} />)}
          <div className="sep" />
          <MenuItem label="Open project…" shortcut="⌘O" onClick={openFile} />
          <MenuItem label="Save project (.diagramit.json)" shortcut="⌘S" onClick={save} />
          <div className="sep" />
          <MenuItem label="Export (PPTX / SVG / PDF / PNG)…" shortcut="⌘E" onClick={() => openDialog({ kind: 'export' })} />
          <div className="sep" />
          <MenuItem label="Page setup…" onClick={() => openDialog({ kind: 'page' })} />
        </Menu>
        <Menu label="Insert">
          <MenuItem label="Differentiation timeline…" onClick={() => openDialog({ kind: 'protocol' })} />
          <MenuItem label="Developmental ontogeny (lineage graph)…" onClick={() => openDialog({ kind: 'ontogeny' })} />
          <MenuItem label="Parametric object (cluster / plate / dish)…" onClick={() => openDialog({ kind: 'templates' })} />
          <div className="sep" />
          <MenuItem label="Text" shortcut="T" onClick={() => useEditor.getState().setTool('text')} />
          <MenuItem label="Rectangle" shortcut="R" onClick={() => useEditor.getState().setTool('rect')} />
          <MenuItem label="Ellipse" shortcut="O" onClick={() => useEditor.getState().setTool('ellipse')} />
          <MenuItem label="Arrow" shortcut="A" onClick={() => useEditor.getState().setTool('arrow')} />
        </Menu>
        <Menu label="View">
          <MenuItem label="Fit page" shortcut="⌘0" onClick={() => { if (canvas) { setZoom(fitPage(canvas, page)); canvas.requestRenderAll() } }} />
          <MenuItem label="Actual size (100%)" shortcut="⌘1" onClick={() => { if (canvas) { zoomTo(canvas, 1); setZoom(1) } }} />
          <MenuItem label="Zoom in" shortcut="⌘+" onClick={() => { if (canvas) { zoomTo(canvas, canvas.getZoom() * 1.2); setZoom(canvas.getZoom()) } }} />
          <MenuItem label="Zoom out" shortcut="⌘−" onClick={() => { if (canvas) { zoomTo(canvas, canvas.getZoom() / 1.2); setZoom(canvas.getZoom()) } }} />
        </Menu>
        <Menu label="Help">
          <MenuItem label="Keyboard shortcuts & tips" onClick={() => openDialog({ kind: 'shortcuts' })} />
          <div className="sep" />
          <MenuItem label="About DiagramIt…" onClick={() => openDialog({ kind: 'about' })} />
        </Menu>
        <span className="spacer" />
        <DocName value={docName} onChange={setDocName} />
        <button className="btn primary" onClick={() => openDialog({ kind: 'export' })}>Export</button>
        <a className="lab-mark" href={ABOUT.labUrl} target="_blank" rel="noopener noreferrer" title="Cahan Lab website" aria-label="Cahan Lab website"><img src={`${import.meta.env.BASE_URL}cahanlab.png`} alt="Cahan Lab" /></a>
        <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={(e) => { void onFileChosen(e.target.files?.[0]); e.target.value = '' }} />
      </div>

      <aside className="left"><LibraryPanel /></aside>
      <main className="center">
        <Toolbar />
        <FabricCanvas />
      </main>
      <aside className="right"><PropertiesPanel /></aside>

      <div className="statusbar">
        <span>{selection.length ? `${selection.length} selected` : 'Nothing selected'}</span>
        <span className="spacer" />
        <span>Page {page.width} × {page.height}</span>
        <button onClick={() => { if (canvas) { zoomTo(canvas, canvas.getZoom() / 1.2); setZoom(canvas.getZoom()) } }}>−</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => { if (canvas) { zoomTo(canvas, canvas.getZoom() * 1.2); setZoom(canvas.getZoom()) } }}>+</button>
        <button onClick={() => { if (canvas) { setZoom(fitPage(canvas, page)); canvas.requestRenderAll() } }}>Fit</button>
      </div>

      {dialog?.kind === 'protocol' && <ProtocolEditor target={dialog.target instanceof Group ? dialog.target : undefined} onClose={() => { close(); recordHistory() }} />}
      {dialog?.kind === 'ontogeny' && <OntogenyEditor target={dialog.target instanceof Group ? dialog.target : undefined} onClose={() => { close(); recordHistory() }} />}
      {dialog?.kind === 'export' && <ExportDialog docName={docName} onClose={close} notify={notify} />}
      {dialog?.kind === 'page' && <PageDialog onClose={close} />}
      {dialog?.kind === 'templates' && <ParametricDialog onClose={close} />}
      {dialog?.kind === 'shortcuts' && <HelpDialog onClose={close} />}
      {dialog?.kind === 'about' && <AboutDialog onClose={close} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function HelpDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  const rows: [string, string][] = [
    ['V / H / T', 'Select / Pan / Text tools'],
    ['R / U / O / L / A / E / P', 'Rectangle / Rounded / Ellipse / Line / Arrow / Elbow arrow / Pen'],
    ['Shift + drag', 'Keep square / constrain line angle; Shift after drawing keeps the tool active'],
    ['⌘Z / ⌘⇧Z', 'Undo / Redo'],
    ['⌘C / ⌘V / ⌘X / ⌘D', 'Copy / Paste / Cut / Duplicate'],
    ['⌘G / ⌘⇧G', 'Group / Ungroup'],
    ['⌘] / ⌘[ (+Shift)', 'Bring forward / Send backward (to front / to back)'],
    ['Arrows (+Shift)', 'Nudge 1 px (10 px)'],
    ['⌘ + scroll, ⌘0, ⌘1', 'Zoom at cursor, fit page, 100%'],
    ['Space + drag, scroll', 'Pan'],
    ['Double-click', 'Edit text, a timeline, or an ontogeny'],
    ['Enter', 'Edit selected text'],
    ['⌘S / ⌘O / ⌘E', 'Save / Open project / Export'],
  ]
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal narrow">
        <header><span>Shortcuts & tips</span><button onClick={onClose} aria-label="Close">×</button></header>
        <div className="body">
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k}><td style={{ padding: '4px 8px 4px 0', whiteSpace: 'nowrap' }}><kbd style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>{k}</kbd></td><td style={{ padding: 4 }}>{v}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="hint" style={{ color: 'var(--muted)' }}>
            <b>PowerPoint:</b> export as PPTX (or SVG and insert the picture). Then right-click the figure → <i>Convert to Shape</i> → <i>Ungroup</i> to edit every element natively.
          </div>
        </div>
        <footer><button className="btn primary" onClick={onClose}>Close</button></footer>
      </div>
    </div>
  )
}
