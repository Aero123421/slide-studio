// Composition study · Geometric poster — one geometric grammar, derived from the subject.
// Every arc is a vibrating segment of one string: the nth harmonic divides the string into n
// equal parts, so its arcs have diameter L/n. Nothing is placed by eye; the geometry is the content.
import { svgRoot, el, g, textLines, theme as makeTheme, n } from '../runtime/figure.mjs';

const harmonics = 8;          // how many harmonics to draw
const featured = 3;           // the one in the accent: touch the string at 1/3 to sound it
// Dates are ISO strings; weekday names are derived, never typed.
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const day = (iso, { weekday = true, year = true } = {}) => { const d = new Date(`${iso}T12:00:00Z`); return `${weekday ? `${DAYS[d.getUTCDay()]} ` : ''}${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}${year ? ` ${d.getUTCFullYear()}` : ''}`; };
const concert = {
  title: 'Overtones',
  line: 'A lecture-concert on the natural harmonics of a single string',
  people: ['Mira Okafor, cello', 'Anton Vahl, lecture'],
  date: '2026-12-04', time: '19:30',
  where: 'Small Hall, Linden Conservatory',
};
// The string spans columns 4–12 on the slide; the drawing is authored at that size.
const string = { x0: 358, x1: 1216, y: 640 };
const L = string.x1 - string.x0;
const glyph = { '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾', '1/5': '⅕', '2/5': '⅖', '3/5': '⅗', '4/5': '⅘', '1/6': '⅙', '5/6': '⅚', '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞' };
const frac = (k, d) => glyph[`${k}/${d}`] ?? `${k}/${d}`;
// Nodes of the featured harmonic: where its arcs meet the string, between the ends.
const nodes = Array.from({ length: featured - 1 }, (_, i) => ({ x: string.x0 + ((i + 1) * L) / featured, label: frac(i + 1, featured) }));
const ordinal = k => `${k}${k % 10 === 1 && k !== 11 ? 'st' : k % 10 === 2 && k !== 12 ? 'nd' : k % 10 === 3 && k !== 13 ? 'rd' : 'th'}`;

function drawing(theme = 'css') {
  const t = makeTheme(theme), W = 1280, H = 720;
  const arcs = Array.from({ length: harmonics }, (_, i) => {
    const h = i + 1, d = L / h, hot = h === featured;
    const path = Array.from({ length: h }, (_, k) => {
      const a = string.x0 + k * d;
      return `M${n(a)} ${string.y}A${n(d / 2)} ${n(d / 2)} 0 0 1 ${n(a + d)} ${string.y}`;
    }).join('');
    return el('path', { d: path, fill: 'none', stroke: hot ? t.c('accent') : t.c('ink'), 'stroke-width': hot ? 3 : 1.25, opacity: hot ? 1 : 0.78 });
  });
  // Harmonic numbers above the last arc of the first three (higher ones are too close to label).
  const numbers = [1, 2, 3].map(h => {
    const r = L / (2 * h), cx = string.x1 - r;
    return textLines([String(h)], { x: cx, y: string.y - r - 12, size: 16, anchor: 'middle', fill: h === featured ? t.c('accent') : t.c('muted'), weight: h === featured ? 700 : 400 });
  });
  return svgRoot({ id: 'composition-geometric-poster-arcs', width: W, height: H, theme: t,
    title: `The first ${harmonics} harmonics of one string, drawn to scale`,
    desc: `A horizontal string with ${harmonics} families of semicircles above it: one arc for the fundamental, two for the second harmonic, up to ${harmonics} for the ${ordinal(harmonics)}. The ${ordinal(featured)} harmonic is highlighted; its nodes divide the string at ${nodes.map(p => p.label).join(' and ')} of its length.` },
  g({}, arcs),
  el('line', { x1: string.x0, x2: string.x1, y1: string.y, y2: string.y, stroke: t.c('ink'), 'stroke-width': 2 }),
  [string.x0, string.x1].map(x => el('line', { x1: x, x2: x, y1: string.y - 9, y2: string.y + 9, stroke: t.c('ink'), 'stroke-width': 2 })),
  numbers,
  nodes.map(p => g({}, el('circle', { cx: p.x, cy: string.y, r: 5.5, fill: t.c('accent') }),
    textLines([p.label], { x: p.x, y: string.y + 30, size: 20, anchor: 'middle', fill: t.c('accent'), weight: 600 }))),
  textLines(['Nut'], { x: string.x0, y: string.y + 30, size: 15, anchor: 'middle', fill: t.c('muted') }),
  textLines(['Bridge'], { x: string.x1, y: string.y + 30, size: 15, anchor: 'end', fill: t.c('muted') }));
}

export default {
  study: true,
  id: 'composition-geometric-poster',
  title: 'Geometric poster: shapes constructed from the subject’s own proportions',
  className: 'st cs-luxury-noir cmp-geometric-poster',
  notes: `Purpose: Make a poster-like title page (a concert, an exhibition, a lecture series) whose shapes are a construction drawing of the subject, so the image is also a true statement: here the arcs are the vibrating segments of the first ${harmonics} harmonics of one string.\nModify: Keep one geometric rule and derive every shape from the subject's numbers: change \`harmonics\` or \`featured\`, or replace the rule (paper sizes halving at 1:√2, a scale's frequency ratios, orbits to scale). Replace \`concert\`.\nInvariant: One kind of mark (arcs on one baseline), thin and unfilled; one accent for the one element the event is about; the text keeps its own zone (columns 1–3 and the top band) and never crosses a line; a caption says what the geometry is, so it cannot be read as data it is not.\nStatic: Already static.`,
  sources: [{ type: 'original-example', file: 'assets/compositions/geometric-poster.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="gp-art" data-region="primary">${drawing()}</figure>
<h1 class="gp-title" data-region="title">${concert.title}</h1>
<p class="gp-line" data-region="support">${concert.line}</p>
<p class="gp-meta" data-region="support">${concert.people.join('<br>')}<br><br>${day(concert.date)}, ${concert.time}<br>${concert.where}</p>
<p class="gp-caption" data-region="source">Drawn to scale: the arcs are the vibrating parts of one string in its first ${harmonics} harmonics. Touched lightly at ${frac(1, featured)} of its length, the string sounds the ${ordinal(featured)} (gold).</p>`,
};
