// Diagram study · Waterfall — how signed contributions move one total to another.
// The closing total is not typed in: the engine computes the running sum, so the bridge always adds up.
import { waterfallChart, fmt } from '../runtime/figure.mjs';

const opening = { label: 'FY2024 operating profit', value: 42.0, total: true };
const drivers = [ // change in operating profit, $ million, FY2024 → FY2025 (illustrative)
  { label: 'Volume', value: 12.4 },
  { label: 'Price', value: 8.1 },
  { label: 'Product mix', value: -3.2 },
  { label: 'Input costs', value: -11.6 },
  { label: 'Freight', value: -2.7 },
  { label: 'Productivity programme', value: 6.3 },
  { label: 'Currency', value: -1.9 },
];
const closing = { label: 'FY2025 operating profit', total: true }; // value = running sum, computed by the chart
const end = opening.value + drivers.reduce((s, d) => s + d.value, 0);
const growthDrivers = ['Volume', 'Price']; // the commercial drivers the headline groups together
const growth = drivers.filter(d => growthDrivers.includes(d.label)).reduce((s, d) => s + d.value, 0);
const worst = [...drivers].sort((a, b) => a.value - b.value)[0];
const m = v => fmt(v, { prefix: '$', suffix: 'M', digits: 1 });

export function figure(theme = 'css') {
  return waterfallChart({
    id: 'waterfall-fig', theme, width: 1152, height: 470, fontSize: 16, format: { digits: 1 },
    title: 'Operating profit bridge from FY2024 to FY2025, $ million',
    desc: `Operating profit moved from ${m(opening.value)} to ${m(end)}. Volume and price added ${m(growth)}; ${worst.label.toLowerCase()} took away ${m(-worst.value)}, the largest reduction.`,
    data: [opening, ...drivers, closing], unit: '$ million',
    annotate: [{ at: worst.label, text: 'Resin and steel contracts repriced in March', dx: 70, dy: -10, width: 210, marker: 'none' }],
  });
}

export default {
  study: true,
  id: 'waterfall',
  title: 'Waterfall: an additive bridge between two totals',
  className: 'st cs-finance-ledger',
  notes: 'Purpose: Explain how signed contributions move one total to another, in the order a finance reader expects.\nModify: Replace `opening` and `drivers`. Leave the closing total without a value: the chart computes the running sum (and refuses a typed total that does not add up). The headline sums and the annotated driver recompute.\nInvariant: Every floating bar starts where the previous one ended; totals start at zero; signs are printed; the closing total equals the opening total plus the labelled contributions.\nStatic: Already static. For a build, pass build:{by:"mark"} to add one driver per click.',
  sources: [{ type: 'original-example', file: 'assets/svg/waterfall.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Operating profit rose ${m(end - opening.value)} to ${m(end)}: ${growthDrivers.join(' and ').toLowerCase()} added ${m(growth)}, more than the ${m(-worst.value)} lost to ${worst.label.toLowerCase()}</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · group operating profit, fiscal years to 31 March</span><span>Waterfall chart</span></p>`,
};
