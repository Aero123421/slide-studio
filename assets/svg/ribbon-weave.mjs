// Diagram study · Ribbon weave — crossing bands whose depth order comes from a weave structure.
// A 2/2 twill decides, for every crossing, whether the warp or the weft is on top; the occlusion
// and the paper gaps that make it legible are computed from that rule, never drawn by hand.
import { svgRoot, el, g, theme as makeTheme } from '../runtime/figure.mjs';

// 反物ができるまでの工程と、その担い手（架空）。before = 現在の分業、after = 再編後。
const steps = [
  { step: '糸染め', before: '青木藍染工房', after: '一貫工房' }, { step: '整経', before: '森整経所', after: '一貫工房' },
  { step: '糊付け', before: '森整経所', after: '一貫工房' }, { step: '機掛け', before: '三浦機業', after: '一貫工房' },
  { step: '製織', before: '三浦機業', after: '一貫工房' }, { step: '検反', before: '小池検反所', after: '仕上げ所' },
  { step: '仕上げ', before: '東整理加工', after: '仕上げ所' },
];
const leadDays = { before: 46, after: 23 };          // 反物1本の納期（日）
const chapters = ['産地のいま', '分業から一貫へ', '販路と価格', '人を育てる'];
const current = 1;
const nBefore = new Set(steps.map(s => s.before)).size, nAfter = new Set(steps.map(s => s.after)).size;
const kanji = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const lead = leadDays.after / leadDays.before;
const leadText = Math.abs(lead - 0.5) < 0.01 ? '半分' : `${Math.round(lead * 100)}%`;

// Weave: a swatch of warp (vertical) and weft (horizontal) ribbons; twill(i, j) is true where the warp is on top.
// The swatch bleeds off the top and right edges and ends in a short fringe on the left and at the bottom.
const W = 1280, H = 720;
const motif = {
  x0: 730, y1: 616, band: 58, pitch: 70, fringe: 30, edge: 3,
  twill: (i, j) => (((i - j) % 4) + 4) % 4 < 2,          // 2/2 twill: two over, two under, stepping by one
};

export function figure(theme = 'css') {
  const t = makeTheme(theme), { x0, y1, band, pitch, fringe, edge, twill } = motif;
  const cols = Math.ceil((W - x0) / pitch) + 1, rows = Math.ceil(y1 / pitch) + 1;
  const wx = i => x0 + i * pitch, wy = j => y1 - fringe - band - j * pitch;   // weft rows counted upward from the bottom
  const warp = t.seq(5), weft = t.seq(2);
  const gap = (x1, y1, x2, y2) => el('line', { x1, y1, x2, y2 });
  const weftOver = [], cuts = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const x = wx(i), y = wy(j);
    if (twill(i, j)) cuts.push(gap(x, y, x, y + band), gap(x + band, y, x + band, y + band));          // weft dives under the warp
    else {
      weftOver.push(el('rect', { x, y, width: band, height: band, fill: weft }));
      cuts.push(gap(x, y, x + band, y), gap(x, y + band, x + band, y + band));                          // warp dives under the weft
    }
  }
  return svgRoot({ id: 'ribbon-weave-fig', width: W, height: H, theme: t,
    title: '藍の経糸と淡い緯糸の綾織り',
    desc: `${cols}本の経糸と${rows}本の緯糸を2/2の綾織りで交差させた装飾。交点ごとに上になる糸を規則から決め、下になる糸との間に紙の色の隙間を入れて重なりの順を示している。データは表していない。` },
  el('defs', {}, el('clipPath', { id: 'ribbon-weave-clip' }, el('rect', { x: 0, y: 0, width: W, height: H }))),
  g({ 'clip-path': 'url(#ribbon-weave-clip)' },
    Array.from({ length: rows }, (_, j) => el('rect', { x: x0 - fringe, y: wy(j), width: W, height: band, fill: weft })),
    Array.from({ length: cols }, (_, i) => el('rect', { x: wx(i), y: -10, width: band, height: y1 + 10, fill: warp })),
    weftOver,
    g({ stroke: t.c('paper'), 'stroke-width': edge }, cuts)));
}

export default {
  study: true,
  id: 'ribbon-weave',
  language: 'ja',
  title: 'Ribbon weave: crossing bands with explicit depth order',
  className: 'st st--full cs-wa-ai',
  notes: 'Purpose: Give a chapter page a woven texture whose over-and-under order is explicit and consistent, here for a textile business plan.\nModify: Edit `steps`, `leadDays`, `chapters` and `current`; the workshop counts, the lead-time change and the chapter number recompute. Change `motif.twill` for another weave (plain weave: (i + j) % 2 === 0), `band`/`pitch` for ribbon width and gap, `x0`/`y1` to move the left and bottom edges of the swatch.\nInvariant: Every crossing follows the weave rule; the under band always shows a paper gap at the over band\'s edges. Text never touches the weave. The weave encodes no data.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/ribbon-weave.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="top:150px;max-width:540px;font-size:44px;line-height:1.36;word-break:auto-phrase">${kanji[steps.length]}工程を${kanji[nAfter]}つの工房に集め、納期を${leadText}にする</h1>
<p class="st-dek" style="top:330px;max-width:540px;font-size:21px;color:var(--ss-ink);word-break:auto-phrase">${steps[0].step}から${steps.at(-1).step}までの${kanji[steps.length]}工程を、いまは${kanji[nBefore]}つの工房が分け合っている。集約後、反物1本の納期は${leadDays.before}日から${leadDays.after}日に縮まる。</p>
<p class="st-text st-muted" data-region="support" style="position:absolute;left:64px;top:560px;font-size:17px">第${kanji[current + 1]}章　${chapters[current]}（全${kanji[chapters.length]}章）</p>
<p class="st-source" data-region="source"><span>架空のデータ · 織物産地の事業計画。織り柄は装飾で、データではない</span><span>リボンの織り（綾織り）</span></p>`,
};
