/**
 * Undo/redo stack of opaque string snapshots.
 * `push` records the state *after* a change. `undo(current)` returns the
 * previous snapshot and remembers `current` for redo.
 */
export class History {
  private past: string[] = []
  private future: string[] = []
  constructor(private readonly limit = 100) {}

  push(snapshot: string): void {
    if (this.past[this.past.length - 1] === snapshot) return
    this.past.push(snapshot)
    if (this.past.length > this.limit) this.past.shift()
    this.future = []
  }

  /** Returns the snapshot to restore, or null if nothing to undo. */
  undo(current: string): string | null {
    // The top of `past` is the current state (pushed after the last change).
    if (this.past[this.past.length - 1] === current) this.past.pop()
    const prev = this.past.pop()
    if (prev === undefined) {
      // nothing to go back to; keep current as the base state
      this.past.push(current)
      return null
    }
    this.future.push(current)
    this.past.push(prev)
    return prev
  }

  redo(current: string): string | null {
    const next = this.future.pop()
    if (next === undefined) return null
    if (this.past[this.past.length - 1] !== current) this.past.push(current)
    this.past.push(next)
    return next
  }

  canUndo(): boolean {
    return this.past.length > 1
  }

  canRedo(): boolean {
    return this.future.length > 0
  }

  reset(initial: string): void {
    this.past = [initial]
    this.future = []
  }
}
