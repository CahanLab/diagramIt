import { describe, expect, it } from 'vitest'
import { allItems, findItem, renderingFor, searchItems } from './registry'
import { validateItem } from './validate'
import { applyColors } from './color'
import { CATEGORY_LABELS, CATEGORY_ORDER } from './types'

describe('applyColors', () => {
  it('substitutes tint tokens with lighter and darker derivatives', () => {
    const out = applyColors('<stop stop-color="#PRIMARYL"/><stop stop-color="#PRIMARY"/><stop stop-color="#PRIMARYD"/><path fill="#SECONDARYD"/>', '#808080', '#4080c0')
    expect(out).toContain('#b0b0b0')
    expect(out).toContain('"#808080"')
    expect(out).toContain('#575757')
    expect(out).toContain('#2c5783')
    expect(out).not.toMatch(/#primary|#secondary/i)
  })
  it('substitutes primary and secondary tokens case-insensitively', () => {
    const out = applyColors('<path fill="#PRIMARY"/><path fill="#primary"/><rect fill="#Secondary"/>', '#ff0000', '#00ff00')
    expect(out).toBe('<path fill="#ff0000"/><path fill="#ff0000"/><rect fill="#00ff00"/>')
  })
  it('falls back to primary when secondary is not given', () => {
    expect(applyColors('<rect fill="#SECONDARY"/>', '#123456')).toBe('<rect fill="#123456"/>')
  })
})

describe('validateItem gradients', () => {
  const base = { id: 'development.x', name: 'x', category: 'development' as const, keywords: [], width: 10, height: 10, primary: '#000000' }
  it('accepts gradients defined in the icon and referenced by url(#id)', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><defs><radialGradient id="dev-x-body"><stop offset="0" stop-color="#PRIMARYL"/><stop offset="1" stop-color="#PRIMARYD"/></radialGradient></defs><rect width="10" height="10" fill="url(#dev-x-body)"/></svg>'
    expect(validateItem({ ...base, svg })).toEqual([])
  })
  it('rejects url() to anything but an in-icon gradient', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="url(#elsewhere)"/></svg>'
    expect(validateItem({ ...base, svg })).toEqual(['development.x: url(#elsewhere) must reference a gradient defined in the icon'])
    expect(validateItem({ ...base, svg: svg.replace('#elsewhere', 'http://x/a.svg#g') })[0]).toContain('must reference')
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
  it('has a development category after species', () => {
    expect(CATEGORY_ORDER.indexOf('development')).toBe(CATEGORY_ORDER.indexOf('species') + 1)
    expect(CATEGORY_LABELS.development).toBe('Developmental stages')
  })
  it('renderingFor returns the styled rendering or falls back to basic', () => {
    const limb = findItem('development.mouse-forelimb-e13-5-skeleton')!
    expect(renderingFor(limb, 'lucida').svg).toBe(limb.styles!.lucida!.svg)
    expect(renderingFor(limb, 'lucida').primary).toBe('#1f2937')
    expect(renderingFor(limb, 'realistic').svg).toBe(limb.styles!.realistic!.svg)
    const plain = findItem('species.mouse')!
    expect(renderingFor(plain, 'lucida').svg).toBe(plain.svg)
    expect(renderingFor(plain, 'realistic')).toEqual({ svg: plain.svg, primary: plain.primary, secondary: plain.secondary })
  })
  it('every styled rendering validates and recolours fully', { timeout: 60000 }, () => {
    const styled = allItems().filter((i) => i.styles)
    expect(styled.length).toBe(74)
    for (const i of styled) {
      for (const r of Object.values(i.styles!)) {
        expect(validateItem({ ...i, svg: r.svg })).toEqual([])
        expect(applyColors(r.svg, r.primary, r.secondary)).not.toMatch(/#primary|#secondary/i)
      }
    }
  })
  it('findItem and searchItems work', () => {
    const first = allItems()[0]
    if (!first) return
    expect(findItem(first.id)).toBe(first)
    expect(searchItems(first.name.split(' ')[0]!).length).toBeGreaterThan(0)
    expect(searchItems('zzzz-no-such-thing')).toEqual([])
  })
})
