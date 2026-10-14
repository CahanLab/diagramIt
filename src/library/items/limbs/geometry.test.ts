import { describe, expect, it } from 'vitest'
import { buildLimb, PLATE_WEB, type LimbParams } from './geometry'

const hand = (web: number, tip?: number): LimbParams => ({
  shoulder: [10, 40],
  stylopod: { len: 30, angle: 10, width: 12, bulge: 0.1 },
  zeugopod: { len: 26, angle: -4, width: 10 },
  autopod: { angle: -6, palm: 22, width: 10, spacing: 9, arc: 2.5 },
  digits: [
    { angle: -26, len: 12, width: 4, tip },
    { angle: -12, len: 20, width: 4, tip },
    { angle: 0, len: 22, width: 4, tip },
    { angle: 12, len: 20, width: 4, tip },
    { angle: 26, len: 15, width: 4, tip },
  ],
  web,
})

const nodes = (d: string): number => (d.match(/[MC]/g) ?? []).length

describe('buildLimb', () => {
  it('closes the silhouette with a straight cut along the flank', () => {
    const g = buildLimb(hand(0.2))
    expect(g.outline).toBe(g.outlineOpen + 'z')
    expect(g.outlineOpen.startsWith(`M${g.flank.anterior[0].toFixed(1).replace(/\.0$/, '')}`)).toBe(true)
  })
  it('draws a bud as a dome whose width follows the bud profile', () => {
    const g = buildLimb({ shoulder: [10, 40], stylopod: { len: 8, angle: 0, width: 10 }, zeugopod: { len: 6, angle: 0, width: 10 }, autopod: { angle: 0, palm: 10, width: 10, spacing: 0 }, digits: [], web: 1, bud: { base: 10, width: 14, at: 0.4 } })
    expect(g.rays).toEqual([])
    const [x0, y0, x1, y1] = g.bounds
    expect(y1 - y0).toBeCloseTo(28, 1)
    expect(x1 - x0).toBeCloseTo(24, 1)
    expect(g.flank.anterior).toEqual([10, 30])
    expect(g.flank.posterior).toEqual([10, 50])
    expect(nodes(g.margin)).toBeGreaterThan(5)
  })
  it('drops the digit bases on a quadratic arc', () => {
    const g = buildLimb(hand(0.2))
    const along = (i: number) => g.rays[i]!.base[0] * g.autopodDir[0] + g.rays[i]!.base[1] * g.autopodDir[1]
    expect(along(2) - along(1)).toBeCloseTo(2.5, 1)
    expect(along(2) - along(0)).toBeCloseTo(10, 1)
  })
  it('tapers digits to the tip fraction', () => {
    const g = buildLimb(hand(0.2, 0.5))
    g.rays.forEach((r) => expect(r.tipWidth).toBeCloseTo(2, 5))
    expect(buildLimb(hand(0.2)).rays[0]!.tipWidth).toBe(4)
  })
  it('draws a webbed plate with a scalloped margin and separate digits with rounded tips', () => {
    const plate = buildLimb(hand(PLATE_WEB))
    const digits = buildLimb(hand(0.3))
    // both margins run apex, cleft, apex ... (9 nodes for five digits)
    expect(nodes(plate.margin)).toBe(9)
    expect(nodes(digits.margin)).toBe(9)
    // the plate outline has no tip side points, so it is shorter than the digit outline by four nodes per digit
    expect(nodes(digits.outline) - nodes(plate.outline)).toBe(20)
  })
})
