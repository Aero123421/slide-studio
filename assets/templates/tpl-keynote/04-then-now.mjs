// Template: Conference keynote · Contrasting "then vs now" statement with paired schematics. Synthetic example content; replace data and copy.
// Right-hand schematic conserves energy: the evening load that is shifted equals the midday load that is added.
const P = 'tpl-keynote-then-now';
const g = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s));
const H = Array.from({ length: 97 }, (_, i) => i / 4); // quarter hours
const evening = h => 0.36 * g(h, 18, 1.9);
const before = h => 0.46 + 0.14 * g(h, 8, 1.6) + evening(h) + 0.06 * g(h, 13, 3);
const sun = h => h <= 5.8 || h >= 20.6 ? 0 : Math.sin(Math.PI * (h - 5.8) / 14.8) ** 1.6;
const SHIFT = 0.45;                                     // share of the evening bump that moves
const area = f => H.reduce((a, h) => a + f(h) * 0.25, 0);
const k = SHIFT * area(evening) / area(sun);            // midday addition with equal energy
const after = h => before(h) - SHIFT * evening(h) + k * sun(h);
const shiftedPct = Math.round(100 * SHIFT * area(evening) / area(before));
const peakDrop = Math.round(100 * (1 - Math.max(...H.map(after)) / Math.max(...H.map(before))));

const CW = 500, CH = 200, top = 16, base = CH - 26;
const sx = h => (h / 24) * CW, sy = v => base - v * (base - top);
const line = f => H.map((h, i) => `${i ? 'L' : 'M'}${sx(h).toFixed(1)} ${sy(f(h)).toFixed(1)}`).join(' ');
const axis = `<line x1="0" x2="${CW}" y1="${base}" y2="${base}" stroke="#4a4d5e"/>` + [0, 6, 12, 18, 24].map(h => `<text x="${sx(h)}" y="${base + 22}" font-size="15" fill="#9a9cab" text-anchor="${h === 0 ? 'start' : h === 24 ? 'end' : 'middle'}">${String(h).padStart(2, '0')}:00</text>`).join('');

// THEN: dispatch steps chase demand, hour by hour, stacked by plant type.
const bands = [{ to: 0.5, c: '#27405e' }, { to: 0.7, c: '#2f6f8a' }, { to: 2, c: '#56d7e6' }];
const steps = Array.from({ length: 24 }, (_, h) => Math.ceil(Math.max(before(h), before(h + 1)) * 20) / 20);
const stepRects = steps.flatMap((v, h) => { let lo = 0; return bands.map(b => { const hi = Math.min(v, b.to); const r = hi > lo ? `<rect x="${sx(h)}" y="${sy(hi)}" width="${sx(1) - 1}" height="${sy(lo) - sy(hi)}" fill="${b.c}" opacity=".85"/>` : ''; lo = Math.max(lo, b.to); return r; }); }).join('');
const thenSvg = `<svg viewBox="0 0 ${CW} ${CH}" width="${CW}" height="${CH}" role="img" aria-labelledby="${P}-a ${P}-ad" font-family="Inter,'Helvetica Neue','Liberation Sans',Arial,sans-serif">
<title id="${P}-a">Then: supply stepped up to follow demand</title><desc id="${P}-ad">Schematic day: hourly blocks of baseload, mid-merit and peaking plants stack up under the demand curve, with peaking plants running mainly in the evening.</desc>
${stepRects}<path d="${line(before)}" fill="none" stroke="#f4f1ea" stroke-width="2.4"/>${axis}
<text x="${sx(18)}" y="${sy(steps[18]) - 12}" font-size="15" font-weight="700" fill="#56d7e6" text-anchor="middle">peaking plants</text>
<text x="${sx(3)}" y="${sy(0.25) + 5}" font-size="15" fill="#c3c2c8">baseload</text></svg>`;

