// Diagram study · Parameter grid — one small panel per (learning rate, batch size) run, all on the same axes.
// Curves come from `runs` (replace `simulate` with your logged losses); the best run, the per-row winners,
// the diverged run and the headline are found from the same numbers.
import { svgRoot, el, g, textLines, linear, pathFromPoints, segments, theme as makeTheme, fmt, arrowMarker } from '../runtime/figure.mjs';

const rates = [0.0001, 0.0003, 0.001, 0.003];   // learning rate (columns)
const batches = [16, 32, 64];                     // batch size (rows)
const epochs = 20;
const fixed = ['AdamW', `${epochs} epochs`, '500 warm-up steps', 'seed 7', 'same train/validation split'];

// Illustrative validation loss per epoch: a saturating fit plus late overfitting, and one run that
// diverges (loss becomes NaN). Replace with logged values: runs = [{ lr, bs, val: [...] }].
function simulate(lr, bs) {
  const r = Math.log10(lr / 0.0003), floor = 0.405 + 0.09 * r * r + 0.005 * Math.log2(bs / 32);
  const tau = 3.2 * (0.0003 / lr) ** 0.85 * (bs / 32) ** 0.35, start = 6 + 8 * (0.0003 / lr) ** 0.5, over = 0.0012 * (lr / 0.0003) ** 0.6 * (32 / bs) ** 0.4;
  return Array.from({ length: epochs + 1 }, (_, e) => {
    if (lr >= 0.003 && bs <= 16 && e >= 5) return e === 5 ? 3.9 : null;   // gradient blow-up, then NaN
    return +(floor + (1.1 - floor) * Math.exp(-e / tau) + over * Math.max(0, e - start) ** 2).toFixed(3);
  });
}
const runs = batches.flatMap(bs => rates.map(lr => ({ lr, bs, val: simulate(lr, bs) })));

