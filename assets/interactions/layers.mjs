// Interaction study · Layer toggles — a neighbourhood hazard map built up layer by layer (Japanese page).
// Geometry is data in metres (x east, y south) projected onto the figure; which shelters lie inside a
// flood zone is computed with a point-in-polygon test, so the headline follows the map.
import { el, g, textLines, theme } from '../runtime/figure.mjs';

const W = 816, H = 480, area = [1600, 940];                 // figure px; mapped area in metres
const k = Math.min(W / area[0], H / area[1]), P = ([x, y]) => [+(x * k).toFixed(1), +(y * k).toFixed(1)];
const river = x => 330 + (x - 400) * 0.33;                  // centreline of 川辺川, metres south
const xs = Array.from({ length: 17 }, (_, i) => i * 100);
const band = (north, south) => [...xs.map(x => [x, river(x) - north]), ...[...xs].reverse().map(x => [x, river(x) + south])];
const zones = [                                             // 想定最大規模の降雨での浸水深（架空）
  { depth: '0.5 m未満', north: 230, south: 450, tone: 1 },
  { depth: '0.5〜3 m', north: 170, south: 300, tone: 3 },
  { depth: '3 m以上', north: 90, south: 140, tone: 5 },
];
const shelters = [
  { name: '中央公民館', at: [980, 160], capacity: 300, side: 'right' },
  { name: '第一小学校', at: [420, 540], capacity: 420, side: 'left' },
  { name: '川辺中学校', at: [700, 815], capacity: 510, side: 'right' },
];
const streets = [[[0, 120], [1600, 120]], [[0, 560], [1600, 560]], [[200, 0], [200, 940]], [[520, 0], [520, 940]], [[980, 0], [980, 560]], [[1250, 0], [1250, 940]], [[700, 560], [700, 940]]];
const routes = [[[300, 760], [520, 760], [520, 120], [980, 120], [980, 150]], [[1250, 840], [1250, 120], [980, 120], [980, 150]]];

// Point-in-polygon (ray casting): is a shelter inside a zone?
const inside = ([x, y], poly) => poly.reduce((hit, [x1, y1], i) => { const [x2, y2] = poly[(i + 1) % poly.length]; return ((y1 > y) !== (y2 > y)) && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1 ? !hit : hit; }, false);
const deepest = s => zones.reduce((found, z) => (inside(s.at, band(z.north, z.south)) ? z : found), null);
const dry = shelters.filter(s => !deepest(s)), wet = shelters.filter(s => deepest(s));

