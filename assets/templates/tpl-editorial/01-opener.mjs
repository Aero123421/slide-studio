// Template: Quire visual essay · Opener. Synthetic example content; replace data and copy.
// A literary-magazine opener: department word, the title on one line at display size set in
// a sink, the dek in the text column and the byline beside it. Type only; no folio on an opener.
const ID = 'tpl-editorial-opener';
const story = {
  department: 'Essay',
  title: 'Twenty-eight seconds',                     // one line at 128 px: about 20 characters
  dek: 'An espresso takes less than half a minute to pour. The coffee in the cup has been on its way for seven months.',
  author: 'Mara Lindqvist',
};

export default {
  study: true,
  id: ID,
  title: 'Visual essay opener: title, dek and byline',
  notes: 'Purpose: Open a long-form piece the way a literary magazine does: one title the reader remembers, one sentence that says what the piece is about, and who wrote it.\nModify: Edit `story`. Keep the title to one line (about 20 characters at 128 px; shorten it rather than shrinking the type) and the dek to one or two sentences.\nInvariant: Title first, dek second, byline third. The title is set in one color and one style, no italic or coloured word; no image on this page; no folio on an opener.\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-editorial ed-opener',
  content: `<p class="ed-dept" data-region="support">${story.department}</p>
<h1 class="ed-title" data-region="title">${story.title}</h1>
<p class="ed-dek ed-lead" data-region="primary">${story.dek}</p>
<p class="ed-byline" data-region="support">By ${story.author}</p>`,
};
