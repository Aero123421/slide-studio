// Template: ML model evaluation report · Model card: intended use, limitations, subgroup results. Synthetic example content; replace data and copy.
const ID = 'tpl-ml-report-modelcard';
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
// ---- recall on failing windows by site, from the rows above ----
// Synthetic site assignment: site C receives more of the hard-to-separate failing windows.
const fail = rows.filter(w => w.y === 'F').sort((a, b) => a.x - b.x);
fail.forEach((w, i) => { w.site = i % 5 === 0 && i < 250 ? 'C' : (i % 2 ? 'A' : 'B'); });
const Z = 1.96;
const wilson = (k, n) => { const p = k / n, d = 1 + Z * Z / n, c = (p + Z * Z / (2 * n)) / d, h = Z * Math.sqrt(p * (1 - p) / n + Z * Z / (4 * n * n)) / d; return [c - h, c + h]; };
const sites = ['A', 'B', 'C'].map(s => { const g = fail.filter(w => w.site === s), k = g.filter(w => w.pred === 'F').length; return { s, n: g.length, k, r: k / g.length, ci: wilson(k, g.length) }; });
const all = { n: fail.length, k: fail.filter(w => w.pred === 'F').length };
all.r = all.k / all.n;
const W = 600, L = 150, Rr = 470, ROW = 40, TOP = 30;
const sx = v => L + v * (Rr - L);
let g = '';
for (let v = 0; v <= 1.0001; v += 0.25) g += `<line x1="${sx(v)}" y1="${TOP - 6}" x2="${sx(v)}" y2="${TOP + sites.length * ROW}" stroke="#edf1f5"/><text x="${sx(v)}" y="${TOP + sites.length * ROW + 18}" text-anchor="middle" class="v-axis">${Math.round(v * 100)}%</text>`;
g += `<line x1="${sx(all.r)}" y1="${TOP - 10}" x2="${sx(all.r)}" y2="${TOP + sites.length * ROW}" stroke="#eb6834" stroke-dasharray="4 3"/><text x="${sx(all.r)}" y="${TOP - 14}" text-anchor="middle" class="v-sig">all sites ${Math.round(all.r * 100)}%</text>`;
const low = sites.reduce((a, b) => (b.r < a.r ? b : a));
g += sites.map((d, i) => { const y = TOP + i * ROW + ROW / 2; return `<text x="0" y="${y + 5}" class="v-lab">Site ${d.s}</text><text x="${L - 14}" y="${y + 5}" text-anchor="end" class="v-axis">n = ${d.n}</text>
<line x1="${sx(d.ci[0])}" y1="${y}" x2="${sx(d.ci[1])}" y2="${y}" stroke="#104281" stroke-width="3" stroke-linecap="round"/><circle cx="${sx(d.r)}" cy="${y}" r="6" fill="#104281" stroke="#fff" stroke-width="2"/>
<text x="${Rr + 18}" y="${y + 5}" class="v-num-b">${Math.round(d.r * 100)}%</text><text x="${Rr + 60}" y="${y + 5}" class="v-axis">[${Math.round(d.ci[0] * 100)}, ${Math.round(d.ci[1] * 100)}]</text>`; }).join('');
const H = TOP + sites.length * ROW + 26;
const fig = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">Recall on failing windows by site</title>
<desc id="${ID}-d">${sites.map(d => `Site ${d.s}: ${d.k} of ${d.n} failing windows flagged, recall ${Math.round(d.r * 100)}% (95% Wilson interval ${Math.round(d.ci[0] * 100)} to ${Math.round(d.ci[1] * 100)}%)`).join('. ')}. All sites ${Math.round(all.r * 100)}%.</desc>
${g}</svg>`;

export default {
  study: true,
  id: ID,
  title: 'Model card: intended use, limitations and subgroup results',
  notes: 'Purpose: Close the report with what the model is for, what it must not be used for, what is known to be weak, and the decision requested with its safeguards.\nModify: The shared test-set block is repeated on pages 02, 03, 05 and 06 (modules cannot import each other); replace it identically on all four. Rewrite the three lists for your model. Replace the shared rows block and the site assignment with real subgroup labels; recall and Wilson intervals are computed. Keep the decision box to one request plus its conditions.\nInvariant: Limitations carry the same visual weight as intended use. Subgroup results show n and an interval, and the weakest subgroup is named in the limitations. Out-of-scope uses are stated plainly.\nStatic: Static page.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-ml-report ml-modelcard',
  content: `<div class="ml-page">
<div class="ml-top"><span class="ml-badge"><b>PumpGuard v2.3</b>evaluation report</span><span class="ml-sec"><em>06</em>Model card</span></div>
<h1 class="ml-title" data-region="title">Ready for a shadow run, not for automatic shutdowns; watch Site ${low.s}</h1>
<div class="ml-mc" data-region="primary">
  <section><h2>Intended use</h2><ul>
    <li>Rank pumps for <b>inspection within 7 days</b>; a technician makes the call.</li>
    <li>Centrifugal pumps with the v4 sensor kit at the three evaluated sites.</li>
    <li>Scores refreshed every 6 h from the last 24 h of telemetry.</li>
  </ul></section>
  <section class="ml-no"><h2>Out of scope</h2><ul>
    <li>Automatic shutdown or skipping scheduled maintenance.</li>
    <li>Pump types or sites not in the training data.</li>
    <li>Estimating time-to-failure; the output is a 7-day class only.</li>
  </ul></section>
  <section class="ml-lim"><h2>Known limitations</h2><ul>
    <li>Site ${low.s} has the lowest recall, ${Math.round(low.r * 100)}% on only ${low.n} failing windows (95% interval ${Math.round(low.ci[0] * 100)}–${Math.round(low.ci[1] * 100)}%).</li>
    <li>Labels come from work orders, so failures fixed without a ticket count as Healthy.</li>
    <li>Tested on Oct–Nov only; summer thermal load is not in the test split.</li>
  </ul></section>
</div>
<div class="ml-sub">
  <div data-region="support"><h2>Recall on failing windows by site · 95% Wilson interval</h2><figure class="ml-fig" style="position:relative;width:${W}px;height:${H}px">${fig}</figure></div>
  <div class="ml-decision" data-region="support"><span class="ml-dk">Decision requested</span><b>Approve an 8-week shadow run</b> at all three sites at <b>t = ${THRESHOLD}</b>. Alerts go to planners only. Pause and retrain if weekly precision drops below 0.5 or Site ${low.s} recall stays under 50% for two weeks.</div>
</div>
<footer class="ml-foot" data-region="source"><span>Illustrative data · fictional model, fleet and sites</span><span>model card v1 · 2 Dec 2025</span></footer>
</div>`
};
