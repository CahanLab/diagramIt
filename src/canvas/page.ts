import type { PageSpec } from './types'

export const DEFAULT_PAGE: PageSpec = { width: 1600, height: 900, background: '#ffffff' }

export const PAGE_PRESETS: { label: string; width: number; height: number }[] = [
  { label: 'Slide 16:9 (1600 × 900)', width: 1600, height: 900 },
  { label: 'Slide 4:3 (1600 × 1200)', width: 1600, height: 1200 },
  { label: 'Figure single column (1000 × 800)', width: 1000, height: 800 },
  { label: 'Figure double column (2000 × 1200)', width: 2000, height: 1200 },
  { label: 'Square (1200 × 1200)', width: 1200, height: 1200 },
  { label: 'Wide timeline (2400 × 900)', width: 2400, height: 900 },
]

/** Zoom and viewport translation that fit the page inside a viewport with padding. */
export function fitZoom(
  viewport: { w: number; h: number },
  page: Pick<PageSpec, 'width' | 'height'>,
  padding = 40,
): { zoom: number; panX: number; panY: number } {
  const availW = Math.max(1, viewport.w - padding * 2)
  const availH = Math.max(1, viewport.h - padding * 2)
  const zoom = Math.min(availW / page.width, availH / page.height)
  const panX = (viewport.w - page.width * zoom) / 2
  const panY = (viewport.h - page.height * zoom) / 2
  return { zoom, panX, panY }
}

export function clampZoom(z: number): number {
  return Math.min(8, Math.max(0.05, z))
}
