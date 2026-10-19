// Template: 戦略提案（経営会議向け）· 論点ツリー. Synthetic example content; replace data and copy.
// Root question → 3 sub-issues → 8 testable questions, each with a quantified hypothesis and its
// 2029 profit effect. Positions, connectors, bars and every total are computed from `tree`.
import { el, textLines, fmt } from '../../runtime/figure.mjs';
// Note: SVG labels that must keep a number with its unit (2029年度) take explicit lines; the
// engine's wrapText can split "2029|年度" and compound nouns, so the root question is pre-broken.

const ID = 'tpl-strategy-issue-tree';
const plan = {                     // 億円（2029年度の値は計画）
  sales2025: 240, op2025: 3.6,     // EC事業の売上高・営業利益（2025年度実績）
  year: 2029, sales2029: 270,      // 目標年度と売上高の前提（年3%成長）
  targetMargin: 6,                 // 目標営業利益率（%）
  volume: 2.4,                     // 売上の伸びによる増益
  headwind: -4.4,                  // 運賃・人件費の上昇
};
const rootQ = ['EC事業の', '営業利益率を、', '2029年度に6%', 'まで上げられるか']; // 主論点（改行位置を指定）
const tree = [                     // v = 2029年度の営業利益への効果（億円）
  {no: '1', q: ['粗利率を', '上げられるか'], leaves: [
    {no: '1.1', q: '値引き販売を減らしても、客数を保てるか', h: '平均値引率を14%から10%に下げても、客数の減少は2%以内', v: 3.0},
    {no: '1.2', q: '自社企画品（PB）の比率を上げられるか', h: 'PB比率を22%から32%へ上げれば、粗利率は0.8ポイント上がる', v: 2.2}]},
  {no: '2', q: ['物流費を', '下げられるか'], focus: true, leaves: [
    {no: '2.1', q: '送料無料の基準額を上げられるか', h: '3,980円を4,980円にすると、1件あたり配送費が10%下がる', v: 2.4},
    {no: '2.2', q: '店舗での受け取りを広げられるか', h: '受け取り比率を9%から18%にすると、宅配が10%減る', v: 1.7},
    {no: '2.3', q: '物流センターの仕分けを自動化できるか', h: '仕分けの作業時間を40%削減できる（投資9億円）', v: 2.6},
    {no: '2.4', q: '配送会社の料金を下げられるか', h: '3社で再入札すれば、1個あたり運賃が3%下がる', v: 0.7}]},
  {no: '3', q: ['販促費を', '効率化できるか'], leaves: [
    {no: '3.1', q: '広告費を効果の高い媒体に寄せられるか', h: '費用対効果が下位3割の出稿を止めても、売上減は1%以内', v: 2.0},
    {no: '3.2', q: 'ポイント付与率を下げられるか', h: '1.5%を1.0%に下げられるが、上位顧客の離反が懸念される', v: 1.2}]},
];

// ---- derived numbers (never retyped)
const sum = a => a.reduce((s, x) => s + x, 0);
const r1 = v => Math.round(v * 10) / 10;
const target = r1(plan.sales2029 * plan.targetMargin / 100);                    // 16.2
const required = r1(target - plan.op2025 - plan.volume - plan.headwind);       // 14.6
const margin2025 = r1(plan.op2025 / plan.sales2025 * 100);                     // 1.5
const branches = tree.map(b => ({...b, total: r1(sum(b.leaves.map(l => l.v)))}));
const focus = branches.find(b => b.focus);
const share = focus.total / required;                                          // 0.51
const f1 = v => fmt(v, {digits: 1});

// ---- geometry (SVG coordinates; the figure sits at x=64, y=178 on the slide)
const W = 1152, X = {root: 0, rootW: 156, br1: 176, br: 196, brW: 152, br2: 370, leaf: 392, bar: 980, end: 1152};
const LH = 42, LG = 5, BG = 14, TOP = 44;
const vmax = Math.max(...branches.flatMap(b => b.leaves.map(l => l.v)));
const barX = v => X.bar + v / vmax * 110;
let y = TOP;
const lay = branches.map((b, bi) => {
  if (bi) y += BG;
  const leaves = b.leaves.map((l, li) => { if (li) y += LG; const top = y; y += LH; return {...l, top, cy: top + 11}; });
  return {...b, leaves, mid: (leaves[0].top + leaves.at(-1).top + LH) / 2};
});
const H = y + 2;
const rootMid = (lay[0].mid + lay.at(-1).mid) / 2;
const line = (x1, y1, x2, y2, extra = {}) => el('line', {x1, y1, x2, y2, stroke: 'var(--st-link)', 'stroke-width': 1.2, ...extra});

