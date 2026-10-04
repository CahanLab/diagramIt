import type { LibraryItem } from '../types'

export const items: LibraryItem[] = [
  {
    id: 'cells.generic-cell',
    name: 'Cell',
    category: 'cells',
    keywords: ['cell', 'generic', 'round'],
    width: 80,
    height: 80,
    primary: '#c9a46b',
    secondary: '#6b5230',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 6c20 0 44 14 44 42S74 94 50 94 6 76 6 48 30 6 50 6z" fill="#PRIMARY" stroke="#1f2937" stroke-width="2.5"/><circle cx="50" cy="50" r="15" fill="#SECONDARY"/></svg>`,
  },
]
