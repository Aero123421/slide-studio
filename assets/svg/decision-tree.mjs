// Diagram study · Decision tree — options, the conditions that follow each, and their payoffs.
// Conditions are written on the branches they govern. Payoffs are drawn as signed bars on one
// zero line, with each option's expected value marked between its outcomes. Expected values,
// the preferred option, the break-even probability and the headline are rolled back from data.
import { theme as makeTheme, svgRoot, el, g, textLines, linear, measureNode, drawNode, roundedPolyline, arrowMarker, fmt, sum } from '../runtime/figure.mjs';

const growth = 0.4; // probability that summer demand grows ≥ 3 %/yr (planning estimate)
const conditions = [{ key: 'grows', label: 'demand grows', p: growth }, { key: 'flat', label: 'demand flat', p: 1 - growth }];
const options = [ // 10-year NPV, € millions, under each condition (illustrative)
  { label: 'Buy a second vessel', grows: 9.6, flat: -3.2 },
  { label: 'Charter each summer', grows: 4.6, flat: 1.1 },
  { label: 'Keep one vessel', grows: -2.5, flat: 0 },
];
if (Math.abs(sum(conditions.map(c => c.p)) - 1) > 1e-9) throw Error('decision-tree: probabilities at a chance point must sum to 1');
const ev = (o, p = growth) => p * o.grows + (1 - p) * o.flat;
const ranked = [...options].sort((a, b) => ev(b) - ev(a));
const [best, next] = ranked;
// EV is linear in p, so the two leading options swap where their lines cross.
const breakEven = (next.flat - best.flat) / ((best.grows - best.flat) - (next.grows - next.flat));
const eur = (v, sign = false) => fmt(v, { digits: 1, prefix: '€', suffix: ' m', sign });
const pctText = v => `${fmt(v * 100, { digits: 0 })}%`;

