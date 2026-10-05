# DiagramIt — working notes for Claude

Browser app (Vite + React 19 + TypeScript + Fabric.js 7) for publication-quality
lab/experimental-design figures. No backend. See README.md for the user-facing
feature list and docs/superpowers/ for the specs and plans that shaped it.

## Commands

```bash
npm run dev          # Vite on :5173 (pass --port N --strictPort if taken)
npm test             # vitest (unit tests; jsdom)
npm run build        # tsc -b && vite build  — must pass before committing
npx tsx scripts/icon-sheet.ts <category> <outDir>   # contact sheet of icons (macOS qlmanage)
```

## Architecture map

- `src/canvas/` — Fabric canvas wrapper (`FabricCanvas.tsx`), zustand store
  (`editorStore.ts`), tools, history (undo/redo snapshots), commands
  (duplicate/group/align/order), snapping guides (`guides.ts`), `fit.ts`.
- `src/draw/` — shared primitive drawing commands (`Cmd`), Fabric renderer
  (`render.ts`) and SVG previewer (`svg.ts`). Both smart objects emit `Cmd[]`.
- `src/protocol/` — differentiation timeline: `types.ts`, pure `layout.ts`,
  `templates.ts`, `render.ts`, `ProtocolEditor.tsx`.
- `src/ontogeny/` — developmental lineage graphs: `types.ts`, `validate.ts`,
  pure `layout.ts`, `render.ts`, `OntogenyEditor.tsx`, curated data in
  `graphs/*.ts` (registered in `graphs/index.ts`).
- `src/library/` — icon contract (`types.ts`), registry/search, colour tokens,
  Fabric insertion with recolouring (`insert.ts`), parametric generators,
  icon data in `items/<category>.ts`.
- `src/export/` — SVG, PNG, PDF (jsPDF + svg2pdf), PPTX (pptxgenjs), project JSON.
- `src/ui/` — panels, toolbar, dialogs. `src/app/App.tsx` wires everything.
- `src/templates/` — starter documents loaded by File ▸ New.

Smart objects (timeline, ontogeny) are Fabric Groups whose `data` carries the
full model (`data.protocol`, `data.ontogeny = { graph, view }`); double-click
re-opens the editor and `replace*Group` re-renders in place.

## Conventions

- Keep layout engines pure (no DOM, no Fabric) and unit-tested; put Fabric-only
  code in `render.ts`/`insert.ts`. Tests live beside code as `*.test.ts`.
- Every canvas object has `data: ObjectData` (`src/canvas/types.ts`), and it is
  included in all serialisation via `SERIALIZE_PROPS` in `canvas/commands.ts`.
- Fabric 7: default origin is `center`; always set `originX/originY: 'left'/'top'`
  on objects we position. Raster export must run with guides detached
  (`withoutGuides`). `fabric/extensions` needs the `westures` package.
- Icons: inline SVG strings, viewBox only, allowed elements listed in
  `src/library/types.ts`, recolourable regions use `#PRIMARY`/`#SECONDARY`.
  The registry test validates every icon; use the icon-sheet script to eyeball.
- Ontogeny graphs: rules in `src/ontogeny/graphs/README.md`; the graphs test
  validates structure. Curated content was authored by subagents from
  references listed in each file's `source`; treat biology edits carefully.
- Dev-only `window.__diagramit` exposes canvas/store/export for Playwright
  checks (used by the maintainer with the Playwright MCP). Autosave lives in
  `localStorage['diagramit.autosave.v1']`; clear it to get the fresh sample.
- Writing style in UI copy: British spelling (colour, centre), sentence case.

## Process expectations

- Before implementing a feature: brainstorm → spec in `docs/superpowers/specs/`
  → plan in `docs/superpowers/plans/` (superpowers skills). The owner prefers
  autonomous execution with decisions recorded in the spec.
- Before claiming done: `npm test`, `npm run build`, and a real-browser check of
  the touched UI (Playwright MCP) with a screenshot read back.
- Update `CHANGELOG.md` and bump `package.json` version with every user-visible
  change (policy at the top of CHANGELOG.md). Commit with a conventional
  message (`feat:`, `fix:`, `chore:`, `docs:`).
- Large, independent authoring (icon sets, curated graphs) is a good fit for
  parallel subagents; give them the contract file and the validation command.

## Known gaps / ideas (see CHANGELOG "Unreleased")

- Drosophila (and zebrafish, Arabidopsis) ontogenies not yet curated.
- Label collisions in dense ontogeny trees; a proper label-overlap pass would help.
- PowerPoint "Convert to Shape" on the exported SVG not verified in PowerPoint itself.
- PDF export not visually verified (no rasteriser installed on this machine).
