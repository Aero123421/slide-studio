// Template: 学会発表（日本語） · 背景（なぜラベルが足りないか＋タスクの図）. Synthetic example content; replace data and copy.
// The patch (a) and the mask (b) are rasterised from ONE crack geometry, pixel by pixel, so the
// mask is exactly what an annotator would have to paint. It is a schematic, and the page says so.
import { el, esc, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-research-ja-background';
const cost = {
  unlabeled: 18000,      // images from routine inspections of 3 bridges over 2 years
  bridges: 3, years: 2,
  minutesPerMask: 30,    // average time to paint one pixel-level crack mask
  labeled: 50,           // masks made for this study
  hoursPerYear: 2000,    // one person's working hours per year
};
// Crack centreline in patch pixels (0–50) with local width in pixels: [x, y, width]
const crack = {
  size: 50,
  main: [[-1, 11, 2.7], [6, 13, 2.6], [12, 16, 2.5], [17, 16.5, 2.3], [22, 20, 2.1], [27, 23, 1.8], [31, 27, 1.6], [36, 29, 1.3], [41, 33, 1.1], [46, 38, 1.0], [51, 40, 0.9]],
  branch: [[22, 20, 1.3], [24, 26, 1.1], [23, 32, 1.0], [26, 38, 0.9], [28, 44, 0.8], [30, 51, 0.8]],
};
const px = 6;            // drawn size of one image pixel, in slide px

// ---- rasterise: distance from each pixel centre to the centreline
const N = crack.size;
const segs = [crack.main, crack.branch].flatMap(line => line.slice(1).map((p, i) => [line[i], p]));
function nearest(x, y) {
  let best = { gap: Infinity, w: 0, d: Infinity };
  for (const [[x0, y0, w0], [x1, y1, w1]] of segs) {
    const vx = x1 - x0, vy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * vx + (y - y0) * vy) / (vx * vx + vy * vy)));
    const d = Math.hypot(x - (x0 + t * vx), y - (y0 + t * vy)), w = w0 + t * (w1 - w0);
    if (d - w / 2 < best.gap) best = { gap: d - w / 2, w, d };
  }
  return best;
}
// Deterministic integer hash → [0,1) for the concrete texture (no randomness between builds)
const hash = (i, j) => { let h = (i * 374761393 + j * 668265263) ^ 0x5bd1e995; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const smooth = (x, y) => { // value noise, 4-pixel cells
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, s = t => t * t * (3 - 2 * t);
  const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
  return a + (b - a) * s(fx) + (c - a) * s(fy) + (a - b - c + d) * s(fx) * s(fy);
};
const grey = [], mask = [];
for (let j = 0; j < N; j++) {
  grey.push([]); mask.push([]);
  for (let i = 0; i < N; i++) {
    const n = nearest(i + 0.5, j + 0.5);
    const cover = Math.max(0, Math.min(1, n.w / 2 - n.d + 0.5));        // share of the pixel the crack covers
    const ground = 0.76 + 0.07 * (smooth(i / 3, j / 3) - 0.5) + 0.05 * (hash(i + 97, j + 31) - 0.5);
    const depth = 0.18 + 0.16 * Math.min(n.w, 3);                        // wide cracks are darker
    grey[j].push(Math.max(0, Math.min(1, ground - cover * depth)));
    mask[j].push(n.d <= Math.max(n.w / 2, 0.5) ? 1 : 0);               // ≥ 1 px wide, 8-connected
  }
}
const crackPixels = mask.flat().reduce((a, b) => a + b, 0);
const share = crackPixels / (N * N);
const widths = [...crack.main, ...crack.branch].map(p => p[2]);
const wMin = Math.max(1, Math.round(Math.min(...widths))), wMax = Math.round(Math.max(...widths));

// ---- derived cost figures
const hoursAll = cost.unlabeled * cost.minutesPerMask / 60;
const hoursOurs = cost.labeled * cost.minutesPerMask / 60;
const years = hoursAll / cost.hoursPerYear;
const yearsText = Number.isInteger(years) ? `${years}年` : Math.abs(years % 1 - 0.5) < 0.01 ? `${Math.floor(years)}年半` : `${years.toFixed(1)}年`;
const n0 = v => fmt(v, { locale: 'ja', digits: 0 });

// ---- drawing: runs of equal quantised grey become one rect (keeps the SVG small)
const W = 662, H = 404, P = N * px, gap = W - 2 * P, top = 34;
const levels = 40, toHex = v => { const k = Math.round(v * 255).toString(16).padStart(2, '0'); return `#${k}${k}${k}`; };
function patch(x0) {
  const out = [];
  for (let j = 0; j < N; j++) {
    let i = 0;
    while (i < N) {
      const q = Math.round(grey[j][i] * (levels - 1));
      let k = i + 1;
      while (k < N && Math.round(grey[j][k] * (levels - 1)) === q) k++;
      out.push(el('rect', { x: x0 + i * px, y: top + j * px, width: (k - i) * px, height: px, fill: toHex(q / (levels - 1)) }));
      i = k;
    }
  }
  return out.join('');
}
function maskPanel(x0) {
  const out = [el('rect', { x: x0, y: top, width: P, height: P, fill: '#ffffff' })];
  for (let k = 1; k < N; k++) out.push(el('path', { d: `M${x0 + k * px} ${top}V${top + P}M${x0} ${top + k * px}H${x0 + P}`, stroke: 'var(--rj-grid)', 'stroke-width': 1 }));
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (mask[j][i]) out.push(el('rect', { x: x0 + i * px, y: top + j * px, width: px, height: px, fill: 'var(--rj-ink)' }));
  out.push(el('rect', { x: x0 + 0.5, y: top + 0.5, width: P - 1, height: P - 1, fill: 'none', stroke: 'var(--rj-base2)', 'stroke-width': 1 }));
  return out.join('');
}
const bx = P + gap;
const caption = (x, y, lines) => el('text', { x, y, class: 's-lab' }, lines.map((l, k) => el('tspan', { x, dy: k ? 22 : null }, l)).join(''));
const fig = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">ひび割れを含む画像の一部と、その正解マスク（模式図）</title>
<desc id="${ID}-d">(a) ${N}×${N}画素の点検画像。幅${wMax}画素から${wMin}画素へ細くなるひび割れが枝分かれして走り、細い部分は背景とほぼ同じ濃さになる。(b) 同じ範囲の正解マスク。ひび割れの画素に1を付けると${n0(N * N)}画素のうち${crackPixels}画素（${(share * 100).toFixed(1)}%）になる。</desc>
<text x="0" y="18" class="s-panel">(a) 点検画像の一部<tspan class="s-lab" dx="10">${N}×${N}画素</tspan></text>
<text x="${bx}" y="18" class="s-panel">(b) 正解マスク<tspan class="s-lab" dx="10">ひび割れの画素＝1</tspan></text>
${patch(0)}
${maskPanel(bx)}
${caption(0, top + P + 30, [`幅${wMax}画素の幹から幅${wMin}画素の枝まで。`, '細い部分は背景とほとんど同じ濃さ'])}
${caption(bx, top + P + 30, [`1を付けるのは${crackPixels}画素（${(share * 100).toFixed(1)}%）。`, '1画素ずつ塗って決める'])}
</svg>`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Background: pixel-level crack masks are too slow to make for every inspection image',
  notes: 'Purpose: なぜラベルが足りないのかを、作業の単位（1画素）と作業時間の掛け算で示し、研究の問いを置く。\nModify: cost の枚数・橋の数・1枚あたりの時間・正解を付けた枚数を実際の値にする（右の計算と時間は自動で再計算）。crack の座標と幅を変えると (a)(b) とその説明文の画素数・割合が再計算される。実画像を使う場合は (a) を画像に替え、(b) は実際の正解マスクにする。\nInvariant: (a) と (b) は同じ範囲・同じ縮尺。模式図であることを図の下に書く。右の計算は 枚数 × 時間 = 合計 の順で、単位を省かない。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-research-ja rj-background',
  content: `<h1 class="rj-h" data-region="title">正解マスクは画素単位で<span class="nw">1枚${cost.minutesPerMask}分</span>。<span class="nw">${n0(cost.unlabeled)}枚</span>すべてには付けられない</h1>
<figure class="rj-fig" style="left:64px;top:186px" data-region="primary">${fig}</figure>
<p class="rj-note" style="left:64px;top:596px;width:662px" data-region="source">模式図。ひび割れの形と画素の濃さは説明のために作図したもので、実測画像ではない</p>
<div class="rj-rail" data-region="support">
<div class="rj-calc">
  <div><i></i><b>${n0(cost.unlabeled)}<small>枚</small></b><span>${cost.bridges}橋・${cost.years}年分の点検画像</span></div>
  <div><i>×</i><b>${cost.minutesPerMask}<small>分</small></b><span>正解マスク1枚の作業</span></div>
  <div class="rj-total"><i>=</i><b>${n0(hoursAll)}<small>時間</small></b><span>1人で約${yearsText}</span></div>
</div>
<p class="rj-ours">本研究の正解マスクは<b class="nw">${cost.labeled}枚</b><span class="nw">（作業${n0(hoursOurs)}時間）</span></p>
<p class="rj-q">正解${cost.labeled}枚と未ラベル<span class="nw">${n0(cost.unlabeled)}枚</span>から、どこまで正確にひび割れを抜き出せるか。</p>
</div>
<footer class="rj-foot"><span>ラベル50枚で学ぶひび割れ検出</span><b>2</b></footer>`,
};
