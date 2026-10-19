// Template: Quire visual essay · Timeline. Synthetic example content; replace data and copy.
// Two rows, each a linear time scale of the same width. Row 1 is the whole journey from tree
// to cup; row 2 is its last minute, magnified. The pour is a rust sliver too thin to draw in
// row 1 and nearly half of row 2. Every position, the magnification and the headline ratio
// are computed from `journey` and `lastMinute`.
import { theme, el, g, svgRoot, textLines, measureText, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-editorial-timeline';
const journey = [                                     // days; a washed lot from Huila, Colombia
  { name: 'Picking and washing', short: 'Picking', days: 3 },
  { name: 'Drying', days: 21 },
  { name: 'Resting in parchment', short: 'Resting', days: 40 },
  { name: 'Milling and shipping', days: 70 },
  { name: 'Waiting at the roaster', days: 73 },
  { name: 'Roasting and resting', days: 10 },
];
const lastMinute = [                                  // seconds; the minute before the cup is served
  { name: 'Grinding', s: 10 },
  { name: 'Dosing and tamping', s: 15 },
  { name: 'The pour', s: 28, pour: true },
  { name: 'Served', s: 7 },
];
const DAY = 86400;
const totalDays = journey.reduce((s, j) => s + j.days, 0);
const minute = lastMinute.reduce((s, m) => s + m.s, 0);
const pour = lastMinute.find(m => m.pour).s;
const perSecond = totalDays / pour;                   // days of waiting per second of pouring
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const ratio = perSecond % 1 >= 0.5 ? `almost ${words[Math.ceil(perSecond)]}` : `more than ${words[Math.floor(perSecond)]}`;
const months = Math.round(totalDays / 30.44);

// ---- geometry: figure is 1104 × 300, drawn at slide size; bars span columns 3–12 ----
const t = theme('css');
const W = 1104, X0 = 188, BW = W - X0, BH = 56, GAP = 2;
const R1 = 56, R2 = 212;                              // top of row 1 and row 2 bars
const s1 = BW / (totalDays * DAY), s2 = BW / minute; // px per second in each row
const magnify = Math.round(s2 / s1 / 1000) * 1000;
const pourPx1 = pour * s1;                            // width of the pour drawn at row-1 scale
const fits = (w, lines) => Math.max(...lines.map((l, i) => measureText(l, 16, { weight: i ? 400 : 600 }))) + 20 <= w;

function row(items, y, scale, seconds) {
  let acc = 0;
  return items.map(it => {
    const x0 = X0 + acc * scale, w = seconds(it) * scale; acc += seconds(it);
    const dur = it.days != null ? `${it.days} days` : `${it.s} s`;
    const label = fits(w, [it.name, dur]) ? it.name : it.short && fits(w, [it.short, dur]) ? it.short : null;
    const rect = el('rect', { x: x0 + GAP / 2, y, width: Math.max(1, w - GAP), height: BH, fill: it.pour ? t.c('accent') : 'var(--ed-tint)' });
    const ink = it.pour ? '#FFFFFF' : t.c('ink');
    const inside = label ? textLines([label], { x: x0 + 10, y: y + 23, size: 16, weight: 600, fill: ink })
      + textLines([dur], { x: x0 + 10, y: y + 44, size: 16, fill: it.pour ? '#FFFFFF' : 'var(--ed-grey-on-tint)' }) : '';
    return { rect, inside, x0, w, it, dur, outside: !label };
  });
}
const r1 = row(journey, R1, s1 * DAY, j => j.days);
const r2 = row(lastMinute, R2, s2, m => m.s);
// Stages too narrow for an inside label get one above the bar, from whichever end is nearer.
const outside = r1.filter(r => r.outside).map(r => {
  const atEnd = r.x0 + r.w > X0 + BW / 2, x = atEnd ? X0 + BW : r.x0;
  return el('line', { x1: r.x0 + r.w / 2, x2: r.x0 + r.w / 2, y1: R1 - 14, y2: R1, stroke: t.c('ink'), 'stroke-width': 1 })
    + textLines([`${r.it.name}, ${r.dur}`], { x, y: R1 - 22, size: 16, anchor: atEnd ? 'end' : 'start', fill: t.c('ink') });
});
const end1 = X0 + BW;
const figure = svgRoot({
  id: `${ID}-fig`, width: W, height: 300, theme: t,
  title: `From tree to cup in ${totalDays} days, and the last minute magnified`,
  desc: `${journey.map(j => `${j.name} ${j.days} days`).join(', ')}. The last minute, magnified ${fmt(magnify)} times: ${lastMinute.map(m => `${m.name.toLowerCase()} ${m.s} seconds`).join(', ')}. At the scale of the first row the pour would be ${fmt(pourPx1, { digits: 4 })} px wide.`,
},
  // the magnifier: the last minute of row 1 opens out into the whole of row 2
  el('path', { d: `M${end1} ${R1 + BH + 4}L${X0} ${R2 - 6}H${end1}Z`, fill: 'var(--ed-tint)', 'fill-opacity': 0.45 }),
  el('path', { d: `M${end1} ${R1 + BH + 4}L${X0} ${R2 - 6}M${end1} ${R1 + BH + 4}V${R2 - 6}`, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1 }),
  g({}, r1.map(r => r.rect)), g({}, r1.map(r => r.inside)), outside.join(''),
  // where the pour sits in row 1: a marker, not a mark of its width (that is the point of the note)
  el('line', { x1: end1 - 1, x2: end1 - 1, y1: R1 - 10, y2: R1 + BH + 4, stroke: t.c('accent'), 'stroke-width': 3 }),
  g({}, r2.map(r => r.rect)), g({}, r2.map(r => r.inside)),
  textLines(['Tree to cup'], { x: 0, y: R1 + 23, size: 16, fill: t.c('ink'), weight: 600 }),
  textLines([`${totalDays} days`], { x: 0, y: R1 + 44, size: 16, fill: t.c('muted') }),
  textLines(['The last minute'], { x: 0, y: R2 + 23, size: 16, fill: t.c('ink'), weight: 600 }),
  textLines([`magnified ${fmt(magnify)}×`], { x: 0, y: R2 + 44, size: 16, fill: t.c('muted') }),
  textLines(['0 s'], { x: X0, y: R2 + BH + 24, size: 15, fill: t.c('muted') }),
  textLines([`${minute} s`], { x: end1, y: R2 + BH + 24, size: 15, anchor: 'end', fill: t.c('muted') }),
);

export default {
  study: true,
  id: ID,
  title: 'Proportional timeline: months of waiting, seconds of pouring',
  notes: `Purpose: Make a contrast of scale felt: ${months} months of waiting against a ${pour}-second pour, without a log scale that hides it.\nModify: Edit \`journey\` (days per stage, in order) and \`lastMinute\` (seconds, one item marked pour). Stage widths, inside/outside labels, the magnification factor, the headline ratio and the closing note recompute.\nInvariant: Both rows are linear and the same width; row 2 is exactly the last minute of row 1; only the pour is rust; durations are labelled on the marks; the source says the values are typical, not measured.\nStatic: Already static.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-editorial ed-timeline',
  content: `<h1 class="ed-tl-head ed-head" data-region="title">The coffee waited ${ratio} days for every second of the pour</h1>
<figure class="ed-tl-fig" data-region="primary">${figure}</figure>
<div class="ed-tl-note" data-region="support">
  <p class="ed-body">Drawn to the scale of the top line, the ${pour}-second pour would be ${fmt(pourPx1, { digits: 4 })} pixels wide.</p>
  <p class="ed-note">Typical durations for a washed coffee from Huila, Colombia, roasted in northern Europe; they vary by farm, process and roaster.</p>
</div>
<p class="ed-folio" data-region="source"><span>Quire, Winter 2026</span><span>41</span></p>`,
};
