// Composition study · Three aligned views — one set of observations read three ways. The three
// panels share a question line, an answer line, a plot top and a baseline, so the eye compares
// across them without boxes. Every mark and number is computed from `pupils`.
import { svgRoot, el, g, textLines, linear, theme as makeTheme, fmt, quantile } from '../runtime/figure.mjs';

const ID = 'composition-three-aligned-views';
// Year 4 reading intervention, one class. Reading age in months from the same standardised test
// in late September 2025 and mid-March 2026; null = no March test (illustrative).
const pupils = [
  { sep: 94, mar: 103 }, { sep: 101, mar: 107 }, { sep: 88, mar: 99 }, { sep: 110, mar: 114 },
  { sep: 97, mar: 105 }, { sep: 105, mar: 112 }, { sep: 92, mar: 104 }, { sep: 99, mar: 97 },
  { sep: 115, mar: 120 }, { sep: 86, mar: 100 }, { sep: 103, mar: 110 }, { sep: 96, mar: 106 },
  { sep: 108, mar: 111 }, { sep: 90, mar: 99 }, { sep: 100, mar: 106 }, { sep: 112, mar: 113 },
  { sep: 95, mar: 103 }, { sep: 104, mar: 111 }, { sep: 89, mar: 102 }, { sep: 98, mar: null, why: 'moved school' },
  { sep: 107, mar: 113 }, { sep: 93, mar: 103 }, { sep: 101, mar: 100 }, { sep: 118, mar: 122 },
  { sep: 91, mar: null, why: 'moved school' }, { sep: 99, mar: 107 }, { sep: 106, mar: 111 }, { sep: 97, mar: null, why: 'long absence' },
];
const monthsBetween = 6; // calendar months between the two tests

// derived values
const tested = pupils.filter(p => p.mar != null), missing = pupils.filter(p => p.mar == null);
const change = tested.map(p => p.mar - p.sep);
const rose = change.filter(c => c > 0).length;
const medianGain = quantile(change, 0.5), lowQ = quantile(change, 0.25), highQ = quantile(change, 0.75);
const reasons = Object.entries(missing.reduce((m, p) => ({ ...m, [p.why]: (m[p.why] || 0) + 1 }), {}));
const signed = v => fmt(v, { sign: true });

const PANEL = 368, GUTTER = 24, H = 372, BASE = 318; // three 4-column panels; shared baseline

