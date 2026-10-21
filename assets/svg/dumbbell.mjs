// Diagram study · Dumbbell — two values per row on one shared scale.
// Data drives everything: the headline, the rail numbers, the dots and the change
// column are computed from `queues`. Replace the data; the page recomputes.
import { dumbbellChart, fmt } from '../runtime/figure.mjs';

const queues = [ // median minutes to first response (illustrative)
  { label: 'Security reviews', a: 66, b: 31 },
  { label: 'Billing', a: 42, b: 18 },
  { label: 'Onboarding', a: 35, b: 24 },
  { label: 'Integrations', a: 51, b: 47 },
  { label: 'Data exports', a: 28, b: 29 },
];
const faster = queues.filter(q => q.b < q.a);
const slower = queues.filter(q => q.b > q.a);
const best = [...queues].sort((p, q) => (p.b - p.a) - (q.b - q.a))[0];
const words = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

export function figure(theme = 'css') {
  return dumbbellChart({
    id: 'dumbbell-fig', theme, width: 800, height: 478,
    title: 'Median minutes to first response, 2023 and 2025, by queue',
    desc: `${faster.length} of ${queues.length} queues answer faster in 2025. ${best.label} fell from ${best.a} to ${best.b} minutes; ${slower.map(q => q.label.toLowerCase()).join(', ')} rose.`,
    data: queues, aLabel: '2023', bLabel: '2025', sort: 'delta', deltaLabel: 'Change',
    unit: 'Median minutes to first response', format: { digits: 0 }, highlight: best.label,
  });
}

export default {
  study: true,
  id: 'dumbbell',
  title: 'Dumbbell: paired change on one scale',
  className: 'st st--rail cs-civic-calm',
  notes: 'Purpose: Show before and after for each category on one shared scale, so the level and the change read together.\nModify: Replace `queues`; the headline count, the rail numbers and the change column recompute. Rename aLabel/bLabel to your two moments or conditions.\nInvariant: Both ends share one axis and unit; rows sort by change; the change column states its sign; a rise is reported, not hidden among falls.\nStatic: Already static. For a build, pass build:{by:"mark"} to reveal one row per click.',
  sources: [{ type: 'original-example', file: 'assets/svg/dumbbell.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${words[faster.length] ?? faster.length} of ${words[queues.length]?.toLowerCase() ?? queues.length} support queues now answer faster than in 2023</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b class="st-accent">−${fmt(best.a - best.b)} min</b><span><strong>${best.label}.</strong> Pre-filled questionnaires replaced the intake call.</span></div>
  <hr class="st-rule">
  <div class="st-kpi"><b>+${fmt(slower[0].b - slower[0].a)} min</b><span><strong>${slower[0].label}</strong> is the one queue that slowed.</span></div>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · median of business-hours tickets, Jan–Jun</span><span>Dumbbell chart</span></p>`,
};
