import { describe, expect, it } from 'vitest'
import { libraryUrlsFromQuery, loadLibrariesFromQuery } from './io'

describe('library URL loading', () => {
  it('reads every lib parameter', () => {
    expect(libraryUrlsFromQuery('?lib=https://a/x.json&foo=1&lib=https://b/y.json')).toEqual(['https://a/x.json', 'https://b/y.json'])
    expect(libraryUrlsFromQuery('')).toEqual([])
  })
  it('fetches, normalises, tags sourceUrl and reports failures without throwing', async () => {
    const good = { app: 'diagramit-library', version: 1, manifest: { id: 'g', name: 'G', version: '1', author: 'Ann', createdAt: 'x' }, entries: [] }
    const fetchFn = async (url: string) => (url.includes('good') ? new Response(JSON.stringify(good)) : new Response('nope', { status: 404 }))
    const results = await loadLibrariesFromQuery('?lib=https://x/good.json&lib=https://x/bad.json', fetchFn as typeof fetch)
    expect(results[0]).toMatchObject({ ok: true, library: { manifest: { id: 'g' }, sourceUrl: 'https://x/good.json' } })
    expect(results[1]).toMatchObject({ ok: false, url: 'https://x/bad.json' })
    expect((results[1] as { error: string }).error).toMatch(/404/)
  })
})
