// Diagram study · Faceted field — an angular mass made of a few large facets under one light.
// The stone is generated from a seed: an outline ring and a raised inner ring are joined into
// triangles, and each facet's tone comes from its 3-D normal, so the light can never contradict itself.
import { svgRoot, el, g, theme as makeTheme, mixHex, rng, pathFromPoints, sum } from '../runtime/figure.mjs';

// Shortlist for the prize, by craft (illustrative).
const crafts = [
  { craft: 'Bookbinding', finalists: 3 }, { craft: 'Ceramics', finalists: 4 }, { craft: 'Furniture', finalists: 4 },
  { craft: 'Glass', finalists: 3 }, { craft: 'Jewellery', finalists: 4 }, { craft: 'Metalwork', finalists: 3 },
  { craft: 'Textiles', finalists: 4 },
];
const evening = { prize: 'The Marlowe Craft Prize', when: 'Thursday 11 March 2027', where: 'The Corn Exchange, Hallow' };
const makers = sum(crafts.map(c => c.finalists));
const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const say = v => (v < 20 ? ones[v] : tens[Math.floor(v / 10)] + (v % 10 ? '-' + ones[v % 10] : ''));
const cap = s => s[0].toUpperCase() + s.slice(1);

// The stone: `sides` outline points with seeded jitter, an inner ring pulled toward the light and raised.
const W = 1280, H = 720;
const motif = { seed: 11, cx: 1010, cy: 268, R: 390, squash: 0.86, sides: 7, inner: 0.42, pull: [-70, 30], rise: 0.7, light: [-0.55, -0.6, 0.58] };

const tone = (t, a, b, k) => (t.literal ? mixHex(t.hex(a), t.hex(b), k) : `color-mix(in srgb, ${t.c(a)}, ${t.c(b)} ${+(k * 100).toFixed(1)}%)`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), rand = rng(motif.seed), { cx, cy, R, sides } = motif;
  const L = Math.hypot(...motif.light), light = motif.light.map(v => v / L);
  const outer = Array.from({ length: sides }, (_, k) => {
    const a = (2 * Math.PI * k) / sides + (rand() - 0.5) * 0.42, r = R * (0.84 + rand() * 0.3);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a) * motif.squash, 0];
  });
  const inner = outer.map(([x, y]) => [cx + motif.pull[0] + (x - cx) * motif.inner, cy + motif.pull[1] + (y - cy) * motif.inner, R * motif.rise]);
  // Facets: two triangles per side between the rings, plus the flat table on top.
  const tris = [];
  for (let k = 0; k < sides; k++) {
    const k1 = (k + 1) % sides;
    tris.push([outer[k], outer[k1], inner[k]], [inner[k], outer[k1], inner[k1]]);
  }
  const shade = pts => {                  // Lambert term of the facet normal (pointing at the viewer)
    const [a, b, c] = pts, u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    let nx = u[1] * v[2] - u[2] * v[1], ny = u[2] * v[0] - u[0] * v[2], nz = u[0] * v[1] - u[1] * v[0];
    if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
    const m = Math.hypot(nx, ny, nz) || 1;
    return Math.max(0, (nx * light[0] + ny * light[1] + nz * light[2]) / m);
  };
  const face = (pts, s) => el('path', { d: pathFromPoints(pts.map(p => [p[0], p[1]]), { close: true }),
    fill: tone(t, 'paper', 'ink', 0.03 + 0.4 * s ** 1.7), stroke: tone(t, 'paper', 'ink', 0.08 + 0.4 * s ** 1.7), 'stroke-width': 0.8, 'stroke-linejoin': 'round' });
  // The one champagne line: the rim edge whose outward normal faces the light most (a glint on the edge).
  const rim = outer.map((p, k) => {
    const q = outer[(k + 1) % sides], mx = (p[0] + q[0]) / 2 - cx, my = (p[1] + q[1]) / 2 - cy, m = Math.hypot(mx, my);
    return { p, q, d: (mx * light[0] + my * light[1]) / m };
  }).sort((a, b) => b.d - a.d)[0];
  return svgRoot({ id: 'faceted-field-fig', width: W, height: H, theme: t,
    title: 'A faceted stone lit from the upper left',
    desc: `An angular stone made of ${tris.length + 1} flat facets, each toned by the angle it makes with one light from the upper left; the rim edge facing the light is drawn as a thin champagne line. The stone is decoration and encodes no data.` },
  el('defs', {}, el('clipPath', { id: 'faceted-field-clip' }, el('rect', { x: 0, y: 0, width: W, height: H }))),
  g({ 'clip-path': 'url(#faceted-field-clip)' },
    tris.map(p => face(p, shade(p))),
    face(inner, light[2]),
    el('line', { x1: rim.p[0], y1: rim.p[1], x2: rim.q[0], y2: rim.q[1], stroke: t.c('accent'), 'stroke-width': 1.6, 'stroke-linecap': 'round' })));
}

export default {
  study: true,
  id: 'faceted-field',
  title: 'Faceted field: an angular mass under one light',
  className: 'st st--full cs-luxury-noir',
  notes: 'Purpose: Give a cover a single, heavy angular form — a few large flat facets with consistent light — instead of a busy low-poly texture.\nModify: Replace `crafts` and `evening`; the headline counts and the craft list recompute. Change `motif.seed` for a different stone, `sides` for more or fewer facets, `light` to move the light (all facets re-tone together).\nInvariant: Facet tones come from one light direction, never picked by hand; flat fills only (no gradient, gloss or glow). The facets are decoration and must not resemble a plot. One champagne line.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/faceted-field.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="top:150px;max-width:560px;font-size:58px;line-height:1.08;font-weight:500">${cap(say(makers))} makers shortlisted in ${say(crafts.length)} crafts</h1>
<p class="st-dek" style="top:372px;max-width:560px;color:var(--ss-ink)">${evening.prize}, shortlist evening<br><span style="color:var(--ss-muted)">${evening.when}, ${evening.where}</span></p>
<p class="st-text st-muted" data-region="support" style="position:absolute;left:64px;top:560px;max-width:560px;font-size:18px">The crafts: ${crafts.map(c => c.craft.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' and $1')}.</p>
<p class="st-source" data-region="source"><span>Illustrative data · fictional prize; the stone is decorative</span><span>Faceted field</span></p>`,
};
