// Motion study · Reassemble layers — three map layers start apart on tilted planes, drop
// into registration (build 1) and lie flat as one map (build 2), where the overlap is read.
// Every layer is drawn once in map coordinates; only its transform matrix changes per build.
import { svgRoot, el, g, textLines, pathFromPoints, theme as makeTheme, fmt } from '../runtime/figure.mjs';

// Map units: 1 unit = 10 m; the sheet is 4.8 km × 3.0 km (illustrative river town).
const Wm = 480, Hm = 300;
const riverY = x => 112 + 0.26 * x + 34 * Math.sin(x / 70);
const depth = (x, y) => 6.0 * Math.exp(-(((y - riverY(x)) / 46) ** 2)) + 1.9 * Math.exp(-((x - 340) ** 2 + (y - 250) ** 2) / 2400) - 0.3; // 想定最大規模の浸水深 m
const classes = [{ min: 0.5, label: '0.5〜3m' }, { min: 3, label: '3〜5m' }, { min: 5, label: '5m以上' }];
const shelters = [
  { name: '川辺小学校', x: 118, y: 220 }, { name: '中洲公民館', x: 352, y: 262 }, { name: '北台中学校', x: 92, y: 52 },
  { name: '緑町体育館', x: 268, y: 74 }, { name: '本町センター', x: 404, y: 132 }, { name: '南高校', x: 186, y: 270 },
  { name: '東中学校', x: 452, y: 56 }, { name: '西部公民館', x: 30, y: 250 },
];
const roads = [[[200, 0], [214, 120], [206, 300]], [[0, 34], [160, 46], [300, 30], [480, 44]], [[300, 30], [330, 150], [420, 300]]];
const atRisk = shelters.map(s => ({ ...s, d: depth(s.x, s.y) })).filter(s => s.d >= classes[0].min);
const layers = [`避難所（${shelters.length}か所）`, '洪水浸水想定区域', '地形・道路・河川']; // top to bottom

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'motion-reassemble-fig';
  // Plane matrix (rotate 20°, squash 0.5) and the flat, enlarged reading matrix.
  const [a, b, c, d] = [0.94, 0.171, -0.342, 0.47], e = 384, s = 1.45, ex = 0, ey = 22;
  const tilted = f => `matrix(${a},${b},${c},${d},${e},${f})`, flat = `matrix(${s},0,0,${s},${ex},${ey})`;
  const fs = [8, 116, 224], reg = 116; // exploded offsets (top → bottom) and the registered one
  const plane = (i, ...content) => g({ 'data-states': { 0: { transform: tilted(fs[i]) }, 1: { transform: tilted(reg) }, 2: { transform: flat } }, 'data-duration': 1000, 'data-easing': 'smooth', style: 'transform-box:view-box;transform-origin:0 0' }, content);
  const outline = fill => el('rect', { x: 0, y: 0, width: Wm, height: Hm, fill, stroke: t.c('muted'), 'stroke-width': 1.2, 'vector-effect': 'non-scaling-stroke' });

  // Flood layer: 10 m mesh classified by depth, run-length merged per row.
  const cell = 10, cells = [];
  for (let j = 0; j < Hm / cell; j++) {
    let run = null;
    for (let i = 0; i <= Wm / cell; i++) {
      const v = i < Wm / cell ? depth(i * cell + cell / 2, j * cell + cell / 2) : -1;
      const k = classes.findLastIndex(q => v >= q.min);
      if (run && run.k === k) continue;
      if (run && run.k >= 0) cells.push(el('rect', { x: run.i * cell, y: j * cell - 0.3, width: (i - run.i) * cell + 0.3, height: cell + 0.6, fill: t.seq(run.k + 1) }));
      run = { i, k };
    }
  }
  const river = Array.from({ length: 49 }, (_, i) => [i * 10, riverY(i * 10)]);
  const base = plane(2, outline(t.c('paper')),
    roads.map(r => el('path', { d: pathFromPoints(r), fill: 'none', stroke: t.c('context'), 'stroke-width': 3, 'vector-effect': 'non-scaling-stroke' })),
    el('path', { d: pathFromPoints(river, { curve: 'monotone' }), fill: 'none', stroke: t.seq(4), 'stroke-width': 4, 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke' }));
  const flood = plane(1, g({ opacity: 0.88 }, cells), outline('none'));
  const marks = plane(0, outline('none'), shelters.map(p => {
    const hot = atRisk.some(r => r.name === p.name);
    return el('circle', { cx: p.x, cy: p.y, r: hot ? 7.5 : 6, fill: hot ? t.c('accent') : t.c('ink'), stroke: t.c('paper'), 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' });
  }));

  // Layer names travel with their planes (exploded), gather beside the stack (registered), then give way to the legend.
  const corner = f => [e + c * Hm, f + d * Hm]; // the plane's left corner, in figure coordinates
  const names = layers.map((name, i) => {
    const [cx0, cy0] = corner(fs[i]), [, cy1] = corner(reg);
    const y1 = cy1 - 30 + i * 30;
    return g({ 'data-states': { 0: { translate: '0px 0px' }, 1: { translate: `0px ${y1 - cy0}px` } }, 'data-duration': 1000, 'data-easing': 'smooth' },
      g({ 'data-states': { 0: { opacity: 1 }, 2: { opacity: 0 } }, 'data-duration': 350 },
        textLines([name], { x: cx0 - 18, y: cy0, size: 18, weight: 700, anchor: 'end', valign: 'middle', fill: t.c('ink') })));
  });

  // Reading the flat map: labels for shelters inside the zone, legend, scale bar.
  const P = (x, y) => [ex + s * x, ey + s * y];
  const lx = 742;
  const reading = g({ 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 900 },
    atRisk.map(r => { const [px, py] = P(r.x, r.y); return g({},
      el('circle', { cx: px, cy: py, r: 17, fill: 'none', stroke: t.c('accent'), 'stroke-width': 2 }),
      textLines([r.name], { x: px + 24, y: py - 9, size: 17, weight: 700, valign: 'middle', fill: t.c('accent'), halo: t.c('paper') }),
      textLines([`想定浸水深 ${fmt(r.d, { digits: 1 })}m`], { x: px + 24, y: py + 13, size: 16, valign: 'middle', fill: t.c('ink'), halo: t.c('paper') })); }),
    textLines([`${atRisk.length}か所`], { x: lx, y: 40, size: 64, weight: 700, valign: 'top', fill: t.c('accent') }),
    textLines([`避難所${shelters.length}か所のうち、`, '浸水想定区域の中にあるもの'], { x: lx, y: 118, size: 18, weight: 700, valign: 'top', fill: t.c('ink'), lineHeight: 1.4 }),
    textLines(['想定浸水深（想定最大規模）'], { x: lx, y: 196, size: 16, weight: 700, valign: 'top', fill: t.c('muted') }),
    classes.map((q, k) => g({}, el('rect', { x: lx, y: 226 + k * 32, width: 30, height: 20, fill: t.seq(k + 1), opacity: 0.88 }),
      textLines([q.label], { x: lx + 42, y: 236 + k * 32, size: 16, valign: 'middle', fill: t.c('ink') }))),
    g({}, el('line', { x1: lx, x2: lx + s * 30, y1: 352, y2: 352, stroke: t.seq(4), 'stroke-width': 4 }), textLines(['河川'], { x: lx + s * 30 + 12, y: 352, size: 16, valign: 'middle', fill: t.c('ink') })),
    g({}, el('path', { d: `M${lx} ${398}v8H${lx + s * 100}v-8`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.6 }), textLines(['1 km'], { x: lx + s * 100 + 12, y: 404, size: 16, valign: 'middle', fill: t.c('ink') })));
  return svgRoot({ id, width: W, height: H, theme: t,
    title: '避難所・浸水想定区域・地形の3レイヤーを重ね合わせる',
    desc: `離れて表示した3枚のレイヤーを位置合わせして1枚の地図に戻す。重ねると避難所${shelters.length}か所のうち${atRisk.length}か所（${atRisk.map(r => r.name).join('、')}）が想定浸水深0.5m以上の区域にある。` },
  base, flood, marks, names, reading);
}

export default {
  study: true,
  id: 'motion-reassemble',
  language: 'ja',
  title: 'Reassemble layers',
  className: 'st cs-navy-classic-light',
  notes: 'Purpose: Return separated layers to one registered object, so the reading that needs all of them (here, the overlap) becomes possible.\nModify: Replace `depth`, `shelters`, `roads` and `riverY` with your layers (keep one map coordinate system). The mesh classes, the at-risk list and the headline are computed from the depth field.\nInvariant: Each layer is drawn once and only its transform changes; registration is exact in builds 1 and 2; layer names travel with their planes until the legend replaces them.\nStatic: The final build is the flat, registered map with labels and legend. The exploded state can be exported as an extra page when the layers themselves need explaining.',
  sources: [{ type: 'original-example', file: 'assets/motion/reassemble.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">3枚の地図を重ねると、<br>避難所${shelters.length}か所のうち<em>${atRisk.length}か所</em>が浸水想定区域の中にある</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 10mメッシュの想定浸水深（想定最大規模）</span><span>モーション · 分解 → 位置合わせ → 平面化（2ビルド）</span></p>`,
};
