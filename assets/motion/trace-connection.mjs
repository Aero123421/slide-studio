// Motion study · Trace a connection — follow one lot through a shipment network, one
// handoff per build. The traced path is found in the data (shipments carrying the
// implicated lot), drawn along the same curves as the network, never hand-placed.
import { svgRoot, el, g, textLines, measureText, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const tiers = ['Growers', 'Packers', 'Distribution', 'Stores'];
const sites = [
  { id: 'alder', tier: 0, name: 'Alder Ridge' }, { id: 'bell', tier: 0, name: 'Bell Creek' },
  { id: 'coyote', tier: 0, name: 'Coyote Flats, field 12' }, { id: 'dunmore', tier: 0, name: 'Dunmore' },
  { id: 'north', tier: 1, name: 'Northfield Packing' }, { id: 'river', tier: 1, name: 'Riverbend Packing' }, { id: 'sun', tier: 1, name: 'Sunline Packing' },
  { id: 'west', tier: 2, name: 'DC West' }, { id: 'central', tier: 2, name: 'DC Central' },
  { id: 's04', tier: 3, name: 'Store 4' }, { id: 's11', tier: 3, name: 'Store 11' }, { id: 's18', tier: 3, name: 'Store 18' },
  { id: 's31', tier: 3, name: 'Store 31' },
];
// Romaine shipments in the exposure week (illustrative). `at` = dispatch time, ISO local.
const shipments = [
  { from: 'alder', to: 'north', lot: 'N-0398', at: '2026-03-01T05:30' }, { from: 'bell', to: 'north', lot: 'N-0401', at: '2026-03-02T04:50' },
  { from: 'bell', to: 'sun', lot: 'S-1177', at: '2026-03-01T06:15' }, { from: 'coyote', to: 'river', lot: 'R-0412', at: '2026-03-02T06:00' },
  { from: 'dunmore', to: 'river', lot: 'R-0409', at: '2026-03-01T07:20' }, { from: 'dunmore', to: 'sun', lot: 'S-1180', at: '2026-03-02T05:45' },
  { from: 'north', to: 'west', lot: 'N-0398', at: '2026-03-01T19:00' }, { from: 'north', to: 'central', lot: 'N-0401', at: '2026-03-02T20:10' },
  { from: 'river', to: 'central', lot: 'R-0412', at: '2026-03-02T21:30' }, { from: 'river', to: 'west', lot: 'R-0409', at: '2026-03-01T22:00' },
  { from: 'sun', to: 'west', lot: 'S-1177', at: '2026-03-01T23:40' }, { from: 'sun', to: 'central', lot: 'S-1180', at: '2026-03-02T22:15' },
  { from: 'west', to: 's04', lot: 'N-0398', at: '2026-03-02T05:00' }, { from: 'west', to: 's11', lot: 'S-1177', at: '2026-03-02T06:30' },
  { from: 'central', to: 's18', lot: 'R-0412', at: '2026-03-04T05:40' }, { from: 'central', to: 's11', lot: 'N-0401', at: '2026-03-03T06:10' },
  { from: 'west', to: 's31', lot: 'R-0409', at: '2026-03-02T07:45' }, { from: 'central', to: 's31', lot: 'S-1180', at: '2026-03-03T07:30' },
];
const cluster = { store: 's18', cases: 7, lot: 'R-0412', shelved: '2026-03-04T10:00' }; // lot code from the store's receiving log

// The trace: every shipment of the implicated lot, in time order.
const path = shipments.filter(s => s.lot === cluster.lot).sort((a, b) => a.at.localeCompare(b.at));
const site = id => sites.find(s => s.id === id);
const source = site(path[0].from), hours = (Date.parse(cluster.shelved) - Date.parse(path[0].at)) / 36e5;
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const when = iso => { const d = new Date(iso); return `Mar ${d.getDate()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, top = 44, size = 17, pillH = 38;
  const tierX = [0, 356, 672, 958];                 // left edge of each tier column (stores align right)
  const box = {};
  tiers.forEach((_, k) => {
    const members = sites.filter(s => s.tier === k), span = H - top - 6;
    members.forEach((s, i) => {
      const w = measureText(s.name, size, { weight: s.id === source.id || s.id === cluster.store ? 700 : 500 }) + 28;
      const cy = top + (span * (i + 0.5)) / members.length;
      box[s.id] = { x: k === 3 ? W - w : tierX[k], y: cy - pillH / 2, w, h: pillH, cy };
    });
  });
  const curve = s => {
    const a = box[s.from], b = box[s.to], x0 = a.x + a.w, x1 = b.x, mx = (x0 + x1) / 2;
    return `M${x0} ${a.cy}C${mx} ${a.cy} ${mx} ${b.cy} ${x1 - 2} ${b.cy}`;
  };
  const onPath = new Set(path.map(s => `${s.from}>${s.to}`));
  const endpoint = id => id === source.id || id === cluster.store;
  const pill = s => {
    const b = box[s.id], end = endpoint(s.id);
    return g({},
      el('rect', { x: b.x, y: b.y, width: b.w, height: b.h, rx: b.h / 2, fill: end ? t.c('paper') : t.c('surface'), stroke: end ? t.c('accent') : t.c('rule'), 'stroke-width': end ? 2.4 : 1.2 }),
      textLines([s.name], { x: b.x + b.w / 2, y: b.cy, size, anchor: 'middle', valign: 'middle', weight: end ? 700 : 500, fill: end ? t.c('ink') : t.c('muted') }));
  };
  // One build per handoff: the hop draws, then its dispatch time appears beside the target.
  const hop = (s, k) => {
    const a = box[s.from], b = box[s.to], mx = (a.x + a.w + b.x) / 2, my = (a.cy + b.cy) / 2; // curve midpoint
    const label = when(s.at), lw = measureText(label, 16, { weight: 600 }) + 16;
    return g({},
      g({ 'data-step': k + 1, 'data-motion': 'draw', 'data-duration': 900, 'data-easing': 'smooth' },
        el('path', { d: curve(s), fill: 'none', stroke: t.c('accent'), 'stroke-width': 4, 'stroke-linecap': 'round' })),
      g({ 'data-step': k + 1, 'data-motion': 'reveal', 'data-delay': 750 },
        el('rect', { x: mx - lw / 2, y: my - 14, width: lw, height: 28, rx: 5, fill: t.c('paper'), stroke: t.c('accent'), 'stroke-width': 1.2 }),
        textLines([label], { x: mx, y: my, size: 16, anchor: 'middle', valign: 'middle', weight: 600, fill: t.c('accent') })));
  };
  const store = box[cluster.store];
  return svgRoot({ id: 'motion-trace-connection-fig', width: W, height: H, theme: t,
    title: `Traceback of lot ${cluster.lot} from ${source.name} to ${site(cluster.store).name}`,
    desc: `${shipments.length} shipments link ${sites.length} sites. Lot ${cluster.lot} moved ${source.name} → ${path.slice(1).map(s => site(s.from).name).join(' → ')} → ${site(cluster.store).name} in ${path.length} handoffs, ${Math.round(hours)} hours from dispatch to shelf. ${site(cluster.store).name} reported ${cluster.cases} illnesses.` },
  tiers.map((name, k) => textLines([name], { x: k === 3 ? W : tierX[k], y: 6, size: 16, weight: 700, valign: 'top', anchor: k === 3 ? 'end' : 'start', fill: t.c('muted') })),
  g({}, shipments.filter(s => !onPath.has(`${s.from}>${s.to}`)).map(s => el('path', { d: curve(s), fill: 'none', stroke: t.c('context'), 'stroke-width': 1.6 }))),
  path.map(hop),
  sites.map(pill),
  textLines([`${cluster.cases} illness reports`], { x: W - 6, y: store.y + store.h + 10, size: 16, weight: 700, anchor: 'end', valign: 'top', fill: t.c('accent') }),
  textLines([`Lot ${cluster.lot}`], { x: box[source.id].x + box[source.id].w / 2, y: box[source.id].y + box[source.id].h + 10, size: 16, weight: 700, anchor: 'middle', valign: 'top', fill: t.c('accent') }),
  g({ 'data-step': path.length, 'data-motion': 'reveal', 'data-delay': 1000 },
    textLines([`shelved ${Math.round(hours)} h after dispatch`], { x: W - 6, y: store.y + store.h + 32, size: 16, anchor: 'end', valign: 'top', fill: t.c('ink') })));
}

export default {
  study: true,
  id: 'motion-trace-connection',
  title: 'Trace a connection',
  className: 'st cs-civic-calm',
  notes: 'Purpose: Follow the exact path between two known endpoints through a network, one handoff at a time.\nModify: Replace `sites`, `shipments` and `cluster`. The traced path is computed from the shipments that carry the implicated lot, so the drawing, the hop labels, the hour count and the headline follow the data.\nInvariant: Endpoints are marked before the trace starts; the traced hops reuse the network\'s own curves (no shortcut drawn); every other link stays visible as context so the path is seen among alternatives.\nStatic: The final build shows the full path with every dispatch time. Earlier builds only stage the same path.',
  sources: [{ type: 'original-example', file: 'assets/motion/trace-connection.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${site(cluster.store).name}’s ${words[cluster.cases] ?? cluster.cases} illness reports trace back ${words[path.length] ?? path.length} handoffs to a single field: <em>${source.name}</em></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · romaine shipments in the exposure week; lot codes from receiving logs</span><span>Motion · traced path drawn hop by hop (${path.length} builds)</span></p>`,
};
