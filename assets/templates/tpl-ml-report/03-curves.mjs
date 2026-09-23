// Template: ML model evaluation report · ROC and precision–recall curves with thresholds. Synthetic example content; replace data and copy.
const ID = 'tpl-ml-report-curves';
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
// ---- one-vs-rest curves (Failing vs the other two classes) from the rows above ----
const MARKS = [0.2, THRESHOLD, 0.5];
const P = rows.filter(w => w.y === 'F').length, Nn = rows.length - P;
const sorted = [...rows].sort((a, b) => b.p - a.p);
const roc = [[0, 0]], pr = [];
let tp = 0, fp = 0, auc = 0, ap = 0;
for (const w of sorted) {
  if (w.y === 'F') { tp++; ap += tp / (tp + fp); pr.push([tp / P, tp / (tp + fp)]); } else { fp++; auc += tp; }
  roc.push([fp / Nn, tp / P]);
}
auc /= P * Nn; ap /= P;
const at = t => { const a = rows.filter(w => w.p >= t), tpT = a.filter(w => w.y === 'F').length; return { t, tpr: tpT / P, fpr: (a.length - tpT) / Nn, prec: tpT / a.length, n: a.length }; };
const pts = MARKS.map(at);
// keep only the corners of the empirical step curve (where the class of consecutive windows changes)
const isF = w => w.y === 'F';
const rocCorners = roc.filter((p, i) => i === 0 || i === roc.length - 1 || isF(sorted[i - 1]) !== isF(sorted[i]));
const fmt = n => n.toLocaleString('en-US');
const C = { ink: '#0f172a', grid: '#edf1f5', axis: '#94a3b8', curve: '#104281', sig: '#eb6834', mute: '#556070' };
// panel builder: square plot with 0–1 axes
function panel({ x0, y0, s, xs, ys }) {
  const X = v => x0 + (v - xs[0]) / (xs[1] - xs[0]) * s, Y = v => y0 + s - (v - ys[0]) / (ys[1] - ys[0]) * s;
  return { X, Y };
}
const S = 340, O = { x: 64, y: 44 };
function frame(A, xs, ys, step, xl, yl) {
  let g = '';
  for (let v = xs[0]; v <= xs[1] + 1e-9; v += step) g += `<line x1="${A.X(v)}" y1="${O.y}" x2="${A.X(v)}" y2="${O.y + S}" stroke="${C.grid}"/><text x="${A.X(v)}" y="${O.y + S + 22}" text-anchor="middle" class="v-axis">${v.toFixed(1)}</text>`;
  for (let v = ys[0]; v <= ys[1] + 1e-9; v += step) g += `<line x1="${O.x}" y1="${A.Y(v)}" x2="${O.x + S}" y2="${A.Y(v)}" stroke="${C.grid}"/><text x="${O.x - 10}" y="${A.Y(v) + 5}" text-anchor="end" class="v-axis">${v.toFixed(1)}</text>`;
  g += `<rect x="${O.x}" y="${O.y}" width="${S}" height="${S}" fill="none" stroke="${C.axis}"/>`;
  g += `<text x="${O.x + S / 2}" y="${O.y + S + 48}" text-anchor="middle" class="v-axt">${xl}</text><text transform="translate(${O.x - 46},${O.y + S / 2}) rotate(-90)" text-anchor="middle" class="v-axt">${yl}</text>`;
  return g;
}
const path = (arr, A) => 'M' + arr.map(([a, b]) => `${A.X(a).toFixed(1)},${A.Y(b).toFixed(1)}`).join(' L');
const mark = (x, y, t, anchor, dx, dy) => {
  const op = t === THRESHOLD;
  return `<circle cx="${x}" cy="${y}" r="${op ? 7 : 5}" fill="${op ? C.sig : '#fff'}" stroke="${C.sig}" stroke-width="2"/>`
    + `<text x="${x + dx}" y="${y + dy}" text-anchor="${anchor}" class="${op ? 'v-sig' : 'v-axis'}">${op ? `t = ${t.toFixed(2)} operating` : `t = ${t.toFixed(2)}`}</text>`;
};
// ROC
const Ar = panel({ x0: O.x, y0: O.y, s: S, xs: [0, 1], ys: [0, 1] });
const inset = { x: O.x + 150, y: O.y + 150, s: 176 }, IX = v => inset.x + (v / 0.1) * inset.s, IY = v => inset.y + inset.s - ((v - 0.5) / 0.5) * inset.s;
const rocIn = rocCorners.filter(([f]) => f <= 0.1);
let insetSvg = `<rect x="${inset.x}" y="${inset.y}" width="${inset.s}" height="${inset.s}" fill="#fff" stroke="${C.axis}"/>`;
for (const v of [0.05]) insetSvg += `<line x1="${IX(v)}" y1="${inset.y}" x2="${IX(v)}" y2="${inset.y + inset.s}" stroke="${C.grid}"/>`;
for (const v of [0.75]) insetSvg += `<line x1="${inset.x}" y1="${IY(v)}" x2="${inset.x + inset.s}" y2="${IY(v)}" stroke="${C.grid}"/>`;
insetSvg += `<path d="M${rocIn.map(([a, b]) => `${IX(a).toFixed(1)},${IY(Math.max(0.5, b)).toFixed(1)}`).join(' L')}" fill="none" stroke="${C.curve}" stroke-width="2"/>`;
insetSvg += pts.map(p => `<circle cx="${IX(p.fpr)}" cy="${IY(p.tpr)}" r="${p.t === THRESHOLD ? 5 : 4}" fill="${p.t === THRESHOLD ? C.sig : '#fff'}" stroke="${C.sig}" stroke-width="1.8"/>`).join('');
insetSvg += `<text x="${inset.x + inset.s}" y="${inset.y - 8}" text-anchor="end" class="v-axis">zoom: FPR 0–0.1, TPR 0.5–1</text>`;
const zoomBox = `<rect x="${Ar.X(0)}" y="${Ar.Y(1)}" width="${Ar.X(0.1) - Ar.X(0)}" height="${Ar.Y(0.5) - Ar.Y(1)}" fill="none" stroke="${C.mute}" stroke-dasharray="3 3"/><line x1="${Ar.X(0.1)}" y1="${Ar.Y(0.5)}" x2="${inset.x}" y2="${inset.y}" stroke="${C.mute}" stroke-dasharray="3 3"/>`;
const rocSvg = `<svg viewBox="0 0 440 440" role="img" aria-labelledby="${ID}-rt ${ID}-rd">
<title id="${ID}-rt">ROC curve, Failing versus rest</title>
<desc id="${ID}-rd">Empirical ROC for Failing versus Healthy and Degraded on ${fmt(P + Nn)} test windows. AUC ${auc.toFixed(3)}. ${pts.map(p => `At threshold ${p.t.toFixed(2)}: true positive rate ${p.tpr.toFixed(2)}, false positive rate ${p.fpr.toFixed(3)}`).join('. ')}. The dashed diagonal is a random classifier.</desc>
${frame(Ar, [0, 1], [0, 1], 0.2, 'False positive rate', 'True positive rate (recall)')}
<line x1="${Ar.X(0)}" y1="${Ar.Y(0)}" x2="${Ar.X(1)}" y2="${Ar.Y(1)}" stroke="${C.axis}" stroke-dasharray="4 4"/><text x="${Ar.X(0.62)}" y="${Ar.Y(0.62) - 8}" class="v-axis" transform="rotate(-45 ${Ar.X(0.62)} ${Ar.Y(0.62) - 8})">random</text>
<path d="${path(rocCorners, Ar)}" fill="none" stroke="${C.curve}" stroke-width="2.4" stroke-linejoin="round"/>
${zoomBox}${insetSvg}
${pts.map((p, i) => `<circle cx="${Ar.X(p.fpr)}" cy="${Ar.Y(p.tpr)}" r="3.5" fill="${C.sig}"/>`).join('')}
${pts.map((p, i) => `<text x="${IX(p.fpr) + 10}" y="${IY(p.tpr) + [14, 5, -6][i]}" class="${p.t === THRESHOLD ? 'v-sig' : 'v-axis'}">${p.t.toFixed(2)}</text>`).join('')}
</svg>`;
// PR
const Ap = panel({ x0: O.x, y0: O.y, s: S, xs: [0, 1], ys: [0, 1] });
const prSvg = `<svg viewBox="0 0 440 440" role="img" aria-labelledby="${ID}-pt ${ID}-pd">
<title id="${ID}-pt">Precision–recall curve, Failing versus rest</title>
<desc id="${ID}-pd">Empirical precision–recall curve for Failing. Average precision ${ap.toFixed(3)}; a classifier without skill sits at the prevalence, ${(100 * P / (P + Nn)).toFixed(1)}%. ${pts.map(p => `At threshold ${p.t.toFixed(2)}: recall ${p.tpr.toFixed(2)}, precision ${p.prec.toFixed(2)}`).join('. ')}.</desc>
${frame(Ap, [0, 1], [0, 1], 0.2, 'Recall (true positive rate)', 'Precision')}
<line x1="${Ap.X(0)}" y1="${Ap.Y(P / (P + Nn))}" x2="${Ap.X(1)}" y2="${Ap.Y(P / (P + Nn))}" stroke="${C.axis}" stroke-dasharray="4 4"/><text x="${Ap.X(0.03)}" y="${Ap.Y(P / (P + Nn)) - 8}" class="v-axis">no skill = prevalence ${(100 * P / (P + Nn)).toFixed(1)}%</text>
<path d="${path(pr, Ap)}" fill="none" stroke="${C.curve}" stroke-width="2.4" stroke-linejoin="round"/>
${pts.map((p, i) => mark(Ap.X(p.tpr), Ap.Y(p.prec), p.t, 'end', -12, [22, 22, -12][i])).join('')}
</svg>`;
const op = pts.find(p => p.t === THRESHOLD);
const alertsPerWeek = (op.n / 61 * 7).toFixed(0); // test split spans 61 days

