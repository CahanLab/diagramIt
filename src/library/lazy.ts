import type { StyledRendering } from './types'

/** A styled rendering whose SVG is produced on first access and cached (stippled styles are expensive to render for 74 icons at startup). */
export function lazyRendering(render: () => string, primary: string, secondary?: string): StyledRendering {
  let cached: string | undefined
  const r = {
    primary,
    get svg(): string {
      if (cached === undefined) cached = render()
      return cached
    },
  } as StyledRendering
  if (secondary) r.secondary = secondary
  return r
}
