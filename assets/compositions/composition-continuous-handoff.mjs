// Composition study · Continuous handoff — one band carries the quantity from stage to stage.
// Its thickness is the mass that remains; each loss peels off downward and is named where it
// lands, and each state above the band hands its number to the next. Geometry comes from `steps`.
import { svgRoot, el, g, textLines, theme as makeTheme, fmt } from '../runtime/figure.mjs';

const ID = 'composition-continuous-handoff';
// Washed process at a smallholder cooperative's wet mill, per tonne of ripe cherries (illustrative).
const start = { state: 'Ripe cherries', kg: 1000 };
const steps = [ // each step removes `loss` kg and hands on the rest as `state`
  { state: 'Pulped', loss: 410, what: 'skin, pulp' },
  { state: 'Washed', loss: 150, what: 'mucilage' },
  { state: 'Dried', loss: 222, what: 'water' },
  { state: 'Green coffee', loss: 39, what: 'husk' },
  { state: 'Export grade', loss: 13, what: 'defects' },
  { state: 'Roasted', loss: 27, what: 'roast loss' },
];
const doseG = 18; // grams of roasted coffee in a double espresso

// derived values: every remaining mass is the previous one minus its loss
const masses = steps.reduce((acc, s) => [...acc, acc.at(-1) - s.loss], [start.kg]);
const roasted = masses.at(-1), green = masses[masses.length - 2];
const cups = Math.round((roasted * 1000) / doseG / 100) * 100;
const kg = v => `${fmt(v, { digits: 0 })} kg`;

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 960, H = 460;
  const top = 120, s = 0.18;           // band top edge; px per kg (1,000 kg → 180 px)
  const gx = i => 112 + i * 146;       // x of the step that turns state i into state i + 1
  const endX = gx(steps.length - 1) + 110, rIn = 40;
  const landY = top + start.kg * s + 64; // every loss lands on one line below the band
  const T = masses.map(m => m * s);
  // the band: flat top, its lower edge steps up at every loss
  let d = `M0 ${top}H${endX}V${top + T.at(-1)}`;
  for (let i = steps.length - 1; i >= 0; i--) d += `H${gx(i)}V${top + T[i]}`;
  d += 'H0Z';
  const parts = [el('path', { d, fill: t.c('ink') })];
  steps.forEach((st, i) => {
    const x = gx(i), w = st.loss * s, yIn = top + T[i], rOut = rIn + w; // inner edge = old lower edge
    // the loss turns down through a quarter circle and falls to its label
    parts.push(el('path', {
      d: `M${x} ${yIn - w}A${rOut} ${rOut} 0 0 1 ${x + rOut} ${yIn + rIn}V${landY}H${x + rIn}V${yIn + rIn}A${rIn} ${rIn} 0 0 0 ${x} ${yIn}Z`,
      fill: t.c('context'),
    }));
    parts.push(textLines([`−${kg(st.loss)}`], { x: x + rIn, y: landY + 12, size: 17, valign: 'top', fill: t.c('ink'), weight: 650, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
    parts.push(textLines([st.what], { x: x + rIn, y: landY + 36, size: 16, valign: 'top', fill: t.c('muted') }));
  });
  // states above the band: what is handed on, and how much
  const states = [start.state, ...steps.map(st => st.state)];
  states.forEach((name, i) => {
    const x = i === 0 ? 0 : gx(i - 1) + 10;
    parts.push(textLines([name], { x, y: top - 50, size: 16, valign: 'bottom', fill: t.c('muted') }));
    parts.push(textLines([kg(masses[i])], { x, y: top - 14, size: i === 0 || i === states.length - 1 ? 24 : 21, valign: 'bottom', fill: t.c('ink'), weight: 650, attrs: { 'font-variant-numeric': 'tabular-nums' } }));
  });
  return svgRoot({ id: `${ID}-fig`, width: W, height: H, theme: t,
    title: 'Mass balance from one tonne of ripe coffee cherries to roasted coffee',
    desc: `${states.map((n, i) => `${n} ${kg(masses[i])}`).join(', ')}. Losses: ${steps.map(st => `${st.what} ${kg(st.loss)}`).join(', ')}.` },
  parts);
}

export default {
  study: true,
  id: ID,
  title: 'Continuous handoff: one band carries the quantity through every stage',
  className: 'st cs-food-market cmp-handoff',
  notes: 'Purpose: Use for any process where a quantity is transformed step by step (a harvest to a product, applicants to hires, raw rows to a reported figure). The reader follows one continuous band instead of jumping between boxes; each state names what it hands on, each loss is named where it leaves, and every number can be traced back to the start.\nModify: Replace `start` and `steps` (state handed on, loss, what the loss is); the masses, band thickness, peel-offs and labels recompute, and the totals always reconcile. Keep five to seven steps; more becomes a table. Swap the photograph for the real end product or drop it.\nInvariant: Thickness is proportional to quantity on one scale; the band never breaks or changes scale; losses leave on the same side and are labelled where they land; the state label sits at the start of its segment so each number reads as handed on to the next.\nStatic: Already static. A build can grow the band left to right, one step per click.',
  sources: [{ type: 'original-example', file: `assets/compositions/${ID}.mjs` }, { type: 'image', file: 'assets/media/study-01.jpg', license: 'CC0' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head" data-region="title">A tonne of ripe cherries becomes ${kg(roasted)} of roasted coffee, about ${fmt(cups)} double espressos</h1>
<figure class="cmp-ho-fig" data-region="primary">${figure()}</figure>
<figure class="cmp-ho-cup" data-region="support"><img src="{{asset:assets/media/study-01.jpg}}" alt="A double espresso in a white cup, seen from directly above"><figcaption><b>≈ ${fmt(cups)} doubles</b><span>at ${doseG} g of roasted coffee each</span></figcaption></figure>
<p class="st-source" data-region="source"><span>Illustrative mass balance, washed process · photograph: espresso from above, CC0</span><span>Continuous handoff · single-band flow</span></p>`,
};
