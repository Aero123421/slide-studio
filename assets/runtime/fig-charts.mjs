/**
 * Slide Studio figure engine — comparison, part-to-whole and time charts.
 *
 * Every chart takes one options object and returns an <svg> string.
 * Shared options: id (required, namespaces IDs), title + desc (accessible
 * name/description, required), width, height, theme ('css' | object),
 * fontSize (base label size, default 16), locale, format (number format
 * options or a function), highlight, annotate, build (motion), extra(ctx).
 *
 * Design defaults follow slide-reading distance: direct labels instead of
 * legends, one accent for the thing the page is about, context grey for the
 * rest, horizontal axis titles, zero baselines for bars, no chart junk.
 */
import {
  theme, el, g, svgRoot, esc, n, isNum, extent, sum, clamp, checkId, measureText, wrapText, wrapBalanced, blockWidth,
  textLines, linear, band, point, niceDomain, formatter, fmt, pathFromPoints, segments, barPath, roundRectPath, arcPath,
  polar, axis, tickLabelWidth, callout, refLine, legend, spreadLabels, normBuild, buildAttrs, isHighlighted, plotBox,
  decimalsOf, textOn, contrastRatio,
} from './fig-core.mjs';

// ---------------------------------------------------------------- shared plumbing

function setup(o, defaults = {}) {
  checkId(o.id);
  if (!o.title) throw Error(`${o.id}: title (accessible name) is required`);
  const t = theme(o.theme);
  const size = o.fontSize ?? 16;
  return {
    t, id: o.id, size, labelSize: Math.round(size * 1.06), smallSize: Math.max(15, size - 1),
    W: o.width ?? defaults.width ?? 1120, H: o.height ?? defaults.height ?? 520,
    build: normBuild(o.build), locale: o.locale ?? 'en',
  };
}

/** Number formatter that shares one decimal convention across a figure. */
function valueFormat(o, values, extra = {}) {
  if (typeof o.format === 'function') return o.format;
  const digits = o.format?.digits ?? Math.min(2, Math.max(0, ...values.filter(isNum).map(v => decimalsOf(v, 2))));
  const opts = { locale: o.locale ?? 'en', digits, ...extra, ...(o.format || {}) };
  return v => fmt(v, opts);
}
/** Tick formatter: decimals follow the tick step, units follow the value format. */
function tickFormat(o, scale, count, extra = {}) {
  if (typeof o.tickFormat === 'function') return o.tickFormat;
  const step = scale.tickStep ? scale.tickStep(count) : 1;
  const opts = { locale: o.locale ?? 'en', digits: decimalsOf(step, 3), ...extra, ...(o.format || {}), ...(o.tickFormatOptions || {}) };
  if (o.format?.digits !== undefined) opts.digits = decimalsOf(step, 3);
  return v => fmt(v, opts);
}

function finish(o, ctx, parts, resolve, extraCtx = {}) {
  const { t, id, W, H, size } = ctx;
  const notes = (o.annotate || []).map((a, i) => {
    const p = resolve ? resolve(a) : a;
    if (!p) throw Error(`${id}: annotation ${i} target not found (${JSON.stringify(a.at ?? a)})`);
    return callout({ theme: t, size: a.size ?? size, bounds: { w: W, h: ctx.H }, marker: p.marker ?? 'dot', ...a, x: p.x, y: p.y, attrs: a.step ? { 'data-step': a.step, 'data-motion': a.motion || 'reveal', 'data-delay': a.delay || null } : (a.attrs || {}) });
  });
  const extra = typeof o.extra === 'function' ? o.extra({ ...ctx, ...extraCtx }) : (o.extra || '');
  const before = typeof o.before === 'function' ? o.before({ ...ctx, ...extraCtx }) : (o.before || ''); // painted under the marks
  return svgRoot({ id, width: W, height: H, title: o.title, desc: o.desc, theme: t, className: o.className || '', font: o.font || 'sans' },
    o.defs ? el('defs', {}, o.defs) : '', before, parts, notes, extra, o.after || '');
}

function colorFor(ctx, o, item, i, fallback) {
  const { t } = ctx;
  if (typeof o.color === 'function') return o.color(item, i, t);
  if (item.color) return item.color;
  if (o.highlight != null) return isHighlighted(o.highlight, item) ? t.c('highlight') : t.c('context');
  if (typeof o.color === 'string') return o.color.startsWith('#') || o.color.startsWith('var(') ? o.color : t.c(o.color);
  return fallback ?? t.cat(0);
}

const wrapLabel = (text, width, size, lines = 2, opts) => {
  const all = wrapBalanced(String(text), width, size, opts);
  if (all.length <= lines) return all;
  const kept = all.slice(0, lines);
  kept[lines - 1] = kept[lines - 1].replace(/\s*\S*$/, '') + '…';
  return kept;
};

// ---------------------------------------------------------------- bars

/**
 * Bar chart. Horizontal by default (long category names stay readable).
 * data: [{label, value, note?, color?}]. Signed values grow from zero.
 * Options: orientation 'horizontal'|'vertical', sort 'desc'|'asc', highlight,
 * axis (value axis + grid), valueLabels, labelWidth, barRatio, domain,
 * reference {value, label}, unit (axis title), annotate [{at: label, text, dx, dy}].
 */
export function barChart(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  if (!Array.isArray(o.data) || !o.data.length) throw Error(`${o.id}: data must be a non-empty array`);
  for (const d of o.data) if (!isNum(d.value)) throw Error(`${o.id}: value for "${d.label}" must be finite`);
  let data = o.data.map((d, i) => ({ ...d, i }));
  if (o.sort === 'desc') data.sort((a, b) => b.value - a.value);
  if (o.sort === 'asc') data.sort((a, b) => a.value - b.value);
  const vertical = o.orientation === 'vertical';
  const values = data.map(d => d.value);
  const vf = valueFormat(o, values);
  let [lo, hi] = o.domain || [Math.min(0, ...values), Math.max(0, ...values)];
  if (!o.domain && o.reference) { lo = Math.min(lo, o.reference.value); hi = Math.max(hi, o.reference.value); }
  if (!o.domain && o.axis) [lo, hi] = niceDomain([lo, hi], o.ticks ?? 5);
  const showValues = o.valueLabels !== false;
  const valueW = showValues ? Math.max(...data.map(d => measureText(vf(d.value), size, { weight: 700 }))) + 12 : 8;

  if (!vertical) {
    const rowH = o.rowHeight ?? 46;
    ctx.H = o.height ?? Math.max(160, data.length * rowH + (o.axis ? 40 : 8) + (o.unit ? 30 : 0) + (o.reference?.label ? size + 14 : 0));
    const labelMax = o.labelWidth ?? Math.min(ctx.W * 0.34, Math.max(...data.map(d => measureText(d.label, labelSize))) + 4);
    const labels = data.map(d => wrapLabel(d.label, labelMax, labelSize));
    const labelCol = Math.max(...labels.map(l => blockWidth(l, labelSize))) + 18;
    const negW = lo < 0 && showValues ? valueW : 0;
    const refRoom = o.reference?.label ? size + 14 : 0; // the reference label sits under the bars, not over the first one
    const m = { left: labelCol + negW, right: hi > 0 ? valueW : 12, top: o.unit ? 30 : 6, bottom: (o.axis ? 40 : 4) + refRoom };
    const box = plotBox(ctx.W, ctx.H, m);
    const x = linear([lo, hi], [box.x, box.x + box.w]);
    const y = band(data.map(d => d.label), [box.y, box.y + box.h], { inner: 1 - (o.barRatio ?? 0.62), outer: 0.18 });
    const parts = [];
    if (o.axis) parts.push(axis(x, { orient: 'bottom', at: box.y + box.h, grid: [box.y, box.y + box.h], theme: t, size: size - 1, format: tickFormat(o, x, o.ticks ?? 5), count: o.ticks ?? 5 }));
    if (o.unit) parts.push(textLines([o.unit], { x: x(0) <= box.x + 2 ? box.x : x(lo), y: box.y - 12, size: size - 1, fill: t.c('muted'), cls: 'ss-unit' }));
    data.forEach((d, k) => {
      const x0 = x(Math.max(lo, Math.min(0, hi))), x1 = x(d.value), yy = y(d.label), bh = y.bw;
      const fill = colorFor(ctx, o, d, k);
      const hl = isHighlighted(o.highlight, d);
      const dir = d.value >= 0 ? 'right' : 'left';
      parts.push(el('path', {
        d: barPath(Math.min(x0, x1), yy, Math.abs(x1 - x0), bh, Math.min(3, bh / 4), dir), fill, class: 'ss-bar',
        style: build ? `transform-origin:${d.value >= 0 ? '0% 50%' : '100% 50%'}` : null,
        ...buildAttrs(build, { i: k, motion: 'grow-x' }),
      }));
      parts.push(textLines(labels[k], { x: box.x - negW - 14, y: yy + bh / 2, size: labelSize, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: hl ? 700 : null, lineHeight: 1.15, cls: 'ss-cat' }));
      if (showValues) {
        const inside = o.valuesInside && Math.abs(x1 - x0) > valueW + 10;
        const tx = inside ? x1 + (d.value >= 0 ? -10 : 10) : x1 + (d.value >= 0 ? 8 : -8);
        parts.push(textLines([vf(d.value)], {
          x: tx, y: yy + bh / 2, size, valign: 'middle', anchor: (d.value >= 0) !== !!inside ? 'start' : 'end',
          fill: inside ? t.c('onAccent') : hl ? t.c('ink') : t.c('muted'), weight: hl || inside ? 700 : 600,
          attrs: { 'font-variant-numeric': 'tabular-nums', ...buildAttrs(build, { i: k, label: true }) }, cls: 'ss-value',
        }));
      }
    });
    if (lo < 0) parts.push(el('line', { x1: x(0), x2: x(0), y1: box.y - 4, y2: box.y + box.h + 4, stroke: t.c('ink'), 'stroke-width': 1.4 }));
    if (o.reference) {
      const rx = x(o.reference.value);
      parts.push(refLine({ orient: 'v', at: rx, from: box.y - 6, to: box.y + box.h + 6, theme: t, size: size - 1 }));
      if (o.reference.label) {
        const lw = measureText(o.reference.label, size - 1, { weight: 600 }), right = rx + 6 + lw <= box.x + box.w + valueW;
        parts.push(textLines([o.reference.label], { x: right ? rx + 6 : rx - 6, y: box.y + box.h + (o.axis ? 40 : 10), size: size - 1, anchor: right ? 'start' : 'end', valign: 'top', fill: t.c('ink'), weight: 600 }));
      }
    }
    const resolve = a => { const d = data.find(q => q.label === (a.at ?? a.label)); return d && { x: x(d.value) + (d.value >= 0 ? valueW - 4 : -valueW + 4), y: y.center(d.label), marker: 'none' }; };
    return finish(o, ctx, parts, resolve, { x, y, box, data });
  }

  // vertical columns
  const labelLines = o.labelLines ?? 2;
  const m0 = { left: 12, right: 12, top: (showValues ? size + 14 : 8) + (o.unit ? 28 : 0), bottom: labelLines * labelSize * 1.18 + 14 };
  let yScale = linear([lo, hi], [ctx.H - m0.bottom, m0.top]);
  if (o.axis) m0.left = tickLabelWidth(yScale, { format: tickFormat(o, yScale, o.ticks ?? 5), size: size - 1, count: o.ticks ?? 5 }) + 16;
  if (lo < 0 && showValues) m0.bottom += size + 6;
  const box = plotBox(ctx.W, ctx.H, m0);
  const x = band(data.map(d => d.label), [box.x, box.x + box.w], { inner: 1 - (o.barRatio ?? 0.62), outer: 0.2 });
  const y = linear([lo, hi], [box.y + box.h, box.y]);
  const parts = [];
  if (o.axis) parts.push(axis(y, { orient: 'left', at: box.x, grid: [box.x, box.x + box.w], theme: t, size: size - 1, format: tickFormat(o, y, o.ticks ?? 5), count: o.ticks ?? 5 }));
  if (o.unit) parts.push(textLines([o.unit], { x: o.axis ? box.x - m0.left + 4 : box.x, y: m0.top - (showValues ? size + 20 : 14), size: size - 1, fill: t.c('muted'), cls: 'ss-unit' }));
  const zeroY = y(Math.max(lo, Math.min(0, hi)));
  data.forEach((d, k) => {
    const y1 = y(d.value), xx = x(d.label), bw = x.bw, fill = colorFor(ctx, o, d, k), hl = isHighlighted(o.highlight, d);
    parts.push(el('path', {
      d: barPath(xx, Math.min(zeroY, y1), bw, Math.abs(y1 - zeroY), Math.min(3, bw / 4), d.value >= 0 ? 'up' : 'down'), fill, class: 'ss-bar',
      style: build ? `transform-origin:${d.value >= 0 ? '50% 100%' : '50% 0%'}` : null,
      ...buildAttrs(build, { i: k, motion: 'grow-y' }),
    }));
    if (showValues) parts.push(textLines([vf(d.value)], {
      x: xx + bw / 2, y: d.value >= 0 ? y1 - 8 : y1 + 8, size, anchor: 'middle', valign: d.value >= 0 ? 'baseline' : 'top',
      fill: hl ? t.c('ink') : t.c('muted'), weight: hl ? 700 : 600, cls: 'ss-value',
      attrs: { 'font-variant-numeric': 'tabular-nums', ...buildAttrs(build, { i: k, label: true }) },
    }));
    const lab = wrapLabel(d.label, Math.max(x.step - 6, 40), labelSize - 1, labelLines);
    parts.push(textLines(lab, { x: xx + bw / 2, y: box.y + box.h + 10 + (lo < 0 && showValues ? size + 6 : 0), size: labelSize - 1, anchor: 'middle', valign: 'top', fill: t.c('ink'), weight: hl ? 700 : null, lineHeight: 1.15, cls: 'ss-cat' }));
  });
  parts.push(el('line', { x1: box.x - 4, x2: box.x + box.w + 4, y1: zeroY, y2: zeroY, stroke: t.c('ink'), 'stroke-width': 1.4, class: 'ss-zero' }));
  if (o.reference) parts.push(refLine({ orient: 'h', at: y(o.reference.value), from: box.x - 4, to: box.x + box.w + 4, label: o.reference.label, theme: t, size: size - 1 }));
  const resolve = a => { const d = data.find(q => q.label === (a.at ?? a.label)); return d && { x: x.center(d.label), y: y(d.value) - (d.value >= 0 ? size + 12 : -size - 12), marker: 'none' }; };
  return finish(o, ctx, parts, resolve, { x, y, box, data });
}

