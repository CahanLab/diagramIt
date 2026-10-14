import { describe, expect, it } from 'vitest'
import { items } from './e13-e15'
import { validateItem } from '../../validate'

describe('embryo icons E13.5 to E15.5', () => {
  it('three valid items', () => {
    expect(items.length).toBe(3)
    expect(items.flatMap(validateItem)).toEqual([])
    items.forEach((i) => expect(i.svg).toContain('#PRIMARY'))
  })
})
