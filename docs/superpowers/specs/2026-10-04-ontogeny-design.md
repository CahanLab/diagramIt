# Developmental ontogenies — design spec (2026-10-04)

## Intent

Add a second "smart object" alongside the differentiation timeline: an
editable **developmental ontogeny** (lineage graph) with curated starting
graphs for mouse embryonic development, hematopoiesis, human embryonic
development and C. elegans embryogenesis (Drosophila and others later).

The user wants the same level of control the timeline modal gives: edit the
graph, choose which stages/nodes to show, emphasise particular trajectories,
change the appearance of elements, and switch the overall representation.
Reference styles: a rooted cell-type tree spanning time (Qiu et al. 2024,
Nature), a stage-by-stage trajectory map with columns per stage (Qiu et al.
2022, Nature Genetics), lineage trees with time axes (Zeng et al. 2023, Cell
Stem Cell), and "subway/metro map" trajectory plots (STREAM).

## Data model (`src/ontogeny/types.ts`)

`Ontogeny` = stages (ordered, optional numeric time) + lineages (colour) +
nodes (label, parents[], stage, lineage, markers, iconId, terminal) + optional
edge annotations (self-renewal loops, labels). `parents[0]` is the tree
parent; further parents are secondary edges (dashed). A rooted DAG.

`OntogenyView` = how to draw it: layout (`tree` | `staged`), orientation,
edge style (`curve` | `straight` | `orthogonal` | `metro`), node style
(`circle` | `pill` | `label` | `icon`), hidden/collapsed/emphasised node ids,
stage filter, fade opacity, toggles (stage axis, stage bands, markers,
legend), colour-by, spacing, node size, edge width, fonts, title.

The canvas Group carries `data.ontogeny = { graph, view }` so double-click
re-opens the editor with everything intact; the graph is copied into the
document, so edits never change the curated template.

## Layout engine (`src/ontogeny/layout.ts`, pure, tested)

1. **Visibility**: drop hidden nodes and their descendants; drop nodes
   whose stage is filtered out; collapse subtrees (collapsed node kept,
   descendants dropped, node annotated with "+N").
2. **Tree layout** (primary parents only): post-order leaf placement with
   `nodeGap` between leaves; each parent centred over its visible children;
   depth → level position (`levelGap`). Secondary edges drawn afterwards.
3. **Staged layout**: level position = stage index (or proportional to
   stage `time` when all stages have times and the user picks
   proportional); cross-position from the tree layout order so lineages
   stay together. Nodes without a stage inherit the parent's stage + 1.
4. **Orientation**: horizontal (root left, time → right) or vertical
   (root top).
5. **Emphasis**: when `emphasis` is non-empty, the union of root-paths to the
   emphasised nodes (and the nodes' subtrees? no: only the paths) is drawn
   at full opacity and width; everything else at `fadeOpacity`.
6. **Edges**: curve = cubic Bezier between level positions; straight;
   orthogonal = level-mid elbow; metro = octilinear (45° diagonal then
   straight) with thick lineage-coloured strokes, round joins, and
   white-filled "station" circles with coloured rings.
7. **Decorations**: stage axis (labels per stage at the level positions),
   optional alternating stage bands, lineage legend, title.

Output is the same `Cmd` list format as the protocol engine, extended with
`circle` and `path` commands, rendered by a shared Fabric renderer.

## Editor dialog (`src/ontogeny/OntogenyEditor.tsx`)

Three panes in one modal, mirroring the timeline editor:

- **Start from**: template cards (4 curated graphs + "Blank").
- **Graph tab**: searchable node tree (indented list) with per-node
  checkboxes for *visible*, *collapse*, *emphasise*; inline edit of label,
  stage, lineage, markers, terminal, icon; add child / delete node /
  re-parent (choose parent from a dropdown); stage list editor (label,
  time, add/remove/reorder); lineage list editor (label, colour).
- **Appearance tab**: layout, orientation, edge style, node style,
  colour-by, spacing sliders, node size, edge width, fade opacity, font,
  toggles, title.
- **Live preview**: an SVG rendering of the current layout inside the
  dialog (the pure layout is converted to SVG markup for preview) so the
  user sees changes before inserting.

Presets for quick emphasis: "Show only path to…" (pick a node → hides
everything not on its root path or subtree), "Show stages up to…".

## Integration

- Library card "Developmental ontogeny", toolbar button, Insert menu item.
- Properties panel shows "Edit ontogeny…" for ontogeny groups; double-click
  opens the editor.
- Templates menu gains "Hematopoiesis tree" and "Mouse development map".
- Exports unchanged (vector groups).

## Testing

Pure layout tests: visibility pruning, collapse counts, tree positions
(parents centred, leaves spaced), staged x positions follow stage order,
emphasis path computation, finite geometry for all four curated graphs in
all layout/edge-style combinations, metro path octilinearity. Graph tests:
structural validity of all curated graphs.
