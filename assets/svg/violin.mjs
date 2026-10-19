// Diagram study · Violin plot — distribution shape as well as center, for each group.
// Densities are Gaussian KDEs computed from raw survey answers (Silverman bandwidth per
// district); the median, IQR, peaks and the "near the median" share come from the same arrays.
import { svgRoot, el, g, textLines, linear, band, axis, callout, pathFromPoints, kde, silverman, boxStats,
  rng, fmt, pct, theme as makeTheme } from '../runtime/figure.mjs';

// 片道の通勤時間（分）: 市民アンケート回答（架空）。西部ニュータウンだけ二つの層が混在する。
const rand = rng(9);
const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const logn = (median, s) => Math.max(3, Math.round(Math.exp(Math.log(median) + s * normal())));
const districts = [
  { label: '中央地区', values: Array.from({ length: 182 }, () => logn(27, 0.38)) },
  { label: '北部地区', values: Array.from({ length: 151 }, () => logn(42, 0.27)) },
  { label: '港南地区', values: Array.from({ length: 138 }, () => logn(34, 0.42)) },
  { label: '西部ニュータウン', values: Array.from({ length: 164 }, () => (rand() < 0.5 ? logn(15, 0.38) : logn(70, 0.15))) },
];
const order = ['中央地区', '港南地区', '北部地区', '西部ニュータウン']; // the group the page is about sits last, beside the notes
const focusLabel = '西部ニュータウン', span = 10; // minutes either side of the median

