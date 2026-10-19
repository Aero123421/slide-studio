// Diagram study · Lollipop — a bar's information with less ink: the dot carries the value.
// Sites, the threshold line, the qualifying set and the headline all come from `sites`.
import { lollipopChart, el, g, textLines, measureText, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const sites = [ // usable nights per year, 2015–2024 average (illustrative): clear sky, humidity < 80%, wind < 15 m/s
  { label: 'Mesa Escondida', value: 296 },
  { label: 'Altiplano Station', value: 271 },
  { label: 'Cuesta Larga', value: 248 },
  { label: 'Valle Seco', value: 233 },
  { label: 'Salt Pan Ridge', value: 214 },
  { label: 'Granite Dome', value: 196 },
  { label: 'Pico Norte', value: 188 },
  { label: 'Old Mine Plateau', value: 171 },
  { label: 'Black Butte', value: 159 },
  { label: 'Pine Saddle', value: 132 },
  { label: 'Coast Range Peak', value: 118 },
  { label: 'Lakeside Hill', value: 97 },
];
const needed = 220; // usable nights the survey needs per year
const qualify = sites.filter(s => s.value >= needed);

export function figure(theme = 'css') {
  const t = makeTheme(theme);
  return lollipopChart({
    id: 'lollipop-fig', theme, width: 1152, height: 450, fontSize: 16, format: { digits: 0 },
    title: 'Usable observing nights per year at twelve candidate telescope sites',
    desc: `${qualify.length} of ${sites.length} sites reach the ${needed} usable nights a year the survey needs: ${qualify.map(s => `${s.label} (${s.value})`).join(', ')}. The rest fall short, down to ${sites.at(-1).value} at ${sites.at(-1).label}.`,
    data: sites, highlight: s => s.value >= needed,
    // Threshold: a line through the plot, broken where a value label sits, named beside the shortest stick.
    extra: ({ x, y, box }) => {
      const tx = x(needed), runs = [];
      let top = box.y - 2;
      for (const s of sites) {
        const from = x(s.value) + 10, to = x(s.value) + 20 + measureText(fmt(s.value), 16, { weight: 700 });
        if (tx > from && tx < to) { runs.push([top, y(s.label) - 12]); top = y(s.label) + 12; }
      }
      runs.push([top, box.y + box.h + 2]);
      const last = sites.at(-1);
      return g({ class: 'ss-ref' },
        runs.map(([y1, y2]) => el('line', { x1: tx, x2: tx, y1, y2, stroke: t.c('ink'), 'stroke-width': 1.4, 'stroke-dasharray': '5 4' })),
        textLines([`Survey needs ${needed} nights`], { x: tx + 10, y: y(last.label), size: 16, valign: 'middle', fill: t.c('ink'), weight: 700 }));
    },
  });
}

export default {
  study: true,
  id: 'lollipop',
  title: 'Lollipop: magnitudes with less ink',
  className: 'st cs-astronomy-night',
  notes: 'Purpose: Compare many magnitudes from a shared zero with a thin stem and an end dot, so the endpoints and a threshold carry the reading instead of heavy bars.\nModify: Replace `sites` and `needed`. Rows sort themselves; the qualifying sites take the accent, and the threshold line, its gaps around labels and the headline recompute.\nInvariant: Stems start at zero and share one scale; the threshold is drawn and named, not implied; the accent marks only the sites that meet it.\nStatic: Already static. For a build, reveal the threshold first, then the stems.',
  sources: [{ type: 'original-example', file: 'assets/svg/lollipop.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Only ${qualify.length} of ${sites.length} candidate sites give the survey the ${needed} usable nights a year it needs</h1>
<p class="st-dek">A usable night: clear sky, humidity under 80%, wind under 15 m/s (2015–24 average)</p>
<figure class="st-fig" style="top:204px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · all-sky camera and weather mast records at each site</span><span>Lollipop chart</span></p>`,
};
