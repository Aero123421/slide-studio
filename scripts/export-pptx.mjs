#!/usr/bin/env node
/** Two honest export routes:
 * editable: embedded scene -> native PowerPoint objects. Text boxes keep the measured line breaks as
 *   soft breaks (Shift+Enter), exact line spacing and the deck language; rectangles, lines and
 *   arrows are shapes; chart lines and donut rings are freeform paths; tables are real tables.
 *   Only image/SVG nodes stay pictures.
 * fidelity: rendered PNG pages -> full-slide pictures. No editability claim.
 * CSS animation does not become PowerPoint animation in either route.
 */
import fs from 'node:fs/promises'; import path from 'node:path'; import { dependency } from './deps.mjs';
const args = process.argv.slice(2), input = args[0], output = args[1];
const val = k => { const i = args.indexOf(k); return i < 0 ? undefined : args[i + 1]; };
const mode = val('--mode') || 'editable', adapter = val('--adapter') || 'pptxgenjs';
const PX = 96, pt = v => v * 0.75, hex = c => String(c).replace('#', '').toUpperCase();
const LANG = { ja: 'ja-JP', en: 'en-US', zh: 'zh-CN', ko: 'ko-KR', fr: 'fr-FR', de: 'de-DE', es: 'es-ES' };
const firstFamily = f => String(f || 'Arial').split(',')[0].trim();
let scene;

try {
  if (!input || !output) throw Error('Usage: node export-pptx.mjs deck.html deck.pptx [--adapter artifact|pptxgenjs] [--mode editable|fidelity] [--png-dir DIR] [--force]');
  if (!['editable', 'fidelity'].includes(mode)) throw Error('Unknown export mode'); if (!['artifact', 'pptxgenjs'].includes(adapter)) throw Error('Unknown adapter');
  try { await fs.access(output); if (!args.includes('--force')) throw Error('Output exists; use --force only to replace this file.'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const inputText = await fs.readFile(input, 'utf8');
  if (input.endsWith('.json')) scene = JSON.parse(inputText);
  else { const match = inputText.match(/<script type="application\/json" id="slide-studio-scene">([\s\S]*?)<\/script>/); if (match) scene = JSON.parse(match[1]); }
  if (mode === 'editable' && !scene) throw Error('Editable export requires Slide Studio generated HTML or .scene.json. Use fidelity mode for arbitrary HTML.');
  let pictures = [];
  if (mode === 'fidelity') {
    const dir = val('--png-dir'); if (!dir) throw Error('fidelity mode needs --png-dir from render.mjs');
    pictures = (await fs.readdir(dir)).filter(n => /^slide-\d+\.png$/.test(n)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0])).map(n => path.resolve(dir, n));
    if (!pictures.length) throw Error('No slide PNGs'); if (scene && pictures.length !== scene.slides.length) throw Error('PNG count does not match scene');
  }
  const slides = mode === 'editable' ? scene.slides : pictures.map((pic, i) => ({ title: scene?.slides[i]?.title || 'Slide ' + (i + 1), paper: '#FFFFFF', notes: scene?.slides[i]?.notes || '', sources: scene?.slides[i]?.sources || [], elements: [{ type: 'image', src: pic, x: 0, y: 0, w: 1280, h: 720, alt: 'Full-slide rendering' }] }));
  const ja = /^ja\b/.test(scene?.language || ''), lang = LANG[String(scene?.language || 'en').split('-')[0]] || scene?.language || 'en-US';
  const note=s=>s.notes+(s.sources?.length?'\n\n'+(ja?'出所':'Sources')+'\n'+s.sources.map(x=>typeof x==='string'?x:[x.title,x.url||x.file].filter(Boolean).join(' — ')).join('\n'):'');// Export facts go to stdout, never into the presenter's notes.
  await fs.mkdir(path.dirname(path.resolve(output)), { recursive: true });
  if (adapter === 'artifact') await exportArtifact(slides, note);
  else await exportPptxgenjs(slides, note, lang);
  console.log(JSON.stringify({ output: path.resolve(output), slides: slides.length, adapter, mode, editable: mode === 'editable' ? 'text boxes, shapes, freeform chart paths and tables; images/SVG remain pictures' : 'none (one picture per slide)', animations: 'not preserved' }, null, 2));
} catch (e) { console.error('PPTX:', e.message); process.exitCode = 1; }

