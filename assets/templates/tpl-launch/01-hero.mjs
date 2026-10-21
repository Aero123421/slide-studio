// Template: Product launch · Hero. Synthetic example content; replace data and copy.
// Type-led: the product's name once at display size, what changed in one sentence, availability,
// and one honest product fragment — a single return rule as the app shows it, at reading size.
const ID = 'tpl-launch-hero';
const C = n => 64 + 98 * (n - 1);      // x of column n (12 columns of 74 px, 24 px gutters)
const span = (a, b) => 98 * (b - a) + 74;
const nb = s => s.replace(/(\d) (?=[A-Za-z€%°])/g, '$1 ');   // keep numbers with their units

const launch = {
  name: 'Fernhook 2.0',
  changed: 'Routine returns are now approved by your own rules and refunded at the carrier’s first scan.',
  availability: ['Available today, 3 November 2026, on Growth and Scale.', 'On Starter from 1 December 2026.'],
};
// The fragment: one rule, worded as it appears in the product. Sample data.
const rule = {
  name: 'Wrong size',
  when: ['Reason is Too small or Too big', 'Delivered under 30 days ago', 'Item price under €150'],
  then: ['Approve and send a QR code', 'Offer the next size from stock', 'If declined, refund at first scan'],
  note: 'Sample rule. In the beta it matched 1,912 returns.',
};

export default {
  study: true,
  id: ID,
  title: `Launch hero: ${launch.name}`,
  notes: 'Purpose: Open a launch with the product\'s name, what changed in one sentence, when customers get it, and one real piece of the product so the claim is concrete.\nModify: Edit launch.name, launch.changed (one sentence, a mechanism, not a slogan), launch.availability (dates and plans) and the rule fragment (one object from your product, worded as the UI shows it).\nInvariant: The name appears once in the deck, here, in green. The fragment is flat, legible (18 px) and labelled as sample data; no device frame. Dates must match the close.\nStatic: No builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-launch ln-hero',
  content: `<h1 class="ln-at ln-display ln-green" data-region="title" style="left:${C(1)}px;top:64px">${launch.name}</h1>
<p class="ln-at ln-lead" data-region="support" style="left:${C(1)}px;top:272px;width:${span(1, 6)}px;text-wrap:balance">${nb(launch.changed)}</p>
<p class="ln-at ln-body" style="left:${C(1)}px;top:512px;width:${span(1, 6)}px">${launch.availability.map(nb).join('<br>')}</p>
<figure class="ln-at ln-rule" data-region="primary" style="left:${C(8)}px;top:272px;width:${span(8, 12)}px" aria-label="Sample return rule">
  <h3>${rule.name}</h3>
  <dl><dt>When</dt><dd>${rule.when.map(nb).join('<br>')}</dd><dt>Then</dt><dd>${rule.then.map(nb).join('<br>')}</dd></dl>
  <p>${rule.note}</p>
</figure>`,
};
