// Motion study · Land on a useful ending — the evidence is already on screen; build 1 lands the
// takeaway number (counting from where it started), build 2 adds the next step, and then
// nothing moves. Every number on the page is read from `median`.
import { svgRoot, el, g, textLines, linear, pathFromPoints, theme as makeTheme } from '../runtime/figure.mjs';

// Median days to approve a home-building permit, Jan 2024 – Dec 2025 (illustrative city).
const median = [41, 40, 42, 37, 33, 31, 30, 28, 27, 27, 26, 25, 22, 19, 17, 16, 15, 15, 14, 14, 13, 13, 12, 12];
const startMonth = { year: 2024, month: 1 };
const events = [{ i: 3, label: 'Online plan check' }, { i: 12, label: 'Second examiner team' }];
const target = 14; // days, the council's 2025 target
const next = { what: 'Same-day approval for rooftop solar and heat pumps', when: 'from 1 March' };
const monthName = i => new Date(startMonth.year, startMonth.month - 1 + i, 1).toLocaleString('en-GB', { month: 'short', year: 'numeric' });
const first = median[0], last = median.at(-1);
const metAt = median.findIndex(v => v <= target);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 800, H = 470, id = 'motion-ending-hold-fig';
  const x = linear([0, median.length - 1], [26, W - 54]), y = linear([0, 45], [H - 40, 20]);
  const pts = median.map((v, i) => [x(i), y(v)]);
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Median days to approve a home-building permit, monthly, 2024–2025',
    desc: `The median fell from ${first} days in ${monthName(0)} to ${last} in ${monthName(median.length - 1)}, below the ${target}-day target from ${monthName(metAt)}. Drops follow the ${events.map(e => e.label.toLowerCase()).join(' and the ')}.` },
  [0, 15, 30, 45].map(v => g({}, el('line', { x1: 0, x2: W, y1: y(v), y2: y(v), stroke: v ? t.c('grid') : t.c('rule'), 'stroke-width': v ? 1 : 1.4 }),
    textLines([String(v)], { x: 0, y: y(v) - 6, size: 15, fill: t.c('muted') }))),
  textLines(['days'], { x: 26, y: y(45) - 6, size: 15, fill: t.c('muted') }),
  el('line', { x1: 0, x2: W, y1: y(target), y2: y(target), stroke: t.c('muted'), 'stroke-width': 1.4, 'stroke-dasharray': '5 5' }),
  textLines([`target ${target} days`], { x: W, y: y(target) - 8, size: 15, anchor: 'end', fill: t.c('muted') }),
  events.map(e => g({}, el('line', { x1: x(e.i), x2: x(e.i), y1: y(median[e.i]) - 14, y2: y(45) + 18, stroke: t.c('muted'), 'stroke-width': 1.2 }),
    textLines([e.label], { x: x(e.i) + 8, y: y(45) + 26, size: 16, valign: 'middle', fill: t.c('ink') }))),
  el('path', { d: pathFromPoints(pts), fill: 'none', stroke: t.c('ink'), 'stroke-width': 3, 'stroke-linejoin': 'round' }),
  el('circle', { cx: pts[0][0], cy: pts[0][1], r: 5, fill: t.c('ink') }),
  textLines([String(first)], { x: pts[0][0] + 10, y: pts[0][1] - 14, size: 18, weight: 700, fill: t.c('ink') }),
  el('circle', { cx: pts.at(-1)[0], cy: pts.at(-1)[1], r: 7, fill: t.c('accent') }),
  textLines([String(last)], { x: pts.at(-1)[0] + 12, y: pts.at(-1)[1], size: 20, weight: 700, valign: 'middle', fill: t.c('accent') }),
  [0, 12, median.length - 1].map(i => textLines([monthName(i)], { x: x(i), y: H - 26, size: 15, anchor: i ? (i === median.length - 1 ? 'end' : 'middle') : 'start', valign: 'top', fill: t.c('muted') })));
}

export default {
  study: true,
  id: 'motion-ending-hold',
  title: 'Land on a useful ending',
  className: 'st st--left cs-keynote-dusk',
  notes: 'Purpose: Finish with a stable takeaway: the number lands, the next step is stated, and the page then holds still (no loop, no idle motion).\nModify: Replace `median`, `events`, `target` and `next`. The big number, its count-from value, the chart labels and the headline are read from the data.\nInvariant: The evidence is on screen before the takeaway; the takeaway counts from the starting value, once; the last build adds the action and nothing moves afterwards.\nStatic: The final build is the complete closing page: evidence, number and next step.',
  sources: [{ type: 'original-example', file: 'assets/motion/ending-hold.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Home-building permits now clear in a median <em>${last} days</em>, down from ${first}</h1>
<div class="st-rail" data-region="support">
  <p class="st-num" style="color:var(--ss-accent)" data-step="1" data-motion="count" data-count-from="${first}" data-duration="1000">${last}<small>days</small></p>
  <p class="st-text st-muted" data-step="1" data-motion="reveal" data-delay="300">median wait in ${monthName(median.length - 1)}, against ${first} in ${monthName(0)}</p>
  <hr class="st-rule" data-step="2" data-motion="reveal">
  <p class="st-text" data-step="2" data-motion="reveal" data-delay="200"><strong>Next:</strong> ${next.what.toLowerCase()}, ${next.when}.</p>
</div>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · monthly median, residential permits</span><span>Motion · number lands, next step, then hold (2 builds)</span></p>`,
};
