// Diagram study · Precision–recall — precision at every recall level, with the base rate it must beat.
// The same model scores two fleets whose failure rates differ. PR curves, AP and the
// small ROC inset are all computed from raw scores (prPoints, rocPoints, auc, confusionAt).
import { svgRoot, el, g, textLines, linear, axis, pathFromPoints, spreadLabels, prPoints, rocPoints, auc, confusionAt,
  rng, fmt, pct, theme as makeTheme } from '../runtime/figure.mjs';

// Two fleets scored by the same failure-risk model (illustrative): 3,000 pump-weeks each.
// Failing and healthy weeks score alike in both fleets; only the share of failures differs.
function fleet(seed, n, failures) {
  const rand = rng(seed);
  const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
  const labels = Array.from({ length: n }, (_, i) => (i < failures ? 1 : 0));
  const scores = labels.map(y => Math.round(1000 / (1 + Math.exp(4.9 - 2.5 * (normal() + (y ? 1.9 : 0))))) / 1000);
  return { labels, scores, n, failures };
}
const alertAt = 0.3; // the same production threshold in both fleets
const fleets = [
  { name: 'North fleet', ...fleet(2025, 3000, 180) },
  { name: 'South fleet', ...fleet(2026, 3000, 45) },
].map(f => {
  const pr = prPoints(f.scores, f.labels), roc = rocPoints(f.scores, f.labels), c = confusionAt(f.scores, f.labels, alertAt);
  return { ...f, pr, roc, base: f.failures / f.n, ap: auc(pr.map(p => [p.recall, p.precision])), rocAuc: auc(roc.map(p => [p.fpr, p.tpr])),
    precision: c.tp / (c.tp + c.fp), recall: c.tp / f.failures, c };
});
const [north, south] = fleets, focus = south;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 70, t: 34, b: 66 };
  const side = H - m.t - m.b;
  const x = linear([0, 1], [m.l, m.l + side]), y = linear([0, 1], [m.t + side, m.t]);
  const look = f => (f === focus ? { color: t.c('accent'), width: 3.4, weight: 700 } : { color: t.c('muted'), width: 2.6, weight: 650 });
  const tick = { theme: t, size: 16, tickValues: [0, 0.25, 0.5, 0.75, 1], format: v => pct(v) };
  // inset: the same two fleets on ROC axes
  const ix = 846, iy = 92, is = 230;
  const rx = linear([0, 1], [ix, ix + is]), ry = linear([0, 1], [iy + is, iy]);
  const labelX = m.l + side + 24;
  return svgRoot({ id: 'precision-recall-fig', width: W, height: H, theme: t,
    title: 'Precision–recall curves for the same failure-risk model in two fleets, with a ROC inset',
    desc: `North fleet: ${pct(north.base, 1)} failures, AP ${fmt(north.ap, { digits: 2 })}. South fleet: ${pct(south.base, 1)} failures, AP ${fmt(south.ap, { digits: 2 })}. At the ${fmt(alertAt, { digits: 2 })} threshold precision is ${pct(north.precision)} in the north and ${pct(south.precision)} in the south. ROC AUC is ${fmt(north.rocAuc, { digits: 2 })} and ${fmt(south.rocAuc, { digits: 2 })}: the ROC view hides the difference.` },
  axis(y, { orient: 'left', at: m.l, grid: [m.l, m.l + side], ...tick }),
  axis(x, { orient: 'bottom', at: m.t + side, grid: [m.t, m.t + side], tickSize: 5, ...tick }),
  el('line', { x1: m.l, x2: m.l + side, y1: m.t + side, y2: m.t + side, stroke: t.c('ink'), 'stroke-width': 1.2 }),
  textLines(['Precision: share of alerts that are real failures'], { x: m.l - 54, y: m.t - 16, size: 16, fill: t.c('muted') }),
  textLines(['Recall: share of failures alerted'], { x: m.l + side, y: H - 12, size: 16, anchor: 'end', fill: t.c('muted') }),
  // base rates: a model that alerts at random scores its fleet's failure rate
  fleets.map(f => el('line', { x1: m.l, x2: m.l + side, y1: y(f.base), y2: y(f.base), stroke: look(f).color, 'stroke-width': 1.3, 'stroke-dasharray': '3 4' })),
  textLines([`Base rates: ${pct(north.base, 1)} and ${pct(south.base, 1)}`], { x: m.l + 8, y: y(north.base) - 9, size: 16, fill: t.c('muted'), halo: t.c('paper') }),
  [north, south].map(f => el('path', { d: pathFromPoints(f.pr.map(p => [x(p.recall), y(p.precision)]), { curve: 'step-after' }), fill: 'none', stroke: look(f).color, 'stroke-width': look(f).width, 'stroke-linejoin': 'round' })),
  // the shared threshold, read on both curves
  fleets.map(f => g({ class: 'pr-operating' },
    el('circle', { cx: x(f.recall), cy: y(f.precision), r: 6.5, fill: look(f).color, stroke: t.c('paper'), 'stroke-width': 2 }),
    textLines([pct(f.precision)], { x: x(f.recall) + 11, y: y(f.precision) - 13, size: 18, weight: 700, fill: look(f).color, halo: t.c('paper') }))),
  // labels beside the plot, each block at its curve's height near 40% recall
  spreadLabels(fleets.map((f, k) => ({ id: k, y: y(f.pr.filter(p => p.recall <= 0.4).at(-1).precision), h: 80 })), { min: m.t + 30, max: m.t + side - 40 }).map(p => {
    const f = fleets[p.id], s = look(f);
    return g({ class: 'pr-label' },
      textLines([f.name], { x: labelX, y: p.y - 24, size: 18, weight: s.weight, valign: 'middle', fill: s.color }),
      textLines([`${pct(f.base, 1)} failures, AP ${fmt(f.ap, { digits: 2 })}`, `at risk ≥ ${fmt(alertAt, { digits: 2 })}: recall ${pct(f.recall)}`], { x: labelX, y: p.y + 12, size: 16, valign: 'middle', fill: t.c('muted'), lineHeight: 1.35 }));
  }),
  // ROC inset
  g({ class: 'roc-inset' },
    textLines(['The same model on ROC axes', 'looks almost identical'], { x: ix, y: iy - 46, size: 16, weight: 650, fill: t.c('ink'), lineHeight: 1.25 }),
    el('path', { d: `M${ix} ${iy}V${iy + is}H${ix + is}`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.2 }), // axes only, no frame
    el('line', { x1: rx(0), y1: ry(0), x2: rx(1), y2: ry(1), stroke: t.c('muted'), 'stroke-dasharray': '3 4' }),
    [north, south].map(f => el('path', { d: pathFromPoints(f.roc.map(p => [rx(p.fpr), ry(p.tpr)]), { curve: 'step' }), fill: 'none', stroke: look(f).color, 'stroke-width': 2.2 })),
    [0, 1].map(v => textLines([pct(v)], { x: rx(v), y: iy + is + 8, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') })),
    textLines(['100%'], { x: ix - 8, y: ry(1), size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') }),
    textLines(['True-positive rate'], { x: ix - 14, y: ry(0.5), size: 15, anchor: 'middle', fill: t.c('muted'), attrs: { transform: `rotate(-90 ${ix - 14} ${ry(0.5)})` } }),
    textLines(['False-positive rate'], { x: rx(0.5), y: iy + is + 8, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') }),
    textLines(['ROC AUC'], { x: rx(0.97), y: ry(0.38), size: 15, anchor: 'end', fill: t.c('muted') }),
    fleets.map((f, k) => textLines([`${f.name.split(' ')[0]} ${fmt(f.rocAuc, { digits: 2 })}`], { x: rx(0.97), y: ry(0.26) + k * 21, size: 16, anchor: 'end', weight: look(f).weight, fill: look(f).color }))));
}

export default {
  study: true,
  id: 'precision-recall',
  title: 'Precision–recall: precision at changing recall, against the base rate',
  className: 'st cs-ml-eval',
  notes: 'Purpose: Show what share of alerts are real at each recall level, and why that depends on how common positives are — which a ROC curve does not show.\nModify: Replace each fleet\'s `labels` and `scores` (one row per case); keep `alertAt` as the threshold you deploy. Curves, AP, base rates, operating points, the ROC inset and the headline recompute.\nInvariant: Each curve is drawn with its own base rate (a random alerter\'s precision); state the prevalence and the threshold protocol (one fixed threshold, chosen before testing); never compare AP across sets with different prevalence as if it were model quality.\nStatic: Already static. Present it next to the ROC study when the audience knows ROC.',
  sources: [{ type: 'original-example', file: 'assets/svg/precision-recall.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Same model, same threshold: where failures are ${fmt(north.base / south.base, { digits: 0 })}× rarer, only <em>${pct(south.precision)}</em> of alerts are real</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · ${fmt(north.n)} pump-weeks per fleet; threshold ${fmt(alertAt, { digits: 2 })} fixed before testing; AP = area under the PR curve (trapezoid rule)</span><span>Precision–recall curve</span></p>`,
};
