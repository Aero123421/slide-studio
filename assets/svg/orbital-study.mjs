// Diagram study · Orbital study — the observing geometry of one night: Sun, Earth and Saturn on their orbits.
// Positions come from mean orbital elements for the date of the next public night (Kepler's equation,
// inclinations ignored), so the angle written on the drawing is the angle the drawing shows.
import { svgRoot, el, g, theme as makeTheme, textLines, pathFromPoints, fmt } from '../runtime/figure.mjs';

// Public observing nights this season and what the telescope will be pointed at (illustrative).
const nights = [
  { date: '2026-09-18', target: 'the Moon' }, { date: '2026-10-16', target: 'Jupiter' }, { date: '2026-11-13', target: 'Saturn' },
  { date: '2026-12-11', target: 'the Orion Nebula' }, { date: '2027-01-15', target: 'the Pleiades' }, { date: '2027-02-12', target: 'the Moon' },
];
const asOf = '2026-10-19';
const venue = { name: 'Hallam Ridge Observatory', opens: '19:30', utc: '20:00' };   // utc: time the positions are computed for
const upcoming = nights.filter(n => n.date >= asOf), next = upcoming[0];
const when = d => new Date(`${d}T00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six'];

// Mean orbital elements at J2000 and their rates per Julian century (approximate JPL values; a in AU, angles in degrees).
const elements = {
  earth: { a: 1.00000261, e: 0.01671123, L: [100.46457166, 35999.37244981], peri: [102.93768193, 0.32327364] },
  saturn: { a: 9.53667594, e: 0.05386179, L: [49.95424423, 1222.49362201], peri: [92.59887831, -0.41897216] },
};
const rad = d => (d * Math.PI) / 180, deg = r => (r * 180) / Math.PI;
const T = (Date.parse(`${next.date}T${venue.utc}:00Z`) / 86400000 + 2440587.5 - 2451545) / 36525;   // Julian centuries from J2000
function place(p) {                                   // heliocentric position in the ecliptic plane
  const peri = rad(p.peri[0] + p.peri[1] * T), M = rad(p.L[0] + p.L[1] * T) - peri;
  let E = M;
  for (let i = 0; i < 12; i++) E -= (E - p.e * Math.sin(E) - M) / (1 - p.e * Math.cos(E));   // Kepler's equation
  const nu = 2 * Math.atan2(Math.sqrt(1 + p.e) * Math.sin(E / 2), Math.sqrt(1 - p.e) * Math.cos(E / 2));
  const r = p.a * (1 - p.e * Math.cos(E)), lon = nu + peri;
  return { ...p, peri, r, lon, x: r * Math.cos(lon), y: r * Math.sin(lon) };
}
const earth = place(elements.earth), saturn = place(elements.saturn);
const toSaturn = [saturn.x - earth.x, saturn.y - earth.y], toSun = [-earth.x, -earth.y];
const distance = Math.hypot(...toSaturn);
const elongation = deg(Math.acos((toSaturn[0] * toSun[0] + toSaturn[1] * toSun[1]) / (distance * Math.hypot(...toSun))));
const east = ((deg(Math.atan2(toSaturn[1], toSaturn[0]) - Math.atan2(toSun[1], toSun[0])) % 360) + 360) % 360 < 180;
// What the angle means for an observer, stated only as far as the geometry supports it.
const sky = elongation > 170 ? 'rises at sunset' : elongation > 100 ? (east ? 'is up at sunset' : 'is up at sunrise')
  : elongation > 30 ? (east ? 'is low in the west after sunset' : 'is low in the east before sunrise') : 'is lost in the Sun\'s glare';

// Drawing: 1 AU = `scale` px; the plane is rotated (never mirrored) so Saturn sits at `saturnAt` degrees from the Sun.
const W = 1280, H = 720;
const view = { sun: [1086, 258], scale: 40, saturnAt: 190 };

export function figure(theme = 'css') {
  const t = makeTheme(theme), [cx, cy] = view.sun, k = view.scale, rot = rad(view.saturnAt) - saturn.lon;
  const P = (r, lon) => [cx + k * r * Math.cos(lon + rot), cy - k * r * Math.sin(lon + rot)];   // counter-clockwise, seen from the north
  const orbitPath = p => pathFromPoints(Array.from({ length: 241 }, (_, i) => {
    const nu = (i / 240) * 2 * Math.PI;
    return P((p.a * (1 - p.e * p.e)) / (1 + p.e * Math.cos(nu)), nu + p.peri);
  }), { close: true });
  const [ex, ey] = P(earth.r, earth.lon), [sx, sy] = P(saturn.r, saturn.lon);
  // Elongation arc at Earth, from the direction of the Sun to the direction of Saturn.
  const aSun = Math.atan2(-(cy - ey), cx - ex), aSat = Math.atan2(-(sy - ey), sx - ex);
  const ccw = (((aSat - aSun) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) < Math.PI, mid = aSun + (ccw ? 1 : -1) * rad(elongation) / 2;
  const arcR = 16, at = (a, r) => [ex + r * Math.cos(a), ey - r * Math.sin(a)];
  const [a0x, a0y] = at(aSun, arcR), [a1x, a1y] = at(aSat, arcR), [lx, ly] = at(mid, 34);
  const slope = deg(Math.atan2(ey - sy, ex - sx)), [mx, my] = [(ex + sx) / 2, (ey + sy) / 2];
  const ink = t.c('ink'), orbit = t.mix('muted', 'paper', 0.5), halo = t.c('paper');
  const [ox, oy] = P(saturn.a * 0.965, rad(view.saturnAt - 42) - rot);           // inside Saturn's orbit, upper left
  return svgRoot({ id: 'orbital-study-fig', width: W, height: H, theme: t,
    title: `Sun, Earth and Saturn on ${next.date}, seen from above the planets' orbits`,
    desc: `Orbits drawn to scale (1 AU = ${k} px; bodies enlarged). On ${next.date} Saturn is ${fmt(distance, { digits: 1 })} AU from Earth and ${Math.round(elongation)}° from the Sun as seen from Earth, so it ${sky}.` },
  el('defs', {}, el('clipPath', { id: 'orbital-study-clip' }, el('rect', { x: 0, y: 0, width: W, height: H - 60 }))),
  g({ 'clip-path': 'url(#orbital-study-clip)', fill: 'none', stroke: orbit, 'stroke-width': 1 }, el('path', { d: orbitPath(saturn) }), el('path', { d: orbitPath(earth) })),
  el('line', { x1: ex, y1: ey, x2: cx, y2: cy, stroke: orbit, 'stroke-width': 1 }),
  el('line', { x1: ex, y1: ey, x2: sx, y2: sy, stroke: ink, 'stroke-width': 1.2, 'stroke-dasharray': '6 5' }),
  el('path', { d: `M${a0x.toFixed(1)} ${a0y.toFixed(1)}A${arcR} ${arcR} 0 0 ${ccw ? 0 : 1} ${a1x.toFixed(1)} ${a1y.toFixed(1)}`, fill: 'none', stroke: ink, 'stroke-width': 1 }),
  el('circle', { cx, cy, r: 7, fill: ink }),
  el('circle', { cx: ex, cy: ey, r: 4.5, fill: t.seq(4) }),
  el('circle', { cx: sx, cy: sy, r: 5.5, fill: t.c('accent') }),
  textLines(['Sun'], { x: cx, y: cy - 15, size: 15, anchor: 'middle', fill: ink }),
  textLines(['Earth'], { x: ex, y: ey + 27, size: 15, anchor: 'middle', fill: ink }),
  textLines([`${Math.round(elongation)}°`], { x: lx, y: ly, size: 15, anchor: 'middle', valign: 'middle', fill: ink, weight: 600, halo }),
  textLines(['Saturn', `${fmt(distance, { digits: 1 })} AU from Earth`], { x: sx - 16, y: sy, size: 16, lineHeight: 1.35, anchor: 'end', valign: 'middle', fill: ink }),
  textLines([`line of sight: Saturn ${sky}`], { x: mx, y: my - 10, size: 15, anchor: 'middle', fill: ink, halo, attrs: { transform: `rotate(${slope.toFixed(2)} ${mx.toFixed(1)} ${(my - 10).toFixed(1)})` } }),
  textLines([`Earth's orbit, ${fmt(earth.a, { digits: 0 })} AU`], { x: cx, y: cy - k * earth.a - 14, size: 15, anchor: 'middle', fill: t.c('muted') }),
  textLines([`Saturn's orbit, ${fmt(saturn.a, { digits: 1 })} AU`], { x: ox + 14, y: oy, size: 15, valign: 'middle', fill: t.c('muted') }));
}

