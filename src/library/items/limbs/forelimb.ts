/**
 * Mouse forelimb stage data, E10.5 to E18.5. Outline and element positions are
 * derived from the parametric geometry; tissue presence and element states
 * follow the timetable in docs/superpowers/specs/2026-10-14-mouse-embryo-limb-icons-design.md
 * (Martin 1990; Rafipay et al. 2018).
 */
import { assemble, blocks, claws, digitTendons, digitalNerves, masses, padsAndWrinkles, trunks, twigs, type Recipe } from './build'
import { lerp, type LimbParams } from './geometry'
import type { ElementName, LimbStage, Stage } from './types'

type Digit = 1 | 2 | 3 | 4 | 5
const LONG: ElementName[] = ['humerus', 'radius', 'ulna']

/** Element state rules by stage. Returns undefined when the element is not yet present. */
function stateAt(stage: Stage): Recipe['state'] {
  return (name, digit) => {
    const d = digit ?? 3
    switch (stage) {
      case 'E10.5':
        return undefined
      case 'E11.5':
        return name === 'humerus' ? 'condensation' : undefined
      case 'E12.5':
        if (LONG.includes(name)) return 'cartilage'
        if (name === 'metacarpal') return 'condensation'
        return undefined
      case 'E13.5':
        if (LONG.includes(name) || name === 'metacarpal' || name === 'proximal-phalanx' || name === 'middle-phalanx') return 'cartilage'
        if (name === 'distal-phalanx') return d === 1 ? undefined : 'condensation'
        return undefined
      case 'E14.5':
        if (LONG.includes(name)) return 'sleeve'
        return 'cartilage'
      case 'E15.5':
        if (name === 'humerus') return 'ossifying'
        if (LONG.includes(name)) return 'sleeve'
        return 'cartilage'
      case 'E16.5':
        if (LONG.includes(name)) return 'ossifying'
        return 'cartilage'
      case 'E17.5':
        if (LONG.includes(name) || (name === 'metacarpal' && d !== 1)) return 'ossifying'
        return 'cartilage'
      case 'E18.5':
        if (LONG.includes(name) || ((name === 'metacarpal' || name === 'proximal-phalanx') && d !== 1)) return 'ossifying'
        return 'cartilage'
    }
  }
}

const phalanges = (digit: Digit): ('proximal-phalanx' | 'middle-phalanx' | 'distal-phalanx')[] =>
  digit === 1 ? ['proximal-phalanx', 'distal-phalanx'] : ['proximal-phalanx', 'middle-phalanx', 'distal-phalanx']

const none = () => []

