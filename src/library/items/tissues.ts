import type { LibraryItem } from '../types'

/** Wrap icon body in an <svg> with the shared outline style on a <g>. */
const wrap = (viewBox: string, body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><g fill="none" stroke="#1f2937" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`

/** Radial tick marks across a ring (used for cell boundaries in the blastocyst). */
const radialTicks = (cx: number, cy: number, r1: number, r2: number, n: number): string => {
  const parts: string[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const c = Math.cos(a)
    const s = Math.sin(a)
    parts.push(`<line x1="${(cx + c * r1).toFixed(1)}" y1="${(cy + s * r1).toFixed(1)}" x2="${(cx + c * r2).toFixed(1)}" y2="${(cy + s * r2).toFixed(1)}" stroke-width="2"/>`)
  }
  return parts.join('')
}

const ORGAN = '#e07a7a'
const NEURAL = '#e8c4c4'
const BONE = '#f3e9d2'

export const items: LibraryItem[] = [
  {
    id: 'tissues.heart',
    name: 'Heart',
    category: 'tissues',
    keywords: ['heart', 'cardiac', 'organ', 'cardiovascular'],
    width: 90,
    height: 90,
    primary: ORGAN,
    secondary: '#c05a5a',
    svg: wrap(
      '0 0 100 100',
      `<path d="M38 36V18a9 9 0 0 1 18 0v18" fill="#SECONDARY"/>` +
        `<path d="M60 36V22h14v14" fill="#SECONDARY"/>` +
        `<path d="M30 34c-10 0-18 10-16 24 2 18 22 30 36 36 12-8 34-22 36-40 2-14-8-22-18-22-6 0-12 4-18 8-6-4-14-6-20-6z" fill="#PRIMARY"/>` +
        `<path d="M58 44c-6 8-4 22 4 40" stroke-width="2"/>` +
        `<path d="M30 46c6 4 10 10 12 18" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3"/>`,
    ),
  },
  {
    id: 'tissues.brain',
    name: 'Brain',
    category: 'tissues',
    keywords: ['brain', 'cerebrum', 'cns', 'neural', 'organ'],
    width: 100,
    height: 90,
    primary: NEURAL,
    secondary: '#c9a0a0',
    svg: wrap(
      '0 0 100 90',
      `<path d="M60 64l-2 20h10l2-20z" fill="#SECONDARY"/>` +
        `<path d="M18 54c-10-10-6-28 10-32 6-12 26-14 36-6 14 0 24 12 20 26 6 10-2 22-14 22H30c-8 0-14-6-12-10z" fill="#PRIMARY"/>` +
        `<path d="M50 20c-4 10-2 24 0 36" stroke-width="2"/>` +
        `<path d="M26 30c8 2 12 8 10 16" stroke-width="2"/>` +
        `<path d="M36 50c6-6 10-6 14 0" stroke-width="2"/>` +
        `<path d="M62 30c8 0 12 6 10 14" stroke-width="2"/>` +
        `<path d="M70 50c4-6 8-6 12-2" stroke-width="2"/>` +
        `<ellipse cx="74" cy="66" rx="12" ry="8" fill="#SECONDARY"/>` +
        `<path d="M66 66c4-2 10-2 14 0" stroke-width="2"/>`,
    ),
  },
  {
    id: 'tissues.liver',
    name: 'Liver',
    category: 'tissues',
    keywords: ['liver', 'hepatic', 'hepatocyte', 'organ', 'gallbladder'],
    width: 100,
    height: 80,
    primary: '#a0522d',
    secondary: '#6f9a5c',
    svg: wrap(
      '0 0 100 80',
      `<path d="M6 36c0-14 14-20 28-18l46 6c12 2 18 14 12 24-6 10-20 18-34 18-12 0-26-6-38-16C12 46 6 42 6 36z" fill="#PRIMARY"/>` +
        `<path d="M60 26c-2 14 0 28-2 38" stroke-width="2"/>` +
        `<ellipse cx="44" cy="64" rx="9" ry="6" fill="#SECONDARY"/>` +
        `<path d="M14 32c6-4 14-6 22-4" stroke="#ffffff" stroke-opacity="0.6" stroke-width="3"/>`,
    ),
  },
  {
    id: 'tissues.kidney',
    name: 'Kidney',
    category: 'tissues',
    keywords: ['kidney', 'renal', 'nephron', 'organ', 'ureter'],
    width: 80,
    height: 100,
    primary: '#b5543c',
    secondary: '#d98c74',
    svg: wrap(
      '0 0 80 100',
      `<path d="M28 52c-6 10-6 24-4 42" stroke-width="3"/>` +
        `<path d="M44 6c20 0 32 20 32 42 0 24-14 44-34 44-16 0-22-10-20-18 2-8 10-10 10-22S20 38 18 30C14 20 26 6 44 6z" fill="#PRIMARY"/>` +
        `<ellipse cx="48" cy="48" rx="14" ry="26" fill="#SECONDARY" stroke="none"/>` +
        `<path d="M30 40c10 2 12 14 0 16" fill="#ffffff"/>`,
    ),
  },
  {
    id: 'tissues.lung',
    name: 'Lungs',
    category: 'tissues',
    keywords: ['lung', 'lungs', 'pulmonary', 'trachea', 'respiratory', 'organ'],
    width: 100,
    height: 100,
    primary: '#f2a6a6',
    secondary: '#d1d5db',
    svg: wrap(
      '0 0 100 100',
      `<path d="M50 30L36 46" stroke-width="4"/>` +
        `<path d="M50 30l14 16" stroke-width="4"/>` +
        `<rect x="44" y="6" width="12" height="26" rx="3" fill="#SECONDARY"/>` +
        `<path d="M44 14h12M44 20h12M44 26h12" stroke-width="2"/>` +
        `<path d="M44 36c-10-4-26 6-30 26-4 20 4 32 16 32 10 0 16-10 16-22V40z" fill="#PRIMARY"/>` +
        `<path d="M56 36c10-4 26 6 30 26 4 20-4 32-16 32-10 0-16-10-16-22V40z" fill="#PRIMARY"/>` +
        `<path d="M16 66c8-2 14 2 18 8" stroke-width="2"/>` +
        `<path d="M84 60c-8-2-14 2-18 8" stroke-width="2"/>`,
    ),
  },
  {
    id: 'tissues.pancreas',
    name: 'Pancreas',
    category: 'tissues',
    keywords: ['pancreas', 'pancreatic', 'islet', 'beta cell', 'organ', 'endocrine'],
    width: 110,
    height: 60,
    primary: '#e8b48a',
    secondary: '#c05a5a',
    svg: wrap(
      '0 0 100 56',
      `<path d="M8 30C6 18 18 8 28 12c12 4 28 4 42 2 14-2 24 2 24 10 0 6-10 10-24 10-14 0-28 6-40 10C18 48 8 42 8 30z" fill="#PRIMARY"/>` +
        `<path d="M14 30c16 0 46-4 74-6" stroke-width="2"/>` +
        `<circle cx="26" cy="24" r="3" fill="#SECONDARY" stroke="none"/>` +
        `<circle cx="46" cy="30" r="3" fill="#SECONDARY" stroke="none"/>` +
        `<circle cx="66" cy="20" r="3" fill="#SECONDARY" stroke="none"/>`,
    ),
  },
  {
    id: 'tissues.intestine',
    name: 'Intestine',
    category: 'tissues',
    keywords: ['intestine', 'gut', 'bowel', 'small intestine', 'colon', 'gi', 'organ'],
    width: 90,
    height: 90,
    primary: '#e8a090',
    svg: wrap(
      '0 0 100 100',
      `<path d="M14 16h56a12 12 0 0 1 0 24H30a12 12 0 0 0 0 24h40a12 12 0 0 1 0 24H14" stroke-width="17"/>` +
        `<path d="M14 16h56a12 12 0 0 1 0 24H30a12 12 0 0 0 0 24h40a12 12 0 0 1 0 24H14" stroke="#PRIMARY" stroke-width="12"/>` +
        `<path d="M24 12h40" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3"/>` +
        `<path d="M34 60h30" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3"/>`,
    ),
  },
  {
    id: 'tissues.stomach',
    name: 'Stomach',
    category: 'tissues',
    keywords: ['stomach', 'gastric', 'gi', 'organ', 'digestive'],
    width: 90,
    height: 90,
    primary: '#e8a090',
    secondary: '#d1d5db',
    svg: wrap(
      '0 0 100 100',
      `<rect x="50" y="4" width="12" height="26" rx="3" fill="#SECONDARY"/>` +
        `<rect x="78" y="64" width="18" height="14" rx="4" fill="#SECONDARY"/>` +
        `<path d="M50 24C30 20 12 34 14 54c2 22 18 38 40 38 14 0 26-8 28-18 2-8-4-14-10-12-6 2-8 2-10-6-4-12 2-22 0-32z" fill="#PRIMARY"/>` +
        `<path d="M26 44c-2 12 2 26 12 36" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3"/>`,
    ),
  },
  {
    id: 'tissues.skin',
    name: 'Skin',
    category: 'tissues',
    keywords: ['skin', 'epidermis', 'dermis', 'cutaneous', 'keratinocyte', 'cross section'],
    width: 100,
    height: 90,
    primary: '#e8b89a',
    secondary: '#f2b8b8',
    svg: wrap(
      '0 0 100 90',
      `<rect x="8" y="60" width="84" height="24" fill="#e5e7eb"/>` +
        `<circle cx="24" cy="72" r="6" fill="#ffffff"/>` +
        `<circle cx="42" cy="74" r="6" fill="#ffffff"/>` +
        `<circle cx="60" cy="72" r="6" fill="#ffffff"/>` +
        `<circle cx="78" cy="74" r="6" fill="#ffffff"/>` +
        `<rect x="8" y="34" width="84" height="26" fill="#SECONDARY"/>` +
        `<path d="M8 18c10-4 20 4 30 0s20 4 30 0 16 2 24 0v16H8z" fill="#PRIMARY"/>` +
        `<path d="M36 18c-4 10-4 22 0 34 4 2 8 2 8-2 0-10 0-22-2-32" fill="#e5e7eb" stroke-width="2"/>` +
        `<path d="M38 18L30 4" stroke-width="2.5"/>` +
        `<path d="M62 42c8 2 12 10 10 16" stroke="#6b7280" stroke-width="2.5"/>`,
    ),
  },
  {
    id: 'tissues.bone',
    name: 'Bone',
    category: 'tissues',
    keywords: ['bone', 'femur', 'long bone', 'skeletal', 'osteo'],
    width: 120,
    height: 44,
    primary: BONE,
    svg: wrap(
      '0 0 100 36',
      `<path d="M14 4C6 4 4 12 8 16c-4 4-2 14 6 14 6 0 10-4 16-6h40c6 2 10 6 16 6 8 0 10-10 6-14 4-4 2-12-6-12-6 0-10 4-16 6H30C24 8 20 4 14 4z" fill="#PRIMARY"/>` +
        `<path d="M32 13h36" stroke="#ffffff" stroke-opacity="0.7" stroke-width="2"/>`,
    ),
  },
  {
    id: 'tissues.cartilage',
    name: 'Cartilage',
    category: 'tissues',
    keywords: ['cartilage', 'chondrocyte', 'hyaline', 'joint', 'matrix'],
    width: 90,
    height: 90,
    primary: '#bfd8e8',
    secondary: '#6b8fb0',
    svg: wrap(
      '0 0 100 100',
      `<rect x="8" y="8" width="84" height="84" rx="14" fill="#PRIMARY"/>` +
        `<ellipse cx="34" cy="34" rx="15" ry="10" fill="#ffffff" stroke-width="2"/>` +
        `<circle cx="28" cy="34" r="5" fill="#SECONDARY" stroke="none"/>` +
        `<circle cx="40" cy="34" r="5" fill="#SECONDARY" stroke="none"/>` +
        `<ellipse cx="66" cy="62" rx="15" ry="10" fill="#ffffff" stroke-width="2"/>` +
        `<circle cx="60" cy="62" r="5" fill="#SECONDARY" stroke="none"/>` +
        `<circle cx="72" cy="62" r="5" fill="#SECONDARY" stroke="none"/>` +
        `<ellipse cx="68" cy="30" rx="9" ry="8" fill="#ffffff" stroke-width="2"/>` +
        `<circle cx="68" cy="30" r="5" fill="#SECONDARY" stroke="none"/>` +
        `<ellipse cx="32" cy="70" rx="9" ry="8" fill="#ffffff" stroke-width="2"/>` +
        `<circle cx="32" cy="70" r="5" fill="#SECONDARY" stroke="none"/>`,
    ),
  },
  {
    id: 'tissues.blood-vessel',
    name: 'Blood vessel',
    category: 'tissues',
    keywords: ['blood vessel', 'vessel', 'vein', 'artery', 'capillary', 'vasculature', 'tube'],
    width: 110,
    height: 70,
    primary: '#d9534f',
    secondary: '#8b2b2b',
    svg: wrap(
      '0 0 100 64',
      `<path d="M22 8h60c8 0 14 10 14 24S90 56 82 56H22z" fill="#PRIMARY"/>` +
        `<ellipse cx="22" cy="32" rx="12" ry="24" fill="#PRIMARY"/>` +
        `<ellipse cx="22" cy="32" rx="6" ry="15" fill="#SECONDARY" stroke-width="2"/>` +
        `<path d="M40 16h36" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3"/>`,
    ),
  },
  {
    id: 'tissues.artery-cut',
    name: 'Artery cross-section',
    category: 'tissues',
    keywords: ['artery', 'cross section', 'vessel wall', 'lumen', 'media', 'intima', 'adventitia'],
    width: 90,
    height: 90,
    primary: '#d9534f',
    secondary: '#8b2b2b',
    svg: wrap(
      '0 0 100 100',
      `<circle cx="50" cy="50" r="44" fill="#e5e7eb"/>` +
        `<circle cx="50" cy="50" r="35" fill="#PRIMARY"/>` +
        `<circle cx="50" cy="50" r="24" fill="#f2b8b8" stroke-width="2"/>` +
        `<circle cx="50" cy="50" r="17" fill="#SECONDARY"/>`,
    ),
  },
  {
    id: 'tissues.muscle',
    name: 'Muscle',
    category: 'tissues',
    keywords: ['muscle', 'skeletal muscle', 'myofiber', 'fiber bundle', 'tendon', 'myocyte'],
    width: 120,
    height: 60,
    primary: '#c0504d',
    secondary: '#e5e7eb',
    svg: wrap(
      '0 0 100 50',
      `<path d="M4 25c4-4 10-5 12-5h8v10h-8c-2 0-8-1-12-5z" fill="#SECONDARY"/>` +
        `<path d="M96 25c-4-4-10-5-12-5h-8v10h8c2 0 8-1 12-5z" fill="#SECONDARY"/>` +
        `<path d="M14 25C14 11 32 5 50 5s36 6 36 20-18 20-36 20-36-6-36-20z" fill="#PRIMARY"/>` +
        `<path d="M22 17c16-5 40-5 56 0" stroke-width="2"/>` +
        `<path d="M18 25h64" stroke-width="2"/>` +
        `<path d="M22 33c16 5 40 5 56 0" stroke-width="2"/>`,
    ),
  },
  {
    id: 'tissues.eye',
    name: 'Eye',
    category: 'tissues',
    keywords: ['eye', 'retina', 'ocular', 'optic', 'iris', 'vision'],
    width: 90,
    height: 90,
    primary: '#6f93be',
    secondary: '#e8c4c4',
    svg: wrap(
      '0 0 100 100',
      `<path d="M74 70l14 20 8-6-14-20z" fill="#SECONDARY"/>` +
        `<circle cx="46" cy="46" r="40" fill="#ffffff"/>` +
        `<circle cx="46" cy="46" r="18" fill="#PRIMARY"/>` +
        `<circle cx="46" cy="46" r="8" fill="#1f2937" stroke="none"/>` +
        `<circle cx="40" cy="38" r="4" fill="#ffffff" stroke="none"/>`,
    ),
  },
  {
    id: 'tissues.spinal-cord',
    name: 'Spinal cord',
    category: 'tissues',
    keywords: ['spinal cord', 'cns', 'grey matter', 'white matter', 'cross section', 'neural'],
    width: 100,
    height: 80,
    primary: NEURAL,
    secondary: '#b98a8a',
    svg: wrap(
      '0 0 100 80',
      `<path d="M4 34h10M4 50h10M86 34h10M86 50h10" stroke-width="3"/>` +
        `<ellipse cx="50" cy="42" rx="40" ry="28" fill="#PRIMARY"/>` +
        `<path d="M50 24c6 0 8 6 10 12 4-2 10 0 10 6s-8 8-12 8c4 6 2 12-4 12-2 0-3-1-4-2-1 1-2 2-4 2-6 0-8-6-4-12-4 0-12-2-12-8s6-8 10-6c2-6 4-12 10-12z" fill="#SECONDARY"/>` +
        `<circle cx="50" cy="42" r="3" fill="#ffffff" stroke-width="2"/>` +
        `<path d="M50 14v10" stroke-width="2"/>`,
    ),
  },
  {
    id: 'tissues.nerve',
    name: 'Nerve',
    category: 'tissues',
    keywords: ['nerve', 'peripheral nerve', 'axon', 'fascicle', 'pns', 'neural'],
    width: 110,
    height: 70,
    primary: NEURAL,
    secondary: '#b98a8a',
    svg: wrap(
      '0 0 100 64',
      `<path d="M26 8h60c6 0 10 8 10 24S92 56 86 56H26z" fill="#PRIMARY"/>` +
        `<path d="M40 14h40M40 50h40" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3"/>` +
        `<ellipse cx="26" cy="32" rx="14" ry="24" fill="#e5e7eb"/>` +
        `<circle cx="26" cy="20" r="4.5" fill="#SECONDARY" stroke-width="2"/>` +
        `<circle cx="22" cy="32" r="4.5" fill="#SECONDARY" stroke-width="2"/>` +
        `<circle cx="30" cy="32" r="4.5" fill="#SECONDARY" stroke-width="2"/>` +
        `<circle cx="26" cy="44" r="4.5" fill="#SECONDARY" stroke-width="2"/>`,
    ),
  },
  {
    id: 'tissues.tooth',
    name: 'Tooth',
    category: 'tissues',
    keywords: ['tooth', 'dental', 'molar', 'enamel', 'dentin', 'pulp'],
    width: 80,
    height: 90,
    primary: '#f7f3ea',
    secondary: ORGAN,
    svg: wrap(
      '0 0 90 100',
      `<path d="M19 40C13 24 27 10 45 10s32 14 26 30c2 16-4 36-12 50-4 6-8 2-8-14l-2-16c-1-6-7-6-8 0l-2 16c0 16-4 20-8 14-8-14-14-34-12-50z" fill="#PRIMARY"/>` +
        `<path d="M41 32c-6 6-4 22-2 40l2 2 2-20h4l2 20 2-2c2-18 4-34-2-40z" fill="#SECONDARY" stroke-width="2"/>` +
        `<path d="M25 40c8 6 32 6 40 0" stroke-width="2"/>`,
    ),
  },
  {
    id: 'tissues.thyroid',
    name: 'Thyroid',
    category: 'tissues',
    keywords: ['thyroid', 'endocrine', 'gland', 'trachea', 'thyroid gland'],
    width: 90,
    height: 90,
    primary: '#c0504d',
    secondary: '#d1d5db',
    svg: wrap(
      '0 0 100 100',
      `<rect x="40" y="4" width="20" height="92" rx="5" fill="#SECONDARY"/>` +
        `<path d="M40 16h20M40 28h20M40 76h20M40 88h20" stroke-width="2"/>` +
        `<path d="M40 36c-10-6-22 2-22 18 0 16 10 26 20 24 6-2 8-10 6-22-2-8-4-16-4-20z" fill="#PRIMARY"/>` +
        `<path d="M60 36c10-6 22 2 22 18 0 16-10 26-20 24-6-2-8-10-6-22 2-8 4-16 4-20z" fill="#PRIMARY"/>` +
        `<path d="M38 50c8-4 16-4 24 0v12c-8-4-16-4-24 0z" fill="#PRIMARY"/>`,
    ),
  },
  {
    id: 'tissues.adrenal',
    name: 'Adrenal gland',
    category: 'tissues',
    keywords: ['adrenal', 'suprarenal', 'endocrine', 'gland', 'cortex', 'medulla', 'kidney'],
    width: 80,
    height: 100,
    primary: '#e3c67a',
    secondary: '#b98a4a',
    svg: wrap(
      '0 0 80 100',
      `<path d="M44 34c18 0 30 18 30 36 0 16-12 26-30 26-14 0-22-8-20-14 2-6 10-8 10-16s-10-10-12-16c-2-8 8-16 22-16z" fill="#d1d5db"/>` +
        `<path d="M22 32c6-20 36-30 50-14 6 8 2 16-10 18-14 2-30 4-38 4-6 0-6-4-2-8z" fill="#PRIMARY"/>` +
        `<path d="M34 24c10-6 24-8 32-2" stroke="#SECONDARY" stroke-width="4"/>`,
    ),
  },
  {
    id: 'tissues.bladder',
    name: 'Bladder',
    category: 'tissues',
    keywords: ['bladder', 'urinary bladder', 'urothelium', 'organ', 'urinary'],
    width: 90,
    height: 90,
    primary: '#e8b48a',
    secondary: '#d1d5db',
    svg: wrap(
      '0 0 100 100',
      `<path d="M30 4c-4 10-6 20-4 28M70 4c4 10 6 20 4 28" stroke-width="3"/>` +
        `<rect x="43" y="82" width="14" height="14" rx="3" fill="#SECONDARY"/>` +
        `<path d="M50 20c26 0 40 18 38 40-2 18-16 26-38 26S14 78 12 60C10 38 24 20 50 20z" fill="#PRIMARY"/>` +
        `<path d="M26 44c4-8 10-14 18-16" stroke="#ffffff" stroke-opacity="0.6" stroke-width="3"/>`,
    ),
  },
  {
    id: 'tissues.uterus',
    name: 'Uterus',
    category: 'tissues',
    keywords: ['uterus', 'womb', 'reproductive', 'fallopian', 'endometrium', 'female', 'organ'],
    width: 100,
    height: 90,
    primary: ORGAN,
    secondary: '#e8b48a',
    svg: wrap(
      '0 0 100 90',
      `<path d="M36 26C24 20 12 24 8 34M64 26c12-6 24-2 28 8" stroke-width="4"/>` +
        `<path d="M8 34l-4 4M8 34l-1 6M8 34l4 5M92 34l4 4M92 34l1 6M92 34l-4 5" stroke-width="2"/>` +
        `<ellipse cx="12" cy="50" rx="7" ry="9" fill="#SECONDARY"/>` +
        `<ellipse cx="88" cy="50" rx="7" ry="9" fill="#SECONDARY"/>` +
        `<rect x="43" y="68" width="14" height="18" rx="4" fill="#PRIMARY"/>` +
        `<path d="M50 20c14 0 24 10 22 26-2 14-12 22-22 26-10-4-20-12-22-26-2-16 8-26 22-26z" fill="#PRIMARY"/>` +
        `<path d="M41 34h18l-9 20z" fill="#ffffff" fill-opacity="0.5" stroke="none"/>`,
    ),
  },
  {
    id: 'tissues.ovary',
    name: 'Ovary',
    category: 'tissues',
    keywords: ['ovary', 'ovarian', 'follicle', 'oocyte', 'female', 'reproductive', 'gonad'],
    width: 100,
    height: 76,
    primary: '#e8b48a',
    secondary: ORGAN,
    svg: wrap(
      '0 0 100 76',
      `<ellipse cx="50" cy="38" rx="44" ry="30" fill="#PRIMARY"/>` +
        `<circle cx="26" cy="32" r="4" fill="#SECONDARY" stroke-width="2"/>` +
        `<circle cx="36" cy="52" r="5" fill="#SECONDARY" stroke-width="2"/>` +
        `<circle cx="70" cy="26" r="5" fill="#SECONDARY" stroke-width="2"/>` +
        `<circle cx="64" cy="50" r="12" fill="#ffffff" stroke-width="2"/>` +
        `<circle cx="64" cy="50" r="4.5" fill="#SECONDARY" stroke-width="2"/>` +
        `<circle cx="44" cy="26" r="7" fill="#ffffff" stroke-width="2"/>` +
        `<circle cx="44" cy="26" r="3" fill="#SECONDARY" stroke="none"/>`,
    ),
  },
  {
    id: 'tissues.testis',
    name: 'Testis',
    category: 'tissues',
    keywords: ['testis', 'testicle', 'testes', 'epididymis', 'male', 'reproductive', 'gonad'],
    width: 80,
    height: 100,
    primary: '#e8b48a',
    secondary: ORGAN,
    svg: wrap(
      '0 0 80 100',
      `<path d="M62 22c0-10-4-16-12-18" stroke-width="3"/>` +
        `<ellipse cx="38" cy="58" rx="30" ry="36" fill="#PRIMARY"/>` +
        `<path d="M62 24c12 8 14 40 6 66" stroke-width="12"/>` +
        `<path d="M62 24c12 8 14 40 6 66" stroke="#SECONDARY" stroke-width="7"/>` +
        `<path d="M22 36c4-6 10-10 16-10" stroke="#ffffff" stroke-opacity="0.6" stroke-width="3"/>`,
    ),
  },
  {
    id: 'tissues.spleen',
    name: 'Spleen',
    category: 'tissues',
    keywords: ['spleen', 'splenic', 'lymphoid', 'organ', 'immune'],
    width: 100,
    height: 76,
    primary: '#8b3a4a',
    secondary: '#c05a5a',
    svg: wrap(
      '0 0 100 76',
      `<path d="M40 6v10M54 6v10" stroke-width="3"/>` +
        `<path d="M8 42C6 22 24 10 46 12c20 2 44 14 46 30 2 16-16 26-36 24C34 64 10 60 8 42z" fill="#PRIMARY"/>` +
        `<path d="M30 16c10 6 24 8 36 6" stroke="#SECONDARY" stroke-width="3"/>` +
        `<path d="M18 36c4-8 12-14 22-16" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3"/>`,
    ),
  },
  {
    id: 'tissues.lymph-node',
    name: 'Lymph node',
    category: 'tissues',
    keywords: ['lymph node', 'lymphoid', 'immune', 'follicle', 'lymphatic', 'node'],
    width: 100,
    height: 76,
    primary: '#e8c9a0',
    secondary: '#b98a4a',
    svg: wrap(
      '0 0 100 76',
      `<path d="M2 26l12 8M2 46l12-4M98 38H86" stroke-width="3"/>` +
        `<path d="M14 38c-4-18 16-30 36-28 22 2 40 12 38 30-2 18-20 28-38 26C30 64 18 56 14 38z" fill="#PRIMARY"/>` +
        `<circle cx="28" cy="30" r="6" fill="#SECONDARY" stroke-width="2"/>` +
        `<circle cx="46" cy="22" r="6" fill="#SECONDARY" stroke-width="2"/>` +
        `<circle cx="66" cy="26" r="6" fill="#SECONDARY" stroke-width="2"/>` +
        `<circle cx="32" cy="50" r="6" fill="#SECONDARY" stroke-width="2"/>` +
        `<circle cx="54" cy="54" r="6" fill="#SECONDARY" stroke-width="2"/>` +
        `<path d="M86 38c-6-6-14-6-20-4" stroke-width="2"/>`,
    ),
  },
  {
    id: 'tissues.thymus',
    name: 'Thymus',
    category: 'tissues',
    keywords: ['thymus', 'thymic', 't cell', 'lymphoid', 'immune', 'organ'],
    width: 80,
    height: 90,
    primary: '#e8b4b4',
    secondary: '#c98a8a',
    svg: wrap(
      '0 0 80 90',
      `<path d="M40 8c-10 4-18 24-22 44-2 16 4 30 16 32 6 2 6-8 6-20z" fill="#PRIMARY"/>` +
        `<path d="M40 8c10 4 18 24 22 44 2 16-4 30-16 32-6 2-6-8-6-20z" fill="#PRIMARY"/>` +
        `<path d="M20 50c6 4 12 4 20 0M60 50c-6 4-12 4-20 0M24 68c6 4 10 4 16 0M56 68c-6 4-10 4-16 0" stroke="#SECONDARY" stroke-width="2.5"/>` +
        `<path d="M28 36c4-10 8-18 12-22" stroke="#ffffff" stroke-opacity="0.6" stroke-width="3"/>`,
    ),
  },
  {
    id: 'tissues.bone-marrow',
    name: 'Bone marrow',
    category: 'tissues',
    keywords: ['bone marrow', 'marrow', 'hematopoietic', 'hsc', 'medullary cavity', 'bone'],
    width: 120,
    height: 56,
    primary: BONE,
    secondary: '#c0504d',
    svg: wrap(
      '0 0 100 48',
      `<path d="M16 6C6 6 4 16 9 22c-5 6-3 16 7 16 7 0 12-5 18-7h46V17H34c-6-2-11-11-18-11z" fill="#PRIMARY"/>` +
        `<rect x="40" y="19" width="40" height="10" fill="#SECONDARY" stroke="none"/>` +
        `<ellipse cx="80" cy="24" rx="7" ry="12" fill="#PRIMARY"/>` +
        `<ellipse cx="80" cy="24" rx="3.5" ry="7" fill="#SECONDARY" stroke-width="2"/>` +
        `<path d="M40 19h40M40 29h40" stroke-width="2"/>`,
    ),
  },
  {
    id: 'tissues.blastocyst',
    name: 'Blastocyst',
    category: 'tissues',
    keywords: ['blastocyst', 'embryo', 'trophectoderm', 'inner cell mass', 'icm', 'blastocoel', 'development'],
    width: 90,
    height: 90,
    primary: '#e8c9a0',
    secondary: '#b98a7a',
    svg: wrap(
      '0 0 100 100',
      `<circle cx="50" cy="50" r="44" fill="#PRIMARY"/>` +
        `<circle cx="50" cy="50" r="35" fill="#ffffff"/>` +
        radialTicks(50, 50, 35, 44, 16) +
        `<circle cx="40" cy="28" r="7" fill="#SECONDARY" stroke-width="2"/>` +
        `<circle cx="54" cy="26" r="7" fill="#SECONDARY" stroke-width="2"/>` +
        `<circle cx="46" cy="38" r="7" fill="#SECONDARY" stroke-width="2"/>` +
        `<circle cx="60" cy="37" r="7" fill="#SECONDARY" stroke-width="2"/>`,
    ),
  },
  {
    id: 'tissues.embryo',
    name: 'Embryo',
    category: 'tissues',
    keywords: ['embryo', 'embryonic', 'development', 'fetus', 'organogenesis'],
    width: 90,
    height: 90,
    primary: '#e8b4a0',
    secondary: '#374151',
    svg: wrap(
      '0 0 100 100',
      `<path d="M56 44c20 10 22 36 4 44-14 6-26-2-24-12" stroke-width="19"/>` +
        `<path d="M56 44c20 10 22 36 4 44-14 6-26-2-24-12" stroke="#PRIMARY" stroke-width="14"/>` +
        `<circle cx="52" cy="30" r="21" fill="#PRIMARY"/>` +
        `<ellipse cx="78" cy="56" rx="7" ry="5" fill="#PRIMARY" stroke-width="2"/>` +
        `<ellipse cx="60" cy="86" rx="6" ry="4" fill="#PRIMARY" stroke-width="2"/>` +
        `<circle cx="60" cy="28" r="4.5" fill="#SECONDARY" stroke="none"/>` +
        `<path d="M62 54c6 4 8 10 6 16" stroke-width="2"/>`,
    ),
  },
  {
    id: 'tissues.gastrula',
    name: 'Gastrula',
    category: 'tissues',
    keywords: ['gastrula', 'gastrulation', 'germ layers', 'ectoderm', 'mesoderm', 'endoderm', 'development'],
    width: 90,
    height: 90,
    primary: '#6f93be',
    secondary: ORGAN,
    svg: wrap(
      '0 0 100 100',
      `<circle cx="50" cy="50" r="44" fill="#PRIMARY"/>` +
        `<circle cx="50" cy="50" r="34" fill="#SECONDARY"/>` +
        `<circle cx="50" cy="50" r="24" fill="#e5e7eb"/>` +
        `<circle cx="50" cy="50" r="14" fill="#ffffff"/>` +
        `<path d="M45 60v34h10V60" fill="#ffffff"/>`,
    ),
  },
  {
    id: 'tissues.neural-tube',
    name: 'Neural tube',
    category: 'tissues',
    keywords: ['neural tube', 'neurulation', 'notochord', 'somite', 'neural crest', 'development', 'cross section'],
    width: 100,
    height: 80,
    primary: NEURAL,
    secondary: '#b98a8a',
    svg: wrap(
      '0 0 100 80',
      `<path d="M6 16h88v10H6z" fill="#e5e7eb"/>` +
        `<ellipse cx="22" cy="46" rx="12" ry="10" fill="#SECONDARY"/>` +
        `<ellipse cx="78" cy="46" rx="12" ry="10" fill="#SECONDARY"/>` +
        `<circle cx="50" cy="44" r="16" fill="#PRIMARY"/>` +
        `<circle cx="50" cy="44" r="7" fill="#ffffff" stroke-width="2"/>` +
        `<circle cx="40" cy="29" r="3" fill="#6b7280" stroke="none"/>` +
        `<circle cx="60" cy="29" r="3" fill="#6b7280" stroke="none"/>` +
        `<circle cx="50" cy="68" r="6" fill="#9ca3af"/>`,
    ),
  },
  {
    id: 'tissues.limb-bud',
    name: 'Limb bud',
    category: 'tissues',
    keywords: ['limb bud', 'limb', 'development', 'aer', 'apical ectodermal ridge', 'mesenchyme'],
    width: 100,
    height: 90,
    primary: '#e8b4a0',
    secondary: '#c05a5a',
    svg: wrap(
      '0 0 100 90',
      `<rect x="6" y="6" width="24" height="78" rx="4" fill="#e5e7eb"/>` +
        `<path d="M28 28c22-6 50-2 60 18-10 20-38 24-60 18z" fill="#PRIMARY"/>` +
        `<path d="M84 38c4 4 5 10 1 16" stroke="#SECONDARY" stroke-width="5"/>` +
        `<circle cx="44" cy="40" r="2.5" fill="#6b7280" stroke="none"/>` +
        `<circle cx="56" cy="50" r="2.5" fill="#6b7280" stroke="none"/>` +
        `<circle cx="60" cy="38" r="2.5" fill="#6b7280" stroke="none"/>` +
        `<circle cx="46" cy="54" r="2.5" fill="#6b7280" stroke="none"/>`,
    ),
  },
  {
    id: 'tissues.tumor',
    name: 'Tumor',
    category: 'tissues',
    keywords: ['tumor', 'tumour', 'cancer', 'neoplasm', 'mass', 'carcinoma', 'oncology'],
    width: 90,
    height: 90,
    primary: '#b35c7a',
    secondary: '#c0392b',
    svg: wrap(
      '0 0 100 100',
      `<path d="M4 62c10-4 16 0 24-6M96 36c-10 4-16 0-24 6M50 96c2-10 0-16 4-24" stroke="#SECONDARY" stroke-width="3"/>` +
        `<path d="M30 24c10-14 32-12 40 0 14 2 22 18 14 30 8 12-4 28-18 24-8 14-30 12-36 0-16-2-20-22-10-28-10-10-2-24 10-26z" fill="#PRIMARY"/>` +
        `<path d="M28 58c8 2 12 10 20 10M70 38c-8 2-12 10-20 12" stroke="#SECONDARY" stroke-width="2.5"/>` +
        `<circle cx="38" cy="38" r="3.5" fill="#374151" stroke="none"/>` +
        `<circle cx="58" cy="62" r="3.5" fill="#374151" stroke="none"/>` +
        `<circle cx="64" cy="30" r="3.5" fill="#374151" stroke="none"/>` +
        `<circle cx="40" cy="74" r="3.5" fill="#374151" stroke="none"/>`,
    ),
  },
  {
    id: 'tissues.biopsy-core',
    name: 'Biopsy core',
    category: 'tissues',
    keywords: ['biopsy', 'core biopsy', 'needle biopsy', 'tissue sample', 'specimen'],
    width: 120,
    height: 48,
    primary: '#c98a7a',
    secondary: '#9ca3af',
    svg: wrap(
      '0 0 100 40',
      `<path d="M6 14h78l12 6-12 6H6z" fill="#SECONDARY"/>` +
        `<rect x="12" y="13" width="64" height="14" rx="7" fill="#PRIMARY"/>` +
        `<path d="M30 14v12M48 14v12M62 14v12" stroke-width="2"/>`,
    ),
  },
  {
    id: 'tissues.tissue-section',
    name: 'Tissue section',
    category: 'tissues',
    keywords: ['tissue section', 'histology', 'slide', 'h&e', 'microscope slide', 'section', 'ihc'],
    width: 120,
    height: 56,
    primary: '#d98fb0',
    secondary: '#7b4b8a',
    svg: wrap(
      '0 0 100 48',
      `<rect x="4" y="8" width="92" height="32" rx="2" fill="#ffffff"/>` +
        `<rect x="4" y="8" width="18" height="32" rx="2" fill="#e5e7eb"/>` +
        `<path d="M40 16c8-8 28-6 36 2 6 8-4 18-16 18-12 0-26-8-20-20z" fill="#PRIMARY"/>` +
        `<circle cx="48" cy="22" r="3" fill="#SECONDARY" stroke="none"/>` +
        `<circle cx="62" cy="18" r="3" fill="#SECONDARY" stroke="none"/>` +
        `<circle cx="66" cy="28" r="3" fill="#SECONDARY" stroke="none"/>` +
        `<circle cx="52" cy="30" r="3" fill="#SECONDARY" stroke="none"/>`,
    ),
  },
  {
    id: 'tissues.organoid-culture',
    name: 'Organoid culture',
    category: 'tissues',
    keywords: ['organoid', 'organoids', 'matrigel dome', '3d culture', 'culture', 'dome'],
    width: 100,
    height: 70,
    primary: '#e8b48a',
    secondary: '#dbeafe',
    svg: wrap(
      '0 0 100 70',
      `<rect x="4" y="58" width="92" height="8" rx="2" fill="#e5e7eb"/>` +
        `<path d="M14 58C14 32 30 16 50 16s36 16 36 42z" fill="#SECONDARY"/>` +
        `<circle cx="34" cy="46" r="7" fill="#PRIMARY" stroke-width="2"/>` +
        `<circle cx="34" cy="46" r="2.5" fill="#ffffff" stroke="none"/>` +
        `<circle cx="52" cy="34" r="8" fill="#PRIMARY" stroke-width="2"/>` +
        `<circle cx="52" cy="34" r="3" fill="#ffffff" stroke="none"/>` +
        `<circle cx="66" cy="49" r="6" fill="#PRIMARY" stroke-width="2"/>` +
        `<circle cx="66" cy="49" r="2" fill="#ffffff" stroke="none"/>`,
    ),
  },
  {
    id: 'tissues.scaffold',
    name: 'Scaffold',
    category: 'tissues',
    keywords: ['scaffold', 'porous scaffold', 'tissue engineering', 'biomaterial', '3d scaffold'],
    width: 100,
    height: 90,
    primary: '#bfd8e8',
    secondary: '#8fb3cc',
    svg: wrap(
      '0 0 100 90',
      `<path d="M10 30h56l24-20H34z" fill="#e5e7eb"/>` +
        `<path d="M66 30l24-20v54L66 84z" fill="#SECONDARY"/>` +
        `<rect x="10" y="30" width="56" height="54" fill="#PRIMARY"/>` +
        `<circle cx="24" cy="44" r="5" fill="#ffffff" stroke-width="2"/>` +
        `<circle cx="52" cy="44" r="5" fill="#ffffff" stroke-width="2"/>` +
        `<circle cx="38" cy="57" r="5" fill="#ffffff" stroke-width="2"/>` +
        `<circle cx="24" cy="70" r="5" fill="#ffffff" stroke-width="2"/>` +
        `<circle cx="52" cy="70" r="5" fill="#ffffff" stroke-width="2"/>` +
        `<ellipse cx="40" cy="20" rx="6" ry="3" fill="#ffffff" stroke-width="2"/>` +
        `<ellipse cx="62" cy="20" rx="6" ry="3" fill="#ffffff" stroke-width="2"/>` +
        `<ellipse cx="78" cy="44" rx="3" ry="6" fill="#ffffff" stroke-width="2"/>` +
        `<ellipse cx="78" cy="64" rx="3" ry="6" fill="#ffffff" stroke-width="2"/>`,
    ),
  },
  {
    id: 'tissues.hydrogel-dome',
    name: 'Hydrogel dome',
    category: 'tissues',
    keywords: ['hydrogel', 'gel', 'matrigel', 'dome', 'ecm', '3d culture', 'biomaterial'],
    width: 100,
    height: 70,
    primary: '#9fd3c7',
    secondary: '#374151',
    svg: wrap(
      '0 0 100 70',
      `<rect x="4" y="58" width="92" height="8" rx="2" fill="#e5e7eb"/>` +
        `<path d="M12 58C12 30 30 14 50 14s38 16 38 44z" fill="#PRIMARY"/>` +
        `<path d="M24 46c2-12 10-20 20-24" stroke="#ffffff" stroke-opacity="0.7" stroke-width="4"/>` +
        `<circle cx="42" cy="44" r="3" fill="#SECONDARY" stroke="none"/>` +
        `<circle cx="58" cy="36" r="3" fill="#SECONDARY" stroke="none"/>` +
        `<circle cx="64" cy="50" r="3" fill="#SECONDARY" stroke="none"/>` +
        `<circle cx="50" cy="28" r="3" fill="#SECONDARY" stroke="none"/>`,
    ),
  },
]
