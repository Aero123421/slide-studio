// Diagram study · Interval forest — estimates and their intervals aligned on one axis, with references.
// The overall row is not typed in: it is pooled from the segment rows (inverse-variance weights,
// standard errors recovered from the stated 95% intervals). Rows, pool and headline come from `segments`.
import { forestPlot, el, g, textLines, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const segments = [ // lift in checkout conversion, new − old, percentage points, 95% CI (normal approx.), 14-day test (illustrative)
  { label: 'Desktop', sessions: 182000, estimate: 1.4, low: 0.6, high: 2.2 },
  { label: 'Mobile web', sessions: 241000, estimate: 2.6, low: 1.5, high: 3.7 },
  { label: 'iOS app', sessions: 96000, estimate: 1.9, low: 0.8, high: 3.0 },
  { label: 'Android app', sessions: 88000, estimate: 2.2, low: 1.0, high: 3.4 },
  { label: 'Tablet', sessions: 14000, estimate: 0.4, low: -1.6, high: 2.4 },
];
const worthwhile = 0.5; // smallest lift worth shipping, percentage points
const z = 1.96, weight = s => 1 / ((s.high - s.low) / (2 * z)) ** 2;
const W = segments.reduce((a, s) => a + weight(s), 0);
const est = segments.reduce((a, s) => a + weight(s) * s.estimate, 0) / W, se = 1 / Math.sqrt(W);
const overall = { label: 'All sessions', estimate: est, low: est - z * se, high: est + z * se };
const sessions = segments.reduce((a, s) => a + s.sessions, 0);
const unsure = segments.filter(s => s.low <= 0 && s.high >= 0);
const p1 = v => fmt(v, { digits: 1, sign: true });
const list = names => (names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0]);

export function figure(theme = 'css') {
  const t = makeTheme(theme);
  return forestPlot({
    id: 'interval-forest-fig', theme, width: 1152, height: 450, fontSize: 16,
    title: 'Lift in checkout conversion by platform, new minus old checkout, with 95% confidence intervals',
    desc: `Pooled lift ${p1(overall.estimate)} points (95% CI ${p1(overall.low)} to ${p1(overall.high)}). Every platform's estimate is positive; ${unsure.map(s => s.label).join(', ') || 'no'} interval${unsure.length === 1 ? '' : 's'} include zero. Dashed line: smallest lift worth shipping, ${p1(worthwhile)}.`,
    rows: segments.map(s => ({ label: `${s.label} (${fmt(s.sessions / 1000)}k)`, estimate: s.estimate, low: s.low, high: s.high, weight: s.sessions })),
    summary: overall, reference: 0, hollowIfCrossing: true, format: { digits: 1, sign: true },
    labelTitle: 'Platform (sessions)', columnTitle: 'Lift, pts [95% CI]', xLabel: 'Change in conversion rate, percentage points',
    favors: ['old checkout converts better', 'new checkout converts better'],
    // a decision threshold beside the null reference: is the effect large enough to matter?
    extra: ({ x, box }) => g({ class: 'ss-ref' },
      el('line', { x1: x(worthwhile), x2: x(worthwhile), y1: box.y - 6, y2: box.y + box.h, stroke: t.c('muted'), 'stroke-width': 1.4, 'stroke-dasharray': '5 4' }),
      textLines([`Worth shipping: ${p1(worthwhile)}`], { x: x(worthwhile) + 8, y: box.y - 14, size: 15, fill: t.c('muted'), weight: 600 })),
  });
}

export default {
  study: true,
  id: 'interval-forest',
  title: 'Interval forest: estimates beside their intervals and references',
  className: 'st cs-terminal-dark',
  notes: 'Purpose: Put every estimate next to its interval on one aligned axis, so uncertainty, the null reference and a decision threshold are read together.\nModify: Replace `segments` with your estimates and their stated intervals (here 95% CIs). The pooled row, hollow markers for intervals that include zero, the threshold line and the headline recompute.\nInvariant: The interval definition is printed in the column title and source; intervals are taken from the analysis, never inferred from a picture; the pooled row says how it was pooled.\nStatic: Already static. For a build, reveal the segment rows, then the pooled diamond.',
  sources: [{ type: 'original-example', file: 'assets/svg/interval-forest.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">The new checkout lifts conversion by ${fmt(overall.estimate, { digits: 1 })} points across <em>all sessions</em>; ${unsure.length ? `only the ${list(unsure.map(s => s.label.toLowerCase()))} interval${unsure.length > 1 ? 's' : ''} still include${unsure.length > 1 ? '' : 's'} zero` : 'every platform\'s interval excludes zero'}</h1>
<p class="st-dek">New minus old checkout over 14 days, ${fmt(sessions)} sessions; bars are 95% confidence intervals</p>
<figure class="st-fig" style="top:204px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · pooled row uses inverse-variance weights from the stated intervals; hollow marks include zero</span><span>Forest plot</span></p>`,
};
