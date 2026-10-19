/**
 * Slide Studio figure engine — distributions, relationships, uncertainty and
 * model-evaluation charts. Marks are computed from raw values (fig-stats.mjs),
 * so a box, density, interval or curve always matches its data.
 */
import {
  theme, el, g, svgRoot, n, isNum, extent, sum, checkId, measureText, wrapText, blockWidth, textLines, linear, log, band,
  niceDomain, fmt, pct, pathFromPoints, axis, tickLabelWidth, callout, refLine, legend, spreadLabels, normBuild,
  buildAttrs, isHighlighted, plotBox, decimalsOf, textOn,
} from './fig-core.mjs';
import { boxStats, kde, bins as makeBins, ecdf as ecdfPoints, linearFit, rocPoints, prPoints, auc, beeswarm, mean, quantile, calibrationBins, tQuantile } from './fig-stats.mjs';
import { onPalette } from './fig-charts.mjs';

function setup(o, defaults = {}) {
  checkId(o.id);
  if (!o.title) throw Error(`${o.id}: title (accessible name) is required`);
  const t = theme(o.theme), size = o.fontSize ?? 16;
  return { t, id: o.id, size, labelSize: Math.round(size * 1.06), W: o.width ?? defaults.width ?? 1120, H: o.height ?? defaults.height ?? 520, build: normBuild(o.build), locale: o.locale ?? 'en' };
}
function finish(o, ctx, parts, resolve, extraCtx = {}) {
  const notes = (o.annotate || []).map((a, i) => {
    const p = resolve ? resolve(a) : a;
    if (!p) throw Error(`${ctx.id}: annotation ${i} target not found`);
    return callout({ theme: ctx.t, size: a.size ?? ctx.size, bounds: { w: ctx.W, h: ctx.H }, marker: p.marker ?? 'dot', ...a, x: p.x, y: p.y, attrs: a.step ? { 'data-step': a.step, 'data-motion': a.motion || 'reveal', 'data-delay': a.delay || null } : (a.attrs || {}) });
  });
  const extra = typeof o.extra === 'function' ? o.extra({ ...ctx, ...extraCtx }) : (o.extra || '');
  return svgRoot({ id: ctx.id, width: ctx.W, height: ctx.H, title: o.title, desc: o.desc, theme: ctx.t, className: o.className || '', font: o.font || 'sans' },
    o.defs ? el('defs', {}, o.defs) : '', o.before || '', parts, notes, extra, o.after || '');
}
const nf = (o, values, extra = {}) => {
  if (typeof o.format === 'function') return o.format;
  const digits = o.format?.digits ?? Math.min(2, Math.max(0, ...values.filter(isNum).map(v => decimalsOf(v, 2))));
  return v => fmt(v, { locale: o.locale ?? 'en', digits, ...extra, ...(o.format || {}) });
};
const tf = (o, scale, count, key = 'format') => {
  const step = scale.tickStep ? scale.tickStep(count) : 1;
  return v => fmt(v, { locale: o.locale ?? 'en', ...(o[key] || {}), digits: decimalsOf(step, 3) });
};
/** Standard numeric x/y frame: returns {box, x, y, parts} with gridlines and axis titles. */
function frame(o, ctx, { xDomain, yDomain, xTicks = 6, yTicks = 5, xFormat, yFormat, xLabel, yLabel, square = false, yLog = false, xLog = false, rightPad = 24, topPad = 16, gridX = false }) {
  const { t, size } = ctx;
  const yTmp = yLog ? log(yDomain, [ctx.H - 50, 20]) : linear(yDomain, [ctx.H - 50, 20]);
  const yf = yFormat || tf(o, yTmp, yTicks, 'yFormat');
  const left = tickLabelWidth(yTmp, { format: yf, size: size - 1, count: yTicks, tickValues: o.yTickValues }) + 18;
  const m = { left, right: rightPad, top: topPad + (yLabel ? 26 : 0), bottom: 40 + (xLabel ? 26 : 0) };
  let box = plotBox(ctx.W, ctx.H, m);
  if (square) { const s = Math.min(box.w, box.h); box = { x: box.x, y: box.y + (box.h - s) / 2, w: s, h: s }; }
  const x = xLog ? log(xDomain, [box.x, box.x + box.w]) : linear(xDomain, [box.x, box.x + box.w]);
  const y = yLog ? log(yDomain, [box.y + box.h, box.y]) : linear(yDomain, [box.y + box.h, box.y]);
  const xf = xFormat || tf(o, x, xTicks, 'xFormat');
  const parts = [
    axis(y, { orient: 'left', at: box.x, grid: [box.x, box.x + box.w], theme: t, size: size - 1, format: yf, count: yTicks, tickValues: o.yTickValues }),
    axis(x, { orient: 'bottom', at: box.y + box.h, theme: t, size: size - 1, format: xf, count: xTicks, tickSize: 5, grid: gridX ? [box.y, box.y + box.h] : null, tickValues: o.xTickValues }),
    el('line', { x1: box.x, x2: box.x + box.w, y1: box.y + box.h, y2: box.y + box.h, stroke: t.c('ink'), 'stroke-width': 1.2 }),
  ];
  if (yLabel) parts.push(textLines([yLabel], { x: box.x - left + 4, y: box.y - 16, size: size - 1, fill: t.c('muted'), cls: 'ss-unit' }));
  if (xLabel) parts.push(textLines([xLabel], { x: box.x + box.w, y: box.y + box.h + 62, size: size - 1, anchor: 'end', fill: t.c('muted'), cls: 'ss-unit' }));
  return { box, x, y, parts };
}

/**
 * Words used in the small statistics captions (n, median). English by default,
 * Japanese when locale is ja; override with o.words = {n, median, sep}.
 */
function words(o, ctx) {
  const ja = String(ctx.locale || '').startsWith('ja');
  return { n: 'n', median: ja ? '中央値' : 'median', sep: ja ? '　' : ' · ', ...(o.words || {}) };
}

// ---------------------------------------------------------------- distributions

/**
 * Histogram from raw values. bins: count or thresholds; highlightRange [lo, hi]
 * colors bins inside the range; marks: [{value, label}] add reference lines.
 */
export function histogram(o) {
  const ctx = setup(o);
  const { t, size, build } = ctx;
  const b = makeBins(o.values, { count: o.bins ?? 12, thresholds: Array.isArray(o.bins) ? o.bins : o.thresholds, domain: o.domain });
  const maxC = Math.max(...b.map(q => q.count));
  const fr = frame(o, ctx, { xDomain: [b[0].x0, b.at(-1).x1], yDomain: niceDomain([0, maxC], 4), yTicks: 4, xLabel: o.xLabel, yLabel: o.yLabel ?? 'Count', yFormat: v => fmt(v, { digits: 0, locale: ctx.locale }), xTicks: o.xTicks ?? 6 });
  const { x, y, parts } = fr;
  b.forEach((q, k) => {
    const inRange = o.highlightRange ? q.x0 >= o.highlightRange[0] && q.x1 <= o.highlightRange[1] : true;
    parts.push(el('rect', { x: x(q.x0) + 1, y: y(q.count), width: Math.max(0, x(q.x1) - x(q.x0) - 2), height: y(0) - y(q.count), fill: o.highlightRange ? (inRange ? t.c('highlight') : t.c('context')) : t.cat(0), style: build ? 'transform-origin:50% 100%' : null, ...buildAttrs(build, { i: k, motion: 'grow-y' }) }));
  });
  for (const mk of o.marks || []) parts.push(refLine({ orient: 'v', at: x(mk.value), from: fr.box.y + (mk.offset ?? 0), to: y(0), label: mk.label, theme: t, size: size - 1, color: t.c('ink') }));
  return finish(o, ctx, parts, a => ({ x: x(a.at), y: y(b.find(q => a.at >= q.x0 && a.at < q.x1)?.count ?? 0) }), { x, y, box: fr.box, bins: b });
}

