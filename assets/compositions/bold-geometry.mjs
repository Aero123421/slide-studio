// Composition study · Bold geometry — one graphic decision: nested squares whose areas are the counts.
// Three squares share the page's bottom-left corner. Each side is √(count / collection) of the
// largest, so the eye compares areas that are true to the numbers. Labels, ratios and the
// headline are computed from `museum`.
import { fmt } from '../runtime/figure.mjs';

const museum = { // objects, September 2026 (illustrative)
  collection: 412000,
  onDisplay: 15800,          // in the galleries today
  openStorage: 66600,        // extra objects visible in the proposed open store at the Dock Street depot
  cost: 41, opens: 2029,     // € million, year
};
const visible = museum.onDisplay + museum.openStorage;
const oneIn = n => Math.round(museum.collection / n);
const words = { 4: 'four', 5: 'five', 6: 'six', 26: '26' };
const say = n => words[n] ?? String(n);

// Geometry: the collection square bleeds off the bottom-left corner of the page.
const S = 600, page = { w: 1280, h: 720 };
const side = n => S * Math.sqrt(n / museum.collection);
const squares = [
  { key: 'collection', n: museum.collection, label: 'objects in the collection, most of them in closed stores', fill: 'color-mix(in srgb, var(--ss-surface) 70%, var(--ss-context))', text: 'var(--ss-ink)' },  // dark, but visible as an area on projectors
  { key: 'visible', n: visible, label: 'visible with open storage', fill: 'var(--ss-accent)', text: 'var(--ss-on-accent)' },
  { key: 'display', n: museum.onDisplay, label: 'on display today', fill: 'var(--ss-ink)', text: 'var(--ss-paper)' },
].map(q => ({ ...q, s: side(q.n) }));
// Each square is labelled just above its own top edge, at one left spine, on whatever lies there:
// the page for the collection, the next-larger square for the others (so the label is its child).
const spine = 64;
const label = (q, top, color) => `<p class="bg-label" style="left:${spine}px;top:${top.toFixed(1)}px;color:${color}"><b>${fmt(q.n)}</b>${q.label}</p>`;
const shapes = squares.map((q, i) => {
  const inner = squares[i + 1] ? label(squares[i + 1], q.s - squares[i + 1].s - 72, q.text) : '';
  return `<div class="bg-sq" style="width:${q.s.toFixed(1)}px;height:${q.s.toFixed(1)}px;background:${q.fill}">${inner}</div>`;
}).join('');
const labels = label(squares[0], page.h - squares[0].s - 72, 'var(--ss-ink)');

export default {
  study: true,
  id: 'composition-bold-geometry',
  title: 'Bold geometry: nested squares whose areas are the numbers',
  className: 'st cs-strategy-dark cmp-bold',
  notes: 'Purpose: Make one quantitative contrast impossible to miss on a strategy or poster page: a whole and two parts of it, drawn as nested squares whose areas are the counts.\nModify: Replace `museum` with your whole and parts (a budget and two lines of it, a site and the area in use). Sides are computed as √(part / whole) of the largest square; keep three squares at most and keep them sharing one corner. Rewrite the headline around the ratio the squares show.\nInvariant: Areas are proportional to the numbers and every square is fully visible; the large form bleeds off the page corner and the text keeps its own column on the right; one accent (brass) for the proposal, light ink for what is lit today, the dark surface for the rest; labels sit at one left spine just above each square’s top edge.\nStatic: Already static. A build that grows the brass square from the small one is the only motion that would explain anything.',
  sources: [{ type: 'original-example', file: 'assets/compositions/bold-geometry.mjs' }],
  exportPolicy: 'final',
  content: `<div class="bg-squares" data-region="primary" role="group" aria-label="Three nested squares with areas proportional to ${fmt(museum.collection)} objects in the collection, ${fmt(visible)} visible with open storage and ${fmt(museum.onDisplay)} on display today.">${shapes}</div>
${labels}
<p class="bg-run" data-region="support">Harbour Museum, strategy 2027–2031</p>
<h1 class="bg-head" data-region="title">We show one object in ${say(oneIn(museum.onDisplay))}.</h1>
<p class="bg-lead" data-region="support">An open store at the Dock Street depot would put ${fmt(museum.openStorage)} more on view: one in ${say(oneIn(visible))}.</p>
<p class="bg-facts" data-region="support">€${museum.cost} million, opening ${museum.opens}</p>
<p class="bg-source" data-region="source">Illustrative data, collection database September 2026.<br>Square areas are proportional to object counts.</p>`,
};
