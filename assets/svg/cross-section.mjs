// Diagram study · Cross-section — a wall cut at a declared plane (A–A on the key plan), drawn to scale with
// hatching that identifies each material, and the steady-state temperature through it computed from the layers.
// Layer widths, hatches, interface temperatures, U-value and the headline share all come from `layers`.
import { svgRoot, el, g, textLines, linear, pathFromPoints, spreadLabels, measureText, rng, theme as makeTheme, fmt, sum, arrowMarker } from '../runtime/figure.mjs';

// 外断熱RC外壁（屋外→室内）。厚さ mm、熱伝導率 λ W/(m·K)（架空の設計例）
const layers = [
  { name: '外装モルタル', d: 25, k: 1.5, hatch: 'dots' },
  { name: '押出法ポリスチレンフォーム', d: 100, k: 0.028, hatch: 'insulation' },
  { name: '鉄筋コンクリート', d: 180, k: 1.6, hatch: 'concrete' },
  { name: '石こうボード', d: 12.5, k: 0.22, hatch: 'cross' },
];
const air = { outside: 0, inside: 20, rse: 0.04, rsi: 0.13 };   // °C and surface resistances m²·K/W

// Derived: thermal resistances, heat flux, temperature at every interface, U-value and the insulation share.
const R = layers.map(l => (l.d / 1000) / l.k), Rtot = air.rse + sum(R) + air.rsi, U = 1 / Rtot, q = (air.inside - air.outside) * U;
const temps = [air.outside + q * air.rse];
R.forEach(r => temps.push(temps.at(-1) + q * r));                                  // outer face, interfaces, inner face
const ins = layers.findIndex(l => l.hatch === 'insulation');
const share = (q * R[ins]) / (air.inside - air.outside);
const coreMin = temps[ins + 1];                                                     // coldest point of the concrete
const thick = sum(layers.map(l => l.d));
const c1 = v => fmt(v, { digits: 1, locale: 'ja' });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'cross-section-fig';
  const x0 = 304, s = 2.2, X = mm => x0 + mm * s, x1 = X(thick);
  const top = 92, bot = 268;                          // section slice, broken top and bottom
  const edges = layers.reduce((a, l) => [...a, a.at(-1) + l.d], [0]);
  // Hatching identifies the material (drawing convention), drawn per layer and clipped to it.
  const diagonals = (xa, w, step, dir, sw) => Array.from({ length: Math.ceil((w + 2 * (bot - top)) / step) }, (_, n) => {
    const k = -(bot - top) + n * step;
    return el('line', { fill: 'none', x1: xa + k, y1: dir > 0 ? bot : top, x2: xa + k + (bot - top), y2: dir > 0 ? top : bot, stroke: t.c('muted'), 'stroke-width': sw });
  });
  const hatches = {
    concrete: (xa, w) => [...diagonals(xa, w, 12, 1, 1),   // 45° lines, plus rebar 44 px in from each face
      ...[44, w - 44].flatMap(dx => [top + 40, top + 120].map(y => el('circle', { cx: xa + dx, cy: y, r: 6, fill: t.c('ink') })))],
    insulation: (xa, w) => [el('path', {                     // the zigzag that marks insulation
      d: pathFromPoints(Array.from({ length: Math.ceil((bot - top) / 22) + 2 }, (_, k) => [k % 2 ? xa + w - 6 : xa + 6, top + k * 22])),
      fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.4, 'stroke-linejoin': 'round' })],
    dots: (xa, w) => { const r = rng(5); return Array.from({ length: Math.round((w * (bot - top)) / 55) }, () => el('circle', { cx: xa + 2 + r() * (w - 4), cy: top + r() * (bot - top), r: 1.1, fill: t.c('muted') })); },
    cross: (xa, w) => [...diagonals(xa, w, 7, 1, 0.8), ...diagonals(xa, w, 7, -1, 0.8)],
  };
  const hatch = (l, i) => {
    const xa = X(edges[i]), w = X(edges[i + 1]) - xa, clip = `${id}-c${i}`;
    return g({}, el('clipPath', { id: clip }, el('rect', { x: xa, y: top, width: w, height: bot - top })),
      el('rect', { x: xa, y: top, width: w, height: bot - top, fill: l.hatch === 'concrete' ? t.c('surface') : t.c('paper') }),
      g({ 'clip-path': `url(#${clip})` }, hatches[l.hatch](xa, w)),
      el('rect', { x: xa, y: top, width: w, height: bot - top, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.5 }));
  };
  // break lines: the slice continues above and below
  const brk = y => el('path', { d: `M${x0 - 14} ${y}H${(x0 + x1) / 2 - 12}l6 -10l12 20l6 -10H${x1 + 14}`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.2 });
  // labels in a rail above the section, spread so narrow layers keep readable names
  const items = layers.map((l, i) => ({ id: i, y: (X(edges[i]) + X(edges[i + 1])) / 2, h: Math.max(measureText(l.name, 15, { weight: 700 }), measureText(`${fmt(l.d)} mm、λ ${fmt(l.k)}`, 15)) + 16 }));
  const placed = spreadLabels(items, { min: 236, max: W - 2, gap: 6 });
  const rail = layers.map((l, i) => {
    const cx = items[i].y, lx = placed.find(p => p.id === i).y;
    return g({},
      el('path', { d: `M${lx} 50L${lx} 58L${cx} 76L${cx} ${top - 4}`, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1 }),
      textLines([l.name], { x: lx, y: 4, size: 15, anchor: 'middle', valign: 'top', weight: 700, fill: t.c('ink') }),
      textLines([`${fmt(l.d)} mm、λ ${fmt(l.k)}`], { x: lx, y: 26, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') }));
  });
  // dimension chain under the section
  const dimY = bot + 24;
  const dims = g({}, el('line', { fill: 'none', x1: x0, x2: x1, y1: dimY, y2: dimY, stroke: t.c('ink'), 'stroke-width': 1 }),
    edges.map(e => el('line', { fill: 'none', x1: X(e) - 4, x2: X(e) + 4, y1: dimY + 4, y2: dimY - 4, stroke: t.c('ink'), 'stroke-width': 1.4 })),
    layers.map((l, i) => (X(edges[i + 1]) - X(edges[i]) > 40 ? textLines([fmt(l.d)], { x: (X(edges[i]) + X(edges[i + 1])) / 2, y: dimY - 4, size: 15, anchor: 'middle', valign: 'bottom', fill: t.c('ink') }) : '')),
    textLines([`計 ${fmt(thick)} mm`], { x: x1 + 10, y: dimY, size: 15, valign: 'middle', fill: t.c('ink'), weight: 600 }));
  // temperature profile on the same x scale
  const ty = linear([air.outside, air.inside], [H - 16, bot + 62]);
  const pts = [[x0 - 56, air.outside], [x0, temps[0]], ...edges.slice(1).map((e, i) => [X(e), temps[i + 1]]), [x1 + 56, air.inside]];
  const insSeg = [[X(edges[ins]), temps[ins]], [X(edges[ins + 1]), temps[ins + 1]]];
  const profile = g({},
    [air.outside, 10, air.inside].map(v => g({}, el('line', { fill: 'none', x1: x0 - 56, x2: x1 + 56, y1: ty(v), y2: ty(v), stroke: t.c('grid') }),
      textLines([`${fmt(v)} °C`], { x: x0 - 66, y: ty(v), size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
    edges.map(e => el('line', { fill: 'none', x1: X(e), x2: X(e), y1: ty(air.inside) - 6, y2: ty(air.outside), stroke: t.c('rule'), 'stroke-dasharray': '3 3' })),
    el('path', { d: pathFromPoints(pts.map(([x, v]) => [x, ty(v)])), fill: 'none', stroke: t.c('ink'), 'stroke-width': 2.2, 'stroke-linejoin': 'round' }),
    el('path', { d: pathFromPoints(insSeg.map(([x, v]) => [x, ty(v)])), fill: 'none', stroke: t.c('accent'), 'stroke-width': 4, 'stroke-linecap': 'round' }),
    textLines([`温度差の${fmt(share * 100, { digits: 0 })}%`], { x: (insSeg[0][0] + insSeg[1][0]) / 2 + 22, y: ty((temps[ins] + temps[ins + 1]) / 2) + 14, size: 17, valign: 'middle', weight: 700, fill: t.c('accent') }),
    textLines([`${c1(temps[ins + 1])} °C`], { x: X(edges[ins + 1]) + 8, y: ty(temps[ins + 1]) - 10, size: 15, valign: 'bottom', weight: 600, fill: t.c('ink') }),
    textLines([`${c1(temps[ins])} °C`], { x: X(edges[ins]) - 8, y: ty(temps[ins]) + 6, size: 15, anchor: 'end', valign: 'top', weight: 600, fill: t.c('ink') }));
  // key plan: building outline, the cut A–A across the west wall, arrows give the viewing direction
  const kp = { x: 26, y: 108, w: 150, h: 104 }, cutY = kp.y + 52, ax = kp.x - 18, bx = kp.x + 44;
  const plan = g({},
    textLines(['キープラン'], { x: 0, y: 4, size: 15, valign: 'top', weight: 700, fill: t.c('ink') }),
    textLines(['断面A–Aの位置'], { x: 0, y: 26, size: 15, valign: 'top', fill: t.c('muted') }),
    el('rect', { x: kp.x, y: kp.y, width: kp.w, height: kp.h, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 4 }),
    el('line', { fill: 'none', x1: ax, x2: bx, y1: cutY, y2: cutY, stroke: t.c('ink'), 'stroke-width': 1.6, 'stroke-dasharray': '10 3 2 3' }),
    [ax, bx].map((x, k) => g({},
      el('path', { d: `M${x} ${cutY}v-16`, stroke: t.c('ink'), 'stroke-width': 1.6, 'marker-end': `url(#${id}-view)` }),
      textLines(['A'], { x: x + (k ? 8 : -8), y: cutY - 16, size: 16, anchor: k ? 'start' : 'end', valign: 'middle', weight: 700, fill: t.c('ink') }))),
    textLines(['北'], { x: kp.x + kp.w - 4, y: kp.y - 46, size: 15, anchor: 'middle', valign: 'middle', weight: 700, fill: t.c('muted') }),
    el('path', { d: `M${kp.x + kp.w - 4} ${kp.y - 10}V${kp.y - 34}`, stroke: t.c('muted'), 'stroke-width': 1.5, 'marker-end': `url(#${id}-n)` }),
    textLines(['屋外'], { x: kp.x - 4, y: kp.y + kp.h + 22, size: 15, anchor: 'start', valign: 'middle', fill: t.c('muted') }),
    textLines([`U = ${fmt(U, { digits: 2 })}`], { x: 0, y: 300, size: 22, valign: 'top', weight: 700, fill: t.c('ink') }),
    textLines(['熱貫流率 W/(m²·K)'], { x: 0, y: 330, size: 15, valign: 'top', fill: t.c('muted') }),
    textLines([`外気${fmt(air.outside)} °C、室内${fmt(air.inside)} °C`], { x: 0, y: 360, size: 15, valign: 'top', fill: t.c('muted') }),
    textLines(['の定常状態'], { x: 0, y: 380, size: 15, valign: 'top', fill: t.c('muted') }));
  return svgRoot({ id, width: W, height: H, theme: t,
    title: '外断熱RC外壁の断面A–Aと、壁内の温度分布',
    desc: `キープランの切断線A–Aで西側外壁を切った断面。屋外側から外装モルタル${layers[0].d} mm、押出法ポリスチレンフォーム${layers[1].d} mm、鉄筋コンクリート${layers[2].d} mm、石こうボード${layers[3].d} mm。ハッチは材料を表す。外気${air.outside} °C、室内${air.inside} °Cの定常状態で、断熱材が温度差の${fmt(share * 100, { digits: 0 })}%を受け持ち、コンクリートは${c1(coreMin)} °C以上。熱貫流率は${fmt(U, { digits: 2 })} W/(m²·K)。` },
  el('defs', {}, arrowMarker(`${id}-view`, t.c('ink')), arrowMarker(`${id}-n`, t.c('muted'))),
  plan,
  textLines(['断面A–A'], { x: x0 - 56, y: top - 2, size: 15, anchor: 'end', valign: 'top', weight: 700, fill: t.c('ink') }),
  textLines(['屋外'], { x: x0 - 30, y: (top + bot) / 2, size: 15, anchor: 'middle', valign: 'middle', fill: t.c('muted') }),
  textLines(['室内'], { x: x1 + 30, y: (top + bot) / 2, size: 15, anchor: 'middle', valign: 'middle', fill: t.c('muted') }),
  layers.map(hatch), brk(top), brk(bot), rail, dims, profile);
}

export default {
  study: true,
  id: 'cross-section',
  language: 'ja',
  title: 'Cross-section: a declared cut with material hatching',
  className: 'st cs-sustainability-moss',
  notes: 'Purpose: Expose what is inside a wall at a declared cut, and what that construction does (here, to temperature), so the audience reads materials and their role together.\nModify: Edit `layers` (order outside to inside, thickness, conductivity, hatch) and `air`; layer widths, hatching, the dimension chain, interface temperatures, U-value and the headline share recompute.\nInvariant: The section is tied to a cut line on the key plan (A–A, with viewing direction); hatching identifies material and is explained by the labels; thicknesses are to scale on one axis; break lines mark where the slice is cut off.\nStatic: Already static. For a talk, show the key plan, then the section, then the temperature profile.',
  sources: [{ type: 'original-example', file: 'assets/svg/cross-section.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">外断熱の壁では断熱材が<em>温度差の${fmt(share * 100, { digits: 0 })}%</em>を受け持ち、<br>コンクリートは${fmt(Math.floor(coreMin))} °C以上に保たれる</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空の設計例 · 定常一次元の熱計算、表面熱伝達抵抗 屋外${fmt(air.rse)}・室内${fmt(air.rsi)} m²·K/W</span><span>断面図と温度分布</span></p>`,
};
