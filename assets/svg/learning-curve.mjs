// Diagram study · Learning curve — training and validation score as the labelled data grows.
// Fold scores are the data; the engine draws mean ± 1 SD per size on a log axis. The last-doubling
// gain, the gap and every number on the page are computed from the same fold arrays.
import { learningCurve, g, textLines, mean, sd, rng, fmt } from '../runtime/figure.mjs';

// Average precision of the pump-failure model by training-set size, 5-fold cross-validation (illustrative).
// Each fold score comes from a model retrained on that many labelled pump-weeks.
const rand = rng(21);
const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const sizes = [500, 1000, 2000, 4000, 8000, 16000, 32000]; // labelled pump-weeks
const folds = 5;
const run = (curve, spread) => sizes.map(n => Array.from({ length: folds }, () => Math.round((curve(n) + spread(n) * normal()) * 1000) / 1000));
const valFolds = run(n => 0.71 - 1.95 * n ** -0.25, n => 0.045 * (500 / n) ** 0.3);
const trainFolds = run(n => 0.6 + 1.55 * n ** -0.25, n => 0.02 * (500 / n) ** 0.3);

const summary = f => f.map(v => ({ mean: mean(v), sd: sd(v) }));
const val = summary(valFolds), train = summary(trainFolds);
const lastGain = val.at(-1).mean - val.at(-2).mean, gap = train.at(-1).mean - val.at(-1).mean;
const a2 = v => fmt(v, { digits: 2 }), k = v => fmt(v, { compact: true });

export function figure(theme = 'css') {
  return learningCurve({
    id: 'learning-curve-fig', theme, width: 1152, height: 470, fontSize: 17,
    title: 'Learning curve: training and validation average precision by number of labelled pump-weeks',
    desc: `Validation AP rises from ${a2(val[0].mean)} at ${k(sizes[0])} to ${a2(val.at(-1).mean)} at ${k(sizes.at(-1))} pump-weeks and gained ${fmt(lastGain, { digits: 2, sign: true })} from the last doubling. Training AP falls to ${a2(train.at(-1).mean)}; the gap is ${a2(gap)}. Bands show ±1 SD across 5 folds.`,
    sizes, train, val, yFormat: { digits: 2 }, yDomain: [0.2, 1],
    xLabel: 'Labelled pump-weeks used for training (log scale)', yLabel: 'Average precision (higher is better)',
    trainLabel: 'Training', valLabel: 'Validation', gapLabel: `Gap ${a2(gap)}`,
    extra: ({ x, y, box, t }) => g({ class: 'learning-notes' },
      textLines([`${fmt(lastGain, { digits: 2, sign: true })} from the last doubling`], { x: x(sizes.at(-1)), y: y(val.at(-1).mean) + 40, size: 17, anchor: 'end', weight: 700, fill: t.c('accent'), halo: t.c('paper') }),
      textLines(['Each point: a model retrained at that size, early-stopped', 'on an inner split. Line: mean of 5 folds; band: ±1 SD. Unsmoothed.'],
        { x: box.x + box.w - 6, y: box.y + box.h - 14, size: 16, anchor: 'end', valign: 'bottom', fill: t.c('muted'), lineHeight: 1.3 })),
  });
}

export default {
  study: true,
  id: 'learning-curve',
  title: 'Learning curve: training against validation as data grows',
  className: 'st cs-terminal-dark',
  notes: 'Purpose: Show whether more labelled data is still paying off, by comparing training and validation scores across training-set sizes.\nModify: Replace `trainFolds` and `valFolds` with your per-fold scores at each of `sizes`; means, bands, the gap, the last-doubling gain and the headline recompute. Rename the score in yLabel and say whether higher or lower is better.\nInvariant: Score direction, the scale (log x), the band definition (±1 SD across folds), smoothing (none) and how each point\'s model was chosen are written on the page; train and validation share one axis.\nStatic: Already static. If the x axis is epochs instead, mark the checkpoint you kept.',
  sources: [{ type: 'original-example', file: 'assets/svg/learning-curve.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Validation AP has not flattened: doubling to ${fmt(sizes.at(-1))} labelled pump-weeks still added <em>${fmt(lastGain, { digits: 2, sign: true })}</em></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · 5-fold cross-validation at each size, same hyperparameters throughout</span><span>Learning curve</span></p>`,
};
