// Interaction study · Registered comparison — will the café's photo survive a greyscale newspaper ad?
// One photograph, two renderings: colour on the left of the divider, greyscale (CSS grayscale, the same
// luminance mix a newsprint conversion uses) on the right. The widget measures the lightness (CIE L*)
// of the three marked regions from the actual pixels, so the status line's numbers come from the image.
const regions = [   // fractions of the photograph's width and height
  { name: 'Saucer', x: 0.683, y: 0.6, w: 0.083, h: 0.15 },
  { name: 'Table', x: 0.817, y: 0.65, w: 0.083, h: 0.15 },
  { name: 'Cup', x: 0.317, y: 0.5, w: 0.067, h: 0.1125, label: 'below' },
];
const ID = 'interaction-comparison';

export default {
  study: true,
  id: ID,
  title: 'Registered comparison: a colour photograph against its greyscale proof',
  notes: `Purpose: Before a photo goes into a black-and-white print ad, compare it with its greyscale rendering on one registered image and measure whether the parts that matter stay apart in lightness.
Modify: Point \`assets.photo\` at your image and move the \`regions\` (fractions of width and height) onto the parts that must stay distinct. The L* values and their differences are measured from the pixels in the browser.
Invariant: Both renderings are the same file at the same registration; only a declared display filter differs. Measurement windows are drawn on the photo, so every number has a visible source.
Static: The export shows the divider at 50% with the measured values in the status line. For print, also attach the greyscale file itself.`,
  sources: [{ type: 'image', file: 'assets/media/photo.jpg', license: 'CC0' }],
  exportPolicy: 'final',
  className: 'st cs-food-market',
  content: `<h1 class="st-head">In a greyscale newspaper ad the red saucer melts into the wooden table; only the cup keeps its edge</h1>
<p class="st-dek">Proof for a café’s Saturday ad (fictional): the 600 × 400 px menu photo.</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>Photograph CC0 · lightness L* measured from the greyscale rendering, 0 = black, 100 = white</span><span>Interaction · Registered comparison</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'comparison',
    initial: { split: 50 },
    data: { regions },
    controls: { split: { label: 'Colour shown (%)', format: '{v}%' } },
    text: {
      before: 'Colour original', after: 'Greyscale proof', reset: 'Reset',
      beforeAlt: 'Espresso cup on a red saucer on a wooden table, in colour', afterAlt: 'The same photograph converted to greyscale',
      status: 'In greyscale the saucer (L* {L0}) and the table (L* {L1}) are only {d01} points apart; the cup (L* {L2}) stands {d02} points darker than the saucer.',
    },
  }],
};
