/**
 * Icon library contract.
 *
 * Every icon is an inline SVG string. Recolourable regions use the literal
 * colours `#PRIMARY` and `#SECONDARY` (substituted at insert time). Outlines
 * use `#1f2937`. Allowed elements: svg, g, path, rect, circle, ellipse, line,
 * polyline, polygon. No <text>, <style>, <use>, <defs>, gradients, or filters.
 */
export type Category =
  | 'consumables'
  | 'tools'
  | 'instruments'
  | 'cells'
  | 'tissues'
  | 'species'
  | 'molbio'
  | 'analyses'
  | 'composites'

export interface LibraryItem {
  /** Unique, kebab-case, prefixed with category (e.g. `cells.ipsc-colony`). */
  id: string
  /** Display name. */
  name: string
  category: Category
  /** Lower-case search keywords (synonyms, abbreviations). */
  keywords: string[]
  /** SVG markup with a viewBox and no width/height attributes. */
  svg: string
  /** Default insert width/height in canvas px (aspect should match viewBox). */
  width: number
  height: number
  /** Default colour substituted for #PRIMARY. */
  primary: string
  /** Default colour substituted for #SECONDARY (if used). */
  secondary?: string
}

export const CATEGORY_LABELS: Record<Category, string> = {
  consumables: 'Consumables',
  tools: 'Tools',
  instruments: 'Instruments',
  cells: 'Cells',
  tissues: 'Tissues & organs',
  species: 'Species',
  molbio: 'Molecular biology & omics',
  analyses: 'Analyses',
  composites: 'Composites',
}

export const CATEGORY_ORDER: Category[] = [
  'composites',
  'cells',
  'consumables',
  'tools',
  'instruments',
  'tissues',
  'species',
  'molbio',
  'analyses',
]

/** Outline colour all icons should use for strokes. */
export const OUTLINE = '#1f2937'
