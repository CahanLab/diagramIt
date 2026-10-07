import type { LibraryItem } from '../library/types'
import type { Ontogeny } from '../ontogeny/types'
import type { Protocol } from '../protocol/types'

/** Who made a library and how to credit them. */
export interface LibraryManifest {
  /** Kebab-case, globally unique by convention (e.g. "cahanlab-kidney"). */
  id: string
  name: string
  /** Free text, e.g. "1.0". */
  version: string
  author: string
  affiliation?: string
  url?: string
  license?: string
  /** Replaces the generated "using the X library by Y" clause when set. */
  acknowledgement?: string
  description?: string
  /** ISO date. */
  createdAt: string
}

export type LibraryEntry =
  | { kind: 'icon'; item: LibraryItem }
  | { kind: 'protocol'; id: string; name: string; description?: string; protocol: Protocol }
  | { kind: 'ontogeny'; graph: Ontogeny }

/** On-disk and in-memory form of a user-made library (`*.diagramit-lib.json`). */
export interface CustomLibrary {
  app: 'diagramit-library'
  version: 1
  manifest: LibraryManifest
  entries: LibraryEntry[]
  /** Set when loaded from a URL; such libraries are read-only in the app. */
  sourceUrl?: string
}

export const LIBRARY_FILE_SUFFIX = '.diagramit-lib.json'

export function entryIdOf(e: LibraryEntry): string {
  return e.kind === 'icon' ? e.item.id : e.kind === 'protocol' ? e.id : e.graph.id
}

export function entryNameOf(e: LibraryEntry): string {
  return e.kind === 'icon' ? e.item.name : e.kind === 'protocol' ? e.name : e.graph.name
}
