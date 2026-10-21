// Template: 学会発表（日本語） · まとめ（貢献・限界・今後）. Synthetic example content; replace data and copy.
// The close states the claim and its limit in one line, then three short lists. Every number repeats
// the result and ablation pages exactly — keep `facts` identical to those data blocks.
const ID = 'tpl-research-ja-conclusion';
const facts = {
  labeled: 50, oursIoU: 63.8,             // 04-result: 提案法 at 50 labels
  matchN: 200, matchIoU: 63.5,            // 04-result: 教師あり学習 at the matching label count
  breaksSup: 7.8, breaksOurs: 1.9,        // 05-ablation: breaks per image
  trainBridges: 3, testBridges: 1,        // 02-background / 04-result
  structure: '鉄筋コンクリート床版',
};
const bridges = facts.trainBridges + facts.testBridges;
const lists = {
  contributions: [
    `擬似ラベルを<b>2段のしきい値</b>で作り、<span class="nw">幅1画素の細い枝まで</span>途切れさせずに学習に使えるようにした。`,
    `ラベル${facts.labeled}枚で<b class="nw">IoU ${facts.oursIoU}%</b>。<span class="nw">教師あり学習の${facts.matchN}枚（${facts.matchIoU}%）</span>と同じ水準で、途切れは<span class="nw">1枚あたり${facts.breaksSup}か所</span>から<b class="nw">${facts.breaksOurs}か所</b>に減った。`,
  ],
  limits: [
    `確かめたのは${facts.structure}の${bridges}橋だけ。鋼部材や舗装では試していない。`,
    '幅1画素より細いひび割れは、正解そのものが<span class="nw">作業者によって揺れる。</span>',
  ],
  next: [
    '別の管理者が撮った点検画像で外部検証する。',
    `どの${facts.labeled}枚に正解を付けるかを、予測の不確かさから選ぶ。`,
  ],
};
const contact = { name: '高瀬 美緒', aff: '潮見台大学 大学院情報学研究科' };
const list = items => `<ul>${items.map(t => `<li>${t}</li>`).join('')}</ul>`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Conclusion: contributions, limitations and next steps',
  notes: 'Purpose: 発表の締め。主張とその適用範囲を見出しの一文で言い切り、貢献・限界・今後を短い箇条で残す。\nModify: facts の数値を結果・アブレーションのページと同じ値にする（ここだけ別の数を書かない）。lists の各項目は1〜2行に収め、2項目ずつにとどめる。contact を発表者に替える。\nInvariant: 貢献には条件（ラベル枚数・比較相手）と数値を添える。限界は貢献と同じ大きさの文字で書き、注記に押し込まない。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-research-ja rj-conclusion',
  content: `<h1 class="rj-h" data-region="title">正解${facts.labeled}枚から始められる。<span class="nw">ただし確かめたのは${bridges}橋の床版だけ</span></h1>
<section class="rj-col rj-main" style="left:64px;top:184px;width:554px" data-region="primary"><h2>貢献</h2>${list(lists.contributions)}</section>
<section class="rj-col" style="left:652px;top:184px;width:564px" data-region="support"><h2>限界</h2>${list(lists.limits)}</section>
<section class="rj-col" style="left:652px;top:420px;width:564px" data-region="support"><h2>今後</h2>${list(lists.next)}</section>
<footer class="rj-foot"><span>${contact.name}　${contact.aff}</span><b>6</b></footer>`,
};
