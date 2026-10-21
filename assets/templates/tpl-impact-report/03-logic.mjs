// Template: 年次活動報告（寄付者・自治体向け）· ロジックモデル. Synthetic example content; replace data and copy.
// 投入 → 活動 → アウトプット → アウトカム, each with measured indicators. One hairline carries the
// direction of the flow; outcome figures take the accent. Shared figures match the other pages.
const ID = 'tpl-impact-report-logic';
const K = {                           // 他のページと同じ値
  spend: 6300, staff: {full: 6, part: 14}, volunteers: 138, rooms: 12, perWeek: 3, weeks: 45,
  kids: 486, visits: 34992, talks: 410,
  stay: {april: 402, march: 338}, homework: {july: 61, feb: 78, n: 412}, exam: {grade9: 38, enrolled: 38},
};
const n = v => v.toLocaleString('ja-JP');
const sessions = K.rooms * K.perWeek * K.weeks;                       // 1,620
const kept = Math.round(K.stay.march / K.stay.april * 100);           // 84
const stages = [                      // 各段階3項目まで。pre・v・u = 数の前の語・数・単位、t = 何の数か（1行）、how = 測り方・内訳（1行）
  {h: '投入', sub: '使った資源', items: [
    {v: n(K.spend), u: '万円', t: '年間の事業費', how: '2025年度決算'},
    {v: K.staff.full + K.staff.part, u: '人', t: '学習支援スタッフ', how: `常勤${K.staff.full}人・非常勤${K.staff.part}人`},
    {v: K.volunteers, u: '人', t: 'ボランティア', how: '大学生と地域の大人'}]},
  {h: '活動', sub: '行ったこと', items: [
    {pre: '週', v: K.perWeek, u: '回', t: `${K.rooms}教室での学習会`, how: '1回2時間、宿題と復習'},
    {v: K.talks, u: '件', t: '保護者との面談', how: '入会時と学期ごと'},
    {pre: '月', v: 1, u: '回', t: '学校・市との連絡会', how: '気になる子のケース会議'}]},
  {h: 'アウトプット', sub: '直接の結果', items: [
    {v: n(sessions), u: '回', t: '開いた学習会', how: '出席記録'},
    {v: n(K.kids), u: '人', t: '参加した子ども', how: '実人数、出席記録'},
    {v: n(K.visits), u: '人', t: '延べ参加', how: '出席記録'}]},
  {h: 'アウトカム', sub: '子どもの変化', out: true, items: [
    {v: kept, u: '%', t: '3月まで通い続けた', how: `4月の在籍${K.stay.april}人のうち`},
    {v: K.homework.feb, u: '%', t: '宿題を最後までやり切る', how: `7月は${K.homework.july}%（子ども${K.homework.n}人の回答）`},
    {v: K.exam.enrolled, u: '人', t: '高校に進んだ中学3年生', how: `${K.exam.enrolled === K.exam.grade9 ? '受験した全員' : `${K.exam.grade9}人のうち`}。進路調査（3月）`}]},
];
const goal = '家庭の事情にかかわらず、子どもが学び続けられる地域';
const cols = [64, 358, 652, 946];                                      // 12列グリッドの1・4・7・10列目
const flowY = 252;                                                      // 流れを示す線の高さ

const flow = `<svg class="ir-fig" style="left:64px;top:${flowY - 8}px" width="1152" height="16" viewBox="0 0 1152 16" aria-hidden="true">
  <line x1="0" x2="1152" y1="8" y2="8" stroke="var(--ir-ink)" stroke-width="1"/>
  ${cols.slice(1).map(c => c - 64 - 12).map(x => `<path d="M${x - 5} 3 L${x + 5} 8 L${x - 5} 13 Z" fill="var(--ir-ink)"/>`).join('')}
</svg>`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Logic model: from resources to measured changes for children',
  notes: 'Purpose: 1年間の事業を「使った資源→行ったこと→直接の結果→子どもに起きた変化」の順に並べ、成果の数字がどこから来たか、どう測ったかを1枚で示す。\nModify: K（各ページと共通の数値）と stages の項目・測り方を差し替える。各段階は3項目まで。見出しの改行は <br> で文や句の切れ目に入れる。\nInvariant: 事業費は予算ページ、参加者数は1・2ページと同じ値にする。アウトカムには必ず測り方（調査名・時期・人数）を添える。線は想定する流れであり、変化がすべて事業の効果だとは言わない。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-impact-report ir-logic',
  content: `<h1 class="ir-h" data-region="title">学習会を重ねるうちに、<br>宿題を最後までやり切る子どもは${K.homework.july}%から${K.homework.feb}%に増えた</h1>
${stages.map((s, i) => `<section class="ir-stage${s.out ? ' is-out' : ''}" style="left:${cols[i]}px" data-region="${s.out ? 'primary' : 'support'}"><div class="ir-stage-h"><h2>${s.h}</h2><span>${s.sub}</span></div>
  <ul>${s.items.map(it => `<li><b>${it.pre ? `<small class="pre">${it.pre}</small>` : ''}${it.v}<small>${it.u}</small></b>${it.t}${it.how ? `<i>${it.how}</i>` : ''}</li>`).join('')}</ul></section>`).join('\n')}
${flow}
<p class="ir-goal"><span>めざす姿</span>${goal}</p>
<div class="ir-foot" data-region="source"><p>矢印は事業が想定する流れ。アウトカムの変化には学校や家庭の取り組みも影響している。子どもアンケートは7月と2月に実施</p><p>ゆうがた教室　2025年度 活動報告<b>3</b></p></div>`,
};
