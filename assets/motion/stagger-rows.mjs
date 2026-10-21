// Motion study · Build comparable rows — every row starts at the same zero. Build 0 shows the
// pilot line alone, in its final row; build 1 adds the other lines one after another, in rank
// order; build 2 adds the plant median and points at the line that fills the same product.
import { svgRoot, el, g, linear, band, textLines, barPath, measureText, median, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const lines = [ // median changeover time, minutes, third quarter, Hollin Dairy packaging hall (illustrative)
  { label: 'Line 1', product: 'milk bottles', minutes: 47 },
  { label: 'Line 2', product: 'yoghurt cups', minutes: 39 },
  { label: 'Line 3', product: 'milk bottles', minutes: 52 },
  { label: 'Line 4', product: 'yoghurt cups', minutes: 18, pilot: true },
  { label: 'Line 5', product: 'juice cartons', minutes: 44 },
  { label: 'Line 6', product: 'cheese blocks', minutes: 61 },
  { label: 'Line 7', product: 'juice cartons', minutes: 35 },
  { label: 'Line 8', product: 'cream pots', minutes: 41 },
  { label: 'Line 9', product: 'cream pots', minutes: 56 },
];
const rows = [...lines].sort((a, b) => a.minutes - b.minutes);
const pilot = rows.find(r => r.pilot);
const twin = rows.find(r => !r.pilot && r.product === pilot.product); // same product, old method
const plant = median(lines.map(l => l.minutes));
const ratio = pilot.minutes / plant;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 800, H = 470, m = { t: 14, b: 40, r: 70 };
  const nameW = Math.max(...rows.map(r => measureText(r.label, 18, { weight: 700 }))), prodW = Math.max(...rows.map(r => measureText(r.product, 16)));
  const x0 = nameW + prodW + 34;
  const x = linear([0, 70], [x0, W - m.r]);
  const y = band(rows.map(r => r.label), [m.t, H - m.b], { inner: 0.34, outer: 0.08 });
  const others = rows.filter(r => !r.pilot);
  return svgRoot({ id: 'motion-stagger-rows-fig', width: W, height: H, theme: t,
    title: 'Median changeover time by packaging line, minutes',
    desc: `${pilot.label} changes over in ${pilot.minutes} minutes after the pilot; the plant median is ${plant}. ${twin.label}, which fills the same ${twin.product}, takes ${twin.minutes}.` },
  [0, 15, 30, 45, 60].map(v => g({},
    el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b, stroke: v ? t.c('grid') : t.c('ink'), 'stroke-width': v ? 1 : 1.6 }),
    textLines([v ? `${v}` : '0 min'], { x: x(v), y: H - m.b + 10, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') }))),
  rows.map(r => {
    const k = others.indexOf(r), cy = y.center(r.label);
    const enter = r.pilot ? {} : { 'data-step': 1, 'data-motion': 'reveal', 'data-delay': k * 110, 'data-duration': 300 };
    return g({},
      textLines([r.label], { x: 0, y: cy, size: 18, valign: 'middle', fill: r.pilot ? t.c('accent') : t.c('ink'), weight: r.pilot || r === twin ? 700 : null, attrs: enter }),
      textLines([r.product], { x: nameW + 14, y: cy, size: 16, valign: 'middle', fill: t.c('muted'), attrs: enter }),
      el('path', { d: barPath(x(0), y(r.label), x(r.minutes) - x(0), y.bw, 3, 'right'), fill: r.pilot ? t.c('accent') : t.c('context'), style: 'transform-origin:0% 50%',
        ...(r.pilot ? {} : { 'data-step': 1, 'data-motion': 'grow-x', 'data-delay': k * 110, 'data-duration': 560, 'data-easing': 'decelerate' }) }),
      textLines([r.pilot ? `${r.minutes} minutes` : `${r.minutes}`], { x: x(r.minutes) + 8, y: cy, size: 17, valign: 'middle', weight: r.pilot ? 700 : 600, fill: r.pilot ? t.c('accent') : t.c('ink'),
        attrs: { 'font-variant-numeric': 'tabular-nums', ...(r.pilot ? {} : { 'data-step': 1, 'data-motion': 'reveal', 'data-delay': k * 110 + 380 }) } }));
  }),
  // build 2: the reference the rows are read against, and the like-for-like comparison
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-duration': 500 },
    // the median line breaks wherever a row's value label would sit on it
    rows.map((r, i) => {
      const lab = r.pilot ? `${r.minutes} minutes` : `${r.minutes}`, lx = x(r.minutes) + 8, lw = measureText(lab, 17, { weight: 700 });
      const hit = x(plant) >= lx - 3 && x(plant) <= lx + lw + 3;
      const y0 = i ? y(r.label) - (y.step - y.bw) / 2 : m.t - 4, y1 = i < rows.length - 1 ? y(r.label) + y.bw + (y.step - y.bw) / 2 : H - m.b;
      return hit ? '' : el('line', { x1: x(plant), x2: x(plant), y1: y0, y2: y1, stroke: t.c('ink'), 'stroke-width': 1.6, 'stroke-dasharray': '5 4' });
    }),
    textLines([`Plant median ${plant}`], { x: x(plant) + 8, y: y.center(pilot.label), size: 16, weight: 650, valign: 'middle', fill: t.c('ink') }),
    textLines([`same ${twin.product}, old method`], { x: x(twin.minutes) + 44, y: y.center(twin.label), size: 16, valign: 'middle', fill: t.c('muted') })));
}

export default {
  study: true,
  id: 'motion-stagger-rows',
  title: 'Stagger rows: comparable units added from one origin',
  className: 'st st--left cs-manufacturing-plant',
  notes: 'Purpose: Introduce one unit, then add comparable units one after another from the same zero, so the audience judges the first against its peers rather than in isolation.\nModify: Replace `lines` and mark the subject with `pilot: true`; row order, the stagger, the median, the like-for-like row and the headline recompute.\nInvariant: Every bar grows from the same zero line; the subject sits in its final rank from build 0, so nothing reflows when peers arrive; the stagger follows rank order; the reference (median) arrives only after all rows.\nStatic: The final build shows every row, the median and the like-for-like note.',
  sources: [{ type: 'original-example', file: 'assets/motion/stagger-rows.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">After the quick-changeover pilot, ${pilot.label} switches products in <em>${pilot.minutes}&nbsp;minutes</em> — ${ratio < 0.5 ? 'less than half' : `${Math.round(ratio * 100)}% of`} the plant median</h1>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b class="st-accent">${pilot.minutes} min</b><span>${pilot.label} after the pilot: moulds pre-staged and cleaning done while the line still runs.</span></div>
  <hr class="st-rule" data-step="2" data-motion="reveal">
  <div class="st-kpi" data-step="2" data-motion="reveal" data-delay="300"><b>${plant} min</b><span>Median of all ${lines.length} lines. ${twin.label}, on the same ${twin.product}, takes ${twin.minutes}.</span></div>
</div>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · median of all changeovers, July–September</span><span>Motion · staggered rows from a shared zero (2 builds)</span></p>`,
};
