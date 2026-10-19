// Template: 戦略提案（経営会議向け）· 優先順位マトリクス. Synthetic example content; replace data and copy.
// Ease (1–5) × 2029 effect (億円) scatter. The priority zone follows the stated thresholds; the
// rail table sums every zone. Positions, colors, label sides and totals are computed from `levers`.
import { el, textLines, linear, measureText, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-strategy-priority-matrix';
const required = 14.6;                // 6%に必要な改善額（億円）＝論点ツリーの値
const cut = {ease: 3.0, effect: 1.5}; // 区分の境界：実行の容易さ（5段階）と効果（億円）
const levers = [                      // no・効果は論点ツリーと同じ。side = ラベルの側（r / l）。境界線をまたぐ場合は自動で反対側へ
  {no: '1.1', name: '値引き販売の抑制', effect: 3.0, ease: 3.4, side: 'r'},
  {no: '1.2', name: 'PB比率の引き上げ', effect: 2.2, ease: 2.4, side: 'l'},
  {no: '2.1', name: '送料無料ラインの改定', effect: 2.4, ease: 4.6, side: 'l'},
  {no: '2.2', name: '店舗受け取りの拡大', effect: 1.7, ease: 3.6, side: 'r'},
  {no: '2.3', name: '仕分けの自動化', effect: 2.6, ease: 1.8, side: 'r'},
  {no: '2.4', name: '配送会社の再入札', effect: 0.7, ease: 3.9, side: 'l'},
  {no: '3.1', name: '広告配分の見直し', effect: 2.0, ease: 4.0, side: 'l'},
  {no: '3.2', name: 'ポイント付与率の縮小', effect: 1.2, ease: 1.6, side: 'r'},
];
const zones = [                       // 表の並び順。corner = 図の中で区分名を置く隅
  {name: '先に着手する', corner: 'tr', test: l => l.ease >= cut.ease && l.effect >= cut.effect},
  {name: '準備して着手する', corner: 'tl', test: l => l.ease < cut.ease && l.effect >= cut.effect},
  {name: 'すぐ実施する', corner: 'br', test: l => l.ease >= cut.ease && l.effect < cut.effect},
  {name: '見送る', corner: 'bl', test: l => l.ease < cut.ease && l.effect < cut.effect},
];

// ---- derived
const r1 = v => Math.round(v * 10) / 10, f1 = v => fmt(v, {digits: 1});
const zoneOf = l => zones.find(z => z.test(l));
const rows = zones.map(z => {
  const items = levers.filter(l => zoneOf(l) === z);
  return {...z, items, total: r1(items.reduce((s, l) => s + l.effect, 0))};
});
const first = rows[0];
const share = first.total / required;                        // 0.62
const total = r1(levers.reduce((s, l) => s + l.effect, 0));

// ---- geometry (figure at x=64, y=190; 858 × 430 = columns 1–9)
const W = 858, H = 430, box = {x: 58, y: 12, w: 788, h: 350};
const x = linear([1, 5], [box.x, box.x + box.w]);
const y = linear([0, 3.5], [box.y + box.h, box.y]);
const X0 = x(cut.ease), Y0 = y(cut.effect);
const grid = [1, 2, 3].map(v => el('line', {x1: box.x, x2: box.x + box.w, y1: y(v), y2: y(v), stroke: 'var(--st-faint)', 'stroke-width': 1})).join('');
const yTicks = [0, 1, 2, 3].map(v => textLines([fmt(v)], {x: box.x - 14, y: y(v) + 6, anchor: 'end', cls: 'sv-b'})).join('');
const xTicks = [1, 2, 3, 4, 5].map(v => textLines([fmt(v)], {x: x(v), y: box.y + box.h + 26, anchor: 'middle', cls: 'sv-b'})).join('');
const axes = [
  el('line', {x1: box.x, x2: box.x + box.w, y1: box.y + box.h, y2: box.y + box.h, stroke: 'var(--st-ink)', 'stroke-width': 1}),
  textLines(['実行の容易さ（5段階評価）'], {x: box.x + box.w / 2, y: box.y + box.h + 58, anchor: 'middle', cls: 'sv-l'}),
  textLines(['← 難しい'], {x: box.x, y: box.y + box.h + 58, cls: 'sv-b'}),
  textLines(['容易 →'], {x: box.x + box.w, y: box.y + box.h + 58, anchor: 'end', cls: 'sv-b'}),
  textLines(['2029年度の効果（億円）'], {x: 0, y: -16, cls: 'sv-b'}),
].join('');
const corner = {tr: [box.x + box.w - 14, box.y + 26, 'end'], tl: [box.x + 14, box.y + 26, 'start'], br: [box.x + box.w - 14, box.y + box.h - 14, 'end'], bl: [box.x + 14, box.y + box.h - 14, 'start']};
const quadrant = [
  el('rect', {x: X0, y: box.y, width: box.x + box.w - X0, height: Y0 - box.y, fill: 'var(--st-tint)'}),
  el('line', {x1: X0, x2: X0, y1: box.y, y2: box.y + box.h, stroke: 'var(--st-link)', 'stroke-width': 1}),
  el('line', {x1: box.x, x2: box.x + box.w, y1: Y0, y2: Y0, stroke: 'var(--st-link)', 'stroke-width': 1}),
  ...zones.map((z, i) => textLines([z.name], {x: corner[z.corner][0], y: corner[z.corner][1], anchor: corner[z.corner][2], cls: i === 0 ? 'sv-h sv-a' : 'sv-h'})),
].join('');
const points = levers.map(l => {
  const cx = x(l.ease), cy = y(l.effect), on = zoneOf(l) === zones[0], r = on ? 7 : 6;
  const text = `${l.no} ${l.name}`, w = measureText(text, 16, {weight: on ? 700 : 400}) + 4;
  const span = side => side === 'r' ? [cx + r + 8, cx + r + 8 + w] : [cx - r - 8 - w, cx - r - 8];
  const crosses = ([a, b]) => (a < X0 && b > X0) || a < box.x || b > box.x + box.w;
  const side = crosses(span(l.side)) && !crosses(span(l.side === 'r' ? 'l' : 'r')) ? (l.side === 'r' ? 'l' : 'r') : l.side;
  return el('circle', {cx, cy, r, fill: on ? 'var(--st-accent)' : 'var(--st-paper)', stroke: on ? 'var(--st-accent)' : 'var(--st-muted)', 'stroke-width': 1.6})
    + textLines([text], {x: side === 'r' ? cx + r + 8 : cx - r - 8, y: cy + 6, anchor: side === 'r' ? 'start' : 'end', cls: on ? 'sv-l' : 'sv-l', attrs: on ? {style: 'font-weight:700'} : {}});
}).join('');

const svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
  <title id="${ID}-t">打ち手の優先順位：実行の容易さと2029年度の効果</title>
  <desc id="${ID}-d">横軸は実行の容易さ（1〜5）、縦軸は2029年度の営業利益への効果（億円）。境界は容易さ${f1(cut.ease)}、効果${f1(cut.effect)}億円。${rows.map(z => `${z.name}：${z.items.map(l => `${l.no} ${l.name}（効果${f1(l.effect)}億円、容易さ${f1(l.ease)}）`).join('、') || 'なし'}`).join('。')}。</desc>
  ${quadrant}${grid}${axes}${yTicks}${xTicks}${points}
</svg>`;

const table = `<table class="st-zones" data-region="support">
  <thead><tr><th>区分</th><th>効果（億円）</th></tr></thead>
  <tbody>${rows.map((z, i) => `<tr${i === 0 ? ' class="is-focus"' : ''}><td>${z.name}<small>${z.items.map(l => l.no).join('・') || '該当なし'}</small></td><td>${f1(z.total)}</td></tr>`).join('')}
  <tr class="is-total"><td>合計</td><td>${f1(total)}</td></tr>
  <tr class="is-ref"><td>必要な改善額</td><td>${f1(required)}</td></tr></tbody>
</table>`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Priority matrix: effect versus ease of execution',
  notes: 'Purpose: 論点ツリーで洗い出した打ち手を「効果」と「実行の容易さ」で並べ、どれから着手し、どれを見送るかを決める。\nModify: levers の効果（億円）・容易さ（1〜5）・ラベルの側 side を差し替える。境界 cut を変えると色分け、網掛け、右の表の合計が追従する。ラベルが境界線や図の端にかかる場合は自動で反対側に置かれる。見出しの改行は <br> で文や句の切れ目に入れる。\nInvariant: 打ち手の番号と効果は論点ツリーと同じ値にする。境界は明記した数値で引き、目分量で決めない。容易さの採点方法を注記する。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-strategy st-matrix',
  content: `<h1 class="st-title" data-region="title">効果が大きく実行しやすい${first.items.length}つの打ち手で、<br>必要な改善額の${Math.round(share * 10)}割をまかなえる</h1>
<figure class="st-fig" style="left:64px;top:190px;width:${W}px;height:${H}px" data-region="primary">${svg}</figure>
${table}
<div class="st-foot" data-region="source"><p>注：実行の容易さは、投資額・準備期間・社内外の調整の3項目を経営陣6名が5段階で採点した平均<br>出典：白峰パートナーズ分析</p><p>EC事業の収益改善<b>3</b></p></div>`,
};
