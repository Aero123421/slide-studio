#!/usr/bin/env node
import fs from 'node:fs/promises';import path from 'node:path';import {ROOT} from './craft-core.mjs';
const resources=JSON.parse(await fs.readFile(path.join(ROOT,'assets/catalog.json'),'utf8')).resources;
const rows=resources.map(({id,kind,title,purpose,source,gallery})=>({id,kind,title,purpose,source,gallery}));
let template=await fs.readFile(path.join(ROOT,'assets/gallery-index.html'),'utf8');
for(const kind of ['templates','diagrams','motion','interactions','compositions'])template=template.replaceAll('{{COUNT_'+kind+'}}',String(resources.filter(r=>r.kind===kind).length));
const colorSystems=(await fs.readdir(path.join(ROOT,'assets/color-systems'))).filter(f=>f.endsWith('.json')).length;template=template.replaceAll('{{COUNT_colorsystems}}',String(colorSystems));
await fs.writeFile(path.join(ROOT,'gallery/index.html'),template.replace('{{CATALOG}}',JSON.stringify(rows).replace(/</g,'\\u003c')));
console.log('index',rows.length);
