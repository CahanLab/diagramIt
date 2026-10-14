import { describe, expect, it } from 'vitest'
import { limbRealisticSvg } from './limbRealistic'
import { availableVersions } from './limb'
import { forelimb } from '../items/limbs/forelimb'
import { hindlimb } from '../items/limbs/hindlimb'
import { validateItem } from '../validate'
import { applyColors } from '../color'

const item = (svg: string) => ({ id: 'development.x', name: 'x', category: 'development' as const, keywords: [], svg, width: 10, height: 10, primary: '#000000' })

describe('limbRealisticSvg', () => {
  it('renders every stage and version as valid gradient SVG that recolours fully', () => {
    const ids = new Set<string>()
    for (const s of [...forelimb, ...hindlimb]) {
      for (const v of availableVersions(s)) {
        const svg = limbRealisticSvg(s, v)
        expect(validateItem(item(svg))).toEqual([])
        expect(svg).toContain('<radialGradient id="rl-')
        expect(svg).toContain('#PRIMARYL')
        expect(applyColors(svg, '#e8b89a', '#7fa8dc')).not.toMatch(/#primary|#secondary/i)
        const id = /radialGradient id="([^"]+)"/.exec(svg)![1]!
        expect(ids.has(id)).toBe(false)
        ids.add(id)
      }
    }
  })
  it('skeleton version shades cartilage with a highlight and condensation as a glow', () => {
    const s = forelimb.find((x) => x.stage === 'E12.5')!
    const svg = limbRealisticSvg(s, 'skeleton')
    expect(svg).toContain('stroke="#SECONDARYL"')
    expect(svg).toContain('stroke-opacity="0.16"')
    expect(svg).not.toContain('#b3463b')
  })
})
