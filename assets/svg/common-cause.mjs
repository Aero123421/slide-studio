// Diagram study · Common cause — a causal hypothesis drawn as a graph, next to the numbers it predicts.
// The graph is declared as nodes and edges; the estimates (crude, per stratum, weighted within strata)
// and their intervals are computed from `strata`, so the headline cannot drift from the data.
import { svgRoot, el, g, textLines, linear, theme as makeTheme, fmt, sum, normalQuantile, flowDiagram } from '../runtime/figure.mjs';

// End-of-year reading score (0–100) by prior attainment group: app users vs non-users (illustrative).
const strata = [
  { label: 'Low prior attainment', users: { n: 40, mean: 58.1 }, others: { n: 210, mean: 57.0 } },
  { label: 'Middle', users: { n: 95, mean: 66.4 }, others: { n: 150, mean: 65.6 } },
  { label: 'High prior attainment', users: { n: 180, mean: 76.3 }, others: { n: 60, mean: 75.2 } },
];
const withinSD = 12;   // within-stratum standard deviation of scores, points

// Derived: crude difference (pooled groups) and the stratum-size-weighted difference within strata.
const pool = key => {
  const N = sum(strata.map(s => s[key].n)), m = sum(strata.map(s => s[key].n * s[key].mean)) / N;
  const v = sum(strata.map(s => s[key].n * (withinSD ** 2 + (s[key].mean - m) ** 2))) / N;
  return { n: N, mean: m, sd: Math.sqrt(v) };
};
const U = pool('users'), O = pool('others'), z = normalQuantile(0.975);
const crude = { est: U.mean - O.mean, se: Math.sqrt(U.sd ** 2 / U.n + O.sd ** 2 / O.n) };
const rows = strata.map(s => ({ label: s.label, est: s.users.mean - s.others.mean, se: withinSD * Math.sqrt(1 / s.users.n + 1 / s.others.n), w: s.users.n + s.others.n }));
const W = sum(rows.map(r => r.w));
const adjusted = { est: sum(rows.map(r => r.w * r.est)) / W, se: Math.sqrt(sum(rows.map(r => (r.w * r.se) ** 2))) / W };
const f1 = v => fmt(v, { digits: 1, sign: true });

const nodes = [
  { id: 'prior', label: 'Prior attainment', sub: 'measured', x: 290, y: 52, emphasis: true },
  { id: 'app', label: 'Uses the tutoring app', x: 110, y: 222 },
  { id: 'score', label: 'End-of-year score', x: 470, y: 222 },
  { id: 'home', label: 'Support at home', sub: 'not measured', x: 290, y: 392, muted: true },
];
const edges = [ // every arrow is an assumed direct cause
  { from: 'prior', to: 'app', emphasis: true, route: 'straight', label: 'strong readers join' },
  { from: 'prior', to: 'score', emphasis: true, route: 'straight', label: 'and score higher' },
  { from: 'app', to: 'score', route: 'straight', label: 'effect we want' },
  { from: 'home', to: 'app', style: 'dashed', route: 'straight' },
  { from: 'home', to: 'score', style: 'dashed', route: 'straight' },
];

// A finished engine drawing becomes a <g> inside this page's single root <svg>.
const asGroup = svg => svg.replace(/^<svg[^>]*>/, '<g>').replace(/<\/svg>$/, '</g>').replace(/<title[^>]*>[^<]*<\/title>|<desc[^>]*>[^<]*<\/desc>/g, '');

