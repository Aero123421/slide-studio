// Template: 講義・社内研修パック · 例題のステップ解説. Synthetic example content; replace data and copy.
const ID = 'tpl-lecture-example';
const stores = [
  {name: '駅前店', price: 1200, people: 300},
  {name: '郊外店', price: 2000, people: 100}
];
// One source of truth: every line below is computed from `stores`.
const rows = stores.map(s => ({...s, sales: s.price * s.people}));
const totalSales = rows.reduce((a, r) => a + r.sales, 0);
const totalPeople = rows.reduce((a, r) => a + r.people, 0);
const answer = totalSales / totalPeople;
const simple = rows.reduce((a, r) => a + r.price, 0) / rows.length;
const n = v => Math.round(v).toLocaleString('ja-JP');

const rng = (s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; })(23);
const J = a => (rng() * 2 - 1) * a, F = v => +v.toFixed(1);
const circle = (cx, cy, r, a = 1.6) => { const k = 10; let d = ''; for (let i = 0; i <= k; i++) { const t = i / k * Math.PI * 2 - .4, rr = r + J(a) + (i === k ? 3 : 0); d += (i ? ' L' : 'M') + F(cx + rr * Math.cos(t)) + ' ' + F(cy + rr * Math.sin(t)); } return d; };
const badge = (i, color) => `<svg viewBox="0 0 54 54" aria-hidden="true"><path d="${circle(27, 27, 22)}" fill="${color}" stroke="#2B2A33" stroke-width="2.2" stroke-linejoin="round"/><text x="27" y="35" text-anchor="middle" style="font:700 22px var(--lx-num);fill:#FFFDF7">${i}</text></svg>`;

const steps = [
  {h: '店ごとの売上を出す（客単価 × 客数）', color: '#3F6699',
    eq: rows.map(r => `<span class="lx-jp">${r.name}</span>${n(r.price)} × ${n(r.people)} ＝ <b>${n(r.sales)}</b> 円`)},
  {h: '売上と客数を、それぞれ合計する', color: '#3F6699',
    eq: [`<span class="lx-jp">売上の合計</span>${rows.map(r => n(r.sales)).join(' ＋ ')} ＝ <b>${n(totalSales)}</b> 円`,
         `<span class="lx-jp">客数の合計</span>${rows.map(r => n(r.people)).join(' ＋ ')} ＝ <b>${n(totalPeople)}</b> 人`]},
  {h: '売上の合計を、客数の合計で割る', color: '#16706B',
    eq: [`${n(totalSales)} ÷ ${n(totalPeople)} ＝ <b>${n(answer)}</b> 円`]}
];
// Two storefronts; one figure = one block of `perFig` customers (same convention as the concept page).
const perFig = 100;
const shopW = 180, shopGap = 16;
const person = (cx, base, h, fill) => { const r = h * .17, w = h * .5, top = base - h + 2 * r + 3, rr = w * .42;
  return `<circle cx="${F(cx)}" cy="${F(base - h + r)}" r="${F(r)}" fill="${fill}"/><path d="M${F(cx - w / 2)} ${F(base)}V${F(top + rr)}a${F(rr)} ${F(rr)} 0 0 1 ${F(rr)} ${F(-rr)}H${F(cx + w / 2 - rr)}a${F(rr)} ${F(rr)} 0 0 1 ${F(rr)} ${F(rr)}V${F(base)}Z" fill="${fill}" stroke="#2B2A33" stroke-width="1.2"/>`; };
const sk = (pts, a = 1.2) => { let d = `M${F(pts[0][0] + J(a))} ${F(pts[0][1] + J(a))}`; for (let i = 1; i <= pts.length; i++) { const p = pts[i % pts.length], q = pts[i - 1]; d += ` Q${F((p[0] + q[0]) / 2 + J(a * 1.4))} ${F((p[1] + q[1]) / 2 + J(a * 1.4))} ${F(p[0] + J(a))} ${F(p[1] + J(a))}`; } return d + 'Z'; };
const shopColors = ['#B5462E', '#3F6699'];
const shopArt = rows.map((r, i) => { const x = 8 + i * (shopW + shopGap), c = shopColors[i], k = r.people / perFig;
  const stripes = Array.from({length: 9}, (_, j) => `<rect x="${x + 6 + j * 18.7}" y="54" width="18.7" height="22" fill="${j % 2 ? '#FFFDF7' : c}"/>`).join('');
  const scallop = Array.from({length: 9}, (_, j) => `<path d="M${F(x + 6 + j * 18.7)} 76 a9.35 7 0 0 0 18.7 0" fill="${j % 2 ? '#FFFDF7' : c}" stroke="#2B2A33" stroke-width="1.4"/>`).join('');
  const figs = Array.from({length: k}, (_, j) => person(x + shopW / 2 + (j - (k - 1) / 2) * 30, 176, 40, c)).join('');
  return `<path d="${sk([[x + 14, 76], [x + shopW - 14, 76], [x + shopW - 14, 170], [x + 14, 170]])}" fill="#F6EBD5" stroke="#2B2A33" stroke-width="2"/>
    <path d="${sk([[x + 26, 32], [x + shopW - 26, 32], [x + shopW - 26, 54], [x + 26, 54]], 1)}" fill="#2B2A33"/>
    ${stripes}<path d="M${x + 6} 54 H${x + shopW - 6}" stroke="#2B2A33" stroke-width="1.6"/>${scallop}
    <path d="${sk([[x + 28, 96], [x + 86, 96], [x + 86, 136], [x + 28, 136]], 1)}" fill="#DCE6F3" stroke="#2B2A33" stroke-width="1.6"/>
    <path d="${sk([[x + 108, 98], [x + 150, 98], [x + 150, 170], [x + 108, 170]], 1)}" fill="#E7C98F" stroke="#2B2A33" stroke-width="1.6"/>
    ${figs}`; }).join('');
