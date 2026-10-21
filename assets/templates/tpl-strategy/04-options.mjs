// Template: 戦略提案（経営会議向け）· 3案の比較表. Synthetic example content; replace data and copy.
// Quantities are computed from the lever effects and stated as numbers; judgments are scored 0–4
// and drawn as small Harvey balls next to a few words. The recommended column is tinted.
import { fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-strategy-options';
const plan = {year: 2029, op2025: 3.6, volume: 2.4, headwind: -4.4, sales2029: 270, target: 6}; // 億円・%（論点ツリーと同じ前提）
const effect = {'1.1': 3.0, '1.2': 2.2, '2.1': 2.4, '2.2': 1.7, '2.3': 2.6, '2.4': 0.7, '3.1': 2.0, '3.2': 1.2}; // 打ち手別の効果（億円）
const options = [
  {key: 'A', name: '価格と販促の見直し', desc: '値付けと販促だけを見直す',
    levers: ['1.1', '2.1', '3.1', '3.2'], invest: 0.8, payback: {levers: ['1.1', '2.1', '3.1', '3.2']}},
  {key: 'B', name: '店舗と物流の再設計', desc: '受け取り方と物流まで変える', rec: true,
    levers: ['1.1', '1.2', '2.1', '2.2', '2.3', '2.4', '3.1'], invest: 14.0, payback: {levers: ['2.2', '2.3']}},
  {key: 'C', name: '新物流センターの建設', desc: '新センターで全面自動化する',
    levers: ['1.1', '2.1', '3.1'], extra: -0.6, invest: 62.0, payback: {annual: 6.8}}, // extra: 2029年度は稼働半年で償却が先行／annual: 本格稼働後の年間効果
];
const judged = [ // score 0–4（多いほど良い）と短い根拠。評価軸は「良い向き」にそろえる
  {name: '効果が出る早さ', s: [[4, '2027年度から全額'], [3, '2027年度から段階的に'], [1, '本格稼働は2030年度']]},
  {name: '実行のしやすさ', s: [[4, '今の体制で実施できる'], [2, '店舗と物流で準備が要る'], [1, '建設と移転に3年かかる']]},
  {name: '顧客の受け止め', s: [[1, '上位顧客が離れるおそれ'], [3, '店舗で受け取れて便利'], [3, '目に見える変化は小さい']]},
  {name: '2030年度以降の伸びしろ', s: [[1, '2029年度で頭打ち'], [3, '自動化の範囲を広げられる'], [4, '2031年度に20億円規模']]},
];

// ---- derived
const r1 = v => Math.round(v * 10) / 10, f1 = v => fmt(v, {digits: 1});
const sumOf = keys => keys.reduce((s, k) => s + effect[k], 0);
const rows = options.map(o => {
  const op = r1(plan.op2025 + plan.volume + plan.headwind + sumOf(o.levers) + (o.extra || 0));
  const annual = o.payback.annual ?? sumOf(o.payback.levers);
  const years = o.invest / annual;
  return {...o, op, margin: r1(op / plan.sales2029 * 100), years};
});
const rec = rows.find(o => o.rec);
const reach = rows.filter(o => o.margin >= plan.target);
const payText = y => (y < 1 ? '1年未満' : `${f1(y)}年`);

const harvey = (n, id) => {
  const r = 9.5, c = 11, a = n / 4 * 2 * Math.PI - Math.PI / 2;
  const wedge = n <= 0 ? '' : n >= 4 ? `<circle cx="${c}" cy="${c}" r="${r}" fill="var(--st-ink)"/>`
    : `<path d="M${c} ${c} L${c} ${c - r} A${r} ${r} 0 ${n > 2 ? 1 : 0} 1 ${(c + r * Math.cos(a)).toFixed(2)} ${(c + r * Math.sin(a)).toFixed(2)} Z" fill="var(--st-ink)"/>`;
  return `<svg viewBox="0 0 22 22" role="img" aria-labelledby="${id}"><title id="${id}">4段階中${n}</title><circle cx="${c}" cy="${c}" r="${r}" fill="var(--st-paper)" stroke="var(--st-ink)" stroke-width="1.3"/>${wedge}</svg>`;
};
const cls = o => (o.rec ? ' class="is-rec"' : '');
const head = `<tr><th scope="col"></th>${rows.map(o => `<th scope="col"${cls(o)}><b>案${o.key}　${o.name}</b><span>${o.desc}</span></th>`).join('')}</tr>`;
const quant = [
  [`${plan.year}年度の営業利益率`, o => `<span class="q${o.rec ? ' is-key' : ''}">${f1(o.margin)}<small>%</small></span>`],
  [`${plan.year}年度の営業利益`, o => `<span class="q">${f1(o.op)}<small>億円</small></span>`],
  ['必要な投資', o => `<span class="q">${f1(o.invest)}<small>億円</small></span>`],
  ['投資の回収', o => `<span class="q">${payText(o.years).replace(/年(未満)?$/, m => `<small>${m}</small>`)}</span>`],
].map(([name, cell]) => `<tr><th scope="row">${name}</th>${rows.map(o => `<td${cls(o)}>${cell(o)}</td>`).join('')}</tr>`).join('');
const qual = judged.map((j, ji) => `<tr${ji === 0 ? ' class="st-gap"' : ''}><th scope="row">${j.name}</th>${j.s.map(([n, t], i) => `<td${cls(rows[i])}><span class="hb">${harvey(n, `${ID}-h${ji}${i}`)}${t}</span></td>`).join('')}</tr>`).join('');

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Options compared: three ways to reach the profit target',
  notes: 'Purpose: 実現手段の3案を同じ評価軸で並べ、推奨案がどこで優れ、どこで劣るかを隠さずに見せる。\nModify: effect（打ち手別の効果）、options（含む打ち手・投資・回収の計算方法）、judged（4段階の評価と根拠）を差し替える。営業利益・利益率・回収年数は自動で計算される。rec: true の列が網掛けになる。見出しの改行は <br> で文や句の切れ目に入れる。\nInvariant: 評価軸はすべて「●ほど良い」の向きにそろえる。数値で言えるものは数値で書き、評価記号には必ず短い根拠を添える。推奨案の弱点も残す。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-strategy st-options',
  content: `<h1 class="st-title" data-region="title">${plan.year}年度に${plan.target}%へ届くのは${reach.length === 1 ? `案${reach[0].key}だけ` : `${reach.length}案`}。<br>投資${fmt(rec.invest)}億円は${payText(rec.years)}で回収できる</h1>
<table class="st-opt" data-region="primary">
  <colgroup><col class="c0"><col><col><col></colgroup>
  <thead>${head}</thead>
  <tbody>${quant}${qual}</tbody>
</table>
<div class="st-foot" data-region="source"><p>注：営業利益＝2025年度実績${f1(plan.op2025)}億円＋売上の伸び${f1(plan.volume)}−運賃・人件費の上昇${f1(-plan.headwind)}＋各案の効果。投資の回収＝投資額÷投資による年間効果<br>評価は4段階（●が最も良い）。案Cの${plan.year}年度は新センターの稼働が半年で、償却費が先行する</p><p>EC事業の収益改善<b>4</b></p></div>`,
};