const nowSvg = `<svg viewBox="0 0 ${CW} ${CH}" width="${CW}" height="${CH}" role="img" aria-labelledby="${P}-b ${P}-bd" font-family="Inter,'Helvetica Neue','Liberation Sans',Arial,sans-serif">
<title id="${P}-b">Now: flexible demand moves under the solar curve</title><desc id="${P}-bd">Schematic day: ${shiftedPct}% of daily energy moves from the evening to midday, lowering the evening peak by about ${peakDrop}%. Total energy is unchanged.</desc>
<defs><linearGradient id="${P}-sun" x1="0" y1="${top}" x2="0" y2="${base}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffb547" stop-opacity=".6"/><stop offset="1" stop-color="#ff7a3d" stop-opacity=".05"/></linearGradient>
<marker id="${P}-ar" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#ffb547"/></marker></defs>
<path d="${line(h => sun(h) * 0.95)} L${CW} ${base} L0 ${base} Z" fill="url(#${P}-sun)"/>
<path d="${line(before)}" fill="none" stroke="#8f92a4" stroke-width="2" stroke-dasharray="5 5"/>
<path d="${line(after)}" fill="none" stroke="#f4f1ea" stroke-width="2.6"/>
<path d="M${sx(17.6)} ${sy(before(17.6)) - 10} C ${sx(16)} ${sy(1.12)}, ${sx(14.2)} ${sy(1.1)}, ${sx(13.2)} ${sy(after(13.2)) - 12}" fill="none" stroke="#ffb547" stroke-width="2" marker-end="url(#${P}-ar)"/>
<text x="${sx(15.4)}" y="${sy(1.14) - 4}" font-size="15" font-weight="700" fill="#ffb547" text-anchor="middle">same energy, earlier</text>
<text x="${sx(21.2)}" y="${sy(before(21.2)) - 10}" font-size="15" fill="#9a9cab" text-anchor="middle">before</text>
${axis}</svg>`;

export default {
  study: true,
  id: 'tpl-keynote-then-now',
  title: 'Then vs now: plants chased demand; demand now follows the sun',
  notes: `Purpose: Compress the talk's turn into two opposing sentences, each backed by a small schematic.\nModify: Edit the two statements and years. In the right schematic change SHIFT (share of the evening bump that moves); the midday addition is recomputed so total energy stays equal.\nInvariant: Both halves are labelled schematic; do not add units or read values off them. Keep the statements parallel in grammar so the contrast is real.\nStatic: The "now" half wipes in at step 1; the final state shows both halves.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-keynote kn-then-now',
  content: `<div class="kn-page">
<section class="kn-half" style="left:0;background:linear-gradient(180deg,#0d1426 0%,#07080d 100%)">
  <p class="kn-abs kn-year" style="left:72px;top:78px;color:#56d7e6">THEN · 2006</p>
  <h2 class="kn-abs kn-state" data-region="title" style="left:72px;top:128px;width:500px">Power plants chased demand.</h2>
  <p class="kn-abs kn-state-p" style="left:72px;top:282px;width:470px">Every evening the grid started more turbines to meet a peak it could not move.</p>
  <div class="kn-abs" style="left:72px;top:420px">${thenSvg}</div>
</section>
<section class="kn-half" data-step="1" data-motion="wipe" style="left:640px;background:radial-gradient(520px 360px at 55% 100%,rgba(255,122,61,.28),transparent 70%),linear-gradient(180deg,#1b1209 0%,#07080d 100%)">
  <p class="kn-abs kn-year" style="left:68px;top:78px;color:#ffb547">NOW · 2026</p>
  <h2 class="kn-abs kn-state" style="left:68px;top:128px;width:500px">Demand follows the sun.</h2>
  <p class="kn-abs kn-state-p" style="left:68px;top:282px;width:480px">Heat pumps, chargers and cold stores do their work at midday and coast through the evening.</p>
  <div class="kn-abs" style="left:68px;top:420px">${nowSvg}</div>
</section>
<div class="kn-deco" style="left:639px;width:2px;background:linear-gradient(180deg,transparent,rgba(244,241,234,.35),transparent)"></div>
<p class="kn-source" style="left:72px;bottom:22px">Schematic days, not measured data · right: ${shiftedPct}% of daily energy moved, evening peak about ${peakDrop}% lower</p>
</div>`
};
