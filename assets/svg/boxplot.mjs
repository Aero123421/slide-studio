// Diagram study · Box plot — median, quartiles, whiskers and outliers, with every cycle shown.
// Quartiles, Tukey whiskers (1.5 × IQR) and outliers come from the engine's boxStats() on raw
// cycle times. The reading guide is written onto the real box the headline is about.
import { svgRoot, el, g, textLines, linear, band, axis, bracket, niceDomain, extent, boxStats,
  rng, fmt, pct, theme as makeTheme } from '../runtime/figure.mjs';

// Final-assembly cycle time, seconds, 64 consecutive cycles per line and shift (illustrative).
// Each cycle = standard work + occasional short waits + rare stoppages (parts, rework).
const rand = rng(34);
const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const r1 = v => Math.round(v * 10) / 10;
const cycles = (n, base, sd, pWait, meanWait, pStop) => Array.from({ length: n }, () => r1(base + sd * normal() +
  (rand() < pWait ? -meanWait * Math.log(1 - rand()) : 0) + (rand() < pStop ? 12 + 14 * rand() : 0)));
const groups = [
  { label: 'Line 1, day', values: cycles(64, 61.2, 2.2, 0.25, 2, 0.015) },
  { label: 'Line 1, night', values: cycles(64, 61.4, 2.3, 0.3, 2.2, 0.02) },
  { label: 'Line 2, day', values: cycles(64, 61.6, 2.2, 0.3, 2, 0.02) },
  { label: 'Line 2, night', values: cycles(64, 59.6, 2.4, 0.6, 5, 0.06) },
];
const takt = 66; // seconds available per unit at current demand
const focusLabel = 'Line 2, night', peerLabel = 'Line 2, day';
const order = [focusLabel, peerLabel, 'Line 1, night', 'Line 1, day']; // the comparison first

const stats = new Map(groups.map(gp => [gp.label, { ...gp, s: boxStats(gp.values) }]));
const fs = stats.get(focusLabel).s, ps = stats.get(peerLabel).s;
const spread = fs.iqr / ps.iqr, medianGap = Math.abs(fs.median - ps.median);
const over = label => stats.get(label).values.filter(v => v > takt).length / stats.get(label).values.length;
const s1 = v => fmt(v, { digits: 1 });

