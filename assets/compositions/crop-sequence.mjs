// Composition study · Crop sequence — one source image, three declared crops, equal frames.
// The source is a drawn flood map (a high-resolution aerial photograph or map tile is the intended
// input). Everything lives in valley coordinates: u = metres along the valley axis, v = metres
// across it (negative = north). A building floods when |v| is less than the flood half-width at
// its u, the same rule that draws the shaded zone, so each frame's percentage is counted, not typed.
import { rng, noise2D, fmt } from '../runtime/figure.mjs';

const valley = { w: 12000, h: 8000 }; // frame A extent, metres (3 : 2)
const axisY = x => 4300 + 420 * Math.sin((2 * Math.PI * x) / 7000 + 0.5) + 140 * Math.sin((2 * Math.PI * x) / 3100 + 1.7);
const channel = x => 105 * Math.sin((2 * Math.PI * x) / 950 + 0.8) + 45 * Math.sin((2 * Math.PI * x) / 430); // river wanders inside the plain
const n1 = noise2D(17);
const halfWidth = x => 210 + 440 * Math.exp(-(((x - 6300) / 1700) ** 2)) + 170 * Math.exp(-(((x - 2100) / 1000) ** 2)) + 120 * (n1.fbm(x / 900, 0.3, 3) - 0.5);

// Sample the valley axis every 10 m; u is arc length.
const axis = [];
for (let x = -400, u = 0, prev = null; x <= valley.w + 400; x += 10) {
  const y = axisY(x), dy = (axisY(x + 1) - axisY(x - 1)) / 2, len = Math.hypot(1, dy);
  if (prev) u += Math.hypot(x - prev.x, y - prev.y);
  const p = { x, y, u, tx: 1 / len, ty: dy / len, w: halfWidth(x) };
  axis.push(p); prev = p;
}
const at = u => { // interpolated axis point at arc length u
  let lo = 0, hi = axis.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (axis[mid].u < u) lo = mid; else hi = mid; }
  const a = axis[lo], b = axis[hi], k = Math.min(1, Math.max(0, (u - a.u) / (b.u - a.u || 1)));
  const tx = a.tx + (b.tx - a.tx) * k, ty = a.ty + (b.ty - a.ty) * k, l = Math.hypot(tx, ty);
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, tx: tx / l, ty: ty / l, w: a.w + (b.w - a.w) * k };
};
const toXY = (u, v) => { const p = at(u); return [p.x - p.ty * v, p.y + p.tx * v]; }; // normal = (−ty, tx)
const uOf = x => axis.reduce((best, p) => (Math.abs(p.x - x) < Math.abs(best.x - x) ? p : best)).u;

// Settlements, all in valley coordinates. Streets run along the valley (v fixed) or across it (u fixed).
const town = { u0: uOf(6300) };
const r = rng(41);
const buildings = [];
const house = (u, v, side, kind) => buildings.push({ u, v: v + side * 16, kind });
const along = (v, u1, u2, step, kind) => { for (let u = u1; u <= u2; u += step) { house(u, v, -1, kind); house(u, v, 1, kind); } };
const across = (u, v1, v2, step, kind) => { for (let v = v1; v <= v2; v += step) { buildings.push({ u: u - 16, v, kind }); buildings.push({ u: u + 16, v, kind }); } };
// Thornford: older streets by the river, newer ones uphill to the north.
const streets = [
  { v: -1100, from: -560, to: 520 }, { v: -950, from: -700, to: 640 }, { v: -800, from: -760, to: 700 },
  { v: -650, from: -720, to: 680 }, { v: -500, from: -600, to: 600 }, { v: -350, from: -460, to: 460 },
  { v: 280, from: -380, to: 420 },
];
for (const s of streets) along(s.v, town.u0 + s.from, town.u0 + s.to, 36, 'town');
const millLane = { u: town.u0 + 230, v1: 330, v2: 480, step: 25 }; // 7 plots each side
across(millLane.u, millLane.v1, millLane.v2, millLane.step, 'mill');
// Villages on higher ground: houses scattered around a crossroads (Gaussian, at least 18 m apart);
// `arms` are the roads through them (angle in u–v space, length m).
const villages = [
  { name: 'Ashby', u: uOf(2000), v: -2650, houses: 260, spread: 210, arms: [[0, 900], [180, 800], [90, 600], [-90, 700]] },
  { name: 'Wenlow', u: uOf(9800), v: 2500, houses: 220, spread: 190, arms: [[0, 800], [180, 700], [-90, 600], [90, 500]] },
  { name: 'Hale', u: uOf(4300), v: 2950, houses: 150, spread: 160, arms: [[0, 700], [180, 600], [-90, 500]] },
  { name: 'Keld', u: uOf(11000), v: -2500, houses: 140, spread: 150, arms: [[180, 700], [90, 500], [-90, 500]] },
  { name: 'Brook End', u: uOf(7700), v: 3050, houses: 110, spread: 140, arms: [[0, 600], [180, 500], [-90, 500]] },
];
const arm = (v0, deg) => { const a = (deg * Math.PI) / 180; return d => [v0.u + d * Math.cos(a) - 0.00012 * d * d * Math.sin(a), v0.v + d * Math.sin(a) + 0.00012 * d * d * Math.cos(a)]; };
const gauss = () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
for (const vil of villages) {
  const placed = [];
  for (let tries = 0; placed.length < vil.houses && tries < vil.houses * 40; tries++) {
    const u = vil.u + gauss() * vil.spread * 1.3, v = vil.v + gauss() * vil.spread;
    if (placed.every(q => (q.u - u) ** 2 + (q.v - v) ** 2 > 18 * 18)) placed.push({ u, v, kind: 'village' });
  }
  buildings.push(...placed);
}
// Farmsteads scattered across the valley floor and slopes.
for (let i = 0; i < 60; i++) {
  const u = 300 + r() * (axis.at(-1).u - 600), side = r() < 0.5 ? -1 : 1, v = side * (320 + r() * 3100);
  for (let k = 0; k < 2 + Math.floor(r() * 2); k++) buildings.push({ u: u + (r() - 0.5) * 60, v: v + (r() - 0.5) * 50, kind: 'farm' });
}
for (const b of buildings) { b.flood = Math.abs(b.v) < at(b.u).w; [b.x, b.y] = toXY(b.u, b.v); }

