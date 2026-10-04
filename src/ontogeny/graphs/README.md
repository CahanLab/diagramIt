Curated developmental ontogenies. Each module exports `export const graph: Ontogeny`
(type from `../types`). Validate with `npx vitest run src/ontogeny`.
Rules: unique node ids (kebab-case); every non-root node lists at least one existing
parent; exactly one root (node with no parents); no cycles; every `stage` and
`lineage` referenced must exist; stages listed in temporal order.
