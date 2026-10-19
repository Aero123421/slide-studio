// Motion study · Move related quantities as one coordinate system — re-expressing anomalies
// against a new normal shifts every value by the same amount. Build 1 moves the series AND the
// old zero line together (one group, one translation computed from the data); the axis stays,
// a new zero is drawn, and the latest year is measured against both normals.
import { svgRoot, el, g, linear, axis, textLines, pathFromPoints, theme as makeTheme, fmt, mean } from '../runtime/figure.mjs';

const summer = [ // 架空の市の夏（6〜8月）平均気温の偏差、℃、1961〜1990年平均との差 — illustrative
  0.12, 0.31, -0.18, 0.86, 0.22, 0.41, 0.05, 0.57, 0.63, 0.29, // 1991–2000
  0.88, 0.47, 0.71, 0.95, 0.52, 0.66, 1.01, 0.74, 0.58, 1.32, // 2001–2010
  0.83, 1.06, 1.18, 0.79, 0.97, 1.21, 1.09, 1.44, 1.12, 1.25, // 2011–2020
  1.38, 1.29, 1.71, 1.55, 1.62, // 2021–2025
];
const first = 1991, years = summer.map((_, i) => first + i);
const newPeriod = [1991, 2020];
// the new normal, expressed in the old coordinates: the mean anomaly over the new reference period
const shift = mean(summer.filter((_, i) => years[i] >= newPeriod[0] && years[i] <= newPeriod[1]));
const last = { year: years.at(-1), old: summer.at(-1), now: summer.at(-1) - shift };
const f1 = v => fmt(v, { digits: 1, sign: true });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 66, r: 330, t: 26, b: 46 };
  const x = linear([first, last.year], [m.l + 10, W - m.r]);
  const y = linear([-1.25, 2], [H - m.b, m.t]);
  const dy = y(-shift) - y(0); // the whole system moves down by the new normal, in pixels
  const pts = summer.map((v, i) => [x(years[i]), y(v)]);
  // measurement column right of the plot: new bracket, old bracket, then the zero-line names
  const bNew = W - m.r + 26, bOld = W - m.r + 104, names = W - m.r + 186, lineEnd = names - 12;
  const [lx, ly] = pts.at(-1);
  return svgRoot({ id: 'motion-common-origin-shift-fig', width: W, height: H, theme: t,
    title: `夏の平均気温の偏差、${first}〜${last.year}年：1961〜1990年平均からの差と、1991〜2020年平均からの差`,
    desc: `新しい平年値は旧平年値より${fmt(shift, { digits: 2 })}℃高い。すべての値と旧平年値の線が同じだけ下がり、${last.year}年の偏差は${f1(last.old)}℃から${f1(last.now)}℃になる。気温そのものは変わらない。` },
  axis(y, { orient: 'left', at: m.l, grid: [m.l, W - m.r], theme: t, size: 16, tickValues: [-1, 0, 1, 2], format: v => `${f1(v)}℃`, zero: false }),
  textLines(['平年差（℃）'], { x: m.l + 10, y: m.t - 4, size: 16, fill: t.c('muted'), valign: 'top' }),
  [1991, 2000, 2010, 2020, last.year].map(yr => textLines([String(yr)], { x: x(yr), y: H - m.b + 10, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') })),
  el('line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, stroke: t.c('rule') }),
  // build 1: the new zero, drawn in place on the fixed axis
  g({ 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 700, 'data-duration': 500 },
    el('line', { x1: m.l, x2: lineEnd, y1: y(0), y2: y(0), stroke: t.c('accent'), 'stroke-width': 2.4 }),
    textLines(['0 = 新平年値', `（${newPeriod[0]}〜${newPeriod[1]}年）`], { x: names, y: y(0), size: 16, weight: 700, fill: t.c('accent'), valign: 'middle', lineHeight: 1.25 })),
  // one coordinate system: the series, the old zero and the old measurement move together by one translation
  g({ 'data-states': { 0: { translate: '0px 0px' }, 1: { translate: `0px ${dy.toFixed(2)}px` } }, 'data-duration': 1000, 'data-easing': 'smooth', style: 'transform-box:view-box' },
    el('line', { x1: m.l, x2: lineEnd, y1: y(0), y2: y(0), stroke: t.c('ink'), 'stroke-width': 1.8, 'stroke-dasharray': '6 5' }),
    textLines(['0 = 旧平年値', '（1961〜1990年）'], { x: names, y: y(0), size: 16, weight: 650, fill: t.c('ink'), valign: 'middle', lineHeight: 1.25 }),
    el('path', { d: pathFromPoints(pts), fill: 'none', stroke: t.c('context'), 'stroke-width': 2.2, 'stroke-linejoin': 'round' }),
    pts.map(([px, py], i) => el('circle', { cx: px, cy: py, r: i === pts.length - 1 ? 7 : 4.5, fill: i === pts.length - 1 ? t.c('ink') : t.c('muted'), stroke: t.c('paper'), 'stroke-width': 1.5 })),
    textLines([`${last.year}年`], { x: lx, y: ly - 16, size: 16, weight: 700, anchor: 'middle', fill: t.c('ink'), halo: t.c('paper') }),
    // guide from the latest value to the measurement column, and the old measurement (it rides with its zero)
    el('line', { x1: lx + 10, x2: bOld + 8, y1: ly, y2: ly, stroke: t.c('muted'), 'stroke-width': 1.2, 'stroke-dasharray': '2 4' }),
    el('path', { d: `M${bOld - 6} ${y(0)}h6V${ly}h-6`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.6 }),
    textLines([`${f1(last.old)}℃`], { x: bOld + 10, y: y(0) + (ly - y(0)) * 0.3, size: 17, weight: 700, fill: t.c('ink'), valign: 'middle' })),
  // build 1: the same year measured against the new zero
  g({ 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 900, 'data-duration': 500 },
    el('path', { d: `M${bNew - 6} ${y(0)}h6V${y(last.now)}h-6`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 2 }),
    textLines([`${f1(last.now)}℃`], { x: bNew + 10, y: (y(0) + y(last.now)) / 2, size: 18, weight: 700, fill: t.c('accent'), valign: 'middle' })));
}

export default {
  study: true,
  id: 'motion-common-origin-shift',
  language: 'ja',
  title: 'Common origin shift: rebase the series and its reference together',
  className: 'st cs-geo-map',
  notes: 'Purpose: When values are re-expressed against a new reference (a new normal, a new datum), move the values and the old reference together as one coordinate system, so every distance between them is visibly preserved.\nModify: Replace `summer` (anomalies against the old reference) and `newPeriod`; the shift is the mean over the new period, and the translation, the new zero and both measurements recompute.\nInvariant: One translation, computed from the data, moves the series and the old zero line as a unit; the axis and its tick labels never change; the new zero is drawn in place and named; the latest value is measured against both references.\nStatic: The final build shows the shifted series, the old zero (named) inside it, the new zero, and both measurements of the latest year.',
  sources: [{ type: 'original-example', file: 'assets/motion/motion-common-origin-shift.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="word-break:auto-phrase">平年値を${newPeriod[0]}〜${newPeriod[1]}年に改めると、同じ${last.year}年の夏の平年差は${f1(last.old)}℃から<em>${f1(last.now)}℃</em>に下がる</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 架空の市の6〜8月平均気温の偏差</span><span>モーション · 基準ごと座標系を移す（1ビルド）</span></p>`,
};
