// Template: Quire visual essay · Pull quote. Synthetic example content; replace data and copy.
// The one dark page of the piece: a single sentence lifted from the essay, set large with
// hanging quotation marks. Nothing else competes with it.
const ID = 'tpl-editorial-quote';
const quote = {
  text: 'By the time the water reaches the coffee, almost everything that will be in the cup has already been decided.',
};

export default {
  study: true,
  id: ID,
  title: 'Pull quote on a dark page',
  notes: 'Purpose: Give the reader a pause and the essay’s argument in one sentence, at a size that cannot be skimmed.\nModify: Replace `quote.text` with a sentence from your own text (about 15–25 words, so it sets in three or four lines). Quote a person only with their real, sourced words and name them.\nInvariant: One sentence; the opening quotation mark hangs outside the text edge; the rust quotation marks are the only colour; this is the only dark page in the pack.\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-editorial ed-dark ed-quote-page',
  content: `<blockquote class="ed-quote" style="margin:0" data-region="title"><p><span class="q">“</span>${quote.text}<span class="q">”</span></p></blockquote>
<p class="ed-folio" data-region="source"><span>Quire, Winter 2026</span><span>40</span></p>`,
};
