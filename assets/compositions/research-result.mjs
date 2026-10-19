// Composition study · Research result — the estimate, its interval and its conditions side by side.
// An estimation plot: every specimen on the left, the difference with its 95% interval on the
// right, against a declared equivalence margin. Verdicts and the headline come from `groups`.
import { svgRoot, el, g, textLines, linear, mean, sd, tQuantile, beeswarm, fmt, theme as makeTheme } from '../runtime/figure.mjs';

// 28-day compressive strength, MPa: 40×40×160 mm prisms, 6 half-prism results per group (illustrative).
const groups = [
  { temp: 5, control: [44.1, 45.3, 43.2, 44.8, 46.0, 43.6], glass: [39.4, 40.6, 38.7, 40.1, 41.2, 39.0] },
  { temp: 20, control: [52.4, 51.1, 53.0, 52.7, 50.9, 52.2], glass: [51.6, 52.3, 50.8, 51.9, 52.8, 50.6] },
  { temp: 35, control: [54.9, 56.2, 55.4, 54.1, 55.8, 56.0], glass: [57.1, 55.8, 58.2, 56.6, 57.5, 56.0] },
];
const margin = 0.05; // equivalence: within ±5% of the control mean
const nb = text => `<span class="nw">${text}</span>`; // keep a number with its label
const conditions = [
  ['供試体', `40×40×160 mm角柱、${nb('各群 n = 6')}`],
  ['配合', `${nb('水結合材比0.50')}、${nb('砂結合材比3.0')}`],
  ['置換', 'セメント質量の20%を廃ガラス粉末に'],
  ['養生', `封かん、${nb('5・20・35 ℃')}で28日`],
  ['試験', `${nb('JIS R 5201')}に準拠した圧縮強度`],
  ['区間', '平均の差の95%信頼区間（Welch）'],
  ['同等の幅', '従来配合の平均の±5%以内'],
];

// Welch interval for glass − control, and a verdict against the margin.
const rows = groups.map(gp => {
  const a = gp.control, b = gp.glass, va = sd(a) ** 2 / a.length, vb = sd(b) ** 2 / b.length, se = Math.sqrt(va + vb);
  const df = (va + vb) ** 2 / (va ** 2 / (a.length - 1) + vb ** 2 / (b.length - 1)), w = tQuantile(0.975, df) * se;
  const d = mean(b) - mean(a), m = margin * mean(a), lo = d - w, hi = d + w;
  const verdict = hi < -m ? '低い' : lo > m ? '高い' : lo >= -m && hi <= m ? '同等' : '判定不能';
  return { ...gp, d, lo, hi, m, verdict };
});
const low = rows.filter(r => r.verdict === '低い'), same = rows.filter(r => r.verdict === '同等');
const f1 = (v, sign = false) => fmt(v, { digits: 1, sign });
const temps = list => list.map(r => `${r.temp} ℃`).join('と');

