import { describe, expect, it } from 'vitest'
import { forelimb } from './forelimb'
import { hindlimb } from './hindlimb'
import { FORELIMB_ELEMENTS, HINDLIMB_ELEMENTS, STAGES, type ElementName, type ElementState, type LimbStage, type Stage } from './types'
import { availableVersions, limbSvg } from '../../generators/limb'
import { validateItem } from '../../validate'

const count = (st: LimbStage, name: ElementName, state?: ElementState) =>
  st.elements.filter((e) => e.name === name && (!state || e.state === state)).length
const item = (svg: string) => ({ id: 'development.x', name: 'x', category: 'development' as const, keywords: [], svg, width: 10, height: 10, primary: '#000000' })

function common(list: LimbStage[], allowed: ReadonlySet<ElementName>) {
  it('has nine stages in order', () => expect(list.map((s) => s.stage)).toEqual(STAGES))
  it('uses only the allowed element names', () => list.forEach((s) => s.elements.forEach((e) => expect(allowed.has(e.name)).toBe(true))))
  it('E10.5 has no tissues', () => {
    const s = list[0]!
    expect(s.elements).toEqual([])
    expect(s.muscles).toEqual([])
    expect(s.tendons).toEqual([])
    expect(s.nerves).toEqual([])
  })
  it('no ossification before E15.5', () =>
    list.filter((s) => s.stage < 'E15.5').forEach((s) => expect(s.elements.some((e) => e.state === 'ossifying')).toBe(false)))
  it('every capsule endpoint lies inside the viewBox', () =>
    list.forEach((s) => {
      const [, , w, h] = s.viewBox.split(' ').map(Number) as [number, number, number, number]
      s.elements.forEach((e) =>
        [e.p, e.d].forEach(([x, y]) => {
          expect(x).toBeGreaterThanOrEqual(0)
          expect(x).toBeLessThanOrEqual(w)
          expect(y).toBeGreaterThanOrEqual(0)
          expect(y).toBeLessThanOrEqual(h)
        }),
      )
    }))
  it('every stage from E12.5 has four versions and all validate', () =>
    list.forEach((s) => {
      if (s.stage >= 'E12.5') expect(availableVersions(s)).toEqual(['outline', 'skeleton', 'muscle', 'nerves'])
      availableVersions(s).forEach((v) => expect(validateItem(item(limbSvg(s, v)))).toEqual([]))
    }))
  it('limb length grows with stage', () => {
    for (let i = 1; i < list.length; i++) expect(list[i]!.lengthMm).toBeGreaterThan(list[i - 1]!.lengthMm)
  })
}

describe('forelimb stages', () => {
  const by = (s: Stage) => forelimb.find((x) => x.stage === s)!
  common(forelimb, FORELIMB_ELEMENTS)
  it('E11.5 has a humerus condensation, two muscle masses, nerves, no tendons', () => {
    const s = by('E11.5')
    expect(s.elements.length).toBe(1)
    expect(count(s, 'humerus', 'condensation')).toBe(1)
    expect(s.muscles.length).toBe(2)
    expect(s.tendons.length).toBe(0)
    expect(s.nerves.length).toBeGreaterThan(0)
  })
  it('E12.5 has humerus, radius, ulna cartilage and metacarpal condensations only', () => {
    const s = by('E12.5')
    expect(count(s, 'humerus', 'cartilage')).toBe(1)
    expect(count(s, 'radius', 'cartilage')).toBe(1)
    expect(count(s, 'ulna', 'cartilage')).toBe(1)
    expect(count(s, 'metacarpal', 'condensation')).toBe(5)
    expect(count(s, 'proximal-phalanx')).toBe(0)
  })
  it('E13.5 has distal phalanges as condensation only and all metacarpals as cartilage', () => {
    const s = by('E13.5')
    expect(count(s, 'distal-phalanx', 'condensation')).toBe(4)
    expect(count(s, 'distal-phalanx', 'cartilage')).toBe(0)
    expect(count(s, 'metacarpal', 'cartilage')).toBe(5)
  })
  it('E14.5 has every phalanx as cartilage and sleeves on the long bones', () => {
    const s = by('E14.5')
    expect(count(s, 'distal-phalanx', 'cartilage')).toBe(5)
    expect(count(s, 'humerus', 'sleeve')).toBe(1)
    expect(count(s, 'radius', 'sleeve')).toBe(1)
    expect(count(s, 'ulna', 'sleeve')).toBe(1)
  })
  it('humerus ossifies at E15.5, all long bones by E16.5, metacarpals at E17.5, proximal phalanges at E18.5', () => {
    expect(count(by('E15.5'), 'humerus', 'ossifying')).toBe(1)
    expect(count(by('E15.5'), 'radius', 'ossifying')).toBe(0)
    ;(['humerus', 'radius', 'ulna'] as ElementName[]).forEach((n) => expect(count(by('E16.5'), n, 'ossifying')).toBe(1))
    expect(count(by('E16.5'), 'metacarpal', 'ossifying')).toBe(0)
    expect(count(by('E17.5'), 'metacarpal', 'ossifying')).toBe(4)
    expect(count(by('E18.5'), 'proximal-phalanx', 'ossifying')).toBe(4)
  })
})

describe('hindlimb stages', () => {
  const by = (s: Stage) => hindlimb.find((x) => x.stage === s)!
  common(hindlimb, HINDLIMB_ELEMENTS)
  it('E11.5 has a faint femur condensation and nerves at the base, no muscle', () => {
    const s = by('E11.5')
    expect(s.elements.length).toBe(1)
    expect(count(s, 'femur', 'condensation')).toBe(1)
    expect(availableVersions(s)).toEqual(['outline', 'skeleton', 'nerves'])
  })
  it('E12.5 has long bones and metatarsals 2 to 4 as condensations, muscle masses, trunks', () => {
    const s = by('E12.5')
    ;(['femur', 'tibia', 'fibula'] as ElementName[]).forEach((n) => expect(count(by('E12.5'), n, 'condensation')).toBe(1))
    expect(count(s, 'metatarsal', 'condensation')).toBe(3)
    expect(s.elements.some((e) => e.state === 'cartilage')).toBe(false)
    expect(s.muscles.length).toBe(2)
    expect(s.nerves.length).toBeGreaterThan(0)
  })
  it('E13.5 distal phalanges and metatarsals 1 and 5 are condensation; E14.5 all cartilage', () => {
    expect(count(by('E13.5'), 'distal-phalanx', 'cartilage')).toBe(0)
    expect(count(by('E13.5'), 'distal-phalanx', 'condensation')).toBe(4)
    expect(count(by('E13.5'), 'metatarsal', 'condensation')).toBe(2)
    expect(count(by('E13.5'), 'metatarsal', 'cartilage')).toBe(3)
    expect(count(by('E14.5'), 'distal-phalanx', 'cartilage')).toBe(5)
    expect(count(by('E14.5'), 'femur', 'sleeve')).toBe(1)
  })
  it('E15.5 ossifies the femur only; all long bones by E16.5', () => {
    expect(count(by('E15.5'), 'femur', 'ossifying')).toBe(1)
    expect(count(by('E15.5'), 'tibia', 'ossifying')).toBe(0)
    ;(['femur', 'tibia', 'fibula'] as ElementName[]).forEach((n) => expect(count(by('E16.5'), n, 'ossifying')).toBe(1))
    expect(count(by('E17.5'), 'metatarsal', 'ossifying')).toBe(4)
    expect(count(by('E18.5'), 'proximal-phalanx', 'ossifying')).toBe(4)
  })
})
