/**
 * Mouse hindlimb stage data, E10.5 to E18.5. The hindlimb lags the forelimb by about half
 * a day (Martin 1990), so each stage carries the earlier morphology: footplate without
 * scallops at E12.5, concavities rather than clefts at E13.5, toes nearly separate at
 * E14.5, femur ossification barely visible at E15.5 (Rafipay et al. 2018). Silhouettes
 * come from shapes.ts. Spec: docs/superpowers/specs/2026-10-14-mouse-embryo-limb-icons-design.md
 */
import { assemble, blocks, claws, digitTendons, digitalNerves, masses, padsAndWrinkles, placodes, trunks, twigs, type Geometry, type Recipe } from './build'
import { lerp } from './geometry'
import type { ElementName, LimbStage, Stage } from './types'

type Digit = 1 | 2 | 3 | 4 | 5
const LONG: ElementName[] = ['femur', 'tibia', 'fibula']

function stateAt(stage: Stage): Recipe['state'] {
  return (name, digit) => {
    const d = digit ?? 3
    switch (stage) {
      case 'E10.5':
        return undefined
      case 'E11.5':
        return name === 'femur' ? 'condensation' : undefined
      case 'E12.5':
        if (LONG.includes(name)) return 'condensation'
        if (name === 'metatarsal') return d === 1 || d === 5 ? undefined : 'condensation'
        return undefined
      case 'E13.5':
        if (LONG.includes(name) || name === 'proximal-phalanx' || name === 'middle-phalanx') return 'cartilage'
        if (name === 'metatarsal') return d === 1 || d === 5 ? 'condensation' : 'cartilage'
        if (name === 'distal-phalanx') return d === 1 ? undefined : 'condensation'
        return undefined
      case 'E14.5':
        if (LONG.includes(name)) return 'sleeve'
        return 'cartilage'
      case 'E15.5':
        if (name === 'femur') return 'ossifying'
        if (LONG.includes(name)) return 'sleeve'
        return 'cartilage'
      case 'E16.5':
        if (LONG.includes(name)) return 'ossifying'
        return 'cartilage'
      case 'E17.5':
        if (LONG.includes(name) || (name === 'metatarsal' && d !== 1)) return 'ossifying'
        return 'cartilage'
      case 'E18.5':
        if (LONG.includes(name) || ((name === 'metatarsal' || name === 'proximal-phalanx') && d !== 1)) return 'ossifying'
        return 'cartilage'
    }
  }
}

const phalanges = (digit: Digit): ('proximal-phalanx' | 'middle-phalanx' | 'distal-phalanx')[] =>
  digit === 1 ? ['proximal-phalanx', 'distal-phalanx'] : ['proximal-phalanx', 'middle-phalanx', 'distal-phalanx']

const none = () => []
const THEILER: Record<Stage, number> = { 'E10.5': 17, 'E11.5': 19, 'E12.5': 20, 'E13.5': 21, 'E14.5': 22, 'E15.5': 23, 'E16.5': 24, 'E17.5': 25, 'E18.5': 26 }
const BONE_WIDTH: Record<Stage, number> = { 'E10.5': 1, 'E11.5': 1.4, 'E12.5': 1.4, 'E13.5': 1.25, 'E14.5': 1, 'E15.5': 0.95, 'E16.5': 0.92, 'E17.5': 0.9, 'E18.5': 0.9 }

const STYLO4: [string, string, string, string] = ['gluteal', 'quadriceps', 'hamstring', 'adductor']
const widths = (g: Geometry) => g.shape.landmarks

const mature = (stage: Stage, tendonTo: number, wrinkles: boolean, pads: boolean, hair?: number): Recipe => ({
  limb: 'hindlimb', stage, theiler: THEILER[stage], state: stateAt(stage), phalanges, aer: false, boneWidth: BONE_WIDTH[stage],
  hairPlacodes: hair ? (g) => placodes(g, hair) : undefined,
  decor: (g, style) => (stage >= 'E16.5' ? claws(g, style) : '') + padsAndWrinkles(g, pads, wrinkles, style),
  tendons: (g) => digitTendons(g, tendonTo, 'extensor digitorum longus'),
  nerves: (g) => [...trunks(g, ['femoral', 'sciatic (peroneal)', 'sciatic (tibial)']), ...digitalNerves(g, 0.95, 2), ...twigs(g.shoulder, g.elbow, widths(g).stylopodWidth, 2, 5, 1), ...twigs(g.elbow, g.wrist, widths(g).zeugopodWidth, 3, 5, 1)],
})

const RECIPES: Recipe[] = [
  { limb: 'hindlimb', stage: 'E10.5', theiler: 17, state: stateAt('E10.5'), phalanges, aer: false, muscles: none, tendons: none, nerves: none },
  {
    limb: 'hindlimb', stage: 'E11.5', theiler: 19, state: stateAt('E11.5'), phalanges, aer: true, boneWidth: BONE_WIDTH['E11.5'],
    muscles: none,
    tendons: none,
    nerves: (g) => [{ name: 'lumbar plexus axons at the base', path: `M${g.shoulder[0]} ${g.shoulder[1]}L${lerp(g.shoulder, g.elbow, 0.3)[0].toFixed(1)} ${lerp(g.shoulder, g.elbow, 0.3)[1].toFixed(1)}`, width: 2 }],
  },
  {
    limb: 'hindlimb', stage: 'E12.5', theiler: 20, state: stateAt('E12.5'), phalanges, aer: true, boneWidth: BONE_WIDTH['E12.5'],
    muscles: (g) => masses(g.shoulder, g.elbow, widths(g).stylopodWidth, ['dorsal premuscle mass', 'ventral premuscle mass']),
    tendons: none,
    nerves: (g) => trunks(g, ['femoral', 'sciatic (peroneal)', 'sciatic (tibial)'], 0),
  },
  {
    limb: 'hindlimb', stage: 'E13.5', theiler: 21, state: stateAt('E13.5'), phalanges, aer: true, boneWidth: BONE_WIDTH['E13.5'],
    muscles: (g) => [...blocks(g.shoulder, g.elbow, widths(g).stylopodWidth, STYLO4), ...masses(g.elbow, g.wrist, widths(g).zeugopodWidth, ['dorsal crural mass', 'ventral crural mass'])],
    tendons: (g) => [{ name: 'ankle tendon progenitor field', path: `M${(g.wrist[0] - 2).toFixed(1)} ${(g.wrist[1] - widths(g).zeugopodWidth * 0.6).toFixed(1)}Q${(g.wrist[0] + 8).toFixed(1)} ${g.wrist[1].toFixed(1)} ${(g.wrist[0] - 2).toFixed(1)} ${(g.wrist[1] + widths(g).zeugopodWidth * 0.6).toFixed(1)}` }],
    nerves: (g) => [...trunks(g, ['femoral', 'sciatic (peroneal)', 'sciatic (tibial)']), ...twigs(g.shoulder, g.elbow, widths(g).stylopodWidth, 2, 4, 2)],
  },
  mature('E14.5', 0.3, false, false, 4),
  mature('E15.5', 0.72, false, false),
  mature('E16.5', 0.98, false, false),
  mature('E17.5', 0.98, true, true),
  mature('E18.5', 0.98, true, true),
]

export const hindlimb: LimbStage[] = RECIPES.map(assemble)
