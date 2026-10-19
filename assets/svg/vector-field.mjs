// Diagram study · Vector field — wind arrows on a 2 km grid, the convergence line computed as the u = 0
// contour, and a transect that checks the headline numbers. Everything comes from `coast` and `wind`.
import { svgRoot, el, g, textLines, linear, pathFromPoints, vectorField, contourLines, theme as makeTheme, fmt, arrowMarker } from '../runtime/figure.mjs';

// Domain: 40 km east × 20 km north (x east, y north, km from the south-west corner). Sea lies west of the coast.
const domain = { x0: 0, x1: 40, y0: 0, y1: 20 };
const grid = { cols: 20, rows: 10 };                                                  // one arrow every 2 km
const coast = y => 9 + 1.6 * Math.sin(y / 3.2) + 0.7 * Math.cos(y / 1.7);           // coastline x (km) at latitude y
const synoptic = [-2.3, -0.6];                                                         // background easterly, m/s (u east, v north)
const breeze = { peak: 8.4, inland: 7.5, offshore: 18, shift: 1.5 };                  // m/s and km
// Surface wind (m/s): onshore sea breeze that peaks just inland of the coast and fades inland against the easterly.
const reach = (x, y) => { const d = x - coast(y) - breeze.shift; return Math.exp(-((d / (d < 0 ? breeze.offshore : breeze.inland)) ** 2)); };
const wind = (x, y) => [breeze.peak * reach(x, y) + synoptic[0], synoptic[1] + 0.9 * reach(x, y) * Math.sin((y - 10) / 6)];

