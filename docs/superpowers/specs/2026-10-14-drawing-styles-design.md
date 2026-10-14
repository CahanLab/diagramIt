# Drawing styles for developmental icons — design spec (2026-10-14)

Addendum to `2026-10-14-mouse-embryo-limb-icons-design.md`. Owner approved
the direction on 2026-10-14 and asked for autonomous execution: build the
style parameter with the camera lucida style first, the realistic style
second.

## Intent

The same developmental icon (embryo or limb stage) can be drawn in three
styles, chosen in the library panel before insertion and switchable on a
selected icon afterwards:

- **basic** — the flat fill with 2.5 px outline that shipped in 0.5.0.
- **lucida** — camera lucida ink drawing in the manner of Grüneberg,
  *The Pathology of Development* (1963), Fig. 28: thin uniform ink line,
  white interior, the limb left open at the flank where it joins the body,
  skeletal elements as stipple whose density encodes maturity (sparse streaks
  for precartilaginous condensations, dense stipple for cartilage, an outlined
  dense band for periosteal sleeves and ossifying diaphyses), muscle as
  hatching, tendons as paired lines, nerves as solid lines.
- **realistic** — a dissecting-microscope look: gradient-shaded translucent
  tissue with a dark rim and a specular highlight, condensations as soft
  glows, cartilage as translucent blue-white rods, organs showing through the
  embryo's body wall. Requires relaxing the icon contract to allow gradients
  (section "Contract change" below). Built after lucida.

Styles are renderings of one structural model, not separate icons. Ids,
names, keywords and search are unchanged; the library count stays 74.

## Structural models

- Limbs already are models (`items/limbs/*.ts`, `LimbStage`). Each style is a
  renderer over `LimbStage`: `generators/limb.ts` (basic),
  `generators/limbLucida.ts`, `generators/limbRealistic.ts`.
- Embryos become models: `items/embryos/model.ts` defines

  ```ts
  type EmbryoPartTag = 'body' | 'limb' | 'hand' | 'foot' | 'tail' | 'eye' | 'lens'
    | 'eyelid' | 'ear' | 'nasal' | 'arches' | 'somites' | 'heart' | 'hernia'
    | 'vibrissae' | 'whiskers' | 'wrinkles' | 'claws' | 'pads' | 'detail'
  interface EmbryoPart {
    tag: EmbryoPartTag
    d: string                       // path data in the model's viewBox
    draw: 'fill' | 'stroke' | 'dots' | 'sausage' | 'fill-secondary' | 'ring-secondary' | 'fill-white' | 'fill-dark'
    w?: number                      // basic stroke width (default 2.5); sausage/dots diameter
    transform?: string              // optional SVG transform for the part
  }
  interface EmbryoModel { stage: Stage; theiler: number; viewBox: string; parts: EmbryoPart[] }
  ```

  `renderEmbryo(model, style)` returns SVG. The basic renderer reproduces
  the 0.5.0 drawings; `items/embryos/{e10-e12,e13-e15,e16-e18}.ts` export
  `models` and derive `items` from the basic renderer. Parts are drawn in
  array order.

## Library and UI

- `DrawingStyle = 'basic' | 'lucida' | 'realistic'` in `library/types.ts`.
- `LibraryItem.styles?: Partial<Record<DrawingStyle, { svg: string; primary: string; secondary?: string }>>`
  holds the alternative renderings with their default palettes (lucida ink is
  `#PRIMARY`, default `#1f2937`). `svg`/`primary` on the item remain the
  basic style. `registry.renderingFor(item, style)` returns the rendering,
  falling back to basic for items without styles (all other categories,
  custom libraries).
- Editor store: `drawingStyle` (default `basic`), persisted with the app
  preferences. Library panel: a segmented "Drawing style" control at the top
  of the Developmental stages section; thumbnails and insertion use it.
- Inserted icon groups record `data.style`. Properties panel shows a "Style"
  select for icons whose item has styles; changing it re-renders the group in
  place at the same position and displayed width and resets colours to that
  style's defaults (a style change is a change of medium, so the previous
  colour is not carried over).
- Exports are unaffected: all styles are plain SVG.

## Lucida rendering rules

- Ink: `#PRIMARY`; line widths outline 1.1, features 0.9, stipple dot 0.9
  (round-capped zero-length segments in one `<path>` per element so a bone
  stays one Fabric object).
- Limb outline is the open spline from the anterior flank point around the
  autopod to the posterior flank point, plus two short proximal extension
  strokes that fade (stroke-opacity 0.5) to suggest continuity with the body.
