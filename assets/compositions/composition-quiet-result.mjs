// Composition study · Quiet result — a null result stated as an actual claim: one sentence, one
// line of numbers, and one interval drawn against the effect that would have mattered. Most of
// the page stays empty on purpose. The difference and its interval are computed from `arms`.
import { svgRoot, el, textLines, linear, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const ID = 'composition-quiet-result';
// 市の大腸がん検診。前年度に未受診だった50〜69歳を無作為に2群に分け、片方にだけ受診勧奨はがきを送った。
// 送付後6か月以内の受診者数（架空のデータ）
const arms = {
  postcard: { n: 6000, screened: 888 },
  none: { n: 6000, screened: 870 },
};
const worthIt = 2.0; // ポイント：はがきの費用に見合う最小の効果。試験の前に決めた値

// derived values: difference in uptake (percentage points) with a 95% interval
const rate = a => a.screened / a.n;
const p1 = rate(arms.postcard), p0 = rate(arms.none);
const diff = (p1 - p0) * 100;
const half = 1.96 * Math.sqrt((p1 * (1 - p1)) / arms.postcard.n + (p0 * (1 - p0)) / arms.none.n) * 100;
const [lo, hi] = [diff - half, diff + half];
const ruledOut = hi < worthIt;
const pt = v => fmt(v, { digits: 1, sign: true, locale: 'ja' });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 960, H = 172;
  const x = linear([-2, 3], [20, W - 20]), axisY = 104;
  const parts = [];
  // the scale: percentage points, with the null line in ink
  parts.push(el('line', { x1: x(-2), x2: x(3), y1: axisY, y2: axisY, stroke: t.c('rule'), 'stroke-width': 1.2 }));
  for (const v of [-2, -1, 0, 1, 2, 3]) {
    parts.push(el('line', { x1: x(v), x2: x(v), y1: axisY, y2: axisY + 6, stroke: t.c('muted') }));
    parts.push(textLines([v === 0 ? '0' : fmt(v, { sign: true })], { x: x(v), y: axisY + 14, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  }
  parts.push(textLines(['受診率の差（はがきあり − なし）、ポイント'], { x: x(-2), y: axisY + 44, size: 16, valign: 'top', fill: t.c('muted') }));
  parts.push(el('line', { x1: x(0), x2: x(0), y1: 30, y2: axisY, stroke: t.c('ink'), 'stroke-width': 1.4 }));
  // the effect that would have paid for the postcards
  parts.push(el('line', { x1: x(worthIt), x2: x(worthIt), y1: 10, y2: axisY, stroke: t.c('ink'), 'stroke-width': 1.4, 'stroke-dasharray': '5 5' }));
  parts.push(textLines([`費用に見合う効果 ${pt(worthIt)}`], { x: x(worthIt) + 12, y: 22, size: 17, valign: 'middle', fill: t.c('ink'), weight: 700 }));
  parts.push(textLines(['試験の前に設定'], { x: x(worthIt) + 12, y: 46, size: 16, valign: 'middle', fill: t.c('muted') }));
  // the result: estimate and 95% interval
  const by = 70;
  parts.push(el('line', { x1: x(lo), x2: x(hi), y1: by, y2: by, stroke: t.c('accent'), 'stroke-width': 6, 'stroke-linecap': 'round' }));
  parts.push(el('circle', { cx: x(diff), cy: by, r: 9, fill: t.c('accent'), stroke: t.c('paper'), 'stroke-width': 3 }));
  parts.push(textLines([`${pt(lo)}`], { x: x(lo), y: by - 16, size: 16, anchor: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  parts.push(textLines([`${pt(hi)}`], { x: x(hi), y: by - 16, size: 16, anchor: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  parts.push(textLines([`${pt(diff)}`], { x: x(diff), y: by - 18, size: 20, anchor: 'middle', fill: t.c('accent'), weight: 700, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  return svgRoot({ id: `${ID}-fig`, width: W, height: H, theme: t,
    title: '受診率の差（はがきあり−なし）と95%信頼区間、費用に見合う効果との比較',
    desc: `差は${pt(diff)}ポイント、95%信頼区間は${pt(lo)}〜${pt(hi)}ポイント。費用に見合う${pt(worthIt)}ポイントは区間の${ruledOut ? '外にある' : '内にある'}。` },
  parts);
}

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Quiet result: one sentence and one interval that states what is ruled out',
  className: 'st cs-clinical-trial cmp-quiet',
  notes: 'Purpose: Use for a null or small result that should change a decision. The page says plainly what did not happen, gives the difference with its interval in one line, and draws that interval against the effect that would have mattered, so "no difference" becomes the actual claim "the effect we needed is ruled out".\nModify: Replace `arms` and `worthIt` (the smallest effect worth acting on, fixed before the study); the difference, the interval, the sentence and the mark recompute. If the interval still contains `worthIt`, the honest headline is "too early to tell", not "no effect".\nInvariant: One statement, one line of numbers, one drawn interval; more than half of the page stays empty; the null line is ink, the decision threshold is labelled with where it came from, the interval is the only accent.\nStatic: Already static.',
  sources: [{ type: 'original-example', file: `assets/compositions/${ID}.mjs` }],
  exportPolicy: 'final',
  content: `<h1 class="cmp-qr-head" data-region="title"><span>はがきで受診を勧めても、</span><br><span>検診の受診率は上がらなかった</span></h1>
<p class="cmp-qr-lead" data-region="support">受診率の差は<span class="cmp-qr-nb">${pt(diff)}ポイント</span>（95％信頼区間 <span class="cmp-qr-nb">${pt(lo)}〜${pt(hi)}</span>）。<br>${ruledOut ? `費用に見合う<span class="cmp-qr-nb">${pt(worthIt)}ポイント</span>の効果は、この区間の外にある。` : `費用に見合う<span class="cmp-qr-nb">${pt(worthIt)}ポイント</span>の効果は、まだ否定できない。`}</p>
<figure class="cmp-qr-fig" data-region="primary" data-space-intent="quiet statement page">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 50〜69歳の未受診者${fmt(arms.postcard.n + arms.none.n)}人を無作為に2群に分け、送付後6か月の受診を集計</span><span>静かな結果 · 区間と判断の基準</span></p>`,
};
