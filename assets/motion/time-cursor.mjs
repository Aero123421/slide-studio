// Motion study · Follow a time cursor — both series stay visible for the whole incident;
// only the cursor moves. Each build moves it to the next instant at a pace proportional
// to elapsed time, and its readout is looked up from the same arrays the lines are drawn from.
import { svgRoot, el, g, linear, axis, textLines, pathFromPoints, measureText, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const start = { h: 13, m: 50 }, every = 2; // first sample time and sampling interval, minutes
const latency = [ // p95 request latency, ms, every 2 minutes from 13:50 (illustrative)
  186, 179, 191, 184, 188, 182, 190, 260, 410, 620, 880, 1240, 1610, 1980, 2210, 2340, 2290, 2180, 2240, 2150,
  2060, 1720, 1180, 760, 480, 310, 236, 214, 205, 198, 192, 188, 194, 186, 183, 189, 185, 181, 187, 184, 182,
];
const errors = [ // share of requests returning 5xx, %, same samples (illustrative)
  0.2, 0.2, 0.3, 0.2, 0.2, 0.2, 0.2, 0.4, 0.9, 1.6, 2.4, 3.5, 4.6, 5.9, 7.1, 7.8, 7.6, 7.2, 7.5, 7.0,
  6.6, 5.1, 3.2, 1.8, 0.9, 0.5, 0.3, 0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
];
const slo = 500; // latency objective, ms
const release = '4.18';
const clock = i => { const t = start.h * 60 + start.m + i * every; return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
const deploy = 6, rollback = 20; // sample indices of the release and of the start of the rollback
const peak = latency.indexOf(Math.max(...latency));
const recovered = latency.findIndex((v, i) => i > peak && v <= slo);
const stops = [ // cursor instants, one per build
  { i: deploy, what: `v${release} deployed`, crumb: 'deploy' }, { i: peak, what: 'Peak', crumb: 'peak' }, { i: recovered, what: `Back under ${slo} ms`, crumb: 'recovered' },
];
const above = latency.map((v, i) => (v > slo ? i : -1)).filter(i => i >= 0);
const aboveMin = above.length * every;
if (new Set([latency.length, errors.length]).size !== 1) throw Error('time-cursor: series lengths differ');

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 76, r: 30, t: 74, b: 40 };
  const x = linear([0, latency.length - 1], [m.l, W - m.r]);
  const p1 = { top: m.t, bottom: m.t + 214 }, p2 = { top: m.t + 252, bottom: H - m.b };
  const yL = linear([0, 2500], [p1.bottom, p1.top]), yE = linear([0, 10], [p2.bottom, p2.top]);
  const mono = t.font('mono');
  const series = (vals, y, base) => g({},
    el('path', { d: pathFromPoints([[x(0), base], ...vals.map((v, i) => [x(i), y(v)]), [x(vals.length - 1), base]], { close: true }), fill: t.seq(1) }),
    el('path', { d: pathFromPoints(vals.map((v, i) => [x(i), y(v)])), fill: 'none', stroke: t.cat(0), 'stroke-width': 2.6, 'stroke-linejoin': 'round' }));
  const move = 850; // ms per cursor move; the stops are equally spaced in time, so the pace is constant
  const cursorStates = { 0: { opacity: 0, translate: '0px 0px' } };
  stops.forEach((s, k) => { cursorStates[k + 1] = { opacity: 1, translate: `${x(s.i) - x(stops[0].i)}px 0px` }; });
  const readout = (s, k) => {
    const l1 = [clock(s.i), s.what], l2 = [`p95 ${fmt(latency[s.i])} ms`, `errors ${fmt(errors[s.i], { digits: 1 })}%`];
    const w = Math.max(measureText(l1.join('   '), 18, { weight: 700 }), measureText(l2.join('   '), 17, { family: 'mono' })) + 28;
    const bx = Math.min(Math.max(x(s.i) - w / 2, m.l), W - m.r - w);
    return g({ 'data-step': k + 1, 'data-until': k < stops.length - 1 ? k + 1 : null, 'data-motion': 'reveal', 'data-delay': k ? move - 100 : 250, 'data-duration': 300 },
      // two readout lines; fields are separated by space, not by punctuation
      el('text', { x: bx + 14, y: 28, 'font-size': 18, 'font-weight': 700, fill: t.c('accent') }, l1[0], el('tspan', { dx: 14 }, l1[1])),
      el('text', { x: bx + 14, y: 52, 'font-size': 17, fill: t.c('ink'), 'font-family': mono }, l2[0], el('tspan', { dx: 18 }, l2[1])),
      [[latency[s.i], yL], [errors[s.i], yE]].map(([v, y]) => el('circle', { cx: x(s.i), cy: y(v), r: 6, fill: t.c('accent'), stroke: t.c('paper'), 'stroke-width': 2 })));
  };
  return svgRoot({ id: 'motion-time-cursor-fig', width: W, height: H, theme: t,
    title: `p95 latency and error rate, ${clock(0)} to ${clock(latency.length - 1)}, with a cursor at three instants`,
    desc: `After v${release} was deployed at ${clock(deploy)}, p95 latency rose to ${fmt(latency[peak])} ms at ${clock(peak)} with ${errors[peak]}% errors. It stayed above the ${slo} ms objective for ${aboveMin} minutes and was back under it at ${clock(recovered)}, ${(recovered - rollback) * every} minutes after the rollback began.` },
  // build 3: the span above the objective, shaded behind the series and bracketed in the gap below it
  g({ 'data-step': 3, 'data-motion': 'reveal', 'data-delay': move, 'data-duration': 500 },
    el('rect', { x: x(above[0] - 0.5), y: p1.top, width: x(above.at(-1) + 0.5) - x(above[0] - 0.5), height: p1.bottom - p1.top, fill: t.c('grid') }),
    el('path', { d: `M${x(above[0] - 0.5)} ${p1.bottom + 6}v7H${x(above.at(-1) + 0.5)}v-7`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 1.5 }),
    textLines([`${aboveMin} minutes above objective`], { x: (x(above[0] - 0.5) + x(above.at(-1) + 0.5)) / 2 - 6, y: p1.bottom + 31, size: 16, weight: 700, anchor: 'end', fill: t.c('accent') }),
    textLines([`rollback began at ${clock(rollback)}`], { x: (x(above[0] - 0.5) + x(above.at(-1) + 0.5)) / 2 + 10, y: p1.bottom + 31, size: 16, fill: t.c('muted') })),
  axis(yL, { orient: 'left', at: m.l, grid: [m.l, W - m.r], theme: t, size: 16, tickValues: [0, 1000, 2000], format: v => fmt(v) }),
  axis(yE, { orient: 'left', at: m.l, grid: [m.l, W - m.r], theme: t, size: 16, tickValues: [0, 5, 10] }),
  textLines(['p95 latency, ms'], { x: m.l + 10, y: p1.top + 4, size: 16, fill: t.c('muted'), valign: 'top', weight: 650 }),
  textLines(['Errors, % of requests'], { x: m.l + 10, y: p2.top + 4, size: 16, fill: t.c('muted'), valign: 'top', weight: 650 }),
  series(latency, yL, p1.bottom), series(errors, yE, p2.bottom),
  el('line', { x1: m.l, x2: W - m.r, y1: yL(slo), y2: yL(slo), stroke: t.c('ink'), 'stroke-width': 1.3, 'stroke-dasharray': '5 5' }),
  textLines([`Objective ${slo} ms`], { x: W - m.r - 4, y: yL(slo) - 8, size: 16, anchor: 'end', fill: t.c('ink'), halo: t.c('paper') }),
  latency.map((_, i) => (i % 5 === 0 ? textLines([clock(i)], { x: x(i), y: H - m.b + 12, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }) : '')),
  el('line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, stroke: t.c('rule') }),
  // the cursor: one line that moves; readouts are looked up per instant
  el('line', { x1: x(stops[0].i), x2: x(stops[0].i), y1: 62, y2: H - m.b, stroke: t.c('accent'), 'stroke-width': 2,
    'data-states': cursorStates, 'data-duration': move, 'data-easing': 'linear', style: 'transform-box:view-box' }),
  stops.map(readout),
  stops.slice(0, -1).map((s, k) => g({ 'data-step': k + 2, 'data-motion': 'reveal', 'data-duration': 300 },
    el('circle', { cx: x(s.i), cy: yL(latency[s.i]), r: 6, fill: 'none', stroke: t.c('accent'), 'stroke-width': 2 }),
    textLines([`${s.crumb} ${clock(s.i)}`], { x: x(s.i), y: yL(latency[s.i]) - 14, size: 15, anchor: 'middle', fill: t.c('accent'), halo: t.c('paper') }))));
}

export default {
  study: true,
  id: 'motion-time-cursor',
  title: 'Time cursor: one instant at a time, the whole incident in view',
  className: 'st cs-terminal-dark',
  notes: 'Purpose: Keep the full trajectory visible while a cursor highlights one instant per build, with readouts taken from the data at that instant.\nModify: Replace `latency`, `errors`, the sampling clock and `stops`; cursor positions, readouts, the time above the objective and the headline recompute.\nInvariant: The series never redraw or rescale; only the cursor moves, at a pace proportional to elapsed time (linear easing); each readout shows the sampled values at its instant, not interpolated ones.\nStatic: The final build shows the last instant, the span above the objective and the rollback time. If every instant matters in print, export each build as its own page.',
  sources: [{ type: 'original-example', file: 'assets/motion/time-cursor.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Release ${release} held p95 latency above the ${slo}&nbsp;ms objective for <em>${aboveMin}&nbsp;minutes</em>, peaking at ${fmt(latency[peak] / 1000, { digits: 1 })}&nbsp;s</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · 2-minute samples from the edge proxies, ${clock(0)}–${clock(latency.length - 1)}</span><span>Motion · time cursor with looked-up readouts (3 builds)</span></p>`,
};
