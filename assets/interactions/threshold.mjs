// Interaction study · Decision threshold — an early-warning score's alert level trades missed cases for alarms.
// The widget (kind 'threshold') counts the four outcomes from `patients` at every slider position;
// the headline counts them here from the same data at the starting threshold.
const scoreRange = [0, 10];                // early-warning score at triage, whole points
const start = 5;                           // alert when the score is at or above this value
// Patients per score (fictional emergency-department sample, March 2026): sepsis confirmed within 48 h, or not.
const sepsis = { 3: 1, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 1 };
const noSepsis = { 0: 6, 1: 9, 2: 9, 3: 7, 4: 6, 5: 4, 6: 3, 7: 2, 8: 1, 9: 1 };

const expand = (counts, label) => Object.entries(counts).flatMap(([score, n]) => Array.from({ length: n }, () => ({ score: Number(score), label })));
const patients = [...expand(sepsis, 1), ...expand(noSepsis, 0)];
const count = t => {
  const c = { tp: 0, fp: 0, fn: 0, tn: 0 };
  for (const p of patients) c[p.score >= t ? (p.label ? 'tp' : 'fp') : (p.label ? 'fn' : 'tn')]++;
  return c;
};
const now = count(start), cases = now.tp + now.fn, alerts = now.tp + now.fp;
const ID = 'interaction-threshold';

export default {
  study: true,
  id: ID,
  title: 'Decision threshold: missed cases against false alarms',
  notes: `Purpose: Show what moving an alert threshold does to all four outcomes at once, so the trade between missed cases and false alarms is argued with counts, not adjectives.
Modify: Replace the per-score counts in \`sepsis\` and \`noSepsis\` (or pass raw scores and 0/1 labels); set \`scoreRange\` and \`start\`. Every count, label and the headline recompute.
Invariant: One dot per patient, placed by score and stacked; the row is the true outcome, never the prediction. Red marks only missed cases; the threshold is drawn between whole scores because the rule is "at or above".
Static: The export shows the starting threshold (${start}) with all four counts. For a decision paper, add pages for the thresholds under discussion.`,
  sources: [{ type: 'original-example', file: 'assets/interactions/threshold.mjs' }],
  exportPolicy: 'final',
  className: 'st cs-clinical-trial',
  content: `<h1 class="st-head">An alert at score ${start} catches ${now.tp} of ${cases} sepsis cases, but ${now.fp} of its ${alerts} alerts are false alarms</h1>
<p class="st-dek">${patients.length} adults seen in one emergency department in March 2026; ${cases} had sepsis.</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>Illustrative data · early-warning score recorded at triage, fictional hospital</span><span>Interaction · Decision threshold</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'threshold',
    initial: { threshold: start },
    data: { values: patients.map(p => p.score), labels: patients.map(p => p.label), domain: scoreRange, step: 1 },
    controls: { threshold: { label: 'Alert threshold (score)', min: 1, max: scoreRange[1], step: 1, digits: 0, format: '{v} or above' } },
    axes: { x: { title: 'Early-warning score at triage', ticks: Array.from({ length: scoreRange[1] - scoreRange[0] + 1 }, (_, i) => scoreRange[0] + i), digits: 0 } },
    text: {
      reset: 'Reset',
      positive: 'Sepsis', negative: 'No sepsis', rowCount: '{n} patients',
      tp: '{tp} caught', fn: '{fn} missed', fp: '{fp} false alarms', tn: '{tn} not alerted',
      rule: 'Alert at {threshold} or above',
      status: 'Alert at {threshold} or above: {tp} of {positives} sepsis cases caught and {fn} missed; {flagged|alert|alerts}, {fp} of them false.',
      figure: 'Patients by early-warning score, split by confirmed sepsis, with the alert threshold',
    },
  }],
};