export default {
  study: true,
  id: ID,
  title: 'ROC and precision–recall curves with operating threshold',
  notes: 'Purpose: Show ranking quality (ROC) and the alert trade-off that matters with a rare class (precision–recall) side by side, with the thresholds under discussion marked on both.\nModify: The shared test-set block is repeated on pages 02, 03, 05 and 06 (modules cannot import each other); replace it identically on all four. Replace the shared rows block with real predictions; curves, AUC, AP, threshold points and the caption are computed. Edit MARKS and THRESHOLD to discuss other operating points.\nInvariant: Say it is one-vs-rest and which class is positive. Show the chance line on ROC and the prevalence baseline on PR. Thresholds refer to calibrated probabilities and are the same points on both panels.\nStatic: Static page.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-ml-report ml-curves',
  content: `<div class="ml-page">
<div class="ml-top"><span class="ml-badge"><b>PumpGuard v2.3</b>evaluation report</span><span class="ml-sec"><em>03</em>Threshold trade-off</span></div>
<h1 class="ml-title" data-region="title">At t = ${THRESHOLD}: ${Math.round(op.tpr * 100)}% of failing windows caught, ${Math.round(op.prec * 100)}% of alerts correct</h1>
<div class="ml-cap" style="left:56px;top:124px;width:560px"><span class="ml-figno">FIG 3A · ROC</span>  AUC <b>${auc.toFixed(3)}</b></div>
<figure class="ml-fig" style="left:56px;top:146px;width:440px;height:440px" data-region="primary">${rocSvg}</figure>
<div class="ml-cap" style="left:560px;top:124px;width:560px"><span class="ml-figno">FIG 3B · PRECISION–RECALL</span>  average precision <b>${ap.toFixed(3)}</b></div>
<figure class="ml-fig" style="left:560px;top:146px;width:440px;height:440px" data-region="primary">${prSvg}</figure>
<div class="ml-note" style="left:1032px;top:150px;width:192px" data-region="support"><h3>Operating point</h3><b>t = ${THRESHOLD}</b><br>recall ${op.tpr.toFixed(2)}<br>precision ${op.prec.toFixed(2)}<br>FPR ${op.fpr.toFixed(3)}<br>${fmt(op.n)} alerts in 61 days, about ${alertsPerWeek} a week</div>
<div class="ml-note" style="left:1032px;top:392px;width:192px" data-region="support"><h3>Setup</h3>One-vs-rest: <b>Failing</b> is positive, Healthy and Degraded negative. ${fmt(P)} positives, ${fmt(Nn)} negatives. Thresholds are on calibrated P(Failing).</div>
<footer class="ml-foot" data-region="source"><span>Illustrative data · synthetic predictions</span><span>test split Oct–Nov 2025 · empirical curves, no smoothing</span></footer>
</div>`
};
