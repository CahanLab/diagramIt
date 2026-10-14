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
  /** Mouse embryo and limb stage series (src/library/items/development.ts). */
  | 'development'
  | 'molbio'
  | 'analyses'
  | 'composites'
  /** Items from user-made libraries (see src/libraries). Not shown as a built-in section. */
  | 'custom'

/** Drawing style for developmental icons (spec: docs/superpowers/specs/2026-10-14-drawing-styles-design.md). */
export type DrawingStyle = 'basic' | 'lucida' | 'realistic'
export const DRAWING_STYLES: DrawingStyle[] = ['basic', 'lucida', 'realistic']
export const DRAWING_STYLE_LABELS: Record<DrawingStyle, string> = { basic: 'Basic', lucida: 'Camera lucida', realistic: 'Realistic' }

/** An alternative rendering of an item with its own default palette. */
export interface StyledRendering {
  svg: string
  primary: string
  secondary?: string
}

export interface LibraryItem {
  /** Unique, kebab-case, prefixed with category (e.g. `cells.ipsc-colony`) or, for custom items, with the library id. */
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
  /** Alternative drawing styles (developmental icons). `svg`/`primary`/`secondary` above are the basic style. */
  styles?: Partial<Record<DrawingStyle, StyledRendering>>
}

export const CATEGORY_LABELS: Record<Category, string> = {
  custom: 'Custom',
  consumables: 'Consumables',
  tools: 'Tools',
  instruments: 'Instruments',
  cells: 'Cells',
  tissues: 'Tissues & organs',
  species: 'Species',
  development: 'Developmental stages',
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
  'development',
  'molbio',
  'analyses',
]

/** Outline colour all icons should use for strokes. */
export const OUTLINE = '#1f2937'
