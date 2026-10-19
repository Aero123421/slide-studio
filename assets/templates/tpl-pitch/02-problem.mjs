// Template: Parwell seed memorandum · Problem. Synthetic example content; replace data and copy.
// One exhibit: share of produce spend thrown away in each audited kitchen, sorted, with the
// median and one kitchen worked through as the example. Headline, median, callout and
// description all derive from `kitchens`.
import { theme, linear, band, axis, el, g, svgRoot, textLines, wrapText, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-pitch-problem';
// Baseline bin audit, four weeks per kitchen before go-live: % of produce purchases (by value) thrown away.
const kitchens = [21.4, 19.8, 18.1, 17.0, 16.2, 15.5, 14.6, 14.1, 13.7, 13.3, 12.9, 12.7,
  12.5, 12.2, 11.8, 11.1, 10.6, 10.2, 9.7, 9.1, 8.4, 7.8, 6.9, 6.1].map((share, i) => ({ id: `k${i + 1}`, share }));
const example = { id: 'k8', seats: 64, city: 'Chicago', spend: 142000,      // USD of produce a year
  binned: 'herbs and salad leaves bought by the case' };
const audit = { months: 'Oct 2025 – Jan 2026', weeks: 4 };

const sorted = [...kitchens].sort((a, b) => b.share - a.share);
const mid = sorted.length / 2;
const median = sorted.length % 2 ? sorted[Math.floor(mid)].share : (sorted[mid - 1].share + sorted[mid].share) / 2;
const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const oneIn = Math.round(100 / median);                       // 12.6% → one dollar in eight
const ex = kitchens.find(k => k.id === example.id);
const exDollars = Math.round(example.spend * ex.share / 100 / 1000) * 1000;
const lo = sorted.at(-1).share, hi = sorted[0].share;
const pct = v => `${fmt(v, { digits: 1 })}%`;

// ---- exhibit geometry (drawn at its slide size: 1152 × 360) ----
const t = theme('css');
const W = 1152, H = 360, box = { x: 56, y: 12, w: W - 56, h: 300 };
const y = linear([0, 25], [box.y + box.h, box.y]);
const x = band(sorted.map(k => k.id), [box.x, box.x + box.w], { inner: 0.32, outer: 0.08 });
const bars = sorted.map(k => el('rect', {
  x: x(k.id), y: y(k.share), width: x.bw, height: y(0) - y(k.share),
  fill: k.id === example.id ? t.c('accent') : t.c('context'),
}));
const medY = y(median), medLabel = `Median ${pct(median)}`;
const exX = x.center(example.id), exY = y(ex.share);
const note = [`A ${example.seats}-seat bistro in ${example.city} binned ${pct(ex.share)} of its produce:`,
  `about $${fmt(exDollars)} of the $${fmt(example.spend)} it buys a year,`,
  `mostly ${example.binned}.`];
const noteX = x(sorted[12].id), noteY = 58;                    // above the shorter half of the bars
const figure = svgRoot({
  id: `${ID}-fig`, width: W, height: H, theme: t,
  title: 'Share of produce spend thrown away in each of 24 audited kitchens',
  desc: `Sorted from ${pct(hi)} to ${pct(lo)}; median ${pct(median)}. Highlighted: a ${example.seats}-seat bistro at ${pct(ex.share)}, about $${fmt(exDollars)} a year.`,
},
  axis(y, { orient: 'left', at: box.x, grid: [box.x, box.x + box.w], tickValues: [0, 5, 10, 15, 20, 25], format: v => `${v}%`, size: 16, theme: t }),
  g({}, bars),
  el('line', { x1: box.x, x2: box.x + box.w, y1: medY, y2: medY, stroke: t.c('ink'), 'stroke-width': 1.5, 'stroke-dasharray': '6 5' }),
  textLines([medLabel], { x: box.x + box.w, y: medY - 9, size: 17, anchor: 'end', weight: 600, fill: t.c('ink'), halo: t.c('paper') }),
  el('path', { d: `M${exX} ${exY - 6}V${noteY - 6}H${noteX - 12}`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.2 }),
  textLines(note, { x: noteX, y: noteY, size: 17, lineHeight: 1.41, fill: t.c('ink') }),
  textLines([`${kitchens.length} kitchens, sorted from most to least`], { x: box.x, y: box.y + box.h + 30, size: 16, fill: t.c('muted') }),
);

export default {
  study: true,
  id: ID,
  title: 'Problem: produce thrown away per kitchen',
  notes: `Purpose: Size the customer problem with evidence the investor can check, and make it concrete with one real kitchen.\nModify: Replace \`kitchens\` with your own audit (one value per customer or interviewee) and \`example\` with one of them; the headline fraction, median line, callout and description recompute.\nInvariant: Bars start at zero and are sorted; the median is computed, not typed; exactly one bar is highlighted and it is the one the callout describes; the source line says how the data was collected.\nStatic: Already static.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-pitch pp-problem',
  content: `<div class="pp-run"><span>Parwell — Seed memorandum, October 2026</span><span>2</span></div>
<h1 class="pp-head" data-region="title">Independent kitchens throw away one dollar in ${words[oneIn] ?? oneIn} of the produce they buy</h1>
<p class="pp-ex" data-region="support"><b>Exhibit 1</b>Produce thrown away as a share of produce bought, by value, per kitchen</p>
<figure class="pp-prob-fig" data-region="primary">${figure}</figure>
<p class="pp-source" data-region="source">Source: Parwell bin audits of ${kitchens.length} independent kitchens before go-live, ${audit.months}; ${audit.weeks} weeks each, produce weighed and priced at invoice cost.</p>`,
};
