// Motion study · Reveal through a crop — the slide opens on one registered detail of a menu
// photo (the crema), then the crop opens out to the whole picture without moving or scaling
// it; the detail keeps its outline. Builds: 1 the crop opens, 2 the other areas and the counts.
import { svgRoot, el, g, linear, textLines, theme as makeTheme, n } from '../runtime/figure.mjs';

// メニュー写真（CC0、600 × 400 px）の注視領域（px）と、最初の注視が向いた人数（架空の視線計測、48人）。
const photo = { w: 600, h: 400, href: '{{asset:assets/media/study-01.jpg}}' };
const areas = [
  { name: 'クレマ', x: 204, y: 92, w: 170, h: 102, first: 30, focus: true },
  { name: 'スプーン', x: 326, y: 64, w: 86, h: 268, first: 7 },
  { name: '取っ手', x: 192, y: 226, w: 74, h: 82, first: 6 },
  { name: 'ソーサー', x: 78, y: 236, w: 110, h: 120, first: 3 },
  { name: '背景の天板', x: 470, y: 8, w: 122, h: 110, first: 2 },
];
const people = areas.reduce((s, a) => s + a.first, 0);
const pct = a => Math.round((a.first / people) * 100);
const focus = areas.find(a => a.focus);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, s = 1.12, P = { x: 0, y: 8, w: photo.w * s, h: photo.h * s };
  const box = a => ({ x: P.x + a.x * s, y: P.y + a.y * s, w: a.w * s, h: a.h * s });
  const unit = b => `matrix(${n(b.w)},0,0,${n(b.h)},${n(b.x)},${n(b.y)})`;
  const F = box(focus), railX = P.w + 60, x = linear([0, 100], [0, W - railX - 70]);
  const tag = (a, on) => { // a small paper label on the area's top edge (inside it when the edge is the photo's)
    const bx = box(a), w = a.name.length * 18 + 64, ty = bx.y - 30 < P.y ? bx.y + 2 : bx.y - 30;
    return g({}, el('rect', { x: bx.x, y: ty, width: w, height: 28, fill: t.c('paper'), opacity: 0.92 }),
      textLines([`${a.name} ${pct(a)}%`], { x: bx.x + 8, y: ty + 14, size: 17, valign: 'middle', fill: on ? t.c('accent') : t.c('ink'), weight: 700 })); };
  return svgRoot({ id: 'motion-crop-reveal-fig', width: W, height: H, theme: t,
    title: 'エスプレッソのメニュー写真と、最初の視線が向いた領域',
    desc: `${people}人中${focus.first}人（${pct(focus)}%）の最初の視線がクレマに向いた。` + areas.filter(a => !a.focus).map(a => `${a.name}${a.first}人`).join('、') + '。' },
  el('defs', {}, el('mask', { id: 'motion-crop-reveal-crop', maskUnits: 'userSpaceOnUse', x: P.x, y: P.y, width: P.w, height: P.h },
    // The crop: a unit square scaled to the detail at build 0 and to the whole photo at build 1.
    el('rect', { x: 0, y: 0, width: 1, height: 1, fill: '#fff', 'data-states': { 0: { transform: unit(F) }, 1: { transform: unit(P) } }, 'data-duration': 1000, 'data-easing': 'smooth', style: 'transform-box:view-box;transform-origin:0 0' }))),
  el('rect', { x: P.x, y: P.y, width: P.w, height: P.h, fill: 'none', stroke: t.c('rule'), 'stroke-width': 1.5, 'stroke-dasharray': '6 5' }),
  el('image', { href: photo.href, x: P.x, y: P.y, width: P.w, height: P.h, preserveAspectRatio: 'none', mask: 'url(#motion-crop-reveal-crop)' }),
  el('rect', { x: F.x, y: F.y, width: F.w, height: F.h, fill: 'none', stroke: t.c('accent'), 'stroke-width': 3 }),
  tag(focus, true),
  // Build 2 — the other areas, quieter, and the full count beside the photo.
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-stagger': 90 },
    areas.filter(a => !a.focus).map(a => { const b = box(a); return g({}, el('rect', { x: b.x, y: b.y, width: b.w, height: b.h, fill: 'none', stroke: t.c('paper'), 'stroke-width': 2, 'stroke-dasharray': '5 4' }), tag(a, false)); })),
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 300 },
    textLines(['最初の視線が向いた領域', `（${people}人）`], { x: railX, y: 30, size: 17, valign: 'top', fill: t.c('muted'), lineHeight: 1.45 }),
    areas.map((a, k) => { const y0 = 110 + k * 66; return g({},
      textLines([a.name], { x: railX, y: y0, size: 18, valign: 'top', fill: a.focus ? t.c('ink') : t.c('muted'), weight: a.focus ? 700 : 400 }),
      el('rect', { x: railX, y: y0 + 30, width: Math.max(2, x(pct(a))), height: 18, fill: a.focus ? t.c('accent') : t.c('context') }),
      textLines([`${a.first}人  ${pct(a)}%`], { x: railX + Math.max(2, x(pct(a))) + 10, y: y0 + 39, size: 17, valign: 'middle', fill: a.focus ? t.c('accent') : t.c('muted'), weight: a.focus ? 700 : 400 })); })));
}

export default {
  study: true,
  id: 'motion-crop-reveal',
  language: 'ja',
  title: 'Crop reveal: open a registered detail to the whole',
  className: 'st cs-food-market',
  notes: 'Purpose: Open on a detail and expose the whole picture around it without changing its identity: the photo never moves or scales, only the crop opens, and the detail keeps its outline.\nModify: Replace the photo and `areas` (boxes in source pixels, counts); the shares, the bars and the crop geometry recompute. Put the area the headline names first and flag it `focus`.\nInvariant: The image is drawn once at one scale; the crop is a mask whose window grows from the detail to the full frame (registered at every frame). Other areas are added only after the whole is visible.\nStatic: The final build shows the whole photo, every area outlined and labelled, and the counts.',
  sources: [{ type: 'original-example', file: 'assets/motion/crop-reveal.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="font-family:var(--ss-font-sans)">メニュー写真で最初に目が向くのは<em>クレマ</em>。${people}人中${focus.first}人だった</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 視線計測で最初の注視点を記録（${people}人）、写真はCC0</span><span>モーション · 細部の切り抜きから全体へ（2ステップ）</span></p>`,
};
