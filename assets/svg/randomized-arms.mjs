// Diagram study · Randomized arms — enrolment, a named randomization step, two parallel arms, one outcome.
// Every count, rate and the difference with its interval are computed from `screened`, `exclusions`
// and `arms`; the layout puts both arms on the same x positions so the comparison reads across.
import { svgRoot, el, g, textLines, linear, theme as makeTheme, fmt, sum, normalQuantile, arrowMarker, measureNode, drawNode, roundedPolyline, edgeLabel } from '../runtime/figure.mjs';

const screened = 1204; // adults due a second dose, assessed for eligibility (illustrative)
const exclusions = [
  { reason: 'series already complete', n: 212 },
  { reason: 'no mobile number', n: 109 },
  { reason: 'declined consent', n: 67 },
];
const allocation = { ratio: '1:1', method: 'computer-generated list', blocks: 4, strata: 'clinic' };
const outcome = 'Second dose within 42 days';
const arms = [ // completed = had the second dose by day 42, among those followed up
  { name: 'Text reminders', sub: 'SMS on days 21, 25, 28', allocated: 408, lost: 21, completed: 275 },
  { name: 'Usual care', sub: 'appointment card only', allocated: 408, lost: 26, completed: 221 },
];

// Derived numbers: the page never retypes them.
const excluded = sum(exclusions.map(e => e.n)), randomized = screened - excluded;
if (sum(arms.map(a => a.allocated)) !== randomized) throw Error('randomized-arms: arms must add up to the randomized total');
const rows = arms.map(a => ({ ...a, analysed: a.allocated - a.lost, rate: a.completed / (a.allocated - a.lost) }));
const [A, B] = rows, diff = A.rate - B.rate;
const se = Math.sqrt(A.rate * (1 - A.rate) / A.analysed + B.rate * (1 - B.rate) / B.analysed), z = normalQuantile(0.975);
const ci = [diff - z * se, diff + z * se];
const pts = v => fmt(v * 100, { digits: 1 });
const n = v => fmt(v, { digits: 0 });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'randomized-arms-fig', ctx = { t, size: 17 };
  const mid = 232, laneY = [mid - 124, mid + 124];
  const node = (spec, x, cy, maxWidth = 230) => { const m = measureNode(spec, { size: 17, maxWidth, minWidth: 150 }); return { ...m, x, y: cy - m.h / 2 }; };
  const scr = node({ id: 'scr', label: 'Assessed for eligibility', sub: `n = ${n(screened)}` }, 0, mid, 180);
  // How allocation was done is printed on the randomization node itself: an arrow alone proves nothing.
  const rnd = node({ id: 'rnd', label: `Randomized ${allocation.ratio}`, sub: `n = ${n(randomized)}\n${allocation.method},\nblocks of ${allocation.blocks}, by ${allocation.strata}`, strokeWidth: 2.5, stroke: t.c('ink') }, 236, mid, 220);
  const armX = rnd.x + rnd.w + 64;
  const alloc0 = rows.map((a, k) => node({ id: `arm${k}`, label: a.name, sub: `${n(a.allocated)} allocated\n${a.sub}` }, armX, laneY[k], 236));
  const armW = Math.max(...alloc0.map(a => a.w)), alloc = alloc0.map(a => ({ ...a, w: armW }));  // parallel arms, equal boxes
  const right = p => [p.x + p.w, p.y + p.h / 2];
  const line = (pts, o = {}) => el('path', { d: roundedPolyline(pts, 12), fill: 'none', stroke: o.stroke || t.c('muted'), 'stroke-width': o.w || 1.8, 'marker-end': o.end === false ? null : `url(#${id}-arr)` });

  // Exclusions box hangs off the enrolment line: the count and its reasons, numbers right-aligned.
  const ex = { x: 24, y: mid + 92, w: 206 }, exRow = 24;
  ex.h = 44 + exclusions.length * exRow + 8;
  const exBox = g({},
    el('rect', { x: ex.x, y: ex.y, width: ex.w, height: ex.h, rx: 8, fill: t.c('paper'), stroke: t.c('rule'), 'stroke-width': 1.5 }),
    textLines([`Excluded  ${n(excluded)}`], { x: ex.x + 14, y: ex.y + 24, size: 17, valign: 'middle', weight: 700, fill: t.c('ink') }),
    exclusions.map((e, k) => g({},
      textLines([n(e.n)], { x: ex.x + 50, y: ex.y + 54 + k * exRow, size: 15, anchor: 'end', valign: 'middle', fill: t.c('ink'), attrs: { 'font-variant-numeric': 'tabular-nums' } }),
      textLines([e.reason], { x: ex.x + 60, y: ex.y + 54 + k * exRow, size: 15, valign: 'middle', fill: t.c('muted') }))));
  const branchX = (scr.x + scr.w + rnd.x) / 2;

  // Outcome bars: same 0–100% scale for both arms, aligned with their lanes.
  const bx = 900, x = linear([0, 1], [bx, bx + 180]);
  const bars = rows.map((a, k) => {
    const hl = k === 0, y = laneY[k], h = 30;
    return g({},
      el('rect', { x: bx, y: y - h / 2, width: x(a.rate) - bx, height: h, rx: 3, fill: hl ? t.c('accent') : t.c('context') }),
      el('rect', { x: bx, y: y - h / 2, width: x(1) - bx, height: h, rx: 3, fill: 'none', stroke: t.c('rule'), 'stroke-width': 1 }),
      textLines([`${fmt(a.rate * 100, { digits: 0 })}%`], { x: x(1) + 10, y, size: 24, valign: 'middle', weight: 700, fill: hl ? t.c('accent') : t.c('ink') }),
      textLines([`${n(a.completed)} of ${n(a.analysed)} followed up`], { x: bx, y: y + h / 2 + 10, size: 15, valign: 'top', fill: t.c('muted') }));
  });

  const parts = [
    // enrolment → randomization, with the exclusion branch
    line([right(scr), [rnd.x - 3, mid]]),
    line([[branchX, mid], [branchX, ex.y - 3]]),
    exBox,
    // randomization → each arm (elbows), arm → outcome (losses named above the lane line)
    ...alloc.map((a, k) => line([right(rnd), [rnd.x + rnd.w + 32, mid], [rnd.x + rnd.w + 32, laneY[k]], [a.x - 3, laneY[k]]])),
    ...alloc.map((a, k) => line([right(a), [bx - 12, laneY[k]]], { end: false })),
    ...rows.map((a, k) => textLines([`${a.lost} lost to follow-up`], { x: alloc[k].x + alloc[k].w + 12, y: laneY[k] - 10, size: 15, valign: 'bottom', fill: t.c('muted') })),
    drawNode(scr, ctx), drawNode(rnd, ctx), ...alloc.map(a => drawNode(a, ctx)),
    textLines([outcome], { x: bx, y: 6, size: 16, valign: 'top', weight: 700, fill: t.c('ink') }),
    textLines(['Share of each arm, one scale'], { x: bx, y: 30, size: 15, valign: 'top', fill: t.c('muted') }),
    ...bars,
    // the comparison itself, between the two bars
    textLines([`+${pts(diff)} points`], { x: bx, y: mid - 12, size: 22, valign: 'middle', weight: 700, fill: t.c('accent') }),
    textLines([`95% CI ${pts(ci[0])} to ${pts(ci[1])}`], { x: bx, y: mid + 16, size: 15, valign: 'middle', fill: t.c('muted') }),
  ];
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Randomized trial flow: text reminders versus usual care for second-dose completion',
    desc: `${n(screened)} adults assessed, ${n(excluded)} excluded, ${n(randomized)} randomized ${allocation.ratio} by a ${allocation.method} in blocks of ${allocation.blocks}, stratified by ${allocation.strata}. ${A.name}: ${n(A.completed)} of ${n(A.analysed)} completed (${pts(A.rate)}%). ${B.name}: ${n(B.completed)} of ${n(B.analysed)} (${pts(B.rate)}%). Difference ${pts(diff)} percentage points, 95% CI ${pts(ci[0])} to ${pts(ci[1])}. Arrows show the flow of participants.` },
  el('defs', {}, arrowMarker(`${id}-arr`, t.c('muted'))), parts);
}

export default {
  study: true,
  id: 'randomized-arms',
  title: 'Randomized arms: assignment and parallel comparison',
  className: 'st cs-clinical-trial',
  notes: 'Purpose: Show how participants were assigned and compare the two arms in parallel, so the audience sees both the mechanism and the result.\nModify: Replace `screened`, `exclusions`, `allocation` and `arms`; counts, rates, the difference and its Wald 95% interval recompute. The arms must add up to the randomized total (the module throws otherwise).\nInvariant: Only call the step "Randomized" when allocation really was random, and print the mechanism under it; both arms share x positions and one outcome scale; losses to follow-up are named on each lane.\nStatic: Already static. For a build, reveal enrolment, then the arms, then the outcome bars.',
  sources: [{ type: 'original-example', file: 'assets/svg/randomized-arms.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Text reminders lifted second-dose completion by <em>${pts(diff)}&nbsp;points</em> in a randomized trial of ${n(randomized)} adults</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · ${outcome.toLowerCase()}, among participants followed up</span><span>Randomized flow diagram</span></p>`,
};
