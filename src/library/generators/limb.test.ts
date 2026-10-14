import { describe, expect, it } from 'vitest'
import { availableVersions, limbDefaultSize, limbSvg, LIMB_COLORS } from './limb'
import type { LimbStage } from '../items/limbs/types'
import { validateItem } from '../validate'

const fixture: LimbStage = {
  limb: 'forelimb',
  stage: 'E14.5',
  theiler: 22,
  lengthMm: 3,
  viewBox: '0 0 160 100',
  outline: 'M10 30h120v40H10z',
  aer: 'M130 30v40',
  hairPlacodes: [[40, 40]],
  elements: [
    { name: 'humerus', state: 'cartilage', p: [14, 50], d: [50, 50], r: 6 },
    { name: 'metacarpal', digit: 3, state: 'condensation', p: [100, 44], d: [120, 42], r: 3 },
    { name: 'radius', state: 'ossifying', p: [54, 46], d: [92, 44], r: 4 },
    { name: 'ulna', state: 'sleeve', p: [54, 58], d: [92, 58], r: 4 },
  ],
  muscles: [{ name: 'biceps', path: 'M20 40c10-6 20-6 30 0c-10 6-20 6-30 0z' }],
  tendons: [{ name: 'edc', path: 'M60 44L120 40' }],
  nerves: [{ name: 'radial', path: 'M12 46L90 44', width: 3 }],
}
const empty: LimbStage = { ...fixture, elements: [], muscles: [], tendons: [], nerves: [] }
const item = (svg: string) => ({ id: 'development.x', name: 'x', category: 'development' as const, keywords: [], svg, width: 10, height: 10, primary: '#000000' })

describe('limbSvg', () => {
  it('outline version has the body only', () => {
    const s = limbSvg(fixture, 'outline')
    expect(s.match(/#PRIMARY/g)?.length).toBe(1)
    expect(s).not.toContain('#SECONDARY')
    expect(s).not.toContain(LIMB_COLORS.muscle)
    expect(s).not.toContain(LIMB_COLORS.nerve)
    expect(s).toContain(LIMB_COLORS.aer)
    expect(s).toContain('<circle')
  })
  it('skeleton version draws capsules by state', () => {
    const s = limbSvg(fixture, 'skeleton')
    expect(s).toContain('class="el humerus cartilage"')
    expect(s).toContain('class="el metacarpal-3 condensation"')
    expect(s.match(/stroke-opacity="0.4"/g)?.length).toBe(1)
    expect(s.match(new RegExp(LIMB_COLORS.ossifying, 'g'))?.length).toBe(1)
    expect(s.match(new RegExp(LIMB_COLORS.sleeve, 'g'))?.length).toBe(1)
    expect(s).not.toContain(LIMB_COLORS.muscle)
    expect(s).not.toContain(LIMB_COLORS.nerve)
    expect(s).not.toMatch(/<path[^>]*fill="#1f2937"/)
  })
  it('muscle version adds muscle and tendon, no nerves', () => {
    const s = limbSvg(fixture, 'muscle')
    expect(s).toContain(LIMB_COLORS.muscle)
    expect(s).toContain(LIMB_COLORS.tendon)
    expect(s).toContain('#SECONDARY')
    expect(s).not.toContain(LIMB_COLORS.nerve)
  })
  it('nerves version adds nerves, no muscle', () => {
    const s = limbSvg(fixture, 'nerves')
    expect(s).toContain(LIMB_COLORS.nerve)
    expect(s).toContain('#SECONDARY')
    expect(s).not.toContain(LIMB_COLORS.muscle)
  })
  it('every version validates', () => {
    for (const v of availableVersions(fixture)) expect(validateItem(item(limbSvg(fixture, v)))).toEqual([])
  })
})

describe('availableVersions', () => {
  it('lists only versions with tissue', () => {
    expect(availableVersions(empty)).toEqual(['outline'])
    expect(availableVersions({ ...empty, elements: fixture.elements })).toEqual(['outline', 'skeleton'])
    expect(availableVersions({ ...empty, nerves: fixture.nerves })).toEqual(['outline', 'nerves'])
    expect(availableVersions(fixture)).toEqual(['outline', 'skeleton', 'muscle', 'nerves'])
  })
})

describe('limbDefaultSize', () => {
  it('scales width with limb length and keeps the viewBox aspect', () => {
    expect(limbDefaultSize({ ...fixture, lengthMm: 0.9 })).toEqual({ width: 70, height: 44 })
    expect(limbDefaultSize({ ...fixture, lengthMm: 6 })).toEqual({ width: 140, height: 88 })
  })
})
