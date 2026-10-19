/**
 * Period comparison: one selectable horizon, one calculated snapshot.
 *
 * Three quotes for replacing an order-management system differ in how they split
 * cost between an up-front fee and a monthly fee, so the cheapest plan depends on
 * how long the system is used. Every visible output for a horizon (headline,
 * condition line, bar lengths, totals, highlighted row, the marker on the
 * cheapest-plan strip) comes from `snapshots[months]`, computed below with
 * totalCost(). Changing the selection changes the claim, not only the bars.
 *
 * Contract checked by tests/field_browser.py (keep it): #period-title contains
 * "<n>か月" and "<id>案が最小"; #value-A..C hold the bare totals; #bar-A..C have
 * width = total / 800 × 790; #period-condition contains "×<n>"; [data-months]
 * buttons carry aria-pressed; the selector is hidden in static export.
 * Synthetic quotes; fictional suppliers. Built into gallery/period-comparison.html.
 */
import fs from 'node:fs/promises';
import { totalCost } from '../runtime/quant.mjs';
import { h } from '../runtime/kit.mjs';
import { svgRoot, el, g, textLines, linear, axis, fmt } from '../runtime/figure.mjs';

export const offers = [                                    // 万円・税抜、2026年9月時点の見積もり
  { id: 'A', initial: 120, monthly: 8 },
  { id: 'B', initial: 60, monthly: 11 },
  { id: 'C', initial: 180, monthly: 6 },
];
export const planNames = { A: '現行パッケージを更新', B: 'クラウド型に移行', C: '買い取り＋保守契約' };
export const horizons = [12, 36, 60];                      // か月。選べる比較期間
const SCALE_MAX = 800, BAR_MAX = 790;                      // 0–800万円を790 pxで描く（テストが幅を検査する）
const STRIP_MAX = 60;                                      // か月。最安の案を示す帯の範囲

const cost = (o, months) => totalCost({ ...o, months, units: '万円' }).value;

/** One snapshot per horizon: the only source of what the page shows. */
export const snapshots = Object.fromEntries(horizons.map(months => {
  const rows = offers.map(o => ({ ...o, total: cost(o, months) }));
  const minimum = Math.min(...rows.map(r => r.total)), winners = rows.filter(r => r.total === minimum).map(r => r.id);
  return [months, {
    months, rows, winners,
    title: `${months}か月で比べると、総額は${winners.join('・')}案が最小`,
    condition: `表示条件：${months}か月。総額＝初期費用＋月額×${months}。追加の作業費と税は含まない。`,
  }];
}));

/** Months over which each plan is the cheapest. Boundaries are the exact months where two plans cost the same. */
export function cheapestRuns(maxMonths = STRIP_MAX) {
  const runs = [];
  for (let m = 0; m <= maxMonths; m++) {
    const totals = offers.map(o => cost(o, m)), min = Math.min(...totals), ids = offers.filter((o, i) => totals[i] === min).map(o => o.id);
    if (ids.length !== 1) continue;                        // a tie is a boundary, not a run
    const last = runs.at(-1);
    if (last?.id === ids[0]) last.to = m; else runs.push({ id: ids[0], from: m, to: m });
  }
  for (let i = 1; i < runs.length; i++) {
    const p = offers.find(o => o.id === runs[i - 1].id), q = offers.find(o => o.id === runs[i].id);
    runs[i - 1].to = runs[i].from = (q.initial - p.initial) / (p.monthly - q.monthly);
  }
  runs[0].from = 0; runs.at(-1).to = maxMonths;
  return runs;
}
const runs = cheapestRuns();

// ── Figure: bars (initial + monthly × n) and the cheapest-plan strip, one coordinate system ──
const W = 1152, X0 = 300, rowH = 78, barH = 40, barsTop = 52, stripTop = 352;
const x = linear([0, SCALE_MAX], [X0, X0 + BAR_MAX]);       // 万円 → px
const mx = linear([0, STRIP_MAX], [X0, X0 + BAR_MAX]);      // か月 → px
const yRow = i => barsTop + i * rowH;
const initial = snapshots[36];
const runLabel = r => (r.from === 0 ? `${fmt(r.to)}か月まで` : r.to === STRIP_MAX ? `${fmt(r.from)}か月から` : `${fmt(r.from)}〜${fmt(r.to)}か月`);

