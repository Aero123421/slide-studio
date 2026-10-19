// Diagram study · Paired protocol — two crossover sequences on one true day axis, with the windows that
// are actually compared drawn across both timelines. Bars, windows, values and the crossover estimate
// are computed from `schedule`, `sequences` and `sbp`; spacing on the page is real time.
import { svgRoot, el, g, textLines, linear, theme as makeTheme, fmt, sum } from '../runtime/figure.mjs';

const schedule = { runIn: 7, period: 28, washout: 14, window: 7 };   // days
const diets = { low: 'Low-sodium diet', usual: 'Usual diet' };
const sequences = [
  { name: 'Sequence 1', n: 22, order: ['low', 'usual'] },
  { name: 'Sequence 2', n: 21, order: ['usual', 'low'] },
];
// Mean home systolic pressure in each window, mmHg (illustrative): baseline, end of period 1, end of period 2
const sbp = { 'Sequence 1': [136.2, 127.9, 134.6], 'Sequence 2': [135.4, 133.2, 128.5] };

// Derived timeline (day 0 = start of period 1) and the standard 2×2 crossover estimates.
const P1 = [0, schedule.period], WO = [P1[1], P1[1] + schedule.washout], P2 = [WO[1], WO[1] + schedule.period];
const windows = [[-schedule.runIn, 0, 'Baseline'], [P1[1] - schedule.window, P1[1], 'End of period 1'], [P2[1] - schedule.window, P2[1], 'End of period 2']];
const within = sequences.map(s => { const [, a, b] = sbp[s.name]; return s.order[0] === 'low' ? a - b : b - a; });   // low − usual, per sequence
const effect = sum(within) / within.length;
const periodEffect = sum(sequences.map(s => sbp[s.name][1] - sbp[s.name][2])) / sequences.length;  // P1 − P2, averaged over sequences
const totalDays = schedule.runIn + 2 * schedule.period + schedule.washout, comparedDays = 2 * schedule.window;
const f1 = v => fmt(v, { digits: 1 });
const dayLabel = ([a, b]) => (a < 0 ? `days ${fmt(a)} to ${fmt(b - 1)}` : `days ${a + 1}–${b}`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'paired-protocol-fig';
  const x = linear([-schedule.runIn - 1, P2[1] + 1], [176, 1000]);
  const laneY = [150, 306], barH = 50, bandTop = 74, bandBottom = 356, axisY = 390;
  const dietFill = d => (d === 'low' ? t.c('ink') : t.c('surface')), dietInk = d => (d === 'low' ? t.c('paper') : t.c('ink'));
  const bar = (a, b, y, fill, stroke, label, ink, dash) => g({},
    el('rect', { x: x(a), y: y - barH / 2, width: x(b) - x(a), height: barH, rx: 4, fill, stroke, 'stroke-width': stroke ? 1.5 : null, 'stroke-dasharray': dash || null }),
    textLines([label], { x: (x(a) + x(b)) / 2, y, size: 16, anchor: 'middle', valign: 'middle', fill: ink, weight: 600 }));

  // Compared windows: one band crosses both timelines because the same study days are compared.
  const bands = windows.map(([a, b, name], k) => {
    const compared = k > 0;
    return g({},
      el('rect', { x: x(a), y: bandTop, width: x(b) - x(a), height: bandBottom - bandTop, fill: compared ? t.seq(1) : t.c('surface'), stroke: compared ? t.c('accent') : 'none', 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }),
      textLines([compared ? `Final week, ${dayLabel([a, b])}` : `Baseline, ${dayLabel([a, b])}`], { x: compared ? x(b) : x(a), y: bandTop - 10, size: 15, anchor: compared ? 'end' : 'start', valign: 'bottom', fill: compared ? t.c('accent') : t.c('muted'), weight: compared ? 700 : 400 }));
  });

  const lanes = sequences.map((s, k) => {
    const y = laneY[k], [d1, d2] = s.order, vals = sbp[s.name];
    return g({},
      textLines([s.name], { x: 0, y: y - 11, size: 18, valign: 'middle', weight: 700, fill: t.c('ink') }),
      textLines([`n = ${s.n}, ${d1 === 'low' ? 'low sodium first' : 'usual diet first'}`], { x: 0, y: y + 13, size: 15, valign: 'middle', fill: t.c('muted') }),
      bar(-schedule.runIn, 0, y, t.c('paper'), t.c('rule'), 'Run-in', t.c('muted')),
      bar(P1[0], P1[1], y, dietFill(d1), d1 === 'low' ? null : t.c('rule'), diets[d1], dietInk(d1)),
      bar(WO[0], WO[1], y, 'none', t.c('rule'), 'Washout', t.c('muted'), '5 4'),
      bar(P2[0], P2[1], y, dietFill(d2), d2 === 'low' ? null : t.c('rule'), diets[d2], dietInk(d2)),
      // window means, written inside the band above each bar
      windows.map(([a, b], w) => textLines([f1(vals[w])], { x: (x(a) + x(b)) / 2, y: y - barH / 2 - 8, size: 15, anchor: 'middle', valign: 'bottom', weight: w ? 700 : 400, fill: w ? t.c('ink') : t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } })),
      textLines([fmt(within[k], { digits: 1, sign: true })], { x: 1152, y, size: 24, anchor: 'end', valign: 'middle', weight: 700, fill: t.c('ink') }));
  });

  const ticks = [-7, 0, 7, 14, 21, 28, 35, 42, 49, 56, 63, 70];
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Two-period crossover: matched measurement windows across two sequences',
    desc: `Both sequences follow the same schedule on a true day axis: ${schedule.runIn}-day run-in, ${schedule.period}-day diet period, ${schedule.washout}-day washout, second ${schedule.period}-day period. Only the last ${schedule.window} days of each period are compared (${comparedDays} of ${totalDays} days). Low-sodium minus usual: ${f1(within[0])} mmHg in sequence 1 and ${f1(within[1])} in sequence 2; crossover estimate ${f1(effect)} mmHg.` },
  bands, lanes,
  // the right-hand column: within-person difference per sequence, then their average
  textLines(['Low − usual'], { x: 1152, y: bandTop - 26, size: 16, anchor: 'end', valign: 'bottom', weight: 700, fill: t.c('ink') }),
  textLines(['mmHg, same people'], { x: 1152, y: bandTop - 6, size: 15, anchor: 'end', valign: 'bottom', fill: t.c('muted') }),
  el('line', { x1: 1046, x2: 1152, y1: laneY[1] + 40, y2: laneY[1] + 40, stroke: t.c('rule') }),
  textLines(['average'], { x: 1152, y: laneY[1] + 60, size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') }),
  textLines([f1(effect)], { x: 1152, y: laneY[1] + 88, size: 24, anchor: 'end', valign: 'middle', weight: 700, fill: t.c('ink') }),
  textLines([`period effect ${f1(periodEffect)}`], { x: 1152, y: laneY[1] + 118, size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') }),
  // true-time axis
  el('line', { x1: x(-schedule.runIn), x2: x(P2[1]), y1: axisY, y2: axisY, stroke: t.c('ink'), 'stroke-width': 1.2 }),
  ticks.map(d => g({}, el('line', { x1: x(d), x2: x(d), y1: axisY, y2: axisY + 6, stroke: t.c('ink'), 'stroke-width': 1.2 }),
    textLines([fmt(d)], { x: x(d), y: axisY + 12, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') }))),
  textLines(['Study day (day 0 = first diet day; spacing is real time)'], { x: x(-schedule.runIn), y: axisY + 40, size: 15, valign: 'top', fill: t.c('muted') }));
}

export default {
  study: true,
  id: 'paired-protocol',
  title: 'Paired protocol: matched observation windows',
  className: 'st cs-clinical-trial',
  notes: 'Purpose: Put two protocols (here, crossover sequences) on parallel timelines so the audience sees which observation windows are comparable.\nModify: Change `schedule` (days), `sequences`, `diets` and the window means in `sbp`. Bars, compared windows, labels and the within-person and crossover estimates recompute.\nInvariant: Time is encoded: spacing is real days on one axis for both timelines; a compared window spans both timelines at the same study days; if spacing is schematic, say so on the axis.\nStatic: Already static. For a build, show the two timelines, then lay the compared windows across them.',
  sources: [{ type: 'original-example', file: 'assets/svg/paired-protocol.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Only <em>the final week</em> of each ${schedule.period}-day diet is compared — there, low sodium is ${f1(Math.abs(effect))} mmHg lower</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · two-period crossover, home blood pressure monitor, ${comparedDays} of ${totalDays} study days compared</span><span>Parallel protocol timelines</span></p>`,
};
