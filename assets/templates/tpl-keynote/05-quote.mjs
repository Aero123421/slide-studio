// Template: Conference keynote · Quote page over a generative particle flow field. Synthetic example content; replace data and copy.
// The quote is an original statement of the talk's principle, attributed to the programme, not to a named person.
const P = 'tpl-keynote-quote';
const SEED = 1207;
function rng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rand = rng(SEED);

// Flow field: angle from a few low-frequency sines; each particle is traced for a short streak.
const angle = (x, y) => 0.9 * Math.sin(x * 0.0042 + 1.3) + 0.8 * Math.cos(y * 0.0061 - 0.4) + 0.5 * Math.sin((x + y) * 0.0027);
const streaks = [];
for (let i = 0; i < 520; i++) {
  let x = rand() * 1320 - 20, y = rand() * 760 - 20;
  const len = 6 + Math.floor(rand() * 10), pts = [[x, y]];
  for (let s = 0; s < len; s++) { const a = angle(x, y); x += Math.cos(a) * 7; y += Math.sin(a) * 7; pts.push([x, y]); }
  const warm = x > 760 && y > 360 ? rand() < 0.7 : rand() < 0.12;
  // Fade particles under the quote block so type stays clean.
  const calm = x > 80 && x < 1150 && y > 170 && y < 520 ? 0.35 : 1;
  streaks.push(`<path d="M${pts.map(p => `${p[0].toFixed(0)} ${p[1].toFixed(0)}`).join(' L')}" fill="none" stroke="${warm ? '#ffb547' : '#7f95d6'}" stroke-width="${(0.6 + rand() * 0.9).toFixed(2)}" stroke-linecap="round" stroke-opacity="${((0.12 + rand() * 0.35) * calm).toFixed(2)}"/>`);
}
const bg = `<svg class="kn-deco" viewBox="0 0 1280 720" width="1280" height="720" aria-hidden="true">
<defs><radialGradient id="${P}-g" cx="1040" cy="600" r="560" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4a2512" stop-opacity=".85"/><stop offset="1" stop-color="#07080d" stop-opacity="0"/></radialGradient>
<radialGradient id="${P}-g2" cx="120" cy="80" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#16244f" stop-opacity=".8"/><stop offset="1" stop-color="#07080d" stop-opacity="0"/></radialGradient></defs>
<rect width="1280" height="720" fill="#07080d"/><rect width="1280" height="720" fill="url(#${P}-g)"/><rect width="1280" height="720" fill="url(#${P}-g2)"/>
${streaks.join('')}
${[118, 196].map(x => `<g transform="translate(${x} 150)" fill="#ffb547" fill-opacity=".92"><circle cx="0" cy="0" r="25"/><path d="M-24.5 -5 C-26 -44 -4 -74 30 -86 C8 -66 -2 -46 2 -25 Z"/></g>`).join('')}
</svg>`;

const quote = { lead: 'The cheapest kilowatt-hour', rest: 'is the one we move to a better hour.', by: 'The working principle of this programme' };

export default {
  study: true,
  id: 'tpl-keynote-quote',
  title: 'Quote: the cheapest kilowatt-hour is the one we move',
  notes: 'Purpose: Give the audience one sentence to repeat after the talk.\nModify: Edit quote.lead (highlighted), quote.rest and quote.by. Change SEED for another particle pattern.\nInvariant: Quote only words that were actually said or written, and attribute them to their real source. This example is an original line attributed to the programme, not to a person.\nStatic: No builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-keynote kn-quote-page',
  content: `<div class="kn-page">${bg}
<blockquote class="kn-abs" data-region="title" style="left:120px;top:214px;width:1000px;margin:0">
  <p class="kn-quote"><b>${quote.lead}</b> ${quote.rest}</p>
  <p class="kn-quote-by" style="margin-top:40px">— ${quote.by}</p>
</blockquote>
</div>`
};
