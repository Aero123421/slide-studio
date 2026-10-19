// Template: Model evaluation report · Dataset, splits and leakage guard. Synthetic example content; replace data and copy.
import { linear } from '../../runtime/figure.mjs';

const ID = 'tpl-ml-report-dataset';
const report = { model: 'PF-7 v3', pumps: 1144, question: 'will it fail in the next 7 days?' };
const TEST = { pumps: 1144, weeks: 26, failures: 331 }; // identical to the shared test set on pages 02–06
// One row per split. Dates are the first and last Monday scored; a label covers the 7 days after its Monday 06:00 score.
const splits = [
  { name: 'Train', from: '2023-01-02', to: '2025-06-16', pumpWeeks: 143820, failures: 1618, use: 'fit the gradient-boosted trees' },
  { name: 'Validation', from: '2025-06-30', to: '2025-12-22', pumpWeeks: 29666, failures: 334, use: 'calibrate scores, set the threshold' },
  { name: 'Test', from: '2026-01-05', to: '2026-06-29', pumpWeeks: TEST.pumps * TEST.weeks, failures: TEST.failures, use: 'evaluate once, for this report' },
];
const guards = ['2025-06-23', '2025-12-29']; // the week dropped before each boundary
const guardText = 'The week before each boundary is dropped, so the run-up to one failure never sits on both sides of a split; scores use only readings stored before Monday 06:00.';

// ---- derived
const DAY = 864e5, d = s => new Date(`${s}T00:00:00Z`);
const weeks = s => Math.round((d(s.to) - d(s.from)) / DAY / 7) + 1;
const fmtDate = (s, year = true) => d(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(year ? { year: 'numeric' } : {}), timeZone: 'UTC' });
const span = s => `${fmtDate(s.from, d(s.from).getUTCFullYear() !== d(s.to).getUTCFullYear())} – ${fmtDate(s.to)}`;
const rate = s => s.failures / s.pumpWeeks;
const test = splits.at(-1), oneIn = Math.round(1 / rate(test));
const num = v => v.toLocaleString('en-US');
const pct = v => `${(100 * v).toFixed(2)}%`;
if (weeks(test) !== TEST.weeks) throw Error(`${ID}: the test split must cover ${TEST.weeks} weeks`);

// ---- timeline: true time scale, one bar per split, the guard weeks visible as gaps
const W = 1152, H = 128, BAR_Y = 34, BAR_H = 34;
const t0 = d(splits[0].from), t1 = new Date(+d(test.to) + 7 * DAY);
const X = linear([+t0, +t1], [0, W]);
const shade = ['#d6d9de', '#6a7078', 'var(--ml-ink)'], onShade = ['var(--ml-ink)', '#ffffff', '#ffffff'];
const bars = splits.map((s, i) => {
  const x0 = X(+d(s.from)), x1 = X(+d(s.to) + 7 * DAY);
  return `<rect x="${x0}" y="${BAR_Y}" width="${x1 - x0}" height="${BAR_H}" fill="${shade[i]}"/>`
    + `<text x="${x0 + 12}" y="${BAR_Y + 23}" style="font:600 17px var(--ml-sans);fill:${onShade[i]}">${s.name}</text>`;
}).join('');
const guardMarks = guards.map(g => {
  const gx = X(+d(g) + 3.5 * DAY);
  return `<path d="M${gx} ${BAR_Y - 4}V${BAR_Y - 12}" stroke="var(--ml-ink)" stroke-width="1.25"/><text x="${gx}" y="${BAR_Y - 18}" text-anchor="middle" class="v-lab">guard week</text>`;
}).join('');
const years = [2023, 2024, 2025, 2026].map(y => { const yx = X(+d(`${y}-01-01`)); return `<line x1="${yx}" y1="${BAR_Y + BAR_H}" x2="${yx}" y2="${BAR_Y + BAR_H + 8}" stroke="var(--ml-ink)" stroke-width="1"/><text x="${Math.max(yx, 0)}" y="${BAR_Y + BAR_H + 30}" text-anchor="${yx < 1 ? 'start' : 'middle'}" class="v-axis">${y}</text>`; }).join('');
const fig = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">Time-based train, validation and test splits, ${fmtDate(splits[0].from)} to ${fmtDate(test.to)}</title>
<desc id="${ID}-d">${splits.map(s => `${s.name}: ${span(s)}, ${weeks(s)} weekly scores, ${num(s.pumpWeeks)} pump-weeks, ${num(s.failures)} failures (${pct(rate(s))})`).join('. ')}. One guard week is dropped before each boundary.</desc>
<line x1="0" y1="${BAR_Y + BAR_H}" x2="${W}" y2="${BAR_Y + BAR_H}" stroke="var(--ml-ink)" stroke-width="1"/>
${bars}${guardMarks}${years}
</svg>`;

export default {
  study: true,
  id: ID,
  title: 'Dataset: time-based splits, class balance and leakage guard',
  notes: 'Purpose: Before any metric, show what the model was tested on: later data than it was trained on, separated by guard weeks, with the same rare failure rate in every split.\nModify: Edit report, splits (first and last Monday, pump-weeks, failures, use) and guards; keep TEST identical to the shared block on pages 02–06. Bar positions, week counts, rates and the headline are computed, and the module refuses a test split that disagrees with TEST.\nInvariant: Splits follow calendar time with test last; the time axis is linear; failure rates are shown for every split; the guard rule is stated in words.\nStatic: Static page; no builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-ml-report ml-dataset',
  content: `<p class="ml-run"><span>${report.model} pump-failure model — evaluation report</span><span>1</span></p>
<h1 class="ml-head" data-region="title">Tested on the ${TEST.weeks} weeks after training, where 1 in ${oneIn} pump-weeks ended in a failure</h1>
<p class="ml-lead" data-region="support">Every Monday ${report.model} scores each of the ${num(report.pumps)} lift-station pumps: ${report.question}</p>
<figure class="ml-fig" style="left:64px;top:234px" data-region="primary">${fig}</figure>
<p class="ml-cap" style="left:64px;top:364px;width:1054px" data-region="source"><b>Figure 1.</b> Illustrative data: one score per pump each Monday, ${fmtDate(splits[0].from)} to ${fmtDate(test.to)}; the white gaps are the guard weeks.</p>
<table class="ml-table ml-splits" data-region="primary">
<thead><tr><th>Split</th><th>Weekly scores</th><th class="r">Pump-weeks</th><th class="r">Failures</th><th class="r">Failure rate</th><th>Used to</th></tr></thead>
<tbody>${splits.map(s => `<tr><td>${s.name}</td><td>${span(s)} <span class="mute">(${weeks(s)} weeks)</span></td><td class="r num">${num(s.pumpWeeks)}</td><td class="r num">${num(s.failures)}</td><td class="r num">${pct(rate(s))}</td><td>${s.use}</td></tr>`).join('')}</tbody>
</table>
<p class="ml-note" data-region="support"><b>Leakage guard.</b> ${guardText}</p>`,
};
