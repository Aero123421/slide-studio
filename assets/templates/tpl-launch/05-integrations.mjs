// Template: Product launch · Integration map with one highlighted event chain. Synthetic example content; replace data and copy.
// Edges are computed from node boxes, so moving a node keeps every arrow attached to its port.
const P = 'tpl-launch-integrations';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const V = '#5a3ff5', C = '#f2553a', G = '#aaa5c4';
const ln = (c = V) => `fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;

const glyph = {
  store: `<path d="M-11 -4h22l-2-7h-18z" ${ln()}/><path d="M-9 -4v14h18v-14M-3 10v-7h6v7" ${ln()}/>`,
  market: `<rect x="-11" y="-10" width="9" height="9" rx="2" ${ln()}/><rect x="2" y="-10" width="9" height="9" rx="2" ${ln()}/><rect x="-11" y="3" width="9" height="9" rx="2" ${ln()}/><rect x="2" y="3" width="9" height="9" rx="2" fill="${C}"/>`,
  help: `<path d="M-11 -9h22v14h-12l-6 5v-5h-4z" ${ln()}/><path d="M-5 -2h10" ${ln()}/>`,
  pay: `<rect x="-12" y="-8" width="24" height="16" rx="3" ${ln()}/><path d="M-12 -3h24" ${ln()}/><rect x="-8" y="2" width="7" height="3" rx="1" fill="${C}"/>`,
  ware: `<path d="M-12 -2l12-8 12 8v12h-24z" ${ln()}/><path d="M-6 10v-8h12v8M-6 6h12" ${ln()}/>`,
  msg: `<rect x="-12" y="-9" width="24" height="18" rx="3" ${ln()}/><path d="M-12 -7l12 9 12-9" ${ln()}/><circle cx="11" cy="-9" r="4" fill="${C}"/>`,
  truck: `<path d="M-13 -7h15v13h-15zM2 -3h6l5 5v4h-11z" ${ln()}/><circle cx="-7" cy="8" r="3" fill="#fff" stroke="${V}" stroke-width="2"/><circle cx="7" cy="8" r="3" fill="#fff" stroke="${V}" stroke-width="2"/>`
};

const NW = 270, NH = 84;
const nodes = {
  store: { x: 0, y: 24, t: 'Storefront', s: 'Orders, customers, policy', g: 'store' },
  market: { x: 0, y: 154, t: 'Marketplaces', s: 'Orders from two channels', g: 'market' },
  help: { x: 0, y: 284, t: 'Helpdesk', s: 'Return requests from chat', g: 'help' },
  pay: { x: 882, y: 24, t: 'Payments', s: 'Refund to original method', g: 'pay' },
  ware: { x: 882, y: 154, t: 'Warehouse / ERP', s: 'Expected arrivals, stock', g: 'ware' },
  msg: { x: 882, y: 284, t: 'Customer updates', s: 'Email and SMS messages', g: 'msg' },
  carrier: { x: 441, y: 384, t: 'Carrier network', s: 'Labels and tracking scans', g: 'truck' }
};
const hub = { x: 446, y: 120, w: 260, h: 176 };
// kind: sync = continuous data sync; chain = what a single scan sets off (numbered in order)
const edges = [
  { from: 'store', to: 'hub', label: 'orders and items', kind: 'sync' },
  { from: 'market', to: 'hub', label: 'orders', kind: 'sync' },
  { from: 'help', to: 'hub', label: 'return requests', kind: 'sync' },
  { from: 'hub', to: 'carrier', label: 'label request', kind: 'sync', port: -40 },
  { from: 'carrier', to: 'hub', label: 'first scan', kind: 'chain', step: 1, port: 40 },
  { from: 'hub', to: 'pay', label: 'release refund', kind: 'chain', step: 2 },
  { from: 'hub', to: 'ware', label: 'expect item', kind: 'chain', step: 2 },
  { from: 'hub', to: 'msg', label: 'send update', kind: 'chain', step: 2 }
];

const leftIn = ['store', 'market', 'help'], rightOut = ['pay', 'ware', 'msg'];
const hubPortY = i => hub.y + 44 + i * 44;
function geom(e) {
  if (e.to === 'hub' && leftIn.includes(e.from)) {
    const n = nodes[e.from], i = leftIn.indexOf(e.from), a = [n.x + NW, n.y + NH / 2], b = [hub.x - 6, hubPortY(i)];
    return { d: `M${a[0]} ${a[1]} C ${a[0] + 110} ${a[1]}, ${b[0] - 110} ${b[1]}, ${b[0]} ${b[1]}`, mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], anchor: 'middle' };
  }
  if (e.from === 'hub' && rightOut.includes(e.to)) {
    const n = nodes[e.to], i = rightOut.indexOf(e.to), a = [hub.x + hub.w, hubPortY(i)], b = [n.x - 6, n.y + NH / 2];
    return { d: `M${a[0]} ${a[1]} C ${a[0] + 110} ${a[1]}, ${b[0] - 110} ${b[1]}, ${b[0]} ${b[1]}`, mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], anchor: 'middle' };
  }
  const cx = hub.x + hub.w / 2 + e.port, top = hub.y + hub.h, bot = nodes.carrier.y;
  return e.to === 'carrier'
    ? { d: `M${cx} ${top} V ${bot - 6}`, mid: [cx - 14, (top + bot) / 2 + 5], anchor: 'end' }
    : { d: `M${cx} ${bot} V ${top + 6}`, mid: [cx + 14, (top + bot) / 2 + 5], anchor: 'start' };
}
const edgeSvg = edges.map(e => {
  const g = geom(e), chain = e.kind === 'chain', c = chain ? C : G;
  const w = e.label.length * 8.2 + 24;
  const pill = g.anchor === 'middle'
    ? `<rect x="${g.mid[0] - w / 2}" y="${g.mid[1] - 14}" width="${w}" height="28" rx="14" fill="${chain ? '#fff3ef' : '#faf9f6'}" stroke="${chain ? '#f7b3a4' : '#e3e0ef'}"/>
       <text x="${g.mid[0]}" y="${g.mid[1] + 5}" font-size="15.5" fill="${chain ? '#a3311c' : '#4b4870'}" text-anchor="middle" font-weight="${chain ? 700 : 500}">${esc(e.label)}</text>`
    : `<text x="${g.mid[0]}" y="${g.mid[1]}" font-size="15.5" fill="${chain ? '#a3311c' : '#4b4870'}" text-anchor="${g.anchor}" font-weight="${chain ? 700 : 500}">${esc(e.label)}</text>`;
  return `<path d="${g.d}" fill="none" stroke="${c}" stroke-width="${chain ? 2.6 : 1.8}" ${chain ? '' : 'stroke-dasharray="1 0"'} marker-end="url(#${P}-${chain ? 'ac' : 'ag'})"/>${pill}`;
}).join('');
// Step badges: 1 on the scan edge, 2 where the three actions fan out from the hub.
const scan = geom(edges[4]);
const badge = (x, y, n) => `<circle cx="${x}" cy="${y}" r="13" fill="${C}"/><text x="${x}" y="${y + 5}" font-size="14" font-weight="800" fill="#fff" text-anchor="middle">${n}</text>`;
const badges = badge(hub.x + hub.w / 2 + 40, (hub.y + hub.h + nodes.carrier.y) / 2 - 22, 1) + badge(hub.x + hub.w + 26, hub.y + 22, 2);

const nodeSvg = Object.entries(nodes).map(([k, n]) => `<g>
  <rect x="${n.x}" y="${n.y}" width="${NW}" height="${NH}" rx="16" fill="#fff" stroke="#dcd8ea"/>
  <rect x="${n.x + 16}" y="${n.y + 17}" width="48" height="48" rx="13" fill="#ece8ff"/>
  <g transform="translate(${n.x + 40} ${n.y + 41})">${glyph[n.g]}</g>
  <text x="${n.x + 78}" y="${n.y + 37}" font-size="18" font-weight="700" fill="#17143b">${esc(n.t)}</text>
  <text x="${n.x + 78}" y="${n.y + 59}" font-size="15" fill="#6c6990">${esc(n.s)}</text></g>`).join('');

const hubSvg = `<g>
  <rect x="${hub.x}" y="${hub.y}" width="${hub.w}" height="${hub.h}" rx="24" fill="#17143b"/>
  <rect x="${hub.x}" y="${hub.y}" width="${hub.w}" height="${hub.h}" rx="24" fill="url(#${P}-hubglow)"/>
  <g transform="translate(${hub.x + 24} ${hub.y + 24})"><rect width="34" height="34" rx="10" fill="#5a3ff5"/><path d="M12 12h8.5a6 6 0 0 1 0 12H14" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M15.5 8l-4 4 4 4" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11.5" cy="24" r="2.2" fill="#ffc24b"/></g>
  <text x="${hub.x + 70}" y="${hub.y + 47}" font-size="21" font-weight="800" fill="#fff">Fernhook</text>
  <text x="${hub.x + 24}" y="${hub.y + 92}" font-size="16" fill="#cfcaf0">Rules engine checks</text>
  <text x="${hub.x + 24}" y="${hub.y + 114}" font-size="16" fill="#cfcaf0">policy, stock and risk</text>
  <text x="${hub.x + 24}" y="${hub.y + 146}" font-size="14" font-weight="700" fill="#ffc24b" letter-spacing="1">DECIDES IN SECONDS</text></g>`;

const svg = `<svg viewBox="0 0 1152 470" width="1152" height="470" role="img" aria-labelledby="${P}-t ${P}-d" font-family="Inter,'Helvetica Neue','Liberation Sans',Arial,sans-serif">
<title id="${P}-t">How Fernhook connects to store, carrier, payments and warehouse systems</title>
<desc id="${P}-d">Storefront, marketplaces and helpdesk send orders and requests into Fernhook, which requests carrier labels. When the carrier reports the first scan, Fernhook releases the refund, tells the warehouse to expect the item and updates the customer.</desc>
<defs>
  <marker id="${P}-ag" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${G}"/></marker>
  <marker id="${P}-ac" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C}"/></marker>
  <radialGradient id="${P}-hubglow" cx="80%" cy="0%" r="90%"><stop offset="0" stop-color="#5a3ff5" stop-opacity=".55"/><stop offset="1" stop-color="#5a3ff5" stop-opacity="0"/></radialGradient>
