import type { LibraryItem } from '../types'

/** Shared outline style, set on the root <svg> so every child inherits it. */
const S = 'stroke="#1f2937" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"'
const GREY = '#d1d5db'
const BLUE = '#4b7bb5'
const TEAL = '#2a9d8f'

interface Spec {
  id: string
  name: string
  keywords: string[]
  /** viewBox width/height; also used as the default insert size. */
  w?: number
  h?: number
  primary?: string
  secondary?: string
  body: string
}

function inst(spec: Spec): LibraryItem {
  const w = spec.w ?? 100
  const h = spec.h ?? 100
  return {
    id: `instruments.${spec.id}`,
    name: spec.name,
    category: 'instruments',
    keywords: spec.keywords,
    width: w,
    height: h,
    primary: spec.primary ?? GREY,
    secondary: spec.secondary ?? BLUE,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" ${S}>${spec.body}</svg>`,
  }
}

/** Upright compound microscope, reused by several items. */
const UPRIGHT_SCOPE = (stage: string) => `
<path d="M56 82 V50 C56 38 52 32 46 30 L52 20 C66 26 70 40 70 50 V82 Z" fill="#PRIMARY"/>
<rect x="16" y="82" width="68" height="12" rx="4" fill="#PRIMARY"/>
<rect x="38" y="4" width="10" height="24" rx="2" transform="rotate(-28 43 28)" fill="#6b7280"/>
<rect x="36" y="26" width="24" height="10" rx="2" fill="#374151"/>
<rect x="44" y="36" width="8" height="16" fill="#374151"/>
<rect x="22" y="54" width="44" height="6" fill="${stage}"/>
<rect x="40" y="60" width="16" height="10" rx="2" fill="#9ca3af"/>
<circle cx="66" cy="62" r="5" fill="#374151"/>`

