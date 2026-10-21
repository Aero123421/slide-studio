// Diagram study · Triangular rhythm — an equilateral lattice whose filled modules thin out toward the text.
// Which triangles are filled is decided by a density ramp plus seeded chance, so the texture
// stays secondary near the words and gathers weight at the far edge.
import { svgRoot, el, g, theme as makeTheme, rng, sum, pathFromPoints } from '../runtime/figure.mjs';

// Acts booked per stage for the festival (illustrative).
const stages = [{ stage: 'River stage', acts: 21 }, { stage: 'Youth club', acts: 14 }, { stage: 'Library lawn', acts: 11 }];
const acts = sum(stages.map(s => s.acts));
const biggest = [...stages].sort((a, b) => b.acts - a.acts)[0];
const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const say = v => (v < 20 ? ones[v] : tens[Math.floor(v / 10)] + (v % 10 ? '-' + ones[v % 10] : ''));
const cap = s => s[0].toUpperCase() + s.slice(1);
const part = { number: 2, of: 4 };

// Lattice of side `s`; density rises from `from` to `to` (x, px) and falls away above the source line.
const W = 1280, H = 720;
const motif = { s: 92, gap: 5, from: 740, to: 1180, floor: 610, seed: 21, grey: 0.62, cut: 0.14, accent: [1046, 268] };   // grey: share of filled modules in grey; cut: no module below this density

export function figure(theme = 'css') {
  const t = makeTheme(theme), rand = rng(motif.seed), { s, gap } = motif, h = (s * Math.sqrt(3)) / 2;
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const density = (x, y) => clamp01((x - motif.from) / (motif.to - motif.from)) ** 1.5 * clamp01((motif.floor - y) / 120);
  const shrink = pts => {                                // pull each corner toward the centroid → even gutters
    const cx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3, cy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
    return pts.map(([x, y]) => { const d = Math.hypot(x - cx, y - cy); return [x + ((cx - x) * gap * 2) / d, y + ((cy - y) * gap * 2) / d]; });
  };
  const tris = [];
  for (let j = 0; j * h < H; j++) {
    const y0 = j * h, y1 = y0 + h, off = j % 2 ? -s / 2 : 0;
    for (let k = -1; k * s + off < W + s; k++) {
      const x = k * s + off;
      tris.push([[x, y1], [x + s / 2, y0], [x + s, y1]], [[x + s / 2, y0], [x + s * 1.5, y0], [x + s, y1]]);
    }
  }
  const centroid = p => [(p[0][0] + p[1][0] + p[2][0]) / 3, (p[0][1] + p[1][1] + p[2][1]) / 3];
  const [ax, ay] = motif.accent;
  const accent = tris.map((p, i) => ({ i, d: Math.hypot(centroid(p)[0] - ax, centroid(p)[1] - ay) })).sort((p, q) => p.d - q.d)[0].i;
  const marks = tris.map((p, i) => {
    const [cx, cy] = centroid(p), roll = rand(), dens = density(cx, cy);
    if (i === accent) return el('path', { d: pathFromPoints(shrink(p), { close: true }), fill: t.c('accent') });
    if (dens < motif.cut || roll > dens) return null;
    return el('path', { d: pathFromPoints(shrink(p), { close: true }), fill: rand() < motif.grey ? t.c('context') : t.c('ink') });
  });
  return svgRoot({ id: 'triangle-tiling-fig', width: W, height: H, theme: t,
    title: 'Triangular lattice thinning toward the left',
    desc: 'Equilateral triangles with even gutters fill the right edge of the page in black and grey, thinning out toward the text; one triangle is cobalt. Which triangles are filled is seeded chance, not data.' },
  g({}, marks));
}

export default {
  study: true,
  id: 'triangle-tiling',
  title: 'Triangular rhythm: a modular texture kept behind the subject',
  className: 'st st--full cs-youth-pop',
  notes: 'Purpose: Give a chapter divider an energetic, modular edge that stays secondary: the triangles thin out before they reach the words.\nModify: Edit `stages` and `part`; the act count in words and the dek recompute. Change `motif.s` for larger modules, `from`/`to` for where the texture starts and peaks, `seed` for another arrangement, `accent` to move the cobalt triangle.\nInvariant: The lattice is equilateral with even gutters; filling is chance shaped by a density ramp, never data. No triangle behind text. One cobalt triangle and no yellow: hierarchy comes from type size, not panels.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/triangle-tiling.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="top:168px;max-width:600px;font-size:64px;line-height:1.04">${cap(say(stages.length))} stages, ${say(acts)} acts</h1>
<p class="st-dek" style="top:330px;max-width:560px">The ${biggest.stage.toLowerCase()} takes ${biggest.acts} of them; the ${stages.filter(s => s !== biggest).map(s => s.stage.toLowerCase()).join(' and the ')} share the other ${acts - biggest.acts}.</p>
<p class="st-text st-muted" data-region="support" style="position:absolute;left:64px;top:560px;font-size:17px">Part ${part.number} of ${part.of} in the Riverside Youth Festival 2027 plan</p>
<p class="st-source" data-region="source"><span>Illustrative data · fictional festival; the triangles are decorative</span><span>Triangular rhythm</span></p>`,
};
