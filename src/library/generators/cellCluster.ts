/** Deterministic pseudo-random generator (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface ClusterOpts {
  /** Number of cells (1–40). */
  count: number
  /** Cell radius in viewBox units (default 14). */
  radius?: number
  /** Show nuclei (#SECONDARY). */
  nuclei?: boolean
  /** Nucleus radius relative to cell radius (0.2–0.6). */
  nucleusRatio?: number
  seed?: number
  /** Overall spread; 1 = tight packing. */
  spread?: number
}

/**
 * A compact cluster of overlapping round cells (Nature-Protocols style cell population icon).
 * Cells are placed on a hexagonal-ish spiral with jitter so the result is organic but deterministic.
 */
export function cellClusterSvg(opts: ClusterOpts): { svg: string; width: number; height: number; cells: { x: number; y: number; r: number }[] } {
  const count = Math.max(1, Math.min(40, Math.round(opts.count)))
  const r = opts.radius ?? 14
  const random = rng(opts.seed ?? 7)
  const spread = (opts.spread ?? 1) * r * 1.45
  const cells: { x: number; y: number; r: number }[] = []
  // sunflower / phyllotaxis arrangement gives tight, round clusters
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const k = i + 0.5
    const dist = count === 1 ? 0 : spread * Math.sqrt(k / count) * Math.sqrt(count) * 0.62
    const ang = i * golden
    const jitter = r * 0.18
    cells.push({
      x: Math.cos(ang) * dist + (random() - 0.5) * jitter,
      y: Math.sin(ang) * dist + (random() - 0.5) * jitter,
      r: r * (0.92 + random() * 0.16),
    })
  }
  const minX = Math.min(...cells.map((c) => c.x - c.r)) - 3
  const maxX = Math.max(...cells.map((c) => c.x + c.r)) + 3
  const minY = Math.min(...cells.map((c) => c.y - c.r)) - 3
  const maxY = Math.max(...cells.map((c) => c.y + c.r)) + 3
  const W = maxX - minX
  const H = maxY - minY
  const nr = (opts.nucleusRatio ?? 0.38)
  const parts: string[] = []
  // Draw outer cells first so central ones overlap on top (sorted by distance desc)
  const order = [...cells].sort((a, b) => Math.hypot(b.x, b.y) - Math.hypot(a.x, a.y))
  for (const c of order) {
    parts.push(`<circle cx="${(c.x - minX).toFixed(2)}" cy="${(c.y - minY).toFixed(2)}" r="${c.r.toFixed(2)}" fill="#PRIMARY" stroke="#1f2937" stroke-width="2"/>`)
  }
  if (opts.nuclei ?? true) {
    for (const c of order) {
      parts.push(`<circle cx="${(c.x - minX).toFixed(2)}" cy="${(c.y - minY).toFixed(2)}" r="${(c.r * nr).toFixed(2)}" fill="#SECONDARY"/>`)
    }
  }
  const size = 90
  const scale = size / Math.max(W, H)
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(2)} ${H.toFixed(2)}">${parts.join('')}</svg>`,
    width: Math.round(W * scale),
    height: Math.round(H * scale),
    cells,
  }
}
