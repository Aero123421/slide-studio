// Template: 学会発表（日本語） · 結果（ラベル数に対する精度、区間付き）. Synthetic example content; replace data and copy.
// Means and SDs over `runs` training runs per setting; 95% intervals are computed with t (df = runs − 1).
// The headline's comparison (提案法 at 50 labels vs. the supervised setting that matches it) is found in code.
import { el, linear, point, axis, textLines, spreadLabels, fmt, arrowMarker } from '../../runtime/figure.mjs';

const ID = 'tpl-research-ja-result';
const runs = 5;                       // per setting: a different labelled subset and seed each run
const tCrit = { 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571, 9: 2.262 }[runs - 1];
const labels = [25, 50, 100, 200, 400];   // labelled images (each step doubles → equal spacing = log scale)
const methods = [                     // IoU of the crack class, % (mean and SD over runs)
  { key: 'sup', name: '教師あり学習', mean: [42.8, 50.2, 57.4, 63.5, 66.4], sd: [3.4, 2.6, 1.9, 1.4, 1.0] },
  { key: 'pl', name: '擬似ラベル法', mean: [49.6, 56.1, 61.2, 65.0, 67.2], sd: [3.0, 2.2, 1.6, 1.2, 0.9] },
  { key: 'ours', name: '提案法', mean: [57.9, 63.8, 66.2, 67.6, 68.3], sd: [2.5, 1.7, 1.3, 1.0, 0.8] },
];
const full = { n: 2000, mean: 68.9 };  // all 2,000 labelled images, the upper reference
const test = { images: 600, bridges: 1 };
const focusN = 50;

// ---- derived numbers (every number on the page comes from here)
const half = sd => tCrit * sd / Math.sqrt(runs);
const by = Object.fromEntries(methods.map(m => [m.key, m]));
const fi = labels.indexOf(focusN);
const ours = by.ours.mean[fi];
const match = labels.map((n, i) => ({ n, i, v: by.sup.mean[i] })).sort((a, b) => Math.abs(a.v - ours) - Math.abs(b.v - ours))[0];
const ratio = match.n / focusN;
const f1 = v => fmt(v, { digits: 1 });
const kanji = { 2: '2分の1', 4: '4分の1', 8: '8分の1' }[ratio] ?? `${ratio}分の1`;

// ---- chart
const W = 1152, H = 400;
const box = { x: 52, y: 26, w: 860, h: 314 };
const y = linear([35, 72], [box.y + box.h, box.y]);
const xp = point(labels.map(String), [box.x, box.x + box.w], { padding: 0.35 });
const dodge = { sup: -9, pl: 0, ours: 9 };
const style = {
  sup: { color: 'var(--rj-base2)', width: 2, dash: '6 5', label: 'var(--rj-muted)' },
  pl: { color: 'var(--rj-base1)', width: 2, dash: null, label: 'var(--rj-ink2)' },
  ours: { color: 'var(--rj-accent)', width: 3, dash: null, label: 'var(--rj-accent)' },
};
const X = (m, i) => xp(String(labels[i])) + dodge[m.key];
const marker = (m, cx, cy) => m.key === 'ours' ? el('circle', { cx, cy, r: 6.5, fill: style.ours.color, stroke: '#fff', 'stroke-width': 2 })
  : m.key === 'pl' ? el('rect', { x: cx - 5.5, y: cy - 5.5, width: 11, height: 11, fill: style.pl.color, stroke: '#fff', 'stroke-width': 1.5 })
  : el('circle', { cx, cy, r: 5, fill: '#fff', stroke: style.sup.color, 'stroke-width': 2 });
const series = methods.map(m => {
  const st = style[m.key];
  const pts = m.mean.map((v, i) => [X(m, i), y(v)]);
  const bars = m.mean.map((v, i) => el('line', { x1: X(m, i), x2: X(m, i), y1: y(v - half(m.sd[i])), y2: y(v + half(m.sd[i])), stroke: st.color, 'stroke-width': m.key === 'ours' ? 2.4 : 2 })).join('');
  const line = el('path', { d: pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(''), fill: 'none', stroke: st.color, 'stroke-width': st.width, 'stroke-dasharray': st.dash, 'stroke-linejoin': 'round' });
  return el('g', { class: `rj-series-${m.key}` }, line, bars, pts.map(([cx, cy]) => marker(m, cx, cy)).join(''));
}).join('');
// end labels, spread so they never collide
const lastX = Math.max(...methods.map(m => X(m, labels.length - 1)));
const placed = spreadLabels(methods.map((m, k) => ({ id: k, y: y(m.mean.at(-1)), h: 22 })), { min: box.y, max: box.y + box.h, gap: 4 });
const ends = placed.map(p => {
  const m = methods[p.id], st = style[m.key], x0 = X(m, labels.length - 1) + 10;
  return el('path', { d: `M${x0} ${y(m.mean.at(-1)).toFixed(1)}L${lastX + 22} ${p.y.toFixed(1)}`, stroke: 'var(--rj-rule)', 'stroke-width': 1, fill: 'none' })
    + textLines([`${m.name}　${f1(m.mean.at(-1))}`], { x: lastX + 28, y: p.y, size: 17, valign: 'middle', fill: st.label, weight: m.key === 'ours' ? 600 : 400, attrs: { 'font-variant-numeric': 'tabular-nums' } });
}).join('');
// full-label reference
const ref = el('line', { x1: box.x, x2: lastX + 18, y1: y(full.mean), y2: y(full.mean), stroke: 'var(--rj-ink)', 'stroke-width': 1.2, 'stroke-dasharray': '2 4' })
  + textLines([`全ラベル（${fmt(full.n)}枚）で学習　${f1(full.mean)}`], { x: box.x + 10, y: y(full.mean) + 22, size: 16, fill: 'var(--rj-ink2)', attrs: { 'font-variant-numeric': 'tabular-nums' } });
