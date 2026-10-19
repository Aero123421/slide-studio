// Template: プロジェクト月次状況報告 · 総括（全体状況・要点・本日の判断事項）. Synthetic example content; replace data and copy.
// Overall status, five areas, three key messages and today's asks. The dates and figures in the messages are
// computed from the schedule and burn-down numbers below (the same numbers drive pages 2, 3 and 6).
const ID = 'tpl-project-status-summary';

const project = { name: '基幹システム移行プロジェクト', meeting: '第7回ステアリングコミッティ', date: '2026-10-21' };
const asOf = '2026-10-16';                                   // 基準日 = end of sprint 5
const STATUS = { ok: '順調', warn: '注意', late: '遅延' };
const overall = { status: 'warn', previous: { date: '2026-09-16', status: 'ok' } };
const areas = [
  { name: 'スケジュール', status: 'warn' },
  { name: '要員', status: 'warn' },
  { name: 'スコープ', status: 'ok' },
  { name: 'コスト', status: 'ok' },
  { name: '品質', status: 'ok' },
];
// Schedule facts (pages 2 and 3)
const dev = { planEnd: '2026-11-27', remaining: 280, velocity: 70, planVelocity: 75, added: 20, sprintDays: 14 }; // pt, pt/sprint
const bufferWeeks = 3;                                       // 予備期間（基準計画）
const uat = { testers: 8, start: '2027-02-08' };             // 受入テストの担当者数と開始日（見込み）
const asks = [                                               // 本日ご判断いただきたいこと（6ページ）
  { what: '帳票アドオン10本（70ポイント）を本番稼働後の第2期に回す', due: '2026-10-21' },
  { what: `受入テストの担当者${uat.testers}名を業務部門から指名する`, due: '2026-11-06' },
];
const page = 1;

// ---- derived
const DAY = 86400000, WD = '日月火水木金土';
const t = iso => Date.parse(`${iso}T00:00:00Z`);
const md = ms => { const d = new Date(ms); return `${d.getUTCMonth() + 1}月${d.getUTCDate()}日`; };
const wd = ms => WD[new Date(ms).getUTCDay()];
const ymd = ms => `${new Date(ms).getUTCFullYear()}年${md(ms)}`;
const forecastEnd = t(asOf) + Math.round(dev.remaining / dev.velocity * dev.sprintDays) * DAY;
const slipWeeks = Math.round((forecastEnd - t(dev.planEnd)) / (7 * DAY));
const bufferLeft = bufferWeeks - slipWeeks;
const st = k => `<span class="st ${k}"><b>${STATUS[k]}</b></span>`;
const dueText = iso => (iso === project.date ? '本日' : `${md(t(iso))}（${wd(t(iso))}）まで`);

const messages = [
  [`開発の完了見込みは<span class="nw">${md(forecastEnd)}</span>。計画より<span class="nw">${slipWeeks}週間</span>遅い`,
    `直近3スプリントの平均は${dev.velocity}ポイント（計画${dev.planVelocity}）。変更要求で${dev.added}ポイント増えた`],
  [`後続の工程も${slipWeeks}週間ずれるが、予備期間の中に収まる`,
    `予備期間${bufferWeeks}週間のうち${slipWeeks}週間を使い、残りは${bufferLeft}週間。これ以上の遅れは吸収できない`],
  [`受入テストの担当者${uat.testers}名が、まだ決まっていない`,
    `受入テストは${ymd(t(uat.start))}から。各部門の指名を${md(t(asks[1].due))}までにいただきたい`],
];

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Project status summary: overall status, key messages, decisions needed',
  notes: `Purpose: 会議の冒頭1枚で、全体の状況・その理由・今日決めてほしいことを伝える。細部は2ページ以降に任せる。\nModify: overall と areas の状況（ok／warn／late）、dev・bufferWeeks・uat の数値、asks（判断事項と期限）を書き換える。完了見込み日・遅れの週数・予備期間の残りは自動計算。project の会議名と日付、asOf（基準日）は全ページで同じ値にする。\nInvariant: 状況は色の点と言葉（順調／注意／遅延）を必ず併記する。全体の判定は最も悪い領域を無視しない。要点は3つまで、1行目が結論、2行目が根拠。判断事項には期限を付け、詳細ページを示す。\nStatic: Already static.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-project-status p-summary',
  content: `<p class="p-run" data-region="support"><span>${project.name}　${project.meeting}</span><span class="num">${ymd(t(project.date))}　${page}</span></p>
<h1 class="p-head" data-region="title">開発は${slipWeeks}週間遅れているが、本番稼働日は守れる見通し。本日は<span class="nw">${asks.length}件の判断</span>をお願いしたい</h1>
<section class="p-rail g" style="--c:1;--s:4;top:214px" data-region="primary">
  <div>
    <p class="p-label">全体状況</p>
    <p class="p-overall st ${overall.status}"><b>${STATUS[overall.status]}</b></p>
    <p class="p-label">前回（${md(t(overall.previous.date))}）は${STATUS[overall.previous.status]}</p>
    <ul class="p-areas">${areas.map(a => `<li><span>${a.name}</span>${st(a.status)}</li>`).join('')}</ul>
  </div>
</section>
<ol class="p-msgs g" style="--c:5;--s:8;top:214px" data-region="support">
  ${messages.map(([lead, why], i) => `<li><b>${i + 1}</b><p class="p-lead">${lead}</p><p>${why}</p></li>`).join('')}
</ol>
<section class="p-asks g" style="--c:5;--s:8;top:516px" data-region="support">
  <p class="p-label">本日ご判断いただきたいこと（詳細は6ページ）</p>
  <ol>${asks.map(a => `<li><span>${a.what}</span><span class="due num">${dueText(a.due)}</span></li>`).join('')}</ol>
</section>
<p class="p-note" data-region="source">基準日：${ymd(t(asOf))}（${wd(t(asOf))}）。判定の基準：順調＝計画どおり、注意＝予備期間で吸収できる遅れ、遅延＝本番稼働日に影響する遅れ</p>`,
};
