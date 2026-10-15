# Camera Lucida Sketch Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ink pen, stipple brush, segmented line (smoothable afterwards) and eraser tools whose marks are ordinary, editable canvas objects.

**Architecture:** Pure geometry in `src/canvas/sketch.ts` (path data from sketch data, dot generation, erasing); Fabric brushes in `src/canvas/brushes.ts`; tool interaction (polyline, eraser drag) in `src/canvas/tools.ts`; settings in the editor store; UI in Toolbar and PropertiesPanel.

**Tech Stack:** TypeScript, Fabric.js 7 (`PencilBrush`, `BaseBrush`, `Path._setPath`, `util.invertTransform`), zustand, React, vitest.

**Spec:** `docs/superpowers/specs/2026-10-15-lucida-sketch-tools-design.md`

## Global Constraints

- Every canvas object carries `data: ObjectData`; sketches use `kind: 'sketch'`.
- Pure modules (`sketch.ts`) import nothing from Fabric; Fabric-only code lives in `brushes.ts`, `eraser.ts`, `tools.ts`.
- UI copy in British spelling, sentence case.
- `npm test` and `npm run build` pass; browser check with Playwright before claiming done.

## Review Focus

1. Erasing an icon child must keep the group's position: `_setPath(d, true)` and a group `dirty` flag; verify in the browser that an erased lucida icon does not jump.
2. A polyline finished by double-click must not end with a duplicate vertex.
3. A stipple stroke with zero movement still creates a visible cloud (the stamp on mouse down).
4. Smoothing 0 on a pen stroke must give straight segments through the decimated points, not an empty path.
5. Switching tools or pressing Escape mid-polyline must leave no draft object on the canvas.

---

### Task 1: Types and settings

**Files:** Modify `src/canvas/types.ts`, `src/canvas/editorStore.ts`; test `src/canvas/editorStore.test.ts` (new).

- [ ] Add `'stipple' | 'polyline' | 'eraser'` to `ToolId`; add `'sketch'` to `ObjectKind`; add `sketch?: SketchData` to `ObjectData` (type from `sketch.ts`).
- [ ] Add `SketchSettings` (ink, penWidth, penSmooth, brushRadius, dotDensity, dotSize, dotStyle, eraserRadius) with defaults, `sketch` state, `setSketch(partial)` persisting to `diagramit.sketch.v1`.
- [ ] Test: `setSketch({ penWidth: 3 })` persists and reloads (mock localStorage via jsdom).

### Task 2: Pure sketch geometry

**Files:** Create `src/canvas/sketch.ts`, `src/canvas/sketch.test.ts`.

- [ ] `sketchPathD(sketch)`; `runsPathD(runs, smooth)`; `dotsPathD(dots, style)`.
- [ ] `scatterDots(rng, centre, radius, n, size, angle)`; `sweepCount(density, radius, distance, carry)`; `mulberry32`.
- [ ] `eraseRuns(runs, c, r)` → runs; `eraseDots(dots, c, r)`.
- [ ] `flattenCommands(path: SimplePathCommand[])` → `{ points, closed }[]`; `commandsFromRuns(runs)` → M/L command list; `eraseCommands(path, c, r)`.
- [ ] Tests as listed in the spec.

### Task 3: Brushes

**Files:** Create `src/canvas/brushes.ts`.

- [ ] `makeSketchPath(sketch, style)`: a `Path` with `data`, stroke, width, caps, `fill: ''`.
- [ ] `InkBrush extends PencilBrush`: `_finalizeAndAddPath` override building a sketch path from `this._points` (decimated), firing `path:created`.
- [ ] `StippleBrush extends BaseBrush`: settings, live drawing on `contextTop` with `_saveAndTransform`, one sketch path on mouse up.

### Task 4: Eraser

**Files:** Create `src/canvas/eraser.ts`.

- [ ] `eraseAt(canvas, point, radius)`: walk `canvas.getObjects()` recursively into groups; for each `Path`, map the circle into path space (`util.invertTransform(obj.calcTransformMatrix())`, radius / mean scale); sketch → `eraseRuns`/`eraseDots` and rebuild; other paths → `eraseCommands`; `_setPath(d, true)`; remove emptied objects (from the canvas or their group); mark groups dirty. Returns whether anything changed.

### Task 5: Tool interaction

**Files:** Modify `src/canvas/tools.ts`.

- [ ] `applyMode`: drawing mode for `pen` and `stipple` with the brush configured from `useEditor.getState().sketch`; crosshair for polyline and eraser.
- [ ] Polyline: vertices, rubber band draft (`Path`, non-selectable), Shift 45°, dblclick/Enter finish, Escape cancel, `setTool` cancels.
- [ ] Eraser: on down/move sample points every radius/2 and call `eraseAt`; draw the cursor circle on `contextTop`; on up fire `object:modified` if anything changed.

### Task 6: Toolbar, shortcuts, properties

**Files:** Modify `src/ui/Toolbar.tsx`, `src/app/shortcuts.ts`, `src/ui/PropertiesPanel.tsx`, `src/app/layout.css`.

- [ ] Toolbar: move `pen` into a new Sketch group with stipple, polyline, eraser.
- [ ] Shortcuts: `b`, `n`, `x`.
- [ ] Properties: tool settings section when a sketch tool is active and nothing is selected; sketch object section (ink, width or dot size/style, smoothing) replacing the plain-shape rows.

### Task 7: Docs, tests, release

- [ ] CHANGELOG 0.12.0, package.json, CLAUDE.md architecture map, README feature list.
- [ ] `npm test`, `npm run build`, Playwright check: draw with each tool over a lucida limb, smooth a polyline, erase part of a stroke and part of the icon, copy/paste a sketch; screenshot.
- [ ] Commit, push, release.
