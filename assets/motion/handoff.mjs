// Motion study · Transfer an object — one order card moves between owners, one handoff
// per build. The card is a single element whose translate states are computed from the
// owners' bays; the custody bars below are computed from the same scan times.
import { svgRoot, el, g, textLines, linear, theme as makeTheme } from '../runtime/figure.mjs';

const order = { id: 'A-30418', items: 3, kg: 4.2 };
// Custody from scan to scan, one weekday morning (illustrative). The last owner has no end.
const custody = [
  { owner: 'Pick', where: 'Zone C, aisle 14', in: '09:12', out: '09:31' },
  { owner: 'Pack', where: 'Station 4', in: '09:31', out: '09:44' },
  { owner: 'Dock 2', where: 'Outbound door', in: '09:44', out: '11:18' },
  { owner: 'Carrier', where: 'Northline Freight', in: '11:18' },
];
const min = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const held = custody.filter(c => c.out).map(c => ({ ...c, minutes: min(c.out) - min(c.in) }));
const longest = [...held].sort((a, b) => b.minutes - a.minutes)[0];
const inBuilding = min(custody.at(-1).in) - min(custody[0].in);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'motion-handoff-fig';
  const gap = 28, colW = (W - gap * (custody.length - 1)) / custody.length, colX = i => i * (colW + gap);
  const bayY = 62, bayH = 168, cardW = 214, cardH = 92;
  const cardAt = i => ({ x: colX(i) + (colW - cardW) / 2 - 6, y: bayY + 24 });

  // One floor, partitioned by owner. Each partition line is a handoff; its scan time appears
  // in the build where the card crosses it, and "held … min" when that custody closes.
  const floor = el('rect', { x: 0, y: bayY, width: W, height: bayH, rx: 12, fill: t.c('surface'), stroke: t.c('rule'), 'stroke-width': 1.2 });
  const bays = custody.map((c, i) => g({},
    textLines([c.owner], { x: colX(i), y: 0, size: 20, weight: 700, valign: 'top', fill: t.c('ink') }),
    textLines([c.where], { x: colX(i), y: 28, size: 16, valign: 'top', fill: t.c('muted') }),
    i ? g({}, el('line', { x1: colX(i) - gap / 2, x2: colX(i) - gap / 2, y1: bayY + 12, y2: bayY + bayH - 12, stroke: t.c('muted'), 'stroke-width': 1.4, 'stroke-dasharray': '4 5' }),
      g({ 'data-step': i, 'data-motion': 'reveal', 'data-delay': 500 },
        el('rect', { x: colX(i) - gap / 2 - 30, y: bayY + bayH - 34, width: 60, height: 24, rx: 4, fill: t.c('surface') }),
        textLines([c.in], { x: colX(i) - gap / 2, y: bayY + bayH - 22, size: 16, weight: 700, anchor: 'middle', valign: 'middle', fill: t.c('ink') }))) : '',
    c.out ? g({ 'data-step': i + 1, 'data-motion': 'reveal', 'data-delay': 600 },
      textLines([`held ${min(c.out) - min(c.in)} min`], { x: colX(i) + 40, y: bayY + bayH - 16, size: 16, weight: 600, fill: c === longest ? t.c('accent') : t.c('muted') }))
      : g({ 'data-step': i, 'data-motion': 'reveal', 'data-delay': 600 },
        textLines(['left the building'], { x: colX(i) + 40, y: bayY + bayH - 16, size: 16, weight: 600, fill: t.c('muted') }))));

  // The order card: ONE element, translated from bay to bay.
  const home = cardAt(0);
  const states = Object.fromEntries(custody.map((_, i) => [i, { translate: `${cardAt(i).x - home.x}px 0px` }]));
  const card = g({ 'data-states': states, 'data-duration': 850, 'data-easing': 'smooth' },
    el('rect', { x: home.x, y: home.y, width: cardW, height: cardH, rx: 10, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 2 }),
    textLines([`Order ${order.id}`], { x: home.x + 18, y: home.y + 34, size: 21, weight: 700, fill: t.c('ink') }),
    textLines([`${order.items} items · ${order.kg} kg`], { x: home.x + 18, y: home.y + 64, size: 16, fill: t.c('muted') }));

  // Custody timeline: one bar per closed custody, on a shared clock.
  const t0 = Math.floor(min(custody[0].in) / 30) * 30, t1 = Math.ceil(min(custody.at(-1).in) / 30) * 30;
  const x = linear([t0, t1], [0, W]), barY = 362, barH = 40;
  const ticks = Array.from({ length: (t1 - t0) / 30 + 1 }, (_, k) => t0 + k * 30);
  const clock = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const bars = held.map((c, i) => {
    const x0 = x(min(c.in)), x1 = x(min(c.out)), hot = c === longest, inside = x1 - x0 > 160;
    const label = `${c.owner} ${c.minutes} min`;
    return g({},
      g({ 'data-step': i + 1, 'data-motion': 'grow-x', 'data-duration': 600, 'data-delay': 250, class: 'st-origin-left' },
        el('rect', { x: x0, y: barY, width: x1 - x0 - 2, height: barH, rx: 3, fill: hot ? t.c('accent') : t.c('context') })),
      g({ 'data-step': i + 1, 'data-motion': 'reveal', 'data-delay': 700 },
        inside ? textLines([label], { x: x0 + 14, y: barY + barH / 2, size: 17, weight: 700, valign: 'middle', fill: hot ? t.c('onAccent') : t.c('ink') })
          : textLines([label], { x: x0, y: barY - 12, size: 16, weight: 600, fill: t.c('ink') })));
  });
  return svgRoot({ id, width: W, height: H, theme: t,
    title: `Custody of order ${order.id} from picking to the carrier`,
    desc: `The order passes ${custody.map(c => c.owner).join(' → ')}. It was held ${held.map(c => `${c.minutes} min by ${c.owner}`).join(', ')}; ${longest.minutes} of its ${inBuilding} minutes in the building were spent at ${longest.owner}.` },
  floor, bays,
  card,
  g({}, el('line', { x1: x(min(custody[0].in)), x2: x(min(custody[0].in)), y1: barY - 8, y2: barY + barH + 6, stroke: t.c('ink'), 'stroke-width': 2 }),
    textLines([`received ${custody[0].in}`], { x: x(min(custody[0].in)) + 8, y: barY + barH / 2, size: 16, valign: 'middle', fill: t.c('muted'), attrs: { 'data-step': 0, 'data-until': 0 } })),
  textLines(['Custody by scan time'], { x: 0, y: barY - 52, size: 16, weight: 700, fill: t.c('muted') }),
  ticks.map(m => g({}, el('line', { x1: x(m), x2: x(m), y1: barY - 4, y2: barY + barH + 6, stroke: t.c('grid') }),
    textLines([clock(m)], { x: Math.min(Math.max(x(m), 22), W - 22), y: barY + barH + 14, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') }))),
  bars,
  g({ 'data-step': custody.length - 1, 'data-motion': 'reveal', 'data-delay': 900 },
    textLines([`${inBuilding} min in the building`], { x: x(min(custody.at(-1).in)) - 4, y: barY - 12, size: 16, weight: 600, anchor: 'end', fill: t.c('ink') })));
}

export default {
  study: true,
  id: 'motion-handoff',
  title: 'Transfer an object',
  className: 'st cs-manufacturing-plant',
  notes: 'Purpose: Move the same object between owners so custody, not just position, is what changes.\nModify: Replace `order` and `custody` (owner, place, scan times). Bay positions, the card\'s translate states, the custody bars and the headline numbers are computed from them.\nInvariant: One card element travels; it is never redrawn in the next bay. Each owner\'s holding time appears only when that custody closes; times share one clock.\nStatic: The final build shows the card with the carrier and every custody bar. Earlier positions are recoverable from the bars and their scan times.',
  sources: [{ type: 'original-example', file: 'assets/motion/handoff.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Order ${order.id} spent ${longest.minutes} of its ${inBuilding} minutes in the building waiting at <em>${longest.owner}</em></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · scan events for one order, Tuesday morning shift</span><span>Motion · one object handed between owners (${custody.length - 1} builds)</span></p>`,
};
