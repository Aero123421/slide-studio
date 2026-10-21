// Diagram study · Bullet chart — each measure against its own named target, with qualitative bands.
// Built from primitives so the key and the attainment column sit inside the figure. Every band,
// bar, tick and percentage is computed from `kpis`; each row has its own scale and thresholds.
import { svgRoot, el, g, textLines, linear, band, measureText, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const kpis = [ // Q3 actual vs plan, with the business's own poor / satisfactory / good thresholds (illustrative)
  { label: 'New bookings', sub: 'annual contract value', value: 18.4, plan: 20.0, ranges: [16, 20, 25], fmt: { prefix: '$', suffix: 'M', digits: 1 } },
  { label: 'Renewals', sub: 'contracts renewed', value: 31.2, plan: 29.5, ranges: [26, 30, 36], fmt: { prefix: '$', suffix: 'M', digits: 1 } },
  { label: 'Expansion', sub: 'upsell to existing customers', value: 7.9, plan: 7.0, ranges: [5, 7, 10], fmt: { prefix: '$', suffix: 'M', digits: 1 } },
  { label: 'Pipeline coverage', sub: 'qualified pipeline ÷ Q4 plan', value: 2.4, plan: 3.0, ranges: [2.5, 3, 4], fmt: { suffix: '×', digits: 1 } },
  { label: 'Win rate', sub: 'qualified deals won', value: 27, plan: 25, ranges: [20, 25, 35], fmt: { suffix: '%', digits: 0 } },
];
const quality = ['Poor', 'Satisfactory', 'Good']; // what the three grey bands mean
const attain = k => k.value / k.plan;
const beat = kpis.filter(k => k.value >= k.plan);
const worst = [...kpis].sort((p, q) => attain(p) - attain(q))[0];
const short = Math.round((1 - attain(worst)) * 100);
const words = ['none', 'one', 'two', 'three', 'four', 'five', 'six'];

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470;
  const shade = [t.c('context'), t.c('rule'), t.c('grid')];
  const x0 = 272, x1 = W - 232, keyY = 16;
  const y = band(kpis.map(k => k.label), [52, H - 4], { inner: 0.5, outer: 0.12 });
  const key = [...quality.map((q, i) => [q, 'band', i]), ['Actual', 'bar'], ['Plan', 'tick']];
  let kx = x0;
  const keyParts = key.map(([label, kind, i]) => {
    const sw = kind === 'band' ? el('rect', { x: kx, y: keyY - 9, width: 26, height: 18, fill: shade[i] })
      : kind === 'bar' ? el('rect', { x: kx, y: keyY - 4, width: 26, height: 8, fill: t.c('ink') })
        : el('rect', { x: kx + 11, y: keyY - 10, width: 3.5, height: 20, fill: t.c('ink') });
    const out = g({}, sw, textLines([label], { x: kx + 34, y: keyY, size: 15, valign: 'middle', fill: t.c('muted') }));
    kx += 34 + measureText(label, 15) + 22;
    return out;
  });
  const rows = kpis.map(k => {
    const max = Math.max(k.ranges.at(-1), k.value * 1.04, k.plan * 1.04);
    const x = linear([0, max], [x0, x1]), yy = y(k.label), h = y.bw, cy = yy + h / 2;
    const hl = k === worst, a = attain(k);
    const edges = k.ranges.slice(0, -1).concat([max]);
    return g({ class: 'ss-bullet' },
      edges.map((e, i) => el('rect', { x: x(i ? edges[i - 1] : 0), y: yy, width: x(e) - x(i ? edges[i - 1] : 0), height: h, fill: shade[Math.min(i, 2)] })),
      el('rect', { x: x0, y: cy - h * 0.18, width: x(k.value) - x0, height: h * 0.36, fill: hl ? t.c('accent') : t.c('ink') }),
      el('rect', { x: x(k.plan) - 1.75, y: yy - 4, width: 3.5, height: h + 8, fill: t.c('ink') }),
      textLines([k.label], { x: x0 - 20, y: cy - 10, size: 18, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: 700 }),
      textLines([k.sub], { x: x0 - 20, y: cy + 13, size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') }),
      textLines([fmt(k.value, k.fmt)], { x: x1 + 26, y: cy - 10, size: 20, valign: 'middle', fill: hl ? t.c('accent') : t.c('ink'), weight: 700, attrs: { 'font-variant-numeric': 'tabular-nums' } }),
      textLines([`${fmt(a * 100, { digits: 0 })}% of plan (${fmt(k.plan, k.fmt)})`], { x: x1 + 26, y: cy + 14, size: 15, valign: 'middle', fill: a < 1 ? t.c('negative') : t.c('muted'), weight: a < 1 ? 600 : 400, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  });
  return svgRoot({ id: 'bullet-chart-fig', width: W, height: H, theme: t,
    title: 'Third-quarter sales measures against plan, each on its own scale',
    desc: `${beat.length} of ${kpis.length} measures met or beat plan. ${worst.label} reached ${fmt(worst.value, worst.fmt)} against a plan of ${fmt(worst.plan, worst.fmt)}, ${short}% short. Grey bands mark each measure's poor, satisfactory and good ranges.` },
  g({ class: 'ss-legend' }, keyParts),
  rows);
}

export default {
  study: true,
  id: 'bullet-chart',
  title: 'Bullet chart: actual against a named target',
  className: 'st cs-sales-kpi',
  notes: 'Purpose: Compare each measure with its own named target (plan) and say how far off it is, measures with different units side by side.\nModify: Replace `kpis` (value, plan, the three range edges, unit format). The attainment column, the accented worst measure and the headline recompute.\nInvariant: Every bar starts at zero on its own row scale; the plan tick is labelled in the key; attainment is printed, so no one has to judge lengths across rows with different units.\nStatic: Already static. For a build, grow the actual bars after the bands and ticks are shown.',
  sources: [{ type: 'original-example', file: 'assets/svg/bullet-chart.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Q3 beat plan on ${words[beat.length] ?? beat.length} of ${words[kpis.length] ?? kpis.length} measures, but <em>${worst.label.toLowerCase()}</em> is ${short}% short going into Q4</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · quarter to 30 September; each row on its own scale from zero</span><span>Bullet chart</span></p>`,
};
