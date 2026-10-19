// Motion study · Roll up countable units — one square per bus. Build 0 shows the units by
// year; build 1 moves every unit (same element, computed translation) into one block in
// chronological order and replaces the per-year counts with the labelled total, counted up.
import { svgRoot, el, g, textLines, theme as makeTheme } from '../runtime/figure.mjs';

const added = [ // 架空の市営バスに導入した電気バス、台（年度）— illustrative
  { fy: 2021, buses: 6 }, { fy: 2022, buses: 14 }, { fy: 2023, buses: 22 }, { fy: 2024, buses: 31 }, { fy: 2025, buses: 48 },
];
const fleet = 318; // 市営バスの総保有台数（2025年度末）
const total = added.reduce((s, d) => s + d.buses, 0);
const share = Math.round((total / fleet) * 100);
const lastYear = added.at(-1);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470;
  const s = 22, cell = 18; // unit pitch and square size, px
  const perRow = 4, colStep = 196, base = 392, x0 = 128; // year columns: 4 units wide, stacked upward
  const side = Math.ceil(Math.sqrt(fleet)); // the rolled-up block is the whole fleet, filled in order
  const bx = 176, by = (H - side * s) / 2;
  const cellAt = k => [bx + (k % side) * s, by + Math.floor(k / side) * s];
  let k = 0;
  const units = [];
  added.forEach((d, j) => {
    for (let i = 0; i < d.buses; i++, k++) {
      const ax = x0 + j * colStep + (i % perRow) * s, ay = base - (Math.floor(i / perRow) + 1) * s;
      const [tx, ty] = cellAt(k);
      units.push(el('rect', { x: ax, y: ay, width: cell, height: cell, rx: 2.5, fill: t.c('accent'),
        // data-states cannot be delayed, so later units take a little longer: they arrive in order
        'data-states': { 0: { translate: '0px 0px' }, 1: { translate: `${(tx - ax).toFixed(1)}px ${(ty - ay).toFixed(1)}px` } },
        'data-duration': Math.round(650 + (k / total) * 450), 'data-easing': 'smooth', style: 'transform-box:view-box' }));
    }
  });
  const rest = Array.from({ length: fleet - total }, (_, i) => { const [cx, cy] = cellAt(total + i); return el('rect', { x: cx, y: cy, width: cell, height: cell, rx: 2.5, fill: t.c('context') }); });
  const nx = bx + side * s + 56;
  return svgRoot({ id: 'motion-numeric-rollup-fig', width: W, height: H, theme: t,
    title: `電気バスの導入台数（${added[0].fy}〜${lastYear.fy}年度）、1マス1台`,
    desc: `${added.map(d => `${d.fy}年度${d.buses}台`).join('、')}。合計${total}台で、市営バス全${fleet}台の${share}%。` },
  // build 0: units by year, each column labelled with its count
  g({ 'data-step': 0, 'data-until': 0 },
    added.map((d, j) => g({},
      textLines([`${d.buses}台`], { x: x0 + j * colStep + (perRow * s - (s - cell)) / 2, y: base - Math.ceil(d.buses / perRow) * s - 12, size: 18, weight: 700, anchor: 'middle', fill: t.c('ink') }),
      textLines([`${d.fy}年度`], { x: x0 + j * colStep + (perRow * s - (s - cell)) / 2, y: base + 12, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') }))),
    el('line', { x1: x0 - 24, x2: x0 + (added.length - 1) * colStep + perRow * s + 20, y1: base + 2, y2: base + 2, stroke: t.c('rule') }),
    textLines(['電気バス　1マス＝1台'], { x: x0 - 24, y: 40, size: 16, fill: t.c('muted'), valign: 'top' })),
  // build 1: the rest of the fleet appears around the electric buses, so the share is visible
  g({ 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 700, 'data-duration': 600 }, rest),
  units,
  // the total replaces the per-year counts; the unit rides in a tspan so the count only touches the digits
  // (the group holds the number back until the moving units have cleared its place)
  g({ 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 650, 'data-duration': 250 },
    el('text', { x: nx, y: H / 2 + 30, 'font-size': 132, 'font-weight': 700, fill: t.c('accent'), 'letter-spacing': '-0.03em', 'font-variant-numeric': 'tabular-nums',
      'data-step': 1, 'data-motion': 'count', 'data-delay': 650, 'data-duration': 900 }, String(total), el('tspan', { 'font-size': 48, dx: 10, 'letter-spacing': 0 }, '台'))),
  textLines([`${added[0].fy}〜${lastYear.fy}年度に導入した電気バス`, `市営バス全${fleet}台の${share}%`], { x: nx + 4, y: H / 2 + 66, size: 20, fill: t.c('ink'), valign: 'top', lineHeight: 1.5,
    attrs: { 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 900 } }),
  textLines([`灰色：ほかの${fleet - total}台`, '1マス＝1台'], { x: nx + 4, y: by + side * s, size: 16, fill: t.c('muted'), valign: 'bottom', lineHeight: 1.4,
    attrs: { 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 900 } }));
}

export default {
  study: true,
  id: 'motion-numeric-rollup',
  language: 'ja',
  title: 'Numeric rollup: countable units become one labelled total',
  className: 'st cs-wa-ai',
  notes: 'Purpose: Show a total as the sum of countable units, then replace the per-group counts with one labelled number, while the units themselves stay visible.\nModify: Replace `added` (one unit per item) and `fleet`; unit positions, the block size, the total, the share and the headline recompute. Keep one unit = one item; for large counts, let one unit stand for a round number and say so.\nInvariant: Every unit is the same element in both builds; it travels to the block in chronological order; the total is the count of the units on screen; the number counts up to its committed value (data-motion="count").\nStatic: The final build shows the block of units, the total and its share. Export build 0 as an extra page if the yearly breakdown must be in print.',
  sources: [{ type: 'original-example', file: 'assets/motion/numeric-rollup.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="word-break:auto-phrase">市営バスの電気バスは${added.length}年で<em>${total}台</em>に。全${fleet}台のうち${share}%が電気で走る</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 架空の市の交通局、各年度末</span><span>モーション · 個数を合計に置き換える（1ビルド）</span></p>`,
};
