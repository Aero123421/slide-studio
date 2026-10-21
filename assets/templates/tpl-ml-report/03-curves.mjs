// Template: Model evaluation report · Precision–recall against the current rule. Synthetic example content; replace data and copy.
import { rng, linear, axis, pathFromPoints, textLines } from '../../runtime/figure.mjs';

const ID = 'tpl-ml-report-curves';
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

const scorers = [ // the model and today's rule, each with the threshold in use; label = [recall, precision] of the name, flagAt = height of the point label
  { key: 'p', name: 'PF-7 v3', at: TEST.threshold, point: `p ≥ ${TEST.threshold}`, model: true, label: [0.36, 0.86], flagAt: 0.56 },
  { key: 'vib', name: 'Vibration rule', at: TEST.ruleMmS, point: `≥ ${TEST.ruleMmS} mm/s`, label: [0.1, 0.5], flagAt: 0.33 },
];

// ---- derived from rows: PR points at every failure (step corners), average precision, the operating points
const P = rows.filter(r => r.y).length, prevalence = P / rows.length;
for (const s of scorers) {
  const order = rows.map(r => [r[s.key], r.y]).sort((a, b) => b[0] - a[0]);
  let tp = 0, fp = 0, ap = 0;
  s.curve = [];
  for (const [, y] of order) { if (y) { tp++; ap += tp / (tp + fp); s.curve.push([tp / P, tp / (tp + fp)]); } else fp++; }
  s.curve.unshift([0, s.curve[0][1]]);
  s.ap = ap / P;
  const hit = rows.filter(r => r[s.key] >= s.at), caught = hit.filter(r => r.y).length;
  Object.assign(s, { caught, recall: caught / P, precision: caught / hit.length, perWeek: hit.length / TEST.weeks });
}
const [mdl, rule] = scorers;
const alertsLine = mdl.perWeek * TEST.weeks; // alerts over the test period at the model's threshold
const pc = v => `${Math.round(100 * v)}%`;

// ---- figure, drawn at its slide size
const W = 760, H = 432, box = { x: 58, y: 26, w: 672, h: 330 };
const x = linear([0, 1], [box.x, box.x + box.w]), y = linear([0, 1], [box.y + box.h, box.y]);
const tick = v => (v ? `${Math.round(v * 100)}%` : '0');
const grid = axis(y, { orient: 'left', at: box.x, grid: [box.x, box.x + box.w], tickValues: [0, 0.25, 0.5, 0.75, 1], format: tick })
  + axis(x, { orient: 'bottom', at: box.y + box.h, tickValues: [0, 0.25, 0.5, 0.75, 1], format: tick, tickSize: 5 })
  + `<line x1="${box.x}" y1="${box.y + box.h}" x2="${box.x + box.w}" y2="${box.y + box.h}" stroke="var(--ml-ink)" stroke-width="1.2"/>`;
const color = s => (s.model ? 'var(--ml-model)' : 'var(--ml-base)');
const curves = [rule, mdl].map(s => `<path d="${pathFromPoints(s.curve.map(([r, p]) => [x(r), y(p)]))}" fill="none" stroke="${color(s)}" stroke-width="${s.model ? 3 : 2.4}" stroke-linejoin="round"/>`).join('');
// equal-effort line: every point on it means the same number of alerts as the model's threshold
const k = P / alertsLine, xEnd = Math.min(1, 1 / k);
const effort = `<line x1="${x(0)}" y1="${y(0)}" x2="${x(xEnd)}" y2="${y(k * xEnd)}" stroke="var(--ml-ink)" stroke-width="1.2" stroke-dasharray="5 5"/>`
  + textLines([`${Math.round(mdl.perWeek)} alerts a week`], { x: x(xEnd) - 4, y: y(k * xEnd) - 12, anchor: 'end', size: 16, fill: 'var(--ml-ink2)' });
