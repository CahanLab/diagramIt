import type { DrawingStyle } from '../library/types'
import type { SketchData } from './sketch'
export type ObjectKind = 'shape' | 'text' | 'icon' | 'protocol' | 'ontogeny' | 'connector' | 'image' | 'group' | 'page' | 'sketch'

/** Custom data attached to every canvas object (serialised via toObject(['data'])). */
export interface ObjectData {
  kind: ObjectKind
  /** Library item id for icons; for timelines/ontogenies, the custom template entry they were started from. */
  libraryId?: string
  primaryColor?: string
  secondaryColor?: string
  /** Drawing style the icon was rendered in (developmental icons). */
  style?: DrawingStyle
  /** Role of a sub-path's fill inside an icon group ('primary' | 'secondary'). */
  role?: 'primary' | 'secondary'
  /** Tint variant of the fill role (shaded icons use lighter/darker derivatives). */
  roleVariant?: 'base' | 'light' | 'dark'
  /** Role of a sub-path's stroke inside an icon group (camera lucida ink is a stroke). */
  strokeRole?: 'primary' | 'secondary'
  strokeVariant?: 'base' | 'light' | 'dark'
  /** For gradient fills: role/variant per colour stop (null = fixed colour). */
  stops?: ({ role: 'primary' | 'secondary'; variant: 'base' | 'light' | 'dark' } | null)[]
  /** Serialised protocol for timeline groups. */
  protocol?: unknown
  /** Serialised { graph, view } for ontogeny groups. */
  ontogeny?: unknown
  /** Arrow head configuration for connectors. */
  arrow?: { start: boolean; end: boolean; headSize: number }
  /** Camera lucida sketch strokes: the data the path is rendered from (src/canvas/sketch.ts). */
  sketch?: SketchData
  locked?: boolean
}

export type ToolId =
  | 'select'
  | 'pan'
  | 'text'
  | 'rect'
  | 'roundRect'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'hexagon'
  | 'star'
  | 'line'
  | 'arrow'
  | 'elbowArrow'
  | 'pen'
  | 'stipple'
  | 'polyline'
  | 'eraser'

/** Tools that draw camera lucida sketch marks (the eraser edits them). */
export const SKETCH_TOOLS: readonly ToolId[] = ['pen', 'stipple', 'polyline', 'eraser']

export interface PageSpec {
  width: number
  height: number
  background: string
}
