// Diagram study · Light cone — a schematic beam that carries the eye from a source to the statement.
// The cone is one flat tone (no glow, no gradient); short rays near the source give it direction and
// stop well before the text, which sits entirely inside the calm, lit part of the cone.
import { svgRoot, el, g, theme as makeTheme, mixHex, rng, polar, pathFromPoints, sum } from '../runtime/figure.mjs';

// Share of the growth budget by market, this year and planned for 2027 (illustrative).
const markets = [
  { name: 'Nordics', y2026: 0.11, y2027: 0.26, focus: true }, { name: 'Benelux', y2026: 0.12, y2027: 0.24, focus: true },
  { name: 'Iberia', y2026: 0.09, y2027: 0.20, focus: true }, { name: 'France', y2026: 0.10, y2027: 0.05 },
  { name: 'DACH', y2026: 0.12, y2027: 0.06 }, { name: 'Italy', y2026: 0.08, y2027: 0.04 },
  { name: 'UK and Ireland', y2026: 0.11, y2027: 0.05 }, { name: 'Poland', y2026: 0.07, y2027: 0.03 },
  { name: 'Czechia and Slovakia', y2026: 0.06, y2027: 0.03 }, { name: 'Baltics', y2026: 0.05, y2027: 0.02 },
  { name: 'Hungary', y2026: 0.09, y2027: 0.02 },
];
const focus = markets.filter(m => m.focus), rest = markets.length - focus.length;
const pct = v => Math.round(v * 100);
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const cap = s => s[0].toUpperCase() + s.slice(1);
const list = a => a.slice(0, -1).join(', ') + ' and ' + a.at(-1);

// Cone: apex, axis angle and half-angle in degrees (SVG angles: negative points up).
const W = 1280, H = 720;
const motif = { apex: [56, 566], axis: -15, half: 18.5, rays: 13, rayReach: [150, 400], seed: 5 };

const tone = (t, a, b, k) => (t.literal ? mixHex(t.hex(a), t.hex(b), k) : `color-mix(in srgb, ${t.c(a)}, ${t.c(b)} ${+(k * 100).toFixed(1)}%)`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), rand = rng(motif.seed), [ax, ay] = motif.apex, rad = d => (d * Math.PI) / 180;
  const a0 = rad(motif.axis - motif.half), a1 = rad(motif.axis + motif.half), far = 2200;
  const cone = pathFromPoints([[ax, ay], polar(ax, ay, far, a0), polar(ax, ay, far, a1)], { close: true });
  // Rays fan evenly across the cone; their lengths are seeded and they all stop short of the text.
  const rays = Array.from({ length: motif.rays }, (_, k) => {
    const a = a0 + ((k + 0.5) / motif.rays) * (a1 - a0), len = motif.rayReach[0] + rand() * (motif.rayReach[1] - motif.rayReach[0]);
    const [x0, y0] = polar(ax, ay, 16, a), [x1, y1] = polar(ax, ay, len, a);
    return el('line', { x1: x0, y1: y0, x2: x1, y2: y1 });
  });
  return svgRoot({ id: 'light-cone-fig', width: W, height: H, theme: t,
    title: 'A schematic cone of light rising from the lower left',
    desc: 'A flat, slightly lighter wedge opens from a small source at the lower left toward the upper right, with short rays near the source. It is a schematic, directional illustration, not a simulation of light.' },
  el('defs', {}, el('clipPath', { id: 'light-cone-clip' }, el('rect', { x: 0, y: 0, width: W, height: H }))),
  g({ 'clip-path': 'url(#light-cone-clip)' },
    el('path', { d: cone, fill: tone(t, 'paper', 'ink', 0.075) }),
    g({ stroke: tone(t, 'paper', 'ink', 0.2), 'stroke-width': 1.2, 'stroke-linecap': 'round' }, rays),
    el('circle', { cx: ax, cy: ay, r: 6, fill: t.c('ink') })));
}

export default {
  study: true,
  id: 'light-cone',
  title: 'Light cone: a directional beam toward the statement',
  className: 'st st--full cs-strategy-dark',
  notes: 'Purpose: Lead the eye from a source to one strategic statement with a schematic beam — the page equivalent of a spotlight.\nModify: Replace `markets` (mark the chosen ones with focus: true); the counts, the 2027 share, this year\'s share and the market names recompute. Move the beam with `motif.apex`, `axis` and `half`; keep the text block inside the wide end of the cone.\nInvariant: Schematic, not a light simulation: one flat tone, no glow or gradient. Text sits only on the calm, ray-free part of the cone; rays stop short of it.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/light-cone.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="left:580px;top:288px;max-width:620px;font-size:46px;line-height:1.12">${cap(words[focus.length])} of ${words[markets.length]} markets will get ${pct(sum(focus.map(m => m.y2027)))}% of growth spend in 2027</h1>
<p class="st-dek" style="left:580px;top:432px;max-width:580px">${list(focus.map(m => m.name))}, up from ${pct(sum(focus.map(m => m.y2026)))}% this year. The other ${words[rest]} keep their service teams but start no new campaigns.</p>
<p class="st-source" data-region="source"><span>Illustrative data · fictional company, 2027 budget round; the beam is schematic</span><span>Light cone</span></p>`,
};
