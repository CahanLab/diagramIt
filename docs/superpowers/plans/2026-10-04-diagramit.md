# DiagramIt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A browser drawing app for publication-quality lab/experimental schematics with a scientific object library, standard drawing tools, a differentiation-protocol timeline builder, and SVG/PNG/PDF/PPTX/JSON export.

**Architecture:** React 19 + TypeScript (Vite) shell; Fabric.js 7 interactive canvas wrapped by a zustand editor store; pure (DOM-free) modules for the icon library, protocol layout engine, history, and export helpers so they can be unit-tested with Vitest; thin adapters that turn pure outputs into Fabric objects.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Fabric.js 7.4, zustand 5, pptxgenjs 4, jsPDF 4 + svg2pdf.js 2.8, lucide-react, Vitest 4 (jsdom).

**Spec:** `docs/superpowers/specs/2026-10-04-diagramit-design.md`

## Global Constraints

- Node >= 20; browsers Chrome 88+/Safari 13+/Firefox 85+ (Fabric 7 floor).
- Fabric 7 defaults `originX/originY` to `'center'`; all positioning code must set origin explicitly or use `setPositionByOrigin`.
- No external icon packs: every icon is an in-repo SVG string using the literal colours `#PRIMARY` and `#SECONDARY` for recolourable regions.
- Every canvas object carries `data: ObjectData` (see Task 2) and `data` is included in all serialisation (`toObject(['data'])`).
- Exports are cropped to the page rectangle; page default 1600 × 900 px, white.
- Tests: `npx vitest run` must pass; `npm run build` must type-check.

## Review Focus

1. Icon SVGs that fail to parse (unbalanced tags, unsupported elements) must not crash insertion: `insertLibraryItem` rejects with a readable error and the library test asserts every icon parses with the DOM parser (Task 3 test).
2. Protocol with zero stages or overlapping/unsorted stages must still lay out without NaN positions (Task 5 tests).
3. Loading a project JSON from an older/foreign version with unknown `data.kind` must still load as plain objects (Task 8 test on `normalizeProjectJson`).
4. Undo after a delete must restore the object with its `data` intact (Task 6 test on history stack round-trip of `data`).
5. SVG export must not include the selection controls or the off-page area, and must carry a `viewBox` equal to the page (Task 8 test on `cropSvgToPage`).

---

### Task 1: Project skeleton, test runner, app layout shell

**Files:**
- Modify: `package.json` (scripts: `test`, `test:watch`), `vite.config.ts` (vitest config), `index.html` (title)
- Create: `src/app/App.tsx`, `src/app/layout.css`, `src/main.tsx` (replace), `src/test/setup.ts`
- Delete: `src/App.css`, `src/assets/*`, `src/App.tsx` (default)

**Interfaces:**
- Produces: `App` renders a 3-column layout: `#library-panel`, `#canvas-area`, `#properties-panel`, with a `#topbar`.

- [ ] Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.
- [ ] `vite.config.ts`:
```ts
/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: ['src/test/setup.ts'], include: ['src/**/*.test.ts'] },
})
```
- [ ] Write `src/app/App.test.ts`? No — layout shell is verified by `npm run build`. Write the shell and run `npm run build`. Commit "chore: app shell + vitest".

### Task 2: Editor store + Fabric canvas wrapper

**Files:**
- Create: `src/canvas/types.ts`, `src/canvas/editorStore.ts`, `src/canvas/FabricCanvas.tsx`, `src/canvas/page.ts`, `src/canvas/page.test.ts`

