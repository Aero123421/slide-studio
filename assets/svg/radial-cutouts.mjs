// Diagram study · Radial cutouts — a coffered dome seen from below: equal sectors, stepped cutouts, one oculus.
// Rings shrink geometrically toward the centre and every ring has the same number of sectors, so the
// coffers diminish like a real dome. Sectors are equal by construction: this is not a pie chart.
import { svgRoot, el, g, theme as makeTheme, mixHex, arcPath, fmt, sum } from '../runtime/figure.mjs';

// Restoration funding by source, £ millions, and the reopening date (illustrative).
const funding = [
  { from: 'individual donors', amount: 1.9, donors: 4812 }, { from: 'the heritage fund', amount: 1.5 },
  { from: 'the city', amount: 0.8 }, { from: 'four charitable trusts', amount: 0.4 },
];
const target = 4.6, reopens = '2027-09-06';
const raised = sum(funding.map(f => f.amount));
if (Math.abs(raised - target) > 1e-9) throw Error(`Funding sources add to ${raised}, not the £${target}m target`);
const donors = funding[0];
const list = a => a.slice(0, -1).join(', ') + ' and ' + a.at(-1);
const date = new Date(`${reopens}T00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });

// Dome: oculus radius, outer radius, number of rings and sectors, rib width and coffer steps.
const W = 1280, H = 720;
const motif = { cx: 640, cy: 16, oculus: 62, R: 356, rings: 5, sectors: 28, rib: 7, steps: [0.16, 0.26, 0.38], cornice: 22 };

const tone = (t, a, b, k) => (t.literal ? mixHex(t.hex(a), t.hex(b), k) : `color-mix(in srgb, ${t.c(a)}, ${t.c(b)} ${+(k * 100).toFixed(1)}%)`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), { cx, cy, oculus, R, rings, sectors, rib } = motif;
  const inner = oculus + 26, q = (R / inner) ** (1 / rings);              // ring boundaries: inner · q^k
  const coffers = [];
  for (let k = 0; k < rings; k++) {
    const r0 = inner * q ** k, r1 = inner * q ** (k + 1);
    for (let i = 0; i < sectors; i++) {
      const a0 = (i / sectors) * 2 * Math.PI, a1 = ((i + 1) / sectors) * 2 * Math.PI;
      // Each step is the coffer outline inset again: the recess deepens toward its centre.
      motif.steps.forEach((shade, s) => {
        const inset = rib / 2 + s * (r1 - r0) * 0.12, ra = r0 + inset, rb = r1 - inset;
        const da = inset / ((ra + rb) / 2);
        if (rb - ra > 2 && a1 - a0 - 2 * da > 0.004) coffers.push(el('path', { d: arcPath(cx, cy, ra, rb, a0 + da, a1 - da), fill: tone(t, 'paper', 'ink', shade) }));
      });
    }
  }
  return svgRoot({ id: 'radial-cutouts-fig', width: W, height: H, theme: t,
    title: 'A coffered dome seen from below',
    desc: `${rings} rings of ${sectors} equal coffers, each recessed in ${motif.steps.length} steps, shrink toward an open oculus at the top of the page. The sectors are equal by construction and encode no data.` },
  el('defs', {}, el('clipPath', { id: 'radial-cutouts-clip' }, el('rect', { x: 0, y: 0, width: W, height: H }))),
  g({ 'clip-path': 'url(#radial-cutouts-clip)' },
    el('circle', { cx, cy, r: R + motif.cornice, fill: tone(t, 'paper', 'ink', 0.2) }),
    el('circle', { cx, cy, r: R, fill: tone(t, 'paper', 'ink', 0.07) }),
    coffers,
    el('circle', { cx, cy, r: inner - rib / 2, fill: tone(t, 'paper', 'ink', 0.2) }),
    el('circle', { cx, cy, r: oculus, fill: t.c('paper') })));
}

export default {
  study: true,
  id: 'radial-cutouts',
  title: 'Radial cutouts: a stable optical centre from equal sectors',
  className: 'st st--full cs-nonprofit-warm',
  notes: 'Purpose: Give a closing page a calm, centred motif — a coffered dome around an open oculus — that holds the eye without pretending to be a chart.\nModify: Replace `funding`, `target` and `reopens`; the donor count, the sources and the date recompute, and the page refuses to build if the sources do not add up to the target. Change `motif.rings`, `sectors`, `rib` and `steps` for a different dome; move `cx/cy` and `R` to recrop it.\nInvariant: Sectors are equal by construction — never resize them to show shares, and never attach percentages. The oculus is the optical centre; text stays below the dome.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/radial-cutouts.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="left:120px;right:120px;top:428px;max-width:none;text-align:center;font-size:44px;line-height:1.15">Thanks to ${fmt(donors.donors)} donors, the Reading Room reopens on ${date}</h1>
<p class="st-dek" style="left:160px;right:160px;top:548px;max-width:none;text-align:center;text-wrap:balance">Donors gave £${fmt(donors.amount, { digits: 1 })}m of the £${fmt(target, { digits: 1 })}m restoration; ${list(funding.slice(1).map(f => f.from))} gave the rest.</p>
<p class="st-source" data-region="source"><span>Illustrative data · fictional library trust; the dome is decorative</span><span>Radial cutouts</span></p>`,
};
