#!/usr/bin/env node
/** Rebuild all distributed galleries from the editable source studies. */
import fs from 'node:fs/promises';import path from 'node:path';import {pathToFileURL} from 'node:url';
import {ROOT,renderCraft} from './craft-core.mjs';
const catalog=JSON.parse(await fs.readFile(path.join(ROOT,'assets/catalog.json'),'utf8')).resources;
const specs=JSON.parse(await fs.readFile(path.join(ROOT,'assets/gallery-specs.json'),'utf8'));
const args=process.argv.slice(2),selected=args.filter(a=>!a.startsWith('--'));
for(const [name,spec]of Object.entries(specs)){
 if(selected.length&&!selected.includes(name))continue;
 const resources=spec.resources.map(id=>catalog.find(r=>r.id===id));const slides=[];for(const r of resources)slides.push((await import(pathToFileURL(path.join(ROOT,r.source)).href)).default);
 const styles=[...new Set(resources.map(r=>r.css))];let css='';for(const s of styles)css+=await fs.readFile(path.join(ROOT,s),'utf8');
 const out=path.join(ROOT,'gallery',name+'.html');await fs.writeFile(out,await renderCraft({...spec,css,slides}));console.log(JSON.stringify({gallery:name,slides:slides.length,bytes:(await fs.stat(out)).size}));
}
