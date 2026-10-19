// Motion study · Expand a selected panel — six light curves share one scale; build 1 promotes
// one panel to full size while the other five shrink to labelled thumbnails (same elements,
// new transforms); build 2 annotates the promoted panel. Curves are generated from parameters.
import { svgRoot, el, g, textLines, measureText, linear, rng, theme as makeTheme, fmt } from '../runtime/figure.mjs';

// Candidate stars, 30 nights of hourly photometry (illustrative). Flux in % from the median.
const stars = [
  { id: 'KX-08', noise: 0.11 },
  { id: 'KX-11', noise: 0.1, spots: { amp: 0.45, period: 9.1 } },
  { id: 'KX-14', noise: 0.1, transit: { depth: 1.2, period: 3.4, dur: 0.17, t0: 2.1 } },
  { id: 'KX-17', noise: 0.26 },
  { id: 'KX-21', noise: 0.1, flare: { at: 17.2, peak: 1.5 } },
  { id: 'KX-26', noise: 0.1, trend: -0.022 },
];
const days = 30, perDay = 24, focus = 'KX-14';
const curve = s => {
  const r = rng(s.id);
  return Array.from({ length: days * perDay }, (_, i) => {
    const tt = i / perDay, gauss = (r() + r() + r() - 1.5) * 1.15;
    let f = gauss * s.noise;
    if (s.spots) f += s.spots.amp * Math.sin((2 * Math.PI * tt) / s.spots.period);
    if (s.trend) f += s.trend * (tt - days / 2);
    if (s.flare && tt >= s.flare.at) f += s.flare.peak * Math.exp(-(tt - s.flare.at) / 0.35);
    if (s.transit && ((tt - s.transit.t0) % s.transit.period + s.transit.period) % s.transit.period < s.transit.dur) f -= s.transit.depth;
    return [tt, f];
  });
};
const target = stars.find(s => s.id === focus), tr = target.transit;
const transits = Array.from({ length: 20 }, (_, k) => tr.t0 + k * tr.period).filter(tt => tt < days);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'motion-panel-expansion-fig';
  const pw = 352, ph = 150;                                      // panel drawing size (local units)
  const lx = linear([0, days], [0, pw]), ly = linear([-1.8, 1.9], [ph, 0]);
  // Layout A: 3 × 2 grid. Layout B: the focus panel large, the rest as a column of thumbnails.
  const grid = (i) => ({ x: (i % 3) * (pw + 48), y: 40 + Math.floor(i / 3) * 230, s: 1 });
  const others = stars.filter(s => s.id !== focus);
  const big = { x: 0, y: 44, s: 752 / pw }, thumbS = 0.5, thumbH = ph * thumbS;
  const thumb = k => ({ x: W - pw * thumbS, y: 14 + k * (thumbH + 18), s: thumbS });
  const place = s => (s.id === focus ? big : thumb(others.indexOf(s)));
  const m = p => `matrix(${p.s.toFixed(4)},0,0,${p.s.toFixed(4)},${p.x.toFixed(1)},${p.y.toFixed(1)})`;
  const panels = stars.map((s, i) => {
    const a = grid(i), b = place(s), hot = s.id === focus;
    const pts = curve(s).map(([tt, f]) => `${lx(tt).toFixed(1)},${ly(f).toFixed(1)}`).join(' ');
    return g({ 'data-states': { 0: { transform: m(a) }, 1: { transform: m(b) } }, 'data-duration': 950, 'data-easing': 'smooth', style: 'transform-box:view-box;transform-origin:0 0' },
      el('rect', { x: 0, y: 0, width: pw, height: ph, fill: t.c('surface') }),
      el('line', { x1: 0, x2: pw, y1: ly(0), y2: ly(0), stroke: t.c('grid'), 'vector-effect': 'non-scaling-stroke' }),
      el('polyline', { points: pts, fill: 'none', stroke: hot ? t.c('accent') : t.c('muted'), 'stroke-width': hot ? 1.6 : 1.2, 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' }));
  });
  // Titles travel with their panels but are never scaled.
  const titles = stars.map((s, i) => {
    const a = grid(i), b = place(s), hot = s.id === focus;
    const at = p => (s.id === focus || p === a ? [p.x, p.y - 12] : [p.x - 12, p.y + thumbH / 2 + 6]);
    const [ax, ay] = at(a), [bx, by] = at(b);
    // Thumbnail titles sit to the left of their thumbnail: same text, shifted by its measured width.
    const shift = s.id === focus ? 0 : -measureText(s.id, 18, { weight: 700 });
    return g({ 'data-states': { 0: { translate: '0px 0px' }, 1: { translate: `${bx + shift - ax}px ${by - ay}px` } }, 'data-duration': 950, 'data-easing': 'smooth' },
      textLines([s.id], { x: ax, y: ay, size: 18, weight: 700, fill: hot ? t.c('accent') : t.c('ink') }));
  });
  // Build 2: what the promoted panel shows, in figure coordinates of the large panel.
  const X = tt => big.x + big.s * lx(tt), Y = f => big.y + big.s * ly(f);
  const k = 3, tA = transits[k], tB = transits[k + 1];
  const detail = g({ 'data-step': 2, 'data-motion': 'reveal', 'data-duration': 600 },
    transits.map(tt => el('path', { d: `M${X(tt + tr.dur / 2)} ${Y(1.9) + 2}l-6 -9h12z`, fill: t.c('accent') })),
    el('path', { d: `M${X(tA + tr.dur / 2)} ${Y(1.25)}V${Y(1.45)}H${X(tB + tr.dur / 2)}V${Y(1.25)}`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.6 }),
    textLines([`every ${fmt(tr.period, { digits: 1 })} days`], { x: (X(tA) + X(tB)) / 2 + 6, y: Y(1.45) - 10, size: 17, weight: 700, anchor: 'middle', fill: t.c('ink') }),
    el('path', { d: `M${X(tB) + 14} ${Y(0)}h8V${Y(-tr.depth)}h-8`, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.6 }),
    textLines([`${fmt(tr.depth, { digits: 1 })}% dip`], { x: X(tB + tr.period / 2), y: Y(-tr.depth) + 26, size: 17, weight: 700, anchor: 'middle', valign: 'middle', fill: t.c('ink') }),
    [0, 10, 20, 30].map(d => textLines([`day ${d}`], { x: X(d), y: big.y + big.s * ph + 10, size: 15, anchor: d ? (d === 30 ? 'end' : 'middle') : 'start', valign: 'top', fill: t.c('muted') })),
    [[1, '+1%'], [-1, '−1%']].map(([v, s]) => textLines([s], { x: X(0) + 8, y: Y(v), size: 15, valign: 'middle', fill: t.c('muted'), halo: t.c('surface') })));
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Light curves of six candidate stars, with one promoted for detail',
    desc: `Six stars over ${days} nights on one flux scale. ${focus} shows a ${fmt(tr.depth, { digits: 1 })}% dip every ${fmt(tr.period, { digits: 1 })} days (${transits.length} dips); the others show noise, spot modulation, a flare and a slow trend, but no repeating dip.` },
  panels, titles, detail);
}

export default {
  study: true,
  id: 'motion-panel-expansion',
  title: 'Expand a selected panel',
  className: 'st cs-astronomy-night',
  notes: 'Purpose: Promote one panel for detail while keeping the overview present as small thumbnails.\nModify: Edit `stars` (each curve is generated from its parameters) and `focus`. Both layouts are computed: a 3 × 2 grid and one large panel plus a column of thumbnails.\nInvariant: All panels share one flux scale; the promoted panel is the same element scaled up (no redraw); thumbnails stay labelled; text is never scaled, only moved.\nStatic: The final build shows the promoted panel with its annotations and every other star as a labelled thumbnail.',
  sources: [{ type: 'original-example', file: 'assets/motion/panel-expansion.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Of six candidate stars, only <em>${focus}</em> dips ${fmt(tr.depth, { digits: 1 })}% every ${fmt(tr.period, { digits: 1 })} days</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative photometry · hourly, ${days} nights, flux relative to each star’s median</span><span>Motion · one panel promoted, overview kept (2 builds)</span></p>`,
};
