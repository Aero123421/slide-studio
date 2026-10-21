// Diagram study · Unit array — an absolute count drawn as one mark per person, so it can be counted.
// One row per travel mode; the total, the shares and the headline are computed from `deaths`.
import { unitChart, el, g, textLines, measureText, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const year = 2025, previous = { year: 2024, total: 26 };
const deaths = [ // people killed on city roads in 2025, by how they were travelling (illustrative); 1 dot = 1 person
  { label: 'Walking', count: 14, as: 'walking' },
  { label: 'Motorcycle', count: 7, as: 'riding motorcycles' },
  { label: 'In a car', count: 5, as: 'in cars' },
  { label: 'Cycling', count: 4, as: 'cycling' },
  { label: 'Van or bus', count: 1, as: 'in vans or buses' },
];
const olderWalkers = 9; // of those walking, aged 70 or over
const total = deaths.reduce((s, d) => s + d.count, 0);
const most = [...deaths].sort((a, b) => b.count - a.count)[0];
const radius = 17, gap = 9, width = 800;
const labelCol = Math.max(...deaths.map(d => measureText(d.label, 17, { weight: 700 }))) + 26;
const perRow = Math.min(Math.max(...deaths.map(d => d.count)), Math.floor((width - labelCol) / (2 * radius + gap))); // one row per group while it fits, so rows compare like bars

export function figure(theme = 'css') {
  const t = makeTheme(theme), cell = 2 * radius + gap;
  const H = 10 + deaths.reduce((s, d) => s + Math.max(Math.ceil(d.count / perRow) * cell, 17 * 2.6) + 26, 0) + 24; // rows + key, from the data
  return unitChart({
    id: 'unit-array-fig', theme, width, height: H, fontSize: 16,
    title: `People killed on city roads in ${year}, one dot per person, by travel mode`,
    desc: `${total} people died. ${deaths.map(d => `${d.label}: ${d.count}`).join('; ')}. Each dot is one person.`,
    groups: deaths.map(d => ({ ...d, highlight: d === most })), perRow, radius, gap, groupGap: 26,
    extra: () => g({ class: 'ss-key' },
      el('circle', { cx: 9, cy: H - 12, r: 8, fill: t.c('context') }),
      textLines(['= one person'], { x: 24, y: H - 12, size: 15, valign: 'middle', fill: t.c('muted') })),
  });
}

export default {
  study: true,
  id: 'unit-array',
  title: 'Unit array: an absolute count you can inspect',
  className: 'st st--left cs-mono-print',
  notes: 'Purpose: Make an absolute count inspectable: one mark per person (or event), grouped so each group can be counted and compared.\nModify: Replace `deaths` and the context numbers. Rows widen to the largest group so lengths compare like bars; the total, the accented group and the headline recompute.\nInvariant: One mark always means one unit, stated on the page; counts are printed beside each group and add up to the total; no mark is scaled or merged.\nStatic: Already static. For a build, reveal groups one at a time, the accented group last.',
  sources: [{ type: 'original-example', file: 'assets/svg/unit-array.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${most.count} of the ${total} people killed on the city's roads in ${year} were <em>${most.as}</em></h1>
<div class="st-rail" data-region="support">
  <p class="st-num">${total}</p>
  <p class="st-text">people killed in ${year}, up from ${previous.total} in ${previous.year}. Each dot is one of them.</p>
  <hr class="st-rule">
  <p class="st-text st-muted"><strong>${olderWalkers} of the ${most.count}</strong> people killed while ${most.as} were aged 70 or over.</p>
</div>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · police collision records, deaths within 30 days, calendar year ${year}</span><span>Unit chart, 1 dot = 1 person</span></p>`,
};