// Derived along the transect y = 10 km: strongest onshore wind and where it reaches zero (the front).
const transectY = 10, xs = Array.from({ length: 401 }, (_, i) => (i * domain.x1) / 400);
const profile = xs.map(x => ({ x, u: wind(x, transectY)[0] }));
const peak = profile.reduce((a, b) => (b.u > a.u ? b : a));
const front = profile.find((p, i) => i && profile[i - 1].u > 0 && p.u <= 0);
const inland = front.x - coast(transectY);
// Largest speed at the arrow sample points: vectorField scales arrow length to it, and so must the key.
const samples = [];
for (let j = 0; j < grid.rows; j++) for (let i = 0; i < grid.cols; i++) samples.push(Math.hypot(...wind(domain.x0 + ((i + 0.5) / grid.cols) * (domain.x1 - domain.x0), domain.y1 - ((j + 0.5) / grid.rows) * (domain.y1 - domain.y0))));
const maxSpeed = Math.max(...samples);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'vector-field-fig';
  const k = 20, map = { x: 0, y: 30, w: 40 * k, h: 20 * k };   // 20 px per km, same in both directions
  const sx = v => map.x + (v / 40) * map.w, sy = v => map.y + map.h - (v / 20) * map.h;
  const cell = Math.min(map.w / grid.cols, map.h / grid.rows), keyLen = (5 / maxSpeed) * cell * 0.82;
  const sea = [[0, 0], ...Array.from({ length: 81 }, (_, i) => [coast((i / 80) * 20), (i / 80) * 20]), [0, 20]];
  const frontLines = contourLines((x, y) => wind(x, y)[0], { ...domain, nx: 120, ny: 60, levels: [0] })[0].lines;
  const longest = frontLines.reduce((a, b) => (b.length > a.length ? b : a));
  const fTop = longest.reduce((a, b) => (b[1] > a[1] ? b : a));   // northern end of the front, where its label sits
  // transect profile panel
  const pp = { x: 892, y: 262, w: 252, h: 146 }, px = linear([0, 40], [pp.x, pp.x + pp.w]), py = linear([-4, 8], [pp.y + pp.h, pp.y]);
  const kx = 892, ky = 52;
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Afternoon surface wind over a 40 by 20 km coastal area',
    desc: `Arrows every 2 km show where the air moves; length is proportional to speed (key: 5 m/s). An onshore sea breeze peaks at ${fmt(peak.u, { digits: 1 })} m/s about ${fmt(peak.x - coast(transectY), { digits: 0 })} km inland of the coast and falls to zero ${fmt(inland, { digits: 0 })} km inland, where it meets the easterly; that convergence line is the u = 0 contour.` },
  el('defs', {}, el('clipPath', { id: `${id}-clip` }, el('rect', { x: map.x, y: map.y, width: map.w, height: map.h })), arrowMarker(`${id}-n`, t.c('ink'))),
  // land (surface tone) and sea (paper), the coastline, then the arrows and the convergence line in the accent
  el('rect', { x: map.x, y: map.y, width: map.w, height: map.h, fill: t.c('surface'), stroke: t.c('rule') }),
  el('path', { d: pathFromPoints(sea.map(([x, y]) => [sx(x), sy(y)]), { close: true }), fill: t.c('paper') }),
  el('path', { d: pathFromPoints(sea.slice(1, -1).map(([x, y]) => [sx(x), sy(y)])), fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.5 }),
  vectorField(wind, { x: map.x, y: map.y, width: map.w, height: map.h, domain, cols: grid.cols, rows: grid.rows, theme: t, color: t.c('ink') }),
  g({ 'clip-path': `url(#${id}-clip)` }, frontLines.map(line => el('path', { d: pathFromPoints(line.map(([x, y]) => [sx(x), sy(y)])), fill: 'none', stroke: t.c('accent'), 'stroke-width': 3.5, 'stroke-linecap': 'round' }))),
  // labels live in the strip above the map, never on the arrows
  textLines(['Sea'], { x: sx(0), y: map.y - 7, size: 16, weight: 700, fill: t.c('muted'), valign: 'bottom' }),
  textLines(['Land'], { x: sx(40), y: map.y - 7, size: 16, weight: 700, fill: t.c('muted'), anchor: 'end', valign: 'bottom' }),
  textLines(['Sea-breeze front, u = 0'], { x: sx(fTop[0]), y: map.y - 7, size: 16, anchor: 'middle', valign: 'bottom', weight: 700, fill: t.c('accent') }),
  // transect line on the map
  el('line', { fill: 'none', x1: sx(0), x2: sx(40), y1: sy(transectY), y2: sy(transectY), stroke: t.c('muted'), 'stroke-width': 1.2, 'stroke-dasharray': '2 4' }),
  textLines([`y = ${transectY} km`], { x: map.x + map.w + 6, y: sy(transectY), size: 15, valign: 'middle', fill: t.c('muted') }),
  // scale bar and coordinate convention under the map
  el('path', { d: `M${sx(0)} ${map.y + map.h + 14}h${5 * k}`, stroke: t.c('ink'), 'stroke-width': 2.5 }),
  textLines(['5 km'], { x: sx(0) + 5 * k + 8, y: map.y + map.h + 14, size: 15, valign: 'middle', fill: t.c('ink'), weight: 600 }),
  textLines(['x east, y north; arrows point where the air goes'], { x: map.x + map.w, y: map.y + map.h + 14, size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') }),
  // key: north, reference arrow, grid spacing
  el('line', { fill: 'none', x1: kx + 8, x2: kx + 8, y1: ky + 36, y2: ky - 6, stroke: t.c('ink'), 'stroke-width': 2, 'marker-end': `url(#${id}-n)` }),
  textLines(['N'], { x: kx + 8, y: ky + 52, size: 16, anchor: 'middle', valign: 'middle', weight: 700, fill: t.c('ink') }),
  el('path', { d: `M${kx + 52} ${ky + 16}h${keyLen}M${kx + 52 + keyLen - 6} ${ky + 12}l6 4l-6 4`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
  textLines(['5 m/s'], { x: kx + 60 + keyLen, y: ky + 16, size: 16, valign: 'middle', weight: 700, fill: t.c('ink') }),
  textLines(['Length ∝ speed', 'One arrow per 2 km'], { x: kx + 52, y: ky + 50, size: 15, valign: 'top', fill: t.c('muted'), lineHeight: 1.3 }),
  // transect profile: the numbers in the headline
  textLines([`Onshore wind u along y = ${transectY} km`], { x: pp.x, y: pp.y - 34, size: 15, valign: 'bottom', weight: 700, fill: t.c('ink') }),
  textLines(['m/s, east positive'], { x: pp.x, y: pp.y - 14, size: 15, valign: 'bottom', fill: t.c('muted') }),
  [-4, 0, 4, 8].map(v => g({}, el('line', { fill: 'none', x1: pp.x, x2: pp.x + pp.w, y1: py(v), y2: py(v), stroke: v === 0 ? t.c('ink') : t.c('grid'), 'stroke-width': v === 0 ? 1.2 : 1 }),
    textLines([fmt(v, { sign: v > 0 })], { x: pp.x - 6, y: py(v), size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
  el('path', { d: pathFromPoints(profile.map(p => [px(p.x), py(p.u)])), fill: 'none', stroke: t.c('ink'), 'stroke-width': 2 }),
  el('circle', { cx: px(peak.x), cy: py(peak.u), r: 4.5, fill: t.c('ink') }),
  textLines([`${fmt(peak.u, { digits: 1 })} m/s`], { x: px(peak.x) + 8, y: py(peak.u) - 4, size: 15, valign: 'bottom', weight: 700, fill: t.c('ink') }),
  el('circle', { cx: px(front.x), cy: py(0), r: 5, fill: t.c('accent') }),
  textLines([`front ${fmt(inland, { digits: 0 })} km inland`], { x: px(front.x) + 8, y: py(0) - 8, size: 15, valign: 'bottom', weight: 700, fill: t.c('accent') }),
  [0, 20, 40].map(v => textLines([`${v}${v === 40 ? ' km' : ''}`], { x: px(v), y: pp.y + pp.h + 30, size: 15, anchor: v === 0 ? 'start' : v === 40 ? 'end' : 'middle', valign: 'top', fill: t.c('muted') })));
}

export default {
  study: true,
  id: 'vector-field',
  title: 'Vector field: direction and relative speed on a grid',
  className: 'st cs-geo-map',
  notes: 'Purpose: Show local direction and relative magnitude across an area, and where the flow converges.\nModify: Replace `wind` (any function of x, y returning [u, v]) and `coast`; arrows, the u = 0 front, the transect and the headline numbers recompute, and the 5 m/s key is scaled to the same maximum speed as the arrows.\nInvariant: One arrow per grid cell at a stated spacing; arrow length is proportional to speed with a reference arrow; the coordinate convention (x east, y north) and the direction convention (toward, not from) are on the page; the map keeps equal km scale on both axes.\nStatic: Already static. For motion, draw the arrows, then trace the front.',
  sources: [{ type: 'original-example', file: 'assets/svg/vector-field.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">The afternoon sea breeze peaks at ${fmt(peak.u, { digits: 1 })} m/s and stalls at a <em>front&nbsp;${fmt(inland, { digits: 0 })}&nbsp;km&nbsp;inland</em>, where it meets the easterly</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative model · onshore breeze against a 2.4 m/s easterly, 15:00 local time</span><span>Vector field with computed front</span></p>`,
};