**Interfaces:**
- Produces:
```ts
// types.ts
export type ObjectKind = 'shape' | 'text' | 'icon' | 'protocol' | 'connector' | 'image' | 'group'
export interface ObjectData { kind: ObjectKind; libraryId?: string; primaryColor?: string; secondaryColor?: string; protocol?: unknown; locked?: boolean }
export type ToolId = 'select' | 'pan' | 'text' | 'rect' | 'roundRect' | 'ellipse' | 'triangle' | 'diamond' | 'hexagon' | 'star' | 'line' | 'arrow' | 'elbowArrow' | 'pen'
export interface PageSpec { width: number; height: number; background: string }
// page.ts
export const DEFAULT_PAGE: PageSpec = { width: 1600, height: 900, background: '#ffffff' }
export function fitZoom(viewport: {w:number;h:number}, page: PageSpec, padding = 40): { zoom: number; panX: number; panY: number }
// editorStore.ts (zustand)
interface EditorState { canvas: Canvas | null; tool: ToolId; page: PageSpec; zoom: number; selection: FabricObject[]; dirty: boolean;
  setCanvas(c: Canvas|null): void; setTool(t: ToolId): void; setPage(p: PageSpec): void; setZoom(z:number): void; setSelection(o: FabricObject[]): void; markDirty(): void }
export const useEditor = create<EditorState>()
```
- `FabricCanvas.tsx`: mounts `<canvas>`, creates `new Canvas(el, { preserveObjectStacking: true, fireRightClick: true, stopContextMenu: true })`, sizes to its container with `ResizeObserver` (`setDimensions`), draws page as non-selectable `Rect` with `data.kind='page'` (excluded from selection/export via `excludeFromExport`? No: page background is exported optionally; mark it `selectable:false, evented:false, name:'page'`), wires `selection:created/updated/cleared` → `setSelection`, wheel zoom (ctrl/cmd + wheel → zoom to cursor; plain wheel → pan), space+drag pan, installs `new AligningGuidelines(canvas, { margin: 6, color: '#ff4081' })`.

- [ ] Test `fitZoom` (page 1600×900 in viewport 800×450 with padding 0 → zoom 0.5, pan centred). Run → fail → implement → pass → commit "feat: editor store and canvas wrapper".

### Task 3: Icon library format, registry, recolouring, and insertion

**Files:**
- Create: `src/library/types.ts`, `src/library/registry.ts`, `src/library/color.ts`, `src/library/color.test.ts`, `src/library/registry.test.ts`, `src/library/insert.ts`
- Create category modules (each exports `const items: LibraryItem[]`): `src/library/items/consumables.ts`, `tools.ts`, `instruments.ts`, `cells.ts`, `tissues.ts`, `species.ts`, `molbio.ts`, `analyses.ts`, `composites.ts`
- Create parametric generators: `src/library/generators/wellPlate.ts` (+test), `src/library/generators/cellCluster.ts` (+test), `src/library/generators/dish.ts`

**Interfaces:**
```ts
export type Category = 'consumables'|'tools'|'instruments'|'cells'|'tissues'|'species'|'molbio'|'analyses'|'composites'
export interface LibraryItem { id: string; name: string; category: Category; keywords: string[]; svg: string; width: number; height: number; primary: string; secondary?: string }
export const CATEGORY_LABELS: Record<Category,string>
export function allItems(): LibraryItem[]
export function findItem(id: string): LibraryItem | undefined
export function searchItems(q: string, category?: Category): LibraryItem[]
export function applyColors(svg: string, primary: string, secondary?: string): string // replaces #PRIMARY/#SECONDARY (case-insensitive)
export function wellPlateSvg(wells: 6|12|24|48|96|384, opts?: {fill?: string}): { svg: string; width: number; height: number }
export function cellClusterSvg(opts: { count: number; color: string; nucleus?: string; seed?: number }): { svg: string; width: number; height: number }
export async function insertLibraryItem(canvas: Canvas, item: LibraryItem, at: {x:number;y:number}, colors?: {primary?:string;secondary?:string}): Promise<Group>
export async function recolorIcon(obj: FabricObject, primary: string, secondary?: string): Promise<void> // walks group paths; objects tagged with data.role 'primary'/'secondary'
```
SVG contract for icon authors: root `<svg viewBox="0 0 W H">`, only `path/rect/circle/ellipse/line/polyline/polygon/g`, no `<text>`, no `<style>`, no `<use>`, no gradients, strokes use `stroke="#1f2937"` for outlines, recolourable regions use `fill="#PRIMARY"` / `fill="#SECONDARY"`.

Insertion tags each parsed object: if its fill (before substitution) equals `#PRIMARY` set `data.role='primary'`. Implementation: parse once with placeholders substituted by unique sentinel colours `#010101`/`#020202`, tag roles by matching those sentinels, then set final fills.

- [ ] Tests: `applyColors` substitutes both tokens case-insensitively; registry has unique ids; every item's svg parses with `DOMParser` with no `parsererror`, has a viewBox, contains no `<text>`; `wellPlateSvg(96)` yields 96 `<circle>`; `cellClusterSvg({count:7})` yields 7 cells and is deterministic for a seed. Commit "feat: icon library core".

