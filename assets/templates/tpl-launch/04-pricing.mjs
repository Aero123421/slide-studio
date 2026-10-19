// Template: Product launch · Pricing as a comparison table. Synthetic example content; replace data and copy.
// Four equal blocks on the grid (labels + three plans). The recommended plan sits in the middle with one green rule.
const ID = 'tpl-launch-pricing';
const C = n => 64 + 98 * (n - 1);      // x of column n (12 columns of 74 px, 24 px gutters)
const span = (a, b) => 98 * (b - a) + 74;
const eur = v => `€${v >= 10 ? v.toLocaleString('en-GB') : v.toFixed(2)}`;

// Prices per month in euros, excluding VAT. Features must match 02-features.mjs.
const plans = [
  { name: 'Starter', for: 'Up to 150 returns a month', price: 49, included: 150, extra: 0.40, exchange: false, grading: false, warehouses: '1', support: 'Email, next working day' },
  { name: 'Growth', for: '150 to 1,000 returns a month', price: 179, included: 1000, extra: 0.22, exchange: true, grading: false, warehouses: '3', support: 'Chat, within 4 hours', pick: true },
  { name: 'Scale', for: 'Over 1,000, or several warehouses', price: 490, included: 4000, extra: 0.14, exchange: true, grading: true, warehouses: 'Unlimited', support: 'Named manager, within 1 hour' },
];
const pick = plans.find(p => p.pick);
const yes = on => on ? 'Yes' : '<span class="ln-no" aria-hidden="true">—</span><span class="sr-only">Not included</span>';
const rows = [
  ['Returns included', p => p.included.toLocaleString('en-GB')],
  ['Each extra return', p => eur(p.extra)],
  ['Exchange first', p => yes(p.exchange)],
  ['Grade on arrival', p => yes(p.grading)],
  ['Warehouses', p => p.warehouses],
  ['Support', p => p.support],
];
const widths = [294, 294, 294, 270];   // four blocks of three columns; the 24 px gutter is each cell's right padding

export default {
  study: true,
  id: ID,
  title: `Pricing: ${plans.map(p => `${p.name} ${eur(p.price)}`).join(', ')} a month`,
  notes: 'Purpose: Let each buyer find their plan by monthly volume, see what the upgrade adds, and know which plan we recommend and why.\nModify: Edit plans (price, included returns, overage, features, limits, support) and the rows list; mark one plan with pick:true. The headline, the green rule and the title follow the data. Keep feature names identical to 02-features.\nInvariant: One row per attribute, identical across plans, so absence shows as a dash. Exactly one recommended plan, marked only by its middle position and the rule over its column. Currency, tax and billing terms in the note.\nStatic: No builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-launch ln-pricing',
  content: `<h2 class="ln-at ln-head" data-region="title" style="left:${C(1)}px;top:64px;width:${span(1, 10)}px">Most teams need ${pick.name}: ${pick.included.toLocaleString('en-GB')} returns a month for ${eur(pick.price)}</h2>
<table class="ln-at ln-table" data-region="primary" style="left:${C(1)}px;top:192px;width:${span(1, 12)}px">
<colgroup>${widths.map(w => `<col style="width:${w}px">`).join('')}</colgroup>
<thead><tr><td style="border-top:0"></td>${plans.map(p => `<th scope="col"${p.pick ? ' class="ln-pick"' : ''}><span class="ln-plan">${p.name}${p.pick ? '<span class="sr-only"> (recommended)</span>' : ''}</span><span class="ln-for">${p.for}</span></th>`).join('')}</tr></thead>
<tbody>
<tr class="ln-price"><th scope="row">Price per month</th>${plans.map(p => `<td><b>${eur(p.price)}</b></td>`).join('')}</tr>
${rows.map(([label, f]) => `<tr><th scope="row">${label}</th>${plans.map(p => `<td>${f(p)}</td>`).join('')}</tr>`).join('\n')}
</tbody></table>
<p class="ln-at ln-note" data-region="source" style="left:${C(1)}px;top:645px;width:${span(1, 12)}px">Every plan includes approve by rule and refund at first scan. Euros per month, excluding VAT; annual billing gives two months free. 1.x customers keep their price until renewal.</p>`,
};
