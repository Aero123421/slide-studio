// Template: ML model evaluation report · Calibration (reliability diagram). Synthetic example content; replace data and copy.
const ID = 'tpl-ml-report-calibration';
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
// ---- reliability from the rows above: 10 equal-width bins of predicted P(Failing) ----
const BINS = 10, Z = 1.96;
const wilson = (k, n) => { if (!n) return [0, 0]; const p = k / n, d = 1 + Z * Z / n, c = (p + Z * Z / (2 * n)) / d, h = Z * Math.sqrt(p * (1 - p) / n + Z * Z / (4 * n * n)) / d; return [Math.max(0, c - h), Math.min(1, c + h)]; };
function reliability(key) {
  const bins = Array.from({ length: BINS }, () => ({ n: 0, k: 0, s: 0 }));
  for (const w of rows) { const b = bins[Math.min(BINS - 1, Math.floor(w[key] * BINS))]; b.n++; b.s += w[key]; if (w.y === 'F') b.k++; }
  const out = bins.map((b, i) => ({ i, n: b.n, pred: b.n ? b.s / b.n : null, obs: b.n ? b.k / b.n : null, ci: wilson(b.k, b.n) })).filter(b => b.n);
  const ece = out.reduce((a, b) => a + b.n / rows.length * Math.abs(b.pred - b.obs), 0);
  const brier = rows.reduce((a, w) => a + Math.pow(w[key] - (w.y === 'F' ? 1 : 0), 2), 0) / rows.length;
  return { bins: out, ece, brier };
}
const raw = reliability('raw'), cal = reliability('p');
const tb = cal.bins.find(b => b.i === Math.floor(THRESHOLD * BINS)), rb = raw.bins.find(b => b.i === BINS / 2);
const pctS = v => Math.round(v * 100);
const C = { ink: '#0f172a', grid: '#edf1f5', axis: '#94a3b8', cal: '#104281', raw: '#7c8591', mute: '#556070' };
const S = 360, O = { x: 64, y: 22 }, HB = { y: O.y + S + 58, h: 64 };
const X = v => O.x + v * S, Y = v => O.y + S - v * S;
let g = '';
for (let v = 0; v <= 1.0001; v += 0.2) g += `<line x1="${X(v)}" y1="${O.y}" x2="${X(v)}" y2="${O.y + S}" stroke="${C.grid}"/><line x1="${O.x}" y1="${Y(v)}" x2="${O.x + S}" y2="${Y(v)}" stroke="${C.grid}"/><text x="${X(v)}" y="${O.y + S + 20}" text-anchor="middle" class="v-axis">${v.toFixed(1)}</text><text x="${O.x - 10}" y="${Y(v) + 5}" text-anchor="end" class="v-axis">${v.toFixed(1)}</text>`;
g += `<rect x="${O.x}" y="${O.y}" width="${S}" height="${S}" fill="none" stroke="${C.axis}"/>`;
g += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(1)}" y2="${Y(1)}" stroke="${C.ink}" stroke-width="1" stroke-dasharray="5 4"/>`;
const series = (r, col, shape, w) => {
  const pts = r.bins.map(b => [X(b.pred), Y(b.obs)]);
  let s = `<polyline points="${pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${col}" stroke-width="${w}"${shape === 'sq' ? ' stroke-dasharray="4 3"' : ''}/>`;
  s += r.bins.map(b => `<line x1="${X(b.pred)}" y1="${Y(b.ci[1])}" x2="${X(b.pred)}" y2="${Y(b.ci[0])}" stroke="${col}" stroke-width="1.3" stroke-opacity=".7"/>`).join('');
  s += r.bins.map(b => shape === 'sq' ? `<rect x="${X(b.pred) - 4.5}" y="${Y(b.obs) - 4.5}" width="9" height="9" fill="#fff" stroke="${col}" stroke-width="1.8"/>` : `<circle cx="${X(b.pred)}" cy="${Y(b.obs)}" r="5.5" fill="${col}" stroke="#fff" stroke-width="2"/>`).join('');
  return s;
};
// histogram of calibrated scores, log count axis
const maxLog = 4; // 10^4
const hx = i => X(i / BINS);
let hist = `<text x="${O.x - 10}" y="${HB.y + 10}" text-anchor="end" class="v-axis">10⁴</text><text x="${O.x - 10}" y="${HB.y + HB.h}" text-anchor="end" class="v-axis">1</text>`;
hist += `<line x1="${O.x}" y1="${HB.y + HB.h}" x2="${O.x + S}" y2="${HB.y + HB.h}" stroke="${C.axis}"/>`;
hist += cal.bins.map(b => { const h = Math.log10(b.n) / maxLog * HB.h; return `<rect x="${hx(b.i) + 3}" y="${HB.y + HB.h - h}" width="${S / BINS - 6}" height="${h}" rx="2" fill="${C.cal}" fill-opacity=".85"/><text x="${hx(b.i) + S / BINS / 2}" y="${HB.y + HB.h - h - 5}" text-anchor="middle" class="v-axis" style="font-size:12px">${b.n}</text>`; }).join('');
hist += `<text x="${O.x + S + 10}" y="${HB.y + HB.h - 4}" class="v-axis">windows per bin</text><text x="${O.x + S + 10}" y="${HB.y + HB.h + 14}" class="v-axis">(log scale)</text>`;
const H = HB.y + HB.h + 26;
const fig = `<svg viewBox="0 0 620 ${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">Reliability diagram for P(Failing), before and after calibration</title>
<desc id="${ID}-d">Ten equal-width bins of predicted probability on the test split. After isotonic calibration the observed failure rate follows the diagonal (expected calibration error ${(cal.ece * 100).toFixed(1)} points); raw scores overstate risk in the middle and upper bins (${(raw.ece * 100).toFixed(1)} points). Error bars are 95% Wilson intervals. ${cal.bins[0].n} of ${rows.length} windows fall in the lowest bin.</desc>
${g}
${series(raw, C.raw, 'sq', 1.6)}${series(cal, C.cal, 'dot', 2.2)}
<text x="${O.x + S / 2}" y="${O.y + S + 44}" text-anchor="middle" class="v-axt">Mean predicted P(Failing) in bin</text>
<text transform="translate(${O.x - 44},${O.y + S / 2}) rotate(-90)" text-anchor="middle" class="v-axt">Observed share failing</text>
<g transform="translate(${O.x + S + 24},${O.y + 10})"><circle cx="6" cy="0" r="5.5" fill="${C.cal}"/><text x="20" y="5" class="v-lab">calibrated</text><text x="20" y="23" class="v-lab2">isotonic, fit on validation</text>
<rect x="1.5" y="42" width="9" height="9" fill="#fff" stroke="${C.raw}" stroke-width="1.8"/><text x="20" y="51" class="v-lab">raw scores</text><text x="20" y="69" class="v-lab2">booster output</text>
<line x1="6" y1="86" x2="6" y2="104" stroke="${C.ink}" stroke-width="1.3"/><text x="20" y="100" class="v-lab2">95% Wilson interval</text>
<line x1="-2" y1="126" x2="14" y2="126" stroke="${C.ink}" stroke-dasharray="5 4"/><text x="20" y="131" class="v-lab2">perfect calibration</text></g>
${hist}
</svg>`;

