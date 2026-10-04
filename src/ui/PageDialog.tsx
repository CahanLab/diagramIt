import { useEffect, useState } from 'react'
import { ensurePage, fitPage } from '../canvas/commands'
import { useEditor } from '../canvas/editorStore'
import { PAGE_PRESETS } from '../canvas/page'
import { ColorInput } from './ColorInput'

export function PageDialog({ onClose }: { onClose: () => void }) {
  const page = useEditor((s) => s.page)
  const canvas = useEditor((s) => s.canvas)
  const setPage = useEditor((s) => s.setPage)
  const setZoom = useEditor((s) => s.setZoom)
  const [w, setW] = useState(page.width)
  const [h, setH] = useState(page.height)
  const [bg, setBg] = useState(page.background)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const apply = () => {
    const next = { width: Math.max(100, Math.round(w)), height: Math.max(100, Math.round(h)), background: bg || '#ffffff' }
    setPage(next)
    if (canvas) {
      ensurePage(canvas, next)
      setZoom(fitPage(canvas, next))
      canvas.requestRenderAll()
      canvas.fire('object:modified', {} as never)
    }
    onClose()
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal narrow">
        <header><span>Page setup</span><button onClick={onClose} aria-label="Close">×</button></header>
        <div className="body">
          <div className="field"><label>Preset</label>
            <select value="" onChange={(e) => { const p = PAGE_PRESETS[Number(e.target.value)]; if (p) { setW(p.width); setH(p.height) } }}>
              <option value="">Choose…</option>
              {PAGE_PRESETS.map((p, i) => <option key={p.label} value={i}>{p.label}</option>)}
            </select>
          </div>
          <div className="grid2">
            <div className="field"><label>Width (px)</label><input type="number" value={w} onChange={(e) => setW(Number(e.target.value))} /></div>
            <div className="field"><label>Height (px)</label><input type="number" value={h} onChange={(e) => setH(Number(e.target.value))} /></div>
          </div>
          <div className="field"><label>Background</label><div className="row"><ColorInput value={bg} onChange={setBg} /></div></div>
          <div className="hint" style={{ color: 'var(--muted)' }}>Page pixels map 1:1 to SVG user units. Export at 3× or more for print-quality PNG.</div>
        </div>
        <footer>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={apply}>Apply</button>
        </footer>
      </div>
    </div>
  )
}
