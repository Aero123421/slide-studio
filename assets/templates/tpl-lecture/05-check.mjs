// Template: 講義・社内研修（日本語） · 確認問題（4択、build 1 で正解と理由）. Synthetic example content; replace data and copy.
// Same structure as the lesson (a rate is an average weighted by its denominator), new context.
// Every choice is a computed value with a named reason; build 1 rings the answer, names each wrong
// choice's mistake, and shows the balance point on a percentage line with the same unit squares.
import { el, linear, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-lecture-check';
const stores = [                       // visitors: 来店客 (人), rate: 購入率 (share who bought)
  { name: '駅前店', visitors: 800, rate: 0.5 },
  { name: '郊外店', visitors: 200, rate: 0.8 },
];
const unit = 100;                      // one square = 100 visitors (same unit as pages 2–4)

// ---- derived: the answer and three tempting wrong answers, each from a real mistake
const visitors = stores.reduce((a, s) => a + s.visitors, 0);
const buyers = stores.map(s => s.visitors * s.rate);
const answer = buyers.reduce((a, b) => a + b, 0) / visitors;
const big = [...stores].sort((a, b) => b.visitors - a.visitors)[0];
const candidates = [
  { v: answer, why: '正解', ok: true },
  { v: stores.reduce((a, s) => a + s.rate, 0) / stores.length, why: '平均の平均', plain: true },
  { v: stores.reduce((a, s, i) => a + s.rate * stores[stores.length - 1 - i].visitors, 0) / visitors, why: '重みを逆にした値' },
  { v: big.rate, why: `${big.name}だけの値` },
].sort((a, b) => a.v - b.v);
const kana = ['ア', 'イ', 'ウ', 'エ'];
candidates.forEach((c, i) => { c.k = kana[i]; });
const right = candidates.find(c => c.ok), plain = candidates.find(c => c.plain);
const pct = v => `${Math.round(v * 100)}%`;
const n0 = v => fmt(v, { locale: 'ja', digits: 0 });

// ---- reveal figure: percentage line with the visitors stacked as unit squares
const W = 500, H = 196, base = 138, sq = 14, sp = 2;
const x = linear([0.4, 0.9], [24, W - 56]);
const parts = [el('line', { x1: 0, x2: W, y1: base, y2: base, stroke: 'var(--lx-ink)', 'stroke-width': 2 })];
for (let v = 0.4; v <= 0.9001; v += 0.1) {
  parts.push(el('line', { x1: x(v), x2: x(v), y1: base, y2: base + 7, stroke: 'var(--lx-ink)', 'stroke-width': 1.5 }));
  if (Math.abs(x(v) - x(answer)) > 46) parts.push(el('text', { x: x(v), y: base + 30, 'text-anchor': 'middle', class: 's-axis' }, pct(v)));
}
stores.forEach(s => {
  const k = s.visitors / unit;
  for (let j = 0; j < k; j++) parts.push(el('rect', { x: x(s.rate) - sq / 2, y: base - 2 - (j + 1) * sq - j * sp, width: sq, height: sq, fill: 'var(--lx-weight)' }));
  parts.push(el('text', { x: x(s.rate) + sq / 2 + 8, y: base - 8, class: 's-axis' }, `${s.name} ${n0(s.visitors)}人`));
});
parts.push(el('path', { d: `M${x(answer)} ${base + 1}L${x(answer) + 11} ${base + 22}H${x(answer) - 11}Z`, fill: 'var(--lx-ai)' }),
  el('text', { x: x(answer), y: base + 52, 'text-anchor': 'middle', class: 's-big s-ai' }, pct(answer)));
const fig = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">購入率の数直線に来店客を重りとして積んだ図。つり合いの点は${pct(answer)}</title>
<desc id="${ID}-d">${stores.map(s => `${s.name}の${n0(s.visitors)}人を${pct(s.rate)}の位置に${s.visitors / unit}つ`).join('、')}積むと、${pct(answer)}でつり合う。1つは${unit}人。</desc>
${parts.join('')}
</svg>`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Check question: the combined purchase rate of two stores, with a reveal',
  notes: `Purpose: 学んだ考え方（合計 ÷ 合計）を、客単価ではなく購入率という別の場面で使えるか、その場で確かめる。\nModify: stores の来店客と購入率を書き換えると、正解と3つの誤答（平均の平均・重みの取り違え・大きい店だけ）が計算し直され、小さい順にア〜エが振られる。値が重なる場合は来店客か率を変える。\nInvariant: 誤答はすべて実際に起きる誤りから計算する。解答では各選択肢の誤りに名前を付ける。正解だけ藍、平均の平均だけ朱。\nStatic: 1回目のクリックで正解の囲みと各選択肢の理由、つり合いの図と式が現れる。最終状態（PDF）では解答まで読める。答えを隠した配布にしたい場合は、このページを解答の前後2枚に分ける。`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-lecture lx-p-check',
  content: `<h1 class="lx-h" data-region="title">2店を合わせた購入率は、ア〜エのどれか</h1>
<table class="lx-data" data-region="support">
<thead><tr><th>店</th><th>来店客</th><th>購入率</th></tr></thead>
<tbody>${stores.map(s => `<tr><td>${s.name}</td><td>${n0(s.visitors)}<small>人</small></td><td>${pct(s.rate)}</td></tr>`).join('')}</tbody>
</table>
<ol class="lx-choices" data-region="primary">${candidates.map(c => `<li><i>${c.k}</i><b>${pct(c.v)}</b>${c.ok ? '<span class="mark" aria-hidden="true" data-step="1" data-motion="reveal"></span>' : ''}<small class="${c.ok ? 'ai' : c.plain ? 'shu' : ''}" data-step="1" data-motion="reveal">${c.why}</small></li>`).join('')}</ol>
<figure class="lx-fig" style="left:80px;top:${616 - H}px" data-step="1" data-motion="reveal" data-region="support">${fig}</figure>
<div class="lx-reveal" data-step="1" data-motion="reveal" data-region="support">
  <p class="lx-proof">購入した人の合計 ÷ 来店客の合計</p>
  <p class="lx-res">(${buyers.map(n0).join(' + ')}) ÷ ${n0(visitors)} = <b>${pct(answer)}</b></p>
  <p class="lx-proof"><span class="shu">${plain.k}の${pct(plain.v)}</span>は${stores.length}店の率を足して${stores.length}で割った値。${stores.map(s => `${n0(s.visitors)}人の${s.name}`).join('と')}を同じ重さで数えている</p>
</div>
<footer class="lx-foot"><span>データ読み解き基礎　第3回　平均の落とし穴</span><b>5</b></footer>`,
};
