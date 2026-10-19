// Worked example · Geometry from constraints.
//
// The chain of custody for a clinical-trial blood specimen, drawn three times: as a
// summary, as the full procedure, and in Japanese for the site staff. The steps and the
// hand-offs between them never change; only the labels do. Every layout is computed from
// the measured labels, so longer text reflows instead of overflowing or breaking an edge:
//   1. layers   the order of steps, from the dependencies          layout.mjs  dagLayers
//   2. measure  every label, wrapped to a candidate column width   figure.mjs  wrapText, measureText
//   3. arrange  one row first; else two rows, cut only where one step hands to one step,
//               so no connector has to cross a stack; keep the first arrangement that fits
//   4. place    rows sized by their measured content, equal columns layout.mjs  allocate · kit.mjs grid
//   5. connect  ports on box edges, orthogonal connectors          kit.mjs     port, connector
// If no arrangement fits, `arrange` throws with the numbers: shorten, split or give the
// diagram more room. It never shrinks type to make a fit.
import fs from 'node:fs/promises';
import { h, grid, port, connector } from '../../assets/runtime/kit.mjs';
import { allocate, dagLayers } from '../../assets/runtime/layout.mjs';
import { theme, el, g, svgRoot, textLines, wrapText, measureText, sum } from '../../assets/runtime/figure.mjs';

// ------------------------------------------------------------------ the procedure (fictional)
// Trial NK-301 central laboratory manual, section 4. Each step: who holds the specimen and what they record.
const steps = [
  { id: 'draw',
    en: { title: 'Draw', holder: 'Site nurse', detail: 'Two 4 ml tubes, labelled with the participant code, not the name' },
    ja: { title: '採血', holder: '施設の看護師', detail: '4 mLの採血管2本。ラベルは被験者コードのみで、氏名は書かない' } },
  { id: 'prepare',
    en: { title: 'Spin, split, freeze', holder: 'Site laboratory', detail: 'Spin within 30 min, split into vials A and B, freeze at −80 °C' },
    ja: { title: '遠心・分注・凍結', holder: '施設の検査室', detail: '30分以内に遠心し、AとBの2本に分注して−80 °Cで凍結する' } },
  { id: 'ship',
    en: { title: 'Ship on dry ice', holder: 'Courier', detail: 'Sealed box with a temperature logger; both sign the custody form' },
    ja: { title: 'ドライアイスで輸送', holder: '運送業者', detail: '温度ロガー入りの箱を封緘し、引き渡し時に双方が管理票に署名する' } },
  { id: 'receive', gate: true,
    en: { title: 'Check on arrival', holder: 'Central lab reception', detail: 'Seal, logger trace and every vial code against the manifest; sign' },
    ja: { title: '受領時の確認', holder: '中央検査室の受付', detail: '封、温度の記録、検体番号を送付票と照合してから署名する' } },
  { id: 'store',
    en: { title: 'Store', holder: 'Central lab', detail: 'Vial A to the assay queue, vial B to the −80 °C archive' },
    ja: { title: '保管', holder: '中央検査室', detail: 'Aは測定の待機列へ、Bは−80 °Cの保存庫へ' } },
  { id: 'hold', exception: true,
    en: { title: 'Quarantine', holder: 'Central lab QA', detail: 'Seal broken, logger above −60 °C or codes differ: hold, tell the sponsor' },
    ja: { title: '隔離', holder: '中央検査室の品質管理', detail: '封の破損、−60 °C超、番号の不一致があれば保留し、依頼者へ連絡する' } },
  { id: 'assay',
    en: { title: 'Assay', holder: 'Analyst', detail: 'Vial A in duplicate with two control levels; the analyst signs the run' },
    ja: { title: '測定', holder: '分析担当者', detail: 'Aを2回測定し、2濃度の精度管理試料も併せて測る。記録に署名する' } },
  { id: 'report',
    en: { title: 'Report', holder: 'Data manager', detail: 'Results enter the trial database under the vial code; the record closes' },
    ja: { title: '報告', holder: 'データ管理者', detail: '検体番号で治験データベースに登録し、管理記録を閉じる' } },
];
const flow = [['draw', 'prepare'], ['prepare', 'ship'], ['ship', 'receive'], ['receive', 'store'],
  ['receive', 'hold'], ['store', 'assay'], ['assay', 'report']];            // [from, to]: the specimen moves on
