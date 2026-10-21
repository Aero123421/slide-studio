// Template: 講義・社内研修（日本語） · まとめ（3つの要点＋式）. Synthetic example content; replace data and copy.
// The formula is the centrepiece, set as a real fraction; two worked cases from this lesson sit beside it.
// The three points restate what was learned (not the goals from page 1) and end with what to do at work.
const ID = 'tpl-lecture-summary';
const formula = { left: '加重平均', top: '（値 × 重み）の合計', bottom: '重みの合計' };
const cases = [                        // [what is averaged, how] — the two cases used in this lesson
  ['客単価', '売上の合計 ÷ 客数の合計'],
  ['購入率', '購入した人の合計 ÷ 来店客の合計'],
];
const points = [
  '店ごとの平均を、そのまま平均しない。客の少ない店まで同じ重さで数えてしまう。',
  '割る前に、分子と分母をそれぞれの合計に戻す。重みは自然に正しく入る。',
  '資料の平均値は、何を重みにした平均かを確かめてから読む。',
];
const next = { session: '第4回', title: '中央値と外れ値' };

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Summary: three points and the weighted-average formula',
  notes: 'Purpose: 講義の要点を3つと式1つに絞り、明日の仕事で使う確かめ方として持ち帰らせる。次回につなぐ。\nModify: formula・cases・points・next を書き換える。cases にはこの回で実際に計算した例だけを入れる。要点は1行に収まる長さにする。\nInvariant: 要点は3つまで、1枚目の目標の順（説明する→計算する→確かめる）に対応させるが、同じ文は繰り返さない。式は分数の形で、言葉で書く。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-lecture lx-p-summary',
  content: `<h1 class="lx-h" data-region="title">平均をまとめるときは、合計どうしを割る</h1>
<div class="lx-formula" data-region="primary"><span>${formula.left}</span><span>=</span><span class="lx-frac"><span>${formula.top}</span><span>${formula.bottom}</span></span></div>
<table class="lx-cases" data-region="support"><tbody>${cases.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</tbody></table>
<ol class="lx-points" style="top:372px" data-region="support">${points.map((p, i) => `<li><i>${i + 1}</i><span>${p}</span></li>`).join('')}</ol>
<p class="lx-next" data-region="support"><b>次回</b><span class="nw">${next.session}</span>　${next.title}</p>
<footer class="lx-foot"><span>データ読み解き基礎　第3回　平均の落とし穴</span><b>6</b></footer>`,
};
