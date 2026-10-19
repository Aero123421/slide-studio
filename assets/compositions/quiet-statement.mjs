// Composition study · Quiet statement — one original decision, given the whole page.
// The supporting line is computed from the cohort and group size, so the sentence and the
// numbers under it cannot drift apart when the data changes.

const decision = {
  body: 'Ashcombe Valley Schools', date: '9 October 2026',
  // Lines break where the sense breaks; each entry is one line on the page.
  statement: ['Any child not reading fluently', 'by the end of Year 2 will be taught', 'in a group of four or fewer,', 'every school day, until they are.'],
};
const cohort = { pupils: 286, schools: 19 }; // autumn 2026 screening, end of Year 2
const groupSize = 4;
const groupsPerTeacher = 2;                    // two 45-minute groups a day
const groups = Math.ceil(cohort.pupils / groupSize);
const teachers = Math.ceil(groups / groupsPerTeacher);

export default {
  study: true,
  id: 'composition-quiet-statement',
  title: 'Quiet statement: one decision, set to be read slowly',
  className: 'st cs-civic-calm cmp-quiet',
  spaceIntent: 'Space around one sentence; the page asks the room to stop and read.',
  notes: 'Purpose: Put a commitment or decision on its own page, in the organisation’s own words, so it is read rather than skimmed. It is the page people quote afterwards.\nModify: Replace `decision.statement` with one sentence of at most about 25 words that names who, what and until when, split into lines where the sense breaks (one array entry per line). Keep the supporting line to the one fact that makes the sentence concrete (here: how many pupils, groups and teachers it means this term), computed from the data.\nInvariant: One sentence, ink on paper, no accent colour, no quotation marks and no named endorser: it is a decision of the body named at the foot, not a quotation. The statement fills about two thirds of the width at 50–56 px; the supporting line sits under a short hairline in the lower third; nothing else on the page.\nStatic: Already static. Do not reveal it word by word.',
  sources: [],
  exportPolicy: 'final',
  content: `<h1 class="qs-statement" data-region="title">${decision.statement.join('<br>')}</h1>
<hr class="qs-rule" aria-hidden="true">
<p class="qs-support" data-region="support">This autumn: ${cohort.pupils} pupils in ${cohort.schools} schools, ${groups} groups, ${teachers} reading teachers.</p>
<p class="qs-attrib" data-region="source">Decision of the Board, ${decision.body}, ${decision.date}</p>`,
};
