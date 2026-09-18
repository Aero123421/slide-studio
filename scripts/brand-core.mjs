/** Approved identity tokens constrain style, not the arrangement of evidence. */
import {h} from '../assets/runtime/kit.mjs';
const roles=['background','text','muted','accent','line','surface'];
export function validateBrand(b,{allowDraft=false}={}){
  const fail=m=>{throw Error('Brand: '+m)};
  if(!b||typeof b!=='object'||!b.name?.trim())fail('name required');
  if(!['draft','approved'].includes(b.status))fail('status must be draft or approved');
  if(b.status!=='approved'&&!allowDraft)fail('identity is not approved; preview with --allow-draft');
  if(!b.canvas||![b.canvas.width,b.canvas.height].every(n=>Number.isInteger(n)&&n>=240&&n<=8192))fail('valid canvas required');
  for(const role of roles)if(!/^#[\da-f]{6}$/i.test(b.colors?.[role]||''))fail('opaque #RRGGBB color required: '+role);
  for(const role of ['heading','body','caption']){
    const t=b.typography?.[role];
    if(!t||!Array.isArray(t.family)||!t.family.length||!t.family.every(s=>typeof s==='string'&&s.trim()&&!/[{}<>;\\]/.test(s))||!Number.isFinite(t.size)||t.size<10||t.size>200||!Number.isFinite(t.lineHeight)||t.lineHeight<1||t.lineHeight>2.5)fail('invalid typography role: '+role);
  }
  if(!b.spacing||![b.spacing.margin,b.spacing.gutter].every(n=>Number.isFinite(n)&&n>=0&&n<=Math.min(b.canvas.width,b.canvas.height)/3))fail('invalid spacing');
  if(b.logo){const l=b.logo;if(typeof l.file!=='string'||!l.file||!l.alt?.trim()||![l.x,l.y,l.width,l.height].every(Number.isFinite)||l.width<=0||l.height<=0||l.x<0||l.y<0||l.x+l.width>b.canvas.width||l.y+l.height>b.canvas.height)fail('invalid logo path/alt/geometry');}
  return {valid:true,status:b.status};
}
export function brandCSS(b){
  validateBrand(b,{allowDraft:true});
  const family=a=>a.map(s=>`"${s.replaceAll('"','\\"')}"`).join(',')+',sans-serif';
  return ':root{'+roles.map(k=>`--brand-${k}:${b.colors[k]};`).join('')+`--brand-margin:${b.spacing.margin}px;--brand-gutter:${b.spacing.gutter}px;`+['heading','body','caption'].map(k=>`--brand-${k}-font:${family(b.typography[k].family)};--brand-${k}-size:${b.typography[k].size}px;--brand-${k}-leading:${b.typography[k].lineHeight};`).join('')+'}\n'+
  '.slide{background:var(--brand-background);color:var(--brand-text);font-family:var(--brand-body-font)}'+
  '.slide h1,.slide h2{font-family:var(--brand-heading-font)}.brand-logo{position:absolute;object-fit:contain}';
}
export function brandLogo(b){return b.logo?`<img class="brand-logo" alt="${h(b.logo.alt)}" src="{{asset:${h(b.logo.file)}}}" style="left:${b.logo.x}px;top:${b.logo.y}px;width:${b.logo.width}px;height:${b.logo.height}px">`:''}
