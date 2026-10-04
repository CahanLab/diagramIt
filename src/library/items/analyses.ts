import type { LibraryItem } from '../types'

/** Shared stroke attributes. */
const S = 'stroke="#1f2937" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"'
const S2 = 'stroke="#1f2937" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"'
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
/** L-shaped axes used by most plots. */
const AXES = `<path d="M14 8V86H92" fill="none" ${S}/>`

const BLUE = '#3b82f6'
const ORANGE = '#f97316'
const SLATE = '#64748b'

function gearPoints(cx: number, cy: number, rOuter: number, rInner: number, teeth: number): string {
  const pts: string[] = []
  const n = teeth * 4
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    const r = i % 4 < 2 ? rOuter : rInner
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

function dots(coords: Array<[number, number]>, fill: string, r = 4.5): string {
  return coords.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${S2}/>`).join('')
}

function item(
  id: string,
  name: string,
  keywords: string[],
  svg: string,
  opts: { primary?: string; secondary?: string; width?: number; height?: number } = {},
): LibraryItem {
  return {
    id: `analyses.${id}`,
    name,
    category: 'analyses',
    keywords,
    width: opts.width ?? 90,
    height: opts.height ?? 90,
    primary: opts.primary ?? BLUE,
    secondary: opts.secondary ?? ORANGE,
    svg,
  }
}

export const items: LibraryItem[] = [
  // ---------------------------------------------------------------- plots
  item('heatmap', 'Heatmap', ['heatmap', 'heat map', 'clustered heatmap', 'expression matrix', 'dendrogram'],
    `${SVG}<path d="M22 32V22H38V32M70 32V24H86V32M54 32V16H78V24M30 22V8H66V16" fill="none" ${S2}/>` +
    `<path d="M14 34h16v14h-16zM46 34h16v14h-16zM62 34h16v14h-16zM14 48h16v14h-16zM30 48h16v14h-16zM78 62h16v14h-16zM62 62h16v14h-16zM46 76h16v14h-16zM62 76h16v14h-16z" fill="#PRIMARY"/>` +
    `<path d="M30 34h16v14h-16zM78 34h16v14h-16zM62 48h16v14h-16zM78 48h16v14h-16zM14 62h16v14h-16zM30 76h16v14h-16zM14 76h16v14h-16zM30 62h16v14h-16z" fill="#SECONDARY"/>` +
    `<path d="M46 48h16v14h-16zM46 62h16v14h-16zM78 76h16v14h-16z" fill="#e5e7eb"/>` +
    `<path d="M14 34h80v56h-80zM14 48h80M14 62h80M14 76h80M30 34v56M46 34v56M62 34v56M78 34v56" fill="none" stroke="#ffffff" stroke-width="1.5"/>` +
    `<rect x="14" y="34" width="80" height="56" fill="none" ${S2}/></svg>`),

  item('umap-scatter', 'UMAP', ['umap', 'embedding', 'scatter', 'clusters', 'single cell', 'dimensionality reduction'],
    `${SVG}<path d="M12 88V62M12 88H38M9 66l3-6 3 6M34 85l6 3-6 3" fill="none" ${S}/>` +
    dots([[28, 24], [36, 18], [42, 28], [30, 34], [38, 38], [46, 20]], '#PRIMARY') +
    dots([[66, 30], [74, 24], [80, 34], [68, 42], [76, 46], [86, 44]], '#SECONDARY') +
    dots([[50, 68], [58, 62], [64, 72], [54, 78], [46, 58]], '#9ca3af') + `</svg>`),

  item('tsne-scatter', 't-SNE', ['tsne', 't-sne', 'embedding', 'scatter', 'clusters', 'dimensionality reduction'],
    `${SVG}<rect x="6" y="6" width="88" height="88" rx="3" fill="#ffffff" ${S}/>` +
    dots([[22, 24], [30, 18], [34, 28], [24, 34], [32, 38]], '#PRIMARY') +
    dots([[70, 22], [78, 18], [82, 28], [72, 32]], '#SECONDARY') +
    dots([[26, 72], [34, 66], [38, 76], [30, 82]], '#9ca3af') +
    dots([[66, 64], [74, 58], [80, 68], [70, 74], [78, 78], [62, 74]], '#6b7280') + `</svg>`),

  item('pca-plot', 'PCA plot', ['pca', 'principal component', 'scatter', 'pc1', 'pc2'],
    `${SVG}${AXES}` +
    `<ellipse cx="38" cy="36" rx="22" ry="12" transform="rotate(-25 38 36)" fill="#PRIMARY" fill-opacity="0.25"/>` +
    `<ellipse cx="68" cy="62" rx="22" ry="12" transform="rotate(-25 68 62)" fill="#SECONDARY" fill-opacity="0.25"/>` +
    dots([[26, 44], [32, 32], [40, 40], [44, 28], [50, 32]], '#PRIMARY', 4) +
    dots([[56, 70], [62, 58], [70, 66], [74, 54], [80, 60]], '#SECONDARY', 4) + `</svg>`),

  item('volcano-plot', 'Volcano plot', ['volcano', 'differential expression', 'deg', 'fold change', 'p-value', 'scatter'],
    `${SVG}${AXES}` +
    `<path d="M20 48H92M38 10V86M66 10V86" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-dasharray="4 3"/>` +
    dots([[52, 80], [46, 76], [58, 76], [42, 68], [62, 68], [48, 70], [56, 70], [44, 60], [60, 62], [40, 56], [64, 58], [50, 64]], '#9ca3af', 3) +
    dots([[30, 42], [34, 32], [26, 24], [22, 36]], '#PRIMARY', 4) +
    dots([[74, 42], [70, 30], [78, 22], [84, 34]], '#SECONDARY', 4) + `</svg>`),

  item('ma-plot', 'MA plot', ['ma plot', 'ma-plot', 'bland altman', 'log ratio', 'differential expression', 'mean average'],
    `${SVG}${AXES}` +
    `<path d="M20 50H92" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-dasharray="4 3"/>` +
    dots([[22, 36], [22, 64], [26, 44], [28, 58], [34, 40], [36, 60], [42, 46], [46, 55], [54, 48], [58, 53], [66, 50], [74, 48], [82, 51]], '#9ca3af', 3) +
    dots([[30, 20], [40, 26], [52, 32]], '#PRIMARY', 4) +
    dots([[28, 80], [44, 74]], '#SECONDARY', 4) + `</svg>`),

  item('bar-chart', 'Bar chart', ['bar chart', 'bar plot', 'barplot', 'histogram', 'column chart'],
    `${SVG}${AXES}` +
    `<path d="M20 46h14v40h-14zM37 26h14v60h-14zM54 56h14v30h-14zM71 36h14v50h-14z" fill="#PRIMARY" ${S}/></svg>`),

  item('grouped-bar-chart', 'Grouped bar chart', ['grouped bar', 'bar chart', 'comparison', 'two groups', 'treatment vs control'],
    `${SVG}${AXES}` +
    `<path d="M20 50h11v36h-11zM46 32h11v54h-11zM72 58h11v28h-11z" fill="#PRIMARY" ${S}/>` +
    `<path d="M31 38h11v48h-11zM57 46h11v40h-11zM83 26h11v60h-11z" fill="#SECONDARY" ${S}/></svg>`),

  item('line-chart', 'Line chart', ['line chart', 'line plot', 'time course', 'time series', 'growth curve', 'trend'],
    `${SVG}${AXES}` +
    `<polyline points="22,70 36,56 50,62 64,38 78,44 90,22" fill="none" ${S}/>` +
    dots([[22, 70], [36, 56], [50, 62], [64, 38], [78, 44], [90, 22]], '#PRIMARY', 4.5) + `</svg>`),

  item('box-plot', 'Box plot', ['box plot', 'boxplot', 'box and whisker', 'distribution', 'quartile'],
    `${SVG}${AXES}` +
    `<path d="M30 18V82M24 18h12M24 82h12M56 14V70M50 14h12M50 70h12M82 30V84M76 30h12M76 84h12" fill="none" ${S2}/>` +
    `<rect x="21" y="34" width="18" height="30" fill="#PRIMARY" ${S}/>` +
    `<rect x="47" y="28" width="18" height="26" fill="#SECONDARY" ${S}/>` +
    `<rect x="73" y="46" width="18" height="26" fill="#PRIMARY" ${S}/>` +
    `<path d="M21 50h18M47 42h18M73 58h18" fill="none" ${S}/></svg>`),

  item('violin-plot', 'Violin plot', ['violin plot', 'violin', 'distribution', 'density', 'kde'],
    `${SVG}${AXES}` +
    `<path d="M30 14C16 32 14 46 30 84C46 46 44 32 30 14Z" fill="#PRIMARY" ${S}/>` +
    `<path d="M56 24C40 36 46 60 56 84C66 60 72 36 56 24Z" fill="#SECONDARY" ${S}/>` +
    `<path d="M82 12C72 26 68 56 82 80C96 56 92 26 82 12Z" fill="#PRIMARY" ${S}/>` +
    `<path d="M30 36V64M56 44V72M82 30V66" fill="none" ${S}/>` +
    dots([[30, 50], [56, 58], [82, 48]], '#ffffff', 3) + `</svg>`),

  item('dot-plot', 'Dot plot', ['dot plot', 'dotplot', 'marker genes', 'bubble plot', 'expression', 'fraction expressing'],
    `${SVG}<path d="M8 20h10v4H8zM8 38h10v4H8zM8 56h10v4H8zM8 74h10v4H8z" fill="#9ca3af"/>` +
    `<path d="M32 88v4M50 88v4M68 88v4M86 88v4" fill="none" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>` +
    dots([[32, 22]], '#PRIMARY', 7) + dots([[50, 22]], '#e5e7eb', 3) + dots([[68, 22]], '#e5e7eb', 2.5) + dots([[86, 22]], '#SECONDARY', 4) +
    dots([[32, 40]], '#e5e7eb', 3) + dots([[50, 40]], '#PRIMARY', 6) + dots([[68, 40]], '#SECONDARY', 4.5) + dots([[86, 40]], '#e5e7eb', 2.5) +
    dots([[32, 58]], '#SECONDARY', 3.5) + dots([[50, 58]], '#e5e7eb', 2.5) + dots([[68, 58]], '#PRIMARY', 7) + dots([[86, 58]], '#e5e7eb', 3) +
    dots([[32, 76]], '#e5e7eb', 2.5) + dots([[50, 76]], '#SECONDARY', 5) + dots([[68, 76]], '#e5e7eb', 3) + dots([[86, 76]], '#PRIMARY', 6.5) + `</svg>`),

  item('venn-diagram', 'Venn diagram', ['venn', 'overlap', 'intersection', 'set', 'shared'],
    `${SVG}<circle cx="37" cy="50" r="29" fill="#PRIMARY" ${S}/>` +
    `<circle cx="63" cy="50" r="29" fill="#SECONDARY" ${S}/>` +
    `<path d="M50 24.1A29 29 0 0 1 50 75.9A29 29 0 0 1 50 24.1Z" fill="#ffffff" fill-opacity="0.6" ${S}/></svg>`,
    { width: 100, height: 100 }),

  item('upset-plot', 'UpSet plot', ['upset', 'intersection', 'set overlap', 'combination matrix', 'venn alternative'],
    `${SVG}<path d="M8 72h20v7H8zM8 84h14v7H8z" fill="#SECONDARY" ${S2}/>` +
    `<path d="M8 60h20v7H8z" fill="#SECONDARY" ${S2}/>` +
    `<path d="M34 46h12v8H34zM52 34h12v20H52zM70 20h12v34H70z" fill="#PRIMARY" ${S}/>` +
    `<path d="M32 54H90" fill="none" ${S2}/>` +
    `<path d="M58 63.5v24M76 63.5v12" fill="none" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>` +
    dots([[40, 63.5], [58, 75.5], [76, 87.5]], '#d1d5db', 3.5) +
    dots([[40, 75.5], [40, 87.5], [58, 63.5], [58, 87.5], [76, 63.5], [76, 75.5]], '#1f2937', 3.5) + `</svg>`),

  item('network-graph', 'Network graph', ['network', 'graph', 'interaction network', 'ppi', 'nodes', 'edges', 'gene regulatory network', 'grn'],
    `${SVG}<path d="M50 50L50 18M50 50L22 40M50 50L78 40M50 50L34 78M50 50L68 74M22 40L50 18M78 40L50 18M34 78L68 74M22 40L34 78" fill="none" ${S2}/>` +
    dots([[50, 18], [22, 40], [78, 40], [34, 78], [68, 74]], '#PRIMARY', 8) +
    dots([[50, 50]], '#SECONDARY', 10) + `</svg>`),

  item('pathway-diagram', 'Pathway diagram', ['pathway', 'signalling', 'signaling', 'cascade', 'kegg', 'flow', 'boxes arrows'],
    `${SVG}<path d="M32 50H40M58 50H66M66 50V22H68M66 50V78H68" fill="none" ${S}/>` +
    `<path d="M40 46l6 4-6 4ZM68 18l6 4-6 4ZM68 74l6 4-6 4Z" fill="#1f2937"/>` +
    `<rect x="6" y="41" width="26" height="18" rx="3" fill="#PRIMARY" ${S}/>` +
    `<rect x="33" y="41" width="26" height="18" rx="3" fill="#PRIMARY" ${S}/>` +
    `<rect x="72" y="13" width="24" height="18" rx="3" fill="#SECONDARY" ${S}/>` +
    `<rect x="72" y="69" width="24" height="18" rx="3" fill="#SECONDARY" ${S}/></svg>`),

  item('trajectory-pseudotime', 'Trajectory / pseudotime', ['trajectory', 'pseudotime', 'lineage', 'branching', 'monocle', 'paga', 'differentiation path'],
    `${SVG}<path d="M10 82C26 70 32 56 48 50C64 44 74 30 90 18M48 50C64 54 74 68 90 82" fill="none" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>` +
    dots([[12, 78], [20, 74], [28, 64], [34, 56]], '#PRIMARY') +
    dots([[46, 50], [56, 46], [56, 54], [64, 40]], '#9ca3af') +
    dots([[74, 30], [86, 20], [68, 60], [78, 70], [88, 80]], '#SECONDARY') + `</svg>`),

  item('rna-velocity', 'RNA velocity', ['rna velocity', 'velocity', 'scvelo', 'vector field', 'arrows', 'dynamics'],
    `${SVG}${dots([[22, 26], [30, 44], [44, 28], [50, 54], [66, 36], [72, 62], [36, 70], [58, 76], [82, 48], [20, 60]], '#PRIMARY', 6)}` +
    `<path d="M14 34l14-6m-5-2l5 2-4 4M36 52l14-6m-5-2l5 2-4 4M28 76l14-6m-5-2l5 2-4 4M56 40l14-6m-5-2l5 2-4 4M50 66l14-6m-5-2l5 2-4 4M72 56l14-6m-5-2l5 2-4 4M66 80l14-6m-5-2l5 2-4 4M44 20l14-6m-5-2l5 2-4 4M78 28l14-6m-5-2l5 2-4 4" fill="none" ${S}/></svg>`),

  item('gene-track-browser', 'Genome browser track', ['genome browser', 'igv', 'track', 'peaks', 'coverage', 'chip-seq', 'atac-seq', 'bigwig', 'gene model'],
    `${SVG}<path d="M8 20H92" fill="none" ${S}/>` +
    `<path d="M14 14h12v12H14zM40 14h20v12H40zM72 14h14v12H72z" fill="#6b7280" ${S2}/>` +
    `<path d="M8 60H18C22 42 26 42 30 60H38C42 34 48 34 54 60H66C70 48 74 48 78 60H92V62H8Z" fill="#PRIMARY" ${S2}/>` +
    `<path d="M8 90H16C20 78 24 78 28 90H40C44 70 50 70 56 90H72C75 82 78 82 82 90H92V92H8Z" fill="#SECONDARY" ${S2}/></svg>`),

  item('survival-curve', 'Survival curve', ['kaplan meier', 'kaplan-meier', 'survival', 'km curve', 'step curve', 'time to event'],
    `${SVG}${AXES}` +
    `<polyline points="14,12 30,12 30,24 44,24 44,36 60,36 60,44 78,44 78,52 92,52" fill="none" stroke="#PRIMARY" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>` +
    `<polyline points="14,12 22,12 22,30 34,30 34,48 48,48 48,62 62,62 62,74 80,74 80,80 92,80" fill="none" stroke="#SECONDARY" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`),

  item('roc-curve', 'ROC curve', ['roc', 'auc', 'receiver operating characteristic', 'classifier', 'sensitivity', 'specificity'],
    `${SVG}<rect x="14" y="8" width="78" height="78" fill="#ffffff" ${S}/>` +
    `<path d="M14 86C18 40 40 18 92 8V86Z" fill="#PRIMARY" fill-opacity="0.3"/>` +
    `<path d="M14 86L92 8" fill="none" stroke="#9ca3af" stroke-width="2" stroke-dasharray="4 3"/>` +
    `<path d="M14 86C18 40 40 18 92 8" fill="none" stroke="#PRIMARY" stroke-width="3.5" stroke-linecap="round"/></svg>`),

  item('histogram', 'Histogram', ['histogram', 'distribution', 'frequency', 'bins', 'counts'],
    `${SVG}${AXES}` +
    `<path d="M16 78h9.5v8H16zM25.5 64h9.5v22h-9.5zM35 46h9.5v40H35zM44.5 24h9.5v62h-9.5zM54 30h9.5v56H54zM63.5 50h9.5v36h-9.5zM73 66h9.5v20H73zM82.5 76h9.5v10h-9.5z" fill="#PRIMARY" ${S2}/></svg>`),

  item('pie-chart', 'Pie chart', ['pie chart', 'pie', 'proportion', 'composition', 'fraction', 'donut'],
    `${SVG}<path d="M50 50L50 10A40 40 0 1 1 36.3 87.6Z" fill="#PRIMARY" ${S}/>` +
    `<path d="M50 50L36.3 87.6A40 40 0 0 1 12.4 36.3Z" fill="#SECONDARY" ${S}/>` +
    `<path d="M50 50L12.4 36.3A40 40 0 0 1 50 10Z" fill="#e5e7eb" ${S}/></svg>`),

  item('sankey-flow', 'Sankey diagram', ['sankey', 'flow', 'alluvial', 'transitions', 'cell fate flow', 'river plot'],
    `${SVG}<path d="M16 10C50 10 50 8 84 8V30C50 30 50 30 16 30Z" fill="#PRIMARY" fill-opacity="0.5"/>` +
    `<path d="M16 30C50 30 50 40 84 40V55C50 55 50 45 16 45Z" fill="#PRIMARY" fill-opacity="0.5"/>` +
    `<path d="M16 55C50 55 50 55 84 55V70C50 70 50 70 16 70Z" fill="#SECONDARY" fill-opacity="0.5"/>` +
    `<path d="M16 70C50 70 50 78 84 78V92C50 92 50 90 16 90Z" fill="#SECONDARY" fill-opacity="0.5"/>` +
    `<rect x="8" y="10" width="8" height="35" fill="#PRIMARY" ${S2}/>` +
    `<rect x="8" y="55" width="8" height="35" fill="#SECONDARY" ${S2}/>` +
    `<path d="M84 8h8v22h-8zM84 40h8v30h-8zM84 78h8v14h-8z" fill="#6b7280" ${S2}/></svg>`),

  item('phylogenetic-tree', 'Phylogenetic tree', ['phylogeny', 'phylogenetic', 'tree', 'cladogram', 'dendrogram', 'evolution', 'lineage tree'],
    `${SVG}<path d="M8 50H24M24 24V74M24 24H44M44 14V36M44 14H84M44 36H60M60 28V44M60 28H84M60 44H84M24 74H52M52 64V84M52 64H84M52 84H84" fill="none" ${S}/>` +
    dots([[86, 14], [86, 28], [86, 44], [86, 64]], '#PRIMARY', 5.5) +
    dots([[86, 84]], '#SECONDARY', 5.5) + `</svg>`),

  item('sequence-alignment', 'Sequence alignment', ['alignment', 'msa', 'multiple sequence alignment', 'blast', 'conservation', 'reads'],
    `${SVG}<path d="M6 18h10v6H6zM6 32h10v6H6zM6 46h10v6H6zM6 60h10v6H6zM6 74h10v6H6z" fill="#9ca3af"/>` +
    `<path d="M22 15h9v12h-9zM40 15h9v12h-9zM58 15h9v12h-9zM22 29h9v12h-9zM40 29h9v12h-9zM58 29h9v12h-9zM22 43h9v12h-9zM58 43h9v12h-9zM22 57h9v12h-9zM40 57h9v12h-9zM58 57h9v12h-9zM22 71h9v12h-9zM40 71h9v12h-9zM58 71h9v12h-9z" fill="#PRIMARY"/>` +
    `<path d="M31 15h9v12h-9zM31 29h9v12h-9zM31 43h9v12h-9zM31 57h9v12h-9zM31 71h9v12h-9zM76 15h9v12h-9zM76 29h9v12h-9zM76 43h9v12h-9zM76 71h9v12h-9zM49 57h9v12h-9z" fill="#SECONDARY"/>` +
    `<path d="M49 15h9v12h-9zM49 29h9v12h-9zM49 43h9v12h-9zM49 71h9v12h-9zM67 15h9v12h-9zM67 29h9v12h-9zM67 57h9v12h-9zM67 71h9v12h-9zM85 15h9v12h-9zM85 29h9v12h-9zM85 43h9v12h-9zM85 57h9v12h-9zM85 71h9v12h-9z" fill="#9ca3af"/>` +
    `<path d="M40 43h9v12h-9zM67 43h9v12h-9zM76 57h9v12h-9z" fill="#6b7280"/>` +
    `<path d="M22 15h72v68H22zM22 29h72M22 43h72M22 57h72M22 71h72M31 15v68M40 15v68M49 15v68M58 15v68M67 15v68M76 15v68M85 15v68" fill="none" stroke="#ffffff" stroke-width="1.5"/>` +
    `<rect x="22" y="15" width="72" height="68" fill="none" ${S2}/></svg>`),

  item('table-grid', 'Table', ['table', 'grid', 'data table', 'matrix', 'results table'],
    `${SVG}<rect x="8" y="14" width="84" height="72" rx="3" fill="#ffffff" ${S}/>` +
    `<path d="M8 17a3 3 0 0 1 3-3h78a3 3 0 0 1 3 3v13H8z" fill="#PRIMARY" ${S}/>` +
    `<path d="M8 44H92M8 58H92M8 72H92M36 14V86M64 14V86" fill="none" ${S2}/></svg>`),

  // ------------------------------------------------------------ compute
  item('pipeline-step', 'Pipeline step', ['pipeline', 'step', 'process', 'workflow step', 'gear', 'nextflow', 'snakemake'],
    `${SVG}<rect x="8" y="20" width="84" height="60" rx="8" fill="#PRIMARY" ${S}/>` +
    `<polygon points="${gearPoints(50, 50, 21, 15, 8)}" fill="#e5e7eb" ${S}/>` +
    `<circle cx="50" cy="50" r="7" fill="#SECONDARY" ${S}/></svg>`,
    { width: 100, height: 100 }),

  item('workflow-arrows', 'Workflow', ['workflow', 'pipeline', 'steps', 'process flow', 'sequence of steps', 'flowchart'],
    `${SVG}<path d="M28 50H36M62 50H70" fill="none" ${S}/>` +
    `<path d="M35 45l7 5-7 5ZM69 45l7 5-7 5Z" fill="#1f2937"/>` +
    `<rect x="4" y="38" width="24" height="24" rx="4" fill="#PRIMARY" ${S}/>` +
    `<rect x="38" y="38" width="24" height="24" rx="4" fill="#SECONDARY" ${S}/>` +
    `<rect x="72" y="38" width="24" height="24" rx="4" fill="#PRIMARY" ${S}/></svg>`,
    { width: 120, height: 60 }),

  item('database-cylinder', 'Database', ['database', 'db', 'storage', 'repository', 'data store', 'sql', 'archive'],
    `${SVG}<path d="M20 22V78A30 11 0 0 0 80 78V22Z" fill="#PRIMARY" ${S}/>` +
    `<path d="M20 42A30 11 0 0 0 80 42M20 60A30 11 0 0 0 80 60" fill="none" ${S}/>` +
    `<ellipse cx="50" cy="22" rx="30" ry="11" fill="#SECONDARY" ${S}/></svg>`,
    { primary: SLATE, secondary: '#cbd5e1', width: 80, height: 100 }),

  item('cloud-compute', 'Cloud computing', ['cloud', 'cloud compute', 'aws', 'gcp', 'azure', 'hpc', 'remote', 'server'],
    `${SVG}<path d="M26 80H78A14 14 0 0 0 80 52A20 20 0 0 0 42 44A20 20 0 0 0 26 80Z" fill="#PRIMARY" ${S}/>` +
    `<rect x="36" y="56" width="32" height="6" rx="3" fill="#ffffff" fill-opacity="0.6"/>` +
    `<rect x="36" y="66" width="22" height="6" rx="3" fill="#ffffff" fill-opacity="0.6"/>` +
    `<circle cx="64" cy="69" r="3" fill="#SECONDARY"/></svg>`,
    { primary: SLATE, secondary: '#22c55e', width: 100, height: 80 }),

  item('laptop', 'Laptop', ['laptop', 'computer', 'notebook computer', 'workstation', 'pc'],
    `${SVG}<rect x="16" y="14" width="68" height="50" rx="4" fill="#PRIMARY" ${S}/>` +
    `<rect x="21" y="19" width="58" height="40" rx="2" fill="#SECONDARY"/>` +
    `<path d="M6 66H94L90 80H10Z" fill="#PRIMARY" ${S}/>` +
    `<rect x="38" y="70" width="24" height="4" rx="2" fill="#374151"/></svg>`,
    { primary: SLATE, secondary: '#dbeafe', width: 100, height: 80 }),

  item('desktop-computer', 'Desktop computer', ['desktop', 'computer', 'monitor', 'workstation', 'pc', 'screen'],
    `${SVG}<rect x="10" y="10" width="80" height="54" rx="4" fill="#PRIMARY" ${S}/>` +
    `<rect x="15" y="15" width="70" height="44" rx="2" fill="#SECONDARY"/>` +
    `<rect x="44" y="64" width="12" height="12" fill="#PRIMARY" ${S}/>` +
    `<rect x="28" y="76" width="44" height="10" rx="3" fill="#PRIMARY" ${S}/></svg>`,
    { primary: SLATE, secondary: '#dbeafe', width: 90, height: 90 }),

  item('server-rack', 'Server rack', ['server', 'rack', 'hpc', 'cluster', 'compute node', 'data center'],
    `${SVG}<rect x="24" y="6" width="52" height="88" rx="4" fill="#PRIMARY" ${S}/>` +
    `<path d="M30 12h40v18H30zM30 36h40v18H30zM30 60h40v18H30z" fill="#374151" ${S2}/>` +
    `<path d="M44 21h20M44 45h20M44 69h20" fill="none" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>` +
    dots([[36, 21], [36, 45], [36, 69]], '#SECONDARY', 3) +
    `<path d="M30 84h40" fill="none" stroke="#374151" stroke-width="3" stroke-linecap="round"/></svg>`,
    { primary: SLATE, secondary: '#22c55e', width: 60, height: 100 }),

  item('gpu-card', 'GPU', ['gpu', 'graphics card', 'accelerator', 'cuda', 'deep learning hardware', 'nvidia'],
    `${SVG}<rect x="4" y="22" width="10" height="64" rx="2" fill="#9ca3af" ${S}/>` +
    `<rect x="14" y="30" width="78" height="48" rx="3" fill="#PRIMARY" ${S}/>` +
    `<path d="M24 78h36v7H24z" fill="#374151" ${S2}/>` +
    `<circle cx="38" cy="54" r="14" fill="#SECONDARY" ${S}/>` +
    `<circle cx="70" cy="54" r="14" fill="#SECONDARY" ${S}/>` +
    `<circle cx="38" cy="54" r="4" fill="#374151"/><circle cx="70" cy="54" r="4" fill="#374151"/></svg>`,
    { primary: SLATE, secondary: '#cbd5e1', width: 100, height: 70 }),

  item('neural-network', 'Neural network', ['neural network', 'deep learning', 'mlp', 'layers', 'ann', 'perceptron'],
    `${SVG}<path d="M16 25L50 18M16 25L50 39M16 25L50 61M16 25L50 82M16 50L50 18M16 50L50 39M16 50L50 61M16 50L50 82M16 75L50 18M16 75L50 39M16 75L50 61M16 75L50 82M50 18L84 38M50 18L84 62M50 39L84 38M50 39L84 62M50 61L84 38M50 61L84 62M50 82L84 38M50 82L84 62" fill="none" stroke="#9ca3af" stroke-width="1.5"/>` +
    dots([[16, 25], [16, 50], [16, 75], [50, 18], [50, 39], [50, 61], [50, 82]], '#PRIMARY', 7) +
    dots([[84, 38], [84, 62]], '#SECONDARY', 7) + `</svg>`),

  item('machine-learning-model', 'Machine learning model', ['machine learning', 'ml', 'ai', 'model', 'brain chip', 'classifier', 'prediction'],
    `${SVG}<path d="M34 22V10M50 22V10M66 22V10M34 78V90M50 78V90M66 78V90M22 34H10M22 50H10M22 66H10M78 34H90M78 50H90M78 66H90" fill="none" ${S}/>` +
    `<rect x="22" y="22" width="56" height="56" rx="5" fill="#PRIMARY" ${S}/>` +
    `<path d="M50 34C44 29 35 32 34 39C28 41 27 49 31 53C29 59 35 65 43 63C45 67 55 67 57 63C65 65 71 59 69 53C73 49 72 41 66 39C65 32 56 29 50 34Z" fill="#SECONDARY" ${S}/>` +
    `<path d="M50 34V64M36 44c5 2 7 6 5 11M64 44c-5 2-7 6-5 11M41 54c3 3 7 3 9 0" fill="none" ${S2}/></svg>`,
    { secondary: '#fde68a' }),

  item('clustering-icon', 'Clustering', ['clustering', 'cluster', 'k-means', 'leiden', 'louvain', 'groups', 'unsupervised'],
    `${SVG}<circle cx="30" cy="34" r="20" fill="none" stroke="#1f2937" stroke-width="2" stroke-dasharray="5 4"/>` +
    `<circle cx="70" cy="32" r="18" fill="none" stroke="#1f2937" stroke-width="2" stroke-dasharray="5 4"/>` +
    `<circle cx="52" cy="72" r="18" fill="none" stroke="#1f2937" stroke-width="2" stroke-dasharray="5 4"/>` +
    dots([[24, 28], [34, 24], [38, 38], [26, 42]], '#PRIMARY') +
    dots([[64, 26], [76, 28], [70, 40]], '#SECONDARY') +
    dots([[46, 66], [58, 66], [52, 78]], '#9ca3af') + `</svg>`),

  item('statistics-pvalue', 'Statistical significance', ['p-value', 'significance', 'statistics', 't-test', 'asterisk', 'error bars', 'comparison'],
    `${SVG}${AXES}` +
    `<path d="M26 44h18v42H26z" fill="#PRIMARY" ${S}/>` +
    `<path d="M56 32h18v54H56z" fill="#SECONDARY" ${S}/>` +
    `<path d="M35 38V50M30 38h10M30 50h10M65 26V38M60 26h10M60 38h10" fill="none" ${S2}/>` +
    `<path d="M35 26V20H65V26" fill="none" ${S}/>` +
    `<path d="M50 7V17M45.7 9.5L54.3 14.5M54.3 9.5L45.7 14.5" fill="none" ${S}/></svg>`),

  item('correlation-matrix', 'Correlation matrix', ['correlation', 'matrix', 'pearson', 'spearman', 'similarity', 'heatmap', 'pairwise'],
    `${SVG}<path d="M12 12h15v15H12zM27 27h15v15H27zM42 42h15v15H42zM57 57h15v15H57zM72 72h15v15H72zM27 12h15v15H27zM12 27h15v15H12zM72 57h15v15H72zM57 72h15v15H57z" fill="#PRIMARY"/>` +
    `<path d="M42 12h15v15H42zM12 42h15v15H12zM57 27h15v15H57zM27 57h15v15H27zM72 42h15v15H72zM42 72h15v15H42z" fill="#e5e7eb"/>` +
    `<path d="M57 12h15v15H57zM12 57h15v15H12zM72 27h15v15H72zM27 72h15v15H27zM42 27h15v15H42zM27 42h15v15H27z" fill="#SECONDARY" fill-opacity="0.6"/>` +
    `<path d="M72 12h15v15H72zM12 72h15v15H12zM57 42h15v15H57zM42 57h15v15H42z" fill="#SECONDARY"/>` +
    `<path d="M12 27h75M12 42h75M12 57h75M12 72h75M27 12v75M42 12v75M57 12v75M72 12v75" fill="none" stroke="#ffffff" stroke-width="1.5"/>` +
    `<rect x="12" y="12" width="75" height="75" fill="none" ${S2}/></svg>`),

  item('qc-checkmark', 'Quality control pass', ['qc', 'quality control', 'check', 'pass', 'validated', 'checkmark', 'quality'],
    `${SVG}${AXES}` +
    `<polyline points="22,72 34,60 46,66 58,52 70,56 90,42" fill="none" stroke="#PRIMARY" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>` +
    `<circle cx="72" cy="26" r="17" fill="#SECONDARY" ${S}/>` +
    `<path d="M63 26l6 6l12 -12" fill="none" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
    { secondary: '#22c55e' }),

  item('gene-set-enrichment', 'Gene set enrichment', ['gsea', 'enrichment', 'running sum', 'enrichment score', 'pathway enrichment', 'gene set'],
    `${SVG}<path d="M14 8V64H92" fill="none" ${S}/>` +
    `<path d="M14 60C22 32 28 20 38 22C50 24 62 50 92 60Z" fill="#PRIMARY" fill-opacity="0.3"/>` +
    `<path d="M14 60C22 32 28 20 38 22C50 24 62 50 92 60" fill="none" stroke="#PRIMARY" stroke-width="3.5" stroke-linecap="round"/>` +
    `<path d="M18 70v12M22 70v12M25 70v12M30 70v12M33 70v12M38 70v12M44 70v12M52 70v12M60 70v12M70 70v12M84 70v12" fill="none" ${S2}/>` +
    `<path d="M14 86h39v8H14z" fill="#SECONDARY" ${S2}/>` +
    `<path d="M53 86h39v8H53z" fill="#PRIMARY" ${S2}/></svg>`),

  item('spreadsheet', 'Spreadsheet', ['spreadsheet', 'excel', 'csv', 'sheet', 'cells', 'metadata table'],
    `${SVG}<rect x="8" y="14" width="84" height="72" rx="3" fill="#ffffff" ${S}/>` +
    `<path d="M8 17a3 3 0 0 1 3-3h78a3 3 0 0 1 3 3v9H8z" fill="#PRIMARY" ${S}/>` +
    `<path d="M8 26h14v60H8z" fill="#e5e7eb" ${S2}/>` +
    `<path d="M22 26H92M22 41H92M22 56H92M22 71H92M45 26V86M69 26V86" fill="none" ${S2}/>` +
    `<path d="M45 41h24v15H45z" fill="#SECONDARY" ${S2}/></svg>`,
    { primary: '#16a34a', secondary: '#fde68a' }),

  item('code-terminal', 'Terminal / code', ['terminal', 'code', 'command line', 'cli', 'bash', 'shell', 'script', 'console'],
    `${SVG}<rect x="6" y="14" width="88" height="72" rx="5" fill="#374151" ${S}/>` +
    `<path d="M6 19a5 5 0 0 1 5-5h78a5 5 0 0 1 5 5v9H6z" fill="#PRIMARY" ${S}/>` +
    dots([[14, 21], [22, 21], [30, 21]], '#ffffff', 2.5) +
    `<path d="M16 40l8 7-8 7" fill="none" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>` +
    `<rect x="30" y="44" width="30" height="6" rx="3" fill="#SECONDARY"/>` +
    `<rect x="16" y="58" width="34" height="5" rx="2.5" fill="#9ca3af"/>` +
    `<rect x="16" y="68" width="54" height="5" rx="2.5" fill="#9ca3af"/></svg>`),

  item('python-notebook', 'Notebook (Jupyter)', ['jupyter', 'notebook', 'python', 'ipynb', 'cells', 'code notebook', 'colab'],
    `${SVG}<rect x="14" y="6" width="72" height="88" rx="4" fill="#ffffff" ${S}/>` +
    `<rect x="20" y="14" width="60" height="20" rx="2" fill="#e5e7eb" ${S2}/>` +
    `<path d="M20 14h5v20h-5z" fill="#PRIMARY"/>` +
    `<rect x="30" y="19" width="34" height="4" rx="2" fill="#6b7280"/><rect x="30" y="26" width="24" height="4" rx="2" fill="#6b7280"/>` +
    `<path d="M30 60h7v-8h-7zM40 60h7v-16h-7zM50 60h7v-12h-7zM60 60h7v-20h-7z" fill="#SECONDARY" ${S2}/>` +
    `<path d="M28 60h44" fill="none" ${S2}/>` +
    `<rect x="20" y="68" width="60" height="20" rx="2" fill="#e5e7eb" ${S2}/>` +
    `<path d="M20 68h5v20h-5z" fill="#PRIMARY"/>` +
    `<rect x="30" y="73" width="28" height="4" rx="2" fill="#6b7280"/><rect x="30" y="80" width="38" height="4" rx="2" fill="#6b7280"/></svg>`,
    { width: 80, height: 100 }),

  item('r-stats', 'Statistical analysis (R)', ['r', 'rstats', 'statistics', 'analysis', 'ggplot', 'script', 'bar chart document'],
    `${SVG}<rect x="18" y="6" width="64" height="88" rx="4" fill="#ffffff" ${S}/>` +
    `<path d="M18 10a4 4 0 0 1 4-4h56a4 4 0 0 1 4 4v10H18z" fill="#PRIMARY" ${S}/>` +
    `<path d="M28 58h9v-20h-9zM41 58h9v-30h-9zM54 58h9v-24h-9zM67 58h7v-14h-7z" fill="#SECONDARY" ${S2}/>` +
    `<path d="M26 58h48" fill="none" ${S2}/>` +
    `<rect x="26" y="68" width="48" height="4" rx="2" fill="#9ca3af"/>` +
    `<rect x="26" y="76" width="40" height="4" rx="2" fill="#9ca3af"/>` +
    `<rect x="26" y="84" width="30" height="4" rx="2" fill="#9ca3af"/></svg>`,
    { primary: '#2563eb', secondary: '#9ca3af', width: 80, height: 100 }),

  item('report-document', 'Report', ['report', 'document', 'manuscript', 'paper', 'summary', 'results', 'pdf'],
    `${SVG}<path d="M18 6H68L82 20V94H18Z" fill="#ffffff" ${S}/>` +
    `<path d="M68 6V20H82" fill="#e5e7eb" ${S}/>` +
    `<rect x="26" y="26" width="34" height="5" rx="2.5" fill="#PRIMARY"/>` +
    `<path d="M26 64V38M26 64H74" fill="none" ${S2}/>` +
    `<polyline points="30,58 40,48 50,52 60,42 70,46" fill="none" stroke="#SECONDARY" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>` +
    `<rect x="26" y="72" width="48" height="4" rx="2" fill="#9ca3af"/>` +
    `<rect x="26" y="80" width="40" height="4" rx="2" fill="#9ca3af"/>` +
    `<rect x="26" y="88" width="28" height="4" rx="2" fill="#9ca3af"/></svg>`,
    { width: 80, height: 100 }),

  item('figure-panel', 'Figure panel', ['figure', 'panel', 'plot', 'subfigure', 'frame', 'publication figure'],
    `${SVG}<rect x="6" y="6" width="88" height="88" rx="2" fill="#ffffff" ${S}/>` +
    `<rect x="11" y="11" width="12" height="12" rx="2" fill="#6b7280"/>` +
    `<path d="M30 28V82H88" fill="none" ${S}/>` +
    dots([[38, 70], [46, 60], [54, 64], [62, 50], [70, 54], [80, 40]], '#PRIMARY', 4) +
    `<path d="M34 76L84 36" fill="none" stroke="#SECONDARY" stroke-width="2.5" stroke-dasharray="5 3" stroke-linecap="round"/></svg>`),
]
