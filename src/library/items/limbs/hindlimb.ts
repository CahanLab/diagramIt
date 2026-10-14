/**
 * Mouse hindlimb stage data, E10.5 to E18.5. The hindlimb lags the forelimb by
 * about half a day (Martin 1990), so each stage carries the earlier morphology:
 * footplate without scallops at E12.5, concavities rather than clefts at
 * E13.5, toes nearly separate at E14.5, femur ossification barely visible at
 * E15.5 (Rafipay et al. 2018). Spec: docs/superpowers/specs/2026-10-14-mouse-embryo-limb-icons-design.md
 */
import { assemble, blocks, claws, digitTendons, digitalNerves, masses, padsAndWrinkles, placodes, trunks, twigs, type Recipe } from './build'
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

/**
 * Geometry per stage, after the eMouseAtlas 3D models and Theiler plates (TS17 to TS26), Carter 1954 (E12.5) and
 * Martin 1990: dome buds, a thick drumstick thigh tapering into the leg, a round footplate (E12.5) that scallops
 * (E13.5) and splits into a wide fan of tapered toes (E14.5) which closes to near parallel by E16.5; the hallux
 * is short and anterior.
 */
const GEOMETRY: Record<Stage, LimbParams> = {
  'E10.5': { shoulder: [14, 50], stylopod: { len: 5, angle: 4, width: 18 }, zeugopod: { len: 3, angle: 2, width: 17 }, autopod: { angle: 0, palm: 7, width: 15, spacing: 0 }, digits: [], web: 1, bud: { base: 19, width: 19, at: 0 } },
  'E11.5': { shoulder: [14, 50], stylopod: { len: 11, angle: 6, width: 16 }, zeugopod: { len: 7, angle: 2, width: 15 }, autopod: { angle: 0, palm: 12, width: 18, spacing: 0 }, digits: [], web: 1, bud: { base: 15, width: 18.5, at: 0.4 } },
  'E12.5': {
    shoulder: [12, 50], base: 17, stylopod: { len: 16, angle: 6, width: 15, bulge: 0.08 }, zeugopod: { len: 14, angle: 2, width: 12, bulge: 0.05 }, autopod: { angle: 0, palm: 25, width: 13, spacing: 9.5, arc: 3.5 },
    digits: [{ angle: -30, len: 9, width: 6 }, { angle: -15, len: 10, width: 6 }, { angle: 0, len: 10, width: 6 }, { angle: 15, len: 10, width: 6 }, { angle: 30, len: 9, width: 6 }], web: 0.97,
  },
  'E13.5': {
    shoulder: [12, 46], base: 16, stylopod: { len: 22, angle: 12, width: 14, bulge: 0.12 }, zeugopod: { len: 20, angle: -3, width: 11.5, bulge: 0.06 }, autopod: { angle: -8, palm: 24, width: 12.5, spacing: 9.5, arc: 3 },
    digits: [{ angle: -28, len: 11, width: 5 }, { angle: -14, len: 15, width: 5.2 }, { angle: 0, len: 17, width: 5.2 }, { angle: 14, len: 15, width: 5.2 }, { angle: 28, len: 12, width: 5 }], web: 0.8,
  },
  'E14.5': {
    shoulder: [12, 44], base: 16, stylopod: { len: 27, angle: 12, width: 14.5, bulge: 0.15 }, zeugopod: { len: 24, angle: -3, width: 10.5, bulge: 0.06 }, autopod: { angle: -6, palm: 24, width: 10, spacing: 9, arc: 3 },
    digits: [{ angle: -30, len: 13, width: 4.3, tip: 0.6 }, { angle: -15, len: 20, width: 4.5, tip: 0.6 }, { angle: 0, len: 22, width: 4.5, tip: 0.6 }, { angle: 15, len: 20, width: 4.5, tip: 0.6 }, { angle: 30, len: 15, width: 4.3, tip: 0.6 }], web: 0.3,
  },
  'E15.5': {
    shoulder: [12, 42], base: 16, stylopod: { len: 31, angle: 14, width: 14, bulge: 0.15 }, zeugopod: { len: 28, angle: -4, width: 10, bulge: 0.06 }, autopod: { angle: -8, palm: 26, width: 9.5, spacing: 8.5, arc: 2.5 },
    digits: [{ angle: -28, len: 13, width: 3.8, tip: 0.55 }, { angle: -13, len: 21, width: 4, tip: 0.55 }, { angle: 0, len: 23, width: 4, tip: 0.55 }, { angle: 13, len: 21, width: 4, tip: 0.55 }, { angle: 28, len: 16, width: 3.8, tip: 0.55 }], web: 0.1,
  },
  'E16.5': {
    shoulder: [12, 42], base: 17, stylopod: { len: 32, angle: 14, width: 14.5, bulge: 0.15 }, zeugopod: { len: 29, angle: -4, width: 11, bulge: 0.06 }, autopod: { angle: -8, palm: 27, width: 9.5, spacing: 7.5, arc: 2 },
    digits: [{ angle: -24, len: 12, width: 3.8, tip: 0.55 }, { angle: -11, len: 21, width: 4, tip: 0.55 }, { angle: 0, len: 23, width: 4, tip: 0.55 }, { angle: 11, len: 21, width: 4, tip: 0.55 }, { angle: 24, len: 16, width: 3.8, tip: 0.55 }], web: 0.06,
  },
  'E17.5': {
    shoulder: [12, 42], base: 18, stylopod: { len: 33, angle: 14, width: 15.5, bulge: 0.15 }, zeugopod: { len: 30, angle: -4, width: 12, bulge: 0.06 }, autopod: { angle: -8, palm: 28, width: 10.5, spacing: 8, arc: 2 },
    digits: [{ angle: -24, len: 12, width: 4, tip: 0.55 }, { angle: -11, len: 21, width: 4.2, tip: 0.55 }, { angle: 0, len: 23, width: 4.2, tip: 0.55 }, { angle: 11, len: 21, width: 4.2, tip: 0.55 }, { angle: 24, len: 16, width: 4, tip: 0.55 }], web: 0.06,
  },
  'E18.5': {
    shoulder: [12, 42], base: 19, stylopod: { len: 34, angle: 14, width: 16.5, bulge: 0.15 }, zeugopod: { len: 31, angle: -4, width: 13, bulge: 0.06 }, autopod: { angle: -8, palm: 29, width: 11, spacing: 8.5, arc: 2 },
    digits: [{ angle: -24, len: 12, width: 4.2, tip: 0.55 }, { angle: -11, len: 21, width: 4.4, tip: 0.55 }, { angle: 0, len: 23, width: 4.4, tip: 0.55 }, { angle: 11, len: 21, width: 4.4, tip: 0.55 }, { angle: 24, len: 16, width: 4.2, tip: 0.55 }], web: 0.06,
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

const mature = (stage: Stage, tendonTo: number, wrinkles: boolean, pads: boolean, hair?: number): Recipe => ({
  limb: 'hindlimb', stage, theiler: THEILER[stage], lengthMm: LENGTH_MM[stage], params: GEOMETRY[stage], state: stateAt(stage), phalanges, aer: false,
  hairPlacodes: hair ? (g, p) => placodes(g, p, hair) : undefined,
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
  mature('E14.5', 0.3, false, false, 4),
  mature('E15.5', 0.72, false, false),
  mature('E16.5', 0.98, false, false),
  mature('E17.5', 0.98, true, true),
  mature('E18.5', 0.98, true, true),
]

export const hindlimb: LimbStage[] = RECIPES.map(assemble)
