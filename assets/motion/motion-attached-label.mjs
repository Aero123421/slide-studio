// Motion study · Move an object and its label together — every route is one group (dot + its
// number) translated from its 2024 to its 2025 position, so no label is ever left behind or
// re-placed. Build 1 moves all routes (the focus route furthest, leaving a ghost and a trail);
// build 2 states the change next to where the focus route landed.
import { svgRoot, el, g, linear, textLines, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const routes = [ // average speed (km/h) and trips on time (%), 2024 → 2025, Tollbridge city buses (illustrative)
  { id: '12', speed: [13.8, 17.9], onTime: [71, 88], focus: true }, // bus lane opened in May 2025
  { id: '3', speed: [19.6, 19.9], onTime: [84, 85] }, { id: '5', speed: [16.2, 16.0], onTime: [79, 78] },
  { id: '7', speed: [15.1, 15.4], onTime: [76, 77] }, { id: '9', speed: [17.8, 17.5], onTime: [82, 81] },
  { id: '14', speed: [12.9, 12.7], onTime: [68, 67] }, { id: '18', speed: [14.6, 14.9], onTime: [74, 75] },
  { id: '21', speed: [18.4, 18.2], onTime: [86, 84] }, { id: '24', speed: [16.9, 17.2], onTime: [80, 82] },
  { id: '27', speed: [13.2, 13.5], onTime: [72, 70], side: 'left' }, { id: '31', speed: [15.7, 15.5], onTime: [78, 76], side: 'below' },
  { id: '33', speed: [17.1, 16.8], onTime: [77, 79] }, { id: '40', speed: [12.1, 12.4], onTime: [65, 66], side: 'left' },
  { id: '42', speed: [14.0, 14.3], onTime: [73, 72] },
];
const focus = routes.find(r => r.focus);
const rankOf = (r, k) => [...routes].sort((a, b) => b.speed[k] - a.speed[k]).indexOf(r) + 1;
const ordinal = n => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;
const dSpeed = focus.speed[1] - focus.speed[0], dOnTime = focus.onTime[1] - focus.onTime[0];

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 62, r: 36, t: 36, b: 58 };
  const x = linear([11, 21], [m.l, W - m.r]), y = linear([60, 92], [H - m.b, m.t]);
  const dur = 1000;
  const at = (r, k) => [x(r.speed[k]), y(r.onTime[k])];
  const [fx0, fy0] = at(focus, 0), [fx1, fy1] = at(focus, 1);
  return svgRoot({ id: 'motion-attached-label-fig', width: W, height: H, theme: t,
    title: 'Bus routes by average speed and share of trips on time, 2024 and 2025',
    desc: `Route ${focus.id} moved from ${focus.speed[0]} to ${focus.speed[1]} km/h and from ${focus.onTime[0]}% to ${focus.onTime[1]}% of trips on time after its bus lane opened, rising from ${ordinal(rankOf(focus, 0))} to ${ordinal(rankOf(focus, 1))} fastest of ${routes.length} routes. Other routes changed little.` },
  [12, 14, 16, 18, 20].map(v => g({}, el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b, stroke: t.c('grid') }),
    textLines([String(v)], { x: x(v), y: H - m.b + 10, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') }))),
  [60, 70, 80, 90].map(v => g({}, el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: t.c('grid') }),
    textLines([`${v}%`], { x: m.l - 10, y: y(v), size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
  textLines(['Average speed, km/h'], { x: W - m.r, y: H - m.b + 36, size: 16, anchor: 'end', valign: 'top', fill: t.c('muted') }),
  textLines(['Trips on time'], { x: m.l - 52, y: 8, size: 16, fill: t.c('muted'), valign: 'top' }),
  // build 1: where the focus route started, and the path it took
  g({ 'data-step': 1 },
    el('circle', { cx: fx0, cy: fy0, r: 8, fill: 'none', stroke: t.c('accent'), 'stroke-width': 1.8 }),
    textLines(['2024'], { x: fx0, y: fy0 + 26, size: 15, anchor: 'middle', fill: t.c('muted') })),
  el('path', { d: `M${fx0} ${fy0}L${fx1} ${fy1}`, stroke: t.c('accent'), 'stroke-width': 2, 'stroke-dasharray': '4 5', fill: 'none',
    'data-step': 1, 'data-motion': 'draw', 'data-duration': dur, 'data-easing': 'smooth' }),
  // every route is one group: dot and label move together (focus drawn last, on top)
  [...routes].sort((a, b) => Number(!!a.focus) - Number(!!b.focus)).map(r => {
    const [x0, y0] = at(r, 0), [x1, y1] = at(r, 1);
    const label = r.focus ? `Route ${r.id}` : r.id, size = r.focus ? 19 : 15;
    return g({ 'data-states': { 0: { translate: '0px 0px' }, 1: { translate: `${(x1 - x0).toFixed(1)}px ${(y1 - y0).toFixed(1)}px` } }, 'data-duration': dur, 'data-easing': 'smooth', style: 'transform-box:view-box' },
      el('circle', { cx: x0, cy: y0, r: r.focus ? 9 : 6, fill: r.focus ? t.c('accent') : t.c('muted'), stroke: t.c('paper'), 'stroke-width': 2 }),
      // label offsets are fixed relative to the dot, so they must clear neighbours in both years (`side` flips one)
      textLines([label], { x: x0 + (r.side === 'left' ? -10 : r.focus ? 14 : 10), y: y0 + (r.focus ? 20 : r.side === 'below' ? 16 : -9), size, weight: r.focus ? 700 : 500, anchor: r.side === 'left' ? 'end' : 'start',
        fill: r.focus ? t.c('accent') : t.c('muted'), halo: t.c('paper') }));
  }),
  textLines([`+${fmt(dSpeed, { digits: 1 })} km/h and +${dOnTime} points on time`, `after the bus lane opened in May`],
    { x: fx1 - 18, y: fy1 - 12, size: 17, fill: t.c('ink'), weight: 600, lineHeight: 1.35, halo: t.c('paper'), valign: 'middle', anchor: 'end',
      attrs: { 'data-step': 2, 'data-motion': 'reveal' } }));
}

export default {
  study: true,
  id: 'motion-attached-label',
  title: 'Attached label: the name travels with its point',
  className: 'st cs-blueprint',
  notes: 'Purpose: Move points between two states with their labels attached, so the audience never has to re-find a name after the move.\nModify: Replace `routes` (two positions each) and mark the focus with `focus: true`; translations, ranks, the ghost, the trail and the headline recompute. Check that labels clear their neighbours in both states.\nInvariant: Each point and its label are one group moved by one translation; no label is re-placed or swapped mid-way; the focus route alone carries the accent; its starting point stays visible as a ghost.\nStatic: The final build shows 2025 positions, the 2024 ghost and trail of the focus route, and the change statement.',
  sources: [{ type: 'original-example', file: 'assets/motion/motion-attached-label.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">With its new bus lane, <em>Route ${focus.id}</em> rose from ${ordinal(rankOf(focus, 0))} to ${ordinal(rankOf(focus, 1))} fastest of ${routes.length} routes, and from ${focus.onTime[0]}% to ${focus.onTime[1]}% of trips on time</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · all weekday trips, January–June of each year; on time = 1 min early to 5 min late</span><span>Motion · points move with attached labels (2 builds)</span></p>`,
};
