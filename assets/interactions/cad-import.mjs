// Interaction study · Local mesh import — open a supplier's OBJ or STL on this laptop; nothing is uploaded.
// The page starts with the reference fixture; a chosen file is parsed in the browser (8 MiB, 40,000 triangles
// at most) and replaces it until reset. OBJ and STL carry no units, so imported sizes are in file units.
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
const ID = 'interaction-cad-import';

export default {
  study: true,
  id: ID,
  title: 'Local mesh import: checking a supplier’s file before a review',
  notes: `Purpose: Before a design review, open the supplier's mesh on the presenting laptop and read what it really contains (triangles, named parts, bounding box) without sending it anywhere.
Modify: Replace the reference OBJ (assets.obj) and \`parts\`. Imported files keep their own group names; their sizes are reported in file units because OBJ and STL do not state units.
Invariant: The file is read with the browser's file picker and parsed locally; there is no network request. Invalid files leave the current mesh in place and say why. Reset returns to the reference fixture.
Static: The export shows the reference fixture and its checks; an imported file is a live-only state.`,
  sources: [{ type: 'mesh', file: 'assets/media/obj.obj', license: 'original fixture' }],
  exportPolicy: 'final',
  className: 'st cs-terminal-dark',
  content: `<h1 class="st-head">The reference mount checks out before the review: ${fixture.triangles} triangles in four named parts, ${dims(fixture.base.slice(0, 2))} × ${fixture.height} mm</h1>
<p class="st-dek">Open the supplier’s OBJ or STL to compare; files are parsed here, never uploaded.</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>Mesh fixture (millimetres) · imported files: units as stored in the file</span><span>Interaction · Local mesh import</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'cad-import',
    initial: { yaw: 35, pitch: 60, explode: 0, cut: 1, filename: '' },
    data: { parts, scaleBar: 20 },
    controls: {
      yaw: { label: 'Turn (degrees)', format: '{v}°' },
      pitch: { label: 'Tilt from above (degrees)', format: '{v}°' },
    },
    text: {
      reset: 'Reset to the reference', fileLabel: 'Open a local OBJ or STL (8 MiB at most)', fileAria: 'Open local mesh',
      canvasLabel: 'Mesh drawn from its triangles. Drag to turn it; arrow keys turn and tilt.',
      status: 'Reference mount: {triangles} triangles in {groups} parts, {x} × {y} × {z} mm.',
      statusFile: '{file}: {triangles} triangles in {groups} part(s), {x} × {y} × {z} in the file’s units.',
    },
  }],
};
