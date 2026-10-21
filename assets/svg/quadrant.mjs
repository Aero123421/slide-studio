// Diagram study · Quadrant — alternatives placed on two stated dimensions, positions marked as judgments.
// Drawn from primitives on the scores' own 1–5 scale. The domain runs 0.5–5.5, so quadrant names sit
// in the bands no score can reach and never collide with a dot. Everything is computed from `apps`.
import { svgRoot, el, g, textLines, linear, measureText, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const apps = [ // median panel score, 1 (low) – 5 (high): business value, technical health (judgments, illustrative)
  { label: 'Order management', value: 4.6, health: 1.8 },
  { label: 'Billing engine', value: 4.3, health: 2.3 },
  { label: 'Warehouse scanning', value: 3.8, health: 1.4 },
  { label: 'Payroll', value: 3.4, health: 2.5 },
  { label: 'Customer portal', value: 4.2, health: 4.2 },
  { label: 'Pricing service', value: 4.7, health: 3.7 },
  { label: 'Data warehouse', value: 3.6, health: 3.4 },
  { label: 'Expense claims', value: 2.3, health: 4.3 },
  { label: 'Room booking', value: 1.6, health: 3.8 },
  { label: 'HR self-service', value: 2.7, health: 3.3 },
  { label: 'Intranet CMS', value: 1.9, health: 2.1 },
  { label: 'Fax gateway', value: 1.2, health: 1.5 },
];
const mid = 3; // scale midpoint that splits the quadrants
const quadrants = { // what each quadrant implies, by [value high?][health high?]
  tl: { name: 'Migrate', note: 'valuable but fragile' }, tr: { name: 'Invest', note: 'valuable and sound' },
  bl: { name: 'Retire', note: 'fragile, little value' }, br: { name: 'Tolerate', note: 'sound, little value' },
};
const migrate = apps.filter(a => a.value > mid && a.health < mid);
const panel = { architects: 9, owners: 6 };

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 456, box = { x: 72, y: 2, w: W - 80, h: H - 62 };
  const x = linear([0.5, 5.5], [box.x, box.x + box.w]), y = linear([0.5, 5.5], [box.y + box.h, box.y]);
  // quadrant names live in the impossible-score bands (above 5, below 1)
  const name = (key, px, py, anchor) => {
    const { name: nm, note } = quadrants[key], hl = key === 'tl', w1 = measureText(nm, 17, { weight: 700 });
    const x1 = anchor === 'start' ? px : px - w1 - 10 - measureText(note, 15);
    return g({},
      textLines([nm], { x: x1, y: py, size: 17, valign: 'middle', fill: hl ? t.c('accent') : t.c('ink'), weight: 700 }),
      textLines([note], { x: x1 + w1 + 10, y: py, size: 15, valign: 'middle', fill: t.c('muted') }));
  };
  // item labels: right of the dot unless that would cross the quadrant edge; then nudge apart vertically
  const placed = [];
  const items = [...apps].sort((a, b) => b.value - a.value).map(a => {
    const hl = migrate.includes(a), px = x(a.health), py = y(a.value), w = measureText(a.label, 16, { weight: hl ? 700 : 600 });
    const edge = a.health < mid ? x(mid) - 8 : box.x + box.w - 8;
    const right = px + 14 + w <= edge;
    const lx0 = right ? px + 14 : px - 14 - w;
    let ly = py;
    for (const p of placed) if (lx0 < p.x1 && lx0 + w > p.x0 && Math.abs(ly - p.y) < 20) ly = p.y + (ly >= p.y ? 20 : -20);
    placed.push({ x0: lx0, x1: lx0 + w, y: ly });
    return g({ class: 'ss-item' },
      el('circle', { cx: px, cy: py, r: hl ? 9 : 7, fill: hl ? t.c('accent') : t.c('ink'), stroke: t.c('paper'), 'stroke-width': 2 }),
      textLines([a.label], { x: right ? px + 14 : px - 14, y: ly, size: 16, anchor: right ? 'start' : 'end', valign: 'middle', fill: hl ? t.c('ink') : t.c('muted'), weight: hl ? 700 : 600 }));
  });
  return svgRoot({ id: 'quadrant-fig', width: W, height: H, theme: t,
    title: 'Application portfolio by business value and technical health, panel scores 1 to 5',
    desc: `Positions are median scores from a review panel, judgments rather than measurements. ${migrate.length} of ${apps.length} applications score above ${mid} on value and below ${mid} on health: ${migrate.map(a => a.label).join(', ')}.` },
  // the quadrant the page is about, tinted; the others are just space
  el('rect', { x: x(0.5), y: y(5.5), width: x(mid) - x(0.5), height: y(mid) - y(5.5), fill: t.c('accent'), 'fill-opacity': 0.13 }),
  el('line', { x1: x(mid), x2: x(mid), y1: y(5.5), y2: y(0.5), stroke: t.c('muted'), 'stroke-width': 1.2 }),
  el('line', { x1: x(0.5), x2: x(5.5), y1: y(mid), y2: y(mid), stroke: t.c('muted'), 'stroke-width': 1.2 }),
  el('line', { x1: x(0.5), x2: x(5.5), y1: y(0.5), y2: y(0.5), stroke: t.c('rule'), 'stroke-width': 1.5 }),
  el('line', { x1: x(0.5), x2: x(0.5), y1: y(5.5), y2: y(0.5), stroke: t.c('rule'), 'stroke-width': 1.5 }),
  name('tl', x(0.5) + 16, y(5.25), 'start'), name('tr', x(5.5) - 16, y(5.25), 'end'),
  name('bl', x(0.5) + 16, y(0.75), 'start'), name('br', x(5.5) - 16, y(0.75), 'end'),
  // the scores' scale on both axes
  [1, 2, 3, 4, 5].map(v => g({},
    textLines([fmt(v)], { x: x(v), y: box.y + box.h + 10, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') }),
    textLines([fmt(v)], { x: box.x - 12, y: y(v), size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
  textLines(['Technical health, panel score (1 fragile → 5 sound)'], { x: x(mid), y: H - 6, size: 16, anchor: 'middle', fill: t.c('ink'), weight: 600 }),
  textLines(['Business value (1 low → 5 high)'], { x: 16, y: y(mid), size: 16, anchor: 'middle', valign: 'middle', fill: t.c('ink'), weight: 600, attrs: { transform: `rotate(-90 16 ${y(mid)})` } }),
  items);
}

export default {
  study: true,
  id: 'quadrant',
  title: 'Quadrant: alternatives on two stated dimensions',
  className: 'st cs-strategy-dark',
  notes: 'Purpose: Locate alternatives on two stated dimensions and name what each quadrant implies, while making clear that positions are judgments.\nModify: Replace `apps` (panel scores 1–5), `mid` and `quadrants`. Dots, quadrant membership, the accented quadrant, the panel note and the headline recompute; quadrant names stay in the bands no score can reach.\nInvariant: Both axes are titled with their good direction and their scale; who judged, and how, is stated on the page; items are never nudged across a line for neatness, only their labels move.\nStatic: Already static. For a build, show the quadrants first, then the items.',
  sources: [{ type: 'original-example', file: 'assets/svg/quadrant.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${migrate.length} of ${apps.length} core systems are valuable but fragile, and should <em>${quadrants.tl.name.toLowerCase()}</em> first</h1>
<p class="st-dek">Positions are judgments: median scores from ${panel.architects} architects and ${panel.owners} business owners</p>
<figure class="st-fig" style="top:200px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · architecture review, September; scores are panel judgments, not measurements</span><span>Quadrant chart</span></p>`,
};