const skill = `<line x1="${x(0)}" y1="${y(prevalence)}" x2="${x(1)}" y2="${y(prevalence)}" stroke="var(--ml-muted)" stroke-width="1" stroke-dasharray="2 4"/>`;
// each operating point carries a flag: a vertical leader up to two lines of text, set clear of both curves
const ink = s => (s.model ? 'var(--ml-model)' : 'var(--ml-base-ink)');
const point = s => {
  const px = x(s.recall), py = y(s.precision), fy = y(s.flagAt);
  return `<line x1="${px}" y1="${py - 9}" x2="${px}" y2="${fy + 30}" stroke="${ink(s)}" stroke-width="1.25"/>`
    + `<circle cx="${px}" cy="${py}" r="7" fill="${color(s)}" stroke="var(--ml-paper)" stroke-width="2.5"/>`
    + textLines([s.point], { x: px - 1, y: fy, size: 16, weight: 600, fill: ink(s) })
    + textLines([`${s.caught} caught, ${pc(s.precision)} precise`], { x: px - 1, y: fy + 21, size: 16, fill: ink(s) });
};
const names = scorers.map(s => textLines([s.name], { x: x(s.label[0]), y: y(s.label[1]), size: 18, weight: 600, fill: ink(s) })).join('');
const titles = textLines(['Precision: share of alerts that were failures'], { x: box.x - 48, y: 8, size: 16, fill: 'var(--ml-muted)' })
  + textLines(['Recall: share of failures caught'], { x: box.x + box.w, y: box.y + box.h + 50, anchor: 'end', size: 16, fill: 'var(--ml-muted)' });
const fig = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${ID}-t ${ID}-d" style="font-family:var(--ml-sans)">
<title id="${ID}-t">Precision–recall curves on the test set: PF-7 v3 and the vibration rule</title>
<desc id="${ID}-d">Average precision ${mdl.ap.toFixed(2)} for ${mdl.name} and ${rule.ap.toFixed(2)} for the ${rule.name.toLowerCase()}; no-skill precision is ${(100 * prevalence).toFixed(1)}%. At ${mdl.point} the model raises ${Math.round(mdl.perWeek)} alerts a week and catches ${mdl.caught} of ${P} failures (precision ${pc(mdl.precision)}); the rule at ${rule.point} raises ${Math.round(rule.perWeek)} a week and catches ${rule.caught} (precision ${pc(rule.precision)}). Both points lie on the dashed line of equal alert volume.</desc>
${grid}${skill}${effort}${curves}${point(rule)}${point(mdl)}${names}${titles}
</svg>`;
const rowsTable = [
  ['Alerts a week', Math.round(mdl.perWeek), Math.round(rule.perWeek)],
  ['Failures caught', mdl.caught, rule.caught],
  ['Recall', pc(mdl.recall), pc(rule.recall)],
  ['Precision', pc(mdl.precision), pc(rule.precision)],
  ['Average precision', mdl.ap.toFixed(2), rule.ap.toFixed(2)],
];

export default {
  study: true,
  id: ID,
  title: 'Precision–recall: the model against the current vibration rule',
  notes: 'Purpose: Compare the model with what maintenance does today at equal effort, because crews, not thresholds, are the scarce resource.\nModify: Replace the shared block (identical on pages 02–06); edit scorers if your baseline differs. Curves, average precision, both operating points, the equal-effort line and the table are computed from rows.\nInvariant: Precision–recall, not ROC, because failures are 1% of pump-weeks; the no-skill line is drawn; both operating points use the thresholds actually in use; model in blue, baseline in grey.\nStatic: Static page; no builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-ml-report ml-curves',
  content: `<p class="ml-run"><span>PF-7 v3 pump-failure model — evaluation report</span><span>3</span></p>
<h1 class="ml-head" data-region="title">With the same ${Math.round(mdl.perWeek)} inspections a week, the model catches ${mdl.caught} failures and the vibration rule ${rule.caught}</h1>
<figure class="ml-fig" style="left:46px;top:200px" data-region="primary">${fig}</figure>
<p class="ml-cap" style="left:64px;top:628px;width:760px" data-region="source"><b>Figure 3.</b> Illustrative data: precision and recall on the test set as the threshold varies. Dots mark the thresholds in use; the dotted line is a model without skill (${(100 * prevalence).toFixed(1)}%).</p>
<table class="ml-table ml-compare" data-region="support"><thead><tr><th>At the thresholds in use</th><th class="r">${mdl.name}</th><th class="r">${rule.name}</th></tr></thead>
<tbody>${rowsTable.map(r => `<tr><td>${r[0]}</td><td class="r num">${r[1]}</td><td class="r num">${r[2]}</td></tr>`).join('')}</tbody></table>`,
};
