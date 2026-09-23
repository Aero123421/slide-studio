// Template: プロジェクト定例・進捗報告 · 決定事項と次のアクション. Synthetic example content; replace data and copy.
// 期限までの日数・期限超過・並び順は today と actions 配列から計算します。
const P = 'tpl-project-status-decisions';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Keep bracketed references such as （R-1） on one line.
const keep = s => esc(s).replace(/（[^）]{1,12}）/g, m => `<span style="white-space:nowrap">${m}</span>`);
const meta = { project: 'MINATO', name: '受発注システム刷新', meeting: '第14回 定例', date: '2026年9月23日（水）' };
const DAY = 86400000;
const D = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const WD = ['日', '月', '火', '水', '木', '金', '土'];
const mdw = t => { const d = new Date(t); return `${d.getUTCMonth() + 1}/${d.getUTCDate()}（${WD[d.getUTCDay()]}）`; };
const today = D('2026-09-23');

const decisions = [
  { no: 'D14-1', text: '結合テストの開始を10月6日に変更し、総合テスト後の予備日から2日を充てる', by: '情シス部長', why: '本番稼働日1月12日は変更しない' },
  { no: 'D14-2', text: '変更要求CR-08（請求書の電子送付）を承認する。CR-09は次回に審議する', by: '情シス部長', why: 'CR-08の追加工数は予備費の範囲内' },
  { no: 'D14-3', text: '帳票モジュールの設計レビューを10月9日までに2回追加する', by: 'PM', why: '課題I-2への対策' }
];
// state: new＝今回追加, cont＝前回からの継続. 期限を過ぎた未完了は自動で「期限超過」になる。
const actions = [
  { text: 'インフラ要員の補充方法を決める（I-1）', owner: 'PM', due: '2026-10-02', state: 'new' },
  { text: '取引先マスタの名寄せルール案を作る（R-1）', owner: '業務リード', due: '2026-10-09', state: 'new' },
  { text: '帳票モジュールの追加レビュー 1回目（I-2）', owner: 'QAリード', due: '2026-09-30', state: 'new' },
  { text: 'CR-09の影響見積もりを提出する', owner: '開発リード', due: '2026-09-29', state: 'cont' },
  { text: '結合テスト計画書の改訂版を共有する', owner: 'QAリード', due: '2026-09-22', state: 'cont' },
  { text: 'EDI接続試験の枠を予約する（R-2）', owner: '開発リード', due: '2026-10-20', state: 'cont' }
];
const next = { when: '9月30日（水）10:00〜11:00', where: '第2会議室・オンライン併用', agenda: 'インフラ要員の補充方法、CR-09の審議' };

const rows = actions.map(a => ({ ...a, t: D(a.due) })).sort((a, b) => a.t - b.t).map((a, i) => {
  const d = Math.round((a.t - today) / DAY), late = d < 0;
  const st = late ? ['is-late', '期限超過'] : a.state === 'new' ? ['is-new', '新規'] : ['is-cont', '継続'];
  return `<tr class="${late ? 'is-late' : ''}"><td class="ps-num" style="color:var(--ps-ink-3);font-weight:700">${i + 1}</td><td>${keep(a.text)}</td><td>${esc(a.owner)}</td>
  <td class="ps-due">${mdw(a.t)}<small>${late ? `${-d}日超過` : d === 0 ? '今日' : `あと${d}日`}</small></td><td><span class="ps-state ${st[0]}">${st[1]}</span></td></tr>`;
}).join('');
const lateN = actions.filter(a => D(a.due) < today).length;

const logo = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#1d3a5f"/><path d="M4 14c2.7-2.6 5.3-2.6 8 0s5.3 2.6 8 0" fill="none" stroke="#5ec4c4" stroke-width="2" stroke-linecap="round"/><path d="M4 9c2.7-2.6 5.3-2.6 8 0s5.3 2.6 8 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;
const bar = () => `<header class="ps-bar">${logo}<p>${meta.project}<span>${meta.name}プロジェクト</span></p><p class="ps-meta"><b>${meta.meeting}</b>${meta.date}</p></header>`;

export default {
  study: true,
  id: 'tpl-project-status-decisions',
  title: '決定事項と次のアクション',
  language: 'ja',
  notes: 'Purpose: 定例の最後に、決まったこと・誰がいつまでに何をするか・次回の議題を確認する。\nModify: decisions、actions（内容・担当・期限・新規／継続）、next、today を書き換える。並び順・残日数・期限超過は自動で計算される。\nInvariant: 決定事項には決定者と理由を残す。アクションは担当1名と日付の期限を持つ。期限超過を隠さない。\nStatic: ビルドなし。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-project-status ps-decisions',
  content: `<div class="ps-page">${bar()}
<div class="ps-abs" style="left:56px;top:66px;right:56px">
  <p class="ps-sec">06　決定事項と次のアクション</p>
  <h1 class="ps-title" data-region="title">本日の決定は${decisions.length}件。アクション${actions.length}件のうち${lateN}件が期限を過ぎています</h1>
</div>
<section class="ps-dec" data-region="primary">
  <p style="font:700 16px/1 var(--ps-jp);color:var(--ps-ink-2);margin-bottom:12px">本日の決定事項</p>
  ${decisions.map(d => `<article><span class="ps-dno">${d.no}</span><p class="ps-dtext">${esc(d.text)}</p><p>決定：${esc(d.by)}・${esc(d.why)}</p></article>`).join('')}
</section>
<div class="ps-abs" style="left:566px;top:170px;font:700 16px/1 var(--ps-jp);color:var(--ps-ink-2)">次のアクション（期限順）</div>
<table class="ps-act" data-region="support" style="top:198px">
  <colgroup><col style="width:30px"><col><col style="width:104px"><col style="width:104px"><col style="width:92px"></colgroup>
  <thead><tr><th>#</th><th>内容</th><th>担当</th><th>期限</th><th>状態</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="ps-next"><p>次回定例</p><strong>${next.when}</strong><span>${esc(next.where)}　議題：${esc(next.agenda)}</span></div>
</div>`
};
