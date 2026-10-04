# DiagramIt — design spec (2026-10-04)

## Intent (as understood from the request)

Build a drawing application for making publication- and grant-quality
schematics of laboratory tasks, experimental designs, and analyses. The user
(a stem-cell / computational biologist) wants to drag ready-made scientific
objects onto a canvas, edit them like a normal drawing app, and export the
result in formats that PowerPoint can import and further edit.

The headline use case for this version: diagrams of a directed
differentiation protocol, in which iPSCs are guided to a differentiated cell
type by a series of media changes over days. The two reference figures show
the two layouts to support:

1. **Nature-Protocols style**: a horizontal day axis with ticks, cell icons
   and marker labels at each stage boundary, and a row of boxed media
   compositions under the axis (plus an optional full-width ECM row).
2. **Compact strip**: a day ruler (Day 0 | 1 | 2 ...) with colored media bands
   spanning day ranges, stacked (e.g. factors row above a basal-medium row).

Stated: object library (consumables, tools, instruments, cells, tissues,
species, molecular biology/omics, analyses), text and standard shapes,
select/move/resize/rotate/recolor, save in multiple formats importable into
PowerPoint, easy "iPSCs in a Petri dish" and media-over-time timelines.

Assumptions I made (no feedback was requested):

- A browser app running locally (Vite dev server or static build) is the best
  trade-off for power and ease of use; no backend, no login.
- PowerPoint importability is best served by **SVG** (PowerPoint 2016+ /
  365 imports SVG and "Convert to Shape" turns it into editable native
  shapes) and by a **PPTX** file containing that SVG on a 16:9 slide.
  PNG (hi-res, optional transparent) and vector PDF are also provided.
- Icons are flat, two-tone vector drawings authored in-house (no external
  icon packs, so there are no license issues in publications). Each icon's
  "primary" colour can be changed from the properties panel.

## Approach chosen

**React 19 + TypeScript + Vite, Fabric.js 7 for the canvas, pptxgenjs for
PPTX, jsPDF + svg2pdf.js for PDF, Vitest for tests.**

Alternatives considered:

- *Custom SVG editor in React*: full control, but selection, transforms,
  text editing, grouping, undo etc. would all be re-implemented. Rejected on
  cost.
- *tldraw / Excalidraw*: strong UX, but hand-drawn aesthetics (Excalidraw)
  or licensing/watermark constraints and heavy custom-shape machinery
  (tldraw). Rejected.
- *Fabric.js*: mature interactive object model (move/scale/rotate handles,
  multi-select, groups, in-place text editing, JSON serialisation, SVG and
  PNG export, SVG import into editable paths). Chosen.

## Architecture

```
src/
  app/            App shell, layout, keyboard shortcuts
  canvas/         Fabric canvas wrapper, editor store (zustand), history,
                  snapping/guides, selection helpers
  library/        Icon definitions (SVG strings) grouped by category,
                  parametric generators (plates, cell clusters, dishes)
  protocol/       Differentiation-timeline model + layout engine (pure) +
                  renderer to Fabric objects + editor dialog
  export/         svg/png/pdf/pptx/json exporters and project file I/O
  ui/             Panels: Library, Toolbar, Properties, Menus, dialogs
  templates/      Starter documents (e.g. iPSC → podocyte protocol)
```

### Canvas / editor (`canvas/`)

- One Fabric `Canvas` inside a resizable viewport; document has a page size
  (default 1600 × 900 px, white background) drawn as a page rectangle.
- Tools: select, pan (space/hand), text, rectangle, rounded rect, ellipse,
  triangle, diamond, hexagon, star, line, arrow (line with arrowhead,
  straight or elbow), freehand pen.
- Editing: move/scale/rotate handles (Fabric), multi-select, group/ungroup,
  duplicate, delete, copy/paste, bring to front/back, align (left/center/
  right/top/middle/bottom), distribute, lock aspect with shift, nudge with
  arrow keys, snap-to-objects guides, zoom (wheel+ctrl), pan.
- Properties panel edits fill, stroke, stroke width, dash, opacity, corner
  radius, font family/size/weight/style/alignment, position, size, rotation,
  and icon primary colour. Edits are applied to all selected objects.
- Every object carries `data: { kind, libraryId?, primaryColor?, protocol? }`
  so library items and protocol timelines stay identifiable after save/load.
- Undo/redo: JSON snapshots (debounced, capped at 100).
- Autosave to localStorage; explicit Save/Open as `.diagramit.json`.

