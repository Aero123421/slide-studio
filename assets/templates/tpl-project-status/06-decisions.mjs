// Template: プロジェクト月次状況報告 · 判断をお願いしたい事項. Synthetic example content; replace data and copy.
// Each decision: options in one small table, the recommended row marked, a deadline. Completion dates for
// the scope options are computed from the same remaining points and velocity as the burn-down (page 3).
const ID = 'tpl-project-status-decisions';
const project = { name: '基幹システム移行プロジェクト', meeting: '第7回ステアリングコミッティ', date: '2026-10-21' };
const dev = { asOf: '2026-10-16', planEnd: '2026-11-27', remaining: 280, velocity: 70, sprintDays: 14 }; // pt, pt/sprint, days
const decisions = [
  {
    title: '開発スコープの調整', due: '2026-10-21', columns: ['開発の完了', '追加費用'],
    options: [
      { what: '帳票アドオン10本（70ポイント）を本番稼働後の第2期に回す', cut: 70, extraVelocity: 0, cost: 0, recommended: true },
      { what: '開発委託先の要員を2名増やす', cut: 0, extraVelocity: 12, cost: 1800 },
      { what: '計画を変えず、予備期間で吸収する', cut: 0, extraVelocity: 0, cost: 0 },
    ],
    reason: '費用をかけずに計画どおり終えられる。対象の10帳票は、稼働後3か月はExcel出力で代替する。',
  },
  {
    title: '受入テスト担当者の確保', due: '2026-11-06', columns: ['懸念', '追加費用'],
    options: [
      { what: '販売・購買・物流の各部と経理部から2名ずつ、計8名を指名する', concern: '2〜3月は各部門に応援体制が要る', cost: 0, recommended: true },
      { what: '各部門1名を指名し、残る4名は外部要員で補う', concern: '合否判定の質が下がるおそれ', cost: 1200 },
    ],
    reason: '合否判定には日々の業務を知る担当者が欠かせない。期間は2027年2月8日〜3月26日、業務時間の半分を充てる。',
  },
];
const page = 6;

// ---- derived
const DAY = 86400000, WD = '日月火水木金土';
const t = iso => Date.parse(`${iso}T00:00:00Z`);
const md = ms => { const d = new Date(ms); return `${d.getUTCMonth() + 1}月${d.getUTCDate()}日`; };
const ymd = ms => `${new Date(ms).getUTCFullYear()}年${md(ms)}`;
const yen = man => (man ? `${man.toLocaleString('ja-JP')}万円` : 'なし');
const finish = o => t(dev.asOf) + Math.round((dev.remaining - o.cut) / (dev.velocity + o.extraVelocity) * dev.sprintDays) * DAY;
const late = ms => Math.round((ms - t(dev.planEnd)) / DAY);
const lateText = d => (d <= 0 ? '計画どおり' : d % 7 === 0 ? `${d / 7}週間遅れ` : `${d}日遅れ`);
const value = (o, col) => {
  if (col === '開発の完了') { const f = finish(o); return `${md(f)}<small class="inline">（${lateText(late(f))}）</small>`; }
  if (col === '追加費用') return yen(o.cost);
  if (col === '懸念') return o.concern;
  return '';
};
const dueText = iso => (iso === project.date ? `本日（${md(t(iso))}）` : `${md(t(iso))}（${WD[new Date(t(iso)).getUTCDay()]}）まで`);
const blocks = decisions.map((d, n) => `<section data-region="${n ? 'support' : 'primary'}">
  <div class="p-q"><h2>判断${n + 1}　${d.title}</h2><p>期限　<b>${dueText(d.due)}</b></p></div>
  <table class="p-table" style="width:1152px">
    <colgroup><col style="width:98px"><col style="width:564px"><col style="width:294px"><col style="width:196px"></colgroup>
    <thead><tr><th>案</th><th>内容</th>${d.columns.map(c => `<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${d.options.map((o, k) => `<tr class="${o.recommended ? 'rec' : ''}"><td class="opt num">${'ABC'[k]}${o.recommended ? '　推奨' : ''}</td><td>${o.what}</td>${d.columns.map(c => `<td class="num">${value(o, c)}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>
  <p class="p-why">推奨の理由：${d.reason}</p>
</section>`).join('\n');
const rec1 = decisions[0].options.find(o => o.recommended);

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Decisions requested: options, recommendation and deadline',
  notes: `Purpose: ステアリングコミッティに判断してほしいことを、選択肢・推奨案・期限つきで示し、その場で決められるようにする。\nModify: decisions を書き換える（2件まで。3件以上は2ページに分ける）。各判断に title・due（期限）・比べる列（columns）・options・reason を置く。開発スコープの案は cut（削るポイント）と extraVelocity（増える速度）から完了日を計算するので、dev は3ページと同じ値にする。\nInvariant: 各判断に推奨案は1つ。推奨の行は太字と「推奨」の文字で示し、色だけに頼らない。期限は日付で書く。選択肢には「何もしない」案も含め、その結果を書く。\nStatic: Already static.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-project-status p-decide',
  content: `<p class="p-run" data-region="support"><span>${project.name}　${project.meeting}</span><span class="num">${ymd(t(project.date))}　${page}</span></p>
<h1 class="p-head" data-region="title">本番稼働日を守るため、開発スコープの調整を<span class="nw">本日</span>、受入テスト担当者の指名を<span class="nw">${md(t(decisions[1].due))}まで</span>に決めていただきたい</h1>
<div class="g" style="--c:1;--s:12;top:214px">
${blocks}
</div>
<p class="p-note" data-region="source">完了日は残り${dev.remaining}ポイントと直近の平均ペース${dev.velocity}ポイント／スプリントから算出（3ページ）。推奨案Aの場合、開発の完了は${md(finish(rec1))}。</p>`,
};
