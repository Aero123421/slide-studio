/**
 * Repair lab: twelve before/after pairs and a three-page transfer talk (Japanese).
 *
 * Each pair is ONE page function drawn twice. `v === 'before'` switches on exactly
 * one realistic failure (named in `failure`) and adds a diagnosis mark that appears
 * on the first click; `v === 'after'` is the repaired page, finished enough to ship.
 * The difference between the two branches of a page function IS the repair.
 *
 * Everything shown is synthetic: fictional organisations, places and people. Each
 * pair keeps its data at the top of its section and computes every number on the
 * page from it (quant.mjs for amounts, rates and paired differences; the figure
 * engine for charts and diagrams; semantic-graph.mjs to validate branch meaning).
 *
 * Built by scripts/build-repair-lab.mjs into gallery/repair-lab.html (`lab`) and
 * gallery/transfer-talk.html (`talk`). The repairs are documented in
 * references/repair.md. Workshop material: never submit these pages unchanged.
 */
import fs from 'node:fs/promises';
import { quantity, change, paired, totalCost, segments } from '../runtime/quant.mjs';
import { validateGraph } from '../runtime/semantic-graph.mjs';
import {
  waterfallChart, lineChart, flowDiagram, columnChart, barChart, stackedBarChart, slopeChart,
  svgRoot, el, g, textLines, wrapText, linear, band, axis, barPath, legend, fmt, sum, extent, niceDomain,
} from '../runtime/figure.mjs';
import { offers, planNames, cheapestRuns } from './period.mjs';

// ── CSS: the page grammar + one color system, read from the repo at build time ──
const read = p => fs.readFile(new URL(p, import.meta.url), 'utf8');
const frame = await read('../runtime/study-frame.css');
const systems = await read('../color-systems/color-systems.css');
const waAi = systems.match(/\/\*[^*]*\*\/\n\.cs-wa-ai\{[^}]*\}/)?.[0];
if (!waAi) throw Error('color-systems.css has no cs-wa-ai block');

export const css = `${frame}\n${waAi}\n
/* ── Repair lab rules (lab + talk). Indigo accent = "this"; red = the editor's mark and worsening values. ──
   Type scale: headline 36 · second clause 28 · KPI 54 · body 20 · labels 16–18 · source 15.
   Grid: 64 px margins; evidence 1152×482 from y 176; rail 312 px (figure 800). */
.lab {
  --ss-font-sans: "Inter","Helvetica Neue","Hiragino Sans","Hiragino Kaku Gothic ProN","Noto Sans JP","Yu Gothic UI","Yu Gothic",Meiryo,"IPAPGothic","IPAGothic",sans-serif;
  --ss-font-display: var(--ss-font-sans);
  word-break: auto-phrase; line-break: strict;
}
.lab .st-head { max-width: 1110px; font: 700 36px/1.4 var(--ss-font-display); letter-spacing: .02em; font-feature-settings: "palt" 1; }
.lab .st-head .st-quiet { display: block; margin-top: 4px; font-size: 28px; line-height: 1.45; font-weight: 500; letter-spacing: .02em; }
.lab .nw { white-space: nowrap; }
.lab .st-kpi b small { margin-left: .12em; font-size: .4em; font-weight: 600; letter-spacing: 0; color: var(--ss-muted); }
.lab .st-kpi b.is-accent { color: var(--ss-accent); }
.lab .st-kpi span { font-size: 18px; line-height: 1.6; color: var(--ss-ink); }
.lab .st-text { font-size: 20px; line-height: 1.7; }
.lab .st-source .lab-tag { text-align: right; }
.lab .lab-tag b { margin-right: .8em; font-weight: 700; color: var(--ss-ink); }
.lab .lab-tag b.is-before { color: var(--ss-negative); }

/* Diagnosis mark (BEFORE pages): a ring on the faulty element and one short note, revealed at build 1. */
.lab .lab-fault { position: relative; }
.lab .lab-ring { position: absolute; inset: -5px -9px; border: 2.5px solid var(--ss-negative); border-radius: 10px; pointer-events: none; }
.lab .lab-note { position: absolute; z-index: 2; margin: 0; padding: 10px 16px 12px; background: var(--ss-paper); border: 2px solid var(--ss-negative); border-radius: 8px;
  font: 600 18px/1.6 var(--ss-font-sans); color: var(--ss-negative); pointer-events: none; }
.lab .lab-note span { display: block; font-weight: 400; color: var(--ss-ink); }
.lab svg .lab-svg-ring { fill: none; stroke: var(--ss-negative); stroke-width: 2.5; }

/* Reading tables (pair 9, talk page 3). Hairlines, tabular figures, units in the header. */
.lab .lab-table { position: absolute; left: 64px; right: 64px; top: 196px; border-collapse: collapse; font-size: 20px; line-height: 1.5; font-variant-numeric: tabular-nums; }
.lab .lab-table th { padding: 0 20px 12px 0; border-bottom: 1.5px solid var(--ss-ink); font: 600 16px/1.4 var(--ss-font-sans); color: var(--ss-muted); text-align: left; vertical-align: bottom; }
.lab .lab-table td { padding: 15px 20px 15px 0; border-bottom: 1px solid var(--ss-rule); vertical-align: top; }
.lab .lab-table .n { text-align: right; }
.lab .lab-table .is-best { color: var(--ss-accent); font-weight: 700; }
.lab .lab-table .is-open { font-weight: 700; }

/* The flawed card pattern some BEFORE pages show (not used on AFTER pages). */
.lab .lab-cards { position: absolute; left: 64px; right: 64px; top: 188px; display: flex; gap: 18px; }
.lab .lab-card { flex: 1; padding: 16px 18px; background: var(--ss-paper); border: 1px solid var(--ss-rule); border-radius: 14px; box-shadow: 0 6px 18px rgb(24 42 62 / .10); }
.lab .lab-card h3 { margin: 0 0 6px; font-size: 17px; }
.lab .lab-card p { margin: 0; font-size: 14px; line-height: 1.6; color: var(--ss-muted); }

/* Under-figure line for conditions and checks (pairs 6 and 12). */
.lab .lab-under { position: absolute; left: 64px; right: 64px; margin: 0; font-size: 20px; line-height: 1.6; }
.lab .lab-under b { font-weight: 700; }
.lab .lab-tiny { position: absolute; left: 64px; margin: 0; font-size: 12px; color: var(--ss-muted); }
`;

// ── Shared helpers ──────────────────────────────────────────────────────────
const num = (v, digits = 0, o = {}) => fmt(v, { locale: 'ja', digits, ...o });
const signed = (v, digits = 1) => num(v, digits, { sign: true });
const nw = s => `<span class="nw">${s}</span>`;
const SYNTH = '架空のデータ';

/** One lab page: claim (+ muted second clause), evidence, one source line. */
function labPage({ head, quiet = '', body, source, tag = '' }) {
  return `<h1 class="st-head" data-region="title">${head}${quiet ? `<span class="st-quiet">${quiet}</span>` : ''}</h1>
${body}
<p class="st-source" data-region="source"><span>${source}</span>${tag ? `<span class="lab-tag">${tag}</span>` : ''}</p>`;
}
/** BEFORE only: ring the faulty words. The ring appears at build 1, with the note. */
const fault = text => `<span class="lab-fault">${text}<i class="lab-ring" data-step="1" data-motion="reveal" aria-hidden="true"></i></span>`;
/** BEFORE only: the diagnosis note (what is wrong · the fix), placed in free space. */
const note = (what, fix, style) => `<p class="lab-note" data-step="1" data-motion="reveal" data-qa-overlap="diagnosis note drawn over the page on purpose" style="${style}">${what}<span>${fix}</span></p>`;
/** BEFORE only: a ring drawn inside a figure, in the figure's own coordinates. */
const svgRing = (x, y, w, h, r = 12) => el('rect', { x, y, width: w, height: h, rx: r, class: 'lab-svg-ring', 'data-step': 1, 'data-motion': 'reveal', 'aria-hidden': 'true' });

const labSlides = [];
/**
 * Register a pair. `page(v)` returns the page for v = 'before' | 'after'.
 * `failure` names the one failure; `repair` names the operation that fixes it.
 */
