// Diagram study · Exploded assembly — parts drawn to scale on one vertical axis, separated by an explode gap,
// with the key slot that registers them drawn as one line through every keyed part.
// Heights, positions, leaders, balloon numbers and the headline counts all come from `parts`.
import { svgRoot, el, g, textLines, spreadLabels, theme as makeTheme, fmt } from '../runtime/figure.mjs';

// Outdoor air-quality sensor node, bottom to top = assembly order. Diameter and height in mm (illustrative).
const parts = [
  { name: 'Base shell', material: 'PC/ASA', d: 72, h: 16, key: true },
  { name: 'O-ring seal', material: 'EPDM', d: 66, h: 2.5, ring: 4, service: 'replace at every opening' },
  { name: 'Battery tray', material: 'PA66-GF30', d: 62, h: 12, key: true },
  { name: 'Main PCB', material: 'FR-4', d: 60, h: 1.6, key: true, chips: true },
  { name: 'Sensor carrier', material: 'PC', d: 40, h: 8, key: true },
  { name: 'Vent membrane', material: 'ePTFE', d: 18, h: 0.5 },
  { name: 'Top cap', material: 'PC/ASA', d: 72, h: 14, key: true, vent: 6 },
];
const keySlot = { r: 15, angle: 40, w: 4 };   // slot centre 15 mm from the axis at 40° (front-right); width in mm
const explode = 13;                            // illustrative gap between parts, mm (not a fit dimension)

