#!/usr/bin/env node
import fs from 'node:fs/promises';import path from 'node:path';import {pathToFileURL} from 'node:url';import {ROOT,renderCraft} from './craft-core.mjs';
for(const name of ['languages','images','research','from-scratch','constraint-layout']){const deck=(await import(pathToFileURL(path.join(ROOT,'examples',name,'deck.mjs')).href)).default;await fs.writeFile(path.join(ROOT,'gallery',name+'.html'),await renderCraft(deck,{assetBase:ROOT}));console.log(name,deck.slides.length);}

const {proofDeck}=await import('./brand.mjs');const brand=JSON.parse(await fs.readFile(path.join(ROOT,'assets/brands/example.json'),'utf8'));await fs.writeFile(path.join(ROOT,'gallery/brand.html'),await renderCraft(proofDeck(brand)));console.log('brand',6);
