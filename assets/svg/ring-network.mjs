// Diagram study · Ring network — one set of links, two placements: where the cable runs, and
// how it connects. Both panels draw the same `links`; only node positions differ. Lengths,
// the single-cut check and the headline are computed from the data.
import { theme as makeTheme, svgRoot, el, g, textLines, polar, fmt } from '../runtime/figure.mjs';

const buildings = [ // listed in cable order; site position in metres from the south-west corner; tag = label side on the plan
  { id: 'main', label: 'Main hospital', x: 420, y: 260, tag: 's' },
  { id: 'lab', label: 'Laboratories', x: 760, y: 340, tag: 'e' },
  { id: 'energy', label: 'Energy centre', x: 850, y: 60, tag: 's' },
  { id: 'emerg', label: 'Emergency', x: 600, y: 330, tag: 'n' },
  { id: 'outpat', label: 'Outpatients', x: 470, y: 70, tag: 's' },
  { id: 'imaging', label: 'Imaging', x: 300, y: 150, tag: 'w' },
  { id: 'research', label: 'Research', x: 190, y: 440, tag: 'n' },
  { id: 'admin', label: 'Administration', x: 110, y: 240, tag: 's' },
];
const site = { w: 900, h: 500 }; // metres
const links = buildings.map((b, i) => [b.id, buildings[(i + 1) % buildings.length].id]); // the ring: each to the next
const byId = Object.fromEntries(buildings.map(b => [b.id, b]));
const length = ([a, b]) => Math.hypot(byId[a].x - byId[b].x, byId[a].y - byId[b].y);
const total = links.reduce((s, l) => s + length(l), 0);
const longest = [...links].sort((p, q) => length(q) - length(p))[0];

// Reachability after removing one link: breadth-first search from the first building.
const connectedWithout = cut => {
  const seen = new Set([buildings[0].id]), queue = [buildings[0].id];
  while (queue.length) {
    const u = queue.shift();
    for (const l of links) if (l !== cut && l.includes(u)) { const v = l[0] === u ? l[1] : l[0]; if (!seen.has(v)) { seen.add(v); queue.push(v); } }
  }
  return seen.size === buildings.length;
};
const survives = links.filter(connectedWithout).length;
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

