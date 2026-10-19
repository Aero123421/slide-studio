// Template: Incident review · Cover. Synthetic example content; replace data and copy.
const ID = 'tpl-architecture-cover';

const incident = {
  id: 'INC-2611',
  title: 'Checkout timed out for 42 minutes when the price cache emptied',
  date: 'Tue 6 Oct 2026',
  severity: 'SEV-2',
  resolved: '19:32 UTC',
  review: 'Tue 13 Oct 2026',
  impactStart: '18:02', // UTC, first 1-minute bucket with checkout p99 over the SLO
  impactEnd: '18:44', // UTC, end of the last bucket over the SLO
};
// Impact, measured at the gateway for POST /checkout between impactStart and impactEnd.
const impact = {
  attempts: 13860, // checkout requests in the window
  failed: 1370, // requests answered 504 after the 2.0 s timeout
  p99: 2.0, // s, highest 1-minute p99 (requests are cut off at the gateway timeout)
  minutesAtTimeout: 22, // 1-minute buckets whose p99 equals the timeout
  sloP99: 1.0, // s
  budgetSpent: 0.19, // share of the 30-day error budget (99.5% under 1.0 s)
};
const summary = 'At 18:00 UTC the autumn-sale promotion invalidated 41,200 cached price rules at once. ' +
  'Pricing then missed the cache on most requests and fell through to <span class="ar-id">catalog-replica-2</span>, ' +
  'the replica the hourly reporting jobs had just started loading. Replica queries took up to 1.8 s, so checkouts ran ' +
  'into the 2.0 s gateway timeout until the cache was warmed again.';

const mins = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const duration = mins(incident.impactEnd) - mins(incident.impactStart);
const num = v => v.toLocaleString('en-US');
const rows = [
  { v: duration, u: 'min', d: `of degraded checkout, <span class="nw">${incident.impactStart}–${incident.impactEnd}</span> UTC` },
  { v: num(impact.failed), u: '', d: `checkouts failed with a gateway timeout, ${(100 * impact.failed / impact.attempts).toFixed(1)}% of attempts` },
  { v: impact.p99.toFixed(1), u: 's', d: `p99 latency for ${impact.minutesAtTimeout} min, held at the timeout (SLO ${impact.sloP99.toFixed(1)} s)` },
  { v: Math.round(impact.budgetSpent * 100), u: '%', d: 'of the 30-day error budget spent' },
];

export default {
  study: true,
  id: ID,
  title: 'Incident review cover: checkout timeouts',
  notes: 'Purpose: Open the review with what happened and what it cost customers, in units, before anyone argues about causes.\nModify: Edit incident, impact and summary. The duration, failure share and every impact line are computed from them; keep the summary to one paragraph of four sentences: trigger, mechanism, effect, end.\nInvariant: Times in one zone (UTC), stated once. Every number has a unit and a window. Name systems and changes, never people.\nStatic: Static page; no builds.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-architecture ar-cover',
  content: `<p class="ar-kicker">Incident review<span class="ar-id">${incident.id}</span></p>
<h1 class="ar-title" data-region="title">${incident.title}</h1>
<p class="ar-summary" data-region="support">${summary}</p>
<section class="ar-impact" data-region="primary"><h2>Impact</h2><dl>${rows.map(r => `<div><dt>${r.v}${r.u ? `<small${r.u === '%' ? ' class="pct"' : ''}>${r.u}</small>` : ''}</dt><dd>${r.d}</dd></div>`).join('')}</dl></section>
<p class="ar-src" data-region="source"><span>Illustrative data: a fictional incident with synthetic measurements.</span></p>
<dl class="ar-meta" data-region="support"><div><dt>Date</dt><dd>${incident.date}</dd></div><div><dt>Severity</dt><dd>${incident.severity}</dd></div><div><dt>Resolved</dt><dd>${incident.resolved}</dd></div><div><dt>Reviewed</dt><dd>${incident.review}</dd></div></dl>`,
};
