// Motion study · Emphasize one word — the word that carries the claim changes color and
// weight (no letter motion), and the curve it names takes the same accent at the same
// moment. Builds: 1 word + curve, 2 the number behind the word.
import { svgRoot, el, g, linear, axis, textLines, pathFromPoints, spreadLabels, statesAttr, theme as makeTheme, fmt } from '../runtime/figure.mjs';

// Calibration of an emergency-triage admission model by age band (illustrative).
// Predicted admission risk, bin centres in %; observed admission rate in each bin, %.
const bins = [5, 15, 25, 35, 45, 55, 65];
const bands = [
  { name: 'Under 65', observed: [4, 14, 26, 36, 44, 57, 66] },
  { name: '65–79', observed: [5, 16, 24, 33, 43, 52, 61] },
  { name: 'Over 80', observed: [4, 11, 17, 24, 30, 37, 44], focus: true },
];
const focus = bands.find(b => b.focus), young = bands[0];
const at = bins.indexOf(45); // the bin quoted in the text
const gap = Math.max(...bins.map((p, i) => p - focus.observed[i])); // largest overstatement, points

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 656, H = 520, m = { l: 62, r: 150, t: 40, b: 64 };
  const side = Math.min(W - m.l - m.r, H - m.t - m.b);
  const x = linear([0, 70], [m.l, m.l + side]), y = linear([0, 70], [m.t + side, m.t]);
  // The focus band turns from context grey to accent at build 1, together with the word.
  const lit = (prop, from) => ({ 'data-states': { 0: { [prop]: t.c(from) }, 1: { [prop]: t.c('accent') } }, style: `${prop}:${t.c(from)}`, 'data-duration': 450 });
  const ends = spreadLabels(bands.map((b, k) => ({ id: k, y: y(b.observed.at(-1)), h: 22 })), { min: m.t, max: m.t + side, gap: 4 });
  return svgRoot({ id: 'motion-word-emphasis-fig', width: W, height: H, theme: t,
    title: 'Calibration of the triage model: observed admission rate against predicted risk, by age band',
    desc: `Under 65 and 65–79 track the diagonal. Patients ${focus.name.toLowerCase()} fall below it at every bin: at ${bins[at]}% predicted, ${focus.observed[at]}% were admitted, a gap of up to ${gap} points.` },
  axis(y, { orient: 'left', at: m.l, grid: [m.l, m.l + side], theme: t, size: 16, format: { suffix: '%' }, tickValues: [0, 10, 20, 30, 40, 50, 60, 70] }),
  axis(x, { orient: 'bottom', at: m.t + side, theme: t, size: 16, format: { suffix: '%' }, tickValues: [0, 10, 20, 30, 40, 50, 60, 70], tickSize: 5 }),
  textLines(['Observed admission rate'], { x: 0, y: 4, size: 16, fill: t.c('muted'), valign: 'top' }),
  textLines(['Predicted risk'], { x: m.l + side, y: H - 4, size: 16, anchor: 'end', fill: t.c('muted') }),
  el('line', { x1: x(0), y1: y(0), x2: x(70), y2: y(70), stroke: t.c('ink'), 'stroke-width': 1.4, 'stroke-dasharray': '6 5' }),
  textLines(['Perfect calibration'], { x: x(70) - 6, y: y(70) - 12, size: 16, anchor: 'end', fill: t.c('ink') }),
  bands.map((b, k) => {
    const pts = b.observed.map((v, i) => [x(bins[i]), y(v)]), e = ends[k];
    const stroke = b.focus ? null : t.c('context');
    return g({ class: 'band' },
      el('path', { d: pathFromPoints(pts), fill: 'none', stroke, 'stroke-width': b.focus ? 3.6 : 2.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', ...(b.focus ? lit('stroke', 'context') : {}) }),
      pts.map(([cx, cy]) => el('circle', { cx, cy, r: b.focus ? 4.5 : 3.5, fill: b.focus ? null : t.c('context'), ...(b.focus ? lit('fill', 'context') : {}) })),
      textLines([b.name], { x: m.l + side + 14, y: e.y, size: 17, valign: 'middle', weight: b.focus ? 700 : 500, fill: b.focus ? null : t.c('muted'), attrs: b.focus ? lit('fill', 'muted') : {} }));
  }),
  // Build 2 — the gap at the quoted bin.
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-duration': 500 },
    el('line', { x1: x(bins[at]), x2: x(bins[at]), y1: y(focus.observed[at]), y2: y(bins[at]), stroke: t.c('accent'), 'stroke-width': 2 }),
    el('circle', { cx: x(bins[at]), cy: y(bins[at]), r: 4, fill: t.c('ink') }),
    textLines([`${bins[at] - focus.observed[at]} points`], { x: x(bins[at]) + 12, y: (y(focus.observed[at]) + y(bins[at])) / 2, size: 17, valign: 'middle', fill: t.c('accent'), weight: 700, halo: t.c('paper') })));
}

// The emphasized word keeps its box: a hidden bold twin reserves the width, so the
// weight change never reflows the line.
const word = w => `<span style="display:inline-grid"><span aria-hidden="true" style="grid-area:1/1;visibility:hidden;font-weight:800">${w}</span><span style="grid-area:1/1;color:var(--ss-ink);font-weight:600" data-states="${statesAttr({ 0: { color: 'var(--ss-ink)', fontWeight: '600' }, 1: { color: 'var(--ss-accent)', fontWeight: '800' } })}" data-duration="450">${w}</span></span>`;

export default {
  study: true,
  id: 'motion-word-emphasis',
  title: 'Word emphasis: color and weight, not motion',
  className: 'st cs-ml-eval',
  notes: 'Purpose: Put the eye on the one word that carries the claim by changing its color and weight in place, and tie it to the mark it names with the same accent.\nModify: Replace `bands`; the gap, the quoted bin and the sentence recompute. Keep the emphasized word at a line end or keep the reserved-width wrapper so the line never reflows.\nInvariant: No letter or word moves; only color and weight change. The word and its curve take the accent together; everything else stays ink or grey.\nStatic: The final build shows the accented word, the accented curve and the gap at the quoted bin.',
  sources: [{ type: 'original-example', file: 'assets/motion/word-emphasis.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="top:132px;max-width:430px;font-size:46px;line-height:1.1;font-weight:600;text-wrap:initial">Calibrated overall, but it overstates risk for patients ${word('over 80')}</h1>
<p class="st-text" style="position:absolute;left:64px;top:428px;width:410px" data-step="2" data-motion="reveal">At ${bins[at]}% predicted risk, <strong>${focus.observed[at]}%</strong> of patients ${focus.name.toLowerCase()} were admitted, against ${young.observed[at]}% of those ${young.name.toLowerCase()}.</p>
<figure class="st-fig" style="left:560px;top:118px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · 9,412 triage decisions, 2025, observed admissions within 24 h</span><span>Motion · emphasis by color and weight (2 builds)</span></p>`,
};
