// Diagram study · Denominator visible — count, denominator and rate side by side, one row per unit.
// The rate column is computed from the two columns before it, so count and denominator always
// travel together. Rows, scales, the accented rate and the headline come from `hospitals`.
import { svgRoot, el, g, textLines, linear, band, measureText, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const hospitals = [ // 2025年の手術部位感染（件）と対象手術件数（件）。同一の術式群・同一の判定基準（架空のデータ）
  { label: '北央総合病院', infections: 48, operations: 6200 },
  { label: '港南市民病院', infections: 31, operations: 2450 },
  { label: '湖畔医療センター', infections: 22, operations: 3900 },
  { label: '東山記念病院', infections: 19, operations: 1180 },
  { label: '西が丘病院', infections: 12, operations: 2100 },
];
const per = 1000; // 率の分母：手術1,000件あたり
const rate = h => (h.infections / h.operations) * per;
const byCount = [...hospitals].sort((a, b) => b.infections - a.infections);
const mostCases = byCount[0], highestRate = [...hospitals].sort((a, b) => rate(b) - rate(a))[0];
const times = Math.round((rate(highestRate) / rate(mostCases)) * 10) / 10;
const ja = (v, digits = 0) => fmt(v, { locale: 'ja', digits });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470;
  const labelW = Math.max(...hospitals.map(h => measureText(h.label, 17))) + 24, gap = 64;
  const colW = (W - labelW - gap * 2) / 3;
  const y = band(byCount.map(h => h.label), [74, H - 6], { inner: 0.42, outer: 0.1 });
  const columns = [ // each column has its own zero-based scale; the third is computed from the first two
    { title: '感染件数', unit: '件', get: h => h.infections, digits: 0, fill: () => t.c('muted') },
    { title: '手術件数（分母）', unit: '件', get: h => h.operations, digits: 0, fill: () => t.c('context') },
    { title: '感染率', unit: `手術${ja(per)}件あたり`, get: rate, digits: 1, fill: h => (h === highestRate ? t.c('accent') : t.c('context')) },
  ];
  const parts = columns.map((c, k) => {
    const x0 = labelW + k * (colW + gap), max = Math.max(...hospitals.map(c.get));
    const x = linear([0, max], [x0, x0 + colW - 70]);
    return g({ class: 'ss-column' },
      textLines([c.title], { x: x0, y: 8, size: 17, valign: 'top', fill: t.c('ink'), weight: 700 }),
      textLines([c.unit], { x: x0, y: 34, size: 15, valign: 'top', fill: t.c('muted') }),
      el('line', { x1: x0, x2: x0, y1: y(byCount[0].label) - 8, y2: H - 6, stroke: t.c('ink'), 'stroke-width': 1.2 }),
      byCount.map(h => {
        const hl = k === 2 && h === highestRate, yy = y(h.label);
        return g({},
          el('rect', { x: x0, y: yy, width: x(c.get(h)) - x0, height: y.bw, fill: c.fill(h) }),
          textLines([ja(c.get(h), c.digits)], { x: x(c.get(h)) + 8, y: yy + y.bw / 2, size: hl ? 18 : 16, valign: 'middle', fill: hl ? t.c('accent') : t.c('ink'), weight: hl ? 700 : 600, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
      }));
  });
  // the arithmetic between the columns: count ÷ denominator = rate
  const ops = ['÷', '='].map((s, k) => textLines([s], { x: labelW + (k + 1) * (colW + gap) - gap / 2, y: 22, size: 26, anchor: 'middle', valign: 'middle', fill: t.c('muted'), weight: 600 }));
  return svgRoot({ id: 'denominator-visible-fig', width: W, height: H, theme: t,
    title: '病院別の手術部位感染：件数、手術件数、手術1,000件あたりの感染率',
    desc: `件数が最も多いのは${mostCases.label}（${mostCases.infections}件、手術${ja(mostCases.operations)}件）。率が最も高いのは${highestRate.label}で、手術${ja(highestRate.operations)}件で${highestRate.infections}件、1,000件あたり${ja(rate(highestRate), 1)}件。${mostCases.label}の${ja(rate(mostCases), 1)}件の${ja(times, 1)}倍。` },
  byCount.map(h => textLines([h.label], { x: labelW - 20, y: y(h.label) + y.bw / 2, size: 17, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: h === highestRate ? 700 : 400 })),
  parts, ops);
}

export default {
  study: true,
  id: 'denominator-visible',
  language: 'ja',
  title: 'Denominator visible: a count and a rate side by side',
  className: 'st cs-clinical-trial',
  notes: 'Purpose: Keep the denominator on the page when a count becomes a proportion, so readers see why the ranking by count and the ranking by rate differ.\nModify: Replace `hospitals` (count and denominator together) and `per`. Rows stay in count order so the rate column visibly reorders; the accented highest rate and the headline ratio recompute.\nInvariant: The rate column is computed from the two columns beside it; every column starts at zero with its unit stated; only units measured under the same definition share the table.\nStatic: Already static. For a build, show counts first, then the denominators, then the rates.',
  sources: [{ type: 'original-example', file: 'assets/svg/denominator-visible.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="word-break:keep-all">${highestRate === mostCases
    ? `<em>${highestRate.label}</em>は、感染の件数でも<br>手術${ja(per)}件あたりの率でも最も高い`
    : `感染の件数が最も多いのは${mostCases.label}だが、<br>手術${ja(per)}件あたりでは<em>${highestRate.label}</em>がその${ja(times, 1)}倍`}</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 2025年、5病院とも同一の術式群・同一の感染判定基準</span><span>件数、分母、率の並置</span></p>`,
};
