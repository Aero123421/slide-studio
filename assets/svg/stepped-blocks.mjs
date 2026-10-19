// Diagram study · Stepped mass — connected rectangular masses in one oblique projection.
// Terraces step down away from a tall block and a cantilever reaches back over the void, so the
// silhouette is asymmetric; every face is toned by its orientation, never picked per block.
import { svgRoot, el, g, theme as makeTheme, sum, pathFromPoints } from '../runtime/figure.mjs';

// Works in the exhibition, by medium, and the estates they come from (illustrative).
const works = [{ medium: 'drawings', count: 64 }, { medium: 'photographs', count: 38 }, { medium: 'models', count: 10 }];
const estates = 14;
const show = { title: 'Concrete Poetry', years: '1958–1979', opens: '18 April', closes: '27 September 2027', venue: 'Hallam Gallery of Architecture' };
const total = sum(works.map(w => w.count));

// Massing: floors stacked from the ground up, each shifted along x and z, so the mass steps out and back
// on both sides instead of rising or falling like bars. Modules: x along the ground, z into the page.
const W = 1280, H = 720;
const motif = {
  u: 30, storey: 2.1, ground: [740, 612],                               // module in px, storey height in modules, origin on screen
  depth: [0.42, -0.3],                                                  // oblique projection of one module of depth
  floors: [                                                              // [x0, x1, z0, z1] per storey, ground floor first
    [0, 12, 0, 3], [0, 12, 0, 3], [-4, 8, -0.8, 2.2], [-4, 8, -0.8, 2.2], [2, 15, 0, 3], [2, 15, 0, 3], [-2, 7, -0.4, 2.6],
  ],
  slit: [0.3, 0.72], bay: 1.5,                                          // window band (fractions of the storey) and fin spacing (modules)
};

export function figure(theme = 'css') {
  const t = makeTheme(theme), { u, storey, ground: [gx, gy], depth: [dx, dy] } = motif;
  const P = (x, y, z) => [gx + x * u + z * u * dx, gy - y * u + z * u * dy];
  const quad = pts => el('path', { d: pathFromPoints(pts, { close: true }) });
  const shade = { front: t.mix('ink', 'paper', 0.2), top: t.mix('ink', 'paper', 0.07), side: t.mix('ink', 'paper', 0.42), slit: t.mix('ink', 'paper', 0.6) };
  // Bottom to top: each storey stands on the one below, so later storeys correctly cover earlier ones.
  const storeys = motif.floors.map(([x0, x1, z0, z1], k) => {
    const y0 = k * storey, y1 = y0 + storey, [s0, s1] = motif.slit.map(f => y0 + f * storey);
    return g({},
      g({ fill: shade.side }, quad([P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1), P(x1, y1, z0)])),
      g({ fill: shade.top }, quad([P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)])),
      g({ fill: shade.front }, quad([P(x0, y0, z0), P(x1, y0, z0), P(x1, y1, z0), P(x0, y1, z0)])),
      g({ fill: shade.slit }, quad([P(x0 + 0.6, s0, z0), P(x1 - 0.6, s0, z0), P(x1 - 0.6, s1, z0), P(x0 + 0.6, s1, z0)])),
      // Concrete fins divide the ribbon window into bays of `bay` modules.
      g({ stroke: shade.front, 'stroke-width': 3 }, Array.from({ length: Math.floor((x1 - x0 - 1.2) / motif.bay) - 1 }, (_, b) => {
        const xb = x0 + 0.6 + (b + 1) * ((x1 - x0 - 1.2) / Math.floor((x1 - x0 - 1.2) / motif.bay));
        const [fx0, fy0] = P(xb, s0, z0), [fx1, fy1] = P(xb, s1, z0);
        return el('line', { x1: fx0, y1: fy0, x2: fx1, y2: fy1 });
      })));
  });
  const xs = motif.floors.flatMap(f => [f[0], f[1]]);
  return svgRoot({ id: 'stepped-blocks-fig', width: W, height: H, theme: t,
    title: 'A stack of concrete storeys shifted back and forth',
    desc: `${motif.floors.length} storeys in one oblique projection, each shifted left or right and forward or back from the one below, so the block cantilevers on both sides. The massing is an illustration, not a building survey.` },
  storeys,
  el('line', { x1: gx + (Math.min(...xs) - 4) * u, y1: gy, x2: W, y2: gy, stroke: t.c('ink'), 'stroke-width': 1.6 }));
}

export default {
  study: true,
  id: 'stepped-blocks',
  title: 'Stepped mass: asymmetry from connected rectangular blocks',
  className: 'st st--full cs-culture-gallery',
  notes: 'Purpose: Give an exhibition cover an asymmetric, architectural mass — storeys shifted back and forth so the block cantilevers on both sides — that sets the theme without pretending to show a trend.\nModify: Edit `works`, `estates` and `show`; the counts in the headline recompute. Reshape the mass in `motif.floors` ([x0, x1, z0, z1] per storey, in modules); `u` scales it and `ground` moves it.\nInvariant: Storeys shift both ways and stack on each other, so the silhouette never reads as bars rising or falling. One projection and one light for every face. Ink and greys only: the dates lead by weight, not colour.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/stepped-blocks.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="top:96px;max-width:520px;font-size:64px;line-height:1.04;font-weight:400">${show.title}<br><span class="st-quiet" style="font-size:34px;line-height:1.25;display:inline-block;margin-top:14px">${estates} housing estates<br>in ${total} works, ${show.years}</span></h1>
<p class="st-text" data-region="support" style="position:absolute;left:64px;top:352px;max-width:500px;font-size:20px">${works.map(w => `${w.count} ${w.medium}`).join(', ').replace(/, ([^,]*)$/, ' and $1')}</p>
<p class="st-text" data-region="support" style="position:absolute;left:64px;top:520px;font-size:22px;line-height:1.4"><strong style="font-weight:650">${show.opens} – ${show.closes}</strong><br><span style="color:var(--ss-muted)">${show.venue}</span></p>
<p class="st-source" data-region="source"><span>Illustrative data · fictional exhibition; the massing is decorative</span><span>Stepped mass</span></p>`,
};
