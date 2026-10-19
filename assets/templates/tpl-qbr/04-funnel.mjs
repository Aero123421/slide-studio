// Template: 四半期業績レビュー（QBR）· 商談ファネル. Synthetic example content; replace data and copy.
// Stage counts for this and last quarter. Bar lengths share one scale; conversion rates, the step that fell
// most, and the counterfactual in the rail are all computed from `stages` and `newArr`.
import { svgRoot, el, g, textLines, linear, fmt, measureText } from '../../runtime/figure.mjs';

const ID = 'tpl-qbr-funnel';
const periods = { now: '7–9月', prev: '4–6月' };
const stages = [                         // 件数
  { label: 'リード', rate: null, now: 4820, prev: 4080 },
  { label: '商談', rate: '商談化率', now: 964, prev: 1061 },
  { label: '提案', rate: '提案率', now: 405, prev: 435 },
  { label: '受注', rate: '受注率', now: 117, prev: 124 },
];
const newArr = { now: 380, plan: 450 };  // 新規ARR, 百万円 (same as page 2)
const cause = { staffShort: 3, daysPrev: 2.1, daysNow: 4.6 };  // インサイドセールスの欠員（人）と初回接触までの平均日数
const source = '出所：営業本部 SFA（2026年10月5日抽出）';
const running = '2026年度 第2四半期 業績レビュー';
const page = 4;

// ---- derived
const steps = stages.slice(1).map((s, i) => ({ ...s, from: stages[i], cNow: s.now / stages[i].now, cPrev: s.prev / stages[i].prev }));
steps.forEach(st => { st.d = (st.cNow - st.cPrev) * 100; });
const worst = steps.reduce((a, b) => (b.d < a.d ? b : a));
const wi = steps.indexOf(worst);
// Counterfactual: the worst step at last quarter's rate, every other step at this quarter's rate.
let count = stages[0].now;
steps.forEach((st, i) => { count *= i === wi ? st.cPrev : st.cNow; });
const acv = newArr.now / stages.at(-1).now;          // 百万円 per deal
const extraDeals = Math.round(count - stages.at(-1).now);
const altArr = Math.round(count * acv);
const pct1 = v => fmt(v * 100, { digits: 1 });
const growth = v => fmt(v, { digits: 0, sign: true });
const leadGrowth = (stages[0].now / stages[0].prev - 1) * 100;
const winChange = stages.at(-1).now - stages.at(-1).prev;

