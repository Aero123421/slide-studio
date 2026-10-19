// Diagram study · Optical apparatus — source, sample and detector on one optical axis, with rays traced
// through thin lenses (paraxial: y += u·Δz at each gap, u −= y/f at each lens) and clipped by real apertures.
// Beam width, the rays that are blocked, the attenuation in the sample and the readout come from `bench` and `sample`.
import { svgRoot, el, g, textLines, theme as makeTheme, fmt, arrowMarker } from '../runtime/figure.mjs';

const bench = [ // positions along the axis in mm (drawn to scale); diameters in mm
  { kind: 'source', z: 0, name: 'LED, 450 nm', spec: 'emits a ±7° cone', half: 7 },
  { kind: 'lens', z: 40, f: 40, d: 25.4, name: 'Collimating lens', spec: 'f = 40 mm' },
  { kind: 'stop', z: 70, d: 8, name: 'Iris', spec: '8 mm opening' },
  { kind: 'cell', z: 90, outer: 12.5, wall: 1.25, name: 'Cuvette', spec: '10 mm sample path' },
  { kind: 'lens', z: 140, f: 50, d: 25.4, name: 'Focusing lens', spec: 'f = 50 mm' },
  { kind: 'detector', z: 190, d: 3.6, name: 'Photodiode', spec: '3.6 mm active area' },
];
const sample = { epsilon: 25000, conc: 20e-6, pathCm: 1.0 };   // L·mol⁻¹·cm⁻¹, mol/L, cm (illustrative dye)
const rayAngles = [-7, -5.25, -3.5, -1.75, 0, 1.75, 3.5, 5.25, 7];   // degrees from the axis, at the source

