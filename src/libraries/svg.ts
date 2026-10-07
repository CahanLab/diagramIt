/** Helpers for user-made icon SVG: a relaxed whitelist (text allowed) and id slugs. */

const ALLOWED = new Set(['svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'title', 'desc', 'text', 'tspan'])

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item'
}

export function entryId(libraryId: string, name: string): string {
  return `${libraryId}.${slugify(name)}`
}

export interface SanitizedSvg {
  svg: string
  width: number
  height: number
  errors: string[]
}

/**
 * Check an SVG string against the custom-icon rules and return a cleaned copy
 * (no width/height attributes, viewBox guaranteed). Needs a DOM.
 */
export function sanitizeCustomSvg(input: string): SanitizedSvg {
  const errors: string[] = []
  const bad = (m: string) => ({ svg: input, width: 0, height: 0, errors: [m] })
  const doc = new DOMParser().parseFromString(input, 'image/svg+xml')
  if (doc.getElementsByTagName('parsererror').length) return bad('SVG does not parse')
  const root = doc.documentElement
  if (root.tagName !== 'svg') return bad('root element is not <svg>')
  for (const el of Array.from(root.getElementsByTagName('*'))) {
    if (!ALLOWED.has(el.tagName)) errors.push(`element <${el.tagName}> is not allowed`)
    for (const a of Array.from(el.attributes)) {
      if (/^on/i.test(a.name)) errors.push(`attribute ${a.name} is not allowed`)
      if (/url\(/.test(a.value)) errors.push('url() references are not allowed')
    }
  }
  if (/url\(/.test(input) && !errors.some((e) => e.includes('url()'))) errors.push('url() references are not allowed')
  let viewBox = root.getAttribute('viewBox')
  const w = parseFloat(root.getAttribute('width') ?? '')
  const h = parseFloat(root.getAttribute('height') ?? '')
  if (!viewBox) {
    if (w > 0 && h > 0) viewBox = `0 0 ${w} ${h}`
    else errors.push('missing viewBox (and no width/height to derive one from)')
  }
  if (errors.length) return { svg: input, width: 0, height: 0, errors }
  root.setAttribute('viewBox', viewBox!)
  root.removeAttribute('width')
  root.removeAttribute('height')
  if (!root.getAttribute('xmlns')) root.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const [, , vw, vh] = viewBox!.split(/[\s,]+/).map(Number)
  return { svg: new XMLSerializer().serializeToString(root), width: vw || 0, height: vh || 0, errors: [] }
}
