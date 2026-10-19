// Diagram study · Study design — question, protocol, observations and inference kept in separate columns.
// Only the shaded column is evidence: its dots, mean and interval are computed from `pairs`; the
// headline and the inference text quote the same numbers. Arrows give the order of reasoning.
import { svgRoot, el, g, textLines, wrapText, measureText, linear, theme as makeTheme, fmt, mean, sd, tQuantile, arrowMarker } from '../runtime/figure.mjs';

const question = 'Do reflective roof coatings keep top-floor classrooms cooler on hot afternoons?';
const terms = [
  { term: 'Unit', value: 'Top-floor classroom' },
  { term: 'Exposure', value: 'Reflective roof coating' },
  { term: 'Outcome', value: 'Air temperature, 13:00–16:00' },
];
const protocol = { days: 41, hotAbove: 30, months: 'Jun–Sep 2025', logEvery: 15 };
// Mean afternoon air temperature per room, °C, over the 41 hot school days (illustrative).
// coatedRoom: which room of the pair the coin toss chose for the coating (A = west, B = east).
const pairs = [
  { id: 'P01', coatedRoom: 'A', uncoated: 31.8, coated: 29.4 }, { id: 'P02', coatedRoom: 'B', uncoated: 32.4, coated: 31.3 },
  { id: 'P03', coatedRoom: 'B', uncoated: 31.2, coated: 29.3 }, { id: 'P04', coatedRoom: 'A', uncoated: 33.6, coated: 30.8 },
  { id: 'P05', coatedRoom: 'A', uncoated: 30.9, coated: 30.3 }, { id: 'P06', coatedRoom: 'B', uncoated: 32.0, coated: 30.3 },
  { id: 'P07', coatedRoom: 'A', uncoated: 32.7, coated: 30.5 }, { id: 'P08', coatedRoom: 'B', uncoated: 31.5, coated: 30.0 },
  { id: 'P09', coatedRoom: 'A', uncoated: 31.1, coated: 30.2 }, { id: 'P10', coatedRoom: 'A', uncoated: 33.0, coated: 30.4 },
  { id: 'P11', coatedRoom: 'B', uncoated: 32.2, coated: 30.8 }, { id: 'P12', coatedRoom: 'A', uncoated: 31.9, coated: 29.9 },
];
const notTested = ['Learning or attendance', 'Energy use', 'Winter heating', 'Other roof types'];

