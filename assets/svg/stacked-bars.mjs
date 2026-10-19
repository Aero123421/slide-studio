// Diagram study · Stacked bars — composition and total in one bar per category.
// The series the page is about sits on the common baseline so it can be compared across bars.
import { stackedBarChart, fmt } from '../runtime/figure.mjs';

const destinations = ['Landfill', 'Incineration', 'Recycling', 'Composting'];
const districts = [ // household waste collected in 2025, thousand tonnes, by where it went (illustrative)
  { label: 'Northfield', values: [9.8, 14.2, 18.6, 7.4] },
  { label: 'Eastgate', values: [14.6, 12.1, 11.3, 3.2] },
  { label: 'Docklands', values: [8.1, 13.5, 12.9, 2.6] },
  { label: 'Hillcrest', values: [4.2, 9.8, 13.7, 8.9] },
  { label: 'Old Town', values: [6.9, 8.4, 9.2, 1.8] },
  { label: 'Riverside', values: [9.3, 5.2, 6.4, 2.1] },
];
const total = d => d.values.reduce((s, v) => s + v, 0);
const byTotal = [...districts].sort((a, b) => total(b) - total(a));
const biggest = byTotal[0];
const mostLandfill = [...districts].sort((a, b) => b.values[0] - a.values[0])[0];
const share = d => d.values[0] / total(d);

export function figure(theme = 'css') {
  return stackedBarChart({
    id: 'stacked-bars-fig', theme, width: 1152, height: 460, fontSize: 16,
    title: 'Household waste by district and destination, 2025, thousand tonnes',
    desc: `${biggest.label} collects the most waste (${fmt(total(biggest), { digits: 1 })} thousand tonnes), but ${mostLandfill.label} sends the most to landfill: ${fmt(mostLandfill.values[0], { digits: 1 })} thousand tonnes, ${fmt(share(mostLandfill) * 100, { digits: 0 })}% of its total.`,
    categories: byTotal.map(d => d.label),
    series: destinations.map((name, k) => ({ name, values: byTotal.map(d => d.values[k]) })),
    highlight: destinations[0], contextRamp: true, format: { digits: 1 }, rowHeight: 58,
  });
}

export default {
  study: true,
  id: 'stacked-bars',
  title: 'Stacked bars: composition and total together',
  className: 'st cs-civic-calm',
  notes: 'Purpose: Show what each total is made of and how big the total is, in one bar per category.\nModify: Replace `destinations` and `districts`. Put the component the page is about first so it sits on the common baseline; bars sort by total and the headline recomputes.\nInvariant: Segments sum exactly to the printed total; the series order and colors are the same in every bar; only the first segment shares a baseline, so only it (and the total) can be compared precisely.\nStatic: Already static. For a build, pass build:{by:"series"} to add one destination at a time.',
  sources: [{ type: 'original-example', file: 'assets/svg/stacked-bars.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${mostLandfill.label} sends the most waste to <em>${destinations[0].toLowerCase()}</em>, ${fmt(mostLandfill.values[0], { digits: 1 })} thousand tonnes, <span class="st-quiet">though ${biggest.label} collects more in total</span></h1>
<p class="st-dek">Household waste collected in 2025, thousand tonnes, by where it went</p>
<figure class="st-fig" style="top:194px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · kerbside and recycling-centre collections, six districts</span><span>Stacked bar chart</span></p>`,
};
