// Diagram study · Sample preparation — one blood draw followed through centrifugation and aliquoting.
// Tube fill heights come from the volumes, the aliquot rows from `aliquots`, and every child ID is built
// from the parent ID, so provenance and split identity are visible and the volume accounting adds up.
import { svgRoot, el, g, textLines, theme as makeTheme, fmt, sum, arrowMarker, measureText } from '../runtime/figure.mjs';

const draw = { id: 'K-0412', tube: 'EDTA管', volume: 10.0, capacity: 12 };         // mL
const spin = { g: 2000, minutes: 10, tempC: 4 };
const layers = [ // top to bottom after centrifugation, mL (illustrative)
  { key: 'P', name: '血漿', volume: 4.6 },
  { key: 'B', name: 'バフィーコート', volume: 0.4 },
  { key: 'R', name: '赤血球', volume: 5.0 },
];
const aliquots = { from: 'P', volume: 0.5, tube: 1.5, uses: [ // each use takes consecutive aliquot numbers
  { name: 'プロテオーム解析', count: 2 }, { name: '代謝物解析', count: 2 }, { name: 'バイオバンク（−80 °C）', count: 4 },
] };
const dna = { from: 'B', count: 2, volumeUl: 100, use: 'ゲノム解析' };

// Derived: child IDs from the parent, volume accounting, number of children.
if (Math.abs(sum(layers.map(l => l.volume)) - draw.volume) > 1e-9) throw Error('sample-preparation: layer volumes must add up to the draw');
let n = 0;
const kids = aliquots.uses.flatMap(u => Array.from({ length: u.count }, () => ({ id: `${aliquots.from}${++n}`, use: u.name })));
const plasma = layers.find(l => l.key === aliquots.from).volume, used = kids.length * aliquots.volume, residual = plasma - used;
const dnaKids = Array.from({ length: dna.count }, (_, i) => `D${i + 1}`);
const children = kids.length + dnaKids.length;
const ml = v => fmt(v, { digits: 1 });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'sample-preparation-fig';
  const top = 92, bottom = 440, tw = 58;                                  // 15 mL tube drawn 348 px tall
  const yOf = vol => bottom - (vol / draw.capacity) * (bottom - top);
  const tubePath = (x, w, y0, y1) => `M${x} ${y0}V${y1 - w / 2}A${w / 2} ${w / 2} 0 0 0 ${x + w} ${y1 - w / 2}V${y0}`;
  const tube = (x, key, fills) => g({},
    el('clipPath', { id: `${id}-${key}` }, el('path', { d: tubePath(x, tw, top, bottom) + 'Z' })),
    g({ 'clip-path': `url(#${id}-${key})` }, fills),
    el('path', { d: tubePath(x, tw, top, bottom), fill: 'none', stroke: t.c('ink'), 'stroke-width': 2 }),
    el('rect', { x: x - 4, y: top - 20, width: tw + 8, height: 20, rx: 3, fill: t.c('ink') }));
  const idText = (x, y, suffix, o = {}) => el('text', { x, y, 'font-size': o.size ?? 16, 'text-anchor': o.anchor ?? 'middle', 'dominant-baseline': 'central', 'font-weight': 700 },
    el('tspan', { fill: t.c('accent') }, draw.id), suffix ? el('tspan', { fill: t.c('ink') }, suffix) : '');

  // 1. whole blood, 2. after the spin: layer heights from volumes on the same mL scale
  const xA = 34, xB = 300, wholeTop = yOf(draw.volume);
  let acc = 0;
  const bands = [...layers].reverse().map(l => { const y1 = yOf(acc), y0 = yOf(acc + l.volume); acc += l.volume; return { ...l, y0, y1 }; });
  const fillOf = k => (k === 'P' ? t.seq(1) : k === 'B' ? t.c('paper') : t.c('muted'));   // plasma keeps one tint wherever it goes
  const tubeA = tube(xA, 'a', [el('rect', { x: xA, y: wholeTop, width: tw, height: bottom - wholeTop + 4, fill: t.c('muted') }), el('line', { fill: 'none', x1: xA, x2: xA + tw, y1: wholeTop, y2: wholeTop, stroke: t.c('ink'), 'stroke-width': 1 })]);
  const tubeB = tube(xB, 'b', bands.map(b => el('rect', { x: xB, y: b.y0, width: tw, height: b.y1 - b.y0 + (b.key === 'R' ? 4 : 0), fill: fillOf(b.key) })).concat(bands.map(b => el('line', { fill: 'none', x1: xB, x2: xB + tw, y1: b.y0, y2: b.y0, stroke: t.c('ink'), 'stroke-width': 1 }))));
  const mid = k => { const b = bands.find(q => q.key === k); return (b.y0 + b.y1) / 2; };

  // 3. destinations: plasma aliquots (top row), DNA (middle), red cells (bottom)
  const mx = 560, mtw = 34, mth = 74, gap = 12, groupGap = 52, rowTop = 70;
  let cx = mx;
  const groups = aliquots.uses.map((u, gi) => {
    const items = kids.filter(k => k.use === u.name), x0 = cx;
    const tubes = items.map(k => {
      const x = cx; cx += mtw + gap;
      const fillTop = rowTop + mth - (aliquots.volume / aliquots.tube) * (mth - 8);
      return g({},
        el('path', { d: `M${x} ${rowTop}V${rowTop + mth - 16}L${x + mtw / 2} ${rowTop + mth}L${x + mtw} ${rowTop + mth - 16}V${rowTop}Z`, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 1.5 }),
        el('path', { d: `M${x} ${fillTop}V${rowTop + mth - 16}L${x + mtw / 2} ${rowTop + mth}L${x + mtw} ${rowTop + mth - 16}V${fillTop}Z`, fill: fillOf('P'), stroke: t.c('ink'), 'stroke-width': 1 }),
        el('rect', { x: x - 2, y: rowTop - 10, width: mtw + 4, height: 10, rx: 2, fill: t.c('ink') }),
        textLines([k.id], { x: x + mtw / 2, y: rowTop + mth + 16, size: 16, anchor: 'middle', valign: 'middle', weight: 700, fill: t.c('ink') }));
    });
    const x1 = cx - gap; cx += groupGap - gap;
    return g({}, tubes,
      el('path', { d: `M${x0} ${rowTop + mth + 34}v6H${x1}v-6`, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.2 }),
      textLines([u.name], { x: (x0 + x1) / 2, y: rowTop + mth + 52, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') }));
  });
  const rowRight = cx - groupGap;
  const dnaY = 316, dnaX = 720;
  const dnaTubes = dnaKids.map((k, i) => {
    const x = dnaX + i * (mtw + gap), fillTop = dnaY + mth - 0.25 * (mth - 8);
    return g({},
      el('path', { d: `M${x} ${dnaY}V${dnaY + mth - 16}L${x + mtw / 2} ${dnaY + mth}L${x + mtw} ${dnaY + mth - 16}V${dnaY}Z`, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 1.5 }),
      el('path', { d: `M${x} ${fillTop}V${dnaY + mth - 16}L${x + mtw / 2} ${dnaY + mth}L${x + mtw} ${dnaY + mth - 16}V${fillTop}Z`, fill: t.c('context'), stroke: t.c('ink'), 'stroke-width': 1 }),
      el('rect', { x: x - 2, y: dnaY - 10, width: mtw + 4, height: 10, rx: 2, fill: t.c('ink') }),
      textLines([k], { x: x + mtw / 2, y: dnaY + mth + 16, size: 16, anchor: 'middle', valign: 'middle', weight: 700, fill: t.c('ink') }));
  });
  const arrow = (d) => el('path', { d, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.6, 'marker-end': `url(#${id}-arr)` });
  const labelX = xB + tw + 14;
  const layerLabel = (k, text) => textLines([text], { x: labelX, y: mid(k), size: 16, valign: 'middle', weight: 700, fill: t.c('ink') });
  const plasmaEnd = labelX + measureText(`血漿 ${ml(plasma)} mL`, 16, { weight: 700 }) + 10;
  const buffyEnd = labelX + measureText(`バフィーコート ${ml(layers[1].volume)} mL`, 16, { weight: 700 }) + 10;

  return svgRoot({ id, width: W, height: H, theme: t,
    title: '採血1本から子検体への分注フロー（ID・液量・保管先）',
    desc: `${draw.tube}${ml(draw.volume)} mL（${draw.id}）を${fmt(spin.g)} ×g、${spin.minutes}分、${spin.tempC} °Cで遠心し、血漿${ml(plasma)} mL、バフィーコート${ml(layers[1].volume)} mL、赤血球${ml(layers[2].volume)} mLに分けた。血漿は${fmt(aliquots.volume * 1000)} µLずつ${kids.length}本（${kids[0].id}〜${kids.at(-1).id}）に分注し、残り${ml(residual)} mLは廃棄。バフィーコートからDNAを抽出し${dnaKids.join('、')}とした。子検体は計${children}本で、IDはすべて${draw.id}から始まる。` },
  el('defs', {}, arrowMarker(`${id}-arr`, t.c('muted'))),
  // headers
  textLines(['採血'], { x: xA, y: 2, size: 17, valign: 'top', weight: 700, fill: t.c('ink') }),
  textLines([`${draw.tube}、${ml(draw.volume)} mL`], { x: xA, y: 26, size: 15, valign: 'top', fill: t.c('muted') }),
  textLines(['遠心後'], { x: xB, y: 2, size: 17, valign: 'top', weight: 700, fill: t.c('ink') }),
  textLines(['同じ縮尺（mL）'], { x: xB, y: 26, size: 15, valign: 'top', fill: t.c('muted') }),
  tubeA, idText(xA + tw / 2, bottom + 18, ''),
  arrow(`M${xA + tw + 14} ${(top + bottom) / 2}H${xB - 16}`),
  textLines(['遠心分離'], { x: (xA + tw + xB) / 2, y: (top + bottom) / 2 - 32, size: 16, anchor: 'middle', valign: 'middle', weight: 700, fill: t.c('ink') }),
  textLines([`${fmt(spin.g)} ×g、${spin.minutes}分`, `${spin.tempC} °C`], { x: (xA + tw + xB) / 2, y: (top + bottom) / 2 + 30, size: 15, anchor: 'middle', valign: 'middle', fill: t.c('muted'), lineHeight: 1.3 }),
  tubeB, idText(xB + tw / 2, bottom + 18, ''),
  layerLabel('P', `血漿 ${ml(plasma)} mL`), layerLabel('B', `バフィーコート ${ml(layers[1].volume)} mL`), layerLabel('R', `赤血球 ${ml(layers[2].volume)} mL`),
  // branches: each fraction goes to exactly one destination
  arrow(`M${plasmaEnd} ${mid('P')}H${mx - 40}V${rowTop + mth / 2}H${mx - 12}`),
  arrow(`M${buffyEnd} ${mid('B')}H${dnaX - 92}V${dnaY + mth / 2}H${dnaX - 12}`),
  textLines(['DNA抽出'], { x: dnaX - 98, y: dnaY + mth / 2 - 4, size: 15, anchor: 'end', valign: 'bottom', weight: 700, fill: t.c('ink') }),
  textLines(['廃棄（量のみ記録）'], { x: labelX, y: mid('R') + 24, size: 15, valign: 'middle', fill: t.c('muted') }),
  // aliquot row with its header and accounting
  textLines([`分注：${fmt(aliquots.volume * 1000)} µLずつ${kids.length}本`], { x: mx, y: 2, size: 17, valign: 'top', weight: 700, fill: t.c('ink') }),
  textLines([`残り${ml(residual)} mLは廃棄量として記録`], { x: mx, y: 26, size: 15, valign: 'top', fill: t.c('muted') }),
  groups,
  idText(rowRight + 22, rowTop + mth / 2 - 12, '-P1〜P' + kids.length, { anchor: 'start', size: 16 }),
  textLines([`微量チューブ${fmt(aliquots.tube)} mL`], { x: rowRight + 22, y: rowTop + mth / 2 + 14, size: 15, valign: 'middle', fill: t.c('muted') }),
  dnaTubes,
  idText(dnaX + dna.count * (mtw + gap) + 14, dnaY + mth / 2 - 12, '-D1、D2', { anchor: 'start', size: 16 }),
  textLines([`各${dna.volumeUl} µL、${dna.use}へ`], { x: dnaX + dna.count * (mtw + gap) + 14, y: dnaY + mth / 2 + 14, size: 15, valign: 'middle', fill: t.c('muted') }));
}

export default {
  study: true,
  id: 'sample-preparation',
  language: 'ja',
  title: 'Sample preparation: split identity and provenance',
  className: 'st cs-laboratory',
  notes: 'Purpose: Track how one specimen is transformed and split, so every child sample can be traced to its parent and its volume accounted for.\nModify: Edit `draw`, `spin`, `layers`, `aliquots` and `dna`; tube fill heights, layer bands, aliquot rows, child IDs and the volume accounting recompute (layer volumes must add up to the draw).\nInvariant: Handling order runs left to right; every child ID is derived from the parent ID; each fraction goes to exactly one destination; volumes on the two large tubes share one mL scale; residual volume is recorded, not hidden.\nStatic: Already static. For a talk, reveal the draw, the spin, then each branch.',
  sources: [{ type: 'original-example', file: 'assets/svg/sample-preparation.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">1本の採血から${children}本の子検体。<br><span class="st-quiet">どの番号も親の<em>${draw.id}</em>を引き継ぐ</span></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 血漿は${fmt(aliquots.volume * 1000)} µL × ${kids.length}本＝${ml(used)} mL、残り${ml(residual)} mL</span><span>検体処理フロー（分注と系統）</span></p>`,
};
