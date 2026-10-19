// Motion study · Assemble contributions — a profit bridge built in reading order. Build 0 shows
// the opening total; build 1 adds each signed contribution from the running level, one after
// another; build 2 closes on the validated total. Every level is a running sum of `bridge`.
import { svgRoot, el, g, linear, band, axis, textLines, wrapText, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const bridge = [ // 営業利益の増減要因、億円（架空の部品メーカー、2024年度→2025年度）— illustrative
  { label: '2024年度', value: 412, total: true },
  { label: '価格改定', value: 58, lever: true }, // lever: a measure the company itself took
  { label: '販売数量', value: 21 },
  { label: '原材料費', value: -64 },
  { label: '為替', value: -17 },
  { label: '生産性改善', value: 33, lever: true },
  { label: '物流費', value: -12 },
  { label: '2025年度', value: 431, total: true },
];
// running levels; a declared total must equal the sum above it, or the page refuses to build
let run = 0;
const steps = bridge.map(d => {
  if (d.total) {
    if (run && Math.abs(d.value - run) > 1e-9) throw Error(`waterfall-build: ${d.label} is ${d.value}, but the bars above it sum to ${run}`);
    run = d.value;
    return { ...d, from: 0, to: d.value };
  }
  const from = run; run += d.value;
  return { ...d, from, to: run };
});
const open = steps[0], close = steps.at(-1), deltas = steps.filter(s => !s.total);
const gains = deltas.filter(s => s.value > 0), losses = deltas.filter(s => s.value < 0);
const sum = list => list.reduce((s, d) => s + d.value, 0);
const biggestLoss = [...losses].sort((a, b) => a.value - b.value)[0];
const levers = deltas.filter(s => s.lever && s.value > 0);
const change = close.to - open.to;
const signed = v => (v < 0 ? `▲${fmt(-v)}` : `+${fmt(v)}`); // 決算資料の慣例：減少は▲

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 800, H = 470, m = { l: 52, r: 8, t: 34, b: 58 };
  const x = band(steps.map(s => s.label), [m.l, W - m.r], { inner: 0.3, outer: 0.08 });
  const y = linear([0, 500], [H - m.b, m.t]);
  const gap = 260; // ms between contributions inside build 1
  const color = s => (s.total ? t.c('ink') : s.value > 0 ? t.c('positive') : t.c('negative'));
  return svgRoot({ id: 'motion-waterfall-build-fig', width: W, height: H, theme: t,
    title: `営業利益の増減要因（${open.label}→${close.label}、億円）`,
    desc: `${open.label}の${open.to}億円から、増益要因の合計${signed(sum(gains))}億円と減益要因の合計${signed(sum(losses))}億円を積み上げて${close.label}の${close.to}億円。最大の減益要因は${biggestLoss.label}（${signed(biggestLoss.value)}億円）。` },
  axis(y, { orient: 'left', at: m.l, grid: [m.l, W - m.r], theme: t, size: 16, tickValues: [0, 100, 200, 300, 400, 500] }),
  textLines(['億円'], { x: m.l - 10, y: 6, size: 16, anchor: 'end', fill: t.c('muted'), valign: 'top' }),
  steps.map((s, k) => {
    const top = y(Math.max(s.from, s.to)), h = Math.max(2, Math.abs(y(s.to) - y(s.from)));
    const up = s.to >= s.from;
    const stepNo = k === 0 ? 0 : s.total ? 2 : 1;
    const delay = s.total ? 0 : (deltas.indexOf(s)) * gap;
    const prev = steps[k - 1];
    const lab = s.total ? fmt(s.to) : signed(s.value);
    return g({},
      prev ? el('line', { x1: x(prev.label) + x.bw, x2: x(s.label), y1: y(prev.to), y2: y(prev.to), stroke: t.c('muted'), 'stroke-width': 1.2, 'stroke-dasharray': '3 3',
        'data-step': stepNo, 'data-motion': 'reveal', 'data-delay': delay, 'data-duration': 200 }) : '',
      el('rect', { x: x(s.label), y: top, width: x.bw, height: h, rx: 2, fill: color(s),
        style: `transform-origin:${up ? '50% 100%' : '50% 0%'}`, 'data-step': stepNo, 'data-motion': k ? 'grow-y' : null,
        'data-delay': k ? delay + 80 : null, 'data-duration': s.total ? 700 : 420, 'data-easing': 'decelerate' }),
      textLines([lab], { x: x.center(s.label), y: up ? top - 8 : top + h + 8, size: 17, weight: 700, anchor: 'middle', valign: up ? 'baseline' : 'top', fill: color(s),
        attrs: { 'font-variant-numeric': 'tabular-nums', 'data-step': stepNo, 'data-motion': k ? 'reveal' : null, 'data-delay': k ? delay + (s.total ? 600 : 380) : null } }),
      textLines(wrapText(s.label, x.step - 4, 16), { x: x.center(s.label), y: H - m.b + 10, size: 16, anchor: 'middle', valign: 'top', fill: t.c('ink'), weight: s.total ? 700 : null, lineHeight: 1.2 }));
  }));
}

const kpi = (num, cls, text, attrs) => `<div class="st-kpi"${attrs}><b${cls ? ` style="color:var(--ss-${cls})"` : ''}>${num}<small style="font-size:.42em;font-weight:600;margin-left:.08em">億円</small></b><span>${text}</span></div>`;
export default {
  study: true,
  id: 'motion-waterfall-build',
  language: 'ja',
  title: 'Waterfall build: signed contributions in order, validated total',
  className: 'st st--rail cs-finance-ledger',
  notes: 'Purpose: Build a bridge between two totals by adding signed contributions in order from the running level, so the audience sees accumulation, not unrelated bars.\nModify: Replace `bridge` (opening total, contributions, closing total); levels, colours, rail sums and headline recompute. A declared total that does not equal the running sum throws.\nInvariant: Each contribution starts where the previous one ended; increases grow up and decreases grow down from that level; totals start at zero; the closing total appears only after every contribution.\nStatic: The final build shows the full bridge, both sums and the closing total.',
  sources: [{ type: 'original-example', file: 'assets/motion/waterfall-build.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" style="word-break:auto-phrase">${biggestLoss.label}による${fmt(-biggestLoss.value)}億円の減益を${levers.map(s => s.label).join('と')}の${fmt(sum(levers))}億円で補い、営業利益は${fmt(Math.abs(change))}億円の${change >= 0 ? '増益' : '減益'}</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<div class="st-rail" data-region="support" style="word-break:auto-phrase">
  ${kpi(fmt(sum(gains)), 'positive', `増益要因の合計（${gains.map(s => s.label).join('・')}）`, ' data-step="1" data-motion="reveal" data-delay="600"')}
  ${kpi(fmt(-sum(losses)), 'negative', `減益要因の合計（${losses.map(s => s.label).join('・')}）`, ' data-step="1" data-motion="reveal" data-delay="1400"')}
  <hr class="st-rule" data-step="2" data-motion="reveal">
  ${kpi(fmt(close.to), '', `${close.label}の営業利益（前年度比${signed(change)}億円、${signed(+((close.to / open.to - 1) * 100).toFixed(1))}%）`, ' data-step="2" data-motion="reveal" data-delay="500"')}
</div>
<p class="st-source" data-region="source"><span>架空のデータ · 架空の部品メーカーの連結営業利益</span><span>モーション · 増減要因を順に積み上げるウォーターフォール（2ビルド）</span></p>`,
};
