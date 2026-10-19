// Template: 年次活動報告（寄付者・自治体向け）· 支出と一人あたりの費用. Synthetic example content; replace data and copy.
// One proportional bar of spending (segments, labels, the classroom bracket and every share are
// computed from `spend`), then the cost per child and per visit with their derivation.
import { el, textLines, measureText } from '../../runtime/figure.mjs';

const ID = 'tpl-impact-report-budget';
const spend = [                       // 支出（万円）。room: true = 教室の運営に直接使った費用
  {name: '学習支援スタッフの人件費', v: 3700, room: true},
  {name: '会場費', v: 640, room: true},
  {name: '教材・軽食', v: 600, room: true},
  {name: 'ボランティア', v: 520, room: true},   // 研修・交通費・保険
  {name: '事務局', v: 840, room: false},
];
const income = [                      // 収入（万円）
  {name: '寄付', v: 2890}, {name: '市の委託', v: 2250}, {name: '助成金', v: 1050}, {name: 'その他', v: 230},
];
const kids = 486, visits = 34992;     // 参加した子ども（実人数）、延べ参加（他のページと同じ値）

// ---- derived
const sum = a => a.reduce((s, x) => s + x.v, 0);
const total = sum(spend), roomTotal = sum(spend.filter(x => x.room)), inTotal = sum(income);
const pct = v => Math.round(v / total * 100);
const yen = total * 10000;
const perChild = Math.round(yen / kids / 10) * 10;          // 129,630円（10円単位）
const perVisit = Math.round(yen / visits / 100) * 100;      // 1,800円（100円単位）
const n = v => v.toLocaleString('ja-JP');
const approx = Math.round(perChild / 10000);                // 約13万円

// ---- geometry: bar across the full measure (figure at x=64, y=186; its first line hangs from y≈200)
const W = 1152, barY = 54, barH = 56, gap = 2;
let acc = 0;
const segs = spend.map(s => { const x0 = acc / total * W; acc += s.v; return {...s, x0, x1: acc / total * W}; });
const roomEnd = segs.filter(s => s.room).at(-1).x1;
const rows = [[], []], rowY = [barY + barH + 30, barY + barH + 86];
const labels = segs.map((s, i) => {
  const last = i === segs.length - 1;
  const w = Math.max(measureText(s.name, 16, {weight: 700}), measureText(`${n(s.v)}万円　${pct(s.v)}%`, 16)) + 4;
  const a = last ? W - w : s.x0, b = last ? W : s.x0 + w;
  const r = rows.findIndex(row => row.every(([p, q]) => b + 48 <= p || a >= q + 48)); // 同じ段のラベルは48px以上離す
  const row = r < 0 ? 1 : r; rows[row].push([a, b]);
  const lx = last ? W : s.x0, anchor = last ? 'end' : 'start', tick = last ? W - 1 : s.x0 + 1;
  return el('line', {x1: tick, x2: tick, y1: barY + barH + 4, y2: rowY[row] - 18, stroke: 'var(--ir-muted)', 'stroke-width': 1})
    + textLines([s.name], {x: lx, y: rowY[row], anchor, cls: 'sv-lb', attrs: {style: 'font-size:16px'}})
    + textLines([`${n(s.v)}万円　${pct(s.v)}%`], {x: lx, y: rowY[row] + 22, anchor, cls: 'sv-s'});
}).join('');
const bar = segs.map((s, i) => el('rect', {x: s.x0 + (i ? gap / 2 : 0), y: barY, width: s.x1 - s.x0 - (i ? gap / 2 : 0) - (i < segs.length - 1 ? gap / 2 : 0), height: barH,
  fill: s.room ? 'var(--ir-accent)' : 'var(--ir-context)'})).join('');
const bracket = el('path', {d: `M0.5 ${barY - 8}V${barY - 16}H${roomEnd - 2}V${barY - 8}`, fill: 'none', stroke: 'var(--ir-ink)', 'stroke-width': 1})
  + textLines([`教室の運営に使った費用　${n(roomTotal)}万円（${pct(roomTotal)}%）`], {x: 0, y: barY - 28, cls: 'sv-lb'});
const H = rowY[1] + 30;

const svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
  <title id="${ID}-t">2025年度の支出の内訳（合計${n(total)}万円）</title>
  <desc id="${ID}-d">${spend.map(s => `${s.name} ${n(s.v)}万円（${pct(s.v)}%）`).join('、')}。教室の運営に使った費用は${n(roomTotal)}万円で、支出の${pct(roomTotal)}%。</desc>
  ${bracket}${bar}${labels}
</svg>`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Spending and the cost per child',
  notes: 'Purpose: 寄付と委託費がどこに使われたかを1本の帯で示し、子ども一人・1回あたりの費用に言い換えて実感できる大きさにする。\nModify: spend（万円、room: true が教室の運営費）と income、参加者数・延べ参加数を差し替える。帯の幅、割合、ラベルの段、一人あたりの費用、見出しの「約◯万円」は自動で計算される。\nInvariant: 帯の合計＝支出合計。一人あたり＝支出合計÷実人数、1回あたり＝支出合計÷延べ参加。割り算の式をページに残す。事務局の費用も隠さない。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-impact-report ir-budget',
  content: `<h1 class="ir-h" data-region="title">子ども一人あたりの費用は、一年で<span class="ir-nw">約${approx}万円</span>でした</h1>
<figure class="ir-fig" style="left:64px;top:186px;width:${W}px;height:${H}px" data-region="support">${svg}</figure>
<div class="ir-cost" style="left:64px" data-region="primary"><p class="ir-n">${n(perChild)}<small>円</small></p><p class="ir-n-l">子ども一人あたりの年間費用</p><p class="ir-n-d">支出 <b>${n(total)}万円</b> ÷ 参加した子ども <b>${n(kids)}人</b></p></div>
<div class="ir-cost" style="left:652px"><p class="ir-n">${n(perVisit)}<small>円</small></p><p class="ir-n-l">1回の参加あたり</p><p class="ir-n-d">支出 <b>${n(total)}万円</b> ÷ 延べ参加 <b>${n(visits)}人</b></p></div>
<div class="ir-foot" data-region="source"><p>2025年度決算（万円）。収入は${n(inTotal)}万円：${income.map(x => `${x.name}${n(x.v)}`).join('・')}。<br>差額${n(inTotal - total)}万円は、2026年度の新しい教室の開設に充てる</p><p>ゆうがた教室　2025年度 活動報告<b>4</b></p></div>`,
};
