// Motion study · Move a label with its subject — each department's dot and name are one
// group, so when the year changes they travel together and the label can never detach from
// the point it names. Builds: 1 move to 2025 (trails draw as the dots travel), 2 the change.
import { svgRoot, el, g, linear, textLines, measureText, theme as makeTheme, n } from '../runtime/figure.mjs';

// Employee survey: share engaged (%) and voluntary attrition (% a year), 2024 → 2025 (illustrative).
// `side` only says which side of the dot the name sits on.
const departments = [
  { name: 'Customer support', a: [47, 25], b: [62, 16], side: 'right' },
  { name: 'Logistics', a: [51, 18], b: [53, 17], side: 'left' },
  { name: 'Sales', a: [56, 20], b: [58, 19], side: 'right' },
  { name: 'Facilities', a: [55, 11], b: [56, 10], side: 'right' },
  { name: 'Marketing', a: [63, 13], b: [61, 14], side: 'left' },
  { name: 'Finance', a: [66, 8], b: [67, 7], side: 'left' },
  { name: 'Engineering', a: [71, 9], b: [70, 10], side: 'right' },
  { name: 'Legal', a: [69, 4], b: [70, 3], side: 'right' },
  { name: 'People team', a: [73, 5], b: [75, 6], side: 'right' },
];
// The department that moved furthest is the one the page is about (computed, not flagged).
const moved = d => Math.hypot(d.b[0] - d.a[0], d.b[1] - d.a[1]);
const focus = [...departments].sort((p, q) => moved(q) - moved(p))[0];
departments.forEach(d => { d.focus = d === focus; });
const dEng = focus.b[0] - focus.a[0], dAttr = focus.a[1] - focus.b[1];

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 66, r: 40, t: 34, b: 56 };
  const x = linear([40, 80], [m.l, W - m.r]), y = linear([0, 30], [H - m.b, m.t]);
  const P = ([e, r]) => [x(e), y(r)];
  const shift = d => { const [ax, ay] = P(d.a), [bx, by] = P(d.b); return { 0: { transform: `matrix(1,0,0,1,${n(ax - bx)},${n(ay - by)})` }, 1: { transform: 'matrix(1,0,0,1,0,0)' } }; };
  return svgRoot({ id: 'motion-tethered-label-fig', width: W, height: H, theme: t,
    title: 'Engagement and voluntary attrition by department, 2024 and 2025',
    desc: `${focus.name} moved from ${focus.a[0]}% engaged and ${focus.a[1]}% attrition to ${focus.b[0]}% and ${focus.b[1]}%; the other departments moved by at most ${Math.ceil(Math.max(...departments.filter(d => !d.focus).map(moved)))} points.` },
  [0, 10, 20, 30].map(v => g({}, el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: v ? t.c('grid') : t.c('ink'), 'stroke-width': v ? 1 : 1.3 }),
    textLines([`${v}%`], { x: m.l - 12, y: y(v), size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
  [40, 50, 60, 70, 80].map(v => textLines([`${v}%`], { x: x(v), y: H - m.b + 12, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') })),
  textLines(['Voluntary attrition, % a year (lower is better)'], { x: 0, y: 2, size: 16, valign: 'top', fill: t.c('muted') }),
  textLines(['Employees engaged, % (higher is better)'], { x: W - m.r, y: H - 2, size: 16, anchor: 'end', fill: t.c('muted') }),
  // Build 1 — where each department was, and the path it took.
  g({ 'data-step': 1, 'data-motion': 'reveal', 'data-duration': 300 },
    departments.map(d => { const [cx, cy] = P(d.a); return el('circle', { cx, cy, r: 5, fill: 'none', stroke: d.focus ? t.c('accent') : t.c('context'), 'stroke-width': 1.6 }); })),
  g({ 'data-step': 1, 'data-motion': 'draw', 'data-duration': 1000 },
    departments.map(d => { const [x1, y1] = P(d.a), [x2, y2] = P(d.b); return el('line', { x1, y1, x2, y2, stroke: d.focus ? t.c('accent') : t.c('context'), 'stroke-width': d.focus ? 2.4 : 1.6 }); })),
  // One group per department: dot and name drawn at the 2025 position, shifted back to 2024 at build 0.
  departments.map(d => { const [cx, cy] = P(d.b), right = d.side === 'right';
    return g({ 'data-states': shift(d), 'data-duration': 1000, 'data-easing': 'smooth', style: 'transform-box:view-box;transform-origin:0 0' },
      el('circle', { cx, cy, r: d.focus ? 8 : 6, fill: d.focus ? t.c('accent') : t.c('ink'), stroke: t.c('paper'), 'stroke-width': 2 }),
      textLines([d.name], { x: cx + (right ? 14 : -14), y: cy, size: d.focus ? 19 : 17, anchor: right ? 'start' : 'end', valign: 'middle', fill: d.focus ? t.c('accent') : t.c('ink'), weight: d.focus ? 700 : 500, halo: t.c('paper') })); }),
  textLines(['2024 → 2025'], { x: W - m.r, y: m.t + 4, size: 17, anchor: 'end', valign: 'top', fill: t.c('muted'), weight: 600, attrs: { 'data-step': 1, 'data-motion': 'reveal' } }),
  // Build 2 — the size of the move, set beside the department that made it.
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-duration': 450 },
    (() => { const [cx, cy] = P(focus.b), after = cx + 14 + measureText(focus.name, 19, { weight: 700 }) + 22; // right of the moving label
      return textLines([`+${dEng} points engaged`, `−${dAttr} points attrition`], { x: after, y: cy, size: 17, valign: 'middle', fill: t.c('accent'), lineHeight: 1.3, halo: t.c('paper') }); })()));
}

export default {
  study: true,
  id: 'motion-tethered-label',
  title: 'Tethered label: the name travels with its point',
  className: 'st cs-hr-people',
  notes: 'Purpose: Keep label and subject registered while things move: each point and its name are one group with one transform, so a label can never lag, detach or swap.\nModify: Replace `departments` (two positions each; `side` puts the name left or right of the dot); the moves, trails and the change for the focus department recompute. Check both years for label collisions when you add points.\nInvariant: Dot and label share one computed translate per build; trails and hollow 2024 markers show where each point came from; only the department the headline names takes the accent.\nStatic: The final build shows the 2025 positions with names, the trails from 2024, and the change for the focus department.',
  sources: [{ type: 'original-example', file: 'assets/motion/tethered-label.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head"><em>${focus.name}</em> moved furthest: ${dEng}&nbsp;points more engaged, ${dAttr}&nbsp;points less attrition</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · annual engagement survey and HR records, nine departments</span><span>Motion · labels travel with their points (2 builds)</span></p>`,
};