function figure() {
  const parts = [axis(x, { orient: 'top', at: barsTop - 22, grid: [barsTop - 14, yRow(offers.length - 1) + barH + 10], size: 16, count: 4, format: v => (v === SCALE_MAX ? `${v}万円` : String(v)) })];
  // Direct key over the first row: which part of a bar is which.
  const a = initial.rows[0];
  parts.push(textLines(['初期費用'], { x: x(0) + 6, y: barsTop - 8, size: 16, fill: 'var(--ss-muted)', weight: 600 }));
  parts.push(textLines([`月額×${initial.months}か月`], { x: x(a.initial) + 8, y: barsTop - 8, size: 16, fill: 'var(--ss-muted)', weight: 600, attrs: { id: 'monthly-key' } }));
  initial.rows.forEach((r, i) => {
    const y = yRow(i) + 8, win = initial.winners.includes(r.id);
    parts.push(g({ id: `row-${r.id}`, class: `period-row${win ? ' is-min' : ''}` },
      textLines([`${r.id}案`], { x: 0, y: y + 14, size: 24, fill: 'var(--ss-ink)', weight: 700 }),
      textLines([planNames[r.id]], { x: 0, y: y + 40, size: 18, fill: 'var(--ss-muted)' }),
      el('rect', { id: `bar-${r.id}`, class: 'period-monthly', x: x(0), y, width: r.total / SCALE_MAX * BAR_MAX, height: barH }),
      el('rect', { class: 'period-initial', x: x(0), y, width: r.initial / SCALE_MAX * BAR_MAX, height: barH }),
      `<text class="period-value" y="${y + barH / 2 + 8}"><tspan id="value-${r.id}" x="${x(r.total) + 12}">${r.total}</tspan><tspan class="period-unit" dx="4">万円</tspan></text>`));
  });
  // Strip: which plan is cheapest for each length of use; the marker shows the selected horizon.
  parts.push(textLines(['もっとも安い案'], { x: 0, y: stripTop + 20, size: 22, fill: 'var(--ss-ink)', weight: 700 }));
  parts.push(textLines(['使う期間ごと'], { x: 0, y: stripTop + 46, size: 18, fill: 'var(--ss-muted)' }));
  for (const r of runs) {
    const on = initial.months > r.from && initial.months <= r.to;
    parts.push(g({ class: `period-run${on ? ' is-on' : ''}`, 'data-from': r.from, 'data-to': r.to },
      el('rect', { x: mx(r.from) + 1, y: stripTop, width: mx(r.to) - mx(r.from) - 2, height: 48 }),
      textLines([`${r.id}案`], { x: mx(r.from) + 12, y: stripTop + 31, size: 20, weight: 700 }),
      textLines([runLabel(r)], { x: mx(r.from) + 60, y: stripTop + 31, size: 16 })));
  }
  parts.push(axis(mx, { orient: 'bottom', at: stripTop + 56, size: 16, tickValues: [0, 12, 24, 36, 48, 60], format: v => (v === STRIP_MAX ? `${v}か月` : String(v)) }));
  parts.push(g({ id: 'period-marker', transform: `translate(${mx(initial.months)} 0)` },
    el('path', { d: `M0 ${stripTop - 12}V${stripTop + 60}`, stroke: 'var(--ss-ink)', 'stroke-width': 2.5 }),
    el('path', { d: `M-7 ${stripTop - 20}H7L0 ${stripTop - 11}Z`, fill: 'var(--ss-ink)' })));
  return svgRoot({ id: 'period-fig', width: W, height: 440, title: '3案の総額と、期間ごとにもっとも安い案',
    desc: `同じゼロ起点で、総額＝初期費用＋月額×期間。${runs.map(r => `${runLabel(r)}は${r.id}案`).join('、')}がもっとも安い。` }, ...parts);
}

