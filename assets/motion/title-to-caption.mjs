// Motion study · Title becomes caption — the headline and dek move down and shrink into
// a caption as the stripes they describe grow to the slide's full width. Same words,
// same elements, new reading order. Builds: 1 mark the run of warm years, 2 pivot.
import { svgRoot, el, g, textLines, theme as makeTheme, fmt, statesAttr } from '../runtime/figure.mjs';

// Annual mean temperature, difference from the 1901–1960 average, °C (illustrative valley station).
const start = 1901, baseline = [1901, 1960]; // first year of the record; the reference period
const anomaly = [-0.29, 0.06, 0.2, -0.13, -0.31, -0.03, 0.09, 0.22, -0.29, -0.3, 0.14, 0.08, 0.32, 0.2, -0.04, -0.08, 0.55, -0.08, -0.19, -0.27,
  0.0, 0.01, -0.1, -0.03, 0.04, 0.13, 0.22, 0.03, -0.41, 0.13, -0.33, -0.06, -0.34, -0.02, -0.19, 0.03, 0.71, -0.03, 0.17, -0.31,
  -0.08, 0.13, -0.03, 0.08, -0.04, -0.28, 0.07, -0.23, 0.37, -0.15, 0.11, -0.03, 0.18, -0.16, 0.2, -0.04, 0.27, 0.13, 0.03, -0.17,
  0.17, 0.11, 0.37, -0.07, 0.14, 0.14, 0.09, 0.08, 0.08, -0.09, -0.18, -0.04, 0.18, 0.39, 0.27, 0.38, 0.34, 0.35, 0.26, 0.42,
  0.67, 0.23, 0.18, 0.79, 0.43, 0.62, 0.62, 0.21, 1.02, 0.9, 0.57, 0.73, 0.62, 0.42, 0.62, 0.75, 0.94, 0.87, 0.76, 1.07,
  0.63, 1.0, 1.09, 0.81, 0.51, 0.73, 1.0, 1.09, 1.34, 0.81, 1.06, 1.22, 1.07, 0.61, 1.34, 1.69, 1.43, 1.04, 1.17, 1.34,
  1.86, 1.48, 1.39, 1.74, 1.4];
const end = start + anomaly.length - 1;
// Colour classes on the diverging ramp (index into --ss-div-1…7: 0 = warmest red, 6 = coolest blue).
const classes = [{ below: -0.25, k: 5 }, { below: 0, k: 4 }, { below: 0.25, k: 2 }, { below: 0.75, k: 1 }, { below: Infinity, k: 0 }];
const runFrom = start + anomaly.findIndex((_, i) => anomaly.slice(i).every(v => v > 0)); // first year of the unbroken warm run
const runLength = end - runFrom + 1;

// Geometry: the drawing at its opening size, and the slide box it grows into.
const W = 1100, stripeH = 420, H = 462, at0 = { x: 64, y: 190 };
const poster = { x: 24, y: 24, w: 1232 }; // where the drawing ends: the slide width less a 24 px margin
const k = poster.w / W;

