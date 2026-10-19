// Composition study · Portrait mass — a tall drawing (a peat core and the survey post beside it)
// takes the right five columns at full height; a column of type balances it on the left, its
// headline level with the 1956 surface and its last line level with the clay. Drawn from `core`.
import { svgRoot, el, g, textLines, linear, spreadLabels, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const ID = 'composition-portrait-mass';
// Hollin Moss, core HM-3 taken beside the 1956 survey post (illustrative).
const post = { set: 1956, read: 2026, exposed: 0.42 };      // m of the iron post now standing clear of the peat
const drainage = { from: 1956, to: 2009 };                    // ditches cut; ditches blocked
const layers = [ // depth below the 2026 surface, m; seq = earth tone 0 (pale) … 4 (dark)
  { top: 0.00, base: 0.09, name: 'Oxidised peat', seq: 4 },
  { top: 0.09, base: 1.64, name: 'Sphagnum peat', seq: 1 },
  { top: 1.64, base: 2.46, name: 'Sedge peat', seq: 2 },
  { top: 2.46, base: 2.94, name: 'Wood peat, birch', seq: 3 },
  { top: 2.94, base: 3.20, name: 'Grey lake clay', seq: null },
];
const dates = [ // calibrated radiocarbon ages, median calendar year (negative = BC)
  { depth: 0.31, year: 1610 }, { depth: 1.12, year: 640 }, { depth: 2.92, year: -2190 },
];

// derived values: long-term growth rate between the two upper dates, and what the loss is worth
const [d1, d2] = dates;
const mmPerYear = ((d2.depth - d1.depth) * 1000) / (d1.year - d2.year);
const lostYears = Math.round((post.exposed * 1000) / mmPerYear / 50) * 50;
const peatAge = Math.round((post.read - dates.at(-1).year) / 100) * 100;
const yearText = y => (y < 0 ? `${fmt(-y, { digits: 0 }).replace(',', '')} BC` : `AD ${y}`);
const cm = m => `${fmt(m * 100, { digits: 0 })} cm`;
const nb = text => text.replace(/(\d) (cm|mm|m|years)/g, '$1&nbsp;$2'); // keep numbers with their units in HTML text

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 368, H = 620;
  const y = linear([-post.exposed, 3.2], [34, H - 10]); // depth, m (negative = above today's surface)
  const postX = 66, coreX = 92, coreW = 104, labelX = coreX + coreW + 18;
  const parts = [];
  // left scale: the two surfaces by year, then depth below today's surface
  parts.push(textLines([`${post.set}`], { x: 0, y: y(-post.exposed), size: 16, valign: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  parts.push(textLines([`${post.read}`], { x: 0, y: y(0), size: 16, valign: 'middle', fill: t.c('ink'), weight: 650, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  for (const m of [1, 2, 3]) parts.push(textLines([`${m} m`], { x: 0, y: y(m), size: 16, valign: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  // the core, layer by layer
  for (const L of layers) {
    parts.push(el('rect', { x: coreX, y: y(L.top), width: coreW, height: y(L.base) - y(L.top), fill: L.seq == null ? t.c('context') : t.seq(L.seq) }));
  }
  parts.push(el('rect', { x: coreX, y: y(0), width: coreW, height: y(3.2) - y(0), fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.2 }));
  // the two surfaces
  parts.push(el('line', { x1: postX - 14, x2: W, y1: y(-post.exposed), y2: y(-post.exposed), stroke: t.c('muted'), 'stroke-width': 1, 'stroke-dasharray': '2 4' }));
  parts.push(el('line', { x1: postX - 14, x2: W, y1: y(0), y2: y(0), stroke: t.c('ink'), 'stroke-width': 1.4 }));
  // the peat that is gone: the 1956 surface stood level with the top of the post
  parts.push(el('rect', { x: coreX, y: y(-post.exposed), width: coreW, height: y(0) - y(-post.exposed), fill: 'none', stroke: t.c('negative'), 'stroke-width': 2, 'stroke-dasharray': '6 5' }));
  parts.push(textLines([`−${cm(post.exposed)}`], { x: coreX + coreW / 2, y: (y(-post.exposed) + y(0)) / 2, size: 21, anchor: 'middle', valign: 'middle', fill: t.c('negative'), weight: 700 }));
  parts.push(textLines(['peat lost since', `${post.set}`], { x: labelX, y: (y(-post.exposed) + y(0)) / 2, size: 16, valign: 'middle', lineHeight: 1.2, fill: t.c('negative') }));
  // the survey post: driven through the peat into the clay
  parts.push(el('rect', { x: postX - 3, y: y(-post.exposed), width: 6, height: y(3.05) - y(-post.exposed), fill: t.c('ink') }));
  parts.push(textLines([`iron survey post, set ${post.set}`], { x: postX - 3, y: y(-post.exposed) - 14, size: 16, fill: t.c('ink') }));
  // layer names and dates on the right, spread so none collide
  const items = [
    ...layers.map((L, i) => ({ id: `L${i}`, y: y((L.top + L.base) / 2), h: 22, text: L.name, kind: 'layer' })),
    ...dates.map((D, i) => ({ id: `D${i}`, y: y(D.depth), h: 20, text: yearText(D.year), kind: 'date', at: y(D.depth) })),
  ];
  const placed = spreadLabels(items, { min: y(0) + 2, max: H - 2, gap: 6 });
  for (const p of placed) {
    const it = items.find(q => q.id === p.id);
    if (it.kind === 'date') {
      parts.push(el('path', { d: `M${coreX + coreW - 10} ${it.at}H${coreX + coreW + 6}L${labelX - 4} ${p.y}`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.2 }));
      parts.push(textLines([it.text], { x: labelX, y: p.y, size: 16, valign: 'middle', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
    } else {
      parts.push(textLines([it.text], { x: labelX, y: p.y, size: 17, valign: 'middle', fill: t.c('ink'), weight: 600 }));
    }
  }
  return svgRoot({ id: `${ID}-fig`, width: W, height: H, theme: t,
    title: 'Peat core beside the 1956 survey post at Hollin Moss',
    desc: `The post, set flush with the surface in ${post.set}, now stands ${cm(post.exposed)} clear. Below today's surface: ${layers.map(L => `${L.name} to ${fmt(L.base, { digits: 2 })} m`).join(', ')}. Dated levels: ${dates.map(D => `${yearText(D.year)} at ${fmt(D.depth, { digits: 2 })} m`).join(', ')}.` },
  parts);
}

export default {
  study: true,
  id: ID,
  title: 'Portrait mass: a tall drawing balanced by a column of type',
  className: 'st cs-field-survey cmp-portrait',
  notes: `Purpose: Use when the subject is itself tall (a core, a borehole, a building section, a water column, a ranking that must not be cut) and the argument needs a few sentences. The drawing takes the right five columns at full height; the type column on the left carries the claim and how it was measured, and the two masses balance.\nModify: Replace \`post\`, \`layers\` and \`dates\`; the scale, the lost-peat outline, the labels and the derived rate (${fmt(mmPerYear, { digits: 2 })} mm a year here) recompute. Keep the text to a headline and two short paragraphs; anything longer belongs on a facing page.\nInvariant: One vertical scale for everything drawn; the drawing runs top to bottom of the content area and is never shrunk to fit beside long text; text column cols 1–6, drawing cols 8–12, one empty column between; the headline's colored phrase is the label of the one colored mark (the lost peat, in the negative color with its minus sign).\nStatic: Already static.`,
  sources: [{ type: 'original-example', file: `assets/compositions/${ID}.mjs` }],
  exportPolicy: 'final',
  content: `<h1 class="cmp-pm-head" data-region="title">${nb(`In ${drainage.to - drainage.from} years of drainage the bog lost <em>${cm(post.exposed)}</em> of peat, about ${lostYears} years of growth`)}</h1>
<div class="cmp-pm-text" data-region="support">
  <p>${nb(`In ${post.set}, as the ditches were cut, surveyors drove an iron post through the peat into the clay, its top level with the surface. Today ${cm(post.exposed)} of it stands clear. The ditches were blocked in ${drainage.to}.`)}</p>
  <p>${nb(`The core beside the post holds ${fmt(peatAge)} years of peat. At its long-term rate of ${fmt(mmPerYear, { digits: 1 })} mm a year, the missing ${cm(post.exposed)} took about ${lostYears} years to form.`)}</p>
  <p class="cmp-pm-note">The post measures shrinkage and oxidation together; the core cannot separate them.</p>
</div>
<figure class="cmp-pm-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative survey · post read in ${post.read}; ages are calibrated radiocarbon medians</span><span>Portrait mass · drawn core</span></p>`,
};
