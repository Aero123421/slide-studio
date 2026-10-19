// Template: Parwell seed memorandum · Cover. Synthetic example content; replace data and copy.
// Type-led cover: one sentence says what the company does (top right); the name is plain
// type at display size standing on a single rule; the round, amount, date and contact sit below it.
const ID = 'tpl-pitch-cover';
const deck = {
  company: 'Parwell',                                  // set as a typographic wordmark
  doc: 'Seed memorandum',
  line: 'Parwell writes the produce order for independent restaurant kitchens from their own sales, so they buy what they will cook.',
  round: 'Seed round', raise: 4.0e6,                   // USD
  date: 'October 2026',
  contact: 'Maren Holt, CEO', email: 'maren@parwell.example',
  legend: 'Confidential',
};
const money = v => `$${(v / 1e6).toFixed(1)}M`;

export default {
  study: true,
  id: ID,
  title: 'Parwell seed memorandum: cover',
  notes: 'Purpose: Open an investor deck with who the company is, what it does in one plain sentence, and what it is asking for.\nModify: Edit `deck`: company name (it is set as type, not drawn), the one-sentence description, round, amount, date and contact. Keep the sentence to three lines at this width and the name short enough to stay left of column 7 (about eight letters at 208 px).\nInvariant: The name is the first read, the sentence the second, the round and date the third. No illustration, no tagline, no logo mark; the amount matches the ask page.\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-pitch pp-cover',
  content: `<div class="pp-run" data-region="support"><span>${deck.doc}</span><span>${deck.legend}</span></div>
<p class="pp-cover-line pp-lead" data-region="primary">${deck.line}</p>
<h1 class="pp-mark" data-region="title">${deck.company}</h1>
<div class="pp-cover-foot" data-region="support">
  <p><b>${deck.round}, raising ${money(deck.raise)}</b><span>${deck.date}</span></p>
  <p><b>${deck.contact}</b><span>${deck.email}</span></p>
</div>`,
};
