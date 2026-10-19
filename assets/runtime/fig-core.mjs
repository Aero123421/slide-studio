/**
 * Slide Studio figure engine — core primitives.
 *
 * Deterministic SVG strings from data: no DOM, no dependencies, no randomness.
 * Marks, labels and headline numbers should all be derived from the same data,
 * so changing a value changes every place it appears.
 *
 * Colors are role tokens (ink, muted, accent, cat-1 …). They resolve either to
 * CSS custom properties with literal fallbacks (default, so the page's color
 * system drives the figure) or to literal hex values (standalone .svg files for
 * Figma, Keynote, PowerPoint and Illustrator).
 *
 * Geometry is in viewBox units. Render a figure at roughly 1:1 on the slide so
 * a 16-unit label really is 16 px on a 1280×720 canvas.
 */

// ---------------------------------------------------------------- fonts & theme

export const FONT = {
  sans: '"Inter","Helvetica Neue","Segoe UI","Hiragino Sans","Noto Sans JP","Yu Gothic",system-ui,sans-serif',
  serif: '"Iowan Old Style","Charter","Bitstream Charter",Georgia,"Hiragino Mincho ProN","Noto Serif JP","Yu Mincho",serif',
  mono: '"JetBrains Mono","SFMono-Regular",Menlo,Consolas,"DejaVu Sans Mono",monospace',
};

/** Neutral literal palette used as CSS fallbacks and for standalone files. */
export const DEFAULT_THEME = Object.freeze({
  paper: '#ffffff', surface: '#f3f5f8', ink: '#17202b', muted: '#5a6676', rule: '#d5dbe3', grid: '#e7ebf0',
  accent: '#2457c5', onAccent: '#ffffff', positive: '#2c7a4b', negative: '#b5432f',
  highlight: '#2457c5', context: '#c3cad4',
  cat: ['#2457c5', '#d9822b', '#7a58a6', '#3d8c58', '#c2465b', '#5c6b7b', '#b39223', '#2f8f9b'],
  seq: ['#e9effb', '#bdcff2', '#86a6e4', '#4a76d1', '#2550a8', '#183670', '#0e2246'],
  div: ['#a8361f', '#d9775f', '#f1c4b6', '#f4f2ef', '#bccdf0', '#6e93dd', '#2457c5'],
  fontSans: FONT.sans, fontSerif: FONT.serif, fontMono: FONT.mono, fontDisplay: FONT.sans,
});

const VAR = {
  paper: '--ss-paper', surface: '--ss-surface', ink: '--ss-ink', muted: '--ss-muted', rule: '--ss-rule',
  grid: '--ss-grid', accent: '--ss-accent', onAccent: '--ss-on-accent', positive: '--ss-positive',
  negative: '--ss-negative', highlight: '--ss-highlight', context: '--ss-context',
  fontSans: '--ss-font-sans', fontSerif: '--ss-font-serif', fontMono: '--ss-font-mono', fontDisplay: '--ss-font-display',
};

/**
 * Resolve a theme. `'css'` (default) emits `var(--ss-*, fallback)`; an object
 * (partial DEFAULT_THEME shape, or a color-system JSON) emits literal values.
 * Returned helpers: t.c(role), t.cat(i), t.seq(i), t.div(i), t.font(kind).
 */
export function theme(input = 'css') {
  if (input && input.__theme) return input;
  const literal = input && typeof input === 'object';
  const base = literal ? { ...DEFAULT_THEME, ...fromColorSystem(input) } : DEFAULT_THEME;
  const wrap = (name, value) => (literal ? value : `var(${name},${value})`);
  const pick = (list, i) => list[((i % list.length) + list.length) % list.length];
  const ramp = (list, i, name) => {
    const k = Math.max(0, Math.min(list.length - 1, i));
    return wrap(`--ss-${name}-${k + 1}`, list[k]);
  };
  return {
    __theme: true,
    literal,
    values: base,
    c(role) {
      if (!(role in VAR)) throw Error(`Unknown color role "${role}"`);
      return wrap(VAR[role], base[role]);
    },
    cat(i) { return wrap(`--ss-cat-${(i % base.cat.length) + 1}`, pick(base.cat, i)); },
    /** Sequential ramp; i in 0..len-1, or a 0..1 fraction via seqAt(). */
    seq(i) { return ramp(base.seq, i, 'seq'); },
    seqAt(t) { return ramp(base.seq, Math.round(clamp01(t) * (base.seq.length - 1)), 'seq'); },
    div(i) { return ramp(base.div, i, 'div'); },
    /** Diverging ramp from a -1..1 position (0 = neutral middle). */
    divAt(t) { const n = base.div.length; return ramp(base.div, Math.round(((clamp(t, -1, 1) + 1) / 2) * (n - 1)), 'div'); },
    font(kind = 'sans') {
      const key = { sans: 'fontSans', serif: 'fontSerif', mono: 'fontMono', display: 'fontDisplay' }[kind];
      if (!key) throw Error(`Unknown font kind "${kind}"`);
      return wrap(VAR[key], base[key]);
    },
    /** k (0..1) of color A over color B; A and B are roles ('accent') or literal colors. */
    mix(a, b, k) {
      const lit = v => (v in VAR ? base[v] : v), css = v => (v in VAR ? this.c(v) : v);
      if (literal) return mixHex(lit(b), lit(a), clamp01(k));
      return `color-mix(in srgb, ${css(a)} ${Math.round(clamp01(k) * 100)}%, ${css(b)})`;
    },
    /** Literal hex for a role, for contrast math (works in both modes). */
    hex(role) { return base[role]; },
  };
}

/** Map a Slide Studio color-system JSON (assets/color-systems/*.json) to a theme object. */
export function fromColorSystem(cs) {
  if (!cs || !cs.tokens) return cs || {};
  const t = cs.tokens, d = cs.data || {}, type = cs.type || {};
  const ramp = (list, n) => (Array.isArray(list) && list.length ? expandRamp(list, n) : undefined);
  const out = {
    paper: t.paper, surface: t.surface, ink: t.ink, muted: t.inkMuted, rule: t.rule,
    grid: t.rule ? mixHex(t.rule, t.paper, 0.45) : undefined,
    accent: t.accent, onAccent: t.onAccent, positive: t.positive, negative: t.negative,
    highlight: d.highlight || t.accent, context: d.context,
    cat: Array.isArray(d.categorical) && d.categorical.length ? d.categorical : undefined,
    seq: ramp(d.sequential, 7), div: ramp(d.diverging, 7),
    fontSans: type.body ? `${type.body}${type.ja ? ',' + type.ja : ''}` : undefined,
    fontSerif: type.display && /serif/i.test(type.display) && !/sans-serif/i.test(type.display) ? type.display : undefined,
    fontDisplay: type.display ? `${type.display}${type.ja && !type.display.includes(type.ja) ? ',' + type.ja : ''}` : undefined,
  };
  for (const k of Object.keys(out)) if (out[k] === undefined) delete out[k];
  return out;
}

