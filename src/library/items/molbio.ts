import type { LibraryItem } from '../types'

/*
 * Molecular biology & omics icons.
 * Flat vector, dark outlines (#1f2937), recolourable via #PRIMARY / #SECONDARY.
 */

const CAPS = 'stroke-linejoin="round" stroke-linecap="round"'
const S = `stroke="#1f2937" stroke-width="2.5" ${CAPS}`
const S2 = `stroke="#1f2937" stroke-width="2" ${CAPS}`

const BLUE = '#3b82f6'
const ORANGE = '#f59e0b'
const PURPLE = '#8b5cf6'
const TEAL = '#14b8a6'
const GREEN = '#22c55e'

/** A thick coloured stroke with a dark outline (two stacked paths). */
const tube = (d: string, color: string, w = 4, extra = ''): string =>
  `<path d="${d}" fill="none" stroke="#1f2937" stroke-width="${w + 3}" ${CAPS} ${extra}/>` +
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" ${CAPS} ${extra}/>`

function def(
  id: string,
  name: string,
  keywords: string[],
  viewBox: string,
  width: number,
  height: number,
  primary: string,
  secondary: string | undefined,
  body: string,
): LibraryItem {
  const item: LibraryItem = {
    id: `molbio.${id}`,
    name,
    category: 'molbio',
    keywords,
    width,
    height,
    primary,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`,
  }
  if (secondary) item.secondary = secondary
  return item
}

export const items: LibraryItem[] = [
  // ---------------------------------------------------------------- nucleic acids
  def('dna-helix', 'DNA double helix', ['dna', 'double helix', 'genome', 'nucleic acid', 'gene'], '0 0 60 100', 60, 100, BLUE, ORANGE,
    tube('M18 14H42M19 40H41M15 50H45M19 60H41M18 86H42', '#SECONDARY', 4) +
    `<path d="M15 5 C15 20 45 30 45 50 C45 70 15 80 15 95" fill="none" stroke="#1f2937" stroke-width="7.5" ${CAPS}/>` +
    `<path d="M45 5 C45 20 15 30 15 50 C15 70 45 80 45 95" fill="none" stroke="#1f2937" stroke-width="7.5" ${CAPS}/>` +
    `<path d="M15 5 C15 20 45 30 45 50 C45 70 15 80 15 95" fill="none" stroke="#PRIMARY" stroke-width="4.5" ${CAPS}/>` +
    `<path d="M45 5 C45 20 15 30 15 50 C15 70 45 80 45 95" fill="none" stroke="#PRIMARY" stroke-width="4.5" ${CAPS}/>`),

  def('dna-strand-linear', 'Linear DNA', ['dna', 'linear', 'double stranded', 'dsdna', 'fragment', 'amplicon'], '0 0 100 40', 120, 48, BLUE, ORANGE,
    tube('M14 12V28M24 12V28M34 12V28M44 12V28M54 12V28M64 12V28M74 12V28M84 12V28', '#SECONDARY', 3.5) +
    tube('M6 12H94', '#PRIMARY', 4) + tube('M6 28H94', '#PRIMARY', 4)),

  def('rna', 'RNA', ['rna', 'single stranded', 'ssrna', 'transcript', 'nucleic acid'], '0 0 100 60', 100, 60, BLUE, ORANGE,
    tube('M17 19V31M39 43V55M61 19V31M83 43V55M28 30V42M50 30V42M72 30V42', '#SECONDARY', 3.5) +
    tube('M6 30 Q17 6 28 30 T50 30 T72 30 T94 30', '#PRIMARY', 4.5)),

  def('mrna', 'mRNA', ['mrna', 'messenger rna', 'transcript', 'cap', 'poly a', 'polya tail'], '0 0 100 60', 100, 60, BLUE, ORANGE,
    tube('M70 30V42M78 30V42M86 30V42', '#SECONDARY', 3.5) +
    tube('M16 30 Q24 8 32 30 T48 30 T64 30 L92 30', '#PRIMARY', 4.5) +
    `<circle cx="11" cy="30" r="6.5" fill="#SECONDARY" ${S}/>`),

  def('nucleotide', 'Nucleotide', ['nucleotide', 'dntp', 'ntp', 'base', 'phosphate', 'sugar', 'atp'], '0 0 100 100', 100, 100, BLUE, ORANGE,
    `<path d="M28 50H38M62 50H68" fill="none" stroke="#1f2937" stroke-width="3" ${CAPS}/>` +
    `<circle cx="18" cy="50" r="11" fill="#SECONDARY" ${S}/>` +
    `<polygon points="50,37 64.3,47.4 58.8,64.1 41.2,64.1 35.7,47.4" fill="#e5e7eb" ${S}/>` +
    `<rect x="66" y="34" width="28" height="32" rx="5" fill="#PRIMARY" ${S}/>`),

  def('plasmid', 'Plasmid', ['plasmid', 'vector', 'circular dna', 'insert', 'ori', 'cloning'], '0 0 100 100', 100, 100, BLUE, ORANGE,
    `<circle cx="50" cy="50" r="36" fill="none" stroke="#1f2937" stroke-width="10"/>` +
    `<path d="M50 14 A36 36 0 0 1 86 50" fill="none" stroke="#1f2937" stroke-width="10" ${CAPS}/>` +
    `<circle cx="50" cy="50" r="36" fill="none" stroke="#PRIMARY" stroke-width="6"/>` +
    `<path d="M50 14 A36 36 0 0 1 86 50" fill="none" stroke="#SECONDARY" stroke-width="6" ${CAPS}/>` +
    `<path d="M6 50H22" fill="none" stroke="#1f2937" stroke-width="3.5" ${CAPS}/>`),

  def('transposon', 'Transposon', ['transposon', 'transposable element', 'jumping gene', 'inverted repeats', 'piggybac', 'sleeping beauty'], '0 0 100 40', 120, 48, BLUE, ORANGE,
    `<rect x="4" y="15" width="92" height="10" rx="2" fill="#e5e7eb" ${S}/>` +
    `<rect x="32" y="9" width="36" height="22" rx="3" fill="#PRIMARY" ${S}/>` +
    `<polygon points="18,11 30,20 18,29" fill="#SECONDARY" ${S}/>` +
    `<polygon points="82,11 70,20 82,29" fill="#SECONDARY" ${S}/>`),

  def('primer-pair', 'Primer pair', ['primer', 'primers', 'forward', 'reverse', 'oligo', 'pcr'], '0 0 100 62', 120, 74, GREEN, ORANGE,
    `<path d="M4 29.5H96M4 32.5H96" fill="none" stroke="#9ca3af" stroke-width="2.5" ${CAPS}/>` +
    `<polygon points="6,9 38,9 38,4 52,15 38,26 38,21 6,21" fill="#PRIMARY" ${S}/>` +
    `<polygon points="94,41 62,41 62,36 48,47 62,58 62,53 94,53" fill="#SECONDARY" ${S}/>`),

  def('sgrna', 'sgRNA', ['sgrna', 'guide rna', 'grna', 'crispr', 'spacer', 'scaffold', 'hairpin'], '0 0 100 80', 100, 80, BLUE, ORANGE,
    `<path d="M44 46H68M44 54H68M70 50H88" fill="none" stroke="#1f2937" stroke-width="2" ${CAPS}/>` +
    tube('M44 66 V38 A12 12 0 0 1 68 38 V56 C68 68 90 68 90 56 V40', '#PRIMARY', 4) +
    tube('M6 66H44', '#SECONDARY', 4)),

  def('bisulfite-methylation', 'DNA methylation', ['methylation', 'bisulfite', 'cpg', '5mc', 'methyl', 'epigenetics', 'wgbs', 'rrbs'], '0 0 100 44', 120, 52, BLUE, ORANGE,
    `<path d="M14 28V38M26 28V38M38 28V38M50 28V38M62 28V38M74 28V38M86 28V38" fill="none" stroke="#1f2937" stroke-width="2" ${CAPS}/>` +
    `<path d="M20 28V12M32 28V12M44 28V12M56 28V12M68 28V12M80 28V12" fill="none" stroke="#1f2937" stroke-width="2.5" ${CAPS}/>` +
    tube('M6 28H94', '#PRIMARY', 4) + tube('M6 38H94', '#PRIMARY', 4) +
    `<circle cx="20" cy="9" r="4.5" fill="#SECONDARY" ${S2}/><circle cx="32" cy="9" r="4.5" fill="#ffffff" ${S2}/>` +
    `<circle cx="44" cy="9" r="4.5" fill="#SECONDARY" ${S2}/><circle cx="56" cy="9" r="4.5" fill="#ffffff" ${S2}/>` +
    `<circle cx="68" cy="9" r="4.5" fill="#ffffff" ${S2}/><circle cx="80" cy="9" r="4.5" fill="#SECONDARY" ${S2}/>`),

  def('nucleosome', 'Nucleosome', ['nucleosome', 'histone', 'octamer', 'chromatin', 'dna wrap'], '0 0 100 90', 100, 90, BLUE, ORANGE,
    `<circle cx="50" cy="46" r="20" fill="#SECONDARY" ${S}/>` +
    tube('M4 34 C20 34 26 24 38 28 A22 22 0 0 0 62 64 C74 68 82 62 96 60', '#PRIMARY', 4)),

  def('chromosome', 'Chromosome', ['chromosome', 'metaphase', 'chromatid', 'centromere', 'karyotype'], '0 0 70 100', 70, 100, BLUE, ORANGE,
    `<path d="M18 14 Q27 50 52 86 M52 14 Q43 50 18 86" fill="none" stroke="#1f2937" stroke-width="18" ${CAPS}/>` +
    `<path d="M18 14 Q27 50 52 86 M52 14 Q43 50 18 86" fill="none" stroke="#PRIMARY" stroke-width="14" ${CAPS}/>` +
    `<path d="M16.5 30.3L27.9 26.5M42.1 26.5L53.5 30.3M39.8 78.4L50 72" fill="none" stroke="#SECONDARY" stroke-width="5"/>`),

  def('karyotype', 'Karyotype', ['karyotype', 'chromosomes', 'cytogenetics', 'g-banding', 'aneuploidy'], '0 0 100 70', 100, 70, BLUE, undefined,
    tube('M8 6L24 30M24 6L8 30M30 8L46 30M46 8L30 30M53 10L67 30M67 10L53 30M75 12L89 30M89 12L75 30M9 40L23 62M23 40L9 62M31 42L45 62M45 42L31 62M54 44L66 62M66 44L54 62M76 46L88 62M88 46L76 62', '#PRIMARY', 4.5)),

  // ---------------------------------------------------------------- proteins
  def('protein', 'Protein', ['protein', 'polypeptide', 'globular', 'folded'], '0 0 100 90', 100, 90, PURPLE, undefined,
    `<path d="M50 6 C70 4 94 20 94 44 C94 70 76 86 50 86 C26 86 6 72 6 46 C6 22 28 8 50 6z" fill="#PRIMARY" ${S}/>` +
    `<path d="M20 38l6 -10 6 10 6 -10 6 10 6 -10 6 10" fill="none" stroke="#ffffff" stroke-width="3" ${CAPS}/>` +
    `<path d="M44 64l6 -10 6 10 6 -10 6 10 6 -10" fill="none" stroke="#ffffff" stroke-width="3" ${CAPS}/>` +
    `<path d="M62 28 C80 22 84 46 70 52" fill="none" stroke="#ffffff" stroke-width="3" ${CAPS}/>`),

  def('protein-ribbon', 'Protein ribbon', ['protein', 'ribbon', 'secondary structure', 'alpha helix', 'beta sheet', 'structure', 'pdb'], '0 0 100 100', 100, 100, PURPLE, ORANGE,
    `<path d="M56 76 C72 76 74 60 70 46 C66 32 50 36 46 30" fill="none" stroke="#1f2937" stroke-width="2.5" ${CAPS}/>` +
    `<polygon points="46,22 72,22 72,14 92,30 72,46 72,38 46,38" fill="#SECONDARY" ${S}/>` +
    tube('M8 76 q6 -16 12 0 t12 0 t12 0 t12 0', '#PRIMARY', 6)),

  def('enzyme', 'Enzyme', ['enzyme', 'catalyst', 'active site', 'substrate', 'pocket', 'kinase', 'polymerase'], '0 0 100 90', 100, 90, '#7c3aed', ORANGE,
    `<path d="M36 20 L41 34 L59 34 L64 20 C78 18 92 30 92 52 C92 72 74 86 50 86 C26 86 8 72 8 52 C8 30 22 18 36 20z" fill="#PRIMARY" ${S}/>` +
    `<rect x="42" y="12" width="16" height="20" rx="4" fill="#SECONDARY" ${S}/>`),

  def('antibody', 'Antibody', ['antibody', 'igg', 'immunoglobulin', 'mab', 'monoclonal', 'y shape'], '0 0 100 100', 100, 100, PURPLE, '#c4b5fd',
    tube('M32 43L10 15M68 43L90 15', '#SECONDARY', 6) +
    tube('M50 94 V48 L18 8 M50 48 L82 8', '#PRIMARY', 8)),

  def('antibody-labelled', 'Labelled antibody', ['antibody', 'labelled', 'conjugated', 'fluorophore', 'fluorescent', 'secondary antibody', 'facs'], '0 0 100 100', 100, 100, PURPLE, '#fbbf24',
    tube('M33 39L12 12M67 39L88 12', '#c4b5fd', 6) +
    tube('M50 70 V44 L20 6 M50 44 L80 6', '#PRIMARY', 8) +
    `<polygon points="50,71 53.5,79.1 62.4,80 55.7,85.9 57.6,94.5 50,90 42.4,94.5 44.3,85.9 37.6,80 46.5,79.1" fill="#SECONDARY" ${S2}/>`),

  def('cytokine', 'Cytokine', ['cytokine', 'interleukin', 'il-6', 'tnf', 'interferon', 'signalling', 'chemokine'], '0 0 100 100', 100, 100, '#a78bfa', undefined,
    `<path d="M50 14 C62 14 66 24 66 34 C76 34 86 38 86 50 C86 62 76 66 66 66 C66 76 62 86 50 86 C38 86 34 76 34 66 C24 66 14 62 14 50 C14 38 24 34 34 34 C34 24 38 14 50 14z" fill="#PRIMARY" ${S}/>` +
    `<circle cx="42" cy="42" r="7" fill="#ffffff" fill-opacity="0.5"/>`),

  def('growth-factor', 'Growth factor', ['growth factor', 'ligand', 'egf', 'fgf', 'vegf', 'bmp', 'signalling molecule'], '0 0 100 100', 100, 100, '#c084fc', undefined,
    tube('M58 46 Q76 40 76 24 T94 8', '#PRIMARY', 4) +
    `<circle cx="40" cy="60" r="22" fill="#PRIMARY" ${S}/>` +
    `<circle cx="32" cy="52" r="6" fill="#ffffff" fill-opacity="0.5"/>`),

  def('hormone', 'Hormone', ['hormone', 'steroid', 'estrogen', 'testosterone', 'cortisol', 'endocrine'], '0 0 100 100', 100, 100, '#f472b6', ORANGE,
    `<polygon points="26,46 39.9,54 39.9,70 26,78 12.1,70 12.1,54" fill="#PRIMARY" ${S}/>` +
    `<polygon points="53.7,46 67.6,54 67.6,70 53.7,78 39.9,70 39.9,54" fill="#PRIMARY" ${S}/>` +
    `<polygon points="67.6,54 83,49 92,62 83,75 67.6,70" fill="#PRIMARY" ${S}/>` +
    `<path d="M26 46V34" fill="none" stroke="#1f2937" stroke-width="3" ${CAPS}/>` +
    `<circle cx="26" cy="30" r="5.5" fill="#SECONDARY" ${S2}/>`),

  def('small-molecule', 'Small molecule', ['small molecule', 'compound', 'drug', 'inhibitor', 'chemical', 'benzene', 'ring'], '0 0 100 100', 100, 100, GREEN, ORANGE,
    `<path d="M50 26V12M76 71L88 78" fill="none" stroke="#1f2937" stroke-width="3" ${CAPS}/>` +
    `<polygon points="50,26 76,41 76,71 50,86 24,71 24,41" fill="#PRIMARY" ${S}/>` +
    `<polygon points="50,36 67.3,46 67.3,66 50,76 32.7,66 32.7,46" fill="none" stroke="#ffffff" stroke-width="2.5" ${CAPS}/>` +
    `<circle cx="50" cy="10" r="5.5" fill="#SECONDARY" ${S2}/>` +
    `<circle cx="90" cy="79" r="5.5" fill="#SECONDARY" ${S2}/>`),

  def('fluorescent-protein-gfp', 'GFP', ['gfp', 'fluorescent protein', 'reporter', 'egfp', 'rfp', 'beta barrel', 'tag'], '0 0 100 100', 100, 100, GREEN, '#86efac',
    `<path d="M28 22 V78 A22 8 0 0 0 72 78 V22" fill="#PRIMARY" ${S}/>` +
    `<path d="M37 22V84M46 22V85M54 22V85M63 22V84" fill="none" stroke="#1f2937" stroke-width="2" ${CAPS}/>` +
    `<ellipse cx="50" cy="22" rx="22" ry="8" fill="#SECONDARY" ${S}/>`),

  def('luciferase-reporter', 'Luciferase reporter', ['luciferase', 'reporter', 'luminescence', 'bioluminescence', 'glow', 'assay'], '0 0 100 100', 100, 100, '#fde047', ORANGE,
    `<path d="M84 50H94M74 74L81.1 81.1M50 84V94M26 74L18.9 81.1M16 50H6M26 26L18.9 18.9M50 16V6M74 26L81.1 18.9" fill="none" stroke="#SECONDARY" stroke-width="3.5" ${CAPS}/>` +
    `<circle cx="50" cy="50" r="30" fill="#PRIMARY" fill-opacity="0.35"/>` +
    `<circle cx="50" cy="50" r="20" fill="#PRIMARY" ${S}/>` +
    `<circle cx="44" cy="44" r="6" fill="#ffffff" fill-opacity="0.6"/>`),

  // ---------------------------------------------------------------- viruses & vesicles
  def('lentivirus', 'Lentivirus', ['lentivirus', 'virus', 'viral vector', 'retrovirus', 'hiv', 'transduction', 'enveloped'], '0 0 100 100', 100, 100, TEAL, ORANGE,
    `<path d="M80 50H88M71.2 71.2L76.9 76.9M50 80V88M28.8 71.2L23.1 76.9M20 50H12M28.8 28.8L23.1 23.1M50 20V12M71.2 28.8L76.9 23.1" fill="none" stroke="#1f2937" stroke-width="3" ${CAPS}/>` +
    `<circle cx="90" cy="50" r="4.5" fill="#SECONDARY" ${S2}/><circle cx="78.3" cy="78.3" r="4.5" fill="#SECONDARY" ${S2}/>` +
    `<circle cx="50" cy="90" r="4.5" fill="#SECONDARY" ${S2}/><circle cx="21.7" cy="78.3" r="4.5" fill="#SECONDARY" ${S2}/>` +
    `<circle cx="10" cy="50" r="4.5" fill="#SECONDARY" ${S2}/><circle cx="21.7" cy="21.7" r="4.5" fill="#SECONDARY" ${S2}/>` +
    `<circle cx="50" cy="10" r="4.5" fill="#SECONDARY" ${S2}/><circle cx="78.3" cy="21.7" r="4.5" fill="#SECONDARY" ${S2}/>` +
    `<circle cx="50" cy="50" r="30" fill="#PRIMARY" ${S}/>` +
    `<circle cx="50" cy="50" r="20" fill="#ffffff" fill-opacity="0.4"/>` +
    `<path d="M36 44q7 -9 14 0t14 0M36 57q7 -9 14 0t14 0" fill="none" stroke="#SECONDARY" stroke-width="3" ${CAPS}/>`),

  def('aav', 'AAV', ['aav', 'adeno-associated virus', 'capsid', 'icosahedral', 'viral vector', 'gene therapy'], '0 0 100 100', 100, 100, TEAL, undefined,
    `<polygon points="50,14 81,32 81,68 50,86 19,68 19,32" fill="#PRIMARY" ${S}/>` +
    `<polygon points="50,14 81,32 50,50 19,32" fill="#ffffff" fill-opacity="0.35"/>` +
    `<path d="M50 50L50 14M50 50L81 32M50 50L81 68M50 50L50 86M50 50L19 68M50 50L19 32" fill="none" ${S2}/>`),

  def('exosome-vesicle', 'Exosome', ['exosome', 'extracellular vesicle', 'ev', 'microvesicle', 'secreted'], '0 0 100 100', 100, 100, '#60a5fa', ORANGE,
    `<circle cx="50" cy="50" r="34" fill="#PRIMARY" ${S}/>` +
    `<circle cx="50" cy="50" r="25" fill="#ffffff" fill-opacity="0.55"/>` +
    `<circle cx="42" cy="46" r="4" fill="#6b7280"/><circle cx="56" cy="57" r="4" fill="#6b7280"/><circle cx="52" cy="40" r="3" fill="#6b7280"/>` +
    `<circle cx="50" cy="16" r="4.5" fill="#SECONDARY" ${S2}/><circle cx="82.3" cy="39.5" r="4.5" fill="#SECONDARY" ${S2}/>` +
    `<circle cx="70" cy="77.5" r="4.5" fill="#SECONDARY" ${S2}/><circle cx="30" cy="77.5" r="4.5" fill="#SECONDARY" ${S2}/>` +
    `<circle cx="17.7" cy="39.5" r="4.5" fill="#SECONDARY" ${S2}/>`),

  def('lipid-nanoparticle', 'Lipid nanoparticle', ['lnp', 'lipid nanoparticle', 'liposome', 'mrna delivery', 'vaccine', 'nanoparticle'], '0 0 100 100', 100, 100, '#38bdf8', ORANGE,
    `<circle cx="50" cy="50" r="36" fill="#e5e7eb"/>` +
    tube('M26 50 q6 -10 12 0 t12 0 t12 0 t12 0', '#SECONDARY', 3.5) +
    `<circle cx="50" cy="50" r="36" fill="none" stroke="#1f2937" stroke-width="10" stroke-linecap="round" stroke-dasharray="0.1 8.95"/>` +
    `<circle cx="50" cy="50" r="36" fill="none" stroke="#PRIMARY" stroke-width="7" stroke-linecap="round" stroke-dasharray="0.1 8.95"/>`),

  // ---------------------------------------------------------------- membrane & receptors
  def('lipid-bilayer-segment', 'Lipid bilayer', ['lipid bilayer', 'membrane', 'plasma membrane', 'phospholipid', 'cell membrane'], '0 0 100 50', 120, 60, '#60a5fa', undefined,
    `<rect x="4" y="12" width="92" height="26" fill="#e5e7eb"/>` +
    `<path d="M7.75 25H92" fill="none" stroke="#9ca3af" stroke-width="16" stroke-dasharray="2.5 7.5"/>` +
    `<path d="M9 12H91M9 38H91" fill="none" stroke="#1f2937" stroke-width="11" stroke-linecap="round" stroke-dasharray="0.1 9.9"/>` +
    `<path d="M9 12H91M9 38H91" fill="none" stroke="#PRIMARY" stroke-width="8" stroke-linecap="round" stroke-dasharray="0.1 9.9"/>`),

  def('receptor-membrane', 'Membrane receptor', ['receptor', 'transmembrane', 'membrane', 'ligand', 'gpcr', 'rtk', 'signalling'], '0 0 100 80', 100, 80, PURPLE, ORANGE,
    `<rect x="4" y="38" width="92" height="20" fill="#e5e7eb"/>` +
    `<path d="M7.75 48H92" fill="none" stroke="#9ca3af" stroke-width="14" stroke-dasharray="2.5 7.5"/>` +
    `<path d="M9 38H91M9 58H91" fill="none" stroke="#1f2937" stroke-width="11" stroke-linecap="round" stroke-dasharray="0.1 9.9"/>` +
    `<path d="M9 38H91M9 58H91" fill="none" stroke="#9ca3af" stroke-width="8" stroke-linecap="round" stroke-dasharray="0.1 9.9"/>` +
    `<path d="M41 76 L41 36 L31 10 L44 10 L50 24 L56 10 L69 10 L59 36 L59 76 Z" fill="#PRIMARY" ${S}/>` +
    `<circle cx="50" cy="12" r="5.5" fill="#SECONDARY" ${S2}/>`),

  // ---------------------------------------------------------------- gene editing
  def('crispr-cas9', 'CRISPR-Cas9', ['crispr', 'cas9', 'gene editing', 'genome editing', 'guide rna', 'nuclease', 'knockout'], '0 0 100 100', 100, 100, PURPLE, BLUE,
    `<path d="M12 68V80M24 68V80M76 68V80M88 68V80" fill="none" stroke="#1f2937" stroke-width="2" ${CAPS}/>` +
    tube('M4 68H96', '#SECONDARY', 4) + tube('M4 80H96', '#SECONDARY', 4) +
    `<path d="M18 72 C8 50 20 18 50 18 C80 18 92 50 82 72 C72 78 28 78 18 72z" fill="#PRIMARY" ${S}/>` +
    tube('M40 54 C40 38 32 30 40 14 Q48 2 56 14 C64 30 56 38 56 54', ORANGE, 3.5)),

  def('knock-out', 'Knock-out', ['knockout', 'knock-out', 'ko', 'deletion', 'null', 'loss of function', 'gene'], '0 0 100 50', 120, 60, BLUE, '#ef4444',
    `<path d="M4 25H96" fill="none" stroke="#6b7280" stroke-width="3" ${CAPS}/>` +
    `<rect x="28" y="14" width="44" height="22" rx="4" fill="#PRIMARY" ${S}/>` +
    `<path d="M34 6L66 44M66 6L34 44" fill="none" stroke="#SECONDARY" stroke-width="5" ${CAPS}/>`),

  def('knock-in', 'Knock-in', ['knockin', 'knock-in', 'ki', 'insertion', 'transgene', 'integration', 'gene'], '0 0 100 64', 120, 76, BLUE, ORANGE,
    `<path d="M4 48H96" fill="none" stroke="#6b7280" stroke-width="3" ${CAPS}/>` +
    `<rect x="12" y="38" width="30" height="20" rx="4" fill="#PRIMARY" ${S}/>` +
    `<rect x="58" y="38" width="30" height="20" rx="4" fill="#PRIMARY" ${S}/>` +
    `<rect x="42" y="4" width="16" height="14" rx="3" fill="#SECONDARY" ${S}/>` +
    `<path d="M50 20V30" fill="none" stroke="#1f2937" stroke-width="2.5" ${CAPS}/>` +
    `<polygon points="44,29 56,29 50,37" fill="#1f2937"/>`),

  // ---------------------------------------------------------------- assays & readouts
  def('pcr-amplification', 'PCR amplification', ['pcr', 'amplification', 'polymerase chain reaction', 'qpcr', 'thermocycler', 'copies'], '0 0 100 100', 100, 100, BLUE, '#bfdbfe',
    `<path d="M10 6 H34 V58 A12 12 0 0 1 10 58 Z" fill="#e5e7eb" ${S}/>` +
    `<path d="M12 38 H32 V58 A10 10 0 0 1 12 58 Z" fill="#SECONDARY"/>` +
    `<path d="M10 6 H34 V58 A12 12 0 0 1 10 58 Z" fill="none" ${S}/>` +
    `<rect x="8" y="4" width="28" height="6" rx="2" fill="#9ca3af" ${S2}/>` +
    `<rect x="44" y="48" width="14" height="5" rx="2.5" fill="#PRIMARY" ${S2}/>` +
    `<rect x="62" y="36" width="14" height="5" rx="2.5" fill="#PRIMARY" ${S2}/><rect x="62" y="60" width="14" height="5" rx="2.5" fill="#PRIMARY" ${S2}/>` +
    `<rect x="80" y="24" width="14" height="5" rx="2.5" fill="#PRIMARY" ${S2}/><rect x="80" y="40" width="14" height="5" rx="2.5" fill="#PRIMARY" ${S2}/>` +
    `<rect x="80" y="56" width="14" height="5" rx="2.5" fill="#PRIMARY" ${S2}/><rect x="80" y="72" width="14" height="5" rx="2.5" fill="#PRIMARY" ${S2}/>`),

  def('gel-lanes', 'Agarose gel', ['gel', 'agarose', 'electrophoresis', 'bands', 'lanes', 'dna gel'], '0 0 100 100', 100, 100, '#1e3a8a', '#fbbf24',
    `<rect x="4" y="4" width="92" height="92" rx="6" fill="#PRIMARY" ${S}/>` +
    `<rect x="10" y="10" width="16" height="6" fill="#6b7280"/><rect x="32" y="10" width="16" height="6" fill="#6b7280"/>` +
    `<rect x="54" y="10" width="16" height="6" fill="#6b7280"/><rect x="76" y="10" width="16" height="6" fill="#6b7280"/>` +
    `<rect x="10" y="24" width="16" height="5" rx="1.5" fill="#SECONDARY"/><rect x="10" y="34" width="16" height="5" rx="1.5" fill="#SECONDARY"/>` +
    `<rect x="10" y="44" width="16" height="5" rx="1.5" fill="#SECONDARY"/><rect x="10" y="56" width="16" height="5" rx="1.5" fill="#SECONDARY"/>` +
    `<rect x="10" y="72" width="16" height="5" rx="1.5" fill="#SECONDARY"/>` +
    `<rect x="32" y="34" width="16" height="5" rx="1.5" fill="#SECONDARY"/>` +
    `<rect x="54" y="44" width="16" height="5" rx="1.5" fill="#SECONDARY"/><rect x="54" y="72" width="16" height="5" rx="1.5" fill="#SECONDARY"/>` +
    `<rect x="76" y="34" width="16" height="5" rx="1.5" fill="#SECONDARY"/><rect x="76" y="56" width="16" height="5" rx="1.5" fill="#SECONDARY"/>`),

  def('electrophoresis-ladder', 'DNA ladder', ['ladder', 'marker', 'size standard', 'electrophoresis', 'gel lane', 'bp'], '0 0 50 100', 50, 100, '#1e3a8a', '#fbbf24',
    `<rect x="6" y="4" width="38" height="92" rx="4" fill="#PRIMARY" ${S}/>` +
    `<rect x="12" y="9" width="26" height="5" fill="#6b7280"/>` +
    `<rect x="12" y="20" width="26" height="3" fill="#SECONDARY"/><rect x="12" y="26" width="26" height="3" fill="#SECONDARY"/>` +
    `<rect x="12" y="31" width="26" height="3" fill="#SECONDARY"/><rect x="12" y="37" width="26" height="3" fill="#SECONDARY"/>` +
    `<rect x="12" y="44" width="26" height="5" fill="#SECONDARY"/><rect x="12" y="54" width="26" height="3" fill="#SECONDARY"/>` +
    `<rect x="12" y="62" width="26" height="3" fill="#SECONDARY"/><rect x="12" y="72" width="26" height="5" fill="#SECONDARY"/>` +
    `<rect x="12" y="84" width="26" height="3" fill="#SECONDARY"/>`),

  def('western-blot-bands', 'Western blot', ['western blot', 'immunoblot', 'bands', 'membrane', 'protein blot', 'sds-page'], '0 0 100 50', 120, 60, '#374151', undefined,
    `<rect x="4" y="10" width="92" height="30" rx="3" fill="#ffffff" ${S}/>` +
    `<rect x="10" y="21" width="12" height="8" rx="2" fill="#PRIMARY"/><rect x="28" y="20" width="12" height="10" rx="2" fill="#PRIMARY"/>` +
    `<rect x="46" y="22" width="12" height="6" rx="2" fill="#PRIMARY"/><rect x="64" y="19" width="12" height="12" rx="2" fill="#PRIMARY"/>` +
    `<rect x="82" y="21" width="10" height="8" rx="2" fill="#PRIMARY"/>`),

  def('microarray-chip', 'Microarray', ['microarray', 'array', 'chip', 'expression array', 'spots', 'hybridisation'], '0 0 100 70', 100, 70, GREEN, '#ef4444',
    `<rect x="4" y="8" width="92" height="54" rx="3" fill="#e5e7eb" ${S}/>` +
    `<path d="M22 20H78M22 40H78" fill="none" stroke="#PRIMARY" stroke-width="6.5" stroke-linecap="round" stroke-dasharray="0.1 7.9"/>` +
    `<path d="M22 30H78M22 50H78" fill="none" stroke="#SECONDARY" stroke-width="6.5" stroke-linecap="round" stroke-dasharray="0.1 7.9"/>`),

  def('sequencing-flowcell', 'Sequencing flow cell', ['flow cell', 'flowcell', 'sequencing', 'illumina', 'ngs', 'lanes'], '0 0 100 50', 120, 60, BLUE, undefined,
    `<rect x="4" y="6" width="92" height="38" rx="4" fill="#e5e7eb" ${S}/>` +
    `<rect x="16" y="12" width="68" height="6" rx="3" fill="#PRIMARY" ${S2}/>` +
    `<rect x="16" y="22" width="68" height="6" rx="3" fill="#PRIMARY" ${S2}/>` +
    `<rect x="16" y="32" width="68" height="6" rx="3" fill="#PRIMARY" ${S2}/>`),

  def('sequencing-reads', 'Sequencing reads', ['reads', 'alignment', 'ngs', 'sequencing', 'coverage', 'bam', 'reference', 'mapping'], '0 0 100 70', 100, 70, BLUE, ORANGE,
    `<rect x="6" y="6" width="88" height="7" rx="2" fill="#SECONDARY" ${S2}/>` +
    `<rect x="6" y="20" width="30" height="7" rx="3" fill="#PRIMARY" ${S2}/><rect x="40" y="20" width="26" height="7" rx="3" fill="#PRIMARY" ${S2}/><rect x="70" y="20" width="24" height="7" rx="3" fill="#PRIMARY" ${S2}/>` +
    `<rect x="14" y="32" width="30" height="7" rx="3" fill="#PRIMARY" ${S2}/><rect x="50" y="32" width="30" height="7" rx="3" fill="#PRIMARY" ${S2}/>` +
    `<rect x="22" y="44" width="30" height="7" rx="3" fill="#PRIMARY" ${S2}/><rect x="62" y="44" width="32" height="7" rx="3" fill="#PRIMARY" ${S2}/>` +
    `<rect x="6" y="56" width="24" height="7" rx="3" fill="#PRIMARY" ${S2}/><rect x="36" y="56" width="34" height="7" rx="3" fill="#PRIMARY" ${S2}/>`),

  def('bulk-rna-seq', 'Bulk RNA-seq', ['rna-seq', 'rnaseq', 'bulk', 'transcriptomics', 'expression', 'library', 'sequencing'], '0 0 100 100', 100, 100, BLUE, '#f9a8d4',
    `<path d="M8 8 H32 V56 A12 12 0 0 1 8 56 Z" fill="#e5e7eb"/>` +
    `<path d="M10 34 H30 V56 A10 10 0 0 1 10 56 Z" fill="#SECONDARY"/>` +
    `<path d="M8 8 H32 V56 A12 12 0 0 1 8 56 Z" fill="none" ${S}/>` +
    `<polygon points="40,44 54,44 54,38 64,48 54,58 54,52 40,52" fill="#9ca3af" ${S}/>` +
    `<rect x="70" y="30" width="22" height="6" rx="3" fill="#PRIMARY" ${S2}/><rect x="72" y="42" width="22" height="6" rx="3" fill="#PRIMARY" ${S2}/>` +
    `<rect x="68" y="54" width="22" height="6" rx="3" fill="#PRIMARY" ${S2}/><rect x="74" y="66" width="22" height="6" rx="3" fill="#PRIMARY" ${S2}/>`),

  def('scrna-seq-droplet', 'scRNA-seq droplet', ['scrna-seq', 'single cell', 'droplet', '10x', 'drop-seq', 'emulsion', 'bead', 'cell'], '0 0 100 100', 100, 100, BLUE, '#f9a8d4',
    `<path d="M50 4 C50 4 14 44 14 62 A36 36 0 0 0 86 62 C86 44 50 4 50 4Z" fill="#ffffff" ${S}/>` +
    `<circle cx="37" cy="64" r="13" fill="#SECONDARY" ${S}/>` +
    `<circle cx="37" cy="64" r="5" fill="#ffffff" fill-opacity="0.6"/>` +
    `<path d="M72 51L78 45M76 62H84M72 69L78 75" fill="none" stroke="#1f2937" stroke-width="2.5" ${CAPS}/>` +
    `<circle cx="65" cy="60" r="12" fill="#PRIMARY" ${S}/>`),

  def('single-cell-barcoded-bead', 'Barcoded bead', ['bead', 'barcode', 'gel bead', 'oligo', 'single cell', 'umi', 'capture'], '0 0 100 100', 100, 100, BLUE, ORANGE,
    `<path d="M78 50H90M69.8 69.8L78.3 78.3M50 78V90M30.2 69.8L21.7 78.3M22 50H10M30.2 30.2L21.7 21.7M50 22V10M69.8 30.2L78.3 21.7" fill="none" stroke="#1f2937" stroke-width="3" ${CAPS}/>` +
    `<circle cx="92" cy="50" r="3.5" fill="#SECONDARY" ${S2}/><circle cx="79.7" cy="79.7" r="3.5" fill="#SECONDARY" ${S2}/>` +
    `<circle cx="50" cy="92" r="3.5" fill="#SECONDARY" ${S2}/><circle cx="20.3" cy="79.7" r="3.5" fill="#SECONDARY" ${S2}/>` +
    `<circle cx="8" cy="50" r="3.5" fill="#SECONDARY" ${S2}/><circle cx="20.3" cy="20.3" r="3.5" fill="#SECONDARY" ${S2}/>` +
    `<circle cx="50" cy="8" r="3.5" fill="#SECONDARY" ${S2}/><circle cx="79.7" cy="20.3" r="3.5" fill="#SECONDARY" ${S2}/>` +
    `<circle cx="50" cy="50" r="28" fill="#PRIMARY" ${S}/>` +
    `<circle cx="40" cy="40" r="7" fill="#ffffff" fill-opacity="0.5"/>`),

  def('atac-seq', 'ATAC-seq', ['atac-seq', 'atac', 'open chromatin', 'accessibility', 'tn5', 'transposase', 'epigenomics'], '0 0 100 70', 100, 70, BLUE, GREEN,
    tube('M4 46H96', '#PRIMARY', 4) +
    `<circle cx="16" cy="46" r="12" fill="#9ca3af" ${S}/><circle cx="84" cy="46" r="12" fill="#9ca3af" ${S}/>` +
    `<ellipse cx="42" cy="32" rx="11" ry="9" fill="#SECONDARY" ${S}/><ellipse cx="58" cy="32" rx="11" ry="9" fill="#SECONDARY" ${S}/>`),

  def('chip-seq', 'ChIP-seq', ['chip-seq', 'chip', 'chromatin immunoprecipitation', 'histone', 'antibody', 'transcription factor', 'binding'], '0 0 100 90', 100, 90, BLUE, PURPLE,
    `<circle cx="40" cy="56" r="20" fill="#9ca3af" ${S}/>` +
    tube('M4 56 H20 A20 20 0 0 1 60 56 H96', '#PRIMARY', 4) +
    tube('M66 44 L74 28 L62 12 M74 28 L92 18', '#SECONDARY', 5)),

  def('proteomics', 'Proteomics', ['proteomics', 'mass spectrometry', 'mass spec', 'ms', 'spectrum', 'peptides', 'lc-ms'], '0 0 100 90', 100, 90, PURPLE, ORANGE,
    `<path d="M8 80H94" fill="none" stroke="#1f2937" stroke-width="2.5" ${CAPS}/>` +
    `<path d="M24 80V56M32 80V40M40 80V66M50 80V24M58 80V50M68 80V62M78 80V36M86 80V70" fill="none" stroke="#SECONDARY" stroke-width="3.5" ${CAPS}/>` +
    `<path d="M22 10 C32 8 40 16 38 26 C36 36 24 38 16 32 C8 26 12 12 22 10z" fill="#PRIMARY" ${S}/>` +
    `<path d="M16 24l4 -6 4 6 4 -6 4 6" fill="none" stroke="#ffffff" stroke-width="2.5" ${CAPS}/>`),

  def('metabolomics', 'Metabolomics', ['metabolomics', 'metabolites', 'small molecules', 'mass spec', 'spectrum', 'nmr', 'lipidomics'], '0 0 100 90', 100, 90, GREEN, ORANGE,
    `<path d="M8 80H94" fill="none" stroke="#1f2937" stroke-width="2.5" ${CAPS}/>` +
    `<path d="M18 80V60M28 80V48M40 80V70M50 80V54M62 80V66M72 80V44M84 80V62" fill="none" stroke="#SECONDARY" stroke-width="3.5" ${CAPS}/>` +
    `<polygon points="22,11 31.5,16.5 31.5,27.5 22,33 12.5,27.5 12.5,16.5" fill="#PRIMARY" ${S}/>` +
    `<path d="M52 18L64 26L76 16" fill="none" stroke="#1f2937" stroke-width="3" ${CAPS}/>` +
    `<circle cx="52" cy="18" r="6" fill="#PRIMARY" ${S}/><circle cx="64" cy="26" r="6" fill="#PRIMARY" ${S}/><circle cx="76" cy="16" r="6" fill="#PRIMARY" ${S}/>`),

  def('flow-cytometry-plot', 'Flow cytometry plot', ['flow cytometry', 'facs', 'scatter plot', 'gating', 'gate', 'dot plot', 'fsc', 'ssc'], '0 0 100 100', 100, 100, BLUE, ORANGE,
    `<path d="M14 6V86H94" fill="none" stroke="#1f2937" stroke-width="2.5" ${CAPS}/>` +
    `<ellipse cx="42" cy="62" rx="16" ry="11" fill="#PRIMARY" fill-opacity="0.8"/>` +
    `<path d="M30 58H54M32 66H52" fill="none" stroke="#1f2937" stroke-width="3" stroke-linecap="round" stroke-dasharray="0.1 6"/>` +
    `<ellipse cx="70" cy="32" rx="13" ry="10" fill="#SECONDARY" fill-opacity="0.8"/>` +
    `<path d="M60 29H80M62 36H78" fill="none" stroke="#1f2937" stroke-width="3" stroke-linecap="round" stroke-dasharray="0.1 6"/>` +
    `<polygon points="52,14 90,14 92,50 50,52" fill="none" stroke="#1f2937" stroke-width="2" stroke-linejoin="round" stroke-dasharray="5 3"/>`),

  def('immunofluorescence-image', 'Immunofluorescence image', ['immunofluorescence', 'if', 'microscopy image', 'fluorescence', 'confocal', 'dapi', 'staining'], '0 0 100 100', 100, 100, GREEN, BLUE,
    `<rect x="4" y="4" width="92" height="92" rx="4" fill="#1f2937" ${S}/>` +
    `<circle cx="34" cy="36" r="18" fill="#PRIMARY" fill-opacity="0.35"/><circle cx="34" cy="36" r="12" fill="#PRIMARY"/><circle cx="34" cy="36" r="5.5" fill="#SECONDARY"/>` +
    `<circle cx="66" cy="56" r="20" fill="#PRIMARY" fill-opacity="0.35"/><circle cx="66" cy="56" r="14" fill="#PRIMARY"/><circle cx="66" cy="56" r="6.5" fill="#SECONDARY"/>` +
    `<circle cx="40" cy="74" r="15" fill="#PRIMARY" fill-opacity="0.35"/><circle cx="40" cy="74" r="9" fill="#PRIMARY"/><circle cx="40" cy="74" r="4" fill="#SECONDARY"/>`),
]
