# Mouse embryo and limb stage icons — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Developmental stages" library category holding 9 mouse embryo icons (E10.5 to E18.5) and 65 fore/hindlimb icons generated from per-stage anatomy data in four layered versions.

**Architecture:** A pure limb generator (`src/library/generators/limb.ts`) turns a `LimbStage` record (outline path, skeletal capsules with state, muscle blobs, tendon bands, nerve paths) into SVG for a requested version. Stage data lives in `src/library/items/limbs/{forelimb,hindlimb}.ts`. `src/library/items/development.ts` assembles the generated limb items and the hand-authored embryo SVGs (one file per three stages under `src/library/items/embryos/`) into `LibraryItem[]`, registered like every other item module.

**Tech Stack:** TypeScript, vitest (jsdom), inline SVG under the icon contract in `src/library/types.ts`, `scripts/icon-sheet.ts` for visual review.

**Spec:** `docs/superpowers/specs/2026-10-14-mouse-embryo-limb-icons-design.md`

**Status:** Executed on 2026-10-14 and shipped as 0.5.0 (74 icons: 9 embryos,
65 limbs); the checkboxes below were not ticked during execution. The
hand-authored stage data and generator this plan describes were replaced in
0.10.0 by shapes built from references (embryos traced from eMouseAtlas
Theiler plates by `scripts/embryos/run.sh`, limb silhouettes and tissues
from `scripts/limbs/author.py`), and 0.11.0 withdrew the tissue versions
from the library, which now lists 27 developmental items (9 embryos, 18 limb
outlines). That work is recorded in phase 5 of
`docs/superpowers/specs/2026-10-14-drawing-styles-design.md`.

## Global Constraints

- Icon contract: `viewBox` only, allowed elements `svg g path rect circle ellipse line polyline polygon title`, no `url()`, no `<text>`/`<defs>`/gradients/filters; outlines `#1f2937`; recolourable regions `#PRIMARY`/`#SECONDARY` (`src/library/types.ts`).
- Ids `^[a-z]+\.[a-z0-9-]+$`; category `development`; ids `development.mouse-embryo-e12-5`, `development.mouse-forelimb-e12-5[-skeleton|-muscle|-nerves]`, same for `hindlimb`.
- Names use sentence case and British spelling: "Mouse forelimb E12.5, skeleton", "Mouse hindlimb E14.5, muscle and tendon", "Mouse forelimb E13.5, innervation".
- Limb view: dorsal, proximal left, distal right, anterior (digit 1) up, for both limbs.
- Colours: `#PRIMARY` default `#e8c9a0`; `#SECONDARY` default `#5b8fd6`; condensation = secondary at 0.4 opacity, no outline; sleeve band `#f3e9d2`; ossifying band `#c0392b`; muscle `#b84a3f` at 0.85; tendon `#f5efe0`; nerve `#d9a400`; AER `#c9a57c`.
- Versions exist only where tissue exists (spec timetable): E10.5 outline only; E11.5 hindlimb has no `muscle` version; everything else has all four. Total 65 limb + 9 embryo = 74 items.
- Default sizes: embryo height `90 + 60 * (crl - 4.5) / 16.5`; limb width `70 + 70 * (lengthMm - 0.9) / 5.1`, height from viewBox aspect.
- Keep layout/generator code pure (no DOM, no Fabric); tests beside code.
- `npm test` and `npm run build` pass before every commit; CHANGELOG and `package.json` version updated with the final commit.

## Review Focus

1. Recolouring: a user sets primary to a dark colour; outlines and nerve/muscle colours must stay visible (fixed colours are not derived from primary). Test in Task 2: muscle and nerve versions do not contain `#PRIMARY` outside the outline fill.
2. Custom-library export of a generated limb must round-trip: `applyColors` on the SVG must leave no `#PRIMARY`/`#SECONDARY` tokens. Test in Task 5.
3. Search by stage must find both embryo and limbs: query "e13.5" returns the embryo and all E13.5 limb versions; query "ts21" too. Test in Task 5.
4. Fabric import tolerates `fill-opacity`/`stroke-opacity` on `<path>` (already used in `cells.ts`), but every capsule outline must be a stroked path with `fill="none"` so Fabric does not fill it black. Test in Task 2: no `<path` for capsules without an explicit `fill`.
5. Hindlimb half-day lag: an E13.5 hindlimb must still show distal phalanges as condensation, not cartilage, and E14.5 hindlimb distal phalanges as cartilage. Tests in Task 4.

