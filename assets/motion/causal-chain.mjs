// Motion study · Build a causal argument — each premise arrives with the evidence that
// carries it; every link states what it rests on, and the qualified conclusion arrives
// only after its rival explanation. Builds: 1 audit premise, 2 outcome, 3 rival + conclusion.
import { svgRoot, el, g, textLines, wrapText, linear, arrowMarker, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const ward = 'Ward 4B';
const periods = ['Jan–Jun', 'Jul–Dec'];             // before and after the night float nurse started
const response = [6.1, 3.4];                        // median minutes to answer a night call bell, per period
const audit = { falls: 41, duringWait: 26 };        // falls reviewed 2024–25; how many began while a bell was unanswered
const falls = [{ n: 14, bedDays: 1520 }, { n: 9, bedDays: 1554 }]; // falls and occupied bed-days, per period
const rival = { what: 'Bed-exit alarms fitted', when: '8 July' };   // changed in the same month as staffing

// Premises in the order they are argued; `basis` is what the link INTO a claim rests on.
const chain = [
  { claim: 'Night call bells answered faster', kind: 'Measured', step: 0 },
  { claim: 'Fewer patients get up unaided', kind: 'Audit, 2024–25', basis: 'Inferred', step: 1 },
  { claim: 'Fewer falls on the ward', kind: 'Measured', basis: 'Inferred', step: 2 },
];

const rates = falls.map(p => (p.n / p.bedDays) * 1000);          // falls per 1,000 bed-days
const dropPct = Math.round(((rates[0] - rates[1]) / rates[0]) * 100);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, id = 'motion-causal-chain-fig';
  const colW = 300, gap = (W - colW * chain.length) / (chain.length - 1), colX = i => i * (colW + gap);
  const spineY = 74, evTop = 112;
  const reveal = s => (s ? { 'data-step': s, 'data-motion': 'reveal', 'data-duration': 600 } : {});
  const caption = (i, text, y) => textLines(wrapText(text, colW, 16), { x: colX(i), y, size: 16, valign: 'top', fill: t.c('muted'), lineHeight: 1.3 });
  const captionH = text => wrapText(text, colW, 16).length * 21;

  // A claim is a station on the causal spine: statement above, evidence below.
  const station = i => g({},
    textLines(wrapText(chain[i].claim, colW - 10, 21, { weight: 700 }), { x: colX(i), y: spineY - 22, size: 21, weight: 700, valign: 'bottom', fill: t.c('ink'), lineHeight: 1.22 }),
    el('circle', { cx: colX(i) + 8, cy: spineY, r: 8, fill: t.c('ink') }),
    textLines([chain[i].kind], { x: colX(i), y: evTop, size: 16, weight: 700, valign: 'top', fill: t.c('muted') }));

  // Before/after bars on a zero baseline; the same encoding for both measured premises.
  const pair = (i, values, max, unit, top) => {
    const x = linear([0, max], [colX(i) + 78, colX(i) + colW - 56]);
    return g({},
      values.map((v, k) => {
        const y = top + k * 50;
        return g({}, textLines([periods[k]], { x: colX(i), y: y + 17, size: 16, valign: 'middle', fill: t.c('muted') }),
          el('rect', { x: x(0), y, width: x(v) - x(0), height: 34, rx: 3, fill: k ? t.c('ink') : t.c('context') }),
          textLines([fmt(v, { digits: 1 })], { x: x(v) + 8, y: y + 17, size: 18, weight: 700, valign: 'middle', fill: k ? t.c('ink') : t.c('muted') }));
      }),
      el('line', { x1: x(0), x2: x(0), y1: top - 8, y2: top + 92, stroke: t.c('ink'), 'stroke-width': 1.4 }));
  };
  const top = evTop + 40;
  const p1Text = 'Median minutes to answer a night call bell';
  const p3Text = `Falls per 1,000 occupied bed-days, down ${dropPct}%`;

  // Audit: one dot per reviewed fall; filled = began while a bell was unanswered.
  const perRow = 14, pitch = 20.5, dotsH = Math.ceil(audit.falls / perRow) * pitch;
  const dots = Array.from({ length: audit.falls }, (_, k) => {
    const cx = colX(1) + 8 + (k % perRow) * pitch, cy = top + 8 + Math.floor(k / perRow) * pitch;
    return k < audit.duringWait ? el('circle', { cx, cy, r: 7.5, fill: t.c('ink') })
      : el('circle', { cx, cy, r: 6.6, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.5 });
  });
  const p2Text = `${audit.duringWait} of ${audit.falls} falls began while a call bell was still unanswered`;

  // A link only says "this is argued"; its label says what it rests on.
  const link = i => g({},
    g({ 'data-step': chain[i].step, 'data-motion': 'draw', 'data-duration': 700 },
      el('path', { d: `M${colX(i - 1) + 24} ${spineY}H${colX(i) - 10}`, stroke: t.c('muted'), 'stroke-width': 2, 'stroke-dasharray': '7 6', fill: 'none', 'marker-end': `url(#${id}-arr)` })),
    g({ 'data-step': chain[i].step, 'data-motion': 'reveal', 'data-delay': 500 },
      el('rect', { x: (colX(i - 1) + 24 + colX(i) - 10) / 2 - 46, y: spineY - 13, width: 92, height: 26, fill: t.c('paper') }),
      textLines([chain[i].basis], { x: (colX(i - 1) + 24 + colX(i) - 10) / 2, y: spineY, size: 16, anchor: 'middle', valign: 'middle', fill: t.c('muted'), weight: 600 })));

  const p3End = top + 112 + captionH(p3Text);
  const rivalH = 76, rivalY = H - rivalH - 4, rivalX = colX(2);
  const conclusion = wrapText(`Falls fell ${dropPct}%, but ${rival.what.toLowerCase()} on ${rival.when} — the same month — could explain the drop too. The data cannot say how much each did.`, colX(2) - gap, 18);
  return svgRoot({ id, width: W, height: H, theme: t,
    title: `Causal argument for the drop in falls on ${ward}`,
    desc: `Three premises in order: night call bells were answered faster (median ${response[0]} to ${response[1]} minutes); an audit found ${audit.duringWait} of ${audit.falls} falls began while a bell was unanswered; falls fell from ${fmt(rates[0], { digits: 1 })} to ${fmt(rates[1], { digits: 1 })} per 1,000 bed-days. Both links are inferred, and ${rival.what.toLowerCase()} in the same month is a rival explanation, so the conclusion is qualified.` },
  el('defs', {}, arrowMarker(`${id}-arr`, t.c('muted')), arrowMarker(`${id}-arr-open`, t.c('muted'), { open: true })),
  g({}, station(0), pair(0, response, 8, 'min', top), caption(0, p1Text, top + 112)),
  link(1),
  g(reveal(chain[1].step), station(1), dots, caption(1, p2Text, top + dotsH + 14)),
  link(2),
  g(reveal(chain[2].step), station(2), pair(2, rates, 10, '', top), caption(2, p3Text, top + 112)),
  g({ 'data-step': 3, 'data-motion': 'reveal', 'data-duration': 600 },
    el('rect', { x: rivalX, y: rivalY, width: colW, height: rivalH, rx: 10, fill: 'none', stroke: t.c('muted'), 'stroke-width': 1.6, 'stroke-dasharray': '2 5', 'stroke-linecap': 'round' }),
    textLines(['Rival explanation'], { x: rivalX + 18, y: rivalY + 25, size: 16, weight: 700, valign: 'middle', fill: t.c('muted') }),
    textLines([`${rival.what}, ${rival.when}`], { x: rivalX + 18, y: rivalY + 51, size: 18, valign: 'middle', fill: t.c('ink') }),
    el('path', { d: `M${rivalX + colW / 2} ${rivalY - 6}V${p3End + 8}`, stroke: t.c('muted'), 'stroke-width': 1.8, 'stroke-dasharray': '2 5', 'stroke-linecap': 'round', fill: 'none', 'marker-end': `url(#${id}-arr-open)` })),
  g({ 'data-step': 3, 'data-motion': 'reveal', 'data-delay': 350, 'data-duration': 600 },
    textLines(['Conclusion: probably part of the cause'], { x: 0, y: rivalY, size: 23, weight: 700, valign: 'top', fill: t.c('accent') }),
    textLines(conclusion, { x: 0, y: rivalY + 38, size: 18, valign: 'top', fill: t.c('ink'), lineHeight: 1.35 })));
}

export default {
  study: true,
  id: 'motion-causal-chain',
  title: 'Build a causal argument',
  className: 'st cs-clinical-trial',
  notes: 'Purpose: Introduce premises before a qualified conclusion; arrows alone are not evidence.\nModify: Replace `response`, `audit`, `falls` and `rival` with your own premises; rates, the percentage drop and every label recompute. Keep each link\'s `basis` honest (measured, inferred, assumed).\nInvariant: Each premise appears with the evidence that carries it; every arrow states what it rests on; the conclusion is qualified and arrives after its rival explanation, never before the premises.\nStatic: The final build shows the whole argument (all premises, the rival and the conclusion). If a talk discusses each premise separately, export builds 0–2 as extra pages.',
  sources: [{ type: 'original-example', file: 'assets/motion/causal-chain.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Faster night call-bell answers probably explain part of ${ward}’s ${dropPct}% drop in falls</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · one ward, ${periods[0]} vs ${periods[1]}; fall audit 2024–25</span><span>Motion · argument built premise by premise (3 builds)</span></p>`,
};
