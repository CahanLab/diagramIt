import { describe, expect, it } from 'vitest'
import { collectLibraryIds } from './used'

describe('collectLibraryIds', () => {
  it('collects data.libraryId recursively through groups, ignoring built-ins only when asked', () => {
    const objs = [
      { data: { kind: 'icon', libraryId: 'cells.ipsc' } },
      { data: { kind: 'group' }, getObjects: () => [{ data: { kind: 'icon', libraryId: 'mylib.dot' } }, { data: { kind: 'shape' } }] },
      { data: { kind: 'protocol', libraryId: 'mylib.proto' } },
      {},
    ]
    expect([...collectLibraryIds(objs)]).toEqual(['cells.ipsc', 'mylib.dot', 'mylib.proto'])
  })
})
