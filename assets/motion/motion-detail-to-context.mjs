// Motion study · Return a detail to its larger context — the slide opens on one week, read
// closely, then the same bars zoom out along the time axis until that week is one stretch of
// the summer; finally the pattern the week belongs to is marked.
// Builds: 1 zoom out (x only: bar heights never change), 2 the explanation.
import { svgRoot, el, g, linear, textLines, theme as makeTheme, fmt, n } from '../runtime/figure.mjs';

// 2025年6月1日〜9月30日の日別データ（架空）。最高気温（℃）と熱中症による救急搬送人員（人）。
const start = Date.UTC(2025, 5, 1);
const maxTemp = [26.2, 27.2, 24.3, 24.3, 26.4, 28.6, 26.8, 24.7, 25.5, 26.8, 28.4, 27.2, 26.9, 27.3, 28.1, 27.0, 28.3, 28.8, 31.1, 28.8, 30.5, 27.7, 30.7, 29.9, 29.0, 30.0, 31.5, 29.9, 32.0, 32.9,
  33.3, 33.4, 29.3, 31.9, 30.5, 33.1, 32.0, 32.3, 32.8, 31.4, 32.6, 31.5, 35.7, 32.1, 32.9, 30.4, 31.0, 32.0, 34.5, 34.6, 34.0, 32.7, 36.4, 37.3, 35.1, 34.6, 32.5, 34.4, 35.5, 34.0, 34.8,
  35.6, 37.6, 35.4, 32.4, 34.2, 36.0, 38.4, 36.5, 36.2, 32.2, 33.4, 34.5, 34.9, 32.0, 36.6, 32.8, 35.5, 37.1, 35.2, 36.2, 34.7, 33.7, 32.0, 32.4, 31.1, 36.1, 37.4, 35.8, 35.2, 34.6, 32.0,
  33.7, 31.1, 31.3, 32.7, 32.4, 31.0, 33.9, 32.5, 31.4, 29.3, 31.1, 30.2, 30.4, 31.5, 29.3, 30.4, 31.0, 30.1, 32.8, 26.6, 28.9, 27.1, 28.5, 32.2, 25.8, 27.6, 28.8, 27.8, 28.8, 24.9];
const transports = [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 2, 1, 1, 2, 2, 2, 3, 4, 4, 3, 1, 2, 2, 4, 4, 4, 4, 3, 4, 3, 10, 3, 4, 2, 3, 3, 6, 7, 6, 4, 12, 17, 8, 5, 3, 8,
  8, 6, 10, 11, 22, 9, 3, 9, 12, 27, 16, 14, 3, 4, 7, 8, 3, 13, 3, 10, 16, 9, 14, 8, 5, 4, 4, 1, 11, 19, 10, 10, 6, 2, 6, 3, 1, 4, 4, 2, 5, 3, 2, 0, 2, 1, 2, 4, 1, 2, 3, 0, 4, 0, 1, 1, 1,
  3, 0, 1, 1, 2, 1, 0];
