// Template: 四半期業績レビュー（QBR）· 契約コホート別の継続率. Synthetic example content; replace data and copy.
// Rows = quarter of contract, columns = quarters since contract. Colour steps, the comparison column,
// the before/after averages and the headline are computed from `cohorts`, `changeFrom` and `compareAt`.
import { svgRoot, el, g, textLines, fmt } from '../../runtime/figure.mjs';

const ID = 'tpl-qbr-cohort-heatmap';
// 継続率（契約社数ベース、%）. Each row lists quarters 1, 2, … since contract, up to the end of 2026年7〜9月.
const cohorts = [
  { label: '2024年7〜9月', values: [95.2, 92.6, 90.9, 89.5, 88.4, 87.6, 86.9, 86.3] },
  { label: '2024年10〜12月', values: [95.6, 93.1, 91.2, 89.9, 88.9, 88.0, 87.2] },
  { label: '2025年1〜3月', values: [95.0, 92.8, 91.0, 89.6, 88.5, 87.8] },
  { label: '2025年4〜6月', values: [95.8, 93.4, 91.6, 90.3, 89.3] },
  { label: '2025年7〜9月', values: [95.4, 93.1, 91.4, 90.1] },
  { label: '2025年10〜12月', values: [98.1, 96.7, 95.6] },
  { label: '2026年1〜3月', values: [97.8, 96.3] },
  { label: '2026年4〜6月', values: [98.3] },
];
const changeFrom = '2025年10〜12月';   // first cohort after the onboarding change
const changeMonth = '2025年10月';     // when the change took effect
const change = `${changeMonth}から導入支援を刷新`;
const compareAt = 2;                  // compare cohorts at this many quarters after contract
const steps = { from: 86, width: 2 }; // colour steps: 86–88, 88–90 … 98–100 (7 steps, --ss-seq-1…7)
const source = '出所：カスタマーサクセス部（2026年9月末時点）';
const running = '2026年度 第2四半期 業績レビュー';
const page = 5;

// ---- derived
const ci = cohorts.findIndex(c => c.label === changeFrom);
const avg = list => list.reduce((s, v) => s + v, 0) / list.length;
const at = (rows) => rows.map(c => c.values[compareAt - 1]).filter(v => v != null);
const before = at(cohorts.slice(0, ci)), after = at(cohorts.slice(ci));
const gain = avg(after) - avg(before);
const pending = cohorts.slice(ci).filter(c => c.values.length < compareAt).map(c => c.label);
const d1 = v => fmt(v, { digits: 1 });

// ---- figure: 8 columns × 432 px
const W = 760, H = 432, labelW = 140, headH = 64, gap = 4, nCols = Math.max(...cohorts.map(c => c.values.length));
const cw = (W - labelW - gap * (nCols - 1)) / nCols, ch = 38;
const cx = j => labelW + j * (cw + gap), ry = i => headH + i * (ch + gap);
const step = v => Math.max(1, Math.min(7, Math.floor((v - steps.from) / steps.width) + 1));
const header = [
  textLines(['契約時期'], { x: 0, y: headH - 14, size: 16, fill: 'var(--muted)' }),
  textLines(['契約からの経過四半期'], { x: labelW, y: 14, size: 16, valign: 'top', fill: 'var(--muted)' }),
  ...Array.from({ length: nCols }, (_, j) => textLines([String(j + 1)], { x: cx(j) + cw / 2, y: headH - 14, size: 16, anchor: 'middle', weight: j === compareAt - 1 ? 700 : null, fill: j === compareAt - 1 ? 'var(--ink)' : 'var(--muted)' })),
];
const rows = cohorts.map((c, i) => g({},
  textLines([c.label], { x: 0, y: ry(i) + ch / 2, size: 16, valign: 'middle', fill: 'var(--ink)', weight: i >= ci ? 700 : null }),
  ...c.values.map((v, j) => {
    const k = step(v);
    return g({},
      el('rect', { x: cx(j), y: ry(i), width: cw, height: ch, fill: `var(--ss-seq-${k})` }),
      textLines([d1(v)], { x: cx(j) + cw / 2, y: ry(i) + ch / 2, size: 16, anchor: 'middle', valign: 'middle', weight: j === compareAt - 1 ? 700 : null, fill: k >= 5 ? '#ffffff' : 'var(--ink)' }));
  })));
