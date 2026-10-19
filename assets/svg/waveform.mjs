// Diagram study · Waveform — instantaneous voltage over time at a stated sample rate, with the RMS
// envelope drawn as what it is: a quantity derived from the same samples, not a new measurement.
// Samples, the half-cycle RMS, the sag depth and duration are all computed from `supply` and `sag`.
import { svgRoot, el, g, textLines, linear, pathFromPoints, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const supply = { f: 50, vrms: 230, fs: 3200, ms: 300, thd5: 0.03 };   // Hz, V, samples/s, record length (ms), 5th-harmonic share
const sag = { start: 72, end: 158, residual: 0.63, recoveryMs: 14 };   // ms; residual = share of nominal during the sag
const threshold = 0.9;   // a dip starts when the RMS falls below 90% of nominal (IEC 61000-4-30 style)

// Samples: sinusoid + 5th harmonic, scaled by a sag envelope with an exponential recovery.
const n = Math.round((supply.fs * supply.ms) / 1000), dt = 1000 / supply.fs, vpk = supply.vrms * Math.SQRT2;
const env = tms => (tms < sag.start ? 1 : tms < sag.end ? sag.residual : 1 - (1 - sag.residual) * Math.exp(-(tms - sag.end) / sag.recoveryMs));
const samples = Array.from({ length: n }, (_, i) => {
  const tms = i * dt, ph = 2 * Math.PI * supply.f * (tms / 1000);
  return { t: tms, v: env(tms) * vpk * (Math.sin(ph) + supply.thd5 * Math.sin(5 * ph + 0.4)) };
});
// Half-cycle-refreshed RMS over one cycle: each value uses the previous 64 samples.
const perCycle = supply.fs / supply.f, half = perCycle / 2;
const rms = [];
for (let end = perCycle; end <= n; end += half) {
  const win = samples.slice(end - perCycle, end);
  rms.push({ t: end * dt, v: Math.sqrt(win.reduce((s, p) => s + p.v ** 2, 0) / win.length) });
}
const below = rms.filter(r => r.v < threshold * supply.vrms);
const dip = { min: Math.min(...rms.map(r => r.v)), from: below[0].t - (1000 / supply.f) / 2, to: below.at(-1).t };
dip.duration = dip.to - dip.from;
const pctMin = Math.round((dip.min / supply.vrms) * 100);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'waveform-fig';
  const box = { x: 58, y: 0, w: 800, h: 412 };
  // y range runs above the peaks so the labels get their own band and never sit on the trace
  const x = linear([0, supply.ms], [box.x, box.x + box.w]), y = linear([-380, 640], [box.y + box.h, box.y]), band = y(470);
  const thrY = y(threshold * supply.vrms);
  // Inset: the same samples, one cycle inside the sag, drawn as dots so the time base is visible.
  const ins = { x: 922, y: 64, w: 230, h: 250 }, t0 = sag.start + 22, t1 = t0 + 1000 / supply.f;
  const ix = linear([t0, t1], [ins.x + 10, ins.x + ins.w - 10]), iy = linear([-260, 260], [ins.y + ins.h - 10, ins.y + 10]);
  const inSamples = samples.filter(p => p.t >= t0 && p.t <= t1);
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Supply voltage waveform during a motor start, with the derived RMS',
    desc: `Instantaneous voltage sampled at ${fmt(supply.fs)} samples per second (${perCycle} per ${supply.f} Hz cycle) over ${supply.ms} ms. The one-cycle RMS, refreshed every half cycle, falls to ${fmt(dip.min, { digits: 0 })} V (${pctMin}% of ${supply.vrms} V) and stays below the ${Math.round(threshold * 100)}% threshold for ${fmt(dip.duration, { digits: 0 })} ms. The RMS line is computed from the same samples.` },
  el('defs', {}, el('clipPath', { id: `${id}-clip` }, el('rect', { x: box.x, y: box.y, width: box.w, height: box.h }))),
  // grid and axes
  [-300, -200, -100, 0, 100, 200, 300].map(v => g({},
    el('line', { x1: box.x, x2: box.x + box.w, y1: y(v), y2: y(v), stroke: v === 0 ? t.c('rule') : t.c('grid'), 'stroke-width': v === 0 ? 1.4 : 1 }),
    textLines([fmt(v, { sign: v > 0 })], { x: box.x - 10, y: y(v), size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
  textLines(['V'], { x: box.x - 10, y: y(400), size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') }),
  [0, 50, 100, 150, 200, 250, 300].map(v => textLines([String(v)], { x: x(v), y: box.y + box.h + 8, size: 15, anchor: v === 0 ? 'start' : v === supply.ms ? 'end' : 'middle', valign: 'top', fill: t.c('muted') })),
  textLines([`Time (ms), sampled ${fmt(supply.fs)} times per second, ${perCycle} per cycle`], { x: box.x + box.w, y: H - 2, size: 15, anchor: 'end', valign: 'bottom', fill: t.c('muted') }),
  // the dip interval, then the raw samples, then the derived RMS
  el('rect', { x: x(dip.from), y: box.y, width: x(dip.to) - x(dip.from), height: box.h, fill: t.c('surface') }),
  textLines([`${fmt(dip.duration, { digits: 0 })} ms below ${Math.round(threshold * 100)}%`], { x: (x(dip.from) + x(dip.to)) / 2, y: box.y + box.h - 12, size: 15, anchor: 'middle', valign: 'bottom', weight: 700, fill: t.c('ink') }),
  el('path', { d: pathFromPoints(samples.map(p => [x(p.t), y(p.v)])), fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.3, 'stroke-linejoin': 'round', 'clip-path': `url(#${id}-clip)` }),
  el('line', { x1: box.x, x2: box.x + box.w, y1: thrY, y2: thrY, stroke: t.c('muted'), 'stroke-width': 1.2, 'stroke-dasharray': '6 5' }),
  el('path', { d: pathFromPoints(rms.map(r => [x(r.t), y(r.v)]), { curve: 'step' }), fill: 'none', stroke: t.c('accent'), 'stroke-width': 3, 'stroke-linejoin': 'round' }),
  // label band: each label drops a leader to the line it names
  [[rms[1].t + 4, y(rms[1].v), ['RMS, derived', '1-cycle window, every ½ cycle'], t.c('accent'), 'start'],
    [dip.to - 20, y(rms.find(r => r.t >= dip.to - 20).v), [`${fmt(dip.min, { digits: 0 })} V`, `${pctMin}% of nominal`], t.c('accent'), 'middle'],
    [282, thrY, ['Dip threshold', `${Math.round(threshold * 100)}% of ${supply.vrms} V`], t.c('muted'), 'end']].map(([tm, ly, lines, c, anchor]) => g({},
    el('line', { x1: x(tm), x2: x(tm), y1: band + 10, y2: ly - 4, stroke: c, 'stroke-width': 1.2 }),
    el('circle', { cx: x(tm), cy: ly, r: 3.5, fill: c }),
    textLines([lines[0]], { x: x(tm) + (anchor === 'start' ? -4 : anchor === 'end' ? 4 : 0), y: band - 20, size: 16, anchor, valign: 'bottom', fill: c, weight: 700 }),
    textLines([lines[1]], { x: x(tm) + (anchor === 'start' ? -4 : anchor === 'end' ? 4 : 0), y: band, size: 15, anchor, valign: 'bottom', fill: c }))),
  // inset with its link back to the main trace
  el('rect', { x: x(t0), y: y(260), width: x(t1) - x(t0), height: y(-260) - y(260), fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }),
  el('path', { d: `M${x(t1)} ${y(260)}L${ins.x} ${ins.y}M${x(t1)} ${y(-260)}L${ins.x} ${ins.y + ins.h}`, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1, 'stroke-dasharray': '3 3' }),
  el('rect', { x: ins.x, y: ins.y, width: ins.w, height: ins.h, rx: 6, fill: t.c('surface'), stroke: t.c('rule') }),
  el('line', { x1: ins.x, x2: ins.x + ins.w, y1: iy(0), y2: iy(0), stroke: t.c('rule') }),
  el('path', { d: pathFromPoints(inSamples.map(p => [ix(p.t), iy(p.v)])), fill: 'none', stroke: t.c('muted'), 'stroke-width': 1 }),
  inSamples.map(p => el('circle', { cx: ix(p.t), cy: iy(p.v), r: 2.4, fill: t.c('ink') })),
  textLines([`One cycle = ${perCycle} samples,`, `${fmt(dt, { digits: 4 })} ms apart`], { x: ins.x, y: ins.y + ins.h + 12, size: 15, valign: 'top', fill: t.c('muted'), lineHeight: 1.3 }),
  textLines(['Detail: the samples'], { x: ins.x, y: ins.y - 10, size: 16, valign: 'bottom', weight: 700, fill: t.c('ink') }));
}

export default {
  study: true,
  id: 'waveform',
  title: 'Waveform: amplitude over time with a stated time base',
  className: 'st cs-terminal-dark',
  notes: 'Purpose: Show how a signal’s amplitude changes over time, with the sampling stated and any envelope marked as derived.\nModify: Edit `supply`, `sag` and `threshold`; samples, the half-cycle RMS, the dip interval and the headline numbers recompute. With logged data, replace `samples` and keep the RMS computation.\nInvariant: The time axis states its unit and the sample rate; the raw trace is drawn from samples, never smoothed; the RMS line is labelled as derived from the same samples; the threshold and its basis are on the page.\nStatic: Already static. For a talk, show the raw trace, then the RMS, then the dip interval.',
  sources: [{ type: 'original-example', file: 'assets/svg/waveform.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">A motor start pulled the supply down to <em>${pctMin}% of nominal</em> for ${fmt(dip.duration, { digits: 0 })} ms <span class="st-quiet">— a sag, not an interruption</span></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · single-phase ${supply.vrms} V, ${supply.f} Hz feeder at a pumping station</span><span>Time waveform with derived RMS</span></p>`,
};
