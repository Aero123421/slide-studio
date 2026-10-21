// Diagram study · Closed loop — a causal loop diagram where what comes back is labelled correctly.
// Links carry a polarity (+ same direction, − opposite direction). Loops are enumerated from the
// links and classified by convention: an even number of − links makes a reinforcing loop (R),
// an odd number a balancing loop (B). Nothing about R or B is typed by hand.
import { theme as makeTheme, svgRoot, el, g, textLines, measureText, arrowMarker } from '../runtime/figure.mjs';

const vars = [ // position in figure units (layout only)
  { id: 'users', label: 'Active users', x: 500, y: 70 },
  { id: 'tickets', label: 'Support tickets', x: 880, y: 70 },
  { id: 'response', label: 'Response time', x: 1052, y: 252 },
  { id: 'satisfaction', label: 'Satisfaction', x: 820, y: 432 },
  { id: 'churn', label: 'Churn', x: 584, y: 300 },
  { id: 'referrals', label: 'Referrals', x: 120, y: 252 },
];
const links = [ // sign: +1 moves the same way, −1 the opposite way; bend: curvature for drawing only
  { from: 'users', to: 'referrals', sign: 1, bend: -118 },
  { from: 'referrals', to: 'users', sign: 1, bend: -118 },
  { from: 'users', to: 'tickets', sign: 1, bend: 0 },
  { from: 'tickets', to: 'response', sign: 1, bend: -40 },
  { from: 'response', to: 'satisfaction', sign: -1, bend: -50 },
  { from: 'satisfaction', to: 'referrals', sign: 1, bend: -120 },
  { from: 'satisfaction', to: 'churn', sign: -1, bend: 30 },
  { from: 'churn', to: 'users', sign: -1, bend: 30 },
];
const loopNames = { 'referrals>users': 'word of mouth', 'referrals>response>satisfaction>tickets>users': 'slow support, fewer referrals', 'churn>response>satisfaction>tickets>users': 'slow support, more churn' };

// Enumerate simple cycles (small graph: depth-first from each start, keeping the smallest id first).
const ids = vars.map(v => v.id), loops = [];
const walk = (start, node, path, seen) => {
  for (const l of links.filter(k => k.from === node)) {
    if (l.to === start) loops.push([...path, l]);
    else if (!seen.has(l.to) && ids.indexOf(l.to) > ids.indexOf(start)) walk(start, l.to, [...path, l], new Set([...seen, l.to]));
  }
};
ids.forEach(s => walk(s, s, [], new Set([s])));
const classified = loops.map(path => {
  const negatives = path.filter(l => l.sign < 0).length, type = negatives % 2 ? 'B' : 'R';
  const key = [...new Set(path.map(l => l.to))].sort().join('>');
  return { path, negatives, type, name: loopNames[key] ?? 'loop' };
}).sort((a, b) => (a.type === b.type ? a.path.length - b.path.length : a.type === 'R' ? -1 : 1));
const counter = { R: 0, B: 0 };
classified.forEach(c => { c.label = `${c.type}${++counter[c.type]}`; });
const reinforcing = classified.filter(c => c.type === 'R'), balancing = classified.filter(c => c.type === 'B');
const words = ['no', 'one', 'two', 'three', 'four'];

