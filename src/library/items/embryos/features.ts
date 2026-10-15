/**
 * Hand-placed features of the traced embryo plates (traced.ts): eye, closed eyelids,
 * vibrissa field. Coordinates are in the viewBox of the traced plate for that stage
 * (read off gridded previews of the plates; see scripts/embryos/README.md).
 */
import type { Stage } from '../limbs/types'

export interface Ellipse {
  cx: number
  cy: number
  rx: number
  ry: number
  /** degrees, clockwise on screen */
  angle?: number
}

export interface EmbryoFeatures {
  /** lens pit / lens vesicle (ring) before E12.5, pigmented eye afterwards */
  eye?: { cx: number; cy: number; r: number }
  /** fused eyelids from E16.5: the closed eye as an ellipse outline */
  eyelid?: Ellipse
  /** vibrissa follicles on the snout from E13.5: a lattice clipped to this ellipse */
  vibrissae?: Ellipse & { rows: number; cols: number }
}

export const FEATURES: Record<Stage, EmbryoFeatures> = {
  'E10.5': { eye: { cx: 29.5, cy: 16.5, r: 1.4 } },
  'E11.5': { eye: { cx: 12.5, cy: 15.5, r: 1.7 } },
  'E12.5': { eye: { cx: 16, cy: 24, r: 2.4 } },
  'E13.5': { eye: { cx: 18.5, cy: 28, r: 2.8 }, vibrissae: { cx: 15, cy: 34.5, rx: 5, ry: 3.6, angle: -20, rows: 3, cols: 4 } },
  'E14.5': { eye: { cx: 25, cy: 30, r: 3 }, vibrissae: { cx: 15.5, cy: 39.5, rx: 6, ry: 4.6, angle: -25, rows: 4, cols: 5 } },
  'E15.5': { eye: { cx: 27.5, cy: 32, r: 3.4 }, vibrissae: { cx: 16, cy: 44, rx: 8, ry: 6, angle: -25, rows: 4, cols: 6 } },
  'E16.5': { eyelid: { cx: 31, cy: 32.5, rx: 4.2, ry: 2.8, angle: -10 }, vibrissae: { cx: 25, cy: 45, rx: 6.5, ry: 5.5, angle: -30, rows: 4, cols: 5 } },
  'E17.5': { eyelid: { cx: 40, cy: 31, rx: 9, ry: 5.2, angle: -5 }, vibrissae: { cx: 20, cy: 41, rx: 10, ry: 8.5, angle: -20, rows: 5, cols: 6 } },
  'E18.5': { eyelid: { cx: 39, cy: 25.5, rx: 9, ry: 4.4, angle: 0 }, vibrissae: { cx: 16, cy: 33, rx: 8, ry: 9, angle: -10, rows: 5, cols: 5 } },
}
