// Diagram study · Orbital line study — tilted orbits around a body, with honest front-and-back occlusion.
// Each orbit is split into its far half (drawn before the body) and near half (drawn after), so the
// lines pass behind and in front of it consistently. A spatial metaphor, not a computed trajectory.
import { svgRoot, el, g, theme as makeTheme, mixHex } from '../runtime/figure.mjs';

// Public observing nights this season and what the telescope will be pointed at (illustrative).
const nights = [
  { date: '2026-09-18', target: 'the Moon' }, { date: '2026-10-16', target: 'Jupiter' }, { date: '2026-11-13', target: 'Saturn' },
  { date: '2026-12-11', target: 'the Orion Nebula' }, { date: '2027-01-15', target: 'the Pleiades' }, { date: '2027-02-12', target: 'the Moon' },
];
const asOf = '2026-10-19';
const venue = { name: 'Hallam Ridge Observatory', opens: '19:30' };
const upcoming = nights.filter(n => n.date >= asOf), next = upcoming[0];
const when = d => new Date(`${d}T00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six'];

// Orbits: semi-major axis (px), flattening from the viewing tilt, and where each small body sits (radians).
const W = 1280, H = 720;
const motif = {
  cx: 968, cy: 352, tilt: -0.22, flat: 0.28, body: 46,
  orbits: [{ a: 120, at: 2.3, r: 4 }, { a: 176, at: 0.6, r: 6.5, focus: true }, { a: 248, at: 3.9, r: 5 }, { a: 336, at: 5.2, r: 6 }, { a: 452, at: 1.9, r: 4.5 }],
  light: -2.45,                                                     // direction the light comes from (radians)
};

const tone = (t, a, b, k) => (t.literal ? mixHex(t.hex(a), t.hex(b), k) : `color-mix(in srgb, ${t.c(a)}, ${t.c(b)} ${+(k * 100).toFixed(1)}%)`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), { cx, cy, tilt, flat, body: R } = motif, c = Math.cos(tilt), s = Math.sin(tilt);
  const at = (a, th) => { const x = a * Math.cos(th), y = a * flat * Math.sin(th); return [cx + x * c - y * s, cy + x * s + y * c]; };
  // In the orbit's own frame, sin(θ) < 0 is the far half (behind the body), sin(θ) > 0 the near half.
  const half = (a, far) => {
    const pts = Array.from({ length: 65 }, (_, i) => at(a, far ? Math.PI + (i / 64) * Math.PI : (i / 64) * Math.PI));
    return el('path', { d: 'M' + pts.map(p => p.map(v => v.toFixed(1)).join(' ')).join('L') });
  };
  const isFar = th => Math.sin(th) < 0;
  const dot = o => { const [x, y] = at(o.a, o.at); return el('circle', { cx: x, cy: y, r: o.r, fill: o.focus ? t.c('accent') : t.seq(4) }); };
  // The body: a flat disc with its lit half facing the light, bounded by an elliptical terminator.
  const [lx, ly] = [Math.cos(motif.light), Math.sin(motif.light)];
  const p0 = [cx - ly * R, cy + lx * R], p1 = [cx + ly * R, cy - lx * R], rot = (Math.atan2(ly, lx) * 180) / Math.PI + 90;
  const lit = `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}A${R} ${R} 0 0 0 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}A${R} ${(R * 0.38).toFixed(1)} ${rot.toFixed(1)} 0 0 ${p0[0].toFixed(1)} ${p0[1].toFixed(1)}Z`;
  return svgRoot({ id: 'orbital-study-fig', width: W, height: H, theme: t,
    title: 'Tilted orbits around a lit body',
    desc: `${motif.orbits.length} tilted orbits circle a body lit from the upper left; each orbit passes behind the body and in front of it, and carries one small body, one of them in gold. A decorative spatial composition, not a model of a real system.` },
  el('defs', {}, el('clipPath', { id: 'orbital-study-clip' }, el('rect', { x: 0, y: 0, width: W, height: H }))),
  g({ 'clip-path': 'url(#orbital-study-clip)' },
    g({ fill: 'none', stroke: tone(t, 'paper', 'muted', 0.26), 'stroke-width': 1 }, motif.orbits.map(o => half(o.a, true))),
    motif.orbits.filter(o => isFar(o.at)).map(dot),
    el('circle', { cx, cy, r: R, fill: t.seq(1) }),
    el('path', { d: lit, fill: t.seq(3) }),
    g({ fill: 'none', stroke: tone(t, 'paper', 'muted', 0.6), 'stroke-width': 1.3 }, motif.orbits.map(o => half(o.a, false))),
    motif.orbits.filter(o => !isFar(o.at)).map(dot)));
}

export default {
  study: true,
  id: 'orbital-study',
  title: 'Orbital line study: a spatial focal composition',
  className: 'st st--full cs-astronomy-night',
  notes: 'Purpose: Close a public-talk deck with a spatial, focal composition that suits the subject without pretending to be a chart of the sky.\nModify: Edit `nights`, `asOf` and `venue`; the next date, its target and the number of nights left recompute. Change `motif.orbits` (size, position of each small body, which one is gold), `tilt` and `flat` for the viewing angle.\nInvariant: Decorative spatial metaphor — not an atomic model or a computed trajectory; no labels on the bodies. Far halves pass behind the central body, near halves in front. One gold body.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/orbital-study.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="top:168px;max-width:470px;font-size:48px;line-height:1.12">Next public night: ${when(next.date)}</h1>
<p class="st-dek" style="top:356px;max-width:440px">The telescope will be on ${next.target}, from ${venue.opens} at ${venue.name}. ${words[upcoming.length - 1][0].toUpperCase() + words[upcoming.length - 1].slice(1)} more nights follow this season, all free.</p>
<p class="st-source" data-region="source"><span>Illustrative data · fictional observatory; the orbits are decorative</span><span>Orbital line study</span></p>`,
};
