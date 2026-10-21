// Motion study · Compare registered states — two years of hourly prices on one identical frame
// and one colour scale. Build 1 crossfades every cell in place (the same element changes its
// fill), so only the data changes; build 2 outlines the cells where the price went negative.
import { svgRoot, el, g, linear, textLines, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const years = [2019, 2025];
// Illustrative day-ahead market model, €/MWh: a monthly level times an hourly demand shape,
// minus what solar output takes off around 13:00. Replace price() with your own grid of averages.
const level = { 2019: [52, 48, 42, 38, 35, 36, 40, 39, 42, 46, 50, 54], 2025: [98, 92, 80, 72, 66, 68, 74, 76, 84, 92, 100, 106] };
const shape = [0.78, 0.74, 0.72, 0.71, 0.72, 0.78, 0.92, 1.08, 1.15, 1.1, 1.04, 1, 0.98, 0.97, 0.98, 1.02, 1.1, 1.22, 1.3, 1.28, 1.18, 1.06, 0.94, 0.84];
const solar = { 2019: [2, 4, 7, 10, 12, 13, 13, 11, 8, 5, 3, 2], 2025: [18, 30, 52, 74, 92, 98, 94, 80, 58, 36, 20, 14] };
const sun = h => Math.max(0, Math.cos(((h - 13) / 7) * (Math.PI / 2))) ** 1.5;
const price = (yr, m, h) => level[yr][m] * shape[h] - solar[yr][m] * sun(h);
const grid = Object.fromEntries(years.map(yr => [yr, months.map((_, m) => shape.map((_, h) => price(yr, m, h)))]));
// one colour scale for both years: below zero, then 20 €/MWh classes
const breaks = [0, 25, 50, 75, 100, 125];
const classOf = v => breaks.filter(b => v >= b).length; // 0 = negative … 6 = 125 and above
const negative = grid[years[1]].flatMap((row, m) => row.map((v, h) => (v < 0 ? { m, h } : null)).filter(Boolean));
const negMonths = [...new Set(negative.map(c => c.m))], negHours = negative.map(c => c.h);
const cheapest = (yr, m) => grid[yr][m].indexOf(Math.min(...grid[yr][m]));
const middayCheapest = months.filter((_, m) => cheapest(2025, m) >= 10 && cheapest(2025, m) <= 16).length;
const nightCheapest2019 = months.filter((_, m) => cheapest(2019, m) <= 5).length;
const negBefore = grid[years[0]].flat().filter(v => v < 0).length;
const monthName = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' };
const negFrom = monthName[months[Math.min(...negMonths)]], negTo = monthName[months[Math.max(...negMonths)]];

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 54, t: 58, r: 212, b: 6 };
  const cw = (W - m.l - m.r) / 24, ch = (H - m.t - m.b) / 12;
  const fillFor = k => (k === 0 ? t.c('positive') : t.seq(k)); // negative prices get their own hue; seq(1…6) for the price classes
  const cx = h => m.l + h * cw, cy = mo => m.t + mo * ch;
  const isNeg = (mo, h) => mo >= 0 && mo < 12 && h >= 0 && h < 24 && grid[years[1]][mo][h] < 0;
  // outline of the negative cells: every cell edge that does not border another negative cell
  const edges = negative.flatMap(({ m: mo, h }) => [
    !isNeg(mo - 1, h) && `M${cx(h)} ${cy(mo)}h${cw}`, !isNeg(mo + 1, h) && `M${cx(h)} ${cy(mo + 1)}h${cw}`,
    !isNeg(mo, h - 1) && `M${cx(h)} ${cy(mo)}v${ch}`, !isNeg(mo, h + 1) && `M${cx(h + 1)} ${cy(mo)}v${ch}`,
  ].filter(Boolean)).join('');
  const lx = W - m.r + 30;
  const legendRows = [{ k: breaks.length, text: `${breaks.at(-1)} and above` }, ...breaks.slice(1).map((b, i) => ({ k: i + 1, text: `${breaks[i]}–${b}` })).reverse(), { k: 0, text: 'below 0' }];
  return svgRoot({ id: 'motion-registered-crossfade-fig', width: W, height: H, theme: t,
    title: 'Average day-ahead power price by month and hour of day, 2019 and 2025, on one colour scale',
    desc: `In 2019 the cheapest hour was at night in ${nightCheapest2019} of 12 months. In 2025 it fell between 10:00 and 16:00 in ${middayCheapest} months, and ${negative.length} month-hour averages were below zero, all between ${Math.min(...negHours)}:00 and ${Math.max(...negHours) + 1}:00 in ${months[Math.min(...negMonths)]}–${months[Math.max(...negMonths)]}.` },
  years.map((yr, k) => textLines([String(yr)], { x: 0, y: 4, size: 32, weight: 700, fill: t.c('ink'), valign: 'top',
    attrs: { 'data-step': k, 'data-until': k ? null : 0, 'data-motion': k ? 'reveal' : null, 'data-delay': k ? 300 : null } })),
  [0, 6, 12, 18].map(h => textLines([`${String(h).padStart(2, '0')}:00`], { x: cx(h), y: m.t - 10, size: 16, fill: t.c('muted') })),
  textLines(['Hour of day'], { x: cx(24), y: m.t - 10, size: 16, anchor: 'end', fill: t.c('muted') }),
  months.map((mo, i) => textLines([mo], { x: m.l - 10, y: cy(i) + ch / 2, size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted') })),
  // the registered cells: one element per month-hour, fill changes from one year to the other
  grid[years[0]].map((row, mo) => row.map((v, h) => el('rect', { x: cx(h) + 1, y: cy(mo) + 1, width: cw - 2, height: ch - 2,
    'data-states': { 0: { fill: fillFor(classOf(v)) }, 1: { fill: fillFor(classOf(grid[years[1]][mo][h])) } }, 'data-duration': 900, 'data-easing': 'standard' }))),
  // build 2: where the 2025 price was negative
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-duration': 500 },
    el('path', { d: edges, fill: 'none', stroke: t.c('ink'), 'stroke-width': 2.5, 'stroke-linecap': 'square' }),
    textLines(['Below €0', 'on average'], { x: cx(Math.max(...negHours) + 1) + 12, y: cy(negMonths[0]) + 6, size: 17, weight: 700, fill: t.c('ink'), valign: 'top', halo: t.c('paper'), lineHeight: 1.25 })),
  // one legend for both years: the scale never changes
  textLines(['€/MWh'], { x: lx, y: m.t - 10, size: 16, fill: t.c('muted') }),
  legendRows.map((r, i) => g({},
    el('rect', { x: lx, y: m.t + i * 30, width: 26, height: 22, rx: 2, fill: fillFor(r.k) }),
    textLines([r.text], { x: lx + 36, y: m.t + i * 30 + 11, size: 16, valign: 'middle', fill: t.c('ink') }))),
  textLines(['Same scale', 'in both years'], { x: lx, y: m.t + legendRows.length * 30 + 14, size: 15, fill: t.c('muted'), valign: 'top', lineHeight: 1.3 }));
}

export default {
  study: true,
  id: 'motion-registered-crossfade',
  title: 'Registered crossfade: two years on one frame',
  className: 'st cs-strategy-dark',
  notes: 'Purpose: Compare two states of the same grid by crossfading in place on an identical frame and colour scale, so the only thing that changes is the data.\nModify: Replace `price()` (or `grid`) with your two years of averages and adjust `breaks`; colours, the negative-price outline, counts and headline recompute.\nInvariant: Every cell is one element that changes its fill; axes, labels, cell geometry and the legend never move or rescale; one legend serves both states; the outline marks exact cells, computed from the data.\nStatic: The final build shows 2025 with the outline. If 2019 must be in print, export build 0 as its own page.',
  sources: [{ type: 'original-example', file: 'assets/motion/registered-crossfade.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">From ${negFrom} to ${negTo} ${years[1]} the midday power price averaged below zero${negBefore ? '' : `; in ${years[0]} it never did`}</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · modelled hourly averages for one bidding zone</span><span>Motion · registered crossfade on a fixed frame and scale (2 builds)</span></p>`,
};
