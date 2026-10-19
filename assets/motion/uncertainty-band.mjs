// Motion study · Reveal uncertainty — the forecast never appears without its interval.
// Build 0: what is known (observed storage, the declared trigger). Build 1: the median
// forecast and its 50% band arrive together, left to right. Build 2: the 80% band is
// added around the same median (which does not move), exposing the runs below the trigger.
import { svgRoot, el, g, linear, axis, textLines, pathFromPoints, spreadLabels, callout, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']; // Oct 2025 – Oct 2026
const monthName = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' };
const observed = [64, 71, 82, 90, 93, 91, 86]; // end-of-month storage, % of capacity, Oct 2025 – Apr 2026 (illustrative)
const forecast = [ // percentiles of 200 weather-driven simulations, May – Oct 2026 (illustrative)
  { p10: 76, p25: 78, p50: 80, p75: 82, p90: 84 },
  { p10: 63, p25: 67, p50: 71, p75: 75, p90: 78 },
  { p10: 51, p25: 57, p50: 62, p75: 67, p90: 71 },
  { p10: 43, p25: 49, p50: 55, p75: 61, p90: 66 },
  { p10: 39, p25: 46, p50: 52, p75: 59, p90: 66 },
  { p10: 41, p25: 48, p50: 56, p75: 64, p90: 71 },
];
const trigger = 45; // storage level at which restrictions are considered, % of capacity
const now = observed.length - 1; // index of the last observation; the forecast fans out from it
const levels = [10, 25, 50, 75, 90];
// the month with the lowest median, and the percentiles that bracket the trigger there
const low = forecast.reduce((b, f, i) => (f.p50 < forecast[b].p50 ? i : b), 0);
const below = levels.filter(q => forecast[low]['p' + q] < trigger);
const chance = below.length ? `${below.at(-1)}–${levels[below.length]}%` : `under ${levels[0]}%`;
const firstRisk = forecast.findIndex(f => f.p10 < trigger);
const lowMonth = monthName[months[now + 1 + low]], riskMonth = monthName[months[now + 1 + firstRisk]];

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 800, H = 470, m = { l: 58, r: 112, t: 36, b: 58 };
  const x = linear([0, months.length - 1], [m.l, W - m.r]);
  const y = linear([0, 100], [H - m.b, m.t]);
  const fx = i => x(now + 1 + i);
  const start = [x(now), y(observed[now])];
  const edge = q => [start, ...forecast.map((f, i) => [fx(i), y(f['p' + q])])];
  const bandPath = (lo, hi) => pathFromPoints([...edge(hi), ...edge(lo).reverse()], { close: true });
  // the part of the 80% band below the trigger: between the 10th-percentile edge and the trigger line,
  // one polygon per run of months below it (crossings interpolated along the edge)
  const tenth = [[now, observed[now]], ...forecast.map((f, i) => [now + 1 + i, f.p10])];
  const risk = [];
  let run = null;
  tenth.forEach(([b, vb], k) => {
    const [a, va] = tenth[k - 1] || [];
    if (k && (va - trigger) * (vb - trigger) < 0) {
      const cross = [a + ((va - trigger) / (va - vb)) * (b - a), trigger];
      if (vb < trigger) run = [cross]; else { run.push(cross); risk.push(run); run = null; }
    }
    if (vb < trigger) { run = run || [[b, trigger]]; run.push([b, vb]); }
  });
  if (run) { run.push([run.at(-1)[0], trigger]); risk.push(run); }
  // keyed labels at the right end: outer band (upper part), median, inner band (lower half)
  const fe = forecast.at(-1), ex = W - m.r + 12;
  const keys = [
    { id: 'out', y: y((fe.p75 + fe.p90) / 2), h: 22, text: '8 in 10 runs', swatch: t.seq(1), step: 2 },
    { id: 'med', y: y(fe.p50), h: 22, text: `Median ${fe.p50}%`, step: 1 },
    { id: 'in', y: y((fe.p25 + fe.p50) / 2), h: 22, text: 'Half of runs', swatch: t.seq(3), step: 1 },
  ];
  const placed = spreadLabels(keys, { gap: 4 });
  const keyLabel = (k, j) => g({ 'data-step': k.step, 'data-motion': 'reveal', 'data-delay': 800 },
    k.swatch ? el('rect', { x: ex, y: placed[j].y - 7, width: 14, height: 14, rx: 2, fill: k.swatch })
      : el('line', { x1: ex, x2: ex + 14, y1: placed[j].y, y2: placed[j].y, stroke: t.c('ink'), 'stroke-width': 2.8, 'stroke-dasharray': '4 3' }),
    textLines([k.text], { x: ex + 21, y: placed[j].y, size: 16, valign: 'middle', fill: k.swatch ? t.c('muted') : t.c('ink'), weight: k.swatch ? 400 : 700 }));
  const mid = forecast[low];
  return svgRoot({ id: 'motion-uncertainty-band-fig', width: W, height: H, theme: t,
    title: 'Reservoir storage: observed October to April, and the forecast to October with 50% and 80% bands',
    desc: `Storage reached ${observed[now]}% at the end of April. The median forecast bottoms out at ${mid.p50}% in ${lowMonth}; half of the runs end between ${mid.p25}% and ${mid.p75}%, and the lowest tenth fall below the ${trigger}% trigger from ${riskMonth}.` },
  axis(y, { orient: 'left', at: m.l, grid: [m.l, W - m.r], theme: t, size: 16, tickValues: [0, 25, 50, 75, 100], format: v => `${v}%` }),
  months.map((mo, i) => textLines([mo], { x: x(i), y: H - m.b + 12, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') })),
  [[0, '2025'], [3, '2026']].map(([i, yr]) => textLines([yr], { x: x(i), y: H - m.b + 34, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted'), weight: 650 })),
  el('line', { x1: x(now), x2: x(now), y1: m.t - 8, y2: H - m.b, stroke: t.c('rule'), 'stroke-width': 1.4 }),
  textLines(['Now'], { x: x(now) - 8, y: m.t - 4, size: 16, anchor: 'end', fill: t.c('muted'), weight: 650, valign: 'top' }),
  // build 2: the wider interval goes underneath, around the same median
  el('path', { d: bandPath(10, 90), fill: t.seq(1), 'data-step': 2, 'data-motion': 'wipe', 'data-duration': 900 }),
  risk.map(r => el('path', { d: pathFromPoints(r.map(([i, v]) => [x(i), y(v)]), { close: true }), fill: t.c('accent'), 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 800, 'data-duration': 500 })),
  // build 1: median and 50% band arrive together
  el('path', { d: bandPath(25, 75), fill: t.seq(3), 'data-step': 1, 'data-motion': 'wipe', 'data-duration': 900 }),
  el('line', { x1: m.l, x2: W - m.r, y1: y(trigger), y2: y(trigger), stroke: t.c('ink'), 'stroke-width': 1.6, 'stroke-dasharray': '6 5' }),
  textLines([`Restriction trigger ${trigger}%`], { x: m.l + 10, y: y(trigger) - 9, size: 16, fill: t.c('ink'), weight: 650, halo: t.c('paper') }),
  el('path', { d: pathFromPoints(edge(50)), fill: 'none', stroke: t.c('ink'), 'stroke-width': 2.8, 'stroke-dasharray': '7 6', 'data-step': 1, 'data-motion': 'draw', 'data-duration': 900 }),
  el('path', { d: pathFromPoints(observed.map((v, i) => [x(i), y(v)])), fill: 'none', stroke: t.c('ink'), 'stroke-width': 3.2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }),
  observed.map((v, i) => el('circle', { cx: x(i), cy: y(v), r: i === now ? 5.5 : 4, fill: t.c('ink'), stroke: t.c('paper'), 'stroke-width': 1.8 })),
  keys.map(keyLabel),
  callout({ x: fx(firstRisk) + 6, y: y(forecast[firstRisk].p10) + 14, text: `Runs below ${trigger}% from ${riskMonth}`,
    dx: -130, dy: 66, width: 262, theme: t, size: 16, marker: 'none', color: t.c('accent'), weight: 650, bounds: { w: W, h: H },
    attrs: { 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 1000 } }));
}

export default {
  study: true,
  id: 'motion-uncertainty-band',
  title: 'Uncertainty band: an estimate that never travels alone',
  className: 'st st--rail cs-civic-calm',
  notes: 'Purpose: Introduce a forecast with its interval, then widen the interval around the same estimate, so the audience never sees an unqualified claim.\nModify: Replace `observed`, `forecast` (percentiles per future period) and `trigger`; the risk sliver, the bracketing percentiles in the headline and the rail recompute.\nInvariant: The median and the 50% band enter together; adding the 80% band never moves the median; the bands fan out from the last observation; the chance statement names the two percentiles it lies between.\nStatic: The final build shows both bands, the trigger and the share of runs below it. If the inner band alone matters, export build 1 as its own page.',
  sources: [{ type: 'original-example', file: 'assets/motion/uncertainty-band.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Ashby Water should stay above its ${trigger}% restriction trigger this summer — with a <em>${chance} chance</em> it won’t</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b>${observed[now]}%</b><span>Storage at the end of April, after a wet winter.</span></div>
  <hr class="st-rule">
  <div class="st-kpi" data-step="1" data-motion="reveal" data-delay="500"><b>${forecast[low].p50}%</b><span>Median for ${lowMonth}, the low point. Half of runs: ${forecast[low].p25}–${forecast[low].p75}%.</span></div>
  <hr class="st-rule" data-step="1" data-motion="reveal">
  <div class="st-kpi" data-step="2" data-motion="reveal" data-delay="900"><b class="st-accent">${chance}</b><span>chance of falling below the ${trigger}% trigger by ${lowMonth}.</span></div>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · percentiles of 200 simulated inflow sequences</span><span>Motion · fan chart: estimate with interval, then wider interval (2 builds)</span></p>`,
};
