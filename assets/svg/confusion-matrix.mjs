// Diagram study · Confusion matrix — which classes the model gets right, and which it mixes up.
// Counts are the data; the engine prints each count with its row share (recall per actual class).
// The headline names the largest off-diagonal share, computed from `matrix`.
import { confusionMatrix, fmt, pct } from '../runtime/figure.mjs';

// Fault-type classifier on 460 repair work orders: rows = fault found by the technician,
// columns = fault the model predicted from the pre-failure sensor window (illustrative counts).
const classes = ['Bearing wear', 'Cavitation', 'Impeller', 'Seal leak'];
const said = { 'Bearing wear': 'bearing wear', Cavitation: 'cavitation', Impeller: 'impeller damage', 'Seal leak': 'a seal leak' }; // in sentences
const matrix = [
  [151, 6, 7, 4],
  [5, 66, 20, 3],
  [4, 9, 61, 3],
  [3, 2, 2, 114],
];

const rowTotals = matrix.map(r => r.reduce((a, b) => a + b, 0));
const total = rowTotals.reduce((a, b) => a + b, 0);
const correct = matrix.reduce((s, r, i) => s + r[i], 0);
const errors = matrix.flatMap((r, i) => r.map((v, j) => ({ actual: classes[i], predicted: classes[j], v, rate: v / rowTotals[i], i, j })))
  .filter(e => e.i !== e.j).sort((a, b) => b.rate - a.rate);
const worst = errors[0];
const reverse = errors.find(e => e.i === worst.j && e.j === worst.i);
const words = ['', 'Every', 'One in two', 'One in three', 'One in four', 'One in five', 'One in six', 'One in seven', 'One in eight'];

export function figure(theme = 'css') {
  return confusionMatrix({
    id: 'confusion-matrix-fig', theme, width: 660, height: 522, fontSize: 17,
    title: 'Confusion matrix of the pump fault-type classifier, counts and row shares',
    desc: `${fmt(total)} work orders, ${pct(correct / total)} classified correctly. Largest confusion: ${pct(worst.rate)} of ${said[worst.actual]} cases (${worst.v} of ${rowTotals[worst.i]}) predicted as ${said[worst.predicted]}; the reverse error is ${pct(reverse.rate)}. Rows are actual faults and sum to 100%.`,
    labels: classes, matrix, actualLabel: 'Actual fault (technician)', predictedLabel: 'Predicted fault (model)',
  });
}

export default {
  study: true,
  id: 'confusion-matrix',
  title: 'Confusion matrix: correct and incorrect classifications',
  className: 'st st--rail st--tall cs-ml-eval',
  notes: 'Purpose: Show, class by class, how often a classifier is right and which classes it confuses with which.\nModify: Replace `classes` and `matrix` (rows = actual, columns = predicted, raw counts); the row shares, accuracy, the headline confusion and its reverse recompute. Keep class names short enough to fit a cell.\nInvariant: Axes are named (actual vs predicted) and the normalization is stated (row shares = recall per actual class); counts stay printed beside the shares; class labels on both axes.\nStatic: Already static. For many classes, sort rows by recall and show only the largest confusions.',
  sources: [{ type: 'original-example', file: 'assets/svg/confusion-matrix.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${words[Math.round(1 / worst.rate)] ?? pct(worst.rate)} ${said[worst.actual]} cases ${Math.round(1 / worst.rate) > 1 ? 'is' : 'are'} read as ${said[worst.predicted]}</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b>${pct(worst.rate)}</b><span>of ${said[worst.actual]} cases (${worst.v} of ${rowTotals[worst.i]}) predicted as ${said[worst.predicted]}; the reverse mistake is ${pct(reverse.rate)}.</span></div>
  <hr class="st-rule">
  <p class="st-text st-muted">Rows: fault the technician found. Columns: the model's call. Each row sums to 100%, so a cell's share is the recall for its row's fault.</p>
  <hr class="st-rule">
  <div class="st-kpi"><b>${pct(correct / total)}</b><span>of ${fmt(total)} work orders classified correctly overall.</span></div>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · ${fmt(total)} repair work orders with a confirmed fault, held out from training</span><span>Confusion matrix</span></p>`,
};
