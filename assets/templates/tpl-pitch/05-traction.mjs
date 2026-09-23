// Template: Tallyleaf investor pitch · Traction chart with milestones. Synthetic example content; replace data and copy.
// Monthly live locations drive the ARR bars, the axis, the direct label and the headline multiple.
const P = 'tpl-pitch-traction';
const acv = 9000;
const months = ['Apr 25', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan 26', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep 26'];
const locations = [5, 8, 12, 17, 22, 28, 35, 44, 52, 63, 74, 86, 98, 113, 128, 146, 163, 180];
const arr = locations.map(n => n * acv);                       // USD
const milestones = [
  {i: 2, text: ['POS integration live', 'forecasts from real sales']},
  {i: 9, text: ['First 12-site group', 'signs a network deal'], row: 2},
  {i: 14, text: ['Supplier ordering', 'launched in-app'], end: true, row: 1}
];
const yoy = arr.at(-1) / arr.at(-13);

const W = 840, H = 440, L = 76, R = 822, T = 30, B = 384, yMax = 2e6;
const n = arr.length, step = (R - L) / n, bw = step * 0.62;
const bx = i => L + i * step + (step - bw) / 2, cxm = i => L + i * step + step / 2;
const y = v => B - v / yMax * (B - T);
const grid = [0, 0.5e6, 1e6, 1.5e6].map(v => `<line x1="${L}" x2="${R}" y1="${y(v)}" y2="${y(v)}" stroke="${v ? '#e2d6c1' : '#1f1a16'}" stroke-width="${v ? 1 : 1.5}"/>
  <text x="${L - 12}" y="${y(v) + 5}" text-anchor="end" class="tp-sv-axis">${v ? `$${(v / 1e6).toFixed(1)}M` : '$0'}</text>`).join('');
const bars = arr.map((v, i) => `<rect x="${bx(i).toFixed(1)}" y="${y(v).toFixed(1)}" width="${bw.toFixed(1)}" height="${(B - y(v)).toFixed(1)}" rx="2" fill="${i === n - 1 ? '#2f6b4f' : '#9dbfa5'}"/>`).join('');
const xl = months.map((m, i) => i % 3 === 0 || i === n - 1 ? `<text x="${cxm(i).toFixed(1)}" y="${B + 24}" text-anchor="middle" class="tp-sv-axis">${m}</text>` : '').join('');
const flags = milestones.map(m => {
  const x = cxm(m.i), top = T + 4 + (m.row || 0) * 50, bot = y(arr[m.i]) - 8;
  const tx = m.end ? x - 10 : x + 10, anchor = m.end ? 'end' : 'start';
  return `<g data-step="1" data-motion="reveal">
    <line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${top}" y2="${bot.toFixed(1)}" stroke="#d8432a" stroke-width="1.6" stroke-dasharray="2 4"/>
    <circle cx="${x.toFixed(1)}" cy="${top}" r="5" fill="#d8432a"/>
    <text x="${tx.toFixed(1)}" y="${top + 5}" text-anchor="${anchor}" style="font:700 16px var(--tp-sans);fill:#1f1a16">${m.text[0]}</text>
    <text x="${tx.toFixed(1)}" y="${top + 26}" text-anchor="${anchor}" class="tp-sv-small">${m.text[1]} · ${months[m.i].replace(/ \d+$/, '')}</text></g>`;
}).join('');
const last = `<text x="${cxm(n - 1).toFixed(1)}" y="${(y(arr.at(-1)) - 14).toFixed(1)}" text-anchor="end" style="font:400 26px var(--tp-serif);fill:#2f6b4f">$${(arr.at(-1) / 1e6).toFixed(2)}M</text>`;

const stats = [
  {v: '118', u: '%', t: 'net revenue retention — groups add sites after the first one'},
  {v: '31', u: '%', t: 'median cut in produce waste after 90 days live'},
  {v: '1.6', u: '%', t: 'monthly logo churn, mostly venue closures'}
];

export default {
  study: true,
  id: 'tpl-pitch-traction',
  title: 'Traction — ARR growth and milestones',
  notes: 'Purpose: Prove momentum with one honest growth series and name what caused the inflections.\nModify: Replace the months and locations arrays (or feed ARR directly); milestones reference month indexes.\nInvariant: Bars share a zero baseline; the headline multiple is computed from the same series; milestones are dated, not decorative.\nStatic: Milestones appear on step 1; the final state shows all of them.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-pitch tp-traction',
  content: `<div class="tp-wrap">
  <div class="tp-head"><div class="tp-brand"><svg viewBox="-6 -6 112 118" role="img" aria-labelledby="${P}-mk"><title id="${P}-mk">Tallyleaf mark</title><g transform="rotate(-36 50 50)"><path d="M50 3 C84 26 84 74 50 97 C16 74 16 26 50 3Z" fill="#2f6b4f"/><g stroke="#fbf5ea" stroke-width="6" stroke-linecap="round"><line x1="37" y1="33" x2="37" y2="67"/><line x1="45.5" y1="31" x2="45.5" y2="69"/><line x1="54.5" y1="31" x2="54.5" y2="69"/><line x1="63" y1="33" x2="63" y2="67"/><line x1="30" y1="62" x2="70" y2="38"/></g></g></svg>tallyleaf</div><div class="tp-sec"><b>04</b><i></i>Traction</div></div>
  <h1 class="tp-title tp-tr-title" data-region="title">ARR grew <em>${yoy.toFixed(1)}×</em> in twelve months, with no paid marketing.</h1>
  <div class="tp-tr-chart" data-region="primary">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${P}-t ${P}-d">
      <title id="${P}-t">Annual recurring revenue by month, April 2025 to September 2026</title>
      <desc id="${P}-d">ARR rises from $${arr[0] / 1000}k to $${(arr.at(-1) / 1e6).toFixed(2)}M. Milestones: ${milestones.map(m => `${m.text[0]} (${months[m.i]})`).join('; ')}.</desc>
      ${grid}${bars}${xl}${last}${flags}
    </svg>
  </div>
  <aside class="tp-tr-rail" data-region="support">
    ${stats.map(s => `<div class="tp-tr-stat"><div class="tp-num">${s.v}<small>${s.u}</small></div><p>${s.t}</p></div>`).join('')}
  </aside>
  <p class="tp-source" data-region="source">Illustrative data · ARR = live locations × $${acv / 1000}k annual contract value · ${locations.at(-1)} locations live in ${months.at(-1).replace(' ', ' 20')}</p>
</div>`
};