---

### Task 1: Category `development` and wiring

**Files:**
- Modify: `src/library/types.ts` (Category union, CATEGORY_LABELS, CATEGORY_ORDER)
- Modify: `src/library/registry.ts` (import and spread `development` items)
- Create: `src/library/items/development.ts` (initially exporting `items: LibraryItem[] = []`)
- Modify: `src/library/items/README.md` (fixed tissue colours table)
- Test: `src/library/registry.test.ts`

**Interfaces:**
- Produces: `Category` includes `'development'`; `src/library/items/development.ts` exports `items`.

- [ ] **Step 1: Add a failing test** in `registry.test.ts`:

```ts
it('has a development category after species', () => {
  expect(CATEGORY_ORDER.indexOf('development')).toBe(CATEGORY_ORDER.indexOf('species') + 1)
  expect(CATEGORY_LABELS.development).toBe('Developmental stages')
})
```

- [ ] **Step 2: Run** `npx vitest run src/library/registry.test.ts` — expect FAIL (type error / undefined).
- [ ] **Step 3: Implement**: add `| 'development'` to `Category`; `development: 'Developmental stages'` to labels; insert `'development'` after `'species'` in `CATEGORY_ORDER`. Create `development.ts` exporting an empty array; import and spread it in `registry.ts` after `species`.
- [ ] **Step 4: Run** the test file — PASS. Run `npx tsc -b` — clean.
- [ ] **Step 5: README**: add a "Developmental stage icons" section listing the fixed colours from Global Constraints and the generator location.
- [ ] **Step 6: Commit** `feat(library): development category`.

### Task 2: Limb generator

**Files:**
- Create: `src/library/items/limbs/types.ts`
- Create: `src/library/generators/limb.ts`
- Test: `src/library/generators/limb.test.ts`

**Interfaces (produces):**

```ts
// src/library/items/limbs/types.ts
export type Stage = 'E10.5'|'E11.5'|'E12.5'|'E13.5'|'E14.5'|'E15.5'|'E16.5'|'E17.5'|'E18.5'
export type Limb = 'forelimb' | 'hindlimb'
export type ElementName =
  | 'humerus'|'radius'|'ulna'|'femur'|'tibia'|'fibula'|'carpal'|'tarsal'
  | 'metacarpal'|'metatarsal'|'proximal-phalanx'|'middle-phalanx'|'distal-phalanx'
export type ElementState = 'condensation'|'cartilage'|'sleeve'|'ossifying'
export interface Element { name: ElementName; digit?: 1|2|3|4|5; state: ElementState; p: [number,number]; d: [number,number]; r: number }
export interface Muscle { name: string; path: string }
export interface Tendon { name: string; path: string }
export interface Nerve { name: string; path: string; width: 1|2|3 }
export interface LimbStage {
  limb: Limb; stage: Stage; theiler: number; lengthMm: number
  viewBox: string; outline: string; aer?: string
  hairPlacodes?: [number,number][]; decor?: string
  elements: Element[]; muscles: Muscle[]; tendons: Tendon[]; nerves: Nerve[]
}
export type LimbVersion = 'outline'|'skeleton'|'muscle'|'nerves'
export const FORELIMB_ELEMENTS: ReadonlySet<ElementName>
export const HINDLIMB_ELEMENTS: ReadonlySet<ElementName>
```

```ts
// src/library/generators/limb.ts
export const LIMB_COLORS = { condensationOpacity: 0.4, sleeve: '#f3e9d2', ossifying: '#c0392b', muscle: '#b84a3f', muscleOpacity: 0.85, tendon: '#f5efe0', nerve: '#d9a400', aer: '#c9a57c' }
export function limbSvg(stage: LimbStage, version: LimbVersion): string
export function availableVersions(stage: LimbStage): LimbVersion[]
export function limbDefaultSize(stage: LimbStage): { width: number; height: number }
```

