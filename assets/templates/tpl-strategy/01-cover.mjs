// Template: 戦略提案（経営会議向け）· 表紙. Synthetic example content; replace data and copy.
// Type only: client, title, one-line scope, then date and team below a single accent hairline.
const ID = 'tpl-strategy-cover';
const deck = {
  client: '株式会社青柳リビング',              // 提出先（御中を付ける）
  kind: '最終報告',                            // 資料の種類
  meeting: '経営会議',                         // 提出する場
  title: 'EC事業の収益改善に向けた戦略提案',
  target: {year: 2029, margin: 6},              // 到達目標：営業利益率（%）
  date: '2026年11月18日',
  firm: '白峰パートナーズ',
  team: ['井上 遼', '高田 美咲', '森 健太郎'],  // 担当チーム
  classification: '社外秘',
};

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Strategy proposal cover: improving the profitability of the e-commerce business',
  notes: 'Purpose: 誰に、何の提案を、いつ・どの場で出すのかを一目で伝える。結論は次のページから。\nModify: deck の提出先・題名・到達目標（年度と利益率）・日付・会社名・担当者・機密区分を差し替える。題名は2行以内に収める。\nInvariant: 表紙に図や飾りを置かない。到達目標の数字は推奨案のページ（2029年度 6.0%）と一致させる。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-strategy st-cover',
  content: `<p class="st-client" data-region="support">${deck.client}　御中</p>
<p class="st-kind">${deck.kind}</p>
<h1 data-region="title">${deck.title}</h1>
<p class="st-lead" data-region="primary">${deck.target.year}年度に営業利益率${deck.target.margin}%を実現するための<span class="st-nw">打ち手と実行計画</span></p>
<div class="st-line" aria-hidden="true"></div>
<p class="st-meta" style="left:64px">${deck.date}<span>${deck.meeting}</span></p>
<p class="st-meta" style="left:456px">${deck.firm}<span>${deck.team.join('・')}</span></p>
<p class="st-meta" style="left:946px">${deck.classification}<span>無断での複製・転送を禁じます</span></p>`,
};
