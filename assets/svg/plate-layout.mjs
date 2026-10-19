// Diagram study · Plate layout — a 96-well plate drawn to SBS dimensions, every well's role computed from
// the row/column design below, never placed by hand. Counts, the dilution series and the excluded well
// in the headline come from the same `design`, so the map matches the run record.
import { svgRoot, el, g, textLines, theme as makeTheme, fmt, arrowMarker } from '../runtime/figure.mjs';

// ANSI/SLAS footprint (mm): 127.76 × 85.48, A1 centre 14.38 from the left and 11.24 from the top, 9 mm pitch.
const plate = { id: 'P-0193', w: 127.76, h: 85.48, a1x: 14.38, a1y: 11.24, pitch: 9, well: 6.6 };
const rows = [...'ABCDEFGH'], cols = Array.from({ length: 12 }, (_, i) => i + 1);
const series = { top: 30, factor: 3, cols: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] };          // µM, 3-fold down the columns
const compounds = [ { name: 'K-17', rows: 'ABC' }, { name: 'K-22', rows: 'DEF' }, { name: 'Ref-3', rows: 'GH' } ];
const controls = { blank: { col: 1, label: 'Blank, medium only' }, vehicle: { col: 12, rows: 'ABCD', label: 'Vehicle, 0.1% DMSO' }, positive: { col: 12, rows: 'EFGH', label: 'Positive control, 1 µM staurosporine' } };
const excluded = [{ well: 'C7', reason: 'air bubble at read' }];

