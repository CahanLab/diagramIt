import { describe, expect, it } from 'vitest'
import { embryoItems, items, limbItems } from './development'
import { forelimb } from './limbs/forelimb'
import { hindlimb } from './limbs/hindlimb'
import { applyColors } from '../color'
import { searchItems } from '../registry'

const limbs = items.filter((i) => /limb/.test(i.id))

describe('development limb items', () => {
  it('has 18 limb items (outline only) with unique, well-formed ids', () => {
    expect(limbs.length).toBe(18)
    expect(new Set(limbs.map((i) => i.id)).size).toBe(18)
    limbs.forEach((i) => expect(i.id).toMatch(/^development\.mouse-(fore|hind)limb-e1\d-5$/))
    expect(limbs.find((i) => i.id === 'development.mouse-forelimb-e11-5-muscle')).toBeUndefined()
  })
  it('names put the embryonic day first', () => {
    expect(limbs.find((i) => i.id === 'development.mouse-forelimb-e12-5')!.name).toBe('E12.5 forelimb')
    expect(limbs.find((i) => i.id === 'development.mouse-hindlimb-e13-5')!.name).toBe('E13.5 hindlimb')
    expect(embryoItems.find((i) => i.id === 'development.mouse-embryo-e14-5')!.name).toBe('E14.5 embryo')
  })
  it('recolours fully', () => {
    limbs.forEach((i) => {
      const out = applyColors(i.svg, i.primary, i.secondary)
      expect(out).not.toMatch(/#primary|#secondary/i)
    })
  })
  it('is searchable by stage and Theiler stage', () => {
    const ids = (q: string) => searchItems(q).map((i) => i.id)
    expect(ids('e13.5')).toContain('development.mouse-forelimb-e13-5')
    expect(ids('e13.5')).toContain('development.mouse-hindlimb-e13-5')
    expect(ids('ts21')).toContain('development.mouse-forelimb-e13-5')
    expect(ids('footplate')).toContain('development.mouse-hindlimb-e12-5')
  })
  it('default sizes grow with stage', () => {
    const fl = limbItems(forelimb)
    for (let k = 1; k < fl.length; k++) expect(fl[k]!.width).toBeGreaterThan(fl[k - 1]!.width)
    expect(limbItems(hindlimb).length).toBe(9)
  })
})

describe('development embryo items', () => {
  it('has nine embryos E10.5 to E18.5 with increasing default height', () => {
    expect(embryoItems.map((i) => i.id)).toEqual(['e10-5', 'e11-5', 'e12-5', 'e13-5', 'e14-5', 'e15-5', 'e16-5', 'e17-5', 'e18-5'].map((s) => `development.mouse-embryo-${s}`))
    for (let k = 1; k < embryoItems.length; k++) expect(embryoItems[k]!.height).toBeGreaterThan(embryoItems[k - 1]!.height)
    expect(items.length).toBe(27)
  })
  it('is searchable by Theiler stage', () => {
    expect(searchItems('ts17').map((i) => i.id)).toContain('development.mouse-embryo-e10-5')
    expect(searchItems('theiler 26').map((i) => i.id)).toContain('development.mouse-embryo-e18-5')
  })
})
