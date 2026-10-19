// Interaction study · Cutaway — clip the mesh at a chosen height to see inside the assembly.
// The cut keeps every triangle (or the part of it) below the plane; the plane is drawn where it cuts.
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
  { group: 'Spacer', name: 'Spacer ring', note: `Ø${fixture.ring.outer}, bore Ø${fixture.ring.bore}, ${fixture.ring.height} high`, tone: 'accent', explode: 0 },
  { group: 'Lid', name: 'Top plate', note: `${dims(fixture.plate)} mm`, tone: 'context', explode: 1 },
  { group: 'Pins', name: 'Locating posts (4)', note: `${fixture.posts.side} × ${fixture.posts.side} × ${fixture.posts.height} mm`, tone: 'muted', explode: 0 },
];
const steps = Array.from({ length: 20 }, (_, i) => (i + 1) * 0.05);   // cut fractions offered by the slider
const start = 0.5;
const ID = 'interaction-cad-section';

export default {
  study: true,
  id: ID,
  title: 'Cutaway: clipping a mesh at a chosen height',
  notes: `Purpose: Answer "what is inside?" by lowering a cut plane through the real geometry: at mid-height the spacer opens up as a ring with a ${fixture.ring.bore} mm bore, and the posts stand outside it.
Modify: Replace the OBJ and \`parts\`; the slider's millimetre labels follow \`fixture.height\`. Set \`start\` to the height the page should open at.
Invariant: This is an open cutaway: triangles are clipped, cut faces are not capped, so it is not a CAD section. The cut plane is outlined where it lies; parts wholly above it are labelled as hidden.
Static: The export shows the cut at ${(start * fixture.height).toFixed(1)} mm above the base, through the ring.`,
  sources: [{ type: 'mesh', file: 'assets/media/obj.obj', license: 'original fixture' }],
  exportPolicy: 'final',
  className: 'st cs-materials-lab',
  content: `<h1 class="st-head">Cut at mid-height, the spacer turns out to be a ring: a ${fixture.ring.bore} mm bore inside ${fixture.ring.outer} mm, with the posts ${clearance.toFixed(1)} mm outside it</h1>
<p class="st-dek">Load-cell mount (fictional), clipped at a height you choose; ${fixture.height} mm tall overall.</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>Mesh fixture · open cutaway, cut faces not capped</span><span>Interaction · Cutaway</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'cad-section',
    initial: { yaw: 35, pitch: 55, explode: 0, cut: start },
    data: { parts },
    controls: {
      cut: { label: 'Cut height above the base', min: 0.05, max: 1, step: 0.05, labels: steps.map(f => `${(f * fixture.height).toFixed(1)} mm`) },
      yaw: { label: 'Turn (degrees)', format: '{v}°' },
      pitch: { label: 'Tilt from above (degrees)', format: '{v}°' },
    },
    text: {
      reset: 'Reset', canvasLabel: 'Load-cell mount clipped at the chosen height, drawn from its triangles.',
      status: 'Cut {height} mm above the base: {drawn} of {triangles} triangles kept. An open cutaway, not a capped section.',
    },
  }],
};
