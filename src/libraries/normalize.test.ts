import { describe, expect, it } from 'vitest'
import { normalizeLibrary } from './normalize'

const manifest = { id: 'test-lib', name: 'Test', version: '1', author: 'A. Author', createdAt: '2026-10-07' }
const icon = { kind: 'icon', item: { id: 'test-lib.dot', name: 'Dot', category: 'custom', keywords: ['dot'], svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>', width: 40, height: 40, primary: '#000000' } }
const protocol = { kind: 'protocol', id: 'test-lib.proto', name: 'Proto', protocol: { layout: 'classic', unit: 'day', pxPerUnit: 20, stages: [{ id: 's1', name: 'S1', start: 0, end: 3, color: '#fff', media: [] }], rows: [], fontFamily: 'Arial', fontSize: 11, showCells: true, showMarkers: true, showMedia: true } }
const ontogeny = { kind: 'ontogeny', graph: { id: 'test-lib.tree', name: 'Tree', organism: 'mouse', stages: [], lineages: [], nodes: [{ id: 'r', label: 'Root', parents: [] }] } }
const lib = { app: 'diagramit-library', version: 1, manifest, entries: [icon, protocol, ontogeny] }

describe('normalizeLibrary', () => {
  it('accepts a valid library and keeps entries in order', () => {
    const l = normalizeLibrary(lib)
    expect(l.manifest.id).toBe('test-lib')
    expect(l.entries.map((e) => e.kind)).toEqual(['icon', 'protocol', 'ontogeny'])
  })
  it('rejects wrong app tag, bad manifest, bad entry ids', () => {
    expect(() => normalizeLibrary({ ...lib, app: 'x' })).toThrow(/DiagramIt library/)
    expect(() => normalizeLibrary({ ...lib, manifest: { ...manifest, id: 'Bad Id' } })).toThrow(/manifest\.id/)
    expect(() => normalizeLibrary({ ...lib, manifest: { ...manifest, author: '' } })).toThrow(/author/)
    expect(() => normalizeLibrary({ ...lib, entries: [{ ...icon, item: { ...icon.item, id: 'other.dot' } }] })).toThrow(/test-lib\./)
  })
  it('rejects invalid icons, protocols and ontogenies with the entry named', () => {
    expect(() => normalizeLibrary({ ...lib, entries: [{ ...icon, item: { ...icon.item, svg: '<svg viewBox="0 0 1 1"><script/></svg>' } }] })).toThrow(/test-lib\.dot/)
    expect(() => normalizeLibrary({ ...lib, entries: [{ ...protocol, protocol: { ...protocol.protocol, stages: [{ id: 's', name: 'S', start: 'a', end: 2 }] } }] })).toThrow(/test-lib\.proto/)
    expect(() => normalizeLibrary({ ...lib, entries: [{ ...ontogeny, graph: { ...ontogeny.graph, nodes: [] } }] })).toThrow(/test-lib\.tree/)
  })
  it('accepts a string of JSON too', () => {
    expect(normalizeLibrary(JSON.stringify(lib)).entries).toHaveLength(3)
  })
})
