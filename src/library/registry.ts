import type { Category, LibraryItem } from './types'
import { items as consumables } from './items/consumables'
import { items as tools } from './items/tools'
import { items as instruments } from './items/instruments'
import { items as cells } from './items/cells'
import { items as tissues } from './items/tissues'
import { items as species } from './items/species'
import { items as molbio } from './items/molbio'
import { items as analyses } from './items/analyses'
import { items as composites } from './items/composites'

const ALL: LibraryItem[] = [
  ...composites,
  ...cells,
  ...consumables,
  ...tools,
  ...instruments,
  ...tissues,
  ...species,
  ...molbio,
  ...analyses,
]

const BY_ID = new Map(ALL.map((i) => [i.id, i]))

export function allItems(): LibraryItem[] {
  return ALL
}

export function findItem(id: string): LibraryItem | undefined {
  return BY_ID.get(id)
}

export function itemsInCategory(category: Category): LibraryItem[] {
  return ALL.filter((i) => i.category === category)
}

/** Case-insensitive search over name, id and keywords. Empty query returns everything (optionally filtered by category). */
export function searchItems(query: string, category?: Category): LibraryItem[] {
  const q = query.trim().toLowerCase()
  const pool = category ? itemsInCategory(category) : ALL
  if (!q) return pool
  const terms = q.split(/\s+/)
  return pool.filter((item) => {
    const hay = [item.name, item.id, ...item.keywords].join(' ').toLowerCase()
    return terms.every((t) => hay.includes(t))
  })
}