// the comparison the headline makes: 提案法@50 and 教師あり@match
const pA = [X(by.ours, fi), y(ours)], pB = [X(by.sup, match.i), y(match.v)];
const AR = `${ID}-ar`;
const note = { x: (pA[0] + pB[0]) / 2 + 40, y: y(46) };
const compare = el('g', { class: 'rj-compare' },
  el('circle', { cx: pA[0], cy: pA[1], r: 12, fill: 'none', stroke: 'var(--rj-ink)', 'stroke-width': 1.5 }),
  el('circle', { cx: pB[0], cy: pB[1], r: 12, fill: 'none', stroke: 'var(--rj-ink)', 'stroke-width': 1.5 }),
  el('line', { x1: pA[0] + 13, x2: pB[0] - 13, y1: pA[1], y2: pA[1], stroke: 'var(--rj-ink)', 'stroke-width': 1.3, 'stroke-dasharray': '1 4', 'stroke-linecap': 'round' }),
  el('path', { d: `M${note.x - 4} ${note.y - 34}V${pA[1] + 6}`, stroke: 'var(--rj-ink)', 'stroke-width': 1, fill: 'none', 'marker-end': `url(#${AR})` }),
  textLines([`提案法の${focusN}枚 ${f1(ours)}`, `教師あり学習の${match.n}枚 ${f1(match.v)}`], { x: note.x, y: note.y - 30, size: 17, lineHeight: 1.45, fill: 'var(--rj-ink)', attrs: { 'font-variant-numeric': 'tabular-nums' } }),
  textLines([`ラベルは${kanji}で同じ水準`], { x: note.x, y: note.y + 22, size: 17, weight: 600, fill: 'var(--rj-ink)' }));
const xAxis = labels.map(n => el('line', { x1: xp(String(n)), x2: xp(String(n)), y1: box.y + box.h, y2: box.y + box.h + 5, stroke: 'var(--rj-ink)' })
  + textLines([String(n)], { x: xp(String(n)), y: box.y + box.h + 12, size: 16, anchor: 'middle', valign: 'top', fill: 'var(--rj-muted)', attrs: { 'font-variant-numeric': 'tabular-nums' } })).join('');
const chart = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">ラベル付き画像の枚数と、ひび割れのIoU</title>
<desc id="${ID}-d">ラベル付き画像を${labels.join('、')}枚と変えたときのIoU（%）。どの枚数でも提案法が最も高い。${focusN}枚の提案法は${f1(ours)}%で、教師あり学習の${match.n}枚（${f1(match.v)}%）とほぼ同じ。全ラベル${fmt(full.n)}枚での学習は${f1(full.mean)}%。縦線は${runs}回の試行の95%信頼区間。</desc>
<defs>${arrowMarker(AR, 'var(--rj-ink)', { size: 8 })}</defs>
${axis(y, { orient: 'left', at: box.x, grid: [box.x, lastX + 18], tickValues: [40, 50, 60, 70], size: 16, theme: 'css' })}
${textLines(['IoU（%）'], { x: 0, y: 4, size: 16, valign: 'top', fill: 'var(--rj-muted)' })}
<line x1="${box.x}" x2="${lastX + 18}" y1="${box.y + box.h}" y2="${box.y + box.h}" stroke="var(--rj-ink)" stroke-width="1.2"/>
${xAxis}
${textLines(['ラベル付き画像の枚数（目盛は2倍ごと）'], { x: lastX + 18, y: H - 4, size: 16, anchor: 'end', fill: 'var(--rj-muted)' })}
${ref}
${series}
${compare}
${ends}
</svg>`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: `Result: with ${focusN} labels the proposed method matches supervised training with ${match.n}`,
  notes: `Purpose: 主結果を区間付きで示し、「ラベル${focusN}枚の提案法 ≈ 教師あり学習の${match.n}枚」という読み方を図の上で確かめられるようにする。\nModify: labels・methods（各枚数の平均とSD）・runs・full を自分の結果にする。区間（t分布）、見出しの比較相手と比率、右端の値、注記はすべて同じ配列から再計算される。横軸の枚数は2倍刻みにそろえると等間隔の目盛が対数目盛と一致する。\nInvariant: 提案法だけを青、比較手法は灰色の濃淡と線種で区別する。区間の定義（何回の試行・何の区間・計算法）を図のすぐ下に書く。縦軸は0から始めない代わりに目盛の数値を必ず出す。\nStatic: 静的ページ。`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-research-ja rj-result',
  content: `<h1 class="rj-h" data-region="title">ラベル${focusN}枚の提案法は、<span class="nw">教師あり学習の${match.n}枚と</span>ほぼ同じ精度に届く</h1>
<figure class="rj-fig" style="left:64px;top:184px" data-region="primary">${chart}</figure>
<p class="rj-note" style="left:64px;top:594px;width:1152px" data-region="source">点は${runs}回の試行の平均、縦線は95%信頼区間（t分布、自由度${runs - 1}）。試行ごとにラベル付き画像の選び方と乱数シードを変えた。評価は学習に使っていない${test.bridges}橋の${test.images}枚。</p>
<footer class="rj-foot"><span>ラベル50枚で学ぶひび割れ検出</span><b>4</b></footer>`,
};