/** Empirical CDFs: series [{name, values}]; reading guide at the median (F = 0.5). */
export function ecdfChart(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  const all = o.series.flatMap(s => s.values);
  const lw = Math.max(...o.series.map(s => measureText(s.name, labelSize, { weight: 700 }))) + 20;
  const fr = frame(o, ctx, { xDomain: o.domain || niceDomain(extent(all), 6), yDomain: [0, 1], yTicks: 4, yFormat: v => pct(v), xLabel: o.xLabel, yLabel: o.yLabel ?? 'Share at or below', rightPad: lw });
  const { x, y, parts, box } = fr;
  const ends = [];
  o.series.forEach((s, k) => {
    const pts = ecdfPoints(s.values), c = o.highlight != null ? (isHighlighted(o.highlight, s, 'name') ? t.c('highlight') : t.c('context')) : t.cat(k);
    const path = [[x.domain[0], 0], ...pts].map(([a, b]) => [x(a), y(b)]);
    parts.push(el('path', { d: pathFromPoints([...path, [x(x.domain[1]), y(1)]], { curve: 'step' }), fill: 'none', stroke: c, 'stroke-width': 3, 'stroke-linejoin': 'round', pathLength: build ? 1 : null, ...buildAttrs(build, { s: k, motion: 'draw' }) }));
    if (o.medians !== false) {
      const md = quantile(s.values, 0.5);
      parts.push(el('line', { x1: x(md), x2: x(md), y1: y(0.5), y2: y(0), stroke: c, 'stroke-width': 1.2, 'stroke-dasharray': '3 4' }));
    }
    ends.push({ id: k, y: y(1) + 14 + k * 0, h: labelSize * 1.3, s, c });
  });
  if (o.medians !== false) parts.push(el('line', { x1: box.x, x2: box.x + box.w, y1: y(0.5), y2: y(0.5), stroke: t.c('muted'), 'stroke-width': 1, 'stroke-dasharray': '2 4' }));
  const placed = spreadLabels(o.series.map((s, k) => ({ id: k, y: y(0.5) + (k - (o.series.length - 1) / 2) * labelSize * 1.4, h: labelSize * 1.3 })), { min: box.y, max: box.y + box.h });
  const textOf = k => (o.highlight != null && !isHighlighted(o.highlight, o.series[k], 'name') ? t.c('muted') : ends[k].c);
  for (const p of placed) parts.push(textLines([o.series[p.id].name], { x: box.x + box.w + 12, y: p.y, size: labelSize, valign: 'middle', fill: textOf(p.id), weight: 700 }));
  return finish(o, ctx, parts, a => ({ x: x(a.at), y: y(a.y ?? 0.5) }), { x, y, box });
}

/**
 * Box plots computed with Tukey rules. groups: [{label, values}].
 * points: 'swarm' (default) shows every observation behind the box.
 */
export function boxPlot(o) {
  const ctx = setup(o);
  const W = words(o, ctx);
  const { t, size, labelSize, build } = ctx;
  const stats = o.groups.map(gp => ({ ...gp, s: boxStats(gp.values) }));
  const all = o.groups.flatMap(gp => gp.values);
  const vfPre = nf(o, all);
  const lw = Math.max(...stats.map(gp => Math.max(measureText(gp.label, labelSize, { weight: 600 }), measureText(`${W.n} = ${gp.s.n}${W.sep}${W.median} ${vfPre(gp.s.median)}`, Math.max(15, size - 3))))) + 24;
  ctx.H = o.height ?? Math.max(200, o.groups.length * (o.rowHeight ?? 86) + 70);
  // Observations sit in a one-sided dot strip under each box: each dot takes the lowest
  // free level, so no two dots overlap; the last group's strip gets room above the axis.
  const xPre = linear(o.domain || niceDomain(extent(all), 6), [lw, ctx.W - 30]);
  const dodgeOf = xs => { const lv = []; return [...xs].sort((a, b) => a - b).map(px => { let L = 0; while ((lv[L] ?? -Infinity) > px - 6.6) L++; lv[L] = px; return { x: px, level: L }; }); };
  const levelsMax = o.points === 'none' ? 0 : Math.max(0, ...o.groups.map(gp => Math.max(0, ...dodgeOf(gp.values.map(xPre)).map(p => p.level))));
  const box = plotBox(ctx.W, ctx.H, { left: lw, right: 30, top: 10, bottom: 44 + (o.xLabel ? 24 : 0) });
  const stripH = o.points === 'none' ? 0 : 9 + levelsMax * 6.4 + 10; // room for the last group's dots above the axis
  const x = linear(o.domain || niceDomain(extent(all), 6), [box.x, box.x + box.w]);
  const dodge = o.groups.map(gp => (o.points === 'none' ? [] : dodgeOf(gp.values.map(x))));
  const yb = band(o.groups.map(gp => gp.label), [box.y, box.y + box.h - stripH], { inner: 0.45, outer: 0.15 });
  const vf = nf(o, all);
  const parts = [axis(x, { orient: 'bottom', at: box.y + box.h, grid: [box.y, box.y + box.h], theme: t, size: size - 1, format: tf(o, x, 6), count: 6 })];
  if (o.xLabel) parts.push(textLines([o.xLabel], { x: box.x + box.w, y: ctx.H - 4, size: size - 1, anchor: 'end', fill: t.c('muted') }));
  stats.forEach((gp, k) => {
    const cy = yb.center(gp.label), h = yb.bw, s = gp.s, hl = o.highlight == null || isHighlighted(o.highlight, gp);
    const c = hl ? (o.highlight != null ? t.c('highlight') : t.cat(0)) : t.c('muted');
    const items = [];
    if (o.points !== 'none') for (const p of dodge[k]) items.push(el('circle', { cx: p.x, cy: cy + h * 0.5 + 9 + p.level * 6.4, r: 3.2, fill: t.c('context') }));
    items.push(el('line', { x1: x(s.lo), x2: x(s.q1), y1: cy, y2: cy, stroke: t.c('ink'), 'stroke-width': 1.6 }));
    items.push(el('line', { x1: x(s.q3), x2: x(s.hi), y1: cy, y2: cy, stroke: t.c('ink'), 'stroke-width': 1.6 }));
    items.push(el('line', { x1: x(s.lo), x2: x(s.lo), y1: cy - h * 0.22, y2: cy + h * 0.22, stroke: t.c('ink'), 'stroke-width': 1.6 }));
    items.push(el('line', { x1: x(s.hi), x2: x(s.hi), y1: cy - h * 0.22, y2: cy + h * 0.22, stroke: t.c('ink'), 'stroke-width': 1.6 }));
    items.push(el('rect', { x: x(s.q1), y: cy - h / 2, width: Math.max(1, x(s.q3) - x(s.q1)), height: h, rx: 3, fill: hl && o.highlight != null ? t.seq(1) : t.c('surface'), stroke: c, 'stroke-width': 2 }));
    items.push(el('line', { x1: x(s.median), x2: x(s.median), y1: cy - h / 2, y2: cy + h / 2, stroke: c, 'stroke-width': 4 }));
    for (const v of s.outliers) items.push(el('circle', { cx: x(v), cy, r: 4.5, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.5 }));
    parts.push(g({ class: 'ss-box', ...buildAttrs(build, { i: k, motion: 'reveal' }) }, items));
    parts.push(textLines([gp.label], { x: box.x - 16, y: cy - 8, size: labelSize, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: 600 }));
    parts.push(textLines([`${W.n} = ${s.n}${W.sep}${W.median} ${vf(s.median)}`], { x: box.x - 16, y: cy + 13, size: Math.max(15, size - 3), anchor: 'end', valign: 'middle', fill: t.c('muted') }));
  });
  const resolve = a => { const gp = stats.find(q => q.label === a.at); return gp && { x: x(a.value ?? gp.s.median), y: yb.center(gp.label) - yb.bw / 2 }; };
  return finish(o, ctx, parts, resolve, { x, box });
}

