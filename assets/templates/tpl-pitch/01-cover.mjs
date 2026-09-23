// Template: Tallyleaf investor pitch · Cover with brand mark. Synthetic example content; replace data and copy.
// The brand mark is built from one function so the header, wordmark and hero stay identical.
const P = 'tpl-pitch-cover';
const mark = (id, leaf, stroke, stem = stroke) => `
  <g transform="rotate(-36 50 50)">
    <path d="M50 3 C84 26 84 74 50 97 C16 74 16 26 50 3Z" fill="${leaf}"/>
    <g stroke="${stroke}" stroke-width="5.2" stroke-linecap="round">
      <line x1="37" y1="33" x2="37" y2="67"/><line x1="45.5" y1="31" x2="45.5" y2="69"/>
      <line x1="54.5" y1="31" x2="54.5" y2="69"/><line x1="63" y1="33" x2="63" y2="67"/>
      <line x1="30" y1="62" x2="70" y2="38"/>
    </g>
    <line x1="50" y1="97" x2="50" y2="108" stroke="${stem}" stroke-width="5.2" stroke-linecap="round"/>
  </g>`;

// Decorative tally rows on the hero field: counts of 5 (one per "kitchen day").
const tallyRow = (x, y, groups) => Array.from({length: groups}, (_, g) => {
  const gx = x + g * 44;
  const verts = [0, 7, 14, 21].map(d => `<line x1="${gx + d}" y1="${y}" x2="${gx + d}" y2="${y + 22}"/>`).join('');
  return verts + `<line x1="${gx - 5}" y1="${y + 18}" x2="${gx + 26}" y2="${y + 4}"/>`;
}).join('');

export default {
  study: true,
  id: 'tpl-pitch-cover',
  title: 'Tallyleaf seed pitch — cover',
  notes: 'Purpose: Open an investor pitch with the company name, the one-line job the product does and the round.\nModify: Rename the company, rewrite the headline as the customer outcome, adjust the round line; redraw the mark function if your brand has one.\nInvariant: One promise in the headline; the mark is drawn once and reused at every size.\nStatic: Already static; the hero field is the brand illustration.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-pitch tp-cover',
  content: `<div class="tp-wrap">
  <div class="tp-cover-word" data-region="support"><svg viewBox="-6 -6 112 118" role="img" aria-labelledby="${P}-wm-t"><title id="${P}-wm-t">Tallyleaf mark</title>${mark('wm', '#2f6b4f', '#fbf5ea')}</svg>tallyleaf</div>
  <h1 class="tp-cover-h" data-region="title">Order what your kitchen will <em>actually</em> cook.</h1>
  <p class="tp-cover-sub" data-region="primary">Tallyleaf forecasts tomorrow’s covers for independent restaurants and drafts the supplier order to match — so less produce ends up in the bin.</p>
  <div class="tp-cover-meta" data-region="support">
    <p>Seed round<span>September 2026</span></p>
    <p style="text-align:right">Investor briefing<span>Confidential</span></p>
  </div>
  <div class="tp-cover-field">
    <svg viewBox="0 0 560 720" role="img" aria-labelledby="${P}-hero-t ${P}-hero-d">
      <title id="${P}-hero-t">Tallyleaf brand mark</title>
      <desc id="${P}-hero-d">A leaf whose veins are drawn as a five-bar tally, on a tomato-red field with a butter-yellow sun.</desc>
      <defs>
        <pattern id="${P}-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#fbf5ea" opacity=".22"/></pattern>
        <radialGradient id="${P}-glow" cx="50%" cy="46%" r="60%"><stop offset="0" stop-color="#e8573c"/><stop offset="1" stop-color="#c83b24"/></radialGradient>
      </defs>
      <rect width="560" height="720" fill="url(#${P}-glow)"/>
      <rect width="560" height="720" fill="url(#${P}-dots)"/>
      <circle cx="300" cy="318" r="206" fill="#f2bf4b"/>
      <circle cx="300" cy="318" r="248" fill="none" stroke="#fbf5ea" stroke-opacity=".35" stroke-width="1.5"/>
      <circle cx="300" cy="318" r="292" fill="none" stroke="#fbf5ea" stroke-opacity=".2" stroke-width="1.5" stroke-dasharray="2 9"/>
      <g transform="translate(118 128) scale(3.55)">${mark('hero', '#fbf5ea', '#d8432a', '#1f1a16')}</g>
      <g stroke="#fbf5ea" stroke-width="3.5" stroke-linecap="round" opacity=".85">${tallyRow(64, 640, 5)}</g>
      <g stroke="#1f1a16" stroke-width="3.5" stroke-linecap="round" opacity=".55">${tallyRow(310, 640, 4)}</g>
    </svg>
  </div>
</div>`
};
