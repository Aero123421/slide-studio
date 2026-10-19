// Template: 四半期業績レビュー（QBR）· 営業利益の計画差（ブリッジ）. Synthetic example content; replace data and copy.
// Plan → drivers → actual. Bar positions, connectors, the headline and the rail figures are computed from
// `plan`, `drivers` and `actual`; the module throws if the drivers do not add up.
import { svgRoot, el, g, textLines, linear, band, wrapText, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-qbr-waterfall';
const plan = 210;                       // 営業利益の計画, 百万円
const actual = 238;                     // 営業利益の実績, 百万円
const drivers = [                       // 計画との差（営業利益への影響）, 百万円. focus = the driver this page is about
  { label: '売上高', value: 48 },
  { label: 'クラウド\n基盤費', value: -14, note: 'ストレージ単価の改定' },
  { label: '人件費', value: 41, focus: true },
  { label: '広告\n宣伝費', value: -26, note: '展示会2件の追加出展' },
  { label: 'その他の\n販管費', value: -21, note: '業務委託費の増加' },
];
const hiring = { planned: 32, joined: 19 };   // 期初からの採用計画と入社数（全社）, 人
const source = '出所：経理部 月次決算（2026年7–9月）';
const running = '2026年度 第2四半期 業績レビュー';
const page = 3;

// ---- derived
const sum = drivers.reduce((s, d) => s + d.value, 0);
if (plan + sum !== actual) throw Error(`${ID}: plan ${plan} + drivers ${sum} ≠ actual ${actual}`);
const focus = drivers.find(d => d.focus);
const beat = actual - plan;
const withoutFocus = beat - focus.value;                       // 計画差 if the focus driver had been on plan
const overruns = drivers.filter(d => d.value < 0);
const overrunTotal = overruns.reduce((s, d) => s + d.value, 0);
const biggest = [...overruns].sort((a, b) => a.value - b.value)[0];
const s = v => fmt(v, { sign: true });                         // +48 / −14 with a real minus
const flat = label => label.replace(/\n/g, '');                // labels may carry a line break for the axis

// ---- figure: drawn at its region size (8 columns × 432 px)
const W = 760, H = 432, top = 36, bottom = 64;
let run = plan;
const bars = [
  { key: '計画', from: 0, to: plan, kind: 'plan' },
  ...drivers.map(d => { const from = run; run += d.value; return { key: d.label, from, to: run, kind: d.focus ? 'focus' : 'driver', value: d.value }; }),
  { key: '実績', from: 0, to: actual, kind: 'actual' },
];
const x = band(bars.map(b => b.key), [0, W], { inner: 0.36, outer: 0 });
const y = linear([0, Math.ceil(Math.max(...bars.map(b => Math.max(b.from, b.to))) / 50) * 50], [H - bottom, top]);
const fill = { plan: 'var(--paper)', actual: 'var(--ink)', driver: 'var(--context)', focus: 'var(--navy)' };
const marks = bars.map((b, i) => {
  const x0 = x(b.key), y0 = y(Math.max(b.from, b.to)), h = Math.abs(y(b.from) - y(b.to));
  const label = b.kind === 'plan' || b.kind === 'actual' ? String(b.to) : s(b.value);
  const next = bars[i + 1];
  return g({},
    el('rect', { x: x0, y: y0, width: x.bw, height: Math.max(1.5, h), fill: fill[b.kind], stroke: b.kind === 'plan' ? 'var(--ink)' : null, 'stroke-width': b.kind === 'plan' ? 1.5 : null }),
    next ? el('line', { x1: x0 + x.bw, x2: x(next.key), y1: y(b.to), y2: y(b.to), stroke: 'var(--context)', 'stroke-width': 1 }) : '',
    textLines([label], { x: x0 + x.bw / 2, y: y0 - 10, size: 20, anchor: 'middle', weight: 700, fill: b.kind === 'focus' ? 'var(--navy)' : 'var(--ink)' }),
    textLines(wrapText(b.key, x.step - 8, 16), { x: x0 + x.bw / 2, y: H - bottom + 14, size: 16, anchor: 'middle', valign: 'top', lineHeight: 1.3, fill: 'var(--ink)', weight: b.kind === 'plan' || b.kind === 'actual' ? 700 : null }));
}).join('');
const figure = svgRoot({
  id: `${ID}-fig`, width: W, height: H,
  title: '営業利益の計画から実績への増減要因（百万円）',
  desc: `計画${plan}百万円から、${drivers.map(d => `${flat(d.label)}${s(d.value)}`).join('、')}を経て、実績${actual}百万円。`,
}, el('line', { x1: 0, x2: W, y1: y(0), y2: y(0), stroke: 'var(--ink)', 'stroke-width': 1.5 }), marks,
textLines(['（単位：百万円）'], { x: W, y: 6, size: 15, anchor: 'end', valign: 'top', fill: 'var(--muted)' }));

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Operating profit bridge from plan to actual',
  notes: `Purpose: 営業利益が計画に対してなぜ上振れたかを要因別に分解し、上振れの「質」を問う。数字の大きさではなく、どの要因が効いたかを見せる。\nModify: plan・actual・drivers（計画との差、符号付き、百万円）を書き換える。合計が合わなければエラーになる。focus を付けた要因が紺で強調され、右欄の「その要因を除いた計画差」と見出しが自動で再計算される。hiring と右欄の説明文は自社の事情に合わせる。\nInvariant: 計画（枠線）＋要因＝実績（塗り）。棒はゼロから立ち上げる。強調する要因は1つだけ。増減の向きは色ではなく位置と符号で示す。\nStatic: Already static.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-qbr q-bridge',
  content: `<h1 class="q-head" data-region="title">営業利益は計画を<span class="nw">${beat}百万円</span>上回ったが、<span class="nw">${flat(focus.label)}の未消化${focus.value}百万円を除けば</span>計画に届いていない</h1>
<figure class="g" style="--c:1;--s:8;top:200px;margin:0" data-region="primary">${figure}</figure>
<div class="q-rail g" style="--c:9;--s:4;top:200px" data-region="support">
  <div>
    <p class="q-label">${flat(focus.label)}の未消化を除いた計画差</p>
    <p class="q-fig">${fmt(withoutFocus)}<span class="unit">百万円</span></p>
    <p class="q-body">採用は計画${hiring.planned}名に対し入社${hiring.joined}名。未充足の${hiring.planned - hiring.joined}名分、${flat(focus.label)}が計画を下回った。</p>
  </div>
  <div>
    <p class="q-body">費用の計画超過は合計<span class="nw">${-overrunTotal}百万円</span>。最大は${flat(biggest.label)}の<span class="nw">${-biggest.value}百万円</span>（${biggest.note}）。</p>
  </div>
</div>
<p class="q-foot" data-region="source"><span>${source}</span><span class="num">${running}　${page}</span></p>`,
};
