// Diagram study · Feedback loop — a closed corrective cycle, with the signal it measures.
// Top: the loop as a block diagram; every arrow names the signal it carries. Bottom: the
// measured residual from a deterministic simulation of the same loop at two controller gains.
// The headline numbers (settling time, remaining swing) are computed from the simulation.
import { theme as makeTheme, svgRoot, el, g, textLines, linear, pathFromPoints, measureNode, drawNode, roundedPolyline, arrowMarker, spreadLabels, fmt } from '../runtime/figure.mjs';

// Contact-tank model (illustrative): residual follows the dose minus chlorine demand with a
// 20-minute lag, and the analyser sees dosing changes only after 25 minutes of transport.
const plant = { target: 0.5, band: 0.05, lag: 20, delay: 25, baseDose: 1.7 };
const demand = minute => (minute >= 6 * 60 ? 1.5 : 1.2); // mg/L; raw water turns at 06:00
const start = 4 * 60, end = 16 * 60, jump = 6 * 60;      // minutes since midnight
const gains = [{ name: 'calm', kp: 1.0, ki: 0.03 }, { name: 'eager', kp: 1.5, ki: 0.045 }];

function simulate({ kp, ki }) { // PI controller, one-minute steps
  const dose = [], out = [];
  let r = plant.target, integral = 0;
  for (let m = start; m < end; m++) {
    const error = plant.target - r;
    integral += error;
    dose.push(Math.max(0, plant.baseDose + kp * error + ki * integral));
    const applied = dose.length > plant.delay ? dose[dose.length - 1 - plant.delay] : plant.baseDose;
    r += ((applied - demand(m)) - r) / plant.lag;
    out.push([m, r]);
  }
  const outside = out.filter(([, v]) => Math.abs(v - plant.target) > plant.band);
  const settledAt = outside.length ? outside.at(-1)[0] + 1 : start;
  const tail = out.filter(([m]) => m >= end - 180).map(([, v]) => v);
  return { out, settled: settledAt < end - 60, settledAt, swing: (Math.max(...tail) - Math.min(...tail)) / 2 };
}
const runs = gains.map(gn => ({ ...gn, ...simulate(gn) }));
const calm = runs.find(r => r.name === 'calm'), eager = runs.find(r => r.name === 'eager');
const clock = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const hoursAfter = Math.round((end - jump) / 60);
const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