export const items: LibraryItem[] = [
  inst({
    id: 'microscope',
    name: 'Microscope',
    keywords: ['microscope', 'upright', 'compound', 'light microscope', 'brightfield', 'optics'],
    body: UPRIGHT_SCOPE('#SECONDARY'),
  }),
  inst({
    id: 'inverted-microscope',
    name: 'Inverted microscope',
    keywords: ['inverted microscope', 'tissue culture microscope', 'cell culture', 'phase contrast'],
    body: `
<rect x="64" y="12" width="14" height="44" rx="2" fill="#PRIMARY"/>
<rect x="54" y="4" width="34" height="12" rx="3" fill="#374151"/>
<rect x="6" y="56" width="88" height="38" rx="4" fill="#PRIMARY"/>
<rect x="24" y="28" width="10" height="30" rx="2" transform="rotate(-40 29 58)" fill="#6b7280"/>
<rect x="23" y="26" width="12" height="6" rx="1" transform="rotate(-40 29 58)" fill="#374151"/>
<rect x="12" y="48" width="64" height="8" rx="1" fill="#SECONDARY"/>
<rect x="34" y="42" width="24" height="6" rx="1" fill="#ffffff"/>
<rect x="42" y="58" width="8" height="12" fill="#374151"/>
<circle cx="80" cy="76" r="5" fill="#374151"/>`,
  }),
  inst({
    id: 'confocal-microscope',
    name: 'Confocal microscope',
    keywords: ['confocal', 'laser scanning', 'lsm', 'microscope', 'imaging', 'laser'],
    body: `
<rect x="60" y="46" width="36" height="36" rx="3" fill="#PRIMARY"/>
<rect x="66" y="56" width="14" height="8" rx="1" fill="#374151"/>
<circle cx="88" cy="60" r="3" fill="#SECONDARY" stroke="none"/>
<path d="M38 82 V52 C38 40 34 34 30 32 L36 24 C48 30 52 42 52 52 V82 Z" fill="#PRIMARY"/>
<rect x="4" y="82" width="54" height="12" rx="4" fill="#PRIMARY"/>
<rect x="22" y="6" width="10" height="24" rx="2" transform="rotate(-28 27 30)" fill="#6b7280"/>
<rect x="20" y="28" width="22" height="10" rx="2" fill="#374151"/>
<rect x="28" y="38" width="8" height="14" fill="#374151"/>
<rect x="10" y="54" width="36" height="6" fill="#9ca3af"/>
<path d="M78 46 V40 Q78 32 70 32 H42" fill="none" stroke="#SECONDARY" stroke-width="3"/>
<polygon points="30,52 34,52 37,58 27,58" fill="#SECONDARY" stroke="none"/>`,
  }),
  inst({
    id: 'fluorescence-microscope',
    name: 'Fluorescence microscope',
    keywords: ['fluorescence', 'epifluorescence', 'microscope', 'gfp', 'dapi', 'imaging', 'lamp'],
    body: `
<rect x="62" y="26" width="30" height="12" rx="2" fill="#SECONDARY"/>
${UPRIGHT_SCOPE('#9ca3af')}
<polygon points="44,52 52,52 56,60 40,60" fill="#SECONDARY" fill-opacity="0.6" stroke="none"/>`,
  }),
  inst({
    id: 'flow-cytometer',
    name: 'Flow cytometer',
    keywords: ['flow cytometer', 'flow cytometry', 'facs', 'cytometer', 'analyzer', 'immunophenotyping'],
    body: `
<rect x="6" y="26" width="88" height="64" rx="4" fill="#PRIMARY"/>
<rect x="48" y="34" width="40" height="30" rx="2" fill="#SECONDARY"/>
<circle cx="58" cy="54" r="2" fill="#ffffff" stroke="none"/><circle cx="63" cy="50" r="2" fill="#ffffff" stroke="none"/><circle cx="68" cy="56" r="2" fill="#ffffff" stroke="none"/><circle cx="72" cy="46" r="2" fill="#ffffff" stroke="none"/><circle cx="78" cy="52" r="2" fill="#ffffff" stroke="none"/><circle cx="66" cy="42" r="2" fill="#ffffff" stroke="none"/>
<rect x="14" y="26" width="20" height="10" rx="1" fill="#6b7280"/>
<path d="M18 36 H30 V58 A6 6 0 0 1 18 58 Z" fill="#ffffff"/>
<path d="M20 48 H28 V58 A4 4 0 0 1 20 58 Z" fill="#SECONDARY" stroke="none"/>
<circle cx="56" cy="76" r="3.5" fill="#374151"/><circle cx="68" cy="76" r="3.5" fill="#374151"/><circle cx="80" cy="76" r="3.5" fill="#374151"/>
<line x1="14" y1="72" x2="36" y2="72" stroke="#9ca3af"/><line x1="14" y1="79" x2="36" y2="79" stroke="#9ca3af"/>`,
  }),
  inst({
    id: 'cell-sorter',
    name: 'Cell sorter (FACS)',
    keywords: ['facs', 'cell sorter', 'sorting', 'fluorescence activated cell sorting', 'droplet', 'flow cytometry'],
    secondary: TEAL,
    body: `
<rect x="30" y="4" width="40" height="14" rx="3" fill="#PRIMARY"/>
<polygon points="40,18 60,18 54,32 46,32" fill="#9ca3af"/>
<line x1="50" y1="32" x2="50" y2="48" stroke="#SECONDARY" stroke-width="3"/>
<rect x="22" y="46" width="5" height="22" fill="#374151"/><rect x="73" y="46" width="5" height="22" fill="#374151"/>
<path d="M27 74 H39 V86 A6 6 0 0 1 27 86 Z" fill="#ffffff"/>
<path d="M61 74 H73 V86 A6 6 0 0 1 61 86 Z" fill="#ffffff"/>
<path d="M44 78 H56 V88 A6 6 0 0 1 44 88 Z" fill="#e5e7eb"/>
<circle cx="45" cy="54" r="3" fill="#SECONDARY" stroke-width="1.5"/><circle cx="40" cy="62" r="3" fill="#SECONDARY" stroke-width="1.5"/><circle cx="35" cy="70" r="3" fill="#SECONDARY" stroke-width="1.5"/>
<circle cx="55" cy="54" r="3" fill="#SECONDARY" stroke-width="1.5"/><circle cx="60" cy="62" r="3" fill="#SECONDARY" stroke-width="1.5"/><circle cx="65" cy="70" r="3" fill="#SECONDARY" stroke-width="1.5"/>
<circle cx="50" cy="58" r="3" fill="#9ca3af" stroke-width="1.5"/><circle cx="50" cy="68" r="3" fill="#9ca3af" stroke-width="1.5"/>`,
  }),
  inst({
    id: 'thermocycler',
    name: 'Thermocycler',
    keywords: ['thermocycler', 'pcr machine', 'pcr', 'thermal cycler', 'amplification'],
    body: `
<path d="M22 44 L26 8 H74 L78 44 Z" fill="#PRIMARY"/>
<rect x="30" y="14" width="40" height="22" rx="2" fill="#6b7280"/>
<rect x="8" y="52" width="84" height="40" rx="4" fill="#PRIMARY"/>
<rect x="20" y="42" width="60" height="12" rx="1" fill="#9ca3af"/>
<circle cx="30" cy="48" r="2.5" fill="#374151" stroke="none"/><circle cx="38" cy="48" r="2.5" fill="#374151" stroke="none"/><circle cx="46" cy="48" r="2.5" fill="#374151" stroke="none"/><circle cx="54" cy="48" r="2.5" fill="#374151" stroke="none"/><circle cx="62" cy="48" r="2.5" fill="#374151" stroke="none"/><circle cx="70" cy="48" r="2.5" fill="#374151" stroke="none"/>
<rect x="16" y="62" width="34" height="20" rx="2" fill="#SECONDARY"/>
<circle cx="62" cy="68" r="3" fill="#374151"/><circle cx="72" cy="68" r="3" fill="#374151"/><circle cx="82" cy="68" r="3" fill="#374151"/>
<circle cx="62" cy="78" r="3" fill="#374151"/><circle cx="72" cy="78" r="3" fill="#374151"/><circle cx="82" cy="78" r="3" fill="#374151"/>`,
  }),
  inst({
    id: 'qpcr-machine',
    name: 'qPCR machine',
    keywords: ['qpcr', 'real-time pcr', 'rt-qpcr', 'quantitative pcr', 'amplification curve', 'pcr'],
    body: `
<rect x="8" y="10" width="84" height="76" rx="5" fill="#PRIMARY"/>
<rect x="16" y="18" width="46" height="30" rx="2" fill="#SECONDARY"/>
<polyline points="20,44 30,43 36,40 40,32 44,24 50,22 58,21" fill="none" stroke="#ffffff" stroke-width="2"/>
<polyline points="20,44 36,43 42,40 46,32 50,26 58,24" fill="none" stroke="#ffffff" stroke-width="2" stroke-opacity="0.6"/>
<circle cx="72" cy="24" r="3" fill="#374151"/><circle cx="82" cy="24" r="3" fill="#374151"/><circle cx="72" cy="36" r="3" fill="#374151"/><circle cx="82" cy="36" r="3" fill="#374151"/>
<rect x="16" y="60" width="68" height="16" rx="2" fill="#e5e7eb"/>
<circle cx="24" cy="65" r="1.8" fill="#374151" stroke="none"/><circle cx="32" cy="65" r="1.8" fill="#374151" stroke="none"/><circle cx="40" cy="65" r="1.8" fill="#374151" stroke="none"/><circle cx="48" cy="65" r="1.8" fill="#374151" stroke="none"/><circle cx="56" cy="65" r="1.8" fill="#374151" stroke="none"/><circle cx="64" cy="65" r="1.8" fill="#374151" stroke="none"/><circle cx="72" cy="65" r="1.8" fill="#374151" stroke="none"/>
<circle cx="24" cy="71" r="1.8" fill="#374151" stroke="none"/><circle cx="32" cy="71" r="1.8" fill="#374151" stroke="none"/><circle cx="40" cy="71" r="1.8" fill="#374151" stroke="none"/><circle cx="48" cy="71" r="1.8" fill="#374151" stroke="none"/><circle cx="56" cy="71" r="1.8" fill="#374151" stroke="none"/><circle cx="64" cy="71" r="1.8" fill="#374151" stroke="none"/><circle cx="72" cy="71" r="1.8" fill="#374151" stroke="none"/>`,
  }),
  inst({
    id: 'centrifuge',
    name: 'Centrifuge',
    keywords: ['centrifuge', 'rotor', 'spin', 'benchtop centrifuge', 'top view'],
    body: `
<rect x="6" y="6" width="88" height="88" rx="14" fill="#PRIMARY"/>
<circle cx="50" cy="44" r="30" fill="#6b7280"/>
<circle cx="50" cy="44" r="22" fill="#9ca3af"/>
<circle cx="64" cy="44" r="5" fill="#374151"/><circle cx="57" cy="56.1" r="5" fill="#374151"/><circle cx="43" cy="56.1" r="5" fill="#374151"/><circle cx="36" cy="44" r="5" fill="#374151"/><circle cx="43" cy="31.9" r="5" fill="#374151"/><circle cx="57" cy="31.9" r="5" fill="#374151"/>
<circle cx="50" cy="44" r="4" fill="#374151"/>
<rect x="18" y="80" width="48" height="8" rx="2" fill="#SECONDARY"/>
<circle cx="80" cy="84" r="4" fill="#374151"/>`,
  }),
  inst({
    id: 'microcentrifuge',
    name: 'Microcentrifuge',
    keywords: ['microcentrifuge', 'microfuge', 'minifuge', 'eppendorf centrifuge', 'spin'],
    body: `
<rect x="42" y="20" width="16" height="6" rx="3" fill="#6b7280"/>
<path d="M14 54 A36 30 0 0 1 86 54 Z" fill="#e5e7eb"/>
<path d="M24 54 A26 20 0 0 1 76 54 Z" fill="#ffffff" fill-opacity="0.6" stroke="none"/>
<rect x="8" y="54" width="84" height="34" rx="6" fill="#PRIMARY"/>
<rect x="18" y="62" width="28" height="14" rx="2" fill="#SECONDARY"/>
<circle cx="60" cy="69" r="4" fill="#374151"/><circle cx="76" cy="69" r="4" fill="#374151"/>`,
  }),
  inst({
    id: 'co2-incubator',
    name: 'CO2 incubator',
    keywords: ['incubator', 'co2 incubator', 'cell culture', '37c', 'humidified', 'cabinet'],
    body: `
<rect x="16" y="4" width="68" height="92" rx="4" fill="#PRIMARY"/>
<rect x="22" y="10" width="24" height="8" rx="1" fill="#SECONDARY"/>
<circle cx="72" cy="14" r="3" fill="#374151"/>
<rect x="22" y="24" width="56" height="64" rx="2" fill="#e5e7eb"/>
<line x1="26" y1="40" x2="74" y2="40" stroke="#6b7280" stroke-width="2"/><line x1="26" y1="56" x2="74" y2="56" stroke="#6b7280" stroke-width="2"/><line x1="26" y1="72" x2="74" y2="72" stroke="#6b7280" stroke-width="2"/>
<rect x="34" y="35" width="16" height="5" fill="#ffffff" stroke-width="2"/><rect x="44" y="51" width="16" height="5" fill="#ffffff" stroke-width="2"/><rect x="30" y="67" width="16" height="5" fill="#ffffff" stroke-width="2"/>
<rect x="24" y="26" width="52" height="60" fill="#ffffff" fill-opacity="0.35" stroke="none"/>
<rect x="72" y="46" width="4" height="20" rx="2" fill="#374151"/>`,
  }),
  inst({
    id: 'biosafety-cabinet',
    name: 'Biosafety cabinet',
    keywords: ['biosafety cabinet', 'bsc', 'laminar flow hood', 'tissue culture hood', 'sterile hood', 'class ii'],
    body: `
<rect x="6" y="6" width="88" height="62" rx="4" fill="#PRIMARY"/>
<rect x="12" y="10" width="76" height="6" rx="1" fill="#9ca3af"/>
<rect x="12" y="20" width="76" height="40" rx="2" fill="#e5e7eb"/>
<rect x="12" y="52" width="76" height="8" fill="#9ca3af"/>
<rect x="12" y="20" width="76" height="24" fill="#SECONDARY" fill-opacity="0.35" stroke="none"/>
<rect x="10" y="42" width="80" height="5" rx="1" fill="#6b7280"/>
<rect x="12" y="68" width="8" height="26" fill="#6b7280"/><rect x="80" y="68" width="8" height="26" fill="#6b7280"/>
<line x1="20" y1="84" x2="80" y2="84" stroke="#6b7280" stroke-width="3"/>`,
  }),
  inst({
    id: 'sequencer',
    name: 'Sequencer',
    keywords: ['sequencer', 'ngs', 'next generation sequencing', 'illumina', 'dna sequencing', 'rna-seq'],
    body: `
<rect x="14" y="4" width="72" height="92" rx="8" fill="#PRIMARY"/>
<rect x="22" y="12" width="56" height="38" rx="3" fill="#SECONDARY"/>
<line x1="28" y1="22" x2="56" y2="22" stroke="#ffffff" stroke-width="3"/><line x1="28" y1="31" x2="66" y2="31" stroke="#ffffff" stroke-width="3"/><line x1="28" y1="40" x2="48" y2="40" stroke="#ffffff" stroke-width="3"/>
<rect x="22" y="58" width="56" height="28" rx="3" fill="#e5e7eb"/>
<circle cx="50" cy="72" r="3" fill="#374151"/>`,
  }),
  inst({
    id: 'nanopore-sequencer',
    name: 'Nanopore sequencer',
    keywords: ['nanopore', 'minion', 'oxford nanopore', 'long read', 'usb sequencer', 'portable sequencer'],
    w: 100,
    h: 50,
    body: `
<rect x="4" y="9" width="64" height="32" rx="6" fill="#PRIMARY"/>
<rect x="12" y="15" width="34" height="20" rx="2" fill="#SECONDARY"/>
<circle cx="18" cy="20" r="1.5" fill="#ffffff" stroke="none"/><circle cx="26" cy="20" r="1.5" fill="#ffffff" stroke="none"/><circle cx="34" cy="20" r="1.5" fill="#ffffff" stroke="none"/><circle cx="42" cy="20" r="1.5" fill="#ffffff" stroke="none"/>
<circle cx="18" cy="25" r="1.5" fill="#ffffff" stroke="none"/><circle cx="26" cy="25" r="1.5" fill="#ffffff" stroke="none"/><circle cx="34" cy="25" r="1.5" fill="#ffffff" stroke="none"/><circle cx="42" cy="25" r="1.5" fill="#ffffff" stroke="none"/>
<circle cx="18" cy="30" r="1.5" fill="#ffffff" stroke="none"/><circle cx="26" cy="30" r="1.5" fill="#ffffff" stroke="none"/><circle cx="34" cy="30" r="1.5" fill="#ffffff" stroke="none"/><circle cx="42" cy="30" r="1.5" fill="#ffffff" stroke="none"/>
<circle cx="56" cy="25" r="3" fill="#374151"/>
<rect x="68" y="16" width="28" height="18" fill="#9ca3af"/>
<rect x="76" y="20" width="14" height="3" fill="#374151" stroke="none"/><rect x="76" y="27" width="14" height="3" fill="#374151" stroke="none"/>`,
  }),
  inst({
    id: 'plate-reader',
    name: 'Plate reader',
    keywords: ['plate reader', 'microplate reader', 'absorbance', 'elisa reader', 'spectrophotometer', 'multimode'],
    body: `
<rect x="6" y="14" width="88" height="68" rx="5" fill="#PRIMARY"/>
<rect x="6" y="14" width="88" height="10" rx="5" fill="#9ca3af"/>
<rect x="60" y="32" width="26" height="18" rx="2" fill="#SECONDARY"/>
<rect x="12" y="58" width="56" height="18" fill="#374151"/>
<rect x="16" y="62" width="48" height="12" fill="#e5e7eb"/>
<circle cx="22" cy="66" r="1.6" fill="#6b7280" stroke="none"/><circle cx="30" cy="66" r="1.6" fill="#6b7280" stroke="none"/><circle cx="38" cy="66" r="1.6" fill="#6b7280" stroke="none"/><circle cx="46" cy="66" r="1.6" fill="#6b7280" stroke="none"/><circle cx="54" cy="66" r="1.6" fill="#6b7280" stroke="none"/><circle cx="62" cy="66" r="1.6" fill="#6b7280" stroke="none"/>
<circle cx="22" cy="70" r="1.6" fill="#6b7280" stroke="none"/><circle cx="30" cy="70" r="1.6" fill="#6b7280" stroke="none"/><circle cx="38" cy="70" r="1.6" fill="#6b7280" stroke="none"/><circle cx="46" cy="70" r="1.6" fill="#6b7280" stroke="none"/><circle cx="54" cy="70" r="1.6" fill="#6b7280" stroke="none"/><circle cx="62" cy="70" r="1.6" fill="#6b7280" stroke="none"/>
<circle cx="74" cy="64" r="3" fill="#374151"/><circle cx="84" cy="64" r="3" fill="#374151"/>`,
  }),
  inst({
    id: 'bioreactor',
    name: 'Bioreactor',
    keywords: ['bioreactor', 'fermenter', 'stirred tank', 'impeller', 'culture vessel', 'scale-up'],
    secondary: TEAL,
    body: `
<rect x="18" y="82" width="64" height="8" rx="2" fill="#PRIMARY"/>
<path d="M26 24 H74 V70 A24 12 0 0 1 26 70 Z" fill="#ffffff"/>
<path d="M26 44 H74 V70 A24 12 0 0 1 26 70 Z" fill="#SECONDARY" stroke="none"/>
<line x1="50" y1="26" x2="50" y2="66" stroke="#374151" stroke-width="3"/>
<rect x="38" y="58" width="24" height="5" fill="#374151"/><rect x="38" y="44" width="24" height="5" fill="#374151"/>
<circle cx="34" cy="64" r="2" fill="#ffffff" stroke="none"/><circle cx="40" cy="54" r="2" fill="#ffffff" stroke="none"/><circle cx="64" cy="60" r="2" fill="#ffffff" stroke="none"/><circle cx="66" cy="50" r="2" fill="#ffffff" stroke="none"/>
<rect x="20" y="14" width="60" height="12" rx="2" fill="#PRIMARY"/>
<rect x="30" y="4" width="6" height="10" fill="#6b7280"/><rect x="60" y="4" width="6" height="10" fill="#6b7280"/><rect x="46" y="4" width="8" height="10" fill="#374151"/>`,
  }),
  inst({
    id: 'mass-spectrometer',
    name: 'Mass spectrometer',
    keywords: ['mass spectrometer', 'mass spec', 'ms', 'lc-ms', 'proteomics', 'metabolomics'],
    w: 120,
    h: 80,
    body: `
<rect x="30" y="12" width="86" height="56" rx="4" fill="#PRIMARY"/>
<rect x="4" y="30" width="30" height="26" rx="3" fill="#9ca3af"/>
<polygon points="12,38 28,43 12,48" fill="#374151"/>
<rect x="40" y="20" width="40" height="22" rx="2" fill="#SECONDARY"/>
<line x1="46" y1="38" x2="46" y2="30" stroke="#ffffff" stroke-width="2"/><line x1="52" y1="38" x2="52" y2="24" stroke="#ffffff" stroke-width="2"/><line x1="58" y1="38" x2="58" y2="34" stroke="#ffffff" stroke-width="2"/><line x1="64" y1="38" x2="64" y2="27" stroke="#ffffff" stroke-width="2"/><line x1="70" y1="38" x2="70" y2="33" stroke="#ffffff" stroke-width="2"/>
<rect x="88" y="20" width="20" height="40" rx="2" fill="#6b7280"/>
<line x1="92" y1="28" x2="104" y2="28" stroke="#374151" stroke-width="2"/><line x1="92" y1="34" x2="104" y2="34" stroke="#374151" stroke-width="2"/><line x1="92" y1="40" x2="104" y2="40" stroke="#374151" stroke-width="2"/>
<rect x="36" y="68" width="10" height="6" fill="#374151"/><rect x="100" y="68" width="10" height="6" fill="#374151"/>`,
  }),
  inst({
    id: 'electroporator',
    name: 'Electroporator',
    keywords: ['electroporator', 'electroporation', 'transfection', 'cuvette', 'pulse', 'nucleofector'],
    body: `
<rect x="8" y="26" width="84" height="62" rx="5" fill="#PRIMARY"/>
<rect x="16" y="36" width="40" height="24" rx="2" fill="#SECONDARY"/>
<polygon points="40,38 30,50 37,50 33,60 46,46 39,46" fill="#ffffff" stroke="none"/>
<circle cx="70" cy="46" r="5" fill="#374151"/><circle cx="84" cy="46" r="5" fill="#374151"/>
<circle cx="66" cy="72" r="3.5" fill="#374151"/><circle cx="76" cy="72" r="3.5" fill="#374151"/><circle cx="86" cy="72" r="3.5" fill="#374151"/>
<rect x="66" y="8" width="12" height="20" fill="#ffffff"/>
<rect x="68" y="18" width="8" height="10" fill="#SECONDARY" stroke="none"/>
<rect x="64" y="4" width="16" height="5" rx="1" fill="#6b7280"/>`,
  }),
  inst({
    id: 'freezer-minus-80',
    name: '-80 °C freezer',
    keywords: ['freezer', '-80', 'minus 80', 'ultra low freezer', 'ult', 'upright freezer', 'storage'],
    w: 80,
    h: 100,
    body: `
<rect x="10" y="4" width="60" height="92" rx="4" fill="#PRIMARY"/>
<rect x="16" y="10" width="24" height="8" rx="1" fill="#SECONDARY"/>
<rect x="16" y="24" width="48" height="66" rx="2" fill="#e5e7eb"/>
<rect x="56" y="40" width="4" height="30" rx="2" fill="#374151"/>
<line x1="34" y1="46" x2="34" y2="66" stroke="#6b7280"/><line x1="25.3" y1="51" x2="42.7" y2="61" stroke="#6b7280"/><line x1="25.3" y1="61" x2="42.7" y2="51" stroke="#6b7280"/>`,
  }),
  inst({
    id: 'liquid-nitrogen-dewar',
    name: 'Liquid nitrogen dewar',
    keywords: ['dewar', 'liquid nitrogen', 'ln2', 'cryogenic', 'cryostorage', 'cryopreservation', 'tank'],
    body: `
<rect x="36" y="4" width="28" height="8" rx="3" fill="#374151"/>
<rect x="40" y="10" width="20" height="14" fill="#9ca3af"/>
<path d="M22 36 Q22 22 36 22 H64 Q78 22 78 36 V86 Q78 94 70 94 H30 Q22 94 22 86 Z" fill="#PRIMARY"/>
<rect x="22" y="50" width="56" height="12" fill="#SECONDARY" stroke="none"/>
<path d="M30 18 Q26 12 30 6" fill="none" stroke="#9ca3af"/><path d="M70 18 Q74 12 70 6" fill="none" stroke="#9ca3af"/>`,
  }),
  inst({
    id: 'water-bath',
    name: 'Water bath',
    keywords: ['water bath', 'bath', '37c', 'thawing', 'heating', 'incubation'],
    w: 100,
    h: 70,
    secondary: TEAL,
    body: `
<rect x="4" y="16" width="92" height="48" rx="5" fill="#PRIMARY"/>
<rect x="12" y="24" width="54" height="22" rx="2" fill="#SECONDARY"/>
<path d="M16 32 Q22 28 28 32 T40 32 T52 32 T62 32" fill="none" stroke="#ffffff" stroke-width="2"/>
<rect x="24" y="8" width="7" height="28" rx="2" fill="#ffffff"/><rect x="36" y="8" width="7" height="28" rx="2" fill="#ffffff"/>
<rect x="72" y="24" width="18" height="22" rx="2" fill="#6b7280"/>
<circle cx="81" cy="31" r="3" fill="#9ca3af"/>
<rect x="76" y="39" width="10" height="4" fill="#9ca3af" stroke="none"/>`,
  }),
  inst({
    id: 'orbital-shaker',
    name: 'Orbital shaker',
    keywords: ['shaker', 'orbital shaker', 'shaking incubator', 'flask', 'culture', 'agitation'],
    w: 100,
    h: 80,
    secondary: TEAL,
    body: `
<rect x="6" y="52" width="88" height="22" rx="5" fill="#PRIMARY"/>
<rect x="12" y="42" width="76" height="10" rx="2" fill="#6b7280"/>
<path d="M22 42 L29 24 V14 H37 V24 L44 42 Z" fill="#ffffff"/>
<polygon points="22.6,41.5 25.1,34 40.9,34 43.4,41.5" fill="#SECONDARY" stroke="none"/>
<path d="M56 42 L63 24 V14 H71 V24 L78 42 Z" fill="#ffffff"/>
<polygon points="56.6,41.5 59.1,34 74.9,34 77.4,41.5" fill="#SECONDARY" stroke="none"/>
<rect x="64" y="58" width="24" height="10" rx="2" fill="#374151"/>
<circle cx="18" cy="63" r="3.5" fill="#374151"/>`,
  }),
  inst({
    id: 'nanodrop-spectrophotometer',
    name: 'NanoDrop spectrophotometer',
    keywords: ['nanodrop', 'spectrophotometer', 'microvolume', 'dna quantification', 'rna quantification', 'a260'],
    body: `
<rect x="57" y="6" width="16" height="34" rx="4" transform="rotate(30 65 40)" fill="#9ca3af"/>
<rect x="12" y="46" width="76" height="44" rx="5" fill="#PRIMARY"/>
<rect x="20" y="54" width="30" height="20" rx="2" fill="#SECONDARY"/>
<rect x="60" y="38" width="12" height="8" fill="#374151"/>
<circle cx="66" cy="34" r="3.5" fill="#SECONDARY" stroke-width="1.5"/>
<circle cx="62" cy="80" r="3" fill="#374151"/><circle cx="74" cy="80" r="3" fill="#374151"/>`,
  }),
  inst({
    id: 'gel-electrophoresis-rig',
    name: 'Gel electrophoresis rig',
    keywords: ['gel electrophoresis', 'agarose gel', 'gel box', 'gel tank', 'dna gel', 'electrophoresis'],
    w: 100,
    h: 70,
    body: `
<rect x="12" y="4" width="6" height="12" rx="1" fill="#374151"/><rect x="82" y="4" width="6" height="12" rx="1" fill="#374151"/>
<rect x="6" y="14" width="88" height="50" rx="5" fill="#PRIMARY"/>
<rect x="12" y="20" width="76" height="38" rx="2" fill="#SECONDARY"/>
<rect x="24" y="26" width="52" height="26" rx="1" fill="#e5e7eb"/>
<rect x="27" y="29" width="4" height="3" fill="#374151" stroke="none"/><rect x="35" y="29" width="4" height="3" fill="#374151" stroke="none"/><rect x="43" y="29" width="4" height="3" fill="#374151" stroke="none"/><rect x="51" y="29" width="4" height="3" fill="#374151" stroke="none"/><rect x="59" y="29" width="4" height="3" fill="#374151" stroke="none"/><rect x="67" y="29" width="4" height="3" fill="#374151" stroke="none"/>
<line x1="27" y1="38" x2="31" y2="38" stroke="#6b7280" stroke-width="2"/><line x1="35" y1="42" x2="39" y2="42" stroke="#6b7280" stroke-width="2"/><line x1="43" y1="36" x2="47" y2="36" stroke="#6b7280" stroke-width="2"/><line x1="51" y1="44" x2="55" y2="44" stroke="#6b7280" stroke-width="2"/><line x1="59" y1="40" x2="63" y2="40" stroke="#6b7280" stroke-width="2"/><line x1="67" y1="46" x2="71" y2="46" stroke="#6b7280" stroke-width="2"/>`,
  }),
  inst({
    id: 'gel-imager',
    name: 'Gel imager',
    keywords: ['gel imager', 'gel doc', 'imaging system', 'uv transilluminator', 'chemidoc', 'blot imager'],
    body: `
<rect x="36" y="6" width="28" height="18" rx="3" fill="#374151"/>
<circle cx="50" cy="12" r="4" fill="#9ca3af"/>
<rect x="12" y="22" width="76" height="72" rx="5" fill="#PRIMARY"/>
<rect x="20" y="30" width="60" height="44" rx="2" fill="#374151"/>
<rect x="32" y="42" width="36" height="20" rx="1" fill="#SECONDARY"/>
<line x1="36" y1="48" x2="42" y2="48" stroke="#ffffff" stroke-width="2"/><line x1="46" y1="52" x2="52" y2="52" stroke="#ffffff" stroke-width="2"/><line x1="56" y1="47" x2="62" y2="47" stroke="#ffffff" stroke-width="2"/><line x1="36" y1="56" x2="42" y2="56" stroke="#ffffff" stroke-width="2"/><line x1="56" y1="56" x2="62" y2="56" stroke="#ffffff" stroke-width="2"/>
<rect x="20" y="80" width="60" height="6" rx="1" fill="#6b7280"/>`,
  }),
  inst({
    id: 'western-blot-transfer',
    name: 'Western blot transfer',
    keywords: ['western blot', 'transfer', 'wet transfer', 'blotting', 'membrane', 'transfer tank', 'cassette'],
    body: `
<rect x="22" y="4" width="8" height="12" rx="1" fill="#374151"/><rect x="70" y="4" width="8" height="12" rx="1" fill="#374151"/>
<rect x="10" y="14" width="80" height="78" rx="5" fill="#PRIMARY"/>
<rect x="18" y="22" width="64" height="62" rx="2" fill="#SECONDARY"/>
<rect x="36" y="28" width="28" height="50" rx="1" fill="#374151"/>
<rect x="41" y="32" width="8" height="42" fill="#e5e7eb"/>
<rect x="51" y="32" width="8" height="42" fill="#ffffff"/>`,
  }),
  inst({
    id: 'automated-cell-counter',
    name: 'Automated cell counter',
    keywords: ['cell counter', 'automated cell counter', 'countess', 'viability', 'trypan blue', 'counting slide'],
    body: `
<rect x="10" y="12" width="72" height="76" rx="6" fill="#PRIMARY"/>
<rect x="18" y="20" width="56" height="36" rx="3" fill="#SECONDARY"/>
<circle cx="30" cy="30" r="3" fill="#ffffff" stroke="none"/><circle cx="44" cy="28" r="3" fill="#ffffff" stroke="none"/><circle cx="58" cy="34" r="3" fill="#ffffff" stroke="none"/><circle cx="36" cy="44" r="3" fill="#ffffff" stroke="none"/><circle cx="52" cy="46" r="3" fill="#ffffff" stroke="none"/><circle cx="66" cy="26" r="3" fill="#ffffff" stroke="none"/>
<rect x="18" y="64" width="40" height="7" rx="1" fill="#374151"/>
<rect x="48" y="65" width="44" height="5" fill="#ffffff" stroke-width="2"/>
<circle cx="72" cy="78" r="3.5" fill="#374151"/>`,
  }),
  inst({
    id: 'liquid-handling-robot',
    name: 'Liquid handling robot',
    keywords: ['liquid handler', 'liquid handling robot', 'automation', 'pipetting robot', 'opentrons', 'hamilton', 'tecan'],
    w: 120,
    h: 90,
    body: `
<rect x="8" y="10" width="10" height="52" fill="#9ca3af"/><rect x="102" y="10" width="10" height="52" fill="#9ca3af"/>
<rect x="4" y="62" width="112" height="16" rx="3" fill="#PRIMARY"/>
<rect x="8" y="10" width="104" height="10" rx="2" fill="#PRIMARY"/>
<rect x="22" y="50" width="30" height="12" rx="1" fill="#SECONDARY"/>
<circle cx="28" cy="56" r="1.6" fill="#ffffff" stroke="none"/><circle cx="34" cy="56" r="1.6" fill="#ffffff" stroke="none"/><circle cx="40" cy="56" r="1.6" fill="#ffffff" stroke="none"/><circle cx="46" cy="56" r="1.6" fill="#ffffff" stroke="none"/>
<rect x="66" y="50" width="30" height="12" rx="1" fill="#e5e7eb"/>
<circle cx="72" cy="56" r="1.6" fill="#6b7280" stroke="none"/><circle cx="78" cy="56" r="1.6" fill="#6b7280" stroke="none"/><circle cx="84" cy="56" r="1.6" fill="#6b7280" stroke="none"/><circle cx="90" cy="56" r="1.6" fill="#6b7280" stroke="none"/>
<rect x="38" y="18" width="18" height="24" rx="2" fill="#374151"/>
<polygon points="40,42 44,42 42,50" fill="#ffffff" stroke-width="1.5"/><polygon points="45,42 49,42 47,50" fill="#ffffff" stroke-width="1.5"/><polygon points="50,42 54,42 52,50" fill="#ffffff" stroke-width="1.5"/>`,
  }),
  inst({
    id: 'computer-workstation',
    name: 'Computer workstation',
    keywords: ['computer', 'workstation', 'monitor', 'keyboard', 'analysis', 'bioinformatics', 'desktop'],
    w: 100,
    h: 90,
    body: `
<rect x="8" y="4" width="84" height="54" rx="4" fill="#PRIMARY"/>
<rect x="14" y="10" width="72" height="40" rx="2" fill="#SECONDARY"/>
<polyline points="20,42 32,34 42,38 54,24 66,30 80,18" fill="none" stroke="#ffffff" stroke-width="2.5"/>
<rect x="42" y="58" width="16" height="8" fill="#9ca3af"/>
<rect x="28" y="66" width="44" height="5" rx="2" fill="#9ca3af"/>
<rect x="10" y="76" width="80" height="12" rx="3" fill="#PRIMARY"/>
<line x1="18" y1="80" x2="82" y2="80" stroke="#6b7280" stroke-width="2" stroke-dasharray="4 2"/><line x1="18" y1="84" x2="82" y2="84" stroke="#6b7280" stroke-width="2" stroke-dasharray="4 2"/>`,
  }),
  inst({
    id: 'server-rack',
    name: 'Server rack',
    keywords: ['server', 'server rack', 'hpc', 'cluster', 'compute', 'data center', 'storage'],
    w: 70,
    h: 100,
    body: `
<rect x="6" y="4" width="58" height="92" rx="4" fill="#PRIMARY"/>
${[10, 27, 44, 61, 78]
  .map(
    (y) =>
      `<rect x="12" y="${y}" width="46" height="13" rx="1" fill="#374151"/><line x1="16" y1="${y + 4.5}" x2="42" y2="${y + 4.5}" stroke="#6b7280" stroke-width="2"/><line x1="16" y1="${y + 8.5}" x2="42" y2="${y + 8.5}" stroke="#6b7280" stroke-width="2"/><circle cx="52" cy="${y + 6.5}" r="2" fill="#SECONDARY" stroke="none"/>`,
  )
  .join('')}`,
  }),
  inst({
    id: 'microplate-washer',
    name: 'Microplate washer',
    keywords: ['plate washer', 'microplate washer', 'elisa washer', 'wash', 'manifold', 'aspirate'],
    body: `
<rect x="70" y="8" width="14" height="36" fill="#9ca3af"/>
<rect x="14" y="8" width="64" height="10" rx="2" fill="#6b7280"/>
<line x1="22" y1="18" x2="22" y2="26" stroke="#374151"/><line x1="32" y1="18" x2="32" y2="26" stroke="#374151"/><line x1="42" y1="18" x2="42" y2="26" stroke="#374151"/><line x1="52" y1="18" x2="52" y2="26" stroke="#374151"/><line x1="62" y1="18" x2="62" y2="26" stroke="#374151"/>
<circle cx="22" cy="30" r="2" fill="#SECONDARY" stroke="none"/><circle cx="32" cy="30" r="2" fill="#SECONDARY" stroke="none"/><circle cx="42" cy="30" r="2" fill="#SECONDARY" stroke="none"/><circle cx="52" cy="30" r="2" fill="#SECONDARY" stroke="none"/><circle cx="62" cy="30" r="2" fill="#SECONDARY" stroke="none"/>
<rect x="6" y="42" width="88" height="46" rx="5" fill="#PRIMARY"/>
<rect x="14" y="34" width="60" height="12" rx="1" fill="#ffffff"/>
<circle cx="22" cy="40" r="2" fill="#9ca3af" stroke="none"/><circle cx="32" cy="40" r="2" fill="#9ca3af" stroke="none"/><circle cx="42" cy="40" r="2" fill="#9ca3af" stroke="none"/><circle cx="52" cy="40" r="2" fill="#9ca3af" stroke="none"/><circle cx="62" cy="40" r="2" fill="#9ca3af" stroke="none"/>
<rect x="14" y="60" width="24" height="8" rx="1" fill="#SECONDARY"/>
<circle cx="56" cy="64" r="3" fill="#374151"/><circle cx="66" cy="64" r="3" fill="#374151"/><circle cx="76" cy="64" r="3" fill="#374151"/>`,
  }),
  inst({
    id: 'patch-clamp-rig',
    name: 'Patch clamp rig',
    keywords: ['patch clamp', 'electrophysiology', 'ephys', 'micromanipulator', 'recording', 'pipette', 'rig'],
    body: `
<rect x="6" y="86" width="88" height="8" rx="2" fill="#PRIMARY"/>
<rect x="60" y="14" width="12" height="72" fill="#PRIMARY"/>
<rect x="44" y="18" width="30" height="10" rx="2" fill="#374151"/>
<rect x="48" y="28" width="8" height="14" fill="#374151"/>
<rect x="18" y="62" width="54" height="6" rx="1" fill="#9ca3af"/>
<rect x="28" y="56" width="28" height="6" fill="#ffffff"/>
<rect x="6" y="36" width="16" height="12" rx="2" fill="#6b7280"/>
<polygon points="22,40 22,46 46,58" fill="#ffffff"/>
<rect x="74" y="36" width="20" height="14" rx="2" fill="#SECONDARY"/>
<polyline points="76,46 80,46 82,40 84,46 88,46 90,43 92,43" fill="none" stroke="#ffffff" stroke-width="2"/>`,
  }),
  inst({
    id: 'chip-organ-on-chip',
    name: 'Organ-on-chip',
    keywords: ['organ on chip', 'microfluidic chip', 'microfluidics', 'lab on a chip', 'ooc', 'device', 'channel'],
    w: 100,
    h: 60,
    secondary: TEAL,
    body: `
<rect x="4" y="6" width="92" height="48" rx="8" fill="#PRIMARY"/>
<rect x="30" y="20" width="40" height="20" rx="3" fill="#ffffff"/>
<line x1="14" y1="26" x2="86" y2="26" stroke="#SECONDARY" stroke-width="5"/>
<line x1="14" y1="34" x2="86" y2="34" stroke="#9ca3af" stroke-width="5"/>
<circle cx="14" cy="26" r="3.5" fill="#374151"/><circle cx="86" cy="26" r="3.5" fill="#374151"/><circle cx="14" cy="34" r="3.5" fill="#374151"/><circle cx="86" cy="34" r="3.5" fill="#374151"/>`,
  }),
  inst({
    id: 'ultracentrifuge',
    name: 'Ultracentrifuge',
    keywords: ['ultracentrifuge', 'floor centrifuge', 'high speed', 'density gradient', 'exosome', 'pelleting'],
    body: `
<rect x="10" y="8" width="80" height="86" rx="5" fill="#PRIMARY"/>
<circle cx="50" cy="34" r="20" fill="#9ca3af"/>
<circle cx="50" cy="34" r="12" fill="#6b7280"/>
<rect x="46" y="30" width="8" height="8" rx="2" fill="#374151"/>
<rect x="18" y="62" width="64" height="14" rx="2" fill="#SECONDARY"/>
<circle cx="26" cy="85" r="3" fill="#374151"/><circle cx="36" cy="85" r="3" fill="#374151"/><circle cx="46" cy="85" r="3" fill="#374151"/>
<line x1="60" y1="82" x2="80" y2="82" stroke="#9ca3af"/><line x1="60" y1="88" x2="80" y2="88" stroke="#9ca3af"/>`,
  }),
  inst({
    id: 'luminometer',
    name: 'Luminometer',
    keywords: ['luminometer', 'luminescence', 'luciferase', 'reporter assay', 'glow', 'tube luminometer'],
    body: `
<rect x="8" y="34" width="84" height="56" rx="5" fill="#PRIMARY"/>
<rect x="22" y="22" width="30" height="14" rx="2" fill="#374151"/>
<rect x="33" y="6" width="8" height="18" rx="1" fill="#ffffff"/>
<rect x="35" y="16" width="4" height="7" fill="#SECONDARY" stroke="none"/>
<line x1="27" y1="14" x2="31" y2="16" stroke="#SECONDARY" stroke-width="2"/><line x1="47" y1="14" x2="43" y2="16" stroke="#SECONDARY" stroke-width="2"/><line x1="28" y1="6" x2="31" y2="9" stroke="#SECONDARY" stroke-width="2"/><line x1="46" y1="6" x2="43" y2="9" stroke="#SECONDARY" stroke-width="2"/>
<rect x="60" y="44" width="24" height="16" rx="2" fill="#SECONDARY"/>
<circle cx="66" cy="74" r="3.5" fill="#374151"/><circle cx="78" cy="74" r="3.5" fill="#374151"/>`,
  }),
  inst({
    id: 'cryostat-microtome',
    name: 'Cryostat microtome',
    keywords: ['cryostat', 'microtome', 'sectioning', 'frozen section', 'histology', 'tissue slicing'],
    secondary: TEAL,
    body: `
<rect x="6" y="18" width="88" height="72" rx="5" fill="#PRIMARY"/>
<rect x="14" y="26" width="50" height="36" rx="2" fill="#e5e7eb"/>
<rect x="30" y="30" width="22" height="4" fill="#6b7280"/>
<rect x="34" y="34" width="14" height="12" fill="#SECONDARY"/>
<rect x="20" y="46" width="38" height="4" fill="#9ca3af"/>
<rect x="14" y="26" width="50" height="36" fill="#ffffff" fill-opacity="0.4" stroke="none"/>
<circle cx="80" cy="44" r="9" fill="#374151"/>
<circle cx="80" cy="44" r="3" fill="#9ca3af"/>
<rect x="14" y="70" width="36" height="10" rx="2" fill="#6b7280"/>`,
  }),
  inst({
    id: 'pcr-hood',
    name: 'PCR hood',
    keywords: ['pcr hood', 'pcr cabinet', 'uv hood', 'clean bench', 'dead air box', 'pcr workstation'],
    body: `
<rect x="8" y="8" width="84" height="80" rx="4" fill="#PRIMARY"/>
<rect x="16" y="16" width="68" height="62" rx="2" fill="#e5e7eb"/>
<rect x="22" y="19" width="56" height="4" rx="2" fill="#SECONDARY"/>
<rect x="16" y="68" width="68" height="10" fill="#9ca3af"/>
<rect x="26" y="58" width="22" height="10" rx="1" fill="#ffffff"/>
<circle cx="31" cy="63" r="1.8" fill="#374151" stroke="none"/><circle cx="37" cy="63" r="1.8" fill="#374151" stroke="none"/><circle cx="43" cy="63" r="1.8" fill="#374151" stroke="none"/>
<rect x="16" y="44" width="68" height="34" fill="#ffffff" fill-opacity="0.5" stroke="none"/>
<rect x="14" y="42" width="72" height="5" rx="1" fill="#6b7280"/>
<rect x="8" y="88" width="84" height="6" rx="1" fill="#6b7280"/>`,
  }),
]
