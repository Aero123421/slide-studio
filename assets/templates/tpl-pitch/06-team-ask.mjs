// Template: Tallyleaf investor pitch · Team and the ask / use of funds. Synthetic example content; replace data and copy.
// Fictional people. Avatars are generated monograms, so no photos are needed.
const P = 'tpl-pitch-team-ask';
const raise = 6.0e6;
const funds = [
  {name: 'Product & engineering', share: 0.45, fill: '#f2bf4b'},
  {name: 'Sales & onboarding', share: 0.32, fill: '#e8573c'},
  {name: 'Supplier network', share: 0.15, fill: '#9dbfa5'},
  {name: 'Operations & G&A', share: 0.08, fill: '#8c7f72'}
];
const targetLocations = 650, acv = 9000, runwayMonths = 20;

const team = [
  {name: 'Ines Arvidsson', role: 'CEO', line: 'Ran purchasing for a 30-site restaurant group for seven years.', motif: 'half', c: ['#ec8f78', '#f5d6c6']},
  {name: 'Dev Raman', role: 'CTO', line: 'Built demand forecasting for a grocery delivery marketplace.', motif: 'rings', c: ['#2f6b4f', '#d7e6d6']},
  {name: 'Lucía Moreau', role: 'Head of Customer', line: 'Former chef-owner; opened and ran two neighbourhood bistros.', motif: 'stripes', c: ['#b9892e', '#f8e6b8']},
  {name: 'Tomasz Keller', role: 'Head of Sales', line: 'Sold POS software to 1,200 independent venues across the Midwest.', motif: 'dots', c: ['#1f1a16', '#e2d6c1']}
];
const avatar = (p, i) => {
  const id = `${P}-av${i}`, [a, b] = p.c, ini = p.name.split(' ').map(w => w[0]).join('');
  const motif = {
    half: `<path d="M0 37 A37 37 0 0 1 74 37Z" fill="${a}" opacity=".9"/>`,
    rings: `<circle cx="37" cy="37" r="30" fill="none" stroke="${a}" stroke-width="3" opacity=".5"/><circle cx="37" cy="37" r="22" fill="none" stroke="${a}" stroke-width="3" opacity=".35"/>`,
    stripes: [10, 22, 34, 46, 58].map(x => `<rect x="${x}" y="0" width="5" height="74" fill="${a}" opacity=".35"/>`).join(''),
    dots: [14, 30, 46, 62].flatMap(x => [14, 30, 46, 62].map(y => `<circle cx="${x}" cy="${y}" r="2.6" fill="${a}" opacity=".45"/>`)).join('')
  }[p.motif];
  return `<svg viewBox="0 0 74 74" role="img" aria-labelledby="${id}-t"><title id="${id}-t">Monogram for ${p.name}</title>
    <defs><clipPath id="${id}-c"><circle cx="37" cy="37" r="36"/></clipPath></defs>
    <g clip-path="url(#${id}-c)"><rect width="74" height="74" fill="${b}"/>${motif}</g>
    <circle cx="37" cy="37" r="36" fill="none" stroke="#1f1a16" stroke-width="1.5"/>
    <text x="37" y="45" text-anchor="middle" style="font:400 25px var(--tp-serif);fill:#1f1a16;letter-spacing:-.02em">${ini}</text></svg>`;
};