Rendering order inside one `<svg viewBox><g fill="none" stroke="#1f2937" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">`:
1. `<path d="${outline}" fill="#PRIMARY"/>`
2. if `aer`: `<path d="${aer}" stroke="${aer colour}" stroke-width="3"/>`
3. hair placodes: `<circle cx cy r="1.2" fill="#1f2937" fill-opacity="0.45" stroke="none"/>`
4. `decor` verbatim
5. version `skeleton`, `muscle`, `nerves`: every element as `<g class="el ${name}${digit?'-'+digit:''} ${state}">`: capsule = stroked line from p to d. For `condensation`: one `<path d="M p L d" stroke="#SECONDARY" stroke-width="${2r}" stroke-opacity="0.4"/>`. Otherwise: `<path d="M p L d" stroke-width="${2r+2.5}"/>` then `<path d="M p L d" stroke="#SECONDARY" stroke-width="${2r}"/>`; for `sleeve` add band in sleeve colour, for `ossifying` add band in ossifying colour: band = `<path d="M m-0.2Lu L m+0.2Lu" stroke="${c}" stroke-width="${2r}" stroke-linecap="butt"/>` where `m` is the midpoint, `L` the length and `u` the unit vector.
6. version `muscle`: muscles `<path d fill="${muscle}" fill-opacity="0.85" stroke-width="1.2"/>`, tendons `<path d stroke-width="4"/>` then `<path d stroke="${tendon}" stroke-width="2.4"/>`.
7. version `nerves`: for each nerve, underlay `<path d stroke-width="${w+1.5}"/>` then `<path d stroke="${nerve}" stroke-width="${w}"/>` with w = 1.2, 2, 3 for width 1, 2, 3.

`availableVersions` returns `['outline']` plus `'skeleton'` if `elements.length`, `'muscle'` if `muscles.length || tendons.length`, `'nerves'` if `nerves.length`.

- [ ] **Step 1: Write failing tests** `limb.test.ts` using a fixture stage with one cartilage humerus, one condensation metacarpal, one ossifying radius, one muscle, one tendon, one nerve:
  - outline version contains `#PRIMARY` once and no `#SECONDARY`, no muscle colour, no nerve colour.
  - skeleton version contains `class="el humerus cartilage"`, `class="el metacarpal-3 condensation"`, exactly one `stroke-opacity="0.4"`, one `#c0392b` band, no muscle or nerve colour.
  - muscle version contains `#b84a3f` and `#f5efe0`, no `#d9a400`.
  - nerves version contains `#d9a400` and no `#b84a3f`.
  - every `<path` in the skeleton version that is not the outline has either `fill="none"` inherited via group (assert no `fill="#1f2937"`) — concretely assert the string does not contain `fill="#1f2937"`.
  - `availableVersions` for a stage with empty arrays is `['outline']`.
  - `limbDefaultSize` for lengthMm 0.9 gives width 70, for 6 gives 140, height = width * (vbH/vbW).
  - `validateItem` (from `../validate`) on a wrapped item returns `[]` for all four versions.
- [ ] **Step 2: Run** `npx vitest run src/library/generators/limb.test.ts` — FAIL (module not found).
- [ ] **Step 3: Implement** `types.ts` and `limb.ts` as specified. Number formatting: `toFixed(1)` and strip trailing `.0`.
- [ ] **Step 4: Run** tests — PASS.
- [ ] **Step 5: Commit** `feat(library): limb stage generator`.

### Task 3: Forelimb stage data

**Files:**
- Create: `src/library/items/limbs/forelimb.ts` exporting `export const forelimb: LimbStage[]` (9 entries, E10.5 to E18.5)
- Test: `src/library/items/limbs/stages.test.ts` (forelimb half)

**Reference panels:** Martin 1990 Fig. 1 C to L (outline per half day), Fig. 2 B, C, E (Alcian E12.5, E13.5, E14.5), Fig. 4 B to E (muscle), Fig. 5 (nerves); Rafipay 2018 Fig. 5 (nerves E11.5 to E14.5), Fig. 6 A, C, E, G, I (skeleton E12.5 to E16.5). Rendered pages are in the session scratchpad `refs/`.

**Drawing frame:** `viewBox="0 0 160 100"`. Shoulder at x≈10, y≈50. Stylopod runs right and slightly down, zeugopod right, autopod fans to the right with digit 1 at top. Element capsule positions by stage (x,y in viewBox units; r = half-width):

