// Motion study · Make a rescale explicit — the same line, the same data, a new y-range.
// Build 1 transforms the line (identity preserved) while the tick labels swap and a
// note states the new axis floor. Geometry for both states comes from one data array.
import { svgRoot, el, g, linear, textLines, pathFromPoints, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const weeks = Array.from({ length: 26 }, (_, i) => i + 1);
const uptime = [99.31, 99.42, 99.38, 99.47, 99.52, 99.49, 99.55, 99.61, 99.58, 99.64, 99.71, 99.69, 99.74,
  99.78, 99.76, 99.81, 99.85, 99.83, 99.87, 99.9, 99.88, 99.91, 99.93, 99.92, 99.95, 99.96]; // weekly uptime, % (illustrative)
const wide = [0, 100], tight = [99.2, 100];

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 74, r: 120, t: 16, b: 46 };
  const x = linear([1, 26], [m.l, W - m.r]);
  const yWide = linear(wide, [H - m.b, m.t]), yTight = linear(tight, [H - m.b, m.t]);
  const pts = uptime.map((v, i) => [x(weeks[i]), yWide(v)]);
  // yTight(v) = a·yWide(v) + b  →  one vertical scale + translate maps state 0 onto state 1.
  const a = (yTight(100) - yTight(99.2)) / (yWide(100) - yWide(99.2)), b = yTight(100) - a * yWide(100);
  const ticksFor = (scale, values, digits) => values.map(v => g({},
    el('line', { x1: m.l, x2: W - m.r, y1: scale(v), y2: scale(v), stroke: t.c('grid') }),
    textLines([fmt(v, { digits })], { x: m.l - 12, y: scale(v), size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } })));
  const last = uptime.at(-1);
  return svgRoot({ id: 'axis-rescale-fig', width: W, height: H, theme: t,
    title: 'Weekly uptime over 26 weeks, first on a 0–100% axis, then on a 99.2–100% axis',
    desc: `Uptime rose from ${uptime[0]}% to ${last}%. On a 0–100% axis the line looks flat; after rescaling to 99.2–100% the improvement is visible. The axis floor is labelled.` },
  g({ 'data-states': ({ 0: { opacity: 1 }, 1: { opacity: 0 } }), 'data-duration': 500 }, ticksFor(yWide, [0, 25, 50, 75, 100], 0)),
  g({ 'data-states': ({ 0: { opacity: 0 }, 1: { opacity: 1 } }), 'data-duration': 700 }, ticksFor(yTight, [99.2, 99.4, 99.6, 99.8, 100], 1)),
  el('line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, stroke: t.c('ink'), 'stroke-width': 1.4 }),
  [1, 6, 11, 16, 21, 26].map(w => textLines([`W${w}`], { x: x(w), y: H - m.b + 12, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') })),
  g({ 'data-states': ({ 0: { transform: 'matrix(1,0,0,1,0,0)' }, 1: { transform: `matrix(1,0,0,${a.toFixed(5)},0,${b.toFixed(2)})` } }), 'data-duration': 1000, 'data-easing': 'smooth', style: 'transform-box:view-box;transform-origin:0 0' },
    el('path', { d: pathFromPoints(pts), fill: 'none', stroke: t.c('accent'), 'stroke-width': 3.4, 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' })),
  textLines([`${fmt(last, { digits: 2 })}%`], { x: W - m.r + 12, y: yTight(last), size: 18, weight: 700, valign: 'middle', fill: t.c('accent'), attrs: { 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 700 } }),
  g({ 'data-step': 1, 'data-motion': 'lift', 'data-delay': 900 },
    el('rect', { x: m.l + 12, y: H - m.b - 44, width: 330, height: 34, rx: 6, fill: t.c('paper'), stroke: t.c('rule') }),
    textLines(['Axis now starts at 99.2%, not 0%'], { x: m.l + 26, y: H - m.b - 27, size: 16, valign: 'middle', fill: t.c('ink'), weight: 650 })));
}

export default {
  study: true,
  id: 'motion-axis-rescale',
  title: 'Make a rescale explicit',
  className: 'st cs-terminal-dark',
  notes: 'Purpose: Zoom the value axis to reveal a small but real change, while saying out loud that the axis changed.\nModify: Replace `uptime` and both ranges; the transform that maps one range onto the other is computed, so the line keeps its identity.\nInvariant: The same path moves (no swapped drawing); tick labels change with it; the new floor is stated on the page in the final state.\nStatic: Final state shows the rescaled axis and its label. If both views matter, export them as two pages.',
  sources: [{ type: 'original-example', file: 'assets/motion/axis-rescale.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Uptime improved every month — <em>visible only once the axis is honest about its range</em></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · weekly availability, 26 weeks</span><span>Motion · data-states transform with labelled rescale (1 build)</span></p>`,
};
