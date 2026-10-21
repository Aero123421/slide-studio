#!/usr/bin/env node
/** Purpose-based retrieval and portable extraction of library studies.
 *
 *   catalog.mjs search "uncertainty comparison" [--kind diagrams] [--limit 6]
 *   catalog.mjs list [--kind motion]
 *   catalog.mjs show ID
 *   catalog.mjs take ID NEW_DIRECTORY
 *
 * `take` copies the study's SOURCE (data + code, not a rendered snapshot), the
 * runtime modules it imports, its CSS (only the color system it uses) and its
 * media into a new directory with a draft deck.mjs. Change the data and copy;
 * the figures recompute. It never overwrites an existing directory.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './craft-core.mjs';

const args = process.argv.slice(2), cmd = args.shift();
const opt = k => { const i = args.indexOf(k); return i < 0 ? undefined : args[i + 1]; };
const positional = args.filter((a, i) => !a.startsWith('--') && !['--kind', '--limit'].includes(args[i - 1]));

// Query expansion so Japanese and loose wording reach English titles/tags.
const SYNONYMS = {
  'テンプレート': 'templates', 'ひな形': 'templates', '比較': 'comparison compare paired', '図': 'diagram', '図解': 'diagram flow',
  '動き': 'motion', 'アニメーション': 'motion animation', 'アニメ': 'motion', '写真': 'image photo crop', '画像': 'image photo',
  '研究': 'research study', '幾何学': 'geometric geometry pattern', '操作': 'interactions', '動画': 'video', '音声': 'audio',
  'フォント': 'type typography', '研究発表': 'research methods results', '不確実性': 'uncertainty interval', '分布': 'distribution',
  '推移': 'trend line time', '時系列': 'time series line', '割合': 'share part whole', '内訳': 'part whole stacked waterfall',
  '流れ': 'flow process', 'フロー': 'flow process', '工程': 'process pipeline', '組織': 'hierarchy tree', '因果': 'causal',
  '地図': 'map', '表': 'table', 'グラフ': 'chart', '散布図': 'scatter', '棒グラフ': 'bar', '折れ線': 'line', '円グラフ': 'donut',
  '表紙': 'cover opener', '章扉': 'chapter divider section', 'まとめ': 'summary closing', '数字': 'number kpi', '強調': 'emphasis highlight',
  'gráfico': 'chart plot', 'animation': 'motion', 'chart': 'chart diagram', 'graph': 'chart diagram network',
};

async function catalog() { return JSON.parse(await fs.readFile(path.join(ROOT, 'assets/catalog.json'), 'utf8')).resources; }

function search(rows, query) {
  let q = String(query || '').trim();
  if (!q) throw Error('Search by communication purpose, e.g. "paired change", "uncertainty", "因果".');
  for (const [a, b] of Object.entries(SYNONYMS)) q = q.replaceAll(a, ` ${b} `);
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  return rows.map(r => {
    const hay = { id: r.id.toLowerCase(), title: r.title.toLowerCase(), purpose: (r.purpose || '').toLowerCase(), tags: (r.tags || []).join(' ').toLowerCase(), kind: r.kind };
    const score = terms.reduce((n, t) => n + (hay.id.includes(t) ? 3 : 0) + (hay.title.includes(t) ? 3 : 0) + (hay.tags.includes(t) ? 2 : 0) + (hay.purpose.includes(t) ? 1 : 0) + (hay.kind.includes(t) ? 1 : 0), 0);
    return { r, score };
  }).filter(x => x.score).sort((a, b) => b.score - a.score || a.r.id.localeCompare(b.r.id)).map(x => x.r);
}

/** Relative imports of a module, transitively, within the skill root. */
async function dependencies(file, seen = new Set()) {
  if (seen.has(file)) return seen;
  seen.add(file);
  const src = await fs.readFile(file, 'utf8');
  for (const m of src.matchAll(/(?:import|export)\s[^'"]*?from\s*['"](\.{1,2}\/[^'"]+)['"]/g)) {
    const dep = path.resolve(path.dirname(file), m[1]);
    if (dep.startsWith(ROOT + path.sep)) await dependencies(dep, seen);
  }
  return seen;
}

/** Library CSS minus color systems the study does not use. */
async function trimmedCss(cssFile, source) {
  const css = await fs.readFile(cssFile, 'utf8');
  if (!css.includes('.cs-')) return css;
  const used = new Set([...source.matchAll(/\bcs-([a-z0-9-]+)/g)].map(m => m[1]));
  return css.replace(/\/\*[^*\n]*\*\/\n\.cs-([a-z0-9-]+)\{[^}]*\}\n?/g, (block, id) => (used.has(id) ? block : ''));
}

