// Motion study · Grow from the baseline — bars rise from a shared zero, then the
// page names the one bar it is about. Builds: 1 bars grow (staggered), 2 callout.
import { columnChart, fmt } from '../runtime/figure.mjs';

const regions = [ // orders, thousands, Q3 (illustrative)
  { label: 'North', value: 48 }, { label: 'Coast', value: 61 }, { label: 'Central', value: 39 },
  { label: 'Valley', value: 74 }, { label: 'Islands', value: 22 }, { label: 'Metro', value: 57 },
];
const top = [...regions].sort((a, b) => b.value - a.value)[0];
const total = regions.reduce((s, r) => s + r.value, 0);

export function figure(theme = 'css') {
  return columnChart({
    id: 'bar-growth-fig', theme, width: 1152, height: 470, axis: true, ticks: 4,
    title: 'Orders by region, third quarter, thousands',
    desc: `${top.label} leads with ${top.value} thousand orders of ${total} thousand in total; all bars share a zero baseline.`,
    unit: 'Orders, thousands', data: regions, highlight: top.label,
    build: { start: 1, motion: 'grow-y', stagger: 90, duration: 700 },
    annotate: [{ at: top.label, text: `${Math.round((top.value / total) * 100)}% of all orders`, dx: 90, dy: 0, width: 200, step: 2, motion: 'lift' }],
  });
}

export default {
  study: true,
  id: 'motion-bar-growth',
  title: 'Grow from the baseline',
  className: 'st cs-sales-kpi',
  notes: 'Purpose: Introduce quantities by growing bars from a shared zero, then direct attention to one bar.\nModify: Replace `regions`; the stagger follows display order. Keep the highlight to the bar the headline names.\nInvariant: Growth starts at the true zero baseline; bar length encodes value, never animation duration; the callout appears only after every bar has landed.\nStatic: The final build shows every bar and the callout; nothing is lost in PDF.',
  sources: [{ type: 'original-example', file: 'assets/motion/bar-growth.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head"><em>${top.label}</em> took ${Math.round((top.value / total) * 100)}% of third-quarter orders</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data</span><span>Motion · grow from zero, then callout (2 builds)</span></p>`,
};
