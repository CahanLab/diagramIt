export type ObjectKind = 'shape' | 'text' | 'icon' | 'protocol' | 'connector' | 'image' | 'group' | 'page'

/** Custom data attached to every canvas object (serialised via toObject(['data'])). */
export interface ObjectData {
  kind: ObjectKind
  /** Library item id for icons. */
  libraryId?: string
  primaryColor?: string
  secondaryColor?: string
  /** Role of a sub-path inside an icon group ('primary' | 'secondary'). */
  role?: 'primary' | 'secondary'
  /** Serialised protocol for timeline groups. */
  protocol?: unknown
  /** Arrow head configuration for connectors. */
  arrow?: { start: boolean; end: boolean; headSize: number }
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

export interface PageSpec {
  width: number
  height: number
  background: string
}