/** Vertical bars; same options as barChart. */
export const columnChart = o => barChart({ ...o, orientation: 'vertical' });

/**
 * Grouped bars: categories × series on one shared scale.
 * categories: [..], series: [{name, values:[..], color?}], highlight: series name.
 */
export function groupedBarChart(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  const cats = o.categories, series = o.series;
  if (!cats?.length || !series?.length) throw Error(`${o.id}: categories and series are required`);
  for (const s of series) if (s.values.length !== cats.length || !s.values.every(isNum)) throw Error(`${o.id}: series "${s.name}" needs ${cats.length} finite values`);
  const all = series.flatMap(s => s.values), vf = valueFormat(o, all);
  const [lo, hi] = o.domain || niceDomain([Math.min(0, ...all), Math.max(0, ...all)], o.ticks ?? 5);
  const legendH = o.legend === false ? 0 : size + 24;
  const showValues = o.valueLabels !== false;
  const m = { left: 12, right: 12, top: legendH + (showValues ? size + 12 : 8) + (o.unit ? 26 : 0), bottom: 2 * labelSize * 1.18 + 14 };
  const ytmp = linear([lo, hi], [ctx.H - m.bottom, m.top]);
  if (o.axis !== false) m.left = tickLabelWidth(ytmp, { format: tickFormat(o, ytmp, o.ticks ?? 5), size: size - 1, count: o.ticks ?? 5 }) + 16;
  const box = plotBox(ctx.W, ctx.H, m);
  const x = band(cats, [box.x, box.x + box.w], { inner: o.groupGap ?? 0.28, outer: 0.12 });
  const inner = band(series.map(s => s.name), [0, x.bw], { inner: 0.08, outer: 0 });
  const y = linear([lo, hi], [box.y + box.h, box.y]);
  const colorOf = (s, k) => s.color || (o.highlight != null ? (isHighlighted(o.highlight, s, 'name') ? t.c('highlight') : t.c('context')) : t.cat(k));
  const parts = [];
  if (o.axis !== false) parts.push(axis(y, { orient: 'left', at: box.x, grid: [box.x, box.x + box.w], theme: t, size: size - 1, format: tickFormat(o, y, o.ticks ?? 5), count: o.ticks ?? 5 }));
  if (o.unit) parts.push(textLines([o.unit], { x: 4, y: legendH + 14, size: size - 1, fill: t.c('muted') }));
  if (o.legend !== false) parts.push(legend(series.map((s, k) => ({ label: s.name, color: colorOf(s, k) })), { x: box.x, y: 12, size, theme: t, maxWidth: box.w }));
  const zeroY = y(Math.max(lo, Math.min(0, hi)));
  cats.forEach((c, ci) => {
    series.forEach((s, si) => {
      const v = s.values[ci], xx = x(c) + inner(s.name), bw = inner.bw, y1 = y(v);
      parts.push(el('path', {
        d: barPath(xx, Math.min(zeroY, y1), bw, Math.abs(y1 - zeroY), Math.min(2.5, bw / 4), v >= 0 ? 'up' : 'down'), fill: colorOf(s, si), class: 'ss-bar',
        style: build ? `transform-origin:${v >= 0 ? '50% 100%' : '50% 0%'}` : null,
        ...buildAttrs(build, { i: ci * series.length + si, s: si, motion: 'grow-y' }),
      }));
      if (showValues && bw >= measureText(vf(v), Math.max(15, size - 2)) - 4) parts.push(textLines([vf(v)], {
        x: xx + bw / 2, y: v >= 0 ? y1 - 6 : y1 + 6, size: Math.max(15, size - 2), anchor: 'middle', valign: v >= 0 ? 'baseline' : 'top', fill: t.c('muted'), weight: 600,
        attrs: { 'font-variant-numeric': 'tabular-nums', ...buildAttrs(build, { i: ci * series.length + si, s: si, label: true }) },
      }));
    });
    parts.push(textLines(wrapLabel(c, x.step - 8, labelSize - 1), { x: x.center(c), y: box.y + box.h + 10, size: labelSize - 1, anchor: 'middle', valign: 'top', fill: t.c('ink'), lineHeight: 1.15 }));
  });
  parts.push(el('line', { x1: box.x - 4, x2: box.x + box.w + 4, y1: zeroY, y2: zeroY, stroke: t.c('ink'), 'stroke-width': 1.4 }));
  const resolve = a => { const ci = cats.indexOf(a.at?.category ?? a.category), s = series.find(q => q.name === (a.at?.series ?? a.series)); if (ci < 0 || !s) return null; return { x: x(cats[ci]) + inner(s.name) + inner.bw / 2, y: y(s.values[ci]) - size - 10 }; };
  return finish(o, ctx, parts, resolve, { x, y, box });
}

/**
 * Stacked bars (horizontal by default). categories, series:[{name, values}].
 * normalize: true → shares of each total (100%). Segment labels appear inside
 * segments wide enough to hold them; series names label the first bar's
 * segments directly (or a legend when they would not fit).
 */
