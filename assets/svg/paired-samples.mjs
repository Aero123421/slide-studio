// Diagram study · Paired samples — one line per child joins the same child's two measurements.
// Lines, end labels, the mean paired change and its interval, and the headline counts all come
// from `pupils`; a line is drawn only between two values that belong to the same child.
import { svgRoot, el, g, textLines, linear, spreadLabels, theme as makeTheme, fmt, mean, sd, tQuantile } from '../runtime/figure.mjs';

// 1分間に音読できた文字数（同じ文章の難易度をそろえた課題）。books = 夏休み中の図書館の貸出冊数（架空）
const pupils = [
  { id: '01', jul: 248, sep: 271, books: 6 }, { id: '02', jul: 312, sep: 338, books: 9 }, { id: '03', jul: 205, sep: 236, books: 4 },
  { id: '04', jul: 287, sep: 279, books: 0 }, { id: '05', jul: 226, sep: 259, books: 7 }, { id: '06', jul: 341, sep: 362, books: 5 },
  { id: '07', jul: 264, sep: 290, books: 3 }, { id: '08', jul: 198, sep: 221, books: 5 }, { id: '09', jul: 301, sep: 296, books: 0 },
  { id: '10', jul: 233, sep: 268, books: 8 }, { id: '11', jul: 276, sep: 297, books: 2 }, { id: '12', jul: 219, sep: 214, books: 0 },
  { id: '13', jul: 328, sep: 351, books: 6 }, { id: '14', jul: 252, sep: 283, books: 10 }, { id: '15', jul: 240, sep: 262, books: 3 },
  { id: '16', jul: 295, sep: 324, books: 7 }, { id: '17', jul: 211, sep: 238, books: 4 }, { id: '18', jul: 270, sep: 301, books: 5 },
];

// Derived: within-child change, its mean and t-interval; who slowed down.
const change = pupils.map(p => p.sep - p.jul);
const meanChange = mean(change), half = tQuantile(0.975, change.length - 1) * sd(change) / Math.sqrt(change.length);
const slower = pupils.filter(p => p.sep < p.jul), faster = pupils.filter(p => p.sep > p.jul);
const slowerNoBooks = slower.every(p => p.books === 0);
const signed = v => fmt(v, { digits: 0, sign: true, locale: 'ja' });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 800, H = 474, id = 'paired-samples-fig';
  const top = 70, bottom = H - 12, xa = 176, xb = 624;
  const all = pupils.flatMap(p => [p.jul, p.sep]);
  const y = linear([Math.min(...all) - 4, Math.max(...all) + 4], [bottom, top]);
  const isSlow = p => p.sep < p.jul;
  const lh = 19.5, lead = 30;  // label pitch and the width of the leader zone between rail and labels
  const L = spreadLabels(pupils.map((p, i) => ({ id: i, y: y(p.jul), h: lh })), { min: top - 4, max: bottom + 4, gap: 0 });
  const R = spreadLabels(pupils.map((p, i) => ({ id: i, y: y(p.sep), h: lh })), { min: top - 4, max: bottom + 4, gap: 0 });
  const order = pupils.map((p, i) => ({ p, i })).sort((a, b) => Number(isSlow(a.p)) - Number(isSlow(b.p)));  // accent lines on top
  // End label: leader from the point into the label column, then value and child ID.
  const label = (p, i, side) => {
    const slow = isSlow(p), s = side === 'L' ? -1 : 1, ly = (side === 'L' ? L : R)[i].y, py = y(side === 'L' ? p.jul : p.sep);
    const x0 = (side === 'L' ? xa : xb) + s * 7, x1 = (side === 'L' ? xa : xb) + s * lead, anchor = side === 'L' ? 'end' : 'start';
    return g({},
      el('path', { d: `M${x0} ${py}L${x1 - s * 4} ${ly}`, fill: 'none', stroke: slow ? t.c('accent') : t.c('rule'), 'stroke-width': 1 }),
      textLines([String(side === 'L' ? p.jul : p.sep)], { x: x1, y: ly, size: 15, anchor, valign: 'middle', fill: slow ? t.c('accent') : t.c('ink'), weight: slow ? 700 : 600, attrs: { 'font-variant-numeric': 'tabular-nums' } }),
      textLines([p.id], { x: x1 + s * 48, y: ly, size: 15, anchor, valign: 'middle', fill: slow ? t.c('accent') : t.c('muted'), weight: slow ? 700 : null }));
  };
  return svgRoot({ id, width: W, height: H, theme: t,
    title: '同じ児童18人の音読速度（7月と9月）を線で結んだペア比較',
    desc: `18人中${faster.length}人が9月に速く読めた。前後差の平均は${signed(meanChange)}字/分（95%信頼区間 ${signed(meanChange - half)}〜${signed(meanChange + half)}）。遅くなった${slower.length}人（${slower.map(p => p.id).join('・')}）は夏休み中の貸出が0冊。線は同じ児童の2回の測定を結ぶ。` },
  // column heads, unit row and the two rails of the shared scale
  [[xa, '7月・休み前', -1], [xb, '9月・休み明け', 1]].map(([x, head, side]) => g({},
    textLines([head], { x, y: 4, size: 19, anchor: 'middle', valign: 'top', weight: 700, fill: t.c('ink') }),
    textLines(['字/分'], { x: x + side * lead, y: 46, size: 15, anchor: side < 0 ? 'end' : 'start', valign: 'middle', fill: t.c('muted') }),
    textLines(['児童'], { x: x + side * (lead + 48), y: 46, size: 15, anchor: side < 0 ? 'end' : 'start', valign: 'middle', fill: t.c('muted') }),
    el('line', { fill: 'none', x1: x, x2: x, y1: top - 6, y2: bottom + 4, stroke: t.c('rule'), 'stroke-width': 1.5 }))),
  // one line per child: identity is kept, never a rank match
  order.map(({ p }) => {
    const slow = isSlow(p);
    return g({},
      el('line', { fill: 'none', x1: xa, y1: y(p.jul), x2: xb, y2: y(p.sep), stroke: slow ? t.c('accent') : t.c('context'), 'stroke-width': slow ? 3 : 1.8, 'stroke-linecap': 'round' }),
      el('circle', { cx: xa, cy: y(p.jul), r: slow ? 5 : 3.8, fill: slow ? t.c('accent') : t.c('muted') }),
      el('circle', { cx: xb, cy: y(p.sep), r: slow ? 5 : 3.8, fill: slow ? t.c('accent') : t.c('muted') }));
  }),
  pupils.map((p, i) => label(p, i, 'L')), pupils.map((p, i) => label(p, i, 'R')));
}