const byId = Object.fromEntries(steps.map(s => [s.id, s]));

// ------------------------------------------------------------------ 1 · layers from the dependencies
// dagLayers orders the steps and throws on a cycle. Its boxes are not used: real sizes come from text.
const { levels } = dagLayers({ nodes: steps.map(s => s.id), edges: flow, width: 1e5, height: 1e5, nodeWidth: 1, nodeHeight: 1 });
const mainPath = levels.length;                                             // steps a normal specimen passes

// ------------------------------------------------------------------ 2 · measure
// Type per language: [size px, weight, line height]. Japanese gets looser leading.
const TYPE = {
  en: { title: [20, 650, 1.2], holder: [16, 400, 1.3], detail: [17, 400, 1.36] },
  ja: { title: [20, 700, 1.4], holder: [16, 400, 1.45], detail: [16, 400, 1.6] },
};
const PAD = { x: 12, y: 13 }, GAP = { col: 32, row: 44, stack: 14, block: 5 };
const MAX_LINES = { title: 2, holder: 2, detail: 4 };   // a readable measure is a constraint too

/** Wrap each field of one step to the column's inner width and measure the result. */
function measureStep(step, lang, fields, width) {
  const inner = width - 2 * PAD.x;
  const blocks = fields.map(f => {
    const [size, weight, lh] = TYPE[lang][f];
    const lines = wrapText(step[lang][f], inner, size, { weight });
    return { f, lines, size, weight, lh, widest: Math.max(...lines.map(l => measureText(l, size, { weight }))) };
  });
  const height = 2 * PAD.y + sum(blocks.map(b => b.lines.length * b.size * b.lh)) + GAP.block * (blocks.length - 1);
  const tooWide = blocks.find(b => b.widest > inner + 0.5), tooLong = blocks.find(b => b.lines.length > MAX_LINES[b.f]);
  return { blocks, height, problem: tooWide ? `a ${tooWide.f} word is wider than the column`
    : tooLong ? `${step.id} ${tooLong.f} needs ${tooLong.lines.length} lines (max ${MAX_LINES[tooLong.f]})` : null };
}

// ------------------------------------------------------------------ 3 · arrange
/** Try one row, then two rows; return the first arrangement whose measured content fits the region. */
function arrange(lang, fields, region) {
  // A row may end only where a single step hands to a single step: the wrap connector then
  // runs from one box to one box through the empty gap between rows.
  const cuts = levels.map((_, k) => k).filter(k => k > 0 && levels[k].length === 1 && levels[k - 1].length === 1);
  const candidates = [[levels], ...cuts.map(k => [levels.slice(0, k), levels.slice(k)])]
    .map(rows => ({ rows, columns: Math.max(...rows.map(r => r.length)) }))
    .sort((a, b) => a.rows.length - b.rows.length || a.columns - b.columns);
  const record = [];
  for (const c of candidates) {
    const colW = (region.w - GAP.col * (c.columns - 1)) / c.columns;
    const m = Object.fromEntries(steps.map(s => [s.id, measureStep(s, lang, fields, colW)]));
    const stack = layer => sum(layer.map(id => m[id].height)) + GAP.stack * (layer.length - 1);
    const need = c.rows.map(row => Math.max(...row.map(stack)));
    const total = sum(need) + GAP.row * (c.rows.length - 1);
    const problem = steps.map(s => m[s.id].problem).find(Boolean) ?? (total > region.h ? `needs ${Math.round(total)} of ${region.h} px` : null);
    record.push(`${c.rows.length} × ${c.columns} at ${Math.round(colW)} px: ${problem ?? `fits, ${Math.round(total)} of ${region.h} px`}`);
    if (!problem) return { ...c, colW, m, need, record };
  }
  throw Error(`No arrangement fits the ${lang} labels:\n  ${record.join('\n  ')}\nShorten the labels, split the diagram or give it more room.`);
}

