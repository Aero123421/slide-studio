// Motion study · Change emphasis, not the underlying result — two daily load profiles stay
// on the chart in every build; attention moves from the 2019 peak to the 2025 peak, then
// both are shown with the shift between them. Builds: 1 attention to 2025, 2 the comparison.
import { svgRoot, el, g, linear, axis, textLines, pathFromPoints, theme as makeTheme, fmt } from '../runtime/figure.mjs';

// Average weekday electricity demand by hour, GW (illustrative regional grid).
const hours = [...Array(24).keys()];
const profiles = [
  { year: 2019, gw: [27.1, 25.9, 25.2, 24.9, 25.0, 26.2, 29.4, 33.0, 35.2, 35.9, 36.1, 36.3, 36.0, 35.8, 35.9, 36.6, 38.4, 40.6, 41.2, 40.3, 38.6, 35.9, 32.4, 29.3] },
  { year: 2025, gw: [29.4, 27.8, 26.9, 26.5, 26.6, 27.7, 30.6, 33.1, 33.4, 31.8, 30.3, 29.4, 28.9, 29.2, 30.4, 32.6, 36.0, 40.1, 43.2, 44.6, 44.9, 42.1, 37.6, 33.0] },
];
const peakOf = p => { const v = Math.max(...p.gw); return { hour: p.gw.indexOf(v), gw: v }; };
const [old, now] = profiles.map(p => ({ ...p, peak: peakOf(p) }));
const later = now.peak.hour - old.peak.hour, higher = Math.round((now.peak.gw / old.peak.gw - 1) * 100);
const hh = h => `${String(h).padStart(2, '0')}:00`;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 58, r: 120, t: 40, b: 40 };
  const x = linear([0, 23], [m.l, W - m.r]), y = linear([20, 50], [H - m.b, m.t]);
  const colour = p => (p === now ? t.c('accent') : t.c('ink'));
  // Emphasis per build: who is at full strength. The data never changes.
  const strength = p => (p === old ? { 0: { opacity: 1 }, 1: { opacity: 0.22 }, 2: { opacity: 1 } } : { 0: { opacity: 0.22 }, 1: { opacity: 1 }, 2: { opacity: 1 } });
  // Each profile is one group: line, peak dot, year label and peak note dim and return together.
  const noteY = y(48.6), side = p => (p === old ? -1 : 1);
  const line = p => g({ 'data-states': strength(p), 'data-duration': 600 },
    el('path', { d: pathFromPoints(p.gw.map((v, h) => [x(h), y(v)]), { curve: 'monotone' }), fill: 'none', stroke: colour(p), 'stroke-width': p === now ? 3.6 : 3, 'stroke-linejoin': 'round' }),
    el('circle', { cx: x(p.peak.hour), cy: y(p.peak.gw), r: 7, fill: colour(p), stroke: t.c('paper'), 'stroke-width': 2.5 }),
    textLines([String(p.year)], { x: x(23) + 14, y: y(p.gw[23]), size: 20, valign: 'middle', fill: colour(p), weight: 700 }),
    el('line', { x1: x(p.peak.hour), x2: x(p.peak.hour), y1: noteY + 10, y2: y(p.peak.gw) - 11, stroke: colour(p), 'stroke-width': 1.4 }),
    textLines([`${p.year} peak`, `${hh(p.peak.hour)}, ${fmt(p.peak.gw, { digits: 1 })} GW`], { x: x(p.peak.hour) + side(p) * 10, y: noteY - 14, size: 17, anchor: side(p) < 0 ? 'end' : 'start', fill: colour(p), weight: 600, lineHeight: 1.3 }));
  return svgRoot({ id: 'motion-two-stage-attention-fig', width: W, height: H, theme: t,
    title: `Average weekday electricity demand by hour, ${old.year} and ${now.year}`,
    desc: `${old.year} peaked at ${hh(old.peak.hour)} with ${old.peak.gw} GW; ${now.year} peaks at ${hh(now.peak.hour)} with ${now.peak.gw} GW, ${later} hours later and ${higher}% higher. Midday demand is lower in ${now.year}.` },
  axis(y, { orient: 'left', at: m.l, grid: [m.l, W - m.r], theme: t, size: 16, tickValues: [20, 30, 40, 50], format: { digits: 0 } }),
  textLines(['Average weekday demand, GW'], { x: 0, y: 4, size: 16, valign: 'top', fill: t.c('muted') }),
  [0, 6, 12, 18, 23].map(h => textLines([hh(h)], { x: x(h), y: H - m.b + 12, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') })),
  line(old), line(now),
  // Build 2 — both at full strength, and the shift between the peaks.
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 350 },
    el('path', { d: `M${x(old.peak.hour) + 9} ${y(old.peak.gw) + 6}C${x(old.peak.hour) + 40} ${y(old.peak.gw) + 40},${x(now.peak.hour) - 10} ${y(now.peak.gw) + 46},${x(now.peak.hour) + 2} ${y(now.peak.gw) + 12}`, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.6, 'stroke-dasharray': '4 4' }),
    textLines([`${later} hours later, ${higher}% higher`], { x: x(now.peak.hour) + 18, y: y(now.peak.gw) - 8, size: 18, fill: t.c('ink'), weight: 700, halo: t.c('paper') })));
}

export default {
  study: true,
  id: 'motion-two-stage-attention',
  title: 'Two-stage attention: move emphasis, keep the comparison',
  className: 'st cs-strategy-dark',
  notes: 'Purpose: Walk attention through a comparison in two stages (first the baseline, then the alternative) while both results stay on the chart the whole time, and end with both at full strength.\nModify: Replace `profiles` (24 hourly values each); peaks, the shift in hours and the percentage recompute. Keep the line that the headline names in the accent.\nInvariant: Data, scales and line geometry are identical in every build; only opacity changes (never below about a fifth, so the other series stays readable); each peak note dims and returns with its own line.\nStatic: The final build shows both profiles at full strength with both peaks and the shift between them.',
  sources: [{ type: 'original-example', file: 'assets/motion/motion-two-stage-attention.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">In <em>${now.year}</em>, weekday demand peaks at ${hh(now.peak.hour)}: ${later} hours later and ${higher}% higher than in ${old.year}</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · regional grid operator, average of working days, January–December</span><span>Motion · attention moves, the result stays (2 builds)</span></p>`,
};