/** Geometry per stage: stylopod, zeugopod, palm and digits (angles relative to the autopod axis). */
const GEOMETRY: Record<Stage, LimbParams> = {
  'E10.5': { shoulder: [14, 50], stylopod: { len: 9, angle: 6, width: 20 }, zeugopod: { len: 6, angle: 2, width: 18 }, autopod: { angle: 0, palm: 11, width: 15, spacing: 0 }, digits: [], web: 1 },
  'E11.5': { shoulder: [14, 50], stylopod: { len: 16, angle: 8, width: 16 }, zeugopod: { len: 10, angle: 2, width: 15 }, autopod: { angle: -2, palm: 22, width: 21, spacing: 0 }, digits: [], web: 1 },
  'E12.5': {
    shoulder: [12, 46], stylopod: { len: 24, angle: 16, width: 11 }, zeugopod: { len: 22, angle: -6, width: 10 }, autopod: { angle: -8, palm: 24, width: 12, spacing: 10, arc: 3 },
    digits: [{ angle: -30, len: 12, width: 5 }, { angle: -14, len: 16, width: 5.2 }, { angle: 0, len: 17, width: 5.2 }, { angle: 14, len: 16, width: 5.2 }, { angle: 30, len: 13, width: 5 }], web: 0.8,
  },
  'E13.5': {
    shoulder: [12, 44], stylopod: { len: 26, angle: 20, width: 10.5 }, zeugopod: { len: 24, angle: -8, width: 9.5 }, autopod: { angle: -10, palm: 26, width: 11, spacing: 10, arc: 4 },
    digits: [{ angle: -34, len: 13, width: 4.4 }, { angle: -16, len: 20, width: 4.6 }, { angle: 0, len: 22, width: 4.6 }, { angle: 16, len: 20, width: 4.6 }, { angle: 34, len: 15, width: 4.3 }], web: 0.45,
  },
  'E14.5': {
    shoulder: [12, 42], stylopod: { len: 30, angle: 24, width: 10 }, zeugopod: { len: 28, angle: -10, width: 9 }, autopod: { angle: -12, palm: 26, width: 10, spacing: 9.5, arc: 5 },
    digits: [{ angle: -36, len: 13, width: 3.8 }, { angle: -16, len: 22, width: 4 }, { angle: 0, len: 24, width: 4 }, { angle: 16, len: 22, width: 4 }, { angle: 36, len: 16, width: 3.7 }], web: 0.12,
  },
  'E15.5': {
    shoulder: [12, 40], stylopod: { len: 33, angle: 27, width: 9.5 }, zeugopod: { len: 31, angle: -13, width: 8.5 }, autopod: { angle: -15, palm: 26, width: 9.5, spacing: 9, arc: 5 },
    digits: [{ angle: -36, len: 13, width: 3.4 }, { angle: -15, len: 23, width: 3.6 }, { angle: 0, len: 25, width: 3.6 }, { angle: 15, len: 23, width: 3.6 }, { angle: 34, len: 17, width: 3.4 }], web: 0.05,
  },
  'E16.5': {
    shoulder: [12, 40], stylopod: { len: 34, angle: 27, width: 10 }, zeugopod: { len: 32, angle: -13, width: 9 }, autopod: { angle: -15, palm: 27, width: 10, spacing: 9, arc: 5 },
    digits: [{ angle: -36, len: 13, width: 3.4 }, { angle: -15, len: 24, width: 3.6 }, { angle: 0, len: 26, width: 3.6 }, { angle: 15, len: 24, width: 3.6 }, { angle: 34, len: 17, width: 3.4 }], web: 0.04,
  },
  'E17.5': {
    shoulder: [12, 40], stylopod: { len: 35, angle: 27, width: 11 }, zeugopod: { len: 33, angle: -13, width: 10 }, autopod: { angle: -15, palm: 28, width: 11, spacing: 9.5, arc: 5 },
    digits: [{ angle: -35, len: 13, width: 3.6 }, { angle: -15, len: 24, width: 3.8 }, { angle: 0, len: 26, width: 3.8 }, { angle: 15, len: 24, width: 3.8 }, { angle: 33, len: 17, width: 3.5 }], web: 0.04,
  },
  'E18.5': {
    shoulder: [12, 40], stylopod: { len: 36, angle: 27, width: 12 }, zeugopod: { len: 34, angle: -13, width: 11 }, autopod: { angle: -15, palm: 29, width: 12, spacing: 10, arc: 5 },
    digits: [{ angle: -35, len: 13, width: 3.8 }, { angle: -15, len: 24, width: 4 }, { angle: 0, len: 26, width: 4 }, { angle: 15, len: 24, width: 4 }, { angle: 33, len: 17, width: 3.7 }], web: 0.04,
  },
}

const THEILER: Record<Stage, number> = { 'E10.5': 17, 'E11.5': 19, 'E12.5': 20, 'E13.5': 21, 'E14.5': 22, 'E15.5': 23, 'E16.5': 24, 'E17.5': 25, 'E18.5': 26 }
/** Approximate shoulder-to-fingertip length in mm. */
const LENGTH_MM: Record<Stage, number> = { 'E10.5': 0.9, 'E11.5': 1.4, 'E12.5': 2.1, 'E13.5': 2.8, 'E14.5': 3.5, 'E15.5': 4.1, 'E16.5': 4.7, 'E17.5': 5.3, 'E18.5': 6 }

const STYLO4: [string, string, string, string] = ['deltoid/triceps lateral', 'triceps', 'biceps', 'brachialis']
const ZEUGO4: [string, string, string, string] = ['extensor carpi radialis', 'extensor digitorum', 'flexor carpi ulnaris', 'flexor digitorum']

const lumbricals = (g: Parameters<Recipe['muscles']>[0]) =>
  g.rays.slice(1).map((r, i) => {
    const c = lerp(r.base, g.palm, 0.45)
    return { name: `lumbrical ${i + 1}`, path: `M${(c[0] - 2.2).toFixed(1)} ${c[1].toFixed(1)}a2.2 1.6 0 1 0 4.4 0a2.2 1.6 0 1 0 -4.4 0z` }
  })

