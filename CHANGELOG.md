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
