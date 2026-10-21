// Template: 講義・社内研修（日本語） · 例題（位置をそろえた計算の手順）. Synthetic example content; replace data and copy.
// A calculation table whose columns line up like hand arithmetic, and the three steps written beside the
// rows they act on. Builds: 0 the data · 1 each store's sales · 2 the totals · 3 the division and answer.
const ID = 'tpl-lecture-example';
const stores = [                       // same three stores as the concept page
  { name: '駅前店', price: 1200, people: 500 },
  { name: '住宅街店', price: 1500, people: 200 },
  { name: '郊外店', price: 2400, people: 100 },
];
const steps = [                        // [what to do, how]
  ['店ごとの売上を出す', '客単価 × 客数'],
  ['売上と客数をそれぞれ合計する', '3店ぶんを縦に足す'],
  ['合計どうしを割る', '売上の合計 ÷ 客数の合計'],
];

// ---- derived
const rows = stores.map(s => ({ ...s, sales: s.price * s.people }));
const people = rows.reduce((a, r) => a + r.people, 0);
const sales = rows.reduce((a, r) => a + r.sales, 0);
const answer = sales / people;
const n = v => Math.round(v).toLocaleString('ja-JP');

// ---- geometry: table rows are 56 px, so each step can sit on the rows it explains
const top = 208, headH = 37, rowH = 56;
const rowTop = k => top + headH + k * rowH;                       // k = 0..2 stores, 3 = total
const ansTop = rowTop(4) + 44;
const stepTop = [rowTop(0) + 8, rowTop(3) + 8, ansTop + 2];
const at = (step, html) => `<span data-step="${step}" data-motion="reveal">${html}</span>`;
const body = rows.map(r => `<tr><td>${r.name}</td><td>${n(r.price)}<small>円</small></td><td class="op">${at(1, '×')}</td><td>${n(r.people)}<small>人</small></td><td class="op">${at(1, '=')}</td><td>${at(1, `${n(r.sales)}<small>円</small>`)}</td></tr>`).join('')
  + `<tr class="sum"><td>合計</td><td></td><td class="op"></td><td>${at(2, `${n(people)}<small>人</small>`)}</td><td class="op"></td><td>${at(2, `${n(sales)}<small>円</small>`)}</td></tr>`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Worked example: combine three stores’ average spend from total sales and total customers',
  notes: `Purpose: 加重平均の計算手順を、受講者が電卓で追える速さで一段ずつ見せる。手順の文と、その手順が作る数字を同じ高さに置く。\nModify: stores（店名・客単価・客数）を書き換えると、売上・合計・答えが再計算される。steps の文は「何をするか」を動詞で書く。\nInvariant: 数字は右そろえで桁をそろえ、演算子は独立した列に置く。途中の式を省かない。答えは単位つきで、藍色はこの答えだけ。\nStatic: クリックごとに 手順1（各店の売上）→ 手順2（合計）→ 手順3（割り算と答え）が現れる。最終状態ではすべての式と答えが読める。`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-lecture lx-p-example',
  content: `<h1 class="lx-h" data-region="title">3店をまとめた客単価は、<span class="nw">売上の合計を客数の合計で割って</span>求める</h1>
<ol class="lx-steps" style="top:0" data-region="support">${steps.map(([what, how], i) => `<li data-step="${i + 1}" data-motion="reveal" style="top:${stepTop[i]}px"><i>${i + 1}</i><span>${what}<small>${how}</small></span></li>`).join('')}</ol>
<table class="lx-calc" style="top:${top}px" data-region="primary">
<thead><tr><th>店</th><th>客単価</th><th></th><th>客数</th><th></th><th>売上</th></tr></thead>
<tbody>${body}</tbody>
</table>
<p class="lx-answer" style="top:${ansTop}px" data-step="3" data-motion="reveal" data-region="primary">${n(sales)}<small>円</small> ÷ ${n(people)}<small>人</small> = <b>${n(answer)}<small>円</small></b></p>
<footer class="lx-foot"><span>データ読み解き基礎　第3回　平均の落とし穴</span><b>3</b></footer>`,
};
