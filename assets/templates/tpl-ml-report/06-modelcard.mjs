// Template: Model evaluation report · Model card. Synthetic example content; replace data and copy.
import { rng } from '../../runtime/figure.mjs';

const ID = 'tpl-ml-report-modelcard';
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

const shadow = { weeks: 8, from: '5 Oct 2026', stopPrecision: 0.15 }; // the run this card asks for
const card = {
  use: ['Rank pumps every Monday for a planned inspection that week.', 'A planner decides on every alert; the model acts on nothing.'],
  scope: ['Any automatic action on a pump or a work order.', 'Predicting when a pump will fail; the output is a 7-day risk.', 'Dry-pit and booster pumps: none were in the training data.'],
  limits: ['Labels come from work orders, so a failure fixed without one counts as healthy: recall is probably overstated.', 'The test covers January to June. Summer storm surges, when pumps clog most, are not in it.', 'Pumps installed in 2026 have under eight weeks of history and tend to score low.'],
};

// ---- derived from rows
const P = rows.filter(r => r.y).length;
const hit = rows.filter(r => r.p >= TEST.threshold), caught = hit.filter(r => r.y).length;
const ap = key => { const o = rows.map(r => [r[key], r.y]).sort((a, b) => b[0] - a[0]); let tp = 0, fp = 0, s = 0; for (const [, y] of o) { if (y) { tp++; s += tp / (tp + fp); } else fp++; } return s / tp; };
const ece = key => {
  const b = Array.from({ length: 10 }, () => ({ n: 0, s: 0, k: 0 }));
  for (const r of rows) { const q = b[Math.min(9, Math.floor(r[key] * 10))]; q.n++; q.s += r[key]; q.k += r.y; }
  return b.reduce((t, q) => t + (q.n ? Math.abs(q.s - q.k) / rows.length : 0), 0);
};
const ruleHits = rows.filter(r => r.vib >= TEST.ruleMmS), ruleCaught = ruleHits.filter(r => r.y).length;
const pc = v => `${Math.round(100 * v)}%`;
const metrics = [
  ['Failures caught (recall)', pc(caught / P), `${caught} of ${P}`],
  ['Alerts that were failures', pc(caught / hit.length), `${caught} of ${hit.length}`],
  ['Alerts a week', Math.round(hit.length / TEST.weeks), `crews can inspect ${TEST.capacity}`],
  ['Average precision', ap('p').toFixed(2), `vibration rule ${ap('vib').toFixed(2)}`],
  ['Calibration error', `${(100 * ece('p')).toFixed(1)} pts`, `raw scores ${(100 * ece('raw')).toFixed(1)} pts`],
];
const monitoring = [
  '<b>Every week</b> compare alerts with work orders: failures caught and missed, inspections that found nothing, alerts against crew capacity, and what the vibration rule would have caught.',
  `<b>Stop the run</b> if precision stays below ${pc(shadow.stopPrecision)} for two weeks in a row, or alerts exceed ${TEST.capacity} a week.`,
];
const para = list => list.map(t => `<p>${t}</p>`).join('');

export default {
  study: true,
  id: ID,
  title: 'Model card: intended use, limits, metrics and monitoring',
  notes: 'Purpose: Close the report with what the model may and may not be used for, how good it is in the units the decision needs, what is known to be weak, and how the shadow run will be watched and stopped.\nModify: Edit shadow and card (use, scope, limits) in plain sentences. The shared test-set block is repeated on pages 02–06; replace it identically on all five — every metric in the table is computed from it.\nInvariant: Limits carry the same weight as intended use; every metric names its denominator; the stop rule is a number, not a judgement.\nStatic: Static page; no builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-ml-report ml-modelcard',
  content: `<p class="ml-run"><span>PF-7 v3 pump-failure model — evaluation report</span><span>6</span></p>
<h1 class="ml-head" data-region="title">Fit for an ${shadow.weeks === 8 ? 'eight' : shadow.weeks}-week shadow run in which alerts advise planners and never act on a pump</h1>
<div class="ml-card" data-region="primary">
<section><h2>Intended use</h2>${para(card.use)}<h2>Out of scope</h2>${para(card.scope)}<h2>Known limits</h2>${para(card.limits)}</section>
<section><h2>Metrics on the test set</h2>
<table class="ml-metrics"><tbody>${metrics.map(m => `<tr><th>${m[0]}</th><td class="num">${m[1]}</td><td>${m[2]}</td></tr>`).join('')}</tbody></table>
<h2>Monitoring in the shadow run</h2>${para(monitoring)}<p class="ml-when">From ${shadow.from} for ${shadow.weeks} weeks at p ≥ ${TEST.threshold}. Illustrative data.</p></section>
</div>`,
};
