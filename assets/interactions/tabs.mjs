// Interaction study · Sections on demand — one research summary page whose background, method, result and
// limits open on request (Japanese page). Every number in the text and the figures is computed from `study` below.
import { forestPlot } from '../runtime/figure.mjs';
const study = {
  period: '2025年4月〜2026年3月', minutes: 10, grade: '4年生',
  schools: { reading: 6, comparison: 6 },
  pupils: { reading: 384, comparison: 371 },
  gain: { reading: { mean: 9.8, sd: 7.1 }, comparison: { mean: 6.6, sd: 7.4 } },   // 語彙テスト（100点満点）の1年間の伸び
  icc: 0.05,                                                                       // 学校内のまとまり（級内相関）の仮定
};
const g = study.gain, n = study.pupils;
const diff = g.reading.mean - g.comparison.mean;
const se = Math.sqrt(g.reading.sd ** 2 / n.reading + g.comparison.sd ** 2 / n.comparison);
const ci = [diff - 1.96 * se, diff + 1.96 * se];
// Pupils were grouped in schools; a design effect widens the interval (average cluster size m).
const m = (n.reading + n.comparison) / (study.schools.reading + study.schools.comparison), deff = 1 + (m - 1) * study.icc;
const ciSchool = [diff - 1.96 * se * Math.sqrt(deff), diff + 1.96 * se * Math.sqrt(deff)];
const p1 = v => v.toFixed(1), total = n.reading + n.comparison, schools = study.schools.reading + study.schools.comparison;
const range = ([a, b]) => `${p1(a)}〜${p1(b)}点`;
// Each group's mean gain with its 95% interval (pupil level), for the result figure.
const groupCI = k => { const h = 1.96 * g[k].sd / Math.sqrt(n[k]); return [g[k].mean - h, g[k].mean + h]; };
const ciText = r => `${p1(r.estimate)}点  [${p1(r.low)}, ${p1(r.high)}]`;
const FIG = { width: 816, size: 17, labelSize: 18, columnText: ciText };
const resultFigure = forestPlot({ ...FIG, id: 'interaction-tabs-result', height: 196, rowHeight: 40,
  title: '1年間の語彙の伸び（平均と95%信頼区間）', desc: `朝読書の学校${p1(g.reading.mean)}点、比べた学校${p1(g.comparison.mean)}点`,
  rows: [
    { label: `朝読書の${study.schools.reading}校（${n.reading}人）`, estimate: g.reading.mean, low: groupCI('reading')[0], high: groupCI('reading')[1] },
    { label: `比べた${study.schools.comparison}校（${n.comparison}人）`, estimate: g.comparison.mean, low: groupCI('comparison')[0], high: groupCI('comparison')[1] },
  ],
  highlight: `朝読書の${study.schools.reading}校（${n.reading}人）`, marker: 'circle', domain: [0, 12], xTickValues: [0, 2, 4, 6, 8, 10, 12],
  columnTitle: '平均の伸び［95%区間］', xLabel: '語彙テスト（100点満点）の1年間の伸び（点）' });
// The same difference with the interval at pupil level and with the school clustering, for the limits figure.
const limitsFigure = forestPlot({ ...FIG, id: 'interaction-tabs-limits', height: 176, rowHeight: 40,
  title: '伸びの差の95%区間：児童単位と学校単位', desc: `児童単位${range(ci)}、学校単位${range(ciSchool)}`,
  rows: [
    { label: '児童ごとに独立と見なす', estimate: diff, low: ci[0], high: ci[1] },
    { label: `学校のまとまりを考える（級内相関${study.icc}）`, estimate: diff, low: ciSchool[0], high: ciSchool[1] },
  ],
  highlight: `学校のまとまりを考える（級内相関${study.icc}）`, marker: 'circle', reference: 0, domain: [0, 6], xTickValues: [0, 1, 2, 3, 4, 5, 6],
  columnTitle: '伸びの差［95%区間］', xLabel: '朝読書の学校と比べた学校の伸びの差（点）' });

const sections = [
  { id: 'background', name: '背景', title: '語彙の差は4年生で開き始める',
    body: [`市内${schools}校のうち${study.schools.reading}校が、${study.period}に朝の${study.minutes}分読書を始めた。始めなかった${study.schools.comparison}校と、${study.grade}の1年間の語彙の伸びを比べた。`],
    facts: [{ value: `${schools}校`, label: '比べた小学校' }], status: '背景：始めた学校と始めなかった学校を比べた。' },
  { id: 'method', name: '方法', title: '同じテストを4月と3月に受けた',
    body: [`${study.grade}${total}人が、4月と翌3月に同じ形式の語彙テスト（100点満点）を受けた。朝読書の${study.schools.reading}校（${n.reading}人）と、比べる${study.schools.comparison}校（${n.comparison}人）で、伸びの平均を比べた。`, '朝読書を始めるかどうかは学校が決め、無作為には割り付けていない。'],
    facts: [{ value: `${total}人`, label: `${study.grade}、2校群の合計` }], status: `方法：${total}人の伸びを2群で比べた。` },
  { id: 'result', name: '結果', title: `伸びの差は${p1(diff)}点`,
    body: [`朝読書の学校は平均${p1(g.reading.mean)}点、比べた学校は${p1(g.comparison.mean)}点伸びた。差は${p1(diff)}点で、95%信頼区間は${range(ci)}。`],
    facts: [{ value: `+${p1(diff)}点`, label: '1年間の伸びの差' }], figure: resultFigure, status: `結果：差は${p1(diff)}点（${range(ci)}）。` },
  { id: 'limits', name: '限界', title: '因果とまでは言えない',
    body: ['学校が自分で朝読書を選んだので、熱心な学校ほど始めた可能性がある。', `学校のまとまりを考えると、区間は${range(ciSchool)}に広がる。テストは1種類で、読解力は測っていない。`],
    facts: [{ value: range(ciSchool), label: '学校単位で見た95%区間' }], figure: limitsFigure, status: `限界：学校単位で見ると区間は${range(ciSchool)}。` },
];
const ID = 'interaction-tabs';

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Sections on demand: a research summary opened section by section',
  notes: `Purpose: 研究の要約を1ページに収め、背景・方法・結果・限界を発表者が質問に応じて開く。結論（見出し）は常に見えたまま、詳しさだけを選べるようにする。
Modify: \`study\` の数値を差し替えると、本文中の差・信頼区間・学校単位の区間・人数がすべて再計算される。節を増やすときは \`sections\` に {id, name, title, body, facts, status} を加える。
Invariant: 見出しは結論、節は根拠。限界の節を隠したまま結論だけを言わない（書き出しでは結果の節を表示し、限界はノートで補う）。数字はすべて \`study\` から計算する。
Static: 書き出しは「結果」の節を表示する。配布資料では4節を順に並べたページを別に用意する。`,
  sources: [{ type: 'original-example', file: 'assets/interactions/tabs.mjs' }],
  exportPolicy: 'final',
  className: 'st cs-journal-serif',
  content: `<h1 class="st-head">朝の${study.minutes}分読書を1年続けた学校の${study.grade}は、語彙テストの伸びが${p1(diff)}点大きかった</h1>
<p class="st-dek">市内${schools}校の比較研究（架空）、${study.period}。語彙テストは100点満点。</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>架空のデータ · 区間は正規近似、学校単位の区間は設計効果 ${deff.toFixed(1)} で補正</span><span>操作 · 節を選んで読む</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'tabs',
    initial: { tab: 'result' },
    data: { sections },
    controls: { tab: { label: '節を選ぶ' } },
    text: { reset: '元に戻す' },
  }],
};
