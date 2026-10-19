// Template: プロジェクト月次状況報告 · マイルストーン（基準計画と見込み）. Synthetic example content; replace data and copy.
// One date axis for the whole project: thin line = baseline (基準計画), thick bar = actual / forecast,
// vertical line = 基準日. Slips, the remaining buffer and the headline are computed from `phases`.
import { svgRoot, el, g, textLines, linear, measureText } from '../../runtime/figure.mjs';

const ID = 'tpl-project-status-milestones';
const project = { name: '基幹システム移行プロジェクト', meeting: '第7回ステアリングコミッティ', date: '2026-10-21' };
const asOf = '2026-10-16';                       // 基準日 = end of sprint 5
const span = ['2026-04-01', '2027-06-01'];       // axis range
const STATUS = { ok: '順調', warn: '注意', late: '遅延' };
// plan = 基準計画（2026年6月承認）, fc = 実績または見込み. state: done | active | next. status only for active phases.
const phases = [
  { name: '要件定義', plan: ['2026-04-01', '2026-06-12'], fc: ['2026-04-01', '2026-06-12'], state: 'done' },
  { name: '基本設計', plan: ['2026-06-15', '2026-08-07'], fc: ['2026-06-15', '2026-08-07'], state: 'done' },
  { name: '開発', plan: ['2026-08-10', '2026-11-27'], fc: ['2026-08-10', '2026-12-11'], state: 'active', status: 'warn' },
  { name: 'データ移行', plan: ['2026-09-01', '2027-01-29'], fc: ['2026-09-01', '2027-01-29'], state: 'active', status: 'ok' },
  { name: '結合テスト', plan: ['2026-11-30', '2027-01-22'], fc: ['2026-12-14', '2027-02-05'], state: 'next' },
  { name: '総合・受入テスト', plan: ['2027-01-25', '2027-03-12'], fc: ['2027-02-08', '2027-03-26'], state: 'next' },
  { name: '移行リハーサル', plan: ['2027-03-15', '2027-04-09'], fc: ['2027-03-29', '2027-04-23'], state: 'next' },
];
const buffer = { plan: ['2027-04-12', '2027-04-30'], fc: ['2027-04-26', '2027-04-30'] };   // 予備期間
const cutover = { from: '2027-05-01', to: '2027-05-05', goLive: '2027-05-06' };          // 連休中に切り替え
const page = 2;

// ---- derived
const DAY = 86400000, WD = '日月火水木金土';
const t = iso => Date.parse(`${iso}T00:00:00Z`);
const md = ms => { const d = new Date(ms); return `${d.getUTCMonth() + 1}月${d.getUTCDate()}日`; };
const ymd = ms => `${new Date(ms).getUTCFullYear()}年${md(ms)}`;
const weeks = (a, b) => Math.round((t(b) - t(a)) / (7 * DAY));
phases.forEach(p => { p.slip = weeks(p.plan[1], p.fc[1]); });
const dev = phases.find(p => p.state === 'active' && p.slip > 0) || phases.find(p => p.slip > 0);
const workWeeks = ([a, b]) => Math.round((t(b) - t(a) + 3 * DAY) / (7 * DAY));   // Monday → Friday spans
const bufferPlan = workWeeks(buffer.plan), bufferLeft = workWeeks(buffer.fc);

