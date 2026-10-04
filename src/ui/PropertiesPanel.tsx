import { ActiveSelection, FabricObject, Group, IText, Textbox } from 'fabric'
import { FlipHorizontal2, FlipVertical2, Lock, Unlock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { dataOf, flipSelection, setLocked } from '../canvas/commands'
import { useEditor } from '../canvas/editorStore'
import { iconDataOf, recolorIcon } from '../library/insert'
import { findItem } from '../library/registry'
import { protocolOf } from '../protocol/render'
import { ColorInput } from './ColorInput'

const FONTS = ['Helvetica', 'Arial', 'Times New Roman', 'Georgia', 'Courier New', 'Verdana', 'Trebuchet MS', 'Palatino', 'Futura', 'Gill Sans']

function Num({ label, value, onChange, step = 1, min, max }: { label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number }) {
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(Math.round(value * 100) / 100)), [value])
  const commit = () => {
    const n = Number(text)
    if (Number.isFinite(n)) onChange(min !== undefined && n < min ? min : max !== undefined && n > max ? max : n)
    else setText(String(value))
  }
  return (
    <div className="row">
      <label>{label}</label>
      <input type="number" step={step} min={min} max={max} value={text} onChange={(e) => setText(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && commit()} />
    </div>
  )
}

export function PropertiesPanel() {
  const canvas = useEditor((s) => s.canvas)
  const selection = useEditor((s) => s.selection)
  const version = useEditor((s) => s.selectionVersion)
  const page = useEditor((s) => s.page)
  const openDialog = useEditor((s) => s.openDialog)
  void version

  const activeObj = canvas?.getActiveObject()
  if (!canvas || selection.length === 0 || !activeObj) {
    return (
      <div className="props">
        <h4>Page</h4>
        <div className="row"><label>Size</label><span>{page.width} × {page.height} px</span></div>
        <div className="row"><label>Background</label><ColorInput value={page.background} onChange={(v) => v && useEditor.getState().setPage({ ...page, background: v })} /></div>
        <button className="btn" onClick={() => openDialog({ kind: 'page' })}>Page setup…</button>
        <h4>Tips</h4>
        <div className="hint">
          Click a library object to insert it, or drag it onto the canvas.<br />
          Double-click text to edit it. Double-click a timeline to edit stages and media.<br />
          Hold ⌘ and scroll to zoom; scroll to pan; hold Space and drag to pan.<br />
          Shift-drag constrains shapes and lines. Pink guides snap objects to each other.
        </div>
      </div>
    )
  }

  const active = activeObj as FabricObject
  const objs = selection.filter((o) => o.canvas === canvas)
  if (objs.length === 0) return null
  const single = objs.length === 1 ? objs[0]! : null
  const apply = (fn: (o: FabricObject) => void) => {
    for (const o of objs) fn(o)
    active.set('dirty', true)
    canvas.requestRenderAll()
    canvas.fire('object:modified', { target: active } as never)
    useEditor.getState().bumpSelection()
  }
  const first = objs[0]!
  const iconData = iconDataOf(single ?? undefined)
  const protocol = protocolOf(single ?? undefined)
  const isText = objs.every((o) => o instanceof IText)
  const anyText = objs.some((o) => o instanceof IText)
  const isPlainShape = !iconData && !protocol && !(first instanceof Group) && !(first instanceof ActiveSelection)
  const isConnector = dataOf(first)?.kind === 'connector'
  const locked = !!dataOf(first)?.locked
  const textObj = isText ? (first as Textbox) : null

  const bb = active.getBoundingRect()
  const fill = typeof first.fill === 'string' ? first.fill : ''
  const stroke = typeof first.stroke === 'string' ? first.stroke : ''
  const dash = first.strokeDashArray ? (first.strokeDashArray[0]! > first.strokeWidth * 2 ? 'dashed' : 'dotted') : 'solid'

  return (
    <div className="props">
      <h4>{objs.length > 1 ? `${objs.length} objects` : iconData ? findItem(iconData.libraryId ?? '')?.name ?? 'Icon' : protocol ? 'Differentiation timeline' : isText ? 'Text' : isConnector ? 'Connector' : first instanceof Group ? 'Group' : 'Shape'}</h4>

      {protocol && (
        <div className="btn-row">
          <button className="btn primary" onClick={() => openDialog({ kind: 'protocol', target: single! })}>Edit timeline…</button>
        </div>
      )}

      {iconData && (
        <>
          <div className="row"><label>Colour</label><ColorInput value={iconData.primaryColor ?? ''} onChange={(v) => apply((o) => recolorIcon(o, v, undefined))} /></div>
          {findItem(iconData.libraryId ?? '')?.svg.match(/#secondary/i) && (
            <div className="row"><label>Accent</label><ColorInput value={iconData.secondaryColor ?? ''} onChange={(v) => apply((o) => recolorIcon(o, undefined, v))} /></div>
          )}
        </>
      )}

      {(isPlainShape || isConnector || anyText) && (
        <>
          {!isConnector && (
            <div className="row"><label>{anyText ? 'Text colour' : 'Fill'}</label><ColorInput value={fill} allowNone={!anyText} onChange={(v) => apply((o) => o.set('fill', v || null))} /></div>
          )}
          <div className="row"><label>{isConnector ? 'Colour' : 'Stroke'}</label><ColorInput value={stroke} allowNone={!isConnector} onChange={(v) => apply((o) => {
            o.set('stroke', v || null)
            if (dataOf(o)?.kind === 'connector' && dataOf(o)?.arrow?.end) o.set('fill', v || null)
          })} /></div>
          <Num label="Stroke width" value={first.strokeWidth} min={0} max={40} step={0.5} onChange={(v) => apply((o) => o.set('strokeWidth', v))} />
          <div className="row">
            <label>Line style</label>
            <select value={dash} onChange={(e) => apply((o) => {
              const w = Math.max(1, o.strokeWidth)
              o.set('strokeDashArray', e.target.value === 'solid' ? null : e.target.value === 'dashed' ? [w * 3, w * 2] : [w, w * 1.5])
            })}>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </div>
          {single && 'rx' in single && typeof (single as { rx?: number }).rx === 'number' && single.type?.toLowerCase() === 'rect' && (
            <Num label="Corner radius" value={(single as { rx: number }).rx} min={0} onChange={(v) => apply((o) => o.set({ rx: v, ry: v }))} />
          )}
        </>
      )}

      {textObj && (
        <>
          <h4>Font</h4>
          <div className="row">
            <label>Family</label>
            <select value={textObj.fontFamily} onChange={(e) => apply((o) => o.set('fontFamily', e.target.value))}>
              {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <Num label="Size" value={textObj.fontSize} min={4} max={400} onChange={(v) => apply((o) => o.set('fontSize', v))} />
          <div className="row">
            <label>Style</label>
            <div className="btn-row">
              <button className={`btn${textObj.fontWeight === 'bold' ? ' primary' : ''}`} onClick={() => apply((o) => o.set('fontWeight', (o as Textbox).fontWeight === 'bold' ? 'normal' : 'bold'))}><b>B</b></button>
              <button className={`btn${textObj.fontStyle === 'italic' ? ' primary' : ''}`} onClick={() => apply((o) => o.set('fontStyle', (o as Textbox).fontStyle === 'italic' ? 'normal' : 'italic'))}><i>I</i></button>
              <button className={`btn${textObj.underline ? ' primary' : ''}`} onClick={() => apply((o) => o.set('underline', !(o as Textbox).underline))}><u>U</u></button>
            </div>
          </div>
          <div className="row">
            <label>Align</label>
            <select value={textObj.textAlign} onChange={(e) => apply((o) => o.set('textAlign', e.target.value))}>
              <option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option><option value="justify">Justify</option>
            </select>
          </div>
          <Num label="Line height" value={textObj.lineHeight} min={0.5} max={4} step={0.05} onChange={(v) => apply((o) => o.set('lineHeight', v))} />
          <div className="row">
            <label>Script</label>
            <div className="btn-row">
              <button className="btn" title="Superscript selected characters (e.g. Oct4+)" onClick={() => { const t = first as IText; if (t.isEditing) { t.setSuperscript(t.selectionStart, t.selectionEnd); canvas.requestRenderAll() } }}>x²</button>
              <button className="btn" title="Subscript selected characters" onClick={() => { const t = first as IText; if (t.isEditing) { t.setSubscript(t.selectionStart, t.selectionEnd); canvas.requestRenderAll() } }}>x₂</button>
              <span className="hint">(while editing)</span>
            </div>
          </div>
        </>
      )}

      <h4>Geometry</h4>
      <div className="row">
        <label>Position</label>
        <div className="pair">
          <input type="number" value={Math.round(bb.left)} onChange={(e) => apply(() => { active.set('left', active.left + Number(e.target.value) - bb.left); active.setCoords() })} />
          <input type="number" value={Math.round(bb.top)} onChange={(e) => apply(() => { active.set('top', active.top + Number(e.target.value) - bb.top); active.setCoords() })} />
        </div>
      </div>
      <div className="row">
        <label>Size</label>
        <div className="pair">
          <input type="number" value={Math.round(bb.width)} onChange={(e) => { const w = Number(e.target.value); if (w > 0) apply(() => { const k = w / bb.width; active.set({ scaleX: active.scaleX * k, scaleY: active.scaleY * k }); active.setCoords() }) }} />
          <input type="number" value={Math.round(bb.height)} onChange={(e) => { const h = Number(e.target.value); if (h > 0) apply(() => { const k = h / bb.height; active.set({ scaleX: active.scaleX * k, scaleY: active.scaleY * k }); active.setCoords() }) }} />
        </div>
      </div>
      <Num label="Rotation" value={active.angle} step={1} onChange={(v) => apply(() => { active.rotate(v); active.setCoords() })} />
      <div className="row">
        <label>Opacity</label>
        <input type="range" min={0} max={1} step={0.05} value={first.opacity} onChange={(e) => apply((o) => o.set('opacity', Number(e.target.value)))} />
      </div>
      <div className="btn-row">
        <button className="btn" title="Flip horizontal" onClick={() => flipSelection(canvas, 'x')}><FlipHorizontal2 /></button>
        <button className="btn" title="Flip vertical" onClick={() => flipSelection(canvas, 'y')}><FlipVertical2 /></button>
        <button className="btn" title={locked ? 'Unlock' : 'Lock position and size'} onClick={() => { setLocked(canvas, !locked); useEditor.getState().bumpSelection() }}>{locked ? <Unlock /> : <Lock />} {locked ? 'Unlock' : 'Lock'}</button>
      </div>
    </div>
  )
}
