#!/usr/bin/env node
/** Merge catalog patches into assets/catalog.json and refresh notes from the modules.
 *
 *   node scripts/catalog-merge.mjs PATCH.json [PATCH.json …]   # apply patches, then refresh
 *   node scripts/catalog-merge.mjs --refresh                    # refresh notes/static only
 *
 * A patch is an array of {id, title, purpose, tags, deriveSteps}. Only known ids are
 * updated; source, css and gallery paths never change here. Notes are re-read from
 * each module's `notes` so the catalog never drifts from the source it describes.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './craft-core.mjs';

const file = path.join(ROOT, 'assets/catalog.json');
const catalog = JSON.parse(await fs.readFile(file, 'utf8'));
const byId = new Map(catalog.resources.map(r => [r.id, r]));
const patches = process.argv.slice(2).filter(a => !a.startsWith('--'));
const report = { updated: 0, unknown: [], refreshed: 0, errors: [] };

for (const p of patches) {
  for (const entry of JSON.parse(await fs.readFile(path.resolve(p), 'utf8'))) {
    const r = byId.get(entry.id);
    if (!r) { report.unknown.push(entry.id); continue; }
    for (const k of ['title', 'purpose']) if (typeof entry[k] === 'string' && entry[k].trim()) r[k] = entry[k].trim();
    if (Array.isArray(entry.tags) && entry.tags.length) r.tags = [...new Set(entry.tags.map(String).map(s => s.trim()).filter(Boolean))];
    if (Array.isArray(entry.deriveSteps) && entry.deriveSteps.length) r.deriveSteps = entry.deriveSteps.map(String);
    report.updated++;
  }
}

for (const r of catalog.resources) {
  try {
    const mod = (await import(pathToFileURL(path.join(ROOT, r.source)).href)).default;
    if (typeof mod?.notes === 'string' && mod.notes.trim()) r.notes = mod.notes;
    r.static = mod?.exportPolicy || r.static || 'final';
    report.refreshed++;
  } catch (e) { report.errors.push(`${r.source}: ${e.message}`); }
}

await fs.writeFile(file, JSON.stringify(catalog, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
