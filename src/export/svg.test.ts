import { describe, expect, it } from 'vitest'
import { cropSvgToPage } from './svg'

describe('cropSvgToPage', () => {
  it('replaces width/height/viewBox on the root svg element', () => {
    const svg = '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="5 5 10 10"><rect/></svg>'
    const out = cropSvgToPage(svg, { width: 1600, height: 900 })
    expect(out).toContain('width="1600" height="900" viewBox="0 0 1600 900"')
    expect(out.match(/viewBox=/g)).toHaveLength(1)
    expect(out).toContain('<rect/>')
  })
  it('adds attributes when absent', () => {
    const out = cropSvgToPage('<svg xmlns="http://www.w3.org/2000/svg"><g/></svg>', { width: 100, height: 50 })
    expect(out).toContain('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 100 50">')
  })
})
