// Template: Incident review · Time-scaled request sequence. Synthetic example content; replace data and copy.
import { linear } from '../../runtime/figure.mjs';

const ID = 'tpl-architecture-sequence';
const trace = { id: '4f1c9a2e', at: '18:14:07 UTC', timeout: 2000, paymentNeeds: 270, hitTotal: 210 }; // ms
// Participants top to bottom, in call order. plain = a person, not a service identifier.
const lanes = [
  { id: 'shopper', name: 'Shopper', plain: true },
  { id: 'gateway', name: 'api-gateway' },
  { id: 'checkout', name: 'checkout-svc' },
  { id: 'pricing', name: 'pricing-svc' },
  { id: 'cache', name: 'price-cache', degraded: true },
  { id: 'replica', name: 'catalog-replica-2', degraded: true },
];
// Spans from the trace, ms after the shopper sent the request. The gateway cancels everything at the timeout.
const spans = [
  { lane: 'gateway', start: 0, end: 2000 },
  { lane: 'checkout', start: 3, end: 1828 }, // then the payment step starts and is cancelled at the timeout
  { lane: 'pricing', start: 21, end: 1828 },
  { lane: 'cache', start: 24, end: 26 },
  { lane: 'replica', start: 27, end: 1821, label: 'SELECT price rules' },
];
// Messages at their real times. ret = a response travelling back up the call chain.
const messages = [
  { from: 'shopper', to: 'gateway', t: 0 },
  { from: 'gateway', to: 'checkout', t: 3 },
  { from: 'checkout', to: 'pricing', t: 21 },
  { from: 'pricing', to: 'cache', t: 24 },
  { from: 'pricing', to: 'replica', t: 27 },
  { from: 'replica', to: 'pricing', t: 1821, ret: true },
  { from: 'pricing', to: 'checkout', t: 1828, ret: true },
  { from: 'gateway', to: 'shopper', t: 2000, ret: true, label: '504 Gateway Timeout' },
];

// ---- derived numbers (headline, notes and labels use these)
const span = id => spans.find(s => s.lane === id);
const replicaMs = span('replica').end - span('replica').start;
const quoteAt = span('pricing').end;
const leftMs = trace.timeout - quoteAt;
const NB = '\u00a0'; // never break a number from its unit
const sec = ms => `${(ms / 1000).toFixed(2).replace(/0$/, '')}${NB}s`;
const ms = v => `${v.toLocaleString('en-US')}${NB}ms`;

// ---- geometry
const W = 1152, LABEL_W = 214, TOP = 64, ROW = 60, BAR = 16;
const X = linear([0, 2250], [LABEL_W, W - 8]);
const rowY = Object.fromEntries(lanes.map((l, i) => [l.id, TOP + i * ROW]));
const bottom = TOP + (lanes.length - 1) * ROW + 30, AXIS = bottom + 10, H = AXIS + 34;
const RED = 'var(--ar-red)', INK = 'var(--ar-ink)', GREY = 'var(--ar-line)';
const grid = [0, 500, 1000, 1500, 2000].map(t => `<line x1="${X(t)}" y1="${TOP - 26}" x2="${X(t)}" y2="${bottom}" stroke="var(--ar-grid)"/>`
  + `<text x="${X(t)}" y="${AXIS + 22}" text-anchor="middle" class="t-axis t-num">${t ? `${(t / 1000).toFixed(1)} s` : '0'}</text>`).join('')
  + [250, 750, 1250, 1750].map(t => `<line x1="${X(t)}" y1="${AXIS}" x2="${X(t)}" y2="${AXIS + 5}" stroke="var(--ar-rule)"/>`).join('')
  + `<line x1="${LABEL_W}" y1="${AXIS}" x2="${W - 8}" y2="${AXIS}" stroke="var(--ar-rule)"/>`;
const names = lanes.map(l => `<text x="0" y="${rowY[l.id] + 6}" class="${l.plain ? 't-strong' : 't-name'}"${l.plain ? ' style="font-size:17px"' : ''}>${l.name}</text>`
  + (l.id === 'shopper' ? `<line x1="${X(0)}" y1="${rowY.shopper}" x2="${X(trace.timeout)}" y2="${rowY.shopper}" stroke="var(--ar-rule)" stroke-width="1.5"/>` : '')).join('');
