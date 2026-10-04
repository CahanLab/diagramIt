import type { Protocol } from './types'

export const BLANK_PROTOCOL: Protocol = {
  title: '',
  layout: 'classic',
  unit: 'day',
  pxPerUnit: 40,
  stages: [
    { id: 's1', name: 'Stage 1', start: 0, end: 4, color: '#dbeafe', cellLabel: 'iPSCs', cellIconId: 'cells.ipsc-colony', cellColor: '#c9a46b', markers: ['OCT4+', 'NANOG+'], media: ['Basal medium', 'Factor A'] },
    { id: 's2', name: 'Stage 2', start: 4, end: 10, color: '#dcfce7', cellLabel: 'Progenitors', cellIconId: 'cells.cell-cluster-loose', cellColor: '#a3a3a3', markers: [], media: ['Basal medium', 'Factor B'] },
  ],
  endpoint: { cellLabel: 'Differentiated cells', cellIconId: 'cells.generic-cell', cellColor: '#d9534f', markers: [] },
  rows: [],
  ecm: '',
  fontFamily: 'Helvetica',
  fontSize: 16,
  showCells: true,
  showMarkers: true,
  showMedia: true,
}

/** Modelled on the hiPSC → podocyte protocol figure (Nature Protocols style). */
export const PODOCYTE_TEMPLATE: Protocol = {
  title: '',
  layout: 'classic',
  unit: 'day',
  pxPerUnit: 40,
  stages: [
    {
      id: 'p1', name: 'Stage 1', start: 0, end: 2, color: '#ffffff',
      cellLabel: 'hiPS cells', cellIconId: 'cells.ipsc-colony', cellColor: '#c9a46b',
      markers: ['Oct4+', 'Tra-1-60+'],
      media: ['100 ng/mL Activin A', '3 µM CHIR99021', '10 µM Y27632'],
    },
    {
      id: 'p2', name: 'Stage 2', start: 2, end: 16, color: '#ffffff',
      cellLabel: 'Mesoderm', cellIconId: 'cells.mesoderm-cells', cellColor: '#bfb59a',
      markers: ['Hand1+', 'GSC+', 'Brachyury+'],
      media: ['100 ng/mL BMP-7', '3 µM CHIR99021'],
    },
    {
      id: 'p3', name: 'Stage 3', start: 16, end: 21, color: '#ffffff',
      cellLabel: 'Intermediate mesoderm', cellIconId: 'cells.cell-cluster-loose', cellColor: '#7a1f4d',
      markers: ['WT1+', 'Pax2+', 'OSR1+'],
      media: ['100 ng/mL Activin A', '100 ng/mL BMP-7', '50 ng/mL VEGF', '3 µM CHIR99021', '0.1 µM all-trans retinoic acid'],
    },
    {
      id: 'p4', name: 'Stage 4', start: 21, end: 28, color: '#ffffff',
      cellLabel: 'Podocytes', cellIconId: 'cells.podocyte', cellColor: '#c8352d',
      markers: ['Nephrin+', 'Podocin+', 'WT1+', 'Pax2−'],
      media: ['Maintenance in CSC', 'complete medium'],
    },
  ],
  rows: [],
  ecm: 'ECM: Laminin 511-E8 or Laminin 511',
  fontFamily: 'Helvetica',
  fontSize: 16,
  showCells: true,
  showMarkers: true,
  showMedia: true,
}

/** Modelled on the compact "PROTOC." strip: day ruler with factor and basal-medium bands. */
export const MESENDODERM_STRIP_TEMPLATE: Protocol = {
  title: 'Mesendoderm-directed multilineage iPSC differentiation',
  layout: 'strip',
  unit: 'day',
  pxPerUnit: 44,
  stages: [
    { id: 'm1', name: 'Mesendoderm induction', start: 0, end: 2, color: '#c7d7f0', cellLabel: 'iPSCs', cellIconId: 'cells.ipsc-colony', cellColor: '#8d8a7a', media: [] },
    { id: 'm2', name: 'Progenitor specification', start: 2, end: 5, color: '#d7e6c9', cellLabel: 'Mesendoderm', cellIconId: 'cells.cell-cluster-loose', cellColor: '#4c3b8f', media: [] },
    { id: 'm3', name: 'Commitment', start: 5, end: 9, color: '#f1eac2', cellLabel: 'Progenitors', cellIconId: 'cells.cell-cluster-loose', cellColor: '#7b4ea3', media: [] },
  ],
  endpoint: { cellLabel: 'Committed cell types', cellIconId: 'cells.generic-cell', cellColor: '#d9534f' },
  rows: [
    {
      id: 'r1', label: 'Factors',
      spans: [
        { start: 0, end: 3, text: 'CHIR + AA + BSA', color: '#c7d7f0' },
        { start: 3, end: 7, text: 'AA + BSA', color: '#d7e6c9' },
        { start: 7, end: 9, text: 'B27 + insulin', color: '#f1eac2' },
      ],
    },
    { id: 'r2', label: 'Basal', spans: [{ start: 0, end: 9, text: 'RPMI', color: '#f6d9cf' }] },
  ],
  ecm: '',
  fontFamily: 'Helvetica',
  fontSize: 14,
  showCells: true,
  showMarkers: true,
  showMedia: true,
}

export const PROTOCOL_TEMPLATES: { id: string; name: string; description: string; protocol: Protocol }[] = [
  { id: 'podocyte', name: 'iPSC → podocyte (classic)', description: 'Day axis, cell icons with markers, media boxes and ECM row', protocol: PODOCYTE_TEMPLATE },
  { id: 'strip', name: 'Mesendoderm strip (compact)', description: 'Day ruler with coloured factor and basal-medium bands', protocol: MESENDODERM_STRIP_TEMPLATE },
  { id: 'blank', name: 'Blank timeline', description: 'Two stages and an endpoint to edit', protocol: BLANK_PROTOCOL },
]
