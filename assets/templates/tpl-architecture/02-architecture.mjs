// Template: Incident review · Architecture with the incident path. Synthetic example content; replace data and copy.
const ID = 'tpl-architecture-system';

// Network zones, left to right. width = px of the 1152 px figure; cols = box width of each sub-column.
const zones = [
  { id: 'internet', label: 'Internet', width: 150, cols: [122] },
  { id: 'edge', label: 'Edge', width: 176, cols: [146] },
  { id: 'app', label: 'Application network', width: 470, cols: [152, 232] },
  { id: 'data', label: 'Data network', width: 308, cols: [248] },
];
// Components: zone, sub-column, row (0 = top). role = the one fact the review needs, ≤ 24 characters.
const parts = [
  { id: 'shoppers', zone: 'internet', col: 0, row: 1, name: 'Shoppers', role: 'web and app', plain: true },
  { id: 'gateway', zone: 'edge', col: 0, row: 1, name: 'api-gateway', role: 'timeout 2.0 s' },
  { id: 'checkout', zone: 'app', col: 0, row: 1, name: 'checkout-svc', role: 'creates orders' },
  { id: 'promo', zone: 'app', col: 1, row: 0, name: 'promo-scheduler', role: 'invalidated 41,200 rules' },
  { id: 'pricing', zone: 'app', col: 1, row: 1, name: 'pricing-svc', role: 'misses not coalesced' },
  { id: 'reporting', zone: 'app', col: 1, row: 2, name: 'reporting-jobs', role: 'hourly, ran at 18:00' },
  { id: 'cache', zone: 'data', col: 0, row: 0, name: 'price-cache', role: 'hit ratio 97% → 22%', degraded: true },
  { id: 'replica', zone: 'data', col: 0, row: 1, name: 'catalog-replica-2', role: 'queries up to 1.8 s', degraded: true },
  { id: 'primary', zone: 'data', col: 0, row: 2, name: 'catalog-db', role: 'primary, takes writes' },
];
// Calls point from caller to callee. kind: sync (solid) | async (dashed) | repl (dotted).
// out/in = vertical offset of the port from the box centre, so parallel edges never share a line.
const links = [
  { from: 'shoppers', to: 'gateway', kind: 'sync', incident: true },
  { from: 'gateway', to: 'checkout', kind: 'sync', incident: true },
  { from: 'checkout', to: 'pricing', kind: 'sync', incident: true },
  { from: 'pricing', to: 'cache', kind: 'sync', incident: true, out: -16, in: 14 },
  { from: 'pricing', to: 'replica', kind: 'sync', incident: true },
  { from: 'promo', to: 'cache', kind: 'async', out: -14, in: -14 },
  { from: 'reporting', to: 'replica', kind: 'sync', in: 16 },
  { from: 'primary', to: 'replica', kind: 'repl' },
];

// ---- geometry (computed; edit the data above, not these numbers)
const W = 1152, GAP = 16, PAD = 15, ROWS = [104, 212, 320], BOX_H = 64, BAND_H = 372;
let zx = 0;
const Z = Object.fromEntries(zones.map(z => {
  const inner = z.width - 2 * PAD, used = z.cols.reduce((a, b) => a + b, 0);
  const between = z.cols.length > 1 ? (inner - used) / (z.cols.length - 1) : 0;
  let cx = zx + PAD + (z.cols.length > 1 ? 0 : (inner - used) / 2);
  const colX = z.cols.map(w => { const x = cx; cx += w + between; return x; });
  const out = [z.id, { ...z, x: zx, colX }];
  zx += z.width + GAP;
  return out;
}));
if (Math.round(zx - GAP) !== W) throw Error(`${ID}: zone widths and gaps must add up to ${W}, got ${zx - GAP}`);
const B = Object.fromEntries(parts.map(p => {
  const z = Z[p.zone], w = z.cols[p.col];
  return [p.id, { ...p, x: z.colX[p.col], y: ROWS[p.row] - BOX_H / 2, w, h: BOX_H, cy: ROWS[p.row], z }];
}));
const gapX = (a, b) => (a.z.x + a.z.width + b.z.x) / 2; // centre of the white gap between two zones
function route(l) {
  const a = B[l.from], b = B[l.to];
  if (l.kind === 'repl') return [[b.x + b.w / 2, a.y], [b.x + b.w / 2, b.y + b.h]]; // vertical, same column
  const y0 = a.cy + (l.out || 0), y1 = b.cy + (l.in || 0), x0 = a.x + a.w, x1 = b.x;
  if (y0 === y1) return [[x0, y0], [x1, y1]];
  const vx = gapX(a, b);
  return [[x0, y0], [vx, y0], [vx, y1], [x1, y1]];
}
const RED = 'var(--ar-red)', GREY = 'var(--ar-line)', INK = 'var(--ar-ink)';
const DASH = { sync: null, async: '7 5', repl: '1.5 5' };
const path = pts => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join('');
const edge = l => `<path d="${path(route(l))}" fill="none" stroke="${l.incident ? RED : GREY}" stroke-width="${l.incident ? 2.4 : 1.6}"${DASH[l.kind] ? ` stroke-dasharray="${DASH[l.kind]}"` : ''} stroke-linecap="${l.kind === 'repl' ? 'round' : 'butt'}" stroke-linejoin="round" marker-end="url(#${ID}-${l.incident ? 'red' : 'grey'})"/>`;
const box = b => `<g><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="5" fill="${b.degraded ? 'var(--ar-red-tint)' : 'var(--ar-paper)'}" stroke="${b.degraded ? RED : INK}" stroke-width="${b.degraded ? 2 : 1.25}"/>`
  + `<text x="${b.x + 14}" y="${b.y + 28}" class="${b.plain ? 't-strong' : 't-name'}"${b.plain ? ' style="font-size:17px"' : ''}>${b.name}</text>`
  + `<text x="${b.x + 14}" y="${b.y + 50}" class="t-role${b.degraded ? ' t-red' : ''}">${b.role}</text></g>`;
