/**
 * Developmental stages: mouse embryos (E10.5 to E18.5) and fore/hindlimb
 * stage icons in outline, skeleton, muscle-and-tendon and innervation versions.
 * Spec: docs/superpowers/specs/2026-10-14-mouse-embryo-limb-icons-design.md
 */
import type { LibraryItem } from '../types'
import { availableVersions, limbDefaultSize, limbSvg } from '../generators/limb'
import { limbLucidaSvg } from '../generators/limbLucida'
import { limbRealisticSvg } from '../generators/limbRealistic'
import { OUTLINE } from '../types'
import { lazyRendering } from '../lazy'
import type { LimbStage, LimbVersion, Stage } from './limbs/types'
import { forelimb } from './limbs/forelimb'
import { hindlimb } from './limbs/hindlimb'
import { items as embryosEarly } from './embryos/e10-e12'
import { items as embryosMid } from './embryos/e13-e15'
import { items as embryosLate } from './embryos/e16-e18'

const PRIMARY = '#e8c9a0'
const CARTILAGE = '#5b8fd6'

const VERSION_SUFFIX: Record<LimbVersion, string> = { outline: '', skeleton: '-skeleton', muscle: '-muscle', nerves: '-nerves' }
const VERSION_NAME: Record<LimbVersion, string> = { outline: '', skeleton: ', skeleton', muscle: ', muscle and tendon', nerves: ', innervation' }
const VERSION_KEYWORDS: Record<LimbVersion, string[]> = {
  outline: ['outline', 'silhouette', 'limb bud', 'morphology'],
  skeleton: ['skeleton', 'skeletal', 'cartilage', 'alcian', 'alcian blue', 'condensation', 'precartilaginous', 'chondrogenesis', 'alizarin', 'alizarin red', 'ossification', 'bone'],
  muscle: ['muscle', 'tendon', 'myod1', 'scleraxis', 'mf20', 'musculoskeletal', 'myogenic'],
  nerves: ['nerve', 'nerves', 'innervation', 'neurofilament', 'brachial plexus', 'lumbar plexus', 'axon', 'motor'],
}

/** "E12.5" -> ['e12.5', '12.5 dpc', 'ts20', 'theiler 20', 'theiler stage 20'] */
export function stageKeywords(stage: Stage, theiler: number): string[] {
  const day = stage.slice(1)
  return [stage.toLowerCase(), `${day} dpc`, `ts${theiler}`, `theiler ${theiler}`, `theiler stage ${theiler}`]
}

export function limbItems(stages: LimbStage[]): LibraryItem[] {
  const out: LibraryItem[] = []
  for (const s of stages) {
    const limbWord = s.limb === 'forelimb' ? 'Mouse forelimb' : 'Mouse hindlimb'
    const slug = s.stage.toLowerCase().replace('.', '-')
    const size = limbDefaultSize(s)
    for (const v of availableVersions(s)) {
      out.push({
        id: `development.mouse-${s.limb}-${slug}${VERSION_SUFFIX[v]}`,
        name: `${limbWord} ${s.stage}${VERSION_NAME[v]}`,
        category: 'development',
        keywords: [
          'mouse', 'mus musculus', 'embryo', 'embryonic', 'limb', 'limb development', s.limb,
          s.limb === 'forelimb' ? 'handplate' : 'footplate', s.limb === 'forelimb' ? 'hand' : 'foot',
          'autopod', 'zeugopod', 'stylopod', 'digit', ...stageKeywords(s.stage, s.theiler), ...VERSION_KEYWORDS[v],
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

export const embryoItems: LibraryItem[] = [...embryosEarly, ...embryosMid, ...embryosLate]

export const items: LibraryItem[] = [...embryoItems, ...limbItems(forelimb), ...limbItems(hindlimb)]
