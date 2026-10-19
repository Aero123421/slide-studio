// Diagram study · Swimlanes — who holds the file at each step, and where it waits between desks.
// Lanes are actors; a box stays in the lane of the desk that does the work; an arrow is one
// handoff of the file. Elapsed days, the critical path and the headline are computed from data.
import { flowDiagram, theme as makeTheme, g, textLines } from '../runtime/figure.mjs';

const lanes = [ // top to bottom; the desk sits between applicant and reviewers
  { id: 'app', label: '申請者' },
  { id: 'rev', label: '審査担当' },
  { id: 'desk', label: '受付窓口' },
  { id: 'fire', label: '消防署' },
];
const tasks = [ // days = median working days of work at that desk (illustrative)
  { id: 'submit', lane: 'app', label: '申請書の提出', days: 0 },
  { id: 'intake', lane: 'desk', label: '書類の受付', days: 1 },
  { id: 'review', lane: 'rev', label: '構造審査', days: 5 },
  { id: 'consent', lane: 'fire', label: '消防同意', days: 3 },
  { id: 'fix', lane: 'app', label: '図面の補正', days: 4 },
  { id: 'recheck', lane: 'rev', label: '補正の確認', days: 1 },
  { id: 'issue', lane: 'desk', label: '確認済証の交付', days: 1 },
];
const handoffs = [ // wait = median working days until the receiving desk starts
  { from: 'submit', to: 'intake', wait: 1 },
  { from: 'intake', to: 'review', wait: 3 },
  { from: 'intake', to: 'consent', wait: 2 },
  { from: 'review', to: 'fix', wait: 1 },
  { from: 'fix', to: 'recheck', wait: 2 },
  { from: 'recheck', to: 'issue', wait: 2 },
  { from: 'consent', to: 'issue', wait: 1 },
];

// Elapsed time: a task finishes `days` after its latest input arrives (input = finish + wait).
const byId = Object.fromEntries(tasks.map(k => [k.id, k]));
const finish = {}, via = {};
for (const k of tasks) { // tasks are listed in dependency order
  const ins = handoffs.filter(h => h.to === k.id).map(h => ({ h, at: finish[h.from] + h.wait }));
  const last = ins.sort((a, b) => b.at - a.at)[0];
  finish[k.id] = (last?.at ?? 0) + k.days; via[k.id] = last?.h;
}
const end = tasks.at(-1);
const critical = [];
for (let h = via[end.id]; h; h = via[h.from]) critical.unshift(h);
const total = finish[end.id];
const waiting = critical.reduce((s, h) => s + h.wait, 0);
const passes = handoffs.filter(h => byId[h.from].lane !== byId[h.to].lane).length;

export function figure(theme = 'css') {
  const t = makeTheme(theme);
  return flowDiagram({
    id: 'swimlanes-fig', theme: t, width: 1152, height: 442, fontSize: 19, nodeMinWidth: 100, nodeMaxWidth: 150,
    title: '木造住宅の建築確認：担当ごとの作業と受け渡し',
    desc: `4つの担当レーンに7つの作業。矢印は書類の受け渡し（${passes}回）で、数字は受け取った担当が着手するまでの待ち日数。最長経路は${total}日で、そのうち${waiting}日が待ち。消防同意は構造審査と並行して進む。`,
    lanes, direction: 'lr',
    // paper-filled boxes read on both lane tints; the start is a terminal with no work time
    nodes: tasks.map(k => ({ id: k.id, lane: k.lane, label: k.label, sub: k.days ? `作業${k.days}日` : null, kind: k.days ? 'process' : 'terminal', maxWidth: k.days ? null : 190, fill: t.c('paper') })),
    // labelPos 0.5 puts each wait on the vertical connector, i.e. on the boundary between the two desks
    edges: handoffs.map(h => ({ from: h.from, to: h.to, label: `${h.wait}日`, labelPos: 0.5, emphasis: critical.includes(h) })),
    // the sum of the accented waits, written where the eye ends: lower right
    extra: ({ W, H }) => g({ class: 'swimlanes-total' },
      textLines(['色付きの待ちの合計'], { x: W - 16, y: H - 50, size: 16, anchor: 'end', valign: 'bottom', fill: t.c('muted'), weight: 600 }),
      textLines([`${waiting}日`], { x: W - 16, y: H - 16, size: 28, anchor: 'end', valign: 'bottom', fill: t.c('accent'), weight: 700 })),
  });
}

export default {
  study: true,
  id: 'swimlanes',
  language: 'ja',
  title: 'Swimlanes: handoffs between responsible desks',
  className: 'st cs-civic-calm',
  notes: 'Purpose: Show when responsibility for one case passes between actors, and how long it waits at each handoff.\nModify: Edit `lanes`, `tasks` (with the desk that does the work) and `handoffs` (with waiting days). Elapsed time, the critical path, the accented waits and the headline recompute.\nInvariant: A task stays in the lane of the actor responsible for it, however the drawing is rearranged; every arrow is one declared handoff; numbers on arrows are waits, numbers in boxes are work.\nStatic: Already static. For a build, pass build:{by:"mark"} to reveal the handoffs in order.',
  sources: [{ type: 'original-example', file: 'assets/svg/swimlanes.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">確認済証まで${total}日。そのうち<em>${waiting}日</em>は、<br>書類が担当の間で止まっている時間</h1>
<p class="st-dek">矢印は書類の受け渡し、数字は次の担当が着手するまでの待ち日数。色付きは最長経路上の待ち。</p>
<figure class="st-fig" style="top:216px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 木造2階建て住宅の確認申請、作業・待ちとも中央値（営業日）</span><span>スイムレーン図</span></p>`,
};