// ---- figure: 8 columns × 432 px. Stage rows carry bars; the rows between them carry the conversion step.
const W = 760, H = 432, labelW = 88, barX = 96, barMax = 440, barH = 30, rowGap = 112, y0 = 22;
const sx = linear([0, Math.max(...stages.flatMap(s => [s.now, s.prev]))], [0, barMax]);
const rowY = i => y0 + i * rowGap;
const ja0 = v => fmt(v, { locale: 'ja', digits: 0 });
const stageRows = stages.map((s, i) => {
  const yy = rowY(i), wNow = Math.max(2, sx(s.now)), xPrev = barX + sx(s.prev), end = Math.max(barX + wNow, xPrev);
  const valueW = measureText(ja0(s.now), 22, { weight: 700 });
  return g({},
    textLines([s.label], { x: 0, y: yy + barH / 2, size: 20, valign: 'middle', weight: 700, fill: 'var(--ink)' }),
    el('rect', { x: barX, y: yy, width: wNow, height: barH, fill: 'var(--ink)' }),
    el('line', { x1: xPrev, x2: xPrev, y1: yy - 6, y2: yy + barH + 6, stroke: 'var(--context)', 'stroke-width': 2 }),
    textLines([ja0(s.now)], { x: end + 14, y: yy + barH / 2, size: 22, valign: 'middle', weight: 700, fill: 'var(--ink)' }),
    textLines([`前期 ${ja0(s.prev)}`], { x: end + 14 + valueW + 14, y: yy + barH / 2, size: 16, valign: 'middle', fill: 'var(--muted)' }));
}).join('');
const stepRows = steps.map((st, i) => {
  const yy = rowY(i) + barH + (rowGap - barH) / 2, hot = i === wi, c = hot ? 'var(--navy)' : 'var(--muted)';
  const t1 = `${st.rate} ${pct1(st.cNow)}%`, t1w = measureText(t1, 20, { weight: hot ? 700 : 400 });
  const t2 = `前期 ${pct1(st.cPrev)}%`, t2w = measureText(t2, 16);
  return g({},
    el('path', { d: `M${barX + 6} ${rowY(i) + barH + 8}V${rowY(i + 1) - 8}M${barX + 1} ${rowY(i + 1) - 14}L${barX + 6} ${rowY(i + 1) - 8}L${barX + 11} ${rowY(i + 1) - 14}`, fill: 'none', stroke: hot ? 'var(--navy)' : 'var(--context)', 'stroke-width': hot ? 2 : 1.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }),
    textLines([t1], { x: barX + 24, y: yy, size: 20, valign: 'middle', weight: hot ? 700 : null, fill: hot ? 'var(--navy)' : 'var(--ink)' }),
    textLines([t2], { x: barX + 24 + t1w + 14, y: yy, size: 16, valign: 'middle', fill: 'var(--muted)' }),
    textLines([`${fmt(st.d, { digits: 1, sign: true })}pt`], { x: barX + 24 + t1w + 14 + t2w + 14, y: yy, size: hot ? 20 : 16, valign: 'middle', weight: hot ? 700 : null, fill: c }));
}).join('');
const figure = svgRoot({
  id: `${ID}-fig`, width: W, height: H,
  title: `商談ファネルの件数と段階間の転換率（${periods.now}と${periods.prev}）`,
  desc: `${stages.map(s => `${s.label}${ja0(s.now)}件（前期${ja0(s.prev)}件）`).join('、')}。${steps.map(st => `${st.rate}${pct1(st.cNow)}%（前期${pct1(st.cPrev)}%）`).join('、')}。最も下がったのは${worst.rate}。`,
}, stageRows, stepRows,
textLines([`棒：${periods.now}　縦線：${periods.prev}`], { x: W, y: H - 4, size: 15, anchor: 'end', fill: 'var(--muted)' }));

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Sales funnel: where conversion fell',
  notes: `Purpose: リードから受注までの各段階を前期と比べ、どの段階で取りこぼしたかを1か所に絞って示す。右欄で「その段階が前期並みならどうだったか」を金額にする。\nModify: stages（段階名・転換率の呼び名・今期と前期の件数）と newArr（今期実績と計画、2ページと同じ値）を書き換える。最も悪化した段階、その強調、右欄の受注件数と新規ARRの試算、見出しの数値は自動。cause と右欄の要因の文は実際の調査結果に合わせる。\nInvariant: 棒の長さは件数に比例し、全段階で同じ目盛り（受注の棒が短いのは実際に少ないから）。強調は1段階だけ。試算は「その段階だけ前期の転換率、他は今期の転換率、平均受注額は今期」という前提を右欄に書く。\nStatic: Already static.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-qbr q-funnel',
  content: `<h1 class="q-head" data-region="title">リードは前期より<span class="nw">${growth(leadGrowth).replace('+', '')}%</span>増えたが、<span class="nw">${worst.rate}が${pct1(worst.cPrev)}%から${pct1(worst.cNow)}%に下がり、</span>受注は<span class="nw">${-winChange}件</span>減った</h1>
<figure class="g" style="--c:1;--s:8;top:200px;margin:0" data-region="primary">${figure}</figure>
<div class="q-rail g" style="--c:9;--s:4;top:200px" data-region="support">
  <div>
    <p class="q-label">${worst.rate}が前期並みだった場合の新規ARR</p>
    <p class="q-fig">${ja0(altArr)}<span class="unit">百万円</span></p>
    <p class="q-body">受注は<span class="nw">${extraDeals}件</span>多く、計画の<span class="nw">${newArr.plan}百万円</span>を上回っていた計算になる。</p>
  </div>
  <div>
    <p class="q-body">インサイドセールスの欠員${cause.staffShort}名で、初回接触までの日数が平均<span class="nw">${cause.daysPrev}日</span>から<span class="nw">${cause.daysNow}日</span>に延びた。</p>
  </div>
</div>
<p class="q-foot" data-region="source"><span>${source}　試算は他の転換率と平均受注額を今期の値に固定</span><span class="num">${running}　${page}</span></p>`,
};
