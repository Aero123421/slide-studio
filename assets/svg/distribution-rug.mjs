// Diagram study · Density with a rug — the estimated curve and every observation beneath it.
// The curve is the engine's Gaussian KDE of log10(radius) (Silverman bandwidth); the rug draws one
// tick per planet from the same array, so curve and sample can never drift apart.
import { svgRoot, el, g, textLines, linear, pathFromPoints, kde, silverman, rng, fmt, theme as makeTheme } from '../runtime/figure.mjs';

// Radii of 160 small transiting planets, in Earth radii (illustrative survey sample).
const rand = rng(32);
const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const radii = Array.from({ length: 160 }, () => Math.round(10 ** (rand() < 0.45
  ? Math.log10(1.3) + 0.058 * normal() // rocky super-Earths
  : Math.log10(2.4) + 0.068 * normal()) * 100) / 100); // gas-rich sub-Neptunes

// Sizes span a factor of four, so the density is estimated on log10(radius) and drawn on a log axis.
const logs = radii.map(r => Math.log10(r));
const bw = silverman(logs); // dex
const lo = Math.log10(0.8), hi = Math.log10(4.5);
const curve = kde(logs, Array.from({ length: 241 }, (_, i) => lo + ((hi - lo) * i) / 240), bw);
const peaks = curve.filter((p, i) => i > 0 && i < curve.length - 1 && p[1] > curve[i - 1][1] && p[1] >= curve[i + 1][1])
  .sort((a, b) => b[1] - a[1]).slice(0, 2).sort((a, b) => a[0] - b[0]);
const valley = curve.filter(p => p[0] > peaks[0][0] && p[0] < peaks[1][0]).reduce((a, b) => (b[1] < a[1] ? b : a));
const gapLo = 1.6, gapHi = 2.0;
const inGap = radii.filter(r => r >= gapLo && r < gapHi).length;
const re = v => fmt(10 ** v, { digits: 1 });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 24, r: 24, t: 40, b: 112 };
  const x = linear([lo, hi], [m.l, W - m.r]);
  const top = Math.max(...curve.map(p => p[1]));
  const y = linear([0, top * 1.08], [H - m.b, m.t]);
  const base = H - m.b, rugTop = base + 14, rugBottom = base + 44;
  const area = pathFromPoints([[x(lo), base], ...curve.map(([v, d]) => [x(v), y(d)]), [x(hi), base]], { close: true });
  const line = pathFromPoints(curve.map(([v, d]) => [x(v), y(d)]));
  const ticks = [1, 1.5, 2, 3, 4];
  const names = ['Super-Earths', 'Sub-Neptunes'];
  return svgRoot({ id: 'distribution-rug-fig', width: W, height: H, theme: t,
    title: 'Distribution of 160 small-planet radii: kernel density on a log scale with a rug of every planet',
    desc: `Two peaks, at ${re(peaks[0][0])} and ${re(peaks[1][0])} Earth radii, separated by a valley at ${re(valley[0])}. Only ${inGap} of ${radii.length} planets fall between ${gapLo} and ${gapHi} Earth radii. Density estimated on log10(radius), Gaussian kernel, bandwidth ${fmt(bw, { digits: 3 })} dex.` },
  el('path', { d: area, fill: t.c('surface') }),
  // the gap: the area under the curve between gapLo and gapHi, then the valley itself — the one accented thing
  el('path', { d: pathFromPoints([[x(Math.log10(gapLo)), base], ...curve.filter(([v]) => v >= Math.log10(gapLo) && v <= Math.log10(gapHi)).map(([v, d]) => [x(v), y(d)]), [x(Math.log10(gapHi)), base]], { close: true }), fill: t.c('accent'), 'fill-opacity': 0.2 }),
  el('path', { d: line, fill: 'none', stroke: t.c('ink'), 'stroke-width': 2.6, 'stroke-linejoin': 'round' }),
  el('line', { x1: m.l, x2: W - m.r, y1: base, y2: base, stroke: t.c('rule'), 'stroke-width': 1.2 }),
  // rug: one tick per planet, beneath the curve
  g({ class: 'rug' }, radii.map(r => el('line', { x1: x(Math.log10(r)), x2: x(Math.log10(r)), y1: rugTop, y2: rugBottom, stroke: t.c('ink'), 'stroke-width': 1.2, 'stroke-opacity': 0.55 }))),
  textLines(['Each tick', 'is a planet'], { x: m.l, y: (rugTop + rugBottom) / 2, size: 16, valign: 'middle', fill: t.c('muted'), lineHeight: 1.15 }),
  // log axis in Earth radii
  ticks.map(v => g({},
    el('line', { x1: x(Math.log10(v)), x2: x(Math.log10(v)), y1: rugBottom + 4, y2: rugBottom + 10, stroke: t.c('muted') }),
    textLines([fmt(v)], { x: x(Math.log10(v)), y: rugBottom + 14, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') }))),
  textLines(['Planet radius, Earth radii (log scale)'], { x: W - m.r, y: H - 8, size: 16, anchor: 'end', fill: t.c('muted') }),
  peaks.map((p, k) => g({ class: 'peak' },
    textLines([names[k]], { x: x(p[0]), y: y(top) - 40, size: 19, anchor: 'middle', weight: 700, fill: t.c('ink') }),
    textLines([`peak ${re(p[0])}`], { x: x(p[0]), y: y(top) - 16, size: 16, anchor: 'middle', fill: t.c('muted') }))),
  // the valley: a marker line from the label row, through the curve's minimum, down to the rug
  el('line', { x1: x(valley[0]), x2: x(valley[0]), y1: y(top) + 2, y2: rugBottom, stroke: t.c('accent'), 'stroke-width': 2.4 }),
  el('circle', { cx: x(valley[0]), cy: y(valley[1]), r: 5.5, fill: t.c('accent'), stroke: t.c('paper'), 'stroke-width': 2 }),
  textLines([`Valley at ${re(valley[0])} Earth radii`], { x: x(valley[0]), y: y(top) - 40, size: 19, anchor: 'middle', weight: 700, fill: t.c('accent') }),
  textLines([`${inGap} of ${radii.length} planets in ${gapLo}–${gapHi}`], { x: x(valley[0]), y: y(top) - 16, size: 16, anchor: 'middle', fill: t.c('muted') }),
  textLines([`Curve: Gaussian kernel density of log10(radius), bandwidth ${fmt(bw, { digits: 3 })} dex (Silverman), area = 1`], { x: m.l, y: H - 8, size: 16, fill: t.c('muted') }));
}

export default {
  study: true,
  id: 'distribution-rug',
  title: 'Density with a rug: the sample stays under the curve',
  className: 'st cs-astronomy-night',
  notes: 'Purpose: Pair a smooth distribution estimate with a rug of the raw observations, so the audience sees both the shape and how much data stands behind each part of it.\nModify: Replace `radii` with your values; the log transform, KDE, peaks, valley and gap count recompute. Drop the log10 transform (and the log axis) if your values do not span orders of magnitude.\nInvariant: The curve and the rug come from the same array; the transformation, kernel and bandwidth are named on the page; the rug is never thinned or jittered away.\nStatic: Already static. If the bandwidth changes the story, show two bandwidths side by side.',
  sources: [{ type: 'original-example', file: 'assets/svg/distribution-rug.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Small planets come in two sizes, with a valley near <em>${re(valley[0])} Earth radii</em> where few are found</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · a simulated survey sample of ${radii.length} transiting planets smaller than 4 Earth radii</span><span>Kernel density with rug</span></p>`,
};
