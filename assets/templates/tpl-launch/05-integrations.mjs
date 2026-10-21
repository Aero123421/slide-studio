// Template: Product launch · Which system connects at which step. Synthetic example content; replace data and copy.
// A step × system matrix: Fernhook's steps run along the top line; each system is a row; a dot marks where it
// connects and says what passes. Connections new in this release are green and named in the key.
import { svgRoot, el, g, textLines } from '../../runtime/figure.mjs';

const ID = 'tpl-launch-integrations';
const C = n => 64 + 98 * (n - 1);      // x of column n (12 columns of 74 px, 24 px gutters)
const span = (a, b) => 98 * (b - a) + 74;

const steps = ['Request', 'Decision', 'Label', 'First scan', 'Refund', 'Restock'];
const inside = { Decision: 'Inside Fernhook' };            // steps that call no outside system
const systems = ['Storefront', 'Helpdesk', 'Carrier', 'Payment provider', 'Warehouse system', 'Email and SMS'];
// what passes at that step (≤ 15 characters); isNew: added in this release.
const links = [
  { system: 'Storefront', step: 'Request', what: 'Order, items' },
  { system: 'Helpdesk', step: 'Request', what: 'Chat request' },
  { system: 'Email and SMS', step: 'Request', what: 'Confirmation' },
  { system: 'Carrier', step: 'Label', what: 'QR code' },
  { system: 'Carrier', step: 'First scan', what: 'Scan event', isNew: true },
  { system: 'Payment provider', step: 'Refund', what: 'Refund to card', isNew: true },
  { system: 'Email and SMS', step: 'Refund', what: 'Refund notice' },
  { system: 'Warehouse system', step: 'Restock', what: 'Arrival, grade' },
];
const fresh = links.filter(l => l.isNew);

// Geometry in the SVG's own coordinates (1152 × 420, drawn 1:1 at x 64, y 189: the step names' caps sit on y 208). Steps start on column 3.
const W = 1152, H = 420, X0 = C(3) - 64, PITCH = (W - X0) / steps.length, LINE = 54, ROW0 = 118, ROWH = 54;
const sx = s => X0 + PITCH * steps.indexOf(s);
const ry = s => ROW0 + ROWH * systems.indexOf(s);
const colour = l => (l.isNew ? 'var(--ln-green)' : 'var(--ln-mark)');

const top = g({},
  textLines(['Fernhook'], { x: 0, y: LINE + 6, cls: 'ln-t-head' }),
  el('line', { x1: sx(steps[0]), x2: sx(steps.at(-1)), y1: LINE, y2: LINE, stroke: 'var(--ln-ink)', 'stroke-width': 2 }),
  ...steps.map(s => textLines([s], { x: sx(s) - 6, y: LINE - 22, cls: 'ln-t-strong' })),
  ...steps.map(s => el('circle', { cx: sx(s), cy: LINE, r: 6, fill: 'var(--ln-ink)' })),
  ...Object.entries(inside).map(([s, t]) => textLines([t], { x: sx(s) - 6, y: LINE + 34, cls: 'ln-t-grey' })));
const rows = g({}, ...systems.map(s => g({},
  el('line', { x1: 0, x2: W, y1: ry(s) + ROWH / 2, y2: ry(s) + ROWH / 2, stroke: 'var(--ln-rule)', 'stroke-width': 1 }),
  textLines([s], { x: 0, y: ry(s), valign: 'middle', cls: 'ln-t-label' }))),
  el('line', { x1: 0, x2: W, y1: ROW0 - ROWH / 2, y2: ROW0 - ROWH / 2, stroke: 'var(--ln-rule)', 'stroke-width': 1 }));
// Drops from each step to the systems it calls: grey first, green on top for what is new.
const drops = g({}, ...[false, true].flatMap(isNew => steps.map(s => {
  const here = links.filter(l => l.step === s && !!l.isNew === isNew);
  if (!here.length) return '';
  const bottom = Math.max(...here.map(l => ry(l.system)));
  return el('line', { x1: sx(s), x2: sx(s), y1: LINE, y2: bottom, stroke: isNew ? 'var(--ln-green)' : 'var(--ln-mark)', 'stroke-width': isNew ? 3 : 1.5 });
})));
const marks = g({}, ...links.map(l => g({},
  el('circle', { cx: sx(l.step), cy: ry(l.system), r: 7, fill: colour(l), stroke: 'var(--ln-paper)', 'stroke-width': 3 }),
  textLines([l.what], { x: sx(l.step) + 16, y: ry(l.system), valign: 'middle', cls: l.isNew ? 'ln-t-green' : 'ln-t-label' }))));

const chart = svgRoot({
  id: `${ID}-fig`, width: W, height: H, className: 'ln-fig',
  title: 'Which outside system Fernhook connects to at each step of a return',
  desc: `${steps.join(', ')}. ${links.map(l => `${l.step}: ${l.system}, ${l.what}${l.isNew ? ' (new in 2.0)' : ''}`).join('; ')}. ${Object.entries(inside).map(([s, t]) => `${s}: ${t.toLowerCase()}`).join('; ')}.`,
}, rows, top, drops, marks);

export default {
  study: true,
  id: ID,
  title: `Integrations: ${fresh.length} new connections in 2.0`,
  notes: 'Purpose: Show where the product sits among systems the customer already runs — which system connects at which step — and what this release adds.\nModify: Edit steps (in order), systems (rows) and links (system, step, what passes in ≤ 15 characters, isNew for this release). Positions, drops, colours, the key and the description follow the data.\nInvariant: One row per system, one column per step, in the order a return happens. Green only for what is new in this release, and the key on the bottom line names it; everything else is grey.\nStatic: No builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-launch ln-integrations',
  content: `<h2 class="ln-at ln-head" data-region="title" style="left:${C(1)}px;top:64px;width:${span(1, 10)}px">New in 2.0: the carrier’s first scan goes straight to your payment provider</h2>
<figure class="ln-at" data-region="primary" style="left:${C(1)}px;top:189px;width:${W}px;height:${H}px">${chart}</figure>
<p class="ln-at ln-note" data-region="source" style="left:${C(1)}px;top:645px;width:${span(1, 8)}px">All six connect from Settings, Connections; none needs code.</p>
<p class="ln-at ln-label ln-key" style="left:${C(9)}px;top:642.9px;width:${span(9, 12)}px"><i class="ln-new"></i>New in 2.0<i></i>Connected since 1.x</p>`,
};
