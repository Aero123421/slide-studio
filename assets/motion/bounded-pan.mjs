// Motion study · Pan inside a bounded canvas — a 28-stop tram line is three slides wide; the
// frame stays put while the strip pans west → centre → east, and the overview strip above
// shows where the frame is. Offsets are computed from the stops each build is about.
// Builds: 1 pan to the centre, 2 pan to the 2024 extension.
import { svgRoot, el, g, linear, textLines, statesAttr, theme as makeTheme, fmt, n } from '../runtime/figure.mjs';

// 市電東西線の停留場（西→東）と1日の平均乗車人員（架空のデータ）。ext: 2024年の延伸区間。
const stops = [
  ['西車庫前', 420], ['若葉町', 610], ['桜台', 880], ['県営住宅前', 1340], ['中央図書館', 760], ['二の丸', 540], ['城址公園', 1120],
  ['本町三丁目', 1480], ['本町一丁目', 2150], ['市役所前', 2860], ['中央駅前', 6240], ['紺屋町', 1930], ['新町通', 2470], ['県庁前', 2210],
  ['総合病院前', 1760], ['市場前', 980], ['東雲町', 720], ['港通', 650], ['川端', 530], ['大橋', 810], ['新田', 690], ['工業団地', 1270],
  ['東高校前', 1150], ['学園通', 1890, 'ext'], ['大学病院前', 4120, 'ext'], ['研究所前', 1360, 'ext'], ['ニュータウン中央', 2280, 'ext'], ['東ニュータウン', 1610, 'ext'],
].map(([name, boardings, ext]) => ({ name, boardings, ext: ext === 'ext' }));
const extYear = 2024; // the year the eastern extension opened
const total = stops.reduce((s, x) => s + x.boardings, 0);
const ext = stops.filter(s => s.ext), extShare = Math.round((ext.reduce((s, x) => s + x.boardings, 0) / total) * 100);
const ranked = [...stops].sort((a, b) => b.boardings - a.boardings);
const busiestExt = ranked.find(s => s.ext), extRank = ranked.indexOf(busiestExt) + 1;
const segments = [ // labelled stretches of the line, in stop indices; labels sit at each stretch's start
  { from: 0, to: 9, label: '西部　住宅地と城下町' }, { from: 10, to: 22, label: '中心部から東の工業団地まで' }, { from: 23, to: 27, label: `${extYear}年の延伸区間`, ext: true },
];
// What each build frames: the west end, the centre (on 中央駅前), the east end.
const focusStop = [0, stops.findIndex(s => s.name === '中央駅前'), stops.length - 1];

// Geometry shared by the overview strip and the canvas.
const W = 1152, viewY = 96, viewH = 470 - viewY, spacing = 112, pad = 64, track = 178, hMax = 140;
const sx = i => pad + i * spacing, canvasW = sx(stops.length - 1) + pad;
const offsets = focusStop.map(i => Math.max(0, Math.min(canvasW - W, sx(i) - W / 2))); // centre stop i, clamped to the canvas

