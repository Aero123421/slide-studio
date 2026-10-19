// Interaction study · Histogram bins — the same 240 delivery times at seven bin widths.
// The widget (kind 'histogram') bins `minutes` at the chosen width; the headline finds the peaks here
// with the widget's rule (a bin taller than its neighbours, at least a quarter of the tallest).
const domain = [0, 120];                                  // minutes from order to doorstep
const widths = [5, 10, 15, 20, 30, 40, 60];               // bin widths offered, minutes (each divides 120)
const start = 10;
// 240 orders from one depot, 5–11 October 2026 (fictional). Two delivery populations, generated reproducibly:
// city postcodes around 31 ± 6.5 min, rural postcodes around 74 ± 8 min.
function generate() {
  let s = 20261019 >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const normal = () => { let u = 0; while (!u) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };
  const draw = (n, mu, sd, lo, hi) => Array.from({ length: n }, () => Math.round(Math.min(hi, Math.max(lo, mu + sd * normal()))));
  return [...draw(180, 31, 6.5, 12, 62), ...draw(60, 74, 8, 48, 112)];
}
const minutes = generate();

const binsFor = w => (domain[1] - domain[0]) / w;
function peaks(w) {
  const nb = binsFor(w), c = Array(nb).fill(0);
  for (const v of minutes) c[Math.min(nb - 1, Math.floor((v - domain[0]) / w))]++;
  const top = Math.max(...c);
  return c.map((_, i) => i).filter(i => c[i] > 0 && (i === 0 || c[i] > c[i - 1]) && (i === nb - 1 || c[i] >= c[i + 1])
    && c[i] >= 1.3 * Math.min(i ? c[i - 1] : 0, i < nb - 1 ? c[i + 1] : 0) && c[i] >= top * 0.25).map(i => [domain[0] + i * w, domain[0] + (i + 1) * w]);
}
const [city, rural] = peaks(start);
const wide = widths.find(w => peaks(w).length === 1);       // the narrowest width at which the rural peak disappears
const ID = 'interaction-histogram';

export default {
  study: true,
  id: ID,
  title: 'Histogram bins: the bin width decides what shape the audience sees',
  notes: `Purpose: Show that bin width changes the visible shape of a distribution but never the observations, so a claim about "two peaks" is checked at several widths before it is made.
Modify: Replace \`minutes\` with your values and set \`domain\` and \`widths\` (each width should divide the domain). Peaks, counts and the headline recompute.
Invariant: Every observation stays on the page as a tick in the rug under the bars; the total never changes. Peaks are found by one stated rule, not by eye.
Static: The export shows ${start}-minute bins. Show the ${wide}-minute version beside it when the point is that wide bins hide the rural cluster.`,
  sources: [{ type: 'original-example', file: 'assets/interactions/histogram.mjs' }],
  exportPolicy: 'final',
  className: 'st cs-sales-kpi',
  content: `<h1 class="st-head">${start}-minute bins show two kinds of delivery: a city peak at ${city[0]}–${city[1]} minutes and a rural one at ${rural[0]}–${rural[1]}</h1>
<p class="st-dek">${minutes.length} grocery orders from one depot, 5–11 October 2026. Wider bins hide the rural peak.</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>Illustrative data · fictional depot, minutes from order to doorstep</span><span>Interaction · Histogram bins</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'histogram',
    initial: { bins: binsFor(start) },
    data: { values: minutes, domain },
    controls: { bins: { label: 'Bin width', values: widths.map(binsFor), labels: widths.map(w => `${w} min`) } },
    axes: { x: { title: 'Minutes from order to doorstep', digits: 0 }, y: { title: 'Orders' } },
    text: {
      status: '{width}-minute bins: one peak, at {peakList} minutes. All {total} orders are counted at every width.',
      statusTwoPeaks: '{width}-minute bins: peaks at {peakList} minutes. All {total} orders are counted at every width.',
      figure: 'Histogram of delivery times with a rug of every order',
    },
  }],
};
