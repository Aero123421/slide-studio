// Motion study · Pull apart independent factors — revenue is visits × conversion × average order.
// Build 0 shows revenue alone. Build 1 moves the revenue panel (one group, one computed transform;
// its labels travel separately so they keep their size) into the first of four panels, and the
// three factors enter beside it on the same index scale. Build 2 states each factor's change.
// Factors are shown side by side, never stacked: their changes multiply and are not shares.
import { svgRoot, el, g, linear, textLines, pathFromPoints, measureText, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const quarters = ['Q1 2024', 'Q2', 'Q3', 'Q4', 'Q1 2025', 'Q2', 'Q3', 'Q4 2025'];
const raw = { // online boutique, per quarter (illustrative)
  visits: [412, 428, 449, 466, 478, 490, 503, 511], // thousand sessions
  conversion: [1.84, 1.80, 1.77, 1.75, 1.71, 1.67, 1.64, 1.62], // % of sessions with an order
  order: [386, 389, 390, 393, 394, 397, 398, 398], // average order value, €
};
const revenue = raw.visits.map((v, i) => v * 1000 * (raw.conversion[i] / 100) * raw.order[i]); // €, the identity itself
const index = a => a.map(v => (v / a[0]) * 100);
const panels = [
  { key: 'revenue', title: 'Revenue', values: index(revenue), from: `€${fmt(revenue[0] / 1e6, { digits: 2 })}m`, to: `€${fmt(revenue.at(-1) / 1e6, { digits: 2 })}m` },
  { key: 'visits', title: 'Visits', values: index(raw.visits), from: `${raw.visits[0]}k`, to: `${raw.visits.at(-1)}k` },
  { key: 'conversion', title: 'Conversion rate', values: index(raw.conversion), from: `${fmt(raw.conversion[0], { digits: 2 })}%`, to: `${fmt(raw.conversion.at(-1), { digits: 2 })}%` },
  { key: 'order', title: 'Average order', values: index(raw.order), from: `€${raw.order[0]}`, to: `€${raw.order.at(-1)}` },
];
const pct = p => Math.round(p.values.at(-1) - 100);
const [rev, vis, conv, ord] = panels;
// would revenue have fallen without the extra visits? (the other two factors' product below 1)
const onlyBecause = (conv.values.at(-1) / 100) * (ord.values.at(-1) / 100) < 1;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470;
  const top = 92, bottom = 372, left = 46, gap = 80;
  const pw = (W - left - gap * 3) / 4;
  const y = linear([80, 130], [bottom, top]); // one index scale for every panel
  const box = j => ({ x: left + j * (pw + gap), w: pw });
  const big = { x: (W - 560) / 2, w: 560 }; // revenue alone, before the separation
  const dur = 1000;
  const linePath = (vals, b) => pathFromPoints(vals.map((v, i) => [b.x + (i / (vals.length - 1)) * b.w, y(v)]));
  // the panel body: gridlines, the 100 line and the series, drawn in box `b`
  const body = (p, b, accent) => g({},
    [80, 90, 110, 120, 130].map(v => el('line', { x1: b.x, x2: b.x + b.w, y1: y(v), y2: y(v), stroke: t.c('grid'), 'vector-effect': 'non-scaling-stroke' })),
    el('line', { x1: b.x, x2: b.x + b.w, y1: y(100), y2: y(100), stroke: t.c('muted'), 'stroke-width': 1.4, 'vector-effect': 'non-scaling-stroke' }),
    el('path', { d: linePath(p.values, b), fill: 'none', stroke: accent ? t.c('accent') : t.c('ink'), 'stroke-width': 3.2, 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' }));
  // text that belongs to a panel but must not scale: positioned for `b`, moved by its own translation
  const labels = (p, b, accent) => g({},
    textLines([p.title], { x: b.x, y: top - 34, size: 19, weight: 700, fill: accent ? t.c('accent') : t.c('ink') }),
    textLines([fmt(p.values.at(-1), { digits: 0 })], { x: b.x + b.w, y: y(p.values.at(-1)) - 14, size: 18, weight: 700, anchor: 'end', fill: accent ? t.c('accent') : t.c('ink'), halo: t.c('paper') }),
    textLines([quarters[0]], { x: b.x, y: bottom + 10, size: 15, fill: t.c('muted'), valign: 'top' }),
    textLines([quarters.at(-1)], { x: b.x + b.w, y: bottom + 10, size: 15, fill: t.c('muted'), valign: 'top', anchor: 'end' }));
  const a = pw / big.w, bb = box(0).x - a * big.x; // big box → first panel: x' = a·x + bb
  const move = { 'data-duration': dur, 'data-easing': 'smooth' };
  return svgRoot({ id: 'motion-factor-separation-fig', width: W, height: H, theme: t,
    title: `Online revenue and its three factors, quarterly index, ${quarters[0]} = 100`,
    desc: `Revenue ${fmt(pct(rev), { sign: true })}%: visits ${fmt(pct(vis), { sign: true })}%, conversion ${fmt(pct(conv), { sign: true })}%, average order ${fmt(pct(ord), { sign: true })}%. The factors multiply (${[vis, conv, ord].map(p => fmt(p.values.at(-1) / 100, { digits: 2 })).join(' × ')} ≈ ${fmt(rev.values.at(-1) / 100, { digits: 2 })}).` },
  // shared index scale, labelled once at the far left; it moves with the revenue panel
  g({ 'data-states': { 0: { translate: '0px 0px' }, 1: { translate: `${(box(0).x - big.x).toFixed(1)}px 0px` } }, ...move, style: 'transform-box:view-box' },
    [80, 100, 120].map(v => textLines([String(v)], { x: big.x - 8, y: y(v), size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
  // revenue: one coordinate system that shrinks into the first panel
  g({ 'data-states': { 0: { transform: 'matrix(1,0,0,1,0,0)' }, 1: { transform: `matrix(${a.toFixed(5)},0,0,1,${bb.toFixed(2)},0)` } }, ...move, style: 'transform-box:view-box;transform-origin:0 0' },
    body(rev, big, true)),
  g({ 'data-states': { 0: { translate: '0px 0px' }, 1: { translate: `${(box(0).x - big.x).toFixed(1)}px 0px` } }, ...move, style: 'transform-box:view-box' },
    textLines([rev.title], { x: big.x, y: top - 34, size: 19, weight: 700, fill: t.c('accent') }),
    textLines([quarters[0]], { x: big.x, y: bottom + 10, size: 15, fill: t.c('muted'), valign: 'top' })),
  g({ 'data-states': { 0: { translate: '0px 0px' }, 1: { translate: `${(box(0).x + pw - big.x - big.w).toFixed(1)}px 0px` } }, ...move, style: 'transform-box:view-box' },
    textLines([fmt(rev.values.at(-1), { digits: 0 })], { x: big.x + big.w, y: y(rev.values.at(-1)) - 14, size: 18, weight: 700, anchor: 'end', fill: t.c('accent'), halo: t.c('paper') }),
    textLines([quarters.at(-1)], { x: big.x + big.w, y: bottom + 10, size: 15, fill: t.c('muted'), valign: 'top', anchor: 'end' })),
  // build 1: the factors enter beside it, joined by the identity's operators
  ['=', '×', '×'].map((op, j) => textLines([op], { x: box(j).x + pw + gap / 2, y: y(105), size: 40, weight: 300, anchor: 'middle', valign: 'middle', fill: t.c('muted'),
    attrs: { 'data-step': 1, 'data-motion': 'reveal', 'data-delay': dur - 200 + j * 160 } })),
  [vis, conv, ord].map((p, k) => g({ 'data-step': 1, 'data-motion': 'reveal', 'data-delay': dur - 100 + k * 160, 'data-duration': 450 },
    body(p, box(k + 1), false), labels(p, box(k + 1), false))),
  // build 2: what changed, in each factor's own units
  panels.map((p, j) => g({ 'data-step': 2, 'data-motion': 'reveal', 'data-delay': j * 120 },
    textLines([`${fmt(pct(p), { sign: true })}%`], { x: box(j).x, y: bottom + 56, size: 22, weight: 700, fill: j ? t.c('ink') : t.c('accent') }),
    textLines([`${p.from} → ${p.to}`], { x: box(j).x + measureText(`${fmt(pct(p), { sign: true })}%`, 22, { weight: 700 }) + 12, y: bottom + 56, size: 16, fill: t.c('muted') }))));
}

export default {
  study: true,
  id: 'motion-factor-separation',
  title: 'Factor separation: a product pulled apart, side by side',
  className: 'st cs-luxury-noir',
  notes: 'Purpose: Separate a quantity into the independent factors it is the product of, shown side by side on one scale, without implying that each factor contributed a measurable share.\nModify: Replace `raw` (one series per factor) and the identity in `revenue`; indices, the panel transform, labels and the headline recompute.\nInvariant: The revenue panel moves and narrows as one coordinate system (one computed transform) while its labels travel at full size; all panels share one index scale; factors sit next to each other, never stacked; the page says the changes multiply.\nStatic: The final build shows the four panels, the operators and each factor’s change in its own units.',
  sources: [{ type: 'original-example', file: 'assets/motion/motion-factor-separation.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Online <em>revenue</em> rose ${pct(rev)}% ${onlyBecause ? 'only because' : 'as'} visits rose ${pct(vis)}%; conversion fell ${Math.abs(pct(conv))}%</h1>
<p class="st-dek">Revenue = visits × conversion rate × average order. Changes multiply; they are not shares.</p>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · online boutique, eight quarters; index ${quarters[0]} = 100</span><span>Motion · one panel separated into its factors (2 builds)</span></p>`,
};
