#!/usr/bin/env node
/** Slide Studio authoring CLI (original HTML route).
 *
 *   craft.mjs init PROJECT [--language en] [--colors laboratory]
 *   craft.mjs validate DECK.mjs [--allow-draft]
 *   craft.mjs build DECK.mjs --out deck.html [--allow-draft] [--strip-notes] [--force]
 *
 * init copies the editable helpers a project needs (figure engine, layout and
 * number helpers, page grammar, one color system) so the project never imports
 * from the installed skill. DECK.mjs is trusted local code: it is executed.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, renderCraft, validateCraft } from './craft-core.mjs';

const args = process.argv.slice(2), cmd = args.shift();
const get = k => { const i = args.indexOf(k); return i < 0 ? undefined : args[i + 1]; };

const FIGURE_FILES = ['figure.mjs', 'fig-core.mjs', 'fig-stats.mjs', 'fig-charts.mjs', 'fig-stats-charts.mjs', 'fig-diagrams.mjs', 'fig-patterns.mjs'];

async function colorSystemCSS(id) {
  const file = path.join(ROOT, 'assets/color-systems', `${id}.json`);
  const system = JSON.parse(await fs.readFile(file, 'utf8').catch(() => { throw Error(`Unknown color system "${id}". See assets/color-systems/ or gallery/color-systems.html.`); }));
  const all = await fs.readFile(path.join(ROOT, 'assets/color-systems/color-systems.css'), 'utf8');
  const block = new RegExp(`/\\*[^*]*\\*/\\n\\.cs-${id}\\{[^}]*\\}`).exec(all)?.[0];
  if (!block) throw Error(`color-systems.css has no block for ${id}; run node scripts/color-systems.mjs css`);
  return { system, block };
}

function starterDeck(language, colors) {
  const ja = language.startsWith('ja');
  const t = ja
    ? { title: '無題のプレゼンテーション', h1: '聴衆の問いに、この1枚で答える', dek: '下書き：主張・根拠・条件を書き、図はデータから計算する。', unit: '受注数（千件）', source: '架空のデータ · 置き換えてください', labels: ['北部', '沿岸', '中央', '渓谷', '島しょ'],
        claim: '`${top.label}の受注が最も多く、全体の${share}%を占める`' }
    : { title: 'Untitled presentation', h1: 'Answer the audience’s question on one page', dek: 'Draft: write the claim, its evidence and its condition; compute figures from data.', unit: 'Orders, thousands', source: 'Illustrative data · replace with your source', labels: ['North', 'Coast', 'Central', 'Valley', 'Islands'],
        claim: '`${top.label} took the largest share of orders: ${share}%`' };
  return `// Draft deck. Replace the copy and the data; keep figures computed from data.
// Build: node <skill>/scripts/craft.mjs build deck.mjs --out deck.html --allow-draft
import fs from 'node:fs/promises';
import { h } from './studio-kit.mjs';
import { barChart, fmt } from './figure.mjs';

const css = await fs.readFile(new URL('./theme.css', import.meta.url), 'utf8');
const orders = ${JSON.stringify(t.labels.map((label, i) => ({ label, value: [48, 31, 22, 39, 20][i] })))};
const total = orders.reduce((s, d) => s + d.value, 0);
const top = [...orders].sort((a, b) => b.value - a.value)[0];
const share = fmt((top.value / total) * 100, { digits: 0 });
const claim = ${t.claim}; // computed from the same data as the bars

