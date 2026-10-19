// Interaction study · Linked selection — brush a range of build years and the medians recompute.
// The widget (kind 'brushing') selects homes whose build year falls inside the two sliders and
// compares the selection's median heating demand with everyone else's; the headline does the same here.
const survey = { year: 2026, homes: 96 };
const brush = [1900, 1979];                   // starting selection: built before the 1980 insulation rules (fictional)
// Heating demand by construction era, kWh per m² of floor area per year, weather-normalised.
// Era medians from the audit programme; homes are drawn reproducibly around them (±13 % log-normal).
const eras = [[1900, 1918, 14, 205], [1919, 1944, 14, 186], [1945, 1979, 30, 171], [1980, 1999, 18, 128], [2000, 2009, 10, 99], [2010, 2020, 10, 74]];
function generate() {
  let s = 4417 >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const normal = () => { let u = 0; while (!u) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };
  let id = 1;
  return eras.flatMap(([from, to, n, kwh]) => Array.from({ length: n }, () => ({ id: id++, x: from + Math.floor(rnd() * (to - from + 1)), y: Math.round(kwh * Math.exp(0.13 * normal())) })));
}
const homes = generate();
const median = a => { const s = [...a].sort((p, q) => p - q), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const inside = homes.filter(h => h.x >= brush[0] && h.x <= brush[1]), outside = homes.filter(h => !(h.x >= brush[0] && h.x <= brush[1]));
const mIn = median(inside.map(h => h.y)), mOut = median(outside.map(h => h.y));
const ID = 'interaction-brushing';

export default {
  study: true,
  id: ID,
  title: 'Linked selection: brush build years, compare heating demand',
  notes: `Purpose: Let the room select a range on one variable (build year) and see a summary of another (heating demand) recompute for the selection and for everyone else, so a targeting rule is argued with the data.
Modify: Replace \`homes\` ({id, x, y}) and the axis titles; set \`brush\`. Selection count, both medians, the ratio and the headline recompute.
Invariant: Every home stays on the page; the brush only changes which points are accented. The two medians are drawn as lines across the scatter and labelled with their values.
Static: The export shows the starting brush (${brush[0]}–${brush[1]}). For a written report, add the eras under discussion as separate pages or a small table.`,
  sources: [{ type: 'original-example', file: 'assets/interactions/brushing.mjs' }],
  exportPolicy: 'final',
  className: 'st cs-sustainability-moss',
  content: `<h1 class="st-head">Homes built before 1980 need a median ${Math.round(mIn)} kWh per m² a year, ${(mIn / mOut).toFixed(1)} times the homes built since</h1>
<p class="st-dek">${homes.length} homes in the ${survey.year} energy-audit sample (fictional); demand normalised for weather.</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>Illustrative data · one dot per audited home</span><span>Interaction · Linked selection</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'brushing',
    initial: { low: brush[0], high: brush[1] },
    data: { points: homes },
    controls: {
      low: { label: 'Built from (year)', min: 1900, max: 2020, step: 1 },
      high: { label: 'Built up to (year)', min: 1900, max: 2020, step: 1 },
    },
    axes: { x: { title: 'Year built', min: 1900, max: 2020, ticks: [1900, 1920, 1940, 1960, 1980, 2000, 2020], digits: 0, plain: true },
      y: { title: 'Heating demand (kWh per m² a year)', min: 0, max: 250, ticks: [0, 50, 100, 150, 200, 250], digits: 0 } },
    text: {
      selectedMedian: 'selected {v}', restMedian: 'others {v}', medianTitle: 'Medians',
      status: 'Built {low}–{high}: {k|home|homes}, median {median} kWh/m²; the other homes {rest}. Ratio {ratio}.',
      figure: 'Heating demand by year built, with a selected range',
    },
  }],
};