| Stage | humerus p→d, r | radius / ulna | metacarpals (2,3,4 then 1,5) | phalanges |
|---|---|---|---|---|
| E11.5 | (14,50)→(44,52) r6 condensation | none | none | none |
| E12.5 | (14,48)→(52,54) r6 cart. | radius (54,48)→(92,46) r4 cart.; ulna (54,58)→(92,58) r4 cart. | mc2 (100,34)→(118,26) r3 cond.; mc3 (100,44)→(122,42) r3 cond.; mc4 (100,54)→(120,60) r3 cond.; mc1 (98,26)→(108,18) r2.5 cond. faint (state condensation); mc5 (98,62)→(112,72) r2.5 cond. | none |
| E13.5 | (12,46)→(50,56) r6 cart. | radius (52,48)→(94,44) r4; ulna (52,60)→(94,58) r4 cart. | all five cart., spread as E12.5 but 4 units longer | proximal and middle phalanges cart. on digits 2 to 5 (digit 1 proximal only), 8 units each; distal phalanges condensation, 5 units |
| E14.5 | humerus `sleeve`, radius `sleeve`, ulna `sleeve` | | all cart., carpal row as two small capsules r3 cart. at x≈98 | all phalanges cart. incl. distal |
| E15.5 | humerus `ossifying`; radius, ulna `sleeve` | | | all cart.; digits slimmer (r 2.5) and 10 % longer |
| E16.5 | humerus, radius, ulna `ossifying` | | | as E15.5 |
| E17.5 | as E16.5; metacarpals 2 to 5 `ossifying` | | | as E15.5 |
| E18.5 | as E17.5; proximal phalanges `ossifying` | | | as E15.5 |

Outline paths: E10.5 a rounded bud about 36 wide (x 10 to 46) and 44 tall; E11.5 a paddle 60 long with a flattened distal edge; E12.5 a handplate 50 wide with five shallow scallops on the distal margin (`aer` runs along it); E13.5 clefts cut 10 units between fingers; E14.5 fingers separate with 3 units of web at the base; E15.5 onward digits slender and separate, elbow angle sharper so the autopod points right and slightly up; E16.5 onward claws as small dark wedges in `decor`; E17.5 and E18.5 three footpad ellipses at the base of the digits in `decor` and two wrinkle strokes across the zeugopod.

Muscles: E11.5 dorsal and ventral premuscle masses as two elongated blobs over the humerus (dorsal above, ventral below); E12.5 four blocks in stylopod (biceps/triceps region) and two in zeugopod; E13.5 blocks reach the wrist, tendon bands from zeugopod across the wrist to the metacarpals (five lines); E14.5 onward defined forearm muscles (extensor and flexor masses as 4 blobs), lumbrical blobs at metacarpal bases, tendons to proximal interphalangeal joints (E14.5) and to distal joints (E15.5 onward).

Nerves: E11.5 two short fascicles from the shoulder into the proximal third (width 2); E12.5 radial (dorsal, over humerus/radius), median (central) and ulnar (ventral) trunks (width 3) to the wrist with two muscle branches (width 2); E13.5 trunks plus digital branches to digit bases (width 2) and three cutaneous twigs (width 1); E14.5 onward digital nerves to every digit tip plus cutaneous branching (width 1).

- [ ] **Step 1: Write failing tests** in `stages.test.ts`:

