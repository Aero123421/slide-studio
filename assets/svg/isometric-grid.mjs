// Diagram study · Isometric lattice — one projection for the scaffold and for everything built on it.
// Grid lines, the slab and the blocks all go through iso(u, v, w), so the projection cannot drift.
import { svgRoot, el, g, theme as makeTheme, mixHex, sum, pathFromPoints } from '../runtime/figure.mjs';

// Services per team and how many already start from the shared platform template (illustrative).
const teams = [
  { team: 'Payments', services: 9, onTemplate: 8 }, { team: 'Search', services: 7, onTemplate: 6 },
  { team: 'Accounts', services: 6, onTemplate: 5 }, { team: 'Logistics', services: 11, onTemplate: 6 },
  { team: 'Messaging', services: 5, onTemplate: 4 }, { team: 'Analytics', services: 6, onTemplate: 2 },
];
const total = sum(teams.map(d => d.services)), onTemplate = sum(teams.map(d => d.onTemplate));
const laggard = [...teams].sort((a, b) => a.onTemplate / a.services - b.onTemplate / b.services)[0];
const chapters = ['Why teams stall', 'Paved roads, not gates', 'The platform layer', 'Measuring adoption'];
const current = 2;

// Scene in lattice units: a slab with a 3 × 3 grid of identical modules; one slot is empty and its
// module (the accent) is being lowered into it. Module count and heights are illustration, not data.
const W = 1280, H = 720;
const motif = {
  a: 70, origin: [910, 334],                       // lattice edge in px; screen position of (0, 0, 0)
  cells: 3, inset: 0.09, slab: { margin: 0.32, h: 0.38 }, ground: [-1.5, 4.5],   // ground: lattice extent in u and v
  slot: [2, 2], lift: 2.7,                         // empty cell [u, v] and how high its module hovers
};

const tone = (t, a, b, k) => (t.literal ? mixHex(t.hex(a), t.hex(b), k) : `color-mix(in srgb, ${t.c(a)}, ${t.c(b)} ${+(k * 100).toFixed(1)}%)`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), { a, origin: [ox, oy], cells, inset, slab, slot: [lu, lv], lift } = motif;
  const C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);
  const iso = (u, v, w = 0) => [ox + (u - v) * a * C, oy + (u + v) * a * S - w * a];
  const poly = pts => pathFromPoints(pts, { close: true });
  // Scaffold: a finite ground plane of lattice lines (constant u, constant v) that the slab is set out on.
  const [g0, g1] = motif.ground, grid = [];
  // Lines sit on whole lattice units and overrun the last cross-line by half a unit, as construction lines do.
  for (let k = Math.ceil(g0); k <= Math.floor(g1); k++) grid.push(el('path', { d: pathFromPoints([iso(k, g0), iso(k, g1)]) }), el('path', { d: pathFromPoints([iso(g0, k), iso(g1, k)]) }));
  // A box from (u, v, w0) with size (du, dv, dh); light from the upper left: top lightest, +v face mid, +u face darkest.
  const box = (u, v, w0, du, dv, dh, accent = false) => {
    const w1 = w0 + dh, face = k => (accent ? tone(t, 'paper', 'accent', 0.08 + k * 1.5) : tone(t, 'paper', 'ink', k));
    return g({ stroke: accent ? t.c('accent') : tone(t, 'paper', 'ink', 0.4), 'stroke-width': accent ? 2.4 : 1.3, 'stroke-linejoin': 'round' },
      el('path', { d: poly([iso(u + du, v, w0), iso(u + du, v + dv, w0), iso(u + du, v + dv, w1), iso(u + du, v, w1)]), fill: face(0.15) }),
      el('path', { d: poly([iso(u, v + dv, w0), iso(u + du, v + dv, w0), iso(u + du, v + dv, w1), iso(u, v + dv, w1)]), fill: face(0.07) }),
      el('path', { d: poly([iso(u, v, w1), iso(u + du, v, w1), iso(u + du, v + dv, w1), iso(u, v + dv, w1)]), fill: face(0) }));
  };
  const top = slab.h, side = 1 - 2 * inset, m = slab.margin;
  const modules = [];
  for (let u = 0; u < cells; u++) for (let v = 0; v < cells; v++) if (u !== lu || v !== lv) modules.push([u, v]);
  modules.sort((p, q) => p[0] + p[1] - (q[0] + q[1]));            // painter's order: far (small u + v) first
  const behind = modules.filter(([u, v]) => u + v <= lu + lv), before = modules.filter(([u, v]) => u + v > lu + lv);
  const [sx, sy] = iso(lu + 0.5, lv + 0.5, top), [hx, hy] = iso(lu + 0.5, lv + 0.5, top + lift);
  return svgRoot({ id: 'isometric-grid-fig', width: W, height: H, theme: t,
    title: 'Isometric scaffold with modules on a slab',
    desc: `A finite isometric ground lattice holds a slab carrying a ${cells} by ${cells} grid of identical modules. One slot is empty; its module, outlined in the accent colour, is being lowered into place. Everything shares one 30-degree projection; the modules carry no values.` },
  g({ stroke: tone(t, 'paper', 'ink', 0.2), 'stroke-width': 1 }, grid),
  box(-m, -m, 0, cells + 2 * m, cells + 2 * m, slab.h),
  // The empty slot, outlined where the hovering module will land.
  el('path', { d: poly([iso(lu + inset, lv + inset, top), iso(lu + 1 - inset, lv + inset, top), iso(lu + 1 - inset, lv + 1 - inset, top), iso(lu + inset, lv + 1 - inset, top)]),
    fill: 'none', stroke: t.c('accent'), 'stroke-width': 2, 'stroke-dasharray': '6 5' }),
  behind.map(([u, v]) => box(u + inset, v + inset, top, side, side, side)),
  el('line', { x1: sx, y1: sy, x2: hx, y2: hy, stroke: t.c('accent'), 'stroke-width': 1.8, 'stroke-dasharray': '1 7', 'stroke-linecap': 'round' }),
  box(lu + inset, lv + inset, top + lift, side, side, side, true),
  before.map(([u, v]) => box(u + inset, v + inset, top, side, side, side)));
}

export default {
  study: true,
  id: 'isometric-grid',
  title: 'Isometric lattice: one projection for scaffold and objects',
  className: 'st st--full cs-tech-conference-light',
  notes: 'Purpose: Give a chapter divider a constructed, oblique illustration whose grid and objects share one projection.\nModify: Edit `teams`, `chapters` and `current`; the headline counts recompute. Change `motif.cells` for a larger grid of modules, `slot` for the empty cell and `ground` for the extent of the construction lines; `a` scales the whole scene and `origin` moves it.\nInvariant: Every point goes through iso(u, v, w), so lines stay at 30° and verticals stay vertical. The modules illustrate building on a shared platform; their number and height carry no values. No gradient fade: the scaffold is a finite ground plane. One accent: the module being placed.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/isometric-grid.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<p class="st-num" style="position:absolute;left:58px;top:66px;font-size:150px">${current + 1}</p>
<h1 class="st-head" style="top:236px;max-width:520px;font-size:46px">${chapters[current]}: ${onTemplate} of ${total} services already build on it</h1>
<p class="st-dek" style="top:420px;max-width:460px">${laggard.team} is furthest behind, with ${laggard.onTemplate} of its ${laggard.services} services on the template. This part is about the ${total - onTemplate} still to move.</p>
<p class="st-source" data-region="source"><span>Illustrative data · from a platform engineering talk; the modules carry no values</span><span>Isometric lattice</span></p>`,
};
