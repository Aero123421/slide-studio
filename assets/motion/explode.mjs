// Motion study · Explode registered layers — the parts of a watch separate along their shared
// axis (build 1), each carrying its label; then their part counts grow (build 2). Assembled
// and exploded positions are both computed from the parts' thicknesses.
import { svgRoot, el, g, textLines, linear, theme as makeTheme } from '../runtime/figure.mjs';

// Top to bottom; thickness in mm, part count, radius relative to the case (illustrative calibre).
const parts = [
  { name: 'Sapphire crystal', mm: 1.6, count: 1, r: 1.0, kind: 'glass' },
  { name: 'Hands', mm: 0.6, count: 3, r: 0.82, kind: 'hands' },
  { name: 'Dial and indices', mm: 0.5, count: 13, r: 0.94, kind: 'dial' },
  { name: 'Movement', mm: 4.6, count: 168, r: 0.88, kind: 'movement' },
  { name: 'Rotor', mm: 1.2, count: 9, r: 0.84, kind: 'rotor' },
  { name: 'Case back', mm: 2.1, count: 6, r: 0.98, kind: 'back' },
];
const core = parts.find(p => p.kind === 'movement');
const totalParts = parts.reduce((s, p) => s + p.count, 0);
const totalMm = parts.reduce((s, p) => s + p.mm, 0);
const coreShare = Math.round((core.count / totalParts) * 100);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'motion-explode-fig';
  const cx = 240, R = 204, tilt = 0.19, pxmm = 10, gap = 57;
  const ci = parts.indexOf(core);
  // Assembled: faces stacked by thickness. Exploded: each part moves gap·(i − core) along the axis.
  let acc = 0;
  const faces = parts.map(p => { const y = acc; acc += p.mm * pxmm; return y; });
  // Centre the exploded extent (top ellipse of the first part to bottom rim of the last).
  const n = parts.length, ext0 = faces[0] - ci * gap - R * parts[0].r * tilt, ext1 = acc + (n - 1 - ci) * gap + R * parts[n - 1].r * tilt;
  const y0 = H / 2 - (ext0 + ext1) / 2;
  const ring = (i, f) => ({ rx: R * parts[i].r * f, ry: R * parts[i].r * tilt * f });

  const drawPart = (p, i) => {
    const y = y0 + faces[i], rx = R * p.r, ry = rx * tilt, h = p.mm * pxmm;
    const hot = p === core, stroke = hot ? t.c('paper') : t.c('muted');
    const side = el('path', { d: `M${cx - rx} ${y}V${y + h}A${rx} ${ry} 0 0 0 ${cx + rx} ${y + h}V${y}`, fill: p.kind === 'glass' ? 'none' : hot ? t.c('accent') : t.c('paper'), stroke: p.kind === 'glass' ? t.c('ink') : stroke, 'stroke-width': 1.3 });
    const face = el('ellipse', { cx, cy: y, rx, ry, fill: p.kind === 'glass' ? 'none' : hot ? t.c('accent') : t.c('surface'), stroke: p.kind === 'glass' ? t.c('ink') : stroke, 'stroke-width': p.kind === 'glass' ? 1.6 : 1.3 });
    const detail = [];
    if (p.kind === 'hands') { // hands have no plate: show only their plane, faintly, and the hands
      const hub = [cx, y];
      detail.push(el('ellipse', { cx, cy: y, rx, ry, fill: 'none', stroke: t.c('context'), 'stroke-width': 1.2, 'stroke-dasharray': '3 5' }));
      detail.push(el('ellipse', { cx, cy: y, rx: 9, ry: 9 * tilt * 2, fill: t.c('ink') }));
      [[-2.2, 0.55, 5], [-0.9, 0.85, 3.5], [1.9, 0.92, 1.6]].forEach(([a, len, w]) => {
        const [ex, ey] = [cx + rx * len * Math.cos(a), y + ry * len * Math.sin(a)];
        detail.push(el('line', { x1: hub[0], y1: hub[1], x2: ex, y2: ey, stroke: t.c('ink'), 'stroke-width': w, 'stroke-linecap': 'round' }));
      });
    }
    if (p.kind === 'dial') for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2, q = ring(i, 0.84), s = ring(i, 0.94);
      detail.push(el('line', { x1: cx + q.rx * Math.cos(a), y1: y + q.ry * Math.sin(a), x2: cx + s.rx * Math.cos(a), y2: y + s.ry * Math.sin(a), stroke: t.c('ink'), 'stroke-width': k % 3 ? 1.6 : 3.2 }));
    }
    if (p.kind === 'movement') [[0, 0, 0.34], [0.42, -0.25, 0.26], [-0.45, 0.2, 0.22], [0.1, 0.55, 0.16]].forEach(([dx, dy, f]) =>
      detail.push(el('ellipse', { cx: cx + rx * dx, cy: y + ry * dy, rx: rx * f, ry: ry * f, fill: 'none', stroke: t.c('paper'), 'stroke-width': 1.4 })));
    if (p.kind === 'rotor') return g({}, // half-moon weight on the back of the movement
      el('path', { d: `M${cx - rx} ${y}V${y + h}A${rx} ${ry} 0 0 0 ${cx + rx} ${y + h}V${y}`, fill: t.c('paper'), stroke, 'stroke-width': 1.3 }),
      el('path', { d: `M${cx - rx} ${y}A${rx} ${ry} 0 0 0 ${cx + rx} ${y}Z`, fill: t.c('surface'), stroke, 'stroke-width': 1.3 }),
      el('ellipse', { cx, cy: y, rx: 10, ry: 10 * tilt * 2, fill: t.c('muted') }));
    if (p.kind === 'back') detail.push(el('ellipse', { cx, cy: y, rx: rx * 0.62, ry: ry * 0.62, fill: t.c('paper'), stroke, 'stroke-width': 1.2 }));
    return p.kind === 'hands' ? g({}, detail) : g({}, side, face, detail);
  };

  // Labels sit at each part's exploded height and travel with it; counts share one scale.
  const lx = 560, x = linear([0, core.count], [lx, lx + 330]);
  const label = (p, i) => {
    const y = y0 + faces[i], hot = p === core;
    return g({ 'data-states': { 0: { opacity: 0 }, 1: { opacity: 1 } }, 'data-duration': 600 },
      el('line', { x1: cx + R * p.r + 8, x2: lx - 14, y1: y, y2: y, stroke: t.c('context'), 'stroke-width': 1.2, 'stroke-dasharray': '2 4' }),
      textLines([p.name], { x: lx, y: y - 6, size: 18, weight: 700, fill: hot ? t.c('accent') : t.c('ink') }),
      textLines([`${p.mm} mm`], { x: lx + 340 + 120, y: y - 6, size: 16, anchor: 'end', fill: t.c('muted') }),
      g({ 'data-step': 2, 'data-motion': 'grow-x', 'data-duration': 700, 'data-delay': i * 70, class: 'st-origin-left' },
        el('rect', { x: lx, y: y + 4, width: Math.max(2, x(p.count) - lx), height: 12, rx: 2, fill: hot ? t.c('accent') : t.c('context') })),
      g({ 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 500 + i * 70 },
        textLines([`${p.count} ${p.count === 1 ? 'part' : 'parts'}`], { x: x(p.count) + 10, y: y + 15, size: 16, weight: hot ? 700 : 500, fill: hot ? t.c('accent') : t.c('muted') })));
  };
  const items = parts.map((p, i) => g({ 'data-states': { 0: { translate: '0px 0px' }, 1: { translate: `0px ${(i - ci) * gap}px` } }, 'data-duration': 950, 'data-easing': 'emphasized' },
    drawPart(p, i), label(p, i)));
  const assembledLabel = g({ 'data-states': { 0: { opacity: 1 }, 1: { opacity: 0 } }, 'data-duration': 400 },
    textLines(['Assembled'], { x: lx, y: y0 + acc / 2 - 12, size: 18, weight: 700, fill: t.c('ink') }),
    textLines([`${totalParts} parts in a case ${totalMm.toFixed(1)} mm thick`], { x: lx, y: y0 + acc / 2 + 16, size: 17, fill: t.c('muted') }));
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Exploded view of a mechanical watch with part counts per layer',
    desc: `Six layers separate along the watch's axis: ${parts.map(p => `${p.name.toLowerCase()} ${p.mm} mm, ${p.count} ${p.count === 1 ? 'part' : 'parts'}`).join('; ')}. The movement holds ${core.count} of ${totalParts} parts (${coreShare}%).` },
  el('line', { x1: cx, x2: cx, y1: 8, y2: H - 8, stroke: t.c('context'), 'stroke-width': 1.2, 'stroke-dasharray': '10 6 2 6' }),
  [...items].reverse(), assembledLabel); // drawn bottom-up so upper parts overlap lower ones
}

export default {
  study: true,
  id: 'motion-explode',
  title: 'Explode registered layers',
  className: 'st cs-luxury-noir',
  notes: 'Purpose: Separate components along a shared axis so each layer can be named and compared, without losing their registration.\nModify: Edit `parts` (top to bottom: thickness, count, relative radius). Assembled positions come from the thicknesses; each part moves a fixed step from the core along the axis; labels and count bars recompute.\nInvariant: Parts move only along the shared axis (no sideways drift) and keep their order; each label moves with its part; the counts use one scale.\nStatic: The final build is the exploded view with counts. The assembled state is described in words on the page and can be exported as an extra page.',
  sources: [{ type: 'original-example', file: 'assets/motion/explode.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">The <em>${core.name.toLowerCase()}</em> holds ${core.count} of the watch’s ${totalParts} parts in just ${core.mm} mm</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative calibre · part counts include screws and jewels</span><span>Motion · exploded along one axis, then counted (2 builds)</span></p>`,
};
