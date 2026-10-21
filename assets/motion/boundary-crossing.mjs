// Motion study · Cross a boundary — one patient record crosses from the hospital network into
// a research enclave. Rows that may cross move (and close ranks); coarsened values change as
// they pass the gateway; withheld rows stay behind. Builds: 1 crossing, 2 tally.
import { svgRoot, el, g, textLines, wrapText, measureText, theme as makeTheme } from '../runtime/figure.mjs';

// One admission record and the release rule for each field (illustrative protocol R-2291).
const record = [
  { field: 'Name', value: 'M. Lindqvist', rule: 'withhold' },
  { field: 'Hospital number', value: '40-2291-7', rule: 'withhold' },
  { field: 'Date of birth', value: '14 Mar 1957', rule: 'coarsen', out: '1957' },
  { field: 'Postcode', value: 'RL4 7QT', rule: 'coarsen', out: 'RL4' },
  { field: 'Phone', value: '07700 900412', rule: 'withhold' },
  { field: 'Admitted', value: '2 Feb 2026', rule: 'coarsen', out: 'Feb 2026' },
  { field: 'Diagnosis', value: 'J44.1 COPD', rule: 'keep' },
  { field: 'Length of stay', value: '6 days', rule: 'keep' },
  { field: 'Lowest SpO₂', value: '86%', rule: 'keep' },
  { field: 'Discharged to', value: 'Home', rule: 'keep' },
  { field: 'Consultant', value: 'Dr A. Haddad', rule: 'withhold' },
];
const crossing = record.filter(r => r.rule !== 'withhold');
const coarsened = record.filter(r => r.rule === 'coarsen');
const withheld = record.filter(r => r.rule === 'withhold');
const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'];

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'motion-boundary-crossing-fig';
  const gateX = 576, gateW = 92, cardW = 404, rowH = 31, top = 80;
  const leftX = 18, rightX = W - cardW - 18, fieldW = 168;
  const zones = g({},
    el('rect', { x: 0, y: 0, width: gateX - gateW / 2 - 10, height: H, rx: 14, fill: t.c('surface') }),
    el('rect', { x: gateX + gateW / 2 + 10, y: 0, width: W - gateX - gateW / 2 - 10, height: H, rx: 14, fill: 'none', stroke: t.c('rule'), 'stroke-width': 1.4 }),
    textLines(['Hospital network'], { x: leftX, y: 22, size: 19, weight: 700, valign: 'top', fill: t.c('ink') }),
    textLines(['identified'], { x: leftX, y: 48, size: 16, valign: 'top', fill: t.c('muted') }),
    textLines(['Research enclave'], { x: rightX, y: 22, size: 19, weight: 700, valign: 'top', fill: t.c('ink') }),
    textLines(['de-identified, no linkage back'], { x: rightX, y: 48, size: 16, valign: 'top', fill: t.c('muted') }));
  // The boundary itself: a gateway with its rule, drawn as the one strong vertical on the page.
  const gate = g({},
    el('line', { x1: gateX, x2: gateX, y1: 0, y2: H, stroke: t.c('ink'), 'stroke-width': 3 }),
    el('rect', { x: gateX - gateW / 2, y: H / 2 - 64, width: gateW, height: 128, rx: 10, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 2 }),
    textLines(['Release', 'gateway', 'R-2291'], { x: gateX, y: H / 2, size: 16, weight: 700, anchor: 'middle', valign: 'middle', fill: t.c('ink'), lineHeight: 1.3 }));

  // Rows: crossing rows translate to the enclave and close ranks; withheld rows stay and are struck.
  const row = (r, i) => {
    const y = top + i * rowH, j = crossing.indexOf(r), moves = j >= 0;
    const dx = rightX - leftX, dy = (j - i) * rowH;
    const value = (text, fill, weight, states) => g(states ? { 'data-states': states, 'data-duration': 600 } : {},
      textLines([text], { x: leftX + fieldW, y: y + rowH / 2, size: 17, weight, valign: 'middle', fill }));
    const body = [
      // A row that becomes first in the enclave drops its top rule as it arrives.
      i ? g(j === 0 ? { 'data-states': { 0: { opacity: 1 }, 1: { opacity: 0 } }, 'data-duration': 300 } : {}, el('line', { x1: leftX + 12, x2: leftX + cardW - 12, y1: y, y2: y, stroke: t.c('rule') })) : '',
      textLines([r.field], { x: leftX + 14, y: y + rowH / 2, size: 16, valign: 'middle', fill: t.c('muted') }),
      r.rule === 'coarsen'
        ? [value(r.value, t.c('ink'), 500, { 0: { opacity: 1 }, 1: { opacity: 0 } }), value(r.out, t.c('accent'), 700, { 0: { opacity: 0 }, 1: { opacity: 1 } })]
        : value(r.value, t.c('ink'), 500),
    ];
    if (moves) return g({ 'data-states': { 0: { translate: '0px 0px' }, 1: { translate: `${dx}px ${dy}px` } }, 'data-duration': 1000, 'data-easing': 'smooth' }, body);
    return g({}, g({ 'data-states': { 0: { opacity: 1 }, 1: { opacity: 0.45 } }, 'data-duration': 600 }, body),
      g({ 'data-step': 1, 'data-motion': 'wipe', 'data-delay': 500, 'data-duration': 400 },
        el('line', { x1: leftX + fieldW - 4, x2: leftX + fieldW + measureText(r.value, 17) + 4, y1: y + rowH / 2, y2: y + rowH / 2, stroke: t.c('ink'), 'stroke-width': 1.6 })));
  };
  const cardH = record.length * rowH + 12;
  const frames = g({},
    el('rect', { x: leftX, y: top - 6, width: cardW, height: cardH, rx: 10, fill: t.c('paper'), stroke: t.c('rule') }),
    g({ 'data-states': { 0: { opacity: 0 }, 1: { opacity: 1 } }, 'data-duration': 500 },
      el('rect', { x: rightX, y: top - 6, width: cardW, height: crossing.length * rowH + 12, rx: 10, fill: t.c('paper'), stroke: t.c('rule') })));
  // Tally, once the record has crossed.
  const tallyY = top + crossing.length * rowH + 44;
  const tally = g({ 'data-step': 2, 'data-motion': 'reveal' },
    textLines([`${crossing.length} of ${record.length} fields crossed`], { x: rightX, y: tallyY, size: 19, weight: 700, valign: 'top', fill: t.c('ink') }),
    textLines(wrapText(`${coarsened.length} coarsened at the gateway: ${coarsened.map(r => r.field.toLowerCase()).join(', ')}`, cardW, 17, { weight: 600 }), { x: rightX, y: tallyY + 32, size: 17, valign: 'top', fill: t.c('accent'), weight: 600, lineHeight: 1.3 }),
    textLines([`${withheld.length} withheld inside the hospital`], { x: leftX, y: top + cardH + 6, size: 17, valign: 'top', fill: t.c('muted'), weight: 600 }));
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'A patient record crossing the release gateway into a research enclave',
    desc: `Of ${record.length} fields, ${crossing.length} cross the gateway: ${crossing.filter(r => r.rule === 'keep').map(r => r.field).join(', ')} unchanged; ${coarsened.map(r => `${r.field} coarsened to ${r.out}`).join(', ')}. ${withheld.map(r => r.field).join(', ')} stay inside the hospital.` },
  zones, gate, frames, record.map(row), tally);
}

export default {
  study: true,
  id: 'motion-boundary-crossing',
  title: 'Cross a boundary',
  className: 'st cs-risk-audit',
  notes: 'Purpose: Make a scope change explicit: what crosses the boundary, in what form, and what stays behind.\nModify: Edit `record` (field, value, rule: keep | coarsen | withhold, and `out` for coarsened values). Row moves, the closing of ranks, the tally and the headline are computed.\nInvariant: The same rows move (no redrawn copy on the far side); coarsened values change only as they cross; withheld rows remain visible where they stayed, struck through.\nStatic: The final build shows both sides at once: what crossed, how it changed, and what was withheld.',
  sources: [{ type: 'original-example', file: 'assets/motion/boundary-crossing.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Only ${words[crossing.length] ?? crossing.length} of ${words[record.length] ?? record.length} fields leave the hospital, ${words[coarsened.length] ?? coarsened.length} of them <em>coarsened at the gateway</em></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative record and protocol · no real patient</span><span>Motion · rows cross a release boundary (2 builds)</span></p>`,
};
