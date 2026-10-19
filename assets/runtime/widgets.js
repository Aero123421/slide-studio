/* Slide Studio widgets — small, inspectable interactions for teaching pages.
 *
 * mountStudioWidgets(configs, assets) mounts one widget per config. A widget answers a
 * question an audience can ask of real data: input → state → derived values → drawing +
 * one status sentence (announced through the slide's live region). No telemetry, storage,
 * network requests, timers or hidden polls. Controls belong to the slide: keys typed into
 * them never reach deck navigation (the root carries data-interactive).
 *
 * Config (only id and kind are required; reference: references/motion-and-interaction.md §9)
 *   id, kind     root element id (it holds .w-plot, .w-controls, .w-status) and mechanism
 *   initial      state at entry and after reset (deep-copied, never mutated)
 *   data         the subject's data; without it every kind draws a small default fixture
 *   controls     {stateKey: {label, min, max, step, digits, format, values, labels, on, off} | false}
 *   axes         {x: {title, min, max, ticks, digits, format}, y: {…}}
 *   text         UI words and templates. "{name}" inserts a derived value; "{n|stop|stops}"
 *                inserts n followed by the singular or plural word. text.status is the
 *                status sentence, text.readout a list of {value, label} big-number templates.
 *   assets       media overrides {photo, video, poster, captions, audio, obj}
 *   locale       number format and UI language (default: the slide's lang)
 *   size         [width, height] drawing size used while the slide is not laid out
 * Hooks registered with SlideStudio: reset, snapshot, restore, onEnter, onStep, onLeave,
 * onExport, dispose. Static export hides the controls and shows the chosen settings. */
(() => {
'use strict';

/* ======================================================================= basics */

const esc = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = v => (v === undefined ? {} : JSON.parse(JSON.stringify(v)));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const isNum = Number.isFinite;
const sum = a => a.reduce((s, v) => s + v, 0);
const mean = a => (a.length ? sum(a) / a.length : NaN);
const r2 = v => Math.round(v * 100) / 100;
function quantile(values, p) { // type 7 (R, NumPy default)
  const s = [...values].sort((a, b) => a - b);
  if (!s.length) return NaN;
  const h = (s.length - 1) * p, lo = Math.floor(h);
  return s[lo] + (s[Math.min(lo + 1, s.length - 1)] - s[lo]) * (h - lo);
}
const median = a => quantile(a, 0.5);

/** Locale-aware number with a real minus sign and no "−0". */
function fmt(v, digits = 0, locale = 'en', signed = false, group = true) {
  if (!isNum(v)) return '–';
  const s = Math.abs(v).toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: group });
  const zero = Number(Math.abs(v).toFixed(digits)) === 0;
  return (v < 0 && !zero ? '−' : signed && v > 0 && !zero ? '+' : '') + s;
}
/** "a, b and c" in the page's language. */
const listOf = (items, locale = 'en') => { try { return new Intl.ListFormat(locale, { type: 'conjunction' }).format(items); } catch { return items.join(', '); } };
/** Fill "{key}" and "{key|one|many}" from values (numbers are formatted, strings kept). */
function fill(template, values, locale = 'en') {
  return String(template ?? '').replace(/\{(\w+)(?:\|([^|}]*)\|([^}]*))?\}/g, (m, key, one, many) => {
    if (!(key in values)) return m;
    const v = values[key];
    const s = typeof v === 'number' ? fmt(v, Number.isInteger(v) ? 0 : 1, locale) : String(v);
    if (one === undefined) return s;
    const n = typeof v === 'number' ? v : Number(String(v).replace(/[^\d.]/g, ''));
    return `${s} ${n === 1 ? one : many}`;
  });
}

/* ======================================================================= color */

// Role tokens from the slide's color system (--ss-*) with the figure engine's fallbacks.
const DEF = { paper: '#ffffff', surface: '#f3f5f8', ink: '#17202b', muted: '#5a6676', rule: '#d5dbe3', grid: '#e7ebf0',
  accent: '#2457c5', onAccent: '#ffffff', positive: '#2c7a4b', negative: '#b5432f', highlight: '#2457c5', context: '#c3cad4' };
const VARS = { paper: '--ss-paper', surface: '--ss-surface', ink: '--ss-ink', muted: '--ss-muted', rule: '--ss-rule', grid: '--ss-grid',
  accent: '--ss-accent', onAccent: '--ss-on-accent', positive: '--ss-positive', negative: '--ss-negative', highlight: '--ss-highlight', context: '--ss-context' };
const CAT = ['#2457c5', '#d9822b', '#7a58a6', '#3d8c58', '#c2465b', '#5c6b7b', '#b39223', '#2f8f9b'];
const SEQ = ['#e9effb', '#bdcff2', '#86a6e4', '#4a76d1', '#2550a8', '#183670', '#0e2246'];
const C = Object.fromEntries(Object.entries(VARS).map(([k, v]) => [k, `var(${v},${DEF[k]})`]));
const cat = i => `var(--ss-cat-${(i % 8) + 1},${CAT[i % 8]})`;
const seq = i => { const k = clamp(Math.round(i), 1, 7); return `var(--ss-seq-${k},${SEQ[k - 1]})`; };
const TONE = { ink: C.ink, muted: C.muted, accent: C.accent, negative: C.negative, positive: C.positive, context: C.context, rule: C.rule, highlight: C.highlight };
const tone = (name, fallback = C.ink) => TONE[name] || (/^cat-\d$/.test(name || '') ? cat(Number(name.slice(4)) - 1) : fallback);
const FONT = "var(--ss-font-sans,Inter,'Helvetica Neue',Arial,sans-serif)";

/** Literal token values for canvas painting (canvas cannot read CSS variables). */
function literalTokens(el) {
  const cs = getComputedStyle(el), get = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
  const out = {};
  for (const [k, v] of Object.entries(VARS)) out[k] = get(v, DEF[k]);
  out.cat = CAT.map((c, i) => get(`--ss-cat-${i + 1}`, c));
  out.font = get('--ss-font-sans', 'Inter, Helvetica Neue, Arial, sans-serif');
  return out;
}
function rgbOf(color) {
  const c = String(color).trim(), hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(c);
  if (hex) { const h = hex[1].length === 3 ? hex[1].replace(/./g, x => x + x) : hex[1]; return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); }
  const m = /rgba?\(([^)]+)\)/.exec(c);
  return m ? m[1].split(/[\s,/]+/).slice(0, 3).map(Number) : [90, 102, 118];
}

/* ======================================================================= text */

let measurer;
/** Rendered width of a string in px (canvas metrics with the slide's font). */
function textWidth(s, size = 16, weight = 400, family = 'Inter, sans-serif') {
  try {
    measurer ||= document.createElement('canvas').getContext('2d');
    measurer.font = `${weight} ${size}px ${family}`;
    return measurer.measureText(String(s)).width;
  } catch { return String(s).length * size * 0.56; }
}
const CJK = /[　-ヿ㐀-鿿＀-￯]/;
const NO_START = /^[、。，．・：；？！」』）〕］｝〉》ー々ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ%）)]/;
/** Greedy line breaking for SVG labels: Latin breaks at spaces, CJK between characters. */
function wrapText(s, maxWidth, size, weight, family) {
  const tokens = String(s).match(/[　-ヿ㐀-鿿＀-￯]|[^\s　-ヿ㐀-鿿＀-￯]+|\s+/g) || [];
  const lines = []; let line = '';
  for (const t of tokens) {
    const next = line + t;
    if (!line || textWidth(next.trimEnd(), size, weight, family) <= maxWidth || NO_START.test(t)) line = next;
    else { lines.push(line.trim()); line = /^\s+$/.test(t) ? '' : t; }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

/* ======================================================================= SVG kit */

const css = o => Object.entries(o).filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== false).map(([k, v]) => `${k}:${v}`).join(';');
function tag(name, attrs = {}, body) {
  let a = '';
  for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined && v !== false && v !== '') a += ` ${k}="${esc(v)}"`;
  return body === undefined || body === null ? `<${name}${a}/>` : `<${name}${a}>${body}</${name}>`;
}
const line = (x1, y1, x2, y2, { stroke = C.rule, width = 1, dash, cap, opacity, extra } = {}) =>
  tag('line', { x1: r2(x1), y1: r2(y1), x2: r2(x2), y2: r2(y2), ...extra, style: css({ stroke, 'stroke-width': width, 'stroke-dasharray': dash, 'stroke-linecap': cap, opacity }) });
const rect = (x, y, w, h, { fill = C.surface, stroke, width = 1, rx, opacity, extra } = {}) =>
  tag('rect', { x: r2(x), y: r2(y), width: r2(Math.max(0, w)), height: r2(Math.max(0, h)), rx, ...extra, style: css({ fill, stroke, 'stroke-width': stroke ? width : null, opacity }) });
const circle = (cx, cy, r, { fill = C.ink, stroke, width = 1.5, opacity, extra } = {}) =>
  tag('circle', { cx: r2(cx), cy: r2(cy), r: r2(r), ...extra, style: css({ fill, stroke, 'stroke-width': stroke ? width : null, opacity }) });
const path = (d, { stroke = C.ink, width = 2, fill = 'none', dash, join = 'round', cap = 'round', opacity, extra } = {}) =>
  tag('path', { d, ...extra, style: css({ fill, stroke, 'stroke-width': width, 'stroke-dasharray': dash, 'stroke-linejoin': join, 'stroke-linecap': cap, opacity }) });
const polyline = (pts, opts) => (pts.length ? path('M' + pts.map(p => `${r2(p[0])} ${r2(p[1])}`).join('L'), opts) : '');
/** Text with figure-engine alignment: valign top|middle|bottom|baseline; lines for multi-line labels. */
function text(x, y, s, { size = 16, fill = C.ink, weight, anchor = 'start', valign = 'baseline', halo, italic, lh = 1.25, extra, cls, num } = {}) {
  const list = Array.isArray(s) ? s : [s], k = list.length, step = size * lh;
  let y0 = y;
  if (valign === 'top') y0 = y + size * 0.76;
  else if (valign === 'middle') y0 = y - ((k - 1) * step) / 2 + size * 0.36;
  else if (valign === 'bottom') y0 = y - (k - 1) * step;
  const a = { x: r2(x), y: r2(y0), 'text-anchor': anchor === 'start' ? null : anchor, class: cls, ...extra,
    style: css({ fill, 'font-size': size + 'px', 'font-weight': weight, 'font-style': italic ? 'italic' : null, 'font-variant-numeric': num ? 'tabular-nums' : null,
      ...(halo ? { stroke: halo, 'stroke-width': '4px', 'stroke-linejoin': 'round', 'paint-order': 'stroke' } : {}) }) };
  if (k === 1) return tag('text', a, esc(list[0]));
  return tag('text', a, list.map((l, i) => tag('tspan', { x: r2(x), dy: i ? r2(step) : null }, esc(l))).join(''));
}
// Tabular figures are set per numeric label: in Inter they also widen hyphens inside words.
const svgRoot = (W, H, body, label) => tag('svg', { viewBox: `0 0 ${r2(W)} ${r2(H)}`, role: 'img', 'aria-label': label,
  style: css({ 'font-family': FONT }) }, body);
const arrowHead = (x, y, angle, size = 9, fill = C.ink) => {
  const a = angle, p = (d, s) => [x - size * Math.cos(a) + d * Math.sin(a) * s, y - size * Math.sin(a) - d * Math.cos(a) * s];
  const [l, r] = [p(1, size * 0.55), p(-1, size * 0.55)];
  return tag('path', { d: `M${r2(x)} ${r2(y)}L${r2(l[0])} ${r2(l[1])}L${r2(r[0])} ${r2(r[1])}Z`, style: css({ fill }) });
};

/* ======================================================================= scales and axes */

function niceStep(span, count = 5) {
  if (!(span > 0)) return 1;
  const raw = span / Math.max(1, count), mag = 10 ** Math.floor(Math.log10(raw)), f = raw / mag;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
}
function ticks(lo, hi, count = 5) {
  const s = niceStep(hi - lo, count), out = [];
  for (let v = Math.ceil(lo / s - 1e-9) * s; v <= hi + s * 1e-9; v += s) out.push(Math.round(v / s) * s);
  return out.map(v => Number(v.toPrecision(12)));
}
/** Decimals needed to print a list of tick values (0 for whole numbers). */
const tickDigits = values => Math.max(0, ...values.map(v => (String(Number(Number(v).toPrecision(10))).split('.')[1] || '').length));
function niceDomain(lo, hi, count = 5) {
  if (lo === hi) { lo -= 1; hi += 1; }
  const s = niceStep(hi - lo, count);
  return [Math.floor(lo / s + 1e-9) * s, Math.ceil(hi / s - 1e-9) * s];
}
function linear([d0, d1], [r0, r1]) {
  const span = d1 - d0 || 1;
  const f = v => r0 + ((v - d0) / span) * (r1 - r0);
  f.invert = p => d0 + ((p - r0) / (r1 - r0 || 1)) * span;
  f.domain = [d0, d1]; f.range = [r0, r1];
  return f;
}
/** Horizontal axis: tick labels under `y`, optional grid lines, crowded labels thinned. */
function axisX(x, { y, values, format = String, grid, size = 16, family, zeroLine = false } = {}) {
  let out = '', right = -Infinity;
  const r0 = Math.min(...(x.range || [-Infinity]));
  for (const v of values) {
    const px = x(v);
    if (grid) out += line(px, grid[0], px, grid[1], { stroke: zeroLine && v === 0 ? C.ink : C.grid, width: zeroLine && v === 0 ? 1.4 : 1 });
    const label = typeof v === 'object' ? v.label : format(v), w = textWidth(label, size, 400, family);
    // A label that would reach into the y axis's labels (which end 10 px left of the plot) starts at its tick.
    const anchor = px - w / 2 < r0 - 8 ? 'start' : 'middle';
    const left = anchor === 'start' ? px : px - w / 2;
    if (left < right + 10) continue;
    out += text(px, y + 8, label, { size, fill: C.muted, anchor, valign: 'top', num: true });
    right = left + w;
  }
  return out;
}
/** Vertical axis: right-aligned labels left of `x`, horizontal grid lines across `grid`. */
function axisY(y, { x, values, format = String, grid, size = 16, zeroLine = true } = {}) {
  let out = '';
  for (const v of values) {
    const py = y(v);
    if (grid) out += line(grid[0], py, grid[1], py, { stroke: zeroLine && v === 0 ? C.ink : C.grid, width: zeroLine && v === 0 ? 1.4 : 1 });
    out += text(x - 10, py, format(v), { size, fill: C.muted, anchor: 'end', valign: 'middle', num: true });
  }
  return out;
}
/** Spread label centres apart by `gap` inside [lo, hi], keeping their order. */
function spread(ys, gap, lo, hi) {
  const s = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < s.length; k++) s[k].y = Math.max(s[k].y, s[k - 1].y + gap);
  if (s.length && s[s.length - 1].y > hi) { s[s.length - 1].y = hi; for (let k = s.length - 2; k >= 0; k--) s[k].y = Math.min(s[k].y, s[k + 1].y - gap); }
  if (s.length && s[0].y < lo) { s[0].y = lo; for (let k = 1; k < s.length; k++) s[k].y = Math.max(s[k].y, s[k - 1].y + gap); }
  return s.sort((a, b) => a.i - b.i).map(o => o.y);
}
/** Levels for a dot stack / beeswarm: dots closer than one diameter go up a level. */
function stackLevels(xs, r) {
  const order = xs.map((_, i) => i).sort((a, b) => xs[a] - xs[b]), placed = [], level = [];
  for (const i of order) {
    let k = 0;
    while (placed.some(p => p.k === k && Math.abs(p.x - xs[i]) < 2 * r * 0.98)) k++;
    placed.push({ x: xs[i], k }); level[i] = k;
  }
  return level;
}

/* ======================================================================= defaults */

