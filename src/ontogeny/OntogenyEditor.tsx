import { Group } from 'fabric'
import { ChevronDown, ChevronRight, CircleOff, Eye, EyeOff, Focus, FoldVertical, Plus, Trash2, ZoomIn, ZoomOut } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { placeFitted } from '../canvas/fit'
import { useEditor } from '../canvas/editorStore'
import { layoutToSvg } from '../draw/svg'
import { itemsInCategory } from '../library/registry'
import { ColorInput } from '../ui/ColorInput'
import { ONTOGENIES } from './graphs'
import { childrenMap, descendants, layoutOntogeny, rootOf, rootPath } from './layout'
import { ontogenyOf, renderOntogeny, replaceOntogenyGroup } from './render'
import { DEFAULT_VIEW, type EdgeStyleOverride, type NodeStyleOverride, type Ontogeny, type OntogenyDocument, type OntogenyNode, type OntogenyView } from './types'

const BLANK: Ontogeny = {
  id: 'custom', name: 'Custom ontogeny', organism: '',
  stages: [{ id: 's0', label: 'Stage 0', time: 0 }, { id: 's1', label: 'Stage 1', time: 1 }, { id: 's2', label: 'Stage 2', time: 2 }],
  lineages: [{ id: 'l1', label: 'Lineage A', color: '#1f77b4' }, { id: 'l2', label: 'Lineage B', color: '#d62728' }],
  nodes: [
    { id: 'root', label: 'Stem cell', parents: [], stage: 's0' },
    { id: 'a', label: 'Progenitor A', parents: ['root'], stage: 's1', lineage: 'l1' },
    { id: 'a1', label: 'Cell type A1', parents: ['a'], stage: 's2', terminal: true },
    { id: 'a2', label: 'Cell type A2', parents: ['a'], stage: 's2', terminal: true },
    { id: 'b', label: 'Progenitor B', parents: ['root'], stage: 's1', lineage: 'l2' },
    { id: 'b1', label: 'Cell type B1', parents: ['b'], stage: 's2', terminal: true },
  ],
}

let uid = 0
const newId = (p: string) => `${p}-${Date.now().toString(36)}${(uid++).toString(36)}`

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

