// Template: 戦略提案（経営会議向け）· 推奨案と営業利益のブリッジ. Synthetic example content; replace data and copy.
// Bridge from the 2025 actual to the 2029 plan: market effects in grey, the plan's levers in the
// accent, totals in ink. Running totals, margins and the headline come from `steps`.
import { el, textLines, linear, band, fmt } from '../../runtime/figure.mjs';

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

// ---- derived: running totals (the last total is the sum, never typed)
const r1 = v => Math.round(v * 10) / 10, f1 = v => fmt(v, {digits: 1});
let run = 0;
const bars = steps.map((s, i) => {
  if (s.kind === 'total') { const v = i === 0 ? s.v : r1(run); run = v; return {...s, v, lo: 0, hi: v}; }
  const lo = run; run = r1(run + s.v); return {...s, lo: Math.min(lo, run), hi: Math.max(lo, run), from: lo, to: run};
});
const start = bars[0].v, end = bars.at(-1).v;
const margin = {from: r1(start / sales.from * 100), to: r1(end / sales.to * 100)};
const planSum = r1(steps.filter(s => s.kind === 'plan').reduce((t, s) => t + s.v, 0));
const signed = v => (v < 0 ? `−${f1(-v)}` : `+${f1(v)}`);
const payback = option.invest / option.linked.reduce((t, v) => t + v, 0); // 3.3年（比較表と同じ式）

// ---- geometry (figure at x=64, y=192; 858 × 420 = columns 1–9)
const W = 858, H = 420, base = 318, top = 34;
const x = band(bars.map((_, i) => i), [0, W], {inner: 0.36, outer: 0.08});
const yMax = Math.max(...bars.map(b => b.hi));
const y = linear([0, yMax], [base, top]);
const color = b => b.kind === 'total' ? 'var(--st-ink)' : b.kind === 'plan' ? 'var(--st-accent)' : 'var(--st-context)';
const marks = bars.map((b, i) => {
  const x0 = x(i), w = x.bw, cx = x0 + w / 2;
  const link = i < bars.length - 1 ? el('line', {x1: x0 + w, x2: x(i + 1), y1: y(b.kind === 'total' ? b.v : b.to), y2: y(b.kind === 'total' ? b.v : b.to), stroke: 'var(--st-link)', 'stroke-width': 1, 'stroke-dasharray': '3 3'}) : '';
  const val = b.kind === 'total' ? f1(b.v) : signed(b.v);
  const valCls = b.kind === 'plan' ? 'sv-n sv-a' : 'sv-n';
  const label = textLines(b.label, {x: cx, y: base + 26, anchor: 'middle', lineHeight: 1.3, cls: b.kind === 'total' ? 'sv-q' : 'sv-l', attrs: b.kind === 'total' ? {style: 'font-size:16px'} : {}});
  const sub = b.kind === 'total' ? textLines([`利益率 ${f1(i === 0 ? margin.from : margin.to)}%`], {x: cx, y: base + 74, anchor: 'middle', cls: 'sv-b'})
    : b.levers ? textLines([b.levers], {x: cx, y: base + 74, anchor: 'middle', cls: 'sv-b'}) : '';
  return link + el('rect', {x: x0, y: y(b.hi), width: w, height: Math.max(1.5, y(b.lo) - y(b.hi)), fill: color(b)})
    + textLines([val], {x: cx, y: y(b.hi) - 10, anchor: 'middle', cls: valCls, attrs: {style: `font-weight:700;font-size:${b.kind === 'total' ? 22 : 18}px`}})
    + label + sub;
}).join('');
const axis = el('line', {x1: 0, x2: W, y1: base, y2: base, stroke: 'var(--st-ink)', 'stroke-width': 1});

const svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
  <title id="${ID}-t">営業利益の増減：2025年度実績から2029年度計画へ（億円）</title>
  <desc id="${ID}-d">2025年度実績${f1(start)}億円（利益率${f1(margin.from)}%）。${bars.slice(1, -1).map(b => `${b.label.join('')} ${signed(b.v)}`).join('、')}。2029年度計画${f1(end)}億円（利益率${f1(margin.to)}%）。打ち手による改善は計${f1(planSum)}億円。</desc>
  ${axis}${marks}
</svg>`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Recommendation and operating-profit bridge to 2029',
  notes: 'Purpose: 推奨案を1つに絞って言い切り、営業利益が2025年度の実績から2029年度の計画までどう積み上がるかを示す。\nModify: option（推奨案）、sales（売上高）、steps（増減要因と金額、kind）、conditions（実現の条件と期限）を差し替える。最後の合計、利益率、見出しの数値は自動で計算される。\nInvariant: 合計＝前の合計＋増減の和（入力で上書きしない）。外部要因（売上の伸び・コスト上昇）は灰色、打ち手は強調色に分け、マイナスの要因も必ず載せる。条件の日付はロードマップと一致させる。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-strategy st-rec',
  content: `<h1 class="st-title" data-region="title">案${option.key}を推奨する。<br>2029年度の営業利益は${f1(end)}億円、利益率は${f1(margin.to)}%になる</h1>
<p class="st-exh">営業利益の増減<span>億円、2025年度実績→2029年度計画</span></p>
<figure class="st-fig" style="left:64px;top:206px;width:${W}px;height:${H}px" data-region="primary">${svg}</figure>
<p class="st-cond-h">実現の条件</p>
<ol class="st-cond" data-region="support">${conditions.map(c => `<li><b>${c.when}まで</b>${c.what}</li>`).join('')}
  <li><b>投資</b>${f1(option.invest)}億円。${f1(payback)}年で回収する</li></ol>
<div class="st-foot" data-region="source"><p>注：売上高は${sales.from}億円から${sales.to}億円へ（年3%）。運賃は年4%、人件費は年3%の上昇を見込む。番号は論点ツリーの打ち手<br>出典：青柳リビング EC事業部門の管理会計（2025年度）、白峰パートナーズ分析</p><p>EC事業の収益改善<b>5</b></p></div>`,
};
