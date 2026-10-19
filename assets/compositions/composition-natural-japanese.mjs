// Composition study · Natural Japanese — the headline is the question a Japanese reader would
// actually ask, the answer sits beside it in one plain sentence, and the evidence below carries
// the one caveat at the hour it concerns. Every number is computed from `hours`.
import { svgRoot, el, textLines, linear, band, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const ID = 'composition-natural-japanese';
// 試行した4館の合計、平日1日あたりの来館者（人）。入館ゲートの計数、時間帯別（架空のデータ）
// prev: 2025年4〜9月（18時閉館） / now: 2026年4〜9月（20時閉館）
const hours = [
  { h: 9, prev: 168, now: 164 }, { h: 10, prev: 232, now: 228 }, { h: 11, prev: 246, now: 248 },
  { h: 12, prev: 220, now: 216 }, { h: 13, prev: 252, now: 248 }, { h: 14, prev: 280, now: 276 },
  { h: 15, prev: 296, now: 300 }, { h: 16, prev: 276, now: 268 }, { h: 17, prev: 208, now: 188 },
  { h: 18, prev: null, now: 152 }, { h: 19, prev: null, now: 124 },
];
const branches = 4, closePrev = 18, closeNow = 20;

// derived values
const total = k => hours.reduce((s, r) => s + (r[k] ?? 0), 0);
const prevDay = total('prev'), nowDay = total('now'), gain = nowDay - prevDay;
const gainPct = Math.round((gain / prevDay) * 100);
const extra = hours.filter(r => r.prev == null).reduce((s, r) => s + r.now, 0);
const lastOld = hours.find(r => r.h === closePrev - 1);
const dip = lastOld.prev - lastOld.now;
const ja = v => fmt(v, { locale: 'ja' });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 436;
  const top = 150, base = H - 40; // band above the plot holds the key and the caveat
  const x = band(hours.map(r => r.h), [52, W], { inner: 0.22, outer: 0.06 });
  const y = linear([0, 300], [base, top]);
  const bw = (x.bw - 6) / 2;
  const parts = [];
  // key: two series, written as a Japanese editor would label them
  parts.push(el('rect', { x: 52, y: 4, width: 16, height: 16, fill: t.c('context') }));
  parts.push(textLines([`昨年度（${closePrev}時に閉館）`], { x: 76, y: 12, size: 16, valign: 'middle', fill: t.c('ink') }));
  parts.push(el('rect', { x: 286, y: 4, width: 16, height: 16, fill: t.c('accent') }));
  parts.push(textLines([`今年度（${closeNow}時まで開館）`], { x: 310, y: 12, size: 16, valign: 'middle', fill: t.c('ink') }));
  for (const v of [0, 100, 200, 300]) {
    parts.push(el('line', { x1: 52, x2: W, y1: y(v), y2: y(v), stroke: v ? t.c('grid') : t.c('ink'), 'stroke-width': v ? 1 : 1.4 }));
    parts.push(textLines([ja(v)], { x: 40, y: y(v), size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  }
  parts.push(textLines(['人'], { x: 40, y: y(300) - 28, size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted') }));
  hours.forEach(r => {
    const x0 = x(r.h);
    if (r.prev != null) parts.push(el('rect', { x: x0, y: y(r.prev), width: bw, height: base - y(r.prev), fill: t.c('context') }));
    parts.push(el('rect', { x: x0 + bw + 6, y: y(r.now), width: bw, height: base - y(r.now), fill: t.c('accent') }));
    parts.push(textLines([`${r.h}時台`], { x: x.center(r.h), y: base + 12, size: 16, anchor: 'middle', valign: 'top', fill: r.prev == null ? t.c('ink') : t.c('muted'), weight: r.prev == null ? 700 : null }));
  });
  // where the caveat applies: the hour that used to be the last one
  const dx = x(lastOld.h) + bw / 2, dy = y(lastOld.prev);
  parts.push(el('line', { x1: dx, x2: dx, y1: dy - 8, y2: 44, stroke: t.c('muted'), 'stroke-width': 1.2 }));
  parts.push(textLines([`${lastOld.h}時台は${dip}人減った。`, '閉館間際に来ていた人の一部が、', '遅い時間に移ったとみられる。'], { x: dx - 12, y: 44, size: 17, anchor: 'end', valign: 'top', lineHeight: 1.6, fill: t.c('ink') }));
  // the new hours, bracketed and summed
  const bx0 = x(18), bx1 = x(19) + x.bw, by = y(Math.max(...hours.filter(r => r.prev == null).map(r => r.now))) - 22;
  parts.push(el('path', { d: `M${bx0} ${by + 8}V${by}H${bx1}V${by + 8}`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 1.6 }));
  parts.push(textLines([`延長した2時間に${ja(extra)}人`], { x: (bx0 + bx1) / 2, y: by - 10, size: 18, anchor: 'middle', fill: t.c('accent'), weight: 700 }));
  return svgRoot({ id: `${ID}-fig`, width: W, height: H, theme: t,
    title: '時間帯別の平日1日あたり来館者数（試行4館の合計）、昨年度と今年度',
    desc: `平日の来館者は1日${ja(prevDay)}人から${ja(nowDay)}人に増えた。延長した18時台と19時台に${ja(extra)}人が来た一方、17時台は${dip}人減った。` },
  parts);
}

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Natural Japanese: a question headline answered in one sentence beside it',
  className: 'st cs-wa-ai cmp-natural-ja',
  notes: 'Purpose: Use when a Japanese audience came to the meeting with a question (should we extend the hours? did the change work?). The headline asks it the way they would say it, the answer sits beside it in one sentence that leads with the verdict, and the chart below carries the one caveat at the place it applies.\nModify: Replace `hours` and the closing times; the totals, the gain, the new-hours sum and the dip recompute. Write the question in plain spoken Japanese (〜のか / 〜だろうか), break it only at a phrase boundary, and start the answer with the verdict (増えた。/ 変わらなかった。).\nInvariant: No English labels or eyebrows; numbers in Latin tabular figures with the unit attached (2,412人, 18時台); full-width punctuation; the headline breaks after 、 never inside a phrase; the accent is the current-year series and its one annotation; the caveat is written as a sentence where the eye lands.\nStatic: Already static.',
  sources: [{ type: 'original-example', file: `assets/compositions/${ID}.mjs` }],
  exportPolicy: 'final',
  content: `<h1 class="cmp-nj-q" data-region="title"><span>開館を夜${closeNow - 12}時まで延ばすと、</span><br><span>平日の利用は増えるのか</span></h1>
<p class="cmp-nj-a" data-region="support"><b>増えた。</b>試行した${branches}館の平日の来館者は、<br>1日平均<span class="cmp-nj-nb">${ja(nowDay)}人</span>。昨年度より<span class="cmp-nj-nb">${gain}人</span>（<span class="cmp-nj-nb">${gainPct}％</span>）多い。</p>
<figure class="cmp-nj-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 入館ゲートの計数、2025年度と2026年度の4〜9月の平日</span><span>縦棒グラフ · 問いの見出しと答えのリード</span></p>`,
};
