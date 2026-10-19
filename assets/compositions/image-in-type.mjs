// Composition study · Image inside type — very large letters as a window onto one picture.
// The year is the finding (computed from the timbers); the picture inside it is the evidence:
// the end grain of one beam, drawn ring by ring from its ring-width series. A photograph of the
// sanded end grain is the intended input; the bundled photographs are too small for letters this size.
import { el, g, rng, theme as makeTheme } from '../runtime/figure.mjs';

// Seven roof timbers, cross-dated against the regional oak chronology (illustrative).
const timbers = [
  { id: 'T1', firstRing: 1641, lastRing: 1774, barkEdge: false }, { id: 'T2', firstRing: 1655, lastRing: 1781, barkEdge: true },
  { id: 'T3', firstRing: 1632, lastRing: 1781, barkEdge: true }, { id: 'T4', firstRing: 1660, lastRing: 1769, barkEdge: false },
  { id: 'T5', firstRing: 1638, lastRing: 1781, barkEdge: true }, { id: 'T6', firstRing: 1649, lastRing: 1777, barkEdge: false },
  { id: 'T7', firstRing: 1666, lastRing: 1772, barkEdge: false },
];
const withBark = timbers.filter(t => t.barkEdge);
const felled = Math.max(...withBark.map(t => t.lastRing)); // last complete ring under the bark: felled that winter
const drawn = timbers.find(t => t.id === 'T3');
const sapwood = 23; // rings of pale sapwood under the bark in T3

// Ring widths of T3, mm: fast early growth slowing with age, year-to-year noise, two marker years.
const markers = { 1709: 0.35, 1740: 0.45 }; // the hard winters every chronology shows as narrow rings
const r = rng(1781);
const rings = Array.from({ length: drawn.lastRing - drawn.firstRing + 1 }, (_, i) => {
  const year = drawn.firstRing + i, w = (2.6 * Math.exp(-i / 50) + 1.05) * (0.8 + 0.4 * r());
  return { year, w: w * (markers[year] ?? 1) };
});
const scale = 1.42; // px per mm on the slide

function endGrain(theme = 'css') {
  const t = makeTheme(theme), px = 600, py = 232, drift = [-0.8, -0.35]; // pith and the direction of faster growth
  let rad = 3;
  const circles = rings.map((ring, i) => {
    rad += ring.w * scale;
    const k = 0.06 * rad + 1.5 * Math.sin(i * 0.37); // eccentric growth: centres drift as the tree leans
    return { ...ring, cx: px + drift[0] * k, cy: py + drift[1] * k, r: rad, sap: i >= rings.length - sapwood };
  });
  const outer = circles.at(-1), heart = circles[circles.length - sapwood - 1];
  const rays = Array.from({ length: 64 }, (_, i) => { // oak's broad rays, pith to bark
    const a = (i / 64) * 2 * Math.PI + r() * 0.05, r0 = 30 + r() * 120, r1 = outer.r * (0.9 + r() * 0.1);
    return `M${(px + r0 * Math.cos(a)).toFixed(1)} ${(py + r0 * Math.sin(a)).toFixed(1)}L${(px + r1 * Math.cos(a)).toFixed(1)} ${(py + r1 * Math.sin(a)).toFixed(1)}`;
  }).join('');
  const check = (() => { // a drying crack from the bark towards the pith
    const a = 2.55, w = 0.035, r1 = outer.r + 4, r0 = 120;
    return `M${px + r0 * Math.cos(a)} ${py + r0 * Math.sin(a)}L${px + r1 * Math.cos(a - w)} ${py + r1 * Math.sin(a - w)}L${px + r1 * Math.cos(a + w)} ${py + r1 * Math.sin(a + w)}Z`;
  })();
  return g({},
    el('circle', { cx: outer.cx, cy: outer.cy, r: outer.r, fill: t.seq(1) }),
    el('circle', { cx: heart.cx, cy: heart.cy, r: heart.r, fill: t.seq(2) }),
    el('path', { d: rays, stroke: t.seq(0), 'stroke-width': 1.6, opacity: 0.55, fill: 'none' }),
    circles.slice(0, -1).map(c => el('circle', { cx: c.cx.toFixed(1), cy: c.cy.toFixed(1), r: c.r.toFixed(1), fill: 'none', stroke: t.seq(c.sap ? 3 : 4), 'stroke-width': Math.max(0.7, c.w * scale * 0.38).toFixed(2), opacity: 0.9 })),
    el('circle', { cx: outer.cx, cy: outer.cy, r: outer.r, fill: 'none', stroke: t.c('accent'), 'stroke-width': 4 }),
    el('path', { d: check, fill: t.seq(4) }),
    el('circle', { cx: px, cy: py, r: 4, fill: t.seq(4) }));
}

const year = String(felled), size = 440, baseline = 380, left = 57; // left: the "1" stem sits on the 64 px margin
const figure = `<svg class="it-art" width="1280" height="460" viewBox="0 0 1280 460" role="img" aria-label="${year}, set in very large type and filled with a drawing of oak end grain: ${rings.length} growth rings from the pith to the bark edge.">
<defs><clipPath id="composition-image-in-type-clip"><text x="${left}" y="${baseline}" font-size="${size}" font-weight="900" letter-spacing="${(-0.02 * size).toFixed(1)}" font-family="'Inter Display', Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif">${year}</text></clipPath></defs>
<g clip-path="url(#composition-image-in-type-clip)">${endGrain()}</g></svg>`;

export default {
  study: true,
  id: 'composition-image-in-type',
  title: 'Image inside type: a picture seen through very large letters',
  className: 'st cs-field-survey cmp-image-in-type',
  notes: `Purpose: Make one number or word the graphic statement of a title page by filling very large letters with the picture that proves it; here the felling year, filled with the end grain whose rings date it. Use it once in a deck, for display type only.\nModify: Replace \`timbers\` (the year recomputes: ${felled}) and the picture inside the letters. The intended input is a high-resolution photograph clipped by the same <clipPath>; a photograph needs at least the letters' size at 1:1 (here about 900 × 330 px), which the bundled photographs do not have, so this page draws the end grain from \`rings\`.\nInvariant: The letters are heavy enough (900 weight) for the picture to read inside them; the picture is chosen for what it shows, not as texture; the same words exist as plain text on the page (the headline), and the image carries an accessible label.\nStatic: Already static.`,
  sources: [{ type: 'original-example', file: 'assets/compositions/image-in-type.mjs' }],
  exportPolicy: 'final',
  content: `${figure.replace('<svg class="it-art"', '<svg class="it-art" data-region="primary"')}
<p class="it-caption" data-region="support">End grain of tie-beam ${drawn.id}, drawn from its ring widths: ${rings.length} rings, ${drawn.firstRing}–${drawn.lastRing}. Green: the bark edge, the last ring the tree grew.</p>
<h1 class="it-head" data-region="title">The barn’s roof was built from oaks felled in the winter of ${felled}–${String(felled + 1).slice(2)}</h1>
<p class="it-dek" data-region="support">${timbers.length} roof timbers match the regional oak chronology. ${withBark.length} keep their bark edge, and in each the last ring grew in ${felled}.</p>
<p class="st-source" data-region="source"><span>Illustrative data · Hallgate Barn building survey, 2026</span><span>Image inside type</span></p>`,
};
