// Template: 学会・研究発表 · 結果（信頼区間付きの図）. Synthetic example content; replace data and copy.
const ID = 'tpl-research-ja-result';
// One source of truth: mean and SD of mIoU (%) over 5 independent training runs (seeds) per condition
const labels = [10, 25, 50, 100, 200];
const runs = 5, tCrit = 2.776; // t(0.975, df = 4)
const series = [
  { key: 'base', name: '教師ありのみ', color: '#7d828c', mark: 'open', mean: [38.2, 47.9, 54.6, 60.3, 64.8], sd: [3.1, 2.6, 2.2, 1.7, 1.3] },
  { key: 'pre', name: '事前学習のみ', color: '#2a63a8', mark: 'square', mean: [49.5, 56.8, 61.9, 65.4, 68.1], sd: [2.8, 2.1, 1.8, 1.4, 1.1] },
  { key: 'prop', name: '提案法', color: '#b2432a', mark: 'dot', mean: [53.1, 60.7, 66.1, 68.9, 70.4], sd: [2.6, 1.9, 1.5, 1.2, 0.9] }
];
const full = { n: 2400, mean: 71.8, sd: 0.6 };
const focusN = 50;
const ci = (m, sd) => { const h = tCrit * sd / Math.sqrt(runs); return [m - h, m + h]; };
const f1 = v => v.toFixed(1);
const signed = v => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1);

// geometry
const P = { x0: 60, x1: 616, y0: 64, y1: 398 }, Y = { min: 30, max: 75 };
const lx = n => P.x0 + 18 + (Math.log10(n) - Math.log10(labels[0])) / (Math.log10(labels.at(-1)) - Math.log10(labels[0])) * (P.x1 - P.x0 - 36);
const ly = v => P.y1 - (v - Y.min) / (Y.max - Y.min) * (P.y1 - P.y0);
const dodge = { base: -9, pre: 0, prop: 9 };
const C = { ink: '#1c2433', mute: '#5b6271', grid: '#e2dccd', paper: '#f6f3ea' };

let g = '';
for (let v = Y.min; v <= 70; v += 10) g += `<line x1="${P.x0}" y1="${ly(v)}" x2="${P.x1}" y2="${ly(v)}" stroke="${C.grid}" stroke-width="1"/><text x="${P.x0 - 12}" y="${ly(v) + 5}" text-anchor="end" class="s-axis">${v}</text>`;
g += `<line x1="${P.x0}" y1="${P.y1}" x2="${P.x1}" y2="${P.y1}" stroke="${C.ink}" stroke-width="1.2"/>`;
labels.forEach(n => { g += `<line x1="${lx(n)}" y1="${P.y1}" x2="${lx(n)}" y2="${P.y1 + 6}" stroke="${C.ink}" stroke-width="1.2"/><text x="${lx(n)}" y="${P.y1 + 26}" text-anchor="middle" class="s-axis">${n}</text>`; });
// focus band at the main condition
const fx = lx(focusN);
const focus = `<rect x="${fx - 26}" y="${P.y0 - 8}" width="52" height="${P.y1 - P.y0 + 8}" fill="#ece5d4"/><text x="${fx}" y="${P.y0 - 14}" text-anchor="middle" class="s-lab-s">主条件</text>`;
// full-label reference with its own CI band
const [fl, fh] = ci(full.mean, full.sd);
const ref = `<rect x="${P.x0}" y="${ly(fh)}" width="${P.x1 - P.x0}" height="${ly(fl) - ly(fh)}" fill="#1c2433" fill-opacity=".08"/>
<line x1="${P.x0}" y1="${ly(full.mean)}" x2="${P.x1}" y2="${ly(full.mean)}" stroke="${C.ink}" stroke-width="1.4" stroke-dasharray="6 4"/>
<text x="${P.x0 + 10}" y="${ly(fh) - 8}" class="s-lab">全ラベル（${full.n.toLocaleString('ja-JP')}枚）で学習：<tspan class="s-num-b">${f1(full.mean)}</tspan>%</text>`;
function marker(s, x, y) {
  if (s.mark === 'square') return `<rect x="${x - 5.5}" y="${y - 5.5}" width="11" height="11" fill="${s.color}" stroke="${C.paper}" stroke-width="2"/>`;
  if (s.mark === 'open') return `<circle cx="${x}" cy="${y}" r="5.5" fill="${C.paper}" stroke="${s.color}" stroke-width="2"/>`;
  return `<circle cx="${x}" cy="${y}" r="6.5" fill="${s.color}" stroke="${C.paper}" stroke-width="2"/>`;
}
// end labels: keep target order, push apart to a minimum gap, and draw a leader to each line end
const ends = series.map(s => ({ s, y: ly(s.mean.at(-1)), x: lx(labels.at(-1)) + dodge[s.key] })).sort((a, b) => a.y - b.y);
const minGap = 24;
ends.forEach((e, i) => { e.ly = i === 0 ? e.y : Math.max(e.y, ends[i - 1].ly + minGap); });
const shift = Math.max(0, ends.at(-1).ly - P.y1); ends.forEach(e => { e.ly -= shift; });
const endLabel = Object.fromEntries(ends.map(e => [e.s.key, `<path d="M${e.x + 9},${e.y} L${P.x1 + 10},${e.y} L${P.x1 + 20},${e.ly}" fill="none" stroke="#9aa0a9" stroke-width="1"/><text x="${P.x1 + 26}" y="${e.ly + 5}" class="s-lab-b">${e.s.name}</text>`]));
const marks = series.map(s => {
  const pts = labels.map((n, i) => [lx(n) + dodge[s.key], ly(s.mean[i])]);
  const line = `<polyline points="${pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round"${s.key === 'base' ? ' stroke-dasharray="5 4"' : ''}/>`;
  const bars = labels.map((n, i) => { const [lo, hi] = ci(s.mean[i], s.sd[i]); const x = pts[i][0]; return `<line x1="${x}" y1="${ly(hi)}" x2="${x}" y2="${ly(lo)}" stroke="${s.color}" stroke-width="1.6"/><line x1="${x - 4}" y1="${ly(hi)}" x2="${x + 4}" y2="${ly(hi)}" stroke="${s.color}" stroke-width="1.6"/><line x1="${x - 4}" y1="${ly(lo)}" x2="${x + 4}" y2="${ly(lo)}" stroke="${s.color}" stroke-width="1.6"/>`; }).join('');
  const dots = pts.map(([x, y]) => marker(s, x, y)).join('');
  return `<g>${line}${bars}${dots}${endLabel[s.key]}</g>`;
}).join('');
const legend = series.map((s, i) => { const x = 8 + i * 150; return `${marker(s, x + 6, 12)}<text x="${x + 20}" y="17" class="s-lab">${s.name}</text>`; }).join('')
  + `<line x1="470" y1="4" x2="470" y2="20" stroke="${C.ink}" stroke-width="1.6"/><line x1="466" y1="4" x2="474" y2="4" stroke="${C.ink}" stroke-width="1.6"/><line x1="466" y1="20" x2="474" y2="20" stroke="${C.ink}" stroke-width="1.6"/><text x="484" y="17" class="s-lab">95%信頼区間</text>`;

