// Diagram study · Diverging bars — signed deviations from a stated reference (here a weighted company average).
// The reference, every bar, the headline gap and the rail shares are computed from `depts`.
import { divergingBarChart, fmt } from '../runtime/figure.mjs';

const depts = [ // エンゲージメント指数（0–100）と回答者数（架空のデータ）
  { label: '研究開発', score: 77, n: 420 },
  { label: '経営企画', score: 74, n: 60 },
  { label: '品質保証', score: 72, n: 150 },
  { label: '人事', score: 71, n: 45 },
  { label: 'マーケティング', score: 69, n: 90 },
  { label: '法人営業', score: 67, n: 380 },
  { label: '製造', score: 64, n: 960 },
  { label: '物流', score: 62, n: 310 },
  { label: 'カスタマーサポート', score: 60, n: 240 },
  { label: 'フィールドサービス', score: 54, n: 280 },
];
const people = depts.reduce((s, d) => s + d.n, 0);
const average = Math.round((depts.reduce((s, d) => s + d.score * d.n, 0) / people) * 10) / 10; // 回答者数で加重
const below = depts.filter(d => d.score < average);
const belowShare = below.reduce((s, d) => s + d.n, 0) / people;
const lowest = [...depts].sort((a, b) => a.score - b.score)[0];
const gap = Math.round((average - lowest.score) * 10) / 10;

export function figure(theme = 'css') {
  return divergingBarChart({
    id: 'diverging-bars-fig', theme, width: 800, height: 470, locale: 'ja', fontSize: 16,
    title: '部署別エンゲージメント指数と全社平均との差（ポイント）',
    desc: `全社平均${fmt(average, { digits: 1 })}に対し、${below.length}部署が平均を下回る。最も低い${lowest.label}は${fmt(gap, { digits: 1 })}ポイント低い。`,
    data: depts.map(d => ({ label: d.label, value: d.score })), reference: average,
    format: { digits: 1 }, posLabel: '全社平均より高い', negLabel: '全社平均より低い', rowHeight: 42,
  });
}

export default {
  study: true,
  id: 'diverging-bars',
  language: 'ja',
  title: 'Diverging bars: signed deviations from a reference',
  className: 'st st--left cs-hr-people',
  notes: 'Purpose: Compare signed deviations from one stated reference, so above and below read as direction, not just length.\nModify: Replace `depts` (score and headcount). The weighted average, every bar, the headline gap and the rail shares recompute; change the weighting if your reference is a simple mean or a target.\nInvariant: Bars start at the reference line, the reference value is printed, signs are written on every value, and positive and negative keep their own colors.\nStatic: Already static. For a build, reveal the below-average departments last.',
  sources: [{ type: 'original-example', file: 'assets/svg/diverging-bars.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="word-break:keep-all">${lowest.label}部のエンゲージメントは、<br>全社平均を${fmt(gap, { digits: 1, locale: 'ja' })}ポイント下回る</h1>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b>${fmt(average, { digits: 1, locale: 'ja' })}</b><span>全社平均（回答者数で加重）。<br>図の中央の線がこの値。</span></div>
  <hr class="st-rule">
  <div class="st-kpi"><b>${fmt(Math.round(belowShare * 100), { locale: 'ja' })}%</b><span>平均を下回る${below.length}部署に<br>属する回答者の割合。<br>人数の多い部署ほど平均を動かす。</span></div>
</div>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 従業員意識調査 2025年、回答者${fmt(people, { locale: 'ja' })}人</span><span>ダイバージング棒グラフ</span></p>`,
};
