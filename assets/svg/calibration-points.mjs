// Diagram study · Calibration points — each forecast value against how often it came true, with intervals.
// Bins are the forecast's own 10% steps; counts, observed frequencies and Wilson 95% intervals are
// computed from day-level records, and the headline reads the same bins.
import { svgRoot, el, g, textLines, linear, axis, rng, fmt, pct, theme as makeTheme } from '../runtime/figure.mjs';

// 5年間（1,826日）の降水確率予報（前日17時発表、10%刻み）と、翌日に1mm以上の雨が降ったか（架空）。
const rand = rng(28);
const mix = [0.15, 0.2, 0.14, 0.11, 0.08, 0.07, 0.06, 0.06, 0.05, 0.04, 0.04]; // how often each value is issued
const chance = f => (f === 0 ? 0.015 : f <= 0.5 ? f : 0.5 + 0.75 * (f - 0.5)); // the forecaster's true reliability
const days = Array.from({ length: 1826 }, () => {
  let u = rand(), k = 0;
  while (u > mix[k] && k < mix.length - 1) { u -= mix[k]; k++; }
  return { forecast: k / 10, rain: rand() < chance(k / 10) };
});

// Wilson score interval for a proportion k/n (95%).
const wilson = (k, n, z = 1.96) => {
  const p = k / n, d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d, h = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
};
const bins = mix.map((_, k) => {
  const ds = days.filter(d => Math.round(d.forecast * 10) === k), wet = ds.filter(d => d.rain).length;
  const [lo, hi] = wilson(wet, ds.length);
  return { f: k / 10, n: ds.length, wet, obs: wet / ds.length, lo, hi, holds: lo <= k / 10 && k / 10 <= hi };
});
const focus = bins.at(-1); // the 100% forecasts
const middle = bins.filter(b => b.f > 0 && b.f < 1), middleHolds = middle.every(b => b.holds);
const p0 = v => pct(v, 0, { locale: 'ja' });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 800, H = 470;
  const m = { l: 68, r: 64, t: 40 }, plotH = 282;
  const x = linear([0, 1], [m.l, W - m.r]), y = linear([0, 1], [m.t + plotH, m.t]);
  const tick = { theme: t, size: 16, tickValues: [0, 0.2, 0.4, 0.6, 0.8, 1], format: v => pct(v) };
  const countY = m.t + plotH + 52;
  return svgRoot({ id: 'calibration-points-fig', width: W, height: H, theme: t,
    title: '降水確率予報の信頼度図（予報値ごとの観測頻度と95%信頼区間）',
    desc: `${fmt(days.length)}日分。予報値ごとの観測頻度：${bins.map(b => `${p0(b.f)}→${p0(b.obs)}（${b.n}日）`).join('、')}。10〜90%の各階級は95%区間が予報値を含む${middleHolds ? '' : '（一部を除く）'}。100%の日に雨が降ったのは${p0(focus.obs)}。` },
  axis(y, { orient: 'left', at: m.l, grid: [m.l, W - m.r], ...tick }),
  axis(x, { orient: 'bottom', at: m.t + plotH, tickSize: 5, ...tick, tickValues: bins.map(b => b.f).filter((_, k) => k % 2 === 0) }),
  el('line', { x1: m.l, x2: W - m.r, y1: m.t + plotH, y2: m.t + plotH, stroke: t.c('ink'), 'stroke-width': 1.2 }),
  textLines(['実際に雨が降った割合'], { x: m.l - 50, y: m.t - 22, size: 16, fill: t.c('muted'), valign: 'bottom' }),
  // the reference: a forecast that means exactly what it says
  el('line', { x1: x(0), y1: y(0), x2: x(1), y2: y(1), stroke: t.c('muted'), 'stroke-width': 1.4, 'stroke-dasharray': '5 5' }),
  textLines(['予報どおりなら点はこの線上'], { x: x(1) - 10, y: y(1) - 10, size: 16, anchor: 'end', fill: t.c('muted') }),
  bins.map(b => { const hl = b === focus, c = hl ? t.c('accent') : t.c('ink'); return g({ class: 'bin' },
    el('line', { x1: x(b.f), x2: x(b.f), y1: y(b.lo), y2: y(b.hi), stroke: c, 'stroke-width': hl ? 2.6 : 1.8 }),
    [b.lo, b.hi].map(v => el('line', { x1: x(b.f) - 6, x2: x(b.f) + 6, y1: y(v), y2: y(v), stroke: c, 'stroke-width': hl ? 2.6 : 1.8 })),
    el('circle', { cx: x(b.f), cy: y(b.obs), r: hl ? 7.5 : 6, fill: c, stroke: t.c('paper'), 'stroke-width': 2 })); }),
  textLines([p0(focus.obs)], { x: x(focus.f) + 13, y: y(focus.obs), size: 20, valign: 'middle', weight: 700, fill: t.c('accent'), halo: t.c('paper') }),
  // days behind each point, under the axis
  textLines(['日数'], { x: m.l - 34, y: countY, size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted') }),
  bins.map(b => textLines([fmt(b.n)], { x: x(b.f), y: countY, size: 15, anchor: 'middle', valign: 'middle', fill: b === focus ? t.c('accent') : t.c('ink'), weight: b === focus ? 700 : 500 })),
  textLines(['予報された降水確率'], { x: W - m.r, y: H - 30, size: 16, anchor: 'end', fill: t.c('muted') }));
}

export default {
  study: true,
  id: 'calibration-points',
  language: 'ja',
  title: 'Calibration points: forecast probability against observed frequency',
  className: 'st st--rail cs-geo-map',
  notes: 'Purpose: Compare stated probabilities with how often the event happened, bin by bin, with each bin\'s sample size and uncertainty on the page.\nModify: Replace `days` with your records (forecast probability, outcome); bins follow the forecast\'s own steps. Counts, frequencies, Wilson intervals, the focus bin and the headline recompute.\nInvariant: The diagonal reference stays; predicted and observed are defined on the page; every point carries its count and a 95% interval; a bin is called miscalibrated only when its interval excludes the diagonal.\nStatic: Already static. With continuous probabilities, bin them first and say how (see calibration).',
  sources: [{ type: 'original-example', file: 'assets/svg/calibration-points.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">降水確率100%の日に、雨が降ったのは<em>${p0(focus.obs)}</em>。<br><span class="st-quiet">10〜90%は${middleHolds ? 'どの階級も' : 'ほとんどの階級で'}95%区間が予報値を含む</span></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <p class="st-text"><strong>予報された降水確率</strong>：前日17時発表の翌日の値。10%刻みで、0%は5%未満を表す。</p>
  <hr class="st-rule">
  <p class="st-text"><strong>実際に雨が降った割合</strong>：その予報が出た日のうち、1mm以上の雨が降った日の割合。縦線は95%信頼区間（Wilson法）。</p>
</div>
<p class="st-source" data-region="source"><span>架空のデータ · ある地点の5年間${fmt(days.length)}日分の予報と観測</span><span>信頼度図</span></p>`,
};
