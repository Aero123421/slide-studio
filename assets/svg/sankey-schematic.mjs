// Diagram study · Sankey — where a quantity splits and recombines, with conserved totals.
// Ribbon width is proportional to tonnes. Every node's inflow must equal its outflow; the check
// below throws if the data break conservation. Shares and the headline are computed from `links`.
import { sankeyChart, fmt, pct } from '../runtime/figure.mjs';

const nodes = [
  { id: 'homes', label: 'Households' }, { id: 'firms', label: 'Businesses' }, { id: 'streets', label: 'Streets & parks' },
  { id: 'recy', label: 'Recycling bin' }, { id: 'food', label: 'Food & garden bin' }, { id: 'resid', label: 'Residual bin' },
  { id: 'recycled', label: 'Recycled' }, { id: 'compost', label: 'Composted' }, { id: 'energy', label: 'Energy recovery' }, { id: 'landfill', label: 'Landfill' },
];
const links = [ // thousand tonnes collected in 2025 (illustrative)
  { source: 'homes', target: 'recy', value: 92 }, { source: 'homes', target: 'food', value: 64 }, { source: 'homes', target: 'resid', value: 114 },
  { source: 'firms', target: 'recy', value: 41 }, { source: 'firms', target: 'food', value: 12 }, { source: 'firms', target: 'resid', value: 65 },
  { source: 'streets', target: 'food', value: 9 }, { source: 'streets', target: 'resid', value: 15 },
  { source: 'recy', target: 'recycled', value: 113 }, { source: 'recy', target: 'energy', value: 14 }, { source: 'recy', target: 'landfill', value: 6 },
  { source: 'food', target: 'compost', value: 79 }, { source: 'food', target: 'energy', value: 6 },
  { source: 'resid', target: 'energy', value: 136 }, { source: 'resid', target: 'landfill', value: 58 },
];

// Conservation: for every node with both inflow and outflow, in === out.
const flow = (id, side) => links.filter(l => l[side] === id).reduce((s, l) => s + l.value, 0);
for (const nd of nodes) {
  const inn = flow(nd.id, 'target'), out = flow(nd.id, 'source');
  if (inn && out && inn !== out) throw Error(`sankey: ${nd.label} receives ${inn} but sends ${out}`);
}
const total = nodes.filter(nd => !flow(nd.id, 'target')).reduce((s, nd) => s + flow(nd.id, 'source'), 0);
const landfill = flow('landfill', 'target');
const fromResidual = links.find(l => l.source === 'resid' && l.target === 'landfill').value;
const circular = flow('recycled', 'target') + flow('compost', 'target');

export function figure(theme = 'css') {
  return sankeyChart({
    id: 'sankey-schematic-fig', theme, width: 1152, height: 444, fontSize: 17, nodeWidth: 14, nodePadding: 26,
    title: 'Municipal waste flows in 2025: source, collection stream and destination, thousand tonnes',
    desc: `Ribbon width is proportional to tonnes; each stream's inflow equals its outflow. ${fmt(total)} kt collected; ${fmt(circular)} kt (${pct(circular / total)}) recycled or composted, ${fmt(flow('energy', 'target'))} kt to energy recovery and ${fmt(landfill)} kt to landfill, ${fmt(fromResidual)} kt of it from the residual bin.`,
    nodes, links, highlight: 'landfill', format: { suffix: ' kt' },
  });
}

export default {
  study: true,
  id: 'sankey-schematic',
  title: 'Sankey: splitting and recombining flows',
  className: 'st cs-sustainability-moss',
  notes: 'Purpose: Show how a total splits into streams and recombines into destinations, with widths that can be read as quantities.\nModify: Replace `nodes` and `links` (one unit throughout). The conservation check throws if any node gains or loses material; shares, the highlighted destination and the headline recompute.\nInvariant: Ribbon width is proportional to value; inflow equals outflow at every intermediate node; the unit and year are stated. A qualitative sketch must say it is not to scale.\nStatic: Already static. For a build, reveal sources, then streams, then destinations.',
  sources: [{ type: 'original-example', file: 'assets/svg/sankey-schematic.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Of ${fmt(total)}&nbsp;kt collected, ${pct(circular / total)} is recycled or composted; ${fmt(landfill)}&nbsp;kt still goes to <em>${nodes.find(nd => nd.id === 'landfill').label.toLowerCase()}</em>, ${fmt(fromResidual)}&nbsp;kt of it from the residual bin</h1>
<p class="st-dek">Ribbon width is proportional to tonnes; every bin sends on exactly what it receives.</p>
<figure class="st-fig" style="top:214px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · thousand tonnes collected in 2025</span><span>Sankey diagram</span></p>`,
};
