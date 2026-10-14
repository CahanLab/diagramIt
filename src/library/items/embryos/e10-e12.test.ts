import { describe, expect, it } from 'vitest'
import { items } from './e10-e12'
import { validateItem } from '../../validate'

describe('embryo icons E10.5 to E12.5', () => {
  it('three valid items', () => {
    expect(items.length).toBe(3)
    expect(items.flatMap(validateItem)).toEqual([])
    items.forEach((i) => expect(i.svg).toContain('#PRIMARY'))
  })

  it('ids, names and sizes follow the stage pattern', () => {
    expect(items.map((i) => i.id)).toEqual([
      'development.mouse-embryo-e10-5',
      'development.mouse-embryo-e11-5',
      'development.mouse-embryo-e12-5',
    ])
    expect(items.map((i) => i.name)).toEqual(['Mouse embryo E10.5', 'Mouse embryo E11.5', 'Mouse embryo E12.5'])
    expect(items.map((i) => i.height)).toEqual([90, 97, 105])
    items.forEach((i) => {
      expect(i.width).toBe(i.height)
      expect(i.category).toBe('development')
      expect(i.svg).toContain('viewBox="0 0 100 100"')
      expect(i.svg).toContain('#SECONDARY')
      expect(i.svg).not.toMatch(/<svg[^>]*\s(width|height)=/)
    })
  })

  it('stays legible: at most 25 drawn elements per icon', () => {
    items.forEach((i) => {
      const n = (i.svg.match(/<(path|circle|ellipse|rect|line|polyline|polygon)\b/g) ?? []).length
      expect(n).toBeLessThanOrEqual(25)
    })
  })
})