const DEFAULT_VALUES = [.08, .12, .15, .21, .24, .28, .33, .37, .4, .43, .48, .51, .55, .62, .68, .7, .74, .8, .86, .93];
const DEFAULT_SERIES = Array.from({ length: 28 }, (_, i) => ({ x: i / 27, y: .13 + i / 36 + .13 * Math.sin(i * 2.1), group: i % 3, id: i + 1 }));
const UI = {
  en: { reset: 'Reset example', settings: 'Settings shown', on: 'Included', off: 'Excluded', playPause: 'Play / pause',
    seek: 'Seek to 2 seconds', blocked: 'Playback was blocked. Use the native play control.', measuring: 'Measuring the photograph…',
    allHidden: 'All layers are hidden.', noChoice: '—' },
  ja: { reset: 'リセット', settings: '表示中の設定', on: 'あり', off: 'なし', playPause: '再生／一時停止',
    seek: '2秒へ移動', blocked: '再生できませんでした。動画の再生ボタンを使ってください。', measuring: '写真を計測しています…',
    allHidden: 'すべてのレイヤーが非表示です。', noChoice: '未選択' },
};
/** Seeded linear congruential generator; the same seed always gives the same resample. */
function lcg(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

/* ======================================================================= mount */

function mount(config, defaultAssets) {
  const make = KINDS[config.kind];
  if (!make) throw Error('Unknown widget kind ' + config.kind);
  const root = document.getElementById(config.id);
  if (!root) throw Error('Widget root not found: ' + config.id);
  const plot = root.querySelector('.w-plot'), panel = root.querySelector('.w-controls'), status = root.querySelector('.w-status');
  if (!plot || !panel || !status) throw Error(`Widget ${config.id} needs .w-plot, .w-controls and .w-status`);
  root.classList.add('w-kind-' + config.kind);
  const abort = new AbortController();
  const on = (el, type, fn, opts) => el.addEventListener(type, fn, { signal: abort.signal, ...opts });
  const locale = config.locale || root.closest('[lang]')?.getAttribute('lang') || document.documentElement.lang || 'en';
  const ui = { ...(UI[locale.slice(0, 2)] || UI.en), ...(config.text || {}) };
  const assets = { ...defaultAssets, ...(config.assets || {}) };
  let state = clone(config.initial), lastSize = '', family = null;
  const bindings = [];

  panel.dataset.static = 'hide';
  const summary = document.createElement('div');
  summary.className = 'w-export-summary'; summary.dataset.static = 'show';
  const readout = document.createElement('div');
  readout.className = 'w-readout';
  panel.after(summary, readout);
  // The rail: one column beside the plot holding the controls, the settings shown in a static export,
  // the readout, the status sentence and reset. The plot keeps the widget's full height whatever the rail holds.
  const rail = root.querySelector('.w-rail') || document.createElement('div');
  rail.className = 'w-rail';
  if (!rail.parentNode) root.append(rail);
  rail.append(panel, summary, readout, status);

  const spec = (key, defaults) => {
    const own = config.controls?.[key];
    if (own === false) return null;
    return { ...defaults, ...(own || {}) };
  };
  const field = (cls, html) => { const el = document.createElement('label'); el.className = cls; el.innerHTML = html; return el; };
  const valueText = (s, v) => {
    if (s.values) { const i = s.values.indexOf(v); return s.labels?.[i] ?? fill(s.format || '{v}', { v: fmt(v, s.digits ?? 0, locale) }, locale); }
    if (s.labels && isNum(v)) return s.labels[Math.round((v - (s.min ?? 0)) / (s.step || 1))] ?? String(v);
    return fill(s.format || '{v}', { v: typeof v === 'number' ? fmt(v, s.digits ?? 0, locale, false, !s.plain) : v }, locale);
  };

  function slider(key, s, container = panel) {
    if (!s) return null;
    const discrete = Array.isArray(s.values);
    const label = field('w-field w-range', `<span class="w-label">${esc(s.label)}</span><output class="w-value" aria-hidden="true"></output>
      <input type="range" min="${discrete ? 0 : s.min}" max="${discrete ? s.values.length - 1 : s.max}" step="${discrete ? 1 : s.step ?? 1}" aria-label="${esc(s.label)}">`);
    const input = label.querySelector('input');
    container.append(label);
    on(input, 'input', () => { state[key] = discrete ? s.values[Number(input.value)] : Number(input.value); render(); });
    bindings.push({ key, type: 'range', el: input, spec: s, out: label.querySelector('output') });
    return input;
  }
  function select(key, s, container = panel) {
    if (!s) return null;
    const label = field('w-field w-select', `<span class="w-label">${esc(s.label)}</span><select aria-label="${esc(s.label)}">${
      s.options.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join('')}</select>`);
    const el = label.querySelector('select');
    container.append(label);
    const commit = () => { const raw = el.value; state[key] = s.numeric ? Number(raw) : raw; render(); };
    on(el, 'change', commit); on(el, 'input', commit);
    bindings.push({ key, type: 'select', el, spec: s });
    return el;
  }
  function check(key, s, container = panel) {
    if (!s) return null;
    const label = field('w-check', `<input type="checkbox"><span>${esc(s.label)}</span>`);
    const el = label.querySelector('input');
    container.append(label);
    on(el, 'change', () => { state[key] = el.checked; render(); });
    bindings.push({ key, type: 'check', el, spec: s });
    return el;
  }
  function radios(key, s, container = panel) {
    if (!s) return null;
    const set = document.createElement('fieldset');
    set.className = 'w-radios' + (s.cls ? ' ' + s.cls : '');
    set.innerHTML = `<legend class="${s.showLegend ? 'w-label' : 'w-sr'}">${esc(s.label)}</legend>` + s.options.map(([v, t]) =>
      `<label class="w-radio"><input type="radio" name="${esc(config.id + '-' + key)}" value="${esc(v)}" aria-label="${esc(t)}"><span>${esc(t)}</span></label>`).join('');
    container.append(set);
    for (const el of set.querySelectorAll('input')) on(el, 'change', () => { if (el.checked) { state[key] = el.value; render(); } });
    bindings.push({ key, type: 'radios', el: set, spec: s });
    return set;
  }
  function button(title, fn, { cls, container = panel, hideStatic = false } = {}) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = title;
    if (cls) b.className = cls;
    if (hideStatic) b.dataset.static = 'hide';
    container.append(b);
    on(b, 'click', fn);
    return b;
  }
  function syncControls() {
    for (const b of bindings) {
      const v = state[b.key];
      if (b.type === 'range') {
        const pos = b.spec.values ? Math.max(0, b.spec.values.indexOf(v)) : v;
        if (String(b.el.value) !== String(pos)) b.el.value = pos;
        const shown = valueText(b.spec, v);
        b.out.textContent = shown;
        b.el.setAttribute('aria-valuetext', shown);
      } else if (b.type === 'select') { if (b.el.value !== String(v)) b.el.value = String(v); }
      else if (b.type === 'check') b.el.checked = !!v;
      else if (b.type === 'radios') for (const r of b.el.querySelectorAll('input')) r.checked = r.value === String(v);
    }
  }
  function writeSummary() {
    const rows = bindings.filter(b => b.spec.summary !== false).map(b => {
      const v = state[b.key];
      const shown = b.type === 'check' ? (v ? b.spec.on ?? ui.on : b.spec.off ?? ui.off)
        : b.type === 'select' || b.type === 'radios' ? (b.spec.options.find(([k]) => String(k) === String(v))?.[1] ?? ui.noChoice)
        : valueText(b.spec, v);
      // One line per control ("Label: value"), so no element repeats a control's label verbatim.
      return `<p>${esc(b.spec.summaryLabel || b.spec.label)}${locale.startsWith('ja') ? '：' : ': '}<b>${esc(shown)}</b></p>`;
    });
    summary.innerHTML = rows.length ? `<p class="w-summary-head">${esc(ui.settings)}</p>${rows.join('')}` : '';
  }
  function setReadout(items) {
    readout.innerHTML = (items || []).map(it => `<div class="w-kpi${it.tone ? ' w-kpi--' + esc(it.tone) : ''}"><b>${esc(it.value)}${it.unit ? `<small>${esc(it.unit)}</small>` : ''}</b><span>${esc(it.label)}</span></div>`).join('');
  }
  function plotSize() {
    const W = plot.clientWidth, H = plot.clientHeight;
    if (W > 40 && H > 40) return { width: W, height: H };
    const s = config.size || [816, 480];
    return { width: s[0], height: s[1] };
  }
  function draw(html) {
    const active = document.activeElement, key = active && plot.contains(active) ? active.dataset.wFocus : null;
    plot.innerHTML = html;
    if (key) plot.querySelector(`[data-w-focus="${CSS.escape(key)}"]`)?.focus();
  }
  const w = {
    config, root, plot, panel, status, readout, assets, ui, locale, on, abort,
    data: config.data || {}, axes: config.axes || {}, text: config.text || {},
    get state() { return state; }, set state(v) { state = v; },
    spec, slider, select, check, radios, button, draw, size: plotSize, render: () => render(),
    fmt: (v, d = 0, signed = false, group = true) => fmt(v, d, locale, signed, group), fill: (t, v) => fill(t, v, locale),
    /** Number on an axis: axes.x.plain (years, codes) turns off digit grouping. */
    ax: (v, spec, d) => fmt(v, spec?.digits ?? d ?? 0, locale, false, !spec?.plain),
    font: () => (family ||= literalTokens(root).font),
    tw: (s, size = 16, weight = 400) => textWidth(s, size, weight, w.font()),
    wrap: (s, width, size = 16, weight = 400) => wrapText(s, width, size, weight, w.font()),
  };
  const view = make(w) || {};
  // Reset closes the rail, after the status sentence.
  const resetButton = button(ui.reset, () => reset(), { cls: 'w-reset', container: rail, hideStatic: true });
  resetButton.dataset.wReset = '';

  function render() {
    lastSize = `${plot.clientWidth}x${plot.clientHeight}`;
    syncControls();
    const out = view.render ? view.render(state) : '';
    const message = typeof out === 'string' ? out : out?.status ?? '';
    if (status.textContent !== message) status.textContent = message;
    const items = out?.readout ?? (Array.isArray(w.text.readout) ? w.text.readout.map(r => ({ ...r, value: w.fill(r.value, out?.values || {}), label: w.fill(r.label, out?.values || {}), unit: r.unit ? w.fill(r.unit, out?.values || {}) : '' })) : null);
    setReadout(items);
    root.dataset.state = JSON.stringify(state);
    writeSummary();
  }
  function reset() { state = clone(config.initial); view.reset?.(); render(); }
  render();
  const hooks = {
    reset,
    snapshot: () => clone(state),
    restore: s => { if (s) { state = clone(s); view.restore?.(); render(); } },
    onEnter: () => { if (`${plot.clientWidth}x${plot.clientHeight}` !== lastSize) render(); },
    onStep: () => {},
    onLeave: () => view.leave?.(),
    onExport: () => { view.leave?.(); render(); },
    dispose: () => { abort.abort(); view.leave?.(); },
  };
  SlideStudio.register(config.id, hooks);
  return hooks;
}

/* ======================================================================= shared drawings */

/** A plot box inside W×H with margins; returns edges and inner size. */
const box = (W, H, m) => ({ l: m.l, r: W - m.r, t: m.t, b: H - m.b, w: W - m.l - m.r, h: H - m.t - m.b });
/** Axis titles in the house style: y title above the axis, x title under the ticks at the right end. */
const yTitle = (b, s) => (s ? text(b.l, b.t - 18, s, { size: 16, fill: C.muted, valign: 'bottom' }) : '');
const xTitle = (b, s, y = b.b + 36) => (s ? text(b.r, y, s, { size: 16, fill: C.muted, anchor: 'end', valign: 'top' }) : '');
/** Horizontal reference lines with labels at the right end (data.refs: [{y, label, tone}]). */
function refLines(refs, y, b) {
  let out = '';
  for (const ref of refs || []) {
    const py = y(ref.y), col = tone(ref.tone, C.muted), above = ref.side !== 'below', left = ref.align === 'left';
    out += line(b.l, py, b.r, py, { stroke: col, width: 1.4, dash: ref.dash === false ? null : '5 4' });
    if (ref.label) out += text(left ? b.l + 6 : b.r - 4, above ? py - 6 : py + 6, ref.label, { size: 16, fill: col, anchor: left ? 'start' : 'end', valign: above ? 'bottom' : 'top', weight: 600, halo: C.paper });
  }
  return out;
}
/** Series → svg path points with gaps for null values. */
function seriesPath(xs, ys, x, y) {
  let d = '', pen = false;
  ys.forEach((v, i) => { if (v === null || !isNum(v)) { pen = false; return; } d += `${pen ? 'L' : 'M'}${r2(x(xs[i]))} ${r2(y(v))}`; pen = true; });
  return d;
}

/* ======================================================================= kinds */

const KINDS = {};

/* ---------- parameter: recompute a documented formula as named parameters change ---------- */
// Models (config.data.model, default 'sine'); parameters are state keys with the same names.
//   sine      y = amplitude · sin(2π · frequency · t)
//   decay     N(t) = initial · 2^(−t / halfLife)
//   logistic  P(t) = capacity / (1 + (capacity / start − 1) · e^(−rate · t))      constants: start
//   dosing    C(t) = Σ (dose / volume) · e^(−k (t − n·interval)), k = ln 2 / halfLife, one bolus
//             every `interval` hours up to `horizon` (one-compartment, IV bolus)  constants: volume, interval, horizon
const MODELS = {
  sine: {
    params: { frequency: { label: 'Frequency', min: 1, max: 6, step: 0.1, digits: 1 }, amplitude: { label: 'Amplitude', min: 0.1, max: 1, step: 0.05, digits: 2 } },
    x: [0, 1], y: [-1, 1], at: (p, t) => p.amplitude * Math.sin(2 * Math.PI * p.frequency * t),
    status: 'Synthetic sine function · f = {frequency}, amplitude = {amplitude}',
  },
  decay: {
    params: { initial: { label: 'Initial amount', min: 10, max: 100, step: 5 }, halfLife: { label: 'Half-life', min: 1, max: 20, step: 0.5, digits: 1 } },
    x: [0, 40], y: [0, 100], at: (p, t) => p.initial * 2 ** (-t / p.halfLife),
    status: 'Half-life {halfLife}: {end} remains at the end of the window.',
  },
  logistic: {
    params: { rate: { label: 'Growth rate per period', min: 0.05, max: 1, step: 0.05, digits: 2 }, capacity: { label: 'Ceiling', min: 10, max: 100, step: 5 } },
    constants: { start: 1 }, x: [0, 30], y: [0, 100],
    at: (p, t) => p.capacity / (1 + (p.capacity / p.start - 1) * Math.exp(-p.rate * t)),
    status: 'Half the ceiling is reached at t = {half}.',
  },
  dosing: {
    params: { dose: { label: 'Dose (mg)', min: 100, max: 1000, step: 50 }, halfLife: { label: 'Half-life (hours)', min: 1, max: 24, step: 0.5, digits: 1 } },
    constants: { volume: 30, interval: 8, horizon: 72 }, x: [0, 72], y: [0, 50],
    at: (p, t) => {
      const k = Math.LN2 / p.halfLife; let c = 0;
      for (let n = 0; n * p.interval <= t + 1e-9 && n * p.interval < p.horizon; n++) c += (p.dose / p.volume) * Math.exp(-k * (t - n * p.interval));
      return c;
    },
    status: 'Steady state {ssTrough}–{ssPeak} mg/L; {hoursAbove} h above and {hoursBelow} h below the window.',
  },
};
function dosingStats(m, p, win) {
  const k = Math.LN2 / p.halfLife, r = Math.exp(-k * p.interval), c0 = p.dose / p.volume;
  const ssPeak = c0 / (1 - r), ssTrough = ssPeak * r, dt = 0.01;
  let peak = 0, above = 0, below = 0, firstAbove = null;
  for (let t = 0; t < p.horizon; t += dt) {
    const c = m.at(p, t);
    peak = Math.max(peak, c);
    if (win && c > win[1]) { above += dt; if (firstAbove === null) firstAbove = t; }
    if (win && c < win[0]) below += dt;
  }
  const lastDose = Math.ceil(p.horizon / p.interval - 1e-9) - 1;
  const trough = m.at(p, (lastDose + 1) * p.interval - 1e-6);
  return { k, ssPeak, ssTrough, peak, trough, above, below, firstAbove, accumulation: 1 / (1 - r) };
}
KINDS.parameter = w => {
  const d = w.data, model = MODELS[d.model || w.config.model || 'sine'];
  if (!model) throw Error('Unknown parameter model ' + d.model);
  const keys = Object.keys(model.params);
  for (const key of keys) w.slider(key, w.spec(key, model.params[key]));
  const constants = { ...(model.constants || {}), ...(d.constants || {}) };
  return {
    render(s) {
      const p = { ...constants }; for (const key of keys) p[key] = Number(s[key]);
      const { width: W, height: H } = w.size(), ax = w.axes;
      const xd = [ax.x?.min ?? (d.model === 'dosing' ? 0 : model.x[0]), ax.x?.max ?? (d.model === 'dosing' ? constants.horizon : model.x[1])];
      const yd = [ax.y?.min ?? model.y[0], ax.y?.max ?? model.y[1]];
      const b = box(W, H, { l: 64, r: 16, t: 44, b: 64 });
      const x = linear(xd, [b.l, b.r]), y = linear(yd, [b.b, b.t]);
      const yt = ax.y?.ticks || ticks(yd[0], yd[1], 5), xt = ax.x?.ticks || ticks(xd[0], xd[1], 8);
      const fx = v => w.fmt(v, ax.x?.tickDigits ?? tickDigits(xt)), fy = v => w.fmt(v, ax.y?.tickDigits ?? tickDigits(yt));
      let out = axisY(y, { x: b.l, values: yt, format: fy, grid: [b.l, b.r] });
      out += axisX(x, { y: b.b, values: xt, format: fx });
      out += line(b.l, b.b, b.r, b.b, { stroke: C.ink, width: 1.4 });
      out += yTitle(b, ax.y?.title) + xTitle(b, ax.x?.title);
      for (const band of d.bands || []) out += path(`M${r2(b.l)} ${r2(y(band.to))}H${r2(b.r)}V${r2(y(band.from))}H${r2(b.l)}Z`, { fill: C.surface, stroke: 'none', width: 0 }) +
        (band.label ? text(b.l + 10, y(band.to) + 8, band.label, { size: 16, fill: C.muted, valign: 'top' }) : '');
      // Sample the curve; dosing jumps at each dose instead of ramping.
      const pts = [];
      if (d.model === 'dosing') {
        for (let n = 0; n * p.interval < Math.min(p.horizon, xd[1]); n++) {
          const t0 = n * p.interval, t1 = Math.min((n + 1) * p.interval, xd[1]);
          if (n) pts.push([t0, model.at(p, t0 - 1e-6)]);
          for (let t = t0; t < t1; t += (t1 - t0) / 60) pts.push([t, model.at(p, t)]);
          pts.push([t1, model.at(p, t1 - 1e-6)]);
        }
      } else for (let i = 0; i <= 400; i++) { const t = xd[0] + (i / 400) * (xd[1] - xd[0]); pts.push([t, model.at(p, t)]); }
      // The curve is clipped to the plot; where it passes the upper limit, a negative-coloured copy shows.
      const clipId = `${w.config.id}-clip`, overId = `${w.config.id}-over`, P = pts.map(([t, v]) => [x(t), y(v)]);
      out += tag('defs', {}, tag('clipPath', { id: clipId }, rect(b.l, b.t - 2, b.w, b.h + 4, {})) +
        (d.window ? tag('clipPath', { id: overId }, rect(b.l, b.t - 2, b.w, y(d.window[1]) - b.t + 2, {})) : ''));
      out += tag('g', { 'clip-path': `url(#${clipId})` }, polyline(P, { stroke: C.accent, width: 3 }) +
        (d.window ? tag('g', { 'clip-path': `url(#${overId})` }, polyline(P, { stroke: C.negative, width: 3.4 })) : ''));
      out += refLines(d.refs, y, b);
      // A curve that leaves the fixed scale says so where it leaves, instead of silently rescaling.
      const exit = pts.find(([, v]) => v > yd[1]);
      if (exit) {
        const top = Math.max(...pts.map(([, v]) => v)), note = fill(w.text.offScale || '↑ off scale, up to {v}', { v: w.fmt(top, ax.y?.digits ?? 1) }, w.locale);
        out += text(b.r, b.t - 18, note, { size: 16, weight: 650, fill: C.negative, anchor: 'end', valign: 'bottom' });
      }
      const values = Object.fromEntries(keys.map(key => [key, w.fmt(p[key], (w.config.controls?.[key]?.digits ?? model.params[key].digits) || 0)]));
      if (d.model === 'dosing') {
        const st = dosingStats(model, p, d.window);
        const dg = ax.y?.digits ?? 1;
        Object.assign(values, { peak: w.fmt(st.peak, dg), trough: w.fmt(st.trough, dg), ssPeak: w.fmt(st.ssPeak, dg), ssTrough: w.fmt(st.ssTrough, dg),
          hoursAbove: w.fmt(st.above, 1), hoursBelow: w.fmt(st.below, 1), firstAbove: st.firstAbove === null ? '—' : w.fmt(Math.floor(st.firstAbove), 0),
          accumulation: w.fmt(st.accumulation, 2), min: d.window ? w.fmt(d.window[0], 0) : '', max: d.window ? w.fmt(d.window[1], 0) : '' });
        // Mark the last dose interval's peak and trough on the curve.
        const lastDose = Math.ceil(p.horizon / p.interval - 1e-9) - 1, tp = lastDose * p.interval, tt = (lastDose + 1) * p.interval - 1e-6;
        if (tp >= xd[0] && tt <= xd[1] + 1e-6) {
          const cp = model.at(p, tp), ct = model.at(p, tt);
          if (cp <= yd[1]) out += circle(x(tp), y(cp), 5.5, { fill: C.paper, stroke: cp > (d.window?.[1] ?? Infinity) ? C.negative : C.accent, width: 2.6 });
          if (ct <= yd[1]) out += circle(x(tt), y(ct), 5.5, { fill: C.paper, stroke: C.accent, width: 2.6 });
          if (w.text.peakLabel && cp <= yd[1]) out += text(x(tp), Math.max(b.t + 4, y(cp) - 12), fill(w.text.peakLabel, { v: w.fmt(cp, dg) }, w.locale), { size: 16, anchor: 'middle', valign: 'bottom', weight: 650, fill: cp > (d.window?.[1] ?? Infinity) ? C.negative : C.ink, halo: C.paper });
        }
      } else if (d.model === 'decay') values.end = w.fmt(model.at(p, xd[1]), 1);
      else if (d.model === 'logistic') values.half = w.fmt(Math.log(p.capacity / p.start - 1) / p.rate, 1);
      w.draw(svgRoot(W, H, out, w.text.figure || 'Curve recomputed from the selected parameters'));
      return { status: w.fill(w.text.status || model.status, values), values };
    },
  };
};

