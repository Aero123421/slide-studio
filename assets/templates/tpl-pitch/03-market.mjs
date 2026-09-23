// Template: Tallyleaf investor pitch · Market sizing (TAM/SAM/SOM). Synthetic example content; replace data and copy.
// Bottom-up sizing: every value = locations × annual contract value. Circle AREA is proportional to value.
const P = 'tpl-pitch-market';
const acv = 9000;                               // USD per location per year ($750 / month)
const tiers = [
  {key: 'TAM', name: 'Total addressable', locations: 660000, basis: 'US & Canada restaurants with a back-of-house kitchen',
   fill: `url(#${P}-hatch)`, stroke: '#1f1a16', ink: '#1f1a16'},
  {key: 'SAM', name: 'Serviceable', locations: 210000, basis: 'independent full-service venues already on a cloud POS we integrate with',
   fill: '#f5d6c6', stroke: '#1f1a16', ink: '#1f1a16'},
  {key: 'SOM', name: 'Obtainable by 2031', locations: 16800, basis: '8% of serviceable locations, the share our five-year plan assumes',
   fill: '#d8432a', stroke: '#a93220', ink: '#fbf5ea'}
].map(t => ({...t, value: t.locations * acv}));

const money = v => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${Math.round(v / 1e6)}M`;
const count = n => n >= 1000 ? `${Math.round(n / 100) / 10}k`.replace('.0k', 'k') : String(n);

// Geometry: bottom-tangent circles, r ∝ √value so area encodes the value honestly.
const cx = 632, base = 668, R = 228;
const circles = tiers.map(t => ({...t, r: R * Math.sqrt(t.value / tiers[0].value)}));
const rowY = [196, 382, 566];                     // label rail on the right (top of each row block)
const railX = 884;
const shapes = circles.map(c => `<circle cx="${cx}" cy="${(base - c.r).toFixed(1)}" r="${c.r.toFixed(1)}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.8"/>`).join('');
const inner = circles.map((c, i) => {
  const y = i < 2 ? base - 2 * c.r + 34 : base - c.r + 6;
  return `<text x="${cx}" y="${y.toFixed(1)}" text-anchor="middle" style="font:700 16px var(--tp-sans);letter-spacing:.14em;fill:${c.ink}">${c.key}</text>`;
}).join('');
// Leaders: from the circle at 45° (upper right) — or the right edge for the smallest — to the row label.
const leaders = circles.map((c, i) => {
  const a = i < 2 ? -Math.PI / 4 : 0;
  const ax = cx + c.r * Math.cos(a), ay = base - c.r + c.r * Math.sin(a);
  const ty = rowY[i] + 9, kx = railX - 30;
  return `<path d="M${ax.toFixed(1)} ${ay.toFixed(1)} H${kx - 14} Q${kx} ${ay.toFixed(1)} ${kx} ${(ay + Math.sign(ty - ay) * 14).toFixed(1)} V${ty} H${railX - 12}" fill="none" stroke="#1f1a16" stroke-width="1.3"/>
    <circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="4" fill="#1f1a16"/>`;
}).join('');
const rows = circles.map((c, i) => `<div class="tp-mkt-row" style="top:${rowY[i]}px">
    <div class="tp-label"><i style="background:${i === 0 ? '#f8e6b8' : c.fill}"></i>${c.key} · ${c.name}</div>
    <div class="tp-num"${i === 2 ? ' style="color:#d8432a"' : ''}>${money(c.value)}</div>
    <p><b>${count(c.locations)} locations × $${acv / 1000}k</b> — ${c.basis}</p>
  </div>`).join('');

export default {
  study: true,
  id: 'tpl-pitch-market',
  title: 'Market sizing — TAM, SAM, SOM',
  notes: 'Purpose: Size the market bottom-up so an investor can check every number.\nModify: Edit locations and ACV in the tiers array; values, circle areas, labels and leaders recompute.\nInvariant: Circle area ∝ value (radius uses √); each value shows its own multiplication; SOM is a stated plan assumption, not a forecast.\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-pitch tp-market',
  content: `<div class="tp-wrap">
  <div class="tp-head"><div class="tp-brand"><svg viewBox="-6 -6 112 118" role="img" aria-labelledby="${P}-mk"><title id="${P}-mk">Tallyleaf mark</title><g transform="rotate(-36 50 50)"><path d="M50 3 C84 26 84 74 50 97 C16 74 16 26 50 3Z" fill="#2f6b4f"/><g stroke="#fbf5ea" stroke-width="6" stroke-linecap="round"><line x1="37" y1="33" x2="37" y2="67"/><line x1="45.5" y1="31" x2="45.5" y2="69"/><line x1="54.5" y1="31" x2="54.5" y2="69"/><line x1="63" y1="33" x2="63" y2="67"/><line x1="30" y1="62" x2="70" y2="38"/></g></g></svg>tallyleaf</div><div class="tp-sec"><b>02</b><i></i>Market</div></div>
  <div class="tp-mkt-fig" data-region="primary">
    <svg viewBox="380 190 500 490" role="img" aria-labelledby="${P}-t ${P}-d">
      <title id="${P}-t">Nested market circles, area proportional to annual value</title>
      <desc id="${P}-d">${circles.map(c => `${c.key} ${money(c.value)}`).join(', ')}. All computed as locations times $${acv.toLocaleString('en-US')} annual contract value.</desc>
      <defs><pattern id="${P}-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="#f8e6b8"/><line x1="0" y1="0" x2="0" y2="10" stroke="#e8c877" stroke-width="3"/></pattern></defs>
      ${shapes}${leaders}${inner}
    </svg>
  </div>
  <h1 class="tp-title" style="position:absolute;left:64px;top:92px;width:1100px" data-region="title">Independent kitchens alone are a <em>${money(tiers[1].value)}</em> software market.</h1>
  <p class="tp-body" style="position:absolute;left:64px;top:206px;width:318px" data-region="support">Sized bottom-up from venue counts, not from a share of total food spend.</p>
  <div class="tp-mkt-method" style="top:330px;width:318px" data-region="support">
    <p><b style="color:#1f1a16">Price basis.</b> $750 per location per month, billed annually — the list price paid by today’s customers.</p>
    <p><b style="color:#1f1a16">Why SAM is narrower.</b> Forecasts need live sales data, so we count only venues on a POS we already read.</p>
    <p><b style="color:#1f1a16">Left out.</b> Chains above 50 sites, which buy through central procurement teams.</p>
  </div>
  ${rows}
  <p class="tp-source" data-region="source">Illustrative data · venue counts are synthetic</p>
</div>`
};
