import { describe, expect, it } from 'vitest'
import { items, models, tracedModel } from './items'
import { renderEmbryo } from './model'
import { TRACED } from './traced'
import { STAGES } from '../limbs/types'
import { validateItem } from '../../validate'
import { applyColors } from '../../color'
import { OUTLINE } from '../../types'

const item = (svg: string) => ({ id: 'development.x', name: 'x', category: 'development' as const, keywords: [], svg, width: 10, height: 10, primary: '#000000' })

describe('traced embryo models', () => {
  it('has nine stages with the plate viewBox and growing crown-rump length', () => {
    expect(models.map((m) => m.stage)).toEqual(STAGES)
    for (let k = 1; k < STAGES.length; k++) expect(TRACED[STAGES[k]!].crl).toBeGreaterThan(TRACED[STAGES[k - 1]!].crl)
    models.forEach((m) => expect(m.viewBox).toBe(TRACED[m.stage].viewBox))
  })
  it('places the eye and vibrissae inside the silhouette', () => {
    const m = tracedModel('E14.5')
    const eye = m.parts.find((p) => p.tag === 'eye')!
    const vib = m.parts.find((p) => p.tag === 'vibrissae')!
    expect(eye.draw).toBe('fill-secondary')
    expect(vib.d.split('h0.01').length).toBeGreaterThan(10)
    expect(tracedModel('E11.5').parts.find((p) => p.tag === 'lens')).toBeDefined()
    expect(tracedModel('E17.5').parts.find((p) => p.tag === 'eyelid')).toBeDefined()
    expect(tracedModel('E12.5').parts.find((p) => p.tag === 'vibrissae')).toBeUndefined()
  })
  it('scales the outline width to about 1.3 px at the default size', () => {
    models.forEach((m) => {
      const it = items.find((i) => i.id.endsWith(m.stage.toLowerCase().replace('.', '-')))!
      const [, , , vbH] = m.viewBox.split(' ').map(Number) as [number, number, number, number]
      expect((m.strokeWidth * it.height) / vbH).toBeCloseTo(1.3, 1)
    })
  })
  it('renders every style as valid SVG; lucida is ink only', () => {
    for (const m of models) {
      for (const style of ['basic', 'lucida', 'realistic'] as const) {
        const svg = renderEmbryo(m, style)
        expect(validateItem(item(svg))).toEqual([])
        expect(svg).toContain('#PRIMARY')
      }
      const lucida = renderEmbryo(m, 'lucida')
      expect(lucida).not.toContain('#SECONDARY')
      expect(lucida).not.toContain(OUTLINE)
      const fills = [...lucida.matchAll(/fill="([^"]+)"/g)].map((x) => x[1])
      fills.forEach((f) => expect(['none', '#ffffff', '#PRIMARY']).toContain(f))
      expect(applyColors(renderEmbryo(m, 'realistic'), '#e9b99b', '#2b2b33')).not.toMatch(/#primary|#secondary/i)
    }
  })
  it('items carry ids, keywords and growing default heights', () => {
    expect(items.map((i) => i.id)).toEqual(STAGES.map((s) => `development.mouse-embryo-${s.toLowerCase().replace('.', '-')}`))
    for (let k = 1; k < items.length; k++) expect(items[k]!.height).toBeGreaterThan(items[k - 1]!.height)
    expect(items[0]!.keywords).toContain('ts17')
    expect(items[8]!.keywords).toContain('theiler 26')
    items.forEach((i) => expect(validateItem(i)).toEqual([]))
  })
})
