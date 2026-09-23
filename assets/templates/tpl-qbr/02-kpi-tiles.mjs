// Template: 四半期業績レビュー（QBR）· KPIタイル（スパークライン付き）. Synthetic example content; replace data and copy.
// Each KPI is one object: 8 quarters of history, the plan for this quarter and whether higher is better.
const P = 'tpl-qbr-kpi-tiles';
const quarters = ['24/Q3', '24/Q4', '25/Q1', '25/Q2', '25/Q3', '25/Q4', '26/Q1', '26/Q2'];
const kpis = [
  {name: '売上高', unit: '億円', dp: 1, s: [11.9, 12.6, 13.8, 14.8, 15.6, 16.4, 17.3, 18.4], plan: 18.0, better: 'up', kind: 'ratio'},
  {name: '営業利益率', unit: '%', dp: 1, s: [7.2, 8.1, 9.4, 10.9, 11.3, 11.9, 12.2, 12.8], plan: 12.5, better: 'up', kind: 'pt'},
  {name: 'ARR', unit: '億円', dp: 1, s: [48.2, 51.0, 54.3, 57.9, 61.6, 64.8, 67.9, 71.2], plan: 70.5, better: 'up', kind: 'ratio'},
  {name: '新規ARR', unit: '億円', dp: 1, s: [3.2, 3.5, 3.9, 4.2, 4.6, 4.8, 4.3, 4.1], plan: 4.5, better: 'up', kind: 'ratio'},
  {name: '月次解約率', unit: '%', dp: 2, s: [0.92, 0.88, 0.84, 0.80, 0.74, 0.70, 0.66, 0.62], plan: 0.65, better: 'down', kind: 'pt'},
  {name: '売上継続率（NRR）', unit: '%', dp: 0, s: [104, 105, 107, 108, 109, 110, 111, 112], plan: 111, better: 'up', kind: 'pt'}
];

const tileW = (1100 - 2 * 20) / 3, sw = Math.round(tileW - 44), sh = 62;
const fmt = (v, dp) => v.toFixed(dp);
const delta = (k, ref) => {                      // returns {text, good}
  const cur = k.s.at(-1);
  const d = k.kind === 'ratio' ? (cur / ref - 1) * 100 : cur - ref;
  const good = k.better === 'up' ? d >= 0 : d <= 0;
  const sign = d > 0 ? '+' : d < 0 ? '−' : '±';
  const text = k.kind === 'ratio' ? `${sign}${Math.abs(d).toFixed(1)}%` : `${sign}${Math.abs(d).toFixed(k.dp === 2 ? 2 : 1)}pt`;
  return {text, good, arrow: d > 0 ? '▲' : d < 0 ? '▼' : '―'};
};
const spark = (k, i) => {
  const min = Math.min(...k.s, k.plan), max = Math.max(...k.s, k.plan), pad = (max - min) * 0.14;
  const x = j => 6 + j * (sw - 12) / (k.s.length - 1), y = v => sh - 8 - (v - min + pad) / (max - min + 2 * pad) * (sh - 16);
  const line = k.s.map((v, j) => `${j ? 'L' : 'M'}${x(j).toFixed(1)} ${y(v).toFixed(1)}`).join('');
  const good = delta(k, k.plan).good;
  const c = good ? '#2c64f0' : '#e2553d';
  const id = `${P}-g${i}`;
  return `<svg viewBox="0 0 ${sw} ${sh}" style="width:${sw}px" role="img" aria-labelledby="${id}-t"><title id="${id}-t">${k.name}の8四半期推移（${quarters[0]}〜${quarters.at(-1)}）: ${k.s.map(v => fmt(v, k.dp)).join('、')}。今期計画 ${fmt(k.plan, k.dp)}</title>
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".22"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient></defs>
    <path d="${line}L${x(k.s.length - 1).toFixed(1)} ${sh}L${x(0)} ${sh}Z" fill="url(#${id})"/>
    <line x1="${x(k.s.length - 2).toFixed(1)}" x2="${(sw - 2).toFixed(1)}" y1="${y(k.plan).toFixed(1)}" y2="${y(k.plan).toFixed(1)}" stroke="#0d1b2e" stroke-width="1.4" stroke-dasharray="3 3"/>
    <path d="${line}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
    ${k.s.map((v, j) => j < k.s.length - 1 ? `<circle cx="${x(j).toFixed(1)}" cy="${y(v).toFixed(1)}" r="2" fill="${c}" opacity=".55"/>` : '').join('')}
    <circle cx="${x(k.s.length - 1).toFixed(1)}" cy="${y(k.s.at(-1)).toFixed(1)}" r="5" fill="#fff" stroke="${c}" stroke-width="2.6"/>
  </svg>`;
};
const tiles = kpis.map((k, i) => {
  const vsPlan = delta(k, k.plan), vsYear = delta(k, k.s.at(-5));
  const badge = (lab, d) => `<span class="q-badge ${d.good ? 'pos' : 'neg'}"><span>${lab}</span>${d.arrow} ${d.text}</span>`;
  return `<div class="q-card q-tile${vsPlan.good ? '' : ' is-alert'}">
    <div class="q-tl">${k.name}<span>計画 ${fmt(k.plan, k.dp)}${k.unit}</span></div>
    <p class="q-v">${fmt(k.s.at(-1), k.dp)}<small>${k.unit}</small></p>
    <div class="q-d">${badge('計画比', vsPlan)}${badge('前年比', vsYear)}</div>
    ${spark(k, i)}
  </div>`;
}).join('');
const miss = kpis.filter(k => !delta(k, k.plan).good).map(k => k.name);

