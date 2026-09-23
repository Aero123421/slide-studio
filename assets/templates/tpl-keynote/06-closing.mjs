// Template: Conference keynote · Closing with three asks, bookending the opener's ridgeline. Synthetic example content; replace data and copy.
const P = 'tpl-keynote-closing';
const SEED = 20260925;
const talk = { event: 'Solstice Grid Forum 2026', link: 'solstice-forum.example/keynote' };
const asks = [
  { h: 'Price the hour', p: 'Publish tariffs that change by the hour, not by the season.' },
  { h: 'Automate the shift', p: 'Let heat pumps, chargers and cold stores respond on their own.' },
  { h: 'Report the evening', p: 'Put the evening peak next to the annual total in every report.' }
];

function rng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rand = rng(SEED);
const g = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s));
const LINES = 12, ridgeTop = 600, sunX = 250;
const ridges = [];
for (let i = 0; i < LINES; i++) {
  const yb = ridgeTop + 58 + i * 8, ph = rand() * 6.28, pts = [];
  for (let x = -20; x <= 1300; x += 8) {
    const n = 0.55 + 0.25 * Math.sin(x * 0.009 + ph) + 0.2 * Math.sin(x * 0.021 + ph * 2);
    const env = 0.9 * g(x, sunX + 90, 200) + 0.5 * g(x, 900, 260) + 0.15;
    pts.push([x, yb - Math.min(yb - ridgeTop, 50 * env * n * (1 - i / LINES * 0.5))]);
  }
  const d = `M${pts.map(p => `${p[0]} ${p[1].toFixed(1)}`).join(' L')}`;
  ridges.push(`<path d="${d} L1300 740 L-20 740 Z" fill="#07080d" fill-opacity=".95"/><path d="${d}" fill="none" stroke="url(#${P}-stroke)" stroke-width="1.1" stroke-opacity="${(0.3 + 0.6 * i / LINES).toFixed(2)}"/>`);
}
const bg = `<svg class="kn-deco" viewBox="0 0 1280 720" width="1280" height="720" aria-hidden="true">
<defs>
  <radialGradient id="${P}-sky" cx="${sunX}" cy="640" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4b2210"/><stop offset=".3" stop-color="#1b1230"/><stop offset=".7" stop-color="#0b0f20"/><stop offset="1" stop-color="#07080d"/></radialGradient>
  <radialGradient id="${P}-sun" cx="${sunX}" cy="628" r="60" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffe3a3"/><stop offset=".6" stop-color="#ffb547"/><stop offset="1" stop-color="#ff7a3d"/></radialGradient>
  <radialGradient id="${P}-halo" cx="${sunX}" cy="628" r="260" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ff9a3d" stop-opacity=".5"/><stop offset="1" stop-color="#ff9a3d" stop-opacity="0"/></radialGradient>
  <linearGradient id="${P}-stroke" x1="0" y1="0" x2="1280" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffb547"/><stop offset=".45" stop-color="#8e7bff"/><stop offset="1" stop-color="#56d7e6"/></linearGradient>
</defs>
<rect width="1280" height="720" fill="url(#${P}-sky)"/>
<circle cx="${sunX}" cy="628" r="260" fill="url(#${P}-halo)"/><circle cx="${sunX}" cy="628" r="56" fill="url(#${P}-sun)"/>
${ridges.join('')}
</svg>`;

export default {
  study: true,
  id: 'tpl-keynote-closing',
  title: 'Closing: move the hour, and three things to do next',
  notes: 'Purpose: Close on the thesis and leave the audience with three concrete things to do.\nModify: Edit asks (keep three, verb first), the event and link. The ridgeline backdrop mirrors the opener; change SEED freely.\nInvariant: Each ask is an action someone in the room can take. The headline repeats the opener\'s claim, shortened.\nStatic: The asks build in order; the final state shows all three.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-keynote kn-closing',
  content: `<div class="kn-page">${bg}
<p class="kn-abs kn-eyebrow" style="left:76px;top:74px">Before next summer</p>
<h2 class="kn-abs kn-close-h" data-region="title" style="left:68px;top:128px">Move the <span style="color:var(--kn-sun)">hour.</span></h2>
<ol class="kn-abs kn-asks" data-region="primary" style="left:76px;right:76px;top:340px">${asks.map((a, i) => `<li data-step="${i + 1}" data-motion="lift"><b>${String(i + 1).padStart(2, '0')}</b><p>${a.h}</p><span>${a.p}</span></li>`).join('')}</ol>
<div class="kn-foot" style="bottom:26px;left:auto;right:76px;justify-content:flex-end;gap:36px;color:#c3c2c8"><span>${talk.event}</span><span style="text-transform:none;letter-spacing:.02em">${talk.link}</span></div>
</div>`
};
