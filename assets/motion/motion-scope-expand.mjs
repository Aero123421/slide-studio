// Motion study · Expand a boundary without moving the evidence — three years of monthly counts
// are drawn once and never move. One boundary (a single rect) widens from the record month to its
// winter, then to three winters, by transforms computed from month indices; each scope's
// statement is computed from the bars inside it.
import { svgRoot, el, g, linear, band, textLines, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const first = { year: 2022, month: 6 }; // July 2022 (month 0 = January)
const outbreaks = [ // norovirus outbreaks reported in care homes and hospitals, per month, Fenmoor region (illustrative)
  12, 9, 14, 31, 58, 97, // Jul–Dec 2022
  121, 94, 66, 38, 21, 15, 11, 10, 17, 42, 88, 134, // 2023
  142, 118, 71, 35, 19, 13, 10, 12, 16, 36, 71, 110, // 2024
  168, 87, 49, 27, 18, 12, // Jan–Jun 2025
];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dateOf = i => { const k = first.month + i; return { year: first.year + Math.floor(k / 12), month: k % 12 }; };
const sumOf = (a, b) => outbreaks.slice(a, b + 1).reduce((s, v) => s + v, 0);
// winters run November to March; find each one that is complete in the record
const winters = outbreaks.map((_, i) => i).filter(i => dateOf(i).month === 10 && i + 4 < outbreaks.length)
  .map(i => ({ from: i, to: i + 4, label: `${dateOf(i).year}–${String(dateOf(i).year + 1).slice(2)}`, total: sumOf(i, i + 4) }));
const peak = outbreaks.indexOf(Math.max(...outbreaks));
const thisWinter = winters.find(w => peak >= w.from && peak <= w.to), lastWinter = winters[winters.indexOf(thisWinter) - 1];
const vsLast = Math.round((thisWinter.total / lastWinter.total - 1) * 100);
const peakName = `${MONTHS[dateOf(peak).month]} ${dateOf(peak).year}`;
const span = ['', 'one', 'two', 'three', 'four', 'five'][Math.round(outbreaks.length / 12)] || String(Math.round(outbreaks.length / 12));
const scopes = [
  { from: peak, to: peak, title: `${peakName}: ${outbreaks[peak]} outbreaks`, detail: `the most in any month since ${MONTHS[first.month]} ${first.year}` },
  { from: thisWinter.from, to: thisWinter.to, title: `Winter ${thisWinter.label}: ${thisWinter.total} outbreaks`, detail: 'November to March' },
  { from: winters[0].from, to: thisWinter.to, title: `This winter: ${fmt(vsLast, { sign: true })}% on last winter`, detail: `${winters.length} winters, each November to March` },
];

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 50, r: 10, t: 74, b: 44 };
  const x = band(outbreaks.map((_, i) => i), [m.l, W - m.r], { inner: 0.22, outer: 0.1 });
  const y = linear([0, 200], [H - m.b, m.t]);
  const pad = x.step * 0.32, dur = 900;
  const span = s => ({ x0: x(s.from) - pad, x1: x(s.to) + x.bw + pad });
  const s0 = span(scopes[0]);
  const mat = s => { const sp = span(s), a = (sp.x1 - sp.x0) / (s0.x1 - s0.x0), b = sp.x0 - a * s0.x0; return `matrix(${a.toFixed(5)},0,0,1,${b.toFixed(2)},0)`; };
  return svgRoot({ id: 'motion-scope-expand-fig', width: W, height: H, theme: t,
    title: `Norovirus outbreaks per month, ${MONTHS[first.month]} ${first.year} to ${MONTHS[dateOf(outbreaks.length - 1).month]} ${dateOf(outbreaks.length - 1).year}`,
    desc: `${peakName} had ${outbreaks[peak]} outbreaks, the highest month on record here. The winter around it totalled ${thisWinter.total}, ${Math.abs(vsLast)}% ${vsLast < 0 ? 'below' : 'above'} the previous winter (${lastWinter.total}); the winter before that had ${winters[0].total}.` },
  // the boundary: one rect, widened by computed transforms; the bars never move
  el('rect', { x: s0.x0, y: m.t - 6, width: s0.x1 - s0.x0, height: H - m.b - m.t + 6, fill: t.c('surface'),
    'data-states': Object.fromEntries(scopes.map((s, k) => [k, { transform: mat(s) }])), 'data-duration': dur, 'data-easing': 'smooth', style: 'transform-box:view-box;transform-origin:0 0' }),
  [0, 50, 100, 150, 200].map(v => g({},
    el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: v ? t.c('grid') : t.c('ink'), 'stroke-width': v ? 1 : 1.4 }),
    textLines([String(v)], { x: m.l - 10, y: y(v), size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
  outbreaks.map((v, i) => el('rect', { x: x(i), y: y(v), width: x.bw, height: y(0) - y(v), rx: 1.5, fill: i === peak ? t.c('accent') : t.c('context') })),
  textLines([String(outbreaks[peak])], { x: x.center(peak), y: y(outbreaks[peak]) - 8, size: 17, weight: 700, anchor: 'middle', fill: t.c('accent') }),
  outbreaks.map((_, i) => (dateOf(i).month === 0 ? textLines([`Jan ${dateOf(i).year}`], { x: x.center(i), y: H - m.b + 10, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') }) : '')),
  textLines([`${MONTHS[first.month].slice(0, 3)} ${first.year}`], { x: x(0), y: H - m.b + 10, size: 16, valign: 'top', fill: t.c('muted') }),
  textLines(['Outbreaks per month'], { x: 0, y: 22, size: 16, fill: t.c('muted') }),
  // each scope's statement sits on the boundary's right edge, above the plot
  scopes.map((s, k) => g({ 'data-step': k, 'data-until': k < scopes.length - 1 ? k : null, 'data-motion': k ? 'reveal' : null, 'data-delay': k ? dur - 150 : null },
    textLines([s.title], { x: Math.min(span(s).x1, W - m.r), y: 22, size: 20, weight: 700, anchor: 'end', fill: t.c('ink') }),
    textLines([s.detail], { x: Math.min(span(s).x1, W - m.r), y: 46, size: 16, anchor: 'end', fill: t.c('muted') }))),
  // build 2: each winter's total, bracketed inside the widest boundary
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-delay': dur },
    winters.map(w => g({},
      el('path', { d: `M${x(w.from)} ${y(178)}v-6H${x(w.to) + x.bw}v6`, fill: 'none', stroke: w === thisWinter ? t.c('accent') : t.c('ink'), 'stroke-width': 1.5 }),
      textLines([`${w.label}: ${w.total}`], { x: (x(w.from) + x(w.to) + x.bw) / 2, y: y(178) - 12, size: 16, weight: 700, anchor: 'middle', fill: w === thisWinter ? t.c('accent') : t.c('ink') })))));
}

export default {
  study: true,
  id: 'motion-scope-expand',
  title: 'Scope expand: widen the boundary, keep the evidence still',
  className: 'st cs-laboratory',
  notes: 'Purpose: Widen the scope under discussion (one month, its season, several seasons) without moving or rescaling the evidence, so the audience sees the same bars judged against a larger context.\nModify: Replace `outbreaks` and `first`; winters, the peak, the boundary transforms, the statements and the headline recompute. Define seasons to match your domain.\nInvariant: Bars and axes never move; one boundary element widens by transforms computed from the data; each statement is computed only from the bars inside its boundary; the observed bar keeps the accent throughout.\nStatic: The final build shows the widest boundary, every winter total and the comparison with last winter.',
  sources: [{ type: 'original-example', file: 'assets/motion/motion-scope-expand.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${MONTHS[dateOf(peak).month]}’s <em>${outbreaks[peak]}</em> outbreaks were a ${span}-year high, yet this winter ran ${Math.abs(vsLast)}% ${vsLast < 0 ? 'below' : 'above'} last winter</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · outbreaks reported to the regional health protection team</span><span>Motion · boundary widens over fixed evidence (2 builds)</span></p>`,
};
