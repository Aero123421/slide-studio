// Composition study · Evidence primary — the chart takes three quarters of the width (828 px),
// the rail takes the rest (276 px) and holds only what the chart cannot say: one number and
// its limit. Rows, marks, the headline range and the rail text are computed from `corridors`.
import { svgRoot, el, g, textLines, linear, measureText, theme as makeTheme, fmt, mean } from '../runtime/figure.mjs';

const ID = 'composition-evidence-primary';
const corridors = [ // change in median weekday peak journey time, minutes, Oct 2025 vs Oct 2024, 90% bootstrap interval (illustrative)
  { name: 'Mill Lane', laneKm: 3.1, est: -5.6, low: -7.1, high: -4.2 },
  { name: 'Northgate Road', laneKm: 2.4, est: -4.8, low: -6.0, high: -3.6 },
  { name: 'Riverside', laneKm: 2.0, est: -3.4, low: -4.6, high: -2.3 },
  { name: 'Harbour Way', laneKm: 1.9, est: -3.9, low: -5.1, high: -2.6 },
  { name: 'Station Avenue', laneKm: 1.2, est: -2.1, low: -3.3, high: -0.9 },
  { name: 'Castle Street', laneKm: 0.6, est: -0.4, low: -1.5, high: 0.7 },
  { name: 'Kingsmead', laneKm: 0.5, est: 0.3, low: -0.9, high: 1.5 },
];
const minLane = 1; // km — the lane length the claim turns on

