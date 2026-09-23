// Template: プロジェクト定例・進捗報告 · RACI表. Synthetic example content; replace data and copy.
// 各行の A（説明責任者）がちょうど1名かを計算で確認し、列ごとの R の件数も集計します。
const P = 'tpl-project-status-raci';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const meta = { project: 'MINATO', name: '受発注システム刷新', meeting: '第14回 定例', date: '2026年9月23日（水）' };

const roles = [
  { id: 'pm', label: 'PM' }, { id: 'biz', label: '業務<br>リード' }, { id: 'dev', label: '開発<br>リード' }, { id: 'qa', label: 'QA<br>リード' },
  { id: 'infra', label: 'インフラ<br>担当' }, { id: 'vendor', label: '委託先' }, { id: 'cio', label: '情シス<br>部長' }
];
// 値: A=説明責任, R=実行責任, AR=両方, C=相談, I=報告. key=本番移行に直結する行
const tasks = [
  { name: '要件変更の承認', pm: 'R', biz: 'C', dev: 'I', vendor: 'I', cio: 'A' },
  { name: '詳細設計のレビュー', pm: 'I', biz: 'C', dev: 'A', qa: 'C', vendor: 'R' },
  { name: '結合テスト計画', pm: 'A', biz: 'I', dev: 'C', qa: 'R', vendor: 'C' },
  { name: 'テスト環境の構築', dev: 'A', qa: 'I', infra: 'R', vendor: 'C' },
  { name: '本番環境の構築', pm: 'I', dev: 'A', infra: 'R', vendor: 'C', key: true },
  { name: '不具合の優先度判断', pm: 'A', biz: 'C', dev: 'C', qa: 'R', vendor: 'I' },
  { name: '移行データの検証', pm: 'A', biz: 'R', dev: 'I', qa: 'C', infra: 'C' },
  { name: '利用者研修', pm: 'I', biz: 'AR', qa: 'C' },
  { name: '本番移行の実施', pm: 'A', biz: 'I', dev: 'R', infra: 'R', vendor: 'C', key: true },
  { name: '本番稼働の判定', pm: 'R', biz: 'C', dev: 'C', qa: 'C', infra: 'I', vendor: 'I', cio: 'A', key: true }
];

const cell = v => v ? `<span class="ps-cell is-${v}">${v === 'AR' ? 'A/R' : v}</span>` : '<span class="ps-none" role="img" aria-label="なし"></span>';
const aCount = t => roles.filter(r => /A/.test(t[r.id] || '')).length;
const rCount = roles.map(r => tasks.filter(t => /R/.test(t[r.id] || '')).length);
const maxR = Math.max(...rCount), busiest = roles[rCount.indexOf(maxR)];
const busiestName = busiest.label.replace('<br>', '');
const busiestTasks = tasks.filter(t => /R/.test(t[busiest.id] || '')).map(t => t.name);
const tie = rCount.filter(n => n === maxR).length > 1;

const head = `<tr><th>作業</th>${roles.map(r => `<th>${r.label}</th>`).join('')}<th>A＝1名</th></tr>`;
const body = tasks.map((t, i) => {
  const n = aCount(t);
  return `<tr class="${t.key ? 'is-key' : ''}"><td><b>${i + 1}</b>${esc(t.name)}</td>${roles.map(r => `<td>${cell(t[r.id])}</td>`).join('')}
  <td>${n === 1 ? '<span class="ps-check"><svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>OK</span>' : `<span class="ps-check" style="color:var(--ps-r)">A×${n}</span>`}</td></tr>`;
}).join('');
const foot = `<tr><td>R（実行）の件数</td>${rCount.map(n => `<td class="${n === maxR ? 'is-hot' : ''}">${n}</td>`).join('')}<td></td></tr>`;

const logo = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#1d3a5f"/><path d="M4 14c2.7-2.6 5.3-2.6 8 0s5.3 2.6 8 0" fill="none" stroke="#5ec4c4" stroke-width="2" stroke-linecap="round"/><path d="M4 9c2.7-2.6 5.3-2.6 8 0s5.3 2.6 8 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;
const bar = () => `<header class="ps-bar">${logo}<p>${meta.project}<span>${meta.name}プロジェクト</span></p><p class="ps-meta"><b>${meta.meeting}</b>${meta.date}</p></header>`;
const def = (v, name, text) => `<div><dt>${cell(v)}</dt><dd><b>${name}</b>${text}</dd></div>`;

export default {
  study: true,
  id: 'tpl-project-status-raci',
  title: 'RACI表：作業ごとの責任分担',
  language: 'ja',
  notes: 'Purpose: 誰が実行し、誰が最終的に責任を持つかを作業ごとに合意し、負荷の偏りを見つける。\nModify: roles と tasks を書き換える。A＝1名の確認、R の件数、右下の注記は自動で再計算される。key: true の行は薄く強調される。\nInvariant: 各行の A は必ず1名。A と R を兼ねる場合は A/R と書く。役割名は個人名ではなく役割で書く。\nStatic: ビルドなし。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-project-status ps-raci-page',
  content: `<div class="ps-page">${bar()}
<div class="ps-abs" style="left:56px;top:66px;right:56px">
  <p class="ps-sec">04　体制と責任分担（RACI）</p>
  <h1 class="ps-title" data-region="title">移行作業の実行がインフラ担当に集中。本番判定の責任は情シス部長です</h1>
</div>
<table class="ps-raci" data-region="primary" style="top:162px">
  <colgroup><col style="width:236px">${roles.map(() => '<col>').join('')}<col style="width:78px"></colgroup>
  <thead>${head}</thead><tbody>${body}</tbody><tfoot>${foot}</tfoot>
</table>
<aside class="ps-legend" data-region="support" style="top:162px">
  <dl>
    ${def('R', '実行責任', '作業を実際に行う')}
    ${def('A', '説明責任', '最終承認する。各行に1名')}
    ${def('C', '相談先', '事前に意見を聞く')}
    ${def('I', '報告先', '結果を知らせる')}
  </dl>
  <p class="ps-callout"><b>${busiestName}のRが${maxR}件${tie ? '（最多タイ）' : '（最多）'}</b>${busiestTasks.join('、')}を担います。10月からの1名減に備え、課題I-1で補充を進めます。</p>
</aside>
<p class="ps-source" data-region="source">例示データ・役割名は架空のプロジェクトのもの</p>
</div>`
};
