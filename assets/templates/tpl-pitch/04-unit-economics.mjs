// Template: Tallyleaf investor pitch · Business model & unit economics. Synthetic example content; replace data and copy.
// Inputs below drive the price bar, the payback curve and every KPI in the rail.
const P = 'tpl-pitch-unit-economics';
const price = 750;                                    // USD per location per month
const costs = [                                       // cost to serve per location per month
  {name: 'POS & data fees', v: 70}, {name: 'Support', v: 60}, {name: 'Hosting', v: 35}
];
const cac = 6300;                                     // blended acquisition + onboarding cost per location
const churn = 0.016;                                  // monthly logo churn
const cost = costs.reduce((s, c) => s + c.v, 0);
const gp = price - cost, gm = gp / price;
const q = 1 - churn;
const cum = m => gp * (1 - Math.pow(q, m)) / churn - cac;   // survival-weighted cumulative GP minus CAC
const payback = Math.log(1 - cac * churn / gp) / Math.log(q);
const ltv = gp / churn;

// --- price bar (one month, one location) ---
const bw = 760, bx = 0, sx = v => v / price * bw;
let acc = 0;
const segs = [{name: 'Gross profit', v: gp, fill: '#2f6b4f', ink: '#fbf5ea'}, ...costs.map((c, i) => ({...c, fill: ['#e2a58f', '#ecc2b1', '#f5dccf'][i], ink: '#1f1a16'}))];
const bar = segs.map((s, i) => {
  const x = bx + sx(acc); acc += s.v; const w = sx(s.v);
  const label = i === 0
    ? `<text x="${x + 14}" y="62" style="font:700 17px var(--tp-sans);fill:${s.ink}">Gross profit $${s.v}</text>`
    : '';
  return `<rect x="${x.toFixed(1)}" y="34" width="${w.toFixed(1)}" height="44" fill="${s.fill}"/>${label}`;
}).join('');
const costStart = bx + sx(gp);
const barSvg = `<svg viewBox="0 0 760 92" role="img" aria-labelledby="${P}-bt ${P}-bd"><title id="${P}-bt">Monthly price per location split into gross profit and cost to serve</title>
  <desc id="${P}-bd">$${price} price: $${gp} gross profit, then ${costs.map(c => `${c.name} $${c.v}`).join(', ')}.</desc>
  <text x="0" y="22" class="tp-sv-lab" style="letter-spacing:.08em">$${price} / LOCATION / MONTH</text>
  ${bar}
  <text x="${bw}" y="22" text-anchor="end" class="tp-sv-small">Cost to serve $${cost}: ${costs.map(c => `${c.name} $${c.v}`).join(' · ')}</text>
</svg>`;

// --- payback curve ---
const W = 760, H = 300, L = 64, Rr = 736, T = 26, B = 262;
const months = 36, yMin = -8000, yMax = 12000;
const x = m => L + m / months * (Rr - L), y = v => B - (v - yMin) / (yMax - yMin) * (B - T);
const pts = Array.from({length: months + 1}, (_, m) => [x(m), y(cum(m))]);
const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
const area = `${line}L${x(months)} ${y(0)}L${x(0)} ${y(0)}Z`;
const yt = [-5000, 0, 5000, 10000].map(v => `<line x1="${L}" x2="${Rr}" y1="${y(v)}" y2="${y(v)}" stroke="${v === 0 ? '#1f1a16' : '#e2d6c1'}" stroke-width="${v === 0 ? 1.5 : 1}"/>
  <text x="${L - 10}" y="${y(v) + 5}" text-anchor="end" class="tp-sv-axis">${v < 0 ? '−' : ''}$${Math.abs(v / 1000)}k</text>`).join('');
