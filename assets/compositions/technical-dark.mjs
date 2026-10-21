// Composition study · Technical dark — an incident page where darkness serves code and an instrument.
// The trace, the two brackets and every number in the headline are computed from `samples`
// (10-second readings) and `events`; the code is the real excerpt under review, set in mono,
// in ink, with one amber line: the same amber that marks the retry storm in the trace.
import { svgRoot, el, g, textLines, linear, pathFromPoints, measureText, fmt, theme as makeTheme } from '../runtime/figure.mjs';

const sec = hms => { const [h, m, s] = hms.split(':').map(Number); return h * 3600 + m * 60 + s; };
const clock = t => `${String(Math.floor(t / 3600)).padStart(2, '0')}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}`;
const events = { fail: sec('14:02:00'), promoted: sec('14:02:38'), retriesOff: sec('14:10:40') };
const span = [sec('13:58:00'), sec('14:16:00')];  // the trace's time window

// Illustrative readings at the database proxy every 10 s: requests per second and % of client requests failing.
// Deterministic wobble instead of random noise so the page renders identically everywhere.
const wobble = i => Math.sin(i * 1.7) * 0.6 + Math.sin(i * 0.43) * 0.4;
const samples = [];
for (let t = span[0], i = 0; t <= span[1]; t += 10, i++) {
  let rps, err;
  if (t < events.fail) { rps = 2400 * (1 + 0.025 * wobble(i)); err = 0.1; }
  else if (t < events.retriesOff) { rps = 7900 * (1 + 0.035 * wobble(i)) * Math.min(1, 0.55 + (t - events.fail) / 22); err = t < events.promoted ? 100 : 58 + 6 * wobble(i); }
  else { const k = Math.exp(-(t - events.retriesOff) / 9); rps = 2400 * (1 + 0.025 * wobble(i)) + 5500 * k; err = 0.2 + 50 * k; }
  samples.push({ t, rps: Math.round(rps), err: +err.toFixed(1) });
}
const baseline = samples.filter(s => s.t < events.fail).reduce((a, s) => a + s.rps, 0) / samples.filter(s => s.t < events.fail).length;
const peak = Math.max(...samples.map(s => s.rps));
const outageStart = samples.find(s => s.err > 5).t;
const outageEnd = samples.find(s => s.t > outageStart && s.err <= 5).t;
const failoverSeconds = events.promoted - events.fail;
const outageMinutes = Math.round((outageEnd - outageStart) / 60);
const multiple = fmt(peak / baseline, { digits: 1 });

const code = { file: 'payments/db.py', first: 41, lines: [
  ['', 'def query(sql, *args):'],
  ['', '    for attempt in range(6):'],
  ['', '        try:'],
  ['', '            return pool.execute(sql, *args)'],
  ['', '        except ConnectionError:'],
  ['−', '            time.sleep(0.100)'],
  ['+', '            time.sleep(random.uniform(0, 0.1 * 2**attempt))'],
  ['', '    raise DatabaseUnavailable(sql)'],
] };
const log = [
  [events.fail, 'db-a lost, failover starts'],
  [events.promoted, 'db-b promoted to primary'],
  [events.retriesOff, 'flag payments.db.retry → off'],
  [outageEnd, `errors below 5% (${fmt(samples.find(s => s.t === outageEnd).err, { digits: 1 })}%)`],
];
const hms = t => `${clock(t)}:${String(t % 60).padStart(2, '0')}`;

