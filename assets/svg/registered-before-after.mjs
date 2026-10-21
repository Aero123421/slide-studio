// Diagram study · Registered before and after — the same street cross-section in two states,
// drawn on one metre scale with its fixed edges aligned, so only what changed can look different.
// Every segment, total and ratio is computed from `states`; the module refuses unequal widths.
import { svgRoot, el, g, textLines, linear, measureText, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const states = [ // width of each space, metres, and people moving along it 8–9 am, both directions (illustrative)
  { name: 'Before', year: 2019, spaces: [
    { use: 'Footway', m: 2.8, people: 1450 }, { use: 'Parking', m: 2.2, people: 0 },
    { use: 'Traffic', m: 3.0, people: 990 }, { use: 'Traffic', m: 3.0, people: 990 },
    { use: 'Traffic', m: 3.0, people: 990 }, { use: 'Traffic', m: 3.0, people: 990 },
    { use: 'Parking', m: 2.2, people: 0 }, { use: 'Footway', m: 2.8, people: 1320 }] },
  { name: 'After', year: 2025, spaces: [
    { use: 'Footway', m: 2.8, people: 1600 }, { use: 'Cycle', m: 2.0, people: 1150 },
    { use: 'Bus', m: 3.2, people: 2900 }, { use: 'Traffic', m: 3.0, people: 850 },
    { use: 'Traffic', m: 3.0, people: 850 }, { use: 'Bus', m: 3.2, people: 2700 },
    { use: 'Cycle', m: 2.0, people: 1020 }, { use: 'Footway', m: 2.8, people: 1480 }] },
];
const width = s => +s.spaces.reduce((a, p) => a + p.m, 0).toFixed(2);
if (width(states[0]) !== width(states[1])) throw Error('registered-before-after: both states must span the same width');
const street = width(states[0]);
const kerbs = s => [s.spaces[0].m, street - s.spaces.at(-1).m];
const kerbsFixed = kerbs(states[0]).every((k, i) => Math.abs(k - kerbs(states[1])[i]) < 1e-9);
const people = s => s.spaces.reduce((a, p) => a + p.people, 0);
const ratio = people(states[1]) / people(states[0]);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 450, id = 'registered-before-after-fig';
  const x = linear([0, street], [24, W - 196]); // one metre scale for both states
  const stripH = 118, tops = [64, 262];
  const style = {
    Footway: { fill: t.c('surface'), text: t.c('ink') },
    Parking: { fill: `url(#${id}-hatch)`, text: t.c('ink') },
    Traffic: { fill: t.c('context'), text: t.c('ink') },
    Bus: { fill: t.c('accent'), text: t.c('onAccent') },
    Cycle: { fill: t.seq(2), text: t.c('ink') },
  };
  const strip = (s, top) => {
    let at = 0;
    const parts = s.spaces.map((p, k) => {
      const x0 = x(at), x1 = x(at + p.m), cx = (x0 + x1) / 2, st = style[p.use];
      at += p.m;
      const next = s.spaces[k + 1];
      return g({},
        el('rect', { x: x0, y: top, width: x1 - x0, height: stripH, fill: st.fill }),
        // painted lane line between two running lanes of the same kind
        next && next.use === p.use && p.use !== 'Footway' ? el('line', { x1, x2: x1, y1: top + 8, y2: top + stripH - 8, stroke: t.c('paper'), 'stroke-width': 2, 'stroke-dasharray': '10 8' }) : '',
        textLines([p.use], { x: cx, y: top + 34, size: 16, anchor: 'middle', fill: st.text, weight: 700 }),
        textLines([`${fmt(p.m, { digits: 1 })} m`], { x: cx, y: top + 60, size: 15, anchor: 'middle', fill: st.text }),
        textLines([`${fmt(p.people)}/h`], { x: cx, y: top + 92, size: 15, anchor: 'middle', fill: st.text, weight: 600, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
    });
    // building fronts: heavy edges at 0 and full width
    return g({ class: 'ss-state' },
      textLines([`${s.name} (${s.year})`], { x: x(0), y: top - 14, size: 17, fill: t.c('ink'), weight: 700 }),
      parts,
      el('rect', { x: x(0), y: top, width: x(street) - x(0), height: stripH, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.5 }),
      el('line', { x1: x(0), x2: x(0), y1: top - 6, y2: top + stripH + 6, stroke: t.c('ink'), 'stroke-width': 4 }),
      el('line', { x1: x(street), x2: x(street), y1: top - 6, y2: top + stripH + 6, stroke: t.c('ink'), 'stroke-width': 4 }),
      textLines([fmt(people(s))], { x: x(street) + 26, y: top + 52, size: 30, fill: s === states[1] ? t.c('accent') : t.c('ink'), weight: 700, attrs: { 'font-variant-numeric': 'tabular-nums' } }),
      textLines(['people per hour'], { x: x(street) + 26, y: top + 78, size: 15, fill: t.c('muted') }));
  };
  const kx = kerbs(states[0]).map(x), yTop = tops[0] + stripH, yBot = tops[1];
  return svgRoot({ id, width: W, height: H, theme: t,
    title: `Street cross-section before (${states[0].year}) and after (${states[1].year}), registered on one scale`,
    desc: `Same ${fmt(street, { digits: 1 })} metres between building lines; kerbs ${kerbsFixed ? 'unchanged' : 'moved'}. Parking and two traffic lanes became bus lanes and cycle tracks. People moving along the street in the morning peak rose from ${fmt(people(states[0]))} to ${fmt(people(states[1]))} per hour, ${fmt(ratio, { digits: 1 })} times as many.` },
  el('defs', {}, el('pattern', { id: `${id}-hatch`, width: 9, height: 9, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
    el('rect', { width: 9, height: 9, fill: t.c('surface') }), el('line', { x1: 0, x2: 0, y1: 0, y2: 9, stroke: t.c('context'), 'stroke-width': 3 }))),
  // dimension line: the registered width, broken around its label as on a drawing
  (() => {
    const label = `${fmt(street, { digits: 1 })} m between building lines, both years`, mid = (x(0) + x(street)) / 2, half = measureText(label, 15, { weight: 600 }) / 2 + 12;
    return g({ class: 'ss-dim' },
      el('line', { x1: x(0), x2: mid - half, y1: 14, y2: 14, stroke: t.c('muted'), 'stroke-width': 1.2 }),
      el('line', { x1: mid + half, x2: x(street), y1: 14, y2: 14, stroke: t.c('muted'), 'stroke-width': 1.2 }),
      el('line', { x1: x(0), x2: x(0), y1: 7, y2: 21, stroke: t.c('muted'), 'stroke-width': 1.2 }),
      el('line', { x1: x(street), x2: x(street), y1: 7, y2: 21, stroke: t.c('muted'), 'stroke-width': 1.2 }),
      textLines([label], { x: mid, y: 14, size: 15, anchor: 'middle', valign: 'middle', fill: t.c('muted'), weight: 600 }));
  })(),
  strip(states[0], tops[0]), strip(states[1], tops[1]),
  // registration: kerb lines carried from one state to the other
  kx.map(px => el('line', { x1: px, x2: px, y1: yTop, y2: yBot, stroke: t.c('ink'), 'stroke-width': 1.3, 'stroke-dasharray': '4 4' })),
  textLines([kerbsFixed ? 'Kerbs stay put' : 'Kerbs moved'], { x: kx[0] + 10, y: (yTop + yBot) / 2 + 6, size: 15, fill: t.c('ink'), weight: 600 }),
  // the change in what the street carries
  el('path', { d: `M${x(street) + 44} ${tops[0] + 96}V${tops[1] + 8}`, stroke: t.c('accent'), 'stroke-width': 2, fill: 'none' }),
  el('path', { d: `M${x(street) + 38} ${tops[1] + 1}l6 10l6 -10z`, fill: t.c('accent') }),
  textLines([`× ${fmt(ratio, { digits: 1 })}`], { x: x(street) + 58, y: (tops[0] + 96 + tops[1]) / 2, size: 22, valign: 'middle', fill: t.c('accent'), weight: 700 }),
  // scale bar: proof that both strips share one scale
  el('line', { x1: x(0), x2: x(5), y1: H - 12, y2: H - 12, stroke: t.c('ink'), 'stroke-width': 2.5 }),
  textLines(['5 m'], { x: x(5) + 8, y: H - 12, size: 15, valign: 'middle', fill: t.c('ink'), weight: 600 }));
}

export default {
  study: true,
  id: 'registered-before-after',
  title: 'Registered before and after: one geometry, two states',
  className: 'st cs-blueprint',
  notes: 'Purpose: Compare the same geometry in two states (here a street cross-section) with camera, scale and fixed edges identical, so the eye sees only what changed.\nModify: Replace `states` (each space: use, width in metres, people per hour). Segments, lane lines, totals, the ratio and the kerb check recompute; the module throws if the two states do not span the same width.\nInvariant: One metre scale for both states (scale bar shown); building lines and kerbs registered and carried across with guides; changed spaces take the accent family, unchanged ones stay grey; the change is stated, not just drawn.\nStatic: Already static. As motion, keep the strip and let the segments morph between states.',
  sources: [{ type: 'original-example', file: 'assets/svg/registered-before-after.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">The same ${fmt(street)} metres of street now carry ${fmt(ratio, { digits: 1 })} times as many people in the morning peak</h1>
<p class="st-dek">Parking and two traffic lanes became bus lanes and cycle tracks; the kerbs did not move</p>
<figure class="st-fig" style="top:204px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · counts on a weekday in October, ${states[0].year} and ${states[1].year}</span><span>Registered cross-sections, one scale</span></p>`,
};
