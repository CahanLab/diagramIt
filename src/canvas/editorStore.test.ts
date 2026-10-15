import { describe, expect, it } from 'vitest'
import { DEFAULT_SKETCH, useEditor } from './editorStore'

describe('sketch settings', () => {
  it('start from the defaults and persist changes', () => {
    expect(useEditor.getState().sketch).toEqual(DEFAULT_SKETCH)
    useEditor.getState().setSketch({ penWidth: 3, dotStyle: 'ring' })
    expect(useEditor.getState().sketch.penWidth).toBe(3)
    expect(JSON.parse(localStorage.getItem('diagramit.sketch.v1')!)).toMatchObject({ penWidth: 3, dotStyle: 'ring', ink: DEFAULT_SKETCH.ink })
    useEditor.getState().setSketch(DEFAULT_SKETCH)
  })
})
