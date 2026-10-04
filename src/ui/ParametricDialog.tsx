import { useEffect, useMemo, useState } from 'react'
import { sceneCenter } from '../canvas/commands'
import { useEditor } from '../canvas/editorStore'
import { cellClusterSvg } from '../library/generators/cellCluster'
import { dishWithCellsSvg, type DishView } from '../library/generators/dish'
import { wellPlateSvg, type WellCount } from '../library/generators/wellPlate'
import { insertLibraryItem } from '../library/insert'
import type { LibraryItem } from '../library/types'
import { ColorInput } from './ColorInput'
import { IconPreview } from './IconPreview'

type Kind = 'cluster' | 'plate' | 'dish'

export function ParametricDialog({ onClose }: { onClose: () => void }) {
  const canvas = useEditor((s) => s.canvas)
  const [kind, setKind] = useState<Kind>('cluster')
  const [count, setCount] = useState(9)
  const [seed, setSeed] = useState(7)
  const [nuclei, setNuclei] = useState(true)
  const [primary, setPrimary] = useState('#c9a46b')
  const [secondary, setSecondary] = useState('#6b5230')
  const [wells, setWells] = useState<WellCount>(96)
  const [filledText, setFilledText] = useState('')
  const [view, setView] = useState<DishView>('top')
  const [colonies, setColonies] = useState(1)
  const [perColony, setPerColony] = useState(12)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (kind === 'cluster') { setPrimary('#c9a46b'); setSecondary('#6b5230') }
    if (kind === 'plate') { setPrimary('#f6c6c6'); setSecondary('#c084fc') }
    if (kind === 'dish') { setPrimary('#f6c6c6'); setSecondary('#c9a46b') }
  }, [kind])

  const item: LibraryItem = useMemo(() => {
    const g = kind === 'cluster'
      ? cellClusterSvg({ count, seed, nuclei })
      : kind === 'plate'
        ? wellPlateSvg(wells, { filled: filledText.split(/[\s,]+/).map(Number).filter((n) => Number.isInteger(n) && n > 0).map((n) => n - 1) })
        : dishWithCellsSvg({ view, colonies, cellsPerColony: perColony, seed })
    const name = kind === 'cluster' ? `Cell cluster (${count})` : kind === 'plate' ? `${wells}-well plate` : `Dish with cells`
    return { id: `composites.custom-${kind}`, name, category: 'composites', keywords: [], svg: g.svg, width: g.width, height: g.height, primary, secondary }
  }, [kind, count, seed, nuclei, wells, filledText, view, colonies, perColony, primary, secondary])

  const insert = async () => {
    if (!canvas) return
    const c = sceneCenter(canvas)
    await insertLibraryItem(canvas, item, { x: c.x, y: c.y }, { primary, secondary })
    onClose()
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal narrow">
        <header><span>Parametric object</span><button onClick={onClose} aria-label="Close">×</button></header>
        <div className="body">
          <div className="radio-list">
            <label><input type="radio" checked={kind === 'cluster'} onChange={() => setKind('cluster')} /> Cell cluster</label>
            <label><input type="radio" checked={kind === 'plate'} onChange={() => setKind('plate')} /> Well plate</label>
            <label><input type="radio" checked={kind === 'dish'} onChange={() => setKind('dish')} /> Dish with cells</label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: 10, background: 'var(--bg)', borderRadius: 8 }}>
            <div style={{ width: 160, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 160, height: 140 }} className="lib-item"><IconPreview item={item} primary={primary} secondary={secondary} /></div>
            </div>
          </div>
          {kind === 'cluster' && (
            <>
              <div className="field"><label>Number of cells: {count}</label><input type="range" min={1} max={40} value={count} onChange={(e) => setCount(Number(e.target.value))} /></div>
              <div className="grid2">
                <div className="field"><label>Arrangement seed</label><input type="number" value={seed} onChange={(e) => setSeed(Number(e.target.value))} /></div>
                <label className="check" style={{ alignSelf: 'end' }}><input type="checkbox" checked={nuclei} onChange={(e) => setNuclei(e.target.checked)} /> Nuclei</label>
              </div>
            </>
          )}
          {kind === 'plate' && (
            <div className="grid2">
              <div className="field"><label>Wells</label>
                <select value={wells} onChange={(e) => setWells(Number(e.target.value) as WellCount)}>
                  {[6, 12, 24, 48, 96, 384].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="field"><label>Highlight wells (1-based, row-major)</label><input value={filledText} placeholder="e.g. 1 2 3 13 14 15" onChange={(e) => setFilledText(e.target.value)} /></div>
            </div>
          )}
          {kind === 'dish' && (
            <div className="grid3">
              <div className="field"><label>View</label><select value={view} onChange={(e) => setView(e.target.value as DishView)}><option value="top">Top</option><option value="side">Side</option></select></div>
              <div className="field"><label>Colonies</label><input type="number" min={1} max={9} value={colonies} onChange={(e) => setColonies(Number(e.target.value))} /></div>
              <div className="field"><label>Cells per colony</label><input type="number" min={1} max={20} value={perColony} onChange={(e) => setPerColony(Number(e.target.value))} /></div>
            </div>
          )}
          <div className="grid2">
            <div className="field"><label>{kind === 'cluster' ? 'Cell colour' : 'Medium colour'}</label><div className="row"><ColorInput value={primary} onChange={(v) => v && setPrimary(v)} /></div></div>
            <div className="field"><label>{kind === 'cluster' ? 'Nucleus colour' : kind === 'plate' ? 'Highlight colour' : 'Cell colour'}</label><div className="row"><ColorInput value={secondary} onChange={(v) => v && setSecondary(v)} /></div></div>
          </div>
        </div>
        <footer>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => void insert()}>Insert</button>
        </footer>
      </div>
    </div>
  )
}
