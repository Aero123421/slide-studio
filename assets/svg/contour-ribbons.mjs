// Diagram study · Contour ribbons — a bundle of nested curves that sweeps toward the page's main figure.
// Every curve is the same cubic path offset along its normal, and the gaps widen along the sweep,
// so the bundle fans out and leads the eye without crossing the type.
import { svgRoot, el, g, theme as makeTheme, mixHex, pathFromPoints, fmt, sum } from '../runtime/figure.mjs';

// Annual logistics cost by component, £ millions: seven depots today vs three regional hubs (illustrative).
const cost = [
  { part: 'line-haul', today: 24.6, hubs: 19.2 }, { part: 'warehousing', today: 12.1, hubs: 11.6 }, { part: 'last-mile delivery', today: 4.5, hubs: 4.6 },
];
const network = { depots: 7, hubs: 3, from: 2028 };
const today = sum(cost.map(c => c.today)), hubs = sum(cost.map(c => c.hubs)), saving = today - hubs;
const biggest = [...cost].sort((a, b) => (b.today - b.hubs) - (a.today - a.hubs))[0];
const shareOfSaving = (biggest.today - biggest.hubs) / saving;
const howMuch = shareOfSaving >= 0.9 ? 'almost all of it' : shareOfSaving >= 0.6 ? 'most of it' : 'the largest part';
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const cap = s => s[0].toUpperCase() + s.slice(1);

// Bundle: base cubic (its upper edge) from the left edge, rising to flatten under the figure; `count` offsets below it
// whose gap grows from gap[0] to gap[1].
const W = 1280, H = 720;
const motif = { base: [[-80, 590], [330, 640], [600, 470], [1360, 432]], count: 15, gap: [6, 12] };   // base is the bundle's upper edge

const tone = (t, a, b, k) => (t.literal ? mixHex(t.hex(a), t.hex(b), k) : `color-mix(in srgb, ${t.c(a)}, ${t.c(b)} ${+(k * 100).toFixed(1)}%)`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), [P0, P1, P2, P3] = motif.base;
  const B = s => [0, 1].map(i => (1 - s) ** 3 * P0[i] + 3 * (1 - s) ** 2 * s * P1[i] + 3 * (1 - s) * s ** 2 * P2[i] + s ** 3 * P3[i]);
  const dB = s => [0, 1].map(i => 3 * (1 - s) ** 2 * (P1[i] - P0[i]) + 6 * (1 - s) * s * (P2[i] - P1[i]) + 3 * s ** 2 * (P3[i] - P2[i]));
  const curves = Array.from({ length: motif.count }, (_, k) => {
    const pts = Array.from({ length: 97 }, (_, i) => {
      const s = i / 96, [x, y] = B(s), [dx, dy] = dB(s), m = Math.hypot(dx, dy);
      const gap = motif.gap[0] + (motif.gap[1] - motif.gap[0]) * s;           // the bundle fans out along the sweep
      return [x - (dy / m) * k * gap, y + (dx / m) * k * gap];               // offset toward the lower side
    });
    const mid = 1 - Math.abs(k / (motif.count - 1) - 0.5) * 2;               // darker in the middle of the bundle
    return el('path', { d: pathFromPoints(pts), stroke: tone(t, 'paper', 'ink', 0.14 + 0.24 * mid), 'stroke-width': 1 + 0.9 * mid });
  });
  return svgRoot({ id: 'contour-ribbons-fig', width: W, height: H, theme: t,
    title: 'A bundle of nested curves sweeping to the right',
    desc: `${motif.count} nested curves rise from the lower left and fan out toward the right edge, below the page's main figure. They are original abstract lines, not geographic or scientific contours.` },
  el('defs', {}, el('clipPath', { id: 'contour-ribbons-clip' }, el('rect', { x: 0, y: 0, width: W, height: H - 64 }))),
  g({ 'clip-path': 'url(#contour-ribbons-clip)', fill: 'none', 'stroke-linecap': 'round' }, curves));
}

export default {
  study: true,
  id: 'contour-ribbons',
  title: 'Contour ribbons: nested curves that lead to the main figure',
  className: 'st st--full cs-consulting-green',
  notes: 'Purpose: Lead the eye from the corner of a statement page to its one figure with a quiet bundle of nested curves that never competes with it.\nModify: Replace `cost` and `network`; the headline, the saving, the share that comes from the largest component and the dek recompute. Reshape the sweep with `motif.base` (one cubic), `count` and `gap` (how much the bundle fans out).\nInvariant: Original abstract lines, not geographic or scientific contours; every curve is an offset of one path, so they never cross. The bundle passes below the figure and stops above the source line.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/contour-ribbons.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="top:64px;max-width:820px;font-size:44px;line-height:1.14">${cap(words[network.hubs])} regional hubs in place of ${words[network.depots]} depots would cut logistics cost by ${Math.round((saving / today) * 100)}%</h1>
<div data-region="primary" style="position:absolute;left:740px;top:200px;width:460px">
  <p class="st-num" style="color:var(--ss-accent)">£${fmt(saving, { digits: 1 })}m</p>
  <p class="st-text" style="margin-top:16px;color:var(--ss-muted)">a year from ${network.from}, against £${fmt(today, { digits: 1 })}m today; ${howMuch} comes from ${biggest.part}.</p>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · fictional distribution network review; the curves are decorative</span><span>Contour ribbons</span></p>`,
};
