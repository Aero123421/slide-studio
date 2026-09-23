// Template: 講義・社内研修パック · 概念図（てんびんで見る加重平均）. Synthetic example content; replace data and copy.
const ID = 'tpl-lecture-concept';
const stores = [
  {name: '駅前店', price: 1200, people: 300, fill: '#B5462E'},
  {name: '郊外店', price: 2000, people: 100, fill: '#3F6699'}
];
const unit = 100; // one block = 100 people
const totalPeople = stores.reduce((a, s) => a + s.people, 0);
const weighted = stores.reduce((a, s) => a + s.price * s.people, 0) / totalPeople; // 1,400
const simple = stores.reduce((a, s) => a + s.price, 0) / stores.length;            // 1,600
const moments = stores.map(s => ({...s, arm: Math.abs(s.price - weighted), m: Math.abs(s.price - weighted) * s.people}));
const yen = n => Math.round(n).toLocaleString('ja-JP');

// Deterministic hand-drawn jitter.
const rng = (s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; })(7);
const J = a => (rng() * 2 - 1) * a, F = n => +n.toFixed(1);
const sketch = (pts, a = 1.5) => { let d = `M${F(pts[0][0] + J(a))} ${F(pts[0][1] + J(a))}`; for (let i = 1; i <= pts.length; i++) { const p = pts[i % pts.length], q = pts[i - 1]; d += ` Q${F((p[0] + q[0]) / 2 + J(a * 1.4))} ${F((p[1] + q[1]) / 2 + J(a * 1.4))} ${F(p[0] + J(a))} ${F(p[1] + J(a))}`; } return d + 'Z'; };
const line = (x1, y1, x2, y2, a = 1.4) => `M${F(x1 + J(a * .5))} ${F(y1 + J(a * .5))} Q${F((x1 + x2) / 2 + J(a))} ${F((y1 + y2) / 2 + J(a))} ${F(x2 + J(a * .5))} ${F(y2 + J(a * .5))}`;
const person = (cx, base, h, fill) => { const r = h * .17, w = h * .5, top = base - h + 2 * r + 3, rr = w * .42;
  return `<circle cx="${F(cx)}" cy="${F(base - h + r)}" r="${F(r)}" fill="${fill}"/><path d="M${F(cx - w / 2)} ${F(base)}V${F(top + rr)}a${F(rr)} ${F(rr)} 0 0 1 ${F(rr)} ${F(-rr)}H${F(cx + w / 2 - rr)}a${F(rr)} ${F(rr)} 0 0 1 ${F(rr)} ${F(rr)}V${F(base)}Z" fill="${fill}"/>`; };

// Geometry: the number line is the floor; x is computed from the price domain.
const dom = [1000, 2200], X0 = 90, X1 = 1062, xs = v => X0 + (v - dom[0]) / (dom[1] - dom[0]) * (X1 - X0);
const floor = 266, beamTop = 172, beamH = 14, apex = beamTop + beamH, bw = 92, bh = 40;
const ticks = []; for (let v = dom[0]; v <= dom[1]; v += 200) ticks.push(v);
const tri = (x, cls) => `<path d="${sketch([[x, apex], [x + 44, floor], [x - 44, floor]], 1.2)}" ${cls}/>`;
const blocks = stores.map(s => { const x = xs(s.price), n = s.people / unit;
  return Array.from({length: n}, (_, k) => { const y = beamTop - bh * (k + 1);
    return `<path d="${sketch([[x - bw / 2, y + 2], [x + bw / 2, y + 2], [x + bw / 2, y + bh], [x - bw / 2, y + bh]], 1.3)}" fill="${s.fill}" stroke="#2B2A33" stroke-width="2"/>${person(x - 24, y + bh - 5, 26, '#FFFDF7')}`; }).join(''); }).join('');
const blockText = stores.map(s => { const x = xs(s.price), n = s.people / unit;
  return Array.from({length: n}, (_, k) => `<text class="lx-svg-w" x="${F(x + 12)}" y="${F(beamTop - bh * (k + 1) + 28)}" text-anchor="middle">${unit}人</text>`).join('')
    + `<text class="lx-svg-b" x="${F(x)}" y="${F(beamTop - bh * n - 14)}" text-anchor="middle">${s.name}　${yen(s.price)}円 × ${s.people}人</text>`; }).join('');
const xw = xs(weighted), xsimp = xs(simple);
const arms = moments.map(s => { const x = xs(s.price), left = x < xw, a = left ? xw - 16 : xw + 16, b = left ? x + 4 : x - 4, y = 212;
  const head = left ? `M${F(b + 10)} ${y - 6} L${F(b)} ${y} L${F(b + 10)} ${y + 6}` : `M${F(b - 10)} ${y - 6} L${F(b)} ${y} L${F(b - 10)} ${y + 6}`;
  return `<path d="${line(a, y, b, y, 1)}" stroke="#655C50" stroke-width="2" fill="none"/><path d="${head}" stroke="#655C50" stroke-width="2" fill="none" stroke-linecap="round"/>
  <text class="lx-svg-s" x="${F((a + b) / 2)}" y="${y + 26}" text-anchor="middle">距離 ${yen(s.arm)}円</text>`; }).join('');

