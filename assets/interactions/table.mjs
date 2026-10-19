// Interaction study · Sortable table — outpatient waiting times by clinic, sortable by any column.
// Each clinic's waits are summarised from one log-normal distribution (median, spread), so the median,
// the 90th percentile and the share seen within 18 weeks always agree with each other.
const standard = { weeks: 18, share: 92 };   // seen within 18 weeks, % of patients (fictional board standard)
const clinics = [                            // referrals a month; median wait, weeks; spread (σ of log weeks)
  { clinic: 'Orthopaedics', referrals: 410, median: 14.5, sigma: 0.55 },
  { clinic: 'Dermatology', referrals: 360, median: 12.8, sigma: 0.50 },
  { clinic: 'Ophthalmology', referrals: 520, median: 9.6, sigma: 0.42 },
  { clinic: 'Ear, nose and throat', referrals: 280, median: 8.1, sigma: 0.50 },
  { clinic: 'Cardiology', referrals: 240, median: 6.4, sigma: 0.42 },
  { clinic: 'Gastroenterology', referrals: 300, median: 10.9, sigma: 0.48 },
  { clinic: 'Neurology', referrals: 150, median: 11.6, sigma: 0.52 },
  { clinic: 'Urology', referrals: 210, median: 7.3, sigma: 0.46 },
  { clinic: 'Gynaecology', referrals: 260, median: 8.8, sigma: 0.50 },
  { clinic: 'Rheumatology', referrals: 120, median: 9.9, sigma: 0.55 },
];
// Standard normal CDF (Abramowitz–Stegun 7.1.26, error < 1.5e-7).
const phi = z => { const t = 1 / (1 + 0.3275911 * Math.abs(z / Math.SQRT2)); const e = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(z * z) / 2); return 0.5 * (1 + (z >= 0 ? e : -e)); };
const rows = clinics.map(c => ({
  clinic: c.clinic, referrals: c.referrals, median: c.median,
  p90: Math.round(c.median * Math.exp(1.2816 * c.sigma) * 10) / 10,
  within: Math.round(phi(Math.log(standard.weeks / c.median) / c.sigma) * 1000) / 10,
}));
const byWithin = [...rows].sort((a, b) => a.within - b.within), worst = byWithin[0];
const below = rows.filter(r => r.within < standard.share);
const largest = [...rows].sort((a, b) => b.referrals - a.referrals)[0];
const words = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
const ID = 'interaction-table';

export default {
  study: true,
  id: ID,
  title: 'Sortable table: waiting times by clinic against an 18-week standard',
  notes: `Purpose: A table the room can re-sort on request (by size, median, the slowest tenth, the standard) while every value stays in its row, with the standard drawn into the key column.
Modify: Replace \`clinics\` (and \`standard\`). Each row needs a median and a spread; the 90th percentile and the share within ${standard.weeks} weeks are computed, so the columns never contradict each other. The headline recomputes.
Invariant: Sorting moves whole rows. Numbers are right-aligned with tabular figures; the sorted column is marked in its header (↑/↓, aria-sort). Red marks only shares below the standard, and the value is always printed.
Static: The export keeps the starting order (lowest share first). Sort by referrals live to show that size does not explain the waits: ${largest.clinic}, the largest clinic, meets the standard.`,
  sources: [{ type: 'original-example', file: 'assets/interactions/table.mjs' }],
  exportPolicy: 'final',
  className: 'st cs-navy-classic-light',
  content: `<h1 class="st-head">${words[below.length]} of ${rows.length} clinics miss the ${standard.share}% standard; ${worst.clinic} sees only ${Math.round(worst.within)}% of patients within ${standard.weeks} weeks</h1>
<p class="st-dek">Northvale Health Board (fictional), outpatient referrals, quarter to September 2026.</p>
<div class="widget" data-interactive="" id="${ID}-widget" data-region="primary"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>
<p class="st-source" data-region="source"><span>Illustrative data · waits summarised from a log-normal fit per clinic</span><span>Interaction · Sortable table</span></p>`,
  widgets: [{
    id: `${ID}-widget`,
    kind: 'table',
    initial: { sortBy: 'within', ascending: true },
    data: {
      id: 'clinic', rows,
      columns: [
        { key: 'clinic', name: 'Clinic', align: 'left' },
        { key: 'referrals', name: 'Referrals', unit: 'a month', ascending: false },
        { key: 'median', name: 'Median wait', unit: 'weeks', digits: 1, ascending: false },
        { key: 'p90', name: '90% seen within', unit: 'weeks', digits: 1, ascending: false },
        { key: 'within', name: `Seen within ${standard.weeks} weeks`, unit: `% · line at ${standard.share}% standard`, digits: 0, bar: { max: 100, ref: standard.share }, flag: { below: standard.share } },
      ],
    },
    text: {
      reverse: 'Reverse order', ascending: 'lowest first', descending: 'highest first',
      status: 'Sorted by {column}, {direction}: {first} ({firstValue}) to {last} ({lastValue}).',
      figure: 'Waiting times by clinic',
    },
  }],
};
