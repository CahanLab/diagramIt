import { describe, expect, it } from 'vitest'
import { items, limbItems } from './development'
import { forelimb } from './limbs/forelimb'
import { hindlimb } from './limbs/hindlimb'
import { applyColors } from '../color'
import { searchItems } from '../registry'

const limbs = items.filter((i) => /limb/.test(i.id))

describe('development limb items', () => {
  it('has 65 limb items with unique, well-formed ids', () => {
    expect(limbs.length).toBe(65)
    expect(new Set(limbs.map((i) => i.id)).size).toBe(65)
    limbs.forEach((i) => expect(i.id).toMatch(/^development\.mouse-(fore|hind)limb-e1\d-5(-skeleton|-muscle|-nerves)?$/))
  })
  it('E10.5 has outline only; E11.5 hindlimb has no muscle version', () => {
    expect(limbs.filter((i) => i.id.includes('e10-5')).map((i) => i.id).sort()).toEqual(['development.mouse-forelimb-e10-5', 'development.mouse-hindlimb-e10-5'])
    expect(limbs.find((i) => i.id === 'development.mouse-hindlimb-e11-5-muscle')).toBeUndefined()
    expect(limbs.find((i) => i.id === 'development.mouse-forelimb-e11-5-muscle')).toBeDefined()
  })
  it('names follow the house pattern', () => {
    expect(limbs.find((i) => i.id === 'development.mouse-forelimb-e12-5-skeleton')!.name).toBe('Mouse forelimb E12.5, skeleton')
    expect(limbs.find((i) => i.id === 'development.mouse-hindlimb-e14-5-muscle')!.name).toBe('Mouse hindlimb E14.5, muscle and tendon')
    expect(limbs.find((i) => i.id === 'development.mouse-forelimb-e13-5-nerves')!.name).toBe('Mouse forelimb E13.5, innervation')
    expect(limbs.find((i) => i.id === 'development.mouse-hindlimb-e13-5')!.name).toBe('Mouse hindlimb E13.5')
  })
  it('recolours fully', () => {
    limbs.forEach((i) => {
      const out = applyColors(i.svg, i.primary, i.secondary)
      expect(out).not.toMatch(/#primary|#secondary/i)
    })
  })
  it('is searchable by stage and Theiler stage', () => {
    const ids = (q: string) => searchItems(q).map((i) => i.id)
    expect(ids('e13.5')).toContain('development.mouse-forelimb-e13-5-skeleton')
    expect(ids('e13.5')).toContain('development.mouse-hindlimb-e13-5')
    expect(ids('ts21')).toContain('development.mouse-forelimb-e13-5-skeleton')
    expect(ids('alizarin')).toContain('development.mouse-hindlimb-e16-5-skeleton')
    expect(ids('neurofilament')).toContain('development.mouse-forelimb-e14-5-nerves')
  })
  it('default sizes grow with stage', () => {
    const fl = limbItems(forelimb).filter((i) => !/-(skeleton|muscle|nerves)$/.test(i.id))
    for (let k = 1; k < fl.length; k++) expect(fl[k]!.width).toBeGreaterThan(fl[k - 1]!.width)
    expect(limbItems(hindlimb).length).toBe(32)
  })
})
