// Composition study · Closing experiment — the last page of a deck ends on the test the evidence
// has earned. Today's two depots fill the diagonal of a yard × route grid, so the two causes cannot
// be told apart; the proposed swap fills the empty cells, each with the result each cause predicts,
// and each outcome is tied to the decision it triggers. Everything is computed from `depots`.
import { svgRoot, el, textLines, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const ID = 'composition-closing-experiment';
// Battery fade: % of capacity lost per 10,000 km, median bus of each depot, last 18 months (illustrative).
const depots = {
  warm: { name: 'Riverside', yard: 'Heated yard', night: 4, routes: 'short', km: 175, fade: 1.9, buses: 42 },
  cold: { name: 'Northfield', yard: 'Unheated yard', night: -6, routes: 'long', km: 212, fade: 4.0, buses: 38 },
};
const test = { perDepot: 8, weeks: 12, checkEvery: 2, decision: '4 March 2027' };
const decisions = {
  yard: { cause: 'cold charging', act: 'heat Northfield’s charging bays, £1.4 m' },
  route: { cause: 'deep discharge', act: 're-block 9 long routes to keep packs above 30%' },
};

// derived values
const ratio = depots.cold.fade / depots.warm.fade;
const pct = v => `${fmt(v, { digits: 1 })}%`;
const deg = v => `${fmt(v, { sign: true })} °C`;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 640, H = 420;
  const gx = 150, gy = 66, cw = (W - gx) / 2, ch = (H - gy - 10) / 2; // grid origin and cell size
  const cols = [depots.warm, depots.cold].map(d => ({ routes: d.routes, km: d.km }));
  const rows = [depots.warm, depots.cold];
  const parts = [textLines(['capacity lost', 'per 10,000 km'], { x: 0, y: 6, size: 16, valign: 'top', lineHeight: 1.3, fill: t.c('muted') })];
  cols.forEach((c, j) => {
    parts.push(textLines([`${c.routes[0].toUpperCase() + c.routes.slice(1)} routes`], { x: gx + j * cw + 18, y: 6, size: 18, valign: 'top', fill: t.c('ink'), weight: 650 }));
    parts.push(textLines([`${c.km} km a day`], { x: gx + j * cw + 18, y: 32, size: 16, valign: 'top', fill: t.c('muted') }));
  });
  rows.forEach((r, i) => {
    parts.push(textLines([r.yard], { x: 0, y: gy + i * ch + 22, size: 18, valign: 'top', fill: t.c('ink'), weight: 650 }));
    parts.push(textLines([`${deg(r.night)} nights`], { x: 0, y: gy + i * ch + 48, size: 16, valign: 'top', fill: t.c('muted') }));
  });
  // cells: today's depots on the diagonal, the swap off it
  rows.forEach((r, i) => cols.forEach((c, j) => {
    const x = gx + j * cw, y = gy + i * ch, today = r.routes === c.routes;
    if (today) {
      parts.push(el('rect', { x: x + 4, y: y + 4, width: cw - 8, height: ch - 8, fill: t.c('surface') }));
      parts.push(textLines([pct(r.fade)], { x: x + 22, y: y + 26, size: 40, valign: 'top', fill: t.c('ink'), weight: 650, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
      parts.push(textLines([`${r.name} today`, `${r.buses} buses`], { x: x + 22, y: y + 84, size: 16, valign: 'top', lineHeight: 1.35, fill: t.c('muted') }));
    } else {
      const from = rows.find(q => q.routes !== c.routes); // the buses that move onto these routes
      const ifYard = r.fade, ifRoute = rows.find(q => q.routes === c.routes).fade;
      parts.push(el('rect', { x: x + 4, y: y + 4, width: cw - 8, height: ch - 8, fill: 'none', stroke: t.c('accent'), 'stroke-width': 2.5 }));
      parts.push(textLines([`${test.perDepot} ${from.name} buses`], { x: x + 22, y: y + 26, size: 18, valign: 'top', fill: t.c('accent'), weight: 700 }));
      parts.push(textLines([`if the yard matters: ${pct(ifYard)}`], { x: x + 22, y: y + 66, size: 17, valign: 'top', fill: t.c('ink') }));
      parts.push(textLines([`if the route matters: ${pct(ifRoute)}`], { x: x + 22, y: y + 94, size: 17, valign: 'top', fill: t.c('ink') }));
    }
  }));
  return svgRoot({ id: `${ID}-fig`, width: W, height: H, theme: t,
    title: 'Yard temperature by route length: today’s depots and the proposed route swap',
    desc: `Today ${depots.warm.name} (heated yard, short routes) loses ${pct(depots.warm.fade)} of capacity per 10,000 km and ${depots.cold.name} (unheated yard, long routes) ${pct(depots.cold.fade)}. The swap puts ${test.perDepot} buses from each depot on the other depot's routes; if the yard matters they keep their depot's fade, if the route matters they take the fade of their new routes.` },
  parts);
}

export default {
  study: true,
  id: ID,
  title: 'Closing experiment: end on the test that separates the remaining explanations',
  className: 'st cs-strategy-dark cmp-closing',
  notes: 'Purpose: Use as the last page when the evidence leaves two live explanations. Show why the data so far cannot separate them (they move together), the smallest test that would, what each explanation predicts for it, and which decision each outcome triggers. The audience leaves with a dated next step instead of a summary.\nModify: Replace `depots` (the two confounded conditions and the outcome), `test` and `decisions`; the grid, the predictions in the new cells and the headline ratio recompute. The predictions here are the two pure cases; say so if a mix is likely.\nInvariant: The confound is drawn (today\'s cases on the diagonal, empty cells off it); the test is exactly the empty cells and carries the one accent; every outcome is paired with its decision on the same row; the page ends with size, duration and a decision date.\nStatic: Already static.',
  sources: [{ type: 'original-example', file: `assets/compositions/${ID}.mjs` }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" data-region="title">Next: swap routes between the two depots for ${test.weeks}&nbsp;weeks, and see whether the fade follows the yard or the route</h1>
<figure class="cmp-ce-fig" data-region="primary">${figure()}</figure>
<div class="cmp-ce-rail" data-region="support">
  <p class="cmp-ce-why">${depots.cold.name} packs lose capacity <b>${fmt(ratio, { digits: 1 })}&nbsp;times</b> as fast. Its yard is colder and its routes are longer, so the data so far cannot say which matters.</p>
  <dl class="cmp-ce-dec">
    <div><dt>Fade follows the yard</dt><dd>The cause is ${decisions.yard.cause}: ${decisions.yard.act}.</dd></div>
    <div><dt>Fade follows the route</dt><dd>The cause is ${decisions.route.cause}: ${decisions.route.act}.</dd></div>
  </dl>
  <p class="cmp-ce-when">${test.perDepot * 2} buses for ${test.weeks}&nbsp;weeks, capacity checked every ${test.checkEvery}&nbsp;weeks. Decision on ${test.decision}.</p>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · battery management logs, ${depots.warm.buses + depots.cold.buses} buses, last 18 months; fade = % of capacity lost per 10,000 km</span><span>Closing experiment · crossover design</span></p>`,
};