// Crops: centre and width in metres; frames are 3 : 2 like the full map.
const lane = toXY(millLane.u, (millLane.v1 + millLane.v2) / 2), townC = toXY(town.u0 + 40, -250);
const crops = [
  { key: 'A', name: 'The valley', across: 12000, cx: 6000, cy: 4000, reads: 'A narrow strip along the river; most of the valley stays dry.' },
  { key: 'B', name: 'Thornford', across: 2400, cx: townC[0], cy: townC[1], reads: 'The riverside half of the town floods.' },
  { key: 'C', name: 'Mill Lane', across: 300, cx: lane[0], cy: lane[1], reads: 'Every house in the frame floods.' },
];
for (const c of crops) {
  c.h = c.across * 2 / 3; c.x = c.cx - c.across / 2; c.y = c.cy - c.h / 2;
  c.in = buildings.filter(b => b.x >= c.x && b.x <= c.x + c.across && b.y >= c.y && b.y <= c.y + c.h);
  c.share = c.in.filter(b => b.flood).length / c.in.length;
}
const pct = v => `${Math.round(v * 100)}%`;
const km = m => (m >= 1000 ? `${fmt(m / 1000, { digits: m % 1000 ? 1 : 0 })} km` : `${m} m`);

// One drawing, referenced by every frame. Thin lines keep their width at any zoom.
const NS = 'vector-effect="non-scaling-stroke"';
const d1 = v => (Math.round(v * 10) / 10).toString();
function map() {
  const draw = axis.filter((p, i) => i % 3 === 0 || i === axis.length - 1); // every 30 m is smooth enough to draw
  const band = [...draw.map(p => [p.x - p.ty * p.w, p.y + p.tx * p.w]), ...draw.slice().reverse().map(p => [p.x + p.ty * p.w, p.y - p.tx * p.w])];
  const river = draw.map(p => { const m = channel(p.x); return [p.x - p.ty * m, p.y + p.tx * m]; });
  const bank = 16, riverPoly = [...river.map((q, i) => [q[0] - draw[i].ty * bank, q[1] + draw[i].tx * bank]), ...river.slice().reverse().map((q, i) => { const a = draw[draw.length - 1 - i]; return [q[0] + a.ty * bank, q[1] - a.tx * bank]; })];
  const poly = pts => `M${pts.map(p => `${d1(p[0])} ${d1(p[1])}`).join('L')}Z`;
  const line = pts => `M${pts.map(p => `${d1(p[0])} ${d1(p[1])}`).join('L')}`;
  const street = (v, u1, u2) => line(Array.from({ length: Math.ceil((u2 - u1) / 60) + 1 }, (_, i) => toXY(Math.min(u2, u1 + i * 60), v)));
  const roads = [
    street(-1500, 0, axis.at(-1).u), // valley road on the north slope
    ...streets.map(s => street(s.v, town.u0 + s.from - 20, town.u0 + s.to + 20)),
    line([toXY(town.u0, -1500), toXY(town.u0, 560)]), // bridge street
    line([toXY(millLane.u, millLane.v1 - 30), toXY(millLane.u, millLane.v2 + 20)]),
    ...villages.flatMap(vil => vil.arms.map(([deg, len]) => { const p = arm(vil, deg); return line(Array.from({ length: 9 }, (_, i) => toXY(...p((len * i) / 8)))); })),
    line([toXY(uOf(2000), -1500), toXY(uOf(2000), -2650)]), line([toXY(uOf(11000), -1500), toXY(uOf(11000), -2500)]),
    street(620, uOf(3000), uOf(10800)), line([toXY(uOf(9800), 620), toXY(uOf(9800), 2500)]),
    line([toXY(uOf(4300), 620), toXY(uOf(4300), 2950)]), line([toXY(uOf(7700), 620), toXY(uOf(7700), 3050)]),
  ];
  const footprint = b => { const p = at(b.u), w = 5, dpt = 6, tx = p.tx, ty = p.ty, nx = -ty, ny = tx;
    return `M${[[-w, -dpt], [w, -dpt], [w, dpt], [-w, dpt]].map(([a, c]) => `${d1(b.x + tx * a + nx * c)} ${d1(b.y + ty * a + ny * c)}`).join('L')}Z`; };
  const dots = list => list.map(b => `M${Math.round(b.x)} ${Math.round(b.y)}h0`).join('');
  const wet = buildings.filter(b => b.flood), dry = buildings.filter(b => !b.flood);
  // Footprints matter only where a building is several pixels wide: inside the tightest crop (plus a margin).
  const c = crops.at(-1), near = b => b.x > c.x - 60 && b.x < c.x + c.across + 60 && b.y > c.y - 60 && b.y < c.y + c.h + 60;
  return `<g id="composition-crop-sequence-map">
<rect x="-400" y="-400" width="${valley.w + 800}" height="${valley.h + 800}" class="cq-land"/>
<path d="${poly(band)}" class="cq-flood"/>
<path d="${poly(band)}" class="cq-flood-edge" ${NS}/>
<path d="${roads.join('')}" class="cq-road-fill"/>
<path d="${roads.join('')}" class="cq-road" ${NS}/>
<path d="${poly(riverPoly)}" class="cq-river"/>
<path d="${line(river)}" class="cq-river-line" ${NS}/>
<path d="${dry.filter(near).map(footprint).join('')}" class="cq-house"/>
<path d="${wet.filter(near).map(footprint).join('')}" class="cq-house cq-wet"/>
<path d="${dots(dry)}" class="cq-dot" ${NS}/>
<path d="${dots(wet)}" class="cq-dot cq-wet" ${NS}/>
</g>`;
}

