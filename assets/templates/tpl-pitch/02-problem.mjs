// Template: Tallyleaf investor pitch · Problem as an illustrated scenario. Synthetic example content; replace data and copy.
// One case of tomatoes followed through a week. Stations are data; icons, captions and arrows are generated.
const P = 'tpl-pitch-problem';
const purchases = 195000;     // annual produce purchases for the example bistro, USD
const binnedShare = 0.17;     // share of purchased produce discarded (≈ one in six)
const lost = Math.round(purchases * binnedShare / 1000);

const icons = {
  moon: `<path d="M38 12a20 20 0 1 0 14 30A16 16 0 0 1 38 12Z" fill="#f2bf4b" stroke="#1f1a16" stroke-width="2.5" stroke-linejoin="round"/>
         <rect x="6" y="30" width="22" height="28" rx="3" fill="#fbf5ea" stroke="#1f1a16" stroke-width="2.5"/>
         <path d="M11 39h12M11 45h12M11 51h8" stroke="#1f1a16" stroke-width="2.2" stroke-linecap="round"/>`,
  truck: `<path d="M4 20h32v24H4z" fill="#fbf5ea" stroke="#1f1a16" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M36 28h12l8 9v7H36z" fill="#f2bf4b" stroke="#1f1a16" stroke-width="2.5" stroke-linejoin="round"/>
          <circle cx="14" cy="47" r="6" fill="#1f1a16"/><circle cx="46" cy="47" r="6" fill="#1f1a16"/>
          <circle cx="13" cy="31" r="5" fill="#d8432a"/><circle cx="24" cy="32" r="5" fill="#d8432a"/><circle cx="19" cy="24" r="4.5" fill="#d8432a"/>`,
  rain: `<path d="M16 34a10 10 0 0 1 2-19 14 14 0 0 1 26 3 9 9 0 0 1 2 16z" fill="#fbf5ea" stroke="#1f1a16" stroke-width="2.5" stroke-linejoin="round"/>
         <path d="M20 42l-4 9M31 42l-4 9M42 42l-4 9" stroke="#2f6b4f" stroke-width="3" stroke-linecap="round"/>`,
  crate: `<circle cx="18" cy="26" r="7" fill="#d8432a"/><circle cx="31" cy="27" r="7" fill="#b9892e"/><circle cx="24" cy="18" r="6" fill="#d8432a" opacity=".55"/>
          <path d="M6 28h48v22H6z" fill="#e6c79a" stroke="#1f1a16" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M6 39h48M18 28v22M42 28v22" stroke="#1f1a16" stroke-width="2"/>`,
  bin: `<path d="M12 20h36l-4 34H16z" fill="#fbf5ea" stroke="#1f1a16" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M8 20h44M24 20v-5h12v5" stroke="#1f1a16" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M23 29l2 18M30 29v18M37 29l-2 18" stroke="#1f1a16" stroke-width="2" stroke-linecap="round"/>
        <circle cx="41" cy="12" r="6" fill="#8a5a2b"/>`
};

