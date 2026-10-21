// Composition study · Mechanism and scope — the left two thirds draw how the fix works (a timing
// diagram computed from `expiry`); the right third draws where it has been shown to work (the
// tested envelope) with the real workload plotted against it. Structure and scope share one page.
import { svgRoot, el, textLines, linear, log, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const ID = 'composition-mechanism-scope';
// One hot key expiring under load, from the load-test traces (illustrative).
const expiry = {
  requests: 1764,            // requests for the key that arrived while it was being refreshed
  readMs: 38,                // one database read
  arrivalsMs: [0, 4, 9, 15, 22, 30], // requests drawn on the diagram; the first one takes the lock
  lateMs: 45,                // a request after the refresh: plain cache hit
  before: { reads: 1764, p99Ms: 2400 },
  after: { reads: 1, p99Ms: 41 },
};
// Load-test envelope and the 20 hottest production keys last quarter (peak requests/s, value KB).
const tested = { rps: [200, 5000], kb: [1, 256], runs: 12 };
const keys = [
  [420, 3], [610, 12], [880, 2], [950, 48], [1200, 6], [1350, 120], [1600, 9], [1800, 30], [2100, 4], [2300, 64],
  [2600, 18], [2900, 7], [3300, 90], [3600, 22], [4100, 5], [4400, 160], [4800, 11], [7800, 14], [11200, 8], [1500, 1400],
].map(([rps, kb]) => ({ rps, kb }));

// derived values
const inside = k => k.rps >= tested.rps[0] && k.rps <= tested.rps[1] && k.kb >= tested.kb[0] && k.kb <= tested.kb[1];
const outside = keys.filter(k => !inside(k));
const n0 = v => fmt(v, { digits: 0 });
const kbText = v => (v >= 1000 ? `${fmt(v / 1000)} MB` : `${v} KB`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, mono = t.font('mono');
  const parts = [];
  // ---- mechanism: a timing diagram, x = milliseconds after the key expired
  const tx = linear([0, 50], [104, 604]);
  const rows = [...expiry.arrivalsMs, expiry.lateMs];
  const ry = i => 64 + i * 38;
  const rel = tx(expiry.readMs), last = rows.length - 1;
  parts.push(textLines(['How the lock works: one request reads, the rest wait for its result'], { x: 0, y: 6, size: 17, valign: 'top', fill: t.c('ink'), weight: 650 }));
  for (const v of [0, 10, 20, 30, 40, 50]) {
    parts.push(el('line', { x1: tx(v), x2: tx(v), y1: 44, y2: ry(last) + 20, stroke: t.c('grid') }));
    parts.push(textLines([`${v}`], { x: tx(v), y: ry(last) + 30, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted'), family: mono }));
  }
  parts.push(textLines(['ms after the key expired'], { x: tx(50), y: ry(last) + 54, size: 16, anchor: 'end', valign: 'top', fill: t.c('muted') }));
  rows.forEach((at, i) => {
    const y = ry(i), late = at > expiry.readMs, first = i === 0;
    parts.push(textLines([`req ${i === last ? n0(expiry.requests + 1) : i + 1}`], { x: 0, y, size: 16, valign: 'middle', fill: t.c('muted'), family: mono }));
    parts.push(el('circle', { cx: tx(at), cy: y, r: 5, fill: t.c('ink') }));
    if (first) parts.push(el('rect', { x: tx(at), y: y - 7, width: rel - tx(at), height: 14, rx: 2, fill: t.c('accent') }));
    else if (!late) parts.push(el('line', { x1: tx(at) + 8, x2: rel, y1: y, y2: y, stroke: t.c('muted'), 'stroke-width': 2, 'stroke-dasharray': '2 5', 'stroke-linecap': 'round' }));
    const from = late ? tx(at) : rel, done = from + 16;
    parts.push(el('line', { x1: from, x2: done, y1: y, y2: y, stroke: t.c('ink'), 'stroke-width': 2 }));
    parts.push(el('path', { d: `M${done} ${y - 5}l7 5l-7 5z`, fill: t.c('ink') }));
  });
  // the value reaches every waiting request at the same instant
  parts.push(el('line', { x1: rel, x2: rel, y1: ry(0), y2: ry(expiry.arrivalsMs.length - 1), stroke: t.c('accent'), 'stroke-width': 3 }));
  expiry.arrivalsMs.forEach((_, i) => parts.push(el('circle', { cx: rel, cy: ry(i), r: 4.5, fill: t.c('accent') })));
  parts.push(textLines([`1 database read · ${expiry.readMs} ms`], { x: tx(0), y: ry(0) - 16, size: 16, fill: t.c('accent'), weight: 700 }));
  const waitY = (ry(1) + ry(expiry.arrivalsMs.length - 1)) / 2;
  parts.push(textLines([`${n0(expiry.requests - 1)} other`, 'requests wait,', 'then get the', 'same value'], { x: rel + 34, y: waitY, size: 16, valign: 'middle', lineHeight: 1.3, fill: t.c('ink') }));
  parts.push(textLines(['key fresh again: cache hit'], { x: tx(expiry.lateMs) - 14, y: ry(last), size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted'), halo: t.c('paper') }));
  // before / after, measured on the same load
  const tbY = ry(last) + 98;
  [['without the lock', `${n0(expiry.before.reads)} reads`, `p99 ${fmt(expiry.before.p99Ms / 1000, { digits: 1 })} s`],
    ['with the lock', `${n0(expiry.after.reads)} read`, `p99 ${expiry.after.p99Ms} ms`]].forEach((r, i) => {
    const y = tbY + i * 28, strong = i === 1;
    parts.push(textLines([r[0]], { x: 0, y, size: 17, valign: 'middle', fill: strong ? t.c('ink') : t.c('muted'), weight: strong ? 650 : null }));
    parts.push(textLines([r[1]], { x: 300, y, size: 17, anchor: 'end', valign: 'middle', fill: strong ? t.c('ink') : t.c('muted'), family: mono }));
    parts.push(textLines([r[2]], { x: 450, y, size: 17, anchor: 'end', valign: 'middle', fill: strong ? t.c('ink') : t.c('muted'), family: mono }));
  });
  // ---- scope: the tested envelope against the production workload
  const sx0 = 812, sx1 = W - 4, sy0 = 92, sy1 = 380;
  const sx = log([100, 20000], [sx0, sx1]), sy = log([0.5, 3000], [sy1, sy0]);
  const titleX = sx0 - 72;
  parts.push(textLines(['Where it has been tested'], { x: titleX, y: 6, size: 17, valign: 'top', fill: t.c('ink'), weight: 650 }));
  parts.push(textLines([`${outside.length} of the ${keys.length} hottest keys fall outside`], { x: titleX, y: 32, size: 16, valign: 'top', fill: t.c('muted') }));
  for (const v of [100, 1000, 10000]) {
    parts.push(el('line', { x1: sx(v), x2: sx(v), y1: sy0, y2: sy1, stroke: t.c('grid') }));
    parts.push(textLines([v >= 1000 ? `${v / 1000}k` : `${v}`], { x: sx(v), y: sy1 + 10, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted'), family: mono }));
  }
  for (const v of [1, 10, 100, 1000]) {
    parts.push(el('line', { x1: sx0, x2: sx1, y1: sy(v), y2: sy(v), stroke: t.c('grid') }));
    parts.push(textLines([kbText(v)], { x: sx0 - 10, y: sy(v), size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted'), family: mono }));
  }
  parts.push(textLines(['peak requests / s on the key'], { x: sx1, y: sy1 + 34, size: 16, anchor: 'end', valign: 'top', fill: t.c('muted') }));
  parts.push(textLines(['value size'], { x: titleX, y: sy0 - 24, size: 16, valign: 'middle', fill: t.c('muted') }));
  const ex0 = sx(tested.rps[0]), ex1 = sx(tested.rps[1]), ey0 = sy(tested.kb[1]), ey1 = sy(tested.kb[0]);
  parts.push(el('rect', { x: ex0, y: ey0, width: ex1 - ex0, height: ey1 - ey0, fill: t.c('surface'), stroke: t.c('ink'), 'stroke-width': 1.6, 'stroke-dasharray': '6 4' }));
  parts.push(textLines([`load-tested · ${tested.runs} runs`], { x: ex0, y: ey0 - 8, size: 16, valign: 'bottom', fill: t.c('muted') }));
  for (const k of keys) {
    const out = !inside(k);
    parts.push(el('circle', { cx: sx(k.rps), cy: sy(k.kb), r: out ? 6.5 : 4.5, fill: out ? t.c('paper') : t.c('ink'), stroke: out ? t.c('ink') : 'none', 'stroke-width': out ? 2.2 : null }));
  }
  // direct labels on the keys outside the envelope
  const big = outside.filter(k => k.kb > tested.kb[1]), fast = outside.filter(k => k.rps > tested.rps[1]);
  for (const k of big) parts.push(textLines([`${kbText(k.kb)} value`], { x: sx(k.rps) + 12, y: sy(k.kb), size: 16, valign: 'middle', fill: t.c('ink') }));
  if (fast.length) {
    const top = Math.min(...fast.map(k => sy(k.kb)));
    parts.push(textLines(['sale-day', 'peaks'], { x: sx1, y: top - 16, size: 16, anchor: 'end', valign: 'bottom', lineHeight: 1.25, fill: t.c('ink') }));
  }
  return svgRoot({ id: `${ID}-fig`, width: W, height: H, theme: t,
    title: 'How request coalescing works, and the load range in which it has been tested',
    desc: `Left: when the key expires, the first request reads the database for ${expiry.readMs} ms while the other ${n0(expiry.requests - 1)} wait and receive the same value; later requests hit the refreshed cache. Without the lock the same load caused ${n0(expiry.before.reads)} reads and a p99 of ${fmt(expiry.before.p99Ms / 1000, { digits: 1 })} s. Right: load tests covered ${n0(tested.rps[0])} to ${n0(tested.rps[1])} requests a second and values up to ${tested.kb[1]} KB; ${outside.length} of the ${keys.length} hottest production keys fall outside that range.` },
  parts);
}

export default {
  study: true,
  id: ID,
  title: 'Mechanism and scope: the drawing of how it works shares the page with where it was tested',
  className: 'st cs-terminal-dark cmp-mechanism-scope',
  notes: 'Purpose: Use when a result depends on a mechanism and the audience will generalise it: a fix, a treatment, a process change. The left two thirds explain how it works; the right third shows the conditions under which it has actually been shown, with the real workload plotted against them, so the limit is read with the mechanism and not discovered later.\nModify: Replace `expiry` with your own timing (who acts, who waits, how long) and `tested`/`keys` with your test envelope and the population you will apply it to. The diagram rows, the fan-out, the envelope and the count of keys outside it recompute.\nInvariant: Mechanism and scope are side by side at the same top line, never mechanism on one slide and caveats on another; the scope is drawn (an envelope with the real cases in it), not only stated; the one accent is the single action the mechanism turns on; the headline names the limit in its quiet clause.\nStatic: Already static. As a build, reveal the scope panel after the mechanism, never instead of it.',
  sources: [{ type: 'original-example', file: `assets/compositions/${ID}.mjs` }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" data-region="title">Request coalescing turns ${n0(expiry.before.reads)} database reads per key expiry into <em>one read</em> <span class="st-quiet">— tested up to ${n0(tested.rps[1])} requests a second</span></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative traces · ${tested.runs} load-test runs in one region; production peaks from the last quarter</span><span>Mechanism and scope · timing diagram, test envelope</span></p>`,
};
