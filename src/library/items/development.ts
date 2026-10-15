/**
 * Developmental stages: mouse embryos (E10.5 to E18.5) and fore/hindlimb
 * stage icons in outline, skeleton, muscle-and-tendon and innervation versions.
 * Spec: docs/superpowers/specs/2026-10-14-mouse-embryo-limb-icons-design.md
 */
import type { LibraryItem } from '../types'
import { limbDefaultSize, limbSvg } from '../generators/limb'
import { limbLucidaSvg } from '../generators/limbLucida'
import { limbRealisticSvg } from '../generators/limbRealistic'
import { OUTLINE } from '../types'
import { lazyRendering } from '../lazy'
import type { LimbStage, Stage } from './limbs/types'
import { forelimb } from './limbs/forelimb'
import { hindlimb } from './limbs/hindlimb'
import { items as embryos } from './embryos/items'

const PRIMARY = '#e8c9a0'
const CARTILAGE = '#5b8fd6'

/**
 * Only the outline version of each limb is offered in the library for now; the skeleton,
 * muscle and innervation versions remain in the stage models (`availableVersions`) and
 * can be exposed again.
 */
const OUTLINE_KEYWORDS = ['outline', 'silhouette', 'limb bud', 'morphology']

/** "E12.5" -> ['e12.5', '12.5 dpc', 'ts20', 'theiler 20', 'theiler stage 20'] */
export function stageKeywords(stage: Stage, theiler: number): string[] {
  const day = stage.slice(1)
  return [stage.toLowerCase(), `${day} dpc`, `ts${theiler}`, `theiler ${theiler}`, `theiler stage ${theiler}`]
}

export function limbItems(stages: LimbStage[]): LibraryItem[] {
  const out: LibraryItem[] = []
  for (const s of stages) {
    const slug = s.stage.toLowerCase().replace('.', '-')
    const size = limbDefaultSize(s)
    for (const v of ['outline' as const]) {
      out.push({
        id: `development.mouse-${s.limb}-${slug}`,
        name: `${s.stage} ${s.limb}`,
        category: 'development',
        keywords: [
          'mouse', 'mus musculus', 'embryo', 'embryonic', 'limb', 'limb development', s.limb,
          s.limb === 'forelimb' ? 'handplate' : 'footplate', s.limb === 'forelimb' ? 'hand' : 'foot',
          'autopod', 'zeugopod', 'stylopod', 'digit', ...stageKeywords(s.stage, s.theiler), ...OUTLINE_KEYWORDS,
        ],
        svg: limbSvg(s, v),
        width: size.width,
        height: size.height,
        primary: PRIMARY,
        secondary: CARTILAGE,
        styles: {
          lucida: lazyRendering(() => limbLucidaSvg(s, v), OUTLINE),
          realistic: lazyRendering(() => limbRealisticSvg(s, v), '#e9b99b', '#7fa8dc'),
        },
      })
    }
  }
  return out
}

export const embryoItems: LibraryItem[] = embryos

export const items: LibraryItem[] = [...embryoItems, ...limbItems(forelimb), ...limbItems(hindlimb)]