function figure(theme = 'css') {
  const t = makeTheme(theme), W = 810, H = 420, top = 40, bottom = 44;
  const xr = linear([37, 60], [168, 444]), xd = linear([-8, 4], [528, 744]);
  const axisY = H - bottom + 4;
  const band = (H - top - bottom) / rows.length, cy = i => top + band * (i + 0.5);
  // Specimens dodge vertically (beeswarm) so equal strengths stay countable.
  const dots = (vals, y, hollow) => beeswarm(vals.map(xr), { r: 4.5, gap: 0.6 }).map(p => el('circle', { cx: p.x, cy: y + p.y, r: 4.5, fill: hollow ? t.c('paper') : t.c('ink'), stroke: t.c('ink'), 'stroke-width': 1.4 }));
  const tick = (v, y) => el('line', { x1: xr(v), x2: xr(v), y1: y - 11, y2: y + 11, stroke: t.c('ink'), 'stroke-width': 2.5 });
  return svgRoot({ id: 'composition-research-result-fig', width: W, height: H, theme: t,
    title: '養生温度別の28日圧縮強度：供試体の値と、ガラス粉末配合と従来配合の差の95%信頼区間',
    desc: rows.map(r => `${r.temp} ℃：差 ${f1(r.d, true)} MPa（95%CI ${f1(r.lo)}〜${f1(r.hi)}）、${r.verdict}`).join('。') + '。' },
  textLines(['28日圧縮強度（MPa）'], { x: 168, y: 12, size: 16, fill: t.c('muted'), weight: 600 }),
  textLines(['差：ガラス粉末 − 従来（MPa）'], { x: 528, y: 12, size: 16, fill: t.c('muted'), weight: 600 }),
  // Two separate axes with their own baselines: strength on the left, difference on the right.
  el('line', { x1: xr(37), x2: xr(60), y1: axisY, y2: axisY, stroke: t.c('rule') }),
  el('line', { x1: xd(-8), x2: xd(4), y1: axisY, y2: axisY, stroke: t.c('rule') }),
  [40, 45, 50, 55, 60].map(v => g({}, el('line', { x1: xr(v), x2: xr(v), y1: top - 8, y2: axisY, stroke: t.c('grid') }),
    textLines([String(v)], { x: xr(v), y: H - bottom + 14, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }))),
  [-8, -4, 0, 4].map(v => textLines([fmt(v, { sign: true })], { x: xd(v), y: H - bottom + 14, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } })),
  rows.map((r, i) => {
    const y = cy(i), hot = r.verdict === '低い', c = hot ? t.c('accent') : t.c('ink');
    return g({},
      textLines([`${r.temp} ℃`], { x: 0, y, size: 20, valign: 'middle', weight: 700, fill: t.c('ink') }),
      textLines(['従来'], { x: 150, y: y - 17, size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted') }),
      textLines(['ガラス粉末'], { x: 150, y: y + 17, size: 16, anchor: 'end', valign: 'middle', fill: t.c('muted') }),
      dots(r.control, y - 17, true), tick(mean(r.control), y - 17),
      dots(r.glass, y + 17, false), tick(mean(r.glass), y + 17),
      el('rect', { x: xd(-r.m), y: y - band / 2 + 6, width: xd(r.m) - xd(-r.m), height: band - 12, fill: t.c('surface') }),
      el('line', { x1: xd(0), x2: xd(0), y1: y - band / 2, y2: y + band / 2, stroke: t.c('ink'), 'stroke-width': 1.4 }),
      el('line', { x1: xd(r.lo), x2: xd(r.hi), y1: y + 8, y2: y + 8, stroke: c, 'stroke-width': 3, 'stroke-linecap': 'round' }),
      el('circle', { cx: xd(r.d), cy: y + 8, r: 7, fill: c, stroke: t.c('paper'), 'stroke-width': 2 }),
      textLines([`${f1(r.d, true)}（${f1(r.lo)}〜${f1(r.hi)}）`], { x: Math.min(Math.max(xd(r.d), 592), 690), y: y - 16, size: 16, anchor: 'middle', valign: 'middle', fill: c, weight: hot ? 700 : 400, halo: t.c('surface'), attrs: { 'font-variant-numeric': 'tabular-nums' } }),
      textLines([r.verdict], { x: 764, y: y + 8, size: 18, valign: 'middle', fill: c, weight: 700 }));
  }));
}

export default {
  study: true,
  id: 'composition-research-result',
  language: 'ja',
  title: 'Research result: estimate, interval and test conditions side by side',
  className: 'st cs-materials-lab cmp-research-result',
  notes: `Purpose: Report one experimental result so that the effect, its uncertainty and the conditions it holds under are read together: raw specimens, the difference with its interval, a declared equivalence margin, and the test conditions at the same type size as the figure.\nModify: Replace \`groups\` with your raw measurements and \`conditions\` with the actual protocol; the intervals (Welch), the verdicts against \`margin\` and the headline recompute (now ${rows.map(r => `${r.temp} ℃ ${r.verdict}`).join(', ')}). Change the interval or margin only to what the analysis plan states.\nInvariant: Every specimen is visible; the difference has its own axis with zero drawn; the margin is shaded and stated; the accent marks only the condition that differs; conditions are a full column, not a footnote; the data are labelled illustrative.\nStatic: Already static.`,
  sources: [{ type: 'original-example', file: 'assets/compositions/research-result.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" data-region="title">ガラス粉末モルタルは${temps(same)}の養生で従来と同等。<em>${temps(low)}では28日強度が${f1(-low[0].d)} MPa低い</em></h1>
<p class="st-dek rr-dek" data-region="support">セメントの20%を廃ガラス粉末に置き換えた配合。点は供試体、縦線は平均。右は差と95%信頼区間、網かけは同等とみなす幅。</p>
<figure class="rr-fig" data-region="primary">${figure()}</figure>
<div class="rr-rail" data-region="support"><p class="rr-rail-head">試験条件</p>${conditions.map(([k, v]) => `<p class="rr-item"><b>${k}</b><span>${v}</span></p>`).join('')}</div>
<p class="st-source" data-region="source"><span>架空のデータ · 社内試験、2026年9〜10月</span><span>推定値と95%信頼区間（エスティメーション・プロット）</span></p>`,
};
