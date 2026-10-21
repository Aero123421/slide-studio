// Template: Quire visual essay · Spread. Synthetic example content; replace data and copy.
// The photograph is anchored to the top-right corner (it bleeds off two edges) at 1.05× its
// native size; the essay begins in a six-column text column with a three-line drop cap.
const ID = 'tpl-editorial-spread';
const photo = {
  src: '{{asset:assets/media/study-01.jpg}}', w: 600, h: 400,          // native pixels
  alt: 'An espresso in a red-brown cup and saucer with a metal spoon, on a worn wooden table',
  caption: 'An espresso in a red cup and saucer on a café table.',
  credit: 'Photograph: public domain (CC0).',
};
const shown = 628;                                                        // px wide on the slide
const essay = [
  'The shot takes twenty-eight seconds. Eighteen grams of ground coffee go into the basket, water just under boiling is forced through at nine bars, and thirty-six grams of something dark and glossy run into the cup. The barista watches the stream turn from brown to blond and stops it by the scale as much as by eye.',
  'It is the shortest part of the coffee’s life and the only part most of us see. The beans in this cup were picked on a hillside in Huila, in southern Colombia, by someone who left every cherry that was not yet red. They were washed, dried for three weeks on raised beds, rested, milled and sent north by sea. When they reached a roaster they had been travelling for more than four months, and they waited ten weeks more before anyone heated them.',
];

export default {
  study: true,
  id: ID,
  title: 'Essay spread: photograph and opening column',
  notes: `Purpose: Begin the essay text beside one photograph, so the reader meets the subject and the voice together.\nModify: Replace \`photo\` (keep a raster within 1.3× of its native width: this one is shown at ${(shown / photo.w).toFixed(2)}×) and \`essay\` (about 100–130 words; the first paragraph takes the drop cap).\nInvariant: The caption says what the picture shows and carries the credit; the photograph is not cropped beyond its own frame; the drop cap spans exactly three lines and is the only rust mark on the page.\nStatic: Already static.`,
  sources: [{ type: 'image', file: 'assets/media/study-01.jpg', license: 'CC0' }],
  exportPolicy: 'final',
  className: 'tpl-editorial ed-spread',
  content: `<figure class="ed-photo" data-region="primary">
  <img src="${photo.src}" alt="${photo.alt}" width="${shown}" height="${Math.round(shown * photo.h / photo.w)}">
  <figcaption class="ed-cap">${photo.caption} ${photo.credit}</figcaption>
</figure>
<div class="ed-column" data-region="support">
  ${essay.map((p, i) => `<p class="ed-body${i === 0 ? ' ed-drop' : ''}">${p}</p>`).join('\n  ')}
</div>
<p class="ed-folio" data-region="source"><span>Quire, Winter 2026</span><span>39</span></p>`,
};
