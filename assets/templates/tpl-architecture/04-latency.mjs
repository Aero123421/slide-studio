// Template: Engineering design review / postmortem · Latency percentiles over time. Synthetic example content; replace data and copy.
// Replace the generator below with your real per-bucket percentiles: [{t:'HH:MM', p50, p95, p99}, …].
const ID = 'tpl-architecture-latency';
const C = { grid: '#1f2d40', axis: '#3a4c63', mute: '#8a9bb0', text2: '#b4c1d1', p50: '#256abf', p95: '#5598e7', p99: '#9ec5f4', crit: '#e66767', warn: '#fab219', bg: '#0b1119' };
const SLO = 400, START = 12 * 60, BUCKET = 5, N = 97; // 12:00–20:00 UTC in 5-minute buckets
const events = [
  { t: '13:58', label: 'deploy v4.18' },
  { t: '14:17', label: 'alert' },
  { t: '16:10', label: 'rollback' }
];
// --- synthetic generator (deterministic): baseline + incident envelope
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const r = rng(2317);
const mins = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const env = m => { // 0 → 1 incident intensity
  if (m < mins('14:00') || m > mins('17:00')) return 0;
  if (m < mins('14:30')) return (m - mins('14:00')) / 30;
  if (m <= mins('16:10')) return 0.8 + 0.2 * Math.exp(-Math.pow((m - mins('15:30')) / 28, 2));
  return 0.8 * Math.pow(1 - (m - mins('16:10')) / 50, 1.35);
};
const raw = Array.from({ length: N }, (_, i) => {
  const m = START + i * BUCKET, e = env(m), n = () => 1 + (r() - 0.5) * 0.12;
  return { t: hhmm(m), p50: 92 * n() + e * 190, p95: 205 * n() + e * 900, p99: 285 * n() + e * 1600 };
});
// scale the incident excess so the reported peak equals the incident record (1,940 ms)
const PEAK = 1940, iPk = raw.reduce((b, d, i) => (d.p99 > raw[b].p99 ? i : b), 0), k = (PEAK - 285) / (raw[iPk].p99 - 285);
const data = raw.map(d => ({ t: d.t, p50: Math.round(d.p50), p95: Math.round(d.p95), p99: Math.round(d.p99 > 400 ? 285 + (d.p99 - 285) * k : d.p99) }));
// --- derived facts (used by the side panel and the description)
const peak = data.reduce((b, d) => (d.p99 > b.p99 ? d : b), data[0]);
const over = data.filter(d => d.p99 > SLO);
const firstOver = over[0], lastOver = over.at(-1);
const endOf = d => hhmm(mins(d.t) + BUCKET); // buckets are labelled by their start time
const contiguous = data.indexOf(lastOver) - data.indexOf(firstOver) + 1 === over.length;
const p50peak = Math.max(...data.map(d => d.p50));
// --- geometry
const W = 872, H = 470, P = { x0: 64, x1: 780, y0: 36, y1: 410 }, Y = { min: 50, max: 3000 };
const x = t => P.x0 + (mins(t) - START) / (BUCKET * (N - 1)) * (P.x1 - P.x0);
const y = v => P.y1 - (Math.log10(v) - Math.log10(Y.min)) / (Math.log10(Y.max) - Math.log10(Y.min)) * (P.y1 - P.y0);
let grid = '';
for (const v of [50, 100, 200, 500, 1000, 2000]) grid += `<line x1="${P.x0}" y1="${y(v)}" x2="${P.x1}" y2="${y(v)}" stroke="${C.grid}"/><text x="${P.x0 - 10}" y="${y(v) + 5}" text-anchor="end" class="t-axis">${v >= 1000 ? v / 1000 + 's' : v}</text>`;
for (let h = 12; h <= 20; h++) { const t = hhmm(h * 60); grid += `<line x1="${x(t)}" y1="${P.y1}" x2="${x(t)}" y2="${P.y1 + 6}" stroke="${C.axis}"/><text x="${x(t)}" y="${P.y1 + 24}" text-anchor="middle" class="t-axis">${t}</text>`; }
grid += `<line x1="${P.x0}" y1="${P.y1}" x2="${P.x1}" y2="${P.y1}" stroke="${C.axis}"/>`;
const win = `<rect x="${x(firstOver.t) - 3}" y="${P.y0}" width="${x(endOf(lastOver)) - x(firstOver.t) + 3}" height="${P.y1 - P.y0}" fill="${C.warn}" fill-opacity=".07"/>`
  + `<text x="${x(firstOver.t) + 6}" y="${P.y1 - 10}" class="t-mono-s">p99 over SLO · ${firstOver.t}–${endOf(lastOver)}</text>`;
