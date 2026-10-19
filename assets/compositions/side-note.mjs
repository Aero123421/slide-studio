// Composition study · Side notes — the argument in the main column, the qualifications in the margin.
// A horizontal profit bridge carries the claim; each note sits in the margin at the height of the
// row it qualifies, keyed by ※n. The bridge, the headline percentages and the note positions are
// computed from `bridge`; a changed figure moves its note with it.
import { svgRoot, el, textLines, linear, fmt, measureText, theme as makeTheme } from '../runtime/figure.mjs';

// Japanese line breaking: phrases joined with <wbr>, set with `word-break: keep-all` (works without auto-phrase).
const seg = new Intl.Segmenter('ja', { granularity: 'word' });
const KANA = /^[ぁ-ゟー]+$/u, CLOSE = /^[、。，．）」』】〕・：；？！%％]/u, OPEN = /[（「『【〔]$/u;
const KANJI = /^[㐀-鿿々ァ-ヿ]+$/u, CJK = /^[ぁ-ヿ㐀-鿿々]/u, HAN = /^[㐀-鿿々]/u;
function ja(text) {
  const out = [];
  for (const { segment } of seg.segment(text)) {
    const prev = out.at(-1);
    if (prev === undefined) { out.push(segment); continue; }
    const glue = (KANA.test(segment) && (!/[、。]$/.test(prev) || segment.length === 1))
      || CLOSE.test(segment) || OPEN.test(prev) || /^\s+$/.test(segment)
      || (KANJI.test(prev.replace(/^[（「『【〔]/u, '')) && HAN.test(segment))
      || (/[0-9][0-9.,]*%?$/.test(prev) && (CJK.test(segment) || /^[%％]/.test(segment)))
      || (/[0-9][㐀-鿿々ァ-ヿ]+$/u.test(prev) && HAN.test(segment))
      || segment === '＝' || /＝$/.test(prev) || (/[0-9][年月]$/.test(prev) && /^[0-9]/.test(segment));
    if (glue) out[out.length - 1] += segment; else out.push(segment);
  }
  return out.join('<wbr>');
}

const bridge = [ // 営業利益の増減要因、億円（架空の白嶺工業、2026年度上期と前年同期）
  { label: '前年同期', value: 48.2, total: true, oneOff: 5.6 },   // oneOff: last year's land-sale gain inside the total
  { label: '販売数量', value: 6.1, note: 1 },
  { label: '価格改定', value: 3.4 },
  { label: '原材料費', value: -4.0 },
  { label: '為替', value: 1.9, note: 2 },
  { label: '固定費', value: -2.7, note: 3 },
  { label: '一時要因の反動', value: -5.6, note: 4 },
  { label: '当期', total: true },
];
const notes = {
  1: '北米向けの産業用ポンプが伸び、販売台数は前年同期比7%増えた。',
  2: '1ドル＝149円で換算（前年同期143円）。',
  3: '新工場の減価償却費1.8億円を含む。',
  4: '前年同期は旧本社用地の売却益5.6億円を含む。当期に同様の益はない。',
};
let run = 0;
const rows = bridge.map(r => {
  if (r.total) { const v = r.value ?? run; run = v; return { ...r, from: 0, to: v }; }
  const from = run; run += r.value; return { ...r, from, to: run };
});
const prev = rows[0].to, now = rows.at(-1).to, oneOff = rows[0].oneOff;
const reported = (now / prev - 1) * 100;
const underlying = (now / (prev - oneOff) - 1) * 100;
const p1 = v => fmt(Math.abs(v), { digits: 1 });

// Geometry shared by the chart and the margin notes (page coordinates of the figure).
const fig = { left: 64, top: 184, W: 760, H: 430, rowTop: 36, pitch: 48 };
const rowY = i => fig.rowTop + i * fig.pitch + fig.pitch / 2;