// ------------------------------------------------------------------ 4 · place
/** Boxes for every step: rows get heights in proportion to what they hold, columns are equal. */
function place(a, region) {
  const rows = allocate({ x: region.x, y: region.y, width: region.w, height: region.h, weights: a.need, gap: GAP.row, axis: 'y' });
  const box = {}, rowOf = {};
  a.rows.forEach((row, r) => {
    const cells = grid({ x: region.x, y: rows[r].y, width: region.w, height: rows[r].height, columns: a.columns, gap: GAP.col });
    const single = Math.max(0, ...row.filter(l => l.length === 1).map(l => a.m[l[0]].height));   // single steps in a row share a height
    row.forEach((layer, k) => {
      const hs = layer.map(id => (layer.length === 1 ? single : a.m[id].height));
      let y = cells[k].y + (cells[k].h - sum(hs) - GAP.stack * (layer.length - 1)) / 2;
      layer.forEach((id, j) => { box[id] = { x: cells[k].x, y, w: cells[k].w, h: hs[j] }; rowOf[id] = r; y += hs[j] + GAP.stack; });
    });
  });
  return { box, rowOf };
}

// ------------------------------------------------------------------ 5 · connect and draw
const t = theme();

function drawStep(step, b, measured) {
  const content = sum(measured.blocks.map(x => x.lines.length * x.size * x.lh)) + GAP.block * (measured.blocks.length - 1);
  let y = b.y + (b.h - content) / 2;
  const ink = { title: step.gate ? t.c('accent') : step.exception ? t.c('muted') : t.c('ink'), holder: t.c('muted'), detail: t.c('ink') };
  const text = measured.blocks.map(x => {
    const lines = textLines(x.lines, { x: b.x + PAD.x, y, size: x.size, valign: 'top', lineHeight: x.lh, weight: x.weight === 400 ? null : x.weight, fill: ink[x.f] });
    y += x.lines.length * x.size * x.lh + GAP.block;
    return lines;
  });
  return g({ 'data-step-id': step.id },
    el('rect', { x: b.x, y: b.y, width: b.w, height: b.h, rx: 6, fill: step.exception ? t.c('paper') : t.c('surface'),
      stroke: step.gate ? t.c('accent') : step.exception ? t.c('muted') : t.c('rule'), 'stroke-width': step.gate ? 2.2 : 1.2,
      'stroke-dasharray': step.exception ? '5 4' : null }),
    text);
}

/** One connector per hand-off: right port to left port in a row, bottom to top across rows. */
function drawEdge([from, to], { box, rowOf }) {
  const wraps = rowOf[to] > rowOf[from], end = port(box[to], wraps ? 'top' : 'left');
  const d = wraps ? connector(box[from], box[to], { from: 'bottom', to: 'top', axis: 'y' }) : connector(box[from], box[to]);
  const exception = byId[to].exception, color = exception ? t.c('muted') : t.c('ink');
  const head = wraps ? `M${end[0]} ${end[1]}l-5 -9h10z` : `M${end[0]} ${end[1]}l-9 -5v10z`;
  return g({}, el('path', { d, fill: 'none', stroke: color, 'stroke-width': 1.6, 'stroke-dasharray': exception ? '5 4' : null }),
    el('path', { d: head, fill: color }));
}

/** The whole figure for one language and one label depth. */
function custodyFigure({ id, lang, fields, region, title, desc }) {
  const a = arrange(lang, fields, region), placed = place(a, region);
  const svg = svgRoot({ id, width: 1280, height: 720, title, desc, style: 'position:absolute;left:0;top:0' },
    flow.map(e => drawEdge(e, placed)),
    steps.map(s => drawStep(s, placed.box[s.id], a.m[s.id])));
  return { svg: svg.replace('<svg ', `<svg data-layout="${h(a.record.at(-1))}" `), arrangement: a };
}

// ------------------------------------------------------------------ CSS: grammar + one color system + this deck
const read = file => fs.readFile(new URL(file, import.meta.url), 'utf8');
const SYSTEM = 'clinical-trial';
const frame = await read('../../assets/runtime/study-frame.css');
const block = (await read('../../assets/color-systems/color-systems.css'))
  .match(new RegExp(String.raw`/\*[^*]*\*/\n\.cs-${SYSTEM}\{[^}]*\}`))?.[0];
