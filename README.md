# DiagramIt

A browser-based drawing app for publication- and grant-quality schematics of
laboratory tasks, experimental designs and analyses. It ships with a library of
~330 recolourable scientific icons (cells, consumables, tools, instruments,
tissues, species, molecular biology/omics, analyses) and a **differentiation
timeline builder** for figures that show iPSCs being guided to a cell type by
a series of media changes over time.

## Use it

Hosted build (no install): https://cahanlab.github.io/diagramIt/

If a figure made with DiagramIt appears in a paper, poster, talk or web page,
please acknowledge it (Help ▸ About has copyable wording):

> Figure created with DiagramIt (Cahan Lab;
> https://cahanlab.github.io/diagramIt/).

## Terms of use and license

**Hosted app.** Anyone, including commercial organizations, may use the hosted
app to make figures. Figures you make are yours to use however you like; an
acknowledgement is appreciated but not required.

**Source code.** Copyright 2026 Patrick Cahan. Open source under the
[MIT License](LICENSE): free to use, modify, share and build on for any
purpose, provided the copyright notice is kept.

## Releases

Each release is a git tag (`vX.Y.Z`) with a GitHub release whose notes come
from `CHANGELOG.md`; the hosted app always serves the latest `master`. To cut
one: update `CHANGELOG.md` and `package.json`, commit, then run
`scripts/release.sh`.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (vitest)
npm run build      # production build in dist/
```

Node 20 or newer. No backend: everything runs in the browser and autosaves to
local storage. Projects are saved as `.diagramit.json` files.

## What you can do

- **Library** (left): search or browse categories; click to insert at the
  centre of the view or drag onto the canvas. Icons are vector and their
  primary/accent colours can be changed in the properties panel.
- **Parametric objects**: well plates (6–384 wells, optionally highlighting
  wells), overlapping cell clusters (count, colours, nuclei), Petri dishes with
  colonies (top or side view).
- **Differentiation timeline** (toolbar button, library card, or Insert
  menu): stages with start/end days, media/factor lines, cell population,
  cell icon and colour, marker lists; an endpoint population; an ECM/note row;
  extra coloured band rows. Two layouts: *classic* (Nature-Protocols style
  axis with cells and media boxes) and *compact strip* (day ruler with bands).
  Stage spacing can be time-proportional, auto-widened to fit text, or equal.
  Double-click a timeline to edit it again.
- **Developmental ontogeny** (toolbar button, library card, or Insert menu):
  curated lineage graphs for mouse embryonic development (87 cell types,
  E0–P0), hematopoiesis (71), human embryonic development (84, day 0 to
  fetal) and the C. elegans embryonic lineage (56), plus a blank starter.
  Edit nodes (label, stage, lineage, markers, icon, parents), stages and
  lineages; add children, delete a node (progeny re-attach to its parent) or a
  whole subtree; hide a node alone (progeny reconnect to the nearest visible
  ancestor, or become new roots), hide a subtree, collapse, or *emphasise*
  nodes (whole root-to-node paths stay at full opacity while the rest fade);
  restrict to a stage range (e.g. oligopotent → precursor) without losing the
  progeny; override colour, shape, size and label style per node and colour,
  width, dash and label per edge; zoom the live preview; choose tree or staged
  (time-column) layout, horizontal or vertical, curved / straight /
  orthogonal / **metro-map** edges, circle / pill / label / icon nodes,
  colour by lineage or stage, spacing, legend and stage bands. The dialog
  shows a live preview. Double-click an inserted ontogeny to edit it again.
- **Drawing tools**: text, rectangle, rounded rectangle, ellipse, triangle,
  diamond, hexagon, star, line, arrow, elbow arrow, freehand pen.
- **Editing**: move/scale/rotate handles, multi-select, group/ungroup,
  duplicate, copy/paste, align and distribute, z-order, flip, lock, snapping
  guides, nudge with arrow keys, undo/redo, zoom and pan.
- **Properties** (right): fill, stroke, width, dash, opacity, corner radius,
  fonts (family, size, bold/italic/underline, alignment, line height,
  super/subscript while editing), position, size, rotation.
- **Page setup**: presets for slides and journal figure widths, background.

## Export

| Format | Notes |
| --- | --- |
| **PPTX** | One slide with the figure as vector graphics. In PowerPoint: right-click → *Convert to Shape* → *Ungroup* to edit every element natively. |
| **SVG** | Vector. Inserts into PowerPoint, Word, Illustrator, Inkscape. |
| **PDF** | Vector, page-sized. |
| **PNG** | Raster at 1–6× page resolution, optional transparent background. |
| **Project** | `.diagramit.json`, re-openable with everything editable. |

## Keyboard shortcuts

`V` select · `H` pan · `T` text · `R` rect · `U` rounded rect · `O` ellipse ·
`L` line · `A` arrow · `E` elbow arrow · `P` pen · `⌘Z/⌘⇧Z` undo/redo ·
`⌘C/⌘V/⌘X/⌘D` copy/paste/cut/duplicate · `⌘G/⌘⇧G` group/ungroup ·
`⌘]/⌘[` order · arrows nudge · `⌘0` fit · `⌘1` 100% · `⌘+/-` zoom ·
`⌘S` save · `⌘O` open · `⌘E` export · `Esc` deselect.

## Code layout

```
src/canvas     Fabric.js canvas wrapper, editor store, tools, history, commands
src/library    Icon contract, registry, recolouring, insertion, generators,
               items/<category>.ts (SVG strings using #PRIMARY / #SECONDARY)
src/protocol   Timeline data model, pure layout engine, editor
src/ontogeny   Lineage-graph model, curated graphs (graphs/*.ts), layout engine, editor
src/draw       Shared drawing commands → Fabric renderer and SVG previewer
src/export     SVG / PNG / PDF / PPTX / project file
src/ui         Panels, toolbar, dialogs
src/templates  Starter documents
scripts/icon-sheet.ts   Render a category contact sheet (macOS) for review
```

Adding an ontogeny: add `src/ontogeny/graphs/<name>.ts` exporting `graph: Ontogeny`
(see `graphs/README.md` for the rules) and register it in `graphs/index.ts`; the
graph test validates structure.

Adding an icon: append a `LibraryItem` to the relevant `src/library/items/*.ts`
module (see `src/library/types.ts` for the SVG rules) and run `npm test`; the
registry test validates every icon.
