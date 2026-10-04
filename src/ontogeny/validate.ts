import type { Ontogeny } from './types'

/** Returns a list of structural problems with an ontogeny (empty = valid). */
export function validateOntogeny(g: Ontogeny): string[] {
  const problems: string[] = []
  const ids = new Set<string>()
  for (const n of g.nodes) {
    if (ids.has(n.id)) problems.push(`duplicate node id "${n.id}"`)
    ids.add(n.id)
    if (!n.label) problems.push(`node "${n.id}" has no label`)
  }
  const stageIds = new Set(g.stages.map((s) => s.id))
  const lineageIds = new Set(g.lineages.map((l) => l.id))
  const roots = g.nodes.filter((n) => n.parents.length === 0)
  if (roots.length !== 1) problems.push(`expected exactly one root, found ${roots.length} (${roots.map((r) => r.id).join(', ')})`)
  for (const n of g.nodes) {
    for (const p of n.parents) if (!ids.has(p)) problems.push(`node "${n.id}" references missing parent "${p}"`)
    if (n.stage && !stageIds.has(n.stage)) problems.push(`node "${n.id}" references missing stage "${n.stage}"`)
    if (n.lineage && !lineageIds.has(n.lineage)) problems.push(`node "${n.id}" references missing lineage "${n.lineage}"`)
  }
  for (const e of g.edges ?? []) {
    if (!ids.has(e.from)) problems.push(`edge references missing node "${e.from}"`)
    if (!ids.has(e.to)) problems.push(`edge references missing node "${e.to}"`)
  }
  // cycle check over primary + secondary parents
  const byId = new Map(g.nodes.map((n) => [n.id, n]))
  const state = new Map<string, 0 | 1 | 2>()
  const visit = (id: string): boolean => {
    const s = state.get(id)
    if (s === 1) return true
    if (s === 2) return false
    state.set(id, 1)
    for (const p of byId.get(id)?.parents ?? []) if (byId.has(p) && visit(p)) return true
    state.set(id, 2)
    return false
  }
  for (const n of g.nodes) if (visit(n.id)) { problems.push(`cycle detected through "${n.id}"`); break }
  // stage order sanity: a child's stage index should not precede its primary parent's
  const stageIndex = new Map(g.stages.map((s, i) => [s.id, i]))
  for (const n of g.nodes) {
    const p = n.parents[0] ? byId.get(n.parents[0]) : undefined
    if (p?.stage && n.stage && stageIndex.get(n.stage)! < stageIndex.get(p.stage)!) problems.push(`node "${n.id}" (stage ${n.stage}) precedes its parent "${p.id}" (stage ${p.stage})`)
  }
  return problems
}
