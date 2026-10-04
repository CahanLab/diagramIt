import { Group } from 'fabric'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { sceneCenter } from '../canvas/commands'
import { useEditor } from '../canvas/editorStore'
import { itemsInCategory } from '../library/registry'
import { ColorInput } from '../ui/ColorInput'
import { IconPreview } from '../ui/IconPreview'
import { findItem } from '../library/registry'
import { renderProtocol, replaceProtocolGroup, protocolOf } from './render'
import { PROTOCOL_TEMPLATES } from './templates'
import type { MediaRow, Protocol, Stage } from './types'
import { newId } from './types'

const STAGE_COLORS = ['#ffffff', '#dbeafe', '#dcfce7', '#fef9c3', '#fde68a', '#fecaca', '#e9d5ff', '#fbcfe8', '#ccfbf1', '#e5e7eb']

function lines(s: string): string[] {
  return s.split('\n').map((l) => l.trim()).filter(Boolean)
}

function CellPicker({ value, onChange }: { value?: string; onChange: (id: string | undefined) => void }) {
  const options = useMemo(() => [...itemsInCategory('composites').filter((i) => i.id.includes('cluster')), ...itemsInCategory('cells')], [])
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value || undefined)}>
      <option value="">(no icon)</option>
      {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
    </select>
  )
}

function StageCard({ stage, index, total, onChange, onRemove, onMove }: { stage: Stage; index: number; total: number; onChange: (s: Stage) => void; onRemove: () => void; onMove: (d: -1 | 1) => void }) {
  const icon = stage.cellIconId ? findItem(stage.cellIconId) : undefined
  return (
    <div className="stage-card">
      <header>
        <span>Stage {index + 1}</span>
        <input value={stage.name} onChange={(e) => onChange({ ...stage, name: e.target.value })} style={{ flex: 1, padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 6 }} placeholder="Stage name" />
        <span className="spacer" />
        <button className="icon-btn" title="Move up" disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp size={16} /></button>
        <button className="icon-btn" title="Move down" disabled={index === total - 1} onClick={() => onMove(1)}><ArrowDown size={16} /></button>
        <button className="icon-btn" title="Remove stage" onClick={onRemove}><Trash2 size={16} /></button>
      </header>
      <div className="grid3">
        <div className="field"><label>Start</label><input type="number" value={stage.start} onChange={(e) => onChange({ ...stage, start: Number(e.target.value) })} /></div>
        <div className="field"><label>End</label><input type="number" value={stage.end} onChange={(e) => onChange({ ...stage, end: Number(e.target.value) })} /></div>
        <div className="field"><label>Box colour</label>
          <div className="row"><ColorInput value={stage.color} onChange={(v) => v && onChange({ ...stage, color: v })} /></div>
          <div className="swatches">{STAGE_COLORS.map((c) => <button key={c} style={{ background: c }} onClick={() => onChange({ ...stage, color: c })} />)}</div>
        </div>
      </div>
      <div className="grid3">
        <div className="field"><label>Cell population at start</label><input value={stage.cellLabel ?? ''} placeholder="e.g. hiPS cells" onChange={(e) => onChange({ ...stage, cellLabel: e.target.value })} /></div>
        <div className="field"><label>Cell icon</label>
          <div className="row">
            <CellPicker value={stage.cellIconId} onChange={(id) => onChange({ ...stage, cellIconId: id })} />
            {icon && <span style={{ width: 36, height: 36 }}><IconPreview item={icon} primary={stage.cellColor} /></span>}
          </div>
        </div>
        <div className="field"><label>Cell colour</label><div className="row"><ColorInput value={stage.cellColor ?? '#c9a46b'} onChange={(v) => v && onChange({ ...stage, cellColor: v })} /></div></div>
      </div>
      <div className="grid2">
        <div className="field"><label>Markers (one per line, e.g. Oct4+)</label><textarea value={(stage.markers ?? []).join('\n')} onChange={(e) => onChange({ ...stage, markers: lines(e.target.value) })} /></div>
        <div className="field"><label>Media / factors (one per line)</label><textarea value={stage.media.join('\n')} onChange={(e) => onChange({ ...stage, media: lines(e.target.value) })} /></div>
      </div>
    </div>
  )
}

