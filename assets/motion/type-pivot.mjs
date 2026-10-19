// Motion study · Pivot a typographic hierarchy — the claim opens as display type, then
// shrinks into the left rail as the chart takes the page. The same <h1> moves (one
// transform computed from both layouts); its line breaks never change.
// Builds: 1 claim pivots to the rail while the evidence rises, 2 the crossing and the rail numbers.
import { lineChart, statesAttr, fmt } from '../runtime/figure.mjs';

const quarters = ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
// Cost per online order, € (illustrative apparel retailer): last-mile delivery vs handling returns.
const delivery = [4.62, 4.55, 4.49, 4.41, 4.30, 4.22, 4.15, 4.06, 3.98, 3.93, 3.86, 3.80];
const returns = [2.12, 2.25, 2.41, 2.58, 2.79, 3.01, 3.24, 3.47, 3.71, 3.96, 4.17, 4.35];
const cross = returns.findIndex((r, i) => r > delivery[i]); // first quarter returns cost more
const last = quarters.length - 1;
const eur = v => fmt(v, { digits: 2, prefix: '€' });

// Layout: final headline box in the rail, and the display size it starts from.
const rail = { x: 64, y: 176, w: 312, size: 34 };
const opening = { x: 64, y: 214, scale: 2.45 }; // top-left and scale of the opening statement

export function figure(theme = 'css') {
  return lineChart({
    id: 'motion-type-pivot-fig', theme, width: 800, height: 482,
    title: `Cost per online order, delivery and returns handling, ${quarters[0]} to ${quarters[last]}`,
    desc: `Delivery fell from ${eur(delivery[0])} to ${eur(delivery[last])} per order while returns handling rose from ${eur(returns[0])} to ${eur(returns[last])}; returns became the larger cost in ${quarters[cross]}.`,
    x: quarters, xEvery: 4, unit: 'Cost per online order', format: { digits: 2, prefix: '€' },
    series: [{ name: 'Delivery', values: delivery }, { name: 'Returns', values: returns }],
    highlight: 'Returns', yDomain: [0, 5.4], yTicks: 6, // headroom keeps the unit clear of the top tick
    annotate: [{ series: 'Returns', at: quarters[cross], text: `${quarters[cross]}: returns overtake delivery`, dx: -150, dy: -110, width: 190, step: 2, motion: 'lift' }],
  });
}

// From the opening statement (state 0) to the rail headline (state 1): same element, same words.
const pivot = {
  0: { translate: `${opening.x - rail.x}px ${opening.y - rail.y}px`, scale: String(opening.scale) },
  1: { translate: '0px 0px', scale: '1' },
};

export default {
  study: true,
  id: 'motion-type-pivot',
  title: 'Type pivot: display claim becomes the rail headline',
  className: 'st st--left cs-sales-kpi',
  notes: 'Purpose: Open on the claim as display type, then turn it into the rail headline as the evidence takes over the page, so the hierarchy follows what the audience should read.\nModify: Replace `delivery` and `returns`; the crossing quarter and the rail numbers recompute. Keep the claim short enough to fit the rail in three or four lines; `opening.scale` sets how dominant it starts.\nInvariant: One <h1> moves by translate and scale from a computed origin; its words and line breaks never change. The chart rises only when the claim gives way.\nStatic: The final build is a left-rail page: claim, two numbers, and the chart with the crossing marked.',
  sources: [{ type: 'original-example', file: 'assets/motion/type-pivot.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="left:${rail.x}px;top:${rail.y}px;width:${rail.w}px;font-size:${rail.size}px;line-height:1.12;transform-origin:0 0;text-wrap:balance" data-states="${statesAttr(pivot)}" data-duration="900" data-easing="smooth"><em>Returns</em> now cost us more per order than delivery</h1>
<div class="st-rail" style="top:368px;justify-content:flex-start" data-region="support" data-step="2">
  <div class="st-kpi" data-step="2" data-motion="reveal"><b class="st-accent">${eur(returns[last])}</b><span>returns handling per order, ${quarters[last]}, up from ${eur(returns[0])}</span></div>
  <div class="st-kpi" data-step="2" data-motion="reveal" data-delay="150"><b>${eur(delivery[last])}</b><span>delivery per order, down from ${eur(delivery[0])}</span></div>
</div>
<figure class="st-fig" data-region="primary" data-step="1" data-motion="reveal" data-delay="450" data-duration="650">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · online orders, all channels, cost per order shipped</span><span>Motion · display claim pivots into the rail (2 builds)</span></p>`,
};
