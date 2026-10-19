// Diagram study · State contract — allowed moves, explicitly forbidden moves, and an identity
// that no move redefines. Top: the payment state machine. Bottom: one payment's record, aligned
// to the states it passed through; fields that never change run as unbroken bars. The history is
// checked against the allowed moves and the invariants before anything is drawn.
import { theme as makeTheme, svgRoot, el, g, textLines, measureText, measureNode, drawNode, arrowMarker, fmt } from '../runtime/figure.mjs';

const states = [ // main path in row 0; side states below the state they leave from
  { id: 'created', label: 'Created', col: 0, row: 0 },
  { id: 'authorised', label: 'Authorised', col: 1, row: 0 },
  { id: 'captured', label: 'Captured', col: 2, row: 0 },
  { id: 'settled', label: 'Settled', col: 3, row: 0 },
  { id: 'refunded', label: 'Refunded', col: 4, row: 0 },
  { id: 'voided', label: 'Voided', col: 1, row: 1 },
];
const allowed = [
  { from: 'created', to: 'authorised', event: 'approve' }, { from: 'authorised', to: 'captured', event: 'capture' },
  { from: 'captured', to: 'settled', event: 'settle' }, { from: 'settled', to: 'refunded', event: 'refund' },
  { from: 'authorised', to: 'voided', event: 'void' },
];
const forbidden = [ // drawn and marked, so nobody "adds" them while tidying the diagram
  { from: 'settled', to: 'authorised', label: 're-authorise' },
  { from: 'voided', to: 'captured', label: 'capture after void' },
];
const history = [ // payment pay_7Q2KX (illustrative); amounts in euros
  { state: 'created', id: 'pay_7Q2KX', currency: 'EUR' },
  { state: 'authorised', id: 'pay_7Q2KX', currency: 'EUR', authorised: 120 },
  { state: 'captured', id: 'pay_7Q2KX', currency: 'EUR', authorised: 120, captured: 120 },
  { state: 'settled', id: 'pay_7Q2KX', currency: 'EUR', authorised: 120, captured: 120 },
  { state: 'refunded', id: 'pay_7Q2KX', currency: 'EUR', authorised: 120, captured: 120, refunded: 45 },
];
const fields = [ // fixed: once set, never changes
  { key: 'id', label: 'payment_id', fixed: true }, { key: 'currency', label: 'currency', fixed: true },
  { key: 'authorised', label: 'authorised', fixed: true, money: true }, { key: 'captured', label: 'captured', money: true },
  { key: 'refunded', label: 'refunded', money: true },
];
// Check the contract: every step is an allowed move; fixed fields never change once set; amounts nest.
history.forEach((h, i) => {
  if (i && !allowed.some(a => a.from === history[i - 1].state && a.to === h.state)) throw Error(`state-contract: ${history[i - 1].state} → ${h.state} is not allowed`);
  for (const f of fields.filter(f => f.fixed)) if (i && history[i - 1][f.key] !== undefined && h[f.key] !== history[i - 1][f.key]) throw Error(`state-contract: ${f.key} changed`);
  if ((h.captured ?? 0) > (h.authorised ?? Infinity) || (h.refunded ?? 0) > (h.captured ?? 0)) throw Error('state-contract: amounts out of order');
});
const changes = history.length - 1;
const eur = v => fmt(v, { digits: 2, prefix: '€' });
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];