function RowEditor({ row, onChange, onRemove }: { row: MediaRow; onChange: (r: MediaRow) => void; onRemove: () => void }) {
  return (
    <div className="stage-card">
      <header>
        <input value={row.label} placeholder="Row label (e.g. Basal medium)" onChange={(e) => onChange({ ...row, label: e.target.value })} style={{ flex: 1, padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 6 }} />
        <button className="icon-btn" title="Remove row" onClick={onRemove}><Trash2 size={16} /></button>
      </header>
      {row.spans.map((sp, i) => (
        <div className="row" key={i} style={{ gap: 8 }}>
          <input type="number" value={sp.start} style={{ width: 64 }} onChange={(e) => onChange({ ...row, spans: row.spans.map((s, j) => (j === i ? { ...s, start: Number(e.target.value) } : s)) })} />
          <span>→</span>
          <input type="number" value={sp.end} style={{ width: 64 }} onChange={(e) => onChange({ ...row, spans: row.spans.map((s, j) => (j === i ? { ...s, end: Number(e.target.value) } : s)) })} />
          <input value={sp.text} placeholder="Text" style={{ flex: 1 }} onChange={(e) => onChange({ ...row, spans: row.spans.map((s, j) => (j === i ? { ...s, text: e.target.value } : s)) })} />
          <ColorInput value={sp.color} onChange={(v) => v && onChange({ ...row, spans: row.spans.map((s, j) => (j === i ? { ...s, color: v } : s)) })} />
          <button className="icon-btn" onClick={() => onChange({ ...row, spans: row.spans.filter((_, j) => j !== i) })}><Trash2 size={14} /></button>
        </div>
      ))}
      <div>
        <button className="btn" onClick={() => {
          const last = row.spans[row.spans.length - 1]
          onChange({ ...row, spans: [...row.spans, { start: last ? last.end : 0, end: (last ? last.end : 0) + 2, text: 'Medium', color: STAGE_COLORS[(row.spans.length + 1) % STAGE_COLORS.length]! }] })
        }}><Plus size={14} /> Add span</button>
      </div>
    </div>
  )
}

