// Template: 戦略提案（コンサル型）· 表紙. Synthetic example content; replace data and copy.
// The square field is the pack motif: many candidate moves (outlines), a few prioritised (filled), one recommended (ochre).
const P = 'tpl-strategy-cover';
const from = 2.0, to = 6.1, year = 2029;
const cols = 5, rows = 7, size = 64, gap = 14, ox = 58, oy = 64;
const chosen = new Set(['1-1', '3-1', '1-2', '2-3', '3-3', '2-4', '4-5']);   // shortlisted moves
const rec = '3-4';                                         // the recommended combination
const cells = [];
for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
  const k = `${c}-${r}`, x = ox + c * (size + gap), y = oy + r * (size + gap);
  if (k === rec) cells.push(`<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="#c98a12"/>`);
  else if (chosen.has(k)) cells.push(`<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="#3d8878"/>`);
  else cells.push(`<rect x="${x + 0.5}" y="${y + 0.5}" width="${size - 1}" height="${size - 1}" fill="none" stroke="#3d8878" stroke-width="1"/>`);
}
const cxr = ox + 3 * (size + gap) + size / 2, cyr = oy + 4 * (size + gap) + size / 2;

export default {
  study: true,
  id: 'tpl-strategy-cover',
  title: 'EC物流事業の収益改善に向けた戦略提案 — 表紙',
  language: 'ja',
  notes: 'Purpose: 提案の対象・問い・到達目標を表紙で明示する。\nModify: 宛先、題名、目標値（from・to・year）、日付と提案者を差し替える。右の正方形の配置は chosen と rec で変えられる。\nInvariant: 副題は「何を・いつまでに・どこからどこへ」を1文で言う。表紙に結論を詰め込みすぎない。\nStatic: Already static.',
  sources: [],
  exportPolicy: 'final',
  className: 'tpl-strategy s-cover',
  content: `<div class="s-wrap">
  <p class="s-cv-client" data-region="support">東雲ロジスティクス株式会社 御中</p>
  <p class="s-cv-label">最終報告</p>
  <h1 class="s-cv-h" data-region="title">EC物流事業の<br>収益改善に向けた戦略提案</h1>
  <p class="s-cv-sub" data-region="primary">営業利益率を${year}年度までに<b>${from.toFixed(1)}%</b>から<b>${to.toFixed(1)}%</b>へ引き上げる道筋と、最初の18か月で着手すべきこと</p>
  <div class="s-cv-meta" data-region="support">
    <p>2026年9月30日<span>経営会議 提出資料</span></p>
    <p>北辰コンサルティング<span>物流・サプライチェーン部門</span></p>
    <p>社外秘<span>数値は例示</span></p>
  </div>
  <div class="s-cv-art">
    <svg viewBox="0 0 520 720" role="img" aria-labelledby="${P}-t ${P}-d">
      <title id="${P}-t">選択と集中を表す正方形のフィールド</title>
      <desc id="${P}-d">輪郭だけの正方形が検討した打ち手、塗りつぶしが詳しく評価した打ち手、黄土色の一つが推奨案を表す。</desc>
      <defs><linearGradient id="${P}-sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a4a3f" stop-opacity="0"/><stop offset="1" stop-color="#0a4a3f" stop-opacity=".55"/></linearGradient></defs>
      ${cells.join('')}
      <circle cx="${cxr}" cy="${cyr}" r="${size * 0.95}" fill="none" stroke="#f3d9a4" stroke-width="1.2" stroke-dasharray="3 5"/>
      <rect x="0" y="480" width="520" height="240" fill="url(#${P}-sh)"/>
    </svg>
    <p class="s-cv-cap">検討した打ち手 ${cols * rows} ・ 評価 ${chosen.size + 1} ・ 推奨 1</p>
  </div>
</div>`
};
