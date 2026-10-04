import { CalendarRange, ChevronDown, ChevronRight, GitBranch, Grid3x3, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { sceneCenter } from '../canvas/commands'
import { useEditor } from '../canvas/editorStore'
import { insertLibraryItem } from '../library/insert'
import { itemsInCategory, searchItems } from '../library/registry'
import { CATEGORY_LABELS, CATEGORY_ORDER, type Category, type LibraryItem } from '../library/types'
import { IconPreview } from './IconPreview'

export function LibraryPanel() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<Record<string, boolean>>({ composites: true, cells: true, consumables: true })
  const canvas = useEditor((s) => s.canvas)
  const openDialog = useEditor((s) => s.openDialog)
  const setTool = useEditor((s) => s.setTool)

  const results = useMemo(() => (query.trim() ? searchItems(query) : null), [query])

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
