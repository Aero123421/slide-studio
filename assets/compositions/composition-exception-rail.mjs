// Composition study · Exception rail — the qualification sits on the row it qualifies. Each note
// in the right-hand rail is set at the height of its store's bar and tied to it by a leader, so
// the reader meets the reason exactly where the odd number is. All values come from `stores`.
import { svgRoot, el, textLines, linear, band, measureText, wrapText, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const ID = 'composition-exception-rail';
// 上期（4〜9月）の売上、百万円。営業日数つき。`why` がある店は前年と条件が違う（架空のデータ）
const stores = [
  { name: '本町店', prev: 412, now: 440 },
  { name: '緑ヶ丘店', prev: 356, now: 375 },
  { name: '川端店', prev: 298, now: 313 },
  { name: '中央通り店', prev: 521, now: 540 },
  { name: '桜台店', prev: 264, now: 271 },
  { name: '北浜店', prev: 330, now: 337 },
  { name: '西町店', prev: 287, now: 291 },
  { name: '南口店', prev: 342, now: 344 },
  { name: '駅前店', prev: 305, now: 362, why: 'moved', area: 1.4 },            // 4月に駅ビルへ移転、売場面積は1.4倍
  { name: '港北店', prev: 389, now: 352, why: 'closed', daysPrev: 183, daysNow: 164 }, // 6月に改装で休業
];

// derived values
const yoy = s => s.now / s.prev - 1;
const rows = [...stores].sort((a, b) => yoy(b) - yoy(a));
const same = stores.filter(s => !s.why), odd = stores.filter(s => s.why);
const sum = (list, k) => list.reduce((a, s) => a + s[k], 0);
const sameTotal = sum(same, 'now') / sum(same, 'prev') - 1;
const up = same.filter(s => yoy(s) > 0).length;
const p1 = v => fmt(v * 100, { digits: 1, sign: true, locale: 'ja', suffix: '%' });
const perDay = s => (s.now / s.daysNow) / (s.prev / s.daysPrev) - 1;
// The engine's wrapText can break between a decimal and its unit ("1.4|倍"); re-flow so they stay together.
const UNIT = /^[倍日店人件%％円年月時分]/, NUM = /[+−-]?[0-9][0-9.,]*$/;
const wrapJa = (text, width, size) => {
  const lines = wrapText(text, width, size);
  for (let i = 0; i < lines.length - 1; i++) {
    const m = lines[i].match(NUM);
    if (m && UNIT.test(lines[i + 1])) {
      lines[i] = lines[i].slice(0, -m[0].length);
      lines.splice(i + 1, Infinity, ...wrapText(m[0] + lines.slice(i + 1).join(''), width, size));
    }
  }
  return lines;
};
const noteFor = s => s.why === 'moved'
  ? `4月に駅ビル内へ移転し、売場面積が${fmt(s.area, { digits: 1, locale: 'ja' })}倍になった。前年と同じ店としては比べられない。`
  : `6月に改装で${s.daysPrev - s.daysNow}日間休業した。営業日1日あたりでは前年比${p1(perDay(s))}。`;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470;
  const railX = 812, railW = W - railX; // the rail: notes registered to their rows
  const nameW = Math.max(...rows.map(s => measureText(s.name, 18, { weight: 600 })));
  const x = linear([-10, 20], [nameW + 36, railX - 92]);
  const y = band(rows.map(s => s.name), [40, H - 40], { inner: 0.36, outer: 0.08 });
  const parts = [];
  parts.push(textLines(['前年同期比'], { x: x(-10), y: 8, size: 16, valign: 'top', fill: t.c('muted'), weight: 600 }));
  parts.push(textLines(['前年と条件が違う店の理由'], { x: railX, y: 8, size: 16, valign: 'top', fill: t.c('muted'), weight: 600 }));
  for (const v of [-10, 0, 10, 20]) {
    parts.push(el('line', { x1: x(v), x2: x(v), y1: 34, y2: H - 30, stroke: v === 0 ? t.c('ink') : t.c('grid'), 'stroke-width': v === 0 ? 1.6 : 1 }));
    parts.push(textLines([v === 0 ? '0' : fmt(v, { sign: true, suffix: '%' })], { x: x(v), y: H - 22, size: 16, anchor: 'middle', valign: 'top', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  }
  // reference: the comparable stores together
  const rx = x(sameTotal * 100);
  parts.push(el('line', { x1: rx, x2: rx, y1: 6, y2: H - 30, stroke: t.c('muted'), 'stroke-width': 1.4, 'stroke-dasharray': '4 4' }));
  parts.push(textLines([`${same.length}店計 ${p1(sameTotal)}`], { x: rx + 8, y: 8, size: 16, valign: 'top', fill: t.c('muted'), weight: 600 }));
  rows.forEach(s => {
    const cy = y.center(s.name), v = yoy(s) * 100, isOdd = !!s.why;
    const x0 = x(Math.min(0, v)), x1 = x(Math.max(0, v));
    const labelX = v >= 0 ? x1 + 10 : x0 - 10;
    parts.push(textLines([s.name], { x: 0, y: cy, size: 18, valign: 'middle', fill: isOdd ? t.c('muted') : t.c('ink'), weight: 600 }));
    parts.push(el('rect', { x: x0, y: cy - y.bw / 2, width: Math.max(1, x1 - x0), height: y.bw, fill: isOdd ? t.c('context') : t.c('accent') }));
    const label = p1(yoy(s));
    parts.push(textLines([label], { x: labelX, y: cy, size: 17, anchor: v >= 0 ? 'start' : 'end', valign: 'middle', fill: isOdd ? t.c('muted') : t.c('ink'), weight: 600, halo: t.c('paper'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
    if (!isOdd) return;
    // the note: first line on the row's centre line, joined to the bar by a leader
    const lines = wrapJa(noteFor(s), railW, 17);
    const leaderFrom = v >= 0 ? labelX + measureText(label, 17, { weight: 600 }) + 10 : x1 + 10;
    parts.push(el('line', { x1: leaderFrom, x2: railX - 12, y1: cy, y2: cy, stroke: t.c('muted'), 'stroke-width': 1.2, 'stroke-dasharray': '2 4' }));
    parts.push(textLines([s.name], { x: railX, y: cy, size: 18, valign: 'middle', fill: t.c('ink'), weight: 700 }));
    parts.push(textLines(lines, { x: railX, y: cy + 18, size: 17, valign: 'top', lineHeight: 1.6, fill: t.c('ink') }));
  });
  return svgRoot({ id: `${ID}-fig`, width: W, height: H, theme: t,
    title: '店舗別の上期売上の前年同期比と、条件が違う2店の理由',
    desc: `前年と条件が同じ${same.length}店はすべて前年を上回り、合計は${p1(sameTotal)}。${odd.map(s => `${s.name}は${p1(yoy(s))}`).join('、')}で、それぞれの理由を同じ行の右に記す。` },
  parts);
}

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Exception rail: each qualification sits on the row it qualifies',
  className: 'st cs-sales-kpi cmp-exception-rail',
  notes: 'Purpose: Use when most of the evidence supports the claim but one or two items are not comparable (a relocation, a closure, a definition change). The reason is set in a rail at the height of the item it explains, so the qualification is read in the same glance as the odd number — not in a footnote the room never reaches.\nModify: Replace `stores`; mark non-comparable rows with `why` and the facts that explain them, and write `noteFor` for your reasons. Sort order, bars, the reference total, the notes\' positions and leaders recompute.\nInvariant: A note\'s first line shares its row\'s centre line; the leader runs at that height; non-comparable rows stay in the chart in context grey (never deleted) and are excluded from the headline total; the accent marks only the comparable actuals the headline counts.\nStatic: Already static.',
  sources: [{ type: 'original-example', file: `assets/compositions/${ID}.mjs` }],
  exportPolicy: 'final',
  content: `<h1 class="st-head st-one" data-region="title">上期の売上は、条件が同じ<em>${up === same.length ? `${same.length}店すべて` : `${same.length}店中${up}店`}</em>で前年を上回った</h1>
<p class="st-dek" data-region="support">${same.length}店の合計は前年同期比${p1(sameTotal)}。移転した駅前店と改装で休業した港北店は、前年と同じ物差しで比べられない。</p>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · POSの売上（税抜）、2025年度と2026年度の4〜9月</span><span>横棒グラフ · 例外の注記を該当行にそろえる</span></p>`,
};