const frameW = 360, frameH = 240;
const frame = (c, i) => {
  const k = c.across / frameW; // metres per pixel in this frame
  const inner = crops.slice(i + 1, i + 2).map(o => `<rect x="${d1(o.x)}" y="${d1(o.y)}" width="${d1(o.across)}" height="${d1(o.h)}" class="cq-crop" ${NS}/>` +
    `<text x="${d1(o.x + o.across + 6 * k)}" y="${d1(o.y + 12 * k)}" font-size="${d1(16 * k)}" class="cq-crop-label">${o.key}</text>`).join('');
  return `<svg class="cq-frame" width="${frameW}" height="${frameH}" viewBox="${d1(c.x)} ${d1(c.y)} ${d1(c.across)} ${d1(c.h)}" role="img" aria-label="Crop ${c.key}, ${c.name}: ${km(c.across)} across; ${pct(c.share)} of ${c.in.length} buildings in the frame are inside the flood zone.">
<use href="#composition-crop-sequence-map"/>${inner}</svg>`;
};

export default {
  study: true,
  id: 'composition-crop-sequence',
  title: 'Crop sequence: one source image, three declared crops',
  className: 'st cs-geo-map cmp-crop-sequence',
  notes: `Purpose: Show how framing changes what an image says, by setting three crops of one source side by side at the same size and stating what each crop includes and what it implies. Use it when a choice of crop is itself a decision (a lead photograph, a map extract for a report, a figure panel).\nModify: Replace the drawing with your source image (a high-resolution aerial photograph or map tile is the intended input; the bundled photographs are too small to crop this tightly without going soft) and set \`crops\` (centre and width, nested). The percentages are counted from \`buildings\` in each frame: now ${crops.map(c => `${c.key} ${pct(c.share)} of ${c.in.length}`).join(', ')}.\nInvariant: One source, equal frames, crops nested and outlined in the frame before; each frame states its width and what it counts; nothing is retouched between frames; the caption names the crop the decision should use.\nStatic: Already static.`,
  sources: [{ type: 'original-example', file: 'assets/compositions/crop-sequence.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" data-region="title">The same flood map shows ${crops.map(c => pct(c.share)).join(', ').replace(/, ([^,]*)$/, ' or $1')} of buildings under water, depending on the crop</h1>
<p class="st-dek cq-dek" data-region="support">Kell Valley, 1% annual chance flood. Three crops of one map; each outline marks the next crop.</p>
<svg width="0" height="0" class="cq-defs" aria-hidden="true"><defs>${map()}</defs></svg>
<div class="cq-row" data-region="primary">${crops.map((c, i) => `<figure class="cq-cell">${frame(c, i)}<figcaption><span class="cq-key">${c.key} · ${c.name}, ${km(c.across)} across</span><b>${pct(c.share)}</b><span class="cq-of">of ${fmt(c.in.length)} buildings in the frame</span><span class="cq-reads">${c.reads}</span></figcaption></figure>`).join('')}</div>
<p class="st-source" data-region="source"><span>Illustrative map · flood zone and buildings drawn from one model</span><span>Crop sequence: one source, three equal frames</span></p>`,
};
