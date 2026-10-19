// Composition study · Dense reference table — aligned figures do the work, no boxes.
// Each station's response times are simulated per call from its parameters (seeded, so every
// build is identical); medians, 90th percentiles, shares, the total row and the headline are
// all computed from those calls — including the city-wide median, which cannot be averaged.
import { rng, quantile, fmt } from '../runtime/figure.mjs';

// 2025年度 救急出動。median/spread describe each station's call-to-arrival time (minutes, lognormal).
const stations = [
  { name: '中央', area: 12.4, crews: 4, calls: 9820, median: 6.1, spread: 0.24, prev: { calls: 9610, within8: 0.858 } },
  { name: '港', area: 18.9, crews: 3, calls: 7410, median: 6.4, spread: 0.24, prev: { calls: 7290, within8: 0.826 } },
  { name: '北', area: 26.3, crews: 3, calls: 6150, median: 6.7, spread: 0.24, prev: { calls: 6020, within8: 0.781 } },
  { name: '東', area: 21.7, crews: 3, calls: 6880, median: 6.5, spread: 0.24, prev: { calls: 6740, within8: 0.799 } },
  { name: '西', area: 30.2, crews: 3, calls: 5960, median: 6.9, spread: 0.24, prev: { calls: 5880, within8: 0.744 } },
  { name: '南', area: 24.8, crews: 3, calls: 6420, median: 6.8, spread: 0.24, prev: { calls: 6310, within8: 0.736 } },
  { name: '緑', area: 41.5, crews: 2, calls: 3870, median: 6.9, spread: 0.26, prev: { calls: 3700, within8: 0.731 } },
  { name: '山辺', area: 118.6, crews: 2, calls: 1980, median: 9.6, spread: 0.30, prev: { calls: 1940, within8: 0.302 } },
  { name: '峰岸', area: 142.3, crews: 1, calls: 1160, median: 10.9, spread: 0.32, prev: { calls: 1190, within8: 0.214 } },
  { name: '奥沢', area: 104.7, crews: 1, calls: 1420, median: 9.1, spread: 0.30, prev: { calls: 1380, within8: 0.318 } },
];
const target = { minutes: 8, share: 0.7 }; // the city's standard: 70% of calls reached within 8 minutes

// One simulated arrival time per call (Box–Muller on a seeded generator).
const simulate = (s, seed) => {
  const r = rng(seed), out = [];
  for (let i = 0; i < s.calls; i++) out.push(Math.round(s.median * Math.exp(s.spread * Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r())) * 60) / 60);
  return out;
};
const summary = (times, calls, crews, area, prev) => {
  const within8 = times.filter(t => t <= target.minutes).length / times.length;
  return { calls, crews, area, perCrew: calls / crews, median: quantile(times, 0.5), p90: quantile(times, 0.9), within8, change: (within8 - prev.within8) * 100 };
};
const times = stations.map((s, i) => simulate(s, 101 + i));
const rows = stations.map((s, i) => ({ name: s.name, ...summary(times[i], s.calls, s.crews, s.area, s.prev) }));
const pooled = times.flat();
const prevAll = { within8: stations.reduce((a, s) => a + s.prev.calls * s.prev.within8, 0) / stations.reduce((a, s) => a + s.prev.calls, 0) };
const total = { name: '市全体', ...summary(pooled, pooled.length, stations.reduce((a, s) => a + s.crews, 0), stations.reduce((a, s) => a + s.area, 0), prevAll) };
const below = rows.filter(r => r.within8 < target.share);
const allLarge = below.every(r => r.area > 100);

const n0 = v => fmt(v, { locale: 'ja', digits: 0 }), n1 = v => fmt(v, { locale: 'ja', digits: 1 });
const cells = (r, cls = '') => `<tr class="${cls}"><th scope="row">${r.name}</th><td>${n1(r.area)}</td><td>${r.crews}</td><td>${n0(r.calls)}</td><td>${n0(r.perCrew)}</td><td>${n1(r.median)}</td><td>${n1(r.p90)}</td><td class="dt-key">${n1(r.within8 * 100)}</td><td>${Math.abs(r.change) < 0.05 ? '±0.0' : fmt(r.change, { digits: 1, sign: true })}</td></tr>`;

export default {
  study: true,
  id: 'composition-dense-table',
  language: 'ja',
  title: 'Dense reference table: aligned figures without boxes',
  className: 'st cs-civic-calm cmp-dense-table',
  notes: `Purpose: Give a reading audience (a council committee, an annual report) every figure for every unit on one page, so they can look up their own station and compare it with the rest. The headline states the one pattern the table proves.\nModify: Replace \`stations\` with your records (or replace \`simulate\` with real per-call times); every column, the total row (computed from all calls, not by averaging medians) and the headline recompute. Keep one decimal for times and shares, whole numbers for counts, and units only in the header.\nInvariant: Numbers are right-aligned in tabular figures with one precision per column; rules only under the header and above the total; grouped headers name what the columns measure; the accent marks only the cells the headline is about (${below.map(r => r.name).join('・')}); no zebra stripes, no cell boxes, no icons.\nStatic: Already static.`,
  sources: [{ type: 'original-example', file: 'assets/compositions/dense-table.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" data-region="title">${target.minutes}分以内の到着が${n0(target.share * 10)}割に届かないのは<em>${below.map(r => r.name).join('・')}</em>の${below.length}署。${allLarge ? '<br><span class="st-quiet">いずれも管轄が100 km²を超える山間部</span>' : ''}</h1>
<p class="st-dek dt-dek" data-region="support">消防署別の救急出動と、入電から現場到着までの時間。2025年度、市全体で${n0(total.calls)}件。</p>
<table class="dt-table" data-region="primary">
  <colgroup><col class="dt-c-name"><col span="4"><col span="4"></colgroup>
  <thead>
    <tr class="dt-group"><th scope="col"></th><th scope="colgroup" colspan="4"><span>管轄と出動</span></th><th scope="colgroup" colspan="4"><span>現場到着までの時間</span></th></tr>
    <tr class="dt-cols"><th scope="col">消防署</th><th scope="col">面積<small>km²</small></th><th scope="col">救急隊<small>隊</small></th><th scope="col">出動<small>件</small></th><th scope="col">1隊当たり<small>件</small></th><th scope="col">中央値<small>分</small></th><th scope="col">90%値<small>分</small></th><th scope="col">${target.minutes}分以内<small>%</small></th><th scope="col">前年差<small>pt</small></th></tr>
  </thead>
  <tbody>${rows.map(r => cells(r, r.within8 < target.share ? 'dt-below' : '')).join('')}</tbody>
  <tfoot>${cells(total, 'dt-total')}</tfoot>
</table>
<p class="st-source" data-region="source"><span>架空のデータ · 汐見市消防局「救急年報」2025年度</span><span>90%値：出動の9割が到着した時間</span></p>`,
};
