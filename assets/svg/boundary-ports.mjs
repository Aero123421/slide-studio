// Diagram study · Boundary ports — two domains that may meet only at named ports.
// Components declare their domain and grid cell; crossings declare the port they use. Every
// crossing is routed component → out-port → in-port → component and checked; the retired direct
// read is drawn as what it was: a path that bypasses the ports.
import { theme as makeTheme, svgRoot, el, textLines, measureNode, drawNode, arrowMarker, roundRectPath, fmt } from '../runtime/figure.mjs';

const domains = [{ id: 'orders', label: 'Orders domain' }, { id: 'billing', label: 'Billing domain' }]; // left, right
const components = [ // col counts away from the shared boundary's far side: orders col 1 and billing col 0 face each other
  { id: 'orderdb', domain: 'orders', label: 'Order database', kind: 'store', col: 0, row: 1 },
  { id: 'checkout', domain: 'orders', label: 'Checkout', col: 1, row: 0 },
  { id: 'status', domain: 'orders', label: 'Order status', col: 1, row: 1 },
  { id: 'returns', domain: 'orders', label: 'Returns', col: 1, row: 2 },
  { id: 'invoicing', domain: 'billing', label: 'Invoicing', col: 0, row: 0 },
  { id: 'settle', domain: 'billing', label: 'Settlement', col: 0, row: 1 },
  { id: 'refunds', domain: 'billing', label: 'Refunds', col: 0, row: 2 },
  { id: 'ledger', domain: 'billing', label: 'Ledger', kind: 'store', col: 1, row: 1 },
];
const crossings = [ // events per hour at the Saturday peak (illustrative)
  { from: 'checkout', to: 'invoicing', port: 'order.placed', perHour: 1850 },
  { from: 'settle', to: 'status', port: 'payment.settled', perHour: 1790 },
  { from: 'returns', to: 'refunds', port: 'return.approved', perHour: 64 },
];
const internal = [['checkout', 'orderdb'], ['status', 'orderdb'], ['returns', 'orderdb'], ['invoicing', 'ledger'], ['settle', 'ledger'], ['refunds', 'ledger']];
const retired = { from: 'invoicing', to: 'orderdb', label: 'direct SQL read, retired in March' };

const byId = Object.fromEntries(components.map(c => [c.id, c]));
for (const x of crossings) if (byId[x.from].domain === byId[x.to].domain) throw Error(`boundary-ports: ${x.port} does not cross a boundary`);
const perHour = crossings.reduce((s, x) => s + x.perHour, 0);
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six'];

