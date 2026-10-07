import type { ObjectData } from '../canvas/types'

interface Nodeish {
  data?: ObjectData | unknown
  getObjects?: () => Nodeish[]
}

/** Every `data.libraryId` on the given objects and, recursively, their group children (insertion order, de-duplicated). */
export function collectLibraryIds(objs: Iterable<unknown>): Set<string> {
  const out = new Set<string>()
  const walk = (o: Nodeish) => {
    const d = o.data as ObjectData | undefined
    if (d && typeof d === 'object' && typeof d.libraryId === 'string') out.add(d.libraryId)
    if (typeof o.getObjects === 'function') for (const c of o.getObjects()) walk(c)
  }
  for (const o of objs) walk(o as Nodeish)
  return out
}
