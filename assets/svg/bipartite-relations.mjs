// Diagram study · Bipartite relations — two kinds of entities, kept in two columns.
// Teachers on the left, courses on the right; a line means "qualified to teach", nothing more.
// Coverage per course, the single-teacher courses (accent), rail numbers and headline are computed.
import { theme as makeTheme, svgRoot, el, g, textLines } from '../runtime/figure.mjs';

const teachers = [
  { id: 'okafor', label: 'Ms Okafor' }, { id: 'lindqvist', label: 'Mr Lindqvist' }, { id: 'haddad', label: 'Ms Haddad' },
  { id: 'brennan', label: 'Mr Brennan' }, { id: 'takeda', label: 'Ms Takeda' }, { id: 'silva', label: 'Mr Silva' },
];
const courses = [
  { id: 'phys', label: 'Physics' }, { id: 'chem', label: 'Chemistry' }, { id: 'bio', label: 'Biology' },
  { id: 'math', label: 'Mathematics' }, { id: 'stats', label: 'Statistics' }, { id: 'comp', label: 'Computing' },
  { id: 'econ', label: 'Economics' },
];
const qualified = [ // teacher → course they hold a qualification for (illustrative records)
  ['okafor', 'phys'], ['okafor', 'math'], ['lindqvist', 'chem'], ['lindqvist', 'bio'], ['haddad', 'bio'], ['haddad', 'chem'],
  ['brennan', 'math'], ['brennan', 'stats'], ['brennan', 'econ'], ['takeda', 'comp'], ['takeda', 'math'],
  ['silva', 'econ'], ['silva', 'bio'],
];
const cover = Object.fromEntries(courses.map(c => [c.id, qualified.filter(([, k]) => k === c.id).map(([tch]) => tch)]));
const single = courses.filter(c => cover[c.id].length === 1);
const words = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];
const name = id => [...teachers, ...courses].find(x => x.id === id).label;

export function figure(theme = 'css') {
  const t = makeTheme(theme), id = 'bipartite-relations-fig', W = 800, H = 482, size = 18;
  const lw = 184, rw = 236, top = 40, bh = 50;
  // Each column is spaced evenly over the same height; order within a column carries no rank.
  const rowY = (i, n) => top + 6 + i * ((H - top - 8 - bh) / (n - 1));
  const L = Object.fromEntries(teachers.map((tc, i) => [tc.id, { x: 0, y: rowY(i, teachers.length) }]));
  const R = Object.fromEntries(courses.map((c, i) => [c.id, { x: W - rw, y: rowY(i, courses.length) }]));
  const isSingle = c => cover[c].length === 1;
  const link = ([tc, c]) => {
    const a = [L[tc].x + lw, L[tc].y + bh / 2], b = [R[c].x - 3, R[c].y + bh / 2], mx = (a[0] + b[0]) / 2, em = isSingle(c);
    return el('path', { d: `M${a[0]} ${a[1]}C${mx} ${a[1]} ${mx} ${b[1]} ${b[0]} ${b[1]}`, fill: 'none', stroke: em ? t.c('accent') : t.c('muted'), 'stroke-width': em ? 3 : 1.6, opacity: em ? 1 : 0.55, 'stroke-linecap': 'round' });
  };
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Which teachers are qualified to teach which courses',
    desc: `${teachers.length} teachers on the left, ${courses.length} courses on the right; each line is one qualification, and no line is drawn for symmetry. Neither column ranks the other. ${single.map(c => `${c.label} has only ${name(cover[c.id][0])}`).join('; ')}; every other course has two or more qualified teachers.` },
  textLines(['Teachers'], { x: 0, y: 4, size: 17, valign: 'top', fill: t.c('muted'), weight: 700 }),
  textLines(['Courses'], { x: W - rw, y: 4, size: 17, valign: 'top', fill: t.c('muted'), weight: 700 }),
  textLines(['qualified'], { x: W - 14, y: 4, size: 17, anchor: 'end', valign: 'top', fill: t.c('muted'), weight: 700 }),
  // context links first, single-teacher links on top
  g({ class: 'bipartite-links' }, qualified.filter(q => !isSingle(q[1])).map(link), qualified.filter(q => isSingle(q[1])).map(link)),
  teachers.map(tc => g({}, el('rect', { x: L[tc.id].x, y: L[tc.id].y, width: lw, height: bh, rx: 9, fill: t.c('paper'), stroke: t.c('rule'), 'stroke-width': 1.4 }),
    textLines([tc.label], { x: lw / 2, y: L[tc.id].y + bh / 2, size, anchor: 'middle', valign: 'middle', fill: t.c('ink'), weight: 600 }))),
  courses.map(c => {
    const em = isSingle(c.id), { x, y } = R[c.id], ink = em ? t.c('onAccent') : t.c('ink');
    return g({}, el('rect', { x, y, width: rw, height: bh, rx: 9, fill: em ? t.c('accent') : t.c('paper'), stroke: em ? t.c('accent') : t.c('rule'), 'stroke-width': 1.4 }),
      textLines([c.label], { x: x + 18, y: y + bh / 2, size, valign: 'middle', fill: ink, weight: 600 }),
      textLines([String(cover[c.id].length)], { x: x + rw - 14, y: y + bh / 2, size, anchor: 'end', valign: 'middle', fill: ink, weight: 700, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  }));
}

export default {
  study: true,
  id: 'bipartite-relations',
  title: 'Bipartite relations: two kinds of entities kept apart',
  className: 'st st--left cs-classroom-bright',
  notes: 'Purpose: Show assignments between two different kinds of entities without implying that one column ranks or contains the other.\nModify: Edit `teachers`, `courses` and `qualified` (keep real IDs). Coverage counts, the accented single-teacher courses, the rail and the headline recompute.\nInvariant: Entities stay in their own column; every line is one real relation; never add lines for visual regularity or remove awkward ones; order within a column carries no rank.\nStatic: Already static. For a build, draw the two columns first, then the relations.',
  sources: [{ type: 'original-example', file: 'assets/svg/bipartite-relations.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${words[single.length]} of ${words[courses.length].toLowerCase()} courses rest on a single qualified teacher</h1>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b class="st-accent">${single.length}</b><span>${single.map(c => `${c.label} (${name(cover[c.id][0])})`).join(', ')}: one absence and the course has no cover.</span></div>
  <hr class="st-rule">
  <div class="st-kpi"><b>${qualified.length}</b><span>qualifications on file for ${teachers.length} teachers. A line means qualified, not timetabled.</span></div>
</div>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · Hillside Secondary, qualifications on file for 2026–27</span><span>Bipartite diagram</span></p>`,
};
