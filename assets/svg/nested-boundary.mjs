// Diagram study · Nested boundaries — membership by position: inside a boundary means in scope.
// Zones nest (network ⊃ audit scope ⊃ token vault). Each system names its zone and, if it moved,
// the zone it came from; boxes, ghosts, crossing arrows, counts and the headline are computed.
import { theme as makeTheme, svgRoot, el, g, textLines, measureNode, drawNode, arrowMarker, roundRectPath } from '../runtime/figure.mjs';

const zones = [ // outer to inner; each zone lies inside the previous one
  { id: 'corp', label: '社内ネットワーク' },
  { id: 'scope', label: '監査範囲', note: 'カード番号に触れる', audited: true },
  { id: 'vault', label: 'トークン保管庫', note: 'カード番号はここだけ', audited: true },
];
const systems = [ // zone = where it sits now; from = where it sat before tokenisation; cell = [col,row] in its zone
  { label: '会計システム', zone: 'corp', cell: [0, 0] },
  { label: '人事システム', zone: 'corp', cell: [0, 1] },
  { label: '社内メール', zone: 'corp', cell: [0, 2] },
  { label: '分析基盤', sub: 'トークンだけ受け取る', zone: 'corp', from: 'scope', cell: [1, 1] },
  { label: '顧客サポート', sub: '番号は下4桁のみ表示', zone: 'corp', from: 'scope', cell: [1, 2] },
  { label: 'POS端末', sub: '240台', zone: 'scope', cell: [1, 0] },
  { label: '店舗サーバ', sub: '38台', zone: 'scope', cell: [1, 1] },
  { label: '決済ゲートウェイ', zone: 'scope', cell: [1, 2] },
  { label: '不正検知', zone: 'scope', cell: [0, 3] },
  { label: '返金処理', zone: 'scope', cell: [1, 3] },
  { label: 'トークン変換', zone: 'vault', cell: [0, 0] },
  { label: '暗号鍵の管理', sub: 'HSM', zone: 'vault', cell: [0, 1] },
];
const audited = new Set(zones.filter(z => z.audited).map(z => z.id));
const inScopeNow = systems.filter(s => audited.has(s.zone)).length;
const inScopeBefore = systems.filter(s => audited.has(s.from ?? s.zone)).length;
const moved = systems.filter(s => s.from && audited.has(s.from) && !audited.has(s.zone));