export function stackedBarChart(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  const cats = o.categories, series = o.series;
  if (!cats?.length || !series?.length) throw Error(`${o.id}: categories and series are required`);
  for (const s of series) if (s.values.length !== cats.length || !s.values.every(v => isNum(v) && v >= 0)) throw Error(`${o.id}: series "${s.name}" needs ${cats.length} nonnegative values`);
  const totals = cats.map((_, i) => sum(series.map(s => s.values[i])));
  const norm = !!o.normalize;
  const vf = norm ? (v => fmt(v * 100, { digits: o.format?.digits ?? 0, suffix: '%', locale: ctx.locale })) : valueFormat(o, series.flatMap(s => s.values));
  const colorOf = (s, k) => s.color || (o.highlight != null ? (isHighlighted(o.highlight, s, 'name') ? t.c('highlight') : (o.contextRamp ? t.seq(1 + (k % 3)) : t.c('context'))) : t.cat(k));
  const onColor = (s, k) => {
    // A CSS-variable color carries its literal fallback (var(--ss-cat-2,#a1b2c3)); judge contrast on that.
    if (s.color) return textOn(/#[0-9a-f]{6}/i.exec(s.color)?.[0] ?? '#888888', t.hex('paper'), t.hex('ink'));
    if (o.highlight != null) return isHighlighted(o.highlight, s, 'name') ? t.c('onAccent') : t.c('ink');
    return onPalette(t, 'cat', k);
  };
  const rowH = o.rowHeight ?? 52;
  ctx.H = o.height ?? Math.max(180, cats.length * rowH + size * 2 + 40);
  const labels = cats.map(c => wrapLabel(c, o.labelWidth ?? ctx.W * 0.26, labelSize));
  const labelCol = Math.max(...labels.map(l => blockWidth(l, labelSize))) + 18;
  const totalW = !norm && o.totals !== false ? Math.max(...totals.map(v => measureText(vf(v), size, { weight: 700 }))) + 14 : 10;
  const unitH = o.unit ? size + 10 : 0;
  const keyH = (o.legend === 'top' ? size + 26 : size * 2 + 22) + unitH;
  const box = plotBox(ctx.W, ctx.H, { left: labelCol, right: totalW, top: keyH, bottom: o.axis ? 36 : 4 });
  const x = linear([0, norm ? 1 : (o.domain?.[1] ?? Math.max(...totals))], [box.x, box.x + box.w]);
  const y = band(cats, [box.y, box.y + box.h], { inner: 1 - (o.barRatio ?? 0.6), outer: 0.15 });
  const parts = [];
  if (o.axis) parts.push(axis(x, { orient: 'bottom', at: box.y + box.h, grid: [box.y, box.y + box.h], theme: t, size: size - 1, format: norm ? (v => fmt(v * 100, { digits: 0, suffix: '%' })) : tickFormat(o, x, 5) }));
  if (o.unit) parts.push(textLines([o.unit], { x: 0, y: 2, size: size - 1, valign: 'top', fill: t.c('muted'), cls: 'ss-unit' }));
  const firstSegs = [];
  cats.forEach((c, ci) => {
    let acc = 0;
    series.forEach((s, si) => {
      const v = norm ? s.values[ci] / (totals[ci] || 1) : s.values[ci];
      const x0 = x(acc), x1 = x(acc + v), w = x1 - x0;
      acc += v;
      parts.push(el('rect', { x: x0, y: y(c), width: Math.max(0, w - (si < series.length - 1 ? 1.5 : 0)), height: y.bw, fill: colorOf(s, si), class: 'ss-seg', ...buildAttrs(build, { i: ci, s: si, motion: 'reveal' }) }));
      const label = vf(v);
      if (o.segmentLabels !== false && w > measureText(label, size - 1, { weight: 600 }) + 14) {
        parts.push(textLines([label], { x: x0 + 8, y: y.center(c), size: size - 1, valign: 'middle', fill: onColor(s, si), weight: 600, attrs: { 'font-variant-numeric': 'tabular-nums', ...buildAttrs(build, { i: ci, s: si, label: true }) } }));
      }
      if (ci === 0) firstSegs.push({ s, si, x0, x1 });
    });
    parts.push(textLines(labels[ci], { x: box.x - 14, y: y.center(c), size: labelSize, anchor: 'end', valign: 'middle', fill: t.c('ink'), lineHeight: 1.15 }));
    if (!norm && o.totals !== false) parts.push(textLines([vf(totals[ci])], { x: x(totals[ci]) + 8, y: y.center(c), size, valign: 'middle', fill: t.c('ink'), weight: 700, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  });
  // Series names: directly above the first bar's segments when each fits its segment, else a legend row.
  const fits = o.legend !== 'top' && firstSegs.every(f => measureText(f.s.name, size - 1) <= Math.max(f.x1 - f.x0, 0) + 30);
  if (fits) {
    const items = firstSegs.map(f => ({ id: f.si, x: f.x0, w: measureText(f.s.name, size - 1) }));
    let prevRight = -Infinity;
    items.forEach((it, k) => {
      const row = it.x < prevRight + 10 ? 1 : 0;
      const yy = y(cats[0]) - 10 - row * (size + 4);
      parts.push(el('line', { x1: it.x + 1, x2: it.x + 1, y1: yy + 4, y2: y(cats[0]), stroke: t.c('rule') }));
      parts.push(textLines([firstSegs[k].s.name], { x: it.x + 6, y: yy, size: size - 1, fill: t.c('muted'), weight: 600 }));
      if (!row) prevRight = it.x + it.w + 6;
    });
  } else {
    parts.push(legend(series.map((s, k) => ({ label: s.name, color: colorOf(s, k) })), { x: box.x, y: 14 + unitH, size: size - 1, theme: t, maxWidth: box.w }));
  }
  return finish(o, ctx, parts, null, { x, y, box });
}

/** On-color for palette entries, as CSS var with a computed fallback. */
export function onPalette(t, kind, i) {
  const list = t.values[kind], c = list[((i % list.length) + list.length) % list.length];
  const v = textOn(c, t.values.paper, t.values.ink);
  return t.literal ? v : `var(--ss-on-${kind}-${(i % list.length) + 1},${v})`;
}

/**
 * Diverging bars around a reference (default 0): signed change, net sentiment.
 * Category labels sit beside the zero line on the side opposite the bar.
 */
export function divergingBarChart(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  const ref = o.reference ?? 0;
  let data = o.data.map((d, i) => ({ ...d, delta: d.value - ref, i }));
  if (o.sort !== false) data.sort((a, b) => b.delta - a.delta);
  const vf = valueFormat(o, data.map(d => d.delta), { sign: true });
  const rowH = o.rowHeight ?? 44;
  ctx.H = o.height ?? Math.max(160, data.length * rowH + 60);
  const maxAbs = Math.max(...data.map(d => Math.abs(d.delta)));
  const lw = Math.max(...data.map(d => measureText(d.label, labelSize))) + 16;
  const vw = Math.max(...data.map(d => measureText(vf(d.delta), size, { weight: 700 }))) + 12;
  const box = plotBox(ctx.W, ctx.H, { left: 12, right: 12, top: o.posLabel || o.negLabel ? size + 22 : 8, bottom: 8 });
  const half = (box.w - 0) / 2;
  const x = linear([-maxAbs, maxAbs], [box.x + Math.min(lw, half * 0.6) * 0 + vw, box.x + box.w - vw]);
  const y = band(data.map(d => d.label), [box.y, box.y + box.h], { inner: 0.38, outer: 0.1 });
  const parts = [];
  const pos = o.positiveColor || t.c('positive'), neg = o.negativeColor || t.c('negative');
  data.forEach((d, k) => {
    const x0 = x(0), x1 = x(d.delta), yy = y(d.label), up = d.delta >= 0;
    const fill = o.highlight != null ? (isHighlighted(o.highlight, d) ? (up ? pos : neg) : t.c('context')) : (up ? pos : neg);
    parts.push(el('path', { d: barPath(Math.min(x0, x1), yy, Math.abs(x1 - x0), y.bw, Math.min(3, y.bw / 4), up ? 'right' : 'left'), fill, class: 'ss-bar', style: build ? `transform-origin:${up ? '0% 50%' : '100% 50%'}` : null, ...buildAttrs(build, { i: k, motion: 'grow-x' }) }));
    parts.push(textLines([d.label], { x: up ? x0 - 10 : x0 + 10, y: y.center(d.label), size: labelSize, anchor: up ? 'end' : 'start', valign: 'middle', fill: t.c('ink') }));
    parts.push(textLines([vf(d.delta)], { x: x1 + (up ? 8 : -8), y: y.center(d.label), size, anchor: up ? 'start' : 'end', valign: 'middle', fill: up ? pos : neg, weight: 700, attrs: { 'font-variant-numeric': 'tabular-nums', ...buildAttrs(build, { i: k, label: true }) } }));
  });
  parts.push(el('line', { x1: x(0), x2: x(0), y1: box.y - 4, y2: box.y + box.h + 4, stroke: t.c('ink'), 'stroke-width': 1.4 }));
  if (o.negLabel) parts.push(textLines([`← ${o.negLabel}`], { x: x(0) - 12, y: box.y - 10, size: size - 1, anchor: 'end', fill: neg, weight: 600 }));
  if (o.posLabel) parts.push(textLines([`${o.posLabel} →`], { x: x(0) + 12, y: box.y - 10, size: size - 1, fill: pos, weight: 600 }));
  const resolve = a => { const d = data.find(q => q.label === a.at); return d && { x: x(d.delta) + (d.delta >= 0 ? vw : -vw), y: y.center(d.label) }; };
  return finish(o, ctx, parts, resolve, { x, y, box });
}

// ---------------------------------------------------------------- paired comparisons

/**
 * Dumbbell: two values per row on one scale (before → after, A vs B).
 * data: [{label, a, b}]; aLabel/bLabel name the ends; delta shows b − a.
 */
export function dumbbellChart(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  let data = o.data.map((d, i) => ({ ...d, delta: d.b - d.a, i }));
  for (const d of data) if (!isNum(d.a) || !isNum(d.b)) throw Error(`${o.id}: a and b must be finite for "${d.label}"`);
  if (o.sort === 'delta') data.sort((p, q) => q.delta - p.delta);
  if (o.sort === 'b') data.sort((p, q) => q.b - p.b);
  const vf = valueFormat(o, data.flatMap(d => [d.a, d.b]));
  const df = valueFormat(o, data.map(d => d.delta), { sign: true });
  const rowH = o.rowHeight ?? 50;
  ctx.H = o.height ?? Math.max(180, data.length * rowH + 90);
  const labelCol = Math.max(...data.map(d => measureText(d.label, labelSize))) + 22;
  const deltaW = o.showDelta === false ? 12 : Math.max(measureText(o.deltaLabel ?? 'Change', size - 1, { weight: 600 }), ...data.map(d => measureText(df(d.delta), size, { weight: 700 }))) + 30;
  const box = plotBox(ctx.W, ctx.H, { left: labelCol, right: deltaW, top: size * 2 + 22, bottom: o.unit ? 60 : 40 });
  const all = data.flatMap(d => [d.a, d.b]);
  const x = linear(o.domain || niceDomain(extent(all), 5), [box.x + 10, box.x + box.w - 10], {});
  const y = point(data.map(d => d.label), [box.y, box.y + box.h], { padding: 0.5 });
  const aC = o.aColor || t.c('context'), bC = o.bColor || t.c('highlight');
  const parts = [axis(x, { orient: 'bottom', at: box.y + box.h, grid: [box.y, box.y + box.h], theme: t, size: size - 1, format: tickFormat(o, x, 5), gridDash: '2 4' })];
  data.forEach((d, k) => {
    const yy = y(d.label), xa = x(d.a), xb = x(d.b), hl = o.highlight == null || isHighlighted(o.highlight, d);
    const row = [];
    row.push(el('line', { x1: xa, x2: xb, y1: yy, y2: yy, stroke: hl ? t.c('muted') : t.c('rule'), 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
    row.push(el('circle', { cx: xa, cy: yy, r: 8, fill: t.c('paper'), stroke: aC, 'stroke-width': 3 }));
    row.push(el('circle', { cx: xb, cy: yy, r: 8.5, fill: hl ? bC : t.c('context') }));
    parts.push(g({ class: 'ss-pair', ...buildAttrs(build, { i: k, motion: 'reveal' }) }, row));
    parts.push(textLines([d.label], { x: box.x - 14, y: yy, size: labelSize, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: o.highlight != null && isHighlighted(o.highlight, d) ? 700 : null }));
    if (o.showDelta !== false) parts.push(textLines([df(d.delta)], { x: ctx.W - 4, y: yy, size, anchor: 'end', valign: 'middle', fill: d.delta >= 0 ? (o.deltaPositive || t.c('ink')) : (o.deltaNegative || t.c('ink')), weight: 700, attrs: { 'font-variant-numeric': 'tabular-nums', ...buildAttrs(build, { i: k, label: true }) } }));
    if (o.endValues) {
      const left = d.a <= d.b;
      parts.push(textLines([vf(d.a)], { x: xa + (left ? -14 : 14), y: yy, size: size - 1, anchor: left ? 'end' : 'start', valign: 'middle', fill: t.c('muted') }));
      parts.push(textLines([vf(d.b)], { x: xb + (left ? 14 : -14), y: yy, size: size - 1, anchor: left ? 'start' : 'end', valign: 'middle', fill: t.c('ink'), weight: 700 }));
    }
  });
  // Direct key on the first row when both labels fit beside their dots; otherwise a compact key.
  const f = data[0], fy = y(f.label) - 20, aLeft = f.a <= f.b;
  const aText = o.aLabel || 'A', bText = o.bLabel || 'B';
  const room = Math.abs(x(f.b) - x(f.a)), needA = measureText(aText, size - 1, { weight: 600 }), needB = measureText(bText, size - 1, { weight: 700 });
  const fitsOutside = (aLeft ? x(f.a) - needA > box.x - 4 : x(f.a) + needA < box.x + box.w + 4) && (aLeft ? x(f.b) + needB < box.x + box.w + 4 : x(f.b) - needB > box.x - 4);
  if (room > 18 && fitsOutside) {
    parts.push(textLines([aText], { x: x(f.a) + (aLeft ? 4 : -4), y: fy, size: size - 1, anchor: aLeft ? 'end' : 'start', fill: t.c('muted'), weight: 600 }));
    parts.push(textLines([bText], { x: x(f.b) + (aLeft ? -4 : 4), y: fy, size: size - 1, anchor: aLeft ? 'start' : 'end', fill: bC, weight: 700 }));
  } else {
    const ky = box.y - size - 12;
    parts.push(el('circle', { cx: box.x + 8, cy: ky, r: 7, fill: t.c('paper'), stroke: aC, 'stroke-width': 3 }));
    parts.push(textLines([aText], { x: box.x + 22, y: ky, size: size - 1, valign: 'middle', fill: t.c('muted'), weight: 600 }));
    const bx2 = box.x + 22 + needA + 26;
    parts.push(el('circle', { cx: bx2, cy: ky, r: 7.5, fill: bC }));
    parts.push(textLines([bText], { x: bx2 + 14, y: ky, size: size - 1, valign: 'middle', fill: t.c('ink'), weight: 700 }));
  }
  if (o.showDelta !== false) parts.push(textLines([o.deltaLabel ?? 'Change'], { x: ctx.W - 4, y: box.y - size - 6, size: size - 1, anchor: 'end', fill: t.c('muted'), weight: 600 }));
  if (o.unit) parts.push(textLines([o.unit], { x: box.x + box.w / 2, y: box.y + box.h + 52, size: size - 1, anchor: 'middle', fill: t.c('muted') }));
  const resolve = a => { const d = data.find(q => q.label === a.at); return d && { x: x(a.end === 'a' ? d.a : d.b), y: y(d.label) }; };
  return finish(o, ctx, parts, resolve, { x, y, box });
}

/**
 * Slope chart: many entities at two moments. data: [{label, a, b}].
 * Labels at both ends are spread to avoid collisions; highlight the story.
 */
export function slopeChart(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  const data = o.data.map((d, i) => ({ ...d, i }));
  const vf = valueFormat(o, data.flatMap(d => [d.a, d.b]));
  const leftW = Math.max(...data.map(d => measureText(`${d.label}  ${vf(d.a)}`, labelSize))) + 18;
  const rightW = Math.max(...data.map(d => measureText(`${vf(d.b)}  ${d.label}`, labelSize))) + 18;
  const box = plotBox(ctx.W, ctx.H, { left: leftW, right: rightW, top: size * 2 + 16, bottom: 14 });
  const all = data.flatMap(d => [d.a, d.b]);
  const y = linear(o.domain || extent(all), [box.y + box.h, box.y]);
  const xa = box.x, xb = box.x + box.w;
  const parts = [];
  parts.push(el('line', { x1: xa, x2: xa, y1: box.y - 6, y2: box.y + box.h + 6, stroke: t.c('rule'), 'stroke-width': 1.5 }));
  parts.push(el('line', { x1: xb, x2: xb, y1: box.y - 6, y2: box.y + box.h + 6, stroke: t.c('rule'), 'stroke-width': 1.5 }));
  parts.push(textLines([o.aLabel || 'Before'], { x: xa, y: 4, size, anchor: 'middle', valign: 'top', fill: t.c('muted'), weight: 700 }));
  parts.push(textLines([o.bLabel || 'After'], { x: xb, y: 4, size, anchor: 'middle', valign: 'top', fill: t.c('muted'), weight: 700 }));
  const hlOf = d => (o.highlight == null ? true : isHighlighted(o.highlight, d));
  const colorOf = (d, k) => d.color || (o.highlight == null ? t.cat(k) : hlOf(d) ? (o.highlightColor ? o.highlightColor(d) : (d.b >= d.a ? t.c('highlight') : t.c('negative'))) : t.c('context'));
  const L = spreadLabels(data.map(d => ({ id: d.i, y: y(d.a), h: labelSize * 1.2 })), { min: box.y - 8, max: box.y + box.h + 8, gap: 3 });
  const R = spreadLabels(data.map(d => ({ id: d.i, y: y(d.b), h: labelSize * 1.2 })), { min: box.y - 8, max: box.y + box.h + 8, gap: 3 });
  const order = [...data].sort((p, q) => Number(hlOf(p)) - Number(hlOf(q)));
  for (const d of order) {
    const k = d.i, c = colorOf(d, k), hl = hlOf(d) && o.highlight != null;
    parts.push(g({ class: 'ss-slope', ...buildAttrs(build, { i: k, motion: 'reveal' }) },
      el('line', { x1: xa, y1: y(d.a), x2: xb, y2: y(d.b), stroke: c, 'stroke-width': hl ? 3.5 : 2, 'stroke-linecap': 'round' }),
      el('circle', { cx: xa, cy: y(d.a), r: hl ? 6 : 4.5, fill: c }),
      el('circle', { cx: xb, cy: y(d.b), r: hl ? 6 : 4.5, fill: c })));
  }
  for (const d of data) {
    const hl = hlOf(d) && o.highlight != null, fill = hl ? t.c('ink') : o.highlight != null ? t.c('muted') : t.c('ink');
    const ly = L.find(l => l.id === d.i).y, ry = R.find(r => r.id === d.i).y;
    // A label pushed away from its dot by the spreader gets a short leader back to the dot.
    const leader = (x0, y0, x1, y1) => el('path', { d: `M${n(x0)} ${n(y0)}L${n(x1)} ${n(y1)}`, fill: 'none', stroke: t.c('rule'), 'stroke-width': 1 });
    if (Math.abs(ly - y(d.a)) > 3) parts.push(leader(xa - 6, y(d.a), xa - 12, ly));
    if (Math.abs(ry - y(d.b)) > 3) parts.push(leader(xb + 6, y(d.b), xb + 12, ry));
    parts.push(textLines([`${d.label}  ${vf(d.a)}`], { x: xa - 14, y: ly, size: labelSize, anchor: 'end', valign: 'middle', fill, weight: hl ? 700 : null }));
    parts.push(textLines([`${vf(d.b)}  ${d.label}`], { x: xb + 14, y: ry, size: labelSize, valign: 'middle', fill, weight: hl ? 700 : null, attrs: buildAttrs(build, { i: d.i, label: true }) }));
  }
  const resolve = a => { const d = data.find(q => q.label === a.at); return d && { x: (xa + xb) / 2, y: (y(d.a) + y(d.b)) / 2 }; };
  return finish(o, ctx, parts, resolve, { y, box });
}

/**
 * Cleveland dot plot: one or more values per row on one scale.
 * data: [{label, values:{seriesName: value}}] or [{label, value}]; series: names in order.
 */
export function dotPlot(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  const series = o.series || ['value'];
  const rows = o.data.map((d, i) => ({ ...d, vals: series.map(s => (d.values ? d.values[s] : d.value)), i }));
  if (o.sort) rows.sort((p, q) => q.vals[0] - p.vals[0]);
  const all = rows.flatMap(r => r.vals);
  const vf = valueFormat(o, all);
  ctx.H = o.height ?? Math.max(160, rows.length * (o.rowHeight ?? 42) + 80);
  const labelCol = Math.max(...rows.map(r => measureText(r.label, labelSize))) + 22;
  const box = plotBox(ctx.W, ctx.H, { left: labelCol, right: o.valueLabels === true ? 70 : 24, top: (series.length > 1 && o.legend !== false ? size + 22 : 10) + (o.valueLabels === 'all' ? size + 6 : 0), bottom: o.unit ? 60 : 40 });
  const x = linear(o.domain || niceDomain([Math.min(o.zero === false ? Infinity : 0, ...all), Math.max(...all)], 5), [box.x, box.x + box.w]);
  const y = point(rows.map(r => r.label), [box.y, box.y + box.h], { padding: 0.5 });
  const colorOf = k => (series.length === 1 ? (o.highlight != null ? null : t.cat(0)) : t.cat(k));
  const parts = [axis(x, { orient: 'bottom', at: box.y + box.h, grid: [box.y, box.y + box.h], theme: t, size: size - 1, format: tickFormat(o, x, 5) })];
  rows.forEach((r, k) => {
    const yy = y(r.label), hl = isHighlighted(o.highlight, r);
    parts.push(el('line', { x1: box.x, x2: box.x + box.w, y1: yy, y2: yy, stroke: t.c('grid'), 'stroke-width': 1, 'stroke-dasharray': '1 5', 'stroke-linecap': 'round' }));
    if (series.length > 1) parts.push(el('line', { x1: x(Math.min(...r.vals)), x2: x(Math.max(...r.vals)), y1: yy, y2: yy, stroke: t.c('rule'), 'stroke-width': 2.5 }));
    r.vals.forEach((v, si) => parts.push(el('circle', { cx: x(v), cy: yy, r: 8, fill: colorOf(si) || (hl ? t.c('highlight') : t.c('context')), stroke: t.c('paper'), 'stroke-width': 2, ...buildAttrs(build, { i: k, s: si, motion: 'settle' }) })));
    parts.push(textLines([r.label], { x: box.x - 14, y: yy, size: labelSize, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: hl ? 700 : null }));
    // valueLabels: true labels the row maximum; 'all' labels every dot (above it, to avoid the stem).
    if (o.valueLabels === 'all') r.vals.forEach(v => parts.push(textLines([vf(v)], { x: x(v), y: yy - 14, size: size - 1, anchor: 'middle', valign: 'bottom', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } })));
    else if (o.valueLabels) parts.push(textLines([vf(Math.max(...r.vals))], { x: x(Math.max(...r.vals)) + 14, y: yy, size: size - 1, valign: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  });
  if (series.length > 1 && o.legend !== false) parts.push(legend(series.map((s, k) => ({ label: s, color: t.cat(k), shape: 'dot' })), { x: box.x, y: 10, size: size - 1, theme: t }));
  if (o.unit) parts.push(textLines([o.unit], { x: box.x + box.w / 2, y: box.y + box.h + 52, size: size - 1, anchor: 'middle', fill: t.c('muted') }));
  const resolve = a => { const r = rows.find(q => q.label === a.at); return r && { x: x(r.vals[a.series ? series.indexOf(a.series) : 0]), y: y(r.label) }; };
  return finish(o, ctx, parts, resolve, { x, y, box });
}

/** Lollipop: a bar's information with less ink. Same data as barChart (horizontal). */
export function lollipopChart(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  let data = o.data.map((d, i) => ({ ...d, i }));
  if (o.sort !== false) data.sort((a, b) => b.value - a.value);
  const vf = valueFormat(o, data.map(d => d.value));
  ctx.H = o.height ?? Math.max(160, data.length * (o.rowHeight ?? 44) + 20);
  const labelCol = Math.max(...data.map(d => measureText(d.label, labelSize))) + 22;
  const vw = Math.max(...data.map(d => measureText(vf(d.value), size, { weight: 700 }))) + 22;
  const box = plotBox(ctx.W, ctx.H, { left: labelCol, right: vw, top: 8, bottom: o.reference?.label ? size + 16 : 8 });
  const x = linear([Math.min(0, ...data.map(d => d.value)), o.domain?.[1] ?? Math.max(...data.map(d => d.value), o.reference?.value ?? -Infinity)], [box.x, box.x + box.w]);
  const y = point(data.map(d => d.label), [box.y, box.y + box.h], { padding: 0.5 });
  const parts = [];
  data.forEach((d, k) => {
    const yy = y(d.label), hl = isHighlighted(o.highlight, d), c = colorFor(ctx, o, d, k, t.c('ink'));
    parts.push(g({ class: 'ss-lolli', ...buildAttrs(build, { i: k, motion: 'reveal' }) },
      el('line', { x1: x(0), x2: x(d.value), y1: yy, y2: yy, stroke: hl || o.highlight == null ? c : t.c('context'), 'stroke-width': 2.5 }),
      el('circle', { cx: x(d.value), cy: yy, r: hl ? 9 : 7.5, fill: c })));
    parts.push(textLines([d.label], { x: box.x - 14, y: yy, size: labelSize, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: hl ? 700 : null }));
    parts.push(textLines([vf(d.value)], { x: x(d.value) + 16, y: yy, size, valign: 'middle', fill: hl ? t.c('ink') : t.c('muted'), weight: hl ? 700 : 600, attrs: { 'font-variant-numeric': 'tabular-nums', ...buildAttrs(build, { i: k, label: true }) } }));
  });
  parts.push(el('line', { x1: x(0), x2: x(0), y1: box.y, y2: box.y + box.h, stroke: t.c('ink'), 'stroke-width': 1.4 }));
  // reference: {value, label} — a threshold or target drawn as a dashed line with its label at the bottom.
  if (o.reference && isNum(o.reference.value)) {
    const rx = x(o.reference.value);
    parts.push(el('line', { x1: rx, x2: rx, y1: box.y - 4, y2: box.y + box.h + 4, stroke: t.c('ink'), 'stroke-width': 1.4, 'stroke-dasharray': '5 4' }));
    if (o.reference.label) parts.push(textLines([o.reference.label], { x: rx + 6, y: box.y + box.h + 6, size: size - 1, valign: 'top', fill: t.c('ink'), weight: 600 }));
  }
  const resolve = a => { const d = data.find(q => q.label === a.at); return d && { x: x(d.value) + vw, y: y(d.label) }; };
  return finish(o, ctx, parts, resolve, { x, y, box });
}

/**
 * Bullet chart: actual vs target against qualitative ranges.
 * data: [{label, value, target, ranges:[poorMax, okMax, max]}].
 */
export function bulletChart(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  const data = o.data;
  const rowFormat = d => valueFormat(o, [d.value, d.target, ...(d.ranges || [])]);
  ctx.H = o.height ?? Math.max(140, data.length * (o.rowHeight ?? 74) + 10);
  const labelCol = Math.max(...data.map(d => Math.max(measureText(d.label, labelSize, { weight: 700 }), d.sub ? measureText(d.sub, Math.max(15, size - 2)) : 0))) + 24;
  const box = plotBox(ctx.W, ctx.H, { left: labelCol, right: 90, top: 6, bottom: 6 });
  const y = band(data.map(d => d.label), [box.y, box.y + box.h], { inner: 0.42, outer: 0.1 });
  const parts = [];
  data.forEach((d, k) => {
    const max = d.ranges?.at(-1) ?? Math.max(d.value, d.target) * 1.15;
    const x = linear([0, max], [box.x, box.x + box.w]);
    const yy = y(d.label), bh = y.bw;
    const vf = rowFormat(d);
    const shades = [t.c('context'), t.c('rule'), t.c('grid'), t.c('surface')];
    (d.ranges || [max]).forEach((r, ri, arr) => {
      const r0 = ri ? arr[ri - 1] : 0;
      parts.push(el('rect', { x: x(r0), y: yy, width: x(r) - x(r0), height: bh, fill: shades[Math.min(shades.length - 1, ri + Math.max(0, 3 - arr.length))] }));
    });
    const good = d.value >= d.target;
    parts.push(el('rect', { x: box.x, y: yy + bh * 0.32, width: x(d.value) - box.x, height: bh * 0.36, fill: o.highlight != null && !isHighlighted(o.highlight, d) ? t.c('muted') : t.c('ink'), style: build ? 'transform-origin:0% 50%' : null, ...buildAttrs(build, { i: k, motion: 'grow-x' }) }));
    parts.push(el('line', { x1: x(d.target), x2: x(d.target), y1: yy + bh * 0.12, y2: yy + bh * 0.88, stroke: t.c('accent'), 'stroke-width': 3.5 }));
    parts.push(textLines([d.label], { x: box.x - 16, y: yy + bh / 2 - (d.sub ? 9 : 0), size: labelSize, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: 700 }));
    if (d.sub) parts.push(textLines([d.sub], { x: box.x - 16, y: yy + bh / 2 + 12, size: Math.max(15, size - 2), anchor: 'end', valign: 'middle', fill: t.c('muted') }));
    parts.push(textLines([vf(d.value)], { x: box.x + box.w + 14, y: yy + bh / 2 - 8, size, valign: 'middle', fill: t.c('ink'), weight: 700, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
    parts.push(textLines([`${o.targetWord ?? 'target'} ${vf(d.target)}`], { x: box.x + box.w + 14, y: yy + bh / 2 + 12, size: Math.max(15, size - 3), valign: 'middle', fill: good ? t.c('muted') : t.c('negative') }));
  });
  return finish(o, ctx, parts, null, { y, box });
}

/**
 * Waterfall: how deltas build a total. data: [{label, value, total?:true}].
 * A total bar shows the running sum (its own value is ignored unless `totalValue`).
 */
export function waterfallChart(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  // build.holdFirst: the opening total is on the page from build 0; contributions then build.
  const hold = (k, s) => !!(build && o.build?.holdFirst && k === 0 && s.total);
  let run = 0;
  const steps = o.data.map((d, i) => {
    if (d.total) {
      let v = run;
      if (isNum(d.value)) {
        if (i > 0 && Math.abs(d.value - run) > 1e-6 * Math.max(1, Math.abs(run))) throw Error(`${o.id}: total "${d.label}" is ${d.value}, but the bars above it sum to ${+run.toFixed(6)}. Fix the data rather than the label.`);
        v = d.value;
      }
      run = v;
      return { ...d, i, from: 0, to: v, total: true };
    }
    const from = run; run += d.value; return { ...d, i, from, to: run, total: false };
  });
  const all = steps.flatMap(s => [s.from, s.to]);
  const vf = valueFormat(o, o.data.map(d => d.value ?? 0));
  const sf = valueFormat(o, o.data.map(d => d.value ?? 0), { sign: true });
  const [lo, hi] = o.domain || niceDomain([Math.min(0, ...all), Math.max(...all)], 5);
  const m = { left: 14, right: 14, top: size + 18 + (o.unit ? 26 : 0), bottom: 2 * labelSize * 1.18 + 16 };
  const yt = linear([lo, hi], [ctx.H - m.bottom, m.top]);
  if (o.axis) m.left = tickLabelWidth(yt, { format: tickFormat(o, yt, 5), size: size - 1 }) + 16;
  const box = plotBox(ctx.W, ctx.H, m);
  const x = band(steps.map(s => s.label), [box.x, box.x + box.w], { inner: 0.3, outer: 0.12 });
  const y = linear([lo, hi], [box.y + box.h, box.y]);
  const parts = [];
  if (o.axis) parts.push(axis(y, { orient: 'left', at: box.x, grid: [box.x, box.x + box.w], theme: t, size: size - 1, format: tickFormat(o, y, 5) }));
  if (o.unit) parts.push(textLines([o.unit], { x: 4, y: 16, size: size - 1, fill: t.c('muted') }));
  steps.forEach((s, k) => {
    const up = s.to >= s.from, y0 = y(s.from), y1 = y(s.to), xx = x(s.label);
    const fill = s.total ? t.c('ink') : up ? (o.positiveColor || t.c('positive')) : (o.negativeColor || t.c('negative'));
    parts.push(el('rect', { x: xx, y: Math.min(y0, y1), width: x.bw, height: Math.max(1.5, Math.abs(y1 - y0)), fill, rx: 2, class: s.total ? 'ss-total' : 'ss-delta', style: build ? `transform-origin:${up ? '50% 100%' : '50% 0%'}` : null, ...(hold(k, s) ? {} : buildAttrs(build, { i: k, motion: 'grow-y' })) }));
    if (k < steps.length - 1) {
      const nx = x(steps[k + 1].label);
      parts.push(el('line', { x1: xx + x.bw, x2: nx, y1: y1, y2: y1, stroke: t.c('muted'), 'stroke-width': 1.2, 'stroke-dasharray': '3 3', ...(hold(k, s) ? {} : buildAttrs(build, { i: k, label: true })) }));
    }
    const label = s.total ? vf(s.to) : sf(s.to - s.from);
    const top = Math.min(y0, y1);
    parts.push(textLines([label], { x: xx + x.bw / 2, y: top - 8, size, anchor: 'middle', fill: s.total ? t.c('ink') : up ? t.c('positive') : t.c('negative'), weight: 700, attrs: { 'font-variant-numeric': 'tabular-nums', ...(hold(k, s) ? {} : buildAttrs(build, { i: k, label: true })) } }));
    parts.push(textLines(wrapLabel(s.label, x.step - 6, labelSize - 1), { x: xx + x.bw / 2, y: box.y + box.h + 10, size: labelSize - 1, anchor: 'middle', valign: 'top', fill: t.c('ink'), weight: s.total ? 700 : null, lineHeight: 1.15 }));
  });
  if (lo < 0) parts.push(el('line', { x1: box.x, x2: box.x + box.w, y1: y(0), y2: y(0), stroke: t.c('ink'), 'stroke-width': 1.2 }));
  const resolve = a => { const s = steps.find(q => q.label === a.at); return s && { x: x.center(s.label), y: y(Math.max(s.from, s.to)) - size - 14 }; };
  return finish(o, ctx, parts, resolve, { x, y, box, steps });
}

// ---------------------------------------------------------------- part to whole

/**
 * Waffle: a share as countable squares. value/total, or parts:[{label, value}].
 * cols × rows cells (default 10 × 10, one cell = 1%).
 */
export function waffleChart(o) {
  const ctx = setup(o, { width: 520, height: 520 });
  const { t, size, build } = ctx;
  const cols = o.cols ?? 10, rows = o.rows ?? 10, cells = cols * rows;
  const parts0 = o.parts || [{ label: o.label ?? 'Share', value: o.value }, { label: o.restLabel ?? 'Rest', value: (o.total ?? cells) - o.value, rest: true }];
  const total = o.total ?? sum(parts0.map(p => p.value));
  // Largest-remainder rounding: cells sum exactly to the grid, and the leftover
  // cells go to the parts with the largest fractional share (not to the last part).
  const exact = parts0.map(p => (p.value / total) * cells);
  const counts = exact.map(Math.floor);
  const order = exact.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0]);
  for (let k = 0; k < cells - sum(counts); k++) counts[order[k % order.length][1]]++;
  const gap = o.gap ?? 5, side = Math.min((ctx.W - gap * (cols - 1)) / cols, (ctx.H - gap * (rows - 1)) / rows);
  const gw = side * cols + gap * (cols - 1), gh = side * rows + gap * (rows - 1);
  // align: 'center' (default) | 'start' | 'end' — horizontal placement of the grid in the figure.
  const ox = o.align === 'start' ? 0 : o.align === 'end' ? ctx.W - gw : (ctx.W - gw) / 2, oy = (ctx.H - gh) / 2;
  const cellsOut = [];
  let idx = 0;
  parts0.forEach((p, pi) => {
    const fill = p.rest ? t.c('context') : p.color || (parts0.length <= 2 ? t.c('highlight') : t.cat(pi));
    for (let k = 0; k < counts[pi]; k++, idx++) {
      // Fill column-major from bottom-left so the share reads like a rising level.
      const col = o.order === 'rows' ? idx % cols : Math.floor(idx / rows), row = o.order === 'rows' ? Math.floor(idx / cols) : rows - 1 - (idx % rows);
      cellsOut.push(el('rect', { x: ox + col * (side + gap), y: oy + (o.order === 'rows' ? row : row) * (side + gap), width: side, height: side, rx: o.round ? side / 2 : Math.min(3, side / 6), fill, ...(p.rest ? {} : buildAttrs(build, { i: idx, motion: 'settle' })) }));
    }
  });
  return finish(o, ctx, [g({ class: 'ss-waffle' }, cellsOut)], null, { side, gap, ox, oy });
}

/**
 * Unit chart: groups of countable units (e.g. 24 of 40 sites).
 * groups: [{label, count, highlight?, mark?}]; perRow units per row (default 10, or 'auto' to fill the width).
 * mark: a count (first n units), an index list, or a predicate k → bool; marked units use the accent.
 */
export function unitChart(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  const r = o.radius ?? 9, gap = o.gap ?? 7, cell = r * 2 + gap;
  const labelCol = Math.max(...o.groups.map(gp => measureText(gp.label, labelSize, { weight: 700 }))) + 26;
  // perRow: a number (default 10), or 'auto' to fill the available width in whole tens.
  const fit = Math.max(1, Math.floor((ctx.W - labelCol + gap) / cell));
  const perRow = o.perRow === 'auto' ? (fit >= 10 ? Math.min(Math.floor(fit / 10) * 10, 50) : fit) : (o.perRow ?? 10);
  // unitMarks: per-group indices (or a predicate) of units drawn in the accent, e.g. the 9 walkers aged 70+.
  const marked = (gp, k) => (typeof gp.mark === 'function' ? gp.mark(k) : Array.isArray(gp.mark) ? gp.mark.includes(k) : isNum(gp.mark) && k < gp.mark);
  const parts = [];
  let y0 = 10, idx = 0;
  o.groups.forEach((gp, gi) => {
    const rowsN = Math.ceil(gp.count / perRow), hl = gp.highlight ?? (o.highlight != null && isHighlighted(o.highlight, gp));
    parts.push(textLines([gp.label], { x: labelCol - 18, y: y0 + r, size: labelSize, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: 700 }));
    parts.push(textLines([fmt(gp.count, { locale: ctx.locale })], { x: labelCol - 18, y: y0 + r + labelSize + 4, size: size - 1, anchor: 'end', valign: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
    for (let k = 0; k < gp.count; k++, idx++) {
      const cx = labelCol + (k % perRow) * cell + r, cy = y0 + Math.floor(k / perRow) * cell + r;
      const fill = marked(gp, k) ? t.c('accent') : hl ? t.c('highlight') : t.c('context');
      parts.push(o.shape === 'square'
        ? el('rect', { x: cx - r, y: cy - r, width: 2 * r, height: 2 * r, rx: 2, fill, ...buildAttrs(build, { i: idx, s: gi, motion: 'settle' }) })
        : el('circle', { cx, cy, r, fill, ...buildAttrs(build, { i: idx, s: gi, motion: 'settle' }) }));
    }
    y0 += Math.max(rowsN * cell, labelSize * 2.6) + (o.groupGap ?? 22);
  });
  ctx.H = o.height ?? y0;
  return finish(o, ctx, parts, null, {});
}

/**
 * Donut for 2–5 parts of one whole. Labels sit outside with values and shares;
 * use a bar chart when parts must be compared precisely.
 */
export function donutChart(o) {
  const ctx = setup(o, { width: 760, height: 460 });
  const { t, size, labelSize, build } = ctx;
  const data = o.data;
  if (data.length > 6) throw Error(`${o.id}: more than 6 parts — use a bar chart`);
  const total = sum(data.map(d => d.value));
  const cx = o.cx ?? ctx.H / 2 + 10, cy = ctx.H / 2, R = o.radius ?? ctx.H / 2 - 16, r0 = R * (o.hole ?? 0.62);
  let a = -Math.PI / 2;
  const parts = [], keys = [];
  data.forEach((d, k) => {
    const share = d.value / total, a1 = a + share * Math.PI * 2;
    const fill = d.color || (o.highlight != null ? (isHighlighted(o.highlight, d) ? t.c('highlight') : (k % 2 ? t.c('context') : t.seq(2))) : t.cat(k));
    parts.push(el('path', { d: arcPath(cx, cy, r0, R, a, a1 - (data.length > 1 ? 0.012 : 0)), fill, ...buildAttrs(build, { i: k, motion: 'reveal' }) }));
    keys.push({ d, k, share, fill });
    a = a1;
  });
  const vf = valueFormat(o, data.map(d => d.value));
  const lx = cx + R + 48;
  let ly = cy - ((keys.length - 1) * (labelSize * 2.6)) / 2;
  for (const { d, share, fill, k } of keys) {
    parts.push(el('rect', { x: lx, y: ly - 9, width: 18, height: 18, rx: 3, fill }));
    parts.push(textLines([d.label], { x: lx + 30, y: ly - 2, size: labelSize, valign: 'middle', fill: t.c('ink'), weight: isHighlighted(o.highlight, d) ? 700 : null }));
    parts.push(textLines([`${fmt(share * 100, { digits: 0, suffix: '%', locale: ctx.locale })}  ·  ${vf(d.value)}${o.unitSuffix ?? ''}`], { x: lx + 30, y: ly + labelSize + 2, size: size - 1, valign: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums', ...buildAttrs(build, { i: k, label: true }) } }));
    ly += labelSize * 2.6;
  }
  if (o.center) {
    parts.push(textLines([o.center.value], { x: cx, y: cy - 4, size: o.center.size ?? 44, anchor: 'middle', valign: 'baseline', fill: t.c('ink'), weight: 700, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
    if (o.center.label) parts.push(textLines(wrapText(o.center.label, r0 * 1.5, size - 1), { x: cx, y: cy + 18, size: size - 1, anchor: 'middle', valign: 'top', fill: t.c('muted') }));
  }
  return finish(o, ctx, parts, null, { cx, cy, R });
}

// ---------------------------------------------------------------- time & trend

/**
 * Line chart for ordered observations.
 *   x: category labels (equal spacing) OR numeric values via xType 'linear'.
 *   series: [{name, values:[y|null] (aligned to x) | points:[[x,y]], color?, dash?, band?:[[lo,hi]]}]
 *   highlight: series name(s); endLabels (default true) place names at line ends.
 *   bands: [{from, to, label}] shade x-ranges (forecast, policy period).
 *   refLines: [{y, label}]; markers: 'last'|'all'|'none'; curve: 'linear'|'monotone'|'step'.
 *   zero: include 0 in the y-domain (default false; true when any value is 0..small).
 */
export function lineChart(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  const series = o.series;
  if (!series?.length) throw Error(`${o.id}: series required`);
  const numericX = o.xType === 'linear' || series.some(s => s.points);
  const xs = o.x || [];
  const ptsOf = s => (s.points ? s.points.map(([a, b]) => [a, b]) : s.values.map((v, i) => [numericX ? xs[i] : i, v]));
  const allY = series.flatMap(s => [...ptsOf(s).map(p => p[1]), ...(s.band || []).flat()]).filter(isNum);
  if (!allY.length) throw Error(`${o.id}: no finite values`);
  const refYs = (o.refLines || []).map(r => r.y);
  let [ylo, yhi] = extent([...allY, ...refYs]);
  if (o.zero) ylo = Math.min(0, ylo);
  const [d0, d1] = o.yDomain || niceDomain([ylo, yhi], o.yTicks ?? 5);
  const vf = valueFormat(o, allY);
  const endLabel = s => (o.endValues === false ? s.name : `${s.name}  ${vf(lastFinite(ptsOf(s))[1])}`);
  const endW = o.endLabels === false ? 16 : Math.max(...series.map(s => measureText(endLabel(s), labelSize, { weight: 700 }))) + 22;
  const yTmp = linear([d0, d1], [ctx.H - 40, 30]);
  const tf = tickFormat(o, yTmp, o.yTicks ?? 5);
  const m = { left: tickLabelWidth(yTmp, { format: tf, size: size - 1, count: o.yTicks ?? 5 }) + 18, right: endW, top: o.unit ? 44 : 14, bottom: 40 };
  if (o.xLabel) m.bottom += 26;
  const box = plotBox(ctx.W, ctx.H, m);
  const y = linear([d0, d1], [box.y + box.h, box.y]);
  const x = numericX
    ? linear(o.xDomain || extent(series.flatMap(s => ptsOf(s).map(p => p[0]))), [box.x, box.x + box.w])
    : (i => box.x + (xs.length > 1 ? (i / (xs.length - 1)) * box.w : box.w / 2));
  const parts = [];
  for (const b of o.bands || []) {
    const bx0 = x(numericX ? b.from : xs.indexOf(b.from)), bx1 = x(numericX ? b.to : xs.indexOf(b.to));
    parts.push(el('rect', { x: Math.min(bx0, bx1), y: box.y, width: Math.abs(bx1 - bx0), height: box.h, fill: t.c('surface') }));
    if (b.label) parts.push(textLines([b.label], { x: Math.min(bx0, bx1) + 8, y: box.y + 6, size: size - 1, valign: 'top', fill: t.c('muted'), weight: 600 }));
  }
  parts.push(axis(y, { orient: 'left', at: box.x, grid: [box.x, box.x + box.w], theme: t, size: size - 1, format: tf, count: o.yTicks ?? 5, zero: d0 < 0 && d1 > 0 }));
  if (o.unit) parts.push(textLines([o.unit], { x: box.x - m.left + 4, y: 4, size: size - 1, fill: t.c('muted'), valign: 'top', cls: 'ss-unit' }));
  // x labels: thin to fit
  if (numericX) {
    parts.push(axis(x, { orient: 'bottom', at: box.y + box.h, theme: t, size: size - 1, format: o.xFormat || tickFormat({ ...o, format: o.xFormatOptions || { digits: 0 } }, x, o.xTicks ?? 6), count: o.xTicks ?? 6, tickSize: 5 }));
  } else {
    const every = o.xEvery ?? Math.max(1, Math.ceil(xs.length / Math.max(2, Math.floor(box.w / (Math.max(...xs.map(v => measureText(String(v), size - 1))) + 24)))));
    xs.forEach((v, i) => {
      if (i % every && i !== xs.length - 1) return;
      if (i !== xs.length - 1 && i + every > xs.length - 1 && (xs.length - 1 - i) < every * 0.6) return;
      parts.push(el('line', { x1: x(i), x2: x(i), y1: box.y + box.h, y2: box.y + box.h + 5, stroke: t.c('rule') }));
      parts.push(textLines([String(v)], { x: x(i), y: box.y + box.h + 12, size: size - 1, anchor: 'middle', valign: 'top', fill: t.c('muted') }));
    });
  }
  if (o.xLabel) parts.push(textLines([o.xLabel], { x: box.x + box.w, y: ctx.H - 6, size: size - 1, anchor: 'end', fill: t.c('muted') }));
  for (const r of o.refLines || []) {
    const near = side => Math.min(...series.map(s => { const pts = ptsOf(s).filter(p => isNum(p[1])); const p = side === 'end' ? pts.at(-1) : pts[0]; return p ? Math.abs(y(p[1]) - y(r.y)) : Infinity; }));
    const labelPos = r.labelPos || (near('end') >= near('start') ? 'end' : 'start');
    parts.push(refLine({ orient: 'h', at: y(r.y), from: box.x, to: box.x + box.w, label: r.label, labelPos, theme: t, size: size - 1, color: r.color ? t.c(r.color) : t.c('muted') }));
  }
  const hl = s => o.highlight == null || isHighlighted(o.highlight, s, 'name');
  const colorOf = (s, k) => s.color || (o.highlight != null ? (hl(s) ? (series.filter(hl).length > 1 ? t.cat(series.filter(hl).indexOf(s)) : t.c('highlight')) : t.c('context')) : t.cat(k));
  const ordered = series.map((s, k) => ({ s, k })).sort((a, b) => Number(hl(a.s)) - Number(hl(b.s)));
  const ends = [];
  for (const { s, k } of ordered) {
    const pts = ptsOf(s).map(([a, b]) => [x(a), isNum(b) ? y(b) : null]);
    const c = colorOf(s, k), strong = o.highlight == null || hl(s);
    if (s.band) {
      const up = s.band.map((b, i) => [x(numericX ? xs[i] ?? ptsOf(s)[i][0] : i), y(b[1])]), dn = s.band.map((b, i) => [x(numericX ? xs[i] ?? ptsOf(s)[i][0] : i), y(b[0])]).reverse();
      parts.push(el('path', { d: pathFromPoints([...up, ...dn], { close: true }), fill: s.bandColor || (strong ? t.seq(1) : t.c('grid')), class: 'ss-band', ...buildAttrs(build, { i: k, s: k, motion: 'reveal' }) }));
    }
    if (o.area && strong) {
      for (const seg of segments(pts)) parts.push(el('path', { d: pathFromPoints([...seg, [seg.at(-1)[0], y(Math.max(d0, Math.min(0, d1)))], [seg[0][0], y(Math.max(d0, Math.min(0, d1)))]], { curve: o.curve, close: true }), fill: s.areaColor || t.seq(0), class: 'ss-area' }));
    }
    for (const seg of segments(pts)) {
      parts.push(el('path', { d: pathFromPoints(seg, { curve: o.curve }), fill: 'none', stroke: c, 'stroke-width': strong ? (o.strokeWidth ?? 3.2) : 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': s.dash || null, pathLength: build ? 1 : null, class: 'ss-line', ...buildAttrs(build, { i: 0, s: k, motion: 'draw' }) }));
    }
    const fin = pts.filter(p => isNum(p[1]));
    if (o.markers === 'all') for (const p of fin) parts.push(el('circle', { cx: p[0], cy: p[1], r: strong ? 4.5 : 3, fill: c, stroke: t.c('paper'), 'stroke-width': 1.5, ...buildAttrs(build, { s: k, label: true }) }));
    const last = fin.at(-1);
    if (o.markers !== 'none' && last) parts.push(el('circle', { cx: last[0], cy: last[1], r: strong ? 6 : 4, fill: c, stroke: t.c('paper'), 'stroke-width': 2, ...buildAttrs(build, { s: k, label: true }) }));
    if (last) ends.push({ id: k, y: last[1], h: labelSize * 1.25, x: last[0], s, c, strong });
  }
  if (o.endLabels !== false) {
    const placed = spreadLabels(ends, { min: box.y - 6, max: box.y + box.h + 6, gap: 3 });
    for (const p of placed) {
      const e = ends.find(q => q.id === p.id);
      if (p.shifted) parts.push(el('path', { d: `M${n(e.x + 8)} ${n(e.y)}L${n(e.x + 14)} ${n(p.y)}`, fill: 'none', stroke: t.c('rule'), 'stroke-width': 1 }));
      parts.push(textLines([endLabel(e.s)], { x: e.x + 16, y: p.y, size: labelSize, valign: 'middle', fill: e.strong ? e.c : t.c('muted'), weight: e.strong ? 700 : 500, attrs: buildAttrs(build, { s: e.id, label: true }) }));
    }
  }
  const resolve = a => {
    const s = a.series ? series.find(q => q.name === a.series) : series[0];
    if (!s) return null;
    const i = numericX ? null : (typeof a.at === 'number' ? a.at : xs.indexOf(a.at));
    const pts = ptsOf(s);
    const p = numericX ? pts.find(q => q[0] === a.at) : pts[i];
    return p && isNum(p[1]) ? { x: x(p[0]), y: y(p[1]) } : null;
  };
  return finish(o, ctx, parts, resolve, { x, y, box });
}
const lastFinite = pts => [...pts].reverse().find(p => isNum(p[1])) || [0, 0];

/** Area chart: one series with a filled area to a zero baseline. */
export const areaChart = o => lineChart({ ...o, area: true, zero: o.zero ?? true });

/**
 * Small multiples: one mini line chart per panel on a SHARED y scale.
 * panels: [{title, values:[..]}], x: labels; cols; highlight panel titles.
 */
export function smallMultiples(o) {
  const ctx = setup(o);
  const { t, size, build } = ctx;
  const panels = o.panels, cols = o.cols ?? Math.min(4, panels.length), rowsN = Math.ceil(panels.length / cols);
  const gapX = o.gapX ?? 36, gapY = o.gapY ?? 40;
  const pw = (ctx.W - gapX * (cols - 1)) / cols, ph = (ctx.H - gapY * (rowsN - 1)) / rowsN;
  const all = panels.flatMap(p => p.values).filter(isNum);
  const [d0, d1] = o.yDomain || niceDomain([o.zero ? Math.min(0, ...all) : Math.min(...all), Math.max(...all)], 3);
  const vf = valueFormat(o, all);
  const parts = [];
  panels.forEach((p, k) => {
    const px = (k % cols) * (pw + gapX), py = Math.floor(k / cols) * (ph + gapY);
    const top = py + size + 30, bottom = py + ph - 22;
    const y = linear([d0, d1], [bottom, top]);
    const x = i => px + 4 + (i / Math.max(1, p.values.length - 1)) * (pw - 70);
    const hl = o.highlight == null || isHighlighted(o.highlight, p, 'title');
    const c = hl ? (o.highlight != null ? t.c('highlight') : t.cat(0)) : t.c('muted');
    parts.push(textLines([p.title], { x: px, y: py + 4, size, valign: 'top', fill: t.c('ink'), weight: 700 }));
    for (const tv of y.ticks(2)) parts.push(el('line', { x1: px, x2: px + pw - 60, y1: y(tv), y2: y(tv), stroke: tv === 0 ? t.c('rule') : t.c('grid'), 'stroke-width': 1 }));
    if (k % cols === 0) for (const tv of y.ticks(2)) parts.push(textLines([fmt(tv, { locale: ctx.locale, digits: decimalsOf(y.tickStep(2), 3), ...(o.tickFormatOptions || {}) })], { x: px - 6, y: y(tv), size: Math.max(15, size - 3), anchor: 'end', valign: 'middle', fill: t.c('muted') }));
    const pts = p.values.map((v, i) => [x(i), isNum(v) ? y(v) : null]);
    if (o.area) for (const seg of segments(pts)) parts.push(el('path', { d: pathFromPoints([...seg, [seg.at(-1)[0], y(Math.max(d0, 0))], [seg[0][0], y(Math.max(d0, 0))]], { close: true }), fill: hl ? t.seq(0) : t.c('grid') }));
    for (const seg of segments(pts)) parts.push(el('path', { d: pathFromPoints(seg), fill: 'none', stroke: c, 'stroke-width': hl ? 2.8 : 2, 'stroke-linejoin': 'round', pathLength: build ? 1 : null, ...buildAttrs(build, { i: k, motion: 'draw' }) }));
    const last = pts.filter(q => isNum(q[1])).at(-1);
    if (last) {
      parts.push(el('circle', { cx: last[0], cy: last[1], r: 4.5, fill: c }));
      parts.push(textLines([vf(p.values.filter(isNum).at(-1))], { x: last[0] + 9, y: last[1], size: size - 1, valign: 'middle', fill: hl ? t.c('ink') : t.c('muted'), weight: 700 }));
    }
    if (o.x && Math.floor(k / cols) === rowsN - 1) {
      parts.push(textLines([String(o.x[0])], { x: x(0), y: bottom + 8, size: Math.max(15, size - 3), valign: 'top', fill: t.c('muted') }));
      parts.push(textLines([String(o.x.at(-1))], { x: x(p.values.length - 1), y: bottom + 8, size: Math.max(15, size - 3), anchor: 'end', valign: 'top', fill: t.c('muted') }));
    }
  });
  return finish(o, ctx, parts, null, {});
}

/**
 * Gantt / schedule. tasks: [{label, start, end, group?, milestone?, done?}] on a
 * numeric time axis (days, weeks …). ticks: [{at, label}] (or plain numbers) define the calendar labels.
 * today: position of a "now" line.
 */
export function ganttChart(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  const tasks = o.tasks;
  ctx.H = o.height ?? Math.max(180, tasks.length * (o.rowHeight ?? 40) + 70);
  const labelCol = Math.max(...tasks.map(k => measureText(k.label, labelSize))) + 28;
  const groupsPre = [...new Set(tasks.map(k => k.group).filter(Boolean))];
  const legendRow = groupsPre.length > 1 && o.legend !== false ? size + 18 : 0;
  ctx.H += legendRow + (isNum(o.today) ? 26 : 0);
  const box = plotBox(ctx.W, ctx.H, { left: labelCol, right: 20, top: 40 + legendRow, bottom: 10 + (isNum(o.today) ? 26 : 0) });
  const [s0, s1] = o.domain || [Math.min(...tasks.map(k => k.start)), Math.max(...tasks.map(k => k.end ?? k.start))];
  const x = linear([s0, s1], [box.x, box.x + box.w]);
  const y = band(tasks.map(k => k.label), [box.y, box.y + box.h], { inner: 0.42, outer: 0.15 });
  const groups = [...new Set(tasks.map(k => k.group).filter(Boolean))];
  const parts = [];
  for (const raw of o.ticks || []) {
    const tk = isNum(raw) ? { at: raw, label: String(raw) } : raw; // plain numbers label themselves
    parts.push(el('line', { x1: x(tk.at), x2: x(tk.at), y1: box.y - 8, y2: box.y + box.h, stroke: t.c('grid') }));
    parts.push(textLines([tk.label], { x: x(tk.at) + 6, y: box.y - 14, size: size - 1, fill: t.c('muted'), valign: 'baseline' }));
  }
  tasks.forEach((tk, k) => {
    const yy = y(tk.label), gi = groups.indexOf(tk.group);
    const fill = tk.color || (o.highlight != null ? (isHighlighted(o.highlight, tk) ? t.c('highlight') : t.c('context')) : gi >= 0 ? t.cat(gi) : t.cat(0));
    if (k % 2 === 0 && o.zebra !== false) parts.push(el('rect', { x: 0, y: yy - (y.step - y.bw) / 2, width: ctx.W, height: y.step, fill: t.c('surface'), opacity: 0.6 }));
    if (tk.milestone) {
      const mx = x(tk.start), my = yy + y.bw / 2, r = y.bw * 0.55;
      parts.push(el('path', { d: `M${n(mx)} ${n(my - r)}L${n(mx + r)} ${n(my)}L${n(mx)} ${n(my + r)}L${n(mx - r)} ${n(my)}Z`, fill: t.c('ink'), ...buildAttrs(build, { i: k, motion: 'settle' }) }));
      if (tk.note) parts.push(textLines([tk.note], { x: mx + r + 8, y: my, size: size - 1, valign: 'middle', fill: t.c('ink'), weight: 600 }));
    } else {
      parts.push(el('rect', { x: x(tk.start), y: yy, width: Math.max(4, x(tk.end) - x(tk.start)), height: y.bw, rx: Math.min(6, y.bw / 2), fill, style: build ? 'transform-origin:0% 50%' : null, ...buildAttrs(build, { i: k, motion: 'grow-x' }) }));
      if (isNum(tk.done) && tk.done > 0) parts.push(el('rect', { x: x(tk.start), y: yy + y.bw - 5, width: Math.max(2, (x(tk.end) - x(tk.start)) * Math.min(1, tk.done)), height: 5, rx: 2, fill: t.c('ink'), opacity: 0.55 }));
      if (tk.note) parts.push(textLines([tk.note], { x: x(tk.end) + 8, y: yy + y.bw / 2, size: size - 1, valign: 'middle', fill: t.c('muted') }));
    }
    parts.push(textLines([tk.label], { x: box.x - 16, y: yy + y.bw / 2, size: labelSize, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: tk.milestone ? 700 : null }));
  });
  if (isNum(o.today)) {
    parts.push(el('line', { x1: x(o.today), x2: x(o.today), y1: box.y - 4, y2: box.y + box.h + 6, stroke: t.c('accent'), 'stroke-width': 2 }));
    parts.push(textLines([o.todayLabel ?? 'Today'], { x: x(o.today), y: box.y + box.h + 10, size: size - 1, anchor: 'middle', valign: 'top', fill: t.c('accent'), weight: 700 }));
  }
  if (legendRow) parts.push(legend(groups.map((gname, k) => ({ label: gname, color: t.cat(k) })), { x: box.x, y: 12, size: size - 1, theme: t }));
  const resolve = a => { const tk = tasks.find(q => q.label === a.at); return tk && { x: x(tk.end ?? tk.start), y: y.center(tk.label) }; };
  return finish(o, ctx, parts, resolve, { x, y, box });
}

/**
 * Timeline. events: [{at (number), label, title?, body?}] positioned on a true
 * time scale (spacing = duration), or equal spacing with `equal:true`.
 * periods: [{from, to, label}] drawn as bands above the axis.
 */
export function timelineChart(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  const ev = o.events;
  const margin = Math.max(...ev.map(e => measureText(e.title ?? e.label, labelSize, { weight: 700 }))) / 2 + 10;
  const box = { x: Math.min(margin, ctx.W * 0.12), w: ctx.W - 2 * Math.min(margin, ctx.W * 0.12) };
  const ax = o.axisY ?? ctx.H * 0.5;
  const x = o.equal ? (i => box.x + (i / Math.max(1, ev.length - 1)) * box.w) : linear(o.domain || extent(ev.map(e => e.at)), [box.x, box.x + box.w]);
  const pos = (e, i) => (o.equal ? x(i) : x(e.at));
  const parts = [];
  parts.push(el('line', { x1: box.x - 12, x2: box.x + box.w + 12, y1: ax, y2: ax, stroke: t.c('ink'), 'stroke-width': 2 }));
  const width = o.labelWidth ?? Math.min(240, (box.w / Math.max(1, ev.length - 1)) * 1.7);
  let lowest = ax + 10;
  // Place each event's text block on the first side/stem level that collides with no
  // block already placed (alternating sides first), so dense timelines stay readable.
  const placed = [];
  const hit = (a, b) => a.x0 < b.x1 + 10 && b.x0 < a.x1 + 10 && a.y0 < b.y1 + 6 && b.y0 < a.y1 + 6;
  ev.forEach((e, i) => {
    const px = pos(e, i), hl = isHighlighted(o.highlight, e);
    const anchor = px < box.x + width / 2 ? 'start' : px > box.x + box.w - width / 2 ? 'end' : 'middle';
    const tx = anchor === 'start' ? px - 6 : anchor === 'end' ? px + 6 : px;
    const lines = [];
    if (e.label) lines.push({ text: [e.label], size: size - 1, fill: hl ? t.c('accent') : t.c('muted'), weight: 700 });
    if (e.title) lines.push({ text: wrapText(e.title, width, labelSize, { weight: 700 }), size: labelSize, fill: t.c('ink'), weight: 700 });
    if (e.body) lines.push({ text: wrapText(e.body, width, size - 1), size: size - 1, fill: t.c('muted') });
    const h = sum(lines.map(L => L.text.length * L.size * 1.25)) + (lines.length - 1) * 4;
    const w = Math.max(...lines.map(L => blockWidth(L.text, L.size, { weight: L.weight || 400 })));
    const xs = anchor === 'start' ? [tx, tx + w] : anchor === 'end' ? [tx - w, tx] : [tx - w / 2, tx + w / 2];
    const prefer = o.side === 'above' ? [true] : o.side === 'below' ? [false] : (i % 2 === 0 ? [true, false] : [false, true]);
    const base = o.stem ?? 46, step = o.stemStep ?? 40;
    const blockAt = (up, k) => { const stem = base + k * step; const y0 = up ? ax - stem - 8 - h : ax + stem + 8; return { up, stem, x0: xs[0], x1: xs[1], y0, y1: y0 + h }; };
    let pick = null;
    for (let k = 0; k < 4 && !pick; k++) for (const up of prefer) {
      const b = blockAt(up, k);
      if (b.y0 >= 0 && b.y1 <= ctx.H && !placed.some(q => hit(b, q))) { pick = b; break; }
    }
    pick ??= blockAt(prefer[0], o.stagger ? (i % 4 >= 2 ? 1 : 0) : 0);
    placed.push(pick);
    const { up, stem } = pick;
    const items = [];
    items.push(el('line', { x1: px, x2: px, y1: ax, y2: up ? ax - stem : ax + stem, stroke: hl ? t.c('accent') : t.c('rule'), 'stroke-width': 1.5 }));
    items.push(el('circle', { cx: px, cy: ax, r: hl ? 9 : 7, fill: hl ? t.c('accent') : t.c('paper'), stroke: hl ? t.c('accent') : t.c('ink'), 'stroke-width': 2.5 }));
    let yy = pick.y0;
    lowest = Math.max(lowest, up ? ax + 10 : pick.y1);
    for (const L of lines) {
      items.push(textLines(L.text, { x: tx, y: yy, size: L.size, anchor, valign: 'top', fill: L.fill, weight: L.weight, lineHeight: 1.25 }));
      yy += L.text.length * L.size * 1.25 + 4;
    }
    parts.push(g({ class: 'ss-event', ...buildAttrs(build, { i, motion: 'reveal' }) }, items));
  });
  // Periods: a tint on the axis plus a labeled bracket just below the lowest event text.
  const trackY = Math.min(ctx.H - 20, lowest + 34);
  for (const p of o.periods || []) {
    const x0 = x(p.from), x1 = x(p.to);
    parts.splice(0, 0, el('rect', { x: x0, y: ax - 5, width: x1 - x0, height: 10, rx: 5, fill: t.seq(1) }));
    parts.push(el('path', { d: `M${n(x0)} ${n(trackY - 16)}V${n(trackY - 8)}H${n(x1)}V${n(trackY - 16)}`, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.4 }));
    if (p.label) parts.push(textLines([p.label], { x: (x0 + x1) / 2, y: trackY + 4, size: Math.max(15, size - 2), anchor: 'middle', valign: 'middle', fill: t.c('muted'), weight: 600 }));
  }
  const resolve = a => { const i = ev.findIndex(e => e.label === a.at || e.title === a.at); return i >= 0 ? { x: pos(ev[i], i), y: ax } : null; };
  return finish(o, ctx, parts, resolve, { x });
}

/**
 * Funnel: stage counts with the conversion between consecutive stages.
 * stages: [{label, value}]. Bars are centered; widths are proportional to value.
 */
export function funnelChart(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  const st = o.stages, max = st[0].value;
  const vf = valueFormat(o, st.map(s => s.value));
  const labelCol = Math.max(...st.map(s => measureText(s.label, labelSize, { weight: 600 }))) + 24;
  const rateCol = 150;
  const box = plotBox(ctx.W, ctx.H, { left: labelCol, right: rateCol, top: 6, bottom: 6 });
  const y = band(st.map(s => s.label), [box.y, box.y + box.h], { inner: 0.3, outer: 0.05 });
  const cx = box.x + box.w / 2;
  const parts = [];
  st.forEach((s, k) => {
    const w = (s.value / max) * box.w, yy = y(s.label), hl = isHighlighted(o.highlight, s);
    const fill = o.highlight != null ? (hl ? t.c('highlight') : t.c('context')) : t.seq(Math.max(1, 5 - k));
    parts.push(el('rect', { x: cx - w / 2, y: yy, width: w, height: y.bw, rx: 4, fill, style: build ? 'transform-origin:50% 50%' : null, ...buildAttrs(build, { i: k, motion: 'grow-x' }) }));
    const txt = vf(s.value);
    const inside = w > measureText(txt, size + 2, { weight: 700 }) + 24;
    parts.push(textLines([txt], { x: inside ? cx : cx + w / 2 + 10, y: yy + y.bw / 2, size: size + 2, anchor: inside ? 'middle' : 'start', valign: 'middle', fill: inside ? (o.highlight != null ? (hl ? t.c('onAccent') : t.c('ink')) : onPalette(t, 'seq', Math.max(1, 5 - k))) : t.c('ink'), weight: 700, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
    parts.push(textLines([s.label], { x: box.x - 14, y: yy + y.bw / 2, size: labelSize, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: 600 }));
    if (k) {
      const rate = s.value / st[k - 1].value;
      const my = yy - (y.step - y.bw) / 2;
      parts.push(textLines([`${fmt(rate * 100, { digits: o.rateDigits ?? 0, suffix: '%', locale: ctx.locale })} ${o.rateWord ?? 'continue'}`], { x: box.x + box.w + 16, y: my, size: size - 1, valign: 'middle', fill: rate < (o.alertBelow ?? 0) ? t.c('negative') : t.c('muted'), weight: 600, attrs: buildAttrs(build, { i: k, label: true }) }));
      parts.push(el('path', { d: `M${n(box.x + box.w + 6)} ${n(my - 8)}l0 16`, stroke: t.c('rule'), 'stroke-width': 1.5 }));
    }
  });
  const resolve = a => { const s = st.find(q => q.label === a.at); return s && { x: cx + ((s.value / max) * box.w) / 2, y: y.center(s.label) }; };
  return finish(o, ctx, parts, resolve, { y, box });
}

/**
 * Sankey for a few layers. nodes: [{id, label, layer?}], links: [{source, target, value}].
 * Node heights are proportional to throughput; link widths to value.
 */
export function sankeyChart(o) {
  const ctx = setup(o);
  const { t, size, labelSize, build } = ctx;
  const nodes = o.nodes.map(nd => ({ ...nd, in: 0, out: 0 }));
  const byId = new Map(nodes.map(nd => [nd.id, nd]));
  for (const l of o.links) { const s = byId.get(l.source), tt = byId.get(l.target); if (!s || !tt) throw Error(`${o.id}: unknown link endpoint ${l.source}→${l.target}`); s.out += l.value; tt.in += l.value; }
  // layer = longest path from a source unless provided
  for (const nd of nodes) if (nd.layer === undefined) nd.layer = 0;
  if (!o.nodes.every(nd => nd.layer !== undefined)) {
    for (let pass = 0; pass < nodes.length; pass++) for (const l of o.links) { const s = byId.get(l.source), tt = byId.get(l.target); if (tt.layer <= s.layer) tt.layer = s.layer + 1; }
  }
  const layers = Math.max(...nodes.map(nd => nd.layer)) + 1;
  const nodeW = o.nodeWidth ?? 16, padY = o.nodePadding ?? 22;
  const labelSpace = Math.max(...nodes.map(nd => measureText(nd.label, labelSize, { weight: 700 }))) + 16;
  const box = plotBox(ctx.W, ctx.H, { left: labelSpace * 0.0 + 4, right: labelSpace, top: 8, bottom: 8 });
  const colX = k => box.x + (k / Math.max(1, layers - 1)) * (box.w - nodeW);
  const value = nd => Math.max(nd.in, nd.out);
  const cols = Array.from({ length: layers }, (_, k) => nodes.filter(nd => nd.layer === k));
  const scale = Math.min(...cols.map(c => (box.h - padY * (c.length - 1)) / sum(c.map(value))));
  for (const c of cols) {
    const total = sum(c.map(value)) * scale + padY * (c.length - 1);
    let yy = box.y + (box.h - total) / 2;
    for (const nd of c) { nd.x = colX(nd.layer); nd.y = yy; nd.h = value(nd) * scale; yy += nd.h + padY; nd.sy = nd.y; nd.ty = nd.y; }
  }
  const parts = [];
  const links = [...o.links].sort((a, b) => byId.get(a.source).y - byId.get(b.source).y || byId.get(a.target).y - byId.get(b.target).y);
  links.forEach((l, k) => {
    const s = byId.get(l.source), tt = byId.get(l.target), w = l.value * scale;
    const x0 = s.x + nodeW, x1 = tt.x, y0 = s.sy + w / 2, y1 = tt.ty + w / 2;
    s.sy += w; tt.ty += w;
    const mx = (x0 + x1) / 2;
    const hl = o.highlight != null && (isHighlighted(o.highlight, l, 'source') || isHighlighted(o.highlight, l, 'target') || (typeof o.highlight === 'function' && o.highlight(l)));
    parts.push(el('path', {
      d: `M${n(x0)} ${n(y0 - w / 2)}C${n(mx)} ${n(y0 - w / 2)} ${n(mx)} ${n(y1 - w / 2)} ${n(x1)} ${n(y1 - w / 2)}L${n(x1)} ${n(y1 + w / 2)}C${n(mx)} ${n(y1 + w / 2)} ${n(mx)} ${n(y0 + w / 2)} ${n(x0)} ${n(y0 + w / 2)}Z`,
      fill: hl ? t.c('highlight') : (o.linkColor === 'source' ? t.cat(nodes.indexOf(s)) : t.c('context')), opacity: hl ? 0.85 : 0.55, class: 'ss-link', ...buildAttrs(build, { i: k, motion: 'reveal' }),
    }));
  });
  const vf = valueFormat(o, nodes.map(value));
  nodes.forEach((nd, k) => {
    parts.push(el('rect', { x: nd.x, y: nd.y, width: nodeW, height: Math.max(2, nd.h), fill: t.c('ink'), rx: 2 }));
    const right = nd.layer < layers - 1 ? false : true;
    const lx = right ? nd.x + nodeW + 10 : nd.layer === 0 ? nd.x + nodeW + 10 : nd.x + nodeW + 10;
    parts.push(textLines([nd.label], { x: lx, y: nd.y + nd.h / 2 - (labelSize * 0.55), size: labelSize, valign: 'middle', fill: t.c('ink'), weight: 700, halo: t.c('paper') }));
    parts.push(textLines([vf(value(nd))], { x: lx, y: nd.y + nd.h / 2 + labelSize * 0.6, size: size - 1, valign: 'middle', fill: t.c('muted'), halo: t.c('paper'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  });
  return finish(o, ctx, parts, null, {});
}
