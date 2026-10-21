// Interaction study · Decision tree — the go/no-go rule for an outdoor festival, followed from the forecast (Japanese page).
// The widget (kind 'decision') walks `tree` with the selected answers and lights the path it takes;
// the headline walks the same tree here with tomorrow's forecast.
const questions = [
  { id: 'warning', label: '気象警報（前日17時）', name: '気象警報', options: [['none', 'なし', '出ていない'], ['issued', '大雨・暴風警報が出ている', '出ている']] },
  { id: 'wind', label: '最大風速の予報', name: '最大風速', options: [['calm', '10 m/s未満'], ['strong', '10 m/s以上']] },
  { id: 'rain', label: '降水確率（当日午前）', name: '降水確率', options: [['low', '30%以下'], ['mid', '40〜50%'], ['high', '60%以上']] },
];
const tree = {
  ask: 'warning', branches: {
    issued: { result: '中止し、翌週の土曜に延期する' },
    none: { ask: 'wind', branches: {
      strong: { result: '露店とテントをやめ、式典だけ体育館で行う' },
      calm: { ask: 'rain', branches: {
        low: { result: '予定どおり河川敷で開催する' },
        mid: { result: '河川敷で開催し、雨よけテントを追加する' },
        high: { result: '会場を体育館に移して縮小開催する' },
      } },
    } },
  },
};
const forecast = { warning: 'none', wind: 'calm', rain: 'mid' };        // 4月3日17時発表の予報（架空）
const walk = (node, a) => (node.result ? node.result : walk(node.branches[a[node.ask]], a));
const decided = walk(tree, forecast);
const label = (q, v) => questions.find(x => x.id === q).options.find(o => o[0] === v)[1];
const ID = 'interaction-decision';

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Decision tree: festival go/no-go from the weather forecast',
  notes: `Purpose: 実行委員会が前日に決める開催判断を、予報の三つの条件から一本の道筋としてたどれるようにする。条件を変えると、どの枝に移るかがその場で分かる。
Modify: \`questions\`（選択肢つき）と \`tree\`（ask で質問、branches で枝、result で結論）を差し替え、\`forecast\` を実際の予報にする。見出しの結論は同じ木をたどって計算される。
Invariant: すべての枝と結論を常に描き、選ばれた道筋だけを強調色にする。質問の順序は木の深さどおりで、使われない質問（警報が出ているときの風速など）は道筋に入らない。
Static: 書き出しは見出しと同じ予報（降水確率${label('rain', forecast.rain)}、風速${label('wind', forecast.wind)}）の道筋を示す。`,
  sources: [{ type: 'original-example', file: 'assets/interactions/decision.mjs' }],
  exportPolicy: 'final',
  className: 'st cs-sakura-spring',
  content: `<h1 class="st-head">降水確率${label('rain', forecast.rain)}の予報なら、さくら祭りは${decided}</h1>
<p class="st-dek">川辺町さくら祭り実行委員会（架空）の開催基準。4月3日17時発表の予報で判断する。</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>架空の基準 · 警報、風速、降水確率の順に判断する</span><span>操作 · 判断の分岐</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'decision',
    initial: { ...forecast },
    data: { questions, tree, resultWidth: 260 },
    text: { reset: '元に戻す', status: 'この条件では：{result}。', figure: '開催判断の分岐図' },
  }],
};
