// Diagram study · Scatter plot — individual paired observations, each dot one district.
// Positions come straight from `districts`; the correlation, the quartile means drawn as
// guides and every number in the headline and callout are computed from the same array.
import { svgRoot, el, g, textLines, linear, axis, callout, niceDomain, extent, mean, sd, rng, fmt,
  theme as makeTheme } from '../runtime/figure.mjs';

// Tree canopy cover (% of land area) and land-surface temperature (°C, satellite pass at 15:00
// on the hottest July afternoon) for 27 city districts (illustrative). Riverside is entered by hand.
const names = ['Ashdown', 'Bellfield', 'Brook End', 'Castlegate', 'Dockside', 'Elm Park', 'Fairholme', 'Foundry Lane', 'Glebe',
  'Harbour Wall', 'Highcross', 'Kiln Lane', 'Larkhill', 'Market Row', 'Millbank', 'Northgate', 'Oak Vale', 'Old Town', 'Parkview',
  'Quarry Hill', 'Saltings', 'Station Fields', 'Tanners Yard', 'Upper Green', 'Westbrook', 'Willowmere'];
const rand = rng(23);
const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const districts = [...names.map(name => {
  const canopy = Math.round(4 + 44 * rand() ** 1.15);
  return { name, canopy, temp: Math.round((41.6 - 0.15 * canopy + 0.85 * normal()) * 10) / 10 };
}), { name: 'Riverside', canopy: 7, temp: 35.1 }];
const focusName = 'Riverside', contrastName = 'Dockside';

const xs = districts.map(d => d.canopy), ys = districts.map(d => d.temp);
const r = districts.reduce((s, d) => s + (d.canopy - mean(xs)) * (d.temp - mean(ys)), 0) / ((districts.length - 1) * sd(xs) * sd(ys));
const byCanopy = [...districts].sort((a, b) => a.canopy - b.canopy), q = Math.round(districts.length / 4);
const quarters = [{ label: 'Barest quarter', rows: byCanopy.slice(0, q) }, { label: 'Leafiest quarter', rows: byCanopy.slice(-q) }]
  .map(qt => ({ ...qt, temp: mean(qt.rows.map(d => d.temp)), lo: qt.rows[0].canopy, hi: qt.rows.at(-1).canopy }));
const gap = quarters[0].temp - quarters[1].temp;
const focus = districts.find(d => d.name === focusName), contrast = districts.find(d => d.name === contrastName);
const c1 = v => fmt(v, { digits: 1 });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 70, r: 30, t: 40, b: 66 };
  const x = linear([0, Math.ceil(Math.max(...xs) / 10) * 10 + 10], [m.l, W - m.r]); // one empty decade on the right holds the labels
  const y = linear(niceDomain(extent(ys), 5), [H - m.b, m.t]);
  return svgRoot({ id: 'scatter-fig', width: W, height: H, theme: t,
    title: 'Tree canopy cover and afternoon land-surface temperature, 27 districts',
    desc: `Each dot is a district. Temperature falls as canopy rises (Pearson r = ${fmt(r, { digits: 2 })}). The leafiest quarter averaged ${c1(quarters[1].temp)} °C, the barest ${c1(quarters[0].temp)} °C. ${focus.name} has ${focus.canopy}% canopy, like ${contrast.name}, but was ${c1(contrast.temp - focus.temp)} °C cooler.` },
  axis(y, { orient: 'left', at: m.l, grid: [m.l, W - m.r], theme: t, size: 16, count: 5 }),
  axis(x, { orient: 'bottom', at: H - m.b, theme: t, size: 16, count: 5, tickSize: 5, format: v => `${v}%`, grid: [m.t, H - m.b] }),
  el('line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, stroke: t.c('ink'), 'stroke-width': 1.2 }),
  textLines(['Land-surface temperature, °C'], { x: m.l - 48, y: m.t - 20, size: 16, fill: t.c('muted') }),
  textLines(['Tree canopy cover, share of district area'], { x: W - m.r, y: H - 12, size: 16, anchor: 'end', fill: t.c('muted') }),
  // quartile means as quiet guides: the headline's gap, drawn where it was measured
  quarters.map((qt, k) => g({ class: 'quarter-mean' },
    el('line', { x1: x(qt.lo) - 8, x2: x(qt.hi) + 8, y1: y(qt.temp), y2: y(qt.temp), stroke: t.c('ink'), 'stroke-width': 2, 'stroke-dasharray': '6 4' }),
    k === 0 // barest: label under the line's left end; leafiest: label past the line's right end
      ? textLines([`${qt.label}: mean ${c1(qt.temp)} °C`], { x: x(qt.lo) - 8, y: y(qt.temp) + 16, size: 16, valign: 'middle', fill: t.c('ink'), weight: 600, halo: t.c('paper') })
      : textLines([`${qt.label}: mean ${c1(qt.temp)} °C`], { x: x(qt.hi) + 16, y: y(qt.temp), size: 16, valign: 'middle', fill: t.c('ink'), weight: 600, halo: t.c('paper') }))),
  districts.filter(d => d !== focus).map(d => el('circle', { cx: x(d.canopy), cy: y(d.temp), r: 7, fill: t.c('context'), stroke: t.c('muted'), 'stroke-width': 1 })),
  el('circle', { cx: x(focus.canopy), cy: y(focus.temp), r: 8.5, fill: t.c('accent'), stroke: t.c('paper'), 'stroke-width': 2 }),
  textLines([contrast.name], { x: x(contrast.canopy) + 13, y: y(contrast.temp), size: 17, valign: 'middle', weight: 700, fill: t.c('ink'), halo: t.c('paper') }),
  callout({ x: x(focus.canopy), y: y(focus.temp), dx: 56, dy: -14, width: 300, size: 17, theme: t, marker: 'none', color: t.c('accent'),
    title: focus.name, text: `${focus.canopy}% canopy, like ${contrast.name}, yet ${c1(contrast.temp - focus.temp)} °C cooler: canopy is not the only factor` }));
}

export default {
  study: true,
  id: 'scatter',
  title: 'Scatter plot: paired observations, one dot each',
  className: 'st cs-sustainability-moss',
  notes: 'Purpose: Show individual paired observations so the overall association and the cases that break it are both visible.\nModify: Replace `districts` with your pairs (keep units in the axis titles); r, the quartile guides, the headline gap and the callout recompute. Set `focusName`/`contrastName` to the case you want to discuss.\nInvariant: One dot per observation at its true coordinates; no fitted line is implied to be causal — the page says "association"; the exception is shown, not removed.\nStatic: Already static. Add a fit only when the model is the point (see regression-band).',
  sources: [{ type: 'original-example', file: 'assets/svg/scatter.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">The leafiest quarter of districts ran ${c1(gap)}\u00a0°C cooler than the barest on July's hottest afternoon; <em>${focus.name}</em> breaks the pattern</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · ${districts.length} districts, Pearson r = ${fmt(r, { digits: 2 })}: an association on one afternoon, not proof that canopy did the cooling</span><span>Scatter plot</span></p>`,
};
