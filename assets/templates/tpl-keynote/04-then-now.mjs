// Template: Stage keynote · Then and now on identical axes. Synthetic example content; replace data and copy.
// Two registered panels: same GW scale, same 24 hours, same marks. The yellow wedge is solar output
// stacked under demand; the thick line is what other sources must supply (demand minus solar).
import { svgRoot, el, g, linear, pathFromPoints, textLines, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-keynote-then-now';
const M = n => 64 + 48 * n;            // x of module n (24 modules of 48 px)

// Westmark Grid, hourly averages in GW for 00:00 … 24:00 (25 points), third Wednesday of September. Illustrative.
// The 2026 day must stay identical to 03-number.mjs.
const days = [
  { year: 2006, date: 'Wednesday 20 September 2006',
    demand: [8.7, 8.2, 7.9, 7.8, 7.9, 8.4, 9.6, 10.8, 11.5, 11.7, 11.7, 11.7, 11.6, 11.5, 11.5, 11.6, 11.9, 12.3, 12.6, 12.7, 12.3, 11.6, 10.6, 9.6, 8.7],
    solar: [0, 0, 0, 0, 0, 0, 0, 0, 0.01, 0.02, 0.04, 0.05, 0.06, 0.06, 0.06, 0.05, 0.04, 0.03, 0.01, 0, 0, 0, 0, 0, 0] },
  { year: 2026, date: 'Wednesday 16 September 2026',
    demand: [9.3, 8.8, 8.5, 8.4, 8.5, 9.0, 10.2, 11.3, 11.8, 11.8, 11.6, 11.5, 11.4, 11.3, 11.3, 11.5, 11.9, 12.6, 13.2, 13.6, 13.2, 12.4, 11.2, 10.1, 9.3],
    solar: [0, 0, 0, 0, 0, 0, 0, 0.3, 1.6, 3.6, 5.6, 7.4, 8.6, 9.0, 8.7, 7.7, 6.1, 4.1, 2.0, 0.5, 0, 0, 0, 0, 0] },
];
const MIDDAY = [10, 16], EVENING = [16, 23];                        // hours searched for the low and the high
for (const d of days) {
  d.other = d.demand.map((v, h) => +(v - d.solar[h]).toFixed(2));  // supplied by everything except solar
  const span = ([a, b]) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  d.low = span(MIDDAY).reduce((b, h) => (d.other[h] < d.other[b] ? h : b), MIDDAY[0]);
  d.high = span(EVENING).reduce((b, h) => (d.other[h] > d.other[b] ? h : b), EVENING[0]);
  d.ramp = d.other[d.high] - d.other[d.low];
  d.solarPeak = Math.max(...d.solar);
}
const [then, now] = days;
const gw = v => `${fmt(v, { digits: 1 })} GW`;
const times = Math.floor(now.ramp / then.ramp);

// Panel geometry, in each SVG's own coordinates (drawn 1:1, 528 × 340, 22 px per hour).
const PW = 528, PH = 340, TOP = 288;
const x = h => (PW / 24) * h;
const y = linear([0, 15], [298, 12]);
const pts = vals => vals.map((v, h) => [x(h), y(v)]);
const curve = vals => pathFromPoints(pts(vals), { curve: 'monotone' });
const clock = h => `${String(h).padStart(2, '0')}:00`;

function panel(d) {
  const id = `${ID}-${d.year}`;
  const back = pathFromPoints(pts(d.other).reverse(), { curve: 'monotone' }).replace(/^M/, 'L');
  const wedge = el('path', { d: `${curve(d.demand)}${back}Z`, fill: 'var(--kn-sun)' });
  const other = el('path', { d: curve(d.other), fill: 'none', stroke: 'var(--kn-ink)', 'stroke-width': 4.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
  const grid = [5, 10, 15].map(v => el('line', { x1: 0, x2: PW, y1: y(v), y2: y(v), stroke: 'var(--kn-grid)', 'stroke-width': 1 }))
    .concat(el('line', { x1: 0, x2: PW, y1: y(0), y2: y(0), stroke: 'var(--kn-rule)', 'stroke-width': 1.5 }));
  const yLab = [5, 10, 15].map(v => textLines([v === 15 ? `${v} GW` : String(v)], { x: 0, y: y(v) - 9, cls: 'kn-t-axis' }));
  const xLab = [0, 6, 12, 18, 24].map(h => textLines([clock(h)], { x: x(h), y: y(0) + 30, anchor: h === 0 ? 'start' : h === 24 ? 'end' : 'middle', cls: 'kn-t-axis' }));
  // The ramp: guides from the midday low and the evening high to a bracket at the right edge.
  const bx = PW - 6, yl = y(d.other[d.low]), yh = y(d.other[d.high]);
  const ramp = g({},
    el('path', { d: `M${x(d.low)} ${yl}H${bx}M${x(d.high)} ${yh}H${bx}`, fill: 'none', stroke: 'var(--kn-grey)', 'stroke-width': 1.5 }),
    el('path', { d: `M${bx - 8} ${yl}H${bx}V${yh}H${bx - 8}`, fill: 'none', stroke: 'var(--kn-ink)', 'stroke-width': 2 }),
    textLines([`+${gw(d.ramp)}`], { x: PW, y: yh - 14, anchor: 'end', cls: 'kn-t-strong' }));
  const labels = d.solarPeak >= 1
    ? g({},
      textLines(['Solar'], { x: x(12.5), y: y((d.other[12] + d.demand[13]) / 2), valign: 'middle', anchor: 'middle', cls: 'kn-t-on-sun' }),
      textLines(['Demand'], { x: x(10), y: y(d.demand[10]) - 16, anchor: 'middle', cls: 'kn-t-label' }),
      textLines(['Other sources'], { x: x(d.low), y: y(0) - 14, anchor: 'middle', cls: 'kn-t-label' }))
    : g({},
      textLines(['Demand'], { x: x(10), y: y(d.demand[10]) - 16, anchor: 'middle', cls: 'kn-t-label' }),
      textLines(['Other sources'], { x: x(d.low), y: y(d.other[d.low]) + 40, anchor: 'middle', cls: 'kn-t-label' }),
      textLines([`Solar output peaks at ${fmt(d.solarPeak, { digits: 2 })} GW, too small to see`], { x: x(12), y: y(0) - 14, anchor: 'middle', cls: 'kn-t-axis' }));
  return svgRoot({
    id, width: PW, height: PH, className: 'kn-fig',
    title: `Demand, solar output and other sources, Westmark, ${d.date}, hourly`,
    desc: `Solar output peaks at ${fmt(d.solarPeak, { digits: d.solarPeak < 1 ? 2 : 1 })} GW. What other sources supply falls to ${gw(d.other[d.low])} at ${clock(d.low)} and rises to ${gw(d.other[d.high])} at ${clock(d.high)}: a ramp of ${gw(d.ramp)}.`,
  }, grid, wedge, other, ramp, labels, yLab, xLab);
}

const header = (d, left) => `<p class="kn-at kn-statement" style="left:${left}px;top:200px;width:${4 * 48}px">${d.year}</p>
<p class="kn-at kn-label kn-grey" style="left:${left + 4 * 48}px;top:232.1px;width:${8 * 48}px">${d.date.replace(/ \d{4}$/, '')}</p>`;

export default {
  study: true,
  id: ID,
  title: `Midday-to-evening ramp: ${gw(then.ramp)} in ${then.year}, ${gw(now.ramp)} in ${now.year}`,
  notes: `Purpose: Show how the job of every other power source changed in twenty years, on two panels the room can compare without reading numbers.\nModify: Replace each day's demand and solar arrays (25 hourly points, GW) and dates. The yellow wedge, the thick line, the midday low, the evening high, the ramp brackets, the headline numbers and the description recompute. Change MIDDAY/EVENING if your peaks fall elsewhere.\nInvariant: Both panels share the 0–15 GW scale, 24 hours and the same marks; yellow is solar only; the thick line is demand minus solar. Keep the later year on the right.\nStatic: No builds. The ${now.ramp > then.ramp ? `${times}×` : ''} difference is visible at once.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-keynote kn-then-now',
  content: `<h2 class="kn-at kn-head" data-region="title" style="left:${M(0)}px;top:64px;width:${M(22) - M(0)}px">Between midday and evening, other sources must now add ${gw(now.ramp)}. In ${then.year} they added ${gw(then.ramp)}.</h2>
${header(then, M(0))}
${header(now, M(13))}
<figure class="kn-at" data-region="primary" style="left:${M(0)}px;top:${TOP}px;width:${PW}px;height:${PH}px">${panel(then)}</figure>
<figure class="kn-at" data-region="primary" style="left:${M(13)}px;top:${TOP}px;width:${PW}px;height:${PH}px">${panel(now)}</figure>
<p class="kn-at kn-note" data-region="source" style="left:${M(0)}px;top:644px;width:${M(24) - M(0)}px">Westmark Grid, hourly averages. Other sources = demand minus solar output. Illustrative data.</p>`,
};