### Task 4: Library panel UI + drag/click insert

**Files:**
- Create: `src/ui/LibraryPanel.tsx`, `src/ui/IconPreview.tsx`, `src/ui/panels.css`

Search box, category accordion, grid of previews (render `applyColors(item.svg, item.primary)` via `dangerouslySetInnerHTML` inside a fixed 56×56 box), click → insert at page centre, drag (HTML5 DnD with `dataTransfer.setData('application/x-diagramit-item', id)`) → drop on canvas inserts at scene point. Generators appear as items with a small dialog (wells count, cells count/colour). Commit.

### Task 5: Protocol timeline model + layout engine (pure)

**Files:**
- Create: `src/protocol/types.ts`, `src/protocol/layout.ts`, `src/protocol/layout.test.ts`, `src/protocol/templates.ts`

**Interfaces:**
```ts
export interface Stage { id: string; name: string; start: number; end: number; color: string; cellLabel?: string; cellIconId?: string; cellColor?: string; markers?: string[]; media: string[] }
export interface MediaSpan { start: number; end: number; text: string; color: string }
export interface MediaRow { id: string; label: string; spans: MediaSpan[] }
export interface Protocol { title?: string; layout: 'classic'|'strip'; unit: 'day'|'hour'|'week'; pxPerUnit: number; stages: Stage[]; rows: MediaRow[]; ecm?: string; fontFamily: string; fontSize: number; showCells: boolean; showMarkers: boolean }
export type Cmd =
 | { t:'line'; x1:number;y1:number;x2:number;y2:number; stroke:string; width:number; arrow?: boolean }
 | { t:'rect'; x:number;y:number;w:number;h:number; fill:string; stroke?:string; rx?:number }
 | { t:'text'; x:number;y:number; text:string; size:number; weight?:'bold'; align:'left'|'center'|'right'; baseline:'top'|'middle'; italic?: boolean; color?: string; maxWidth?: number }
 | { t:'icon'; x:number;y:number;w:number;h:number; iconId:string; color:string }
export interface Layout { width:number; height:number; cmds: Cmd[] }
export function layoutProtocol(p: Protocol): Layout
export function protocolExtent(p: Protocol): { min:number; max:number } // min(start), max(end); 0..1 if no stages
export const PODOCYTE_TEMPLATE: Protocol; export const MESENDODERM_STRIP_TEMPLATE: Protocol; export const BLANK_PROTOCOL: Protocol
```
Classic layout: axis at y=60 from x=margin to x=margin+(max-min)*pxPerUnit with arrowhead; tick + "Day N" label above at each stage start and at max; stage name centred between ticks above axis; cell icon (w=90) below tick with cellLabel above icon and markers below; media boxes row at y below markers, one box per stage spanning its [start,end], text lines centred; ECM row full width if `ecm`. Strip layout: day cells (one per unit, 44 px wide × 22 px) with "Day 0 | 1 | 2…" labels, then one row per `rows[]` with coloured spans and left-aligned text; stages drawn as a thin bar with names beneath.

- [ ] Tests: empty stages → finite layout, width>0; `protocolExtent`; classic has one `Day N` text per stage start plus final; media box x-extents match stage days×pxPerUnit; strip row count equals rows.length; every number in cmds is finite (walk all cmds). Commit "feat: protocol layout engine".

### Task 6: Protocol renderer (Fabric), editor dialog, history

**Files:**
- Create: `src/protocol/render.ts`, `src/protocol/ProtocolEditor.tsx`, `src/canvas/history.ts`, `src/canvas/history.test.ts`

**Interfaces:**
```ts
export async function renderProtocol(p: Protocol): Promise<Group> // group.data = { kind:'protocol', protocol: p }
export async function replaceProtocolGroup(canvas: Canvas, old: Group, p: Protocol): Promise<Group> // keeps left/top/scale/angle
// history.ts
export class History { constructor(limit = 100); push(snapshot: string): void; undo(current: string): string | null; redo(current: string): string | null; canUndo(): boolean; canRedo(): boolean }
```
History is bound in `FabricCanvas`: on `object:added|modified|removed` and text edits, debounce 300 ms, `push(JSON.stringify(canvas.toObject(['data','name','selectable','evented'])))`; undo loads via `loadFromJSON` then re-marks page rect non-selectable. `data.protocol` round-trips because `data` is included.

