// Composition study · Split claim — an asymmetric page: a narrow column (5 of 12) states and argues
// the claim in sentences; the wider column (7 of 12) shows the evidence. Text and chart start on
// the same top line. Shares, the headline numbers and the slopes are computed from `sizes`.
import { svgRoot, el, textLines, linear, spreadLabels, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const ID = 'composition-split-claim';
// A transit survey of Sun-like stars, planets on orbits shorter than 100 days (illustrative).
// detected = planets found; perHundred = estimated planets per 100 stars after correcting for
// the chance that a planet of that size transits and is detected.
const sizes = [
  { name: 'Earth-size', radius: '0.8–1.25', detected: 180, perHundred: 15.0 },
  { name: 'Super-Earth', radius: '1.25–2', detected: 540, perHundred: 23.0 },
  { name: 'Sub-Neptune', radius: '2–4', detected: 1120, perHundred: 27.0 },
  { name: 'Neptune-size', radius: '4–8', detected: 210, perHundred: 4.5 },
  { name: 'Giant', radius: '8–22', detected: 610, perHundred: 1.6 },
];
const focus = 'Giant';

// derived values: shares of what we detect and of what is there
const totalDet = sizes.reduce((s, c) => s + c.detected, 0), totalOcc = sizes.reduce((s, c) => s + c.perHundred, 0);
const rows = sizes.map(c => ({ ...c, a: (c.detected / totalDet) * 100, b: (c.perHundred / totalOcc) * 100 }));
const f = rows.find(r => r.name === focus), small = rows[0];
const p0 = v => `${fmt(v, { digits: 0 })}%`;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 662, H = 560;
  const xa = 206, xb = W - 196, top = 66, bottom = H - 30;
  const y = linear([0, 45], [bottom, top]);
  const parts = [];
  parts.push(textLines(['Share of planets', 'we detect'], { x: xa, y: 0, size: 17, anchor: 'middle', valign: 'top', lineHeight: 1.25, fill: t.c('muted'), weight: 600 }));
  parts.push(textLines(['Share of planets', 'that exist'], { x: xb, y: 0, size: 17, anchor: 'middle', valign: 'top', lineHeight: 1.25, fill: t.c('muted'), weight: 600 }));
  parts.push(el('line', { x1: xa, x2: xa, y1: top - 10, y2: bottom, stroke: t.c('rule'), 'stroke-width': 1.5 }));
  parts.push(el('line', { x1: xb, x2: xb, y1: top - 10, y2: bottom, stroke: t.c('rule'), 'stroke-width': 1.5 }));
  const hl = r => r.name === focus;
  const order = [...rows].sort((p, q) => Number(hl(p)) - Number(hl(q))); // the focus line is drawn last
  for (const r of order) {
    const c = hl(r) ? t.c('accent') : t.c('context');
    parts.push(el('line', { x1: xa, y1: y(r.a), x2: xb, y2: y(r.b), stroke: c, 'stroke-width': hl(r) ? 4 : 2.5, 'stroke-linecap': 'round' }));
    parts.push(el('circle', { cx: xa, cy: y(r.a), r: hl(r) ? 7 : 5, fill: c }));
    parts.push(el('circle', { cx: xb, cy: y(r.b), r: hl(r) ? 7 : 5, fill: c }));
  }
  // labels on both ends, spread so none collide
  const L = spreadLabels(rows.map((r, i) => ({ id: i, y: y(r.a), h: 40 })), { min: top - 4, max: bottom + 16, gap: 4 });
  const R = spreadLabels(rows.map((r, i) => ({ id: i, y: y(r.b), h: 40 })), { min: top - 4, max: bottom + 16, gap: 4 });
  rows.forEach((r, i) => {
    const fill = hl(r) ? t.c('accent') : t.c('ink'), w = hl(r) ? 700 : 600;
    const ly = L.find(q => q.id === i).y, ry = R.find(q => q.id === i).y;
    parts.push(textLines([`${r.name}  ${p0(r.a)}`], { x: xa - 16, y: ly - 9, size: 17, anchor: 'end', valign: 'middle', fill, weight: w, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
    parts.push(textLines([`${r.radius} × Earth radius`], { x: xa - 16, y: ly + 12, size: 15, anchor: 'end', valign: 'middle', fill: t.c('muted') }));
    parts.push(textLines([`${p0(r.b)}  ${r.name}`], { x: xb + 16, y: ry - 9, size: 17, valign: 'middle', fill, weight: w, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
    parts.push(textLines([`${fmt(r.perHundred, { digits: 1 })} per 100 stars`], { x: xb + 16, y: ry + 12, size: 15, valign: 'middle', fill: t.c('muted') }));
  });
  return svgRoot({ id: `${ID}-fig`, width: W, height: H, theme: t,
    title: 'Share of detected planets and share of all planets, by planet size',
    desc: `${rows.map(r => `${r.name}: ${p0(r.a)} of detections, ${p0(r.b)} of planets`).join('; ')}. Giants fall from ${p0(f.a)} to ${p0(f.b)}; Earth-size planets rise from ${p0(small.a)} to ${p0(small.b)}.` },
  parts);
}

export default {
  study: true,
  id: ID,
  title: 'Split claim: a narrow argued column beside a wider evidence column',
  className: 'st cs-astronomy-night cmp-split',
  notes: 'Purpose: Use when the claim needs two or three sentences of argument (a correction, a reversal, a mechanism) and one exhibit proves it. The narrow column (cols 1–5) states and argues; the wider column (cols 6–12) shows. The asymmetry tells the reader which side is the proof.\nModify: Replace `sizes` (two measures of the same categories) and `focus`; the shares, the slopes, the labels and the numbers in the headline recompute. Rewrite the two paragraphs for your mechanism; keep each under four lines.\nInvariant: 5 : 7 split on the 12-column grid with one empty column between; text and evidence share a top line; the headline lives in the text column, not across the page; the colored phrase in the headline names the one accented line.\nStatic: Already static.',
  sources: [{ type: 'original-example', file: `assets/compositions/${ID}.mjs` }],
  exportPolicy: 'final',
  content: `<h1 class="cmp-sc-head" data-region="title"><em>Giant planets</em> are ${p0(f.a)} of our detections but only ${p0(f.b)} of planets</h1>
<div class="cmp-sc-text" data-region="support">
  <p>A transit is the shadow a planet casts on its star. A giant dims its star by about one per cent and is almost never missed; an Earth&#8209;size planet dims it a hundred times less, and most go unseen.</p>
  <p>Corrected for the planets each size class hides, the order reverses: Earth&#8209;size planets go from ${p0(small.a)} of detections to ${p0(small.b)} of planets.</p>
</div>
<figure class="cmp-sc-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative survey · ${fmt(totalDet)} planets around Sun-like stars, orbits under 100 days; corrected by injection–recovery tests</span><span>Split claim · slope chart</span></p>`,
};
