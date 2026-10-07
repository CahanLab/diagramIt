import { describe, expect, it } from 'vitest'
import raw from '../../public/libraries/example.diagramit-lib.json?raw'
import { normalizeLibrary } from './normalize'

describe('shipped example library', () => {
  it('public/libraries/example.diagramit-lib.json is valid', () => {
    const lib = normalizeLibrary(raw)
    expect(lib.manifest.id).toBe('diagramit-example')
    expect(lib.entries.map((e) => e.kind)).toEqual(['icon', 'icon', 'protocol'])
  })
})
