import { createStore, type StoreApi } from 'zustand/vanilla'
import { useStore } from 'zustand'
import { registerExternalItems } from '../library/registry'
import type { LibraryItem } from '../library/types'
import type { Ontogeny } from '../ontogeny/types'
import type { Protocol } from '../protocol/types'
import { entryIdOf, type CustomLibrary, type LibraryEntry, type LibraryManifest } from './types'

export const LIBRARIES_KEY = 'diagramit.libraries.v1'

export interface LibrariesStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface CustomProtocolTemplate { id: string; name: string; description?: string; protocol: Protocol; libraryId: string; libraryName: string }
export interface CustomOntogenyTemplate { graph: Ontogeny; libraryId: string; libraryName: string }

export interface LibrariesState {
  libraries: CustomLibrary[]
  /** Add or replace (by manifest.id). */
  upsertLibrary: (lib: CustomLibrary) => void
  removeLibrary: (id: string) => void
  updateManifest: (id: string, patch: Partial<LibraryManifest>) => void
  /** Add or replace an entry (by entry id). Throws for read-only (URL) libraries. */
  upsertEntry: (libraryId: string, entry: LibraryEntry) => void
  removeEntry: (libraryId: string, entryId: string) => void
  /** Copy a library under a new id, re-prefixing every entry id; the copy is editable. */
  duplicateLibrary: (id: string, newId: string) => CustomLibrary
  customIcons: () => LibraryItem[]
  customProtocols: () => CustomProtocolTemplate[]
  customOntogenies: () => CustomOntogenyTemplate[]
  /** Libraries that own any of the given entry ids (e.g. ObjectData.libraryId values in a document). */
  librariesUsed: (ids: Iterable<string>) => CustomLibrary[]
}

function load(storage: LibrariesStorage): CustomLibrary[] {
  try {
    const raw = storage.getItem(LIBRARIES_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? (parsed as CustomLibrary[]) : []
  } catch {
    return []
  }
}

function reprefix(entry: LibraryEntry, from: string, to: string): LibraryEntry {
  const swap = (id: string) => (id.startsWith(`${from}.`) ? `${to}.${id.slice(from.length + 1)}` : id)
  if (entry.kind === 'icon') return { kind: 'icon', item: { ...entry.item, id: swap(entry.item.id) } }
  if (entry.kind === 'protocol') return { ...entry, id: swap(entry.id) }
  return { kind: 'ontogeny', graph: { ...entry.graph, id: swap(entry.graph.id) } }
}

/** Pure selectors (stable results for a given `libraries` array; use with useMemo in components). */
export function customIconsOf(libraries: CustomLibrary[]): LibraryItem[] {
  return libraries.flatMap((l) => l.entries.flatMap((e) => (e.kind === 'icon' ? [e.item] : [])))
}
export function customProtocolsOf(libraries: CustomLibrary[]): CustomProtocolTemplate[] {
  return libraries.flatMap((l) =>
    l.entries.flatMap((e) => (e.kind === 'protocol' ? [{ id: e.id, name: e.name, description: e.description, protocol: e.protocol, libraryId: l.manifest.id, libraryName: l.manifest.name }] : [])),
  )
}
export function customOntogeniesOf(libraries: CustomLibrary[]): CustomOntogenyTemplate[] {
  return libraries.flatMap((l) => l.entries.flatMap((e) => (e.kind === 'ontogeny' ? [{ graph: e.graph, libraryId: l.manifest.id, libraryName: l.manifest.name }] : [])))
}

export function createLibrariesStore(storage: LibrariesStorage): StoreApi<LibrariesState> {
  const store = createStore<LibrariesState>((set, get) => {
    const persist = (libraries: CustomLibrary[]) => {
      set({ libraries })
      try {
        storage.setItem(LIBRARIES_KEY, JSON.stringify(libraries))
      } catch {
        /* quota or private mode: keep in memory */
      }
    }
    const find = (id: string) => {
      const lib = get().libraries.find((l) => l.manifest.id === id)
      if (!lib) throw new Error(`no library "${id}"`)
      return lib
    }
    const editable = (id: string) => {
      const lib = find(id)
      if (lib.sourceUrl) throw new Error(`"${lib.manifest.name}" was loaded from a URL and is read-only; duplicate it to edit`)
      return lib
    }
    const replace = (lib: CustomLibrary) => persist(get().libraries.map((l) => (l.manifest.id === lib.manifest.id ? lib : l)))
    return {
      libraries: load(storage),
      upsertLibrary: (lib) => {
        const rest = get().libraries.filter((l) => l.manifest.id !== lib.manifest.id)
        const idx = get().libraries.findIndex((l) => l.manifest.id === lib.manifest.id)
        persist(idx === -1 ? [...rest, lib] : [...rest.slice(0, idx), lib, ...rest.slice(idx)])
      },
      removeLibrary: (id) => persist(get().libraries.filter((l) => l.manifest.id !== id)),
      updateManifest: (id, patch) => {
        const lib = editable(id)
        replace({ ...lib, manifest: { ...lib.manifest, ...patch, id: lib.manifest.id } })
      },
      upsertEntry: (libraryId, entry) => {
        const lib = editable(libraryId)
        const id = entryIdOf(entry)
        const idx = lib.entries.findIndex((e) => entryIdOf(e) === id)
        const entries = idx === -1 ? [...lib.entries, entry] : lib.entries.map((e, i) => (i === idx ? entry : e))
        replace({ ...lib, entries })
      },
      removeEntry: (libraryId, entryId) => {
        const lib = editable(libraryId)
        replace({ ...lib, entries: lib.entries.filter((e) => entryIdOf(e) !== entryId) })
      },
      duplicateLibrary: (id, newId) => {
        const src = find(id)
        const copy: CustomLibrary = {
          app: 'diagramit-library',
          version: 1,
          manifest: { ...src.manifest, id: newId, name: `${src.manifest.name} (copy)`, createdAt: new Date().toISOString() },
          entries: src.entries.map((e) => reprefix(e, id, newId)),
        }
        get().upsertLibrary(copy)
        return copy
      },
      customIcons: () => customIconsOf(get().libraries),
      customProtocols: () => customProtocolsOf(get().libraries),
      customOntogenies: () => customOntogeniesOf(get().libraries),
      librariesUsed: (ids) => {
        const set = new Set<string>()
        for (const id of ids) {
          const dot = id.lastIndexOf('.')
          if (dot > 0) set.add(id.slice(0, dot))
        }
        return get().libraries.filter((l) => set.has(l.manifest.id))
      },
    }
  })
  return store
}

const browserStorage: LibrariesStorage = {
  getItem: (k) => (typeof localStorage === 'undefined' ? null : localStorage.getItem(k)),
  setItem: (k, v) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(k, v)
  },
}

/** App-wide store (browser localStorage). Tests build their own with createLibrariesStore. */
export const librariesStore = createLibrariesStore(browserStorage)
registerExternalItems(() => librariesStore.getState().customIcons())

export function useLibraries<T>(selector: (s: LibrariesState) => T): T {
  return useStore(librariesStore, selector)
}
