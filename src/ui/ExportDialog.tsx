import { useEffect, useState } from 'react'
import { useEditor } from '../canvas/editorStore'
import { dataUrlToBlob, downloadBlob, downloadText, safeFilename } from '../export/download'
import { exportPdf } from '../export/pdf'
import { exportPngDataUrl } from '../export/png'
import { exportPptx } from '../export/pptx'
import { exportSvg } from '../export/svg'

type Format = 'svg' | 'png' | 'pdf' | 'pptx'

export function ExportDialog({ docName, onClose, notify }: { docName: string; onClose: () => void; notify: (msg: string) => void }) {
  const canvas = useEditor((s) => s.canvas)
  const page = useEditor((s) => s.page)
  const [format, setFormat] = useState<Format>('pptx')
  const [scale, setScale] = useState(3)
  const [transparent, setTransparent] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const run = async () => {
    if (!canvas) return
    setBusy(true)
    try {
      if (format === 'svg') {
        downloadText(exportSvg(canvas, page, { background: !transparent }), safeFilename(docName, 'svg'), 'image/svg+xml')
      } else if (format === 'png') {
        downloadBlob(dataUrlToBlob(exportPngDataUrl(canvas, page, { scale, transparent })), safeFilename(docName, 'png'))
      } else if (format === 'pdf') {
        downloadBlob(await exportPdf(exportSvg(canvas, page, { background: !transparent }), page), safeFilename(docName, 'pdf'))
      } else {
        downloadBlob(await exportPptx(exportSvg(canvas, page, { background: false }), page, docName), safeFilename(docName, 'pptx'))
      }
      notify(`Exported ${format.toUpperCase()}`)
      onClose()
    } catch (err) {
      console.error(err)
      notify(`Export failed: ${(err as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal narrow">
        <header><span>Export figure</span><button onClick={onClose} aria-label="Close">×</button></header>
        <div className="body">
          <div className="radio-list" style={{ flexDirection: 'column', gap: 8 }}>
            <label><input type="radio" checked={format === 'pptx'} onChange={() => setFormat('pptx')} /> <b>PowerPoint (.pptx)</b> — one slide with the figure as vector graphics. In PowerPoint, right-click the figure → <i>Convert to Shape</i> to edit every element natively.</label>
            <label><input type="radio" checked={format === 'svg'} onChange={() => setFormat('svg')} /> <b>SVG</b> — vector; imports into PowerPoint, Word, Illustrator, Inkscape.</label>
            <label><input type="radio" checked={format === 'pdf'} onChange={() => setFormat('pdf')} /> <b>PDF</b> — vector; for journals and LaTeX.</label>
            <label><input type="radio" checked={format === 'png'} onChange={() => setFormat('png')} /> <b>PNG</b> — raster at high resolution.</label>
          </div>
          {format === 'png' && (
            <div className="field"><label>Resolution: {scale}× ({page.width * scale} × {page.height * scale} px)</label><input type="range" min={1} max={6} value={scale} onChange={(e) => setScale(Number(e.target.value))} /></div>
          )}
          {format !== 'pptx' && (
            <label className="check"><input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} /> Transparent background (omit page fill)</label>
          )}
        </div>
        <footer>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy} onClick={() => void run()}>{busy ? 'Exporting…' : 'Export'}</button>
        </footer>
      </div>
    </div>
  )
}
