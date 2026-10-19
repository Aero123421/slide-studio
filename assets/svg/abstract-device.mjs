// Diagram study · Abstract device — an orthographic spec drawing: front and side views at one scale.
// Every line comes from `spec` in millimetres through one scale factor, so the views, the measured
// hole pattern and the dimension lines always agree with the numbers written on them.
import { svgRoot, el, g, theme as makeTheme, roundRectPath, textLines, fmt } from '../runtime/figure.mjs';

// The sensor (fictional product), in millimetres unless noted, and the school day it measures.
const spec = {
  name: 'Kestrel', interval: 30, measures: ['CO₂', 'temperature', 'humidity'], batteryYears: 3, screws: 60,
  size: 86, depth: 24, corner: 14, edge: 4, backPlate: 6, mountHeight: 1.6,          // mountHeight: centre above floor, m
  grille: { centre: 40, hole: 2, pitch: 3.5, rings: 7 },                              // centre: mm from the top edge
  light: { fromBottom: 12, diameter: 3 },
};
const schoolDay = { hours: 6.5 };
const readings = Math.round((schoolDay.hours * 3600) / spec.interval);
const ringCounts = Array.from({ length: spec.grille.rings }, (_, k) => Math.round(2 * Math.PI * (k + 1)));   // holes per ring ≈ circumference / pitch
const holes = 1 + ringCounts.reduce((s, c) => s + c, 0);
const list = a => a.slice(0, -1).join(', ') + ' and ' + a.at(-1);
const words = ['zero', 'one', 'two', 'three', 'four', 'five'];

// Sheet layout: millimetres → px, origin of each view, and where the annotations sit.
const W = 1280, H = 720;
const sheet = { scale: 2.8, front: [560, 220], gap: 150 };

export function figure(theme = 'css') {
  const t = makeTheme(theme), s = sheet.scale, [fx, fy] = sheet.front, size = spec.size * s;
  const ink = t.c('ink'), fine = t.mix('ink', 'paper', 0.55), thin = { fill: 'none', stroke: fine, 'stroke-width': 0.9 };
  const sx = fx + size + sheet.gap, sd = spec.depth * s;                     // side view: front face at sx, back (wall) at sx + sd
  const cy = fy + (spec.size / 2) * s;                                       // centre line, the mounting reference
  // Grille: concentric rings of holes, ring k holding round(2πk) holes, so the spacing along each ring ≈ the pitch.
  const gx = fx + size / 2, gy = fy + spec.grille.centre * s, pts = [[gx, gy]];
  ringCounts.forEach((count, k) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * 2 * Math.PI + (k % 2 ? Math.PI / count : 0), r = (k + 1) * spec.grille.pitch * s;
      pts.push([gx + r * Math.cos(a), gy + r * Math.sin(a)]);
    }
  });
  const lx = gx, ly = fy + (spec.size - spec.light.fromBottom) * s;
  // A dimension: extension lines from the part, a line with two arrowheads, the label above it.
  const arrow = (x, y, dir) => el('path', { d: `M${x} ${y}l${-dir * 7} -2.6v5.2z`, fill: fine });
  const dim = (x1, x2, yPart, yDim, label) => g({},
    el('path', { d: `M${x1} ${yPart + 6}V${yDim + 7}M${x2} ${yPart + 6}V${yDim + 7}M${x1} ${yDim}H${x2}`, ...thin }),
    arrow(x1, yDim, -1), arrow(x2, yDim, 1),
    textLines([label], { x: (x1 + x2) / 2, y: yDim - 8, size: 15, anchor: 'middle', fill: ink }));
  const callout = (x0, y0, x1, y1, lines) => g({},
    el('path', { d: `M${x0} ${y0}L${x1} ${y1}H${x1 + 6}`, ...thin }),
    textLines(lines, { x: x1 + 10, y: y1, size: 15, lineHeight: 1.3, valign: 'middle', fill: ink }));
  const yDim = fy + size + 38, rimHole = pts[pts.length - Math.round(ringCounts.at(-1) / 6)];
  const side = `M${sx + sd} ${fy}H${sx + spec.edge * s}Q${sx} ${fy} ${sx} ${fy + spec.edge * s}V${fy + size - spec.edge * s}Q${sx} ${fy + size} ${sx + spec.edge * s} ${fy + size}H${sx + sd}Z`;
  return svgRoot({ id: 'abstract-device-fig', width: W, height: H, theme: t,
    title: 'Front and side views of the sensor, to one scale',
    desc: `Orthographic drawing of a generic ${spec.size} mm square sensor, ${spec.depth} mm deep: ${holes} holes of ${spec.grille.hole} mm on a ${spec.grille.pitch} mm pitch, a ${spec.light.diameter} mm status light, and a centre line ${spec.mountHeight} m above the floor. Thin linework, no shading; not a picture of a real product.` },
  // Centre lines (dash-dot), the horizontal one carried through to the wall as the mounting reference.
  g({ ...thin, 'stroke-dasharray': '14 4 2 4' },
    el('line', { x1: fx - 14, y1: cy, x2: sx + sd + 14, y2: cy }),
    el('line', { x1: gx, y1: fy - 14, x2: gx, y2: fy + size + 14 })),
  // Front view: body, face edge, perforations, status light.
  el('path', { d: roundRectPath(fx, fy, size, size, spec.corner * s), fill: 'none', stroke: ink, 'stroke-width': 1.5 }),
  el('path', { d: roundRectPath(fx + 1.5 * s, fy + 1.5 * s, size - 3 * s, size - 3 * s, (spec.corner - 1.5) * s), ...thin }),
  g({ fill: 'none', stroke: ink, 'stroke-width': 0.9 }, pts.map(([x, y]) => el('circle', { cx: x, cy: y, r: (spec.grille.hole / 2) * s }))),
  el('circle', { cx: lx, cy: ly, r: (spec.light.diameter / 2) * s, fill: t.cat(1), stroke: ink, 'stroke-width': 0.9 }),
  // Side view: rounded front edges, the split between cover and back plate, the wall it sits on.
  el('path', { d: side, fill: 'none', stroke: ink, 'stroke-width': 1.5 }),
  el('line', { x1: sx + sd - spec.backPlate * s, y1: fy, x2: sx + sd - spec.backPlate * s, y2: fy + size, ...thin }),
  el('line', { x1: sx + sd, y1: fy - 52, x2: sx + sd, y2: fy + size + 52, stroke: ink, 'stroke-width': 2 }),
  g({ ...thin }, Array.from({ length: 16 }, (_, i) => el('line', { x1: sx + sd, y1: fy - 40 + i * 24, x2: sx + sd + 10, y2: fy - 50 + i * 24 }))),
  textLines(['wall'], { x: sx + sd, y: fy - 64, size: 15, anchor: 'middle', fill: t.c('muted') }),
  // Dimensions, callouts and the mounting note.
  dim(fx, fx + size, fy + size, yDim, `${spec.size} mm`),
  dim(sx, sx + sd, fy + size, yDim, `${spec.depth} mm`),
  callout(rimHole[0] + 4, rimHole[1] - 3, fx + size + 16, fy + 52, [`${holes} holes, ⌀${spec.grille.hole} mm`, `on a ${fmt(spec.grille.pitch, { digits: 1 })} mm pitch`]),
  callout(lx + (spec.light.diameter / 2) * s + 3, ly, fx + size + 16, ly, ['status light', `⌀${spec.light.diameter} mm`]),
  textLines(['centre line,', `${fmt(spec.mountHeight, { digits: 1 })} m above the floor`], { x: sx + sd + 18, y: cy - 1, size: 15, lineHeight: 1.3, valign: 'middle', fill: ink, halo: t.c('paper') }),
  textLines(['Front'], { x: fx + size / 2, y: yDim + 34, size: 15, anchor: 'middle', fill: t.c('muted') }),
  textLines(['Side'], { x: sx + sd / 2, y: yDim + 34, size: 15, anchor: 'middle', fill: t.c('muted') }));
}