// Derived: assembled heights, keyed parts, total stack.
let z = 0;
const stack = parts.map((p, i) => { const s = { ...p, no: i + 1, z0: z, z1: z + p.h }; z += p.h; return s; });
const stackHeight = z, keyed = stack.filter(p => p.key), smallest = Math.min(...keyed.map(p => p.d / 2));
if (keySlot.r + keySlot.w / 2 > smallest) throw Error('exploded-assembly: key slot must lie inside every keyed part');
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'exploded-assembly-fig';
  const elev = (16 * Math.PI) / 180, ce = Math.cos(elev), se = Math.sin(elev);   // viewer 16° above the horizon
  const s = 3.0, cx = 340, base = 432;                                       // px per mm, axis x, screen y of z = 0
  const Z = (zz, i) => base - (zz + i * explode) * ce * s;                    // screen y of height zz on part i
  const P = (x, y, zz, i) => [cx + x * s, Z(zz, i) + y * se * s];             // (x right, y toward the viewer, z up)
  const ell = (r, zz, i) => { const [ex, ey] = P(0, 0, zz, i); return { cx: ex, cy: ey, rx: r * s, ry: r * se * s }; };
  const draw = stack.map((p, i) => {
    const R = p.d / 2, top = ell(R, p.z1, i), bot = ell(R, p.z0, i);
    // Visible outer wall: the band between the front halves of the top and bottom rims.
    const side = `M${top.cx - top.rx} ${top.cy}A${top.rx} ${top.ry} 0 0 0 ${top.cx + top.rx} ${top.cy}L${bot.cx + bot.rx} ${bot.cy}A${bot.rx} ${bot.ry} 0 0 1 ${bot.cx - bot.rx} ${bot.cy}Z`;
    const out = [el('path', { d: side, fill: t.c('context'), stroke: t.c('ink'), 'stroke-width': 1.5, 'stroke-linejoin': 'round' })];
    if (p.ring) {
      const inner = ell(R - p.ring, p.z1, i);
      out.push(el('path', { d: `M${top.cx - top.rx} ${top.cy}a${top.rx} ${top.ry} 0 1 0 ${2 * top.rx} 0a${top.rx} ${top.ry} 0 1 0 ${-2 * top.rx} 0ZM${inner.cx - inner.rx} ${inner.cy}a${inner.rx} ${inner.ry} 0 1 0 ${2 * inner.rx} 0a${inner.rx} ${inner.ry} 0 1 0 ${-2 * inner.rx} 0Z`, fill: t.c('surface'), 'fill-rule': 'evenodd', stroke: t.c('ink'), 'stroke-width': 1.5 }));
    } else out.push(el('ellipse', { ...top, fill: t.c('surface'), stroke: t.c('ink'), 'stroke-width': 1.5 }));
    if (p.vent) out.push(el('ellipse', { ...ell(p.vent / 2, p.z1, i), fill: t.c('ink') }));
    if (p.chips) for (const [x0, y0, w, d] of [[-21, -12, 14, 10], [0, -19, 10, 9], [-15, 6, 12, 7]]) {   // chips, clear of the key slot
      const c = [[x0, y0], [x0 + w, y0], [x0 + w, y0 + d], [x0, y0 + d]].map(([x, y]) => P(x, y, p.z1, i));
      out.push(el('path', { d: `M${c.map(q => q.join(' ')).join('L')}Z`, fill: t.c('muted') }));
    }
    if (p.key) {   // the slot: same angle and radius on every keyed part, so all slots fall on one vertical line
      const a = (keySlot.angle * Math.PI) / 180, [kx, ky] = P(keySlot.r * Math.cos(a), keySlot.r * Math.sin(a), p.z1, i);
      out.push(el('ellipse', { cx: kx, cy: ky, rx: (keySlot.w / 2) * s, ry: keySlot.w * se * s, fill: t.c('accent') }));
    }
    return g({ 'data-part': p.no }, out);
  });
  // Registration line through every key slot, and the shared axis.
  const a = (keySlot.angle * Math.PI) / 180, kx = P(keySlot.r * Math.cos(a), 0, 0, 0)[0];
  const kTop = P(0, keySlot.r * Math.sin(a), keyed.at(-1).z1, stack.indexOf(keyed.at(-1)))[1], kBot = P(0, keySlot.r * Math.sin(a), keyed[0].z1, 0)[1];
  const axisTop = Z(stackHeight, parts.length - 1) - 30, axisBot = Z(0, 0) + 34;
  // Parts list: one row per part, aligned with the part and spread so rows never overlap.
  const listX = 590, rows = spreadLabels(stack.map((p, i) => ({ id: i, y: Z((p.z0 + p.z1) / 2, i), h: 46 })), { min: 24, max: H - 24, gap: 2 });
  const list = stack.map((p, i) => {
    const y = rows[i].y, y0 = Z((p.z0 + p.z1) / 2, i), x0 = cx + (p.d / 2) * s + 8;
    return g({},
      el('path', { d: `M${x0} ${y0}H${listX - 60}L${listX - 40} ${y}H${listX - 16}`, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1 }),
      el('circle', { cx: listX, cy: y, r: 14, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 1.5 }),
      textLines([String(p.no)], { x: listX, y, size: 16, anchor: 'middle', valign: 'middle', weight: 700, fill: t.c('ink') }),
      textLines([p.name], { x: listX + 26, y: y - 10, size: 17, valign: 'middle', weight: 700, fill: t.c('ink') }),
      textLines([`${p.material}, Ø${fmt(p.d)} × ${fmt(p.h)} mm${p.service ? `; ${p.service}` : ''}`], { x: listX + 26, y: y + 12, size: 15, valign: 'middle', fill: t.c('muted') }));
  });
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Exploded view of a seven-part sensor housing on one axis',
    desc: `Seven parts, numbered in assembly order from the base shell up to the top cap, drawn to scale on one vertical axis and separated by ${explode} mm for clarity. ${words[keyed.length]} parts carry a key slot ${keySlot.r} mm from the axis at the same angle, so the slots line up on one registration line. Assembled stack height ${fmt(stackHeight, { digits: 1 })} mm. The O-ring is replaced at every opening.` },
  el('line', { x1: cx, x2: cx, y1: axisTop, y2: axisBot, stroke: t.c('muted'), 'stroke-width': 1, 'stroke-dasharray': '16 4 3 4' }),
  draw,
  el('line', { x1: kx, x2: kx, y1: kTop - 34, y2: kBot + 4, stroke: t.c('accent'), 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }),
  textLines([`one key slot, ${keySlot.r} mm off axis`], { x: kx + 8, y: kTop - 40, size: 15, valign: 'bottom', weight: 700, fill: t.c('accent') }),
  textLines([`Parts to scale; the ${explode} mm gaps between them are not.`], { x: listX - 14, y: H - 2, size: 15, valign: 'bottom', fill: t.c('muted') }),
  list);
}

export default {
  study: true,
  id: 'exploded-assembly',
  title: 'Exploded assembly: order and registration on one axis',
  className: 'st cs-mono-print',
  notes: 'Purpose: Show what goes together in which order, and how the parts register to each other, before anyone opens a drawing set.\nModify: Edit `parts` (bottom to top; diameter, height, material, key, service note), `keySlot` and `explode`. Heights, positions, the registration line, leaders, balloon numbers and the parts list recompute; the module throws if the key slot falls outside a keyed part.\nInvariant: One shared axis; parts keep mating order from bottom to top; balloon numbers are the assembly order; registration features sit at the same angle and radius so they align; the explode gap is labelled as illustrative.\nStatic: Already static. As motion, collapse the gaps part by part from the bottom.',
  sources: [{ type: 'original-example', file: 'assets/svg/exploded-assembly.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Seven parts stack on one axis, and <em>one key slot</em> lines up ${words[keyed.length]} of them</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative design · outdoor air-quality sensor node, ${fmt(stackHeight, { digits: 1 })} mm assembled height</span><span>Exploded view with parts list</span></p>`,
};
