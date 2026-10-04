import { describe, expect, it } from 'vitest'
import { arrowHead, elbowPoints, pathD, shortenEnd } from './arrows'

describe('arrowHead', () => {
  it('puts the tip at the end point and the base behind it for a horizontal arrow', () => {
    const [tip, a, b] = arrowHead(0, 0, 100, 0, 10)
    expect(tip).toEqual({ x: 100, y: 0 })
    expect(a.x).toBeCloseTo(90)
    expect(b.x).toBeCloseTo(90)
    expect(a.y).toBeCloseTo(-b.y)
    expect(Math.abs(a.y)).toBeGreaterThan(0)
  })
})

describe('shortenEnd', () => {
  it('moves the end point back along the segment', () => {
    expect(shortenEnd(0, 0, 10, 0, 4)).toEqual({ x: 6, y: 0 })
  })
  it('handles zero-length segments without NaN', () => {
    const p = shortenEnd(5, 5, 5, 5, 4)
    expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true)
  })
})

describe('elbowPoints', () => {
  it('returns four points bending at the mid x', () => {
    expect(elbowPoints(0, 0, 100, 50)).toEqual([
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 50 },
    ])
  })
  it('degenerates to a straight line when aligned', () => {
    expect(elbowPoints(0, 0, 100, 0)).toHaveLength(2)
  })
})

describe('pathD', () => {
  it('formats an SVG path', () => {
    expect(pathD([{ x: 0, y: 0 }, { x: 10.126, y: 5 }])).toBe('M 0 0 L 10.13 5')
  })
})
