// Diagram study · Quarter-arc rhythm — nested quarter circles on a tile grid that join into waves.
// Every tile carries the same two corners of arcs, so the arcs link across tiles into
// continuous diagonal waves that run toward the calm corner where the chapter title sits.
import { svgRoot, el, g, theme as makeTheme, mixHex, n } from '../runtime/figure.mjs';

// The network change this chapter is about (illustrative): weekday headway in minutes, 06:00–21:00.
const routesBefore = 11;
const routesAfter = [
  { name: 'Red', headway: 10 }, { name: 'Harbour', headway: 8 }, { name: 'Crosstown', headway: 10 },
  { name: 'Hill', headway: 10 }, { name: 'University', headway: 7 }, { name: 'Airport', headway: 10 },
];
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const cap = s => s[0].toUpperCase() + s.slice(1);
const worst = Math.max(...routesAfter.map(r => r.headway)), best = Math.min(...routesAfter.map(r => r.headway));
// The deck's chapters; this chapter's title is computed from the routes.
const chapters = ['Where people travel today', `${cap(words[routesAfter.length])} routes, every ${words[worst]} minutes`, 'A stop within 400 m of every home', 'Cost and timetable'];
const current = 1;                                    // zero-based index of this chapter

// Tile grid. Radii are symmetric about s/2, so an arc of radius r meets one of s − r in the next tile.
const W = 1280, H = 720;
const motif = { s: 80, rows: 8, edge: 1090, gap: 12, fade: 3.5, accentLine: 9 };   // field: x + y ≥ edge; arcs fade over 3.5 tiles from it

const tone = (t, a, b, k) => (t.literal ? mixHex(t.hex(a), t.hex(b), k) : `color-mix(in srgb, ${t.c(a)}, ${t.c(b)} ${+(k * 100).toFixed(1)}%)`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), { s, rows, gap } = motif, cols = Math.ceil(W / s);
  const radii = [s / 2 - gap, s / 2, s / 2 + gap];
  const inField = (i, j) => i >= 0 && i < cols && j >= 0 && j < rows && (i + j + 2) * s >= motif.edge;
  const field = `M${motif.edge} 0H${W}V${rows * s}H${motif.edge - rows * s}Z`;   // diagonal edge, across the waves
  // One continuous wave = TR(r) in tile (i, j) → BL(s − r) in (i + 1, j) → TR(r) in (i + 1, j + 1) → …
  // Arcs are kept per tile so each can fade with its distance from the field's diagonal edge.
  const arcs = [];
  for (let c = -rows; c <= cols; c++) for (const r of radii) {
    for (let i = Math.max(0, c); i <= cols; i++) {
      const j = i - c, x = i * s, y = j * s, q = s - r;
      const depth = (px, py) => (px + py - motif.edge) / s;                    // tiles from the diagonal edge
      if (inField(i, j)) arcs.push({ c, r, depth: depth(x + s - r * 0.71, y + r * 0.71),     // TR corner: top edge → right edge
        d: `M${n(x + s - r)} ${n(y)}A${n(r)} ${n(r)} 0 0 0 ${n(x + s)} ${n(y + r)}` });
      if (inField(i + 1, j)) arcs.push({ c, r, depth: depth(x + s + q * 0.71, y + s - q * 0.71), // BL corner of the next tile
        d: `M${n(x + s)} ${n(y + s - q)}A${n(q)} ${n(q)} 0 0 1 ${n(x + s + q)} ${n(y + s)}` });
    }
  }
  const isAccent = l => l.c === motif.accentLine && l.r === s / 2;
  const fade = l => Math.max(0, Math.min(1, l.depth / motif.fade));      // 0 → faint at the edge, 1 → full tone
  return svgRoot({ id: 'quarter-arcs-fig', width: W, height: H, theme: t,
    title: 'Nested quarter arcs forming diagonal waves',
    desc: 'Tiles of nested quarter circles join into continuous waves that rise from the lower right toward the upper left; one wave is drawn in the accent colour. The pattern is decorative and encodes no data.' },
  el('defs', {}, el('clipPath', { id: 'quarter-arcs-clip' }, el('path', { d: field }))),
  g({ 'clip-path': 'url(#quarter-arcs-clip)', fill: 'none', 'stroke-linecap': 'round' },
    arcs.filter(l => !isAccent(l)).map(l => el('path', { d: l.d, stroke: tone(t, 'paper', 'muted', (l.r === s / 2 ? 0.52 : 0.32) * (0.12 + 0.88 * fade(l))), 'stroke-width': l.r === s / 2 ? 2.4 : 1.6 })),
    arcs.filter(isAccent).map(l => el('path', { d: l.d, stroke: t.c('accent'), 'stroke-width': 4.5 }))));
}

export default {
  study: true,
  id: 'quarter-arcs',
  title: 'Quarter-arc rhythm: a chapter divider with direction',
  className: 'st st--full cs-civic-calm',
  notes: 'Purpose: Give a chapter divider a sense of direction with a rhythm of repeated quarter arcs that runs toward the title.\nModify: Edit `chapters`, `current` and `routesAfter`; the chapter number, the title and the dek recompute. Change `motif.edge` to move the diagonal edge of the field (x + y = edge), `gap` for the spacing of the nested arcs, `accentLine` to choose which wave is highlighted.\nInvariant: Decoration only — the waves do not plot routes, times or frequencies. Arc radii stay symmetric about half a tile so every wave is continuous. Text stays in the empty corner.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/quarter-arcs.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<p class="st-num" style="position:absolute;left:58px;top:58px;font-size:168px">${current + 1}</p>
<h1 class="st-head" style="top:252px;max-width:560px;font-size:52px">${chapters[current]}</h1>
<p class="st-dek" style="top:392px;max-width:520px">${cap(words[routesBefore])} overlapping routes become ${words[routesAfter.length]} straight ones; the busiest runs every ${words[best]} minutes.</p>
<p class="st-text st-muted" data-region="support" style="position:absolute;left:64px;top:566px;font-size:17px">Part ${current + 1} of ${chapters.length}. Next: ${chapters[current + 1].charAt(0).toLowerCase() + chapters[current + 1].slice(1)}</p>
<p class="st-source" data-region="source"><span>Illustrative data · Northbay bus network review; the arcs are decorative</span><span>Quarter-arc rhythm</span></p>`,
};
