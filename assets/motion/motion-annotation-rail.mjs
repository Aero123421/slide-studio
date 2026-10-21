// Motion study · Unstack labels onto a readable rail — the chart opens with a conventional
// legend; then each legend label travels to a rail beside the end of the line it names,
// spaced so none collide, and a leader ties it to its line. The lines never move.
// Builds: 1 legend → rail, 2 end values and the peak.
import { svgRoot, el, g, linear, textLines, pathFromPoints, spreadLabels, measureText, theme as makeTheme, fmt, n } from '../runtime/figure.mjs';

const quarters = Array.from({ length: 20 }, (_, i) => `${2021 + Math.floor(i / 4)} Q${(i % 4) + 1}`);
// Consumer price index by food group, 2021 Q1 = 100 (illustrative national statistics).
const groups = [
  { name: 'Oils and fats', cat: 1, index: [100, 104, 113, 121, 136, 158, 149, 139, 132, 127, 124, 123, 124, 126, 128, 129, 130, 131, 131, 131.4] },
  { name: 'Dairy and eggs', cat: 0, index: [100, 101, 102, 104, 107, 111, 116, 120, 122, 123, 124, 124, 125, 126, 127, 127, 128, 129, 129, 129.8] },
  { name: 'Bread and cereals', cat: 2, index: [100, 101, 103, 105, 109, 114, 119, 123, 125, 126, 126, 126, 126, 127, 127, 127, 128, 128, 128, 128.9] },
  { name: 'Meat', cat: 3, index: [100, 100, 101, 102, 104, 107, 110, 113, 116, 118, 120, 121, 122, 123, 124, 125, 126, 126, 127, 127.6] },
];
const ends = groups.map(gr => gr.index.at(-1));
const spread = Math.max(...ends) - Math.min(...ends);
const spiker = groups[0], peak = Math.max(...spiker.index), peakAt = spiker.index.indexOf(peak);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { l: 56, r: 260, t: 30, b: 40 };
  const x = linear([0, quarters.length - 1], [m.l, W - m.r]), y = linear([90, 160], [H - m.b, m.t]);
  const legend = { x: m.l + 30, y: m.t + 26, row: 30 };          // where the labels start
  const railX = W - m.r + 44;                                     // where they end up
  const placed = spreadLabels(groups.map((gr, k) => ({ id: k, y: y(gr.index.at(-1)), h: 26 })), { min: m.t, max: H - m.b, gap: 4 });
  const xEnd = x(quarters.length - 1);
  return svgRoot({ id: 'motion-annotation-rail-fig', width: W, height: H, theme: t,
    title: `Consumer prices by food group, ${quarters[0]} to ${quarters.at(-1)}, index ${quarters[0]} = 100`,
    desc: `${spiker.name} peaked at ${peak} in ${quarters[peakAt]}; by ${quarters.at(-1)} all four groups were between ${fmt(Math.min(...ends), { digits: 1 })} and ${fmt(Math.max(...ends), { digits: 1 })}.` },
  [90, 100, 110, 120, 130, 140, 150, 160].map(v => g({},
    el('line', { x1: m.l, x2: xEnd, y1: y(v), y2: y(v), stroke: v === 100 ? t.c('ink') : t.c('grid'), 'stroke-width': v === 100 ? 1.3 : 1 }),
    textLines([String(v)], { x: m.l - 12, y: y(v), size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
  [2021, 2022, 2023, 2024, 2025].map((yr, i) => textLines([String(yr)], { x: x(i * 4), y: H - m.b + 12, size: 16, valign: 'top', fill: t.c('muted') })),
  textLines([`Index, ${quarters[0]} = 100`], { x: 0, y: 2, size: 16, valign: 'top', fill: t.c('muted') }),
  groups.map(gr => el('path', { d: pathFromPoints(gr.index.map((v, i) => [x(i), y(v)])), fill: 'none', stroke: t.cat(gr.cat), 'stroke-width': 3, 'stroke-linejoin': 'round' })),
  // The legend's swatches: needed only while the labels are detached from the lines.
  g({ 'data-states': { 0: { opacity: 1 }, 1: { opacity: 0 } }, 'data-duration': 300 },
    groups.map((gr, k) => el('line', { x1: legend.x - 30, x2: legend.x - 8, y1: legend.y + k * legend.row, y2: legend.y + k * legend.row, stroke: t.cat(gr.cat), 'stroke-width': 4 }))),
  // Leaders from each line end to its rail slot, drawn once the label has arrived.
  g({ 'data-step': 1, 'data-motion': 'draw', 'data-delay': 1000, 'data-duration': 400 },
    groups.map((gr, k) => el('path', { d: pathFromPoints([[xEnd + 8, y(gr.index.at(-1))], [railX - 22, placed[k].y], [railX - 8, placed[k].y]]), fill: 'none', stroke: t.cat(gr.cat), 'stroke-width': 1.4 }))),
  groups.map((gr, k) => el('circle', { cx: xEnd, cy: y(gr.index.at(-1)), r: 4.5, fill: t.cat(gr.cat), stroke: t.c('paper'), 'stroke-width': 1.5 })),
  // The labels: drawn at their rail slots; at build 0 they are translated back into the legend.
  groups.map((gr, k) => g({ 'data-states': { 0: { transform: `matrix(1,0,0,1,${n(legend.x - railX)},${n(legend.y + k * legend.row - placed[k].y)})` }, 1: { transform: 'matrix(1,0,0,1,0,0)' } },
    'data-duration': 800, 'data-delay': k * 70, 'data-easing': 'smooth', style: 'transform-box:view-box;transform-origin:0 0' }, // top label first
    textLines([gr.name], { x: railX, y: placed[k].y, size: 18, valign: 'middle', fill: t.cat(gr.cat), weight: 700, halo: t.c('paper') }),
    textLines([fmt(gr.index.at(-1), { digits: 1 })], { x: railX + measureText(gr.name, 18, { weight: 700 }) + 12, y: placed[k].y, size: 18, valign: 'middle', fill: t.c('ink'), attrs: { 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 100 + k * 70 } }))),
  // Build 2 — the spike that makes the shared ending remarkable.
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 400 },
    el('circle', { cx: x(peakAt), cy: y(peak), r: 6, fill: t.cat(spiker.cat), stroke: t.c('paper'), 'stroke-width': 2 }),
    textLines([`${quarters[peakAt]}: ${peak}, up ${peak - 100}% in ${peakAt} quarters`], { x: x(peakAt) + 14, y: y(peak) - 4, size: 17, fill: t.cat(spiker.cat), weight: 700, halo: t.c('paper') })));
}

export default {
  study: true,
  id: 'motion-annotation-rail',
  title: 'Annotation rail: from legend to direct labels',
  className: 'st cs-navy-classic-light',
  notes: `Purpose: Give labels room without changing what they name: the legend labels travel to a rail beside the line ends, spaced so none collide, and leaders tie each to its line.\nModify: Replace \`groups\` (one index series each); rail slots come from spreadLabels on the end values, so they adapt when ends bunch or spread. Keep at most four or five series in categorical colors.\nInvariant: Lines, scales and colors never change; each label keeps its color and moves as one element (translate only) from its legend slot to its rail slot; leaders appear after the labels arrive.\nStatic: The final build shows direct labels on the rail with end values, and the peak annotated (the legend swatches are gone).`,
  sources: [{ type: 'original-example', file: 'assets/motion/motion-annotation-rail.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head"><em>${spiker.name}</em> spiked ${peak - 100}% by ${quarters[peakAt]}, yet all ${['', 'one', 'two', 'three', 'four', 'five'][groups.length]} food groups ended ${quarters.at(-1).slice(0, 4)} within ${Math.ceil(spread)} points</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · consumer price index by food group, quarterly</span><span>Motion · legend labels move onto a rail (2 builds)</span></p>`,
};
