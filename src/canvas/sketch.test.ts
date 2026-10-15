import { describe, expect, it } from 'vitest'
import { commandsToD, dotsPathD, eraseCommands, eraseDots, eraseRuns, flattenSubpath, mulberry32, runsPathD, scatterDots, sketchPaint, splitSubpaths, stampCount, sweepCount, type Dot, type Pt } from './sketch'

const run: Pt[] = [[0, 0], [10, 0], [20, 10], [30, 10]]

describe('runsPathD', () => {
  it('draws straight segments at smoothing 0', () => {
    expect(runsPathD([run], 0)).toBe('M0 0L10 0L20 10L30 10')
  })
  it('draws a spline at smoothing 1 and shorter handles at 0.5', () => {
    const full = runsPathD([run], 1)
    const half = runsPathD([run], 0.5)
    expect(full.startsWith('M0 0C')).toBe(true)
    expect(full.split('C').length).toBe(4)
    // the first handle of the second segment is p1 + (p2 - p0)/6 * t: (10 + 20/6 t, 10/6 t)
    expect(full).toContain('C13.33 1.67')
    expect(half).toContain('C11.67 0.83')
  })
  it('keeps a single point as a dot and separates runs', () => {
    expect(runsPathD([[[5, 5]], [[0, 0], [1, 1]]], 1)).toBe('M5 5h0.01M0 0L1 1')
  })
})

describe('dotsPathD and sketchPaint', () => {
  const dots: Dot[] = [[10, 10, 2, 0], [20, 10, 1, Math.PI / 2]]
  it('dots and rings are circles, ticks are segments along the angle', () => {
    expect(dotsPathD(dots, 'dot')).toBe('M9 10a1 1 0 1 0 2 0a1 1 0 1 0 -2 0zM19.5 10a0.5 0.5 0 1 0 1 0a0.5 0.5 0 1 0 -1 0z')
    expect(dotsPathD(dots, 'tick')).toBe('M7.5 10L12.5 10M20 8.75L20 11.25')
  })
  it('dots are filled, rings and ticks stroked', () => {
    expect(sketchPaint({ tool: 'stipple', dots, style: 'dot', size: 2 }, '#123', 1)).toEqual({ fill: '#123', stroke: null, strokeWidth: 0 })
    expect(sketchPaint({ tool: 'stipple', dots, style: 'ring', size: 2 }, '#123', 1)).toEqual({ fill: null, stroke: '#123', strokeWidth: 0.6 })
    expect(sketchPaint({ tool: 'pen', runs: [run], smooth: 1 }, '#123', 1.5)).toEqual({ fill: null, stroke: '#123', strokeWidth: 1.5 })
  })
})

describe('stipple generation', () => {
  it('is deterministic for a seed, inside the disc, with sizes and angles in range', () => {
    const a = scatterDots(mulberry32(7), 50, 50, 10, 40, 2, 1)
    const b = scatterDots(mulberry32(7), 50, 50, 10, 40, 2, 1)
    expect(a).toEqual(b)
    expect(a.length).toBe(40)
    for (const [x, y, s, ang] of a) {
      expect(Math.hypot(x - 50, y - 50)).toBeLessThanOrEqual(10.01)
      expect(s).toBeGreaterThanOrEqual(1.5)
      expect(s).toBeLessThanOrEqual(2.5)
      expect(Math.abs(ang - 1)).toBeLessThanOrEqual(0.36)
    }
  })
  it('counts dots from density, radius and distance with a carry', () => {
    expect(stampCount(4, 10)).toBe(6)
    const s1 = sweepCount(4, 10, 3, 0) // 0.04 * 20 * 3 = 2.4
    expect(s1).toEqual({ n: 2, carry: expect.closeTo(0.4, 6) })
    const s2 = sweepCount(4, 10, 3, s1.carry)
    expect(s2.n).toBe(2)
    expect(s2.carry).toBeCloseTo(0.8, 6)
  })
})

describe('erasing', () => {
  it('splits runs where points are removed and drops stubs', () => {
    const r = eraseRuns([[[0, 0], [10, 0], [20, 0], [30, 0], [40, 0]]], [20, 0], 2)
    expect(r.changed).toBe(true)
    expect(r.runs).toEqual([[[0, 0], [10, 0]], [[30, 0], [40, 0]]])
    const stub = eraseRuns([[[0, 0], [10, 0], [20, 0]]], [10, 0], 2)
    expect(stub.runs).toEqual([])
    expect(stub.changed).toBe(true)
    expect(eraseRuns([[[0, 0], [10, 0]]], [50, 50], 2)).toEqual({ runs: [[[0, 0], [10, 0]]], changed: false })
  })
  it('removes dots inside the circle', () => {
    const r = eraseDots([[0, 0, 1, 0], [5, 0, 1, 0], [9, 0, 1, 0]], [5, 0], 3)
    expect(r.dots).toEqual([[0, 0, 1, 0], [9, 0, 1, 0]])
    expect(r.changed).toBe(true)
  })
  it('flattens curves, keeps untouched subpaths intact and re-emits touched ones as runs', () => {
    const cmds = [['M', 0, 0], ['C', 10, 0, 20, 0, 30, 0], ['M', 100, 100], ['L', 110, 100], ['Z']]
    expect(splitSubpaths(cmds).length).toBe(2)
    expect(flattenSubpath(cmds.slice(0, 2)).points.length).toBe(9)
    const r = eraseCommands(cmds, [15, 0], 4)
    expect(r.changed).toBe(true)
    // first subpath is now two straight runs around the gap; second is untouched (still has its Z)
    const d = commandsToD(r.cmds)
    expect(d).toContain('M100 100L110 100Z')
    expect(d).not.toContain('C')
    expect(d.startsWith('M0 0L')).toBe(true)
    expect(eraseCommands(cmds, [500, 500], 4).changed).toBe(false)
  })
})
