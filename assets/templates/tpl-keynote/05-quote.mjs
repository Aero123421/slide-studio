// Template: Stage keynote · Quote. Synthetic example content; replace data and copy.
// Words align on module 2; the opening quotation mark hangs outside them in module 1.
const ID = 'tpl-keynote-quote';
const M = n => 64 + 48 * n;            // x of module n (24 modules of 48 px)
const nb = s => s.replace(/(\d) (?=[A-Za-z%°])/g, '$1\u00a0');   // keep numbers with their units

const quote = {
  // Under about 90 characters so it holds three lines at 64 px. Use words that were actually said.
  text: 'We cool to −28 °C over lunch and switch off at six. Nothing on the shelves has noticed.',
  name: 'Ines Moreau, operations manager, Kaldvik Cold Storage',
  context: 'One of 41 sites in the Westmark pilot since July 2025',
};

export default {
  study: true,
  id: ID,
  title: 'Quote: a cold store that runs its compressors at midday',
  notes: 'Purpose: Let someone outside the speaker\'s organisation say, in plain words, that moving load in time already works.\nModify: Replace quote.text (verbatim, at most about 90 characters, real minus signs and units), quote.name (name, role, organisation) and quote.context (why this person knows).\nInvariant: Only words someone actually said or wrote, attributed to them. The opening mark hangs so the words align on module 2; the attribution aligns with the words. No yellow — the accent belongs to solar data.\nStatic: No builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-keynote kn-quote-page',
  content: `<blockquote class="kn-at" data-region="title" style="left:${M(2)}px;top:212px;width:${M(23) - M(2)}px">
  <p class="kn-statement kn-quote" style="margin-top:-10.6px"><span class="kn-hang" aria-hidden="true">“</span>${nb(quote.text)}”</p>
</blockquote>
<p class="kn-at kn-label" data-region="support" style="left:${M(2)}px;top:464px;width:${M(20) - M(2)}px">${quote.name}<br><span class="kn-grey">${quote.context}</span></p>`,
};
