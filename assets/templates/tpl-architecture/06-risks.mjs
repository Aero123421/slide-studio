// Template: Incident review · Actions, each tied to the failure mode it removes. Synthetic example content; replace data and copy.
const ID = 'tpl-architecture-risks';
const reviewed = { date: 'Tue 13 Oct 2026' }; // status as of the review
// One row per action, in the order the failure happened. `removes` uses the same words as pages 2–5.
// status: done | doing | todo; `code` marks identifiers set in mono.
const actions = [
  { action: 'Release promotions in batches of 2,000 SKUs and warm each batch before it goes live', owner: 'Promotions', due: '6 Nov', removes: 'One promotion invalidates the whole cache at once', status: 'doing' },
  { action: 'Coalesce concurrent misses for the same SKU in `pricing-svc`', owner: 'Pricing', due: '23 Oct', removes: 'Every miss becomes its own replica query', status: 'doing' },
  { action: 'Move reporting jobs to their own replica, `catalog-replica-3`', owner: 'Data platform', due: '20 Nov', removes: 'Reporting and pricing share one replica', status: 'todo' },
  { action: 'Give pricing calls a 400 ms deadline and fall back to the last known price', owner: 'Checkout', due: '4 Dec', removes: 'A slow price lookup spends the 2.0 s budget', status: 'todo' },
  { action: 'Alert when the price-cache hit ratio stays under 80% for 5 minutes', owner: 'SRE', due: '9 Oct', removes: 'Detection: the page named the symptom', status: 'done', doneOn: '8 Oct' },
  { action: 'Runbook and tested script to warm the price cache', owner: 'Pricing', due: '12 Oct', removes: 'Mitigation: no way to warm a cold cache', status: 'done', doneOn: '12 Oct' },
];

const NB = '\u00a0'; // never break a number from its unit
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const code = s => s.replace(/`([^`]+)`/g, '<span class="ar-id">$1</span>').replace(/(\d) (ms|s|min|SKUs)\b/g, `$1${NB}$2`);
const statusText = a => (a.status === 'done' ? `Done ${a.doneOn}` : a.status === 'doing' ? 'In progress' : 'Not started');
const done = actions.filter(a => a.status === 'done').length;
const open = actions.filter(a => a.status !== 'done');
const lastDue = open.map(a => a.due).sort((p, q) => new Date(`${p} 2026`) - new Date(`${q} 2026`)).at(-1);
const cap = s => s[0].toUpperCase() + s.slice(1);
const MONTH = { Oct: 'October', Nov: 'November', Dec: 'December' };
const longDate = d => d.replace(/ (\w{3})$/, (_, m) => `${NB}${MONTH[m] || m}`);

export default {
  study: true,
  id: ID,
  title: 'Actions, owners and the failure mode each one removes',
  notes: 'Purpose: Close the review with the actions it commits to, each tied to the specific failure mode it removes, so nobody leaves with a list of good intentions.\nModify: Edit actions (action, owner, due, removes, status, doneOn) and the review date. The headline counts and the last due date are computed. Keep one owning team per action and one failure mode per row; write failure modes in the words used on the earlier pages.\nInvariant: Every row has an owner, a date and the failure mode it removes; status is a word, not a colour; rows follow the order in which the failure unfolded, then detection and mitigation.\nStatic: Static page; no builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-architecture ar-actions',
  content: `<p class="ar-run"><span>Incident review — checkout timeouts, 6 Oct 2026</span><span>6</span></p>
<h1 class="ar-head" data-region="title">${cap(words[actions.length])} actions, one per failure mode: ${words[done]} done, the last due ${longDate(lastDue)}</h1>
<table class="ar-table" data-region="primary">
<thead><tr><th>Action</th><th>Owner</th><th>Due</th><th>Failure mode it removes</th><th>Status, ${reviewed.date.replace(/^\w+ /, '').replace(/ \d{4}$/, '')}</th></tr></thead>
<tbody>${actions.map(a => `<tr class="${a.status}"><td>${code(a.action)}</td><td>${a.owner}</td><td class="num">${a.due.replace(' ', NB)}</td><td>${code(a.removes)}</td><td>${statusText(a).replace(/(\d+) (\w+)$/, `$1${NB}$2`)}</td></tr>`).join('')}</tbody>
</table>`,
};
