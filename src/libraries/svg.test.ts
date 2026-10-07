import { describe, expect, it } from 'vitest'
import { entryId, sanitizeCustomSvg, slugify } from './svg'

describe('slugify / entryId', () => {
  it('makes kebab-case slugs and namespaced ids', () => {
    expect(slugify('  Kidney Organoid (day 7)! ')).toBe('kidney-organoid-day-7')
    expect(entryId('cahanlab-kidney', 'Kidney Organoid')).toBe('cahanlab-kidney.kidney-organoid')
  })
})

describe('sanitizeCustomSvg', () => {
  it('strips width/height, keeps viewBox, allows text', () => {
    const r = sanitizeCustomSvg('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20"><rect width="10" height="10"/><text x="1" y="1">a</text></svg>')
    expect(r.errors).toEqual([])
    expect(r.svg).not.toMatch(/\swidth="40"/)
    expect(r.svg).toContain('viewBox="0 0 40 20"')
    expect(r.width).toBe(40)
    expect(r.height).toBe(20)
  })
  it('derives a viewBox from width/height when missing', () => {
    const r = sanitizeCustomSvg('<svg xmlns="http://www.w3.org/2000/svg" width="30" height="15"><circle r="5"/></svg>')
    expect(r.errors).toEqual([])
    expect(r.svg).toContain('viewBox="0 0 30 15"')
  })
  it('rejects scripts, images, event handlers and url() references', () => {
    expect(sanitizeCustomSvg('<svg viewBox="0 0 1 1"><script>1</script></svg>').errors[0]).toMatch(/<script>/)
    expect(sanitizeCustomSvg('<svg viewBox="0 0 1 1"><image href="x"/></svg>').errors[0]).toMatch(/<image>/)
    expect(sanitizeCustomSvg('<svg viewBox="0 0 1 1"><rect onclick="x()"/></svg>').errors[0]).toMatch(/onclick/)
    expect(sanitizeCustomSvg('<svg viewBox="0 0 1 1"><rect fill="url(#g)"/></svg>').errors[0]).toMatch(/url\(\)/)
  })
  it('reports unparseable input and a missing viewBox', () => {
    expect(sanitizeCustomSvg('<svg').errors[0]).toMatch(/parse/)
    expect(sanitizeCustomSvg('<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>').errors[0]).toMatch(/viewBox/)
  })
})
