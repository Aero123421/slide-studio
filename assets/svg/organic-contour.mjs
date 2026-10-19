// Diagram study · Organic contour — one authored silhouette, a banded stone, against a strict text grid.
// The outline is a closed curve built from a few chosen harmonics; the bands inside are level lines
// of a tilted, gently warped plane (marching squares), clipped to the stone.
import { svgRoot, el, g, theme as makeTheme, mixHex, pathFromPoints, contourLines, noise2D } from '../runtime/figure.mjs';

// Colleagues returning from long leave, and how many were still employed six months later (illustrative).
const cohorts = [
  { year: 2024, returned: 58, stayed: 44 }, { year: 2025, returned: 61, stayed: 51 }, { year: 2026, returned: 64, stayed: 57 },
];
const latest = cohorts.at(-1), earliest = cohorts[0];
const rate = c => c.stayed / c.returned;
const inTen = ['None', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'][Math.round(rate(latest) * 10)];
const chapter = { number: 4, of: 5, title: 'Coming back well' };

// Stone: a closed Catmull–Rom curve through authored control points (unit coordinates, scaled by R and turned);
// bands: level lines of a tilted plane plus low-frequency noise, so they wander gently like agate strata.
const W = 1280, H = 720;
const motif = {
  cx: 1006, cy: 372, R: 316, turn: -0.2,
  outline: [[-1, 0.06], [-0.84, -0.4], [-0.4, -0.64], [0.2, -0.66], [0.74, -0.46], [1.02, -0.04], [0.86, 0.38], [0.34, 0.58], [-0.3, 0.6], [-0.78, 0.42]],
  bands: 24, tilt: 0.42, warp: 0.6, scale: 0.95, seed: 8, beat: [0.8, 0.8, 1.7, 0.8],   // beat: stroke widths cycling across the bands
};

const tone = (t, a, b, k) => (t.literal ? mixHex(t.hex(a), t.hex(b), k) : `color-mix(in srgb, ${t.c(a)}, ${t.c(b)} ${+(k * 100).toFixed(1)}%)`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), { cx, cy, R, turn } = motif, noise = noise2D(motif.seed);
  const pts = motif.outline.map(([u, v]) => [cx + R * (u * Math.cos(turn) - v * Math.sin(turn)), cy + R * (u * Math.sin(turn) + v * Math.cos(turn))]);
  const m = pts.length, at = i => pts[(i + m) % m], f2 = v => +v.toFixed(2);
  let outline = `M${f2(pts[0][0])} ${f2(pts[0][1])}`;
  for (let i = 0; i < m; i++) {                       // Catmull–Rom segment i → i + 1 as a cubic Bézier
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    outline += `C${f2(c1[0])} ${f2(c1[1])} ${f2(c2[0])} ${f2(c2[1])} ${f2(p2[0])} ${f2(p2[1])}`;
  }
  outline += 'Z';
  // Bands: f(x, y) = tilted coordinate + warp · (noise − ½), sampled over the stone's box; evenly spaced levels.
  const f = (x, y) => (y - cy + motif.tilt * (x - cx)) / R + motif.warp * (noise.fbm((x / R) * motif.scale, (y / R) * motif.scale, 2) - 0.5);
  const box = { x0: cx - 1.3 * R, x1: cx + 1.3 * R, y0: cy - 1.1 * R, y1: cy + 1.1 * R };
  const corners = [[box.x0, box.y0], [box.x1, box.y0], [box.x0, box.y1], [box.x1, box.y1]].map(([x, y]) => f(x, y));
  const lo = Math.min(...corners), hi = Math.max(...corners);
  const levels = Array.from({ length: motif.bands }, (_, k) => lo + ((hi - lo) * (k + 0.5)) / motif.bands);
  const bands = contourLines(f, { ...box, nx: 110, ny: 90, levels }).flatMap((r, k) => r.lines.map(line => el('path', { d: pathFromPoints(line), 'stroke-width': motif.beat[k % motif.beat.length] })));
  return svgRoot({ id: 'organic-contour-fig', width: W, height: H, theme: t,
    title: 'A dark, banded stone',
    desc: `One smooth stone-shaped silhouette at the right edge of the page, crossed by fine, gently wandering bands like the strata of an agate. The form is decoration and encodes no data.` },
  el('defs', {}, el('clipPath', { id: 'organic-contour-clip' }, el('path', { d: outline }))),
  el('path', { d: outline, fill: tone(t, 'paper', 'ink', 0.84) }),
  g({ 'clip-path': 'url(#organic-contour-clip)', fill: 'none', stroke: tone(t, 'paper', 'ink', 0.52), 'stroke-linejoin': 'round' }, bands));
}

export default {
  study: true,
  id: 'organic-contour',
  title: 'Organic contour: one authored silhouette against a strict grid',
  className: 'st st--full cs-hr-people',
  notes: 'Purpose: Soften a rectilinear chapter page with one deliberate organic form — a banded stone — while the type keeps a strict grid.\nModify: Replace `cohorts` and `chapter`; the "in ten" phrase and the dek recompute. Shape the stone by moving the points in `motif.outline` (unit coordinates; the curve passes through them), `R` and `turn`; `bands`, `tilt` and `warp` set the strata.\nInvariant: One silhouette per page, cropped or placed with intent and kept clear of the text — never a scatter of blobs, never blurred. The bands are texture inside the form, not a contour map.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/organic-contour.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="top:150px;max-width:540px;font-size:50px;line-height:1.1">${inTen} in ten colleagues back from long leave now stay</h1>
<p class="st-dek" style="top:356px;max-width:500px">${latest.stayed} of the ${latest.returned} who returned in ${latest.year} were still with us six months later, against ${Math.round(rate(earliest) * 100)}% of returners in ${earliest.year}.</p>
<p class="st-text st-muted" data-region="support" style="position:absolute;left:64px;top:566px;font-size:17px">Chapter ${chapter.number} of ${chapter.of}: ${chapter.title}</p>
<p class="st-source" data-region="source"><span>Illustrative data · fictional employer, people survey 2026; the stone is decorative</span><span>Organic contour</span></p>`,
};