</defs>
${edgeSvg}${nodeSvg}${hubSvg}${badges}
</svg>`;

const lock = `<div class="ln-lock" aria-hidden="true"><svg viewBox="0 0 34 34"><rect width="34" height="34" rx="10" fill="#5a3ff5"/><path d="M12 12h8.5a6 6 0 0 1 0 12H14" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M15.5 8l-4 4 4 4" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11.5" cy="24" r="2.2" fill="#ffc24b"/></svg>Fernhook 2.0</div>`;

export default {
  study: true,
  id: 'tpl-launch-integrations',
  title: 'Integration map: one scan sets off refund, restock and update',
  notes: 'Purpose: Show where the product sits among existing systems and which single event creates the customer-visible benefit.\nModify: Edit nodes (position, title, subtitle, glyph) and edges (from, to, label, kind). Paths and label pills recompute from node boxes.\nInvariant: Arrow direction is the direction data moves. Grey means continuous sync; coral marks only the chain started by one scan, numbered in order. Do not colour other edges coral.\nStatic: No builds; the legend explains both line types.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-launch ln-integrations',
  content: `<div class="ln-page">${lock}
<div class="ln-abs" style="left:72px;top:50px;width:880px">
  <p class="ln-kicker">How it connects</p>
  <h2 class="ln-h2" data-region="title" style="margin-top:12px">One carrier scan triggers the refund, the restock and the customer update</h2>
</div>
<div class="ln-abs ln-key" style="left:72px;bottom:24px;gap:30px">
  <span><svg viewBox="0 0 40 10" width="40" height="10" aria-hidden="true"><path d="M1 5h36" stroke="${G}" stroke-width="2"/></svg>Data synced continuously</span>
  <span><svg viewBox="0 0 40 10" width="40" height="10" aria-hidden="true"><path d="M1 5h36" stroke="${C}" stroke-width="3"/></svg>Chain started by a single scan, in numbered order</span>
</div>
<div class="ln-abs ln-flow" data-region="primary" style="top:188px">${svg}</div>
</div>`
};
