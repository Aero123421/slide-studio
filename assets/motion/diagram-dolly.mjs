// Motion study · Approach the key node — the camera dollies from the whole order flow into
// the Payments stage, whose internal path is drawn at overview scale but only readable up
// close. The transform is computed from the target rectangle; the drawing never changes.
// Builds: 1 dolly in (labels for the inside arrive with it), 2 what the inside shows.
import { svgRoot, el, g, textLines, arrowMarker, theme as makeTheme, fmt, n } from '../runtime/figure.mjs';

// Order flow of an online shop, and the components inside Payments (illustrative, peak hour).
const stages = ['Storefront', 'Cart', 'Checkout', 'Payments', 'Fulfilment', 'Delivery'];
const key = 'Payments';
const perMinute = 1840; // payments attempted per minute at peak
const inside = [ // share of payments passing each component, running instances
  { id: 'tok', label: 'Tokenise', share: 1, instances: 3, col: 0, row: 0.5 },
  { id: 'fraud', label: 'Fraud check', share: 1, instances: 1, col: 1, row: 0.5 },
  { id: 'acqA', label: 'Acquirer A', share: 0.62, instances: 2, col: 2, row: 0 },
  { id: 'acqB', label: 'Acquirer B', share: 0.38, instances: 2, col: 2, row: 1 },
  { id: 'ledger', label: 'Ledger', share: 1, instances: 2, col: 3, row: 0.5 },
];
const links = [['tok', 'fraud'], ['fraud', 'acqA'], ['fraud', 'acqB'], ['acqA', 'ledger'], ['acqB', 'ledger']];
const single = inside.filter(c => c.share === 1 && c.instances === 1); // on every payment's path, no fallback

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, cy = 244, gap = 36, w = 132, h = 58, big = { w: 268, h: 196 };
  // Overview geometry: a row of stages; the key stage is larger and holds the internal path.
  let x = (W - (stages.length - 1) * w - big.w - (stages.length - 1) * gap) / 2;
  const box = Object.fromEntries(stages.map(s => { const b = s === key ? { x, y: cy - big.h / 2, ...big } : { x, y: cy - h / 2, w, h }; x += b.w + gap; return [s, b]; }));
  const K = box[key], cw = 46, ch = 26, colX = c => K.x + 22 + c * ((K.w - 44 - cw) / 3), rowY = r => K.y + 52 + r * 68;
  const part = Object.fromEntries(inside.map(c => [c.id, { x: colX(c.col), y: rowY(c.row), w: cw, h: ch }]));
  // Camera: fit the key stage (plus margin) into the frame, centred.
  const target = { x: K.x - 24, y: K.y - 20, w: K.w + 48, h: K.h + 40 };
  const k = Math.min(W / target.w, H / target.h), tx = W / 2 - k * (target.x + target.w / 2), ty = H / 2 - k * (target.y + target.h / 2);
  const cam = ([px, py]) => [k * px + tx, k * py + ty]; // where a point lands after the dolly
  const arrow = (x1, y1, x2, y2, c = t.c('muted')) => el('line', { x1, y1, x2, y2, stroke: c, 'stroke-width': 1.6, 'vector-effect': 'non-scaling-stroke', 'marker-end': `url(#motion-diagram-dolly-arr)` });
  const label = s => s === key ? null : textLines([s], { x: box[s].x + box[s].w / 2, y: cy, size: 18, anchor: 'middle', valign: 'middle', fill: t.c('ink'), weight: 600 });
  return svgRoot({ id: 'motion-diagram-dolly-fig', width: W, height: H, theme: t,
    title: 'Order flow of an online shop, then a close view of the components inside Payments',
    desc: `${stages.length} stages from ${stages[0].toLowerCase()} to ${stages.at(-1).toLowerCase()}. Inside ${key}, every payment passes ${inside.filter(c => c.share === 1).map(c => c.label).join(', ')}; ${single.map(c => c.label).join(', ')} runs as a single instance.` },
  el('defs', {}, arrowMarker('motion-diagram-dolly-arr', t.c('muted'), { size: 9 }), el('clipPath', { id: 'motion-diagram-dolly-frame' }, el('rect', { x: 0, y: 0, width: W, height: H }))),
  g({ 'clip-path': 'url(#motion-diagram-dolly-frame)' },
    g({ 'data-states': { 0: { transform: 'matrix(1,0,0,1,0,0)' }, 1: { transform: `matrix(${n(k)},0,0,${n(k)},${n(tx)},${n(ty)})` } }, 'data-duration': 1200, 'data-easing': 'smooth', style: 'transform-box:view-box;transform-origin:0 0' },
      stages.slice(0, -1).map((s, i) => arrow(box[s].x + box[s].w + 2, cy, box[stages[i + 1]].x - 4, cy)),
      stages.map(s => el('rect', { x: box[s].x, y: box[s].y, width: box[s].w, height: box[s].h, rx: s === key ? 14 : 10, fill: s === key ? t.c('paper') : t.c('surface'), stroke: s === key ? t.c('ink') : t.c('rule'), 'stroke-width': s === key ? 2 : 1.4, 'vector-effect': 'non-scaling-stroke' })),
      // Neighbours keep their boxes and arrows during the dolly; their names step back.
      g({ 'data-states': { 0: { opacity: 1 }, 1: { opacity: 0 } }, 'data-duration': 400 }, stages.map(label)),
      textLines([key], { x: K.x + 18, y: K.y + 30, size: 18, fill: t.c('ink'), weight: 700 }),
      // The inside of Payments: drawn small, read only after the dolly.
      links.map(([a, b]) => { const p = part[a], q = part[b]; return arrow(p.x + p.w + 1, p.y + p.h / 2, q.x - 3, q.y + q.h / 2); }),
      inside.map(c => el('rect', { x: part[c.id].x, y: part[c.id].y, width: cw, height: ch, rx: 5, fill: single.includes(c) ? t.c('accent') : t.c('surface'), stroke: single.includes(c) ? t.c('accent') : t.c('rule'), 'stroke-width': 1.4, 'vector-effect': 'non-scaling-stroke' })))),
  // Overview caption (state 0 only).
  textLines([`${fmt(perMinute)} payments a minute at peak`], { x: K.x + K.w / 2, y: K.y + K.h + 30, size: 16, anchor: 'middle', fill: t.c('muted'), attrs: { 'data-states': { 0: { opacity: 1 }, 1: { opacity: 0 } }, 'data-duration': 300 } }),
  // Close-view labels at reading size, placed where each component lands after the dolly.
  g({ 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 1000, 'data-duration': 400 },
    inside.map(c => { const [lx, ly] = cam([part[c.id].x + cw / 2, part[c.id].y + ch]); return textLines([c.label], { x: lx, y: ly + 8, size: 17, anchor: 'middle', valign: 'top', fill: t.c('ink'), weight: single.includes(c) ? 700 : 500 }); })),
  // Orientation in the close view: the neighbouring stages, named where their boxes are cut by the frame.
  g({ 'data-step': 1, 'data-motion': 'reveal', 'data-delay': 1000, 'data-duration': 400 },
    [stages[stages.indexOf(key) - 1], stages[stages.indexOf(key) + 1]].map((s, j) => {
      const [x0, yy] = cam([box[s].x, cy]), [x1] = cam([box[s].x + box[s].w, cy]);
      return textLines([s], { x: j ? Math.min(x1, W) - 18 : Math.max(x0, 0) + 18, y: yy, size: 17, anchor: j ? 'end' : 'start', valign: 'middle', fill: t.c('muted'), weight: 600 });
    })),
  // Build 2 — what the close view shows: volumes and instances per component.
  g({ 'data-step': 2, 'data-motion': 'reveal', 'data-stagger': 80 },
    inside.map(c => { const [lx, ly] = cam([part[c.id].x + cw / 2, part[c.id].y + ch]); const on = single.includes(c);
      return textLines([`${fmt(Math.round(perMinute * c.share))}/min`, `${c.instances} ${c.instances === 1 ? 'instance' : 'instances'}`], { x: lx, y: ly + 31, size: 16, anchor: 'middle', valign: 'top', fill: on ? t.c('accent') : t.c('muted'), weight: on ? 700 : 400, lineHeight: 1.2 }); })));
}

export default {
  study: true,
  id: 'motion-diagram-dolly',
  title: 'Diagram dolly: approach the node the claim is about',
  className: 'st cs-tech-conference-light',
  notes: `Purpose: Move the camera to the one region the claim is about, so its internal structure becomes readable, instead of enlarging the diagram for effect.\nModify: Edit \`stages\`, \`key\`, \`inside\` and \`links\`; box positions, the camera matrix (fit the key stage into the frame) and the close-view labels are computed. The single point of failure is found from share and instance count.\nInvariant: One group moves by a computed matrix; neighbours keep their boxes and arrows for orientation; strokes do not scale; labels for the close view are set at reading size where the components land.\nStatic: The final build is the close view: the inside of ${key} with volumes and instance counts; the overview is state 0.`,
  sources: [{ type: 'original-example', file: 'assets/motion/diagram-dolly.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">All ${fmt(perMinute)} payments a minute pass through one <em>${single[0].label.toLowerCase()}</em> instance</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Illustrative data · peak-hour traffic, production order flow</span><span>Motion · dolly into the key node (2 builds)</span></p>`,
};
