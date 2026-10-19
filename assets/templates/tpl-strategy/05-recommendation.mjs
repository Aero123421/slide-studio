// Template: 戦略提案（経営会議向け）· 推奨案と営業利益のブリッジ. Synthetic example content; replace data and copy.
// Bridge from the 2025 actual to the 2029 plan with the figure engine's waterfallChart: the plan's
// levers take the accent, market effects stay grey, totals are ink and summed by the engine.
import { waterfallChart, el, textLines, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-strategy-recommendation';
const option = {key: 'B', name: '店舗と物流の再設計', invest: 14.0, linked: [1.7, 2.6]}; // 推奨案：投資（億円）と投資による年間効果（2.2・2.3）
const sales = {from: 240, to: 270};               // 売上高（億円）：2025年度実績、2029年度計画
const steps = [                                   // 億円。kind: total（合計）／plan（打ち手）／market（外部要因）
  {label: ['2025年度', '実績'], v: 3.6, kind: 'total'},
  {label: ['売上の', '伸び'], v: 2.4, kind: 'market'},
  {label: ['粗利率の', '改善'], v: 5.2, kind: 'plan', levers: '1.1・1.2'},
  {label: ['物流費の', '削減'], v: 7.4, kind: 'plan', levers: '2.1〜2.4'},
  {label: ['販促費の', '見直し'], v: 2.0, kind: 'plan', levers: '3.1'},
  {label: ['運賃・人件費', 'の上昇'], v: -4.4, kind: 'market'},
  {label: ['2029年度', '計画'], kind: 'total'},  // 値は自動で合計
];
const conditions = [                              // 実現の条件：期限と内容（ロードマップと同じ日付）
  {when: '2027年4月', what: '送料無料ラインを4,980円に改定する'},
  {when: '2028年3月', what: '店舗受け取りを全118店に広げる'},
  {when: '2028年10月', what: '物流センターの自動仕分けを本稼働させる'},
];

// ---- derived (the final total is summed by the engine, never typed)
const r1 = v => Math.round(v * 10) / 10, f1 = v => fmt(v, {digits: 1});
const start = steps[0].v;
const end = r1(steps.reduce((t, s) => t + (s.kind === 'total' ? 0 : s.v), start));
const margin = {from: r1(start / sales.from * 100), to: r1(end / sales.to * 100)};
const planSum = r1(steps.filter(s => s.kind === 'plan').reduce((t, s) => t + s.v, 0));
const signed = v => (v < 0 ? `−${f1(-v)}` : `+${f1(v)}`);
const payback = option.invest / option.linked.reduce((t, v) => t + v, 0); // 3.3年（比較表と同じ式）
const label = s => s.label.join('\n');                                   // 2行の項目名（改行位置を指定）
let run = 0;
const peak = Math.max(...steps.map(s => (run = s.kind === 'total' ? (s.v ?? run) : run + s.v)));     // 積み上げの最大値（20.6）

// ---- figure (858 × 400 = columns 1–9). Baseline, margins and lever numbers are added via extra().
const W = 858, H = 400;
const svg = waterfallChart({
  id: `${ID}-bridge`, width: W, height: H, fontSize: 18, locale: 'ja', format: {digits: 1}, domain: [0, Math.ceil(peak)],
  title: '営業利益の増減：2025年度実績から2029年度計画へ（億円）',
  desc: `2025年度実績${f1(start)}億円（利益率${f1(margin.from)}%）。${steps.slice(1, -1).map(s => `${s.label.join('')} ${signed(s.v)}`).join('、')}。2029年度計画${f1(end)}億円（利益率${f1(margin.to)}%）。打ち手による改善は計${f1(planSum)}億円。`,
  data: steps.map(s => ({label: label(s), value: s.kind === 'total' ? (s.v ?? undefined) : s.v, total: s.kind === 'total'})),
  highlight: steps.filter(s => s.kind === 'plan').map(label),
  extra: ({x, y, box}) => el('line', {x1: box.x, x2: box.x + box.w, y1: y(0), y2: y(0), stroke: 'var(--st-ink)', 'stroke-width': 1}) + steps.map((s, i) => {
    const sub = s.kind === 'total' ? `利益率 ${f1(i === 0 ? margin.from : margin.to)}%` : s.levers;
    return sub ? textLines([sub], {x: x.center(label(s)), y: box.y + box.h + 68, anchor: 'middle', cls: 'sv-b'}) : '';
  }).join(''),
});

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Recommendation and operating-profit bridge to 2029',
  notes: 'Purpose: 推奨案を1つに絞って言い切り、営業利益が2025年度の実績から2029年度の計画までどう積み上がるかを示す。\nModify: option（推奨案）、sales（売上高）、steps（増減要因と金額、kind、2行の項目名）、conditions（実現の条件と期限）を差し替える。最後の合計は図のエンジン（waterfallChart）が積み上げ、利益率と見出しの数値も自動で計算される。kind: plan の項目が強調色になる。見出しの改行は <br> で文や句の切れ目に入れる。\nInvariant: 合計＝前の合計＋増減の和（入力で上書きしない）。外部要因（売上の伸び・コスト上昇）は灰色、打ち手は強調色に分け、マイナスの要因も必ず載せる。条件の日付はロードマップと一致させる。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-strategy st-rec',
  content: `<h1 class="st-title" data-region="title">案${option.key}を推奨する。<br>2029年度の営業利益は${f1(end)}億円、利益率は${f1(margin.to)}%になる</h1>
<p class="st-exh">営業利益の増減<span>億円、2025年度実績→2029年度計画</span></p>
<figure class="st-fig" style="left:64px;top:200px;width:${W}px;height:${H}px" data-region="primary">${svg}</figure>
<p class="st-cond-h">実現の条件</p>
<ol class="st-cond" data-region="support">${conditions.map(c => `<li><b>${c.when}まで</b>${c.what}</li>`).join('')}
  <li><b>投資</b>${f1(option.invest)}億円。${f1(payback)}年で回収する</li></ol>
<div class="st-foot" data-region="source"><p>注：売上高は${sales.from}億円から${sales.to}億円へ（年3%）。運賃は年4%、人件費は年3%の上昇を見込む。番号は論点ツリーの打ち手<br>出典：青柳リビング EC事業部門の管理会計（2025年度）、白峰パートナーズ分析</p><p>EC事業の収益改善<b>5</b></p></div>`,
};
