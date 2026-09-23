#!/usr/bin/env node
/** Color systems: role-based palettes with usage rules, a validator and specimen pages.
 *  node scripts/color-systems.mjs validate [FILE_OR_DIR ...]   (default: assets/color-systems)
 *  node scripts/color-systems.mjs specimen OUT.html [FILE_OR_DIR ...]
 *  node scripts/color-systems.mjs gallery                         (writes gallery/color-systems.html)
 * Checks are arithmetic (WCAG contrast, CIELAB distance, simulated color-vision deficiency);
 * they do not judge taste. No dependencies. */
import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
const ROOT=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const TOKEN_ROLES=['paper','surface','ink','inkMuted','rule','accent','onAccent','positive','negative'];
const HEX=/^#[0-9a-f]{6}$/i;
const lin=c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4};
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
export const luminance=h=>{const [r,g,b]=rgb(h).map(lin);return .2126*r+.7152*g+.0722*b};
export const contrast=(a,b)=>{const [x,y]=[luminance(a),luminance(b)].sort((m,n)=>n-m);return (x+.05)/(y+.05)};
const toLab=([r,g,b])=>{const f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;const X=(.4124*r+.3576*g+.1805*b)/.95047,Y=.2126*r+.7152*g+.0722*b,Z=(.0193*r+.1192*g+.9505*b)/1.08883;return [116*f(Y)-16,500*(f(X)-f(Y)),200*(f(Y)-f(Z))]};
// Machado et al. (2009), severity 1.0, applied in linear RGB.
const CVD={deuteranopia:[[.367322,.860646,-.227968],[.280085,.672501,.047413],[-.01182,.04294,.968881]],protanopia:[[.152286,1.052583,-.204868],[.114503,.786281,.099216],[-.003882,-.048116,1.051998]],tritanopia:[[1.255528,-.076749,-.178779],[-.078411,.930809,.147602],[.004733,.691367,.3039]]};
const linRGB=h=>rgb(h).map(lin),clamp=v=>Math.min(1,Math.max(0,v));
const sim=(h,m)=>{const c=linRGB(h);return m?m.map(r=>clamp(r[0]*c[0]+r[1]*c[1]+r[2]*c[2])):c};
export const deltaE=(a,b,m)=>{const [p,q]=[toLab(sim(a,m)),toLab(sim(b,m))];return Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2])};
export const lightness=h=>toLab(linRGB(h))[0];
const r2=x=>Math.round(x*100)/100;

export function validate(s,file=''){
 const errors=[],warnings=[],e=m=>errors.push(m),w=m=>warnings.push(m);const t=s.tokens||{},d=s.data||{};
 for(const k of ['id','name','nameJa','mode','mood','useFor','avoidFor','tokens','data','type','rules'])if(s[k]===undefined)e(`missing ${k}`);
 if(s.id&&!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.id))e('id must be kebab-case');
 if(file&&s.id&&path.basename(file,'.json')!==s.id)e('file name must equal id');
 if(!['light','dark'].includes(s.mode))e('mode must be light or dark');
 for(const k of TOKEN_ROLES)if(!HEX.test(t[k]||''))e(`tokens.${k} must be #rrggbb`);
 const cat=d.categorical||[],seq=d.sequential||[],div=d.diverging||[];
 for(const [k,v] of Object.entries({categorical:cat,sequential:seq,diverging:div}))if(!v.every(x=>HEX.test(x)))e(`data.${k} must be #rrggbb`);
 for(const k of ['highlight','context'])if(!HEX.test(d[k]||''))e(`data.${k} must be #rrggbb`);
 if(cat.length<3||cat.length>6)e('data.categorical needs 3-6 colors, ordered by use');
 if(seq.length!==5)e('data.sequential needs 5 steps');if(div.length!==5)e('data.diverging needs 5 steps');
 if(!Array.isArray(s.rules)||s.rules.length<3)e('rules: at least 3 concrete usage rules');
 if(!s.type?.display||!s.type?.body||!s.type?.ja)e('type needs display, body and ja font stacks');
 if(errors.length)return {id:s.id,errors,warnings,checks:{}};
 const checks={},need=(name,v,min,soft=false)=>{checks[name]=r2(v);if(v<min)(soft?w:e)(`${name} ${r2(v)} < ${min}`)};
 need('ink/paper',contrast(t.ink,t.paper),7);need('ink/surface',contrast(t.ink,t.surface),4.5);
 need('inkMuted/paper',contrast(t.inkMuted,t.paper),4.5);need('inkMuted/surface',contrast(t.inkMuted,t.surface),4.5,true);
 need('onAccent/accent',contrast(t.onAccent,t.accent),4.5);need('accent/paper',contrast(t.accent,t.paper),3);
 need('positive/paper',contrast(t.positive,t.paper),3);need('negative/paper',contrast(t.negative,t.paper),3);
 need('rule/paper',contrast(t.rule,t.paper),1.2,true);need('highlight/paper',contrast(d.highlight,t.paper),3);
 need('surface≠paper ΔE',deltaE(t.surface,t.paper),1.5,true);
 cat.forEach((c,i)=>need(`categorical[${i}]/paper`,contrast(c,t.paper),3));
 let minN=Infinity,minCVD=Infinity,worst='';for(let i=0;i<cat.length;i++)for(let j=i+1;j<cat.length;j++){minN=Math.min(minN,deltaE(cat[i],cat[j]));for(const [n,m]of Object.entries(CVD)){const v=deltaE(cat[i],cat[j],m);if(v<minCVD){minCVD=v;worst=`${cat[i]}~${cat[j]} (${n})`}}}
 need('categorical min ΔE',minN,20);need('categorical min ΔE under CVD',minCVD,10,true);if(minCVD<10)checks.cvdWorstPair=worst;
 need('positive/negative ΔE under deuteranopia',deltaE(t.positive,t.negative,CVD.deuteranopia),10,true);
 const L=seq.map(lightness),mono=L.every((v,i)=>!i||Math.abs(v-L[i-1])>=6)&&(L.every((v,i)=>!i||v<L[i-1])||L.every((v,i)=>!i||v>L[i-1]));
 checks['sequential lightness']=L.map(Math.round);if(!mono)e('data.sequential must change lightness monotonically, ≥6 L* per step');
 const DL=div.map(lightness);checks['diverging lightness']=DL.map(Math.round);
 const mid=DL[2],ends=[DL[0],DL[4]];if(!(ends.every(v=>v<mid-8)||ends.every(v=>v>mid+8)))e('data.diverging: middle step must be the lightest (light mode) or darkest (dark mode) neutral');
 if(Math.abs(DL[0]-DL[4])>15)w('data.diverging ends differ by >15 L*; one side will read as stronger');
 checks['highlight vs context ΔE']=r2(deltaE(d.highlight,d.context));if(deltaE(d.highlight,d.context)<25)e('data.highlight must stand clearly apart from data.context');
 return {id:s.id,errors,warnings,checks};
}

