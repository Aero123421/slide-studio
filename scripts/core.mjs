/** Slide Studio structured route: deck JSON -> one measured scene -> HTML and editable PowerPoint.
 *
 * Every page is composed here from a few primitives (text, rect, ellipse, line, path, table,
 * image, svg) whose geometry is computed once, from the data. html.mjs and export-pptx.mjs only
 * translate those primitives, so a chart label and its mark cannot disagree and the PPTX stays
 * native: text boxes, shapes, freeform paths and tables, never a picture of a chart.
 *
 * Page design (CSS px on a 1280×720 canvas, 96 dpi):
 *   grid      12 columns of 74 px, 24 px gutters, 64 px outer margins (column pitch 98 px)
 *   headline  44 px from the top, at most two lines, theme titleSize clamped to 36–44 px
 *   evidence  x 64–1216, y 188–640 (1152×452): the largest thing on every content page
 *   footer    one quiet line: source or sample note on the left, deck name and page on the right
 * Type sizes belong to the layout (and scale with the number of items), never to the length of
 * the copy: excess copy raises a repairable error instead of shrinking or clipping.
 * Colour: ink and greys carry everything; the theme accent marks the one thing the headline is
 * about (`highlight`, or a data label named in the title). Muted text keeps >= 4.5:1 contrast.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { measureText, wrapText, wrapBalanced, niceDomain, niceStep, ticks as niceTicks, fmt, spreadLabels } from '../assets/runtime/fig-core.mjs';

export const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const W = 1280, H = 720;
export const LAYOUTS = ['cover', 'statement', 'section', 'agenda', 'split', 'metric', 'metrics', 'quote', 'comparison', 'table', 'bar', 'line', 'stacked', 'waterfall', 'donut', 'scatter', 'timeline', 'process', 'matrix', 'architecture', 'code', 'equation', 'image', 'closing', 'freeform'];
/** Theme keys computed by loadTheme; never written back into a theme file. */
export const DERIVED_TOKENS = ['muted', 'line', 'tint', 'grid', 'context', 'greys', 'series', 'accentText', 'onAccent', 'codeBg', 'codeInk'];
export const ELEMENT_TYPES = ['text', 'rect', 'ellipse', 'line', 'path', 'table', 'image', 'svg'];
/** Theme roles a freeform element may name as its color, fill or stroke. */
const FREEFORM_COLORS = ['ink', 'paper', 'muted', 'accent', 'accentText', 'line', 'grid', 'tint', 'context', 'series'];
/** Element ids the HTML player uses for its own controls; a slide may not take them. */
const RESERVED_IDS = ['prev', 'next', 'overview', 'notes', 'full', 'announce', 'slide-studio-scene'];

export const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const safeJSON = x => JSON.stringify(x).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
export const assert = (v, msg) => { if (!v) throw Error(msg); };
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round1 = v => Math.round(v * 10) / 10;

// ------------------------------------------------------------------ colour

export function mix(a, b, t) {
  return '#' + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
}
function luminance(c) {
  return [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16) / 255).map(v => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
}
export function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
/** The lightest mix of `ink` toward `paper` that still reaches `target` contrast on paper. */
function towardPaper(ink, paper, target) {
  let best = 0;
  for (let k = 1; k <= 95; k++) { if (contrast(mix(ink, paper, k / 100), paper) >= target) best = k / 100; else break; }
  return mix(ink, paper, best);
}

// ------------------------------------------------------------------ theme

