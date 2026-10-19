// Template: Model evaluation report · Permutation importance with intervals. Synthetic example content; replace data and copy.
import { rng, forestPlot } from '../../runtime/figure.mjs';

const ID = 'tpl-ml-report-importance';
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

const REPEATS = 30; // shuffles per input on the test set
// Mean drop in average precision when one input is shuffled; low/high = 2.5th and 97.5th percentile of the repeats.
const inputs = [
  { label: 'Motor current, 7-day trend', short: 'motor current', estimate: 0.142, low: 0.118, high: 0.167 },
  { label: 'Vibration velocity, weekly peak', short: 'vibration', estimate: 0.108, low: 0.087, high: 0.131 },
  { label: 'Bearing temperature above ambient', short: 'bearing temperature', estimate: 0.061, low: 0.044, high: 0.079 },
  { label: 'Starts per hour', short: 'starts per hour', estimate: 0.037, low: 0.022, high: 0.053 },
  { label: 'Run hours since overhaul', short: 'run hours', estimate: 0.024, low: 0.011, high: 0.038 },
  { label: 'Wet-well level variability', short: 'wet-well level', estimate: 0.011, low: 0.002, high: 0.021 },
  { label: 'Rainfall, previous 7 days', short: 'rainfall', estimate: 0.004, low: -0.005, high: 0.013 },
  { label: 'Pump age', short: 'pump age', estimate: 0.001, low: -0.006, high: 0.008 },
  { label: 'Station', short: 'station', estimate: -0.002, low: -0.009, high: 0.005 },
];

// ---- derived
const order = rows.map(r => [r.p, r.y]).sort((a, b) => b[0] - a[0]);
let tp = 0, fp = 0, sumPrec = 0;
for (const [, y] of order) { if (y) { tp++; sumPrec += tp / (tp + fp); } else fp++; }
const AP = sumPrec / tp; // average precision of the model on the test set (page 03)
const ranked = [...inputs].sort((a, b) => b.estimate - a.estimate);
const nothing = ranked.filter(r => r.low <= 0 && r.high >= 0);
const list = a => (a.length > 1 ? `${a.slice(0, -1).join(', ')} and ${a.at(-1)}` : a[0]);
const cap = s => s[0].toUpperCase() + s.slice(1);
const [first, second] = ranked;

const fig = forestPlot({
  id: `${ID}-fig`, width: 1152, height: 404,
  title: `Permutation importance of ${inputs.length} inputs on the test set`,
  desc: `Drop in average precision (from ${AP.toFixed(2)}) when each input is shuffled, mean of ${REPEATS} repeats with 2.5–97.5 percentile intervals. ${ranked.map(r => `${r.label} ${r.estimate.toFixed(3)} [${r.low.toFixed(3)}, ${r.high.toFixed(3)}]`).join('; ')}. Intervals for ${list(nothing.map(r => r.short))} include zero.`,
  rows: ranked, reference: 0, hollowIfCrossing: true, highlight: r => r.low > 0, domain: [-0.02, 0.18],
  format: { digits: 3 }, labelTitle: 'Input, shuffled', columnTitle: 'Drop in AP  [95% interval]',
  xLabel: 'Drop in average precision when the input is shuffled',
});

export default {
  study: true,
  id: ID,
  title: 'Permutation importance with intervals',
  notes: 'Purpose: Show which inputs the model actually relies on, with their uncertainty, so a reviewer can check that the signal is physical (current, vibration, heat) and not an artefact (station, age).\nModify: Replace inputs with your permutation results (mean and percentile interval per input, plain-language labels, a short name for the headline) and REPEATS; keep the shared block identical to pages 02, 03, 05 and 06. Order, highlighting, hollow markers, the base AP and the headline are computed.\nInvariant: Name the metric, the split, the number of repeats and the interval; keep the zero line; inputs whose interval includes zero are hollow and grey, never ranked as if they mattered.\nStatic: Static page; no builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-ml-report ml-importance',
  content: `<p class="ml-run"><span>PF-7 v3 pump-failure model — evaluation report</span><span>4</span></p>
<h1 class="ml-head" data-region="title">${cap(first.short)} and ${second.short} carry most of the signal; ${list(nothing.map(r => r.short))} add nothing</h1>
<figure class="ml-fig" style="left:64px;top:196px" data-region="primary">${fig}</figure>
<p class="ml-cap" style="left:64px;top:620px;width:858px"><b>Figure 4.</b> How far average precision (${AP.toFixed(2)} on the test set) falls when one input is shuffled across pump-weeks; mean of ${REPEATS} shuffles with a 95% interval. Hollow grey marks include zero.</p>`,
};