const dialMini = `<svg viewBox="0 0 40 40" role="img" aria-labelledby="${P}-dial"><title id="${P}-dial">四半期ダイヤル：第2四半期（7〜9月）</title>${[1, 2, 3, 4].map(k => {
  const a0 = -Math.PI / 2 + (k - 1) * Math.PI / 2 + 0.08, a1 = a0 + Math.PI / 2 - 0.16, p = (r, a) => `${(20 + r * Math.cos(a)).toFixed(2)} ${(20 + r * Math.sin(a)).toFixed(2)}`;
  const d = `M${p(19, a0)} A19 19 0 0 1 ${p(19, a1)} L${p(11, a1)} A11 11 0 0 0 ${p(11, a0)}Z`;
  return k === 1 ? `<path d="${d}" fill="#3b5480"/>` : k === 2 ? `<path d="${d}" fill="#2c64f0"/>` : `<path d="${d}" fill="none" stroke="#3b5480" stroke-width="1.2"/>`;
}).join('')}</svg>`;

export default {
  study: true,
  id: 'tpl-qbr-kpi-tiles',
  title: 'KPIタイル — 8四半期の推移と計画比',
  language: 'ja',
  notes: 'Purpose: 主要KPI 6つの今期値・計画比・前年比・推移を一覧し、未達の指標を一目で示す。\nModify: kpis 配列に8四半期の値・今期計画・良い方向（better）を入れる。バッジの符号と色、赤枠は自動で決まる。\nInvariant: 解約率のように「下がるのが良い」指標は better:\'down\' で色を反転。前年比は4四半期前との比較。スパークラインは形を見るもので、値はタイルの数字で読む。\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-qbr q-kpi',
  content: `<div class="q-wrap">
  <div class="q-rail">${dialMini}<p class="q-sec">KPI概況</p><p class="q-pg"><b>02</b>/ 06</p></div>
  <div class="q-top"><span>FY2026 Q2 業績レビュー ・ ハルニレ・クラウド</span><span class="q-chip"><i></i>7–9月 実績</span></div>
  <h1 class="q-title" data-region="title">売上と利益率は計画を上回る一方、<em class="q-neg">新規ARRは2四半期続けて未達</em></h1>
  <p class="q-sub" data-region="support">未達は${miss.join('・')}のみ。失速の主因は商談化率の低下で、既存顧客の拡大が売上を支えている。</p>
  <div class="q-tiles" data-region="primary">${tiles}</div>
  <p class="q-source" data-region="source">例示データ · 点線＝今期計画、推移は ${quarters[0]}〜${quarters.at(-1)} の8四半期</p>
</div>`
};
