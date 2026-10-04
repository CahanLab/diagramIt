import type { LibraryItem } from '../types'

/** Shared outline attributes. */
const S = 'stroke="#1f2937" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"'
const S2 = 'stroke="#1f2937" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"'
const svg = (viewBox: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`

const r1 = (n: number) => Math.round(n * 10) / 10

/** Radial spikes (line + tip circle) around a centre. */
function spikes(cx: number, cy: number, n: number, r0: number, r1v: number, rTip: number, tipR: number, tipFill: string, lineW = 2.5): string {
  const parts: string[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const c = Math.cos(a)
    const s = Math.sin(a)
    parts.push(
      `<line x1="${r1(cx + c * r0)}" y1="${r1(cy + s * r0)}" x2="${r1(cx + c * r1v)}" y2="${r1(cy + s * r1v)}" stroke="#1f2937" stroke-width="${lineW}" stroke-linecap="round"/>`,
    )
    parts.push(`<circle cx="${r1(cx + c * rTip)}" cy="${r1(cy + s * rTip)}" r="${tipR}" fill="${tipFill}" ${S2}/>`)
  }
  return parts.join('')
}

/** Regular polygon points string. */
function poly(cx: number, cy: number, r: number, n: number, rot = -90): string {
  const pts: string[] = []
  for (let i = 0; i < n; i++) {
    const a = ((rot + (360 / n) * i) * Math.PI) / 180
    pts.push(`${r1(cx + r * Math.cos(a))},${r1(cy + r * Math.sin(a))}`)
  }
  return pts.join(' ')
}

/** Multi-subpath radial lines (used for sea-urchin spines). */
function radialLines(cx: number, cy: number, n: number, r0: number, r1v: number, offsetDeg = 0): string {
  const d: string[] = []
  for (let i = 0; i < n; i++) {
    const a = ((offsetDeg + (360 / n) * i) * Math.PI) / 180
    d.push(`M${r1(cx + r0 * Math.cos(a))} ${r1(cy + r0 * Math.sin(a))}L${r1(cx + r1v * Math.cos(a))} ${r1(cy + r1v * Math.sin(a))}`)
  }
  return d.join('')
}

// ---- Human figures (viewBox 0 0 60 100) ----
const HEAD = `<circle cx="30" cy="13" r="9" fill="#PRIMARY" ${S}/>`
const SHIRT_D = 'M30 24C20 24 14 28 13 36L8 60L16 61L20 42L20 62L40 62L40 42L44 61L52 60L47 36C46 28 40 24 30 24Z'
const LEGS = `<path d="M20 62L16 95L26 95L30 68L34 95L44 95L40 62Z" fill="#PRIMARY" ${S}/>`
const DRESS_D = 'M30 24C20 24 14 28 13 36L9 54L16 55L19 44L12 76L48 76L41 44L44 55L51 54L47 36C46 28 40 24 30 24Z'

export const items: LibraryItem[] = [
  {
    id: 'species.human',
    name: 'Human',
    category: 'species',
    keywords: ['human', 'person', 'homo sapiens', 'people', 'subject', 'figure'],
    width: 60,
    height: 100,
    primary: '#9ca3af',
    secondary: '#7b93b5',
    svg: svg('0 0 60 100', `${HEAD}<path d="${SHIRT_D}" fill="#SECONDARY" ${S}/>${LEGS}`),
  },
  {
    id: 'species.human-patient',
    name: 'Patient',
    category: 'species',
    keywords: ['patient', 'human', 'clinical', 'hospital', 'donor', 'subject'],
    width: 60,
    height: 100,
    primary: '#9ca3af',
    secondary: '#d9534f',
    svg: svg(
      '0 0 60 100',
      `${HEAD}<path d="${SHIRT_D}" fill="#e5e7eb" ${S}/>${LEGS}<circle cx="30" cy="46" r="8" fill="#ffffff" ${S2}/><path d="M30 41V51M25 46H35" stroke="#SECONDARY" stroke-width="3.5" stroke-linecap="round"/>`,
    ),
  },
  {
    id: 'species.human-male',
    name: 'Human (male)',
    category: 'species',
    keywords: ['male', 'man', 'human', 'xy', 'sex'],
    width: 60,
    height: 100,
    primary: '#9ca3af',
    secondary: '#5b7fb0',
    svg: svg(
      '0 0 60 100',
      `${HEAD}<path d="${SHIRT_D}" fill="#SECONDARY" ${S}/>${LEGS}<circle cx="47" cy="17" r="5.5" fill="none" stroke="#SECONDARY" stroke-width="2.5"/><path d="M51 13L57 7M52 7H57V12" fill="none" stroke="#SECONDARY" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    ),
  },
  {
    id: 'species.human-female',
    name: 'Human (female)',
    category: 'species',
    keywords: ['female', 'woman', 'human', 'xx', 'sex'],
    width: 60,
    height: 100,
    primary: '#9ca3af',
    secondary: '#b56a8e',
    svg: svg(
      '0 0 60 100',
      `${HEAD}<path d="${DRESS_D}" fill="#SECONDARY" ${S}/><path d="M23 76H29V95H23Z" fill="#PRIMARY" ${S}/><path d="M31 76H37V95H31Z" fill="#PRIMARY" ${S}/><circle cx="47" cy="13" r="5.5" fill="none" stroke="#SECONDARY" stroke-width="2.5"/><path d="M47 18.5V28M43 24H51" fill="none" stroke="#SECONDARY" stroke-width="2.5" stroke-linecap="round"/>`,
    ),
  },

  // ---- Rodents ----
  {
    id: 'species.mouse',
    name: 'Mouse',
    category: 'species',
    keywords: ['mouse', 'mus musculus', 'rodent', 'murine', 'in vivo', 'animal model'],
    width: 100,
    height: 64,
    primary: '#9ca3af',
    secondary: '#e7b7b7',
    svg: svg(
      '0 0 100 64',
      `<path d="M22 44C10 46 2 36 8 26C11 20 17 22 16 27" fill="none" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>` +
        `<ellipse cx="38" cy="50" rx="6" ry="3" fill="#PRIMARY" ${S2}/><ellipse cx="74" cy="50" rx="6" ry="3" fill="#PRIMARY" ${S2}/>` +
        `<path d="M22 42C20 26 36 14 56 15C70 16 84 26 92 38C94 42 92 46 86 47L28 49C23 49 22 46 22 42Z" fill="#PRIMARY" ${S}/>` +
        `<circle cx="68" cy="19" r="7" fill="#PRIMARY" ${S}/><circle cx="68" cy="19" r="3.5" fill="#SECONDARY"/>` +
        `<circle cx="82" cy="31" r="2.2" fill="#1f2937"/><circle cx="92" cy="39" r="2" fill="#1f2937"/>` +
        `<path d="M89 41L98 37M89 42L98 46" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>`,
    ),
  },
  {
    id: 'species.rat',
    name: 'Rat',
    category: 'species',
    keywords: ['rat', 'rattus', 'rodent', 'in vivo', 'animal model'],
    width: 100,
    height: 64,
    primary: '#a8876a',
    secondary: '#e7b7b7',
    svg: svg(
      '0 0 100 64',
      `<path d="M18 44C8 48 0 40 4 30C6 25 12 25 12 30" fill="none" stroke="#1f2937" stroke-width="3.5" stroke-linecap="round"/>` +
        `<ellipse cx="36" cy="50" rx="6" ry="3" fill="#PRIMARY" ${S2}/><ellipse cx="72" cy="50" rx="6" ry="3" fill="#PRIMARY" ${S2}/>` +
        `<path d="M18 42C16 28 32 16 54 16C68 16 82 24 96 40C97 43 95 46 90 46L26 49C21 49 18 46 18 42Z" fill="#PRIMARY" ${S}/>` +
        `<circle cx="64" cy="19" r="5" fill="#PRIMARY" ${S}/><circle cx="64" cy="19" r="2.5" fill="#SECONDARY"/>` +
        `<circle cx="80" cy="30" r="2.2" fill="#1f2937"/><circle cx="96" cy="40" r="1.8" fill="#1f2937"/>` +
        `<path d="M92 42L99 39M92 43L99 46" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>`,
    ),
  },

  // ---- Classic model organisms ----
  {
    id: 'species.zebrafish',
    name: 'Zebrafish',
    category: 'species',
    keywords: ['zebrafish', 'danio rerio', 'fish', 'teleost', 'animal model'],
    width: 100,
    height: 50,
    primary: '#8fb3c9',
    secondary: '#3b5b8c',
    svg: svg(
      '0 0 100 50',
      `<path d="M48 12L58 4L66 14Z" fill="#PRIMARY" ${S2}/><path d="M58 37L64 46L70 36Z" fill="#PRIMARY" ${S2}/>` +
        `<path d="M6 25C18 9 52 7 78 20L94 10L91 25L94 40L78 30C52 43 18 41 6 25Z" fill="#PRIMARY" ${S}/>` +
        `<path d="M18 19C40 13 60 14 78 21" fill="none" stroke="#SECONDARY" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M14 25C40 21 60 21 79 25" fill="none" stroke="#SECONDARY" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M18 31C40 36 60 35 78 29" fill="none" stroke="#SECONDARY" stroke-width="3" stroke-linecap="round"/>` +
        `<ellipse cx="30" cy="30" rx="7" ry="3" transform="rotate(25 30 30)" fill="#PRIMARY" ${S2}/>` +
        `<circle cx="16" cy="22" r="3" fill="#ffffff" ${S2}/><circle cx="16.5" cy="22" r="1.5" fill="#1f2937"/>`,
    ),
  },
  {
    id: 'species.drosophila',
    name: 'Drosophila',
    category: 'species',
    keywords: ['drosophila', 'fruit fly', 'fly', 'melanogaster', 'insect', 'animal model'],
    width: 100,
    height: 100,
    primary: '#b08a5a',
    secondary: '#c0392b',
    svg: svg(
      '0 0 100 100',
      `<path d="M42 40L22 30M42 46L20 52M44 52L28 72M58 40L78 30M58 46L80 52M56 52L72 72" fill="none" stroke="#1f2937" stroke-width="2.5" stroke-linecap="round"/>` +
        `<ellipse cx="36" cy="60" rx="11" ry="27" transform="rotate(22 36 60)" fill="#e5e7eb" fill-opacity="0.85" ${S2}/>` +
        `<ellipse cx="64" cy="60" rx="11" ry="27" transform="rotate(-22 64 60)" fill="#e5e7eb" fill-opacity="0.85" ${S2}/>` +
        `<ellipse cx="50" cy="66" rx="12" ry="18" fill="#PRIMARY" ${S}/>` +
        `<path d="M39 62H61M40 70H60M43 78H57" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>` +
        `<ellipse cx="50" cy="42" rx="11" ry="12" fill="#PRIMARY" ${S}/>` +
        `<path d="M47 16L44 10M53 16L56 10" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>` +
        `<circle cx="50" cy="24" r="9" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="43" cy="23" rx="4" ry="5" fill="#SECONDARY" ${S2}/><ellipse cx="57" cy="23" rx="4" ry="5" fill="#SECONDARY" ${S2}/>`,
    ),
  },
  {
    id: 'species.c-elegans',
    name: 'C. elegans',
    category: 'species',
    keywords: ['c. elegans', 'caenorhabditis', 'worm', 'nematode', 'animal model'],
    width: 100,
    height: 60,
    primary: '#d9c9a8',
    secondary: '#a88a6a',
    svg: svg(
      '0 0 100 60',
      `<path d="M10 30C20 6 36 6 48 30S76 54 90 30" fill="none" stroke="#1f2937" stroke-width="15" stroke-linecap="round"/>` +
        `<path d="M10 30C20 6 36 6 48 30S76 54 90 30" fill="none" stroke="#PRIMARY" stroke-width="10" stroke-linecap="round"/>` +
        `<path d="M14 30C22 11 36 11 48 30S74 49 86 30" fill="none" stroke="#SECONDARY" stroke-width="3" stroke-linecap="round"/>` +
        `<circle cx="38" cy="18" r="2.5" fill="#ffffff" fill-opacity="0.7"/><circle cx="46" cy="25" r="2.5" fill="#ffffff" fill-opacity="0.7"/>`,
    ),
  },
  {
    id: 'species.xenopus',
    name: 'Xenopus',
    category: 'species',
    keywords: ['xenopus', 'frog', 'laevis', 'tropicalis', 'amphibian', 'animal model'],
    width: 100,
    height: 100,
    primary: '#7f9c6a',
    secondary: '#4f6b43',
    svg: svg(
      '0 0 100 100',
      `<path d="M34 60L12 68L6 86L14 88L20 74L38 70Z" fill="#PRIMARY" ${S}/><path d="M66 60L88 68L94 86L86 88L80 74L62 70Z" fill="#PRIMARY" ${S}/>` +
        `<path d="M30 44L14 38L10 48L16 50L20 46L32 52Z" fill="#PRIMARY" ${S}/><path d="M70 44L86 38L90 48L84 50L80 46L68 52Z" fill="#PRIMARY" ${S}/>` +
        `<path d="M50 18C34 18 26 32 27 52C28 72 38 86 50 86C62 86 72 72 73 52C74 32 66 18 50 18Z" fill="#PRIMARY" ${S}/>` +
        `<circle cx="39" cy="24" r="6" fill="#PRIMARY" ${S}/><circle cx="61" cy="24" r="6" fill="#PRIMARY" ${S}/>` +
        `<circle cx="39" cy="24" r="2.5" fill="#1f2937"/><circle cx="61" cy="24" r="2.5" fill="#1f2937"/>` +
        `<circle cx="44" cy="48" r="4" fill="#SECONDARY"/><circle cx="58" cy="56" r="3.5" fill="#SECONDARY"/><circle cx="48" cy="68" r="3" fill="#SECONDARY"/><circle cx="60" cy="40" r="3" fill="#SECONDARY"/>`,
    ),
  },
  {
    id: 'species.chicken',
    name: 'Chicken',
    category: 'species',
    keywords: ['chicken', 'hen', 'gallus', 'bird', 'avian', 'poultry'],
    width: 100,
    height: 100,
    primary: '#a8876a',
    secondary: '#c0392b',
    svg: svg(
      '0 0 100 100',
      `<path d="M26 44L8 26L14 42L4 40L20 52Z" fill="#PRIMARY" ${S}/>` +
        `<path d="M60 20C60 10 66 8 69 14C71 7 80 8 80 18Z" fill="#SECONDARY" ${S2}/>` +
        `<path d="M38 76L36 92M52 76L54 92M30 92H42M48 92H60" fill="none" stroke="#1f2937" stroke-width="2.5" stroke-linecap="round"/>` +
        `<path d="M80 28L92 32L80 36Z" fill="#e8b04a" ${S2}/>` +
        `<path d="M22 58C22 44 34 36 50 38L58 22C62 14 78 14 80 26C80 32 76 37 72 38C80 48 76 66 62 74C46 82 24 74 22 58Z" fill="#PRIMARY" ${S}/>` +
        `<circle cx="76" cy="42" r="3.5" fill="#SECONDARY" ${S2}/>` +
        `<ellipse cx="44" cy="58" rx="14" ry="9" transform="rotate(-15 44 58)" fill="#ffffff" fill-opacity="0.3" ${S2}/>` +
        `<circle cx="72" cy="26" r="2.2" fill="#1f2937"/>`,
    ),
  },
  {
    id: 'species.chick-embryo-egg',
    name: 'Chick embryo (egg)',
    category: 'species',
    keywords: ['chick embryo', 'egg', 'chicken embryo', 'yolk', 'in ovo', 'cam assay', 'developmental'],
    width: 80,
    height: 100,
    primary: '#efe3cc',
    secondary: '#f2c84b',
    svg: svg(
      '0 0 80 100',
      `<path d="M40 6C22 6 8 30 8 56C8 80 22 94 40 94C58 94 72 80 72 56C72 30 58 6 40 6Z" fill="#PRIMARY" ${S}/>` +
        `<circle cx="40" cy="56" r="24" fill="#SECONDARY" ${S2}/>` +
        `<path d="M40 56L22 44M40 56L58 40M40 56L24 70M40 56L58 70" fill="none" stroke="#c0566b" stroke-width="2" stroke-linecap="round"/>` +
        `<path d="M44 54C34 54 30 66 38 72C46 76 52 68 48 62Z" fill="#ffffff" ${S2}/>` +
        `<circle cx="46" cy="48" r="7" fill="#ffffff" ${S2}/><circle cx="48" cy="47" r="1.8" fill="#1f2937"/>` +
        `<ellipse cx="22" cy="28" rx="4" ry="9" transform="rotate(15 22 28)" fill="#ffffff" fill-opacity="0.6"/>`,
    ),
  },

  // ---- Large animals ----
  {
    id: 'species.pig',
    name: 'Pig',
    category: 'species',
    keywords: ['pig', 'porcine', 'swine', 'sus scrofa', 'large animal', 'minipig'],
    width: 100,
    height: 80,
    primary: '#e8b4b8',
    secondary: '#d48a90',
    svg: svg(
      '0 0 100 80',
      `<path d="M12 38C4 34 4 46 10 44" fill="none" stroke="#1f2937" stroke-width="2.5" stroke-linecap="round"/>` +
        `<rect x="22" y="54" width="9" height="20" rx="2" fill="#PRIMARY" ${S2}/><rect x="34" y="54" width="9" height="20" rx="2" fill="#PRIMARY" ${S2}/>` +
        `<rect x="52" y="54" width="9" height="20" rx="2" fill="#PRIMARY" ${S2}/><rect x="64" y="54" width="9" height="20" rx="2" fill="#PRIMARY" ${S2}/>` +
        `<ellipse cx="42" cy="42" rx="30" ry="19" fill="#PRIMARY" ${S}/>` +
        `<path d="M66 28L62 12L80 22Z" fill="#PRIMARY" ${S}/>` +
        `<circle cx="74" cy="40" r="15" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="87" cy="44" rx="6" ry="5" fill="#SECONDARY" ${S2}/>` +
        `<circle cx="85" cy="44" r="1.2" fill="#1f2937"/><circle cx="89" cy="44" r="1.2" fill="#1f2937"/>` +
        `<circle cx="78" cy="34" r="2" fill="#1f2937"/>`,
    ),
  },
  {
    id: 'species.cow',
    name: 'Cow',
    category: 'species',
    keywords: ['cow', 'bovine', 'cattle', 'bos taurus', 'large animal', 'livestock'],
    width: 100,
    height: 80,
    primary: '#d1d5db',
    secondary: '#4b5563',
    svg: svg(
      '0 0 100 80',
      `<path d="M16 36C8 40 8 52 12 58" fill="none" stroke="#1f2937" stroke-width="2.5" stroke-linecap="round"/>` +
        `<rect x="24" y="52" width="8" height="22" rx="2" fill="#PRIMARY" ${S2}/><rect x="36" y="52" width="8" height="22" rx="2" fill="#PRIMARY" ${S2}/>` +
        `<rect x="54" y="52" width="8" height="22" rx="2" fill="#PRIMARY" ${S2}/><rect x="66" y="52" width="8" height="22" rx="2" fill="#PRIMARY" ${S2}/>` +
        `<ellipse cx="46" cy="40" rx="30" ry="18" fill="#PRIMARY" ${S}/>` +
        `<path d="M30 28C38 22 50 26 48 36C44 44 28 40 30 28Z" fill="#SECONDARY"/><path d="M56 48C64 42 72 46 68 54C64 58 54 54 56 48Z" fill="#SECONDARY"/>` +
        `<path d="M70 30C64 26 66 20 70 22M88 30C94 26 92 20 88 22" fill="none" stroke="#1f2937" stroke-width="2.5" stroke-linecap="round"/>` +
        `<path d="M70 32L60 28L68 38Z" fill="#PRIMARY" ${S2}/><path d="M88 32L98 28L90 38Z" fill="#PRIMARY" ${S2}/>` +
        `<path d="M74 30C70 30 66 36 68 44L72 56C74 60 84 60 86 56L90 44C92 36 88 30 84 30Z" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="79" cy="54" rx="8" ry="5" fill="#e5e7eb" ${S2}/>` +
        `<circle cx="76" cy="54" r="1.2" fill="#1f2937"/><circle cx="82" cy="54" r="1.2" fill="#1f2937"/>` +
        `<circle cx="74" cy="40" r="1.8" fill="#1f2937"/><circle cx="84" cy="40" r="1.8" fill="#1f2937"/>`,
    ),
  },
  {
    id: 'species.sheep',
    name: 'Sheep',
    category: 'species',
    keywords: ['sheep', 'ovine', 'ovis aries', 'lamb', 'large animal', 'livestock'],
    width: 100,
    height: 80,
    primary: '#ece8df',
    secondary: '#4b5563',
    svg: svg(
      '0 0 100 80',
      `<rect x="30" y="54" width="6" height="22" rx="2" fill="#SECONDARY" ${S2}/><rect x="42" y="54" width="6" height="22" rx="2" fill="#SECONDARY" ${S2}/>` +
        `<rect x="58" y="54" width="6" height="22" rx="2" fill="#SECONDARY" ${S2}/><rect x="68" y="54" width="6" height="22" rx="2" fill="#SECONDARY" ${S2}/>` +
        `<circle cx="26" cy="38" r="11" fill="#PRIMARY" ${S}/><circle cx="40" cy="28" r="11" fill="#PRIMARY" ${S}/><circle cx="56" cy="26" r="11" fill="#PRIMARY" ${S}/>` +
        `<circle cx="70" cy="32" r="11" fill="#PRIMARY" ${S}/><circle cx="74" cy="46" r="11" fill="#PRIMARY" ${S}/><circle cx="62" cy="54" r="11" fill="#PRIMARY" ${S}/>` +
        `<circle cx="46" cy="56" r="11" fill="#PRIMARY" ${S}/><circle cx="32" cy="52" r="11" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="50" cy="42" rx="26" ry="16" fill="#PRIMARY"/>` +
        `<ellipse cx="76" cy="36" rx="5" ry="2.5" transform="rotate(-30 76 36)" fill="#SECONDARY" ${S2}/><ellipse cx="94" cy="36" rx="5" ry="2.5" transform="rotate(30 94 36)" fill="#SECONDARY" ${S2}/>` +
        `<ellipse cx="85" cy="42" rx="9" ry="12" fill="#SECONDARY" ${S}/>` +
        `<circle cx="85" cy="30" r="6" fill="#PRIMARY" ${S2}/>` +
        `<circle cx="82" cy="40" r="1.6" fill="#ffffff"/><circle cx="88" cy="40" r="1.6" fill="#ffffff"/>`,
    ),
  },

  // ---- Companion animals ----
  {
    id: 'species.dog',
    name: 'Dog',
    category: 'species',
    keywords: ['dog', 'canine', 'canis', 'beagle', 'companion animal', 'veterinary'],
    width: 100,
    height: 80,
    primary: '#a8876a',
    secondary: '#6b4e3a',
    svg: svg(
      '0 0 100 80',
      `<path d="M18 44L6 24L13 20L24 40Z" fill="#PRIMARY" ${S}/>` +
        `<rect x="22" y="52" width="9" height="22" rx="2" fill="#PRIMARY" ${S2}/><rect x="34" y="52" width="9" height="22" rx="2" fill="#PRIMARY" ${S2}/>` +
        `<rect x="54" y="52" width="9" height="22" rx="2" fill="#PRIMARY" ${S2}/><rect x="66" y="52" width="9" height="22" rx="2" fill="#PRIMARY" ${S2}/>` +
        `<rect x="16" y="28" width="60" height="30" rx="14" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="86" cy="32" rx="9" ry="6" fill="#PRIMARY" ${S}/>` +
        `<circle cx="74" cy="24" r="13" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="65" cy="28" rx="5" ry="10" transform="rotate(10 65 28)" fill="#SECONDARY" ${S2}/>` +
        `<circle cx="93" cy="31" r="2.5" fill="#1f2937"/><circle cx="78" cy="21" r="2" fill="#1f2937"/>`,
    ),
  },
  {
    id: 'species.cat',
    name: 'Cat',
    category: 'species',
    keywords: ['cat', 'feline', 'felis catus', 'companion animal', 'veterinary'],
    width: 100,
    height: 80,
    primary: '#9ca3af',
    secondary: '#e7b7b7',
    svg: svg(
      '0 0 100 80',
      `<path d="M18 48C4 44 2 28 12 20" fill="none" stroke="#1f2937" stroke-width="8" stroke-linecap="round"/>` +
        `<path d="M18 48C4 44 2 28 12 20" fill="none" stroke="#PRIMARY" stroke-width="4" stroke-linecap="round"/>` +
        `<rect x="24" y="52" width="8" height="22" rx="2" fill="#PRIMARY" ${S2}/><rect x="36" y="52" width="8" height="22" rx="2" fill="#PRIMARY" ${S2}/>` +
        `<rect x="56" y="52" width="8" height="22" rx="2" fill="#PRIMARY" ${S2}/><rect x="66" y="52" width="8" height="22" rx="2" fill="#PRIMARY" ${S2}/>` +
        `<rect x="16" y="30" width="60" height="28" rx="13" fill="#PRIMARY" ${S}/>` +
        `<path d="M66 20L64 4L76 12Z" fill="#PRIMARY" ${S}/><path d="M86 20L90 4L78 12Z" fill="#PRIMARY" ${S}/>` +
        `<path d="M67 16L66 9L72 13Z" fill="#SECONDARY"/><path d="M85 16L87 9L81 13Z" fill="#SECONDARY"/>` +
        `<circle cx="76" cy="26" r="13" fill="#PRIMARY" ${S}/>` +
        `<circle cx="71" cy="24" r="2" fill="#1f2937"/><circle cx="81" cy="24" r="2" fill="#1f2937"/>` +
        `<path d="M74 30L78 30L76 33Z" fill="#SECONDARY" ${S2}/>` +
        `<path d="M58 30L68 29M94 30L84 29M58 36L68 33M94 36L84 33" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>`,
    ),
  },
  {
    id: 'species.rabbit',
    name: 'Rabbit',
    category: 'species',
    keywords: ['rabbit', 'bunny', 'lagomorph', 'oryctolagus', 'antibody production', 'animal model'],
    width: 80,
    height: 100,
    primary: '#b8b0a4',
    secondary: '#e7b7b7',
    svg: svg(
      '0 0 80 100',
      `<ellipse cx="28" cy="24" rx="6" ry="18" transform="rotate(-10 28 24)" fill="#PRIMARY" ${S}/><ellipse cx="42" cy="22" rx="6" ry="18" transform="rotate(8 42 22)" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="28" cy="24" rx="3" ry="12" transform="rotate(-10 28 24)" fill="#SECONDARY"/><ellipse cx="42" cy="22" rx="3" ry="12" transform="rotate(8 42 22)" fill="#SECONDARY"/>` +
        `<circle cx="12" cy="70" r="7" fill="#ffffff" ${S2}/>` +
        `<ellipse cx="36" cy="68" rx="26" ry="22" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="30" cy="88" rx="13" ry="5" fill="#PRIMARY" ${S2}/><ellipse cx="54" cy="86" rx="8" ry="4" fill="#PRIMARY" ${S2}/>` +
        `<circle cx="48" cy="44" r="14" fill="#PRIMARY" ${S}/>` +
        `<circle cx="54" cy="42" r="2.2" fill="#1f2937"/><circle cx="61" cy="47" r="1.8" fill="#1f2937"/>` +
        `<path d="M63 46L72 42M63 48L72 51" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>`,
    ),
  },

  // ---- Non-human primates ----
  {
    id: 'species.macaque',
    name: 'Macaque',
    category: 'species',
    keywords: ['macaque', 'monkey', 'rhesus', 'cynomolgus', 'nhp', 'non-human primate', 'primate'],
    width: 100,
    height: 100,
    primary: '#a8876a',
    secondary: '#e2bfa6',
    svg: svg(
      '0 0 100 100',
      `<path d="M26 82C10 86 4 70 10 62" fill="none" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>` +
        `<ellipse cx="26" cy="74" rx="6" ry="16" transform="rotate(20 26 74)" fill="#PRIMARY" ${S}/><ellipse cx="74" cy="74" rx="6" ry="16" transform="rotate(-20 74 74)" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="50" cy="70" rx="26" ry="24" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="50" cy="74" rx="14" ry="14" fill="#SECONDARY"/>` +
        `<circle cx="30" cy="34" r="6" fill="#PRIMARY" ${S}/><circle cx="70" cy="34" r="6" fill="#PRIMARY" ${S}/>` +
        `<circle cx="50" cy="32" r="20" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="50" cy="36" rx="13" ry="13" fill="#SECONDARY" ${S2}/>` +
        `<circle cx="44" cy="33" r="2.2" fill="#1f2937"/><circle cx="56" cy="33" r="2.2" fill="#1f2937"/>` +
        `<circle cx="48" cy="42" r="1.2" fill="#1f2937"/><circle cx="52" cy="42" r="1.2" fill="#1f2937"/>` +
        `<path d="M45 47C48 50 52 50 55 47" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>`,
    ),
  },
  {
    id: 'species.marmoset',
    name: 'Marmoset',
    category: 'species',
    keywords: ['marmoset', 'callithrix', 'monkey', 'nhp', 'non-human primate', 'primate'],
    width: 100,
    height: 100,
    primary: '#9c8c7a',
    secondary: '#5b4a3c',
    svg: svg(
      '0 0 100 100',
      `<path d="M28 80C14 88 2 76 6 60" fill="none" stroke="#1f2937" stroke-width="3.5" stroke-linecap="round"/>` +
        `<ellipse cx="30" cy="74" rx="5" ry="14" transform="rotate(20 30 74)" fill="#PRIMARY" ${S}/><ellipse cx="70" cy="74" rx="5" ry="14" transform="rotate(-20 70 74)" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="50" cy="72" rx="22" ry="22" fill="#PRIMARY" ${S}/>` +
        `<circle cx="30" cy="34" r="10" fill="#ffffff" ${S}/><circle cx="70" cy="34" r="10" fill="#ffffff" ${S}/>` +
        `<circle cx="50" cy="34" r="17" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="50" cy="38" rx="11" ry="11" fill="#SECONDARY" ${S2}/>` +
        `<circle cx="45" cy="36" r="3" fill="#ffffff"/><circle cx="55" cy="36" r="3" fill="#ffffff"/>` +
        `<circle cx="45" cy="36" r="1.5" fill="#1f2937"/><circle cx="55" cy="36" r="1.5" fill="#1f2937"/>` +
        `<path d="M46 45C48 47 52 47 54 45" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>` +
        `<circle cx="50" cy="25" r="3.5" fill="#ffffff" fill-opacity="0.85"/>`,
    ),
  },

  // ---- Other animal models ----
  {
    id: 'species.axolotl',
    name: 'Axolotl',
    category: 'species',
    keywords: ['axolotl', 'ambystoma', 'salamander', 'regeneration', 'amphibian', 'animal model'],
    width: 100,
    height: 70,
    primary: '#f0b0bb',
    secondary: '#c0566b',
    svg: svg(
      '0 0 100 70',
      `<path d="M70 26L60 12M75 27L74 8M80 29L88 12" fill="none" stroke="#1f2937" stroke-width="7" stroke-linecap="round"/>` +
        `<path d="M70 26L60 12M75 27L74 8M80 29L88 12" fill="none" stroke="#SECONDARY" stroke-width="3.5" stroke-linecap="round"/>` +
        `<ellipse cx="36" cy="54" rx="6" ry="4" fill="#PRIMARY" ${S2}/><ellipse cx="68" cy="54" rx="6" ry="4" fill="#PRIMARY" ${S2}/>` +
        `<path d="M4 40C14 28 28 28 44 30L68 30C78 30 86 33 90 39C92 45 86 52 76 52L44 52C28 52 14 52 4 40Z" fill="#PRIMARY" ${S}/>` +
        `<path d="M8 40C14 32 24 30 40 30" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round" stroke-opacity="0.4"/>` +
        `<circle cx="80" cy="38" r="2.2" fill="#1f2937"/>` +
        `<path d="M82 46C85 48 89 47 91 43" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>`,
    ),
  },

  // ---- Plants ----
  {
    id: 'species.arabidopsis',
    name: 'Arabidopsis',
    category: 'species',
    keywords: ['arabidopsis', 'thaliana', 'plant', 'rosette', 'plant model'],
    width: 80,
    height: 100,
    primary: '#5a9a5a',
    secondary: '#e2c25a',
    svg: svg(
      '0 0 80 100',
      `<path d="M40 82V14M40 44C34 40 30 32 28 24M40 54C46 50 50 42 52 32" fill="none" stroke="#1f2937" stroke-width="5.5" stroke-linecap="round"/>` +
        `<path d="M40 82V14M40 44C34 40 30 32 28 24M40 54C46 50 50 42 52 32" fill="none" stroke="#PRIMARY" stroke-width="2.5" stroke-linecap="round"/>` +
        `<ellipse cx="22" cy="84" rx="15" ry="6" transform="rotate(-15 22 84)" fill="#PRIMARY" ${S}/><ellipse cx="58" cy="84" rx="15" ry="6" transform="rotate(15 58 84)" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="28" cy="76" rx="12" ry="5" transform="rotate(-45 28 76)" fill="#PRIMARY" ${S}/><ellipse cx="52" cy="76" rx="12" ry="5" transform="rotate(45 52 76)" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="24" cy="92" rx="12" ry="5" transform="rotate(10 24 92)" fill="#PRIMARY" ${S}/><ellipse cx="56" cy="92" rx="12" ry="5" transform="rotate(-10 56 92)" fill="#PRIMARY" ${S}/>` +
        `<circle cx="40" cy="12" r="5" fill="#ffffff" ${S2}/><circle cx="28" cy="22" r="5" fill="#ffffff" ${S2}/><circle cx="52" cy="30" r="5" fill="#ffffff" ${S2}/><circle cx="40" cy="30" r="4" fill="#ffffff" ${S2}/>` +
        `<circle cx="40" cy="12" r="1.8" fill="#SECONDARY"/><circle cx="28" cy="22" r="1.8" fill="#SECONDARY"/><circle cx="52" cy="30" r="1.8" fill="#SECONDARY"/><circle cx="40" cy="30" r="1.5" fill="#SECONDARY"/>`,
    ),
  },
  {
    id: 'species.maize-plant',
    name: 'Maize',
    category: 'species',
    keywords: ['maize', 'corn', 'zea mays', 'plant', 'crop', 'plant model'],
    width: 80,
    height: 100,
    primary: '#5a9a5a',
    secondary: '#e2c25a',
    svg: svg(
      '0 0 80 100',
      `<path d="M40 96V16M40 16L28 4M40 16L40 2M40 16L52 4M40 16L20 10M40 16L60 10" fill="none" stroke="#1f2937" stroke-width="6" stroke-linecap="round"/>` +
        `<path d="M40 96V16M40 16L28 4M40 16L40 2M40 16L52 4M40 16L20 10M40 16L60 10" fill="none" stroke="#SECONDARY" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M40 96V20" fill="none" stroke="#PRIMARY" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M40 72C28 70 14 74 6 88C22 86 34 80 40 72Z" fill="#PRIMARY" ${S}/>` +
        `<path d="M40 84C50 82 64 86 74 96C60 94 48 90 40 84Z" fill="#PRIMARY" ${S}/>` +
        `<path d="M40 38C30 36 18 38 8 50C22 48 34 44 40 38Z" fill="#PRIMARY" ${S}/>` +
        `<path d="M40 50C52 48 66 52 74 64C60 62 46 58 40 50Z" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="50" cy="66" rx="5" ry="11" transform="rotate(-15 50 66)" fill="#SECONDARY" ${S2}/>` +
        `<path d="M47 76C44 70 44 60 48 55" fill="none" stroke="#PRIMARY" stroke-width="3" stroke-linecap="round"/>`,
    ),
  },

  // ---- Microbes ----
  {
    id: 'species.yeast-cell',
    name: 'Yeast (budding)',
    category: 'species',
    keywords: ['yeast', 'saccharomyces', 'cerevisiae', 'budding yeast', 'fungus', 'microbe'],
    width: 100,
    height: 100,
    primary: '#d6c08a',
    secondary: '#efe3bf',
    svg: svg(
      '0 0 100 100',
      `<ellipse cx="44" cy="58" rx="30" ry="34" fill="#PRIMARY" ${S}/>` +
        `<circle cx="79" cy="25" r="14" fill="#PRIMARY" ${S}/>` +
        `<circle cx="38" cy="62" r="11" fill="#SECONDARY" ${S2}/>` +
        `<circle cx="56" cy="44" r="6" fill="#6b7280" ${S2}/>` +
        `<circle cx="22" cy="38" r="3" fill="none" ${S2}/><circle cx="30" cy="30" r="2.5" fill="none" ${S2}/>` +
        `<circle cx="82" cy="20" r="3.5" fill="#6b7280"/>`,
    ),
  },
  {
    id: 'species.e-coli',
    name: 'E. coli',
    category: 'species',
    keywords: ['e. coli', 'escherichia', 'bacterium', 'bacteria', 'rod', 'bacillus', 'prokaryote', 'microbe'],
    width: 100,
    height: 60,
    primary: '#5fa8a0',
    secondary: '#2f6f6a',
    svg: svg(
      '0 0 100 60',
      `<path d="M14 24C6 18 10 10 2 6M12 30C4 30 6 22 2 16M14 36C6 42 10 50 4 56" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>` +
        `<path d="M36 18L34 12M52 18L54 12M70 18L74 13M40 42L38 48M58 42L60 48M76 42L80 47" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>` +
        `<rect x="12" y="18" width="76" height="24" rx="12" fill="#PRIMARY" ${S}/>` +
        `<path d="M30 30C36 24 48 24 54 30C60 36 70 36 76 30" fill="none" stroke="#SECONDARY" stroke-width="4" stroke-linecap="round"/>`,
    ),
  },
  {
    id: 'species.bacteriophage',
    name: 'Bacteriophage',
    category: 'species',
    keywords: ['bacteriophage', 'phage', 'virus', 't4', 'lambda', 'microbe'],
    width: 80,
    height: 100,
    primary: '#9b7bb8',
    secondary: '#7a5c99',
    svg: svg(
      '0 0 80 100',
      `<path d="M34 72L20 80L12 94M46 72L60 80L68 94M32 72L16 68L6 76M48 72L64 68L74 76" fill="none" stroke="#1f2937" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<polygon points="${poly(40, 28, 24, 6)}" fill="#PRIMARY" ${S}/>` +
        `<path d="M40 4V52M19.2 16L60.8 40M60.8 16L19.2 40" fill="none" stroke="#1f2937" stroke-width="1.5" stroke-opacity="0.35"/>` +
        `<rect x="32" y="52" width="16" height="6" rx="1" fill="#6b7280" ${S2}/>` +
        `<rect x="35" y="58" width="10" height="14" fill="#SECONDARY" ${S2}/>` +
        `<rect x="29" y="70" width="22" height="5" rx="1" fill="#6b7280" ${S2}/>`,
    ),
  },
  {
    id: 'species.virus',
    name: 'Virus',
    category: 'species',
    keywords: ['virus', 'virion', 'icosahedral', 'capsid', 'viral', 'microbe'],
    width: 100,
    height: 100,
    primary: '#9b7bb8',
    secondary: '#5e4a7a',
    svg: svg(
      '0 0 100 100',
      spikes(50, 50, 12, 32, 40, 43, 3.5, '#SECONDARY') +
        `<polygon points="${poly(50, 50, 33, 6, 0)}" fill="#PRIMARY" ${S}/>` +
        `<polygon points="${poly(50, 50, 16, 6, 0)}" fill="#PRIMARY" ${S2}/>` +
        `<path d="${radialLines(50, 50, 6, 16, 33, 0)}" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>`,
    ),
  },
  {
    id: 'species.coronavirus',
    name: 'Coronavirus',
    category: 'species',
    keywords: ['coronavirus', 'sars-cov-2', 'covid', 'covid-19', 'virus', 'spike', 'microbe'],
    width: 100,
    height: 100,
    primary: '#a98bc0',
    secondary: '#c0566b',
    svg: svg(
      '0 0 100 100',
      spikes(50, 50, 12, 28, 38, 41, 4.5, '#SECONDARY', 3) +
        `<circle cx="50" cy="50" r="30" fill="#PRIMARY" ${S}/>` +
        `<circle cx="40" cy="42" r="3" fill="#ffffff" fill-opacity="0.5"/><circle cx="57" cy="38" r="3" fill="#ffffff" fill-opacity="0.5"/>` +
        `<circle cx="47" cy="60" r="3" fill="#ffffff" fill-opacity="0.5"/><circle cx="62" cy="56" r="3" fill="#ffffff" fill-opacity="0.5"/>`,
    ),
  },
  {
    id: 'species.plasmodium',
    name: 'Plasmodium (in RBC)',
    category: 'species',
    keywords: ['plasmodium', 'malaria', 'parasite', 'falciparum', 'ring form', 'red blood cell', 'protozoa'],
    width: 100,
    height: 100,
    primary: '#d08c8c',
    secondary: '#6b5ca5',
    svg: svg(
      '0 0 100 100',
      `<circle cx="50" cy="50" r="40" fill="#PRIMARY" ${S}/>` +
        `<circle cx="50" cy="50" r="18" fill="#ffffff" fill-opacity="0.35"/>` +
        `<circle cx="58" cy="40" r="10" fill="none" stroke="#SECONDARY" stroke-width="4"/>` +
        `<circle cx="66" cy="33" r="4.5" fill="#SECONDARY" ${S2}/>` +
        `<circle cx="36" cy="62" r="7" fill="none" stroke="#SECONDARY" stroke-width="3.5"/>` +
        `<circle cx="31" cy="56" r="3.5" fill="#SECONDARY" ${S2}/>`,
    ),
  },

  // ---- Invertebrates & non-standard models ----
  {
    id: 'species.tardigrade',
    name: 'Tardigrade',
    category: 'species',
    keywords: ['tardigrade', 'water bear', 'hypsibius', 'invertebrate', 'extremophile'],
    width: 100,
    height: 70,
    primary: '#b7a99a',
    secondary: '#8c7f70',
    svg: svg(
      '0 0 100 70',
      `<ellipse cx="24" cy="54" rx="5" ry="8" fill="#PRIMARY" ${S2}/><ellipse cx="42" cy="56" rx="5" ry="8" fill="#PRIMARY" ${S2}/>` +
        `<ellipse cx="60" cy="56" rx="5" ry="8" fill="#PRIMARY" ${S2}/><ellipse cx="78" cy="52" rx="5" ry="8" fill="#PRIMARY" ${S2}/>` +
        `<path d="M22 61L20 66M26 61L28 66M40 63L38 68M44 63L46 68M58 63L56 68M62 63L64 68M76 59L74 64M80 59L82 64" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>` +
        `<path d="M10 36C10 22 24 16 42 16L74 16C86 16 94 22 94 32C94 44 86 50 76 50L30 50C16 50 10 46 10 36Z" fill="#PRIMARY" ${S}/>` +
        `<path d="M30 18V48M48 16V50M66 16V50" stroke="#1f2937" stroke-width="2" stroke-opacity="0.4"/>` +
        `<circle cx="93" cy="34" r="3" fill="#SECONDARY" ${S2}/>` +
        `<circle cx="84" cy="28" r="2" fill="#1f2937"/>`,
    ),
  },
  {
    id: 'species.hydra',
    name: 'Hydra',
    category: 'species',
    keywords: ['hydra', 'cnidarian', 'polyp', 'regeneration', 'invertebrate', 'tentacles'],
    width: 80,
    height: 100,
    primary: '#7fb8a4',
    secondary: '#4f8a78',
    svg: svg(
      '0 0 80 100',
      `<path d="M40 30C30 22 24 14 8 10M40 30C34 18 28 10 20 2M40 30C40 18 44 10 46 2M40 30C48 18 56 12 64 4M40 30C52 24 62 18 76 16M40 30C50 30 60 34 72 40" fill="none" stroke="#1f2937" stroke-width="6.5" stroke-linecap="round"/>` +
        `<path d="M40 30C30 22 24 14 8 10M40 30C34 18 28 10 20 2M40 30C40 18 44 10 46 2M40 30C48 18 56 12 64 4M40 30C52 24 62 18 76 16M40 30C50 30 60 34 72 40" fill="none" stroke="#PRIMARY" stroke-width="3.5" stroke-linecap="round"/>` +
        `<path d="M22 54L16 46M26 52L26 44" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/>` +
        `<ellipse cx="26" cy="62" rx="5" ry="9" transform="rotate(30 26 62)" fill="#PRIMARY" ${S2}/>` +
        `<ellipse cx="40" cy="90" rx="12" ry="4" fill="#PRIMARY" ${S2}/>` +
        `<path d="M34 30L30 86C30 92 50 92 50 86L46 30Z" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="40" cy="30" rx="6" ry="3" fill="#SECONDARY" ${S2}/>`,
    ),
  },
  {
    id: 'species.planarian',
    name: 'Planarian',
    category: 'species',
    keywords: ['planarian', 'schmidtea', 'flatworm', 'regeneration', 'invertebrate'],
    width: 60,
    height: 100,
    primary: '#a8876a',
    secondary: '#6b5a4a',
    svg: svg(
      '0 0 60 100',
      `<path d="M30 6C38 6 46 12 50 18C48 22 42 26 42 34L42 78C42 90 38 96 30 96C22 96 18 90 18 78L18 34C18 26 12 22 10 18C14 12 22 6 30 6Z" fill="#PRIMARY" ${S}/>` +
        `<path d="M30 30V84M30 40L24 46M30 40L36 46M30 56L24 62M30 56L36 62M30 72L24 78M30 72L36 78" fill="none" stroke="#SECONDARY" stroke-width="2.5" stroke-linecap="round"/>` +
        `<circle cx="24" cy="18" r="3.5" fill="#ffffff" ${S2}/><circle cx="36" cy="18" r="3.5" fill="#ffffff" ${S2}/>` +
        `<circle cx="25.5" cy="18.5" r="1.7" fill="#1f2937"/><circle cx="34.5" cy="18.5" r="1.7" fill="#1f2937"/>`,
    ),
  },
  {
    id: 'species.sea-urchin',
    name: 'Sea urchin',
    category: 'species',
    keywords: ['sea urchin', 'echinoderm', 'strongylocentrotus', 'invertebrate', 'embryo', 'marine'],
    width: 100,
    height: 100,
    primary: '#7e5a9b',
    secondary: '#4a3660',
    svg: svg(
      '0 0 100 100',
      `<path d="${radialLines(50, 50, 16, 26, 46)}" fill="none" stroke="#1f2937" stroke-width="5.5" stroke-linecap="round"/>` +
        `<path d="${radialLines(50, 50, 16, 26, 46)}" fill="none" stroke="#PRIMARY" stroke-width="2.5" stroke-linecap="round"/>` +
        `<circle cx="50" cy="50" r="30" fill="#PRIMARY" ${S}/>` +
        `<path d="${radialLines(50, 50, 5, 6, 27, -90)}" fill="none" stroke="#SECONDARY" stroke-width="3.5" stroke-linecap="round"/>` +
        `<circle cx="50" cy="50" r="5" fill="#374151"/>`,
    ),
  },
  {
    id: 'species.ascidian',
    name: 'Ascidian',
    category: 'species',
    keywords: ['ascidian', 'ciona', 'sea squirt', 'tunicate', 'chordate', 'marine', 'invertebrate'],
    width: 80,
    height: 100,
    primary: '#d6a96a',
    secondary: '#7a5a3a',
    svg: svg(
      '0 0 80 100',
      `<rect x="6" y="92" width="68" height="5" rx="2" fill="#9ca3af" ${S2}/>` +
        `<path d="M34 8L46 8C50 14 56 20 60 28L74 22L76 36L64 40C70 56 70 78 60 90C52 98 28 98 20 90C8 76 12 48 20 32C26 22 30 14 34 8Z" fill="#PRIMARY" ${S}/>` +
        `<path d="M30 36V80M40 32V84M50 36V80" fill="none" stroke="#ffffff" stroke-opacity="0.6" stroke-width="2.5" stroke-linecap="round"/>` +
        `<ellipse cx="40" cy="8" rx="6" ry="2.5" fill="#SECONDARY" ${S2}/>` +
        `<ellipse cx="75" cy="29" rx="2.5" ry="7" fill="#SECONDARY" ${S2}/>`,
    ),
  },
  {
    id: 'species.dictyostelium',
    name: 'Dictyostelium',
    category: 'species',
    keywords: ['dictyostelium', 'dicty', 'slime mold', 'social amoeba', 'fruiting body', 'microbe'],
    width: 100,
    height: 100,
    primary: '#d4b86a',
    secondary: '#f0dc9a',
    svg: svg(
      '0 0 100 100',
      `<ellipse cx="50" cy="90" rx="34" ry="5" fill="#e5e7eb" ${S2}/>` +
        `<ellipse cx="38" cy="86" rx="4.5" ry="2.5" fill="#PRIMARY" ${S2}/><ellipse cx="62" cy="86" rx="4.5" ry="2.5" fill="#PRIMARY" ${S2}/>` +
        `<path d="M50 88C50 70 48 40 50 26M24 88C24 76 24 60 26 48M76 88C76 80 78 66 76 58" fill="none" stroke="#1f2937" stroke-width="6.5" stroke-linecap="round"/>` +
        `<path d="M50 88C50 70 48 40 50 26M24 88C24 76 24 60 26 48M76 88C76 80 78 66 76 58" fill="none" stroke="#PRIMARY" stroke-width="3" stroke-linecap="round"/>` +
        `<circle cx="50" cy="18" r="12" fill="#SECONDARY" ${S}/><circle cx="26" cy="42" r="8" fill="#SECONDARY" ${S}/><circle cx="76" cy="52" r="7" fill="#SECONDARY" ${S}/>`,
    ),
  },
  {
    id: 'species.organoid-mini-organ',
    name: 'Organoid',
    category: 'species',
    keywords: ['organoid', 'mini organ', 'mini brain', 'cerebral organoid', '3d culture', 'spheroid'],
    width: 100,
    height: 100,
    primary: '#d8a7a0',
    secondary: '#a86b7a',
    svg: svg(
      '0 0 100 100',
      `<circle cx="36" cy="34" r="16" fill="#PRIMARY" ${S}/><circle cx="62" cy="30" r="16" fill="#PRIMARY" ${S}/><circle cx="76" cy="54" r="16" fill="#PRIMARY" ${S}/>` +
        `<circle cx="62" cy="74" r="16" fill="#PRIMARY" ${S}/><circle cx="38" cy="74" r="16" fill="#PRIMARY" ${S}/><circle cx="24" cy="54" r="16" fill="#PRIMARY" ${S}/>` +
        `<circle cx="50" cy="52" r="26" fill="#PRIMARY"/>` +
        `<circle cx="44" cy="42" r="5.5" fill="#SECONDARY" ${S2}/><circle cx="62" cy="48" r="5.5" fill="#SECONDARY" ${S2}/><circle cx="52" cy="64" r="5.5" fill="#SECONDARY" ${S2}/><circle cx="34" cy="60" r="5.5" fill="#SECONDARY" ${S2}/>` +
        `<circle cx="44" cy="42" r="2" fill="#ffffff"/><circle cx="62" cy="48" r="2" fill="#ffffff"/><circle cx="52" cy="64" r="2" fill="#ffffff"/><circle cx="34" cy="60" r="2" fill="#ffffff"/>`,
    ),
  },
  {
    id: 'species.petri-colonies',
    name: 'Petri dish with colonies',
    category: 'species',
    keywords: ['petri dish', 'colonies', 'agar plate', 'bacterial colonies', 'culture plate', 'cfu'],
    width: 100,
    height: 100,
    primary: '#d9c89b',
    secondary: '#e3b04b',
    svg: svg(
      '0 0 100 100',
      `<circle cx="50" cy="50" r="46" fill="#e5e7eb" ${S}/>` +
        `<circle cx="50" cy="50" r="38" fill="#PRIMARY" ${S2}/>` +
        `<circle cx="38" cy="36" r="4.5" fill="#SECONDARY" ${S2}/><circle cx="58" cy="32" r="4" fill="#SECONDARY" ${S2}/><circle cx="68" cy="50" r="4.5" fill="#SECONDARY" ${S2}/>` +
        `<circle cx="46" cy="54" r="4" fill="#SECONDARY" ${S2}/><circle cx="56" cy="68" r="4.5" fill="#SECONDARY" ${S2}/><circle cx="32" cy="60" r="4" fill="#SECONDARY" ${S2}/>` +
        `<circle cx="70" cy="68" r="3.5" fill="#SECONDARY" ${S2}/><circle cx="60" cy="48" r="3" fill="#SECONDARY" ${S2}/><circle cx="40" cy="72" r="3" fill="#SECONDARY" ${S2}/>` +
        `<path d="M24 28C28 22 34 18 40 16" fill="none" stroke="#ffffff" stroke-opacity="0.7" stroke-width="3" stroke-linecap="round"/>`,
    ),
  },
]
