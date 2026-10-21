// Diagram study · Pipeline — a subject followed through declared transformations.
// Nodes and edges are data; layout, ports, arrowheads and labels are computed.
import { flowDiagram } from '../runtime/figure.mjs';

const stages = [
  { id: 'raw', label: 'Raw sensor logs', sub: '2.1 B rows / day', kind: 'store' },
  { id: 'clean', label: 'Deduplicate', sub: 'drops 3.4% repeats' },
  { id: 'align', label: 'Align clocks', sub: '±40 ms drift fixed' },
  { id: 'window', label: 'Window features', sub: '5-min windows', emphasis: true },
  { id: 'score', label: 'Failure score', sub: 'per pump, hourly', kind: 'terminal' },
];
const quarantine = { id: 'hold', label: 'Quarantine', sub: 'malformed rows', muted: true };
const edges = [
  { from: 'raw', to: 'clean' }, { from: 'clean', to: 'align' }, { from: 'align', to: 'window', emphasis: true },
  { from: 'window', to: 'score', emphasis: true }, { from: 'clean', to: 'hold', label: '0.2% rejected', style: 'dashed' },
];

export function figure(theme = 'css') {
  return flowDiagram({
    id: 'pipeline-fig', theme, width: 1152, height: 420, nodeMaxWidth: 210, fontSize: 20,
    title: 'Data pipeline from raw sensor logs to an hourly failure score',
    desc: 'Five stages in sequence: raw logs are deduplicated, clock-aligned and windowed before scoring. A dashed branch sends malformed rows to quarantine. Arrows mean data flow, not time or causation.',
    nodes: [...stages, quarantine], edges,
    annotate: [],
  });
}

export default {
  study: true,
  id: 'pipeline',
  title: 'Pipeline: data flow through named transformations',
  className: 'st cs-ml-eval',
  notes: 'Purpose: Follow one subject through transformations, naming what each stage changes.\nModify: Edit `stages` and `edges`; widths, layers, ports and arrowheads recompute. Use `sub` for the measurable change at each stage.\nInvariant: An arrow means data flow; side branches (quarantine) are visibly secondary; the stage that matters for the claim carries the only accent.\nStatic: Already static. For a build, pass build:{by:"mark"} to reveal stages in order.',
  sources: [{ type: 'original-example', file: 'assets/svg/pipeline.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Scores are only as good as their windows: <em>clock alignment</em> comes first</h1>
<p class="st-dek">Each stage states the one thing it changes. The side branch is part of the record, not an error to hide.</p>
<figure class="st-fig" style="top:214px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative pipeline · volumes are examples</span><span>Flow diagram</span></p>`,
};
