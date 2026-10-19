// Motion study · Change two values on the same scale — urban and rural columns share one zero
// and one axis. Each build rescales both columns from that baseline (computed transforms),
// counts their labels on from the previous year, re-measures the gap and leaves a tick behind.
import { svgRoot, el, g, linear, textLines, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const years = [2019, 2022, 2025];
const areas = [ // premises able to order gigabit-capable broadband, % (illustrative)
  { label: 'Urban', values: [38, 71, 88] },
  { label: 'Rural', values: [7, 29, 64] },
];
const [urban, rural] = areas;
const gapAt = k => urban.values[k] - rural.values[k];
const gaps = years.map((_, k) => gapAt(k));
const widest = gaps.indexOf(Math.max(...gaps));

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 800, H = 470, m = { l: 60, t: 70, b: 44 };
  const y = linear([0, 100], [H - m.b, m.t]), base = y(0);
  const cw = 168, cx = [m.l + 66, m.l + 66 + cw + 56]; // column left edges
  const color = [t.c('ink'), t.c('accent')];
  const dur = 900, ease = 'smooth';
  const scaleY = (from, to) => { const a = (base - y(to)) / (base - y(from)); return `matrix(1,0,0,${a.toFixed(5)},0,${(base * (1 - a)).toFixed(2)})`; };
  const bxk = cx[1] + cw + 22; // gap bracket, right of the rural column
  const span = k => [y(urban.values[k]), y(rural.values[k])];
  const bracketMap = k => { const [u0, r0] = span(0), [u, r] = span(k), a = (r - u) / (r0 - u0); return `matrix(1,0,0,${a.toFixed(5)},0,${(u - a * u0).toFixed(2)})`; };
  return svgRoot({ id: 'motion-paired-change-fig', width: W, height: H, theme: t,
    title: `Premises with gigabit-capable broadband, urban and rural, ${years.join(', ')}`,
    desc: `Urban coverage went ${urban.values.join('% → ')}%; rural ${rural.values.join('% → ')}%. The gap was ${gaps.join(', ')} points: widest in ${years[widest]}, then narrowing.` },
  [0, 25, 50, 75, 100].map(v => g({},
    el('line', { x1: m.l, x2: W - 20, y1: y(v), y2: y(v), stroke: v ? t.c('grid') : t.c('ink'), 'stroke-width': v ? 1 : 1.6 }),
    textLines([`${v}%`], { x: m.l - 10, y: y(v), size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
  years.map((yr, k) => textLines([String(yr)], { x: m.l, y: 8, size: 34, weight: 700, fill: t.c('ink'), valign: 'top',
    attrs: { 'data-step': k, 'data-until': k < years.length - 1 ? k : null, 'data-motion': k ? 'reveal' : null, 'data-duration': 400 } })),
  areas.map((a, j) => g({},
    // the column: one rect, rescaled about the shared baseline at each build
    el('rect', { x: cx[j], y: y(a.values[0]), width: cw, height: base - y(a.values[0]), fill: color[j],
      'data-states': Object.fromEntries(years.map((_, k) => [k, { transform: scaleY(a.values[0], a.values[k]) }])), 'data-duration': dur, 'data-easing': ease,
      style: 'transform-box:view-box;transform-origin:0 0' }),
    // ticks left behind at earlier values, labelled with their year (inside the column when it has grown past them)
    years.slice(0, -1).map((yr, k) => {
      const inside = a.values[k] < Math.min(...a.values.slice(k + 1));
      return g({ 'data-step': k + 1, 'data-motion': 'reveal', 'data-delay': dur - 200 },
        el('line', { x1: cx[j], x2: cx[j] + cw, y1: y(a.values[k]), y2: y(a.values[k]), stroke: inside ? t.c('paper') : t.c('muted'), 'stroke-width': 2, 'stroke-dasharray': '6 4' }),
        textLines([`${yr}: ${a.values[k]}%`], { x: cx[j] + 10, y: y(a.values[k]) - 7, size: 15, fill: inside ? t.c('paper') : t.c('muted'), weight: 600 }));
    }),
    // value labels count on from the previous year while riding up with the column top
    years.map((_, k) => g({ 'data-states': { 0: { translate: `0px ${k ? (y(a.values[k - 1]) - y(a.values[k])).toFixed(1) : 0}px` }, [k]: { translate: '0px 0px' } }, 'data-duration': dur, 'data-easing': ease, style: 'transform-box:view-box' },
      textLines([`${a.values[k]}%`], { x: cx[j] + cw / 2, y: y(a.values[k]) - 12, size: 30, weight: 700, anchor: 'middle', fill: color[j],
        attrs: { 'data-step': k, 'data-until': k < years.length - 1 ? k : null, 'data-motion': k ? 'count' : null, 'data-count-from': k ? a.values[k - 1] : null, 'data-duration': dur, 'font-variant-numeric': 'tabular-nums' } }))),
    textLines([a.label], { x: cx[j] + cw / 2, y: base + 12, size: 18, weight: 700, anchor: 'middle', valign: 'top', fill: color[j] }))),
  // the gap, re-measured at every build: guide from the urban top, bracket down to the rural top
  el('line', { x1: cx[0] + cw, x2: bxk + 8, y1: span(0)[0], y2: span(0)[0], stroke: t.c('muted'), 'stroke-width': 1.2, 'stroke-dasharray': '3 4',
    'data-states': Object.fromEntries(years.map((_, k) => [k, { translate: `0px ${(span(k)[0] - span(0)[0]).toFixed(1)}px` }])), 'data-duration': dur, 'data-easing': ease, style: 'transform-box:view-box' }),
  el('path', { d: `M${bxk} ${span(0)[0]}h8V${span(0)[1]}h-8`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.8, 'vector-effect': 'non-scaling-stroke',
    'data-states': Object.fromEntries(years.map((_, k) => [k, { transform: bracketMap(k) }])), 'data-duration': dur, 'data-easing': ease, style: 'transform-box:view-box;transform-origin:0 0' }),
  years.map((_, k) => textLines([`${gaps[k]} pts`, 'gap'], { x: bxk + 18, y: (span(k)[0] + span(k)[1]) / 2, size: 18, weight: 700, valign: 'middle', fill: t.c('ink'), lineHeight: 1.2,
    attrs: { 'data-step': k, 'data-until': k < years.length - 1 ? k : null, 'data-motion': k ? 'reveal' : null, 'data-delay': k ? dur - 150 : null } })));
}

export default {
  study: true,
  id: 'motion-paired-change',
  title: 'Paired change: two values move on one baseline',
  className: 'st st--rail cs-navy-classic-light',
  notes: 'Purpose: Change two related values together on one shared baseline and unit, so their difference is read as a distance that is re-measured at every step.\nModify: Replace `years` and the two `areas` (one value per year); column scales, counted labels, ghost ticks, the gap bracket and the rail recompute.\nInvariant: Both columns rescale from the same zero with transforms computed from the data; labels count from the previous value; earlier values stay as labelled ticks; the gap is always urban minus rural on the same axis.\nStatic: The final build shows the latest values, both earlier ticks per column and the gap history in the rail.',
  sources: [{ type: 'original-example', file: 'assets/motion/motion-paired-change.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head"><em>Rural</em> gigabit coverage rose from ${rural.values[0]}% to ${rural.values.at(-1)}%; the gap to towns, ${gaps[widest]} points in ${years[widest]}, is now ${gaps.at(-1)}</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  ${years.map((yr, k) => `${k ? '<hr class="st-rule" data-step="' + k + '" data-motion="reveal">' : ''}<div class="st-kpi"${k ? ` data-step="${k}" data-motion="reveal" data-delay="700"` : ''}><b${k === years.length - 1 ? ' class="st-accent"' : ''}>${gaps[k]} pts</b><span>Gap in ${yr}: urban ${urban.values[k]}%, rural ${rural.values[k]}%${k ? ` (${fmt(gaps[k] - gaps[k - 1], { sign: true })})` : ''}.</span></div>`).join('\n  ')}
</div>
<p class="st-source" data-region="source"><span>Illustrative data · share of premises able to order a gigabit-capable line</span><span>Motion · paired columns rescaled from one baseline (2 builds)</span></p>`,
};