export default {
  title: ${JSON.stringify(t.title)}, language: ${JSON.stringify(language)}, draft: true, readingMode: 'live', transition: 'fade',
  css,
  slides: [
    { id: 'opening', title: ${JSON.stringify(t.h1)}, className: 'st cs-${colors}',
      content: \`<h1 class="st-head">\${h(${JSON.stringify(t.h1)})}</h1><p class="st-dek st-one">\${h(${JSON.stringify(t.dek)})}</p>\` },
    { id: 'evidence', title: claim, className: 'st cs-${colors}',
      notes: 'Replace orders with real data. The headline share is computed from the same array as the bars.',
      content: \`<h1 class="st-head">\${h(claim)}</h1>
<figure class="st-fig" data-region="primary">\${barChart({ id: 'orders', title: ${JSON.stringify(t.unit)}, desc: claim, width: 1152, height: 470, data: orders, sort: 'desc', highlight: top.label, unit: ${JSON.stringify(t.unit)}, locale: ${JSON.stringify(language)}, build: { start: 1, stagger: 70 } })}</figure>
<p class="st-source" data-region="source"><span>\${h(${JSON.stringify(t.source)})}</span></p>\` },
  ],
};
`;
}

try {
  if (cmd === 'init') {
    if (!args[0] || args[0].startsWith('--')) throw Error('init PROJECT_DIRECTORY [--language en] [--colors laboratory]');
    const out = path.resolve(args[0]);
    const language = get('--language') || 'en', colors = get('--colors') || (language.startsWith('ja') ? 'wa-ai' : 'laboratory');
    const { block } = await colorSystemCSS(colors);
    await fs.mkdir(out, { recursive: false });
    await fs.mkdir(path.join(out, 'assets'));
    const runtime = f => path.join(ROOT, 'assets/runtime', f);
    await fs.copyFile(runtime('kit.mjs'), path.join(out, 'studio-kit.mjs'));
    for (const f of ['layout.mjs', 'quant.mjs', ...FIGURE_FILES]) await fs.copyFile(runtime(f), path.join(out, f));
    const semantic = (await fs.readFile(runtime('semantic-graph.mjs'), 'utf8')).replace("from './kit.mjs'", "from './studio-kit.mjs'");
    await fs.writeFile(path.join(out, 'semantic-graph.mjs'), semantic);
    const frame = await fs.readFile(runtime('study-frame.css'), 'utf8');
    await fs.writeFile(path.join(out, 'theme.css'), `/* Page grammar (st-*) and one color system. Swap the cs-* block for another system or your brand tokens. */\n${frame}\n${block}\n`);
    await fs.writeFile(path.join(out, 'deck.mjs'), starterDeck(language, colors));
    await fs.writeFile(path.join(out, 'brief.md'), [
      '# Brief', '',
      '## Intake (answers, or the default you chose — see references/intake.md)', '',
      'Used for (spoken / read / both):', 'Files to hand over (HTML / PDF / editable PPTX / picture PPTX):',
      'Presenter control (keys only / presenter touches controls / audience touches):', 'Starting point (template pack / company template / from scratch):',
      'Look (color system or brand):', 'Writing style and amount of text:', '', '## Context', '',
      'Audience (what they already know):', 'Question this deck answers / decision it supports:', 'Reading mode (live / read / reference / hybrid):',
      'Language and register:', 'Duration or length budget:', 'Evidence available (files, tables, versions):', 'Unknowns and assumptions:',
      '', '## Claim outline', '', '| Page | Claim (one sentence) | Evidence | Status |', '|---|---|---|---|', '',
    ].join('\n'));
    console.log(JSON.stringify({ project: out, colors, next: 'Write the brief and claim outline, then author deck.mjs. Preview with build --allow-draft; clear draft only after review.' }, null, 2));
  } else if (cmd === 'build' || cmd === 'validate') {
    if (!args[0]) throw Error('Specify trusted local deck.mjs.');
    const file = path.resolve(args[0]);
    const deck = (await import(pathToFileURL(file).href)).default;
    const options = { allowDraft: args.includes('--allow-draft'), assetBase: path.dirname(file), stripNotes: args.includes('--strip-notes') };
    const result = validateCraft(deck, options);
    if (cmd === 'build') {
      const outFile = get('--out');
      if (!outFile || !outFile.endsWith('.html')) throw Error('build requires --out FILE.html');
      const text = await renderCraft(deck, options);
      await fs.mkdir(path.dirname(path.resolve(outFile)), { recursive: true });
      await fs.writeFile(outFile, text, { flag: args.includes('--force') ? 'w' : 'wx' }).catch(e => { throw e.code === 'EEXIST' ? Error(`${outFile} already exists; pass --force to rebuild it.`) : e; });
      result.output = path.resolve(outFile);
    }
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('craft.mjs init PROJECT [--language en] [--colors laboratory]\ncraft.mjs validate TRUSTED_DECK.mjs [--allow-draft]\ncraft.mjs build TRUSTED_DECK.mjs --out deck.html [--allow-draft] [--strip-notes] [--force]');
  }
} catch (e) { console.error('Craft:', e.message); process.exitCode = 1; }