export default {
  study: true,
  id: 'abstract-device',
  title: 'Abstract device: an orthographic spec drawing',
  className: 'st st--full cs-launch-violet',
  notes: 'Purpose: Show a product as a precise, neutral spec drawing — front and side views at one scale with a measured hole pattern and real dimensions — instead of a pseudo-3D render or a fake photograph.\nModify: Edit `spec` (millimetres) and `schoolDay`; the views, the hole count, the dimension labels, the readings per day and the spec list all recompute. Change `sheet.scale` and `sheet.front` to resize or move the drawing.\nInvariant: Both views share one scale; every dimension label is the number the line was drawn from. Thin ink linework only: no shading, no shadow, no logo, no screen content. One coral element, the labelled status light. Replace with verified product drawings before making product claims.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/abstract-device.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="top:132px;max-width:460px;font-size:46px;line-height:1.1">${spec.name} takes ${fmt(readings)} air readings in every school day</h1>
<p class="st-dek" style="top:318px;max-width:440px">One reading every ${spec.interval} seconds through a ${fmt(schoolDay.hours, { digits: 1 })}-hour day.</p>
<dl data-region="support" style="position:absolute;left:64px;top:430px;width:440px;margin:0;display:grid;grid-template-columns:104px 1fr;row-gap:10px;font:400 18px/1.4 var(--ss-font-sans);color:var(--ss-ink)">
  <dt style="color:var(--ss-muted)">Measures</dt><dd style="margin:0">${list(spec.measures)}</dd>
  <dt style="color:var(--ss-muted)">Battery</dt><dd style="margin:0">${words[spec.batteryYears]} school years</dd>
  <dt style="color:var(--ss-muted)">Fixing</dt><dd style="margin:0">back plate, two screws ${spec.screws} mm apart</dd>
</dl>
<p class="st-source" data-region="source"><span>Illustrative data · fictional product; both views drawn to the same scale</span><span>Orthographic spec drawing</span></p>`,
};
