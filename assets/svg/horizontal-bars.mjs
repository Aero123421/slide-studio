// Diagram study · Horizontal bars — magnitudes on one common zero, sorted, one bar named.
// Every number on the page (headline ratio, rail shares, median line) is computed from `buildings`.
import { barChart, el, g, textLines, measureText, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const buildings = [ // energy use intensity, kWh per m² per year (metered electricity + heat), and floor area, m² (illustrative)
  { label: '1968 Chemistry wing', value: 612, area: 9400 },
  { label: 'Life Sciences', value: 388, area: 14200 },
  { label: 'Sports centre and pool', value: 318, area: 8300 },
  { label: 'Engineering workshops', value: 246, area: 11800 },
  { label: 'Student union', value: 201, area: 6900 },
  { label: 'Arts centre', value: 176, area: 4600 },
  { label: 'Library', value: 164, area: 12600 },
  { label: 'Halls of residence', value: 147, area: 18400 },
  { label: 'Business school', value: 129, area: 7700 },
  { label: 'Administration', value: 121, area: 5200 },
  { label: 'Humanities', value: 112, area: 9100 },
];
const sorted = [...buildings].sort((a, b) => a.value - b.value);
const median = sorted.length % 2 ? sorted[(sorted.length - 1) / 2].value : (sorted[sorted.length / 2 - 1].value + sorted[sorted.length / 2].value) / 2;
const worst = sorted.at(-1);
const ratio = worst.value / median;
const kwh = buildings.reduce((s, b) => s + b.value * b.area, 0), area = buildings.reduce((s, b) => s + b.area, 0);
const energyShare = (worst.value * worst.area) / kwh, areaShare = worst.area / area;

export function figure(theme = 'css') {
  const t = makeTheme(theme);
  return barChart({
    id: 'horizontal-bars-fig', theme, width: 800, height: 470, fontSize: 16,
    title: 'Energy use intensity by campus building, kWh per square metre per year',
    desc: `${worst.label} uses ${fmt(worst.value)} kWh per square metre, ${fmt(ratio, { digits: 1 })} times the campus median of ${fmt(median)}. Bars are sorted and share a zero baseline.`,
    data: buildings, sort: 'desc', highlight: worst.label, format: { digits: 0 },
    unit: 'kWh per m² per year',
    // Median as a quiet reference line. It is interrupted wherever a value label sits on it,
    // and labelled in the empty space beside the shortest bar.
    extra: ({ x, y, box, data }) => {
      const mx = x(median), runs = [];
      let top = box.y - 4;
      for (const d of data) {
        const from = x(d.value) + 4, to = x(d.value) + 12 + measureText(fmt(d.value), 16, { weight: 700 });
        if (mx > from && mx < to) { runs.push([top, y.center(d.label) - 12]); top = y.center(d.label) + 12; } // label in the way: short gap
      }
      runs.push([top, box.y + box.h + 2]);
      return g({ class: 'ss-ref' },
        runs.map(([y1, y2]) => el('line', { x1: mx, x2: mx, y1, y2, stroke: t.c('ink'), 'stroke-width': 1.4, 'stroke-dasharray': '5 4' })),
        textLines([`Campus median ${fmt(median)}`], { x: mx + 8, y: y.center(data.at(-1).label), size: 15, valign: 'middle', fill: t.c('ink'), weight: 600 }));
    },
  });
}

export default {
  study: true,
  id: 'horizontal-bars',
  title: 'Horizontal bars: magnitudes on a common zero',
  className: 'st st--rail cs-sustainability-moss',
  notes: 'Purpose: Compare magnitudes against one shared zero baseline, sorted so rank reads at a glance, with the one bar the page is about named in the accent.\nModify: Replace `buildings` (label, value, area). The sort, the highlighted maximum, the median line, the headline ratio and both rail shares recompute.\nInvariant: Bars start at zero and use one unit; values are printed at the bar ends; the reference line is labelled with what it is; only one bar carries the accent.\nStatic: Already static. For a build, pass build:{motion:"grow-x", stagger:60} to the chart.',
  sources: [{ type: 'original-example', file: 'assets/svg/horizontal-bars.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">The <em>${worst.label}</em> uses ${fmt(ratio, { digits: 1 })} times the campus median energy per square metre</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b class="st-accent">${fmt(Math.round(energyShare * 100))}%</b><span>of the campus's energy goes to the ${worst.label}.</span></div>
  <hr class="st-rule">
  <div class="st-kpi"><b>${fmt(Math.round(areaShare * 100))}%</b><span>of the floor area is in that wing. Fume cupboards running day and night explain most of the gap.</span></div>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · metered electricity and heat, 2025, eleven buildings</span><span>Bar chart, common zero</span></p>`,
};
