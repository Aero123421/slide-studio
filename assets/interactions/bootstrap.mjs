// Interaction study · Seeded resampling — how much of a field trial's average gain survives resampling.
// The widget (kind 'bootstrap') draws resample k from a generator seeded with k + 1; this module repeats
// the same generator so the headline's interval is the one the page draws at the start.
const plots = [0.62, 0.15, 0.48, -0.21, 0.83, 0.37, 0.05, 0.71, 0.29, -0.08, 0.54, 0.33];   // yield gain, t/ha, new variety minus standard, 12 paired plots
const draws = 400;                                                                       // resamples on the page at the start
const lcg = seed => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
const resampleMean = k => { const r = lcg(k + 1); return mean(plots.map(() => plots[Math.floor(r() * plots.length)])); };
const quantile = (a, p) => { const s = [...a].sort((x, y) => x - y), h = (s.length - 1) * p, lo = Math.floor(h); return s[lo] + (s[Math.min(lo + 1, s.length - 1)] - s[lo]) * (h - lo); };
const means = Array.from({ length: draws }, (_, i) => resampleMean(i + 1));
const lo = quantile(means, 0.025), hi = quantile(means, 0.975), positive = means.filter(m => m > 0).length;
const signed = v => (v < 0 ? '−' : '+') + Math.abs(v).toFixed(2);
const ID = 'interaction-bootstrap';

export default {
  study: true,
  id: ID,
  title: 'Seeded resampling: the spread of a field trial’s mean gain',
  notes: `Purpose: Build the uncertainty of an average in front of the room: each resample draws the ${plots.length} plots again with replacement, and the means pile up into an interval.
Modify: Replace \`plots\` with your paired differences (and the axis title); \`draws\` sets how many resamples are on the page at the start. The interval and the headline recompute with the widget's own seeded generator.
Invariant: The observations stay visible above the distribution; a resample is shown as how often it drew each plot. The same seed always gives the same resample, so reset and revisits are exact.
Static: The export shows ${draws} resamples and their 95% interval (${signed(lo)} to ${signed(hi)} t/ha). One resample alone is not an interval; say so if you stop at one.`,
  sources: [{ type: 'original-example', file: 'assets/interactions/bootstrap.mjs' }],
  exportPolicy: 'final',
  className: 'st cs-field-survey',
  content: `<h1 class="st-head">The new variety’s ${signed(mean(plots))} t/ha gain survives resampling: 95% of ${draws} resample means fall between ${signed(lo)} and ${signed(hi)}</h1>
<p class="st-dek">Winter wheat, ${plots.length} paired plots, harvest 2026 (fictional trial); gain = new variety minus standard.</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>Illustrative data · percentile bootstrap, seeded so every resample can be repeated</span><span>Interaction · Seeded resampling</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'bootstrap',
    initial: { seed: draws, n: plots.length },
    data: { values: plots, batch: 100 },
    controls: { n: false },
    axes: { x: { title: 'Yield gain (t/ha)', min: -0.4, max: 1, digits: 2, tickDigits: 1, signed: true } },
    text: {
      resample: 'Resample', batch: 'Draw {n} more',
      dataTitle: 'The 12 plots; dots above a plot count how often this resample drew it',
      meanLabel: 'this resample {v}', observedLabel: 'mean of the 12 plots {v}', meansTitle: '{k|resample mean|resample means}',
      intervalLabel: '95% of means',
      status: 'Resample {draws} has a mean of {mean}\u00a0t/ha. Across all {draws}, 95% of means lie between {lo} and {hi}; {above} are above zero.',
      figure: 'Twelve plot gains, the current resample, and the distribution of resample means',
    },
  }],
};
