// Diagram study · Claim–evidence chain — observation, interpretation and next test kept apart.
// The observation is exact and drawn from data (accuracy per bucket, before and after); the
// interpretation is worded as uncertain; the test states what result would settle it. Overall
// accuracy, the drop, the share of the drop and the headline are computed from `buckets`.
import { theme as makeTheme, svgRoot, el, g, textLines, wrapText, linear, arrowMarker, fmt } from '../runtime/figure.mjs';

const buckets = [ // held-out questions grouped by the longest number they contain (illustrative eval run)
  { label: 'No numbers', phrase: 'questions without numbers', n: 1210, before: 0.861, after: 0.857 },
  { label: '1–5 digits', phrase: 'questions with numbers up to 5 digits', n: 578, before: 0.823, after: 0.809 },
  { label: '6+ digits', phrase: 'questions containing 6+ digit numbers', n: 612, before: 0.758, after: 0.564 },
];
const total = buckets.reduce((s, b) => s + b.n, 0);
const overall = key => buckets.reduce((s, b) => s + b.n * b[key], 0) / total;
const drop = (overall('before') - overall('after')) * 100; // percentage points
const focus = [...buckets].sort((a, b) => b.n * (b.before - b.after) - a.n * (a.before - a.after))[0];
const share = (focus.n * (focus.before - focus.after)) / (total * (overall('before') - overall('after')));
const pts = v => fmt(v * 100, { digits: 1 });

