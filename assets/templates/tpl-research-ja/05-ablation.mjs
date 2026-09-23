// Template: 学会・研究発表 · アブレーション表. Synthetic example content; replace data and copy.
const ID = 'tpl-research-ja-ablation';
// One source of truth. All rows: 50 labeled images, the same 5 seeds, the same 600 evaluation images.
const runs = 5, tCrit = 2.776; // t(0.975, df = 4)
const ref = { id: 'D', name: '提案法', pre: true, conn: true, lambda: 0.3, miou: 66.1, sd: 1.5, cldice: 75.8, breaks: 2.4 };
const groups = [
  { title: '構成要素を外す', rows: [
    { id: 'C', name: '連結性損失なし', pre: true, conn: false, miou: 61.9, sd: 1.8, cldice: 66.0, breaks: 5.6 },
    { id: 'B', name: '事前学習なし', pre: false, conn: true, lambda: 0.3, miou: 57.0, sd: 2.0, cldice: 68.4, breaks: 4.9 },
    { id: 'A', name: '両方なし（教師ありのみ）', pre: false, conn: false, miou: 54.6, sd: 2.2, cldice: 61.2, breaks: 7.8 }
  ] },
  { title: '連結性損失の重み λ を変える', rows: [
    { id: 'D1', name: '連結性損失を弱く', pre: true, conn: true, lambda: 0.1, miou: 64.0, sd: 1.6, cldice: 71.2, breaks: 3.6 },
    { id: 'D2', name: '連結性損失を強く', pre: true, conn: true, lambda: 1.0, miou: 63.8, sd: 1.7, cldice: 77.1, breaks: 2.1 }
  ] }
];
const ci = r => { const h = tCrit * r.sd / Math.sqrt(runs); return [r.miou - h, r.miou + h]; };
const f1 = v => v.toFixed(1);
const signed = v => Math.abs(v) < 0.05 ? '±0.0' : (v > 0 ? '+' : '−') + Math.abs(v).toFixed(1);
// inline interval strip: one shared scale for every row
const S = { min: 50, max: 70, w: 200, h: 30 };
const sx = v => 8 + (v - S.min) / (S.max - S.min) * (S.w - 16);
function strip(r, isRef, k) {
  const [lo, hi] = ci(r);
  const col = isRef ? '#b2432a' : '#1c2433';
  let s = `<svg width="${S.w}" height="${S.h}" viewBox="0 0 ${S.w} ${S.h}" role="img" aria-labelledby="${ID}-s${k}"><title id="${ID}-s${k}">${r.name}：mIoU ${f1(r.miou)}%、95%信頼区間 ${f1(lo)}〜${f1(hi)}%</title>`;
  for (let v = S.min; v <= S.max; v += 5) s += `<line x1="${sx(v)}" y1="4" x2="${sx(v)}" y2="${S.h - 4}" stroke="#e2dccd" stroke-width="1"/>`;
  s += `<line x1="${sx(ref.miou)}" y1="1" x2="${sx(ref.miou)}" y2="${S.h - 1}" stroke="#b2432a" stroke-width="1" stroke-dasharray="3 2"/>`;
  s += `<line x1="${sx(lo)}" y1="${S.h / 2}" x2="${sx(hi)}" y2="${S.h / 2}" stroke="${col}" stroke-width="2"/>`;
  s += `<circle cx="${sx(r.miou)}" cy="${S.h / 2}" r="5" fill="${col}" stroke="#f6f3ea" stroke-width="2"/></svg>`;
  return s;
}
const dot = on => `<span class="${on ? 'rj-yes' : 'rj-no'}" role="img" aria-label="${on ? 'あり' : 'なし'}"></span>`;
let k = 0;
function row(r, isRef) {
  const [lo, hi] = ci(r);
  const d = r.miou - ref.miou, dc = r.cldice - ref.cldice, db = r.breaks - ref.breaks;
  const cls = v => (Math.abs(v) < 0.05 ? '' : v < 0 ? ' rj-neg' : ' rj-pos');
  const lam = r.conn ? `<span class="rj-num">${r.lambda.toFixed(1)}</span>` : '—';
  return `<tr${isRef ? ' class="rj-full"' : ''}><td class="rj-id">${r.id}</td><td>${r.name}</td><td class="rj-c">${dot(r.pre)}</td><td class="rj-c">${dot(r.conn)}</td><td class="rj-c">${lam}</td>
<td class="rj-r">${f1(r.miou)} <span class="rj-ci">［${f1(lo)}, ${f1(hi)}］</span></td><td class="rj-r${isRef ? '' : cls(d)}">${isRef ? '基準' : signed(d)}</td><td>${strip(r, isRef, k++)}</td>
<td class="rj-r">${f1(r.cldice)}${isRef ? '' : ` <span class="rj-ci${cls(dc)}">${signed(dc)}</span>`}</td><td class="rj-r">${f1(r.breaks)}${isRef ? '' : ` <span class="rj-ci${cls(-db)}">${signed(db)}</span>`}</td></tr>`;
}
const body = row(ref, true) + groups.map(g => `<tr class="rj-grp"><td></td><td colspan="9">${g.title}</td></tr>` + g.rows.map(r => row(r, false)).join('')).join('');
const axis = `<svg width="${S.w}" height="18" viewBox="0 0 ${S.w} 18" aria-hidden="true">${[50, 55, 60, 65, 70].map(v => `<text x="${sx(v)}" y="13" text-anchor="middle" class="s-axis">${v}</text>`).join('')}</svg>`;