export function figure(theme = 'css') {
  const t = makeTheme(theme), sw = W / anomaly.length;
  const x = year => (year - start) * sw;
  const cls = v => classes.find(c => v < c.below).k;
  return svgRoot({ id: 'motion-title-to-caption-fig', width: W, height: H, theme: t,
    title: `Warming stripes: annual mean temperature against the ${baseline[0]}–${baseline[1]} average, ${start}–${end}`,
    desc: `One stripe per year, blue cooler and red warmer than the ${baseline[0]}–${baseline[1]} average. Every year from ${runFrom} to ${end} was warmer; the warmest was ${start + anomaly.indexOf(Math.max(...anomaly))} at +${fmt(Math.max(...anomaly), { digits: 2 })} °C.` },
  anomaly.map((v, i) => el('rect', { x: i * sw, y: 0, width: sw + 0.6, height: stripeH, fill: t.div(cls(v)) })),
  [start, end].map((yr, j) => textLines([String(yr)], { x: j ? W : 0, y: stripeH + 12, size: 17, anchor: j ? 'end' : 'start', valign: 'top', fill: t.c('muted') })),
  // Build 1: the unbroken run of warm years is outlined and counted.
  g({ 'data-step': 1, 'data-motion': 'reveal', 'data-duration': 600 },
    el('rect', { x: x(runFrom) + 1.5, y: 1.5, width: x(end + 1) - x(runFrom) - 3, height: stripeH - 3, fill: 'none', stroke: t.c('ink'), 'stroke-width': 3 }),
    el('line', { x1: x(runFrom) + 1.5, x2: x(runFrom) + 1.5, y1: stripeH, y2: stripeH + 10, stroke: t.c('ink'), 'stroke-width': 3 }),
    textLines([`${runFrom}`], { x: x(runFrom) - 8, y: stripeH + 12, size: 17, anchor: 'end', valign: 'top', fill: t.c('ink'), weight: 700 }),
    textLines([`${runLength} years in a row above the average`], { x: x(runFrom) + 10, y: stripeH + 12, size: 17, valign: 'top', fill: t.c('accent'), weight: 700 })));
}

// State 0: a normal page (headline, dek, figure). State 2: stripes span the slide; the
// headline block becomes the caption below them, at 75% so the dek stays ≥ 15 px.
// The headline block sits above the figure (z-index) so it stays visible while it moves.
const capScale = 0.75, capTop = poster.y + H * k + 20;
const grow = { 0: { translate: '0px 0px', scale: '1' }, 2: { translate: `${poster.x - at0.x}px ${poster.y - at0.y}px`, scale: k.toFixed(5) } };
const headTop = 48; // the headline's top on the page grammar (--st-top)
const toCaption = { 0: { translate: '0px 0px', scale: '1' }, 2: { translate: `0px ${capTop - headTop}px`, scale: String(capScale) } };
// Colour key for the dek, built from the same classes as the stripes (--ss-div-1 is the warmest).
const swatch = c => `<span style="display:inline-block;width:.8em;height:.8em;vertical-align:-.05em;background:var(--ss-div-${c.k + 1})"></span>`;
const cool = classes.filter(c => c.below <= 0).map(swatch).join(''), warm = classes.filter(c => c.below > 0).map(swatch).join('');

export default {
  study: true,
  id: 'motion-title-to-caption',
  title: 'Title to caption: the evidence takes the page',
  className: 'st cs-journal-serif',
  notes: `Purpose: Start as a conventional page, then let the evidence take the page while the same headline and dek become its caption, so the reading order changes but the words do not.\nModify: Replace \`anomaly\` (one value per year from \`start\`) and the class breaks; the warm run, the headline year and the stripe colors recompute. The caption scale (${capScale}) keeps the dek at 15 px or more.\nInvariant: The headline block and the figure move as whole elements by translate and scale computed from the slide box; no text is retyped or swapped. Stripes keep one year each and one color class each.\nStatic: The final build is the poster state: stripes across the slide, the run of ${runLength} warm years outlined, the caption below.`,
  sources: [{ type: 'original-example', file: 'assets/motion/title-to-caption.mjs' }],
  exportPolicy: 'final',
  content: `<div style="position:absolute;left:0;top:0;width:1280px;height:200px;z-index:2;transform-origin:64px 48px" data-states="${statesAttr(toCaption)}" data-duration="1000" data-easing="smooth">
<h1 class="st-head">Every year since ${runFrom} has been warmer than the ${baseline[0]}–${baseline[1]} average in the valley</h1>
<p class="st-dek" style="max-width:1040px">One stripe per year, ${start}–${end}: ${cool} cooler, ${warm} warmer than that average; darker is further from it.</p>
</div>
<figure class="st-fig" style="left:${at0.x}px;top:${at0.y}px;width:${W}px;height:${H}px;right:auto;bottom:auto;transform-origin:0 0" data-region="primary" data-states="${statesAttr(grow)}" data-duration="1000" data-easing="smooth">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · valley weather station, annual means</span><span>Motion · title becomes caption (2 builds)</span></p>`,
};