export function figure(themeArg = 'css') {
  const t = makeTheme(themeArg), W = 1152, H = 236, m = { l: 62, r: 8, t: 34, b: 66 };
  const x = linear(span, [m.l, W - m.r]), y = linear([0, 9000], [H - m.b, m.t]);
  const pts = s => [x(s.t), y(s.rps)];
  const before = samples.filter(s => s.t <= events.fail), storm = samples.filter(s => s.t >= events.fail && s.t <= events.retriesOff), after = samples.filter(s => s.t >= events.retriesOff);
  const mono = t.font('mono'), base = H - m.b;
  const grid = [0, 4000, 8000].map(v => g({},
    el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: v ? t.c('grid') : t.c('rule'), 'stroke-width': 1 }),
    textLines([fmt(v)], { x: m.l - 10, y: y(v), size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted'), family: mono })));
  const ticks = [];
  for (let s = span[0]; s <= span[1]; s += 120) ticks.push(textLines([clock(s)], { x: x(s), y: base + 9, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted'), family: mono }));
  const by = base + 44, x0 = x(outageStart), x1 = x(outageEnd);
  const dimLabel = `Customer-facing outage ${outageMinutes} min, errors above 5%`, dimW = measureText(dimLabel, 16, { weight: 600 });
  return svgRoot({ id: 'composition-technical-dark-fig', width: W, height: H, theme: t,
    title: `Requests per second at the database proxy, ${clock(span[0])}–${clock(span[1])} UTC`,
    desc: `Load sits near ${fmt(Math.round(baseline / 100) * 100)} requests per second, jumps to ${fmt(peak)} (${multiple} times) when the primary fails at ${hms(events.fail)}, stays there after the ${failoverSeconds}-second failover, and falls back only when retries are switched off at ${hms(events.retriesOff)}. Errors stay above 5% for ${outageMinutes} minutes.` },
  textLines(['Requests per second at the database proxy'], { x: 0, y: 2, size: 16, valign: 'top', fill: t.c('muted') }),
  grid, ticks,
  el('rect', { x: x(events.fail), y: m.t, width: x(events.promoted) - x(events.fail), height: base - m.t, fill: t.c('surface') }),
  textLines([`Failover ${failoverSeconds} s`], { x: x(events.fail) - 10, y: y(4000), size: 16, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: 600 }),
  el('path', { d: pathFromPoints(before.map(pts)), fill: 'none', stroke: t.c('ink'), 'stroke-width': 2, 'stroke-linejoin': 'round' }),
  el('path', { d: pathFromPoints(after.map(pts)), fill: 'none', stroke: t.c('ink'), 'stroke-width': 2, 'stroke-linejoin': 'round' }),
  el('path', { d: pathFromPoints(storm.map(pts)), fill: 'none', stroke: t.c('accent'), 'stroke-width': 2.6, 'stroke-linejoin': 'round' }),
  textLines([`Every client retries every 100 ms, in step: ${multiple}× normal load`], { x: (x(events.promoted) + x(events.retriesOff)) / 2, y: y(peak) - 12, size: 16, anchor: 'middle', fill: t.c('accent'), weight: 600 }),
  textLines(['Retries switched off'], { x: x(events.retriesOff + 30) + 10, y: y(5200), size: 16, fill: t.c('ink'), valign: 'middle' }),
  // dimension line, as on an engineering drawing: the measurement sits in a gap in the line
  el('path', { d: `M${x0} ${by - 7}V${by + 7}M${x1} ${by - 7}V${by + 7}M${x0} ${by}H${(x0 + x1) / 2 - dimW / 2 - 12}M${(x0 + x1) / 2 + dimW / 2 + 12} ${by}H${x1}`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.4 }),
  textLines([dimLabel], { x: (x0 + x1) / 2, y: by, size: 16, anchor: 'middle', valign: 'middle', fill: t.c('ink'), weight: 600 }));
}

// Unified-diff numbering: a removed line and its replacement share one number.
let lineNo = code.first;
const codeHtml = code.lines.map(([mark, text]) => {
  const n = mark === '+' ? lineNo - 1 : lineNo++;
  const cls = mark === '−' ? ' td-cause' : mark === '+' ? ' td-fix' : '';
  return `<span class="td-line${cls}"><span class="td-n">${n}</span><span class="td-m">${mark || ' '}</span>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`;
}).join('');

export default {
  study: true,
  id: 'composition-technical-dark',
  title: 'Technical dark: code and an instrument trace on one disciplined dark page',
  className: 'st cs-terminal-dark cmp-techdark',
  notes: 'Purpose: Review an engineering cause and its measured effect together: the trace that shows what happened and the code that made it happen. A dark page suits code and instruments read in a dim room; it is not a mood.\nModify: Replace `samples` and `events` with your own readings and timestamps (the brackets, the headline numbers and the trace recolour themselves), and `code` with the excerpt under review, marking the one changed line with − and its replacement with +. Keep the log to the four or five moments the reader needs.\nInvariant: Flat dark paper; text in ink, never pure white; one amber meaning per page (the cause: the removed line, the storm segment of the trace and the headline phrase); the fix carries a + sign as well as green; code and timestamps in mono without syntax colouring; the surface tint is used only for the code block and the failover window.\nStatic: Already static.',
  sources: [{ type: 'original-example', file: 'assets/compositions/technical-dark.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">A <em>fixed 100 ms retry</em> turned a ${failoverSeconds}-second database failover into a ${outageMinutes}-minute outage</h1>
<figure class="st-fig td-fig" data-region="primary">${figure()}</figure>
<pre class="td-code" data-region="support" aria-label="${code.file}, lines ${code.first} to ${code.first + code.lines.length - 2}, with the fix"><span class="td-file">${code.file}</span>${codeHtml}</pre>
<div class="td-log" data-region="support"><p class="td-log-title">Timeline, UTC</p>${log.map(([t, text]) => `<p><span>${hms(t)}</span>${text}</p>`).join('')}</div>
<p class="st-source" data-region="source"><span>Illustrative incident · 10-second samples at the proxy; fix deployed 15:20 UTC</span><span>Trace and code excerpt</span></p>`,
};
