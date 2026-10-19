#!/usr/bin/env node
/** Build gallery/index.html: a searchable visual index of every catalog study and the
 * worked example decks. Thumbnails come from `python scripts/build-thumbs.py`.
 *
 *   node scripts/build-index.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './craft-core.mjs';

const resources = JSON.parse(await fs.readFile(path.join(ROOT, 'assets/catalog.json'), 'utf8')).resources;

// Display names of the template packs (folder → name shown above the pack's pages).
const PACKS = {
  'tpl-keynote': 'Conference keynote', 'tpl-launch': 'Product launch', 'tpl-pitch': 'Seed-round pitch',
  'tpl-editorial': 'Magazine essay', 'tpl-architecture': 'Incident review', 'tpl-ml-report': 'Model evaluation report',
  'tpl-qbr': '四半期業績レビュー', 'tpl-project-status': 'プロジェクト月次報告', 'tpl-strategy': '戦略提案',
  'tpl-impact-report': '年次活動報告', 'tpl-research-ja': '学会発表', 'tpl-lecture': '講義',
};

// Worked example decks (gallery/<id>.html), with the thumbnail deck-<id>.webp.
const EXAMPLES = [
  { id: 'research', title: 'Research narrative', purpose: 'A complete research talk from question to limits, with one interaction fed by the same data as the static pages.', language: 'en' },
  { id: 'from-scratch', title: 'Deriving a deck from a brief', purpose: 'A short deck and the README that walks through brief → claims → evidence → composition.', language: 'en' },
  { id: 'constraint-layout', title: 'Layout computed from measured text', purpose: 'A diagram whose positions are derived from label sizes, so longer labels reflow without breaking dependencies.', language: 'en' },
  { id: 'languages', title: 'One page in ten languages', purpose: 'The same page re-composed per script: CJK wrapping, RTL, Devanagari, German compounds, locale number formats.', language: 'en' },
  { id: 'images', title: 'Image handling', purpose: 'Twelve ways to place an image honestly: contain, crop, bleed, inset, pairs, cutouts, overlays and full scientific figures.', language: 'en' },
  { id: 'repair-lab', title: 'Repair lab (before/after)', purpose: 'Twelve named failures and their repairs, each pair about the same content.', language: 'ja' },
  { id: 'period-comparison', title: 'One condition, one comparison', purpose: 'An interactive period selector where headline, marks, totals and condition always agree.', language: 'ja' },
  { id: 'transfer-talk', title: 'A three-page explanation', purpose: 'A short original talk that applies the repairs to new content.', language: 'ja' },
  { id: 'brand', title: 'Brand proof', purpose: 'A captured company brand applied to six standard pages, driven entirely by brand tokens.', language: 'en' },
].map(e => ({ ...e, href: `${e.id}.html` }));

// Language of each study, read from its module (studies declare language:'ja' when Japanese).
const rows = [];
for (const r of resources) {
  let language = 'en';
  try {
    const mod = await import(pathToFileURL(path.join(ROOT, r.source)).href);
    language = String(mod.default?.language || 'en').startsWith('ja') ? 'ja' : 'en';
  } catch { /* an unreadable module still gets listed */ }
  const pack = PACKS[(r.source.match(/templates\/(tpl-[^/]+)\//) || [])[1]];
  rows.push({ id: r.id, kind: r.kind, title: r.title, purpose: r.purpose, source: r.source, gallery: r.gallery, tags: r.tags || [], language, ...(pack ? { pack } : {}) });
}

let html = await fs.readFile(path.join(ROOT, 'assets/gallery-index.html'), 'utf8');
for (const kind of ['templates', 'diagrams', 'motion', 'interactions', 'compositions']) html = html.replaceAll(`{{COUNT_${kind}}}`, String(resources.filter(r => r.kind === kind).length));
const colorSystems = (await fs.readdir(path.join(ROOT, 'assets/color-systems'))).filter(f => f.endsWith('.json')).length;
html = html.replaceAll('{{COUNT_colorsystems}}', String(colorSystems))
  .replaceAll('{{COUNT_all}}', String(resources.length))
  .replaceAll('{{COUNT_examples}}', String(EXAMPLES.length));
const json = v => JSON.stringify(v).replace(/</g, '\\u003c');
html = html.replace('{{CATALOG}}', json(rows)).replace('{{EXAMPLES}}', json(EXAMPLES));
await fs.writeFile(path.join(ROOT, 'gallery/index.html'), html);
console.log('index', rows.length, 'studies,', EXAMPLES.length, 'example decks');
