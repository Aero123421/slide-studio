// Motion study · Trace observations in order — the line is drawn survey by survey, so the
// audience sees the order of the observations and every year in which none was made.
// Build 1 traces the counts at a constant pace per year (each dot lands as the line reaches
// it; gaps stay open), build 2 marks the restoration and compares before with after.
import { svgRoot, el, g, linear, axis, textLines, theme as makeTheme, fmt, mean } from '../runtime/figure.mjs';

const survey = [ // booming male bitterns heard each spring at Marrow Fen; null = no survey that year (illustrative)
  { year: 2008, males: 5 }, { year: 2009, males: 4 }, { year: 2010, males: 6 }, { year: 2011, males: 5 },
  { year: 2012, males: 4 }, { year: 2013, males: null }, { year: 2014, males: 5 }, { year: 2015, males: 6 },
  { year: 2016, males: 5 }, { year: 2017, males: 7 }, { year: 2018, males: 9 }, { year: 2019, males: 11 },
  { year: 2020, males: null }, { year: 2021, males: 13 }, { year: 2022, males: 14 }, { year: 2023, males: 16 },
  { year: 2024, males: 15 }, { year: 2025, males: 18 },
];
const restoredAt = 2016.5; // reed beds re-cut and re-flooded in the winter of 2016–17
const counted = survey.filter(d => d.males != null);
const before = counted.filter(d => d.year < restoredAt);
const preMean = mean(before.map(d => d.males));
const last = counted.at(-1);
const gaps = survey.filter(d => d.males == null);
const ratio = last.males / preMean;
const msPerYear = 90; // trace pace: time on screen is proportional to time in the record

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 62, r: 132, t: 44, b: 44 };
  const first = survey[0].year;
  const x = linear([first, last.year], [m.l, W - m.r]);
  const y = linear([0, 20], [H - m.b, m.t]);
  const at = year => Math.round((year - first) * msPerYear); // delay at which the trace reaches `year`
  const trace = [], dots = [];
  survey.forEach((d, i) => {
    if (d.males == null) return;
    const next = survey[i + 1];
    // one short segment per consecutive pair of surveys: never across a missing year
    if (next && next.males != null) trace.push(el('path', {
      d: `M${x(d.year)} ${y(d.males)}L${x(next.year)} ${y(next.males)}`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 3.2, 'stroke-linecap': 'round',
      'data-step': 1, 'data-motion': 'draw', 'data-delay': at(d.year), 'data-duration': msPerYear * (next.year - d.year), 'data-easing': 'linear',
    }));
    dots.push(el('circle', {
      cx: x(d.year), cy: y(d.males), r: d === last ? 7 : 5.5, fill: t.c('accent'), stroke: t.c('paper'), 'stroke-width': 2,
      'data-step': 1, 'data-motion': 'reveal', 'data-delay': at(d.year), 'data-duration': 200,
    }));
  });
  const ex = x(restoredAt), preY = y(preMean), preEnd = x(before.at(-1).year);
  return svgRoot({ id: 'motion-line-trace-fig', width: W, height: H, theme: t,
    title: `Booming male bitterns counted each spring at Marrow Fen, ${first}–${last.year}`,
    desc: `Counts held near ${fmt(preMean, { digits: 0 })} until the reed beds were restored in winter ${Math.floor(restoredAt)}–${String(Math.ceil(restoredAt)).slice(2)}, then rose to ${last.males} in ${last.year}. No survey was made in ${gaps.map(d => d.year).join(' or ')}; those years are gaps, not estimates.` },
  axis(y, { orient: 'left', at: m.l, grid: [m.l, W - m.r], theme: t, size: 16, tickValues: [0, 5, 10, 15, 20] }),
  textLines(['Booming males heard'], { x: m.l - 46, y: 14, size: 16, fill: t.c('muted'), valign: 'top' }),
  survey.map(d => el('line', { x1: x(d.year), x2: x(d.year), y1: H - m.b, y2: H - m.b + 5, stroke: t.c('rule') })),
  survey.filter(d => d.year % 2 === 0).map(d =>textLines([String(d.year)], { x: x(d.year), y: H - m.b + 12, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } })),
  // gaps are named where the trace skips them
  gaps.map(d => textLines(['no survey'], { x: x(d.year), y: y(1.4), size: 15, anchor: 'middle', fill: t.c('muted'), italic: true,
    attrs: { 'data-step': 1, 'data-motion': 'reveal', 'data-delay': at(d.year), 'data-duration': 300 } })),
  // build 2 sits under the trace: the restoration and the earlier average
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-duration': 600 },
    el('line', { x1: ex, x2: ex, y1: m.t - 30, y2: H - m.b, stroke: t.c('ink'), 'stroke-width': 1.4, 'stroke-dasharray': '5 5' }),
    textLines(['Reed beds restored'], { x: ex + 10, y: m.t - 22, size: 17, weight: 700, fill: t.c('ink'), valign: 'top' }),
    textLines([`winter ${Math.floor(restoredAt)}–${String(Math.ceil(restoredAt)).slice(2)}`], { x: ex + 10, y: m.t, size: 16, fill: t.c('muted'), valign: 'top' }),
    el('line', { x1: x(first), x2: preEnd, y1: preY, y2: preY, stroke: t.c('muted'), 'stroke-width': 2, 'stroke-dasharray': '0.1 6', 'stroke-linecap': 'round' }),
    textLines([`${first}–${String(before.at(-1).year).slice(2)} average: ${fmt(preMean, { digits: 1 })}`], { x: x(first), y: preY - 30, size: 16, weight: 600, fill: t.c('ink'), halo: t.c('paper') })),
  trace, dots,
  textLines([`${last.males}`], { x: x(last.year) + 16, y: y(last.males), size: 22, weight: 700, valign: 'middle', fill: t.c('accent'),
    attrs: { 'data-step': 1, 'data-motion': 'reveal', 'data-delay': at(last.year) + 150 } }),
  textLines([`males in ${last.year}`], { x: x(last.year) + 16, y: y(last.males) + 24, size: 16, valign: 'middle', fill: t.c('muted'),
    attrs: { 'data-step': 1, 'data-motion': 'reveal', 'data-delay': at(last.year) + 150 } }),
  textLines([`${fmt(ratio, { digits: 1 })}× the`, 'earlier average'], { x: x(last.year) + 16, y: y(last.males) + 74, size: 16, weight: 650, valign: 'top', fill: t.c('ink'), lineHeight: 1.3,
    attrs: { 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 250 } }));
}

export default {
  study: true,
  id: 'motion-line-trace',
  title: 'Line trace: observations in order, then the event',
  className: 'st cs-field-survey',
  notes: 'Purpose: Show the order of observations by drawing the line survey by survey, without inventing values between them, then mark the event the audience should read the line against.\nModify: Replace `survey` (null = no observation) and `restoredAt`; the trace pace, gaps, average and ratio recompute. Keep msPerYear so the whole trace stays under two seconds.\nInvariant: The trace advances at a constant pace per unit of time; a segment only joins two consecutive observations, so a missing year stays a visible gap; the event is marked after the series is complete, never before.\nStatic: The final build shows the full series, both gaps, the event line, the earlier average and the ratio; nothing is lost in PDF.',
  sources: [{ type: 'original-example', file: 'assets/motion/line-trace.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Booming bitterns at Marrow Fen rose from an average of ${fmt(preMean, { digits: 0 })} to <em>${last.males}</em> in ${last.year} after the reed beds were restored</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · booming males heard in April–May; no survey in ${gaps.map(d => d.year).join(' or ')}</span><span>Motion · line traced in order, then the event (2 builds)</span></p>`,
};
