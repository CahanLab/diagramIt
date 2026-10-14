/**
 * Mouse hindlimb stage data, E10.5 to E18.5. The hindlimb lags the forelimb by
 * about half a day (Martin 1990), so each stage carries the earlier morphology:
 * footplate without scallops at E12.5, concavities rather than clefts at
 * E13.5, toes nearly separate at E14.5, femur ossification barely visible at
 * E15.5 (Rafipay et al. 2018). Spec: docs/superpowers/specs/2026-10-14-mouse-embryo-limb-icons-design.md
 */
import { assemble, blocks, claws, digitTendons, digitalNerves, masses, padsAndWrinkles, trunks, twigs, type Recipe } from './build'
import { lerp, type LimbParams } from './geometry'
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

/** Geometry per stage. The foot is broader than the hand, the hallux short and anterior, the toes stubbier. */
const GEOMETRY: Record<Stage, LimbParams> = {
  'E10.5': { shoulder: [14, 50], stylopod: { len: 6, angle: 4, width: 18 }, zeugopod: { len: 4, angle: 2, width: 17 }, autopod: { angle: 0, palm: 8, width: 15, spacing: 0 }, digits: [], web: 1 },
  'E11.5': { shoulder: [14, 50], stylopod: { len: 12, angle: 6, width: 18 }, zeugopod: { len: 8, angle: 2, width: 17 }, autopod: { angle: 0, palm: 16, width: 17, spacing: 0 }, digits: [], web: 1 },
  'E12.5': {
    shoulder: [12, 48], stylopod: { len: 22, angle: 14, width: 12 }, zeugopod: { len: 20, angle: -10, width: 11 }, autopod: { angle: -10, palm: 22, width: 13, spacing: 10, arc: 2 },
    digits: [{ angle: -24, len: 9, width: 5.4 }, { angle: -12, len: 12, width: 5.6 }, { angle: 0, len: 13, width: 5.6 }, { angle: 12, len: 12, width: 5.6 }, { angle: 24, len: 10, width: 5.4 }], web: 0.95,
  },
  'E13.5': {
    shoulder: [12, 46], stylopod: { len: 25, angle: 18, width: 11.5 }, zeugopod: { len: 23, angle: -12, width: 10.5 }, autopod: { angle: -12, palm: 29, width: 12, spacing: 9.5, arc: 3 },
    digits: [{ angle: -24, len: 11, width: 4.8 }, { angle: -12, len: 16, width: 5 }, { angle: 0, len: 18, width: 5 }, { angle: 12, len: 16, width: 5 }, { angle: 24, len: 13, width: 4.8 }], web: 0.7,
  },
  'E14.5': {
    shoulder: [12, 44], stylopod: { len: 30, angle: 22, width: 11 }, zeugopod: { len: 28, angle: -14, width: 10 }, autopod: { angle: -14, palm: 32, width: 11, spacing: 9, arc: 4 },
    digits: [{ angle: -26, len: 12, width: 4.2 }, { angle: -12, len: 19, width: 4.4 }, { angle: 0, len: 21, width: 4.4 }, { angle: 12, len: 19, width: 4.4 }, { angle: 26, len: 14, width: 4.2 }], web: 0.2,
  },
  'E15.5': {
    shoulder: [12, 42], stylopod: { len: 33, angle: 25, width: 10.5 }, zeugopod: { len: 31, angle: -16, width: 9.5 }, autopod: { angle: -16, palm: 34, width: 10.5, spacing: 8.5, arc: 4 },
    digits: [{ angle: -26, len: 12, width: 3.7 }, { angle: -12, len: 20, width: 3.9 }, { angle: 0, len: 22, width: 3.9 }, { angle: 12, len: 20, width: 3.9 }, { angle: 26, len: 15, width: 3.7 }], web: 0.06,
  },
  'E16.5': {
    shoulder: [12, 42], stylopod: { len: 34, angle: 25, width: 11 }, zeugopod: { len: 32, angle: -16, width: 10 }, autopod: { angle: -16, palm: 35, width: 11, spacing: 8.5, arc: 4 },
    digits: [{ angle: -26, len: 12, width: 3.7 }, { angle: -12, len: 21, width: 3.9 }, { angle: 0, len: 23, width: 3.9 }, { angle: 12, len: 21, width: 3.9 }, { angle: 26, len: 15, width: 3.7 }], web: 0.04,
  },
  'E17.5': {
    shoulder: [12, 42], stylopod: { len: 35, angle: 25, width: 12 }, zeugopod: { len: 33, angle: -16, width: 11 }, autopod: { angle: -16, palm: 36, width: 12, spacing: 9, arc: 4 },
    digits: [{ angle: -25, len: 12, width: 3.8 }, { angle: -12, len: 21, width: 4 }, { angle: 0, len: 23, width: 4 }, { angle: 12, len: 21, width: 4 }, { angle: 25, len: 15, width: 3.8 }], web: 0.04,
  },
  'E18.5': {
    shoulder: [12, 42], stylopod: { len: 36, angle: 25, width: 13 }, zeugopod: { len: 34, angle: -16, width: 12 }, autopod: { angle: -16, palm: 37, width: 13, spacing: 9.5, arc: 4 },
    digits: [{ angle: -25, len: 12, width: 4 }, { angle: -12, len: 21, width: 4.2 }, { angle: 0, len: 23, width: 4.2 }, { angle: 12, len: 21, width: 4.2 }, { angle: 25, len: 15, width: 4 }], web: 0.04,
  },
}