// ── CSS: page grammar + the lab's color system, plus a short block for this page ──
const read = p => fs.readFile(new URL(p, import.meta.url), 'utf8');
const frame = await read('../runtime/study-frame.css');
const waAi = (await read('../color-systems/color-systems.css')).match(/\/\*[^*]*\*\/\n\.cs-wa-ai\{[^}]*\}/)?.[0];
if (!waAi) throw Error('color-systems.css has no cs-wa-ai block');
const css = `${frame}\n${waAi}\n
/* Period page: Latin-first Japanese stack; headline 36, body 20, labels 16–18, source 15. */
.period { --ss-font-sans: "Inter","Helvetica Neue","Hiragino Sans","Hiragino Kaku Gothic ProN","Noto Sans JP","Yu Gothic UI","Yu Gothic",Meiryo,"IPAPGothic","IPAGothic",sans-serif; --ss-font-display: var(--ss-font-sans); }
.period .st-head { max-width: 820px; font: 700 36px/1.4 var(--ss-font-display); letter-spacing: .02em; font-feature-settings: "palt" 1; }
.period .st-dek { top: 112px; max-width: 820px; font-size: 20px; line-height: 1.6; }
.period .periods { position: absolute; right: 64px; top: 50px; display: flex; align-items: center; gap: 0; }
.period .periods span { margin-right: 14px; font-size: 16px; color: var(--ss-muted); }
.period .periods button { min-width: 96px; padding: 9px 0; font: 600 20px/1.2 var(--ss-font-sans); color: var(--ss-ink); background: var(--ss-paper); border: 1.5px solid var(--ss-ink); cursor: pointer; }
.period .periods button + button { margin-left: -1.5px; }
.period .periods button:first-of-type { border-radius: 6px 0 0 6px; }
.period .periods button:last-of-type { border-radius: 0 6px 6px 0; }
.period .periods button[aria-pressed="true"] { background: var(--ss-ink); color: var(--ss-paper); }
.period .st-fig { top: 186px; bottom: auto; height: 440px; }
.period .period-monthly { fill: var(--ss-context); }
.period .period-initial { fill: var(--ss-muted); }
.period .is-min .period-monthly { fill: var(--ss-seq-3); }
.period .is-min .period-initial { fill: var(--ss-accent); }
.period .period-value { font-size: 22px; font-weight: 700; fill: var(--ss-ink); font-variant-numeric: tabular-nums; }
.period .is-min .period-value { fill: var(--ss-accent); }
.period .period-unit { font-size: 17px; font-weight: 500; }
.period .period-run rect { fill: var(--ss-surface); }
.period .period-run text { fill: var(--ss-ink); }
.period .period-run.is-on rect { fill: var(--ss-accent); }
.period .period-run.is-on text { fill: var(--ss-on-accent); }
.period .period-condition { position: absolute; left: 64px; right: 64px; top: 630px; margin: 0; font-size: 20px; line-height: 1.5; }
body[data-export="true"] .period .periods { visibility: hidden !important; }
`;

export default {
  title: '受発注システム3案の総額比較', language: 'ja', mode: 'workshop', readingMode: 'live', css,
  slides: [{
    id: 'period-comparison', title: '期間ごとの総額比較', study: true, className: 'st cs-wa-ai period',
    content: `<h1 class="st-head" id="period-title" data-region="title">${h(initial.title)}</h1>
<p class="st-dek">受発注システム更新の3案。初期費用と月額の分け方が違うため、使う期間で順位が入れ替わる。</p>
<div class="periods" data-interactive role="group" aria-label="比較する期間"><span aria-hidden="true">比べる期間</span>${horizons.map(n => `<button type="button" data-months="${n}" aria-pressed="${n === initial.months}">${n}か月</button>`).join('')}</div>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="period-condition" id="period-condition">${h(initial.condition)}</p>
<p class="st-source" data-region="source"><span>架空の見積もり・3社、2026年9月時点（税抜）。除いた費用を含めた最安を保証する比較ではない</span></p>`,
    notes: 'Select 12 → 36 → 60 → 12 months. The cheapest plan changes from B to C and back, and the headline, condition line, totals, bar lengths, highlighted row and strip marker change with it, because all of them read one snapshot. The strip shows why: B is cheapest below 20 months, A between 20 and 30, C beyond 30 (computed crossovers). The static export keeps the selected horizon, fully labelled, and hides the selector.',
  }],
  script: `
(() => {
  const snapshots = ${JSON.stringify(snapshots)}, X0 = ${X0}, STRIP = { x0: ${X0}, px: ${BAR_MAX / STRIP_MAX} };
  const $ = s => document.querySelector(s), buttons = [...document.querySelectorAll('[data-months]')];
  function apply(months) {
    const s = snapshots[months];
    if (!s) throw Error('Unknown comparison horizon');
    $('#period-title').textContent = s.title;
    $('#period-condition').textContent = s.condition;
    for (const r of s.rows) {
      const width = r.total / 800 * 790;
      $('#bar-' + r.id).setAttribute('width', String(width));
      const value = $('#value-' + r.id);
      value.textContent = String(r.total);
      value.setAttribute('x', String(X0 + width + 12));
      $('#row-' + r.id).classList.toggle('is-min', s.winners.includes(r.id));
    }
    $('#monthly-key').textContent = '月額×' + months + 'か月';
    $('#period-marker').setAttribute('transform', 'translate(' + (STRIP.x0 + months * STRIP.px) + ' 0)');
    for (const run of document.querySelectorAll('.period-run')) run.classList.toggle('is-on', months > +run.dataset.from && months <= +run.dataset.to);
    for (const b of buttons) b.setAttribute('aria-pressed', String(+b.dataset.months === s.months));
    document.querySelector('#period-comparison').dataset.selectedMonths = String(months);
  }
  for (const b of buttons) b.addEventListener('click', () => apply(+b.dataset.months));
  apply(${initial.months});
})();`,
};
