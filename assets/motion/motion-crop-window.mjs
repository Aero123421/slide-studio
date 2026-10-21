// Motion study · Move the window instead of stretching the subject — one launch photograph
// stays fixed while the crop window moves and changes shape for three delivery formats.
// The photo is never scaled per format; only the window (and the veil around it) moves.
// Builds: 1 square crop, 2 vertical story crop.
import { svgRoot, el, g, textLines, theme as makeTheme, n } from '../runtime/figure.mjs';

// The source photo (public domain, 640 × 427 px) and the subject's box in it, in source pixels.
const photo = { w: 640, h: 427, href: '{{asset:assets/media/study-02.jpg}}' };
const subject = { x: 296, y: 120, w: 54, h: 296 }; // the rocket and its launch mount
// One crop per format, in source pixels. Each keeps the subject centred horizontally.
const formats = [
  { name: 'Website hero', ratio: '16:9', x: 0, y: 60, w: 640, h: 360 },
  { name: 'Social post', ratio: '1:1', x: 108, y: 0, w: 427, h: 427 },
  { name: 'Phone story', ratio: '9:16', x: 202, y: 0, w: 240, h: 427 },
].map(f => ({ ...f, kept: Math.round(((f.w * f.h) / (photo.w * photo.h)) * 100),
  whole: f.x <= subject.x && f.y <= subject.y && f.x + f.w >= subject.x + subject.w && f.y + f.h >= subject.y + subject.h }));
const last = formats.at(-1);

export function figure(theme = 'css') {
  const t = makeTheme(theme), W = 1152, H = 470, s = H / photo.h; // photo drawn once, at one scale
  const P = { x: 0, y: 0, w: photo.w * s, h: photo.h * s };
  const box = f => ({ x: P.x + f.x * s, y: P.y + f.y * s, w: f.w * s, h: f.h * s });
  const unit = f => { const b = box(f); return `matrix(${n(b.w)},0,0,${n(b.h)},${n(b.x)},${n(b.y)})`; }; // unit square → window
  const states = fn => ({ 'data-states': Object.fromEntries(formats.map((f, k) => [k, fn(f)])), 'data-duration': 1000, 'data-easing': 'smooth', style: 'transform-box:view-box;transform-origin:0 0' });
  const railX = P.w + 56, rowY = k => 70 + k * 128;
  return svgRoot({ id: 'motion-crop-window-fig', width: W, height: H, theme: t,
    title: 'One launch photograph cropped for three formats: 16:9, 1:1 and 9:16',
    desc: formats.map(f => `${f.ratio} ${f.name.toLowerCase()} keeps ${f.kept}% of the frame${f.whole ? ' and the whole rocket' : ''}`).join('; ') + '. The photo is never stretched; only the crop window changes.' },
  // Mask luminance (white keeps the veil, black is the window): literal by definition, not a colour.
  el('defs', {}, el('mask', { id: 'motion-crop-window-veil', maskUnits: 'userSpaceOnUse', x: P.x, y: P.y, width: P.w, height: P.h },
    el('rect', { x: P.x, y: P.y, width: P.w, height: P.h, fill: '#fff' }),
    el('rect', { x: 0, y: 0, width: 1, height: 1, fill: '#000', ...states(f => ({ transform: unit(f) })) }))),
  el('image', { href: photo.href, x: P.x, y: P.y, width: P.w, height: P.h, preserveAspectRatio: 'none' }),
  // Everything outside the window is veiled, not removed, so the whole frame stays readable.
  el('rect', { x: P.x, y: P.y, width: P.w, height: P.h, fill: t.c('paper'), opacity: 0.74, mask: 'url(#motion-crop-window-veil)' }),
  el('rect', { x: 0, y: 0, width: 1, height: 1, fill: 'none', stroke: t.c('accent'), 'stroke-width': 3, 'vector-effect': 'non-scaling-stroke', ...states(f => ({ transform: unit(f) })) }),
  // The window's own label travels with it (translate only, so the text never scales).
  g(states(f => ({ transform: `matrix(1,0,0,1,${n(box(f).x + 14)},${n(box(f).y + 30)})` })),
    formats.map((f, k) => textLines([f.ratio], { x: 0, y: 0, size: 22, fill: t.c('accent'), weight: 700, halo: t.c('paper'),
      attrs: { 'data-states': Object.fromEntries(formats.map((_, j) => [j, { opacity: j === k ? 1 : 0 }])), 'data-duration': 300 } }))),
  // The formats, one per build; the current one carries the accent.
  formats.map((f, k) => g({ 'data-step': k || null, 'data-motion': k ? 'reveal' : null, 'data-delay': k ? 600 : null },
    textLines([`${f.ratio}  ${f.name}`], { x: railX, y: rowY(k), size: 22, fill: t.c('ink'), weight: 700,
      attrs: { 'data-states': Object.fromEntries(formats.map((_, j) => [j, { fill: j === k ? t.c('accent') : t.c('ink') }])), style: `fill:${t.c('ink')}`, 'data-duration': 400 } }),
    textLines([`Keeps ${f.kept}% of the frame`, f.whole ? 'and the whole rocket' : 'and cuts into the rocket'], { x: railX, y: rowY(k) + 32, size: 18, fill: t.c('muted'), lineHeight: 1.35 }))));
}

export default {
  study: true,
  id: 'motion-crop-window',
  title: 'Crop window: move the window, never stretch the photo',
  className: 'st cs-keynote-dusk',
  notes: 'Purpose: Show how one photograph serves several formats by moving and reshaping the crop window over a fixed image, never by scaling or stretching the subject.\nModify: Replace the photo, `subject` (its box in source pixels) and `formats` (crop boxes in source pixels); the share of the frame kept and the whole-subject check recompute.\nInvariant: The image is drawn once at one scale; only the window, its veil and its label move (one computed matrix per format). Outside the window the photo is veiled, not hidden.\nStatic: The final build shows the 9:16 window on the photo and all three formats listed.',
  sources: [{ type: 'original-example', file: 'assets/motion/motion-crop-window.mjs' }],
  exportPolicy: 'final',
  content: `<h1 class="st-head">The <em>${last.ratio}</em> ${last.name.split(' ').at(-1).toLowerCase()} crop keeps ${last.kept}% of the launch photo, and ${last.whole ? 'all' : 'part'} of the rocket</h1>
<figure class="st-fig" data-region="primary">${figure()}</figure>
<p class="st-source" data-region="source"><span>Photo: launch vehicle on the pad at dusk (public domain) · illustrative crop specification</span><span>Motion · crop window moves over a fixed photo (2 builds)</span></p>`,
};
