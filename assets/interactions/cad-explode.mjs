// Interaction study · Exploded view — pull an assembly apart along its axis to show the build order.
// Parts move along z by their \`explode\` direction; the gap is computed from the slider and the model size.
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
  { group: 'Base', name: 'Base plate', note: `${dims(fixture.base)} mm`, tone: 'cat-1', explode: -1 },
  { group: 'Spacer', name: 'Spacer ring', note: `Ø${fixture.ring.outer}, bore Ø${fixture.ring.bore}, ${fixture.ring.height} high`, tone: 'cat-2', explode: 0 },
  { group: 'Lid', name: 'Top plate', note: `${dims(fixture.plate)} mm`, tone: 'cat-3', explode: 1 },
  { group: 'Pins', name: 'Locating posts (4)', note: `${fixture.posts.side} × ${fixture.posts.side} × ${fixture.posts.height} mm`, tone: 'cat-4', explode: 0 },
];
const start = 0.6;                                 // explode fraction on the page at the start
const gap = start * Math.max(...fixture.base.slice(0, 2)) * 0.3;   // mm between neighbouring layers (the widget's rule: fraction × largest size × 0.3)
const ID = 'interaction-cad-explode';

export default {
  study: true,
  id: ID,
  title: 'Exploded view: an assembly pulled apart into its layers',
  notes: `Purpose: Show how an assembly goes together by separating its parts along the assembly axis, each part named and sized where it sits.
Modify: Replace the OBJ and \`parts\`: give each OBJ group a name, a colour role and an explode direction (−1, 0, +1 or more). The gap and the labels follow.
Invariant: Parts move only along the assembly axis and keep their orientation, so the exploded view still reads as the assembly. Each part keeps one colour and is labelled directly; no legend.
Static: The export shows the exploded state (${Math.round(gap)} mm between layers), the view the headline describes.`,
  sources: [{ type: 'mesh', file: 'assets/media/obj.obj', license: 'original fixture' }],
  exportPolicy: 'final',
  className: 'st cs-blueprint',
  content: `<h1 class="st-head">Pulled apart along its axis, the mount is three layers: base plate, spacer ring with four posts, and top plate</h1>
<p class="st-dek">Load-cell mount (fictional), four parts from one OBJ file; sizes in millimetres.</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>Mesh fixture · parts separated along z only, sizes measured from the file</span><span>Interaction · Exploded view</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'cad-explode',
    initial: { yaw: 35, pitch: 62, explode: start, cut: 1 },
    data: { parts },
    controls: {
      explode: { label: 'Pull apart', min: 0, max: 1, step: 0.05, digits: 2, labels: Array.from({ length: 21 }, (_, i) => `${Math.round(i * 0.05 * 90 * 0.3)} mm gap`) },
      yaw: { label: 'Turn (degrees)', format: '{v}°' },
      pitch: { label: 'Tilt from above (degrees)', format: '{v}°' },
    },
    text: {
      reset: 'Reset', canvasLabel: 'Exploded load-cell mount, drawn from its triangles. Drag to turn it.',
      status: 'Layers {gap} mm apart. Base plate below, ring and posts in the middle, top plate above.',
    },
  }],
};
