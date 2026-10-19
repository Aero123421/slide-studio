// Diagram study · Diagonal lattice — two families of angled rules that read as structure, set beside a calm title field.
// The lattice is texture: its pitch, angle and edge come from `motif`; the cover text comes from `storeys`.
import { svgRoot, el, g, theme as makeTheme, mixHex, n, sum } from '../runtime/figure.mjs';

// Albion Yard: homes per storey on the retained car-park frame (illustrative).
const storeys = [
  { level: 1, homes: 38 }, { level: 2, homes: 38 }, { level: 3, homes: 36 },
  { level: 4, homes: 36 }, { level: 5, homes: 34 }, { level: 6, homes: 30 },
];
const homes = sum(storeys.map(s => s.homes));
const review = { body: 'planning committee', date: '3 February 2027', practice: 'Harlow & Venn Architects', client: 'Albion Yard Housing Trust' };

// Lattice: members at ±angle from horizontal, every `major`-th member heavier, joints at major crossings.
const W = 1280, H = 720;
const motif = { angle: 62, pitch: 40, major: 3, edgeTop: 1000, floor: 652, accentAt: [1010, 400] };   // accentAt: a point the accent diamond snaps to

const tone = (t, a, b, k) => (t.literal ? mixHex(t.hex(a), t.hex(b), k) : `color-mix(in srgb, ${t.c(a)}, ${t.c(b)} ${+(k * 100).toFixed(1)}%)`);

export function figure(theme = 'css') {
  const t = makeTheme(theme), { pitch, major, edgeTop } = motif;
  const c = 1 / Math.tan((motif.angle * Math.PI) / 180);      // horizontal run per unit of height
  // The field ends on a level line (`floor`) so the source line below it stays on plain paper.
  const yb = motif.floor, xb = edgeTop - yb * c;
  const field = `M${n(edgeTop)} 0H${W}V${n(yb)}H${n(xb)}Z`;
  // Member k of family A starts at x = edgeTop + k·pitch on the top edge and runs down-left; family B runs down-right.
  const ks = [];
  for (let k = -Math.ceil((W + H * c) / pitch); k <= Math.ceil((W + H * c) / pitch); k++) ks.push(k);
  const member = (k, dir) => {
    const x0 = edgeTop + k * pitch, isMajor = k % major === 0;
    return el('line', { x1: x0, y1: 0, x2: x0 + dir * H * c, y2: H,
      stroke: isMajor ? tone(t, 'paper', 'accent', 0.62) : tone(t, 'paper', 'accent', 0.3), 'stroke-width': isMajor ? 2.2 : 1 });
  };
  // Joints where two major members cross: x = (a + b)/2, y = (a − b)/(2c) for top-edge starts a (down-left) and b (down-right).
  const joints = [];
  for (const ka of ks) for (const kb of ks) {
    if (ka % major || kb % major) continue;
    const a = edgeTop + ka * pitch, b = edgeTop + kb * pitch, y = (a - b) / (2 * c), x = (a + b) / 2;
    if (y > 0 && y < yb - 6 && x < W && x > edgeTop - y * c + 6) joints.push([x, y]);
  }
  // The accent diamond: the major cell nearest to motif.accentAt (a, b = top-edge starts of its upper members).
  const P = major * pitch, [px, py] = motif.accentAt, snap = v => edgeTop + Math.round((v - edgeTop) / P) * P;
  const a0 = snap(px - P / 2 + c * py), b0 = snap(px - P / 2 - c * py);
  const corner = (a, b) => [(a + b) / 2, (a - b) / (2 * c)];
  const cell = [corner(a0, b0), corner(a0 + P, b0), corner(a0 + P, b0 + P), corner(a0, b0 + P)];
  return svgRoot({ id: 'diagonal-lattice-fig', width: W, height: H, theme: t,
    title: 'Diagonal lattice field with a slanted edge',
    desc: 'Two families of angled rules cross to form a diamond lattice on the right of the page, with heavier members every third rule, round joints where they cross and one diamond outlined in the accent colour. The lattice is texture, not a drawing of the building.' },
  el('defs', {}, el('clipPath', { id: 'diagonal-lattice-clip' }, el('path', { d: field }))),
  el('path', { d: field, fill: tone(t, 'paper', 'surface', 0.7) }),
  g({ 'clip-path': 'url(#diagonal-lattice-clip)' },
    ks.map(k => member(k, -1)), ks.map(k => member(k, 1)),
    joints.map(([x, y]) => el('circle', { cx: x, cy: y, r: 4, fill: t.c('paper'), stroke: tone(t, 'paper', 'accent', 0.75), 'stroke-width': 1.6 })),
    el('path', { d: `M${cell.map(p => `${n(p[0])} ${n(p[1])}`).join('L')}Z`, fill: 'none', stroke: t.c('accent'), 'stroke-width': 4, 'stroke-linejoin': 'round' })),
  el('path', { d: `M${n(edgeTop)} 0L${n(xb)} ${n(yb)}H${W}`, fill: 'none', stroke: tone(t, 'paper', 'accent', 0.62), 'stroke-width': 2.2 }));
}

export default {
  study: true,
  id: 'diagonal-lattice',
  title: 'Diagonal lattice: an angled structural texture for a cover',
  className: 'st st--full cs-blueprint',
  notes: 'Purpose: Give a cover an angled, structural texture that sets the subject (a timber-frame retrofit) without drawing the building.\nModify: Edit `storeys` and `review`; the home count in the headline recomputes. Change `motif.angle`, `pitch` and `major` for a steeper or looser lattice, and `edgeTop` to move the slanted edge.\nInvariant: The lattice never runs behind text; its left edge runs parallel to one family of members and it stops above the source line. It is texture, not a measured elevation. One accent: a single diamond.\nStatic: Already static. The art comes first in the markup so the text paints above it.',
  sources: [{ type: 'original-example', file: 'assets/svg/diagonal-lattice.mjs' }],
  exportPolicy: 'final',
  content: `<figure class="st-fig" data-region="decoration">${figure()}</figure>
<h1 class="st-head" style="top:150px;max-width:560px;font-size:60px;line-height:1.06">${homes} homes on the frame of a 1970s car park</h1>
<p class="st-dek" style="top:372px;max-width:520px">${review.client} keeps the car park's concrete frame and fills its ${storeys.length} decks with timber-framed flats.</p>
<p class="st-text st-muted" data-region="support" style="position:absolute;left:64px;top:548px;max-width:520px;font-size:18px"><strong style="color:var(--ss-ink)">Design review for the ${review.body}</strong><br>${review.practice}, ${review.date}</p>
<p class="st-source" data-region="source"><span>Illustrative data · fictional project; the lattice is decorative</span><span>Diagonal lattice</span></p>`,
};
