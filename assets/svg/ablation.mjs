// Diagram study · Ablation — the full system against one controlled removal at a time.
// Every bar is the mean paired change in AP over 5 training seeds (ablated − full, same seed);
// the whiskers are t-based 95% intervals of that paired change. All computed from `runs`.
import { barChart, el, g, textLines, mean, sd, tQuantile, rng, fmt, theme as makeTheme } from '../runtime/figure.mjs';

// Average precision on the held-out set for the full pump-failure model and six variants that each
// remove exactly one component, retrained with 5 seeds (illustrative).
const rand = rng(4);
const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const seeds = 5;
const r3 = v => Math.round(v * 1000) / 1000;
const full = Array.from({ length: seeds }, () => r3(0.571 + 0.006 * normal()));
const runs = [ // [component removed, typical effect used to simulate the runs]
  ['Clock alignment', -0.17], ['Vibration spectra', -0.12], ['Maintenance history', -0.05],
  ['Temperature trend', -0.03], ['Pressure features', -0.012], ['Operating hours', 0.002],
].map(([name, effect]) => ({ name, ap: full.map(f => r3(f + effect + 0.008 * normal())) }));

const tq = tQuantile(0.975, seeds - 1);
const rows = runs.map(r => {
  const diff = r.ap.map((v, i) => v - full[i]); // paired by seed
  const m = mean(diff), w = tq * sd(diff) / Math.sqrt(seeds);
  return { label: `Without ${r.name.toLowerCase()}`, name: r.name.toLowerCase(), value: m, lo: m - w, hi: m + w };
}).sort((a, b) => a.value - b.value);
const biggest = rows[0];
const unclear = rows.filter(r => r.lo <= 0 && r.hi >= 0);
const d2 = v => fmt(v, { digits: 2, sign: true }), d3 = v => fmt(v, { digits: 3, sign: true });

export function figure(theme = 'css') {
  const t = makeTheme(theme);
  return barChart({
    id: 'ablation-fig', theme, width: 800, height: 470, fontSize: 17,
    title: 'Change in average precision when one component is removed, mean of 5 seeds with 95% intervals',
    desc: `Full model AP ${fmt(mean(full), { digits: 3 })}. ${rows.map(r => `${r.label}: ${d3(r.value)} (${d3(r.lo)} to ${d3(r.hi)})`).join('; ')}. ${unclear.map(r => r.label).join(' and ')}: intervals include zero.`,
    data: rows, highlight: biggest.label, valueLabels: false, axis: true, ticks: 5,
    domain: [Math.floor((Math.min(...rows.map(r => r.lo)) - 0.06) * 20) / 20, 0.05], unit: 'Change in average precision vs the full model',
    format: { digits: 2, sign: true }, rowHeight: 62, barRatio: 0.56,
    extra: ({ x, y }) => g({ class: 'ablation-intervals' }, rows.map(r => {
      const cy = y.center(r.label), hl = r === biggest, end = Math.min(r.lo, r.value);
      return g({},
        el('line', { x1: x(r.lo), x2: x(r.hi), y1: cy, y2: cy, stroke: t.c('ink'), 'stroke-width': 1.6 }),
        [r.lo, r.hi].map(v => el('line', { x1: x(v), x2: x(v), y1: cy - 7, y2: cy + 7, stroke: t.c('ink'), 'stroke-width': 1.6 })),
        textLines([d2(r.value)], { x: x(end) - 10, y: cy, size: 17, anchor: 'end', valign: 'middle', weight: hl ? 700 : 600, fill: hl ? t.c('accent') : t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
    })),
  });
}

export default {
  study: true,
  id: 'ablation',
  title: 'Ablation: the full system against controlled removals',
  className: 'st st--left cs-keynote-dusk',
  notes: 'Purpose: Show how much each component contributes by removing one at a time from the full system, with the run-to-run noise visible.\nModify: Replace `full` and each `runs[].ap` with your scores per seed (same seeds for every variant); the paired changes, 95% intervals, sort order, highlight and headline recompute.\nInvariant: Exactly one component removed per bar, everything else held fixed; changes are paired by seed against the same full model; the interval type is stated; no bar is read as the effect of a combination.\nStatic: Already static. Add a "remove both" run before claiming two components interact.',
  sources: [{ type: 'original-example', file: 'assets/svg/ablation.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Removing ${biggest.name} costs the model the most: <em>${d2(biggest.value)}</em>\u00a0AP, against ${d2(rows[1].value)} for the ${rows[1].name}</h1>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b>${fmt(mean(full), { digits: 2 })}</b><span>average precision of the full model, mean of ${seeds} training seeds.</span></div>
  <hr class="st-rule">
  <p class="st-text">Each bar retrains the model without one component and keeps everything else fixed. Whiskers: 95% interval of the paired change across seeds. Changes do not add up: two removals together need their own run.</p>
</div>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · same held-out set and seeds for every variant; ${unclear.length} of ${rows.length} intervals include zero</span><span>Ablation bar chart</span></p>`,
};
