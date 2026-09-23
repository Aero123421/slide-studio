// Template: 講義・社内研修パック · 表紙と学習目標. Synthetic example content; replace data and copy.
const ID = 'tpl-lecture-goals';
const course = {series: 'データ読み解き基礎', session: '第3回', title: '平均の落とし穴',
  sub: '“平均の平均”をやめて、<span class="lx-mark">加重平均</span>で正しくまとめる',
  chips: [['対象', '店舗運営・営業企画の新任者'], ['時間', '約45分'], ['持ち物', '電卓']]};
const goals = [
  {k: '説明する', t: '単純平均と加重平均の違いを、図で説明できる'},
  {k: '計算する', t: '「合計÷合計」の手順で、加重平均を計算できる'},
  {k: '見抜く', t: '報告資料の平均値を見て、まとめ方の誤りに気づける'}
];
// The two pans foreshadow the lesson's example (same numbers as pages 2-4).
const pans = [{price: 1200, people: 300, color: '#B5462E'}, {price: 2000, people: 100, color: '#3F6699'}];

// Deterministic "hand-drawn" jitter: same output every build.
const rng = (s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; })(31);
const J = a => (rng() * 2 - 1) * a, F = n => +n.toFixed(1);
const sketch = (pts, a = 1.5) => { let d = `M${F(pts[0][0] + J(a))} ${F(pts[0][1] + J(a))}`; for (let i = 1; i <= pts.length; i++) { const p = pts[i % pts.length], q = pts[i - 1]; d += ` Q${F((p[0] + q[0]) / 2 + J(a * 1.4))} ${F((p[1] + q[1]) / 2 + J(a * 1.4))} ${F(p[0] + J(a))} ${F(p[1] + J(a))}`; } return d + 'Z'; };
const line = (x1, y1, x2, y2, a = 1.4) => `M${F(x1 + J(a * .5))} ${F(y1 + J(a * .5))} Q${F((x1 + x2) / 2 + J(a))} ${F((y1 + y2) / 2 + J(a))} ${F(x2 + J(a * .5))} ${F(y2 + J(a * .5))}`;
const person = (cx, base, h, fill) => { const r = h * .17, w = h * .5, top = base - h + 2 * r + 3, rr = w * .42;
  return `<circle cx="${F(cx)}" cy="${F(base - h + r)}" r="${F(r)}" fill="${fill}"/><path d="M${F(cx - w / 2)} ${F(base)}V${F(top + rr)}a${F(rr)} ${F(rr)} 0 0 1 ${F(rr)} ${F(-rr)}H${F(cx + w / 2 - rr)}a${F(rr)} ${F(rr)} 0 0 1 ${F(rr)} ${F(rr)}V${F(base)}Z" fill="${fill}"/>`; };
const yen = n => n.toLocaleString('ja-JP');

// Balance scale: heavier pan (more people) sinks. Tilt only signals "unequal weights", not a measured angle.
const P = {x: 260, y: 100}, L = 176, tilt = pans[0].people > pans[1].people ? 11 : -11, rad = tilt * Math.PI / 180;
const ends = [[P.x - L * Math.cos(rad), P.y + L * Math.sin(rad)], [P.x + L * Math.cos(rad), P.y - L * Math.sin(rad)]];
const drop = 112;
const panArt = pans.map((p, i) => {
  const [ex, ey] = ends[i], py = ey + drop, n = p.people / 100, gap = 30;
  const figs = Array.from({length: n}, (_, k) => person(ex + (k - (n - 1) / 2) * gap, py - 4, 50, p.color)).join('');
  return `<path d="${line(ex, ey, ex - 58, py - 2, .8)}" stroke="#2B2A33" stroke-width="1.8" fill="none"/>
    <path d="${line(ex, ey, ex + 58, py - 2, .8)}" stroke="#2B2A33" stroke-width="1.8" fill="none"/>
    ${figs}
    <path d="${sketch([[ex - 70, py - 4], [ex + 70, py - 4], [ex + 48, py + 20], [ex - 48, py + 20]], 1.2)}" fill="#F2C14E" stroke="#2B2A33" stroke-width="2.4" stroke-linejoin="round"/>`;
}).join('');
const panLabels = pans.map((p, i) => { const [ex, ey] = ends[i], py = ey + drop;
  return `<text class="lx-svg-num" x="${F(ex)}" y="${F(py + 50)}" text-anchor="middle">${yen(p.price)}円</text><text class="lx-svg-lab" x="${F(ex)}" y="${F(py + 74)}" text-anchor="middle">× ${p.people}人</text>`; }).join('');