// Derived: paired differences (coated − uncoated), their mean and a t-based 95% interval.
const diffs = pairs.map(p => ({ id: p.id, d: +(p.coated - p.uncoated).toFixed(2) }));
const m = mean(diffs.map(x => x.d)), half = tQuantile(0.975, diffs.length - 1) * sd(diffs.map(x => x.d)) / Math.sqrt(diffs.length);
const ci = [m - half, m + half];
const cooler = diffs.filter(x => x.d < 0).length;
const f1 = v => fmt(v, { digits: 1 });

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'study-design-fig';
  const cols = { q: { x: 0, w: 206 }, p: { x: 246, w: 252 }, o: { x: 538, w: 384 }, i: { x: 962, w: 190 } };
  const headY = 18, bodyY = 64;
  const para = (text, x, y, w, size, o = {}) => textLines(wrapText(text, w, size, { weight: o.weight }), { x, y, size, valign: 'top', lineHeight: o.lh ?? 1.3, fill: o.fill ?? t.c('ink'), weight: o.weight });
  const linesOf = (text, w, size, weight) => wrapText(text, w, size, { weight }).length;

  // Header rail: the four stages, joined by arrows that mean "leads to", not "proves".
  const heads = [['q', 'Question'], ['p', 'Protocol'], ['o', 'Observations'], ['i', 'Inference']];
  const headX = k => cols[k].x + (k === 'o' ? 16 : 0);
  const header = heads.map(([k, label], n) => {
    const parts = [textLines([label], { x: headX(k), y: headY, size: 17, valign: 'middle', weight: 700, fill: k === 'o' ? t.c('ink') : t.c('muted') })];
    if (n < heads.length - 1) {
      const x0 = headX(k) + measureText(label, 17, { weight: 700 }) + 14, x1 = headX(heads[n + 1][0]) - 12;
      parts.push(el('line', { x1: x0, x2: x1, y1: headY, y2: headY, stroke: t.c('muted'), 'stroke-width': 1.5, 'marker-end': `url(#${id}-arr)` }));
    }
    return g({}, parts);
  });

  // Question column: the question, then the terms it fixes.
  const qc = cols.q, qLines = linesOf(question, qc.w, 22, 600);
  const qCol = g({},
    para(question, qc.x, bodyY, qc.w, 22, { weight: 600, lh: 1.27 }),
    terms.map((tm, k) => {
      const y = bodyY + qLines * 28 + 34 + k * 58;
      return g({}, textLines([tm.term], { x: qc.x, y, size: 15, valign: 'top', weight: 700, fill: t.c('muted') }),
        textLines([tm.value], { x: qc.x, y: y + 22, size: 17, valign: 'top', fill: t.c('ink') }));
    }));

  // Protocol column: the 12 pairs as dominoes (filled = coated room, chosen by coin toss), then timing.
  const pc = cols.p, dom = 13, dx0 = pc.x + 48, step = (pc.w - 48) / pairs.length, domY = bodyY + 64;
  const pCol = g({},
    textLines([`${pairs.length} pairs of rooms`], { x: pc.x, y: bodyY, size: 17, valign: 'top', weight: 700, fill: t.c('ink') }),
    textLines(['Same school, same orientation'], { x: pc.x, y: bodyY + 27, size: 16, valign: 'top', fill: t.c('muted') }),
    textLines(['West'], { x: pc.x, y: domY + dom / 2, size: 15, valign: 'middle', fill: t.c('muted') }),
    textLines(['East'], { x: pc.x, y: domY + dom * 1.5 + 4, size: 15, valign: 'middle', fill: t.c('muted') }),
    pairs.map((p, k) => {
      const x = dx0 + k * step + (step - dom) / 2;
      const box = (room, y) => el('rect', { x, y, width: dom, height: dom, rx: 2, fill: p.coatedRoom === room ? t.c('ink') : t.c('paper'), stroke: t.c('ink'), 'stroke-width': 1.5 });
      return g({}, box('A', domY), box('B', domY + dom + 4), el('line', { x1: x + dom / 2, x2: x + dom / 2, y1: domY + dom, y2: domY + dom + 4, stroke: t.c('ink'), 'stroke-width': 1.5 }));
    }),
    el('rect', { x: pc.x, y: domY + 46, width: 12, height: 12, rx: 2, fill: t.c('ink') }),
    textLines(['coated room, by coin toss'], { x: pc.x + 19, y: domY + 52, size: 15, valign: 'middle', fill: t.c('muted') }),
    [['Measure', `Logger every ${protocol.logEvery} min,\n13:00–16:00`],
      ['Days', `${protocol.days} school days ≥ ${protocol.hotAbove} °C,\n${protocol.months}`],
      ['Compare', 'Coated − uncoated,\nwithin each pair']].map(([term, text], k) => {
      const y = bodyY + 158 + k * 70;
      return g({}, textLines([term], { x: pc.x, y, size: 15, valign: 'top', weight: 700, fill: t.c('muted') }), para(text, pc.x, y + 21, pc.w, 16));
    }));

  // Observations column (the evidence): one dot per pair, then the mean with its interval.
  const oc = cols.o, panelTop = 40, panelBottom = 446;
  const x = linear([-3, 1], [oc.x + 60, oc.x + oc.w - 20]);
  const rows = [...diffs].sort((a, b) => a.d - b.d), rowY = k => panelTop + 56 + k * 22;
  const meanY = rowY(rows.length) + 12, axisY = meanY + 22;
  const oCol = g({},
    el('rect', { x: oc.x, y: panelTop, width: oc.w, height: panelBottom - panelTop, rx: 10, fill: t.c('surface') }),
    textLines(['Coated − uncoated, °C'], { x: oc.x + 16, y: panelTop + 18, size: 15, valign: 'top', fill: t.c('muted') }),
    textLines([`${cooler} of ${pairs.length} pairs cooler`], { x: oc.x + oc.w - 16, y: panelTop + 18, size: 15, anchor: 'end', valign: 'top', weight: 700, fill: t.c('ink') }),
    [-3, -2, -1, 0, 1].map(v => g({}, el('line', { x1: x(v), x2: x(v), y1: rowY(0) - 12, y2: meanY + 12, stroke: v === 0 ? t.c('ink') : t.c('grid'), 'stroke-width': v === 0 ? 1.5 : 1 }),
      textLines([v === 0 ? '0' : fmt(v, { sign: true })], { x: x(v), y: axisY, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') }))),
    rows.map((r, k) => g({},
      textLines([r.id], { x: oc.x + 16, y: rowY(k), size: 15, valign: 'middle', fill: t.c('muted') }),
      el('line', { x1: x(0), x2: x(r.d), y1: rowY(k), y2: rowY(k), stroke: t.c('context'), 'stroke-width': 1.5 }),
      el('circle', { cx: x(r.d), cy: rowY(k), r: 5, fill: t.c('ink') }))),
    el('line', { x1: x(ci[0]), x2: x(ci[1]), y1: meanY, y2: meanY, stroke: t.c('accent'), 'stroke-width': 3, 'stroke-linecap': 'round' }),
    el('path', { d: `M${x(m)} ${meanY - 8}l8 8l-8 8l-8 -8z`, fill: t.c('accent') }),
    textLines(['Mean'], { x: oc.x + 16, y: meanY, size: 15, valign: 'middle', weight: 700, fill: t.c('accent') }),
    textLines([`${f1(Math.abs(m))} °C cooler on average (95% CI ${f1(Math.abs(ci[1]))} to ${f1(Math.abs(ci[0]))})`], { x: oc.x + 16, y: panelBottom - 16, size: 16, valign: 'bottom', fill: t.c('accent'), weight: 700 }));

  // Inference column: what the evidence supports, and what this design cannot say.
  const ic = cols.i;
  const claim = `Coating lowers hot-afternoon classroom air temperature by about ${fmt(Math.abs(m), { digits: 1 })} °C in this climate.`;
  const claimLines = linesOf(claim, ic.w, 17);
  const iCol = g({},
    textLines(['Supported'], { x: ic.x, y: bodyY, size: 15, valign: 'top', weight: 700, fill: t.c('muted') }),
    para(claim, ic.x, bodyY + 22, ic.w, 17),
    textLines(['Not tested here'], { x: ic.x, y: bodyY + 22 + claimLines * 22 + 30, size: 15, valign: 'top', weight: 700, fill: t.c('muted') }),
    notTested.map((s, k) => textLines([s], { x: ic.x, y: bodyY + 22 + claimLines * 22 + 56 + k * 25, size: 16, valign: 'top', fill: t.c('muted') })));

  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'Study design: question, protocol, observations and inference for a cool-roof classroom study',
    desc: `Four columns. Question: do reflective roof coatings keep top-floor classrooms cooler? Protocol: ${pairs.length} room pairs, coating assigned by coin toss within each pair, ${protocol.days} hot school days. Observations: in ${cooler} of ${pairs.length} pairs the coated room was cooler; mean difference ${f1(m)} °C (95% CI ${f1(ci[0])} to ${f1(ci[1])}). Inference: a claim about air temperature only; learning, energy use and winter heating were not tested. Arrows show the order of reasoning, not evidence.` },
  el('defs', {}, arrowMarker(`${id}-arr`, t.c('muted'))),
  header, qCol, pCol, oCol, iCol,
  textLines(['Arrows give the order of reasoning, not evidence; only the shaded column was measured.'], { x: 0, y: H - 4, size: 15, valign: 'bottom', fill: t.c('muted') }));
}

export default {
  study: true,
  id: 'study-design',
  title: 'Study design: question, protocol, evidence, inference',
  className: 'st cs-civic-calm',
  notes: 'Purpose: Keep the question, the protocol, the observations and the inference visibly separate, so an audience can see which part is evidence and how far the claim reaches.\nModify: Replace `question`, `terms`, `protocol`, `pairs` and `notTested`. The dots, the mean, its t-interval, the headline and the claim recompute from `pairs`.\nInvariant: Observation, method and inference stay in separate columns; only the observation column carries data; arrows mean "leads to", never "proves"; the inference states what was not tested.\nStatic: Already static. For a talk, build the columns left to right with data-step on each column group.',
  sources: [{ type: 'original-example', file: 'assets/svg/study-design.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Coated roofs kept classrooms <em>${f1(Math.abs(m))} °C cooler</em> on hot afternoons <span class="st-quiet">— learning was not measured</span></h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · ${pairs.length} matched classroom pairs, ${protocol.days} school days ≥ ${protocol.hotAbove} °C</span><span>Study design diagram</span></p>`,
};
