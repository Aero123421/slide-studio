// Diagram study · Histogram — equal-width bins reveal what a summary hides.
// Raw stays are generated once (seeded), binned by the engine, and every number on the
// page — headline, callout, breach share, sample size — is computed from `stays`.
import { histogram, bracket, rng, fmt, pct } from '../runtime/figure.mjs';

// Minutes from arrival to departure for one month of emergency attendances (illustrative).
// A log-normal spread of stays, plus the pattern a 4-hour target tends to create:
// some stays that would have run a little over 240 minutes end just before it.
const rand = rng(41);
const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const target = 240; // minutes
const stays = Array.from({ length: 2400 }, () => {
  const m = Math.round(Math.exp(Math.log(150) + 0.5 * normal()));
  return m >= target && m < 330 && rand() < 0.55 ? Math.round(target - 1 - 11 * rand() ** 2) : m;
});

const binMin = 10, maxMin = 480; // equal 10-minute bins over 0–8 h; longer stays are counted, not drawn
const hours = stays.map(m => m / 60);
const edges = Array.from({ length: maxMin / binMin + 1 }, (_, k) => k * binMin); // minutes
const thresholds = edges.map(m => m / 60); // the chart's x axis is in hours
const inBin = (lo, hi) => stays.filter(m => m >= lo && m < hi).length;
const spike = inBin(target - binMin, target), before = inBin(target - 2 * binMin, target - binMin), after = inBin(target, target + binMin);
const breached = stays.filter(m => m >= target).length;
const offChart = stays.filter(m => m >= maxMin).length;
const share = spike / stays.length;
const usual = edges.slice(0, -1).filter(m => m + binMin < target - binMin).map(m => ({ m, c: inBin(m, m + binMin) }))
  .sort((a, b) => b.c - a.c)[0]; // busiest ordinary bin, for the description
const tallestTail = Math.max(...edges.slice(0, -1).filter(m => m >= target).map(m => inBin(m, m + binMin)));
const hm = h => `${Math.floor(h)} h ${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;

export function figure(theme = 'css') {
  return histogram({
    id: 'histogram-fig', theme, width: 1152, height: 470, fontSize: 17,
    title: `Time in the emergency department, ${fmt(stays.length)} attendances, 10-minute bins`,
    desc: `Stays are most common between ${hm(usual.m / 60)} and ${hm((usual.m + binMin) / 60)} and tail off, except for a spike just before the 4-hour target: ${pct(share, 1)} of stays end between 3 h 50 and 4 h, ${fmt(spike / before, { digits: 1 })} times the previous bin and ${fmt(spike / after, { digits: 0 })} times the next. ${pct(breached / stays.length)} of stays exceed 4 hours.`,
    values: hours, bins: thresholds, xTicks: 8, xFormat: { suffix: ' h' },
    yLabel: 'Attendances per 10-minute bin', xLabel: 'Time from arrival to departure',
    highlightRange: [(target - binMin) / 60, target / 60],
    marks: [{ value: target / 60, label: '4-hour target' }],
    annotate: [{ at: (target - binMin / 2) / 60, text: `${fmt(spike)} stays end here: ${fmt(spike / before, { digits: 1 })}× the ten minutes before, ${fmt(spike / after, { digits: 0 })}× the ten after`, dx: 150, dy: 0, width: 270, leader: 'straight' }],
    // Context, not the point: the tail past the target, bracketed in muted ink.
    extra: ({ x, y, t }) => bracket({ x1: x(target / 60) + 4, x2: x(maxMin / 60) - 2, y1: y(tallestTail) - 14, y2: y(tallestTail) - 14, side: 'top', depth: 8, theme: t, color: t.c('muted'), weight: 500, size: 17,
      label: `${pct(breached / stays.length)} of stays still run past 4 h` }),
  });
}

export default {
  study: true,
  id: 'histogram',
  title: 'Histogram: a binned distribution with a disclosed bin width',
  className: 'st cs-civic-calm',
  notes: 'Purpose: Show how a numeric measure is distributed, so a pile-up, a gap or a long tail is visible rather than averaged away.\nModify: Replace `stays` with your raw observations and keep `binMin` equal for every bin; the bins, headline share, callout and breach count recompute. Move `target` and `highlightRange` to the threshold your audience manages to.\nInvariant: Equal-width bins on a zero-based count axis; the bin width and the count of values beyond the drawn range are stated on the page; one highlighted bin.\nStatic: Already static. Try a second bin width before publishing: a spike that survives 5- and 15-minute bins is real.',
  sources: [{ type: 'original-example', file: 'assets/svg/histogram.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${pct(share, 1)} of emergency stays end in the ten minutes before the 4-hour target</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · ${fmt(stays.length)} attendances at a fictional emergency department in one month; equal 10-minute bins; ${offChart} stays over 8 h not drawn</span><span>Histogram</span></p>`,
};