/* ---------- threshold: a cut-off sorts scored cases into four outcomes ---------- */
KINDS.threshold = w => {
  const d = w.data, values = (d.values || DEFAULT_VALUES).slice(), domain = d.domain || [0, 1];
  if (!values.length || values.length > 1000 || values.some(v => !isNum(v) || v < domain[0] || v > domain[1]))
    throw Error(`Threshold values must be 1..1000 finite scores in [${domain}]. Declare data.domain for other scales.`);
  if (d.labels && (d.labels.length !== values.length || d.labels.some(v => v !== 0 && v !== 1))) throw Error('One binary label is required per score.');
  const labels = d.labels || values.map((v, i) => (i % 5 === 0 ? Number(v < .5) : Number(v > .45)));
  w.slider('threshold', w.spec('threshold', { label: 'Decision threshold', min: .05, max: .95, step: .05, digits: 2 }));
  const t = w.text;
  return {
    render(s) {
      const th = Number(s.threshold);
      let tp = 0, fp = 0, fn = 0, tn = 0;
      values.forEach((v, i) => { if (v >= th) labels[i] ? tp++ : fp++; else labels[i] ? fn++ : tn++; });
      s.counts = { tp, fp, fn, tn };
      const { width: W, height: H } = w.size(), ax = w.axes;
      const rowNames = [t.positive || 'Positive', t.negative || 'Negative'];
      const nPos = labels.filter(Boolean).length, counts2 = [nPos, labels.length - nPos];
      const countLine = n => fill(t.rowCount || '{n|case|cases}', { n }, w.locale);
      const labelW = Math.max(...rowNames.map((n, k) => Math.max(w.tw(n, 18, 650), w.tw(countLine(counts2[k]), 18, 400)))) + 34;
      const b = box(W, H, { l: Math.max(110, labelW), r: 20, t: 70, b: 62 });
      const x = linear(domain, [b.l + 12, b.r - 12]);
      const gap = 30, lane = 30;
      // Each row is as tall as its tallest stack needs (at least three dots); the dot radius is the largest that fits.
      const idxOf = cls => values.map((_, i) => i).filter(i => labels[i] === cls);
      let r = 11, lv = [], heights;
      for (; r > 3; r -= 0.25) {
        lv = [1, 0].map(cls => stackLevels(idxOf(cls).map(i => x(values[i])), r));
        heights = lv.map(l => Math.max(3, Math.max(0, ...l) + 1) * 2 * r * 1.08 + lane);
        if (heights[0] + heights[1] + gap <= b.h) break;
      }
      const spare = b.h - gap - heights[0] - heights[1];
      heights = heights.map(h => h + spare / 2);
      const boundary = d.step ? th - d.step / 2 : th, bx = x(boundary);
      let out = rect(bx, b.t - 6, b.r - bx, b.h + 6, { fill: C.surface });
      const rows = [{ y0: b.t, cls: 1, h: heights[0], lv: lv[0] }, { y0: b.t + heights[0] + gap, cls: 0, h: heights[1], lv: lv[1] }];
      // Separate stacks per row so each row's dots start at its own baseline.
      for (const row of rows) {
        const idx = idxOf(row.cls), lvs = row.lv, rowH = row.h, base = row.y0 + rowH;
        out += line(b.l, base, b.r, base, { stroke: C.rule });
        idx.forEach((i, k) => {
          const flagged = values[i] >= th, missed = row.cls === 1 && !flagged;
          const fillC = missed ? C.negative : flagged ? C.ink : C.context;
          out += circle(x(values[i]), base - r * 1.08 - lvs[k] * 2 * r * 1.08, r, { fill: fillC });
        });
        const n = idx.length, name = rowNames[row.cls ? 0 : 1], ly = base - (rowH - lane) / 2;
        out += text(b.l - 20, ly - 12, name, { size: 18, anchor: 'end', valign: 'middle', weight: 650 });
        out += text(b.l - 20, ly + 12, countLine(n), { size: 18, anchor: 'end', valign: 'middle', fill: C.muted });
        const left = row.cls ? fill(t.fn || '{fn} missed', { fn }, w.locale) : fill(t.tn || '{tn} cleared', { tn }, w.locale);
        const right = row.cls ? fill(t.tp || '{tp} caught', { tp }, w.locale) : fill(t.fp || '{fp} false alarms', { fp }, w.locale);
        const lstyle = { size: 18, weight: 650, valign: 'top', fill: row.cls && fn ? C.negative : C.muted }, rstyle = { size: 18, weight: 650, valign: 'top', fill: C.ink };
        // A count that does not fit on its side of the line moves across it, with an arrow pointing back.
        if (b.l + 4 + w.tw(left, 18, 650) <= bx - 10) out += text(b.l + 4, row.y0 + 4, left, lstyle);
        else out += text(bx + 10, row.y0 + 4, '← ' + left, lstyle);
        if (b.r - 4 - w.tw(right, 18, 650) >= bx + 10) out += text(b.r - 4, row.y0 + 4, right, { ...rstyle, anchor: 'end' });
        else out += text(bx - 10, row.y0 + 4, right + ' →', { ...rstyle, anchor: 'end' });
      }
      // Axis and the threshold line with its rule in words.
      const tickVals = ax.x?.ticks || ticks(domain[0], domain[1], 10);
      out += axisX(x, { y: b.b, values: tickVals, format: v => w.fmt(v, ax.x?.digits ?? (domain[1] - domain[0] <= 2 ? 1 : 0)) });
      out += xTitle(b, ax.x?.title || 'Score', b.b + 36);
      out += line(bx, b.t - 34, bx, b.b, { stroke: C.ink, width: 2 });
      const rule = fill(t.rule || 'Flag at {threshold} or above', { threshold: w.fmt(th, w.config.controls?.threshold?.digits ?? 2) }, w.locale);
      const rw = w.tw(rule, 17, 650), rx = clamp(bx, b.l + rw / 2, b.r - rw / 2);
      out += text(rx, b.t - 40, rule, { size: 17, weight: 650, anchor: 'middle', valign: 'bottom' });
      w.draw(svgRoot(W, H, out, t.figure || 'Scored cases by true outcome, split at the threshold'));
      const pos = tp + fn, neg = fp + tn, total = pos + neg;
      const vals = { threshold: w.fmt(th, w.config.controls?.threshold?.digits ?? 2), tp, fp, fn, tn, positives: pos, negatives: neg, total, flagged: tp + fp,
        sensitivity: w.fmt(pos ? (100 * tp) / pos : 0, 0), specificity: w.fmt(neg ? (100 * tn) / neg : 0, 0), ppv: w.fmt(tp + fp ? (100 * tp) / (tp + fp) : 0, 0),
        falseShare: tp + fp ? w.fmt((100 * fp) / (tp + fp), 0) : '–' };
      return { status: w.fill(t.status || 'Synthetic labels · TP {tp}, FP {fp}, FN {fn}, TN {tn}', vals), values: vals };
    },
  };
};

/* ---------- scrubber: one time cursor reads every series at the same instant ---------- */
function seriesData(d) {
  if (d.lines) {
    const n = d.lines[0].values.length;
    return { xs: d.x || Array.from({ length: n }, (_, i) => i), labels: d.labels || null, lines: d.lines };
  }
  const series = d.series || DEFAULT_SERIES;
  if (!Array.isArray(series) || !series.length || series.length > 1000 || series.some(v => !isNum(v.x) || !isNum(v.y))) throw Error('Example series requires finite x/y objects.');
  return { xs: series.map(p => p.x), labels: series.some(p => p.label) ? series.map(p => p.label) : null, lines: [{ name: d.name || '', values: series.map(p => p.y) }] };
}
/** Line chart with optional cursor; returns svg body and scales. Shared by scrubber and ink. */
function lineChart(w, S, { W, H, cursor, refs, margin } = {}) {
  const ax = w.axes, all = S.lines.flatMap(l => l.values).filter(isNum);
  const yd = [ax.y?.min ?? Math.min(...all), ax.y?.max ?? Math.max(...all)];
  const [y0, y1] = ax.y?.min !== undefined && ax.y?.max !== undefined ? yd : niceDomain(yd[0], yd[1], 5);
  const xd = [ax.x?.min ?? S.xs[0], ax.x?.max ?? S.xs[S.xs.length - 1]];
  const endW = Math.max(0, ...S.lines.map(l => (l.name ? w.tw(l.name, 17, 650) : 0)));
  const lastTick = ax.x?.ticks?.length ? ax.x.ticks[ax.x.ticks.length - 1] : null;
  const tickHalf = lastTick && typeof lastTick === 'object' ? w.tw(lastTick.label, 16) / 2 + 4 : 18;
  const b = box(W, H, margin || { l: 64, r: endW ? Math.max(endW + 22, tickHalf) : Math.max(18, tickHalf), t: 74, b: 62 });
  const x = linear(xd, [b.l, b.r]), y = linear([y0, y1], [b.b, b.t]);
  const dg = ax.y?.digits ?? (y1 - y0 <= 2 ? 2 : 0);
  let out = axisY(y, { x: b.l, values: ax.y?.ticks || ticks(y0, y1, 5), format: v => w.fmt(v, ax.y?.tickDigits ?? (y1 - y0 <= 2 ? 1 : 0)), grid: [b.l, b.r], zeroLine: y0 < 0 });
  const xt = ax.x?.ticks ? ax.x.ticks.map(tk => (typeof tk === 'object' ? { value: tk.value, label: tk.label } : { value: tk, label: w.fmt(tk, ax.x?.digits ?? 0) }))
    : ticks(xd[0], xd[1], 8).map(v => ({ value: v, label: w.fmt(v, ax.x?.digits ?? (xd[1] - xd[0] <= 2 ? 1 : 0)) }));
  const xv = v => x(v.value); xv.range = x.range;
  out += axisX(xv, { y: b.b, values: xt });
  out += line(b.l, b.b, b.r, b.b, { stroke: C.ink, width: 1.4 });
  out += yTitle(b, ax.y?.title) + xTitle(b, ax.x?.title, b.b + 36);
  out += refLines(refs, y, b);
  const ends = [];
  S.lines.forEach((l, k) => {
    const col = tone(l.tone, k ? C.muted : C.accent);
    out += path(seriesPath(S.xs, l.values, x, y), { stroke: col, width: l.width ?? (k ? 2 : 3), dash: l.dash ? '6 5' : null });
    const last = l.values.length - 1 - [...l.values].reverse().findIndex(isNum);
    if (l.name) ends.push({ y: y(l.values[last]), name: l.name, col });
  });
  const ey = spread(ends.map(e => e.y), 22, b.t, b.b);
  const endLabels = ends.map((e, k) => text(b.r + 10, ey[k], e.name, { size: 17, weight: 650, fill: e.col, valign: 'middle' })).join('');
  return { out, endLabels, x, y, b, dg };
}
KINDS.scrubber = w => {
  const S = seriesData(w.data), n = S.xs.length, labelOf = i => (S.labels ? S.labels[i] : `${i + 1} / ${n}`);
  w.slider('time', w.spec('time', { label: 'Time index', min: 0, max: n - 1, step: 1, labels: S.labels || undefined, format: S.labels ? undefined : '{v}' }));
  return {
    render(s) {
      const i = clamp(Math.round(Number(s.time) || 0), 0, n - 1);
      const { width: W, height: H } = w.size();
      const { out: chart, endLabels, x, y, b, dg } = lineChart(w, S, { W, H, refs: w.data.refs });
      const cx = x(S.xs[i]);
      // Near the right end the cursor's own labels name the lines; the end labels would crowd them.
      let out = chart + (cx < b.r - 120 ? endLabels : '');
      out += line(cx, b.t - 30, cx, b.b, { stroke: C.ink, width: 1.6 });
      const head = labelOf(i), hw = w.tw(head, 17, 700);
      out += text(clamp(cx, b.l + hw / 2, b.r - hw / 2), b.t - 36, head, { size: 17, weight: 700, anchor: 'middle', valign: 'bottom' });
      // Readouts beside the cursor, one per series, spread so they never collide.
      const pts = S.lines.map((l, k) => ({ v: l.values[i], col: tone(l.tone, k ? C.muted : C.accent), name: l.short ?? l.name ?? '' })).filter(p => isNum(p.v));
      const unit = w.axes.y?.unit ? ' ' + w.axes.y.unit : '';
      const labels = pts.map(p => `${p.name ? p.name + ' ' : ''}${w.fmt(p.v, dg)}${unit}`);
      const widest = Math.max(0, ...labels.map(l => w.tw(l, 17, 650)));
      const leftSide = cx + 14 + widest > b.r - 4;
      const ly = spread(pts.map(p => y(p.v)), 24, b.t + 10, b.b - 12);
      pts.forEach((p, k) => {
        out += circle(cx, y(p.v), 5.5, { fill: p.col, stroke: C.paper, width: 2 });
        out += text(cx + (leftSide ? -12 : 12), ly[k], labels[k], { size: 17, weight: 650, fill: p.col === C.muted ? C.ink : p.col, anchor: leftSide ? 'end' : 'start', valign: 'middle', halo: C.paper });
      });
      w.draw(svgRoot(W, H, out, w.text.figure || 'Series with a time cursor'));
      const v0 = S.lines[0].values[i], v1 = S.lines[1]?.values[i], prev = i ? S.lines[0].values[i - 1] : null, ref = w.data.refs?.[0]?.y;
      const vals = { label: labelOf(i), n: i + 1, i, count: n, y: w.fmt(v0, w.data.series && !w.axes.y?.digits ? 3 : dg), y2: isNum(v1) ? w.fmt(v1, dg) : '–',
        delta: isNum(v1) ? w.fmt(v0 - v1, dg, true) : '–', change: isNum(prev) ? w.fmt(v0 - prev, dg, true) : '–',
        trend: !isNum(prev) || v0 === prev ? (w.text.steady || 'steady') : v0 > prev ? (w.text.rising || 'rising') : (w.text.falling || 'falling'),
        vsRef: isNum(ref) ? w.fmt(v0 - ref, dg, true) : '–', overRef: isNum(ref) ? w.fmt(Math.abs(v0 - ref), dg) : '–', ref: isNum(ref) ? w.fmt(ref, dg) : '–' };
      let status = w.fill(w.text.status || 'Sample {n} / {count}; y = {y}', vals);
      if (isNum(ref) && w.text.statusAbove && v0 >= ref) status = w.fill(w.text.statusAbove, vals);
      return { status, values: vals };
    },
  };
};