function pair(id, { failure, repair, page, lesson, className = '', readingMode, copyWaivers }) {
  const base = { study: true, className: `st cs-wa-ai lab ${className}`.trim(), exportPolicy: 'final', ...(readingMode ? { readingMode } : {}) };
  labSlides.push({ ...base, id: `${id}-before`, title: `修正前：${failure}`, ...(copyWaivers ? { copyWaivers } : {}),
    content: page('before', `<b class="is-before">修正前</b>${failure}`),
    notes: `Intentional failure (one): ${lesson.failure}\nClick once to reveal the diagnosis mark; the final build shows it.\nDo not copy this page.` });
  labSlides.push({ ...base, id: `${id}-after`, title: `修正後：${repair}`,
    content: page('after', `<b>修正後</b>${repair}`),
    notes: `Repair: ${lesson.repair}\nMust remain: ${lesson.keep}\nAll values are synthetic; replace them, do not reuse them.` });
}

// ════════════════════════════════════════════════════════════════════════════
// 1 · 金額と率 — a 500 → 650 change reported as "30百万円"
// ════════════════════════════════════════════════════════════════════════════
const sales = { prior: 500, current: 650 };            // 百万円・首都圏12店舗とEC、税抜。2025→2026年度
const salesDrivers = [                                  // 増減の内訳（百万円）
  { label: '新店3店', value: 90 },
  { label: 'EC', value: 45 },
  { label: '既存店', value: 15 },
];
const growth = change(quantity(sales.prior, '百万円'), quantity(sales.current, '百万円'));
if (sum(salesDrivers.map(d => d.value)) !== growth.delta.value) throw Error('sales drivers must add up to the change');
const newStoreShare = salesDrivers[0].value / growth.delta.value;

pair('amount-and-rate', {
  failure: '伸び率の数字を、金額の差として書いた',
  repair: '差額と伸び率を別々に計算し、見出しと図で同じ値を使う',
  className: 'st--rail',
  lesson: {
    failure: 'the headline reports the growth rate (30) with the amount unit (百万円); the chart and rail say +150.',
    repair: 'compute change() once; headline, rail and waterfall read delta (150 百万円) and percent (30%) from the same object.',
    keep: 'amount and rate both visible, the unit, the two fiscal years and the source scope.',
  },
  page: (v, tag) => labPage({
    head: `首都圏の売上は前年度から${v === 'before'
      ? fault(nw(`${num(growth.percent)}百万円`))                       // the failure: the rate, typed with the amount's unit
      : nw(`${num(growth.delta.value)}百万円`)}増えた${v === 'after' ? nw(`（+${num(growth.percent)}%）`) : ''}`,
    quiet: `増えた分の${num(newStoreShare * 10)}割は、春に開いた新店3店による`,
    body: `<figure class="st-fig" data-region="primary">${waterfallChart({
      id: `sales-${v}`, width: 800, height: 482, fontSize: 18, locale: 'ja', format: { digits: 0 },
      title: '首都圏の売上の増減（百万円）',
      desc: `${sales.prior}百万円から${sales.current}百万円へ。増加${growth.delta.value}百万円の内訳は${salesDrivers.map(d => `${d.label}${d.value}`).join('、')}。`,
      data: [{ label: '2025年度', value: sales.prior, total: true }, ...salesDrivers, { label: '2026年度', value: sales.current, total: true }],
      positiveColor: 'var(--ss-accent)',
      annotate: [{ at: '新店3店', text: `増加分の${num(newStoreShare * 100)}%`, dx: 70, dy: -10, marker: 'none', size: 17 }],
    })}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b>+${num(growth.delta.value)}<small>百万円</small></b><span>増加額　${sales.current} − ${sales.prior}</span></div>
  <hr class="st-rule">
  <div class="st-kpi"><b>+${num(growth.percent)}<small>%</small></b><span>伸び率　${growth.delta.value} ÷ ${sales.prior}</span></div>
</div>
${v === 'before' ? note('「30」は伸び率（%）の数字。', `金額の差は ${sales.current} − ${sales.prior} ＝ ${growth.delta.value}百万円。`, 'left:600px;top:118px;width:380px') : ''}`,
    source: `${SYNTH}・首都圏12店舗とECの税抜売上。2025年度と2026年度`,
    tag,
  }),
});

// ════════════════════════════════════════════════════════════════════════════
// 2 · 差の向き — bars use 従来−新, the summary uses 新−従来
// ════════════════════════════════════════════════════════════════════════════
// 温度上昇（℃）＝最高セル温度 − 室温。2C放電30分、室温25℃、冷却水20℃。M5は新プレートで熱電対が断線。
export const modules = [
  { id: 'M1', old: 12.4, new: 10.5 },
  { id: 'M2', old: 11.0, new: 10.2 },
  { id: 'M3', old: 14.2, new: 12.1 },
  { id: 'M4', old: 13.1, new: 14.0 },
  { id: 'M5', old: 15.3, new: null },
  { id: 'M6', old: 16.0, new: 14.3 },
];
export const cooling = paired(modules, { before: 'old', after: 'new', units: '℃' });   // 新 − 従来 for every output
const worse = cooling.rows.filter(r => r.difference > 0);
const missingIds = cooling.missing.map(i => modules[i].id);

