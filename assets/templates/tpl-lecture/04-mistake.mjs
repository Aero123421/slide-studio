// Template: 講義・社内研修（日本語） · よくある誤り（平均の平均 vs 加重平均を同じ尺度で）. Synthetic example content; replace data and copy.
// Two number lines on ONE scale: above, every store weighs the same (1 store = 1 square) and balances at
// the plain average of the store averages; below, every `unit` customers weigh the same and the line
// balances at the weighted average. The offset between the two balance points is the error, in 円.
import { el, linear, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-lecture-mistake';
const stores = [                       // same stores as pages 2–3
  { name: '駅前店', price: 1200, people: 500 },
  { name: '住宅街店', price: 1500, people: 200 },
  { name: '郊外店', price: 2400, people: 100 },
];
const unit = 100;                      // one filled square = 100 people
const domain = [1000, 2600];

// ---- derived
const people = stores.reduce((a, s) => a + s.people, 0);
const sales = stores.reduce((a, s) => a + s.price * s.people, 0);
const weighted = sales / people;
const plain = stores.reduce((a, s) => a + s.price, 0) / stores.length;
const gap = plain - weighted, gapPct = gap / weighted * 100;
const small = [...stores].sort((a, b) => a.people - b.people)[0], big = [...stores].sort((a, b) => b.people - a.people)[0];
const yen = v => fmt(v, { locale: 'ja', digits: 0 });

// ---- drawing: right-hand figure, columns 6–12 (645 px); labels for each line sit at the left
const W = 645, H = 396, sq = 32, sp = 4;
const x = linear(domain, [16, W - 16]);
const lineTop = 62, lineBot = 320;
const tri = (v, y, fill) => el('path', { d: `M${x(v)} ${y + 1}L${x(v) + 13} ${y + 26}H${x(v) - 13}Z`, fill });
const parts = [];
// store names once, above the upper line (both lines share the same positions)
for (const s of stores) parts.push(el('text', { x: x(s.price), y: 16, 'text-anchor': 'middle', class: 's-axis' }, s.name));
for (const y0 of [lineTop, lineBot]) {
  parts.push(el('line', { x1: 0, x2: W, y1: y0, y2: y0, stroke: 'var(--lx-ink)', 'stroke-width': 2 }));
  for (let v = domain[0]; v <= domain[1]; v += 200) parts.push(el('line', { x1: x(v), x2: x(v), y1: y0, y2: y0 + 7, stroke: 'var(--lx-ink)', 'stroke-width': 1.5 }));
}
// upper: one hollow square per store
for (const s of stores) parts.push(el('rect', { x: x(s.price) - sq / 2 + 1, y: lineTop - 2 - sq + 1, width: sq - 2, height: sq - 2, fill: 'none', stroke: 'var(--lx-weight)', 'stroke-width': 2 }));
// lower: one filled square per `unit` customers
for (const s of stores) for (let k = 0; k < s.people / unit; k++) parts.push(el('rect', { x: x(s.price) - sq / 2, y: lineBot - 2 - (k + 1) * sq - k * sp, width: sq, height: sq, fill: 'var(--lx-weight)' }));
// balance points
parts.push(tri(plain, lineTop, 'var(--lx-shu)'), el('text', { x: x(plain), y: lineTop + 58, 'text-anchor': 'middle', class: 's-big s-shu' }, `${yen(plain)}円`));
parts.push(tri(weighted, lineBot, 'var(--lx-ai)'));
// the error: guides from both balance points to one dimension line between the two number lines
const dimY = 140;
parts.push(
  el('line', { x1: x(plain), x2: x(plain), y1: lineTop + 68, y2: dimY, stroke: 'var(--lx-shu)', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }),
  el('line', { x1: x(weighted), x2: x(weighted), y1: lineBot - 2, y2: dimY, stroke: 'var(--lx-ai)', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }),
  el('path', { d: `M${x(weighted)} ${dimY - 8}V${dimY + 8}M${x(weighted)} ${dimY}H${x(plain)}M${x(plain)} ${dimY - 8}V${dimY + 8}`, stroke: 'var(--lx-ink)', 'stroke-width': 1.5, fill: 'none' }),
  el('text', { x: (x(weighted) + x(plain)) / 2, y: dimY + 28, 'text-anchor': 'middle', class: 's-name' }, `${yen(gap)}円`));
// scale labels on the lower line only, kept off the balance point
for (let v = domain[0]; v <= domain[1]; v += 200) if (Math.abs(x(v) - x(weighted)) > 40) parts.push(el('text', { x: x(v), y: lineBot + 34, 'text-anchor': 'middle', class: 's-axis' }, yen(v)));
parts.push(el('text', { x: x(weighted), y: lineBot + 62, 'text-anchor': 'middle', class: 's-big s-ai' }, `${yen(weighted)}円`),
  el('text', { x: W, y: lineBot + 70, 'text-anchor': 'end', class: 's-axis' }, '客単価（円）'));
const fig = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">平均の平均と加重平均を、同じ目盛の数直線で比べた図</title>
<desc id="${ID}-d">上の数直線では3店を1つずつ同じ重さで置き、つり合いの点は${yen(plain)}円。下では${unit}人を1つとして${stores.map(s => `${s.name}に${s.people / unit}つ`).join('、')}置き、つり合いの点は${yen(weighted)}円。差は${yen(gap)}円。</desc>
${parts.join('')}
</svg>`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Common mistake: averaging the store averages overstates spend per customer by 275 yen',
  notes: `Purpose: よくある誤り（店ごとの平均をそのまま平均する）と正しい計算を、同じ目盛の上で並べ、ずれの大きさと原因を一目で示す。\nModify: stores と unit を書き換えると、上下の重り・つり合いの点・差の円と割合が再計算される。上の数直線は「1店＝1つ」、下は「${unit}人＝1つ」のまま使う。\nInvariant: 上下の数直線は同じ範囲・同じ目盛。誤りの値だけ朱、正しい値だけ藍。誤りを責めず、「何を同じ重さとして数えたか」の違いとして説明する。\nStatic: 静的ページ。`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-lecture lx-p-mistake',
  content: `<h1 class="lx-h" data-region="title">店の平均を平均すると<span class="nw">${yen(plain)}円</span>。実際の客単価より<span class="nw">${yen(gap)}円</span>高く出る</h1>
<div class="lx-side" style="top:208px" data-region="support">
  <h2 class="shu">平均の平均</h2>
  <p>${small.people}人の${small.name}も、${big.people}人の${big.name}も同じ1つ</p>
  <p class="lx-f">(${stores.map(s => yen(s.price)).join(' + ')}) ÷ ${stores.length} = ${yen(plain)}円</p>
</div>
<div class="lx-side" style="top:416px" data-region="support">
  <h2 class="ai">加重平均</h2>
  <p>客数${unit}人ごとに1つと数える</p>
  <p class="lx-f">${yen(sales)}円 ÷ ${yen(people)}人 = ${yen(weighted)}円</p>
</div>
<figure class="lx-fig" style="left:555px;top:208px" data-region="primary">${fig}</figure>
<footer class="lx-foot"><span>データ読み解き基礎　第3回　平均の落とし穴</span><b>4</b></footer>`,
};