- Stipple is deterministic (mulberry32 seeded from limb, stage, element index)
  on a jittered grid in the element's local frame. Condensation: spacing 2.6,
  keep probability falls to 0.25 at the edge and the ends. Cartilage: spacing
  1.4, uniform, plus a 0.8 outline. Sleeve: cartilage plus a 1 px outlined
  band at mid-diaphysis. Ossifying: band filled with spacing 0.9 stipple.
- Muscle blocks (ellipses from `blob`) are hatched: parallel 0.7 lines at 45°
  to the block axis, spacing 2.2, clipped analytically to the ellipse.
  Intrinsic hand muscles are outlined only. Tendons: ink 3.2 under white 1.6
  (two 0.8 lines). Nerves: solid ink, widths 1.8 / 1.2 / 0.8 by class.
- Embryo: body, limbs, hands, feet and tail as 1.1 outlines with white fill;
  pigmented eye solid ink; all other features 0.9 strokes; vibrissae as 1.2
  dots. No fills other than white and ink.

## Realistic rendering rules (phase 2)

- Contract change: `validate.ts` additionally allows `defs`, `linearGradient`,
  `radialGradient`, `stop`, and `url(#id)` references to gradients defined in
  the same icon. Ids are prefixed per icon to avoid clashes when several
  icons share a canvas. `insert.ts` recolours gradient stops whose colour is
  `#PRIMARY`/`#SECONDARY` or a tint token (`#PRIMARY-L1`, `#PRIMARY-D1` for
  lighter and darker derived tints) by rebuilding the Fabric gradient; the
  custom-libraries normaliser accepts the same elements.
- Tissue: radial gradient from a warm highlight near the dorsal/upper third
  to a darker rim; a 0.6 outline at 0.6 opacity; a translucent white specular
  blob. Cartilage: rod with axial highlight; condensation: radial glow with no
  edge; ossifying: deeper red core band with soft edge. Muscle: red with
  axial sheen; tendon: pearly white band; nerve: pale yellow with dark core.
- Embryo: body gradient, darker ventral shadow, heart and liver as translucent
  red/brown shapes under the body wall from E10.5 to E13.5, eye as glossy
  black with a highlight from E12.5.

## Tests

- `renderEmbryo(model, 'basic')` validates for all nine models; the lucida
  rendering of every model and every limb stage/version validates, contains
  no `#SECONDARY`, and no fill other than `#ffffff`, `none` or `#PRIMARY`.
- Stipple determinism: two renders of the same stage are identical strings.
- `renderingFor` falls back to basic for an item without styles.
- Store: `drawingStyle` round-trips through persistence.
- Realistic (phase 2): validator accepts gradients only with prefixed ids;
  recolouring a gradient-filled icon changes every stop that carried a token.

## Implementation notes (2026-10-14)

- Tint tokens are `#PRIMARYL`/`#PRIMARYD`/`#SECONDARYL`/`#SECONDARYD` (no
  hyphen, so the `\b` token regexes stay unambiguous). Each role/variant pair
  has its own sentinel colour at insert time; Fabric gradient stops that carry
  a sentinel are recorded in `data.stops` and repainted by `recolorIcon`.
- Gradient ids: `rl-<f|h>-e<day>-5-<version>-body` for limbs,
  `re-e<day>-5-body` for embryos; `objectBoundingBox` units, so every filled
  part (body, hand, foot, hernia) gets its own radial shading.
- The custom-library sanitiser still rejects gradients; saving a realistic
  icon into a custom library is a known gap.
- PyMuPDF does not render gradient fills; realistic sheets are checked with
  `qlmanage -s <max dimension>`.

## Camera lucida v2: stipple tone and epithelial detail (2026-10-14, phase 3)

Owner supplied Carter (1954) figures reproduced in Grüneberg (1963): Fig. 123,
the E12.5 hindlimb (structures projected on the footplate plane: AER as an
epithelial band, marginal blood sinus, limb axial artery, femur/tibia/fibula
blastemas as density fields, mesenchyme stippled with graded density) and
Fig. 125, E14 embryos shaded entirely by stipple of varying size and density
(crease shadows under the chin and limbs, dense along the back, vibrissae as
ring rows, eye as a ring with a crescent lid).

- **Tone engine** (`generators/tone.ts`, pure): SVG path flattener
  (M L H V C S Q T A Z, absolute and relative) to polygons with an optional
  `translate/rotate/scale` transform; point-in-polygon; distance to polygon
  edge; `stippleField(polygons, tone, opts)` samples a jittered grid, keeps a
  dot with probability `tone(x, y)` and sizes it by tone, emitting three
  `<path>`s (small, medium, large dots) so an icon stays a handful of objects.
  Seeded (mulberry32) from the icon id.
