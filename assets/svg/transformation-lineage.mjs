// Diagram study · Transformation lineage — where a reported number came from.
// Sources (cylinders) enter at the step that uses them; each transformation names its job; the
// reported figure is a terminal. The margin, the manual step's effect and the headline are
// computed from `amounts`, so the lineage and the number cannot disagree.
import { flowDiagram, theme as makeTheme, el, g, textLines, fmt } from '../runtime/figure.mjs';

const amounts = { revenue: 12.40, returns: 0.52, cogs: 6.58, freight: 0.41 }; // € millions, Q3, after conversion (illustrative)
const netRevenue = amounts.revenue - amounts.returns;
const margin = (netRevenue - amounts.cogs - amounts.freight) / netRevenue;
const withoutManual = (netRevenue - amounts.cogs) / netRevenue;
const swing = (withoutManual - margin) * 100; // percentage points moved by the manual step
const eur = v => fmt(v, { digits: 2, prefix: '€', suffix: ' m' });
const pctText = v => `${fmt(v * 100, { digits: 1 })}%`;

const nodes = [ // layer = the step at which a source is first used
  { id: 'gl', label: 'General ledger', sub: 'gl.journal_lines', kind: 'store', layer: 0 },
  { id: 'fx', label: 'FX rates', sub: 'treasury.fx_daily', kind: 'store', layer: 0 },
  { id: 'convert', label: 'Convert to EUR', sub: 'job fin-104', layer: 1 },
  { id: 'rma', label: 'Returns', sub: `rma.returns, ${eur(amounts.returns)}`, kind: 'store', layer: 1 },
  { id: 'net', label: 'Net out returns', sub: 'job fin-117', layer: 2 },
  { id: 'freight', label: 'Freight invoices', sub: `ap.freight_q3, ${eur(amounts.freight)}`, kind: 'store', layer: 2 },
  { id: 'alloc', label: 'Allocate freight', sub: 'manual spreadsheet', layer: 3, manual: true },
  { id: 'margin', label: `Gross margin ${pctText(margin)}`, sub: 'Q3, as reported', kind: 'terminal', layer: 4, maxWidth: 236 },
];
const edges = [ // each edge: the output of one step is an input of the next
  { from: 'gl', to: 'convert' }, { from: 'fx', to: 'convert' }, { from: 'convert', to: 'net' }, { from: 'rma', to: 'net' },
  { from: 'net', to: 'alloc' }, { from: 'freight', to: 'alloc' }, { from: 'alloc', to: 'margin' },
];
const manual = nodes.find(nd => nd.manual);
const jobs = nodes.filter(nd => !nd.kind && !nd.manual).length;
const sources = nodes.filter(nd => nd.kind === 'store').length;

export function figure(theme = 'css') {
  const t = makeTheme(theme);
  return flowDiagram({
    id: 'transformation-lineage-fig', theme: t, width: 1152, height: 444, fontSize: 19, nodeMaxWidth: 196, nodeMinWidth: 150, crossGap: 44,
    title: 'Lineage of the reported Q3 gross margin',
    desc: `${sources} sources, ${jobs} scheduled jobs and one manual step lead to the reported gross margin of ${pctText(margin)}. Arrows mean "is an input to". Sources enter where they are first used: ledger and FX rates are converted to euros, returns are netted out, then freight invoices are allocated by hand in a spreadsheet. Without that allocation the margin would read ${pctText(withoutManual)}, ${fmt(swing, { digits: 1 })} points higher.`,
    nodes: nodes.map(nd => ({ ...nd, emphasis: !!nd.manual, fill: nd.manual ? null : t.c('paper') })),
    edges: edges.map(e => ({ ...e, emphasis: e.from === manual.id || e.to === manual.id })),
    // under the manual step: what the reported figure would read without it
    extra: ({ nodes: at }) => {
      const b = at[manual.id], x = b.x + b.w / 2, y = b.y + b.h;
      return g({ class: 'lineage-note' }, el('line', { x1: x, x2: x, y1: y + 6, y2: y + 40, stroke: t.c('accent'), 'stroke-width': 1.4 }),
        textLines([`without this step: ${pctText(withoutManual)}`], { x, y: y + 48, size: 17, anchor: 'middle', valign: 'top', fill: t.c('accent'), weight: 700 }),
        textLines([`${fmt(swing, { digits: 1 })} points higher`], { x, y: y + 72, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') }));
    },
  });
}

export default {
  study: true,
  id: 'transformation-lineage',
  title: 'Lineage: source, transformation and derived result',
  className: 'st cs-executive-ink',
  notes: 'Purpose: Show where a reported value came from: which sources, which transformations in which order, and which step is manual.\nModify: Edit `amounts`, `nodes` (kind store for sources, layer = first use, job IDs in sub) and `edges`. The margin, the manual step\'s effect and the headline recompute. Provenance identifiers used here: gl.journal_lines, treasury.fx_daily, rma.returns, ap.freight_q3, jobs fin-104 and fin-117.\nInvariant: Sources, transformations and the derived result stay visually distinct; operation order and branching inputs are preserved; an arrow means "is an input to", never "causes".\nStatic: Already static. For a build, pass build:{by:"mark"} to reveal the lineage step by step.',
  sources: [{ type: 'original-example', file: 'assets/svg/transformation-lineage.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">One manual step, <em>${manual.label}</em>, moves the reported margin by ${fmt(swing, { digits: 1 })} points</h1>
<p class="st-dek">Arrows mean “is an input to”. Cylinders are sources; the pill is the reported figure.</p>
<figure class="st-fig" style="top:214px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · Q3 figures in € millions after conversion</span><span>Data lineage diagram</span></p>`,
};