export function ProtocolEditor({ target, onClose }: { target?: Group; onClose: () => void }) {
  const canvas = useEditor((s) => s.canvas)
  const existing = target ? protocolOf(target) : undefined
  const [p, setP] = useState<Protocol>(() => structuredClone(existing ?? PROTOCOL_TEMPLATES[0]!.protocol))
  const [busy, setBusy] = useState(false)
  const [showTemplates, setShowTemplates] = useState(!existing)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const update = (patch: Partial<Protocol>) => setP((prev) => ({ ...prev, ...patch }))
  const setStage = (i: number, s: Stage) => update({ stages: p.stages.map((x, j) => (j === i ? s : x)) })
  const removeStage = (i: number) => update({ stages: p.stages.filter((_, j) => j !== i) })
  const moveStage = (i: number, d: -1 | 1) => {
    const arr = [...p.stages]
    const j = i + d
    if (j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
    update({ stages: arr })
  }
  const addStage = () => {
    const last = p.stages[p.stages.length - 1]
    const start = last ? last.end : 0
    update({ stages: [...p.stages, { id: newId(), name: `Stage ${p.stages.length + 1}`, start, end: start + 4, color: STAGE_COLORS[(p.stages.length + 1) % STAGE_COLORS.length]!, cellLabel: '', cellIconId: 'composites.cell-cluster-9', cellColor: '#c9a46b', markers: [], media: ['Basal medium'] }] })
  }

  const apply = async () => {
    if (!canvas) return
    setBusy(true)
    try {
      if (target && existing) {
        await replaceProtocolGroup(canvas, target, p)
      } else {
        const g = await renderProtocol(p)
        const c = sceneCenter(canvas)
        g.set({ left: c.x - (g.width * g.scaleX) / 2, top: c.y - (g.height * g.scaleY) / 2 })
        g.setCoords()
        canvas.add(g)
        canvas.setActiveObject(g)
        canvas.requestRenderAll()
      }
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <header>
          <span>{existing ? 'Edit differentiation timeline' : 'Insert differentiation timeline'}</span>
          <button onClick={onClose} aria-label="Close">×</button>
        </header>
        <div className="body">
          {showTemplates && (
            <>
              <div className="field"><label>Start from a template</label></div>
              <div className="template-list">
                {PROTOCOL_TEMPLATES.map((t) => (
                  <button key={t.id} className="template-card" onClick={() => { setP(structuredClone(t.protocol)); setShowTemplates(false) }}>
                    <b>{t.name}</b><span>{t.description}</span>
                  </button>
                ))}
              </div>
              <div className="field"><label>…or edit the current settings below.</label></div>
            </>
          )}
          <div className="grid3">
            <div className="field"><label>Title (optional)</label><input value={p.title ?? ''} onChange={(e) => update({ title: e.target.value })} /></div>
            <div className="field"><label>Layout</label>
              <select value={p.layout} onChange={(e) => update({ layout: e.target.value as Protocol['layout'] })}>
                <option value="classic">Classic (axis, cells, media boxes)</option>
                <option value="strip">Compact strip (day ruler + bands)</option>
              </select>
            </div>
            <div className="field"><label>Time unit</label>
              <select value={p.unit} onChange={(e) => update({ unit: e.target.value as Protocol['unit'] })}>
                <option value="day">Days</option><option value="hour">Hours</option><option value="week">Weeks</option>
              </select>
            </div>
          </div>
          <div className="grid3">
            <div className="field"><label>Pixels per {p.unit} ({p.pxPerUnit})</label><input type="range" min={6} max={160} value={p.pxPerUnit} onChange={(e) => update({ pxPerUnit: Number(e.target.value) })} /></div>
            <div className="field"><label>Font size</label><input type="number" min={8} max={48} value={p.fontSize} onChange={(e) => update({ fontSize: Number(e.target.value) })} /></div>
            <div className="field"><label>Font</label>
              <select value={p.fontFamily} onChange={(e) => update({ fontFamily: e.target.value })}>
                {['Helvetica', 'Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New'].map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="radio-list">
            <label className="check"><input type="checkbox" checked={p.showCells} onChange={(e) => update({ showCells: e.target.checked })} /> Show cell icons</label>
            <label className="check"><input type="checkbox" checked={p.showMarkers} onChange={(e) => update({ showMarkers: e.target.checked })} /> Show markers</label>
            <label className="check"><input type="checkbox" checked={p.showMedia} onChange={(e) => update({ showMedia: e.target.checked })} /> Show media boxes</label>
          </div>

          <h4 style={{ margin: '6px 0 0' }}>Stages</h4>
          {p.stages.map((s, i) => (
            <StageCard key={s.id} stage={s} index={i} total={p.stages.length} onChange={(ns) => setStage(i, ns)} onRemove={() => removeStage(i)} onMove={(d) => moveStage(i, d)} />
          ))}
          <div><button className="btn" onClick={addStage}><Plus size={14} /> Add stage</button></div>

          <h4 style={{ margin: '6px 0 0' }}>Endpoint (cells after the last stage)</h4>
          <div className="grid3">
            <div className="field"><label>Label</label><input value={p.endpoint?.cellLabel ?? ''} placeholder="e.g. Podocytes" onChange={(e) => update({ endpoint: { ...(p.endpoint ?? {}), cellLabel: e.target.value } })} /></div>
            <div className="field"><label>Icon</label><CellPicker value={p.endpoint?.cellIconId} onChange={(id) => update({ endpoint: { ...(p.endpoint ?? {}), cellIconId: id } })} /></div>
            <div className="field"><label>Colour</label><div className="row"><ColorInput value={p.endpoint?.cellColor ?? '#d9534f'} onChange={(v) => v && update({ endpoint: { ...(p.endpoint ?? {}), cellColor: v } })} /></div></div>
          </div>
          <div className="grid2">
            <div className="field"><label>Endpoint markers (one per line)</label><textarea value={(p.endpoint?.markers ?? []).join('\n')} onChange={(e) => update({ endpoint: { ...(p.endpoint ?? {}), markers: lines(e.target.value) } })} /></div>
            <div className="field"><label>Full-width note row (e.g. ECM: Laminin 511)</label><input value={p.ecm ?? ''} onChange={(e) => update({ ecm: e.target.value })} /></div>
          </div>
          <div className="row"><button className="btn" onClick={() => update({ endpoint: undefined })}>Remove endpoint</button></div>

          <h4 style={{ margin: '6px 0 0' }}>Extra rows (coloured bands, e.g. basal medium, supplements)</h4>
          {p.rows.map((r, i) => (
            <RowEditor key={r.id} row={r} onChange={(nr) => update({ rows: p.rows.map((x, j) => (j === i ? nr : x)) })} onRemove={() => update({ rows: p.rows.filter((_, j) => j !== i) })} />
          ))}
          <div><button className="btn" onClick={() => update({ rows: [...p.rows, { id: newId('r'), label: 'Basal medium', spans: [{ start: 0, end: 4, text: 'RPMI + B27', color: '#f6d9cf' }] }] })}><Plus size={14} /> Add row</button></div>
        </div>
        <footer>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy} onClick={() => void apply()}>{existing ? 'Apply changes' : 'Insert'}</button>
        </footer>
      </div>
    </div>
  )
}
