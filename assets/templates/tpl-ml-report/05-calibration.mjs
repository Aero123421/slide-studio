// Template: Model evaluation report · Calibration before and after, with bin counts. Synthetic example content; replace data and copy.
import { rng, linear, axis, pathFromPoints, textLines } from '../../runtime/figure.mjs';

const ID = 'tpl-ml-report-calibration';
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

const BINS = 10; // equal-width score bins
const panels = [ // note = [score, rate] where the label for the headline's bin starts
  { key: 'raw', title: 'Raw model scores', model: false, note: [0.19, 0.075] },
  { key: 'p', title: 'After isotonic calibration', model: true, note: [0.36, 0.06] },
];
const READ_BIN = 1; // the bin the headline reads off (0.1–0.2): well populated in both panels
const VALIDATION_WEEKS = 26; // the calibrator was fitted on these (page 01)

// ---- derived: bins, Wilson intervals, ECE and Brier for each panel
const wilson = (k, n, z = 1.96) => {
  const ph = k / n, d = 1 + z * z / n, c = (ph + z * z / (2 * n)) / d, h = (z * Math.sqrt(ph * (1 - ph) / n + z * z / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
};
for (const P of panels) {
  P.bins = Array.from({ length: BINS }, (_, k) => ({ x0: k / BINS, x1: (k + 1) / BINS, n: 0, sum: 0, pos: 0 }));
  for (const r of rows) { const b = P.bins[Math.min(BINS - 1, Math.floor(r[P.key] * BINS))]; b.n++; b.sum += r[P.key]; b.pos += r.y; }
  for (const b of P.bins) if (b.n) Object.assign(b, { pred: b.sum / b.n, obs: b.pos / b.n, ci: wilson(b.pos, b.n) });
  P.ece = P.bins.reduce((s, b) => s + (b.n ? (b.n / rows.length) * Math.abs(b.pred - b.obs) : 0), 0);
  P.brier = rows.reduce((s, r) => s + (r[P.key] - r.y) ** 2, 0) / rows.length;
}
const [raw, cal] = panels;
const rb = raw.bins[READ_BIN], cb = cal.bins[READ_BIN];
const pc = (v, d = 0) => `${(100 * v).toFixed(d)}%`;

// ---- figure: a registered pair, identical axes, counts underneath on a log scale
const PW = 340, GAP = 64, X0 = 54, TOP = 60, PH = 206, HIST_Y = TOP + PH + 22, HIST_H = 62;
const W = X0 + 2 * PW + GAP + 8, H = HIST_Y + HIST_H + 56;
const y = linear([0, 1], [TOP + PH, TOP]);
const maxLog = 5; // histogram from 1 to 100,000 pump-weeks per bin
const hy = n => HIST_Y + HIST_H - (Math.log10(Math.max(1, n)) / maxLog) * HIST_H;
const panel = (P, i) => {
  const ox = X0 + i * (PW + GAP), x = linear([0, 1], [ox, ox + PW]);
  const col = P.model ? 'var(--ml-model)' : 'var(--ml-base)', ink = P.model ? 'var(--ml-model)' : 'var(--ml-base-ink)';
  const used = P.bins.filter(b => b.n);
  const out = [
    textLines([P.title], { x: ox, y: 14, size: 17, weight: 600, fill: ink }),
    axis(y, { orient: 'left', at: ox, grid: [ox, ox + PW], tickValues: [0, 0.25, 0.5, 0.75, 1], format: v => (v ? pc(v) : '0'), labels: i === 0 }),
    `<line x1="${x(0)}" y1="${y(0)}" x2="${x(1)}" y2="${y(1)}" stroke="var(--ml-muted)" stroke-width="1.2" stroke-dasharray="4 5"/>`,
    `<line x1="${ox}" y1="${y(0)}" x2="${ox + PW}" y2="${y(0)}" stroke="var(--ml-ink)" stroke-width="1.2"/>`,
    ...used.map(b => `<line x1="${x(b.pred)}" y1="${y(b.ci[0])}" x2="${x(b.pred)}" y2="${y(b.ci[1])}" stroke="${col}" stroke-width="1.6"/>`),
    `<path d="${pathFromPoints(used.map(b => [x(b.pred), y(b.obs)]))}" fill="none" stroke="${col}" stroke-width="2.6" stroke-linejoin="round"/>`,
    ...used.map(b => `<circle cx="${x(b.pred)}" cy="${y(b.obs)}" r="5" fill="${col}" stroke="var(--ml-paper)" stroke-width="1.5"/>`),
    ...P.bins.map(b => `<rect x="${x(b.x0) + 2}" y="${hy(b.n)}" width="${x(b.x1) - x(b.x0) - 4}" height="${HIST_Y + HIST_H - hy(b.n)}" fill="${P.model ? 'var(--ml-model-soft)' : 'var(--ml-base-soft)'}"/>`),
    `<line x1="${ox}" y1="${HIST_Y + HIST_H}" x2="${ox + PW}" y2="${HIST_Y + HIST_H}" stroke="var(--ml-ink)" stroke-width="1.2"/>`,
    axis(x, { orient: 'bottom', at: HIST_Y + HIST_H, tickValues: [0, 0.25, 0.5, 0.75, 1], format: v => (v ? String(v) : '0'), tickSize: 5 }),
  ];
  if (i === 0) {
    out.push(...[2, 4].map(e => textLines([(10 ** e).toLocaleString('en-US')], { x: ox - 8, y: hy(10 ** e), size: 15, anchor: 'end', valign: 'middle', fill: 'var(--ml-muted)' })));
    const ang = (-Math.atan2(y(0) - y(1), x(1) - x(0)) * 180) / Math.PI, lx = x(0.36), ly = y(0.36) - 8;
    out.push(textLines(['perfect calibration'], { x: lx, y: ly, size: 15, fill: 'var(--ml-muted)', attrs: { transform: `rotate(${ang.toFixed(2)} ${lx} ${ly})` } }));
  }
  // the bin the headline quotes: ringed, with its two numbers written beside it
  const rb = P.bins[READ_BIN], rx = x(rb.pred), ry = y(rb.obs);
  const nx = x(P.note[0]), ny = y(P.note[1]), far = Math.hypot(nx - rx, ny - ry) > 40;
  out.push(`<circle cx="${rx}" cy="${ry}" r="10" fill="none" stroke="var(--ml-ink)" stroke-width="1.5"/>`,
    far ? `<path d="M${rx + 7} ${ry + 7}L${nx - 6} ${ny - 6}" fill="none" stroke="var(--ml-ink)" stroke-width="1.2"/>` : '',
    textLines([`${rb.pred.toFixed(2)} → ${pc(rb.obs)}`], { x: nx, y: ny, size: 16, weight: 600, fill: 'var(--ml-ink)', halo: 'var(--ml-paper)' }));
  return out.join('');
};
const fig = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${ID}-t ${ID}-d" style="font-family:var(--ml-sans)">
<title id="${ID}-t">Reliability diagrams for raw and calibrated scores, test set, with pump-weeks per score bin</title>
<desc id="${ID}-d">${panels.map(P => `${P.title}: ${P.bins.filter(b => b.n).map(b => `bin ${b.x0.toFixed(1)}–${b.x1.toFixed(1)}, ${b.n} pump-weeks, mean score ${b.pred.toFixed(3)}, observed ${pc(b.obs, 1)}`).join('; ')}. Expected calibration error ${(100 * P.ece).toFixed(1)} points, Brier score ${P.brier.toFixed(4)}`).join('. ')}.</desc>
${panels.map(panel).join('')}
${textLines(['Observed failure rate'], { x: 0, y: TOP - 22, size: 15, fill: 'var(--ml-muted)' })}
${textLines(['Score (mean of the bin)'], { x: W - 8, y: H - 12, size: 15, anchor: 'end', fill: 'var(--ml-muted)' })}
</svg>`;

export default {
  study: true,
  id: ID,
  title: 'Calibration: reliability diagrams before and after isotonic regression',
  notes: 'Purpose: Show whether a score can be read as a failure probability, before and after calibration, because planners will read it that way and the alert threshold is set on it.\nModify: Replace the shared block (identical on pages 02–06); edit BINS and READ_BIN. Bins, Wilson intervals, calibration error, Brier score, counts and the headline are computed.\nInvariant: The two panels share identical axes; the diagonal is the reference; every point carries a 95% interval and the count of pump-weeks behind it, so sparse high-score bins are not over-read; the calibrator is fitted on validation, never on test.\nStatic: Static page; no builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-ml-report ml-calibration',
  content: `<p class="ml-run"><span>PF-7 v3 pump-failure model — evaluation report</span><span>5</span></p>
<h1 class="ml-head" data-region="title">${rb.pred.toFixed(2) === cb.pred.toFixed(2) ? `A score of ${rb.pred.toFixed(2)} meant a ${pc(rb.obs)} risk of failure before calibration and means ${pc(cb.obs)} after it` : `A raw score of ${rb.pred.toFixed(2)} meant a ${pc(rb.obs)} risk of failure; a calibrated ${cb.pred.toFixed(2)} means ${pc(cb.obs)}`}</h1>
<figure class="ml-fig" style="left:64px;top:200px" data-region="primary">${fig}</figure>
<p class="ml-cap" style="left:64px;top:614px;width:858px" data-region="source"><b>Figure 5.</b> Illustrative data: test set in ten equal-width score bins. Whiskers: 95% Wilson intervals. Bars: pump-weeks per bin, on a log scale.</p>
<aside class="ml-rail ml-facts" style="left:946px;top:206px;width:270px" data-region="support"><h2>Before and after</h2>
<p><b class="num">${(100 * raw.ece).toFixed(1)} → ${(100 * cal.ece).toFixed(1)}</b> points of expected calibration error</p>
<p><b class="num">${raw.brier.toFixed(3)} → ${cal.brier.toFixed(3)}</b> Brier score; lower is better</p>
<p>Isotonic regression fitted on the ${VALIDATION_WEEKS} validation weeks, applied unchanged to the test set.</p>
</aside>`,
};
