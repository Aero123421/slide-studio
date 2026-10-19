// Template: プロジェクト月次状況報告 · 開発のバーンダウン. Synthetic example content; replace data and copy.
// Remaining story points per sprint against the plan line. The forecast date is computed from the average
// velocity of the last `lookback` sprints; the headline and rail repeat those computed numbers.
import { svgRoot, el, g, textLines, linear, pathFromPoints, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-project-status-burndown';
const project = { name: '基幹システム移行プロジェクト', meeting: '第7回ステアリングコミッティ', date: '2026-10-21' };
const sprint = { first: '2026-08-10', days: 14, planned: 8 };   // 2-week sprints from Monday; 8 planned → ends 2026-11-27
const scope = 600;                                             // 当初の総ポイント
const done = [64, 66, 68, 71, 71];                             // completed points per sprint (1–5)
const added = [0, 0, 20, 0, 0];                                // points added by change requests per sprint
const change = { sprint: 3, label: '変更要求 +20' };            // annotation on the actual line
const lookback = 3;                                            // sprints averaged for the forecast
const page = 3;

// ---- derived
const DAY = 86400000, WD = '日月火水木金土';
const t = iso => Date.parse(`${iso}T00:00:00Z`);
const start = t(sprint.first);
const endOf = k => start + (k * sprint.days - 3) * DAY;         // sprint k ends on Friday
const md = ms => { const d = new Date(ms); return `${d.getUTCMonth() + 1}月${d.getUTCDate()}日`; };
const slash = ms => { const d = new Date(ms); return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`; };
const ymd = ms => `${new Date(ms).getUTCFullYear()}年${md(ms)}`;
const remaining = [scope];
done.forEach((d, i) => remaining.push(remaining[i] + added[i] - d));
const last = done.length, left = remaining[last], asOf = endOf(last);
const velocity = done.slice(-lookback).reduce((s, v) => s + v, 0) / lookback;
const planVelocity = scope / sprint.planned;
const forecast = asOf + Math.round(left / velocity * sprint.days) * DAY;
const planEnd = endOf(sprint.planned);
const slipWeeks = Math.round((forecast - planEnd) / (7 * DAY));
const needed = left / (sprint.planned - last);

// ---- figure: 8 columns × 404 px
const W = 760, H = 404, left0 = 52, top = 34, bottom = 62;
const xEnd = forecast + 10 * DAY;
const x = linear([start, xEnd], [left0, W - 8]);
const y = linear([0, Math.ceil(scope / 200) * 200], [H - bottom, top]);
const pts = remaining.map((v, k) => [x(k ? endOf(k) : start), y(v)]);
const grid = y.ticks(3).map(v => g({},
  el('line', { x1: left0, x2: W, y1: y(v), y2: y(v), stroke: v ? 'var(--grid)' : 'var(--ink)', 'stroke-width': v ? 1 : 1.5 }),
  textLines([fmt(v, { locale: 'ja' })], { x: left0 - 10, y: y(v), size: 16, anchor: 'end', valign: 'middle', fill: 'var(--muted)' })));
const keyDate = ms => (ms === asOf ? ['基準日', 'var(--ink)'] : ms === planEnd ? ['計画', 'var(--muted)'] : ms === forecast ? ['見込み', 'var(--teal)'] : null);
const ticks = Array.from({ length: Math.floor((xEnd - start) / (sprint.days * DAY)) }, (_, i) => endOf(i + 1)).map(ms => {
  const k = keyDate(ms);
  return g({},
    el('line', { x1: x(ms), x2: x(ms), y1: y(0), y2: y(0) + 6, stroke: 'var(--ink)' }),
    textLines(k ? [slash(ms), k[0]] : [slash(ms)], { x: x(ms), y: y(0) + 12, size: 16, anchor: 'middle', valign: 'top', lineHeight: 1.3, fill: k ? k[1] : 'var(--muted)', weight: k ? 700 : null }));
});
const planLine = g({},
  el('line', { x1: x(start), y1: y(scope), x2: x(planEnd), y2: y(0), stroke: 'var(--context)', 'stroke-width': 2 }),
  textLines(['計画'], { x: x(start + (planEnd - start) * 0.62) - 12, y: y(scope * 0.38) + 12, size: 16, anchor: 'end', valign: 'top', fill: 'var(--muted)' }));
const actual = g({},
  el('path', { d: pathFromPoints(pts), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }),
  ...pts.map(([px, py], k) => el('circle', { cx: px, cy: py, r: k === last ? 5 : 3.5, fill: 'var(--ink)' })),
  textLines([`残り${left}`], { x: pts[last][0] + 12, y: pts[last][1] - 14, size: 18, weight: 700, fill: 'var(--ink)' }));
const cp = pts[change.sprint];
const changeNote = g({},
  el('line', { x1: cp[0], y1: cp[1] - 8, x2: cp[0], y2: cp[1] - 40, stroke: 'var(--muted)', 'stroke-width': 1 }),
  textLines([change.label], { x: cp[0] + 6, y: cp[1] - 40, size: 16, valign: 'middle', fill: 'var(--muted)' }));
const fx = x(forecast);
const forecastLine = g({},
  el('line', { x1: pts[last][0], y1: pts[last][1], x2: fx, y2: y(0), stroke: 'var(--teal)', 'stroke-width': 2.5, 'stroke-dasharray': '7 6' }),
  el('circle', { cx: fx, cy: y(0), r: 5, fill: 'var(--teal)' }),
  textLines(['見込み'], { x: (pts[last][0] + fx) / 2 + 14, y: (pts[last][1] + y(0)) / 2 - 12, size: 16, weight: 700, fill: 'var(--teal)' }));
const figure = svgRoot({
  id: `${ID}-fig`, width: W, height: H,
  title: '開発の残りポイントの推移と完了見込み',
  desc: `当初${scope}ポイント。第${last}スプリント終了時点（${md(asOf)}）の残りは${left}ポイントで、計画線より${Math.round(left - (scope - planVelocity * last))}ポイント多い。直近${lookback}スプリントの平均${fmt(velocity, { digits: 0 })}ポイントで進むと、完了は${md(forecast)}（計画${md(planEnd)}）。`,
}, grid, ticks, planLine, actual, changeNote, forecastLine,
textLines(['残りポイント'], { x: 0, y: 4, size: 16, valign: 'top', fill: 'var(--muted)' }));

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Development burn-down with a velocity-based finish date',
  notes: `Purpose: 開発の残作業を計画線と比べ、今のペースだといつ終わるかを日付で示す。遅れを「感覚」ではなく速度から説明する。\nModify: sprint（初日・日数・計画スプリント数）、scope、done（各スプリントの完了ポイント）、added（変更要求で増えたポイント）、change の注記を書き換える。残り・平均速度・完了見込み日・必要なペース・見出しは自動。見込みに使うスプリント数は lookback で変える。\nInvariant: 縦軸は0から。計画線は当初計画のまま残し、スコープの追加は注記で示す。見込みの計算方法（直近${lookback}スプリントの平均）を注記に書く。完了見込み日は2ページの工程表と一致させる。\nStatic: Already static.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-project-status p-burndown',
  content: `<p class="p-run" data-region="support"><span>${project.name}　${project.meeting}</span><span class="num">${ymd(t(project.date))}　${page}</span></p>
<h1 class="p-head" data-region="title">残り<span class="nw">${left}ポイント</span>。直近の平均ペース<span class="nw">${fmt(velocity, { digits: 0 })}ポイント</span>では、開発の完了は計画より<span class="nw">${slipWeeks}週間</span>遅い<span class="nw">${md(forecast)}</span>になる</h1>
<figure class="g" style="--c:1;--s:8;top:214px;margin:0" data-region="primary">${figure}</figure>
<div class="p-rail g" style="--c:9;--s:4;top:214px" data-region="support">
  <div>
    <p class="p-label">開発の完了見込み</p>
    <p class="p-fig num accent">${md(forecast)}</p>
    <p class="p-body">計画（${md(planEnd)}）より${slipWeeks}週間遅い</p>
  </div>
  <div>
    <dl class="p-pairs">
      <dt>残り</dt><dd>${left}<small>pt</small></dd>
      <dt>直近${lookback}スプリントの平均</dt><dd>${fmt(velocity, { digits: 0 })}<small>pt</small></dd>
      <dt>当初計画のペース</dt><dd>${fmt(planVelocity, { digits: 0 })}<small>pt</small></dd>
      <dt>計画どおりに終えるには</dt><dd>${fmt(needed, { digits: 0 })}<small>pt</small></dd>
    </dl>
  </div>
</div>
<p class="p-note" data-region="source">1スプリント＝2週間、ペースは1スプリントあたりの完了ポイント。完了見込み＝基準日（${md(asOf)}）＋残り÷直近${lookback}スプリントの平均。</p>`,
};