export function figure(theme = 'css') {
  const t = makeTheme(theme), id = 'nested-boundary-fig', W = 1152, H = 444, size = 18, ctx = { t, size };
  // Zone rectangles, nested: corp is the whole figure; scope takes the right part; vault sits inside scope.
  const rect = { corp: { x: 1, y: 1, w: W - 2, h: H - 2 }, scope: { x: 446, y: 52, w: W - 446 - 22, h: H - 52 - 22 } };
  rect.vault = { x: 908, y: rect.scope.y + 62, w: rect.scope.x + rect.scope.w - 22 - 908, h: rect.scope.h - 84 };
  // Grid cells inside each zone's free area (the part not taken by an inner zone).
  const area = { corp: { x: 22, y: 70, w: 404, h: H - 92 }, scope: { x: rect.scope.x + 22, y: rect.scope.y + 52, w: rect.vault.x - rect.scope.x - 44, h: rect.scope.h - 68 }, vault: { x: rect.vault.x + 18, y: rect.vault.y + 66, w: rect.vault.w - 36, h: rect.vault.h - 82 } };
  const grid = { corp: [2, 3], scope: [2, 4], vault: [1, 2] };
  const cellBox = (zone, [c, r]) => {
    const a = area[zone], [nc, nr] = grid[zone], gx = 16, gy = 14, cw = (a.w - gx * (nc - 1)) / nc, ch = Math.min(66, (a.h - gy * (nr - 1)) / nr);
    return { x: a.x + c * (cw + gx), y: a.y + r * (ch + gy), w: cw, h: ch };
  };
  const parts = [];
  zones.forEach(z => {
    const b = rect[z.id], em = z.id === 'scope';
    parts.push(el('path', { d: roundRectPath(b.x, b.y, b.w, b.h, 16), fill: z.id === 'corp' ? t.c('surface') : t.c('paper'), stroke: em ? t.c('accent') : t.c('rule'), 'stroke-width': em ? 3 : 1.6 }));
    parts.push(textLines([z.label], { x: b.x + 20, y: b.y + 16, size: 19, valign: 'top', fill: em ? t.c('accent') : t.c('ink'), weight: 700 }));
    if (z.note) parts.push(textLines([z.note], { x: b.x + 20, y: b.y + 42, size: 15, valign: 'top', fill: t.c('muted') }));
  });
  // ghosts: where a moved system used to sit, and an arrow across the boundary to where it sits now
  const ghostCells = [[0, 1], [0, 2]];
  moved.forEach((s, i) => {
    const gb = cellBox(s.from, ghostCells[i]), nb = cellBox(s.zone, s.cell);
    parts.push(el('path', { d: roundRectPath(gb.x, gb.y, gb.w, gb.h, 10), fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.4, 'stroke-dasharray': '5 5' }));
    parts.push(textLines([`${s.label}（以前）`], { x: gb.x + gb.w / 2, y: gb.y + gb.h / 2, size: 16, anchor: 'middle', valign: 'middle', fill: t.c('muted') }));
    const y = Math.min(gb.y + gb.h / 2, nb.y + nb.h / 2);
    parts.push(el('path', { d: `M${gb.x - 4} ${gb.y + gb.h / 2}H${nb.x + nb.w + 6}`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.8, 'marker-end': `url(#${id}-arr)` }));
  });
  systems.forEach(s => {
    const b = cellBox(s.zone, s.cell);
    parts.push(drawNode({ ...measureNode({ label: s.label, sub: s.sub }, { size, maxWidth: b.w, minWidth: b.w }), ...b, fill: t.c('paper') }, ctx));
  });
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'カード情報の監査範囲：システムの所属と、トークン化による移動',
    desc: `入れ子の枠は所属を表す。社内ネットワークの中に監査範囲があり、その中にトークン保管庫がある。枠の内側にあるシステムだけが監査の対象。トークン化で${moved.map(s => s.label).join('と')}が監査範囲の外に移り、対象は${inScopeBefore}から${inScopeNow}システムに減った。点線の箱は移動前の位置、矢印は境界をまたいだ移動を示す。` },
  el('defs', {}, arrowMarker(`${id}-arr`, t.c('ink'), { size: 12 })), parts);
}

export default {
  study: true,
  id: 'nested-boundary',
  language: 'ja',
  title: 'Nested boundaries: membership and scope',
  className: 'st cs-risk-audit',
  notes: 'Purpose: Show membership and scope with nested boundaries, and make a change of membership visible as a crossing.\nModify: Edit `zones` (outer to inner, which ones are audited) and `systems` (zone, previous zone, grid cell). Boxes, ghosts, crossing arrows, the in-scope counts and the headline recompute.\nInvariant: Position inside a boundary means membership; moving a box across a boundary changes its meaning, so a move is drawn as ghost + arrow, never silently; inner zones lie wholly inside outer ones.\nStatic: Already static. For a build, show the old positions first, then the moves.',
  sources: [{ type: 'original-example', file: 'assets/svg/nested-boundary.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">トークン化で${moved.length}システムが<em>${zones.find(z => z.id === 'scope').label}</em>の外へ。<br><span class="st-quiet">監査の対象は${inScopeBefore}から${inScopeNow}システムに減った</span></h1>
<p class="st-dek">枠の内側にあることが、その範囲に属することを意味する。点線は移動前の位置。</p>
<figure class="st-fig" style="top:214px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 2026年度の監査範囲の見直し、台数は店舗網全体</span><span>入れ子の境界図</span></p>`,
};
