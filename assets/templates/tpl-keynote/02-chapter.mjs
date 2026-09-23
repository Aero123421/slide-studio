// Template: Conference keynote · Chapter divider over a generative contour field. Synthetic example content; replace data and copy.
// Contours are closed curves r(θ) around one centre; distortion grows with radius, like a topographic survey.
const P = 'tpl-keynote-chapter';
const SEED = 7;
const chapters = ['The evening problem', 'Time is the new capacity', 'What we shift next'];
const current = 1; // zero-based index of this chapter

function rng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rand = rng(SEED);
const cx = 300, cy = 372;
const harm = Array.from({ length: 4 }, (_, k) => ({ n: k + 2, p: rand() * 6.28, a: (0.11 / (k + 1)) * (0.6 + rand()) }));
const rings = [];
for (let i = 0; i < 34; i++) {
  const r0 = 34 + i * 21, pts = [];
  for (let s = 0; s <= 180; s++) {
    const th = (s / 180) * Math.PI * 2;
    const k = harm.reduce((acc, h) => acc + h.a * Math.sin(h.n * th + h.p + i * 0.09), 0);
    const r = r0 * (1 + k * Math.min(1, r0 / 260));
    pts.push(`${(cx + r * Math.cos(th) * 1.12).toFixed(1)} ${(cy + r * Math.sin(th)).toFixed(1)}`);
  }
  rings.push(`<path d="M${pts.join(' L')}Z" fill="none" stroke="#8fa4d8" stroke-width="1" stroke-opacity="${(0.34 - i * 0.006).toFixed(3)}"/>`);
}
const bg = `<svg class="kn-deco" viewBox="0 0 1280 720" width="1280" height="720" aria-hidden="true">
<defs>
  <radialGradient id="${P}-glow" cx="${cx}" cy="${cy}" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2a1f5c" stop-opacity=".9"/><stop offset=".6" stop-color="#0f1430" stop-opacity=".6"/><stop offset="1" stop-color="#07080d" stop-opacity="0"/></radialGradient>
  <linearGradient id="${P}-fade" x1="0" y1="0" x2="1280" y2="0" gradientUnits="userSpaceOnUse"><stop offset=".42" stop-color="#fff"/><stop offset=".72" stop-color="#fff" stop-opacity=".12"/></linearGradient>
  <mask id="${P}-mask"><rect width="1280" height="720" fill="url(#${P}-fade)"/></mask>
</defs>
<rect width="1280" height="720" fill="#07080d"/><rect width="1280" height="720" fill="url(#${P}-glow)"/>
<g mask="url(#${P}-mask)">${rings.join('')}</g>
</svg>`;
const pad = n => String(n).padStart(2, '0');

export default {
  study: true,
  id: 'tpl-keynote-chapter',
  title: 'Chapter divider: Time is the new capacity',
  notes: 'Purpose: Mark a turn in the talk and say, in one line, what this chapter will prove.\nModify: Edit chapters and current; the outlined numeral and the chapter rail update. Change SEED for another contour pattern.\nInvariant: The chapter title is the claim of the section. The contour field is decoration; the outlined numeral is the only accent.\nStatic: No builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-keynote kn-chapter',
  content: `<div class="kn-page">${bg}
<p class="kn-abs kn-chap-no" aria-hidden="true" style="left:58px;top:198px">${pad(current + 1)}</p>
<div class="kn-abs" style="left:640px;top:208px;width:570px">
  <p class="kn-eyebrow">Chapter <b>${pad(current + 1)}</b> of ${pad(chapters.length)}</p>
  <h2 class="kn-chap-h" data-region="title" style="margin-top:22px">${chapters[current]}</h2>
  <p class="kn-chap-p" style="margin-top:26px">A grid is sized for its worst hour. Shrink the evening peak and you have built capacity without pouring concrete.</p>
</div>
<div class="kn-abs kn-chapters" style="left:640px;bottom:44px;flex-direction:column;gap:10px">${chapters.map((c, i) => `<span class="${i === current ? 'is-on' : ''}">${pad(i + 1)} ${c}</span>`).join('')}</div>
</div>`
};
