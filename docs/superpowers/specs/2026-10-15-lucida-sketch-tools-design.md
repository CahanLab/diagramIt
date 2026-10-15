# Camera lucida sketch tools — design spec (2026-10-15)

Owner's request (2026-10-15), after the generated limb tissue overlays were
withdrawn in 0.11.0: "design and add 'lucida camera' style drawing tools that
allow user to sketch in features on top of the baseline limb (or embryo)
icons. paint brush of selectable width, dot density, and dot style.
pencil/pen freehand lines, segmented lines that can be post-draw smoothened.
eraser, and ability to select individual elements and copy, paste, delete,
etc." Autonomous execution with decisions recorded here, per the project's
process expectations.

## Intent

A user places a baseline icon (an embryo or limb outline, usually in the
camera lucida style) and draws the tissues or annotations over it by hand in
the same idiom: thin ink lines, stipple whose density carries tone, hatching.
Every mark is an ordinary canvas object afterwards: it can be selected,
moved, scaled, copied, pasted, deleted, grouped with the icon, exported.

## Tools

Four tools in a new "Sketch" toolbar group (the existing freehand pen moves
into it), with single-key shortcuts that do not collide with the existing
ones (V H T R U O L A E P):

| Tool | `ToolId` | Key | Icon (lucide) | Produces |
|---|---|---|---|---|
| Ink pen | `pen` | P | PenLine | one freehand stroke |
| Stipple brush | `stipple` | B | Paintbrush | one cloud of dots |
| Segmented line | `polyline` | N | Spline | one polyline, smoothable |
| Eraser | `eraser` | X | Eraser | edits existing paths |

Tool settings live in the editor store (`sketch`), persist in
`localStorage['diagramit.sketch.v1']`, and show in the Properties panel
whenever a sketch tool is active and nothing is selected:

| Setting | Default | Range |
|---|---|---|
| Ink colour | `#1f2937` (the icon outline ink) | any |
| Pen width (px) | 1.2 | 0.3 to 12 |
| Pen smoothing | 1 | 0 to 1 |
| Brush radius (px) | 12 | 2 to 80 |
| Dot density (dots per 100 px² swept) | 4 | 0.5 to 20 |
| Dot size (px) | 1.6 | 0.4 to 8 |
| Dot style | dot | dot, ring, tick |
| Eraser radius (px) | 10 | 2 to 80 |

Widths are canvas pixels at 100 % zoom; sketch strokes scale with the
object (no `strokeUniform`), so a sketch grouped with an icon stays in
proportion when the group is resized.

## Sketch objects

A sketch is a Fabric `Path` whose `data` is
`{ kind: 'sketch', sketch: SketchData }`:

```ts
type DotStyle = 'dot' | 'ring' | 'tick'
type SketchData =
  | { tool: 'pen' | 'polyline'; runs: Pt[][]; smooth: number }
  | { tool: 'stipple'; dots: [x: number, y: number, size: number, angle: number][]; style: DotStyle; size: number }
```

Points are in the path's own coordinate space (scene coordinates at the time
of drawing); Fabric's `pathOffset` and the object transform take care of
later moves and scaling. Path data is derived from the sketch data by pure
functions in `src/canvas/sketch.ts`:

- runs: straight segments when `smooth` is 0, a Catmull-Rom spline whose
  handle length is scaled by `smooth` otherwise (so 0.5 is a half-way
  rounding of the corners); one subpath per run.
- dots: a filled disc of diameter `size` (dot); a circle of radius 0.5·size
  drawn with a 0.3·size stroke (ring); a segment of length 2.5·size through
  the dot at `angle` with a 0.45·size stroke (tick). One `<path>` per cloud;
  the cloud's `size` is the setting the dots were scattered with, so the
  properties panel can show and change it.

Re-rendering after a smoothing change or an erase goes through
`setPathInPlace` in `src/canvas/brushes.ts`: it calls `Path._setPath(d)`
without Fabric's own position adjustment and re-derives the centre from the
change in `pathOffset` through the object's own matrix. Fabric's
`_setPath(d, true)` assumes path coordinates are parent coordinates, which
stops being true once a path has been moved or lives inside a group, so it
shifted moved sketches and icon children.

## Interaction

- **Ink pen**: Fabric's `PencilBrush` subclassed (`InkBrush`) so that the
  finished stroke is a sketch object built from the decimated points (one
  run, `smooth` from the settings) instead of Fabric's quadratic path. Shift
  while drawing gives a straight line (Fabric behaviour).
