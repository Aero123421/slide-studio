// Template: Product launch · Before and after on one time axis. Synthetic example content; replace data and copy.
// One return, two versions, one shared axis of days. Every bar, label and the headline come from the phase lists.
import { svgRoot, el, g, linear, textLines } from '../../runtime/figure.mjs';

const ID = 'tpl-launch-before-after';
const C = n => 64 + 98 * (n - 1);      // x of column n (12 columns of 74 px, 24 px gutters)
const span = (a, b) => 98 * (b - a) + 74;

// Minutes from the customer's request. kind: team = waiting on your team, customer, carrier, auto = done by 2.0.
// `after` marks phases that no longer hold up the refund. Sample data: the same item and reason, two comparable returns.
const lanes = [
  { name: '1.x', when: 'July 2026', phases: [
    { label: 'Agent queue', kind: 'team', min: 870 },
    { label: 'Customer', kind: 'customer', min: 1210 },   // printed a label, then dropped it off
    { label: 'Carrier', kind: 'carrier', min: 2415 },
    { label: 'Inspection queue', kind: 'team', min: 1520 },
  ] },
  { name: '2.0 beta', when: 'September 2026', phases: [
    { label: 'Approved by rule', kind: 'auto', min: 1 },
    { label: 'dropped off', kind: 'customer', min: 34 },
    { label: 'scanned and refunded', kind: 'auto', min: 2 },
    { label: 'Carrier', kind: 'carrier', min: 2415, after: true },
    { label: 'Graded, back on sale', kind: 'team', min: 35, after: true },
  ] },
];
for (const l of lanes) {
  let t = 0;
  for (const p of l.phases) { p.start = t; t += p.min; p.end = t; }
  l.refund = l.phases.filter(p => !p.after).at(-1).end;          // minutes until the money is back
}
const [before, after] = lanes;
const dur = m => m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}`;
const long = m => { const h = Math.round(m / 60), d = Math.floor(h / 24); return m < 60 ? `${m} minutes` : `${d ? `${d} day${d > 1 ? 's' : ''} ` : ''}${h % 24} hours`; };

// Geometry in the SVG's own coordinates (1152 × 404, drawn 1:1 at x 64, y 202: the axis labels' caps sit on y 208).
// Lane names sit in columns 1–2; the shared axis of days runs across columns 3–12.
const W = 1152, H = 404, DAYS = 5, AX = C(3) - 64;
const x = linear([0, DAYS * 1440], [AX, W]);
const fill = { team: 'var(--ln-grey)', customer: 'var(--ln-rule)', carrier: 'var(--ln-mark)', auto: 'var(--ln-green)' };
const BAR_Y = [96, 300], BAR = 30, THIN = 10;

const axis = g({},
  ...Array.from({ length: DAYS + 1 }, (_, d) => el('line', { x1: x(d * 1440), x2: x(d * 1440), y1: 32, y2: H - 4, stroke: d ? 'var(--ln-rule)' : 'var(--ln-ink)', 'stroke-width': 1 })),
  ...Array.from({ length: DAYS + 1 }, (_, d) => textLines([d ? `${d} day${d > 1 ? 's' : ''}` : 'Request'], { x: x(d * 1440), y: 18, anchor: d === 0 ? 'start' : d === DAYS ? 'end' : 'middle', cls: 'ln-t-axis' })));

function lane(l, top) {
  const parts = [textLines([l.name], { x: 0, y: top + BAR / 2 - 4, cls: 'ln-t-head' }), textLines([l.when], { x: 0, y: top + BAR / 2 + 20, cls: 'ln-t-grey' })];
  for (const p of l.phases) {
    // a 2 px paper gap separates touching phases (1 px trimmed from each side of an inner edge)
    const h = p.after ? THIN : BAR, y0 = top + (BAR - h) / 2, x0 = x(p.start) + (p.start ? 1 : 0), w = Math.max(2, x(p.end) - 1 - x0);
    parts.push(el('rect', { x: x0, y: y0, width: w, height: h, fill: fill[p.kind] }));
  }
  const rx = x(l.refund);   // the refund: a tick through the lane
  parts.push(el('line', { x1: rx, x2: rx, y1: top - 14, y2: top + BAR + 14, stroke: l === after ? 'var(--ln-green)' : 'var(--ln-ink)', 'stroke-width': 2 }));
  return parts;
}

// 1.x: the answer above the tick; phase names and durations under each phase.
const beforeLabels = g({},
  textLines([`Refund after ${long(before.refund)}`], { x: x(before.refund), y: BAR_Y[0] - 24, anchor: 'end', cls: 'ln-t-strong' }),
  ...before.phases.map(p => textLines([p.label, dur(p.min)], { x: x(p.start) + (p.start ? 8 : 0), y: BAR_Y[0] + BAR + 30, lineHeight: 1.3, cls: p.kind === 'team' ? 'ln-t-strong' : 'ln-t-grey' })));
// 2.0: the answer and what happened inside the sliver above the tick; the parcel's journey after it, under the track.
const pre = after.phases.filter(p => !p.after), post = after.phases.filter(p => p.after);
const afterLabels = g({},
  textLines([`Refund after ${long(after.refund)}`], { x: x(after.refund) - 2, y: BAR_Y[1] - 50, cls: 'ln-t-green' }),
  textLines([pre.map(p => `${p.label} in ${dur(p.min)}`).join(', ')], { x: x(after.refund) - 2, y: BAR_Y[1] - 26, cls: 'ln-t-grey' }),
  ...post.map((p, i) => textLines(i ? [p.label, `day ${Math.floor(p.end / 1440) + 1}`] : [p.label, `${dur(p.min)}, after the refund`],
    { x: i ? x(p.end) + 10 : x(p.start) + 8, y: BAR_Y[1] + BAR + 30, lineHeight: 1.3, cls: 'ln-t-grey' })));

const chart = svgRoot({
  id: `${ID}-fig`, width: W, height: H, className: 'ln-fig',
  title: 'One return in Fernhook 1.x and in 2.0, from request to refund, on one axis of days',
  desc: `1.x: ${before.phases.map(p => `${p.label} ${dur(p.min)}`).join(', ')}; refund after ${long(before.refund)}. 2.0: ${pre.map(p => `${p.label} ${dur(p.min)}`).join(', ')}; refund after ${long(after.refund)}. The parcel still spends ${dur(post[0].min)} with the carrier, after the refund.`,
}, axis, lane(before, BAR_Y[0]), lane(after, BAR_Y[1]), beforeLabels, afterLabels);

export default {
  study: true,
  id: ID,
  title: `Before and after: refund after ${long(before.refund)} in 1.x, ${long(after.refund)} in 2.0`,
  notes: 'Purpose: Prove the launch\'s main claim with one concrete case: where a return\'s time went before, and what is left of it now.\nModify: Edit the two phase lists (minutes from the request; kind team/customer/carrier/auto; after:true for steps that no longer hold up the refund) and the lane names. Bars, durations, both refund ticks, the headline and the description recompute. Raise DAYS if the slower lane is longer than five days.\nInvariant: Both lanes share one axis that starts at the request. Unchanged time (the carrier) stays visible in both lanes so the gain is not overstated. Green is 2.0 only; dark grey is time spent waiting on your team.\nStatic: No builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-launch ln-before-after',
  content: `<h2 class="ln-at ln-head" data-region="title" style="left:${C(1)}px;top:64px;width:${span(1, 11)}px">The same return: refunded after ${long(before.refund)} in 1.x, after ${long(after.refund)} in 2.0</h2>
<figure class="ln-at" data-region="primary" style="left:${C(1)}px;top:202px;width:${W}px;height:${H}px">${chart}</figure>
<p class="ln-at ln-note" data-region="source" style="left:${C(1)}px;top:645px;width:${span(1, 12)}px">The same item returned for the same reason in July (1.x) and September 2026 (2.0 beta), request to refund. Dark grey: waiting on your team. Sample data.</p>`,
};
