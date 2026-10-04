/**
 * Data model for developmental ontogenies (lineage graphs).
 *
 * An ontogeny is a rooted directed acyclic graph of cell types / cell states.
 * Most edges form a tree (one `parents[0]` per node); extra parents express
 * convergent or alternative origins and are drawn as secondary edges.
 */

export interface OntogenyStage {
  id: string
  /** Short label shown on the time axis, e.g. "E6.5", "PCW 3", "HSC". */
  label: string
  /** Optional numeric time (days, hours, minutes) used for proportional spacing. */
  time?: number
  /** Optional longer description. */
  description?: string
}

export interface OntogenyLineage {
  id: string
  /** e.g. "Ectoderm", "Myeloid", "AB lineage". */
  label: string
  /** Hex colour used for nodes/edges of this lineage. */
  color: string
}

export interface OntogenyNode {
  id: string
  label: string
  /** Parent node ids. The first is the primary (tree) parent; others are secondary edges. Empty for the root. */
  parents: string[]
  /** Stage id (column in staged layouts). Optional for pure trees. */
  stage?: string
  /** Lineage id used for colouring. Inherits from the primary parent when omitted. */
  lineage?: string
  /** Short marker genes or notes rendered as a sub-label (e.g. "Oct4+ Nanog+"). */
  markers?: string
  /** Library icon id to draw instead of/with the node glyph (e.g. 'cells.neuron'). */
  iconId?: string
  /** Terminal differentiated state. */
  terminal?: boolean
  /** Free-text description shown in the editor only. */
  description?: string
}

export interface OntogenyEdgeStyle {
  from: string
  to: string
  /** 'secondary' edges are dashed; 'self' loops indicate self-renewal. */
  kind?: 'primary' | 'secondary' | 'self'
  label?: string
}

export interface Ontogeny {
  id: string
  name: string
  organism: string
  /** One-line provenance / reference for the curated graph. */
  source?: string
  stages: OntogenyStage[]
  lineages: OntogenyLineage[]
  nodes: OntogenyNode[]
  /** Optional extra edge annotations (labels, self-renewal loops). Tree edges come from `parents`. */
  edges?: OntogenyEdgeStyle[]
}

/** How the ontogeny is drawn. Stored with the graph in the canvas object so it can be re-edited. */
export interface OntogenyView {
  layout: 'tree' | 'staged'
  orientation: 'horizontal' | 'vertical'
  /** Edge rendering. 'metro' draws octilinear coloured routes; 'orthogonal' uses right angles. */
  edgeStyle: 'curve' | 'straight' | 'orthogonal' | 'metro'
  /** Node glyph. */
  nodeStyle: 'circle' | 'pill' | 'label' | 'icon'
  /** Node ids hidden from the drawing (their descendants are hidden too unless re-parented). */
  hidden: string[]
  /** Node ids whose subtrees are collapsed into the node. */
  collapsed: string[]
  /** Node ids whose root-paths are emphasised; everything else is faded when non-empty. */
  emphasis: string[]
  /** Opacity for non-emphasised elements when emphasis is active (0–1). */
  fadeOpacity: number
  /** Stage ids to include (empty = all). Nodes in excluded stages are hidden. */
  stages: string[]
  showStageAxis: boolean
  showStageBands: boolean
  showMarkers: boolean
  showLineageLegend: boolean
  colorBy: 'lineage' | 'stage' | 'none'
  /** Pixels between sibling nodes and between stages/levels. */
  nodeGap: number
  levelGap: number
  /** Node radius (circle) / pill height. */
  nodeSize: number
  edgeWidth: number
  fontFamily: string
  fontSize: number
  title?: string
}

export const DEFAULT_VIEW: OntogenyView = {
  layout: 'tree',
  orientation: 'horizontal',
  edgeStyle: 'curve',
  nodeStyle: 'circle',
  hidden: [],
  collapsed: [],
  emphasis: [],
  fadeOpacity: 0.18,
  stages: [],
  showStageAxis: true,
  showStageBands: false,
  showMarkers: false,
  showLineageLegend: true,
  colorBy: 'lineage',
  nodeGap: 34,
  levelGap: 170,
  nodeSize: 10,
  edgeWidth: 2.5,
  fontFamily: 'Helvetica',
  fontSize: 13,
}

/** What is stored in `data.ontogeny` on the canvas group. */
export interface OntogenyDocument {
  graph: Ontogeny
  view: OntogenyView
}
