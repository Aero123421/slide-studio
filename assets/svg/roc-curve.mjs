// Diagram study · ROC curve — true-positive rate against false-positive rate, threshold by threshold.
// Curves and AUC come from the engine's rocPoints()/auc() on raw scores and outcomes; the
// operating point is confusionAt() at the alert threshold actually used. Both scores share one test set.
import { svgRoot, el, g, textLines, linear, axis, pathFromPoints, spreadLabels, rocPoints, auc, confusionAt,
  rng, fmt, pct, theme as makeTheme } from '../runtime/figure.mjs';

// Held-out evaluation set (illustrative): 3,000 pump-weeks, 180 followed by a failure within 7 days.
// Each pump-week has the model's risk score (0–1) and the peak vibration reading the old rule alarmed on.
const rand = rng(2025);
const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const N = 3000, failures = 180;
const labels = Array.from({ length: N }, (_, i) => (i < failures ? 1 : 0));
const z = labels.map(y => normal() + (y ? 1.9 : 0)); // latent separation between failing and healthy weeks
const risk = z.map(v => Math.round(1000 / (1 + Math.exp(4.9 - 2.5 * v))) / 1000); // model output
const vibration = labels.map(y => Math.round((2.6 + 0.55 * (normal() + (y ? 1.0 : 0))) * 10) / 10); // mm/s RMS
const alertAt = 0.3; // production threshold on the risk score

const curves = [
  { name: 'Risk model', scores: risk },
  { name: 'Vibration rule', scores: vibration },
].map(c => { const pts = rocPoints(c.scores, labels); return { ...c, pts, auc: auc(pts.map(p => [p.fpr, p.tpr])) }; });
const healthy = N - failures;
const op = confusionAt(risk, labels, alertAt), opFpr = op.fp / healthy, opTpr = op.tp / failures;
// the rule at the same false-alarm budget: its best true-positive rate with FPR no higher than the model's
const rulePt = curves[1].pts.filter(p => p.fpr <= opFpr).reduce((a, b) => (b.tpr > a.tpr ? b : a));
const ratio = opTpr / rulePt.tpr;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 800, H = 470, m = { l: 70, t: 34, b: 66 };
  const side = H - m.t - m.b;
  const x = linear([0, 1], [m.l, m.l + side]), y = linear([0, 1], [m.t + side, m.t]);
  const style = [{ color: t.c('accent'), width: 3.4, weight: 700 }, { color: t.c('muted'), width: 2.6, weight: 650 }];
  const tprAt = (c, f) => c.pts.filter(p => p.fpr <= f).at(-1).tpr;
  const placed = spreadLabels(curves.map((c, k) => ({ id: k, y: y(tprAt(c, 0.5)), h: 46 })), { min: m.t + 20, max: m.t + side - 20 });
  const pct0 = v => pct(v), tick = { theme: t, size: 16, tickValues: [0, 0.25, 0.5, 0.75, 1], format: pct0 };
  return svgRoot({ id: 'roc-curve-fig', width: W, height: H, theme: t,
    title: 'ROC curves for pump-failure alerts: risk model and vibration rule on the same test set',
    desc: `Risk model AUC ${fmt(curves[0].auc, { digits: 3 })}, vibration rule AUC ${fmt(curves[1].auc, { digits: 3 })}. At the ${fmt(alertAt, { digits: 2 })} alert threshold the model flags ${pct(opFpr, 1)} of healthy pump-weeks and catches ${pct(opTpr)} of failures; at the same false-alarm rate the rule catches ${pct(rulePt.tpr)}.` },
  axis(y, { orient: 'left', at: m.l, grid: [m.l, m.l + side], ...tick }),
  axis(x, { orient: 'bottom', at: m.t + side, grid: [m.t, m.t + side], tickSize: 5, ...tick }),
  el('line', { x1: m.l, x2: m.l + side, y1: m.t + side, y2: m.t + side, stroke: t.c('ink'), 'stroke-width': 1.2 }),
  textLines(['True-positive rate: failures caught'], { x: m.l - 54, y: m.t - 16, size: 16, fill: t.c('muted') }),
  textLines(['False-positive rate: healthy weeks flagged'], { x: m.l + side, y: H - 12, size: 16, anchor: 'end', fill: t.c('muted') }),
  el('line', { x1: x(0), y1: y(0), x2: x(1), y2: y(1), stroke: t.c('muted'), 'stroke-width': 1.2, 'stroke-dasharray': '4 5' }),
  textLines(['Chance'], { x: x(0.8), y: y(0.8) + 18, size: 16, anchor: 'middle', fill: t.c('muted'), attrs: { transform: `rotate(-45 ${x(0.8)} ${y(0.8) + 18})` } }),
  // the shared false-alarm budget: where the comparison is read
  el('line', { x1: x(opFpr), x2: x(opFpr), y1: m.t, y2: m.t + side, stroke: t.c('ink'), 'stroke-width': 1.2, 'stroke-dasharray': '5 5' }),
  [...curves].reverse().map(c => { const s = style[curves.indexOf(c)]; return el('path', { d: pathFromPoints(c.pts.map(p => [x(p.fpr), y(p.tpr)]), { curve: 'step' }), fill: 'none', stroke: s.color, 'stroke-width': s.width, 'stroke-linejoin': 'round' }); }),
  placed.map(p => { const c = curves[p.id], s = style[p.id]; return g({ class: 'roc-label' },
    textLines([c.name], { x: m.l + side + 20, y: p.y - 10, size: 18, weight: s.weight, valign: 'middle', fill: s.color }),
    textLines([`AUC ${fmt(c.auc, { digits: 3 })}`], { x: m.l + side + 20, y: p.y + 13, size: 16, valign: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } })); }),
  el('circle', { cx: x(rulePt.fpr), cy: y(rulePt.tpr), r: 6, fill: t.c('muted'), stroke: t.c('paper'), 'stroke-width': 2 }),
  textLines([`${pct(rulePt.tpr)} at the same rate`], { x: x(rulePt.fpr) + 12, y: y(rulePt.tpr), size: 17, valign: 'middle', weight: 650, fill: t.c('muted'), halo: t.c('paper') }),
  // the operating point: a ring on the curve, its reading just right of it between the two curves
  el('circle', { cx: x(opFpr), cy: y(opTpr), r: 9, fill: 'none', stroke: t.c('accent'), 'stroke-width': 2.2 }),
  textLines([`${pct(opTpr)} at risk ≥ ${fmt(alertAt, { digits: 2 })}`], { x: x(opFpr) + 14, y: y(opTpr) - 16, size: 17, valign: 'middle', weight: 700, fill: t.c('accent'), halo: t.c('paper') }));
}