export function figure(theme = 'css') {
  const t = makeTheme(theme), id = 'state-contract-fig', W = 1152, H = 444, size = 18, ctx = { t, size };
  const left = 112, colW = (W - left) / 5, cx = c => left + (c + 0.5) * colW, rowY = [104, 196], boxW = 130;
  const nodes = Object.fromEntries(states.map(s => {
    const m = measureNode({ label: s.label }, { size, maxWidth: 150, minWidth: boxW });
    return [s.id, { ...m, w: boxW, x: cx(s.col) - boxW / 2, y: rowY[s.row] - m.h / 2, fill: t.c('paper') }];
  }));
  const parts = [];
  // record table: one column per state the payment passed through, aligned under that state
  const tableTop = 262, rowH = 34;
  history.forEach(h => { const x = cx(states.find(s => s.id === h.state).col); parts.push(el('line', { x1: x, x2: x, y1: rowY[0] + 30, y2: tableTop + fields.length * rowH, stroke: t.c('rule'), 'stroke-width': 1, 'stroke-dasharray': '2 4' })); });
  fields.forEach((f, r) => {
    const y = tableTop + r * rowH + rowH / 2;
    parts.push(textLines([f.label], { x: 0, y, size: 16, valign: 'middle', fill: f.fixed ? t.c('ink') : t.c('muted'), weight: 600, family: t.font('mono') }));
    // runs of equal values become one bar; a fixed field is one bar from the state that set it
    let start = null;
    history.forEach((h, i) => {
      const v = h[f.key], next = history[i + 1]?.[f.key];
      if (v === undefined) return;
      if (start === null) start = i;
      if (next !== v) {
        const c0 = states.find(s => s.id === history[start].state).col, c1 = states.find(s => s.id === h.state).col;
        const x0 = cx(c0) - colW / 2 + 6, x1 = cx(c1) + colW / 2 - 6, text = f.money ? eur(v) : String(v);
        parts.push(el('rect', { x: x0, y: y - 12, width: x1 - x0, height: 24, rx: 12, fill: f.fixed ? t.c('accent') : t.c('surface'), stroke: f.fixed ? null : t.c('rule') }),
          textLines([text], { x: x0 + 14, y, size: 16, valign: 'middle', fill: f.fixed ? t.c('onAccent') : t.c('ink'), weight: 650, family: f.money ? null : t.font('mono'), attrs: { 'font-variant-numeric': 'tabular-nums' } }));
        start = null;
      }
    });
  });
  // allowed moves
  for (const a of allowed) {
    const A = nodes[a.from], B = nodes[a.to];
    if (A.y === B.y) {
      const y = A.y + A.h / 2;
      parts.push(el('line', { x1: A.x + A.w, x2: B.x - 4, y1: y, y2: y, stroke: t.c('ink'), 'stroke-width': 2, 'marker-end': `url(#${id}-arr)` }),
        textLines([a.event], { x: (A.x + A.w + B.x) / 2, y: y - 9, size: 16, anchor: 'middle', valign: 'bottom', fill: t.c('ink'), weight: 600 }));
    } else {
      const x = A.x + A.w / 2;
      parts.push(el('line', { x1: x, x2: x, y1: A.y + A.h, y2: B.y - 4, stroke: t.c('ink'), 'stroke-width': 2, 'marker-end': `url(#${id}-arr)` }),
        textLines([a.event], { x: x + 10, y: (A.y + A.h + B.y) / 2, size: 16, valign: 'middle', fill: t.c('ink'), weight: 600 }));
    }
  }
  // forbidden moves: dashed, crossed out, labelled
  const cross = (x, y) => el('path', { d: `M${x - 7} ${y - 7}L${x + 7} ${y + 7}M${x + 7} ${y - 7}L${x - 7} ${y + 7}`, stroke: t.c('negative'), 'stroke-width': 2.6, 'stroke-linecap': 'round' });
  for (const f of forbidden) {
    const A = nodes[f.from], B = nodes[f.to];
    let d, mx, my, lab;
    if (A.y === B.y) { // arc over the main row
      const x0 = A.x + A.w / 2, x1 = B.x + B.w / 2, top = 22;
      d = `M${x0} ${A.y}C${x0} ${top} ${x1} ${top} ${x1} ${B.y - 4}`; mx = (x0 + x1) / 2; my = top + (A.y - top) * 0.25;
      lab = textLines([`${f.label}: not allowed`], { x: mx + 14, y: my - 10, size: 16, valign: 'bottom', fill: t.c('negative'), weight: 600 });
    } else { // out of the side state, up into the target's underside
      const x1 = B.x + B.w / 2, y0 = A.y + A.h / 2;
      d = `M${A.x + A.w} ${y0}H${x1}V${B.y + B.h + 4}`; mx = (A.x + A.w + x1) / 2; my = y0;
      lab = textLines([`${f.label}: not allowed`], { x: x1 + 14, y: y0, size: 16, valign: 'middle', fill: t.c('negative'), weight: 600 });
    }
    parts.push(el('path', { d, fill: 'none', stroke: t.c('negative'), 'stroke-width': 1.6, 'stroke-dasharray': '6 5', 'marker-end': `url(#${id}-no)` }), cross(mx, my), lab);
  }
  parts.push(Object.values(nodes).map(nd => drawNode(nd, ctx)));
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Card payment states with allowed and forbidden moves, and one payment\'s record',
    desc: `Six states. Solid arrows are the only allowed moves (${allowed.map(a => `${a.from} to ${a.to} on ${a.event}`).join(', ')}); dashed arrows marked with a cross are explicitly forbidden (${forbidden.map(f => f.label).join(', ')}). Below, payment ${history[0].id} is shown at each state it passed through: its payment_id, currency and authorised amount stay the same through ${changes} changes of state; captured never exceeds authorised and refunded (${eur(history.at(-1).refunded)}) never exceeds captured.` },
  el('defs', {}, arrowMarker(`${id}-arr`, t.c('ink'), { size: 12 }), arrowMarker(`${id}-no`, t.c('negative'), { size: 11 })), parts);
}

export default {
  study: true,
  id: 'state-contract',
  title: 'State contract: allowed moves and a persistent identity',
  className: 'st cs-tech-conference-light',
  notes: 'Purpose: Pair a finite-state view with the rule that no transition redefines identity, and show both on one real record.\nModify: Edit `states`, `allowed`, `forbidden`, `fields` (mark fixed ones) and `history`. The checks throw if the history takes a move that is not allowed, a fixed field changes, or amounts stop nesting; bars and the headline recompute.\nInvariant: Forbidden moves stay drawn and marked, never silently absent or silently added; fixed fields are one unbroken bar from the state that set them; captured ≤ authorised and refunded ≤ captured.\nStatic: Already static. For a build, show the states, then the forbidden moves, then the record.',
  sources: [{ type: 'original-example', file: 'assets/svg/state-contract.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">${words[changes][0].toUpperCase() + words[changes].slice(1)} changes of state, one identity: the payment’s ID, currency and authorised amount never moved</h1>
<p class="st-dek">Crossed-out arrows are forbidden moves. Each bar runs while its value holds.</p>
<figure class="st-fig" style="top:214px" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative record · payment ${history[0].id}, amounts in euros</span><span>State diagram with invariant record</span></p>`,
};
