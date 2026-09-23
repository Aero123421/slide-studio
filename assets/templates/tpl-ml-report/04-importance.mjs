// Template: ML model evaluation report · Feature importance with uncertainty. Synthetic example content; replace data and copy.
const ID = 'tpl-ml-report-importance';
// One source of truth: permutation importance on the test split, metric = drop in average precision (Failing vs rest),
// 30 repeats; lo/hi = 2.5th and 97.5th percentiles of the 30 repeats.
const REPEATS = 30, BASE_AP = 0.771;
const features = [
  { f: 'vibration_rms_24h', group: 'vibration', m: 0.182, lo: 0.161, hi: 0.205 },
  { f: 'bearing_temp_delta', group: 'thermal', m: 0.121, lo: 0.104, hi: 0.139 },
  { f: 'motor_current_thd', group: 'electrical', m: 0.064, lo: 0.051, hi: 0.078 },
  { f: 'discharge_pressure_cv', group: 'hydraulic', m: 0.047, lo: 0.035, hi: 0.060 },
  { f: 'hours_since_service', group: 'maintenance', m: 0.029, lo: 0.018, hi: 0.041 },
  { f: 'start_stop_count_7d', group: 'operation', m: 0.012, lo: 0.004, hi: 0.021 },
  { f: 'ambient_temp', group: 'context', m: 0.003, lo: -0.004, hi: 0.010 },
  { f: 'site_id', group: 'context', m: -0.001, lo: -0.006, hi: 0.004 }
].sort((a, b) => b.m - a.m);
const X = { min: -0.02, max: 0.22 }, W = 760, L = 214, R = 548, TOP = 40, ROW = 46;
const sx = v => L + (v - X.min) / (X.max - X.min) * (R - L);
const f3 = v => (v < 0 ? '−' : '') + Math.abs(v).toFixed(3);
const zeroish = d => d.lo <= 0 && d.hi >= 0;
let g = '';
for (let v = 0; v <= 0.2 + 1e-9; v += 0.05) g += `<line x1="${sx(v)}" y1="${TOP - 8}" x2="${sx(v)}" y2="${TOP + features.length * ROW}" stroke="${v === 0 ? '#0f172a' : '#edf1f5'}" stroke-width="${v === 0 ? 1.4 : 1}"/><text x="${sx(v)}" y="${TOP + features.length * ROW + 22}" text-anchor="middle" class="v-axis">${v.toFixed(2)}</text>`;
const rowsSvg = features.map((d, i) => {
  const y = TOP + i * ROW + ROW / 2, z = zeroish(d), col = z ? '#94a3b8' : '#104281';
  return `${i % 2 ? '' : `<rect x="0" y="${y - ROW / 2}" width="${W}" height="${ROW}" fill="#f7f9fb"/>`}
<text x="0" y="${y + 5}" class="v-num">${d.f}</text>
<line x1="${sx(d.lo)}" y1="${y}" x2="${sx(d.hi)}" y2="${y}" stroke="${col}" stroke-width="3" stroke-linecap="round"/>
<circle cx="${sx(d.m)}" cy="${y}" r="6.5" fill="${z ? '#fff' : col}" stroke="${col}" stroke-width="2"/>
<text x="${R + 22}" y="${y + 5}" class="${z ? 'v-lab2' : 'v-num-b'}">${f3(d.m)}</text><text x="${R + 80}" y="${y + 5}" class="v-axis">[${f3(d.lo)}, ${f3(d.hi)}]</text>`;
}).join('');
const H = TOP + features.length * ROW + 50;
const fig = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">Permutation importance with 95% intervals</title>
<desc id="${ID}-d">Drop in average precision for Failing when each feature is permuted, ${REPEATS} repeats on the test split. ${features.map(d => `${d.f} ${d.m.toFixed(3)} (interval ${d.lo.toFixed(3)} to ${d.hi.toFixed(3)})`).join('; ')}. Intervals for ${features.filter(zeroish).map(d => d.f).join(' and ')} include zero.</desc>
<text x="0" y="16" class="v-axis">FEATURE</text><text x="${sx(0)}" y="16" text-anchor="middle" class="v-axis">0 = no effect</text><text x="${R + 22}" y="16" class="v-axis">MEAN  [2.5%, 97.5%]</text>
${g}${rowsSvg}
<text x="${(L + R) / 2}" y="${H - 2}" text-anchor="middle" class="v-axt">Drop in average precision when the feature is shuffled</text>
</svg>`;
const top2 = features[0].m + features[1].m, total = features.filter(d => d.m > 0).reduce((a, d) => a + d.m, 0);
const nulls = features.filter(zeroish);

export default {
  study: true,
  id: ID,
  title: 'Feature importance with uncertainty',
  notes: 'Purpose: Show which inputs the model relies on for the decision that matters, with the spread across repeats, so small or null effects are not over-read.\nModify: Replace features with your permutation-importance results (mean and interval per feature), and REPEATS / BASE_AP. Order, interval styling and the null count are computed.\nInvariant: Name the metric, the split, the number of repeats and the interval definition. Keep the zero line. Intervals that include zero are drawn hollow and grey. Importance describes the model, not causes in the pumps.\nStatic: Static page.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-ml-report ml-importance',
  content: `<div class="ml-page">
<div class="ml-top"><span class="ml-badge"><b>PumpGuard v2.3</b>evaluation report</span><span class="ml-sec"><em>04</em>What the model uses</span></div>
<h1 class="ml-title" data-region="title">Vibration and bearing heat carry the signal; ${nulls.length === 2 ? 'two' : nulls.length} features add nothing</h1>
<figure class="ml-fig" style="left:56px;top:130px;width:${W}px;height:${H}px" data-region="primary">${fig}</figure>
<div class="ml-side" style="left:864px;top:150px;width:360px" data-region="support">
  <div class="ml-metric"><span>Baseline average precision</span><b>${BASE_AP.toFixed(3)}</b><small>Failing vs rest, test split, no shuffling</small></div>
  <div class="ml-metric"><span>Intervals that include zero</span><b>${nulls.length}</b><small>${nulls.map(d => d.f).join(', ')}</small></div>
  <div class="ml-metric"><span>Top two features</span><b>${Math.round(100 * top2 / total)}%</b><small>of the summed positive drops</small></div>
  <div class="ml-note" style="position:static;margin-top:16px"><h3>Read with care</h3><ul><li>Interval = 2.5th–97.5th percentile over ${REPEATS} shuffles.</li><li>vibration_rms_24h and bearing_temp_delta are correlated (r = 0.62), so they share credit.</li><li>High importance means the model uses a feature, not that it causes failure.</li></ul></div>
</div>
<footer class="ml-foot" data-region="source"><span>Illustrative data · synthetic importances</span><span>permutation importance · test split Oct–Nov 2025</span></footer>
</div>`
};
