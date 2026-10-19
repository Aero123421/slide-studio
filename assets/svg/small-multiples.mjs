// Diagram study · Small multiples — one panel per day, every panel on the same axes.
// Drawn from primitives so each panel can carry the all-days average as a quiet reference
// and name its own peak. Scales, peaks, the reference line and the headline come from `days`.
import { svgRoot, el, g, textLines, linear, niceDomain, pathFromPoints, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const hours = Array.from({ length: 24 }, (_, h) => h);
const days = [ // 救急外来の時間帯別受診者数（1時間あたり平均、人）2025年（架空のデータ）
  { day: '月曜', v: [6.4, 5.3, 4.4, 3.8, 3.3, 3.4, 4.6, 7.3, 11.2, 15.0, 16.9, 17.4, 16.6, 15.8, 15.0, 14.3, 14.0, 14.4, 14.2, 13.5, 12.2, 10.9, 9.2, 7.6] },
  { day: '火曜', v: [6.1, 5.0, 4.2, 3.6, 3.1, 3.2, 4.3, 6.6, 10.1, 13.2, 14.6, 15.0, 14.4, 13.8, 13.2, 12.7, 12.6, 13.0, 13.0, 12.4, 11.3, 10.2, 8.6, 7.1] },
  { day: '水曜', v: [6.0, 4.9, 4.1, 3.5, 3.1, 3.1, 4.2, 6.4, 9.8, 12.8, 14.2, 14.6, 14.0, 13.5, 13.0, 12.5, 12.4, 12.8, 12.9, 12.3, 11.2, 10.1, 8.5, 7.0] },
  { day: '木曜', v: [6.0, 4.9, 4.1, 3.5, 3.0, 3.1, 4.2, 6.3, 9.6, 12.6, 14.0, 14.4, 13.9, 13.4, 12.9, 12.4, 12.3, 12.8, 12.9, 12.4, 11.3, 10.3, 8.7, 7.2] },
  { day: '金曜', v: [6.2, 5.1, 4.2, 3.6, 3.1, 3.1, 4.2, 6.3, 9.5, 12.4, 13.8, 14.3, 13.8, 13.4, 13.0, 12.6, 12.6, 13.2, 13.6, 13.4, 12.6, 11.8, 10.4, 8.9] },
  { day: '土曜', v: [8.4, 7.2, 6.0, 5.0, 4.2, 3.8, 4.0, 5.0, 7.2, 9.9, 11.6, 12.4, 12.5, 12.2, 11.8, 11.5, 11.4, 11.8, 12.0, 11.8, 11.2, 10.6, 9.6, 8.6] },
  { day: '日曜', v: [8.0, 6.9, 5.8, 4.9, 4.1, 3.7, 3.8, 4.6, 6.6, 9.0, 10.8, 11.8, 12.2, 12.0, 11.6, 11.2, 11.0, 11.3, 11.5, 11.2, 10.4, 9.6, 8.4, 7.2] },
];
const peak = d => { const i = d.v.indexOf(Math.max(...d.v)); return { hour: hours[i], value: d.v[i] }; };
const average = hours.map((_, i) => days.reduce((s, d) => s + d.v[i], 0) / days.length);
const top = [...days].sort((a, b) => peak(b).value - peak(a).value)[0];
const low = [...days].sort((a, b) => peak(a).value - peak(b).value)[0];
const tenths = Math.round((peak(top).value / peak(low).value - 1) * 10); // 割 = tenths
const usual = list => [...list].sort((a, b) => list.filter(v => v === b).length - list.filter(v => v === a).length)[0]; // most common value
const weekdayPeak = usual(days.slice(0, 5).map(d => peak(d).hour)), weekendPeak = usual(days.slice(5).map(d => peak(d).hour));
const f1 = v => fmt(v, { digits: 1, locale: 'ja' });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, cols = 4, gapX = 26, gapY = 30;
  const rows = Math.ceil((days.length + 1) / cols); // one cell is kept for the key
  const cw = (W - gapX * (cols - 1)) / cols, ch = (H - gapY * (rows - 1)) / rows;
  const [y0, y1] = niceDomain([0, Math.max(...days.flatMap(d => d.v))], 2); // shared by every panel
  const panel = (d, k) => {
    const cx = (k % cols) * (cw + gapX), cy = Math.floor(k / cols) * (ch + gapY);
    const box = { x: cx + 30, y: cy + 34, w: cw - 38, h: ch - 62 };
    const x = linear([0, 23], [box.x, box.x + box.w]), y = linear([y0, y1], [box.y + box.h, box.y]);
    const hl = d === top, pk = peak(d), line = d.v.map((v, i) => [x(i), y(v)]);
    const below = k + cols >= days.length; // no panel underneath: label the hours here
    return g({ class: 'ss-panel' },
      y.ticks(2).map(v => el('line', { x1: box.x, x2: box.x + box.w, y1: y(v), y2: y(v), stroke: v === 0 ? t.c('rule') : t.c('grid'), 'stroke-width': 1 })),
      k % cols === 0 ? y.ticks(2).map(v => textLines([fmt(v)], { x: box.x - 8, y: y(v), size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') })) : '',
      el('path', { d: pathFromPoints([...line, [x(23), y(0)], [x(0), y(0)]], { close: true }), fill: hl ? t.seq(1) : t.c('surface') }),
      el('path', { d: pathFromPoints(average.map((v, i) => [x(i), y(v)])), fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.3, 'stroke-dasharray': '3 3' }),
      el('path', { d: pathFromPoints(line), fill: 'none', stroke: hl ? t.c('accent') : t.c('ink'), 'stroke-width': hl ? 3 : 2, 'stroke-linejoin': 'round' }),
      el('circle', { cx: x(pk.hour), cy: y(pk.value), r: hl ? 5.5 : 4.5, fill: hl ? t.c('accent') : t.c('ink'), stroke: t.c('paper'), 'stroke-width': 2 }),
      textLines([d.day], { x: cx + 2, y: cy + 4, size: 18, valign: 'top', fill: hl ? t.c('accent') : t.c('ink'), weight: 700 }),
      textLines([`${pk.hour}時 ${f1(pk.value)}人`], { x: box.x + box.w, y: cy + 6, size: 15, anchor: 'end', valign: 'top', fill: hl ? t.c('accent') : t.c('muted'), weight: hl ? 700 : 600 }),
      below ? [0, 6, 12, 18].map(h => textLines([`${h}時`], { x: x(h), y: box.y + box.h + 8, size: 15, anchor: h ? 'middle' : 'start', valign: 'top', fill: t.c('muted') })) : '');
  };
  // key in the spare cell: what the two line styles mean, and the shared scale
  const kc = days.length, kx = (kc % cols) * (cw + gapX) + 30, ky = Math.floor(kc / cols) * (ch + gapY) + 40;
  return svgRoot({ id: 'small-multiples-fig', width: W, height: H, theme: t,
    title: '曜日別・時間帯別の救急外来受診者数（1時間あたり平均）',
    desc: `7つのパネルはすべて同じ縦軸（${y0}〜${y1}人）。最も高いピークは${top.day}${peak(top).hour}時の${f1(peak(top).value)}人、最も低いピークは${low.day}の${f1(peak(low).value)}人。平日は${weekdayPeak}時台、週末は${weekendPeak}時台に山がある。点線は7日間の平均。` },
  days.map(panel),
  g({ class: 'ss-key' },
    el('line', { x1: kx, x2: kx + 34, y1: ky, y2: ky, stroke: t.c('ink'), 'stroke-width': 2 }),
    textLines(['その曜日'], { x: kx + 44, y: ky, size: 15, valign: 'middle', fill: t.c('ink') }),
    el('line', { x1: kx, x2: kx + 34, y1: ky + 30, y2: ky + 30, stroke: t.c('muted'), 'stroke-width': 1.3, 'stroke-dasharray': '3 3' }),
    textLines(['7日間の平均'], { x: kx + 44, y: ky + 30, size: 15, valign: 'middle', fill: t.c('ink') }),
    textLines(['縦軸は全パネル共通', `0〜${y1}人／時`], { x: kx, y: ky + 64, size: 15, valign: 'top', fill: t.c('muted'), lineHeight: 1.45 })));
}

export default {
  study: true,
  id: 'small-multiples',
  language: 'ja',
  title: 'Small multiples: one shape per panel on shared axes',
  className: 'st cs-civic-calm',
  notes: 'Purpose: Compare the shape and height of many series by repeating one small chart with identical axes, instead of overlaying them or switching scales.\nModify: Replace `days` (one array per panel, aligned to `hours`). The shared y-range, the all-days average, every peak label and the headline recompute; the spare grid cell holds the key.\nInvariant: Every panel uses the same y and x scales (stated in the key); the reference line is the same average in every panel; only the panel the headline names takes the accent.\nStatic: Already static. For a build, reveal panels in reading order.',
  sources: [{ type: 'original-example', file: 'assets/svg/small-multiples.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="word-break:keep-all"><em>${top.day}</em>${peak(top).hour}時台の救急外来は、<wbr>${low.day}のピークより${tenths}割多い<br><span class="st-quiet">平日は${weekdayPeak}時台、週末は${weekendPeak}時台に山がくる</span></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 2025年1〜12月の受付記録、1時間あたりの平均受診者数</span><span>スモールマルチプル</span></p>`,
};
