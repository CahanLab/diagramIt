import { beforeEach, describe, expect, it } from 'vitest'
import { createLibrariesStore, type LibrariesStorage } from './store'
import { entryIdOf, type CustomLibrary } from './types'

function mem(): LibrariesStorage & { data: Record<string, string> } {
  const data: Record<string, string> = {}
  return { data, getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = v } }
}
const lib = (id: string, extra: Partial<CustomLibrary> = {}): CustomLibrary => ({
  app: 'diagramit-library', version: 1,
  manifest: { id, name: id, version: '1', author: 'Ann', createdAt: '2026-10-07' },
  entries: [{ kind: 'icon', item: { id: `${id}.dot`, name: 'Dot', category: 'custom', keywords: [], svg: '<svg viewBox="0 0 1 1"/>', width: 10, height: 10, primary: '#000000' } }],
  ...extra,
})

describe('libraries store', () => {
  let storage: ReturnType<typeof mem>
  beforeEach(() => { storage = mem() })

  it('persists and reloads', () => {
    const s = createLibrariesStore(storage)
    s.getState().upsertLibrary(lib('a'))
    expect(JSON.parse(storage.data['diagramit.libraries.v1']!)).toHaveLength(1)
    expect(createLibrariesStore(storage).getState().libraries[0]!.manifest.id).toBe('a')
  })
  it('upsert replaces by id; entries can be added, replaced and removed', () => {
    const s = createLibrariesStore(storage)
    s.getState().upsertLibrary(lib('a'))
    s.getState().upsertLibrary(lib('a', { manifest: { id: 'a', name: 'A2', version: '2', author: 'Ann', createdAt: 'x' } }))
    expect(s.getState().libraries).toHaveLength(1)
    expect(s.getState().libraries[0]!.manifest.name).toBe('A2')
    s.getState().upsertEntry('a', { kind: 'protocol', id: 'a.p', name: 'P', protocol: { layout: 'classic', unit: 'day', pxPerUnit: 1, stages: [], rows: [], fontFamily: 'a', fontSize: 1, showCells: true, showMarkers: true, showMedia: true } })
    expect(s.getState().libraries[0]!.entries).toHaveLength(2)
    s.getState().upsertEntry('a', { kind: 'protocol', id: 'a.p', name: 'P2', protocol: { layout: 'strip', unit: 'day', pxPerUnit: 1, stages: [], rows: [], fontFamily: 'a', fontSize: 1, showCells: true, showMarkers: true, showMedia: true } })
    expect(s.getState().libraries[0]!.entries).toHaveLength(2)
    s.getState().removeEntry('a', 'a.dot')
    expect(s.getState().libraries[0]!.entries.map(entryIdOf)).toEqual(['a.p'])
  })
  it('URL libraries are read-only; duplicate makes an editable copy', () => {
    const s = createLibrariesStore(storage)
    s.getState().upsertLibrary(lib('r', { sourceUrl: 'https://x/r.json' }))
    expect(() => s.getState().upsertEntry('r', lib('r').entries[0]!)).toThrow(/read-only/)
    const copy = s.getState().duplicateLibrary('r', 'r-copy')
    expect(copy.sourceUrl).toBeUndefined()
    expect(copy.entries[0]!.kind === 'icon' && copy.entries[0]!.item.id).toBe('r-copy.dot')
    expect(s.getState().libraries).toHaveLength(2)
  })
  it('selectors list icons and report libraries used by ids', () => {
    const s = createLibrariesStore(storage)
    s.getState().upsertLibrary(lib('a'))
    s.getState().upsertLibrary(lib('b'))
    expect(s.getState().customIcons().map((i) => i.id)).toEqual(['a.dot', 'b.dot'])
    expect(s.getState().librariesUsed(['b.dot', 'cells.ipsc', 'b.other']).map((l) => l.manifest.id)).toEqual(['b'])
  })
})