Dialog: stage table (name, start, end, colour, cell type label, cell icon select from cells category, cell colour, markers (one per line), media (one per line)), add/remove/reorder; rows editor for strip layout; options: layout, unit, pxPerUnit slider, fonts, toggles; Apply/Cancel; opened by double-clicking a protocol group or via "Insert ▸ Differentiation timeline" (template picker: Blank / iPSC→podocyte classic / mesendoderm strip).

- [ ] Tests: History push/undo/redo semantics; limit respected; undo returns previous snapshot and redo returns forward. Commit.

### Task 7: Drawing tools, properties panel, keyboard shortcuts, align/arrange

**Files:**
- Create: `src/canvas/tools.ts` (pointer handlers per ToolId: drag-to-create shapes, click to add text, pen via `PencilBrush`), `src/canvas/arrows.ts` (+test: `arrowPathD(x1,y1,x2,y2,headSize)` and `elbowPoints`), `src/canvas/arrange.ts` (+test for pure align math `alignBoxes(boxes, mode)`), `src/ui/Toolbar.tsx`, `src/ui/PropertiesPanel.tsx`, `src/ui/ColorInput.tsx`, `src/app/shortcuts.ts`

Shortcuts: V select, H pan, T text, R rect, O ellipse, L line, A arrow, P pen, Delete/Backspace delete, ⌘Z/⌘⇧Z undo/redo, ⌘D duplicate, ⌘G/⌘⇧G group/ungroup, ⌘C/⌘V copy/paste (Fabric `clone`), arrows nudge 1/10 px, ⌘]/⌘[ forward/back, ⌘A select all, Esc deselect, ⌘0 fit, ⌘+/- zoom.

Properties: fill, stroke, strokeWidth, strokeDashArray (solid/dashed/dotted), opacity, rx, font family/size/weight/style/align/line height, text, position/size/rotation, lock, icon primary/secondary colour (via `recolorIcon`), arrow head toggles, align buttons, distribute, order, flip. Commit.

### Task 8: Export (SVG/PNG/PDF/PPTX/clipboard) and project files

**Files:**
- Create: `src/export/svg.ts` (+test `cropSvgToPage`), `src/export/png.ts`, `src/export/pdf.ts`, `src/export/pptx.ts`, `src/export/project.ts` (+test `normalizeProjectJson`), `src/export/download.ts`, `src/ui/ExportDialog.tsx`, `src/ui/TopBar.tsx`

```ts
export function exportSvg(canvas: Canvas, page: PageSpec, opts: { background: boolean }): string // uses toSVG({ viewBox:{x:0,y:0,width,height}, width, height, suppressPreamble:false }); hides page rect when !background
export function cropSvgToPage(svg: string, page: PageSpec): string // ensures viewBox/width/height attrs (pure; test)
export function exportPngDataUrl(canvas: Canvas, page: PageSpec, opts: { scale: 1|2|3|4; transparent: boolean }): string
export async function exportPdf(svg: string, page: PageSpec): Promise<Blob>
export async function exportPptx(svg: string, pngDataUrl: string, page: PageSpec, title: string): Promise<Blob> // 16:9 slide, SVG image fitted, title in notes with "right-click → Convert to Shape"
export interface ProjectFile { app:'diagramit'; version: 1; page: PageSpec; canvas: unknown }
export function serializeProject(canvas: Canvas, page: PageSpec): string
export function normalizeProjectJson(raw: unknown): ProjectFile // throws on wrong app tag; fills defaults
export async function loadProject(canvas: Canvas, file: ProjectFile): Promise<void>
```
Autosave: debounce 1 s to `localStorage['diagramit.autosave']`; on load, offer restore. Commit.

### Task 9: Templates, sample document, polish and verification

- `src/templates/index.ts`: "iPSC differentiation (classic)", "iPSC differentiation (strip)", "Blank". New ▸ template.
- Default first-run document: podocyte classic timeline + "iPSCs in a dish" composite to show the headline use case.
- Playwright smoke: open app, insert a library item, insert protocol, export SVG; screenshot saved to scratchpad for visual check.
- `README.md`: how to run, shortcuts, export notes for PowerPoint.
- Run `npx vitest run`, `npm run build`, fix type errors. Commit.
