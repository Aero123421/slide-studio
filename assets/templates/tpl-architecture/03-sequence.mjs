// Template: Engineering design review / postmortem · Request sequence diagram. Synthetic example content; replace data and copy.
const ID = 'tpl-architecture-sequence';
const C = { panel: '#111b28', stroke: '#2f4259', text: '#e8eef6', text2: '#b4c1d1', mute: '#8a9bb0', sync: '#3987e5', warn: '#fab219', life: '#2a3a50' };
const lanes = ['client', 'api-gateway', 'checkout-svc', 'pricing-svc', 'price-cache', 'catalog replica', 'orders-db'];
const X = lanes.map((_, i) => 84 + i * 168);
const L = Object.fromEntries(lanes.map((n, i) => [n, X[i]]));
// Messages in time order. type: call | return. hot = only happens on a cache miss. note = right-side duration tag.
const msgs = [
  { from: 'client', to: 'api-gateway', text: 'POST /checkout', type: 'call' },
  { from: 'api-gateway', to: 'checkout-svc', text: 'createOrder(cart)', type: 'call' },
  { from: 'checkout-svc', to: 'pricing-svc', text: 'quote(cart)', type: 'call' },
  { from: 'pricing-svc', to: 'price-cache', text: 'GET price:{sku}:{cart_id}', type: 'call', key: true },
  { frame: 'hit', guard: '[hit]  97% of lookups before v4.18 · 41% during' },
  { from: 'price-cache', to: 'pricing-svc', text: 'rules · ~2 ms', type: 'return' },
  { frame: 'miss', guard: '[miss]  59% of lookups during the incident' },
  { from: 'price-cache', to: 'pricing-svc', text: 'nil', type: 'return', hot: true },
  { from: 'pricing-svc', to: 'catalog replica', text: 'SELECT rules …  0.2–1.8 s', type: 'call', hot: true, slow: true },
  { from: 'catalog replica', to: 'pricing-svc', text: 'rows', type: 'return', hot: true },
  { from: 'pricing-svc', to: 'price-cache', text: 'SET key · TTL 10 min', type: 'call', hot: true },
  { frame: 'end' },
  { from: 'pricing-svc', to: 'checkout-svc', text: 'quote', type: 'return' },
  { from: 'checkout-svc', to: 'orders-db', text: 'INSERT order', type: 'call' },
  { from: 'orders-db', to: 'checkout-svc', text: 'ok', type: 'return' },
  { from: 'checkout-svc', to: 'api-gateway', text: '201 Created', type: 'return' },
  { from: 'api-gateway', to: 'client', text: '201 · or 504 after 2.0 s', type: 'return', timeout: true }
];
const TOP = 64, STEP = 24;
let y = TOP, out = '', frameTop = 0, frameSep = 0;
const activ = {}; // lane -> [y0, y1] pairs for activation bars
const act = (lane, y0, y1) => (activ[lane] = activ[lane] || []).push([y0, y1]);
const fx0 = L['pricing-svc'] - 70, fx1 = L['catalog replica'] + 76;
for (const m of msgs) {
  if (m.frame === 'hit') { frameTop = y - 10; out += `<text x="${fx0 + 50}" y="${y + 7}" class="t-mono-s">${m.guard}</text>`; y += 38; continue; }
  if (m.frame === 'miss') { frameSep = y - 8; out += `<line x1="${fx0}" y1="${frameSep}" x2="${fx1}" y2="${frameSep}" stroke="${C.mute}" stroke-dasharray="5 4"/><text x="${fx0 + 12}" y="${y + 10}" class="t-warn">${m.guard}</text>`; y += 42; continue; }
  if (m.frame === 'end') {
    out = `<rect x="${fx0}" y="${frameTop}" width="${fx1 - fx0}" height="${y - frameTop - 6}" rx="4" fill="rgba(250,178,25,.04)" stroke="${C.mute}" stroke-width="1"/>`
      + `<path d="M${fx0},${frameTop} h38 v14 l-8,8 h-30 z" fill="${C.stroke}"/><text x="${fx0 + 8}" y="${frameTop + 16}" class="t-mono-b">alt</text>` + out;
    y += 12; continue;
  }
  const x1 = L[m.from], x2 = L[m.to], dir = Math.sign(x2 - x1), pad = 6;
  const col = m.hot ? C.warn : m.type === 'call' ? C.sync : C.mute;
  const sx = x1 + dir * pad, ex = x2 - dir * (pad + 1);
  out += `<line x1="${sx}" y1="${y}" x2="${ex}" y2="${y}" stroke="${col}" stroke-width="${m.slow ? 2.4 : 1.6}"${m.type === 'return' ? ' stroke-dasharray="5 4"' : ''} marker-end="url(#${ID}-${m.type === 'call' ? 'c' : 'r'}${m.hot ? 'h' : ''})"/>`;
  const lx = (x1 + x2) / 2;
  let label = m.text;
  if (m.key) label = label.replace('{cart_id}', `<tspan style="fill:${C.warn}">{cart_id}</tspan>`);
  out += `<text x="${lx}" y="${y - 7}" text-anchor="middle" class="${m.slow ? 't-warn' : m.timeout ? 't-mono' : 't-mono'}">${label}</text>`;
  if (m.type === 'call') act(m.to, y, null);
  if (m.type === 'return') { const a = (activ[m.from] || []).find(p => p[1] === null); if (a) a[1] = y; }
  m.y = y; y += STEP;
}
// close any open activations on the callee lanes (e.g. the SET call has no explicit return)
for (const k in activ) activ[k].forEach(p => { if (p[1] === null) p[1] = p[0] + 12; });
const H = y + 6;
const heads = lanes.map((n, i) => {
  const hot = ['pricing-svc', 'price-cache', 'catalog replica'].includes(n);
  return `<rect x="${X[i] - 74}" y="0" width="148" height="38" rx="6" fill="${C.panel}" stroke="${hot ? C.warn : C.stroke}" stroke-width="${hot ? 1.6 : 1.2}"/><text x="${X[i]}" y="24" text-anchor="middle" class="t-node">${n}</text>`
    + `<line x1="${X[i]}" y1="38" x2="${X[i]}" y2="${H}" stroke="${C.life}" stroke-width="1.4" stroke-dasharray="2 4"/>`;
}).join('');
const bars = Object.entries(activ).map(([lane, ps]) => ps.map(([a, b]) => `<rect x="${L[lane] - 5}" y="${a - 3}" width="10" height="${Math.max(10, b - a + 6)}" rx="2" fill="#1d2d42" stroke="${C.stroke}"/>`).join('')).join('');
// annotation for the cache-key change, anchored to the GET message row
const keyMsg = msgs.find(m => m.key);
const note = `<g><path d="M${L['orders-db'] - 78},${keyMsg.y - 34} h148 l8,8 v58 h-156 z" fill="#1a2433" stroke="${C.warn}" stroke-width="1.2"/>
<text x="${L['orders-db'] - 68}" y="${keyMsg.y - 13}" class="t-lab2">v4.18 added cart_id to</text><text x="${L['orders-db'] - 68}" y="${keyMsg.y + 5}" class="t-lab2">the key, so each cart</text><text x="${L['orders-db'] - 68}" y="${keyMsg.y + 23}" class="t-lab2">became a new entry.</text></g>`;
const mk = (id, c, open) => `<marker id="${ID}-${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">${open ? `<path d="M1,1 L9,5 L1,9" fill="none" stroke="${c}" stroke-width="1.6"/>` : `<path d="M0,1 L9,5 L0,9 z" fill="${c}"/>`}</marker>`;
const fig = `<svg viewBox="0 0 1184 ${H + 4}" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">Checkout request sequence with the cache hit and miss alternatives</title>
<desc id="${ID}-d">The client calls api-gateway, which calls checkout-svc, which asks pricing-svc for a quote. pricing-svc looks up price-cache with a key that includes cart_id. In the hit branch the cache returns rules in about 2 ms. In the miss branch, 59% of lookups during the incident, pricing-svc queries the catalog-db read replica for 0.2 to 1.8 seconds and writes the result back to the cache. checkout-svc then inserts the order into orders-db and returns 201, or the gateway returns 504 after its 2.0 second timeout.</desc>
<defs>${mk('c', C.sync)}${mk('ch', C.warn)}${mk('r', C.mute, true)}${mk('rh', C.warn, true)}</defs>
${heads}${bars}${out}${note}
</svg>`;

