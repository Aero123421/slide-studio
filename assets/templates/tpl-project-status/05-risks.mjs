// Template: プロジェクト月次状況報告 · リスク（発生可能性×影響度）. Synthetic example content; replace data and copy.
// Every risk is placed on a 3×3 grid from its two ratings; the table lists the top three by score with
// owner, action and date. Risks that today's decisions address are marked in the accent.
import { svgRoot, el, g, textLines } from '../../runtime/figure.mjs';

const ID = 'tpl-project-status-risks';
const project = { name: '基幹システム移行プロジェクト', meeting: '第7回ステアリングコミッティ', date: '2026-10-21' };
const likelihood = ['低', '中', '高'];       // 1–3
const impact = ['小', '中', '大'];           // 1–3
// decision = the decision on page 6 that addresses the risk (omit if none). short = name used in the watch list.
const risks = [
  { id: 'R1', text: '開発の遅れがさらに広がり、予備期間を使い切る', l: 2, i: 3, action: '帳票アドオン10本を第2期に回す（判断1）', owner: 'PMO 森', due: '2026-10-21', decision: 1 },
  { id: 'R2', text: '受入テストの担当者を各部門から確保できない', l: 3, i: 3, action: '各部門長が担当者8名を指名する（判断2）', owner: '営業本部長 小野', due: '2026-11-06', decision: 2 },
  { id: 'R3', text: '取引先マスタの重複が多く、移行データの検証が遅れる', l: 2, i: 3, action: '名寄せのルールを確定し、リハーサル前に2回検証する', owner: '経理部長 石井', due: '2026-11-13' },
  { id: 'R4', short: '取引先20社とのEDI接続試験の日程', l: 2, i: 2 },
  { id: 'R5', short: '総合テストと年度末の繁忙期の重なり', l: 3, i: 2 },
  { id: 'R6', short: 'クラウドERPの定期更新（2027年2月）', l: 1, i: 2 },
];
const top = 3;                               // rows in the table
const page = 5;

// ---- derived
const WD = '日月火水木金土';
const t = iso => Date.parse(`${iso}T00:00:00Z`);
const md = ms => { const d = new Date(ms); return `${d.getUTCMonth() + 1}月${d.getUTCDate()}日`; };
const ymd = ms => `${new Date(ms).getUTCFullYear()}年${md(ms)}`;
const ranked = [...risks].sort((a, b) => b.l * b.i - a.l * a.i || b.i - a.i || a.id.localeCompare(b.id));
const head = ranked.slice(0, top), watch = ranked.slice(top);
const covered = head.filter(r => r.decision);
const words = ['', '1件', '2件', '3件', '4件'];
// Keep numbers with their counters and short references on one line (第2期, 8名, （判断1）, 11月13日).
const keep = text => text.replace(/(第\d+期|\d+(?:名|本|社|件|回)|（[^）]{1,8}）|\d+月\d+日)/g, '<span class="nw">$1</span>');
const rest = head.filter(r => !r.decision);

