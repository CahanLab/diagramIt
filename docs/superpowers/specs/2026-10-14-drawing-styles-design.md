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

## Out of scope

- Styles for icons outside the Developmental stages category.
- Per-document default style beyond the panel selector.