// ------------------------------------------------------------------ pptxgenjs (default, native)

async function exportPptxgenjs(slides, note, lang) {
  const mod = await dependency('pptxgenjs'); const Pptx = mod.default; const deck = new Pptx();
  deck.defineLayout({ name: 'STUDIO', width: 1280 / PX, height: 720 / PX }); deck.layout = 'STUDIO';
  deck.title = scene?.title || 'HTML presentation'; deck.author = ''; deck.subject = 'Created with Slide Studio';
  // Theme fonts follow the deck, so text a colleague adds in PowerPoint matches it.
  if (scene?.theme?.font) deck.theme = { headFontFace: firstFamily(scene.theme.headingFont || scene.theme.font), bodyFontFace: firstFamily(scene.theme.font) };
  // One layout with a real title placeholder: outline view, accessibility checks and screen
  // readers see each slide's title. The slide sets its own position and formatting.
  deck.defineSlideMaster({ title: 'STUDIO', background: { color: 'FFFFFF' }, objects: [{ placeholder: { options: { name: 'title', type: 'title', x: 64 / PX, y: 44 / PX, w: 1054 / PX, h: 112 / PX, valign: 'top', margin: 0 }, text: '' } }] });
  const titles = [];
  for (const s of slides) {
    const slide = mode === 'editable' ? deck.addSlide({ masterName: 'STUDIO' }) : deck.addSlide(); slide.background = { color: hex(s.paper) }; slide.addNotes(note(s));
    const title = s.elements.find(n => n.type === 'text' && n.role === 'title');
    titles.push(title ? textBox(title) : null);
    for (const n of s.elements) addNode(deck, slide, n, s, lang, n === title);
  }
  let bytes = await deck.write({ outputType: 'nodebuffer' });
  bytes = await tidy(bytes, titles);
  await fs.writeFile(output, bytes);
}

/** A text box a little wider than its measured block, on the side away from its alignment, so a
 * font with wider Latin glyphs than the measurement does not re-wrap a line. The box paints nothing. */
function textBox(n) {
  const slack = Math.min(40, Math.max(10, n.w * 0.06));
  let x = n.x, w = n.w;
  if (n.align === 'right') { const d = Math.min(slack, x); x -= d; w += d; }
  else if (n.align === 'center') { const d = Math.min(slack / 2, x, Math.max(0, 1280 - x - w)); x -= d; w += 2 * d; }
  else w += Math.max(0, Math.min(slack, 1280 - x - w));
  return { x: x / PX, y: n.y / PX, w: Math.max(w, 1) / PX, h: Math.max(n.h, n.size * n.lineHeight) / PX };
}
/** Measured lines become soft line breaks inside one paragraph; blank-line paragraphs become real
 * paragraphs with `paraGap` space before them. Every run states its own size. */