- **Stipple brush**: a `BaseBrush` subclass. Mouse down stamps
  `max(1, round(density/100 · π r² / 2))` dots; each move sweeps an area
  `2 r · Δs` and emits `density/100` dots per px² of it (fractional
  expectation carried over). Dots fall uniformly in the disc, sizes jitter
  ±25 %, tick angles follow the direction of travel ±20°. Dots are drawn
  live on the top context; mouse up creates one sketch object. The random
  source is seeded per stroke so a stroke is deterministic for tests.
- **Segmented line**: click adds a vertex, the pointer rubber-bands the next
  segment, Shift snaps it to 45°, double-click or Enter finishes (the
  double-click's second vertex is discarded), Escape cancels. A line needs
  two vertices. Its `smooth` starts at 0.
- **Smoothing after drawing**: the Properties panel shows "Smoothing" (0 to
  1) for pen and polyline sketches. Because the vertices are kept, smoothing
  is reversible.
- **Eraser**: drag with a circle cursor drawn on the top context. Samples
  every `radius/2` px along the drag call `eraseAt(canvas, point, radius)`,
  which visits every `Path` on the canvas, including children of groups
  (icons, and icon parts after Ungroup). The circle is mapped into the
  path's coordinate space with the inverse of `calcTransformMatrix()`
  (radius divided by the mean scale). For sketch objects the run points or
  dots inside the circle are removed; runs split where points went, runs
  shorter than two points are dropped, and an emptied object is removed
  from the canvas. For other paths the command list is flattened per
  subpath (M L C Q Z; curves sampled at 8 steps), points inside are
  removed and the remaining runs re-emitted as M/L commands (a closed
  subpath that loses points becomes open runs). Fill-only shapes are left
  alone. One `object:modified` fires at the end of a drag, so one undo step
  reverts the whole stroke of erasing.
- **Select, copy, paste, delete**: unchanged (⌘C ⌘V ⌘X ⌘D ⌫, Select tool).
  Sketch objects behave like any shape. To reach the parts of a baseline
  icon, Ungroup (⌘⇧G) converts it to plain paths (existing, confirmed).
- Switching tools cancels an unfinished polyline; Escape also returns to
  the Select tool (existing behaviour).

## Properties panel for a selected sketch

Ink colour; Width (pen, polyline) or Dot size and Dot style (stipple);
Smoothing (pen, polyline); then the usual Geometry section. The Fill and
Line style rows of plain shapes are not shown for sketches.

## Export

Sketches are plain paths and export through the existing SVG, PNG, PDF and
PPTX paths. Saving a sketch together with an icon as a custom library item
works through the existing "Save as library item" (the sanitiser accepts
paths).

## Tests

- `sketch.test.ts`: path data for runs at smoothing 0, 0.5 and 1; dot
  styles; stipple dot generation with a fixed seed (count within the
  expected range, all inside the disc, tick angles near the travel
  direction); erasing runs (split, drop, empty) and dots; flattening and
  re-emitting Fabric path commands with a circle removed.
- Store: `sketch` settings round-trip through localStorage.
- Shortcuts: B, N, X map to the tools.

## Out of scope

- Pressure or tilt sensitivity; vertex handles for editing a polyline after
  drawing; erasing filled shapes or text; a lasso selection; hatching as a
  fill pattern (hatching is drawn with the pen or the tick dot style).

## Status (2026-10-15)

Shipped in 0.12.0 (commit 6eb390e); plan
`docs/superpowers/plans/2026-10-15-lucida-sketch-tools.md`. Decisions made
while implementing:

- `setPathInPlace` replaces the `_setPath(d, true)` the design assumed (see
  "Sketch objects").
- Fabric brushes receive mouse events, not pointer events, and a double-click
  needs `detail: 2`; the Playwright check dispatches `MouseEvent`s on
  `canvas.upperCanvasEl`.
- Stipple dots are filled discs rather than zero-length strokes, so the dot
  style can be switched in the properties panel without touching the stroke
  width; the cloud keeps its `size`.
- The eraser culls by bounding box, maps the circle into path space and
  treats every stroked `Path` the same way, so it also edits the children of
  icon groups without ungrouping. A curved icon line that is erased loses
  its curves on the touched subpath (eight samples per curve), which shows
  on a close zoom.

Known gaps, also listed in CLAUDE.md: no vertex editing for polylines, fills
and text are not erased, touched icon curves are flattened.
