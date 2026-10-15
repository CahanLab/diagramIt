/**
 * Camera lucida sketch geometry: pure functions behind the ink pen, stipple brush,
 * segmented line and eraser. No Fabric, no DOM.
 * Spec: docs/superpowers/specs/2026-10-15-lucida-sketch-tools-design.md
 */
export type Pt = [number, number]
export type DotStyle = 'dot' | 'ring' | 'tick'
/** x, y, size (diameter in px), angle in radians (ticks) */
export type Dot = [number, number, number, number]

export type SketchData =
  | { tool: 'pen' | 'polyline'; runs: Pt[][]; smooth: number }
  | { tool: 'stipple'; dots: Dot[]; style: DotStyle; size: number }

export const DOT_STYLES: readonly DotStyle[] = ['dot', 'ring', 'tick']
export const DOT_STYLE_LABELS: Record<DotStyle, string> = { dot: 'Dot', ring: 'Ring', tick: 'Tick' }

const f = (v: number): string => {
  const s = v.toFixed(2)
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s
}

/** Path data for runs: straight segments at smooth 0, a Catmull-Rom spline with handles scaled by `smooth` otherwise. */
export function runsPathD(runs: Pt[][], smooth: number): string {
  const t = Math.max(0, Math.min(1, smooth))
  const out: string[] = []
  for (const run of runs) {
    if (run.length === 0) continue
    if (run.length === 1) {
      out.push(`M${f(run[0]![0])} ${f(run[0]![1])}h0.01`)
      continue
    }
    if (t === 0 || run.length === 2) {
      out.push(run.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])} ${f(p[1])}`).join(''))
      continue
    }
    const at = (i: number): Pt => run[Math.min(run.length - 1, Math.max(0, i))]!
    let d = `M${f(run[0]![0])} ${f(run[0]![1])}`
    for (let i = 0; i < run.length - 1; i++) {
      const p0 = at(i - 1)
      const p1 = at(i)
      const p2 = at(i + 1)
      const p3 = at(i + 2)
      const c1: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * t, p1[1] + ((p2[1] - p0[1]) / 6) * t]
      const c2: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * t, p2[1] - ((p3[1] - p1[1]) / 6) * t]
      d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`
    }
    out.push(d)
  }
  return out.join('')
}

/** Path data for a dot cloud: filled discs (dot), stroked circles (ring) or short strokes along `angle` (tick). */
export function dotsPathD(dots: Dot[], style: DotStyle): string {
  const out: string[] = []
  for (const [x, y, size, angle] of dots) {
    const r = size / 2
    if (style === 'tick') {
      const l = size * 1.25
      const dx = Math.cos(angle) * l
      const dy = Math.sin(angle) * l
      out.push(`M${f(x - dx)} ${f(y - dy)}L${f(x + dx)} ${f(y + dy)}`)
    } else {
      out.push(`M${f(x - r)} ${f(y)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0z`)
    }
  }
  return out.join('')
}

export function sketchPathD(s: SketchData): string {
  return s.tool === 'stipple' ? dotsPathD(s.dots, s.style) : runsPathD(s.runs, s.smooth)
}

/** Fill, stroke and stroke width for a sketch drawn in `ink`. */
export function sketchPaint(s: SketchData, ink: string, width: number): { fill: string | null; stroke: string | null; strokeWidth: number } {
  if (s.tool !== 'stipple') return { fill: null, stroke: ink, strokeWidth: width }
  if (s.style === 'dot') return { fill: ink, stroke: null, strokeWidth: 0 }
  return { fill: null, stroke: ink, strokeWidth: Math.max(0.2, s.size * (s.style === 'ring' ? 0.3 : 0.45)) }
}

// ----------------------------------------------------------------- stipple

/** Deterministic PRNG (mulberry32). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** `n` dots uniformly in the disc, sizes ±25 %, tick angles ±20° around `angle`. */
export function scatterDots(rng: () => number, cx: number, cy: number, radius: number, n: number, size: number, angle: number): Dot[] {
  const out: Dot[] = []
  for (let i = 0; i < n; i++) {
    const r = radius * Math.sqrt(rng())
    const th = 2 * Math.PI * rng()
    const s = size * (0.75 + 0.5 * rng())
    const a = angle + (rng() - 0.5) * 0.7
    out.push([+(cx + r * Math.cos(th)).toFixed(2), +(cy + r * Math.sin(th)).toFixed(2), +s.toFixed(2), +a.toFixed(3)])
  }
  return out
}

/** Dots for a stamp (mouse down without movement): about half the density of a sweep over the disc. */
export function stampCount(density: number, radius: number): number {
  return Math.max(1, Math.round(((density / 100) * Math.PI * radius * radius) / 2))
}