// Overview strip: the whole line, always visible, with the frame's current window.
export function figure(theme = 'css') {
  const t = makeTheme(theme), H = viewY;
  const mm = linear([0, canvasW], [12, W - 12]), base = 44, mmH = v => (v / ranked[0].boardings) * 34;
  const win = Object.fromEntries(offsets.map((o, k) => [k, { transform: `matrix(1,0,0,1,${n(mm(o) - mm(0))},0)` }]));
  return svgRoot({ id: 'motion-bounded-pan-fig', width: W, height: H, theme: t,
    title: '市電東西線の全停留場の乗車人員（概観）と、いま拡大している範囲',
    desc: `全${stops.length}停留場、1日${fmt(total, { locale: 'ja' })}人。最多は${ranked[0].name}の${fmt(ranked[0].boardings, { locale: 'ja' })}人。${extYear}年に延伸した${ext.length}停留場で全体の${extShare}%、${busiestExt.name}は全線で${extRank}番目。` },
  el('line', { x1: mm(sx(0)), x2: mm(sx(stops.length - 1)), y1: base + 1, y2: base + 1, stroke: t.c('ink'), 'stroke-width': 2 }),
  stops.map((s, i) => el('rect', { x: mm(sx(i)) - 4, y: base - mmH(s.boardings), width: 8, height: mmH(s.boardings), fill: s.ext ? t.c('accent') : t.c('context') })),
  textLines([stops[0].name], { x: mm(sx(0)) - 4, y: base + 10, size: 16, valign: 'top', fill: t.c('muted') }),
  textLines([stops.at(-1).name], { x: mm(sx(stops.length - 1)) + 4, y: base + 10, size: 16, anchor: 'end', valign: 'top', fill: t.c('muted') }),
  g({ 'data-states': win, 'data-duration': 1100, 'data-easing': 'smooth', style: 'transform-box:view-box;transform-origin:0 0' },
    el('rect', { x: mm(0), y: 2, width: mm(W) - mm(0), height: base + 4, fill: 'none', stroke: t.c('ink'), 'stroke-width': 2, rx: 3 })),
  textLines(['1日の平均乗車人員（人）'], { x: W / 2, y: base + 10, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') }));
}

// The wide canvas: the line at reading size. It is clipped by a fixed frame and only translates.
function canvas(theme = 'css') {
  const t = makeTheme(theme), bh = v => (v / ranked[0].boardings) * hMax;
  const colour = s => (s.ext ? t.c('accent') : t.c('context'));
  return svgRoot({ id: 'motion-bounded-pan-line', width: canvasW, height: viewH, theme: t,
    title: '市電東西線の停留場別1日乗車人員（西から東へ）', desc: stops.map(s => `${s.name} ${fmt(s.boardings, { locale: 'ja' })}人`).join('、') },
  el('line', { x1: sx(0), x2: sx(stops.length - 1), y1: track, y2: track, stroke: t.c('ink'), 'stroke-width': 5, 'stroke-linecap': 'round' }),
  stops.map((s, i) => g({},
    el('rect', { x: sx(i) - 22, y: track - 6 - bh(s.boardings), width: 44, height: bh(s.boardings), fill: colour(s) }),
    textLines([fmt(s.boardings, { locale: 'ja' })], { x: sx(i), y: track - 14 - bh(s.boardings), size: 16, anchor: 'middle', fill: s.ext ? t.c('accent') : t.c('ink'), weight: s === ranked[0] || s === busiestExt ? 700 : 400 }),
    el('circle', { cx: sx(i), cy: track, r: 6, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 2.5 }),
    // Stop names set vertically, as on Japanese route maps.
    el('text', { x: sx(i), y: track + 18, 'font-size': 17, fill: t.c('ink'), 'writing-mode': 'vertical-rl', 'font-weight': s.ext ? 700 : null }, s.name))),
  segments.map(sg => g({},
    el('path', { d: `M${sx(sg.from) - 30} ${track + 158}v8H${sx(sg.to) + 30}v-8`, fill: 'none', stroke: sg.ext ? t.c('accent') : t.c('muted'), 'stroke-width': 1.6 }),
    textLines([sg.label], { x: sx(sg.from) - 22, y: track + 184, size: 17, valign: 'middle', fill: sg.ext ? t.c('accent') : t.c('muted'), weight: 700 }))));
}
const pan = Object.fromEntries(offsets.map((o, k) => [k, { transform: `translateX(${-o}px)` }]));

export default {
  study: true,
  id: 'motion-bounded-pan',
  language: 'ja',
  title: 'Bounded pan: traverse a wide strip inside a fixed frame',
  className: 'st cs-geo-map',
  notes: `Purpose: Traverse a structure wider than the slide (a 28-stop line) without moving the slide frame: the canvas pans inside a clipped viewport, and an overview strip shows where the frame is.\nModify: Replace \`stops\` (name, boardings, extension flag) and \`focusStop\` (the stop each build centres on); canvas width, pan offsets and the overview window are computed and clamped to the canvas.\nInvariant: Only the canvas and the overview window move, by the same offset; bars share one scale; the overview always shows the whole line, so the final (east) frame still carries the whole picture.\nStatic: The final build frames the 2024 extension; the overview strip shows every stop.`,
  sources: [{ type: 'original-example', file: 'assets/motion/bounded-pan.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="font-family:var(--ss-font-sans)">${extYear}年の<em>延伸区間</em>の${ext.length}停留場で、全線の乗車の${extShare}%を占める</h1>
<figure class="st-fig" data-region="primary"><div style="position:relative;width:${W}px;height:470px">${figure()}
<div style="position:absolute;left:0;top:${viewY}px;width:${W}px;height:${viewH}px;overflow:hidden"><div style="width:${canvasW}px;height:${viewH}px" data-states="${statesAttr(pan)}" data-duration="1100" data-easing="smooth">${canvas()}</div></div></div></figure>
<p class="st-source" data-region="source"><span>架空のデータ · 2025年度の平日平均、ICカードの乗車記録</span><span>モーション · 固定した枠の中でパンする（2ステップ）</span></p>`,
};