/** CSS declarations (`--ss-*`) for a color system; scope them with any selector. */
export function themeCSS(cs, selector = ':root') {
  const v = { ...DEFAULT_THEME, ...fromColorSystem(cs) };
  const lines = Object.entries(VAR).map(([role, name]) => `${name}:${v[role]}`);
  v.cat.forEach((c, i) => lines.push(`--ss-cat-${i + 1}:${c}`));
  v.seq.forEach((c, i) => lines.push(`--ss-seq-${i + 1}:${c}`));
  v.div.forEach((c, i) => lines.push(`--ss-div-${i + 1}:${c}`));
  return `${selector}{${lines.join(';')}}`;
}

// ---------------------------------------------------------------- color math

export function hexToRgb(hex) {
  const m = /^#?([\da-f]{6})$/i.exec(String(hex).trim());
  if (!m) throw Error(`Expected #RRGGBB, got ${hex}`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
}
/** Linear mix in sRGB; t=0 → a, t=1 → b. */
export function mixHex(a, b, t) {
  const x = hexToRgb(a), y = hexToRgb(b);
  return rgbToHex(x.map((v, i) => v + (y[i] - v) * t));
}
export function luminance(hex) {
  return hexToRgb(hex).map(v => v / 255).map(v => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
}
export function contrastRatio(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
/** The more legible of two text colors on a background (opaque colors). */
export function textOn(bg, light = '#ffffff', dark = '#17202b') {
  return contrastRatio(bg, light) >= contrastRatio(bg, dark) ? light : dark;
}
/** Resample a color ramp to n stops (linear interpolation between given stops). */
export function expandRamp(stops, n) {
  if (stops.length === n) return [...stops];
  return Array.from({ length: n }, (_, i) => {
    const p = (i / (n - 1)) * (stops.length - 1), k = Math.min(stops.length - 2, Math.floor(p));
    return mixHex(stops[k], stops[k + 1], p - k);
  });
}

// ---------------------------------------------------------------- numbers

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const clamp01 = v => clamp(v, 0, 1);
export const isNum = v => typeof v === 'number' && Number.isFinite(v);
/** Compact numeric output for SVG attributes (2 decimals, no -0). */
export function n(v) {
  if (typeof v !== 'number') return v;
  if (!Number.isFinite(v)) throw Error(`Non-finite geometry: ${v}`);
  const r = Math.round(v * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
}
export function sum(a) { return a.reduce((s, v) => s + v, 0); }
export function extent(values) {
  let lo = Infinity, hi = -Infinity;
  for (const v of values) if (isNum(v)) { if (v < lo) lo = v; if (v > hi) hi = v; }
  if (lo === Infinity) throw Error('extent(): no finite values');
  return [lo, hi];
}
/** Number of decimals a value is written with (capped), e.g. 12.50 → 1, 0.125 → 3. */
export function decimalsOf(v, cap = 4) {
  if (!isNum(v)) return 0;
  for (let d = 0; d <= cap; d++) if (Math.abs(Math.round(v * 10 ** d) - v * 10 ** d) < 1e-7) return d;
  return cap;
}
const roundTo = (v, step) => { const d = Math.max(0, decimalsOf(step, 10)); return +v.toFixed(d); };

// ---------------------------------------------------------------- escaping & ids

export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export function checkId(id) {
  if (!/^[A-Za-z][\w-]*$/.test(String(id || ''))) throw Error(`Figure id must start with a letter and use [A-Za-z0-9_-]: "${id}"`);
  return id;
}
/** data-states value for hand-written HTML/SVG template strings (JSON, HTML-escaped).
 *  With el(), pass the object directly instead: el('g', {'data-states': map}). */
export function statesAttr(map) { return esc(JSON.stringify(map)); }

// ---------------------------------------------------------------- SVG builder

const PAINT = new Set(['fill', 'stroke', 'stop-color', 'color', 'font-family', 'flood-color', 'lighting-color']);

/**
 * Serialize one element. `attrs` values: numbers (rounded), strings, null/false
 * (omitted). Paint values containing `var(` are moved into `style` so they work
 * in every browser. `children` are trusted markup strings (use esc() for text).
 */
export function el(tag, attrs = {}, ...children) {
  let style = attrs.style ? String(attrs.style).replace(/;?\s*$/, ';') : '';
  const parts = [];
  for (const [k, raw] of Object.entries(attrs)) {
    if (raw == null || raw === false || k === 'style') continue;
    // data-states accepts the state map itself: el('g', {'data-states': {0: {opacity: 0}, 1: {opacity: 1}}})
    const v = typeof raw === 'number' ? n(raw) : k === 'data-states' && typeof raw === 'object' ? JSON.stringify(raw) : raw;
    if (PAINT.has(k) && typeof v === 'string' && v.includes('var(')) { style += `${k}:${v};`; continue; }
    parts.push(`${k}="${esc(v)}"`);
  }
  if (style) parts.push(`style="${esc(style)}"`);
  const head = `<${tag}${parts.length ? ' ' + parts.join(' ') : ''}`;
  const flat = children.flat(Infinity).filter(x => x != null && x !== false && x !== '');
  for (const c of flat) if (typeof c === 'object') throw Error(`el(${tag}): child is an object — merge attributes into one object`);
  const body = flat.join('');
  return body ? `${head}>${body}</${tag}>` : `${head}/>`;
}
export const g = (attrs, ...children) => el('g', attrs, ...children);

/**
 * Root <svg>. Accessible name and description are required: describe what the
 * figure shows and its main pattern, not "chart".
 */
export function svgRoot({ id, width, height, title, desc, className = '', theme: th, style = '', font = 'sans' }, ...children) {
  checkId(id);
  if (!title) throw Error(`${id}: accessible title required`);
  const t = theme(th);
  const labelled = desc ? `${id}-title ${id}-desc` : `${id}-title`;
  return el('svg', {
    xmlns: 'http://www.w3.org/2000/svg', viewBox: `0 0 ${n(width)} ${n(height)}`, width: n(width), height: n(height),
    role: 'img', 'aria-labelledby': labelled, id, class: `ss-fig ${className}`.trim(),
    'font-family': t.font(font), style: `overflow:visible;${style}`,
  }, `<title id="${esc(id)}-title">${esc(title)}</title>`, desc ? `<desc id="${esc(id)}-desc">${esc(desc)}</desc>` : '', ...children);
}

// ---------------------------------------------------------------- text metrics

// Helvetica-class advance widths (1/1000 em). Inter is ~6% wider; see FAMILY_FACTOR.
const W = {};
(function buildWidths() {
  const table = {
    ' ': 278, '!': 278, '"': 355, '#': 556, '$': 556, '%': 889, '&': 667, "'": 191, '(': 333, ')': 333, '*': 389,
    '+': 584, ',': 278, '-': 333, '.': 278, '/': 278, ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556,
    '@': 1015, '[': 278, '\\': 278, ']': 278, '^': 469, '_': 556, '`': 333, '{': 334, '|': 260, '}': 334, '~': 584,
    A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500, K: 667, L: 556, M: 833, N: 722,
    O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
    a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222, m: 833, n: 556,
    o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
    '−': 584, '–': 556, '—': 1000, '…': 1000, '·': 278, '×': 584, '°': 400,
    '±': 584, '‘': 222, '’': 222, '“': 333, '”': 333, '€': 556, '£': 556,
    '¥': 556, '→': 1000, '←': 1000, '↑': 600, '↓': 600, ' ': 167, ' ': 278,
    '≈': 584, '≤': 584, '≥': 584, '½': 834, '•': 350,
  };
  for (let d = 0; d <= 9; d++) table[String(d)] = 556;
  Object.assign(W, table);
})();
const FAMILY_FACTOR = { sans: 1.06, serif: 1.0, mono: 1 };
const isWide = cp => (cp >= 0x1100 && cp <= 0x115f) || (cp >= 0x2e80 && cp <= 0xa4cf) || (cp >= 0xac00 && cp <= 0xd7a3) ||
  (cp >= 0xf900 && cp <= 0xfaff) || (cp >= 0xfe30 && cp <= 0xfe4f) || (cp >= 0xff00 && cp <= 0xff60) || (cp >= 0xffe0 && cp <= 0xffe6) ||
  (cp >= 0x20000 && cp <= 0x3fffd);
export const isCJK = s => /[　-ヿ㐀-鿿가-힯＀-￯]/.test(String(s));

/**
 * Estimated advance width in px. A layout guard, not a measurement: browsers
 * re-measure real glyphs, and QA checks the rendered result.
 */
export function measureText(text, size = 16, { weight = 400, family = 'sans', letterSpacing = 0 } = {}) {
  let units = 0, count = 0;
  for (const ch of String(text ?? '')) {
    count++;
    if (family === 'mono') { units += isWide(ch.codePointAt(0)) ? 1000 : 600; continue; }
    const cp = ch.codePointAt(0);
    if (isWide(cp)) units += 1000;
    else if (W[ch] !== undefined) units += W[ch] * FAMILY_FACTOR[family];
    else if (cp >= 0xff61 && cp <= 0xff9f) units += 500;
    else units += 580 * FAMILY_FACTOR[family];
  }
  const bold = weight >= 600 ? 1.055 : weight >= 500 ? 1.025 : 1;
  return (units / 1000) * size * bold + Math.max(0, count - 1) * letterSpacing * size;
}

// Kinsoku: characters that may not start / end a line in Japanese and Chinese.
const NO_START = new Set([...'、。，．,.：:；;？?！!）)］]｝}」』】〕〉》〙〗’”…‥ー々ゝゞヽヾぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ・%％']);
const NO_END = new Set([...'（(［[｛{「『【〔〈《〘〖‘“$＄¥￥£']);

const CJK_RE = /[　-ヿ㐀-鿿가-힯＀-￯]/;
const HIRAGANA_ONLY = /^[ぁ-ゟー]+$/u;
const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('ja', { granularity: 'word' }) : null;

/**
 * Break a line into wrap-safe chunks. Latin: words with trailing space.
 * Japanese/Chinese: dictionary word segments, with trailing kana particles
 * attached (条件を / 変えると、) so lines break between phrases, then kinsoku.
 */
function tokenize(line) {
  const text = String(line);
  let raw;
  if (segmenter && CJK_RE.test(text)) {
    raw = [];
    for (const { segment } of segmenter.segment(text)) {
      const prev = raw[raw.length - 1];
      if (prev && HIRAGANA_ONLY.test(segment) && !/\s$/.test(prev) && !NO_END.has([...prev].at(-1)) && CJK_RE.test(prev)) raw[raw.length - 1] += segment;
      else if (prev && /^\s+$/.test(segment)) raw[raw.length - 1] += segment;
      else raw.push(segment);
    }
    // A lone ideograph or short alphanumeric (途|切れ, B|案, 1|件) belongs with the following word.
    for (let i = raw.length - 2; i >= 0; i--) {
      const cur = raw[i], next = raw[i + 1];
      if ((/^[㐀-鿿]$/u.test(cur) || /^[A-Za-z0-9]{1,3}$/.test(cur)) && /^[ぁ-ヿ㐀-鿿]/u.test(next)) { raw[i] = cur + next; raw.splice(i + 1, 1); }
    }
  } else {
    // Words break at ordinary spaces only: no-break spaces (U+00A0, U+202F, U+2007) keep "15 min" together.
    raw = text.match(/[　-ヿ㐀-鿿가-힯＀-￯]|(?:[^\s　-ヿ㐀-鿿가-힯＀-￯]|[\u00A0\u202F\u2007])+[^\S\u00A0\u202F\u2007]*|[^\S\u00A0\u202F\u2007]+/gu) || [];
  }
  const out = [];
  for (const tok of raw) {
    const first = [...tok][0];
    if (out.length && NO_START.has(first)) out[out.length - 1] += tok;
    else if (out.length && NO_END.has([...out[out.length - 1]].at(-1))) out[out.length - 1] += tok;
    else out.push(tok);
  }
  return out;
}

/** Greedy wrap honoring explicit newlines and CJK kinsoku. Long Latin words overflow rather than split. */
export function wrapText(text, maxWidth, size = 16, opts = {}) {
  const lines = [];
  for (const para of String(text ?? '').split('\n')) {
    let line = '';
    const tokens = tokenize(para).flatMap(tok => (CJK_RE.test(tok) && measureText(tok, size, opts) > maxWidth ? [...tok] : [tok]));
    for (const tok of tokens) {
      const trial = line + tok;
      if (line && measureText(trial.trimEnd(), size, opts) > maxWidth && !NO_START.has([...tok][0])) {
        lines.push(line.trimEnd());
        line = tok.trimStart();
      } else line = trial;
    }
    lines.push(line.trimEnd());
  }
  return lines;
}

/** Wrap to the narrowest width that keeps the same number of lines (avoids a lonely last word). */
export function wrapBalanced(text, maxWidth, size = 16, opts = {}) {
  const base = wrapText(text, maxWidth, size, opts);
  if (base.length < 2) return base;
  let lo = maxWidth * 0.4, hi = maxWidth, best = base;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2, trial = wrapText(text, mid, size, opts);
    if (trial.length <= base.length) { best = trial; hi = mid; } else lo = mid;
  }
  return best;
}

/** Widest line, in px. */
export function blockWidth(lines, size, opts) { return Math.max(0, ...lines.map(l => measureText(l, size, opts))); }

/**
 * Multi-line <text>. valign: 'top' (y = cap top), 'middle' (y = optical center),
 * 'baseline' (y = first baseline), 'bottom' (y = last baseline).
 */
export function textLines(lines, { x, y, size = 16, lineHeight = 1.25, anchor = 'start', valign = 'baseline', fill, weight, family, cls, italic, halo, letterSpacing, attrs = {} } = {}) {
  const list = Array.isArray(lines) ? lines : [lines];
  const lh = size * lineHeight, k = list.length;
  let y0 = y;
  if (valign === 'top') y0 = y + size * 0.74;
  else if (valign === 'middle') y0 = y - ((k - 1) * lh) / 2 + size * 0.36;
  else if (valign === 'bottom') y0 = y - (k - 1) * lh;
  const a = {
    x, y: y0, 'font-size': size, 'text-anchor': anchor === 'start' ? null : anchor, fill,
    'font-weight': weight && weight !== 400 ? weight : null, 'font-family': family, class: cls,
    'font-style': italic ? 'italic' : null,
    'letter-spacing': letterSpacing ? `${letterSpacing}em` : null, ...attrs,
  };
  if (halo) Object.assign(a, { stroke: halo, 'stroke-width': Math.max(3, size * 0.28), 'stroke-linejoin': 'round', 'paint-order': 'stroke' });
  // Keep deliberate spacing (leading or repeated spaces, e.g. aligned figures) instead of collapsing it.
  if (list.some(l => /^\s|\s\s/.test(String(l)))) a.style = [a.style, 'white-space:pre'].filter(Boolean).join(';');
  if (k === 1) return el('text', a, esc(list[0]));
  return el('text', a, list.map((line, i) => el('tspan', { x, dy: i ? lh : null, y: i ? null : y0 }, esc(line))));
}

// ---------------------------------------------------------------- scales

/** 1–2–2.5–5 step for about `count` intervals. */
export function niceStep(span, count = 5) {
  if (!(span > 0)) return 1;
  const raw = span / Math.max(1, count), mag = 10 ** Math.floor(Math.log10(raw)), f = raw / mag;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
}
export function niceDomain([lo, hi], count = 5) {
  if (lo === hi) { const pad = lo === 0 ? 1 : Math.abs(lo) * 0.1; lo -= pad; hi += pad; }
  const s = niceStep(hi - lo, count);
  return [roundTo(Math.floor(lo / s + 1e-9) * s, s), roundTo(Math.ceil(hi / s - 1e-9) * s, s)];
}
export function ticks(lo, hi, count = 5) {
  if (lo > hi) [lo, hi] = [hi, lo];
  const s = niceStep(hi - lo, count), out = [];
  for (let v = Math.ceil(lo / s - 1e-9) * s; v <= hi + s * 1e-9; v += s) out.push(roundTo(v, s));
  return out;
}

/** Linear scale. `.ticks(n)`, `.invert(y)`, `.domain`, `.range`, `.step` (of last ticks call). */
export function linear(domain, range, { nice = false, count = 5, clamp: doClamp = false } = {}) {
  let [d0, d1] = domain;
  if (!isNum(d0) || !isNum(d1)) throw Error('linear(): finite domain required');
  if (nice) [d0, d1] = niceDomain([d0, d1], count);
  if (d0 === d1) d1 = d0 + 1;
  const [r0, r1] = range;
  const f = v => { let t = (v - d0) / (d1 - d0); if (doClamp) t = clamp01(t); return r0 + t * (r1 - r0); };
  f.domain = [d0, d1]; f.range = [r0, r1];
  f.ticks = (c = count) => ticks(d0, d1, c);
  f.tickStep = (c = count) => niceStep(Math.abs(d1 - d0), c);
  f.invert = y => d0 + ((y - r0) / (r1 - r0)) * (d1 - d0);
  f.kind = 'linear';
  return f;
}

/** Log10 scale for strictly positive data. Ticks at 1-2-5 × 10^k. */
export function log(domain, range) {
  const [d0, d1] = domain;
  if (!(d0 > 0 && d1 > 0)) throw Error('log(): positive domain required');
  const l0 = Math.log10(d0), l1 = Math.log10(d1), [r0, r1] = range;
  const f = v => r0 + ((Math.log10(v) - l0) / (l1 - l0)) * (r1 - r0);
  f.domain = [d0, d1]; f.range = [r0, r1]; f.kind = 'log';
  f.ticks = () => {
    const out = [];
    for (let k = Math.floor(l0); k <= Math.ceil(l1); k++) for (const m of [1, 2, 5]) {
      const v = m * 10 ** k; if (v >= d0 * 0.999 && v <= d1 * 1.001) out.push(+v.toPrecision(6));
    }
    return out;
  };
  f.invert = y => 10 ** (l0 + ((y - r0) / (r1 - r0)) * (l1 - l0));
  return f;
}

/** Square-root scale for areas (bubble radius ∝ √value). */
export function sqrt(domain, range) {
  const f = linear([Math.sqrt(domain[0]), Math.sqrt(domain[1])], range);
  const g2 = v => f(Math.sqrt(v));
  g2.domain = domain; g2.range = range; g2.kind = 'sqrt';
  return g2;
}

/** Band scale (d3 semantics). f(key) → band start; f.bw bandwidth; f.center(key). */
export function band(keys, range, { inner = 0.25, outer = 0.12, align = 0.5 } = {}) {
  const list = [...keys], k = list.length;
  if (!k) throw Error('band(): at least one key required');
  if (new Set(list.map(String)).size !== k) throw Error('band(): keys must be unique');
  const [r0, r1] = range, reverse = r1 < r0, a = Math.min(r0, r1), b = Math.max(r0, r1);
  const step = (b - a) / Math.max(1, k - inner + outer * 2);
  const start = a + (b - a - step * (k - inner)) * align;
  const bw = step * (1 - inner);
  const index = new Map(list.map((key, i) => [String(key), reverse ? k - 1 - i : i]));
  const f = key => {
    const i = index.get(String(key));
    if (i === undefined) throw Error(`band(): unknown key "${key}"`);
    return start + step * i;
  };
  f.bw = bw; f.step = step; f.keys = list; f.kind = 'band'; f.range = range;
  f.center = key => f(key) + bw / 2;
  return f;
}

/** Point scale: evenly spaced positions for ordered categories (e.g. years on a line chart). */
export function point(keys, range, { padding = 0.5 } = {}) {
  const list = [...keys], k = list.length, [r0, r1] = range;
  const step = k > 1 ? (r1 - r0) / (k - 1 + padding * 2) : 0;
  const index = new Map(list.map((key, i) => [String(key), i]));
  const f = key => {
    const i = index.get(String(key));
    if (i === undefined) throw Error(`point(): unknown key "${key}"`);
    return k > 1 ? r0 + step * (padding + i) : (r0 + r1) / 2;
  };
  f.keys = list; f.step = step; f.kind = 'point'; f.range = range;
  return f;
}

// ---------------------------------------------------------------- formatting

/**
 * Locale-aware number text with a real minus sign.
 * digits: fixed decimals (default: as needed up to 2). compact: 1.2K / 1.2万.
 * sign: '+' on positives. prefix/suffix: units ($, %, ms). percentOf1: 0.25 → 25%.
 */
export function fmt(v, { locale = 'en', digits, compact = false, sign = false, prefix = '', suffix = '', percentOf1 = false, minus = '−' } = {}) {
  if (!isNum(v)) return '—';
  let x = percentOf1 ? v * 100 : v;
  if (percentOf1 && !suffix) suffix = '%';
  const auto = Math.abs(x) < 1 && x !== 0 ? Math.min(4, decimalsOf(x, 4)) : Math.min(2, decimalsOf(x, 2));
  const d = compact ? (digits ?? 1) : (digits ?? auto);
  const nf = new Intl.NumberFormat(locale, {
    minimumFractionDigits: compact ? 0 : d, maximumFractionDigits: d,
    notation: compact ? 'compact' : 'standard', compactDisplay: 'short',
  });
  const text = nf.format(Math.abs(x));
  const isZero = Number(text.replace(/[^\d.]/g, '')) === 0;
  const s = x < 0 && !isZero ? minus : sign && x > 0 && !isZero ? '+' : '';
  return `${s}${prefix}${text}${suffix}`;
}
/** Fraction 0..1 → "25%" with fixed digits. */
export const pct = (v, digits = 0, opts = {}) => fmt(v, { ...opts, percentOf1: true, digits });

/** Formatter factory shared by axes and labels: one convention per figure. */
export function formatter(opts = {}) {
  if (typeof opts === 'function') return opts;
  return v => fmt(v, opts);
}

// ---------------------------------------------------------------- shapes & paths

export function pathFromPoints(points, { curve = 'linear', close = false } = {}) {
  const pts = points.filter(p => p && isNum(p[0]) && isNum(p[1]));
  if (!pts.length) return '';
  if (curve === 'step') {
    let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
    for (let i = 1; i < pts.length; i++) d += `H${n(pts[i][0])}V${n(pts[i][1])}`;
    return d + (close ? 'Z' : '');
  }
  if (curve === 'step-after') {
    let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
    for (let i = 1; i < pts.length; i++) d += `H${n(pts[i][0])}V${n(pts[i][1])}`;
    return d;
  }
  if (curve === 'monotone' && pts.length > 2) return monotonePath(pts) + (close ? 'Z' : '');
  return pts.map((p, i) => `${i ? 'L' : 'M'}${n(p[0])} ${n(p[1])}`).join('') + (close ? 'Z' : '');
}

/** Monotone cubic (Fritsch–Carlson): smooth without overshooting the data. */
function monotonePath(p) {
  const k = p.length, dx = [], m = [], t = Array(k);
  for (let i = 0; i < k - 1; i++) { dx[i] = p[i + 1][0] - p[i][0]; m[i] = dx[i] ? (p[i + 1][1] - p[i][1]) / dx[i] : 0; }
  t[0] = m[0]; t[k - 1] = m[k - 2];
  for (let i = 1; i < k - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
  let d = `M${n(p[0][0])} ${n(p[0][1])}`;
  for (let i = 0; i < k - 1; i++) {
    const h = dx[i] / 3;
    d += `C${n(p[i][0] + h)} ${n(p[i][1] + t[i] * h)} ${n(p[i + 1][0] - h)} ${n(p[i + 1][1] - t[i + 1] * h)} ${n(p[i + 1][0])} ${n(p[i + 1][1])}`;
  }
  return d;
}

/** Split a series at missing values: missing is a gap, never zero. */
export function segments(points) {
  const out = []; let cur = [];
  for (const p of points) {
    if (p && isNum(p[0]) && isNum(p[1])) cur.push(p);
    else if (cur.length) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  return out;
}

/** Rectangle with independently rounded corners [tl, tr, br, bl]. */
export function roundRectPath(x, y, w, h, r = 0) {
  const [tl, tr, br, bl] = (Array.isArray(r) ? r : [r, r, r, r]).map(v => clamp(v, 0, Math.min(Math.abs(w), Math.abs(h)) / 2));
  if (w < 0) { x += w; w = -w; }
  if (h < 0) { y += h; h = -h; }
  return `M${n(x + tl)} ${n(y)}H${n(x + w - tr)}${tr ? `Q${n(x + w)} ${n(y)} ${n(x + w)} ${n(y + tr)}` : ''}` +
    `V${n(y + h - br)}${br ? `Q${n(x + w)} ${n(y + h)} ${n(x + w - br)} ${n(y + h)}` : ''}` +
    `H${n(x + bl)}${bl ? `Q${n(x)} ${n(y + h)} ${n(x)} ${n(y + h - bl)}` : ''}` +
    `V${n(y + tl)}${tl ? `Q${n(x)} ${n(y)} ${n(x + tl)} ${n(y)}` : ''}Z`;
}

/** Bar path rounded only at the end away from the baseline. dir: 'up'|'down'|'right'|'left'. */
export function barPath(x, y, w, h, r, dir) {
  const c = { up: [r, r, 0, 0], down: [0, 0, r, r], right: [0, r, r, 0], left: [r, 0, 0, r] }[dir] || 0;
  return roundRectPath(x, y, w, h, c);
}

export function polar(cx, cy, r, angle) { return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]; }

/** Annular sector; angles in radians, 0 = 3 o'clock, clockwise positive (SVG). */
export function arcPath(cx, cy, r0, r1, a0, a1) {
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  const [x0, y0] = polar(cx, cy, r1, a0), [x1, y1] = polar(cx, cy, r1, a1);
  if (r0 <= 0) return `M${n(cx)} ${n(cy)}L${n(x0)} ${n(y0)}A${n(r1)} ${n(r1)} 0 ${large} 1 ${n(x1)} ${n(y1)}Z`;
  const [x2, y2] = polar(cx, cy, r0, a1), [x3, y3] = polar(cx, cy, r0, a0);
  return `M${n(x0)} ${n(y0)}A${n(r1)} ${n(r1)} 0 ${large} 1 ${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}A${n(r0)} ${n(r0)} 0 ${large} 0 ${n(x3)} ${n(y3)}Z`;
}

/** Arrowhead marker definition (place inside <defs>). */
export function arrowMarker(id, color, { size = 10, open = false } = {}) {
  return el('marker', { id, viewBox: '0 0 10 10', refX: open ? 8.5 : 9, refY: 5, markerWidth: size * 0.9, markerHeight: size * 0.9, markerUnits: 'userSpaceOnUse', orient: 'auto-start-reverse' },
    open
      ? el('path', { d: 'M1.5 1.5L8.5 5L1.5 8.5', fill: 'none', stroke: color, 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
      : el('path', { d: 'M0 0.6L10 5L0 9.4Z', fill: color }));
}

/** Point on a rectangle's boundary facing (tx,ty); for connector endpoints. */
export function boxPort(b, tx, ty, pad = 0) {
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2, dx = tx - cx, dy = ty - cy;
  if (!dx && !dy) return [cx, cy];
  const sx = (b.w / 2 + pad) / Math.abs(dx || 1e-9), sy = (b.h / 2 + pad) / Math.abs(dy || 1e-9), s = Math.min(sx, sy);
  return [cx + dx * s, cy + dy * s];
}
export function sidePort(b, side, pad = 0) {
  return {
    left: [b.x - pad, b.y + b.h / 2], right: [b.x + b.w + pad, b.y + b.h / 2],
    top: [b.x + b.w / 2, b.y - pad], bottom: [b.x + b.w / 2, b.y + b.h + pad],
  }[side];
}

// ---------------------------------------------------------------- label placement

/**
 * 1-D collision avoidance for stacked labels (line-end labels, slope charts).
 * items: [{id, y, h}] target centers; returns [{id, y, shifted}] within [min,max].
 */
export function spreadLabels(items, { min = -Infinity, max = Infinity, gap = 4 } = {}) {
  const list = items.map((it, i) => ({ ...it, i, target: it.y })).sort((a, b) => a.target - b.target || a.i - b.i);
  // Forward pass pushes down, backward pass pulls up within bounds; repeat to settle.
  for (let pass = 0; pass < 4; pass++) {
    let bottom = min;
    for (const it of list) { const top = it.y - it.h / 2; if (top < bottom) it.y = bottom + it.h / 2; bottom = it.y + it.h / 2 + gap; }
    let top = max;
    for (let k = list.length - 1; k >= 0; k--) { const it = list[k]; if (it.y + it.h / 2 > top) it.y = top - it.h / 2; top = it.y - it.h / 2 - gap; }
  }
  return list.sort((a, b) => a.i - b.i).map(({ i, target, ...rest }) => ({ ...rest, shifted: Math.abs(rest.y - target) > 1 }));
}

// ---------------------------------------------------------------- motion hooks

/**
 * Normalize a figure's `build` option. Builds become player attributes:
 * data-step (when it appears), data-motion (how), data-delay (stagger, ms).
 *   build: true | { start=1, by='all'|'mark'|'series', stagger=60, motion, duration }
 */
export function normBuild(b) {
  if (!b) return null;
  const o = b === true ? {} : b;
  return { start: o.start ?? 1, by: o.by ?? 'all', stagger: o.stagger ?? 60, motion: o.motion ?? null, duration: o.duration ?? null, labelDelay: o.labelDelay ?? 280 };
}
/** Attributes for item `i` (of series `s`) under a normalized build. */
export function buildAttrs(build, { i = 0, s = 0, motion, delay = 0, label = false } = {}) {
  if (!build) return {};
  const step = build.by === 'mark' ? build.start + i : build.by === 'series' ? build.start + s : build.start;
  const stagger = build.by === 'all' ? i * build.stagger : build.by === 'series' ? i * build.stagger : 0;
  const d = Math.round(stagger + delay + (label ? build.labelDelay : 0));
  return {
    'data-step': step,
    'data-motion': label ? 'reveal' : (build.motion || motion || 'reveal'),
    'data-delay': d > 0 ? Math.min(d, 2400) : null,
    'data-duration': build.duration && !label ? build.duration : null,
  };
}

// ---------------------------------------------------------------- axes

/**
 * Axis for a linear/log/band/point scale.
 *   orient: 'bottom' | 'left' | 'top' | 'right'
 *   at: cross position (y for bottom/top, x for left/right)
 *   grid: [from, to] extent of grid lines across the plot (optional)
 */
export function axis(scale, {
  orient = 'bottom', at = 0, theme: th, tickValues, count = 5, format, size = 16, grid, gridDash = null,
  domainLine = false, tickSize = 0, pad = 8, labels = true, labelLines = 2, labelWidth, color, cls = 'ss-axis',
  zero = true, labelAnchor,
} = {}) {
  const t = theme(th), fmtFn = formatter(format), out = [];
  const horizontal = orient === 'bottom' || orient === 'top';
  const isBand = scale.kind === 'band' || scale.kind === 'point';
  const values = tickValues ?? (isBand ? scale.keys : scale.ticks(count));
  const pos = v => (scale.kind === 'band' ? scale.center(v) : scale(v));
  const textFill = color || t.c('muted');
  for (const v of values) {
    const p = pos(v);
    if (grid && !isBand) {
      const isZero = zero && v === 0 && scale.kind === 'linear';
      out.push(el('line', {
        ...(horizontal ? { x1: p, x2: p, y1: grid[0], y2: grid[1] } : { x1: grid[0], x2: grid[1], y1: p, y2: p }),
        stroke: isZero ? t.c('ink') : t.c('grid'), 'stroke-width': isZero ? 1.4 : 1, 'stroke-dasharray': isZero ? null : gridDash, class: isZero ? 'ss-zero' : 'ss-grid',
      }));
    }
    if (tickSize) out.push(el('line', {
      ...(horizontal ? { x1: p, x2: p, y1: at, y2: at + (orient === 'bottom' ? tickSize : -tickSize) } : { x1: at, x2: at + (orient === 'left' ? -tickSize : tickSize), y1: p, y2: p }),
      stroke: t.c('rule'),
    }));
    if (!labels) continue;
    const text = isBand ? String(v) : fmtFn(v);
    if (horizontal) {
      const lines = isBand && labelWidth ? wrapText(text, labelWidth, size).slice(0, labelLines) : [text];
      out.push(textLines(lines, {
        x: p, y: orient === 'bottom' ? at + pad + tickSize : at - pad - tickSize, size, anchor: labelAnchor || 'middle',
        valign: orient === 'bottom' ? 'top' : 'bottom', fill: textFill, cls: `${cls}-label`, lineHeight: 1.18,
        attrs: { 'font-variant-numeric': isBand ? null : 'tabular-nums' },
      }));
    } else {
      const lines = isBand && labelWidth ? wrapText(text, labelWidth, size).slice(0, labelLines) : [text];
      out.push(textLines(lines, {
        x: orient === 'left' ? at - pad - tickSize : at + pad + tickSize, y: p, size, valign: 'middle', lineHeight: 1.18,
        anchor: labelAnchor || (orient === 'left' ? 'end' : 'start'), fill: textFill, cls: `${cls}-label`,
        attrs: { 'font-variant-numeric': isBand ? null : 'tabular-nums' },
      }));
    }
  }
  if (domainLine) {
    const [r0, r1] = scale.range;
    out.push(el('line', { ...(horizontal ? { x1: r0, x2: r1, y1: at, y2: at } : { x1: at, x2: at, y1: r0, y2: r1 }), stroke: t.c('ink'), 'stroke-width': 1.4 }));
  }
  return g({ class: cls }, out);
}

/** Widest formatted tick label, for margins. */
export function tickLabelWidth(scale, { format, count = 5, size = 16, tickValues } = {}) {
  const f = formatter(format), values = tickValues ?? (scale.kind === 'band' || scale.kind === 'point' ? scale.keys : scale.ticks(count));
  return Math.max(0, ...values.map(v => measureText(scale.kind === 'band' ? String(v) : f(v), size)));
}

// ---------------------------------------------------------------- annotation

/**
 * Callout: a dot (optional) at the target, an elbow/straight leader, and wrapped text.
 *   x,y target; dx,dy offset of the text anchor; width wraps the text.
 *   align: 'auto' chooses text side from dx.
 */
export function callout({ x, y, text, title, dx = 48, dy = -48, width = 240, size = 16, theme: th, color, lineColor,
  marker = 'dot', leader = 'elbow', align = 'auto', weight, halo = true, cls = 'ss-callout', attrs = {}, gap = 6, bounds } = {}) {
  const t = theme(th), ink = color || t.c('ink'), line = lineColor || t.c('muted');
  const lines = wrapBalanced(text, width, size, { weight });
  const titleLines = title ? wrapText(title, width, size, { weight: 700 }) : [];
  const textW = Math.max(blockWidth(lines, size, { weight }), blockWidth(titleLines, size, { weight: 700 }));
  const lh = size * 1.3, total = titleLines.length + lines.length, blockH = total * lh;
  let tx = x + dx, ty = y + dy;
  let anchor = align === 'auto' ? (dx < -2 ? 'end' : dx > 2 ? 'start' : 'middle') : align;
  // Keep the note inside the figure: flip to the other side, then clamp.
  if (bounds) {
    const pad = 4;
    if (anchor === 'start' && tx + textW > bounds.w - pad && x - dx - textW > pad) { tx = x - dx; anchor = 'end'; }
    else if (anchor === 'end' && tx - textW < pad && x - dx + textW < bounds.w - pad) { tx = x - dx; anchor = 'start'; }
    if (anchor === 'middle') tx = clamp(tx, textW / 2 + pad, bounds.w - textW / 2 - pad);
    else if (anchor === 'start') tx = Math.min(tx, bounds.w - textW - pad);
    else tx = Math.max(tx, textW + pad);
    ty = clamp(ty, blockH / 2 + pad, bounds.h - blockH / 2 - pad);
  }
  const ddx = tx - x, ddy = ty - y;
  const parts = [];
  if (marker === 'dot') parts.push(el('circle', { cx: x, cy: y, r: 4.5, fill: ink, stroke: t.c('paper'), 'stroke-width': 2 }));
  if (marker === 'ring') parts.push(el('circle', { cx: x, cy: y, r: 9, fill: 'none', stroke: ink, 'stroke-width': 1.8 }));
  const ex = anchor === 'start' ? tx - gap : anchor === 'end' ? tx + gap : tx;
  const ey = anchor === 'middle' ? (ddy < 0 ? ty + blockH / 2 + 2 : ty - blockH / 2 - 2) : ty;
  const startPt = marker === 'ring' ? boxPort({ x: x - 9, y: y - 9, w: 18, h: 18 }, ex, ey) : [x, y];
  if (leader === 'elbow' && Math.abs(ddx) > 4 && Math.abs(ddy) > 4 && anchor !== 'middle') {
    parts.push(el('path', { d: `M${n(startPt[0])} ${n(startPt[1])}V${n(ty)}H${n(ex)}`, fill: 'none', stroke: line, 'stroke-width': 1.3 }));
  } else if (leader !== 'none' && (Math.abs(ddx) > 4 || Math.abs(ddy) > 4)) {
    parts.push(el('line', { x1: startPt[0], y1: startPt[1], x2: ex, y2: ey, stroke: line, 'stroke-width': 1.3 }));
  }
  let baseY = ty - ((total - 1) * lh) / 2 + size * 0.36;
  if (titleLines.length) {
    parts.push(textLines(titleLines, { x: tx, y: baseY, size, weight: 700, anchor, fill: ink, halo: halo ? t.c('paper') : null, lineHeight: 1.3 }));
    baseY += titleLines.length * lh;
  }
  parts.push(textLines(lines, { x: tx, y: baseY, size, anchor, fill: ink, weight, halo: halo ? t.c('paper') : null, lineHeight: 1.3 }));
  return g({ class: cls, ...attrs }, parts);
}

/** Bracket with a label, e.g. to show a gap between two values. side: 'right'|'left'|'top'|'bottom'. */
export function bracket({ x1, y1, x2, y2, side = 'right', depth = 10, label, size = 16, theme: th, color, weight = 600, attrs = {} }) {
  const t = theme(th), c = color || t.c('ink');
  let d, lx, ly, anchor;
  if (side === 'right' || side === 'left') {
    const s = side === 'right' ? 1 : -1, x = Math.max(x1, x2) * (s > 0) + Math.min(x1, x2) * (s < 0);
    d = `M${n(x)} ${n(y1)}h${n(s * depth)}V${n(y2)}h${n(-s * depth)}`;
    lx = x + s * (depth + 8); ly = (y1 + y2) / 2; anchor = s > 0 ? 'start' : 'end';
  } else {
    const s = side === 'bottom' ? 1 : -1, y = Math.max(y1, y2) * (s > 0) + Math.min(y1, y2) * (s < 0);
    d = `M${n(x1)} ${n(y)}v${n(s * depth)}H${n(x2)}v${n(-s * depth)}`;
    lx = (x1 + x2) / 2; ly = y + s * (depth + 10) + (s > 0 ? size * 0.7 : 0); anchor = 'middle';
  }
  return g({ class: 'ss-bracket', ...attrs },
    el('path', { d, fill: 'none', stroke: c, 'stroke-width': 1.5 }),
    label ? textLines([label], { x: lx, y: ly, size, anchor, valign: side === 'left' || side === 'right' ? 'middle' : 'baseline', fill: c, weight }) : '');
}

/** Reference line across a plot with a label at one end. */
export function refLine({ orient = 'h', at, from, to, label, labelPos = 'end', size = 15, theme: th, color, dash = '5 5', weight = 600, attrs = {} }) {
  const t = theme(th), c = color || t.c('ink');
  const line = orient === 'h'
    ? el('line', { x1: from, x2: to, y1: at, y2: at, stroke: c, 'stroke-width': 1.4, 'stroke-dasharray': dash })
    : el('line', { x1: at, x2: at, y1: from, y2: to, stroke: c, 'stroke-width': 1.4, 'stroke-dasharray': dash });
  let lab = '';
  if (label) {
    lab = orient === 'h'
      ? textLines([label], { x: labelPos === 'end' ? to : from, y: at - 7, size, anchor: labelPos === 'end' ? 'end' : 'start', fill: c, weight, halo: t.c('paper') })
      : textLines([label], { x: at + 6, y: labelPos === 'end' ? from : to, size, valign: labelPos === 'end' ? 'top' : 'bottom', fill: c, weight, halo: t.c('paper') });
  }
  return g({ class: 'ss-ref', ...attrs }, line, lab);
}

/** Inline legend; prefer direct labels on marks when they fit. */
export function legend(items, { x = 0, y = 0, size = 16, gap = 22, direction = 'row', swatch = 'square', theme: th, maxWidth = Infinity } = {}) {
  const t = theme(th), parts = [];
  let cx = x, cy = y;
  for (const it of items) {
    const w = measureText(it.label, size) + size + 10;
    if (direction === 'row' && cx > x && cx + w > x + maxWidth) { cx = x; cy += size * 1.6; }
    const sw = swatch === 'line' || it.shape === 'line'
      ? el('line', { x1: cx, x2: cx + size, y1: cy, y2: cy, stroke: it.color, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': it.dash || null })
      : swatch === 'dot' || it.shape === 'dot'
        ? el('circle', { cx: cx + size / 2, cy, r: size * 0.32, fill: it.color })
        : el('rect', { x: cx, y: cy - size * 0.36, width: size * 0.72, height: size * 0.72, rx: 2, fill: it.color });
    parts.push(sw, textLines([it.label], { x: cx + size + 6, y: cy, size, valign: 'middle', fill: t.c('ink') }));
    if (direction === 'row') cx += w + gap; else cy += size * 1.6;
  }
  return g({ class: 'ss-legend' }, parts);
}

// ---------------------------------------------------------------- misc helpers

/** Resolve a highlight option against an item: string | string[] | predicate. */
export function isHighlighted(highlight, item, key = 'label') {
  if (highlight == null || highlight === false) return false;
  if (typeof highlight === 'function') return !!highlight(item);
  const value = typeof item === 'object' ? item[key] : item;
  return Array.isArray(highlight) ? highlight.map(String).includes(String(value)) : String(highlight) === String(value);
}

/** Deterministic PRNG (mulberry32). Same seed → same sequence, in every runtime. */
export function rng(seed = 1) {
  let a = (typeof seed === 'string' ? [...seed].reduce((h, c) => Math.imul(h ^ c.codePointAt(0), 2654435761), 1779033703) : seed) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Plot box after margins. */
export function plotBox(width, height, m) {
  const box = { x: m.left, y: m.top, w: width - m.left - m.right, h: height - m.top - m.bottom };
  if (box.w < 40 || box.h < 40) throw Error(`Plot area too small (${Math.round(box.w)}×${Math.round(box.h)}); enlarge the figure or shorten labels.`);
  return box;
}
