import { useMemo } from 'react'
import { applyColors } from '../library/color'
import { renderingFor } from '../library/registry'
import type { DrawingStyle, LibraryItem } from '../library/types'

export function IconPreview({ item, primary, secondary, style = 'basic' }: { item: LibraryItem; primary?: string; secondary?: string; style?: DrawingStyle }) {
  const html = useMemo(() => {
    const r = renderingFor(item, style)
    return applyColors(r.svg, primary ?? r.primary, secondary ?? r.secondary)
  }, [item, primary, secondary, style])
  return <div className="preview" dangerouslySetInnerHTML={{ __html: html }} />
}
