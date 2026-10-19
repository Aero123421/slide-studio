// Template: Stage keynote · Opener. Synthetic example content; replace data and copy.
// A type poster on the day grid: title hung from the top line, premise and speaker line on the bottom.
const ID = 'tpl-keynote-opener';
const M = n => 64 + 48 * n;            // x of module n (24 modules of 48 px = the hours of a day)

const talk = {
  title: 'Moving evening demand to midday',
  // One sentence that states the problem and the size of the answer. Keep it to two lines.
  premise: 'Solar output peaks at 13:00 and demand at 19:00. About 2 GW of the evening load could run at midday instead.',
  speaker: 'Maren Ekholm, system planning, Westmark Grid',
  event: 'Lowland Energy Forum, Rotterdam, 24 September 2026',
};

export default {
  study: true,
  id: ID,
  title: 'Keynote opener: Moving evening demand to midday',
  notes: 'Purpose: Open a talk with its subject in the room\'s largest type, the premise in one plain sentence, and who is speaking where — nothing else competes.\nModify: Edit talk.title (two lines at 88 px; about 16 characters per line), talk.premise (two lines; a fact and the size of the answer, not a slogan), talk.speaker and talk.event.\nInvariant: Flat paper, ink only — the yellow is reserved for solar data later in the deck. Title hangs from the 64 px top line with the premise under it at y 286 (the upper part of the screen stays visible over the audience's heads); speaker and event share one baseline at 656, the event starting at the centre line (module 12).\nStatic: No builds; the page reads at once.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-keynote kn-opener',
  content: `<h1 class="kn-at kn-display" data-region="title" style="left:${M(0)}px;top:64px;width:${M(24) - M(0)}px">${talk.title}</h1>
<p class="kn-at kn-lead" data-region="support" style="left:${M(0)}px;top:286px;width:${M(18) - M(0)}px">${talk.premise}</p>
<p class="kn-at kn-label kn-grey" style="left:${M(0)}px;top:641px;width:${M(11) - M(0)}px">${talk.speaker}</p>
<p class="kn-at kn-label kn-grey" style="left:${M(12)}px;top:641px;width:${M(24) - M(12)}px">${talk.event}</p>`,
};
