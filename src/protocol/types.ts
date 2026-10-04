/** Data model for a directed-differentiation protocol timeline. */

export interface Stage {
  id: string
  /** Stage name shown above the axis (e.g. "Stage 1", "Mesoderm induction"). */
  name: string
  /** Start / end in protocol units (days by default). */
  start: number
  end: number
  /** Colour used for the stage band / media box fill. */
  color: string
  /** Cell population present at the START of this stage. */
  cellLabel?: string
  /** Library icon id for the cell population (e.g. 'cells.ipsc-colony'). */
  cellIconId?: string
  cellColor?: string
  /** Marker lines shown under the cell icon (e.g. "Oct4+"). Use ^ for superscript-like signs: "Oct4+" is fine. */
  markers?: string[]
  /** Media / factor lines shown inside the stage's media box. */
  media: string[]
}

export interface Endpoint {
  cellLabel?: string
  cellIconId?: string
  cellColor?: string
  markers?: string[]
}

export interface MediaSpan {
  start: number
  end: number
  text: string
  color: string
}

export interface MediaRow {
  id: string
  label: string
  spans: MediaSpan[]
}

export type ProtocolLayoutKind = 'classic' | 'strip'
export type ProtocolUnit = 'day' | 'hour' | 'week'

export interface Protocol {
  title?: string
  layout: ProtocolLayoutKind
  unit: ProtocolUnit
  /** Pixels per unit of time. */
  pxPerUnit: number
  stages: Stage[]
  /** Cell population at the very end (after the last stage). Optional. */
  endpoint?: Endpoint
  /** Extra rows (strip layout: e.g. basal medium). Also drawn under classic media boxes. */
  rows: MediaRow[]
  /** Full-width note row, e.g. "ECM: Laminin 511". */
  ecm?: string
  fontFamily: string
  fontSize: number
  showCells: boolean
  showMarkers: boolean
  showMedia: boolean
}

export const UNIT_LABEL: Record<ProtocolUnit, string> = { day: 'Day', hour: 'Hour', week: 'Week' }

let counter = 0
export function newId(prefix = 's'): string {
  counter += 1
  return `${prefix}${Date.now().toString(36)}${counter}`
}