async function collect(args){const inputs=args.length?args:[path.join(ROOT,'assets/color-systems')];const files=[];
 for(const a of inputs){const st=await fs.stat(a);if(st.isDirectory())for(const f of (await fs.readdir(a)).filter(f=>f.endsWith('.json')).sort())files.push(path.join(a,f));else files.push(a)}
 return Promise.all(files.map(async f=>({file:f,system:JSON.parse(await fs.readFile(f,'utf8'))})))}

const esc=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export function specimenSlide(s){
 const t=s.tokens,d=s.data,sans=esc(s.type.ja||s.type.body),disp=esc(s.type.display),id='cs-'+s.id; // escaped: stacks contain quotes
 const sw=(role,hex,label)=>`<div style="display:grid;grid-template-columns:30px 1fr;gap:8px;align-items:center"><span style="width:30px;height:30px;background:${hex};border:1px solid ${t.rule}"></span><span><b style="display:block;font:600 13px/1.2 ${sans};color:${t.ink}">${esc(label)}</b><span style="font:11px/1.3 ui-monospace,Menlo,monospace;color:${t.inkMuted}">${hex}</span></span></div>`;
 const roles=[['paper','紙'],['surface','面'],['ink','本文'],['inkMuted','補助文字'],['rule','罫線'],['accent','アクセント'],['positive','プラス'],['negative','マイナス']].map(([k,l])=>sw(k,t[k],l)).join('');
 const vals=[62,48,41,33],labels=['A','B','C','D'];
 const bars=vals.map((v,i)=>`<g><text x="0" y="${34+i*44}" font-size="15" fill="${t.inkMuted}" font-family="${sans}">${labels[i]}</text><rect x="28" y="${18+i*44}" width="${v*5}" height="24" fill="${i===0?d.highlight:d.context}"/><text x="${36+v*5}" y="${36+i*44}" font-size="15" fill="${t.ink}" font-family="${sans}">${v}</text></g>`).join('');
 const catLines=d.categorical.map((c,i)=>{const ys=[0,1,2,3,4,5].map(k=>150-(30+i*18+Math.sin(k*.9+i)*16+k*6*(i%2?1:-.4)));return `<polyline points="${ys.map((y,k)=>`${20+k*62},${y}`).join(' ')}" fill="none" stroke="${c}" stroke-width="3"/><text x="${24+5*62}" y="${ys[5]+5}" font-size="13" fill="${c}" font-family="${sans}">系列${i+1}</text>`}).join('');
 const ramp=a=>a.map(c=>`<span style="flex:1;height:26px;background:${c}"></span>`).join('');
 return {study:true,id,title:`${s.name} color system`,language:'ja',exportPolicy:'final',sources:[],notes:`Color system specimen: ${s.id}. Tokens, data palettes and rules are in assets/color-systems/${s.id}.json.`,className:'cs-slide',
  content:`<div style="position:absolute;inset:0;background:${t.paper};color:${t.ink};font-family:${sans};display:grid;grid-template-columns:300px 1fr 360px;gap:36px;padding:44px 52px 40px">
<section style="display:flex;flex-direction:column;gap:10px;min-width:0"><p style="margin:0;font:600 12px/1.3 ui-monospace,Menlo,monospace;color:${t.inkMuted}">${esc(s.id)} · ${s.mode}</p><h1 style="margin:0;font:700 26px/1.25 ${disp};color:${t.ink}">${esc(s.nameJa)}</h1><p style="margin:0 0 4px;font:14px/1.6 ${sans};color:${t.inkMuted}">${esc(s.mood)}</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 12px">${roles}</div></section>
<section style="display:flex;flex-direction:column;gap:18px;min-width:0"><div style="background:${t.surface};padding:22px 24px;border:1px solid ${t.rule}"><p style="margin:0 0 6px;font:13px/1.3 ${sans};color:${t.inkMuted}">見出し・本文・強調の例</p><h2 style="margin:0 0 8px;font:700 26px/1.3 ${disp};color:${t.ink}">A案は3年間の総額が<span style="color:${d.highlight}">最も低い</span></h2><p style="margin:0;font:16px/1.65 ${sans};color:${t.inkMuted}">強調は主題の1か所だけ。ほかの系列は控えめな色で文脈として残す。</p><span style="display:inline-block;margin-top:12px;padding:6px 14px;background:${t.accent};color:${t.onAccent};font:600 14px/1.4 ${sans}">判断を依頼する</span></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px"><svg viewBox="0 0 360 190" role="img" aria-labelledby="${id}-t1"><title id="${id}-t1">強調と文脈の棒グラフ</title>${bars}</svg><svg viewBox="0 0 400 160" role="img" aria-labelledby="${id}-t2"><title id="${id}-t2">分類色の折れ線</title><line x1="20" y1="150" x2="340" y2="150" stroke="${t.rule}"/>${catLines}</svg></div>
<div><p style="margin:0 0 6px;font:13px/1.3 ${sans};color:${t.inkMuted}">連続値（少→多）</p><div style="display:flex">${ramp(d.sequential)}</div><p style="margin:12px 0 6px;font:13px/1.3 ${sans};color:${t.inkMuted}">発散（負 ← 0 → 正）</p><div style="display:flex">${ramp(d.diverging)}</div></div></section>
<section style="display:flex;flex-direction:column;gap:10px"><p style="margin:0;font:600 14px/1.3 ${sans};color:${t.ink}">使い方のルール</p><ol style="margin:0;padding-left:20px;font:14px/1.6 ${sans};color:${t.inkMuted}">${s.rules.slice(0,5).map(r=>`<li style="margin-bottom:6px">${esc(r)}</li>`).join('')}</ol><p style="margin:auto 0 0;font:12px/1.5 ${sans};color:${t.inkMuted}">向く：${esc(s.useFor.join('、'))}<br>避ける：${esc(s.avoidFor.join('、'))}</p></section></div>`};
}
export async function specimenDeck(systems){const {renderCraft}=await import(pathToFileURL(path.join(ROOT,'scripts/craft-core.mjs')).href);
 return renderCraft({title:'Color systems',language:'ja',sample:true,mode:'workshop',css:'.cs-slide{background:#fff}',slides:systems.map(specimenSlide)})}

