import { Path, type FabricObject } from 'fabric'
import { rerenderSketch } from '../canvas/brushes'
import { dataOf } from '../canvas/commands'
import { useEditor } from '../canvas/editorStore'
import { DOT_STYLES, DOT_STYLE_LABELS, type DotStyle } from '../canvas/sketch'
import type { ToolId } from '../canvas/types'
import { ColorInput } from './ColorInput'

function Range({ label, value, min, max, step, onChange, unit = '' }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit?: string }) {
  return (
    <div className="row">
      <label>{label}</label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span className="range-value">{Math.round(value * 100) / 100}{unit}</span>
    </div>
  )
}

/** Settings of the active sketch tool (shown while nothing is selected). */
export function SketchToolOptions({ tool }: { tool: ToolId }) {
  const sketch = useEditor((s) => s.sketch)
  const set = useEditor((s) => s.setSketch)
  const ink = <div className="row"><label>Ink</label><ColorInput value={sketch.ink} onChange={(v) => v && set({ ink: v })} /></div>
  switch (tool) {
    case 'pen':
      return (
        <>
          <h4>Ink pen</h4>
          {ink}
          <Range label="Width" value={sketch.penWidth} min={0.3} max={12} step={0.1} unit=" px" onChange={(v) => set({ penWidth: v })} />
          <Range label="Smoothing" value={sketch.penSmooth} min={0} max={1} step={0.05} onChange={(v) => set({ penSmooth: v })} />
          <div className="hint">Drag to draw. Hold Shift for a straight line. Smoothing can be changed afterwards from the stroke's properties.</div>
        </>
      )
    case 'stipple':
      return (
        <>
          <h4>Stipple brush</h4>
          {ink}
          <Range label="Radius" value={sketch.brushRadius} min={2} max={80} step={1} unit=" px" onChange={(v) => set({ brushRadius: v })} />
          <Range label="Density" value={sketch.dotDensity} min={0.5} max={20} step={0.5} onChange={(v) => set({ dotDensity: v })} />
          <Range label="Dot size" value={sketch.dotSize} min={0.4} max={8} step={0.1} unit=" px" onChange={(v) => set({ dotSize: v })} />
          <div className="row">
            <label>Dot style</label>
            <select value={sketch.dotStyle} onChange={(e) => set({ dotStyle: e.target.value as DotStyle })}>
              {DOT_STYLES.map((d) => <option key={d} value={d}>{DOT_STYLE_LABELS[d]}</option>)}
            </select>
          </div>
          <div className="hint">Density is dots per 100 px² swept; a click stamps a cloud. Ticks follow the direction of the stroke.</div>
        </>
      )
    case 'polyline':
      return (
        <>
          <h4>Segmented line</h4>
          {ink}
          <Range label="Width" value={sketch.penWidth} min={0.3} max={12} step={0.1} unit=" px" onChange={(v) => set({ penWidth: v })} />
          <div className="hint">Click to add points, double-click or Enter to finish, Escape to cancel; Shift snaps a segment to 45°. Smooth the line afterwards from its properties.</div>
        </>
      )
    case 'eraser':
      return (
        <>
          <h4>Eraser</h4>
          <Range label="Radius" value={sketch.eraserRadius} min={2} max={80} step={1} unit=" px" onChange={(v) => set({ eraserRadius: v })} />
          <div className="hint">Drag over sketch marks or icon lines to erase them. Ungroup an icon (⌘⇧G) to move or delete its parts individually.</div>
        </>
      )
    default:
      return null
  }
}

/** Properties of selected sketch objects. */
export function SketchObjectOptions({ objs, apply }: { objs: FabricObject[]; apply: (fn: (o: FabricObject) => void) => void }) {
  const first = objs[0]!
  const s = dataOf(first)?.sketch
  if (!s) return null
  const same = objs.every((o) => dataOf(o)?.sketch?.tool === s.tool)
  const ink = (typeof first.stroke === 'string' && first.stroke) || (typeof first.fill === 'string' && first.fill) || ''
  const rerender = (fn: (o: Path) => void) => apply((o) => { if (o instanceof Path) fn(o) })
  return (
    <>
      <div className="row"><label>Ink</label><ColorInput value={ink} onChange={(v) => v && rerender((o) => rerenderSketch(o, v))} /></div>
      {same && s.tool !== 'stipple' && (
        <>
          <Range label="Width" value={first.strokeWidth} min={0.3} max={12} step={0.1} unit=" px" onChange={(v) => rerender((o) => rerenderSketch(o, undefined, v))} />
          <Range label="Smoothing" value={s.smooth} min={0} max={1} step={0.05} onChange={(v) => rerender((o) => {
            const d = dataOf(o)
            if (!d?.sketch || d.sketch.tool === 'stipple') return
            o.set('data', { ...d, sketch: { ...d.sketch, smooth: v } })
            rerenderSketch(o)
          })} />
        </>
      )}
      {same && s.tool === 'stipple' && (
        <>
          <Range label="Dot size" value={s.size} min={0.4} max={8} step={0.1} unit=" px" onChange={(v) => rerender((o) => {
            const d = dataOf(o)
            if (!d?.sketch || d.sketch.tool !== 'stipple') return
            const k = v / (d.sketch.size || 1)
            o.set('data', { ...d, sketch: { ...d.sketch, size: v, dots: d.sketch.dots.map(([x, y, sz, a]): [number, number, number, number] => [x, y, +(sz * k).toFixed(2), a]) } })
            rerenderSketch(o)
          })} />
          <div className="row">
            <label>Dot style</label>
            <select value={s.style} onChange={(e) => rerender((o) => {
              const d = dataOf(o)
              if (!d?.sketch || d.sketch.tool !== 'stipple') return
              o.set('data', { ...d, sketch: { ...d.sketch, style: e.target.value as DotStyle } })
              rerenderSketch(o)
            })}>
              {DOT_STYLES.map((d) => <option key={d} value={d}>{DOT_STYLE_LABELS[d]}</option>)}
            </select>
          </div>
        </>
      )}
    </>
  )
}
