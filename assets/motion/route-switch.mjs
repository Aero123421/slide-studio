// Motion study · Switch the active route — the same two ports, the same network: build 1 marks
// the closure (the condition), build 2 draws the route the network now gives. Both routes are
// computed with a shortest-path search over the edge distances; nothing is hand-traced.
import { svgRoot, el, g, textLines, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const ports = { // lon, lat; label offset and anchor
  shanghai: { name: 'Shanghai', at: [121.5, 31.2], dx: 0, dy: -16, anchor: 'middle' },
  singapore: { name: 'Singapore', at: [103.8, 1.3], dx: 12, dy: 18, anchor: 'start' },
  colombo: { name: 'Colombo', at: [79.9, 6.9], dx: 8, dy: -16, anchor: 'start' },
  bab: { name: 'Bab el-Mandeb', at: [43.4, 12.6], dx: -12, dy: 6, anchor: 'end' },
  suez: { name: 'Suez Canal', at: [32.3, 31.3], dx: 10, dy: -14, anchor: 'start' },
  gibraltar: { name: 'Gibraltar', at: [-5.4, 36.1], dx: -12, dy: 18, anchor: 'end' },
  rotterdam: { name: 'Rotterdam', at: [4.5, 51.9], dx: 0, dy: -16, anchor: 'middle' },
  cape: { name: 'Cape of Good Hope', at: [18.5, -34.4], dx: 0, dy: 26, anchor: 'middle' },
};
// Sea legs in nautical miles (illustrative), with waypoints so legs follow open water.
const legs = [
  { a: 'shanghai', b: 'singapore', nmi: 2250, via: [[114.5, 19.5], [109.5, 10]] },
  { a: 'singapore', b: 'colombo', nmi: 1570, via: [[97.5, 5.6]] },
  { a: 'colombo', b: 'bab', nmi: 2230, via: [[55, 13.4]] },
  { a: 'bab', b: 'suez', nmi: 1230, via: [[38.4, 20.6]] },
  { a: 'suez', b: 'gibraltar', nmi: 1920, via: [[20, 34.4], [5, 37.6]] },
  { a: 'gibraltar', b: 'rotterdam', nmi: 1390, via: [[-9.6, 39.5], [-9.4, 44], [-5, 48.4], [1.4, 50.7]] },
  { a: 'colombo', b: 'cape', nmi: 4410, via: [[62, -12], [42, -31]] },
  { a: 'cape', b: 'gibraltar', nmi: 4720, via: [[7, -18], [-9, 1], [-19, 15], [-15.5, 28]] },
];
const trip = { from: 'shanghai', to: 'rotterdam', knots: 16 };
const closed = ['bab', 'suez']; // Red Sea leg unavailable

// Dijkstra over the legs; returns the ordered list of legs on the shortest route.
const route = (skip = null) => {
  const dist = { [trip.from]: 0 }, prev = {}, todo = new Set(Object.keys(ports));
  while (todo.size) {
    const u = [...todo].filter(k => k in dist).sort((p, q) => dist[p] - dist[q])[0];
    if (!u) break;
    todo.delete(u);
    for (const l of legs) {
      if (skip && [l.a, l.b].every(p => skip.includes(p))) continue;
      const v = l.a === u ? l.b : l.b === u ? l.a : null;
      if (v && todo.has(v) && dist[u] + l.nmi < (dist[v] ?? Infinity)) { dist[v] = dist[u] + l.nmi; prev[v] = [u, l]; }
    }
  }
  const out = []; let at = trip.to;
  while (at !== trip.from) { const [u, l] = prev[at]; out.unshift({ ...l, from: u, to: at }); at = u; }
  return { legs: out, nmi: dist[trip.to] };
};
const before = route(), after = route(closed);
const days = nmi => nmi / trip.knots / 24;
const addedDays = days(after.nmi) - days(before.nmi);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 800, H = 470, id = 'motion-route-switch-fig';
  const lon = [-25, 128], lat = [-40, 57], k = Math.min(W / (lon[1] - lon[0]), H / (lat[1] - lat[0]));
  const ox = (W - k * (lon[1] - lon[0])) / 2;
  const P = ([lo, la]) => [ox + (lo - lon[0]) * k, (lat[1] - la) * k];
  // Smooth curve through points (Catmull–Rom converted to cubic Béziers).
  const smooth = pts => {
    const p = pts.map(P);
    let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1.map(v => v.toFixed(1)).join(' ')} ${c2.map(v => v.toFixed(1)).join(' ')} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d;
  };
  const legPts = l => { const pts = [ports[l.a].at, ...l.via, ports[l.b].at]; return l.from === l.b ? pts.reverse() : pts; };
  const routePath = r => r.legs.map(l => smooth(legPts(l))).join('');
  const isClosed = l => closed.includes(l.a) && closed.includes(l.b);
  const closedLeg = legs.find(isClosed), mid = P(closedLeg.via[0]);
  return svgRoot({ id, width: W, height: H, theme: t,
    title: `Sea route from ${ports[trip.from].name} to ${ports[trip.to].name} before and after the Red Sea leg closes`,
    desc: `Shortest route via the Suez Canal: ${fmt(before.nmi)} nautical miles, ${fmt(days(before.nmi), { digits: 1 })} days at ${trip.knots} knots. With the Red Sea leg closed, the shortest route runs round the Cape of Good Hope: ${fmt(after.nmi)} nautical miles, ${fmt(days(after.nmi), { digits: 1 })} days. Same ports; ${fmt(addedDays, { digits: 1 })} more days.` },
  // Every leg of the network stays visible as context.
  legs.map(l => el('path', { d: smooth([ports[l.a].at, ...l.via, ports[l.b].at]), fill: 'none', stroke: t.c('context'), 'stroke-width': 2, 'stroke-dasharray': '2 5', 'stroke-linecap': 'round' })),
  // Build 0: the route in use. It gives way in build 2.
  g({ 'data-states': { 0: { opacity: 1 }, 2: { opacity: 0 } }, 'data-duration': 600 },
    el('path', { d: routePath(before), fill: 'none', stroke: t.c('ink'), 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })),
  // Build 1: the condition — the leg that closes.
  g({ 'data-step': 1, 'data-motion': 'reveal', 'data-duration': 500 },
    el('circle', { cx: mid[0], cy: mid[1], r: 15, fill: t.c('paper'), stroke: t.c('negative'), 'stroke-width': 3 }),
    el('path', { d: `M${mid[0] - 7} ${mid[1] - 7}l14 14M${mid[0] + 7} ${mid[1] - 7}l-14 14`, stroke: t.c('negative'), 'stroke-width': 3, 'stroke-linecap': 'round' }),
    textLines(['Red Sea leg closed'], { x: mid[0] - 24, y: mid[1] + 4, size: 17, weight: 700, anchor: 'end', valign: 'middle', fill: t.c('negative'), halo: t.c('paper') })),
  // Build 2: the route the network now gives, drawn from origin to destination.
  g({ 'data-step': 2, 'data-motion': 'draw', 'data-duration': 1000, 'data-easing': 'smooth' },
    el('path', { d: routePath(after), fill: 'none', stroke: t.c('accent'), 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })),
  Object.entries(ports).map(([key, p]) => {
    const [px, py] = P(p.at), end = key === trip.from || key === trip.to;
    return g({}, el('circle', { cx: px, cy: py, r: end ? 7 : 4.5, fill: end ? t.c('ink') : t.c('muted'), stroke: t.c('paper'), 'stroke-width': 2 }),
      textLines([p.name], { x: px + p.dx, y: py + p.dy, size: end ? 18 : 16, weight: end ? 700 : 500, anchor: p.anchor, valign: 'middle', fill: end ? t.c('ink') : t.c('muted'), halo: t.c('paper') }));
  }));
}