export default {
  study: true,
  id: 'orbital-study',
  title: 'Orbital study: the observing geometry of one night',
  className: 'st st--full cs-astronomy-night',
  notes: 'Purpose: Close a public-talk deck with a quiet, precise schematic that says something true about the next night: where Saturn sits relative to the Sun as seen from Earth, and what that means at the eyepiece.\nModify: Edit `nights`, `asOf` and `venue`; the date, the planet positions, the Earth–Saturn distance, the elongation and the sentence on the line of sight all recompute. Change `view.scale` (px per AU), `sun` and `saturnAt` to fit the page.\nInvariant: Positions come from mean orbital elements (good to about a degree; inclinations ignored). Orbits are to scale; the bodies are enlarged. The plane may be rotated but never mirrored, so motion stays counter-clockwise. The label says only what the elongation supports. One gold body, Saturn.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/orbital-study.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="primary">${figure()}</figure>
<h1 class="st-head" style="top:168px;max-width:470px;font-size:48px;line-height:1.12">Next public night: ${when(next.date)}</h1>
<p class="st-dek" style="top:356px;max-width:440px">The telescope will be on ${next.target}, from ${venue.opens} at ${venue.name}. ${words[upcoming.length - 1][0].toUpperCase() + words[upcoming.length - 1].slice(1)} more nights follow this season, all free.</p>
<p class="st-source" data-region="source"><span>Illustrative data · fictional observatory; positions computed for ${new Date(`${next.date}T00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}, orbits to scale</span><span>Orbital geometry</span></p>`,
};
