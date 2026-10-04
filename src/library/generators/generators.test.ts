import { describe, expect, it } from 'vitest'
import { cellClusterSvg } from './cellCluster'
import { dishWithCellsSvg } from './dish'
import { wellPlateSvg } from './wellPlate'
import { validateItem } from '../validate'

const asItem = (id: string, g: { svg: string; width: number; height: number }) => ({ id, name: id, category: 'composites' as const, keywords: [], primary: '#ff0000', secondary: '#00ff00', ...g })

describe('wellPlateSvg', () => {
  it('draws the right number of wells', () => {
    expect(wellPlateSvg(96).svg.match(/<circle/g)).toHaveLength(96)
    expect(wellPlateSvg(6).svg.match(/<circle/g)).toHaveLength(6)
    // 384 uses rounded squares: 384 well rects + 2 body rects
    expect(wellPlateSvg(384).svg.match(/<rect/g)).toHaveLength(386)
  })
  it('marks filled wells with #SECONDARY', () => {
    expect(wellPlateSvg(12, { filled: [0, 1] }).svg.match(/#SECONDARY/g)).toHaveLength(2)
  })
  it('validates as a library item', () => {
    expect(validateItem(asItem('composites.plate', wellPlateSvg(24)))).toEqual([])
  })
})

describe('cellClusterSvg', () => {
  it('draws count cells plus nuclei, deterministically for a seed', () => {
    const a = cellClusterSvg({ count: 7, seed: 1 })
    const b = cellClusterSvg({ count: 7, seed: 1 })
    expect(a.svg).toBe(b.svg)
    expect(a.svg.match(/<circle/g)).toHaveLength(14)
    expect(cellClusterSvg({ count: 7, nuclei: false }).svg.match(/<circle/g)).toHaveLength(7)
  })
  it('clamps count into 1..40 and produces finite geometry', () => {
    expect(cellClusterSvg({ count: 0 }).cells).toHaveLength(1)
    expect(cellClusterSvg({ count: 999 }).cells).toHaveLength(40)
    const g = cellClusterSvg({ count: 12 })
    expect(g.width).toBeGreaterThan(0)
    expect(g.height).toBeGreaterThan(0)
    expect(validateItem(asItem('composites.cluster', g))).toEqual([])
  })
})

describe('dishWithCellsSvg', () => {
  it('produces valid items for both views', () => {
    expect(validateItem(asItem('composites.dish-top', dishWithCellsSvg({ view: 'top', colonies: 3, cellsPerColony: 8 })))).toEqual([])
    expect(validateItem(asItem('composites.dish-side', dishWithCellsSvg({ view: 'side', colonies: 2, cellsPerColony: 8 })))).toEqual([])
  })
})
