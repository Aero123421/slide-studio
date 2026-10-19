// Template: Incident review · Latency percentiles through the incident. Synthetic example content; replace data and copy.
import { lineChart, rng } from '../../runtime/figure.mjs';

const ID = 'tpl-architecture-latency';
const SLO = 1.0, TIMEOUT = 2.0; // s, p99 objective and gateway timeout
const events = [ // UTC; hairlines with a label above the plot. level 0 = top line, 1 = just above the plot
  { t: '18:00', label: 'Sale starts, cache invalidated', level: 0 },
  { t: '18:24', label: 'Reporting jobs paused', level: 1 },
  { t: '18:38', label: 'Cache warmed', level: 0 },
];
// 1-minute percentiles of POST /checkout at the gateway, 17:40–19:00 UTC, in seconds.
// Synthetic: replace `data` with your export [{t:'HH:MM', p50, p95, p99}, …]; everything below is derived from it.
const mins = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const r = rng(2611), jit = (v, k = 0.05) => v * (1 + (r() - 0.5) * 2 * k);
const shape = m => { // [p50, p95, p99] for minute m, a smooth model of the incident
  const t = m - mins('18:00');
  if (t < 0) return [0.19, 0.42, 0.64];
  if (t < 2) return [[0.24, 0.55, 0.78], [0.38, 0.74, 0.97]][t];
  if (t < 24) return [0.93, 1.78, TIMEOUT];
  if (t < 38) return [0.46, 1.12, 1.6];
  if (t < 44) { const f = (t - 38) / 6; return [0.36 - f * 0.12, 0.95 - f * 0.36, 1.42 - f * 0.4]; }
  const f = Math.exp(-(t - 44) / 5); return [0.19 + f * 0.06, 0.42 + f * 0.16, 0.64 + f * 0.3];
};
const data = Array.from({ length: 81 }, (_, i) => {
  const m = mins('17:40') + i, [a, b, c] = shape(m);
  return { t: hhmm(m), p50: +jit(a).toFixed(3), p95: +jit(b).toFixed(3), p99: c >= TIMEOUT ? TIMEOUT : +Math.min(jit(c, 0.04), TIMEOUT).toFixed(3) };
});

// ---- derived facts
const over = data.filter(d => d.p99 > SLO);
const capped = data.filter(d => d.p99 >= TIMEOUT);
const first = over[0].t, last = over.at(-1).t, end = hhmm(mins(last) + 1); // buckets are labelled by their start
const minutesOver = over.length, minutesCapped = capped.length;
const NB = '\u00a0'; // never break a number from its unit
const s2 = v => `${v.toFixed(1)}${NB}s`;

const xs = data.map(d => mins(d.t));
const fig = lineChart({
  id: `${ID}-fig`, width: 1152, height: 412,
  title: `Checkout latency percentiles, ${data[0].t}–${data.at(-1).t} UTC, 1-minute buckets`,
  desc: `p99 rose above the ${s2(SLO)} SLO at ${first} and stayed above it until ${end} (${minutesOver} minutes); for ${minutesCapped} of those minutes it sat at the ${s2(TIMEOUT)} gateway timeout. p95 peaked near ${s2(Math.max(...data.map(d => d.p95)))} and p50 near ${s2(Math.max(...data.map(d => d.p50)))}. Pausing the reporting jobs at 18:24 brought p99 down to about 1.6 s; warming the cache at 18:38 ended the impact.`,
  xType: 'linear', x: xs, xTicks: 5, xFormat: v => hhmm(v),
  yDomain: [0, 2.5], yTicks: 5, format: { digits: 2, suffix: `${NB}s` }, tickFormat: v => (v ? s2(v) : '0'),
  series: [
    { name: 'p50', values: data.map(d => d.p50), color: '#a9aeb6' },
    { name: 'p95', values: data.map(d => d.p95), color: '#6f757e' },
    { name: 'p99', values: data.map(d => d.p99), color: 'var(--ar-ink)' },
  ],
  highlight: 'p99', strokeWidth: 2.6, markers: 'none',
  bands: [{ from: mins(first), to: mins(end) }],
  refLines: [{ y: SLO, label: `SLO: p99 under ${s2(SLO)}`, labelPos: 'end' }, { y: TIMEOUT, label: `Gateway timeout ${s2(TIMEOUT)}`, labelPos: 'end' }],
  extra: ({ x, y, box }) => events.map(e => {
    const ex = x(mins(e.t)), ty = box.y - 34 + e.level * 22;
    return `<line x1="${ex}" y1="${ty - 14}" x2="${ex}" y2="${box.y + box.h}" stroke="var(--ar-ink)" stroke-width="1" opacity=".5"/>`
      + `<text x="${ex + 7}" y="${ty}" class="t-note"><tspan class="t-strong t-num">${e.t}</tspan> ${e.label}</text>`;
  }).join('') + `<text x="${x(mins(first)) + 8}" y="${y(0.08)}" class="t-strong t-red">Customer impact, ${minutesOver}${NB}min</text>`,
});

export default {
  study: true,
  id: ID,
  title: 'Latency percentiles through the incident',
  notes: 'Purpose: Show how far and how long checkout latency left its objective, with the three changes that shaped the curve.\nModify: Replace `data` with your 1-minute percentiles (t, p50, p95, p99) and edit SLO, TIMEOUT and events. The impact window, minute counts, headline and description are computed from the data.\nInvariant: Percentiles are computed per bucket from raw requests, never averaged across buckets; requests cut off by the timeout count at the timeout, which caps p99 — say so. Linear time and latency axes from zero. Red only for the customer-impact window.\nStatic: Static page; no builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-architecture ar-latency',
  content: `<p class="ar-run"><span>Incident review — checkout timeouts, 6 Oct 2026</span><span>4</span></p>
<h1 class="ar-head" data-region="title">p99 sat on the ${s2(TIMEOUT)} timeout for ${minutesCapped} minutes and stayed above the ${s2(SLO)} objective for ${minutesOver}</h1>
<figure class="ar-fig" style="left:64px;top:228px;--ss-surface:var(--ar-red-tint)" data-region="primary">${fig}</figure>
<p class="ar-src" data-region="source"><span>1-minute percentiles of <span class="ar-id">POST /checkout</span> at the gateway, UTC. Requests cut off at the timeout count as ${s2(TIMEOUT)}, which is why p99 flattens there.</span></p>`,
};
