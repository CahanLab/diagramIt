# Custom libraries — design spec (2026-10-07)

## Intent

Let a user make their own icons, timeline templates and ontogeny graphs,
bundle them into a named library that carries the author's name, share that
library as a file or a URL, and let anyone load it with one action. The author
is credited wherever the library appears and in the acknowledgement text of
figures that use it. No backend: everything is files, URLs and browser storage.

Decisions confirmed by the owner on 2026-10-07:

- Custom icons do **not** get primary/secondary recolouring in this version.
  They recolour shape by shape through the properties panel. An imported SVG
  that uses the `#PRIMARY`/`#SECONDARY` sentinels still recolours, because the
  existing insert pipeline handles those colours; this is an undocumented
  power-user path, not a feature.
- No in-app "community libraries" list. Sharing is file and URL only. The
  file format and URL loader are designed so a curated list can be added later
  without changing either.

## Library file (`*.diagramit-lib.json`)

```ts
interface LibraryManifest {
  id: string            // kebab-case, globally unique by convention: "cahanlab-kidney"
  name: string          // "Cahan Lab kidney icons"
  version: string       // free text, "1.0"
  author: string        // "Patrick Cahan"
  affiliation?: string  // "Cahan Lab, Johns Hopkins University"
  url?: string          // lab or project page
  license?: string      // "CC BY 4.0"
  acknowledgement?: string // overrides the generated "using the X library by Y"
  description?: string
  createdAt: string     // ISO date
}

type LibraryEntry =
  | { kind: 'icon'; item: LibraryItem }            // item.category = 'custom'
  | { kind: 'protocol'; id: string; name: string; description?: string; protocol: Protocol }
  | { kind: 'ontogeny'; graph: Ontogeny }          // graph.id / graph.name are the entry id/name

interface CustomLibrary {
  app: 'diagramit-library'
  version: 1
  manifest: LibraryManifest
  entries: LibraryEntry[]
  /** Set when loaded from a URL; such libraries are read-only in the app. */
  sourceUrl?: string
}
```

Entry ids are namespaced `<manifest.id>.<slug>` so they never collide with
built-in ids (which are `<category>.<slug>`) or with other libraries.
`LibraryItem.category` gains the value `'custom'`; it is not in
`CATEGORY_ORDER`, so the built-in panel sections are unchanged.

`normalizeLibrary(raw: unknown): CustomLibrary` (pure, tested) accepts a parsed
JSON value and throws a readable error naming the first problem. It checks the
`app` tag and `version`, required manifest fields, entry kinds, icon SVG
(relaxed whitelist, see below), protocol shape (stages array with numeric
start/end) and ontogeny structure via the existing `validateOntogeny`.

## Custom icon SVG

Custom icons are SVG strings like built-ins, so preview, drag-drop, insert
and export reuse the existing code. The element whitelist for custom icons is
the built-in list plus `text` and `tspan` (people label their drawings).
`script`, `image`, `foreignObject`, `style`, `use` and event attributes are
rejected with a message. `width`/`height` attributes are stripped; a `viewBox`
is required (added from `width`/`height` when absent).

Three ways to make one:

1. **Save selection as item** (File ▸ "Save selection as library item…", and
   a button in the properties panel when something is selected). The selected
   objects are cloned, translated so their bounding box starts at (0,0),
   wrapped in a temporary Fabric group, and serialised with `toSVG()` inside
   `<svg viewBox="0 0 w h">`. Lives in `src/libraries/capture.ts` (Fabric-only,
   browser-verified, not unit-tested).
2. **Import an SVG file** from the Libraries dialog.
3. **Save a timeline or ontogeny as a template** from a button in each
   editor's footer. These are `protocol`/`ontogeny` entries, not icons.

All three open the same `SaveEntryDialog`: name, keywords (icons only),
target library (existing editable library, or "New library" with name and
author inline), preview. Saving an entry whose id already exists in that
library replaces it after confirmation.

## Storage and registry

`src/libraries/store.ts` is a zustand store `useLibraries` holding
`libraries: CustomLibrary[]`, persisted to `localStorage['diagramit.libraries.v1']`
on every change (storage injectable for tests). Actions: `upsertLibrary`,
`removeLibrary`, `upsertEntry`, `removeEntry`, `updateManifest`. A library
with `sourceUrl` refuses entry edits; "Duplicate as editable copy" makes a
local copy with a new id.

`src/library/registry.ts` keeps `allItems()` built-in only (the registry test
validates built-ins). `findItem` and `searchItems` also consult custom icon
entries through a getter the libraries store registers, so drag-drop,
protocol `cellIconId` and search work unchanged for custom icons.

Project files are already self-contained (icons are expanded to objects at
insert time; timelines and ontogenies carry their model), so a figure made
with a custom library opens correctly for someone who does not have it.

`ObjectData.libraryId` is set on inserted custom icons (already) and on
timeline/ontogeny groups created from a custom template (new), so the
document can report which libraries it uses.

## UI

- **Library panel**: after the three special buttons and before the built-in
  categories, one collapsible section per loaded library. Header shows the
  name, "by {author}", and the entry count. Icon entries render in the normal
  grid. Protocol and ontogeny entries render as small cards that open the
  matching editor preloaded with that template. When no libraries are loaded,
  a single "Custom libraries" section explains the three ways to make one and
  links to the Libraries dialog.
- **Libraries dialog** (File ▸ "Libraries…"): table of loaded libraries with
  manifest details and credit; per library: Export file, Edit details (not for
  URL libraries), Duplicate as editable copy, Remove. Global: Load file…,
  Load from URL…, Import SVG as icon…, New library….
- **Editors**: template lists show custom entries after the built-ins,
  labelled "{name} · {library name}". Footer gains "Save as template…".
- **Help ▸ About**: a "Loaded libraries" list with author credit, shown only
  when at least one library is loaded.
- **Acknowledgement**: `acknowledgement(version, librariesUsed)` appends
  ", using the {name} library by {author}" for each library whose entries
  appear in the current document (by `ObjectData.libraryId` prefix). A
  manifest `acknowledgement` string replaces the generated clause for that
  library.

## Sharing

- **File**: Export writes `<manifest.id>.diagramit-lib.json`. Loading a file
  with an id already present replaces that library after confirmation.
- **URL**: the app reads every `lib` query parameter on boot
  (`?lib=https://…/x.diagramit-lib.json&lib=…`), fetches, normalises and
  upserts each with `sourceUrl` set, then shows a toast crediting the author.
  URL libraries are refreshed on every load, which is why they are read-only.
  The URL stays in the address bar so it can be bookmarked. Fetch failures
  (network, CORS, invalid file) show a toast and never block the app.
  `raw.githubusercontent.com` and GitHub Pages both send permissive CORS
  headers, so "put the file in a public repo" is the documented recipe.
- **Example**: `public/libraries/example.diagramit-lib.json` ships with two
  icons and one timeline template so the README can show a working
  `?lib=` link and the URL loader has a permanent test target.

## Out of scope

Primary/secondary tagging for custom icons; a community index; editing an
icon's SVG in place (edit on the canvas and re-save instead); library
versioning beyond the free-text `version` field; cloud sync.

## Testing

Pure, unit-tested: `normalizeLibrary`, custom SVG sanitising/wrapping, the
store (with an in-memory storage), registry lookup of custom icons, and the
acknowledgement text. Browser-verified with Playwright: save selection as
item, insert it, export a library, reload it, load the example via `?lib=`,
save a timeline template and start a timeline from it.
