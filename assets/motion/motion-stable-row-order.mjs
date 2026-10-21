// Motion study · Reorder rows while preserving row identity — re-sorting a table by another
// column. Each row is one opaque group that travels on a curved lane: rows moving up take the
// left lane and pass in front, rows moving down take the right lane and pass behind, so names
// never cross each other. Lanes are rotations about computed centres (counter-rotated upright).
import { svgRoot, el, g, linear, textLines, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const hospitals = [ // hip-fracture patients, 2025: surgery within 36 h of arrival (%) and 30-day mortality (%) (illustrative)
  { name: 'Ashworth General', within36: 64, mortality: 7.1 },
  { name: 'Bramley Royal', within36: 81, mortality: 5.6 },
  { name: 'Calder Valley', within36: 72, mortality: 6.6 },
  { name: 'Dunmore', within36: 58, mortality: 8.4 },
  { name: 'Elmstead', within36: 88, mortality: 4.7 },
  { name: 'Fairhaven', within36: 69, mortality: 7.4 },
  { name: 'Glenbrook', within36: 77, mortality: 6.1 },
  { name: 'Holloway', within36: 91, mortality: 5.0 },
];
const byName = [...hospitals].sort((a, b) => a.name.localeCompare(b.name));
const bySpeed = [...hospitals].sort((a, b) => b.within36 - a.within36);
const byMortality = [...hospitals].sort((a, b) => a.mortality - b.mortality);
// the largest k (up to half the table) for which the k fastest are exactly the k lowest-mortality hospitals
const same = k => bySpeed.slice(0, k).every(h => byMortality.slice(0, k).includes(h));
const k = [...Array(Math.floor(hospitals.length / 2)).keys()].map(i => i + 1).filter(same).at(-1) || 0;
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six'];

/** Arc lane from p to q bulging by `s` towards unit normal n: rotation centre and signed angle (deg, clockwise +). */
function lane(p, q, n, s) {
  const L = Math.hypot(q[0] - p[0], q[1] - p[1]), R = (s * s + (L / 2) ** 2) / (2 * s);
  const c = [(p[0] + q[0]) / 2 - n[0] * (R - s), (p[1] + q[1]) / 2 - n[1] * (R - s)];
  const u = [p[0] - c[0], p[1] - c[1]], v = [q[0] - c[0], q[1] - c[1]];
  return { c, deg: (Math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1]) * 180) / Math.PI };
}

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, m = { t: 62, b: 4 };
  const rowH = (H - m.t - m.b) / hospitals.length, bh = 18;
  const nameX = 18, sx0 = 290, sx = linear([0, 100], [sx0, sx0 + 330]), mx0 = 760, mx = linear([0, 10], [mx0, mx0 + 280]);
  const rowTop = i => m.t + i * rowH;
  const dur = 1100;
  const rows = byName.map(h => {
    const i0 = byName.indexOf(h), i1 = bySpeed.indexOf(h), dy = (i1 - i0) * rowH;
    return { h, i0, i1, dy, top: i1 < i0 ? 2 : i1 === i0 ? 1 : 0 };
  }).sort((a, b) => a.top - b.top); // paint order: rows moving down, still rows, rows moving up (in front)
  const fast = new Set(bySpeed.slice(0, k));
  return svgRoot({ id: 'motion-stable-row-order-fig', width: W, height: H, theme: t,
    title: 'Hip-fracture care by hospital: share operated on within 36 hours and 30-day mortality, first by name, then sorted by speed to surgery',
    desc: `Sorted by the share operated on within 36 hours, the ${words[k]} fastest hospitals (${bySpeed.slice(0, k).map(h => h.name).join(', ')}) are also the ${words[k]} with the lowest 30-day mortality. An association across ${hospitals.length} hospitals, not a measured effect.` },
  // column heads; the sort indicator changes, the columns do not
  textLines(['Hospital'], { x: nameX, y: 22, size: 16, fill: t.c('muted'), weight: 650 }),
  textLines(['Operated on within 36 h'], { x: sx0, y: 22, size: 16, fill: t.c('muted'), weight: 650, attrs: { 'data-step': 0, 'data-until': 0 } }),
  textLines(['Operated on within 36 h'], { x: sx0, y: 22, size: 16, fill: t.c('ink'), weight: 700, attrs: { 'data-step': 1, 'data-motion': 'reveal' } }),
  textLines(['Died within 30 days'], { x: mx0, y: 22, size: 16, fill: t.c('muted'), weight: 650 }),
  textLines(['sorted by name'], { x: nameX, y: 44, size: 15, fill: t.c('muted'), attrs: { 'data-step': 0, 'data-until': 0 } }),
  textLines(['sorted, highest first'], { x: sx0, y: 44, size: 15, fill: t.c('ink'), attrs: { 'data-step': 1, 'data-motion': 'reveal' } }),
  hospitals.map((_, i) => (i ? el('line', { x1: 0, x2: W, y1: rowTop(i), y2: rowTop(i), stroke: t.c('grid') }) : '')),
  rows.map(({ h, i0, dy, top }) => {
    const cy = rowTop(i0) + rowH / 2, p = [nameX, cy];
    const row = g({},
      el('rect', { x: 0, y: rowTop(i0) + 2, width: W, height: rowH - 4, fill: t.c('paper') }), // opaque: rows occlude, never interleave
      textLines([h.name], { x: nameX, y: cy, size: 18, valign: 'middle', fill: t.c('ink') }),
      el('rect', { x: sx0, y: cy - bh / 2, width: sx(h.within36) - sx0, height: bh, rx: 2, fill: t.c('ink') }),
      textLines([`${h.within36}%`], { x: sx(h.within36) + 8, y: cy, size: 17, valign: 'middle', fill: t.c('ink'), weight: 650 }),
      el('rect', { x: mx0, y: cy - bh / 2, width: mx(h.mortality) - mx0, height: bh, rx: 2,
        'data-states': { 0: { fill: t.c('context') }, 2: { fill: fast.has(h) ? t.c('accent') : t.c('context') } }, 'data-duration': 600 }),
      textLines([`${fmt(h.mortality, { digits: 1 })}%`], { x: mx(h.mortality) + 8, y: cy, size: 17, valign: 'middle', fill: t.c('ink'), weight: 650 }));
    if (!dy) return row;
    const { c, deg } = lane(p, [p[0], p[1] + dy], [dy < 0 ? -1 : 1, 0], Math.min(16 + Math.abs(dy) * 0.12, Math.abs(dy) * 0.45));
    return g({ 'data-states': { 0: { rotate: '0deg' }, 1: { rotate: `${deg.toFixed(3)}deg` } }, 'data-duration': dur, 'data-easing': 'smooth', style: `transform-box:view-box;transform-origin:${c[0].toFixed(2)}px ${c[1].toFixed(2)}px` },
      g({ 'data-states': { 0: { rotate: '0deg' }, 1: { rotate: `${(-deg).toFixed(3)}deg` } }, 'data-duration': dur, 'data-easing': 'smooth', style: `transform-box:view-box;transform-origin:${p[0]}px ${p[1].toFixed(2)}px` }, row));
  }),
  // build 2: the pattern the new order reveals
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 300 },
    el('path', { d: `M${W - 24} ${rowTop(0) + 8}h8V${rowTop(k) - 8}h-8`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 2 }),
    textLines([`${words[k][0].toUpperCase() + words[k].slice(1)} lowest`, 'death rates'], { x: W - 30, y: (rowTop(0) + rowTop(k)) / 2, size: 16, weight: 700, anchor: 'end', valign: 'middle', fill: t.c('accent'), lineHeight: 1.25 })));
}

export default {
  study: true,
  id: 'motion-stable-row-order',
  title: 'Stable row order: re-sort a table without losing the rows',
  className: 'st cs-clinical-trial',
  notes: 'Purpose: Re-sort a table by another column so the audience can follow every row to its new place and see the pattern the new order reveals.\nModify: Replace `hospitals`; the sort, each row’s lane (centre and angle), the k-fastest/k-lowest test and the headline recompute. Sort ties keep the previous order.\nInvariant: Each row is one opaque group that moves as a unit and stays upright; rows moving up travel on the left lane in front, rows moving down on the right lane behind, so names never interleave; columns and scales do not change.\nStatic: The final build shows the sorted table, the highlighted mortality bars and the bracket. Export build 0 as a page if the alphabetical order is itself needed.',
  sources: [{ type: 'original-example', file: 'assets/motion/motion-stable-row-order.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Sorted by speed to surgery, the ${words[k]} fastest hospitals also have the <em>${words[k]} lowest death rates</em></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · hip-fracture admissions aged 60 and over, 2025; association, not a measured effect</span><span>Motion · table re-sort on separate lanes (2 builds)</span></p>`,
};
