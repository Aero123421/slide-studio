// Template: Conference keynote · Typographic opener over a generative ridgeline backdrop. Synthetic example content; replace data and copy.
// The backdrop is computed: seeded noise builds 24 ridgelines (the "mountain") with a low sun behind them.
// Change SEED for a different range; keep the ridges below the title block (ridgeTop).
const P = 'tpl-keynote-opener';
const SEED = 20260924;
const talk = { event: 'Solstice Grid Forum 2026', slot: 'Opening keynote', date: '24 September 2026', room: 'Main hall' };

function rng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rand = rng(SEED);
const g = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s));

const LINES = 24, ridgeTop = 380, gapY = 11, sunX = 1000;
const waves = Array.from({ length: 4 }, (_, k) => ({ f: 0.006 + k * 0.007 + rand() * 0.004, a: 0.35 / (k + 1) + rand() * 0.1 }));
const ridges = [];
for (let i = 0; i < LINES; i++) {
  const yb = ridgeTop + 92 + i * gapY, phase = rand() * 6.28, lift = 1 - i / LINES * 0.4;
  const pts = [];
  for (let x = -20; x <= 1300; x += 8) {
    const n = waves.reduce((s, w, k) => s + w.a * (0.5 + 0.5 * Math.sin(x * w.f + phase * (k + 1) + i * 0.35)), 0);
    const env = 0.95 * g(x, sunX - 60, 210) + 0.55 * g(x, 520, 170) + 0.18;
    pts.push([x, yb - Math.min(yb - ridgeTop, 84 * env * n * lift + 5 * rand())]);
  }
  const d = `M${pts.map(p => `${p[0]} ${p[1].toFixed(1)}`).join(' L')}`;
  const o = (0.28 + 0.7 * (i / LINES)).toFixed(2);
  ridges.push(`<path d="${d} L1300 720 L-20 720 Z" fill="#07080d" fill-opacity=".94"/><path d="${d}" fill="none" stroke="url(#${P}-stroke)" stroke-width="${(1 + i * 0.03).toFixed(2)}" stroke-opacity="${o}"/>`);
}
const stars = Array.from({ length: 110 }, () => {
  const x = rand() * 1280, y = rand() * 360, r = rand() < 0.1 ? 1.4 : 0.8;
  if (x < 900 && y > 50 && y < 400) return ''; // keep the title field clean
  return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r}" fill="#f4f1ea" opacity="${(0.15 + rand() * 0.4).toFixed(2)}"/>`;
}).join('');

const bg = `<svg class="kn-deco" viewBox="0 0 1280 720" width="1280" height="720" aria-hidden="true">
<defs>
  <radialGradient id="${P}-sky" cx="${sunX}" cy="470" r="720" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3a1d12"/><stop offset=".35" stop-color="#1a1230"/><stop offset=".75" stop-color="#0b0f20"/><stop offset="1" stop-color="#07080d"/></radialGradient>
  <radialGradient id="${P}-cool" cx="140" cy="60" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1d3b7a" stop-opacity=".55"/><stop offset="1" stop-color="#1d3b7a" stop-opacity="0"/></radialGradient>
  <radialGradient id="${P}-sun" cx="${sunX}" cy="428" r="78" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffe3a3"/><stop offset=".55" stop-color="#ffb547"/><stop offset="1" stop-color="#ff7a3d"/></radialGradient>
  <radialGradient id="${P}-halo" cx="${sunX}" cy="428" r="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ff9a3d" stop-opacity=".55"/><stop offset="1" stop-color="#ff9a3d" stop-opacity="0"/></radialGradient>
  <linearGradient id="${P}-stroke" x1="0" y1="0" x2="1280" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#56d7e6"/><stop offset=".5" stop-color="#8e7bff"/><stop offset=".8" stop-color="#ffb547"/><stop offset="1" stop-color="#ff7a3d"/></linearGradient>
</defs>
<rect width="1280" height="720" fill="url(#${P}-sky)"/><rect width="1280" height="720" fill="url(#${P}-cool)"/>
${stars}
<circle cx="${sunX}" cy="428" r="300" fill="url(#${P}-halo)"/>
<circle cx="${sunX}" cy="428" r="74" fill="url(#${P}-sun)"/>
${ridges.join('')}
</svg>`;

export default {
  study: true,
  id: 'tpl-keynote-opener',
  title: 'Keynote opener: Move the hour, not the mountain',
  notes: 'Purpose: Open a keynote with the whole argument in one line and a picture of it: the sun behind the mountain.\nModify: Change the two title lines, the italic subline and the event strings. Change SEED for another ridge pattern; keep ridgeTop below the title block.\nInvariant: The title is a claim the talk defends, not a topic label. The backdrop is decoration and carries no data.\nStatic: No builds; the opener reads at once.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-keynote kn-opener',
  content: `<div class="kn-page">${bg}
<p class="kn-abs kn-eyebrow" style="left:76px;top:74px"><b>${talk.slot}</b>　${talk.event}　·　${talk.date}</p>
<h1 class="kn-abs kn-open-h" data-region="title" style="left:70px;top:132px;text-transform:none;font-size:112px;letter-spacing:-5px;color:#8f92a4"><span style="display:inline;color:var(--kn-ink)">Move the <span class="kn-warm" style="display:inline">hour,</span></span><br>not the mountain.</h1>
<p class="kn-abs kn-open-sub" style="left:76px;top:360px;width:640px">Why the next decade of the grid is about timing, not tonnage.</p>
</div>`
};
