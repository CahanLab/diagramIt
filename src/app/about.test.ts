import { describe, expect, it } from 'vitest'
import { ABOUT, acknowledgement } from './about'

describe('about', () => {
  it('acknowledgement names the app, version, lab and hosted URL', () => {
    const s = acknowledgement('1.2.3')
    expect(s).toContain('DiagramIt v1.2.3')
    expect(s).toContain('Cahan Lab')
    expect(s).toContain(ABOUT.appUrl)
  })
  it('acknowledgement credits custom libraries, honouring a verbatim clause', () => {
    expect(acknowledgement('1.0.0', [{ name: 'Kidney icons', author: 'A. Author' }])).toMatch(/\), using the Kidney icons library by A\. Author\.$/)
    expect(acknowledgement('1.0.0', [{ name: 'Example library', author: 'P' }])).toMatch(/using the Example library by P\.$/)
    expect(acknowledgement('1.0.0', [{ name: 'K', author: 'A' }, { name: 'L', author: 'B', acknowledgement: 'icons from L (doi:10.1/x)' }])).toMatch(/using the K library by A and icons from L \(doi:10\.1\/x\)\.$/)
  })
  it('links are absolute https URLs', () => {
    for (const url of [ABOUT.appUrl, ABOUT.labUrl, ABOUT.repoUrl, ABOUT.issuesUrl, ABOUT.licenseUrl]) expect(url).toMatch(/^https:\/\//)
  })
  it('terms of use let anyone use the hosted app and own their figures', () => {
    expect(ABOUT.termsOfUse).toMatch(/commercial organisations, may use/)
    expect(ABOUT.termsOfUse).toMatch(/Figures you make are yours/)
    expect(ABOUT.licenseName).toBe('MIT')
  })
})
