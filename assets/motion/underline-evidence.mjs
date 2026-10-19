// Motion study · Underline the evidence — in a quoted source passage, a rule draws under
// the phrase that carries the claim while the surrounding sentences step back; the numbers
// behind the phrase follow. Builds: 1 underline + dim, 2 the figures behind the phrase.
import { svgRoot, el, g, band, linear, textLines, statesAttr, theme as makeTheme, fmt } from '../runtime/figure.mjs';

// Urgent housing repairs closed in 2025, and how many were reopened within 30 days for the
// same fault (illustrative audit sample).
const quarters = [
  { q: 'Q1', closed: 512, within24h: 476, reopened: 108 },
  { q: 'Q2', closed: 547, within24h: 513, reopened: 132 },
  { q: 'Q3', closed: 561, within24h: 531, reopened: 151 },
  { q: 'Q4', closed: 560, within24h: 529, reopened: 168 },
];
const sum = k => quarters.reduce((s, r) => s + r[k], 0);
const closed = sum('closed'), reopenShare = sum('reopened') / closed, fast = Math.round((sum('within24h') / closed) * 100);
const oneIn = Math.round(1 / reopenShare); // "one in four"
const words = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const rate = r => Math.round((r.reopened / r.closed) * 100);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 312, H = 200, base = H - 30;
  const x = band(quarters.map(r => r.q), [0, W], { inner: 0.36, outer: 0.05 }), y = linear([0, 40], [base, 26]);
  return svgRoot({ id: 'motion-underline-evidence-fig', width: W, height: H, theme: t,
    title: 'Urgent repairs reopened within 30 days, share of jobs closed, by quarter of 2025',
    desc: quarters.map(r => `${r.q} ${rate(r)}%`).join(', ') + '. The share rose every quarter.' },
  textLines(['Reopened within 30 days, by quarter'], { x: 0, y: 0, size: 16, valign: 'top', fill: t.c('muted') }),
  quarters.map(r => g({},
    el('rect', { x: x(r.q), y: y(rate(r)), width: x.bw, height: base - y(rate(r)), fill: t.c('context') }),
    textLines([`${rate(r)}%`], { x: x.center(r.q), y: y(rate(r)) - 8, size: 16, anchor: 'middle', fill: t.c('ink'), weight: 700 }),
    textLines([r.q], { x: x.center(r.q), y: base + 8, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') }))),
  el('line', { x1: 0, x2: W, y1: base, y2: base, stroke: t.c('ink'), 'stroke-width': 1.2 }));
}

// Surrounding sentences step back to muted when the underline arrives; the phrase stays ink.
const dim = statesAttr({ 0: { color: 'var(--ss-ink)' }, 1: { color: 'var(--ss-muted)' } });
// The rule is a background on the inline phrase, so it follows the text across line breaks.
const rule = statesAttr({ 0: { backgroundSize: '0% 3px' }, 1: { backgroundSize: '100% 3px' } });

export default {
  study: true,
  id: 'motion-underline-evidence',
  title: 'Underline evidence: point at the phrase that carries the claim',
  className: 'st st--rail cs-risk-audit',
  notes: `Purpose: In a quoted source, put the audience's eye on the exact phrase the headline relies on, then show the numbers behind that phrase.\nModify: Replace the passage and the \`quarters\` sample; the share (${Math.round(reopenShare * 100)}%), the "one in ${words[oneIn]}" wording and the chart recompute. Keep the underlined phrase to one clause.\nInvariant: The underline draws along the text in reading order, across line breaks; the rest of the passage stays legible (muted, not hidden); the passage is quoted, not paraphrased.\nStatic: The final build shows the passage with the phrase underlined and the rail numbers.`,
  sources: [{ type: 'original-example', file: 'assets/motion/underline-evidence.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="max-width:760px">One in ${words[oneIn]} urgent repairs closed in 2025 was reopened within a month</h1>
<blockquote style="position:absolute;left:64px;top:206px;width:780px;margin:0;padding-left:30px;border-left:3px solid var(--ss-rule);font:400 30px/1.55 var(--ss-font-serif);color:var(--ss-ink)" data-region="primary">
<p style="margin:0"><span data-states="${dim}" data-duration="600">Response times improved in every quarter, and ${fast}% of urgent repairs were closed within 24 hours. However, our sample shows that </span><span style="color:var(--ss-ink);background:linear-gradient(var(--ss-accent),var(--ss-accent)) no-repeat 0 94%/0% 3px;padding-bottom:2px" data-states="${rule}" data-duration="1100" data-easing="linear">one in ${words[oneIn]} urgent jobs recorded as complete was reopened within 30 days for the same fault</span><span data-states="${dim}" data-duration="600">. The target measures closure, not resolution.</span></p>
<footer style="margin-top:18px;font:400 17px/1.4 var(--ss-font-sans);color:var(--ss-muted)">Internal audit of the housing repairs service, March 2026 (excerpt)</footer>
</blockquote>
<div class="st-rail" style="justify-content:flex-start;top:206px" data-region="support">
  <div class="st-kpi" data-step="2" data-motion="reveal"><b class="st-accent">${Math.round(reopenShare * 100)}%</b><span>of ${fmt(closed)} urgent jobs closed in 2025 were reopened within 30 days</span></div>
  <figure style="margin:0" data-step="2" data-motion="reveal" data-delay="200">${figure()}</figure>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · audit sample of urgent repair jobs, January–December 2025</span><span>Motion · underline the evidence phrase (2 builds)</span></p>`,
};
