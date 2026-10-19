// Diagram study · Prediction and residual — each listing's vertical distance to the fitted line.
// The engine's linearFit() gives the line and the residuals; every segment, the R² and the labelled
// residuals are computed from that one fit, so the picture and the numbers cannot disagree.
import { svgRoot, el, g, textLines, linear, axis, niceDomain, extent, linearFit, rng, fmt, pct,
  theme as makeTheme } from '../runtime/figure.mjs';

// 駅から徒歩15分圏の賃貸16件：専有面積（m²）と月額家賃（万円）。物件Kは駅徒歩1分（架空）。
const rand = rng(3);
const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const ids = 'ABCDEFGHIJKLMNOP'.split('');
const homes = ids.map((id, i) => {
  const area = Math.round(18 + 44 * ((i + 0.3 + 0.6 * rand()) / ids.length));
  const rent = Math.round((2.6 + 0.135 * area + 0.5 * normal() + (id === 'K' ? 2.1 : 0)) * 10) / 10; // K: the station premium
  return { id, area, rent };
});
const focusId = 'K';

const fit = linearFit(homes.map(h => [h.area, h.rent])); // 家賃 = a + b × 面積（最小二乗法）
const predict = a => fit.intercept + fit.slope * a;
const rows = homes.map((h, i) => ({ ...h, fitted: predict(h.area), resid: fit.residuals[i] })); // 残差 = 実際 − 予測
const focus = rows.find(h => h.id === focusId);
const byResid = [...rows].sort((a, b) => a.resid - b.resid);
const most = byResid[0], top = byResid.at(-1); // most negative (for contrast) and most positive residual
const man = v => fmt(v, { digits: 1, locale: 'ja' });
const signed = v => fmt(v, { digits: 1, sign: true, locale: 'ja' });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 64, r: 30, t: 40, b: 66 };
  const [a0, a1] = extent(rows.map(h => h.area));
  const x = linear([a0 - 5, a1 + 5], [m.l, W - m.r]);
  const y = linear(niceDomain(extent(rows.flatMap(h => [h.rent, h.fitted])), 4), [H - m.b, m.t]);
  return svgRoot({ id: 'prediction-residual-fig', width: W, height: H, theme: t,
    title: '専有面積と家賃の散布図、回帰直線と各物件の残差',
    desc: `${rows.length}件。回帰直線：家賃 = ${man(fit.intercept)} + ${fmt(fit.slope, { digits: 3 })} × 面積（R² ${fmt(fit.r2, { digits: 2 })}）。残差が最も大きいのは物件${top.id}で${signed(top.resid)}万円、最も小さいのは物件${most.id}で${signed(most.resid)}万円。` },
  axis(y, { orient: 'left', at: m.l, grid: [m.l, W - m.r], theme: t, size: 16, count: 4 }),
  axis(x, { orient: 'bottom', at: H - m.b, theme: t, size: 16, count: 6, tickSize: 5 }),
  el('line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, stroke: t.c('ink'), 'stroke-width': 1.2 }),
  textLines(['家賃（万円／月）'], { x: m.l - 46, y: m.t - 20, size: 16, fill: t.c('muted') }),
  textLines(['専有面積（m²）'], { x: W - m.r, y: H - 14, size: 16, anchor: 'end', fill: t.c('muted') }),
  // the model, drawn over the observed range only
  el('line', { x1: x(a0), x2: x(a1), y1: y(predict(a0)), y2: y(predict(a1)), stroke: t.c('ink'), 'stroke-width': 2.4 }),
  textLines([`予測：家賃 = ${man(fit.intercept)} + ${fmt(fit.slope, { digits: 3 })} × 面積`], { x: x(a1), y: y(predict(a1)) - 18, size: 16, anchor: 'end', fill: t.c('ink'), weight: 600, halo: t.c('paper') }),
  // one vertical segment per listing, from the prediction on the line to the observed rent
  rows.map(h => {
    const hl = h.id === focusId, r = hl ? 8 : 6.5;
    return g({ class: 'residual' },
      el('line', { x1: x(h.area), x2: x(h.area), y1: y(h.fitted), y2: y(h.rent) + Math.sign(h.resid) * r, stroke: hl ? t.c('accent') : t.c('muted'), 'stroke-width': hl ? 3 : 1.6 }),
      el('circle', { cx: x(h.area), cy: y(h.rent), r, fill: hl ? t.c('accent') : t.c('context'), stroke: hl ? t.c('paper') : t.c('muted'), 'stroke-width': hl ? 2 : 1 }));
  }),
  el('circle', { cx: x(focus.area), cy: y(focus.fitted), r: 4.5, fill: t.c('paper'), stroke: t.c('accent'), 'stroke-width': 2 }),
  textLines([`${signed(focus.resid)}万円`], { x: x(focus.area) + 14, y: (y(focus.fitted) + y(focus.rent)) / 2, size: 20, weight: 700, valign: 'middle', fill: t.c('accent'), halo: t.c('paper') }),
  textLines([`物件${focus.id}（駅徒歩1分）`, `実際 ${man(focus.rent)}万円／予測 ${man(focus.fitted)}万円`], { x: x(focus.area) - 14, y: y(focus.rent) - 4, size: 16, anchor: 'end', valign: 'middle', fill: t.c('ink'), halo: t.c('paper'), lineHeight: 1.35 }),
  textLines([`物件${most.id}：${signed(most.resid)}万円`], { x: x(most.area) + 12, y: y(most.rent) + 22, size: 16, fill: t.c('muted'), halo: t.c('paper') }),
  textLines(['縦線の長さ＝残差（実際の家賃 − 予測家賃）'], { x: m.l + 16, y: m.t + 8, size: 16, fill: t.c('muted'), valign: 'top' }));
}

export default {
  study: true,
  id: 'prediction-residual',
  language: 'ja',
  title: 'Prediction and residual: distance to the fitted line',
  className: 'st cs-classroom-bright',
  notes: 'Purpose: Make the unexplained part of a model visible: each observation\'s vertical distance to the fitted line is its residual.\nModify: Replace `homes` with your (x, y) pairs and set `focusId` to the case you will discuss; the OLS line, the segments, R², the labelled residuals and the headline recompute from `fit`.\nInvariant: Residuals are vertical (observed − predicted in y units), computed from the line actually drawn; the model formula and units are on the page; the line spans only the observed x range; points above and below the line are both shown.\nStatic: Already static. For many points, draw segments only for the cases you name.',
  sources: [{ type: 'original-example', file: 'assets/svg/prediction-residual.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">面積で家賃のばらつきの${pct(fit.r2)}は説明できる。<br>それでも物件${focus.id}は予測より<em>${signed(focus.resid)}万円</em>高い</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 駅から徒歩15分圏の賃貸${rows.length}件。最小二乗法による直線、残差は縦方向の差</span><span>散布図と残差</span></p>`,
};
