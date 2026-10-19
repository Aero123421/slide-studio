// Diagram study · Coordinate frame — a drone's body axes drawn by orthographic projection from a stated
// camera, with right-hand-rule rotation arcs, and one logged velocity split into components in the same frame.
// Every point is a 3-D coordinate in metres pushed through one projection; handedness is checked, not assumed.
import { svgRoot, el, g, textLines, pathFromPoints, theme as makeTheme, fmt, arrowMarker } from '../runtime/figure.mjs';

// Body frame FRD: x forward, y right, z down (right-handed). Units: m, m/s, rad.
const axes = [
  { key: 'x', v: [1, 0, 0], name: 'forward', opposite: 'back', angle: 'roll φ', len: 0.46 },
  { key: 'y', v: [0, 1, 0], name: 'right', opposite: 'left', angle: 'pitch θ', len: 0.36 },
  { key: 'z', v: [0, 0, 1], name: 'down', opposite: 'up', angle: 'yaw ψ', len: 0.27 },
];
const airframe = { arm: 0.17, rotor: 0.085, rotorZ: -0.05, body: [0.11, 0.07, 0.03] };   // m; rotors sit above the arms (negative z)
const velocity = [2.0, 1.5, -1.8];      // one logged body-frame velocity, m/s (illustrative)
const camera = [-1, 0.75, -0.95];      // viewer position in body coordinates: behind, to the right, above

