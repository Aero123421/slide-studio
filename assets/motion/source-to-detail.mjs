// Motion study · Move from source to detail — a block of dies is cropped on the wafer map,
// lifted out at 4×, and stays tethered to where it came from; only then do the die values
// appear. The detail is the same drawing (<use>), so nothing is redrawn or swapped.
// Builds: 1 crop + detail grows out of it, 2 the values inside the detail.
import { svgRoot, el, g, textLines, rng, theme as makeTheme, n } from '../runtime/figure.mjs';

// Illustrative wafer probe test: leakage current per die, nA, at 1.2 V. A fail is above `limit`.
// The generator stands in for measured values: replace `dies` with your own [{col, row, value}].
const limit = 12, gridN = 24, radius = 12; // dies across, wafer radius in die pitches
const dies = (() => {
  const r = rng(3), gauss = () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
  const hot = { x: 0.8 * radius * Math.cos(Math.PI / 6), y: 0.8 * radius * Math.sin(Math.PI / 6) }; // edge spot at 2 o'clock
  const out = [];
  for (let col = 0; col < gridN; col++) for (let row = 0; row < gridN; row++) {
    const x0 = col - gridN / 2, y0 = gridN / 2 - row - 1; // wafer coordinates, y up
    if (![[x0, y0], [x0 + 1, y0], [x0, y0 + 1], [x0 + 1, y0 + 1]].every(([a, b]) => a * a + b * b <= radius * radius)) continue;
    const cx = x0 + 0.5, cy = y0 + 0.5, d = Math.hypot(cx - hot.x, cy - hot.y);
    const defect = r() < 0.012 ? 9 : 0; // isolated random defects
    const value = 4.2 + 2.6 * (Math.hypot(cx, cy) / radius) ** 2 + 12 * Math.exp(-(d * d) / (2 * 2.3 * 2.3)) + defect + gauss() * 1.1;
    out.push({ col, row, cx, cy, value: Math.round(value * 10) / 10 });
  }
  return out;
})();
const fails = dies.filter(d => d.value > limit);
const clock = d => ((Math.round(((90 - (Math.atan2(d.cy, d.cx) * 180) / Math.PI) / 30) + 12) % 12) || 12); // clock hour of a die
const edgeHour = 2; // the edge the headline names; fails within an hour either side count
const edgeFails = fails.filter(d => Math.hypot(d.cx, d.cy) > radius * 0.5 && Math.abs(clock(d) - edgeHour) <= 1);
// The block we enlarge: the 6 × 5 window holding the most failing dies.
const inWin = (b, d) => d.col >= b.col && d.col < b.col + b.cols && d.row >= b.row && d.row < b.row + b.rows;
const block = Array.from({ length: (gridN - 5) * (gridN - 4) }, (_, i) => ({ col: i % (gridN - 5), row: Math.floor(i / (gridN - 5)), cols: 6, rows: 5 }))
  .reduce((best, b) => (fails.filter(d => inWin(b, d)).length > fails.filter(d => inWin(best, d)).length ? b : best));
