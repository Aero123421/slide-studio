// Diagram study · Dot plot — position only, so the axis can start where the data starts.
// Rows, the range annotation and the headline gaps are computed from `wards`.
import { dotPlot, el, g, textLines, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const series = ['男性', '女性'];
const wards = [ // 平均寿命（歳）、区別・男女別（架空のデータ）
  { label: '丘陵区', values: { 男性: 83.9, 女性: 89.6 } },
  { label: '中央区', values: { 男性: 82.4, 女性: 88.9 } },
  { label: '西区', values: { 男性: 82.0, 女性: 88.4 } },
  { label: '新市街区', values: { 男性: 81.6, 女性: 88.1 } },
  { label: '北区', values: { 男性: 81.2, 女性: 87.7 } },
  { label: '川辺区', values: { 男性: 80.5, 女性: 87.3 } },
  { label: '東区', values: { 男性: 79.8, 女性: 86.8 } },
  { label: '南区', values: { 男性: 78.9, 女性: 86.2 } },
  { label: '旧市街区', values: { 男性: 77.6, 女性: 85.5 } },
  { label: '湾岸区', values: { 男性: 75.8, 女性: 84.9 } },
];
const spread = s => {
  const sorted = [...wards].sort((a, b) => b.values[s] - a.values[s]);
  return { hi: sorted[0], lo: sorted.at(-1), gap: Math.round((sorted[0].values[s] - sorted.at(-1).values[s]) * 10) / 10 };
};
const men = spread(series[0]), women = spread(series[1]);
const f1 = v => fmt(v, { digits: 1, locale: 'ja' });
const all = wards.flatMap(w => series.map(s => w.values[s]));
const domain = [Math.floor(Math.min(...all) / 2) * 2 - 2, Math.ceil(Math.max(...all) / 2) * 2 + 2]; // starts near the data, not at zero

export function figure(theme = 'css') {
  const t = makeTheme(theme);
  return dotPlot({
    id: 'dot-plot-fig', theme, width: 1152, height: 470, locale: 'ja', fontSize: 16,
    title: '区別・男女別の平均寿命（歳）',
    desc: `男性の平均寿命は${men.hi.label}の${f1(men.hi.values[series[0]])}歳から${men.lo.label}の${f1(men.lo.values[series[0]])}歳まで、${f1(men.gap)}年の差がある。女性の差は${f1(women.gap)}年。横軸は${domain[0]}歳から始まる。`,
    data: wards, series, sort: true, domain, unit: '平均寿命（歳）',
    // The men's range across wards: two guides and a span with its length, above the plot.
    extra: ({ x, y, box }) => {
      const xa = x(men.lo.values[series[0]]), xb = x(men.hi.values[series[0]]), ay = box.y - 16;
      const tip = (px, dir) => el('path', { d: `M${px} ${ay}l${dir * 8} -5v10z`, fill: t.c('ink') });
      return g({ class: 'ss-range' },
        el('line', { x1: xa, x2: xa, y1: ay, y2: y(men.lo.label) - 11, stroke: t.c('muted'), 'stroke-width': 1.2, 'stroke-dasharray': '3 4' }),
        el('line', { x1: xb, x2: xb, y1: ay, y2: y(men.hi.label) - 11, stroke: t.c('muted'), 'stroke-width': 1.2, 'stroke-dasharray': '3 4' }),
        el('line', { x1: xa + 2, x2: xb - 2, y1: ay, y2: ay, stroke: t.c('ink'), 'stroke-width': 1.5 }), tip(xa, 1), tip(xb, -1),
        textLines([`男性の区間差 ${f1(men.gap)}年`], { x: (xa + xb) / 2, y: ay - 9, size: 16, anchor: 'middle', fill: t.c('ink'), weight: 700, halo: t.c('paper') }),
        textLines([f1(men.hi.values[series[0]])], { x: xb + 13, y: y(men.hi.label), size: 15, valign: 'middle', fill: t.c('ink'), weight: 600 }),
        textLines([f1(men.lo.values[series[0]])], { x: xa - 13, y: y(men.lo.label), size: 15, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: 600 }));
    },
  });
}

export default {
  study: true,
  id: 'dot-plot',
  language: 'ja',
  title: 'Dot plot: position-only comparison on a non-zero axis',
  className: 'st cs-geo-map',
  notes: 'Purpose: Compare quantities by position alone, without filled bars, so the axis can start near the data and small but real differences stay visible.\nModify: Replace `wards` and `series`. Rows sort by the first series; the range annotation, its end values and the headline recompute.\nInvariant: Dots, not bars, whenever the axis does not start at zero; the axis start is stated in the description; every row uses the same scale and series order.\nStatic: Already static. For a build, show one series first, then the other.',
  sources: [{ type: 'original-example', file: 'assets/svg/dot-plot.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="word-break:keep-all"><em>${series[0]}</em>の平均寿命は、住む区によって最大${f1(men.gap)}年違う<br><span class="st-quiet">女性の区間差は${f1(women.gap)}年</span></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 2020〜2024年の死亡統計から作成した区別生命表</span><span>ドットプロット</span></p>`,
};