const bars = spans.map(s => {
  const deg = lanes.find(l => l.id === s.lane).degraded, x0 = X(s.start), w = Math.max(3, X(s.end) - x0), y = rowY[s.lane] - BAR / 2;
  return `<rect x="${x0}" y="${y}" width="${w}" height="${BAR}" fill="${deg ? RED : 'var(--ar-seq-bar,#d9dce0)'}"/>`;
}).join('');
// The payment step checkout started with the quote: an outline as long as it needs, cut by the timeout line.
const need = `<rect x="${X(quoteAt) + 0.75}" y="${rowY.checkout - BAR / 2 + 0.75}" width="${X(quoteAt + trace.paymentNeeds) - X(quoteAt) - 1.5}" height="${BAR - 1.5}" fill="var(--ar-paper)" stroke="${INK}" stroke-width="1.5"/>`;
const arrows = messages.map(m => {
  const y0 = rowY[m.from], y1 = rowY[m.to], dir = Math.sign(y1 - y0), x = X(m.t);
  const end = y1 - dir * (m.to === 'shopper' ? 4 : BAR / 2 + 1);
  return `<line x1="${x}" y1="${y0 + dir * (m.from === 'shopper' ? 0 : BAR / 2)}" x2="${x}" y2="${end}" stroke="${m.ret ? GREY : INK}" stroke-width="1.4" marker-end="url(#${ID}-${m.ret ? 'open' : 'fill'})"/>`;
}).join('');
const tx = X(trace.timeout);
const notes = `<line x1="${tx}" y1="${TOP - 34}" x2="${tx}" y2="${bottom}" stroke="${INK}" stroke-width="2"/>
<text x="${tx + 10}" y="${TOP - 22}" class="t-strong t-num">Timeout ${sec(trace.timeout)}</text>
<text x="${X(0) + 12}" y="${rowY.shopper - 10}" class="t-note"><tspan class="t-name" style="font-size:16px">POST /checkout</tspan></text>
<text x="${tx - 10}" y="${rowY.shopper - 10}" text-anchor="end" class="t-note">${messages.at(-1).label}</text>
<text x="${X(26) + 10}" y="${rowY.cache + 6}" class="t-note t-red">miss after ${ms(span('cache').end - span('cache').start)}</text>
<text x="${(X(span('replica').start) + X(span('replica').end)) / 2}" y="${rowY.replica - 18}" text-anchor="middle" class="t-strong t-red t-num">${span('replica').label}, ${sec(replicaMs)}</text>
<text x="${tx - 10}" y="${rowY.checkout - 16}" text-anchor="end" class="t-note t-num">Payment step needs about ${ms(trace.paymentNeeds)}; <tspan class="t-strong">${ms(leftMs)} were left</tspan></text>`;
const marks = `<marker id="${ID}-fill" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0.8L10 5L0 9.2Z" fill="${INK}"/></marker>`
  + `<marker id="${ID}-open" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M1 1L9 5L1 9" fill="none" stroke="${GREY}" stroke-width="1.6"/></marker>`;
const fig = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">One failed checkout request on a true time axis, 0 to 2.25 seconds</title>
<desc id="${ID}-d">Trace ${trace.id} at ${trace.at}. The shopper's POST /checkout reaches api-gateway, checkout-svc and pricing-svc within ${ms(span('pricing').start)}. price-cache answers with a miss after ${ms(span('cache').end - span('cache').start)}, so pricing-svc queries catalog-replica-2, which takes ${ms(replicaMs)}. The quote reaches checkout-svc at ${ms(quoteAt)}, leaving ${ms(leftMs)} before the ${sec(trace.timeout)} gateway timeout; the payment step needs about ${ms(trace.paymentNeeds)}, so the gateway returns 504 at ${sec(trace.timeout)}.</desc>
<defs>${marks}</defs>
${grid}${names}${bars}${need}${arrows}${notes}
</svg>`;

export default {
  study: true,
  id: ID,
  title: 'Time-scaled sequence of one failed checkout',
  notes: 'Purpose: Show, on a true time axis, how much of the gateway\'s budget the fallback query consumed, so the fix is placed on the hop that spends the time.\nModify: Replace trace, lanes, spans and messages with one representative trace (times in ms from the first request). Bar lengths, arrows, the remaining-time bracket and the headline numbers are computed; keep the axis domain a little past the timeout.\nInvariant: Time runs left to right on one linear scale and is never broken; the timeout line spans every lane; red marks only the degraded components; say it is one request, and state how a healthy request compares.\nStatic: Static page; no builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-architecture ar-sequence',
  content: `<p class="ar-run"><span>Incident review — checkout timeouts, 6 Oct 2026</span><span>3</span></p>
<h1 class="ar-head" data-region="title">A single replica query took ${sec(replicaMs)} of the gateway’s ${sec(trace.timeout)} budget</h1>
<figure class="ar-fig" style="left:64px;top:178px" data-region="primary">${fig}</figure>
<p class="ar-src" data-region="source"><span>Illustrative data. Trace ${trace.id}, ${trace.at}, one of the failed checkouts. With a cache hit the same request finishes in ${ms(trace.hitTotal)}.</span></p>`,
};