/** Violin plots (Gaussian KDE, Silverman bandwidth unless given) with median and IQR. */
export function violinPlot(o) {
  const ctx = setup(o);
  const W = words(o, ctx);
  const { t, size, labelSize, build } = ctx;
  const all = o.groups.flatMap(gp => gp.values);
  const [d0, d1] = o.domain || niceDomain(extent(all), 5);
  const vf = nf(o, all);
  const yTmp = linear([d0, d1], [ctx.H - 60, 20]);
  const left = tickLabelWidth(yTmp, { format: tf(o, yTmp, 5), size: size - 1 }) + 18;
  const box = plotBox(ctx.W, ctx.H, { left, right: 10, top: 14 + (o.yLabel ? 24 : 0), bottom: 52 });
  const y = linear([d0, d1], [box.y + box.h, box.y]);
  const xb = band(o.groups.map(gp => gp.label), [box.x, box.x + box.w], { inner: 0.3, outer: 0.1 });
  const grid = Array.from({ length: 60 }, (_, i) => d0 + ((d1 - d0) * i) / 59);
  const dens = o.groups.map(gp => kde(gp.values, grid, o.bandwidth));
  const maxD = Math.max(...dens.flat().map(p => p[1]));
  const parts = [axis(y, { orient: 'left', at: box.x, grid: [box.x, box.x + box.w], theme: t, size: size - 1, format: tf(o, y, 5) })];
  if (o.yLabel) parts.push(textLines([o.yLabel], { x: 4, y: 16, size: size - 1, fill: t.c('muted') }));
  o.groups.forEach((gp, k) => {
    const cx = xb.center(gp.label), half = xb.bw / 2, d = dens[k];
    const right = d.map(([v, dd]) => [cx + (dd / maxD) * half, y(v)]), leftSide = d.map(([v, dd]) => [cx - (dd / maxD) * half, y(v)]).reverse();
    const hl = o.highlight == null || isHighlighted(o.highlight, gp);
    const s = boxStats(gp.values);
    parts.push(g({ class: 'ss-violin', ...buildAttrs(build, { i: k, motion: 'settle' }) },
      el('path', { d: pathFromPoints([...right, ...leftSide], { curve: 'monotone', close: true }), fill: hl ? (o.highlight != null ? t.seq(2) : t.seq(1)) : t.c('grid'), stroke: hl ? t.c('ink') : t.c('muted'), 'stroke-width': 1.4 }),
      el('line', { x1: cx, x2: cx, y1: y(s.q1), y2: y(s.q3), stroke: t.c('ink'), 'stroke-width': 6, 'stroke-linecap': 'round' }),
      el('circle', { cx, cy: y(s.median), r: 5.5, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 2 })));
    parts.push(textLines([gp.label], { x: cx, y: box.y + box.h + 12, size: labelSize, anchor: 'middle', valign: 'top', fill: t.c('ink'), weight: 600 }));
    parts.push(textLines([`${W.median} ${vf(s.median)}`], { x: cx, y: box.y + box.h + 34, size: Math.max(15, size - 3), anchor: 'middle', valign: 'top', fill: t.c('muted') }));
  });
  return finish(o, ctx, parts, a => { const gp = o.groups.find(q => q.label === a.at); return gp && { x: xb.center(gp.label) + xb.bw / 2, y: y(a.value ?? boxStats(gp.values).median) }; }, { y, box });
}

/** Strip / beeswarm plot: every observation, grouped by row, median marked. */
export function stripPlot(o) {
  const ctx = setup(o);
  const W = words(o, ctx);
  const { t, size, labelSize, build } = ctx;
  const all = o.groups.flatMap(gp => gp.values);
  ctx.H = o.height ?? Math.max(160, o.groups.length * (o.rowHeight ?? 90) + 60);
  const lw = Math.max(...o.groups.map(gp => measureText(gp.label, labelSize, { weight: 600 }))) + 24;
  const box = plotBox(ctx.W, ctx.H, { left: lw, right: 24, top: 10, bottom: 44 });
  const x = linear(o.domain || niceDomain(extent(all), 6), [box.x, box.x + box.w]);
  const yb = band(o.groups.map(gp => gp.label), [box.y, box.y + box.h], { inner: 0.2, outer: 0.05 });
  const vf = nf(o, all);
  const r = o.radius ?? 5;
  const parts = [axis(x, { orient: 'bottom', at: box.y + box.h, grid: [box.y, box.y + box.h], theme: t, size: size - 1, format: tf(o, x, 6) })];
  o.groups.forEach((gp, k) => {
    const cy = yb.center(gp.label), hl = o.highlight == null || isHighlighted(o.highlight, gp);
    const sw = beeswarm(gp.values.map(v => x(v)), { r, gap: 1 });
    const md = quantile(gp.values, 0.5);
    parts.push(g({ class: 'ss-strip', ...buildAttrs(build, { i: k, motion: 'reveal' }) },
      sw.map(p => el('circle', { cx: p.x, cy: cy + p.y, r, fill: hl ? (o.highlight != null ? t.c('highlight') : t.cat(k)) : t.c('context'), stroke: t.c('paper'), 'stroke-width': 1 })),
      el('line', { x1: x(md), x2: x(md), y1: cy - yb.bw / 2, y2: cy + yb.bw / 2, stroke: t.c('ink'), 'stroke-width': 2.5 })));
    parts.push(textLines([gp.label], { x: box.x - 16, y: cy - 8, size: labelSize, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: 600 }));
    parts.push(textLines([`${W.median} ${vf(md)}`], { x: box.x - 16, y: cy + 13, size: Math.max(15, size - 3), anchor: 'end', valign: 'middle', fill: t.c('muted') }));
  });
  return finish(o, ctx, parts, null, { x, box });
}

// ---------------------------------------------------------------- relationships

/**
 * Scatter plot. points: [{x, y, label?, group?}]. fit: 'linear' adds an OLS
 * line with the confidence band of the mean (level 0.95 by default).
 * labels: 'highlight' | 'all' | 'none'. quadrants: {x, y, labels:[tl,tr,bl,br]}.
 */
