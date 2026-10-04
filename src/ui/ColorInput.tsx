import { useEffect, useState } from 'react'

const PALETTE = ['#1f2937', '#6b7280', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#c9a46b', '#fde68a', '#bbf7d0', '#bfdbfe', '#e9d5ff', '#fbcfe8', '#fecaca']

function normalize(v: string): string | null {
  const s = v.trim()
  if (/^#[0-9a-f]{6}$/i.test(s)) return s.toLowerCase()
  if (/^#[0-9a-f]{3}$/i.test(s)) return ('#' + s.slice(1).split('').map((c) => c + c).join('')).toLowerCase()
  return null
}

export function ColorInput({ value, onChange, allowNone, showPalette }: { value: string; onChange: (v: string) => void; allowNone?: boolean; showPalette?: boolean }) {
  const isNone = !value
  const [text, setText] = useState(value)
  useEffect(() => setText(value), [value])
  const hex = normalize(value) ?? '#000000'
  return (
    <div className="color-input">
      <span className="swatch" style={{ background: isNone ? 'repeating-linear-gradient(45deg,#fff 0 4px,#ddd 4px 8px)' : hex }} title="Pick colour">
        <input type="color" value={hex} onChange={(e) => onChange(e.target.value)} />
      </span>
      <input
        className="hex"
        value={isNone ? '' : text}
        placeholder={isNone ? 'none' : '#rrggbb'}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          const n = normalize(text)
          if (n) onChange(n)
          else setText(value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        }}
      />
      {allowNone && (
        <button className={`none${isNone ? ' active' : ''}`} onClick={() => onChange('')} title="No fill / no stroke">
          none
        </button>
      )}
      {showPalette && (
        <div className="swatches">
          {PALETTE.map((c) => (
            <button key={c} style={{ background: c }} onClick={() => onChange(c)} title={c} />
          ))}
        </div>
      )}
    </div>
  )
}

export { PALETTE }
