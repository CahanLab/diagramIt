import { describe, expect, it } from 'vitest'
import { ABOUT, acknowledgement } from './about'

describe('about', () => {
  it('acknowledgement names the app, version, lab and hosted URL', () => {
    const s = acknowledgement('1.2.3')
    expect(s).toContain('DiagramIt v1.2.3')
    expect(s).toContain('Cahan Lab')
    expect(s).toContain(ABOUT.appUrl)
  })
  it('links are absolute https URLs', () => {
    for (const url of [ABOUT.appUrl, ABOUT.labUrl, ABOUT.repoUrl, ABOUT.issuesUrl]) expect(url).toMatch(/^https:\/\//)
  })
})