export function scatterPlot(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  const pts = o.points.filter(p => isNum(p.x) && isNum(p.y));
  const groups = [...new Set(pts.map(p => p.group).filter(v => v != null))];
  const fit = o.fit ? linearFit(pts.map(p => [p.x, p.y]), { level: o.level ?? 0.95 }) : null;
  const xDomain = o.xDomain || niceDomain(extent(pts.map(p => p.x)), 6), yDomain = o.yDomain || niceDomain(extent([...pts.map(p => p.y), ...(fit ? fit.band.flatMap(b => [b.lo, b.hi]) : [])]), 5);
  const legendPad = groups.length > 1 ? 30 : 0;
  const fr = frame(o, ctx, { xDomain, yDomain, xLabel: o.xLabel, yLabel: o.yLabel, rightPad: o.rightPad ?? 30, topPad: 16 + legendPad, gridX: o.gridX ?? true });
  const { x, y, parts, box } = fr;
  if (o.quadrants) {
    const q = o.quadrants;
    parts.push(el('line', { x1: x(q.x), x2: x(q.x), y1: box.y, y2: box.y + box.h, stroke: t.c('ink'), 'stroke-width': 1.2, 'stroke-dasharray': '6 5' }));
    parts.push(el('line', { x1: box.x, x2: box.x + box.w, y1: y(q.y), y2: y(q.y), stroke: t.c('ink'), 'stroke-width': 1.2, 'stroke-dasharray': '6 5' }));
    const [tl, tr, bl, br] = q.labels || [];
    if (tl) parts.push(textLines([tl], { x: box.x + 10, y: box.y + 8, size: size - 1, valign: 'top', fill: t.c('muted'), weight: 700 }));
    if (tr) parts.push(textLines([tr], { x: box.x + box.w - 10, y: box.y + 8, size: size - 1, anchor: 'end', valign: 'top', fill: t.c('muted'), weight: 700 }));
    if (bl) parts.push(textLines([bl], { x: box.x + 10, y: box.y + box.h - 10, size: size - 1, valign: 'bottom', fill: t.c('muted'), weight: 700 }));
    if (br) parts.push(textLines([br], { x: box.x + box.w - 10, y: box.y + box.h - 10, size: size - 1, anchor: 'end', valign: 'bottom', fill: t.c('muted'), weight: 700 }));
  }
  if (fit) {
    const up = fit.band.map(b => [x(b.x), y(b.hi)]), dn = fit.band.map(b => [x(b.x), y(b.lo)]).reverse();
    if (o.band !== false) parts.push(el('path', { d: pathFromPoints([...up, ...dn], { close: true }), fill: t.seq(1), opacity: 0.7, class: 'ss-ci', ...buildAttrs(build && { ...build, start: build.start + 1 }, { motion: 'reveal' }) }));
    parts.push(el('path', { d: pathFromPoints(fit.band.map(b => [x(b.x), y(b.y)])), fill: 'none', stroke: o.fitColor ?? t.c('accent'), 'stroke-width': 3, 'stroke-linecap': 'round', pathLength: build ? 1 : null, ...buildAttrs(build && { ...build, start: build.start + 1 }, { motion: 'draw' }) }));
  }
  const r = o.radius ?? 6;
  const colorOf = p => (o.highlight != null ? (isHighlighted(o.highlight, p) ? t.c('highlight') : t.c('context')) : groups.length ? t.cat(groups.indexOf(p.group)) : t.cat(0));
  const ordered = [...pts].sort((a, b) => Number(isHighlighted(o.highlight, a)) - Number(isHighlighted(o.highlight, b)));
  ordered.forEach((p, k) => parts.push(el('circle', { cx: x(p.x), cy: y(p.y), r: isHighlighted(o.highlight, p) ? r + 1.5 : r, fill: colorOf(p), stroke: t.c('paper'), 'stroke-width': 1.5, 'fill-opacity': o.highlight != null && !isHighlighted(o.highlight, p) ? 0.9 : null, ...buildAttrs(build, { i: k, motion: 'settle' }) })));
  const labelled = o.labels === 'all' ? pts : o.labels === 'none' ? [] : pts.filter(p => p.label && (o.highlight != null ? isHighlighted(o.highlight, p) : p.labelled));
  const placed = spreadLabels(labelled.map((p, k) => ({ id: k, y: y(p.y), h: labelSize * 1.2 })), { min: box.y, max: box.y + box.h, gap: 2 });
  placed.forEach(pl => {
    const p = labelled[pl.id], rightSide = x(p.x) < box.x + box.w * 0.82;
    parts.push(textLines([p.label], { x: x(p.x) + (rightSide ? r + 7 : -r - 7), y: pl.y, size: labelSize - 1, anchor: rightSide ? 'start' : 'end', valign: 'middle', fill: t.c('ink'), weight: 700, halo: t.c('paper') }));
  });
  if (groups.length > 1) parts.push(legend(groups.map((gname, k) => ({ label: String(gname), color: t.cat(k), shape: 'dot' })), { x: box.x, y: 12, size: size - 1, theme: t }));
  if (fit && o.fitLabel !== false) {
    const last = fit.band.at(-1);
    parts.push(textLines([o.fitLabel || `Fit: slope ${fmt(fit.slope, { digits: 2, locale: ctx.locale })}, R² ${fmt(fit.r2, { digits: 2 })}`], { x: x(last.x) - 4, y: y(last.hi) - 10, size: size - 1, anchor: 'end', fill: o.fitColor ?? t.c('accent'), weight: 700, halo: t.c('paper'), attrs: buildAttrs(build && { ...build, start: build.start + 1 }, { label: true }) }));
  }
  const resolve = a => { const p = typeof a.at === 'string' ? pts.find(q => q.label === a.at) : a.at; return p && { x: x(p.x), y: y(p.y) }; };
  return finish(o, ctx, parts, resolve, { x, y, box, fit });
}

/**
 * Heatmap. rows, cols, values[r][c]. scale: 'sequential' | 'diverging' (center
 * at `center`, default 0). Cell labels use contrast-checked text colors.
 */
