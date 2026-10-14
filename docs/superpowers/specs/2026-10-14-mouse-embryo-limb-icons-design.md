# Mouse embryo and limb stage icons — design spec (2026-10-14)

## Intent

Give figure authors a stage series of the mouse embryo (E10.5 to E18.5) and
of the mouse forelimb and hindlimb at the same stages, drawn with the anatomy
that defines each stage rather than a generic "embryo" glyph. Each limb comes
in layered versions (outline; skeleton; skeleton with muscle and tendon;
skeleton with nerves) so a figure can show the tissue being discussed. A user
picks one limb (fore or hind) at one stage in one version from the library.

Owner approved the design on 2026-10-14 and asked for autonomous execution.
Decisions below were taken by Claude and are recorded here.

## Sources

- Martin P. (1990) Tissue patterning in the developing mouse limb. *Int J Dev
  Biol* 34:323-336. Half-day SEM series E9.5 to E14.5; timetable of skeleton,
  muscle, nerve and skin patterning; Theiler and Wanek stage correspondence.
- Rafipay A., Berg A.L.R., Erskine L., Vargesson N. (2018) Expression analysis
  of limb element markers during mouse embryonic development. *Dev Dyn*
  247:1217-1226. Alcian blue / Alizarin red series E12.5 to E16.5 in fore- and
  hindlimb; anti-neurofilament series E11.5 to E14.5; Scleraxis (tendon),
  MyoD1 (muscle) and Gdf5 (joint) patterns E12.5 to E15.5.
- Kaufman M.H. *The Atlas of Mouse Development* and Theiler K. *The House
  Mouse*, as reproduced at eMouseAtlas (emouseatlas.org): Theiler stage
  criteria TS17 to TS26 for the whole embryo.

Where the papers disagree by half a day (hindlimb nerve entry at E11.5 is
"variable" in Rafipay, "at the base of the bud" in Martin) the icon shows the
earlier, more conservative morphology and the spec notes it.

## Stage timetable used by the icons

Forelimb (FL) and hindlimb (HL). "Cond." = precartilaginous condensation
(not yet Alcian positive); "cart." = cartilage (Alcian positive);
"oss." = ossifying diaphysis (Alizarin positive).

| Stage | TS | Limb outline | Skeleton | Muscle and tendon | Nerves |
|---|---|---|---|---|---|
| E10.5 | 17 | FL: bud, AER thickening not yet visible as a ridge. HL: small bump. | none | none in limb (myogenic cells en route from dermomyotome) | none |
| E11.5 | 19 | FL: paddle-shaped handplate forming, AER ridge. HL: bud with AER. | FL: humerus cond. HL: femur cond. (faint) | FL: dorsal and ventral premuscle masses, no tendons. HL: none | FL: first fascicles in proximal third. HL: axons at base only |
| E12.5 | 20 | FL: corrugated handplate (digital rays), early angulation at elbow. HL: footplate formed. | FL: humerus, radius, ulna cart.; metacarpals 2-4 cond.; digits 1,5 cond. faint. HL: femur, tibia, fibula cond.; metatarsals 2-4 cond. | FL: distinct proximal muscle blocks; tendon progenitor field across wrist/autopod (Scx). HL: dorsal and ventral masses | FL: main mixed trunks (radial, median, ulnar) with branches to proximal muscles, tips at wrist. HL: trunks (femoral, sciatic) in thigh |
| E13.5 | 21 | FL: interdigital clefts forming, fingers outlined. HL: interdigital concavities. First hair placodes. | both: all elements cart. (stylopod, zeugopod, metacarpals/metatarsals, proximal and middle phalanges); distal phalanges cond. | both: muscle blocks in stylopod and zeugopod, fibres to wrist/ankle; discrete tendon bands in autopod, thicker at joints | FL: branches into handplate, reaching digit bases. HL: at base of footplate |
| E14.5 | 22 | FL: fingers separate, very little web. HL: toes nearly separate. Hair placodes numerous. | FL: all phalanges cart., periosteal sleeves on humerus, radius, ulna (no Alizarin). HL: all but distal phalanges cart., sleeves on femur, tibia, fibula | both: sharply defined muscles in stylopod and zeugopod, fibres at proximal metacarpals/metatarsals; tendons along digits to proximal interphalangeal joints | both: dense cutaneous plexus to digit tips |
| E15.5 | 23 | both: digits fully separated and slender; limb elongated | FL: Alizarin in humerus mid-diaphysis. HL: small Alizarin domain in femur | both: definitive muscle sets; tendons to distal interphalangeal joints | both: as E14.5, thicker trunks |
| E16.5 | 24 | both: digits long, claws forming, skin thicker | both: Alizarin in all long bones (humerus, radius, ulna; femur, tibia, fibula) | as E15.5 | as E15.5 |
| E17.5 | 25 | both: wrinkled skin, claws, footpads | as E16.5 plus metacarpal/metatarsal ossification, scapula and pelvis not shown | as E15.5 | as E15.5 |
| E18.5 | 26 | both: term morphology, footpads, claws | as E17.5 plus phalangeal ossification beginning | as E15.5 | as E15.5 |

