// Diagram study · Calibration — does a predicted 70% come true 70% of the time?
// The engine bins raw probabilities (10 equal-width bins), plots mean predicted against observed
// frequency and draws the count per bin; the printed counts and the headline use the same bins.
import { calibrationChart, calibrationBins, g, textLines, rng, fmt, pct, theme as makeTheme } from '../runtime/figure.mjs';

// Held-out evaluation set (illustrative): 3,000 pump-weeks, 180 followed by a failure within 7 days,
// each with the failure-risk model's predicted probability.
const rand = rng(2025);
const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const N = 3000, failures = 180;
const labels = Array.from({ length: N }, (_, i) => (i < failures ? 1 : 0));
const probs = labels.map(y => Math.round(1000 / (1 + Math.exp(4.9 - 2.5 * (normal() + (y ? 1.9 : 0))))) / 1000);

const bins = calibrationBins(probs, labels, 10);
const used = bins.filter(b => b.n > 0);
const worst = [...used].filter(b => b.n >= 20).sort((a, b) => (b.meanPredicted - b.observed) - (a.meanPredicted - a.observed))[0];
const low = used.filter(b => b.x1 <= 0.3), lowGap = Math.max(...low.map(b => Math.abs(b.meanPredicted - b.observed)));
const above = used.filter(b => b.x0 >= 0.3), aboveN = above.reduce((s, b) => s + b.n, 0);
const overstated = above.filter(b => b.meanPredicted > b.observed).length;

export function figure(theme = 'css') {
  return calibrationChart({
    id: 'calibration-fig', theme, width: 800, height: 470, fontSize: 17, histHeight: 70,
    title: 'Reliability diagram for the pump-failure risk model, 10 equal-width bins',
    desc: `Below 30% predicted risk, observed failure rates are within ${fmt(lowGap * 100, { digits: 0 })} percentage points of the prediction. Above 30%, ${overstated} of ${above.length} bins observe fewer failures than predicted; the ${pct(worst.x0)}–${pct(worst.x1)} bin predicts ${pct(worst.meanPredicted)} and observes ${pct(worst.observed)} (n = ${worst.n}). Most predictions sit below 10%.`,
    bins, yLabel: 'Observed failure rate', xLabel: 'Mean predicted risk in bin', countLabel: 'Pump-weeks per bin (count printed)', perfectLabel: '',
    annotate: [{ at: worst.meanPredicted, y: worst.observed, text: `Predicted ${pct(worst.meanPredicted)}, observed ${pct(worst.observed)} (n = ${worst.n})`, dx: -24, dy: 116, width: 340, marker: 'ring', color: makeTheme(theme).c('accent'), weight: 600 }],
    // print every bin's count on its bar: sparse bins must read as sparse, not just as short bars
    extra: ({ x, y, box, t }) => {
      const histH = 70, base = box.y + box.h + 50 + histH, maxN = Math.max(...bins.map(q => q.n)); // the engine's histogram geometry
      return g({ class: 'bin-counts' }, bins.map(b => {
        const h = (b.n / maxN) * histH, inside = h > 26;
        return textLines([fmt(b.n)], { x: (x(b.x0) + x(b.x1)) / 2, y: inside ? base - h + 18 : base - h - 5, size: 15, anchor: 'middle', fill: t.c('ink'), weight: 600 });
      }),
      // the diagonal's label, set level between gridlines where the curve runs below it (the engine's default sits on the curve)
      textLines(['Perfectly calibrated'], { x: x(0.84), y: y(0.88), size: 16, fill: t.c('muted'), anchor: 'end' }));
    },
  });
}

export default {
  study: true,
  id: 'calibration',
  title: 'Calibration: predicted probability against observed frequency',
  className: 'st st--rail cs-tech-conference-light',
  notes: 'Purpose: Check whether predicted probabilities can be read as probabilities, bin by bin, and show how many cases stand behind each bin.\nModify: Replace `labels` and `probs` with your outcomes and predicted probabilities; bins, the reliability curve, the counts, the worst-bin callout and the headline recompute. Change the bin count only with enough cases per bin.\nInvariant: Predicted = mean predicted probability in the bin; observed = share of cases in the bin with the outcome; the diagonal is perfect calibration; counts per bin are printed so a sparse bin is never read as precise.\nStatic: Already static. For small bins, add intervals (see calibration-points).',
  sources: [{ type: 'original-example', file: 'assets/svg/calibration.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Above 30%, the risk scores overstate failure: <em>predicted ${pct(worst.meanPredicted)}, observed ${pct(worst.observed)}</em></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <p class="st-text"><strong>Predicted</strong> is the model's average risk score for the pump-weeks in a bin; <strong>observed</strong> is the share of them followed by a failure within 7 days.</p>
  <hr class="st-rule">
  <div class="st-kpi"><b>${fmt(aboveN)}</b><span>of ${fmt(N)} pump-weeks scored above 30%: enough to show the bias, too few to read any one bin precisely.</span></div>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · held-out set of ${fmt(N)} pump-weeks, ${failures} failures</span><span>Reliability diagram</span></p>`,
};
