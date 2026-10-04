import type { LibraryItem } from '../types'

const NS = 'xmlns="http://www.w3.org/2000/svg"'
const S = 'stroke="#1f2937" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"'
const S2 = 'stroke="#1f2937" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"'
const S1 = 'stroke="#1f2937" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"'

const LIQUID = '#f6c6c6'
const DMEM = '#f4a6a6'
const PLASTIC = '#dbe4ee'
const CAP = '#4b7bb5'

const r1 = (n: number) => Math.round(n * 10) / 10

/** Top-view petri dish: rim ring (#SECONDARY) + plain medium floor (#PRIMARY). */
function petriTop(outer: number, inner: number, dashes: number): string {
  const y = 50 + (outer + inner) / 2
  const marks: string[] = []
  for (let i = 0; i < dashes; i++) {
    const x = 50 + (i - (dashes - 1) / 2) * 6
    marks.push(`<line x1="${r1(x - 1.5)}" y1="${r1(y)}" x2="${r1(x + 1.5)}" y2="${r1(y)}" stroke="#6b7280" stroke-width="2" stroke-linecap="round"/>`)
  }
  return `<svg ${NS} viewBox="0 0 100 100"><circle cx="50" cy="50" r="${outer}" fill="#SECONDARY" ${S}/><circle cx="50" cy="50" r="${inner}" fill="#PRIMARY" ${S2}/>${marks.join('')}</svg>`
}

