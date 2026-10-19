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
  const t = makeTheme(themeArg), W = 1152, H = 474, px = 1.3;      // drawing scale: 1.3 px per mm
  const colW = W / steps.length, base = 168;                          // objects stand on this line
  const axisY = 420, x = linear([0, limit], [10, W - 12]);
  const tubeAt = (cx, kind) => {
    const w = tube.mm[0] * px, h = tube.mm[1] * px, cap = 20, x0 = cx - w / 2, top = base - h, r = w / 2;
    const body = `M${x0} ${top + cap}V${base - r}A${r} ${r} 0 0 0 ${x0 + w} ${base - r}V${top + cap}`;
    const liquidTop = base - (h - cap) * 0.78;                        // 10 mL fills about 78% of the body
    const clip = `composition-methods-figure-clip-${Math.round(cx)}`;
    const layers = kind === 'blood'
      ? [el('rect', { x: x0, y: liquidTop, width: w, height: base - liquidTop, fill: t.c('muted') })]
      : (() => { const H2 = base - liquidTop, cells = H2 * (1 - tube.plasmaShare), buffy = 4;
        return [el('rect', { x: x0, y: liquidTop, width: w, height: H2, fill: t.c('surface') }),
          el('rect', { x: x0, y: base - cells, width: w, height: cells, fill: t.c('muted') }),
          el('rect', { x: x0, y: base - cells - buffy, width: w, height: buffy, fill: t.c('paper'), stroke: t.c('rule'), 'stroke-width': 0.8 })]; })();
    return g({},
      el('defs', {}, el('clipPath', { id: clip }, el('path', { d: body + 'Z' }))),
      g({ 'clip-path': `url(#${clip})` }, layers),
      el('path', { d: body, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.6 }),
      el('rect', { x: x0 - 2, y: top, width: w + 4, height: cap, rx: 2, fill: t.c('ink') }),
      textLines(['T1'], { x: x0 + w + 10, y: top + cap + 4, size: 16, valign: 'top', fill: t.c('muted') }),
      kind === 'layers' ? g({},
        textLines([`plasma ≈ ${fmt(plasmaMl, { digits: 1 })} mL`], { x: x0 + w + 10, y: liquidTop + 16, size: 16, valign: 'top', fill: t.c('ink') }),
        textLines(['buffy coat'], { x: x0 + w + 10, y: base - (base - liquidTop) * (1 - tube.plasmaShare) - 2, size: 16, valign: 'middle', fill: t.c('ink') }),
        textLines(['red cells'], { x: x0 + w + 10, y: base - 12, size: 16, valign: 'bottom', fill: t.c('ink') })) : '');
  };
  const vialAt = (cx, label, fillShare, light) => {
    const w = vial.mm[0] * px, h = vial.mm[1] * px, cap = 12, x0 = cx - w / 2, top = base - h, r = 4;
    const fillTop = base - (h - cap) * fillShare;
    return g({},
      el('rect', { x: x0, y: fillTop, width: w, height: base - fillTop, rx: r, fill: light ? t.c('surface') : t.c('muted') }),
      el('rect', { x: x0, y: top + cap, width: w, height: h - cap, rx: r, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.4 }),
      el('rect', { x: x0 - 1.5, y: top, width: w + 3, height: cap, rx: 2, fill: t.c('ink') }),
      textLines([label], { x: cx, y: base + 8, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') }));
  };
  const vials = (cx) => {
    const ids = [...aliquots.plasma, aliquots.buffy], gap = 26, x0 = cx - ((ids.length - 1) * gap) / 2;
    return ids.map((id, k) => vialAt(x0 + k * gap, id, id === aliquots.buffy ? 0.18 : aliquots.plasmaMl / vial.ml, id !== aliquots.buffy));
  };
  const objects = steps.map((s, i) => {
    const cx = colW * i + colW / 2 - (s.object === 'layers' ? 34 : 0);
    if (s.object === 'blood' || s.object === 'layers') return tubeAt(cx, s.object);
    if (s.object === 'vials') return g({}, vials(cx));
    const bw = 5 * 26 + 18, bx = cx - bw / 2;                         // the freezer box holds the same five vials
    return g({}, vials(cx), el('rect', { x: bx, y: base - vial.mm[1] * px - 14, width: bw, height: vial.mm[1] * px + 40, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.4 }));
  });
  const text = steps.map((s, i) => g({},
    textLines([`${i + 1}  ${s.name}`], { x: colW * i + 12, y: base + 50, size: 20, weight: 700, valign: 'top', fill: i === steps.length - 1 ? t.c('accent') : t.c('ink') }),
    textLines(s.lines, { x: colW * i + 12, y: base + 80, size: 17, lineHeight: 1.35, valign: 'top', fill: t.c('ink') })));
  const track = steps.map((s, i) => {
    const a = x(s.from), b = x(s.to), mid = (a + b) / 2, last = i === steps.length - 1;
    return g({},
      el('line', { x1: colW * i + colW / 2, y1: base + 136, x2: mid, y2: axisY - 16, stroke: t.c('rule'), 'stroke-width': 1.2 }),
      b - a > 2 ? el('rect', { x: a, y: axisY - 12, width: b - a, height: 12, fill: t.c('ink') }) : el('circle', { cx: a, cy: axisY - 6, r: last ? 8 : 5, fill: last ? t.c('accent') : t.c('ink') }));
  });
  const ticks = [0, 30, 60, 90, 120].map(v => g({},
    el('line', { x1: x(v), x2: x(v), y1: axisY, y2: axisY + 6, stroke: t.c('ink') }),
    textLines([v === limit ? `${v} min` : String(v)], { x: x(v), y: axisY + 12, size: 16, anchor: v === limit ? 'end' : 'middle', valign: 'top', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } })));
  const dimY = axisY - 40;
  return svgRoot({ id: 'composition-methods-figure-fig', width: W, height: H, theme: t,
    title: 'Plasma handling: five steps from blood draw to freezer, on a minutes axis',
    desc: `Tube T1 is drawn, rests upright for up to 30 minutes, is centrifuged at 1,500 g for 10 minutes, split into ${aliquots.plasma.length} plasma aliquots and one buffy-coat vial, and frozen at −80 °C ${frozenAt} minutes after the draw, ${spare} minutes inside the ${limit}-minute limit.` },
  objects, text, track,
  el('line', { x1: x(0), x2: x(limit), y1: axisY, y2: axisY, stroke: t.c('ink'), 'stroke-width': 1.4 }),
  ticks,
  el('line', { x1: x(limit), x2: x(limit), y1: dimY - 22, y2: axisY, stroke: t.c('ink'), 'stroke-width': 1.4, 'stroke-dasharray': '4 4' }),
  textLines([`Limit: frozen within ${limit} min of the draw`], { x: x(limit), y: dimY - 30, size: 16, anchor: 'end', fill: t.c('ink'), weight: 600 }),
  el('path', { d: `M${x(frozenAt)} ${dimY - 6}V${dimY + 6}M${x(frozenAt)} ${dimY}H${x(limit)}`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 1.4 }),
  textLines([`frozen at ${frozenAt} min, ${spare} min to spare`], { x: x(frozenAt) + 12, y: dimY - 8, size: 16, fill: t.c('accent'), weight: 600 }));
}

export default {
  study: true,
  id: 'composition-methods-figure',
  title: 'Methods figure: a sample’s path in order, mapped onto true time',
  className: 'st st--tall cs-clinical-trial cmp-methods',
  notes: 'Purpose: Show a technical procedure (a sample-handling protocol, an assay, a build pipeline) so it can be read in the order it happens and checked against its time limits, with the object’s identity and quantities visible at every step.\nModify: Replace `steps` (name, start and end in minutes, the object state and two short lines of conditions) and the object dimensions. Columns stay evenly spaced for reading; the connectors and bars recompute on the true time axis. Draw the object to scale in each state; label quantities on the drawing (volumes, layers) rather than in a legend.\nInvariant: One sequence, numbered, left to right; units on every quantity; the same object (T1 and its vials P1–P4, B1) carries through; no pictograms; the time axis is true, so long waits look long; the accent marks only the step and the margin the headline is about.\nStatic: Already static. A build could add the time axis after the steps, but the final page must show both.',
  sources: [],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Plasma reaches −80 °C <em>${frozenAt} minutes</em> after the draw, with ${spare} minutes to spare</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative protocol · plasma biomarker sub-study, handling manual v3</span><span>Methods figure on a true time axis</span></p>`,
};
