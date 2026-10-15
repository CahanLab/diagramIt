import { describe, expect, it } from 'vitest'
import { clipToSlab, crescent, mapToSegment, phalanxShape, smoothOpen, type Pt } from './geometry'

const sq: Pt[] = [[0, -0.2], [1, -0.2], [1, 0.2], [0, 0.2]]

describe('mapToSegment', () => {
  it('scales the unit frame onto the segment and keeps anterior up', () => {
    const out = mapToSegment(sq, [10, 50], [30, 50])
    expect(out[0]).toEqual([10, 46])
    expect(out[1]).toEqual([30, 46])
    expect(out[2]).toEqual([30, 54])
  })
  it('rotates with the segment and applies the across factor', () => {
    const out = mapToSegment(sq, [0, 0], [0, 10], 0.5)
    expect(out[0]![0]).toBeCloseTo(1, 5)
    expect(out[0]![1]).toBeCloseTo(0, 5)
    expect(out[2]![0]).toBeCloseTo(-1, 5)
    expect(out[2]![1]).toBeCloseTo(10, 5)
  })
})

describe('phalanxShape', () => {
  it('is waisted: narrower at the middle than at the ends', () => {
    const pts = phalanxShape([0, 0], [20, 0], 2)
    const half = (x: number) => Math.max(...pts.filter((p) => Math.abs(p[0] - x) < 0.5).map((p) => Math.abs(p[1])))
    expect(half(10)).toBeLessThan(half(2.4))
    expect(half(2.4)).toBeCloseTo(2, 5)
  })
})

describe('clipToSlab', () => {
  it('keeps the middle 40 % of a rectangle', () => {
    const out = clipToSlab([[0, 0], [10, 0], [10, 4], [0, 4]], [0, 2], [10, 2], 0.3, 0.7)
    const xs = out.map((p) => p[0])
    expect(Math.min(...xs)).toBeCloseTo(3, 5)
    expect(Math.max(...xs)).toBeCloseTo(7, 5)
    expect(out.length).toBe(4)
  })
})

describe('crescent', () => {
  it('tapers to the line at both ends and bulges in the middle', () => {
    const line: Pt[] = [[0, 0], [5, 0], [10, 0], [15, 0], [20, 0]]
    const poly = crescent(line, 2, -1)
    expect(poly.length).toBe(10)
    // outer edge points (reversed) lie on the normal side of the line (negative y here) with height 0 at the ends
    const outer = poly.slice(5)
    expect(Math.abs(outer[0]![1])).toBeLessThan(1e-9)
    expect(Math.abs(outer[4]![1])).toBeLessThan(1e-9)
    expect(outer[2]![1]).toBeCloseTo(-2, 5)
  })
  it('makes a valid open spline path', () => {
    expect(smoothOpen([[0, 0], [10, 0], [20, 5]])).toMatch(/^M0 0C/)
  })
})