export default {
  study: true,
  id: ID,
  title: 'Request sequence: cache hit versus miss',
  notes: 'Purpose: Show the order of calls for one request and exactly where the failing branch adds time, so the fix can be placed on the right hop.\nModify: Edit lanes and msgs (from, to, text, type). Frames are declared inline with {frame:"hit"|"miss"|"end"}; y positions and activation bars are computed from message order.\nInvariant: Solid arrows are calls in call direction, dashed arrows are returns. An alt frame holds mutually exclusive branches; give each branch its guard and frequency. The vertical axis is order, not time; durations are written on the messages.\nStatic: Static page.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-architecture ar-sequence',
  content: `<div class="ar-page">
<div class="ar-bar"><span class="ar-crumb"><b>INC-2317</b><i>/</i>03 · Request sequence</span><span>POST /checkout · during incident</span></div>
<h1 class="ar-title" data-region="title">A miss adds up to <em>1.8 s</em> of replica time inside a 2.0 s gateway timeout</h1>
<figure class="ar-fig" style="left:48px;top:128px;width:1184px;height:482px" data-region="primary">${fig}</figure>
<div class="ar-legend" style="left:48px;top:626px" data-region="support"><span><svg width="46" height="14" viewBox="0 0 46 14" aria-hidden="true"><line x1="2" y1="7" x2="38" y2="7" stroke="${C.sync}" stroke-width="2"/><path d="M36,2 L44,7 L36,12 z" fill="${C.sync}"/></svg>Call</span><span><svg width="46" height="14" viewBox="0 0 46 14" aria-hidden="true"><line x1="2" y1="7" x2="40" y2="7" stroke="${C.mute}" stroke-width="2" stroke-dasharray="5 4"/><path d="M37,2 L44,7 L37,12" fill="none" stroke="${C.mute}" stroke-width="1.6"/></svg>Return</span><span><svg width="46" height="14" viewBox="0 0 46 14" aria-hidden="true"><line x1="2" y1="7" x2="38" y2="7" stroke="${C.warn}" stroke-width="2"/><path d="M36,2 L44,7 L36,12 z" fill="${C.warn}"/></svg>Only on a cache miss</span><span>Vertical order is sequence, not to time scale</span></div>
<footer class="ar-foot" data-region="source"><span>Illustrative data · durations are typical values in the incident window</span><span class="ar-pg">03 / 06</span></footer>
</div>`
};
