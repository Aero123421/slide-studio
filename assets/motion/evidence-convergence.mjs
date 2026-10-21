// Motion study · Converge evidence — independent clues arrive one build at a time, and the
// window they all allow (their intersection) narrows on a shared time axis. The band is one
// element whose position and width per build are computed from the clues seen so far.
import { svgRoot, el, g, textLines, linear, theme as makeTheme } from '../runtime/figure.mjs';

// Each clue bounds the year the ship sank; `to: null` means open-ended (after `from`). Illustrative wreck.
const clues = [
  { method: 'Radiocarbon, hull rope', detail: '95% interval', from: 1610, to: 1670, step: 0 },
  { method: 'Tree rings, hull planks', detail: 'timber felled 1641; sank later', from: 1641, to: null, step: 1 },
  { method: 'Coins in the hold', detail: 'newest minted 1649', from: 1649, to: null, step: 1 },
  { method: 'Clay pipes', detail: 'maker’s mark in use 1630–1660', from: 1630, to: 1660, step: 2 },
  { method: 'Port register', detail: 'sailed March 1652; absent from 1655 list', from: 1652, to: 1655, step: 3 },
];
const span = [1600, 1700];
const windowAt = (k, list = clues) => {
  const seen = list.filter(c => c.step <= k);
  return [Math.max(...seen.map(c => c.from)), Math.min(...seen.map(c => c.to ?? span[1]))];
};
const steps = [...new Set(clues.map(c => c.step))].sort((a, b) => a - b);
const final = windowAt(steps.at(-1));
const withoutLast = windowAt(steps.at(-1), clues.slice(0, -1)); // how much rests on the last clue
const words = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'motion-evidence-convergence-fig';
  const x = linear(span, [340, W - 8]), rowY = i => 70 + i * 78, axisY = rowY(clues.length - 1) + 46;
  const yearTicks = Array.from({ length: 11 }, (_, i) => span[0] + i * 10);
  const axis = g({},
    yearTicks.map(yr => g({}, el('line', { x1: x(yr), x2: x(yr), y1: 34, y2: axisY, stroke: t.c('grid') }),
      textLines([String(yr)], { x: x(yr), y: axisY + 12, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') }))),
    el('line', { x1: x(span[0]), x2: x(span[1]), y1: axisY, y2: axisY, stroke: t.c('ink'), 'stroke-width': 1.4 }));

  // The window: drawn once at the first clue's interval, then moved and narrowed per build.
  const [a0, b0] = windowAt(steps[0]);
  const states = Object.fromEntries(steps.map(k => {
    const [a, b] = windowAt(k);
    return [k, { translate: `${(x(a) - x(a0)).toFixed(2)}px 0px`, scale: `${((x(b) - x(a)) / (x(b0) - x(a0))).toFixed(4)} 1` }];
  }));
  const band = g({ 'data-states': states, 'data-duration': 900, 'data-easing': 'smooth', style: `transform-box:view-box;transform-origin:${x(a0)}px 0px` },
    el('rect', { x: x(a0), y: 34, width: x(b0) - x(a0), height: axisY - 34, fill: t.c('accent'), 'fill-opacity': 0.12, stroke: t.c('accent'), 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' }));
  const windowLabels = steps.map((k, i) => {
    const [a, b] = windowAt(k), last = i === steps.length - 1;
    return textLines([`${a}–${b}`], { x: (x(a) + x(b)) / 2, y: 8, size: last ? 22 : 17, weight: 700, anchor: 'middle', valign: 'top', fill: last ? t.c('accent') : t.c('muted'),
      attrs: { 'data-step': k, 'data-until': last ? null : steps[i + 1] - 1, 'data-motion': 'reveal', 'data-delay': 700 } });
  });

  // Clues: label on the left, interval (or open-ended arrow) on the shared axis.
  const clueRow = (c, i) => {
    const y = rowY(i), open = c.to == null;
    return g(c.step ? { 'data-step': c.step, 'data-motion': 'reveal', 'data-duration': 500 } : {},
      textLines([c.method], { x: 0, y: y - 9, size: 18, weight: 700, valign: 'middle', fill: t.c('ink') }),
      textLines([c.detail], { x: 0, y: y + 14, size: 15, valign: 'middle', fill: t.c('muted') }),
      open
        ? g({}, el('line', { x1: x(c.from), x2: x(span[1]) - 2, y1: y, y2: y, stroke: t.c('ink'), 'stroke-width': 2.4 }),
          el('path', { d: `M${x(span[1]) - 12} ${y - 6}L${x(span[1]) - 2} ${y}L${x(span[1]) - 12} ${y + 6}`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 2.4 }),
          el('line', { x1: x(c.from), x2: x(c.from), y1: y - 9, y2: y + 9, stroke: t.c('ink'), 'stroke-width': 3 }))
        : el('rect', { x: x(c.from), y: y - 8, width: x(c.to) - x(c.from), height: 16, rx: 3, fill: t.c('ink') }));
  };
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Independent dating clues for a shipwreck and the window they all allow',
    desc: `${clues.map(c => `${c.method}: ${c.to ? `${c.from}–${c.to}` : `after ${c.from}`}`).join('; ')}. Together they allow only ${final[0]}–${final[1]}. Without the port register the window would be ${withoutLast[0]}–${withoutLast[1]}.` },
  axis, band, clues.map(clueRow), windowLabels,
  g({ 'data-step': steps.at(-1), 'data-motion': 'reveal', 'data-delay': 1000 },
    textLines([`Without the port register: ${withoutLast[0]}–${withoutLast[1]}`], { x: 0, y: axisY + 12, size: 16, valign: 'top', fill: t.c('muted'), weight: 600 })));
}

export default {
  study: true,
  id: 'motion-evidence-convergence',
  title: 'Converge evidence',
  className: 'st cs-culture-gallery',
  notes: 'Purpose: Bring independent observations into a bounded inference: each clue arrives on the same axis and the window they all allow narrows.\nModify: Edit `clues` (from, to or null for open-ended, and the build it arrives in). The window per build, its labels, the robustness note and the headline are computed as the intersection.\nInvariant: Clues share one axis and keep their own uncertainty; the window is the intersection, never a hand-picked range; the page says how much rests on the most binding clue.\nStatic: The final build shows every clue, the final window and the window without the last clue.',
  sources: [{ type: 'original-example', file: 'assets/motion/evidence-convergence.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${words[clues.length] ?? clues.length} independent clues leave one window for the sinking: <em>${final[0]}–${final[1]}</em></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative wreck · intervals as published by each method</span><span>Motion · clues converge on a shared axis (3 builds)</span></p>`,
};
