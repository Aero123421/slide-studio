// Motion study · Split then recombine — the parts of one price leave the stacked bar to be
// compared on a common baseline, then return. Both layouts share one scale, so each part
// keeps its exact length: only position changes. Builds: 1 split, 2 recombine + share.
import { svgRoot, el, g, textLines, measureText, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const parts = [ // what a household pays per kWh, cents, in bill order (illustrative, 2026 tariff)
  { name: 'Wholesale energy', cents: 11.8 },
  { name: 'Network charges', cents: 9.6 },
  { name: 'Taxes and levies', cents: 3.3 },
  { name: 'Supplier costs and margin', cents: 1.7 },
  { name: 'VAT', cents: 5.0 },
];
const focus = 'Wholesale energy';
const total = parts.reduce((s, p) => s + p.cents, 0);
const focusPart = parts.find(p => p.name === focus);
const focusShare = Math.round((focusPart.cents / total) * 100);
const cents = v => `${fmt(v, { digits: 1 })}¢`;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'motion-split-merge-fig';
  const k = (W - 70) / total, barH = 64, mergedY = 196, size = 17;
  // Layout A (merged): consecutive segments. A label sits inside its segment when it fits;
  // otherwise above it, ending at the segment's right edge, one tier higher (with a leader)
  // whenever it would collide with a placed label or its leader would cut through one.
  let acc = 0;
  const merged = parts.map(p => { const x = acc * k; acc += p.cents; return { x, w: p.cents * k }; });
  const labelOf = p => `${p.name} · ${cents(p.cents)}`;
  const placed = [];
  const free = (tier, l, r) => !placed.some(q => q.tier === tier && l < q.right + 16 && r > q.left - 16);
  const clearBelow = (tier, x) => !placed.some(q => q.tier >= 0 && q.tier < tier && x > q.left - 6 && x < q.right + 6);
  const mergedLabel = parts.map((p, i) => {
    const w = measureText(labelOf(p), size, { weight: 600 }), m = merged[i];
    if (p.name !== focus && w + 24 <= m.w) return { x: m.x + 12, y: mergedY + barH / 2 + 6, tier: -1 };
    for (let tier = 0; ; tier++) for (const left of [m.x + m.w - 6 - w, m.x + 6]) {
      const lead = left === m.x + 6 ? left : m.x + m.w - 6;
      if (left >= 0 && left + w <= W && free(tier, left, left + w) && clearBelow(tier, lead)) { placed.push({ tier, left, right: left + w }); return { x: left, y: mergedY - 18 - tier * 30, tier, lead }; }
    }
  });
  // Layout B (split): one row per part, largest first, all starting at zero on the same scale.
  const order = [...parts].sort((a, b) => b.cents - a.cents);
  const rowY = p => 6 + order.indexOf(p) * 80;
  const items = parts.map((p, i) => {
    const m = merged[i], lab = mergedLabel[i], hot = p.name === focus;
    const dx = -m.x, dy = rowY(p) - mergedY;
    const move = (to) => ({ 'data-states': { 0: { translate: '0px 0px' }, 1: { translate: to }, 2: { translate: '0px 0px' } }, 'data-duration': 900, 'data-easing': 'smooth' });
    return g({},
      g(move(`${dx}px ${dy}px`), el('rect', { x: m.x, y: mergedY, width: m.w, height: barH, fill: hot ? t.c('accent') : t.c('context'), stroke: t.c('paper'), 'stroke-width': 2 })),
      // Each label travels with its part: from the stacked bar to just after the end of its row.
      g(move(`${m.w + 14 - lab.x}px ${rowY(p) + barH / 2 + 6 - lab.y}px`),
        lab.tier > 0 ? g({ 'data-states': { 0: { opacity: 1 }, 1: { opacity: 0 }, 2: { opacity: 1 } }, 'data-duration': 300 },
          el('line', { x1: lab.lead, x2: lab.lead, y1: lab.y + 6, y2: mergedY - 2, stroke: t.c('muted'), 'stroke-width': 1.2 })) : '',
        textLines([labelOf(p)], { x: lab.x, y: lab.y, size, weight: 600, fill: hot ? t.c('accent') : t.c('ink') })));
  });
  // Recombined: the share of the focus part and of everything else, under the bar.
  const fx = merged[parts.indexOf(focusPart)], restW = total * k - fx.w;
  const share = g({ 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 700 },
    el('path', { d: `M${fx.x + 2} ${mergedY + barH + 12}v10H${fx.x + fx.w - 2}v-10`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 1.6 }),
    textLines([`${focusShare}% of the price`], { x: fx.x + 2, y: mergedY + barH + 48, size: 20, weight: 700, fill: t.c('accent') }),
    el('path', { d: `M${fx.x + fx.w + 2} ${mergedY + barH + 12}v10H${fx.x + fx.w + restW - 2}v-10`, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.6 }),
    textLines([`${100 - focusShare}%: networks, taxes and supply`], { x: fx.x + fx.w + 6, y: mergedY + barH + 48, size: 20, weight: 600, fill: t.c('muted') }));
  return svgRoot({ id, width: W, height: H, theme: t,
    title: `Components of a ${cents(total)} household kilowatt-hour, stacked, then compared, then recombined`,
    desc: `${parts.map(p => `${p.name} ${cents(p.cents)}`).join(', ')}; total ${cents(total)}. ${focus} is ${focusShare}% of the price; network charges are nearly as large.` },
  g({ 'data-states': { 0: { opacity: 1 }, 1: { opacity: 0 }, 2: { opacity: 1 } }, 'data-duration': 400 },
    textLines([`${cents(total)} per kWh`], { x: total * k, y: mergedY + barH + 48, size: 20, weight: 700, anchor: 'end', fill: t.c('ink') })),
  // One ruler serves both layouts: that is what makes the comparison honest.
  g({}, el('line', { x1: 0, x2: total * k, y1: 418, y2: 418, stroke: t.c('rule'), 'stroke-width': 1.4 }),
    Array.from({ length: Math.floor(total / 5) + 1 }, (_, i) => i * 5).map(v => g({},
      el('line', { x1: v * k, x2: v * k, y1: 412, y2: 424, stroke: t.c('rule'), 'stroke-width': 1.4 }),
      textLines([`${v}¢`], { x: v * k, y: 432, size: 15, anchor: v ? 'middle' : 'start', valign: 'top', fill: t.c('muted') })))),
  items, share,
  g({ 'data-step': 1, 'data-until': 1, 'data-motion': 'reveal', 'data-delay': 600 },
    textLines([`Same parts, same scale: together ${cents(total)}`], { x: W, y: 400, size: 17, anchor: 'end', fill: t.c('muted') })));
}

export default {
  study: true,
  id: 'motion-split-merge',
  title: 'Split then recombine',
  className: 'st cs-sustainability-moss',
  notes: 'Purpose: Show multiple representations of a preserved subject: the parts of one price are split out for comparison, then put back.\nModify: Replace `parts` (keep bill order) and `focus`; the shared scale, both layouts, label tiers, the share and the headline are computed.\nInvariant: One scale for both layouts, so every part keeps its length; each part and its label move as one item; the recombined bar adds up to the same total.\nStatic: The final build is the recombined bar with the share annotated. If the comparison view matters on its own, export build 1 as an extra page.',
  sources: [{ type: 'original-example', file: 'assets/motion/split-merge.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Wholesale energy is only <em>${focusShare}%</em> of a ${cents(total)} household kilowatt-hour</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · average household tariff, cents per kWh including VAT</span><span>Motion · split to compare, recombine to sum (2 builds)</span></p>`,
};
