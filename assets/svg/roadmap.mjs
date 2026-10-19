// Diagram study · Roadmap — stages in order, with honest timing: dates only where they exist.
// Stages are spaced evenly because the axis is order, not time. Each stage states what its
// timing rests on (done, estimate, unknown, or a duration after an earlier stage). The gate,
// the undated stages and the headline are computed from `stages`.
import { theme as makeTheme, svgRoot, el, g, textLines, wrapText, fmt } from '../runtime/figure.mjs';

const stages = [ // status: done | active | gate | next; \n marks a preferred line break (illustrative plan)
  { label: '構想・需要調査', status: 'done', when: '2023年度', basis: '完了' },
  { label: '基本計画と\n住民説明会', status: 'done', when: '2025年3月', basis: '完了' },
  { label: '環境影響評価', status: 'active', when: '2026年度後半', basis: '見込み・公告予定' },
  { label: '国の認可と\n財源確定', status: 'gate', when: '時期未定', basis: '国の予算措置しだい' },
  { label: '詳細設計', status: 'next', when: '約14か月', basis: '認可から' },
  { label: '工事', status: 'next', when: '約30か月', basis: '設計完了から' },
  { label: '開業', status: 'next', when: '日付なし', basis: '認可後に算定' },
];
const gateAt = stages.findIndex(s => s.status === 'gate');
const dated = stages.filter(s => s.status === 'done' || s.status === 'active');
const undated = stages.slice(gateAt + 1);
const estimates = dated.filter(s => s.status === 'active');

export function figure(theme = 'css') {
  const t = makeTheme(theme), id = 'roadmap-fig', W = 1152, H = 470, n = stages.length;
  const pad = 84, step = (W - 2 * pad) / (n - 1), x = i => pad + i * step, ty = 176;
  const now = stages.findIndex(s => s.status === 'active');
  const parts = [];
  // track: solid through work that has happened, dashed after it
  parts.push(el('line', { x1: x(0), x2: x(now), y1: ty, y2: ty, stroke: t.c('ink'), 'stroke-width': 3 }));
  parts.push(el('line', { x1: x(now), x2: x(n - 1), y1: ty, y2: ty, stroke: t.c('muted'), 'stroke-width': 2, 'stroke-dasharray': '2 7', 'stroke-linecap': 'round' }));
  stages.forEach((s, i) => {
    const cx = x(i), gate = s.status === 'gate';
    const ink = gate ? t.c('accent') : s.status === 'next' ? t.c('muted') : t.c('ink');
    // marker: done = filled, active = half, gate = diamond, next = open
    if (s.status === 'done') parts.push(el('circle', { cx, cy: ty, r: 11, fill: t.c('ink') }));
    else if (s.status === 'active') parts.push(el('circle', { cx, cy: ty, r: 10, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 2.5 }), el('path', { d: `M${cx} ${ty - 10}A10 10 0 0 1 ${cx} ${ty + 10}Z`, fill: t.c('ink') }));
    else if (gate) parts.push(el('path', { d: `M${cx} ${ty - 16}L${cx + 16} ${ty}L${cx} ${ty + 16}L${cx - 16} ${ty}Z`, fill: t.c('accent'), stroke: t.c('paper'), 'stroke-width': 3 }));
    else parts.push(el('circle', { cx, cy: ty, r: 10, fill: t.c('paper'), stroke: t.c('muted'), 'stroke-width': 2.2 }));
    // stage name above, timing and what it rests on below
    const name = wrapText(s.label, step - 8, 21, { weight: 700 });
    parts.push(textLines(name, { x: cx, y: ty - 36, size: 21, anchor: 'middle', valign: 'bottom', fill: gate ? t.c('accent') : t.c('ink'), weight: 700, lineHeight: 1.3 }));
    if (i === now) parts.push(textLines(['現在'], { x: cx, y: ty - 36 - name.length * 21 * 1.3 - 4, size: 16, anchor: 'middle', valign: 'bottom', fill: t.c('muted'), weight: 700 }));
    parts.push(textLines([s.when], { x: cx, y: ty + 38, size: 22, anchor: 'middle', valign: 'top', fill: ink, weight: s.status === 'next' ? 600 : 700, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
    parts.push(textLines(wrapText(s.basis, step - 12, 17), { x: cx, y: ty + 74, size: 17, anchor: 'middle', valign: 'top', fill: t.c('muted'), lineHeight: 1.3 }));
  });
  // bracket over everything that waits for the gate
  const bx0 = x(gateAt + 1) - step * 0.42, bx1 = x(n - 1) + step * 0.42, by = ty + 150;
  parts.push(el('path', { d: `M${bx0} ${by}v12H${bx1}v-12`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 1.8 }));
  parts.push(textLines([`この${undated.length}段階は、認可が出るまで日付を付けない`], { x: (bx0 + bx1) / 2, y: by + 28, size: 19, anchor: 'middle', valign: 'top', fill: t.c('accent'), weight: 700 }));
  parts.push(textLines(['所要期間は前の段階の完了から数える'], { x: (bx0 + bx1) / 2, y: by + 58, size: 17, anchor: 'middle', valign: 'top', fill: t.c('muted') }));
  return svgRoot({ id, width: W, height: H, theme: t,
    title: '路面電車延伸の段階：順序と、各段階の時期の根拠',
    desc: `${n}段階を左から順に等間隔で並べた。間隔は順序だけを表し、時間の長さではない。日付があるのは完了した${dated.length - estimates.length}段階と見込みの${estimates.length}段階だけ。「${stages[gateAt].label.replace('\n', '')}」は時期未定で、その後の${undated.length}段階は認可からの所要期間しか示せない。開業日は書かれていない。` },
  parts);
}

export default {
  study: true,
  id: 'roadmap',
  language: 'ja',
  title: 'Roadmap: stages in order without invented dates',
  className: 'st cs-wa-ai',
  notes: 'Purpose: Show the order of stages and, for each, what its timing actually rests on, without inventing dates.\nModify: Edit `stages` (status done/active/gate/next, `when`, `basis`). Markers, the solid/dashed track, the gate accent, the bracket over undated stages and the headline recompute.\nInvariant: Even spacing means order only; a stage gets a date only when one exists; estimates say so; stages after an undecided gate carry durations relative to an earlier stage or "日付なし".\nStatic: Already static. For a build, reveal completed stages, then the gate, then the undated stages.',
  sources: [{ type: 'original-example', file: 'assets/svg/roadmap.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">開業日は、<em>${stages[gateAt].label.replace('\n', '')}</em>まで書けない。<br><span class="st-quiet">${stages.length}段階のうち日付があるのは${dated.length}つ、うち${estimates.length}つは見込み</span></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空の計画 · 横の間隔は順序を表し、時間の長さではない</span><span>ロードマップ（段階図）</span></p>`,
};