export function figure(theme = 'css') {
  const t = makeTheme(theme), Wd = 1152, H = 470, id = 'common-cause-fig';
  // Left: the hypothesis as a graph (flowDiagram with fixed positions, rendered into a nested svg).
  const dag = asGroup(flowDiagram({ id: `${id}-dag`, theme: t, width: 600, height: 448, fontSize: 18, nodeMaxWidth: 220, layout: 'manual', title: 'Causal hypothesis', nodes, edges }));
  // Right: estimates on one points scale, crude first, then within each stratum, then the weighted summary.
  const px = 660, x = linear([-4, 12], [px + 214, Wd - 16]);
  const list = [
    { label: 'All students', sub: 'crude', ...crude, kind: 'crude' },
    ...rows.map(r => ({ ...r, kind: 'stratum' })),
    { label: 'Within groups', sub: 'weighted by group size', ...adjusted, kind: 'adjusted' },
  ];
  const rowY = k => 92 + k * 62 + (k > 0 ? 12 : 0) + (k === list.length - 1 ? 14 : 0);
  const est = list.map((r, k) => {
    const y = rowY(k), lo = r.est - z * r.se, hi = r.est + z * r.se, strong = r.kind !== 'stratum';
    const color = r.kind === 'crude' ? t.c('muted') : t.c('ink');
    return g({},
      textLines([r.label], { x: px, y: r.sub ? y - 9 : y, size: 17, valign: 'middle', weight: strong ? 700 : 400, fill: t.c('ink') }),
      r.sub ? textLines([r.sub], { x: px, y: y + 13, size: 15, valign: 'middle', fill: t.c('muted') }) : '',
      el('line', { x1: x(lo), x2: x(hi), y1: y, y2: y, stroke: color, 'stroke-width': strong ? 2.5 : 1.8, 'stroke-linecap': 'round' }),
      r.kind === 'adjusted' ? el('path', { d: `M${x(r.est)} ${y - 9}l9 9l-9 9l-9 -9z`, fill: color }) : el('circle', { cx: x(r.est), cy: y, r: strong ? 6.5 : 5, fill: r.kind === 'crude' ? t.c('paper') : color, stroke: color, 'stroke-width': 2 }),
      textLines([f1(r.est)], { x: x(hi) + 10, y, size: 16, valign: 'middle', weight: strong ? 700 : 400, fill: color, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  });
  const yTop = rowY(0) - 34, yBot = rowY(list.length - 1) + 30;
  return svgRoot({ id, width: Wd, height: H, theme: t,
    title: 'Common cause: prior attainment drives both app use and scores',
    desc: `Causal hypothesis: prior attainment causes both tutoring-app use and end-of-year score; support at home, not measured, may do the same. App users score ${f1(crude.est)} points higher overall, but only ${f1(rows[0].est)}, ${f1(rows[1].est)} and ${f1(rows[2].est)} within low, middle and high prior-attainment groups; weighted within groups the difference is ${f1(adjusted.est)} points (95% CI ${f1(adjusted.est - z * adjusted.se)} to ${f1(adjusted.est + z * adjusted.se)}).` },
  dag,
  // estimates panel
  textLines(['App users − non-users, points'], { x: px, y: 16, size: 16, valign: 'top', weight: 700, fill: t.c('ink') }),
  textLines(['dot = estimate, line = 95% CI'], { x: px, y: 40, size: 15, valign: 'top', fill: t.c('muted') }),
  [-4, 0, 4, 8, 12].map(v => g({},
    el('line', { x1: x(v), x2: x(v), y1: yTop, y2: yBot, stroke: v === 0 ? t.c('ink') : t.c('grid'), 'stroke-width': v === 0 ? 1.4 : 1 }),
    textLines([v === 0 ? '0' : fmt(v, { sign: true })], { x: x(v), y: yBot + 8, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') }))),
  el('line', { x1: px, x2: Wd, y1: (rowY(0) + rowY(1)) / 2, y2: (rowY(0) + rowY(1)) / 2, stroke: t.c('rule') }),
  el('line', { x1: px, x2: Wd, y1: (rowY(list.length - 2) + rowY(list.length - 1)) / 2, y2: (rowY(list.length - 2) + rowY(list.length - 1)) / 2, stroke: t.c('rule') }),
  est,
  textLines(['Arrows are assumed causes, not findings. Dashed: not measured, so not adjusted for.'], { x: 0, y: H - 2, size: 15, valign: 'bottom', fill: t.c('muted') }));
}

export default {
  study: true,
  id: 'common-cause',
  title: 'Common cause: a confounder explains an association',
  className: 'st cs-editorial-vermilion',
  notes: 'Purpose: Show how a third variable that causes both exposure and outcome can produce an association, and what the association looks like once that variable is held fixed.\nModify: Replace `strata` (group sizes and means) and `withinSD`; the crude, per-stratum and weighted estimates and their normal-approximation intervals recompute. Edit `nodes`/`edges` to state your own hypothesis.\nInvariant: Arrows are hypothesized direct causes, said in words on the page; the confounder points into both exposure and outcome; an unmeasured confounder stays in the graph (dashed) instead of being dropped for symmetry.\nStatic: Already static. For a talk, show the crude estimate first, then the confounder, then the within-group estimates.',
  sources: [{ type: 'original-example', file: 'assets/svg/common-cause.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head"><em>Prior attainment</em> explains most of the app’s ${fmt(crude.est, { digits: 0 })}-point lead: within attainment groups it is ${fmt(adjusted.est, { digits: 0 })} point${Math.round(adjusted.est) === 1 ? '' : 's'}</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · ${U.n + O.n} pupils in one district, scores out of 100</span><span>Causal graph with stratified estimates</span></p>`,
};
