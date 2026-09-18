/** Small, editable construction tools. They encode invariants, not slide templates.
 * User text must be escaped; local author modules are executable, trusted code. */
import fs from 'node:fs/promises';
export const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const states=v=>h(JSON.stringify(v));
export const assert=(ok,message)=>{if(!ok)throw Error(message)};
export function namespaceSvg(source,prefix){
 assert(/^[A-Za-z][\w-]*$/.test(prefix),'Use a stable alphanumeric SVG prefix.');
 assert(/<svg\b/.test(source),'Expected SVG markup.');
 assert(!/<!DOCTYPE|<!ENTITY|<script\b|<foreignObject\b|<animate\b|<animateTransform\b|<animateMotion\b|<set\b|\bon\w+\s*=|<style\b|javascript:|@import/i.test(source),'Use inspected passive SVG attributes; active SVG is not accepted.');
 for(const m of source.matchAll(/(?:href|src)\s*=\s*(["'])(.*?)\1/gi))assert(m[2].startsWith('#'),'External SVG reference rejected.');
 for(const m of source.matchAll(/url\(\s*["']?([^)'"\s]+)/gi))assert(m[1].startsWith('#'),'External SVG CSS URL rejected.');
 const ids=[...source.matchAll(/\bid\s*=\s*(["'])(.*?)\1/g)].map(m=>m[2]);assert(new Set(ids).size===ids.length,'Duplicate SVG IDs.');
 const map=new Map(ids.map(id=>[id,`${prefix}-${id}`]));
 return source.replace(/\bid\s*=\s*(["'])(.*?)\1/g,(_,q,id)=>`id=${q}${map.get(id)}${q}`)
 .replace(/url\(\s*(["']?)#([^)"'\s]+)\1\s*\)/g,(_,q,id)=>`url(${q}#${map.get(id)||id}${q})`)
 .replace(/((?:xlink:)?href\s*=\s*["'])#([^"']+)/g,(_,lead,id)=>lead+'#'+(map.get(id)||id))
 .replace(/(aria-(?:labelledby|describedby)\s*=\s*["'])([^"']+)/g,(_,lead,ids)=>lead+ids.split(/\s+/).map(id=>map.get(id)||id).join(' '))
 .replace(/<\?xml[\s\S]*?\?>/g,'');
}
export async function svg(file,prefix){const s=await fs.readFile(file,'utf8');assert(s.length<4e6,'SVG exceeds 4 MB; simplify it first.');return namespaceSvg(s,prefix)}
export function grid({x=64,y=64,width=1152,height=592,columns=2,rows=1,gap=32}={}){
 assert([x,y,width,height,gap].every(Number.isFinite)&&width>0&&height>0&&gap>=0,'Invalid grid bounds.');
 assert(Number.isInteger(columns)&&columns>0&&Number.isInteger(rows)&&rows>0,'Grid counts must be positive integers.');
 const w=(width-gap*(columns-1))/columns,h=(height-gap*(rows-1))/rows;assert(w>0&&h>0,'Gaps leave no content area.');
 return Array.from({length:rows*columns},(_,i)=>({x:x+(i%columns)*(w+gap),y:y+Math.floor(i/columns)*(h+gap),w,h}));
}
export const position=b=>`left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px`;
export function scaleLinear(domain,range){assert(domain.length===2&&range.length===2&&[...domain,...range].every(Number.isFinite)&&domain[0]!==domain[1],'Nondegenerate finite scales required.');return x=>{assert(Number.isFinite(x),'Nonfinite datum.');return range[0]+(x-domain[0])/(domain[1]-domain[0])*(range[1]-range[0])}}
export function port(b,side){assert(['left','right','top','bottom'].includes(side),'Unknown port side.');return side==='left'?[b.x,b.y+b.h/2]:side==='right'?[b.x+b.w,b.y+b.h/2]:side==='top'?[b.x+b.w/2,b.y]:[b.x+b.w/2,b.y+b.h]}
export function connector(a,b,{from='right',to='left',axis='x'}={}){const p=port(a,from),q=port(b,to);const mid=axis==='x'?(p[0]+q[0])/2:(p[1]+q[1])/2;return axis==='x'?`M ${p} H ${mid} V ${q[1]} H ${q[0]}`:`M ${p} V ${mid} H ${q[0]} V ${q[1]}`}
export function contrast(a,b){const lum=c=>{assert(/^#[\da-f]{6}$/i.test(c),'Use opaque #RRGGBB for contrast.');const v=c.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722};const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
export function checkBounds(boxes,{width=1280,height=720}={}){return boxes.flatMap((b,i)=>![b.x,b.y,b.w,b.h].every(Number.isFinite)||b.x<0||b.y<0||b.w<0||b.h<0||b.x+b.w>width||b.y+b.h>height?[{index:i,problem:'outside canvas or invalid geometry'}]:[])}
