// Diagram study · Saturation response — an explicitly assumed curve fitted to the months we observed.
// The model (Michaelis–Menten form) is fitted by least squares to `months`; the plateau, the
// half-saturation point and the marginal gains on the page are read from that fit. No point is dropped.
import { svgRoot, el, g, textLines, linear, axis, pathFromPoints, rng, fmt, theme as makeTheme } from '../runtime/figure.mjs';

// 月間の広告費（百万円）と新規会員数（人）、18か月分（架空）。2件は特殊要因のある月。
const rand = rng(11);
const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const labels = Array.from({ length: 18 }, (_, i) => `${2024 + Math.floor((i + 3) / 12)}年${((i + 3) % 12) + 1}月`); // 2024年4月 … 2025年9月
const spend = [8, 12, 10, 15, 18, 22, 20, 26, 30, 28, 34, 38, 36, 42, 46, 50, 55, 58];
const shocks = { 8: { size: 420, note: 'テレビ番組で紹介' }, 16: { size: -380, note: 'サイト障害' } }; // counterexamples stay in
const months = labels.map((label, i) => ({ label, x: spend[i], y: Math.round(2600 * spend[i] / (28 + spend[i]) + 70 * normal() + (shocks[i]?.size ?? 0)), note: shocks[i]?.note }));

