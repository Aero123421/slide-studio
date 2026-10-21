// Composition study · Declared duotone — an image treated for atmosphere, with its source beside it.
// The duotone is an SVG filter: luminance (Rec. 709) mapped linearly from one ink to the other.
// The inks are literal because SVG filter tables cannot read CSS variables; they repeat the
// keynote-dusk paper and accent so the picture and the page share one palette.

const photo = {
  src: '{{asset:assets/media/study-01.jpg}}', w: 600, h: 400,
  crop: [128, 0, 330, 400],   // source px: x, y, width, height — the cup and spoon, full height
  alt: 'An espresso cup on its saucer seen from above, printed in two tones: near-black shadows and orange highlights.',
  credit: 'Photograph: Rachel Michetti, CC0',
};
const inks = { shadow: '#1b1a20', light: '#e6864f' }; // keynote-dusk paper and accent
const levels = { black: 0.1, white: 0.82 }; // luminance below black prints as solid shadow ink, above white as solid light ink
const chapter = { number: 6, of: 9, title: 'Foams', line: 'Crema, milk foam and meringue: three ways to stop a bubble from bursting.', course: 'Kitchen Chemistry', when: 'Evening course, spring 2027' };

const scale = 720 / photo.crop[3];                  // full height of the slide
const panelW = Math.round(photo.crop[2] * scale);
const thumb = { w: 150, h: 100 };                   // the unedited source, whole frame
const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
const [s, l] = [rgb(inks.shadow), rgb(inks.light)];
// Transfer table: 21 steps of luminance → levels → linear mix of the two inks, per channel.
const steps = Array.from({ length: 21 }, (_, i) => Math.min(1, Math.max(0, (i / 20 - levels.black) / (levels.white - levels.black))));
const table = c => steps.map(k => (s[c] + (l[c] - s[c]) * k).toFixed(4)).join(' ');
const filter = `<filter id="composition-duotone-study-filter" color-interpolation-filters="sRGB">
<feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0"/>
<feComponentTransfer><feFuncR type="table" tableValues="${table(0)}"/><feFuncG type="table" tableValues="${table(1)}"/><feFuncB type="table" tableValues="${table(2)}"/></feComponentTransfer>
</filter>`;

export default {
  study: true,
  id: 'composition-duotone-study',
  title: 'Declared duotone: an image treated for atmosphere, its source kept beside it',
  className: 'st cs-keynote-dusk cmp-duotone-study',
  notes: `Purpose: Give a divider or cover a consistent atmosphere by printing its photograph in two tones of the deck's palette, while saying plainly that the image was treated and keeping the untreated original on the page. Use it for pictures that set a mood, never for evidence (a result, a specimen, a product defect).\nModify: Replace \`photo\` and \`chapter\`; change \`inks\` to the paper and accent of your color system (here ${inks.shadow} → ${inks.light}). The panel fills the slide height, so it shows the photograph at ${scale.toFixed(2)}× its native size: acceptable for a two-tone picture whose detail is flattened anyway; keep untreated photographs at or below 1.3×.\nInvariant: The treatment is named on the page with its two inks; the original appears whole and untreated; the duotone never sits behind text; nothing else on the page uses an image effect.\nStatic: Already static.`,
  sources: [{ type: 'original-example', file: 'assets/compositions/duotone-study.mjs' }, { type: 'image', file: 'assets/media/study-01.jpg', license: 'CC0' }],
  exportPolicy: 'final',
  content: `<svg class="dt-panel" data-region="primary" width="${panelW}" height="720" viewBox="${photo.crop.join(' ')}" role="img" aria-label="${photo.alt}">
<defs>${filter}</defs><image href="${photo.src}" width="${photo.w}" height="${photo.h}" filter="url(#composition-duotone-study-filter)"/></svg>
<p class="dt-part" data-region="support">${chapter.course}, ${chapter.when.toLowerCase()}</p>
<p class="dt-num" data-region="support">Part ${chapter.number} of ${chapter.of}</p>
<h1 class="dt-title" data-region="title">${chapter.title}</h1>
<p class="dt-line" data-region="support">${chapter.line}</p>
<figure class="dt-source" data-region="source">
  <img src="${photo.src}" alt="The same photograph, unedited: a red-brown espresso cup on a wooden table." width="${thumb.w}" height="${thumb.h}">
  <figcaption><b>Unedited original, whole frame.</b> Shown at left as a duotone: greys from ${Math.round(levels.black * 100)}% to ${Math.round(levels.white * 100)}% mapped from near-black (${inks.shadow}) to orange (${inks.light}); cropped to the cup; no retouching. ${photo.credit}.</figcaption>
</figure>
`,
};