```ts
import { forelimb } from './forelimb'
import { FORELIMB_ELEMENTS } from './types'
const by = (s: Stage) => forelimb.find((x) => x.stage === s)!
const count = (st: LimbStage, name: ElementName, state?: ElementState) =>
  st.elements.filter((e) => e.name === name && (!state || e.state === state)).length

describe('forelimb stages', () => {
  it('has nine stages in order', () => expect(forelimb.map((s) => s.stage)).toEqual(['E10.5','E11.5','E12.5','E13.5','E14.5','E15.5','E16.5','E17.5','E18.5']))
  it('uses only forelimb element names', () => forelimb.forEach((s) => s.elements.forEach((e) => expect(FORELIMB_ELEMENTS.has(e.name)).toBe(true))))
  it('E10.5 has no tissues', () => { const s = by('E10.5'); expect(s.elements).toEqual([]); expect(s.muscles).toEqual([]); expect(s.nerves).toEqual([]) })
  it('E11.5 has a humerus condensation, muscle masses, nerves, no tendons', () => { const s = by('E11.5'); expect(count(s,'humerus','condensation')).toBe(1); expect(s.elements.length).toBe(1); expect(s.muscles.length).toBe(2); expect(s.tendons.length).toBe(0); expect(s.nerves.length).toBeGreaterThan(0) })
  it('E12.5 has humerus, radius, ulna cartilage and metacarpal condensations', () => { const s = by('E12.5'); expect(count(s,'humerus','cartilage')).toBe(1); expect(count(s,'radius','cartilage')).toBe(1); expect(count(s,'ulna','cartilage')).toBe(1); expect(count(s,'metacarpal','condensation')).toBe(5); expect(count(s,'proximal-phalanx')).toBe(0) })
  it('E13.5 has distal phalanges as condensation only', () => { const s = by('E13.5'); expect(count(s,'distal-phalanx','condensation')).toBe(4); expect(count(s,'distal-phalanx','cartilage')).toBe(0); expect(count(s,'metacarpal','cartilage')).toBe(5) })
  it('E14.5 has every phalanx as cartilage and sleeves on long bones', () => { const s = by('E14.5'); expect(count(s,'distal-phalanx','cartilage')).toBe(5); expect(count(s,'humerus','sleeve')).toBe(1); expect(count(s,'radius','sleeve')).toBe(1) })
  it('no ossification before E15.5; humerus ossifies at E15.5; all long bones by E16.5', () => {
    ;['E11.5','E12.5','E13.5','E14.5'].forEach((st) => expect(by(st as Stage).elements.some((e) => e.state === 'ossifying')).toBe(false))
    expect(count(by('E15.5'),'humerus','ossifying')).toBe(1); expect(count(by('E15.5'),'radius','ossifying')).toBe(0)
    ;['humerus','radius','ulna'].forEach((n) => expect(count(by('E16.5'), n as ElementName, 'ossifying')).toBe(1))
  })
  it('every capsule endpoint lies inside the viewBox', () => forelimb.forEach((s) => { const [, , w, h] = s.viewBox.split(' ').map(Number); s.elements.forEach((e) => [e.p, e.d].forEach(([x, y]) => { expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(w); expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThanOrEqual(h) })) }))
  it('every stage renders four valid versions from E12.5', () => forelimb.filter((s) => s.stage >= 'E12.5').forEach((s) => { expect(availableVersions(s)).toEqual(['outline','skeleton','muscle','nerves']); availableVersions(s).forEach((v) => expect(validateItem({ id: 'development.x', name: 'x', category: 'development', keywords: [], svg: limbSvg(s, v), width: 10, height: 10, primary: '#000000' })).toEqual([])) }))
})
```

- [ ] **Step 2: Run** — FAIL (module not found).
- [ ] **Step 3: Author** `forelimb.ts` stage by stage using the frame table; after each stage run `npx tsx scripts/icon-sheet.ts development <scratch>` (once Task 5 wires items; before that, a temporary script in the scratchpad that calls `limbSvg` for every stage/version and writes an SVG sheet, converted with `qlmanage`) and read the PNG back, comparing with the reference panels.
- [ ] **Step 4: Run** tests — PASS.
- [ ] **Step 5: Commit** `feat(library): mouse forelimb stage data`.

### Task 4: Hindlimb stage data

**Files:**
- Create: `src/library/items/limbs/hindlimb.ts` exporting `export const hindlimb: LimbStage[]`
- Test: `src/library/items/limbs/stages.test.ts` (hindlimb half)

Same frame as the forelimb, but: femur, tibia (anterior, upper), fibula (posterior, lower, thinner r3); footplate broader (56 wide at E12.5) with digit 1 (hallux) shortest and set higher; toes stubbier than fingers (phalanges 7 units); knee flexion so the zeugopod angles slightly up. Lag: E11.5 = bud with AER, femur condensation faint, nerves at the base only (one width-2 stub), no muscle; E12.5 = footplate without scallops, femur/tibia/fibula condensation, metatarsals 2 to 4 condensation, dorsal and ventral muscle masses, femoral and sciatic trunks in thigh; E13.5 = concavities not clefts, all elements cartilage except distal phalanges (condensation) and metatarsals 1 and 5 (condensation), nerves to the base of the footplate; E14.5 = toes nearly separate (web 6 units), distal phalanges cartilage, sleeves on femur/tibia/fibula, nerves to toe tips; E15.5 femur small ossifying band (band length 0.12 L instead of 0.4 L: implement as element `state: 'ossifying'` and let `limb.ts` scale the band by stage? No: keep one band length, the spec accepts a small domain drawn at standard width); E16.5 all long bones ossifying; E17.5 metatarsals ossifying; E18.5 proximal phalanges ossifying.

