// Composition study · Methods figure — a handling sequence read in order, mapped onto true time.
// Steps sit in evenly spaced columns so each can be read; connectors carry each one down to its
// real interval on a minutes axis, so the reader sees both the order and where the time goes.
// The same tube (T1) is drawn in each state, to scale, so identity and volumes stay visible.
import { svgRoot, el, g, textLines, linear, fmt, theme as makeTheme } from '../runtime/figure.mjs';

const tube = { mm: [16, 100], fillMl: 10, plasmaShare: 0.55 };   // 10 mL K2EDTA tube, haematocrit ≈ 45%
const vial = { mm: [12.5, 48], ml: 2 };                            // 2 mL cryovial
const aliquots = { plasma: ['P1', 'P2', 'P3', 'P4'], plasmaMl: 1.0, buffy: 'B1' };
const steps = [ // minutes after the draw (illustrative protocol, plasma biomarker sub-study)
  { name: 'Draw', from: 0, to: 1, object: 'blood', lines: ['10 mL K₂EDTA tube', 'invert 8 times'] },
  { name: 'Rest', from: 1, to: 30, object: 'blood', lines: ['upright at 18–25 °C', 'spin within 30 min'] },
  { name: 'Centrifuge', from: 30, to: 40, object: 'layers', lines: ['1,500 × g for 10 min', 'at 4 °C, brake off'] },
  { name: 'Aliquot', from: 40, to: 52, object: 'vials', lines: [`plasma ${aliquots.plasma.length} × ${fmt(aliquots.plasmaMl, { digits: 1 })} mL`, 'buffy coat 1 vial'] },
  { name: 'Freeze', from: 55, to: 55, object: 'box', lines: ['−80 °C, upright', 'scanned into the log'] },
];
const limit = 120;                                   // protocol: frozen within 120 min of the draw
const frozenAt = steps.at(-1).from;
const spare = limit - frozenAt;
const plasmaMl = tube.fillMl * tube.plasmaShare;

