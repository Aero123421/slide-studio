// Composition study · Number and unit — one hero figure set with its unit and its scope as a
// single typographic block, then a small proof that places the figure among its observations
// and beside the number it is most often confused with. Everything is computed from `homes`.
import { svgRoot, el, g, textLines, linear, theme as makeTheme, fmt, quantile, normalQuantile, rng, beeswarm } from '../runtime/figure.mjs';

const ID = 'composition-number-and-unit';
// Seasonal performance factor per home: kWh of heat delivered ÷ kWh of electricity used,
// 1 Oct 2025 – 31 Mar 2026, space heating + hot water, defrost included (illustrative; replace
// `homes` with measured values — the seeded generator only keeps the example reproducible).
const homes = (() => {
  const r = rng(2026);
  return Array.from({ length: 214 }, (_, i) => {
    const z = normalQuantile((i + 0.5) / 214) + (r() - 0.5) * 0.35; // smooth spread plus measurement jitter
    const v = 2.93 + 0.31 * z - 0.1 * Math.max(0, -z) ** 1.6;       // longer tail of under-performing homes
    return Math.round(v * 1000) / 1000;
  });
})();
const rated = { value: 4.1, at: '7 °C outside, 35 °C flow water, heating only' }; // datasheet COP of the installed model

// derived values
const median = quantile(homes, 0.5), q1 = quantile(homes, 0.25), q3 = quantile(homes, 0.75);
const reachedRating = homes.filter(v => v >= rated.value).length;
const d1 = v => fmt(v, { digits: 1 });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 330;
  const base = H - 64; // axis line
  const x = linear([1.5, 4.4], [0, W]);
  const r = 5.6, mid = base - 104; // beeswarm around a centre line: every home at its exact value
  const dots = beeswarm(homes.map(v => x(v)), { r, gap: 1.2 }).map(p => ({ cx: p.x, cy: mid + p.y }));
  const stackTop = Math.min(...dots.map(d => d.cy)) - r;
  const parts = [];
  // axis
  parts.push(el('line', { x1: 0, x2: W, y1: base, y2: base, stroke: t.c('ink'), 'stroke-width': 1.4 }));
  for (const v of [2, 2.5, 3, 3.5, 4]) {
    parts.push(el('line', { x1: x(v), x2: x(v), y1: base, y2: base + 6, stroke: t.c('ink') }));
    parts.push(textLines([d1(v)], { x: x(v), y: base + 14, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  }
  parts.push(textLines(['Seasonal performance, kWh of heat per kWh of electricity · one dot per home'], { x: 0, y: base + 50, size: 16, fill: t.c('muted') }));
  // the observations
  parts.push(g({ class: 'cmp-nu-dots' }, dots.map(d => el('circle', { cx: d.cx, cy: d.cy, r, fill: t.c('context') }))));
  // median: the hero number's own mark
  const mx = x(median);
  parts.push(el('line', { x1: mx, x2: mx, y1: stackTop - 54, y2: base, stroke: t.c('accent'), 'stroke-width': 3 }));
  parts.push(textLines([`Median ${d1(median)}`], { x: mx - 12, y: stackTop - 40, size: 18, anchor: 'end', fill: t.c('accent'), weight: 700 }));
  parts.push(textLines([`middle half of homes ${d1(q1)}–${d1(q3)}`], { x: mx - 12, y: stackTop - 18, size: 16, anchor: 'end', fill: t.c('muted') }));
  // the datasheet number: same unit, different scope
  const rx = x(rated.value);
  parts.push(el('line', { x1: rx, x2: rx, y1: 0, y2: base, stroke: t.c('ink'), 'stroke-width': 1.6, 'stroke-dasharray': '6 6' }));
  parts.push(textLines([`Datasheet ${d1(rated.value)}`], { x: rx - 14, y: 6, size: 18, anchor: 'end', valign: 'top', fill: t.c('ink'), weight: 700 }));
  parts.push(textLines(['one test point: 7 °C outside,', '35 °C flow water, heating only.', `${reachedRating === 0 ? 'No' : reachedRating} home${reachedRating === 1 ? '' : 's'} reached it over the winter.`], { x: rx - 14, y: 36, size: 17, anchor: 'end', valign: 'top', lineHeight: 1.35, fill: t.c('muted') }));
  return svgRoot({ id: `${ID}-fig`, width: W, height: H, theme: t,
    title: 'Seasonal performance of 214 heat pumps, one dot per home, with the median and the datasheet rating',
    desc: `Median ${d1(median)}, middle half of homes ${d1(q1)} to ${d1(q3)}. The datasheet rating of ${d1(rated.value)} is measured at ${rated.at}; ${reachedRating} of ${homes.length} homes reached it over the winter.` },
  parts);
}

export default {
  study: true,
  id: ID,
  title: 'Number and unit: a hero figure set with its unit and scope as one block',
  className: 'st cs-sustainability-moss cmp-number-unit',
  notes: 'Purpose: Use when one quantity is the message and it is easily misread: a ratio, a rate, a per-unit figure, anything with a denominator or a measurement boundary. The number, its unit and its scope are one block; the proof below shows where the figure sits among its observations and beside the number people will compare it with.\nModify: Replace `homes` with measured values and `rated` with the figure it gets confused with; the hero number, the quartiles, the dots and the count recompute. Rewrite the unit and the scope line for your quantity (what was measured, where, over what period, what is included).\nInvariant: The unit sits on the number\'s baseline and the scope directly under it — never in a footnote or a different column; the comparison number carries its own scope; the hero figure is ink, its mark in the proof is the one accent.\nStatic: Already static.',
  sources: [{ type: 'original-example', file: `assets/compositions/${ID}.mjs` }],
  exportPolicy: 'final',
  content: `<h1 class="cmp-nu-hero" data-region="title"><span class="cmp-nu-num">${d1(median)}</span><span class="cmp-nu-unit">kWh of heat<br>per kWh of electricity</span></h1>
<p class="cmp-nu-scope" data-region="support">Median seasonal performance of ${homes.length} air-source heat pumps in occupied homes, 1&nbsp;October 2025 to 31&nbsp;March 2026: space heating and hot water, defrost cycles included.</p>
<figure class="cmp-nu-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · heat and electricity meters on each unit, read every 10 minutes</span><span>Number, unit and scope · dot plot</span></p>`,
};
