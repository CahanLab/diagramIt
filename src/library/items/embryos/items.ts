/**
 * Mouse embryo stage icons E10.5 to E18.5, built from the eMouseAtlas Theiler stage
 * plates (traced.ts, CC BY 3.0) plus hand-placed features (features.ts).
 * Spec: docs/superpowers/specs/2026-10-14-drawing-styles-design.md ("Reference-traced embryos")
 */
import type { LibraryItem } from '../../types'
import { lazyRendering } from '../../lazy'
import type { Stage } from '../limbs/types'
import { STAGES } from '../limbs/types'
import { FEATURES, type Ellipse } from './features'
import { EMBRYO_PALETTE, renderEmbryo, type EmbryoModel, type EmbryoPart } from './model'
import { TRACED } from './traced'

const f = (v: number): string => (Math.round(v * 10) / 10).toString()

/** Circle as path data (two half arcs), the form the renderers recognise for rings and gloss. */
const circle = (cx: number, cy: number, r: number): string => `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0z`

function ellipsePath(e: Ellipse): string {
  const a = ((e.angle ?? 0) * Math.PI) / 180
  const pts: [number, number][] = []
  for (let i = 0; i < 20; i++) {
    const t = (2 * Math.PI * i) / 20
    const x = Math.cos(t) * e.rx
    const y = Math.sin(t) * e.ry
    pts.push([e.cx + x * Math.cos(a) - y * Math.sin(a), e.cy + x * Math.sin(a) + y * Math.cos(a)])
  }
  return pts.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])} ${f(p[1])}`).join('') + 'z'
}

/** Vibrissa follicles: a lattice of rows parallel to the field's long axis, clipped to the ellipse. */
function vibrissae(v: Ellipse & { rows: number; cols: number }): string {
  const a = ((v.angle ?? 0) * Math.PI) / 180
  const out: string[] = []
  for (let r = 0; r < v.rows; r++) {
    const y = ((r + 0.5) / v.rows - 0.5) * 2 * v.ry
    for (let c = 0; c < v.cols; c++) {
      const x = ((c + 0.5) / v.cols - 0.5) * 2 * v.rx + (r % 2 ? v.rx / v.cols / 2 : 0)
      if ((x / v.rx) ** 2 + (y / v.ry) ** 2 > 0.92) continue
      const px = v.cx + x * Math.cos(a) - y * Math.sin(a)
      const py = v.cy + x * Math.sin(a) + y * Math.cos(a)
      out.push(`M${f(px)} ${f(py)}h0.01`)
    }
  }
  return out.join('')
}

/** Default insert height in px grows with crown-rump length: 90 px at E10.5 (4 mm) to 175 px at E18.5 (21 mm). */
export const defaultHeight = (crl: number): number => Math.round(70 + 5 * crl)

export function tracedModel(stage: Stage): EmbryoModel {
  const t = TRACED[stage]
  const fe = FEATURES[stage]
  const [, , , vbH] = t.viewBox.split(' ').map(Number) as [number, number, number, number]
  // outline width in viewBox units such that it is about 1.3 px at the default insert size
  const sw = +((1.3 * vbH) / defaultHeight(t.crl)).toFixed(2)
  const parts: EmbryoPart[] = [{ tag: 'body', d: t.body, draw: 'fill' }]
  for (const d of t.lines) parts.push({ tag: 'detail', d, draw: 'stroke', w: +(sw * 0.7).toFixed(2) })
  if (fe.eye) {
    if (stage <= 'E11.5') parts.push({ tag: 'lens', d: circle(fe.eye.cx, fe.eye.cy, fe.eye.r), draw: 'ring-secondary', w: +(sw * 0.7).toFixed(2) })
    else parts.push({ tag: 'eye', d: circle(fe.eye.cx, fe.eye.cy, fe.eye.r), draw: 'fill-secondary', w: +(sw * 0.5).toFixed(2) })
    if (stage === 'E15.5') {
      // fusing eyelids: a lid line across the lower third of the eye
      const { cx, cy, r } = fe.eye
      parts.push({ tag: 'eyelid', d: `M${f(cx - r * 1.1)} ${f(cy + r * 0.3)}Q${f(cx)} ${f(cy + r * 0.9)} ${f(cx + r * 1.1)} ${f(cy + r * 0.3)}`, draw: 'stroke-secondary', w: +(sw * 0.7).toFixed(2) })
    }
  }
  if (fe.eyelid) parts.push({ tag: 'eyelid', d: ellipsePath(fe.eyelid), draw: 'stroke-secondary', w: +(sw * 0.7).toFixed(2) })
  if (fe.vibrissae) parts.push({ tag: 'vibrissae', d: vibrissae(fe.vibrissae), draw: 'dots', w: +(sw * 1.1).toFixed(2) })
  return { stage, theiler: t.theiler, viewBox: t.viewBox, parts, strokeWidth: sw }
}

export const models: EmbryoModel[] = STAGES.map(tracedModel)

const COMMON = ['mouse', 'mus musculus', 'embryo', 'embryonic day', 'development', 'organogenesis', 'theiler', 'lateral view']
const STAGE_KEYWORDS: Record<Stage, string[]> = {
  'E10.5': ['limb bud', 'forelimb bud', 'hindlimb bud', 'somites', 'branchial arches', 'pharyngeal arches', 'lens pit', 'otic vesicle', 'tail bud'],
  'E11.5': ['limb bud', 'forelimb paddle', 'handplate', 'hindlimb bud', 'somites', 'lens vesicle', 'nasal pit', 'umbilical loop'],
  'E12.5': ['handplate', 'digital rays', 'footplate', 'pigmented eye', 'pinna', 'umbilical hernia', 'mandibular prominence'],
  'E13.5': ['digit clefts', 'pinna', 'eyelid', 'vibrissae', 'umbilical hernia', 'hair follicles'],
  'E14.5': ['separate fingers', 'toes separating', 'eyelids open', 'pinna', 'vibrissae', 'whiskers'],
  'E15.5': ['eyelids fusing', 'separate digits', 'toes', 'smooth skin', 'vibrissae'],
  'E16.5': ['eyelids fused', 'claws', 'wrinkled skin', 'vibrissae', 'pinna covers meatus'],
  'E17.5': ['fetus', 'eyelids closed', 'claws', 'wrinkled skin', 'vibrissae', 'late gestation'],
  'E18.5': ['fetus', 'term', 'birth', 'eyelids closed', 'claws', 'wrinkled skin', 'vibrissae', 'late gestation'],
}

export const items: LibraryItem[] = models.map((m) => {
  const t = TRACED[m.stage]
  const [, , vbW, vbH] = m.viewBox.split(' ').map(Number) as [number, number, number, number]
  const height = defaultHeight(t.crl)
  const day = m.stage.slice(1)
  return {
    id: `development.mouse-embryo-${m.stage.toLowerCase().replace('.', '-')}`,
    name: `Mouse embryo ${m.stage}`,
    category: 'development',
    keywords: [...COMMON, m.stage.toLowerCase(), `${day} dpc`, `ts${m.theiler}`, `theiler ${m.theiler}`, `theiler stage ${m.theiler}`, ...STAGE_KEYWORDS[m.stage]],
    svg: renderEmbryo(m, 'basic'),
    width: Math.round((height * vbW) / vbH),
    height,
    primary: EMBRYO_PALETTE.basic.primary,
    secondary: EMBRYO_PALETTE.basic.secondary,
    styles: {
      lucida: lazyRendering(() => renderEmbryo(m, 'lucida'), EMBRYO_PALETTE.lucida.primary),
      realistic: lazyRendering(() => renderEmbryo(m, 'realistic'), EMBRYO_PALETTE.realistic.primary, EMBRYO_PALETTE.realistic.secondary),
    },
  }
})
