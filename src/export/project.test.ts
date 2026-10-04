import { describe, expect, it } from 'vitest'
import { normalizeProjectJson } from './project'

describe('normalizeProjectJson', () => {
  it('rejects non-project input', () => {
    expect(() => normalizeProjectJson({ foo: 1 })).toThrow(/Not a DiagramIt/)
    expect(() => normalizeProjectJson(null)).toThrow()
  })
  it('fills defaults for a minimal file and keeps unknown data kinds', () => {
    const f = normalizeProjectJson({ app: 'diagramit', canvas: { objects: [{ type: 'Rect', data: { kind: 'future-thing' } }] } })
    expect(f.page).toEqual({ width: 1600, height: 900, background: '#ffffff' })
    expect(f.name).toBe('Untitled')
    expect((f.canvas.objects as unknown[]).length).toBe(1)
  })
  it('repairs bad page values', () => {
    const f = normalizeProjectJson({ app: 'diagramit', page: { width: -5, height: 'x', background: 7 }, canvas: {} })
    expect(f.page.width).toBe(1600)
    expect(f.page.height).toBe(900)
    expect(f.page.background).toBe('#ffffff')
    expect(f.canvas.objects).toEqual([])
  })
})
