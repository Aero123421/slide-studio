// Diagram study · Microscopy callout — a boxed region of a field shown enlarged beside it, linked corner to
// corner, each with its own scale bar. Both panels draw the same simulated cell positions (µm), so the detail
// is the boxed region and nothing else; the counts in the headline are taken from the same cells.
import { svgRoot, el, g, textLines, rng, theme as makeTheme, fmt } from '../runtime/figure.mjs';

// Simulated scratch-wound assay, 12 h after the scratch (illustrative, not a micrograph).
const field = { w: 1600, h: 1100 };                       // µm, 10× objective field of view
const wound = { center: y => 800 + 40 * Math.sin(y / 180), half: y => 125 + 22 * Math.sin(y / 95 + 1.3) + 12 * Math.sin(y / 37) };
const growth = { spacing: 30, jitter: 11, seed: 11, nearEdge: 150, mitosisNear: 0.17, mitosisFar: 0.035 };
// Region of interest: a 240 × 180 µm box straddling the left wound edge.
const roiSize = { w: 240, h: 180 }, roiY = 470;

// Cells: a jittered hexagonal lattice with the wound cut out; dividing cells are likelier near the edge.
const r = rng(growth.seed), cells = [];
for (let j = 0; j * growth.spacing * 0.87 < field.h; j++) for (let i = 0; i * growth.spacing < field.w; i++) {
  const x = i * growth.spacing + (j % 2 ? growth.spacing / 2 : 0) + 8 + (r() - 0.5) * 2 * growth.jitter;
  const y = j * growth.spacing * 0.87 + 8 + (r() - 0.5) * 2 * growth.jitter;
  const edge = Math.abs(x - wound.center(y)) - wound.half(y), angle = r() * 180, dividing = r() < (edge < growth.nearEdge ? growth.mitosisNear : growth.mitosisFar);
  if (x < 4 || y < 4 || x > field.w - 4 || y > field.h - 4 || edge < 0) continue;
  cells.push({ x, y, edge, angle, dividing, size: 0.85 + 0.3 * ((x * 7 + y * 13) % 10) / 10 });
}
const roi = { x: wound.center(roiY + roiSize.h / 2) - wound.half(roiY + roiSize.h / 2) - 150, y: roiY, ...roiSize };   // 150 µm of cells, 90 µm of gap
const inRoi = cells.filter(c => c.x >= roi.x && c.x <= roi.x + roi.w && c.y >= roi.y && c.y <= roi.y + roi.h);
const roiDividing = inRoi.filter(c => c.dividing).length;
const far = cells.filter(c => c.edge > 300), farRate = far.filter(c => c.dividing).length / far.length;
const ratio = roiDividing / inRoi.length / farRate;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'microscopy-callout-fig';
  const A = { x: 0, y: 56, s: 0.34 }, B = { x: 604, y: 56, s: 2.2 };   // px per µm: whole field and detail
  A.w = field.w * A.s; A.h = field.h * A.s; B.w = roi.w * B.s; B.h = roi.h * B.s;
  const ax = x => A.x + x * A.s, ay = y => A.y + y * A.s, bx = x => B.x + (x - roi.x) * B.s, by = y => B.y + (y - roi.y) * B.s;
  const R = { x: ax(roi.x), y: ay(roi.y), w: roi.w * A.s, h: roi.h * A.s };
  const bar = (x, y, um, s, label) => g({}, el('rect', { x, y: y - 3, width: um * s, height: 6, fill: t.c('ink') }), textLines([label], { x: x + (um * s) / 2, y: y - 9, size: 15, anchor: 'middle', valign: 'bottom', weight: 700, fill: t.c('ink') }));
  // Detail cells are drawn from the same list: nuclei as ellipses, dividing cells as paired condensed chromatin.
  const nucleus = c => {
    const cx = bx(c.x), cy = by(c.y), rx = 7.5 * c.size * B.s, ry = 4.8 * c.size * B.s, rot = `rotate(${c.angle.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})`;
    if (!c.dividing) return el('ellipse', { cx, cy, rx, ry, transform: rot });
    return g({ transform: rot, fill: t.c('accent') }, el('ellipse', { cx: cx - rx * 0.55, cy, rx: rx * 0.32, ry: ry * 0.8 }), el('ellipse', { cx: cx + rx * 0.55, cy, rx: rx * 0.32, ry: ry * 0.8 }));
  };
  const near = cells.filter(c => c.x >= roi.x - 12 && c.x <= roi.x + roi.w + 12 && c.y >= roi.y - 12 && c.y <= roi.y + roi.h + 12);
  // Circle one dividing cell whose path toward the gap is clear of other nuclei (lowest such cell, nearest the count).
  const clear = c => !near.some(o => o !== c && o.x > c.x && Math.abs(o.y - c.y) < 16);
  const target = inRoi.filter(c => c.dividing && clear(c)).sort((p, q) => q.y - p.y)[0];
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Scratch-wound field with an enlarged detail of the wound edge',
    desc: `Left: simulated 1.6 × 1.1 mm field, 12 h after the scratch, ${cells.length} nuclei, with a ${roi.w} × ${roi.h} µm box at the left wound edge. Right: the same box enlarged ${fmt(B.s / A.s, { digits: 1 })} times, linked corner to corner. ${roiDividing} of ${inRoi.length} cells in the box are dividing (${fmt((roiDividing / inRoi.length) * 100, { digits: 0 })}%), against ${fmt(farRate * 100, { digits: 1 })}% more than 300 µm from the edge. Scale bars: 200 µm and 50 µm.` },
  el('defs', {}, el('clipPath', { id: `${id}-clip` }, el('rect', { x: B.x, y: B.y, width: B.w, height: B.h }))),
  // whole field
  textLines(['Whole field, 10× objective'], { x: A.x, y: 0, size: 16, valign: 'top', weight: 700, fill: t.c('ink') }),
  textLines([`${fmt(field.w / 1000, { digits: 1 })} × ${fmt(field.h / 1000, { digits: 1 })} mm, 12 h after the scratch`], { x: A.x, y: 24, size: 15, valign: 'top', fill: t.c('muted') }),
  el('rect', { x: A.x, y: A.y, width: A.w, height: A.h, fill: t.c('surface') }),
  g({ fill: t.seq(3) }, cells.filter(c => !c.dividing).map(c => el('circle', { cx: ax(c.x), cy: ay(c.y), r: 2.3 }))),
  g({ fill: t.c('accent') }, cells.filter(c => c.dividing).map(c => el('circle', { cx: ax(c.x), cy: ay(c.y), r: 2.6 }))),
  textLines(['Wound gap'], { x: ax(wound.center(80)), y: ay(80), size: 15, anchor: 'middle', valign: 'middle', fill: t.c('ink'), weight: 600 }),
  bar(A.x + 18, A.y + A.h - 16, 200, A.s, '200 µm'),
  // the boxed region and the links to its enlargement
  el('rect', { x: R.x, y: R.y, width: R.w, height: R.h, fill: 'none', stroke: t.c('ink'), 'stroke-width': 2 }),
  el('path', { d: `M${R.x + R.w} ${R.y}L${B.x} ${B.y}M${R.x + R.w} ${R.y + R.h}L${B.x} ${B.y + B.h}`, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.2 }),
  // detail
  textLines([`Boxed region, enlarged ${fmt(B.s / A.s, { digits: 1 })}×`], { x: B.x, y: 0, size: 16, valign: 'top', weight: 700, fill: t.c('ink') }),
  textLines([`${roi.w} × ${roi.h} µm at the left wound edge: the same cells`], { x: B.x, y: 24, size: 15, valign: 'top', fill: t.c('muted') }),
  el('rect', { x: B.x, y: B.y, width: B.w, height: B.h, fill: t.c('surface') }),
  g({ 'clip-path': `url(#${id}-clip)` }, g({ fill: t.seq(3), stroke: t.seq(4), 'stroke-width': 1 }, near.map(nucleus))),
  el('rect', { x: B.x, y: B.y, width: B.w, height: B.h, fill: 'none', stroke: t.c('ink'), 'stroke-width': 2 }),
  textLines(['Wound gap'], { x: B.x + B.w - 18, y: B.y + 26, size: 15, anchor: 'end', valign: 'middle', fill: t.c('ink'), weight: 600 }),
  target ? g({},
    el('circle', { cx: bx(target.x), cy: by(target.y), r: 21, fill: 'none', stroke: t.c('accent'), 'stroke-width': 1.5 }),
    el('path', { d: `M${bx(target.x) + 21} ${by(target.y)}H${B.x + B.w - 20}V${B.y + B.h - 96}H${B.x + B.w - 30}`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 1.2 })) : '',
  textLines([`${roiDividing} of ${inRoi.length}`, 'cells dividing'], { x: B.x + B.w - 36, y: B.y + B.h - 92, size: 18, anchor: 'end', valign: 'middle', weight: 700, fill: t.c('accent'), lineHeight: 1.2 }),
  textLines(['paired chromatin'], { x: B.x + B.w - 36, y: B.y + B.h - 50, size: 15, anchor: 'end', valign: 'middle', fill: t.c('accent') }),
  bar(B.x + 18, B.y + B.h - 16, 50, B.s, '50 µm'));
}

export default {
  study: true,
  id: 'microscopy-callout',
  title: 'Detail lens: a magnified region tied to its source',
  className: 'st cs-astronomy-night',
  notes: 'Purpose: Relate an enlarged detail to the exact region it comes from, with scale on both, so the audience can trust what the close-up shows.\nModify: Replace `cells` with your segmented positions (µm), and move `roiY`/`roiSize`; both panels, the link lines, the scale bars and the counts recompute. With a real micrograph, crop the same image at native pixels for the detail.\nInvariant: The box marks exactly the enlarged region; corners are linked; each panel has its own scale bar in real units; the enlargement factor is stated; image evidence is never retouched, only cropped and scaled.\nStatic: Already static. For a talk, show the field, then the box, then the detail.',
  sources: [{ type: 'original-example', file: 'assets/svg/microscopy-callout.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">At the wound edge <em>${roiDividing}&nbsp;of&nbsp;${inRoi.length}&nbsp;cells</em> are dividing, ${fmt(ratio, { digits: 0 })} times the rate in the intact monolayer</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative simulation · nuclei positions drawn from point data, not a micrograph; intact = more than 300 µm from the edge</span><span>Detail callout with scale bars</span></p>`,
};
