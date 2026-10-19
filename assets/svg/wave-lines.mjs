// Diagram study · Wave lines — noise-displaced lines spaced in perspective to read as a calm sea.
// Lines crowd toward the horizon and swell toward the viewer; one seeded noise field keeps them coherent.
import { svgRoot, el, g, theme as makeTheme, mixHex, noise2D, pathFromPoints, fmt } from '../runtime/figure.mjs';

// Seagrass replanted by the trust, hectares, and next season's plan (illustrative).
const meadow = [{ year: 2025, hectares: 1.4 }, { year: 2026, hectares: 3.2 }];
const plan = { year: 2027, hectares: 6.4, from: '2027-05-01', to: '2027-09-30', contact: 'dives@keldabay.example' };
const lastYear = meadow.at(-1);
const ratio = plan.hectares / lastYear.hectares;
const times = { 2: 'twice', 3: 'three times', 4: 'four times' }[Math.round(ratio * 10) / 10] ?? `${fmt(ratio, { digits: 1 })} times`;
// Volunteer dives run every Saturday of the season: count them from the calendar.
const saturdays = [];
for (let d = new Date(`${plan.from}T00:00Z`); d <= new Date(`${plan.to}T00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) if (d.getUTCDay() === 6) saturdays.push(new Date(d));
const day = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });

// Sea: `count` lines from the horizon down; spacing and amplitude grow toward the viewer (power law).
const W = 1280, H = 720;
const motif = { horizon: 384, bottom: 648, count: 32, spread: 1.85, swell: 1.1, freq: [11, 2.1], drift: 0.045, seed: 12 };   // swell: amplitude in units of the local line gap; drift: phase step per line

const tone = (t, a, b, k) => (t.literal ? mixHex(t.hex(a), t.hex(b), k) : `color-mix(in srgb, ${t.c(a)}, ${t.c(b)} ${+(k * 100).toFixed(1)}%)`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), noise = noise2D(motif.seed), { horizon, bottom, count } = motif;
  const depth = k => (k / (count - 1)) ** motif.spread;                  // 0 at the horizon, 1 nearest the viewer
  const lines = Array.from({ length: count }, (_, k) => {
    const z = depth(k), base = horizon + (bottom - horizon) * z;
    // Amplitude follows the local gap between lines, so neighbouring lines never cross.
    const gap = (bottom - horizon) * (k ? z - depth(k - 1) : depth(1));
    const amp = motif.swell * gap * 0.5, freq = motif.freq[0] + (motif.freq[1] - motif.freq[0]) * z;
    const pts = Array.from({ length: 121 }, (_, s) => {
      const u = s / 120, calm = 0.6 + 0.4 * noise(u * 2.2, 7.3);                 // slow variation: calmer and rougher stretches
      const swell = Math.sin(2 * Math.PI * (u * freq + k * motif.drift)), chop = (noise.fbm(u * freq * 1.7, k * 0.05, 3) - 0.5) * 2;
      return [u * W, base + amp * calm * (0.7 * swell + 0.3 * chop)];
    });
    return el('path', { d: pathFromPoints(pts), stroke: tone(t, 'paper', 'muted', 0.16 + 0.56 * z), 'stroke-width': 0.7 + 1.9 * z });
  });
  return svgRoot({ id: 'wave-lines-fig', width: W, height: H, theme: t,
    title: 'Wave lines receding to a horizon',
    desc: `${count} noise-displaced lines, crowded and calm at the horizon and wider and heavier toward the viewer, suggest the surface of a bay. They are decoration, not a measured waveform.` },
  el('line', { x1: 0, y1: horizon, x2: W, y2: horizon, stroke: tone(t, 'paper', 'muted', 0.3), 'stroke-width': 1 }),
  g({ fill: 'none', 'stroke-linecap': 'round' }, lines));
}

export default {
  study: true,
  id: 'wave-lines',
  title: 'Wave lines: a calm directional field for a closing page',
  className: 'st st--full cs-sustainability-moss',
  notes: 'Purpose: Close a talk with a quiet, directional sea that sets the subject without competing with the closing line.\nModify: Replace `meadow` and `plan`; the area, the ratio word, the season dates and the number of dives recompute from the calendar. Change `motif.horizon/bottom` to move the band, `spread` for stronger perspective, `swell` for rougher water (keep it ≤ 1.6 so lines never cross), `drift` to turn the swell, `seed` for a different sea.\nInvariant: Lines are decoration, not a waveform: no axis, no units, no peaks to read. Text stays above the horizon; the sea stops above the source line. No accent colour: nothing on the page is a mark to point at.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/wave-lines.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="top:72px;max-width:900px;font-size:50px;line-height:1.1">Next spring we replant ${fmt(plan.hectares, { digits: 1 })} hectares of seagrass, ${times} this year's meadow</h1>
<p class="st-dek" style="top:228px;max-width:820px">Volunteer dives run every Saturday from ${day(saturdays[0])} to ${day(saturdays.at(-1))}: ${saturdays.length} dives in all.<br>Sign up at <strong style="color:var(--ss-ink);font-weight:600">${plan.contact}</strong></p>
<p class="st-source" data-region="source"><span>Illustrative data · Kelda Bay Seagrass Trust; the waves are decorative</span><span>Wave lines</span></p>`,
};
