// Template: Engineering design review / postmortem · Layered system architecture. Synthetic example content; replace data and copy.
const ID = 'tpl-architecture-system';
const C = { panel: '#111b28', stroke: '#2f4259', text: '#e8eef6', mute: '#8a9bb0', sync: '#3987e5', async: '#d55181', repl: '#7f8ea3', warn: '#fab219', band: 'rgba(134,182,239,.035)', bandLine: '#223247' };
// Zones (y bands) and the third-party column
const VPC_X1 = 1016, EXT_X0 = 1036, W = 1184;
const zones = [
  { key: 'client', label: 'CLIENTS · INTERNET', y: 0, h: 60, x1: VPC_X1 },
  { key: 'edge', label: 'EDGE · DMZ', y: 70, h: 82, x1: VPC_X1 },
  { key: 'svc', label: 'SERVICES · PRIVATE', y: 162, h: 100, x1: VPC_X1 },
  { key: 'async', label: 'ASYNC & BATCH', y: 272, h: 84, x1: VPC_X1 },
  { key: 'data', label: 'DATA · RESTRICTED', y: 366, h: 104, x1: VPC_X1 }
];
// Nodes: x0..x1 and zone; role is the second line. kind drives the shape.
const N = {
  clients: { z: 'client', x0: 20, x1: 250, name: 'web · iOS · Android', kind: 'client' },
  edge: { z: 'edge', x0: 20, x1: 190, name: 'edge-proxy', role: 'CDN · WAF · TLS' },
  gw: { z: 'edge', x0: 250, x1: 420, name: 'api-gateway', role: 'authn · rate limits' },
  identity: { z: 'svc', x0: 20, x1: 190, name: 'identity-svc', role: 'token checks' },
  checkout: { z: 'svc', x0: 250, x1: 420, name: 'checkout-svc', role: 'orchestrates order' },
  inventory: { z: 'svc', x0: 470, x1: 610, name: 'inventory-svc', role: 'stock holds' },
  pricing: { z: 'svc', x0: 660, x1: 810, name: 'pricing-svc', role: 'quotes · v4.18', hot: true },
  payment: { z: 'svc', x0: 860, x1: 1000, name: 'payment-adapter', role: 'authorize · refund' },
  provider: { z: 'svc', x0: EXT_X0 + 14, x1: W - 14, name: 'payment provider', role: 'external API', kind: 'ext' },
  log: { z: 'async', x0: 250, x1: 420, name: 'event-log', role: 'order.created', kind: 'log' },
  fulfil: { z: 'async', x0: 450, x1: 610, name: 'fulfilment-worker', role: 'consumes events' },
  reporting: { z: 'async', x0: 860, x1: 1000, name: 'reporting-jobs', role: 'hourly batch' },
  orders: { z: 'data', x0: 250, x1: 420, name: 'orders-db', role: 'primary', kind: 'db' },
  catalog: { z: 'data', x0: 450, x1: 610, name: 'catalog-db', role: 'primary', kind: 'db' },
  cache: { z: 'data', x0: 660, x1: 810, name: 'price-cache', role: 'in-memory · TTL 10 min', kind: 'cache', hot: true },
  replica: { z: 'data', x0: 860, x1: 1000, name: 'catalog-db', role: 'read replica · shared', kind: 'db', hot: true }
};
const Z = Object.fromEntries(zones.map(z => [z.key, z]));
for (const n of Object.values(N)) {
  const z = Z[n.z];
  n.h = n.kind === 'client' ? 32 : n.kind === 'db' || n.kind === 'cache' ? 52 : 46;
  n.y0 = n.kind === 'client' ? 22 : z.y + (n.z === 'svc' ? 38 : n.z === 'data' ? 34 : 26);
  n.y1 = n.y0 + n.h; n.cx = (n.x0 + n.x1) / 2; n.cy = (n.y0 + n.y1) / 2;
}
const svcBus = N.checkout.y0 - 12; // horizontal call bus above the service row
// Edges: kind = sync | async | repl ; hot = part of the incident path. Paths are orthogonal and use node ports.
const E = [
  { kind: 'sync', d: `M${N.edge.cx},${N.clients.y1} V${N.edge.y0}` },
  { kind: 'sync', d: `M${N.edge.x1},${N.edge.cy} H${N.gw.x0}`, hot: true },
  { kind: 'sync', d: `M${N.gw.x0 + 20},${N.gw.y1} V${N.gw.y1 + 24} H${N.identity.cx} V${N.identity.y0}` },
  { kind: 'sync', d: `M${N.checkout.cx},${N.gw.y1} V${N.checkout.y0}`, hot: true },
  { kind: 'sync', d: `M${N.checkout.x1 - 24},${N.checkout.y0} V${svcBus} H${N.inventory.cx} V${N.inventory.y0}` },
  { kind: 'sync', d: `M${N.inventory.cx},${svcBus} H${N.pricing.cx} V${N.pricing.y0}`, hot: true, noStart: true },
  { kind: 'sync', d: `M${N.pricing.cx},${svcBus} H${N.payment.cx} V${N.payment.y0}`, noStart: true },
  { kind: 'sync', d: `M${N.payment.x1},${N.payment.cy} H${N.provider.x0}` },
  { kind: 'sync', d: `M${N.checkout.x0},${N.checkout.y1 - 12} H${N.checkout.x0 - 18} V${N.orders.cy} H${N.orders.x0}` },
  { kind: 'async', d: `M${N.checkout.cx},${N.checkout.y1} V${N.log.y0}` },
  { kind: 'async', d: `M${N.log.x1},${N.log.cy} H${N.fulfil.x0}` },
  { kind: 'sync', d: `M${N.pricing.x0 + 20},${N.pricing.y1} V${N.cache.y0}` },
  { kind: 'sync', d: `M${N.pricing.x1 - 20},${N.pricing.y1} V${N.replica.y0 - 24} H${N.replica.x0 + 30} V${N.replica.y0}`, hot: true },
  { kind: 'sync', d: `M${N.reporting.cx + 20},${N.reporting.y1} V${N.replica.y0}` },
  { kind: 'repl', d: `M${N.catalog.cx},${N.catalog.y1} V${N.catalog.y1 + 10} H${N.replica.cx} V${N.replica.y1 + 2}` }
];
const dash = { sync: '', async: '7 5', repl: '2 4' };
const col = { sync: C.sync, async: C.async, repl: C.repl };
const glow = E.filter(e => e.hot).map(e => `<path d="${e.d}" fill="none" stroke="${C.warn}" stroke-opacity=".28" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>`).join('');
const edges = E.map(e => `<path d="${e.d}" fill="none" stroke="${col[e.kind]}" stroke-width="1.8"${dash[e.kind] ? ` stroke-dasharray="${dash[e.kind]}"` : ''} stroke-linejoin="round" marker-end="url(#${ID}-a-${e.kind})"/>`).join('')
  + `<circle cx="${N.checkout.x1 - 24}" cy="${svcBus}" r="3" fill="${C.sync}"/>`;

