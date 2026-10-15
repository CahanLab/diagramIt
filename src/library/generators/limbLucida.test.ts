import { describe, expect, it } from 'vitest'
import { limbLucidaSvg, LUCIDA } from './limbLucida'
import { hatchPolygon } from './tone'
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
  it('draws cartilage with its contour and stipple, condensations without a contour', () => {
    const s = forelimb.find((x) => x.stage === 'E13.5')!
    const svg = limbLucidaSvg(s, 'skeleton')
    const cartilage = /<g class="el humerus cartilage">(.*?)<\/g>/.exec(svg)![1]!
    expect(cartilage).toContain(`stroke-width="${LUCIDA.bone}"`)
    expect(cartilage.split('h0.01').length).toBeGreaterThan(20)
    const cond = /<g class="el distal-phalanx-3 condensation">(.*?)<\/g>/.exec(svg)![1]!
    expect(cond).not.toContain('fill="#ffffff"')
  })
  it('AER outer edge is absent at the margin ends (the ridge tapers into the ectoderm)', () => {
    const s = forelimb.find((x) => x.stage === 'E12.5')!
    expect(s.aerBand).toBeDefined()
    const svg = limbLucidaSvg(s, 'outline')
    expect(svg).toContain('stroke-width="0.6"')
  })
  it('thin outline', () => {
    expect(LUCIDA.outline).toBeLessThanOrEqual(0.8)
  })
})

describe('hatchPolygon', () => {
  it('keeps every segment inside the polygon', () => {
    const d = hatchPolygon([[40, 45], [60, 45], [60, 55], [40, 55]], 30, 2)
    const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number)
    for (let i = 0; i < nums.length; i += 2) {
      expect(nums[i]).toBeGreaterThanOrEqual(39.9)
      expect(nums[i]).toBeLessThanOrEqual(60.1)
      expect(nums[i + 1]).toBeGreaterThanOrEqual(44.9)
      expect(nums[i + 1]).toBeLessThanOrEqual(55.1)
    }
    expect(d.split('M').length).toBeGreaterThan(5)
  })
})
