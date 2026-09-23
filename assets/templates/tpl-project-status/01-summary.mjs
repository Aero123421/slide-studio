// Template: プロジェクト定例・進捗報告 · 全体ステータス（RAG＋一言要約）. Synthetic example content; replace data and copy.
// 状態・前回比・KPIはすべて下の配列から描画します。色だけに頼らず、形（●▲■）と言葉を必ず併記します。
const P = 'tpl-project-status-summary';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const meta = { project: 'MINATO', name: '受発注システム刷新', meeting: '第14回 定例', date: '2026年9月23日（水）' };

const RAG = {
  g: { word: '良好', shape: '<circle cx="6.5" cy="6.5" r="6" fill="currentColor"/>' },
  a: { word: '注意', shape: '<path d="M6.5 .5l6 11.5H.5z" fill="currentColor"/>' },
  r: { word: '要対応', shape: '<rect x=".5" y=".5" width="12" height="12" rx="1.5" fill="currentColor"/>' }
};
const chip = k => `<span class="ps-rag is-${k}"><svg viewBox="0 0 13 13" aria-hidden="true">${RAG[k].shape}</svg>${RAG[k].word}</span>`;
const TREND = {
  up: { word: '改善', d: 'M3 14L14 3M7 3h7v7' }, flat: { word: '横ばい', d: 'M2 9h13M10 4l5 5-5 5' }, down: { word: '悪化', d: 'M3 4l11 11M14 8v7H7' }
};
const trend = k => `<span class="ps-trend"><svg viewBox="0 0 18 18" aria-hidden="true"><path d="${TREND[k].d}" fill="none" stroke="${k === 'down' ? '#b8372a' : k === 'up' ? '#2b7a4b' : '#5f6b7c'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>${TREND[k].word}</span>`;

const overall = { rag: 'a', previous: '良好', summary: '開発完了が5営業日遅れ、結合テストの開始は10月6日にずれ込みます。テストの並行実施で3日を取り戻し、残る2日は予備日で吸収します。' };
const areas = [
  { area: 'スコープ', rag: 'g', trend: 'flat', note: '変更要求2件（CR-07、CR-08）を承認。追加工数は予備費の範囲内です。' },
  { area: 'スケジュール', rag: 'a', trend: 'down', note: '開発完了が10月9日に5営業日遅延。結合テストの開始を10月6日に変更します。' },
  { area: 'コスト', rag: 'g', trend: 'flat', note: '予算消化率54%（計画56%）。変更要求分を含めても予算内に収まります。' },
  { area: '品質', rag: 'a', trend: 'flat', note: '単体テストの不具合密度が目標の1.4倍。帳票モジュールに集中しています。' },
  { area: '体制', rag: 'r', trend: 'down', note: '10月からインフラ担当が1名減。補充の目処が立っていません。' }
];
const kpis = [
  { label: '進捗率（出来高）', value: 62, unit: '%', plan: 68, kind: 'bar' },
  { label: '予算消化率', value: 54, unit: '%', plan: 56, kind: 'bar' },
  { label: '未解決の課題', value: 7, unit: '件', parts: [['重大', 2, '#b8372a'], ['通常', 5, '#aab4c2']], kind: 'units' },
  { label: '変更要求', value: 3, unit: '件', parts: [['承認', 2, '#0c7478'], ['審議中', 1, 'none']], kind: 'units' }
];

const kpiHtml = kpis.map((k, i) => {
  let g;
  if (k.kind === 'bar') {
    const W = 150, x = v => (v / 100) * W;
    g = `<svg viewBox="0 0 ${W + 70} 22" role="img" aria-labelledby="${P}-k${i}"><title id="${P}-k${i}">${k.label} 実績${k.value}${k.unit}、計画${k.plan}${k.unit}</title>
      <rect x="0" y="7" width="${W}" height="8" rx="4" fill="#e8ecf1"/><rect x="0" y="7" width="${x(k.value)}" height="8" rx="4" fill="#0c7478" data-qa-mark="bar"/>
      <line x1="${x(k.plan)}" x2="${x(k.plan)}" y1="2" y2="20" stroke="#1b2433" stroke-width="2"/>
      <text x="${W + 8}" y="16" font-size="15" fill="#465264">計画${k.plan}${k.unit}</text></svg>`;
  } else {
    let x = 0; const cells = [];
    k.parts.forEach(([name, n, c]) => { for (let j = 0; j < n; j++) { cells.push(`<rect x="${x + 1}" y="5" width="12" height="12" rx="2.5" fill="${c === 'none' ? '#fff' : c}" stroke="${c === 'none' ? '#0c7478' : 'none'}" stroke-width="1.5"/>`); x += 16; } x += 6; });
    const legend = k.parts.map(([name, n]) => `${name}${n}`).join('・');
    g = `<svg viewBox="0 0 ${x + 110} 22" role="img" aria-labelledby="${P}-k${i}"><title id="${P}-k${i}">${k.label} ${legend}</title>${cells.join('')}
      <text x="${x + 2}" y="16" font-size="15" fill="#465264">${legend}</text></svg>`;
  }
  return `<div class="ps-kpi"><p>${k.label}</p><strong class="ps-num">${k.value}<small>${k.unit}</small></strong>${g}</div>`;
}).join('');

