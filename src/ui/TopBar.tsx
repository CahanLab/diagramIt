import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useEditor } from '../canvas/editorStore'

export function Menu({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])
  return (
    <div className={`menu${open ? ' open' : ''}`} ref={ref}>
      <button onClick={() => setOpen((o) => !o)}>{label} <ChevronDown size={12} /></button>
      {open && <div className="menu-list" onClick={() => setOpen(false)}>{children}</div>}
    </div>
  )
}

export function MenuItem({ label, shortcut, onClick, disabled }: { label: string; shortcut?: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}><span>{label}</span>{shortcut && <kbd>{shortcut}</kbd>}</button>
  )
}

export function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden><circle cx="16" cy="16" r="14" fill="#2563eb" /><circle cx="12" cy="13" r="3.5" fill="#fff" /><circle cx="20" cy="13" r="3.5" fill="#fff" /><circle cx="16" cy="20" r="3.5" fill="#fff" /></svg>
  )
}

export function DocName({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const dirty = useEditor((s) => s.dirty)
  return (
    <input className="doc-name" value={value} onChange={(e) => onChange(e.target.value)} title="Document name (used for export file names)" placeholder="Untitled" style={{ fontWeight: 600 }} data-dirty={dirty} />
  )
}
