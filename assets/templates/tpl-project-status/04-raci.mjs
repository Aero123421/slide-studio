// Template: プロジェクト月次状況報告 · 役割分担（RACI）. Synthetic example content; replace data and copy.
// Letters only, one A per row (checked when the module loads). The cells the page is about (`focus`) are
// marked in the accent; the headline names that role and the deadline from `ask`.
const ID = 'tpl-project-status-raci';
const project = { name: '基幹システム移行プロジェクト', meeting: '第7回ステアリングコミッティ', date: '2026-10-21' };
const roles = [                     // columns; '\n' sets the line break in the header
  { id: 'sc', label: 'ステコミ' },
  { id: 'pmo', label: 'PMO' },
  { id: 'is', label: '情報\nシステム部' },
  { id: 'biz', label: '業務部門' },
  { id: 'acc', label: '経理部' },
  { id: 'vendor', label: '導入\nベンダー' },
];
// R 実行責任 · A 説明責任（各行に1名、A/R は兼務）· C 協議 · I 報告. focus = role id whose cell this page is about.
const tasks = [
  { name: '開発スコープの変更判断', sc: 'A', pmo: 'R', is: 'C', biz: 'C', acc: 'I', vendor: 'C' },
  { name: '結合テストの計画と実施', sc: 'I', pmo: 'C', is: 'A', biz: 'I', acc: 'I', vendor: 'R' },
  { name: '受入テストのシナリオ作成', pmo: 'C', is: 'C', biz: 'A/R', acc: 'R', vendor: 'C', focus: 'biz' },
  { name: '受入テストの実施と合否判定', sc: 'I', pmo: 'C', is: 'C', biz: 'A/R', acc: 'R', vendor: 'C', focus: 'biz' },
  { name: '移行データの名寄せと検証', pmo: 'I', is: 'C', biz: 'R', acc: 'A/R', vendor: 'C' },
  { name: '移行リハーサル', sc: 'I', pmo: 'C', is: 'A', biz: 'C', acc: 'C', vendor: 'R' },
  { name: '利用者研修', pmo: 'I', is: 'C', biz: 'A', acc: 'C', vendor: 'R' },
  { name: '本番移行の可否判定', sc: 'A', pmo: 'R', is: 'C', biz: 'C', acc: 'C', vendor: 'C' },
];
const ask = { testers: 8, by: '2026-11-06', from: '販売・購買・物流の各部と経理部から2名ずつ', period: '2027年2月8日〜3月26日', share: '業務時間の半分' };
const page = 4;

// ---- derived and checked
for (const tk of tasks) {
  const a = roles.filter(r => /A/.test(tk[r.id] || '')).length;
  if (a !== 1) throw Error(`${ID}: "${tk.name}" has ${a} accountable roles (A); it must have exactly one.`);
}
const t = iso => Date.parse(`${iso}T00:00:00Z`);
const md = ms => { const d = new Date(ms); return `${d.getUTCMonth() + 1}月${d.getUTCDate()}日`; };
const ymd = ms => `${new Date(ms).getUTCFullYear()}年${md(ms)}`;
const focusRole = roles.find(r => tasks.some(tk => tk.focus === r.id));
const focusLabel = focusRole.label.replace('\n', '');
const cell = (tk, r) => {
  const v = tk[r.id] || '';
  const cls = ['c', /A/.test(v) ? 'a' : /^[CI]$/.test(v) ? 'ci' : '', tk.focus === r.id ? 'focus' : ''].filter(Boolean).join(' ');
  return `<td class="${cls}">${v}</td>`;
};

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'RACI: who does, who decides, for the next phase',
  notes: `Purpose: 次の工程の主な作業について、誰が実行し誰が最終責任を持つかを合意し、今日決めるべき体制の穴を示す。\nModify: roles（列）と tasks（行と各役割の R／A／C／I）を書き換える。各行の A がちょうど1つでないと読み込み時にエラーになる。focus を付けたセルが強調され、見出しの役割名に使われる。ask の人数・期限・内訳を実際の依頼に合わせる。\nInvariant: 文字だけで表す（色付きの札にしない）。A は各行1名、A と R の兼務は A/R と書く。役割は個人名でなく役割名で書く。強調するのは今日の判断に関わるセルだけ。\nStatic: Already static.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-project-status p-raci',
  content: `<p class="p-run" data-region="support"><span>${project.name}　${project.meeting}</span><span class="num">${ymd(t(project.date))}　${page}</span></p>
<h1 class="p-head" data-region="title"><span class="nw">受入テストの実施と合否判定は${focusLabel}が担う。</span><span class="nw">${md(t(ask.by))}までに担当者${ask.testers}名の指名が必要</span></h1>
<table class="p-table g" style="--c:1;--s:12;top:214px" data-region="primary">
  <colgroup><col style="width:392px">${roles.map(() => '<col>').join('')}</colgroup>
  <thead><tr><th>作業</th>${roles.map(r => `<th class="c">${r.label.replace('\n', '<br>')}</th>`).join('')}</tr></thead>
  <tbody>${tasks.map(tk => `<tr><td>${tk.name}</td>${roles.map(r => cell(tk, r)).join('')}</tr>`).join('')}</tbody>
</table>
<p class="p-label g" style="--c:1;--s:12;top:614px" data-region="support"><b class="num" style="color:var(--ink)">R</b> 実行責任　<b class="num" style="color:var(--ink)">A</b> 説明責任（各行に1名）　<b class="num" style="color:var(--ink)">C</b> 協議（事前に相談）　<b class="num" style="color:var(--ink)">I</b> 報告（結果を共有）</p>
<p class="p-note" data-region="source">受入テストの担当者は${ask.from}、計${ask.testers}名。${ask.period}は${ask.share}を受入テストに充てる想定。</p>`,
};
