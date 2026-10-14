import { describe, expect, it } from 'vitest'
import { bbox, distToPolygon, flattenPath, parseTransform, applyM, pointInPolygon, resample, stippleField } from './tone'

describe('flattenPath', () => {
  it('flattens lines, curves, arcs and relative commands', () => {
    const sq = flattenPath('M0 0h10v10h-10z')
    expect(sq.length).toBe(1)
    expect(sq[0]!.closed).toBe(true)
    expect(sq[0]!.points).toEqual([[0, 0], [10, 0], [10, 10], [0, 10]])
    const c = flattenPath('M0 0C0 10 10 10 10 0', undefined, 4)
    expect(c[0]!.points.length).toBe(5)
    expect(c[0]!.points[4]).toEqual([10, 0])
    const circle = flattenPath('M0 5a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', undefined, 12)
    const [x0, y0, x1, y1] = bbox([circle[0]!.points])
    expect(x0).toBeCloseTo(0, 0)
    expect(x1).toBeCloseTo(10, 0)
    expect(y0).toBeCloseTo(0, 0)
    expect(y1).toBeCloseTo(10, 0)
    const q = flattenPath('M0 0q5 10 10 0', undefined, 2)
    expect(q[0]!.points[1]![1]).toBeCloseTo(5, 5)
  })
  it('applies translate/rotate/scale transforms', () => {
    const m = parseTransform('translate(10 20) rotate(90) scale(2)')
    const p = applyM(m, [1, 0])
    expect(p[0]).toBeCloseTo(10, 5)
    expect(p[1]).toBeCloseTo(22, 5)
    const t = flattenPath('M1 0L2 0', 'translate(10 20) rotate(90) scale(2)')
    expect(t[0]!.points[0]![1]).toBeCloseTo(22, 5)
  })
})

describe('polygon geometry', () => {
  const sq: [number, number][] = [[0, 0], [10, 0], [10, 10], [0, 10]]
  it('point in polygon and edge distance', () => {
    expect(pointInPolygon([5, 5], sq)).toBe(true)
    expect(pointInPolygon([15, 5], sq)).toBe(false)
    expect(distToPolygon([5, 5], sq)).toBe(5)
    expect(distToPolygon([5, 1], sq)).toBe(1)
  })
  it('resamples with normals', () => {
    const r = resample([[0, 0], [10, 0]], 2.5)
    expect(r.length).toBe(5)
    expect(r[1]!.p[0]).toBeCloseTo(2.5)
    expect(r[1]!.n).toEqual([0, -1])
  })
})

describe('stippleField', () => {
  const sq: [number, number][] = [[0, 0], [40, 0], [40, 40], [0, 40]]
  it('is deterministic and respects tone', () => {
    const a = stippleField([sq], () => 0.9, { spacing: 2, seed: 7 })
    const b = stippleField([sq], () => 0.9, { spacing: 2, seed: 7 })
    expect(a).toEqual(b)
    const dense = a.reduce((n, l) => n + l.d.split('h0.01').length - 1, 0)
    const sparse = stippleField([sq], () => 0.2, { spacing: 2, seed: 7 }).reduce((n, l) => n + l.d.split('h0.01').length - 1, 0)
    expect(dense).toBeGreaterThan(sparse * 3)
    expect(a.every((l) => [0.6, 0.9, 1.3].includes(l.width))).toBe(true)
    expect(stippleField([sq], () => 0, { spacing: 2, seed: 1 })).toEqual([])
  })
  it('keeps dots inside the polygon', () => {
    const layers = stippleField([sq], () => 1, { spacing: 3, seed: 3 })
    for (const l of layers) for (const m of l.d.matchAll(/M(-?[\d.]+) (-?[\d.]+)/g)) {
      expect(Number(m[1])).toBeGreaterThanOrEqual(0)
      expect(Number(m[1])).toBeLessThanOrEqual(40)
      expect(Number(m[2])).toBeGreaterThanOrEqual(0)
      expect(Number(m[2])).toBeLessThanOrEqual(40)
    }
  })
})