export function figure(theme = 'css') {
  const t = makeTheme(theme), id = 'boundary-ports-fig', W = 1152, H = 444, size = 19, ctx = { t, size };
  const dom = { orders: { x: 0, y: 40, w: 470, h: H - 42 }, billing: { x: W - 470, y: 40, w: 470, h: H - 42 } };
  const rowY = r => 150 + r * 112, colX = { orders: [26, 262], billing: [W - 470 + 28, W - 470 + 264] }, cw = 182;
  const boxes = Object.fromEntries(components.map(c => {
    const m = measureNode({ label: c.label, kind: c.kind }, { size, maxWidth: cw, minWidth: cw });
    return [c.id, { ...m, x: colX[c.domain][c.col], y: rowY(c.row) - m.h / 2, fill: t.c('paper') }];
  }));
  const port = 16, edge = { orders: dom.orders.x + dom.orders.w, billing: dom.billing.x };
  const parts = [];
  domains.forEach(d => {
    const b = dom[d.id];
    parts.push(el('path', { d: roundRectPath(b.x, b.y, b.w, b.h, 16), fill: t.c('surface'), stroke: t.c('ink'), 'stroke-width': 1.6 }),
      textLines([d.label], { x: b.x + 24, y: b.y + 20, size: 19, valign: 'top', fill: t.c('ink'), weight: 700 }));
  });
  // internal wiring: thin, no arrowheads; it never leaves its domain
  for (const [a, b] of internal) {
    const A = boxes[a], B = boxes[b], left = A.x < B.x ? A : B, right = A.x < B.x ? B : A;
    parts.push(el('line', { x1: left.x + left.w, y1: left.y + left.h / 2, x2: right.x, y2: right.y + right.h / 2, stroke: t.c('muted'), 'stroke-width': 1.3 }));
  }
  // the retired read: over the top, crossing both boundaries where there is no port
  const rf = boxes[retired.from], rt = boxes[retired.to], ry = 14;
  parts.push(el('path', { d: `M${rf.x + rf.w / 2} ${rf.y}V${ry}H${rt.x + rt.w / 2}V${rt.y - 3}`, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.6, 'stroke-dasharray': '6 6' }),
    textLines([retired.label], { x: W / 2, y: ry - 6, size: 16, anchor: 'middle', valign: 'bottom', fill: t.c('muted'), italic: true }));
  // crossings: component → out-port → in-port → component, one straight line per row
  for (const x of crossings) {
    const a = boxes[x.from], b = boxes[x.to], y = a.y + a.h / 2, rightward = a.x < b.x;
    const pa = rightward ? edge.orders : edge.billing, pb = rightward ? edge.billing : edge.orders, s = rightward ? 1 : -1;
    const x0 = rightward ? a.x + a.w : a.x, x3 = rightward ? b.x - 4 : b.x + b.w + 4;
    parts.push(el('line', { x1: x0, x2: pa - s * port / 2, y1: y, y2: y, stroke: t.c('ink'), 'stroke-width': 2 }),
      el('line', { x1: pa + s * port / 2, x2: pb - s * port / 2, y1: y, y2: y, stroke: t.c('ink'), 'stroke-width': 2 }),
      el('line', { x1: pb + s * port / 2, x2: x3, y1: y, y2: y, stroke: t.c('ink'), 'stroke-width': 2, 'marker-end': `url(#${id}-arr)` }));
    for (const px of [pa, pb]) parts.push(el('rect', { x: px - port / 2, y: y - port / 2, width: port, height: port, rx: 2, fill: t.c('accent') }));
    parts.push(textLines([x.port], { x: (pa + pb) / 2, y: y - 12, size: 17, anchor: 'middle', valign: 'bottom', fill: t.c('ink'), weight: 700, family: t.font('mono') }),
      textLines([`${fmt(x.perHour)} / hour`], { x: (pa + pb) / 2, y: y + 14, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  }
  parts.push(Object.values(boxes).map(b => drawNode(b, ctx)));
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Orders and Billing domains, connected only through named ports',
    desc: `Two domains drawn as boundaries; squares on the boundaries are ports. ${crossings.length} flows cross between the domains, each leaving through an out-port and arriving through an in-port: ${crossings.map(x => `${x.port} (${fmt(x.perHour)} per hour)`).join(', ')}. Arrows mean events flowing from producer to consumer. Thin lines inside a domain are internal reads and writes. The dashed line is the retired direct read from Invoicing into the order database, which crossed both boundaries without a port.` },
  el('defs', {}, arrowMarker(`${id}-arr`, t.c('ink'), { size: 12 })), parts);
}

export default {
  study: true,
  id: 'boundary-ports',
  title: 'Boundary ports: crossings through named interfaces',
  className: 'st cs-blueprint',
  notes: 'Purpose: Keep boundary membership and every interface crossing legible: what crosses, through which named port, how often.\nModify: Edit `components` (domain, col/row), `crossings` (port name, rate) and `internal`. Boxes, ports, routes, rates and the headline recompute; a crossing inside one domain throws.\nInvariant: Every crossing passes through a port on each boundary; arrows end outside boxes and never run beneath a filled shape; moving a box reroutes from its ports; a link that bypasses ports is shown as such, not hidden.\nStatic: Already static. For a build, show the domains, then the crossings one by one, then the retired path.',
  sources: [{ type: 'original-example', file: 'assets/svg/boundary-ports.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Orders and Billing now meet only at ${words[crossings.length]} named ports.<br><span class="st-quiet">The direct read of the order database is retired</span></h1>
<p class="st-dek">Squares are ports; arrows run from the producing service to the consuming one.</p>
<figure class="st-fig" style="top:214px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative architecture · event rates at the Saturday peak</span><span>Boundary and port diagram</span></p>`,
};