export function figure(theme = 'css') {
  const t = makeTheme(theme), id = 'ring-network-fig', W = 1152, H = 444, size = 18;
  const isLong = l => l === longest;
  const label = (b, x, y, anchor, valign) => textLines([b.label], { x, y, size, anchor, valign, fill: t.c('ink'), weight: 600, halo: t.c('paper') });
  const drawPanel = (pos, labelAt) => [
    links.map(l => el('line', { x1: pos[l[0]][0], y1: pos[l[0]][1], x2: pos[l[1]][0], y2: pos[l[1]][1], stroke: isLong(l) ? t.c('accent') : t.c('ink'), 'stroke-width': isLong(l) ? 3.6 : 2, 'stroke-linecap': 'round' })),
    buildings.map(b => el('circle', { cx: pos[b.id][0], cy: pos[b.id][1], r: 8, fill: longest.includes(b.id) ? t.c('accent') : t.c('paper'), stroke: longest.includes(b.id) ? t.c('accent') : t.c('ink'), 'stroke-width': 2.4 })),
    buildings.map(b => labelAt(b)),
  ];
  // Left: site plan to scale, north up.
  const s = Math.min(520 / site.w, 320 / site.h), ox = 36, oy = 88;
  const sp = Object.fromEntries(buildings.map(b => [b.id, [ox + b.x * s, oy + (site.h - b.y) * s]]));
  const siteLabel = b => {
    const [x, y] = sp[b.id], k = { n: [0, -14, 'middle', 'bottom'], s: [0, 15, 'middle', 'top'], e: [14, 0, 'start', 'middle'], w: [-14, 0, 'end', 'middle'] }[b.tag];
    return label(b, x + k[0], y + k[1], k[2], k[3]);
  };
  const midL = [(sp[longest[0]][0] + sp[longest[1]][0]) / 2, (sp[longest[0]][1] + sp[longest[1]][1]) / 2];
  // Right: the same links on a ring, in cable order; distance on the page means nothing here.
  const rc = [880, 262], R = 150;
  const rp = Object.fromEntries(buildings.map((b, i) => [b.id, polar(rc[0], rc[1], R, -Math.PI / 2 + (i / buildings.length) * 2 * Math.PI)]));
  const ringLabel = b => {
    const [x, y] = rp[b.id], dx = x - rc[0], dy = y - rc[1], d = Math.hypot(dx, dy);
    const anchor = Math.abs(dx) < 20 ? 'middle' : dx > 0 ? 'start' : 'end';
    return label(b, x + (dx / d) * 16, y + (dy / d) * 16, anchor, dy < -20 ? 'bottom' : dy > 20 ? 'top' : 'middle');
  };
  const midR = polar(rc[0], rc[1], R - 36, Math.atan2((rp[longest[0]][1] + rp[longest[1]][1]) / 2 - rc[1], (rp[longest[0]][0] + rp[longest[1]][0]) / 2 - rc[0]));
  const scale100 = 100 * s;
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Campus fibre ring drawn twice: on the site plan and as a ring',
    desc: `Both panels show the same ${buildings.length} buildings and the same ${links.length} links; only positions differ. Left: positions to scale, north up; the ring follows service tunnels and crosses itself on paper. Right: the same links in cable order on a circle, where distance means nothing. Total straight-line length ${fmt(total / 1000, { digits: 1 })} km; the longest link, ${byId[longest[0]].label} to ${byId[longest[1]].label}, is ${fmt(length(longest), { digits: 0 })} m. Removing any one link leaves all ${buildings.length} buildings connected (${survives} of ${links.length} single cuts).` },
  // panel captions
  textLines(['Site plan, to scale'], { x: 0, y: 6, size: 18, valign: 'top', fill: t.c('ink'), weight: 700 }),
  textLines(['where the cable runs'], { x: 0, y: 32, size: 16, valign: 'top', fill: t.c('muted') }),
  textLines(['Ring, in cable order'], { x: 640, y: 6, size: 18, valign: 'top', fill: t.c('ink'), weight: 700 }),
  textLines(['how the buildings connect; distance means nothing'], { x: 640, y: 32, size: 16, valign: 'top', fill: t.c('muted') }),
  el('line', { x1: 612, x2: 612, y1: 0, y2: H, stroke: t.c('rule'), 'stroke-width': 1.2 }),
  g({ class: 'ring-network-site' }, drawPanel(sp, siteLabel)),
  g({ class: 'ring-network-ring' }, drawPanel(rp, ringLabel)),
  // the highlighted link, named in both panels
  textLines([`${fmt(length(longest), { digits: 0 })} m`], { x: midL[0] - 16, y: midL[1] + 2, size: 18, anchor: 'end', valign: 'middle', fill: t.c('accent'), weight: 700, halo: t.c('paper') }),
  textLines([`${fmt(length(longest), { digits: 0 })} m`], { x: midR[0], y: midR[1], size: 18, anchor: 'middle', valign: 'middle', fill: t.c('accent'), weight: 700, halo: t.c('paper') }),
  // scale bar
  el('path', { d: `M${ox} ${H - 18}v-8M${ox} ${H - 22}h${scale100}M${ox + scale100} ${H - 18}v-8`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.6 }),
  textLines(['100 m'], { x: ox + scale100 + 10, y: H - 22, size: 15, valign: 'middle', fill: t.c('muted'), weight: 600 }));
}

export default {
  study: true,
  id: 'ring-network',
  title: 'Ring topology: connectivity versus placement',
  className: 'st cs-blueprint',
  notes: 'Purpose: Separate how things connect from where they are, by drawing the same links twice: placed to scale and placed by connection order.\nModify: Edit `buildings` (cable order and site coordinates). Lengths, the highlighted longest link, the single-cut check and the headline recompute; both panels always draw the same `links`.\nInvariant: Moving nodes never adds, removes or reroutes a link and never changes reachability; the to-scale panel has a scale bar; the ring panel says distance means nothing.\nStatic: Already static. For a build, show the site plan first, then the ring.',
  sources: [{ type: 'original-example', file: 'assets/svg/ring-network.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Any single cable cut leaves all ${words[buildings.length] ?? buildings.length} buildings connected, which is plain on the ring and buried in the site plan</h1>
<p class="st-dek">Both panels draw the same ${words[links.length] ?? links.length} links. Only the positions of the buildings differ.</p>
<figure class="st-fig" style="top:214px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative campus · straight-line lengths, cable follows service tunnels</span><span>Network diagram, two layouts</span></p>`,
};
