/** Facts shown in Help ▸ About and used for the acknowledgement text. */
export const ABOUT = {
  summary:
    'DiagramIt is a free, browser-based editor for publication-quality schematics of experiments, protocols and developmental lineages, with exports that stay editable in PowerPoint.',
  author: 'Patrick Cahan',
  lab: 'Cahan Lab',
  labUrl: 'https://cahanlab.org/',
  appUrl: 'https://cahanlab.github.io/diagramIt/',
  repoUrl: 'https://github.com/CahanLab/diagramIt',
  issuesUrl: 'https://github.com/CahanLab/diagramIt/issues',
  year: 2026,
  licenseName: 'MIT',
  licenseUrl: 'https://github.com/CahanLab/diagramIt/blob/master/LICENSE',
  /** Shown in Help ▸ About and in README.md; keep the two in step. */
  termsOfUse:
    'Anyone, including commercial organisations, may use the hosted app to make figures. Figures you make are yours to use however you like; an acknowledgement is appreciated but not required.',
  licenseSummary:
    'The source code is open source under the MIT licence: free to use, modify, share and build on for any purpose, provided the copyright notice is kept.',
} as const

/** Version injected by Vite from package.json (see vite.config.ts). */
export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev'

export interface LibraryCredit {
  name: string
  author: string
  /** Verbatim clause supplied by the library author; replaces the generated one. */
  acknowledgement?: string
}

/** Suggested acknowledgement sentence, crediting any custom libraries the figure uses. */
export function acknowledgement(version = APP_VERSION, libraries: LibraryCredit[] = []): string {
  const base = `Figure created with DiagramIt v${version} (Cahan Lab; ${ABOUT.appUrl})`
  if (!libraries.length) return `${base}.`
  const clauses = libraries.map((l) => l.acknowledgement?.trim() || `the ${l.name}${/librar(y|ies)$/i.test(l.name.trim()) ? '' : ' library'} by ${l.author}`)
  const list = clauses.length === 1 ? clauses[0]! : `${clauses.slice(0, -1).join(', ')} and ${clauses[clauses.length - 1]}`
  return `${base}, using ${list}.`
}
