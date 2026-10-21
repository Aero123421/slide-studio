// Template: Parwell seed memorandum · Unit economics. Synthetic example content; replace data and copy.
// Left: one kitchen's monthly P&L and its acquisition cost. Right: expected cumulative
// contribution per signed kitchen against that cost, month by month; the payback month is
// where the line crosses. The table, the curve, the marker and the headline share `unit`.
import { lineChart, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-pitch-unit-economics';
const unit = {
  price: 300,                                    // USD per kitchen per month (list price)
  costs: [                                       // USD per kitchen per month, cost to serve
    { name: 'data feeds', v: 26 },               // POS and distributor connections
    { name: 'compute', v: 12 },                  // forecasting and hosting
    { name: 'support', v: 22 },
  ],
  cac: 2400,                                     // USD per new kitchen: sales $1,650 + onboarding $750
  churn: 0.012,                                  // monthly logo churn, Oct 2025 – Sep 2026 (traction page)
  ramp: [0.6, 0.85],                             // share of full contribution in months 1–2 (onboarding credit)
  horizon: 24,                                   // months shown
};
const cost = unit.costs.reduce((s, c) => s + c.v, 0);
const contribution = unit.price - cost;
const margin = contribution / unit.price;
// Expected contribution of one signed kitchen in month m: ramp share × survival to month m.
const cum = [0];
for (let m = 1; m <= unit.horizon; m++) cum.push(cum[m - 1] + contribution * (unit.ramp[m - 1] ?? 1) * (1 - unit.churn) ** (m - 1));
const payback = cum.findIndex(v => v >= unit.cac);
const multiple = cum[unit.horizon] / unit.cac;
const usd = v => `$${fmt(Math.round(v), { digits: 0 })}`;

const figure = lineChart({
  id: `${ID}-fig`, width: 662, height: 400, fontSize: 17,
  title: 'Expected cumulative contribution per signed kitchen against acquisition cost, by month',
  desc: `Contribution of ${usd(contribution)} a month, ramped in months 1–2 and reduced by ${fmt(unit.churn * 100, { digits: 1 })}% monthly churn, passes the ${usd(unit.cac)} acquisition cost in month ${payback} and reaches ${usd(cum[unit.horizon])} by month ${unit.horizon}.`,
  // Months as ordered categories so the axis can tick every six months (x(i) = month i).
  x: cum.map((_, m) => String(m)), xEvery: 6,
  series: [{ name: 'Cumulative contribution', values: cum, color: 'var(--ss-ink)' }],
  endLabels: false, markers: 'none', strokeWidth: 2.5,
  refLines: [{ y: unit.cac, label: `Acquisition cost ${usd(unit.cac)}`, labelPos: 'start' }],
  yDomain: [0, 6000], yTicks: 6, unit: 'Cumulative contribution per kitchen, $',
  xLabel: 'Months since the kitchen signed',
  format: { digits: 0, prefix: '$' },
  extra: ({ x, y }) => {
    const px = x(payback), py = y(cum[payback]), base = y(0);
    const ex = x(unit.horizon), ey = y(cum[unit.horizon]);
    return `<g class="pp-payback">
      <line x1="${px}" x2="${px}" y1="${py}" y2="${base}" stroke="var(--ss-accent)" stroke-width="1.5"/>
      <circle cx="${px}" cy="${py}" r="6" fill="var(--ss-accent)" stroke="var(--ss-paper)" stroke-width="2"/>
      <text x="${px + 14}" y="${py + 44}" font-size="17" font-weight="600" style="fill:var(--pp-accent-ink)">Paid back in month ${payback}</text>
      <circle cx="${ex}" cy="${ey}" r="4.5" fill="var(--ss-ink)"/>
      <text x="${ex}" y="${ey - 16}" font-size="17" text-anchor="end" style="fill:var(--ss-ink)">${usd(cum[unit.horizon])} by month ${unit.horizon}: ${fmt(multiple, { digits: 1 })}× the acquisition cost</text>
    </g>`;
  },
});

const row = (label, value, cls = '') => `<tr class="${cls}"><td>${label}</td><td>${value}</td></tr>`;
export default {
  study: true,
  id: ID,
  title: 'Unit economics: payback on acquisition cost',
  notes: `Purpose: Show how one customer makes money and how long it takes to repay what it cost to win.\nModify: Edit \`unit\` (price, cost lines, CAC, churn, onboarding ramp). The P&L column, the curve, the payback marker, the 24-month multiple and the headline recompute. Use the churn you report on the traction page.\nInvariant: The curve is cumulative and churn-adjusted; the CAC line and the curve share one axis that starts at zero; the payback month is computed, not typed; the P&L lines add up.\nStatic: Already static.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-pitch pp-unit',
  content: `<div class="pp-run"><span>Parwell — Seed memorandum, October 2026</span><span>4</span></div>
<h1 class="pp-head" data-region="title">A new kitchen pays back its ${usd(unit.cac)} acquisition cost in month ${payback}</h1>
<p class="pp-ex" data-region="support"><b>Exhibit 3</b>One kitchen: monthly economics and payback</p>
<table class="pp-pl" data-region="support">
  ${row('Price', usd(unit.price))}
  ${row('Cost to serve', `−${usd(cost)}`)}
  <tr class="sub"><td colspan="2">${unit.costs.map(c => `${c.name} ${usd(c.v)}`).join(', ').replace(/^./, c => c.toUpperCase())}</td></tr>
  ${row(`Contribution, ${fmt(margin * 100, { digits: 0 })}% margin`, usd(contribution), 'total')}
  ${row('Acquisition cost, once', usd(unit.cac), 'gap')}
  ${row('Monthly churn', `${fmt(unit.churn * 100, { digits: 1 })}%`)}
  ${row('Payback', `month ${payback}`, 'is-this')}
</table>
<figure class="pp-ue-fig" data-region="primary">${figure}</figure>
<p class="pp-source" data-region="source">Model: list price, 2026 cost to serve, onboarding credit in months 1–2 (${unit.ramp.map(r => `${r * 100}%`).join(', ')} of contribution), ${fmt(unit.churn * 100, { digits: 1 })}% monthly churn as observed Oct 2025 – Sep 2026.</p>`,
};