/* ---------- comparison: one registered photograph, two declared renderings ---------- */
// L* of the greyscale rendering: CSS grayscale() mixes gamma-encoded RGB with Rec. 709 weights.
const lstar = g => { const c = g / 255, lin = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4, f = lin > 0.008856 ? Math.cbrt(lin) : 7.787 * lin + 16 / 116; return 116 * f - 16; };
KINDS.comparison = w => {
  const t = w.text, regions = w.data.regions || [];
  w.slider('split', w.spec('split', { label: 'Reveal original (%)', min: 0, max: 100, step: 1, format: '{v}%' }));
  w.plot.innerHTML = `<div class="w-compare"><img class="w-after" src="${esc(w.assets.photo)}" alt="${esc(t.afterAlt || 'Coffee photograph in grayscale')}" style="filter:${esc(w.data.filter || 'grayscale(1)')}">` +
    `<img class="w-before" src="${esc(w.assets.photo)}" alt="${esc(t.beforeAlt || 'Original color coffee photograph')}"><div class="w-divider"></div>` +
    (t.before ? `<p class="w-tag w-tag--left">${esc(t.before)}</p>` : '') + (t.after ? `<p class="w-tag w-tag--right">${esc(t.after)}</p>` : '') + '<svg class="w-regions" aria-hidden="true"></svg></div>';
  const frame = w.plot.querySelector('.w-compare'), before = w.plot.querySelector('.w-before'), after = w.plot.querySelector('.w-after');
  const divider = w.plot.querySelector('.w-divider'), overlay = w.plot.querySelector('.w-regions');
  let measured = null;
  const measure = () => {
    if (!regions.length || !after.naturalWidth) return;
    try {
      const cv = document.createElement('canvas'), nw = after.naturalWidth, nh = after.naturalHeight;
      cv.width = nw; cv.height = nh;
      const ctx = cv.getContext('2d', { willReadFrequently: true }); ctx.drawImage(after, 0, 0);
      measured = regions.map(r => {
        const px = ctx.getImageData(Math.round(r.x * nw), Math.round(r.y * nh), Math.max(1, Math.round(r.w * nw)), Math.max(1, Math.round(r.h * nh))).data;
        let s = 0, n = 0;
        for (let i = 0; i < px.length; i += 4) { s += lstar(0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]); n++; }
        return s / n;
      });
    } catch { measured = null; }
    w.render();
  };
  if (after.complete && after.naturalWidth) setTimeout(measure); else w.on(after, 'load', measure);
  let dragging = false;
  const fromPointer = e => { const r = frame.getBoundingClientRect(); w.state.split = Math.round(clamp((e.clientX - r.left) / r.width, 0, 1) * 100); w.render(); };
  w.on(frame, 'pointerdown', e => { dragging = true; frame.setPointerCapture(e.pointerId); fromPointer(e); });
  w.on(frame, 'pointermove', e => { if (dragging) fromPointer(e); });
  w.on(frame, 'pointerup', () => { dragging = false; });
  w.on(frame, 'pointercancel', () => { dragging = false; });
  return {
    render(s) {
      const split = clamp(Number(s.split), 0, 100), { width: W, height: H } = w.size();
      const nw = after.naturalWidth || 3, nh = after.naturalHeight || 2, k = Math.min(W / nw, H / nh);
      const fw = Math.floor(nw * k), fh = Math.floor(nh * k);
      frame.style.width = fw + 'px'; frame.style.height = fh + 'px';
      before.style.clipPath = `inset(0 ${100 - split}% 0 0)`;
      divider.style.left = split + '%';
      // A tag names a side only while that side is wide enough to hold it.
      const tagL = frame.querySelector('.w-tag--left'), tagR = frame.querySelector('.w-tag--right');
      if (tagL) tagL.style.visibility = (split / 100) * fw >= tagL.offsetWidth + 20 ? '' : 'hidden';
      if (tagR) tagR.style.visibility = (1 - split / 100) * fw >= tagR.offsetWidth + 20 ? '' : 'hidden';
      let marks = '';
      regions.forEach((r, i) => {
        const X = r.x * fw, Y = r.y * fh, RW = r.w * fw, RH = r.h * fh, below = r.label === 'below';
        marks += rect(X, Y, RW, RH, { fill: 'none', stroke: '#ffffff', width: 2.5 }) + rect(X, Y, RW, RH, { fill: 'none', stroke: '#111111', width: 1 });
        const caption = measured ? `${r.name}: L* ${w.fmt(measured[i], 0)}` : r.name;
        marks += text(X + RW / 2, below ? Y + RH + 8 : Y - 8, caption, { size: 16, weight: 650, anchor: 'middle', valign: below ? 'top' : 'bottom', fill: '#111111', halo: '#ffffff' });
      });
      overlay.setAttribute('viewBox', `0 0 ${fw} ${fh}`);
      overlay.innerHTML = marks;
      const vals = { split, hidden: 100 - split };
      regions.forEach((r, i) => { vals['name' + i] = r.name; vals['L' + i] = measured ? w.fmt(measured[i], 0) : '…'; });
      // Every pairwise difference in L*: {d01}, {d02}, {d12}, …
      if (measured) for (let i = 0; i < measured.length; i++) for (let j = i + 1; j < measured.length; j++) vals[`d${i}${j}`] = w.fmt(Math.abs(measured[i] - measured[j]), 0);
      if (vals.d01) vals.dL = vals.d01;
      const status = regions.length && !measured ? w.ui.measuring : w.fill(t.status || 'Same photograph and registration; grayscale is a declared display transformation.', vals);
      return { status, values: vals };
    },
  };
};

/* ---------- hotspots: a schematic whose parts explain themselves when selected ---------- */
const DEFAULT_PARTS = [
  { id: 'source', name: 'Source', body: 'Source: generates the input signal.' },
  { id: 'sample', name: 'Sample', body: 'Sample: the object being examined.' },
  { id: 'detector', name: 'Detector', body: 'Detector: records the output signal.' },
];
KINDS.hotspots = w => {
  const d = w.data, parts = d.parts || DEFAULT_PARTS;
  const links = d.links || parts.slice(1).map((p, i) => ({ from: parts[i].id, to: p.id }));
  w.select('part', w.spec('part', { label: 'Inspect a component', options: parts.map(p => [p.id, p.name]) }));
  w.on(w.plot, 'click', e => { const g = e.target.closest('[data-part]'); if (g) { w.state.part = g.dataset.part; w.render(); } });
  return {
    render(s) {
      const { width: W, height: H } = w.size(), sel = parts.find(p => p.id === s.part) || parts[0];
      const bw = d.boxWidth || Math.min(230, (W - 80) / Math.max(3, parts.length) - 40), bh = d.boxHeight || 84;
      const pos = {};
      if (d.layout === 'cycle') {
        const cx = W * (d.cx ?? 0.47), cy = H * (d.cy ?? 0.5), dx = W * (d.dx ?? 0.3), dy = H * (d.dy ?? 0.32);
        const at = { top: [cx, cy - dy], right: [cx + dx, cy], bottom: [cx, cy + dy], left: [cx - dx, cy] };
        parts.forEach(p => { pos[p.id] = at[p.at] || [cx, cy]; });
      } else parts.forEach((p, i) => { pos[p.id] = [((i + 0.5) / parts.length) * W, H * 0.46]; });
      const edge = (id, side) => { const [x, y] = pos[id]; return side === 'l' ? [x - bw / 2, y] : side === 'r' ? [x + bw / 2, y] : side === 't' ? [x, y - bh / 2] : [x, y + bh / 2]; };
      let out = '';
      // Energy or material flows across the system boundary, width ∝ value.
      const maxFlow = Math.max(1, ...(d.flows || []).map(f => f.value));
      for (const f of d.flows || []) {
        const [px, py] = pos[f.part], sw = 4 + (f.value / maxFlow) * 18, len = f.length || 64, into = f.dir !== 'out';
        const v = { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0] }[f.side || 'bottom'];
        const start = [px + v[0] * (bw / 2 + 6 + (v[0] ? 0 : 0)), py + v[1] * (bh / 2 + 6)];
        const far = [start[0] + v[0] * len, start[1] + v[1] * len];
        const [a, z] = into ? [far, start] : [start, far];
        const ang = Math.atan2(z[1] - a[1], z[0] - a[0]), tip = [z[0] - Math.cos(ang) * (sw * 0.9), z[1] - Math.sin(ang) * (sw * 0.9)];
        const col = tone(f.tone, C.muted);
        out += line(a[0], a[1], tip[0], tip[1], { stroke: col, width: sw }) + arrowHead(z[0], z[1], ang, sw * 1.15, col);
        // The label sits beside the shaft: right of a vertical arrow, above a horizontal one.
        const mid = [(start[0] + far[0]) / 2, (start[1] + far[1]) / 2], lines = w.wrap(f.label, f.labelWidth || 220, 17, 650);
        out += v[0] === 0
          ? text(mid[0] + sw / 2 + 12, mid[1], lines, { size: 17, weight: 650, fill: col === C.muted ? C.ink : col, valign: 'middle', lh: 1.25 })
          : text(far[0] + v[0] * 10, far[1], lines, { size: 17, weight: 650, fill: col === C.muted ? C.ink : col, anchor: v[0] > 0 ? 'start' : 'end', valign: 'middle', lh: 1.25 });
      }
      for (const l of links) {
        const [ax, ay] = pos[l.from], [bx, by] = pos[l.to];
        let pts;
        if (d.layout === 'cycle') {
          const horizontalFirst = Math.abs(ay - by) > 1 && Math.abs(ax - bx) > 1 ? (parts.find(p => p.id === l.from).at === 'top' || parts.find(p => p.id === l.from).at === 'bottom') : Math.abs(ay - by) < 1;
          if (horizontalFirst) { const s0 = edge(l.from, bx > ax ? 'r' : 'l'), e0 = edge(l.to, by > ay ? 't' : 'b'); pts = [s0, [e0[0], s0[1]], e0]; }
          else { const s0 = edge(l.from, by > ay ? 'b' : 't'), e0 = edge(l.to, bx > ax ? 'l' : 'r'); pts = [s0, [s0[0], e0[1]], e0]; }
        } else pts = [edge(l.from, 'r'), edge(l.to, 'l')];
        const [p1, p2] = pts.slice(-2), ang = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
        const endPt = [p2[0] - Math.cos(ang) * 3, p2[1] - Math.sin(ang) * 3];
        out += polyline([...pts.slice(0, -1), [endPt[0] - Math.cos(ang) * 8, endPt[1] - Math.sin(ang) * 8]], { stroke: tone(l.tone, C.muted), width: 2.4, join: 'miter' }) + arrowHead(endPt[0], endPt[1], ang, 11, tone(l.tone, C.muted));
        if (l.label) {
          const lines = w.wrap(l.label, l.labelWidth || 150, 16, 400);
          if (pts.length === 3) {
            // Beside the vertical run, on the outside of the loop.
            const vert = Math.abs(pts[0][0] - pts[1][0]) < 1 ? [pts[0], pts[1]] : [pts[1], pts[2]];
            // Inside the loop, where the drawing leaves room.
            const vx = vert[0][0], vy = (vert[0][1] + vert[1][1]) / 2, rightSide = vx > W * (d.cx ?? 0.47);
            out += text(vx + (rightSide ? -12 : 12), vy, lines, { size: 16, fill: C.muted, anchor: rightSide ? 'end' : 'start', valign: 'middle' });
          } else out += text((pts[0][0] + pts[1][0]) / 2, pts[0][1] - 12, lines, { size: 16, fill: C.muted, anchor: 'middle', valign: 'bottom' });
        }
      }
      for (const p of parts) {
        const [x, y] = pos[p.id], on = p.id === sel.id;
        const name = w.wrap(p.name, bw - 24, 18, 650);
        out += tag('g', { 'data-part': p.id, style: 'cursor:pointer' },
          rect(x - bw / 2, y - bh / 2, bw, bh, { fill: on ? C.accent : C.paper, stroke: on ? C.accent : C.ink, width: on ? 2.5 : 1.5, rx: 6 }) +
          text(x, y, name, { size: 18, weight: 650, anchor: 'middle', valign: 'middle', fill: on ? C.onAccent : C.ink }));
      }
      w.draw(svgRoot(W, H, out, w.text.figure || `Schematic; selected: ${sel.name}`));
      return { status: w.text.status ? w.fill(w.text.status, { name: sel.name, body: sel.body }) : sel.body, values: { name: sel.name } };
    },
  };
};

/* ---------- tabs: one page, sections the presenter opens on request ---------- */
const DEFAULT_SECTIONS = [
  { id: 'method', name: 'Method', body: 'Change one parameter while keeping the input and scale fixed.' },
  { id: 'result', name: 'Result', body: 'The demonstration recomputes a toy function from the selected parameter. It is not a measured result.' },
  { id: 'limits', name: 'Limitations', body: 'Synthetic data cannot establish scientific or product performance. Replace it with verified evidence.' },
];
KINDS.tabs = w => {
  const sections = w.data.sections || DEFAULT_SECTIONS;
  w.radios('tab', w.spec('tab', { label: 'Read a section', options: sections.map(s => [s.id, s.name]), cls: 'w-toc', showLegend: true }));
  return {
    render(s) {
      const i = Math.max(0, sections.findIndex(x => x.id === s.tab)), sec = sections[i];
      const body = (Array.isArray(sec.body) ? sec.body : [sec.body]).map(p => `<p>${esc(p)}</p>`).join('');
      const facts = (sec.facts || []).map(f => `<div class="w-kpi"><b>${esc(f.value)}</b><span>${esc(f.label)}</span></div>`).join('');
      w.draw(`<article class="w-reading"><h2>${esc(sec.title || sec.name)}</h2><div class="w-reading-body">${body}</div>${facts ? `<div class="w-facts">${facts}</div>` : ''}</article>`);
      const vals = { name: sec.name, index: i + 1, count: sections.length };
      return { status: sec.status ?? w.fill(w.text.status || 'Use sections when optional detail would distract from the main explanation.', vals), values: vals };
    },
  };
};

/* ---------- layers: toggle drawn layers of one figure without deleting them ---------- */
KINDS.layers = w => {
  const d = w.data, size = d.viewBox || [700, 360];
  const layers = d.layers || [
    { id: 'path', name: 'Connections', svg: line(165, 165, 520, 165, { stroke: C.highlight, width: 5 }) },
    { id: 'base', name: 'Base geometry', svg: rect(80, 95, 170, 145, { fill: C.context, rx: 4 }) + rect(440, 95, 170, 145, { fill: C.context, rx: 4 }) },
    { id: 'labels', name: 'Labels', svg: text(165, 280, 'Input', { size: 22, anchor: 'middle' }) + text(525, 280, 'Output', { size: 22, anchor: 'middle' }) },
  ];
  const order = d.controlOrder || (d.layers ? layers.map(l => l.id) : ['base', 'labels', 'path']);
  for (const id of order) { const l = layers.find(x => x.id === id); w.check(id, w.spec(id, { label: l.name, on: w.text.shown, off: w.text.hidden })); }
  return {
    render(s) {
      const visible = layers.filter(l => s[l.id]);
      w.draw(visible.length ? svgRoot(size[0], size[1], visible.map(l => tag('g', { 'data-layer': l.id }, l.svg)).join(''), w.text.figure || 'Layered figure')
        : `<p class="w-empty">${esc(w.ui.allHidden)}</p>`);
      const notes = visible.map(l => l.note).filter(Boolean);
      const listed = order.map(id => layers.find(l => l.id === id)).filter(l => s[l.id]);
      const vals = { shown: listed.map(l => l.name).join(w.locale.startsWith('ja') ? '・' : ', ') || '—', count: visible.length, notes: notes.join(w.locale.startsWith('ja') ? '' : ' ') };
      return { status: w.fill(w.text.status || 'Toggle layers without deleting their source geometry.', vals), values: vals };
    },
  };
};

/* ---------- table: sort rows by any column; values never leave their row ---------- */
KINDS.table = w => {
  const d = w.data, columns = d.columns || [{ key: 'item', name: 'Item' }, { key: 'value', name: 'Value' }];
  const rows = d.rows || [['A', 12], ['B', 31], ['C', 24], ['D', 18]].map(([item, value]) => ({ item, value }));
  const idKey = d.id || columns[0].key, t = w.text;
  w.button(t.reverse || 'Reverse sort', () => { w.state.ascending = !w.state.ascending; w.render(); }, { cls: 'w-reverse' });
  w.on(w.plot, 'click', e => {
    const b = e.target.closest('[data-sort]');
    if (!b) return;
    const key = b.dataset.sort, current = w.state.sortBy ?? d.sortBy ?? columns[columns.length - 1].key;
    if (key === current) w.state.ascending = !w.state.ascending; else { w.state.sortBy = key; w.state.ascending = columns.find(c => c.key === key).ascending ?? true; }
    w.render();
  });
  const cell = (c, v) => (typeof v === 'number' ? fmt(v, c.digits ?? 0, w.locale, false, !c.plain) + (c.suffix || '') : esc(v ?? ''));
  return {
    render(s) {
      const key = s.sortBy ?? d.sortBy ?? columns[columns.length - 1].key, col = columns.find(c => c.key === key) || columns[columns.length - 1];
      const dir = s.ascending ? 1 : -1;
      const sortedRows = [...rows].sort((a, b) => (typeof a[col.key] === 'number' ? (a[col.key] - b[col.key]) : String(a[col.key]).localeCompare(String(b[col.key]), w.locale)) * dir);
      s.order = sortedRows.map(r => r[idKey]);
      const head = columns.map(c => {
        const sortedHere = c.key === col.key, aria = sortedHere ? (s.ascending ? 'ascending' : 'descending') : 'none';
        const mark = sortedHere ? (s.ascending ? ' ↑' : ' ↓') : '';
        return `<th scope="col" class="${c.align === 'left' || typeof rows[0][c.key] !== 'number' ? 'w-left' : 'w-num'}${c.bar ? ' w-barcol' : ''}" aria-sort="${aria}">` +
          `<button type="button" data-sort="${esc(c.key)}" data-w-focus="sort-${esc(c.key)}"${sortedHere ? ' class="is-sorted"' : ''}>${esc(c.name)}${mark}</button>` +
          (c.unit ? `<span class="w-unit">${esc(c.unit)}</span>` : '') + '</th>';
      }).join('');
      const body = sortedRows.map(r => '<tr>' + columns.map((c, ci) => {
        const v = r[c.key], flagged = c.flag && isNum(v) && (c.flag.below !== undefined ? v < c.flag.below : v > c.flag.above);
        const content = ci === 0 ? `<th scope="row">${cell(c, v)}</th>` : null;
        if (content) return content;
        let bar = '';
        if (c.bar && isNum(v)) {
          const max = c.bar.max ?? Math.max(...rows.map(x => x[c.key])), pct = clamp(v / max, 0, 1) * 100, ref = c.bar.ref !== undefined ? clamp(c.bar.ref / max, 0, 1) * 100 : null;
          bar = `<span class="w-bar" aria-hidden="true"><i style="width:${r2(pct)}%"${flagged ? ' class="is-flagged"' : ''}></i>${ref !== null ? `<u style="left:${r2(ref)}%"></u>` : ''}</span>`;
        }
        return `<td class="w-num${flagged ? ' is-flagged' : ''}${c.key === col.key ? ' is-sorted' : ''}">${bar}<span>${cell(c, v)}</span></td>`;
      }).join('') + '</tr>').join('');
      const caption = d.caption ?? (d.rows ? '' : 'Synthetic values · numeric sort');
      w.draw(`<table class="w-table">${caption ? `<caption>${esc(caption)}</caption>` : ''}<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`);
      const first = sortedRows[0], last = sortedRows[sortedRows.length - 1];
      const vals = { column: col.short || col.name, direction: s.ascending ? (t.ascending || 'ascending') : (t.descending || 'descending'),
        first: first[idKey], last: last[idKey], firstValue: cell(col, first[col.key]), lastValue: cell(col, last[col.key]), count: rows.length };
      if (col.flag) vals.flagged = rows.filter(r => (col.flag.below !== undefined ? r[col.key] < col.flag.below : r[col.key] > col.flag.above)).length;
      return { status: w.fill(t.status || (s.ascending ? 'Ascending' : 'Descending'), vals), values: vals };
    },
  };
};

