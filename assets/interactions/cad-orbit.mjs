// Interaction study · Mesh orbit — turn a real triangle mesh to see what one fixed view hides.
// Drag the drawing, use the arrow keys on it, or the two sliders; every frame is drawn from the file's triangles.
// The bundled fixture (assets/media/obj.obj, millimetres, z up): four named groups, 328 triangles.
// Sizes below were measured from the file; the widget measures the same groups again in the browser.
const fixture = {
  base: [90, 72, 10],                         // Base: plate, x × y × height
  ring: { outer: 58, bore: 32, height: 15 },  // Spacer: ring, diameters and height
  plate: [70, 58, 7],                         // Lid: top plate
  posts: { side: 5, height: 30, at: [32, 25] }, // Pins: four square posts centred at (±32, ±25)
  height: 39.5, triangles: 328,
};
const clearance = Math.hypot(fixture.posts.at[0] - fixture.posts.side / 2, fixture.posts.at[1] - fixture.posts.side / 2) - fixture.ring.outer / 2;   // mm, post corner to ring
const dims = a => a.join(' × ');
const parts = [   // OBJ group → name on the page, colour role, explode direction (−1 down, +1 up)
  { group: 'Base', name: 'Base plate', note: `${dims(fixture.base)} mm`, tone: 'context', explode: -1 },
  { group: 'Spacer', name: 'Spacer ring', note: `Ø${fixture.ring.outer}, bore Ø${fixture.ring.bore}, ${fixture.ring.height} high`, tone: 'context', explode: 0 },
  { group: 'Lid', name: 'Top plate', note: `${dims(fixture.plate)} mm`, tone: 'context', explode: 1 },
  { group: 'Pins', name: 'Locating posts (4)', note: `${fixture.posts.side} × ${fixture.posts.side} × ${fixture.posts.height} mm`, tone: 'accent', explode: 0 },
];
const ID = 'interaction-cad-orbit';

export default {
  study: true,
  id: ID,
  title: 'Mesh orbit: turning an assembly to check clearances',
  notes: `Purpose: Settle a design-review question by turning the real geometry in the room: from straight in front two of the four posts hide behind the other two; turned, all four show and their clearance to the ring is visible.
Modify: Replace the OBJ (assets.obj) and \`parts\` (OBJ group names, labels, colour roles); the labels, leader lines and sizes follow the file. Update \`fixture\` for the headline.
Invariant: The drawing is the file's triangles under an orthographic view; nothing is a picture. Drag, arrow keys and sliders change the same yaw and pitch, and reset returns to 35° / 60°.
Static: The export shows the starting view. For a review pack, add a front view (turn 0°, tilt 90°) next to it.`,
  sources: [{ type: 'mesh', file: 'assets/media/obj.obj', license: 'original fixture' }],
  exportPolicy: 'final',
  className: 'st cs-manufacturing-plant',
  content: `<h1 class="st-head">From the front two of the four posts hide; turned 35°, all four show, each ${clearance.toFixed(1)} mm clear of the ring</h1>
<p class="st-dek">Load-cell mount for a test rig (fictional), ${fixture.triangles} triangles in four parts, millimetres.</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>Mesh fixture · orthographic view, flat shading, no materials or tolerances</span><span>Interaction · Mesh orbit</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'cad-orbit',
    initial: { yaw: 35, pitch: 60, explode: 0, cut: 1 },
    data: { parts, scaleBar: 20 },
    controls: {
      yaw: { label: 'Turn (degrees)', format: '{v}°' },
      pitch: { label: 'Tilt from above (degrees)', format: '{v}°' },
    },
    text: {
      reset: 'Reset', canvasLabel: 'Load-cell mount, drawn from its triangles. Drag to turn it; arrow keys turn and tilt.',
      status: 'Turned {yaw}°, tilted {pitch}° from straight down; {drawn} of {triangles} triangles drawn. Sizes in mm, from the file.',
    },
  }],
};
