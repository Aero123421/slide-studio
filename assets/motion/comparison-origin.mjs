// Motion study · Establish the origin first — the zero line and what it means ("same as last
// year") are on screen before any quantity. Build 1 grows every change from that origin, in
// row order; build 2 points at the largest fall. Rows, scale and labels come from `subjects`.
import { svgRoot, el, g, linear, band, textLines, barPath, measureText, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const subjects = [ // share of entries graded pass or above, %, Larkfield Learning Trust, 2024 and 2025 (illustrative)
  { label: 'Computing', y2024: 67.2, y2025: 74.0 },
  { label: 'Biology', y2024: 78.5, y2025: 82.6 },
  { label: 'English literature', y2024: 80.1, y2025: 83.0 },
  { label: 'History', y2024: 75.0, y2025: 76.6 },
  { label: 'Mathematics', y2024: 71.9, y2025: 72.7 },
  { label: 'Geography', y2024: 77.4, y2025: 76.8 },
  { label: 'Chemistry', y2024: 73.3, y2025: 70.9 },
  { label: 'Modern languages', y2024: 66.4, y2025: 61.1 },
];
const rows = subjects.map(s => ({ ...s, change: +(s.y2025 - s.y2024).toFixed(1) })).sort((a, b) => b.change - a.change);
const up = rows.filter(r => r.change > 0);
const worst = rows.at(-1);
const words = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const pts = v => `${fmt(v, { digits: 1, sign: true })} pts`;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 20, r: 170, t: 44, b: 44 };
  const lim = Math.ceil(Math.max(...rows.map(r => Math.abs(r.change))) + 1);
  const x = linear([-lim, lim], [m.l, W - m.r]);
  const y = band(rows.map(r => r.label), [m.t, H - m.b], { inner: 0.36, outer: 0.12 });
  const x0 = x(0), col = W - 18;
  return svgRoot({ id: 'motion-comparison-origin-fig', width: W, height: H, theme: t,
    title: 'Change in pass rate by subject, 2025 compared with 2024, percentage points',
    desc: `${up.length} of ${rows.length} subjects improved on 2024. ${rows[0].label} rose most (${pts(rows[0].change)}); ${worst.label} fell most (${pts(worst.change)}), to ${fmt(worst.y2025, { digits: 1 })}%.` },
  // build 0: the origin, what it means, and which side means what
  el('line', { x1: x0, x2: x0, y1: m.t - 14, y2: H - m.b + 6, stroke: t.c('ink'), 'stroke-width': 2 }),
  textLines(['0 = same pass rate as in 2024'], { x: x0, y: H - m.b + 16, size: 16, anchor: 'middle', valign: 'top', weight: 650, fill: t.c('ink') }),
  textLines(['← lower than 2024'], { x: x0 - 14, y: m.t - 18, size: 16, anchor: 'end', fill: t.c('negative'), weight: 650 }),
  textLines(['higher than 2024 →'], { x: x0 + 14, y: m.t - 18, size: 16, fill: t.c('positive'), weight: 650 }),
  textLines(['Pass rate 2025'], { x: col, y: m.t - 18, size: 16, anchor: 'end', fill: t.c('muted') }),
  rows.map(r => textLines([r.label], { x: r.change >= 0 ? x0 - 12 : x0 + 12, y: y.center(r.label), size: 18, anchor: r.change >= 0 ? 'end' : 'start', valign: 'middle', fill: t.c('ink') })),
  // build 1: quantities grow out of the origin, in row order
  rows.map((r, k) => {
    const xe = x(r.change), pos = r.change >= 0, c = pos ? t.c('positive') : t.c('negative');
    return g({},
      el('path', { d: barPath(Math.min(x0, xe), y(r.label), Math.abs(xe - x0), y.bw, 3, pos ? 'right' : 'left'), fill: c,
        style: `transform-origin:${pos ? '0% 50%' : '100% 50%'}`, 'data-step': 1, 'data-motion': 'grow-x', 'data-delay': k * 90, 'data-duration': 650 }),
      textLines([pts(r.change)], { x: xe + (pos ? 10 : -10), y: y.center(r.label), size: 17, weight: 700, anchor: pos ? 'start' : 'end', valign: 'middle', fill: c,
        attrs: { 'font-variant-numeric': 'tabular-nums', 'data-step': 1, 'data-motion': 'reveal', 'data-delay': k * 90 + 450 } }),
      textLines([`${fmt(r.y2025, { digits: 1 })}%`], { x: col, y: y.center(r.label), size: 17, anchor: 'end', valign: 'middle', fill: t.c('ink'),
        attrs: { 'font-variant-numeric': 'tabular-nums', 'data-step': 1, 'data-motion': 'reveal', 'data-delay': k * 90 + 450 } }));
  }),
  // build 2: the note sits in the empty part of its own row, beside the subject's name
  textLines([`Largest fall: ${fmt(worst.y2024, { digits: 1 })}% → ${fmt(worst.y2025, { digits: 1 })}% of entries passed`], { x: x0 + 12 + measureText(worst.label, 18) + 28, y: y.center(worst.label), size: 16, weight: 650, valign: 'middle', fill: t.c('negative'),
    attrs: { 'data-step': 2, 'data-motion': 'reveal' } }));
}

export default {
  study: true,
  id: 'motion-comparison-origin',
  title: 'Comparison origin: the shared zero before the quantities',
  className: 'st cs-classroom-bright',
  notes: 'Purpose: Put the shared baseline on screen, with its meaning in words, before any quantity appears, so every bar is read as a distance from that origin.\nModify: Replace `subjects` (two rates per row); changes, sort order, scale, the 2025 column and the headline recompute. For ratios, use 1 (or 100%) as the origin and say so.\nInvariant: The origin line and its definition are visible at build 0 and never move; bars grow from it, never from the plot edge; both directions are named; values carry their sign and unit.\nStatic: The final build shows every change, the 2025 rates and the note on the largest fall.',
  sources: [{ type: 'original-example', file: 'assets/motion/comparison-origin.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${words[up.length] ?? up.length} of ${words[rows.length]?.toLowerCase() ?? rows.length} subjects beat their 2024 pass rate; ${worst.label.toLowerCase()} fell ${fmt(Math.abs(worst.change), { digits: 1 })} points</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · Larkfield Learning Trust, eight secondary schools, summer exams</span><span>Motion · origin first, then diverging bars (2 builds)</span></p>`,
};
