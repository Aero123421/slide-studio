// Motion study · Keep the estimate fixed while the interval changes — one accuracy, one axis,
// three test-set sizes. The 95% interval (Wilson) is recomputed for each size and the same
// interval mark contracts around the estimate; earlier extents stay behind as faint ghosts.
import { svgRoot, el, g, linear, textLines, theme as makeTheme, fmt, normalQuantile } from '../runtime/figure.mjs';

const runs = [ // the candidate model scored on growing held-out test sets (illustrative)
  { items: 250, correct: 228 }, { items: 1000, correct: 912 }, { items: 4000, correct: 3648 },
];
const bar = 0.90; // release bar: accuracy the model must clear
const z = normalQuantile(0.975);
const wilson = ({ items: n, correct: k }) => {
  const p = k / n, d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d;
  const h = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / d;
  return { p, lo: c - h, hi: c + h };
};
const ci = runs.map(wilson);
const p = ci[0].p; // identical in every run by construction
if (ci.some(c => Math.abs(c.p - p) > 1e-9)) throw Error('interval-contraction: the estimate must stay fixed across runs');
const clears = ci.map(c => c.lo > bar);
const firstClear = clears.indexOf(true);
const pc = v => fmt(v * 100, { digits: 1 });
const pb = fmt(bar * 100); // the bar as written, without forced decimals
const halfWidth = ci.map(c => (c.hi - c.lo) * 50); // ± percentage points

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 800, H = 470, m = { l: 30, r: 30 };
  const x = linear([0.85, 0.96], [m.l, W - m.r]);
  const rowY = 262, axisY = 372, cap = 18, dur = 900;
  const states = f => Object.fromEntries(ci.map((c, k) => [k, f(c, k)]));
  // x' = a·x + b maps the first interval onto each later one (transform in user units)
  const mat = c => { const a = (x(c.hi) - x(c.lo)) / (x(ci[0].hi) - x(ci[0].lo)), b = x(c.lo) - a * x(ci[0].lo); return `matrix(${a.toFixed(5)},0,0,1,${b.toFixed(2)},0)`; };
  return svgRoot({ id: 'motion-interval-contraction-fig', width: W, height: H, theme: t,
    title: `95% interval around a fixed ${pc(p)}% accuracy for test sets of ${runs.map(r => fmt(r.items)).join(', ')} items`,
    desc: `The estimate stays at ${pc(p)}%. Its 95% interval narrows from ${pc(ci[0].lo)}–${pc(ci[0].hi)}% to ${pc(ci.at(-1).lo)}–${pc(ci.at(-1).hi)}% and clears the ${pb}% release bar only with ${fmt(runs[firstClear].items)} items.` },
  // the size of the evidence, counted up as it grows
  runs.map((r, k) => textLines([`${fmt(r.items)} test items`], { x: m.l, y: 30, size: 30, weight: 700, fill: t.c('ink'), valign: 'top',
    attrs: { 'data-step': k, 'data-until': k < runs.length - 1 ? k : null, 'data-motion': k ? 'count' : null, 'data-count-from': k ? runs[k - 1].items : null, 'data-duration': dur } })),
  textLines(['scored by the candidate model, 95% interval'], { x: m.l, y: 72, size: 16, fill: t.c('muted'), valign: 'top' }),
  // fixed frame: axis and release bar
  x.ticks(11).map(v => g({}, el('line', { x1: x(v), x2: x(v), y1: axisY, y2: axisY + 6, stroke: t.c('rule') }),
    textLines([`${fmt(v * 100, { digits: 0 })}%`], { x: x(v), y: axisY + 14, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') }))),
  el('line', { x1: m.l, x2: W - m.r, y1: axisY, y2: axisY, stroke: t.c('ink'), 'stroke-width': 1.3 }),
  textLines(['Accuracy on the test set'], { x: W - m.r, y: axisY + 46, size: 16, anchor: 'end', fill: t.c('muted'), valign: 'top' }),
  el('line', { x1: x(bar), x2: x(bar), y1: 150, y2: axisY, stroke: t.c('ink'), 'stroke-width': 1.5, 'stroke-dasharray': '5 5' }),
  textLines([`Release bar ${pb}%`], { x: x(bar) - 8, y: 154, size: 16, weight: 650, anchor: 'end', valign: 'top', fill: t.c('ink') }),
  // ghosts: each earlier extent stays behind, labelled by its sample size, once the interval moves on
  ci.slice(0, -1).map((c, k) => g({ 'data-step': k + 1 },
    el('line', { x1: x(c.lo), x2: x(c.hi), y1: rowY, y2: rowY, stroke: t.c('context'), 'stroke-width': 2 }),
    [c.lo, c.hi].map(v => el('line', { x1: x(v), x2: x(v), y1: rowY - 12, y2: rowY + 12, stroke: t.c('context'), 'stroke-width': 2.5 })),
    textLines([fmt(runs[k].items)], { x: x(c.lo), y: rowY - 20, size: 15, anchor: 'middle', fill: t.c('muted') }))),
  // the interval: one mark that contracts, caps that travel with its ends
  el('line', { x1: x(ci[0].lo), x2: x(ci[0].hi), y1: rowY, y2: rowY, stroke: t.c('ink'), 'stroke-width': 8, 'vector-effect': 'non-scaling-stroke',
    'data-states': states(c => ({ transform: mat(c) })), 'data-duration': dur, 'data-easing': 'smooth', style: 'transform-box:view-box;transform-origin:0 0' }),
  ['lo', 'hi'].map(end => el('line', { x1: x(ci[0][end]), x2: x(ci[0][end]), y1: rowY - cap, y2: rowY + cap, stroke: t.c('ink'), 'stroke-width': 3.5,
    'data-states': states(c => ({ translate: `${(x(c[end]) - x(ci[0][end])).toFixed(2)}px 0px` })), 'data-duration': dur, 'data-easing': 'smooth', style: 'transform-box:view-box' })),
  ci.map((c, k) => g({ 'data-step': k, 'data-until': k < ci.length - 1 ? k : null, 'data-motion': k ? 'reveal' : null, 'data-delay': k ? dur - 150 : null },
    // inside the caps, so a label never sits on the release-bar line beside it
    textLines([pc(c.lo)], { x: x(c.lo) + 2, y: rowY + 30, size: 17, anchor: 'start', valign: 'top', fill: t.c('ink'), weight: 650 }),
    textLines([pc(c.hi)], { x: x(c.hi) - 2, y: rowY + 30, size: 17, anchor: 'end', valign: 'top', fill: t.c('ink'), weight: 650 }))),
  // the estimate never moves
  el('circle', { cx: x(p), cy: rowY, r: 11, fill: t.c('accent'), stroke: t.c('paper'), 'stroke-width': 3 }),
  textLines([`${pc(p)}%`], { x: x(p), y: rowY - 26, size: 22, weight: 700, anchor: 'middle', fill: t.c('accent') }));
}

const cell = 'padding:7px 0;border-top:1px solid var(--ss-rule);font-variant-numeric:tabular-nums';
export default {
  study: true,
  id: 'motion-interval-contraction',
  title: 'Interval contraction: same estimate, more evidence',
  className: 'st st--rail cs-ml-eval',
  notes: 'Purpose: Show uncertainty shrinking around one stable estimate as the sample grows, on one unchanged axis, so the audience sees precision change and nothing else.\nModify: Replace `runs` (items, correct) and `bar`; Wilson intervals, the contraction transform, ghosts, table and headline recompute. Keep the estimate equal across runs, or say in the notes why it moved.\nInvariant: The axis and the estimate never move; one interval mark contracts by a transform computed from the two intervals; earlier extents remain as ghosts; the interval definition (95%, Wilson) is stated.\nStatic: The final build shows the narrowest interval, both ghosts and the full table, so every size is in the PDF.',
  sources: [{ type: 'original-example', file: 'assets/motion/motion-interval-contraction.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">The same <em>${pc(p)}%</em> accuracy clears the ${pb}% release bar only on the ${fmt(runs[firstClear].items)}-item test set</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <table class="st-text" style="border-collapse:collapse;width:100%;font-size:20px">
    <tr style="color:var(--ss-muted);font-size:16px"><th style="text-align:left;font-weight:600;padding-bottom:6px">Items</th><th style="text-align:left;font-weight:600">95% interval</th><th style="text-align:right;font-weight:600">Clears?</th></tr>
    ${runs.map((r, k) => `<tr data-step="${k}"${k ? ' data-motion="reveal" data-delay="700"' : ''}><td style="${cell}">${fmt(r.items)}</td><td style="${cell}">${pc(ci[k].lo)}–${pc(ci[k].hi)}%</td><td style="${cell};text-align:right;font-weight:650;${clears[k] ? 'color:var(--ss-accent)' : ''}">${clears[k] ? 'Yes' : 'No'}</td></tr>`).join('\n    ')}
  </table>
  <p class="st-text st-muted" style="font-size:18px">The interval narrows with the square root of the sample: ±${halfWidth.map(h => fmt(h, { digits: 1 })).join(', ±')} points.</p>
  <p class="st-text st-muted" style="font-size:16px">Wilson score intervals; the same items are reused as the set grows.</p>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · ${fmt(runs.at(-1).items)} held-out items, nested samples</span><span>Motion · interval contracts around a fixed estimate (2 builds)</span></p>`,
};
