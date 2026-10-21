// Interaction study · Component ablation — which parts of a question-answering system earn their place.
// All eight on/off combinations were measured on the same held-out questions; the widget looks the
// score up (no additive model) and draws every configuration with its sampling margin.
const questions = 600;                                    // held-out helpline questions, scored by two reviewers
const components = [                                      // id, name in the controls, short name in the chart
  { id: 'rewrite', name: 'Query rewriting', short: 'query rewriting' },
  { id: 'rerank', name: 'Re-ranker', short: 're-ranker' },
  { id: 'cite', name: 'Citation check', short: 'citation check' },
];
const measured = {                                        // % answered correctly, by components switched on
  none: 58.0, rewrite: 60.3, rerank: 66.5, cite: 59.1,
  'rewrite+rerank': 69.2, 'rewrite+cite': 61.0, 'rerank+cite': 68.4, 'rewrite+rerank+cite': 71.7,
};
const all = components.map(c => c.id).join('+'), full = measured[all];
const without = id => components.filter(c => c.id !== id).map(c => c.id).join('+');
const cost = Object.fromEntries(components.map(c => [c.id, full - measured[without(c.id)]]));   // points lost when one is removed
const margin = 196 * Math.sqrt((full / 100) * (1 - full / 100) / questions);                    // ±, 95%, points
const [top, ...rest] = [...components].sort((a, b) => cost[b.id] - cost[a.id]);
const ID = 'interaction-ablation';

export default {
  study: true,
  id: ID,
  title: 'Component ablation: measured accuracy of every configuration',
  notes: `Purpose: Answer "which component matters?" with measured results for every on/off combination, so interactions between components are visible and the sampling margin is on the page.
Modify: Replace \`components\` and \`measured\` (one score per combination, keys joined with "+" in component order, "none" for the baseline) and \`questions\`. The chart, the margins and the headline recompute.
Invariant: Scores are looked up, never added up: components interact (the re-ranker gains ${(measured.rerank - measured.none).toFixed(1)} points alone but ${(full - measured['rewrite+cite']).toFixed(1)} on top of the other two). Each score carries its 95% margin from the number of questions.
Static: The export shows the full system highlighted among all eight configurations, which is the whole ablation table in one figure.`,
  sources: [{ type: 'original-example', file: 'assets/interactions/ablation.mjs' }],
  exportPolicy: 'final',
  className: 'st cs-ml-eval',
  content: `<h1 class="st-head">Only the ${top.short} clearly matters: removing it costs ${cost[top.id].toFixed(1)} points, the other two less than the ±${margin.toFixed(1)}-point margin</h1>
<p class="st-dek">Tax-helpline assistant (fictional), ${questions} held-out questions, % answered correctly.</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>Illustrative data · lines show 95% margins (normal approximation, n = ${questions})</span><span>Interaction · Component ablation</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'ablation',
    initial: Object.fromEntries(components.map(c => [c.id, true])),
    data: { components, measured, n: questions, digits: 1 },
    controls: Object.fromEntries(components.map(c => [c.id, { label: c.name, on: 'On', off: 'Off' }])),
    axes: { x: { title: 'Answered correctly (%)', min: 50, max: 80, ticks: [50, 55, 60, 65, 70, 75, 80] } },
    text: {
      reset: 'Reset',
      all: 'Full system', none: 'Baseline, no components', without: 'Without {name}', only: 'Only {name}',
      status: '{config}: {value}% correct (±{margin}), {delta} points against the full system.',
      statusFull: 'Full system: {value}% correct, ±{margin} points at 95% with {n} questions.',
      readout: [{ value: '{value}', unit: '%', label: 'answered correctly' }],
      figure: 'Accuracy of all eight component configurations with 95% margins',
    },
  }],
};
