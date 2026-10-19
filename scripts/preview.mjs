#!/usr/bin/env node
/** Build a preview deck from catalog IDs or study module paths, for quick visual review.
 *
 *   node scripts/preview.mjs --ids dumbbell,forest-plot --out /tmp/preview.html
 *   node scripts/preview.mjs assets/svg/dumbbell.mjs assets/motion/bar-growth.mjs --out preview.html
 *   node scripts/preview.mjs --kind diagrams --out diagrams.html
 *   node scripts/preview.mjs my-study.mjs --css my-study.extra.css --out preview.html   (extra CSS, repeatable)
 *
 * Then: python scripts/contact-sheet.py preview.html --out sheet.png
 * The preview is a workshop deck (mode 'workshop'); it is not an audience deliverable.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, renderCraft } from './craft-core.mjs';

const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); return i < 0 ? undefined : args[i + 1]; };
const positional = args.filter((a, i) => !a.startsWith('--') && !['--ids', '--out', '--kind', '--title', '--css'].includes(args[i - 1]));
const extraCss = args.flatMap((a, i) => (a === '--css' && args[i + 1] ? [args[i + 1]] : []));
try {
  const out = opt('--out');
  if (!out || !out.endsWith('.html')) throw Error('preview.mjs [MODULE.mjs ...] [--ids a,b] [--kind diagrams] [--css FILE ...] --out FILE.html');
  const { resources } = JSON.parse(await fs.readFile(path.join(ROOT, 'assets/catalog.json'), 'utf8'));
  const picked = [];
  for (const id of (opt('--ids') || '').split(',').filter(Boolean)) {
    const r = resources.find(x => x.id === id);
    if (!r) throw Error(`Unknown catalog id: ${id}`);
    picked.push({ source: path.join(ROOT, r.source), css: path.join(ROOT, r.css) });
  }
  if (opt('--kind')) for (const r of resources.filter(x => x.kind === opt('--kind'))) picked.push({ source: path.join(ROOT, r.source), css: path.join(ROOT, r.css) });
  for (const p of positional) {
    const file = path.resolve(p), hit = resources.find(x => path.join(ROOT, x.source) === file);
    const lib = path.join(path.dirname(file), 'study.css'), pack = path.join(path.dirname(file), 'pack.css');
    const css = hit ? path.join(ROOT, hit.css) : await fs.access(lib).then(() => lib, () => fs.access(pack).then(() => pack, () => null));
    picked.push({ source: file, css });
  }
  if (!picked.length) throw Error('Nothing to preview: pass module paths, --ids or --kind.');
  const slides = [];
  for (const p of picked) slides.push((await import(pathToFileURL(p.source).href + `?t=${Date.now()}`)).default);
  let css = '';
  for (const file of [...new Set(picked.map(p => p.css).filter(Boolean))]) css += await fs.readFile(file, 'utf8') + '\n';
  for (const file of extraCss) css += await fs.readFile(path.resolve(file), 'utf8') + '\n';
  const html = await renderCraft({ title: opt('--title') || 'Study preview', language: 'en', mode: 'workshop', sample: true, css, slides });
  await fs.mkdir(path.dirname(path.resolve(out)), { recursive: true });
  await fs.writeFile(out, html);
  console.log(JSON.stringify({ output: path.resolve(out), slides: slides.length, bytes: html.length }));
} catch (e) { console.error('Preview:', e.message); process.exitCode = 1; }
