# Changelog

All notable changes to DiagramIt are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/) (0.x while the app is pre-1.0).

## Maintenance policy

1. **Every user-visible change gets a line here** under `Unreleased`, in the
   right category (Added / Changed / Fixed / Removed / Data), written for the
   user, not the implementer ("Ontogeny editor can hide a node without hiding
   its progeny", not "refactored visibleGraph").
2. **Cut a release** when a coherent batch of work ships: move `Unreleased`
   to a dated `## [x.y.z] - YYYY-MM-DD` heading and bump `version` in
   `package.json` in the same commit. Minor bump for features, patch for
   fixes, major when project files (`.diagramit.json`) or exports change
   incompatibly. If the project-file schema changes, bump `ProjectFile.version`
   in `src/export/project.ts` and add a migration in `normalizeProjectJson`.
3. **Data counts are part of the record**: when icon sets or curated
   ontogenies change, note the new counts (the registry/graph tests print them).
4. **Dependencies**: check `npm outdated` at each release; Fabric.js upgrades
   get a manual browser pass (selection, text editing, exports) because the
   app relies on undocumented behaviour (origins, guides during raster export).
5. **Docs stay in sync**: README feature list, CLAUDE.md architecture map and
   the specs in `docs/superpowers/specs/` are updated in the same commit as the
   code they describe. Keep the "Known gaps" list in CLAUDE.md honest.
6. **Verification before release**: `npm test`, `npm run build`, open the app,
   insert a timeline and an ontogeny, export PPTX/SVG/PNG, open the PPTX in
   PowerPoint and run Convert to Shape once.

## [Unreleased]

## [0.8.0] - 2026-10-14

### Changed

- Camera lucida style redrawn after Carter (1954) as reproduced in Grüneberg,
  *The Pathology of Development* (Figs. 123 and 125): tone now comes from
  stipple of graded density and dot size (denser toward the silhouette edge
  and in creases against limbs, with a halo around each skeletal blastema);
  the apical ectodermal ridge is drawn as an epithelial band of cells; the
  marginal blood sinus and limb axial artery appear in the skeleton version
  at E11.5 to E13.5 (ink in camera lucida, translucent red in realistic);
  precartilaginous condensations are density fields rather than outlined
  capsules; embryo vibrissae are ring rows from E13.5 and the eye a ring with
  a pupil.
- E12.5 hindlimb reshaped to Carter's proportions: straight tapered proximal
  segment, broad round footplate with a smooth margin and faint digit bumps.
  Basic and realistic styles inherit the shape.
- Alternative styles render lazily on first use (the stippled icons are
  about 14 KB each), so the app starts as fast as before.

## [0.7.0] - 2026-10-14

### Added

- Realistic drawing style for the Developmental stages icons: gradient-shaded
  translucent tissue with a dark rim, specular sheen and a soft drop shadow;
  precartilaginous condensations as soft glows, cartilage as translucent
  rods with an axial highlight, periosteal sleeves and ossifying diaphyses as
  bone and Alizarin bands, muscle with sheen, pearly tendons, nerves with a
  dark core; embryos with a glossy eye, the heart showing through the body
  wall at E10.5 to E12.5 and shaded limbs. Recolouring works on gradients:
  the lighter and darker tints follow the chosen colour.

### Changed

- Icon contract: icons may now define linear and radial gradients in
  `<defs>` and reference them with `url(#id)`; tint tokens `#PRIMARYL`,
  `#PRIMARYD`, `#SECONDARYL`, `#SECONDARYD` give derived shades
  (`src/library/color.ts`). User-imported custom-library SVGs are still
  sanitised without gradients, so "Save selection as library item" does not
  accept a realistic-style icon yet.

## [0.6.0] - 2026-10-14

### Added

- Drawing styles for the Developmental stages icons. A "Drawing style" control
  at the top of the section picks Basic or Camera lucida (Realistic is listed
  and currently falls back to Basic until it ships); thumbnails and insertion
  follow it, and a selected developmental icon can be switched between styles
  in the properties panel in place (same position and width, that style's
  default colours). Camera lucida draws thin ink lines with white interiors,
  the limb open at the flank, the skeleton as stipple whose density encodes
  maturity, muscle as hatching, tendons as paired lines and nerves as solid
  lines, after Grüneberg's *The Pathology of Development* (1963). Ink colour is
  recolourable. Spec: `docs/superpowers/specs/2026-10-14-drawing-styles-design.md`.

### Changed

- Embryo icons are now built from a structural model (`items/embryos/model.ts`)
  rendered per style; the basic drawings are unchanged apart from the otic
  vesicle now drawn at reduced opacity as intended.

## [0.5.0] - 2026-10-14

### Added

- "Developmental stages" library category: mouse embryo icons for E10.5 to
  E18.5 (Theiler stages 17 to 26, lateral view after the eMouseAtlas plates)
  and mouse forelimb and hindlimb icons at the same nine stages. Each limb
  comes as outline, skeleton (precartilaginous condensations, cartilage,
  periosteal sleeves, ossifying diaphyses), muscle and tendon, and innervation
  versions where that tissue exists at the stage: 9 embryos + 65 limbs = 74
  icons. Limb icons are generated from a per-stage anatomy table
  (`src/library/items/limbs/`) following Martin 1990 (*Int J Dev Biol*
  34:323) and Rafipay et al. 2018 (*Dev Dyn* 247:1217); the hindlimb lags the
  forelimb by half a day. Search by stage ("E13.5", "TS21") or tissue
  ("alizarin", "neurofilament").

## [0.4.0] - 2026-10-07

### Added

- Custom libraries: save any selection as an icon, save timelines and
  ontogenies as templates, import SVG files, and bundle them under your name
  (File ▸ Libraries…). Export a library as `<id>.diagramit-lib.json`, load one
  from a file, or share a link `?lib=<url>` that loads it on open. Library
  authors are credited in the panel, in Help ▸ About and in the suggested
  acknowledgement sentence. Example library at
  `public/libraries/example.diagramit-lib.json`.

### Changed

- Properties panel hides the icon colour control for icons without
  recolourable regions.

## [0.3.2] - 2026-10-07

### Added

- GitHub mark in the top bar linking to the source repository.
- `scripts/release.sh` tags the version and publishes a GitHub release with
  notes from this file.

### Changed

- Source code relicensed from PolyForm Noncommercial 1.0.0 to MIT (`LICENSE`);
  Help ▸ About and README updated to match.
- Cahan Lab mark enlarged for legibility.

## [0.3.1] - 2026-10-07

### Added

- Source code licensed under PolyForm Noncommercial 1.0.0 (`LICENSE.md`); terms
  of use for the hosted app and figure ownership stated in README and Help ▸ About.

### Changed

- Attribution and acknowledgement text read "Cahan Lab" only.

### Ideas / known gaps
- Drosophila, zebrafish and Arabidopsis ontogenies.
- Label-overlap avoidance in dense ontogeny trees.
- Verify PowerPoint "Convert to Shape" on exported SVG/PPTX in PowerPoint.
- Visual check of PDF export.
- Arrowhead toggles on existing connectors; connector endpoints that attach to shapes.

## [0.3.0] - 2026-10-07

### Added

- Hosted web app on GitHub Pages (https://cahanlab.github.io/diagramIt/), deployed
  by a GitHub Actions workflow on every push to `master`.
- Cahan Lab mark at the right of the top bar, linking to the lab website.
- Help ▸ About DiagramIt: summary, version, copyright, links to the lab site,
  source and issue tracker, a privacy note, and suggested acknowledgement text
  with a Copy button.

## [0.2.0] - 2026-10-05

### Added
- Developmental ontogeny smart object: curated lineage graphs for mouse
  embryonic development (87 nodes), hematopoiesis (71), human embryonic
  development (84) and C. elegans embryogenesis (56), plus a blank starter.
- Ontogeny editor with live preview: node tree with search; add child, delete
  node (progeny re-attach) or subtree; hide subtree; hide node only (progeny
  reconnect to nearest visible ancestor or become roots); collapse; emphasise
  root-to-node paths with fading of the rest; stage range filter; stage and
  lineage editors; per-node style overrides (colour, shape, size, label style)
  and per-edge overrides (colour, width, dash, label); preview zoom.
- Layouts: tree or staged (time columns, optionally proportional to stage
  time), horizontal or vertical; edge styles curved / straight / orthogonal /
  metro map; node styles circle / pill / label / icon; colour by lineage or
  stage; stage axis and bands; lineage legend.
- Starter documents "Hematopoiesis tree" and "Mouse development (metro map)".
- Shared drawing-command renderer (`src/draw/`) used by both smart objects.

### Changed
- Inserted smart objects are scaled to fit the page.
- Long ontogeny labels wrap instead of widening the layout.

## [0.1.0] - 2026-10-04

### Added
- Fabric.js 7 canvas editor: select/move/scale/rotate, multi-select, group,
  duplicate, copy/paste, align/distribute, z-order, flip, lock, snapping
  guides, undo/redo, zoom/pan, keyboard shortcuts.
- Drawing tools: text, rectangle, rounded rectangle, ellipse, triangle,
  diamond, hexagon, star, line, arrow, elbow arrow, freehand pen.
- Icon library (~330 recolourable vector icons) across cells, consumables,
  tools, instruments, tissues, species, molecular biology/omics, analyses,
  composites; parametric well plates, cell clusters and dishes with cells.
- Differentiation timeline smart object with classic (axis, cells, markers,
  media boxes, ECM row) and compact strip layouts; auto / proportional / equal
  stage spacing; templates (iPSC → podocyte, mesendoderm strip, blank).
- Export to PPTX (embedded vector SVG), SVG, PDF, PNG (1–6×, transparent
  option) and `.diagramit.json` project files; autosave to local storage.
- Page setup presets (slides, journal column widths).
