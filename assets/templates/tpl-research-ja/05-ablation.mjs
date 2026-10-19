// Template: 学会発表（日本語） · アブレーション（差分の表＋区間のドットプロット）. Synthetic example content; replace data and copy.
// One table drawn as one SVG so every row, number and interval shares exact baselines.
// Differences are paired over the same runs (same labelled subsets and seeds); intervals use t (df = runs − 1).
import { el, linear, textLines, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-research-ja-ablation';
const runs = 5, tCrit = { 4: 2.776 }[runs - 1];
const labeled = 50;
const full = { name: '提案法（すべてあり）', iou: 63.8, breaks: 1.9 };   // same as the result page at 50 labels
const groups = [
  { title: '1つずつ外す', rows: [
    { name: 'しきい値を0.9の1段にする', iou: 59.2, sdDiff: 1.1, breaks: 4.7 },
    { name: '強い摂動での学習をやめる', iou: 60.9, sdDiff: 1.0, breaks: 2.4 },
    { name: '教師の指数移動平均をやめる', iou: 62.9, sdDiff: 0.9, breaks: 2.1 },
  ] },
  { title: '従来法まで戻す', rows: [
    { name: 'しきい値も摂動もやめる＝擬似ラベル法', iou: 56.1, sdDiff: 1.3, breaks: 5.3 },
    { name: '未ラベル画像を使わない＝教師あり学習', iou: 50.2, sdDiff: 1.6, breaks: 7.8 },
  ] },
];
// iou: IoU of the crack class (%), mean of runs · sdDiff: SD of the per-run difference to 提案法 (pt)
// breaks: places per image where a crack that is one line in the mask is cut in the prediction

// ---- derived
const all = groups.flatMap(g => g.rows).map(r => {
  const d = r.iou - full.iou, h = tCrit * r.sdDiff / Math.sqrt(runs);
  return Object.assign(r, { d, lo: d - h, hi: d + h, crosses: d - h <= 0 && d + h >= 0 });
});
const single = groups[0].rows;
const top = [...single].sort((a, b) => a.d - b.d)[0];               // largest single-component effect
const times = top.breaks / full.breaks;
const f1 = v => fmt(v, { digits: 1 });
const sg = v => fmt(v, { digits: 1, sign: true });

// ---- table geometry
const W = 1152, rowH = 42, groupH = 30, headH = 44;
const col = { name: 0, iou: 560, diff: 780, plot0: 836, plot1: 1040, breaks: 1152 };
const x = linear([-16, 2], [col.plot0, col.plot1]);
let yy = headH;
const out = [];
const rule = (y, strong) => el('line', { x1: 0, x2: W, y1: y, y2: y, stroke: strong ? 'var(--rj-ink)' : 'var(--rj-rule)', 'stroke-width': strong ? 1.5 : 1 });
const head = (tx, anchor, lines) => textLines(lines, { x: tx, y: headH - 12, size: 15, valign: 'bottom', anchor, fill: 'var(--rj-muted)', lineHeight: 1.3 });
out.push(head(col.name, 'start', [`構成（ラベル${labeled}枚）`]), head(col.iou, 'end', ['IoU（%）']), head(col.diff, 'end', ['提案法との差', '[95%区間]']),
  head((col.plot0 + col.plot1) / 2, 'middle', ['差（ポイント）']), head(col.breaks, 'end', ['途切れ', '（か所／枚）']), rule(headH, true));
const num = (tx, ty, text, opts = {}) => textLines([text], { x: tx, y: ty, size: 19, anchor: 'end', valign: 'middle', fill: 'var(--rj-ink)', weight: opts.weight, attrs: { 'font-variant-numeric': 'tabular-nums' } });
// reference row
let cy = yy + rowH / 2;
out.push(textLines([full.name], { x: col.name, y: cy, size: 19, valign: 'middle', fill: 'var(--rj-accent)', weight: 600 }),
  num(col.iou, cy, f1(full.iou), { weight: 600 }), textLines(['基準'], { x: col.diff, y: cy, size: 17, anchor: 'end', valign: 'middle', fill: 'var(--rj-muted)' }),
  num(col.breaks, cy, f1(full.breaks), { weight: 600 }));
yy += rowH;
const plotTop = yy;
for (const g of groups) {
  out.push(rule(yy), textLines([g.title], { x: col.name, y: yy + groupH / 2 + 2, size: 15, valign: 'middle', fill: 'var(--rj-muted)' }));
  yy += groupH;
  for (const r of g.rows) {
    cy = yy + rowH / 2;
    const strong = r === top;
    out.push(
      textLines([r.name], { x: col.name, y: cy, size: 19, valign: 'middle', fill: 'var(--rj-ink)', weight: strong ? 600 : null }),
      num(col.iou, cy, f1(r.iou)),
      num(col.diff, cy, `${sg(r.d)}  [${sg(r.lo)}, ${sg(r.hi)}]`, { weight: strong ? 600 : null }),
      el('line', { x1: x(r.lo), x2: x(r.hi), y1: cy, y2: cy, stroke: 'var(--rj-ink)', 'stroke-width': 2.2, 'stroke-linecap': 'round' }),
      el('circle', { cx: x(r.d), cy, r: 6, fill: r.crosses ? '#fff' : 'var(--rj-ink)', stroke: 'var(--rj-ink)', 'stroke-width': 2 }),
      num(col.breaks, cy, f1(r.breaks), { weight: strong ? 600 : null }));
    yy += rowH;
  }
}
const plotBottom = yy;
out.push(rule(yy, true));
// shared axis for the interval column: reference at 0 (= 提案法)
const ticks = [-15, -10, -5, 0];
out.splice(1, 0, ...ticks.map(v => el('line', { x1: x(v), x2: x(v), y1: plotTop, y2: plotBottom, stroke: v === 0 ? 'var(--rj-accent)' : 'var(--rj-grid)', 'stroke-width': v === 0 ? 1.5 : 1 })));
out.push(...ticks.map(v => textLines([v === 0 ? '0' : fmt(v)], { x: x(v), y: yy + 8, size: 15, anchor: 'middle', valign: 'top', fill: v === 0 ? 'var(--rj-accent)' : 'var(--rj-muted)', attrs: { 'font-variant-numeric': 'tabular-nums' } })));
const H = yy + 30;
const table = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">構成要素を外したときのIoUの差と途切れの数（ラベル${labeled}枚）</title>
<desc id="${ID}-d">提案法（IoU ${f1(full.iou)}%、途切れ${f1(full.breaks)}か所）からの差。${all.map(r => `${r.name}：${sg(r.d)}ポイント（95%区間 ${sg(r.lo)}〜${sg(r.hi)}）、途切れ${f1(r.breaks)}か所`).join('。')}。</desc>
${out.join('\n')}
</svg>`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Ablation: the two-level threshold contributes most; removing it costs 4.6 points of IoU',
  notes: `Purpose: どの構成要素が効いているのかを、提案法との差と区間で読ませる表。差の大きさを1本の目盛にそろえて比べる。\nModify: full と groups の各行（IoU の平均、差のSD、途切れ）を書き換える。差・区間・点の位置・見出しの数値（最大の要素と倍率）は自動で再計算される。行を増やすと表の高さも伸びるので、6〜7行までにとどめる。\nInvariant: 差は同じ試行どうしの対応のある差で、区間の定義を表の下に書く。目盛はすべての行で共通、0（提案法）に基準線。区間が0をまたぐ行は白抜きの点にする。\nStatic: 静的ページ。`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-research-ja rj-ablation',
  content: `<h1 class="rj-h" data-region="title">効いているのは2段のしきい値。外すとIoUが<span class="nw">${f1(-top.d)}ポイント</span>下がり、<span class="nw">途切れは${f1(times)}倍</span>になる</h1>
<figure class="rj-fig" style="left:64px;top:184px" data-region="primary">${table}</figure>
<p class="rj-note" style="left:64px;top:${184 + H + 10}px;width:1152px" data-region="source">全行ラベル${labeled}枚、評価画像は共通。差は同じ${runs}回の試行（同じ画像の選び方と乱数の種）どうしの差の平均と95%信頼区間（t分布）で、白抜きの点は区間が0をまたぐ。途切れは、正解では1本の線が予測で切れた箇所の1枚あたりの数。</p>
<footer class="rj-foot"><span>ラベル50枚で学ぶひび割れ検出</span><b>5</b></footer>`,
};
