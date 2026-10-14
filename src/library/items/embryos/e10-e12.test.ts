import { describe, expect, it } from 'vitest'
import { items, models } from './e10-e12'
import { renderEmbryo } from './model'
import type { EmbryoModel } from './model'
import type { DrawingStyle, LibraryItem } from '../../types'
import { validateItem } from '../../validate'

const asItem = (model: EmbryoModel, style: DrawingStyle): LibraryItem => ({
  id: `development.test-${model.stage.replace('.', '-').toLowerCase()}-${style}`,
  name: `${model.stage} ${style}`,
  category: 'development',
  keywords: [],
  width: 100,
  height: 100,
  primary: '#e8c9a0',
  secondary: '#374151',
  svg: renderEmbryo(model, style),
})

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

  it('three models in stage order, valid in the basic and lucida styles', () => {
    expect(models.length).toBe(3)
    expect(models.map((m) => m.stage)).toEqual(['E10.5', 'E11.5', 'E12.5'])
    models.forEach((m) => {
      expect(validateItem(asItem(m, 'basic'))).toEqual([])
      expect(validateItem(asItem(m, 'lucida'))).toEqual([])
      m.parts.forEach((p) => expect(p.d).toMatch(/^M/))
    })
  })

  it('items carry a lucida rendering with ink only', () => {
    items.forEach((i) => {
      const lucida = i.styles?.lucida
      expect(lucida).toBeDefined()
      expect(lucida!.svg).toContain('#PRIMARY')
      expect(lucida!.svg).not.toContain('#SECONDARY')
    })
  })
})
