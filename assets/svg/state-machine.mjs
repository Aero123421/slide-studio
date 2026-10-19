// Diagram study · State machine — the allowed moves of one outpatient referral, with counts.
// States sit on a grid (col,row) that may be rearranged; transitions are data and are never
// rearranged. Box sizes, column gaps, ports, routes and label positions are computed.
import { theme as makeTheme, svgRoot, el, g, textLines, measureText, arrowMarker, measureNode, drawNode, roundedPolyline, sum, fmt } from '../runtime/figure.mjs';

const states = [ // exits are the only states a referral can end in
  { id: 'received', label: 'Referral received', kind: 'terminal', col: 0, row: 0 },
  { id: 'triaged', label: 'Triaged', sub: 'consultant review', col: 1, row: 0 },
  { id: 'booked', label: 'Booked', sub: 'appointment set', col: 1, row: 1 },
  { id: 'seen', label: 'Seen in clinic', col: 1, row: 2 },
  { id: 'dna', label: 'Did not attend', col: 2, row: 1 },
  { id: 'returned', label: 'Back to the GP', kind: 'terminal', exit: true, col: 3, row: 0 },
  { id: 'discharged', label: 'Discharged', kind: 'terminal', exit: true, col: 3, row: 2 },
];
const transitions = [ // n = referrals of the March cohort taking this move; a referral can be rebooked once
  { from: 'received', to: 'triaged', event: 'review', n: 1000 },
  { from: 'triaged', to: 'booked', event: 'accepted', n: 880 },
  { from: 'triaged', to: 'returned', event: 'criteria not met', n: 120 },
  { from: 'booked', to: 'seen', event: 'attends', n: 852 },
  { from: 'booked', to: 'dna', event: 'no-show', n: 124 },
  { from: 'dna', to: 'booked', event: '[1st] rebook', n: 96 },
  { from: 'dna', to: 'returned', event: '[2nd] return', n: 28, labelSide: 'left' },
  { from: 'seen', to: 'discharged', event: 'treated', n: 852 },
];

// Every referral ends in exactly one exit, so exit counts must add up to the cohort.
const cohort = transitions.filter(t => t.from === states[0].id).reduce((s, t) => s + t.n, 0);
const into = id => transitions.filter(t => t.to === id).reduce((s, t) => s + t.n, 0);
const exits = states.filter(s => s.exit).map(s => ({ ...s, n: into(s.id) }));
if (sum(exits.map(e => e.n)) !== cohort) throw Error('state-machine: exit counts do not add up to the cohort');
const unseen = exits.find(e => e.id === 'returned'), treated = exits.find(e => e.id === 'discharged');