const [cmd,...args]=process.argv.slice(2);
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){try{
 if(cmd==='validate'){const rows=(await collect(args)).map(({file,system})=>({file:path.relative(ROOT,file),...validate(system,file)}));const ids=rows.map(r=>r.id);if(new Set(ids).size!==ids.length)rows.push({errors:['duplicate ids']});
  const failed=rows.filter(r=>r.errors?.length);console.log(JSON.stringify({systems:rows.length,passed:!failed.length,results:rows},null,2));process.exitCode=failed.length?2:0}
 else if(cmd==='specimen'||cmd==='gallery'){const out=cmd==='gallery'?path.join(ROOT,'gallery/color-systems.html'):args.shift();if(!out)throw Error('specimen OUT.html [FILES]');const items=await collect(args);
  const bad=items.filter(({file,system})=>validate(system,file).errors.length);if(bad.length)throw Error('Fix validation errors first: '+bad.map(b=>path.basename(b.file)).join(', '));
  await fs.writeFile(out,await specimenDeck(items.map(i=>i.system)));console.log(JSON.stringify({output:out,systems:items.length}))}
 else console.log('color-systems.mjs validate [FILE_OR_DIR...] | specimen OUT.html [FILE_OR_DIR...] | gallery')
}catch(e){console.error('Color systems:',e.message);process.exitCode=1}}
