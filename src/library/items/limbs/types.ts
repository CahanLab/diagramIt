/**
 * Data model for mouse limb stage icons. Pure data: the generator in
 * src/library/generators/limb.ts turns a LimbStage into SVG.
 *
 * Frame: dorsal view, proximal left, distal right, anterior (digit 1) up.
 * Coordinates are viewBox units.
 */
export type Stage = 'E10.5' | 'E11.5' | 'E12.5' | 'E13.5' | 'E14.5' | 'E15.5' | 'E16.5' | 'E17.5' | 'E18.5'
export type Limb = 'forelimb' | 'hindlimb'

export type ElementName =
  | 'humerus'
  | 'radius'
  | 'ulna'
  | 'femur'
  | 'tibia'
  | 'fibula'
  | 'carpal'
  | 'tarsal'
  | 'metacarpal'
  | 'metatarsal'
  | 'proximal-phalanx'
  | 'middle-phalanx'
  | 'distal-phalanx'

/** condensation = precartilaginous (Alcian negative); cartilage = Alcian positive; sleeve = periosteal bone collar; ossifying = Alizarin positive diaphysis. */
export type ElementState = 'condensation' | 'cartilage' | 'sleeve' | 'ossifying'

/**
 * A skeletal element: its axis from proximal centre p to distal centre d with a nominal
 * half-width r (used for bands, stipple density and tone), and its outline `shape` (closed
 * path following the cartilage contour; see scripts/limbs/author.py and geometry.ts).
 */
export interface Element {
  name: ElementName
  digit?: 1 | 2 | 3 | 4 | 5
  state: ElementState
  p: [number, number]
  d: [number, number]
  r: number
  shape: string
  /** the outline as a polygon, for stipple and tone */
  polygon: [number, number][]
}

export interface Muscle {
  name: string
  /** closed path, filled */
  path: string
  /** the outline as a polygon, for hatching */
  polygon: [number, number][]
}
export interface Tendon {
  name: string
  /** open path, stroked as a band */
  path: string
}
export interface Nerve {
  name: string
  path: string
  /** 3 trunk, 2 branch, 1 cutaneous twig */
  width: 1 | 2 | 3
}

/** Blood vessel drawn in the skeleton version at AER stages (marginal sinus, axial artery). */
export interface Vessel {
  name: string
  path: string
  width: number
  /** SVG dash pattern, e.g. gaps in the marginal sinus */
  dash?: string
}

export interface LimbStage {
  limb: Limb
  stage: Stage
  theiler: number
  /** whole-limb length in mm, drives the default insert size */
  lengthMm: number
  viewBox: string
  /** closed path of the limb silhouette */
  outline: string
  /** the silhouette as an open path from the anterior flank point round the autopod to the posterior flank point */
  outlineOpen: string
  /** flank attachment points and the proximal direction into the body */
  flank: { anterior: [number, number]; posterior: [number, number]; inward: [number, number] }
  /** joint landmarks and segment half-widths (for shading) */
  landmarks: { shoulder: [number, number]; elbow: [number, number]; wrist: [number, number]; stylopodWidth: number; zeugopodWidth: number }
  /** open path along the distal margin while an apical ectodermal ridge is visible */
  aer?: string
  /** the ridge as a closed crescent (tapering to the surface ectoderm at both ends) */
  aerBand?: string
  /** polygon of the silhouette, for tone and tests */
  polygon: [number, number][]
  hairPlacodes?: [number, number][]
  /** raw SVG fragments drawn over the outline (claws, footpads, wrinkles), basic style */
  decor?: string
  /** the same decorations drawn for the camera lucida style (ink only) */
  decorLucida?: string
  elements: Element[]
  muscles: Muscle[]
  tendons: Tendon[]
  nerves: Nerve[]
  vessels?: Vessel[]
}

export type LimbVersion = 'outline' | 'skeleton' | 'muscle' | 'nerves'

export const STAGES: readonly Stage[] = ['E10.5', 'E11.5', 'E12.5', 'E13.5', 'E14.5', 'E15.5', 'E16.5', 'E17.5', 'E18.5']

export const FORELIMB_ELEMENTS: ReadonlySet<ElementName> = new Set<ElementName>([
  'humerus', 'radius', 'ulna', 'carpal', 'metacarpal', 'proximal-phalanx', 'middle-phalanx', 'distal-phalanx',
])
export const HINDLIMB_ELEMENTS: ReadonlySet<ElementName> = new Set<ElementName>([
  'femur', 'tibia', 'fibula', 'tarsal', 'metatarsal', 'proximal-phalanx', 'middle-phalanx', 'distal-phalanx',
])
