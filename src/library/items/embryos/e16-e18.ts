/**
 * Mouse embryo (fetus) stage icons, late gestation: E16.5 (TS24), E17.5 (TS25),
 * E18.5 (TS26). Lateral view, head to the left, back to the right, after the
 * eMouseAtlas Theiler stage drawings. Each stage is an `EmbryoModel` (tagged
 * path parts); the basic and camera lucida renderings are derived from it by
 * `renderEmbryo`, so the styles cannot drift apart.
 */
import type { LibraryItem } from '../../types'
import { EMBRYO_PALETTE, renderEmbryo, type EmbryoModel, type EmbryoPart } from './model'

const VB = '0 0 100 120'

const base = (day: string, ts: number, extra: string[]) => ({
  id: `development.mouse-embryo-e${day.replace('.', '-')}`,
  name: `Mouse embryo E${day}`,
  category: 'development' as const,
  keywords: [
    'mouse',
    'mus musculus',
    'embryo',
    'fetus',
    'embryonic day',
    `e${day}`,
    `${day} dpc`,
    `ts${ts}`,
    `theiler ${ts}`,
    `theiler stage ${ts}`,
    'development',
    'organogenesis',
    'late gestation',
    ...extra,
  ],
})

/** Ellipse (or circle when rx === ry) as closed path arcs. */
const ellipse = (cx: number, cy: number, rx: number, ry: number): string =>
  `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0z`

/** Rounded limb or tail segment: outline stroke of width `w` with a #PRIMARY stroke 5 units narrower on top. */
const limb = (d: string, w: number, tag: EmbryoPart['tag'] = 'limb'): EmbryoPart => ({ tag, d, draw: 'sausage', w })

/** Vibrissa pad: dotted patch on the snout. */
const pad = (x: number, y: number): EmbryoPart => ({
  tag: 'vibrissae',
  d: `M${x} ${y}h0M${x + 4} ${y}h0M${x} ${y + 4}h0M${x + 4} ${y + 4}h0M${x + 1} ${y + 8}h0M${x + 5} ${y + 8}h0`,
  draw: 'dots',
  w: 2,
})

/** Tail from under the rump, lying along the belly with the tip pointing up (drawn under the limbs). */
const tail = limb('M44 108C34 110 24 106 18 98 15 94 14 88 14 82', 6.5, 'tail')

/** Hindlimb: thigh down and forward to the knee, foot pointing up with the sole forward; toes on top. */
const hindlimb = (dy: number): EmbryoPart[] => [
  limb(`M50 ${94 + dy}L32 ${102 + dy}`, 16),
  limb(`M28 ${100 + dy}L27 ${87 + dy}`, 9),
  { tag: 'foot', d: `M24 ${84 + dy}l-1-3M27 ${83 + dy}l0-3M30 ${84 + dy}l1-3`, draw: 'stroke', w: 2 },
]

