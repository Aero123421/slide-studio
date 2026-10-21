// Motion study · Separate hypothesis and observation — measured accuracy (solid, with
// intervals) comes first; the proposed mechanism (dashed, labelled untested) and the
// accuracy it predicts are added in later builds and never share the measured marks' style.
import { svgRoot, el, g, textLines, wrapText, linear, band, theme as makeTheme, fmt } from '../runtime/figure.mjs';

// QA accuracy by document length (tokens). `inWindow`: share of gold answers inside the first 512 tokens.
const buckets = [
  { label: '≤ 256', n: 410, correct: 373, inWindow: 1.0 },
  { label: '257–512', n: 520, correct: 463, inWindow: 1.0 },
  { label: '513–1k', n: 480, correct: 346, inWindow: 0.79 },
  { label: '1k–2k', n: 390, correct: 251, inWindow: 0.70 },
  { label: '> 2k', n: 300, correct: 186, inWindow: 0.66 },
];
const window = 512;
// Wilson 95% interval for a proportion.
const wilson = (k, n, z = 1.96) => {
  const p = k / n, d = 1 + (z * z) / n, c = (p + (z * z) / (2 * n)) / d, h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [c - h, c + h];
};
const rows = buckets.map(b => ({ ...b, acc: b.correct / b.n, ci: wilson(b.correct, b.n) }));
const short = rows.filter(r => r.inWindow === 1);
const base = short.reduce((s, r) => s + r.correct, 0) / short.reduce((s, r) => s + r.n, 0);
const predicted = rows.map(r => ({ ...r, pred: base * r.inWindow }));
const longest = rows.at(-1);
const pctTxt = v => `${fmt(v * 100, { digits: 0 })}%`;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'motion-hypothesis-observation-fig';
  const plot = { x: 70, y: 16, w: 640, h: 380 };
  const x = band(rows.map(r => r.label), [plot.x, plot.x + plot.w], { inner: 0.3, outer: 0.15 });
  const y = linear([0.5, 1], [plot.y + plot.h, plot.y]);
  const cx = r => x(r.label) + x.bw / 2;
  const axes = g({},
    [0.5, 0.6, 0.7, 0.8, 0.9, 1].map(v => g({}, el('line', { x1: plot.x, x2: plot.x + plot.w, y1: y(v), y2: y(v), stroke: t.c('grid') }),
      textLines([pctTxt(v)], { x: plot.x - 12, y: y(v), size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
    rows.map(r => textLines([r.label], { x: cx(r), y: plot.y + plot.h + 12, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') })),
    textLines(['Document length, tokens'], { x: plot.x + plot.w, y: plot.y + plot.h + 40, size: 15, anchor: 'end', valign: 'top', fill: t.c('muted') }),
    el('line', { x1: x(rows[1].label) + x.bw + (x.step - x.bw) / 2, x2: x(rows[1].label) + x.bw + (x.step - x.bw) / 2, y1: plot.y, y2: plot.y + plot.h, stroke: t.c('muted'), 'stroke-dasharray': '3 4' }),
    textLines([`${window}-token window`], { x: x(rows[1].label) + x.bw + (x.step - x.bw) / 2 + 8, y: plot.y + 6, size: 15, valign: 'top', fill: t.c('muted') }));

  // Observation: solid dots, 95% intervals, values. This is all build 0 shows.
  const observed = g({},
    rows.map(r => g({},
      el('line', { x1: cx(r), x2: cx(r), y1: y(r.ci[0]), y2: y(r.ci[1]), stroke: t.c('ink'), 'stroke-width': 2 }),
      el('circle', { cx: cx(r), cy: y(r.acc), r: 8, fill: t.c('ink') }),
      textLines([pctTxt(r.acc)], { x: cx(r) - 16, y: y(r.acc), size: 17, weight: 700, anchor: 'end', valign: 'middle', fill: t.c('ink') }))),
    textLines(['Measured accuracy', 'with 95% interval'], { x: plot.x + 10, y: y(0.66), size: 16, weight: 600, fill: t.c('ink'), lineHeight: 1.3 }),
    textLines([`n = ${Math.min(...rows.map(r => r.n))}–${Math.max(...rows.map(r => r.n))} per bucket`], { x: plot.x + 10, y: y(0.66) + 46, size: 15, fill: t.c('muted') }));

  // Prediction from the hypothesis: hollow, dashed, accent — added in build 2.
  const long = predicted.filter(r => r.inWindow < 1);
  const predPath = [predicted[1], ...long].map(r => `${cx(r) + 16},${y(r.pred)}`).join(' ');
  const prediction = g({ 'data-step': 2, 'data-motion': 'reveal', 'data-duration': 600 },
    el('polyline', { points: predPath, fill: 'none', stroke: t.c('accent'), 'stroke-width': 2, 'stroke-dasharray': '7 5' }),
    long.map(r => g({}, el('path', { d: `M${cx(r) + 16} ${y(r.pred) - 8}l8 8l-8 8l-8 -8z`, fill: t.c('paper'), stroke: t.c('accent'), 'stroke-width': 2.2 }),
      textLines([pctTxt(r.pred)], { x: cx(r) + 26, y: y(r.pred) - 16, size: 16, weight: 700, valign: 'middle', fill: t.c('accent') }))),
    textLines(['Predicted by truncation', `at ${window} tokens`], { x: cx(predicted[2]) + 30, y: y(0.86), size: 16, weight: 700, fill: t.c('accent'), lineHeight: 1.25 }));

  // The proposed mechanism, drawn as a schematic inside a dashed frame that says it is untested.
  const M = { x: 776, y: 16, w: 376, h: 380 };
  const doc = { x: M.x + 24, w: M.w - 48, y: M.y + 150 }, tok = linear([0, 2000], [doc.x, doc.x + doc.w]);
  const answers = [180, 430, 690, 860, 1240, 1610, 1880]; // answer positions in a sample of long documents (tokens)
  const mechanism = g({ 'data-step': 1, 'data-motion': 'reveal', 'data-duration': 600 },
    el('rect', { x: M.x, y: M.y, width: M.w, height: M.h, rx: 12, fill: 'none', stroke: t.c('accent'), 'stroke-width': 1.6, 'stroke-dasharray': '7 5' }),
    textLines(['Proposed mechanism'], { x: M.x + 24, y: M.y + 22, size: 19, weight: 700, valign: 'top', fill: t.c('accent') }),
    textLines(['not yet tested'], { x: M.x + 24, y: M.y + 50, size: 16, valign: 'top', fill: t.c('muted') }),
    textLines(wrapText(`The reader sees only the first ${window} tokens, so answers placed later cannot be found.`, M.w - 48, 16), { x: M.x + 24, y: M.y + 86, size: 16, valign: 'top', fill: t.c('ink'), lineHeight: 1.35 }),
    el('rect', { x: doc.x, y: doc.y + 26, width: doc.w, height: 30, fill: t.c('surface'), stroke: t.c('rule') }),
    el('rect', { x: doc.x, y: doc.y + 26, width: tok(window) - doc.x, height: 30, fill: t.c('context') }),
    textLines([`first ${window} read`], { x: doc.x, y: doc.y + 66, size: 15, valign: 'top', fill: t.c('ink'), weight: 600 }),
    textLines(['rest cut off'], { x: doc.x + doc.w, y: doc.y + 66, size: 15, anchor: 'end', valign: 'top', fill: t.c('muted'), weight: 600 }),
    answers.map(a => el('line', { x1: tok(a), x2: tok(a), y1: doc.y + 20, y2: doc.y + 62, stroke: a < window ? t.c('ink') : t.c('accent'), 'stroke-width': 2.4 })),
    textLines(['Answer positions, 2,000-token documents'], { x: doc.x, y: doc.y + 6, size: 15, fill: t.c('muted') }),
    textLines(wrapText(`Test: rerun the long buckets with a 2,048-token window. If accuracy stays near ${pctTxt(longest.acc)}, truncation is not the cause.`, M.w - 48, 16), { x: M.x + 24, y: M.y + M.h - 92, size: 16, valign: 'top', fill: t.c('ink'), lineHeight: 1.35, weight: 600 }));
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'QA accuracy by document length, with a proposed truncation mechanism and its prediction',
    desc: `Measured accuracy falls from ${pctTxt(rows[0].acc)} on short documents to ${pctTxt(longest.acc)} beyond 2k tokens. Hypothesis, not yet tested: the ${window}-token window cuts off answers; it predicts ${long.map(r => pctTxt(r.pred)).join(', ')} for the three long buckets, close to the measured ${long.map(r => pctTxt(r.acc)).join(', ')}.` },
  axes, observed, mechanism, prediction);
}

export default {
  study: true,
  id: 'motion-hypothesis-observation',
  title: 'Separate hypothesis and observation',
  className: 'st cs-ml-eval',
  notes: 'Purpose: Keep a proposed mechanism visibly distinct from measured evidence, and show what it predicts before claiming it explains anything.\nModify: Replace `buckets` (n, correct, share of answers inside the window). Intervals, the prediction and every label recompute; change `window` for a different context limit.\nInvariant: Measured marks are solid ink with intervals; anything from the hypothesis is dashed or hollow and labelled untested; the test that could refute it is on the page.\nStatic: The final build shows observation, mechanism and prediction together, in their distinct styles.',
  sources: [{ type: 'original-example', file: 'assets/motion/hypothesis-observation.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Accuracy falls to ${pctTxt(longest.acc)} on long documents, close to what <em>truncation at ${window} tokens</em> predicts</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative evaluation · ${fmt(rows.reduce((s, r) => s + r.n, 0))} questions; hypothesis untested</span><span>Motion · observation, then mechanism, then its prediction (2 builds)</span></p>`,
};
