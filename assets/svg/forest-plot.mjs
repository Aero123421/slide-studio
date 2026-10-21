// Diagram study · Forest plot — estimates with intervals against a null reference.
// Rows, pooled diamond, the right-hand column and the headline all come from `sites`.
import { forestPlot, fmt } from '../runtime/figure.mjs';

const sites = [ // difference in recovery days, treatment − control, 95% CI (illustrative)
  { label: '札幌 (n = 120)', estimate: -1.8, low: -3.1, high: -0.5, weight: 120 },
  { label: '仙台 (n = 64)', estimate: -0.6, low: -2.4, high: 1.2, weight: 64 },
  { label: '名古屋 (n = 210)', estimate: -2.3, low: -3.2, high: -1.4, weight: 210 },
  { label: '広島 (n = 45)', estimate: 0.4, low: -1.9, high: 2.7, weight: 45 },
  { label: '福岡 (n = 98)', estimate: -1.2, low: -2.6, high: 0.2, weight: 98 },
];
const pooled = { label: '統合推定', estimate: -1.5, low: -2.1, high: -0.9 };
const clear = sites.filter(s => s.high < 0).length;

export function figure(theme = 'css') {
  return forestPlot({
    id: 'forest-plot-fig', theme, width: 1152, height: 478, locale: 'ja',
    title: '施設別の回復日数の差（治療群−対照群）と95%信頼区間',
    desc: `5施設のうち${clear}施設で区間全体が0より小さい。統合推定は${fmt(pooled.estimate, { digits: 1 })}日（${fmt(pooled.low, { digits: 1 })}〜${fmt(pooled.high, { digits: 1 })}）。`,
    rows: sites, summary: pooled, reference: 0, format: { digits: 1 },
    labelTitle: '施設', columnTitle: '差（日） [95% CI]', xLabel: '回復までの日数の差（日）',
    favors: ['治療群で短い', '対照群で短い'], hollowIfCrossing: true,
  });
}

export default {
  study: true,
  id: 'forest-plot',
  language: 'ja',
  title: 'Forest plot: estimates with intervals',
  className: 'st cs-clinical-trial',
  notes: 'Purpose: Compare effect estimates across sites or subgroups with their uncertainty, and show the pooled estimate.\nModify: Replace `sites` and `pooled` with your own analysis output; the hollow markers flag intervals that cross the reference automatically.\nInvariant: One scale and one null reference for every row; interval definition stated in the column title; sample sizes visible; the pooled diamond spans its own interval.\nStatic: Already static. Do not reorder rows by effect size unless the analysis did.',
  sources: [{ type: 'original-example', file: 'assets/svg/forest-plot.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">治療群の回復は平均<em>${fmt(Math.abs(pooled.estimate), { digits: 1 })}日</em>早い。<br><span class="st-quiet">5施設中${clear}施設では、区間全体が0を下回る</span></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 中空の印は区間が0をまたぐ施設</span><span>フォレストプロット</span></p>`,
};
