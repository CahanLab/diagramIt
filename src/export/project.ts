import type { Canvas } from 'fabric'
import { ensurePage, restore, SERIALIZE_PROPS } from '../canvas/commands'
import { DEFAULT_PAGE } from '../canvas/page'
import type { PageSpec } from '../canvas/types'

export interface ProjectFile {
  app: 'diagramit'
  version: 1
  name: string
  page: PageSpec
  canvas: Record<string, unknown>
  savedAt: string
}

export function serializeProject(canvas: Canvas, page: PageSpec, name: string): string {
  const file: ProjectFile = {
    app: 'diagramit',
    version: 1,
    name,
    page,
    canvas: canvas.toObject(SERIALIZE_PROPS) as Record<string, unknown>,
    savedAt: new Date().toISOString(),
  }
  return JSON.stringify(file)
}

/** Validate/normalise a parsed JSON value into a ProjectFile; throws on wrong format. */
export function normalizeProjectJson(raw: unknown): ProjectFile {
  if (!raw || typeof raw !== 'object') throw new Error('Not a DiagramIt project file')
  const r = raw as Record<string, unknown>
  if (r.app !== 'diagramit') throw new Error('Not a DiagramIt project file (missing app tag)')
  const pageRaw = (r.page ?? {}) as Partial<PageSpec>
  const page: PageSpec = {
    width: num(pageRaw.width, DEFAULT_PAGE.width),
    height: num(pageRaw.height, DEFAULT_PAGE.height),
    background: typeof pageRaw.background === 'string' ? pageRaw.background : DEFAULT_PAGE.background,
  }
  const canvas = (r.canvas && typeof r.canvas === 'object' ? r.canvas : { objects: [] }) as Record<string, unknown>
  if (!Array.isArray(canvas.objects)) canvas.objects = []
  // Unknown data kinds are tolerated: objects simply load as plain shapes.
  return {
    app: 'diagramit',
    version: 1,
    name: typeof r.name === 'string' ? r.name : 'Untitled',
    page,
    canvas,
    savedAt: typeof r.savedAt === 'string' ? r.savedAt : new Date(0).toISOString(),
  }
}

function num(v: unknown, d: number): number {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : d
}

export async function loadProject(canvas: Canvas, file: ProjectFile): Promise<void> {
  await restore(canvas, JSON.stringify(file.canvas), file.page)
  ensurePage(canvas, file.page)
}

export const AUTOSAVE_KEY = 'diagramit.autosave.v1'