// ---- figure: 5 columns × 404 px
const W = 466, H = 404, gx = 56, gy = 30, gw = W - gx, gh = H - gy - 64, cw = gw / 3, ch = gh / 3;
const cellX = l => gx + (l - 1) * cw, cellY = i => gy + (3 - i) * ch;
const tint = s => (s >= 6 ? 'var(--ss-seq-3)' : s >= 3 ? 'var(--ss-seq-2)' : 'var(--ss-seq-1)');
const cells = [];
for (let i = 1; i <= 3; i++) for (let l = 1; l <= 3; l++) cells.push(el('rect', { x: cellX(l) + 1, y: cellY(i) + 1, width: cw - 2, height: ch - 2, fill: tint(l * i) }));
const marks = [];
for (let i = 1; i <= 3; i++) for (let l = 1; l <= 3; l++) {
  const here = risks.filter(r => r.l === l && r.i === i);
  here.forEach((r, k) => {
    const cx = cellX(l) + cw / 2 + (k - (here.length - 1) / 2) * 46, cy = cellY(i) + ch / 2;
    const style = r.decision ? { fill: 'var(--teal)', text: '#ffffff' } : head.includes(r) ? { fill: 'var(--ink)', text: '#ffffff' } : { fill: 'var(--paper)', text: 'var(--ink)', stroke: 'var(--ink)' };
    marks.push(g({},
      el('circle', { cx, cy, r: 19, fill: style.fill, stroke: style.stroke || null, 'stroke-width': style.stroke ? 1.5 : null }),
      textLines([r.id], { x: cx, y: cy, size: 16, anchor: 'middle', valign: 'middle', weight: 700, fill: style.text })));
  });
}
const axes = [
  textLines(['影響度'], { x: 0, y: 4, size: 16, valign: 'top', fill: 'var(--muted)' }),
  ...impact.map((v, k) => textLines([v], { x: gx - 16, y: cellY(k + 1) + ch / 2, size: 18, anchor: 'end', valign: 'middle', fill: 'var(--ink)' })),
  ...likelihood.map((v, k) => textLines([v], { x: cellX(k + 1) + cw / 2, y: gy + gh + 12, size: 18, anchor: 'middle', valign: 'top', fill: 'var(--ink)' })),
  textLines(['発生可能性'], { x: gx + gw / 2, y: H - 4, size: 16, anchor: 'middle', fill: 'var(--muted)' }),
];
const figure = svgRoot({
  id: `${ID}-fig`, width: W, height: H,
  title: 'リスクの発生可能性と影響度',
  desc: risks.map(r => `${r.id}：可能性${likelihood[r.l - 1]}・影響${impact[r.i - 1]}`).join('、') + '。',
}, cells, axes, marks);

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Risks by likelihood and impact, top three with owners',
  notes: `Purpose: リスクを同じ物差しで並べ、上位のリスクに誰がいつまでに何をするかを確認する。今日の判断で手当てできるものを区別する。\nModify: risks の各行に、発生可能性 l と影響度 i（1〜3）、上位に入るものには内容・対応策・責任者・期限、判断事項で手当てするものには decision（6ページの番号）を書く。並び順・表に載る上位${top}件・図の位置・見出しの件数は自動。\nInvariant: 優先度はグレーの濃さで示す（状況の色は使わない）。表のリスクには必ず責任者と日付の期限を付ける。今日の判断に関わるリスクだけをアクセント色にする。評価日と評価者を注記に書く。\nStatic: Already static.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-project-status p-risks',
  content: `<p class="p-run" data-region="support"><span>${project.name}　${project.meeting}</span><span class="num">${ymd(t(project.date))}　${page}</span></p>
<h1 class="p-head" data-region="title"><span class="nw">影響の大きいリスク${words[head.length] || head.length + '件'}のうち${words[covered.length] || covered.length + '件'}は、本日の判断で手を打てる。</span><span class="nw">残る${rest.map(r => r.id).join('・')}は${rest.map(r => r.owner.split(' ')[0]).join('・')}が${rest.map(r => md(t(r.due))).join('・')}までに対処する</span></h1>
<figure class="g" style="--c:1;--s:5;top:214px;margin:0" data-region="primary">${figure}</figure>
<table class="p-table g" style="--c:6;--s:7;top:214px" data-region="support">
  <colgroup><col style="width:270px"><col style="width:224px"><col style="width:168px"></colgroup>
  <thead><tr><th>リスク</th><th>対応</th><th>責任者・期限</th></tr></thead>
  <tbody>${head.map(r => `<tr><td><b class="${r.decision ? 'accent' : ''}">${r.id}</b>　${keep(r.text)}</td><td>${keep(r.action)}</td><td>${r.owner}<small class="num">${md(t(r.due))}（${WD[new Date(t(r.due)).getUTCDay()]}）</small></td></tr>`).join('')}</tbody>
</table>
<p class="p-label g" style="--c:6;--s:7;top:548px" data-region="support">そのほかの監視中のリスク：${watch.map(r => `<span class="nw">${r.id} ${r.short}</span>`).join('　')}</p>
<p class="p-note" data-region="source">発生可能性と影響度は、PMOと各部門の責任者が10月14日に評価。濃いグレーほど優先度が高い。</p>`,
};