export function figure(theme = 'css') {
  const t = makeTheme(theme), id = 'claim-evidence-chain-fig', W = 1152, H = 482;
  const parts = [];
  const head = (x, title, note) => [textLines([title], { x, y: 4, size: 20, valign: 'top', fill: t.c('ink'), weight: 700 }), textLines([note], { x, y: 32, size: 16, valign: 'top', fill: t.c('muted') })];
  const para = (x, y, w, lead, text, { size = 18, leadFill = t.c('ink') } = {}) => {
    const lines = wrapText(text, w, size);
    return [textLines([lead], { x, y, size, valign: 'top', fill: leadFill, weight: 700 }), textLines(lines, { x, y: y + size * 1.4, size, valign: 'top', fill: t.c('ink'), lineHeight: 1.38 })];
  };
  // ---- observation: accuracy per bucket, before → after, one shared axis
  const ox = 0, ow = 452, labelW = 118, x = linear([0.5, 0.9], [ox + labelW + 16, ox + ow - 10]);
  parts.push(head(ox, 'Observation', `measured on ${fmt(total)} held-out questions`));
  const rowY = i => 150 + i * 112;
  for (const v of [0.5, 0.6, 0.7, 0.8, 0.9]) parts.push(el('line', { x1: x(v), x2: x(v), y1: 92, y2: rowY(buckets.length - 1) + 40, stroke: t.c('grid') }),
    textLines([`${fmt(v * 100)}%`], { x: x(v), y: rowY(buckets.length - 1) + 48, size: 15, anchor: 'middle', valign: 'top', fill: t.c('muted') }));
  buckets.forEach((b, i) => {
    const y = rowY(i), em = b === focus, c = em ? t.c('accent') : t.c('ink');
    parts.push(textLines([b.label], { x: ox, y: y - 9, size: 18, valign: 'middle', fill: c, weight: 700 }),
      textLines([`n = ${fmt(b.n)}`], { x: ox, y: y + 14, size: 15, valign: 'middle', fill: t.c('muted') }),
      el('line', { x1: x(b.after), x2: x(b.before), y1: y, y2: y, stroke: em ? t.c('accent') : t.c('muted'), 'stroke-width': em ? 4 : 2.5 }),
      el('circle', { cx: x(b.before), cy: y, r: 7, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 2.2 }),
      el('circle', { cx: x(b.after), cy: y, r: 8, fill: c }),
      textLines([`${pts(b.after)}`], { x: x(b.after) - 14, y: y - 18, size: 16, anchor: 'end', valign: 'middle', fill: c, weight: 700 }),
      textLines([`${pts(b.before)}`], { x: x(b.before) + 12, y: y - 18, size: 16, valign: 'middle', fill: t.c('muted') }));
  });
  parts.push(el('circle', { cx: ox + labelW + 22, cy: 82, r: 6, fill: t.c('paper'), stroke: t.c('ink'), 'stroke-width': 2 }),
    textLines(['old tokenizer'], { x: ox + labelW + 34, y: 82, size: 15, valign: 'middle', fill: t.c('muted') }),
    el('circle', { cx: ox + labelW + 160, cy: 82, r: 6, fill: t.c('ink') }),
    textLines(['new'], { x: ox + labelW + 172, y: 82, size: 15, valign: 'middle', fill: t.c('muted') }));
  // ---- interpretation: hedged on purpose
  const ix = 552, iw = 262;
  parts.push(head(ix, 'Interpretation', 'not yet shown'),
    para(ix, 110, iw, 'Likely', 'The new tokenizer splits long numbers into more pieces, and the model copies digits wrongly.'),
    para(ix, 300, iw, 'Not ruled out', 'Number-heavy questions are longer and may be cut by the 4k context limit.', { leadFill: t.c('muted') }));
  // ---- next test: what result would decide it
  const tx = 896, tw = W - tx;
  parts.push(head(tx, 'Next test', 'one run, nothing else changed'),
    textLines(wrapText(`Re-score the ${fmt(focus.n)} ${focus.phrase}, using the old tokenizer.`, tw, 18), { x: tx, y: 110, size: 18, valign: 'top', fill: t.c('ink'), lineHeight: 1.38 }),
    para(tx, 278, tw, 'Gap under 2 points', 'The tokenizer explains it.'),
    para(tx, 378, tw, 'Gap stays', 'Test truncation next.'));
  // ---- the chain: what each step does to the next
  const arrow = (x0, x1, label) => g({}, el('line', { x1: x0, x2: x1, y1: 232, y2: 232, stroke: t.c('ink'), 'stroke-width': 2, 'marker-end': `url(#${id}-arr)` }),
    textLines([label], { x: (x0 + x1) / 2, y: 222, size: 16, anchor: 'middle', valign: 'bottom', fill: t.c('muted'), weight: 600 }));
  parts.push(arrow(ow + 18, ix - 22, 'suggests'), arrow(ix + iw + 16, tx - 22, 'tested by'));
  return svgRoot({ id, width: W, height: H, theme: t,
    title: 'From observation to interpretation to the next test, for an accuracy drop after a tokenizer change',
    desc: `Observation: overall accuracy fell from ${pts(overall('before'))}% to ${pts(overall('after'))}% (${fmt(drop, { digits: 1 })} points) on ${fmt(total)} held-out questions. ${buckets.map(b => `${b.label}: ${pts(b.before)}% to ${pts(b.after)}% (n = ${fmt(b.n)})`).join('; ')}. ${focus.label} questions account for ${Math.round(share * 100)}% of the drop. Interpretation, not yet shown: the new tokenizer splits long numbers; truncation is not ruled out. Next test: re-score those questions with the old tokenizer; a gap under 2 points would attribute the drop to the tokenizer. Arrows mean "suggests" and "is tested by".` },
  el('defs', {}, arrowMarker(`${id}-arr`, t.c('ink'), { size: 12 })), parts);
}

export default {
  study: true,
  id: 'claim-evidence-chain',
  title: 'Claim–evidence chain: observation, interpretation, test',
  className: 'st cs-ml-eval',
  notes: 'Purpose: Keep what was measured, what it might mean and how to find out as three distinct roles, connected in order.\nModify: Replace `buckets` with your measured breakdown; rewrite the interpretation (hedged) and the decision rule for your test. Overall accuracy, the drop, the bucket that carries it and the headline recompute.\nInvariant: The observation states exact numbers with n; the interpretation is worded as uncertain and lists what is not ruled out; the test names the result that would decide it; arrows mean "suggests" and "is tested by", never "proves".\nStatic: Already static. For a build, reveal observation, then interpretation, then the test.',
  sources: [{ type: 'original-example', file: 'assets/svg/claim-evidence-chain.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Questions with <em>${focus.label.toLowerCase()}</em> carry ${Math.round(share * 100)}% of the <span style="white-space:nowrap">${fmt(drop, { digits: 1 })}-point</span> accuracy drop. One re-run can tell us why</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative evaluation · same prompts and seed, old vs new tokenizer, accuracy in %</span><span>Claim–evidence chain</span></p>`,
};
