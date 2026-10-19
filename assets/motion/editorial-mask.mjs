// Motion study · Editorial text mask — display lines rise from behind their own baseline
// mask: the letters never scale, blur or fade, so their final shapes are there from the
// first frame. Builds: 1 the second and third lines, 2 the evidence by hour.
import { svgRoot, el, g, band, linear, textLines, statesAttr, theme as makeTheme } from '../runtime/figure.mjs';

// Visitors by hour of entry on Thursdays, autumn season (illustrative gallery ticketing data).
const hours = [
  { h: 10, visitors: 412, under30: 58 }, { h: 11, visitors: 655, under30: 98 }, { h: 12, visitors: 702, under30: 126 },
  { h: 13, visitors: 688, under30: 117 }, { h: 14, visitors: 731, under30: 117 }, { h: 15, visitors: 690, under30: 117 },
  { h: 16, visitors: 540, under30: 103 }, { h: 17, visitors: 498, under30: 120 }, { h: 18, visitors: 812, under30: 309 },
  { h: 19, visitors: 905, under30: 398 }, { h: 20, visitors: 604, under30: 248 },
];
const lateFrom = 18;
const shareOf = list => Math.round((list.reduce((s, r) => s + r.under30, 0) / list.reduce((s, r) => s + r.visitors, 0)) * 100);
const late = shareOf(hours.filter(r => r.h >= lateFrom)), day = shareOf(hours.filter(r => r.h < lateFrom));

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 600, H = 430, m = { l: 8, r: 8, t: 64, b: 40 };
  const x = band(hours.map(r => r.h), [m.l, W - m.r], { inner: 0.22, outer: 0.05 }), y = linear([0, 50], [H - m.b, m.t]);
  const pct = r => (r.under30 / r.visitors) * 100;
  return svgRoot({ id: 'motion-editorial-mask-fig', width: W, height: H, theme: t,
    title: 'Share of Thursday visitors under 30, by hour of entry',
    desc: `${late}% of visitors entering from ${lateFrom}:00 are under 30, against ${day}% earlier in the day.` },
  textLines(['Visitors under 30, by hour of entry'], { x: 0, y: 4, size: 17, valign: 'top', fill: t.c('ink'), weight: 600 }),
  textLines(['Thursdays, % of visitors entering in that hour'], { x: 0, y: 30, size: 16, valign: 'top', fill: t.c('muted') }),
  // The daytime average runs under the daytime bars only; its label sits over the two lowest bars.
  el('line', { x1: m.l, x2: x(lateFrom) - 4, y1: y(day), y2: y(day), stroke: t.c('muted'), 'stroke-dasharray': '4 4' }),
  textLines(['Daytime', `average ${day}%`], { x: m.l + 2, y: y(day) - 8, size: 16, valign: 'bottom', fill: t.c('muted'), lineHeight: 1.2 }),
  g({ 'data-step': 2, 'data-motion': 'grow-y', 'data-stagger': 45, 'data-duration': 600 },
    hours.map(r => el('rect', { x: x(r.h), y: y(pct(r)), width: x.bw, height: y(0) - y(pct(r)), fill: r.h >= lateFrom ? t.c('accent') : t.c('context'), style: 'transform-origin:50% 100%' }))),
  hours.filter(r => r.h >= lateFrom).map(r => textLines([`${Math.round(pct(r))}%`], { x: x.center(r.h), y: y(pct(r)) - 8, size: 16, anchor: 'middle', fill: t.c('accent'), weight: 700, attrs: { 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 700 } })),
  // The evening bars carry the headline's coloured phrase as their label.
  (() => { const lateHours = hours.filter(r => r.h >= lateFrom), x0 = x(lateHours[0].h), x1 = x(lateHours.at(-1).h) + x.bw, top = y(Math.max(...lateHours.map(pct))) - 36;
    return g({ 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 800 },
      el('path', { d: `M${x0} ${top + 8}V${top}H${x1}V${top + 8}`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 1.6 }),
      textLines(['After 6 pm'], { x: (x0 + x1) / 2, y: top - 8, size: 17, anchor: 'middle', fill: t.c('accent'), weight: 700 })); })(),
  el('line', { x1: m.l, x2: W - m.r, y1: y(0), y2: y(0), stroke: t.c('ink'), 'stroke-width': 1.2 }),
  hours.filter((r, i) => i % 2 === 0).map(r => textLines([`${r.h}:00`], { x: x.center(r.h), y: y(0) + 10, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted') })));
}

// A display line inside its mask: the outer box clips, the inner line rises from 105% below
// (hidden while it waits below the mask, so nothing truncated is ever on the page).
const line = (text, step) => step === 0
  ? `<span style="display:block;overflow:hidden;padding-bottom:.06em">${text}</span>`
  : `<span style="display:block;overflow:hidden;padding-bottom:.06em"><span style="display:block;translate:0 105%;visibility:hidden" data-states="${statesAttr({ 0: { translate: '0 105%', visibility: 'hidden' }, [step]: { translate: '0 0', visibility: 'visible' } })}" data-duration="800" data-easing="emphasized">${text}</span></span>`;

export default {
  study: true,
  id: 'motion-editorial-mask',
  title: 'Editorial mask: display lines rise from behind a baseline',
  className: 'st cs-luxury-noir',
  notes: `Purpose: Bring in a short display line (here the evening contrast to a daytime baseline) with an editorial mask, so the letters keep their final shapes from the first frame (no scaling, blur, tracking or per-letter motion).\nModify: Edit the lines (keep each short enough for one line at 58 px); replace \`hours\` and the computed shares (${late}% and ${day}%) follow.\nInvariant: Each masked line is clipped by its own box and translates by its own height; the page before the mask is already a complete statement; the chart arrives after the claim and its evening bars carry the only accent.\nStatic: The final build shows all four lines and the chart.`,
  sources: [{ type: 'original-example', file: 'assets/motion/editorial-mask.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="top:132px;max-width:520px;font-size:58px;line-height:1.08;font-weight:500;letter-spacing:-.01em;text-wrap:initial">${line('Before 6 pm,', 0)}${line(`${day}% of visitors`, 0)}${line('are under 30.', 0)}${line(`<em>After 6 pm</em>, ${late}%.`, 1)}</h1>
<p class="st-text st-muted" style="position:absolute;left:64px;top:430px;width:480px" data-step="2" data-motion="reveal" data-delay="300">Thursday late openings, September to November. Share of visitors entering in each hour.</p>
<figure class="st-fig" style="left:616px;top:150px" data-region="primary" data-step="2" data-motion="reveal" data-duration="400">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · Thursday ticket scans, autumn season</span><span>Motion · editorial mask on display lines (2 builds)</span></p>`,
};
