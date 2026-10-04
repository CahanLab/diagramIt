import type { Ontogeny } from '../types'

/**
 * Human embryonic development: zygote → blastocyst → gastrulation → organogenesis
 * → early fetal cell types. Textbook/consensus lineage tree with human-specific
 * details (ZGA at the 4–8-cell stage, trophoblast subtypes, hypoblast-derived
 * extraembryonic mesoderm, amnion/PGC relationship) and marker genes drawn from
 * human single-cell atlases. Times are post-conceptional days (PCW = post-conceptional
 * weeks); Carnegie stages (CS) are noted in descriptions where useful.
 */
export const graph: Ontogeny = {
  id: 'human-embryo',
  name: 'Human embryonic development',
  organism: 'Homo sapiens',
  source:
    'Petropoulos et al. 2016 Cell; Xiang et al. 2020 Nature; Tyser et al. 2021 Nature (CS7 gastrula); Zeng et al. 2023 Cell Stem Cell (human gastrulation & early brain atlas); Molè et al. 2021 Nat Commun; Popescu et al. 2019 Nature (fetal liver haematopoiesis); Larsen\'s Human Embryology 6e; O\'Rahilly & Müller Carnegie staging.',

  stages: [
    { id: 'd0', label: 'Day 0', time: 0, description: 'Fertilisation. Unit for all stage times: post-conceptional days (PCW n = post-conceptional week n; add 2 weeks for gestational/LMP age).' },
    { id: 'd1-3', label: 'Day 1–3', time: 2, description: 'Cleavage divisions in the oviduct; zygotic genome activation (ZGA) at the 4–8-cell stage.' },
    { id: 'd4', label: 'Day 4', time: 4, description: 'Compacted morula (16–32 cells); apical-basal polarity primes inside/outside fates.' },
    { id: 'd5-6', label: 'Day 5–6', time: 5.5, description: 'Blastocyst: trophectoderm and inner cell mass; hatching from the zona pellucida.' },
    { id: 'd7-9', label: 'Day 7–9', time: 8, description: 'Implantation. Epiblast/hypoblast segregation completes; primitive syncytium forms; amniotic cavity appears (CS5).' },
    { id: 'd14', label: 'Day 14 (PCW 2)', time: 14, description: 'Bilaminar disc with amnion and secondary yolk sac; extraembryonic mesoderm present before the streak (CS6).' },
    { id: 'pcw3', label: 'PCW 3', time: 17, description: 'Gastrulation (primitive streak from ~day 14–16; CS7–9). Neural plate, first somites, cardiac crescent, yolk-sac blood islands.' },
    { id: 'pcw4', label: 'PCW 4', time: 24, description: 'Neurulation (tube closes ~day 26–28), heart tube loops and beats, gut tube and foregut buds, limb buds (CS10–13).' },
    { id: 'pcw5', label: 'PCW 5', time: 31, description: 'Brain vesicles, pharyngeal arches, metanephros, gonadal ridge, AGM haematopoiesis (CS14–15).' },
    { id: 'pcw6', label: 'PCW 6', time: 38, description: 'Early organogenesis: chondrification, lens fibres, DRG and sympathetic neurogenesis (CS16–17).' },
    { id: 'pcw8', label: 'PCW 8', time: 52, description: 'End of embryonic period (CS23); cortical neurogenesis begins, ossification starts, fetal liver is the main haematopoietic site.' },
    { id: 'pcw10', label: 'PCW 10', time: 66, description: 'Early fetal period: first insulin+ cells, thyroid colloid, intestinal villi.' },
    { id: 'pcw12', label: 'PCW 12', time: 80, description: 'Cortical plate established; oocytes enter meiosis; mature thymocytes.' },
    { id: 'fetal', label: 'Fetal', time: 112, description: 'Second trimester onward (PCW 16+): gliogenesis, cerebellar granule neurogenesis, surfactant-producing AT2 cells.' },
  ],

  lineages: [
    { id: 'extraembryonic', label: 'Extraembryonic', color: '#7f7f7f' },
    { id: 'pluripotent', label: 'Pluripotent / early embryo', color: '#4d4d4d' },
    { id: 'ectoderm', label: 'Ectoderm', color: '#1f77b4' },
    { id: 'neural-crest', label: 'Neural crest', color: '#17becf' },
    { id: 'mesoderm', label: 'Mesoderm', color: '#d62728' },
    { id: 'endoderm', label: 'Endoderm', color: '#bcbd22' },
    { id: 'blood', label: 'Blood & endothelium', color: '#ff7f0e' },
    { id: 'germline', label: 'Germline', color: '#9467bd' },
  ],

  nodes: [
    // ───────────────────────── Early embryo (pluripotent) ─────────────────────────
    { id: 'zygote', label: 'Zygote', parents: [], stage: 'd0', lineage: 'pluripotent', iconId: 'cells.generic-cell', description: 'Fertilised oocyte; transcriptionally silent, relying on maternal transcripts.' },
    { id: 'two-cell', label: '2-cell embryo', parents: ['zygote'], stage: 'd1-3', iconId: 'cells.dividing-cell', description: 'First cleavage ~day 1.' },
    { id: 'four-cell', label: '4-cell embryo', parents: ['two-cell'], stage: 'd1-3', markers: 'DUX4 LEUTX', iconId: 'cells.dividing-cell', description: 'Day 2. Minor ZGA: DUX4 and the paired-like homeobox genes LEUTX/TPRX1/ZSCAN4 are transiently expressed.' },
    { id: 'eight-cell', label: '8-cell embryo', parents: ['four-cell'], stage: 'd1-3', markers: 'TPRX1 KLF17', iconId: 'cells.dividing-cell', description: 'Day 3. Major ZGA (later than in mouse, where it is at the 2-cell stage); compaction begins.' },
    { id: 'morula', label: 'Morula', parents: ['eight-cell'], stage: 'd4', markers: 'TEAD4 KLF17', iconId: 'cells.cell-cluster-loose', description: 'Compacted 16–32-cell embryo. Outer polarised cells are biased to trophectoderm; lineage markers are initially co-expressed in human.' },
    { id: 'icm', label: 'Inner cell mass (ICM)', parents: ['morula'], stage: 'd5-6', markers: 'POU5F1 NANOG', iconId: 'tissues.blastocyst', description: 'Pluripotent inner cells of the blastocyst; in human, epiblast and hypoblast segregate from the ICM at day 6–7.' },
    { id: 'epiblast', label: 'Epiblast', parents: ['icm'], stage: 'd7-9', markers: 'POU5F1 NANOG SOX2', iconId: 'cells.esc-colony-flat', description: 'Naive pluripotent epiblast (source of hESC-like primed cells by day 14). Gives rise to all embryonic lineages, amnion and PGCs.' },

    // ───────────────────────── Extraembryonic ─────────────────────────
    { id: 'trophectoderm', label: 'Trophectoderm (TE)', parents: ['morula'], stage: 'd5-6', lineage: 'extraembryonic', markers: 'GATA3 GATA2 KRT7', iconId: 'cells.epithelial-sheet', description: 'Outer epithelium of the blastocyst; polar TE attaches to the uterine epithelium at implantation.' },
    { id: 'cytotrophoblast', label: 'Cytotrophoblast', parents: ['trophectoderm'], stage: 'd7-9', markers: 'TP63 ELF5 TEAD4', iconId: 'cells.epithelial-sheet', description: 'Proliferative mononuclear trophoblast stem compartment (villous cytotrophoblast).' },
    { id: 'syncytiotrophoblast', label: 'Syncytiotrophoblast', parents: ['cytotrophoblast'], stage: 'd7-9', markers: 'CGB SDC1 ERVW-1', terminal: true, description: 'Multinucleated invasive syncytium formed by cell fusion (syncytin-1/ERVW-1); secretes hCG. Primitive syncytium at implantation, later villous syncytiotrophoblast.' },
    { id: 'evt', label: 'Extravillous trophoblast (EVT)', parents: ['cytotrophoblast'], stage: 'd14', markers: 'HLA-G ITGA5 MMP2', terminal: true, description: 'Invasive trophoblast from anchoring-villus cell columns; remodels spiral arteries.' },
    { id: 'hypoblast', label: 'Hypoblast', parents: ['icm'], stage: 'd7-9', lineage: 'extraembryonic', markers: 'SOX17 GATA6 PDGFRA', description: 'Primitive endoderm equivalent; lines the blastocoel and forms the yolk sac and anterior visceral endoderm-like signalling centre.' },
    { id: 'yolk-sac-endoderm', label: 'Yolk-sac endoderm', parents: ['hypoblast'], stage: 'd14', markers: 'APOA1 TTR AFP', terminal: true, description: 'Visceral/parietal endoderm of the primary then secondary yolk sac; nutrient transport and serum protein secretion.' },
    { id: 'exm', label: 'Extraembryonic mesoderm', parents: ['hypoblast', 'epiblast'], stage: 'd14', lineage: 'extraembryonic', markers: 'FOXF1 HAND1', description: 'Appears at ~day 11–12, before the primitive streak. Human origin is debated: a hypoblast/yolk-sac origin (Molè et al. 2021; non-human primate data) is shown as primary and an epiblast origin as secondary. Forms chorion, connecting stalk, allantois and yolk-sac mesoderm (blood islands).' },
    { id: 'amnion', label: 'Amnion (amniotic ectoderm)', parents: ['epiblast'], stage: 'd14', lineage: 'extraembryonic', markers: 'ISL1 GABRP VTCN1', terminal: true, description: 'Squamous epithelium roofing the amniotic cavity (cavity forms ~day 8). In primates, BMP-responsive amnion is a proposed source of PGC specification signals.' },

    // ───────────────────────── Germline ─────────────────────────
    { id: 'pgc', label: 'Primordial germ cells (PGC)', parents: ['epiblast', 'amnion'], stage: 'pcw3', lineage: 'germline', markers: 'SOX17 PRDM1 NANOS3', description: 'Specified ~day 12–16 (PCW 2–3) in posterior epiblast/amnion (seen at CS7; Tyser et al. 2021); SOX17 is upstream of PRDM1 in human, unlike mouse. Migrate via hindgut to the gonadal ridge by PCW 5–6.' },
    { id: 'gonocyte', label: 'Gonocytes (prospermatogonia)', parents: ['pgc'], stage: 'pcw8', markers: 'DDX4 DAZL', terminal: true, description: 'Male germ cells enclosed in testis cords; enter mitotic arrest, resume as spermatogonia postnatally.' },
    { id: 'oocyte', label: 'Oogonia → primary oocytes', parents: ['pgc'], stage: 'pcw12', markers: 'STRA8 SYCP3 FIGLA', iconId: 'cells.oocyte', terminal: true, description: 'Female germ cells enter meiosis from ~PCW 10–12 and arrest at diplotene of prophase I within primordial follicles.' },

    // ───────────────────────── Gastrulation: primitive streak & mesoderm ─────────────────────────
    { id: 'primitive-streak', label: 'Primitive streak', parents: ['epiblast'], stage: 'pcw3', lineage: 'mesoderm', markers: 'TBXT MIXL1 EOMES', iconId: 'tissues.gastrula', description: 'Posterior epiblast undergoing EMT and ingression from ~day 14–16 (CS6b–7); source of mesoderm and definitive endoderm.' },
    { id: 'notochord', label: 'Notochord (axial mesoderm)', parents: ['primitive-streak'], stage: 'pcw4', markers: 'TBXT SHH FOXA2', terminal: true, description: 'Notochordal process (day 17) → definitive notochord; patterns neural tube and somites, persists as nucleus pulposus.' },
    { id: 'paraxial-mesoderm', label: 'Paraxial (presomitic) mesoderm', parents: ['primitive-streak'], stage: 'pcw3', markers: 'TBX6 MSGN1 HES7', iconId: 'cells.mesoderm-cells', description: 'Segmentation clock (~5 h period in human) generates somites from day 20.' },
    { id: 'somite', label: 'Somite', parents: ['paraxial-mesoderm'], stage: 'pcw4', markers: 'MEOX1 FOXC2', description: 'Epithelial somites (42–44 pairs by ~day 30), patterned by notochord/neural tube SHH and surface ectoderm WNT.' },
    { id: 'sclerotome', label: 'Sclerotome', parents: ['somite'], stage: 'pcw5', markers: 'PAX1 PAX9 NKX3-2', description: 'Ventromedial somite; forms vertebrae, ribs and intervertebral discs.' },
    { id: 'chondrocyte', label: 'Chondrocytes', parents: ['sclerotome', 'limb-mesenchyme', 'cnc-mesenchyme'], stage: 'pcw6', markers: 'SOX9 COL2A1 ACAN', iconId: 'cells.chondrocyte', terminal: true, description: 'Cartilage anlagen appear PCW 6–7 in axial skeleton (sclerotome), limbs (lateral plate) and face (neural crest).' },
    { id: 'osteoblast', label: 'Osteoblasts', parents: ['sclerotome', 'limb-mesenchyme', 'cnc-mesenchyme'], stage: 'pcw8', markers: 'RUNX2 SP7 COL1A1', iconId: 'cells.osteoblast', terminal: true, description: 'Endochondral ossification from PCW 7–8 (clavicle, mandible earliest); intramembranous bone of the skull vault from neural crest and head mesoderm.' },
    { id: 'dermomyotome', label: 'Dermomyotome', parents: ['somite'], stage: 'pcw5', markers: 'PAX3 PAX7 EN1', description: 'Dorsolateral somite; myotome (trunk/limb muscle) and dermatome (dorsal dermis).' },
    { id: 'myoblast', label: 'Myoblasts', parents: ['dermomyotome'], stage: 'pcw6', markers: 'PAX7 MYF5 MYOD1', description: 'Committed myogenic cells; limb muscle precursors migrate from the hypaxial dermomyotome.' },
    { id: 'skeletal-muscle', label: 'Skeletal muscle fibres', parents: ['myoblast'], stage: 'pcw8', markers: 'MYOG MYH3 ACTA1', iconId: 'cells.skeletal-muscle-fiber', terminal: true, description: 'Primary myotubes fuse PCW 7–9; embryonic myosin MYH3.' },
    { id: 'intermediate-mesoderm', label: 'Intermediate mesoderm', parents: ['primitive-streak'], stage: 'pcw4', markers: 'OSR1 PAX2 LHX1', description: 'Nephrogenic cord: pronephros (vestigial), mesonephros (PCW 4–8) and metanephros; also gonadal ridge.' },
    { id: 'nephron-progenitor', label: 'Nephron progenitors (cap mesenchyme)', parents: ['intermediate-mesoderm'], stage: 'pcw5', markers: 'SIX2 CITED1 WT1', iconId: 'tissues.kidney', description: 'Metanephric mesenchyme induced by the ureteric bud from PCW 5; nephrogenesis continues to ~PCW 34–36.' },
    { id: 'podocyte', label: 'Podocytes', parents: ['nephron-progenitor'], stage: 'pcw8', markers: 'NPHS1 NPHS2 WT1', iconId: 'cells.podocyte', terminal: true, description: 'Glomerular visceral epithelium; first glomeruli ~PCW 8–9.' },
    { id: 'tubule-epithelium', label: 'Nephron tubule epithelium', parents: ['nephron-progenitor'], stage: 'pcw8', markers: 'HNF1B LRP2 CUBN', iconId: 'cells.epithelial-sheet', terminal: true, description: 'Proximal/distal tubule and loop of Henle from renal vesicle → S-shaped body.' },
    { id: 'gonadal-ridge', label: 'Gonadal ridge (coelomic epithelium)', parents: ['intermediate-mesoderm'], stage: 'pcw5', markers: 'GATA4 WT1 NR5A1', description: 'Bipotential genital ridge on the medial mesonephros, colonised by PGCs PCW 5–6.' },
    { id: 'gonad-supporting', label: 'Sertoli / granulosa cells', parents: ['gonadal-ridge'], stage: 'pcw8', markers: 'SOX9 AMH | FOXL2', terminal: true, description: 'Supporting-cell lineage: SRY→SOX9 Sertoli cells form testis cords from PCW 6–7; FOXL2+ pre-granulosa cells in the ovary.' },
    { id: 'lateral-plate', label: 'Lateral plate mesoderm', parents: ['primitive-streak'], stage: 'pcw3', markers: 'FOXF1 HAND1', description: 'Splits into somatic (limb, body wall) and splanchnic (heart, gut mesenchyme, vessels) layers around the coelom.' },
    { id: 'fhf', label: 'First heart field', parents: ['lateral-plate'], stage: 'pcw3', markers: 'NKX2-5 HAND1 TBX5', iconId: 'tissues.heart', description: 'Cardiac crescent (day 18–19) → linear heart tube (day 21–22); left ventricle and atria.' },
    { id: 'shf', label: 'Second heart field', parents: ['lateral-plate'], stage: 'pcw4', markers: 'ISL1 TBX1 FGF10', description: 'Pharyngeal mesoderm added to the poles during looping; right ventricle and outflow tract.' },
    { id: 'cardiomyocyte', label: 'Cardiomyocytes', parents: ['fhf', 'shf'], stage: 'pcw4', markers: 'TNNT2 MYH6 NKX2-5', iconId: 'cells.cardiomyocyte', terminal: true, description: 'First contractions ~day 21–22; chamber myocardium forms during looping PCW 4.' },
    { id: 'limb-mesenchyme', label: 'Limb bud mesenchyme', parents: ['lateral-plate'], stage: 'pcw4', markers: 'PRRX1 TBX5 TBX4', description: 'Upper limb buds ~day 26, lower ~day 28 (TBX5 forelimb, TBX4 hindlimb); forms limb cartilage, bone, tendon and dermis.' },

    // ───────────────────────── Blood & endothelium ─────────────────────────
    { id: 'angioblast', label: 'Angioblasts', parents: ['lateral-plate', 'exm'], stage: 'pcw3', lineage: 'blood', markers: 'ETV2 KDR TAL1', description: 'Endothelial progenitors arising in splanchnic and extraembryonic mesoderm; vasculogenesis from day 17–18.' },
    { id: 'endothelial-cell', label: 'Endothelial cells', parents: ['angioblast'], stage: 'pcw4', markers: 'PECAM1 CDH5 KDR', iconId: 'cells.endothelial-cell', terminal: true, description: 'Dorsal aortae, cardinal veins and capillary plexus.' },
    { id: 'haemogenic-endothelium', label: 'Haemogenic endothelium (AGM)', parents: ['angioblast'], stage: 'pcw4', markers: 'RUNX1 CDH5 KDR', description: 'Ventral dorsal aorta in the aorta-gonad-mesonephros region (CS13–15); intra-aortic clusters at ~day 27–40.' },
    { id: 'hsc', label: 'Haematopoietic stem cell (HSC)', parents: ['haemogenic-endothelium'], stage: 'pcw5', markers: 'CD34 SPINK2 HLF', description: 'Definitive HSCs emerge by endothelial-to-haematopoietic transition (EHT) in the AGM (CS14–17), then colonise fetal liver (PCW 5–6), and bone marrow from ~PCW 10–11.' },
    { id: 'fl-erythrocyte', label: 'Definitive erythrocytes (fetal liver)', parents: ['hsc'], stage: 'pcw8', markers: 'HBG1 GYPA KLF1', iconId: 'cells.red-blood-cell', terminal: true, description: 'Fetal liver is the dominant erythropoietic site PCW 8–20; fetal haemoglobin (α2γ2).' },
    { id: 't-cell', label: 'T cells (thymus)', parents: ['hsc'], stage: 'pcw12', markers: 'CD3E CD4 CD8', iconId: 'cells.t-cell', terminal: true, description: 'Lymphoid progenitors seed the thymus from PCW 8–9; mature single-positive thymocytes by PCW 12–14.' },
    { id: 'ys-blood-island', label: 'Yolk-sac blood islands', parents: ['exm'], stage: 'pcw3', lineage: 'blood', markers: 'TAL1 GATA1 KDR', description: 'Haemangioblastic foci in yolk-sac mesoderm from day 16–19: primitive erythroid, megakaryocyte and erythro-myeloid progenitors (EMP).' },
    { id: 'primitive-erythrocyte', label: 'Primitive erythrocytes', parents: ['ys-blood-island'], stage: 'pcw4', markers: 'HBZ HBE1 GYPA', iconId: 'cells.red-blood-cell', terminal: true, description: 'Large nucleated erythrocytes with embryonic globins (ζ, ε); first circulate ~day 21.' },
    { id: 'ys-macrophage', label: 'Yolk-sac macrophages / microglia', parents: ['ys-blood-island'], stage: 'pcw5', markers: 'PTPRC CD68 CX3CR1', iconId: 'cells.macrophage', terminal: true, description: 'EMP-derived macrophages colonise tissues before HSC-derived monocytes; microglia enter the brain from ~PCW 4.5–5.' },

    // ───────────────────────── Endoderm ─────────────────────────
    { id: 'definitive-endoderm', label: 'Definitive endoderm', parents: ['primitive-streak'], stage: 'pcw3', lineage: 'endoderm', markers: 'SOX17 FOXA2 CXCR4', description: 'Anterior streak derivative that intercalates into and displaces the hypoblast layer (CS7–8).' },
    { id: 'gut-tube', label: 'Gut tube endoderm', parents: ['definitive-endoderm'], stage: 'pcw4', markers: 'FOXA1 FOXA2 HNF1B', description: 'Embryonic folding (PCW 4) encloses the gut tube with foregut, midgut (open to yolk sac) and hindgut regions.' },
    { id: 'foregut', label: 'Foregut', parents: ['gut-tube'], stage: 'pcw4', markers: 'SOX2 HHEX', description: 'Pharynx, oesophagus, stomach, proximal duodenum and buds of thyroid (day 20–24), liver (day 22–25), lung (day 26–28) and pancreas (day 26–30).' },
    { id: 'lung-bud', label: 'Lung bud epithelium', parents: ['foregut'], stage: 'pcw5', markers: 'NKX2-1 SOX9 FOXA2', iconId: 'tissues.lung', description: 'Respiratory diverticulum → branching bronchial tree (pseudoglandular stage PCW 5–16); SOX9+ distal tips.' },
    { id: 'at2', label: 'Alveolar type 2 cells (AT2)', parents: ['lung-bud'], stage: 'fetal', markers: 'SFTPC SFTPB NKX2-1', iconId: 'tissues.lung', terminal: true, description: 'Surfactant-producing cells differentiating from the canalicular stage (~PCW 20–24).' },
    { id: 'hepatoblast', label: 'Hepatoblasts', parents: ['foregut'], stage: 'pcw5', markers: 'AFP HNF4A TBX3', iconId: 'tissues.liver', description: 'Bipotent liver bud cells invading septum transversum mesenchyme; give hepatocytes and cholangiocytes.' },
    { id: 'hepatocyte', label: 'Hepatocytes', parents: ['hepatoblast'], stage: 'pcw8', markers: 'ALB APOA1 CYP3A7', iconId: 'cells.hepatocyte', terminal: true, description: 'Fetal hepatocytes (CYP3A7 is the fetal P450); liver also hosts haematopoiesis PCW 6–20.' },
    { id: 'pancreatic-progenitor', label: 'Pancreatic progenitors', parents: ['foregut'], stage: 'pcw5', markers: 'PDX1 PTF1A SOX9', iconId: 'tissues.pancreas', description: 'Dorsal and ventral buds (fuse PCW 6–7); multipotent tip/trunk progenitors.' },
    { id: 'beta-cell', label: 'β cells', parents: ['pancreatic-progenitor'], stage: 'pcw10', markers: 'INS NKX6-1 PDX1', iconId: 'cells.beta-cell', terminal: true, description: 'Via NEUROG3+ endocrine progenitors; first INS+ cells ~PCW 8–9, islets by PCW 12–14.' },
    { id: 'thyrocyte', label: 'Thyroid follicular cells', parents: ['foregut'], stage: 'pcw10', markers: 'TG TPO TSHR', terminal: true, description: 'From the NKX2-1/PAX8/FOXE1+ thyroid diverticulum at the foramen caecum (day 20–24); colloid and T4 production from ~PCW 10–11.' },
    { id: 'midgut-hindgut', label: 'Midgut / hindgut', parents: ['gut-tube'], stage: 'pcw4', markers: 'CDX2 CDX1', description: 'Distal duodenum to rectum; midgut herniates into the umbilical cord PCW 6–10.' },
    { id: 'intestinal-stem', label: 'Intestinal progenitors (LGR5+)', parents: ['midgut-hindgut'], stage: 'pcw8', markers: 'LGR5 OLFM4 CDX2', iconId: 'tissues.intestine', description: 'Pseudostratified epithelium converts to villi (PCW 9–10); LGR5+ stem cells localise to intervillus/crypt domains.' },
    { id: 'enterocyte', label: 'Enterocytes', parents: ['intestinal-stem'], stage: 'pcw12', markers: 'VIL1 FABP2 APOA4', iconId: 'cells.epithelial-sheet', terminal: true, description: 'Absorptive cells with brush border; secretory lineages (goblet, enteroendocrine, Paneth) arise in parallel.' },

    // ───────────────────────── Ectoderm: surface ─────────────────────────
    { id: 'surface-ectoderm', label: 'Surface ectoderm', parents: ['epiblast'], stage: 'pcw3', lineage: 'ectoderm', markers: 'TFAP2A KRT8 KRT18', description: 'Non-neural ectoderm remaining in the epiblast after gastrulation; epidermis, cranial placodes, oral/nasal epithelia.' },
    { id: 'keratinocyte', label: 'Basal keratinocytes', parents: ['surface-ectoderm'], stage: 'pcw8', markers: 'KRT5 KRT14 TP63', iconId: 'cells.keratinocyte', terminal: true, description: 'Periderm covers the embryo PCW 4–8; stratification of the epidermis begins ~PCW 8–9.' },
    { id: 'lens-fibre', label: 'Lens fibre cells', parents: ['surface-ectoderm'], stage: 'pcw6', markers: 'PAX6 CRYAA', iconId: 'tissues.eye', terminal: true, description: 'Lens placode (day 28) induced by the optic vesicle → lens vesicle (PCW 5) → primary lens fibres (PCW 6–7).' },

    // ───────────────────────── Ectoderm: neural ─────────────────────────
    { id: 'neural-plate', label: 'Neural plate', parents: ['epiblast'], stage: 'pcw3', lineage: 'ectoderm', markers: 'SOX2 PAX6 OTX2', iconId: 'cells.neural-progenitor', description: 'Neuroectoderm induced by the node/notochord (day 18); anterior–posterior patterned by OTX2/GBX2 (Zeng et al. 2023 CS8–10 atlas).' },
    { id: 'neural-tube', label: 'Neural tube', parents: ['neural-plate'], stage: 'pcw4', markers: 'SOX2 PAX6 NES', iconId: 'tissues.neural-tube', description: 'Neurulation: folds fuse from the cervical region; anterior neuropore closes ~day 25, posterior ~day 27–28.' },
    { id: 'forebrain', label: 'Forebrain (prosencephalon)', parents: ['neural-tube'], stage: 'pcw5', markers: 'FOXG1 SIX3 OTX2', iconId: 'tissues.brain', description: 'Telencephalic vesicles and diencephalon (PCW 5); dorsal pallium → cortex, ventral subpallium → ganglionic eminences.' },
    { id: 'cortical-rg', label: 'Cortical radial glia', parents: ['forebrain'], stage: 'pcw8', markers: 'PAX6 SOX2 HES5', iconId: 'cells.neural-progenitor', description: 'Ventricular radial glia (apical) and HOPX+ outer radial glia (basal); cortical neurogenesis ~PCW 7–28.' },
    { id: 'excitatory-neuron', label: 'Cortical excitatory neurons', parents: ['cortical-rg'], stage: 'pcw10', markers: 'NEUROD2 SLC17A7 TBR1', iconId: 'cells.neuron', terminal: true, description: 'Glutamatergic projection neurons generated inside-out via EOMES+ intermediate progenitors; cortical plate from PCW 8–9.' },
    { id: 'ganglionic-eminence', label: 'Ganglionic eminences', parents: ['forebrain'], stage: 'pcw8', markers: 'NKX2-1 DLX2 ASCL1', description: 'Subpallial progenitor domains (MGE NKX2-1+, LGE/CGE DLX2+); source of cortical interneurons and striatal neurons.' },
    { id: 'interneuron', label: 'Cortical GABAergic interneurons', parents: ['ganglionic-eminence'], stage: 'fetal', markers: 'GAD1 GAD2 LHX6', iconId: 'cells.neuron', terminal: true, description: 'Tangentially migrating interneurons (LHX6+ MGE-derived PV/SST; CGE-derived VIP) populate cortex through late gestation.' },
    { id: 'midbrain', label: 'Midbrain (mesencephalon)', parents: ['neural-tube'], stage: 'pcw5', markers: 'EN1 LMX1A OTX2', description: 'Patterned by the isthmic organiser (FGF8/WNT1); floor plate is neurogenic in the midbrain.' },
    { id: 'da-neuron', label: 'Midbrain dopaminergic neurons', parents: ['midbrain'], stage: 'pcw8', markers: 'TH NR4A2 LMX1A', iconId: 'cells.neuron', terminal: true, description: 'Substantia nigra / VTA neurons born from the floor plate PCW 6–9.' },
    { id: 'hindbrain', label: 'Hindbrain (rhombencephalon)', parents: ['neural-tube'], stage: 'pcw5', markers: 'GBX2 HOXA2', description: 'Rhombomeres r1–r8; cerebellum from dorsal r1 and the rhombic lip, pons and medulla.' },
    { id: 'cerebellar-neuron', label: 'Cerebellar neurons', parents: ['hindbrain'], stage: 'fetal', markers: 'ATOH1 PCP2 CALB1', iconId: 'cells.neuron', terminal: true, description: 'Purkinje cells (PCP2/CALB1) born from the ventricular zone PCW 7–9; ATOH1+ rhombic-lip granule precursors form the external granular layer and proliferate into infancy.' },
    { id: 'spinal-cord', label: 'Spinal cord', parents: ['neural-tube'], stage: 'pcw5', markers: 'SOX2 PAX6 HOXB9', iconId: 'tissues.spinal-cord', description: 'Caudal neural tube; dorsoventral progenitor domains set by SHH (ventral) and BMP/WNT (dorsal).' },
    { id: 'motor-neuron', label: 'Spinal motor neurons', parents: ['spinal-cord'], stage: 'pcw6', markers: 'MNX1 ISL1 CHAT', iconId: 'cells.neuron', terminal: true, description: 'From the OLIG2+ pMN domain; first motor neurons CS13–15 (PCW 4–5), axons reach limb muscles PCW 6–7.' },

    // ───────────────────────── Neural crest ─────────────────────────
    { id: 'neural-crest', label: 'Neural crest', parents: ['neural-tube'], stage: 'pcw4', lineage: 'neural-crest', markers: 'SOX10 FOXD3 TFAP2A', description: 'Multipotent cells delaminating from the dorsal neural folds/tube by EMT (cranial crest before tube closure, ~day 22–28).' },
    { id: 'cnc-mesenchyme', label: 'Craniofacial mesenchyme (ectomesenchyme)', parents: ['neural-crest'], stage: 'pcw5', markers: 'TWIST1 DLX5 MSX1', description: 'Cranial neural crest populating the frontonasal process and pharyngeal arches; facial cartilage, bone, dentine, meninges and pericytes.' },
    { id: 'melanocyte', label: 'Melanocytes', parents: ['neural-crest'], stage: 'pcw8', markers: 'MITF PMEL TYR', terminal: true, description: 'Melanoblasts migrate dorsolaterally and reach the epidermis PCW 7–8; a Schwann-cell-precursor route also contributes.' },
    { id: 'sensory-neuron', label: 'Sensory neurons (DRG, cranial ganglia)', parents: ['neural-crest'], stage: 'pcw6', markers: 'POU4F1 ISL1 NTRK1', iconId: 'cells.neuron', terminal: true, description: 'Dorsal root ganglion neurogenesis PCW 5–7 (NEUROG2 then NEUROG1 waves); some cranial sensory neurons are placode-derived.' },
    { id: 'sympathetic-neuron', label: 'Sympathetic neurons', parents: ['neural-crest'], stage: 'pcw6', markers: 'PHOX2B TH DBH', iconId: 'cells.neuron', terminal: true, description: 'Trunk crest condensing near the dorsal aorta (PCW 5–6); adrenal chromaffin cells arise largely via Schwann cell precursors.' },
    { id: 'enteric-neuron', label: 'Enteric neurons', parents: ['neural-crest'], stage: 'pcw6', markers: 'PHOX2B RET ELAVL4', iconId: 'cells.neuron', terminal: true, description: 'Vagal crest enters the foregut PCW 4 and colonises the whole gut by PCW 7; sacral crest contributes to the hindgut.' },
    { id: 'schwann-cell', label: 'Schwann cells', parents: ['neural-crest'], stage: 'pcw8', markers: 'SOX10 MPZ S100B', terminal: true, description: 'Via nerve-associated Schwann cell precursors (PCW 6–7) to immature Schwann cells; myelination from ~PCW 12–18.' },
  ],

  edges: [
    { from: 'epiblast', to: 'primitive-streak', label: 'EMT, ingression' },
    { from: 'cytotrophoblast', to: 'syncytiotrophoblast', label: 'cell fusion' },
    { from: 'neural-plate', to: 'neural-tube', label: 'neurulation' },
    { from: 'neural-tube', to: 'neural-crest', label: 'EMT, delamination' },
    { from: 'haemogenic-endothelium', to: 'hsc', label: 'EHT' },
    { from: 'hsc', to: 'hsc', kind: 'self' },
    { from: 'cortical-rg', to: 'cortical-rg', kind: 'self' },
    { from: 'intestinal-stem', to: 'intestinal-stem', kind: 'self' },
  ],
}
