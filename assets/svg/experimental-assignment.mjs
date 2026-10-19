// Diagram study · Experimental assignment — eligibility, assignment, intervention and measurement on one
// true time axis, with the assignment step opened up to show the actual allocation list.
// The list is generated from `strata` with permuted blocks (seeded), so arm sizes are computed, not typed.
import { svgRoot, el, g, textLines, linear, rng, theme as makeTheme, fmt, sum } from '../runtime/figure.mjs';

// 時間は「介入開始週＝第1週」を基準にした週（架空のクラスター無作為化試験）
const stages = [
  { key: 'elig', label: '適格性の確認', sub: '61校に打診し、48校が参加', from: -10, to: -4 },
  { key: 'assign', label: '割付', sub: '層別ブロック法', at: -3 },
  { key: 'treat', label: '介入（12週）', sub: '補習群は週2回、対照群は通常活動', from: 1, to: 12 },
  { key: 'measure', label: '測定', sub: '採点者に割付を伏せた読解テスト', at: 14 },
];
const strata = [ { name: '北地区', schools: 16, seed: 11 }, { name: '中央地区', schools: 20, seed: 23 }, { name: '南地区', schools: 12, seed: 37 } ];
const block = ['補習', '補習', '対照', '対照'];   // one permuted block = 4 schools, 2 per arm
const concealment = '乱数列は外部の統計担当者が作成し、48校の登録が終わってから開示';

