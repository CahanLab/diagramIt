import { useEffect, useRef, useState } from 'react'
import { useEditor } from '../canvas/editorStore'
import { exportLibraryFile, fetchLibrary, readLibraryFile } from '../libraries/io'
import { librariesStore, useLibraries } from '../libraries/store'
import { sanitizeCustomSvg, slugify } from '../libraries/svg'
import { entryIdOf, entryNameOf, type CustomLibrary, type LibraryManifest } from '../libraries/types'

type Ext = { target: '_blank'; rel: 'noopener noreferrer' }
const ext: Ext = { target: '_blank', rel: 'noopener noreferrer' }

export function LibrariesDialog({ onClose, notify }: { onClose: () => void; notify: (m: string) => void }) {
  const libraries = useLibraries((s) => s.libraries)
  const openDialog = useEditor((s) => s.openDialog)
  const fileRef = useRef<HTMLInputElement>(null)
  const svgRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const add = (lib: CustomLibrary) => {
    const prior = libraries.find((l) => l.manifest.id === lib.manifest.id)
    if (prior && !window.confirm(`Replace the loaded library "${prior.manifest.name}" with this one?`)) return false
    librariesStore.getState().upsertLibrary(lib)
    notify(`Loaded ${lib.manifest.name} (${lib.entries.length} items) by ${lib.manifest.author}`)
    return true
  }
  const onFile = async (file: File | undefined) => {
    if (!file) return
    try {
      add(await readLibraryFile(file))
    } catch (err) {
      notify(`Could not load library: ${(err as Error).message}`)
    }
  }
  const onUrl = async () => {
    if (!url.trim()) return
    setBusy(true)
    try {
      if (add(await fetchLibrary(url.trim()))) setUrl('')
    } catch (err) {
      notify(`Could not load from URL: ${(err as Error).message}`)
    } finally {
      setBusy(false)
    }
  }
  const onSvg = async (file: File | undefined) => {
    if (!file) return
    const s = sanitizeCustomSvg(await file.text())
    if (s.errors.length) return notify(`SVG rejected: ${s.errors[0]}`)
    openDialog({ kind: 'saveEntry', request: { kind: 'icon', svg: s.svg, width: s.width, height: s.height } })
  }
  const remove = (lib: CustomLibrary) => {
    if (window.confirm(`Remove "${lib.manifest.name}" from this browser? Figures already made with it are unaffected.`)) librariesStore.getState().removeLibrary(lib.manifest.id)
  }
  const duplicate = (lib: CustomLibrary) => {
    let id = `${lib.manifest.id}-copy`
    let n = 2
    while (libraries.some((l) => l.manifest.id === id)) id = `${lib.manifest.id}-copy-${n++}`
    librariesStore.getState().duplicateLibrary(lib.manifest.id, id)
    notify('Editable copy created')
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 'min(760px, 94vw)' }}>
        <header><span>Custom libraries</span><button onClick={onClose} aria-label="Close">×</button></header>
        <div className="body">
          <p className="hint" style={{ margin: 0 }}>
            A library bundles your own icons, timeline templates and ontogenies under your name. Make items with <b>File ▸ Save selection as library item</b>, the editors' <b>Save as template</b> buttons, or import an SVG file. Export the library to share it, or host the file on a public web page and share a link of the form <code>{location.origin}{location.pathname}?lib=https://…/name.diagramit-lib.json</code>.
          </p>
          <div className="btn-row">
            <button className="btn" onClick={() => fileRef.current?.click()}>Load library file…</button>
            <button className="btn" onClick={() => svgRef.current?.click()}>Import SVG as icon…</button>
            <button className="btn" onClick={() => setCreating(true)}>New empty library…</button>
            <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = '' }} />
            <input ref={svgRef} type="file" accept=".svg,image/svg+xml" style={{ display: 'none' }} onChange={(e) => { void onSvg(e.target.files?.[0]); e.target.value = '' }} />
          </div>
          <div className="field">
            <label>Load from URL</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input style={{ flex: 1 }} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/name.diagramit-lib.json" onKeyDown={(e) => e.key === 'Enter' && void onUrl()} />
              <button className="btn" disabled={busy || !url.trim()} onClick={() => void onUrl()}>Load</button>
            </div>
          </div>
          {creating && <ManifestForm onCancel={() => setCreating(false)} onSave={(m) => { librariesStore.getState().upsertLibrary({ app: 'diagramit-library', version: 1, manifest: m, entries: [] }); setCreating(false) }} existingIds={libraries.map((l) => l.manifest.id)} />}
          {libraries.length === 0 ? (
            <div className="lib-empty">No custom libraries loaded yet.</div>
          ) : (
            libraries.map((lib) => (
              <div className="lib-card" key={lib.manifest.id}>
                <div className="lib-card-head">
                  <div>
                    <b>{lib.manifest.name}</b> <span className="hint">v{lib.manifest.version} · {lib.entries.length} items{lib.sourceUrl ? ' · from URL (read-only)' : ''}</span>
                    <div className="hint">by {lib.manifest.author}{lib.manifest.affiliation ? `, ${lib.manifest.affiliation}` : ''}{lib.manifest.url ? <> · <a href={lib.manifest.url} {...ext}>website</a></> : null}{lib.manifest.license ? ` · ${lib.manifest.license}` : ''}</div>
                    {lib.manifest.description && <div className="hint">{lib.manifest.description}</div>}
                  </div>
                  <div className="btn-row">
                    <button className="btn" onClick={() => exportLibraryFile(lib)}>Export file</button>
                    {!lib.sourceUrl && <button className="btn" onClick={() => setEditing(editing === lib.manifest.id ? null : lib.manifest.id)}>Edit details</button>}
                    <button className="btn" onClick={() => duplicate(lib)}>Duplicate</button>
                    <button className="btn" onClick={() => remove(lib)}>Remove</button>
                  </div>
                </div>
                {editing === lib.manifest.id && <ManifestForm initial={lib.manifest} onCancel={() => setEditing(null)} onSave={(m) => { librariesStore.getState().updateManifest(lib.manifest.id, m); setEditing(null) }} existingIds={[]} />}
                <div className="hint" style={{ marginTop: 4 }}>
                  {lib.entries.map((e) => (
                    <span key={entryIdOf(e)} className="lib-chip" title={entryIdOf(e)}>
                      {entryNameOf(e)} <i>({e.kind})</i>
                      {!lib.sourceUrl && <button aria-label={`Remove ${entryNameOf(e)}`} onClick={() => window.confirm(`Remove "${entryNameOf(e)}" from ${lib.manifest.name}?`) && librariesStore.getState().removeEntry(lib.manifest.id, entryIdOf(e))}>×</button>}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        <footer><button className="btn primary" onClick={onClose}>Close</button></footer>
      </div>
    </div>
  )
}

function ManifestForm({ initial, onSave, onCancel, existingIds }: { initial?: LibraryManifest; onSave: (m: LibraryManifest) => void; onCancel: () => void; existingIds: string[] }) {
  const [m, setM] = useState<LibraryManifest>(initial ?? { id: '', name: '', version: '1.0', author: '', createdAt: new Date().toISOString() })
  const [error, setError] = useState<string | null>(null)
  const set = (k: keyof LibraryManifest, v: string) => setM((x) => ({ ...x, [k]: v }))
  const submit = () => {
    const id = initial ? m.id : slugify(m.name)
    if (!m.name.trim() || !m.author.trim()) return setError('Name and author are required.')
    if (!initial && existingIds.includes(id)) return setError(`A library with id "${id}" is already loaded.`)
    onSave({ ...m, id, name: m.name.trim(), author: m.author.trim() })
  }
  return (
    <div className="stage-card">
      <div className="grid2">
        <div className="field"><label>Name</label><input value={m.name} onChange={(e) => set('name', e.target.value)} /></div>
        <div className="field"><label>Author</label><input value={m.author} onChange={(e) => set('author', e.target.value)} /></div>
        <div className="field"><label>Affiliation</label><input value={m.affiliation ?? ''} onChange={(e) => set('affiliation', e.target.value)} /></div>
        <div className="field"><label>Website</label><input value={m.url ?? ''} onChange={(e) => set('url', e.target.value)} placeholder="https://" /></div>
        <div className="field"><label>Version</label><input value={m.version} onChange={(e) => set('version', e.target.value)} /></div>
        <div className="field"><label>Licence (e.g. CC BY 4.0)</label><input value={m.license ?? ''} onChange={(e) => set('license', e.target.value)} /></div>
      </div>
      <div className="field"><label>Description</label><input value={m.description ?? ''} onChange={(e) => set('description', e.target.value)} /></div>
      <div className="field"><label>Acknowledgement wording (optional; replaces "the X library by Y")</label><input value={m.acknowledgement ?? ''} onChange={(e) => set('acknowledgement', e.target.value)} /></div>
      {error && <div className="hint" style={{ color: '#b91c1c' }}>{error}</div>}
      <div className="btn-row"><button className="btn" onClick={onCancel}>Cancel</button><button className="btn primary" onClick={submit}>{initial ? 'Save details' : 'Create library'}</button></div>
    </div>
  )
}