function themeFile(input) {
  return input.endsWith('.json') ? path.resolve(input) : path.join(ROOT, 'assets/themes', input + '.json');
}
export async function loadTheme(input = 'neutral') {
  const raw = typeof input === 'object' ? input : JSON.parse(await fs.readFile(themeFile(input), 'utf8'));
  const t = { name: 'Custom', paper: '#FFFFFF', ink: '#18212B', accent: '#2156CC', secondary: '#78869D', font: 'Arial', headingFont: 'Arial', radius: 0, titleSize: 40, bodySize: 24, ...raw };
  for (const k of ['paper', 'ink', 'accent', 'secondary']) assert(/^#[a-f\d]{6}$/i.test(t[k]), `theme.${k}: use #RRGGBB`);
  for (const k of ['font', 'headingFont']) assert(typeof t[k] === 'string' && /^[\p{L}\p{N} _,.-]+$/u.test(t[k]), `theme.${k}: use a plain font family name`);
  for (const k of ['radius', 'titleSize', 'bodySize']) assert(Number.isFinite(t[k]) && t[k] >= 0, `theme.${k}: finite nonnegative number required`);
  const { ink, paper, accent } = t;
  t.muted = towardPaper(ink, paper, 5.2);          // secondary text: notes, axes, footer (>= 4.5:1)
  t.line = mix(ink, paper, 0.82);                    // hairline rules
  t.grid = mix(ink, paper, 0.9);                     // gridlines, quieter than rules
  t.tint = mix(accent, paper, 0.9);                  // background of the highlighted row/option
  t.context = towardPaper(ink, paper, 3);            // marks that are not "this" (3:1, still visible)
  t.greys = [2.4, 1.85, 1.5, 1.3].map(c => towardPaper(ink, paper, c)); // further parts of a whole
  t.series = mix(ink, paper, 0.3);                   // a single series with nothing highlighted
  let at = accent;                                    // accent as text: darkened toward ink if needed
  for (let k = 1; k <= 20 && contrast(at, paper) < 4.5; k++) at = mix(accent, ink, k / 20);
  t.accentText = at;
  t.onAccent = contrast(paper, accent) >= contrast(ink, accent) ? paper : ink;
  const light = luminance(paper) > 0.4;
  t.codeBg = light ? mix(ink, '#000000', 0.15) : mix(paper, ink, 0.08);
  t.codeInk = light ? paper : ink;
  return t;
}

// ------------------------------------------------------------------ text measurement

const familyOf = font => (/mono|consolas|courier|menlo/i.test(font) ? 'mono' : /serif|mincho|georgia|times|charter|garamond/i.test(font) && !/sans/i.test(font) ? 'serif' : 'sans');
const textOpts = (font = 'sans', weight = 400, tracking = 0) => ({ family: familyOf(font), weight, letterSpacing: tracking });
/** Predictable wrapping with the figure engine: Latin words stay whole, Japanese breaks between
 * phrases (never before 、。 or after （「), numbers stay with their units. Browser QA remeasures. */
export function wrap(value, width, size, opts = {}) {
  return unmarkClauses(wrapText(markClauses(value), width, size, textOpts(opts.font, opts.weight, opts.tracking)));
}
// fig-core attaches a following hiragana word to a token that ends in 、 (…かを、そのまま), which
// can strand a short first line. A temporary space after Japanese clause punctuation restores the
// break opportunity; it is removed again from the wrapped lines.
const markClauses = v => String(v ?? '').replace(/([、。，！？])(?=[^\s」』）】〕、。])/gu, '$1 ');
const unmarkClauses = lines => lines.map(l => l.replace(/([、。，！？]) /gu, '$1'));
const textWidth = (s, size, opts = {}) => measureText(s, size, textOpts(opts.font, opts.weight, opts.tracking));
const isCJK = lang => /^(ja|zh|ko)\b/i.test(lang || '');

// ------------------------------------------------------------------ grid and type scale

const M = 64, PITCH = 98, GUT = 24;
const colX = c => M + (c - 1) * PITCH;            // left edge of column c (1–12)
const spanW = s => s * PITCH - GUT;               // width of s columns
const REGION = { x: 64, y: 188, w: 1152, h: 452 }; // evidence region; bottom = 640
const RB = REGION.y + REGION.h;
const TITLE_Y = 44, FOOT_Y = 668;

function typeScale(t, lang) {
  const ja = isCJK(lang), head = clamp(t.titleSize, 36, 44), body = clamp(t.bodySize, 20, 26);
  const s = (size, lhJa, lhEn, weight = 400, track = 0) => ({ size, lh: ja ? lhJa : lhEn, weight, ...(ja || !track ? {} : { tracking: track }) });
  return {
    ja,
    // Latin display sizes are set slightly tight; Japanese keeps its natural spacing.
    display: s(Math.round(head * 1.8), 1.3, 1.1, 700, -0.02),    // cover
    statement: s(Math.round(head * 1.6), 1.35, 1.12, 700, -0.015),
    closing: s(Math.round(head * 1.4), 1.38, 1.15, 700, -0.015),
    headline: s(head, 1.4, 1.2, 700, -0.01),
    lead: s(28, 1.55, 1.35),
    body: s(body, 1.65, 1.45),
    small: s(20, 1.6, 1.4),
    label: s(18, 1.45, 1.3),
    tick: s(16, 1.3, 1.25),
    chrome: s(15, 1.4, 1.35),
  };
}

// ------------------------------------------------------------------ helpers shared by layouts

function normalizeItems(v, min, max, name) {
  assert(Array.isArray(v) && v.length >= min && v.length <= max, `${name}: expected ${min}–${max} items`);
  return v;
}
const norm = s => String(s ?? '').normalize('NFKC').toLowerCase().replace(/\s+/g, '');
/** Indices to accent: explicit `highlight` (index, label or list; null/false = none), otherwise
 * the data labels the headline names (only if it names some, not all). */
function highlightSet(s, labels, warnings, where) {
  const h = s.highlight;
  if (h === null || h === false) return new Set();
  if (h !== undefined) {
    const out = new Set();
    for (const v of Array.isArray(h) ? h : [h]) {
      const i = typeof v === 'number' ? v : labels.findIndex(l => norm(l) === norm(v));
      if (Number.isInteger(i) && i >= 0 && i < labels.length) out.add(i);
      else warnings.push(`${where}: highlight ${JSON.stringify(v)} matches no item; ignored`);
    }
    return out;
  }
  const title = norm(s.title);
  const hits = labels.map((l, i) => [norm(l), i]).filter(([l]) => l.length >= 2 && title.includes(l)).map(([, i]) => i);
  return new Set(hits.length && hits.length < labels.length ? hits : []);
}
/** "+12h" -> {number:"+12", unit:"h"}; real minus; unit kept as written. */
function splitValue(v) {
  const s = String(v ?? '').trim();
  const m = s.match(/^([+\-−＋▲±]?\s*[¥$€£]?\s*\d[\d,.]*(?:[kKMBT]|bn)?(?![A-Za-z]))\s*(.*)$/u);
  if (!m) return { number: s, unit: '' };
  return { number: m[1].replace(/^＋/, '+').replace(/^-/, '−').replace(/\s+/g, ''), unit: m[2] };
}
const sourceLabel = x => (typeof x === 'string' ? x : x && (x.title || x.file || x.url)) || '';

// ------------------------------------------------------------------ page builder

class Page {
  constructor(t, S, where, lang) { Object.assign(this, { t, S, where, lang, elements: [], seq: 0, group: undefined }); }
  push(n) {
    const node = { id: `n${++this.seq}`, ...n };
    if (this.group !== undefined && node.group === undefined) node.group = this.group;
    this.elements.push(node);
    return node;
  }
  fit(value, w, st) {
    assert(value !== undefined && value !== null, `${this.where}: missing text`);
    const opts = { font: st.font, weight: st.weight, tracking: st.tracking };
    const raw = String(value);
    const balanced = () => unmarkClauses(wrapBalanced(markClauses(raw), w, st.size, textOpts(st.font, st.weight, st.tracking)));
    let lines = st.balance ? balanced() : wrap(raw, w, st.size, opts);
    if (st.balance && lines.length < 2) lines = wrap(raw, w, st.size, opts);
    // No orphans: a last line under 30% of the measure is rebalanced (same number of lines).
    else if (!st.balance && familyOf(st.font) !== 'mono' && lines.length >= 2 && !raw.includes('\n') && textWidth(lines.at(-1), st.size, st) < 0.3 * w) {
      const b = balanced();
      if (b.length === lines.length) lines = b;
    }
    return lines;
  }
  /** Wrap copy into lines. Blank lines separate paragraphs, which get half a line of space
   * (`paraGap`) instead of a full empty line. */
  layout(value, w, st) {
    st = { font: this.t.font, ...st };
    const blocks = String(value ?? '').split(/\n[ \t]*\n/).map(p => this.fit(p, w, st));
    const gap = blocks.length > 1 ? Math.round(st.size * st.lh * 0.5) : 0;
    const lines = blocks.flat();
    return { lines, gap, text: blocks.map(b => b.join('\n')).join('\n\n'), h: lines.length * st.size * st.lh + (blocks.length - 1) * gap, w: Math.max(0, ...lines.map(l => textWidth(l, st.size, st))) };
  }
  measure(value, w, st) { return this.layout(value, w, st); }
  /** A text block. Height grows with the copy up to `h` or `maxLines`; beyond that it is an error. */
  text(value, { x, y, w, h, maxLines, size, lh, weight = 400, font, color, align = 'left', role = 'body', balance, tracking, numeric, ...rest }) {
    assert(value !== undefined && value !== null, `${this.where}: missing text`);
    font = font || this.t.font;
    const m = this.layout(value, w, { size, lh, weight, font, balance, tracking });
    const limit = Math.min(h ?? Infinity, maxLines ? maxLines * size * lh : Infinity);
    if (m.h > limit + 1 || (maxLines && m.lines.length > maxLines)) throw Error(`${this.where}: text does not fit (${m.lines.length} lines): ${String(value).slice(0, 55)}. Shorten or change layout.`);
    return this.push({
      type: 'text', x: round1(x), y: round1(y), w: round1(w), h: round1(h ?? m.h), size, font, color: color || this.t.ink, weight, align,
      text: m.text, lineHeight: lh, role, ...(m.gap ? { paraGap: m.gap } : {}), ...(tracking ? { tracking } : {}), ...(numeric ? { numeric: true } : {}), ...rest,
    });
  }
  /** One line in several sizes that share a baseline (a figure and its unit): `runs` render as
   * spans in HTML and as runs of one paragraph in PowerPoint. */
  runs(parts, { x, y, w, lh, font, color, role = 'data', align = 'left', ...rest }) {
    font = font || this.t.font;
    parts = parts.filter(p => p.text);
    const width = parts.reduce((a, p) => a + textWidth(p.text, p.size, { font, weight: p.weight, tracking: p.tracking }), 0) + 4;
    if (width > w + 1) throw Error(`${this.where}: text does not fit (1 lines): ${parts.map(p => p.text).join('').slice(0, 55)}. Shorten or change layout.`);
    const size = Math.max(...parts.map(p => p.size)), main = parts.find(p => p.size === size);
    return this.push({
      type: 'text', x: round1(x), y: round1(y), w: round1(w), h: round1(size * lh), size, font, color: color || this.t.ink, weight: main.weight || 400, align,
      text: parts.map(p => p.text).join(''), lineHeight: lh, role, numeric: true,
      runs: parts.map(p => ({ text: p.text, size: p.size, weight: p.weight || 400, color: p.color || color || this.t.ink, ...(p.tracking ? { tracking: p.tracking } : {}) })), ...rest,
    });
  }
  rect(x, y, w, h, o = {}) { return this.push({ type: 'rect', x: round1(x), y: round1(y), w: round1(Math.max(0, w)), h: round1(Math.max(0, h)), fill: this.t.tint, stroke: 'none', strokeWidth: 0, role: 'mark', ...o }); }
  ellipse(cx, cy, r, o = {}) { return this.push({ type: 'ellipse', x: round1(cx - r), y: round1(cy - r), w: round1(2 * r), h: round1(2 * r), fill: this.t.ink, stroke: 'none', strokeWidth: 0, role: 'mark', ...o }); }
  line(x1, y1, x2, y2, o = {}) {
    return this.push({ type: 'line', x: round1(Math.min(x1, x2)), y: round1(Math.min(y1, y2)), w: round1(Math.abs(x2 - x1)), h: round1(Math.abs(y2 - y1)), x1: round1(x1), y1: round1(y1), x2: round1(x2), y2: round1(y2), fill: 'none', stroke: this.t.line, strokeWidth: 1, role: 'rule', ...o });
  }
  rule(x, y, w, o = {}) { return this.line(x, y, x + w, y, o); }
  /** Path commands in slide px: ['M',x,y] ['L',x,y] ['A',cx,cy,r,startDeg,endDeg] (pen at start) ['Z']. */
  path(d, o = {}) {
    const pts = [];
    for (const c of d) {
      if (c[0] === 'M' || c[0] === 'L') pts.push([c[1], c[2]]);
      if (c[0] === 'A') { const [, cx, cy, r, a0, a1] = c; for (let k = 0; k <= 16; k++) { const a = (a0 + (a1 - a0) * k / 16) * Math.PI / 180; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } }
    }
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const x = Math.min(...xs), y = Math.min(...ys);
    return this.push({ type: 'path', x: round1(x), y: round1(y), w: round1(Math.max(...xs) - x), h: round1(Math.max(...ys) - y), d: d.map(c => c.map(v => (typeof v === 'number' ? round1(v) : v))), fill: 'none', stroke: 'none', strokeWidth: 0, role: 'mark', ...o });
  }
}

// ------------------------------------------------------------------ compile

export function compile(spec, t) {
  assert(spec && spec.version === 1, 'deck.version must be 1');
  assert(typeof spec.title === 'string' && spec.title.trim(), 'deck.title required');
  normalizeItems(spec.slides, 1, 120, 'slides');
  const lang = spec.language || 'ja';
  const S = typeScale(t, lang);
  const scenes = [], warnings = [];
  for (const [idx, s] of spec.slides.entries()) {
    const where = `slide ${idx + 1} (${s.layout})`;
    assert(LAYOUTS.includes(s.layout), `${where}: unknown layout`);
    assert(typeof s.title === 'string' && s.title.trim(), `${where}: title required`);
    const P = new Page(t, S, where, lang);
    const ctx = { spec, s, t, S, P, lang, where, warnings, idx, ja: S.ja };
    const common = !['cover', 'statement', 'section', 'quote', 'closing'].includes(s.layout);
    if (common && s.chrome !== false) header(ctx);
    LAYOUT_BUILDERS[s.layout](ctx);
    if (s.chrome !== false && spec.brand?.logo) P.push({ type: 'image', x: 1096, y: 40, w: 120, h: 42, src: spec.brand.logo, alt: spec.brand.name || 'Company logo', fit: 'contain', role: 'chrome' });
    if (s.chrome !== false && (common || s.sources?.length)) footer(ctx, common);
    const e = P.elements;
    applyBuilds(s, e);
    validateElements(e, where);
    sizeWarnings(e, where, warnings);
    if (!s.sources?.length && ['bar', 'line', 'stacked', 'waterfall', 'scatter', 'donut', 'metric', 'metrics'].includes(s.layout) && !spec.sample) warnings.push(`${where}: evidence source missing`);
    scenes.push({ id: s.id || 'slide-' + (idx + 1), title: s.title, layout: s.layout, paper: t.paper, notes: s.notes || '', sources: s.sources || [], elements: e, sample: !!spec.sample });
  }
  assert(new Set(scenes.map(s => s.id)).size === scenes.length, 'duplicate slide IDs');
  for (const s of scenes) assert(!RESERVED_IDS.includes(s.id), `slide id "${s.id}" is used by the player controls; rename the slide`);
  return { version: 1, width: W, height: H, title: spec.title, language: lang, ...(spec.readingMode ? { readingMode: spec.readingMode } : {}), theme: t, slides: scenes, warnings };
}

function header({ s, t, S, P, spec }) {
  let y = TITLE_Y;
  if (s.kicker) { P.text(s.kicker, { x: M, y: 28, w: spanW(10), maxLines: 1, ...S.label, color: t.muted, role: 'kicker' }); y = 58; }
  const w = spec.brand?.logo ? 1008 : spanW(11);
  P.text(s.title, { x: M, y, w, maxLines: 2, ...S.headline, font: t.headingFont, balance: true, role: 'title' });
}

function footer({ s, t, S, P, spec, idx, lang }, common) {
  const ja = isCJK(lang);
  const right = common ? `${spec.brand?.footer || spec.title}${ja ? '　' : '  '}${idx + 1}` : '';
  const evidence = ['bar', 'line', 'stacked', 'waterfall', 'donut', 'scatter', 'metric', 'metrics', 'table'].includes(s.layout);
  const sources = (s.sources || []).map(sourceLabel).filter(Boolean);
  const parts = [];
  if (sources.length) parts.push((ja ? '出所：' : 'Source: ') + sources.join(ja ? '、' : '; '));
  if (spec.sample && evidence) parts.push(ja ? '数値は架空' : 'Illustrative data');
  const st = { ...S.chrome, color: t.muted, role: 'source' };
  let rw = 0;
  if (right) { rw = Math.ceil(textWidth(right, st.size)) + 4; P.text(right, { x: 1216 - rw, y: FOOT_Y, w: rw, align: 'right', maxLines: 1, ...st }); }
  if (parts.length) {
    const w = 1152 - rw - (rw ? 48 : 0), left = parts.join(ja ? '　' : '  ');
    const m = P.measure(left, w, st);
    assert(m.lines.length <= 2, `${P.where}: text does not fit (${m.lines.length} lines): ${left.slice(0, 55)}. Shorten or change layout.`);
    P.text(left, { x: M, y: FOOT_Y + st.size * st.lh - m.h, w, maxLines: 2, ...st });
  }
}

// ------------------------------------------------------------------ layouts

const LAYOUT_BUILDERS = {
  cover({ s, t, S, P }) {
    if (s.kicker) P.text(s.kicker, { x: M, y: 64, w: spanW(10), maxLines: 2, ...S.small, color: t.muted, role: 'kicker' });
    const title = P.measure(s.title, spanW(11), { ...S.display, font: t.headingFont, balance: true });
    const body = s.body ? P.measure(s.body, spanW(9), { ...S.lead, balance: true }) : null;
    const bottom = s.byline ? 548 : 600;
    const blockH = title.h + (body ? 28 + body.h : 0);
    const y = Math.max(120, bottom - blockH);
    const tn = P.text(s.title, { x: M, y, w: spanW(11), maxLines: 3, ...S.display, font: t.headingFont, balance: true, role: 'title' });
    if (s.body) P.text(s.body, { x: M, y: tn.y + tn.h + 28, w: spanW(9), maxLines: 2, ...S.lead, balance: true, color: t.muted, role: 'support' });
    if (s.body && tn.y + tn.h + 28 + body.h > bottom + 1) throw Error(`${P.where}: text does not fit (${title.lines.length + body.lines.length} lines): ${s.title.slice(0, 55)}. Shorten or change layout.`);
    if (s.byline) {
      P.rule(M, 584, spanW(12), { stroke: t.ink, strokeWidth: 1.5 });
      P.text(s.byline, { x: M, y: 604, w: spanW(10), maxLines: 2, ...S.small, color: t.muted, role: 'support' });
    }
  },

  statement({ s, t, S, P }) {
    const st = { ...S.statement, font: t.headingFont, balance: true };
    const title = P.measure(s.title, spanW(11), st);
    const body = s.body ? P.measure(s.body, spanW(9), { ...S.lead, balance: true }) : null;
    const blockH = title.h + (body ? 36 + body.h : 0);
    const y = Math.max(96, Math.round(330 - blockH / 2));
    const tn = P.text(s.title, { x: M, y, w: spanW(11), maxLines: 4, ...st, role: 'title' });
    if (s.body) P.text(s.body, { x: M, y: tn.y + tn.h + 36, w: spanW(9), maxLines: 3, ...S.lead, balance: true, color: t.muted, role: 'support' });
    if (y + blockH > 640) throw Error(`${P.where}: text does not fit (${title.lines.length} lines): ${s.title.slice(0, 55)}. Shorten or change layout.`);
  },

  section({ s, t, S, P }) {
    const st = { ...S.closing, font: t.headingFont, balance: true };
    const num = s.number !== undefined && s.number !== '' ? String(s.number) : '';
    const title = P.measure(s.title, spanW(10), st);
    const body = s.body ? P.measure(s.body, spanW(8), { ...S.body, balance: true }) : null;
    const numH = num ? S.lead.size * 1.3 + 20 : 0;
    const blockH = numH + title.h + (body ? 28 + body.h : 0);
    let y = Math.max(140, Math.round(340 - blockH / 2));
    P.rule(M, y - 32, spanW(12), { stroke: t.ink, strokeWidth: 1.5 });
    if (num) { P.text(num, { x: M, y, w: spanW(4), maxLines: 1, size: S.lead.size, lh: 1.3, weight: 700, color: t.muted, role: 'label' }); y += numH; }
    const tn = P.text(s.title, { x: M, y, w: spanW(10), maxLines: 3, ...st, role: 'title' });
    if (s.body) P.text(s.body, { x: M, y: tn.y + tn.h + 28, w: spanW(8), maxLines: 3, ...S.body, balance: true, color: t.muted, role: 'support' });
  },

  agenda({ s, t, S, P }) {
    const items = normalizeItems(s.items, 1, 5, 'items').map(it => (typeof it === 'string' ? { title: it } : it));
    const n = items.length, numbered = s.numbered === true;
    const size = n <= 3 ? 36 : n === 4 ? 32 : 28;
    const st = { size, lh: S.ja ? 1.4 : 1.2, weight: 700, font: t.headingFont };
    const rowH = Math.min(128, Math.floor(REGION.h / n));
    const tx = numbered ? colX(2) : M, tw = (items.some(it => it.body) ? colX(8) - GUT : 1216) - tx;
    items.forEach((it, i) => {
      P.group = i;
      const y = REGION.y + i * rowH;
      P.rule(M, y, 1152, i === 0 ? { stroke: t.ink, strokeWidth: 1.5 } : {});
      const tm = P.measure(it.title, tw, st), bm = it.body ? P.measure(it.body, spanW(5), S.small) : { h: 0 };
      if (Math.max(tm.h, bm.h) > rowH - 24 + 1) throw Error(`${P.where}: text does not fit (${tm.lines.length} lines): ${String(it.title).slice(0, 55)}. Shorten or change layout.`);
      const ty = y + (rowH - Math.max(tm.h, bm.h)) / 2;
      if (numbered) P.text(String(i + 1), { x: M, y: ty, w: spanW(1), maxLines: 1, ...st, color: t.muted, role: 'label', numeric: true });
      P.text(it.title, { x: tx, y: ty, w: tw, maxLines: 3, ...st, role: 'body' });
      if (it.body) P.text(it.body, { x: colX(8), y: ty + Math.max(0, (st.size * st.lh - S.small.size * S.small.lh) / 2), w: spanW(5), maxLines: 3, ...S.small, color: t.muted, role: 'support' });
    });
    P.group = undefined;
    P.rule(M, REGION.y + n * rowH, 1152);
  },

  split({ s, t, S, P }) {
    const head = { size: 30, lh: S.ja ? 1.4 : 1.2, weight: 700, font: t.headingFont };
    const cols = [[s.leftTitle || (S.ja ? '背景' : 'Context'), s.leftBody, M], [s.rightTitle || (S.ja ? '示唆' : 'Implication'), s.rightBody, colX(7)]];
    cols.forEach(([title, body, x], i) => {
      P.group = i;
      P.rule(x, REGION.y, spanW(6), { stroke: t.ink, strokeWidth: 1.5 });
      const hn = P.text(title, { x, y: REGION.y + 24, w: spanW(6), maxLines: 2, ...head, role: 'body' });
      const y = hn.y + hn.h + 18;
      P.text(body ?? '', { x, y, w: spanW(6) - 12, h: RB - y, ...S.body, role: 'body' });
    });
    P.group = undefined;
  },

  metric({ s, t, S, P, warnings, where }) {
    const leftW = s.body ? spanW(7) : spanW(12);
    const label = P.text(s.label, { x: M, y: REGION.y, w: leftW, maxLines: 2, size: 24, lh: S.ja ? 1.45 : 1.3, weight: 700, font: t.headingFont, role: 'label' });
    const { number, unit } = splitValue(s.value);
    const vy = label.y + label.h + 12;
    const vn = P.runs([
      { text: number, size: 144, weight: 700, tracking: S.ja ? 0 : -0.02 },
      { text: unit ? (S.ja ? '' : ' ') + unit : '', size: 44, weight: 700, color: t.muted },
    ], { x: M, y: vy, w: leftW, lh: 1.08, font: t.headingFont, color: t.ink, name: 'value' });
    let y = vn.y + vn.h + 8;
    if (s.baseline) { const b = P.text(s.baseline, { x: M, y, w: leftW, maxLines: 2, ...S.small, color: t.muted, role: 'support' }); y = b.y + b.h; }
    if (s.body) P.text(s.body, { x: colX(8), y: REGION.y + 4, w: spanW(5), h: RB - REGION.y - 4, ...S.body, role: 'body' });
    if (s.breakdown) breakdownBars({ s, t, S, P, warnings, where }, { x: M, y: y + 36, w: leftW, bottom: RB });
  },

  metrics({ s, t, S, P, warnings, where }) {
    const items = normalizeItems(s.items, 2, 4, 'metrics');
    const n = items.length, span = 12 / n, w = spanW(span);
    const hi = highlightSet(s, items.map(it => it.label), warnings, where);
    const valueSize = n === 2 ? 136 : n === 3 ? 120 : 84;
    const lab = { size: 24, lh: S.ja ? 1.45 : 1.3, weight: 700, font: t.headingFont };
    const labH = Math.max(...items.map(it => P.measure(it.label, w, lab).h));
    const lh = 1.08, vy = REGION.y + 24 + labH + 8;
    items.forEach((it, i) => {
      P.group = i;
      const x = M + i * span * PITCH;
      P.rule(x, REGION.y, w, { stroke: t.ink, strokeWidth: 1.5 });
      P.text(it.label, { x, y: REGION.y + 24, w, maxLines: 2, ...lab, role: 'label' });
      const { number, unit } = splitValue(it.value);
      const color = hi.has(i) ? t.accent : t.ink;
      P.runs([
        { text: number, size: valueSize, weight: 700, tracking: S.ja ? 0 : -0.02 },
        { text: unit ? (S.ja ? '' : ' ') + unit : '', size: Math.round(valueSize * 0.32), weight: 700, color: hi.has(i) ? t.accent : t.muted },
      ], { x, y: vy, w, lh, font: t.headingFont, color, name: `value ${it.label}` });
      const ny = vy + valueSize * lh + 14;
      if (it.note) P.text(it.note, { x, y: ny, w: w - 8, h: RB - ny, ...S.small, color: t.muted, role: 'support' });
    });
    P.group = undefined;
  },

  quote({ s, t, S, P }) {
    const ja = S.ja, st = { size: ja ? 52 : 56, lh: ja ? 1.5 : 1.22, weight: 700, font: t.headingFont, balance: true };
    const raw = String(s.title).trim();
    const marked = /^[「『“"]/.test(raw);
    const [open, close] = marked ? ['', ''] : ja ? ['「', '」'] : ['“', '”'];
    const x = colX(2), w = spanW(10);
    const q = P.measure(raw + close, w, st);
    const attr = s.attribution ? P.measure((ja ? '' : '— ') + s.attribution, spanW(8), S.small) : null;
    const blockH = q.h + (attr ? 40 + attr.h : 0);
    const y = Math.max(96, Math.round(340 - blockH / 2));
    if (open) P.text(open, { x: x - textWidth(open, st.size, st) - (ja ? 0 : 4), y, w: textWidth(open, st.size, st) + 2, maxLines: 1, ...st, balance: false, role: 'quote-mark' });
    const qn = P.text(raw + close, { x, y, w, maxLines: 6, ...st, role: 'title' });
    if (attr) P.text((ja ? '' : '— ') + s.attribution, { x, y: qn.y + qn.h + 40, w: spanW(8), maxLines: 3, ...S.small, size: 22, color: t.muted, role: 'support' });
    if (y + blockH > 660) throw Error(`${P.where}: text does not fit (${q.lines.length} lines): ${raw.slice(0, 55)}. Shorten or change layout.`);
  },

  comparison({ s, t, S, P, warnings, where }) {
    // Options side by side. Optional `facts` ([label, value] pairs) line up across the options as
    // ruled rows; the recommended option (`highlight`) sits on a tinted panel marked in words.
    const items = normalizeItems(s.items, 2, 3, 'comparison');
    const n = items.length, gap = 24, boxW = (1200 - gap * (n - 1)) / n, pad = 24;
    const hi = highlightSet({ ...s, title: '' }, items.map(it => it.title), warnings, where);
    const head = { size: n === 2 ? 32 : 28, lh: S.ja ? 1.4 : 1.2, weight: 700, font: t.headingFont };
    const flag = S.ja ? '推奨' : 'Recommended';
    const w = boxW - 2 * pad;
    const flagH = hi.size ? S.label.size * S.label.lh + 8 : 0;
    const headH = Math.max(...items.map(it => P.measure(it.title, w, head).h));
    const facts = items.map(it => (Array.isArray(it.facts) ? it.facts : []));
    facts.flat().forEach(f => assert(Array.isArray(f) && f.length === 2, `${where}: facts are [label, value] pairs`));
    const rows = Math.max(...facts.map(f => f.length));
    const labW = rows ? Math.min(w * 0.4, Math.max(...facts.flat().map(f => textWidth(f[0], S.label.size))) + 24) : 0;
    const val = { size: 24, lh: S.ja ? 1.45 : 1.3, weight: 700 };
    const rowH = rows ? Math.max(52, ...facts.flat().map(f => P.measure(f[1], w - labW, val).h + 20)) : 0;
    items.forEach((it, i) => {
      P.group = i;
      const bx = 40 + i * (boxW + gap), x = bx + pad;
      if (hi.has(i)) P.rect(bx, REGION.y, boxW, REGION.h, { fill: t.tint, radius: Math.min(t.radius, 8), role: 'mark' });
      else P.rule(x, REGION.y, w, { stroke: t.ink, strokeWidth: 1.5 });
      let y = REGION.y + 28;
      if (hi.has(i)) P.text(flag, { x, y, w, maxLines: 1, ...S.label, weight: 700, color: t.accentText, role: 'label' });
      y += flagH;
      P.text(it.title, { x, y, w, maxLines: 2, ...head, role: 'body' });
      y += headH + 16;
      facts[i].forEach(([k, v], r) => {
        const ry = y + r * rowH;
        P.rule(x, ry, w, { stroke: hi.has(i) ? mix(t.line, t.accent, 0.25) : t.line });
        P.text(k, { x, y: ry + (rowH - S.label.size * S.label.lh) / 2, w: labW - 12, maxLines: 1, ...S.label, color: t.muted, role: 'label' });
        P.text(v, { x: x + labW, y: ry + 10, w: w - labW, h: rowH - 16, ...val, role: 'data' });
      });
      if (rows) y += rows * rowH + 20;
      if (it.body) P.text(it.body, { x, y, w, h: RB - 24 - y, ...S.body, role: 'body' });
    });
    P.group = undefined;
  },

  table(ctx) { tableLayout(ctx); },
  bar(ctx) { barChart(ctx); },
  line(ctx) { lineChart(ctx); },
  stacked(ctx) { stackedChart(ctx); },
  waterfall(ctx) { waterfallChart(ctx); },
  donut(ctx) { donutChart(ctx); },
  scatter(ctx) { scatterChart(ctx); },

  timeline({ s, t, S, P, warnings, where }) {
    const items = normalizeItems(s.items, 2, 5, 'timeline');
    const n = items.length, cw = 1152 / n, w = cw - 28;
    const hi = highlightSet({ ...s, title: '' }, items.map(it => it.date), warnings, where);
    const bare = !items.some(it => it.body);
    const sz = n <= 3 ? [30, bare ? 36 : 30, 24] : n === 4 ? [26, bare ? 32 : 28, 22] : [24, bare ? 28 : 26, 20];
    const date = { size: sz[0], lh: 1.3, weight: 700, font: t.headingFont };
    const head = { size: sz[1], lh: S.ja ? 1.4 : 1.2, weight: 700, font: t.headingFont };
    const body = { size: sz[2], lh: S.ja ? 1.6 : 1.4 };
    const dateH = Math.max(...items.map(it => P.measure(it.date, w, date).h));
    const headH = Math.max(...items.map(it => P.measure(it.title, w, head).h));
    const bodyH = Math.max(0, ...items.map(it => (it.body ? 10 + P.measure(it.body, w, body).h : 0)));
    // The axis spans the page; the block of dates, axis and descriptions sits a little above centre.
    const blockH = dateH + 26 + 30 + headH + bodyH;
    const axis = REGION.y + Math.max(28, Math.round((REGION.h - blockH) * 0.42)) + dateH + 26;
    P.line(M, axis, 1216, axis, { stroke: t.muted, strokeWidth: 2, role: 'axis' });
    items.forEach((it, i) => {
      P.group = i;
      const x = M + i * cw;
      P.ellipse(x + 8, axis, hi.has(i) ? 9 : 7, { fill: hi.has(i) ? t.accent : t.ink });
      P.text(it.date, { x, y: axis - 26 - dateH, w, maxLines: 2, ...date, color: hi.has(i) ? t.accentText : t.ink, role: 'label' });
      const hn = P.text(it.title, { x, y: axis + 30, w, maxLines: 3, ...head, role: 'body' });
      if (it.body) P.text(it.body, { x, y: hn.y + hn.h + 10, w, h: RB - (hn.y + hn.h + 10), ...body, color: t.muted, role: 'support' });
    });
    P.group = undefined;
  },

  process({ s, t, S, P }) {
    // A staircase: each step sits one tread lower than the last; the treads and risers form one
    // stepped rule ending in an arrow. The order reads at a glance and fills the evidence region.
    const items = normalizeItems(s.items, 2, 4, 'process');
    const n = items.length, gap = 40, cw = (1152 - gap * (n - 1)) / n, numbered = s.numbered === true;
    const head = { size: n <= 3 ? 36 : 30, lh: S.ja ? 1.4 : 1.2, weight: 700, font: t.headingFont };
    const body = { size: n <= 3 ? 24 : 22, lh: S.ja ? 1.65 : 1.45 };
    const numW = numbered ? Math.max(...items.map((_, i) => textWidth(String(i + 1), head.size, head))) + 16 : 0;
    const blocks = items.map(it => 22 + P.measure(it.title, cw - numW, head).h + (it.body ? 14 + P.measure(it.body, cw, body).h : 0));
    const lastH = blocks[n - 1];
    const rise = n > 1 ? Math.max(0, Math.min(150, (REGION.h - 8 - lastH) / (n - 1))) : 0;
    const tread = i => REGION.y + 8 + i * rise;
    items.forEach((it, i) => {
      // Each step carries the riser that leads into it and its own tread, so a sequential build
      // draws the staircase one step at a time.
      P.group = i;
      const x = M + i * (cw + gap), y = tread(i), xi = i ? x - gap / 2 : x;
      const riser = i ? [['M', xi, tread(i - 1)], ['L', xi, y]] : [['M', xi, y]];
      if (i < n - 1) P.path([...riser, ['L', x + cw + gap / 2, y]], { stroke: t.ink, strokeWidth: 1.5, role: 'rule', name: `step ${i + 1}` });
      else {
        P.path(riser, { stroke: t.ink, strokeWidth: 1.5, role: 'rule', name: `step ${i + 1} riser` });
        P.line(xi, y, x + cw, y, { stroke: t.ink, strokeWidth: 1.5, arrow: 'end', role: 'rule', name: 'last step' });
      }
      if (numbered) P.text(String(i + 1), { x, y: y + 22, w: numW, maxLines: 1, ...head, color: t.muted, role: 'label', numeric: true });
      const hn = P.text(it.title, { x: x + numW, y: y + 22, w: cw - numW, maxLines: 2, ...head, role: 'body' });
      if (it.body) {
        const by = hn.y + hn.h + 14;
        P.text(it.body, { x, y: by, w: cw, h: RB - by, ...body, role: 'body' });
      }
    });
    P.group = undefined;
  },

  matrix({ s, t, S, P }) {
    const items = normalizeItems(s.items, 4, 4, 'matrix');
    const ax = M + 12, top = REGION.y + 36, bottom = RB - 30, left = M + 28, right = 1216;
    const qw = (right - left) / 2, qh = (bottom - top) / 2;
    if (Number.isInteger(s.highlight) && s.highlight >= 0 && s.highlight < 4) P.rect(left + (s.highlight % 2) * qw, top + Math.floor(s.highlight / 2) * qh, qw, qh, { fill: t.tint, role: 'mark' });
    P.line(ax, bottom, ax, REGION.y + 8, { stroke: t.muted, strokeWidth: 1.5, arrow: 'end', role: 'axis' });
    P.line(ax, bottom, right, bottom, { stroke: t.muted, strokeWidth: 1.5, arrow: 'end', role: 'axis' });
    P.line(left + qw, top, left + qw, bottom, { stroke: t.line, role: 'rule' });
    P.line(left, top + qh, right, top + qh, { stroke: t.line, role: 'rule' });
    P.text(s.yLabel || (S.ja ? '縦軸 ↑' : 'Y ↑'), { x: ax + 16, y: REGION.y, w: spanW(6), maxLines: 1, ...S.label, color: t.muted, role: 'axis' });
    const xl = s.xLabel || (S.ja ? '横軸 →' : 'X →'), xw = Math.ceil(textWidth(xl, S.label.size)) + 4;
    P.text(xl, { x: right - xw, y: bottom + 6, w: xw, maxLines: 1, ...S.label, color: t.muted, align: 'right', role: 'axis' });
    const head = { size: 28, lh: S.ja ? 1.4 : 1.2, weight: 700, font: t.headingFont };
    items.forEach((it, i) => {
      P.group = i;
      const x = left + (i % 2) * qw + 28, y = top + Math.floor(i / 2) * qh + 24, w = qw - 56;
      const hn = P.text(it.title, { x, y, w, maxLines: 1, ...head, color: i === s.highlight ? t.accentText : t.ink, role: 'body' });
      if (it.body) P.text(it.body, { x, y: hn.y + hn.h + 8, w, h: qh - 24 - hn.h - 8 - 16, size: 22, lh: S.ja ? 1.6 : 1.4, role: 'body' });
    });
    P.group = undefined;
  },

  architecture(ctx) { architecture(ctx); },

  code({ s, t, S, P }) {
    const code = String(s.code ?? '').replace(/\t/g, '    ');
    const lines = code.split('\n');
    const st = lines.length <= 10 ? { size: 22, lh: 1.55, font: 'Consolas' } : { size: 20, lh: 1.45, font: 'Consolas' };
    const pw = s.explanation ? spanW(8) : spanW(12), inner = pw - 56;
    for (const l of lines) assert(textWidth(l, st.size, st) <= inner + 1, `${P.where}: text does not fit (1 lines): ${l.slice(0, 55)}. Shorten or change layout.`);
    const h = Math.min(REGION.h, lines.length * st.size * st.lh + 56);
    P.rect(M, REGION.y, pw, h, { fill: t.codeBg, radius: Math.min(t.radius, 8), role: 'mark' });
    P.push({ type: 'text', x: M + 28, y: REGION.y + 28, w: inner, h: h - 56, size: st.size, font: st.font, color: t.codeInk, weight: 400, align: 'left', text: code, lineHeight: st.lh, role: 'code' });
    assert(lines.length * st.size * st.lh <= REGION.h - 56 + 1, `${P.where}: text does not fit (${lines.length} lines): ${code.slice(0, 55)}. Shorten or change layout.`);
    if (s.explanation) P.text(s.explanation, { x: colX(9), y: REGION.y + 4, w: spanW(4), h: REGION.h - 4, ...S.body, role: 'body' });
  },

  equation({ s, t, S, P }) {
    const st = { size: 60, lh: 1.3, weight: 400, font: t.font };
    const eq = P.text(s.equation, { x: M, y: REGION.y + 56, w: 1152, maxLines: 2, ...st, role: 'data', numeric: true });
    P.rule(M, eq.y + eq.h + 36, spanW(12));
    if (s.body) P.text(s.body, { x: M, y: eq.y + eq.h + 68, w: spanW(9), h: RB - (eq.y + eq.h + 68), ...S.body, role: 'body' });
  },

  image({ s, t, S, P }) {
    assert(s.src && s.alt, 'image requires src and meaningful alt');
    const full = !s.body;
    P.push({ type: 'image', x: M, y: REGION.y, w: full ? 1152 : spanW(7), h: REGION.h, src: s.src, alt: s.alt, fit: s.fit || 'cover', role: 'data' });
    if (s.body) P.text(s.body, { x: colX(8), y: REGION.y + 4, w: spanW(5), h: REGION.h - 4, ...S.body, role: 'body' });
  },

  closing({ s, t, S, P }) {
    const st = { ...S.closing, font: t.headingFont, balance: true };
    const title = P.measure(s.title, spanW(11), st);
    const body = s.body ? P.measure(s.body, spanW(9), { ...S.lead, balance: true }) : null;
    const kick = s.kicker ? S.small.size * S.small.lh + 20 : 0;
    const blockH = kick + title.h + (body ? 40 + body.h : 0);
    let y = Math.max(96, Math.round(340 - blockH / 2));
    if (s.kicker) { P.text(s.kicker, { x: M, y, w: spanW(10), maxLines: 1, ...S.small, color: t.muted, role: 'kicker' }); y += kick; }
    const tn = P.text(s.title, { x: M, y, w: spanW(11), maxLines: 4, ...st, role: 'title' });
    if (s.body) P.text(s.body, { x: M, y: tn.y + tn.h + 40, w: spanW(9), maxLines: 3, ...S.lead, balance: true, role: 'support' });
    if (y + blockH - kick > 660) throw Error(`${P.where}: text does not fit (${title.lines.length} lines): ${s.title.slice(0, 55)}. Shorten or change layout.`);
  },

  freeform({ s, t, P, S }) {
    normalizeItems(s.elements, 1, 150, 'elements');
    // Colours may name a theme role instead of a hex value, so a custom page follows the theme.
    const role = v => (typeof v === 'string' && FREEFORM_COLORS.includes(v) ? t[v] : v);
    for (const raw of s.elements) {
      const n = { ...raw };
      for (const k of ['color', 'fill', 'stroke']) if (n[k] !== undefined) n[k] = role(n[k]);
      assert(['text', 'rect', 'ellipse', 'line', 'image', 'svg'].includes(n.type), 'invalid freeform type');
      if (n.type === 'text') {
        const { type, text, size, lineHeight, ...style } = n;
        P.text(text, { role: 'body', ...style, size: size || S.body.size, lh: lineHeight || 1.3 });
      } else P.push({ fill: n.type === 'line' ? 'none' : t.tint, stroke: n.type === 'line' ? t.line : 'none', strokeWidth: n.type === 'line' ? 1 : 0, role: 'mark', ...n });
    }
  },
};

// ------------------------------------------------------------------ table

function tableLayout({ s, t, S, P }) {
  const heads = normalizeItems(s.columns, 2, 6, 'columns');
  const rows = normalizeItems(s.rows, 1, 6, 'rows');
  rows.forEach(r => assert(Array.isArray(r) && r.length === heads.length, `${P.where}: ragged table`));
  const weights = s.widths || heads.map(() => 1);
  assert(weights.length === heads.length && weights.every(v => Number.isFinite(v) && v > 0), 'table widths must be positive');
  const total = weights.reduce((a, b) => a + b, 0);
  const cols = weights.map(v => (1152 * v) / total);
  const numeric = new Set(s.numericColumns || []);
  const pad = 16, dense = rows.length > 4;
  const head = { ...S.label, color: t.muted, weight: 400 };
  const cell = { size: dense ? 22 : 24, lh: S.ja ? 1.45 : 1.3 };
  const cellPad = j => [j === 0 ? 0 : pad, j === heads.length - 1 ? 0 : pad]; // left, right
  const fitCell = (v, j, st) => P.measure(String(v ?? ''), cols[j] - cellPad(j)[0] - cellPad(j)[1], st);
  const headLines = heads.map((h, j) => fitCell(h, j, head));
  const headH = Math.max(...headLines.map(m => m.h)) + 14;
  const bodyLines = rows.map(r => r.map((v, j) => fitCell(v, j, { ...cell, weight: j === 0 && !numeric.has(0) ? 700 : 400 })));
  const natural = bodyLines.map(r => Math.max(...r.map(m => m.h)) + 28);
  const share = (REGION.h - headH) / rows.length;
  const rowH = natural.map(h => Math.max(h, Math.min(share, 88)));
  const totalH = headH + rowH.reduce((a, b) => a + b, 0);
  if (totalH > REGION.h + 1) throw Error(`${P.where}: text does not fit (${rows.length} rows): ${String(rows.flat().join(' ')).slice(0, 55)}. Shorten or change layout.`);
  const hi = new Set((Array.isArray(s.highlight) ? s.highlight : [s.highlight]).filter(i => Number.isInteger(i) && i >= 0 && i < rows.length));
  const mkCell = (m, j, st, color) => ({ text: m.lines.join('\n'), size: st.size, lineHeight: st.lh, weight: st.weight || 400, color, align: numeric.has(j) ? 'right' : 'left', pad: cellPad(j), ...(numeric.has(j) ? { numeric: true } : {}) });
  P.push({
    type: 'table', x: M, y: REGION.y, w: 1152, h: round1(totalH), font: t.font, role: 'data',
    cols: cols.map(round1),
    rows: [
      { h: round1(headH), header: true, valign: 'bottom', cells: headLines.map((m, j) => mkCell(m, j, head, t.muted)), rule: { color: t.ink, width: 1.5 } },
      ...bodyLines.map((r, i) => ({
        h: round1(rowH[i]), valign: 'middle', ...(hi.has(i) ? { fill: t.tint } : {}),
        cells: r.map((m, j) => mkCell(m, j, { ...cell, weight: (j === 0 && !numeric.has(0)) || hi.has(i) ? 700 : 400 }, t.ink)),
        rule: i === rows.length - 1 ? { color: t.ink, width: 1.5 } : { color: t.line, width: 1 },
      })),
    ],
  });
}

// ------------------------------------------------------------------ charts

const chartData = ({ s, where }) => {
  const data = normalizeItems(s.data, 1, 12, 'chart data');
  assert(typeof s.unit === 'string', `${where}: chart unit required (use '' for dimensionless)`);
  return data;
};
const numFmt = (lang, extra = {}) => v => fmt(v, { locale: isCJK(lang) ? 'ja-JP' : 'en-US', ...extra });
function unitLabel({ s, t, S, P, ja }, x = M, y = REGION.y) {
  if (!s.unit) return 0;
  const text = ja ? `単位：${s.unit}` : s.unit;
  P.text(text, { x, y, w: spanW(6), maxLines: 1, ...S.label, color: t.muted, role: 'axis' });
  return S.label.size * S.label.lh;
}
/** Category labels under a band: at most two lines, centred. */
function categoryHeight(P, labels, w, st) { return Math.max(...labels.map(l => P.measure(l, w, st).h)); }

function barChart(ctx) {
  const { s, t, S, P, warnings, where, lang } = ctx;
  const data = chartData(ctx);
  data.forEach(d => assert(Number.isFinite(d.value), 'chart: finite numeric data required'));
  const hi = highlightSet(s, data.map(d => d.label), warnings, where);
  const f = numFmt(lang);
  const top = REGION.y + unitLabel(ctx) + 12;
  const n = data.length, step = 1152 / n, bw = clamp(step * 0.58, 16, 132);
  const cat = { ...S.label, color: t.ink };
  const catH = categoryHeight(P, data.map(d => d.label), step - 12, cat);
  const vals = data.map(d => d.value);
  const [lo, hiV] = niceDomain([Math.min(0, ...vals), Math.max(0, ...vals)], 5);
  const lab = { size: 22, lh: 1.25, weight: 700 }, labH = lab.size * lab.lh;
  const signed = lo < 0;
  // All positive: categories sit under the baseline. With losses, each category label hugs the
  // zero line on the side away from its bar, so a label never drifts far from its mark.
  const plotTop = top + labH + 8, plotBottom = signed ? RB - labH - 6 : RB - catH - 14;
  const y = v => plotBottom - ((v - lo) / (hiV - lo || 1)) * (plotBottom - plotTop);
  if (signed) assert(Math.min(y(0) - plotTop, plotBottom - y(0)) >= catH + 9, `${where}: text does not fit (2 lines): bar labels. Shorten or change layout.`);
  data.forEach((d, i) => {
    P.group = i;
    const x = M + i * step, cx = x + step / 2, y0 = y(0), y1 = y(d.value);
    const color = hi.size ? (hi.has(i) ? t.accent : t.context) : t.series;
    P.rect(cx - bw / 2, Math.min(y0, y1), bw, Math.abs(y1 - y0), { fill: color, role: 'mark', name: `bar ${d.label}` });
    const ly = d.value >= 0 ? y1 - labH - 4 : y1 + 4;
    P.text(f(d.value), { x, y: ly, w: step, maxLines: 1, ...lab, weight: hi.has(i) ? 700 : 400, color: hi.has(i) ? t.accentText : t.ink, align: 'center', role: 'data', numeric: true });
    const cy = !signed ? RB - catH : d.value < 0 ? y0 - P.measure(d.label, step - 12, cat).h - 8 : y0 + 8;
    P.text(d.label, { x: x + 6, y: cy, w: step - 12, maxLines: 2, ...cat, weight: hi.has(i) ? 700 : 400, align: 'center', role: 'axis' });
  });
  P.group = undefined;
  P.rule(M, y(0), 1152, { stroke: t.ink, strokeWidth: 1, role: 'axis' });
}

function lineChart(ctx) {
  const { s, t, S, P, warnings, where, lang } = ctx;
  const data = chartData(ctx);
  data.forEach(d => assert(Number.isFinite(d.value), 'chart: finite numeric data required'));
  const vals = data.map(d => d.value), f = numFmt(lang);
  const explicit = highlightSet(s, data.map(d => d.label), warnings, where);
  const hi = explicit.size ? explicit : new Set([data.length - 1]); // the latest value is "this" by default
  const [lo, hiV] = niceDomain([Math.min(0, ...vals), Math.max(0, ...vals)], 4);
  const tickVals = niceTicks(lo, hiV, 4);
  const tf = numFmt(lang, { digits: decimalsOfStep(niceStep(hiV - lo, 4)) });
  const tickW = Math.max(...tickVals.map(v => textWidth(tf(v), S.tick.size))) + 14;
  const top = REGION.y + unitLabel(ctx) + 18;
  const cat = { ...S.label, color: t.ink };
  const n = data.length, left = M + tickW, right = 1216, step = (right - left) / n;
  const catH = categoryHeight(P, data.map(d => d.label), step - 8, cat);
  const plotTop = top + 34, plotBottom = RB - catH - 14;
  const y = v => plotBottom - ((v - lo) / (hiV - lo || 1)) * (plotBottom - plotTop);
  const x = i => left + step * (i + 0.5);
  for (const v of tickVals) {
    if (v !== 0) P.rule(left, y(v), right - left, { stroke: t.grid, role: 'grid' });
    P.text(tf(v), { x: M, y: y(v) - S.tick.size * S.tick.lh / 2, w: tickW - 14, maxLines: 1, ...S.tick, color: t.muted, align: 'right', role: 'axis', numeric: true });
  }
  P.rule(left, y(0), right - left, { stroke: t.ink, role: 'axis' });
  P.path(data.map((d, i) => [i ? 'L' : 'M', x(i), y(d.value)]), { stroke: t.accent, strokeWidth: 3, role: 'mark', name: 'line' });
  const labelAll = n <= 8;
  data.forEach((d, i) => {
    P.group = i;
    const strong = hi.has(i);
    P.ellipse(x(i), y(d.value), strong ? 7 : 5, { fill: t.accent, stroke: t.paper, strokeWidth: strong ? 2 : 0 });
    if (labelAll || strong || i === 0 || i === n - 1) {
      const lab = { size: strong ? 22 : 18, lh: 1.25, weight: strong ? 700 : 400 };
      const prev = data[i - 1]?.value ?? d.value, next = data[i + 1]?.value ?? d.value;
      const below = d.value < prev && d.value < next; // a local minimum labels underneath
      const ly = below ? y(d.value) + 12 : y(d.value) - lab.size * lab.lh - 10;
      P.text(f(d.value), { x: x(i) - step / 2, y: ly, w: step, maxLines: 1, ...lab, color: strong ? t.accentText : t.ink, align: 'center', role: 'data', numeric: true });
    }
    P.text(d.label, { x: x(i) - step / 2 + 4, y: RB - catH, w: step - 8, maxLines: 2, ...cat, align: 'center', role: 'axis' });
  });
  P.group = undefined;
}
function decimalsOfStep(step) { const s = String(step); return s.includes('e-') ? Number(s.split('e-')[1]) : (s.split('.')[1] || '').length; }

function stackedChart(ctx) {
  const { s, t, S, P, warnings, where, lang } = ctx;
  const data = chartData(ctx);
  const vals = data.map(d => {
    assert(Array.isArray(d.values) && d.values.length >= 1 && d.values.length <= 4, 'stacked: 1–4 series');
    d.values.forEach(v => assert(Number.isFinite(v) && v >= 0, 'stacked: nonnegative finite values'));
    return d.values.reduce((a, b) => a + b, 0);
  });
  vals.forEach(v => assert(Number.isFinite(v), 'chart: finite numeric data required'));
  const series = normalizeItems(s.series, 1, 4, 'series');
  assert(data.every(d => d.values.length === series.length), 'stacked: series length mismatch');
  const hi = highlightSet(s, series, warnings, where);
  const greys = [t.series, t.context, t.greys[0], t.greys[1]];
  let g = 0;
  const colors = series.map((_, j) => (hi.has(j) ? t.accent : hi.size ? [t.context, t.greys[0], t.greys[1], t.greys[2]][g++] : greys[g++]));
  const f = numFmt(lang);
  const top = REGION.y + unitLabel(ctx) + 12;
  const labelW = Math.min(220, Math.max(...series.map(n => textWidth(n, S.label.size, { weight: 700 }))) + 28);
  const n = data.length, plotW = 1152 - labelW, step = plotW / n, bw = clamp(step * 0.56, 16, 120);
  const cat = { ...S.label, color: t.ink };
  const catH = categoryHeight(P, data.map(d => d.label), step - 12, cat);
  const [, hiV] = niceDomain([0, Math.max(...vals)], 5);
  const tot = { size: 22, lh: 1.25, weight: 700 };
  const plotTop = top + tot.size * tot.lh + 8, plotBottom = RB - catH - 14;
  const y = v => plotBottom - (v / (hiV || 1)) * (plotBottom - plotTop);
  let lastSegments = [];
  data.forEach((d, i) => {
    P.group = i;
    const cx = M + i * step + step / 2;
    let sum = 0;
    d.values.forEach((v, j) => {
      const y1 = y(sum + v), y0 = y(sum);
      if (v > 0) P.rect(cx - bw / 2, y1, bw, y0 - y1 - (y0 - y1 > 3 ? 1.5 : 0), { fill: colors[j], role: 'mark', name: `${series[j]} ${d.label}` });
      const segH = y0 - y1, lab = f(v);
      if (v > 0 && segH >= 26 && textWidth(lab, 16) <= bw - 8) {
        const on = contrast(t.paper, colors[j]) >= contrast(t.ink, colors[j]) ? t.paper : t.ink;
        P.text(lab, { x: cx - bw / 2, y: (y0 + y1) / 2 - 10.5, w: bw, maxLines: 1, size: 16, lh: 1.3, color: on, align: 'center', role: 'data', numeric: true });
      }
      if (i === n - 1) lastSegments.push({ j, y: (y0 + y1) / 2, h: S.label.size * S.label.lh });
      sum += v;
    });
    P.text(f(vals[i]), { x: cx - step / 2, y: y(vals[i]) - tot.size * tot.lh - 6, w: step, maxLines: 1, ...tot, align: 'center', role: 'data', numeric: true });
    P.text(d.label, { x: cx - step / 2 + 6, y: RB - catH, w: step - 12, maxLines: 2, ...cat, align: 'center', role: 'axis' });
  });
  P.group = undefined;
  P.rule(M, y(0), plotW, { stroke: t.ink, role: 'axis' });
  // Direct series labels beside the last bar replace a legend.
  const lx = M + plotW - step / 2 + bw / 2 + 16;
  const placed = spreadLabels(lastSegments.map(l => ({ id: l.j, y: l.y, h: l.h })), { min: plotTop, max: plotBottom, gap: 4 });
  for (const p of placed) {
    P.text(series[p.id], { x: lx, y: p.y - p.h / 2, w: 1216 - lx, maxLines: 1, ...S.label, weight: hi.has(p.id) ? 700 : 400, color: hi.has(p.id) ? t.accentText : t.ink, role: 'label' });
  }
}

function waterfallChart(ctx) {
  const { s, t, S, P, warnings, where, lang } = ctx;
  const data = chartData(ctx);
  data.forEach(d => assert(Number.isFinite(d.value), 'chart: finite numeric data required'));
  const hi = highlightSet(s, data.map(d => d.label), warnings, where);
  let running = 0;
  const spans = data.map(d => { const before = d.total ? 0 : running; running = d.total ? d.value : running + d.value; return [before, running]; });
  const all = spans.flat();
  const [lo, hiV] = niceDomain([Math.min(0, ...all), Math.max(0, ...all)], 5);
  const f = numFmt(lang), fs = numFmt(lang, { sign: true });
  const top = REGION.y + unitLabel(ctx) + 12;
  const n = data.length, step = 1152 / n, bw = clamp(step * 0.6, 16, 128);
  const cat = { ...S.label, color: t.ink };
  const catH = categoryHeight(P, data.map(d => d.label), step - 12, cat);
  const lab = { size: 22, lh: 1.25 };
  const plotTop = top + lab.size * lab.lh + 8, plotBottom = RB - catH - 14 - (lo < 0 ? 34 : 0);
  const y = v => plotBottom - ((v - lo) / (hiV - lo || 1)) * (plotBottom - plotTop);
  data.forEach((d, i) => {
    P.group = i;
    const [a, b] = spans[i], cx = M + i * step + step / 2;
    const color = hi.has(i) ? t.accent : d.total ? t.ink : t.context;
    P.rect(cx - bw / 2, y(Math.max(a, b)), bw, Math.max(1, Math.abs(y(a) - y(b))), { fill: color, role: 'mark', name: `step ${d.label}` });
    if (i < n - 1) P.line(cx + bw / 2, y(b), cx + step - bw / 2, y(b), { stroke: t.muted, strokeWidth: 1, dash: true, role: 'connector' });
    const text = d.total ? f(d.value) : fs(d.value);
    const above = d.total ? d.value >= 0 : true;
    const ly = above ? y(Math.max(a, b)) - lab.size * lab.lh - 4 : y(Math.min(a, b)) + 4;
    P.text(text, { x: cx - step / 2, y: ly, w: step, maxLines: 1, ...lab, weight: d.total || hi.has(i) ? 700 : 400, color: hi.has(i) ? t.accentText : t.ink, align: 'center', role: 'data', numeric: true });
    P.text(d.label, { x: cx - step / 2 + 6, y: RB - catH, w: step - 12, maxLines: 2, ...cat, weight: d.total ? 700 : 400, align: 'center', role: 'axis' });
  });
  P.group = undefined;
  P.rule(M, y(0), 1152, { stroke: t.ink, role: 'axis' });
}

function donutChart(ctx) {
  const { s, t, S, P, warnings, where, lang, ja } = ctx;
  const data = chartData(ctx);
  assert(data.length <= 6, 'donut: max 6 parts');
  data.forEach(d => assert(Number.isFinite(d.value) && d.value >= 0, 'donut: nonnegative numeric values'));
  const sum = data.reduce((a, d) => a + d.value, 0);
  assert(sum > 0, 'donut: positive total required');
  const hi = highlightSet(s, data.map(d => d.label), warnings, where);
  const pct = data.map(d => (d.value / sum) * 100);
  const digits = pct.every(p => Math.abs(p - Math.round(p)) < 1e-9) || Math.round(pct.reduce((a, p) => a + Math.round(p), 0)) === 100 ? 0 : 1;
  const f = numFmt(lang);
  const cx = 640, cy = REGION.y + REGION.h / 2 + 6, r = 178, r0 = 118;
  // Parts that are not "this" take greys from dark to light in data order.
  let g = 0;
  const greys = [t.context, t.greys[0], t.greys[1], t.greys[2], t.greys[3], t.greys[3]];
  const colors = data.map((_, i) => (hi.has(i) ? t.accent : hi.size ? greys[g++] : [t.series, ...greys][g++]));
  let a = -90;
  const labels = [];
  data.forEach((d, i) => {
    P.group = i;
    const sweep = (d.value / sum) * 360;
    if (sweep > 0) {
      const gap = data.filter(x => x.value > 0).length > 1 ? Math.min(1.2, sweep / 4) : 0;
      // Each part is a closed ring sector; a 100% part becomes two half rings.
      const pieces = sweep >= 359.99 ? [[a, a + 180], [a + 180, a + 360]] : [[a + gap / 2, a + sweep - gap / 2]];
      for (const [p0, p1] of pieces) {
        const rad = v => (v * Math.PI) / 180;
        P.path([
          ['M', cx + r * Math.cos(rad(p0)), cy + r * Math.sin(rad(p0))], ['A', cx, cy, r, p0, p1],
          ['L', cx + r0 * Math.cos(rad(p1)), cy + r0 * Math.sin(rad(p1))], ['A', cx, cy, r0, p1, p0], ['Z'],
        ], { fill: colors[i], role: 'mark', name: `part ${d.label}` });
      }
      const mid = ((a + sweep / 2) * Math.PI) / 180;
      labels.push({ i, mid, side: Math.cos(mid) >= 0 ? 1 : -1, y: cy + Math.sin(mid) * (r + 30) });
    }
    a += sweep;
  });
  P.group = undefined;
  // Labels beside the ring: percentage over name, spread per side so they never collide.
  const pctSt = { size: 26, lh: 1.15, weight: 700 }, nameSt = { ...S.label };
  const blockH = pctSt.size * pctSt.lh + nameSt.size * nameSt.lh;
  for (const side of [1, -1]) {
    const mine = labels.filter(l => l.side === side);
    const placed = spreadLabels(mine.map(l => ({ id: l.i, y: l.y, h: blockH })), { min: REGION.y, max: RB, gap: 10 });
    for (const p of placed) {
      const l = mine.find(m => m.i === p.id), d = data[p.id], strong = hi.has(p.id);
      const ex = cx + Math.cos(l.mid) * (r + 6), ey = cy + Math.sin(l.mid) * (r + 6);
      const lx = cx + side * (r + 56);
      P.path([['M', ex, ey], ['L', cx + Math.cos(l.mid) * (r + 22), p.y], ['L', lx - side * 8, p.y]], { stroke: t.muted, strokeWidth: 1, role: 'connector' });
      const w = 300, x = side > 0 ? lx : lx - w;
      const pctText = `${fmt(pct[p.id], { digits, locale: 'en-US' })}%`;
      P.group = p.id;
      P.text(pctText, { x, y: p.y - blockH / 2, w, maxLines: 1, ...pctSt, color: strong ? t.accentText : t.ink, align: side > 0 ? 'left' : 'right', role: 'data', numeric: true });
      P.text(/^[%％]$/.test(s.unit) ? d.label : `${d.label}${ja ? '　' : '  '}${f(d.value)}${s.unit}`, { x, y: p.y - blockH / 2 + pctSt.size * pctSt.lh, w, maxLines: 1, ...nameSt, weight: strong ? 700 : 400, color: t.ink, align: side > 0 ? 'left' : 'right', role: 'label' });
    }
  }
  P.group = undefined;
  // The centre explains the whole.
  const total = s.center || `${f(sum)}${s.unit && !/^[%％]$/.test(s.unit) ? s.unit : ''}`;
  const cap = s.centerLabel || (ja ? '合計' : 'Total');
  const cst = { size: 40, lh: 1.15, weight: 700, font: t.headingFont };
  P.text(total, { x: cx - r0 + 8, y: cy - 34, w: 2 * r0 - 16, maxLines: 1, ...cst, align: 'center', role: 'data', numeric: true });
  P.text(cap, { x: cx - r0 + 12, y: cy + 14, w: 2 * r0 - 24, maxLines: 2, ...S.tick, color: t.muted, align: 'center', role: 'label' });
}

function scatterChart(ctx) {
  const { s, t, S, P, warnings, where, lang, ja } = ctx;
  const data = chartData(ctx);
  data.forEach(d => assert(Number.isFinite(d.y), 'chart: finite numeric data required'));
  data.forEach(d => assert(Number.isFinite(d.x), 'scatter: finite x values'));
  const hi = highlightSet(s, data.map(d => d.label ?? ''), warnings, where);
  const xs = data.map(d => d.x), ys = data.map(d => d.y);
  const [x0, x1] = niceDomain([Math.min(0, ...xs), Math.max(...xs, 0) || 1], 5);
  const [y0, y1] = niceDomain([Math.min(0, ...ys), Math.max(...ys, 0) || 1], 4);
  const xt = niceTicks(x0, x1, 5), yt = niceTicks(y0, y1, 4);
  const xf = numFmt(lang, { digits: decimalsOfStep(niceStep(x1 - x0, 5)) }), yf = numFmt(lang, { digits: decimalsOfStep(niceStep(y1 - y0, 4)) });
  const tickW = Math.max(...yt.map(v => textWidth(yf(v), S.tick.size))) + 14;
  const top = REGION.y + unitLabel(ctx, M) + 16;
  const left = M + tickW, right = 1216 - 16, bottom = RB - 30 - S.label.size * S.label.lh - 6;
  const X = v => left + ((v - x0) / (x1 - x0 || 1)) * (right - left);
  const Y = v => bottom - ((v - y0) / (y1 - y0 || 1)) * (bottom - top);
  for (const v of yt) {
    P.rule(left, Y(v), right - left, { stroke: v === 0 ? t.ink : t.grid, role: v === 0 ? 'axis' : 'grid' });
    P.text(yf(v), { x: M, y: Y(v) - 10.5, w: tickW - 14, maxLines: 1, ...S.tick, color: t.muted, align: 'right', role: 'axis', numeric: true });
  }
  for (const v of xt) {
    P.line(X(v), top, X(v), bottom, { stroke: v === 0 ? t.ink : t.grid, role: v === 0 ? 'axis' : 'grid' });
    P.text(xf(v), { x: X(v) - 40, y: bottom + 8, w: 80, maxLines: 1, ...S.tick, color: t.muted, align: 'center', role: 'axis', numeric: true });
  }
  const xl = s.xLabel || 'X', xw = Math.ceil(textWidth(xl, S.label.size)) + 4;
  P.text(xl, { x: right - xw, y: RB - S.label.size * S.label.lh, w: xw, maxLines: 1, ...S.label, color: t.muted, align: 'right', role: 'axis' });
  // Points first, then labels placed where they collide with nothing already on the plot.
  const pts = data.map((d, i) => ({ i, x: X(d.x), y: Y(d.y), r: hi.has(i) ? 9 : 7 }));
  pts.forEach(p => { P.group = p.i; P.ellipse(p.x, p.y, p.r, { fill: hi.has(p.i) ? t.accent : hi.size ? t.context : t.series, name: `point ${data[p.i].label ?? p.i + 1}` }); });
  const boxes = pts.map(p => ({ x: p.x - p.r, y: p.y - p.r, w: 2 * p.r, h: 2 * p.r }));
  const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const lab = { ...S.label };
  for (const p of pts) {
    const d = data[p.i];
    if (d.label === undefined || d.label === '') continue;
    const strong = hi.has(p.i), st = { ...lab, weight: strong ? 700 : 400 };
    const w = Math.ceil(textWidth(String(d.label), st.size, st)) + 4, h = st.size * st.lh, o = p.r + 6;
    const cands = [[o, -h / 2], [-o - w, -h / 2], [-w / 2, -o - h], [-w / 2, o], [o, -h - 2], [o, 2], [-o - w, -h - 2], [-o - w, 2]]
      .map(([dx, dy]) => ({ x: p.x + dx, y: p.y + dy, w, h }))
      .filter(b => b.x >= M && b.x + b.w <= 1216 && b.y >= top - 10 && b.y + b.h <= bottom + 2);
    const best = cands.find(b => !boxes.some(o2 => hit(b, o2))) || cands[0] || { x: p.x + o, y: p.y - h / 2, w, h };
    boxes.push(best);
    P.group = p.i;
    P.text(String(d.label), { x: best.x, y: best.y, w, maxLines: 1, ...st, color: strong ? t.accentText : t.ink, role: 'label' });
  }
  P.group = undefined;
}

/** Metric breakdown: signed parts as horizontal bars from one zero line, labelled at their ends. */
function breakdownBars({ s, t, S, P, warnings, where }, box) {
  const parts = normalizeItems(s.breakdown, 1, 5, 'breakdown');
  parts.forEach(p => assert(Number.isFinite(p.value) && typeof p.label === 'string', 'breakdown: {label, value} with finite values'));
  const hi = highlightSet({ ...s, title: '' }, parts.map(p => p.label), warnings, where);
  const vals = parts.map(p => p.value);
  const lo = Math.min(0, ...vals), hiV = Math.max(0, ...vals);
  const st = { ...S.small }, valSt = { size: 22, lh: 1.3, weight: 700 };
  const labelW = Math.min(220, Math.max(...parts.map(p => textWidth(p.label, st.size))) + 20);
  const unit = s.breakdownUnit ?? '';
  const signed = vals.some(v => v < 0);
  const sf = v => fmt(v, { sign: signed, locale: 'en-US' }) + unit;
  const valW = Math.max(...parts.map(p => textWidth(sf(p.value), valSt.size, valSt))) + 14;
  const x0 = box.x + labelW, x1 = box.x + box.w - valW;
  const X = v => x0 + (lo < 0 ? valW + 4 : 0) + ((v - lo) / (hiV - lo || 1)) * (x1 - x0 - (lo < 0 ? valW + 4 : 0));
  const rowH = 48;
  assert(box.y + parts.length * rowH <= box.bottom + 1, `${P.where}: text does not fit (${parts.length} rows): breakdown. Shorten or change layout.`);
  parts.forEach((p, i) => {
    P.group = i;
    const y = box.y + i * rowH, xa = X(0), xb = X(p.value);
    P.text(p.label, { x: box.x, y: y + 8, w: labelW - 16, maxLines: 1, ...st, role: 'label' });
    P.rect(Math.min(xa, xb), y + 8, Math.max(1, Math.abs(xb - xa)), 32, { fill: hi.has(i) ? t.accent : t.context, role: 'mark', name: `part ${p.label}` });
    const tx = p.value >= 0 ? xb + 10 : xb - valW - 4;
    P.text(sf(p.value), { x: tx, y: y + 9, w: valW - 6, maxLines: 1, ...valSt, color: hi.has(i) ? t.accentText : t.ink, align: p.value >= 0 ? 'left' : 'right', role: 'data', numeric: true });
  });
  P.group = undefined;
  P.line(X(0), box.y, X(0), box.y + parts.length * rowH, { stroke: t.ink, strokeWidth: 1, role: 'axis' });
}

// ------------------------------------------------------------------ architecture

function architecture({ s, t, S, P }) {
  const nodes = normalizeItems(s.nodes, 1, 12, 'nodes').map(n => ({ ...n }));
  const map = new Map(nodes.map(n => [n.id, n]));
  assert(map.size === nodes.length, 'duplicate node IDs');
  // Nodes without coordinates are laid out on a grid: `col`/`row` if given, else one row.
  if (nodes.some(n => ![n.x, n.y, n.w, n.h].every(Number.isFinite))) {
    const cols = Math.max(...nodes.map((n, i) => (Number.isInteger(n.col) ? n.col : i))) + 1;
    const rows = Math.max(...nodes.map(n => (Number.isInteger(n.row) ? n.row : 0))) + 1;
    const col = (n, i) => (Number.isInteger(n.col) ? n.col : i), row = n => (Number.isInteger(n.row) ? n.row : 0);
    // Each gap between neighbouring columns is wide enough for the label on the link it carries.
    const gaps = Array(Math.max(0, cols - 1)).fill(72);
    for (const l of s.links || []) {
      const ia = nodes.findIndex(n => n.id === l.from), ib = nodes.findIndex(n => n.id === l.to);
      if (!l.label || ia < 0 || ib < 0 || row(nodes[ia]) !== row(nodes[ib]) || Math.abs(col(nodes[ia], ia) - col(nodes[ib], ib)) !== 1) continue;
      const g = Math.min(col(nodes[ia], ia), col(nodes[ib], ib));
      gaps[g] = Math.max(gaps[g], textWidth(l.label, S.label.size) + 40);
    }
    const nw = Math.min(300, (1152 - gaps.reduce((a, b) => a + b, 0)) / cols), gy = REGION.h / rows, nh = Math.min(140, gy - 72);
    const x0 = M + (1152 - nw * cols - gaps.reduce((a, b) => a + b, 0)) / 2;
    nodes.forEach((n, i) => {
      const c = col(n, i), r = row(n);
      Object.assign(n, { x: x0 + c * nw + gaps.slice(0, c).reduce((a, b) => a + b, 0), y: REGION.y + r * gy + (gy - nh) / 2, w: nw, h: nh });
    });
  }
  for (const link of s.links || []) {
    const a = map.get(link.from), b = map.get(link.to);
    assert(a && b, 'architecture: unknown endpoint');
    const ac = [a.x + a.w / 2, a.y + a.h / 2], bc = [b.x + b.w / 2, b.y + b.h / 2];
    const dx = bc[0] - ac[0], dy = bc[1] - ac[1];
    const edge = (n, c, sign, pad) => { const k = Math.min((n.w / 2 + pad) / (Math.abs(dx) || 1e-9), (n.h / 2 + pad) / (Math.abs(dy) || 1e-9)); return [c[0] + sign * dx * k, c[1] + sign * dy * k]; };
    const p0 = edge(a, ac, 1, 4), p1 = edge(b, bc, -1, 6);
    P.line(p0[0], p0[1], p1[0], p1[1], { stroke: t.muted, strokeWidth: 2, arrow: link.arrow === false ? undefined : 'end', ...(link.dashed ? { dash: true } : {}), role: 'connector' });
    if (link.label) {
      // The label sits beside the link's midpoint, pushed along the normal until its box clears
      // the line: above a level or slanted link, to the right of an upright one.
      const st = { ...S.label, color: t.muted }, lw = Math.ceil(textWidth(link.label, st.size)) + 8, lh = st.size * st.lh;
      const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1;
      let nx = -(p1[1] - p0[1]) / len, ny = (p1[0] - p0[0]) / len;
      if (Math.abs(ny) > 1e-6 ? ny > 0 : nx < 0) { nx = -nx; ny = -ny; }
      const off = Math.abs(nx) * lw / 2 + Math.abs(ny) * lh / 2 + 6;
      const cx = (p0[0] + p1[0]) / 2 + nx * off, cy = (p0[1] + p1[1]) / 2 + ny * off;
      P.text(link.label, { x: cx - lw / 2, y: cy - lh / 2, w: lw, maxLines: 1, ...st, align: 'center', role: 'label' });
    }
  }
  for (const n of nodes) {
    P.rect(n.x, n.y, n.w, n.h, { fill: n.accent ? t.tint : t.paper, stroke: n.accent ? t.accent : t.context, strokeWidth: 1.5, radius: Math.min(t.radius, 8), role: 'mark', name: `node ${n.label}` });
    const head = { size: 24, lh: S.ja ? 1.35 : 1.2, weight: 700, font: t.headingFont };
    const lm = P.measure(n.label, n.w - 32, head);
    const bm = n.body ? P.measure(n.body, n.w - 32, S.label) : null;
    const blockH = lm.h + (bm ? 6 + bm.h : 0);
    if (blockH > n.h - 16 + 1) throw Error(`${P.where}: text does not fit (${lm.lines.length} lines): ${n.label}. Shorten or change layout.`);
    const y = n.y + (n.h - blockH) / 2;
    P.text(n.label, { x: n.x + 16, y, w: n.w - 32, maxLines: 3, ...head, align: 'center', role: 'body' });
    if (n.body) P.text(n.body, { x: n.x + 16, y: y + lm.h + 6, w: n.w - 32, maxLines: 3, ...S.label, color: t.muted, align: 'center', role: 'support' });
  }
}

// ------------------------------------------------------------------ builds, validation, warnings

/** Reveal groups are explicit. Step 0 is visible immediately; static exports show every step. */
function applyBuilds(s, e) {
  for (const n of e) n.step ??= 0;
  const content = n => !['title', 'quote-mark', 'kicker', 'source', 'chrome'].includes(n.role);
  if (s.reveal) {
    assert(Array.isArray(s.reveal), 'reveal must be a list of element IDs');
    for (const [i, id] of s.reveal.entries()) { const n = e.find(x => x.id === id); assert(n, `unknown reveal element ${id}`); n.step = i + 1; }
  }
  if (s.build === 'content') for (const n of e) if (content(n)) n.step = 1;
  if (s.build === 'sequential') {
    // Items (columns, steps, bars) appear one by one; shared scaffolding comes with the first.
    const groups = [...new Set(e.filter(n => content(n) && Number.isInteger(n.group)).map(n => n.group))].sort((a, b) => a - b);
    if (groups.length) for (const n of e) { if (content(n)) n.step = Number.isInteger(n.group) ? groups.indexOf(n.group) + 1 : 1; }
    else { // free compositions: one step per distinct left edge, as before
      const stages = [...new Set(e.filter(content).map(n => n.x))].sort((a, b) => a - b);
      for (const n of e) if (content(n)) n.step = stages.indexOf(n.x) + 1;
    }
  }
}

function validateElements(e, where) {
  assert(new Set(e.map(n => n.id)).size === e.length, `${where}: duplicate element IDs`);
  const color = (v, k) => assert(v === 'none' || /^#[a-f\d]{6}$/i.test(v), `${where}: invalid ${k}`);
  for (const n of e) {
    n.step ??= 0;
    for (const c of ['color', 'fill', 'stroke']) if (n[c] !== undefined) color(n[c], c);
    if (n.type === 'table') for (const r of n.rows) { if (r.fill) color(r.fill, 'fill'); if (r.rule) color(r.rule.color, 'stroke'); for (const c of r.cells) color(c.color, 'color'); }
    if (n.runs !== undefined) {
      assert(Array.isArray(n.runs), `${where}: runs must be a list`);
      for (const r of n.runs) {
        assert(r && typeof r.text === 'string', `${where}: invalid run text`);
        color(r.color, 'run color');
        assert(Number.isFinite(r.size) && r.size > 0, `${where}: invalid run size`);
        assert(Number.isFinite(r.weight) && r.weight >= 1 && r.weight <= 1000, `${where}: invalid run weight`);
        if (r.tracking !== undefined) assert(Number.isFinite(r.tracking), `${where}: invalid run tracking`);
      }
    }
    if (n.font) assert(/^[\p{L}\p{N} _,.-]+$/u.test(n.font), `${where}: invalid font`);
    assert(Number.isInteger(n.step) && n.step >= 0, `${where}: step must be a nonnegative integer`);
    for (const k of ['x', 'y', 'w', 'h']) assert(Number.isFinite(n[k]), `${where}: invalid ${n.id}.${k}`);
    assert(n.w >= 0 && n.h >= 0, `${where}: negative bounds`);
    assert(n.x >= 0 && n.y >= 0 && n.x + n.w <= W + 1 && n.y + n.h <= H + 1, `${where}: ${n.id} outside canvas`);
  }
}

/** Reading sizes: labels >= 16 px, body copy >= 20 px, footer >= 15 px (freeform can go below). */
function sizeWarnings(e, where, warnings) {
  const small = e.filter(n => n.type === 'text' && n.size < (n.role === 'source' ? 15 : 16));
  if (small.length) warnings.push(`${where}: supporting type reaches ${Math.min(...small.map(n => n.size))}px; review for viewing distance`);
  const body = e.filter(n => n.type === 'text' && n.role === 'body' && n.size < 20);
  if (body.length) warnings.push(`${where}: body copy at ${Math.min(...body.map(n => n.size))}px; use 20px or more`);
}

// ------------------------------------------------------------------ assets

export async function embedAssets(scene, base) {
  for (const s of scene.slides) for (const n of s.elements) {
    if (n.type === 'image') {
      assert(!/^https?:/i.test(n.src), 'Download image sources locally first; remote fetch is not implicit');
      if (!n.src.startsWith('data:')) {
        const bytes = await fs.readFile(path.resolve(base, n.src));
        const ext = path.extname(n.src).toLowerCase();
        const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' }[ext];
        assert(mime, 'Unsupported image type');
        n.src = `data:${mime};base64,${bytes.toString('base64')}`;
      }
    }
    if (n.type === 'svg') {
      assert(typeof n.svg === 'string' && n.svg.includes('<svg'), 'svg element requires svg markup');
      assert(!/<script|on\w+\s*=|<foreignObject|(?:href|src)\s*=\s*["'](?:https?:|javascript:)/i.test(n.svg), 'Active/external SVG is not accepted');
      n.src = 'data:image/svg+xml;base64,' + Buffer.from(n.svg).toString('base64');
    }
  }
  return scene;
}