export function figure(theme = 'css') {
  const t = makeTheme(theme), id = 'feedback-loop-fig', W = 1152, H = 470, size = 19, ctx = { t, size };
  const parts = [];
  const arrow = (pts, { em = false, color } = {}) => el('path', { d: roundedPolyline(pts, 10), fill: 'none', stroke: color || t.c('ink'), 'stroke-width': em ? 2.4 : 1.8, 'marker-end': `url(#${id}-arr)`, 'stroke-linejoin': 'round' });
  const sig = (text, x, y, anchor = 'middle', strong = false) => textLines([text], { x, y, size: 16, anchor, valign: 'bottom', fill: strong ? t.c('ink') : t.c('muted'), weight: strong ? 700 : 500 });

  // ---- block diagram: forward path on row 1, measurement path on row 2
  const r1 = 72, r2 = 184, sumR = 17;
  const box = (nd, x, y) => { const m = measureNode(nd, { size, maxWidth: 240, minWidth: 150 }); return Object.assign(m, { x, y: y - m.h / 2, fill: t.c('surface') }); };
  const sumX = 196;
  const ctrl = box({ id: 'ctrl', label: 'PI controller', sub: 'gain 1.0 or 1.5' }, sumX + sumR + 78, r1);
  const pump = box({ id: 'pump', label: 'Dosing pump', sub: 'hypochlorite' }, ctrl.x + ctrl.w + 150, r1);
  const tank = box({ id: 'tank', label: 'Contact tank', sub: `${plant.delay} min to outlet` }, pump.x + pump.w + 120, r1);
  const tap = tank.x + tank.w + 52;
  const sensor = box({ id: 'sensor', label: 'Residual analyser', sub: 'reads every minute' }, 0, r2);
  sensor.x = tank.x + tank.w / 2 - sensor.w / 2;
  parts.push(
    arrow([[0, r1], [sumX - sumR - 3, r1]]), sig(`target ${fmt(plant.target, { digits: 2 })} mg/L`, 0, r1 - 10, 'start', true),
    arrow([[sumX + sumR, r1], [ctrl.x - 3, r1]]), sig('error', (sumX + sumR + ctrl.x) / 2, r1 - 10),
    arrow([[ctrl.x + ctrl.w, r1], [pump.x - 3, r1]], { em: true }), sig('action: dose rate', (ctrl.x + ctrl.w + pump.x) / 2, r1 - 10, 'middle', true),
    arrow([[pump.x + pump.w, r1], [tank.x - 3, r1]]), sig('chlorine', (pump.x + pump.w + tank.x) / 2, r1 - 10),
    arrow([[tank.x + tank.w, r1], [W - 2, r1]]), sig('residual', W - 2, r1 - 10, 'end'),
    // disturbance enters the tank from above
    arrow([[tank.x + tank.w / 2, 4], [tank.x + tank.w / 2, tank.y - 3]], { color: t.c('muted') }),
    textLines(['raw-water demand'], { x: tank.x + tank.w / 2 - 12, y: 12, size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted'), weight: 500 }),
    // measurement: tap the outlet, analyse, feed back to the comparison (negative sign)
    el('circle', { cx: tap, cy: r1, r: 4.5, fill: t.c('ink') }),
    arrow([[tap, r1], [tap, r2], [sensor.x + sensor.w + 3, r2]]),
    arrow([[sensor.x, r2], [sumX, r2], [sumX, r1 + sumR + 3]], { em: true }),
    sig('measured: residual, mg/L', (sumX + sensor.x) / 2, r2 - 10, 'middle', true),
    el('circle', { cx: sumX, cy: r1, r: sumR, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 1.8 }),
    el('path', { d: `M${sumX - 7} ${r1}H${sumX + 7}M${sumX} ${r1 - 7}V${r1 + 7}`, stroke: t.c('ink'), 'stroke-width': 1.8 }),
    textLines(['−'], { x: sumX - 13, y: r1 + sumR + 16, size: 20, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: 700 }),
    [ctrl, pump, tank, sensor].map(nd => drawNode(nd, ctx)));

  // ---- strip chart of the measured residual
  const top = 252, bottom = H - 30, m = { l: 58, r: 232 };
  const x = linear([start, end], [m.l, W - m.r]), y = linear([0, 1], [bottom, top]);
  parts.push(
    el('rect', { x: m.l, y: y(plant.target + plant.band), width: W - m.r - m.l, height: y(plant.target - plant.band) - y(plant.target + plant.band), fill: t.c('surface') }),
    [0, 0.5, 1].map(v => g({}, el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: v === 0 ? t.c('ink') : t.c('grid'), 'stroke-width': v === 0 ? 1.4 : 1 }),
      textLines([fmt(v, { digits: 1 })], { x: m.l - 10, y: y(v), size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }))),
    textLines(['mg/L'], { x: m.l - 10, y: top - 16, size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') }),
    textLines([`target ±${fmt(plant.band, { digits: 2 })}`], { x: m.l + 8, y: y(plant.target + plant.band) - 6, size: 15, valign: 'bottom', fill: t.c('muted'), weight: 600 }),
    Array.from({ length: (end - start) / 120 + 1 }, (_, k) => start + k * 120).map(v => textLines([clock(v)], { x: x(v), y: bottom + 8, size: 15, anchor: v === start ? 'start' : 'middle', valign: 'top', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } })),
    el('line', { x1: x(jump), x2: x(jump), y1: top - 6, y2: bottom, stroke: t.c('muted'), 'stroke-width': 1.3, 'stroke-dasharray': '4 4' }),
    textLines([`demand jumps ${clock(jump)}`], { x: x(jump) + 8, y: top - 2, size: 15, valign: 'top', fill: t.c('muted'), weight: 600 }));
  for (const run of [calm, eager]) {
    const em = run === eager;
    parts.push(el('path', { d: pathFromPoints(run.out.map(([mm, v]) => [x(mm), y(v)])), fill: 'none', stroke: em ? t.c('accent') : t.c('ink'), 'stroke-width': em ? 2.6 : 2, 'stroke-linejoin': 'round' }));
  }
  // end labels, spread so they never collide
  const ends = spreadLabels([calm, eager].map(run => ({ id: run.name, y: y(run.out.at(-1)[1]), h: 40 })), { min: top, max: bottom, gap: 8 });
  for (const lab of ends) {
    const run = lab.id === 'eager' ? eager : calm, em = run === eager;
    parts.push(el('line', { x1: W - m.r + 4, x2: W - m.r + 12, y1: y(run.out.at(-1)[1]), y2: lab.y, stroke: t.c('rule') }),
      textLines([`gain ${fmt(run.kp, { digits: 1 })}`], { x: W - m.r + 18, y: lab.y - 10, size: 17, valign: 'middle', fill: em ? t.c('accent') : t.c('ink'), weight: 700 }),
      textLines([run.settled ? `within band by ${clock(run.settledAt)}` : `still ±${fmt(run.swing, { digits: 2 })} at ${clock(end)}`], { x: W - m.r + 18, y: lab.y + 11, size: 16, valign: 'middle', fill: t.c('muted') }));
  }
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Chlorine residual control loop and the measured residual at two controller gains',
    desc: `Block diagram: the target is compared with the measured residual; the error drives a PI controller, which sets the hypochlorite dose rate; the dose mixes in the contact tank (${plant.delay} minutes to the outlet) where raw-water demand acts as a disturbance; an analyser measures the residual every minute and feeds it back with a negative sign. Arrows carry signals, not material. Chart: after demand jumps at ${clock(jump)}, gain ${calm.kp} returns within ±${plant.band} mg/L by ${clock(calm.settledAt)}; gain ${eager.kp} keeps oscillating, still ±${fmt(eager.swing, { digits: 2 })} mg/L at ${clock(end)}.` },
  el('defs', {}, arrowMarker(`${id}-arr`, t.c('ink'), { size: 11 })), parts);
}

export default {
  study: true,
  id: 'feedback-loop',
  title: 'Feedback loop: measured signal and corrective action',
  className: 'st cs-physics-lecture',
  notes: 'Purpose: Explain a closed corrective cycle: what is measured, what is compared, what action it changes, and what the measured signal actually did.\nModify: Rename the blocks and signals for your loop; replace `plant`, `demand` and `gains` (or paste measured data into the chart). Settling time, the remaining swing and the headline recompute from the simulation.\nInvariant: Every arrow names the signal it carries; the measured signal and the action it changes are labelled; the feedback sign is shown; a closed loop is not proof of stability, so show the response.\nStatic: Already static. For a build, show the loop first, then the calm response, then the eager one.',
  sources: [{ type: 'original-example', file: 'assets/svg/feedback-loop.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">At <em>gain ${fmt(eager.kp, { digits: 1 })}</em> the loop never settled: chlorine still swung ±${fmt(eager.swing, { digits: 2 })}&nbsp;mg/L ${words[hoursAfter] ?? hoursAfter} hours after the demand jump</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative model · first-order tank, ${plant.lag}-min lag, ${plant.delay}-min transport delay, one-minute PI control</span><span>Block diagram with simulated response</span></p>`,
};
