// Diagram study · Indexed lines — every series rebased to 100 at a stated base year.
// rebase() turns capacities into indices; the rail puts the absolute gigawatts back,
// because relative growth says nothing about size. All numbers come from `capacity`.
import { lineChart, rebase, fmt } from '../runtime/figure.mjs';

const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const capacity = [ // installed capacity at year end, gigawatts (illustrative grid region)
  { name: 'Storage', gw: [0.4, 0.46, 0.57, 0.72, 0.92, 1.18, 1.5, 1.86, 2.2, 2.6] },
  { name: 'Solar', gw: [3.1, 3.9, 4.8, 5.9, 7.0, 8.2, 9.6, 11.1, 12.6, 14.2] },
  { name: 'Wind', gw: [9.8, 10.6, 11.4, 12.1, 12.9, 13.7, 14.6, 15.6, 16.6, 17.6] },
  { name: 'Gas', gw: [31.0, 31.2, 31.5, 31.4, 31.0, 30.6, 30.2, 29.8, 29.4, 29.0] },
];
const base = years[0];
const added = s => s.gw.at(-1) - s.gw[0];
const growth = s => s.gw.at(-1) / s.gw[0];
const fastest = [...capacity].sort((a, b) => growth(b) - growth(a))[0];
const biggest = [...capacity].sort((a, b) => added(b) - added(a))[0];
const times = Math.round(added(biggest) / added(fastest));
const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const gw = (v, sign = true) => fmt(v, { digits: 1, sign, suffix: '\u00a0GW' }); // no break between number and unit
const top = Math.ceil(Math.max(...capacity.map(growth)) + 0.5) * 100; // index axis ceiling, from the data

export function figure(theme = 'css') {
  return lineChart({
    id: 'indexed-line-fig', theme, width: 800, height: 470, fontSize: 16,
    title: `Installed generating capacity by source, indexed to ${base} = 100`,
    desc: `Indexed to ${base}, ${fastest.name.toLowerCase()} reaches ${fmt(growth(fastest) * 100, { digits: 0 })}, the fastest growth, but it added only ${gw(added(fastest))}; ${biggest.name.toLowerCase()} added ${gw(added(biggest))}. Gas ends at ${fmt(growth(capacity.at(-1)) * 100, { digits: 0 })}.`,
    x: years, series: capacity.map(s => ({ name: s.name, values: rebase(s.gw) })),
    highlight: fastest.name, format: { digits: 0 }, yDomain: [0, top], yTicks: 4, unit: `Index, ${base} = 100`,
    refLines: [{ y: 100, label: `${base} level` }], markers: 'last',
  });
}

export default {
  study: true,
  id: 'indexed-line',
  title: 'Indexed lines: relative change from a common start',
  className: 'st st--rail cs-keynote-dusk',
  notes: 'Purpose: Compare relative change from one common starting point when the series differ greatly in size, and keep their absolute size in view.\nModify: Replace `years` and `capacity`; rebase() indexes each series to its first value. The fastest grower takes the accent; the rail and headline recompute absolute additions.\nInvariant: The base year and base value (=100) are printed on the axis and the reference line; an index never stands in for size, so absolute values appear beside it.\nStatic: Already static. For a build, draw the 100 line first, then the series.',
  sources: [{ type: 'original-example', file: 'assets/svg/indexed-line.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head"><em>${fastest.name}</em> grew ${fmt(growth(fastest), { digits: 1 })}-fold since ${base}, yet ${biggest.name.toLowerCase()} added ${words[times] ?? times} times as many gigawatts</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b class="st-accent">${gw(added(fastest))}</b><span>Added by ${fastest.name.toLowerCase()} since ${base}. Its small ${gw(fastest.gw[0], false)} start is what makes the index so steep.</span></div>
  <hr class="st-rule">
  <div class="st-kpi"><b>${gw(added(biggest))}</b><span>Added by ${biggest.name.toLowerCase()} over the same years, from ${gw(biggest.gw[0], false)}.</span></div>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · installed capacity at year end, ${base}–${years.at(-1)}</span><span>Indexed line chart, ${base} = 100</span></p>`,
};
