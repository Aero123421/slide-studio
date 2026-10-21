// Composition study · Asymmetric index — an agenda whose items take the space their minutes take.
// One spine (the time rule) aligns every item; the height of each item is proportional to its
// allocation, so the one long decision is visibly most of the evening. Start times, the total,
// the share in the headline and the accent bar are computed from `items`.
const meeting = {
  council: 'Harbourside District Council', committee: 'Planning Committee',
  day: 'Wednesday 21 October 2026', start: '18:30', place: 'Council Chamber, Town Hall',
};
const items = [ // minutes allocated by the chair
  { title: 'Apologies and declarations of interest', min: 5 },
  { title: 'Minutes of the meeting on 23 September', min: 5 },
  { title: 'Former gasworks, Canal Street: 640 homes, a primary school and a riverside park', ref: 'Application 26/0417', min: 55, lead: true,
    summary: 'Officers recommend approval with 32 conditions. 214 public comments: 131 objections, 83 in support.', speakers: 'Six registered speakers, three minutes each' },
  { title: 'Tree preservation order, Mill Lane', ref: 'TPO 26/03', min: 10 },
  { title: 'Appeals decided since September', min: 5 },
];
const toMin = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };
const hm = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
let clock = toMin(meeting.start);
const rows = items.map(it => { const r = { ...it, at: hm(clock) }; clock += it.min; return r; });
const total = items.reduce((s, it) => s + it.min, 0);
const lead = rows.find(r => r.lead);

// Vertical scale: the agenda column is 500 px tall for the whole meeting.
const top = 104, height = 500, pxPerMin = height / total;
const agenda = rows.map(r => {
  const y = top + (toMin(r.at) - toMin(meeting.start)) * pxPerMin, h = r.min * pxPerMin;
  const body = r.lead
    ? `<h2 class="ai2-lead-title">${r.title}</h2><p class="ai2-ref">${r.ref} · ${r.min} minutes</p><p class="ai2-summary">${r.summary}</p><p class="ai2-ref">${r.speakers}</p>`
    : `<p class="ai2-item">${r.title}${r.ref ? ` <span>${r.ref}</span>` : ''}</p>`;
  return `<div class="ai2-row${r.lead ? ' ai2-is-lead' : ''}" style="top:${y.toFixed(1)}px;height:${h.toFixed(1)}px">
  <span class="ai2-time">${r.at}</span>${r.lead ? '<span class="ai2-bar" aria-hidden="true"></span>' : ''}<div class="ai2-body">${body}</div></div>`;
}).join('\n');

export default {
  study: true,
  id: 'composition-asymmetric-index',
  title: 'Asymmetric index: an agenda sized by the time each item gets',
  className: 'st cs-navy-classic-light cmp-index',
  notes: 'Purpose: Show the structure of a meeting, report or talk so that its proportions are visible: what most of the time (or most of the pages) is for. An index whose items are equal boxes hides that; an index set to one spine with unequal sizes shows it.\nModify: Replace `meeting` and `items` (title, minutes, optional reference; mark the one main item `lead`). Start times, the end time, the share in the headline and every height recompute. For a report, use page counts instead of minutes.\nInvariant: One alignment spine (the time column and its rule); every item starts on the spine; heights are proportional to the allocation, so a five-minute item gets one line and the main item gets room for its title, recommendation and speakers; one accent bar marks the main item on the spine; no numbered cards, no icons.\nStatic: Already static.',
  sources: [{ type: 'original-example', file: 'assets/compositions/asymmetric-index.mjs' }],
  exportPolicy: 'final',
  content: `<p class="ai2-run" data-region="support">${meeting.council}</p>
<h1 class="ai2-head" data-region="title">${lead.min} of tonight’s ${total} minutes go to <em>one decision</em></h1>
<div class="ai2-meta" data-region="support"><p><b>${meeting.committee}</b></p><p>${meeting.day}, ${meeting.start}</p><p>${meeting.place}</p></div>
<div class="ai2-agenda" data-region="primary">
${agenda}
  <div class="ai2-row ai2-close" style="top:${(top + height).toFixed(1)}px"><span class="ai2-time">${hm(clock)}</span><div class="ai2-body"><p class="ai2-item">Close</p></div></div>
</div>
<p class="st-source" data-region="source"><span>Illustrative agenda · times are allocations; the chair may change the order</span><span>Index sized by minutes</span></p>`,
};
