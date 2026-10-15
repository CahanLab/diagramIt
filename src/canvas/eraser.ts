/**
 * Vector eraser for the camera lucida sketch tools: removes the parts of paths that fall
 * inside a circle, in place, for sketch strokes and for any path on the canvas including
 * the children of icon groups.
 * Spec: docs/superpowers/specs/2026-10-15-lucida-sketch-tools-design.md
 */
import { Group, Path, Point, util, type Canvas, type FabricObject } from 'fabric'
import { rerenderSketch, setPathInPlace } from './brushes'
import { dataOf, isPage } from './commands'
import { commandsToD, eraseCommands, eraseDots, eraseRuns, type PathCmd, type Pt } from './sketch'
import type { ObjectData } from './types'

/** Erase a scene-space circle from every path it touches. Returns true when something changed. */
export function eraseAt(canvas: Canvas, p: { x: number; y: number }, radius: number): boolean {
  let changed = false
  const visit = (objs: FabricObject[], parent: Group | null) => {
    for (const o of [...objs]) {
      if (isPage(o) || dataOf(o)?.locked) continue
      if (o instanceof Group) {
        visit(o.getObjects(), o)
        continue
      }
      if (!(o instanceof Path)) continue
      const data = dataOf(o)
      if (!data?.sketch && !o.stroke) continue // fill-only shapes are left alone
      const bb = o.getBoundingRect()
      if (p.x < bb.left - radius || p.x > bb.left + bb.width + radius || p.y < bb.top - radius || p.y > bb.top + bb.height + radius) continue
      // circle in the path's own coordinate space
      const inv = util.invertTransform(o.calcTransformMatrix())
      const local = util.transformPoint(new Point(p.x, p.y), inv)
      const scale = Math.sqrt(Math.abs(inv[0] * inv[3] - inv[1] * inv[2])) || 1
      const c: Pt = [local.x + o.pathOffset.x, local.y + o.pathOffset.y]
      const r = radius * scale
      let empty = false
      if (data?.sketch) {
        const s = data.sketch
        if (s.tool === 'stipple') {
          const res = eraseDots(s.dots, c, r)
          if (!res.changed) continue
          s.dots = res.dots
          empty = res.dots.length === 0
        } else {
          const res = eraseRuns(s.runs, c, r)
          if (!res.changed) continue
          s.runs = res.runs
          empty = res.runs.length === 0
        }
        if (!empty) {
          o.set('data', { ...data, sketch: s } satisfies ObjectData)
          rerenderSketch(o)
        }
      } else {
        const res = eraseCommands(o.path as unknown as PathCmd[], c, r)
        if (!res.changed) continue
        empty = res.cmds.length === 0
        if (!empty) setPathInPlace(o, commandsToD(res.cmds))
      }
      changed = true
      if (empty) {
        if (parent) parent.remove(o)
        else canvas.remove(o)
      }
      if (parent) {
        parent.set('dirty', true)
        parent.setCoords()
      }
    }
  }
  visit(canvas.getObjects(), null)
  if (changed) canvas.requestRenderAll()
  return changed
}
