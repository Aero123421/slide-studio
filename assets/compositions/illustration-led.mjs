// Composition study · Illustration-led explainer — one precise drawing carries the mechanism.
// A long section through a canal lock, drawn from its dimensions in metres (vertical scale
// exaggerated, as long sections usually are). The volume and filling time in the headline and
// labels are computed from the same dimensions and the paddle openings.
import { svgRoot, el, g, textLines, arrowMarker, theme as makeTheme } from '../runtime/figure.mjs';

const lock = {
  name: 'Lock 14, Mill Bridge', canal: 'Ellery Canal',
  length: 30, width: 4.6,      // chamber, m
  upper: 3.0, lower: 0,        // water levels, m above the lower pound
  depth: 1.8,                  // pound depth, m
  now: 1.45,                   // chamber level in the drawing: half way through filling
  paddles: { count: 2, area: 0.55, cd: 0.6 }, // ground paddles: opening m², discharge coefficient
};
const g0 = 9.81;
const rise = lock.upper - lock.lower, volume = lock.length * lock.width * rise; // m³ per filling
// Falling-head fill time: t = 2A√H / (Cd·a·√(2g)), A = chamber plan area, a = total paddle opening.
const fillSeconds = (2 * lock.length * lock.width * Math.sqrt(rise)) / (lock.paddles.cd * lock.paddles.count * lock.paddles.area * Math.sqrt(2 * g0));
const minutes = Math.ceil(fillSeconds / 60);
const words = ['', 'one', 'two', 'three', 'four', 'five', 'six'];

