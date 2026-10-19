// Diagram study · Partial mesh — which links the network cannot lose.
// Positions come from the engine's seeded force layout, i.e. from the links alone, not from a map.
// Bridges (links whose loss splits the network) and the substations they strand are computed.
import { networkDiagram, theme as makeTheme, svgRoot, el, textLines, measureText } from '../runtime/figure.mjs';

const substations = [
  { id: 'harbour', label: 'Harbour' }, { id: 'market', label: 'Market' }, { id: 'riverside', label: 'Riverside' },
  { id: 'steel', label: 'Steelworks' }, { id: 'airport', label: 'Airport' }, { id: 'mill', label: 'Old Mill' },
  { id: 'canal', label: 'Canal' }, { id: 'ridge', label: 'Ridge Top' }, { id: 'hill', label: 'Hill Farm' },
  { id: 'quarry', label: 'Quarry' }, { id: 'quay', label: 'North Quay' }, { id: 'wind', label: 'Wind farm' },
];
const lines = [ // 132 kV lines (illustrative); each pair is one line
  ['harbour', 'market'], ['market', 'riverside'], ['riverside', 'steel'], ['steel', 'airport'], ['airport', 'harbour'],
  ['market', 'airport'], ['riverside', 'mill'], ['mill', 'steel'], ['market', 'canal'], ['canal', 'riverside'],
  ['steel', 'ridge'], ['ridge', 'hill'], ['hill', 'quarry'], ['quarry', 'ridge'], ['harbour', 'quay'],
  ['wind', 'airport'], ['wind', 'steel'],
];

// Bridges by depth-first search with low-links (Tarjan): a line u–v is a bridge when nothing
// below v reaches back above it.
const adj = Object.fromEntries(substations.map(s => [s.id, []]));
lines.forEach(([a, b], k) => { adj[a].push([b, k]); adj[b].push([a, k]); });
const disc = {}, low = {}, bridges = [];
let clock = 0;
const dfs = (u, viaLine) => {
  disc[u] = low[u] = clock++;
  for (const [v, k] of adj[u]) {
    if (k === viaLine) continue;
    if (disc[v] === undefined) { dfs(v, k); low[u] = Math.min(low[u], low[v]); if (low[v] > disc[u]) bridges.push(k); }
    else low[u] = Math.min(low[u], disc[v]);
  }
};
dfs(substations[0].id, -1);
// For each bridge, the substations on the side away from the larger part lose supply.
const sideWithout = (start, cut) => {
  const seen = new Set([start]), queue = [start];
  while (queue.length) { const u = queue.shift(); for (const [v, k] of adj[u]) if (k !== cut && !seen.has(v)) { seen.add(v); queue.push(v); } }
  return seen;
};
const cuts = bridges.map(k => {
  const [a, b] = lines[k], A = sideWithout(a, k), B = sideWithout(b, k);
  const stranded = A.size < B.size ? A : B;
  return { k, a, b, stranded: [...stranded] };
}).sort((p, q) => q.stranded.length - p.stranded.length);
const name = id => substations.find(s => s.id === id).label;
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const cap = w => w[0].toUpperCase() + w.slice(1);

// Positions: the engine's deterministic force layout, read back through `extra`.
function layout(w, h) {
  let pos;
  networkDiagram({ id: 'mesh-network-layout', title: 'layout', width: w, height: h, layout: 'force', seed: 11, padding: 56,
    nodes: substations, edges: lines.map(([from, to]) => ({ from, to })), extra: ctx => { pos = ctx.nodes; return ''; } });
  return pos;
}

