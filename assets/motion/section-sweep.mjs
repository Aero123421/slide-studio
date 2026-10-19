// Motion study · Sweep a section plane — the cut line travels down the plan to the position
// the data selects (build 1), then the section at that cut is drawn underneath on the same
// horizontal scale (build 2). Contours, cut position and profile all come from one terrain model.
import { svgRoot, el, g, textLines, linear, contourLines, pathFromPoints, theme as makeTheme, fmt } from '../runtime/figure.mjs';

// Illustrative terrain of a 2.4 km × 0.5 km reach (x east, y south, km; elevation m).
const riverX = y => 1.2 + 0.07 * Math.sin(y * 7);
const halfWidth = y => 0.42 - 0.2 * Math.exp(-(((y - 0.31) / 0.09) ** 2));
const elev = (x, y) => 352 - 10 * y + 140 * (1 - Math.exp(-(((x - riverX(y)) / halfWidth(y)) ** 2)));
const crest = 430; // planned crest elevation, m

// Width of the valley at crest level along any east–west line: scan for the two crossings.
const crestSpan = y => {
  const xs = Array.from({ length: 2401 }, (_, i) => i / 1000), r = riverX(y);
  const west = xs.filter(x => x < r && elev(x, y) >= crest).at(-1), east = xs.find(x => x > r && elev(x, y) >= crest);
  return { west, east, width: (east - west) * 1000 };
};
const stations = Array.from({ length: 49 }, (_, i) => 0.02 + i * 0.0095);
const cut = stations.map(y => ({ y, ...crestSpan(y) })).sort((a, b) => a.width - b.width)[0];
const upstream = { y: stations[0], ...crestSpan(stations[0]) };
const round10 = v => Math.round(v / 10) * 10;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'motion-section-sweep-fig';
  const sx = linear([0, 2.4], [0, W]), sy = linear([0, 0.5], [0, 240]);      // plan: 480 px per km both ways
  const ez = linear([340, 500], [466, 292]);                                   // section: elevation
  const levels = Array.from({ length: 12 }, (_, i) => 360 + i * 10);
  const contours = contourLines(elev, { x0: 0, x1: 2.4, y0: 0, y1: 0.5, nx: 120, ny: 26, levels });
  const plan = g({},
    el('rect', { x: 0, y: 0, width: W, height: 240, fill: t.c('surface') }),
    contours.map(({ level, lines }) => lines.map(line => el('path', {
      d: pathFromPoints(line.map(([x, y]) => [sx(x), sy(y)])), fill: 'none',
      stroke: level === crest ? t.c('ink') : t.c('muted'), 'stroke-width': level === crest ? 2.2 : level % 50 ? 0.9 : 1.5, opacity: level === crest ? 1 : 0.75,
    }))),
    el('path', { d: pathFromPoints(Array.from({ length: 51 }, (_, i) => [sx(riverX(i / 100)), sy(i / 100)])), fill: 'none', stroke: t.cat(2), 'stroke-width': 4, 'stroke-linecap': 'round' }),
    textLines([`${crest} m contour`], { x: sx(cut.east) + 8, y: sy(0.06), size: 16, weight: 700, fill: t.c('ink'), halo: t.c('surface') }),
    textLines(['Plan, north up'], { x: 10, y: 10, size: 16, weight: 700, valign: 'top', fill: t.c('muted'), halo: t.c('surface') }));

  // The section plane: one group translated from the top of the plan to the selected cut.
  const y0 = sy(upstream.y), y1 = sy(cut.y);
  const plane = g({ 'data-states': { 0: { translate: '0px 0px' }, 1: { translate: `0px ${y1 - y0}px` } }, 'data-duration': 1000, 'data-easing': 'smooth' },
    el('line', { x1: 0, x2: W, y1: y0, y2: y0, stroke: t.c('accent'), 'stroke-width': 3, 'stroke-dasharray': '14 6 3 6' }),
    textLines(['A'], { x: 14, y: y0 - 10, size: 20, weight: 700, fill: t.c('accent'), halo: t.c('surface') }),
    textLines(['A′'], { x: W - 14, y: y0 - 10, size: 20, weight: 700, anchor: 'end', fill: t.c('accent'), halo: t.c('surface') }));
  const sweepNote = g({ 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 900 },
    textLines(['Narrowest point of the reach:', `crest ${round10(cut.width)} m, against ${round10(upstream.width)} m upstream`], { x: 16, y: y1 + 28, size: 16, weight: 600, fill: t.c('ink'), halo: t.c('surface'), lineHeight: 1.3 }));

  // The section at the cut, on the plan's horizontal scale (vertical exaggeration stated).
  const profile = Array.from({ length: 241 }, (_, i) => [sx(i / 100), ez(elev(i / 100, cut.y))]);
  const ve = (ez(340) - ez(440)) / 100 / (sx(1) / 1000);
  const section = g({},
    g({ 'data-step': 2, 'data-motion': 'reveal', 'data-duration': 500 },
      textLines([`Section A–A′, vertical scale ×${fmt(ve, { digits: 1 })}`], { x: 0, y: 256, size: 16, weight: 700, valign: 'top', fill: t.c('muted') }),
      el('path', { d: `${pathFromPoints(profile)}L${W} ${ez(340)}L0 ${ez(340)}Z`, fill: t.c('surface') }),
      [360, 400, 440, 480].map(v => g({}, el('line', { x1: 0, x2: W, y1: ez(v), y2: ez(v), stroke: t.c('grid') }),
        textLines([`${v} m`], { x: W - 4, y: ez(v) + 4, size: 15, anchor: 'end', valign: 'top', fill: t.c('muted') })))),
    g({ 'data-step': 2, 'data-motion': 'draw', 'data-duration': 900, 'data-delay': 200 },
      el('path', { d: pathFromPoints(profile), fill: 'none', stroke: t.c('ink'), 'stroke-width': 2.4 })),
    g({ 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 900 },
      el('line', { x1: sx(cut.west), x2: sx(cut.east), y1: ez(crest), y2: ez(crest), stroke: t.c('accent'), 'stroke-width': 3 }),
      [cut.west, cut.east].map(x => el('line', { x1: sx(x), x2: sx(x), y1: ez(crest) - 9, y2: ez(crest) + 9, stroke: t.c('accent'), 'stroke-width': 3 })),
      textLines([`Crest ${round10(cut.width)} m long at ${crest} m`], { x: sx((cut.west + cut.east) / 2), y: ez(crest) - 14, size: 18, weight: 700, anchor: 'middle', fill: t.c('accent'), halo: t.c('paper') }),
      textLines(['A'], { x: 0, y: ez(elev(0, cut.y)) - 10, size: 18, weight: 700, fill: t.c('accent') }),
      textLines(['A′'], { x: W, y: ez(elev(2.4, cut.y)) - 10, size: 18, weight: 700, anchor: 'end', fill: t.c('accent') })));
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Plan of a valley reach with a section plane swept to the narrowest crest, and the section below',
    desc: `Contours every 10 m. The section line moves to ${fmt(cut.y * 1000, { digits: 0 })} m down the reach, where the valley at the ${crest} m crest level is ${round10(cut.width)} m wide, against ${round10(upstream.width)} m at the top of the reach. The section below shares the plan's horizontal scale.` },
  plan, plane, sweepNote, section);
}

export default {
  study: true,
  id: 'motion-section-sweep',
  title: 'Sweep a section plane',
  className: 'st cs-field-survey',
  notes: 'Purpose: Declare where an object is being cut before showing the cut: the section line travels to its position, then the section appears.\nModify: Replace `elev` (or interpolate survey points) and `crest`; the contours, the selected cut (narrowest crest), the profile, the bracket and the headline recompute.\nInvariant: The cut line is labelled A–A′ on the plan and the section; the section shares the plan\'s horizontal scale; vertical exaggeration is stated.\nStatic: The final build shows the plan with the cut line in place and the section beneath it.',
  sources: [{ type: 'original-example', file: 'assets/motion/section-sweep.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Section A–A′ is the valley’s narrowest point: a crest at ${crest} m would span just <em>${round10(cut.width)} m</em></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative terrain model · contours every 10 m</span><span>Motion · section plane swept to its position, then cut (2 builds)</span></p>`,
};
