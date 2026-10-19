// Motion study · Reflow a group — the same 16 rows move from an arrangement by area to an
// arrangement by waiting-list band. Both layouts are computed from one list; each row is
// one element translated between its two slots, so membership and counts never change.
import { svgRoot, el, g, textLines, theme as makeTheme } from '../runtime/figure.mjs';

// 2026年4月1日時点の待機児童数（架空のデータ）
const nurseries = [
  { name: '桜台', area: '北部', wait: 0 }, { name: '北町', area: '北部', wait: 2 }, { name: '緑が丘', area: '北部', wait: 21 },
  { name: '若葉', area: '北部', wait: 0 }, { name: '旭', area: '北部', wait: 1 },
  { name: '本町', area: '中部', wait: 3 }, { name: '駅前', area: '中部', wait: 18 }, { name: '中央', area: '中部', wait: 1 },
  { name: '栄町', area: '中部', wait: 0 }, { name: '泉', area: '中部', wait: 4 },
  { name: '港南', area: '南部', wait: 14 }, { name: '汐見', area: '南部', wait: 0 }, { name: '南台', area: '南部', wait: 2 },
  { name: '川端', area: '南部', wait: 0 }, { name: '浜田', area: '南部', wait: 0 }, { name: '松原', area: '南部', wait: 0 },
];
const areas = ['北部', '中部', '南部'];
const bands = [
  { label: '待機児童 0人', test: w => w === 0 }, { label: '1〜9人', test: w => w > 0 && w < 10 }, { label: '10人以上', test: w => w >= 10 },
];
const total = nurseries.reduce((s, n) => s + n.wait, 0);
const crowded = nurseries.filter(n => n.wait >= 10);
const crowdedSum = crowded.reduce((s, n) => s + n.wait, 0);
const share = Math.round((crowdedSum / total) * 100);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, gap = 44, colW = (W - gap * 2) / 3, rowH = 46, top = 76;
  const maxWait = Math.max(...nurseries.map(n => n.wait)), barX = 112, barMax = colW - barX - 52;
  // Layout 1: by area, in listing order. Layout 2: by band, longest waiting list first.
  const byArea = areas.map(a => nurseries.filter(n => n.area === a));
  const byBand = bands.map(b => nurseries.filter(n => b.test(n.wait)).sort((p, q) => q.wait - p.wait));
  const slot = (cols, n) => { const c = cols.findIndex(col => col.includes(n)); return { x: c * (colW + gap), y: top + cols[c].indexOf(n) * rowH }; };
  const sumOf = list => list.reduce((s, n) => s + n.wait, 0);
  const header = (label, sub, i, first, hot) => g({ 'data-states': { 0: { opacity: first ? 1 : 0 }, 1: { opacity: first ? 0 : 1 } }, 'data-duration': 500 },
    textLines([label], { x: i * (colW + gap), y: 0, size: 22, weight: 700, valign: 'top', fill: hot ? t.c('accent') : t.c('ink') }),
    textLines([sub], { x: i * (colW + gap), y: 34, size: 16, valign: 'top', fill: t.c('muted') }));
  // One row per nursery: name, a bar for its waiting list, the count. The row moves as one item.
  const rows = nurseries.map(n => {
    const a = slot(byArea, n), b = slot(byBand, n), hot = n.wait >= 10, w = (n.wait / maxWait) * barMax;
    return g({ 'data-states': { 0: { translate: '0px 0px' }, 1: { translate: `${b.x - a.x}px ${b.y - a.y}px` } }, 'data-duration': 900, 'data-easing': 'smooth' },
      el('line', { x1: a.x, x2: a.x + colW, y1: a.y + rowH, y2: a.y + rowH, stroke: t.c('rule') }),
      textLines([n.name], { x: a.x, y: a.y + rowH / 2, size: 18, weight: 600, valign: 'middle', fill: t.c('ink') }),
      n.wait ? el('rect', { x: a.x + barX, y: a.y + rowH / 2 - 8, width: w, height: 16, rx: 2, fill: hot ? t.c('accent') : t.c('context') }) : '',
      textLines([`${n.wait}人`], { x: a.x + barX + w + (n.wait ? 8 : 0), y: a.y + rowH / 2, size: 17, weight: hot ? 700 : 500, valign: 'middle', fill: hot ? t.c('accent') : t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  });
  return svgRoot({ id: 'motion-grid-reflow-fig', width: W, height: H, theme: t,
    title: '保育園16園の待機児童数：地区別から人数の区分別へ並べ替え',
    desc: `同じ16園を地区別（北部・中部・南部）から待機児童数の区分別に並べ替える。合計${total}人のうち${crowdedSum}人（${share}%）が10人以上の${crowded.length}園（${crowded.map(n => n.name).join('、')}）に集中している。` },
  areas.map((a, i) => header(a, `${byArea[i].length}園、計${sumOf(byArea[i])}人`, i, true, false)),
  bands.map((b, i) => header(b.label, `${byBand[i].length}園、計${sumOf(byBand[i])}人${i === 2 ? `（全体の${share}%）` : ''}`, i, false, i === 2)),
  rows,
  textLines([`どちらの並びも${nurseries.length}園・${total}人`], { x: W, y: H - 4, size: 16, anchor: 'end', fill: t.c('muted') }));
}

export default {
  study: true,
  id: 'motion-grid-reflow',
  language: 'ja',
  title: 'Reflow a group',
  className: 'st cs-wa-ai',
  notes: 'Purpose: Change arrangement without silently changing membership: the same rows move from one grouping to another.\nModify: Replace `nurseries` and the `bands` tests; both layouts, the group counts, the shares and the headline recompute. Change the second grouping to any key (status, size, owner).\nInvariant: Each row is one element that moves (never redrawn); name, bar and count travel together; group counts and the overall total are stated in both arrangements.\nStatic: The final build shows the grouping the headline is about; the area grouping can be exported as a separate page if both are needed.',
  sources: [{ type: 'original-example', file: 'assets/motion/grid-reflow.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">待機児童${total}人のうち${share}%が、<br><em>10人以上</em>待つ${crowded.length}つの園に集中している</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 4月1日時点の待機児童数（16園）</span><span>モーション · 同じ行の並べ替え（1ビルド）</span></p>`,
};