function textRuns(n, base) {
  if (n.runs?.length) return n.runs.map(r => ({ text: r.text, options: { ...base, fontFace: firstFamily(n.font), fontSize: pt(r.size), bold: r.weight >= 600, color: hex(r.color), ...(r.tracking ? { charSpacing: pt(r.tracking * r.size) } : {}) } }));
  const paras = n.paraGap ? n.text.split('\n\n') : [n.text];
  const runs = [];
  paras.forEach((p, pi) => p.split('\n').forEach((line, li, all) => runs.push({
    text: line,
    options: { ...base, softBreakBefore: li > 0, ...(li === 0 && pi > 0 ? { paraSpaceBefore: pt(n.paraGap) } : {}), ...(li === all.length - 1 && pi < paras.length - 1 ? { breakLine: true } : {}) },
  })));
  return runs;
}
function addNode(deck, slide, n, s, lang, isTitle = false) {
  const name = (n.name || (n.role === 'title' ? 'Title' : `${n.role || n.type} ${n.id}`)).slice(0, 80);
  if (n.type === 'text') {
    const lineSpacing = pt(n.size * n.lineHeight);
    const base = { fontSize: pt(n.size), bold: n.weight >= 600, color: hex(n.color), lang, lineSpacing, ...(n.tracking ? { charSpacing: pt(n.tracking * n.size) } : {}), ...(n.italic ? { italic: true } : {}) };
    slide.addText(textRuns(n, base), { ...textBox(n), fontFace: firstFamily(n.font), align: n.align, valign: 'top', margin: 0, lineSpacing, paraSpaceAfter: 0, objectName: name, lang, ...(isTitle ? { placeholder: 'title' } : {}) });
    return;
  }
  if (n.type === 'svg' || n.type === 'image') {
    const source = n.src.startsWith('data:') ? { data: n.src } : { path: n.src };
    slide.addImage({ ...source, x: n.x / PX, y: n.y / PX, w: n.w / PX, h: n.h / PX, altText: n.alt || s.title, sizing: { type: n.fit === 'cover' ? 'cover' : 'contain', w: n.w / PX, h: n.h / PX }, objectName: name });
    return;
  }
  if (n.type === 'table') { addTable(slide, n, lang, name); return; }
  const line = n.stroke && n.stroke !== 'none' && n.strokeWidth ? { color: hex(n.stroke), width: pt(n.strokeWidth), ...(n.dash ? { dashType: 'dash' } : {}) } : { type: 'none' };
  const fill = n.fill && n.fill !== 'none' ? { color: hex(n.fill) } : undefined;
  if (n.type === 'line') {
    const x1 = n.x1 ?? n.x, y1 = n.y1 ?? n.y, x2 = n.x2 ?? n.x + n.w, y2 = n.y2 ?? n.y + n.h;
    if (Math.hypot(x2 - x1, y2 - y1) === 0) return;
    // A line shape runs from its box's top-left to bottom-right; flips set the real direction so
    // the arrowhead (tail end) lands on (x2, y2).
    slide.addShape(deck.ShapeType.line, {
      x: Math.min(x1, x2) / PX, y: Math.min(y1, y2) / PX, w: Math.abs(x2 - x1) / PX, h: Math.abs(y2 - y1) / PX, flipH: x2 < x1, flipV: y2 < y1,
      line: { ...line, ...(['end', 'both'].includes(n.arrow) ? { endArrowType: 'triangle' } : {}), ...(['start', 'both'].includes(n.arrow) ? { beginArrowType: 'triangle' } : {}) }, objectName: name,
    });
    return;
  }
  if (n.type === 'path') {
    const w = Math.max(n.w, 1), h = Math.max(n.h, 1), rel = (x, y) => ({ x: (x - n.x) / PX, y: (y - n.y) / PX });
    const points = n.d.map((c, i) => {
      if (c[0] === 'M') return { ...rel(c[1], c[2]), moveTo: true };
      if (c[0] === 'L') return rel(c[1], c[2]);
      if (c[0] === 'A') { const [, , , r, a0, a1] = c; return { x: 0, y: 0, curve: { type: 'arc', wR: r / PX, hR: r / PX, stAng: ((a0 % 360) + 360) % 360, swAng: a1 - a0 } }; }
      return { close: true, i };
    });
    slide.addShape(deck.ShapeType.custGeom, { x: n.x / PX, y: n.y / PX, w: w / PX, h: h / PX, points, fill, line, objectName: name });
    return;
  }
  const shape = n.type === 'ellipse' ? deck.ShapeType.ellipse : n.radius ? deck.ShapeType.roundRect : deck.ShapeType.rect;
  slide.addShape(shape, { x: n.x / PX, y: n.y / PX, w: n.w / PX, h: n.h / PX, fill, line, ...(n.radius && n.type !== 'ellipse' ? { rectRadius: n.radius / PX } : {}), objectName: name });
}
/** A real table: column widths and row heights from the scene, rules as cell borders. */
function addTable(slide, n, lang, name) {
  const none = { type: 'none' };
  const rows = n.rows.map(r => r.cells.map(c => ({
    text: c.text.split('\n').map((line, li) => ({ text: line, options: { fontSize: pt(c.size), bold: c.weight >= 600, color: hex(c.color), lang, softBreakBefore: li > 0 } })),
    options: {
      fontFace: firstFamily(n.font), align: c.align, valign: r.valign === 'bottom' ? 'bottom' : 'middle', lineSpacing: pt(c.size * c.lineHeight),
      margin: [0, c.pad[1] / PX, r.header ? 10 / PX : 0, c.pad[0] / PX], ...(r.fill ? { fill: { color: hex(r.fill) } } : {}),
      border: [none, none, r.rule ? { type: 'solid', pt: pt(r.rule.width), color: hex(r.rule.color) } : none, none],
    },
  })));
  slide.addTable(rows, { x: n.x / PX, y: n.y / PX, w: n.w / PX, colW: n.cols.map(w => w / PX), rowH: n.rows.map(r => r.h / PX), objectName: name });
}

