#!/usr/bin/env node
/** Purpose-based retrieval and portable extraction. Does not publish or install anything. */
import fs from 'node:fs/promises';import path from 'node:path';import {ROOT} from './craft-core.mjs';
const args=process.argv.slice(2),cmd=args.shift(),opt=k=>{const i=args.indexOf(k);return i<0?undefined:args[i+1]};
const dictionary={'比較':'comparison compare paired bars','図':'diagram','動き':'motion','アニメーション':'motion','写真':'image photo crop','画像':'image photo','研究':'research study uncertainty','幾何学':'geometric geometry','操作':'interactions','動画':'video','音声':'audio','フォント':'type typography','比較图':'comparison','交互':'interactions','研究発表':'research methods results','動畫':'motion','gráfico':'chart plot','animation':'motion'};
try{const {resources}=JSON.parse(await fs.readFile(path.join(ROOT,'assets/catalog.json'),'utf8'));let rows=resources;
 if(cmd==='show'){const r=rows.find(x=>x.id===args[0]);if(!r)throw Error('Unknown ID. Use search or list.');console.log(JSON.stringify(r,null,2));}
 else if(cmd==='take'){
  const r=rows.find(x=>x.id===args[0]),dest=args[1];if(!r||!dest)throw Error('take RESOURCE_ID NEW_DIRECTORY');const out=path.resolve(dest);await fs.mkdir(out,{recursive:false});
  for(const rel of [r.source,r.css]){await fs.mkdir(path.dirname(path.join(out,rel)),{recursive:true});await fs.copyFile(path.join(ROOT,rel),path.join(out,rel))}
  const src=await fs.readFile(path.join(ROOT,r.source),'utf8');
  // Only named teaching wrappers can be removed mechanically. Inner subject labels
  // still need an author. The extracted artifact remains a marked draft.
  let authored=src.replace(/study:\s*true,?/, '');
  authored=authored.replace(/\"study\":\s*true,?/, '');
  // JSON-string content stores escaped attributes; parse through a trusted module.
  const mod=await import((await import('node:url')).pathToFileURL(path.join(ROOT,r.source)).href);
  const slide={...mod.default};delete slide.study;
  slide.content=slide.content.replace(/<(h[12]|p|div|footer)\b[^>]*class=\"(?:g-title|g-purpose|g-footer)\"[^>]*>[\s\S]*?<\/\1>/g,'');
  // Preserve licensed/source footers, but do not export the workshop's advice.
  slide.content=slide.content.replace(/<div class="c-foot">([\s\S]*?)<\/div>/g,(full,text)=>/Photo:|CC0|CC BY|©|copyright/i.test(text)?full:'<p data-region="source">Illustrative example.</p>');
  slide.content=slide.content.replace('Illustrative composition study · no measured result','Illustrative example · no measured result');
  slide.notes=(slide.notes||'')+'\nSource study: '+r.notes;
  await fs.writeFile(path.join(out,r.source),'// Authored derivative: replace inner labels, data and composition before clearing draft.\nexport default '+JSON.stringify(slide,null,2)+';\n');for(const m of src.matchAll(/\{\{asset:([^}]+)\}\}/g)){await fs.mkdir(path.dirname(path.join(out,m[1])),{recursive:true});await fs.copyFile(path.join(ROOT,m[1]),path.join(out,m[1]))}
  if(r.kind==='diagrams'){const sv=r.source.replace(/\.mjs$/,'.svg');await fs.copyFile(path.join(ROOT,sv),path.join(out,'original.svg'))}
  await fs.writeFile(path.join(out,'deck.mjs'),`// Author the title, actual data, geometry and copy. Clear draft only after review; never remove an illustrative-data disclosure for synthetic data.\nimport fs from 'node:fs/promises';\nimport slide from './${r.source}';\nexport default {title:${JSON.stringify(r.title)},language:'en',draft:true,sample:true,slides:[slide],css:await fs.readFile(new URL('./${r.css}',import.meta.url),'utf8')};\n`);
  for(const notice of ['LICENSE','THIRD_PARTY_NOTICES.md'])await fs.copyFile(path.join(ROOT,notice),path.join(out,notice));
  await fs.writeFile(path.join(out,'PROVENANCE.md'),`# Source study\n\n${r.id}\n\n${r.notes}\n\nOrigin: Slide Studio 3.4.0. Original study code: MIT; photographs retain their separate asset licenses. Record your changes here.\n`);console.log(JSON.stringify({project:out,source:r.source,next:'Edit the source; build project/deck.mjs with craft.mjs.'},null,2));
 }else if(cmd==='search'||cmd==='list'){
  const kind=opt('--kind');if(kind)rows=rows.filter(r=>r.kind===kind);const limit=Number(opt('--limit')||6);if(!Number.isInteger(limit)||limit<1||limit>250)throw Error('--limit must be 1..250');
  if(cmd==='search'){let q=args[0]||'';if(!q.trim())throw Error('Search by communication purpose.');for(const [a,b]of Object.entries(dictionary))q=q.replaceAll(a,b);const terms=q.toLowerCase().split(/\s+/);rows=rows.map(r=>({r,score:terms.reduce((n,t)=>n+([r.id,r.title,r.purpose,r.kind,...r.tags].join(' ').toLowerCase().includes(t)?1:0),0)})).filter(x=>x.score).sort((a,b)=>b.score-a.score||a.r.id.localeCompare(b.r.id)).map(x=>x.r)}
  console.log(JSON.stringify({matches:rows.length,resources:rows.slice(0,limit).map(({id,kind,title,purpose,source,gallery})=>({id,kind,title,purpose,source,gallery})),next:'show ID for modification constraints; take ID NEW_DIRECTORY for editable source.'},null,2));
 }else console.log('catalog.mjs search "uncertainty comparison" [--kind diagrams] [--limit 6]\ncatalog.mjs show ID\ncatalog.mjs take ID NEW_DIRECTORY\ncatalog.mjs list [--kind motion]');
}catch(e){console.error('Catalog:',e.message);process.exitCode=1}