const lamp = `<svg viewBox="0 0 56 136" role="img" aria-labelledby="${P}-lamp"><title id="${P}-lamp">全体ステータス：${RAG[overall.rag].word}</title>
<defs><radialGradient id="${P}-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd76a"/><stop offset=".6" stop-color="#e0a100"/><stop offset="1" stop-color="#b37e00"/></radialGradient>
<filter id="${P}-blur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5"/></filter></defs>
<rect x="2" y="2" width="52" height="132" rx="26" fill="#22324a"/>
<circle cx="28" cy="28" r="15" fill="${overall.rag === 'r' ? '#d9534f' : '#3a4a63'}"/>
<circle cx="28" cy="68" r="19" fill="#e0a100" opacity="${overall.rag === 'a' ? .55 : 0}" filter="url(#${P}-blur)"/>
<circle cx="28" cy="68" r="15" fill="${overall.rag === 'a' ? `url(#${P}-glow)` : '#3a4a63'}"/>
<circle cx="28" cy="108" r="15" fill="${overall.rag === 'g' ? '#3aa36a' : '#3a4a63'}"/>
<circle cx="23" cy="63" r="4" fill="#fff" opacity=".45"/></svg>`;

const logo = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#1d3a5f"/><path d="M4 14c2.7-2.6 5.3-2.6 8 0s5.3 2.6 8 0" fill="none" stroke="#5ec4c4" stroke-width="2" stroke-linecap="round"/><path d="M4 9c2.7-2.6 5.3-2.6 8 0s5.3 2.6 8 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;
const bar = sec => `<header class="ps-bar">${logo}<p>${meta.project}<span>${meta.name}プロジェクト</span></p><p class="ps-meta"><b>${meta.meeting}</b>${meta.date}</p></header>`;

export default {
  study: true,
  id: 'tpl-project-status-summary',
  title: '全体ステータス：RAG表示と一言要約',
  language: 'ja',
  notes: 'Purpose: 定例の冒頭で、全体の状態・その理由・判断が必要な領域を1枚で伝える。\nModify: overall（全体RAG・前回・要約）とareas（領域ごとのRAG・前回比・状況）、kpis を書き換える。表・信号・KPIは配列から描画される。\nInvariant: RAGは色だけでなく形（●▲■）と言葉を併記する。全体の判定は最も悪い領域を無視しない。KPIの計画値は同じ基準日のものを使う。\nStatic: ビルドなし。1枚で読み切れる。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-project-status ps-summary',
  content: `<div class="ps-page">${bar()}
<div class="ps-abs" style="left:56px;top:66px;right:56px">
  <p class="ps-sec">01　全体ステータス</p>
  <h1 class="ps-title" data-region="title">本番稼働日は維持できる見込みです。要員と品質の2点で判断をお願いします</h1>
</div>
<section class="ps-hero" data-region="primary">
  <div class="ps-hero-top">${lamp}<div><p>全体の状態</p><strong>${RAG[overall.rag].word}</strong><em>前回（第13回）は${overall.previous}</em></div></div>
  <blockquote>${esc(overall.summary)}</blockquote>
</section>
<table class="ps-areas" data-region="support">
  <colgroup><col style="width:128px"><col style="width:112px"><col style="width:98px"><col></colgroup>
  <thead><tr><th>領域</th><th>状態</th><th>前回比</th><th>今週の状況</th></tr></thead>
  <tbody>${areas.map(a => `<tr><td>${a.area}</td><td>${chip(a.rag)}</td><td>${trend(a.trend)}</td><td>${esc(a.note)}</td></tr>`).join('')}</tbody>
</table>
<div class="ps-kpis">${kpiHtml}</div>
<p class="ps-source" data-region="source">架空のプロジェクトによる例示データ（9月18日時点）・実際の数値に置き換えてください</p>
</div>`
};
