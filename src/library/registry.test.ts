import { describe, expect, it } from 'vitest'
import { allItems, findItem, searchItems } from './registry'
import { validateItem } from './validate'
import { applyColors } from './color'

describe('applyColors', () => {
  it('substitutes primary and secondary tokens case-insensitively', () => {
    const out = applyColors('<path fill="#PRIMARY"/><path fill="#primary"/><rect fill="#Secondary"/>', '#ff0000', '#00ff00')
    expect(out).toBe('<path fill="#ff0000"/><path fill="#ff0000"/><rect fill="#00ff00"/>')
  })
  it('falls back to primary when secondary is not given', () => {
    expect(applyColors('<rect fill="#SECONDARY"/>', '#123456')).toBe('<rect fill="#123456"/>')
  })
})

describe('library registry', () => {
  it('has unique ids', () => {
    const ids = allItems().map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('every item validates (parses, viewBox, allowed elements)', () => {
    const problems = allItems().flatMap(validateItem)
    expect(problems).toEqual([])
  })
  it('every item uses #PRIMARY somewhere so it is recolourable', () => {
    const missing = allItems().filter((i) => !/#primary\b/i.test(i.svg)).map((i) => i.id)
    expect(missing).toEqual([])
  })
  it('findItem and searchItems work', () => {
    const first = allItems()[0]
    if (!first) return
    expect(findItem(first.id)).toBe(first)
    expect(searchItems(first.name.split(' ')[0]!).length).toBeGreaterThan(0)
    expect(searchItems('zzzz-no-such-thing')).toEqual([])
  })
})
