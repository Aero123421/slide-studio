// Template: 年次活動報告（寄付者・自治体向け）· 来年度の目標. Synthetic example content; replace data and copy.
// A reading table: what we aim for, this year's result, next year's target, and how it will be
// measured. Current values come from the same figures as the earlier pages.
const ID = 'tpl-impact-report-next';
const now = {kids: 486, stay: 84, homework: 78, grade9: 38, enrolled: 38, volunteers: 138}; // 2025年度実績（各ページと同じ値）
const focus = {name: '緑ヶ丘', kids: 63, eligible: 520, goalKids: 100, opens: '2026年9月'};      // 新しい教室を開く地区
const targets = [                    // goal = 2026年度の目標。sub = 補足（任意）。how = 測り方と時期
  {what: '参加する子ども', sub: '実人数', now: now.kids, goal: 540, unit: '人', how: '毎回の出席記録'},
  {what: `${focus.name}地区で支援が届く割合`, sub: `${focus.opens}に3つ目の教室を開く（${focus.kids}人→${focus.goalKids}人）`,
    now: Math.round(focus.kids / focus.eligible * 100), goal: Math.round(focus.goalKids / focus.eligible * 100), unit: '%',
    how: '参加者 ÷ 就学援助を受ける小中学生<span class="ir-nw">（市の統計、毎年5月）</span>', key: true},
  {what: '3月まで通い続ける子ども', now: now.stay, goal: 85, more: true, unit: '%', how: '4月と3月の在籍名簿を照合'},
  {what: '宿題を最後までやり切る子ども', now: now.homework, goal: 80, unit: '%', how: '子どもアンケート（7月・2月）'},
  {what: '高校に進む中学3年生', now: now.enrolled === now.grade9 ? '全員' : now.enrolled, goal: '全員', unit: '', how: '進路調査（3月）'},
  {what: 'ボランティア', now: now.volunteers, goal: 160, unit: '人', how: '登録と活動の記録'},
];

const n = v => (typeof v === 'number' ? v.toLocaleString('ja-JP') : v);
const cell = (v, unit, more) => (typeof v === 'number' ? `${n(v)}${unit ? `<small>${unit}${more ? '以上' : ''}</small>` : ''}` : `<span class="word">${v}</span>`);
const key = targets.find(t => t.key);

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Next year: targets and how each will be measured',
  notes: 'Purpose: この一年の結果から来年度の目標を数値で約束し、それぞれをどう測るかまで示す。\nModify: now（今年度の実績）、focus（教室を開く地区）、targets（目標・測り方）を差し替える。地区の割合は参加者数と対象者数から計算される。見出しの改行は <br> で文や句の切れ目に入れる。\nInvariant: 目標は必ず今年度の実績と並べ、測り方と時期を書く。実績は前のページと同じ値にする。計画は予定として書き、決まっていないことは断定しない。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-impact-report ir-next',
  content: `<h1 class="ir-h" data-region="title">2026年度は${focus.name}に3つ目の教室を開き、<br>受け入れを${n(targets[0].goal)}人に広げます</h1>
<table class="ir-plan" data-region="primary">
  <colgroup><col style="width:392px"><col style="width:196px"><col style="width:196px"><col></colgroup>
  <thead><tr><th>目標</th><th class="num">2025年度 実績</th><th class="num">2026年度 目標</th><th class="how">測り方</th></tr></thead>
  <tbody>${targets.map(t => `<tr${t.key ? ' class="is-focus"' : ''}><td>${t.what}${t.sub ? `<span class="sub">${t.sub}</span>` : ''}</td><td class="num">${cell(t.now, t.unit)}</td><td class="num is-goal">${cell(t.goal, t.unit, t.more)}</td><td class="how">${t.how}</td></tr>`).join('')}</tbody>
</table>
<p class="ir-thanks">ご寄付とご協力をいただいた皆さまに、心より感謝申し上げます。</p>
<div class="ir-foot" data-region="source"><p>目標は2026年4月の理事会で決定。${key.what}の対象は${n(focus.eligible)}人（2025年5月1日現在）</p><p>ゆうがた教室　2025年度 活動報告<b>6</b></p></div>`,
};
