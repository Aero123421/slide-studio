// Template: Quire visual essay · Opener. Synthetic example content; replace data and copy.
// A literary-magazine opener: department word, the title at display size set in a sink,
// a one-sentence dek and the byline. Type only; no folio on an opening page.
const ID = 'tpl-editorial-opener';
const story = {
  department: 'Essay',
  title: ['Twenty-eight', 'seconds'],                 // one entry per display line
  dek: 'An espresso takes less than half a minute to pour. The coffee in the cup has been on its way for seven months.',
  author: 'Mara Lindqvist',
  issue: 'Quire, Winter 2026',
};

export default {
  study: true,
  id: ID,
  title: 'Visual essay opener: title, dek and byline',
  notes: 'Purpose: Open a long-form piece the way a literary magazine does: one title the reader remembers, one sentence that says what the piece is about, and who wrote it.\nModify: Edit `story`. Keep the title to two short display lines (about 12 characters each at 112 px) and the dek to one or two sentences; break the title where a reader would pause.\nInvariant: Title first, dek second, byline third. The title is set in one color and one style, no italic or coloured word; no image on this page; no folio on an opener.\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-editorial ed-opener',
  content: `<p class="ed-dept" style="position:absolute;left:88px;top:72px" data-region="support">${story.department}</p>
<h1 class="ed-title" data-region="title">${story.title.join('<br>')}</h1>
<p class="ed-dek ed-lead" data-region="primary">${story.dek}</p>
<p class="ed-byline" data-region="support">By ${story.author}<br><span>${story.issue}</span></p>`,
};
