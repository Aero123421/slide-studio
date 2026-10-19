// Composition study · Image pair — two photographs compared on one stated property.
// Both frames share a height, a top edge and a caption structure. The sampled colours were
// measured from the image files (mean RGB of each box); the neutral swatch and the gap between
// red and blue are computed from them, so the captions cannot drift from the evidence.
import { fmt } from '../runtime/figure.mjs';

const lesson = { course: 'Photography 2: Light', week: 'Week 3, white balance' };
const H = 368; // shared display height, px: both files are 3 : 2, so both frames are 552 × 368
const pair = [
  {
    src: '{{asset:assets/media/study-01.jpg}}', w: 600, h: 400, file: 'study-01.jpg',
    alt: 'An espresso in a red-brown cup on a saucer, seen from above on a wooden table under warm indoor light.',
    surface: 'Cup rim', light: 'Indoor light, left as shot.', credit: 'Rachel Michetti, CC0',
    box: [250, 190, 330, 200], rgb: [246, 222, 196], // mean of the box, measured from the file
  },
  {
    src: '{{asset:assets/media/study-02.jpg}}', w: 640, h: 427, file: 'study-02.jpg',
    alt: 'A white rocket on its launch pad at dusk, floodlit from below, between lattice towers under a deep blue sky.',
    surface: 'Rocket body', light: 'Floodlit at dusk; the sky behind is <span class="ip-nw">R 58 G 77 B 112</span>.', credit: 'SpaceX, public domain',
    box: [316, 280, 328, 340], rgb: [202, 185, 147], // sky box [150, 200, 250, 260] measures [58, 77, 112]
  },
];
// Derived: display scale, the sample's centre on screen, a grey of equal luminance, the blue gap.
const lum = ([r, g, b]) => { const f = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const greyOf = Y => { const c = Y <= 0.0031308 ? 12.92 * Y : 1.055 * Y ** (1 / 2.4) - 0.055; return Math.round(c * 255); };
const hex = rgb => `#${rgb.map(v => v.toString(16).padStart(2, '0')).join('')}`;
for (const p of pair) {
  p.scale = H / p.h; p.dw = Math.round(p.w * p.scale);
  p.cx = ((p.box[0] + p.box[2]) / 2) * p.scale; p.cy = ((p.box[1] + p.box[3]) / 2) * p.scale;
  const gv = greyOf(lum(p.rgb)); p.neutral = [gv, gv, gv]; p.gap = p.rgb[0] - p.rgb[2];
  p.size = `${p.box[2] - p.box[0]} × ${p.box[3] - p.box[1]} px`;
}
const gaps = pair.map(p => p.gap).sort((a, b) => a - b), gapText = gaps[0] === gaps.at(-1) ? `${gaps[0]}` : `${gaps[0]}–${gaps.at(-1)}`;

const cell = p => `<figure class="ip-cell" style="width:${p.dw}px">
  <div class="ip-frame" style="width:${p.dw}px;height:${H}px"><img src="${p.src}" alt="${p.alt}" width="${p.dw}" height="${H}"><span class="ip-ring" style="left:${p.cx.toFixed(1)}px;top:${p.cy.toFixed(1)}px" aria-hidden="true"></span></div>
  <figcaption>
    <span class="ip-swatch" role="img" aria-label="Sampled colour ${hex(p.rgb)} beside a neutral grey of equal brightness"><span><i style="background:${hex(p.rgb)}"></i>as shot</span><span><i style="background:${hex(p.neutral)}"></i>neutral</span></span>
    <span class="ip-text"><b>${p.surface}: <span class="ip-nw">R ${p.rgb[0]} G ${p.rgb[1]} B ${p.rgb[2]}</span></b><span>Blue ${p.gap} below red. ${p.light}</span></span>
  </figcaption>
</figure>`;

export default {
  study: true,
  id: 'composition-image-pair',
  title: 'Image pair: two photographs compared on one stated property',
  className: 'st cs-classroom-bright cmp-image-pair',
  notes: `Purpose: Set two photographs side by side to compare one named property (here the colour a camera recorded for a white surface), with the measurement under each, so the pair teaches instead of decorating.\nModify: Replace \`pair\`: the file, its native size, the sample box and the mean RGB measured from that box (any image tool reports it). Scale, ring position, neutral swatch and the blue gap recompute (now ${gapText}). For a before/after pair of one subject, use identical crops and scales and say so.\nInvariant: Equal heights and a shared top edge; the same caption structure under each photograph; the sample is marked on the image where it was taken; the page states that the photographs are unrelated and that only the named property is compared.\nStatic: Already static.`,
  sources: [{ type: 'original-example', file: 'assets/compositions/image-pair.mjs' }, { type: 'image', file: 'assets/media/study-01.jpg', license: 'CC0' }, { type: 'image', file: 'assets/media/study-02.jpg', license: 'public domain' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" data-region="title">Neither white came out neutral:<br>blue sits ${gapText} levels below red in both photographs</h1>
<p class="st-dek ip-dek" data-region="support">${lesson.course}, ${lesson.week}. Two unrelated photographs, compared on one property only.</p>
<div class="ip-row" data-region="primary">${pair.map(cell).join('')}</div>
<p class="st-source" data-region="source"><span>Photographs: ${pair.map(p => p.credit).join('; ')} · rings mark the sampled boxes (${pair.map(p => p.size).join(', ')}), 0–255 per channel</span><span>Image pair</span></p>`,
};
