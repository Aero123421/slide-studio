// Template: 年次活動報告（寄付者・自治体向け）· この一年. Synthetic example content; replace data and copy.
// The opener: who reports on which year, one plain sentence about the change, four figures with
// their definitions. Totals come from the district table used on the regions page.
const ID = 'tpl-impact-report-highlights';
const org = {name: '認定NPO法人 ゆうがた教室', report: '2025年度 活動報告', period: '2025年4月〜2026年3月'};
const districts = [                      // 地区別の実績（地域別ページと同じ表）：教室数、参加した子ども（実人数）
  {name: '本町', rooms: 3, kids: 128}, {name: '川西', rooms: 3, kids: 117}, {name: '桜台', rooms: 2, kids: 96},
  {name: '港南', rooms: 2, kids: 82}, {name: '緑ヶ丘', rooms: 2, kids: 63},
];
const prev = {rooms: 10, kids: 416};     // 2024年度
const sessions = {perWeek: 3, weeks: 45}; // 1教室あたりの開催：週3回 × 45週
const stay = {april: 402, march: 338};   // 4月に在籍した子どものうち、3月も通っていた子ども
const exam = {grade9: 38, enrolled: 38}; // 中学3年生の人数と、高校に進学した人数

// ---- derived
const rooms = districts.reduce((s, d) => s + d.rooms, 0);       // 12
const kids = districts.reduce((s, d) => s + d.kids, 0);         // 486
const held = rooms * sessions.perWeek * sessions.weeks;         // 1,620
const kept = Math.round(stay.march / stay.april * 100);         // 84
const n = v => v.toLocaleString('ja-JP');
const figs = [
  {v: n(kids), unit: '人', label: '教室に通った子ども', def: '小学3年〜中学3年の実人数'},
  {v: n(held), unit: '回', label: '開いた学習会', def: `${rooms}教室で週${sessions.perWeek}回、1回2時間`},
  {v: kept, unit: '%', label: '3月まで通い続けた子ども', def: `4月に在籍した${stay.april}人のうち${stay.march}人`},
  {v: exam.enrolled, unit: '人', label: '高校に進んだ中学3年生', def: exam.enrolled === exam.grade9 ? `受験した${exam.grade9}人の全員` : `${exam.grade9}人のうち`},
];

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Annual report opener: the year in one sentence and four figures',
  notes: 'Purpose: 表紙を兼ねて、どの団体の何年度の報告かと、この一年の変化を平易な一文と4つの数字で伝える。\nModify: org、districts（地域別ページと同じ表）、prev（前年度）、sessions、stay、exam を差し替える。文中の増分と4つの数字は計算で出る。見出しの改行は <br> で文や句の切れ目に入れる。\nInvariant: 数字は4つまで。どの数字にも「何を数えたか」を添える。率は分母を書く。一文は事実を言い、標語にしない。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-impact-report ir-open',
  content: `<p class="ir-org" data-region="support">${org.name}<span>${org.report}（${org.period}）</span></p>
<h1 class="ir-say" data-region="title">教室を${rooms - prev.rooms}か所増やし、前の年より${kids - prev.kids}人多い子どもが、<br>放課後の学びを続けた一年でした。</h1>
<div class="ir-figs" data-region="primary">${figs.map(f => `<div><p class="ir-n">${f.v}<small>${f.unit}</small></p><p class="ir-n-l">${f.label}</p><p class="ir-n-d">${f.def}</p></div>`).join('')}</div>
<div class="ir-foot" data-region="source"><p>数値は2026年3月31日時点。参加した子どもは地区別の実績（2ページ）の合計</p><p>ゆうがた教室　${org.report}<b>1</b></p></div>`,
};