function drawing(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 420, kx = 18, ky = 48, X0 = 13 * kx, Y0 = 290; // ×2.7 vertical
  const x = m => X0 + m * kx, y = m => Y0 - m * ky;
  const floor = lock.lower - lock.depth, cill = lock.upper - lock.depth, coping = lock.upper + 0.6, bottom = floor - 0.8;
  const water = t.seq(1), surface = t.seq(3), id = 'composition-illustration-led';
  const poly = pts => `M${pts.map(([a, b]) => `${x(a)} ${y(b)}`).join('L')}Z`;
  // Ground and masonry in section (hatched). The culvert runs through the upper cill:
  // a shaft down from the pound bed, then along under the gates to an outlet in the cill face.
  const ground = poly([[-13, bottom], [-13, cill], [1.5, cill], [1.5, floor], [51, floor], [51, bottom]]);
  const shaft = [-4.4, -3.4], run = [-1.75, -0.95];
  const culvert = poly([[shaft[0], cill], [shaft[0], run[0]], [1.5, run[0]], [1.5, run[1]], [shaft[1], run[1]], [shaft[1], cill]]);
  const mid = (shaft[0] + shaft[1]) / 2, flowY = (run[0] + run[1]) / 2;
  const flow = `M${x(mid)} ${y(cill + 0.55)}V${y(flowY + 0.2)}Q${x(mid)} ${y(flowY)} ${x(mid + 0.6)} ${y(flowY)}H${x(3.4)}`;
  const boat = (() => { // narrowboat, 20 m, bow upstream, floating at the chamber level
    const wl = lock.now, b0 = 6, b1 = 26, keel = wl - 0.55, gun = wl + 0.45, roof = gun + 0.95;
    const hull = `M${x(b0 + 1.6)} ${y(keel)}L${x(b1)} ${y(keel)}L${x(b1)} ${y(gun)}L${x(b0)} ${y(gun)}Q${x(b0 + 0.4)} ${y(keel + 0.1)} ${x(b0 + 1.6)} ${y(keel)}Z`;
    const cabin = poly([[b0 + 4, gun], [b0 + 4, roof], [b1 - 3.2, roof], [b1 - 3.2, gun]]);
    const windows = Array.from({ length: 6 }, (_, i) => el('rect', { x: x(b0 + 5.4 + i * 2.1), y: y(roof - 0.28), width: 0.9 * kx, height: 0.32 * ky, rx: 2, fill: t.c('surface'), stroke: t.c('ink'), 'stroke-width': 1 }));
    const tiller = `M${x(b1)} ${y(gun)}L${x(b1 + 0.2)} ${y(gun + 0.8)}L${x(b1 - 1.4)} ${y(gun + 0.95)}`;
    return g({}, el('path', { d: hull, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 1.6 }),
      el('path', { d: cabin, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 1.6 }), windows,
      el('path', { d: tiller, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  })();
  const gate = (m, from, to) => el('rect', { x: x(m) - 5, y: y(to), width: 10, height: y(from) - y(to), fill: t.c('muted'), stroke: t.c('ink'), 'stroke-width': 1.2 });
  const levelLine = (m, text, at) => g({}, el('line', { x1: x(1.5), x2: x(29.6), y1: y(m), y2: y(m), stroke: t.c('ink'), 'stroke-width': 1.1, 'stroke-dasharray': '6 5' }),
    textLines([text], { x: x(at), y: y(m) - 7, size: 15, fill: t.c('ink'), halo: t.c('paper') }));
  // Rise: a dimension over the lower pound, with an extension line carrying the upper level across.
  const dx = x(32.6), dim = g({},
    el('line', { x1: x(30.6), x2: dx + 10, y1: y(lock.upper), y2: y(lock.upper), stroke: t.c('ink'), 'stroke-width': 1.1, 'stroke-dasharray': '6 5' }),
    el('line', { x1: dx, x2: dx, y1: y(lock.lower) - 2, y2: y(lock.upper) + 2, stroke: t.c('ink'), 'stroke-width': 1.2, 'marker-start': `url(#${id}-tick)`, 'marker-end': `url(#${id}-tick)` }),
    textLines([`${rise.toFixed(1)} m rise`], { x: dx + 10, y: y((lock.upper + lock.lower) / 2), size: 17, valign: 'middle', weight: 600, fill: t.c('ink') }));
  // A label: text above, a leader straight down to the part it names.
  const label = (lines, lx, base, ty, { color = t.c('ink'), weight = 400 } = {}) => g({},
    el('path', { d: `M${lx} ${base + 7}V${ty}`, fill: 'none', stroke: color, 'stroke-width': 1.2 }),
    el('circle', { cx: lx, cy: ty, r: 3.2, fill: color }),
    textLines(lines, { x: lx - 1, y: base - (lines.length - 1) * 21, size: 17, lineHeight: 1.24, fill: color, weight }));
  return svgRoot({ id: `${id}-fig`, width: W, height: H, theme: t,
    title: `Long section through ${lock.name}: the chamber filling from the upper pound`,
    desc: `The lower gates and paddles are closed. A ground paddle is raised, and water runs from the upper pound through a culvert in the upper cill into the chamber, lifting the boat from ${lock.lower} m towards ${lock.upper} m. Filling takes ${Math.round(volume)} cubic metres and about ${Math.round(fillSeconds / 10) * 10} seconds.` },
  el('defs', {},
    el('pattern', { id: `${id}-hatch`, width: 9, height: 9, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, el('line', { x1: 0, y1: 0, x2: 0, y2: 9, stroke: t.c('rule'), 'stroke-width': 1.4 })),
    arrowMarker(`${id}-arrow`, t.c('accent'), { size: 12 }), arrowMarker(`${id}-tick`, t.c('ink'), { size: 9 })),
  // water bodies, then the structure in section
  el('path', { d: poly([[-13, cill], [-13, lock.upper], [0, lock.upper], [0, cill]]), fill: water }),
  el('path', { d: poly([[1.5, floor], [1.5, lock.now], [30, lock.now], [30, floor]]), fill: water }),
  el('path', { d: poly([[30, floor], [30, lock.lower], [51, lock.lower], [51, floor]]), fill: water }),
  [[-13, 0, lock.upper], [1.5, 30, lock.now], [30, 51, lock.lower]].map(([a, b, lv]) => el('line', { x1: x(a), x2: x(b), y1: y(lv), y2: y(lv), stroke: surface, 'stroke-width': 2 })),
  el('path', { d: ground, fill: t.c('surface') }), el('path', { d: ground, fill: `url(#${id}-hatch)`, stroke: t.c('ink'), 'stroke-width': 1.4 }),
  el('path', { d: culvert, fill: water, stroke: t.c('ink'), 'stroke-width': 1.4 }),
  // the lock wall beyond the section plane, with the paddle shaft inside it as a hidden (dashed) line
  el('line', { x1: x(-5.2), x2: x(30.6), y1: y(coping), y2: y(coping), stroke: t.c('ink'), 'stroke-width': 1.4 }),
  el('rect', { x: x(shaft[0]), y: y(coping), width: (shaft[1] - shaft[0]) * kx, height: y(cill) - y(coping), fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.1, 'stroke-dasharray': '4 3' }),
  el('rect', { x: x(shaft[0]) + 3, y: y(coping - 0.25), width: (shaft[1] - shaft[0]) * kx - 6, height: 0.7 * ky, fill: t.c('muted') }),
  el('rect', { x: x(mid) - 3, y: y(coping + 0.75), width: 6, height: 0.75 * ky, fill: t.c('ink') }),
  levelLine(lock.upper, `Upper level +${lock.upper.toFixed(1)} m`, 2.1), levelLine(lock.lower, `Lower level ${lock.lower.toFixed(1)} m`, 12),
  boat, dim,
  gate(0, cill, coping + 0.15), gate(30, floor, coping + 0.15),
  el('path', { d: flow, fill: 'none', stroke: t.c('accent'), 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'marker-end': `url(#${id}-arrow)` }),
  el('path', { d: `M${x(3.2)} ${y(flowY + 0.35)}Q${x(4.8)} ${y(flowY + 1.1)} ${x(5.4)} ${y(floor + 2.2)}`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 2.4, 'stroke-linecap': 'round', 'marker-end': `url(#${id}-arrow)` }),
  // labels on the parts they name
  label(['Upper pound'], x(-12.4), 104, y(lock.upper)),
  label(['Ground paddle raised in its shaft:', 'water runs under the upper gates'], x(mid), 26, y(coping + 0.75), { color: t.c('accent'), weight: 600 }),
  label(['Upper gates shut,', 'held by the higher water'], x(0), 92, y(coping + 0.15)),
  label([`Chamber ${lock.length} × ${lock.width} m`], x(14), 92, y(coping)),
  label(['Lower gates shut,', 'held by the chamber water'], x(30), 92, y(coping + 0.15)),
  label(['Lower pound'], x(44), 256, y(lock.lower)));
}

export default {
  study: true,
  id: 'composition-illustration-led',
  title: 'Illustration-led explainer: one precise drawing carries the mechanism',
  className: 'st cs-physics-lecture cmp-illustration-led',
  notes: `Purpose: Explain how something works (a lock, a valve, a joint, an instrument) with one large, exact drawing labelled on its parts, instead of a row of icons and paragraphs. Use it when the mechanism is spatial: what moves, where the water or force goes, which part holds.\nModify: Replace \`lock\` with your object's dimensions and edit the drawing functions; keep every part drawn from those numbers so labels and computed figures stay true (here ${Math.round(volume)} m³ and ${Math.round(fillSeconds)} s per filling). Show one state of the mechanism, the one that explains it (here: mid-fill), and put the before and after as reference lines.\nInvariant: The drawing takes at least two thirds of the page; one stroke and hatch vocabulary; labels sit on the parts with short leaders; the one accent marks what moves (the water through the paddle); any exaggerated scale is stated.\nStatic: Already static. A build could raise the chamber level in three steps; keep the final state complete.`,
  sources: [{ type: 'original-example', file: 'assets/compositions/illustration-led.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" data-region="title">A lock lifts boats ${rise.toFixed(1)} m with water from the pound above: ${Math.round(volume)} m³ a time, no pump</h1>
<figure class="il2-fig" data-region="primary">${drawing()}</figure>
<ol class="il2-steps" data-region="support"><li><b>1</b>Close the lower gates and their paddles.</li><li class="il2-now"><b>2</b>Raise the ground paddles; the chamber fills in under ${words[minutes] ?? minutes} minutes.</li><li><b>3</b>Levels match: open the upper gates.</li></ol>
<p class="st-source" data-region="source"><span>Illustrative drawing · ${lock.name}, ${lock.canal}; ${lock.paddles.count} paddles of ${lock.paddles.area} m², falling-head estimate</span><span>Long section, vertical scale × 2.7</span></p>`,
};
