/**
 * Render a contact sheet of one library category to PNG for visual review.
 * Usage: npx tsx scripts/icon-sheet.ts <category> <outDir>
 * Produces <outDir>/<category>.svg and <outDir>/<category>.svg.png (via macOS qlmanage).
 */
import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { applyColors } from '../src/library/color'
import type { LibraryItem } from '../src/library/types'

const [category, outDir = '.'] = process.argv.slice(2)
if (!category) throw new Error('usage: icon-sheet <category> <outDir>')
const mod = (await import(`../src/library/items/${category}.ts`)) as { items: LibraryItem[] }
const items = mod.items
const CELL = 180
const COLS = 6
const rows = Math.ceil(items.length / COLS)
const parts: string[] = []
items.forEach((item, i) => {
  const x = (i % COLS) * CELL
  const y = Math.floor(i / COLS) * CELL
  const inner = applyColors(item.svg, item.primary, item.secondary)
    .replace(/<svg([^>]*)>/, (_m, attrs: string) => `<svg${attrs} x="${x + 20}" y="${y + 10}" width="${CELL - 40}" height="${CELL - 50}" preserveAspectRatio="xMidYMid meet">`)
  parts.push(`<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="#fff" stroke="#ddd"/>`)
  parts.push(inner)
  parts.push(`<text x="${x + CELL / 2}" y="${y + CELL - 14}" font-family="Helvetica, Arial" font-size="13" text-anchor="middle" fill="#333">${item.name.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`)
})
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COLS * CELL}" height="${Math.max(1, rows) * CELL}" viewBox="0 0 ${COLS * CELL} ${Math.max(1, rows) * CELL}"><rect width="100%" height="100%" fill="#f3f4f6"/>${parts.join('\n')}</svg>`
mkdirSync(outDir, { recursive: true })
const file = join(outDir, `${category}.svg`)
writeFileSync(file, svg)
execSync(`qlmanage -t -s ${COLS * CELL} -o "${outDir}" "${file}"`, { stdio: 'ignore' })
console.log(`${items.length} items → ${file}.png`)
