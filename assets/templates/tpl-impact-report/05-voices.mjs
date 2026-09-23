// Template: 年次インパクトレポート · 受益者の声（架空と明記）. Synthetic example content; replace data and copy.
const ID = 'tpl-impact-report-voices';
// FICTIONAL voices written for this template. Replace only with real, consented quotes.
const voices = [
  {av: 'student', tag: '「わからない」と言える', q: '家だと途中で投げ出していた数学の宿題を、ここでは最後まで解けるようになりました。わからないと言いやすいのがいいです。', who: '中学2年生（架空）・東部の拠点に週2回'},
  {av: 'parent', tag: '家庭の安心', q: '仕事で帰りが遅くなる日も、子どもが安心して過ごせる場所があるので、本当に助かっています。', who: '小学5年生の保護者（架空）・中央の拠点'},
  {av: 'volunteer', tag: '支える側の学び', q: '教えるつもりで来たのに、子どもたちの質問から自分が学ぶことのほうが多いと感じています。', who: '大学生ボランティア（架空）・活動2年目'}
];

// Flat avatars (not portraits of real people), clipped to a circle.
const skin = '#F1D3BC', hair = '#2A3A40';
const figures = {
  student: `<rect width="104" height="104" fill="#CFE3EA"/><rect x="24" y="62" width="14" height="40" rx="6" fill="#D46E55"/><path d="M22 104 C 22 76, 34 66, 52 66 S 82 76, 82 104Z" fill="#2E6E72"/><path d="M40 70 L44 104 M64 70 L60 104" stroke="#D46E55" stroke-width="5"/><circle cx="52" cy="44" r="18" fill="${skin}"/><path d="M33 42 C 32 24, 70 20, 71 40 C 64 32, 44 30, 33 42Z" fill="${hair}"/>`,
  parent: `<rect width="104" height="104" fill="#EFE6D3"/><path d="M18 104 C 18 74, 32 64, 52 64 S 86 74, 86 104Z" fill="#8DB3A5"/><path d="M44 64 L52 76 L60 64" fill="#F7F5EF"/><circle cx="52" cy="42" r="18" fill="${skin}"/><path d="M33 46 C 28 22, 74 18, 72 44 L 70 36 C 60 30, 44 30, 36 38Z" fill="#6B4A3A"/><circle cx="45" cy="44" r="5.4" fill="none" stroke="#1F3440" stroke-width="1.8"/><circle cx="59" cy="44" r="5.4" fill="none" stroke="#1F3440" stroke-width="1.8"/><path d="M50.4 44 h3.2" stroke="#1F3440" stroke-width="1.8"/>`,
  volunteer: `<rect width="104" height="104" fill="#DDEAE4"/><path d="M20 104 C 20 74, 34 64, 52 64 S 84 74, 84 104Z" fill="#D46E55"/><rect x="56" y="74" width="26" height="30" rx="2" fill="#F7F5EF" stroke="#1F3440" stroke-width="1.6" transform="rotate(-8 69 89)"/><path d="M60 82 h16 M60 88 h12" stroke="#8DB3A5" stroke-width="2" transform="rotate(-8 69 89)"/><circle cx="52" cy="42" r="18" fill="${skin}"/><path d="M34 40 C 34 20, 72 20, 70 42 C 72 30, 58 26, 50 30 C 44 26, 36 30, 34 40Z" fill="${hair}"/><path d="M68 34 C 78 34, 80 50, 72 56" fill="none" stroke="${hair}" stroke-width="6" stroke-linecap="round"/>`
};
const avatar = (k, i) => `<svg viewBox="0 0 104 104" aria-hidden="true"><defs><clipPath id="${ID}-clip${i}"><circle cx="52" cy="52" r="50"/></clipPath></defs><circle cx="52" cy="52" r="52" fill="#FFFFFF"/><g clip-path="url(#${ID}-clip${i})">${figures[k]}</g><circle cx="52" cy="52" r="50" fill="none" stroke="#FFFFFF" stroke-width="4"/></svg>`;

export default {
  study: true,
  id: ID,
  title: '受益者の声（例示用の架空の声）',
  language: 'ja',
  notes: 'Purpose: 数字では伝わらない変化を、子ども・保護者・支える側の3つの立場の声で補う。\nModify: voices を、本人の同意を得た実際の声に差し替える。属性は個人が特定されない粒度（学年・拠点・活動年数程度）にとどめる。タグは声が示す変化を短く言い換える。\nInvariant: 架空の声を実在の声として見せない。実際の声に替えるまでは「架空」の表示と注記を残す。アバターは実在の人物の似顔絵にしない。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-impact-report ir-p-voices',
  content: `<div class="ir">
  <div class="ir-top"><span class="ir-brand">まちの学び舎ネットワーク　2025年度 年次報告</span><span class="ir-sec"><b>05</b>参加した人の声</span></div>
  <h1 class="ir-h1" data-region="title">参加した人の声から見える、3つの変化</h1>
  <p class="ir-lead">子ども・保護者・ボランティア、それぞれの立場から見た1年間の変化です。</p>
  ${voices.map((v, i) => `<section class="ir-card ir-voice" style="left:${64 + i * 396}px" data-region="primary">
    <div class="ir-av">${avatar(v.av, i)}</div><span class="ir-tag">${v.tag}</span>
    <blockquote><p>${v.q}</p></blockquote>
    <p class="ir-who">${v.who}</p>
  </section>`).join('')}
  <p class="ir-fict" data-region="source">掲載している声と人物像は、例示のために作成した架空のものです</p>
  <p class="ir-foot" style="left:auto"><span>5</span></p>
</div>`
};
