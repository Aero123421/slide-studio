// Template: Stage keynote · Chapter divider. Synthetic example content; replace data and copy.
// The chapter number is set like a word at the title's size, in grey, in the first two modules;
// title and sentence hang from the same line at module 2. Nothing else on the page.
const ID = 'tpl-keynote-chapter';
const M = n => 64 + 48 * n;            // x of module n (24 modules of 48 px)
const nb = s => s.replace(/(\d) (?=[A-Za-z%°])/g, '$1\u00a0');   // keep numbers with their units

const chapters = [                      // the talk's three chapters, as claims
  'Why the evening peak keeps growing',
  'What can move to midday',
  'What we need from you',
];
const current = 1;                      // zero-based index of this chapter
// One sentence that says what the chapter will show, with its number in it.
const sentence = 'Car chargers, hot-water tanks, cold stores and water pumps draw 2.1 GW at 19:00. None of them has to run then.';

export default {
  study: true,
  id: ID,
  title: `Chapter ${current + 1}: ${chapters[current]}`,
  notes: 'Purpose: Mark a turn in a long talk and say in one sentence what the next chapter will prove.\nModify: Edit chapters (short claims, not topic labels), set current to this chapter\'s index, and rewrite sentence with the chapter\'s key number. Duplicate the file for each chapter and change current only.\nInvariant: The number is the same size as the title and sits in grey in modules 0–1; title and sentence hang from row 2 (y 212) at module 2. No yellow on this page — the accent belongs to solar data.\nStatic: No builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-keynote kn-chapter',
  content: `<p class="kn-at kn-display kn-chapter-no" aria-hidden="true" style="left:${M(0)}px;top:212px;width:${M(2) - M(0)}px">${current + 1}</p>
<h2 class="kn-at kn-display" data-region="title" aria-label="Chapter ${current + 1} of ${chapters.length}: ${chapters[current]}" style="left:${M(2)}px;top:212px;width:${M(16) - M(2)}px">${chapters[current]}</h2>
<p class="kn-at kn-lead" data-region="support" style="left:${M(2)}px;top:434px;width:${M(20) - M(2)}px">${nb(sentence)}</p>`,
};