export function figure(themeArg = 'css') {
  const t = makeTheme(themeArg), W = 1152, H = 500, px = 1.5;      // drawing scale: 1.5 px per mm
  const colW = W / steps.length, base = 190;                          // objects stand on this line
  const axisY = 452, x = linear([0, limit], [10, W - 12]);
  // One material, one tone, in every drawing: whole blood and red cells dark, plasma light grey, buffy coat white.
  const tone = { blood: t.c('muted'), cells: t.c('muted'), plasma: t.c('context'), buffy: t.c('paper') };
  const tubeAt = (cx, kind) => {
    const w = tube.mm[0] * px, h = tube.mm[1] * px, cap = 22, x0 = cx - w / 2, top = base - h, r = w / 2;
    const body = `M${x0} ${top + cap}V${base - r}A${r} ${r} 0 0 0 ${x0 + w} ${base - r}V${top + cap}`;
    const liquidTop = base - (h - cap) * 0.78;                        // 10 mL fills about 78% of the body
    const cells = (base - liquidTop) * (1 - tube.plasmaShare), buffyY = base - cells - 4;
    const clip = `composition-methods-figure-clip-${Math.round(cx)}`;
    const layers = kind === 'blood'
      ? [el('rect', { x: x0, y: liquidTop, width: w, height: base - liquidTop, fill: tone.blood })]
      : [el('rect', { x: x0, y: liquidTop, width: w, height: base - liquidTop, fill: tone.plasma }),
        el('rect', { x: x0, y: base - cells, width: w, height: cells, fill: tone.cells }),
        el('rect', { x: x0, y: buffyY, width: w, height: 4, fill: tone.buffy })];
    const lx = x0 + w + 6, label = (text, y, va = 'middle') => g({},
      el('line', { x1: x0 + w + 1, x2: lx + 6, y1: y, y2: y, stroke: t.c('ink'), 'stroke-width': 1 }),
      textLines([text], { x: lx + 12, y, size: 16, valign: va, fill: t.c('ink') }));
    return g({},
      el('defs', {}, el('clipPath', { id: clip }, el('path', { d: body + 'Z' }))),
      g({ 'clip-path': `url(#${clip})` }, layers),
      el('path', { d: body, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.6 }),
      el('rect', { x: x0 - 2, y: top, width: w + 4, height: cap, rx: 2, fill: t.c('ink') }),
      textLines(['T1'], { x: x0 + w + 10, y: top + cap / 2, size: 16, valign: 'middle', fill: t.c('muted'), weight: 600 }),
      kind === 'layers' ? g({},
        label(`plasma ≈ ${fmt(plasmaMl, { digits: 1 })} mL`, liquidTop + (base - liquidTop - cells) / 2),
        label('buffy coat', buffyY + 2),
        label('red cells', base - cells / 2)) : '');
  };
  const vialAt = (cx, label, fillShare, material) => {
    const w = vial.mm[0] * px, h = vial.mm[1] * px, cap = 13, x0 = cx - w / 2, top = base - h, r = 4;
    const fillTop = base - (h - cap) * fillShare;
    return g({},
      el('rect', { x: x0, y: fillTop, width: w, height: base - fillTop, rx: r, fill: tone[material] }),
      material === 'buffy' ? el('line', { x1: x0 + 2, x2: x0 + w - 2, y1: fillTop, y2: fillTop, stroke: t.c('ink'), 'stroke-width': 1 }) : '',
      el('rect', { x: x0, y: top + cap, width: w, height: h - cap, rx: r, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.4 }),
      el('rect', { x: x0 - 1.5, y: top, width: w + 3, height: cap, rx: 2, fill: t.c('ink') }),
      textLines([label], { x: cx, y: base + 8, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') }));
  };
  const ids = [...aliquots.plasma, aliquots.buffy], pitch = 30;
  const vials = cx => ids.map((id, k) => vialAt(cx - ((ids.length - 1) * pitch) / 2 + k * pitch, id,
    id === aliquots.buffy ? 0.16 : aliquots.plasmaMl / vial.ml, id === aliquots.buffy ? 'buffy' : 'plasma'));
  const objects = steps.map((s, i) => {
    const cx = colW * i + colW / 2 - (s.object === 'layers' ? 44 : 0);
    if (s.object === 'blood' || s.object === 'layers') return tubeAt(cx, s.object);
    if (s.object === 'vials') return g({}, vials(cx));
    const bw = ids.length * pitch + 14, bh = vial.mm[1] * px + 46, bx = cx - bw / 2;   // the freezer box holds the same five vials
    return g({}, vials(cx), el('rect', { x: bx, y: base - vial.mm[1] * px - 14, width: bw, height: bh, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.4 }));
  });
  const text = steps.map((s, i) => g({},
    textLines([`${i + 1}  ${s.name}`], { x: colW * i + 12, y: base + 56, size: 20, weight: 700, valign: 'top', fill: i === steps.length - 1 ? t.c('accent') : t.c('ink') }),
    textLines(s.lines, { x: colW * i + 12, y: base + 86, size: 17, lineHeight: 1.35, valign: 'top', fill: t.c('ink') })));
  // The time track: each step's real interval, numbered like its column; instants are dots.
  const track = steps.map((s, i) => {
    const a = x(s.from), b = x(s.to), last = i === steps.length - 1, instant = b - a < 12;
    const mark = instant
      ? el('circle', { cx: a, cy: axisY - 7, r: last ? 8 : 6, fill: last ? t.c('accent') : t.c('ink') })
      : el('rect', { x: a + 1.5, y: axisY - 13, width: b - a - 3, height: 13, fill: t.c('ink') });
    return g({}, mark, textLines([String(i + 1)], { x: (a + b) / 2, y: axisY - 24, size: 16, anchor: 'middle', fill: last ? t.c('accent') : t.c('ink'), weight: 700 }));
  });
  const ticks = [0, 30, 60, 90, 120].map(v => g({},
    el('line', { x1: x(v), x2: x(v), y1: axisY, y2: axisY + 6, stroke: t.c('ink') }),
    textLines([v === limit ? `${v} min after the draw` : String(v)], { x: x(v), y: axisY + 12, size: 16, anchor: v === limit ? 'end' : 'middle', valign: 'top', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } })));
  const dimY = axisY - 62;
  return svgRoot({ id: 'composition-methods-figure-fig', width: W, height: H, theme: t,
    title: 'Plasma handling: five steps from blood draw to freezer, on a minutes axis',
    desc: `Tube T1 is drawn, rests upright for up to 30 minutes, is centrifuged at 1,500 g for 10 minutes, split into ${aliquots.plasma.length} plasma aliquots and one buffy-coat vial, and frozen at −80 °C ${frozenAt} minutes after the draw, ${spare} minutes inside the ${limit}-minute limit.` },
  objects, text,
  el('line', { x1: x(0), x2: x(limit), y1: axisY, y2: axisY, stroke: t.c('ink'), 'stroke-width': 1.4 }),
  track, ticks,
  el('line', { x1: x(limit), x2: x(limit), y1: dimY - 26, y2: axisY, stroke: t.c('ink'), 'stroke-width': 1.4, 'stroke-dasharray': '4 4' }),
  textLines([`Limit: frozen within ${limit} min`], { x: x(limit) - 10, y: dimY - 18, size: 16, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: 600 }),
  el('path', { d: `M${x(frozenAt)} ${dimY - 6}V${dimY + 6}M${x(frozenAt)} ${dimY}H${x(limit)}`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 1.4 }),
  textLines([`${spare} min to spare`], { x: (x(frozenAt) + x(limit)) / 2, y: dimY - 8, size: 16, anchor: 'middle', fill: t.c('accent'), weight: 600 }));
}

export default {
  study: true,
  id: 'composition-methods-figure',
  title: 'Methods figure: a sample’s path in order, mapped onto true time',
  className: 'st st--tall cs-clinical-trial cmp-methods',
  notes: 'Purpose: Show a technical procedure (a sample-handling protocol, an assay, a build pipeline) so it can be read in the order it happens and checked against its time limits, with the object’s identity and quantities visible at every step.\nModify: Replace `steps` (name, start and end in minutes, the object state and two short lines of conditions) and the object dimensions. Columns stay evenly spaced for reading; the numbered bars recompute on the true time axis. Draw the object to scale in each state; label quantities on the drawing (volumes, layers) rather than in a legend.\nInvariant: One sequence, numbered, left to right; units on every quantity; the same object (T1 and its vials P1–P4, B1) carries through; no pictograms; the time axis is true, so long waits look long; the accent marks only the step and the margin the headline is about.\nStatic: Already static. A build could add the time axis after the steps, but the final page must show both.',
  sources: [{ type: 'original-example', file: 'assets/compositions/methods-figure.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Plasma reaches −80 °C <em>${frozenAt} minutes</em> after the draw, with ${spare} minutes to spare</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative protocol · plasma biomarker sub-study, handling manual v3</span><span>Methods figure on a true time axis</span></p>`,
};