The hindlimb half-day lag is carried in the table rather than by reusing the
forelimb of the previous stage, because the foot's shape (broader plate,
shorter digits, digit 1 shorter than 2) differs from the hand at every stage.

Whole embryo, lateral view, head to the left, dorsal up:

| Stage | TS | Features drawn |
|---|---|---|
| E10.5 | 17 | C-shaped, 35-39 somites visible along back, branchial arches 1-3, lens pit, otic vesicle, heart bulge, forelimb bud, hindlimb bump, long tail bud, cephalic flexure |
| E11.5 | 19 | 42-48 somites, handplate, hindlimb bud, lens vesicle closed, nasal pit, pigment absent, tail longer, physiological umbilical hernia beginning |
| E12.5 | 20 | pigmented retina, digital rays on handplate, footplate, pinna anlage, umbilical hernia, somites fading posteriorly, mandibular prominence |
| E13.5 | 21 | finger clefts, toe concavities, pinna folds forward, eyelid rim, umbilical hernia, vibrissae follicles |
| E14.5 | 22 | fingers separate, toes separating, pinna covers meatus, eyelids open, vibrissae rows, body straighter |
| E15.5 | 23 | eyelids fusing, digits separate on both limbs, umbilical hernia reduced, skin smooth |
| E16.5 | 24 | eyelids fused, hernia withdrawn, skin thickening, ear flat, limbs flexed under body |
| E17.5 | 25 | wrinkled skin, long vibrissae, footpads, subcutaneous fat rounds the body |
| E18.5 | 26 | term fetus, eyes closed, ears flat, whiskers, head large relative to body |

Approximate crown-rump lengths (Kaufman): 4.5, 6.5, 8.5, 10.5, 12, 14, 16.5,
19, 21 mm for E10.5 to E18.5. Default insert heights scale as
`90 + 60 * (CRL - 4.5) / 16.5` px (90 to 150 px) so a series dropped on the
canvas grows but E10.5 stays legible. Limb icons use the same rule from
limb length (FL 0.9 mm at E10.5 to 6 mm at E18.5, HL half a day behind),
giving default widths of 70 to 140 px.

## Library structure

- New category `development`, label "Developmental stages", placed after
  `species` in `CATEGORY_ORDER`. Ids: `development.mouse-embryo-e12-5`,
  `development.mouse-forelimb-e12-5-skeleton`,
  `development.mouse-hindlimb-e14-5-nerves`. Version suffixes: none for
  outline, `-skeleton`, `-muscle`, `-nerves`.
- Names: "Mouse embryo E12.5", "Mouse forelimb E12.5, skeleton", "Mouse
  hindlimb E14.5, muscle and tendon", "Mouse forelimb E13.5, innervation".
- Keywords include stage synonyms ("e12.5", "ts20", "theiler 20", "12.5 dpc"),
  limb terms ("forelimb", "handplate", "autopod", "digit"), and tissue terms
  per version ("cartilage", "alcian", "condensation", "alizarin",
  "ossification", "muscle", "tendon", "scleraxis", "nerve", "neurofilament").
- Item counts: 9 embryos; limbs 2 (E10.5) + 4 + 3 (E11.5) + 7 × 8 = 65;
  total 74. The existing `tissues.embryo` stays as a generic glyph.
- `OntogenyEditor` and `ProtocolEditor` pick icons from fixed categories and
  are unaffected. The library panel renders the new section with no code
  change beyond the category type.

## Limb generator

Limb icons are composed, not hand-drawn, so the four versions of a stage
share one outline and skeleton and so a correction to one element is made in
one place.

```
src/library/items/limbs/stages.ts   pure data: LimbStage[] (18 entries)
src/library/generators/limb.ts      pure: limbSvg(stage, version) -> string
src/library/items/development.ts    assembles items (embryos + generated limbs)
```