export function OntogenyEditor({ target, onClose }: { target?: Group; onClose: () => void }) {
  const canvas = useEditor((s) => s.canvas)
  const existing = target ? ontogenyOf(target) : undefined
  const [doc, setDoc] = useState<OntogenyDocument>(() => {
    const d: OntogenyDocument = structuredClone(existing ?? { graph: ONTOGENIES[1] ?? BLANK, view: { ...DEFAULT_VIEW, layout: 'tree' as const } })
    d.view = { ...DEFAULT_VIEW, ...d.view, hiddenSelf: d.view.hiddenSelf ?? [], nodeStyles: d.view.nodeStyles ?? {}, edgeStyles: d.view.edgeStyles ?? {} }
    return d
  })
  const [tab, setTab] = useState<'graph' | 'appearance'>('graph')
  const [showTemplates, setShowTemplates] = useState(!existing)
  const [selected, setSelected] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState(false)
  const [zoom, setZoom] = useState<number | 'fit'>('fit')
  const { graph, view } = doc

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const setGraph = (patch: Partial<Ontogeny> | ((g: Ontogeny) => Ontogeny)) =>
    setDoc((d) => ({ ...d, graph: typeof patch === 'function' ? patch(d.graph) : { ...d.graph, ...patch } }))
  const setView = (patch: Partial<OntogenyView>) => setDoc((d) => ({ ...d, view: { ...d.view, ...patch } }))
  const updateNode = (id: string, patch: Partial<OntogenyNode>) => setGraph((g) => ({ ...g, nodes: g.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)) }))

  const preview = useMemo(() => {
    try {
      const L = layoutOntogeny(graph, view)
      return { svg: layoutToSvg(L, view.fontFamily), w: L.width, h: L.height, n: L.nodes.length }
    } catch (e) {
      return { svg: '', w: 0, h: 0, n: 0, error: (e as Error).message }
    }
  }, [graph, view])

  const ch = useMemo(() => childrenMap(graph.nodes), [graph])
  const root = useMemo(() => rootOf(graph.nodes), [graph])
  const byId = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph])
  const cellIcons = useMemo(() => [...itemsInCategory('cells'), ...itemsInCategory('tissues'), ...itemsInCategory('composites')], [])

  const addChild = (parentId: string) => {
    const parent = byId.get(parentId)
    const id = newId('node')
    const stageIdx = parent?.stage ? graph.stages.findIndex((s) => s.id === parent.stage) : -1
    const stage = graph.stages[Math.min(graph.stages.length - 1, stageIdx + 1)]?.id
    setGraph((g) => ({ ...g, nodes: [...g.nodes, { id, label: 'New cell type', parents: [parentId], stage }] }))
    setExpanded((e) => ({ ...e, [parentId]: true }))
    setSelected(id)
  }
  const removeSubtree = (id: string) => {
    const kill = new Set([id, ...descendants(graph.nodes, id)])
    setGraph((g) => ({ ...g, nodes: g.nodes.filter((n) => !kill.has(n.id)).map((n) => ({ ...n, parents: n.parents.filter((p) => !kill.has(p)) })) }))
    if (selected && kill.has(selected)) setSelected(null)
  }
  /** Remove one node; its children are re-attached to its primary parent. */
  const removeNodeOnly = (id: string) => {
    const node = byId.get(id)
    if (!node) return
    const parent = node.parents[0]
    setGraph((g) => ({
      ...g,
      nodes: g.nodes.filter((n) => n.id !== id).map((n) => {
        if (!n.parents.includes(id)) return n
        const parents = n.parents.map((p) => (p === id ? parent : p)).filter((p): p is string => !!p && p !== n.id)
        return { ...n, parents: Array.from(new Set(parents)) }
      }),
    }))
    if (selected === id) setSelected(null)
  }
  const setNodeStyle = (id: string, patch: Partial<NodeStyleOverride>) => setView({ nodeStyles: { ...(view.nodeStyles ?? {}), [id]: { ...(view.nodeStyles?.[id] ?? {}), ...patch } } })
  const setEdgeStyle = (key: string, patch: Partial<EdgeStyleOverride>) => setView({ edgeStyles: { ...(view.edgeStyles ?? {}), [key]: { ...(view.edgeStyles?.[key] ?? {}), ...patch } } })
  const stageRange = (fromIdx: number, toIdx: number) => {
    const ids = graph.stages.slice(Math.min(fromIdx, toIdx), Math.max(fromIdx, toIdx) + 1).map((s) => s.id)
    setView({ stages: ids.length === graph.stages.length ? [] : ids })
  }
  const activeStageIdx = () => {
    const all = graph.stages.map((s) => s.id)
    const cur = view.stages.length ? view.stages : all
    const idxs = cur.map((id) => all.indexOf(id)).filter((i) => i >= 0)
    return { from: Math.min(...idxs), to: Math.max(...idxs) }
  }
  const focusOn = (id: string) => {
    // Show only the root path and the subtree of this node.
    const keep = new Set([...rootPath(graph, id), ...descendants(graph.nodes, id)])
    const hidden = graph.nodes.filter((n) => !keep.has(n.id)).map((n) => n.id)
    // hiding ancestors' siblings is enough: compute minimal hidden set (nodes whose parent is kept but who are not kept)
    const minimal = hidden.filter((h) => { const p = byId.get(h)?.parents[0]; return !p || keep.has(p) })
    setView({ hidden: minimal, collapsed: [] })
  }

  const apply = async () => {
    if (!canvas) return
    setBusy(true)
    try {
      if (target && existing) await replaceOntogenyGroup(canvas, target, doc)
      else {
        const g = await renderOntogeny(doc)
        placeFitted(canvas, g, useEditor.getState().page)
        canvas.add(g)
        canvas.setActiveObject(g)
        canvas.requestRenderAll()
      }
      onClose()
    } finally {
      setBusy(false)
    }
  }

  const matches = (n: OntogenyNode) => !query || n.label.toLowerCase().includes(query.toLowerCase()) || (n.markers ?? '').toLowerCase().includes(query.toLowerCase())

  const renderTree = (n: OntogenyNode, depth: number): React.ReactNode => {
    const kids = ch.get(n.id) ?? []
    const isOpen = query ? true : (expanded[n.id] ?? depth < 2)
    const hidden = view.hidden.includes(n.id)
    const hiddenSelf = (view.hiddenSelf ?? []).includes(n.id)
    const collapsed = view.collapsed.includes(n.id)
    const emph = view.emphasis.includes(n.id)
    const visibleSelf = matches(n) || [...descendants(graph.nodes, n.id)].some((d) => matches(byId.get(d)!))
    if (!visibleSelf) return null
    const color = graph.lineages.find((l) => l.id === n.lineage)?.color
    return (
      <div key={n.id}>
        <div className={`onto-row${selected === n.id ? ' selected' : ''}${hidden || hiddenSelf ? ' hidden-node' : ''}`} style={{ paddingLeft: 6 + depth * 14 }} onClick={() => setSelected(n.id)}>
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setExpanded((x) => ({ ...x, [n.id]: !isOpen })) }} style={{ visibility: kids.length ? 'visible' : 'hidden' }}>
            {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
          {color && <span className="dot" style={{ background: color }} />}
          <span className="name">{n.label}{collapsed && kids.length ? ` (+${descendants(graph.nodes, n.id).size})` : ''}</span>
          <span className="spacer" />
          <button className={`icon-btn${emph ? ' on' : ''}`} title="Emphasise path to this node" onClick={(e) => { e.stopPropagation(); setView({ emphasis: toggle(view.emphasis, n.id) }) }}><Focus size={13} /></button>
          <button className={`icon-btn${collapsed ? ' on' : ''}`} title="Collapse subtree" style={{ visibility: kids.length ? 'visible' : 'hidden' }} onClick={(e) => { e.stopPropagation(); setView({ collapsed: toggle(view.collapsed, n.id) }) }}><FoldVertical size={13} /></button>
          <button className={`icon-btn${hiddenSelf ? ' on' : ''}`} title={hiddenSelf ? 'Show this node' : 'Hide only this node (progeny stay, reconnected to the nearest visible ancestor)'} onClick={(e) => { e.stopPropagation(); setView({ hiddenSelf: toggle(view.hiddenSelf ?? [], n.id) }) }}><CircleOff size={13} /></button>
          <button className={`icon-btn${hidden ? ' on' : ''}`} title={hidden ? 'Show subtree' : 'Hide this node and all its progeny'} onClick={(e) => { e.stopPropagation(); setView({ hidden: toggle(view.hidden, n.id) }) }}>{hidden ? <EyeOff size={13} /> : <Eye size={13} />}</button>
          <button className="icon-btn" title="Add a child cell type" onClick={(e) => { e.stopPropagation(); addChild(n.id) }}><Plus size={13} /></button>
        </div>
        {isOpen && !collapsed && kids.map((k) => renderTree(k, depth + 1))}
      </div>
    )
  }

  const sel = selected ? byId.get(selected) : undefined

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal wide">
        <header>
          <span>{existing ? 'Edit developmental ontogeny' : 'Insert developmental ontogeny'}</span>
          <button onClick={onClose} aria-label="Close">×</button>
        </header>
        <div className="body onto-body">
          {showTemplates && (
            <div className="template-list" style={{ marginBottom: 4 }}>
              {[...ONTOGENIES, BLANK].map((g) => (
                <button key={g.id} className={`template-card${graph.id === g.id ? ' active' : ''}`} onClick={() => { setDoc((d) => ({ graph: structuredClone(g), view: { ...d.view, hidden: [], collapsed: [], emphasis: [], stages: [] } })); setSelected(null); setShowTemplates(false) }}>
                  <b>{g.name}</b><span>{g.organism || 'Editable starter'} · {g.nodes.length} nodes · {g.stages.length} stages</span>
                </button>
              ))}
            </div>
          )}
          <div className="onto-columns">
            <div className="onto-left">
              <div className="tabs">
                <button className={tab === 'graph' ? 'active' : ''} onClick={() => setTab('graph')}>Graph</button>
                <button className={tab === 'appearance' ? 'active' : ''} onClick={() => setTab('appearance')}>Appearance</button>
                {!showTemplates && <button onClick={() => setShowTemplates(true)}>Templates…</button>}
              </div>
              {tab === 'graph' && (
                <>
                  <div className="row" style={{ gap: 6 }}>
                    <input placeholder="Find cell type…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 1 }} />
                    <button className="btn" title="Clear visibility / emphasis" onClick={() => setView({ hidden: [], collapsed: [], emphasis: [], stages: [] })}>Reset view</button>
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    <label style={{ width: 'auto', color: 'var(--muted)' }}>Stages from</label>
                    <select value={activeStageIdx().from} onChange={(e) => stageRange(Number(e.target.value), activeStageIdx().to)}>
                      {graph.stages.map((s, i) => <option key={s.id} value={i}>{s.label}</option>)}
                    </select>
                    <label style={{ width: 'auto', color: 'var(--muted)' }}>to</label>
                    <select value={activeStageIdx().to} onChange={(e) => stageRange(activeStageIdx().from, Number(e.target.value))}>
                      {graph.stages.map((s, i) => <option key={s.id} value={i}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="hint">Row buttons: emphasise path · collapse subtree · hide node only (progeny re-attach to the nearest visible ancestor) · hide subtree · add child. Nodes above the stage range are dropped and their progeny become new roots.</div>
                  <div className="onto-tree">{root && renderTree(root, 0)}</div>
                  {sel && (
                    <div className="stage-card">
                      <header>
                        <span>Selected</span>
                        <span className="spacer" />
                        <button className="btn" title="Show only this node's path and subtree" onClick={() => focusOn(sel.id)}><Focus size={14} /> Focus</button>
                        <button className="btn" onClick={() => addChild(sel.id)}><Plus size={14} /> Child</button>
                        {sel.parents.length > 0 && <button className="btn danger" title="Delete this node; its children re-attach to its parent" onClick={() => removeNodeOnly(sel.id)}><Trash2 size={14} /> Node</button>}
                        {sel.parents.length > 0 && <button className="btn danger" title="Delete this node and all its progeny" onClick={() => removeSubtree(sel.id)}><Trash2 size={14} /> Subtree</button>}
                      </header>
                      <div className="grid2">
                        <div className="field"><label>Label</label><input value={sel.label} onChange={(e) => updateNode(sel.id, { label: e.target.value })} /></div>
                        <div className="field"><label>Markers / sub-label</label><input value={sel.markers ?? ''} onChange={(e) => updateNode(sel.id, { markers: e.target.value })} /></div>
                      </div>
                      <div className="grid3">
                        <div className="field"><label>Stage</label>
                          <select value={sel.stage ?? ''} onChange={(e) => updateNode(sel.id, { stage: e.target.value || undefined })}>
                            <option value="">(none)</option>
                            {graph.stages.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                        </div>
                        <div className="field"><label>Lineage</label>
                          <select value={sel.lineage ?? ''} onChange={(e) => updateNode(sel.id, { lineage: e.target.value || undefined })}>
                            <option value="">(inherit)</option>
                            {graph.lineages.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                          </select>
                        </div>
                        <div className="field"><label>Primary parent</label>
                          <select value={sel.parents[0] ?? ''} disabled={sel.parents.length === 0} onChange={(e) => updateNode(sel.id, { parents: [e.target.value, ...sel.parents.slice(1)] })}>
                            {graph.nodes.filter((n) => n.id !== sel.id && !descendants(graph.nodes, sel.id).has(n.id)).map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid3">
                        <div className="field"><label>Secondary parent (dashed)</label>
                          <select value={sel.parents[1] ?? ''} onChange={(e) => updateNode(sel.id, { parents: e.target.value ? [sel.parents[0]!, e.target.value] : sel.parents.slice(0, 1) })}>
                            <option value="">(none)</option>
                            {graph.nodes.filter((n) => n.id !== sel.id && n.id !== sel.parents[0]).map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
                          </select>
                        </div>
                        <div className="field"><label>Icon (icon node style)</label>
                          <select value={sel.iconId ?? ''} onChange={(e) => updateNode(sel.id, { iconId: e.target.value || undefined })}>
                            <option value="">(none)</option>
                            {cellIcons.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                          </select>
                        </div>
                        <label className="check" style={{ alignSelf: 'end' }}><input type="checkbox" checked={!!sel.terminal} onChange={(e) => updateNode(sel.id, { terminal: e.target.checked })} /> Terminal cell type</label>
                      </div>
                      <details open>
                        <summary>Appearance of this node and its incoming edge</summary>
                        {(() => {
                          const ns = view.nodeStyles?.[sel.id] ?? {}
                          const ekey = sel.parents[0] ? `${sel.parents[0]}>${sel.id}` : null
                          const es = ekey ? view.edgeStyles?.[ekey] ?? {} : {}
                          return (
                            <>
                              <div className="grid3">
                                <div className="field"><label>Node colour</label><div className="row"><ColorInput value={ns.color ?? ''} allowNone onChange={(v) => setNodeStyle(sel.id, { color: v || undefined })} /></div></div>
                                <div className="field"><label>Shape</label>
                                  <select value={ns.shape ?? 'circle'} onChange={(e) => setNodeStyle(sel.id, { shape: e.target.value as NodeStyleOverride['shape'] })}>
                                    <option value="circle">Circle</option><option value="square">Square</option><option value="diamond">Diamond</option>
                                  </select>
                                </div>
                                <div className="field"><label>Node size ×{(ns.sizeScale ?? 1).toFixed(1)}</label><input type="range" min={0.5} max={3} step={0.1} value={ns.sizeScale ?? 1} onChange={(e) => setNodeStyle(sel.id, { sizeScale: Number(e.target.value) })} /></div>
                              </div>
                              <div className="grid3">
                                <div className="field"><label>Label colour</label><div className="row"><ColorInput value={ns.labelColor ?? ''} allowNone onChange={(v) => setNodeStyle(sel.id, { labelColor: v || undefined })} /></div></div>
                                <div className="field"><label>Label size ×{(ns.labelScale ?? 1).toFixed(1)}</label><input type="range" min={0.6} max={2} step={0.1} value={ns.labelScale ?? 1} onChange={(e) => setNodeStyle(sel.id, { labelScale: Number(e.target.value) })} /></div>
                                <div className="radio-list" style={{ alignSelf: 'end' }}>
                                  <label className="check"><input type="checkbox" checked={!!ns.labelBold} onChange={(e) => setNodeStyle(sel.id, { labelBold: e.target.checked })} /> Bold</label>
                                  <label className="check"><input type="checkbox" checked={!!ns.hideLabel} onChange={(e) => setNodeStyle(sel.id, { hideLabel: e.target.checked })} /> Hide label</label>
                                </div>
                              </div>
                              {ekey && (
                                <div className="grid3">
                                  <div className="field"><label>Edge colour (from parent)</label><div className="row"><ColorInput value={es.color ?? ''} allowNone onChange={(v) => setEdgeStyle(ekey, { color: v || undefined })} /></div></div>
                                  <div className="field"><label>Edge width ×{(es.widthScale ?? 1).toFixed(1)}</label><input type="range" min={0.3} max={4} step={0.1} value={es.widthScale ?? 1} onChange={(e) => setEdgeStyle(ekey, { widthScale: Number(e.target.value) })} /></div>
                                  <div className="field"><label>Edge label</label>
                                    <div className="row"><input value={es.label ?? ''} placeholder="e.g. EMT" onChange={(e) => setEdgeStyle(ekey, { label: e.target.value || undefined })} /><label className="check"><input type="checkbox" checked={!!es.dashed} onChange={(e) => setEdgeStyle(ekey, { dashed: e.target.checked })} /> Dashed</label></div>
                                  </div>
                                </div>
                              )}
                              <div><button className="btn" onClick={() => { const nsAll = { ...(view.nodeStyles ?? {}) }; delete nsAll[sel.id]; const esAll = { ...(view.edgeStyles ?? {}) }; if (ekey) delete esAll[ekey]; setView({ nodeStyles: nsAll, edgeStyles: esAll }) }}>Reset this node's appearance</button></div>
                            </>
                          )
                        })()}
                      </details>
                    </div>
                  )}
                  <details>
                    <summary>Stages ({graph.stages.length})</summary>
                    <div className="onto-list">
                      {graph.stages.map((s, i) => (
                        <div className="row" key={s.id}>
                          <label className="check" title="Include stage"><input type="checkbox" checked={!view.stages.length || view.stages.includes(s.id)} onChange={(e) => {
                            const all = graph.stages.map((x) => x.id)
                            const cur = view.stages.length ? view.stages : all
                            const next = e.target.checked ? all.filter((x) => cur.includes(x) || x === s.id) : cur.filter((x) => x !== s.id)
                            setView({ stages: next.length === all.length ? [] : next })
                          }} /></label>
                          <input value={s.label} onChange={(e) => setGraph((g) => ({ ...g, stages: g.stages.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)) }))} />
                          <input type="number" style={{ width: 70 }} value={s.time ?? ''} placeholder="t" onChange={(e) => setGraph((g) => ({ ...g, stages: g.stages.map((x) => (x.id === s.id ? { ...x, time: e.target.value === '' ? undefined : Number(e.target.value) } : x)) }))} />
                          <button className="icon-btn" disabled={i === 0} onClick={() => setGraph((g) => { const st = [...g.stages]; [st[i - 1], st[i]] = [st[i]!, st[i - 1]!]; return { ...g, stages: st } })}>↑</button>
                          <button className="icon-btn" onClick={() => setGraph((g) => ({ ...g, stages: g.stages.filter((x) => x.id !== s.id), nodes: g.nodes.map((n) => (n.stage === s.id ? { ...n, stage: undefined } : n)) }))}><Trash2 size={13} /></button>
                        </div>
                      ))}
                      <button className="btn" onClick={() => setGraph((g) => ({ ...g, stages: [...g.stages, { id: newId('stage'), label: `Stage ${g.stages.length}`, time: (g.stages[g.stages.length - 1]?.time ?? 0) + 1 }] }))}><Plus size={13} /> Add stage</button>
                    </div>
                  </details>
                  <details>
                    <summary>Lineages ({graph.lineages.length})</summary>
                    <div className="onto-list">
                      {graph.lineages.map((l) => (
                        <div className="row" key={l.id}>
                          <input value={l.label} onChange={(e) => setGraph((g) => ({ ...g, lineages: g.lineages.map((x) => (x.id === l.id ? { ...x, label: e.target.value } : x)) }))} />
                          <ColorInput value={l.color} onChange={(v) => v && setGraph((g) => ({ ...g, lineages: g.lineages.map((x) => (x.id === l.id ? { ...x, color: v } : x)) }))} />
                          <button className="icon-btn" onClick={() => setGraph((g) => ({ ...g, lineages: g.lineages.filter((x) => x.id !== l.id), nodes: g.nodes.map((n) => (n.lineage === l.id ? { ...n, lineage: undefined } : n)) }))}><Trash2 size={13} /></button>
                        </div>
                      ))}
                      <button className="btn" onClick={() => setGraph((g) => ({ ...g, lineages: [...g.lineages, { id: newId('lin'), label: 'New lineage', color: '#9467bd' }] }))}><Plus size={13} /> Add lineage</button>
                    </div>
                  </details>
                </>
              )}
              {tab === 'appearance' && (
                <div className="onto-appearance">
                  <div className="field"><label>Title</label><input value={view.title ?? ''} onChange={(e) => setView({ title: e.target.value })} /></div>
                  <div className="grid2">
                    <div className="field"><label>Layout</label>
                      <select value={view.layout} onChange={(e) => setView({ layout: e.target.value as OntogenyView['layout'] })}>
                        <option value="tree">Tree (by depth)</option>
                        <option value="staged">Staged (columns = stages / time)</option>
                      </select>
                    </div>
                    <div className="field"><label>Orientation</label>
                      <select value={view.orientation} onChange={(e) => setView({ orientation: e.target.value as OntogenyView['orientation'] })}>
                        <option value="horizontal">Horizontal (root left)</option>
                        <option value="vertical">Vertical (root top)</option>
                      </select>
                    </div>
                    <div className="field"><label>Edge style</label>
                      <select value={view.edgeStyle} onChange={(e) => setView({ edgeStyle: e.target.value as OntogenyView['edgeStyle'] })}>
                        <option value="curve">Curved</option>
                        <option value="straight">Straight</option>
                        <option value="orthogonal">Orthogonal (right angles)</option>
                        <option value="metro">Metro map (thick octilinear routes)</option>
                      </select>
                    </div>
                    <div className="field"><label>Node style</label>
                      <select value={view.nodeStyle} onChange={(e) => setView({ nodeStyle: e.target.value as OntogenyView['nodeStyle'] })}>
                        <option value="circle">Circle</option>
                        <option value="pill">Pill (label inside)</option>
                        <option value="label">Label only</option>
                        <option value="icon">Cell icon (where available)</option>
                      </select>
                    </div>
                    <div className="field"><label>Colour by</label>
                      <select value={view.colorBy} onChange={(e) => setView({ colorBy: e.target.value as OntogenyView['colorBy'] })}>
                        <option value="lineage">Lineage</option>
                        <option value="stage">Stage</option>
                        <option value="none">None (grey)</option>
                      </select>
                    </div>
                    <div className="field"><label>Font</label>
                      <select value={view.fontFamily} onChange={(e) => setView({ fontFamily: e.target.value })}>
                        {['Helvetica', 'Arial', 'Times New Roman', 'Georgia', 'Verdana'].map((f) => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="field"><label>Sibling spacing ({view.nodeGap}px)</label><input type="range" min={16} max={120} value={view.nodeGap} onChange={(e) => setView({ nodeGap: Number(e.target.value) })} /></div>
                  <div className="field"><label>Level / stage spacing ({view.levelGap}px)</label><input type="range" min={60} max={400} value={view.levelGap} onChange={(e) => setView({ levelGap: Number(e.target.value) })} /></div>
                  <div className="grid3">
                    <div className="field"><label>Node size</label><input type="number" min={3} max={40} value={view.nodeSize} onChange={(e) => setView({ nodeSize: Number(e.target.value) })} /></div>
                    <div className="field"><label>Edge width</label><input type="number" min={0.5} max={12} step={0.5} value={view.edgeWidth} onChange={(e) => setView({ edgeWidth: Number(e.target.value) })} /></div>
                    <div className="field"><label>Font size</label><input type="number" min={6} max={40} value={view.fontSize} onChange={(e) => setView({ fontSize: Number(e.target.value) })} /></div>
                  </div>
                  <div className="field"><label>Fade of non-emphasised elements ({Math.round(view.fadeOpacity * 100)}%)</label><input type="range" min={0} max={100} value={Math.round(view.fadeOpacity * 100)} onChange={(e) => setView({ fadeOpacity: Number(e.target.value) / 100 })} /></div>
                  <div className="radio-list">
                    <label className="check"><input type="checkbox" checked={view.showStageAxis} onChange={(e) => setView({ showStageAxis: e.target.checked })} /> Stage axis</label>
                    <label className="check"><input type="checkbox" checked={view.showStageBands} onChange={(e) => setView({ showStageBands: e.target.checked })} /> Stage bands</label>
                    <label className="check"><input type="checkbox" checked={view.showMarkers} onChange={(e) => setView({ showMarkers: e.target.checked })} /> Markers</label>
                    <label className="check"><input type="checkbox" checked={view.showLineageLegend} onChange={(e) => setView({ showLineageLegend: e.target.checked })} /> Lineage legend</label>
                    <label className="check"><input type="checkbox" checked={!!view.proportional} onChange={(e) => setView({ proportional: e.target.checked })} /> Proportional to stage time</label>
                  </div>
                  <div className="hint">Use the Graph tab to hide, collapse or emphasise nodes. Emphasised nodes keep their whole path from the root at full opacity.</div>
                </div>
              )}
            </div>
            <div className="onto-preview">
              <div className="preview-meta">
                <span>{preview.n} nodes · {Math.round(preview.w)} × {Math.round(preview.h)} px{preview.error ? ` · ${preview.error}` : ''}</span>
                <span className="spacer" />
                <button className="icon-btn" title="Zoom out" onClick={() => setZoom((z) => Math.max(0.1, (z === 'fit' ? 1 : z) / 1.25))}><ZoomOut size={14} /></button>
                <span style={{ minWidth: 44, textAlign: 'center' }}>{zoom === 'fit' ? 'Auto' : `${Math.round(zoom * 100)}%`}</span>
                <button className="icon-btn" title="Zoom in" onClick={() => setZoom((z) => Math.min(6, (z === 'fit' ? 1 : z) * 1.25))}><ZoomIn size={14} /></button>
                <button className="btn" style={{ padding: '2px 8px' }} onClick={() => setZoom('fit')}>Fit</button>
                <button className="btn" style={{ padding: '2px 8px' }} onClick={() => setZoom(1)}>100%</button>
              </div>
              <div className={`preview-box${zoom === 'fit' ? ' fit' : ''}`}>
                <div style={zoom === 'fit' ? undefined : { width: preview.w * zoom, height: preview.h * zoom }} dangerouslySetInnerHTML={{ __html: zoom === 'fit' ? preview.svg : preview.svg.replace(/<svg([^>]*) width="[^"]*" height="[^"]*"/, `<svg$1 width="${preview.w * zoom}" height="${preview.h * zoom}"`) }} />
              </div>
            </div>
          </div>
        </div>
        <footer>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy} onClick={() => void apply()}>{existing ? 'Apply changes' : 'Insert'}</button>
        </footer>
      </div>
    </div>
  )
}