/** Paired differences per module on one axis. `flip` reproduces the BEFORE bug (従来 − 新). */
function differenceChart({ id, flip = false, width = 800, height = 482 }) {
  const size = 18, rows = modules.map((m, i) => ({ id: m.id, d: cooling.rows.find(r => r.index === i)?.difference ?? null }));
  const plot = d => (flip ? -d : d);
  const lim = niceDomain([0, Math.max(...rows.filter(r => r.d != null).map(r => Math.abs(r.d)))], 4)[1];
  const top = flip ? 20 : 54, bottom = 84, left = 70, right = 70;
  const x = linear([-lim, lim], [left, width - right]);
  const y = band(rows.map(r => r.id), [top, height - bottom], { inner: 0.36, outer: 0.08 });
  const tick = v => (v === 0 ? '0' : signed(v, 0));
  const parts = [axis(x, { orient: 'bottom', at: height - bottom + 10, grid: [top - 6, height - bottom + 4], size: 16, format: tick, count: 4 })];
  for (const r of rows) {
    const yy = y(r.id);
    parts.push(textLines([r.id], { x: left - 18, y: yy + y.bw / 2, size, anchor: 'end', valign: 'middle', fill: 'var(--ss-ink)', weight: 600 }));
    if (r.d == null) {
      parts.push(textLines(['欠測（熱電対の断線）'], { x: x(0) + 14, y: yy + y.bw / 2, size: 17, valign: 'middle', fill: 'var(--ss-muted)' }));
      continue;
    }
    const v = plot(r.d), x0 = x(0), x1 = x(v), better = r.d < 0;
    parts.push(el('path', { d: barPath(Math.min(x0, x1), yy, Math.abs(x1 - x0), y.bw, 3, v >= 0 ? 'right' : 'left'), fill: better ? 'var(--ss-accent)' : 'var(--ss-negative)' }));
    parts.push(textLines([signed(v)], { x: x1 + (v >= 0 ? 10 : -10), y: yy + y.bw / 2, size, anchor: v >= 0 ? 'start' : 'end', valign: 'middle', fill: 'var(--ss-ink)', weight: 700, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  }
  if (!flip) {                                           // which side means what, stated where the eye starts
    parts.push(textLines(['← 新プレートで小さい'], { x: x(0) - 12, y: 22, size: 17, anchor: 'end', fill: 'var(--ss-accent)', weight: 600 }));
    parts.push(textLines(['新プレートで大きい →'], { x: x(0) + 12, y: 22, size: 17, fill: 'var(--ss-negative)', weight: 600 }));
  }
  parts.push(textLines([flip ? '温度上昇の差（℃）' : '温度上昇の差（新プレート − 従来プレート、℃）'], { x: (left + width - right) / 2, y: height - 18, size: 17, anchor: 'middle', fill: 'var(--ss-muted)' }));
  return svgRoot({ id, width, height, title: '電池モジュール別の温度上昇の差', desc: flip
    ? '棒は従来プレート−新プレートで描かれている。'
    : `新プレート−従来プレート。${cooling.below}台で負、${cooling.above}台で正、${missingIds.join('・')}は欠測。` }, ...parts);
}

pair('paired-sign', {
  failure: '図の棒と平均で、差の引き算の向きが逆',
  repair: '差は「新 − 従来」に統一し、棒・軸・平均をそろえる',
  className: 'st--rail',
  lesson: {
    failure: 'the bars plot old − new (mostly positive) while the rail reports the mean of new − old (−1.1 ℃).',
    repair: 'one subtraction order (paired(..., after − before)) feeds the bars, the axis title, the side labels and the summary.',
    keep: 'the module that got worse (M4), the missing pair (M5) and the n−1 standard deviation.',
  },
  page: (v, tag) => labPage({
    head: `新プレートで温度上昇が小さくなったのは、${nw(`${cooling.n}台中${cooling.below}台`)}`,
    quiet: `平均の差は${num(cooling.mean, 1)}℃（新 − 従来）。${worse.map(r => `${r.id}だけは逆に${num(r.difference, 1)}℃大きい`).join('')}`,
    body: `<figure class="st-fig" data-region="primary">${differenceChart({ id: `paired-${v}`, flip: v === 'before' })}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi">${v === 'before' ? fault(`<b class="is-accent">${num(cooling.mean, 1)}<small>℃</small></b>`) : `<b class="is-accent">${num(cooling.mean, 1)}<small>℃</small></b>`}<span>平均の差（新 − 従来、${cooling.n}台）</span></div>
  <hr class="st-rule">
  <div class="st-kpi"><b>${num(cooling.sampleSD, 1)}<small>℃</small></b><span>差の標準偏差（n − 1）。台ごとのばらつきは平均の差と同じくらい</span></div>
  <hr class="st-rule">
  <p class="st-text">${missingIds.join('・')}は新プレートの測定中に熱電対が断線。平均は残る${cooling.n}台で計算</p>
</div>
${v === 'before' ? note('棒は「従来 − 新」、平均は「新 − 従来」。', '図ではほとんどが＋なのに、平均は−になる。', 'left:470px;top:404px;width:400px') : ''}`,
    source: `${SYNTH}・電池モジュール6台、2C放電30分、室温25℃。温度上昇＝最高セル温度 − 室温`,
    tag,
  }),
});

// ════════════════════════════════════════════════════════════════════════════
// 3 · 欠測 — a line drawn straight across a month that was never measured
// ════════════════════════════════════════════════════════════════════════════
const turbidity = [3.1, 2.8, 4.0, 5.2, 6.8, 11.4, null, 12.9, 8.1, 5.6, 3.9, 3.3];  // 度・中川橋、毎月第1水曜に採水（2025年）
const turbidityGap = { month: 7, reason: '増水で採水を中止' };
const turbidityLimit = 10;                                 // 度・浄水場が取水を絞る目安（架空の運用基準）
const turbidityPoints = turbidity.map((y, i) => ({ x: i + 1, y }));
const overLimit = turbidityPoints.filter(p => p.y != null && p.y > turbidityLimit).map(p => `${p.x}月`);
if (turbidity[turbidityGap.month - 1] !== null) throw Error('the gap month must be null in the data');

pair('missing-is-not-a-line', {
  failure: '欠測した7月を、線でつないで描いた',
  repair: '欠測の月で線を切り、理由を書き添える',
  lesson: {
    failure: 'June and August are joined by a straight line, so the unmeasured flood month reads as an observed transition.',
    repair: 'keep July as null: the engine breaks the line (segments()), and a band names the gap and its reason.',
    keep: 'every observed value, the threshold, the reason for the gap; missing is neither zero nor an average of neighbours.',
  },
  page: (v, tag) => {
    const kept = v === 'before' ? segments(turbidityPoints).flat() : turbidityPoints;  // BEFORE drops the gap → the line bridges it
    const chart = lineChart({
      id: `turbidity-${v}`, width: 1152, height: 482, fontSize: 17, locale: 'ja', xType: 'linear',
      title: '中川橋の濁度（月1回の採水、2025年）',
      desc: `濁度は${overLimit.join('と')}に${turbidityLimit}度を超えた。${turbidityGap.month}月は${turbidityGap.reason}のため欠測。`,
      series: [{ name: '中川橋', points: kept.map(p => [p.x, p.y]) }],
      xTicks: 12, xFormat: m => `${m}月`, xDomain: [1, 12], yDomain: [0, 15], yTicks: 3, unit: '濁度（度）',
      markers: 'all', endLabels: false, format: { digits: 1 },
      refLines: [{ y: turbidityLimit, label: `取水を絞る目安 ${turbidityLimit}度`, labelPos: 'start' }],
      bands: v === 'after' ? [{ from: turbidityGap.month - 0.42, to: turbidityGap.month + 0.42 }] : [],
      extra: ({ x, y }) => v === 'after'
        ? textLines(['欠測', turbidityGap.reason], { x: x(turbidityGap.month), y: y(2.4), size: 17, anchor: 'middle', fill: 'var(--ss-ink)', weight: 600, lineHeight: 1.35 })
        : svgRing(x(6) - 22, y(13.5), x(8) - x(6) + 44, y(10.4) - y(13.5)),
    });
    return labPage({
      head: `中川橋の濁度は、${overLimit.join('と')}に${turbidityLimit}度を超えた`,
      quiet: `${turbidityGap.month}月は${turbidityGap.reason}したため、値は分からない`,
      body: `<figure class="st-fig" data-region="primary">${chart}</figure>
${v === 'before' ? note('7月は測っていないのに、6月と8月を線でつないでいる。', '線は観測した変化に見える。増水した月の値こそ分からない。', 'left:700px;top:500px;width:440px') : ''}`,
      source: `${SYNTH}・中川橋の定点、毎月第1水曜に採水（2025年）。${v === 'before' ? '7月は欠測' : '取水の目安は架空の運用基準'}`,
      tag,
    });
  },
});

// ════════════════════════════════════════════════════════════════════════════
// 4 · 分かれ道 — three alternative outcomes drawn as a sequence
// ════════════════════════════════════════════════════════════════════════════
const returns = {                                          // 電動工具の返品、2026年9月受付分。日数は受付から発送までの営業日
  received: 412,
  outcomes: [
    { id: 'back', label: '返却', condition: '不具合なし', count: 255, days: 2 },
    { id: 'fix', label: '修理', condition: '修理できる不具合', count: 119, days: 9 },
    { id: 'swap', label: '交換', condition: '修理できない不具合', count: 38, days: 4 },
  ],
};
if (sum(returns.outcomes.map(o => o.count)) !== returns.received) throw Error('outcomes must add up to the returns received');
const share = o => o.count / returns.received;
// The meaning first: inspection leads to exactly one of three outcomes, each under a stated condition.
const branchGraph = {
  kind: 'alternatives', origin: 'inspect', outcomes: returns.outcomes.map(o => o.id),
  nodes: [{ id: 'inspect', label: '検査' }, ...returns.outcomes.map(o => ({ id: o.id, label: o.label }))],
  edges: returns.outcomes.map(o => ({ from: 'inspect', to: o.id, kind: 'condition', label: o.condition })),
};
validateGraph(branchGraph);
// The BEFORE drawing as a graph: validateGraph() refuses it, which is the point.
const chainEdges = returns.outcomes.slice(1).map((o, i) => ({ from: returns.outcomes[i].id, to: o.id, kind: 'sequence' }));
let chainRejected = '';
try { validateGraph({ ...branchGraph, edges: [{ ...branchGraph.edges[0] }, ...chainEdges] }); } catch (e) { chainRejected = e.message; }

pair('conditional-outcomes', {
  failure: '検査後の分かれ道を、一本の順路として描いた',
  repair: '検査から3つの行き先へ、条件を書いて直接分ける',
  lesson: {
    failure: `returned items appear to go 返却 → 修理 → 交換 in sequence. validateGraph() rejects that drawing: "${chainRejected}".`,
    repair: 'declare the alternatives graph, validate it, then draw one conditional edge from the inspection to each outcome.',
    keep: 'the three outcomes, their conditions, counts that add up to 412, and that outcomes exclude each other.',
  },
  page: (v, tag) => {
    const nodes = [
      { id: 'in', label: '返品を受け付ける', sub: `9月 ${num(returns.received)}件`, kind: 'terminal' },
      { id: 'inspect', label: '全数検査', kind: 'decision' },
      ...returns.outcomes.map(o => ({ id: o.id, label: o.label, sub: `${o.count}件（${num(share(o) * 100)}%）・平均${o.days}日` })),
    ];
    const edges = v === 'before'
      ? [{ from: 'in', to: 'inspect' }, { from: 'inspect', to: 'back' }, ...chainEdges.map(e => ({ from: e.from, to: e.to }))]
      : [{ from: 'in', to: 'inspect' }, ...branchGraph.edges.map(e => ({ from: e.from, to: e.to, label: e.label }))];
    const diagram = flowDiagram({
      id: `returns-${v}`, width: 1152, height: 482, fontSize: 20, nodeMaxWidth: 200, nodeMinWidth: 120, gap: 44,
      title: '返品の検査と、その後の行き先',
      desc: v === 'before' ? '返却、修理、交換が順番につながって描かれている。'
        : `検査の結果で、${returns.outcomes.map(o => `${o.condition}なら${o.label}`).join('、')}に分かれる。`,
      nodes, edges,
      extra: ctx => (v === 'before' ? svgRing(ctx.nodes.back.x - 16, ctx.nodes.back.y - 16, ctx.nodes.swap.x + ctx.nodes.swap.w - ctx.nodes.back.x + 32, ctx.nodes.back.h + 32) : ''),
    });
    const top = returns.outcomes[0];
    return labPage({
      head: `返品は検査の結果で、${returns.outcomes.map(o => o.label).join('・')}のどれか1つに進む`,
      quiet: `9月の${num(returns.received)}件では、${num(share(top) * 100)}%が${top.condition}で${top.label}`,
      body: `<figure class="st-fig" data-region="primary">${diagram}</figure>
${v === 'before' ? note('返却・修理・交換は順番ではない。', '検査の結果で、どれか1つに分かれる。', 'left:690px;top:520px;width:420px') : ''}`,
      source: `${SYNTH}・電動工具の返品（2026年9月受付分）。日数は受付から発送までの営業日`,
      tag,
    });
  },
});

// ════════════════════════════════════════════════════════════════════════════
// 5 · 色の対応 — a three-colour legend over three identical ink lines
// ════════════════════════════════════════════════════════════════════════════
const weeks = ['7/7', '7/14', '7/21', '7/28', '8/4', '8/11', '8/18', '8/25', '9/1', '9/8', '9/15', '9/22'];
const queues = [                                           // 平均待ち時間（分）・区民課の受付窓口、平日9〜17時
  { name: '本庁舎', values: [18, 17, 19, 18, 17, 18, 19, 18, 17, 18, 18, 17] },
  { name: '北支所', values: [16, 17, 16, 18, 17, 22, 25, 27, 29, 31, 33, 34] },
  { name: '南支所', values: [12, 13, 12, 12, 14, 13, 12, 13, 13, 12, 13, 12] },
];
const queueChange = { week: '8/11', text: '8/11から窓口を3席から2席に' };
const north = queues.find(q => q.name === '北支所');
const othersRange = extent(queues.filter(q => q !== north).flatMap(q => q.values));

pair('encoding-map', {
  failure: '凡例の色と、線の色が対応していない',
  repair: '色の対応を1つにし、線の端に名前を直接書く',
  lesson: {
    failure: 'a three-colour legend sits over three lines drawn in the same ink; no line can be identified.',
    repair: 'one encoding map: the highlighted series takes the accent, the others context grey, and every line is named at its end.',
    keep: 'all three series on one scale, the week axis, the event that explains the change.',
  },
  page: (v, tag) => {
    const legendItems = queues.map((q, i) => ({ label: q.name, color: `var(--ss-cat-${i + 1})` }));
    const chart = lineChart({
      id: `queues-${v}`, width: 1152, height: 482, fontSize: 17, locale: 'ja',
      title: '窓口別の平均待ち時間（分、週ごと）',
      desc: `北支所だけが8月から伸び、${north.values.at(-1)}分。本庁舎と南支所は${othersRange[0]}〜${othersRange[1]}分。`,
      x: weeks, unit: '平均待ち時間（分）', yDomain: [0, 40], yTicks: 4, xEvery: 1,
      series: v === 'before' ? queues.map(q => ({ ...q, color: 'var(--ss-ink)' })) : queues,
      highlight: v === 'after' ? north.name : null, endLabels: v === 'after', markers: v === 'after' ? 'last' : 'none',
      format: { digits: 0, suffix: '分' },
      annotate: v === 'after' ? [{ series: north.name, at: queueChange.week, text: queueChange.text, dx: -40, dy: -70, size: 17, width: 220 }] : [],
      after: v === 'before'
        ? legend(legendItems, { x: 760, y: 14, size: 17, gap: 28 }) + svgRing(744, -6, 392, 40)
        : '',
    });
    return labPage({
      head: `${v === 'after' ? '<em>北支所</em>' : '北支所'}の待ち時間だけが8月から伸び、${north.values.at(-1)}分になった`,
      quiet: `本庁舎と南支所は${othersRange[0]}〜${othersRange[1]}分で、ほぼ横ばい`,
      body: `<figure class="st-fig" data-region="primary">${chart}</figure>
${v === 'before' ? note('凡例は3色なのに、線はすべて同じ色。', 'どの線が北支所なのか、読み取れない。', 'left:820px;top:236px;width:380px') : ''}`,
      source: `${SYNTH}・区民課の受付窓口、平日9〜17時の平均待ち時間（週ごと、2026年）`,
      tag,
    });
  },
});

// ════════════════════════════════════════════════════════════════════════════
// 6 · 試算の範囲 — an estimate asserted in the headline, qualified in 12 px
// ════════════════════════════════════════════════════════════════════════════
const closeTasks = [                                       // 月次決算の工程（営業日）。now＝2026年上期の実績平均、est＝ベンダー試算
  { name: '仕訳の締め', now: 1.5, est: 1.0 },
  { name: '売掛金の照合', now: 2.0, est: 0.5 },
  { name: '固定資産・引当金', now: 1.0, est: 1.0 },
  { name: '連結とレビュー', now: 1.5, est: 1.5 },
];
const closeNow = sum(closeTasks.map(t => t.now)), closeEst = sum(closeTasks.map(t => t.est));
const changedTasks = closeTasks.filter(t => t.est !== t.now).map(t => t.name);
const trial = { period: '2027年1〜3月', checks: ['締めまでの営業日数', '手作業で残る照合の件数', '旧システムとの差異'] };

pair('proposal-scope', {
  failure: '試算を言い切りの見出しにし、注記を小さくした',
  repair: '「試算」と確かめる方法を、見出しと図に書く',
  lesson: {
    failure: 'the headline states a vendor estimate as a fact; the only qualification is a 12 px note under the chart.',
    repair: 'name the status (vendor estimate) in the headline and the bar label, mark the estimated bar, and state how it will be measured.',
    keep: 'the current measured close, the estimated tasks, the size of the claimed saving.',
  },
  page: (v, tag) => {
    const rows = v === 'before' ? ['現在', '新システム'] : ['現在（2026年上期の実績）', '新システム（ベンダー試算）'];
    const chart = stackedBarChart({
      id: `close-${v}`, width: 1152, height: 300, fontSize: 18, locale: 'ja', labelWidth: 260,
      title: '月次決算にかかる営業日（工程別）',
      desc: `現在${num(closeNow, 1)}営業日、新システムは試算で${num(closeEst, 1)}営業日。変わるのは${changedTasks.join('と')}。`,
      categories: rows, series: closeTasks.map(t => ({ name: t.name, values: [t.now, t.est] })),
      highlight: changedTasks, format: { digits: 1 }, axis: true, unit: '営業日',
      extra: ({ x, y }) => v === 'after'
        ? el('rect', { x: x(0) - 4, y: y(rows[1]) - 4, width: x(closeEst) - x(0) + 8, height: y.bw + 8, rx: 4, fill: 'none', stroke: 'var(--ss-ink)', 'stroke-width': 1.5, 'stroke-dasharray': '6 5' })
        : '',
    });
    return labPage({
      head: v === 'before'
        ? `新システムで、月次決算は${num(closeNow - closeEst)}営業日早く締まる`
        : `ベンダー試算では、月次決算は${num(closeNow)}営業日から${num(closeEst)}営業日に縮む`,
      quiet: v === 'before' ? '売掛金の照合が自動になり、手作業が減る' : `社内での実測はまだない。${trial.period}の並行稼働で確かめる`,
      body: `<figure class="st-fig st-top" data-region="primary" style="top:200px;bottom:auto;height:300px">${chart}</figure>
${v === 'before'
    ? `<p class="lab-tiny" style="top:520px">${fault('※ベンダー提示の試算値です。当社の環境での実測ではありません。')}</p>`
    : `<p class="lab-under" style="top:540px"><b>並行稼働で測ること</b>　${trial.checks.join('、')}。点線の枠は試算の値</p>`}
${v === 'before' ? note('見出しは実測のように言い切り、', '「試算」は12pxの注記にしか書かれていない。', 'left:640px;top:548px;width:420px') : ''}`,
      source: `${SYNTH}・経理部の月次決算（営業日）。${v === 'before' ? '' : '新システムの値はベンダー提示の試算'}`,
      tag,
    });
  },
});

// ════════════════════════════════════════════════════════════════════════════
// 7 · 指示を先に — a slogan where the traveller needs an instruction
// ════════════════════════════════════════════════════════════════════════════
const journey = [                                          // 架空の路線。乗換駅には中間改札がある
  { station: '東浜駅', role: '乗車', act: 'きっぷを改札に入れる', result: '取り出して持っておく' },
  { station: '中央駅', role: '乗り換え', act: '乗換改札にもう一度入れる', result: 'また戻ってくる' },
  { station: '北山駅', role: '降車', act: '出口の改札に入れる', result: 'ここで回収される' },
];
const lines = ['みなと線', '北山線'];

/** A route strip: stations at equal steps, what the traveller does under each. Geometry from `journey`. */
function journeyStrip(id, { width = 1152, height = 400 } = {}) {
  const x = i => 150 + i * ((width - 300) / (journey.length - 1)), trackY = 120, last = journey.length - 1;
  const parts = [el('line', { x1: x(0), x2: x(last), y1: trackY, y2: trackY, stroke: 'var(--ss-ink)', 'stroke-width': 8, 'stroke-linecap': 'round' })];
  lines.forEach((name, i) => parts.push(textLines([name], { x: (x(i) + x(i + 1)) / 2, y: trackY - 22, size: 18, anchor: 'middle', fill: 'var(--ss-muted)', weight: 600 })));
  journey.forEach((s, i) => {
    const end = i === last, c = end ? 'var(--ss-accent)' : 'var(--ss-ink)';
    parts.push(el('circle', { cx: x(i), cy: trackY, r: 17, fill: 'var(--ss-paper)', stroke: c, 'stroke-width': 6 }));
    parts.push(textLines([`${s.station}（${s.role}）`], { x: x(i), y: 40, size: 22, anchor: 'middle', fill: 'var(--ss-ink)', weight: 700 }));
    parts.push(textLines([s.act], { x: x(i), y: 190, size: 20, anchor: 'middle', fill: 'var(--ss-ink)' }));
    parts.push(textLines(['↓'], { x: x(i), y: 232, size: 20, anchor: 'middle', fill: c }));
    parts.push(textLines([s.result], { x: x(i), y: 274, size: 22, anchor: 'middle', fill: c, weight: 700 }));
  });
  parts.push(textLines(['途中で捨てると、北山駅で東浜駅からの運賃をもう一度払うことになる。'], { x: width / 2, y: 360, size: 20, anchor: 'middle', fill: 'var(--ss-muted)' }));
  return svgRoot({ id, width, height, title: 'きっぷの扱い：乗車から降車まで', desc: journey.map(s => `${s.station}で${s.act}と${s.result}`).join('。') }, ...parts);
}

pair('literal-before-clever', {
  failure: 'すべき行動の代わりに、うたい文句を見出しにした',
  repair: '利用者がすることを、そのまま見出しに書く',
  lesson: {
    failure: 'the headline promises "smoothness" and never says what to do; the instruction is buried in the diagram.',
    repair: 'write the direct instruction first (keep the ticket until the last gate); keep a friendly tone only after the meaning works.',
    keep: 'the three gates, what happens to the ticket at each, the consequence of losing it.',
  },
  page: (v, tag) => labPage({
    head: v === 'before' ? fault('3つのステップで、乗り換えをもっとスムーズに。') : 'きっぷは、最後の改札を出るまで捨てずに持っておく',
    quiet: v === 'before' ? 'はじめての方も、安心してご利用いただけます' : '乗換駅の改札に入れたきっぷは、もう一度戻ってくる',
    body: `<figure class="st-fig" data-region="primary" style="top:216px">${journeyStrip(`journey-${v}`)}</figure>
${v === 'before' ? note('何をすればよいかが書かれていない。', '要点（きっぷを最後まで持つ）を見出しに書く。', 'left:780px;top:62px;width:400px') : ''}`,
    source: `${SYNTH}・架空の路線の乗り換え案内（はじめての利用者向け）`,
    tag,
  }),
});

// ════════════════════════════════════════════════════════════════════════════
// 8 · 余白の配分 — small cards crowd the top while half the page is empty
// ════════════════════════════════════════════════════════════════════════════
const checkupSteps = [                                     // 健診の受診から結果の到着まで（営業日）。2026年4〜9月の受診者1,240人の平均
  { label: '受診・採血', days: 0.5, note: '受診の当日。尿と血液の検体を採る' },
  { label: '検体検査', days: 1, note: '提携の検査センターで測定する' },
  { label: '医師の判定', days: 3, note: '所見がある人は、2人の医師が確認する' },
  { label: '印刷・郵送', days: 1.5, note: '判定の翌営業日に発送する' },
];
const checkupTotal = sum(checkupSteps.map(s => s.days));
const slowest = [...checkupSteps].sort((a, b) => b.days - a.days)[0];

/** Steps as rows, durations as bars on one day axis (a small Gantt). */
function stepTimeline(id, { width = 1152, height = 470 } = {}) {
  const textW = 470, x = linear([0, Math.ceil(checkupTotal)], [textW + 40, width - 70]);
  const y = band(checkupSteps.map(s => s.label), [8, height - 56], { inner: 0.3, outer: 0.05 });
  const parts = [axis(x, { orient: 'bottom', at: height - 46, grid: [0, height - 52], size: 16, format: d => `${d}日`, count: 6 })];
  let start = 0;
  for (const s of checkupSteps) {
    const yy = y(s.label), hl = s === slowest, fill = hl ? 'var(--ss-accent)' : 'var(--ss-context)';
    parts.push(textLines([s.label], { x: 0, y: yy + 30, size: 22, fill: 'var(--ss-ink)', weight: 700 }));
    parts.push(textLines(wrapText(s.note, textW, 19), { x: 0, y: yy + 64, size: 19, fill: 'var(--ss-muted)', lineHeight: 1.45 }));
    parts.push(el('rect', { x: x(start), y: yy + 14, width: x(start + s.days) - x(start) - 2, height: y.bw - 28, rx: 3, fill }));
    parts.push(textLines([`${num(s.days, s.days % 1 ? 1 : 0)}日`], { x: x(start + s.days) + 10, y: yy + y.bw / 2, size: 20, valign: 'middle', fill: hl ? 'var(--ss-accent)' : 'var(--ss-ink)', weight: 700 }));
    start += s.days;
  }
  return svgRoot({ id, width, height, title: '健診の受診から結果が届くまでの工程と日数', desc: `合計${checkupTotal}営業日。${slowest.label}が${slowest.days}日で最も長い。` }, ...parts);
}

pair('small-top-heavy', {
  failure: '小さな枠4つが上に詰まり、下半分が空いている',
  repair: '日数を長さで描き、説明を読める大きさにする',
  readingMode: 'live',
  lesson: {
    failure: 'four boxed steps with 14 px text sit in the top third; the lower half of the page is empty.',
    repair: 'allocate the page to the evidence: one row per step at reading size, durations drawn as lengths on a shared day axis.',
    keep: 'every step, its explanation and its duration; the total and the slowest step.',
  },
  page: (v, tag) => labPage({
    head: `健診の結果は、受診から平均${checkupTotal}営業日で届く`,
    quiet: `いちばん長いのは${v === 'after' ? `<em>${slowest.label}</em>` : slowest.label}で、${slowest.days}日かかる`,
    body: v === 'before'
      ? `<div class="lab-cards" data-region="primary">${fault(checkupSteps.map(s => `<div class="lab-card"><h3>${s.label}</h3><p>${s.note}</p><p>${num(s.days, s.days % 1 ? 1 : 0)}日</p></div>`).join(''))}</div>
${note('14pxの文字が上に詰まり、下半分が空いている。', '工程と日数を、ページ全体を使って描く。', 'left:64px;top:380px;width:430px')}`
      : `<figure class="st-fig" data-region="primary" style="top:188px;bottom:50px">${stepTimeline(`checkup-${v}`)}</figure>`,
    source: `${SYNTH}・2026年4〜9月の受診者1,240人の平均（営業日）`,
    tag,
  }),
});

// ════════════════════════════════════════════════════════════════════════════
// 9 · 比べる表 — a comparison split into cards, fields dropped to fit
// ════════════════════════════════════════════════════════════════════════════
const sites = [                                            // 移転候補。賃料は共益費込み・税抜（2026年10月時点の仲介資料）
  { name: '川端ビル', rent: 486, area: 180, walk: 4, from: '2027年4月', quake: '新耐震', rooms: 3 },
  { name: '新港テラス', rent: 412, area: 172, walk: 9, from: '2027年1月', quake: '新耐震', rooms: 2 },
  { name: '北浜第2ビル', rent: 538, area: 205, walk: 2, from: '2027年6月', quake: null, rooms: 4 },
  { name: '中町スクエア', rent: 365, area: 140, walk: 7, from: '2026年12月', quake: '旧耐震・補強済み', rooms: 1 },
];
const perTsubo = s => Math.round((s.rent * 10000) / s.area);    // 円／坪
const cheapest = [...sites].sort((a, b) => perTsubo(a) - perTsubo(b))[0];
const unconfirmed = sites.filter(s => s.quake == null);

pair('dense-reference', {
  failure: '比べるための表をカードに分け、項目を削った',
  repair: '全項目を1つの表にそろえ、未確認の欄も残す',
  readingMode: 'reference',
  lesson: {
    failure: 'four cards in 15 px, each listing only four of seven fields; 耐震基準 and the unknown entry disappear.',
    repair: 'one aligned table: same columns, units in the header, a computed comparable (yen per tsubo), the unknown kept as 確認中.',
    keep: 'all four sites and all seven fields, units, the date of the quotes, the open question.',
  },
  page: (v, tag) => labPage({
    head: `坪単価がもっとも低いのは${cheapest.name}`,
    quiet: `${unconfirmed.map(s => s.name).join('・')}は耐震基準を確認中。回答は11月末`,
    body: v === 'before'
      ? `<div class="lab-cards" data-region="primary" style="top:200px">${fault(sites.map(s => `<div class="lab-card"><h3>${s.name}</h3><p>賃料 ${s.rent}万円／月<br>${s.area}坪・駅から${s.walk}分<br>入居 ${s.from}〜</p></div>`).join(''))}</div>
${note('カードに分けたので、横に並べて比べられない。', '耐震基準と会議室、坪単価の3項目も消えた。', 'left:64px;top:390px;width:440px')}`
      : `<table class="lab-table" data-region="primary">
  <thead><tr><th>物件</th><th class="n">賃料（万円／月）</th><th class="n">面積（坪）</th><th class="n">坪単価（円）</th><th class="n">駅から</th><th>入居できる時期</th><th>耐震基準</th><th class="n">会議室</th></tr></thead>
  <tbody>${sites.map(s => `<tr><td><b>${s.name}</b></td><td class="n">${num(s.rent)}</td><td class="n">${num(s.area)}</td><td class="n${s === cheapest ? ' is-best' : ''}">${num(perTsubo(s))}</td><td class="n">徒歩${s.walk}分</td><td>${s.from}</td><td${s.quake ? '' : ' class="is-open"'}>${s.quake ?? '確認中（11月末に回答）'}</td><td class="n">${s.rooms}室</td></tr>`).join('')}</tbody>
</table>`,
    source: `${SYNTH}・仲介会社の資料（2026年10月時点）。賃料は共益費込み、税抜。坪単価＝賃料÷面積`,
    tag,
  }),
});

// ════════════════════════════════════════════════════════════════════════════
// 10 · 写真の扱い — the photograph shrunk into a rounded card
// ════════════════════════════════════════════════════════════════════════════
const photo = { src: '{{asset:assets/media/photo.jpg}}', w: 600, h: 400, credit: 'Rachel Michetti（Pikolo Espresso Bar 提供、CC0）' };
const crop = { x: 130, y: 0, w: 400, h: 370, scale: 1.3 };   // 原画の切り取り範囲（px）と表示倍率
const cremaNotes = [                                       // 原画の座標で指す。写真で確かめられることだけを書く
  { at: [292, 150], title: '色', text: 'むらのないヘーゼルナッツ色。薄い黄色なら抽出不足、黒っぽければ抽出しすぎ' },
  { at: [300, 101], title: '縁', text: 'カップの壁に沿って少し濃い。表面の色むらとは別に見る' },
];

/** The cropped photograph with leader lines to notes on its right. Geometry from `crop` and `cremaNotes`. */
function cremaFigure(id, { width = 1152, height = 482 } = {}) {
  const pw = crop.w * crop.scale, ph = crop.h * crop.scale, noteX = pw + 96;
  const toFig = ([px, py]) => [(px - crop.x) * crop.scale, (py - crop.y) * crop.scale];
  const parts = [
    el('defs', {}, el('clipPath', { id: `${id}-clip` }, el('rect', { x: 0, y: 0, width: pw, height: ph }))),
    el('image', { href: photo.src, x: -crop.x * crop.scale, y: -crop.y * crop.scale, width: photo.w * crop.scale, height: photo.h * crop.scale, 'clip-path': `url(#${id}-clip)`, preserveAspectRatio: 'none' }),
  ];
  cremaNotes.forEach((n, i) => {
    const [x, y] = toFig(n.at), ty = 70 + i * 190;
    parts.push(el('circle', { cx: x, cy: y, r: 7, fill: 'var(--ss-paper)', stroke: 'var(--ss-ink)', 'stroke-width': 2.5 }));
    parts.push(el('path', { d: `M${x + 7} ${y}H${pw + 24}L${noteX - 16} ${ty}H${noteX - 8}`, fill: 'none', stroke: 'var(--ss-ink)', 'stroke-width': 1.5 }));
    parts.push(textLines([n.title], { x: noteX, y: ty, size: 24, valign: 'middle', fill: 'var(--ss-ink)', weight: 700 }));
    parts.push(textLines(wrapText(n.text, width - noteX, 20), { x: noteX, y: ty + 44, size: 20, fill: 'var(--ss-ink)', lineHeight: 1.6 }));
  });
  return svgRoot({ id, width, height, title: 'エスプレッソのクレマ（真上から）', desc: cremaNotes.map(n => `${n.title}：${n.text}`).join('。') }, ...parts);
}

pair('image-evidence', {
  failure: '写真を小さなカードに入れ、説明と切り離した',
  repair: '写真を大きく切り取り、説明を指す場所に添える',
  lesson: {
    failure: 'the photograph is a 270 px thumbnail in a rounded, shadowed card; the notes beside it cannot point at anything.',
    repair: 'crop to the subject, show it at ≤ 1.3× native size, and attach each note with a leader to the place it describes.',
    keep: 'the actual photograph, the credit and licence, and a statement of the crop and scale.',
  },
  page: (v, tag) => labPage({
    head: '抽出がうまくいったかは、まずクレマの色とむらで見る',
    quiet: 'この一杯は色がそろっていて、適正な抽出の例',
    body: v === 'before'
      ? `<div style="position:absolute;left:64px;top:206px">${fault(`<img src="${photo.src}" alt="エスプレッソのカップ" style="display:block;width:270px;height:180px;object-fit:cover;border-radius:18px;box-shadow:0 10px 26px rgb(24 42 62 / .22)">`)}</div>
<ul class="st-text" data-region="primary" style="position:absolute;left:380px;top:206px;width:520px;margin:0;padding-left:1.2em">${cremaNotes.map(n => `<li>${n.title}：${n.text}</li>`).join('')}</ul>
${note('写真が小さく、説明が写真のどこを', '指しているのか分からない。', 'left:64px;top:420px;width:400px')}`
      : `<figure class="st-fig" data-region="primary" style="bottom:56px">${cremaFigure(`crema-${v}`)}</figure>`,
    source: `写真：${photo.credit}${v === 'after' ? `。原画${photo.w}×${photo.h}を切り取り、${crop.scale}倍で表示` : ''}`,
    tag,
  }),
});

// ════════════════════════════════════════════════════════════════════════════
// 11 · 文字種の混入 — an untranslated Hindi word left in a Japanese headline
// ════════════════════════════════════════════════════════════════════════════
const defectRate = [                                       // 不良率（%）＝不良数÷検査数。プネ工場の月次品質報告（英語版）から
  { label: '4月', value: 2.8 }, { label: '5月', value: 2.5 }, { label: '6月', value: 2.1 },
  { label: '7月', value: 1.6 }, { label: '8月', value: 1.3 }, { label: '9月', value: 1.1 },
];
const inspectionChange = { month: '6月', text: '6月から外観検査を画像検査に切り替え' };
const firstRate = defectRate[0], lastRate = defectRate.at(-1);
const sourceWord = { found: 'दर', intended: '率' };        // दर = "rate" (Hindi), left over from the source report

pair('source-before-font', {
  failure: '訳し漏れたヒンディー語が、見出しに残った',
  repair: '原文に戻って訳語を直す。意図した表記（Pune）は残す',
  lesson: {
    failure: `the headline contains "${sourceWord.found}" (Hindi for "rate") from the source report; it renders in a fallback face.`,
    repair: `fix the text at its source ("${sourceWord.intended}"), then check the rendered font. Swapping fonts would only hide the error.`,
    keep: 'intentional multilingual names such as プネ（Pune）, and the definition of the rate.',
  },
  page: (v, tag) => labPage({
    head: `プネ工場の不良${v === 'before' ? fault(sourceWord.found) : sourceWord.intended}は、${nw(`${firstRate.label}の${num(firstRate.value, 1)}%`)}から${nw(`${lastRate.label}の${num(lastRate.value, 1)}%`)}に下がった`,
    quiet: `${inspectionChange.text}てから、下がり方が速くなった`,
    body: `<figure class="st-fig" data-region="primary">${columnChart({
      id: `defects-${v}`, width: 1152, height: 482, fontSize: 18, locale: 'ja',
      title: 'プネ工場の不良率（%、月別）', desc: `${firstRate.label}${firstRate.value}%から${lastRate.label}${lastRate.value}%へ。`,
      data: defectRate, format: { digits: 1, suffix: '%' }, highlight: lastRate.label, unit: '不良率（%）',
      annotate: [{ at: inspectionChange.month, text: inspectionChange.text, dx: 0, dy: -64, size: 17, width: 260 }],
    })}</figure>
${v === 'before' ? note(`「${sourceWord.found}」はヒンディー語で「率」。`, '訳し漏れなので、フォントを替えても直らない。', 'left:470px;top:130px;width:420px') : ''}`,
    source: `${SYNTH}・プネ（Pune）工場の月次品質報告（英語版）から翻訳。不良率＝不良数÷検査数`,
    tag,
  }),
});

// ════════════════════════════════════════════════════════════════════════════
// 12 · 操作メモ — an export note printed on the audience's page
// ════════════════════════════════════════════════════════════════════════════
const horizon = 36;                                        // か月。period.mjs は同じ3案を12・36・60か月で比べる
const planTotals = offers.map(o => ({ ...o, total: totalCost({ ...o, months: horizon, units: '万円' }).value }));
const cheapestPlan = [...planTotals].sort((a, b) => a.total - b.total)[0];
const runnerUp = [...planTotals].sort((a, b) => a.total - b.total)[1];
const shortWinner = cheapestRuns()[0];                     // 短い期間でもっとも安い案と、その境目（か月）
const exportMemo = '配布用メモ：印刷・PDFでは36か月表示が残ります。';

pair('export-note', {
  failure: '出力のための操作メモが、スライドの本文に出ている',
  repair: '表示している条件を書き、操作メモは台本に移す',
  copyWaivers: [
    { rule: 'ja-export-production-cue', quote: '配布用メモ：', reason: 'Repair-lab BEFORE page quoting the production note it teaches readers to remove.' },
    { rule: 'ja-export-production-cue', quote: '印刷・PDFでは36か月表示が残', reason: 'Repair-lab BEFORE page quoting the production note it teaches readers to remove.' },
  ],
  lesson: {
    failure: 'an operator note about printing and PDF export is set on the canvas where the audience reads it; the comparison condition is missing.',
    repair: 'print the condition the numbers depend on (horizon, formula, exclusions); move export behaviour to notes or a runbook.',
    keep: 'the three plans on one scale, the horizon and formula, what the totals exclude.',
  },
  page: (v, tag) => {
    const chart = barChart({
      id: `plans-${v}`, width: 1152, height: 300, fontSize: 20, locale: 'ja', rowHeight: 84,
      title: `${horizon}か月の総額（万円）`, desc: `${planTotals.map(p => `${p.id}案${p.total}万円`).join('、')}。`,
      data: planTotals.map(p => ({ label: `${p.id}案　${planNames[p.id]}`, value: p.total })),
      highlight: `${cheapestPlan.id}案　${planNames[cheapestPlan.id]}`, format: { digits: 0, suffix: '万円' }, domain: [0, 600], labelWidth: 330,
      extra: ({ x, y, data }) => data.map((d, i) => {
        const p = planTotals[d.i];
        return textLines([`初期${p.initial} ＋ 月額${p.monthly}×${horizon}`], { x: x(d.value) + 128, y: y.center(d.label), size: 18, valign: 'middle', fill: 'var(--ss-muted)' });
      }).join(''),
    });
    return labPage({
      head: `${horizon}か月の総額は、${v === 'after' ? `<em>${cheapestPlan.id}案</em>` : `${cheapestPlan.id}案`}がもっとも低く${num(cheapestPlan.total)}万円`,
      quiet: `${runnerUp.id}案との差は${num(runnerUp.total - cheapestPlan.total)}万円。${num(shortWinner.to)}か月未満で使い終えるなら${shortWinner.id}案が安い`,
      body: `<figure class="st-fig st-top" data-region="primary" style="top:206px;bottom:auto;height:300px">${chart}</figure>
${v === 'before'
    ? `<p class="lab-under" style="top:540px;color:var(--ss-muted)">${fault(exportMemo)}</p>
${note('出力の操作は、聴き手に関係がない。', '表示条件を書き、メモは台本へ移す。', 'left:700px;top:520px;width:380px')}`
    : `<p class="lab-under" style="top:540px"><b>表示条件</b>　${horizon}か月。総額＝初期費用＋月額×${horizon}。税と追加作業費は含まない</p>`}`,
      source: `${SYNTH}・受発注システム更新の3案の見積もり（2026年9月時点、税抜）`,
      tag,
    });
  },
});

export const lab = { title: '修正ラボ：12組の修正前と修正後', language: 'ja', mode: 'workshop', readingMode: 'read', css, slides: labSlides };

// ════════════════════════════════════════════════════════════════════════════
// Transfer talk — the same repairs applied to a three-page interim report
// (data: `modules` / `cooling` from pair 2; no new numbers are typed by hand)
// ════════════════════════════════════════════════════════════════════════════
const rig = { cells: 12, thermocouples: [1, 2, 4, 5, 7, 8, 10, 11], coolant: '冷却水20℃・毎分4L', discharge: '2C放電30分', room: '室温25℃' };
const protocol = [
  { step: '従来プレートで測る', detail: `${rig.discharge}。8点の最高温度を記録` },
  { step: '2時間置き、プレートを交換', detail: 'セルが室温に戻ったことを確かめる' },
  { step: '新プレートで同じ条件を測る', detail: '順序は6台とも「従来→新」で同じ' },
];

/** Side view of one module on its cooling plate. Cell and sensor positions come from `rig`. */
function moduleSection(id, { width = 700, height = 470 } = {}) {
  const cellW = 40, gap = 6, x0 = 40, cellTop = 150, cellH = 170, plateY = cellTop + cellH + 4, plateH = 46;
  const cx = i => x0 + i * (cellW + gap), right = cx(rig.cells - 1) + cellW;
  const parts = [];
  for (let i = 0; i < rig.cells; i++) parts.push(el('rect', { x: cx(i), y: cellTop, width: cellW, height: cellH, rx: 4, fill: 'var(--ss-surface)', stroke: 'var(--ss-muted)', 'stroke-width': 1.5 }));
  for (const i of rig.thermocouples) parts.push(el('circle', { cx: cx(i) + cellW / 2, cy: cellTop + 34, r: 7, fill: 'var(--ss-accent)' }));
  parts.push(el('rect', { x: x0 - 14, y: plateY, width: right - x0 + 28, height: plateH, rx: 4, fill: 'var(--ss-ink)' }));
  for (let k = 0; k < 6; k++) parts.push(el('circle', { cx: x0 + 26 + k * ((right - x0 - 52) / 5), cy: plateY + plateH / 2, r: 9, fill: 'var(--ss-paper)' }));
  const leader = (x1, y1, x2, y2) => el('path', { d: `M${x1} ${y1}V${y2}H${x2}`, fill: 'none', stroke: 'var(--ss-muted)', 'stroke-width': 1.3 });
  parts.push(leader(cx(rig.thermocouples[0]) + cellW / 2, cellTop + 26, x0, 100), textLines([`熱電対 ${rig.thermocouples.length}点（最高値を記録）`], { x: x0, y: 92, size: 20, fill: 'var(--ss-accent)', weight: 700 }));
  parts.push(textLines([`セル ${rig.cells}本`], { x: x0, y: 40, size: 20, fill: 'var(--ss-ink)', weight: 700 }), leader(cx(0) + 8, cellTop, x0, 48));
  parts.push(textLines(['冷却プレート（ここを交換して比べる）'], { x: x0 - 14, y: plateY + plateH + 40, size: 20, fill: 'var(--ss-ink)', weight: 700 }));
  parts.push(textLines([`流路を流れる${rig.coolant}`], { x: x0 - 14, y: plateY + plateH + 72, size: 19, fill: 'var(--ss-muted)' }));
  return svgRoot({ id, width, height, title: '電池モジュールと冷却プレートの断面（模式図）', desc: `${rig.cells}本のセルが冷却プレートの上に並び、${rig.thermocouples.length}点の熱電対で温度を測る。` }, ...parts);
}

const sampleNeed = (() => {                                // 平均差を検出力80%・両側5%で見分ける台数（正規近似）
  const z = 1.96 + 0.8416, n = Math.ceil(((z * cooling.sampleSD) / Math.abs(cooling.mean)) ** 2);
  return { n, planned: n + 2 };                            // 欠測に備えて2台を足す
})();
const nextSteps = [
  { limit: '測定の順序が6台とも「従来 → 新」', why: '2回目のほうが温度が低く出る癖があっても、プレートの差と区別できない', change: '半数の台は「新 → 従来」の順で測る' },
  { limit: `${missingIds.join('・')}が欠測（熱電対の断線）`, why: `差を${cooling.n}台だけで計算している`, change: '各セルに予備の熱電対を2点付ける' },
  { limit: `台数が${modules.length}台`, why: `差のばらつき（標準偏差${num(cooling.sampleSD, 1)}℃）に対して少ない`, change: `${sampleNeed.planned}台に増やす（必要な${sampleNeed.n}台＋予備2台）` },
];

const talkSlide = (id, title, className, content, notes) => ({ id, title, className: `st cs-wa-ai lab talk ${className}`.trim(), content, notes, exportPolicy: 'final', study: true });
export const talk = {
  title: '新しい冷却プレートの評価（中間報告）', language: 'ja', mode: 'workshop', readingMode: 'live', css: css + `
/* Talk pages: live reading, so body text is one step larger. */
.talk .talk-steps { position: absolute; left: 812px; right: 64px; top: 196px; margin: 0; padding: 0; list-style: none; counter-reset: step; }
.talk .talk-steps li { position: relative; padding: 0 0 22px 48px; margin-bottom: 22px; border-bottom: 1px solid var(--ss-rule); counter-increment: step; }
.talk .talk-steps li::before { content: counter(step); position: absolute; left: 0; top: 0; font: 700 26px/1.3 var(--ss-font-sans); color: var(--ss-accent); }
.talk .talk-steps b { display: block; font-size: 22px; line-height: 1.45; }
.talk .talk-steps span { display: block; margin-top: 4px; font-size: 19px; line-height: 1.6; color: var(--ss-muted); }
.talk .lab-table { font-size: 21px; }
.talk .lab-table td:first-child { width: 330px; font-weight: 700; }
`,
  slides: [
    talkSlide('protocol', '何を比べたか', '', labPage({
      head: `${modules.length}台のモジュールを、従来プレートと新プレートの両方で測った`,
      quiet: `比べるのは温度上昇（最高セル温度 − 室温）。${rig.discharge}、${rig.room}でそろえた`,
      body: `<figure class="st-fig" data-region="primary" style="right:auto;width:700px;top:190px;bottom:60px">${moduleSection('rig-section')}</figure>
<ol class="talk-steps" data-region="support">${protocol.map(p => `<li><b>${p.step}</b><span>${p.detail}</span></li>`).join('')}</ol>`,
      source: `${SYNTH}・試験室B、2026年9月。図は模式図で、寸法は実物と異なる`,
    }), 'Protocol before interpretation: what was compared, on which units, under which fixed conditions, in which order. The fixed order is stated here because page 3 lists it as a limitation.'),
    talkSlide('paired-result', '結果：5台の差', 'st--rail', labPage({
      head: `${cooling.n}台中${cooling.below}台で、新プレートの温度上昇が小さかった`,
      quiet: `平均の差は${num(cooling.mean, 1)}℃（新 − 従来）。${worse.map(r => r.id).join('・')}は大きく、${missingIds.join('・')}は欠測`,
      body: `<figure class="st-fig" data-region="primary">${slopeChart({
        id: 'cooling-slope', width: 800, height: 482, fontSize: 19, locale: 'ja', format: { digits: 1 },
        title: 'モジュール別の温度上昇（℃）、従来プレートと新プレート',
        desc: `${cooling.n}台のうち${cooling.below}台で新プレートの温度上昇が小さい。${worse.map(r => r.id).join('・')}は大きくなった。`,
        data: cooling.rows.map(r => ({ label: r.id, a: r.before, b: r.after, color: r.difference > 0 ? 'var(--ss-negative)' : 'var(--ss-accent)' })),
        aLabel: '従来プレート', bLabel: '新プレート', highlight: () => true,
      })}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b class="is-accent">${num(cooling.mean, 1)}<small>℃</small></b><span>平均の差（新 − 従来、${cooling.n}台）</span></div>
  <hr class="st-rule">
  <div class="st-kpi"><b>${num(cooling.sampleSD, 1)}<small>℃</small></b><span>差の標準偏差（n − 1）</span></div>
  <hr class="st-rule">
  <p class="st-text">${missingIds.join('・')}は新プレートの測定中に熱電対が断線し、差から除いた</p>
</div>`,
      source: `${SYNTH}・${rig.discharge}、${rig.room}。差はすべて「新 − 従来」で計算`,
    }), 'All plotted values, the count, the mean and the n−1 SD come from paired() with one subtraction order. The worse module stays visible in the negative colour with its label; the missing module is named.'),
    talkSlide('next-measurement', '次に確かめること', '', labPage({
      head: '効果と言い切るには、測り方を3点変えて測り直す',
      quiet: `次の測定は${sampleNeed.planned}台、11月に行う`,
      body: `<table class="lab-table" data-region="primary">
  <thead><tr><th>今回の制約</th><th>なぜ問題か</th><th>次の測定で変えること</th></tr></thead>
  <tbody>${nextSteps.map(s => `<tr><td>${s.limit}</td><td>${s.why}</td><td>${s.change}</td></tr>`).join('')}</tbody>
</table>`,
      source: `${SYNTH}・必要台数は平均の差${num(Math.abs(cooling.mean), 1)}℃、標準偏差${num(cooling.sampleSD, 1)}℃から正規近似で計算（検出力80%、両側5%）`,
    }), 'Limitations sit next to the concrete change that addresses each one. The sample size is computed from the observed mean and SD, not typed; it is a planning estimate, not a promise.'),
  ],
};
