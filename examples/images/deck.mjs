// Worked example · Images: twelve pages from one magazine issue, one picture decision each.
//
// The spring issue of a fictional city magazine — an installation at a gallery, a mug from
// a pottery, a café's espresso, a launch pad at dusk. Every page is a real page of the issue;
// a small caption on the source line names the image technique it demonstrates.
//
// Every crop, scale and annotation is computed from the picture's own pixels: features are
// measured once in image coordinates (FEATURES), place() maps them to the page through the
// same transform that crops the picture, and refuses any frame that would enlarge a picture
// past MAX_SCALE. Change a frame and the annotations follow; change the picture and re-measure.
//
// Build: node scripts/craft.mjs build examples/images/deck.mjs --out images.html --force
import fs from 'node:fs/promises';
import { lineChart, theme, svgRoot, el, g, textLines, contrastRatio, fmt } from '../../assets/runtime/figure.mjs';

// ---------------------------------------------------------------- page grammar + color
const read = rel => fs.readFile(new URL(rel, import.meta.url));
const SYSTEM = 'culture-gallery';                  // gallery whites, near-black ink, one wine accent
const frame = String(await read('../../assets/runtime/study-frame.css'));
const colors = String(await read('../../assets/color-systems/color-systems.css'))
  .match(new RegExp(`/\\*[^*]*\\*/\\n\\.cs-${SYSTEM}\\{[^}]*\\}`))[0];
const palette = JSON.parse(String(await read(`../../assets/color-systems/${SYSTEM}.json`)));