const THEILER: Record<Stage, number> = { 'E10.5': 17, 'E11.5': 19, 'E12.5': 20, 'E13.5': 21, 'E14.5': 22, 'E15.5': 23, 'E16.5': 24, 'E17.5': 25, 'E18.5': 26 }
/** Approximate hip-to-toe length in mm (about half a day behind the forelimb). */
const LENGTH_MM: Record<Stage, number> = { 'E10.5': 0.6, 'E11.5': 1.1, 'E12.5': 1.8, 'E13.5': 2.5, 'E14.5': 3.2, 'E15.5': 3.9, 'E16.5': 4.6, 'E17.5': 5.3, 'E18.5': 6 }

const STYLO4: [string, string, string, string] = ['gluteal', 'quadriceps', 'hamstring', 'adductor']
const ZEUGO4: [string, string, string, string] = ['tibialis anterior', 'extensor digitorum longus', 'gastrocnemius', 'flexor digitorum']

const intrinsics = (g: Parameters<Recipe['muscles']>[0]) =>
  g.rays.slice(1).map((r, i) => {
    const c = lerp(r.base, g.wrist, 0.3)
    return { name: `interosseous ${i + 1}`, path: `M${(c[0] - 2.2).toFixed(1)} ${c[1].toFixed(1)}a2.2 1.6 0 1 0 4.4 0a2.2 1.6 0 1 0 -4.4 0z` }
  })

const mature = (stage: Stage, tendonTo: number, wrinkles: boolean, pads: boolean, hair?: [number, number][]): Recipe => ({
  limb: 'hindlimb', stage, theiler: THEILER[stage], lengthMm: LENGTH_MM[stage], params: GEOMETRY[stage], state: stateAt(stage), phalanges, aer: false,
  hairPlacodes: hair,
  decor: (g, style) => (stage >= 'E16.5' ? claws(g, style) : '') + padsAndWrinkles(g, GEOMETRY[stage], pads, wrinkles, style),
  muscles: (g, p) => [...blocks(g.shoulder, g.elbow, p.stylopod.width, STYLO4), ...blocks(g.elbow, g.wrist, p.zeugopod.width, ZEUGO4), ...intrinsics(g)],
  tendons: (g) => digitTendons(g, tendonTo, 'extensor digitorum longus'),
  nerves: (g, p) => [...trunks(g, p, ['femoral', 'sciatic (peroneal)', 'sciatic (tibial)']), ...digitalNerves(g, 0.95, 2), ...twigs(g.shoulder, g.elbow, p.stylopod.width, 2, 5, 1), ...twigs(g.elbow, g.wrist, p.zeugopod.width, 3, 5, 1)],
})

const RECIPES: Recipe[] = [
  { limb: 'hindlimb', stage: 'E10.5', theiler: 17, lengthMm: 0.6, params: GEOMETRY['E10.5'], state: stateAt('E10.5'), phalanges, aer: false, muscles: none, tendons: none, nerves: none },
  {
    limb: 'hindlimb', stage: 'E11.5', theiler: 19, lengthMm: 1.1, params: GEOMETRY['E11.5'], state: stateAt('E11.5'), phalanges, aer: true,
    muscles: none,
    tendons: none,
    nerves: (g) => [{ name: 'lumbar plexus axons at the base', path: `M${g.shoulder[0]} ${g.shoulder[1]}L${lerp(g.shoulder, g.elbow, 0.3)[0].toFixed(1)} ${lerp(g.shoulder, g.elbow, 0.3)[1].toFixed(1)}`, width: 2 }],
  },
  {
    limb: 'hindlimb', stage: 'E12.5', theiler: 20, lengthMm: 1.8, params: GEOMETRY['E12.5'], state: stateAt('E12.5'), phalanges, aer: true,
    muscles: (g, p) => masses(g.shoulder, g.elbow, p.stylopod.width, ['dorsal premuscle mass', 'ventral premuscle mass']),
    tendons: none,
    nerves: (g, p) => trunks(g, p, ['femoral', 'sciatic (peroneal)', 'sciatic (tibial)'], 0),
  },
  {
    limb: 'hindlimb', stage: 'E13.5', theiler: 21, lengthMm: 2.5, params: GEOMETRY['E13.5'], state: stateAt('E13.5'), phalanges, aer: true,
    muscles: (g, p) => [...blocks(g.shoulder, g.elbow, p.stylopod.width, STYLO4), ...masses(g.elbow, g.wrist, p.zeugopod.width, ['dorsal crural mass', 'ventral crural mass'])],
    tendons: (g, p) => [{ name: 'ankle tendon progenitor field', path: `M${(g.wrist[0] - 2).toFixed(1)} ${(g.wrist[1] - p.autopod.width * 0.6).toFixed(1)}Q${(g.wrist[0] + 8).toFixed(1)} ${g.wrist[1].toFixed(1)} ${(g.wrist[0] - 2).toFixed(1)} ${(g.wrist[1] + p.autopod.width * 0.6).toFixed(1)}` }],
    nerves: (g, p) => [...trunks(g, p, ['femoral', 'sciatic (peroneal)', 'sciatic (tibial)']), ...twigs(g.shoulder, g.elbow, p.stylopod.width, 2, 4, 2)],
  },
  mature('E14.5', 0.3, false, false, [[30, 46], [40, 52], [50, 58], [62, 58]]),
  mature('E15.5', 0.72, false, false),
  mature('E16.5', 0.98, false, false),
  mature('E17.5', 0.98, true, true),
  mature('E18.5', 0.98, true, true),
]

export const hindlimb: LimbStage[] = RECIPES.map(assemble)