if (!block) throw Error(`color-systems.css has no block for cs-${SYSTEM}`);
const deckCSS = String.raw`
/* ---- Chain of custody: deck-specific rules. The figure is drawn on the full 1280 × 720 canvas,
   so its boxes share the page's coordinates (64 px margins, figure band given per page in deck.mjs). */
.custody { --ss-font-display: "Inter Display", "Inter", "Helvetica Neue", Arial, sans-serif;
           --ss-font-sans: "Inter", "Helvetica Neue", Arial, sans-serif; }
.custody:lang(ja) { --ss-font-display: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", "Yu Gothic", Meiryo, "IPAGothic", sans-serif;
                    --ss-font-sans: var(--ss-font-display); }
.custody .st-head { font-weight: 600; font-size: 38px; line-height: 1.16; letter-spacing: -.015em; max-width: 1110px; }
.custody:lang(ja) .st-head { font-weight: 700; font-size: 34px; line-height: 1.4; letter-spacing: .02em; max-width: 1060px; }
`;

// ------------------------------------------------------------------ pages
const cls = `st cs-${SYSTEM} custody`;
const source = (left, right) => `<p class="st-source" data-region="source"><span>${left}</span><span>${right}</span></p>`;
const SOURCE = 'Trial NK-301 central laboratory manual, section 4 (fictional).';
const sources = [{ file: 'examples/constraint-layout/deck.mjs', status: 'illustrative' }];
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

const summary = custodyFigure({ id: 'custody-summary', lang: 'en', fields: ['title', 'holder'], region: { x: 64, y: 196, w: 1152, h: 440 },
  title: 'Specimen chain of custody, summary', desc: `${mainPath} steps from the draw to the result; the check on arrival sends a failing box to quarantine.` });
const procedure = custodyFigure({ id: 'custody-procedure', lang: 'en', fields: ['title', 'holder', 'detail'], region: { x: 64, y: 172, w: 1152, h: 490 },
  title: 'Specimen chain of custody, full procedure', desc: 'Each step names its holder and what they check and sign.' });
const japanese = custodyFigure({ id: 'custody-ja', lang: 'ja', fields: ['title', 'holder', 'detail'], region: { x: 64, y: 132, w: 1152, h: 532 },
  title: '検体の管理の連鎖（全手順）', desc: '各段階に保持者と確認事項、署名を示す。' });

export default {
  title: 'Specimen chain of custody, Trial NK-301',
  language: 'en', readingMode: 'live', transition: 'fade', sample: true,
  css: [frame, block, deckCSS].join('\n'),
  slides: [
    {
      id: 'summary', className: cls,
      title: `${words[mainPath][0].toUpperCase() + words[mainPath].slice(1)} steps take a specimen from the draw to the result, and only the check on arrival can stop it`,
      content: `<h1 class="st-head" data-region="title">${words[mainPath][0].toUpperCase() + words[mainPath].slice(1)} steps take a specimen from the draw to the result, and only <em>the check on arrival</em> can stop it</h1>
<figure data-region="primary">${summary.svg}</figure>
${source(SOURCE, 'Process diagram, layout computed from labels')}`,
      notes: 'The summary for the steering committee: who holds the specimen at each step. The check on arrival is the one point where a specimen leaves the normal path: a broken seal, a warm box or a mismatched code sends it to quarantine.',
      sources,
    },
    {
      id: 'procedure', className: cls,
      title: 'Each step names who holds the specimen and what they check and sign; the check on arrival decides whether it goes on',
      content: `<h1 class="st-head" data-region="title">Each step names who holds the specimen and what they check and sign; <em>the check on arrival</em> decides whether it goes on</h1>
<figure data-region="primary">${procedure.svg}</figure>
${source(SOURCE, 'Process diagram, layout computed from labels')}`,
      notes: 'The same steps and hand-offs as the summary, with the procedure text the central lab works from. The text no longer fits seven columns, so the chain wraps after shipping: the courier hands over at the start of the second row.',
      sources,
    },
    {
      id: 'procedure-ja', className: cls, language: 'ja',
      title: '検体の流れを止められるのは、受領時の確認だけ',
      content: `<h1 class="st-head" data-region="title">検体の流れを止められるのは、<em>受領時の確認</em>だけ</h1>
<figure data-region="primary">${japanese.svg}</figure>
${source('治験NK-301 中央検査室マニュアル 第4章（架空）', '工程図（ラベルの実測から配置を計算）')}`,
      notes: '大阪の実施施設向けの日本語版。手順と受け渡しは英語版と同じで、文の長さが変わったぶん配置だけが計算し直されている。',
      sources,
    },
  ],
};
