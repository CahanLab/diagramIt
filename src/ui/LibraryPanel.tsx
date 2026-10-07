import { CalendarRange, ChevronDown, ChevronRight, GitBranch, Grid3x3, Search, Settings2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { sceneCenter } from '../canvas/commands'
import { useEditor } from '../canvas/editorStore'
import { insertLibraryItem } from '../library/insert'
import { itemsInCategory, searchItems } from '../library/registry'
import { CATEGORY_LABELS, CATEGORY_ORDER, type Category, type LibraryItem } from '../library/types'
import { useLibraries } from '../libraries/store'
import { IconPreview } from './IconPreview'

export function LibraryPanel() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<Record<string, boolean>>({ composites: true, cells: true, consumables: true })
  const canvas = useEditor((s) => s.canvas)
  const openDialog = useEditor((s) => s.openDialog)
  const setTool = useEditor((s) => s.setTool)
  const libraries = useLibraries((s) => s.libraries)

  const results = useMemo(() => (query.trim() ? searchItems(query) : null), [query, libraries])

  const insert = async (item: LibraryItem) => {
    if (!canvas) return
    const c = sceneCenter(canvas)
    await insertLibraryItem(canvas, item, { x: c.x, y: c.y })
    setTool('select')
  }

  const renderGrid = (items: LibraryItem[]) => (
    <div className="lib-grid">
      {items.map((item) => (
        <button
          key={item.id}
          className="lib-item"
          title={`${item.name} — click to insert, or drag onto the canvas`}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('application/x-diagramit-item', item.id)
            e.dataTransfer.effectAllowed = 'copy'
          }}
          onClick={() => void insert(item)}
        >
          <IconPreview item={item} />
          <span className="label">{item.name}</span>
        </button>
      ))}
    </div>
  )

  return (
    <>
      <div className="lib-search">
        <Search size={16} style={{ alignSelf: 'center', color: 'var(--muted)' }} />
        <input placeholder="Search objects (e.g. iPSC, 96-well, flow)" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="lib-body">
        {results ? (
          results.length ? renderGrid(results) : <div className="lib-empty">No objects match “{query}”.</div>
        ) : (
          <>
            <div className="lib-special">
              <button onClick={() => openDialog({ kind: 'protocol' })}>
                <CalendarRange size={22} />
                <div><b>Differentiation timeline</b><span>Day axis, stages, cell types, media changes</span></div>
              </button>
              <button onClick={() => openDialog({ kind: 'ontogeny' })}>
                <GitBranch size={22} />
                <div><b>Developmental ontogeny</b><span>Mouse / human embryo, hematopoiesis, C. elegans lineage graphs</span></div>
              </button>
              <button onClick={() => openDialog({ kind: 'templates' })}>
                <Grid3x3 size={22} />
                <div><b>Parametric objects</b><span>Well plates, cell clusters, dishes with cells</span></div>
              </button>
            </div>
            {libraries.length === 0 ? (
              <section className="lib-cat">
                <header onClick={() => setOpen((o) => ({ ...o, __custom: !(open.__custom ?? false) }))}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{open.__custom ? <ChevronDown size={14} /> : <ChevronRight size={14} />} Custom libraries</span>
                  <button className="icon-btn" title="Manage libraries" onClick={(e) => { e.stopPropagation(); openDialog({ kind: 'libraries' }) }}><Settings2 size={14} /></button>
                </header>
                {open.__custom && (
                  <div className="lib-cta">
                    <span>Make your own icons and templates, bundle them under your name and share the file or a link.</span>
                    <span>Select objects on the canvas, then <b>File ▸ Save selection as library item</b>. In a timeline or ontogeny editor use <b>Save as template</b>.</span>
                    <button className="btn" onClick={() => openDialog({ kind: 'libraries' })}>Load or manage libraries…</button>
                  </div>
                )}
              </section>
            ) : (
              libraries.map((lib) => {
                const key = `lib:${lib.manifest.id}`
                const isOpen = open[key] ?? true
                const icons = lib.entries.flatMap((e) => (e.kind === 'icon' ? [e.item] : []))
                const templates = lib.entries.filter((e) => e.kind !== 'icon')
                return (
                  <section className="lib-cat" key={key}>
                    <header onClick={() => setOpen((o) => ({ ...o, [key]: !isOpen }))}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={`${lib.manifest.name} by ${lib.manifest.author}`}>{lib.manifest.name}<span className="by">by {lib.manifest.author}</span></span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="count">{lib.entries.length}</span>
                        <button className="icon-btn" title="Manage libraries" onClick={(e) => { e.stopPropagation(); openDialog({ kind: 'libraries' }) }}><Settings2 size={14} /></button>
                      </span>
                    </header>
                    {isOpen && (
                      <>
                        {icons.length > 0 && renderGrid(icons)}
                        {templates.length > 0 && (
                          <div className="lib-templates">
                            {templates.map((e) =>
                              e.kind === 'protocol' ? (
                                <button key={e.id} onClick={() => openDialog({ kind: 'protocol', template: { protocol: e.protocol, libraryId: e.id } })}>
                                  <CalendarRange size={16} /><div><b>{e.name}</b><br /><span>Timeline template{e.description ? ` · ${e.description}` : ''}</span></div>
                                </button>
                              ) : e.kind === 'ontogeny' ? (
                                <button key={e.graph.id} onClick={() => openDialog({ kind: 'ontogeny', template: { graph: e.graph, libraryId: e.graph.id } })}>
                                  <GitBranch size={16} /><div><b>{e.graph.name}</b><br /><span>Ontogeny · {e.graph.nodes.length} nodes</span></div>
                                </button>
                              ) : null,
                            )}
                          </div>
                        )}
                        {lib.entries.length === 0 && <div className="lib-empty">Empty library</div>}
                      </>
                    )}
                  </section>
                )
              })
            )}
            {CATEGORY_ORDER.map((cat: Category) => {
              const items = itemsInCategory(cat)
              const isOpen = open[cat] ?? false
              return (
                <section className="lib-cat" key={cat}>
                  <header onClick={() => setOpen((o) => ({ ...o, [cat]: !isOpen }))}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />} {CATEGORY_LABELS[cat]}
                    </span>
                    <span className="count">{items.length}</span>
                  </header>
                  {isOpen && (items.length ? renderGrid(items) : <div className="lib-empty">Coming soon</div>)}
                </section>
              )
            })}
          </>
        )}
      </div>
    </>
  )
}