export default {
  study: true,
  id: 'roc-curve',
  title: 'ROC curve: sensitivity against false-positive rate',
  className: 'st st--rail cs-ml-eval',
  notes: 'Purpose: Show the trade-off between catching positives and raising false alarms across every threshold, and compare two scorers at the false-alarm rate you can afford.\nModify: Replace `labels` and the two score arrays (one row per case, same test set); set `alertAt` to your production threshold. Curves, AUC, the operating point, the rule\'s matching point, the rail and the headline recompute.\nInvariant: Both axes run 0–100%; every curve is computed on the same population; the operating point is the real threshold, read with confusionAt(), not eyeballed; the chance diagonal stays.\nStatic: Already static. With rare positives, pair this page with the precision–recall study.',
  sources: [{ type: 'original-example', file: 'assets/svg/roc-curve.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">At a ${pct(opFpr)} false-alarm rate, the risk model catches <em>${pct(opTpr)}</em> of pump failures; the vibration rule catches ${pct(rulePt.tpr)}</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b class="st-accent">${fmt(ratio, { digits: 1 })}×</b><span>as many failures caught as the vibration rule, for the same number of false alarms.</span></div>
  <hr class="st-rule">
  <div class="st-kpi"><b>${fmt(op.fp)}</b><span>healthy pump-weeks of ${fmt(healthy)} flagged at the ${fmt(alertAt, { digits: 2 })} threshold: the price of catching ${op.tp} of ${failures} failures.</span></div>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · one held-out set: ${fmt(N)} pump-weeks, ${failures} failures within 7 days</span><span>ROC curve</span></p>`,
};