// 仮定したモデル：会員数 = 上限 × 広告費 ÷（半飽和点 + 広告費）。Grid over the half-saturation point,
// closed-form least squares for the plateau at each candidate.
let fit = null;
for (let K = 2; K <= 200; K += 0.25) {
  const gx = months.map(d => d.x / (K + d.x));
  const top = months.reduce((s, d, i) => s + d.y * gx[i], 0) / gx.reduce((s, v) => s + v * v, 0);
  const sse = months.reduce((s, d, i) => s + (d.y - top * gx[i]) ** 2, 0);
  if (!fit || sse < fit.sse) fit = { K, top, sse };
}
const model = x => (fit.top * x) / (fit.K + x);
const perMillion = x => (fit.top * fit.K) / (fit.K + x) ** 2; // members per extra 1百万円 (= 100万円)
const early = months.reduce((a, b) => (b.x < a.x ? b : a)), now = months.at(-1);
const man = v => fmt(v * 100, { locale: 'ja' }); // 百万円 → 万円
const people = v => fmt(Math.round(v), { locale: 'ja' });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 74, r: 210, t: 48, b: 62 };
  const xMax = Math.ceil(now.x / 10) * 10 + 10;
  const x = linear([0, xMax], [m.l, W - m.r]);
  const y = linear([0, Math.ceil(fit.top / 500) * 500], [H - m.b, m.t]);
  const lo = Math.min(...months.map(d => d.x)), hi = Math.max(...months.map(d => d.x)); // observed spend range
  const curve = (a, b) => Array.from({ length: 41 }, (_, i) => a + ((b - a) * i) / 40).map(v => [x(v), y(model(v))]);
  const tangent = (d, half) => { const s = perMillion(d.x); return [[x(d.x - half), y(model(d.x) - s * half)], [x(d.x + half), y(model(d.x) + s * half)]]; };
  return svgRoot({ id: 'saturation-response-fig', width: W, height: H, theme: t,
    title: '月間広告費と新規会員数、仮定した飽和曲線とその傾き',
    desc: `18か月分。最小二乗で推定した上限は月${people(fit.top)}人、半分に達する広告費は月${man(fit.K)}万円。100万円あたりの増加は、月${man(early.x)}万円の水準で${people(perMillion(early.x))}人、月${man(now.x)}万円の現在は${people(perMillion(now.x))}人。特殊要因の2か月（${months.filter(d => d.note).map(d => `${d.label}：${d.note}`).join('、')}）も推定に含めている。` },
  axis(y, { orient: 'left', at: m.l, grid: [m.l, W - m.r], theme: t, size: 16, count: 5, format: v => fmt(v, { locale: 'ja' }) }),
  axis(x, { orient: 'bottom', at: H - m.b, theme: t, size: 16, count: 6, tickSize: 5, format: v => (v ? `${fmt(v * 100, { locale: 'ja' })}万` : '0') }),
  el('line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, stroke: t.c('ink'), 'stroke-width': 1.2 }),
  textLines(['広告経由の新規会員数（人／月）'], { x: m.l - 56, y: m.t - 24, size: 16, fill: t.c('muted') }),
  textLines(['広告費（円／月）'], { x: W - m.r, y: H - 14, size: 16, anchor: 'end', fill: t.c('muted') }),
  // plateau and half-saturation, both read from the fit
  el('line', { x1: m.l, x2: W - m.r, y1: y(fit.top), y2: y(fit.top), stroke: t.c('muted'), 'stroke-width': 1.3, 'stroke-dasharray': '6 5' }),
  textLines([`推定上限 ${people(fit.top)}人`], { x: W - m.r + 10, y: y(fit.top), size: 16, valign: 'middle', fill: t.c('muted') }),
  el('path', { d: `M${x(fit.K)} ${H - m.b}V${y(model(fit.K))}H${m.l}`, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.2, 'stroke-dasharray': '2 4' }),
  textLines([`上限の半分：広告費${man(fit.K)}万円`], { x: x(fit.K) + 8, y: H - m.b - 12, size: 16, fill: t.c('muted') }),
  // solid where months were observed, dashed where the curve is only the assumed function
  el('path', { d: pathFromPoints(curve(lo, hi), { curve: 'monotone' }), fill: 'none', stroke: t.c('ink'), 'stroke-width': 2.6 }),
  [[0, lo], [hi, xMax]].map(([a, b]) => el('path', { d: pathFromPoints(curve(a, b), { curve: 'monotone' }), fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.6, 'stroke-dasharray': '4 5' })),
  // every observed month, including the two the curve does not explain
  months.map(d => el('circle', { cx: x(d.x), cy: y(d.y), r: 6.5, fill: d.note ? 'none' : t.c('muted'), stroke: t.c('muted'), 'stroke-width': d.note ? 2 : 1 })),
  months.filter(d => d.note).map(d => textLines([`${d.label}：${d.note}`], { x: x(d.x) + 12, y: y(d.y) + (d.y > model(d.x) ? -10 : 14), size: 16, fill: t.c('muted'), valign: 'middle', halo: t.c('paper') })),
  // the slope where we started and where we are: members per extra 100万円
  el('path', { d: pathFromPoints(tangent(early, 6)), stroke: t.c('ink'), 'stroke-width': 2, fill: 'none' }),
  textLines([`月${man(early.x)}万円の頃：100万円あたり${people(perMillion(early.x))}人`], { x: x(early.x) + 18, y: y(model(early.x)) + 30, size: 16, fill: t.c('ink'), halo: t.c('paper') }),
  el('path', { d: pathFromPoints(tangent(now, 10)), stroke: t.c('accent'), 'stroke-width': 3.4, fill: 'none' }),
  el('circle', { cx: x(now.x), cy: y(model(now.x)), r: 5.5, fill: t.c('accent'), stroke: t.c('paper'), 'stroke-width': 2 }),
  textLines([`現在（月${man(now.x)}万円）`, `100万円あたり${people(perMillion(now.x))}人`], { x: x(now.x) - 40, y: y(model(now.x)) - 74, size: 17, weight: 700, fill: t.c('accent'), halo: t.c('paper'), lineHeight: 1.3 }),
  textLines(['仮定したモデル：会員数 = 上限 × 広告費 ÷（半飽和点 + 広告費）、最小二乗法'], { x: m.l + 12, y: m.t + 14, size: 16, fill: t.c('muted'), valign: 'top' }));
}

export default {
  study: true,
  id: 'saturation-response',
  language: 'ja',
  title: 'Saturation response: early gains against a plateau',
  className: 'st cs-strategy-dark',
  notes: 'Purpose: Distinguish early gains from saturation by fitting an explicitly assumed response curve, then reading its slope where you started and where you are now.\nModify: Replace `labels`, `spend` and the outcomes in `months` with your data (keep unusual months in, with a `note`); the fit, plateau, half-saturation point, both slopes and the headline recompute. Swap the model only for another stated function.\nInvariant: The assumed function is written on the page; the curve is fitted, not drawn by eye; months the curve does not explain stay visible and labelled; slopes are reported in the units decision makers spend (per 100万円).\nStatic: Already static. Do not extend the curve far beyond the highest observed spend.',
  sources: [{ type: 'original-example', file: 'assets/svg/saturation-response.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">広告費の効きは鈍った。追加100万円あたりの新規会員は${people(perMillion(early.x))}人から<em>${people(perMillion(now.x))}人</em>へ</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · ${months[0].label}〜${months.at(-1).label}の月次実績。傾きは推定した曲線の接線から算出</span><span>飽和曲線（反応曲線）</span></p>`,
};
