// Diagram study · Grouped bars — two series side by side within each repeated category.
// The change above each pair, the headline count and the largest gain all come from `years`.
import { groupedBarChart, g, textLines, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const cohorts = ['2024', '2025'];
const years = [ // share of pupils at or above the expected reading standard, %, by year group (illustrative)
  { label: 'Year 1', values: [72, 75] },
  { label: 'Year 2', values: [68, 71] },
  { label: 'Year 3', values: [66, 65] },
  { label: 'Year 4', values: [61, 72] },
  { label: 'Year 5', values: [64, 68] },
  { label: 'Year 6', values: [69, 73] },
];
const change = years.map(y => ({ label: y.label, delta: y.values[1] - y.values[0], top: Math.max(...y.values) }));
const rose = change.filter(c => c.delta > 0);
const best = [...change].sort((a, b) => b.delta - a.delta)[0];
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

export function figure(theme = 'css') {
  const t = makeTheme(theme);
  return groupedBarChart({
    id: 'grouped-bars-fig', theme, width: 1152, height: 470, fontSize: 17,
    title: 'Pupils meeting the expected reading standard by year group, 2024 and 2025, percent',
    desc: `Attainment rose in ${rose.length} of ${years.length} year groups. ${best.label} gained most, ${fmt(best.delta, { sign: true })} points; ${change.filter(c => c.delta < 0).map(c => c.label).join(', ')} fell slightly.`,
    categories: years.map(y => y.label),
    series: cohorts.map((name, k) => ({ name, values: years.map(y => y.values[k]) })),
    highlight: cohorts[1], domain: [0, 100], ticks: 4, groupGap: 0.42, format: { digits: 0, suffix: '%' },
    // The comparison the page is about: the change within each pair, in one aligned row above the bars.
    extra: ({ x, box }) => g({ class: 'ss-delta' }, change.map(c => {
      const hl = c.label === best.label;
      return textLines([`${fmt(c.delta, { sign: true })} ${Math.abs(c.delta) === 1 ? 'pt' : 'pts'}`], {
        x: x.center(c.label), y: box.y + 34, size: hl ? 19 : 17, anchor: 'middle', weight: hl ? 700 : 600,
        fill: c.delta < 0 ? t.c('negative') : t.c('ink'), attrs: { 'font-variant-numeric': 'tabular-nums' },
      });
    })),
  });
}

export default {
  study: true,
  id: 'grouped-bars',
  title: 'Grouped bars: two series within repeated categories',
  className: 'st cs-classroom-bright',
  notes: 'Purpose: Compare two series within each repeated category on one shared scale, and make the within-pair change the thing that is read.\nModify: Replace `cohorts` and `years`. The change labels, the count of rises and the largest gain recompute; highlight the series the page is about (here the newer cohort).\nInvariant: Both series share one zero-based axis; the pair order never changes between categories; the change is printed, so small differences are not left to the eye.\nStatic: Already static. For a build, pass build:{by:"series"} to reveal 2024 first, then 2025.',
  sources: [{ type: 'original-example', file: 'assets/svg/grouped-bars.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Reading attainment rose in ${words[rose.length] ?? rose.length} of ${words[years.length] ?? years.length} year groups in <em>${cohorts[1]}</em>; ${best.label} gained ${fmt(best.delta)} points</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · share of pupils at or above the expected standard, 14 schools, summer assessments</span><span>Grouped bar chart</span></p>`,
};