// Paraxial trace: returns the points a ray reaches and whether an aperture stops it.
function trace(deg) {
  let y = 0, u = Math.tan((deg * Math.PI) / 180), z = 0;
  const pts = [[0, 0]];
  for (const e of bench.slice(1)) {
    y += u * (e.z - z); z = e.z;
    const r = (e.d ?? e.outer) / 2;
    if (e.kind !== 'cell' && Math.abs(y) > r) { pts.push([z, y]); return { pts, blocked: e }; }
    if (e.kind === 'lens') u -= y / e.f;
    pts.push([z, y]);
  }
  return { pts, blocked: null };
}
const rays = rayAngles.map(a => ({ a, ...trace(a) }));
const lens1 = bench[1], iris = bench[2], cell = bench[3];
const acceptDeg = (Math.atan(iris.d / 2 / lens1.f) * 180) / Math.PI;   // widest ray the iris lets through
const absorbance = sample.epsilon * sample.conc * sample.pathCm, transmitted = 10 ** -absorbance;
const pathMm = cell.outer - 2 * cell.wall;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'optical-apparatus-fig';
  const sx = 5.2, sy = 2 * sx, x0 = 70, yc = 236;     // axial px/mm and transverse px/mm (heights ×2)
  const X = z => x0 + z * sx, Y = y => yc - y * sy;
  const lensPath = (e, bulge = 1.6) => {
    const h = (e.d / 2) * sy, xl = X(e.z), b = bulge * sx, edge = 0.5 * sx;
    return `M${xl - edge} ${yc - h}Q${xl - edge - 2 * b} ${yc} ${xl - edge} ${yc + h}L${xl + edge} ${yc + h}Q${xl + edge + 2 * b} ${yc} ${xl + edge} ${yc - h}Z`;
  };
  const r = iris.d / 2, zIn = cell.z + cell.wall, zOut = cell.z + cell.outer - cell.wall, focus = bench[5].z;
  // Beam envelope of the rays that pass (to the iris edge), with intensity as fill opacity: full before the sample,
  // falling exponentially inside it (10 slices), and the transmitted share after it.
  const beamTop = z => (z <= lens1.z ? (r / lens1.z) * z : z <= bench[4].z ? r : r * (focus - z) / (focus - bench[4].z));
  const band = (z0, z1, op) => el('path', { d: `M${X(z0)} ${Y(beamTop(z0))}L${X(z1)} ${Y(beamTop(z1))}L${X(z1)} ${Y(-beamTop(z1))}L${X(z0)} ${Y(-beamTop(z0))}Z`, fill: t.c('accent'), 'fill-opacity': op });
  const full = 0.22, slices = 10;
  const beam = [band(0, lens1.z, full), band(lens1.z, zIn, full),
    ...Array.from({ length: slices }, (_, i) => band(zIn + (i * pathMm) / slices, zIn + ((i + 1) * pathMm) / slices, full * 10 ** (-absorbance * (i + 0.5) / slices))),
    band(zOut, bench[4].z, full * transmitted), band(bench[4].z, focus, full * transmitted)];
  const rayPaths = rays.map(ray => {
    const pts = ray.pts.map(([z, y]) => [X(z), Y(y)]);
    const mid = ray.blocked ? null : [(X(lens1.z) + X(iris.z)) / 2, Y(ray.pts[1][1])];
    return g({},
      el('path', { d: pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(''), fill: 'none', stroke: ray.blocked ? t.c('muted') : t.c('accent'), 'stroke-width': ray.blocked ? 1.2 : 1.5, 'stroke-dasharray': ray.blocked ? '4 4' : null }),
      mid ? el('path', { d: `M${mid[0] - 5} ${mid[1] - 4}L${mid[0] + 2} ${mid[1]}L${mid[0] - 5} ${mid[1] + 4}`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 1.5, 'stroke-linejoin': 'round' }) : '');
  });
  // Hardware, drawn over the beam.
  const hw = bench.map(e => {
    const x = X(e.z);
    if (e.kind === 'source') return g({}, el('rect', { x: X(-11), y: Y(4), width: 11 * sx, height: 8 * sy, rx: 4, fill: t.c('ink') }), el('circle', { cx: x, cy: yc, r: 4, fill: t.c('accent') }));
    if (e.kind === 'lens') return el('path', { d: lensPath(e), fill: t.c('surface'), stroke: t.c('ink'), 'stroke-width': 1.5 });
    if (e.kind === 'stop') return g({}, [1, -1].map(sg => el('line', { fill: 'none', x1: x, x2: x, y1: Y(sg * r), y2: Y(sg * 14), stroke: t.c('ink'), 'stroke-width': 5, 'stroke-linecap': 'butt' })));
    if (e.kind === 'cell') {
      const h = (e.outer / 2) * sy;
      return g({}, el('rect', { x: X(zIn), y: yc - h + e.wall * sx, width: pathMm * sx, height: 2 * h - 2 * e.wall * sx, fill: t.seq(1), 'fill-opacity': 0.6 }),
        el('rect', { x, y: yc - h, width: e.outer * sx, height: 2 * h, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.5 }),
        el('rect', { x: X(zIn), y: yc - h + e.wall * sx, width: pathMm * sx, height: 2 * h - 2 * e.wall * sx, fill: 'none', stroke: t.c('ink'), 'stroke-width': 1 }));
    }
    return g({}, el('rect', { x, y: Y(9), width: 8 * sx, height: 18 * sy, rx: 3, fill: t.c('ink') }), el('rect', { x: x - 2, y: Y(e.d / 2), width: 3, height: e.d * sy, fill: t.c('accent') }));
  });
  // Labels in two rails (alternating above and below the bench), each on a leader to its element.
  const topOf = e => (e.kind === 'lens' ? Y(e.d / 2) : e.kind === 'stop' ? Y(14) : e.kind === 'cell' ? Y(e.outer / 2) : e.kind === 'detector' ? Y(9) : Y(4));
  const labels = bench.map((e, i) => {
    const above = i % 2 === 0, x = X(e.kind === 'cell' ? e.z + e.outer / 2 : e.kind === 'detector' ? e.z + 4 : e.z), ly = above ? 46 : H - 62;
    const yEnd = above ? topOf(e) - 6 : 2 * yc - topOf(e) + 6;
    const anchor = i === bench.length - 1 ? 'end' : 'middle', lx = i === bench.length - 1 ? x + 30 : x;
    return g({},
      el('line', { fill: 'none', x1: x, x2: x, y1: above ? ly + 10 : ly - 10, y2: yEnd, stroke: t.c('muted'), 'stroke-width': 1 }),
      textLines([e.name], { x: lx, y: above ? ly - 20 : ly + 4, size: 16, anchor, valign: above ? 'bottom' : 'top', weight: 700, fill: t.c('ink') }),
      textLines([e.spec], { x: lx, y: above ? ly : ly + 26, size: 15, anchor, valign: above ? 'bottom' : 'top', fill: t.c('muted') }));
  });
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Absorbance bench: LED, collimating lens, iris, cuvette, focusing lens and photodiode on one axis',
    desc: `Rays leave the LED within ±${bench[0].half}°, become parallel after the ${lens1.f} mm lens, and the ${iris.d} mm iris passes only rays within ±${fmt(acceptDeg, { digits: 1 })}°. The ${iris.d} mm parallel beam crosses the ${pathMm} mm sample path and the ${bench[4].f} mm lens focuses it on the photodiode. Absorbance ${fmt(absorbance, { digits: 2 })} leaves ${fmt(transmitted * 100, { digits: 0 })}% of the light. Axial positions to scale; heights doubled.` },
  el('defs', {}, arrowMarker(`${id}-arr`, t.c('accent'))),
  el('line', { fill: 'none', x1: X(-14), x2: X(200), y1: yc, y2: yc, stroke: t.c('muted'), 'stroke-width': 1, 'stroke-dasharray': '14 4 2 4' }),
  beam, rayPaths, hw, labels,
  textLines([`${iris.d} mm collimated beam`], { x: (X(zOut) + X(bench[4].z)) / 2, y: Y(r) - 14, size: 16, anchor: 'middle', valign: 'bottom', weight: 700, fill: t.c('accent') }),
  textLines([`${fmt(transmitted * 100, { digits: 0 })}% of the light left`], { x: (X(zOut) + X(bench[4].z)) / 2, y: Y(-r) + 14, size: 15, anchor: 'middle', valign: 'top', fill: t.c('accent') }),
  // scale: axial positions are true; heights are doubled
  el('path', { d: `M${X(-11)} ${H - 32}h${20 * sx}`, stroke: t.c('ink'), 'stroke-width': 2.5 }),
  textLines(['20 mm'], { x: X(-11) + 20 * sx + 8, y: H - 32, size: 15, valign: 'middle', weight: 600, fill: t.c('ink') }),
  textLines(['along the axis; heights ×2'], { x: X(-11), y: H - 2, size: 15, valign: 'bottom', fill: t.c('muted') }));
}

