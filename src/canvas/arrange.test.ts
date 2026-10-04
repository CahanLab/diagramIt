import { describe, expect, it } from 'vitest'
import { alignBoxes, distributeBoxes } from './arrange'

const boxes = [
  { left: 0, top: 0, width: 10, height: 10 },
  { left: 50, top: 20, width: 20, height: 40 },
  { left: 90, top: 5, width: 10, height: 10 },
]

describe('alignBoxes', () => {
  it('aligns left edges to the min left', () => {
    expect(alignBoxes(boxes, 'left').map((p) => p.left)).toEqual([0, 0, 0])
  })
  it('aligns right edges to the max right', () => {
    expect(alignBoxes(boxes, 'right').map((p) => p.left)).toEqual([90, 80, 90])
  })
  it('aligns horizontal centres', () => {
    expect(alignBoxes(boxes, 'centerX').map((p) => p.left)).toEqual([45, 40, 45])
  })
  it('aligns top/bottom/centreY', () => {
    expect(alignBoxes(boxes, 'top').map((p) => p.top)).toEqual([0, 0, 0])
    expect(alignBoxes(boxes, 'bottom').map((p) => p.top)).toEqual([50, 20, 50])
    expect(alignBoxes(boxes, 'centerY').map((p) => p.top)).toEqual([25, 10, 25])
  })
  it('handles empty input', () => {
    expect(alignBoxes([], 'left')).toEqual([])
  })
})

describe('distributeBoxes', () => {
  it('spaces boxes evenly between the first and last', () => {
    const out = distributeBoxes(boxes, 'horizontal')
    // span 0..100, sizes 40 → gap (100-40)/2 = 30: 0, 40, 90
    expect(out.map((p) => p.left)).toEqual([0, 40, 90])
    expect(out.map((p) => p.top)).toEqual([0, 20, 5])
  })
  it('leaves fewer than three boxes unchanged', () => {
    expect(distributeBoxes(boxes.slice(0, 2), 'vertical')).toEqual([{ left: 0, top: 0 }, { left: 50, top: 20 }])
  })
})