export function figure(theme = 'css') {
  const t = makeTheme(theme), id = 'decision-tree-fig', W = 1152, H = 444, size = 19, ctx = { t, size };
  // Rows: two outcomes per option, a wider gap between options.
  const pitch = 60, groupGap = 30, rowsH = (options.length * conditions.length - 1) * pitch + (options.length - 1) * groupGap;
  const rowY = (i, k) => (H - rowsH) / 2 + 8 + (i * conditions.length + k) * pitch + i * groupGap;
  const groupY = i => (rowY(i, 0) + rowY(i, conditions.length - 1)) / 2;
  // Columns
  const rootNd = measureNode({ id: 'root', label: 'Add summer capacity?', sub: 'choose one, 2027–2036', fill: t.c('surface') }, { size, maxWidth: 230 });
  const optNds = options.map((o, i) => measureNode({ id: `o${i}`, label: o.label, sub: `expected ${eur(ev(o))}`, emphasis: o === best, fill: o === best ? null : t.c('surface') }, { size, maxWidth: 260 }));
  const optW = Math.max(...optNds.map(nd => nd.w)), optX = rootNd.w + 74, branchX = optX + optW + 30;
  const pays = options.flatMap(o => conditions.map(c => o[c.key]));
  const valueX = 860, x = linear([Math.min(0, ...pays), Math.max(0, ...pays)], [valueX + 26, W - 4]);
  Object.assign(rootNd, { x: 0, y: groupY(1) - rootNd.h / 2 });
  optNds.forEach((nd, i) => Object.assign(nd, { x: optX, w: optW, y: groupY(i) - nd.h / 2 }));

  const parts = [];
  // zero line and scale note for the payoff bars
  parts.push(el('line', { x1: x(0), x2: x(0), y1: rowY(0, 0) - 26, y2: rowY(options.length - 1, conditions.length - 1) + 22, stroke: t.c('rule'), 'stroke-width': 1.4 }));
  parts.push(textLines(['10-year NPV'], { x: valueX, y: rowY(0, 0) - 30, size: 16, anchor: 'end', valign: 'bottom', fill: t.c('muted'), weight: 600 }));
  parts.push(textLines(['0'], { x: x(0), y: rowY(options.length - 1, conditions.length - 1) + 26, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') }));
  // key: the tick is the expected value
  const ky0 = rowY(0, 0) - 30;
  parts.push(el('line', { x1: W - 132, x2: W - 132, y1: ky0 - 18, y2: ky0 + 2, stroke: t.c('ink'), 'stroke-width': 2.4, 'stroke-linecap': 'round' }),
    el('circle', { cx: W - 132, cy: ky0 - 8, r: 4, fill: t.c('ink') }),
    textLines(['expected value'], { x: W - 120, y: ky0, size: 16, valign: 'bottom', fill: t.c('muted'), weight: 600 }));
  options.forEach((o, i) => {
    const nd = optNds[i], em = o === best;
    // choice: root → option
    const p = [rootNd.x + rootNd.w, rootNd.y + rootNd.h / 2], q = [nd.x - 4, groupY(i)], mx = (p[0] + q[0]) / 2;
    parts.push(el('path', { d: roundedPolyline([p, [mx, p[1]], [mx, q[1]], q], 12), fill: 'none', stroke: em ? t.c('accent') : t.c('muted'), 'stroke-width': em ? 2.6 : 1.8, 'marker-end': `url(#${id}-arr${em ? '-em' : ''})` }));
    conditions.forEach((c, k) => {
      const y = rowY(i, k), v = o[c.key];
      // condition branch: option → outcome row, condition written on the branch
      parts.push(el('path', { d: roundedPolyline([[nd.x + nd.w, groupY(i)], [branchX, groupY(i)], [branchX, y], [valueX - 96, y]], 10), fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.6 }));
      parts.push(el('text', { x: branchX + 16, y: y - 8, 'font-size': 17, fill: t.c('ink'), 'font-weight': 600 }, c.label, el('tspan', { fill: t.c('muted'), 'font-weight': 400 }, `  p ${fmt(c.p, { digits: 2 })}`)));
      // payoff: value and signed bar from zero
      parts.push(textLines([eur(v, true)], { x: valueX, y, size: 18, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: 650, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
      if (v) parts.push(el('rect', { x: Math.min(x(0), x(v)), y: y - 11, width: Math.abs(x(v) - x(0)), height: 22, rx: 3, fill: em ? t.c('accent') : t.c('context') }));
    });
    // expected value: a tick between the option's outcomes, at the probability-weighted payoff
    const ex = x(ev(o)), y0 = rowY(i, 0) - 18, y1 = rowY(i, conditions.length - 1) + 18;
    parts.push(el('line', { x1: ex, x2: ex, y1: y0, y2: y1, stroke: t.c('ink'), 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
    parts.push(el('circle', { cx: ex, cy: groupY(i), r: 5, fill: t.c('ink'), stroke: t.c('paper'), 'stroke-width': 2 }));
  });
  parts.push(drawNode(rootNd, ctx), optNds.map(nd => drawNode(nd, ctx)));
  // key for the expected-value tick, and the break-even note
  const ky = H - 6;
  parts.push(textLines([`Buying overtakes chartering only if`, `growth is likelier than ${pctText(breakEven)}.`], { x: 0, y: ky, valign: 'bottom', size: 17, fill: t.c('muted'), lineHeight: 1.35 }));
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Decision tree for summer capacity on the island ferry route, 10-year NPV',
    desc: `A choice between ${options.length} options, each followed by two conditions written on its branches: demand grows (p ${fmt(growth, { digits: 2 })}) or stays flat (p ${fmt(1 - growth, { digits: 2 })}). Bars show the 10-year NPV under each condition from a shared zero; the dark tick marks each option's probability-weighted value. ${best.label} has the highest expected value, ${eur(ev(best))} against ${eur(ev(next))} for ${next.label.toLowerCase()}, unless the chance of growth exceeds ${pctText(breakEven)}.` },
  el('defs', {}, arrowMarker(`${id}-arr`, t.c('muted'), { size: 12 }), arrowMarker(`${id}-arr-em`, t.c('accent'), { size: 13 })), parts);
}

export default {
  study: true,
  id: 'decision-tree',
  title: 'Decision tree: outcomes under explicit conditions',
  className: 'st cs-strategy-dark',
  notes: 'Purpose: Show what each option leads to under explicit conditions, and which option is preferred given the stated probabilities.\nModify: Edit `growth`, `conditions` and `options` (payoff under each condition). Expected values, the highlighted option, the payoff bars, the break-even probability and the headline recompute.\nInvariant: Each condition is written on the branch it governs, with its probability; probabilities at a chance point sum to 1 (checked); payoffs share one unit, horizon and zero line; the tick is the probability-weighted value, not a forecast.\nStatic: Already static. For a build, reveal options first, then conditions and payoffs, then the expected-value ticks.',
  sources: [{ type: 'original-example', file: 'assets/svg/decision-tree.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head"><em>${best.label}</em> is the better bet unless growth is more likely than ${pctText(breakEven)}</h1>
<p class="st-dek">Expected value ${eur(ev(best))} against ${eur(ev(next))} for buying, with a ${pctText(growth)} chance of growth.</p>
<figure class="st-fig" style="top:214px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · NPV at 6% over 2027–2036, € millions</span><span>Decision tree with expected values</span></p>`,
};