export default {
  study: true,
  id: 'paired-samples',
  language: 'ja',
  title: 'Paired samples: one line per participant',
  className: 'st st--rail cs-classroom-bright',
  notes: 'Purpose: Compare two measurements of the same people while keeping each person visible, so individual exceptions are not averaged away.\nModify: Replace `pupils` (id, two measurements, any covariate you want to mention). Lines, end labels, the mean paired change, its t-interval and the headline counts recompute.\nInvariant: Each line joins two values of the same participant (never a rank match); both ends share one scale; the participant ID appears at both ends; decliners are shown, not hidden.\nStatic: Already static. For a build, draw the lines first, then turn the decliners to the accent.',
  sources: [{ type: 'original-example', file: 'assets/svg/paired-samples.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">夏休み明け、18人中${faster.length}人が速く読めた。<br><span class="st-quiet">遅くなった<em>${slower.length}人</em>は${slowerNoBooks ? '休み中に本を1冊も借りていない' : 'ほかの児童と同じように本を借りていた'}</span></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b>${signed(meanChange)}<small style="font-size:.4em;font-weight:500;margin-left:.15em">字/分</small></b><span>同じ児童の前後差の平均。95%信頼区間は${signed(meanChange - half)}〜${signed(meanChange + half)}字/分。</span></div>
  <hr class="st-rule">
  <div class="st-kpi"><b class="st-accent">${slower.length}人</b><span>9月に遅くなった児童。<span style="white-space:nowrap">${slower.map(p => p.id).join('・')}番</span>には個別に読書の様子を聞き取る。</span></div>
</div>
<p class="st-source" data-region="source"><span>架空のデータ · 小学4年の1学級、同じ難易度の文章で測定</span><span>ペアの比較（スロープチャート）</span></p>`,
};
