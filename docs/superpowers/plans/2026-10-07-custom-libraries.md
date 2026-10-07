# Custom libraries — implementation plan (2026-10-07)

Spec: `docs/superpowers/specs/2026-10-07-custom-libraries-design.md`.
Executed inline, test-first for pure modules, browser check at the end.
Release as 0.4.0.

1. **Types and normaliser** — `src/libraries/types.ts`, `src/libraries/normalize.ts`
   (+ test). Add `'custom'` to `Category`. `normalizeLibrary` validates
   manifest, entries, icons (relaxed whitelist), protocols, ontogenies.
2. **Custom SVG helpers** — `src/libraries/svg.ts` (+ test): `sanitizeCustomSvg`
   (whitelist, strip width/height, ensure viewBox, return errors), `slugify`,
   `entryId`.
3. **Store** — `src/libraries/store.ts` (+ test with in-memory storage):
   zustand store, persistence, upsert/remove library and entry, read-only
   guard for `sourceUrl`, `duplicateLibrary`, selectors `customIcons()`,
   `customProtocols()`, `customOntogenies()`, `librariesUsed(ids)`.
4. **Registry hook and acknowledgement** — registry `findItem`/`searchItems`
   consult `customIcons()`; `acknowledgement(version, libs)` (+ test update);
   About dialog "Loaded libraries".
5. **Capture** — `src/libraries/capture.ts`: `selectionToSvg(canvas)` using
   clones, normalised origin, group `toSVG()`.
6. **SaveEntryDialog** — `src/ui/SaveEntryDialog.tsx`: shared for icon /
   protocol / ontogeny; library picker with inline "New library"; preview.
   Wire: File menu item, properties-panel button, editor footers (editors
   pass their current model), `ObjectData.libraryId` on template-created groups.
7. **Library panel** — custom sections, empty-state section, template cards
   that open editors preloaded (store `dialog` gains optional `template`).
8. **Libraries dialog** — `src/ui/LibrariesDialog.tsx`: list, export, edit
   details, duplicate, remove, load file, load URL, import SVG, new library.
   File ▸ Libraries….
9. **URL loader** — `src/libraries/url.ts`: `loadLibrariesFromQuery(fetch)`
   (+ test with mocked fetch); called at boot in App with toasts.
10. **Example library and docs** — `public/libraries/example.diagramit-lib.json`,
    README "Custom libraries" section with the `?lib=` recipe, CHANGELOG 0.4.0,
    CLAUDE.md architecture map, `package.json` 0.4.0.
11. **Verify** — `npm test`, `npm run build`, Playwright pass per spec, commit,
    push, `scripts/release.sh`, check live site.
