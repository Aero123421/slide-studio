/** Conservative audience-copy gate. One rule set also feeds browser QA.
 * This is not a sanitizer or a prose-quality certification. Input is trusted HTML.
 * Waivers must identify the exact occurrence and why the quotation is necessary. */
import fs from 'node:fs';
export const rules=JSON.parse(fs.readFileSync(new URL('../assets/copy-rules.json',import.meta.url),'utf8')).rules;
export function visibleText(markup){
  return String(markup).replace(/<!--[\s\S]*?-->/g,' ').replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1>/gi,' ')
    .replace(/<[^>]*>/g,' ').replace(/&#x([\da-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)))
    .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
    .replace(/&(?:nbsp|amp|lt|gt|quot|apos);/g,x=>({'&nbsp;':' ','&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"}[x])).replace(/\s+/g,' ').trim();
}
export function checkCopy(text,waivers=[]){
  if(!Array.isArray(waivers))throw Error('copyWaivers must be an array');
  for(const w of waivers)if(!rules.some(r=>r.id===w.rule)||typeof w.quote!=='string'||!w.quote.trim()||typeof w.reason!=='string'||w.reason.trim().length<12)throw Error('A copy waiver needs a known rule, exact quote and meaningful reason');
  const findings=[];
  for(const r of rules){
    const re=new RegExp(r.pattern,(r.flags||'')+'g');
    for(const match of String(text).matchAll(re)){
      const waiver=waivers.find(w=>w.rule===r.id&&w.quote===match[0]);
      findings.push({rule:r.id,level:r.level,quote:match[0],waived:!!waiver,...(waiver?{reason:waiver.reason}:{})});
    }
  }
  return findings;
}
export function checkSlideCopy(slide){return checkCopy(visibleText(slide.content),slide.copyWaivers||[])}
