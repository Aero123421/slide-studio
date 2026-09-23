// Template: 講義・社内研修パック · よくある誤りと正しい考え方. Synthetic example content; replace data and copy.
const ID = 'tpl-lecture-mistake';
const stores = [
  {name: '駅前店', price: 1200, people: 300, fill: '#B5462E'},
  {name: '郊外店', price: 2000, people: 100, fill: '#3F6699'}
];
const unit = 100;
const totalPeople = stores.reduce((a, s) => a + s.people, 0);
const totalSales = stores.reduce((a, s) => a + s.price * s.people, 0);
const weighted = totalSales / totalPeople;
const simple = stores.reduce((a, s) => a + s.price, 0) / stores.length;
const gap = simple - weighted, gapPct = gap / weighted * 100;
// Net turning effect around a candidate fulcrum: >0 means the right side is heavier.
const torque = f => stores.reduce((a, s) => a + (s.price - f) * s.people, 0);
const n = v => Math.round(v).toLocaleString('ja-JP');

const rng = (s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; })(41);
const J = a => (rng() * 2 - 1) * a, F = v => +v.toFixed(1);
const sketch = (pts, a = 1.3) => { let d = `M${F(pts[0][0] + J(a))} ${F(pts[0][1] + J(a))}`; for (let i = 1; i <= pts.length; i++) { const p = pts[i % pts.length], q = pts[i - 1]; d += ` Q${F((p[0] + q[0]) / 2 + J(a * 1.4))} ${F((p[1] + q[1]) / 2 + J(a * 1.4))} ${F(p[0] + J(a))} ${F(p[1] + J(a))}`; } return d + 'Z'; };
const line = (x1, y1, x2, y2, a = 1.2) => `M${F(x1 + J(a * .5))} ${F(y1 + J(a * .5))} Q${F((x1 + x2) / 2 + J(a))} ${F((y1 + y2) / 2 + J(a))} ${F(x2 + J(a * .5))} ${F(y2 + J(a * .5))}`;

