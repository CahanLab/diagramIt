import { useMemo } from 'react'
import { applyColors } from '../library/color'
import type { LibraryItem } from '../library/types'

export function IconPreview({ item, primary, secondary }: { item: LibraryItem; primary?: string; secondary?: string }) {
  const html = useMemo(() => applyColors(item.svg, primary ?? item.primary, secondary ?? item.secondary), [item, primary, secondary])
  return <div className="preview" dangerouslySetInnerHTML={{ __html: html }} />
}
