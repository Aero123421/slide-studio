// Diagram study · Concentric rings — a field of rings that makes an optical centre for one number.
// The rings are decoration: their count, spacing and weight follow `motif`, never the data.
// The number in the centre and the headline are computed from `months`.
import { svgRoot, el, g, theme as makeTheme, mixHex, fmt, sum } from '../runtime/figure.mjs';

// Member rooftop generation and town demand, MWh per month, 2026 (illustrative).
const months = [
  { m: 'January', roof: 820, demand: 9850 }, { m: 'February', roof: 1340, demand: 8920 },
  { m: 'March', roof: 2410, demand: 8610 }, { m: 'April', roof: 3560, demand: 7560 },
  { m: 'May', roof: 4630, demand: 7120 }, { m: 'June', roof: 5120, demand: 6890 },
  { m: 'July', roof: 5380, demand: 7010 }, { m: 'August', roof: 4710, demand: 7240 },
  { m: 'September', roof: 3290, demand: 7380 }, { m: 'October', roof: 1980, demand: 8130 },
  { m: 'November', roof: 960, demand: 9020 }, { m: 'December', roof: 640, demand: 9960 },
];
const share = sum(months.map(d => d.roof)) / sum(months.map(d => d.demand));
const majority = months.filter(d => d.roof / d.demand > 0.5);       // months with more than half
const span = majority.length > 1 ? `${majority[0].m} to ${majority.at(-1).m}` : majority[0]?.m;

// Composition: the ring centre is where the number sits; geometric spacing reads as a ripple.
const W = 1280, H = 720;
const motif = { cx: 900, cy: 334, core: 178, outer: 392, ratio: 1.041, cadence: [2.4, 0.9, 0.9, 0.9] };

// Solid tone between two theme roles (CSS color-mix in slides, literal hex in standalone files).
const tone = (t, a, b, k) => (t.literal ? mixHex(t.hex(a), t.hex(b), k) : `color-mix(in srgb, ${t.c(a)}, ${t.c(b)} ${+(k * 100).toFixed(1)}%)`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), radii = [];
  for (let r = motif.core; r <= motif.outer; r *= motif.ratio) radii.push(r);
  const rings = radii.map((r, k) => {
    const u = k / (radii.length - 1);                                // 0 at the core, 1 at the edge
    return el('circle', { cx: motif.cx, cy: motif.cy, r, fill: 'none',
      stroke: tone(t, 'paper', 'muted', 0.7 - 0.56 * u), 'stroke-width': motif.cadence[k % motif.cadence.length] });
  });
  return svgRoot({ id: 'concentric-rings-fig', width: W, height: H, theme: t,
    title: 'Concentric rings around an empty centre',
    desc: `${radii.length} decorative rings, spaced like a ripple and fading outward, frame the centre of the page where the annual share is written. The rings encode no data.` },
  el('defs', {}, el('clipPath', { id: 'concentric-rings-clip' }, el('rect', { x: 0, y: 0, width: W, height: H }))),
  g({ 'clip-path': 'url(#concentric-rings-clip)' },
    rings));
}

export default {
  study: true,
  id: 'concentric-rings',
  title: 'Concentric rings: an optical centre for one number',
  className: 'st st--full cs-keynote-dusk',
  notes: 'Purpose: Create an optical centre where the page\'s one number sits, using rings that make no quantitative claim.\nModify: Replace `months`; the centre share, the month span in the headline and the dek recompute. Move `motif.cx/cy` to wherever the number should sit; change `ratio` and `cadence` for a tighter or looser ripple.\nInvariant: The rings are decoration — their count, spacing and weight never follow the data. Text sits only on the calm core and the plain left field. One accent: the number.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/concentric-rings.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="top:190px;max-width:420px;font-size:42px">From ${span}, member rooftops powered more than half of Larkfield</h1>
<p class="st-dek" style="top:440px;max-width:400px">Across the whole year they generated ${fmt(sum(months.map(d => d.roof)) / 1000, { digits: 1 })} GWh of the ${fmt(sum(months.map(d => d.demand)) / 1000, { digits: 1 })} GWh the town used.</p>
<div data-region="primary" style="position:absolute;left:${motif.cx - 150}px;top:${motif.cy - 86}px;width:300px;text-align:center">
  <p class="st-num" style="color:var(--ss-accent);font-size:118px">${Math.round(share * 100)}<small style="color:var(--ss-accent);margin-left:.04em">%</small></p>
  <p class="st-text" style="margin-top:14px;color:var(--ss-muted);font-size:20px;line-height:1.35">of the town's electricity<br>in 2026 came from rooftops</p>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · Larkfield Energy Co-operative; the rings are decorative</span><span>Concentric rings</span></p>`,
};
