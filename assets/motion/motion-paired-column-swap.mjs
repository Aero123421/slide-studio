// Motion study · Swap roles without losing identity — two loan formats in two role slots
// ("most borrowed", "runner-up"). Build 1 changes both values in place; build 2 swaps the
// columns: each travels on its own arc lane (rotation about a computed centre, counter-rotated
// so it stays upright) and lands aligned in the other slot. The slots never move.
import { svgRoot, el, g, linear, textLines, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const years = [2023, 2025];
const formats = [ // loans in the year, thousands, Eastmere city libraries (illustrative)
  { label: 'Print books', loans: [412, 341] },
  { label: 'E-books', loans: [268, 377] },
];
const roles = ['Most borrowed', 'Runner-up'];
const order = k => [...formats].sort((a, b) => b.loans[k] - a.loans[k]);
const lead0 = order(0)[0], lead1 = order(1)[0];
const pct = f => Math.round((f.loans[1] / f.loans[0] - 1) * 100);

/** Arc lane from p to q bulging by `s` towards unit normal n: rotation centre and signed angle (deg, clockwise +). */
function lane(p, q, n, s) {
  const L = Math.hypot(q[0] - p[0], q[1] - p[1]), R = (s * s + (L / 2) ** 2) / (2 * s);
  const c = [(p[0] + q[0]) / 2 - n[0] * (R - s), (p[1] + q[1]) / 2 - n[1] * (R - s)];
  const u = [p[0] - c[0], p[1] - c[1]], v = [q[0] - c[0], q[1] - c[1]];
  return { c, deg: (Math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1]) * 180) / Math.PI };
}

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 800, H = 470, m = { l: 64, t: 92, b: 56 };
  const y = linear([0, 450], [H - m.b, m.t]), base = y(0);
  const cw = 190, slotX = [m.l + 70, m.l + 70 + cw + 120]; // left edges of the two role slots
  const dur = 900, ease = 'smooth';
  const start = order(0); // slot of each format in the first year
  const color = f => (f === lead1 ? t.c('accent') : t.c('ink'));
  const scaleY = (from, to) => { const a = (base - y(to)) / (base - y(from)); return `matrix(1,0,0,${a.toFixed(5)},0,${(base * (1 - a)).toFixed(2)})`; };
  const groups = start.map((f, j) => {
    const x0 = slotX[j], target = order(1).indexOf(f), moves = target !== j;
    const column = g({},
      el('rect', { x: x0, y: y(f.loans[0]), width: cw, height: base - y(f.loans[0]), fill: color(f),
        'data-states': { 0: { transform: scaleY(f.loans[0], f.loans[0]) }, 1: { transform: scaleY(f.loans[0], f.loans[1]) } }, 'data-duration': dur, 'data-easing': ease,
        style: 'transform-box:view-box;transform-origin:0 0' }),
      el('line', { x1: x0, x2: x0 + cw, y1: y(f.loans[0]), y2: y(f.loans[0]), stroke: t.c('paper'), 'stroke-width': 2, 'stroke-dasharray': '6 4', 'data-step': 1, 'data-motion': 'reveal', 'data-delay': dur - 200 }),
      textLines([`${years[0]}: ${f.loans[0]}k`], { x: x0 + 10, y: y(f.loans[0]) - 8, size: 15, weight: 600, fill: f.loans[1] > f.loans[0] ? t.c('paper') : t.c('muted'),
        attrs: { 'data-step': 1, 'data-motion': 'reveal', 'data-delay': dur - 200 } }),
      g({ 'data-states': { 0: { translate: '0px 0px' }, 1: { translate: `0px ${(y(f.loans[1]) - y(f.loans[0])).toFixed(1)}px` } }, 'data-duration': dur, 'data-easing': ease, style: 'transform-box:view-box' },
        textLines([`${f.loans[0]}k`], { x: x0 + cw / 2, y: y(f.loans[0]) - 12, size: 34, weight: 700, anchor: 'middle', fill: color(f), attrs: { 'data-step': 0, 'data-until': 0, 'font-variant-numeric': 'tabular-nums' } }),
        textLines([`${f.loans[1]}k`], { x: x0 + cw / 2, y: y(f.loans[0]) - 12, size: 34, weight: 700, anchor: 'middle', fill: color(f),
          attrs: { 'data-step': 1, 'data-motion': 'count', 'data-count-from': f.loans[0], 'data-duration': dur, 'font-variant-numeric': 'tabular-nums' } })),
      textLines([f.label], { x: x0 + cw / 2, y: base + 12, size: 20, weight: 700, anchor: 'middle', valign: 'top', fill: color(f) }));
    if (!moves) return { f, el: column };
    // the format moving into the lead takes the upper lane; the other takes the lower lane
    const p = [x0, base], q = [slotX[target], base], up = target < j;
    const { c, deg } = lane(p, q, [0, up ? -1 : 1], up ? 70 : 30);
    return { f, up, el: g({ 'data-states': { 0: { rotate: '0deg' }, 2: { rotate: `${deg.toFixed(3)}deg` } }, 'data-duration': dur, 'data-easing': ease, style: `transform-box:view-box;transform-origin:${c[0].toFixed(2)}px ${c[1].toFixed(2)}px` },
      g({ 'data-states': { 0: { rotate: '0deg' }, 2: { rotate: `${(-deg).toFixed(3)}deg` } }, 'data-duration': dur, 'data-easing': ease, style: `transform-box:view-box;transform-origin:${p[0]}px ${p[1]}px` }, column)) };
  });
  return svgRoot({ id: 'motion-paired-column-swap-fig', width: W, height: H, theme: t,
    title: `Library loans by format, thousands, ${years.join(' and ')}, in role order`,
    desc: `${years[0]}: ${formats.map(f => `${f.label} ${f.loans[0]}k`).join(', ')}. ${years[1]}: ${formats.map(f => `${f.label} ${f.loans[1]}k`).join(', ')}. ${lead1.label} moved into the most-borrowed slot.` },
  [0, 100, 200, 300, 400].map(v => g({},
    el('line', { x1: m.l, x2: W - 10, y1: y(v), y2: y(v), stroke: v ? t.c('grid') : t.c('ink'), 'stroke-width': v ? 1 : 1.6 }),
    textLines([v ? `${v}k` : '0'], { x: m.l - 10, y: y(v), size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted') }))),
  // the roles are fixed slots; formats move between them
  roles.map((r, j) => textLines([r], { x: slotX[j] + cw / 2, y: 26, size: 18, weight: 650, anchor: 'middle', fill: t.c('muted') })),
  textLines(['Loans, thousands'], { x: m.l - 52, y: 60, size: 16, fill: t.c('muted') }),
  years.map((yr, k) => textLines([String(yr)], { x: W - 10, y: 6, size: 30, weight: 700, anchor: 'end', valign: 'top', fill: t.c('ink'),
    attrs: { 'data-step': k, 'data-until': k < years.length - 1 ? k : null, 'data-motion': k ? 'reveal' : null } })),
  groups.sort((a, b) => Number(!!a.up) - Number(!!b.up)).map(x => x.el)); // the column on the upper lane passes in front
}

export default {
  study: true,
  id: 'motion-paired-column-swap',
  title: 'Paired column swap: formats change places, roles stay put',
  className: 'st st--rail cs-culture-gallery',
  notes: 'Purpose: When two items exchange roles (leader and runner-up), change their values first, then move each item into its new slot on its own lane, so identity is never in doubt.\nModify: Replace `formats` (one value per year) and `roles`; scales, counted labels, ghost ticks, lanes and the headline recompute.\nInvariant: Roles are fixed slots that never move; each column (bar, value, name) moves as one upright group; the column taking the lead uses the upper lane and passes in front, the other the lower lane; values change before positions do.\nStatic: The final build shows both columns in their new slots with 2023 ticks and the rail changes.',
  sources: [{ type: 'original-example', file: 'assets/motion/motion-paired-column-swap.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head"><em>${lead1.label}</em> overtook ${lead0.label.toLowerCase()} as the libraries’ most-borrowed format in ${years[1]}</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  ${[lead1, lead0].map((f, k) => `${k ? '<hr class="st-rule">' : ''}<div class="st-kpi" data-step="1" data-motion="reveal" data-delay="${600 + k * 300}"><b${f === lead1 ? ' class="st-accent"' : ''}>${fmt(pct(f), { sign: true })}%</b><span>${f.label} loans, ${years[0]} to ${years[1]}: ${f.loans[0]}k to ${f.loans[1]}k.</span></div>`).join('\n  ')}
</div>
<p class="st-source" data-region="source"><span>Illustrative data · loans recorded by the library management system, calendar years</span><span>Motion · values change, then columns swap on separate lanes (2 builds)</span></p>`,
};