/* ---------- brushing: a range on one axis selects points and recomputes a summary ---------- */
KINDS.brushing = w => {
  const d = w.data, own = !!d.points;
  const pts = own ? d.points.map((p, i) => ({ id: p.id ?? i + 1, ...p })) : (d.series || DEFAULT_SERIES).map(p => ({ ...p }));
  if (!pts.length || pts.length > 1000 || pts.some(p => !isNum(p.x) || !isNum(p.y))) throw Error('Example series requires finite x/y objects.');
  w.slider('low', w.spec('low', { label: 'Lower bound', min: 0, max: 80, step: 1 }));
  w.slider('high', w.spec('high', { label: 'Upper bound', min: 20, max: 100, step: 1 }));
  const t = w.text;
  return {
    render(s) {
      const a = Math.min(s.low, s.high), z = Math.max(s.low, s.high);
      const lo = own ? a : a / 100, hi = own ? z : z / 100;
      const picked = pts.filter(p => p.x >= lo && p.x <= hi), rest = pts.filter(p => !(p.x >= lo && p.x <= hi));
      s.selected = picked.map(p => p.id);
      const { width: W, height: H } = w.size(), ax = w.axes;
      const xd = [ax.x?.min ?? Math.min(...pts.map(p => p.x)), ax.x?.max ?? Math.max(...pts.map(p => p.x))];
      const yd = ax.y?.min !== undefined ? [ax.y.min, ax.y.max] : niceDomain(Math.min(...pts.map(p => p.y)), Math.max(...pts.map(p => p.y)), 5);
      const b = box(W, H, { l: 64, r: own ? 150 : 20, t: 56, b: 62 });
      const x = linear(xd, [b.l, b.r]), y = linear(yd, [b.b, b.t]);
      const dg = ax.y?.digits ?? (yd[1] - yd[0] <= 2 ? 2 : 0);
      let out = rect(x(lo), b.t - 8, Math.max(2, x(hi) - x(lo)), b.h + 8, { fill: C.surface });
      out += axisY(y, { x: b.l, values: ax.y?.ticks || ticks(yd[0], yd[1], 5), format: v => w.fmt(v, ax.y?.tickDigits ?? (yd[1] - yd[0] <= 2 ? 1 : 0)), grid: [b.l, b.r] });
      out += axisX(x, { y: b.b, values: ax.x?.ticks || ticks(xd[0], xd[1], 8), format: v => w.ax(v, ax.x, xd[1] - xd[0] <= 2 ? 1 : 0) });
      out += line(b.l, b.b, b.r, b.b, { stroke: C.ink, width: 1.4 }) + yTitle(b, ax.y?.title) + xTitle(b, ax.x?.title, b.b + 36);
      out += line(x(lo), b.t - 8, x(lo), b.b, { stroke: C.ink, width: 1.4 }) + line(x(hi), b.t - 8, x(hi), b.b, { stroke: C.ink, width: 1.4 });
      for (const p of rest) out += circle(x(p.x), y(p.y), 5.5, { fill: C.context });
      for (const p of picked) out += circle(x(p.x), y(p.y), 6, { fill: C.accent, stroke: C.paper, width: 1.2 });
      const mSel = picked.length ? median(picked.map(p => p.y)) : NaN, mRest = rest.length ? median(rest.map(p => p.y)) : NaN;
      if (own) {
        const marks = [{ v: mSel, col: C.accent, label: fill(t.selectedMedian || 'selected {v}', { v: w.fmt(mSel, dg) }, w.locale) },
          { v: mRest, col: C.muted, label: fill(t.restMedian || 'others {v}', { v: w.fmt(mRest, dg) }, w.locale) }].filter(m => isNum(m.v));
        const ly = spread(marks.map(m => y(m.v)), 24, b.t, b.b);
        marks.forEach((m, k) => {
          out += line(b.l, y(m.v), b.r + 8, y(m.v), { stroke: m.col, width: 2, dash: '6 4' });
          out += text(b.r + 14, ly[k], m.label, { size: 16, weight: 650, fill: m.col === C.muted ? C.ink : m.col, valign: 'middle' });
        });
        out += text(b.r + 14, b.t - 18, t.medianTitle || 'Median', { size: 16, fill: C.muted, valign: 'bottom' });
      }
      w.draw(svgRoot(W, H, out, t.figure || 'Scatter plot with a selected range'));
      const vals = { k: picked.length, n: pts.length, others: rest.length, low: w.ax(lo, ax.x, own ? 0 : 2), high: w.ax(hi, ax.x, own ? 0 : 2),
        median: w.fmt(mSel, dg), rest: w.fmt(mRest, dg), ratio: isNum(mSel / mRest) ? w.fmt(mSel / mRest, 1) : '–' };
      const template = !picked.length && t.statusNone ? t.statusNone : !rest.length && t.statusAll ? t.statusAll : t.status;
      return { status: w.fill(template || 'Selected {k} / {n} observations. Range changes both selection and count.', vals), values: vals };
    },
  };
};

/* ---------- histogram: bin width changes the shape, never the count ---------- */
KINDS.histogram = w => {
  const d = w.data, values = d.values || DEFAULT_VALUES, domain = d.domain || [0, 1];
  if (!values.length || values.length > 5000 || values.some(v => !isNum(v) || v < domain[0] || v > domain[1])) throw Error(`Histogram values must be finite and inside [${domain}].`);
  w.slider('bins', w.spec('bins', { label: 'Number of bins', min: 3, max: 12, step: 1 }));
  const t = w.text;
  return {
    render(s) {
      const nb = Math.max(1, Math.round(s.bins)), width = (domain[1] - domain[0]) / nb, counts = Array(nb).fill(0);
      values.forEach(v => { counts[Math.min(nb - 1, Math.floor((v - domain[0]) / width))]++; });
      s.counts = counts;
      const { width: W, height: H } = w.size(), ax = w.axes;
      const b = box(W, H, { l: 64, r: 20, t: 56, b: 76 });
      const x = linear(domain, [b.l, b.r]), top = Math.max(...counts), yMax = ax.y?.max ?? niceDomain(0, top * 1.12, 4)[1];
      const y = linear([0, yMax], [b.b - 14, b.t]);
      let out = axisY(y, { x: b.l, values: ticks(0, yMax, 4), format: v => w.fmt(v, 0), grid: [b.l, b.r], zeroLine: false });
      // Peaks: bins higher than both neighbours and at least 1.3× the lower neighbour.
      const peaks = counts.map((c, i) => i).filter(i => counts[i] > 0 && (i === 0 || counts[i] > counts[i - 1]) && (i === nb - 1 || counts[i] >= counts[i + 1]) &&
        counts[i] >= 1.3 * Math.min(i ? counts[i - 1] : 0, i < nb - 1 ? counts[i + 1] : 0) && counts[i] >= top * 0.25);
      const gapPx = Math.min(4, (b.w / nb) * 0.12);
      counts.forEach((c, i) => {
        const x0 = x(domain[0] + i * width) + gapPx / 2, x1 = x(domain[0] + (i + 1) * width) - gapPx / 2, isPeak = d.domain && peaks.includes(i);
        out += rect(x0, y(c), x1 - x0, y(0) - y(c), { fill: isPeak ? C.accent : d.domain ? C.context : C.ink, opacity: isPeak || d.domain ? null : 0.78 });
        if (x1 - x0 >= w.tw(String(c), 16) + 4 && c) out += text((x0 + x1) / 2, y(c) - 6, String(c), { size: 16, anchor: 'middle', valign: 'bottom', fill: C.muted, num: true });
      });
      // Rug: every observation, unchanged by binning.
      for (const v of values) out += line(x(v), b.b - 9, x(v), b.b - 1, { stroke: C.ink, width: 1, opacity: 0.45 });
      out += line(b.l, b.b, b.r, b.b, { stroke: C.ink, width: 1.4 });
      const edges = Array.from({ length: nb + 1 }, (_, i) => domain[0] + i * width);
      out += axisX(x, { y: b.b, values: ax.x?.ticks || (nb <= 12 ? edges : ticks(domain[0], domain[1], 8)), format: v => w.fmt(v, ax.x?.digits ?? (domain[1] - domain[0] <= 2 ? 2 : 0)) });
      out += yTitle(b, ax.y?.title) + xTitle(b, ax.x?.title, b.b + 36);
      w.draw(svgRoot(W, H, out, t.figure || 'Histogram with a rug of every observation'));
      const span = i => `${w.fmt(domain[0] + i * width, ax.x?.digits ?? 0)}\u2060–\u2060${w.fmt(domain[0] + (i + 1) * width, ax.x?.digits ?? 0)}`;
      const vals = { bins: nb, width: w.fmt(width, ax.x?.widthDigits ?? (Number.isInteger(width) ? 0 : 1)), total: sum(counts), peaks: peaks.length,
        peakList: listOf(peaks.map(span), w.locale), first: peaks.length ? span(peaks[0]) : '–' };
      return { status: w.fill(peaks.length > 1 ? t.statusTwoPeaks || t.status || '{bins} equal-width bins; total count {total} is conserved.' : t.status || '{bins} equal-width bins; total count {total} is conserved.', vals), values: vals };
    },
  };
};

/* ---------- bootstrap: seeded resamples build the spread of the mean ---------- */
KINDS.bootstrap = w => {
  const d = w.data, values = d.values || DEFAULT_VALUES, t = w.text;
  if (!values.length || values.some(v => !isNum(v))) throw Error('Bootstrap values must be finite numbers.');
  w.button(t.resample || 'Resample', () => { w.state.seed++; w.render(); }, { cls: 'w-primary' });
  if (d.batch) w.button(fill(t.batch || 'Draw {n} more', { n: d.batch }, w.locale), () => { w.state.seed += d.batch; w.render(); });
  w.slider('n', w.spec('n', { label: 'Sample size', min: 5, max: 20, step: 1 }));
  // Resample k uses the generator seeded with k + 1 (the original runtime's convention).
  const resample = (k, n) => { const rnd = lcg(k + 1); return Array.from({ length: n }, () => Math.floor(rnd() * values.length)); };
  return {
    render(s) {
      const n = Math.round(s.n ?? values.length), first = d.from ?? 1;
      const pick = resample(s.seed, n), sample = pick.map(i => values[i]), m = mean(sample);
      s.mean = m;
      const means = []; for (let k = first; k <= s.seed; k++) means.push(mean(resample(k, n).map(i => values[i])));
      const enough = means.length >= (d.minDraws ?? 20), lo = enough ? quantile(means, 0.025) : NaN, hi = enough ? quantile(means, 0.975) : NaN;
      if (enough) { s.low = lo; s.high = hi; } else { delete s.low; delete s.high; }
      const { width: W, height: H } = w.size(), ax = w.axes, dg = ax.x?.digits ?? 2, sg = ax.x?.signed;
      const xd = ax.x?.min !== undefined ? [ax.x.min, ax.x.max] : niceDomain(Math.min(...values), Math.max(...values), 6);
      const b = box(W, H, { l: 24, r: 24, t: 40, b: 62 });
      const x = linear(xd, [b.l, b.r]), dataMean = mean(values);
      const topB = b.t + b.h * 0.4, botTop = topB + 52, rowY = botTop + 34, dotTop = rowY + 24;
      let out = '';
      for (const v of ticks(xd[0], xd[1], 8)) out += line(x(v), b.t - 10, x(v), b.b, { stroke: v === 0 ? C.ink : C.grid, width: v === 0 ? 1.4 : 1 });
      // Top: the observations; dots stacked above each show how often this resample drew it.
      out += text(b.l, b.t - 14, fill(t.dataTitle || 'The {n} observations; dots above each show how often this resample drew it', { n: values.length }, w.locale), { size: 16, fill: C.muted, valign: 'bottom' });
      const times = values.map((_, i) => pick.filter(p => p === i).length), base = topB - 10, lv = stackLevels(values.map(x), 7);
      const labelRows = [b.t + 6, b.t + 30];
      const marks = [{ v: dataMean, col: C.ink, dash: '5 4', label: fill(t.observedLabel || 'mean of the data {v}', { v: fmt(dataMean, dg, w.locale, sg) }, w.locale) },
        { v: m, col: C.accent, label: fill(t.meanLabel || 'resample mean {v}', { v: fmt(m, dg, w.locale, sg) }, w.locale) }];
      marks.forEach((mk, k) => {
        const px = x(mk.v), right = px > (b.l + b.r) / 2, ly = labelRows[k];
        out += line(px, ly - 4, px, topB + 2, { stroke: mk.col, width: k ? 2.4 : 1.6, dash: mk.dash });
        out += text(px + (right ? -8 : 8), ly, mk.label, { size: 16, weight: 650, fill: mk.col, valign: 'top', anchor: right ? 'end' : 'start', halo: C.paper, num: true });
      });
      values.forEach((v, i) => {
        const cy = base - lv[i] * 4;
        out += circle(x(v), cy, 7, { fill: C.paper, stroke: C.ink, width: 1.6 });
        for (let k = 0; k < times[i]; k++) out += circle(x(v), cy - 18 - k * 13, 5, { fill: C.accent });
      });
      // Bottom: the distribution of all resample means so far, with its central 95%.
      out += text(b.l, botTop, fill(t.meansTitle || '{k|resample mean|resample means}', { k: means.length }, w.locale), { size: 16, fill: C.muted, valign: 'bottom' });
      const r = 3.2, colW = r * 2.1, cols = new Map();
      for (const v of means) { const c = Math.round(x(v) / colW); cols.set(c, (cols.get(c) || 0) + 1); }
      const tallest = Math.max(1, ...cols.values()), dy = Math.min(r * 2.1, (b.b - dotTop - 8) / tallest);
      for (const [c, k] of cols) for (let j = 0; j < k; j++) out += circle(c * colW, b.b - 6 - j * dy, r, { fill: C.ink, opacity: 0.8 });
      out += line(x(dataMean), rowY + 12, x(dataMean), b.b, { stroke: C.ink, width: 1.6, dash: '5 4' });
      if (enough) {
        out += line(x(lo), rowY, x(hi), rowY, { stroke: C.accent, width: 3 }) + line(x(lo), rowY - 7, x(lo), rowY + 7, { stroke: C.accent, width: 3 }) + line(x(hi), rowY - 7, x(hi), rowY + 7, { stroke: C.accent, width: 3 });
        out += text(x(lo) - 10, rowY, fmt(lo, dg, w.locale, sg), { size: 16, weight: 650, fill: C.accent, anchor: 'end', valign: 'middle', num: true });
        out += text(x(hi) + 10, rowY, fmt(hi, dg, w.locale, sg), { size: 16, weight: 650, fill: C.accent, valign: 'middle', num: true });
        const lab = t.intervalLabel || '95% of means';
        out += text((x(lo) + x(hi)) / 2, rowY - 10, lab, { size: 16, weight: 650, fill: C.accent, anchor: 'middle', valign: 'bottom', halo: C.paper });
      }
      out += line(b.l, b.b, b.r, b.b, { stroke: C.ink, width: 1.4 });
      out += axisX(x, { y: b.b, values: ticks(xd[0], xd[1], 8), format: v => fmt(v, ax.x?.tickDigits ?? 1, w.locale, sg) });
      out += xTitle(b, ax.x?.title, b.b + 36);
      w.draw(svgRoot(W, H, out, t.figure || 'Observations, one resample, and the distribution of resample means'));
      const vals = { mean: fmt(m, d.values ? dg : 3, w.locale, ax.x?.signed), draws: means.length, lo: fmt(lo, dg, w.locale, ax.x?.signed), hi: fmt(hi, dg, w.locale, ax.x?.signed),
        observed: fmt(dataMean, dg, w.locale, ax.x?.signed), above: means.filter(v => v > 0).length };
      return { status: w.fill(enough ? t.status || 'Seeded resample mean = {mean}. One resample is not a confidence interval.' : t.statusFew || t.status || 'Seeded resample mean = {mean}. One resample is not a confidence interval.', vals), values: vals };
    },
  };
};

/* ---------- ablation: switch components off and read the measured effect ---------- */
KINDS.ablation = w => {
  const d = w.data, t = w.text;
  const comps = d.components || [{ id: 'a', name: 'Include component A', effect: 15 }, { id: 'b', name: 'Include component B', effect: 8 }, { id: 'c', name: 'Include component C', effect: 12 }];
  const base = d.base ?? 40;
  for (const c of comps) w.check(c.id, w.spec(c.id, { label: c.label || c.name, on: t.on || w.ui.on, off: t.off || w.ui.off }));
  const keyOf = s => comps.filter(c => s[c.id]).map(c => c.id).join('+') || 'none';
  const score = s => (d.measured ? d.measured[keyOf(s)] : base + sum(comps.map(c => (s[c.id] ? c.effect : 0))));
  const configs = Array.from({ length: 2 ** comps.length }, (_, m) => Object.fromEntries(comps.map((c, i) => [c.id, !!(m & (1 << i))])));
  const nameOf = s => {
    const onC = comps.filter(c => s[c.id]), offC = comps.filter(c => !s[c.id]);
    if (!offC.length) return t.all || 'Full system';
    if (!onC.length) return t.none || 'Baseline';
    if (offC.length === 1) return fill(t.without || 'Without {name}', { name: offC[0].short || offC[0].name }, w.locale);
    if (onC.length === 1) return fill(t.only || 'Only {name}', { name: onC[0].short || onC[0].name }, w.locale);
    return onC.map(c => c.short || c.name).join(' + ');
  };
  return {
    render(s) {
      const value = score(s);
      s.value = value;
      const { width: W, height: H } = w.size(), ax = w.axes, dg = d.digits ?? 0;
      let out;
      if (d.measured) {
        // Every configuration on one scale; the current one in accent, with a sampling margin when n is given.
        const rows = configs.map(c => ({ c, v: d.measured[keyOf(c)], name: nameOf(c) })).filter(r => isNum(r.v)).sort((a, b) => b.v - a.v);
        const nameW = Math.max(...rows.map(r => w.tw(r.name, 17, 650))) + 24;
        const b = box(W, H, { l: nameW, r: 70, t: 40, b: 60 });
        const xd = [ax.x?.min ?? 0, ax.x?.max ?? 100], x = linear(xd, [b.l, b.r]), step = b.h / rows.length;
        out = axisX(x, { y: b.b, values: ax.x?.ticks || ticks(xd[0], xd[1], 6), format: v => w.fmt(v, 0), grid: [b.t - 8, b.b] });
        out += line(b.l, b.b, b.r, b.b, { stroke: C.ink, width: 1.4 }) + xTitle(b, ax.x?.title, b.b + 36);
        const full = d.measured[comps.map(c => c.id).join('+')];
        if (isNum(full)) out += line(x(full), b.t - 8, x(full), b.b, { stroke: C.ink, width: 1.2, dash: '4 4' });
        rows.forEach((r, i) => {
          const cy = b.t + step * (i + 0.5), current = keyOf(r.c) === keyOf(s), col = current ? C.accent : C.ink;
          const moe = d.n ? 196 * Math.sqrt((r.v / 100) * (1 - r.v / 100) / d.n) : 0;
          if (moe) out += line(x(r.v - moe), cy, x(r.v + moe), cy, { stroke: current ? C.accent : C.context, width: current ? 3 : 2.4 });
          out += circle(x(r.v), cy, current ? 8 : 6, { fill: current ? C.accent : C.ink });
          out += text(b.l - 14, cy, r.name, { size: 17, weight: current ? 700 : 400, anchor: 'end', valign: 'middle', fill: current ? C.accent : C.ink });
          out += text(x(r.v + moe) + 10, cy, fmt(r.v, dg, w.locale), { size: 16, weight: current ? 700 : 400, valign: 'middle', fill: current ? C.accent : C.muted, halo: C.paper, num: true });
        });
      } else {
        // Additive model: base plus the included components as a stacked bar.
        const total = base + sum(comps.map(c => c.effect)), b = box(W, H, { l: 40, r: 40, t: 70, b: 70 });
        const x = linear([0, total], [b.l, b.r]), cy = b.t + b.h / 2, bh = Math.min(80, b.h * 0.35);
        out = rect(x(0), cy - bh / 2, x(base) - x(0), bh, { fill: C.context }) + text(x(base / 2), cy, fill(t.baseLabel || 'Base {v}', { v: base }, w.locale), { size: 17, anchor: 'middle', valign: 'middle' });
        let at = base;
        comps.forEach((c, i) => {
          if (!s[c.id]) return;
          out += rect(x(at), cy - bh / 2, x(at + c.effect) - x(at), bh, { fill: cat(i), stroke: C.paper, width: 2 });
          out += text(x(at + c.effect / 2), cy + bh / 2 + 10, `+${c.effect}`, { size: 17, anchor: 'middle', valign: 'top', weight: 650 });
          at += c.effect;
        });
        out += text(x(at), cy - bh / 2 - 12, String(value), { size: 40, weight: 650, anchor: x(at) > b.r - 60 ? 'end' : 'middle', valign: 'bottom' });
      }
      w.draw(svgRoot(W, H, out, t.figure || 'Score for each configuration of components'));
      const fullKey = comps.map(c => c.id).join('+'), full = d.measured ? d.measured[fullKey] : base + sum(comps.map(c => c.effect));
      const vals = { value: fmt(value, dg, w.locale), config: nameOf(s), delta: fmt(value - full, dg, w.locale, true), full: fmt(full, dg, w.locale), n: d.n ?? '' };
      if (d.n && d.measured) vals.margin = fmt(196 * Math.sqrt((value / 100) * (1 - value / 100) / d.n), 1, w.locale);
      return { status: w.fill((value === full && t.statusFull) || t.status || 'Toy additive score: 40 + 15A + 8B + 12C. Not a measured benchmark.', vals), values: vals };
    },
  };
};

