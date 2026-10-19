// Composition study · Type as the composition — a service change set as Swiss typography.
// No boxes, no icons: a 12-column grid, one display size, optical margins on the big lines,
// and the departure minutes placed at their true clock positions so the new frequency is visible.

const route = { number: 4, name: 'Harbour – University', stop: 'Harbour Square' };
const change = { from: 'Monday 7 March 2027', until: '6 March' };
const peak = { span: ['6:30', '20:00'], days: 'Monday to Friday', headway: { old: 10, new: 6 }, firstMinute: { old: 5, new: 3 } };
const trip = { minutes: 24, layover: 4 }; // one way, and turnaround at each end
const offPeakHeadway = 10;

// Derived: departures in one hour, and trams needed to hold the headway on a full cycle.
const departures = (first, every) => Array.from({ length: Math.ceil((60 - first) / every) }, (_, k) => first + k * every);
const before = departures(peak.firstMinute.old, peak.headway.old), after = departures(peak.firstMinute.new, peak.headway.new);
const cycle = 2 * (trip.minutes + trip.layover);
const trams = h => Math.ceil(cycle / h);
const shared = after.filter(m => before.includes(m));

// Display lines, broken by sense. `inset` is the measured left side bearing of the first glyph
// (Inter Display Medium, em) so the stems, not the glyph boxes, line up on the margin.
const lines = [
  { text: `Every ${peak.headway.new} minutes`, inset: 0.06 },
  { text: `from ${peak.span[0]} to ${peak.span[1]},`, inset: 0 },
  { text: `${peak.days}.`, inset: 0.06 },
];
// Minutes sit at their clock position across columns 4–12 (x = 358 … 1216 for 0 … 60 min).
const x = m => 358 + (m / 60) * (1216 - 358);
const minutes = (list, cls) => list.map(m => `<span class="${cls}${shared.includes(m) ? ' sw-shared' : ''}" style="left:${(x(m)).toFixed(1)}px">${String(m).padStart(2, '0')}</span>`).join('');

export default {
  study: true,
  id: 'composition-swiss-type',
  title: 'Type as the composition: a Swiss-grid service notice',
  className: 'st cs-mono-print cmp-swiss-type',
  notes: `Purpose: Let typography carry a page that is all information: a service change, a programme, a schedule, an announcement. Hierarchy comes from size, weight and position on a grid, never from boxes or icons.\nModify: Replace \`route\`, \`change\`, \`peak\` and \`trip\`; the lines, the minutes and the tram count (${trams(peak.headway.old)} → ${trams(peak.headway.new)}) recompute. Keep the display lines to three, each a complete phrase (what, when, which days), and re-measure \`inset\` if the first letter of a line changes (round letters and diagonals need less or negative inset).\nInvariant: One display size (96 px) set flush left and ragged right on column 1; all secondary text hangs from columns 1 and 4; the minutes are placed by time, so equal gaps mean equal headways; one accent, the route colour, on the route number only.\nStatic: Already static.`,
  sources: [{ type: 'original-example', file: 'assets/compositions/swiss-type.mjs' }],
  exportPolicy: 'final',
  content: `<p class="sw-route" data-region="support"><span class="sw-bullet" aria-label="Tram ${route.number}">${route.number}</span>Tram ${route.number}, ${route.name}</p>
<p class="sw-date" data-region="support">From ${change.from}</p>
<h1 class="sw-display" data-region="title">${lines.map(l => `<span style="margin-left:-${l.inset}em">${l.text}</span>`).join('')}</h1>
<div class="sw-times" data-region="primary">
  <p class="sw-head">Departures from ${route.stop}, 8:00 to 8:59</p>
  <p class="sw-row sw-old"><span class="sw-label">Until ${change.until}</span>${minutes(before, 'sw-min')}</p>
  <p class="sw-row sw-new"><span class="sw-label">From ${change.from.replace(/^\w+ /, '').replace(/ \d{4}$/, '')}</span>${minutes(after, 'sw-min')}</p>
</div>
<p class="sw-note" data-region="support">Evenings and weekends stay every ${offPeakHeadway} minutes. The trip still takes ${trip.minutes} minutes; ${trams(peak.headway.new)} trams instead of ${trams(peak.headway.old)} hold the ${peak.headway.new}-minute gap.</p>
<p class="st-source" data-region="source"><span>Illustrative timetable · Vessby Transit</span><span>Swiss grid: 12 columns, one display size</span></p>`,
};
