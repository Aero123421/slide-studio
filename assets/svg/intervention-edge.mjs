// Diagram study · Intervention edge — the same causal graph before and after do(X).
// The graph edit is computed: every edge into the target is cut, the assignment edge is added, and
// everything else is drawn from the same node positions so only the edit changes between panels.
import { svgRoot, el, g, textLines, theme as makeTheme, fmt, arrowMarker, measureNode, drawNode, boxPort, edgeLabel } from '../runtime/figure.mjs';

const nodes = [ // centers in panel coordinates
  { id: 'loyal', label: 'Customer loyalty', sub: 'past 12-month spend', x: 358, y: 74 },
  { id: 'disc', label: 'Member discount', x: 250, y: 222, maxWidth: 150 },
  { id: 'repeat', label: 'Repeat purchase', sub: 'within 60 days', x: 470, y: 222, maxWidth: 170 },
  { id: 'season', label: 'Season', sub: 'slow or busy month', x: 358, y: 370 },
];
const edges = [ // assumed direct causes
  { from: 'loyal', to: 'disc', why: 'sent to loyal members' },
  { from: 'season', to: 'disc', why: 'sent in slow months' },
  { from: 'loyal', to: 'repeat' },
  { from: 'season', to: 'repeat' },
  { from: 'disc', to: 'repeat' },
];
const target = 'disc';
const assigner = { id: 'coin', label: 'Coin flip', sub: 'per member', x: 62, y: 222 };
const gap = { observed: 18.2, randomized: 4.1 };   // repeat-purchase rate, with − without discount, percentage points

// The graph edit do(target): cut incoming edges, add the assignment edge, keep everything else.
const cut = edges.filter(e => e.to === target);
const kept = edges.filter(e => e.to !== target);
const added = [{ from: assigner.id, to: target }];
const words = ['no', 'one', 'two', 'three', 'four', 'five'];

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'intervention-edge-fig', ctx = { t, size: 18 };
  const measured = Object.fromEntries([...nodes, assigner].map(nd => { const m = measureNode(nd, { size: 18, maxWidth: 200, minWidth: 120 }); return [nd.id, { ...m, x: nd.x - m.w / 2, y: nd.y - m.h / 2 }]; }));
  const ends = (e, dx) => {
    const a = measured[e.from], b = measured[e.to], A = { ...a, x: a.x + dx }, B = { ...b, x: b.x + dx };
    const p = boxPort(A, B.x + B.w / 2, B.y + B.h / 2, 2), q = boxPort(B, A.x + A.w / 2, A.y + A.h / 2, 6);
    return { p, q, mid: [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2] };
  };
  const edge = (e, dx, style) => {
    const { p, q } = ends(e, dx);
    const s = { plain: [t.c('muted'), 1.8, null, 'arr'], focus: [t.c('ink'), 2.5, null, 'arr-ink'], cut: [t.c('context'), 1.6, '5 5', null], add: [t.c('accent'), 2.8, null, 'arr-accent'] }[style];
    return el('path', { d: `M${p[0]} ${p[1]}L${q[0]} ${q[1]}`, fill: 'none', stroke: s[0], 'stroke-width': s[1], 'stroke-dasharray': s[2], 'stroke-linecap': 'round', 'marker-end': s[3] ? `url(#${id}-${s[3]})` : null });
  };
  const cross = ([cx, cy], r = 11) => el('path', { d: `M${cx - r} ${cy - r}L${cx + r} ${cy + r}M${cx + r} ${cy - r}L${cx - r} ${cy + r}`, stroke: t.c('accent'), 'stroke-width': 3.2, 'stroke-linecap': 'round' });
  const node = (nd, dx, extra = {}) => drawNode({ ...measured[nd.id], x: measured[nd.id].x + dx, ...extra }, ctx);
  const styleOf = e => (e.from === target ? 'focus' : 'plain');

  const panel = (dx, observed) => g({},
    textLines([observed ? 'As observed' : `In the experiment: do(${nodes.find(nd => nd.id === target).label.toLowerCase()})`], { x: dx, y: 4, size: 19, valign: 'top', weight: 700, fill: t.c('ink') }),
    observed
      ? [edges.map(e => edge(e, dx, styleOf(e))), cut.map(e => edgeLabel(e.why, ...ends(e, dx).mid, ctx, { weight: 400, size: 15 }))]
      : [kept.map(e => edge(e, dx, styleOf(e))), cut.map(e => edge(e, dx, 'cut')), cut.map(e => cross(ends(e, dx).mid)), added.map(e => edge(e, dx, 'add'))],
    nodes.map(nd => node(nd, dx, nd.id === target && !observed ? { stroke: t.c('accent'), strokeWidth: 2.4 } : {})),
    observed ? '' : node(assigner, dx, { emphasis: true }),
    textLines([`${fmt(observed ? gap.observed : gap.randomized, { digits: 1, sign: true })} pts`], { x: dx, y: H - 30, size: 30, valign: 'bottom', weight: 700, fill: t.c('ink') }),
    textLines([observed ? 'repeat-rate gap, members with vs without' : 'gap when a coin decides who gets it'], { x: dx, y: H - 4, size: 16, valign: 'bottom', fill: t.c('muted') }));

  const split = 588;
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Intervention as a graph edit: randomizing the member discount',
    desc: `Left, the observed causal graph: customer loyalty and season both cause who gets the member discount and whether they buy again. Right, the same graph under do(discount): the ${cut.length} arrows into the discount are cut and a coin flip becomes its only cause; all other arrows are unchanged. The repeat-purchase gap falls from ${fmt(gap.observed, { digits: 1 })} to ${fmt(gap.randomized, { digits: 1 })} percentage points.` },
  el('defs', {}, arrowMarker(`${id}-arr`, t.c('muted')), arrowMarker(`${id}-arr-ink`, t.c('ink')), arrowMarker(`${id}-arr-accent`, t.c('accent'))),
  panel(0, true),
  el('line', { fill: 'none', x1: split - 22, x2: split - 22, y1: 0, y2: H, stroke: t.c('rule'), 'stroke-width': 1 }),
  panel(split, false));
}

export default {
  study: true,
  id: 'intervention-edge',
  title: 'Intervention edge: what do(X) removes',
  className: 'st cs-strategy-dark',
  notes: 'Purpose: Show exactly which assumption an intervention changes: the arrows into the intervened variable, and nothing else.\nModify: Edit `nodes` (fixed positions), `edges`, `target` and `assigner`; the cut edges, the kept edges and the added assignment edge are computed. Replace `gap` with your observational and experimental estimates.\nInvariant: Both panels share node positions; every cross marks an edge that the graph edit actually removes; arrows out of the target and all other edges stay identical; say in words what the intervention removes.\nStatic: Already static. As motion, keep one graph and let the cut edges fade while the crosses and the coin edge appear.',
  sources: [{ type: 'original-example', file: 'assets/svg/intervention-edge.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">A <em>coin&nbsp;flip</em> cuts the ${words[cut.length] ?? cut.length} arrows into the discount, and its apparent lift falls from ${fmt(gap.observed, { digits: 0 })} to ${fmt(gap.randomized, { digits: 0 })} points</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · loyalty programme of a fictional grocery chain, 60-day repeat purchase</span><span>Causal graph before and after intervention</span></p>`,
};