/** Multi-well plate: lid edge (#SECONDARY) behind a light grey body with a grid of wells (#PRIMARY). */
function wellPlate(cols: number, rows: number, square = false): string {
  const pitch = Math.min(80 / cols, 48 / rows)
  const x0 = 48 - ((cols - 1) * pitch) / 2
  const y0 = 38 - ((rows - 1) * pitch) / 2
  const wells: string[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = r1(x0 + c * pitch)
      const cy = r1(y0 + r * pitch)
      if (square) {
        const s = r1(pitch * 0.72)
        wells.push(`<rect x="${r1(cx - s / 2)}" y="${r1(cy - s / 2)}" width="${s}" height="${s}" rx="0.5" fill="#PRIMARY"/>`)
      } else {
        const rad = r1(pitch * 0.4)
        const sw = pitch > 14 ? S2 : S1
        wells.push(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="#PRIMARY" ${sw}/>`)
      }
    }
  }
  return `<svg ${NS} viewBox="0 0 100 70"><rect x="8" y="4" width="88" height="58" rx="4" fill="#SECONDARY" ${S}/><rect x="4" y="10" width="88" height="56" rx="4" fill="#e5e7eb" ${S}/>${wells.join('')}</svg>`
}

/** Strip of 8 PCR tubes joined by a cap strip. */
function pcrStrip(): string {
  const tubes: string[] = []
  for (let i = 0; i < 8; i++) {
    const cx = r1(10 + i * 11.4)
    const body = `M${r1(cx - 4.5)} 16 H${r1(cx + 4.5)} V36 L${cx} 52 Z`
    tubes.push(`<path d="${body}" fill="#ffffff" ${S2}/>`)
    tubes.push(`<path d="M${r1(cx - 3.4)} 40 H${r1(cx + 3.4)} L${cx} 52 Z" fill="#PRIMARY"/>`)
    tubes.push(`<path d="${body}" fill="none" ${S2}/>`)
    tubes.push(`<rect x="${r1(cx - 5)}" y="8" width="10" height="8" rx="2" fill="#SECONDARY" ${S2}/>`)
  }
  return `<svg ${NS} viewBox="0 0 100 60"><rect x="3" y="11" width="94" height="4" rx="1" fill="#SECONDARY" ${S2}/>${tubes.join('')}</svg>`
}

/** Angled-neck tissue-culture flask (side view). Geometry pre-computed for a 40 degree neck. */
function flask(body: string, medium: string, capX: number, capY: number): string {
  return `<svg ${NS} viewBox="0 0 100 70"><path d="${body}" fill="#ffffff" ${S}/><path d="${medium}" fill="#PRIMARY"/><path d="${body}" fill="none" ${S}/><rect x="-3" y="-8" width="6" height="16" rx="1.5" fill="#SECONDARY" ${S} transform="translate(${capX} ${capY}) rotate(40)"/></svg>`
}

/** Conical centrifuge tube with screw cap. */
function conical(capX: number, capW: number, capH: number, left: number, right: number, shoulderY: number, liquidY: number): string {
  const body = `M${left} ${capH + 4} H${right} V${shoulderY} L25 95 Z`
  const liquid = `M${left} ${liquidY} H${right} V${shoulderY} L25 95 Z`
  const ridges: string[] = []
  const n = Math.round(capW / 6)
  for (let i = 1; i < n; i++) {
    const x = r1(capX + (capW * i) / n)
    ridges.push(`<line x1="${x}" y1="7" x2="${x}" y2="${capH + 1}" stroke="#1f2937" stroke-opacity="0.5" stroke-width="1.5" stroke-linecap="round"/>`)
  }
  const ticks: string[] = []
  for (let y = liquidY - 20; y < shoulderY - 4; y += 10) {
    ticks.push(`<line x1="${right - 6}" y1="${y}" x2="${right - 1}" y2="${y}" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/>`)
  }
  return `<svg ${NS} viewBox="0 0 50 100"><path d="${body}" fill="#ffffff" ${S}/><path d="${liquid}" fill="#PRIMARY"/><path d="${body}" fill="none" ${S}/>${ticks.join('')}<rect x="${capX}" y="4" width="${capW}" height="${capH}" rx="2" fill="#SECONDARY" ${S}/>${ridges.join('')}</svg>`
}

function item(
  id: string,
  name: string,
  keywords: string[],
  width: number,
  height: number,
  primary: string,
  secondary: string | undefined,
  svg: string,
): LibraryItem {
  return { id: `consumables.${id}`, name, category: 'consumables', keywords, width, height, primary, ...(secondary ? { secondary } : {}), svg }
}

export const items: LibraryItem[] = [
  item('petri-dish-top', 'Petri dish (top)', ['petri', 'dish', 'plate', 'culture dish', 'top view', 'medium'], 80, 80, LIQUID, PLASTIC,
    `<svg ${NS} viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#SECONDARY" ${S}/><circle cx="50" cy="50" r="38" fill="#PRIMARY" ${S2}/><path d="M13.6 29 A42 42 0 0 1 29 13.6" fill="none" stroke="#ffffff" stroke-opacity="0.7" stroke-width="3" stroke-linecap="round"/></svg>`),

  item('petri-dish-side', 'Petri dish (side)', ['petri', 'dish', 'side view', 'lid', 'culture dish'], 110, 66, LIQUID, PLASTIC,
    `<svg ${NS} viewBox="0 0 100 60"><path d="M8 24 H82 V44 q0 4-4 4 H12 q-4 0-4-4 Z" fill="#ffffff" ${S}/><path d="M8 36 H82 V44 q0 4-4 4 H12 q-4 0-4-4 Z" fill="#PRIMARY"/><path d="M8 24 H82 V44 q0 4-4 4 H12 q-4 0-4-4 Z" fill="none" ${S}/><path d="M14 24 V16 q0-4 4-4 H88 q4 0 4 4 V24 Z" fill="#SECONDARY" ${S}/></svg>`),

  item('petri-dish-35mm', 'Petri dish 35 mm', ['petri', 'dish', '35mm', '35 mm', 'small dish'], 60, 60, LIQUID, PLASTIC, petriTop(28, 20, 1)),
  item('petri-dish-60mm', 'Petri dish 60 mm', ['petri', 'dish', '60mm', '60 mm'], 76, 76, LIQUID, PLASTIC, petriTop(38, 31, 2)),
  item('petri-dish-100mm', 'Petri dish 100 mm', ['petri', 'dish', '100mm', '100 mm', '10cm', 'large dish'], 92, 92, LIQUID, PLASTIC, petriTop(46, 40, 3)),

  item('well-plate-6', '6-well plate', ['6 well', '6-well', 'plate', 'multiwell', 'well plate'], 110, 77, LIQUID, PLASTIC, wellPlate(3, 2)),
  item('well-plate-12', '12-well plate', ['12 well', '12-well', 'plate', 'multiwell', 'well plate'], 110, 77, LIQUID, PLASTIC, wellPlate(4, 3)),
  item('well-plate-24', '24-well plate', ['24 well', '24-well', 'plate', 'multiwell', 'well plate'], 110, 77, LIQUID, PLASTIC, wellPlate(6, 4)),
  item('well-plate-96', '96-well plate', ['96 well', '96-well', 'plate', 'microplate', 'well plate', 'assay plate'], 110, 77, LIQUID, PLASTIC, wellPlate(12, 8)),
  item('well-plate-384', '384-well plate', ['384 well', '384-well', 'plate', 'microplate', 'well plate', 'high throughput'], 110, 77, LIQUID, PLASTIC, wellPlate(24, 16, true)),

  item('t25-flask', 'T25 flask', ['t25', 'flask', 'tissue culture flask', 'culture flask', '25 cm2'], 100, 70, DMEM, CAP,
    flask('M36 53 H80 q3 0 3-3 V38 q0-3-3-3 H44 L31.7 24.7 L25.9 31.6 L40.2 43.6 Z', 'M39.6 45 H83 V50 q0 3-3 3 H36 Z', 26.5, 26.2)),
  item('t75-flask', 'T75 flask', ['t75', 'flask', 'tissue culture flask', 'culture flask', '75 cm2'], 120, 84, DMEM, CAP,
    flask('M27 56 H89 q3 0 3-3 V35 q0-3-3-3 H35 L21.2 20.4 L15.4 27.3 L31.9 41.2 Z', 'M30.3 46 H92 V53 q0 3-3 3 H27 Z', 16, 21.9)),

  item('conical-tube-15ml', '15 mL conical tube', ['15ml', '15 ml', 'conical', 'falcon', 'centrifuge tube', 'tube'], 40, 80, LIQUID, CAP, conical(13, 24, 12, 16, 34, 72, 52)),
  item('conical-tube-50ml', '50 mL conical tube', ['50ml', '50 ml', 'conical', 'falcon', 'centrifuge tube', 'tube'], 50, 100, LIQUID, CAP, conical(8, 34, 14, 11, 39, 68, 50)),

  item('microcentrifuge-tube', 'Microcentrifuge tube', ['eppendorf', 'microfuge', '1.5ml', '1.5 ml', 'tube', 'snap cap'], 48, 80, LIQUID, CAP,
    `<svg ${NS} viewBox="0 0 60 100"><path d="M22 22 H46 V66 L34 92 L22 66 Z" fill="#ffffff" ${S}/><path d="M22 56 H46 V66 L34 92 L22 66 Z" fill="#PRIMARY"/><path d="M22 22 H46 V66 L34 92 L22 66 Z" fill="none" ${S}/><rect x="9" y="15" width="11" height="7" rx="1.5" fill="#SECONDARY" ${S}/><rect x="19" y="12" width="30" height="10" rx="2" fill="#SECONDARY" ${S}/></svg>`),

  item('pcr-tube', 'PCR tube', ['pcr', 'tube', '0.2ml', '0.2 ml', 'thin wall'], 40, 80, LIQUID, PLASTIC,
    `<svg ${NS} viewBox="0 0 50 100"><path d="M16 20 H34 V58 L25 94 Z" fill="#ffffff" ${S}/><path d="M17.5 64 H32.5 L25 94 Z" fill="#PRIMARY"/><path d="M16 20 H34 V58 L25 94 Z" fill="none" ${S}/><path d="M14 20 V12 q0-5 5-5 H31 q5 0 5 5 V20 Z" fill="#SECONDARY" ${S}/></svg>`),

  item('pcr-strip', 'PCR strip', ['pcr', 'strip', '8 tubes', '8-strip', 'tube strip'], 120, 72, LIQUID, PLASTIC, pcrStrip()),

  item('cryovial', 'Cryovial', ['cryo', 'cryovial', 'cryotube', 'freezing', 'liquid nitrogen', 'vial'], 40, 80, LIQUID, CAP,
    `<svg ${NS} viewBox="0 0 50 100"><path d="M14 25 H36 V86 q0 9-11 9 q-11 0-11-9 Z" fill="#ffffff" ${S}/><path d="M14 52 H36 V86 q0 9-11 9 q-11 0-11-9 Z" fill="#PRIMARY"/><path d="M14 25 H36 V86 q0 9-11 9 q-11 0-11-9 Z" fill="none" ${S}/><rect x="17" y="31" width="16" height="14" rx="1" fill="#ffffff" stroke="#6b7280" stroke-width="1.5"/><rect x="10" y="5" width="30" height="20" rx="2.5" fill="#SECONDARY" ${S}/><line x1="17" y1="9" x2="17" y2="21" stroke="#1f2937" stroke-opacity="0.5" stroke-width="1.5" stroke-linecap="round"/><line x1="25" y1="9" x2="25" y2="21" stroke="#1f2937" stroke-opacity="0.5" stroke-width="1.5" stroke-linecap="round"/><line x1="33" y1="9" x2="33" y2="21" stroke="#1f2937" stroke-opacity="0.5" stroke-width="1.5" stroke-linecap="round"/></svg>`),

  item('media-bottle', 'Media bottle', ['media', 'medium', 'bottle', '500ml', '500 ml', 'dmem', 'reagent bottle'], 63, 90, DMEM, CAP,
    `<svg ${NS} viewBox="0 0 70 100"><path d="M10 36 q0-6 5-9 L24 20 V16 H46 V20 L55 27 q5 3 5 9 V88 q0 6-6 6 H16 q-6 0-6-6 Z" fill="#ffffff" ${S}/><path d="M10 40 H60 V88 q0 6-6 6 H16 q-6 0-6-6 Z" fill="#PRIMARY"/><path d="M10 36 q0-6 5-9 L24 20 V16 H46 V20 L55 27 q5 3 5 9 V88 q0 6-6 6 H16 q-6 0-6-6 Z" fill="none" ${S}/><rect x="18" y="48" width="34" height="26" rx="2" fill="#ffffff" ${S2}/><line x1="23" y1="56" x2="47" y2="56" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/><line x1="23" y1="62" x2="47" y2="62" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/><line x1="23" y1="68" x2="39" y2="68" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/><rect x="21" y="4" width="28" height="12" rx="2" fill="#SECONDARY" ${S}/></svg>`),

  item('serological-pipette', 'Serological pipette', ['serological', 'pipette', 'pipet', '10ml', '25ml', 'graduated'], 100, 100, LIQUID, CAP,
    `<svg ${NS} viewBox="0 0 100 100"><rect x="-4" y="45" width="100" height="10" rx="2" fill="#ffffff" ${S} transform="rotate(45 50 50)"/><rect x="52" y="46" width="44" height="8" fill="#PRIMARY" transform="rotate(45 50 50)"/><rect x="-4" y="45" width="100" height="10" rx="2" fill="none" ${S} transform="rotate(45 50 50)"/><polygon points="96,45 110,48.5 110,51.5 96,55" fill="#ffffff" ${S} transform="rotate(45 50 50)"/><line x1="24" y1="45" x2="24" y2="49" stroke="#374151" stroke-width="1.5" transform="rotate(45 50 50)"/><line x1="36" y1="45" x2="36" y2="49" stroke="#374151" stroke-width="1.5" transform="rotate(45 50 50)"/><line x1="48" y1="45" x2="48" y2="49" stroke="#374151" stroke-width="1.5" transform="rotate(45 50 50)"/><line x1="60" y1="45" x2="60" y2="49" stroke="#374151" stroke-width="1.5" transform="rotate(45 50 50)"/><line x1="72" y1="45" x2="72" y2="49" stroke="#374151" stroke-width="1.5" transform="rotate(45 50 50)"/><rect x="-8" y="43" width="10" height="14" rx="2" fill="#SECONDARY" ${S} transform="rotate(45 50 50)"/></svg>`),

  item('pipette-tip-box', 'Pipette tip box', ['tip box', 'tips', 'rack', 'pipette tips', 'tip rack'], 110, 88, PLASTIC, CAP,
    `<svg ${NS} viewBox="0 0 100 80"><rect x="12" y="6" width="76" height="18" rx="2" fill="#SECONDARY" ${S}/><rect x="6" y="22" width="88" height="22" rx="2" fill="#e5e7eb" ${S}/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${r1(50 + (i - 3.5) * 11)}" cy="29" r="3" fill="#ffffff" ${S2}/><circle cx="${r1(50 + (i - 3.5) * 11)}" cy="37" r="3" fill="#ffffff" ${S2}/>`).join('')}<rect x="6" y="44" width="88" height="30" rx="2" fill="#PRIMARY" ${S}/></svg>`),

  item('pipette-tip', 'Pipette tip', ['tip', 'pipette tip', 'disposable tip'], 36, 90, PLASTIC, undefined,
    `<svg ${NS} viewBox="0 0 40 100"><path d="M10 6 H30 V22 L25 32 L21.5 94 H18.5 L15 32 L10 22 Z" fill="#PRIMARY" ${S}/><line x1="10" y1="12" x2="30" y2="12" stroke="#6b7280" stroke-width="1.5"/><line x1="10" y1="17" x2="30" y2="17" stroke="#6b7280" stroke-width="1.5"/></svg>`),

  item('glass-slide', 'Glass slide', ['slide', 'microscope slide', 'glass', 'coverslip', 'specimen', 'histology'], 120, 53, PLASTIC, '#e8a5a5',
    `<svg ${NS} viewBox="0 0 100 44"><rect x="4" y="9" width="92" height="26" rx="2" fill="#PRIMARY" ${S}/><path d="M6 9 H22 V35 H6 q-2 0-2-2 V11 q0-2 2-2 Z" fill="#e5e7eb" ${S2}/><ellipse cx="57" cy="22" rx="9" ry="5" fill="#SECONDARY"/><rect x="40" y="13" width="34" height="18" fill="#ffffff" fill-opacity="0.5" ${S2}/></svg>`),

  item('coverslip', 'Coverslip', ['coverslip', 'cover glass', 'glass', 'square'], 80, 80, PLASTIC, undefined,
    `<svg ${NS} viewBox="0 0 100 100"><rect x="14" y="14" width="72" height="72" rx="2" fill="#PRIMARY" ${S}/><polygon points="18,74 74,18 82,18 82,26 26,82 18,82" fill="#ffffff" fill-opacity="0.6"/></svg>`),

  item('syringe-filter', 'Syringe filter', ['filter', 'syringe filter', '0.22', '0.45', 'sterile filter', 'membrane'], 48, 80, PLASTIC, CAP,
    `<svg ${NS} viewBox="0 0 60 100"><rect x="24" y="16" width="12" height="20" fill="#e5e7eb" ${S}/><rect x="16" y="8" width="28" height="8" rx="2" fill="#SECONDARY" ${S}/><path d="M26 60 L24 90 H36 L34 60 Z" fill="#e5e7eb" ${S}/><rect x="6" y="36" width="48" height="24" rx="5" fill="#PRIMARY" ${S}/><line x1="10" y1="48" x2="50" y2="48" stroke="#6b7280" stroke-width="2" stroke-dasharray="3 2"/></svg>`),

  item('syringe', 'Syringe', ['syringe', 'injection', 'plunger', 'needle'], 36, 90, LIQUID, CAP,
    `<svg ${NS} viewBox="0 0 40 100"><rect x="17" y="10" width="6" height="22" fill="#9ca3af" ${S2}/><rect x="8" y="4" width="24" height="6" rx="2" fill="#SECONDARY" ${S}/><rect x="4" y="28" width="32" height="5" rx="1" fill="#e5e7eb" ${S}/><rect x="10" y="33" width="20" height="48" fill="#ffffff" ${S}/><rect x="10" y="56" width="20" height="25" fill="#PRIMARY"/><rect x="10" y="50" width="20" height="6" fill="#SECONDARY"/><rect x="10" y="33" width="20" height="48" fill="none" ${S}/><line x1="24" y1="40" x2="29" y2="40" stroke="#374151" stroke-width="1.5"/><line x1="24" y1="48" x2="29" y2="48" stroke="#374151" stroke-width="1.5"/><line x1="24" y1="64" x2="29" y2="64" stroke="#374151" stroke-width="1.5"/><line x1="24" y1="72" x2="29" y2="72" stroke="#374151" stroke-width="1.5"/><path d="M16 81 H24 V86 H21.5 V96 H18.5 V86 H16 Z" fill="#e5e7eb" ${S2}/></svg>`),

  item('cell-strainer', 'Cell strainer', ['strainer', 'cell strainer', '40um', '70um', 'mesh', 'filter', 'single cell'], 100, 80, PLASTIC, CAP,
    `<svg ${NS} viewBox="0 0 100 80"><path d="M20 24 V58 a30 8 0 0 0 60 0 V24 Z" fill="#PRIMARY" ${S}/><ellipse cx="50" cy="24" rx="36" ry="10" fill="#SECONDARY" ${S}/><ellipse cx="50" cy="24" rx="30" ry="7" fill="#ffffff" ${S2}/><line x1="24" y1="20.5" x2="76" y2="20.5" stroke="#9ca3af" stroke-width="1.5"/><line x1="20" y1="24" x2="80" y2="24" stroke="#9ca3af" stroke-width="1.5"/><line x1="24" y1="27.5" x2="76" y2="27.5" stroke="#9ca3af" stroke-width="1.5"/><line x1="30" y1="18.8" x2="30" y2="29.2" stroke="#9ca3af" stroke-width="1.5"/><line x1="40" y1="17.4" x2="40" y2="30.6" stroke="#9ca3af" stroke-width="1.5"/><line x1="50" y1="17" x2="50" y2="31" stroke="#9ca3af" stroke-width="1.5"/><line x1="60" y1="17.4" x2="60" y2="30.6" stroke="#9ca3af" stroke-width="1.5"/><line x1="70" y1="18.8" x2="70" y2="29.2" stroke="#9ca3af" stroke-width="1.5"/></svg>`),

  item('culture-insert', 'Culture insert (transwell)', ['transwell', 'insert', 'culture insert', 'membrane', 'coculture', 'co-culture', 'migration', 'invasion'], 100, 80, LIQUID, '#6b7280',
    `<svg ${NS} viewBox="0 0 100 80"><path d="M12 18 V64 q0 8 8 8 H80 q8 0 8-8 V18" fill="#ffffff" ${S}/><path d="M12 40 H88 V64 q0 8-8 8 H20 q-8 0-8-8 Z" fill="#PRIMARY"/><path d="M12 18 V64 q0 8 8 8 H80 q8 0 8-8 V18" fill="none" ${S}/><path d="M32 12 H68 V58 H32 Z" fill="#ffffff" ${S}/><rect x="32" y="34" width="36" height="20" fill="#PRIMARY"/><rect x="32" y="54" width="36" height="4" fill="#SECONDARY"/><path d="M32 12 H68 V58 H32 Z" fill="none" ${S}/><rect x="24" y="14" width="8" height="4" fill="#e5e7eb" ${S2}/><rect x="68" y="14" width="8" height="4" fill="#e5e7eb" ${S2}/></svg>`),

  item('chamber-slide', 'Chamber slide', ['chamber slide', 'slide', 'chambered', 'imaging', '4 well', 'microscopy'], 120, 60, LIQUID, PLASTIC,
    `<svg ${NS} viewBox="0 0 100 50"><rect x="4" y="30" width="92" height="14" rx="2" fill="#SECONDARY" ${S}/><rect x="8" y="8" width="74" height="24" rx="2" fill="#e5e7eb" ${S}/><rect x="12" y="12" width="14" height="16" rx="2" fill="#PRIMARY" ${S2}/><rect x="30" y="12" width="14" height="16" rx="2" fill="#PRIMARY" ${S2}/><rect x="48" y="12" width="14" height="16" rx="2" fill="#PRIMARY" ${S2}/><rect x="66" y="12" width="14" height="16" rx="2" fill="#PRIMARY" ${S2}/></svg>`),

  item('reagent-bottle-small', 'Reagent bottle (small)', ['reagent', 'bottle', 'dropper', 'vial', 'small bottle', 'additive', 'supplement'], 40, 80, LIQUID, CAP,
    `<svg ${NS} viewBox="0 0 50 100"><path d="M16 34 L12 44 V86 q0 8 8 8 H30 q8 0 8-8 V44 L34 34 Z" fill="#ffffff" ${S}/><path d="M12 54 H38 V86 q0 8-8 8 H20 q-8 0-8-8 Z" fill="#PRIMARY"/><path d="M16 34 L12 44 V86 q0 8 8 8 H30 q8 0 8-8 V44 L34 34 Z" fill="none" ${S}/><line x1="25" y1="34" x2="25" y2="80" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/><path d="M19 20 V12 q0-6 6-6 q6 0 6 6 V20 Z" fill="#SECONDARY" ${S}/><rect x="13" y="20" width="24" height="14" rx="2" fill="#SECONDARY" ${S}/></svg>`),

  item('ice-bucket', 'Ice bucket', ['ice', 'bucket', 'ice bucket', 'cold', 'on ice', 'cooler'], 100, 90, '#8fb3dd', CAP,
    `<svg ${NS} viewBox="0 0 100 90"><polygon points="22,22 28,10 40,12 36,24" fill="#ffffff" ${S2}/><polygon points="66,22 70,12 82,14 78,24" fill="#ffffff" ${S2}/><polygon points="44,20 50,8 62,10 58,22" fill="#ffffff" ${S2}/><polygon points="34,24 38,14 50,16 46,26" fill="#ffffff" ${S2}/><rect x="8" y="20" width="84" height="10" rx="3" fill="#SECONDARY" ${S}/><path d="M12 30 H88 L82 82 q0 4-4 4 H22 q-4 0-4-4 Z" fill="#PRIMARY" ${S}/></svg>`),

  item('waste-container', 'Waste container', ['waste', 'biohazard', 'bin', 'disposal', 'trash', 'sharps'], 72, 90, '#e0837a', '#374151',
    `<svg ${NS} viewBox="0 0 80 100"><rect x="30" y="6" width="20" height="8" rx="2" fill="#SECONDARY" ${S}/><path d="M10 26 H70 V90 q0 4-4 4 H14 q-4 0-4-4 Z" fill="#PRIMARY" ${S}/><rect x="6" y="14" width="68" height="12" rx="3" fill="#SECONDARY" ${S}/><rect x="22" y="42" width="36" height="30" rx="2" fill="#ffffff" ${S2}/><circle cx="40" cy="51" r="4.5" fill="#374151"/><circle cx="33" cy="63" r="4.5" fill="#374151"/><circle cx="47" cy="63" r="4.5" fill="#374151"/><circle cx="40" cy="59" r="3" fill="#ffffff"/></svg>`),

  item('gloves', 'Gloves', ['glove', 'gloves', 'nitrile', 'latex', 'ppe', 'hand'], 100, 92, '#8fa8d8', '#6f8fc8',
    `<svg ${NS} viewBox="0 0 100 92"><path d="M36 66 V46 L23 36 q-4-3-1-7 q3-3 7 0 L36 36 V18 q0-4.5 4.5-4.5 q4.5 0 4.5 4.5 V34 H47 V12 q0-4.5 4.5-4.5 q4.5 0 4.5 4.5 V34 H58 V14 q0-4.5 4.5-4.5 q4.5 0 4.5 4.5 V34 H69 V22 q0-4.5 4.5-4.5 q4.5 0 4.5 4.5 V66 Z" fill="#PRIMARY" ${S}/><rect x="33" y="64" width="48" height="20" rx="3" fill="#SECONDARY" ${S}/></svg>`),

  item('cryobox', 'Cryobox', ['cryobox', 'freezer box', 'storage box', 'grid box', 'cryo', 'vials', '81 box'], 80, 80, PLASTIC, CAP,
    `<svg ${NS} viewBox="0 0 100 100"><rect x="6" y="6" width="88" height="88" rx="4" fill="#PRIMARY" ${S}/><rect x="12" y="12" width="76" height="76" fill="#ffffff" ${S2}/>${[27.2, 42.4, 57.6, 72.8].map((v) => `<line x1="${v}" y1="12" x2="${v}" y2="88" stroke="#1f2937" stroke-width="2"/><line x1="12" y1="${v}" x2="88" y2="${v}" stroke="#1f2937" stroke-width="2"/>`).join('')}<circle cx="19.6" cy="19.6" r="4.5" fill="#SECONDARY" ${S2}/><circle cx="34.8" cy="19.6" r="4.5" fill="#SECONDARY" ${S2}/><circle cx="50" cy="19.6" r="4.5" fill="#SECONDARY" ${S2}/><circle cx="19.6" cy="34.8" r="4.5" fill="#SECONDARY" ${S2}/><circle cx="34.8" cy="34.8" r="4.5" fill="#SECONDARY" ${S2}/><circle cx="19.6" cy="50" r="4.5" fill="#SECONDARY" ${S2}/></svg>`),

  item('bag-of-cells', 'Bag of cells', ['bag', 'blood bag', 'cell bag', 'infusion', 'cell product', 'apheresis', 'cryobag'], 63, 90, '#e6a0a0', PLASTIC,
    `<svg ${NS} viewBox="0 0 70 100"><rect x="20" y="6" width="30" height="14" rx="3" fill="#SECONDARY" ${S}/><circle cx="35" cy="13" r="3" fill="#ffffff" ${S2}/><rect x="20" y="84" width="7" height="12" rx="1.5" fill="#SECONDARY" ${S2}/><rect x="43" y="84" width="7" height="12" rx="1.5" fill="#SECONDARY" ${S2}/><rect x="10" y="18" width="50" height="66" rx="7" fill="#PRIMARY" ${S}/><rect x="18" y="36" width="34" height="22" rx="2" fill="#ffffff" ${S2}/><line x1="23" y1="43" x2="47" y2="43" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/><line x1="23" y1="50" x2="41" y2="50" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/></svg>`),
]