const grid = Array.from({ length: 241 }, (_, i) => i / 2); // 0–120 min
const stats = districts.map(d => {
  const s = boxStats(d.values), bw = silverman(d.values);
  const dens = kde(d.values, grid.filter(v => v >= s.min && v <= s.max), bw); // trimmed to the observed range
  const top = Math.max(...dens.map(p => p[1]));
  // peaks = local maxima holding at least a quarter of the group's highest density (ignores lone tail values)
  const peaks = dens.filter((p, i) => i > 0 && i < dens.length - 1 && p[1] > dens[i - 1][1] && p[1] >= dens[i + 1][1] && p[1] >= top / 4)
    .map(p => p[0]);
  const near = d.values.filter(v => Math.abs(v - s.median) <= span).length;
  return { ...d, s, bw, dens, peaks, near };
});
const focus = stats.find(d => d.label === focusLabel);
const bws = stats.map(d => d.bw);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470;
  const m = { l: 64, r: 286, t: 40, b: 70 };
  const y = linear([0, 120], [H - m.b, m.t]);
  const xb = band(order, [m.l, W - m.r], { inner: 0.12, outer: 0.04 });
  const maxD = Math.max(...stats.flatMap(d => d.dens.map(p => p[1])));
  const half = xb.bw / 2 * 0.92;
  const violin = d => {
    const cx = xb.center(d.label), hl = d.label === focusLabel;
    const right = d.dens.map(([v, k]) => [cx + (k / maxD) * half, y(v)]);
    const left = d.dens.map(([v, k]) => [cx - (k / maxD) * half, y(v)]).reverse();
    return g({ class: 'violin' },
      el('path', { d: pathFromPoints([...right, ...left], { curve: 'monotone', close: true }), fill: hl ? t.seq(2) : t.c('surface'), stroke: hl ? t.c('accent') : t.c('muted'), 'stroke-width': hl ? 2.2 : 1.4 }),
      el('line', { x1: cx, x2: cx, y1: y(d.s.q1), y2: y(d.s.q3), stroke: t.c('ink'), 'stroke-width': 6, 'stroke-linecap': 'round' }),
      el('circle', { cx, cy: y(d.s.median), r: 6, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 2.2 }),
      textLines([d.label], { x: cx, y: H - m.b + 16, size: 19, anchor: 'middle', valign: 'top', fill: hl ? t.c('accent') : t.c('ink'), weight: hl ? 700 : 600 }),
      textLines([`n = ${d.values.length}、中央値 ${fmt(d.s.median)}分`], { x: cx, y: H - m.b + 44, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') }));
  };
  const fx = xb.center(focusLabel), fy = y(focus.s.median);
  return svgRoot({ id: 'violin-fig', width: W, height: H, theme: t,
    title: '地区別の片道通勤時間の分布（カーネル密度推定）',
    desc: `4地区の通勤時間の分布。${focusLabel}は${focus.peaks.map(p => `${fmt(p)}分`).join('と')}付近の二つの山に分かれ、中央値${fmt(focus.s.median)}分の前後${span}分に入る回答は${focus.values.length}人中${focus.near}人（${pct(focus.near / focus.values.length)}）。山が一つの地区：${stats.filter(d => d.peaks.length === 1).map(d => d.label).join('、')}。` },
  axis(y, { orient: 'left', at: m.l, grid: [m.l, W - m.r], theme: t, size: 17, tickValues: [0, 20, 40, 60, 80, 100, 120] }),
  textLines(['片道の通勤時間（分）'], { x: m.l - 46, y: m.t - 22, size: 17, fill: t.c('muted') }),
  // the span around the focus median: where the median says people are, and where few are
  el('rect', { x: fx - half - 8, y: y(focus.s.median + span), width: 2 * half + 16, height: y(focus.s.median - span) - y(focus.s.median + span), fill: t.c('accent'), 'fill-opacity': 0.12 }),
  stats.map(violin),
  focus.peaks.map(p => textLines([`${fmt(p)}分付近`], { x: fx + half + 14, y: y(p), size: 17, valign: 'middle', fill: t.c('accent'), weight: 700 })),
  // reading key for the inner marks
  g({ class: 'violin-key' },
    el('line', { x1: W - 214, x2: W - 214, y1: m.t - 30, y2: m.t - 6, stroke: t.c('ink'), 'stroke-width': 6, 'stroke-linecap': 'round' }),
    textLines(['四分位範囲'], { x: W - 200, y: m.t - 18, size: 16, valign: 'middle', fill: t.c('muted') }),
    el('circle', { cx: W - 96, cy: m.t - 18, r: 6, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 2.2 }),
    textLines(['中央値'], { x: W - 82, y: m.t - 18, size: 16, valign: 'middle', fill: t.c('muted') })),
  callout({ x: fx + 8, y: fy, dx: half + 30, dy: 0, width: 230, size: 17, theme: t, marker: 'none',
    text: `中央値の前後${span}分に入る回答は${focus.values.length}人中${focus.near}人（${pct(focus.near / focus.values.length)}）` }));
}

export default {
  study: true,
  id: 'violin',
  language: 'ja',
  title: 'Violin plot: distribution shape beside the median',
  className: 'st cs-civic-calm',
  notes: 'Purpose: Show the shape of each distribution — peaks, gaps, skew — not just its center, so a two-peaked group is not summarized by a median that describes almost nobody.\nModify: Replace `districts` with raw values per group; the densities, medians, quartiles, peak labels and the share near the median recompute. Change `order`, `focusLabel` and `span` to suit the comparison.\nInvariant: Width is estimated density (Gaussian kernel, Silverman bandwidth, trimmed to the observed range), not a count; every violin uses one width scale so areas compare; sample sizes and the smoothing rule are on the page.\nStatic: Already static. If a group has fewer than about 30 values, show the points instead of a density.',
  sources: [{ type: 'original-example', file: 'assets/svg/violin.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head"><em>${focusLabel}</em>の通勤時間は${focus.peaks.map(p => `${fmt(p)}分`).join('と')}の二つの山。<br><span class="st-quiet">中央値${fmt(focus.s.median)}分の前後${span}分に入る人は${pct(focus.near / focus.values.length)}だけ</span></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 市民アンケート${districts.reduce((a, d) => a + d.values.length, 0)}人。幅はガウス核による密度推定（Silverman法、帯域幅${fmt(Math.min(...bws), { digits: 1 })}〜${fmt(Math.max(...bws), { digits: 1 })}分、観測範囲で打ち切り）</span><span>バイオリン図</span></p>`,
};
