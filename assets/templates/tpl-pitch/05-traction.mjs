// Template: Parwell seed memorandum · Traction. Synthetic example content; replace data and copy.
// ARR by month as bars (live kitchens × list price), the latest month in the accent and
// labelled; a rail with two supporting metrics computed from the audit and churn data.
import { columnChart, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-pitch-traction';
const price = 300 * 12;                                     // USD per kitchen per year
const months = [                                            // live kitchens at month end
  ['Oct', 2025, 9], ['Nov', 2025, 14], ['Dec', 2025, 21], ['Jan', 2026, 27], ['Feb', 2026, 35], ['Mar', 2026, 44],
  ['Apr', 2026, 53], ['May', 2026, 63], ['Jun', 2026, 74], ['Jul', 2026, 86], ['Aug', 2026, 101], ['Sep', 2026, 118],
].map(([m, year, live]) => ({ label: m, year, live, value: live * price }));
const cancelled = 8;                                        // kitchens that cancelled, Oct 2025 – Sep 2026
// Produce binned (% of produce spend) in the first 24 kitchens: before go-live, and after six months live.
const binned = {
  before: [21.4, 19.8, 18.1, 17.0, 16.2, 15.5, 14.6, 14.1, 13.7, 13.3, 12.9, 12.7, 12.5, 12.2, 11.8, 11.1, 10.6, 10.2, 9.7, 9.1, 8.4, 7.8, 6.9, 6.1],
  after: [11.6, 11.1, 9.4, 10.0, 8.6, 8.8, 8.5, 8.5, 7.5, 8.1, 7.2, 7.5, 7.3, 7.8, 6.7, 6.9, 6.4, 6.6, 6.1, 6.1, 5.4, 5.4, 4.8, 4.4],
};
const median = a => { const s = [...a].sort((p, q) => p - q), h = s.length / 2; return s.length % 2 ? s[Math.floor(h)] : (s[h - 1] + s[h]) / 2; };
const first = months[0], last = months.at(-1);
const signed = last.live + cancelled;
const billedMonths = months.reduce((s, m) => s + m.live, 0);
const churn = cancelled / billedMonths;                     // monthly logo churn
const grewEveryMonth = months.every((m, i) => i === 0 || m.value > months[i - 1].value);
const k = v => `$${fmt(Math.round(v / 1000))}k`;
const monthName = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' };
const pct = v => `${fmt(v, { digits: 1 })}%`;

const figure = columnChart({
  id: `${ID}-fig`, width: 760, height: 356, fontSize: 16,
  title: 'Annual recurring revenue at each month end, October 2025 to September 2026',
  desc: `ARR rose every month, from ${k(first.value)} in October 2025 (${first.live} kitchens) to ${k(last.value)} in September 2026 (${last.live} kitchens).`,
  data: months, highlight: last.label, labelLines: 2, barRatio: 0.66,
  format: v => k(v),
  extra: ({ x, box }) => {                                   // year under the first month of each year
    const marks = months.filter((m, i) => i === 0 || m.year !== months[i - 1].year);
    return marks.map(m => `<text x="${x(m.label) + x.bw / 2}" y="${box.y + box.h + 48}" font-size="16" text-anchor="middle" style="fill:var(--ss-muted)">${m.year}</text>`).join('');
  },
});

export default {
  study: true,
  id: ID,
  title: 'Traction: ARR by month with two supporting metrics',
  notes: `Purpose: Prove momentum with one honest monthly series and two numbers that say the product works and customers stay.\nModify: Replace \`months\` (live customers at month end; ARR = live × price), \`cancelled\` and the before/after audit values. Every label, the headline and both metrics recompute.\nInvariant: Bars start at zero with no axis break; only the latest month is in the accent; ARR uses the same price as the market and unit-economics pages; churn is cancellations over billed customer-months.\nStatic: Already static.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-pitch pp-traction',
  content: `<div class="pp-run"><span>Parwell — Seed memorandum, October 2026</span><span>5</span></div>
<h1 class="pp-head" data-region="title">ARR has grown${grewEveryMonth ? ' every month' : ''} since launch, to ${k(last.value)} in ${monthName[last.label]}</h1>
<p class="pp-ex" data-region="support"><b>Exhibit 4</b>Annual recurring revenue at month end, live kitchens × $${fmt(price)}</p>
<figure class="pp-tr-fig" data-region="primary">${figure}</figure>
<div class="pp-rail" data-region="support">
  <div class="pp-metric"><span class="pp-num">${pct(median(binned.after))}</span><p class="pp-body">of produce bought is binned in our first ${binned.after.length} kitchens, down from ${pct(median(binned.before))}.</p></div>
  <div class="pp-metric"><span class="pp-num">${pct(churn * 100)}</span><p class="pp-body">of kitchens cancel each month: ${cancelled}&nbsp;of&nbsp;${signed} since launch.</p></div>
</div>
<p class="pp-source" data-region="source">Source: Parwell billing, Oct 2025 – Sep 2026. Produce binned: median of the same ${binned.before.length} kitchens, four-week bin audits before go-live and after six months live.</p>`,
};
