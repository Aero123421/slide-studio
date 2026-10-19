// Diagram study · ECDF — the share of observations at or below any value, read straight off the curve.
// Both step curves are the engine's ecdf() of raw request timings; the threshold readings in
// the headline, on the chart and in the rail all come from the same `ecdfAt()` function.
import { svgRoot, el, g, textLines, linear, axis, pathFromPoints, niceDomain, ecdf, quantile,
  rng, fmt, pct, theme as makeTheme } from '../runtime/figure.mjs';

// Server response times, milliseconds, 1,500 sampled checkout requests per week (illustrative).
// After the change, most requests are served from a read-through cache; misses behave as before.
const rand = rng(7);
const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const logn = (median, s) => Math.round(Math.exp(Math.log(median) + s * normal()));
const before = Array.from({ length: 1500 }, () => logn(205, 0.42));
const after = Array.from({ length: 1500 }, () => (rand() < 0.68 ? logn(38, 0.3) : logn(212, 0.42)));
const target = 300; // ms, the service-level objective

const ecdfAt = (values, v) => values.filter(x => x <= v).length / values.length;
const shareBefore = ecdfAt(before, target), shareAfter = ecdfAt(after, target);
const gain = Math.round(shareAfter * 100) - Math.round(shareBefore * 100); // from the rounded figures the page prints
const p95 = [before, after].map(v => Math.round(quantile(v, 0.95)));

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 800, H = 470, m = { l: 66, r: 22, t: 36, b: 70 };
  const x = linear(niceDomain([0, Math.max(...before, ...after)], 5), [m.l, W - m.r]);
  const y = linear([0, 1], [H - m.b, m.t]);
  const curve = values => pathFromPoints([[0, 0], ...ecdf(values), [x.domain[1], 1]].map(([a, b]) => [x(a), y(b)]), { curve: 'step' });
  const series = [
    { name: 'Before', values: before, color: t.c('muted'), width: 2.6, at: 0.5, weight: 600 },
    { name: 'With cache', values: after, color: t.c('accent'), width: 3.4, at: 0.42, weight: 700 },
  ];
  return svgRoot({ id: 'ecdf-fig', width: W, height: H, theme: t,
    title: 'Cumulative share of checkout requests by response time, before and after the cache',
    desc: `${pct(shareAfter)} of requests finish within ${target} ms with the cache, against ${pct(shareBefore)} before. Both curves rise from 0 to 100%; the cached curve climbs steeply below 100 ms, where cache hits land. 95th percentile: ${p95[0]} ms before, ${p95[1]} ms after.` },
  axis(y, { orient: 'left', at: m.l, grid: [m.l, W - m.r], theme: t, size: 16, tickValues: [0, 0.25, 0.5, 0.75, 1], format: v => pct(v) }),
  axis(x, { orient: 'bottom', at: H - m.b, theme: t, size: 16, count: 5, tickSize: 5 }),
  el('line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, stroke: t.c('ink'), 'stroke-width': 1.2 }),
  textLines(['Share of requests at or below'], { x: m.l - 52, y: m.t - 18, size: 16, fill: t.c('muted') }),
  textLines(['Server response time, ms'], { x: W - m.r, y: H - 14, size: 16, anchor: 'end', fill: t.c('muted') }),
  // the threshold, labelled above the plot where no curve can run into it
  el('line', { x1: x(target), x2: x(target), y1: m.t - 8, y2: H - m.b, stroke: t.c('ink'), 'stroke-width': 1.4, 'stroke-dasharray': '5 5' }),
  textLines([`${target} ms target`], { x: x(target), y: m.t - 14, size: 16, anchor: 'middle', fill: t.c('ink'), weight: 600 }),
  series.map(s => g({ class: 'ecdf-series' },
    el('path', { d: curve(s.values), fill: 'none', stroke: s.color, 'stroke-width': s.width, 'stroke-linejoin': 'round' }),
    // direct label just right of the curve, at a height where the other curve is far away
    textLines([s.name], { x: x(quantile(s.values, s.at)) + 14, y: y(s.at), size: 18, weight: s.weight, fill: s.color, valign: 'middle', halo: t.c('paper') }))),
  [[shareAfter, t.c('accent'), 700], [shareBefore, t.c('muted'), 600]].map(([s, c, w]) => g({ class: 'ecdf-reading' },
    el('circle', { cx: x(target), cy: y(s), r: 6.5, fill: c, stroke: t.c('paper'), 'stroke-width': 2.5 }),
    textLines([pct(s)], { x: x(target) + 13, y: y(s) + 13, size: 19, weight: w, fill: c, valign: 'middle', halo: t.c('paper') }))));
}

export default {
  study: true,
  id: 'ecdf',
  title: 'ECDF: share of observations below a threshold',
  className: 'st st--rail cs-terminal-dark',
  notes: 'Purpose: Compare the share of observations at or below a threshold across two distributions, without choosing bins.\nModify: Replace `before` and `after` with raw measurements and set `target`; the curves, the dots on the target line, the rail and the headline recompute from `ecdfAt()`.\nInvariant: Each curve is a step function that never decreases and runs from 0 to 100%; read vertically for "share within a threshold", horizontally for percentiles; both series share one axis.\nStatic: Already static. For a talk, show the old curve first, then the new one.',
  sources: [{ type: 'original-example', file: 'assets/svg/ecdf.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">With the cache, <em>${pct(shareAfter)}</em> of checkout requests finish inside the ${target}\u00a0ms target, up from ${pct(shareBefore)}</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b class="st-accent">+${gain} pts</b><span>of requests within ${target} ms. Read up from the target line: a curve's height is the share that finished in time.</span></div>
  <hr class="st-rule">
  <div class="st-kpi"><b>${fmt(p95[0])} → ${fmt(p95[1])}</b><span>95th-percentile response time, ms. Read across at 95% to find it.</span></div>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · ${fmt(before.length)} sampled requests in each week</span><span>Empirical cumulative distribution (ECDF)</span></p>`,
};