/* ---------- quiz: local practice with feedback per answer ---------- */
/** Prefix and sentence: no space after Japanese full stops. */
const join = (a, b) => (b ? `${a}${/[。．！？]$/.test(a) ? '' : ' '}${b}` : a);
const DEFAULT_QUIZ = {
  question: 'What should accompany an estimate?', prompt: 'Choose the option that helps the audience judge the strength of the evidence.',
  options: [{ id: 'mean', label: 'The mean alone' }, { id: 'range', label: 'Estimate with interval' }, { id: 'decoration', label: 'More decoration' }],
  answer: 'range',
};
KINDS.quiz = w => {
  const own = !!w.data.question, q = own ? { ...w.data } : { ...DEFAULT_QUIZ }, t = w.text;
  const correctText = t.correct || 'Correct: show the estimate with its uncertainty and conditions.';
  w.plot.innerHTML = `<div class="w-quiz"><p class="w-question">${esc(q.question)}</p>${q.prompt ? `<p class="w-prompt">${esc(q.prompt)}</p>` : ''}<div class="w-options"></div>` +
    `<div class="w-explain">${q.explanation ? `<p>${esc(q.explanation)}</p>` : ''}${q.figure || ''}</div></div>`;
  const quiz = w.plot.querySelector('.w-quiz'), explain = w.plot.querySelector('.w-explain');
  w.radios('choice', w.spec('choice', { label: t.choose || 'Select an answer', options: q.options.map(o => [o.id, o.label]), cls: 'w-answers' }), w.plot.querySelector('.w-options'));
  // Optional share of an earlier group per option, revealed with the answer (and in a static export).
  for (const label of quiz.querySelectorAll('.w-radio')) {
    const o = q.options.find(x => x.id === label.querySelector('input').value);
    if (isNum(o?.share)) label.insertAdjacentHTML('beforeend', `<span class="w-share" data-static="show"><i style="width:${clamp(o.share, 0, 100)}%"></i><em>${esc(fill(t.share || '{v}%', { v: o.share }, w.locale))}</em></span>`);
  }
  w.button(t.check || 'Check answer', () => { w.state.checked = true; w.render(); }, { cls: 'w-primary' });
  w.on(quiz, 'change', () => { w.state.checked = false; w.render(); });
  return {
    render(s) {
      const chosen = q.options.find(o => o.id === s.choice), right = s.choice === q.answer;
      quiz.dataset.checked = String((!!s.checked && !!chosen) || document.body.dataset.export === 'true');
      // A static export is an answer sheet: the answer, the explanation and the shares are shown.
      const exporting = document.body.dataset.export === 'true', done = (!!s.checked && !!chosen) || exporting;
      for (const label of quiz.querySelectorAll('.w-radio')) {
        const id = label.querySelector('input').value, isAnswer = done && id === q.answer, isWrong = done && !!s.checked && id === s.choice && !right;
        label.classList.toggle('is-answer', isAnswer);
        label.classList.toggle('is-wrong', isWrong);
        const mark = isAnswer ? t.answerMark || 'Correct answer' : isWrong ? t.yourMark || 'Your answer' : '';
        if (mark) label.dataset.mark = mark; else delete label.dataset.mark;
        const share = label.querySelector('.w-share');
        if (share) { if (done) share.removeAttribute('data-static'); else share.dataset.static = 'show'; }
      }
      // The explanation shows after checking, and always in a static export.
      if (done) explain.removeAttribute('data-static'); else explain.dataset.static = 'show';
      let status;
      const answer = q.options.find(o => o.id === q.answer);
      if (!s.checked && exporting && own) status = w.fill(t.statusExport || 'Answer: {answer}. {feedback}', { answer: answer?.label ?? '', feedback: answer?.feedback ?? '' });
      else if (!s.checked) status = t.prompt || (own ? '' : 'Local practice only. No scores leave this page.');
      else if (!chosen) status = t.none || 'Choose an answer first.';
      else if (right) status = own ? join(t.correctPrefix || 'Correct:', chosen.feedback) : correctText;
      else status = own ? join(t.wrongPrefix || 'Not quite:', chosen.feedback) : (t.wrong || 'Try again: visual polish cannot substitute for uncertainty.');
      return { status, values: { choice: chosen?.label || '' } };
    },
  };
};

/* ---------- decision: answers to a few questions select one branch of a tree ---------- */
const DEFAULT_DECISION = {
  questions: [{ id: 'evidence', label: 'Evidence available?', options: [['yes', 'Yes'], ['no', 'No']] }, { id: 'interactive', label: 'Does inspection help?', options: [['yes', 'Yes'], ['no', 'No']] }],
  tree: { ask: 'evidence', branches: { no: { result: 'Gather evidence' }, yes: { ask: 'interactive', branches: { yes: { result: 'Use focused interaction' }, no: { result: 'Use a stable visual' } } } } },
};
KINDS.decision = w => {
  const d = w.data.tree ? w.data : DEFAULT_DECISION, t = w.text;
  for (const q of d.questions) w.select(q.id, w.spec(q.id, { label: q.label, options: q.options }));
  // Layout: questions in columns by depth, every outcome in one column on the right, leaves evenly spaced.
  const nodes = [], edges = [];
  let leaf = 0;
  (function walk(n, depth, parent, via) {
    const me = { n, depth, i: nodes.length }; nodes.push(me);
    if (parent) edges.push({ from: parent, to: me, via });
    if (n.result !== undefined) { me.slot = leaf++; return me; }
    const q = d.questions.find(x => x.id === n.ask);
    const kids = Object.entries(n.branches).map(([v, child]) => {
      const opt = q.options.find(o => String(o[0]) === v);
      return walk(child, depth + 1, me, { value: v, label: q.short?.[v] ?? opt?.[2] ?? opt?.[1] ?? v });
    });
    me.slot = (kids[0].slot + kids[kids.length - 1].slot) / 2;
    return me;
  })(d.tree, 0, null, null);
  const qDepth = Math.max(0, ...nodes.filter(n => n.n.result === undefined).map(n => n.depth));
  return {
    render(s) {
      // Follow the current answers from the root to a result.
      const active = new Set(); let n = nodes[0], result = null;
      while (n) {
        active.add(n);
        if (n.n.result !== undefined) { result = n.n.result; break; }
        const e = edges.find(x => x.from === n && x.via.value === String(s[n.n.ask]));
        n = e ? e.to : null;
      }
      s.result = result;
      const { width: W, height: H } = w.size();
      const qName = nd => { const q = d.questions.find(x => x.id === nd.n.ask); return q.short?.name ?? q.name ?? q.label; };
      const qW = Math.max(...nodes.filter(nd => nd.n.result === undefined).map(nd => w.tw(qName(nd), 17, 650))) + 28;
      const rW = Math.min(d.resultWidth || 250, W * 0.36);
      const colStep = qDepth ? (W - rW - qW - 120) / qDepth : 0;
      const yOf = slot => 24 + ((slot + 0.5) / leaf) * (H - 48), xOf = nd => (nd.n.result !== undefined ? W - rW : nd.depth * colStep);
      let out = '';
      for (const e of edges) {
        const on = active.has(e.from) && active.has(e.to), x1 = xOf(e.from) + qW, y1 = yOf(e.from.slot), x2 = xOf(e.to), y2 = yOf(e.to.slot), xm = x1 + 18;
        const col = on ? C.accent : C.context;
        out += path(`M${r2(x1)} ${r2(y1)}H${r2(xm)}V${r2(y2)}H${r2(x2 - 9)}`, { stroke: col, width: on ? 3 : 1.8, join: 'miter' }) + arrowHead(x2, y2, 0, 9, col);
        // The option label sits on the run into the child when it fits there, else beside the vertical run.
        const style = { size: 16, weight: on ? 700 : 400, fill: on ? C.accent : C.muted, halo: C.paper };
        const lw = w.tw(e.via.label, 16, on ? 700 : 400);
        if (x2 - xm - 18 >= lw + 10 || Math.abs(y2 - y1) < 30) out += text(xm + 10, y2 - 7, e.via.label, { ...style, valign: 'bottom' });
        else out += text(xm + 8, (y1 + y2) / 2, e.via.label, { ...style, valign: 'middle' });
      }
      for (const nd of nodes) {
        const x0 = xOf(nd), cy = yOf(nd.slot), on = active.has(nd), isResult = nd.n.result !== undefined;
        const boxW = isResult ? rW : qW;
        const lines = isResult ? w.wrap(nd.n.result, boxW - 26, 17, 650) : [qName(nd)], bh = lines.length * 22 + 20;
        out += rect(x0, cy - bh / 2, boxW, bh, { fill: isResult && on ? C.accent : C.paper, stroke: on ? C.accent : C.rule, width: on ? 2.4 : 1.4, rx: 6 });
        out += text(x0 + 13, cy, lines, { size: 17, weight: 650, valign: 'middle', lh: 1.3, fill: isResult && on ? C.onAccent : on ? C.ink : C.muted });
      }
      w.draw(svgRoot(W, H, out, t.figure || `Decision tree; current outcome: ${result}`));
      return { status: w.fill(t.status || 'Choose interaction only when it helps inspect a meaningful alternative.', { result: result ?? '' }), values: { result } };
    },
  };
};

/* ---------- graph: which stops can still be reached when links open or close ---------- */
KINDS.graph = w => {
  const d = w.data.nodes ? w.data : {
    nodes: ['A', 'B', 'C', 'D'].map((name, i) => ({ id: name, name, x: i, y: 0 })), origin: 'A',
    // The original fixture is directed: links are followed from → to only (edges default to two-way).
    edges: [{ from: 'A', to: 'B', oneway: true }, { from: 'C', to: 'D', oneway: true }, { from: 'B', to: 'C', toggle: 'bridge', oneway: true }, { from: 'A', to: 'D', toggle: 'direct', bend: -1, oneway: true }],
    toggles: [{ key: 'bridge', label: 'Enable bridge' }, { key: 'direct', label: 'Enable direct edge' }],
  };
  const t = w.text, index = Object.fromEntries(d.nodes.map((n, i) => [n.id, i])), origin = index[d.origin ?? d.nodes[0].id];
  for (const tg of d.toggles) w.check(tg.key, w.spec(tg.key, { label: tg.label, on: tg.on || t.open || w.ui.on, off: tg.off || t.closed || w.ui.off }));
  return {
    render(s) {
      const open = e => !e.toggle || !!s[e.toggle];
      // Dijkstra over open edges (minutes; unweighted edges count 1).
      const dist = d.nodes.map(() => Infinity); dist[origin] = 0;
      const done = new Set();
      while (done.size < d.nodes.length) {
        let u = -1; dist.forEach((v, i) => { if (!done.has(i) && isNum(v) && (u < 0 || v < dist[u])) u = i; });
        if (u < 0) break; done.add(u);
        for (const e of d.edges.filter(open)) {
          const a = index[e.from], b = index[e.to], wgt = e.minutes ?? 1;
          if (a === u && dist[u] + wgt < dist[b]) dist[b] = dist[u] + wgt;
          if (!e.oneway && b === u && dist[u] + wgt < dist[a]) dist[a] = dist[u] + wgt;
        }
      }
      s.reachable = dist.map((v, i) => (isNum(v) ? i : -1)).filter(i => i >= 0);
      if (d.edges.some(e => e.minutes)) s.minutes = Object.fromEntries(d.nodes.map((n, i) => [n.id, isNum(dist[i]) ? dist[i] : null]));
      const { width: W, height: H } = w.size();
      const xs = d.nodes.map(n => n.x), ys = d.nodes.map(n => n.y);
      const pad = d.pad || { l: 70, r: 70, t: 60, b: 60 };
      const spanX = Math.max(...xs) - Math.min(...xs) || 1, spanY = Math.max(...ys) - Math.min(...ys) || 1;
      const k = Math.min((W - pad.l - pad.r) / spanX, ys.length > 1 && spanY > 0 && Math.max(...ys) !== Math.min(...ys) ? (H - pad.t - pad.b) / spanY : Infinity);
      const ox = pad.l + ((W - pad.l - pad.r) - spanX * k) / 2, oy = pad.t + ((H - pad.t - pad.b) - (Math.max(...ys) - Math.min(...ys)) * k) / 2;
      const px = n => ox + (n.x - Math.min(...xs)) * k, py = n => oy + (n.y - Math.min(...ys)) * k;
      const P = (x, y) => [ox + (x - Math.min(...xs)) * k, oy + (y - Math.min(...ys)) * k];
      let out = '';
      for (const a of d.areas || []) {
        out += path('M' + a.points.map(p => P(p[0], p[1]).map(r2).join(' ')).join('L') + 'Z', { fill: a.tone === 'water' ? seq(2) : C.surface, stroke: 'none', width: 0 });
        if (a.label) { const [lx, ly] = P(a.labelAt[0], a.labelAt[1]); out += text(lx, ly, a.label, { size: 16, fill: C.muted, italic: true, anchor: 'middle', valign: 'middle' }); }
      }
      for (const e of d.edges) {
        const A = d.nodes[index[e.from]], B = d.nodes[index[e.to]], isOpen = open(e), used = isOpen && isNum(dist[index[e.from]]) && isNum(dist[index[e.to]]);
        const x1 = px(A), y1 = py(A), x2 = px(B), y2 = py(B);
        const dpath = e.bend ? `M${r2(x1)} ${r2(y1)}Q${r2((x1 + x2) / 2)} ${r2((y1 + y2) / 2 + e.bend * 90)} ${r2(x2)} ${r2(y2)}` : `M${r2(x1)} ${r2(y1)}L${r2(x2)} ${r2(y2)}`;
        out += path(dpath, { stroke: !isOpen ? C.context : used ? C.ink : C.muted, width: isOpen ? 4 : 2.5, dash: isOpen ? null : '7 6' });
        if (e.label && (isOpen ? e.showLabel !== false : true)) {
          const f = e.labelAt ?? 0.5, mx = x1 + (x2 - x1) * f, my = y1 + (y2 - y1) * f + (e.bend ? e.bend * 45 : 0), txt = isOpen ? e.label : (e.closedLabel || e.label);
          out += text(mx + (e.labelDx || 0), my + (e.labelDy ?? -12), txt, { size: 16, weight: isOpen ? 400 : 650, fill: isOpen ? C.muted : C.negative, anchor: 'middle', valign: 'bottom', halo: C.paper });
        }
      }
      d.nodes.forEach((n, i) => {
        const x = px(n), y = py(n), reach = isNum(dist[i]), isOrigin = i === origin;
        out += circle(x, y, isOrigin ? 10 : 7, { fill: isOrigin ? C.accent : reach ? C.ink : C.paper, stroke: isOrigin ? C.paper : reach ? C.paper : C.muted, width: 2 });
        const side = n.label || (d.nodes.length <= 6 ? 'below' : 'right');
        const timed = d.edges.some(e => e.minutes) && !isOrigin;
        const sub = timed ? (reach ? fill(t.minutes || '{m} min', { m: fmt(dist[i], 0, w.locale) }, w.locale) : t.unreachable || 'cut off') : null;
        const dx = side === 'right' ? 14 : side === 'left' ? -14 : 0, dy = side === 'below' ? 14 : side === 'above' ? -14 : 0;
        const anchor = side === 'right' ? 'start' : side === 'left' ? 'end' : 'middle', big = d.nodes.length <= 6 ? 22 : 17;
        // Name, then minutes underneath; for labels above a stop the pair is lifted as a block.
        const nameY = side === 'below' ? y + dy : side === 'above' ? y + dy - (sub ? 21 : 0) : sub ? y - 10 : y;
        const valign = side === 'below' ? 'top' : side === 'above' ? 'bottom' : 'middle';
        out += text(x + dx, nameY, n.name, { size: big, weight: isOrigin ? 700 : reach ? 650 : 400, fill: isOrigin ? C.accent : reach ? C.ink : C.muted, anchor, valign, halo: C.paper });
        if (sub) out += text(x + dx, side === 'below' ? nameY + 21 : side === 'above' ? y + dy : y + 11, sub, { size: 16, fill: reach ? C.muted : C.negative, anchor, valign, halo: C.paper, num: true });
      });
      w.draw(svgRoot(W, H, out, t.figure || 'Network with reachable nodes highlighted'));
      const reach = s.reachable.length, cut = d.nodes.length - reach, far = Math.max(...dist.filter(isNum));
      const vals = { reached: reach, count: d.nodes.length, cut, farthest: fmt(far, 0, w.locale), origin: d.nodes[origin].name,
        list: s.reachable.map(i => d.nodes[i].name).join(', '), cutList: d.nodes.filter((_, i) => !isNum(dist[i])).map(n => n.name).join(', ') };
      const status = t.status ? w.fill(cut && t.statusCut ? t.statusCut : t.status, vals) : `Reachable from ${d.nodes[origin].name}: ${vals.list}`;
      return { status, values: vals };
    },
  };
};

