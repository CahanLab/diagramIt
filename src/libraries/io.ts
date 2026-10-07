import { downloadText } from '../export/download'
import { normalizeLibrary } from './normalize'
import { LIBRARY_FILE_SUFFIX, type CustomLibrary } from './types'

export function exportLibraryFile(lib: CustomLibrary): void {
  const { sourceUrl: _omit, ...file } = lib
  void _omit
  downloadText(JSON.stringify(file, null, 2), `${lib.manifest.id}${LIBRARY_FILE_SUFFIX}`, 'application/json')
}

export async function readLibraryFile(file: File): Promise<CustomLibrary> {
  return normalizeLibrary(await file.text())
}

export async function fetchLibrary(url: string, fetchFn: typeof fetch = fetch): Promise<CustomLibrary> {
  const res = await fetchFn(url, { mode: 'cors' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return normalizeLibrary(await res.text(), url)
}

export function libraryUrlsFromQuery(search: string): string[] {
  return new URLSearchParams(search).getAll('lib').filter((u) => /^https?:\/\//.test(u))
}

export type UrlLoadResult = { ok: true; url: string; library: CustomLibrary } | { ok: false; url: string; error: string }

/** Fetch every `?lib=` URL. Never throws; each result says what happened. */
export async function loadLibrariesFromQuery(search: string, fetchFn: typeof fetch = fetch): Promise<UrlLoadResult[]> {
  return Promise.all(
    libraryUrlsFromQuery(search).map(async (url): Promise<UrlLoadResult> => {
      try {
        return { ok: true, url, library: await fetchLibrary(url, fetchFn) }
      } catch (err) {
        return { ok: false, url, error: (err as Error).message }
      }
    }),
  )
}
