// Template: Parwell seed memorandum · Market. Synthetic example content; replace data and copy.
// Bottom-up sizing as a calculation table: kitchens × annual price = annual value, one row per
// tier, each with a bar on one shared linear scale. Every value is computed from `tiers`.
const ID = 'tpl-pitch-market';
const price = 300 * 12;                                  // USD per kitchen per year (list price $300 a month)
const tiers = [                                          // kitchens = count of locations, US and Canada
  { key: 'TAM', kitchens: 380000, who: 'Independent restaurants in the US and Canada that cook with fresh produce' },
  { key: 'SAM', kitchens: 142000, who: 'Of those, kitchens on a POS we already read, with a distributor that takes online orders', this: true },
  { key: 'SOM', share: 0.03, year: 2031, who: 'Our plan: 3% of SAM by 2031' },
];
tiers[2].kitchens = Math.round(tiers[1].kitchens * tiers[2].share);
for (const t of tiers) t.value = t.kitchens * price;

const usd = v => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : `$${Math.round(v / 1e6)}M`;
const usdShort = v => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(v < 1e8 ? 1 : 0)}M`;
const num = v => v.toLocaleString('en-US');
const barMax = 1054;                                     // px: bars span columns 2–12; TAM = full width
const bar = t => Math.max(2, Math.round(t.value / tiers[0].value * barMax));
const sam = tiers.find(t => t.this);                     // the tier the headline is about

const rows = tiers.map(t => `<tr class="${t.this ? 'is-this' : ''}">
    <td class="k">${t.key}</td><td class="who">${t.who}</td>
    <td>${num(t.kitchens)}</td><td><span class="op">×</span> $${num(price)}</td><td class="v"><span class="op">=</span> ${usdShort(t.value)}</td></tr>
  <tr class="barrow${t.this ? ' is-this' : ''}"><td></td><td class="bar" colspan="4"><span class="pp-bar" style="width:${bar(t)}px" aria-hidden="true"></span></td></tr>`).join('');

export default {
  study: true,
  id: ID,
  title: 'Market: bottom-up sizing as a calculation',
  notes: `Purpose: Size the market bottom-up so an investor can redo the arithmetic: who is counted, how many, at what price.\nModify: Edit \`price\` and the three \`tiers\` (kitchen counts and the one-clause definition of who is counted); SOM is a share of SAM by a stated year. Values, bars and the headline recompute.\nInvariant: Value = locations × price for every row; bars share one linear scale starting at zero (the SOM bar is meant to look small); SOM is labelled as a plan, not a forecast; the price matches the unit-economics page.\nStatic: Already static.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-pitch pp-market',
  content: `<div class="pp-run"><span>Parwell — Seed memorandum, October 2026</span><span>3</span></div>
<h1 class="pp-head" data-region="title">Kitchens we can connect to today are a ${usd(sam.value)}-a-year market</h1>
<p class="pp-ex" data-region="support"><b>Exhibit 2</b>Market size, bottom-up: kitchens × list price a year</p>
<table class="pp-calc" data-region="primary">
  <colgroup><col style="width:98px"><col style="width:490px"><col style="width:172px"><col style="width:196px"><col style="width:196px"></colgroup>
  <thead><tr><th>Tier</th><th>Who is counted</th><th>Kitchens</th><th>× Price a year</th><th>= Annual value</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<p class="pp-source" data-region="source">Kitchen counts: Parwell estimates, 2026 (illustrative). Price: $300 a kitchen a month, billed annually, as paid by today’s customers.</p>`,
};