const xt = [0, 6, 12, 18, 24, 30, 36].map(m => `<text x="${x(m)}" y="${B + 24}" text-anchor="middle" class="tp-sv-axis">${m}</text>`).join('');
const px = x(payback), py = y(0);
const chartSvg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${P}-ct ${P}-cd"><title id="${P}-ct">Cumulative gross profit per location after acquisition cost</title>
  <desc id="${P}-cd">Starts at minus $${cac.toLocaleString('en-US')}, crosses zero at month ${payback.toFixed(1)} and reaches $${(cum(36) / 1000).toFixed(1)}k by month 36, net of ${(churn * 100).toFixed(1)}% monthly churn.</desc>
  <defs>
    <clipPath id="${P}-neg"><rect x="${L}" y="${y(0)}" width="${Rr - L}" height="${B - y(0) + 2}"/></clipPath>
    <clipPath id="${P}-pos"><rect x="${L}" y="${T - 4}" width="${Rr - L}" height="${y(0) - T + 4}"/></clipPath>
  </defs>
  ${yt}
  <path d="${area}" fill="#f5d6c6" clip-path="url(#${P}-neg)"/>
  <path d="${area}" fill="#d7e6d6" clip-path="url(#${P}-pos)"/>
  <path d="${line}" fill="none" stroke="#1f1a16" stroke-width="2.6" stroke-linejoin="round"/>
  <line x1="${px}" x2="${px}" y1="${T + 6}" y2="${B}" stroke="#1f1a16" stroke-dasharray="3 4"/>
  <circle cx="${px}" cy="${py}" r="7" fill="#f2bf4b" stroke="#1f1a16" stroke-width="2"/>
  <text x="${px + 12}" y="${T + 20}" style="font:700 17px var(--tp-sans);fill:#1f1a16">Payback · month ${payback.toFixed(1)}</text>
  <text x="${x(3)}" y="${y(-5600)}" style="font:600 15px var(--tp-sans);fill:#a93220">CAC $${(cac / 1000).toFixed(1)}k</text>
  <text x="${x(35.5)}" y="${y(cum(36)) - 14}" text-anchor="end" style="font:600 15px var(--tp-sans);fill:#2f6b4f">+$${(cum(36) / 1000).toFixed(1)}k by month 36</text>
  ${xt}
  <text x="${Rr}" y="${B + 46}" text-anchor="end" class="tp-sv-small">Months since signing →</text>
  <text x="${L - 54}" y="${T - 2}" class="tp-sv-small">Cumulative gross profit − CAC</text>
</svg>`;

const kpis = [
  {k: 'Price', s: 'per location, billed annually', v: `$${price}`},
  {k: 'Gross margin', s: `after $${cost} cost to serve`, v: `${Math.round(gm * 100)}%`},
  {k: 'CAC', s: 'sales + onboarding, blended', v: `$${(cac / 1000).toFixed(1)}k`},
  {k: 'Payback', s: 'churn-adjusted', v: `${payback.toFixed(1)} mo`, key: true},
  {k: 'LTV / CAC', s: `LTV $${(ltv / 1000).toFixed(1)}k at ${(churn * 100).toFixed(1)}% churn`, v: `${(ltv / cac).toFixed(1)}×`, key: true}
];

export default {
  study: true,
  id: 'tpl-pitch-unit-economics',
  title: 'Business model and unit economics',
  notes: 'Purpose: Show how one location makes money and how fast it repays its acquisition cost.\nModify: Edit price, costs, cac and churn at the top; the bar, curve, payback marker and KPI rail recompute.\nInvariant: Payback and LTV use the same churn; the curve starts at −CAC; margins derive from the listed costs.\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-pitch tp-unit',
  content: `<div class="tp-wrap">
  <div class="tp-head"><div class="tp-brand"><svg viewBox="-6 -6 112 118" role="img" aria-labelledby="${P}-mk"><title id="${P}-mk">Tallyleaf mark</title><g transform="rotate(-36 50 50)"><path d="M50 3 C84 26 84 74 50 97 C16 74 16 26 50 3Z" fill="#2f6b4f"/><g stroke="#fbf5ea" stroke-width="6" stroke-linecap="round"><line x1="37" y1="33" x2="37" y2="67"/><line x1="45.5" y1="31" x2="45.5" y2="69"/><line x1="54.5" y1="31" x2="54.5" y2="69"/><line x1="63" y1="33" x2="63" y2="67"/><line x1="30" y1="62" x2="70" y2="38"/></g></g></svg>tallyleaf</div><div class="tp-sec"><b>03</b><i></i>Business model</div></div>
  <h1 class="tp-title tp-ue-title" data-region="title">Each new location repays its acquisition cost in <em>under a year</em>.</h1>
  <div class="tp-ue-pl" data-region="support">${barSvg}</div>
  <div class="tp-ue-chart" data-region="primary">${chartSvg}</div>
  <aside class="tp-ue-rail" data-region="support">
    <p class="tp-label">Per location</p>
    ${kpis.map(k => `<div class="tp-ue-kpi${k.key ? ' is-key' : ''}"><p>${k.k}<span>${k.s}</span></p><strong>${k.v}</strong></div>`).join('')}
  </aside>
  <p class="tp-source" data-region="source">Illustrative data · cohort of locations signed in the last 12 months</p>
</div>`
};
