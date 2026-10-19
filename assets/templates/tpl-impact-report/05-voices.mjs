// Template: 年次活動報告（寄付者・自治体向け）· 参加した人の声. Synthetic example content; replace data and copy.
// Typography only: one large quote from a child, two shorter ones from a parent and a teacher.
// Brackets hang into the margin; each quote names who said it and where. Voices are invented.
const ID = 'tpl-impact-report-voices';
const voices = [                      // 最初の声を大きく置く。who = 立場、where = 所属・頻度など（個人を特定しない粒度）
  {who: '中学2年生', where: '川西教室に週3回',
    text: '前は、わからないところがあっても黙っていました。ここでは、どこでつまずいたのかを一緒に探してくれるので、聞くのが怖くなくなりました。'},
  {who: '小学5年生の保護者', where: '本町教室',
    text: '仕事で帰りが遅い日も、教室で宿題を終えて帰ってきます。夕ご飯のときに、その日にできたことを話してくれるようになりました。'},
  {who: '市立中学校の教諭', where: '2年生の担任',
    text: '提出物を出せなかった生徒が、二学期からは毎回出すようになりました。教室で積み上げたものが、授業の中でも見えています。'},
];
const source = {when: '2026年2月', how: '子ども・保護者アンケートの自由記述と、学校への聞き取り'};

const [main, ...rest] = voices;
const quote = (v, cls, style) => `<blockquote class="ir-q${cls}" style="${style}"><p>${v.text}</p><footer><b>${v.who}</b>${v.where}</footer></blockquote>`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Voices: a child, a parent and a teacher describe the change',
  notes: 'Purpose: 数字では伝わらない変化を、本人・家庭・学校という3つの立場の言葉で確かめる。\nModify: voices を、本人の了解を得た実際の声に差し替える（最初の声が大きく入る）。立場と所属は、個人が特定されない粒度にとどめる。source に集め方を書く。\nInvariant: 声は短く、言い換えずに載せる（要約した場合は注記する）。架空の声を実在の声として見せない。顔写真やイラストを添えない。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-impact-report ir-voices',
  content: `<h1 class="ir-h" data-region="title">変化は、子ども自身の言葉にも、家庭と学校の声にも表れている</h1>
<div data-region="primary">${quote(main, '', 'left:64px;top:206px;width:662px')}</div>
<div data-region="support">${quote(rest[0], ' is-s', 'left:848px;top:210px;width:368px')}
<hr class="ir-q-rule">
${quote(rest[1], ' is-s', 'left:848px;top:438px;width:368px')}</div>
<div class="ir-foot" data-region="source"><p>${source.when}の${source.how}から、本人の了解を得て掲載（この例は架空の声）</p><p>ゆうがた教室　2025年度 活動報告<b>5</b></p></div>`,
};
