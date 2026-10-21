// Motion study · Reveal what the line does not explain — stores first, then the least-squares
// line, and only then the residuals: one segment per store from the line to the store, drawn
// outward from the line, the largest ones named. Fit and residuals come from linearFit().
import { svgRoot, el, g, linear, textLines, pathFromPoints, linearFit, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const stores = [ // weekly footfall (thousand visitors) and weekly sales (€ thousand), average of 13 weeks (illustrative)
  { name: 'Abbey Rd', visits: 8.2, sales: 74 }, { name: 'Bank St', visits: 11.5, sales: 92 }, { name: 'Castle Gate', visits: 6.4, sales: 61 },
  { name: 'Dock Rd', visits: 14.8, sales: 115 }, { name: 'Elm Park', visits: 9.7, sales: 83 }, { name: 'Ferry Ln', visits: 12.3, sales: 96 },
  { name: 'Granary Sq', visits: 16.2, sales: 124 }, { name: 'Harbour St', visits: 10.1, sales: 121 }, { name: 'Iron Bridge', visits: 7.3, sales: 66 },
  { name: 'Jubilee Pl', visits: 13.6, sales: 104 }, { name: 'Kiln Yard', visits: 5.8, sales: 52 }, { name: 'Lark Hill', visits: 11.0, sales: 90 },
  { name: 'Mill Lane', visits: 8.9, sales: 104 }, { name: 'North Quay', visits: 15.4, sales: 118 }, { name: 'Orchard St', visits: 9.2, sales: 76 },
  { name: 'Priory Walk', visits: 12.9, sales: 101 }, { name: 'Quarry Rd', visits: 7.8, sales: 64 }, { name: 'Rope Walk', visits: 14.1, sales: 109 },
  { name: 'Station Rd', visits: 17.5, sales: 112 }, { name: 'Tanner Row', visits: 10.6, sales: 85 }, { name: 'Union St', visits: 13.0, sales: 98 },
  { name: 'Vine St', visits: 6.9, sales: 63 }, { name: 'West End', visits: 11.9, sales: 94 }, { name: 'Yarn Market', visits: 9.5, sales: 79 },
];
const fit = linearFit(stores.map(s => [s.visits, s.sales]));
const withRes = stores.map((s, i) => ({ ...s, res: fit.residuals[i], pred: fit.intercept + fit.slope * s.visits }));
const ranked = [...withRes].sort((a, b) => Math.abs(b.res) - Math.abs(a.res));
const named = ranked.slice(0, 3); // the three stores the line explains least
const top = [...withRes].sort((a, b) => b.res - a.res)[0], bottom = [...withRes].sort((a, b) => a.res - b.res)[0];
const r2 = Math.round(fit.r2 * 100);
const busiest = [...stores].sort((a, b) => b.visits - a.visits)[0];
const eur = v => `${fmt(v, { sign: true, digits: 0 })}k`.replace(/^([+−])/, '$1€');

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 800, H = 470, m = { l: 64, r: 24, t: 30, b: 50 };
  const x = linear([4, 19], [m.l, W - m.r]), y = linear([40, 130], [H - m.b, m.t]);
  const ends = [4.6, 18.2].map(v => [x(v), y(fit.intercept + fit.slope * v)]);
  return svgRoot({ id: 'motion-residual-uncover-fig', width: W, height: H, theme: t,
    title: 'Weekly sales against weekly footfall for 24 stores, with the least-squares line and residuals',
    desc: `Footfall accounts for ${r2}% of the variation in sales (R² ${fmt(fit.r2, { digits: 2 })}); each extra thousand visitors goes with €${fmt(fit.slope, { digits: 1 })}k of sales. ${top.name} sells ${eur(top.res)} a week more than the line predicts; ${bottom.name} ${eur(bottom.res)}.` },
  [6, 8, 10, 12, 14, 16, 18].map(v => g({}, el('line', { x1: x(v), x2: x(v), y1: m.t, y2: H - m.b, stroke: t.c('grid') }),
    textLines([String(v)], { x: x(v), y: H - m.b + 10, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') }))),
  [40, 70, 100, 130].map(v => g({}, el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: t.c('grid') }),
    textLines([`€${v}k`], { x: m.l - 10, y: y(v), size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
  textLines(['Weekly sales'], { x: m.l - 54, y: 4, size: 16, fill: t.c('muted'), valign: 'top' }),
  textLines(['Weekly footfall, thousand visitors'], { x: W - m.r, y: H - m.b + 34, size: 16, anchor: 'end', valign: 'top', fill: t.c('muted') }),
  // build 2: residuals, drawn from the line out to each store (under the dots)
  withRes.map(s => {
    const big = named.includes(s);
    return el('path', { d: `M${x(s.visits)} ${y(s.pred)}L${x(s.visits)} ${y(s.sales)}`, fill: 'none', stroke: big ? t.c('accent') : t.c('muted'), 'stroke-width': big ? 2.6 : 1.6,
      'data-step': 2, 'data-motion': 'draw', 'data-delay': Math.round((s.visits - 4) * 40), 'data-duration': 420 });
  }),
  // build 1: the fitted line
  el('path', { d: pathFromPoints(ends), fill: 'none', stroke: t.c('ink'), 'stroke-width': 2.6, 'data-step': 1, 'data-motion': 'draw', 'data-duration': 800, 'data-easing': 'standard' }),
  textLines(['least-squares line'], { x: ends[1][0], y: ends[1][1] - 12, size: 16, weight: 600, anchor: 'end', fill: t.c('ink'), halo: t.c('paper'),
    attrs: { 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 700 } }),
  // build 0: the stores themselves
  withRes.map(s => el('circle', { cx: x(s.visits), cy: y(s.sales), r: 6.5, fill: named.includes(s) ? t.c('ink') : t.c('muted'), stroke: t.c('paper'), 'stroke-width': 1.8 })),
  // stores above the line are named to their left; stores below it are named underneath, away from the line
  named.map(s => { const above = s.res > 0; return textLines([`${s.name} ${eur(s.res)}`], { x: x(s.visits) + (above ? -12 : 6), y: y(s.sales) + (above ? -2 : 24), size: 16, weight: 700, anchor: 'end',
    valign: 'middle', fill: t.c('accent'), halo: t.c('paper'), attrs: { 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 700 } }); }));
}

export default {
  study: true,
  id: 'motion-residual-uncover',
  title: 'Residual uncover: the fit first, then what it misses',
  className: 'st st--rail cs-sales-kpi',
  notes: 'Purpose: Show a fitted relationship, then reveal the residuals so the audience sees what the line does not explain, in that order.\nModify: Replace `stores` (x, y and a name); the OLS line, R², residuals, the three named stores and the rail recompute.\nInvariant: Points come first, the line second, residuals third and never before the line; each residual is drawn from the line to its point (observed minus fitted); only the largest residuals carry the accent and a name.\nStatic: The final build shows points, line, R² and every residual with the three largest named.',
  sources: [{ type: 'original-example', file: 'assets/motion/motion-residual-uncover.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Footfall explains ${r2}% of the variation in store sales; <em>${top.name}</em> sells €${fmt(top.res, { digits: 0 })}k a week more than predicted</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi" data-step="1" data-motion="reveal" data-delay="600"><b>R² ${fmt(fit.r2, { digits: 2 })}</b><span>Each extra thousand visitors a week goes with €${fmt(fit.slope, { digits: 1 })}k more sales.</span></div>
  <hr class="st-rule" data-step="2" data-motion="reveal">
  <div class="st-kpi" data-step="2" data-motion="reveal" data-delay="800"><b class="st-accent">${eur(top.res)}</b><span>${top.name} sells more each week than its footfall predicts.</span></div>
  <div class="st-kpi" data-step="2" data-motion="reveal" data-delay="1000"><b class="st-accent">${eur(bottom.res)}</b><span>${bottom.name}${bottom === busiest ? ' has the most visitors of any store, yet sits furthest below the line.' : ' sits furthest below the line.'}</span></div>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · 24 stores, 13-week averages; ordinary least squares</span><span>Motion · fit, then residuals (2 builds)</span></p>`,
};
