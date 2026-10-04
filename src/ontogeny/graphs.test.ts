import { describe, expect, it } from 'vitest'
import { ONTOGENIES } from './graphs'
import { validateOntogeny } from './validate'

describe('curated ontologies', () => {
  it('have unique ids', () => {
    const ids = ONTOGENIES.map((g) => g.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  for (const g of ONTOGENIES) {
    it(`${g.id} is structurally valid`, () => {
      expect(validateOntogeny(g)).toEqual([])
    })
  }
})
