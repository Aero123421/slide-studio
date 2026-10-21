// Diagram study · Timeline — events at their true times, with the intervals between them named.
// Spacing encodes elapsed minutes. Flags are packed into levels so no stem crosses a label;
// phase lengths, the rail numbers and the headline are computed from `events`.
import { theme as makeTheme, svgRoot, el, textLines, wrapText, measureText, linear } from '../runtime/figure.mjs';

const events = [ // minutes after 02:00, night of 14 March (illustrative)
  { at: 14, key: 'impact', title: 'Deploy 4.18 lands', body: 'checkout errors climb' },
  { at: 31, key: 'alert', title: 'First alert', body: 'errors above 5%' },
  { at: 38, title: 'On-call acknowledges' },
  { at: 55, key: 'cause', title: 'Cause found', body: 'connection pool halved' },
  { at: 66, title: 'Rollback starts' },
  { at: 79, key: 'recovered', title: 'Errors at baseline' },
];
const alertRule = { threshold: '5%', window: 10 }; // the alert pages after errors stay above threshold for `window` minutes
const at = key => events.find(e => e.key === key).at;
const clock = m => `${String(2 + Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const phases = [
  { label: 'detect', from: at('impact'), to: at('alert') },
  { label: 'diagnose', from: at('alert'), to: at('cause') },
  { label: 'recover', from: at('cause'), to: at('recovered') },
].map(p => ({ ...p, min: p.to - p.from }));
const impact = at('recovered') - at('impact');
const detect = phases[0];

export function figure(theme = 'css') {
  const t = makeTheme(theme), id = 'timeline-fig', W = 800, H = 470, axisY = 318, level = 82, labelW = 176;
  const x = linear([10, 100], [14, W - 4]);
  const parts = [];
  // Flags: process right to left; an event takes the lowest level where its label fits and
  // no stem of a later, higher flag passes through it. Earlier events therefore step upward.
  const flags = events.map(e => {
    const title = wrapText(e.title, labelW, 18, { weight: 700 });
    const w = Math.max(measureText(clock(e.at), 15), ...title.map(l => measureText(l, 18, { weight: 700 })), e.body ? measureText(e.body, 16) : 0);
    return { ...e, title, x0: x(e.at), x1: x(e.at) + 8 + w };
  });
  for (const f of [...flags].reverse()) {
    for (let L = 0; ; L++) {
      const clash = flags.some(o => o !== f && o.level !== undefined && ((o.level === L && o.x0 < f.x1 + 10 && f.x0 < o.x1 + 10) || (o.level > L && o.x0 >= f.x0 && o.x0 <= f.x1 + 6)));
      if (!clash) { f.level = L; break; }
    }
  }
  const levels = Math.max(...flags.map(f => f.level)) + 1;
  if (axisY - 30 - (levels - 1) * level - 80 < 0) throw Error(`timeline: ${levels} flag levels do not fit; shorten titles or widen the figure`);
  // axis, ticks every 15 minutes
  parts.push(el('line', { x1: x(10), x2: x(100), y1: axisY, y2: axisY, stroke: t.c('ink'), 'stroke-width': 2 }));
  for (let m = 15; m <= 100; m += 15) parts.push(el('line', { x1: x(m), x2: x(m), y1: axisY, y2: axisY + 7, stroke: t.c('ink'), 'stroke-width': 1.4 }),
    textLines([clock(m)], { x: x(m), y: axisY + 14, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  // phases: one band under the axis, labelled inside each segment
  const by = axisY + 50, bh = 34;
  phases.forEach((p, i) => {
    const em = i === 0, x0 = x(p.from), x1 = x(p.to);
    parts.push(el('rect', { x: x0 + 1, y: by, width: x1 - x0 - 2, height: bh, rx: 4, fill: em ? t.c('accent') : t.c('surface'), stroke: em ? null : t.c('rule') }),
      textLines([`${p.label} ${p.min} min`], { x: (x0 + x1) / 2, y: by + bh / 2, size: 16, anchor: 'middle', valign: 'middle', fill: em ? t.c('onAccent') : t.c('ink'), weight: 650 }));
  });
  parts.push(textLines([`customers affected ${impact} min`], { x: x(at('impact')), y: by + bh + 12, size: 15, valign: 'top', fill: t.c('muted'), weight: 600 }));
  parts.push(el('path', { d: `M${x(at('impact'))} ${by + bh + 6}v-4M${x(at('impact'))} ${by + bh + 4}H${x(at('recovered'))}v-4`, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.3 }));
  // flags
  for (const f of flags) {
    const em = f.key === 'alert', top = axisY - 30 - f.level * level;
    parts.push(el('line', { x1: f.x0, x2: f.x0, y1: axisY, y2: top - 52 - (f.title.length - 1) * 22 + (f.body ? 0 : 20), stroke: em ? t.c('accent') : t.c('muted'), 'stroke-width': em ? 1.8 : 1.2 }));
    const lines = [{ text: [clock(f.at)], size: 15, fill: em ? t.c('accent') : t.c('muted'), weight: 600 }, { text: f.title, size: 18, fill: em ? t.c('accent') : t.c('ink'), weight: 700 }];
    if (f.body) lines.push({ text: [f.body], size: 16, fill: t.c('muted'), weight: 400 });
    let yy = top - lines.reduce((s, L) => s + L.text.length * L.size * 1.22, 0);
    for (const L of lines) { parts.push(textLines(L.text, { x: f.x0 + 8, y: yy, size: L.size, valign: 'top', fill: L.fill, weight: L.weight, lineHeight: 1.22, attrs: L.size === 15 ? { 'font-variant-numeric': 'tabular-nums' } : {} })); yy += L.text.length * L.size * 1.22; }
    parts.push(el('circle', { cx: f.x0, cy: axisY, r: em ? 7 : 5.5, fill: em ? t.c('accent') : t.c('paper'), stroke: em ? t.c('accent') : t.c('ink'), 'stroke-width': 2.2 }));
  }
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Checkout incident timeline, 02:10–03:40, true time spacing',
    desc: `${events.length} events at their real times; horizontal spacing is elapsed minutes. Customers were affected from ${clock(at('impact'))} to ${clock(at('recovered'))}, ${impact} minutes: ${phases.map(p => `${p.min} minutes to ${p.label}`).join(', ')}. The alert fired ${detect.min} minutes after errors began.` },
  parts);
}

export default {
  study: true,
  id: 'timeline',
  title: 'Timeline: events and intervals on true time',
  className: 'st st--left cs-terminal-dark',
  notes: 'Purpose: Show an event sequence where the gaps between events are the finding.\nModify: Edit `events` (minutes from a fixed origin) and the phase boundaries; spacing, flag levels, the phase band, the rail numbers and the headline recompute.\nInvariant: Spacing encodes elapsed time and the page says so; with equal spacing the page must say spacing is order only; phases are computed from event times, never typed; no stem crosses a label.\nStatic: Already static. For a build, reveal flags in time order, then the phase band.',
  sources: [{ type: 'original-example', file: 'assets/svg/timeline.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Checkout failed for ${impact} minutes, and the <em>first alert</em> did not come until minute ${detect.min}</h1>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b class="st-accent">${detect.min} min</b><span>from the first errors to the first page. The rule waits ${alertRule.window} minutes above ${alertRule.threshold}.</span></div>
  <hr class="st-rule">
  <div class="st-kpi"><b>${impact} min</b><span>customers affected, ${clock(at('impact'))}–${clock(at('recovered'))}</span></div>
</div>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · spacing is elapsed time, night of 14 March</span><span>Timeline with phases</span></p>`,
};