// Role of every well, from the design (no hand placement).
const conc = c => series.top / series.factor ** series.cols.indexOf(c);
const roleOf = (r, c) => {
  if (c === controls.blank.col) return { role: 'blank' };
  if (c === controls.vehicle.col && controls.vehicle.rows.includes(r)) return { role: 'vehicle' };
  if (c === controls.positive.col && controls.positive.rows.includes(r)) return { role: 'positive' };
  if (series.cols.includes(c)) return { role: 'dose', conc: conc(c), compound: compounds.find(k => k.rows.includes(r)).name };
  return { role: 'empty' };
};
const wells = rows.flatMap(r => cols.map(c => ({ id: `${r}${c}`, r, c, ...roleOf(r, c), out: excluded.find(x => x.well === `${r}${c}`) })));
const out = wells.find(w => w.out);   // the excluded well named in the headline
const doseWells = wells.filter(w => w.role === 'dose').length, controlWells = wells.filter(w => ['blank', 'vehicle', 'positive'].includes(w.role)).length;
const uM = v => (v >= 1 ? `${fmt(v, { digits: v >= 10 ? 0 : 1 })} µM` : `${fmt(v * 1000, { digits: v * 1000 >= 10 ? 0 : 1 })} nM`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'plate-layout-fig';
  const s = 4.7, px = 114, py = 54;                                           // px per mm; plate's top-left corner
  const X = c => px + (plate.a1x + (c - 1) * plate.pitch) * s, Y = r => py + (plate.a1y + rows.indexOf(r) * plate.pitch) * s;
  const R = (plate.well / 2) * s, n = series.cols.length;
  const shade = c => t.seq(Math.round(((n - 1 - series.cols.indexOf(c)) / (n - 1)) * 6));   // darker = more drug
  const well = w => {
    const cx = X(w.c), cy = Y(w.r), base = { cx, cy, r: R };
    const body = w.role === 'dose' ? el('circle', { ...base, fill: shade(w.c), stroke: t.c('ink'), 'stroke-width': 1 })
      : w.role === 'blank' ? el('circle', { ...base, fill: t.c('paper'), stroke: t.c('muted'), 'stroke-width': 1.2, 'stroke-dasharray': '3 3' })
        : w.role === 'vehicle' ? el('circle', { ...base, r: R - 1.5, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 3 })
          : w.role === 'positive' ? el('circle', { ...base, fill: t.c('ink') }) : el('circle', { ...base, fill: 'none', stroke: t.c('rule') });
    const mark = w.out ? g({}, el('circle', { cx, cy, r: R + 5, fill: 'none', stroke: t.c('accent'), 'stroke-width': 2.5 }),
      el('path', { d: `M${cx - R * 0.7} ${cy - R * 0.7}L${cx + R * 0.7} ${cy + R * 0.7}M${cx + R * 0.7} ${cy - R * 0.7}L${cx - R * 0.7} ${cy + R * 0.7}`, stroke: t.c('accent'), 'stroke-width': 3, 'stroke-linecap': 'round' })) : '';
    return g({ 'data-well': w.id }, body, mark);
  };
  const lx = 770;                                                              // legend column
  const legendRow = (y, swatch, text, sub) => g({}, swatch, textLines([text], { x: lx + 30, y, size: 16, valign: 'middle', fill: t.c('ink') }), sub ? textLines([sub], { x: lx + 30, y: y + 20, size: 15, valign: 'middle', fill: t.c('muted') }) : '');
  return svgRoot({ id, width: W, height: H, theme: t,
    title: `96-well plate map for plate ${plate.id}`,
    desc: `Columns 2 to 11 hold a ${series.factor}-fold dilution series from ${uM(series.top)} down to ${uM(conc(series.cols.at(-1)))}: ${compounds.map(k => `${k.name} in rows ${k.rows.split('').join(', ')}`).join('; ')}. Column 1 is blank medium; column 12 holds vehicle (rows A–D) and positive control (rows E–H). ${doseWells} dose wells, ${controlWells} control wells. Well ${out.id} is excluded: ${out.out.reason}. Plate drawn to the 127.76 × 85.48 mm SBS footprint.` },
  el('defs', {}, arrowMarker(`${id}-arr`, t.c('ink'))),
  // plate body and molded labels
  el('rect', { x: px, y: py, width: plate.w * s, height: plate.h * s, rx: 3 * s, fill: t.c('surface'), stroke: t.c('ink'), 'stroke-width': 2 }),
  rows.map(r => textLines([r], { x: px + 6.5 * s, y: Y(r), size: 16, anchor: 'middle', valign: 'middle', weight: 700, fill: t.c('muted') })),
  cols.map(c => textLines([String(c)], { x: X(c), y: py + 5 * s, size: 15, anchor: 'middle', valign: 'middle', weight: 700, fill: t.c('muted') })),
  wells.map(well),
  // dilution direction across columns 2–11
  el('path', { d: `M${X(series.cols[0])} ${py - 16}H${X(series.cols.at(-1))}`, stroke: t.c('ink'), 'stroke-width': 1.5, 'marker-end': `url(#${id}-arr)` }),
  textLines([uM(series.top)], { x: X(series.cols[0]), y: py - 24, size: 15, valign: 'bottom', weight: 700, fill: t.c('ink') }),
  textLines([`${series.factor}-fold steps to ${uM(conc(series.cols.at(-1)))}`], { x: X(series.cols.at(-1)), y: py - 24, size: 15, anchor: 'end', valign: 'bottom', fill: t.c('ink') }),
  // compound blocks: brackets left of the plate
  compounds.map(k => { const y0 = Y(k.rows[0]) - R, y1 = Y(k.rows.at(-1)) + R; return g({},
    el('path', { d: `M${px - 8} ${y0}h-8V${y1}h8`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.5 }),
    textLines([k.name], { x: px - 24, y: (y0 + y1) / 2 - 10, size: 17, anchor: 'end', valign: 'middle', weight: 700, fill: t.c('ink') }),
    textLines([k.rows.length === 3 ? 'triplicate' : 'duplicate'], { x: px - 24, y: (y0 + y1) / 2 + 11, size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') })); }),
  // scale bar on the plate skirt
  el('path', { d: `M${px + 8 * s} ${py + plate.h * s - 4.5 * s}h${10 * s}`, stroke: t.c('ink'), 'stroke-width': 2.5 }),
  textLines(['10 mm'], { x: px + 8 * s + 10 * s + 8, y: py + plate.h * s - 4.5 * s, size: 15, valign: 'middle', weight: 600, fill: t.c('ink') }),
  // legend: dose ramp, controls, the excluded well
  textLines(['Dose, darker = more compound'], { x: lx, y: 4, size: 16, valign: 'top', weight: 700, fill: t.c('ink') }),
  series.cols.map((c, i) => g({}, el('circle', { cx: lx + 12 + i * 34, cy: 46, r: 13, fill: shade(c), stroke: t.c('ink'), 'stroke-width': 1 }))),
  textLines([uM(series.top)], { x: lx, y: 70, size: 15, valign: 'top', fill: t.c('muted') }),
  textLines([uM(conc(series.cols.at(-1)))], { x: lx + 24 + (n - 1) * 34, y: 70, size: 15, anchor: 'end', valign: 'top', fill: t.c('muted') }),
  textLines(['Controls'], { x: lx, y: 124, size: 16, valign: 'top', weight: 700, fill: t.c('ink') }),
  legendRow(168, el('circle', { cx: lx + 12, cy: 168, r: 12, fill: t.c('paper'), stroke: t.c('muted'), 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }), controls.blank.label, `column ${controls.blank.col}`),
  legendRow(222, el('circle', { cx: lx + 12, cy: 222, r: 10.5, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 3 }), controls.vehicle.label, `${controls.vehicle.rows[0]}${controls.vehicle.col}–${controls.vehicle.rows.at(-1)}${controls.vehicle.col}`),
  legendRow(276, el('circle', { cx: lx + 12, cy: 276, r: 12, fill: t.c('ink') }), controls.positive.label.split(', ')[0], `${controls.positive.label.split(', ')[1]}, ${controls.positive.rows[0]}${controls.positive.col}–${controls.positive.rows.at(-1)}${controls.positive.col}`),
  el('line', { fill: 'none', x1: lx, x2: W, y1: 322, y2: 322, stroke: t.c('rule') }),
  textLines([`${out.id} excluded`], { x: lx, y: 344, size: 18, valign: 'top', weight: 700, fill: t.c('accent') }),
  textLines([`${out.out.reason}; kept on the map`, `and in the run log, not refilled`], { x: lx, y: 372, size: 15, valign: 'top', fill: t.c('muted'), lineHeight: 1.35 }),
  // leader leaves the flagged well upward and runs in the gap between rows, never across other wells
  el('path', { d: `M${X(out.c)} ${Y(out.r) - R - 5}V${Y(out.r) - (plate.pitch / 2) * s}H${lx - 26}V${356}H${lx - 8}`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 1.5 }));
}

export default {
  study: true,
  id: 'plate-layout',
  title: 'Plate layout: every well accounted for',
  className: 'st cs-materials-lab',
  notes: 'Purpose: Map what is in every well of a plate, so results can be traced to the right compound, dose and control.\nModify: Edit `series`, `compounds`, `controls` and `excluded`; each well’s role, shade, the counts and the headline recompute from the design. Change `plate` for 384-well or other footprints.\nInvariant: Well IDs follow the plate’s row letters and column numbers; the map is the run record, so never permute wells for visual balance; excluded wells stay on the map with their reason; the plate is drawn to its real footprint with a scale bar.\nStatic: Already static. For a talk, reveal controls first, then the dilution series.',
  sources: [{ type: 'original-example', file: 'assets/svg/plate-layout.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Plate ${plate.id}: ${doseWells} dose wells and ${controlWells} controls, with <em>${out.id}&nbsp;excluded</em> and logged</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative design · cell-viability assay, compounds K-17 and K-22 against reference Ref-3</span><span>96-well plate map</span></p>`,
};