// Donut geometry from shares (must sum to 1).
const cx = 108, cy = 124, r0 = 66, r1 = 106;
let a0 = -Math.PI / 2;
const arcs = funds.map(f => {
  const a1 = a0 + f.share * 2 * Math.PI, large = f.share > 0.5 ? 1 : 0;
  const p = (r, a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  const d = `M${p(r1, a0)} A${r1} ${r1} 0 ${large} 1 ${p(r1, a1)} L${p(r0, a1)} A${r0} ${r0} 0 ${large} 0 ${p(r0, a0)}Z`;
  a0 = a1;
  return `<path d="${d}" fill="${f.fill}" stroke="#1f1a16" stroke-width="2.5"/>`;
}).join('');
const legend = funds.map((f, i) => {
  const ly = 30 + i * 56;
  return `<rect x="244" y="${ly - 13}" width="14" height="14" rx="3" fill="${f.fill}"/>
    <text x="270" y="${ly}" class="tp-sv-lab" style="font-size:17px">${f.name}</text>
    <text x="270" y="${ly + 24}" class="tp-sv-small">${Math.round(f.share * 100)}% · $${(raise * f.share / 1e6).toFixed(1)}M</text>`;
}).join('');

export default {
  study: true,
  id: 'tpl-pitch-team-ask',
  title: 'Team and the ask',
  notes: 'Purpose: Close with who will execute and exactly what the money buys.\nModify: Replace the team array (initials derive from names), the raise, the use-of-funds shares and the target milestones.\nInvariant: Shares sum to 100% and dollar amounts derive from the raise; target ARR = locations × ACV.\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-pitch tp-ask-page',
  content: `<div class="tp-wrap">
  <div class="tp-head" style="right:600px"><div class="tp-brand"><svg viewBox="-6 -6 112 118" role="img" aria-labelledby="${P}-mk"><title id="${P}-mk">Tallyleaf mark</title><g transform="rotate(-36 50 50)"><path d="M50 3 C84 26 84 74 50 97 C16 74 16 26 50 3Z" fill="#2f6b4f"/><g stroke="#fbf5ea" stroke-width="6" stroke-linecap="round"><line x1="37" y1="33" x2="37" y2="67"/><line x1="45.5" y1="31" x2="45.5" y2="69"/><line x1="54.5" y1="31" x2="54.5" y2="69"/><line x1="63" y1="33" x2="63" y2="67"/><line x1="30" y1="62" x2="70" y2="38"/></g></g></svg>tallyleaf</div><div class="tp-sec"><b>05</b><i></i>Team &amp; ask</div></div>
  <h1 class="tp-title tp-ask-left" data-region="title">Operators and forecasters, building for the kitchens <em>they ran</em>.</h1>
  <div class="tp-team" data-region="primary">
    ${team.map((p, i) => `<div class="tp-person">${avatar(p, i)}<div><h3>${p.name}</h3><p class="tp-role">${p.role}</p><p>${p.line}</p></div></div>`).join('')}
  </div>
  <p class="tp-advisors" data-region="support"><b>Advisors</b> · a former CFO of a regional food distributor · a restaurant-group COO with 40 venues</p>
  <p class="tp-source" data-region="source">Illustrative data · fictional team and funding plan</p>
  <section class="tp-ask" data-region="support">
    <p class="tp-kicker">The ask</p>
    <p class="tp-ask-amt">$${(raise / 1e6).toFixed(1)}M<small>seed</small></p>
    <p class="tp-ask-sub">${runwayMonths} months of runway to reach Series A scale in two regions.</p>
    <div class="tp-ask-fig">
      <svg viewBox="0 0 470 250" role="img" aria-labelledby="${P}-t ${P}-d">
        <title id="${P}-t">Use of funds</title>
        <desc id="${P}-d">${funds.map(f => `${f.name} ${Math.round(f.share * 100)}%`).join(', ')} of $${(raise / 1e6).toFixed(1)}M.</desc>
        ${arcs}
        <text x="${cx}" y="${cy - 2}" text-anchor="middle" class="tp-sv-num" style="font-size:26px">$${(raise / 1e6).toFixed(1)}M</text>
        <text x="${cx}" y="${cy + 22}" text-anchor="middle" class="tp-sv-small">use of funds</text>
        ${legend}
      </svg>
    </div>
    <div class="tp-ask-miles">
      <div><strong>${targetLocations}</strong><p>live locations</p></div>
      <div><strong>$${(Math.round(targetLocations * acv / 1e5) / 10).toFixed(1)}M</strong><p>ARR target</p></div>
      <div><strong>Q2 ’28</strong><p>Series A ready</p></div>
    </div>
  </section>
</div>`
};
