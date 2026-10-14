import { describe, expect, it } from 'vitest'
import { items } from './e16-e18'
import { validateItem } from '../../validate'

describe('embryo icons E16.5 to E18.5', () => {
  it('three valid items', () => {
    expect(items.length).toBe(3)
    expect(items.flatMap(validateItem)).toEqual([])
    items.forEach((i) => expect(i.svg).toContain('#PRIMARY'))
  })
  it('ids and sizes follow the stage contract', () => {
    expect(items.map((i) => i.id)).toEqual([
      'development.mouse-embryo-e16-5',
      'development.mouse-embryo-e17-5',
      'development.mouse-embryo-e18-5',
    ])
    items.forEach((i) => {
      expect(i.svg).toContain('viewBox="0 0 100 120"')
      expect(i.width).toBe(Math.round((i.height * 100) / 120))
    })
  })
})