const mature = (stage: Stage, tendonTo: number, wrinkles: boolean, pads: boolean, hair?: [number, number][]): Recipe => ({
  limb: 'forelimb', stage, theiler: THEILER[stage], lengthMm: LENGTH_MM[stage], params: GEOMETRY[stage], state: stateAt(stage), phalanges, aer: false,
  hairPlacodes: hair,
  decor: (g, style) => (stage >= 'E16.5' ? claws(g, style) : '') + padsAndWrinkles(g, GEOMETRY[stage], pads, wrinkles, style),
  muscles: (g, p) => [...blocks(g.shoulder, g.elbow, p.stylopod.width, STYLO4), ...blocks(g.elbow, g.wrist, p.zeugopod.width, ZEUGO4), ...lumbricals(g)],
  tendons: (g) => digitTendons(g, tendonTo, 'extensor digitorum'),
  nerves: (g, p) => [...trunks(g, p, ['radial', 'median', 'ulnar']), ...digitalNerves(g, 0.95, 2), ...twigs(g.shoulder, g.elbow, p.stylopod.width, 2, 5, 1), ...twigs(g.elbow, g.wrist, p.zeugopod.width, 3, 5, 1)],
})

const RECIPES: Recipe[] = [
  { limb: 'forelimb', stage: 'E10.5', theiler: 17, lengthMm: 0.9, params: GEOMETRY['E10.5'], state: stateAt('E10.5'), phalanges, aer: false, muscles: none, tendons: none, nerves: none },
  {
    limb: 'forelimb', stage: 'E11.5', theiler: 19, lengthMm: 1.4, params: GEOMETRY['E11.5'], state: stateAt('E11.5'), phalanges, aer: true,
    muscles: (g, p) => masses(g.shoulder, g.elbow, p.stylopod.width, ['dorsal premuscle mass', 'ventral premuscle mass']),
    tendons: none,
    nerves: (g, p) => [
      { name: 'dorsal fascicle', path: `M${g.shoulder[0]} ${(g.shoulder[1] - p.stylopod.width * 0.3).toFixed(1)}L${lerp(g.shoulder, g.elbow, 0.5)[0].toFixed(1)} ${(lerp(g.shoulder, g.elbow, 0.5)[1] - 3).toFixed(1)}`, width: 2 },
      { name: 'ventral fascicle', path: `M${g.shoulder[0]} ${(g.shoulder[1] + p.stylopod.width * 0.3).toFixed(1)}L${lerp(g.shoulder, g.elbow, 0.45)[0].toFixed(1)} ${(lerp(g.shoulder, g.elbow, 0.45)[1] + 3).toFixed(1)}`, width: 2 },
    ],
  },
  {
    limb: 'forelimb', stage: 'E12.5', theiler: 20, lengthMm: 2.1, params: GEOMETRY['E12.5'], state: stateAt('E12.5'), phalanges, aer: true,
    muscles: (g, p) => [...blocks(g.shoulder, g.elbow, p.stylopod.width, STYLO4), ...masses(g.elbow, g.wrist, p.zeugopod.width, ['dorsal forearm mass', 'ventral forearm mass'])],
    tendons: (g, p) => [{ name: 'wrist tendon progenitor field', path: `M${(g.wrist[0] - 2).toFixed(1)} ${(g.wrist[1] - p.autopod.width * 0.55).toFixed(1)}Q${(g.wrist[0] + 8).toFixed(1)} ${g.wrist[1].toFixed(1)} ${(g.wrist[0] - 2).toFixed(1)} ${(g.wrist[1] + p.autopod.width * 0.55).toFixed(1)}` }],
    nerves: (g, p) => [...trunks(g, p, ['radial', 'median', 'ulnar'], 0.9), ...twigs(g.shoulder, g.elbow, p.stylopod.width, 2, 4, 2)],
  },
  {
    limb: 'forelimb', stage: 'E13.5', theiler: 21, lengthMm: 2.8, params: GEOMETRY['E13.5'], state: stateAt('E13.5'), phalanges, aer: true,
    hairPlacodes: [[30, 44], [38, 50], [46, 56], [60, 56]],
    muscles: (g, p) => [...blocks(g.shoulder, g.elbow, p.stylopod.width, STYLO4), ...blocks(g.elbow, g.wrist, p.zeugopod.width, ZEUGO4)],
    tendons: (g) => digitTendons(g, 0.05, 'extensor digitorum'),
    nerves: (g, p) => [...trunks(g, p, ['radial', 'median', 'ulnar']), ...digitalNerves(g, 0.1, 2), ...twigs(g.elbow, g.wrist, p.zeugopod.width, 3, 5, 1)],
  },
  mature('E14.5', 0.72, false, false, [[28, 40], [36, 46], [44, 54], [52, 58], [62, 60], [72, 56], [80, 52]]),
  mature('E15.5', 0.98, false, false),
  mature('E16.5', 0.98, false, false),
  mature('E17.5', 0.98, true, true),
  mature('E18.5', 0.98, true, true),
]

export const forelimb: LimbStage[] = RECIPES.map(assemble)