// Mini seesaw: same scale on both cards so the two pictures are directly comparable.
const dom = [1000, 2200], xs = v => 36 + (v - dom[0]) / (dom[1] - dom[0]) * 440;
const floor = 150, beamTop = 96, beamH = 9, apex = beamTop + beamH, bw = 46, bh = 20;
function seesaw(key, fulcrum, color, dashed) {
  const t = torque(fulcrum), deg = Math.abs(t) < 1e-9 ? 0 : (t > 0 ? 7 : -7); // clockwise = right side down
  const fx = xs(fulcrum);
  const weights = stores.map(s => { const x = xs(s.price), k = s.people / unit;
    return Array.from({length: k}, (_, j) => `<path d="${sketch([[x - bw / 2, beamTop - bh * (j + 1)], [x + bw / 2, beamTop - bh * (j + 1)], [x + bw / 2, beamTop - bh * j], [x - bw / 2, beamTop - bh * j]], 1)}" fill="${s.fill}" stroke="#2B2A33" stroke-width="1.6"/>`).join(''); }).join('');
  const ticks = []; for (let v = dom[0]; v <= dom[1]; v += 200) ticks.push(`<path d="M${F(xs(v))} ${floor} v7" stroke="#2B2A33" stroke-width="1.6"/>`);
  const status = deg === 0 ? '左右がつり合う' : (deg < 0 ? '左に傾く' : '右に傾く');
  return `<svg viewBox="0 0 512 186" role="img" aria-labelledby="${ID}-${key}-t">
    <title id="${ID}-${key}-t">支点${n(fulcrum)}円のてんびん：${status}</title>
    <defs><filter id="${ID}-${key}-rough" x="-3%" y="-10%" width="106%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="1.8"/></filter></defs>
    <g filter="url(#${ID}-${key}-rough)">
      <path d="${line(20, floor, 492, floor)}" stroke="#2B2A33" stroke-width="2.4" fill="none" stroke-linecap="round"/>${ticks.join('')}
      <path d="${sketch([[fx, apex], [fx + 26, floor], [fx - 26, floor]], 1)}" fill="${dashed ? 'none' : color}" stroke="${dashed ? color : '#2B2A33'}" stroke-width="2.2" ${dashed ? 'stroke-dasharray="5 4"' : ''}/>
      <g transform="rotate(${deg} ${F(fx)} ${apex})">
        <path d="${sketch([[70, beamTop], [446, beamTop], [446, beamTop + beamH], [70, beamTop + beamH]], 1)}" fill="#E7C98F" stroke="#2B2A33" stroke-width="2"/>
        ${weights}
      </g>
      ${deg ? `<path d="M${F(fx + (deg < 0 ? -150 : 150))} 26 q ${deg < 0 ? -40 : 40} 6 ${deg < 0 ? -52 : 52} 40" stroke="${color}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M${F(fx + (deg < 0 ? -208 : 208))} 56 l${deg < 0 ? 6 : -6} 12 l${deg < 0 ? 8 : -8} -10" stroke="${color}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
    </g>
    <text class="lx-svg-b" x="${F(fx)}" y="${floor + 30}" text-anchor="middle" style="fill:${color}">支点 ${n(fulcrum)}円</text>
    <text class="lx-svg-s" x="${deg ? F(fx + (deg < 0 ? -110 : 110)) : F(fx + 150)}" y="${deg ? 22 : 40}" text-anchor="middle" style="fill:${color};font-weight:700">${status}</text>
  </svg>`;
}
const mark = ok => ok
  ? `<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M5 18 L13 27 L30 6" stroke="#16706B" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  : `<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M7 7 L28 28 M28 6 L6 28" stroke="#B5462E" stroke-width="4.5" fill="none" stroke-linecap="round"/></svg>`;
const left = stores[0], right = stores[1];

export default {
  study: true,
  id: ID,
  title: 'よくある誤り：平均どうしをそのまま足して割る',
  language: 'ja',
  notes: 'Purpose: 誤った計算と正しい計算を同じ縮尺の図で並べ、どこで考え違いが起きるかを示す。\nModify: stores を差し替えると、両方の式・てんびんの傾き・ズレの金額と割合が再計算される。\nInvariant: 左右のカードは同じ横軸・同じ重りの絵で比べる（縮尺をそろえる）。誤りを責める言い方ではなく、原因（重りを無視）を1文で説明する。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-lecture lx-p-mistake',
  content: `<div class="lx">
  <div class="lx-course"><b>第3回</b>データ読み解き基礎</div>
  <div class="lx-tag">つまずきポイント</div>
  <h1 class="lx-h1" data-region="title">誤りは“平均の平均”。客数が違えば、同じ重さでは扱えない</h1>
  <section class="lx-card lx-vs lx-wrong" style="left:64px" data-region="primary">
    <div class="lx-tape is-terra" style="left:210px;top:-12px"></div>
    <h2 class="lx-card-h">${mark(false)}よくある誤り</h2>
    <p class="lx-formula">(${n(left.price)}<span class="lx-jp">円</span> ＋ ${n(right.price)}<span class="lx-jp">円</span>) ÷ ${stores.length} ＝ ${n(simple)}<span class="lx-jp">円</span></p>
    <div class="lx-fig">${seesaw('wrong', simple, '#B5462E', true)}</div>
    <p class="lx-explain">${n(simple)}円を支点にすると、左は${n(simple - left.price)}円×${left.people}人、右は${n(right.price - simple)}円×${right.people}人。人数の多い左側に傾きます。2店を同じ重さで扱ったことが原因です。</p>
  </section>
  <section class="lx-card lx-vs lx-right" style="left:668px" data-region="primary">
    <div class="lx-tape is-teal" style="left:210px;top:-12px"></div>
    <h2 class="lx-card-h">${mark(true)}正しい考え方</h2>
    <p class="lx-formula">${n(totalSales)}<span class="lx-jp">円</span> ÷ ${n(totalPeople)}<span class="lx-jp">人</span> ＝ ${n(weighted)}<span class="lx-jp">円</span></p>
    <div class="lx-fig">${seesaw('right', weighted, '#16706B', false)}</div>
    <p class="lx-explain">売上の合計を客数の合計で割ると、客数がそのまま重りになります。左は${n(weighted - left.price)}円×${left.people}人、右は${n(right.price - weighted)}円×${right.people}人で、ちょうどつり合います。</p>
  </section>
  <div class="lx-gap" data-region="support">
    <div class="lx-gap-n">ズレ <span class="lx-num">＋${n(gap)}円（＋${gapPct.toFixed(1)}%）</span></div>
    <p>単純平均は、実際の1人あたり客単価を高く見せます。平均どうしを足している資料を見たら、重り（人数・件数）がそろっているかを確かめましょう。</p>
  </div>
</div>`
};
