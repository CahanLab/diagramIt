import { describe, expect, it } from 'vitest'
import { items, models } from './e13-e15'
import { renderEmbryo } from './model'
import { validateItem } from '../../validate'
import type { LibraryItem } from '../../types'

const asItem = (id: string, svg: string): LibraryItem => ({
  id,
  name: id,
  category: 'development',
  keywords: [],
  width: 100,
  height: 120,
  primary: '#e8c9a0',
  secondary: '#374151',
  svg,
})

describe('embryo icons E13.5 to E15.5', () => {
  it('three valid items', () => {
    expect(items.length).toBe(3)
    expect(items.flatMap(validateItem)).toEqual([])
    items.forEach((i) => expect(i.svg).toContain('#PRIMARY'))
  })

  it('three models in stage order whose basic and lucida renderings validate', () => {
    expect(models.length).toBe(3)
    expect(models.map((m) => m.stage)).toEqual(['E13.5', 'E14.5', 'E15.5'])
    models.forEach((m) => {
      expect(validateItem(asItem(`development.test-${m.theiler}-basic`, renderEmbryo(m, 'basic')))).toEqual([])
      expect(validateItem(asItem(`development.test-${m.theiler}-lucida`, renderEmbryo(m, 'lucida')))).toEqual([])
    })
  })

  it('lucida style is ink only', () => {
    items.forEach((i) => {
      const svg = i.styles?.lucida?.svg
      expect(svg).toBeDefined()
      expect(svg).toContain('#PRIMARY')
      expect(svg).not.toContain('#SECONDARY')
    })
  })
})