export function figure(themeArg = 'css') {
  const t = makeTheme(themeArg), { W, H } = fig;
  const x = linear([0, 60], [178, W - 52]);
  const bh = 24;
  const parts = [];
  [0, 10, 20, 30, 40, 50, 60].forEach(v => parts.push(
    el('line', { x1: x(v), x2: x(v), y1: fig.rowTop - 6, y2: rowY(rows.length - 1) + 22, stroke: v ? t.c('grid') : t.c('ink'), 'stroke-width': v ? 1 : 1.2 }),
    textLines([String(v)], { x: x(v), y: rowY(rows.length - 1) + 30, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted'), attrs: { 'font-variant-numeric': 'tabular-nums' } })));
  rows.forEach((r, i) => {
    const y = rowY(i), up = r.to >= r.from, a = Math.min(r.from, r.to), b = Math.max(r.from, r.to);
    const fill = r.total ? t.c('accent') : up ? t.c('positive') : t.c('negative');
    parts.push(textLines([r.label], { x: 0, y, size: 18, valign: 'middle', fill: t.c('ink'), weight: r.total ? 700 : 400 }));
    if (r.note) parts.push(textLines([`※${r.note}`], { x: 18 * [...r.label].length + 8, y: y - 6, size: 15, valign: 'middle', fill: t.c('muted') }));
    if (r.oneOff) {   // the part of last year's profit that will not recur
      parts.push(el('rect', { x: x(0), y: y - bh / 2, width: x(r.to - r.oneOff) - x(0), height: bh, fill }),
        el('rect', { x: x(r.to - r.oneOff), y: y - bh / 2, width: x(r.to) - x(r.to - r.oneOff), height: bh, fill: t.c('context') }));
    } else parts.push(el('rect', { x: x(a), y: y - bh / 2, width: Math.max(2, x(b) - x(a)), height: bh, fill }));
    const label = r.total ? fmt(r.to, { digits: 1 }) : `${up ? '+' : '−'}${p1(r.value)}`;
    parts.push(textLines([label], { x: x(b) + 8, y, size: 18, valign: 'middle', weight: 700, fill: r.total ? t.c('ink') : fill, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
    if (i < rows.length - 1) parts.push(el('line', { x1: x(r.to), x2: x(r.to), y1: y + bh / 2, y2: rowY(i + 1) - bh / 2, stroke: t.c('muted'), 'stroke-width': 1, 'stroke-dasharray': '2 3' }));
  });
  parts.push(textLines([`うち一時要因 ${p1(oneOff)}`], { x: x(prev - oneOff) - 8, y: rowY(0) - bh / 2 - 8, size: 15, anchor: 'end', fill: t.c('muted') }));
  return svgRoot({ id: 'composition-side-note-fig', width: W, height: H, theme: t,
    title: '営業利益の増減要因、前年同期から当期まで（億円）',
    desc: `前年同期${fmt(prev, { digits: 1 })}億円から当期${fmt(now, { digits: 1 })}億円へ。販売数量と価格改定で増え、原材料費と固定費、前年の土地売却益の反動で減った。一時要因を除くと${p1(underlying)}%増。` },
  textLines(['億円'], { x: x(60), y: 4, size: 15, anchor: 'end', valign: 'top', fill: t.c('muted') }), parts);
}

// Margin notes: top of each note at its row's centre line, pushed down only if the previous note is still running.
let floor = 0;
const margin = Object.entries(notes).map(([k, text]) => {
  const row = rows.findIndex(r => r.note === Number(k));
  const top = Math.max(fig.top + rowY(row) - 14, floor);
  floor = top + Math.ceil((0.9 * measureText(text, 17)) / 328) * 30 + 12;   // lines in the 328 px column (the estimate runs ~10% wide for Japanese)
  return `<p class="sn-note" style="top:${top}px"><span>※${k}</span>${ja(text)}</p>`;
}).join('\n');

export default {
  study: true,
  id: 'composition-side-note',
  language: 'ja',
  title: 'Side notes: the argument in the main column, qualifications in the margin',
  className: 'st cs-finance-ledger cmp-sidenote',
  notes: 'Purpose: Keep a results page readable when the numbers need qualifications (one-off items, exchange rates, definitions). The argument stays in the main column at full size; the qualifications move to a margin, keyed and aligned to the exact row they qualify, instead of a footnote block nobody reads.\nModify: Replace `bridge` (one row per driver, totals marked) and `notes` (keyed by number, placed on the row that carries the same `note`). Note positions follow the rows; keep each note to one or two sentences.\nInvariant: The main column takes about two thirds of the width; notes sit at 17 px or more, never smaller than the source line; each note starts on the line of its row and carries the same ※ number as the label; decreases show a minus sign as well as red; the non-recurring part of last year’s profit is drawn as its own lighter segment, so the headline’s comparison is visible in the chart.\nStatic: Already static.',
  sources: [{ type: 'original-example', file: 'assets/compositions/side-note.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${ja(`前年の土地売却益を除くと、営業利益は${p1(underlying)}%増えた`)}<br><span class="st-quiet">${ja(`報告ベースでは${p1(reported)}%${reported < 0 ? '減' : '増'}（${fmt(prev, { digits: 1 })}億円→${fmt(now, { digits: 1 })}億円）`)}</span></h1>
<figure class="sn-fig" data-region="primary">${figure()}</figure>
<div class="sn-margin" data-region="support">
${margin}
</div>
<p class="st-source" data-region="source"><span>架空のデータ · 白嶺工業 2026年度上期 決算説明資料</span><span>営業利益の増減要因</span></p>`,
};
