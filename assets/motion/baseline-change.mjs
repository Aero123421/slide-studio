// Motion study · Explain a baseline change — the emissions columns never move; the reference
// line does. Build 1 carries the reference from the old base year to the new one, leaves the old
// line behind as a labelled ghost and re-measures the same latest year against both.
import { svgRoot, el, g, linear, band, axis, textLines, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const emissions = [ // 架空の市の温室効果ガス排出量、万t-CO2（年度）— illustrative
  { fy: 2013, v: 268 }, { fy: 2014, v: 262 }, { fy: 2015, v: 255 }, { fy: 2016, v: 251 }, { fy: 2017, v: 247 },
  { fy: 2018, v: 239 }, { fy: 2019, v: 228 }, { fy: 2020, v: 205 }, { fy: 2021, v: 214 }, { fy: 2022, v: 207 },
  { fy: 2023, v: 199 }, { fy: 2024, v: 192 }, { fy: 2025, v: 186 },
];
const oldBase = 2013, newBase = 2019; // 計画改定で基準年度を変更
const val = fy => emissions.find(d => d.fy === fy).v;
const latest = emissions.at(-1);
const cut = base => Math.round((1 - latest.v / val(base)) * 100); // 削減率、%
const oldCut = cut(oldBase), newCut = cut(newBase);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 58, r: 186, t: 40, b: 46 };
  const x = band(emissions.map(d => d.fy), [m.l, W - m.r], { inner: 0.3, outer: 0.15 });
  const y = linear([0, 300], [H - m.b, m.t]);
  const yo = y(val(oldBase)), yn = y(val(newBase)), yl = y(latest.v);
  const bx = x(latest.fy) + x.bw + 16; // bracket column, right of the latest bar
  const dur = 1000, ease = 'smooth';
  // bracket from the latest bar up to the reference: scaled about its foot so its top rides on the line
  const a = (yl - yn) / (yl - yo), b = yl * (1 - a);
  const baseFill = fy => (fy === oldBase ? { 0: { fill: t.c('muted') }, 1: { fill: t.c('context') } } : fy === newBase ? { 0: { fill: t.c('context') }, 1: { fill: t.c('muted') } } : null);
  return svgRoot({ id: 'motion-baseline-change-fig', width: W, height: H, theme: t, font: 'sans',
    title: `温室効果ガス排出量（${emissions[0].fy}〜${latest.fy}年度）と削減率の基準線`,
    desc: `${latest.fy}年度の排出量は${latest.v}万t。${oldBase}年度（${val(oldBase)}万t）比では${oldCut}%減、${newBase}年度（${val(newBase)}万t）比では${newCut}%減。基準線だけが動き、各年度の値は変わらない。` },
  axis(y, { orient: 'left', at: m.l, grid: [m.l, W - m.r + 10], theme: t, size: 16, tickValues: [0, 100, 200, 300] }),
  textLines(['排出量（万t-CO₂）'], { x: m.l - 46, y: 8, size: 16, fill: t.c('muted'), valign: 'top' }),
  emissions.map(d => {
    const states = baseFill(d.fy);
    return el('rect', { x: x(d.fy), y: y(d.v), width: x.bw, height: y(0) - y(d.v), rx: 2,
      fill: d === latest ? t.c('ink') : states ? states[0].fill : t.c('context'), ...(states ? { 'data-states': states, 'data-duration': dur } : {}) });
  }),
  emissions.map(d => textLines([String(d.fy)], { x: x.center(d.fy), y: H - m.b + 10, size: 16, anchor: 'middle', valign: 'top', fill: d === latest ? t.c('ink') : t.c('muted'), weight: d === latest ? 700 : null })),
  textLines([`${latest.v}`], { x: x.center(latest.fy), y: yl - 10, size: 17, anchor: 'middle', weight: 700, fill: t.c('ink') }),
  // base-year tags: one per base, swapped as the reference moves
  [[oldBase, 0, 0], [newBase, 1, null]].map(([fy, from, until]) => textLines(['基準年度', `${val(fy)}`], { x: x.center(fy), y: y(val(fy)) - 32, size: 16, anchor: 'middle', weight: 700, fill: t.c('accent'), lineHeight: 1.15,
    attrs: { 'data-step': from, 'data-until': until, 'data-motion': from ? 'reveal' : null, 'data-delay': from ? dur - 200 : null } })),
  // build 1: the old reference stays behind, named, with its own measurement
  g({ 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 250, 'data-duration': 500 },
    el('line', { x1: m.l, x2: bx + 34, y1: yo, y2: yo, stroke: t.c('muted'), 'stroke-width': 1.6, 'stroke-dasharray': '3 5' }),
    el('path', { d: `M${bx + 26} ${yo}h8V${yl}h-8`, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.5 }),
    textLines([`${oldBase}年度比 −${oldCut}%`], { x: bx + 44, y: (yo + yl) / 2 - 30, size: 16, fill: t.c('muted'), valign: 'middle' }),
    textLines([`旧基準（${oldBase}年度）`], { x: m.l + 8, y: yo - 10, size: 16, fill: t.c('muted') })),
  // the reference line itself: one element that moves from the old base to the new one
  g({ 'data-states': { 0: { translate: '0px 0px' }, 1: { translate: `0px ${(yn - yo).toFixed(2)}px` } }, 'data-duration': dur, 'data-easing': ease, style: 'transform-box:view-box' },
    el('line', { x1: m.l, x2: bx + 6, y1: yo, y2: yo, stroke: t.c('accent'), 'stroke-width': 2.6 }),
    textLines([`基準：${oldBase}年度`], { x: x(oldBase + 1) - 4, y: yo - 10, size: 17, weight: 700, fill: t.c('accent'), halo: t.c('paper'), attrs: { 'data-step': 0, 'data-until': 0 } }),
    textLines([`基準：${newBase}年度`], { x: x(newBase + 1) - 4, y: yo - 10, size: 17, weight: 700, fill: t.c('accent'), halo: t.c('paper'), attrs: { 'data-step': 1, 'data-motion': 'reveal', 'data-delay': dur - 200 } })),
  el('path', { d: `M${bx - 8} ${yo}h8V${yl}h-8`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke',
    'data-states': { 0: { transform: 'matrix(1,0,0,1,0,0)' }, 1: { transform: `matrix(1,0,0,${a.toFixed(5)},0,${b.toFixed(2)})` } }, 'data-duration': dur, 'data-easing': ease, style: 'transform-box:view-box;transform-origin:0 0' }),
  textLines([`${oldBase}年度比`, `−${oldCut}%`], { x: bx + 12, y: (yo + yl) / 2, size: 18, weight: 700, fill: t.c('accent'), valign: 'middle', lineHeight: 1.2, attrs: { 'data-step': 0, 'data-until': 0 } }),
  textLines([`${newBase}年度比`, `−${newCut}%`], { x: bx + 12, y: (yn + yl) / 2, size: 18, weight: 700, fill: t.c('accent'), valign: 'middle', lineHeight: 1.2, attrs: { 'data-step': 1, 'data-motion': 'reveal', 'data-delay': dur - 200 } }));
}

export default {
  study: true,
  id: 'motion-baseline-change',
  language: 'ja',
  title: 'Baseline change: move the reference, not the data',
  className: 'st cs-sustainability-moss',
  notes: 'Purpose: When the reference of a comparison changes (a new base year, a recalculated baseline), show the reference moving and keep the old one visible, instead of silently replacing a percentage.\nModify: Replace `emissions`, `oldBase` and `newBase`; the line position, bracket scale, both reduction rates and the headline recompute.\nInvariant: The columns never move or rescale; only the reference line travels, carrying its label; the old reference stays as a labelled ghost with its own measurement; both rates are computed from the same latest value.\nStatic: The final build shows the new reference, the ghost of the old one and both percentages, so the change is documented in PDF.',
  sources: [{ type: 'original-example', file: 'assets/motion/baseline-change.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="word-break:auto-phrase">同じ${latest.v}万トンでも、基準年度を<em>${newBase}年度</em>にすると削減率は${oldCut}%から${newCut}%に縮む</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 架空の市の温室効果ガス排出量（年度）</span><span>モーション · 基準線の移動を明示する（1ビルド）</span></p>`,
};
