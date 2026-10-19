// Template: Product launch · Close: dates, how to start, what migrates. Synthetic example content; replace data and copy.
// Three dates on one rule (today's dot in green); below it the first three steps and the migration note.
const ID = 'tpl-launch-closing';
const C = n => 64 + 98 * (n - 1);      // x of column n (12 columns of 74 px, 24 px gutters)
const span = (a, b) => 98 * (b - a) + 74;
const nb = s => s.replace(/(\d) (?=[A-Za-z€%°])/g, '$1 ');   // keep numbers with their units

// Dates must match the hero. today:true marks the launch day.
const dates = [
  { date: '3 November 2026', what: '2.0 on Growth and Scale', today: true },
  { date: '1 December 2026', what: '2.0 on Starter' },
  { date: '31 March 2027', what: '1.x ends; accounts still on it move over' },
];
const start = [                          // a real sequence, so it is numbered
  'Open Settings, Returns, Version and choose 2.0. Your 1.x rules are copied across.',
  'Run a week in review mode: 2.0 proposes every decision and a person confirms it.',
  'Switch each rule to automatic once its proposals match what your team would do.',
];
const migration = 'Rules, return reasons and label settings move as they are. Webhooks change: point them to the 2.0 endpoint before 31 March 2027, when the 1.x endpoints stop.';
const contact = { guide: 'Guide and changelog: fernhook.example/2-0', help: 'Questions: help@fernhook.example or your account manager' };
const end = dates.at(-1).date;

export default {
  study: true,
  id: ID,
  title: `Close: switch today on Growth and Scale; 1.x runs until ${end}`,
  notes: 'Purpose: End a launch with the dates that matter, the first three things a customer does, and what happens to what they have now.\nModify: Edit dates (mark the launch day today:true; must match the hero), start (three imperative steps, in order), migration (what moves by itself, what the customer must do, by when) and contact.\nInvariant: Dates in order on one rule; only today\'s dot is green. Steps are numbered because they are a sequence. Future items are stated as dates, not promises.\nStatic: No builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-launch ln-closing',
  content: `<h2 class="ln-at ln-head" data-region="title" style="left:${C(1)}px;top:64px;width:${span(1, 10)}px">Growth and Scale can switch today; 1.x keeps working until ${nb(end)}</h2>
<ol class="ln-at ln-dates" data-region="primary" style="left:${C(1)}px;top:208px;width:${span(1, 12)}px">${dates.map(d => `<li${d.today ? ' class="ln-today"' : ''}><b>${nb(d.date)}</b><span>${nb(d.what)}</span></li>`).join('')}</ol>
<div class="ln-at" data-region="support" style="left:${C(1)}px;top:356px;width:${span(1, 6)}px"><h3 class="ln-col-head">How to start</h3><ol class="ln-steps">${start.map(s => `<li>${nb(s)}</li>`).join('')}</ol></div>
<div class="ln-at" style="left:${C(7)}px;top:356px;width:${span(7, 12)}px"><h3 class="ln-col-head">Moving from 1.x</h3><p class="ln-body" style="margin-top:0">${nb(migration)}</p></div>
<p class="ln-at ln-label" style="left:${C(1)}px;top:642.9px;width:${span(1, 6)}px">${contact.guide}</p>
<p class="ln-at ln-label ln-grey" style="left:${C(7)}px;top:642.9px;width:${span(7, 12)}px">${contact.help}</p>`,
};