```ts
type Element = {
  name: 'humerus' | 'radius' | 'ulna' | 'femur' | 'tibia' | 'fibula'
      | 'carpal' | 'tarsal' | 'metacarpal' | 'metatarsal'
      | 'proximal-phalanx' | 'middle-phalanx' | 'distal-phalanx'
  digit?: 1 | 2 | 3 | 4 | 5
  state: 'condensation' | 'cartilage' | 'sleeve' | 'ossifying'
  /** capsule: proximal and distal centres, half-width, in viewBox units */
  p: [number, number]; d: [number, number]; r: number
}
type Muscle = { name: string; path: string }        // filled blob
type Tendon = { name: string; path: string }        // stroked band
type Nerve  = { name: string; path: string; width: 1 | 2 | 3 }
interface LimbStage {
  limb: 'forelimb' | 'hindlimb'
  stage: 'E10.5' | ... | 'E18.5'
  theiler: number
  viewBox: string
  outline: string            // closed path, dorsal view, proximal left, anterior up
  aer?: string               // open path along the distal margin when a ridge is present
  hairPlacodes?: [number, number][]
  elements: Element[]
  muscles: Muscle[]
  tendons: Tendon[]
  nerves: Nerve[]
  lengthMm: number           // for default size
}
```

`limbSvg` draws, in order: outline filled `#PRIMARY`; AER as a thick stroke
along the distal margin (E11.5 to E13.5); then per version:

- `skeleton`: condensations as capsules filled `#SECONDARY` at 0.35 opacity
  with a dashed outline; cartilage capsules filled `#SECONDARY`; sleeves add
  a bone-coloured (`#f3e9d2`) band around the mid-diaphysis; ossifying
  elements add an Alizarin (`#c0392b`) mid-diaphysis band. Joint gaps are the
  capsule gaps.
- `muscle`: skeleton, then muscle blobs filled `#b84a3f` at 0.85 opacity,
  tendons as cream (`#f5efe0`) 2 px bands with outline.
- `nerves`: skeleton, then nerve paths stroked `#d9a400`, width by class
  (trunk 3, branch 2, cutaneous 1), drawn over the skeleton without muscle.
  Muscle is omitted here on purpose: nerve and muscle overlap is unreadable
  at icon size.

Only the versions listed in the timetable exist for a stage; `development.ts`
skips a version when the corresponding arrays are empty.

Colours: `#PRIMARY` default `#e8c9a0` (limb mesenchyme), `#SECONDARY`
default `#5b8fd6` (Alcian blue). Fixed tissue colours are constants in
`limb.ts` and listed in `src/library/items/README.md`.

## Embryos

Nine hand-authored SVGs in `development.ts`, viewBox `0 0 100 100` (E10.5 to
E12.5, curled) or `0 0 100 120` (later, longer). `#PRIMARY` default `#e8c9a0`
is the body; `#SECONDARY` default `#374151` marks the eye (pigmented from
E12.5) and the ear. Somites are drawn as a row of short strokes along the
dorsal flank at E10.5 to E12.5. Limb buds on the embryo use the same
silhouettes as the limb icons at reduced scale, so embryo and limb icons
agree.

## Tests

- Registry test already validates every item (parse, viewBox, allowed
  elements, no `url()`); the new items must pass and the printed count rises
  by 74.
- `limb.test.ts`: for every stage, the generated outline version contains no
  `#SECONDARY`; the skeleton version contains exactly the element capsules the
  timetable lists (counts by name and state asserted for E11.5, E12.5, E13.5,
  E14.5, E15.5, E16.5 fore and hind); no `ossifying` state before E15.5; no
  nerves at E10.5; no muscle in E11.5 hindlimb; `nerves` version contains no
  muscle colour.
- `stages.test.ts`: every element capsule lies inside the outline's bounding
  box; element names are consistent with the limb (no femur in a forelimb).

## Verification

- Contact sheets via `scripts/icon-sheet.ts development` read back as images
  and compared against the rendered figure pages of Martin 1990 (Fig. 1, 2, 4,
  5) and Rafipay 2018 (Fig. 5, 6) and against eMouseAtlas Theiler plates.
- Browser pass: open the library, search "E13.5", insert a forelimb skeleton
  and the matching embryo, recolour, export SVG.

## Out of scope

- Ventral views, sections, and the scapula and pelvic girdle.
- Vascular pattern (Cdh5 in Rafipay) as a version. The data model allows a
  future `vessels` array without changing ids.
- Stages before E10.5 and other species.
