import type { Ontogeny } from '../types'

/**
 * Mouse embryonic development, zygote to birth.
 *
 * A simplified (~90-node) rooted cell-type tree in the spirit of the
 * single-cell developmental atlases of Qiu et al. (2022, 2024) and
 * Pijuan-Sala et al. (2019), using textbook lineage relationships.
 * Time is embryonic days post coitum (E); P0 = birth (~E19.5).
 * Secondary parents (dashed) encode well-established alternative origins
 * (e.g. visceral endoderm contribution to the gut tube, neural-crest
 * contribution to cranio-facial cartilage/bone and vascular smooth muscle).
 */
export const graph: Ontogeny = {
  id: 'mouse-embryo',
  name: 'Mouse embryonic development',
  organism: 'Mus musculus',
  source:
    'Qiu et al. 2024 Nature; Qiu et al. 2022 Nat Genet; Pijuan-Sala et al. 2019 Nature; Rossant & Tam 2009 Development; Kwon et al. 2008 Dev Cell',

  stages: [
    { id: 'e0', label: 'E0', time: 0, description: 'Embryonic day (E) post coitum; P0 = birth (~E19.5). Zygote.' },
    { id: 'e1-5', label: 'E1.5', time: 1.5, description: '2-cell stage; zygotic genome activation.' },
    { id: 'e2-5', label: 'E2.5', time: 2.5, description: 'Morula (8–16 cells); compaction.' },
    { id: 'e3-5', label: 'E3.5', time: 3.5, description: 'Early blastocyst: trophectoderm and inner cell mass.' },
    { id: 'e4-5', label: 'E4.5', time: 4.5, description: 'Late blastocyst: epiblast vs primitive endoderm; implantation.' },
    { id: 'e5-5', label: 'E5.5', time: 5.5, description: 'Egg cylinder; extraembryonic ectoderm, visceral/parietal endoderm.' },
    { id: 'e6-5', label: 'E6.5', time: 6.5, description: 'Gastrulation begins: primitive streak; PGC specification (E6.25).' },
    { id: 'e7-5', label: 'E7.5', time: 7.5, description: 'Late streak / neural plate; nascent mesoderm and definitive endoderm.' },
    { id: 'e8-5', label: 'E8.5', time: 8.5, description: 'Neural tube, somites, beating heart tube, yolk-sac blood islands.' },
    { id: 'e9-5', label: 'E9.5', time: 9.5, description: 'Organogenesis begins: brain vesicles, limb buds, organ buds.' },
    { id: 'e10-5', label: 'E10.5', time: 10.5, description: 'HSC emergence in the AGM; metanephric mesenchyme; gonadal ridge.' },
    { id: 'e12-5', label: 'E12.5', time: 12.5, description: 'Neurogenesis, chondrogenesis, fetal-liver haematopoiesis.' },
    { id: 'e14-5', label: 'E14.5', time: 14.5, description: 'Fetal differentiation of many organ parenchymal cell types.' },
    { id: 'e16-5', label: 'E16.5', time: 16.5, description: 'Late fetal maturation (epidermal stratification, islet cells).' },
    { id: 'e18-5', label: 'E18.5', time: 18.5, description: 'Term fetus: gliogenesis, alveolar differentiation.' },
    { id: 'p0', label: 'P0', time: 19.5, description: 'Birth.' },
  ],

  lineages: [
    { id: 'extraembryonic', label: 'Extraembryonic', color: '#7f7f7f' },
    { id: 'pluripotent', label: 'Pluripotent / early embryo', color: '#4d4d4d' },
    { id: 'ectoderm', label: 'Ectoderm', color: '#1f77b4' },
    { id: 'neural-crest', label: 'Neural crest', color: '#17becf' },
    { id: 'mesoderm', label: 'Mesoderm', color: '#d62728' },
    { id: 'endoderm', label: 'Endoderm', color: '#bcbd22' },
    { id: 'blood', label: 'Blood / endothelium', color: '#ff7f0e' },
    { id: 'germline', label: 'Germline', color: '#9467bd' },
  ],

  nodes: [
    // ---------------------------------------------------------------- Early embryo / pluripotent
    { id: 'zygote', label: 'Zygote', parents: [], stage: 'e0', lineage: 'pluripotent', markers: 'Dppa3 (maternal)' },
    { id: 'two-cell', label: '2-cell embryo', parents: ['zygote'], stage: 'e1-5', markers: 'Zscan4 Dux', iconId: 'cells.dividing-cell' },
    { id: 'morula', label: 'Morula', parents: ['two-cell'], stage: 'e2-5', markers: 'Pou5f1 Cdx2', iconId: 'cells.cell-cluster-loose' },
    { id: 'icm', label: 'Inner cell mass (ICM)', parents: ['morula'], stage: 'e3-5', markers: 'Pou5f1 Nanog Gata6', iconId: 'tissues.blastocyst' },
    { id: 'epiblast', label: 'Epiblast', parents: ['icm'], stage: 'e4-5', markers: 'Pou5f1 Nanog Sox2', iconId: 'cells.esc-colony-flat' },
    { id: 'primitive-streak', label: 'Primitive streak', parents: ['epiblast'], stage: 'e6-5', markers: 'T Mixl1 Wnt3', iconId: 'tissues.gastrula' },

    // ---------------------------------------------------------------- Extraembryonic: trophoblast
    { id: 'trophectoderm', label: 'Trophectoderm', parents: ['morula'], stage: 'e3-5', lineage: 'extraembryonic', markers: 'Cdx2 Gata3 Eomes' },
    { id: 'exe', label: 'Extraembryonic ectoderm (ExE)', parents: ['trophectoderm'], stage: 'e5-5', markers: 'Cdx2 Elf5 Esrrb' },
    { id: 'epc', label: 'Ectoplacental cone', parents: ['exe'], stage: 'e6-5', markers: 'Ascl2 Tpbpa' },
    { id: 'tgc', label: 'Trophoblast giant cell', parents: ['epc', 'trophectoderm'], stage: 'e9-5', markers: 'Prl3d1 Hand1', terminal: true, description: 'Secondary TGCs from the ectoplacental cone; primary TGCs directly from mural trophectoderm.' },
    { id: 'spongiotrophoblast', label: 'Spongiotrophoblast', parents: ['epc'], stage: 'e10-5', markers: 'Tpbpa Prl8a8', terminal: true },
    { id: 'labyrinth', label: 'Labyrinth syncytiotrophoblast', parents: ['exe'], stage: 'e10-5', markers: 'Gcm1 Syna Synb', terminal: true, description: 'Via the chorionic ectoderm (chorion).' },

    // ---------------------------------------------------------------- Extraembryonic: primitive endoderm
    { id: 'primitive-endoderm', label: 'Primitive endoderm (PrE)', parents: ['icm'], stage: 'e4-5', lineage: 'extraembryonic', markers: 'Gata6 Sox17 Pdgfra' },
    { id: 'visceral-endoderm', label: 'Visceral / yolk-sac endoderm', parents: ['primitive-endoderm'], stage: 'e5-5', markers: 'Afp Ttr Hnf4a', terminal: true, description: 'Includes the anterior visceral endoderm signalling centre; later yolk-sac visceral endoderm.' },
    { id: 'parietal-endoderm', label: 'Parietal endoderm', parents: ['primitive-endoderm'], stage: 'e5-5', markers: 'Sparc Lamb1 Snai1', terminal: true },

    // ---------------------------------------------------------------- Extraembryonic mesoderm
    { id: 'extraembryonic-mesoderm', label: 'Extraembryonic mesoderm', parents: ['nascent-mesoderm'], stage: 'e7-5', lineage: 'extraembryonic', markers: 'Hand1 Bmp4 Ahnak' },
    { id: 'allantois', label: 'Allantois', parents: ['extraembryonic-mesoderm'], stage: 'e8-5', markers: 'Tbx4 Hoxa13 Cdx2', terminal: true },
    { id: 'amnion-mesoderm', label: 'Amnion mesoderm', parents: ['extraembryonic-mesoderm'], stage: 'e7-5', markers: 'Postn Bmp4', terminal: true },

    // ---------------------------------------------------------------- Germline
    { id: 'pgc', label: 'Primordial germ cell (PGC)', parents: ['epiblast'], stage: 'e6-5', lineage: 'germline', markers: 'Prdm1 Prdm14 Tfap2c', description: 'Specified ~E6.25 in the proximal posterior epiblast by BMP4 from the ExE.' },
    { id: 'oocyte', label: 'Oocyte (meiotic)', parents: ['pgc'], stage: 'e14-5', markers: 'Stra8 Sycp3 Figla', iconId: 'cells.oocyte', terminal: true },
    { id: 'gonocyte', label: 'Gonocyte (prospermatogonium)', parents: ['pgc'], stage: 'e14-5', markers: 'Nanos2 Dnmt3l', terminal: true },

    // ---------------------------------------------------------------- Ectoderm: surface
    { id: 'surface-ectoderm', label: 'Surface ectoderm', parents: ['epiblast'], stage: 'e8-5', lineage: 'ectoderm', markers: 'Krt8 Krt18 Tfap2a' },
    { id: 'keratinocyte', label: 'Keratinocyte (epidermis)', parents: ['surface-ectoderm'], stage: 'e16-5', markers: 'Krt14 Trp63 Krt10', iconId: 'cells.keratinocyte', terminal: true },

    // ---------------------------------------------------------------- Ectoderm: neural
    { id: 'neural-plate', label: 'Neural plate', parents: ['epiblast'], stage: 'e7-5', lineage: 'ectoderm', markers: 'Sox1 Sox2 Otx2' },
    { id: 'neural-tube', label: 'Neural tube', parents: ['neural-plate'], stage: 'e8-5', markers: 'Sox2 Nes Pax6', iconId: 'tissues.neural-tube' },
    { id: 'forebrain', label: 'Forebrain (prosencephalon)', parents: ['neural-tube'], stage: 'e9-5', markers: 'Foxg1 Six3 Emx2', iconId: 'tissues.brain' },
    { id: 'midbrain', label: 'Midbrain (mesencephalon)', parents: ['neural-tube'], stage: 'e9-5', markers: 'En1 Otx2 Lmx1b' },
    { id: 'hindbrain', label: 'Hindbrain (rhombencephalon)', parents: ['neural-tube'], stage: 'e9-5', markers: 'Gbx2 Hoxb1 Egr2' },
    { id: 'spinal-cord', label: 'Spinal cord', parents: ['neural-tube'], stage: 'e9-5', markers: 'Hoxb9 Hoxc9 Sox2', iconId: 'tissues.spinal-cord' },
    { id: 'radial-glia', label: 'Radial glia (neural progenitor)', parents: ['forebrain'], stage: 'e12-5', markers: 'Pax6 Sox2 Hes5', iconId: 'cells.neural-progenitor' },
    { id: 'glut-neuron', label: 'Glutamatergic neuron (cortex)', parents: ['radial-glia'], stage: 'e14-5', markers: 'Neurod2 Tbr1 Slc17a7', iconId: 'cells.neuron', terminal: true },
    { id: 'astrocyte', label: 'Astrocyte', parents: ['radial-glia'], stage: 'e18-5', markers: 'Aldh1l1 Gfap Slc1a3', iconId: 'cells.astrocyte', terminal: true },
    { id: 'opc', label: 'Oligodendrocyte precursor (OPC)', parents: ['radial-glia', 'pmn'], stage: 'e12-5', markers: 'Olig2 Pdgfra Sox10', description: 'First OPCs arise from the Olig2+ pMN domain of the spinal cord (~E12.5), later waves from forebrain progenitors.' },
    { id: 'oligodendrocyte', label: 'Oligodendrocyte', parents: ['opc'], stage: 'p0', markers: 'Mbp Plp1 Mog', iconId: 'cells.oligodendrocyte', terminal: true },
    { id: 'da-neuron', label: 'Midbrain dopaminergic neuron', parents: ['midbrain'], stage: 'e12-5', markers: 'Th Nr4a2 Lmx1a', iconId: 'cells.neuron', terminal: true },
    { id: 'pmn', label: 'Motor neuron progenitor (pMN)', parents: ['spinal-cord'], stage: 'e9-5', markers: 'Olig2 Nkx6-1' },
    { id: 'motor-neuron', label: 'Spinal motor neuron', parents: ['pmn'], stage: 'e10-5', markers: 'Isl1 Mnx1 Chat', iconId: 'cells.neuron', terminal: true },

    // ---------------------------------------------------------------- Neural crest
    { id: 'neural-crest', label: 'Neural crest (migratory)', parents: ['neural-plate'], stage: 'e8-5', lineage: 'neural-crest', markers: 'Sox10 Foxd3 Snai2' },
    { id: 'cranial-mesenchyme', label: 'Cranial mesenchyme (ectomesenchyme)', parents: ['neural-crest'], stage: 'e9-5', markers: 'Twist1 Prrx1 Dlx2' },
    { id: 'melanocyte', label: 'Melanocyte', parents: ['neural-crest'], stage: 'e12-5', markers: 'Mitf Dct Tyr', terminal: true },
    { id: 'sensory-neuron', label: 'Sensory neuron (DRG)', parents: ['neural-crest'], stage: 'e10-5', markers: 'Pou4f1 Isl1 Ntrk1', iconId: 'cells.neuron', terminal: true },
    { id: 'schwann-cell', label: 'Schwann cell', parents: ['neural-crest'], stage: 'e14-5', markers: 'Sox10 Mpz Egr2', terminal: true },
    { id: 'enteric-neuron', label: 'Enteric neuron', parents: ['neural-crest'], stage: 'e12-5', markers: 'Phox2b Ret Elavl4', iconId: 'cells.neuron', terminal: true, description: 'From vagal (and sacral) neural crest colonising the gut.' },

    // ---------------------------------------------------------------- Mesoderm: nascent, axial, paraxial
    { id: 'nascent-mesoderm', label: 'Nascent mesoderm', parents: ['primitive-streak'], stage: 'e7-5', lineage: 'mesoderm', markers: 'T Mixl1 Pdgfra', iconId: 'cells.mesoderm-cells' },
    { id: 'notochord', label: 'Notochord (axial mesoderm)', parents: ['primitive-streak'], stage: 'e8-5', lineage: 'mesoderm', markers: 'T Noto Shh', terminal: true, description: 'From the node / anterior primitive streak.' },
    { id: 'paraxial-mesoderm', label: 'Paraxial (presomitic) mesoderm', parents: ['nascent-mesoderm'], stage: 'e7-5', markers: 'Tbx6 Msgn1 Hes7' },
    { id: 'somite', label: 'Somite', parents: ['paraxial-mesoderm'], stage: 'e8-5', markers: 'Meox1 Pax3 Tcf15' },
    { id: 'sclerotome', label: 'Sclerotome', parents: ['somite'], stage: 'e9-5', markers: 'Pax1 Pax9 Nkx3-2' },
    { id: 'chondrocyte', label: 'Chondrocyte', parents: ['sclerotome', 'cranial-mesenchyme', 'limb-mesenchyme'], stage: 'e12-5', markers: 'Sox9 Col2a1 Acan', iconId: 'cells.chondrocyte', terminal: true, description: 'Axial skeleton from sclerotome; facial skeleton from cranial neural crest; limb skeleton from limb-bud mesenchyme.' },
    { id: 'osteoblast', label: 'Osteoblast', parents: ['sclerotome', 'cranial-mesenchyme'], stage: 'e14-5', markers: 'Runx2 Sp7 Col1a1', iconId: 'cells.osteoblast', terminal: true },
    { id: 'dermomyotome', label: 'Dermomyotome', parents: ['somite'], stage: 'e9-5', markers: 'Pax3 Pax7 En1' },
    { id: 'skeletal-muscle', label: 'Skeletal muscle fibre', parents: ['dermomyotome'], stage: 'e14-5', markers: 'Myod1 Myog Myh3', iconId: 'cells.skeletal-muscle-fiber', terminal: true, description: 'Via Myf5/Myod1+ myoblasts (myotome and migratory limb myoblasts).' },
    { id: 'dermal-fibroblast', label: 'Dermal fibroblast (dermis)', parents: ['dermomyotome', 'lateral-plate-mesoderm'], stage: 'e12-5', markers: 'Twist2 Col1a1 Pdgfra', iconId: 'cells.fibroblast', terminal: true, description: 'Dorsal dermis from dermomyotome; ventral/limb dermis from lateral plate; facial dermis from neural crest.' },

    // ---------------------------------------------------------------- Mesoderm: intermediate
    { id: 'intermediate-mesoderm', label: 'Intermediate mesoderm', parents: ['nascent-mesoderm'], stage: 'e8-5', markers: 'Osr1 Pax2 Lhx1' },
    { id: 'nephron-progenitor', label: 'Nephron progenitor (cap mesenchyme)', parents: ['intermediate-mesoderm'], stage: 'e10-5', markers: 'Six2 Cited1 Wt1', iconId: 'tissues.kidney' },
    { id: 'podocyte', label: 'Podocyte', parents: ['nephron-progenitor'], stage: 'e14-5', markers: 'Nphs1 Nphs2 Wt1', iconId: 'cells.podocyte', terminal: true },
    { id: 'tubule-cell', label: 'Renal tubule epithelial cell', parents: ['nephron-progenitor'], stage: 'e14-5', markers: 'Hnf1b Pax8 Cdh16', iconId: 'cells.epithelial-sheet', terminal: true },
    { id: 'gonad-somatic', label: 'Gonadal somatic cell', parents: ['intermediate-mesoderm'], stage: 'e10-5', markers: 'Nr5a1 Wt1 Gata4', terminal: true, description: 'Coelomic epithelium of the genital ridge; gives Sertoli (Sox9) or granulosa (Foxl2) cells.' },

    // ---------------------------------------------------------------- Mesoderm: lateral plate
    { id: 'lateral-plate-mesoderm', label: 'Lateral plate mesoderm', parents: ['nascent-mesoderm'], stage: 'e7-5', markers: 'Hand1 Foxf1 Bmp4' },
    { id: 'splanchnic-mesoderm', label: 'Splanchnic mesoderm', parents: ['lateral-plate-mesoderm'], stage: 'e7-5', markers: 'Foxf1 Isl1 Hand2' },
    { id: 'cardiac-progenitor', label: 'Cardiac progenitor (FHF/SHF)', parents: ['splanchnic-mesoderm'], stage: 'e7-5', markers: 'Nkx2-5 Isl1 Tbx5', iconId: 'tissues.heart' },
    { id: 'cardiomyocyte', label: 'Cardiomyocyte', parents: ['cardiac-progenitor'], stage: 'e8-5', markers: 'Tnnt2 Myh6 Nkx2-5', iconId: 'cells.cardiomyocyte', terminal: true },
    { id: 'endocardium', label: 'Endocardium', parents: ['cardiac-progenitor'], stage: 'e8-5', markers: 'Nfatc1 Npr3 Cdh5', iconId: 'cells.endothelial-cell', terminal: true, description: 'Also gives valve cushion mesenchyme by EMT.' },
    { id: 'smooth-muscle', label: 'Smooth muscle cell', parents: ['splanchnic-mesoderm', 'neural-crest'], stage: 'e10-5', markers: 'Acta2 Myh11 Tagln', iconId: 'cells.smooth-muscle-cell', terminal: true, description: 'Visceral (gut) and vascular smooth muscle; outflow-tract/cranial vascular smooth muscle from cardiac neural crest.' },
    { id: 'limb-mesenchyme', label: 'Limb bud mesenchyme', parents: ['lateral-plate-mesoderm'], stage: 'e9-5', markers: 'Prrx1 Fgf10 Msx1', description: 'Somatic (somatopleural) lateral plate mesoderm; Tbx5 forelimb, Tbx4 hindlimb.' },

    // ---------------------------------------------------------------- Blood / endothelium
    { id: 'hemato-endothelial', label: 'Haemato-endothelial progenitor', parents: ['nascent-mesoderm', 'extraembryonic-mesoderm'], stage: 'e7-5', lineage: 'blood', markers: 'Kdr Etv2 Tal1', description: 'Flk1+ mesoderm; yolk-sac blood islands derive from extraembryonic mesoderm.' },
    { id: 'endothelium', label: 'Endothelial cell', parents: ['hemato-endothelial'], stage: 'e8-5', markers: 'Pecam1 Cdh5 Kdr', iconId: 'cells.endothelial-cell' },
    { id: 'primitive-erythrocyte', label: 'Primitive erythrocyte', parents: ['hemato-endothelial'], stage: 'e8-5', markers: 'Hbb-y Hba-x Gata1', iconId: 'cells.red-blood-cell', terminal: true, description: 'Yolk-sac blood islands, E7.5–E8.5.' },
    { id: 'emp', label: 'Erythro-myeloid progenitor (EMP)', parents: ['endothelium'], stage: 'e9-5', markers: 'Kit Csf1r Itga2b', description: 'Yolk-sac haemogenic endothelium, E8.5–E9.5; HSC-independent.' },
    { id: 'macrophage', label: 'Macrophage / microglia', parents: ['emp', 'hsc'], stage: 'e9-5', markers: 'Csf1r Cx3cr1 Adgre1', iconId: 'cells.macrophage', terminal: true, description: 'Tissue-resident macrophages and microglia from yolk-sac EMPs; monocyte-derived macrophages from HSCs later.' },
    { id: 'hsc', label: 'Haematopoietic stem cell (HSC)', parents: ['endothelium'], stage: 'e10-5', markers: 'Runx1 Gata2 Kit', description: 'Emerges by endothelial-to-haematopoietic transition (EHT) from Runx1+ haemogenic endothelium of the dorsal aorta (AGM) at E10.5; expands in fetal liver from E12.5.' },
    { id: 'erythrocyte', label: 'Definitive erythrocyte', parents: ['hsc'], stage: 'e12-5', markers: 'Hbb-b1 Klf1', iconId: 'cells.red-blood-cell', terminal: true, description: 'Fetal-liver erythropoiesis; EMPs also contribute early definitive erythrocytes.' },

    // ---------------------------------------------------------------- Endoderm
    { id: 'definitive-endoderm', label: 'Definitive endoderm', parents: ['primitive-streak'], stage: 'e7-5', lineage: 'endoderm', markers: 'Sox17 Foxa2 Cxcr4' },
    { id: 'gut-tube', label: 'Gut tube endoderm', parents: ['definitive-endoderm', 'visceral-endoderm'], stage: 'e8-5', markers: 'Foxa1 Foxa2 Hnf1b', description: 'Visceral endoderm cells intercalate with definitive endoderm and contribute to the gut (Kwon et al. 2008).' },
    { id: 'foregut', label: 'Foregut endoderm', parents: ['gut-tube'], stage: 'e8-5', markers: 'Sox2 Hhex' },
    { id: 'thymic-epithelium', label: 'Thymic epithelial cell', parents: ['foregut'], stage: 'e12-5', markers: 'Foxn1 Psmb11 Krt5', iconId: 'tissues.thymus', terminal: true, description: 'Third pharyngeal pouch endoderm.' },
    { id: 'thyrocyte', label: 'Thyroid follicular cell', parents: ['foregut'], stage: 'e14-5', markers: 'Nkx2-1 Pax8 Tg', terminal: true, description: 'Pharyngeal floor (thyroid primordium, E8.5–E9.5).' },
    { id: 'lung-progenitor', label: 'Lung progenitor', parents: ['foregut'], stage: 'e9-5', markers: 'Nkx2-1 Sox9 Id2', iconId: 'tissues.lung' },
    { id: 'at2', label: 'Alveolar type 2 cell (AT2)', parents: ['lung-progenitor'], stage: 'e18-5', markers: 'Sftpc Lamp3 Abca3', terminal: true },
    { id: 'hepatoblast', label: 'Hepatoblast', parents: ['foregut'], stage: 'e9-5', markers: 'Hnf4a Afp Prox1', iconId: 'tissues.liver' },
    { id: 'hepatocyte', label: 'Hepatocyte', parents: ['hepatoblast'], stage: 'e14-5', markers: 'Alb Hnf4a Cyp3a11', iconId: 'cells.hepatocyte', terminal: true },
    { id: 'cholangiocyte', label: 'Cholangiocyte', parents: ['hepatoblast'], stage: 'e16-5', markers: 'Sox9 Krt19 Hnf1b', terminal: true },
    { id: 'pancreatic-progenitor', label: 'Pancreatic progenitor', parents: ['foregut'], stage: 'e9-5', markers: 'Pdx1 Ptf1a Sox9', iconId: 'tissues.pancreas' },
    { id: 'beta-cell', label: 'Beta cell', parents: ['pancreatic-progenitor'], stage: 'e16-5', markers: 'Ins1 Ins2 Nkx6-1', iconId: 'cells.beta-cell', terminal: true, description: 'Via Neurog3+ endocrine progenitors (secondary transition, E13.5–E15.5).' },
    { id: 'acinar-cell', label: 'Acinar cell', parents: ['pancreatic-progenitor'], stage: 'e14-5', markers: 'Ptf1a Cpa1 Prss1', terminal: true },
    { id: 'midgut-hindgut', label: 'Midgut / hindgut endoderm', parents: ['gut-tube'], stage: 'e8-5', markers: 'Cdx2 Cdx1' },
    { id: 'intestinal-epithelium', label: 'Intestinal epithelium', parents: ['midgut-hindgut'], stage: 'e14-5', markers: 'Cdx2 Vil1 Lgr5', iconId: 'tissues.intestine', terminal: true, description: 'Villus enterocytes and Lgr5+ intervillus/crypt stem cells.' },
  ],

  edges: [
    { from: 'hsc', to: 'hsc', kind: 'self' },
    { from: 'primitive-streak', to: 'nascent-mesoderm', label: 'EMT (ingression)' },
    { from: 'neural-plate', to: 'neural-crest', label: 'EMT (delamination)' },
    { from: 'endothelium', to: 'hsc', label: 'EHT' },
  ],
}
