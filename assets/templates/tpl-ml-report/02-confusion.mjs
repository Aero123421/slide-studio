// Template: ML model evaluation report · Confusion matrix (row-normalised). Synthetic example content; replace data and copy.
const ID = 'tpl-ml-report-confusion';
// ---- Shared synthetic test set (identical block in every data page of this pack, so all numbers agree) ----
// Replace this block with your real test-set predictions: one row per window {y: 'H'|'D'|'F', p: calibrated P(Failing), raw: uncalibrated score, pred: 'H'|'D'|'F'}.
const CLASSES = ['Healthy', 'Degraded', 'Failing']; // fixed class order: rows, columns and legends
const TEST = { H: 3720, D: 792, F: 288 }, THRESHOLD = 0.35, D_PRIME = 2.6;
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const R = rng(4800);
const gauss = () => { let u = 0; while (u === 0) u = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * R()); };
const PREV = TEST.F / (TEST.H + TEST.D + TEST.F);
const sig = z => 1 / (1 + Math.exp(-z)), logit = p => Math.log(p / (1 - p));
const posterior = x => sig(logit(PREV) + D_PRIME * x - D_PRIME * D_PRIME / 2); // calibrated P(Failing | x)
const rows = [];
for (let i = 0; i < TEST.F; i++) rows.push({ y: 'F', x: D_PRIME + gauss() });
const negs = Array.from({ length: TEST.H + TEST.D }, () => ({ x: gauss() }));
// negatives closer to the failing distribution are more often Degraded; exactly TEST.D are labelled Degraded
negs.map(n => ({ n, k: n.x * 1.4 + gauss() })).sort((a, b) => b.k - a.k).forEach((o, i) => { o.n.y = i < TEST.D ? 'D' : 'H'; rows.push(o.n); });
for (const w of rows) {
  w.p = posterior(w.x);
  w.raw = sig(1.7 * logit(w.p) + 0.9); // uncalibrated booster output: over-confident and biased upward
  const u = R();
  w.pred = w.p >= THRESHOLD ? 'F' : w.y === 'F' ? (u < 0.8 ? 'D' : 'H') : w.y === 'D' ? (u < 0.14 ? 'H' : 'D') : (u < 0.05 ? 'D' : 'H');
}
// ---- end of shared block ----
// ---- confusion matrix from the rows above ----
const K = ['H', 'D', 'F'];
const cm = K.map(t => K.map(p => rows.filter(w => w.y === t && w.pred === p).length));
const rowSum = cm.map(r => r.reduce((a, b) => a + b, 0)), colSum = K.map((_, j) => cm.reduce((a, r) => a + r[j], 0));
const N = rowSum.reduce((a, b) => a + b, 0);
const recall = K.map((_, i) => cm[i][i] / rowSum[i]), precision = K.map((_, j) => cm[j][j] / colSum[j]);
const f1 = K.map((_, i) => 2 * precision[i] * recall[i] / (precision[i] + recall[i]));
const macroF1 = f1.reduce((a, b) => a + b, 0) / 3;
const fmt = n => n.toLocaleString('en-US'), pc = v => (100 * v).toFixed(1);
// sequential single-hue ramp for row share: 0 → #f3f7fc, 1 → #104281
const lerp = (a, b, t) => Math.round(a + (b - a) * t);
const ramp = t => { const a = [0xf3, 0xf7, 0xfc], b = [0x10, 0x42, 0x81], s = Math.pow(t, 0.7); return `rgb(${lerp(a[0], b[0], s)},${lerp(a[1], b[1], s)},${lerp(a[2], b[2], s)})`; };
const CELL = 120, M = { x0: 150, y0: 70 };
let cells = '';
cm.forEach((r, i) => r.forEach((n, j) => {
  const share = n / rowSum[i], x = M.x0 + j * CELL, y = M.y0 + i * CELL, dark = Math.pow(share, 0.7) > 0.45;
  cells += `<rect x="${x + 1}" y="${y + 1}" width="${CELL - 2}" height="${CELL - 2}" fill="${ramp(share)}"/>`;
  if (i === j) cells += `<rect x="${x + 3}" y="${y + 3}" width="${CELL - 6}" height="${CELL - 6}" fill="none" stroke="${dark ? '#ffffff' : '#0f172a'}" stroke-opacity=".55" stroke-width="1"/>`;
  cells += `<text x="${x + CELL / 2}" y="${y + CELL / 2 + 4}" text-anchor="middle" class="v-big" style="fill:${dark ? '#fff' : '#0f172a'}">${pc(share)}%</text>`;
  cells += `<text x="${x + CELL / 2}" y="${y + CELL / 2 + 28}" text-anchor="middle" class="v-axis" style="fill:${dark ? '#dbe7f6' : '#556070'}">n = ${fmt(n)}</text>`;
}));
const labels = CLASSES.map((c, k) => `<text x="${M.x0 + k * CELL + CELL / 2}" y="${M.y0 - 14}" text-anchor="middle" class="v-lab">${c}</text><text x="${M.x0 - 14}" y="${M.y0 + k * CELL + CELL / 2 + 5}" text-anchor="end" class="v-lab">${c}</text>`
  + `<text x="${M.x0 + 3 * CELL + 16}" y="${M.y0 + k * CELL + CELL / 2 + 5}" class="v-num">${fmt(rowSum[k])}</text>`
  + `<text x="${M.x0 + k * CELL + CELL / 2}" y="${M.y0 + 3 * CELL + 24}" text-anchor="middle" class="v-num">${fmt(colSum[k])}</text>`).join('');