const colTop = ry(0) - 6, colBottom = ry(cohorts.filter(c => c.values.length >= compareAt).length - 1) + ch + 6;
const compareFrame = el('rect', { x: cx(compareAt - 1) - 4, y: colTop, width: cw + 8, height: colBottom - colTop, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.5 });
const sepY = ry(ci) - gap / 2;
const separator = g({},
  el('line', { x1: 0, x2: W, y1: sepY, y2: sepY, stroke: 'var(--navy)', 'stroke-width': 2 }),
  textLines([change], { x: W, y: sepY - 10, size: 16, anchor: 'end', weight: 700, fill: 'var(--navy)' }));
const keyX = W - 7 * 30 - 52;
const key = g({},
  ...Array.from({ length: 7 }, (_, k) => el('rect', { x: keyX + k * 30, y: H - 18, width: 28, height: 12, fill: `var(--ss-seq-${k + 1})` })),
  textLines([`${steps.from}%`], { x: keyX - 8, y: H - 12, size: 15, anchor: 'end', valign: 'middle', fill: 'var(--muted)' }),
  textLines([`${steps.from + 7 * steps.width}%`], { x: keyX + 7 * 30 + 6, y: H - 12, size: 15, valign: 'middle', fill: 'var(--muted)' }));
const figure = svgRoot({
  id: `${ID}-fig`, width: W, height: H,
  title: '契約時期別・経過四半期別の継続率（%）',
  desc: `${cohorts[0].label}から${cohorts.at(-1).label}までの${cohorts.length}コホート。経過${compareAt}四半期の継続率は、刷新前の平均${d1(avg(before))}%に対し、刷新後は${d1(avg(after))}%。`,
}, header, rows, compareFrame, separator, key);

export default {
  study: true,
  id: ID,
  language: 'ja',
  title: 'Customer retention by contract cohort',
  notes: `Purpose: 契約時期ごとの継続率を経過期間で揃えて並べ、施策の前と後のコホートを同じ経過期間で比べる。\nModify: cohorts（契約時期と、経過1四半期目からの継続率）を実データに置き換える。changeFrom は施策後の最初のコホート、compareAt は比べる経過四半期。色の段階、比較列の枠、平均、見出しの差は自動。コホートは8つ程度まで（それ以上は半期単位にまとめる）。\nInvariant: 色は1色相の明度だけで、数値も全セルに書く（16px以上）。比較は同じ経過期間どうしで行い、まだ到達していないコホートは平均に含めない。\nStatic: Already static.`,
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-qbr q-cohort',
  content: `<h1 class="q-head" data-region="title">導入支援を刷新した<span class="nw">${changeMonth}以降の契約は、</span><span class="nw">${compareAt}四半期後の継続率が${d1(gain)}ポイント高い</span></h1>
<figure class="g" style="--c:1;--s:8;top:200px;margin:0" data-region="primary">${figure}</figure>
<div class="q-rail g" style="--c:9;--s:4;top:200px" data-region="support">
  <div>
    <p class="q-label">契約から${compareAt}四半期後の継続率の差</p>
    <p class="q-fig accent">${fmt(gain, { digits: 1, sign: true })}<span class="unit">ポイント</span></p>
    <p class="q-body">刷新前の${before.length}コホートは平均<span class="nw">${d1(avg(before))}%</span>、刷新後の${after.length}コホートは<span class="nw">${d1(avg(after))}%</span>。</p>
  </div>
  <div>
    <p class="q-body">${pending.join('・')}の契約は、まだ${compareAt}四半期を経過していないため比べていない。</p>
  </div>
</div>
<p class="q-foot" data-region="source"><span>${source}　継続率は契約社数ベース</span><span class="num">${running}　${page}</span></p>`,
};
