// Template: 四半期業績レビュー（QBR）· 主要指標の一覧表. Synthetic example content; replace data and copy.
// One ruled table: 実績・計画・計画比・前年同期比 and an 8-quarter line per KPI. Every ratio, the miss flag
// and the headline are computed from `kpis`; nothing is typed twice.
import { svgRoot, el, linear, pathFromPoints, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-qbr-kpi-tiles';
const quarters = ['2024年10〜12月', '2025年1〜3月', '2025年4〜6月', '2025年7〜9月', '2025年10〜12月', '2026年1〜3月', '2026年4〜6月', '2026年7〜9月'];
// kind: 'amount' (百万円; ratios are growth rates in %) or 'rate' (%; ratios are differences in pt).
// better: 'up' or 'down' (月次解約率 is better when lower). series = the 8 quarters above, this quarter last.
const kpis = [
  { name: '売上高', kind: 'amount', better: 'up', plan: 2030, series: [1191, 1299, 1411, 1534, 1665, 1803, 1941, 2078] },
  { name: '営業利益', kind: 'amount', better: 'up', plan: 210, series: [88, 104, 121, 150, 162, 178, 196, 238] },
  { name: 'ARR（期末）', kind: 'amount', better: 'up', plan: 8560, series: [4980, 5410, 5880, 6390, 6930, 7490, 8040, 8580] },
  { name: '新規ARR', kind: 'amount', better: 'up', plan: 450, series: [300, 330, 362, 400, 418, 432, 402, 380] },
  { name: '売上継続率（NRR）', kind: 'rate', digits: 1, better: 'up', plan: 111.0, series: [106.0, 107.0, 108.0, 109.0, 110.0, 110.0, 111.0, 112.0] },
  { name: '月次解約率', kind: 'rate', digits: 2, better: 'down', plan: 0.65, series: [0.92, 0.88, 0.84, 0.80, 0.74, 0.70, 0.66, 0.62] },
];
const source = '出所：経営企画部（2026年10月8日時点の速報値）';
const running = '2026年度 第2四半期 業績レビュー';
const page = 2;

// ---- derived
const rows = kpis.map(k => {
  const actual = k.series.at(-1), yearAgo = k.series.at(-5);
  const change = ref => (k.kind === 'amount' ? (actual / ref - 1) * 100 : actual - ref);
  const vsPlan = change(k.plan), vsYear = change(yearAgo);
  const met = k.better === 'up' ? actual >= k.plan : actual <= k.plan;
  return { ...k, actual, vsPlan, vsYear, met };
});
const misses = rows.filter(r => !r.met);
const ja = (v, digits) => fmt(v, { locale: 'ja', digits });
const value = (r, v) => (r.kind === 'amount' ? ja(v, 0) : `${ja(v, r.digits)}<span class="unit">%</span>`);
const delta = (r, v) => (r.kind === 'amount' ? fmt(v, { digits: 1, sign: true, suffix: '%' }) : fmt(v, { digits: r.digits, sign: true, suffix: 'pt' }));

const trend = (r, i) => {
  const W = 270, H = 40, y = linear([Math.min(...r.series), Math.max(...r.series)], [H - 6, 6]);
  const x = linear([0, r.series.length - 1], [4, W - 6]);
  const pts = r.series.map((v, j) => [x(j), y(v)]);
  return svgRoot({
    id: `${ID}-trend-${i}`, width: W, height: H,
    title: `${r.name}の8四半期の推移`,
    desc: `${quarters[0]}から${quarters.at(-1)}まで：${r.series.map(v => (r.kind === 'amount' ? ja(v, 0) : ja(v, r.digits) + '%')).join('、')}`,
  },
  el('path', { d: pathFromPoints(pts), fill: 'none', stroke: 'var(--muted)', 'stroke-width': 1.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }),
  el('circle', { cx: pts.at(-1)[0], cy: pts.at(-1)[1], r: 3.5, fill: r.met ? 'var(--navy)' : 'var(--miss)' }));
};

const body = rows.map((r, i) => `<tr>
    <td class="q-name">${r.name}</td>
    <td class="r q-actual">${value(r, r.actual)}</td>
    <td class="r q-val">${value(r, r.plan)}</td>
    <td class="r q-val${r.met ? '' : ' miss'}">${delta(r, r.vsPlan)}</td>
    <td class="q-flag">${r.met ? '' : '未達'}</td>
    <td class="r q-val">${delta(r, r.vsYear)}</td>
    <td>${trend(r, i)}</td>
  </tr>`).join('');

const miss = misses[0];
const headline = misses.length === 1
  ? `主要${rows.length}指標のうち${rows.length - 1}指標が計画を達成。<span class="nw">${miss.name}のみ</span>計画比<span class="nw">${delta(miss, miss.vsPlan)}</span>で未達となった`
  : `主要${rows.length}指標のうち${rows.length - misses.length}指標が計画を達成し、${misses.map(m => m.name).join('・')}が未達`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Key metrics against plan and last year, one table',
  notes: `Purpose: 主要指標の実績を計画・前年同期と並べ、どれが計画に届かなかったかを1つの表で示す。カードを並べず、上から順に読める表にする。\nModify: kpis に指標を足し引きする（6〜8行まで）。各行は8四半期の実績（今期が最後）、今期計画、kind（金額＝増減率％、比率＝差pt）、better（低いほど良い指標は down）を持つ。計画比・前年同期比・未達の判定・見出し・推移線は自動。quarters と source、running も更新する。\nInvariant: 赤は未達の行の計画比だけに使い、必ず「未達」と書く。▲や▼は使わない（日本の帳票では▲はマイナスを表す）。前年同期比は4四半期前との比較。推移線は形を見るためのもので、縦軸は行ごとに異なると注記する。\nStatic: Already static.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-qbr q-kpi',
  content: `<h1 class="q-head" data-region="title">${headline}</h1>
<p class="q-note q-unit-note g" style="--c:9;--s:4;top:182px" data-region="support">（単位：百万円）</p>
<table class="q-table g" style="--c:1;--s:12;top:214px" data-region="primary">
  <colgroup><col style="width:270px"><col style="width:196px"><col style="width:98px"><col style="width:98px"><col style="width:98px"><col style="width:98px"><col style="width:294px"></colgroup>
  <thead><tr><th>指標</th><th class="r">実績</th><th class="r">計画</th><th class="r">計画比</th><th></th><th class="r">前年同期比</th><th class="r">8四半期の推移</th></tr></thead>
  <tbody>${body}</tbody>
</table>
<p class="q-note g" style="--c:1;--s:12;top:590px" data-region="support">注：計画比・前年同期比は、金額は増減率、比率は差（pt）。月次解約率は四半期の平均で、低いほど良い。推移は${quarters[0]}期から${quarters.at(-1)}期まで、縦軸は指標ごとに異なる。●は今期。</p>
<p class="q-foot" data-region="source"><span>${source}</span><span class="num">${running}　${page}</span></p>`,
};
