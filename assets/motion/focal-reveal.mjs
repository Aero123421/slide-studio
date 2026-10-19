// Motion study · Reveal the focal subject — one school's line first, then the 23 schools
// it is compared with, then the ranks that make the claim. Builds: 1 context, 2 ranks.
// Every value on the page (ranks, median, headline) is computed from `schools`.
import { svgRoot, el, g, linear, axis, textLines, pathFromPoints, spreadLabels, niceDomain, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
// Year 6 pupils reading at the expected standard, % (illustrative district of 24 primary schools)
const subject = { name: 'Hollins Park', values: [50, 53, 56, 58, 64, 70, 75, 82] };
const others = [
  ['Ashgrove', [64, 64, 62, 61, 63, 63, 62, 63]], ['Birchfield', [58, 57, 59, 56, 57, 58, 60, 59]],
  ['Carrow Lane', [80, 81, 79, 80, 78, 79, 78, 81]], ['Dunmore', [57, 59, 55, 52, 54, 55, 55, 51]],
  ['Elm Bank', [59, 62, 63, 57, 66, 66, 65, 65]], ['Fairholme', [68, 66, 65, 63, 66, 65, 65, 65]],
  ['Glebe Road', [77, 81, 84, 80, 87, 86, 87, 90]], ['Hartwell', [73, 74, 74, 69, 73, 72, 69, 73]],
  ['Ivy Lane', [54, 57, 59, 52, 57, 60, 62, 57]], ['Juniper Hill', [60, 60, 57, 56, 60, 58, 56, 59]],
  ['Kingsmead', [80, 83, 84, 80, 86, 83, 88, 87]], ['Larchwood', [66, 66, 67, 63, 65, 65, 65, 64]],
  ['Millbrook', [61, 59, 58, 55, 58, 60, 61, 61]], ['Northgate', [83, 84, 86, 83, 86, 85, 90, 87]],
  ['Oakfield', [70, 70, 65, 64, 69, 68, 68, 69]], ['Priory Fields', [78, 76, 79, 77, 81, 77, 81, 78]],
  ['Queensway', [61, 62, 64, 60, 62, 60, 61, 66]], ['Riverside', [83, 86, 86, 86, 86, 88, 92, 91]],
  ['Thornbury', [76, 76, 78, 71, 77, 79, 80, 80]], ['Upton Vale', [77, 81, 83, 79, 84, 86, 89, 86]],
  ['Westfield', [62, 60, 60, 62, 68, 65, 64, 65]], ['Wren Park', [84, 80, 83, 81, 83, 86, 84, 86]],
  ['Yarrow', [58, 61, 58, 57, 65, 64, 64, 67]],
].map(([name, values]) => ({ name, values }));

// Derived: rank of the subject in the first and last year, district median per year.
const all = [subject, ...others];
const rankIn = i => 1 + others.filter(s => s.values[i] > subject.values[i]).length;
const first = rankIn(0), last = rankIn(years.length - 1);
const median = years.map((_, i) => { const v = all.map(s => s.values[i]).sort((a, b) => a - b), m = v.length / 2; return v.length % 2 ? v[m | 0] : (v[m - 1] + v[m]) / 2; });
const ordinal = k => k + (['th', 'st', 'nd', 'rd'][(k % 100 > 10 && k % 100 < 14) ? 0 : k % 10] || 'th');
const rankText = k => (k === all.length ? 'last' : ordinal(k));

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 58, r: 196, t: 46, b: 40 };
  const x = linear([years[0], years.at(-1)], [m.l, W - m.r]);
  const lo = Math.min(...all.flatMap(s => s.values)), hi = Math.max(...all.flatMap(s => s.values));
  const y = linear(niceDomain([lo - 8, hi], 5), [H - m.b, m.t]); // room under the lowest start for its label
  const pts = s => s.values.map((v, i) => [x(years[i]), y(v)]);
  const end = [x(years.at(-1)), y(subject.values.at(-1))], start = [x(years[0]), y(subject.values[0])];
  const byLast = [...others].sort((a, b) => b.values.at(-1) - a.values.at(-1)); // stagger from the top of the pack down
  const ends = spreadLabels([{ id: 's', y: end[1], h: 46 }, { id: 'm', y: y(median.at(-1)), h: 22 }], { min: m.t, max: H - m.b, gap: 6 });
  const ly = id => ends.find(e => e.id === id).y;
  return svgRoot({ id: 'motion-focal-reveal-fig', width: W, height: H, theme: t,
    title: `Share of Year 6 pupils reading at the expected standard, ${years[0]}–${years.at(-1)}: ${subject.name} and ${others.length} other district schools`,
    desc: `${subject.name} rose from ${subject.values[0]}% to ${subject.values.at(-1)}%, from ${rankText(first)} to ${rankText(last)} of ${all.length} schools. The district median moved from ${median[0]}% to ${median.at(-1)}%.` },
  axis(y, { orient: 'left', at: m.l, grid: [m.l, W - m.r], theme: t, size: 16, format: { suffix: '%' }, count: 5 }),
  textLines(['Year 6 pupils reading at the expected standard'], { x: 0, y: 4, size: 16, fill: t.c('muted'), valign: 'top' }),
  years.map(yr => textLines([String(yr)], { x: x(yr), y: H - m.b + 14, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') })),
  // Build 1 — the context arrives behind the subject, quietly, top of the pack first.
  g({ 'data-step': 1, 'data-motion': 'reveal', 'data-stagger': 24, 'data-duration': 420 },
    byLast.map(s => el('path', { d: pathFromPoints(pts(s)), fill: 'none', stroke: t.c('context'), 'stroke-width': 1.8, 'stroke-linejoin': 'round' }))),
  textLines([`${others.length} other schools in the district`], { x: x(2019) + 6, y: y(Math.max(...others.map(s => s.values[1]))) - 16, size: 16, fill: t.c('muted'), weight: 600, halo: t.c('paper'), attrs: { 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 500 } }),
  // Build 2 — the district median and the two ranks that carry the claim.
  g({ 'data-step': 2, 'data-motion': 'draw', 'data-duration': 800 },
    el('path', { d: pathFromPoints(median.map((v, i) => [x(years[i]), y(v)])), fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.6, 'stroke-dasharray': '6 5' })),
  textLines([`District median ${fmt(median.at(-1))}%`], { x: W - m.r + 16, y: ly('m'), size: 16, valign: 'middle', fill: t.c('ink'), weight: 600, attrs: { 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 600 } }),
  // The subject: present from the first build, always on top.
  el('path', { d: pathFromPoints(pts(subject)), fill: 'none', stroke: t.c('accent'), 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }),
  [start, end].map(([cx, cy]) => el('circle', { cx, cy, r: 6.5, fill: t.c('accent'), stroke: t.c('paper'), 'stroke-width': 2.5 })),
  textLines([`${subject.name}  ${subject.values.at(-1)}%`], { x: W - m.r + 16, y: ly('s') - 11, size: 18, valign: 'middle', fill: t.c('accent'), weight: 700 }),
  textLines([`${ordinal(last)} of ${all.length} schools`], { x: W - m.r + 16, y: ly('s') + 13, size: 16, valign: 'middle', fill: t.c('accent'), attrs: { 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 250 } }),
  textLines([`${subject.values[0]}%, ${rankText(first)} of ${all.length}`], { x: start[0] + 12, y: start[1] + 28, size: 16, fill: t.c('accent'), weight: 600, halo: t.c('paper'), attrs: { 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 100 } }));
}

export default {
  study: true,
  id: 'motion-focal-reveal',
  title: 'Focal reveal: subject first, then its context',
  className: 'st cs-classroom-bright',
  notes: `Purpose: Introduce the subject before context competes with it: one line alone, then the comparison set behind it, then the ranks that make the claim.\nModify: Replace \`subject\` and \`others\` (same years). Ranks, the median and the headline recompute; the context staggers from the top of the pack down.\nInvariant: The subject keeps the only accent and stays on top; context arrives in grey behind it and is never removed; ranks are computed, not typed.\nStatic: The final build shows the subject, all ${others.length} context lines, the median and both ranks.`,
  sources: [{ type: 'original-example', file: 'assets/motion/focal-reveal.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head"><em>${subject.name}</em> climbed from ${rankText(first)} of ${all.length} district schools to ${ordinal(last)} in reading</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · ${all.length} primary schools, end-of-year assessments ${years[0]}–${years.at(-1)}</span><span>Motion · subject first, then context and ranks (2 builds)</span></p>`,
};