// Permuted-block allocation per stratum: shuffle each block of 4 with a seeded generator.
const lists = strata.map(s => {
  if (s.schools % block.length) throw Error(`experimental-assignment: ${s.name} must be a multiple of ${block.length}`);
  const r = rng(s.seed), seq = [];
  for (let b = 0; b < s.schools / block.length; b++) {
    const blk = [...block];
    for (let i = blk.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [blk[i], blk[j]] = [blk[j], blk[i]]; }
    seq.push(blk);
  }
  return { ...s, blocks: seq, treat: seq.flat().filter(a => a === '補習').length };
});
const total = sum(strata.map(s => s.schools)), treated = sum(lists.map(l => l.treat)), control = total - treated;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'experimental-assignment-fig';
  const x = linear([-11, 15], [14, W - 14]), axisY = 92;
  const isAssign = s => s.key === 'assign';

  // Timeline: stages placed by real week, the assignment step in the accent.
  const timeline = g({},
    el('line', { x1: x(-11), x2: x(15), y1: axisY, y2: axisY, stroke: t.c('rule'), 'stroke-width': 1.5 }),
    [-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10, 12, 14].map(w => g({},
      el('line', { x1: x(w), x2: x(w), y1: axisY, y2: axisY + 5, stroke: t.c('rule') }),
      textLines([fmt(w, { locale: 'ja' })], { x: x(w), y: axisY + 11, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') }))),
    textLines(['週'], { x: x(15), y: axisY + 11, size: 15, anchor: 'end', valign: 'top', fill: t.c('muted') }),
    stages.map(s => {
      const hl = isAssign(s), x0 = x(s.from ?? s.at), anchor = s.key === 'measure' ? 'end' : 'start', lx = s.key === 'measure' ? x(s.at) + 6 : x0 - (s.at != null ? 6 : 0);
      const mark = s.at != null
        ? el('path', { d: `M${x(s.at)} ${axisY - 9}l9 9l-9 9l-9 -9z`, fill: hl ? t.c('accent') : t.c('ink') })
        : el('rect', { x: x(s.from), y: axisY - 6, width: x(s.to) - x(s.from), height: 12, rx: 6, fill: s.key === 'treat' ? t.c('ink') : t.c('context') });
      return g({}, mark,
        textLines([s.label], { x: lx, y: 6, size: 19, anchor, valign: 'top', weight: 700, fill: hl ? t.c('accent') : t.c('ink') }),
        textLines([s.sub], { x: lx, y: 36, size: 16, anchor, valign: 'top', fill: t.c('muted') }));
    }));

  // The opened assignment step: one row per stratum, squares in permuted blocks, in enrolment order.
  const panel = { x: 120, y: 160, w: 912, h: 304 }, sq = 24, gap = 4, bgap = 16, rowY0 = panel.y + 118, pitch = 56, sx0 = panel.x + 132;
  const ax = x(-3);
  const rows = lists.map((l, k) => {
    const y = rowY0 + k * pitch;
    let cx = sx0;
    const marks = l.blocks.map(blk => {
      const out = blk.map((arm, i) => el('rect', { x: cx + i * (sq + gap), y: y - sq / 2, width: sq, height: sq, rx: 3, fill: arm === '補習' ? t.c('ink') : t.c('paper'), stroke: t.c('ink'), 'stroke-width': 1.5 }));
      cx += blk.length * (sq + gap) - gap + bgap;
      return g({}, out);
    });
    return g({},
      textLines([l.name], { x: panel.x + 24, y: y - 9, size: 17, valign: 'middle', weight: 700, fill: t.c('ink') }),
      textLines([`${l.schools}校`], { x: panel.x + 24, y: y + 12, size: 15, valign: 'middle', fill: t.c('muted') }),
      marks,
      textLines([`補習${l.treat}校、対照${l.schools - l.treat}校`], { x: cx + 12, y, size: 16, valign: 'middle', fill: t.c('ink'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  });
  const legendY = panel.y + panel.h - 26;
  const zoom = g({},
    // zoom lines tie the panel to the one point on the timeline it opens up
    el('path', { d: `M${ax} ${axisY + 30}L${panel.x + 1} ${panel.y}M${ax} ${axisY + 30}L${panel.x + panel.w - 1} ${panel.y}`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 1.2, 'stroke-dasharray': '4 4' }),
    el('line', { x1: ax, x2: ax, y1: axisY + 10, y2: axisY + 30, stroke: t.c('accent'), 'stroke-width': 1.2 }),
    el('rect', { x: panel.x, y: panel.y, width: panel.w, height: panel.h, rx: 10, fill: t.c('surface'), stroke: t.c('accent'), 'stroke-width': 1.5 }),
    textLines([`割付：地区で層別した置換ブロック法（1ブロック${block.length}校）`], { x: panel.x + 24, y: panel.y + 22, size: 19, valign: 'top', weight: 700, fill: t.c('ink') }),
    textLines([concealment], { x: panel.x + 24, y: panel.y + 52, size: 16, valign: 'top', fill: t.c('muted') }),
    textLines(['登録順 →'], { x: sx0, y: rowY0 - 34, size: 15, valign: 'middle', fill: t.c('muted') }),
    rows,
    el('rect', { x: sx0, y: legendY - 8, width: 16, height: 16, rx: 2, fill: t.c('ink') }),
    textLines([`補習群 ${treated}校`], { x: sx0 + 24, y: legendY, size: 16, valign: 'middle', fill: t.c('ink') }),
    el('rect', { x: sx0 + 150, y: legendY - 8, width: 16, height: 16, rx: 2, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 1.5 }),
    textLines([`対照群 ${control}校（翌年度に補習を提供）`], { x: sx0 + 174, y: legendY, size: 16, valign: 'middle', fill: t.c('ink') }));

  return svgRoot({ id, width: W, height: H, theme: t,
    title: '割付を独立した手順として示すタイムラインと割付リスト',
    desc: `適格性の確認（第${stages[0].from}〜${stages[0].to}週）、割付（第${stages[1].at}週）、介入（第${stages[2].from}〜${stages[2].to}週）、測定（第${stages[3].at}週）を実際の週で並べた。割付は地区で層別した置換ブロック法で、${strata.map(s => `${s.name}${s.schools}校`).join('、')}をそれぞれ半数ずつに分け、合計${total}校を補習群${treated}校と対照群${control}校にした。${concealment}。` },
  timeline, zoom);
}

export default {
  study: true,
  id: 'experimental-assignment',
  language: 'ja',
  title: 'Experimental assignment: a distinct, named step',
  className: 'st cs-journal-serif',
  notes: 'Purpose: Separate eligibility, assignment, intervention and measurement, and open the assignment step to show the actual mechanism instead of an arrow labelled "randomized".\nModify: Edit `stages` (weeks are real), `strata` (school counts must be multiples of the block size) and `block`. The permuted-block list, the per-arm counts and the headline totals recompute; change a seed to draw a new list.\nInvariant: Stages sit on a true time axis; assignment happens after eligibility and before the intervention; the mechanism and its concealment are named in words; arm sizes are counted from the list.\nStatic: Already static. For a talk, show the timeline first, then open the assignment panel.',
  sources: [{ type: 'original-example', file: 'assets/svg/experimental-assignment.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head"><em>割付</em>は独立した手順。<br>地区ごとの置換ブロックで、${total}校を${treated === control ? `${treated}校ずつに` : `補習${treated}校と対照${control}校に`}分けた</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 公立小学校のクラスター無作為化試験、読解補習プログラム</span><span>手順のタイムラインと割付リスト</span></p>`,
};