export default {
  study: true,
  id: ID,
  title: 'アブレーション：事前学習と連結性損失の寄与',
  language: 'ja',
  notes: 'Purpose: 構成要素を1つずつ外した結果と、ハイパーパラメータの感度を1枚の表で比べる。\nModify: ref と groups の各行（mIoU の平均・SD、clDice、途切れ数）を書き換える。区間・差・区間図は同じ値から計算される。行を増やす場合は groups に追加する。\nInvariant: 全行の条件（ラベル枚数・シード・評価データ）を表の下に明記する。差の向き（各行 − 提案法）を列見出しに書く。区間図は全行で同じ目盛を使う。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-research-ja rj-ablation',
  content: `<div class="rj-page">
<header class="rj-head"><span class="rj-sec"><span class="rj-secno">§4</span><b>アブレーション</b></span><span>構造物画像解析シンポジウム 2026　口頭発表 B-3</span></header>
<h1 class="rj-title" data-region="title">事前学習は面積の精度を、連結性損失は途切れを主に改善する</h1>
<table class="rj-table" data-region="primary">
<thead>
<tr><th rowspan="2"></th><th rowspan="2">構成</th><th rowspan="2" class="rj-c">事前<br>学習</th><th rowspan="2" class="rj-c">連結性<br>損失</th><th rowspan="2" class="rj-c">λ</th><th class="rj-r">mIoU（%）<br>平均［95%CI］</th><th class="rj-r">差（pt）<br>各行 − 提案法</th><th>mIoU の区間（%）</th><th class="rj-r">clDice（%）<br>と差</th><th class="rj-r">途切れ数<br>（箇所／枚）と差</th></tr>
<tr><th style="padding-top:0"></th><th style="padding-top:0"></th><th style="padding:0 10px 6px">${axis}</th><th style="padding-top:0"></th><th style="padding-top:0"></th></tr>
</thead>
<tbody>${body}</tbody>
</table>
<p class="rj-tnote" data-region="support">全行ともラベル50枚・同じ5シード・評価画像600枚。mIoU は5シードの平均と95%信頼区間（t分布、自由度4）。clDice と途切れ数は5シードの平均。途切れ数は、正解では1本につながっているひび割れが予測で分断された箇所の数。差の色は、提案法より悪い方向を朱、良い方向を青で示す。</p>
<footer class="rj-foot" data-region="source"><span>架空データによる例示</span><span class="rj-folio">5 / 6</span></footer>
</div>`
};
