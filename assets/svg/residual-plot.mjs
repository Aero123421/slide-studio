// Diagram study · Residual plot — what a fitted model leaves behind, plotted against the predictor.
// Left: the data and the straight line actually fitted (engine linearFit). Right: residuals
// (observed − fitted) with a ±2 SD reading band and binned means that expose the curve.
import { svgRoot, el, g, textLines, linear, axis, pathFromPoints, niceDomain, extent, linearFit, mean,
  rng, fmt, theme as makeTheme } from '../runtime/figure.mjs';

// Daily electricity demand (GWh) and mean daily temperature (°C) for one city, one year (illustrative).
// Demand rises on cold days (heating) and on hot days (cooling); the model below ignores that.
const rand = rng(8);
const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const days = Array.from({ length: 365 }, (_, d) => {
  const temp = Math.round((13 + 11.5 * Math.sin(2 * Math.PI * (d - 105) / 365) + 2.6 * normal()) * 10) / 10;
  return { temp, demand: Math.round((86 + 0.105 * (temp - 17) ** 2 + 1.6 * normal()) * 10) / 10 };
});

const fit = linearFit(days.map(d => [d.temp, d.demand])); // demand = a + b · temperature (OLS)
const res = days.map((d, i) => ({ temp: d.temp, r: fit.residuals[i] })); // residual = observed − fitted
const s = Math.sqrt(res.reduce((a, p) => a + p.r ** 2, 0) / (res.length - 2));
const step = 3; // °C per bin for the mean-residual trace
const binned = [];
for (let lo = Math.floor(Math.min(...res.map(p => p.temp)) / step) * step; lo < Math.max(...res.map(p => p.temp)); lo += step) {
  const inBin = res.filter(p => p.temp >= lo && p.temp < lo + step);
  if (inBin.length >= 5) binned.push({ t: mean(inBin.map(p => p.temp)), r: mean(inBin.map(p => p.r)), n: inBin.length });
}
const coldCut = 2, hotCut = 26;
const cold = mean(res.filter(p => p.temp < coldCut).map(p => p.r)), hot = mean(res.filter(p => p.temp >= hotCut).map(p => p.r));
const middle = mean(res.filter(p => p.temp >= 12 && p.temp < 20).map(p => p.r));
const g0 = v => fmt(v, { digits: 0, sign: true }), g1 = v => fmt(v, { digits: 1 });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470;
  const tx = niceDomain(extent(days.map(d => d.temp)), 5);
  // left panel: data and the fitted straight line
  const L = { l: 64, r: 420, t: 62, b: H - 66 };
  const lx = linear(tx, [L.l, L.r]), ly = linear(niceDomain(extent(days.map(d => d.demand)), 4), [L.b, L.t]);
  // right panel: residuals against the same predictor
  const R = { l: 552, r: W - 12, t: 62, b: H - 66 };
  const rx = linear(tx, [R.l, R.r]), lim = Math.ceil(Math.max(...res.map(p => Math.abs(p.r)), 2 * s) / 5) * 5;
  const ry = linear([-lim, lim], [R.b, R.t]);
  const span = extent(days.map(d => d.temp)); // draw the line over the observed range only
  const fitPts = span.map(v => [lx(v), ly(fit.intercept + fit.slope * v)]);
  const firstBin = binned[0], lastBin = binned.at(-1);
  return svgRoot({ id: 'residual-plot-fig', width: W, height: H, theme: t,
    title: 'Electricity demand against temperature with a straight-line fit, and the residuals of that fit',
    desc: `Fitted model: demand = ${g1(fit.intercept)} ${fit.slope < 0 ? '−' : '+'} ${fmt(Math.abs(fit.slope), { digits: 2 })} × temperature, R² ${fmt(fit.r2, { digits: 2 })}. Residuals curve: they average ${g0(cold)} GWh below ${coldCut} °C, ${g0(middle)} GWh between 12 and 20 °C and ${g0(hot)} GWh at ${hotCut} °C and above, so the line underestimates demand at both extremes.` },
  // ---- left panel
  textLines(['The model: one straight line'], { x: L.l - 44, y: 18, size: 17, weight: 700, fill: t.c('ink') }),
  textLines([`demand = ${g1(fit.intercept)} − ${fmt(Math.abs(fit.slope), { digits: 2 })} × temperature (OLS)`], { x: L.l - 44, y: 40, size: 16, fill: t.c('muted') }),
  axis(ly, { orient: 'left', at: L.l, grid: [L.l, L.r], theme: t, size: 16, count: 4 }),
  axis(lx, { orient: 'bottom', at: L.b, theme: t, size: 16, count: 5, tickSize: 5, format: v => `${v}°` }),
  el('line', { x1: L.l, x2: L.r, y1: L.b, y2: L.b, stroke: t.c('ink'), 'stroke-width': 1.2 }),
  days.map(d => el('circle', { cx: lx(d.temp), cy: ly(d.demand), r: 2.6, fill: t.c('muted'), 'fill-opacity': 0.5 })),
  el('path', { d: pathFromPoints(fitPts), stroke: t.c('ink'), 'stroke-width': 2.6, fill: 'none' }),
  textLines(['Demand, GWh per day'], { x: L.l + 8, y: L.t + 10, size: 16, fill: t.c('muted'), valign: 'top', halo: t.c('paper') }),
  textLines(['Mean daily temperature, °C'], { x: L.r, y: H - 18, size: 16, anchor: 'end', fill: t.c('muted') }),
  // ---- right panel
  textLines(['What it misses: residual = observed − fitted'], { x: R.l - 44, y: 18, size: 17, weight: 700, fill: t.c('ink') }),
  textLines([`Residual, GWh. Band: ±2 SD of residuals (±${g1(2 * s)})`], { x: R.l - 44, y: 40, size: 16, fill: t.c('muted') }),
  el('rect', { x: R.l, y: ry(2 * s), width: R.r - R.l, height: ry(-2 * s) - ry(2 * s), fill: t.c('surface') }),
  axis(ry, { orient: 'left', at: R.l, grid: [R.l, R.r], theme: t, size: 16, count: 4, format: v => fmt(v, { digits: 0, sign: true }) }),
  axis(rx, { orient: 'bottom', at: R.b, theme: t, size: 16, count: 5, tickSize: 5, format: v => `${v}°` }),
  el('line', { x1: R.l, x2: R.r, y1: ry(0), y2: ry(0), stroke: t.c('ink'), 'stroke-width': 1.6 }),
  textLines(['0 = on the line'], { x: R.l + 8, y: ry(0) - 8, size: 16, fill: t.c('ink'), halo: t.c('paper') }),
  res.map(p => el('circle', { cx: rx(p.temp), cy: ry(p.r), r: 2.8, fill: t.c('muted'), 'fill-opacity': 0.5 })),
  el('path', { d: pathFromPoints(binned.map(b => [rx(b.t), ry(b.r)]), { curve: 'monotone' }), stroke: t.c('accent'), 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round' }),
  binned.map(b => el('circle', { cx: rx(b.t), cy: ry(b.r), r: 4.5, fill: t.c('accent'), stroke: t.c('paper'), 'stroke-width': 1.5 })),
  // readings at both ends of the trace, set in the empty space beyond the data
  textLines([`${g0(cold)} GWh`, `below ${coldCut} °C`], { x: rx(firstBin.t) - 12, y: ry(firstBin.r), size: 17, weight: 700, anchor: 'end', valign: 'middle', fill: t.c('accent'), halo: t.c('paper') }),
  textLines([`${g0(hot)} GWh`, `${hotCut} °C or more`], { x: rx(lastBin.t) + 12, y: ry(lastBin.r), size: 17, weight: 700, valign: 'middle', fill: t.c('accent'), halo: t.c('paper') }),
  textLines([`Mean residual per ${step} °C bin`], { x: rx(binned[Math.floor(binned.length / 2)].t), y: ry(-2 * s) + 26, size: 16, anchor: 'middle', fill: t.c('accent'), weight: 600, halo: t.c('paper') }),
  textLines(['Mean daily temperature, °C'], { x: R.r, y: H - 18, size: 16, anchor: 'end', fill: t.c('muted') }));
}

export default {
  study: true,
  id: 'residual-plot',
  title: 'Residual plot: systematic error left by a fitted model',
  className: 'st cs-laboratory',
  notes: 'Purpose: Reveal whether a fitted model leaves a pattern behind: residuals should scatter evenly around zero; a curve, funnel or drift means the model is missing something.\nModify: Replace `days` with your (x, y) data; the OLS fit, residuals, ±2 SD band, binned means (`step`) and the end readings recompute. Swap the model by changing how `fit` is computed — keep the residual definition on the page.\nInvariant: The fitted model, the residual definition (observed − fitted) and the zero reference are all stated; residuals are plotted against the same predictor as the fit; the band is labelled as ±2 SD of residuals, not a confidence interval.\nStatic: Already static. Show the left panel first if the audience has not seen the model.',
  sources: [{ type: 'original-example', file: 'assets/svg/residual-plot.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">A straight line misses both ends: on days of ${hotCut}\u00a0°C or more, demand runs <em>${g0(hot)}\u00a0GWh</em> over the fit</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · ${days.length} days of city demand; ordinary least squares, residuals averaged in ${step} °C bins with at least 5 days</span><span>Residual plot</span></p>`,
};