- [ ] **Step 1: Add failing tests** mirroring Task 3 with hindlimb names, plus:

```ts
it('E11.5 hindlimb has no muscle version', () => expect(availableVersions(byH('E11.5'))).toEqual(['outline','skeleton','nerves']))
it('E13.5 hindlimb distal phalanges are condensation; E14.5 cartilage', () => { expect(count(byH('E13.5'),'distal-phalanx','cartilage')).toBe(0); expect(count(byH('E14.5'),'distal-phalanx','cartilage')).toBe(5) })
it('E15.5 hindlimb ossifies femur only', () => { expect(count(byH('E15.5'),'femur','ossifying')).toBe(1); expect(count(byH('E15.5'),'tibia','ossifying')).toBe(0) })
```

- [ ] **Step 2: Run** — FAIL. **Step 3: Author** `hindlimb.ts`. **Step 4: Run** — PASS. **Step 5: Commit** `feat(library): mouse hindlimb stage data`.

### Task 5: Assemble limb items

**Files:**
- Modify: `src/library/items/development.ts`
- Test: `src/library/items/development.test.ts`, `src/library/registry.test.ts`

```ts
const VERSION_SUFFIX: Record<LimbVersion, string> = { outline: '', skeleton: '-skeleton', muscle: '-muscle', nerves: '-nerves' }
const VERSION_NAME: Record<LimbVersion, string> = { outline: '', skeleton: ', skeleton', muscle: ', muscle and tendon', nerves: ', innervation' }
const VERSION_KEYWORDS: Record<LimbVersion, string[]> = {
  outline: ['outline', 'silhouette', 'limb bud'],
  skeleton: ['skeleton', 'cartilage', 'alcian', 'condensation', 'precartilaginous', 'alizarin', 'ossification', 'bone'],
  muscle: ['muscle', 'tendon', 'myod1', 'scleraxis', 'mf20', 'musculoskeletal'],
  nerves: ['nerve', 'innervation', 'neurofilament', 'brachial plexus', 'lumbar plexus', 'axon'],
}
function stageKeywords(stage: Stage, theiler: number): string[] // ['e12.5', '12.5 dpc', 'ts20', 'theiler 20', 'theiler stage 20']
export function limbItems(stages: LimbStage[]): LibraryItem[]
export const items: LibraryItem[] = [...embryoItems, ...limbItems(forelimb), ...limbItems(hindlimb)]
```

Keywords per limb item: `['mouse', 'mus musculus', 'embryo', 'limb', 'limb development', limb, limb === 'forelimb' ? 'handplate' : 'footplate', 'autopod', 'zeugopod', 'stylopod', 'digit', ...stageKeywords, ...VERSION_KEYWORDS[v]]`. Primary `#e8c9a0`, secondary `#5b8fd6`. Size from `limbDefaultSize`.

- [ ] **Step 1: Failing tests** in `development.test.ts`: 65 limb items; ids unique and match `/^development\.mouse-(fore|hind)limb-e1\d-5(-skeleton|-muscle|-nerves)?$/`; `searchItems('e13.5')` includes `development.mouse-forelimb-e13-5-skeleton` and `development.mouse-hindlimb-e13-5`; `searchItems('ts21')` same; `applyColors(item.svg, item.primary, item.secondary)` contains no `#PRIMARY`/`#SECONDARY` for every item; E10.5 has only the outline items; `development.mouse-hindlimb-e11-5-muscle` does not exist.
- [ ] **Step 2: Run** — FAIL. **Step 3: Implement**. **Step 4: Run** `npm test` — PASS; the registry test prints the new count.
- [ ] **Step 5: Contact sheet**: `npx tsx scripts/icon-sheet.ts development <scratch>/sheets` and read the PNG back; fix stage data where shapes disagree with the references. Repeat until clean.
- [ ] **Step 6: Commit** `feat(library): mouse limb stage icons (65)`.

### Task 6: Embryo icons

**Files:**
- Create: `src/library/items/embryos/e10-e12.ts`, `e13-e15.ts`, `e16-e18.ts`, each exporting `items: LibraryItem[]` (three items)
- Modify: `src/library/items/development.ts` (spread the three modules first)
- Test: `development.test.ts` (embryo count and ids), registry validation