// Derived: handedness check and the reading of the vertical component.
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const rightHanded = cross(axes[0].v, axes[1].v).every((c, i) => Math.abs(c - axes[2].v[i]) < 1e-9);
const climbing = velocity[2] < 0;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 800, H = 470, id = 'coordinate-frame-fig';
  // Orthographic camera: d looks from the viewer to the origin; screen-right = d × up, screen-up = right × d; world up is −z.
  const norm = a => { const l = Math.hypot(...a); return a.map(c => c / l); }, dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const d = norm(camera.map(c => -c)), right = norm(cross(d, [0, 0, -1])), up = cross(right, d);
  const view = (s, ox, oy) => p => [ox + s * dot(p, right), oy - s * dot(p, up)];
  const P = view(620, 238, 258);                       // main drawing: 620 px per metre, centre of gravity at (238, 258)
  const add = (a, b, k = 1) => a.map((c, i) => c + k * b[i]);
  const ring = (proj, c, e1, e2, r, a0 = 0, a1 = 2 * Math.PI, n = 64) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return proj(add(add(c, e1, r * Math.cos(a)), e2, r * Math.sin(a))); });
  const facing = nrm => dot(nrm, d) < 0;              // a face is visible when its outward normal points at the viewer

  // Airframe, far to near: arms and rotors behind the body, the body, then those in front of it.
  const motors = [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => [a * airframe.arm, b * airframe.arm, 0]);
  const rotor = m => g({},
    el('path', { d: pathFromPoints([P([0, 0, 0]), P(m)]), stroke: t.c('muted'), 'stroke-width': 7, 'stroke-linecap': 'round' }),
    el('path', { d: pathFromPoints([P(m), P(add(m, [0, 0, airframe.rotorZ]))]), stroke: t.c('muted'), 'stroke-width': 4 }),
    el('path', { d: pathFromPoints(ring(P, add(m, [0, 0, airframe.rotorZ]), [1, 0, 0], [0, 1, 0], airframe.rotor), { close: true }), fill: t.c('surface'), stroke: t.c('muted'), 'stroke-width': 1.5 }));
  const [bx, by, bz] = airframe.body;
  const faces = [
    { n: [0, 0, -1], q: [[-bx, -by, -bz], [bx, -by, -bz], [bx, by, -bz], [-bx, by, -bz]], fill: t.c('surface') },
    { n: [-1, 0, 0], q: [[-bx, -by, -bz], [-bx, by, -bz], [-bx, by, bz], [-bx, -by, bz]], fill: t.c('rule') },
    { n: [1, 0, 0], q: [[bx, -by, -bz], [bx, by, -bz], [bx, by, bz], [bx, -by, bz]], fill: t.c('rule') },
    { n: [0, 1, 0], q: [[-bx, by, -bz], [bx, by, -bz], [bx, by, bz], [-bx, by, bz]], fill: t.c('context') },
    { n: [0, -1, 0], q: [[-bx, -by, -bz], [bx, -by, -bz], [bx, -by, bz], [-bx, -by, bz]], fill: t.c('context') },
  ];
  const body = faces.filter(f => facing(f.n)).map(f => el('path', { d: pathFromPoints(f.q.map(P), { close: true }), fill: f.fill, stroke: t.c('muted'), 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));
  const behind = motors.filter(m => dot(m, d) > 0), front = motors.filter(m => dot(m, d) <= 0);

  // Axes from the centre of gravity, each with a right-hand-rule arc showing the positive rotation sense.
  const axisSvg = axes.map((ax, k) => {
    const tip = ax.v.map(c => c * ax.len), others = axes.filter((_, j) => j !== k).map(o => o.v);
    const [e1, e2] = k === 1 ? [others[1], others[0]] : others;   // (e1, e2, axis) right-handed
    const arc = ring(P, tip.map(c => c * 0.74), e1, e2, 0.055, 0.4, 1.7 * Math.PI, 48);
    const [tx, ty] = P(tip.map(c => c * 1.1)), labelRight = tx >= P([0, 0, 0])[0] - 1;
    const dir = tx - P([0, 0, 0])[0];
    return g({},
      el('path', { d: pathFromPoints([P([0, 0, 0]), P(tip)]), stroke: t.c('ink'), 'stroke-width': 2.5, 'marker-end': `url(#${id}-ink)` }),
      el('path', { d: pathFromPoints(arc), fill: 'none', stroke: t.c('ink'), 'stroke-width': 1.5, 'marker-end': `url(#${id}-ink-s)` }),
      textLines([ax.key], { x: tx + (Math.abs(dir) < 4 ? 12 : 0), y: ty, size: 24, anchor: Math.abs(dir) < 4 ? 'start' : labelRight ? 'start' : 'end', valign: 'middle', weight: 700, fill: t.c('ink'), italic: true }),
      textLines([ax.name, ax.angle], { x: tx + (Math.abs(dir) < 4 ? 12 : 0) + (Math.abs(dir) < 4 ? 22 : labelRight ? 22 : -22), y: ty, size: 15, anchor: Math.abs(dir) < 4 || labelRight ? 'start' : 'end', valign: 'middle', fill: t.c('muted'), lineHeight: 1.25 }));
  });

  // Velocity panel: the three components of one logged velocity as signed bars on one m/s scale,
  // each with the meaning of its sign in this frame. The z bar is the point of the page.
  const zero = 676, k = 46, rowY = i => 156 + i * 92;
  const velPanel = g({},
    textLines(['One logged velocity'], { x: 548, y: 70, size: 16, valign: 'top', weight: 700, fill: t.c('ink') }),
    textLines(['components in this frame'], { x: 548, y: 92, size: 15, valign: 'top', fill: t.c('muted') }),
    [-2, 0, 2].map(v => textLines([v ? fmt(v, { sign: true }) : '0'], { x: zero + v * k, y: rowY(2) + 58, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') })),
    axes.map((ax, i) => {
      const val = velocity[i], focus = ax.key === 'z', c = focus ? t.c('accent') : t.c('ink'), y = rowY(i);
      return g({},
        textLines([`v_${ax.key} = ${fmt(val, { digits: 1, sign: true })} m/s`], { x: 548, y, size: 16, valign: 'middle', weight: 700, fill: c }),
        textLines([`+ ${ax.name}, − ${ax.opposite}${focus ? (val < 0 ? ': climbing' : ': descending') : ''}`], { x: 548, y: y + 20, size: 15, valign: 'middle', fill: focus ? t.c('accent') : t.c('muted') }),
        el('rect', { x: Math.min(zero, zero + val * k), y: y + 34, width: Math.abs(val) * k, height: 16, fill: focus ? t.c('accent') : t.c('context') }),
        el('line', { x1: zero, x2: zero, y1: y + 30, y2: y + 54, stroke: t.c('ink'), 'stroke-width': 1.5 }));
    }));

  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Drone body frame: x forward, y right, z down',
    desc: `Orthographic view of a quadcopter from behind, right and above, with body axes from the centre of gravity: x forward, y right, z down, a ${rightHanded ? 'right' : 'left'}-handed frame (x × y = z). Arcs show the positive sense of roll, pitch and yaw by the right-hand rule. A logged velocity of (${velocity.map(c => fmt(c, { digits: 1 })).join(', ')}) m/s is shown as signed components; its z component is ${fmt(velocity[2], { digits: 1 })} m/s, which means ${climbing ? 'climbing' : 'descending'} because z points down.` },
  el('defs', {}, arrowMarker(`${id}-ink`, t.c('ink'), { size: 13 }), arrowMarker(`${id}-ink-s`, t.c('ink'), { size: 9 }), arrowMarker(`${id}-acc`, t.c('accent'), { size: 12 })),
  behind.map(rotor), body, front.map(rotor), axisSvg,
  el('circle', { cx: P([0, 0, 0])[0], cy: P([0, 0, 0])[1], r: 5, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 2 }),
  el('line', { x1: 522, x2: 522, y1: 70, y2: 420, stroke: t.c('rule') }),
  velPanel,
  textLines(['Orthographic view from behind, right and above. Sizes schematic.'], { x: 0, y: H - 2, size: 15, valign: 'bottom', fill: t.c('muted') }));
}

export default {
  study: true,
  id: 'coordinate-frame',
  title: 'Coordinate frame: axes, handedness and sign',
  className: 'st st--rail cs-blueprint',
  notes: 'Purpose: Declare a coordinate frame (axis directions, handedness, rotation signs, units) before showing any vector or angle measured in it.\nModify: Edit `axes`, `velocity` and `camera`; every point is projected from 3-D, the handedness check and the reading of v_z recompute. Swap the airframe for your object.\nInvariant: Axis directions, units and handedness are written on the page; rotation arcs follow the right-hand rule; the view is a stated orthographic projection, schematic in size; vector components are given with the meaning of their sign in this frame.\nStatic: Already static. For a talk, show the axes, then the arcs, then the velocity components.',
  sources: [{ type: 'original-example', file: 'assets/svg/coordinate-frame.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">In the body frame z points down, so this climb is logged as <em>v_z = ${fmt(velocity[2], { digits: 1 })} m/s</em></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support">
  <p class="st-text"><strong>x</strong> forward, <strong>y</strong> right, <strong>z</strong> down. ${rightHanded ? 'Right-handed' : 'Left-handed'}: x × y = z.</p>
  <hr class="st-rule">
  <p class="st-text">Roll φ, pitch θ and yaw ψ turn about x, y and z, positive by the right-hand rule: positive yaw is clockwise seen from above.</p>
  <hr class="st-rule">
  <p class="st-text st-muted">Units: metres, metres per second, radians. Velocity is logged in this body frame.</p>
</div>
<p class="st-source" data-region="source"><span>Illustrative data · one velocity sample from a quadcopter flight log</span><span>Coordinate frame diagram</span></p>`,
};