export default {
  study: true,
  id: ID,
  title: 'Calibration: reliability diagram before and after isotonic',
  notes: 'Purpose: Show whether predicted probabilities can be read as risks, because thresholds and alert budgets are set on them.\nModify: The shared test-set block is repeated on pages 02, 03, 05 and 06 (modules cannot import each other); replace it identically on all four. Replace the shared rows block with real predictions (raw and calibrated scores); bins, observed shares, Wilson intervals, ECE, Brier score and the histogram are computed.\nInvariant: Equal-width bins, stated. The diagonal is the reference. Show how many windows fall in each bin (most are near zero for a rare class) and put an interval on each observed share. Fit the calibrator on validation, never on the test split.\nStatic: Static page.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-ml-report ml-calibration',
  content: `<div class="ml-page">
<div class="ml-top"><span class="ml-badge"><b>PumpGuard v2.3</b>evaluation report</span><span class="ml-sec"><em>05</em>Calibration</span></div>
<h1 class="ml-title" data-region="title">After calibration, a score of ${(tb.i / BINS).toFixed(1)}–${((tb.i + 1) / BINS).toFixed(1)} means ${pctS(tb.obs)}% of those windows fail</h1>
<figure class="ml-fig" style="left:56px;top:118px;width:620px;height:${H}px" data-region="primary">${fig}</figure>
<div class="ml-side" style="left:800px;top:136px;width:424px" data-region="support">
  <div class="ml-figno" style="margin-bottom:10px">P(FAILING) · TEST SPLIT · n = ${rows.length.toLocaleString('en-US')}</div>
  <div class="ml-metric"><span>Expected calibration error</span><b>${(cal.ece * 100).toFixed(1)} pts</b><small>raw scores ${(raw.ece * 100).toFixed(1)} pts · bin-weighted |pred − obs|</small></div>
  <div class="ml-metric"><span>Brier score</span><b>${cal.brier.toFixed(3)}</b><small>raw scores ${raw.brier.toFixed(3)} · lower is better</small></div>
  <div class="ml-note" style="position:static;margin-top:16px"><h3>Why it matters</h3>The alert threshold <code>t = ${THRESHOLD}</code> and the weekly alert budget assume calibrated risks. Raw scores of ${(rb.i / BINS).toFixed(1)}–${((rb.i + 1) / BINS).toFixed(1)} came true only ${pctS(rb.obs)}% of the time, so uncalibrated alerts would look more certain than they are.</div>
  <table class="ml-bins"><thead><tr><th>Calibrated bin</th><th>n</th><th>mean pred.</th><th>observed [95% CI]</th></tr></thead><tbody>${cal.bins.filter(b => b.i >= 1 && b.i <= 5).map(b => `<tr${b.i === tb.i ? ' class="ml-on"' : ''}><td>${(b.i / BINS).toFixed(1)}–${((b.i + 1) / BINS).toFixed(1)}</td><td>${b.n}</td><td>${b.pred.toFixed(2)}</td><td>${b.obs.toFixed(2)} [${b.ci[0].toFixed(2)}, ${b.ci[1].toFixed(2)}]</td></tr>`).join('')}</tbody></table>
</div>
<footer class="ml-foot" data-region="source"><span>Illustrative data · synthetic predictions</span><span>10 equal-width bins · calibrator fit on Sep 2025 validation</span></footer>
</div>`
};