const hotAt = 37;                  // 最高気温の閾値（℃）
const week = { from: 64, days: 7 }; // index of 8月4日 and the length of the close reading
const date = i => new Date(start + i * 864e5);
const md = i => `${date(i).getUTCMonth() + 1}/${date(i).getUTCDate()}`;
const dow = i => '日月火水木金土'[date(i).getUTCDay()];
const mdj = i => `${date(i).getUTCMonth() + 1}月${date(i).getUTCDate()}日`;
const monthStarts = maxTemp.map((_, i) => i).filter(i => date(i).getUTCDate() === 1);
const hot = maxTemp.map((v, i) => i).filter(i => maxTemp[i] >= hotAt);
const total = transports.reduce((s, v) => s + v, 0), onHot = hot.reduce((s, i) => s + transports[i], 0);
const share = Math.round((onHot / total) * 100);
const peak = Array.from({ length: week.days }, (_, j) => week.from + j).reduce((a, b) => (transports[b] > transports[a] ? b : a));

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 440, px = 64, pw = W - px, top = 56, base = H - 84;
  const y = linear([0, 30], [base, top]), step = pw / maxTemp.length, k = maxTemp.length / week.days, tx = -k * week.from * step;
  const atWeek = j => (j + 0.5) * (pw / week.days); // centre of week day j in the zoomed-in view
  const fade = (on, off) => ({ 'data-states': { 0: { opacity: on }, 1: { opacity: off } }, 'data-duration': 450 });
  const isHot = i => maxTemp[i] >= hotAt;
  return svgRoot({ id: 'motion-detail-to-context-fig', width: W, height: H, theme: t,
    title: `熱中症による救急搬送人員（日別、${date(0).getUTCFullYear()}年${date(0).getUTCMonth() + 1}〜${date(maxTemp.length - 1).getUTCMonth() + 1}月）、${mdj(week.from)}〜${mdj(week.from + week.days - 1)}の週から夏全体へ`,
    desc: `${mdj(peak)}（最高気温${maxTemp[peak]}℃）の搬送は${transports[peak]}人。夏全体では最高気温${hotAt}℃以上の${hot.length}日間に、${total}人中${onHot}人（${share}%）が集中した。` },
  [0, 10, 20, 30].map(v => g({}, el('line', { x1: px, x2: W, y1: y(v), y2: y(v), stroke: v ? t.c('grid') : t.c('ink'), 'stroke-width': v ? 1 : 1.4 }),
    textLines([String(v)], { x: px - 12, y: y(v), size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
  textLines(['熱中症の救急搬送（人/日）'], { x: 0, y: 4, size: 16, valign: 'top', fill: t.c('muted') }),
  // The bars live in a clipped viewport; state 0 stretches the time axis so one week fills it.
  el('defs', {}, el('clipPath', { id: 'motion-detail-to-context-plot' }, el('rect', { x: px, y: 0, width: pw, height: H }))),
  g({ 'clip-path': 'url(#motion-detail-to-context-plot)' },
    g({ 'data-states': { 0: { transform: `matrix(${n(k)},0,0,1,${n(px + tx - k * px)},0)` }, 1: { transform: 'matrix(1,0,0,1,0,0)' } }, 'data-duration': 1100, 'data-easing': 'smooth', style: 'transform-box:view-box;transform-origin:0 0' },
      transports.map((v, i) => el('rect', {
        x: px + i * step + step * 0.16, y: y(v), width: step * 0.68, height: base - y(v),
        fill: i === peak ? t.c('accent') : t.c('context'),
        // build 2: every day at or above the threshold joins the accent
        ...(isHot(i) && i !== peak ? { 'data-states': { 0: { fill: t.c('context') }, 2: { fill: t.c('accent') } }, style: `fill:${t.c('context')}`, fill: null } : {}),
      })))),
  // Close-reading labels (state 0 only): value, date, weekday and temperature for each day.
  g(fade(1, 0), Array.from({ length: week.days }, (_, j) => {
    const i = week.from + j, cx = px + atWeek(j), c = i === peak ? t.c('accent') : t.c('ink');
    return g({},
      textLines([`${transports[i]}人`], { x: cx, y: y(transports[i]) - 10, size: 18, anchor: 'middle', fill: c, weight: 700 }),
      textLines([`${md(i)}（${dow(i)}）`], { x: cx, y: base + 12, size: 17, anchor: 'middle', valign: 'top', fill: t.c('ink'), weight: i === peak ? 700 : 400 }),
      textLines([`${fmt(maxTemp[i], { digits: 1 })}℃`], { x: cx, y: base + 38, size: 16, anchor: 'middle', valign: 'top', fill: maxTemp[i] >= hotAt ? t.c('accent') : t.c('muted'), weight: maxTemp[i] >= hotAt ? 700 : 400 }));
  })),
  textLines([`${md(week.from)}〜${md(week.from + week.days - 1)}　最高気温と搬送人員`], { x: W, y: 4, size: 16, anchor: 'end', valign: 'top', fill: t.c('muted'), attrs: fade(1, 0) }),
  // Context labels (from build 1): months, and the outline of the week we started from.
  g(fade(0, 1), monthStarts.map(i => textLines([`${date(i).getUTCMonth() + 1}月`], { x: px + i * step, y: base + 12, size: 17, valign: 'top', fill: t.c('ink') })),
    el('rect', { x: px + week.from * step - 2, y: top - 6, width: week.days * step + 4, height: base - top + 6, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }),
    textLines([`${md(week.from)}〜${md(week.from + week.days - 1)}`], { x: px + (week.from + week.days / 2) * step, y: top - 14, size: 16, anchor: 'middle', fill: t.c('ink'), weight: 600 })),
  // Build 2 — the explanation: every hot day, not just the one we read closely.
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 350 },
    el('rect', { x: px + 8, y: top + 2, width: 16, height: 16, fill: t.c('accent') }),
    textLines([`最高気温${hotAt}℃以上の日（${hot.length}日）`], { x: px + 32, y: top + 10, size: 17, valign: 'middle', fill: t.c('accent'), weight: 700 }),
    textLines([`${hot.length}日間で${total}人中${onHot}人、夏全体の${share}%`], { x: px + 32, y: top + 38, size: 17, valign: 'middle', fill: t.c('ink') })));
}

export default {
  study: true,
  id: 'motion-detail-to-context',
  language: 'ja',
  title: 'Detail to context: zoom a close reading back out',
  className: 'st cs-civic-calm',
  notes: `Purpose: Start from a close reading (one week, every value labelled), then zoom the same bars out until that week is one part of the season, and name the pattern it belongs to.\nModify: Replace \`maxTemp\` and \`transports\` (one value per day from \`start\`); set \`week\` to the close reading and \`hotAt\` to the threshold. The zoom factor, labels and shares recompute.\nInvariant: The zoom scales the time axis only, so bar heights (the values) never change; the same bars move, nothing is redrawn; the week stays outlined after the zoom.\nStatic: The final build shows the whole summer, the outlined week and the ${hot.length} days at or above ${hotAt}℃ in the accent.`,
  sources: [{ type: 'original-example', file: 'assets/motion/motion-detail-to-context.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="font-family:var(--ss-font-sans);text-wrap:initial"><em>最高気温${hotAt}℃以上の日</em>は${hot.length}日だけ。<br>その${hot.length}日間に、夏の熱中症搬送の${share}%が集中した</h1>
<figure class="st-fig" style="top:206px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 市消防局の救急搬送記録（熱中症）と気象台の日最高気温、2025年6〜9月</span><span>モーション · 詳細から全体へズームアウト（2ステップ）</span></p>`,
};
