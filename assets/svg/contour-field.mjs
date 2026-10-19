// Diagram study · Contour field — level sets of a computed 2-D function.
// The contours are computed from `field` by marching squares; nothing is hand-drawn.
import { contourPlot, svgRoot, el, g, textLines, theme as makeTheme, callout, fmt } from '../runtime/figure.mjs';

// Illustrative signal strength over a 2 × 1.3 km site: two transmitters and a hill shadow.
const towers = [{ x: 0.55, y: 0.62, power: 1.0, name: 'Tower A' }, { x: 1.45, y: 0.4, power: 0.75, name: 'Tower B' }];
const field = (x, y) => towers.reduce((s, t) => s + t.power * Math.exp(-((x - t.x) ** 2 + (y - t.y) ** 2) / 0.12), 0) - 0.35 * Math.exp(-((x - 1.0) ** 2 + (y - 0.95) ** 2) / 0.05);
const levels = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9];
const usable = 0.3; // level treated as usable coverage

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, pad = { l: 16, r: 260, t: 10, b: 30 };
  const w = W - pad.l - pad.r, h = H - pad.t - pad.b;
  const dom = { x0: 0, x1: 2, y0: 0, y1: 1.3 };
  const sx = v => pad.l + (v / 2) * w, sy = v => pad.t + h - (v / 1.3) * h;
  const legendX = W - pad.r + 36;
  return svgRoot({ id: 'contour-field-fig', width: W, height: H, theme: t,
    title: 'Signal strength contours over a 2 by 1.3 kilometre site',
    desc: `Contours at ${levels.join(', ')} of peak strength. Two peaks at Tower A and Tower B; a hill shadow between them pulls the ${usable} contour inward.` },
  el('rect', { x: pad.l, y: pad.t, width: w, height: h, rx: 8, fill: t.c('surface') }),
  contourPlot(field, { x: pad.l, y: pad.t, width: w, height: h, domain: dom, levels, theme: t, highlightLevel: usable, strokeWidth: 1.8 }),
  towers.map(tw => g({}, el('circle', { cx: sx(tw.x), cy: sy(tw.y), r: 7, fill: t.c('ink'), stroke: t.c('paper'), 'stroke-width': 2.5 }),
    textLines([tw.name], { x: sx(tw.x) + 12, y: sy(tw.y) - 12, size: 16, fill: t.c('ink'), weight: 700, halo: t.c('surface') }))),
  callout({ x: sx(1.0), y: sy(0.95), text: 'Hill shadow: the usable contour bends inward', dx: 70, dy: -70, width: 190, theme: t, size: 16, marker: 'ring', bounds: { w: W - pad.r, h: H } }),
  // scale bar: 0.5 km
  el('line', { x1: pad.l + 16, x2: pad.l + 16 + w / 4, y1: H - 10, y2: H - 10, stroke: t.c('ink'), 'stroke-width': 2.5 }),
  textLines(['500 m'], { x: pad.l + 16 + w / 8, y: H - 16, size: 15, anchor: 'middle', fill: t.c('ink'), weight: 600 }),
  // legend
  textLines(['Share of peak strength'], { x: legendX, y: pad.t + 20, size: 16, fill: t.c('muted'), weight: 600 }),
  levels.slice().reverse().map((lv, k) => {
    const y = pad.t + 54 + k * 34, idx = Math.round(((levels.length - k) / (levels.length + 1)) * (t.values.seq.length - 1));
    const hl = lv === usable;
    return g({}, el('line', { x1: legendX, x2: legendX + 34, y1: y, y2: y, stroke: hl ? t.c('accent') : t.seq(Math.max(1, idx)), 'stroke-width': hl ? 3.6 : 1.8 }),
      textLines([`${fmt(lv * 100)}%${hl ? '  usable' : ''}`], { x: legendX + 46, y, size: 16, valign: 'middle', fill: hl ? t.c('accent') : t.c('ink'), weight: hl ? 700 : 400 }));
  }));
}

export default {
  study: true,
  id: 'contour-field',
  title: 'Contour field: level sets of a computed surface',
  className: 'st cs-geo-map',
  notes: 'Purpose: Show a continuous 2-D quantity as level sets, with the one level that matters for the decision emphasized.\nModify: Replace `field` with your model or an interpolated grid, set `levels` to meaningful thresholds and keep the scale bar true to the domain.\nInvariant: Contours are computed, never traced by hand; the legend states what each level means; a scale bar gives physical size.\nStatic: Already static. For motion, reveal levels from outer to inner.',
  sources: [{ type: 'original-example', file: 'assets/svg/contour-field.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Coverage holds across the site except in the <em>hill shadow</em> between the towers</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative model · two Gaussian sources minus a terrain term</span><span>Contour plot</span></p>`,
};