export function figure(theme = 'css') {
  const t = makeTheme(theme), id = 'closed-loop-fig', W = 1152, H = 470, size = 20;
  const byId = Object.fromEntries(vars.map(v => [v.id, { ...v, w: measureText(v.label, size, { weight: 650 }) + 18, h: size + 14 }]));
  const r1 = reinforcing[0];
  const inR = l => r1 && r1.path.includes(l);
  // end a curve at the label's box: walk back along the quadratic until outside the box
  const edge = (b, pt) => Math.abs(pt[0] - b.x) <= b.w / 2 + 4 && Math.abs(pt[1] - b.y) <= b.h / 2 + 4;
  const parts = [], signs = [];
  for (const l of links) {
    const a = byId[l.from], b = byId[l.to], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    const c = [mx + (-dy / len) * l.bend, my + (dx / len) * l.bend];
    const q = s => [(1 - s) ** 2 * a.x + 2 * (1 - s) * s * c[0] + s * s * b.x, (1 - s) ** 2 * a.y + 2 * (1 - s) * s * c[1] + s * s * b.y];
    let s0 = 0, s1 = 1;
    while (s0 < 0.5 && edge(a, q(s0))) s0 += 0.005;
    while (s1 > 0.5 && edge(b, q(s1))) s1 -= 0.005;
    const steps = 24, pts = Array.from({ length: steps + 1 }, (_, i) => q(s0 + ((s1 - s0) * i) / steps));
    const em = inR(l);
    parts.push(el('path', { d: pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(''), fill: 'none', stroke: em ? t.c('accent') : t.c('ink'), 'stroke-width': em ? 3 : 2, 'stroke-linejoin': 'round', 'marker-end': `url(#${id}-arr${em ? '-em' : ''})` }));
    // polarity next to the arrowhead, on the outside of the bend
    const p = q(s1 - 0.1), tx = q(s1)[0] - q(s1 - 0.02)[0], ty = q(s1)[1] - q(s1 - 0.02)[1], tl = Math.hypot(tx, ty) || 1;
    const side = l.bend >= 0 ? 1 : -1, px = p[0] + (ty / tl) * 18 * side, py = p[1] - (tx / tl) * 18 * side;
    signs.push(textLines([l.sign > 0 ? '+' : '−'], { x: px, y: py, size: 24, anchor: 'middle', valign: 'middle', fill: em ? t.c('accent') : t.c('ink'), weight: 700, halo: t.c('paper') }));
  }
  // loop markers: a circular arrow with the computed label, placed inside each loop
  // layout only: where each loop marker sits, and where its name goes
  const markerAt = { R1: { at: [310, 162], nameAt: [190, 104] }, B1: { at: [372, 318], nameAt: [372, 286] }, B2: { at: [786, 226], nameAt: [786, 258] } };
  const markers = classified.map(c => {
    const { at: [x, y], nameAt: [nx, ny] } = markerAt[c.label] ?? { at: [W / 2, H / 2], nameAt: [W / 2, H / 2 + 32] }, em = c.type === 'R', col = em ? t.c('accent') : t.c('muted');
    return g({ class: 'closed-loop-marker' },
      el('path', { d: `M${x + 22} ${y - 8}A23 23 0 1 0 ${x + 10} ${y + 20}`, fill: 'none', stroke: col, 'stroke-width': 2.2, 'marker-end': `url(#${id}-loop${em ? '-em' : ''})` }),
      textLines([c.label], { x, y: y + 1, size: 20, anchor: 'middle', valign: 'middle', fill: em ? t.c('accent') : t.c('ink'), weight: 800 }),
      textLines([c.name], { x: nx, y: ny, size: 16, anchor: 'middle', valign: ny < y ? 'bottom' : 'top', fill: em ? t.c('accent') : t.c('muted'), weight: em ? 600 : 400 }));
  });
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Causal loops between active users, referrals and support load',
    desc: `Arrows are causal links; + means the two variables move the same way, − the opposite way. ${classified.map(c => `${c.label} (${c.name}): ${c.path.map(l => byId[l.from].label).join(' → ')} → back, ${c.negatives} negative ${c.negatives === 1 ? 'link' : 'links'}, so ${c.type === 'R' ? 'reinforcing' : 'balancing'}`).join('. ')}. Loop type follows from the count of negative links; the diagram makes no claim about strength or timing.` },
  el('defs', {}, arrowMarker(`${id}-arr`, t.c('ink'), { size: 12 }), arrowMarker(`${id}-arr-em`, t.c('accent'), { size: 13 }),
    arrowMarker(`${id}-loop`, t.c('muted'), { size: 9 }), arrowMarker(`${id}-loop-em`, t.c('accent'), { size: 9 })),
  parts, Object.values(byId).map(v => textLines([v.label], { x: v.x, y: v.y, size, anchor: 'middle', valign: 'middle', fill: t.c('ink'), weight: 650 })), signs, markers);
}

export default {
  study: true,
  id: 'closed-loop',
  title: 'Causal loops: reinforcing and balancing feedback',
  className: 'st cs-keynote-dusk',
  notes: 'Purpose: Make explicit what comes back around a loop, and whether it amplifies or corrects.\nModify: Edit `vars` (positions are layout only) and `links` (sign +1/−1). Loops are enumerated and labelled R or B from the count of negative links; name loops in `loopNames`; place markers (and which side their name goes) in `markerAt`.\nInvariant: + means same direction, − opposite direction; a loop with an odd number of − links is balancing, otherwise reinforcing; arrows always point from cause to effect; polarity says nothing about strength or delay.\nStatic: Already static. For a build, draw R1 first, then each balancing loop.',
  sources: [{ type: 'original-example', file: 'assets/svg/closed-loop.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Referrals make growth feed on itself (<em>${reinforcing[0].label}</em>); support load brakes it ${words[balancing.length]} ways (${balancing.map(c => c.label).join(', ')})</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative model · polarity by convention: + same direction, − opposite</span><span>Causal loop diagram</span></p>`,
};