const scale = `<svg viewBox="0 0 520 380" role="img" aria-labelledby="${ID}-art-t ${ID}-art-d">
  <title id="${ID}-art-t">人数の違う2つの皿をのせた天秤</title>
  <desc id="${ID}-art-d">客単価1,200円の皿に300人、2,000円の皿に100人。人数の多い左の皿が下がっている。</desc>
  <defs><filter id="${ID}-rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="2.4"/></filter></defs>
  <ellipse cx="262" cy="364" rx="150" ry="11" fill="rgba(90,70,40,.12)"/>
  <g filter="url(#${ID}-rough)">
    <path d="${sketch([[214, 362], [306, 362], [290, 340], [230, 340]], 1)}" fill="#E9DDC7" stroke="#2B2A33" stroke-width="2.4"/>
    <path d="${line(260, 340, 260, P.y + 6, 1)}" stroke="#2B2A33" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="${line(ends[0][0], ends[0][1], ends[1][0], ends[1][1], 1.2)}" stroke="#2B2A33" stroke-width="6" stroke-linecap="round" fill="none"/>
    <circle cx="${P.x}" cy="${P.y}" r="11" fill="#F2C14E" stroke="#2B2A33" stroke-width="2.4"/>
    ${panArt}
  </g>
  ${panLabels}
  <text class="lx-svg-hand" x="${P.x}" y="30" text-anchor="middle">どこでつり合う？</text>
  <path d="M${P.x + 4} 44 C ${P.x + 18} 58, ${P.x + 14} 72, ${P.x + 4} 82" stroke="#16706B" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path d="M${P.x - 4} 76 L${P.x + 4} 84 L${P.x + 12} 75" stroke="#16706B" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M60 36 l6 14 l14 6 l-14 6 l-6 14 l-6 -14 l-14 -6 l14 -6 z" fill="#F2C14E" opacity=".9"/>
  <path d="M486 292 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4 l9 -4 z" fill="#16706B" opacity=".55"/>
</svg>`;

const underline = `<svg viewBox="0 0 420 26" aria-hidden="true"><path d="M4 18 C 90 6, 200 8, 300 12 S 390 16, 414 8" stroke="#F2C14E" stroke-width="9" fill="none" stroke-linecap="round" opacity=".9"/></svg>`;
const check = (i) => `<svg viewBox="0 0 52 52" aria-hidden="true"><path d="${sketch([[6, 8], [44, 6], [46, 44], [8, 46]], 1.6)}" fill="#FFFDF7" stroke="#2B2A33" stroke-width="2.4"/><path d="M14 26 L23 36 L44 ${10 + i * 2}" stroke="#16706B" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export default {
  study: true,
  id: ID,
  title: '平均の落とし穴：表紙と学習目標',
  language: 'ja',
  notes: 'Purpose: 講義の題名・対象・所要時間と、受講後にできるようになることを最初に約束する。\nModify: course と goals を差し替える。目標は「〜できる」で終わる観察可能な行動にし、3つ以内に保つ。天秤の皿の数値は以降の例題と同じデータにそろえる。\nInvariant: 目標は測れる動詞で書く。イラストは本題（重さの違うものの平均）を予告するもので、装飾だけの図にしない。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-lecture lx-p-goals',
  content: `<div class="lx">
  <div class="lx-course" data-region="support"><b>${course.session}</b>${course.series}</div>
  <h1 class="lx-title" data-region="title">${course.title}</h1>
  <div class="lx-deco" style="left:60px;top:190px;width:420px;height:26px">${underline}</div>
  <p class="lx-sub">${course.sub}</p>
  <div class="lx-chips">${course.chips.map(([k, v]) => `<span class="lx-chip"><b>${k}</b>${v}</span>`).join('')}</div>
  <div class="lx-fig" style="left:708px;top:44px;width:508px;height:371px" data-region="primary">${scale}</div>
  <section class="lx-card lx-goals" data-region="support">
    <div class="lx-tape" style="left:40px;top:-12px"></div><div class="lx-tape is-teal" style="right:48px;top:-10px;transform:rotate(4deg)"></div>
    <h2 class="lx-card-h">この講義が終わったとき、次の3つができるようになります</h2>
    <div class="lx-goal-row">${goals.map((g, i) => `<div class="lx-goal">${check(i)}<div><div class="lx-goal-k">${String(i + 1).padStart(2, '0')}　${g.k}</div><p>${g.t}</p></div></div>`).join('')}</div>
  </section>
</div>`
};