/** Dots owed for a sweep of `distance` px with a brush of `radius`; the fraction is carried to the next call. */
export function sweepCount(density: number, radius: number, distance: number, carry: number): { n: number; carry: number } {
  const expected = (density / 100) * 2 * radius * distance + carry
  const n = Math.floor(expected)
  return { n, carry: expected - n }
}

// ----------------------------------------------------------------- erasing

const inside = (p: Pt, c: Pt, r: number): boolean => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 <= r * r

/** Remove the points inside the circle; runs split where points went; runs shorter than two points are dropped. */
export function eraseRuns(runs: Pt[][], c: Pt, r: number): { runs: Pt[][]; changed: boolean } {
  const out: Pt[][] = []
  let changed = false
  for (const run of runs) {
    let cur: Pt[] = []
    for (const p of run) {
      if (inside(p, c, r)) {
        changed = true
        if (cur.length >= 2) out.push(cur)
        cur = []
      } else cur.push(p)
    }
    if (cur.length >= 2) out.push(cur)
    else if (cur.length === 1 && run.length === 1 && !changed) out.push(cur)
    else if (cur.length === 1) changed = true
  }
  return { runs: out, changed }
}

export function eraseDots(dots: Dot[], c: Pt, r: number): { dots: Dot[]; changed: boolean } {
  const kept = dots.filter((d) => !inside([d[0], d[1]], c, r))
  return { dots: kept, changed: kept.length !== dots.length }
}

/** Fabric's simplified path commands (absolute M, L, C, Q and Z). */
export type PathCmd = (string | number)[]

/** Split a command list into subpaths, each starting at its M. */
export function splitSubpaths(cmds: PathCmd[]): PathCmd[][] {
  const out: PathCmd[][] = []
  for (const c of cmds) {
    if (c[0] === 'M' || out.length === 0) out.push([])
    out[out.length - 1]!.push(c)
  }
  return out
}

/** Points of one subpath (curves sampled at 8 steps) and whether it closes with Z. */
export function flattenSubpath(sub: PathCmd[]): { points: Pt[]; closed: boolean } {
  const pts: Pt[] = []
  let closed = false
  let cur: Pt = [0, 0]
  const num = (v: string | number | undefined): number => Number(v ?? 0)
  for (const c of sub) {
    switch (c[0]) {
      case 'M':
      case 'L':
        cur = [num(c[1]), num(c[2])]
        pts.push(cur)
        break
      case 'C': {
        const [x1, y1, x2, y2, x, y] = [num(c[1]), num(c[2]), num(c[3]), num(c[4]), num(c[5]), num(c[6])]
        const p0 = cur
        for (let i = 1; i <= 8; i++) {
          const t = i / 8
          const u = 1 - t
          pts.push([u * u * u * p0[0] + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x, u * u * u * p0[1] + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y])
        }
        cur = [x, y]
        break
      }
      case 'Q': {
        const [x1, y1, x, y] = [num(c[1]), num(c[2]), num(c[3]), num(c[4])]
        const p0 = cur
        for (let i = 1; i <= 8; i++) {
          const t = i / 8
          const u = 1 - t
          pts.push([u * u * p0[0] + 2 * u * t * x1 + t * t * x, u * u * p0[1] + 2 * u * t * y1 + t * t * y])
        }
        cur = [x, y]
        break
      }
      case 'Z':
      case 'z':
        closed = true
        break
    }
  }
  return { points: pts, closed }
}

export function commandsFromRuns(runs: Pt[][]): PathCmd[] {
  const out: PathCmd[] = []
  for (const run of runs) {
    run.forEach((p, i) => out.push([i ? 'L' : 'M', +p[0].toFixed(2), +p[1].toFixed(2)]))
    if (run.length === 1) out.push(['L', +(run[0]![0] + 0.01).toFixed(2), +run[0]![1].toFixed(2)])
  }
  return out
}

export function commandsToD(cmds: PathCmd[]): string {
  return cmds.map((c) => `${c[0]}${c.slice(1).map((v) => f(Number(v))).join(' ')}`).join('')
}

/**
 * Erase a circle from a command list: subpaths untouched by the circle keep their
 * commands (curves intact); touched subpaths are flattened and re-emitted as runs.
 */
export function eraseCommands(cmds: PathCmd[], c: Pt, r: number): { cmds: PathCmd[]; changed: boolean } {
  const out: PathCmd[] = []
  let changed = false
  for (const sub of splitSubpaths(cmds)) {
    const { points, closed } = flattenSubpath(sub)
    if (!points.some((p) => inside(p, c, r))) {
      out.push(...sub)
      continue
    }
    changed = true
    const pts = closed && points.length > 2 ? [...points, points[0]!] : points
    const { runs } = eraseRuns([pts], c, r)
    out.push(...commandsFromRuns(runs))
  }
  return { cmds: out, changed }
}