/* ---------- matrix: look up one cell by its row and column ---------- */
KINDS.matrix = w => {
  const d = w.data, rows = d.rows || ['1', '2', '3', '4'], cols = d.columns || ['1', '2', '3', '4', '5'];
  const values = d.values || rows.map((_, r) => cols.map((__, c) => (r + 1) * (c + 1))), t = w.text;
  w.select('row', w.spec('row', { label: 'Row', numeric: true, options: rows.map((r, i) => [i + 1, r]) }));
  w.select('column', w.spec('column', { label: 'Column', numeric: true, options: cols.map((c, i) => [i + 1, c]) }));
  w.on(w.plot, 'click', e => { const td = e.target.closest('[data-cell]'); if (td) { const [r, c] = td.dataset.cell.split(',').map(Number); w.state.row = r; w.state.column = c; w.render(); } });
  const cell = v => (d.prefix || '') + fmt(v, d.digits ?? 0, w.locale) + (d.suffix || '');
  const inCell = v => (d.cellPrefix ?? d.prefix ?? '') + fmt(v, d.digits ?? 0, w.locale) + (d.cellSuffix ?? d.suffix ?? '');
  return {
    render(s) {
      const R = clamp(Math.round(s.row), 1, rows.length), K = clamp(Math.round(s.column), 1, cols.length);
      const head = `<tr><th scope="col" class="w-corner">${esc(d.corner || '')}</th>${cols.map((c, i) => `<th scope="col"${i + 1 === K ? ' class="is-on"' : ''}>${esc(c)}</th>`).join('')}</tr>`;
      const body = rows.map((r, ri) => `<tr${ri + 1 === R ? ' class="is-on"' : ''}><th scope="row"${ri + 1 === R ? ' class="is-on"' : ''}>${esc(r)}</th>${values[ri].map((v, ci) => {
        const cls = ri + 1 === R && ci + 1 === K ? 'is-pick' : ri + 1 === R || ci + 1 === K ? 'is-cross' : '';
        return `<td data-cell="${ri + 1},${ci + 1}"${cls ? ` class="${cls}"` : ''}>${inCell(v)}</td>`;
      }).join('')}</tr>`).join('');
      w.draw(`<table class="w-matrix">${d.caption ? `<caption>${esc(d.caption)}</caption>` : ''}<thead>${head}</thead><tbody>${body}</tbody></table>`);
      const v = values[R - 1][K - 1], min = Math.min(...values.flat());
      const vals = { row: R, column: K, rowName: rows[R - 1], columnName: cols[K - 1], value: cell(v), raw: v, ratio: fmt(v / min, 1, w.locale), cheapest: cell(min),
        rowMin: cell(Math.min(...values[R - 1])), rowMax: cell(Math.max(...values[R - 1])), rowRatio: fmt(Math.max(...values[R - 1]) / Math.min(...values[R - 1]), 1, w.locale),
        first: cell(values[R - 1][0]), vsFirst: fmt(v / values[R - 1][0], 1, w.locale) };
      return { status: w.fill(t.status || 'Selected row {row}, column {column}; synthetic value {value}', vals), values: vals };
    },
  };
};

/* ---------- magnifier: enlarge one region; the photograph's pixels never change ---------- */
KINDS.magnifier = w => {
  const t = w.text, d = w.data;
  w.slider('zoom', w.spec('zoom', { label: 'Zoom', min: 1, max: 3, step: 0.1, digits: 1, format: '{v}×' }));
  w.slider('x', w.spec('x', { label: 'Horizontal focus (%)', min: 0, max: 100, step: 1, format: '{v}%' }));
  w.slider('y', w.spec('y', { label: 'Vertical focus (%)', min: 0, max: 100, step: 1, format: '{v}%' }));
  w.plot.innerHTML = `<div class="w-magnifier"><img src="${esc(w.assets.photo)}" alt="${esc(t.alt || 'Coffee photograph: user-selected crop')}"><svg class="w-inset" aria-hidden="true"></svg></div>`;
  const frame = w.plot.querySelector('.w-magnifier'), img = frame.querySelector('img'), inset = w.plot.querySelector('.w-inset');
  w.on(img, 'load', () => w.render());
  return {
    render(s) {
      const z = Number(s.zoom), fx = Number(s.x), fy = Number(s.y), { width: W, height: H } = w.size();
      const nw = img.naturalWidth || d.width || 3, nh = img.naturalHeight || d.height || 2, k = Math.min(W / nw, H / nh);
      const fw = Math.floor(nw * k), fh = Math.floor(nh * k);
      frame.style.width = fw + 'px'; frame.style.height = fh + 'px';
      img.style.transform = `scale(${z})`;
      img.style.transformOrigin = `${fx}% ${fy}%`;
      img.style.imageRendering = d.pixelated && k * z >= 2 ? 'pixelated' : '';
      // Overview of the whole photograph with the visible window, outside the zoomed frame.
      const iw = Math.min(200, fw * 0.28), ih = (iw * nh) / nw, u0 = (fx / 100) * (1 - 1 / z), v0 = (fy / 100) * (1 - 1 / z);
      inset.setAttribute('viewBox', `0 0 ${r2(iw)} ${r2(ih)}`);
      inset.style.width = r2(iw) + 'px'; inset.style.height = r2(ih) + 'px';
      inset.innerHTML = tag('image', { href: w.assets.photo, x: 0, y: 0, width: r2(iw), height: r2(ih), preserveAspectRatio: 'none' }) +
        rect(0.5, 0.5, iw - 1, ih - 1, { fill: 'none', stroke: C.paper, width: 1 }) +
        rect(u0 * iw, v0 * ih, iw / z, ih / z, { fill: 'none', stroke: '#ffffff', width: 3 }) + rect(u0 * iw, v0 * ih, iw / z, ih / z, { fill: 'none', stroke: '#111111', width: 1.2 });
      inset.style.display = z > 1.05 ? '' : 'none';
      const screenPx = k * z, vals = { zoom: fmt(z, 1, w.locale), screen: fmt(screenPx, 1, w.locale), width: nw, height: nh,
        visible: fmt(nw / z, 0, w.locale), visibleH: fmt(nh / z, 0, w.locale) };
      if (d.print) {
        const mm = d.print.widthMm, ppi = nw / (mm / 25.4);
        Object.assign(vals, { ppi: fmt(ppi, 0, w.locale), needed: fmt((mm / 25.4) * d.print.ppi, 0, w.locale), maxMm: fmt((nw / d.print.ppi) * 25.4, 0, w.locale),
          pixelMm: fmt(mm / nw, 2, w.locale), target: fmt(d.print.ppi, 0, w.locale) });
      }
      return { status: w.fill(t.status || 'A declared crop changes framing, not the underlying photograph.', vals), values: vals };
    },
  };
};

/* ---------- video: a real clip, a chosen poster, native controls and captions ---------- */
KINDS.video = w => {
  const t = w.text, a = w.assets, d = w.data;
  w.plot.innerHTML = `<video data-static="hide" controls playsinline preload="metadata" poster="${esc(a.poster)}" aria-label="${esc(t.videoLabel || 'Synthetic signal video')}">` +
    `<source src="${esc(a.video)}" type="video/webm"><track kind="captions" srclang="${esc(t.captionsLang || 'en')}" label="${esc(t.captionsLabel || 'English')}" src="${esc(a.captions)}" default></video>` +
    `<img data-static="show" src="${esc(a.poster)}" alt="${esc(t.posterAlt || 'Selected static waveform frame')}">`;
  const media = w.plot.querySelector('video'), seekTo = d.seekTo ?? 2;
  w.button(t.playPause || w.ui.playPause, () => (media.paused ? media.play().catch(() => { w.status.textContent = w.ui.blocked; }) : media.pause()));
  w.button(t.seek || w.ui.seek, () => { media.currentTime = Math.min(seekTo, isNum(media.duration) ? media.duration : seekTo); });
  let last = -1;
  const tick = () => { w.state.time = media.currentTime; const k = Math.round(media.currentTime * 10); if (k !== last) { last = k; w.render(); } };
  w.on(media, 'timeupdate', tick); w.on(media, 'seeked', tick); w.on(media, 'loadedmetadata', () => w.render()); w.on(media, 'play', () => w.render()); w.on(media, 'pause', () => w.render());
  return {
    render(s) {
      const dur = isNum(media.duration) ? media.duration : d.duration ?? 5;
      const vals = { time: fmt(media.currentTime || 0, 1, w.locale), duration: fmt(dur, 1, w.locale), state: media.paused ? (t.paused || 'paused') : (t.playing || 'playing') };
      return { status: w.fill(t.status || 'A 5-second procedural clip with native controls and English captions; the poster stands in where video cannot play.', vals), values: vals };
    },
    reset() { media.pause(); media.currentTime = 0; },
    leave() { media.pause(); },
  };
};

/* ---------- audio: deliberate playback of a measured sound ---------- */
/** Decode a PCM WAV data: URI into samples (mono mixdown), without the network. */
function decodeWav(uri) {
  const m = /^data:audio\/(?:wav|x-wav|wave);base64,(.*)$/.exec(uri || '');
  if (!m) return null;
  const bin = atob(m[1]), bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const v = new DataView(bytes.buffer), str = (o, n) => String.fromCharCode(...bytes.slice(o, o + n));
  if (str(0, 4) !== 'RIFF' || str(8, 4) !== 'WAVE') return null;
  let o = 12, fmtc = null;
  while (o + 8 <= bytes.length) {
    const id = str(o, 4), size = v.getUint32(o + 4, true), start = o + 8;
    if (id === 'fmt ') fmtc = { format: v.getUint16(start, true), channels: v.getUint16(start + 2, true), rate: v.getUint32(start + 4, true), bits: v.getUint16(start + 14, true) };
    if (id === 'data' && fmtc && fmtc.format === 1 && fmtc.bits === 16) {
      const frames = Math.floor(size / (2 * fmtc.channels)), samples = new Float32Array(frames);
      for (let f = 0; f < frames; f++) { let s = 0; for (let c = 0; c < fmtc.channels; c++) s += v.getInt16(start + (f * fmtc.channels + c) * 2, true); samples[f] = s / fmtc.channels / 32768; }
      return { rate: fmtc.rate, samples };
    }
    o = start + size + (size % 2);
  }
  return null;
}
KINDS.audio = w => {
  const t = w.text, d = w.data, wav = decodeWav(w.assets.audio);
  w.plot.innerHTML = '<div class="w-wave"></div>' + `<audio data-static="hide" controls preload="metadata" src="${esc(w.assets.audio)}" aria-label="${esc(t.audioLabel || 'Two-second synthetic tone')}"></audio>`;
  const media = w.plot.querySelector('audio'), wave = w.plot.querySelector('.w-wave');
  w.button(t.playPause || w.ui.playPause, () => (media.paused ? media.play().catch(() => {}) : media.pause()));
  let stats = null;
  if (wav) {
    const x = wav.samples, n = x.length;
    let peak = 0, sq = 0, cross = 0;
    for (let i = 0; i < n; i++) { peak = Math.max(peak, Math.abs(x[i])); sq += x[i] * x[i]; if (i && (x[i - 1] < 0) !== (x[i] < 0)) cross++; }
    stats = { seconds: n / wav.rate, hz: cross / 2 / (n / wav.rate), peakDb: 20 * Math.log10(peak || 1e-9), rmsDb: 20 * Math.log10(Math.sqrt(sq / n) || 1e-9), rate: wav.rate };
  }
  w.on(media, 'timeupdate', () => { w.state.time = media.currentTime; w.render(); });
  w.on(media, 'play', () => w.render()); w.on(media, 'pause', () => w.render());
  return {
    render(s) {
      const { width: W, height: H } = w.size(), h = H - 64;
      let out = '';
      if (wav) {
        const x = wav.samples, n = x.length, b = box(W, h, { l: 64, r: 30, t: 40, b: 50 });
        const topH = b.h * 0.36, bt = b.t + topH + 70, bb = b.b;
        // Whole clip: min/max envelope per pixel column, with the playback position.
        // Vertical scale: full scale when asked, else the peak with headroom (the level is stated in words).
        const xs = linear([0, stats.seconds], [b.l, b.r]), A = d.fullScale ? 1 : Math.min(1, 10 ** (stats.peakDb / 20) * 1.6);
        const yTop = linear([-A, A], [b.t + topH, b.t]);
        out += text(b.l, b.t - 14, t.wholeTitle || 'Whole clip', { size: 16, fill: C.muted, valign: 'bottom' });
        const cols = Math.round(b.w), per = n / cols;
        let env = '';
        for (let c = 0; c < cols; c++) { let lo = 1, hi = -1; for (let i = Math.floor(c * per); i < Math.floor((c + 1) * per); i++) { lo = Math.min(lo, x[i]); hi = Math.max(hi, x[i]); } env += `M${r2(b.l + c)} ${r2(yTop(hi))}V${r2(yTop(lo))}`; }
        out += line(b.l, yTop(0), b.r, yTop(0), { stroke: C.rule });
        out += path(env, { stroke: C.accent, width: 1.2 });
        out += axisX(xs, { y: b.t + topH, values: ticks(0, stats.seconds, 4), format: v => fill(t.secondsTick || '{v} s', { v: fmt(v, 1, w.locale) }, w.locale) });
        const pos = clamp(Number(s.time) || 0, 0, stats.seconds);
        out += line(xs(pos), b.t - 4, xs(pos), b.t + topH + 4, { stroke: C.ink, width: 2 });
        // Close-up: the actual samples of the first few periods, with one period measured.
        const ms = d.windowMs ?? 10, m = Math.min(n, Math.round((ms / 1000) * wav.rate)), x0 = Math.round(n * 0.25);
        const xz = linear([0, ms], [b.l, b.r]), yz = linear([-A, A], [bb, bt]);
        out += text(b.l, bt - 14, fill(t.closeTitle || 'Close-up: {ms} ms of samples', { ms: fmt(ms, 0, w.locale) }, w.locale), { size: 16, fill: C.muted, valign: 'bottom' });
        out += line(b.l, yz(0), b.r, yz(0), { stroke: C.rule });
        let zp = ''; for (let i = 0; i < m; i++) zp += `${i ? 'L' : 'M'}${r2(xz((i / wav.rate) * 1000))} ${r2(yz(x[x0 + i]))}`;
        out += path(zp, { stroke: C.accent, width: 2.4 });
        // Mark one period between two upward zero crossings.
        const ups = []; for (let i = 1; i < m; i++) if (x[x0 + i - 1] < 0 && x[x0 + i] >= 0) ups.push(i - x[x0 + i] / (x[x0 + i] - x[x0 + i - 1]));
        if (ups.length > 1) {
          const p0 = (ups[0] / wav.rate) * 1000, p1 = (ups[1] / wav.rate) * 1000, yb = yz(-A) - 6;
          out += line(xz(p0), yb, xz(p1), yb, { stroke: C.ink, width: 1.6 }) + line(xz(p0), yb - 6, xz(p0), yb + 6, { stroke: C.ink, width: 1.6 }) + line(xz(p1), yb - 6, xz(p1), yb + 6, { stroke: C.ink, width: 1.6 });
          out += text(xz(p1) + 10, yb, fill(t.periodLabel || 'one period {ms} ms = 1 / {hz} Hz', { ms: fmt(p1 - p0, 2, w.locale), hz: fmt(stats.hz, 0, w.locale) }, w.locale), { size: 16, weight: 650, valign: 'middle', halo: C.paper });
        }
        out += axisX(xz, { y: bb, values: ticks(0, ms, 5), format: v => fill(t.msTick || '{v} ms', { v: fmt(v, 0, w.locale) }, w.locale) });
      } else out = text(W / 2, h / 2, t.noWave || 'Waveform shown when the audio is embedded as WAV.', { size: 18, anchor: 'middle', fill: C.muted });
      wave.innerHTML = svgRoot(W, h, out, t.figure || 'Audio waveform');
      wave.style.height = h + 'px';
      const vals = stats ? { hz: fmt(stats.hz, 0, w.locale), seconds: fmt(stats.seconds, 1, w.locale), peak: fmt(stats.peakDb, 1, w.locale), rms: fmt(stats.rmsDb, 1, w.locale),
        time: fmt(media.currentTime || 0, 1, w.locale), state: media.paused ? (t.paused || 'paused') : (t.playing || 'playing') } : {};
      if (stats && d.reference) Object.assign(vals, { cents: fmt(1200 * Math.log2(stats.hz / d.reference.hz), 1, w.locale, true), note: d.reference.name, refHz: fmt(d.reference.hz, 2, w.locale) });
      return { status: w.fill(t.status || '2-second low-amplitude synthetic tone. No autoplay.', vals), values: vals };
    },
    reset() { media.pause(); media.currentTime = 0; },
    leave() { media.pause(); },
  };
};