// ---------------------------------------------------------------- 1 · media
// Read each picture once. Its real pixel size (from the file header) drives the upscale
// guard; the data URI keeps the page self-contained under any build route. In your own
// project, keep pictures beside deck.mjs and write {{asset:assets/…}} instead.
function pixelSize(b) {
  if (b[0] === 0xff && b[1] === 0xd8) {                       // JPEG: first start-of-frame marker
    for (let i = 2; i < b.length;) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (chunk === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (chunk === 'VP8L') { const n = b.readUInt32LE(21); return { w: 1 + (n & 0x3fff), h: 1 + ((n >> 14) & 0x3fff) }; }
  }
  throw Error('Unsupported image file');
}
async function media(file, meta) {
  const bytes = await read(`../../assets/media/${file}`);
  const mime = file.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
  return { file, ...pixelSize(bytes), src: `data:${mime};base64,${bytes.toString('base64')}`, ...meta };
}
const IMG = {
  installation: await media('image-fixture-1e48ddfe87f4.webp', { kind: 'Rendering', license: 'original synthetic illustration', alt: 'Rendering of the installation: a terracotta disc, a dark green pyramid and a pale yellow cylinder on a beige floor, lit from the upper left' }),
  mug: await media('image-fixture-0f4bbcefd6b2.webp', { kind: 'Cutout', license: 'original synthetic illustration', alt: 'Sage-green stoneware mug with a loop handle, on a transparent background with a faint floor shadow' }),
  espresso: await media('study-01.jpg', { kind: 'Photo', license: 'CC0', alt: 'Double espresso in a brown cup on a brown saucer with a steel spoon, seen from above on a wooden table' }),
  launch: await media('study-02.jpg', { kind: 'Photo', license: 'public domain', alt: 'A launch vehicle on its pad at dusk between four lattice towers, floodlights glowing at its base' }),
};
const MAX_SCALE = 1.3;                              // never enlarge a picture into softness

// ---------------------------------------------------------------- 2 · features, in image pixels
// Measured once on the originals (PIL, during authoring). Boxes are [x, y, w, h]; points [x, y].
const FEATURES = {
  installation: {
    disc: [246, 360, 518, 519], pyramid: [588, 190, 301, 557], cylinder: [890, 430, 231, 427],
    apex: [645, 190], base: [1005, 830],
    wall: [0, 0, 580, 340], wallRight: [1140, 0, 300, 420],            // empty wall: room for type
    wallColor: '#e2d8c4',                                               // mean of `wall`
  },
  mug: { body: [190, 100, 296, 506], object: [85, 100, 551, 551] },     // object = body, handle and floor shadow
  espresso: {
    rim: [173, 17, 234, 190], crema: [203, 95, 168, 98], saucer: [76, 68, 404, 322],
    spoon: [366, 282], handle: [229, 268], subject: [76, 17, 404, 373],
  },
  launch: {
    tip: [322, 127], fairing: [311, 127, 23, 51], vehicle: [310, 127, 25, 278],
    mastL: [199, 123], mastR: [447, 122], towerL: [0, 0, 88, 427], towerR: [558, 0, 82, 427],
    light: [362, 393], pad: [268, 405, 104, 22], subject: [168, 120, 312, 307],
    sky: [100, 0, 445, 100], skyLumMax: 0.042,                          // calm band; brightest pixel's relative luminance
    lights: [0, 330, 640, 97], lightsLumMax: 0.995,                     // horizon and floodlights
    topColor: '#131f35',                                                // mean of the top rows: the night page's paper
  },
};

// ---------------------------------------------------------------- 3 · placement
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const r1 = v => Math.round(v * 10) / 10;
const norm = (img, [x, y, w, h]) => [x / img.w, y / img.h, w / img.w, h / img.h].map(v => +v.toFixed(4));

/**
 * Put a picture in a frame {x, y, w, h} (page px).
 *   fit 'cover'   fills the frame and crops; `focus` (image px) is the point the crop centres on.
 *   fit 'contain' shows the whole picture inside the frame.
 *   scale         zooms further than cover (a detail); the frame then clips with overflow.
 *   subject       box (image px) that must stay visible — QA checks it through data-qa-focus.
 * Returns the markup, the scale, the visible source box, and at() which maps image px to page px.
 */
function place(img, { x, y, w, h, fit = 'cover', focus, scale, subject, limit = MAX_SCALE, cls = '', style = '' }) {
  const fill = Math.max(w / img.w, h / img.h), fitAll = Math.min(w / img.w, h / img.h);
  const s = scale ?? (fit === 'contain' ? fitAll : fill);
  if (s > limit + 1e-9) throw Error(`${img.file}: a ${w}×${h} frame would show it at ${s.toFixed(2)}×; the limit is ${limit}×.`);
  if (fit === 'contain') {
    const dx = (w - img.w * s) / 2, dy = (h - img.h * s) / 2;
    return {
      scale: s, visible: [0, 0, img.w, img.h], at: ([ix, iy]) => [x + dx + ix * s, y + dy + iy * s],
      html: `<img class="ph ${cls}" src="${img.src}" alt="${img.alt}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;object-fit:contain;${style}">`,
    };
  }
  if (s < fill - 1e-9) throw Error(`${img.file}: scale ${s} leaves the frame partly empty; use fit 'contain'.`);
  const vw = w / s, vh = h / s, [fx, fy] = focus ?? [img.w / 2, img.h / 2];
  const ox = clamp(fx - vw / 2, 0, img.w - vw), oy = clamp(fy - vh / 2, 0, img.h - vh);
  const at = ([ix, iy]) => [x + (ix - ox) * s, y + (iy - oy) * s];
  const qa = subject ? ` data-qa-focus="${JSON.stringify(norm(img, subject))}"` : '';
  if (s > fill + 1e-9) {                              // zoomed detail: a clipping frame around the full-size picture
    return {
      scale: s, visible: [ox, oy, vw, vh], at,
      html: `<div class="crop ${cls}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${style}"><img src="${img.src}" alt="${img.alt}" style="left:${r1(-ox * s)}px;top:${r1(-oy * s)}px;width:${r1(img.w * s)}px;height:${r1(img.h * s)}px"></div>`,
    };
  }
  const px = img.w > vw ? (ox / (img.w - vw)) * 100 : 50, py = img.h > vh ? (oy / (img.h - vh)) * 100 : 50;
  return {
    scale: s, visible: [ox, oy, vw, vh], at,
    html: `<img class="ph ${cls}" src="${img.src}" alt="${img.alt}"${qa} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;object-fit:cover;object-position:${r1(px)}% ${r1(py)}%;${style}">`,
  };
}

// ---------------------------------------------------------------- 4 · page furniture
// Grid: 1280 × 720, 64 px margins, 12 columns of 74 px with 24 px gutters.
const M = 64, COL = 74, GUT = 24;
const colX = c => M + (c - 1) * (COL + GUT);          // left edge of column c (1–12)
const span = n => n * COL + (n - 1) * GUT;             // width of n columns
const T = theme(palette);                             // literal colors, for the figure drawn as a file
const times = s => `${s.toFixed(2)}×`;
const px = img => `${img.w} × ${img.h} px`;
const at = (x, y, w) => `left:${Math.round(x)}px;top:${Math.round(y)}px${w ? `;width:${Math.round(w)}px` : ''}`;
// Source line: left, what the picture is and how it is shown; right, the technique.
const source = (credit, technique, detail) => `<p class="st-source" data-region="source"><span>${credit}</span><span><b>${technique}</b> ${detail}</span></p>`;
const credit = (img, subject, p) => `${img.kind}: ${subject}, ${img.license}; ${px(img)} shown at ${times(p.scale)}`;
// Thin annotation drawing over the page (leaders, dimension lines, locators); it carries no text.
const overlay = (parts, label) => `<svg class="im-ink" viewBox="0 0 1280 720" width="1280" height="720" role="img" aria-label="${label}">${parts.join('')}</svg>`;
const line = (a, b, cls = '') => `<line class="${cls}" x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}"/>`;
const dot = (p, cls = '') => `<circle class="${cls}" cx="${r1(p[0])}" cy="${r1(p[1])}" r="4"/>`;
const box = (p0, p1, cls = '') => `<rect class="${cls}" x="${r1(p0[0])}" y="${r1(p0[1])}" width="${r1(p1[0] - p0[0])}" height="${r1(p1[1] - p0[1])}"/>`;
const corner = ([x, y, w, h]) => [[x, y], [x + w, y + h]];

// ---------------------------------------------------------------- 5 · story data (illustrative)
const show = { title: 'Three Solids', artist: 'Mira Okafor', born: 1987, venue: 'Gallery 4', opens: '14 March', closes: '2 August 2026' };
const shot = { cafe: 'Caffè Ostro', dose: 18, yield: 36, seconds: 27, price: 2.8 };   // grams, grams, s, euro
const ratio = shot.yield / shot.dose;
const menu = [ // drink, what is in it, price in euro
  ['Espresso', 'single, 25 ml', 2.2], ['Double', `${shot.dose} g in, ${shot.yield} g out`, shot.price],
  ['Macchiato', 'double, a spoon of foam', 2.6], ['Cortado', 'double, 40 ml warm milk', 3.1],
  ['Flat white', 'double, 110 ml milk', 3.6], ['Batch filter', '250 ml, today’s single origin', 3.0],
];
const mugSpec = { name: 'Sage mug', maker: 'Ferry Lane Pottery', heightCm: 11, capacityMl: 280, price: 28, weeks: 3 };
const mugBody = FEATURES.mug.body, cmPerPx = mugSpec.heightCm / mugBody[3];
const mugDiameter = mugBody[2] * cmPerPx;               // measured from the picture, not typed
// Crema thickness on the double, mean and s.d. of 12 shots (illustrative), seconds after the pour.
const crema = { t: [0, 15, 30, 45, 60, 90, 120, 180, 240, 300], mean: [4.1, 3.6, 3.15, 2.75, 2.4, 1.85, 1.5, 1.05, 0.85, 0.75], sd: [0.35, 0.33, 0.3, 0.28, 0.26, 0.22, 0.2, 0.16, 0.14, 0.13], shots: 12, rimMm: 68 };
const halfAt = (() => {                                 // first time the mean falls to half its start, interpolated
  const half = crema.mean[0] / 2, i = crema.mean.findIndex(v => v <= half);
  return crema.t[i - 1] + ((crema.mean[i - 1] - half) / (crema.mean[i - 1] - crema.mean[i])) * (crema.t[i] - crema.t[i - 1]);
})();
const L = FEATURES.launch;
const onLuminance = lum => (1 + 0.05) / (lum + 0.05);                                     // white type over a pixel of relative luminance lum
const skyContrast = onLuminance(L.skyLumMax), lightsContrast = onLuminance(L.lightsLumMax);
const mastGap = Math.abs(L.tip[1] - Math.min(L.mastL[1], L.mastR[1]));                     // px in the frame
const wallContrast = contrastRatio(palette.tokens.ink, FEATURES.installation.wallColor);

// ---------------------------------------------------------------- 6 · the twelve pages
const pages = [];

// Cover — overlay only where contrast survives.
{
  const img = IMG.launch, f = FEATURES.launch;
  const p = place(img, { x: 1280 - img.w * 1.3, y: 720 - img.h * 1.3, w: img.w * 1.3, h: img.h * 1.3, subject: f.subject });
  const [sx0, sy0] = p.at([f.sky[0], f.sky[1]]), [sx1, sy1] = p.at([f.sky[0] + f.sky[2], f.sky[1] + f.sky[3]]);
  pages.push({
    id: 'image-11', title: 'Overlay only where contrast survives: the cover type sits on the dark sky', className: 'im im-night',
    sources: [{ type: 'image', file: 'assets/media/study-02.jpg', license: 'public domain' }],
    notes: `Purpose: put type on a photograph only where the picture is calm and dark (or light) enough. Measured: the brightest pixel of the sky band has relative luminance ${L.skyLumMax}, so white type keeps ${skyContrast.toFixed(1)} : 1; on the floodlights it would fall to ${lightsContrast.toFixed(1)} : 1.\nModify: measure your own picture's band (darkest and brightest pixel under the text), store it in FEATURES, and let the cover line's box come from place().at().\nInvariant: no letter crosses a tower, a mast or a light; the page paper is the sky's own color, so the photo's top edge disappears.\nStatic: already static.`,
    content: `${p.html}
<p class="im-mast" style="${at(M, 52)}">Weir Quarterly</p>
<p class="im-issue" style="${at(M, 104)}">Spring 2026</p>
<h1 class="im-cover" data-region="title" style="${at(sx0 + 18, sy0 + 20, sx1 - sx0 - 36)}">Why the towers stand taller than the rocket</h1>
<div class="im-teasers" data-region="support" style="${at(M, 268, span(3) + 24)}">
  <p><b>Three Solids</b>${show.artist}’s installation, ${show.venue}</p>
  <p><b>${shot.dose} grams in, ${shot.yield} out</b>The double at ${shot.cafe}, timed</p>
  <p><b>The ${mugSpec.capacityMl} ml mug</b>Made to order on Ferry Lane</p>
</div>
<p class="im-foot" data-region="source" style="${at(M, 640, span(4))}">${credit(img, 'launch pad at dusk', p)}<br><b>Overlay only where contrast survives</b> ${skyContrast.toFixed(1)} : 1 on the sky; the lights would give ${lightsContrast.toFixed(1)} : 1</p>`,
  });
}

// Exhibition opener — negative space for type.
{
  const img = IMG.installation, f = FEATURES.installation;
  const p = place(img, { x: 0, y: 0, w: 1280, h: 720, focus: [img.w / 2, 535], subject: [f.disc[0], f.pyramid[1], f.cylinder[0] + f.cylinder[2] - f.disc[0], f.disc[1] + f.disc[3] - f.pyramid[1]] });
  const [wx1] = p.at([f.wall[0] + f.wall[2], 0]), [rx0] = p.at([f.wallRight[0], 0]);
  pages.push({
    id: 'image-3', title: 'Negative space for type: the exhibition opener', className: 'im im-bleed',
    sources: [{ type: 'image', file: 'assets/media/image-fixture-1e48ddfe87f4.webp', license: 'original synthetic illustration' }],
    notes: `Purpose: open a story with the picture at full bleed and set the type in the picture's own empty wall, so neither competes. The wall's mean color ${f.wallColor} gives ink type ${wallContrast.toFixed(1)} : 1.\nModify: measure the empty regions of your picture (FEATURES.installation.wall, wallRight) and keep every text box inside their page projection; place() reports the crop.\nInvariant: the three solids and the floor under them stay in frame (data-qa-focus); type never touches an object.\nStatic: already static.`,
    content: `${p.html}
<h1 class="im-display" data-region="title" style="${at(M, 40, wx1 - M - 40)}">${show.title}</h1>
<div class="im-dates" data-region="support" style="${at(rx0 + 28, 58, 1280 - M - rx0 - 28)}"><p>An installation by ${show.artist}</p><p>${show.opens} – ${show.closes}</p><p>${show.venue}, free entry</p></div>
${source(credit(img, show.title, p), 'Negative space for type', `ink on the empty wall, ${wallContrast.toFixed(1)} : 1`)}`,
  });
}

// Catalogue plate — contain the whole.
{
  const img = IMG.installation, w = img.w / 2, h = img.h / 2;          // half size: 720 × 480
  const p = place(img, { x: M, y: 176, w, h, fit: 'contain' });
  const lx = colX(9);
  pages.push({
    id: 'image-1', title: 'Contain the whole: the installation shown entire, with its label', className: 'im',
    sources: [{ type: 'image', file: 'assets/media/image-fixture-1e48ddfe87f4.webp', license: 'original synthetic illustration' }],
    notes: 'Purpose: show a work, an instrument or a figure whole when its parts only make sense together: here the three shadows share one floor and one lamp.\nModify: swap the picture; place() with fit "contain" keeps the whole frame at the largest scale that fits and refuses an enlargement past 1.3×.\nInvariant: nothing is cropped, the proportions are untouched, the label sits beside the picture and never on it.\nStatic: already static.',
    content: `<h1 class="im-head" data-region="title" style="${at(M, 52, 1080)}">In <i>${show.title}</i> every shadow falls to the right: one lamp, outside the frame, lights all three</h1>
${p.html}
<div class="im-label-card" data-region="support" style="${at(lx, 176, span(4))}">
  <p class="im-artist">${show.artist} <span>born ${show.born}</span></p>
  <p class="im-work"><i>${show.title}</i>, 2026</p>
  <p>Painted plywood disc, pyramid and cylinder; one lamp</p>
  <p>Studio rendering of the installation for ${show.venue}</p>
  <hr>
  <p class="im-body">The disc, the pyramid and the cylinder stand on one floor and throw their shadows the same way. Crop any edge and the shared light goes with it, so the plate shows the rendering whole.</p>
</div>
${source(credit(img, show.title, p), 'Contain the whole', 'the full 3 : 2 frame, nothing cropped')}`,
  });
}

// Look closer — context and detail.
{
  const img = IMG.installation, f = FEATURES.installation;
  const ctxW = span(7) - 30, ctxH = (ctxW * img.h) / img.w, top = 196;
  const ctx = place(img, { x: M, y: top, w: ctxW, h: ctxH, fit: 'contain' });
  const detailSrc = [f.base[0] - 210, img.h - 420, 420, 420];          // the cylinder's foot and its shadow, image px
  const dw = ctxH, dx = 1216 - dw;
  const det = place(img, { x: dx, y: top, w: dw, h: dw, scale: dw / detailSrc[2], focus: [detailSrc[0] + 210, detailSrc[1] + 210], subject: detailSrc });
  const [a, b] = [ctx.at([detailSrc[0], detailSrc[1]]), ctx.at([detailSrc[0] + 420, detailSrc[1] + 420])];
  pages.push({
    id: 'image-5', title: 'Context and detail: the full view locates the enlarged detail', className: 'im',
    sources: [{ type: 'image', file: 'assets/media/image-fixture-1e48ddfe87f4.webp', license: 'original synthetic illustration' }],
    notes: `Purpose: show a detail at working size without losing where it is: the whole picture, a box on it, and the detail beside it with lines to the box.\nModify: change detailSrc (image px); the box, the detail crop and the connecting lines all come from it. The detail is shown at ${times(det.scale)}, inside the 1.3× limit.\nInvariant: the detail is cropped from the same picture, never re-shot or redrawn; the box marks exactly what the detail shows.\nStatic: already static.`,
    content: `<h1 class="im-head" data-region="title" style="${at(M, 52, 1000)}">Look closer: Okafor draws no outlines; the cylinder stands on a soft-edged shadow</h1>
${ctx.html}
${det.html}
${overlay([box(a, b, 'loc'), line([b[0], a[1]], [dx, top], 'link'), line(b, [dx, top + dw], 'link')], 'The box on the full view marks the area shown enlarged on the right')}
<p class="im-cap" style="${at(M, top + ctxH + 12, ctxW)}">Whole rendering, ${times(ctx.scale)}</p>
<p class="im-cap" style="${at(dx, top + dw + 12, dw)}">Detail, ${times(det.scale)}: the foot of the cylinder</p>
${source(credit(img, show.title, ctx), 'Context and detail', `the box on the full view is the detail at ${times(det.scale)}`)}`,
  });
}

// Shop — transparent cutout.
{
  const img = IMG.mug, f = FEATURES.mug, s = 0.8, size = img.w * s;
  const p = place(img, { x: 1216 - size - 24, y: 92, w: size, h: size, fit: 'contain', subject: f.object });
  const [bx, by, bw, bh] = f.body, gap = 34;
  const hTop = p.at([bx - gap, by]), hBot = p.at([bx - gap, by + bh]);
  const wL = p.at([bx, by + bh + gap + 12]), wR = p.at([bx + bw, by + bh + gap + 12]);
  const tick = (q, dx2, dy2) => line([q[0] - dx2, q[1] - dy2], [q[0] + dx2, q[1] + dy2], 'dim');
  const spec = [['Clay', 'Stoneware, fired to 1,240 °C'], ['Glaze', 'Sage, food-safe'], ['Capacity', `${mugSpec.capacityMl} ml`], ['Size', `${fmt(mugSpec.heightCm)} cm high, ${fmt(mugDiameter, { digits: 1 })} cm across`], ['Price', `€${mugSpec.price}`], ['Made to order', `${mugSpec.weeks} weeks`]];
  pages.push({
    id: 'image-6', title: 'Transparent cutout: a product shown whole on the page paper', className: 'im',
    sources: [{ type: 'image', file: 'assets/media/image-fixture-0f4bbcefd6b2.webp', license: 'original synthetic illustration' }],
    notes: `Purpose: a cutout (transparent PNG/WebP) lets the object stand on the page itself. Give it room, keep its own floor shadow, and never let a frame cut its edge.\nModify: replace the picture and its measured body box; the dimension lines and the diameter (${fmt(mugDiameter, { digits: 2 })} cm, from the body's pixel proportions and the stated 11 cm height) recompute.\nInvariant: every non-transparent pixel stays inside the frame (data-qa-focus covers the object and its shadow); no box, no tint behind the object.\nStatic: already static.`,
    content: `<h1 class="im-head" data-region="title" style="${at(M, 52, span(6))}">The ${mugSpec.name.toLowerCase()} from ${mugSpec.maker} holds ${mugSpec.capacityMl} ml and is made to order</h1>
<p class="im-lead" style="${at(M, 196, span(5))}">Thrown on the wheel, glazed in a pale sage that breaks to cream at the rim, and fired once more for a glaze that takes the dishwasher.</p>
<table class="im-spec" style="${at(M, 352, span(5))}">${spec.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</table>
${p.html}
${overlay([line(hTop, hBot, 'dim'), tick(hTop, 7, 0), tick(hBot, 7, 0), line(wL, wR, 'dim'), tick(wL, 0, 7), tick(wR, 0, 7)], 'Dimension lines: height and diameter of the mug')}
<p class="im-dimlabel" style="${at(hTop[0] - 96, (hTop[1] + hBot[1]) / 2 - 12, 84)}">${fmt(mugSpec.heightCm)} cm</p>
<p class="im-dimlabel im-center" style="${at(wL[0], wL[1] + 10, wR[0] - wL[0])}">${fmt(mugDiameter, { digits: 1 })} cm</p>
${source(credit(img, `${mugSpec.name.toLowerCase()}, product render`, p), 'Transparent cutout', 'the object and its own floor shadow, nothing cropped')}`,
  });
}

// Café review — crop toward the subject.
{
  const img = IMG.espresso, f = FEATURES.espresso;
  const w = span(5) - 50, h = w * 1.25;                                 // a 4 : 5 portrait frame
  const p = place(img, { x: M, y: 720 - 64 - h, w, h, focus: [f.rim[0] + f.rim[2] / 2, img.h / 2], subject: [f.rim[0], f.rim[1], f.spoon[0] + 40 - f.rim[0], f.spoon[1] + 44 - f.rim[1]] });
  const kept = p.visible[2] / img.w;
  const tx = colX(7);
  pages.push({
    id: 'image-2', title: 'Crop toward the subject: the café review', className: 'im',
    sources: [{ type: 'image', file: 'assets/media/study-01.jpg', license: 'CC0' }],
    notes: `Purpose: crop until the subject owns the frame — here the cup, its crema and the spoon — and the empty table goes.\nModify: change the frame or the focus point; place() computes the crop (${Math.round(p.visible[2])} × ${Math.round(p.visible[3])} of ${px(img)}) and the scale, and data-qa-focus makes QA fail if a later edit cuts the cup or the spoon.\nInvariant: scale ≤ 1.3×; the rim of the cup is never cut.\nStatic: already static.`,
    content: `${p.html}
<h1 class="im-head" data-region="title" style="${at(tx, 92, span(6))}">${shot.cafe} pulls its double in ${shot.seconds} seconds: ${shot.dose} grams in, ${shot.yield} out</h1>
<p class="im-lead" style="${at(tx, 236, span(6))}">The shot runs dark and slow, and the crema is still a firm hazel ring when the cup reaches the table. It is served on a warm saucer with a glass of soda water.</p>
<table class="im-spec im-spec--num" style="${at(tx, 404, span(4))}"><tr><th>Dose</th><td>${shot.dose} g</td></tr><tr><th>Yield</th><td>${shot.yield} g</td></tr><tr><th>Brew ratio</th><td>1 : ${fmt(ratio, { digits: 1 })}</td></tr><tr><th>Time</th><td>${shot.seconds} s</td></tr><tr><th>Price</th><td>€${fmt(shot.price, { digits: 2 })}</td></tr></table>
${source(credit(img, 'double espresso', p), 'Crop toward the subject', `${Math.round(kept * 100)}% of the width kept, centred on the cup`)}`,
  });
}

// Recipe card — deliberate inset.
{
  const img = IMG.espresso, w = img.w, h = img.h;                    // native size, 1.00×
  const x = 1216 - w, y = 168;
  const p = place(img, { x, y, w, h, fit: 'contain' });
  const steps = [
    `Weigh ${shot.dose} g of beans and grind them fine, like table salt.`,
    'Level the basket and tamp once, firmly and flat.',
    `Stop the shot at ${shot.yield} g, about ${shot.seconds} seconds after the pump starts.`,
    'Drink it within a minute, while the crema still holds.',
  ];
  pages.push({
    id: 'image-4', title: 'Deliberate inset: the recipe card', className: 'im',
    sources: [{ type: 'image', file: 'assets/media/study-01.jpg', license: 'CC0' }],
    notes: 'Purpose: an inset turns the photograph into an object on the page: smaller than the page, at its native size, with margins on every side and a caption that belongs to it.\nModify: keep the inset on the column grid and at 1.00× when the photo is small; move the text column, not the picture.\nInvariant: the inset never touches the page edge or the text; its caption sits directly beneath it.\nStatic: already static.',
    content: `<h1 class="im-head" data-region="title" style="${at(M, 52, span(7))}">A 1 : ${fmt(ratio)} double at home, in four steps</h1>
<ol class="im-steps" data-region="support" style="${at(M, 176, span(5))}">${steps.map(s2 => `<li>${s2}</li>`).join('')}</ol>
${p.html}
<p class="im-cap" style="${at(x, y + h + 14, w)}">The ${shot.cafe} double on its saucer, photographed from above at the bar.</p>
${source(credit(img, 'double espresso', p), 'Deliberate inset', 'native size, margins on all four sides, caption beneath')}`,
  });
}

// Bar menu — shaped frame.
{
  const img = IMG.espresso, f = FEATURES.espresso, d = img.h * 1.3;
  const p = place(img, { x: M, y: (720 - d) / 2 + 8, w: d, h: d, focus: [f.saucer[0] + f.saucer[2] / 2, img.h / 2], style: 'clip-path:circle(50%)' });
  const tx = colX(7) + 24;
  pages.push({
    id: 'image-10', title: 'Shaped frame: a circle that echoes the cup, on the bar menu', className: 'im',
    sources: [{ type: 'image', file: 'assets/media/study-01.jpg', license: 'CC0' }],
    notes: 'Purpose: a shaped frame is decoration; use it when the shape repeats the subject (a round cup seen from above) and the picture is identity, not evidence.\nModify: clip-path: circle() on a square cover crop; the circle is centred on the saucer, so the cup and spoon stay whole.\nInvariant: never mask a photograph that is evidence (a sample, a site, a figure): the mask hides what the reader needs to judge.\nStatic: already static.',
    content: `${p.html}
<h1 class="im-head" data-region="title" style="${at(tx, 76, span(5) + 24)}">Six drinks on the ${shot.cafe} bar menu, and every one starts from the same double</h1>
<table class="im-menu" data-region="support" style="${at(tx, 268, span(5) + 24)}">${menu.map(([n, what, eur]) => `<tr><th>${n}<span>${what}</span></th><td>€${fmt(eur, { digits: 2 })}</td></tr>`).join('')}</table>
${source(credit(img, 'double espresso', p), 'Shaped frame', 'a circle that repeats the cup; never for evidence')}`,
  });
}

// Coffee lab — preserve the full scientific figure.
{
  const img = IMG.espresso, f = FEATURES.espresso, W = 1152, H = 404;
  const panelA = { x: 0, y: 34, w: 516, h: 344 }, sA = panelA.w / img.w;            // photo panel, uniform scale
  const pxPerMm = f.rim[2] / crema.rimMm, bar = 10 * pxPerMm * sA;                     // 10 mm at the rim plane
  const chart = lineChart({
    id: 'image-12-crema', theme: palette, width: W - 580, height: H, x: crema.t, xType: 'linear',
    title: 'Crema thickness after the pour', desc: `Mean crema thickness falls from ${fmt(crema.mean[0])} mm to ${fmt(crema.mean.at(-1))} mm in ${crema.t.at(-1)} s.`,
    series: [{ name: 'Crema', values: crema.mean, band: crema.mean.map((m, i) => [m - crema.sd[i], m + crema.sd[i]]), color: T.c('ink') }],
    refLines: [{ y: crema.mean[0] / 2, label: 'Half the start' }], endLabels: false, zero: true, yDomain: [0, 5],
    unit: 'Crema thickness, mm', xLabel: 'Seconds after the pour', format: { digits: 1 }, markers: 'all', fontSize: 16,
  });
  const fig = svgRoot({ id: 'image-12-figure', width: W, height: H, theme: palette, title: 'Figure 2: crema decay on a double espresso', desc: `Panel a, top view of the cup with a 10 mm scale bar; panel b, crema thickness against time with a band of one standard deviation. Half the starting thickness is reached after about ${Math.round(halfAt)} seconds.` },
    el('rect', { width: W, height: H, fill: T.c('paper') }),
    textLines(['a'], { x: 0, y: 18, size: 20, weight: 700, fill: T.c('ink') }),
    el('image', { href: img.src, x: panelA.x, y: panelA.y, width: panelA.w, height: panelA.h, preserveAspectRatio: 'xMidYMid meet' }),
    g({}, el('rect', { x: panelA.w - 24 - bar - 12, y: panelA.y + panelA.h - 52, width: bar + 24, height: 40, fill: '#000000', 'fill-opacity': 0.55 }),
      el('line', { x1: panelA.w - 24 - bar, x2: panelA.w - 24, y1: panelA.y + panelA.h - 40, y2: panelA.y + panelA.h - 40, stroke: '#ffffff', 'stroke-width': 4 }),
      textLines(['10 mm'], { x: panelA.w - 24 - bar / 2, y: panelA.y + panelA.h - 18, size: 15, anchor: 'middle', fill: '#ffffff', weight: 600 })),
    textLines(['b'], { x: 580, y: 18, size: 20, weight: 700, fill: T.c('ink') }),
    chart.replace('<svg ', `<svg x="580" y="0" `));
  const figSrc = `data:image/svg+xml;base64,${Buffer.from(fig).toString('base64')}`;
  const p = place({ ...img, w: W, h: H, src: figSrc, alt: 'Figure 2, panels a and b: a top view of the espresso with a 10 millimetre scale bar, and a line chart of crema thickness falling from about 4 mm to under 1 mm in five minutes', file: 'figure' }, { x: M, y: 172, w: W, h: H, fit: 'contain', limit: 1 });
  pages.push({
    id: 'image-12', title: 'Preserve the full scientific figure: both panels, scale bar and caption', className: 'im',
    sources: [{ type: 'image', file: 'assets/media/study-01.jpg', license: 'CC0' }, { type: 'illustrative-data', file: 'examples/images/deck.mjs' }],
    notes: `Purpose: reproduce a figure from a paper or a lab note as published: every panel, axis, label and scale bar, scaled uniformly, with its own caption and its source. The figure here is a file (an SVG in an <img>), placed with fit "contain" at 1.00×.\nModify: drop in the real figure file and its caption; keep the frame at the figure's aspect ratio. Half-time (${Math.round(halfAt)} s) is computed from the data.\nInvariant: never crop a panel, an axis or the scale bar to make the photo bigger; never stretch; keep the caption with the figure.\nStatic: already static.`,
    content: `<h1 class="im-head" data-region="title" style="${at(M, 52, 1060)}">Crema on a double espresso halves in about ${Math.round(halfAt / 5) * 5} seconds</h1>
${p.html}
<p class="im-figcap" data-region="support" style="${at(M, 172 + H + 18, 1100)}"><b>Figure 2</b> Crema on the ${shot.cafe} double. <b>a</b> Top view 30 s after the pour; the scale bar is 10 mm at the rim plane, from the ${crema.rimMm} mm rim. <b>b</b> Thickness, mean ± s.d. of ${crema.shots} shots.</p>
${source(`Figure: ${shot.cafe} coffee lab, note 3 (illustrative data), with ${img.kind.toLowerCase()} ${img.file}, ${img.license}`, 'Preserve the full figure', 'both panels, axes, scale bar and caption at 1.00×')}`,
  });
}

// Science opener — bleed to one edge.
{
  const img = IMG.launch, f = FEATURES.launch, s = 1.3, w = img.w * s, h = img.h * s;
  const p = place(img, { x: 1280 - w, y: (720 - h) / 2, w, h, subject: f.subject });
  pages.push({
    id: 'image-7', title: 'Bleed to one edge: the science feature opener', className: 'im',
    sources: [{ type: 'image', file: 'assets/media/study-02.jpg', license: 'public domain' }],
    notes: 'Purpose: a picture that runs off one edge of the page feels larger than its frame and pulls the reader across the spread; the other three edges stay on the margins so the bleed reads as a decision.\nModify: keep exactly one edge on the canvas edge; the text column takes the opposite side.\nInvariant: scale ≤ 1.3×; the vehicle and its towers stay whole (data-qa-focus).\nStatic: already static.',
    content: `${p.html}
<h1 class="im-head im-head--feature" data-region="title" style="${at(M, 82, span(4) - 14)}">Why the towers stand taller than the rocket</h1>
<p class="im-lead" data-region="support" style="${at(M, 330, span(4) - 14)}">Four lattice towers ring the pad. The wires strung from their masts, not the vehicle, are meant to take a lightning strike.</p>
<p class="im-byline" style="${at(M, 520, span(4) - 14)}">Words by Jonas Weber</p>
${source(credit(img, 'launch pad at dusk', p), 'Bleed to one edge', 'the right edge only; three edges on the margins')}`,
  });
}

// Annotated photo — separate text from evidence.
{
  const img = IMG.launch, f = FEATURES.launch, s = 1.2, w = img.w * s, h = img.h * s, top = 156;
  const p = place(img, { x: M, y: top, w, h, subject: f.subject });
  const lx = colX(9) + 12, notes = [
    { at: f.mastR, label: 'Mast tops', text: 'the dashed line; both inner masts reach it' },
    { at: f.tip, label: 'Fairing tip', text: `${mastGap} px below the line in this frame` },
    { at: [f.towerR[0] + 30, 260], label: 'Outer tower', text: 'runs off the top of the frame' },
    { at: f.light, label: 'Floodlight', text: 'one of seven at the pad' },
  ];
  const ys = notes.map(n => p.at(n.at)[1]);
  const placed = notes.map((n, i) => ({ ...n, ty: Math.max(ys[i] - 14, i ? 0 : top) }));
  for (let i = 1; i < placed.length; i++) placed[i].ty = Math.max(placed[i].ty, placed[i - 1].ty + 64);   // keep labels apart
  const parts = placed.map(n => { const q = p.at(n.at); return line(q, [lx - 12, n.ty + 12], 'lead') + dot(q, 'mark'); });
  parts.push(line(p.at([f.mastL[0] - 18, f.mastL[1]]), p.at([f.mastR[0] + 18, f.mastL[1]]), 'level'));
  pages.push({
    id: 'image-8', title: 'Separate text from evidence: labels beside the photograph, leaders into it', className: 'im',
    sources: [{ type: 'image', file: 'assets/media/study-02.jpg', license: 'public domain' }],
    notes: `Purpose: when the photograph is the evidence, keep words off it. Labels sit in a column beside it; thin leaders run to points measured in image pixels and mapped through the same transform that places the photo.\nModify: add or move features in FEATURES.launch; the leaders and the level line recompute. Measured: the masts top out ${mastGap} px above the fairing tip in a ${img.h} px frame.\nInvariant: no label covers the subject; leaders are thin and end on a dot; equal height in the picture is described as such, not as equal height on the ground.\nStatic: already static.`,
    content: `<h1 class="im-head" data-region="title" style="${at(M, 52, 1080)}">In this view the two masts top out level with the fairing, ${mastGap} pixels apart in a ${img.h}-pixel frame</h1>
${p.html}
${overlay(parts, 'Leader lines from the labels to the features, and a level line across the mast tops')}
<div class="im-notes" data-region="support">${placed.map(n => `<p style="${at(lx, n.ty, 1216 - lx)}"><b>${n.label}</b>${n.text}</p>`).join('')}</div>
${source(credit(img, 'launch pad at dusk', p), 'Separate text from evidence', 'labels beside the photo, only leaders cross it')}`,
  });
}

// Picture desk — crop exploration.
{
  const img = IMG.launch, f = FEATURES.launch, w = 336, h = 420, gap = (1152 - 3 * w) / 2, top = 176;
  const options = [
    { key: 'A', name: 'Whole pad', why: 'both inner towers frame the vehicle', fit: {} },
    { key: 'B', name: 'Vehicle and masts', why: 'the masts at the edges, the lights below', fit: { scale: 1.3, focus: [f.tip[0], 268] }, ran: true },
    { key: 'C', name: 'Sky for type', why: 'room above the tip; the pad is cut', fit: { scale: 1.15, focus: [f.tip[0], 0] } },
  ].map((o, i) => ({ ...o, p: place(img, { x: M + i * (w + gap), y: top, w, h, subject: o.key === 'C' ? [f.vehicle[0], f.tip[1], f.vehicle[2], 200] : f.vehicle, ...o.fit }) }));
  pages.push({
    id: 'image-9', title: 'Crop exploration: three frames of one photograph, compared side by side', className: 'im',
    sources: [{ type: 'image', file: 'assets/media/study-02.jpg', license: 'public domain' }],
    notes: 'Purpose: choose a crop by comparing candidates in identical frames, not by nudging one frame until it looks fine. Each candidate states what it keeps and its scale.\nModify: edit the options (focus point and scale per frame); place() recomputes each crop and refuses anything past 1.3×.\nInvariant: equal frames, one picture, one decision marked; a crop exploration is not a registered scientific comparison (for that, keep frame and focus fixed).\nStatic: already static.',
    content: `<h1 class="im-head" data-region="title" style="${at(M, 52, 1080)}">Three crops of one photograph for the 4 : 5 slot on the contents page; the middle one ran</h1>
${options.map(o => o.p.html).join('\n')}
${options.map((o, i) => `<p class="im-option${o.ran ? ' im-option--ran' : ''}" style="${at(M + i * (w + gap), top + h + 14, w)}"><b>${o.key} · ${o.name}</b>${o.why}; ${times(o.p.scale)}${o.ran ? '<span>Ran</span>' : ''}</p>`).join('\n')}
${source(credit(img, 'launch pad at dusk', { scale: Math.max(...options.map(o => o.p.scale)) }).replace('shown at', 'shown at up to'), 'Crop exploration', 'one frame size, three focal decisions')}`,
  });
}

// Magazine order: cover, exhibition, design, café, science.
const ORDER = ['image-11', 'image-3', 'image-1', 'image-5', 'image-6', 'image-2', 'image-4', 'image-10', 'image-12', 'image-7', 'image-8', 'image-9'];

// ---------------------------------------------------------------- 7 · deck CSS
const css = `${frame}
${colors}
/* ---- Images: one magazine issue. Display serif for headlines, a sans for everything read at size. ---- */
.im { --ss-font-display: "Charter","Bitstream Charter","Iowan Old Style",Georgia,serif; --ss-font-sans: "Inter","Helvetica Neue",Arial,sans-serif; }
.im :is(h1, p, table, ol) { position: absolute; margin: 0; }
.im .ph, .im .crop { position: absolute; display: block; }
.im .crop { overflow: hidden; }
.im .crop > img { position: absolute; display: block; max-width: none; }
.im .im-ink { position: absolute; inset: 0; width: 1280px; height: 720px; overflow: visible; pointer-events: none; }
.im .im-ink line, .im .im-ink rect { fill: none; stroke: var(--ss-ink); stroke-width: 1.25; }
.im .im-ink .lead { stroke: var(--ss-ink); }
.im .im-ink .link { stroke: var(--ss-muted); }
.im .im-ink .loc { stroke: var(--ss-paper); stroke-width: 2; }
.im .im-ink .mark { fill: var(--ss-paper); stroke: var(--ss-ink); stroke-width: 1.5; }
.im .im-ink .level { stroke: var(--ss-paper); stroke-width: 1.5; stroke-dasharray: 6 5; }
.im .im-ink .dim { stroke: var(--ss-muted); }

/* Type scale: display 88 · headline 40 · lead 22 · body 18 · label 16 · source 15. */
.im .im-head { font: 400 40px/1.14 var(--ss-font-display); letter-spacing: -.01em; text-wrap: balance; }
.im .im-head--feature { font-size: 50px; line-height: 1.06; }
.im .im-display { font: 400 104px/.92 var(--ss-font-display); letter-spacing: -.02em; }
.im .im-lead { font: 400 22px/1.45 var(--ss-font-display); text-wrap: pretty; }
.im .im-body, .im .im-steps li, .im .im-notes p, .im .im-teasers p { font: 400 18px/1.5 var(--ss-font-sans); }
.im :is(.im-cap, .im-option, .im-figcap, .im-dimlabel, .im-byline) { font: 400 16px/1.4 var(--ss-font-sans); color: var(--ss-muted); }
.im .im-figcap { color: var(--ss-ink); font-size: 17px; }
.im .im-center { text-align: center; }
.im :is(.im-notes, .im-teasers, .im-option) b { display: block; font-weight: 600; color: var(--ss-ink); }
.im .im-option--ran b { color: var(--ss-accent); }
.im .im-option span { display: block; margin-top: 4px; font-weight: 600; color: var(--ss-accent); }

/* Tables read as tables: hairlines, tabular figures, no boxes. */
.im .im-spec, .im .im-menu { border-collapse: collapse; font: 400 18px/1.4 var(--ss-font-sans); font-variant-numeric: tabular-nums; }
.im :is(.im-spec, .im-menu) :is(th, td) { padding: 9px 0; border-top: 1px solid var(--ss-rule); text-align: left; vertical-align: baseline; }
.im :is(.im-spec, .im-menu) th { font-weight: 600; padding-right: 24px; }
.im .im-spec--num td, .im .im-menu td { text-align: right; }
.im .im-menu th span { display: block; font-weight: 400; color: var(--ss-muted); font-size: 16px; }
.im .im-steps { padding-left: 1.4em; display: grid; gap: 14px; }
.im .im-steps li::marker { font-weight: 600; color: var(--ss-accent); }

/* Museum label. */
.im .im-label-card { position: absolute; display: grid; gap: 4px; font: 400 18px/1.45 var(--ss-font-sans); }
.im .im-label-card p { position: static; }
.im .im-label-card hr { border: 0; border-top: 1px solid var(--ss-rule); margin: 14px 0 10px; width: 100%; }
.im .im-artist { font-weight: 600; font-size: 20px; }
.im .im-artist span { font-weight: 400; color: var(--ss-muted); margin-left: .35em; }
.im .im-work { font-family: var(--ss-font-display); font-size: 22px; }

/* Opener over the picture: type set on the empty wall. */
.im .im-dates { position: absolute; display: grid; gap: 2px; font: 400 20px/1.4 var(--ss-font-sans); }
.im .im-dates p { position: static; }
.im .im-dates p:first-child { font-weight: 600; }

/* Night pages take the photograph's own sky as paper, so its top edge disappears. */
.im.im-night { --ss-paper: ${L.topColor}; --ss-ink: #f4f1ea; --ss-muted: #b9bfcc; --ss-rule: #3a4762; background: var(--ss-paper); color: var(--ss-ink); }
.im .im-mast { font: 400 44px/1 var(--ss-font-display); letter-spacing: -.01em; }
.im .im-issue { font: 600 18px/1.3 var(--ss-font-sans); color: var(--ss-muted); }
.im .im-cover { font: 400 46px/1.08 var(--ss-font-display); letter-spacing: -.01em; color: #ffffff; text-wrap: balance; }
.im .im-teasers { position: absolute; display: grid; gap: 22px; }
.im .im-teasers p { position: static; color: var(--ss-muted); }
.im .im-teasers b { font: 400 26px/1.15 var(--ss-font-display); color: var(--ss-ink); margin-bottom: 4px; }
.im .im-foot { font: 400 15px/1.45 var(--ss-font-sans); color: var(--ss-muted); }
.im .im-foot b { font-weight: 600; color: var(--ss-ink); }
.im .st-source b { font-weight: 600; color: var(--ss-ink); }
`;

export default {
  mode: 'workshop', sample: true,
  title: 'Image handling: twelve pages from one magazine issue',
  language: 'en',
  css,
  slides: ORDER.map(id => pages.find(s => s.id === id)).map(s => ({ ...s, className: `st cs-${SYSTEM} ${s.className}`, exportPolicy: 'final' })),
};
