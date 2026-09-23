#!/usr/bin/env node
import fs from 'node:fs/promises';import path from 'node:path';import {pathToFileURL} from 'node:url';
import {ROOT,renderCraft,validateCraft} from './craft-core.mjs';
const args=process.argv.slice(2),cmd=args.shift(),get=k=>{const i=args.indexOf(k);return i<0?undefined:args[i+1]};
try{
 if(cmd==='init'){
  if(!args[0])throw Error('init PROJECT_DIRECTORY [--language en]');const out=path.resolve(args[0]);await fs.mkdir(out,{recursive:false});await fs.mkdir(path.join(out,'assets'));await fs.copyFile(path.join(ROOT,'assets/runtime/kit.mjs'),path.join(out,'studio-kit.mjs'));
  await fs.copyFile(path.join(ROOT,'assets/runtime/layout.mjs'),path.join(out,'layout.mjs'));
  await fs.copyFile(path.join(ROOT,'assets/runtime/quant.mjs'),path.join(out,'quant.mjs'));
  const semantic=(await fs.readFile(path.join(ROOT,'assets/runtime/semantic-graph.mjs'),'utf8')).replace("from './kit.mjs'","from './studio-kit.mjs'");
  await fs.writeFile(path.join(out,'semantic-graph.mjs'),semantic);
  const language=get('--language')||'en';await fs.writeFile(path.join(out,'deck.mjs'),`// Replace this draft with a subject-specific composition. No layout ID is needed.\nimport {h,states,grid,position,svg} from './studio-kit.mjs';\nexport default {title:'Untitled presentation', language:${JSON.stringify(language)}, draft:true, readingMode:'live',\ncss:\`.slide{padding:64px;color:#182b36;background:#fff}h1{font:56px/1.15 sans-serif;max-width:1050px}p{font:28px/1.5 sans-serif;max-width:980px;margin-top:40px!important}\`,\nslides:[{id:'opening',title:'Draft',content:'<h1>Author the argument, not a template.</h1><p>Replace this page with evidence, writing, and a composition for the intended audience.</p>'}]};\n`);
  await fs.writeFile(path.join(out,'brief.md'),'# Brief\n\nAudience:\nOutcome:\nLanguage:\nEvidence available:\nUnknowns:\nDelivery format:\nArt direction:\n');console.log(JSON.stringify({project:out,next:'Author deck.mjs. Build with --allow-draft for preview; remove draft only after authoring.'},null,2));
 }else if(cmd==='build'||cmd==='validate'){
  const file=path.resolve(args[0]||'');if(!args[0])throw Error('Specify trusted local deck.mjs.');const deck=(await import(pathToFileURL(file).href)).default;
  const options={allowDraft:args.includes('--allow-draft'),assetBase:path.dirname(file),stripNotes:args.includes('--strip-notes')};const result=validateCraft(deck,options);
  if(cmd==='build'){const out=get('--out');if(!out||!out.endsWith('.html'))throw Error('build requires --out FILE.html');const text=await renderCraft(deck,options);await fs.mkdir(path.dirname(path.resolve(out)),{recursive:true});await fs.writeFile(out,text,{flag:args.includes('--force')?'w':'wx'}).catch(e=>{throw e.code==='EEXIST'?Error(`${out} already exists; pass --force to rebuild it.`):e});result.output=path.resolve(out)}console.log(JSON.stringify(result,null,2));
 }else console.log('craft.mjs init PROJECT [--language en]\ncraft.mjs validate TRUSTED_DECK.mjs\ncraft.mjs build TRUSTED_DECK.mjs --out deck.html [--allow-draft] [--strip-notes] [--force]');
}catch(e){console.error('Craft:',e.message);process.exitCode=1}