// ---- figure: 12 columns × 404 px. Label column = 3 columns; timeline = columns 4–12.
const W = 1152, H = 404, x0 = 294, headH = 52, rowH = 38;
const x = linear([t(span[0]), t(span[1])], [x0, W]);
const rows = [...phases.map(p => ({ ...p, kind: 'phase' })), { name: '予備期間', kind: 'buffer' }, { name: '本番移行', kind: 'cutover' }];
const ry = i => headH + i * rowH;
const months = [];
for (let d = new Date(t(span[0])); d.getTime() < t(span[1]); d.setUTCMonth(d.getUTCMonth() + 1)) months.push(new Date(d.getTime()));
const axis = months.map((m, i) => {
  const a = x(m.getTime()), b = i + 1 < months.length ? x(months[i + 1].getTime()) : W, jan = m.getUTCMonth() === 0;
  return g({},
    el('line', { x1: a, x2: a, y1: jan || i === 0 ? 4 : headH - 26, y2: ry(rows.length), stroke: jan ? 'var(--rule)' : 'var(--grid)', 'stroke-width': 1 }),
    jan || i === 0 ? textLines([`${m.getUTCFullYear()}年`], { x: a + 6, y: 4, size: 15, valign: 'top', fill: 'var(--muted)' }) : '',
    textLines([`${m.getUTCMonth() + 1}月`], { x: (a + b) / 2, y: headH - 12, size: 16, anchor: 'middle', fill: 'var(--muted)' }));
}).join('');
const bar = (from, to, y, h, attrs) => el('rect', { x: x(t(from)), y, width: Math.max(3, x(t(to) + DAY) - x(t(from))), height: h, ...attrs });
const label = (p, y) => {
  const status = p.status ? `<tspan fill="var(--${p.status === 'ok' ? 'ok' : p.status === 'warn' ? 'warn' : 'late'})">●</tspan> ${STATUS[p.status]}` : p.state === 'done' ? '完了' : '';
  return textLines([p.name], { x: 0, y, size: 18, valign: 'middle', fill: 'var(--ink)', weight: p.status ? 700 : null })
    + (status ? `<text x="${x0 - 24}" y="${(y + 16 * 0.36).toFixed(1)}" font-size="16" text-anchor="end" style="fill:var(--${p.status ? 'ink' : 'muted'})">${status}</text>` : '');
};
const body = rows.map((r, i) => {
  const y = ry(i), cy = y + rowH / 2, parts = [label(r, cy)];
  if (r.kind === 'phase') {
    parts.push(bar(r.plan[0], r.plan[1], cy - 9, 3, { fill: 'var(--context)' }));
    parts.push(bar(r.fc[0], r.fc[1], cy - 3, 12, { fill: r.state === 'done' ? 'var(--muted)' : 'var(--teal)' }));
    if (r.slip > 0) parts.push(textLines([`+${r.slip}週`], { x: x(t(r.fc[1]) + DAY) + 8, y: cy + 3, size: 16, valign: 'middle', weight: 700, fill: 'var(--ink)' }));
  } else if (r.kind === 'buffer') {
    parts.push(bar(buffer.plan[0], buffer.plan[1], cy - 9, 3, { fill: 'var(--context)' }));
    parts.push(bar(buffer.fc[0], buffer.fc[1], cy - 3, 12, { fill: 'var(--paper)', stroke: 'var(--teal)', 'stroke-width': 1.5 }));
    const lab = `残り${bufferLeft}週間（当初${bufferPlan}週間）`;
    parts.push(textLines([lab], { x: x(t(buffer.fc[0])) - 10, y: cy + 3, size: 16, anchor: 'end', valign: 'middle', fill: 'var(--ink)' }));
  } else {
    const gx = x(t(cutover.goLive) + DAY / 2);
    parts.push(bar(cutover.from, cutover.to, cy - 3, 12, { fill: 'var(--teal)' }));
    parts.push(el('path', { d: `M${gx} ${cy - 7}l8 9-8 9-8-9z`, fill: 'var(--ink)' }));
    const lab = `本番稼働 ${md(t(cutover.goLive))}`;
    parts.push(textLines([lab], { x: x(t(cutover.from)) - 10, y: cy + 3, size: 16, anchor: 'end', valign: 'middle', weight: 700, fill: 'var(--ink)' }));
  }
  return g({}, el('line', { x1: 0, x2: W, y1: y + rowH, y2: y + rowH, stroke: 'var(--grid)' }), ...parts);
}).join('');
const tx = x(t(asOf) + DAY / 2), bottom = ry(rows.length);
const today = g({},
  el('line', { x1: tx, x2: tx, y1: headH, y2: bottom + 6, stroke: 'var(--ink)', 'stroke-width': 1.5 }),
  textLines([`基準日 ${md(t(asOf))}`], { x: tx, y: bottom + 12, size: 16, anchor: 'middle', valign: 'top', weight: 700, fill: 'var(--ink)' }));
const figure = svgRoot({
  id: `${ID}-fig`, width: W, height: H,
  title: 'フェーズ別の基準計画と実績・見込み（2026年4月〜2027年5月）',
  desc: `${phases.map(p => `${p.name}：基準${md(t(p.plan[0]))}〜${md(t(p.plan[1]))}、見込み${md(t(p.fc[0]))}〜${md(t(p.fc[1]))}`).join('。')}。予備期間は${bufferPlan}週間から${bufferLeft}週間に減る。本番稼働は${ymd(t(cutover.goLive))}で変わらない。`,
}, el('line', { x1: 0, x2: W, y1: headH, y2: headH, stroke: 'var(--ink)', 'stroke-width': 1.5 }), axis, body, today);

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Milestones: baseline against forecast, with the status date',
  notes: `Purpose: 基準計画に対してどの工程がどれだけずれ、予備期間と本番稼働日にどう響くかを1本の日付軸で示す。\nModify: phases の plan（基準計画）と fc（実績・見込み）、state、進行中の工程の status、buffer、cutover、asOf を書き換える（YYYY-MM-DD）。ずれの週数、予備期間の残り、見出しは自動。期間が変わったら span も直す。\nInvariant: 基準計画の線は消さずに残す。見込みは基準日時点の実績から計算した日付にする（3ページのバーンダウンと同じ日付）。状況の色は言葉と一緒にだけ使う。本番稼働日を最後の行で必ず示す。\nStatic: Already static.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-project-status p-milestones',
  content: `<p class="p-run" data-region="support"><span>${project.name}　${project.meeting}</span><span class="num">${ymd(t(project.date))}　${page}</span></p>
<h1 class="p-head" data-region="title">${dev.name}の完了が<span class="nw">${dev.slip}週間</span>遅れ、後続の工程も同じだけずれる。予備期間で吸収し、<span class="nw">本番稼働日は変えない</span></h1>
<figure class="g" style="--c:1;--s:12;top:214px;margin:0" data-region="primary">${figure}</figure>
<p class="p-note" data-region="source">細い線は基準計画（2026年6月承認）、太い線は実績と見込み。見込みは${ymd(t(asOf))}時点の開発速度による（3ページ）。</p>`,
};