const inBlock = d => inWin(block, d);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, p = 18.4, C = { x: 250, y: 232 }, k = 4.2;
  const dx = col => C.x + (col - gridN / 2) * p, dy = row => C.y + (row - gridN / 2) * p;
  const crop = { x: dx(block.col), y: dy(block.row), w: block.cols * p, h: block.rows * p };
  const det = { x: 650, y: 34, w: crop.w * k, h: crop.h * k }; // detail panel, same aspect as the crop
  const toDet = (px, py) => [det.x + (px - crop.x) * k, det.y + (py - crop.y) * k];
  const R = radius * p;
  return svgRoot({ id: 'motion-source-to-detail-fig', width: W, height: H, theme: t,
    title: 'Wafer map of leakage test results with an enlarged block of dies at the 2 o’clock edge',
    desc: `${fails.length} of ${dies.length} dies fail (leakage above ${limit} nA); ${edgeFails.length} of them sit at the edge between 1 and 3 o’clock. The enlarged 6 × 5 block shows each die’s value.` },
  el('defs', {}, el('clipPath', { id: 'motion-source-to-detail-clip' }, el('rect', { x: det.x, y: det.y, width: det.w, height: det.h }))),
  // The source: wafer outline with its notch at 6 o'clock, and the dies. Referenced by the detail.
  el('circle', { cx: C.x, cy: C.y, r: R + 6, fill: 'none', stroke: t.c('rule'), 'stroke-width': 1.5 }),
  el('path', { d: `M${n(C.x - 9)} ${n(C.y + R + 6)}a9 9 0 0 1 18 0`, fill: t.c('paper'), stroke: t.c('rule'), 'stroke-width': 1.5 }),
  g({ id: 'motion-source-to-detail-dies' },
    dies.map(d => el('rect', { x: dx(d.col), y: dy(d.row), width: p, height: p, fill: d.value > limit ? t.c('accent') : t.c('context'), stroke: t.c('paper'), 'stroke-width': 1.5, 'vector-effect': 'non-scaling-stroke' }))),
  [['12', 0, -1], ['9', -1, 0]].map(([h, ux, uy]) => textLines([h], { x: C.x + ux * (R + 24), y: C.y + uy * (R + 24), size: 16, anchor: 'middle', valign: 'middle', fill: t.c('muted') })),
  // Build 1 — the crop is outlined, the detail lifts out of it (registered at state 0), tethers draw.
  el('rect', { x: crop.x, y: crop.y, width: crop.w, height: crop.h, fill: 'none', stroke: t.c('ink'), 'stroke-width': 2.4, 'data-step': 1, 'data-motion': 'reveal', 'data-duration': 300 }),
  g({ 'data-step': 1, 'data-motion': 'draw', 'data-delay': 850, 'data-duration': 450 },
    el('line', { x1: crop.x + crop.w, y1: crop.y, x2: det.x, y2: det.y, stroke: t.c('ink'), 'stroke-width': 1.2, opacity: 0.55 }),
    el('line', { x1: crop.x + crop.w, y1: crop.y + crop.h, x2: det.x, y2: det.y + det.h, stroke: t.c('ink'), 'stroke-width': 1.2, opacity: 0.55 })),
  g({ 'data-states': { 0: { opacity: 0, transform: `matrix(${n(1 / k)},0,0,${n(1 / k)},${n(crop.x - det.x / k)},${n(crop.y - det.y / k)})` }, 1: { opacity: 1, transform: 'matrix(1,0,0,1,0,0)' } },
    'data-duration': 900, 'data-easing': 'smooth', style: 'transform-box:view-box;transform-origin:0 0' },
    g({ 'clip-path': 'url(#motion-source-to-detail-clip)' },
      el('rect', { x: det.x, y: det.y, width: det.w, height: det.h, fill: t.c('paper') }),
      el('use', { href: '#motion-source-to-detail-dies', transform: `translate(${n(det.x)} ${n(det.y)}) scale(${k}) translate(${n(-crop.x)} ${n(-crop.y)})` })),
    el('rect', { x: det.x, y: det.y, width: det.w, height: det.h, fill: 'none', stroke: t.c('ink'), 'stroke-width': 2.4, 'vector-effect': 'non-scaling-stroke' })),
  // Build 2 — the values, at reading size, on the enlarged dies.
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-duration': 500 },
    dies.filter(inBlock).map(d => {
      const [x0, y0] = toDet(dx(d.col), dy(d.row)), fail = d.value > limit;
      return textLines([d.value.toFixed(1)], { x: x0 + (p * k) / 2, y: y0 + (p * k) / 2, size: 18, anchor: 'middle', valign: 'middle', fill: fail ? t.c('onAccent') : t.c('ink'), weight: fail ? 700 : 400, attrs: { 'font-variant-numeric': 'tabular-nums' } });
    })),
  textLines([`Leakage in nA, enlarged 4.2×; dies above ${limit} nA fail`], { x: det.x, y: det.y + det.h + 26, size: 16, fill: t.c('muted'), attrs: { 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 300 } }),
  g({},
    el('rect', { x: 0, y: H - 18, width: 14, height: 14, fill: t.c('accent') }),
    textLines([`Failing dies (${fails.length})`], { x: 20, y: H - 11, size: 16, valign: 'middle', fill: t.c('ink') }),
    el('rect', { x: 176, y: H - 18, width: 14, height: 14, fill: t.c('context') }),
    textLines([`Passing (${dies.length - fails.length})`], { x: 196, y: H - 11, size: 16, valign: 'middle', fill: t.c('ink') })));
}

export default {
  study: true,
  id: 'motion-source-to-detail',
  title: 'Source to detail: a tethered, enlarged crop',
  className: 'st cs-manufacturing-plant',
  notes: `Purpose: Move from a whole object to a detail without losing where the detail came from: the crop stays outlined on the source, tethers connect it to the enlarged view, and the values appear only once the detail is large enough to hold them.\nModify: Replace \`dies\` with measured values; the enlarged block is the 6 × 5 window holding the most failing dies, and the crop, the 4.2× transform, the tethers and the labels are computed from it. Set \`edgeHour\` to the edge the headline names.\nInvariant: The detail is the same drawing through <use>, scaled from the crop (registered at state 0); the crop outline and the tethers stay in every later build.\nStatic: The final build shows the wafer, the outlined crop, the tethered detail and the die values.`,
  sources: [{ type: 'original-example', file: 'assets/motion/source-to-detail.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${edgeFails.length} of the wafer’s ${fails.length} <em>failing dies</em> sit at the ${edgeHour} o’clock edge</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · probe test of one 300 mm wafer, ${dies.length} dies</span><span>Motion · tethered crop grows into a detail (2 builds)</span></p>`,
};
