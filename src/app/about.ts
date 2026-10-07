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
  licenseName: 'PolyForm Noncommercial 1.0.0',
  licenseUrl: 'https://github.com/CahanLab/diagramIt/blob/master/LICENSE.md',
  /** Shown in Help ▸ About and in README.md; keep the two in step. */
  termsOfUse:
    'Anyone, including commercial organisations, may use the hosted app to make figures. Figures you make are yours to use however you like; an acknowledgement is appreciated but not required.',
  licenseSummary:
    'The source code is free to use, modify and share for noncommercial purposes (academic, nonprofit, government and personal). Commercial use of the code needs a separate licence from the author.',
} as const

/** Version injected by Vite from package.json (see vite.config.ts). */
export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev'

export function acknowledgement(version = APP_VERSION): string {
  return `Figure created with DiagramIt v${version} (Cahan Lab; ${ABOUT.appUrl}).`
}
