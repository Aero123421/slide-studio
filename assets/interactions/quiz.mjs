// Interaction study · Knowledge check — stopping distance at 60 km/h in a company driving course (Japanese page).
// Every option, every feedback sentence and the explanation figure are computed from the physics below;
// last year's answers (fictional) give the headline its finding.
import { el, textLines, linear, theme, svgRoot } from '../runtime/figure.mjs';

const speed = 60;          // km/h
const reaction = 1.0;      // s, from noticing the hazard to the brakes acting
const decel = 5.1;         // m/s², dry asphalt (≈ 0.52 g)
const v = speed / 3.6;
const thinking = v * reaction, braking = (v * v) / (2 * decel), total = thinking + braking;
const m0 = x => x.toFixed(0), m1 = x => x.toFixed(1);
const options = [          // the three wrong answers are the common mistakes, computed from the same numbers
  { id: 'reaction', label: `約${m0(thinking)} m`, feedback: `${m0(thinking)} mは空走距離だけ。ブレーキが効いてから止まるまでの${m0(braking)} mが抜けている。` },
  { id: 'braking', label: `約${m0(braking)} m`, feedback: `${m0(braking)} mは制動距離だけ。気づいてからブレーキが効くまでの${reaction.toFixed(1)}秒にも${m0(thinking)} m進む。` },
  { id: 'total', label: `約${m0(total)} m`, feedback: `空走距離${m1(thinking)} mと制動距離${m1(braking)} mを合わせて${m1(total)} m。` },
  { id: 'speed', label: `約${speed} m`, feedback: `時速の数字をそのままmにした答え。実際の停止距離は約${m0(total)} m。` },
];
const lastYear = { reaction: 21, braking: 64, total: 41, speed: 22 };      // 2025年度の研修、回答者数（架空）
const answered = Object.values(lastYear).reduce((a, b) => a + b, 0);
for (const o of options) o.share = Math.round((100 * lastYear[o.id]) / answered);

// Explanation figure: the stopping distance split into its two parts, to scale.
function figure() {
  const t = theme('css'), W = 640, H = 104, x = linear([0, 50], [0, W - 40]), y0 = 34, h = 30;
  return svgRoot({ id: 'interaction-quiz-fig', width: W, height: H, title: `停止距離${m1(total)} mの内訳`, desc: `空走距離${m1(thinking)} m、制動距離${m1(braking)} m` },
    el('rect', { x: x(0), y: y0, width: x(thinking) - x(0), height: h, fill: t.c('context') }),
    el('rect', { x: x(thinking), y: y0, width: x(total) - x(thinking), height: h, fill: t.c('accent') }),
    textLines([`空走 ${m1(thinking)} m`], { x: x(0) + 10, y: y0 + h / 2, size: 16, valign: 'middle', fill: t.c('ink'), weight: 650 }),
    textLines([`制動 ${m1(braking)} m`], { x: x(thinking) + 10, y: y0 + h / 2, size: 16, valign: 'middle', fill: t.c('onAccent'), weight: 650 }),
    textLines([`止まるまで ${m1(total)} m`], { x: x(total), y: y0 - 8, size: 16, anchor: 'end', valign: 'bottom', fill: t.c('ink'), weight: 650 }),
    el('line', { x1: x(0), x2: x(50), y1: y0 + h + 6, y2: y0 + h + 6, stroke: t.c('rule') }),
    [0, 10, 20, 30, 40, 50].map(m => textLines([`${m} m`], { x: x(m), y: y0 + h + 12, size: 16, anchor: m ? 'middle' : 'start', valign: 'top', fill: t.c('muted') })));
}
const ID = 'interaction-quiz';

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Knowledge check: stopping distance at 60 km/h',
  notes: `Purpose: 研修の受講者に自分の感覚で答えてもらい、答え合わせの瞬間に「空走距離＋制動距離」の内訳と、去年の受講者の回答分布を見せる。回答は端末の外に出ない。
Modify: \`speed\`・\`reaction\`・\`decel\` を変えると、選択肢・解説・図・見出しがすべて再計算される。\`lastYear\` を実際の集計に差し替える。
Invariant: 誤答の選択肢は、よくある間違い（空走だけ、制動だけ、時速の数字）を同じ数値から計算したもの。正誤は色だけでなく「正解」「あなたの答え」の文字で示す。
Static: 書き出しでは解説と内訳の図、去年の回答の割合を表示する（配布資料では答えが見えてよい前提）。`,
  sources: [{ type: 'original-example', file: 'assets/interactions/quiz.mjs' }],
  exportPolicy: 'final',
  className: 'st cs-classroom-bright',
  content: `<h1 class="st-head">時速${speed} kmで止まるまでの距離。去年の研修で正しく答えたのは${answered}人中${lastYear.total}人だけ</h1>
<p class="st-dek">社用車ドライバー安全研修（架空）。反応時間${reaction.toFixed(1)}秒、乾いた舗装路を想定。</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>架空のデータ · 停止距離＝速度×反応時間＋速度²÷（2×減速度）</span><span>操作 · 理解度チェック</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'quiz',
    initial: { choice: 'none', checked: false },
    data: {
      question: `乾いた道路を時速${speed} kmで走っていて危険に気づいた。止まるまでに車はおよそ何m進む？`,
      options, answer: 'total',
      explanation: `気づいてからブレーキが効くまでの${reaction.toFixed(1)}秒で${m1(thinking)} m（空走距離）、効いてから止まるまでに${m1(braking)} m（制動距離）。`,
      figure: figure(),
    },
    controls: { choice: { label: '答えを選ぶ', summary: false } },
    text: {
      check: '答え合わせ', reset: '元に戻す', prompt: '回答はこの端末の外に送られない。',
      none: 'まず答えを一つ選ぶ。', correctPrefix: '正解。', wrongPrefix: '不正解。',
      answerMark: '正解', yourMark: 'あなたの答え', share: `去年 {v}%`, statusExport: '正解は{answer}。{feedback}',
    },
  }],
};
