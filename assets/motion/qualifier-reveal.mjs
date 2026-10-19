// Motion study · Keep the qualification — the headline result comes first, the breakdown
// second, and the qualifier arrives before the audience leaves with the headline alone.
// Builds: 1 the time bands with their intervals, 2 the qualifier in the headline and the plot.
import { svgRoot, el, g, linear, band, textLines, theme as makeTheme, fmt } from '../runtime/figure.mjs';

// デマンド交通の実証運行：旧路線バスとの待ち時間の差（分、95%信頼区間）と利用件数（架空のデータ）。
const bands = [
  { label: '平日 7〜9時', estimate: -6.2, low: -8.0, high: -4.4, trips: 1420 },
  { label: '平日 9〜16時', estimate: -4.1, low: -5.6, high: -2.6, trips: 2480 },
  { label: '平日 16〜19時', estimate: -3.0, low: -4.9, high: -1.1, trips: 1410 },
  { label: '土日祝', estimate: -0.8, low: -2.9, high: 1.3, trips: 1190 },
  { label: '夜間 19時以降', estimate: 0.6, low: -2.2, high: 3.4, trips: 560 },
];
// Trip-weighted average; its interval combines the bands' standard errors.
const trips = bands.reduce((s, b) => s + b.trips, 0);
const w = b => b.trips / trips, se = b => (b.high - b.low) / 3.92;
const est = bands.reduce((s, b) => s + w(b) * b.estimate, 0);
const half = 1.96 * Math.sqrt(bands.reduce((s, b) => s + (w(b) * se(b)) ** 2, 0));
const overall = { label: '平均', estimate: est, low: est - half, high: est + half };
const unclear = bands.filter(b => b.low <= 0 && b.high >= 0); // intervals that cross zero
const f1 = v => fmt(v, { digits: 1, locale: 'ja' });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 420, left = 190, right = 230, top = 8, bottom = 64;
  const x = linear([-9, 4], [left, W - right]);
  const rows = [...bands.map(b => b.label), '__gap', overall.label];
  const y = band(rows, [top, H - bottom], { inner: 0.3, outer: 0.05 });
  const colText = b => `${f1(b.estimate)}分 [${f1(b.low)} 〜 ${f1(b.high)}]`;
  const row = (b, { stroke, fill, weight = 500 }) => {
    const cy = y.center(b.label), crosses = b.low <= 0 && b.high >= 0;
    return [
      el('line', { x1: x(b.low), x2: x(b.high), y1: cy, y2: cy, stroke, 'stroke-width': 2.6, 'stroke-linecap': 'round' }),
      el('circle', { cx: x(b.estimate), cy, r: 8, fill: crosses ? t.c('paper') : fill, stroke, 'stroke-width': 2.4 }),
      textLines([b.label], { x: left - 18, y: cy, size: 18, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight }),
      textLines([colText(b)], { x: W - right + 22, y: cy, size: 17, valign: 'middle', fill: t.c('ink'), weight, attrs: { 'font-variant-numeric': 'tabular-nums' } }),
    ];
  };
  const oy = y.center(overall.label), h = y.bw * 0.36;
  const [u0, u1] = [unclear[0], unclear.at(-1)].map(b => y.center(b.label)), bx = x(Math.min(...unclear.map(b => b.low))) - 16;
  return svgRoot({ id: 'motion-qualifier-reveal-fig', width: W, height: H, theme: t,
    title: '時間帯別の待ち時間の差（デマンド交通 − 旧路線バス、分、95%信頼区間）',
    desc: `平均${f1(overall.estimate)}分（${f1(overall.low)}〜${f1(overall.high)}）。平日7〜19時の3つの時間帯は区間全体が0より小さいが、${unclear.map(b => b.label).join('と')}は区間が0をまたぐ。` },
  [-8, -6, -4, -2, 2, 4].map(v => el('line', { x1: x(v), x2: x(v), y1: top, y2: H - bottom, stroke: t.c('grid') })),
  [-8, -6, -4, -2, 0, 2, 4].map(v => textLines([v === 0 ? '0' : f1(v).replace('.0', '')], { x: x(v), y: H - bottom + 12, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') })),
  el('line', { x1: x(0), x2: x(0), y1: top, y2: H - bottom, stroke: t.c('ink'), 'stroke-width': 1.6 }),
  textLines(['← 待ち時間が短くなった'], { x: x(0) - 12, y: H - 8, size: 16, anchor: 'end', fill: t.c('muted'), weight: 600 }),
  textLines(['長くなった →'], { x: x(0) + 12, y: H - 8, size: 16, fill: t.c('muted'), weight: 600 }),
  // The overall result, present from the first build.
  el('line', { x1: 0, x2: W, y1: y('__gap') + y.bw / 2, y2: y('__gap') + y.bw / 2, stroke: t.c('rule') }),
  el('path', { d: `M${x(overall.low)} ${oy}L${x(overall.estimate)} ${oy - h}L${x(overall.high)} ${oy}L${x(overall.estimate)} ${oy + h}Z`, fill: t.c('accent') }),
  textLines([`${overall.label}（利用${fmt(trips, { locale: 'ja' })}件）`], { x: left - 18, y: oy, size: 18, anchor: 'end', valign: 'middle', fill: t.c('accent'), weight: 700 }),
  textLines([colText(overall)], { x: W - right + 22, y: oy, size: 17, valign: 'middle', fill: t.c('accent'), weight: 700, attrs: { 'font-variant-numeric': 'tabular-nums' } }),
  // Build 1 — the breakdown behind the average, top to bottom.
  g({ 'data-step': 1, 'data-motion': 'reveal', 'data-stagger': 110, 'data-duration': 450 },
    bands.map(b => g({}, row(b, { stroke: t.c('ink'), fill: t.c('ink') })))),
  // Build 2 — the qualifier: which intervals cross zero.
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-duration': 500 },
    el('path', { d: `M${bx + 8} ${u0 - 14}H${bx}V${u1 + 14}H${bx + 8}`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.6 }),
    textLines(['区間が0をまたぐ', '＝差は確かでない'], { x: bx - 12, y: (u0 + u1) / 2, size: 17, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: 600, lineHeight: 1.35 })));
}

export default {
  study: true,
  id: 'motion-qualifier-reveal',
  language: 'ja',
  title: 'Qualifier reveal: scope the headline before it sticks',
  className: 'st cs-wa-ai',
  notes: 'Purpose: State the headline result, show the breakdown behind it, and add the qualifier (scope or uncertainty) before the audience leaves with the headline alone.\nModify: Replace `bands` (estimate, 95% interval, trips); the weighted average, its interval and the list of bands whose intervals cross zero recompute. Rewrite the qualifier sentence if a different set of bands is clear.\nInvariant: The average stays on the page in every build; intervals are always drawn with their estimates; the qualifier is added to the headline, never hidden in notes; markers are hollow when the interval crosses zero.\nStatic: The final build shows the headline with its qualifier, every band with its interval, and the bracket on the bands that cross zero.',
  sources: [{ type: 'original-example', file: 'assets/motion/qualifier-reveal.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="max-width:1100px;text-wrap:initial;font-family:var(--ss-font-sans)">デマンド交通で、待ち時間は<em>平均${f1(Math.abs(overall.estimate))}分</em>短くなった。<br><span class="st-quiet" data-step="2" data-motion="reveal" data-duration="600">ただし、確かに短くなったのは平日の日中だけだ。</span></h1>
<figure class="st-fig" style="top:190px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 実証運行6か月、利用${fmt(trips, { locale: 'ja' })}件、平均は利用件数による加重</span><span>モーション · 結論のあとに条件を加える（2ステップ）</span></p>`,
};
