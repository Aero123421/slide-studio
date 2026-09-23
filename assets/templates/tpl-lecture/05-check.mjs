// Template: 講義・社内研修パック · 理解度チェック（選択問題と解答注記）. Synthetic example content; replace data and copy.
const ID = 'tpl-lecture-check';
const teams = [
  {name: '企画部', people: 10, hours: 20, fill: '#B5462E', cols: 5},
  {name: '営業部', people: 30, hours: 12, fill: '#3F6699', cols: 10}
];
const total = teams.reduce((a, t) => a + t.people, 0);
const sumHours = teams.reduce((a, t) => a + t.people * t.hours, 0);
const correct = sumHours / total;                                           // 14
const naive = teams.reduce((a, t) => a + t.hours, 0) / teams.length;       // 16
const options = [{k: 'ア', v: naive}, {k: 'イ', v: correct}, {k: 'ウ', v: 12}, {k: 'エ', v: 15}];
const hit = options.find(o => Math.abs(o.v - correct) < 1e-9);
const fmt = v => Number.isInteger(v) ? String(v) : v.toFixed(1);

const rng = (s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; })(5);
const J = a => (rng() * 2 - 1) * a, F = v => +v.toFixed(1);
const person = (cx, base, h, fill) => { const r = h * .18, w = h * .56, top = base - h + 2 * r + 2, rr = w * .42;
  return `<circle cx="${F(cx)}" cy="${F(base - h + r)}" r="${F(r)}" fill="${fill}"/><path d="M${F(cx - w / 2)} ${F(base)}V${F(top + rr)}a${F(rr)} ${F(rr)} 0 0 1 ${F(rr)} ${F(-rr)}H${F(cx + w / 2 - rr)}a${F(rr)} ${F(rr)} 0 0 1 ${F(rr)} ${F(rr)}V${F(base)}Z" fill="${fill}"/>`; };
const line = (x1, y1, x2, y2, a = 1.2) => `M${F(x1 + J(a * .5))} ${F(y1 + J(a * .5))} Q${F((x1 + x2) / 2 + J(a))} ${F((y1 + y2) / 2 + J(a))} ${F(x2 + J(a * .5))} ${F(y2 + J(a * .5))}`;

// People grid (1 icon = 1 person) and hour bars on one shared zero (bar length ∝ hours), all from `teams`.
const cell = 32, gapX = 44, bar0 = 84, hourPx = 14;
let gx = 8;
const groups = teams.map((t, ti) => { const x0 = gx; gx += t.cols * cell + gapX;
  const icons = Array.from({length: t.people}, (_, i) => person(x0 + (i % t.cols) * cell + cell / 2, 88 + Math.floor(i / t.cols) * 42, 34, t.fill)).join('');
  const barY = 214 + ti * 36, len = t.hours * hourPx;
  return {svg: `${icons}<path d="${line(bar0, barY, bar0 + len, barY, .8)}" stroke="${t.fill}" stroke-width="16" stroke-linecap="round" fill="none" opacity=".88"/>`,
    text: `<text class="lx-svg-b" x="${x0}" y="24">${t.name}　${t.people}人</text><text class="lx-svg-lab" x="8" y="${barY + 6}" style="font-size:16px">${t.name}</text><text class="lx-svg-num" x="${F(bar0 + len + 16)}" y="${barY + 6}">${t.hours}時間</text>`}; });
const art = `<svg viewBox="0 0 560 280" role="img" aria-labelledby="${ID}-t ${ID}-d">
  <title id="${ID}-t">2つの部署の人数と平均残業時間</title>
  <desc id="${ID}-d">${teams.map(t => `${t.name}は${t.people}人で平均${t.hours}時間`).join('、')}。人のアイコン1つが1人、帯の長さが平均時間を表す。</desc>
  <path d="M${bar0 - 8} 196 V${214 + teams.length * 36 - 18}" stroke="#2B2A33" stroke-width="1.6"/>
  ${groups.map(g => g.svg).join('')}${groups.map(g => g.text).join('')}
</svg>`;
const ring = `<svg viewBox="0 0 300 150" preserveAspectRatio="none" aria-hidden="true"><path d="M40 7 C 120 3, 220 4, 268 8 C 292 10, 295 30, 294 60 C 293 96, 296 128, 272 140 C 210 147, 100 146, 34 142 C 8 140, 5 118, 6 80 C 7 44, 4 14, 30 9 L 84 5" stroke="#16706B" stroke-width="4" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke"/><path d="M252 2 l14 -2" stroke="#16706B" stroke-width="4" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`;

export default {
  study: true,
  id: ID,
  title: '理解度チェック：2部署の平均残業時間をまとめる',
  language: 'ja',
  notes: 'Purpose: 例題と同じ考え方を別の場面（人数と残業時間）で使えるか、その場で確かめる。\nModify: teams と options を差し替える。誤答の選択肢には、典型的な誤り（単純平均など）を1つ入れる。正答は teams から計算し、options に同じ値がないとイラストの丸が付かない。\nInvariant: 問いの数値とイラスト（1アイコン＝1人、帯の長さ＝時間）は同じデータから描く。解答は計算式つきで示す。\nStatic: 1回目のクリックで正答の丸と解答注記が現れる。最終状態では解答まで読める。配布資料で答えを隠したい場合は、解答注記を別ページに移す。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-lecture lx-p-check',
  content: `<div class="lx">
  <div class="lx-course"><b>第3回</b>データ読み解き基礎</div>
  <div class="lx-tag">理解度チェック</div>
  <h1 class="lx-h1" data-region="title">理解度チェック：2つの部署の平均を、1つにまとめると？</h1>
  <p class="lx-quiz-q">${teams[0].name}（${teams[0].people}人）の平均残業時間は月${teams[0].hours}時間、${teams[1].name}（${teams[1].people}人）は月${teams[1].hours}時間でした。2部署を合わせた${total}人の、1人あたり平均残業時間はどれでしょう。</p>
  <div class="lx-fig" style="left:64px;top:258px;width:560px;height:280px" data-region="primary">${art}</div>
  <div class="lx-choices" data-region="support">
    ${options.map(o => `<div class="lx-choice"><span class="lx-kana">${o.k}</span><p>${fmt(o.v)}<small>時間</small></p>${o === hit ? `<div class="lx-ring" data-step="1" data-motion="reveal">${ring}</div>` : ''}</div>`).join('')}
  </div>
  <section class="lx-reveal" data-step="1" data-motion="lift" data-region="support">
    <h2 class="lx-card-h">答え：${hit ? hit.k : '—'}（${fmt(correct)}時間）</h2>
    <p><span class="lx-num">(${teams.map(t => `${t.people}人 × ${t.hours}時間`).join(' ＋ ')}) ÷ ${total}人 ＝ ${sumHours} ÷ ${total} ＝ ${fmt(correct)}時間</span>。${options[0].k}の${fmt(naive)}時間は、人数の違いを無視した単純平均です。</p>
  </section>
</div>`
};
