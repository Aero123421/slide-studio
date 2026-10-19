// Motion study · Drain a queue — ten pull requests pass through one merge queue. Each build is
// a clock snapshot computed from the CI durations; every row is one element that moves from the
// queue to the merged list, in arrival order, and the two counts always sum to the total.
import { svgRoot, el, g, textLines, linear, theme as makeTheme } from '../runtime/figure.mjs';

const opened = '14:00';
const prs = [ // queue order at 14:00; CI minutes per run (illustrative)
  { id: 4821, title: 'Retry budget for payments', ci: 14 }, { id: 4826, title: 'Drop legacy CSV export', ci: 11 },
  { id: 4827, title: 'Index orders.created_at', ci: 19 }, { id: 4830, title: 'Invoice time zones', ci: 12 },
  { id: 4833, title: 'Flag: new checkout', ci: 16 }, { id: 4835, title: 'Upgrade TLS library', ci: 13 },
  { id: 4838, title: 'Batch webhook deliveries', ci: 22 }, { id: 4840, title: 'Onboarding email typo', ci: 11 },
  { id: 4842, title: 'Cache warm-up on deploy', ci: 15 }, { id: 4844, title: 'Rate-limit admin search', ci: 18 },
];
const snapshots = ['14:00', '14:45', '15:30']; // plus the moment the queue empties
const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const clock = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
// One runner, first in, first out: each PR merges when its CI run ends.
let at = toMin(opened);
const runs = prs.map(p => { const start = at; at += p.ci; return { ...p, start, end: at }; });
const drained = at;
const times = [...snapshots.map(toMin), drained];
const stateAt = T => ({ merged: runs.filter(r => r.end <= T), queued: runs.filter(r => r.end > T) });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'motion-queue-drain-fig';
  const colW = 440, qx = 0, mx = W - colW, top = 64, rowH = 32;
  // Row position per build: index within the queue or within the merged list.
  const posAt = (r, T) => {
    const s = stateAt(T), qi = s.queued.indexOf(r);
    return qi >= 0 ? [qx, top + qi * rowH] : [mx, top + s.merged.indexOf(r) * rowH];
  };
  const rows = runs.map(r => {
    const [x0, y0] = posAt(r, times[0]);
    const states = Object.fromEntries(times.map((T, k) => { const [x, y] = posAt(r, T); return [k, { translate: `${x - x0}px ${y - y0}px` }]; }));
    const mergedFrom = times.findIndex(T => r.end <= T);
    const fade = (on, child) => g({ 'data-states': Object.fromEntries(times.map((_, k) => [k, { opacity: on(k) ? 1 : 0 }])), 'data-duration': 400 }, child);
    return g({ 'data-states': states, 'data-duration': 900, 'data-easing': 'smooth' },
      el('line', { x1: x0, x2: x0 + colW, y1: y0 + rowH, y2: y0 + rowH, stroke: t.c('rule') }),
      textLines([`#${r.id}`], { x: x0 + 2, y: y0 + rowH / 2, size: 16, weight: 700, valign: 'middle', fill: t.c('muted'), family: t.font('mono') }),
      textLines([r.title], { x: x0 + 76, y: y0 + rowH / 2, size: 17, valign: 'middle', fill: t.c('ink') }),
      fade(k => k < mergedFrom, textLines([`CI ${r.ci} min`], { x: x0 + colW - 4, y: y0 + rowH / 2, size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted') })),
      fade(k => k >= mergedFrom, textLines([`merged ${clock(r.end)}`], { x: x0 + colW - 4, y: y0 + rowH / 2, size: 16, anchor: 'end', valign: 'middle', fill: t.c('ink') })));
  });
  // Per-build labels: the clock, the two counts, and the run at the head of the queue.
  const perStep = (k, ...content) => g({ 'data-step': k, 'data-until': k === times.length - 1 ? null : k, 'data-motion': 'reveal', 'data-delay': 600 }, content);
  const labels = times.map((T, k) => {
    const s = stateAt(T), last = k === times.length - 1, head = s.queued[0];
    return perStep(k,
      textLines([clock(T)], { x: W / 2, y: 0, size: 34, weight: 700, anchor: 'middle', valign: 'top', fill: last ? t.c('accent') : t.c('ink'), family: t.font('mono') }),
      textLines([last ? 'queue empty' : k ? `${T - toMin(opened)} min in` : 'queue opens'], { x: W / 2, y: 44, size: 16, anchor: 'middle', valign: 'top', fill: last ? t.c('accent') : t.c('muted') }),
      textLines([`${s.queued.length} + ${s.merged.length} = ${runs.length}`], { x: W / 2, y: top + 230, size: 17, anchor: 'middle', valign: 'middle', fill: t.c('muted'), family: t.font('mono') }),
      textLines([`${s.queued.length}`], { x: qx + colW, y: 0, size: 30, weight: 700, anchor: 'end', valign: 'top', fill: t.c('ink') }),
      textLines([`${s.merged.length}`], { x: mx + colW, y: 0, size: 30, weight: 700, anchor: 'end', valign: 'top', fill: t.c('ink') }),
      head ? g({}, el('path', { d: `M${qx + colW + 14} ${top + rowH / 2}h34`, stroke: t.c('accent'), 'stroke-width': 2.4 }),
        el('path', { d: `M${qx + colW + 42} ${top + rowH / 2 - 6}l8 6l-8 6`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 2.4 }),
        textLines([`in CI until ${clock(head.end)}`], { x: qx + colW + 14, y: top + rowH / 2 + 24, size: 16, weight: 600, fill: t.c('accent') })) : '');
  });
  // Merge times on one clock: a tick turns ink once that merge has happened; the cursor marks each snapshot.
  const x = linear([toMin(opened), Math.ceil((drained + 5) / 30) * 30], [0, W]), ay = H - 40;
  const timeline = g({},
    el('line', { x1: 0, x2: W, y1: ay, y2: ay, stroke: t.c('rule'), 'stroke-width': 1.4 }),
    runs.map(r => g({}, el('line', { x1: x(r.end), x2: x(r.end), y1: ay - 16, y2: ay, stroke: t.c('context'), 'stroke-width': 2 }),
      g({ 'data-states': Object.fromEntries(times.map((T, k) => [k, { opacity: r.end <= T ? 1 : 0 }])), 'data-duration': 400 },
        el('line', { x1: x(r.end), x2: x(r.end), y1: ay - 16, y2: ay, stroke: t.c('ink'), 'stroke-width': 2.4 })))),
    Array.from({ length: (x.domain[1] - toMin(opened)) / 30 + 1 }, (_, i) => toMin(opened) + i * 30).map((m, i, all) => textLines([clock(m)], { x: x(m), y: ay + 10, size: 15, anchor: i === 0 ? 'start' : i === all.length - 1 ? 'end' : 'middle', valign: 'top', fill: t.c('muted') })),
    g({ 'data-states': Object.fromEntries(times.map((T, k) => [k, { translate: `${x(T) - x(times[0])}px 0px` }])), 'data-duration': 900, 'data-easing': 'smooth' },
      el('line', { x1: x(times[0]), x2: x(times[0]), y1: ay - 30, y2: ay + 4, stroke: t.c('accent'), 'stroke-width': 2.4 })),
    textLines(['merges'], { x: W, y: ay - 24, size: 15, anchor: 'end', fill: t.c('muted') }));
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Merge queue draining from 14:00, one CI run at a time',
    desc: `${runs.length} pull requests queued at ${opened} merge in arrival order as each CI run finishes; the queue is empty at ${clock(drained)}, ${drained - toMin(opened)} minutes later. Snapshots at ${times.map(clock).join(', ')}.` },
  textLines(['Queue, first in first out'], { x: qx, y: 4, size: 19, weight: 700, valign: 'top', fill: t.c('ink') }),
  textLines(['Merged to main'], { x: mx, y: 4, size: 19, weight: 700, valign: 'top', fill: t.c('ink') }),
  el('line', { x1: qx, x2: qx + colW, y1: top - 10, y2: top - 10, stroke: t.c('muted'), 'stroke-width': 1.4 }),
  el('line', { x1: mx, x2: mx + colW, y1: top - 10, y2: top - 10, stroke: t.c('muted'), 'stroke-width': 1.4 }),
  rows, labels, timeline);
}

export default {
  study: true,
  id: 'motion-queue-drain',
  title: 'Drain a queue',
  className: 'st cs-terminal-dark',
  notes: 'Purpose: Transfer items while preserving order and counts: each build is a clock snapshot of a first-in-first-out queue.\nModify: Edit `prs` (queue order, CI minutes), `opened` and `snapshots`. Merge times, row positions, counts, the head-of-queue note and the headline are simulated from them.\nInvariant: Every row is one element that keeps its place in line; the queue and merged counts sum to the total in every build; the order of merges equals the order of arrival.\nStatic: The final build shows the drained queue, every merge time and the time it emptied.',
  sources: [{ type: 'original-example', file: 'assets/motion/queue-drain.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">The queue emptied at <em>${clock(drained)}</em>, ${drained - toMin(opened)} minutes after it opened, with every pull request merged in arrival order</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative queue · one CI runner, no failed runs</span><span>Motion · clock snapshots of a draining queue (${times.length - 1} builds)</span></p>`,
};