export function figure(theme = 'css') {
  const t = makeTheme(theme), id = 'state-machine-fig', W = 1152, H = 446, size = 19, ls = 17;
  const ctx = { t, size };
  const nodes = states.map(s => measureNode({ ...s, sub: s.exit ? `${fmt(into(s.id))} referrals` : s.sub, emphasis: s.id === unseen.id, fill: s.id === unseen.id ? null : t.c('paper') }, { size, maxWidth: 230, minWidth: 150 }));
  const byId = Object.fromEntries(nodes.map(nd => [nd.id, nd]));
  const label = tr => `${tr.event}  ${fmt(tr.n)}`;
  // Columns: each gap is wide enough for the labels of horizontal moves between neighbours.
  const cols = Math.max(...nodes.map(nd => nd.col)) + 1, rows = Math.max(...nodes.map(nd => nd.row)) + 1;
  const colW = Array.from({ length: cols }, (_, c) => Math.max(...nodes.filter(nd => nd.col === c).map(nd => nd.w)));
  const rowH = Array.from({ length: rows }, (_, r) => Math.max(...nodes.filter(nd => nd.row === r).map(nd => nd.h)));
  const gapX = Array(cols - 1).fill(60);
  for (const tr of transitions) {
    const a = byId[tr.from], b = byId[tr.to];
    if (a.row === b.row && Math.abs(a.col - b.col) === 1) gapX[Math.min(a.col, b.col)] = Math.max(gapX[Math.min(a.col, b.col)], measureText(label(tr), ls, { weight: 600 }) + 36);
  }
  const spareX = (W - sum(colW) - sum(gapX)) / (cols - 1), gapY = (H - sum(rowH)) / (rows - 1);
  if (spareX < 0 || gapY < 60) throw Error('state-machine: grid does not fit; shorten labels or change the grid');
  const cx = [], cy = [];
  colW.forEach((w, c) => cx.push(c ? cx[c - 1] + colW[c - 1] / 2 + gapX[c - 1] + spareX + w / 2 : w / 2));
  rowH.forEach((h, r) => cy.push(r ? cy[r - 1] + rowH[r - 1] / 2 + gapY + h / 2 : h / 2));
  for (const nd of nodes) { nd.w = colW[nd.col]; nd.x = cx[nd.col] - nd.w / 2; nd.y = cy[nd.row] - nd.h / 2; }

  // Route: straight when two states share a row or column, otherwise out sideways and in vertically.
  // A pair of opposite moves is drawn as two parallel lines 24 px apart.
  const edges = transitions.map(tr => {
    const a = byId[tr.from], b = byId[tr.to], em = tr.to === unseen.id;
    const paired = transitions.some(u => u.from === tr.to && u.to === tr.from);
    const off = paired ? (a.col < b.col || a.row < b.row ? -12 : 12) : 0;
    const ax = a.x + a.w / 2, ay = a.y + a.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2, gap = 4;
    let pts, lab;
    if (a.row === b.row) {
      const dir = Math.sign(bx - ax), y = ay + off;
      pts = [[ax + dir * a.w / 2, y], [bx - dir * (b.w / 2 + gap), y]];
      lab = { x: (pts[0][0] + pts[1][0]) / 2, y: off > 0 ? y + 10 : y - 10, anchor: 'middle', valign: off > 0 ? 'top' : 'bottom' };
    } else if (a.col === b.col) {
      const dir = Math.sign(by - ay), x = ax + off;
      pts = [[x, ay + dir * a.h / 2], [x, by - dir * (b.h / 2 + gap)]];
      lab = { x: x + 12, y: (pts[0][1] + pts[1][1]) / 2, anchor: 'start', valign: 'middle' };
    } else {
      const dir = Math.sign(bx - ax), dirY = Math.sign(by - ay);
      pts = [[ax + dir * a.w / 2, ay], [bx, ay], [bx, by - dirY * (b.h / 2 + gap)]];
      const left = tr.labelSide === 'left';
      lab = { x: bx + (left ? -12 : 12), y: (ay + pts[2][1]) / 2, anchor: left ? 'end' : 'start', valign: 'middle' };
    }
    const color = em ? t.c('accent') : t.c('ink');
    return {
      line: el('path', { d: roundedPolyline(pts, 12), fill: 'none', stroke: em ? t.c('accent') : t.c('muted'), 'stroke-width': em ? 2.6 : 1.8, 'marker-end': `url(#${id}-arr${em ? '-em' : ''})`, 'stroke-linecap': 'round' }),
      text: el('text', { x: lab.x, y: lab.valign === 'top' ? lab.y + ls * 0.74 : lab.valign === 'bottom' ? lab.y - ls * 0.22 : lab.y + ls * 0.36, 'font-size': ls, 'text-anchor': lab.anchor === 'start' ? null : lab.anchor, fill: color, 'font-weight': 600, stroke: t.c('paper'), 'stroke-width': 5, 'stroke-linejoin': 'round', 'paint-order': 'stroke' },
        tr.event, el('tspan', { fill: em ? t.c('accent') : t.c('muted'), 'font-weight': 400, 'font-variant-numeric': 'tabular-nums' }, `  ${fmt(tr.n)}`)),
    };
  });
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Allowed states and transitions of an outpatient referral, March cohort',
    desc: `Seven states. Each arrow is one allowed transition, labelled with its event or [guard] and the number of referrals that took it; no other moves exist. Of ${fmt(cohort)} referrals, ${fmt(treated.n)} were discharged after a visit and ${fmt(unseen.n)} returned to the GP unseen: ${fmt(transitions.find(x => x.to === 'returned' && x.from === 'triaged').n)} at triage and ${fmt(transitions.find(x => x.to === 'returned' && x.from === 'dna').n)} after a second missed visit.` },
  el('defs', {}, arrowMarker(`${id}-arr`, t.c('muted'), { size: 12 }), arrowMarker(`${id}-arr-em`, t.c('accent'), { size: 13 })),
  g({ class: 'ss-edges' }, edges.map(e => e.line)),
  nodes.map(nd => drawNode(nd, ctx)),
  g({ class: 'ss-edge-labels' }, edges.map(e => e.text)),
  // notation key in the free lower-left cell
  textLines(['Each arrow is an allowed move.', 'Label: event or [guard], then', 'number of referrals.'], { x: 0, y: H - 2, valign: 'bottom', size: 16, fill: t.c('muted'), lineHeight: 1.35 }));
}

export default {
  study: true,
  id: 'state-machine',
  title: 'State machine: allowed transitions with events',
  className: 'st cs-clinical-trial',
  notes: 'Purpose: Describe which state changes are valid, what triggers each one, and how often each was taken.\nModify: Edit `states` (grid col/row may change freely) and `transitions` (event or [guard] plus a count). Column gaps, routes, the exit totals, the accent on the exit under discussion and the headline recompute; an exit check throws if exits do not add up to the cohort.\nInvariant: Every allowed transition is drawn and nothing else; each arrow carries its event or guard; moving a state on the grid never adds, removes or redirects an arrow.\nStatic: Already static. For a build, reveal one transition per click in cohort order.',
  sources: [{ type: 'original-example', file: 'assets/svg/state-machine.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">A referral can end only two ways. ${fmt(unseen.n)}&nbsp;of&nbsp;${fmt(cohort)} went <em>${unseen.label.toLowerCase().replace('the gp', 'the GP')}</em> without being seen</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · referrals received in March, followed to closure</span><span>State transition diagram</span></p>`,
};
