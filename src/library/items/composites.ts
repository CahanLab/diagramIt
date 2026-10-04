import { cellClusterSvg } from '../generators/cellCluster'
import { dishWithCellsSvg } from '../generators/dish'
import { wellPlateSvg } from '../generators/wellPlate'
import type { LibraryItem } from '../types'

function cluster(id: string, name: string, count: number, primary: string, secondary: string, keywords: string[], seed = 7): LibraryItem {
  const g = cellClusterSvg({ count, seed })
  return { id, name, category: 'composites', keywords: ['cluster', 'population', 'cells', ...keywords], svg: g.svg, width: g.width, height: g.height, primary, secondary }
}

export const items: LibraryItem[] = [
  (() => {
    const g = dishWithCellsSvg({ view: 'top', colonies: 1, cellsPerColony: 12 })
    return { id: 'composites.ipscs-in-dish', name: 'iPSCs in dish', category: 'composites', keywords: ['ipsc', 'hipsc', 'colony', 'petri', 'dish', 'stem cell', 'culture'], svg: g.svg, width: g.width, height: g.height, primary: '#f6c6c6', secondary: '#c9a46b' } satisfies LibraryItem
  })(),
  (() => {
    const g = dishWithCellsSvg({ view: 'top', colonies: 5, cellsPerColony: 7 })
    return { id: 'composites.colonies-in-dish', name: 'Colonies in dish', category: 'composites', keywords: ['ipsc', 'colonies', 'petri', 'dish', 'culture'], svg: g.svg, width: g.width, height: g.height, primary: '#f6c6c6', secondary: '#c9a46b' } satisfies LibraryItem
  })(),
  (() => {
    const g = dishWithCellsSvg({ view: 'side', colonies: 3, cellsPerColony: 6 })
    return { id: 'composites.cells-in-dish-side', name: 'Cells in dish (side)', category: 'composites', keywords: ['petri', 'dish', 'side', 'culture', 'adherent'], svg: g.svg, width: g.width, height: g.height, primary: '#f6c6c6', secondary: '#c9a46b' } satisfies LibraryItem
  })(),
  cluster('composites.cell-cluster-9', 'Cell cluster (9)', 9, '#c9a46b', '#6b5230', ['ipsc', 'hipsc', 'colony', 'stem cell']),
  cluster('composites.cell-cluster-12', 'Cell cluster (12)', 12, '#bfb59a', '#4b4036', ['mesoderm', 'progenitor'], 11),
  cluster('composites.cell-cluster-16', 'Cell cluster (16)', 16, '#7a1f4d', '#3b0a24', ['intermediate', 'progenitor'], 5),
  cluster('composites.cell-cluster-6', 'Cell cluster (6)', 6, '#c8352d', '#5a1410', ['differentiated', 'podocyte'], 3),
  cluster('composites.cell-cluster-3', 'Cell cluster (3)', 3, '#a3c1e3', '#3f5f8f', ['few', 'sorted'], 2),
  ...([6, 12, 24, 96] as const).map((n) => {
    const g = wellPlateSvg(n)
    return { id: `composites.well-plate-${n}-filled`, name: `${n}-well plate (medium)`, category: 'composites', keywords: ['plate', 'well', `${n}`, 'medium', 'culture'], svg: g.svg, width: g.width, height: g.height, primary: '#f6c6c6', secondary: '#c084fc' } satisfies LibraryItem
  }),
]
