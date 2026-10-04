import { describe, expect, it } from 'vitest'
import { cmdBounds, translateCmds, translatePathD } from './types'

describe('translatePathD', () => {
  it('translates line and curve coordinates', () => {
    expect(translatePathD('M 0 0 L 10 5 C 1 2, 3 4, 5 6', 10, 20)).toBe('M 10 20 L 20 25 C 11 22 13 24 15 26')
  })
  it('keeps arc radii and flags, translating only the end point', () => {
    expect(translatePathD('M 0 0 A 5 5 0 1 1 10 0', 1, 1)).toBe('M 1 1 A 5 5 0 1 1 11 1')
  })
  it('handles H, V and Z', () => {
    expect(translatePathD('M 0 0 H 10 V 10 Z', 2, 3)).toBe('M 2 3 H 12 V 13 Z')
  })
})

describe('cmdBounds / translateCmds', () => {
  it('computes bounds over mixed commands and shifts them', () => {
    const cmds = translateCmds([
      { t: 'circle', cx: 0, cy: 0, r: 5, fill: '#000' },
      { t: 'rect', x: 10, y: 10, w: 20, h: 5, fill: '#000' },
    ], 100, 50)
    expect(cmdBounds(cmds)).toEqual({ minX: 95, minY: 45, maxX: 130, maxY: 65 })
  })
})
