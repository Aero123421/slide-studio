// Template: 年次インパクトレポート · 事業の流れ（インプット→活動→アウトプット→アウトカム）. Synthetic example content; replace data and copy.
const ID = 'tpl-impact-report-logic';
// Figures are the same as on the other pages (budget total = expenditure total on the budget page).
const K = {spend: 4860, volunteers: 186, sites: 17, sessions: 612, kids: 1284, visits: 18420, retention: 78, survey: 812};
const fmt = n => n.toLocaleString('ja-JP');
const cols = [
  {icon: 'input', h: 'インプット', sub: '投じた資源', items: [
    {v: fmt(K.spend), u: '万円', t: '年間の事業支出'}, {v: fmt(K.volunteers), u: '人', t: 'ボランティア（年3回以上）'}, {v: fmt(K.sites), u: 'か所', t: '公民館・集会所などの拠点'}]},
  {icon: 'act', h: '活動', sub: '行ったこと', items: [
    {v: fmt(K.sessions), u: '回', t: '放課後の学習会'}, {v: '24', u: '回', t: '保護者向けの相談会'}, {v: '4', u: '回', t: 'ボランティア研修'}]},
  {icon: 'output', h: 'アウトプット', sub: '直接の結果', items: [
    {v: fmt(K.kids), u: '人', t: '参加した子ども（実人数）'}, {v: fmt(K.visits), u: '人回', t: '延べ参加'}, {v: '312', u: '件', t: '保護者からの相談'}]},
  {icon: 'outcome', h: 'アウトカム', sub: '子どもに起きた変化', out: true, items: [
    {v: fmt(K.retention), u: '%', t: '3月まで通い続けた子ども'}, {v: '64', u: '%', t: '「勉強が前より好きになった」'}, {v: '71', u: '%', t: '「困ったときに相談できる大人がいる」'}]}
];
const impact = 'どの家庭に生まれても、放課後に学び続けられる地域';

const ic = {
  input: `<circle cx="27" cy="27" r="27" fill="#DDEAE4"/><rect x="13" y="24" width="28" height="18" rx="3" fill="#2E6E72"/><path d="M19 24 v-5 a8 8 0 0 1 16 0 v5" stroke="#2E6E72" stroke-width="3" fill="none"/><circle cx="27" cy="33" r="3" fill="#DDEAE4"/>`,
  act: `<circle cx="27" cy="27" r="27" fill="#DDEAE4"/><rect x="12" y="16" width="30" height="20" rx="2" fill="#2E6E72"/><path d="M17 23 h12 M17 29 h18" stroke="#DDEAE4" stroke-width="2.2" stroke-linecap="round"/><path d="M20 36 l-4 8 M34 36 l4 8" stroke="#2E6E72" stroke-width="2.6" stroke-linecap="round"/>`,
  output: `<circle cx="27" cy="27" r="27" fill="#DDEAE4"/><circle cx="20" cy="22" r="5" fill="#2E6E72"/><path d="M11 40 c0-8 4-12 9-12 s9 4 9 12z" fill="#2E6E72"/><circle cx="35" cy="24" r="4.4" fill="#8DB3A5"/><path d="M27 40 c0-7 4-10 8-10 s8 3 8 10z" fill="#8DB3A5"/>`,
  outcome: `<circle cx="27" cy="27" r="27" fill="#2A5A64"/><path d="M14 38 l9 -9 l6 5 l11 -13" stroke="#F2C7A8" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 20 h7 v7" stroke="#F2C7A8" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
};
const chev = `<svg viewBox="0 0 40 56" aria-hidden="true"><path d="M10 8 L28 28 L10 48" stroke="#8DB3A5" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const colW = (1152 - 3 * 40) / 4;

export default {
  study: true,
  id: ID,
  title: '事業の流れ：インプットからアウトカムまで',
  language: 'ja',
  notes: 'Purpose: 1年間の事業を「投じた資源→行ったこと→直接の結果→子どもに起きた変化」の順に並べ、成果の数字がどこから来たかを1枚で説明する（ロジックモデル）。\nModify: cols の数値と説明を差し替える。インプットの金額は予算ページの支出合計、アウトプットの参加者数は表紙・地域別ページと同じ値にする。\nInvariant: 矢印は想定する因果の流れであり、アウトカムの変化が事業だけによるとは限らない（ページ下の注記を残す）。アウトカムの割合には調査方法と回答数を添える。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-impact-report ir-p-logic',
  content: `<div class="ir">
  <div class="ir-top"><span class="ir-brand">まちの学び舎ネットワーク　2025年度 年次報告</span><span class="ir-sec"><b>03</b>事業の流れ</span></div>
  <h1 class="ir-h1" data-region="title">${fmt(K.spend)}万円と${fmt(K.volunteers)}人の力で、${fmt(K.kids)}人に学びの場を届けました</h1>
  <p class="ir-lead">事業の流れを、投じた資源から子どもに起きた変化までの4段階で整理しました。</p>
  <div class="ir-cols" data-region="primary">
    ${cols.map(c => `<section class="ir-col${c.out ? ' is-out' : ''}"><div class="ir-colhead"><svg viewBox="0 0 54 54" aria-hidden="true">${ic[c.icon]}</svg><h2>${c.h}<small>${c.sub}</small></h2></div>
      <ul>${c.items.map(i => `<li><b>${i.v}<small>${i.u}</small></b>${i.t}</li>`).join('')}</ul></section>`).join('')}
  </div>
  ${[1, 2, 3].map(k => `<div class="ir-chev" style="left:${(64 + k * (colW + 40) - 40).toFixed(1)}px">${chev}</div>`).join('')}
  <div class="ir-impact" data-region="support"><p class="ir-label">めざす姿（インパクト）</p><p>${impact}</p></div>
  <p class="ir-foot" data-region="source"><span>矢印は事業が想定する流れです。アウトカムの割合は3月の参加者アンケート（回答${fmt(K.survey)}人）による ・ 数値は例示用の架空データです</span><span>3</span></p>
</div>`
};
