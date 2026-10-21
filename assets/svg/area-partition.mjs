// Diagram study · Area partition — one rectangle is the whole; tiles divide it in exact proportion.
// A squarified layout (Bruls, Huizing & van Wijk) computed here: tile areas equal value shares exactly,
// and labels adapt to the room each tile has. Everything comes from `categories`.
import { svgRoot, el, g, textLines, measureText, wrapText, blockWidth, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const categories = [ // revenue by product category, fiscal 2025, € billion (illustrative)
  { label: 'Handbags', value: 1.21 },
  { label: 'Ready-to-wear', value: 0.84 },
  { label: 'Jewellery', value: 0.71 },
  { label: 'Fragrance and beauty', value: 0.42 },
  { label: 'Watches', value: 0.38 },
  { label: 'Small leather goods', value: 0.33 },
  { label: 'Shoes', value: 0.19 },
  { label: 'Luggage', value: 0.12 },
];
const total = categories.reduce((s, c) => s + c.value, 0);
const ranked = [...categories].sort((a, b) => b.value - a.value);
const [first, second] = ranked;
const share = c => c.value / total;
const eur = v => fmt(v, { prefix: '€', digits: 2, suffix: 'bn' });
const roundedSum = categories.reduce((s, c) => s + Math.round(share(c) * 100), 0); // labels are rounded; the areas are not

/** Squarified treemap: rows are added along the short side while the worst aspect ratio improves. */
function squarify(items, box) {
  const out = [], worst = (row, side) => {
    const s = row.reduce((a, r) => a + r.area, 0), hi = Math.max(...row.map(r => r.area)), lo = Math.min(...row.map(r => r.area));
    return Math.max((side * side * hi) / (s * s), (s * s) / (side * side * lo));
  };
  let rest = [...items], b = { ...box };
  while (rest.length) {
    const side = Math.min(b.w, b.h);
    let row = [rest[0]];
    while (row.length < rest.length && worst([...row, rest[row.length]], side) <= worst(row, side)) row = [...row, rest[row.length]];
    const sum = row.reduce((a, r) => a + r.area, 0);
    if (b.w >= b.h) { // column on the left
      const w = sum / b.h; let y = b.y;
      for (const r of row) { const h = r.area / w; out.push({ ...r, x: b.x, y, w, h }); y += h; }
      b = { x: b.x + w, y: b.y, w: b.w - w, h: b.h };
    } else { // row along the top
      const h = sum / b.w; let x = b.x;
      for (const r of row) { const w = r.area / h; out.push({ ...r, x, y: b.y, w, h }); x += w; }
      b = { x: b.x, y: b.y + h, w: b.w, h: b.h - h };
    }
    rest = rest.slice(row.length);
  }
  return out;
}

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, box = { x: 0, y: 34, w: W, h: H - 34 };
  const tiles = squarify(ranked.map(c => ({ ...c, area: share(c) * box.w * box.h })), box);
  const tile = c => {
    const hl = c.label === first.label, ink = hl ? t.c('onAccent') : t.c('ink'), soft = hl ? t.c('onAccent') : t.c('muted');
    const pad = 14, room = c.w - 2 * pad, bottom = c.y + c.h - 10, big = hl ? 44 : 26;
    const pct = fmt(share(c) * 100, { digits: 0, suffix: '%' }), name = wrapText(c.label, room, 17, { weight: 700 });
    const lines = [];
    let y = c.y + 12;
    // Labels take only the room a tile has: share first, then name (up to two lines), then value.
    if (measureText(pct, big, { weight: 700 }) <= room && y + big <= bottom) {
      lines.push(textLines([pct], { x: c.x + pad, y, size: big, valign: 'top', fill: ink, weight: 700, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
      y += big + 12;
    }
    if (name.length <= 2 && blockWidth(name, 17, { weight: 700 }) <= room && y + name.length * 21 <= bottom) {
      lines.push(textLines(name, { x: c.x + pad, y, size: 17, valign: 'top', fill: ink, weight: 700, lineHeight: 1.22 }));
      y += name.length * 21 + 4;
      if (y + 18 <= bottom) lines.push(textLines([eur(c.value)], { x: c.x + pad, y, size: 15, valign: 'top', fill: soft, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
    }
    return g({ class: 'ss-tile' },
      el('rect', { x: c.x, y: c.y, width: c.w, height: c.h, fill: hl ? t.c('accent') : t.c('surface'), stroke: t.c('paper'), 'stroke-width': 3 }),
      lines);
  };
  return svgRoot({ id: 'area-partition-fig', width: W, height: H, theme: t,
    title: 'Revenue by product category, fiscal 2025, as an area partition of the total',
    desc: `The rectangle is all revenue, ${eur(total)}. Each tile's area is its exact share: ${ranked.map(c => `${c.label} ${fmt(share(c) * 100, { digits: 0 })}%`).join(', ')}.` },
  textLines([`All revenue, fiscal 2025: ${eur(total)}`], { x: 0, y: 14, size: 17, valign: 'middle', fill: t.c('ink'), weight: 700 }),
  textLines(['Tile area = share of revenue'], { x: W, y: 14, size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') }),
  tiles.map(tile),
  el('rect', { x: box.x + 1, y: box.y + 1, width: box.w - 2, height: box.h - 2, fill: 'none', stroke: t.c('ink'), 'stroke-width': 2 }));
}

export default {
  study: true,
  id: 'area-partition',
  title: 'Area partition: part and whole share one boundary',
  className: 'st cs-luxury-noir',
  notes: 'Purpose: Show the composition of one total compactly, with the outer boundary standing for the whole and every tile an exact share of it.\nModify: Replace `categories`. The squarified layout, the labels that fit each tile, the accented largest part and the headline recompute; small tiles drop the value line before they drop the share.\nInvariant: Tile areas are computed from the data, never adjusted to make labels fit; the total is printed on the boundary; gutters are strokes, so they do not change any area.\nStatic: Already static. Use a bar chart instead when parts must be compared precisely.',
  sources: [{ type: 'original-example', file: 'assets/svg/area-partition.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">One category, <em>${first.label.toLowerCase()}</em>, earns ${fmt(share(first) * 100, { digits: 0 })}% of revenue, more than all of ${second.label.toLowerCase()}</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · group revenue by product category, fiscal 2025${roundedSum !== 100 ? `; rounded shares sum to ${roundedSum}%` : ''}</span><span>Area partition (squarified treemap)</span></p>`,
};