- **Limb tone**: base 0.12 (0.2 proximal to 0.1 in the plate), edge term
  rising to +0.65 within 6 units of the silhouette, blastema halo
  `+0.7·exp(-(d/1.2r)^2)` around each element (condensations have no outline
  and are the halo itself), capped at 1. Cartilage keeps the outlined dense
  core from v1.
- **AER band**: at AER stages the distal margin gets two parallel lines (just
  inside the outline and 2 units outside) with perpendicular cell boundaries
  every 1.3 units. **Vessels** (`LimbStage.vessels`, generated in `build.ts`
  for E11.5 to E13.5): marginal sinus 3.2 units inside the margin as a dashed
  1.6 line, axial artery from the proximal limb between the zeugopod bones to
  the plate centre, 2.2 tapering to 1.4. Drawn in the lucida skeleton version
  (ink) and the realistic skeleton version (translucent red).
- **Shape corrections** from Fig. 123: E12.5 hindlimb straight and tapered
  with a broad round plate and a smooth margin (digit positions as faint
  bumps); the forelimb keeps Martin's corrugated handplate.
- **Embryo tone**: body polygon from the `body` part; edge term as for limbs;
  crease shadows within 4 units of limb, hand, foot and tail parts (sausage
  parts use their centreline and half-width); vibrissae as rings from E13.5;
  eye as ring with pupil; pinna crescent unchanged.
- **Lazy styles**: `styles.<style>.svg` is a getter rendered on first use and
  cached, so startup does not render 148 stippled icons.

## Silhouette fidelity (2026-10-14, phase 4)

Owner supplied screenshots of the eMouseAtlas 3D models (E11.5, E12.5 whole
embryos, E14.5 isolated hindlimb, E15.5 whole embryo) and judged the limb
outlines inaccurate: slab-like buds, a stalk-thin arm under an oversized plate
at E12.5, hooked notches on the E12.5 footplate margin, a zig-zag of joint
angles, a thumb-like digit 1, and blunt digits. Targets were taken from the
screenshots and the Theiler plates TS17 to TS26, checked against Carter's
E12.5 hindlimb and Martin's handplates.

Changes to the silhouette engine (`items/limbs/geometry.ts`), all styles
inherit them:

- **Buds** (no digits) are domes: `bud { base, width, at }` gives the
  half-width at the flank, the maximum half-width and where it occurs; the
  base section follows a quarter sine, the tip a quarter ellipse sampled
  uniformly in angle. E10.5 is a half ellipse (`at` 0), E11.5 a rounded
  paddle slightly wider than its base.
- **Flank cut**: the silhouette is the open spline round the limb closed by a
  straight line (`outline === outlineOpen + 'z'`), which removes the spline
  overshoot that put notches at the flank corners.
- **Segments** take an optional `bulge` (extra half-width at 45 % of the
  segment as a fraction of the width) for the convex thigh and a softer
  forearm; `base` sets the half-width at the flank. Joint angles were
  reduced to a gentle S (stylopod 12 to 16°, zeugopod −3 to −4°).
- **Plate**: the digit bases drop proximally by `k² · arc` from the middle
  ray, so the bases lie on a round plate; the outline fans in a straight line
  from the wrist edge to the outer side of the outer digit's base, which
  continues into that digit's outer edge; a scalloped plate bows that line
  outward by 12 % of its length.
- **Webbing**: `web ≥ PLATE_WEB (0.75)` draws a plate whose margin is the
  digit apexes and the clefts between them (scallop depth `(1 − web)·len`);
  below it each digit gets a rounded tip of half-width
  `min(tipWidth, 0.42·spacing)` and the cleft is never shallower than the
  tip rounding. This removed the self-intersections that drew hooks when
  digit widths exceeded their spacing. `stages.test.ts` now checks every
  silhouette for self-intersection.
- **Digits** take `tip` (tip half-width as a fraction of the base width,
  0.55 to 0.6 from E14.5); claws scale with the tip width; digit 1 is short
  and lies at 22 to 30° from the axis rather than opposed; the fan closes
  from ±30° at E14.5 to ±22 to 24° from E16.5.
- Hair placodes are derived from the geometry (`placodes(g, p, n)`) instead
  of fixed coordinates, so they stay inside the reshaped limb.

Proportions checked against the E14.5 hindlimb render: foot (ankle to toe
tips) 47 % of the limb length (render about 45 %), thigh maximum half-width
17 % of the length (render 16 %), ankle half-width 10 % (render 9 %), toe fan
60° (render about 65°).

Still not addressed: embryo silhouettes were not changed in this phase; the
limbs remain dorsal views laid out nearly straight, whereas the E15.5 render
shows the elbow and knee strongly flexed.

## Out of scope

- Styles for icons outside the Developmental stages category.
- Per-document default style beyond the panel selector.
