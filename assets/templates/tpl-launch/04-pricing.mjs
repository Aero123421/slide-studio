// Template: Product launch · Pricing tiers with computed unit cost. Synthetic example content; replace data and copy.
// Unit-cost bars share one zero and one scale across the three plans: price / included returns.
const P = 'tpl-launch-pricing';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const money = v => v >= 10 ? `$${v.toLocaleString('en-US')}` : `$${v.toFixed(2)}`;

// Keep in step with the plan tags on 02-features.mjs.
const featureNames = ['Instant QR labels', 'Rules that decide', 'Refund timing', 'Exchange first', 'Restock sync', 'Fraud signals'];
const tiers = [
  { name: 'Starter', for: 'For shops writing their first returns policy', price: 49, included: 150, extra: 0.40, has: [1, 1, 1, 0, 0, 0] },
  { name: 'Growth', for: 'For teams taking routine returns off their plate', price: 149, included: 800, extra: 0.25, has: [1, 1, 1, 1, 1, 0], hot: 'Most chosen in beta' },
  { name: 'Scale', for: 'For brands with several warehouses or channels', price: 449, included: 3000, extra: 0.15, has: [1, 1, 1, 1, 1, 1] }
];
const unit = t => t.price / t.included;
const maxUnit = Math.max(...tiers.map(unit));

const tick = (on, hot) => on
  ? `<svg viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="9" fill="${hot ? '#8b76ff' : '#ece8ff'}"/><path d="M5 9.3l2.7 2.7L13 6.5" fill="none" stroke="${hot ? '#fff' : '#5a3ff5'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  : `<svg viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="8.2" fill="none" stroke="${hot ? '#5b5790' : '#cfcbe0'}" stroke-width="1.4"/><path d="M6 9h6" stroke="${hot ? '#7d78b0' : '#b3aecb'}" stroke-width="1.6" stroke-linecap="round"/></svg>`;

const cards = tiers.map((t, i) => {
  const w = (unit(t) / maxUnit) * 100;
  const list = featureNames.map((f, j) => `<li class="${t.has[j] ? '' : 'is-off'}">${tick(t.has[j], !!t.hot)}${esc(f)}</li>`).join('');
  return `<section class="ln-tier${t.hot ? ' is-hot' : ''}">
  <div class="ln-tier-name"><span>${esc(t.name)}</span>${t.hot ? `<span class="ln-badge">${esc(t.hot)}</span>` : ''}</div>
  <p class="ln-tier-for">${esc(t.for)}</p>
  <div class="ln-price"><strong class="ln-num">${money(t.price)}</strong><span>per month</span></div>
  <p class="ln-incl ln-num">${t.included.toLocaleString('en-US')} returns included, then ${money(t.extra)} each</p>
  <div class="ln-unit">
    <p><span>Cost per included return</span><b class="ln-num">${money(unit(t))}</b></p>
    <svg viewBox="0 0 100 10" preserveAspectRatio="none" role="img" aria-labelledby="${P}-u${i}"><title id="${P}-u${i}">${esc(t.name)}: ${money(unit(t))} per included return</title>
      <rect width="100" height="10" rx="5" fill="${t.hot ? '#2d2862' : '#f1eff8'}"/><rect width="${w.toFixed(2)}" height="10" rx="5" fill="${t.hot ? '#ffc24b' : '#8b76ff'}" data-qa-mark="bar"/></svg>
  </div>
  <ul class="ln-list">${list}</ul>
</section>`;
}).join('');

const lock = `<div class="ln-lock" aria-hidden="true"><svg viewBox="0 0 34 34"><rect width="34" height="34" rx="10" fill="#5a3ff5"/><path d="M12 12h8.5a6 6 0 0 1 0 12H14" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M15.5 8l-4 4 4 4" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11.5" cy="24" r="2.2" fill="#ffc24b"/></svg>Fernhook 2.0</div>`;

export default {
  study: true,
  id: 'tpl-launch-pricing',
  title: 'Pricing: three plans priced by monthly returns',
  notes: 'Purpose: Let each buyer find their plan by volume and see what the upgrade adds.\nModify: Edit the tiers array (price, included volume, overage, feature flags). Unit-cost bars and labels recompute from price / included.\nInvariant: Bars share a zero and one scale. Feature rows are identical across plans, so absence is shown, not hidden. Plan availability must match the feature page.\nStatic: No builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-launch ln-pricing',
  content: `<div class="ln-page" style="background:linear-gradient(180deg,#faf9f6 0%,#f3f1fb 100%)">${lock}
<div class="ln-abs" style="left:72px;top:54px;width:700px">
  <p class="ln-kicker">Pricing from 23 September</p>
  <h2 class="ln-h2" data-region="title" style="margin-top:12px">Pick a plan by how many returns you handle each month</h2>
</div>
<p class="ln-abs ln-lede" style="left:830px;top:84px;width:380px;font-size:18px">Annual billing includes two months free. Existing customers keep their current price until their renewal date.</p>
<div class="ln-tiers" data-region="primary" style="top:206px;bottom:50px">${cards}</div>
<p class="ln-source" style="bottom:16px" data-region="source">Illustrative pricing in USD, excluding tax · replace with your price list</p>
</div>`
};