const head = [
  textLines(['主論点'], {x: X.root, y: 16, cls: 'sv-h'}),
  textLines(['論点'], {x: X.br, y: 16, cls: 'sv-h'}),
  textLines(['検証する問いと定量仮説'], {x: X.leaf, y: 16, cls: 'sv-h'}),
  textLines([`${plan.year}年度の効果（億円）`], {x: X.end, y: 16, anchor: 'end', cls: 'sv-h'}),
  el('line', {x1: 0, x2: W, y1: 29.5, y2: 29.5, stroke: 'var(--st-ink)', 'stroke-width': 1}),
];
const rootLines = rootQ;
const rootH = rootLines.length * 28 + 14 + 2 * 22;
const rootTop = rootMid - rootH / 2;
const root = [
  textLines(rootLines, {x: X.root, y: rootTop + 20, lineHeight: 1.4, size: 20, cls: 'sv-r'}),
  textLines([`2025年度実績 ${f1(margin2025)}%`, `必要な改善 ${f1(required)}億円`], {x: X.root, y: rootTop + rootLines.length * 28 + 30, lineHeight: 1.375, cls: 'sv-b'}),
  line(X.rootW + 6, rootMid, X.br1, rootMid),
  line(X.br1, lay[0].mid, X.br1, lay.at(-1).mid),
];
const tiers = lay.map((b, bi) => {
  const qLines = b.q;                                   // 論点名は改行位置を指定（例：['物流費を', '下げられるか']）
  const bh = qLines.length * 24 + 26, top = b.mid - bh / 2;
  const tone = b.focus ? 'var(--st-accent)' : 'var(--st-context)';
  const sep = bi ? el('line', {x1: X.br, x2: W, y1: b.leaves[0].top - BG / 2 - 1, y2: b.leaves[0].top - BG / 2 - 1, stroke: 'var(--st-faint)', 'stroke-width': 1}) : '';
  const leaves = b.leaves.map(l => [
    textLines([`${l.no}　${l.q}`], {x: X.leaf, y: l.top + 17, cls: 'sv-q'}),
    textLines([l.h], {x: X.leaf + 37, y: l.top + 39, cls: 'sv-b'}),
    el('rect', {x: X.bar, y: l.top + 5, width: barX(l.v) - X.bar, height: 13, fill: tone}),
    textLines([f1(l.v)], {x: X.end, y: l.top + 18, anchor: 'end', cls: 'sv-n'}),
    line(X.br2, l.cy, X.leaf - 8, l.cy),
  ].join('')).join('');
  return [
    sep,
    line(X.br1, b.mid, X.br - 8, b.mid),
    textLines(qLines, {x: X.br, y: top + 18, lineHeight: 1.333, cls: 'sv-q'}),
    textLines([`計 ${f1(b.total)}億円`], {x: X.br, y: top + qLines.length * 24 + 20, cls: b.focus ? 'sv-b sv-a' : 'sv-b', attrs: b.focus ? {style: 'font-weight:700'} : {}}),
    line(X.br + X.brW + 4, b.mid, X.br2, b.mid),
    line(X.br2, b.leaves[0].cy, X.br2, b.leaves.at(-1).cy),
    leaves,
  ].join('');
}).join('');
const zero = el('line', {x1: X.bar, x2: X.bar, y1: TOP - 6, y2: H - 4, stroke: 'var(--st-ink)', 'stroke-width': 1});

const svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
  <title id="${ID}-t">論点ツリー：営業利益率6%に向けた論点と定量仮説</title>
  <desc id="${ID}-d">主論点を${branches.length}つの論点と${branches.reduce((s, b) => s + b.leaves.length, 0)}つの問いに分解。${branches.map(b => `${b.no} ${b.q.join('')}（計${f1(b.total)}億円）：${b.leaves.map(l => `${l.no} ${l.q}、${l.h}、${f1(l.v)}億円`).join('。')}`).join('。')}。</desc>
  ${head.join('')}${root.join('')}${tiers}${zero}
</svg>`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Issue tree: where the required profit improvement can come from',
  notes: 'Purpose: 「6%に届くか」という大きな問いを、検証できる問いと数値の仮説に分け、どこに改善余地が集まっているかを示す。\nModify: plan（売上・利益・前提）と tree（論点・問い・仮説・効果）を差し替える。合計、必要額、棒の長さ、接続線は自動で計算される。focus: true の論点が強調色になる。\nInvariant: 線は分解を表し、順序ではない。各問いは「はい／いいえ」で答えられる形にし、仮説には必ず数値を入れる。効果の単位と年度は全ページでそろえる（2029年度・億円）。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-strategy st-tree',
  content: `<h1 class="st-title" data-region="title">6%に必要な改善は${f1(required)}億円。<br>その${share >= 0.45 && share < 0.55 ? '半分' : `${Math.round(share * 100)}%`}は物流費の見直しで見込める</h1>
<figure class="st-fig" style="left:64px;top:178px;width:${W}px;height:${H}px" data-region="primary">${svg}</figure>
<div class="st-foot" data-region="source"><p>注：効果は${plan.year}年度の年間効果。売上高は2025年度の${plan.sales2025}億円から年3%伸び、${plan.year}年度に${plan.sales2029}億円となる前提<br>出典：青柳リビング EC事業部門の管理会計（2025年度）、白峰パートナーズ分析</p><p>EC事業の収益改善<b>2</b></p></div>`,
};
