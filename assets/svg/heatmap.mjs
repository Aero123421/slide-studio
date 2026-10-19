// Diagram study · Heatmap — one value per station and month on a single sequential scale.
// Cell colors, labels and row order come from `readings`; months without a measurement stay
// null, are drawn as gaps (never as zero) and are named in the legend.
import { heatmap, el, g, textLines, mean, rng, fmt } from '../runtime/figure.mjs';

// PM2.5 monthly mean concentration, µg/m³, eight monitoring stations, fiscal year April–March (illustrative).
const months = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'];
const season = [1.15, 1.2, 0.95, 1.1, 0.9, 0.75, 0.8, 0.95, 1.0, 1.05, 1.15, 1.3]; // spring and early-summer highs
const stations = [
  { name: '工業団地局', base: 15.8 }, { name: '臨海局', base: 14.2 }, { name: '幹線道路局', base: 13.6 }, { name: '中央局', base: 12.1 },
  { name: '川辺局', base: 11.2, missing: ['7月', '8月'] }, // analyser replaced
  { name: '住宅地局', base: 10.6 }, { name: '北部丘陵局', base: 9.1 },
  { name: '山間局', base: 7.4, missing: ['1月'] }, // power cut after snowfall
];
const rand = rng(12);
const normal = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
const readings = stations.map(s => ({ name: s.name, values: months.map((mo, i) => {
  const v = Math.round((s.base * season[i] + 0.8 * normal()) * 10) / 10;
  return s.missing?.includes(mo) ? null : v; // a missing month is null, not 0
}) }));

const rows = [...readings].sort((a, b) => mean(b.values) - mean(a.values)); // highest observed mean first
const cells = rows.flatMap((r, ri) => r.values.map((v, ci) => ({ station: r.name, month: months[ci], v, ri, ci })));
const peak = cells.filter(c => c.v != null).sort((a, b) => b.v - a.v)[0];
const gaps = cells.filter(c => c.v == null);
const gapStations = [...new Set(gaps.map(c => c.station))];
const top = Math.ceil(peak.v / 5) * 5; // scale ceiling: one sequential scale from zero for every cell
// which station is highest in how many months
const leaders = months.map((mo, ci) => rows.filter(r => r.values[ci] != null).sort((a, b) => b.values[ci] - a.values[ci])[0].name);
const leader = rows.map(r => ({ name: r.name, n: leaders.filter(l => l === r.name).length })).sort((a, b) => b.n - a.n)[0];
const byMonth = months.map((mo, ci) => ({ mo, v: mean(rows.map(r => r.values[ci])) })).sort((a, b) => b.v - a.v); // network mean, observed only

export function figure(theme = 'css') {
  return heatmap({
    id: 'heatmap-fig', theme, width: 1152, height: 470, fontSize: 17, locale: 'ja',
    title: '測定局別・月別のPM2.5月平均濃度（µg/m³）',
    desc: `${rows.length}局×${months.length}か月。最高は${peak.station}の${peak.month}で${fmt(peak.v, { digits: 1 })} µg/m³。全局平均が高いのは${byMonth.slice(0, 3).map(m => m.mo).join('・')}、低いのは${byMonth.slice(-2).map(m => m.mo).join('・')}。欠測は${gapStations.join('と')}の計${gaps.length}か月で、空白のまま示している。`,
    rows: rows.map(r => r.name), cols: months, values: rows.map(r => r.values), domain: [0, top],
    colLabelLines: 1, format: { digits: 1 }, legendLow: '0', legendHigh: `${top}`, legendTitle: '月平均濃度（µg/m³）',
    highlight: (ri, ci) => ri === peak.ri && ci === peak.ci,
    extra: ({ box, cw, ch, gap, t, H }) => {
      // Missing months: hatch over the engine's blank cell and say so in the legend.
      const at = c => ({ x: box.x + c.ci * (cw + gap), y: box.y + c.ri * (ch + gap) });
      const hatch = (x, y, w, h) => el('path', { d: Array.from({ length: Math.ceil((w + h) / 9) }, (_, k) => {
        const s = k * 9; return `M${x + Math.max(0, s - h)} ${y + Math.min(h, s)}L${x + Math.min(w, s)} ${y + Math.max(0, s - w)}`;
      }).join(''), stroke: t.c('muted'), 'stroke-width': 1, opacity: 0.45 });
      const lx = box.x + 540, ly = H - 30;
      return g({ class: 'heatmap-missing' },
        gaps.map(c => hatch(at(c).x, at(c).y, cw, ch)),
        el('rect', { x: lx, y: ly - 10, width: 38, height: 20, rx: 2, fill: t.c('surface') }), hatch(lx, ly - 10, 38, 20),
        textLines([`欠測（測定なし。0ではない）：${gapStations.join('・')}の計${gaps.length}か月`], { x: lx + 50, y: ly, size: 16, valign: 'middle', fill: t.c('muted') }));
    },
  });
}

export default {
  study: true,
  id: 'heatmap',
  language: 'ja',
  title: 'Heatmap: values across two categories, gaps kept',
  className: 'st cs-geo-map',
  notes: 'Purpose: Show one measure across two categorical dimensions (here station × month) so seasonal and site patterns read at once.\nModify: Replace `stations`/`readings` with your matrix; use null for anything not measured. Rows re-sort by their observed mean, the peak cell, the scale ceiling and the missing-data legend recompute.\nInvariant: One sequential scale from zero for every cell; missing cells are hatched and labelled as missing, never colored as a low value; the value is printed in each cell.\nStatic: Already static. Supply the table itself alongside the slide when the numbers will be quoted.',
  sources: [{ type: 'original-example', file: 'assets/svg/heatmap.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${leader.name}のPM2.5は${leader.n === months.length ? `${months.length}か月すべて` : `${months.length}か月中${leader.n}か月`}で${rows.length}局中最も高く、<br>${peak.station === leader.name ? '' : `最高値は${peak.station}の`}${peak.month}には月平均${fmt(peak.v, { digits: 1 })} µg/m³に達した</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · ${rows.length}測定局の月平均値（年度：4月〜翌3月）。行は観測月の平均が高い順</span><span>ヒートマップ</span></p>`,
};
