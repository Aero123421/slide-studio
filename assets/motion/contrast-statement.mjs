// Motion study · Contrast two statements — two plans that sound alike start stacked, move
// apart into their own columns, and only then show what separates them: which bridges, and
// how much traffic they carry. Builds: 1 separate, 2 the distinction.
import { svgRoot, el, g, textLines, theme as makeTheme, fmt, statesAttr } from '../runtime/figure.mjs';

// The 40 road bridges rated poor (illustrative county network): daily vehicle crossings and
// condition index (1 = worst, 4 = fair).
const bridges = [[1800, 3.4], [1800, 3.8], [4700, 1.1], [600, 2.4], [19700, 3.7], [3400, 1.3], [2700, 2.6], [6200, 2.7], [10500, 1.8], [5700, 3.7],
  [5700, 3.4], [3100, 1.4], [3800, 1.0], [3900, 3.6], [6400, 3.9], [10300, 3.6], [3000, 2.6], [57000, 3.0], [10200, 3.1], [47500, 3.9],
  [10200, 2.1], [3300, 1.5], [6700, 1.9], [7200, 2.8], [22700, 2.0], [5600, 1.9], [8600, 1.9], [2000, 2.4], [5000, 3.9], [4000, 1.1],
  [5400, 1.1], [900, 3.4], [2400, 1.0], [13800, 1.1], [14700, 1.6], [46500, 3.3], [42200, 2.0], [2100, 2.1], [1100, 1.3], [4200, 3.2]]
  .map(([crossings, condition], i) => ({ id: i + 1, crossings, condition }));
const total = bridges.reduce((s, b) => s + b.crossings, 0);
const plans = [
  { key: 'A', criterion: 'worst‑rated', // non-breaking hyphen keeps the criterion on one line
    pick: [...bridges].sort((a, b) => a.condition - b.condition).slice(0, 20) },
  { key: 'B', criterion: 'busiest', pick: [...bridges].sort((a, b) => b.crossings - a.crossings).slice(0, 12), focus: true },
].map(p => ({ ...p, share: Math.round((p.pick.reduce((s, b) => s + b.crossings, 0) / total) * 100) }));
const [A, B] = plans;

// One bar per plan: every bridge is a block, width ∝ daily crossings, busiest on the left.
function bar(plan, theme = 'css') {
  const t = makeTheme(theme), W = 536, H = 180, bh = 100, ordered = [...bridges].sort((a, b) => b.crossings - a.crossings);
  const picked = new Set(plan.pick.map(b => b.id)), fill = plan.focus ? t.c('accent') : t.c('ink');
  let x = 0;
  const blocks = ordered.map(b => { const w = (b.crossings / total) * W, r = { x, w, on: picked.has(b.id) }; x += w; return r; });
  return svgRoot({ id: `motion-contrast-statement-${plan.key}`, width: W, height: H, theme: t,
    title: `Plan ${plan.key}: bridges repaired by 2028, each sized by daily crossings`,
    desc: `${plan.pick.length} of ${bridges.length} bridges, carrying ${plan.share}% of ${fmt(total)} daily crossings.` },
  blocks.map(b => el('rect', { x: b.x, y: 0, width: b.w, height: bh, fill: t.c('context'), stroke: t.c('paper'), 'stroke-width': 1 })),
  // Build 2: the plan's bridges fill in, busiest first.
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-stagger': 25, 'data-duration': 300 },
    blocks.filter(b => b.on).map(b => el('rect', { x: b.x, y: 0, width: b.w, height: bh, fill, stroke: t.c('paper'), 'stroke-width': 1 }))),
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-delay': 500 },
    textLines([`${plan.share}%`], { x: 0, y: bh + 16, size: 52, valign: 'top', fill: plan.focus ? t.c('accent') : t.c('ink'), weight: 700 }),
    textLines(['of daily crossings', `on ${plan.pick.length} of ${bridges.length} bridges`], { x: 124, y: bh + 20, size: 18, valign: 'top', fill: t.c('muted'), lineHeight: 1.35 })));
}

// Final column positions, and where each statement starts when the two are stacked.
const col = { A: { x: 64, y: 226 }, B: { x: 680, y: 226 } };
const stacked = { A: { x: 372, y: 246 }, B: { x: 372, y: 374 } };
const move = k => statesAttr({ 0: { translate: `${stacked[k].x - col[k].x}px ${stacked[k].y - col[k].y}px` }, 1: { translate: '0px 0px' } });
const statement = p => {
  const phrase = `${p.pick.length} ${p.criterion}`;
  // The criterion of the plan the headline names takes the accent with the distinction (build 2).
  return `Repair the ${p.focus ? `<em style="font-style:normal;color:var(--ss-ink)" data-states="${statesAttr({ 0: { color: 'var(--ss-ink)' }, 2: { color: 'var(--ss-accent)' } })}" data-duration="500">${phrase}</em>` : phrase} bridges by 2028`;
};
const block = p => `<div style="position:absolute;left:${col[p.key].x}px;top:${col[p.key].y}px;width:536px" data-states="${move(p.key)}" data-duration="900" data-easing="smooth">
  <p style="font:700 17px/1.2 var(--ss-font-sans);color:var(--ss-muted);margin:0 0 6px">Plan ${p.key}</p>
  <p style="font:600 32px/1.2 var(--ss-font-display);color:var(--ss-ink);margin:0;text-wrap:balance">${statement(p)}</p>
</div>
<figure style="position:absolute;left:${col[p.key].x}px;top:${col[p.key].y + 132}px;margin:0" data-step="1" data-motion="reveal" data-delay="850">${bar(p)}</figure>`;

export function figure(theme = 'css') { return bar(B, theme); }

export default {
  study: true,
  id: 'motion-contrast-statement',
  title: 'Contrast statement: separate, then distinguish',
  className: 'st cs-consulting-green',
  notes: 'Purpose: Two alternatives that sound alike are first read together, then separated into their own columns, and only then shown to differ, so the audience sees the distinction instead of being told it.\nModify: Replace `bridges` and the two `pick` rules; shares, counts and both bars recompute. The bar sizes every option by the same quantity (daily crossings), so the filled length is the share.\nInvariant: The statements are the same elements in both layouts (translate only); both bars use one ordering and one scale; only the plan the headline names takes the accent.\nStatic: The final build shows both plans side by side with their filled bars and shares.',
  sources: [{ type: 'original-example', file: 'assets/motion/contrast-statement.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">Repairing the <em>${B.pick.length} busiest</em> bridges protects ${B.share}% of daily crossings; the ${A.pick.length} worst-rated, ${A.share}%</h1>
${plans.map(block).join('\n')}
<p class="st-text st-muted" style="position:absolute;left:64px;top:572px;width:1152px" data-step="1" data-motion="reveal" data-delay="950">Each block is one of the ${bridges.length} bridges rated poor, sized by its daily crossings (${fmt(total)} in all), busiest on the left.</p>
<p class="st-source" data-region="source"><span>Illustrative data · county bridge inspections and traffic counts, 2025</span><span>Motion · separate the alternatives, then the distinction (2 builds)</span></p>`,
};