const t = theme('css'), path = pts => 'M' + pts.map(p => P(p).join(' ')).join('L');
const layers = [
  { id: 'flood', name: '浸水想定区域', note: '3 m以上の浸水は川沿いの帯に集まる。',
    svg: g({}, zones.map(z => el('path', { d: path(band(z.north, z.south)) + 'Z', fill: t.seq(z.tone) })),
      zones.map((z, i) => textLines([z.depth], { x: P([1560, 0])[0], y: P([0, river(1560) + [-200, -130, 90][i]])[1], size: 16, anchor: 'end', valign: 'middle', fill: i === 2 ? t.c('paper') : t.c('ink'), weight: 650 }))) },
  { id: 'base', name: '道路と川', note: '',
    svg: g({}, streets.map(s => el('path', { d: path(s), fill: 'none', stroke: t.c('context'), 'stroke-width': 5 })),
      el('path', { d: path(xs.map(x => [x, river(x) - 32])) + path([...xs].reverse().map(x => [x, river(x) + 32])).replace('M', 'L') + 'Z', fill: t.c('surface'), stroke: t.seq(6), 'stroke-width': 1.5 }),
      textLines(['川辺川'], { x: P([300, 0])[0], y: P([0, river(300)])[1], size: 17, fill: t.seq(6), weight: 700, valign: 'middle', attrs: { transform: `rotate(${(Math.atan(0.33) * 180 / Math.PI).toFixed(1)} ${P([300, 0])[0]} ${P([0, river(300)])[1]})` } }),
      el('line', { x1: 18, x2: 18 + 200 * k, y1: H - 18, y2: H - 18, stroke: t.c('ink'), 'stroke-width': 2 }),
      textLines(['200 m'], { x: 26 + 200 * k, y: H - 18, size: 16, valign: 'middle', fill: t.c('muted') })) },
  { id: 'routes', name: '避難経路', note: '経路はどれも橋を渡って中央公民館へ向かう。',
    svg: g({}, routes.map(r => {
      const end = P(r[r.length - 1]), prev = P(r[r.length - 2]), a = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
      const head = [[end[0], end[1]], [end[0] - 12 * Math.cos(a) + 6 * Math.sin(a), end[1] - 12 * Math.sin(a) - 6 * Math.cos(a)], [end[0] - 12 * Math.cos(a) - 6 * Math.sin(a), end[1] - 12 * Math.sin(a) + 6 * Math.cos(a)]];
      return g({}, el('path', { d: path(r.slice(0, -1)) + `L${end.join(' ')}`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 4, 'stroke-linejoin': 'round' }),
        el('path', { d: 'M' + head.map(p => p.map(v => v.toFixed(1)).join(' ')).join('L') + 'Z', fill: t.c('ink') }));
    })) },
  { id: 'shelters', name: '避難所', note: `避難所${shelters.length}か所のうち${wet.length}か所が浸水想定区域内。`,
    svg: g({}, shelters.map(s => {
      const [x, y] = P(s.at), z = deepest(s), right = s.side === 'right';
      return g({}, el('circle', { cx: x, cy: y, r: 9, fill: z ? t.c('paper') : t.c('ink'), stroke: t.c('ink'), 'stroke-width': 3 }),
        textLines([s.name], { x: x + (right ? 16 : -16), y: y - 10, size: 18, anchor: right ? 'start' : 'end', valign: 'middle', weight: 700, fill: t.c('ink'), halo: t.c('paper') }),
        textLines([z ? `浸水 ${z.depth}・収容${s.capacity}人` : `区域外・収容${s.capacity}人`], { x: x + (right ? 16 : -16), y: y + 12, size: 16, anchor: right ? 'start' : 'end', valign: 'middle', fill: z ? t.c('negative') : t.c('ink'), weight: 600, halo: t.c('paper') }));
    })) },
];
const ID = 'interaction-layers';

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Layer toggles: a hazard map built up layer by layer',
  notes: `Purpose: 説明会で地図を一層ずつ重ね、「道路と川」→「浸水想定」→「避難所」→「避難経路」の順に、住民が自分の場所と逃げ先を確かめられるようにする。
Modify: \`zones\`・\`shelters\`・\`streets\`・\`routes\` を実際の座標（m）に差し替える。どの避難所が浸水想定区域内かは点と多角形の判定で計算され、見出しも変わる。
Invariant: レイヤーを消しても元の図形は消えない（表示を切り替えるだけ）。浸水の深さは順序のある色（淡→濃）で、区域名は帯の上に直接書く。上が北。
Static: 書き出しは最初の状態（道路と川・浸水想定・避難所）を表示する。避難経路まで入れた版は配布用に別ページにする。`,
  sources: [{ type: 'original-example', file: 'assets/interactions/layers.mjs' }],
  exportPolicy: 'final',
  className: 'st cs-geo-map',
  content: `<h1 class="st-head">${shelters.length}か所の避難所のうち、浸水想定区域の外にあるのは${dry.map(s => s.name).join('と')}だけ</h1>
<p class="st-dek">川辺町3〜5丁目（架空）のハザードマップ。想定最大規模の降雨による浸水深。</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>架空の地図 · 上が北、縮尺は左下</span><span>操作 · レイヤーの切り替え</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'layers',
    initial: { base: true, flood: true, shelters: true, routes: false },
    data: { viewBox: [W, H], layers, controlOrder: ['base', 'flood', 'shelters', 'routes'] },
    text: { reset: '元に戻す', shown: '表示', hidden: '非表示', status: '表示中：{shown}。{notes}', figure: '川辺町3〜5丁目のハザードマップ' },
  }],
};