const slo = `<line x1="${P.x0}" y1="${y(SLO)}" x2="${P.x1}" y2="${y(SLO)}" stroke="${C.crit}" stroke-width="1.4" stroke-dasharray="6 4"/><text x="${P.x0 + 8}" y="${y(SLO) - 8}" class="t-crit">p99 SLO 400 ms</text>`;
const ev = events.map(e => `<line x1="${x(e.t)}" y1="${P.y0 - 6}" x2="${x(e.t)}" y2="${P.y1}" stroke="${C.text2}" stroke-width="1" stroke-dasharray="2 3"/><circle cx="${x(e.t)}" cy="${P.y0 - 6}" r="3.5" fill="${C.text2}"/>`).join('')
  + events.map((e, i) => `<text x="${x(e.t) + (i ? 8 : -8)}" y="${P.y0 - 14}" text-anchor="${i ? 'start' : 'end'}" class="t-mono">${e.t} ${e.label}</text>`).join('');
const series = [['p50', C.p50, 1.8], ['p95', C.p95, 1.8], ['p99', C.p99, 2.4]];
const lines = series.map(([k, c, w]) => `<polyline points="${data.map(d => `${x(d.t).toFixed(1)},${y(d[k]).toFixed(1)}`).join(' ')}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`).join('');
const last = data.at(-1);
const ends = series.map(([k, c]) => `<circle cx="${x(last.t)}" cy="${y(last[k])}" r="4" fill="${c}" stroke="${C.bg}" stroke-width="2"/><text x="${P.x1 + 12}" y="${y(last[k]) + 5}" class="t-mono-b">${k}</text><text x="${P.x1 + 50}" y="${y(last[k]) + 5}" class="t-mono-s">${last[k]}</text>`).join('');
const pk = `<circle cx="${x(peak.t)}" cy="${y(peak.p99)}" r="5" fill="${C.p99}" stroke="${C.bg}" stroke-width="2"/><text x="${x(peak.t) + 10}" y="${y(peak.p99) - 8}" class="t-mono-b">${peak.p99.toLocaleString('en-US')} ms</text>`;
const chart = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">Checkout latency percentiles, 12:00–20:00 UTC, log scale</title>
<desc id="${ID}-d">p50, p95 and p99 latency of POST /checkout in 5-minute buckets on a logarithmic axis. Before the deploy at 13:58 p99 stays near 290 ms. In every bucket from ${firstOver.t} to ${endOf(lastOver)} p99 exceeds the 400 ms SLO, peaking at ${peak.p99} ms at ${peak.t}. p50 peaks at ${p50peak} ms. After the rollback at 16:10 all percentiles return to baseline by about 17:00.</desc>
${grid}${win}${slo}${ev}${lines}${pk}${ends}
<text x="${P.x0 - 10}" y="${P.y0 - 14}" text-anchor="end" class="t-mono-s">ms</text>
<text x="${(P.x0 + P.x1) / 2}" y="${P.y1 + 50}" text-anchor="middle" class="t-mono-s">time, UTC · 12 Aug 2026 · 5-minute buckets</text>
</svg>`;

export default {
  study: true,
  id: ID,
  title: 'Latency percentiles over time',
  notes: 'Purpose: Show how far and for how long latency left its objective, with the change events that explain the shape.\nModify: Replace the generator with real per-bucket percentiles in data (t, p50, p95, p99), and edit events and SLO. The window, peak, side-panel numbers and description are derived from data.\nInvariant: Percentiles are computed per bucket from raw requests, never averaged across buckets. State the bucket size, population and log scale. p50/p95/p99 use one ordered hue; the SLO keeps the critical color.\nStatic: Static page.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-architecture ar-latency',
  content: `<div class="ar-page">
<div class="ar-bar"><span class="ar-crumb"><b>INC-2317</b><i>/</i>04 · Latency</span><span>POST /checkout · gateway-measured</span></div>
<h1 class="ar-title" data-region="title">p99 broke the 400 ms SLO in every bucket from <em>${firstOver.t} to ${endOf(lastOver)}</em></h1>
<figure class="ar-fig" style="left:48px;top:150px;width:${W}px;height:${H}px" data-region="primary">${chart}</figure>
<div class="ar-side" data-region="support">
  <div class="ar-stat"><div class="k">Peak p99</div><div class="v">${peak.p99.toLocaleString('en-US')}<small>ms</small></div><div class="n">at ${peak.t} UTC, ${(peak.p99 / SLO).toFixed(1)}× the objective</div></div>
  <div class="ar-stat"><div class="k">Buckets over SLO</div><div class="v">${over.length}<small>× 5 min</small></div><div class="n">${firstOver.t}–${endOf(lastOver)} UTC${contiguous ? ', contiguous' : ', with gaps'}</div></div>
  <div class="ar-stat"><div class="k">Peak p50</div><div class="v">${p50peak}<small>ms</small></div><div class="n">the median request slowed too</div></div>
  <p class="ar-method">Percentiles are computed per 5-minute bucket from gateway access logs for every POST /checkout, including 504s counted at 2.0 s. Log scale.</p>
</div>
<footer class="ar-foot" data-region="source"><span>Illustrative data · synthetic series, replace with your metrics export</span><span class="ar-pg">04 / 06</span></footer>
</div>`
};
