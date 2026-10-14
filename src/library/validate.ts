import type { LibraryItem } from './types'

const ALLOWED = new Set(['svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'title', 'defs', 'linearGradient', 'radialGradient', 'stop'])

/** Returns a list of problems with an item (empty when valid). Needs a DOM (jsdom in tests, browser at runtime). */
export function validateItem(item: LibraryItem): string[] {
  const problems: string[] = []
  if (!/^[a-z]+\.[a-z0-9-]+$/.test(item.id)) problems.push(`bad id "${item.id}"`)
  if (!item.name) problems.push(`${item.id}: missing name`)
  if (!(item.width > 0 && item.height > 0)) problems.push(`${item.id}: bad size`)
  if (!/^#[0-9a-fA-F]{6}$/.test(item.primary)) problems.push(`${item.id}: primary must be #rrggbb`)
  const doc = new DOMParser().parseFromString(item.svg, 'image/svg+xml')
  if (doc.getElementsByTagName('parsererror').length) {
    problems.push(`${item.id}: svg does not parse`)
    return problems
  }
  const root = doc.documentElement
  if (root.tagName !== 'svg') problems.push(`${item.id}: root is not <svg>`)
  if (!root.getAttribute('viewBox')) problems.push(`${item.id}: missing viewBox`)
  const all = root.getElementsByTagName('*')
  for (const el of Array.from(all)) {
    if (!ALLOWED.has(el.tagName)) problems.push(`${item.id}: element <${el.tagName}> not allowed`)
  }
  // url() may only reference a gradient defined in this icon.
  const ids = new Set(Array.from(root.querySelectorAll('linearGradient, radialGradient')).map((g) => g.getAttribute('id') ?? ''))
  for (const m of item.svg.matchAll(/url\(([^)]*)\)/g)) {
    const ref = m[1]!.trim().replace(/^['"]|['"]$/g, '')
    if (!ref.startsWith('#') || !ids.has(ref.slice(1))) problems.push(`${item.id}: url(${ref}) must reference a gradient defined in the icon`)
  }
  return problems
}