function node(n) {
  const stroke = n.hot ? C.warn : C.stroke;
  let shape;
  if (n.kind === 'db' || n.kind === 'cache') {
    const ry = 6;
    shape = `<path d="M${n.x0},${n.y0 + ry} V${n.y1 - ry} A${(n.x1 - n.x0) / 2},${ry} 0 0 0 ${n.x1},${n.y1 - ry} V${n.y0 + ry}" fill="${C.panel}" stroke="${stroke}" stroke-width="1.4"/><ellipse cx="${n.cx}" cy="${n.y0 + ry}" rx="${(n.x1 - n.x0) / 2}" ry="${ry}" fill="#172536" stroke="${stroke}" stroke-width="1.4"/>`;
    if (n.kind === 'cache') shape += `<path d="M${n.x1 - 20},${n.y0 + 16} l-6,10 h6 l-4,9 l10,-12 h-6 l4,-7 z" fill="${C.warn}"/>`;
  } else if (n.kind === 'ext') shape = `<rect x="${n.x0}" y="${n.y0}" width="${n.x1 - n.x0}" height="${n.h}" rx="6" fill="none" stroke="${C.mute}" stroke-width="1.2" stroke-dasharray="4 3"/>`;
  else if (n.kind === 'client') shape = `<rect x="${n.x0}" y="${n.y0}" width="${n.x1 - n.x0}" height="${n.h}" rx="16" fill="${C.panel}" stroke="${C.stroke}" stroke-width="1.2"/>`;
  else shape = `<rect x="${n.x0}" y="${n.y0}" width="${n.x1 - n.x0}" height="${n.h}" rx="6" fill="${C.panel}" stroke="${stroke}" stroke-width="${n.hot ? 1.6 : 1.2}"/>`;
  if (n.kind === 'log') shape += [0, 1, 2].map(k => `<rect x="${n.x1 - 30 + k * 7}" y="${n.y0 + 12}" width="4" height="22" rx="1" fill="${C.async}" fill-opacity="${.45 + k * .25}"/>`).join('');
  const ty = n.kind === 'client' ? n.cy + 5 : n.kind === 'db' || n.kind === 'cache' ? n.y0 + 30 : n.y0 + 20;
  const pad = n.kind === 'client' ? 16 : 12;
  return `<g>${shape}<text x="${n.x0 + pad}" y="${ty}" class="t-node">${n.name}</text>${n.role ? `<text x="${n.x0 + pad}" y="${ty + 17}" class="t-role">${n.role}</text>` : ''}</g>`;
}
const bands = zones.map(z => `<rect x="0" y="${z.y}" width="${z.x1}" height="${z.h}" rx="8" fill="${z.key === 'client' ? 'none' : C.band}" stroke="${C.bandLine}" stroke-width="1"${z.key === 'client' ? ' stroke-dasharray="3 4"' : ''}/>`
  + (z.key === 'client' ? `<text x="${N.clients.x1 + 18}" y="${N.clients.cy + 5}" class="t-zone">${z.label}</text>` : `<text x="12" y="${z.y + 17}" class="t-zone">${z.label}</text>`)).join('')
  + `<rect x="${EXT_X0}" y="${Z.svc.y}" width="${W - EXT_X0}" height="${Z.svc.h}" rx="8" fill="none" stroke="${C.bandLine}" stroke-dasharray="3 4"/><text x="${EXT_X0 + 12}" y="${Z.svc.y + 17}" class="t-zone">THIRD PARTY</text>`
  + `<text x="${(VPC_X1 + EXT_X0) / 2}" y="${N.payment.cy - 8}" text-anchor="middle" class="t-mono-s">egress</text>`;
