// Diagram study · Cumulative increments — each month's contribution kept apart from the running total.
// Top: the accumulated saving as a staircase against the annual target. Bottom: the signed monthly
// contributions from a zero baseline, on their own scale. Every riser, bar and label comes from `saving`.
import { svgRoot, el, g, textLines, linear, band, niceDomain, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const months = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'];
const saving = [6.2, 8.4, 9.1, 11.8, 7.5, -3.6, 13.2, 14.9, 10.6, 12.3, 15.1, 13.4]; // 改善による月ごとの削減額（百万円、架空のデータ）
const target = 100; // 年間目標（百万円）
const cum = saving.reduce((acc, v) => [...acc, (acc.at(-1) ?? 0) + v], []).map(v => Math.round(v * 10) / 10);
const hit = cum.findIndex(v => v >= target); // 目標に届いた月
const setback = saving.findIndex(v => v < 0);
const yen = v => { // 百万円 → 「1億1,890万円」
  const man = Math.round(v * 100), oku = Math.floor(man / 10000), rest = man % 10000;
  return `${oku ? `${oku}億` : ''}${rest ? `${fmt(rest, { locale: 'ja' })}万` : ''}円`;
};

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, left = 52, right = 160;
  const x = band(months, [left, W - right], { inner: 0.36, outer: 0.08 }), cx = i => x.center(months[i]);
  const top = { y0: 28, y1: 270 }, bot = { y0: 318, y1: 422 };
  const [, cMax] = niceDomain([0, Math.max(...cum, target)], 5);
  const yc = linear([0, cMax], [top.y1, top.y0]);
  const yb = linear([Math.min(0, ...saving), Math.max(...saving)], [bot.y1, bot.y0 + 20]);
  // staircase: flat during each month at the month-end total, rising at the month's centre
  let d = `M${x(months[0])} ${yc(0)}`;
  cum.forEach((v, i) => { d += `H${cx(i)}V${yc(v)}`; });
  d += `H${x(months.at(-1)) + x.bw}`;
  const area = `${d}V${yc(0)}Z`;
  const neg = v => v < 0;
  return svgRoot({ id: 'cumulative-increments-fig', width: W, height: H, theme: t,
    title: '改善活動による削減額：月ごとの寄与と年度累計（百万円）',
    desc: `${hit >= 0 ? `累計は${months[hit]}に年間目標${yen(target)}を超え、` : `累計は年間目標${yen(target)}に届かず、`}年度末に${yen(cum.at(-1))}。${setback >= 0 ? `${months[setback]}は設備トラブルで${fmt(saving[setback], { digits: 1 })}百万円の後退。` : ''}下段の棒は各月の寄与で、ゼロを基準に符号付きで描く。` },
  // top panel: accumulated total
  yc.ticks(3).map(v => g({},
    el('line', { x1: left, x2: W - right, y1: yc(v), y2: yc(v), stroke: v ? t.c('grid') : t.c('ink'), 'stroke-width': v ? 1 : 1.3 }),
    textLines([fmt(v)], { x: left - 10, y: yc(v), size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
  textLines(['累計（百万円）'], { x: left - 10, y: 6, size: 15, valign: 'top', fill: t.c('muted') }),
  el('path', { d: area, fill: t.c('surface') }),
  el('line', { x1: left, x2: W - right, y1: yc(target), y2: yc(target), stroke: t.c('ink'), 'stroke-width': 1.4, 'stroke-dasharray': '6 5' }),
  textLines([`年間目標 ${yen(target)}`], { x: left + 8, y: yc(target) - 9, size: 16, fill: t.c('ink'), weight: 700 }),
  el('path', { d, fill: 'none', stroke: t.c('ink'), 'stroke-width': 2.6, 'stroke-linejoin': 'round' }),
  hit >= 0 ? g({},
    el('circle', { cx: cx(hit), cy: yc(target), r: 7, fill: t.c('accent'), stroke: t.c('paper'), 'stroke-width': 2.5 }),
    textLines([`${months[hit]}に到達`], { x: cx(hit) - 14, y: yc(target) - 10, size: 16, anchor: 'end', fill: t.c('accent'), weight: 700 })) : '',
  textLines([yen(cum.at(-1))], { x: x(months.at(-1)) + x.bw + 12, y: yc(cum.at(-1)), size: 18, valign: 'middle', fill: t.c('ink'), weight: 700 }),
  textLines(['年度末の累計'], { x: x(months.at(-1)) + x.bw + 12, y: yc(cum.at(-1)) + 22, size: 15, valign: 'middle', fill: t.c('muted') }),
  setback >= 0 ? textLines([`${months[setback]}：設備トラブルで後退`], { x: cx(setback) + 10, y: yc(cum[setback]) + 26, size: 15, fill: t.c('negative'), weight: 600 }) : '',
  // bottom panel: each month's signed contribution
  textLines(['月ごとの削減額（百万円）'], { x: left - 10, y: bot.y0 - 14, size: 15, valign: 'top', fill: t.c('muted') }),
  saving.map((v, i) => {
    const hl = i === hit, y0 = yb(0), y1 = yb(v);
    return g({},
      el('rect', { x: x(months[i]), y: Math.min(y0, y1), width: x.bw, height: Math.abs(y1 - y0), fill: neg(v) ? t.c('negative') : hl ? t.c('accent') : t.c('context') }),
      textLines([fmt(v, { digits: 1, locale: 'ja' })], { x: cx(i), y: neg(v) ? y1 + 6 : y1 - 6, size: 15, anchor: 'middle', valign: neg(v) ? 'top' : 'bottom', fill: neg(v) ? t.c('negative') : hl ? t.c('accent') : t.c('ink'), weight: hl || neg(v) ? 700 : 600, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  }),
  el('line', { x1: left, x2: W - right, y1: yb(0), y2: yb(0), stroke: t.c('ink'), 'stroke-width': 1.3 }),
  months.map((m, i) => textLines([m], { x: cx(i), y: H - 4, size: 16, anchor: 'middle', valign: 'bottom', fill: i === hit ? t.c('accent') : t.c('ink'), weight: i === hit ? 700 : 400 })));
}

export default {
  study: true,
  id: 'cumulative-increments',
  language: 'ja',
  title: 'Cumulative increments: contributions apart from the running total',
  className: 'st cs-manufacturing-plant',
  notes: 'Purpose: Separate each period\'s contribution from the accumulated total, so the path to the total (including setbacks) and the moment a target is reached are both visible.\nModify: Replace `months`, `saving` and `target`. The running total, the staircase, the target crossing, the setback note and the headline recompute.\nInvariant: The staircase is the running sum of the bars below it; negative contributions are signed bars below a drawn zero line; the two panels share the month axis but state their own units.\nStatic: Already static. For a build, add one month at a time: bar first, then its riser.',
  sources: [{ type: 'original-example', file: 'assets/svg/cumulative-increments.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="word-break:keep-all">${hit >= 0
    ? `改善による削減額は、<em>${months[hit]}</em>に年間目標の${yen(target)}を超えた`
    : `改善による削減額は、年間目標の${yen(target)}まで<em>${yen(target - cum.at(-1))}</em>届かなかった`}<br><span class="st-quiet">年度末の累計は${yen(cum.at(-1))}${setback >= 0 ? `。${months[setback]}は設備トラブルで後退` : ''}</span></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 2025年度（4月〜3月）、第2工場の改善提案による原価低減額</span><span>累積の階段図と月別の寄与</span></p>`,
};
