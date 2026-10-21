// Template: 講義・社内研修（日本語） · 考え方（数直線上のつり合いの点）. Synthetic example content; replace data and copy.
// Each store's customers are stacked as unit squares (1 square = `unit` people) at the store's price on a
// real number line. The balance point is computed (Σ price × people ÷ Σ people) and the moment check
// under it proves the balance with the same numbers.
import { el, linear, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-lecture-concept';
const stores = [                       // price: 客単価 (円), people: 客数 (人, one month)
  { name: '駅前店', price: 1200, people: 500 },
  { name: '住宅街店', price: 1500, people: 200 },
  { name: '郊外店', price: 2400, people: 100 },
];
const unit = 100;                      // one square = 100 people
const domain = [1000, 2600];           // number-line range (円), ticks every 200

// ---- derived
const people = stores.reduce((a, s) => a + s.people, 0);
const sales = stores.reduce((a, s) => a + s.price * s.people, 0);
const mean = sales / people;                                    // the balance point
const left = stores.filter(s => s.price < mean), right = stores.filter(s => s.price > mean);
const moment = s => Math.abs(s.price - mean) * s.people;
const sum = list => list.reduce((a, s) => a + moment(s), 0);
const heavy = [...stores].sort((a, b) => b.people - a.people)[0];
const yen = v => fmt(v, { locale: 'ja', digits: 0 });

// ---- drawing (1:1 on the slide; 18–22 px labels)
const W = 1120, H = 404, base = 300, sq = 44, gap = 4;
const x = linear(domain, [30, 1090]);
const ticks = []; for (let v = domain[0]; v <= domain[1]; v += 200) ticks.push(v);
const near = v => Math.abs(x(v) - x(mean)) < 52;                // keep tick labels off the balance point
const parts = [];
parts.push(el('line', { x1: 0, x2: W, y1: base, y2: base, stroke: 'var(--lx-ink)', 'stroke-width': 2 }));
for (const v of ticks) {
  parts.push(el('line', { x1: x(v), x2: x(v), y1: base, y2: base + 8, stroke: 'var(--lx-ink)', 'stroke-width': 1.5 }));
  if (!near(v)) parts.push(el('text', { x: x(v), y: base + 34, 'text-anchor': 'middle', class: 's-axis' }, yen(v)));
}
parts.push(el('text', { x: W, y: base + 70, 'text-anchor': 'end', class: 's-axis' }, '客単価（円）'));
for (const s of stores) {
  const n = s.people / unit, cx = x(s.price);
  for (let k = 0; k < n; k++) parts.push(el('rect', { x: cx - sq / 2, y: base - 2 - (k + 1) * sq - k * gap, width: sq, height: sq, fill: 'var(--lx-weight)' }));
  const top = base - 2 - n * sq - (n - 1) * gap;
  parts.push(el('text', { x: cx, y: top - 42, 'text-anchor': 'middle', class: 's-name' }, s.name),
    el('text', { x: cx, y: top - 14, 'text-anchor': 'middle', class: 's-lab' }, `${yen(s.price)}円・${yen(s.people)}人`));
}
const fx = x(mean);
parts.push(el('path', { d: `M${fx} ${base + 1}L${fx + 15} ${base + 30}H${fx - 15}Z`, fill: 'var(--lx-ai)' }),
  el('text', { x: fx, y: base + 62, 'text-anchor': 'middle', class: 's-big s-ai' }, `${yen(mean)}円`),
  el('text', { x: fx, y: base + 92, 'text-anchor': 'middle', class: 's-lab s-ai' }, 'つり合いの点'));
// unit key, set directly beside the single square of the smallest stack
const lone = [...stores].sort((a, b) => a.people - b.people)[0];
parts.push(el('text', { x: x(lone.price) + sq / 2 + 12, y: base - 2 - sq / 2 + 6, class: 's-lab' }, `1つ＝${unit}人`));
const fig = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">客単価の数直線に客数を重りとして積んだ図。つり合いの点は${yen(mean)}円</title>
<desc id="${ID}-d">${stores.map(s => `${s.name}は${yen(s.price)}円の位置に${s.people / unit}個（${s.people}人）`).join('、')}を積む。1個は${unit}人。つり合いの点は${yen(mean)}円で、客の多い${heavy.name}の側に寄る。</desc>
${parts.join('')}
</svg>`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Concept: the weighted average is the balance point of customers stacked on a price line',
  notes: `Purpose: 加重平均を「客数を重りにしたときのつり合いの点」として一枚の図で理解させる。式の前に、位置と重さの直観を作る。\nModify: stores（客単価と客数）と unit を書き換えると、積む個数・つり合いの点・確かめの式がすべて再計算される。客数は unit の倍数にする。範囲 domain は全店の客単価が入るように広げる。\nInvariant: 横軸は等間隔の目盛の数直線。重りは1個＝${unit}人の同じ大きさの四角で、店の客単価の位置に積む。つり合いの点だけを藍色にし、計算した値の位置に置く。\nStatic: 静的ページ。`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-lecture lx-p-concept',
  content: `<h1 class="lx-h" data-region="title">加重平均は、客数を重りにして数直線に置いたときの<span class="nw">つり合いの点</span></h1>
<figure class="lx-fig" style="left:80px;top:208px" data-region="primary">${fig}</figure>
<div class="lx-check" style="left:555px;top:204px;width:645px" data-region="support">
  <p class="lx-lead">客の多い${heavy.name}の側に、<span class="nw">つり合いの点が寄る。</span></p>
  <p class="lx-proof">確かめ：（つり合いの点からの距離）×（人数）が左右で等しい</p>
  <p class="lx-eq"><span>左</span>${left.map(s => `${yen(mean - s.price)}円 × ${yen(s.people)}人`).join(' + ')} = ${yen(sum(left))}</p>
  <p class="lx-eq"><span>右</span>${right.map(s => `${yen(s.price - mean)}円 × ${yen(s.people)}人`).join(' + ')} = ${yen(sum(right))}</p>
</div>
<footer class="lx-foot"><span>データ読み解き基礎　第3回　平均の落とし穴</span><b>2</b></footer>`,
};