/** Repairs on the generated XML: one <a:pPr> per paragraph (pptxgenjs repeats it per run), an
 * explicit "no line" for shapes without an outline, arrowheads large enough to read, and each
 * title placeholder back at its own position (pptxgenjs copies the layout's). */
async function tidy(bytes, titles = []) {
  let JSZip;
  try { const m = await dependency('jszip'); JSZip = m.loadAsync ? m : m.default; } catch { return bytes; }
  const zip = await JSZip.loadAsync(bytes);
  for (const file of Object.keys(zip.files).filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))) {
    let xml = await zip.file(file).async('string');
    xml = xml.replace(/<a:p>([\s\S]*?)<\/a:p>/g, (m, inner) => { let seen = false; return '<a:p>' + inner.replace(/<a:pPr\b[^>]*?(?:\/>|>[\s\S]*?<\/a:pPr>)/g, p => (seen ? '' : ((seen = true), p))) + '</a:p>'; });
    xml = xml.replace(/<a:ln>\s*<\/a:ln>/g, '<a:ln><a:noFill/></a:ln>');
    xml = xml.replace(/<a:(head|tail)End type="triangle"\/>/g, '<a:$1End type="triangle" w="lg" len="lg"/>');
    const box = titles[Number(file.match(/slide(\d+)\.xml$/)[1]) - 1];
    if (box) {
      const emu = v => Math.round(v * 914400);
      xml = xml.replace(/(<p:sp>(?:(?!<\/p:sp>)[\s\S])*?type="title"[\s\S]*?)<a:xfrm>[\s\S]*?<\/a:xfrm>/, `$1<a:xfrm><a:off x="${emu(box.x)}" y="${emu(box.y)}"/><a:ext cx="${emu(box.w)}" cy="${emu(box.h)}"/></a:xfrm>`);
    }
    zip.file(file, xml);
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

// ------------------------------------------------------------------ optional artifact adapter

async function exportArtifact(slides, note) {
  const { Presentation, PresentationFile } = await dependency('@oai/artifact-tool'); const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });
  const box = (x, y, w, h) => ({ left: x, top: y, width: Math.max(w, 0.01), height: Math.max(h, 0.01) });
  const text = (slide, n, body, extra = {}) => {
    const sh = slide.shapes.add({ name: n.id, geometry: 'textbox', position: box(n.x, n.y, n.w, n.h), fill: 'none', line: { fill: 'none', width: 0 } });
    sh.text = body;
    sh.text.style = { fontSize: n.size, typeface: firstFamily(n.font), color: n.color, bold: n.weight >= 600, alignment: n.align, verticalAlignment: 'top', insets: { top: 0, right: 0, bottom: 0, left: 0 }, lineSpacing: n.lineHeight, ...extra };
  };
  const segment = (slide, id, x1, y1, x2, y2, stroke, width) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len > 0) slide.shapes.add({ name: id, geometry: 'line', position: { left: (x1 + x2 - len) / 2, top: (y1 + y2) / 2, width: len, height: 0.01, rotation: (Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI + 360) % 360 }, fill: 'none', line: { fill: stroke, width } });
  };
  for (const s of slides) {
    const slide = deck.slides.add(); slide.background.fill = s.paper; slide.speakerNotes.textFrame.setText(note(s));
    for (const n of s.elements) {
      if (n.type === 'text') text(slide, n, n.runs ? n.runs.map(r => r.text).join('') : n.text.replace(/\n\n/g, '\n'));
      else if (n.type === 'image' || n.type === 'svg') {
        const position = box(n.x, n.y, n.w, n.h);
        if (n.svg) slide.images.add({ svg: n.svg, alt: n.alt || s.title, position, fit: n.fit || 'contain' });
        else if (n.src.startsWith('data:')) { const [head, data] = n.src.split(','); slide.images.add({ blob: new Uint8Array(Buffer.from(data, 'base64')), contentType: head.slice(5).split(';')[0], position, alt: n.alt || '', fit: n.fit || 'contain' }); }
        else slide.images.add({ blob: new Uint8Array(await fs.readFile(n.src)), contentType: 'image/png', position, alt: n.alt || '', fit: 'contain' });
      } else if (n.type === 'line') segment(slide, n.id, n.x1 ?? n.x, n.y1 ?? n.y, n.x2 ?? n.x + n.w, n.y2 ?? n.y + n.h, n.stroke, n.strokeWidth);
      else if (n.type === 'table') {
        // This adapter has no table object: cells become text boxes, rules become lines.
        let y = n.y;
        for (const r of n.rows) {
          let x = n.x;
          if (r.fill) slide.shapes.add({ name: n.id + '-band', geometry: 'rect', position: box(n.x, y, n.w, r.h), fill: r.fill, line: { fill: 'none', width: 0 } });
          r.cells.forEach((c, j) => { const lines = c.text.split('\n').length, th = lines * c.size * c.lineHeight; text(slide, { ...n, id: `${n.id}-${j}`, x: x + c.pad[0], y: r.valign === 'bottom' ? y + r.h - th - 10 : y + (r.h - th) / 2, w: n.cols[j] - c.pad[0] - c.pad[1], h: th, size: c.size, color: c.color, weight: c.weight, align: c.align, lineHeight: c.lineHeight }, c.text); x += n.cols[j]; });
          y += r.h;
          if (r.rule) segment(slide, n.id + '-rule', n.x, y, n.x + n.w, y, r.rule.color, r.rule.width);
        }
      } else if (n.type === 'path') {
        // No freeform geometry here: stroked paths become segments, filled rings an SVG picture.
        if (n.fill && n.fill !== 'none') {
          const { svgPath } = await import('./html.mjs');
          slide.images.add({ svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n.w} ${n.h}"><path d="${svgPath(n.d, n.x, n.y)}" fill="${n.fill}"/></svg>`, alt: n.name || '', position: box(n.x, n.y, n.w, n.h), fit: 'contain' });
        } else {
          let prev = null;
          for (const c of n.d) { if (c[0] === 'M') prev = [c[1], c[2]]; else if (c[0] === 'L' && prev) { segment(slide, n.id, prev[0], prev[1], c[1], c[2], n.stroke, n.strokeWidth); prev = [c[1], c[2]]; } }
        }
      } else slide.shapes.add({ name: n.id, geometry: n.type === 'ellipse' ? 'ellipse' : n.radius ? 'roundRect' : 'rect', position: box(n.x, n.y, n.w, n.h), fill: n.fill, line: { fill: n.stroke, width: n.strokeWidth }, ...(n.radius ? { borderRadius: n.radius } : {}) });
    }
  }
  const pptx = await PresentationFile.exportPptx(deck); await pptx.save(output);
  if (val('--preview-dir')) { const dir = val('--preview-dir'); await fs.mkdir(dir, { recursive: true }); for (const [i, s] of deck.slides.items.entries()) { const b = await deck.export({ slide: s, format: 'png', scale: 1 }); await fs.writeFile(path.join(dir, `slide-${String(i + 1).padStart(2, '0')}.png`), new Uint8Array(await b.arrayBuffer())); } }
}