export function heatmap(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  const vals = o.values.flat().filter(isNum);
  const [lo, hi] = o.domain || extent(vals);
  const div = o.scale === 'diverging', center = o.center ?? 0;
  const vf = nf(o, vals);
  const rowW = Math.max(...o.rows.map(r => measureText(r, labelSize))) + 18;
  const colH = o.colLabelLines === 1 ? size + 18 : size * 2.4 + 16;
  const legendH = o.legend === false ? 0 : 46;
  const box = plotBox(ctx.W, ctx.H, { left: rowW, right: 8, top: colH, bottom: legendH + 6 });
  const gap = o.gap ?? 3;
  const cw = (box.w - gap * (o.cols.length - 1)) / o.cols.length, ch = (box.h - gap * (o.rows.length - 1)) / o.rows.length;
  const steps = div ? t.values.div.length : t.values.seq.length;
  const idx = v => {
    if (!isNum(v)) return null;
    if (div) { const m = Math.max(Math.abs(lo - center), Math.abs(hi - center)) || 1; return Math.round(((v - center) / m + 1) / 2 * (steps - 1)); }
    return Math.round(((v - lo) / ((hi - lo) || 1)) * (steps - 1));
  };
  const parts = [];
  o.cols.forEach((c, ci) => parts.push(textLines(wrapText(String(c), cw + gap, size - 1).slice(0, 2), { x: box.x + ci * (cw + gap) + cw / 2, y: box.y - 10, size: size - 1, anchor: 'middle', valign: 'bottom', fill: t.c('muted'), lineHeight: 1.15 })));
  o.rows.forEach((r, ri) => {
    parts.push(textLines([String(r)], { x: box.x - 12, y: box.y + ri * (ch + gap) + ch / 2, size: labelSize, anchor: 'end', valign: 'middle', fill: t.c('ink') }));
    o.cols.forEach((c, ci) => {
      const v = o.values[ri][ci], k = idx(v);
      const fill = k == null ? t.c('surface') : div ? t.div(k) : t.seq(k);
      const hl = o.highlight && o.highlight(ri, ci, v);
      parts.push(el('rect', { x: box.x + ci * (cw + gap), y: box.y + ri * (ch + gap), width: cw, height: ch, rx: 2, fill, stroke: hl ? t.c('ink') : null, 'stroke-width': hl ? 2.5 : null, ...buildAttrs(build, { i: ri * o.cols.length + ci, s: ri, motion: 'reveal' }) }));
      if (o.cellLabels !== false && cw > measureText(vf(v ?? 0), Math.max(15, size - 2)) + 6 && ch > size) {
        const on = k == null ? t.c('muted') : onPalette(t, div ? 'div' : 'seq', k);
        parts.push(textLines([isNum(v) ? vf(v) : '–'], { x: box.x + ci * (cw + gap) + cw / 2, y: box.y + ri * (ch + gap) + ch / 2, size: Math.max(15, size - 2), anchor: 'middle', valign: 'middle', fill: on, weight: hl ? 700 : 500, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
      }
    });
  });
  if (o.legend !== false) {
    const lx = box.x, ly = ctx.H - legendH + 16, sw = Math.min(46, box.w / steps / 1.5);
    for (let k = 0; k < steps; k++) parts.push(el('rect', { x: lx + k * sw, y: ly, width: sw - 2, height: 12, fill: div ? t.div(k) : t.seq(k) }));
    parts.push(textLines([o.legendLow ?? vf(div ? center - Math.max(Math.abs(lo - center), Math.abs(hi - center)) : lo)], { x: lx, y: ly + 30, size: Math.max(15, size - 2), fill: t.c('muted') }));
    parts.push(textLines([o.legendHigh ?? vf(div ? center + Math.max(Math.abs(lo - center), Math.abs(hi - center)) : hi)], { x: lx + steps * sw - 2, y: ly + 30, size: Math.max(15, size - 2), anchor: 'end', fill: t.c('muted') }));
    if (o.legendTitle) parts.push(textLines([o.legendTitle], { x: lx + steps * sw + 14, y: ly + 10, size: size - 1, fill: t.c('muted'), valign: 'middle' }));
  }
  const resolve = a => { const ri = o.rows.indexOf(a.row), ci = o.cols.indexOf(a.col); return ri >= 0 && ci >= 0 ? { x: box.x + ci * (cw + gap) + cw, y: box.y + ri * (ch + gap) + ch / 2 } : null; };
  return finish(o, ctx, parts, resolve, { box, cw, ch, gap });
}

/**
 * Confusion matrix. labels: class names; matrix[actual][predicted] counts.
 * Shows counts and row-normalized rates (recall per class) with the diagonal emphasized.
 */
export function confusionMatrix(o) {
  const ctx = setup(o, { width: 760, height: 560 });
  const { t, size, labelSize, build } = ctx;
  const L = o.labels, M = o.matrix, k = L.length;
  const rowTot = M.map(r => sum(r));
  const rowW = Math.max(...L.map(l => measureText(l, labelSize))) + 24;
  const colLines = Math.max(...L.map(l => wrapText(l, Math.max(60, (Math.min(ctx.W - rowW - 44, ctx.H - size * 2 - 44) / L.length) - 8), labelSize - 1).length));
  const box = plotBox(ctx.W, ctx.H, { left: rowW + 34, right: 10, top: size * 2 + 34 + (colLines - 1) * (labelSize - 1) * 1.15, bottom: 10 });
  const side = Math.min(box.w, box.h), cell = side / k;
  const ox = box.x, oy = box.y;
  const parts = [];
  parts.push(textLines([o.predictedLabel ?? 'Predicted'], { x: ox + side / 2, y: 8, size: size - 1, anchor: 'middle', valign: 'top', fill: t.c('muted'), weight: 700, letterSpacing: 0.02 }));
  parts.push(textLines([o.actualLabel ?? 'Actual'], { x: 6, y: oy + side / 2, size: size - 1, valign: 'middle', fill: t.c('muted'), weight: 700, attrs: { transform: `rotate(-90 ${n(14)} ${n(oy + side / 2)})`, x: 14, 'text-anchor': 'middle' } }));
  L.forEach((l, i) => {
    parts.push(textLines(wrapText(l, cell - 8, labelSize - 1), { x: ox + i * cell + cell / 2, y: oy - 10, size: labelSize - 1, anchor: 'middle', valign: 'bottom', fill: t.c('ink'), lineHeight: 1.15 }));
    parts.push(textLines([l], { x: ox - 12, y: oy + i * cell + cell / 2, size: labelSize - 1, anchor: 'end', valign: 'middle', fill: t.c('ink') }));
  });
  M.forEach((row, i) => row.forEach((v, j) => {
    const rate = rowTot[i] ? v / rowTot[i] : 0, diag = i === j;
    const steps = t.values.seq.length, kk = Math.round(rate * (steps - 1));
    const fill = diag ? t.seq(kk) : (rate > 0.12 ? (o.errorColor === false ? t.seq(kk) : t.div(Math.max(0, Math.round((1 - Math.min(1, rate * 2.2)) * 2)))) : t.c('surface'));
    const on = diag ? onPalette(t, 'seq', kk) : (rate > 0.12 && o.errorColor !== false ? onPalette(t, 'div', Math.max(0, Math.round((1 - Math.min(1, rate * 2.2)) * 2))) : t.c('ink'));
    const cx = ox + j * cell, cy = oy + i * cell;
    parts.push(g({ ...buildAttrs(build, { i: i * k + j, s: i, motion: 'reveal' }) },
      el('rect', { x: cx + 2, y: cy + 2, width: cell - 4, height: cell - 4, rx: 4, fill }),
      textLines([fmt(v, { locale: ctx.locale })], { x: cx + cell / 2, y: cy + cell / 2 - 4, size: Math.min(34, cell * 0.28), anchor: 'middle', valign: 'baseline', fill: on, weight: 700, attrs: { 'font-variant-numeric': 'tabular-nums' } }),
      textLines([pct(rate, 0)], { x: cx + cell / 2, y: cy + cell / 2 + 8, size: Math.max(15, Math.min(18, cell * 0.14)), anchor: 'middle', valign: 'top', fill: on })));
  }));
  const resolve = a => { const i = L.indexOf(a.actual), j = L.indexOf(a.predicted); return i >= 0 && j >= 0 ? { x: ox + (j + 1) * cell, y: oy + i * cell + cell / 2 } : null; };
  return finish(o, ctx, parts, resolve, { cell, ox, oy });
}

// ---------------------------------------------------------------- model evaluation

/**
 * ROC curves computed from scores. curves: [{name, scores, labels}].
 * AUC is computed by the trapezoid rule and printed in each curve's label.
 * operating: {curve, threshold, label} marks the point used in production.
 */
export function rocCurve(o) {
  const ctx = setup(o, { width: 720, height: 560 });
  const { t, size, labelSize, build } = ctx;
  const curves = o.curves.map((c, k) => { const pts = rocPoints(c.scores, c.labels); return { ...c, k, pts, auc: auc(pts.map(p => [p.fpr, p.tpr])) }; });
  const fr = frame(o, ctx, { xDomain: [0, 1], yDomain: [0, 1], xTicks: 5, yTicks: 5, xFormat: v => pct(v), yFormat: v => pct(v), xLabel: o.xLabel ?? 'False positive rate', yLabel: o.yLabel ?? 'True positive rate', square: true, rightPad: 220 });
  const { x, y, parts, box } = fr;
  parts.push(el('line', { x1: x(0), y1: y(0), x2: x(1), y2: y(1), stroke: t.c('muted'), 'stroke-width': 1.2, 'stroke-dasharray': '4 5' }));
  parts.push(textLines([o.chanceLabel ?? 'Chance'], { x: x(0.78), y: y(0.78) + 16, size: Math.max(15, size - 2), fill: t.c('muted'), anchor: 'middle', attrs: { transform: `rotate(-45 ${n(x(0.78))} ${n(y(0.78) + 16)})` } }));
  const colorOf = c => (o.highlight != null ? (isHighlighted(o.highlight, c, 'name') ? t.c('highlight') : t.c('context')) : t.cat(c.k));
  for (const c of curves) parts.push(el('path', { d: pathFromPoints(c.pts.map(p => [x(p.fpr), y(p.tpr)]), { curve: 'step' }), fill: 'none', stroke: colorOf(c), 'stroke-width': 3.2, 'stroke-linejoin': 'round', pathLength: build ? 1 : null, ...buildAttrs(build, { s: c.k, motion: 'draw' }) }));
  const placed = spreadLabels(curves.map(c => ({ id: c.k, y: y(c.pts[Math.floor(c.pts.length * 0.25)].tpr), h: labelSize * 2.6 })), { min: box.y, max: box.y + box.h });
  for (const p of placed) {
    const c = curves[p.id];
    parts.push(textLines([c.name], { x: box.x + box.w + 18, y: p.y - 10, size: labelSize, valign: 'middle', fill: o.highlight != null && !isHighlighted(o.highlight, c, 'name') ? t.c('muted') : colorOf(c), weight: 700 }));
    parts.push(textLines([`AUC ${fmt(c.auc, { digits: 3 })}`], { x: box.x + box.w + 18, y: p.y + 12, size: size - 1, valign: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  }
  if (o.operating) {
    const c = curves.find(q => q.name === o.operating.curve) || curves[0];
    const p = c.pts.reduce((best, q) => (Math.abs(q.threshold - o.operating.threshold) < Math.abs(best.threshold - o.operating.threshold) ? q : best), c.pts[1]);
    parts.push(callout({ x: x(p.fpr), y: y(p.tpr), text: o.operating.label ?? `Threshold ${o.operating.threshold}: TPR ${pct(p.tpr)}, FPR ${pct(p.fpr)}`, dx: o.operating.dx ?? 60, dy: o.operating.dy ?? 70, width: 210, theme: t, size: size - 1, marker: 'ring' }));
  }
  return finish(o, ctx, parts, null, { x, y, box, curves });
}

/** Precision–recall curves with the positive-rate baseline. curves: [{name, scores, labels}]. */
export function prCurve(o) {
  const ctx = setup(o, { width: 720, height: 560 });
  const { t, size, labelSize, build } = ctx;
  const curves = o.curves.map((c, k) => { const pts = prPoints(c.scores, c.labels); return { ...c, k, pts, ap: auc(pts.map(p => [p.recall, p.precision])), base: c.labels.filter(Boolean).length / c.labels.length }; });
  const fr = frame(o, ctx, { xDomain: [0, 1], yDomain: [0, 1], xTicks: 5, yTicks: 5, xFormat: v => pct(v), yFormat: v => pct(v), xLabel: o.xLabel ?? 'Recall', yLabel: o.yLabel ?? 'Precision', square: true, rightPad: 220 });
  const { x, y, parts, box } = fr;
  const base = curves[0].base;
  parts.push(refLine({ orient: 'h', at: y(base), from: box.x, to: box.x + box.w, label: `${o.baseLabel ?? 'Positive rate'} ${pct(base)}`, theme: t, size: Math.max(15, size - 2), color: t.c('muted'), weight: 500 }));
  const colorOf = c => (o.highlight != null ? (isHighlighted(o.highlight, c, 'name') ? t.c('highlight') : t.c('context')) : t.cat(c.k));
  for (const c of curves) parts.push(el('path', { d: pathFromPoints(c.pts.map(p => [x(p.recall), y(p.precision)]), { curve: 'step-after' }), fill: 'none', stroke: colorOf(c), 'stroke-width': 3.2, 'stroke-linejoin': 'round', pathLength: build ? 1 : null, ...buildAttrs(build, { s: c.k, motion: 'draw' }) }));
  const placed = spreadLabels(curves.map(c => ({ id: c.k, y: y(c.pts[Math.floor(c.pts.length * 0.6)].precision), h: labelSize * 2.6 })), { min: box.y, max: box.y + box.h });
  for (const p of placed) {
    const c = curves[p.id];
    parts.push(textLines([c.name], { x: box.x + box.w + 18, y: p.y - 10, size: labelSize, valign: 'middle', fill: o.highlight != null && !isHighlighted(o.highlight, c, 'name') ? t.c('muted') : colorOf(c), weight: 700 }));
    parts.push(textLines([`AP ${fmt(c.ap, { digits: 3 })}`], { x: box.x + box.w + 18, y: p.y + 12, size: size - 1, valign: 'middle', fill: t.c('muted') }));
  }
  return finish(o, ctx, parts, null, { x, y, box });
}

/**
 * Reliability diagram: mean predicted probability vs observed frequency, with
 * the count per bin underneath (so sparse bins are visible, not hidden).
 */
export function calibrationChart(o) {
  const ctx = setup(o, { width: 760, height: 600 });
  const { t, size, build } = ctx;
  const binsData = o.bins || calibrationBins(o.probs, o.labels, o.binCount ?? 10);
  const histH = o.histHeight ?? 80;
  const H0 = ctx.H; ctx.H = H0 - histH - 50;
  const fr = frame(o, ctx, { xDomain: [0, 1], yDomain: [0, 1], xTicks: 5, yTicks: 5, xFormat: v => pct(v), yFormat: v => pct(v), xLabel: null, yLabel: o.yLabel ?? 'Observed frequency', square: false, rightPad: 30 });
  ctx.H = H0;
  const { x, y, parts, box } = fr;
  parts.push(el('line', { x1: x(0), y1: y(0), x2: x(1), y2: y(1), stroke: t.c('muted'), 'stroke-width': 1.2, 'stroke-dasharray': '4 5' }));
  const used = binsData.filter(b => b.n > 0 && isNum(b.meanPredicted));
  // Put the diagonal's label on the side of the line away from the curve near its start.
  const near = used.reduce((best, b) => (Math.abs(b.meanPredicted - 0.2) < Math.abs((best?.meanPredicted ?? 9) - 0.2) ? b : best), null);
  const below = near ? near.observed > near.meanPredicted : false, off = below ? 22 : -10;
  const ang = -Math.atan2(y(0) - y(1), x(1) - x(0)) * 180 / Math.PI;
  parts.push(textLines([o.perfectLabel ?? 'Perfectly calibrated'], { x: x(0.08), y: y(0.08) + off, size: Math.max(15, size - 2), fill: t.c('muted'), attrs: { transform: `rotate(${n(ang)} ${n(x(0.08))} ${n(y(0.08) + off)})` } }));
  parts.push(el('path', { d: pathFromPoints(used.map(b => [x(b.meanPredicted), y(b.observed)])), fill: 'none', stroke: t.c('accent'), 'stroke-width': 3, 'stroke-linejoin': 'round', pathLength: build ? 1 : null, ...buildAttrs(build, { motion: 'draw' }) }));
  used.forEach((b, k) => parts.push(el('circle', { cx: x(b.meanPredicted), cy: y(b.observed), r: 6, fill: t.c('accent'), stroke: t.c('paper'), 'stroke-width': 2, ...buildAttrs(build, { i: k, label: true }) })));
  const hy = box.y + box.h + 50, maxN = Math.max(...binsData.map(b => b.n));
  binsData.forEach(b => {
    const h = maxN ? (b.n / maxN) * histH : 0;
    parts.push(el('rect', { x: x(b.x0) + 1.5, y: hy + histH - h, width: x(b.x1) - x(b.x0) - 3, height: h, fill: t.c('context') }));
  });
  parts.push(el('line', { x1: box.x, x2: box.x + box.w, y1: hy + histH, y2: hy + histH, stroke: t.c('ink'), 'stroke-width': 1.2 }));
  parts.push(textLines([o.countLabel ?? 'Predictions per bin'], { x: box.x, y: hy - 6, size: Math.max(15, size - 2), valign: 'bottom', fill: t.c('muted') }));
  parts.push(textLines([o.xLabel ?? 'Mean predicted probability'], { x: box.x + box.w, y: hy + histH + 24, size: size - 1, anchor: 'end', fill: t.c('muted') }));
  return finish(o, ctx, parts, a => ({ x: x(a.at), y: y(a.y ?? a.at) }), { x, y, box, hist: { y: hy, height: histH, maxN, bins: binsData } });
}

/** Residuals vs fitted (or x): zero line, points, and a ±2·SD reading band. */
export function residualPlot(o) {
  const ctx = setup(o);
  const { t, size, build } = ctx;
  const pts = o.points;
  const res = pts.map(p => p.residual);
  const s = Math.sqrt(sum(res.map(r => r * r)) / Math.max(1, res.length - 2));
  const lim = Math.max(...res.map(Math.abs), 2.2 * s);
  const fr = frame(o, ctx, { xDomain: o.xDomain || niceDomain(extent(pts.map(p => p.x)), 6), yDomain: niceDomain([-lim, lim], 4), xLabel: o.xLabel ?? 'Fitted value', yLabel: o.yLabel ?? 'Residual (observed − fitted)', yTicks: 4 });
  const { x, y, parts, box } = fr;
  parts.push(el('rect', { x: box.x, y: y(2 * s), width: box.w, height: y(-2 * s) - y(2 * s), fill: t.c('surface') }));
  parts.push(textLines([o.bandLabel ?? '±2 SD of residuals'], { x: box.x + box.w - 8, y: y(2 * s) + 8, size: Math.max(15, size - 2), anchor: 'end', valign: 'top', fill: t.c('muted') }));
  parts.push(el('line', { x1: box.x, x2: box.x + box.w, y1: y(0), y2: y(0), stroke: t.c('ink'), 'stroke-width': 1.6 }));
  pts.forEach((p, k) => {
    const out = Math.abs(p.residual) > 2 * s;
    parts.push(el('line', { x1: x(p.x), x2: x(p.x), y1: y(0), y2: y(p.residual), stroke: out ? t.c('negative') : t.c('rule'), 'stroke-width': 1.2 }));
    parts.push(el('circle', { cx: x(p.x), cy: y(p.residual), r: out ? 6.5 : 5, fill: out ? t.c('negative') : t.c('muted'), stroke: t.c('paper'), 'stroke-width': 1.5, ...buildAttrs(build, { i: k, motion: 'settle' }) }));
  });
  return finish(o, ctx, parts, a => { const p = pts.find(q => q.label === a.at) || a.at; return p && { x: x(p.x), y: y(p.residual) }; }, { x, y, box, sd: s });
}

/**
 * Learning curve: training-set size vs score for train and validation, each
 * with a mean ± SD band. sizes: [..]; train/val: [{mean, sd}]. xLog for sizes.
 */
export function learningCurve(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  const all = [...o.train, ...o.val].flatMap(p => [p.mean - p.sd, p.mean + p.sd]);
  const fr = frame(o, ctx, { xDomain: extent(o.sizes), yDomain: o.yDomain || niceDomain(extent(all), 5), xLog: o.xLog !== false, xLabel: o.xLabel ?? 'Training examples', yLabel: o.yLabel ?? 'Score', xFormat: v => fmt(v, { compact: true, locale: ctx.locale }), yFormat: o.yFormat ? (v => fmt(v, o.yFormat)) : undefined, rightPad: 170 });
  const { x, y, parts, box } = fr;
  const draw = (series, name, color, k) => {
    const up = series.map((p, i) => [x(o.sizes[i]), y(p.mean + p.sd)]), dn = series.map((p, i) => [x(o.sizes[i]), y(p.mean - p.sd)]).reverse();
    parts.push(el('path', { d: pathFromPoints([...up, ...dn], { close: true }), fill: color, opacity: 0.16, ...buildAttrs(build, { s: k, motion: 'reveal' }) }));
    parts.push(el('path', { d: pathFromPoints(series.map((p, i) => [x(o.sizes[i]), y(p.mean)])), fill: 'none', stroke: color, 'stroke-width': 3.2, 'stroke-linejoin': 'round', pathLength: build ? 1 : null, ...buildAttrs(build, { s: k, motion: 'draw' }) }));
    series.forEach((p, i) => parts.push(el('circle', { cx: x(o.sizes[i]), cy: y(p.mean), r: 4.5, fill: color, stroke: t.c('paper'), 'stroke-width': 1.5 })));
    const last = series.at(-1);
    return { id: k, y: y(last.mean), h: labelSize * 1.3, name, color, value: last.mean };
  };
  const ends = [draw(o.train, o.trainLabel ?? 'Training', t.c('muted'), 0), draw(o.val, o.valLabel ?? 'Validation', t.c('accent'), 1)];
  for (const p of spreadLabels(ends, { min: box.y, max: box.y + box.h })) {
    const e = ends[p.id];
    parts.push(textLines([`${e.name}  ${fmt(e.value, { digits: 2, ...(o.yFormat || {}) })}`], { x: box.x + box.w + 12, y: p.y, size: labelSize, valign: 'middle', fill: e.color, weight: 700 }));
  }
  if (o.gapLabel !== false) {
    const lt = o.train.at(-1).mean, lv = o.val.at(-1).mean, xx = x(o.sizes.at(-1)) - 18;
    parts.push(el('path', { d: `M${n(xx)} ${n(y(lt))}h-8V${n(y(lv))}h8`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.4 }));
    parts.push(textLines([o.gapLabel || `Gap ${fmt(Math.abs(lt - lv), { digits: 2 })}`], { x: xx - 14, y: (y(lt) + y(lv)) / 2, size: size - 1, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: 700, halo: t.c('paper') }));
  }
  return finish(o, ctx, parts, null, { x, y, box });
}

// ---------------------------------------------------------------- intervals

/**
 * Forest / interval plot. rows: [{label, estimate, low, high, weight?, n?}].
 * reference: null value (0 for differences, 1 for ratios; log scale with xLog).
 * favors: [leftText, rightText] under the axis. summary: {label, estimate, low, high} as a diamond.
 * columnText: (row) → right-hand text, default "est [low, high]".
 */
export function forestPlot(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  const rows = o.rows;
  const all = rows.flatMap(r => [r.low, r.high]).concat(o.summary ? [o.summary.low, o.summary.high] : []).concat(o.reference ?? []);
  const vf = nf(o, rows.flatMap(r => [r.estimate, r.low, r.high]));
  const colText = o.columnText || (r => `${vf(r.estimate)}  [${vf(r.low)}, ${vf(r.high)}]`);
  const lw = Math.max(...rows.map(r => measureText(r.label, labelSize)), o.summary ? measureText(o.summary.label, labelSize, { weight: 700 }) : 0) + 22;
  const cw = Math.max(...rows.map(r => measureText(colText(r), size - 1)), o.summary ? measureText(colText(o.summary), size - 1, { weight: 700 }) : 0) + 26;
  const nRows = rows.length + (o.summary ? 1.4 : 0);
  ctx.H = o.height ?? Math.max(200, nRows * (o.rowHeight ?? 44) + 90 + (o.favors ? 26 : 0));
  const box = plotBox(ctx.W, ctx.H, { left: lw, right: cw, top: size + 22, bottom: 40 + (o.xLabel ? 26 : 0) + (o.favors ? 28 : 0) });
  const dom = o.domain || (o.xLog ? [Math.min(...all) * 0.9, Math.max(...all) * 1.1] : niceDomain(extent(all), 6));
  const x = o.xLog ? log(dom, [box.x, box.x + box.w]) : linear(dom, [box.x, box.x + box.w]);
  const rowsAll = o.summary ? [...rows.map(r => r.label), '__sep', o.summary.label] : rows.map(r => r.label);
  const yb = band(rowsAll, [box.y, box.y + box.h], { inner: 0.2, outer: 0.05 });
  const parts = [axis(x, { orient: 'bottom', at: box.y + box.h, grid: [box.y, box.y + box.h], theme: t, size: size - 1, format: o.xLog ? (v => fmt(v, { digits: decimalsOf(v, 2) })) : tf(o, x, 6), count: 6, tickSize: 5 })];
  parts.push(el('line', { x1: box.x, x2: box.x + box.w, y1: box.y + box.h, y2: box.y + box.h, stroke: t.c('ink'), 'stroke-width': 1.2 }));
  if (o.reference != null) parts.push(el('line', { x1: x(o.reference), x2: x(o.reference), y1: box.y - 8, y2: box.y + box.h, stroke: t.c('ink'), 'stroke-width': 1.6 }));
  parts.push(textLines([o.columnTitle ?? 'Estimate [95% CI]'], { x: ctx.W - 2, y: box.y - 14, size: size - 1, anchor: 'end', fill: t.c('muted'), weight: 700 }));
  if (o.labelTitle) parts.push(textLines([o.labelTitle], { x: 4, y: box.y - 14, size: size - 1, fill: t.c('muted'), weight: 700 }));
  const maxW = Math.max(...rows.map(r => r.weight ?? 1));
  rows.forEach((r, k) => {
    const cy = yb.center(r.label), hl = o.highlight == null || isHighlighted(o.highlight, r);
    const c = hl ? (o.highlight != null ? t.c('highlight') : t.c('ink')) : t.c('muted');
    const s = 6 + 7 * Math.sqrt((r.weight ?? maxW) / maxW);
    const crossesRef = o.reference != null && r.low <= o.reference && r.high >= o.reference;
    parts.push(g({ class: 'ss-interval', ...buildAttrs(build, { i: k, motion: 'reveal' }) },
      el('line', { x1: x(r.low), x2: x(r.high), y1: cy, y2: cy, stroke: c, 'stroke-width': 2.4, 'stroke-linecap': 'round' }),
      el('rect', { x: x(r.estimate) - s / 2, y: cy - s / 2, width: s, height: s, fill: crossesRef && o.hollowIfCrossing ? t.c('paper') : c, stroke: c, 'stroke-width': 2 })));
    parts.push(textLines([r.label], { x: box.x - 14, y: cy, size: labelSize, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: hl && o.highlight != null ? 700 : null }));
    parts.push(textLines([colText(r)], { x: ctx.W - 2, y: cy, size: size - 1, anchor: 'end', valign: 'middle', fill: t.c('ink'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  });
  if (o.summary) {
    const s = o.summary, cy = yb.center(s.label), h = yb.bw * 0.42;
    parts.push(el('line', { x1: 0, x2: ctx.W, y1: yb('__sep') + yb.bw / 2, y2: yb('__sep') + yb.bw / 2, stroke: t.c('rule') }));
    parts.push(el('path', { d: `M${n(x(s.low))} ${n(cy)}L${n(x(s.estimate))} ${n(cy - h)}L${n(x(s.high))} ${n(cy)}L${n(x(s.estimate))} ${n(cy + h)}Z`, fill: t.c('accent'), ...buildAttrs(build, { i: rows.length, motion: 'reveal' }) }));
    parts.push(textLines([s.label], { x: box.x - 14, y: cy, size: labelSize, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: 700 }));
    parts.push(textLines([colText(s)], { x: ctx.W - 2, y: cy, size: size - 1, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: 700, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  }
  if (o.favors) {
    const fy = box.y + box.h + 50 + (o.xLabel ? 26 : 0), rx = o.reference != null ? x(o.reference) : box.x + box.w / 2;
    parts.push(textLines([`← ${o.favors[0]}`], { x: rx - 10, y: fy, size: size - 1, anchor: 'end', fill: t.c('muted'), weight: 600 }));
    parts.push(textLines([`${o.favors[1]} →`], { x: rx + 10, y: fy, size: size - 1, fill: t.c('muted'), weight: 600 }));
  }
  if (o.xLabel) parts.push(textLines([o.xLabel], { x: o.reference != null ? x(o.reference) : box.x + box.w / 2, y: box.y + box.h + 52, size: size - 1, anchor: 'middle', fill: t.c('muted') }));
  const resolve = a => { const r = rows.find(q => q.label === a.at) || (o.summary?.label === a.at ? o.summary : null); return r && { x: x(r.high), y: yb.center(r.label) }; };
  return finish(o, ctx, parts, resolve, { x, box });
}

/**
 * Error-bar chart: group means with an interval, raw points optional.
 * groups: [{label, values}] → mean ± interval computed by `interval`:
 * 'sd' | 'se' | 'ci95' (t-based) | function(values) → [lo, hi]. Or give mean/low/high directly.
 */
export function errorBarChart(o) {
  const ctx = setup(o);
  const W = words(o, ctx);
  const { t, size, labelSize, build } = ctx;
  const meanFn = mean, sdFn = v => { const m = mean(v); return Math.sqrt(sum(v.map(q => (q - m) ** 2)) / Math.max(1, v.length - 1)); };
  const groups = o.groups.map(gp => {
    if (isNum(gp.mean)) return gp;
    const m = meanFn(gp.values), s = sdFn(gp.values), se = s / Math.sqrt(gp.values.length);
    const w = o.interval === 'sd' ? s : o.interval === 'se' ? se : tQuantile(0.975, Math.max(1, gp.values.length - 1)) * se;
    const [lo, hi] = typeof o.interval === 'function' ? o.interval(gp.values) : [m - w, m + w];
    return { ...gp, mean: m, low: lo, high: hi };
  });
  const all = groups.flatMap(gp => [gp.low, gp.high, ...(gp.values || [])]);
  const vf = nf(o, groups.map(gp => gp.mean));
  const yTmp = linear(o.domain || niceDomain(extent(all), 5), [ctx.H - 60, 20]);
  const left = tickLabelWidth(yTmp, { format: tf(o, yTmp, 5), size: size - 1 }) + 18;
  const box = plotBox(ctx.W, ctx.H, { left, right: 20, top: 20 + (o.yLabel ? 24 : 0), bottom: 54 });
  const y = linear(yTmp.domain, [box.y + box.h, box.y]);
  const xb = band(groups.map(gp => gp.label), [box.x, box.x + box.w], { inner: 0.4, outer: 0.2 });
  const parts = [axis(y, { orient: 'left', at: box.x, grid: [box.x, box.x + box.w], theme: t, size: size - 1, format: tf(o, y, 5) })];
  if (o.yLabel) parts.push(textLines([o.yLabel], { x: 4, y: 16, size: size - 1, fill: t.c('muted') }));
  groups.forEach((gp, k) => {
    const cx = xb.center(gp.label), hl = o.highlight == null || isHighlighted(o.highlight, gp);
    const c = hl ? (o.highlight != null ? t.c('highlight') : t.c('ink')) : t.c('muted');
    const items = [];
    if (gp.values && o.points !== false) {
      const sw = beeswarm(gp.values.map(v => y(v)), { r: 3.5, gap: 0.8 });
      for (const p of sw) items.push(el('circle', { cx: cx - xb.bw * 0.28 + p.y * 0.8, cy: p.x, r: 3.5, fill: t.c('context') }));
    }
    items.push(el('line', { x1: cx, x2: cx, y1: y(gp.low), y2: y(gp.high), stroke: c, 'stroke-width': 2.4 }));
    items.push(el('line', { x1: cx - 9, x2: cx + 9, y1: y(gp.low), y2: y(gp.low), stroke: c, 'stroke-width': 2.4 }));
    items.push(el('line', { x1: cx - 9, x2: cx + 9, y1: y(gp.high), y2: y(gp.high), stroke: c, 'stroke-width': 2.4 }));
    items.push(el('circle', { cx, cy: y(gp.mean), r: 7, fill: c, stroke: t.c('paper'), 'stroke-width': 2 }));
    items.push(textLines([vf(gp.mean)], { x: cx + 14, y: y(gp.mean), size: size - 1, valign: 'middle', fill: t.c('ink'), weight: 700, halo: t.c('paper') }));
    parts.push(g({ class: 'ss-errorbar', ...buildAttrs(build, { i: k, motion: 'reveal' }) }, items));
    parts.push(textLines([gp.label], { x: cx, y: box.y + box.h + 12, size: labelSize, anchor: 'middle', valign: 'top', fill: t.c('ink'), weight: 600 }));
    if (gp.values) parts.push(textLines([`${W.n} = ${gp.values.length}`], { x: cx, y: box.y + box.h + 34, size: Math.max(15, size - 3), anchor: 'middle', valign: 'top', fill: t.c('muted') }));
  });
  if (o.intervalNote !== false) parts.push(textLines([o.intervalNote || ({ sd: 'Bars: mean ± 1 SD', se: 'Bars: mean ± 1 SE', ci95: 'Bars: mean with 95% CI (t)' }[o.interval || 'ci95'] || '')], { x: box.x + box.w, y: box.y - 10, size: Math.max(15, size - 2), anchor: 'end', fill: t.c('muted') }));
  return finish(o, ctx, parts, a => { const gp = groups.find(q => q.label === a.at); return gp && { x: xb.center(gp.label) + 10, y: y(gp.high) }; }, { y, box });
}
