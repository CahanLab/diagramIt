/**
 * Mouse embryo lateral-view icons, E13.5 to E15.5 (Theiler stages 21 to 23).
 *
 * Silhouettes follow the eMouseAtlas Theiler stage drawings (head to the
 * left, back to the right); stage features follow Theiler (1989) and
 * Kaufman (1992), with the limb series from Martin (1990) Fig. 1.
 *
 * Each stage is an `EmbryoModel` (tagged path parts); `renderEmbryo` turns
 * it into the basic and camera lucida drawings. Body is one closed path;
 * limbs are rounded `sausage` strokes on top, and hands/feet are small
 * local-frame shapes (digits pointing -y) placed with a transform.
 */
import type { LibraryItem } from '../../types'
import { EMBRYO_PALETTE, renderEmbryo, type EmbryoModel, type EmbryoPart } from './model'

const VIEW = '0 0 100 120'

/** Circle as path data (two half arcs). */
const circle = (cx: number, cy: number, r: number): string =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`

/** Rounded limb segment: outline stroke of width w with a narrower body-colour stroke inside. */
const limb = (d: string, w = 10): EmbryoPart => ({ tag: 'limb', d, draw: 'sausage', w })

/** Umbilical hernia: a bump bulging forward from the belly line. */
const hernia = (x: number, y: number, r: number): EmbryoPart => ({
  tag: 'hernia',
  d: `M${x} ${y - r}C${x - r * 1.5} ${y - r * 0.7} ${x - r * 1.5} ${y + r * 0.7} ${x} ${y + r}`,
  draw: 'fill',
  w: 2,
})

/** Transform placing a local-frame shape at (x, y) rotated by `angle` degrees. */
const placement = (x: number, y: number, angle: number, scale = 1.3): string =>
  `translate(${x} ${y}) rotate(${angle}) scale(${scale})`

type Autopod = 'hand' | 'foot'

/** Paddle with clefts between the digits (E13.5 hand). */
const cleftPaddle = (tag: Autopod, transform: string): EmbryoPart[] => [
  { tag, d: 'M-4.5 3L-5 -4.5L-3.8 -9.5L-2.4 -6.5L-1.2 -10.5L0 -7L1.2 -10.5L2.4 -6.5L3.8 -9.5L5 -4.5L4.5 3Z', draw: 'fill', w: 2, transform },
]

/** Paddle with shallow concavities between the digits (E13.5 foot). */
const scallopPaddle = (tag: Autopod, transform: string): EmbryoPart[] => [
  { tag, d: 'M-5 3L-5.5 -4L-4 -8.5L-2.5 -6.5L-1 -9.5L0.5 -7L2 -9.5L3.5 -6.5L5 -8.5L5.5 -4L5 3Z', draw: 'fill', w: 2, transform },
]

/** Palm/sole with four separate digit strokes fanning from it. */
const separateDigits = (tag: Autopod, transform: string, len = 7): EmbryoPart[] => [
  { tag, d: 'M-4.5 3C-5 -2 -3 -5 0 -5C3 -5 5 -2 4.5 3Z', draw: 'fill', w: 2, transform },
  {
    tag,
    d: `M-3.5 -4.5L-6 ${-4.5 - len * 0.8}M-1.2 -5L-2 ${-5 - len}M1.2 -5L2 ${-5 - len}M3.5 -4.5L6 ${-4.5 - len * 0.8}`,
    draw: 'stroke',
    w: 2,
    transform,
  },
]

/** Dotted vibrissae patch: each `h.01` with round caps renders as one dot. */
const vibrissae = (pts: Array<[number, number]>, w = 2): EmbryoPart => ({
  tag: 'vibrissae',
  d: pts.map(([x, y]) => `M${x} ${y}h.01`).join(''),
  draw: 'dots',
  w,
})

const mouth = (d: string): EmbryoPart => ({ tag: 'detail', d, draw: 'stroke', w: 2 })

export const models: EmbryoModel[] = [
  {
    stage: 'E13.5',
    theiler: 21,
    viewBox: VIEW,
    parts: [
      // body: crown, back, rump, tail curling forward under the belly, belly, chin, snout, forehead
      {
        tag: 'body',
        d: 'M36 8C54 3 78 10 87 28C97 48 98 78 88 100C82 112 68 118 56 116C48 119 30 121 18 116C28 113 36 108 40 102C32 98 24 94 24 86C24 78 32 72 34 64C30 60 22 58 14 54C6 48 8 38 14 32C18 24 24 12 36 8Z',
        draw: 'fill',
      },
      hernia(27, 87, 6),
      // hindlimb: thigh down and forward, foot pointing forward with toe concavities
      limb('M52 93C44 94 36 96 32 100C28 102 26 105 25 107', 13),
      ...scallopPaddle('foot', placement(24, 108, -112)),
      // forelimb: flexed, hand with clefts under the chin
      limb('M52 64C48 72 46 80 43 84C38 82 34 78 32 73', 12),
      ...cleftPaddle('hand', placement(31, 71, -50)),
      // eye (pigmented) with eyelid rim arc above
      { tag: 'eye', d: circle(25, 37, 4), draw: 'fill-secondary', w: 2 },
      { tag: 'eyelid', d: 'M19 33C22 29 29 29 32 34', draw: 'stroke', w: 2 },
      // pinna folding forward over the meatus
      { tag: 'ear', d: 'M45 39C50 41 50 49 45 51C47 47 47 43 45 39Z', draw: 'fill-secondary', w: 2 },
      // vibrissae patch and mouth
      vibrissae([[12, 44], [16, 43], [20, 44], [13, 48], [17, 47], [21, 48]]),
      mouth('M13 54C17 55 21 55 25 57'),
    ],
  },
  {
    stage: 'E14.5',
    theiler: 22,
    viewBox: VIEW,
    parts: [
      // body: larger head, straighter back
      {
        tag: 'body',
        d: 'M34 8C56 2 80 12 86 32C92 50 94 78 86 100C80 114 64 120 52 117C46 119 30 121 18 116C28 113 36 108 40 102C32 98 25 94 25 86C25 78 34 72 36 66C30 62 22 60 14 56C6 50 6 40 12 32C16 24 22 12 34 8Z',
        draw: 'fill',
      },
      hernia(28, 87, 5.5),
      // hindlimb folded, foot forward, toes separating (deep clefts)
      limb('M52 93C44 94 36 96 32 100C28 102 26 105 25 107', 13),
      ...cleftPaddle('foot', placement(24, 108, -112)),
      // forelimb flexed, separate fingers under the chin
      limb('M52 66C48 74 46 82 43 86C38 84 34 80 32 75', 12),
      ...separateDigits('hand', placement(31, 73, -50), 6),
      // eye with open eyelids (arc above and below)
      { tag: 'eye', d: circle(24, 38, 3.5), draw: 'fill-secondary', w: 2 },
      { tag: 'eyelid', d: 'M18 35C21 31 27 31 30 35M18 42C21 45 27 45 30 42', draw: 'stroke', w: 2 },
      // pinna covering the meatus
      { tag: 'ear', d: 'M44 38C49 34 53 37 52 43C51 47 47 49 44 47C46 44 46 41 44 38Z', draw: 'fill-secondary', w: 2 },
      // vibrissae rows and mouth
      vibrissae([[11, 43], [15, 42], [19, 43], [11, 47], [15, 46], [19, 47], [12, 51], [16, 50], [20, 51]]),
      mouth('M13 57C17 58 22 58 26 60'),
    ],
  },
  {
    stage: 'E15.5',
    theiler: 23,
    viewBox: VIEW,
    parts: [
      // body: big round head, blunt snout, nearly upright trunk
      {
        tag: 'body',
        d: 'M34 6C58 0 82 12 86 34C90 52 92 80 84 100C78 114 62 120 50 117C44 119 30 121 20 116C30 113 38 108 42 102C34 98 27 94 27 86C27 78 36 72 38 66C32 62 24 60 16 58C8 54 6 42 12 34C16 24 22 10 34 6Z',
        draw: 'fill',
      },
      // reduced umbilical hernia
      hernia(28, 87, 4),
      // hindlimb folded, foot pointing forward, toes separate
      limb('M52 93C44 94 36 96 32 99C28 101 26 103 25 105', 13),
      ...separateDigits('foot', placement(24, 106, -105), 7),
      // forelimb flexed, fingers separate under the chin
      limb('M52 68C48 76 46 84 43 88C38 86 34 82 32 77', 12),
      ...separateDigits('hand', placement(31, 75, -50), 6),
      // eye narrowing as the eyelids fuse: lens shape with a white lid line
      { tag: 'eye', d: 'M18 38C21 33 29 33 32 38C29 43 21 43 18 38Z', draw: 'fill-secondary', w: 2 },
      // the lid line is a thin white bar (1.5 tall) with no stroke, matching the former white 1.5 stroke
      { tag: 'eyelid', d: 'M18 38h14', draw: 'stroke-white', w: 1.5 },
      // pinna flat against the head
      { tag: 'ear', d: 'M46 36C51 33 54 37 53 43C52 48 48 50 45 48C47 44 47 40 46 36Z', draw: 'fill-secondary', w: 2 },
      // vibrissae rows and mouth
      vibrissae([[12, 45], [16, 44], [20, 45], [12, 49], [16, 48], [20, 49], [13, 53], [17, 52], [21, 53]]),
      mouth('M15 59C19 60 24 60 28 62'),
    ],
  },
]

const common = ['mouse', 'mus musculus', 'embryo', 'embryonic day', 'development', 'organogenesis', 'fetus', 'lateral view']

const meta: Array<Pick<LibraryItem, 'id' | 'name' | 'keywords' | 'width' | 'height'>> = [
  {
    id: 'development.mouse-embryo-e13-5',
    name: 'Mouse embryo E13.5',
    keywords: [...common, 'e13.5', '13.5 dpc', 'ts21', 'theiler 21', 'theiler stage 21', 'digit clefts', 'pinna', 'eyelid', 'vibrissae', 'umbilical hernia'],
    width: 93,
    height: 112,
  },
  {
    id: 'development.mouse-embryo-e14-5',
    name: 'Mouse embryo E14.5',
    keywords: [...common, 'e14.5', '14.5 dpc', 'ts22', 'theiler 22', 'theiler stage 22', 'separate fingers', 'toes separating', 'eyelids open', 'pinna', 'vibrissae'],
    width: 98,
    height: 117,
  },
  {
    id: 'development.mouse-embryo-e15-5',
    name: 'Mouse embryo E15.5',
    keywords: [...common, 'e15.5', '15.5 dpc', 'ts23', 'theiler 23', 'theiler stage 23', 'eyelids fusing', 'separate digits', 'toes', 'smooth skin'],
    width: 104,
    height: 125,
  },
]

export const items: LibraryItem[] = meta.map((m, i) => ({
  ...m,
  category: 'development',
  svg: renderEmbryo(models[i]!, 'basic'),
  primary: EMBRYO_PALETTE.basic.primary,
  secondary: EMBRYO_PALETTE.basic.secondary,
  styles: {
    lucida: { svg: renderEmbryo(models[i]!, 'lucida'), ...EMBRYO_PALETTE.lucida },
  },
}))
