// Motion study · Let the evidence answer the question — the question is the headline and never
// moves. Build 0 shows only what will be compared; build 1 draws every team's change (pilot and
// comparison teams on one scale) with the group means; build 2 states the answer from those means.
import { svgRoot, el, g, linear, textLines, mean, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const teams = [ // 1人1か月あたりの病欠日数：試行前（2024年4〜9月）→ 試行中（2025年4〜9月）— illustrative
  { group: 'pilot', before: 0.95, during: 0.58 }, { group: 'pilot', before: 0.81, during: 0.62 }, { group: 'pilot', before: 1.10, during: 0.71 },
  { group: 'pilot', before: 0.88, during: 0.55 }, { group: 'pilot', before: 0.79, during: 0.66 }, { group: 'pilot', before: 1.02, during: 0.60 },
  { group: 'pilot', before: 0.86, during: 0.88 }, { group: 'pilot', before: 0.95, during: 0.57 },
  { group: 'comparison', before: 0.84, during: 0.80 }, { group: 'comparison', before: 0.92, during: 0.88 }, { group: 'comparison', before: 0.79, during: 0.83 },
  { group: 'comparison', before: 1.01, during: 0.93 }, { group: 'comparison', before: 0.88, during: 0.81 }, { group: 'comparison', before: 0.85, during: 0.86 },
  { group: 'comparison', before: 0.93, during: 0.84 }, { group: 'comparison', before: 0.82, during: 0.78 },
];
const groups = [{ key: 'pilot', label: '週休3日の試行チーム' }, { key: 'comparison', label: '比較チーム（通常勤務）' }].map(gr => {
  const list = teams.filter(tm => tm.group === gr.key);
  const b = mean(list.map(tm => tm.before)), d = mean(list.map(tm => tm.during));
  return { ...gr, list, b, d, change: Math.round((d / b - 1) * 100), fewer: list.filter(tm => tm.during < tm.before).length };
});
const [pilot, comp] = groups;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 800, H = 470, m = { l: 58, t: 66, b: 52 };
  const y = linear([0.4, 1.2], [H - m.b, m.t]);
  const pw = 270, gap = 110, px = [m.l + 30, m.l + 30 + pw + gap]; // panel left edges; the two times sit at each edge
  return svgRoot({ id: 'motion-deferred-evidence-fig', width: W, height: H, theme: t,
    title: '病欠日数（1人1か月あたり）の試行前後の変化：試行チームと比較チーム、各8チーム',
    desc: `試行チームの平均は${fmt(pilot.b, { digits: 2 })}日から${fmt(pilot.d, { digits: 2 })}日（${pilot.change}%）、比較チームは${fmt(comp.b, { digits: 2 })}日から${fmt(comp.d, { digits: 2 })}日（${comp.change}%）。試行チームは8チーム中${pilot.fewer}チームで減少。` },
  [0.4, 0.6, 0.8, 1.0, 1.2].map(v => g({},
    el('line', { x1: m.l, x2: W - 10, y1: y(v), y2: y(v), stroke: t.c('grid') }),
    textLines([fmt(v, { digits: 1 })], { x: m.l - 10, y: y(v), size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
  textLines(['日／人・月'], { x: m.l - 52, y: 8, size: 16, fill: t.c('muted'), valign: 'top' }),
  groups.map((gr, j) => g({},
    textLines([gr.label], { x: px[j] + pw / 2, y: 26, size: 18, weight: 700, anchor: 'middle', fill: t.c('ink') }),
    [['試行前', 0], ['試行中', pw]].map(([lab, dx]) => g({},
      el('line', { x1: px[j] + dx, x2: px[j] + dx, y1: m.t - 8, y2: H - m.b, stroke: t.c('rule') }),
      textLines([lab], { x: px[j] + dx, y: H - m.b + 12, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') }))),
    // build 1: every team, then the group mean
    gr.list.map((tm, k) => el('path', { d: `M${px[j]} ${y(tm.before)}L${px[j] + pw} ${y(tm.during)}`, fill: 'none', stroke: t.c('context'), 'stroke-width': 1.8,
      'data-step': 1, 'data-motion': 'draw', 'data-delay': j * 300 + k * 50, 'data-duration': 600 })),
    // the mean: drawn at build 1 (path), recoloured at build 2 (its group owns the stroke)
    g({ 'data-states': { 0: { stroke: t.c('ink') }, 2: { stroke: j ? t.c('ink') : t.c('accent') } }, 'data-duration': 500 },
      el('path', { d: `M${px[j]} ${y(gr.b)}L${px[j] + pw} ${y(gr.d)}`, fill: 'none', 'stroke-width': 4.5, 'stroke-linecap': 'round',
        'data-step': 1, 'data-motion': 'draw', 'data-delay': 900 + j * 150, 'data-duration': 700 })),
    [[gr.b, 0, 'end'], [gr.d, pw, 'start']].map(([v, dx, anchor]) => textLines([fmt(v, { digits: 2 })], { x: px[j] + dx + (anchor === 'end' ? -10 : 10), y: y(v), size: 18, weight: 700, anchor, valign: 'middle',
      fill: t.c('ink'), halo: t.c('paper'), attrs: { 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 1400 } })))));
}

export default {
  study: true,
  id: 'motion-deferred-evidence',
  language: 'ja',
  title: 'Deferred evidence: the question stays, the evidence answers',
  className: 'st st--rail cs-hr-people',
  notes: 'Purpose: Pose the question in the headline and keep it fixed while the evidence enters underneath; state the answer only after the evidence is on screen.\nModify: Replace `teams` (group, before, during); the group means, percentage changes, the count of teams that improved and the answer recompute.\nInvariant: The question never moves or changes; build 0 names what will be compared and on which scale; every team is drawn before the means; the answer quotes numbers computed from the drawn data and names the comparison group.\nStatic: The final build shows all teams, both means, the highlighted pilot mean and the answer.',
  sources: [{ type: 'original-example', file: 'assets/motion/motion-deferred-evidence.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="word-break:auto-phrase">週休3日制を試した${pilot.list.length}チームで、病欠は本当に減ったのか？</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support" style="word-break:auto-phrase">
  <p class="st-text st-muted">試行した${pilot.list.length}チームと、業務の近い${comp.list.length}チームの病欠日数を、試行前（2024年4〜9月）と試行中（2025年4〜9月）で比べた。</p>
  <hr class="st-rule" data-step="2" data-motion="reveal">
  <div class="st-kpi" data-step="2" data-motion="reveal" data-delay="200"><b class="st-accent">${fmt(pilot.change, { sign: true })}%</b><span>試行チームの病欠日数。比較チームは${fmt(comp.change, { sign: true })}%。</span></div>
  <div class="st-kpi" data-step="2" data-motion="reveal" data-delay="500"><b>${pilot.fewer}<small style="font-size:.42em;font-weight:600;margin-left:.1em">/ ${pilot.list.length}チーム</small></b><span>試行チームのうち、病欠が減ったチーム。</span></div>
</div>
<p class="st-source" data-region="source"><span>架空のデータ · 架空の企業の勤怠記録、各8チーム</span><span>モーション · 問いを残したまま証拠を重ねる（2ビルド）</span></p>`,
};
