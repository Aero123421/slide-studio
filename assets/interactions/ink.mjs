// Interaction study · Live annotation — mark the evidence on an incident chart while you talk.
// The chart is drawn by the widget from `errors`; the preset ring (the keyboard route) is placed on
// the plateau computed below, and the headline counts the minutes above the alert line.
const start = { h: 13, m: 30 };                       // first sample, one per minute
const errors = [0.45, 0.51, 0.57, 0.3, 0.38, 0.39, 0.43, 0.41, 0.42, 0.54, 0.44, 0.36, 0.44, 0.5, 0.33, 0.42, 0.37, 0.39, 0.46, 0.45, 0.27, 0.36, 0.49, 0.38,
  0.44, 0.32, 0.26, 0.4, 0.32, 0.45, 0.35, 0.34, 0.32, 0.44, 0.47, 0.55, 0.31, 0.52, 0.44, 0.31, 0.5, 1.53, 2.54, 4.06, 4.68, 6.34, 5.91, 6.34, 4.87, 5.69,
  5.81, 5.86, 5.98, 6.03, 5.34, 4.73, 5.86, 6.05, 5.92, 6.1, 5.86, 5.22, 5.43, 6.08, 5.25, 4.9, 5.92, 5.32, 5.39, 5.24, 5.19, 5.84, 5.97, 5.43, 5.72,
  5.48, 5.69, 4.83, 4.78, 5.16, 1.76, 1.35, 1.07, 0.67, 0.35, 0.43, 0.51, 0.33, 0.3, 0.59, 0.38, 0.29, 0.46, 0.45, 0.4, 0.37, 0.52, 0.4, 0.43, 0.45, 0.44,
  0.51, 0.51, 0.43, 0.39, 0.38, 0.49, 0.57, 0.37, 0.22, 0.4, 0.53, 0.45, 0.37, 0.46, 0.39, 0.47, 0.44, 0.4, 0.47, 0.49];   // checkout errors, % of requests
const release = 40, rollback = 79;                    // minute indexes: release 4.32 goes out; rollback completes
const alert = 1;                                      // % of requests: the on-call alert line
const clock = i => { const t = start.h * 60 + start.m + i; return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
const before = errors.slice(0, release).sort((a, b) => a - b), normal = before[before.length >> 1];
const above = errors.map((v, i) => (v > alert ? i : -1)).filter(i => i >= 0);
const peak = Math.max(...errors), middle = Math.round((above[0] + above[above.length - 1]) / 2);
const ID = 'interaction-ink';

export default {
  study: true,
  id: ID,
  title: 'Live annotation: marking an incident chart while presenting',
  notes: `Purpose: Let the presenter circle or underline what they are talking about on the evidence itself, then clear it; the preset ring is the keyboard route and marks the ${above.length}-minute plateau.
Modify: Replace \`errors\` (one value per minute), \`release\`, \`rollback\` and \`alert\`; the chart, the ring's position and the headline recompute.
Invariant: Ink is drawn over the chart, never into it: clearing restores the evidence untouched. Annotations live in this browser only; nothing is sent or stored.
Static: The export shows the chart with whatever ink is on it at the time (none at the start). Draw the ring before exporting if the handout should carry it.`,
  sources: [{ type: 'original-example', file: 'assets/interactions/ink.mjs' }],
  exportPolicy: 'final',
  className: 'st cs-terminal-dark',
  content: `<h1 class="st-head">After the ${clock(release)} release, checkout errors stayed above ${alert}% for ${above.length} minutes, peaking at ${Math.round(peak / normal)} times the usual rate</h1>
<p class="st-dek">Checkout errors per minute, ${clock(0)}–${clock(errors.length - 1)} on 14 October 2026 (fictional service).</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>Illustrative data · usual rate = median of the ${release} minutes before the release (${normal.toFixed(2)}%)</span><span>Interaction · Live annotation</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'ink',
    initial: { paths: [] },
    data: {
      lines: [{ name: '', values: errors, tone: 'accent', width: 2.2 }],
      refs: [{ y: alert, label: `alert line ${alert}%`, tone: 'muted', align: 'left' }],
      marks: [{ at: release, label: `release ${clock(release)}` }, { at: rollback, label: `rollback ${clock(rollback)}` }],
      preset: { at: middle, rx: 150, ry: 70 }, inkTone: 'negative',
    },
    axes: {
      x: { ticks: Array.from({ length: 9 }, (_, k) => ({ value: k * 15, label: clock(k * 15) })) },
      y: { title: 'Checkout errors (% of requests)', min: 0, max: 8, ticks: [0, 2, 4, 6, 8], digits: 1 },
    },
    text: {
      preset: 'Circle the error plateau', clear: 'Clear annotations', reset: 'Reset',
      status: '{marks|mark|marks} on the chart. Ink stays in this browser and clears with one button.',
      figure: 'Checkout errors per minute with the release and rollback marked',
    },
  }],
};
