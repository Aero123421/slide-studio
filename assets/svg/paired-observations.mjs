// Diagram study · Paired observations — the same units measured twice, kept as pairs.
// Left: every repository as one line between two registered axes, with each side's mean.
// Right: the paired differences themselves, with their mean and a t-based 95% CI.
// Pairs, means, the interval and the headline are all computed from `repos`.
import { svgRoot, el, g, textLines, linear, point, mean, sd, tQuantile, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const runs = ['Baseline', 'Candidate'];
const repos = [ // share of the repository's held-out tasks solved, %, same tasks for both models (illustrative)
  { id: 'auth-service', base: 62, cand: 71 }, { id: 'ledger-core', base: 58, cand: 51 },
  { id: 'img-resize', base: 74, cand: 79 }, { id: 'search-index', base: 41, cand: 52 },
  { id: 'etl-nightly', base: 55, cand: 63 }, { id: 'web-checkout', base: 68, cand: 72 },
  { id: 'mobile-sync', base: 36, cand: 47 }, { id: 'pdf-render', base: 70, cand: 64 },
  { id: 'notif-hub', base: 80, cand: 84 }, { id: 'geo-tiles', base: 47, cand: 55 },
  { id: 'rate-limiter', base: 83, cand: 86 }, { id: 'cli-tools', base: 77, cand: 85 },
  { id: 'chat-gateway', base: 52, cand: 60 }, { id: 'cache-proxy', base: 65, cand: 69 },
  { id: 'audit-log', base: 59, cand: 66 }, { id: 'sched-jobs', base: 44, cand: 54 },
];
const diff = r => r.cand - r.base;
const diffs = repos.map(diff), n = repos.length;
const meanDiff = mean(diffs), half = (tQuantile(0.975, n - 1) * sd(diffs)) / Math.sqrt(n);
const ci = [meanDiff - half, meanDiff + half];
const worse = repos.filter(r => diff(r) < 0), better = repos.filter(r => diff(r) > 0);
const pts = v => fmt(v, { digits: 1, sign: true });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, top = 66, bottom = H - 62;
  // left panel: pairs between two registered axes on one shared % scale
  const all = repos.flatMap(r => [r.base, r.cand]);
  const yv = linear([Math.floor(Math.min(...all) / 10) * 10, Math.ceil(Math.max(...all) / 10) * 10], [bottom, top]);
  const xa = 70, xb = 340;
  const means = [mean(repos.map(r => r.base)), mean(repos.map(r => r.cand))];
  const pairs = [...repos].sort((a, b) => Number(diff(a) < 0) - Number(diff(b) < 0)).map(r => {
    const hl = diff(r) < 0, c = hl ? t.c('accent') : t.c('context');
    return g({ class: 'ss-pair' },
      el('line', { x1: xa, y1: yv(r.base), x2: xb, y2: yv(r.cand), stroke: c, 'stroke-width': hl ? 2.6 : 1.6 }),
      el('circle', { cx: xa, cy: yv(r.base), r: hl ? 5 : 3.5, fill: c }), el('circle', { cx: xb, cy: yv(r.cand), r: hl ? 5 : 3.5, fill: c }),
      hl ? textLines([r.id], { x: xb + 12, y: yv(r.cand), size: 15, valign: 'middle', fill: t.c('accent'), weight: 700 }) : '');
  });
  const left = g({ class: 'ss-panel' },
    textLines(['Tasks solved, %'], { x: 0, y: 8, size: 17, valign: 'top', fill: t.c('ink'), weight: 700 }),
    textLines(['one line per repository; black line = mean'], { x: 0, y: 32, size: 15, valign: 'top', fill: t.c('muted') }),
    yv.ticks(4).map(v => g({},
      el('line', { x1: xa - 10, x2: xb + 10, y1: yv(v), y2: yv(v), stroke: t.c('grid'), 'stroke-width': 1 }),
      textLines([fmt(v)], { x: xa - 18, y: yv(v), size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
    [xa, xb].map((x, k) => g({},
      el('line', { x1: x, x2: x, y1: top - 6, y2: bottom + 6, stroke: t.c('rule'), 'stroke-width': 1.5 }),
      textLines([runs[k]], { x, y: bottom + 14, size: 16, anchor: 'middle', valign: 'top', fill: t.c('ink'), weight: 700 }),
      textLines([`mean ${fmt(means[k], { digits: 1 })}`], { x, y: bottom + 36, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') }))),
    pairs,
    // the summary drawn over the pairs it summarises
    el('line', { x1: xa, y1: yv(means[0]), x2: xb, y2: yv(means[1]), stroke: t.c('ink'), 'stroke-width': 4, 'stroke-linecap': 'round' }));
  // right panel: the paired differences, one row per repository, with the mean and its CI
  const rows = [...repos].sort((a, b) => diff(b) - diff(a));
  const x0 = 690, x1 = W - 16;
  const dx = linear([Math.min(-10, Math.floor(Math.min(...diffs) / 5) * 5), Math.max(10, Math.ceil(Math.max(...diffs) / 5) * 5)], [x0, x1]);
  const ry = point(rows.map(r => r.id), [top, bottom], { padding: 0.5 });
  const right = g({ class: 'ss-panel' },
    textLines(['Change per repository, points'], { x: 520, y: 8, size: 17, valign: 'top', fill: t.c('ink'), weight: 700 }),
    textLines([`${runs[1].toLowerCase()} minus ${runs[0].toLowerCase()}, same tasks`], { x: 520, y: 32, size: 15, valign: 'top', fill: t.c('muted') }),
    el('rect', { x: dx(ci[0]), y: top - 8, width: dx(ci[1]) - dx(ci[0]), height: bottom - top + 16, fill: t.c('surface') }),
    dx.ticks(5).map(v => g({},
      el('line', { x1: dx(v), x2: dx(v), y1: top - 8, y2: bottom + 8, stroke: v === 0 ? t.c('ink') : t.c('grid'), 'stroke-width': v === 0 ? 1.4 : 1 }),
      textLines([fmt(v, { sign: true })], { x: dx(v), y: bottom + 14, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') }))),
    el('line', { x1: dx(meanDiff), x2: dx(meanDiff), y1: top - 8, y2: bottom + 8, stroke: t.c('ink'), 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }),
    rows.map(r => {
      const d = diff(r), hl = d < 0, c = hl ? t.c('accent') : t.c('ink');
      return g({},
        el('line', { x1: dx(0), x2: dx(d), y1: ry(r.id), y2: ry(r.id), stroke: hl ? t.c('accent') : t.c('context'), 'stroke-width': 2 }),
        el('circle', { cx: dx(d), cy: ry(r.id), r: 5.5, fill: c }),
        textLines([r.id], { x: 668, y: ry(r.id), size: 15, anchor: 'end', valign: 'middle', fill: hl ? t.c('accent') : t.c('ink'), weight: hl ? 700 : 400 }));
    }),
    // rows run from largest to smallest change, so the bottom-right corner is free for the interval's label
    textLines([`mean ${pts(meanDiff)}`, `95% CI ${pts(ci[0])} to ${pts(ci[1])}`], { x: W, y: bottom - 20, size: 15, anchor: 'end', valign: 'bottom', fill: t.c('ink'), weight: 600, lineHeight: 1.3, halo: t.c('paper') }));
  return svgRoot({ id: 'paired-observations-fig', width: W, height: H, theme: t,
    title: 'Tasks solved per repository by the baseline and candidate models, with paired differences',
    desc: `${better.length} of ${n} repositories improve and ${worse.length} regress (${worse.map(r => `${r.id} ${pts(diff(r))}`).join(', ')}). Mean paired difference ${pts(meanDiff)} points, 95% CI ${pts(ci[0])} to ${pts(ci[1])} (t interval, n = ${n}).` },
  left, right);
}

export default {
  study: true,
  id: 'paired-observations',
  title: 'Paired observations: identity kept when the summary changes',
  className: 'st cs-ml-eval',
  notes: 'Purpose: Show that a change in the summary (the mean) is made of individual pairs, some of which move the other way, by keeping every unit\'s identity visible.\nModify: Replace `repos` (one id, two measurements on the same tasks). Both panels, the means, the paired-difference interval (t-based 95% CI) and the headline recompute.\nInvariant: Both measurements share one scale and are joined unit by unit; the interval is computed from the paired differences, not from two separate means; unit ids stay on the page.\nStatic: Already static. For a build, show the pairs first, then the difference panel.',
  sources: [{ type: 'original-example', file: 'assets/svg/paired-observations.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">The candidate model solves more tasks in ${better.length} of ${n} repositories; ${worse.map(r => `<em>${r.id}</em>`).join(' and ')} regress</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · held-out tasks per repository, identical for both runs</span><span>Paired lines and paired differences</span></p>`,
};
