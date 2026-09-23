// Template: 学会・研究発表 · 結論と限界・今後. Synthetic example content; replace data and copy.
const ID = 'tpl-research-ja-conclusion';
// Numbers repeated from the result and ablation pages; keep them identical to those data arrays.
const r = { miou: 66.1, lo: 64.2, hi: 68.0, full: 71.8, breaksBase: 7.8, breaksProp: 2.4, bridges: 3, evalImages: 600 };
const gap = (r.full - r.miou).toFixed(1);
// recap strip: mIoU at 50 labels with 95% CI (same values as the result page)
const recap = [
  { name: '教師ありのみ（50枚）', m: 54.6, lo: 51.9, hi: 57.3, col: '#7d828c' },
  { name: '提案法（50枚）', m: r.miou, lo: r.lo, hi: r.hi, col: '#b2432a' },
  { name: '全ラベル（2,400枚）', m: r.full, lo: 71.1, hi: 72.5, col: '#1c2433' }
];
const X = { min: 50, max: 75, x0: 150, x1: 1130 };
const sx = v => X.x0 + (v - X.min) / (X.max - X.min) * (X.x1 - X.x0);
let ticks = '';
for (let v = X.min; v <= X.max; v += 5) ticks += `<line x1="${sx(v)}" y1="58" x2="${sx(v)}" y2="64" stroke="#1c2433" stroke-width="1"/><text x="${sx(v)}" y="82" text-anchor="middle" class="s-axis">${v}</text>`;
const pts = recap.map((p, i) => `<line x1="${sx(p.lo)}" y1="40" x2="${sx(p.hi)}" y2="40" stroke="${p.col}" stroke-width="2.4"/><circle cx="${sx(p.m)}" cy="40" r="7" fill="${p.col}" stroke="#f6f3ea" stroke-width="2"/><text x="${[sx(p.m), sx(p.m) + 8, X.x1][i]}" y="20" text-anchor="${i ? 'end' : 'middle'}" class="s-lab">${p.name}　<tspan class="s-num-b">${p.m.toFixed(1)}</tspan></text>`).join('');
const strip = `<svg viewBox="0 0 1152 92" role="img" aria-labelledby="${ID}-t ${ID}-d"><title id="${ID}-t">ラベル50枚時点の mIoU の比較</title><desc id="${ID}-d">教師ありのみ${recap[0].m}%、提案法${recap[1].m}%、全ラベル学習${recap[2].m}%を95%信頼区間とともに一本の目盛上に示す。提案法と全ラベル学習の差は${gap}ポイント。</desc>
<text x="0" y="45" class="s-lab-b">mIoU（%）</text><text x="0" y="66" class="s-lab-s">点＝平均・線＝95%CI</text>
<line x1="${X.x0}" y1="58" x2="${X.x1}" y2="58" stroke="#1c2433" stroke-width="1"/>${ticks}
<text x="${(sx(r.hi) + sx(71.1)) / 2}" y="45" text-anchor="middle" class="s-lab-b">差 ${gap} pt</text>
${pts}</svg>`;

export default {
  study: true,
  id: ID,
  title: '結論と限界・今後の課題',
  language: 'ja',
  notes: 'Purpose: 発表の締め。結論（数値つき）、限界（適用範囲の外側）、今後の課題を並べ、最後に持ち帰ってほしい一文で終える。\nModify: r の数値は結果・アブレーションのページと同じ値にする。各列の項目は2〜3個に絞る。連絡先は実際の所属に合わせる。\nInvariant: 結論には条件（ラベル枚数・評価データ）を添える。限界は結論と同じ重みで見せ、小さな注記に押し込まない。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-research-ja rj-conclusion',
  content: `<div class="rj-page">
<header class="rj-head"><span class="rj-sec"><span class="rj-secno">§5</span><b>まとめ</b></span><span>構造物画像解析シンポジウム 2026　口頭発表 B-3</span></header>
<h1 class="rj-title" data-region="title">50枚で全ラベルに迫るが、検証はまだ${r.bridges}橋の床版に限られる</h1>
<div class="rj-concl" data-region="primary">
  <section class="rj-col"><div class="rj-colhead"><h2>結論</h2><span>Findings</span></div><ul>
    <li>ラベル50枚の提案法は mIoU <span class="rj-num">${r.miou}</span>%（95%CI <span class="rj-num">${r.lo}</span>〜<span class="rj-num">${r.hi}</span>）。全ラベル学習（<span class="rj-num">${r.full}</span>%）との差は<b><span class="rj-num">${gap}</span>ポイント</b>。</li>
    <li>事前学習と連結性損失の効果は重なり合い、途切れ数は1枚あたり<span class="rj-num">${r.breaksBase}</span>箇所から<b><span class="rj-num">${r.breaksProp}</span>箇所</b>に減った。</li>
  </ul></section>
  <section class="rj-col rj-lim"><div class="rj-colhead"><h2>限界</h2><span>Limitations</span></div><ul>
    <li>評価は${r.bridges}橋・<span class="rj-num">${r.evalImages}</span>枚の床版画像のみ。橋脚や鋼部材では確かめていない。</li>
    <li>幅1画素未満のひび割れは、正解ラベル自体が不確か。</li>
    <li>λ の選び方で mIoU と連結性が入れ替わる。用途ごとの決め方はまだない。</li>
  </ul></section>
  <section class="rj-col rj-next"><div class="rj-colhead"><h2>今後</h2><span>Next</span></div><ul>
    <li>部材や撮影条件の異なるデータで外部検証する。</li>
    <li>能動学習で、ラベルを付ける50枚の選び方を改善する。</li>
    <li>ひび割れ幅の推定まで広げ、補修の判断に使える指標にする。</li>
  </ul></section>
</div>
<figure class="rj-fig" style="left:64px;top:470px;width:1152px;height:92px" data-region="support">${strip}</figure>
<div class="rj-take" data-region="support"><p>ラベルを増やす前に、未ラベル画像と「線はつながる」という知識を使い切る。</p><span class="rj-contact">高瀬 美緒　潮見台大学 大学院情報学研究科</span></div>
<footer class="rj-foot" data-region="source"><span>架空データによる例示</span><span class="rj-folio">6 / 6</span></footer>
</div>`
};