// derived values used by the headline and the rail
const rows = [...corridors].sort((a, b) => b.laneKm - a.laneKm);
const long = rows.filter(c => c.laneKm > minLane), short = rows.filter(c => c.laneKm <= minLane);
const saving = long.map(c => -c.est);
const fewest = Math.round(Math.min(...saving)), most = Math.round(Math.max(...saving));
const avg = mean(long.map(c => c.est));
const includesZero = c => c.low <= 0 && c.high >= 0;
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];
const min1 = v => fmt(v, { digits: 1, sign: true });
const km = v => `${fmt(v, { digits: 1 })} km`;
const andList = list => (list.length < 2 ? list.join('') : `${list.slice(0, -1).join(', ')} and ${list.at(-1)}`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 828, H = 470;
  const top = 50, bottom = 58, gap = 40; // header, axis, break between the two groups
  const nameW = Math.max(...rows.map(c => measureText(c.name, 18, { weight: 600 })));
  const laneW = Math.max(...rows.map(c => measureText(km(c.laneKm), 17)));
  const laneX = nameW + 18 + laneW; // right edge of the lane-length column
  const x = linear([-8, 2], [laneX + 40, W - 92]); // the last 92 px hold the value column
  const rowH = (H - top - bottom - gap) / rows.length;
  const yOf = i => top + rowH * (i + 0.5) + (i >= long.length ? gap : 0);
  const ticks = [-8, -6, -4, -2, 0, 2];
  const plotTop = top - 8, plotBottom = H - bottom + 6;
  const parts = [];
  // header: what each column is
  parts.push(textLines(['Corridor'], { x: 0, y: 20, size: 16, fill: t.c('muted'), weight: 600 }));
  parts.push(textLines(['Lane'], { x: laneX, y: 20, size: 16, anchor: 'end', fill: t.c('muted'), weight: 600 }));
  parts.push(textLines(['Change in median peak journey time'], { x: x(-8), y: 20, size: 16, fill: t.c('muted'), weight: 600 }));
  parts.push(textLines(['Minutes'], { x: W, y: 20, size: 16, anchor: 'end', fill: t.c('muted'), weight: 600 }));
  // grid, zero line and ticks
  for (const v of ticks) {
    parts.push(el('line', { x1: x(v), x2: x(v), y1: plotTop, y2: plotBottom, stroke: v === 0 ? t.c('ink') : t.c('grid'), 'stroke-width': v === 0 ? 1.6 : 1 }));
    parts.push(textLines([v === 0 ? '0' : fmt(v, { sign: true })], { x: x(v), y: plotBottom + 10, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  }
  parts.push(textLines(['← faster'], { x: x(0) - 10, y: plotBottom + 40, size: 16, anchor: 'end', fill: t.c('muted') }));
  parts.push(textLines(['slower →'], { x: x(0) + 10, y: plotBottom + 40, size: 16, fill: t.c('muted') }));
  // break between lanes over and under the threshold
  const breakY = top + rowH * long.length + gap / 2;
  parts.push(el('line', { x1: 0, x2: W, y1: breakY, y2: breakY, stroke: t.c('rule'), 'stroke-width': 1 }));
  parts.push(textLines([`Lanes of ${fmt(minLane)} km or less`], { x: 0, y: breakY + 6, size: 15, valign: 'top', fill: t.c('muted') }));
  rows.forEach((c, i) => {
    const y = yOf(i), strong = c.laneKm > minLane;
    const hollow = includesZero(c);
    parts.push(textLines([c.name], { x: 0, y, size: 18, valign: 'middle', fill: strong ? t.c('ink') : t.c('muted'), weight: 600 }));
    parts.push(textLines([km(c.laneKm)], { x: laneX, y, size: 17, anchor: 'end', valign: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
    parts.push(g({ class: 'cmp-ep-row' },
      el('line', { x1: x(c.low), x2: x(c.high), y1: y, y2: y, stroke: strong ? t.seq(1) : t.c('context'), 'stroke-width': 12, 'stroke-linecap': 'round' }),
      el('circle', { cx: x(c.est), cy: y, r: 7.5, fill: hollow ? t.c('paper') : t.c('accent'), stroke: hollow ? t.c('muted') : t.c('paper'), 'stroke-width': hollow ? 2.4 : 2 }),
      textLines([min1(c.est)], { x: W, y, size: 18, anchor: 'end', valign: 'middle', fill: strong ? t.c('ink') : t.c('muted'), weight: strong ? 650 : 400, attrs: { 'font-variant-numeric': 'tabular-nums' } })));
  });
  return svgRoot({ id: `${ID}-fig`, width: W, height: H, theme: t,
    title: 'Change in median weekday peak bus journey time after bus lanes opened, by corridor, with 90% intervals',
    desc: `Rows are sorted by lane length. The ${words[long.length]} corridors with lanes longer than ${minLane} km are ${fewest} to ${most} minutes faster and their intervals exclude zero; ${andList(short.map(c => `${c.name} (${km(c.laneKm)})`))} show no clear change.` },
  parts);
}

export default {
  study: true,
  id: ID,
  title: 'Evidence primary: the chart takes three quarters of the width, the claim and its limit a narrow rail',
  className: `st cs-civic-calm cmp-evidence-primary`,
  notes: 'Purpose: Use when one exhibit carries the argument and the words only point at it: a result with uncertainty, a trend, a ranking. The evidence is the optical primary; the headline states what it shows; the rail adds only what the chart cannot say (one summary number and the limit of the claim).\nModify: Replace `corridors` (estimate, interval, the explanatory variable) and `minLane`; the sort, the break between groups, the headline range, the rail number and the named exceptions recompute. Keep the rail to one number and one or two sentences; if it needs more, the claim is not ready.\nInvariant: 3 : 1 split of the 1152 px measure (828 px evidence, 48 px gap, 276 px rail); the figure is drawn at its region size so labels are true 16–18 px; intervals stay on the same row as their estimates; rows that do not support the claim are shown in context grey, not removed.\nStatic: Already static. For a talk, a build can reveal the short-lane rows after the claim, but the final state must show all rows.',
  sources: [{ type: 'original-example', file: `assets/compositions/${ID}.mjs` }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" data-region="title">Peak bus trips are ${fewest}–${most}&nbsp;minutes faster where the new lane runs longer than ${minLane}&nbsp;km</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b class="st-accent">${fmt(avg, { digits: 1 })}&nbsp;min</b><span>Average change on the ${words[long.length]} corridors with lanes over ${minLane}&nbsp;km.</span></div>
  <hr class="st-rule">
  <p class="st-text">${andList(short.map(c => c.name))} lanes are ${andList(short.map(c => fmt(c.laneKm, { digits: 1 })))}&nbsp;km long. ${short.length === 2 ? 'Both' : 'All'} end before the junction queue, and their intervals include no change.</p>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · bus location records, weekday departures 07:30–09:00, October 2024 against October 2025</span><span>Evidence primary · dot and 90% interval</span></p>`,
};