// One-sided dot stacking: each cycle gets the lowest free level, so no two dots overlap.
function stack(xs, gapPx) {
  const placed = [], level = new Array(xs.length);
  xs.map((px, i) => [px, i]).sort((a, b) => a[0] - b[0]).forEach(([px, i]) => {
    let l = 0;
    while (placed.some(q => q.l === l && Math.abs(q.x - px) < gapPx)) l++;
    placed.push({ x: px, l }); level[i] = l;
  });
  return level;
}

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 236, r: 34, t: 66, b: 56 };
  const x = linear(niceDomain(extent(groups.flatMap(gp => gp.values)), 4), [m.l, W - m.r]);
  const rows = band(order, [m.t, H - m.b], { inner: 0, outer: 0 });
  const bh = 28, dot = 3;
  const row = label => {
    const { values, s } = stats.get(label), hl = label === focusLabel;
    const cy = rows(label) + 18, line = hl ? t.c('accent') : t.c('ink');
    const lv = stack(values.map(x), 2 * dot + 0.8);
    return g({ class: 'box-row' },
      values.map((v, i) => el('circle', { cx: x(v), cy: cy + bh / 2 + 8 + lv[i] * (2 * dot + 0.4), r: dot, fill: t.c('context') })),
      el('line', { x1: x(s.lo), x2: x(s.q1), y1: cy, y2: cy, stroke: t.c('ink'), 'stroke-width': 1.6 }),
      el('line', { x1: x(s.q3), x2: x(s.hi), y1: cy, y2: cy, stroke: t.c('ink'), 'stroke-width': 1.6 }),
      [s.lo, s.hi].map(v => el('line', { x1: x(v), x2: x(v), y1: cy - 8, y2: cy + 8, stroke: t.c('ink'), 'stroke-width': 1.6 })),
      el('rect', { x: x(s.q1), y: cy - bh / 2, width: x(s.q3) - x(s.q1), height: bh, rx: 3, fill: hl ? t.seq(1) : t.c('surface'), stroke: line, 'stroke-width': hl ? 2.4 : 1.6 }),
      el('line', { x1: x(s.median), x2: x(s.median), y1: cy - bh / 2, y2: cy + bh / 2, stroke: line, 'stroke-width': 4 }),
      s.outliers.map(v => el('circle', { cx: x(v), cy, r: 5, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.6 })),
      textLines([label], { x: m.l - 24, y: cy - 2, size: 19, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: hl ? 700 : 600 }),
      textLines([`n = ${values.length}, median ${s1(s.median)} s`], { x: m.l - 24, y: cy + 21, size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted') }));
  };
  const fy = rows(focusLabel) + 18;
  return svgRoot({ id: 'boxplot-fig', width: W, height: H, theme: t,
    title: 'Final-assembly cycle time by line and shift, seconds',
    desc: `Box plots with every cycle shown beneath. Line 2 night: median ${s1(fs.median)} s, interquartile range ${s1(fs.iqr)} s against ${s1(ps.iqr)} s on Line 2 day, ${fs.outliers.length} outlying cycles, ${pct(over(focusLabel))} of cycles above the ${takt} s takt (day shift ${pct(over(peerLabel))}).` },
  axis(x, { orient: 'bottom', at: H - m.b, grid: [m.t - 14, H - m.b], theme: t, size: 17, count: 4, tickSize: 5 }),
  el('line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, stroke: t.c('ink'), 'stroke-width': 1.2 }),
  textLines(['Cycle time, seconds'], { x: W - m.r, y: H - 6, size: 16, anchor: 'end', fill: t.c('muted') }),
  // takt: a dashed line through every row, labelled on the axis row where no tick competes
  el('line', { x1: x(takt), x2: x(takt), y1: m.t - 14, y2: H - m.b, stroke: t.c('ink'), 'stroke-width': 1.4, 'stroke-dasharray': '5 5' }),
  textLines([`Takt ${takt} s`], { x: x(takt), y: H - m.b + 8, size: 17, anchor: 'middle', valign: 'top', fill: t.c('ink'), weight: 700, halo: t.c('paper') }),
  order.map(row),
  // reading guide, on the focus box itself
  bracket({ x1: x(fs.q1), x2: x(fs.q3), y1: fy - bh / 2 - 8, y2: fy - bh / 2 - 8, side: 'top', depth: 7, theme: t, color: t.c('accent'), size: 17, weight: 700,
    label: `${s1(spread)}× as wide: middle half spans ${s1(fs.iqr)} s` }),
  textLines(['Whiskers reach the furthest cycle', 'within 1.5 × IQR; circles lie beyond'], { x: x(fs.hi) + 16, y: fy - 52, size: 16, fill: t.c('muted'), lineHeight: 1.25 }),
  el('path', { d: `M${x(fs.hi) + 10} ${fy - 50}H${x(fs.hi)}V${fy - 11}`, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.2 }));
}

export default {
  study: true,
  id: 'boxplot',
  title: 'Box plot: median, quartiles and whiskers',
  className: 'st cs-manufacturing-plant',
  notes: 'Purpose: Summarize several distributions by median, interquartile range and whiskers, so spread and skew compare at a glance.\nModify: Replace the `values` arrays with raw measurements (keep them raw: boxStats() computes the quartiles); set `focusLabel`, `peerLabel` and `takt` to the comparison your audience acts on; `order` sets the rows.\nInvariant: The whisker rule is written on the page (Tukey, 1.5 × IQR) and points beyond it are drawn as outliers, not dropped; every observation stays visible beneath its box; one group carries the accent.\nStatic: Already static. With fewer than about 15 values per group, show the dots alone.',
  sources: [{ type: 'original-example', file: 'assets/svg/boxplot.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Line 2's night shift ${medianGap < 0.5 ? 'has the same median cycle as the day shift' : `has a median within ${s1(medianGap)}\u00a0s of the day shift`}, but its middle half is <em>${s1(spread)}× as wide</em></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · ${groups[0].values.length} consecutive cycles per line and shift; ${pct(over(focusLabel))} of Line 2 night cycles overrun takt (day shift: ${pct(over(peerLabel))})</span><span>Box plot (Tukey whiskers)</span></p>`,
};
