// Motion study · Peel one layer — the plasterboard is peeled back across the bays that matter
// (build 1) while its remaining part, and every layer behind it, stay drawn and labelled;
// build 2 ties the exposed void to the temperature dip measured on the board's surface.
import { svgRoot, el, g, textLines, linear, pathFromPoints, theme as makeTheme, fmt } from '../runtime/figure.mjs';

// Interior elevation of a north wall, metres (illustrative retrofit survey, −3 °C outside).
const wall = { w: 4.8, h: 2.4 };
const studEvery = 0.6, stud = 0.045;
const voids = [{ bay: 4, from: 0.25, to: 1.25 }];        // missing mineral wool, height range in m
const lineAt = 1.0;                                     // thermal readings taken along this height
const studs = Array.from({ length: Math.round(wall.w / studEvery) + 1 }, (_, i) => i * studEvery);
const inVoid = x => voids.some(v => x > v.bay * studEvery + stud / 2 && x < (v.bay + 1) * studEvery - stud / 2 && lineAt > v.from && lineAt < v.to);
// Surface temperature: warm board, slight bridging at studs, a deep dip over the void (smoothed by the board).
const smooth = (f, x, s) => { let a = 0, n = 0; for (let d = -3 * s; d <= 3 * s; d += s / 6) { const w = Math.exp(-(d * d) / (2 * s * s)); a += w * f(x + d); n += w; } return a / n; };
const temp = x => 18.6 - 0.5 * smooth(u => (studs.some(sx => Math.abs(u - sx) < stud) ? 1 : 0), x, 0.06) - 7.2 * smooth(u => (inVoid(u) ? 1 : 0), x, 0.12);
const readings = Array.from({ length: 97 }, (_, i) => ({ x: i * 0.05, c: temp(i * 0.05) }));
const coldest = [...readings].sort((a, b) => a.c - b.c)[0];
const voidArea = voids.reduce((s, v) => s + (studEvery - stud) * (v.to - v.from), 0);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'motion-layer-peel-fig';
  const x = linear([0, wall.w], [0, 672]), top = 128, y = linear([0, wall.h], [top + 336, top]);
  const peelTo = (voids[0].bay + 1) * studEvery + 0.15;                   // peel back just past the void's bay
  const peelPct = (peelTo / wall.w) * 100;
  const bayX = b => x(b * studEvery + stud / 2), bayW = x(studEvery - stud) - x(0);

  // Back to front: sheathing, studs, mineral wool (with its void), then the plasterboard.
  const sheathing = el('rect', { x: x(0), y: y(wall.h), width: x(wall.w) - x(0), height: y(0) - y(wall.h), fill: t.c('surface'), stroke: t.c('muted'), 'stroke-width': 1.2 });
  const wool = studs.slice(0, -1).map((_, b) => {
    const v = voids.find(q => q.bay === b), parts = v ? [[0, v.from], [v.to, wall.h]] : [[0, wall.h]];
    return parts.map(([a, z]) => el('rect', { x: bayX(b), y: y(z), width: bayW, height: y(a) - y(z), fill: t.cat(1), 'fill-opacity': 0.32 }));
  });
  const studEls = studs.map(sx => el('rect', { x: x(Math.max(0, Math.min(wall.w - stud, sx - stud / 2))), y: y(wall.h), width: x(stud) - x(0), height: y(0) - y(wall.h), fill: t.c('muted') }));
  const board = g({ 'data-states': { 0: { clipPath: 'inset(0% 0% 0% 0%)' }, 1: { clipPath: `inset(0% 0% 0% ${peelPct.toFixed(2)}%)` } }, 'data-duration': 1000, 'data-easing': 'smooth' },
    el('rect', { x: x(0), y: y(wall.h), width: x(wall.w) - x(0), height: y(0) - y(wall.h), fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 1.4 }),
    [1.2, 2.4, 3.6].map(j => el('line', { x1: x(j), x2: x(j), y1: y(wall.h), y2: y(0), stroke: t.c('rule'), 'stroke-width': 1.2 })));
  const edge = g({ 'data-states': { 0: { translate: '0px 0px' }, 1: { translate: `${x(peelTo) - x(0)}px 0px` } }, 'data-duration': 1000, 'data-easing': 'smooth' },
    el('line', { x1: x(0), x2: x(0), y1: y(wall.h) - 8, y2: y(0) + 8, stroke: t.c('ink'), 'stroke-width': 3 }));
  const measureLine = el('line', { x1: x(0), x2: x(wall.w), y1: y(lineAt), y2: y(lineAt), stroke: t.c('accent'), 'stroke-width': 1.4, 'stroke-dasharray': '2 5' });

  // Surface temperature along the measured line, on the wall's own horizontal scale.
  const ty = linear([10, 20], [106, 30]);
  const chart = g({},
    [12, 16, 20].map(c => g({}, el('line', { x1: x(0), x2: x(wall.w), y1: ty(c), y2: ty(c), stroke: t.c('grid') }),
      textLines([`${c} °C`], { x: x(wall.w) + 10, y: ty(c), size: 15, valign: 'middle', fill: t.c('muted') }))),
    el('path', { d: pathFromPoints(readings.map(r => [x(r.x), ty(r.c)]), { curve: 'monotone' }), fill: 'none', stroke: t.c('ink'), 'stroke-width': 2.4 }),
    textLines([`${fmt(coldest.c, { digits: 1 })} °C`], { x: x(coldest.x) + 12, y: ty(coldest.c) + 2, size: 17, weight: 700, valign: 'middle', fill: t.c('ink') }));

  // Direct labels on the right, pointing into the drawing; the inner layers' labels arrive when exposed.
  const lx = 742, label = (text, sub, ty0, tx, tyy, step) => g(step ? { 'data-step': step, 'data-motion': 'reveal', 'data-delay': 700 } : {},
    el('path', { d: `M${lx - 10} ${ty0}H${lx - 26}L${tx} ${tyy}`, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.2 }),
    el('circle', { cx: tx, cy: tyy, r: 3.5, fill: t.c('ink') }),
    textLines([text], { x: lx, y: ty0 - 8, size: 18, weight: 700, fill: t.c('ink') }),
    textLines([sub], { x: lx, y: ty0 + 14, size: 16, fill: t.c('muted') }));
  const v = voids[0];
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Interior wall with the plasterboard peeled back to show the insulation behind it',
    desc: `Surface temperature along a line 1 m above the floor dips to ${fmt(coldest.c, { digits: 1 })} °C. Peeling back the plasterboard shows a void in the mineral wool of bay ${v.bay + 1}, about ${fmt(voidArea, { digits: 2 })} m², directly behind the dip; the other bays are filled.` },
  textLines(['Surface temperature at 1 m height'], { x: x(0), y: 0, size: 16, weight: 700, valign: 'top', fill: t.c('muted') }),
  chart, sheathing, wool, studEls, board, edge, measureLine,
  label('Plasterboard', '12.5 mm, peeled back', top + 22, x(wall.w) - 30, y(2.1)),
  label('Mineral wool', '140 mm between studs', top + 112, bayX(3) + bayW / 2, y(1.95), 1),
  label('Timber studs', '45 × 140 mm at 600 mm', top + 200, x(studs[4]), y(1.55), 1),
  label('Sheathing board', 'visible only through the void', top + 288, bayX(v.bay) + bayW / 2, y(0.45), 1),
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 200 },
    el('rect', { x: bayX(v.bay), y: y(v.to), width: bayW, height: y(v.from) - y(v.to), fill: 'none', stroke: t.c('accent'), 'stroke-width': 3 }),
    el('line', { x1: x(coldest.x), x2: x(coldest.x), y1: ty(coldest.c) + 14, y2: y(v.to) - 4, stroke: t.c('accent'), 'stroke-width': 1.6, 'stroke-dasharray': '4 4' }),
    el('line', { x1: bayX(v.bay) + bayW + 2, x2: x(peelTo) + 10, y1: y((v.from + v.to) / 2 - 0.2), y2: y((v.from + v.to) / 2 - 0.2), stroke: t.c('accent'), 'stroke-width': 1.6 }),
    textLines(['Missing batt'], { x: x(peelTo) + 16, y: y((v.from + v.to) / 2 - 0.2) - 4, size: 18, weight: 700, fill: t.c('accent') }),
    textLines([`${fmt(voidArea, { digits: 2 })} m², bay ${v.bay + 1}`], { x: x(peelTo) + 16, y: y((v.from + v.to) / 2 - 0.2) + 20, size: 16, fill: t.c('ink') })));
}

export default {
  study: true,
  id: 'motion-layer-peel',
  title: 'Peel one layer',
  className: 'st cs-blueprint',
  notes: 'Purpose: Reveal one layer while keeping the remaining assembly legible: peel back only as much of the outer layer as the evidence needs.\nModify: Edit `wall`, `voids` and the stud spacing; the bays, the wool, the temperature profile, the peel extent, the labels and the headline recompute.\nInvariant: The peeled layer keeps its unpeeled part in place; layers behind it are drawn in their true order and labelled; the measured profile shares the wall\'s horizontal scale.\nStatic: The final build shows the board peeled back, all four layers labelled and the void tied to the temperature dip.',
  sources: [{ type: 'original-example', file: 'assets/motion/layer-peel.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Behind the plasterboard, a <em>missing batt</em> sits exactly under the ${fmt(coldest.c, { digits: 1 })} °C cold spot</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative survey · thermal readings every 5 cm along one line</span><span>Motion · outer layer peeled back, then linked to the evidence (2 builds)</span></p>`,
};