export const models: EmbryoModel[] = [
  {
    stage: 'E16.5',
    theiler: 24,
    viewBox: VB,
    parts: [
      // body: blunt muzzle, forehead, crown, nape, back, rump, belly, double chin
      {
        tag: 'body',
        d: 'M13 48C11 40 16 32 24 24 32 12 44 8 52 10c8 1 14 6 20 16 8 10 18 24 18 40 0 28-14 50-34 50-16 0-28-8-30-20-2-12 0-24 6-31-6-1-10-4-11-8-6-1-9-2-8-9z',
        draw: 'fill',
      },
      tail,
      ...hindlimb(0),
      // forelimb flexed at the elbow, hand under the chin, claws as dark wedges
      limb('M36 65L27 77 19 72', 11),
      { tag: 'hand', d: ellipse(17, 73, 4.5, 5), draw: 'fill', w: 2 },
      { tag: 'claws', d: 'M13 70l-4-2 2 4zM12 74l-4 0 1 3zM14 78l-4 2 3 2z', draw: 'fill-dark' },
      // snout: vibrissa pad and mouth
      pad(17, 41),
      { tag: 'detail', d: 'M15 53l7 0', draw: 'stroke' },
      // fused eyelids (single curved line) and ear flat against the head
      { tag: 'eyelid', d: 'M22 36q4-3 8 0', draw: 'stroke-secondary' },
      { tag: 'ear', d: ellipse(55, 31, 3.5, 5.5), draw: 'fill-secondary' },
    ],
  },
  {
    stage: 'E17.5',
    theiler: 25,
    viewBox: VB,
    parts: [
      {
        tag: 'body',
        d: 'M11 50C9 42 14 33 22 25 30 13 44 8 54 10c8 2 14 7 19 17 9 9 19 23 19 39 0 28-14 50-36 50-16 0-28-8-30-20-2-12 0-24 6-31-6-1-10-4-12-7-6 0-10-2-9-8z',
        draw: 'fill',
      },
      tail,
      ...hindlimb(2),
      // footpads on the sole
      { tag: 'pads', d: 'M26 100h0M26 95h0', draw: 'dots', w: 2.5 },
      // forelimb extended forward, hand curled with fingers
      limb('M38 68L26 70 16 73', 11),
      { tag: 'hand', d: ellipse(14, 75, 4.5, 4.5), draw: 'fill', w: 2 },
      { tag: 'hand', d: 'M12 71l-3-2M10 75l-4 0M12 79l-3 2', draw: 'stroke', w: 2 },
      pad(15, 43),
      { tag: 'detail', d: 'M13 55l8 0', draw: 'stroke' },
      // long whiskers
      { tag: 'whiskers', d: 'M14 45l-10-4M13 49l-11-1M14 53l-10 3', draw: 'stroke', w: 2 },
      // closed eye: lid bulge with the fused line
      { tag: 'eyelid', d: ellipse(27, 38, 5, 3), draw: 'stroke-secondary', w: 2 },
      { tag: 'eyelid', d: 'M22 38h10', draw: 'stroke-secondary' },
      { tag: 'ear', d: ellipse(57, 31, 4, 5), draw: 'fill-secondary' },
      // wrinkled skin: folds along the nape and back
      { tag: 'wrinkles', d: 'M62 22q5 0 8 4M72 29q4 2 6 7M81 42q3 3 3 8M86 58q1 4 0 9', draw: 'stroke', w: 2 },
    ],
  },
  {
    stage: 'E18.5',
    theiler: 26,
    viewBox: VB,
    parts: [
      // bigger head, thick blunt muzzle, rounder trunk
      {
        tag: 'body',
        d: 'M9 52C7 43 12 33 21 25 30 12 45 7 56 10c8 2 14 8 18 17 10 9 19 23 19 39 0 28-14 50-37 50-16 0-28-8-30-20-2-12 0-24 6-31-6-1-10-4-12-6-7 1-11-1-11-7z',
        draw: 'fill',
      },
      tail,
      ...hindlimb(2),
      // forelimb tucked forward, hand curled, claws
      limb('M38 70L26 72 16 76', 11),
      { tag: 'hand', d: ellipse(14, 78, 4.5, 4.5), draw: 'fill', w: 2 },
      { tag: 'claws', d: 'M11 74l-4-2 2 4zM9 78l-4 0 1 3zM11 82l-4 2 3 2z', draw: 'fill-dark' },
      pad(13, 45),
      { tag: 'detail', d: 'M11 57l8 0', draw: 'stroke' },
      { tag: 'whiskers', d: 'M12 47l-9-4M11 51l-9-1M12 55l-9 3', draw: 'stroke', w: 2 },
      { tag: 'eyelid', d: ellipse(26, 39, 5.5, 3), draw: 'stroke-secondary', w: 2 },
      { tag: 'eyelid', d: 'M20.5 39h11', draw: 'stroke-secondary' },
      { tag: 'ear', d: 'M59 23c4-1 6 3 5 7-1 3-5 4-7 1-2-3-1-7 2-8z', draw: 'fill-secondary' },
      { tag: 'wrinkles', d: 'M66 21q5 0 8 4M76 29q4 2 6 7M84 44q3 3 3 8', draw: 'stroke', w: 2 },
    ],
  },
]

const item = (model: EmbryoModel, meta: ReturnType<typeof base>, width: number, height: number): LibraryItem => ({
  ...meta,
  width,
  height,
  svg: renderEmbryo(model, 'basic'),
  ...EMBRYO_PALETTE.basic,
  styles: { lucida: { svg: renderEmbryo(model, 'lucida'), ...EMBRYO_PALETTE.lucida } },
})

export const items: LibraryItem[] = [
  item(models[0]!, base('16.5', 24, ['eyelids fused', 'claws', 'hernia withdrawn', 'fetal']), 112, 134),
  item(models[1]!, base('17.5', 25, ['wrinkled skin', 'whiskers', 'vibrissae', 'footpads', 'subcutaneous fat', 'fetal']), 119, 143),
  item(models[2]!, base('18.5', 26, ['term', 'term fetus', 'newborn', 'perinatal', 'whiskers', 'vibrissae', 'claws', 'fetal']), 125, 150),
]
