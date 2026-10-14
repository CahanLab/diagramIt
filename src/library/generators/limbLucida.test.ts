import { describe, expect, it } from 'vitest'
import { hatchEllipse, limbLucidaSvg, stippleCapsule } from './limbLucida'
import { availableVersions } from './limb'
import { forelimb } from '../items/limbs/forelimb'
import { hindlimb } from '../items/limbs/hindlimb'
import { validateItem } from '../validate'
import { OUTLINE } from '../types'

const item = (svg: string) => ({ id: 'development.x', name: 'x', category: 'development' as const, keywords: [], svg, width: 10, height: 10, primary: '#000000' })

describe('limbLucidaSvg', () => {
  it('renders every stage and version as valid ink-only SVG', () => {
    for (const s of [...forelimb, ...hindlimb]) {
      for (const v of availableVersions(s)) {
        const svg = limbLucidaSvg(s, v)
        expect(validateItem(item(svg))).toEqual([])
        expect(svg).toContain('#PRIMARY')
        expect(svg).not.toContain('#SECONDARY')
        expect(svg).not.toContain(OUTLINE)
        const fills = [...svg.matchAll(/fill="([^"]+)"/g)].map((m) => m[1])
        fills.forEach((f) => expect(['none', '#ffffff', '#PRIMARY']).toContain(f))
      }
    }
  })
  it('is deterministic', () => {
    const s = forelimb[4]!
    expect(limbLucidaSvg(s, 'skeleton')).toBe(limbLucidaSvg(s, 'skeleton'))
  })
  it('stipples condensations more sparsely than cartilage', () => {
    const e = { name: 'humerus' as const, state: 'cartilage' as const, p: [10, 10] as [number, number], d: [50, 10] as [number, number], r: 5 }
    const dense = stippleCapsule(e, 1.4, false, () => 0.5).split('h0.01').length
    const sparse = stippleCapsule({ ...e, state: 'condensation' }, 2.6, true, () => 0.5).split('h0.01').length
    expect(dense).toBeGreaterThan(sparse * 2)
  })
  it('hatches within the ellipse', () => {
    const d = hatchEllipse({ c: [50, 50], rx: 10, ry: 5, angle: 0 }, 2)
    const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number)
    for (let i = 0; i < nums.length; i += 2) {
      expect(nums[i]).toBeGreaterThanOrEqual(39)
      expect(nums[i]).toBeLessThanOrEqual(61)
      expect(nums[i + 1]).toBeGreaterThanOrEqual(44)
      expect(nums[i + 1]).toBeLessThanOrEqual(56)
    }
    expect(d.split('M').length).toBeGreaterThan(5)
  })
})
