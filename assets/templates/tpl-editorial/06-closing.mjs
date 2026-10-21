// Template: Quire visual essay · Closing. Synthetic example content; replace data and copy.
// The essay's last paragraph at lead size, closed with a rust end mark; a one-line note on
// the author; then credits for every picture and number used in the piece.
const ID = 'tpl-editorial-closing';
const ending = 'A cup of espresso goes cold in about ten minutes. That is the other short time in this story, and the only one the drinker controls. Everything before it — a hillside in Huila, three weeks on a drying bed, ten weeks of milling and shipping, ten more in a sack at the roaster — has already been spent.';
const author = 'Mara Lindqvist writes about food and work. She lives in Gothenburg.';
const credits = [
  { what: 'Photograph, page 39', text: 'Espresso on a café table. Public domain (CC0).' },
  { what: 'Timeline, page 41', text: 'Typical durations for a washed coffee from Huila, Colombia; they vary by farm, process and roaster.' },
  { what: 'Recipe, page 42', text: 'A common double-shot recipe. Your coffee may want different numbers.' },
];

export default {
  study: true,
  id: ID,
  title: 'Closing page: last paragraph and credits',
  notes: 'Purpose: End the essay on its own last paragraph, then tell the reader who wrote it and where every picture and number came from.\nModify: Replace `ending` with the real final paragraph (two to four sentences; any durations must agree with the timeline page), `author` with a one-line note, and `credits` with one entry per image, chart or data source in the piece.\nInvariant: The end mark closes the text and is the only colour; no summary of takeaways and no slogan; every image used in the piece is credited here with its licence.\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-editorial ed-closing',
  content: `<p class="ed-close ed-lead" data-region="title">${ending}<span class="ed-end" aria-hidden="true"></span></p>
<p class="ed-author ed-body" data-region="support">${author}</p>
<div class="ed-credits" data-region="source">
  ${credits.map(c => `<p class="ed-note"><b>${c.what}</b>${c.text}</p>`).join('\n  ')}
</div>
<p class="ed-folio"><span>Quire, Winter 2026</span><span>43</span></p>`,
};
