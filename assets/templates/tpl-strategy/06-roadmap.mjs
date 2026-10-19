// Template: 戦略提案（経営会議向け）· 実行ロードマップ. Synthetic example content; replace data and copy.
// One time axis (months from 2026年4月) carries the phases, the work on each lever, the milestones
// and the year-end KPIs, so every column of numbers sits under its own fiscal year.
import { el, textLines, linear, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-strategy-roadmap';
const axis = {from: 6, to: 48, fy0: 2026};       // 月（2026年4月＝0）。2026年10月から2029年度末まで
const ym = t => { const m = Math.floor(t) + 3; return `${axis.fy0 + Math.floor(m / 12)}年${(m % 12) + 1}月`; }; // 月番号→暦の年月
const phases = [
  {name: '第1段階　値付けと販促', from: 6, to: 18},
  {name: '第2段階　受け取りと物流', from: 18, to: 36},
  {name: '第3段階　定着', from: 36, to: 48},
];
const work = [                                    // no は論点ツリーの番号。bar = [開始, 終了]（月）。ms = 節目
  {no: '1.1', name: '値引き販売の抑制', bar: [6, 18]},
  {no: '2.1', name: '送料無料ラインの改定', bar: [6, 12], ms: {at: 12, text: '改定'}},
  {no: '3.1', name: '広告配分の見直し', bar: [6, 15]},
  {no: '2.4', name: '配送会社の再入札', bar: [9, 15], ms: {at: 15, text: '新契約'}},
  {no: '2.2', name: '店舗受け取りの拡大', bar: [12, 23.5], ms: {at: 23.5, text: '全118店'}}, // 23.5＝2028年3月中
  {no: '2.3', name: '仕分けの自動化', bar: [15, 30], ms: {at: 30, text: '本稼働'}},
  {no: '1.2', name: 'PB比率の引き上げ', bar: [12, 44]},
];
const years = [2025, 2026, 2027, 2028, 2029];    // 年度（2025年度は実績、2026年度は見込み）
const kpis = [                                    // 各年度末の値
  {name: '営業利益率', unit: '%', digits: 1, op: [3.6, 4.6, 9.0, 12.8, 16.2], sales: [240, 247, 255, 262, 270]}, // 営業利益・売上高（億円）から計算
  {name: '店舗受け取り比率', unit: '%', v: [9, 10, 14, 17, 18]},
  {name: 'PB比率', unit: '%', v: [22, 23, 26, 29, 32]},
  {name: '平均値引率', unit: '%', v: [14, 12, 10, 10, 10]},
];

// ---- derived
const rows = kpis.map(k => ({...k, v: k.v ?? k.op.map((o, i) => Math.round(o / k.sales[i] * 1000) / 10)}));
const f = (v, k) => fmt(v, {digits: k.digits ?? 0});

// ---- geometry (figure at x=64, y=172; 1152 wide; timeline = columns 4–12)
const W = 1152, L = 294, x = linear([axis.from, axis.to], [L, W]);
const Y = {phase: 16, year: 56, rows: 70, rowH: 30};
const yRow = i => Y.rows + i * Y.rowH;
const kTop = yRow(work.length) + 18, kRowH = 27;
const H = kTop + 32 + rows.length * kRowH;
const yearStart = fy => (fy - axis.fy0) * 12;     // 年度の始まり（月）
const span = fy => [Math.max(axis.from, yearStart(fy)), Math.min(axis.to, yearStart(fy) + 12)];
const fys = years.filter(fy => span(fy)[1] > span(fy)[0]);

const gridLines = fys.map(fy => [
  el('line', {x1: x(span(fy)[0]), x2: x(span(fy)[0]), y1: Y.year - 22, y2: H, stroke: 'var(--st-rule)', 'stroke-width': 1}),
  yearStart(fy) + 6 > axis.from && yearStart(fy) + 6 < axis.to ? el('line', {x1: x(yearStart(fy) + 6), x2: x(yearStart(fy) + 6), y1: Y.year + 8, y2: yRow(work.length), stroke: 'var(--st-faint)', 'stroke-width': 1}) : '',
  textLines([`${fy}年度${span(fy)[1] - span(fy)[0] < 12 ? '下期' : ''}`], {x: x(span(fy)[0]) + 10, y: Y.year, cls: 'sv-h', attrs: {style: 'fill:var(--st-ink)'}}),
].join('')).join('');
const phaseMarks = phases.map((p, i) => {
  const a = x(p.from) + (i ? 4 : 0), b = x(p.to) - 4;
  return el('path', {d: `M${a} ${Y.phase + 12}V${Y.phase + 6}H${b}V${Y.phase + 12}`, fill: 'none', stroke: 'var(--st-link)', 'stroke-width': 1.2})
    + textLines([p.name], {x: a, y: Y.phase - 2, cls: 'sv-h', attrs: {style: 'fill:var(--st-ink)'}});
}).join('');
const workRows = work.map((w, i) => {
  const cy = yRow(i) + Y.rowH / 2;
  const bar = el('rect', {x: x(w.bar[0]), y: cy - 5, width: x(w.bar[1]) - x(w.bar[0]), height: 10, fill: 'var(--st-accent)'});
  const ms = w.ms ? el('path', {d: `M${x(w.ms.at)} ${cy - 9}L${x(w.ms.at) + 9} ${cy}L${x(w.ms.at)} ${cy + 9}L${x(w.ms.at) - 9} ${cy}Z`, fill: 'var(--st-ink)', stroke: 'var(--st-paper)', 'stroke-width': 1.5})
    + textLines([`${ym(w.ms.at)} ${w.ms.text}`], {x: x(w.ms.at) + 16, y: cy + 6, cls: 'sv-l', attrs: {style: 'font-weight:700'}}) : '';
  return el('line', {x1: 0, x2: W, y1: yRow(i + 1), y2: yRow(i + 1), stroke: 'var(--st-faint)', 'stroke-width': 1})
    + textLines([`${w.no}　${w.name}`], {x: 0, y: cy + 6, cls: 'sv-l'}) + bar + ms;
}).join('');
const kpiBlock = [
  el('line', {x1: 0, x2: W, y1: kTop, y2: kTop, stroke: 'var(--st-ink)', 'stroke-width': 1}),
  textLines(['重要指標（年度末）'], {x: 0, y: kTop + 24, cls: 'sv-h', attrs: {style: 'fill:var(--st-ink)'}}),
  textLines(['2025年度実績'], {x: L - 14, y: kTop + 24, anchor: 'end', cls: 'sv-b'}),
  ...rows.map((k, r) => {
    const by = kTop + 32 + r * kRowH + 20;
    return textLines([k.name], {x: 0, y: by, cls: 'sv-l'})
      + textLines([`${f(k.v[0], k)}${k.unit}`], {x: L - 14, y: by, anchor: 'end', cls: 'sv-n', attrs: {style: 'fill:var(--st-muted)'}})
      + fys.map(fy => {
        const i = years.indexOf(fy), last = fy === fys.at(-1);
        return textLines([`${f(k.v[i], k)}${k.unit}`], {x: x(span(fy)[1]) - 12, y: by, anchor: 'end', cls: last ? 'sv-n sv-a' : 'sv-n', attrs: last ? {style: 'font-weight:700'} : {}});
      }).join('');
  }),
].join('');

const svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${ID}-t ${ID}-d">
  <title id="${ID}-t">実行ロードマップと重要指標（${ym(axis.from)}〜${axis.fy0 + 3}年度末）</title>
  <desc id="${ID}-d">${phases.map(p => `${p.name.replace('　', '：')}（${ym(p.from)}〜）`).join('、')}。${work.map(w => `${w.no} ${w.name}：${ym(w.bar[0])}〜${ym(w.bar[1] - 1)}${w.ms ? `、${ym(w.ms.at)}に${w.ms.text}` : ''}`).join('。')}。年度末の指標：${rows.map(k => `${k.name} ${years.map((fy, i) => `${fy}年度${f(k.v[i], k)}${k.unit}`).join('、')}`).join('。')}。</desc>
  ${gridLines}${phaseMarks}${workRows}${kpiBlock}
</svg>`;

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Roadmap 2026–2029: phases, milestones and year-end KPIs',
  notes: 'Purpose: 推奨案をいつ・どの順で実行し、各年度末にどの指標がどこまで動くかを1枚で約束する。\nModify: axis（期間）、phases（段階）、work（打ち手ごとの期間と節目、月番号は2026年4月＝0）、kpis（年度末の値）を差し替える。営業利益率は営業利益と売上高から計算される。\nInvariant: 打ち手の番号は論点ツリーと同じにする。節目の日付は推奨案ページの「実現の条件」と一致させ、2029年度末の値は推奨案の数値（利益率6.0%）と一致させる。\nStatic: 静的ページ。',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-strategy st-roadmap',
  content: `<h1 class="st-title" data-region="title">1年目に値付けと販促を見直し、<br>店舗受け取りと自動化は${ym(work.find(w => w.no === '2.3').ms.at)}までに整える</h1>
<figure class="st-fig" style="left:64px;top:168px;width:${W}px;height:${H}px" data-region="primary">${svg}</figure>
<div class="st-foot" data-region="source"><p>注：年度は4月〜翌3月。2025年度は実績、2026年度は見込み。◆は節目<br>出典：白峰パートナーズ分析</p><p>EC事業の収益改善<b>6</b></p></div>`,
};