const shopText = rows.map((r, i) => `<text x="${8 + i * (shopW + shopGap) + shopW / 2}" y="48" text-anchor="middle" style="font:700 15px var(--lx-round);fill:#FFFDF7">${r.name}</text>`).join('');
const shops = `<svg viewBox="0 0 396 186" role="img" aria-labelledby="${ID}-shops-t">
  <title id="${ID}-shops-t">${rows.map(r => `${r.name}の客数${n(r.people)}人`).join('、')}（人の絵1つ＝${perFig}人）</title>
  <path d="M0 178 H396" stroke="#2B2A33" stroke-width="2" stroke-linecap="round"/>
  ${shopArt}${shopText}
  <text class="lx-svg-s" x="396" y="16" text-anchor="end" style="font-size:15px">人の絵1つ＝${perFig}人</text>
</svg>`;

export default {
  study: true,
  id: ID,
  title: '例題：2店舗の客単価を会社全体の1つの数字にまとめる',
  language: 'ja',
  notes: 'Purpose: 手順を1段ずつ見せ、受講者が自分の電卓で追いかけられるようにする。\nModify: stores を差し替えると、表・各ステップの式・答え・単純平均との差がすべて再計算される。手順の文言は「何をするか」を動詞で書く。\nInvariant: 途中式は省略しない。答えは単位つきで示し、単純平均との違いを一言で添える。\nStatic: クリックごとにステップ1→2→3→答えの順に現れる。最終状態ではすべての式と答えが読める。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-lecture lx-p-example',
  content: `<div class="lx">
  <div class="lx-course"><b>第3回</b>データ読み解き基礎</div>
  <div class="lx-tag">例題</div>
  <h1 class="lx-h1" data-region="title">例題：2店舗の客単価を、会社全体の1つの数字にまとめる</h1>
  <section class="lx-card lx-problem" data-region="support">
    <div class="lx-tape" style="left:160px;top:-13px"></div>
    <h2 class="lx-card-h">問題</h2>
    <p class="lx-q">今月の2店舗の実績は下の表のとおりです。会社全体で見た客単価（1人あたりの売上）はいくらですか。</p>
    <table class="lx-table"><thead><tr><th>店舗</th><th>客数</th><th>客単価</th></tr></thead>
    <tbody>${rows.map(r => `<tr><td>${r.name}</td><td class="lx-num">${n(r.people)}人</td><td class="lx-num">${n(r.price)}円</td></tr>`).join('')}</tbody></table>
    <div class="lx-fig" style="left:28px;top:318px;width:396px;height:186px">${shops}</div>
  </section>
  <div class="lx-steps" data-region="primary">
    ${steps.map((s, i) => `<div class="lx-step" data-step="${i + 1}" data-motion="lift">${badge(i + 1, s.color)}<div><h2 class="lx-step-h">STEP ${i + 1}　${s.h}</h2>${s.eq.map(e => `<p class="lx-eq">${e}</p>`).join('')}</div></div>`).join('')}
  </div>
  <section class="lx-card lx-answer" data-step="4" data-motion="settle" data-region="support">
    <h2 class="lx-card-h">答え</h2>
    <p class="lx-big">全体の客単価は <span class="lx-mark lx-num">${n(answer)}円</span></p>
    <p class="lx-why">単純平均の${n(simple)}円より${n(simple - answer)}円低くなります。客数の多い${rows.reduce((a, r) => r.people > a.people ? r : a).name}の客単価に引き寄せられるためです。</p>
  </section>
</div>`
};
