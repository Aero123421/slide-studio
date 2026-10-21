// Composition study · Atmospheric color — a chapter page set in the color it is about.
// The field is the indigo the chapter names; the ruler along the foot is the evidence:
// each band is the shade cotton reaches after a number of dips, its width proportional
// to the dips it spans. Band geometry, labels and the lead sentence all come from `shades`.
import { contrastRatio } from '../runtime/figure.mjs';

// Fictional workshop record: cotton, fermented indigo vat. `dips` = dips needed to reach the shade.
// `hex` values are literal dye colors (this is a deliberately literal illustration).
const shades = [
  { name: '甕覗', kana: 'かめのぞき', dips: 1, hex: '#c8dfe3' },
  { name: '水浅葱', kana: 'みずあさぎ', dips: 3, hex: '#9ec5cc' },
  { name: '浅葱', kana: 'あさぎ', dips: 6, hex: '#5f9fb1' },
  { name: '縹', kana: 'はなだ', dips: 10, hex: '#367096' },
  { name: '藍', kana: 'あい', dips: 15, hex: '#264c78', page: true }, // = the page field (wa-ai accent)
  { name: '紺', kana: 'こん', dips: 22, hex: '#1c3456' },
  { name: '褐色', kana: 'かちいろ', dips: 30, hex: '#131d30' },
];
// Japanese line breaking: join phrases with <wbr> and set `word-break: keep-all`, so lines break
// between phrases (布を|甕に|沈めて) and never inside a word or between a number and its unit.
const seg = new Intl.Segmenter('ja', { granularity: 'word' });
const KANA = /^[ぁ-ゟー]+$/u, CLOSE = /^[、。，．）」』】〕・：；？！%％]/u, OPEN = /[（「『【〔]$/u;
const KANJI = /^[㐀-鿿々ァ-ヿ]+$/u, CJK = /^[ぁ-ヿ㐀-鿿々]/u, HAN = /^[㐀-鿿々]/u;
function ja(text) {
  const out = [];
  for (const { segment } of seg.segment(text)) {
    const prev = out.at(-1);
    if (prev === undefined) { out.push(segment); continue; }
    const glue = (KANA.test(segment) && (!/[、。]$/.test(prev) || segment.length === 1)) // particles, okurigana
      || CLOSE.test(segment) || OPEN.test(prev) || /^\s+$/.test(segment)
      || (KANJI.test(prev.replace(/^[（「『【〔]/u, '')) && HAN.test(segment))   // compound nouns
      || (/[0-9][0-9.,]*%?$/.test(prev) && (CJK.test(segment) || /^[%％]/.test(segment))) // 10|回
      || (/[0-9][㐀-鿿々ァ-ヿ]+$/u.test(prev) && HAN.test(segment))           // 5.6億|円
      || segment === '＝' || /＝$/.test(prev) || (/[0-9][年月]$/.test(prev) && /^[0-9]/.test(segment));
    if (glue) out[out.length - 1] += segment; else out.push(segment);
  }
  return out.join('<wbr>');
}

const end = 36;                                  // the last band runs on past 30 dips to the page edge
const X0 = 64, W = 1280;                         // the ruler starts on the left margin and bleeds off the right edge
const x = d => X0 + ((d - shades[0].dips) / (end - shades[0].dips)) * (W - X0);
const mid = shades.find(s => s.name === '縹');
const last = shades.at(-1);
const paperHex = '#f5f7f8', inkHex = '#182a3e';  // wa-ai paper / ink, used only to choose label color
const onBand = hex => (contrastRatio(hex, paperHex) >= contrastRatio(hex, inkHex) ? 'var(--ss-paper)' : 'var(--ss-ink)');

const bands = shades.map((s, i) => {
  const x0 = x(s.dips), x1 = i < shades.length - 1 ? x(shades[i + 1].dips) : W;
  const c = onBand(s.hex);
  return `<div class="ai-band" style="left:${x0.toFixed(1)}px;width:${(x1 - x0).toFixed(1)}px;background:${s.page ? 'var(--ss-accent)' : s.hex};color:${c}">
    <span class="ai-name" lang="ja">${s.name}</span><span class="ai-kana">${s.kana}</span>${s.page ? '<span class="ai-here">この頁の地色</span>' : ''}
  </div>`;
}).join('\n');
const ticks = shades.map(s => `<span class="ai-tick" style="left:${x(s.dips).toFixed(1)}px">${s.dips}回</span>`).join('');

export default {
  study: true,
  id: 'composition-atmospheric-color',
  language: 'ja',
  title: 'Atmospheric color: a chapter page set in the color it describes',
  className: 'st cs-wa-ai cmp-indigo',
  notes: 'Purpose: Open a chapter whose subject is a color (a dye, a material, a sky, a brand pigment) by setting the page in that color, so the atmosphere carries information instead of mood alone.\nModify: Replace `shades` with your own sequence (name, reading, the quantity that produces it, literal color). The field is the one shade the chapter is about (`page: true`), and its band in the ruler runs into the field. Keep headline and lead on the flat field; rewrite the lead around the numbers in the data.\nInvariant: Text sits only on uniform color: the flat field, or a single band whose label color is chosen by measured contrast against that band — never on the average of a changing background. Band widths are proportional to the quantity on the axis; no gradient wash, glow or blurred shapes. The literal dye colors are data, the only hard-coded colors in the study.\nStatic: Already static.',
  sources: [{ type: 'original-example', file: 'assets/compositions/atmospheric-color.mjs' }],
  exportPolicy: 'final',
  content: `<p class="ai-chapter" data-region="support">藍染め講座　第2章　色を重ねる</p>
<p class="ai-note" data-region="source">架空の工房記録 · 木綿、発酵建ての藍甕</p>
<h1 class="ai-head" data-region="title">藍の濃さは、<br>甕に浸した回数で決まる</h1>
<p class="ai-lead" data-region="support">${ja(`布を甕に沈めて引き上げると、空気に触れた藍が緑から青へ変わる。これを重ねるほど色は深くなり、${shades[0].name}から${mid.name}までは${mid.dips}回、そこから${last.name}まではさらに${last.dips - mid.dips}回かかる。`)}</p>
<div class="ai-axis" data-region="primary" aria-hidden="true">${ticks}</div>
<div role="img" aria-label="浸した回数と色の対応：${shades.map(s => `${s.name}${s.dips}回`).join('、')}以上">
${bands}
</div>`,
};
