// Diagram study · Error bars — group estimates with their intervals, raw plots alongside.
// The engine computes each mean and its t-based 95% interval from the plot yields; the rail's
// differences use Welch's interval from the same arrays. Every number on the page is computed.
import { errorBarChart, mean, sd, tQuantile, rng, fmt, theme as makeTheme } from '../runtime/figure.mjs';

// Winter wheat grain yield, t/ha, 12 plots per cover-crop treatment, randomized blocks (illustrative).
const rand = rng(22);
const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const plots = (mu, s) => Array.from({ length: 12 }, () => Math.round((mu + s * normal()) * 100) / 100);
const groups = [
  { label: 'Bare fallow', values: plots(6.80, 0.48) },
  { label: 'Rye', values: plots(6.92, 0.52) },
  { label: 'Clover', values: plots(7.42, 0.46) },
  { label: 'Rye + clover', values: plots(7.22, 0.55) },
];
const control = groups[0], focusLabel = 'Clover';

// Group interval: mean ± t(0.975, n−1) · s/√n.
const ci95 = v => { const w = tQuantile(0.975, v.length - 1) * sd(v) / Math.sqrt(v.length); return [mean(v) - w, mean(v) + w]; };
// Difference from the control: Welch's t interval (unequal variances).
const welch = (a, b) => {
  const va = sd(a) ** 2 / a.length, vb = sd(b) ** 2 / b.length, se = Math.sqrt(va + vb);
  const df = (va + vb) ** 2 / (va ** 2 / (a.length - 1) + vb ** 2 / (b.length - 1)), d = mean(a) - mean(b);
  return { d, lo: d - tQuantile(0.975, df) * se, hi: d + tQuantile(0.975, df) * se };
};
const diffs = groups.slice(1).map(gp => ({ label: gp.label, ...welch(gp.values, control.values) }));
const focus = diffs.find(d => d.label === focusLabel);
const clear = diffs.filter(d => d.lo > 0 || d.hi < 0), unclear = diffs.filter(d => !(d.lo > 0 || d.hi < 0));
const t2 = v => fmt(v, { digits: 2, sign: true });
const range = d => `${fmt(d.lo, { digits: 2 })} to ${fmt(d.hi, { digits: 2 })}`;

export function figure(theme = 'css') {
  return errorBarChart({
    id: 'error-bars-fig', theme, width: 800, height: 520, fontSize: 18,
    title: 'Wheat yield by cover-crop treatment: plot yields, means and 95% confidence intervals',
    desc: `${control.values.length} plots per treatment. Means: ${groups.map(gp => `${gp.label} ${fmt(mean(gp.values), { digits: 2 })}`).join(', ')} t/ha. ${focusLabel} is ${t2(focus.d)} t/ha above bare fallow (95% CI ${range(focus)}); ${unclear.map(d => d.label).join(' and ')} have intervals for the difference that include zero.`,
    groups, interval: ci95, highlight: focusLabel, format: { digits: 2 }, yLabel: 'Grain yield, t/ha',
    intervalNote: `Dots: plots. Bar: mean with 95% CI (t, ${control.values.length - 1} df)`,
    annotate: [{ at: focusLabel, text: `${t2(focus.d)} t/ha vs bare fallow`, dx: 14, dy: -26, width: 260, marker: 'none', color: makeTheme(theme).c('accent'), weight: 700 }],
  });
}

export default {
  study: true,
  id: 'error-bars',
  title: 'Error bars: estimates with labelled intervals',
  className: 'st st--rail st--tall cs-field-survey',
  notes: 'Purpose: Expose the uncertainty around group estimates and keep the raw observations in view, so a difference is judged against its noise.\nModify: Replace each `values` array with raw measurements; the means, the t-based group intervals, the Welch differences in the rail and the headline recompute. Change `ci95` only if your analysis used a different interval, and rename the note to match.\nInvariant: The interval type, level, estimator and n are written on the page; group intervals (chart) and difference intervals (rail) are never mixed up; raw points stay visible.\nStatic: Already static. Overlapping group bars do not prove "no difference" — read the rail.',
  sources: [{ type: 'original-example', file: 'assets/svg/error-bars.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${clear.length === 1 ? `Only ${clear[0].label.toLowerCase()}` : `${clear.length} of ${diffs.length} cover crops`} clearly lifted wheat yield: <em>${t2(focus.d)}\u00a0t/ha</em> over bare fallow</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b class="st-accent">${t2(focus.d)} t/ha</b><span><strong>${focus.label} minus bare fallow.</strong> Welch 95% CI ${range(focus)}: above zero throughout.</span></div>
  <hr class="st-rule">
  <p class="st-text">${unclear.map(d => `${d.label.replace(/ \+ /g, '\u00a0+\u00a0')} <strong>${t2(d.d)}</strong> (${range(d)})`).join(' and ')}: ${unclear.length > 1 ? 'both intervals include' : 'the interval includes'} zero.</p>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · randomized field trial, ${control.values.length} plots per treatment, one season</span><span>Error-bar chart</span></p>`,
};
