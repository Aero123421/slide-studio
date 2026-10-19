// Diagram study · Light cone — a beam split into rays whose widths carry the data.
// One ray per market leaves a single aperture, where the rays are stacked to the full budget; each
// ray keeps its width all the way out, so width = share of next year's growth spend.
import { svgRoot, el, theme as makeTheme, textLines, pathFromPoints, sum, esc } from '../runtime/figure.mjs';

// Share of the growth budget by market, this year and planned for 2027 (illustrative).
const markets = [
  { name: 'Nordics', y2026: 0.11, y2027: 0.26, focus: true }, { name: 'Benelux', y2026: 0.12, y2027: 0.24, focus: true },
  { name: 'Iberia', y2026: 0.09, y2027: 0.20, focus: true }, { name: 'France', y2026: 0.10, y2027: 0.05 },
  { name: 'DACH', y2026: 0.12, y2027: 0.06 }, { name: 'Italy', y2026: 0.08, y2027: 0.04 },
  { name: 'UK and Ireland', y2026: 0.11, y2027: 0.05 }, { name: 'Poland', y2026: 0.07, y2027: 0.03 },
  { name: 'Czechia and Slovakia', y2026: 0.06, y2027: 0.03 }, { name: 'Baltics', y2026: 0.05, y2027: 0.02 },
  { name: 'Hungary', y2026: 0.09, y2027: 0.02 },
];
for (const year of ['y2026', 'y2027']) {
  const total = sum(markets.map(m => m[year]));
  if (Math.abs(total - 1) > 1e-9) throw Error(`${year} shares add to ${(total * 100).toFixed(1)}%, not 100%`);
}
const focus = markets.filter(m => m.focus), rest = markets.filter(m => !m.focus);
const pct = v => Math.round(v * 100);
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const cap = s => s[0].toUpperCase() + s.slice(1);
const list = a => a.slice(0, -1).join(', ') + ' and ' + a.at(-1);

// Beam: rays stacked at the aperture (x0), fanned out to evenly gapped ends (x1); px per percentage point.
const W = 1280, H = 720;
const beam = { x0: 132, x1: 884, centre: 456, perPoint: 2, gap: 16 };

export function figure(theme = 'css') {
  const t = makeTheme(theme), { x0, x1, centre, perPoint, gap } = beam;
  const rays = [...markets].sort((a, b) => b.y2027 - a.y2027 || a.name.localeCompare(b.name));
  const total = 100 * perPoint, spread = total + gap * (rays.length - 1);
  let s0 = centre - total / 2, e0 = centre - spread / 2;
  const placed = rays.map(m => {
    const w = m.y2027 * 100 * perPoint, ray = { ...m, w, s0, e0 };
    s0 += w; e0 += w + gap;
    return ray;
  });
  const band = r => el('path', { d: pathFromPoints([[x0, r.s0], [x1, r.e0], [x1, r.e0 + r.w], [x0, r.s0 + r.w]], { close: true }),
    fill: r.focus ? t.c('accent') : t.mix('ink', 'paper', 0.24) });
  const others = placed.filter(r => !r.focus), top = others[0].e0, bottom = others.at(-1).e0 + others.at(-1).w;
  const ink = t.c('ink'), muted = t.c('muted');
  return svgRoot({ id: 'light-cone-fig', width: W, height: H, theme: t,
    title: 'Growth budget 2027 split into one ray per market',
    desc: `${rays.length} rays leave one aperture; each ray's width is its market's share of the 2027 growth budget. ${list(focus.map(m => `${m.name} ${pct(m.y2027)}%`))} are drawn bright; the other ${rest.length} markets share ${pct(sum(rest.map(m => m.y2027)))}%.` },
  placed.map(band),
  el('line', { x1: x0 - 2, y1: centre - total / 2 - 8, x2: x0 - 2, y2: centre + total / 2 + 8, stroke: ink, 'stroke-width': 2 }),
  textLines(['2027 growth budget'], { x: x0 - 2, y: centre + total / 2 + 40, size: 15, fill: muted }),
  // Labels at the ray ends: the funded markets one by one, the rest as one bracketed group.
  placed.filter(r => r.focus).map(r => el('text', { x: x1 + 16, y: r.e0 + r.w / 2 + 6, 'font-size': 17, fill: ink },
    el('tspan', { 'font-weight': 700 }, `${pct(r.y2027)}%`), el('tspan', { dx: 6 }, esc(r.name)))),
  el('path', { d: `M${x1 + 10} ${top}h6V${bottom}h-6`, fill: 'none', stroke: muted, 'stroke-width': 1.2 }),
  el('text', { x: x1 + 26, y: (top + bottom) / 2 + 5, 'font-size': 16, fill: muted },
    el('tspan', { 'font-weight': 700 }, `${pct(sum(others.map(r => r.y2027)))}%`), el('tspan', { dx: 6 }, `${words[others.length]} other markets`)));
}

export default {
  study: true,
  id: 'light-cone',
  title: 'Light cone: a beam whose rays carry the shares',
  className: 'st st--full cs-strategy-dark',
  notes: 'Purpose: Lead the eye from one source to a strategic choice with a beam split into rays, one per market, whose widths are the markets\' shares of next year\'s growth budget.\nModify: Replace `markets` (focus: true marks the funded ones); the headline, dek, ray widths and labels recompute, and the page refuses to build unless each year adds to 100%. Change `beam.perPoint` for overall thickness, `gap` for how far the rays fan apart, `x0/x1/centre` to move the beam.\nInvariant: Ray width is proportional to share and constant along the ray; rays are stacked at the aperture and sorted by share. Funded rays in brass and labelled, all others dim and labelled once as a group. Flat fills only: no glow or gradient.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/light-cone.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="primary">${figure()}</figure>
<h1 class="st-head" style="top:56px;max-width:1080px;font-size:44px;line-height:1.12;font-family:var(--ss-font-sans)">${cap(words[focus.length])} of ${words[markets.length]} markets will get ${pct(sum(focus.map(m => m.y2027)))}% of growth spend in 2027</h1>
<p class="st-dek" style="top:176px;max-width:900px">${list(focus.map(m => m.name))}, up from ${pct(sum(focus.map(m => m.y2026)))}% this year. The other ${words[rest.length]} keep their service teams but start no new campaigns.</p>
<p class="st-source" data-region="source"><span>Illustrative data · fictional company, 2027 budget round; ray width is proportional to share</span><span>Light cone</span></p>`,
};
