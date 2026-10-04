import { describe, expect, it } from 'vitest'
import { clampZoom, fitZoom } from './page'

describe('fitZoom', () => {
  it('fits a 1600x900 page into 800x450 with zoom 0.5 and no offset', () => {
    expect(fitZoom({ w: 800, h: 450 }, { width: 1600, height: 900 }, 0)).toEqual({ zoom: 0.5, panX: 0, panY: 0 })
  })
  it('centres the page when the viewport aspect differs', () => {
    const r = fitZoom({ w: 1000, h: 450 }, { width: 1600, height: 900 }, 0)
    expect(r.zoom).toBe(0.5)
    expect(r.panX).toBe(100)
    expect(r.panY).toBe(0)
  })
  it('respects padding', () => {
    const r = fitZoom({ w: 880, h: 530 }, { width: 1600, height: 900 }, 40)
    expect(r.zoom).toBeCloseTo(0.5)
    expect(r.panX).toBeCloseTo(40)
    expect(r.panY).toBeCloseTo(40)
  })
  it('never returns a non-finite zoom for a tiny viewport', () => {
    const r = fitZoom({ w: 0, h: 0 }, { width: 1600, height: 900 })
    expect(Number.isFinite(r.zoom)).toBe(true)
    expect(r.zoom).toBeGreaterThan(0)
  })
})

describe('clampZoom', () => {
  it('clamps to [0.05, 8]', () => {
    expect(clampZoom(0.001)).toBe(0.05)
    expect(clampZoom(50)).toBe(8)
    expect(clampZoom(1)).toBe(1)
  })
})
