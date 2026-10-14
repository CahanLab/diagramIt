import { describe, expect, it } from 'vitest'
import { items, models } from './e16-e18'
import { renderEmbryo } from './model'
import { validateItem } from '../../validate'
import type { LibraryItem } from '../../types'

const asItem = (svg: string, n: number): LibraryItem => ({
  id: `development.test-embryo-${n}`,
  name: `Test embryo ${n}`,
  category: 'development',
  keywords: ['test'],
  width: 100,
  height: 120,
  svg,
  primary: '#e8c9a0',
  secondary: '#374151',
})

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
  it('three models in stage order whose basic and lucida renderings validate', () => {
    expect(models.length).toBe(3)
    expect(models.map((m) => m.stage)).toEqual(['E16.5', 'E17.5', 'E18.5'])
    models.forEach((m, n) => {
      expect(validateItem(asItem(renderEmbryo(m, 'basic'), n))).toEqual([])
      expect(validateItem(asItem(renderEmbryo(m, 'lucida'), n))).toEqual([])
    })
  })
  it('each item carries a lucida style in ink only', () => {
    items.forEach((i) => {
      const lucida = i.styles?.lucida
      expect(lucida).toBeDefined()
      expect(lucida!.svg).toContain('#PRIMARY')
      expect(lucida!.svg).not.toContain('#SECONDARY')
    })
  })
})