export function figure(theme = 'css') {
  const t = makeTheme(theme);
  const x0 = k => k * (PANEL + GUTTER);
  const top = 6;
  // 1 · pairs: September and March on one reading-age scale
  const y = linear([84, 126], [BASE - 8, top + 40]);
  const ax = x0(0) + 64, bx = x0(0) + PANEL - 34;
  const pairs = [
    ...[84, 96, 108, 120].map(m => g({},
      el('line', { x1: ax - 12, x2: bx + 12, y1: y(m), y2: y(m), stroke: t.c('grid') }),
      textLines([`${m / 12}`], { x: ax - 22, y: y(m), size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }))),
    ...tested.map(p => el('line', { x1: ax, y1: y(p.sep), x2: bx, y2: y(p.mar), stroke: p.mar < p.sep ? t.c('ink') : t.c('muted'), 'stroke-width': p.mar < p.sep ? 2.4 : 1.4, 'stroke-dasharray': p.mar < p.sep ? '5 4' : null })),
    ...tested.map(p => el('circle', { cx: ax, cy: y(p.sep), r: 3.6, fill: t.c('ink') })),
    ...tested.map(p => el('circle', { cx: bx, cy: y(p.mar), r: 3.6, fill: t.c('ink') })),
    ...missing.map(p => el('circle', { cx: ax, cy: y(p.sep), r: 5, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 2 })),
    textLines(['reading age, years'], { x: x0(0), y: top + 4, size: 16, valign: 'top', fill: t.c('muted') }),
    el('line', { x1: x0(0), x2: x0(0) + PANEL, y1: BASE + 1, y2: BASE + 1, stroke: t.c('ink'), 'stroke-width': 1.2 }),
    textLines(['September'], { x: ax, y: BASE + 12, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') }),
    textLines(['March'], { x: bx, y: BASE + 12, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') }),
  ];
  // 2 · distribution of change: one dot per pupil, 2-month bins
  const bx0 = x0(1) + 16, bx1 = x0(1) + PANEL - 16;
  const xc = linear([-4, 16], [bx0, bx1]);
  const bin = 2, r = 11.5, pitch = 25;
  const counts = new Map();
  const dots = [...change].sort((a, b) => a - b).map(c => {
    const b = Math.floor(c / bin) * bin + bin / 2, k = counts.get(b) || 0;
    counts.set(b, k + 1);
    return { c, cx: xc(b), cy: BASE - r - 2 - k * pitch };
  });
  const stackTop = Math.min(...dots.map(d => d.cy)) - r;
  const dist = [
    el('line', { x1: x0(1), x2: x0(1) + PANEL, y1: BASE + 1, y2: BASE + 1, stroke: t.c('ink'), 'stroke-width': 1.2 }),
    ...[-4, 0, 4, 8, 12, 16].map(v => g({},
      el('line', { x1: xc(v), x2: xc(v), y1: BASE + 1, y2: BASE + 7, stroke: t.c('ink') }),
      textLines([v === 0 ? '0' : signed(v)], { x: xc(v), y: BASE + 12, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }))),
    textLines(['change in reading age, months'], { x: x0(1), y: top + 4, size: 16, valign: 'top', fill: t.c('muted') }),
    ...dots.map(d => el('circle', { cx: d.cx, cy: d.cy, r, fill: d.c < 0 ? t.c('ink') : t.c('context') })),
    el('line', { x1: xc(medianGain), x2: xc(medianGain), y1: stackTop - 44, y2: BASE + 1, stroke: t.c('accent'), 'stroke-width': 3 }),
    textLines([`median ${signed(medianGain)}`], { x: xc(medianGain) - 10, y: stackTop - 30, size: 17, anchor: 'end', fill: t.c('accent'), weight: 700 }),
    textLines([`over ${monthsBetween} months of school`], { x: xc(medianGain) - 10, y: stackTop - 9, size: 16, anchor: 'end', fill: t.c('muted') }),
  ];
  // 3 · completeness: every pupil in the class, retested or not
  const cell = 44, cg = 8, cols = 7;
  const gx = x0(2) + (PANEL - (cols * cell + (cols - 1) * cg)) / 2;
  const rowsN = Math.ceil(pupils.length / cols);
  const gy = BASE - rowsN * cell - (rowsN - 1) * cg - 8;
  const ordered = [...tested, ...missing];
  const grid = [
    textLines(['one square per pupil on the roll'], { x: x0(2), y: top + 4, size: 16, valign: 'top', fill: t.c('muted') }),
    el('line', { x1: x0(2), x2: x0(2) + PANEL, y1: BASE + 1, y2: BASE + 1, stroke: t.c('ink'), 'stroke-width': 1.2 }),
    ...ordered.map((p, i) => {
      const cx = gx + (i % cols) * (cell + cg), cy = gy + Math.floor(i / cols) * (cell + cg), miss = p.mar == null;
      return el('rect', { x: cx, y: cy, width: cell, height: cell, rx: 3, fill: miss ? t.c('paper') : t.c('context'), stroke: miss ? t.c('ink') : 'none', 'stroke-width': miss ? 2 : null, 'stroke-dasharray': miss ? '5 3' : null });
    }),
    textLines([reasons.map(([why, k]) => `${k} ${why}`).join(' · ')], { x: x0(2) + PANEL / 2, y: BASE + 12, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') }),
  ];
  return svgRoot({ id: `${ID}-fig`, width: 3 * PANEL + 2 * GUTTER, height: H, theme: t,
    title: 'Reading ages of one Year 4 class in September and March, shown three ways',
    desc: `Left: ${tested.length} pupils tested twice, ${rose} rose. Middle: change in reading age, median ${signed(medianGain)} months over ${monthsBetween} months. Right: ${missing.length} of ${pupils.length} pupils have no March test (${reasons.map(([w, k]) => `${k} ${w}`).join(', ')}).` },
  g({ class: 'cmp-tav-pairs' }, pairs), g({ class: 'cmp-tav-dist' }, dist), g({ class: 'cmp-tav-grid' }, grid));
}

export default {
  study: true,
  id: ID,
  title: 'Three aligned views: one set of observations, three questions, no cards',
  className: 'st cs-classroom-bright cmp-three-views',
  notes: 'Purpose: Use when one dataset must answer two or three different questions (who changed, by how much, who is missing) and each needs its own view. Alignment makes them one exhibit: the reader compares across panels instead of reading three slides.\nModify: Replace `pupils` (two measurements per unit, null when missing, and a reason); the counts, median, dots and grid recompute. Rewrite each question as a plain question and each answer as the computed result. Keep three panels or fewer; a fourth question is a new page.\nInvariant: Equal 4-column panels (368 px, 24 px gutters) sharing four lines: question, answer, plot top, baseline. Whitespace separates the panels, not boxes or tinted fields. The same units appear in every view (one mark = one pupil); the one accent is the median the headline names; missing observations stay visible as hollow marks.\nStatic: Already static.',
  sources: [{ type: 'original-example', file: `assets/compositions/${ID}.mjs` }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" data-region="title">Year 4 reading ages rose a median of <em>${medianGain}&nbsp;months</em> in a ${monthsBetween}-month term</h1>
<div class="cmp-tav-qa" data-region="support">
  <div><p class="cmp-tav-q">Did each pupil move up?</p><p class="cmp-tav-a">${rose} of ${tested.length} rose</p></div>
  <div><p class="cmp-tav-q">How much did the middle half gain?</p><p class="cmp-tav-a">${signed(lowQ)} to ${signed(highQ)} months</p></div>
  <div><p class="cmp-tav-q">Who is missing?</p><p class="cmp-tav-a">${missing.length} of ${pupils.length} not retested</p></div>
</div>
<figure class="cmp-tav-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · one class, the same standardised reading test in late September 2025 and mid-March 2026</span><span>Three aligned views · pairs, dot plot, roll</span></p>`,
};
