import { useEffect, useMemo, useState } from 'react'
import type { SaveEntryRequest } from '../canvas/editorStore'
import { librariesStore, useLibraries } from '../libraries/store'
import { entryId, slugify } from '../libraries/svg'
import { entryIdOf, type CustomLibrary, type LibraryEntry } from '../libraries/types'

const NEW = '__new__'

/** Save an icon / timeline / ontogeny into a custom library (existing or new). */
export function SaveEntryDialog({ request, onClose, notify }: { request: SaveEntryRequest; onClose: () => void; notify: (m: string) => void }) {
  const libraries = useLibraries((s) => s.libraries)
  const editable = libraries.filter((l) => !l.sourceUrl)
  const [name, setName] = useState(request.kind === 'protocol' ? request.protocol.title ?? '' : request.kind === 'ontogeny' ? request.graph.name : '')
  const [keywords, setKeywords] = useState('')
  const [libraryId, setLibraryId] = useState<string>(editable[0]?.manifest.id ?? NEW)
  const [newName, setNewName] = useState('My library')
  const [newAuthor, setNewAuthor] = useState('')
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const targetId = libraryId === NEW ? slugify(newName) : libraryId
  const id = useMemo(() => entryId(targetId || 'library', name || 'item'), [targetId, name])
  const existing = libraries.find((l) => l.manifest.id === targetId)
  const clash = existing?.entries.find((e) => entryIdOf(e) === id)
  const kindLabel = request.kind === 'icon' ? 'icon' : request.kind === 'protocol' ? 'timeline template' : 'ontogeny template'

  const save = () => {
    setError(null)
    if (!name.trim()) return setError('Give the item a name.')
    if (libraryId === NEW) {
      if (!newName.trim() || !newAuthor.trim()) return setError('A new library needs a name and an author.')
      if (libraries.some((l) => l.manifest.id === targetId)) return setError(`A library with id "${targetId}" already exists; choose it from the list or pick another name.`)
    }
    if (clash && !window.confirm(`"${name}" already exists in this library. Replace it?`)) return
    let entry: LibraryEntry
    if (request.kind === 'icon') {
      entry = { kind: 'icon', item: { id, name: name.trim(), category: 'custom', keywords: keywords.split(/[,\s]+/).map((k) => k.trim().toLowerCase()).filter(Boolean), svg: request.svg, width: request.width, height: request.height, primary: '#1f2937' } }
    } else if (request.kind === 'protocol') {
      entry = { kind: 'protocol', id, name: name.trim(), protocol: structuredClone(request.protocol) }
    } else {
      entry = { kind: 'ontogeny', graph: { ...structuredClone(request.graph), id, name: name.trim() } }
    }
    try {
      if (libraryId === NEW) {
        const lib: CustomLibrary = { app: 'diagramit-library', version: 1, manifest: { id: targetId, name: newName.trim(), version: '1.0', author: newAuthor.trim(), createdAt: new Date().toISOString() }, entries: [] }
        librariesStore.getState().upsertLibrary(lib)
      }
      librariesStore.getState().upsertEntry(targetId, entry)
      notify(`Saved "${name.trim()}" to ${libraryId === NEW ? newName.trim() : existing?.manifest.name}`)
      onClose()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()} style={{ zIndex: 120 }}>
      <div className="modal narrow">
        <header><span>Save {kindLabel} to a library</span><button onClick={onClose} aria-label="Close">×</button></header>
        <div className="body">
          <div className="save-preview">
            {request.kind === 'icon' ? (
              <div className="preview" dangerouslySetInnerHTML={{ __html: request.svg }} />
            ) : request.kind === 'protocol' ? (
              <span className="hint">{request.protocol.stages.length} stages · {request.protocol.layout} layout</span>
            ) : (
              <span className="hint">{request.graph.nodes.length} nodes · {request.graph.stages.length} stages</span>
            )}
          </div>
          <div className="field"><label>Name</label><input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={request.kind === 'icon' ? 'e.g. Kidney organoid' : 'e.g. Podocyte protocol, 28 days'} /></div>
          {request.kind === 'icon' && (
            <div className="field"><label>Search keywords (comma separated)</label><input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="organoid, nephron" /></div>
          )}
          <div className="field">
            <label>Library</label>
            <select value={libraryId} onChange={(e) => setLibraryId(e.target.value)}>
              {editable.map((l) => <option key={l.manifest.id} value={l.manifest.id}>{l.manifest.name} (by {l.manifest.author})</option>)}
              <option value={NEW}>New library…</option>
            </select>
          </div>
          {libraryId === NEW && (
            <div className="grid2">
              <div className="field"><label>Library name</label><input value={newName} onChange={(e) => setNewName(e.target.value)} /></div>
              <div className="field"><label>Author (credited wherever the library appears)</label><input value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} placeholder="Your name" /></div>
            </div>
          )}
          <div className="hint">Item id: <code>{id}</code>{clash ? ' (will replace the existing item)' : ''}</div>
          {error && <div className="hint" style={{ color: '#b91c1c' }}>{error}</div>}
        </div>
        <footer>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={save}>Save</button>
        </footer>
      </div>
    </div>
  )
}