const chart = `<svg viewBox="0 0 800 460" role="img" aria-labelledby="${ID}-t ${ID}-d">
<title id="${ID}-t">ラベル枚数とmIoUの関係（95%信頼区間付き）</title>
<desc id="${ID}-d">横軸はラベル付き画像の枚数（対数目盛、10〜200枚）、縦軸はmIoU（%）。3手法とも枚数とともに上昇し、提案法は全条件で最も高い。${focusN}枚では提案法${f1(series[2].mean[labels.indexOf(focusN)])}%、事前学習のみ${f1(series[1].mean[labels.indexOf(focusN)])}%、教師ありのみ${f1(series[0].mean[labels.indexOf(focusN)])}%。破線は全${full.n}枚で学習した場合の${f1(full.mean)}%。誤差棒は5シードの平均値の95%信頼区間。</desc>
${legend}
${focus}${g}${ref}${marks}
<text x="${(P.x0 + P.x1) / 2}" y="${P.y1 + 54}" text-anchor="middle" class="s-axis-t">ラベル付き画像の枚数（対数目盛）</text>
<text x="${P.x0 - 44}" y="${P.y0 - 14}" class="s-axis-t">mIoU（%）</text>
</svg>`;

const i50 = labels.indexOf(focusN);
const [pl, ph] = ci(series[2].mean[i50], series[2].sd[i50]);
const rows = [
  ['全ラベル学習との差', series[2].mean[i50] - full.mean],
  ['事前学習のみとの差', series[2].mean[i50] - series[1].mean[i50]],
  ['教師ありのみとの差', series[2].mean[i50] - series[0].mean[i50]]
].map(([k, v]) => `<dt>${k}</dt><dd>${signed(v)} <small>pt</small></dd>`).join('');

export default {
  study: true,
  id: ID,
  title: '結果：ラベル50枚で全ラベル学習との差は5.7ポイント',
  language: 'ja',
  notes: 'Purpose: 主結果を信頼区間付きで示し、主条件（50枚）の値と比較対象との差を読み取れるようにする。\nModify: series の mean と sd（シードごとの標本標準偏差）、runs と tCrit（自由度 runs−1 の t 値）、full、focusN を書き換える。誤差棒・読み取り値・説明文はすべて同じ配列から計算される。\nInvariant: 誤差棒の定義（何の区間か・何回の試行か・計算法）を図の横に明記する。差は平均値の差であり、差の信頼区間ではないことを混同しない。対数目盛であることを軸名に書く。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-research-ja rj-result',
  content: `<div class="rj-page">
<header class="rj-head"><span class="rj-sec"><span class="rj-secno">§3</span><b>結果</b></span><span>構造物画像解析シンポジウム 2026　口頭発表 B-3</span></header>
<h1 class="rj-title" data-region="title">ラベル${focusN}枚で、全ラベル学習との差は${Math.abs(series[2].mean[i50] - full.mean).toFixed(1)}ポイントまで縮まる</h1>
<figure class="rj-fig" style="left:64px;top:158px;width:800px;height:460px" data-region="primary">${chart}</figure>
<div class="rj-read" data-region="support">
  <div class="rj-k">提案法・ラベル${focusN}枚の mIoU</div>
  <div class="rj-big">${f1(series[2].mean[i50])}<small>%</small></div>
  <div class="rj-ci">95%CI［${f1(pl)}, ${f1(ph)}］</div>
  <dl>${rows}</dl>
</div>
<p class="rj-def" data-region="support"><b>誤差棒の定義</b>　乱数シードだけを変えた${runs}回の独立学習について、平均値の95%信頼区間を示す（t分布・自由度${runs - 1}：平均 ± ${tCrit}×SD／√${runs}）。評価画像600枚は全条件で共通。差はいずれも平均値の差。</p>
<footer class="rj-foot" data-region="source"><span>架空データによる例示</span><span class="rj-folio">4 / 6</span></footer>
</div>`
};
