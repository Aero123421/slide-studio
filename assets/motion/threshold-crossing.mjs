// Motion study · Cross a declared threshold — the standard is drawn first and never moves.
// Build 1 moves each station from its 2024 to its 2025 value (a ghost and a trail stay behind)
// and recolours it by the side it lands on; build 2 names the stations that changed side.
import { svgRoot, el, g, linear, band, textLines, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const stations = [ // urgent calls reached within 8 minutes, % of calls, by ambulance station (illustrative)
  { label: 'Kingsbridge', y2024: 85.1, y2025: 86.0 }, { label: 'Hillcrest', y2024: 79.5, y2025: 81.2 },
  { label: 'Oakfield', y2024: 82.6, y2025: 80.9 }, { label: 'Marsh Lane', y2024: 77.9, y2025: 78.4 },
  { label: 'Northgate', y2024: 71.8, y2025: 77.4 }, { label: 'Castleford', y2024: 72.6, y2025: 76.9 },
  { label: 'Riverside', y2024: 68.2, y2025: 76.1 }, { label: 'Docklands', y2024: 74.1, y2025: 75.8 },
  { label: 'Westmoor', y2024: 76.3, y2025: 73.8 }, { label: 'Eastvale', y2024: 63.4, y2025: 69.7 },
];
const standard = 75; // % of urgent calls to reach within 8 minutes
const rows = [...stations].sort((a, b) => b.y2025 - a.y2025);
const crossedUp = rows.filter(r => r.y2024 < standard && r.y2025 >= standard);
const crossedDown = rows.filter(r => r.y2024 >= standard && r.y2025 < standard);
const below = key => rows.filter(r => r[key] < standard).length;
const words = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 150, r: 250, t: 56, b: 42 };
  const x = linear([60, 90], [m.l + 20, W - m.r]);
  const y = band(rows.map(r => r.label), [m.t, H - m.b], { inner: 0, outer: 0.1 });
  const side = v => (v < standard ? t.c('negative') : t.c('ink'));
  const dur = 900, vx = W - m.r + 72, nx = W - m.r + 92;
  return svgRoot({ id: 'motion-threshold-crossing-fig', width: W, height: H, theme: t,
    title: `Share of urgent calls reached within 8 minutes by station, 2024 and 2025, against the ${standard}% standard`,
    desc: `Below the standard: ${below('y2024')} of ${rows.length} stations in 2024, ${below('y2025')} in 2025. ${crossedUp.map(r => r.label).join(', ')} crossed above it; ${crossedDown.map(r => r.label).join(', ')} fell below.` },
  // the declared boundary and its two sides come first
  [60, 65, 70, 75, 80, 85, 90].map(v => g({},
    el('line', { x1: x(v), x2: x(v), y1: m.t - 4, y2: H - m.b, stroke: t.c('grid') }),
    textLines([`${v}%`], { x: x(v), y: H - m.b + 10, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') }))),
  el('line', { x1: x(standard), x2: x(standard), y1: m.t - 30, y2: H - m.b, stroke: t.c('ink'), 'stroke-width': 2 }),
  textLines([`Standard ${standard}%`], { x: x(standard), y: m.t - 36, size: 17, anchor: 'middle', weight: 700, fill: t.c('ink') }),
  textLines(['← below'], { x: x(standard) - 12, y: m.t - 12, size: 16, anchor: 'end', fill: t.c('negative'), weight: 650 }),
  textLines(['meets →'], { x: x(standard) + 12, y: m.t - 12, size: 16, fill: t.c('ink'), weight: 650 }),
  textLines(['Share within 8 min'], { x: vx, y: m.t - 12, size: 16, anchor: 'end', fill: t.c('muted') }),
  rows.map(r => {
    const cy = y.center(r.label), x0 = x(r.y2024), x1 = x(r.y2025);
    const changed = crossedUp.includes(r) || crossedDown.includes(r);
    return g({},
      textLines([r.label], { x: m.l - 10, y: cy, size: 18, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: changed ? 700 : null }),
      el('line', { x1: x(60), x2: x(90), y1: cy, y2: cy, stroke: t.c('rule'), 'stroke-width': 1 }),
      // build 1: a ghost stays at 2024, the trail draws in the direction of travel
      el('circle', { cx: x0, cy, r: 6, fill: t.c('paper'), stroke: t.c('muted'), 'stroke-width': 1.6, 'data-step': 1 }),
      el('path', { d: `M${x0} ${cy}L${x1} ${cy}`, stroke: side(r.y2025), 'stroke-width': 2.4, fill: 'none', 'data-step': 1, 'data-motion': 'draw', 'data-duration': dur, 'data-easing': 'smooth' }),
      // the station itself: one dot that moves, recoloured by the side it lands on
      el('circle', { cx: x0, cy, r: 8, stroke: t.c('paper'), 'stroke-width': 2,
        'data-states': { 0: { translate: '0px 0px', fill: side(r.y2024) }, 1: { translate: `${(x1 - x0).toFixed(2)}px 0px`, fill: side(r.y2025) } },
        'data-duration': dur, 'data-easing': 'smooth', style: 'transform-box:view-box' }),
      textLines([fmt(r.y2024, { digits: 1 })], { x: vx, y: cy, size: 17, anchor: 'end', valign: 'middle', fill: side(r.y2024), attrs: { 'data-step': 0, 'data-until': 0, 'font-variant-numeric': 'tabular-nums' } }),
      textLines([fmt(r.y2025, { digits: 1 })], { x: vx, y: cy, size: 17, anchor: 'end', valign: 'middle', fill: side(r.y2025), weight: changed ? 700 : null,
        attrs: { 'data-step': 1, 'data-motion': 'count', 'data-count-from': r.y2024, 'data-duration': dur, 'font-variant-numeric': 'tabular-nums' } }),
      changed ? textLines([crossedUp.includes(r) ? `up from ${fmt(r.y2024, { digits: 1 })}` : `down from ${fmt(r.y2024, { digits: 1 })}`], { x: nx, y: cy, size: 16, valign: 'middle',
        fill: crossedUp.includes(r) ? t.c('accent') : t.c('negative'), weight: 650, attrs: { 'data-step': 2, 'data-motion': 'reveal' } }) : '');
  }),
  [['y2024', 0, 0], ['y2025', 1, null]].map(([key, from, until]) => textLines([`${below(key)} of ${rows.length} below standard`], { x: x(60), y: m.t - 12, size: 16, fill: t.c('negative'), weight: 650,
    attrs: { 'data-step': from, 'data-until': until, 'data-motion': from ? 'reveal' : null, 'data-delay': from ? dur : null } })));
}

export default {
  study: true,
  id: 'motion-threshold-crossing',
  title: 'Threshold crossing: which side of the standard, before and after',
  className: 'st cs-civic-calm',
  notes: 'Purpose: Show which side of a declared decision boundary each unit occupies, and which units changed side between two periods.\nModify: Replace `stations` (two values per row) and `standard`; positions, side colours, counts, labels and the headline recompute.\nInvariant: The boundary is drawn before any value and never moves; each station is one dot that travels from its old to its new value; colour encodes the side of the boundary only; a ghost and a trail keep the starting point visible.\nStatic: The final build shows 2025 positions, the 2024 ghosts, the trails and the named crossings, so both years are readable in PDF.',
  sources: [{ type: 'original-example', file: 'assets/motion/threshold-crossing.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${words[crossedUp.length] ?? crossedUp.length} ambulance stations crossed the ${standard}% response standard in 2025; ${crossedDown.map(r => r.label).join(' and ')} slipped below it</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · urgent calls reached within 8 minutes, calendar years</span><span>Motion · values move across a fixed threshold (2 builds)</span></p>`,
};
