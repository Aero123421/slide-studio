// Template: Stage keynote · One number and the chart that proves it. Synthetic example content; replace data and copy.
// The number is not typed in: it is the distance between the two peaks of the hourly data below.
// The chart is drawn on the day grid (48 px per hour), so the number hangs from the hour it starts at.
import { svgRoot, el, g, linear, pathFromPoints, textLines, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-keynote-number';
const M = n => 64 + 48 * n;            // x of module n = x of hour n on a full-width chart

// Westmark Grid, Wednesday 16 September 2026, hourly averages in GW for 00:00 … 24:00 (25 points). Illustrative.
// Keep identical to the 2026 day in 04-then-now.mjs.
const day = {
  date: 'Wednesday 16 September 2026',
  demand: [9.3, 8.8, 8.5, 8.4, 8.5, 9.0, 10.2, 11.3, 11.8, 11.8, 11.6, 11.5, 11.4, 11.3, 11.3, 11.5, 11.9, 12.6, 13.2, 13.6, 13.2, 12.4, 11.2, 10.1, 9.3],
  solar: [0, 0, 0, 0, 0, 0, 0, 0.3, 1.6, 3.6, 5.6, 7.4, 8.6, 9.0, 8.7, 7.7, 6.1, 4.1, 2.0, 0.5, 0, 0, 0, 0, 0],
};
const peakHour = a => a.reduce((best, v, h) => (v > a[best] ? h : best), 0);
const sunPeak = peakHour(day.solar), demandPeak = peakHour(day.demand);
const gap = demandPeak - sunPeak;                                       // hours: the hero number
const shareAtPeak = day.solar[demandPeak] / day.demand[demandPeak];    // solar share of demand at the demand peak
const clock = h => `${String(h).padStart(2, '0')}:00`;
const gw = v => `${fmt(v, { digits: 1 })} GW`;

// Geometry, in the SVG's own coordinates (the SVG sits at x 64, y 248 and is drawn 1:1).
const TOP = 248, W = 48 * 24, H = 392;
const x = h => 48 * h;
const y = linear([0, 15], [340, 52]);                                   // 0–15 GW
const BR = 14;                                                          // bracket line
const pts = vals => vals.map((v, h) => [x(h), y(v)]);

const grid = [5, 10, 15].map(v => el('line', { x1: 0, x2: W, y1: y(v), y2: y(v), stroke: 'var(--kn-grid)', 'stroke-width': 1 }))
  .concat(el('line', { x1: 0, x2: W, y1: y(0), y2: y(0), stroke: 'var(--kn-rule)', 'stroke-width': 1.5 }))
  .concat(day.demand.map((_, h) => el('line', { x1: x(h), x2: x(h), y1: y(0), y2: y(0) + (h % 6 ? 5 : 9), stroke: 'var(--kn-rule)', 'stroke-width': 1.5 })));
const yLabels = [5, 10, 15].map(v => textLines([v === 15 ? `${v} GW` : String(v)], { x: W, y: y(v) - 9, anchor: 'end', cls: 'kn-t-axis' }));
const xLabels = [0, 6, 12, 18, 24].map(h => textLines([clock(h)], { x: x(h), y: y(0) + 30, anchor: h === 0 ? 'start' : h === 24 ? 'end' : 'middle', cls: 'kn-t-axis' }));

const sunPath = pathFromPoints(pts(day.solar), { curve: 'monotone' });
const solarArea = el('path', { d: `${sunPath}L${x(24)} ${y(0)}L${x(0)} ${y(0)}Z`, fill: 'var(--kn-sun)' });
const demandLine = el('path', { d: pathFromPoints(pts(day.demand), { curve: 'monotone' }), fill: 'none', stroke: 'var(--kn-ink)', 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
const dot = (h, v) => el('circle', { cx: x(h), cy: y(v), r: 7, fill: 'var(--kn-ink)', stroke: 'var(--kn-paper)', 'stroke-width': 3 });

// Bracket from the solar peak to the demand peak; its legs drop to the two peaks.
const bracket = g({},
  el('line', { x1: x(sunPeak), x2: x(sunPeak), y1: BR, y2: y(day.solar[sunPeak]), stroke: 'var(--kn-grey)', 'stroke-width': 1.5 }),
  el('line', { x1: x(demandPeak), x2: x(demandPeak), y1: BR, y2: y(day.demand[demandPeak]), stroke: 'var(--kn-grey)', 'stroke-width': 1.5 }),
  el('path', { d: `M${x(sunPeak)} ${BR - 8}V${BR + 8}M${x(sunPeak)} ${BR}H${x(demandPeak)}M${x(demandPeak)} ${BR - 8}V${BR + 8}`, fill: 'none', stroke: 'var(--kn-ink)', 'stroke-width': 2 }),
  textLines([clock(sunPeak)], { x: x(sunPeak) - 14, y: BR + 7, anchor: 'end', cls: 'kn-t-strong' }),
  textLines([clock(demandPeak)], { x: x(demandPeak) + 14, y: BR + 7, cls: 'kn-t-strong' }));

const labels = g({},
  textLines(['Solar output'], { x: x(sunPeak), y: y(3.2), anchor: 'middle', cls: 'kn-t-on-sun' }),
  textLines([gw(day.solar[sunPeak])], { x: x(sunPeak) - 16, y: y(day.solar[sunPeak]) - 14, anchor: 'end', cls: 'kn-t-label' }),
  textLines(['Demand'], { x: x(15.6), y: y(day.demand[16]) - 22, anchor: 'middle', cls: 'kn-t-label' }),
  textLines([gw(day.demand[demandPeak])], { x: x(demandPeak) + 16, y: y(day.demand[demandPeak]) - 16, cls: 'kn-t-label' }));

const chart = svgRoot({
  id: `${ID}-fig`, width: W, height: H, className: 'kn-fig',
  title: `Solar output and electricity demand, Westmark, ${day.date}, hourly`,
  desc: `Solar output peaks at ${clock(sunPeak)} at ${gw(day.solar[sunPeak])}. Demand peaks ${gap} hours later, at ${clock(demandPeak)}, at ${gw(day.demand[demandPeak])}, when solar supplies ${gw(day.solar[demandPeak])}, ${Math.round(shareAtPeak * 100)}% of demand.`,
}, grid, solarArea, demandLine, bracket, dot(sunPeak, day.solar[sunPeak]), dot(demandPeak, day.demand[demandPeak]), labels, yLabels, xLabels);

export default {
  study: true,
  id: ID,
  title: `${gap} hours between peak solar output and peak demand`,
  notes: 'Purpose: Make one number stick — the hours between peak solar output and peak demand — and show on the same page where it comes from.\nModify: Replace day.demand and day.solar with your hourly profile (25 points, 00:00 to 24:00, GW) and day.date. The number, both peak times, the bracket, the values and the description recompute. Keep the same 2026 day as on 04-then-now.\nInvariant: The hero number equals the bracket on the chart and starts at the module of the earlier peak. Both series share one GW axis; yellow is solar only.\nStatic: No builds; number and chart arrive together.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-keynote kn-number',
  content: `<h2 class="kn-at kn-head" data-region="title" style="left:${M(0)}px;top:64px;width:${M(11) - M(0)}px">Solar peaks at ${clock(sunPeak)}. Demand peaks at ${clock(demandPeak)}.</h2>
<p class="kn-at kn-lead kn-grey" style="left:${M(0)}px;top:212px;width:${M(11) - M(0)}px">At ${clock(demandPeak)} solar covers ${Math.round(shareAtPeak * 100)}% of demand.</p>
<p class="kn-at kn-hero" style="left:${M(sunPeak)}px;top:64px">${gap}<small>hours</small></p>
<figure class="kn-at" data-region="primary" style="left:${M(0)}px;top:${TOP}px;width:${W}px;height:${H}px">${chart}</figure>
<p class="kn-at kn-note" data-region="source" style="left:${M(0)}px;top:644px;width:${W}px">Westmark Grid, hourly averages, ${day.date}. Illustrative data.</p>`,
};
