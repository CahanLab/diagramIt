/**
 * Mouse embryo (fetus) stage icons, late gestation: E16.5 (TS24), E17.5 (TS25),
 * E18.5 (TS26). Lateral view, head to the left, back to the right, after the
 * eMouseAtlas Theiler stage drawings. Body is one closed #PRIMARY path; limbs
 * and tail are separate #PRIMARY paths on top; eye and ear use #SECONDARY.
 */
import type { LibraryItem } from '../../types'

const wrap = (viewBox: string, body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><g fill="none" stroke="#1f2937" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`

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
  primary: '#e8c9a0',
  secondary: '#374151',
})

/**
 * A limb or tail segment: a dark stroke of width `w` with a `#PRIMARY` stroke
 * 5 units narrower on top, so the result is a rounded sausage with a 2.5 px
 * outline (the same trick as the simple tissues.embryo icon).
 */
const limb = (d: string, w: number) =>
  `<path d="${d}" stroke-width="${w}"/><path d="${d}" stroke="#PRIMARY" stroke-width="${w - 5}"/>`

/** Vibrissa pad: dotted patch on the snout. */
const pad = (x: number, y: number) =>
  `<path d="M${x} ${y}h0M${x + 4} ${y}h0M${x} ${y + 4}h0M${x + 4} ${y + 4}h0M${x + 1} ${y + 8}h0M${x + 5} ${y + 8}h0" stroke-width="2"/>`

/** Tail from under the rump, lying along the belly with the tip pointing up (drawn under the limbs). */
const tail = limb('M44 108C34 110 24 106 18 98 15 94 14 88 14 82', 6.5)

/** Hindlimb: thigh down and forward to the knee, foot pointing up with the sole forward; toes on top. */
const hindlimb = (dy: number) =>
  limb(`M50 ${94 + dy}L32 ${102 + dy}`, 16) +
  limb(`M28 ${100 + dy}L27 ${87 + dy}`, 9) +
  `<path d="M24 ${84 + dy}l-1-3M27 ${83 + dy}l0-3M30 ${84 + dy}l1-3" stroke-width="2"/>`

export const items: LibraryItem[] = [
  {
    ...base('16.5', 24, ['eyelids fused', 'claws', 'hernia withdrawn', 'fetal']),
    width: 112,
    height: 134,
    svg: wrap(
      VB,
      // body: blunt muzzle, forehead, crown, nape, back, rump, belly, double chin
      `<path d="M13 48C11 40 16 32 24 24 32 12 44 8 52 10c8 1 14 6 20 16 8 10 18 24 18 40 0 28-14 50-34 50-16 0-28-8-30-20-2-12 0-24 6-31-6-1-10-4-11-8-6-1-9-2-8-9z" fill="#PRIMARY"/>` +
        tail +
        hindlimb(0) +
        // forelimb flexed at the elbow, hand under the chin, claws as dark wedges
        limb('M36 65L27 77 19 72', 11) +
        `<ellipse cx="17" cy="73" rx="4.5" ry="5" fill="#PRIMARY" stroke-width="2"/>` +
        `<path d="M13 70l-4-2 2 4zM12 74l-4 0 1 3zM14 78l-4 2 3 2z" fill="#1f2937" stroke-width="1"/>` +
        // snout: vibrissa pad and mouth
        pad(17, 41) +
        `<path d="M15 53l7 0"/>` +
        // fused eyelids (single curved line) and ear flat against the head
        `<path d="M22 36q4-3 8 0" stroke="#SECONDARY"/>` +
        `<ellipse cx="55" cy="31" rx="3.5" ry="5.5" fill="#SECONDARY" stroke-width="2"/>`,
    ),
  },
  {
    ...base('17.5', 25, ['wrinkled skin', 'whiskers', 'vibrissae', 'footpads', 'subcutaneous fat', 'fetal']),
    width: 119,
    height: 143,
    svg: wrap(
      VB,
      `<path d="M11 50C9 42 14 33 22 25 30 13 44 8 54 10c8 2 14 7 19 17 9 9 19 23 19 39 0 28-14 50-36 50-16 0-28-8-30-20-2-12 0-24 6-31-6-1-10-4-12-7-6 0-10-2-9-8z" fill="#PRIMARY"/>` +
        tail +
        hindlimb(2) +
        // footpads on the sole
        `<path d="M26 100h0M26 95h0" stroke-width="2.5"/>` +
        // forelimb extended forward, hand curled with fingers
        limb('M38 68L26 70 16 73', 11) +
        `<ellipse cx="14" cy="75" rx="4.5" ry="4.5" fill="#PRIMARY" stroke-width="2"/>` +
        `<path d="M12 71l-3-2M10 75l-4 0M12 79l-3 2" stroke-width="2"/>` +
        pad(15, 43) +
        `<path d="M13 55l8 0"/>` +
        // long whiskers
        `<path d="M14 45l-10-4M13 49l-11-1M14 53l-10 3" stroke-width="2"/>` +
        // closed eye: lid bulge with the fused line
        `<ellipse cx="27" cy="38" rx="5" ry="3" stroke="#SECONDARY" stroke-width="2"/>` +
        `<path d="M22 38h10" stroke="#SECONDARY"/>` +
        `<ellipse cx="57" cy="31" rx="4" ry="5" fill="#SECONDARY" stroke-width="2"/>` +
        // wrinkled skin: folds along the nape and back
        `<path d="M62 22q5 0 8 4M72 29q4 2 6 7M81 42q3 3 3 8M86 58q1 4 0 9" stroke-width="2"/>`,
    ),
  },
  {
    ...base('18.5', 26, ['term', 'term fetus', 'newborn', 'perinatal', 'whiskers', 'vibrissae', 'claws', 'fetal']),
    width: 125,
    height: 150,
    svg: wrap(
      VB,
      // bigger head, thick blunt muzzle, rounder trunk
      `<path d="M9 52C7 43 12 33 21 25 30 12 45 7 56 10c8 2 14 8 18 17 10 9 19 23 19 39 0 28-14 50-37 50-16 0-28-8-30-20-2-12 0-24 6-31-6-1-10-4-12-6-7 1-11-1-11-7z" fill="#PRIMARY"/>` +
        tail +
        hindlimb(2) +
        // forelimb tucked forward, hand curled, claws
        limb('M38 70L26 72 16 76', 11) +
        `<ellipse cx="14" cy="78" rx="4.5" ry="4.5" fill="#PRIMARY" stroke-width="2"/>` +
        `<path d="M11 74l-4-2 2 4zM9 78l-4 0 1 3zM11 82l-4 2 3 2z" fill="#1f2937" stroke-width="1"/>` +
        pad(13, 45) +
        `<path d="M11 57l8 0"/>` +
        `<path d="M12 47l-9-4M11 51l-9-1M12 55l-9 3" stroke-width="2"/>` +
        `<ellipse cx="26" cy="39" rx="5.5" ry="3" stroke="#SECONDARY" stroke-width="2"/>` +
        `<path d="M20.5 39h11" stroke="#SECONDARY"/>` +
        `<path d="M59 23c4-1 6 3 5 7-1 3-5 4-7 1-2-3-1-7 2-8z" fill="#SECONDARY" stroke-width="2"/>` +
        `<path d="M66 21q5 0 8 4M76 29q4 2 6 7M84 44q3 3 3 8" stroke-width="2"/>`,
    ),
  },
]
