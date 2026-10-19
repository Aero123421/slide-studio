// Interaction study · Magnifier — is the launch photo sharp enough for a one-metre exhibition panel?
// The magnifier enlarges a region with nearest-neighbour pixels (no smoothing), so at high zoom the
// audience sees the photograph's real resolution; the print arithmetic below uses its pixel width.
const photo = { width: 640, height: 427 };          // px, assets/media/study-02.jpg (public domain)
const panel = { widthMm: 1000, ppi: 150 };          // the exhibition panel and the resolution a print needs at reading distance
const mmPerPixel = panel.widthMm / photo.width;
const sharpMm = (photo.width / panel.ppi) * 25.4;
const neededPx = Math.round((panel.widthMm / 25.4) * panel.ppi);
const start = { zoom: 6, x: 50, y: 32 };            // the nose of the vehicle
const ID = 'interaction-magnifier';

export default {
  study: true,
  id: ID,
  title: 'Magnifier: checking a photograph’s real resolution before print',
  notes: `Purpose: Settle "is this image good enough?" in the room: magnify a detail until single pixels show, and state what one pixel becomes at the planned print size.
Modify: Replace \`assets.photo\` with your image, set \`photo\` (its pixel size) and \`panel\`; the millimetres per pixel (${mmPerPixel.toFixed(2)}), the widest sharp print (${Math.round(sharpMm)} mm) and the headline recompute. \`start\` picks the detail.
Invariant: Magnification never resamples smoothly: pixels are shown as squares, so the page cannot flatter the photo. The overview in the corner shows which part is enlarged.
Static: The export shows the starting detail at ${start.zoom}×. Pair it with the full photograph when the handout must show both.`,
  sources: [{ type: 'image', file: 'assets/media/study-02.jpg', license: 'public domain' }],
  exportPolicy: 'final',
  className: 'st cs-astronomy-night',
  content: `<h1 class="st-head">At ${photo.width} pixels wide, the launch photo prints sharp only up to ${Math.round(sharpMm)} mm; on the one-metre panel each pixel would be ${mmPerPixel.toFixed(1)} mm</h1>
<p class="st-dek">Exhibition panel for a space-science centre (fictional): ${panel.widthMm / 1000} m wide, needs ${neededPx.toLocaleString('en')} px at ${panel.ppi} ppi.</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>Photograph public domain (assets/media/study-02.jpg) · enlarged without smoothing</span><span>Interaction · Magnifier</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'magnifier',
    initial: { ...start },
    assets: { photo: '{{asset:assets/media/study-02.jpg}}' },
    data: { width: photo.width, height: photo.height, pixelated: true, print: { widthMm: panel.widthMm, ppi: panel.ppi } },
    controls: {
      zoom: { label: 'Magnification', min: 1, max: 12, step: 0.5, digits: 1, format: '{v}×' },
      x: { label: 'Centre, left to right (%)', format: '{v}%' },
      y: { label: 'Centre, top to bottom (%)', format: '{v}%' },
    },
    text: {
      alt: 'Rocket on the launch pad at dusk between lattice towers, magnified',
      reset: 'Reset',
      status: 'At {zoom}×, one photo pixel fills {screen} screen pixels; the view shows {visible} × {visibleH} of {width} × {height}.',
      readout: [{ value: '{pixelMm}', unit: 'mm', label: 'one photo pixel on the 1 m panel' }],
    },
  }],
};