try {
  const rows = await catalog();
  if (cmd === 'show') {
    const r = rows.find(x => x.id === positional[0]);
    if (!r) throw Error('Unknown ID. Use search or list.');
    console.log(JSON.stringify(r, null, 2));
  } else if (cmd === 'take' && /^tpl-[a-z0-9-]+$/.test(positional[0] || '') && rows.some(x => x.source.startsWith(`assets/templates/${positional[0]}/`))) {
    // A whole template pack: every page in order, one pack.css, one draft deck.
    const pack = positional[0], dest = positional[1];
    if (!dest) throw Error('take PACK_ID NEW_DIRECTORY');
    const pages = rows.filter(x => x.source.startsWith(`assets/templates/${pack}/`)).sort((a, b) => a.source.localeCompare(b.source));
    const out = path.resolve(dest);
    await fs.mkdir(out, { recursive: false });
    const copy = async (abs, text) => {
      const rel = path.relative(ROOT, abs), to = path.join(out, rel);
      await fs.mkdir(path.dirname(to), { recursive: true });
      if (text !== undefined) await fs.writeFile(to, text); else await fs.copyFile(abs, to);
      return rel;
    };
    const deps = new Set();
    for (const r of pages) for (const d of await dependencies(path.join(ROOT, r.source))) deps.add(d);
    const copied = [];
    for (const dep of deps) copied.push(await copy(dep));
    const sourceText = (await Promise.all([...deps].map(d => fs.readFile(d, 'utf8')))).join('\n');
    const cssRel = await copy(path.join(ROOT, pages[0].css));
    for (const m of new Set([...sourceText.matchAll(/\{\{asset:([^}]+)\}\}/g)].map(x => x[1]))) copied.push(await copy(path.join(ROOT, m)));
    const first = (await import(pathToFileURL(path.join(ROOT, pages[0].source)).href)).default;
    const version = (await fs.readFile(path.join(ROOT, 'VERSION'), 'utf8')).trim();
    await fs.writeFile(path.join(out, 'deck.mjs'), `// Draft deck from the "${pack}" template pack (Slide Studio ${version}).
// Replace every page's data, names and copy (each module keeps its data at the top),
// remove \`study: true\` from a page once it is yours, and keep the illustrative-data
// lines until real sources replace them. Reorder, drop or duplicate pages freely.
// Build: node <skill>/scripts/craft.mjs build deck.mjs --out deck.html --allow-draft
import fs from 'node:fs/promises';
${pages.map((r, i) => `import p${i + 1} from './${r.source}';`).join('\n')}
export default {
  title: ${JSON.stringify(pack)}, language: ${JSON.stringify(first.language || 'en')}, draft: true, sample: true,
  css: await fs.readFile(new URL('./${cssRel}', import.meta.url), 'utf8'),
  slides: [${pages.map((_, i) => `p${i + 1}`).join(', ')}],
};
`);
    for (const notice of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) await fs.copyFile(path.join(ROOT, notice), path.join(out, notice));
    await fs.writeFile(path.join(out, 'PROVENANCE.md'), `# Source template pack\n\n${pack} — ${pages.length} pages\n\n${pages.map(r => `- ${r.id}: ${r.title}`).join('\n')}\n\nCopied files: ${[...copied, cssRel].map(f => '`' + f + '`').join(', ')}\n\nOrigin: Slide Studio template source (MIT); photographs keep their own licenses (THIRD_PARTY_NOTICES.md). Record your changes here.\n`);
    console.log(JSON.stringify({ project: out, pack, pages: pages.map(r => r.id), next: 'Edit the page modules, then build deck.mjs with craft.mjs --allow-draft.' }, null, 2));
  } else if (cmd === 'take') {
    const r = rows.find(x => x.id === positional[0]), dest = positional[1];
    if (!r || !dest) throw Error('take RESOURCE_ID NEW_DIRECTORY (or take tpl-<pack> NEW_DIRECTORY for a whole template pack)');
    const out = path.resolve(dest);
    await fs.mkdir(out, { recursive: false });
    const sourceFile = path.join(ROOT, r.source);
    const deps = [...await dependencies(sourceFile)];
    const copy = async (abs, text) => {
      const rel = path.relative(ROOT, abs), to = path.join(out, rel);
      await fs.mkdir(path.dirname(to), { recursive: true });
      if (text !== undefined) await fs.writeFile(to, text); else await fs.copyFile(abs, to);
      return rel;
    };
    const copied = [];
    for (const dep of deps) copied.push(await copy(dep));
    const sourceText = (await Promise.all(deps.map(d => fs.readFile(d, 'utf8')))).join('\n');
    const cssRel = await copy(path.join(ROOT, r.css), await trimmedCss(path.join(ROOT, r.css), sourceText));
    for (const m of new Set([...sourceText.matchAll(/\{\{asset:([^}]+)\}\}/g)].map(x => x[1]))) copied.push(await copy(path.join(ROOT, m)));
    const svgTwin = sourceFile.replace(/\.mjs$/, '.svg');
    if (r.kind === 'diagrams' && await fs.access(svgTwin).then(() => true, () => false)) copied.push(await copy(svgTwin));
    const mod = (await import(pathToFileURL(sourceFile).href)).default;
    await fs.writeFile(path.join(out, 'deck.mjs'), `// Draft deck derived from the "${r.id}" study (Slide Studio ${(await fs.readFile(path.join(ROOT, 'VERSION'), 'utf8')).trim()}).
// 1. Edit ${r.source}: replace the data, headline, labels and notes for your subject.
// 2. Remove \`study: true\` from that module once it is yours; keep the illustrative-data
//    line until real sources replace the data.
// 3. Build: node <skill>/scripts/craft.mjs build deck.mjs --out deck.html --allow-draft
import fs from 'node:fs/promises';
import slide from './${r.source}';
export default {
  title: ${JSON.stringify(r.title)}, language: ${JSON.stringify(mod.language || 'en')}, draft: true, sample: true,
  css: await fs.readFile(new URL('./${cssRel}', import.meta.url), 'utf8'),
  slides: [slide],
};
`);
    for (const notice of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) await fs.copyFile(path.join(ROOT, notice), path.join(out, notice));
    await fs.writeFile(path.join(out, 'PROVENANCE.md'), `# Source study\n\n${r.id} — ${r.title}\n\n${r.purpose || ''}\n\n${(r.notes || '').replace(/\n/g, '\n\n')}\n\nCopied files: ${[...copied, cssRel].map(f => '`' + f + '`').join(', ')}\n\nOrigin: Slide Studio study source (MIT); photographs keep their own licenses (THIRD_PARTY_NOTICES.md). Record your changes here.\n`);
    console.log(JSON.stringify({ project: out, source: r.source, copied: [...copied, cssRel], next: `Edit ${r.source}, then build deck.mjs with craft.mjs --allow-draft.` }, null, 2));
  } else if (cmd === 'search' || cmd === 'list') {
    let list = rows;
    const kind = opt('--kind');
    if (kind) list = list.filter(r => r.kind === kind);
    const limit = Number(opt('--limit') || (cmd === 'list' ? 250 : 6));
    if (!Number.isInteger(limit) || limit < 1 || limit > 300) throw Error('--limit must be 1..300');
    if (cmd === 'search') list = search(list, positional.join(' '));
    console.log(JSON.stringify({ matches: list.length, resources: list.slice(0, limit).map(({ id, kind, title, purpose, source, gallery }) => ({ id, kind, title, purpose, source, gallery })), next: 'show ID for modification notes; take ID NEW_DIRECTORY for an editable copy.' }, null, 2));
  } else {
    console.log('catalog.mjs search "uncertainty comparison" [--kind diagrams] [--limit 6]\ncatalog.mjs show ID\ncatalog.mjs take ID NEW_DIRECTORY\ncatalog.mjs take tpl-<pack> NEW_DIRECTORY   (a whole template pack)\ncatalog.mjs list [--kind motion]');
  }
} catch (e) { console.error('Catalog:', e.message); process.exitCode = 1; }