/* ---------- mesh kinds: orbit, explode, section and import real triangle geometry ---------- */
function clipBelow(points, limit) { // keep the part of a polygon with z <= limit (open cutaway)
  const out = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length], ia = a[2] <= limit, ib = b[2] <= limit;
    if (ia) out.push(a);
    if (ia !== ib) { const t = (limit - a[2]) / (b[2] - a[2]); out.push(a.map((v, k) => v + (b[k] - v) * t)); }
  }
  return out;
}
/** Connected pieces per face (faces that share a vertex position within the same group). */
function meshPieces(mesh) {
  const parent = new Map(), find = k => { while (parent.get(k) !== k) { parent.set(k, parent.get(parent.get(k))); k = parent.get(k); } return k; };
  const keyOf = (g, i) => g + '|' + mesh.vertices[i].map(c => Math.round(c * 1000)).join(',');
  for (const f of mesh.faces) {
    const ks = f.indices.map(i => keyOf(f.group, i));
    for (const k of ks) if (!parent.has(k)) parent.set(k, k);
    for (let j = 1; j < ks.length; j++) { const a = find(ks[0]), b = find(ks[j]); if (a !== b) parent.set(a, b); }
  }
  return mesh.faces.map(f => find(keyOf(f.group, f.indices[0])));
}
function meshBounds(mesh) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity], groups = {};
  for (const f of mesh.faces) {
    const g = groups[f.group] ||= { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity], faces: 0 };
    g.faces++;
    for (const i of f.indices) for (let k = 0; k < 3; k++) {
      const v = mesh.vertices[i][k];
      min[k] = Math.min(min[k], v); max[k] = Math.max(max[k], v); g.min[k] = Math.min(g.min[k], v); g.max[k] = Math.max(g.max[k], v);
    }
  }
  return { min, max, groups };
}
function meshWidget(w) {
  const t = w.text, kind = w.config.kind, d = w.data;
  let mesh = StudioMesh.parseOBJ(w.assets.obj), info = meshBounds(mesh), pieces = meshPieces(mesh);
  w.plot.innerHTML = `<canvas tabindex="0" role="img" aria-label="${esc(t.canvasLabel || 'Interactive triangle mesh. Drag to rotate, or use yaw and pitch sliders.')}"></canvas><svg class="w-mesh-labels" aria-hidden="true"></svg>`;
  const canvas = w.plot.querySelector('canvas'), labels = w.plot.querySelector('.w-mesh-labels');
  w.slider('yaw', w.spec('yaw', { label: 'Yaw (degrees)', min: -180, max: 180, step: 1, format: '{v}°' }));
  w.slider('pitch', w.spec('pitch', { label: 'Pitch (degrees)', min: 0, max: 180, step: 1, format: '{v}°' }));
  if (kind === 'cad-explode') w.slider('explode', w.spec('explode', { label: 'Explode amount', min: 0, max: 1, step: 0.05, digits: 2 }));
  if (kind === 'cad-section') w.slider('cut', w.spec('cut', { label: 'Visible height fraction', min: 0.05, max: 1, step: 0.05, digits: 2 }));
  if (kind === 'cad-import') {
    const l = document.createElement('label');
    l.className = 'w-field w-file';
    l.innerHTML = `<span class="w-label">${esc(t.fileLabel || 'Local OBJ / STL (8 MiB maximum)')}</span><input type="file" accept=".obj,.stl" aria-label="${esc(t.fileAria || 'Open local mesh')}">`;
    w.panel.append(l);
    w.on(l.querySelector('input'), 'change', async e => {
      try {
        const f = e.target.files[0];
        if (!f) return;
        if (f.size > 8 * 1024 * 1024) throw Error(t.tooLarge || 'File exceeds 8 MiB');
        const m = /\.obj$/i.test(f.name) ? StudioMesh.parseOBJ(await f.text()) : StudioMesh.parseSTL(await f.arrayBuffer());
        mesh = m; info = meshBounds(mesh); pieces = meshPieces(mesh); w.state.filename = f.name; w.render();
      } catch (err) { w.status.textContent = err.message; }
    });
  }
  let drag = null;
  w.on(canvas, 'pointerdown', e => { drag = { x: e.clientX, y: e.clientY, yaw: w.state.yaw, pitch: w.state.pitch }; canvas.setPointerCapture(e.pointerId); });
  w.on(canvas, 'pointermove', e => { if (!drag) return; w.state.yaw = clamp(drag.yaw + (e.clientX - drag.x) * 0.6, -180, 180); w.state.pitch = clamp(drag.pitch + (e.clientY - drag.y) * 0.6, 0, 180); w.render(); });
  w.on(canvas, 'pointerup', () => { drag = null; });
  w.on(canvas, 'pointercancel', () => { drag = null; });
  w.on(canvas, 'keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    w.state.yaw = clamp(w.state.yaw + (e.key === 'ArrowLeft' ? -5 : e.key === 'ArrowRight' ? 5 : 0), -180, 180);
    w.state.pitch = clamp(w.state.pitch + (e.key === 'ArrowUp' ? -5 : e.key === 'ArrowDown' ? 5 : 0), 0, 180);
    w.render();
  });
  const partOf = g => (d.parts || []).find(p => p.group === g);
  return {
    render(s) {
      const { width: W, height: H } = w.size(), dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      const ctx = canvas.getContext('2d'), tok = literalTokens(w.root);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const { min, max } = info, center = min.map((v, k) => (v + max[k]) / 2), extent = Math.max(...max.map((v, k) => v - min[k])) || 1;
      const groups = [...new Set(mesh.faces.map(f => f.group))], named = groups.filter(g => partOf(g));
      const labelRoom = named.length ? Math.min(300, W * 0.36) : 0, cxp = (W - labelRoom) / 2, cyp = H * 0.52;
      const scale = (Math.min(W - labelRoom, H) * 0.66) / extent;
      const ya = (s.yaw * Math.PI) / 180, pa = (s.pitch * Math.PI) / 180, ca = Math.cos(ya), sa = Math.sin(ya), cb = Math.cos(pa), sb = Math.sin(pa);
      const explode = kind === 'cad-explode' ? Number(s.explode) || 0 : 0, cut = kind === 'cad-section' ? Number(s.cut) : 1;
      const offset = g => (partOf(g)?.explode ?? groups.indexOf(g) - 1) * explode * extent * 0.3;
      const project = (v, g) => {
        let [x, y, z] = v.map((p, k) => p - center[k]);
        z += offset(g);
        const xx = x * ca - y * sa, yy = x * sa + y * ca;
        return [cxp + xx * scale, cyp + (yy * cb - z * sb) * scale, yy * sb + z * cb];
      };
      // Part colour: a role (accent, ink, muted, context …) or a categorical slot (cat-1 … cat-8).
      const colorOf = g => { const p = partOf(g), i = groups.indexOf(g), m = /^cat-(\d)$/.exec(p?.tone || '');
        return rgbOf(m ? tok.cat[(Number(m[1]) - 1) % 8] : tok[p?.tone] || tok.cat[i % 8]); };
      const limit = min[2] + (max[2] - min[2]) * cut, polys = [];
      mesh.faces.forEach((f, fi) => {
        let pts = f.indices.map(i => mesh.vertices[i]);
        if (cut < 1) pts = clipBelow(pts, limit);
        if (pts.length < 3) return;
        const p = pts.map(v => project(v, f.group));
        const a = [p[1][0] - p[0][0], p[1][1] - p[0][1], p[1][2] - p[0][2]], b = [p[2][0] - p[0][0], p[2][1] - p[0][1], p[2][2] - p[0][2]];
        const nrm = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], len = Math.hypot(...nrm) || 1;
        const shade = 0.62 + 0.38 * Math.abs((nrm[0] * 0.3 - nrm[1] * 0.55 + nrm[2] * 0.78) / len);
        polys.push({ p, g: f.group, piece: pieces[fi], depth: p.reduce((acc, v) => acc + v[2], 0) / p.length, rgb: colorOf(f.group).map(c => Math.round(c * shade)) });
      });
      polys.sort((a, b) => a.depth - b.depth);
      for (const f of polys) {
        ctx.beginPath();
        f.p.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath();
        ctx.fillStyle = ctx.strokeStyle = `rgb(${f.rgb.join(',')})`;
        ctx.lineWidth = 0.6; ctx.fill(); ctx.stroke();
      }
      s.triangles = mesh.faces.length; s.drawn = polys.length;
      // Direct labels: part name and its measured size, with a leader to a point where the part itself
      // is visible. A part hidden behind others (or above the cut) gets a dashed leader and a muted label.
      let svg = '';
      if (named.length) {
        for (const f of polys) {
          const xs = f.p.map(v => v[0]), ys = f.p.map(v => v[1]);
          f.box = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
          f.area = Math.abs(f.p.reduce((acc, v, i) => { const u = f.p[(i + 1) % f.p.length]; return acc + v[0] * u[1] - u[0] * v[1]; }, 0)) / 2;
        }
        const inside = (pt, p) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > pt[1]) !== (p[j][1] > pt[1]) && pt[0] < ((p[j][0] - p[i][0]) * (pt[1] - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; return c; };
        const topAt = pt => { for (let k = polys.length - 1; k >= 0; k--) { const f = polys[k], b = f.box; if (pt[0] >= b[0] && pt[0] <= b[2] && pt[1] >= b[1] && pt[1] <= b[3] && inside(pt, f.p)) return f; } return null; };
        // Sample points inside a face: its centre, and points towards each corner and each edge.
        const samples = f => { const c = [mean(f.p.map(v => v[0])), mean(f.p.map(v => v[1]))], out = [c];
          f.p.forEach((v, i) => { const u = f.p[(i + 1) % f.p.length]; out.push([c[0] + (v[0] - c[0]) * 0.7, c[1] + (v[1] - c[1]) * 0.7], [c[0] + ((v[0] + u[0]) / 2 - c[0]) * 0.7, c[1] + ((v[1] + u[1]) / 2 - c[1]) * 0.7]); });
          return out; };
        const testable = polys.length <= 20000;
        const items = named.map(g => {
          const gb = info.groups[g], mid = gb.min.map((v, k) => (v + gb.max[k]) / 2), dims = gb.max.map((v, k) => v - gb.min[k]);
          const own = polys.filter(f => f.g === g);
          // Visible sample points per connected piece (largest faces first, at most 200 faces tested).
          const seen = new Map();
          if (testable) for (const f of [...own].sort((a, b) => b.area - a.area).slice(0, 200)) {
            if (f.area < 2) continue;
            for (const pt of samples(f)) if (topAt(pt)?.g === g) { if (!seen.has(f.piece)) seen.set(f.piece, []); seen.get(f.piece).push({ pt, wgt: f.area }); }
          }
          let anchor, hidden = cut < 1 && gb.min[2] > limit;
          const best = [...seen.values()].sort((a, b) => sum(b.map(s => s.wgt)) - sum(a.map(s => s.wgt)))[0];
          if (best && !hidden) {
            // The visible point nearest the weighted centre of what shows of the most visible piece.
            const W0 = sum(best.map(s => s.wgt)), cx = sum(best.map(s => s.pt[0] * s.wgt)) / W0, cy = sum(best.map(s => s.pt[1] * s.wgt)) / W0;
            anchor = best.reduce((a, s) => (Math.hypot(s.pt[0] - cx, s.pt[1] - cy) < Math.hypot(a[0] - cx, a[1] - cy) ? s.pt : a), best[0].pt);
          } else {
            // Not visible: point at where the part is (the front half of its front-most piece).
            const byPiece = new Map();
            for (const f of own) { if (!byPiece.has(f.piece)) byPiece.set(f.piece, []); byPiece.get(f.piece).push(f); }
            const nearest = [...byPiece.values()].sort((a, b) => mean(b.map(f => f.depth)) - mean(a.map(f => f.depth)))[0] || [];
            const front = [...nearest].sort((a, b) => b.depth - a.depth).slice(0, Math.max(1, Math.ceil(nearest.length / 2)));
            anchor = front.length ? [mean(front.map(f => mean(f.p.map(v => v[0])))), mean(front.map(f => mean(f.p.map(v => v[1]))))]
              : project(cut < 1 ? [mid[0], mid[1], Math.min(mid[2], limit)] : mid, g);
            hidden = hidden || testable;
          }
          return { g, anchor, hidden, name: partOf(g).name, sub: partOf(g).note ?? fill(t.dims || '{a} × {b} × {c} mm', { a: fmt(dims[0], 0, w.locale), b: fmt(dims[1], 0, w.locale), c: fmt(dims[2], 1, w.locale).replace(/\.0$/, '') }, w.locale) };
        }).sort((a, b) => a.anchor[1] - b.anchor[1]);
        const lx = W - labelRoom + 24, ys = spread(items.map(it => it.anchor[1]), 62, 44, H - 44);
        items.forEach((it, k) => {
          const col = it.hidden ? C.muted : C.ink;
          svg += path(`M${r2(lx - 8)} ${r2(ys[k])}L${r2(lx - 26)} ${r2(ys[k])}L${r2(it.anchor[0])} ${r2(it.anchor[1])}`, { stroke: col, width: 1.2, dash: it.hidden ? '3 3' : null });
          svg += circle(it.anchor[0], it.anchor[1], 3.5, { fill: col, stroke: C.paper, width: 1.5 });
          svg += text(lx, ys[k] - 5, it.name, { size: 17, weight: 650, fill: col, valign: 'bottom' }) + text(lx, ys[k] + 5, it.sub, { size: 16, fill: C.muted, valign: 'top', num: true });
        });
      }
      if (kind === 'cad-section' && cut < 1) {
        const c = [[min[0], min[1]], [max[0], min[1]], [max[0], max[1]], [min[0], max[1]]].map(([x, y]) => project([x, y, limit], groups[0]));
        svg += path('M' + c.map(p => `${r2(p[0])} ${r2(p[1])}`).join('L') + 'Z', { stroke: C.accent, width: 2, dash: '7 5' });
      }
      if (d.scaleBar) {
        const len = d.scaleBar * scale, y0 = H - 26, x0 = 24;
        svg += line(x0, y0, x0 + len, y0, { stroke: C.ink, width: 2 }) + line(x0, y0 - 6, x0, y0 + 6, { stroke: C.ink, width: 2 }) + line(x0 + len, y0 - 6, x0 + len, y0 + 6, { stroke: C.ink, width: 2 });
        svg += text(x0 + len + 10, y0, fill(t.scaleLabel || '{v} mm', { v: d.scaleBar }, w.locale), { size: 16, fill: C.muted, valign: 'middle' });
      }
      labels.setAttribute('viewBox', `0 0 ${W} ${H}`);
      labels.innerHTML = svg;
      const dims = max.map((v, k) => v - min[k]);
      const vals = { triangles: fmt(mesh.faces.length, 0, w.locale), groups: groups.length, drawn: fmt(polys.length, 0, w.locale), file: s.filename || '',
        x: fmt(dims[0], 1, w.locale), y: fmt(dims[1], 1, w.locale), z: fmt(dims[2], 1, w.locale), yaw: fmt(s.yaw, 0, w.locale), pitch: fmt(s.pitch, 0, w.locale),
        gap: fmt(explode * extent * 0.3, 0, w.locale), height: fmt(limit - min[2], 1, w.locale), cutPct: fmt(cut * 100, 0, w.locale) };
      const fallback = (s.filename ? s.filename + ' · ' : 'Original assembly · ') + `${mesh.faces.length} triangles. ` +
        (kind === 'cad-section' ? 'Open cutaway, not a capped CAD solid.' : 'Units: mm for the supplied fixture; imported mesh units are not inferred.');
      const template = s.filename ? t.statusFile : t.status;
      return { status: template ? w.fill(template, vals) : fallback, values: vals };
    },
    reset() { mesh = StudioMesh.parseOBJ(w.assets.obj); info = meshBounds(mesh); pieces = meshPieces(mesh); },
  };
}
KINDS['cad-orbit'] = KINDS['cad-explode'] = KINDS['cad-section'] = KINDS['cad-import'] = meshWidget;

/* ---------- ink: annotate the evidence while speaking ---------- */
KINDS.ink = w => {
  const t = w.text, d = w.data, hasChart = !!(d.lines || d.series);
  // The canvas lies over the chart for drawing but lets hits through; the plot itself takes the pointer.
  w.plot.innerHTML = `<div class="w-ink-chart"></div><canvas class="w-ink" tabindex="0" role="img" aria-label="${esc(t.canvasLabel || 'Annotation canvas. Choose a preset annotation for a keyboard alternative.')}"></canvas>`;
  const chart = w.plot.querySelector('.w-ink-chart'), cv = w.plot.querySelector('canvas');
  let geom = null;
  const preset = () => {
    const { width: W, height: H } = w.size();
    if (geom && d.preset) {
      const S = seriesData(d), i = d.preset.at, cx = geom.x(S.xs[i]), cy = geom.y(S.lines[0].values[i]);
      const rx = d.preset.rx ?? 60, ry = d.preset.ry ?? 44;
      return Array.from({ length: 49 }, (_, k) => { const a = (k / 48) * Math.PI * 2.08 - 0.3; return [r2(cx + rx * Math.cos(a)), r2(cy + ry * Math.sin(a))]; });
    }
    return [[W * 0.27, H * 0.33], [W * 0.66, H * 0.33], [W * 0.66, H * 0.67], [W * 0.27, H * 0.67], [W * 0.27, H * 0.33]].map(p => p.map(r2));
  };
  w.button(t.preset || 'Add focus annotation', () => { w.state.paths.push(preset()); w.render(); });
  w.button(t.clear || 'Clear annotations', () => { w.state.paths = []; w.render(); });
  let drawing = false;
  const point = e => { const r = cv.getBoundingClientRect(), { width: W, height: H } = w.size(); return [r2(((e.clientX - r.left) * W) / r.width), r2(((e.clientY - r.top) * H) / r.height)]; };
  w.on(w.plot, 'pointerdown', e => { drawing = true; w.plot.setPointerCapture(e.pointerId); w.state.paths.push([point(e)]); w.render(); });
  w.on(w.plot, 'pointermove', e => { if (drawing) { w.state.paths.at(-1).push(point(e)); w.render(); } });
  w.on(w.plot, 'pointerup', () => { drawing = false; });
  w.on(w.plot, 'pointercancel', () => { drawing = false; });
  return {
    render(s) {
      const { width: W, height: H } = w.size(), tok = literalTokens(w.root), dpr = Math.min(2, window.devicePixelRatio || 1);
      if (hasChart) {
        const S = seriesData(d), g = lineChart(w, S, { W, H, refs: d.refs });
        geom = g;
        let out = g.out + g.endLabels;
        for (const m of d.marks || []) {
          const mx = g.x(S.xs[m.at]);
          out += line(mx, g.b.t - 8, mx, g.b.b, { stroke: C.ink, width: 1.4, dash: '4 4' }) + text(mx + 8, g.b.t - 6, m.label, { size: 16, weight: 650, valign: 'top', halo: C.paper });
        }
        chart.innerHTML = svgRoot(W, H, out, t.figure || 'Chart to annotate');
      } else chart.innerHTML = '';
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      if (!hasChart) { ctx.strokeStyle = tok.rule; ctx.lineWidth = 1; ctx.strokeRect(0.5, 0.5, W - 1, H - 1); }
      ctx.strokeStyle = tok[d.inkTone] || tok.accent; ctx.lineWidth = 4; ctx.lineCap = ctx.lineJoin = 'round';
      for (const p of s.paths) { ctx.beginPath(); p.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }
      const vals = { marks: s.paths.length };
      return { status: w.fill(t.status || 'Pointer drawing has a keyboard-accessible preset and reset. Annotations are session-local.', vals), values: vals };
    },
  };
};

window.mountStudioWidgets = (configs, assets) => configs.map(c => mount(c, assets));
})();