Each item: id `development.mouse-embryo-e12-5`, name "Mouse embryo E12.5", keywords `['mouse', 'mus musculus', 'embryo', 'embryonic day', 'e12.5', '12.5 dpc', 'ts20', 'theiler 20', 'theiler stage 20', 'development', 'organogenesis', ...stage-feature words]`, primary `#e8c9a0`, secondary `#374151`, viewBox `0 0 100 100` for E10.5 to E12.5, `0 0 100 120` for later, height from the CRL rule (4.5, 6.5, 8.5, 10.5, 12, 14, 16.5, 19, 21 mm), width = height × viewBox aspect.

Drawing brief (lateral view, head left, dorsal to the right, as in the eMouseAtlas plates TS17 to TS26 in the scratchpad `emap/sheet.png`):
- Body as one closed `#PRIMARY` path with 2.5 px outline. Head, trunk and tail in one silhouette; the tail curls under the body at E10.5 to E13.5 and tucks along the belly later.
- Features as additional strokes and fills: somites as a row of short strokes along the dorsal curve (E10.5: ~20 visible, E11.5: ~16, E12.5: ~10 posterior only); branchial arches as two or three curved strokes behind the eye at E10.5 and E11.5; eye as a circle in `#SECONDARY` (open ring at E10.5 and E11.5, filled from E12.5, with an eyelid arc at E13.5 and E14.5, fused line from E15.5); otic vesicle / pinna as a small ellipse (E10.5 to E12.5) then a pinna shape (E13.5 onward, flat ear E16.5 onward); heart bulge as a soft curve on the ventral side (E10.5 to E12.5); umbilical hernia as a small loop at the belly (E11.5 to E15.5); vibrissae as a dotted patch on the snout from E13.5 and 3 to 4 whisker strokes from E16.5; skin wrinkles as 3 to 4 short strokes across the back at E17.5 and E18.5.
- Limbs on the embryo reuse the stage's limb silhouette scaled to about 22 units long for the forelimb (hindlimb half a day behind), placed at the flank; from E14.5 the forelimb is flexed with the hand under the chin, the hindlimb folded with the foot pointing forward, matching the plates.

This task is a good fit for three parallel subagents (one per file). Give each: this task's text, `src/library/types.ts`, the `wrap` helper copied from `tissues.ts`, the three plates for its stages, Martin Fig. 1 for E10.5 to E12.5, the validation command `npx vitest run src/library`, and a per-file contact-sheet command. Never give two agents one output path.

- [ ] **Step 1: Failing test** in `development.test.ts`: 9 embryo items with ids `development.mouse-embryo-e10-5` … `-e18-5`; heights strictly increasing; `searchItems('ts17')` finds the E10.5 embryo.
- [ ] **Step 2: Run** — FAIL. **Step 3: Author** the three files (subagents or inline). **Step 4: Run** `npm test` — PASS.
- [ ] **Step 5: Contact sheet** of `development`; read back; compare against `emap/sheet.png`; fix.
- [ ] **Step 6: Commit** `feat(library): mouse embryo stage icons E10.5 to E18.5`.

### Task 7: Browser check, docs, release

**Files:**
- Modify: `CHANGELOG.md` (Unreleased → 0.5.0), `package.json` version, `README.md` feature list, `CLAUDE.md` architecture map (limbs generator, development category) and known gaps.

- [ ] **Step 1:** `npm run build` clean.
- [ ] **Step 2:** Playwright: open the dev server, clear `localStorage`, open the Library panel, expand "Developmental stages" (count 74), search "E13.5", insert `Mouse forelimb E13.5, skeleton` and `Mouse embryo E13.5`, recolour primary, screenshot and read it back; export SVG via `window.__diagramit` and confirm the limb group is present.
- [ ] **Step 3:** CHANGELOG under `## [0.5.0] - 2026-10-14`: Added — Developmental stages category with 9 mouse embryo icons (E10.5 to E18.5, Theiler 17 to 26) and 65 fore/hindlimb icons in outline, skeleton, muscle-and-tendon and innervation versions, generated from a per-stage anatomy table after Martin 1990 and Rafipay et al. 2018. Data counts from the registry test. Bump `package.json` to 0.5.0.
- [ ] **Step 4:** Commit `feat(library): mouse embryo and limb stage icons; release 0.5.0`. Run `scripts/release.sh` only if the owner asks; pushing to master deploys.