// Derived: best epoch per run, divergence, overall best and the winner in each row.
for (const run of runs) {
  const fin = run.val.map((v, e) => [e, v]).filter(([, v]) => v != null && v < 3);
  const [e, v] = fin.reduce((a, b) => (b[1] < a[1] ? b : a));
  run.best = { epoch: e, loss: v };
  run.diverged = run.val.some(v => v == null || v >= 3) ? run.val.findIndex(v => v == null || v >= 3) : null;
}
const best = runs.filter(r => r.diverged == null).reduce((a, b) => (b.best.loss < a.best.loss ? b : a));
const rowWinners = batches.map(bs => runs.filter(r => r.bs === bs && r.diverged == null).reduce((a, b) => (b.best.loss < a.best.loss ? b : a)));
const sameRateWins = rowWinners.every(r => r.lr === best.lr);
const lrText = lr => fmt(lr, { digits: 4 }).replace(/0+$/, '');
const loss = v => fmt(v, { digits: 3 });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'parameter-grid-fig';
  const left = 116, top = 44, gapX = 16, gapY = 20, footer = 30, xAxisH = 24;
  const pw = (W - left - gapX * (rates.length - 1)) / rates.length;
  const ph = (H - top - footer - xAxisH - gapY * (batches.length - 1)) / batches.length;
  const yDom = [0.35, 1.15];  // one range for every panel; values above it are clipped at the top edge
  const panels = runs.map(run => {
    const ci = rates.indexOf(run.lr), ri = batches.indexOf(run.bs);
    const px = left + ci * (pw + gapX), py = top + ri * (ph + gapY);
    const head = 22, x = linear([0, epochs], [px, px + pw]), y = linear(yDom, [py + ph, py + head]);  // label strip above each plot
    const isBest = run === best, div = run.diverged != null;
    const color = isBest ? t.c('accent') : div ? t.c('negative') : t.c('ink');
    const pts = run.val.map((v, e) => [x(e), v == null ? null : y(Math.min(v, yDom[1]))]);
    const parts = [
      el('rect', { x: px, y: py + head - 4, width: pw, height: ph - head + 4, fill: isBest ? t.c('surface') : 'none' }),
      [0.4, 0.6, 0.8, 1.0].map(v => el('line', { fill: 'none', x1: px, x2: px + pw, y1: y(v), y2: y(v), stroke: t.c('grid'), 'stroke-width': 1 })),
      el('line', { fill: 'none', x1: px, x2: px + pw, y1: py + ph, y2: py + ph, stroke: t.c('rule'), 'stroke-width': 1.2 }),
      segments(pts).map(seg => el('path', { d: pathFromPoints(seg), fill: 'none', stroke: color, 'stroke-width': isBest ? 3 : 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' })),
    ];
    if (div) {
      const xe = x(run.diverged - 1), ye = y(run.val[run.diverged - 1] ?? yDom[1]);
      parts.push(el('path', { d: `M${xe} ${ye}L${x(run.diverged)} ${py + head}`, fill: 'none', stroke: color, 'stroke-width': 2, 'marker-end': `url(#${id}-up)` }),
        textLines([`diverged at epoch ${run.diverged}`], { x: px, y: py, size: 15, valign: 'top', fill: color, weight: 600 }));
    } else {
      parts.push(el('circle', { cx: x(run.best.epoch), cy: y(run.best.loss), r: isBest ? 5.5 : 4, fill: color, stroke: t.c('paper'), 'stroke-width': 1.5 }),
        textLines([`best ${loss(run.best.loss)} at epoch ${run.best.epoch}`], { x: px, y: py, size: 15, valign: 'top', fill: isBest ? t.c('accent') : t.c('muted'), weight: isBest ? 700 : 400 }));
    }
    if (ci === 0) parts.push([0.4, 0.8].map(v => textLines([fmt(v, { digits: 1 })], { x: px - 8, y: y(v), size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') })));
    if (ri === batches.length - 1) parts.push([0, 10, 20].map(e => textLines([String(e)], { x: x(e), y: py + ph + 6, size: 15, anchor: e === 0 ? 'start' : e === epochs ? 'end' : 'middle', valign: 'top', fill: t.c('muted') })));
    return g({ 'data-run': `lr-${run.lr}-bs-${run.bs}` }, parts);
  });
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Validation loss for 12 runs: four learning rates by three batch sizes, shared axes',
    desc: `Twelve panels on one y scale (${yDom[0]}–${yDom[1]}) and one epoch scale. Best run: learning rate ${lrText(best.lr)}, batch ${best.bs}, validation loss ${loss(best.best.loss)} at epoch ${best.best.epoch}. ${sameRateWins ? `Learning rate ${lrText(best.lr)} gives the lowest loss at every batch size.` : ''} Learning rate ${lrText(rates.at(-1))} with batch ${batches[0]} diverged. Fixed in all runs: ${fixed.join(', ')}.` },
  el('defs', {}, arrowMarker(`${id}-up`, t.c('negative'))),
  textLines(['Learning rate'], { x: 0, y: 6, size: 17, valign: 'top', weight: 700, fill: t.c('muted') }),
  rates.map((lr, ci) => textLines([lrText(lr)], { x: left + ci * (pw + gapX), y: 6, size: 17, valign: 'top', weight: 700, fill: lr === best.lr ? t.c('accent') : t.c('ink') })),
  batches.map((bs, ri) => g({},
    textLines([`Batch ${bs}`], { x: 0, y: top + ri * (ph + gapY) + ph / 2 - 10, size: 17, valign: 'middle', weight: 700, fill: t.c('ink') }),
    textLines(['val. loss'], { x: 0, y: top + ri * (ph + gapY) + ph / 2 + 12, size: 15, valign: 'middle', fill: t.c('muted') }))),
  panels,
  textLines([`Same in all ${runs.length} runs: ${fixed.join(', ')}`], { x: left, y: H - 2, size: 15, valign: 'bottom', fill: t.c('muted') }),
  textLines(['x: epoch, y: validation loss, one scale'], { x: W, y: H - 2, size: 15, anchor: 'end', valign: 'bottom', fill: t.c('muted') }));
}

export default {
  study: true,
  id: 'parameter-grid',
  title: 'Parameter grid: two varied settings, shared axes',
  className: 'st cs-ml-eval',
  notes: 'Purpose: Compare outcomes across a two-parameter sweep at a glance, with every panel on the same axes so differences are real.\nModify: Replace `rates`, `batches` and `simulate` (or pass logged losses as `runs`); best epochs, the overall best run, per-row winners, divergence and the headline recompute. List the settings you held fixed in `fixed`.\nInvariant: Only the two named parameters vary between panels; every panel shares one y range and one epoch range (no per-panel autoscaling); failed runs stay in the grid and say how they failed.\nStatic: Already static. For a talk, reveal one row at a time, then mark the best run.',
  sources: [{ type: 'original-example', file: 'assets/svg/parameter-grid.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Learning rate <em>${lrText(best.lr)}</em> gives the lowest validation loss${sameRateWins ? ' at every batch size' : ''} <span class="st-quiet">— best run ${loss(best.best.loss)} with batch ${best.bs}</span></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · fine-tuning a text classifier, validation cross-entropy per epoch</span><span>Parameter grid (small multiples)</span></p>`,
};