const bands = zones.map(z => `<rect x="${Z[z.id].x}" y="0" width="${z.width}" height="${BAND_H}" fill="var(--ar-zone)"/><text x="${Z[z.id].x + PAD}" y="30" class="t-zone">${z.label}</text>`).join('');
// legend: line styles carry meaning, so they are the one thing that needs a key
const LY = BAND_H + 40;
const key = [
  { label: 'Synchronous call', w: 150, swatch: x => `<line x1="${x}" y1="${LY - 5}" x2="${x + 34}" y2="${LY - 5}" stroke="${GREY}" stroke-width="1.6"/>` },
  { label: 'Asynchronous event', w: 168, swatch: x => `<line x1="${x}" y1="${LY - 5}" x2="${x + 34}" y2="${LY - 5}" stroke="${GREY}" stroke-width="1.6" stroke-dasharray="7 5"/>` },
  { label: 'Replication', w: 108, swatch: x => `<line x1="${x}" y1="${LY - 5}" x2="${x + 34}" y2="${LY - 5}" stroke="${GREY}" stroke-width="1.6" stroke-dasharray="1.5 5" stroke-linecap="round"/>` },
  { label: 'Incident path', w: 118, swatch: x => `<line x1="${x}" y1="${LY - 5}" x2="${x + 34}" y2="${LY - 5}" stroke="${RED}" stroke-width="2.4"/>` },
  { label: 'Degraded component', w: 170, swatch: x => `<rect x="${x + 6}" y="${LY - 13}" width="22" height="16" rx="3" fill="var(--ar-red-tint)" stroke="${RED}" stroke-width="2"/>` },
];
let kx = 0;
const legend = key.map(k => { const s = k.swatch(kx) + `<text x="${kx + 46}" y="${LY}" class="t-axis">${k.label}</text>`; kx += 46 + k.w + 28; return s; }).join('');
const H = LY + 8;
const marker = (id, c) => `<marker id="${ID}-${id}" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0.8L10 5L0 9.2Z" fill="${c}"/></marker>`;
const incidentPath = links.filter(l => l.incident).map(l => `${B[l.from].name} → ${B[l.to].name}`).join(', ');
const fig = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">Checkout architecture by network zone, with the incident path</title>
<desc id="${ID}-d">${zones.map(z => `${z.label}: ${parts.filter(p => p.zone === z.id).map(p => p.name).join(', ')}`).join('. ')}. Incident path: ${incidentPath}. Degraded: ${parts.filter(p => p.degraded).map(p => `${p.name} (${p.role})`).join('; ')}. ${B.promo.name} invalidated the cache asynchronously; ${B.reporting.name} reads the same replica; ${B.primary.name} replicates to it.</desc>
<defs>${marker('red', RED)}${marker('grey', GREY)}</defs>
${bands}${links.map(edge).join('')}${parts.map(p => box(B[p.id])).join('')}${legend}
</svg>`;

export default {
  study: true,
  id: ID,
  title: 'Architecture by network zone with the incident path',
  notes: 'Purpose: Show where the failing path runs through the system and which shared component turned a cache problem into a checkout problem, so the review discusses the design, not the symptom.\nModify: Edit zones (width, sub-column widths), parts (zone, col, row, name, role) and links. Box positions, ports and orthogonal routes are computed; the figure refuses zone widths that do not add up. Keep roles to one fact each, under 25 characters.\nInvariant: Line style = call type (solid synchronous, dashed asynchronous, dotted replication); red = incident path and degraded components only; arrows point from caller to callee; zone labels stay clear of every edge; nine components or fewer.\nStatic: Static page; no builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-architecture ar-system',
  content: `<p class="ar-run"><span>Incident review — checkout timeouts, 6 Oct 2026</span><span>2</span></p>
<h1 class="ar-head" data-region="title">Every price-cache miss fell through to a replica that the reporting jobs were already loading</h1>
<figure class="ar-fig" style="left:64px;top:196px" data-region="primary">${fig}</figure>
<p class="ar-src" data-region="source"><span>Simplified to the request path: inventory, payments and the order store are omitted. Arrows point from caller to callee.</span></p>`,
};
