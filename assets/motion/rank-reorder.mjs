// Motion study · Reorder without losing identity — each source is one row group (name, bar,
// value) that keeps its colour. Build 1 changes the values in place, in the old order; build 2
// moves every row to its new rank (translation computed from the two orders). Rank slots stay.
import { svgRoot, el, g, linear, textLines, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const sources = [ // share of new sign-ups by first-touch source, % (illustrative)
  { label: 'Search', y2023: 34, y2025: 27 },
  { label: 'Direct', y2023: 22, y2025: 18 },
  { label: 'Partner sites', y2023: 13, y2025: 11 },
  { label: 'Social', y2023: 11, y2025: 9 },
  { label: 'Email', y2023: 8, y2025: 7 },
  { label: 'Review sites', y2023: 6, y2025: 5 },
  { label: 'Podcasts', y2023: 4, y2025: 4 },
  { label: 'AI assistants', y2023: 2, y2025: 19 },
];
const focus = 'AI assistants';
const years = [2023, 2025]; // the two columns above
const span = ['', 'one year', 'two years', 'three years', 'four years', 'five years'][years[1] - years[0]] || `${years[1] - years[0]} years`;
const rank = key => [...sources].sort((a, b) => b[key] - a[key] || sources.indexOf(a) - sources.indexOf(b)).map(s => s.label);
const before = rank('y2023'), after = rank('y2025');
const ordinal = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
const from = before.indexOf(focus), to = after.indexOf(focus);
for (const key of ['y2023', 'y2025']) if (Math.abs(sources.reduce((s, d) => s + d[key], 0) - 100) > 0.5) throw Error(`rank-reorder: ${key} shares do not sum to 100`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { t: 52, b: 6 };
  const rowH = (H - m.t - m.b) / sources.length, bh = rowH * 0.6;
  const x0 = 236, x = linear([0, 36], [x0, W - 120]);
  const rowY = i => m.t + i * rowH; // top of rank slot i
  const dur = 900;
  return svgRoot({ id: 'motion-rank-reorder-fig', width: W, height: H, theme: t,
    title: `Share of new sign-ups by first-touch source, ${years[0]} and ${years[1]}, ranked`,
    desc: `In ${years[0]} ${focus.toLowerCase()} ranked ${ordinal[from]} with ${sources.find(s => s.label === focus).y2023}% of sign-ups; in ${years[1]} they ranked ${ordinal[to]} with ${sources.find(s => s.label === focus).y2025}%. ${after[0]} stays first.` },
  textLines(['Share of new sign-ups'], { x: x0, y: 12, size: 16, fill: t.c('muted'), valign: 'top' }),
  [[years[0], 0, 0], [years[1], 1, null]].map(([yr, step, until]) => textLines([String(yr)], { x: W - 8, y: 4, size: 30, weight: 700, anchor: 'end', valign: 'top', fill: t.c('ink'),
    attrs: { 'data-step': step, 'data-until': until, 'data-motion': step ? 'reveal' : null } })),
  // rank slots do not move; rows move between them
  sources.map((_, i) => g({},
    textLines([String(i + 1)], { x: 18, y: rowY(i) + rowH / 2, size: 18, anchor: 'middle', valign: 'middle', fill: t.c('muted'), weight: 600 }),
    i ? el('line', { x1: 0, x2: W, y1: rowY(i), y2: rowY(i), stroke: t.c('grid') }) : '')),
  el('line', { x1: x0, x2: x0, y1: m.t, y2: H - m.b, stroke: t.c('rule'), 'stroke-width': 1.4 }),
  // draw the focus row last so it passes over the others while moving
  [...sources].sort((a, b) => (a.label === focus) - (b.label === focus)).map(s => {
    const i0 = before.indexOf(s.label), i1 = after.indexOf(s.label), hl = s.label === focus;
    const cy = rowY(i0) + rowH / 2, a = (x(s.y2025) - x0) / (x(s.y2023) - x0);
    const fill = hl ? t.c('accent') : t.c('context');
    return g({ 'data-states': { 0: { translate: '0px 0px' }, 2: { translate: `0px ${((i1 - i0) * rowH).toFixed(1)}px` } }, 'data-duration': dur, 'data-easing': 'smooth', style: 'transform-box:view-box' },
      textLines([s.label], { x: x0 - 14, y: cy, size: 18, anchor: 'end', valign: 'middle', fill: hl ? t.c('accent') : t.c('ink'), weight: hl ? 700 : null }),
      el('rect', { x: x0, y: cy - bh / 2, width: x(s.y2023) - x0, height: bh, rx: 3, fill,
        'data-states': { 0: { transform: 'matrix(1,0,0,1,0,0)' }, 1: { transform: `matrix(${a.toFixed(5)},0,0,1,${(x0 * (1 - a)).toFixed(2)},0)` } }, 'data-duration': dur, 'data-easing': 'smooth',
        style: 'transform-box:view-box;transform-origin:0 0' }),
      // the value rides on the bar end and counts to its new figure
      g({ 'data-states': { 0: { translate: '0px 0px' }, 1: { translate: `${(x(s.y2025) - x(s.y2023)).toFixed(1)}px 0px` } }, 'data-duration': dur, 'data-easing': 'smooth', style: 'transform-box:view-box' },
        textLines([`${s.y2023}%`], { x: x(s.y2023) + 10, y: cy, size: 18, valign: 'middle', weight: 700, fill: hl ? t.c('accent') : t.c('ink'), attrs: { 'data-step': 0, 'data-until': 0, 'font-variant-numeric': 'tabular-nums' } }),
        textLines([`${s.y2025}%`], { x: x(s.y2023) + 10, y: cy, size: 18, valign: 'middle', weight: 700, fill: hl ? t.c('accent') : t.c('ink'),
          attrs: { 'data-step': 1, 'data-motion': 'count', 'data-count-from': s.y2023, 'data-duration': dur, 'font-variant-numeric': 'tabular-nums' } }),
        hl ? textLines([`up from ${ordinal[from]}`], { x: x(s.y2023) + 64, y: cy, size: 17, valign: 'middle', fill: t.c('accent'), attrs: { 'data-step': 2, 'data-motion': 'reveal', 'data-delay': dur } }) : ''));
  }));
}

export default {
  study: true,
  id: 'motion-rank-reorder',
  title: 'Rank reorder: values change first, then rows move',
  className: 'st cs-keynote-dusk',
  notes: 'Purpose: Show a change of rank as two readable steps: values change in place, then each row moves to its new rank, carrying its name, colour and value.\nModify: Replace `sources` (two values per row) and `focus`; bar scales, counted values, row translations and the headline recompute. Ties keep their original order.\nInvariant: Every row is one group that moves as a unit; rank numbers are slots that stay put; values change before the order does, so no bar changes length and rank at once; only the focus row carries the accent.\nStatic: The final build shows the new ranking with values and the focus row’s former rank.',
  sources: [{ type: 'original-example', file: 'assets/motion/rank-reorder.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head"><em>${focus}</em> climbed from ${ordinal[from]} to ${ordinal[to]} place among sign-up sources in ${span}</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · first-touch attribution, January–June of each year</span><span>Motion · values update, then rows re-rank (2 builds)</span></p>`,
};
