// Composition study · Monochrome data — four series told apart by line weight, dash and position.
// Built for a handout that will be photocopied: no hue carries meaning. The index, the end labels,
// the table and the headline are all computed from `boardings` (millions of trips a year).
import { lineChart, fmt, el, textLines, theme as makeTheme } from '../runtime/figure.mjs';

const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
const boardings = [ // millions of trips per year (illustrative), Northvale Transport Authority
  { name: 'Bus', plural: 'buses', values: [55.8, 34.0, 40.2, 48.0, 53.0, 55.8, 57.5, 58.6], dash: null },
  { name: 'Tram', plural: 'trams', values: [30.9, 17.6, 21.0, 25.6, 28.4, 29.7, 30.6, 31.2], dash: '9 5' },
  { name: 'Suburban rail', plural: 'suburban rail', values: [24.6, 10.8, 12.8, 15.5, 17.2, 18.2, 18.9, 19.4], dash: null },
  { name: 'Ferry', plural: 'ferries', values: [2.46, 0.74, 1.21, 2.16, 2.56, 2.75, 2.83, 2.9], dash: '1.5 5' },
];
const focus = 'Suburban rail';
const indexed = boardings.map(s => ({ ...s, index: s.values.map(v => (v / s.values[0]) * 100) }));
const last = s => s.values.at(-1), first = s => s.values[0];
const change = s => (last(s) / first(s) - 1) * 100;
const rail = indexed.find(s => s.name === focus);
const others = indexed.filter(s => s !== rail);
const total = k => boardings.reduce((a, s) => a + s.values[k], 0);
const totalChange = (total(years.length - 1) / total(0) - 1) * 100;
const short = Math.round(-change(rail));               // percent below 2019
const recovered = others.filter(s => s.index.at(-1) >= 100).map(s => s.plural);
const list = a => (a.length > 1 ? `${a.slice(0, -1).join(', ')} and ${a.at(-1)}` : a[0] ?? '');
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const lostTrips = first(rail) - last(rail);            // million trips a year
const othersGained = others.reduce((a, s) => a + last(s) - first(s), 0);

export function figure(theme = 'css') {
  const t = makeTheme(theme), ink = t.c('ink');
  return lineChart({
    id: 'composition-monochrome-data-fig', theme, width: 800, height: 474, fontSize: 17,
    title: 'Annual boardings by mode, 2019–2026, indexed to 2019 = 100',
    desc: `${others.map(s => s.name).join(', ')} are at or above their 2019 level in 2026; ${focus.toLowerCase()} is at ${fmt(rail.index.at(-1), { digits: 0 })}, ${short}% short.`,
    x: years, xEvery: 1, yDomain: [20, 130], yTicks: 6, unit: 'Boardings, 2019 = 100',
    series: indexed.map(s => ({ name: s.name, values: s.index, dash: s.dash, color: ink })),
    highlight: focus, strokeWidth: 4.5, format: { digits: 0 },
    // The common baseline: a solid ink line at 100, labelled in the empty space above it.
    extra: ({ x, y, box }) => [el('line', { x1: box.x, x2: box.x + box.w, y1: y(100), y2: y(100), stroke: ink, 'stroke-width': 1.2 }),
      textLines([`${years[0]} level`], { x: x(1) + 8, y: y(100) - 8, size: 16, fill: ink, weight: 700 })].join(''),
    annotate: [{ series: focus, at: years.indexOf(2023), text: 'Tuesday to Thursday peaks came back; Mondays and Fridays did not', dx: 40, dy: 80, width: 250, marker: 'ring' }],
  });
}

const row = s => `<tr${s.name === focus ? ' class="mono-focus"' : ''}><th scope="row">${s.name}</th><td>${fmt(last(s), { digits: 1 })}</td><td>${fmt(change(s), { digits: 0, sign: true })}%</td></tr>`;

export default {
  study: true,
  id: 'composition-monochrome-data',
  title: 'Monochrome data: line weight and position instead of color',
  className: 'st st--rail cs-mono-print cmp-mono',
  notes: 'Purpose: Show several series on one page that will be printed or photocopied in black and white, so that nothing depends on hue. The one series the page is about is the heaviest line; the others are thin, each with its own dash, and every line is labelled at its end.\nModify: Replace `boardings` (one entry per series, raw values) and `focus`; the index, the end labels, the table and the headline recompute. Give each context series a different dash (solid, dashed, dotted) and keep at most four lines; more than four belongs in small multiples or a table.\nInvariant: One common baseline (the 2019 = 100 reference line, drawn in ink); the focus line about three times the weight of the others; direct end labels instead of a legend; the table repeats the end values in absolute units with signed changes; no colour anywhere, including the accent.\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${cap(list(recovered))} are back above ${years[0]}; ${focus.toLowerCase()} is still ${short}% short</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail mono-rail" data-region="support">
  <table class="mono-table">
    <caption>Trips in ${years.at(-1)}, millions</caption>
    <thead><tr><th scope="col">Mode</th><th scope="col">${years.at(-1)}</th><th scope="col">vs ${years[0]}</th></tr></thead>
    <tbody>${boardings.map(row).join('')}</tbody>
    <tfoot><tr><th scope="row">All modes</th><td>${fmt(total(years.length - 1), { digits: 1 })}</td><td>${fmt(totalChange, { digits: 0, sign: true })}%</td></tr></tfoot>
  </table>
  <p class="st-text">Rail carries ${fmt(lostTrips, { digits: 1 })} million fewer trips a year than in ${years[0]}; the other three modes together gained ${fmt(othersGained, { digits: 1 })} million.</p>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · Northvale Transport Authority, ridership review ${years.at(-1)}</span><span>Indexed line chart, black and white</span></p>`,
};
