// Template: 講義・社内研修パック · まとめと次回予告. Synthetic example content; replace data and copy.
const ID = 'tpl-lecture-summary';
const takeaways = [
  {icon: 'scale', h: '平均の平均は、重りがそろうときだけ', p: '店舗の客数や部署の人数が違うなら、単純に足して割ると実態からずれます。', tape: ''},
  {icon: 'fraction', h: '迷ったら“合計 ÷ 合計”', p: '売上の合計 ÷ 客数の合計。元の合計に戻せば、重みは自然に正しく入ります。', tape: 'is-teal'},
  {icon: 'lens', h: '報告の平均値は「何で割ったか」を確かめる', p: '分母が人数か店舗数かを1行添えるだけで、読み手の誤解を防げます。', tape: 'is-terra'}
];
const next = {h: '次回', t: '中央値と外れ値 ── 平均だけでは見えない“ばらつき”を読む'};

const rng = (s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; })(99);
const J = a => (rng() * 2 - 1) * a, F = v => +v.toFixed(1);
const sketch = (pts, a = 1.3) => { let d = `M${F(pts[0][0] + J(a))} ${F(pts[0][1] + J(a))}`; for (let i = 1; i <= pts.length; i++) { const p = pts[i % pts.length], q = pts[i - 1]; d += ` Q${F((p[0] + q[0]) / 2 + J(a * 1.4))} ${F((p[1] + q[1]) / 2 + J(a * 1.4))} ${F(p[0] + J(a))} ${F(p[1] + J(a))}`; } return d + 'Z'; };
const ink = 'stroke="#2B2A33" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"';
// Small hand-drawn icons (120×104), each tied to its takeaway.
const icons = {
  scale: `<path d="${sketch([[18, 86], [102, 86], [96, 96], [24, 96]], 1)}" fill="#E9DDC7" ${ink}/><path d="M60 86 L60 30" ${ink} fill="none"/><path d="M14 38 L106 22" ${ink} fill="none" stroke-width="4"/><circle cx="60" cy="30" r="6" fill="#F2C14E" ${ink}/>
    <rect x="8" y="16" width="26" height="20" rx="3" fill="#B5462E" transform="rotate(-10 21 26)" ${ink}/><rect x="84" y="2" width="26" height="18" rx="3" fill="#3F6699" transform="rotate(-10 97 11)" ${ink}/>`,
  fraction: `<path d="${sketch([[14, 8], [106, 8], [106, 98], [14, 98]], 1.4)}" fill="#FFFDF7" ${ink}/><path d="M28 53 H92" ${ink} fill="none" stroke-width="3.4"/>
    <text x="60" y="41" text-anchor="middle" class="lx-svg-b" style="font-size:19px">合計</text><text x="60" y="84" text-anchor="middle" class="lx-svg-b" style="font-size:19px">合計</text>
    <path d="M96 62 l8 -4 l-2 10 z" fill="#F2C14E"/>`,
  lens: `<path d="${sketch([[10, 14], [72, 10], [76, 96], [14, 98]], 1.4)}" fill="#FFFDF7" ${ink}/><path d="M24 34 H58 M24 50 H52 M24 66 H44" ${ink} fill="none" stroke-width="2" opacity=".6"/>
    <circle cx="78" cy="60" r="22" fill="rgba(211,234,228,.85)" ${ink} stroke-width="3.2"/><path d="M94 76 L112 96" ${ink} fill="none" stroke-width="6"/><text x="78" y="67" text-anchor="middle" class="lx-svg-b" style="font-size:18px;fill:#16706B">÷?</text>`
};
const iconSvg = (k, i) => `<svg viewBox="0 0 120 104" role="img" aria-labelledby="${ID}-i${i}"><title id="${ID}-i${i}">${takeaways[i].h}</title><g filter="url(#${ID}-rough)">${icons[k]}</g></svg>`;
const defs = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="${ID}-rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="2"/><feDisplacementMap in="SourceGraphic" scale="1.8"/></filter></defs></svg>`;
const doodle = `<svg viewBox="0 0 124 60" aria-hidden="true"><path d="M6 40 C 22 8, 44 8, 50 30 S 70 54, 86 30 L 112 30" stroke="#B5462E" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M102 20 L114 30 L102 40" stroke="#B5462E" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export default {
  study: true,
  id: ID,
  title: 'まとめ：平均をまとめるときは合計÷合計',
  language: 'ja',
  notes: 'Purpose: 講義の要点を3つに絞り、明日の仕事で使う行動に言い換えて持ち帰らせる。次回の内容につなげる。\nModify: takeaways の見出しは1文の結論、本文はその理由か使い方にする。アイコンは各要点の内容を表すものに描き替える。\nInvariant: 要点は3つまで。学習目標（1枚目）と対応させる：説明する→1、計算する→2、見抜く→3。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-lecture lx-p-summary',
  content: `<div class="lx">${defs}
  <div class="lx-course"><b>第3回</b>データ読み解き基礎</div>
  <div class="lx-tag">まとめ</div>
  <h1 class="lx-h1" data-region="title">まとめ：平均をまとめるときは<span class="lx-mark">「合計 ÷ 合計」</span></h1>
  ${takeaways.map((t, i) => `<section class="lx-card lx-take" style="left:${64 + i * 396}px" data-region="primary">
    <div class="lx-tape ${t.tape}" style="left:${120 + i * 14}px;top:-12px;transform:rotate(${[-3, 2, -1][i]}deg)"></div>
    <div class="lx-fig">${iconSvg(t.icon, i)}</div><span class="lx-take-n" aria-hidden="true">${i + 1}</span>
    <h2>${t.h}</h2><p>${t.p}</p>
  </section>`).join('')}
  <div class="lx-next" data-region="support">
    <div class="lx-fig">${doodle}</div>
    <p><b>${next.h}</b>${next.t}</p>
  </div>
</div>`
};
