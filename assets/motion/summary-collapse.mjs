// Motion study · Collapse into a summary — sixteen comments, grouped by theme, collapse into
// one summary line per theme. Each comment keeps its marker: the marker moves into its theme's
// tally while the text steps back, so the summary still shows how much evidence sits behind it.
import { svgRoot, el, g, textLines, theme as makeTheme } from '../runtime/figure.mjs';

// 従業員アンケートの自由記述（架空のデータ）。テーマは回答の分類結果。
const comments = [
  { theme: '業務量', text: '残業が月40時間を超える' }, { theme: '業務量', text: '一人あたりの担当が多い' },
  { theme: '業務量', text: '繁忙期に休みが取れない' }, { theme: '業務量', text: '会議が多く作業が進まない' },
  { theme: '業務量', text: '欠員の補充が遅い' }, { theme: '業務量', text: '締め切りが重なりすぎる' },
  { theme: '評価制度', text: '評価基準が部署で違う' }, { theme: '評価制度', text: '面談が年1回しかない' },
  { theme: '評価制度', text: '在籍年数で評価が決まる' }, { theme: '評価制度', text: 'フィードバックが遅い' },
  { theme: '在宅勤務', text: '週2日の在宅を続けたい' }, { theme: '在宅勤務', text: '在宅時の連絡ルールが曖昧' },
  { theme: '在宅勤務', text: '通信費の補助がほしい' },
  { theme: '研修', text: '新任管理職の研修がない' }, { theme: '研修', text: '社外研修の申請が通りにくい' },
  { theme: '研修', text: 'eラーニングが業務と合わない' },
];
const themes = [...new Set(comments.map(c => c.theme))];
const counts = Object.fromEntries(themes.map(th => [th, comments.filter(c => c.theme === th).length]));
const ranked = [...themes].sort((a, b) => counts[b] - counts[a]);   // stable: ties keep form order
const top = ranked[0];
const pct = th => Math.round((counts[th] / comments.length) * 100);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'motion-summary-collapse-fig';
  const colW = (W - 3 * 32) / 4, colX = i => i * (colW + 32), rowH = 44, listTop = 74, sq = 12;
  const rowY = k => 52 + k * 106, tallyX = 236, pitch = 32, grow = 2, quoteX = tallyX + Math.max(...themes.map(th => counts[th])) * pitch + 28;
  // Theme labels travel from their column head to their summary row.
  const heads = themes.map((th, i) => {
    const k = ranked.indexOf(th), hot = th === top;
    return g({ 'data-states': { 0: { translate: '0px 0px' }, 1: { translate: `${-colX(i)}px ${rowY(k) - 24}px` } }, 'data-duration': 900, 'data-easing': 'smooth' },
      textLines([th], { x: colX(i), y: 0, size: 22, weight: 700, valign: 'top', fill: hot ? t.c('accent') : t.c('ink') }),
      textLines([`${counts[th]}件（${pct(th)}%）`], { x: colX(i), y: 34, size: 16, valign: 'top', fill: t.c('muted') }));
  });
  // Each comment: a marker that grows into one unit of its theme's tally, and a text that steps back.
  const items = comments.map(c => {
    const i = themes.indexOf(c.theme), j = comments.filter(d => d.theme === c.theme).indexOf(c), k = ranked.indexOf(c.theme);
    const x0 = colX(i), y0 = listTop + j * rowH, hot = c.theme === top;
    const bx = x0, by = y0 + rowH / 2 - sq / 2, x1 = tallyX + j * pitch, y1 = rowY(k) - (sq * grow) / 2;
    const move = extra => ({ 'data-states': { 0: { translate: '0px 0px', ...extra[0] }, 1: { translate: `${x1 - bx}px ${y1 - by}px`, ...extra[1] } }, 'data-duration': 900, 'data-easing': 'smooth' });
    return g({},
      g({ ...move([{ scale: '1 1' }, { scale: `${grow} ${grow}` }]), style: 'transform-origin:0 0' },
        el('rect', { x: bx, y: by, width: sq, height: sq, rx: 2, fill: hot ? t.c('accent') : t.c('muted') })),
      g(move([{ opacity: 1 }, { opacity: 0 }]),
        textLines([c.text], { x: x0 + 22, y: y0 + rowH / 2, size: 16, valign: 'middle', fill: t.c('ink') }),
        el('line', { x1: x0, x2: x0 + colW, y1: y0 + rowH, y2: y0 + rowH, stroke: t.c('rule') })));
  });
  // Summary lines: one representative comment per theme, named as one of n.
  const summaries = ranked.map((th, k) => {
    const first = comments.find(c => c.theme === th);
    return g({ 'data-states': { 0: { opacity: 0 }, 1: { opacity: 1 } }, 'data-duration': 600 },
      textLines([`「${first.text}」ほか${counts[th] - 1}件`], { x: quoteX, y: rowY(k), size: 18, valign: 'middle', fill: t.c('ink') }),
      k < ranked.length - 1 ? el('line', { x1: 0, x2: W, y1: rowY(k) + 53, y2: rowY(k) + 53, stroke: t.c('rule') }) : '');
  });
  return svgRoot({ id, width: W, height: H, theme: t,
    title: '自由記述16件をテーマ別の要約にまとめる',
    desc: `自由記述${comments.length}件を${themes.length}つのテーマにまとめる。${ranked.map(th => `${th} ${counts[th]}件`).join('、')}。各コメントの印は要約の件数として残る。` },
  heads, items, summaries);
}

export default {
  study: true,
  id: 'motion-summary-collapse',
  language: 'ja',
  title: 'Collapse into a summary',
  className: 'st cs-hr-people',
  notes: 'Purpose: Summarize groups without hiding the existence of the evidence: every comment survives the collapse as one countable mark.\nModify: Replace `comments` (text and theme). Themes, counts, shares, the ranking, the tally positions and the headline are computed.\nInvariant: Each comment\'s marker is one element that moves into its theme\'s tally; theme labels move with their group; the representative comment is labelled as one of n.\nStatic: The final build shows the ranked summary with every comment still counted. Export build 0 as a page when the comments themselves must be read.',
  sources: [{ type: 'original-example', file: 'assets/motion/summary-collapse.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">自由記述${comments.length}件のうち、最も多い${counts[top]}件が<em>${top}</em>に関するもの</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>架空のデータ · 2026年度 従業員アンケートの自由記述</span><span>モーション · 個別の声から要約へ（1ビルド）</span></p>`,
};