export default {
  study: true,
  id: 'motion-route-switch',
  title: 'Switch the active route',
  className: 'st st--rail cs-strategy-dark',
  notes: 'Purpose: Show an alternative path without changing endpoints: the condition that forces the switch appears first, then the new route is drawn.\nModify: Edit `ports`, `legs` (distance, waypoints), `trip` and `closed`. Both routes come from a shortest-path search, so the drawing, the distances, the days and the headline recompute.\nInvariant: Origin and destination stay fixed and labelled throughout; the whole network stays visible as context; the closure is shown before the new route appears.\nStatic: The final build shows the closure, the new route and the comparison. The old route remains readable as part of the network.',
  sources: [{ type: 'original-example', file: 'assets/motion/route-switch.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Closing the Red Sea leg adds <em>${fmt(addedDays, { digits: 1 })} days</em> to every sailing from ${ports[trip.from].name} to ${ports[trip.to].name}</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi" data-step="2" data-motion="reveal" data-delay="900"><b class="st-accent">+${fmt(addedDays, { digits: 1 })} days</b><span>per sailing at ${trip.knots} knots, round the Cape</span></div>
  <hr class="st-rule" data-step="2" data-motion="reveal" data-delay="900">
  <p class="st-text"><strong>Via Suez</strong><br>${fmt(before.nmi)} nmi · ${fmt(days(before.nmi), { digits: 1 })} days</p>
  <p class="st-text" data-step="2" data-motion="reveal" data-delay="900"><strong>Via the Cape</strong><br>${fmt(after.nmi)} nmi · ${fmt(days(after.nmi), { digits: 1 })} days</p>
</div>
<p class="st-source" data-region="source"><span>Illustrative distances · schematic sea legs, not navigation tracks</span><span>Motion · condition, then the new route (2 builds)</span></p>`,
};
