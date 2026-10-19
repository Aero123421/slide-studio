// Motion study · Focus without deleting context — a veil dims every cell outside the focus
// block, but the cells stay visible and the axes stay at full strength, so the audience
// keeps its bearings. Builds: 1 dim the context and outline the focus, 2 the numbers inside.
import { svgRoot, el, g, band, textLines, theme as makeTheme } from '../runtime/figure.mjs';

// On-call pages by weekday and hour of day, Q3 (illustrative production service).
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const pages = [
  [1, 1, 2, 2, 2, 1, 2, 1, 1, 2, 3, 3, 3, 3, 4, 3, 3, 3, 0, 2, 0, 1, 0, 2],
  [2, 2, 1, 0, 1, 1, 1, 2, 1, 4, 3, 5, 4, 3, 19, 19, 25, 7, 3, 2, 2, 1, 2, 1],
  [1, 1, 2, 2, 2, 1, 1, 2, 3, 3, 3, 4, 4, 4, 19, 17, 24, 5, 1, 0, 2, 2, 2, 1],
  [1, 0, 1, 1, 0, 2, 1, 1, 0, 3, 2, 3, 4, 3, 20, 22, 16, 5, 2, 1, 2, 0, 0, 1],
  [1, 2, 1, 1, 2, 1, 0, 2, 1, 3, 3, 5, 3, 4, 4, 2, 5, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 3, 2, 3, 2, 0, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 2, 1, 2, 2, 3, 2, 1, 1, 0, 0, 1, 1, 0, 0],
];
const focus = { days: ['Tue', 'Wed', 'Thu'], from: 14, to: 17, label: 'Deploy window' }; // hours [from, to)
const total = pages.flat().reduce((s, v) => s + v, 0);
const inFocus = (d, h) => focus.days.includes(days[d]) && h >= focus.from && h < focus.to;
const focusPages = pages.flatMap((row, d) => row.filter((_, h) => inFocus(d, h))).reduce((s, v) => s + v, 0);
const focusHours = focus.days.length * (focus.to - focus.from);
const share = Math.round((focusPages / total) * 100), hourShare = Math.round((focusHours / (7 * 24)) * 100);
const max = Math.max(...pages.flat());

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, left = 60, top = 30, bottom = 40;
  const x = band([...Array(24).keys()], [left, W], { inner: 0.08, outer: 0 }), y = band(days, [top, H - bottom], { inner: 0.08, outer: 0 });
  const cls = v => Math.min(6, Math.floor((v / (max + 1)) * 7)); // seven classes on the sequential ramp
  const F = { x: x(focus.from), y: y(focus.days[0]), w: x(focus.to - 1) + x.bw - x(focus.from), h: y(focus.days.at(-1)) + y.bw - y(focus.days[0]) };
  const grid = { x: x(0), y: y(days[0]), w: x(23) + x.bw - x(0), h: y(days.at(-1)) + y.bw - y(days[0]) };
  return svgRoot({ id: 'motion-focus-context-fig', width: W, height: H, theme: t,
    title: 'On-call pages by weekday and hour of day, third quarter',
    desc: `${total} pages. ${focusPages} of them (${share}%) arrived ${focus.days[0]}–${focus.days.at(-1)} ${focus.from}:00–${focus.to}:00, ${focusHours} of the week's 168 hours (${hourShare}%).` },
  // Mask luminance (white shows the veil, black cuts the hole): literal by definition, not a colour.
  el('defs', {}, el('mask', { id: 'motion-focus-context-hole', maskUnits: 'userSpaceOnUse', x: grid.x - 2, y: grid.y - 2, width: grid.w + 4, height: grid.h + 4 },
    el('rect', { x: grid.x - 2, y: grid.y - 2, width: grid.w + 4, height: grid.h + 4, fill: '#fff' }),
    el('rect', { x: F.x - 1, y: F.y - 1, width: F.w + 2, height: F.h + 2, fill: '#000' }))),
  pages.map((row, d) => row.map((v, h) => el('rect', { x: x(h), y: y(days[d]), width: x.bw, height: y.bw, rx: 3, fill: t.seq(cls(v)) }))),
  days.map(d => textLines([d], { x: left - 14, y: y.center(d), size: 17, anchor: 'end', valign: 'middle', fill: focus.days.includes(d) ? t.c('ink') : t.c('muted'), weight: focus.days.includes(d) ? 700 : 400 })),
  [0, 3, 6, 9, 12, 14, 17, 20, 23].map(h => textLines([`${String(h).padStart(2, '0')}:00`], { x: x(h), y: H - bottom + 12, size: 16, valign: 'top', fill: h === focus.from || h === focus.to ? t.c('ink') : t.c('muted'), weight: h === focus.from || h === focus.to ? 700 : 400 })),
  textLines(['Pages per hour slot, July–September'], { x: W, y: 4, size: 16, anchor: 'end', valign: 'top', fill: t.c('muted') }),
  // Build 1 — the veil: context dims to half its contrast, never disappears.
  el('rect', { x: grid.x - 2, y: grid.y - 2, width: grid.w + 4, height: grid.h + 4, fill: t.c('paper'), mask: 'url(#motion-focus-context-hole)', 'data-states': { 0: { opacity: 0 }, 1: { opacity: 0.5 } }, 'data-duration': 700 }),
  el('rect', { x: F.x - 4, y: F.y - 4, width: F.w + 8, height: F.h + 8, rx: 5, fill: 'none', stroke: t.c('accent'), 'stroke-width': 3, 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 300 }),
  textLines([focus.label], { x: F.x + F.w / 2, y: F.y - 14, size: 18, anchor: 'middle', fill: t.c('accent'), weight: 700, attrs: { 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 300 } }),
  // Build 2 — the counts inside the focus block, and what they add up to.
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-duration': 450 },
    pages.map((row, d) => row.map((v, h) => inFocus(d, h) ? textLines([String(v)], { x: x(h) + x.bw / 2, y: y.center(days[d]), size: 18, anchor: 'middle', valign: 'middle', fill: cls(v) >= 4 ? t.c('paper') : t.c('ink'), weight: 700 }) : '')),
    textLines([`${focusPages} of ${total} pages`, `${share}% of the quarter`], { x: F.x + F.w + 20, y: F.y + F.h / 2, size: 18, valign: 'middle', fill: t.c('ink'), weight: 600, lineHeight: 1.3, halo: t.c('paper') })));
}

export default {
  study: true,
  id: 'motion-focus-context',
  title: 'Focus and context: dim, never delete',
  className: 'st cs-terminal-dark',
  notes: `Purpose: Point at one block of a dense chart by dimming everything else, while the dimmed cells and the full-strength axes keep the audience oriented.\nModify: Replace \`pages\` (7 × 24) and \`focus\`; the veil's hole, the outline, the counts and the shares (${share}% of pages in ${hourShare}% of hours) recompute.\nInvariant: The veil halves the contrast of the context but never hides a cell; axis labels are never dimmed; the focus block is cut out of the veil, so it keeps its true colors.\nStatic: The final build shows the dimmed week, the outlined focus block with its counts, and the share beside it.`,
  sources: [{ type: 'original-example', file: 'assets/motion/focus-context.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${share}% of on-call pages arrive in ${hourShare}% of the week: the ${focus.days[0]}–${focus.days.at(-1)} afternoon <em>${focus.label.toLowerCase()}</em></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · ${total} pages from one production service, July–September</span><span>Motion · dim the context, keep the axes (2 builds)</span></p>`,
};
