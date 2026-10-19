// Interaction study · Parameter explorer — a dosing model recomputed as dose and half-life change.
// The widget (assets/runtime/widgets.js, kind 'parameter', model 'dosing') draws the curve and its
// numbers from the constants and slider values below; the headline uses the same formula.
const drug = { volume: 30, interval: 8, horizon: 72 };   // litres of distribution, hours between doses, hours shown
const limits = { min: 8, max: 30 };                       // mg/L in plasma: effective above `min`, toxic above `max`
const start = { dose: 500, halfLife: 6 };                 // mg per dose, elimination half-life in hours

// Steady state of a repeated IV bolus: peak = (dose / volume) / (1 − e^(−k·interval)), k = ln 2 / half-life.
const steady = ({ dose, halfLife }) => {
  const r = Math.exp(-(Math.LN2 / halfLife) * drug.interval), peak = dose / drug.volume / (1 - r);
  return { peak, trough: peak * r };
};
const now = steady(start);
// The half-life at which this dose's steady-state peak reaches the toxic limit.
const limitHalfLife = (Math.LN2 * drug.interval) / -Math.log(1 - start.dose / (drug.volume * limits.max));
// For the notes: the largest dose that stays under the limit for a 10-hour half-life.
const safeDose10 = drug.volume * limits.max * (1 - Math.exp(-(Math.LN2 / 10) * drug.interval));
const one = v => v.toFixed(1);
const ID = 'interaction-parameter';

export default {
  study: true,
  id: ID,
  title: 'Parameter explorer: how dose and half-life move a concentration curve',
  notes: `Purpose: Let the audience change the two parameters of a documented model (repeated IV dosing, one compartment) and see the whole concentration curve, its peak and its trough recompute on fixed axes.
Modify: Change \`drug\`, \`limits\` and \`start\`; the widget, the headline (${one(limitHalfLife)} h) and the markers recompute. Other models: data.model 'sine', 'decay' or 'logistic' (see references/motion-and-interaction.md §9).
Invariant: Axes stay fixed while parameters move, so a taller curve means a higher concentration. The model and its constants are stated on the page; the curve is computed, never drawn by hand.
Static: The export shows the starting state (${start.dose} mg, half-life ${start.halfLife} h). To argue the kidney-impairment case on paper, add a second page at half-life 10 h, where ${Math.floor(safeDose10 / 50) * 50} mg is the largest 50 mg step under the limit.`,
  sources: [{ type: 'original-example', file: 'assets/interactions/parameter.mjs' }],
  exportPolicy: 'final',
  className: 'st cs-laboratory',
  content: `<h1 class="st-head">At ${start.dose} mg every ${drug.interval} hours, peaks stay under the ${limits.max} mg/L limit only while the half-life is shorter than ${one(limitHalfLife)} hours</h1>
<p class="st-dek">A fictional antibiotic, one-compartment model: IV dose every ${drug.interval} h, ${drug.volume} L volume of distribution, first ${drug.horizon} hours.</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>Illustrative model · not dosing guidance</span><span>Interaction · Parameter explorer</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'parameter',
    initial: { ...start },
    data: { model: 'dosing', constants: { ...drug }, window: [limits.min, limits.max],
      refs: [{ y: limits.max, label: `Toxic above ${limits.max} mg/L`, tone: 'negative' }, { y: limits.min, label: `Effective above ${limits.min} mg/L`, tone: 'muted', side: 'below' }],
      bands: [{ from: limits.min, to: limits.max }] },
    controls: {
      dose: { label: `Dose every ${drug.interval} hours (mg)`, min: 250, max: 1000, step: 50, format: '{v} mg' },
      halfLife: { label: 'Elimination half-life (hours)', min: 3, max: 12, step: 0.5, digits: 1, format: '{v} h' },
    },
    axes: { x: { title: 'Hours after the first dose', ticks: Array.from({ length: drug.horizon / drug.interval + 1 }, (_, i) => i * drug.interval) },
      y: { title: 'Concentration in plasma (mg/L)', min: 0, max: 45, ticks: [0, 10, 20, 30, 40], digits: 1 } },
    text: {
      status: `Half-life {halfLife} h, {dose} mg: above ${limits.max} mg/L for {hoursAbove} of ${drug.horizon} hours, below ${limits.min} mg/L for {hoursBelow}.`,
      readout: [{ value: '{peak} mg/L', label: 'peak after the last dose' }, { value: '{trough} mg/L', label: `trough at ${drug.horizon} hours` }],
      peakLabel: 'peak {v}', troughLabel: 'trough {v}',
      figure: 'Plasma concentration over 72 hours with the effective and toxic limits',
    },
  }],
};