// incident annotations, placed on the free side of each hot element
const nx = EXT_X0 + 4, ny = N.replica.y0 - 44;
const notes = `<g>
<text x="${N.pricing.x0 + 30}" y="${Z.async.y + 34}" class="t-warn">hit ratio</text>
<text x="${N.pricing.x0 + 30}" y="${Z.async.y + 52}" class="t-warn">97% → 41%</text>
<text x="${nx}" y="${ny}" class="t-warn">miss → up to 1.8 s</text>
<text x="${nx}" y="${ny + 22}" class="t-lab2">The replica also serves</text>
<text x="${nx}" y="${ny + 40}" class="t-lab2">reporting-jobs, and</text>
<text x="${nx}" y="${ny + 58}" class="t-lab2">misses are not coalesced.</text>
<path d="M${nx - 4},${N.replica.cy + 4} H${N.replica.x1 + 8}" stroke="${C.warn}" stroke-width="1.2" marker-end="url(#${ID}-a-warn)"/>
</g>`;
const marker = (k, c) => `<marker id="${ID}-a-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="${c}"/></marker>`;
const fig = `<svg viewBox="0 0 ${W} 470" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">Layered architecture of the checkout platform with the incident path</title>
<desc id="${ID}-d">Five zones from clients to data. Requests pass edge-proxy and api-gateway to checkout-svc, which calls inventory-svc, pricing-svc and payment-adapter synchronously, writes orders-db and publishes order events to event-log for fulfilment-worker. pricing-svc reads price-cache and, on a miss, a catalog-db read replica that reporting-jobs also use. The incident path through api-gateway, checkout-svc, pricing-svc and the replica is highlighted: cache hit ratio fell from 97% to 41% and fallback queries took up to 1.8 seconds.</desc>
<defs>${marker('sync', C.sync)}${marker('async', C.async)}${marker('repl', C.repl)}${marker('warn', C.warn)}</defs>
${bands}${glow}${edges}${Object.values(N).map(node).join('')}${notes}
</svg>`;
const key = (stroke, dasharray, glowOn) => `<svg width="46" height="14" viewBox="0 0 46 14" aria-hidden="true">${glowOn ? `<line x1="2" y1="7" x2="40" y2="7" stroke="${C.warn}" stroke-opacity=".35" stroke-width="10" stroke-linecap="round"/>` : ''}<line x1="2" y1="7" x2="38" y2="7" stroke="${stroke}" stroke-width="2"${dasharray ? ` stroke-dasharray="${dasharray}"` : ''}/><path d="M36,2 L44,7 L36,12 z" fill="${stroke}"/></svg>`;

export default {
  study: true,
  id: ID,
  title: 'Layered system architecture with the incident path',
  notes: 'Purpose: Show where each component lives (network zone), how requests and events move, and which path failed, so the review can discuss a design change rather than a symptom.\nModify: Edit zones, nodes (N) and edges (E). Node ports are computed from node boxes; keep edges orthogonal and re-route when you move a node. Mark failing components with hot:true.\nInvariant: Arrow styles carry meaning (solid = synchronous request in call direction, dashed = asynchronous event flow, dotted = replication). Zone bands are real network boundaries. The incident highlight follows actual call edges only.\nStatic: Static page.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-architecture ar-system',
  content: `<div class="ar-page">
<div class="ar-bar"><span class="ar-crumb"><b>INC-2317</b><i>/</i>02 · Architecture</span><span>Checkout platform · as of 12 Aug 2026</span></div>
<h1 class="ar-title" data-region="title">A price-cache miss falls through to a replica <em>shared with reporting</em></h1>
<figure class="ar-fig" style="left:48px;top:134px;width:1184px;height:470px" data-region="primary">${fig}</figure>
<div class="ar-legend" style="left:48px;top:622px" data-region="support"><span>${key(C.sync)}Synchronous request</span><span>${key(C.async, '7 5')}Asynchronous event</span><span>${key(C.repl, '2 4')}Replication</span><span>${key(C.sync, '', true)}Incident path</span><span><svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true"><rect x="1" y="1" width="16" height="12" rx="3" fill="none" stroke="${C.warn}" stroke-width="1.6"/></svg>Degraded component</span></div>
<footer class="ar-foot" data-region="source"><span>Illustrative architecture · fictional service names</span><span class="ar-pg">02 / 06</span></footer>
</div>`
};
