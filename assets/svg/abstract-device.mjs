// Diagram study · Abstract device — a neutral product illustration built from a few parameters.
// Body, extrusion, grille and status light come from `device`; the perforation is a hex lattice clipped
// to a circle, and the depth is a stack of offset outlines, so light and thickness stay consistent.
import { svgRoot, el, g, theme as makeTheme, mixHex, roundRectPath, fmt } from '../runtime/figure.mjs';

// The sensor's specification and the school day it measures (illustrative; fictional product).
const spec = { name: 'Kestrel', interval: 30, measures: ['CO₂', 'temperature', 'humidity'], batteryYears: 3, mountHeight: 1.6, sizeMm: 86 };
const schoolDay = { hours: 6.5 };
const readings = Math.round((schoolDay.hours * 3600) / spec.interval);
const list = a => a.slice(0, -1).join(', ') + ' and ' + a.at(-1);
const words = ['zero', 'one', 'two', 'three', 'four', 'five'];

// Geometry: a rounded square body seen almost head-on, extruded down and to the right (light from upper left).
const W = 1280, H = 720;
const device = { x: 772, y: 172, size: 332, radius: 74, depth: [12, 10], grille: { cy: 0.45, rings: 8, pitch: 12.5, hole: 2.9 }, led: { cy: 0.83, r: 5 } };

const tone = (t, a, b, k) => (t.literal ? mixHex(t.hex(a), t.hex(b), k) : `color-mix(in srgb, ${t.c(a)}, ${t.c(b)} ${+(k * 100).toFixed(1)}%)`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), { x, y, size: s, radius: r, depth: [dx, dy], grille, led } = device;
  // Thickness: the outline repeated along the depth vector, back to front, then one crisp outer edge.
  const steps = 10, body = Array.from({ length: steps }, (_, k) => {
    const f = 1 - k / steps;
    return el('path', { d: roundRectPath(x + dx * f, y + dy * f, s, s, r) });
  });
  // Grille: concentric rings of perforations, each ring holding as many holes as its circumference allows.
  const cx = x + s / 2, gy = y + s * grille.cy, holes = [el('circle', { cx, cy: gy, r: grille.hole })];
  for (let k = 1; k <= grille.rings; k++) {
    const rr = k * grille.pitch, count = Math.round((2 * Math.PI * rr) / grille.pitch);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * 2 * Math.PI + (k % 2 ? Math.PI / count : 0);
      holes.push(el('circle', { cx: cx + rr * Math.cos(a), cy: gy + rr * Math.sin(a), r: grille.hole }));
    }
  }
  return svgRoot({ id: 'abstract-device-fig', width: W, height: H, theme: t,
    title: 'A neutral wall-mounted sensor',
    desc: `A rounded square device seen almost head-on, lit from the upper left, with a circular grille of ${holes.length} perforations and one small status light. A generic illustration, not a picture of a real product.` },
  g({ fill: tone(t, 'paper', 'ink', 0.2) }, body),
  el('path', { d: roundRectPath(x + dx, y + dy, s, s, r), fill: 'none', stroke: tone(t, 'paper', 'ink', 0.36), 'stroke-width': 1.2 }),
  el('path', { d: roundRectPath(x, y, s, s, r), fill: t.c('surface'), stroke: tone(t, 'paper', 'ink', 0.36), 'stroke-width': 1.2 }),
  // A fine highlight just inside the upper-left edge reads as a softened bevel catching the light.
  el('path', { d: `M${x + 6} ${y + s * 0.62}V${y + r}A${r - 6} ${r - 6} 0 0 1 ${x + r} ${y + 6}H${x + s * 0.62}`, fill: 'none', stroke: t.c('paper'), 'stroke-width': 2.2, 'stroke-linecap': 'round' }),
  g({ fill: tone(t, 'paper', 'ink', 0.58) }, holes),
  el('circle', { cx, cy: y + s * led.cy, r: led.r + 3.5, fill: 'none', stroke: tone(t, 'paper', 'ink', 0.3), 'stroke-width': 1 }),
  el('circle', { cx, cy: y + s * led.cy, r: led.r, fill: t.cat(1) }));
}

export default {
  study: true,
  id: 'abstract-device',
  title: 'Abstract device: a neutral product illustration',
  className: 'st st--full cs-launch-violet',
  notes: 'Purpose: Show a product as a calm, generic object — enough to anchor a launch page — without impersonating a real device or faking a photograph.\nModify: Edit `spec` and `schoolDay`; the readings per day, the measured quantities and the battery line recompute. Resize or move the object with `device` (size, corner radius, depth vector, grille rings and pitch, status-light position).\nInvariant: Generic illustration: no brand marks, no screen content, no shadow or gloss. One light direction for face, bevel and thickness. One coral element, the status light. Replace with verified product imagery before making product claims.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/abstract-device.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="top:132px;max-width:560px;font-size:50px;line-height:1.1">${spec.name} takes ${fmt(readings)} air readings in every school day</h1>
<p class="st-dek" style="top:322px;max-width:520px">One reading every ${spec.interval} seconds through a ${fmt(schoolDay.hours, { digits: 1 })}-hour day, from a unit ${spec.sizeMm} mm square.</p>
<dl data-region="support" style="position:absolute;left:64px;top:452px;width:520px;margin:0;display:grid;grid-template-columns:120px 1fr;row-gap:10px;font:400 18px/1.4 var(--ss-font-sans);color:var(--ss-ink)">
  <dt style="color:var(--ss-muted)">Measures</dt><dd style="margin:0">${list(spec.measures)}</dd>
  <dt style="color:var(--ss-muted)">Battery</dt><dd style="margin:0">${words[spec.batteryYears]} school years</dd>
  <dt style="color:var(--ss-muted)">Mounting</dt><dd style="margin:0">wall, ${fmt(spec.mountHeight, { digits: 1 })} m above the floor</dd>
</dl>
<p class="st-source" data-region="source"><span>Illustrative data · fictional product; a generic illustration, not a product photograph</span><span>Abstract device</span></p>`,
};
