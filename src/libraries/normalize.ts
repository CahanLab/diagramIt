import type { LibraryItem } from '../library/types'
import type { Ontogeny } from '../ontogeny/types'
import { validateOntogeny } from '../ontogeny/validate'
import type { Protocol } from '../protocol/types'
import { sanitizeCustomSvg } from './svg'
import type { CustomLibrary, LibraryEntry, LibraryManifest } from './types'

const ID_RE = /^[a-z0-9][a-z0-9-]*$/

function fail(msg: string): never {
  throw new Error(msg)
}
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const str = (o: Record<string, unknown>, k: string, where: string, required = true): string | undefined => {
  const v = o[k]
  if (v === undefined || v === null || v === '') {
    if (required) fail(`${where}.${k} is required`)
    return undefined
  }
  if (typeof v !== 'string') fail(`${where}.${k} must be a string`)
  return v
}

function manifestOf(raw: unknown): LibraryManifest {
  if (!isObj(raw)) fail('manifest is missing')
  const id = str(raw, 'id', 'manifest')!
  if (!ID_RE.test(id)) fail(`manifest.id "${id}" must be kebab-case (letters, digits, hyphens)`)
  return {
    id,
    name: str(raw, 'name', 'manifest')!,
    version: str(raw, 'version', 'manifest', false) ?? '1',
    author: str(raw, 'author', 'manifest')!,
    affiliation: str(raw, 'affiliation', 'manifest', false),
    url: str(raw, 'url', 'manifest', false),
    license: str(raw, 'license', 'manifest', false),
    acknowledgement: str(raw, 'acknowledgement', 'manifest', false),
    description: str(raw, 'description', 'manifest', false),
    createdAt: str(raw, 'createdAt', 'manifest', false) ?? new Date().toISOString(),
  }
}

function checkId(id: unknown, libId: string, where: string): string {
  if (typeof id !== 'string' || !id.startsWith(`${libId}.`) || !ID_RE.test(id.slice(libId.length + 1))) {
    fail(`${where}: id must start with "${libId}." followed by a kebab-case slug (got ${JSON.stringify(id)})`)
  }
  return id
}

function iconOf(raw: unknown, libId: string, i: number): LibraryItem {
  if (!isObj(raw)) fail(`entry ${i}: icon item is missing`)
  const id = checkId(raw.id, libId, `entry ${i}`)
  const name = str(raw, 'name', id)!
  if (typeof raw.svg !== 'string') fail(`${id}: svg must be a string`)
  const s = sanitizeCustomSvg(raw.svg)
  if (s.errors.length) fail(`${id}: ${s.errors[0]}`)
  const width = Number(raw.width) || s.width
  const height = Number(raw.height) || s.height
  if (!(width > 0 && height > 0)) fail(`${id}: width/height must be positive`)
  const keywords = Array.isArray(raw.keywords) ? raw.keywords.filter((k): k is string => typeof k === 'string') : []
  const primary = typeof raw.primary === 'string' && /^#[0-9a-fA-F]{6}$/.test(raw.primary) ? raw.primary : '#1f2937'
  const secondary = typeof raw.secondary === 'string' && /^#[0-9a-fA-F]{6}$/.test(raw.secondary) ? raw.secondary : undefined
  return { id, name, category: 'custom', keywords, svg: s.svg, width, height, primary, ...(secondary ? { secondary } : {}) }
}

function protocolOf(raw: unknown, id: string): Protocol {
  if (!isObj(raw)) fail(`${id}: protocol is missing`)
  if (!Array.isArray(raw.stages)) fail(`${id}: protocol.stages must be an array`)
  raw.stages.forEach((st, j) => {
    if (!isObj(st) || typeof st.start !== 'number' || typeof st.end !== 'number' || typeof st.name !== 'string') fail(`${id}: stage ${j} needs name, numeric start and end`)
  })
  if (raw.layout !== 'classic' && raw.layout !== 'strip') fail(`${id}: protocol.layout must be "classic" or "strip"`)
  return raw as unknown as Protocol
}

function ontogenyOf(raw: unknown, libId: string, i: number): Ontogeny {
  if (!isObj(raw)) fail(`entry ${i}: ontogeny graph is missing`)
  const id = checkId(raw.id, libId, `entry ${i}`)
  if (typeof raw.name !== 'string' || !raw.name) fail(`${id}: name is required`)
  if (!Array.isArray(raw.nodes) || !Array.isArray(raw.stages) || !Array.isArray(raw.lineages)) fail(`${id}: nodes, stages and lineages must be arrays`)
  const g = raw as unknown as Ontogeny
  const problems = validateOntogeny(g)
  if (problems.length) fail(`${id}: ${problems[0]}`)
  return g
}

function entryOf(raw: unknown, libId: string, i: number): LibraryEntry {
  if (!isObj(raw)) fail(`entry ${i} is not an object`)
  switch (raw.kind) {
    case 'icon':
      return { kind: 'icon', item: iconOf(raw.item, libId, i) }
    case 'protocol': {
      const id = checkId(raw.id, libId, `entry ${i}`)
      const name = str(raw, 'name', id)!
      return { kind: 'protocol', id, name, description: str(raw, 'description', id, false), protocol: protocolOf(raw.protocol, id) }
    }
    case 'ontogeny':
      return { kind: 'ontogeny', graph: ontogenyOf(raw.graph, libId, i) }
    default:
      fail(`entry ${i}: unknown kind ${JSON.stringify(raw.kind)}`)
  }
}

/**
 * Validate a parsed (or JSON-string) library file and return a clean copy.
 * Throws an Error whose message names the first problem.
 */
export function normalizeLibrary(input: unknown, sourceUrl?: string): CustomLibrary {
  let raw = input
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw)
    } catch {
      fail('file is not valid JSON')
    }
  }
  if (!isObj(raw) || raw.app !== 'diagramit-library') fail('not a DiagramIt library file (expected "app": "diagramit-library")')
  if (raw.version !== 1) fail(`unsupported library version ${JSON.stringify(raw.version)}`)
  const manifest = manifestOf(raw.manifest)
  if (!Array.isArray(raw.entries)) fail('entries must be an array')
  const entries = raw.entries.map((e, i) => entryOf(e, manifest.id, i))
  const seen = new Set<string>()
  for (const e of entries) {
    const id = e.kind === 'icon' ? e.item.id : e.kind === 'protocol' ? e.id : e.graph.id
    if (seen.has(id)) fail(`duplicate entry id "${id}"`)
    seen.add(id)
  }
  return { app: 'diagramit-library', version: 1, manifest, entries, ...(sourceUrl ? { sourceUrl } : {}) }
}
