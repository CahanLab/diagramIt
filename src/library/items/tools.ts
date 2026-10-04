import type { LibraryItem } from '../types'

/** Shared outline attributes. */
const S = 'stroke="#1f2937" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"'
/** Fine-detail outline attributes. */
const F = 'stroke="#1f2937" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"'

const svg = (viewBox: string, body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`

const GREY = '#9ca3af'
const BLUE = '#4b7bb5'
const GLASS = '#e5e7eb'
const LIQUID = '#bfdbfe'

/** 8 tips for the multichannel pipette. */
const multiTips = Array.from({ length: 8 }, (_, i) => {
  const cx = 16 + i * 9.7
  return `<polygon points="${cx - 3.5},64 ${cx + 3.5},64 ${cx + 1.2},94 ${cx - 1.2},94" fill="#ffffff" ${F}/>`
}).join('')

/** A pipette hanging from the stand at horizontal centre cx. */
const standPipette = (cx: number): string =>
  `<rect x="${cx - 5}" y="2" width="10" height="6" rx="2" fill="#SECONDARY" ${F}/>` +
  `<rect x="${cx - 2}" y="8" width="4" height="10" fill="#9ca3af" ${F}/>` +
  `<rect x="${cx - 6}" y="18" width="12" height="28" rx="3" fill="#e5e7eb" ${S}/>` +
  `<polygon points="${cx - 4},46 ${cx + 4},46 ${cx + 2},66 ${cx - 2},66" fill="#e5e7eb" ${F}/>` +
  `<polygon points="${cx - 2},66 ${cx + 2},66 ${cx + 1},80 ${cx - 1},80" fill="#ffffff" ${F}/>`

/** A capped tube with liquid for the tube rack at horizontal centre cx. */
const rackTube = (cx: number): string =>
  `<path d="M${cx - 6} 14h12v40a6 6 0 0 1-12 0z" fill="#ffffff" ${S}/>` +
  `<path d="M${cx - 6} 40h12v14a6 6 0 0 1-12 0z" fill="#SECONDARY"/>` +
  `<rect x="${cx - 8}" y="8" width="16" height="7" rx="2" fill="#9ca3af" ${S}/>`

export const items: LibraryItem[] = [
  {
    id: 'tools.micropipette',
    name: 'Micropipette',
    category: 'tools',
    keywords: ['micropipette', 'pipette', 'p1000', 'p200', 'p20', 'single channel', 'gilson', 'pipettor'],
    width: 55,
    height: 110,
    primary: GREY,
    secondary: BLUE,
    svg: svg(
      '0 0 50 100',
      `<rect x="17" y="3" width="16" height="9" rx="2.5" fill="#SECONDARY" ${S}/>` +
        `<rect x="22" y="12" width="6" height="8" fill="#9ca3af" ${F}/>` +
        `<rect x="36" y="34" width="6" height="18" rx="1.5" fill="#6b7280" ${F}/>` +
        `<rect x="14" y="20" width="22" height="34" rx="4" fill="#PRIMARY" ${S}/>` +
        `<rect x="19" y="27" width="12" height="10" rx="1.5" fill="#ffffff" ${F}/>` +
        `<polygon points="19,54 31,54 28,74 22,74" fill="#e5e7eb" ${S}/>` +
        `<polygon points="22,74 28,74 26,96 24,96" fill="#ffffff" ${F}/>`,
    ),
  },
  {
    id: 'tools.multichannel-pipette',
    name: 'Multichannel pipette',
    category: 'tools',
    keywords: ['multichannel', 'multi-channel', '8-channel', '12-channel', 'pipette', 'pipettor'],
    width: 100,
    height: 100,
    primary: GREY,
    secondary: BLUE,
    svg: svg(
      '0 0 100 100',
      `<rect x="42" y="3" width="16" height="9" rx="2.5" fill="#SECONDARY" ${S}/>` +
        `<rect x="47" y="12" width="6" height="7" fill="#9ca3af" ${F}/>` +
        `<rect x="38" y="18" width="24" height="36" rx="4" fill="#PRIMARY" ${S}/>` +
        `<rect x="43" y="25" width="14" height="10" rx="1.5" fill="#ffffff" ${F}/>` +
        `<rect x="10" y="52" width="80" height="12" rx="3" fill="#e5e7eb" ${S}/>` +
        multiTips,
    ),
  },
  {
    id: 'tools.pipette-controller',
    name: 'Pipette controller',
    category: 'tools',
    keywords: ['pipette controller', 'pipettor', 'pipet-aid', 'pipetboy', 'serological', 'motorised', 'motorized', 'pipette aid'],
    width: 70,
    height: 110,
    primary: GREY,
    secondary: BLUE,
    svg: svg(
      '0 0 60 100',
      `<rect x="14" y="4" width="28" height="40" rx="10" fill="#PRIMARY" ${S}/>` +
        `<rect x="38" y="12" width="12" height="7" rx="2" fill="#SECONDARY" ${F}/>` +
        `<rect x="38" y="24" width="12" height="7" rx="2" fill="#SECONDARY" ${F}/>` +
        `<polygon points="21,44 35,44 32,54 24,54" fill="#6b7280" ${S}/>` +
        `<rect x="25" y="54" width="6" height="32" fill="#ffffff" ${F}/>` +
        `<line x1="25" y1="62" x2="31" y2="62" ${F}/>` +
        `<line x1="25" y1="70" x2="31" y2="70" ${F}/>` +
        `<line x1="25" y1="78" x2="31" y2="78" ${F}/>` +
        `<polygon points="25,86 31,86 29,97 27,97" fill="#ffffff" ${F}/>`,
    ),
  },
  {
    id: 'tools.repeater-pipette',
    name: 'Repeater pipette',
    category: 'tools',
    keywords: ['repeater', 'repeat pipette', 'stepper', 'multipette', 'dispenser', 'pipettor'],
    width: 70,
    height: 110,
    primary: GREY,
    secondary: BLUE,
    svg: svg(
      '0 0 60 100',
      `<rect x="20" y="2" width="14" height="10" rx="3" fill="#SECONDARY" ${S}/>` +
        `<rect x="14" y="10" width="26" height="44" rx="6" fill="#PRIMARY" ${S}/>` +
        `<circle cx="40" cy="24" r="7" fill="#ffffff" ${S}/>` +
        `<path d="M40 38q10 2 10 10v8" fill="none" stroke="#1f2937" stroke-width="4" stroke-linecap="round"/>` +
        `<rect x="21" y="54" width="12" height="26" fill="#ffffff" ${S}/>` +
        `<rect x="24" y="58" width="6" height="12" fill="#e5e7eb" ${F}/>` +
        `<polygon points="24,80 30,80 28,96 26,96" fill="#ffffff" ${F}/>`,
    ),
  },
  {
    id: 'tools.cell-scraper',
    name: 'Cell scraper',
    category: 'tools',
    keywords: ['cell scraper', 'scraper', 'lifter', 'cell lifter', 'harvest'],
    width: 100,
    height: 100,
    primary: GREY,
    secondary: BLUE,
    svg: svg(
      '0 0 100 100',
      `<polygon points="15,14 24,7 65,61 56,68" fill="#PRIMARY" ${S}/>` +
        `<polygon points="56,68 65,61 71,69 62,76" fill="#6b7280" ${S}/>` +
        `<polygon points="46,79 82,51 90,61 54,89" fill="#SECONDARY" ${S}/>`,
    ),
  },
  {
    id: 'tools.hemocytometer',
    name: 'Hemocytometer',
    category: 'tools',
    keywords: ['hemocytometer', 'haemocytometer', 'counting chamber', 'neubauer', 'cell counting', 'slide', 'grid'],
    width: 120,
    height: 72,
    primary: '#d1d5db',
    secondary: BLUE,
    svg: svg(
      '0 0 100 60',
      `<rect x="4" y="10" width="92" height="40" rx="3" fill="#PRIMARY" ${S}/>` +
        `<rect x="8" y="16" width="16" height="28" rx="1.5" fill="#9ca3af" ${F}/>` +
        `<rect x="76" y="16" width="16" height="28" rx="1.5" fill="#9ca3af" ${F}/>` +
        `<rect x="36" y="16" width="28" height="28" fill="#ffffff" ${F}/>` +
        `<line x1="43" y1="16" x2="43" y2="44" stroke="#SECONDARY" stroke-width="2"/>` +
        `<line x1="50" y1="16" x2="50" y2="44" stroke="#SECONDARY" stroke-width="2"/>` +
        `<line x1="57" y1="16" x2="57" y2="44" stroke="#SECONDARY" stroke-width="2"/>` +
        `<line x1="36" y1="23" x2="64" y2="23" stroke="#SECONDARY" stroke-width="2"/>` +
        `<line x1="36" y1="30" x2="64" y2="30" stroke="#SECONDARY" stroke-width="2"/>` +
        `<line x1="36" y1="37" x2="64" y2="37" stroke="#SECONDARY" stroke-width="2"/>` +
        `<rect x="30" y="12" width="40" height="36" rx="1" fill="#ffffff" fill-opacity="0.5" ${F}/>`,
    ),
  },
  {
    id: 'tools.tally-counter',
    name: 'Tally counter',
    category: 'tools',
    keywords: ['tally counter', 'counter', 'clicker', 'hand counter', 'cell counting'],
    width: 90,
    height: 100,
    primary: GREY,
    secondary: BLUE,
    svg: svg(
      '0 0 90 100',
      `<rect x="35" y="8" width="20" height="14" rx="4" fill="#SECONDARY" ${S}/>` +
        `<rect x="40" y="20" width="10" height="6" fill="#6b7280" ${F}/>` +
        `<circle cx="45" cy="86" r="9" fill="none" stroke="#1f2937" stroke-width="3.5"/>` +
        `<circle cx="45" cy="52" r="28" fill="#PRIMARY" ${S}/>` +
        `<rect x="25" y="45" width="40" height="14" rx="2" fill="#ffffff" ${F}/>` +
        `<rect x="28.5" y="48" width="6" height="8" fill="#374151"/>` +
        `<rect x="37.5" y="48" width="6" height="8" fill="#374151"/>` +
        `<rect x="46.5" y="48" width="6" height="8" fill="#374151"/>` +
        `<rect x="55.5" y="48" width="6" height="8" fill="#374151"/>`,
    ),
  },
  {
    id: 'tools.forceps',
    name: 'Forceps',
    category: 'tools',
    keywords: ['forceps', 'tweezers', 'pincers', 'dissection', 'fine forceps'],
    width: 55,
    height: 110,
    primary: GREY,
    secondary: BLUE,
    svg: svg(
      '0 0 50 100',
      `<path d="M19 5H31L34 50L25.5 95H24.5L16 50Z M25 13L29.5 50L25 86L20.5 50Z" fill="#PRIMARY" fill-rule="evenodd" ${S}/>` +
        `<polygon points="17.8,24 23.6,24 22.2,36 17,36" fill="#SECONDARY"/>` +
        `<polygon points="32.2,24 26.4,24 27.8,36 33,36" fill="#SECONDARY"/>`,
    ),
  },
  {
    id: 'tools.scalpel',
    name: 'Scalpel',
    category: 'tools',
    keywords: ['scalpel', 'blade', 'knife', 'dissection', 'surgical blade', 'no. 10'],
    width: 120,
    height: 48,
    primary: GREY,
    secondary: BLUE,
    svg: svg(
      '0 0 100 40',
      `<rect x="4" y="14" width="52" height="12" rx="3" fill="#PRIMARY" ${S}/>` +
        `<rect x="44" y="12" width="7" height="16" rx="1.5" fill="#SECONDARY" ${F}/>` +
        `<line x1="14" y1="17" x2="14" y2="23" ${F}/>` +
        `<line x1="21" y1="17" x2="21" y2="23" ${F}/>` +
        `<line x1="28" y1="17" x2="28" y2="23" ${F}/>` +
        `<rect x="56" y="16" width="8" height="8" fill="#6b7280" ${F}/>` +
        `<path d="M64 13h16c10 0 16 5 16 9L64 28z" fill="#e5e7eb" ${S}/>`,
    ),
  },
  {
    id: 'tools.scissors',
    name: 'Scissors',
    category: 'tools',
    keywords: ['scissors', 'dissection scissors', 'surgical scissors', 'cut'],
    width: 100,
    height: 100,
    primary: GREY,
    secondary: BLUE,
    svg: svg(
      '0 0 100 100',
      `<polygon points="44,52 20,10 27,4 56,46" fill="#e5e7eb" ${S}/>` +
        `<polygon points="56,52 80,10 73,4 44,46" fill="#e5e7eb" ${S}/>` +
        `<polygon points="46,54 30,74 36,78 54,56" fill="#PRIMARY" ${S}/>` +
        `<polygon points="54,54 70,74 64,78 46,56" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="28" cy="86" rx="12" ry="10" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="28" cy="86" rx="6" ry="4.5" fill="#ffffff" ${F}/>` +
        `<ellipse cx="72" cy="86" rx="12" ry="10" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="72" cy="86" rx="6" ry="4.5" fill="#ffffff" ${F}/>` +
        `<circle cx="50" cy="50" r="4" fill="#SECONDARY" ${F}/>`,
    ),
  },
  {
    id: 'tools.spatula',
    name: 'Spatula',
    category: 'tools',
    keywords: ['spatula', 'micro spatula', 'microspatula', 'scoop', 'weighing', 'powder'],
    width: 120,
    height: 44,
    primary: GREY,
    secondary: BLUE,
    svg: svg(
      '0 0 100 36',
      `<rect x="4" y="11" width="30" height="14" rx="5" fill="#e5e7eb" ${S}/>` +
        `<ellipse cx="89" cy="18" rx="8" ry="6.5" fill="#e5e7eb" ${S}/>` +
        `<rect x="32" y="14" width="50" height="8" rx="3" fill="#PRIMARY" ${S}/>` +
        `<rect x="50" y="12.5" width="12" height="11" rx="2" fill="#SECONDARY" ${F}/>`,
    ),
  },
  {
    id: 'tools.inoculation-loop',
    name: 'Inoculation loop',
    category: 'tools',
    keywords: ['inoculation loop', 'inoculating loop', 'loop', 'streak', 'plating', 'microbiology', 'wire loop'],
    width: 100,
    height: 100,
    primary: GREY,
    secondary: BLUE,
    svg: svg(
      '0 0 100 100',
      `<line x1="50" y1="50" x2="78" y2="22" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>` +
        `<circle cx="84" cy="16" r="8" fill="none" stroke="#1f2937" stroke-width="3"/>` +
        `<polygon points="12.8,92.8 7.2,87.2 47.2,47.2 52.8,52.8" fill="#PRIMARY" ${S}/>` +
        `<polygon points="12.8,92.8 7.2,87.2 15.2,79.2 20.8,84.8" fill="#SECONDARY" ${S}/>`,
    ),
  },
  {
    id: 'tools.tube-rack',
    name: 'Tube rack',
    category: 'tools',
    keywords: ['tube rack', 'rack', 'microcentrifuge rack', 'eppendorf rack', 'tubes', 'holder'],
    width: 100,
    height: 100,
    primary: GREY,
    secondary: LIQUID,
    svg: svg(
      '0 0 100 100',
      rackTube(20) +
        rackTube(40) +
        rackTube(60) +
        rackTube(80) +
        `<rect x="6" y="46" width="88" height="34" rx="3" fill="#PRIMARY" ${S}/>` +
        `<rect x="6" y="46" width="88" height="8" rx="2" fill="#ffffff" fill-opacity="0.5" ${F}/>` +
        `<rect x="10" y="80" width="10" height="12" fill="#6b7280" ${S}/>` +
        `<rect x="80" y="80" width="10" height="12" fill="#6b7280" ${S}/>`,
    ),
  },
  {
    id: 'tools.plate-stack',
    name: 'Plate stack',
    category: 'tools',
    keywords: ['plate stack', 'stack', 'plates', 'microplates', 'multiwell', 'stacked plates'],
    width: 110,
    height: 84,
    primary: GREY,
    secondary: BLUE,
    svg: svg(
      '0 0 100 76',
      `<rect x="10" y="54" width="80" height="10" rx="2" fill="#PRIMARY" ${S}/>` +
        `<rect x="8" y="49" width="84" height="6" rx="1.5" fill="#SECONDARY" ${S}/>` +
        `<rect x="10" y="36" width="80" height="10" rx="2" fill="#PRIMARY" ${S}/>` +
        `<rect x="8" y="31" width="84" height="6" rx="1.5" fill="#SECONDARY" ${S}/>` +
        `<rect x="10" y="18" width="80" height="10" rx="2" fill="#PRIMARY" ${S}/>` +
        `<rect x="8" y="13" width="84" height="6" rx="1.5" fill="#SECONDARY" ${S}/>`,
    ),
  },
  {
    id: 'tools.timer',
    name: 'Timer',
    category: 'tools',
    keywords: ['timer', 'lab timer', 'stopwatch', 'countdown', 'clock', 'incubation time'],
    width: 100,
    height: 100,
    primary: GREY,
    secondary: BLUE,
    svg: svg(
      '0 0 100 100',
      `<rect x="40" y="6" width="20" height="10" rx="2" fill="#6b7280" ${S}/>` +
        `<rect x="14" y="14" width="72" height="72" rx="10" fill="#PRIMARY" ${S}/>` +
        `<rect x="22" y="24" width="56" height="24" rx="3" fill="#SECONDARY" ${S}/>` +
        `<rect x="28" y="30" width="7" height="12" fill="#ffffff"/>` +
        `<rect x="38" y="30" width="7" height="12" fill="#ffffff"/>` +
        `<rect x="48.5" y="32" width="3" height="3" fill="#ffffff"/>` +
        `<rect x="48.5" y="39" width="3" height="3" fill="#ffffff"/>` +
        `<rect x="55" y="30" width="7" height="12" fill="#ffffff"/>` +
        `<rect x="65" y="30" width="7" height="12" fill="#ffffff"/>` +
        `<circle cx="32" cy="66" r="7" fill="#e5e7eb" ${S}/>` +
        `<circle cx="50" cy="66" r="7" fill="#e5e7eb" ${S}/>` +
        `<circle cx="68" cy="66" r="7" fill="#e5e7eb" ${S}/>`,
    ),
  },
  {
    id: 'tools.vortex-mixer',
    name: 'Vortex mixer',
    category: 'tools',
    keywords: ['vortex', 'vortex mixer', 'vortexer', 'mixer', 'shaker', 'agitate'],
    width: 100,
    height: 100,
    primary: GREY,
    secondary: BLUE,
    svg: svg(
      '0 0 100 100',
      `<path d="M20 30q-8 8 0 16" fill="none" ${S}/>` +
        `<path d="M80 30q8 8 0 16" fill="none" ${S}/>` +
        `<rect x="42" y="42" width="16" height="12" fill="#6b7280" ${S}/>` +
        `<polygon points="20,52 80,52 88,90 12,90" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="50" cy="38" rx="22" ry="8" fill="#374151" ${S}/>` +
        `<ellipse cx="50" cy="38" rx="13" ry="4.5" fill="#6b7280" ${F}/>` +
        `<circle cx="34" cy="72" r="7" fill="#SECONDARY" ${S}/>` +
        `<rect x="56" y="66" width="16" height="12" rx="2" fill="#e5e7eb" ${S}/>` +
        `<rect x="59" y="69" width="5" height="6" fill="#374151"/>`,
    ),
  },
  {
    id: 'tools.magnetic-stirrer',
    name: 'Magnetic stirrer',
    category: 'tools',
    keywords: ['magnetic stirrer', 'stirrer', 'stir plate', 'hotplate', 'stir bar', 'mixing'],
    width: 100,
    height: 100,
    primary: GREY,
    secondary: BLUE,
    svg: svg(
      '0 0 100 100',
      `<rect x="32" y="16" width="36" height="40" rx="1" fill="#e5e7eb" ${S}/>` +
        `<rect x="32" y="34" width="36" height="22" fill="${LIQUID}"/>` +
        `<ellipse cx="50" cy="51" rx="9" ry="3" fill="#374151"/>` +
        `<rect x="32" y="16" width="36" height="40" rx="1" fill="none" ${S}/>` +
        `<rect x="14" y="56" width="72" height="8" rx="2" fill="#ffffff" ${S}/>` +
        `<polygon points="10,64 90,64 92,88 8,88" fill="#PRIMARY" ${S}/>` +
        `<circle cx="30" cy="76" r="6" fill="#SECONDARY" ${S}/>` +
        `<circle cx="70" cy="76" r="6" fill="#SECONDARY" ${S}/>`,
    ),
  },
  {
    id: 'tools.pipette-stand',
    name: 'Pipette stand',
    category: 'tools',
    keywords: ['pipette stand', 'pipette holder', 'carousel', 'rack', 'pipette rack', 'stand'],
    width: 100,
    height: 100,
    primary: GREY,
    secondary: BLUE,
    svg: svg(
      '0 0 100 100',
      `<rect x="46" y="16" width="8" height="70" fill="#PRIMARY" ${S}/>` +
        `<rect x="20" y="84" width="60" height="10" rx="2" fill="#PRIMARY" ${S}/>` +
        standPipette(24) +
        standPipette(50) +
        standPipette(76) +
        `<rect x="12" y="12" width="76" height="8" rx="3" fill="#PRIMARY" ${S}/>`,
    ),
  },
  {
    id: 'tools.wash-bottle',
    name: 'Wash bottle',
    category: 'tools',
    keywords: ['wash bottle', 'squeeze bottle', 'squirt bottle', 'water', 'rinse', 'distilled water'],
    width: 90,
    height: 100,
    primary: '#d1d5db',
    secondary: BLUE,
    svg: svg(
      '0 0 90 100',
      `<path d="M45 30V12q0-6 6-6h8l16 22" fill="none" stroke="#1f2937" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<path d="M45 30V12q0-6 6-6h8l16 22" fill="none" stroke="#9ca3af" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<rect x="19" y="38" width="52" height="56" rx="8" fill="#PRIMARY" ${S}/>` +
        `<rect x="21" y="70" width="48" height="22" rx="6" fill="${LIQUID}"/>` +
        `<rect x="19" y="38" width="52" height="56" rx="8" fill="none" ${S}/>` +
        `<rect x="31" y="28" width="28" height="12" rx="2.5" fill="#SECONDARY" ${S}/>` +
        `<rect x="28" y="50" width="34" height="16" rx="2" fill="#ffffff" ${F}/>`,
    ),
  },
  {
    id: 'tools.spray-bottle-ethanol',
    name: 'Spray bottle (ethanol)',
    category: 'tools',
    keywords: ['spray bottle', 'ethanol', '70% ethanol', 'etoh', 'disinfectant', 'sterilise', 'sterilize', 'spray'],
    width: 100,
    height: 100,
    primary: '#d1d5db',
    secondary: BLUE,
    svg: svg(
      '0 0 100 100',
      `<rect x="28" y="44" width="40" height="50" rx="6" fill="#PRIMARY" ${S}/>` +
        `<rect x="40" y="34" width="16" height="12" fill="#9ca3af" ${S}/>` +
        `<polygon points="32,16 70,16 70,32 60,32 56,44 40,44 40,32 32,32" fill="#SECONDARY" ${S}/>` +
        `<path d="M40 34q-9 4-6 14" fill="none" stroke="#1f2937" stroke-width="4" stroke-linecap="round"/>` +
        `<rect x="70" y="20" width="7" height="7" fill="#374151" ${F}/>` +
        `<circle cx="86" cy="17" r="2.5" fill="#ffffff" ${F}/>` +
        `<circle cx="90" cy="24" r="2.5" fill="#ffffff" ${F}/>` +
        `<circle cx="86" cy="31" r="2.5" fill="#ffffff" ${F}/>` +
        `<rect x="34" y="56" width="28" height="24" rx="2" fill="#ffffff" ${F}/>` +
        `<rect x="34" y="56" width="28" height="8" fill="#SECONDARY" ${F}/>`,
    ),
  },
  {
    id: 'tools.marker-pen',
    name: 'Marker pen',
    category: 'tools',
    keywords: ['marker', 'marker pen', 'sharpie', 'permanent marker', 'labelling', 'labeling', 'pen'],
    width: 100,
    height: 100,
    primary: GREY,
    secondary: '#374151',
    svg: svg(
      '0 0 100 100',
      `<polygon points="24.95,84.95 15.05,75.05 67.05,23.05 76.95,32.95" fill="#PRIMARY" ${S}/>` +
        `<polygon points="70.95,38.95 61.05,29.05 67.05,23.05 76.95,32.95" fill="#ffffff" fill-opacity="0.5" ${F}/>` +
        `<polygon points="76.95,32.95 67.05,23.05 81.05,9.05 90.95,18.95" fill="#SECONDARY" ${S}/>` +
        `<polygon points="24.95,84.95 15.05,75.05 8,92" fill="#374151" ${S}/>`,
    ),
  },
  {
    id: 'tools.lab-notebook',
    name: 'Lab notebook',
    category: 'tools',
    keywords: ['lab notebook', 'notebook', 'journal', 'record', 'eln', 'notes', 'book'],
    width: 80,
    height: 100,
    primary: BLUE,
    secondary: '#e5e7eb',
    svg: svg(
      '0 0 80 100',
      `<rect x="6" y="6" width="16" height="88" rx="3" fill="#374151" ${S}/>` +
        `<rect x="14" y="6" width="60" height="88" rx="4" fill="#PRIMARY" ${S}/>` +
        `<rect x="26" y="22" width="38" height="26" rx="2" fill="#ffffff" ${F}/>` +
        `<line x1="31" y1="31" x2="59" y2="31" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round"/>` +
        `<line x1="31" y1="39" x2="53" y2="39" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round"/>` +
        `<rect x="62" y="6" width="5" height="88" fill="#SECONDARY" ${F}/>`,
    ),
  },
  {
    id: 'tools.thermometer',
    name: 'Thermometer',
    category: 'tools',
    keywords: ['thermometer', 'temperature', 'degrees', 'celsius', 'probe'],
    width: 44,
    height: 110,
    primary: GLASS,
    secondary: '#dc2626',
    svg: svg(
      '0 0 40 100',
      `<rect x="13" y="6" width="14" height="70" rx="7" fill="#PRIMARY" ${S}/>` +
        `<rect x="17.5" y="32" width="5" height="44" fill="#SECONDARY"/>` +
        `<circle cx="20" cy="84" r="10" fill="#SECONDARY" ${S}/>` +
        `<line x1="27" y1="18" x2="31" y2="18" ${F}/>` +
        `<line x1="27" y1="28" x2="31" y2="28" ${F}/>` +
        `<line x1="27" y1="38" x2="31" y2="38" ${F}/>` +
        `<line x1="27" y1="48" x2="31" y2="48" ${F}/>` +
        `<line x1="27" y1="58" x2="31" y2="58" ${F}/>`,
    ),
  },
  {
    id: 'tools.ph-strip',
    name: 'pH strip',
    category: 'tools',
    keywords: ['ph strip', 'ph paper', 'ph', 'indicator', 'litmus', 'test strip', 'acid', 'base'],
    width: 44,
    height: 110,
    primary: GLASS,
    secondary: BLUE,
    svg: svg(
      '0 0 40 100',
      `<rect x="12" y="4" width="16" height="92" rx="2" fill="#PRIMARY" ${S}/>` +
        `<rect x="14.5" y="58" width="11" height="7" fill="#SECONDARY" fill-opacity="0.3"/>` +
        `<rect x="14.5" y="68" width="11" height="7" fill="#SECONDARY" fill-opacity="0.55"/>` +
        `<rect x="14.5" y="78" width="11" height="7" fill="#SECONDARY" fill-opacity="0.8"/>` +
        `<rect x="14.5" y="88" width="11" height="6" fill="#SECONDARY"/>`,
    ),
  },
  {
    id: 'tools.funnel',
    name: 'Funnel',
    category: 'tools',
    keywords: ['funnel', 'filter funnel', 'pour', 'transfer', 'filtration'],
    width: 100,
    height: 100,
    primary: GLASS,
    secondary: BLUE,
    svg: svg(
      '0 0 100 100',
      `<polygon points="8,12 92,12 58,54 42,54" fill="#PRIMARY" ${S}/>` +
        `<rect x="43" y="54" width="14" height="40" fill="#PRIMARY" ${S}/>` +
        `<ellipse cx="50" cy="12" rx="44" ry="7" fill="#SECONDARY" ${S}/>` +
        `<ellipse cx="50" cy="12" rx="36" ry="3.5" fill="#ffffff" fill-opacity="0.5"/>`,
    ),
  },
  {
    id: 'tools.beaker',
    name: 'Beaker',
    category: 'tools',
    keywords: ['beaker', 'glass', 'glassware', 'liquid', 'buffer', 'media'],
    width: 100,
    height: 100,
    primary: GLASS,
    secondary: LIQUID,
    svg: svg(
      '0 0 100 100',
      `<path d="M20 12h60v70q0 10-10 10H30q-10 0-10-10z" fill="#PRIMARY" ${S}/>` +
        `<path d="M22 50h56v32q0 8-8 8H30q-8 0-8-8z" fill="#SECONDARY"/>` +
        `<path d="M20 12h60v70q0 10-10 10H30q-10 0-10-10z" fill="none" ${S}/>` +
        `<path d="M20 12l-6-6h10" fill="none" ${S}/>` +
        `<line x1="66" y1="30" x2="76" y2="30" ${F}/>` +
        `<line x1="66" y1="42" x2="76" y2="42" ${F}/>` +
        `<line x1="66" y1="54" x2="76" y2="54" ${F}/>` +
        `<line x1="66" y1="66" x2="76" y2="66" ${F}/>` +
        `<rect x="26" y="20" width="5" height="50" rx="2.5" fill="#ffffff" fill-opacity="0.5"/>`,
    ),
  },
  {
    id: 'tools.erlenmeyer-flask',
    name: 'Erlenmeyer flask',
    category: 'tools',
    keywords: ['erlenmeyer', 'flask', 'conical flask', 'glassware', 'culture flask', 'shake flask'],
    width: 100,
    height: 100,
    primary: GLASS,
    secondary: LIQUID,
    svg: svg(
      '0 0 100 100',
      `<path d="M38 6h24v26l28 52q3 8-6 8H16q-9 0-6-8l28-52z" fill="#PRIMARY" ${S}/>` +
        `<path d="M28 58L15 83q-1 6 4 6h62q5 0 4-6L72 58z" fill="#SECONDARY"/>` +
        `<path d="M38 6h24v26l28 52q3 8-6 8H16q-9 0-6-8l28-52z" fill="none" ${S}/>` +
        `<rect x="35" y="4" width="30" height="7" rx="2" fill="#e5e7eb" ${S}/>` +
        `<rect x="40" y="16" width="5" height="26" rx="2.5" fill="#ffffff" fill-opacity="0.5"/>`,
    ),
  },
  {
    id: 'tools.graduated-cylinder',
    name: 'Graduated cylinder',
    category: 'tools',
    keywords: ['graduated cylinder', 'measuring cylinder', 'cylinder', 'glassware', 'volume', 'measure'],
    width: 55,
    height: 110,
    primary: GLASS,
    secondary: LIQUID,
    svg: svg(
      '0 0 50 100',
      `<ellipse cx="25" cy="90" rx="21" ry="6" fill="#e5e7eb" ${S}/>` +
        `<rect x="15" y="8" width="20" height="78" rx="2" fill="#PRIMARY" ${S}/>` +
        `<rect x="16.5" y="44" width="17" height="41" fill="#SECONDARY"/>` +
        `<rect x="15" y="8" width="20" height="78" rx="2" fill="none" ${S}/>` +
        `<path d="M15 8l-5-4h30" fill="none" ${S}/>` +
        `<line x1="27" y1="18" x2="33" y2="18" ${F}/>` +
        `<line x1="27" y1="28" x2="33" y2="28" ${F}/>` +
        `<line x1="27" y1="38" x2="33" y2="38" ${F}/>` +
        `<line x1="27" y1="48" x2="33" y2="48" ${F}/>` +
        `<line x1="27" y1="58" x2="33" y2="58" ${F}/>` +
        `<line x1="27" y1="68" x2="33" y2="68" ${F}/>`,
    ),
  },
  {
    id: 'tools.dropper',
    name: 'Dropper',
    category: 'tools',
    keywords: ['dropper', 'pasteur pipette', 'eye dropper', 'bulb pipette', 'drop'],
    width: 44,
    height: 110,
    primary: GLASS,
    secondary: BLUE,
    svg: svg(
      '0 0 40 100',
      `<path d="M8 28V18C8 10 13 4 20 4s12 6 12 14v10z" fill="#SECONDARY" ${S}/>` +
        `<polygon points="14,28 26,28 22,84 18,84" fill="#PRIMARY" ${S}/>` +
        `<polygon points="15.5,56 24.5,56 22,84 18,84" fill="${LIQUID}"/>` +
        `<polygon points="14,28 26,28 22,84 18,84" fill="none" ${S}/>` +
        `<path d="M20 87c-3 4-4 6-4 7.5a4 4 0 0 0 8 0c0-1.5-1-3.5-4-7.5z" fill="${LIQUID}" ${F}/>`,
    ),
  },
  {
    id: 'tools.magnet-rack',
    name: 'Magnet rack',
    category: 'tools',
    keywords: ['magnet rack', 'magnetic rack', 'magnetic stand', 'bead separation', 'beads', 'dynamag', 'spri', 'magnetic beads'],
    width: 100,
    height: 100,
    primary: GREY,
    secondary: BLUE,
    svg: svg(
      '0 0 100 100',
      `<rect x="10" y="34" width="80" height="58" rx="4" fill="#PRIMARY" ${S}/>` +
        `<rect x="26" y="34" width="48" height="10" fill="#6b7280" ${F}/>` +
        `<path d="M36 12h20v56a10 10 0 0 1-20 0z" fill="#ffffff" ${S}/>` +
        `<path d="M36 40h20v28a10 10 0 0 1-20 0z" fill="${LIQUID}"/>` +
        `<path d="M53 48q4 6 3 14t-4 10q3-6 3-12t-2-12z" fill="#6b7280" ${F}/>` +
        `<path d="M36 12h20v56a10 10 0 0 1-20 0z" fill="none" ${S}/>` +
        `<rect x="33" y="6" width="26" height="8" rx="2" fill="#9ca3af" ${S}/>` +
        `<rect x="60" y="40" width="12" height="36" rx="2" fill="#SECONDARY" ${S}/>`,
    ),
  },
  {
    id: 'tools.pipette-tip-waste',
    name: 'Pipette tip waste',
    category: 'tools',
    keywords: ['tip waste', 'waste', 'tip bin', 'used tips', 'discard', 'waste container', 'biohazard'],
    width: 100,
    height: 100,
    primary: GREY,
    secondary: BLUE,
    svg: svg(
      '0 0 100 100',
      `<polygon points="40,8 48,8 46,34 42,34" fill="#SECONDARY" ${F}/>` +
        `<polygon points="56,12 63,10 66,34 60,34" fill="#ffffff" ${F}/>` +
        `<polygon points="27,14 34,12 38,34 32,36" fill="#ffffff" ${F}/>` +
        `<rect x="14" y="30" width="72" height="8" rx="2" fill="#6b7280" ${S}/>` +
        `<polygon points="18,38 82,38 76,94 24,94" fill="#PRIMARY" ${S}/>` +
        `<rect x="36" y="52" width="28" height="22" rx="2" fill="#ffffff" ${F}/>` +
        `<circle cx="50" cy="63" r="5" fill="#SECONDARY"/>`,
    ),
  },
]
