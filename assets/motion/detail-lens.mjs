// Motion study · Zoom a registered detail — a lens grows out of a dense earthquake swarm
// while the whole survey map stays in view. The lens shows the SAME drawing (<use>)
// scaled about the source circle; event dots use non-scaling strokes, so magnification
// separates them instead of fattening them, and the swarm resolves into two strands.
// Builds: 1 the lens lifts out of its source, 2 what the lens resolves.
import { svgRoot, el, g, linear, textLines, rng, theme as makeTheme, n, fmt } from '../runtime/figure.mjs';

// Illustrative microseismic catalogue on a 40 × 14 km survey grid (km east, km north).
const faultTrace = [[1, 3.0], [10, 5.2], [20, 7.4], [28, 8.6], [39, 11.8]]; // mapped surface trace
const background = { onFault: 980, diffuse: 110, spread: 0.6 };              // 2010–2023 events, spread in km
const swarm = { centre: [24, 8.05], length: 2.2, strands: [-0.125, 0.125], perStrand: 130, jitter: 0.035 }; // 2024 swarm, km

function catalogue() {
  const r = rng(7), gauss = () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
  const mag = () => Math.min(4.2, 0.8 - Math.log(1 - r()) * 0.43); // Gutenberg–Richter, b ≈ 1
  const lens = faultTrace.slice(1).map((p, i) => Math.hypot(p[0] - faultTrace[i][0], p[1] - faultTrace[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  const onTrace = u => { // point and unit normal at fraction u of the trace
    let d = u * total, i = 0;
    while (i < lens.length - 1 && d > lens[i]) d -= lens[i++];
    const [a, b] = [faultTrace[i], faultTrace[i + 1]], f = d / lens[i], dx = (b[0] - a[0]) / lens[i], dy = (b[1] - a[1]) / lens[i];
    return { x: a[0] + f * (b[0] - a[0]), y: a[1] + f * (b[1] - a[1]), nx: -dy, ny: dx };
  };
  const out = [];
  for (let i = 0; i < background.onFault; i++) { const p = onTrace(r()), o = gauss() * background.spread; out.push({ x: p.x + p.nx * o, y: p.y + p.ny * o, m: mag(), swarm: false }); }
  for (let i = 0; i < background.diffuse; i++) out.push({ x: 1 + r() * 38, y: 0.5 + r() * 13, m: mag(), swarm: false });
  const ang = Math.atan2(8.6 - 7.4, 28 - 20), ux = Math.cos(ang), uy = Math.sin(ang); // swarm runs along the local trace
  for (const off of swarm.strands) for (let i = 0; i < swarm.perStrand; i++) {
    const a = (r() - 0.5) * swarm.length, o = off + gauss() * swarm.jitter;
    out.push({ x: swarm.centre[0] + a * ux - o * uy, y: swarm.centre[1] + a * uy + o * ux, m: mag(), swarm: true, side: Math.sign(off), along: a, off: o });
  }
  return { events: out, ux, uy };
}
const { events, ux, uy } = catalogue();
const swarmEvents = events.filter(e => e.swarm);
// Measured, not assumed: distance between the mean offsets of the two strands, in metres.
const meanOff = s => { const l = swarmEvents.filter(e => e.side === s); return l.reduce((a, e) => a + e.off, 0) / l.length; };
const separation = Math.round((meanOff(1) - meanOff(-1)) * 100) * 10;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 40, t: 30 }, px = 27; // px per km, same on both axes
  const x = linear([0, 40], [m.l, m.l + 40 * px]), y = linear([0, 14], [m.t + 14 * px, m.t]);
  const dot = e => `M${n(x(e.x))} ${n(y(e.y))}h0`;
  const dots = (list, w, c, op) => el('path', { d: list.map(dot).join(''), fill: 'none', stroke: c, 'stroke-width': w, 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke', opacity: op });
  const bySize = (list, c, op) => [[0, 1.6, 3.4], [1.6, 2.4, 5], [2.4, 9, 7]].map(([a, b, w]) => dots(list.filter(e => e.m >= a && e.m < b), w, c, op));
  const k = 3.6, S = { x: x(swarm.centre[0]), y: y(swarm.centre[1]), r: 1.2 * px }, L = { x: x(34.2), y: y(4.35), r: 1.2 * px * k };
  const toLens = ([qx, qy]) => [L.x + k * (qx - S.x), L.y + k * (qy - S.y)];
  const d = Math.hypot(L.x - S.x, L.y - S.y), base = Math.atan2(L.y - S.y, L.x - S.x), a = Math.acos((L.r - S.r) / d);
  const tangent = sg => { const th = base + sg * a; return [S.x - S.r * Math.cos(th), S.y - S.r * Math.sin(th), L.x - L.r * Math.cos(th), L.y - L.r * Math.sin(th)]; };
  // Bracket across the two strands, 0.62 km along the swarm from its centre, in lens space.
  const along = 0.62, foot = s => toLens([x(swarm.centre[0] + along * ux - meanOff(s) * uy), y(swarm.centre[1] + along * uy + meanOff(s) * ux)]);
  const [b1, b2] = [foot(-1), foot(1)]; // lower strand, upper strand
  return svgRoot({ id: 'motion-detail-lens-fig', width: W, height: H, theme: t,
    title: 'Map of earthquake epicentres along a fault, with a magnified view of the 2024 swarm',
    desc: `${events.length - swarmEvents.length} background events follow the fault trace. The ${swarmEvents.length} events of the 2024 swarm look like one cluster at map scale; magnified ${k}×, they form two parallel strands about ${separation} m apart.` },
  el('defs', {}, el('clipPath', { id: 'motion-detail-lens-clip' }, el('circle', { cx: L.x, cy: L.y, r: L.r }))),
  el('rect', { x: x(0), y: y(14), width: 40 * px, height: 14 * px, fill: t.c('surface') }),
  [0, 10, 20, 30, 40].map(v => el('line', { x1: x(v), x2: x(v), y1: y(0), y2: y(0) + 6, stroke: t.c('muted') })),
  [0, 10, 20, 30, 40].map(v => textLines([`${v} km`], { x: x(v), y: y(0) + 10, size: 16, anchor: v === 0 ? 'start' : v === 40 ? 'end' : 'middle', valign: 'top', fill: t.c('muted') })),
  el('path', { d: faultTrace.map((p, i) => `${i ? 'L' : 'M'}${n(x(p[0]))} ${n(y(p[1]))}`).join(''), fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.4, 'stroke-dasharray': '10 6', opacity: 0.55 }),
  // The catalogue: background in ink, the swarm in the accent. Referenced by the lens.
  g({ id: 'motion-detail-lens-events' }, bySize(events.filter(e => !e.swarm), t.c('ink'), 0.42), bySize(swarmEvents, t.c('accent'), 0.9)),
  textLines(['Mapped fault trace'], { x: x(36.6), y: y(13.1), size: 16, anchor: 'end', fill: t.c('muted'), weight: 600, halo: t.c('surface') }),
  textLines([`2024 swarm, ${swarmEvents.length} events`], { x: S.x - S.r - 10, y: S.y - S.r - 8, size: 16, anchor: 'end', fill: t.c('accent'), weight: 700, halo: t.c('surface') }),
  textLines(['Background events 2010–2023'], { x: x(3.4), y: y(1.2), size: 16, fill: t.c('muted'), halo: t.c('surface') }),
  // Build 1 — source circle, then the lens grows out of it (registered at state 0) and the tethers draw.
  el('circle', { cx: S.x, cy: S.y, r: S.r, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.6, 'stroke-dasharray': '4 3', 'data-step': 1, 'data-motion': 'reveal', 'data-duration': 300 }),
  g({ 'data-step': 1, 'data-motion': 'draw', 'data-delay': 800, 'data-duration': 450 },
    [1, -1].map(sg => { const [x1, y1, x2, y2] = tangent(sg); return el('line', { x1, y1, x2, y2, stroke: t.c('ink'), 'stroke-width': 1.2, opacity: 0.6 }); })),
  g({ 'data-states': { 0: { opacity: 0, transform: `matrix(${n(1 / k)},0,0,${n(1 / k)},${n(S.x - L.x / k)},${n(S.y - L.y / k)})` }, 1: { opacity: 1, transform: 'matrix(1,0,0,1,0,0)' } },
    'data-duration': 900, 'data-easing': 'smooth', style: 'transform-box:view-box;transform-origin:0 0' },
    g({ 'clip-path': 'url(#motion-detail-lens-clip)' },
      el('circle', { cx: L.x, cy: L.y, r: L.r, fill: t.c('paper') }),
      el('use', { href: '#motion-detail-lens-events', transform: `translate(${n(L.x)} ${n(L.y)}) scale(${k}) translate(${n(-S.x)} ${n(-S.y)})` })),
    el('circle', { cx: L.x, cy: L.y, r: L.r, fill: 'none', stroke: t.c('ink'), 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' })),
  // Lens scale bar: 500 m at the lens magnification.
  g({ 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 850 },
    el('line', { x1: L.x - 0.25 * px * k, x2: L.x + 0.25 * px * k, y1: L.y + L.r - 26, y2: L.y + L.r - 26, stroke: t.c('ink'), 'stroke-width': 2.5 }),
    textLines([`500 m at ${k}×`], { x: L.x, y: L.y + L.r - 34, size: 16, anchor: 'middle', fill: t.c('ink'), weight: 600 })),
  // Build 2 — what the lens resolves: two strands and the gap between them.
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-duration': 500 },
    el('path', { d: `M${n(b1[0])} ${n(b1[1])}L${n(b2[0])} ${n(b2[1])}`, stroke: t.c('ink'), 'stroke-width': 2 }),
    [b1, b2].map(([bx, by]) => el('line', { x1: bx - 7 * ux, y1: by + 7 * uy, x2: bx + 7 * ux, y2: by - 7 * uy, stroke: t.c('ink'), 'stroke-width': 2 })),
    textLines([`${separation} m`], { x: b2[0], y: b2[1] - 16, size: 18, anchor: 'middle', fill: t.c('ink'), weight: 700, halo: t.c('paper') })));
}

export default {
  study: true,
  id: 'motion-detail-lens',
  title: 'Detail lens: magnify a crowded region in place',
  className: 'st cs-field-survey',
  notes: `Purpose: Keep the whole map in view while magnifying the one region whose structure is below the overview's resolution; the lens grows out of the region it shows.\nModify: Replace the catalogue with your events ({x, y, m} in km). Move the source circle S and the lens L (over empty map); the lens transform, clip, tethers and scale bar are computed from them.\nInvariant: The lens is the same drawing through <use>, scaled about the source; dots use non-scaling strokes, so magnification separates them. State 0 of the lens is registered exactly on its source. Both axes share one km scale.\nStatic: The final build shows the map, the source circle, the lens with tethers and scale bar, and the measured gap between the strands (${separation} m).`,
  sources: [{ type: 'original-example', file: 'assets/motion/detail-lens.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Magnified, the <em>2024 swarm</em> is two parallel strands ${separation} m apart, not one cluster</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · ${events.length.toLocaleString('en')} located events, dot size by magnitude</span><span>Motion · registered lens grows from its source (2 builds)</span></p>`,
};
