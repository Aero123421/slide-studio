// Template: 年次活動報告（寄付者・自治体向け）· 地区別の実績. Synthetic example content; replace data and copy.
// Reach = children who came ÷ children who qualify for school-expense aid, by district. Rows are
// sorted by reach; the district that needs attention takes the accent and a one-line explanation.
import { el, textLines, linear, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-impact-report-regions';
const districts = [            // 教室数、参加した子ども（実人数）、対象の子ども（就学援助を受ける小中学生）
  {name: '本町', rooms: 3, kids: 128, eligible: 610},
  {name: '川西', rooms: 3, kids: 117, eligible: 540},
  {name: '桜台', rooms: 2, kids: 96, eligible: 420},
  {name: '港南', rooms: 2, kids: 82, eligible: 390},
  {name: '緑ヶ丘', rooms: 2, kids: 63, eligible: 520,
    note: '2教室とも駅の北側にあり、南部の団地からは歩いて30分かかる'},
];

// ---- derived
const rows = districts.map(d => ({...d, reach: d.kids / d.eligible * 100})).sort((a, b) => b.reach - a.reach);
const total = rows.reduce((t, d) => ({rooms: t.rooms + d.rooms, kids: t.kids + d.kids, eligible: t.eligible + d.eligible}), {rooms: 0, kids: 0, eligible: 0});
const city = total.kids / total.eligible * 100;                 // 19.6
const low = rows.at(-1);                                        // 最も届いていない地区
const oneIn = Math.round(low.eligible / low.kids);              // 8人に1人
const n = v => v.toLocaleString('ja-JP'), p1 = v => fmt(v, {digits: 1});

// ---- geometry (figure at x=64, y=200; 1152 wide; bar track = columns 3–8)
const W = 1152, head = 24, rowH = 58, noteH = 30;
const X = {name: 0, rooms: 150, bar: 196, barEnd: 760, kids: 956, elig: 1152};
const x = linear([0, 25], [X.bar, X.barEnd]);
let y = head + 18;
const lay = rows.map(d => { const top = y; y += rowH + (d.note ? noteH : 0); return {...d, top}; });
const totTop = y + 10, H = totTop + rowH - 6;
const header = [
  textLines(['地区'], {x: X.name, y: 16, cls: 'sv-h'}),
  textLines(['教室'], {x: X.rooms, y: 16, anchor: 'end', cls: 'sv-h'}),
  textLines(['届いている割合（参加した子ども ÷ 対象の子ども）'], {x: X.bar, y: 16, cls: 'sv-h'}),
  textLines(['参加した子ども'], {x: X.kids, y: 16, anchor: 'end', cls: 'sv-h'}),
  textLines(['対象の子ども'], {x: X.elig, y: 16, anchor: 'end', cls: 'sv-h'}),
  el('line', {x1: 0, x2: W, y1: head + 4.5, y2: head + 4.5, stroke: 'var(--ir-ink)', 'stroke-width': 1}),
].join('');
const marks = lay.map(d => {
  const on = d.name === low.name, cy = d.top + rowH / 2 - 6;
  return [
    textLines([d.name], {x: X.name, y: cy + 7, cls: 'sv-lb'}),
    textLines([String(d.rooms)], {x: X.rooms, y: cy + 8, anchor: 'end', cls: 'sv-n'}),
    el('rect', {x: X.bar, y: cy - 11, width: x(d.reach) - X.bar, height: 22, fill: on ? 'var(--ir-accent)' : 'var(--ir-context)'}),
    textLines([`${p1(d.reach)}%`], {x: x(d.reach) + 10, y: cy + 8, cls: on ? 'sv-n sv-a' : 'sv-n'}),
    textLines([`${n(d.kids)}人`], {x: X.kids, y: cy + 8, anchor: 'end', cls: 'sv-n'}),
    textLines([`${n(d.eligible)}人`], {x: X.elig, y: cy + 8, anchor: 'end', cls: 'sv-n', attrs: {style: 'fill:var(--ir-muted)'}}),
    d.note ? textLines([d.note], {x: X.bar, y: cy + 44, cls: 'sv-l', attrs: {style: 'font-size:17px'}}) : '',
    el('line', {x1: 0, x2: W, y1: d.top + rowH + (d.note ? noteH : 0) - 1, y2: d.top + rowH + (d.note ? noteH : 0) - 1, stroke: 'var(--ir-faint)', 'stroke-width': 1}),
  ].join('');
}).join('');
const ref = el('line', {x1: x(city), x2: x(city), y1: head + 12, y2: totTop + 6, stroke: 'var(--ir-ink)', 'stroke-width': 1, 'stroke-dasharray': '2 4'});
const tcy = totTop + rowH / 2 - 6;
const totals = [
  el('line', {x1: 0, x2: W, y1: totTop - 0.5, y2: totTop - 0.5, stroke: 'var(--ir-ink)', 'stroke-width': 1}),
  textLines(['市全体'], {x: X.name, y: tcy + 7, cls: 'sv-lb'}),
  textLines([String(total.rooms)], {x: X.rooms, y: tcy + 8, anchor: 'end', cls: 'sv-n'}),
  textLines([`${p1(city)}%`], {x: x(city) + 10, y: tcy + 8, cls: 'sv-n'}),
  textLines([`${n(total.kids)}人`], {x: X.kids, y: tcy + 8, anchor: 'end', cls: 'sv-n'}),
  textLines([`${n(total.eligible)}人`], {x: X.elig, y: tcy + 8, anchor: 'end', cls: 'sv-n', attrs: {style: 'fill:var(--ir-muted)'}}),
].join('');

const svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
  <title id="${ID}-t">地区別：支援が届いている割合（参加した子ども ÷ 就学援助を受ける小中学生）</title>
  <desc id="${ID}-d">${rows.map(d => `${d.name} ${p1(d.reach)}%（${d.kids}人／${d.eligible}人、${d.rooms}教室）`).join('、')}。市全体 ${p1(city)}%（${total.kids}人／${n(total.eligible)}人）。${low.name}：${low.note}。</desc>
  ${header}${marks}${ref}${totals}
</svg>`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Results by district: share of eligible children reached',
  notes: 'Purpose: 地区ごとに「支援が必要な子どものうち、どれだけに届いているか」を比べ、次の教室をどこに開くかの根拠を示す。\nModify: districts の教室数・参加者数・対象者数を差し替える。割合、並び順、市全体の値、強調する地区（割合が最も低い地区）は自動で決まる。note には強調した地区の事情を一文で書く。見出しの改行は <br> で文や句の切れ目に入れる。\nInvariant: 割合の分母（対象の子ども）を必ず表に出す。参加者の合計は1ページ目の486人と一致させる。地図は使わない（位置関係を捏造しない）。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-impact-report ir-regions',
  content: `<h1 class="ir-h" data-region="title">${low.name}地区では、<br>支援を必要とする子どもの<span class="ir-nw">${oneIn}人に1人</span>にしか届いていない</h1>
<figure class="ir-fig" style="left:64px;top:200px;width:${W}px;height:${H}px" data-region="primary">${svg}</figure>
<div class="ir-foot" data-region="source"><p>対象の子ども：就学援助を受けている市内の小中学生（2025年5月1日現在、市教育委員会）。参加した子どもは年度内の実人数</p><p>ゆうがた教室　2025年度 活動報告<b>2</b></p></div>`,
};
