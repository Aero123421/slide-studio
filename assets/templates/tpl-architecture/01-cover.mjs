// Template: Engineering design review / postmortem · Cover with impact summary. Synthetic example content; replace data and copy.
const ID = 'tpl-architecture-cover';
const inc = { id: 'INC-2317', sev: 'SEV-2', date: '12 Aug 2026', start: '14:05', end: '16:52', service: 'pricing-svc v4.18' };
const kpis = [
  { k: 'Customer impact', v: '2h 47m', n: `${inc.start}–${inc.end} UTC, checkout only` },
  { k: 'Peak p99 latency', v: '1,940', u: 'ms', n: 'SLO is <b>400 ms</b> at p99' },
  { k: 'Failed checkouts', v: '2.3', u: '%', n: 'peak 5-min share, timeouts' },
  { k: 'Error budget used', v: '38', u: '%', n: 'of the 30-day budget' }
];
// One representative slow trace (synthetic). start/end in ms from request start; depth = call nesting.
const trace = [
  { svc: 'edge', op: 'POST /checkout', s: 0, e: 1962, d: 0 },
  { svc: 'api-gateway', op: 'route', s: 3, e: 1959, d: 1 },
  { svc: 'checkout-svc', op: 'create', s: 8, e: 1952, d: 2 },
  { svc: 'inventory-svc', op: 'reserve', s: 12, e: 41, d: 3 },
  { svc: 'pricing-svc', op: 'quote', s: 44, e: 1921, d: 3 },
  { svc: 'price-cache', op: 'GET', s: 46, e: 48, d: 4, miss: true },
  { svc: 'catalog-db', op: 'SELECT rules', s: 51, e: 1897, d: 4, slow: true },
  { svc: 'orders-db', op: 'INSERT', s: 1924, e: 1946, d: 3 }
];
const W = 472, LW = 176, X0 = LW + 8, X1 = W - 40, RH = 32, TOP = 58, MAX = 2000;
const sx = ms => X0 + (ms / MAX) * (X1 - X0);
let rows = '';
trace.forEach((t, i) => {
  const y = TOP + i * RH, w = Math.max(2.5, sx(t.e) - sx(t.s));
  const col = t.slow ? '#fab219' : t.miss ? '#e66767' : '#3987e5';
  rows += `<rect x="0" y="${y}" width="${W}" height="${RH}" fill="${i % 2 ? 'rgba(255,255,255,.02)' : 'transparent'}"/>`;
  rows += `<text x="${10 + t.d * 10}" y="${y + 20}" class="t-mono">${t.svc}</text>`;
  rows += `<rect x="${sx(t.s)}" y="${y + 9}" width="${w}" height="14" rx="2" fill="${col}" fill-opacity="${t.slow || t.miss ? 1 : .75}"/>`;
  const dur = t.e - t.s;
  if (t.miss) rows += `<text x="${sx(t.e) + 8}" y="${y + 21}" class="t-crit">MISS</text><text x="${sx(t.e) + 52}" y="${y + 21}" class="t-mono-s">${dur} ms</text>`;
  else if (t.slow) rows += `<text x="${sx(t.e) - 8}" y="${y + 21}" text-anchor="end" class="t-dark">${dur.toLocaleString('en-US')} ms</text>`;
  else if (w < 60) rows += sx(t.e) > X1 - 60 ? `<text x="${sx(t.s) - 8}" y="${y + 21}" text-anchor="end" class="t-mono-s">${dur} ms</text>` : `<text x="${sx(t.e) + 8}" y="${y + 21}" class="t-mono-s">${dur} ms</text>`;
});
let axis = '';
const ay = TOP + trace.length * RH + 8;
for (let ms = 0; ms <= MAX; ms += 500) axis += `<line x1="${sx(ms)}" y1="${TOP}" x2="${sx(ms)}" y2="${ay}" stroke="#26364b" stroke-width="1" stroke-dasharray="${ms ? '2 4' : '0'}"/><text x="${sx(ms)}" y="${ay + 18}" text-anchor="middle" class="t-axis">${ms ? (ms / 1000).toFixed(1) + ' s' : '0'}</text>`;
const art = `<svg viewBox="0 0 ${W} 392" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">Waterfall of one slow checkout trace</title>
<desc id="${ID}-d">A synthetic trace of POST /checkout taking ${trace[0].e} ms. The price-cache GET misses after ${trace[5].e - trace[5].s} ms, and the fallback catalog-db query takes ${(trace[6].e - trace[6].s).toLocaleString('en-US')} ms, which accounts for almost all of the request time.</desc>
<rect x=".5" y=".5" width="${W - 1}" height="391" rx="8" fill="#0e1621" stroke="#26364b"/>
<text x="16" y="30" class="t-mono-b">trace 7f3a·e2c1</text><text x="${W - 16}" y="30" text-anchor="end" class="t-mono">POST /checkout · <tspan fill="#fab219" style="fill:#fab219">${trace[0].e.toLocaleString('en-US')} ms</tspan></text>
<line x1="0" y1="44" x2="${W}" y2="44" stroke="#26364b"/>
${axis}${rows}
<text x="16" y="${ay + 44}" class="t-mono-s">Representative slow request · 15:31 UTC · synthetic</text>
</svg>`;

export default {
  study: true,
  id: ID,
  title: 'Postmortem cover: checkout p99 regression',
  notes: 'Purpose: Open a postmortem or design review with what happened, when, and how much it cost users, before any cause is discussed.\nModify: Edit inc, kpis and the trace spans (start/end in ms). The waterfall scale, bar widths and duration labels are computed from the trace array.\nInvariant: Every KPI names its unit and window. The trace is labelled as one representative request, not a distribution. Keep the review blameless: name systems and changes, not people.\nStatic: Static page.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-architecture ar-cover',
  content: `<div class="ar-page">
<div class="ar-bar"><span class="ar-crumb"><b>${inc.id}</b><i>/</i>Postmortem &amp; design review</span><span>Checkout platform · ${inc.date}</span></div>
<div class="ar-cover-kicker"><span class="ar-chip">${inc.sev} · resolved, actions open</span><span class="ar-chip ar-ok">Blameless review</span></div>
<h1 class="ar-cover-title" data-region="title">Checkout p99 hit <span>1.9 s</span> after a cache-key change</h1>
<p class="ar-cover-sub" data-region="support">${inc.date}, ${inc.start}–${inc.end} UTC, triggered by ${inc.service}. What broke on the pricing read path, and four changes that keep a cache miss from reaching customers.</p>
<figure class="ar-fig ar-cover-art" data-region="primary">${art}</figure>
<div class="ar-kpis" data-region="primary">${kpis.map(x => `<div class="ar-kpi"><div class="k">${x.k}</div><div class="v">${x.v}${x.u ? `<small>${x.u}</small>` : ''}</div><div class="n">${x.n}</div></div>`).join('')}</div>
<footer class="ar-foot" data-region="source"><span>Illustrative data · fictional service names</span><span class="ar-pg">01 / 06</span></footer>
</div>`
};