### Library (`library/`)

Each icon: `{ id, name, category, keywords, svg, defaultWidth, primary }`.
`svg` uses the literal colour `#PRIMARY` (and `#SECONDARY`) which is
substituted at insert time so icons are recolourable. SVG is parsed with
Fabric's `loadSVGFromString` into a Group, so exported files stay vector.

Categories and target contents:

- Consumables: Petri dishes (35/60/100 mm, top and side view), well plates
  (6/12/24/48/96/384, parametric), T-flasks, conical tubes, microcentrifuge
  tubes, cryovial, media bottle, tip box, serological pipette, PCR tube/strip,
  slide, coverslip, syringe/filter.
- Tools: micropipette, multichannel, pipette controller, cell scraper,
  hemocytometer, forceps, scalpel, timer, vortex, ice bucket.
- Instruments: microscope (brightfield/confocal), flow cytometer, cell sorter,
  thermocycler, qPCR, centrifuge, incubator, biosafety cabinet, sequencer,
  plate reader, bioreactor, mass spectrometer, electroporator, freezer,
  computer/server.
- Cells: generic cell, iPSC colony (parametric cluster), fibroblast, neuron,
  astrocyte, cardiomyocyte, hepatocyte, podocyte, beta cell, endothelial,
  epithelial sheet, T cell, B cell, macrophage, RBC, platelet, adipocyte,
  muscle fibre, embryoid body, organoid, oocyte, sperm, bacterium, yeast.
- Tissues/organs: heart, brain, liver, kidney, lung, pancreas, intestine,
  stomach, skin, bone, blood vessel, muscle, eye, blastocyst, embryo.
- Species: human, mouse, rat, zebrafish, Drosophila, C. elegans, Xenopus,
  chicken, pig, macaque, Arabidopsis, yeast, E. coli, phage.
- Molecular biology / omics: DNA, RNA, protein, plasmid, antibody, lentivirus,
  AAV, CRISPR-Cas9, gel electrophoresis, western blot, PCR, microarray,
  bulk RNA-seq, scRNA-seq droplet, ATAC-seq, ChIP-seq, proteomics, metabolomics,
  flow plot, imaging, lipid vesicle, exosome, small molecule, growth factor.
- Analyses: heatmap, UMAP/scatter, volcano, bar chart, line chart, box/violin,
  PCA, Venn, network, trajectory/pseudotime, pipeline box, database,
  laptop, cloud, neural net/ML, statistics (p-value), table.
- Composites: "iPSCs in a dish" (dish + colony), "cells in well plate",
  "sample → tube".

### Protocol timeline (`protocol/`)

Data model:

```ts
interface Protocol {
  title?: string; layout: 'classic' | 'strip';
  unit: 'day' | 'hour' | 'week'; pxPerUnit: number;
  stages: Stage[]; rows: MediaRow[]; showEcm?: string;
}
interface Stage { id; name; start; end; color; cellLabel?; cellIcon?;
                  cellColor?; markers?: string[]; media: string[] }
interface MediaRow { id; label; spans: { start; end; text; color }[] }
```

A pure layout function converts a `Protocol` into a list of primitive
drawing commands (lines, rects, texts, icon refs) with absolute positions;
it is unit-tested. A renderer turns those commands into a Fabric Group with
`data.protocol` attached. Double-click opens the Protocol Editor dialog
(stage table: name, days, media lines, colour, cell type, markers; rows;
layout and scale options). "Apply" re-renders the group in place, keeping
position. Templates pre-fill a 4-stage iPSC → podocyte protocol and a
mesendoderm strip.

### Export (`export/`)

- SVG: `canvas.toSVG()` cropped to the page; the page background optional.
- PNG: `toDataURL` at 1×/2×/4×, optional transparent background.
- PDF: vector via svg2pdf.js on the SVG export.
- PPTX: pptxgenjs, 16:9 slide, SVG added as image sized to fit; a note in
  the UI tells the user to right-click → Convert to Shape in PowerPoint.
- Project: JSON with `data` properties preserved (`toObject` with extras).
- Copy image to clipboard.

## Testing

Pure modules (protocol layout, library validity, colour substitution,
history stack, parametric generators, export helpers that do not need a DOM
canvas) are unit tested with Vitest. Canvas interactions are verified
manually in the browser (and a smoke run via Playwright screenshots).

## Out of scope for this version

Collaboration, cloud storage, importing arbitrary raster images as icons
(image insert is supported but not icon-ised), native PPTX shapes.
