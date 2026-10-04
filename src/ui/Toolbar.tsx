import {
  AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignHorizontalDistributeCenter, AlignStartHorizontal, AlignStartVertical, AlignVerticalDistributeCenter,
  ArrowRight, BringToFront, Circle, Copy, CornerDownRight, Diamond, Group, Hand, Hexagon, Minus, MousePointer2, PenLine, Redo2, SendToBack, Square, SquareRoundCorner, Star, Trash2, Triangle, Type, Undo2, Ungroup, CalendarRange, GitBranch,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { alignSelection, deleteSelection, distributeSelection, duplicateSelection, groupSelection, reorder, ungroupSelection } from '../canvas/commands'
import { useEditor } from '../canvas/editorStore'
import { redo, undo } from '../canvas/FabricCanvas'
import type { ToolId } from '../canvas/types'

const TOOLS: { id: ToolId; label: string; key: string; Icon: ComponentType<{ size?: number }> }[] = [
  { id: 'select', label: 'Select', key: 'V', Icon: MousePointer2 },
  { id: 'pan', label: 'Pan', key: 'H', Icon: Hand },
  { id: 'text', label: 'Text', key: 'T', Icon: Type },
  { id: 'rect', label: 'Rectangle', key: 'R', Icon: Square },
  { id: 'roundRect', label: 'Rounded rectangle', key: 'U', Icon: SquareRoundCorner },
  { id: 'ellipse', label: 'Ellipse', key: 'O', Icon: Circle },
  { id: 'triangle', label: 'Triangle', key: '', Icon: Triangle },
  { id: 'diamond', label: 'Diamond', key: '', Icon: Diamond },
  { id: 'hexagon', label: 'Hexagon', key: '', Icon: Hexagon },
  { id: 'star', label: 'Star', key: '', Icon: Star },
  { id: 'line', label: 'Line', key: 'L', Icon: Minus },
  { id: 'arrow', label: 'Arrow', key: 'A', Icon: ArrowRight },
  { id: 'elbowArrow', label: 'Elbow arrow', key: 'E', Icon: CornerDownRight },
  { id: 'pen', label: 'Freehand pen', key: 'P', Icon: PenLine },
]

export function Toolbar() {
  const tool = useEditor((s) => s.tool)
  const setTool = useEditor((s) => s.setTool)
  const canvas = useEditor((s) => s.canvas)
  const page = useEditor((s) => s.page)
  const selection = useEditor((s) => s.selection)
  const canUndo = useEditor((s) => s.canUndo)
  const canRedo = useEditor((s) => s.canRedo)
  const openDialog = useEditor((s) => s.openDialog)
  const n = selection.length
  const one = n === 1 && selection[0]
  const isGroup = !!one && one.type === 'group' || (!!one && one.type === 'Group')

  return (
    <div className="toolbar">
      <div className="group">
        {TOOLS.map(({ id, label, key, Icon }) => (
          <button key={id} className={`tbtn${tool === id ? ' active' : ''}`} title={key ? `${label} (${key})` : label} onClick={() => setTool(id)}>
            <Icon size={18} />
          </button>
        ))}
      </div>
      <div className="group">
        <button className="tbtn wide" title="Insert differentiation timeline" onClick={() => openDialog({ kind: 'protocol' })}>
          <CalendarRange size={18} /> Timeline
        </button>
        <button className="tbtn wide" title="Insert developmental ontogeny (lineage graph)" onClick={() => openDialog({ kind: 'ontogeny' })}>
          <GitBranch size={18} /> Ontogeny
        </button>
      </div>
      <div className="group">
        <button className="tbtn" title="Undo (⌘Z)" disabled={!canUndo} onClick={() => void undo()}><Undo2 size={18} /></button>
        <button className="tbtn" title="Redo (⌘⇧Z)" disabled={!canRedo} onClick={() => void redo()}><Redo2 size={18} /></button>
      </div>
      <div className="group">
        <button className="tbtn" title="Duplicate (⌘D)" disabled={!n} onClick={() => canvas && void duplicateSelection(canvas)}><Copy size={18} /></button>
        <button className="tbtn" title="Delete (⌫)" disabled={!n} onClick={() => canvas && deleteSelection(canvas)}><Trash2 size={18} /></button>
        <button className="tbtn" title="Group (⌘G)" disabled={n < 2} onClick={() => canvas && groupSelection(canvas)}><Group size={18} /></button>
        <button className="tbtn" title="Ungroup (⌘⇧G)" disabled={!isGroup} onClick={() => canvas && ungroupSelection(canvas)}><Ungroup size={18} /></button>
        <button className="tbtn" title="Bring to front (⌘⇧])" disabled={!n} onClick={() => canvas && reorder(canvas, 'front')}><BringToFront size={18} /></button>
        <button className="tbtn" title="Send to back (⌘⇧[)" disabled={!n} onClick={() => canvas && reorder(canvas, 'back')}><SendToBack size={18} /></button>
      </div>
      <div className="group">
        <button className="tbtn" title="Align left" disabled={!n} onClick={() => canvas && alignSelection(canvas, 'left', page)}><AlignStartVertical size={18} /></button>
        <button className="tbtn" title="Align horizontal centre" disabled={!n} onClick={() => canvas && alignSelection(canvas, 'centerX', page)}><AlignCenterVertical size={18} /></button>
        <button className="tbtn" title="Align right" disabled={!n} onClick={() => canvas && alignSelection(canvas, 'right', page)}><AlignEndVertical size={18} /></button>
        <button className="tbtn" title="Align top" disabled={!n} onClick={() => canvas && alignSelection(canvas, 'top', page)}><AlignStartHorizontal size={18} /></button>
        <button className="tbtn" title="Align vertical centre" disabled={!n} onClick={() => canvas && alignSelection(canvas, 'centerY', page)}><AlignCenterHorizontal size={18} /></button>
        <button className="tbtn" title="Align bottom" disabled={!n} onClick={() => canvas && alignSelection(canvas, 'bottom', page)}><AlignEndHorizontal size={18} /></button>
        <button className="tbtn" title="Distribute horizontally" disabled={n < 3} onClick={() => canvas && distributeSelection(canvas, 'horizontal')}><AlignHorizontalDistributeCenter size={18} /></button>
        <button className="tbtn" title="Distribute vertically" disabled={n < 3} onClick={() => canvas && distributeSelection(canvas, 'vertical')}><AlignVerticalDistributeCenter size={18} /></button>
      </div>
    </div>
  )
}