export function figure(theme = 'css') {
  const t = makeTheme(theme), id = 'mesh-network-fig', W = 1280, H = 720;
  const box = { x: 500, y: 40, w: 700, h: 610 };
  const raw = layout(box.w, box.h);
  // mirrored left-right so the hanging cluster sits away from the headline; a rigid flip keeps every distance
  const P = Object.fromEntries(Object.entries(raw).map(([k, p]) => [k, [box.x + box.w - p.x, box.y + p.y]]));
  const isBridge = k => bridges.includes(k);
  const stranded = new Set(cuts.flatMap(c => c.stranded));
  const parts = [];
  // lines; bridges drawn last and heavier
  lines.forEach(([a, b], k) => { if (!isBridge(k)) parts.push(el('line', { x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1], stroke: t.c('muted'), 'stroke-width': 2, 'stroke-linecap': 'round' })); });
  for (const c of cuts) parts.push(el('line', { x1: P[c.a][0], y1: P[c.a][1], x2: P[c.b][0], y2: P[c.b][1], stroke: t.c('accent'), 'stroke-width': 5, 'stroke-linecap': 'round' }));
  // substations: stranded ones hollow in accent
  for (const s of substations) {
    const [x, y] = P[s.id], lost = stranded.has(s.id);
    parts.push(el('circle', { cx: x, cy: y, r: lost ? 10 : 9, fill: lost ? t.c('paper') : t.c('ink'), stroke: lost ? t.c('accent') : t.c('paper'), 'stroke-width': lost ? 3 : 3 }));
  }
  // labels: of eight directions, take the one with the widest angular gap to this node's own lines
  for (const s of substations) {
    const [x, y] = P[s.id], dirs = adj[s.id].map(([v]) => Math.atan2(P[v][1] - y, P[v][0] - x));
    const gap = a => Math.min(...dirs.map(d => Math.abs(Math.atan2(Math.sin(a - d), Math.cos(a - d)))));
    const best = [0, 4, 2, 6, 1, 3, 5, 7].map(k => (k * Math.PI) / 4).reduce((p, a) => (gap(a) > gap(p) + 0.05 ? a : p));
    const vx = Math.cos(best), vy = Math.sin(best), w = measureText(s.label, 18, { weight: 600 });
    let anchor = Math.abs(vx) < 0.4 ? 'middle' : vx > 0 ? 'start' : 'end', lx = x + vx * 17;
    if (anchor === 'start' && lx + w > W - 28) { anchor = 'end'; lx = x - 17; } // keep labels on the slide
    parts.push(textLines([s.label], { x: lx, y: y + vy * 17, size: 18, anchor, valign: vy < -0.4 ? 'bottom' : vy > 0.4 ? 'top' : 'middle', fill: t.c('ink'), weight: 600, halo: t.c('paper') }));
  }
  // what each bridge strands, on the bridge itself
  for (const c of cuts) {
    const text = `cuts off ${c.stranded.length}`, w = measureText(text, 16, { weight: 700 }) + 20;
    const dx = P[c.b][0] - P[c.a][0], dy = P[c.b][1] - P[c.a][1], len = Math.hypot(dx, dy);
    let mx = (P[c.a][0] + P[c.b][0]) / 2, my = (P[c.a][1] + P[c.b][1]) / 2;
    if (len < w + 60) { const nx = -dy / len, ny = dx / len, up = ny < 0 ? 1 : -1; mx += nx * 26 * up; my += ny * 26 * up; } // short bridge: tag beside it
    parts.push(el('rect', { x: mx - w / 2, y: my - 14, width: w, height: 28, rx: 14, fill: t.c('accent') }),
      textLines([text], { x: mx, y: my, size: 16, anchor: 'middle', valign: 'middle', fill: t.c('onAccent'), weight: 700 }));
  }
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Regional 132 kV grid: substations, lines and the lines it cannot lose',
    desc: `${substations.length} substations and ${lines.length} lines; positions are computed from the links (force layout), not geography. ${cap(words[bridges.length])} lines are bridges, whose loss splits the grid: ${cuts.map(c => `${name(c.a)}–${name(c.b)} strands ${c.stranded.map(name).join(', ')}`).join('; ')}. Every other line has a parallel path.` },
  parts);
}

export default {
  study: true,
  id: 'mesh-network',
  title: 'Partial mesh: redundancy and single points of failure',
  className: 'st st--left st--full cs-strategy-dark',
  notes: 'Purpose: Show a partial mesh so that redundancy is visible: which links have alternatives and which would split the network.\nModify: Edit `substations` and `lines`. The force layout, bridge detection, stranded substations, rail and headline recompute; change `seed` only to get a different but equivalent drawing.\nInvariant: Positions are computed from links and carry no geography (stated on the page); moving nodes never adds or removes a line or changes reachability; bridges are computed, never picked by eye.\nStatic: Already static. For a build, draw the mesh first, then the bridges and what they strand.',
  sources: [{ type: 'original-example', file: 'assets/svg/mesh-network.mjs' }],
  exportPolicy: 'final',
  // full bleed: the figure comes first so the headline and rail paint above it
  content: `<figure class="st-fig" data-region="primary">${figure()}</figure>
<h1 class="st-head" style="max-width:420px">${cap(words[bridges.length])} of ${lines.length} lines are single points of failure. Lose either and part of the grid goes dark</h1>
<div class="st-rail" style="top:290px;bottom:90px" data-region="support">
${cuts.map((c, i) => `  <div class="st-kpi"><b${i === 0 ? ' class="st-accent"' : ''}>${c.stranded.length}</b><span>${c.stranded.length === 1 ? `${name(c.stranded[0])} hangs on a single line from ${name(c.stranded[0] === c.a ? c.b : c.a)}.` : `substations lose supply if ${name(c.a)}–${name(c.b)} fails: ${c.stranded.map(name).join(', ')}.`}</span></div>`).join('\n  <hr class="st-rule">\n')}
  <p class="st-text st-muted">Positions come from the links alone; they are not a map.</p>
</div>
<p class="st-source" data-region="source"><span>Illustrative network · 132 kV lines, positions from links only</span><span>Network diagram, force layout</span></p>`,
};
