// Template: Model evaluation report · Confusion matrix at the operating threshold. Synthetic example content; replace data and copy.
import { rng } from '../../runtime/figure.mjs';

const ID = 'tpl-ml-report-confusion';
// ---- Shared test set: identical on pages 02–06 (modules cannot import each other). ----
// Replace with your scored test set, one row per pump-week: y = 1 if the pump failed within 7 days,
// p = calibrated failure probability, raw = model score before calibration, vib = weekly peak vibration velocity, mm/s.
const TEST = { pumps: 1144, weeks: 26, failures: 331, threshold: 0.06, ruleMmS: 4.5, capacity: 40, seed: 7 };
const rows = (() => {
  const R = rng(TEST.seed), N = TEST.pumps * TEST.weeks, pi = TEST.failures / N, mu = 2.55, s1 = 1.15;
  const gauss = () => { let u = 0; while (!u) u = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * R()); };
  const dens = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / s;
  return Array.from({ length: N }, (_, i) => {
    const y = i < TEST.failures ? 1 : 0, z = y ? mu + s1 * gauss() : gauss();
    const a = pi * dens(z, mu, s1), p = a / (a + (1 - pi) * dens(z, 0, 1));
    return { y, p, raw: 1 / (1 + Math.exp(-(2 + 0.8 * Math.log(p / (1 - p))))), vib: Math.max(0.5, 2.76 + 0.9 * (0.55 * z + 0.835 * gauss())) };
  });
})();
// ---- end of shared block ----

const cost = { miss: 38000, inspection: 300 }; // USD: emergency call-out with bypass pumping; one planned inspection
const lower = 0.04; // the alternative threshold discussed in the rail

// ---- derived from rows
const at = t => {
  const c = { tp: 0, fp: 0, fn: 0, tn: 0 };
  for (const r of rows) c[r.p >= t ? (r.y ? 'tp' : 'fp') : (r.y ? 'fn' : 'tn')]++;
  return { ...c, recall: c.tp / (c.tp + c.fn), precision: c.tp / (c.tp + c.fp), perWeek: (c.tp + c.fp) / TEST.weeks };
};
const m = at(TEST.threshold), alt = at(lower);
const healthy = m.fp + m.tn, failed = m.tp + m.fn;
const NB = '\u00a0';
const num = v => v.toLocaleString('en-US');
const pc = (v, dg = 0) => `${(100 * v).toFixed(dg)}%`;
const usd = v => `$${num(v)}`;
const musd = v => `$${(v / 1e6).toFixed(1)}${NB}million`;
const cell = (n, name, rate, cls = '') => `<div class="ml-cell ${cls}"><b class="num">${num(n)}</b><span class="nm">${name}</span><span class="rt num">${rate}</span></div>`;

export default {
  study: true,
  id: ID,
  title: 'Confusion matrix at the operating threshold, with the cost of each error',
  notes: 'Purpose: Show what the chosen threshold does in counts — failures caught, failures missed, false alarms — and make the expensive error impossible to overlook.\nModify: Replace the shared block (identical on pages 02–06) with your scored test set; edit cost and the alternative threshold. Every count, rate, cost and the headline are computed from rows.\nInvariant: Rows are the truth, columns the model’s decision; counts and rates appear together; the missed-failure cell is the emphasised one; the threshold and the alert volume it implies are stated.\nStatic: Static page; no builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-ml-report ml-confusion',
  content: `<p class="ml-run"><span>PF-7 v3 pump-failure model — evaluation report</span><span>2</span></p>
<h1 class="ml-head" data-region="title">At ${Math.round(m.perWeek)} alerts a week the model caught ${m.tp}${NB}of${NB}${failed} failures; the ${m.fn} it missed carry the cost</h1>
<div class="ml-matrix" data-region="primary" role="table" aria-label="Confusion matrix on the test set at threshold ${TEST.threshold}">
  <div class="ml-corner"></div><div class="ml-colh">Model alerted<span>p ≥ ${TEST.threshold}</span></div><div class="ml-colh">No alert<span>p &lt; ${TEST.threshold}</span></div>
  <div class="ml-rowh">Failed within 7 days<span class="num">${num(failed)} pump-weeks</span></div>
  ${cell(m.tp, 'failures caught', `${pc(m.recall)} of failures`)}
  ${cell(m.fn, 'failures missed', `${pc(1 - m.recall)} of failures`, 'ml-costly')}
  <div class="ml-rowh">Did not fail<span class="num">${num(healthy)} pump-weeks</span></div>
  ${cell(m.fp, 'false alarms', `${pc(m.fp / healthy, 1)} of healthy weeks`)}
  ${cell(m.tn, 'quiet weeks', `${pc(m.tn / healthy, 1)} of healthy weeks`, 'ml-quiet')}
  <div class="ml-corner"></div><div class="ml-foot num"><b>${pc(m.precision)}</b> of alerts were real failures (precision)</div>
</div>
<p class="ml-cap" style="left:64px;top:614px;width:662px"><b>Figure 2.</b> Test set, ${TEST.weeks} weeks from 5${NB}Jan 2026: ${num(rows.length)} pump-weeks. An alert is a calibrated failure probability of ${TEST.threshold} or more.</p>
<aside class="ml-rail" style="left:848px;top:206px;width:368px" data-region="support"><h2>What each error costs</h2>
<p><b>A missed failure</b> is an emergency call-out with bypass pumping: about ${usd(cost.miss)}.</p>
<p><b>A false alarm</b> is one planned inspection: about ${usd(cost.inspection)}.</p>
<p><b>Over the test period</b> the misses cost ${musd(m.fn * cost.miss)} and the false alarms ${musd(m.fp * cost.inspection)}. A threshold of ${lower} would catch ${alt.tp - m.tp} more failures but needs ${Math.round(alt.perWeek)} inspections a week; crews can do ${TEST.capacity}.</p>
</aside>`,
};