const axes = `<text x="${M.x0 + 1.5 * CELL}" y="${M.y0 - 44}" text-anchor="middle" class="v-axt">Predicted class →</text>
<text transform="translate(${M.x0 - 118},${M.y0 + 1.5 * CELL}) rotate(-90)" text-anchor="middle" class="v-axt">True class →</text>
<text x="${M.x0 + 3 * CELL + 16}" y="${M.y0 - 14}" class="v-axis">rows n</text>
<text x="${M.x0 - 14}" y="${M.y0 + 3 * CELL + 24}" text-anchor="end" class="v-axis">predicted n</text>`;
// colour key
const KY = M.y0 + 3 * CELL + 44;
const key = `<text x="${M.x0 - 14}" y="${KY + 10}" text-anchor="end" class="v-axis">row share</text>` + Array.from({ length: 11 }, (_, k) => `<rect x="${M.x0 + k * 24}" y="${KY}" width="24" height="12" fill="${ramp(k / 10)}"/>`).join('')
  + `<text x="${M.x0 + 272}" y="${KY + 10}" class="v-axis">0% → 100% of the true class</text>`;
const H = KY + 18;
const fig = `<svg viewBox="0 0 640 ${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">Confusion matrix on the test set, normalised by true class</title>
<desc id="${ID}-d">Rows are the true class and sum to 100%; columns are the predicted class; order Healthy, Degraded, Failing. ${CLASSES.map((c, i) => `True ${c} (n=${rowSum[i]}): ${CLASSES.map((d, j) => `${pc(cm[i][j] / rowSum[i])}% predicted ${d}`).join(', ')}`).join('. ')}.</desc>
${axes}${labels}${cells}${key}
</svg>`;
const FN = rowSum[2] - cm[2][2];
const metricRows = CLASSES.map((c, i) => `<div class="ml-metric"><span>${c}</span><b>${pc(recall[i])}%</b><small>precision ${pc(precision[i])}% · F1 ${f1[i].toFixed(2)} · support ${fmt(rowSum[i])}</small></div>`).join('');

export default {
  study: true,
  id: ID,
  title: 'Confusion matrix normalised by true class',
  notes: 'Purpose: Show where each true class ends up, so the audience sees which mistakes the model makes, not only how many.\nModify: The shared test-set block is repeated on pages 02, 03, 05 and 06 (modules cannot import each other); replace it identically on all four. Replace the shared rows block with real test predictions; the matrix, shares, totals, per-class metrics and title are computed from it. Change THRESHOLD only together with the ROC/PR page.\nInvariant: State the normalisation (rows = true class, each row sums to 100%) and keep counts visible. Class order Healthy → Degraded → Failing on both axes and every page. Colour encodes the row share with one hue.\nStatic: Static page.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-ml-report ml-confusion',
  content: `<div class="ml-page">
<div class="ml-top"><span class="ml-badge"><b>PumpGuard v2.3</b>evaluation report</span><span class="ml-sec"><em>02</em>Errors by class</span></div>
<h1 class="ml-title" data-region="title">${Math.round(recall[2] * 100)}% of failing windows flagged; ${cm[2][1]} of ${FN} misses still warn as Degraded</h1>
<figure class="ml-fig" style="left:56px;top:136px;width:640px;height:${H}px" data-region="primary">${fig}</figure>
<div class="ml-side" style="left:770px;top:136px;width:454px" data-region="support">
  <div class="ml-figno" style="margin-bottom:10px">RECALL BY CLASS</div>
  ${metricRows}
  <div class="ml-metric"><span>Macro F1</span><b>${macroF1.toFixed(2)}</b><small>unweighted mean over the three classes</small></div>
  <p class="ml-note" style="position:static;margin-top:16px"><b>How to read.</b> Each row is one true class and sums to 100%. Decision rule: Failing if calibrated P(Failing) ≥ ${THRESHOLD}; otherwise the more likely of Healthy and Degraded. Test set, n = ${fmt(N)}.</p>
</div>
<footer class="ml-foot" data-region="source"><span>Illustrative data · synthetic predictions</span><span>test split Oct–Nov 2025</span></footer>
</div>`
};