const stations = [
  {icon: 'moon',  when: 'Tue 22:48', head: 'Order written from memory', line: '“Same as last week, plus a bit.”'},
  {icon: 'truck', when: 'Thu 07:10', head: '4 cases of tomatoes arrive', line: 'Supplier minimum is 3 cases.'},
  {icon: 'rain',  when: 'Fri 19:30', head: 'Rain: 71 covers, not 112', line: 'Two tables of eight cancel.'},
  {icon: 'crate', when: 'Sun 23:00', head: '1½ cases left in the walk-in', line: 'Too soft for Monday service.'},
  {icon: 'bin',   when: 'Mon 08:00', head: '$94 of fruit is binned', line: 'The cost appears 5 days later.', key: true}
];
const x0 = 124, dx = 238, cy = 84, r = 58;
const nodes = stations.map((s, i) => {
  const cx = x0 + i * dx;
  const ring = s.key
    ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#d8432a"/><circle cx="${cx}" cy="${cy}" r="${r + 9}" fill="none" stroke="#d8432a" stroke-width="1.5" stroke-dasharray="3 5"/>`
    : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fbf5ea" stroke="#1f1a16" stroke-width="2"/>`;
  const iconBg = s.key ? `<circle cx="${cx}" cy="${cy}" r="${r - 10}" fill="#fbf5ea"/>` : '';
  return `<g>${ring}${iconBg}<g transform="translate(${cx - 38} ${cy - 40}) scale(1.27)">${icons[s.icon]}</g>
    <text x="${cx}" y="${cy + r + 34}" text-anchor="middle" class="tp-sv-lab" style="letter-spacing:.08em;${s.key ? 'fill:#a93220' : ''}">${s.when.toUpperCase()}</text>
    <text x="${cx}" y="${cy + r + 62}" text-anchor="middle" style="font:700 18px var(--tp-sans);fill:#1f1a16">${s.head}</text>
    <text x="${cx}" y="${cy + r + 88}" text-anchor="middle" class="tp-sv-hand" style="font-size:17px;fill:#4a4038">${s.line}</text></g>`;
}).join('');
// Arrows mean "then" (a sequence in time); they start and end at circle boundaries.
const arrows = stations.slice(0, -1).map((_, i) => {
  const a = x0 + i * dx + r + 8, b = x0 + (i + 1) * dx - r - 12;
  return `<path d="M${a} ${cy} C${a + 40} ${cy - 26} ${b - 40} ${cy - 26} ${b} ${cy}" fill="none" stroke="#1f1a16" stroke-width="2" stroke-dasharray="5 6" marker-end="url(#${P}-arr)"/>`;
}).join('');

export default {
  study: true,
  id: 'tpl-pitch-problem',
  title: 'Problem — a week of over-ordering',
  notes: 'Purpose: Make the customer problem concrete by following one purchase through time, then size it.\nModify: Rewrite the five stations from a real customer interview; recompute the stat band from your own purchase and waste figures.\nInvariant: Arrows mean “then” (sequence); the costly moment is the only red station; stats derive from the same inputs as the headline.\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-pitch tp-problem',
  content: `<div class="tp-wrap">
  <div class="tp-head"><div class="tp-brand"><svg viewBox="-6 -6 112 118" role="img" aria-labelledby="${P}-mk"><title id="${P}-mk">Tallyleaf mark</title><g transform="rotate(-36 50 50)"><path d="M50 3 C84 26 84 74 50 97 C16 74 16 26 50 3Z" fill="#2f6b4f"/><g stroke="#fbf5ea" stroke-width="6" stroke-linecap="round"><line x1="37" y1="33" x2="37" y2="67"/><line x1="45.5" y1="31" x2="45.5" y2="69"/><line x1="54.5" y1="31" x2="54.5" y2="69"/><line x1="63" y1="33" x2="63" y2="67"/><line x1="30" y1="62" x2="70" y2="38"/></g></g></svg>tallyleaf</div><div class="tp-sec"><b>01</b><i></i>The problem</div></div>
  <h1 class="tp-title tp-prob-title" data-region="title">A 40-seat bistro bins <em>one in six</em> cases of produce it buys.</h1>
  <p class="tp-lede tp-prob-lede" data-region="support">The order is written late at night, from memory, for a week nobody can see yet. The loss surfaces days later.</p>
  <div class="tp-prob-scene" data-region="primary">
    <svg viewBox="0 0 1200 290" role="img" aria-labelledby="${P}-t ${P}-d">
      <title id="${P}-t">One case of tomatoes, Tuesday to Monday</title>
      <desc id="${P}-d">Five moments in sequence: an order written from memory, delivery above need, a rainy Friday with fewer covers, unsold stock on Sunday and fruit binned on Monday.</desc>
      <defs><marker id="${P}-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="#1f1a16" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
      <path d="M20 ${cy} H1180" stroke="#e2d6c1" stroke-width="1"/>
      ${arrows}${nodes}
    </svg>
  </div>
  <div class="tp-prob-stats" data-region="support">
    <div><span class="tp-num">${Math.round(binnedShare * 100)}%</span><p>of produce purchases are discarded, by value</p></div>
    <div><span class="tp-num">$${lost}k</span><p>lost per location each year</p></div>
    <div><span class="tp-num">2.5 h</span><p>a week the chef spends on ordering</p></div>
  </div>
  <p class="tp-source" data-region="source">Illustrative data · example bistro with $${Math.round(purchases / 1000)}k annual produce spend</p>
</div>`
};