const svg = `<svg viewBox="0 0 1152 330" role="img" aria-labelledby="${ID}-t ${ID}-d">
  <title id="${ID}-t">客単価の数直線の上でつり合う板</title>
  <desc id="${ID}-d">数直線の${yen(stores[0].price)}円に${stores[0].name}の${stores[0].people}人、${yen(stores[1].price)}円に${stores[1].name}の${stores[1].people}人を重りとして置くと、支点${yen(weighted)}円でつり合う。単純平均${yen(simple)}円の位置ではつり合わない。</desc>
  <defs><filter id="${ID}-rough" x="-2%" y="-10%" width="104%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="9"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter></defs>
  <g filter="url(#${ID}-rough)">
    <path d="${line(40, floor, 1112, floor, 1.2)}" stroke="#2B2A33" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${ticks.map(v => `<path d="${line(xs(v), floor, xs(v), floor + 10, .6)}" stroke="#2B2A33" stroke-width="2"/>`).join('')}
    <path d="M${F(xsimp)} 104 V${floor}" stroke="#B5462E" stroke-width="2" stroke-dasharray="6 7" fill="none"/>
    ${tri(xsimp, 'fill="none" stroke="#B5462E" stroke-width="2.2" stroke-dasharray="7 6"')}
    ${tri(xw, 'fill="#16706B" stroke="#2B2A33" stroke-width="2.4"')}
    <path d="${sketch([[150, beamTop], [1010, beamTop], [1010, beamTop + beamH], [150, beamTop + beamH]], 1.4)}" fill="#E7C98F" stroke="#2B2A33" stroke-width="2.4"/>
    ${blocks}
    ${arms}
  </g>
  ${blockText}
  ${ticks.map(v => `<text class="lx-svg-axis" x="${F(xs(v))}" y="${floor + 32}" text-anchor="middle">${yen(v)}</text>`).join('')}
  <text class="lx-svg-s" x="${X1}" y="${floor + 58}" text-anchor="end">客単価（円）</text>
  <text class="lx-svg-b" x="${F(xw + 6)}" y="${beamTop - 14}" text-anchor="middle" style="fill:#16706B">支点＝加重平均 ${yen(weighted)}円</text>
  <text class="lx-svg-b" x="${F(xsimp)}" y="74" text-anchor="middle" style="fill:#B5462E">単純平均 ${yen(simple)}円</text>
  <text class="lx-svg-s" x="${F(xsimp)}" y="96" text-anchor="middle">ここを支点にすると傾く</text>
</svg>`;

export default {
  study: true,
  id: ID,
  title: '概念図：加重平均は人数という重りでつり合う点',
  language: 'ja',
  notes: 'Purpose: 加重平均を「重りでつり合う支点」という1枚の絵で理解させる。\nModify: stores の単価と人数を変えると、支点・単純平均の位置・距離のラベルがすべて再計算される。1ブロック＝unit 人。\nInvariant: 横軸は数直線（等間隔の目盛り）。支点は計算した加重平均の位置に置き、左右のモーメント（距離×人数）が等しいことを右下で確かめる。単純平均は比較用に点線で示す。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-lecture lx-p-concept',
  content: `<div class="lx">
  <div class="lx-course"><b>第3回</b>データ読み解き基礎</div>
  <div class="lx-tag">考え方</div>
  <h1 class="lx-h1" data-region="title">加重平均は、人数という<span class="lx-mark">“重り”でつり合う点</span></h1>
  <p class="lx-lead" style="left:64px;top:136px;width:1152px">客単価をまとめるときは、客数が重りになります。各店の重りを客単価の位置に置くと、板がつり合う支点が会社全体の客単価（加重平均）です。</p>
  <div class="lx-fig" style="left:64px;top:214px;width:1152px;height:330px" data-region="primary">${svg}</div>
  <div class="lx-legend" style="top:574px;flex-direction:column;gap:6px" data-region="support">
    <span><i style="background:#E7C98F;border:1.5px solid #2B2A33"></i>位置 ＝ 各店の客単価（数直線）</span>
    <span><i style="background:#B5462E"></i>重り ＝ 各店の客数（1ブロック＝${unit}人）</span>
    <span><i style="background:#16706B;border-radius:0;clip-path:polygon(50% 0,100% 100%,0 100%)"></i>支点 ＝ 全体の平均（加重平均）</span>
  </div>
  <div class="lx-note" style="left:716px;top:566px;width:500px" data-region="support">
    <div class="lx-note-h">つり合いの確認（距離 × 人数）</div>
    <p>${moments.map(s => `${s.name}：<span class="lx-num">${yen(s.arm)}円 × ${s.people}人 ＝ ${yen(s.m)}</span>`).join('<br>')}</p>
  </div>
</div>`
};