export default {
  study: true,
  id: 'optical-apparatus',
  title: 'Optical apparatus: source, sample and detector on one axis',
  className: 'st cs-physics-lecture',
  notes: 'Purpose: Explain how light gets from source through sample to detector, and why the beam geometry makes the measurement valid.\nModify: Edit `bench` (positions, focal lengths, apertures) and `sample`; rays are re-traced paraxially, blocked rays end where an aperture stops them, and the beam width, acceptance angle and attenuation recompute.\nInvariant: One optical axis; light travels left to right and rays keep their direction marks; the drawing is a schematic of the optics (axial positions to scale, heights exaggerated and labelled as such), not construction drawings.\nStatic: Already static. For a talk, show the bench, then the rays, then the attenuation in the sample.',
  sources: [{ type: 'original-example', file: 'assets/svg/optical-apparatus.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">An <em>${iris.d}&nbsp;mm&nbsp;collimated&nbsp;beam</em> crosses all ${pathMm} mm of sample, and the detector reads ${fmt(transmitted * 100, { digits: 0 })}% of the blank</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative values · dye at 20 µmol/L, ε = 25,000 L·mol⁻¹·cm⁻¹, absorbance ${fmt(absorbance, { digits: 2 })}</span><span>Ray diagram (paraxial, thin lenses)</span></p>`,
};
