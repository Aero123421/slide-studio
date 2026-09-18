/* Read-only page diagnostics. Empty area is a clue, never a target to maximize/minimize.
 * This function is evaluated in Chromium by qa.py; it does not modify the deck. */
(slide)=>{
 const page=slide.getBoundingClientRect();
 const scale=page.width/parseFloat(getComputedStyle(slide).width);
 const shown=e=>{for(let n=e;n&&n!==slide.parentElement;n=n.parentElement){const s=getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden'||+s.opacity===0)return false}return !!e.getClientRects().length};
 const box=r=>({x:+((r.left-page.left)/scale).toFixed(1),y:+((r.top-page.top)/scale).toFixed(1),width:+(r.width/scale).toFixed(1),height:+(r.height/scale).toFixed(1)});
 const text=[];const walker=document.createTreeWalker(slide,NodeFilter.SHOW_TEXT);let n;
 while(n=walker.nextNode()){if(n.textContent.trim()&&shown(n.parentElement)&&!n.parentElement.closest('script,style,template,option'))text.push(n.textContent.trim())}
 const meta=window.slideStudio.meta;const data=meta.slides.find(s=>s.id===slide.id)||{};
 const findings=[];
 for(const rule of window.__studioReviewCopyRules||meta.copyRules||[]){for(const m of text.join(' ').matchAll(new RegExp(rule.pattern,(rule.flags||'')+'g'))){const waiver=(data.copyWaivers||[]).find(w=>w.rule===rule.id&&w.quote===m[0]);findings.push({rule:rule.id,level:rule.level,quote:m[0],waived:!!waiver,...(waiver?{reason:waiver.reason}:{})})}}
 const headings=[];const hints=[];
 for(const h of slide.querySelectorAll('h1,h2,h3'))if(shown(h)){
  const lines=new Map();const walk=document.createTreeWalker(h,NodeFilter.SHOW_TEXT);let node;
  while(node=walk.nextNode()){if(!node.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(node);for(const r of range.getClientRects()){const k=Math.round(r.top/scale);lines.set(k,(lines.get(k)||0)+r.width/scale)}}
  const widths=[...lines.entries()].sort((a,b)=>a[0]-b[0]).map(a=>a[1]);
  headings.push({text:h.textContent.trim().slice(0,160),lines:widths.length,lineWidths:widths.map(w=>Math.round(w)),...box(h.getBoundingClientRect())});
  if(widths.length>3)hints.push('A heading exceeds three rendered lines; check its role and available width, not a universal word limit.');
  if(widths.length>1&&widths.at(-1)<Math.max(...widths)*.22)hints.push('A short final heading line may be an orphan. Read its syntax before adjusting width.');
 }
 const regions=[...slide.querySelectorAll('[data-region]')].filter(shown).map(e=>({role:e.dataset.region,intent:e.dataset.spaceIntent||'',...box(e.getBoundingClientRect())}));
 const svgs=[];for(const svg of slide.querySelectorAll('svg'))if(shown(svg)&&svg.getBBox){try{const b=svg.getBBox(),v=svg.viewBox.baseVal;svgs.push({viewBox:[v.x,v.y,v.width,v.height],drawing:[b.x,b.y,b.width,b.height]});if(v.width&&v.height&&b.width*b.height/(v.width*v.height)<.30)hints.push('SVG geometry occupies little of its viewBox; inspect optical extent before enlarging the wrapper.')}catch{}}
 // Coarse cells approximate visible text/media masses; transparent SVG space can
 // overestimate occupancy. This estimate is intentionally NOT a pass/fail metric.
 const W=+getComputedStyle(slide).width.replace('px',''),H=+getComputedStyle(slide).height.replace('px',''),cols=32,rows=18;
 const grid=Array.from({length:rows},()=>Array(cols).fill(false));
 for(const e of slide.querySelectorAll('h1,h2,h3,p,table,svg,img,video,canvas,[data-region="primary"]'))if(shown(e)){
  const b=box(e.getBoundingClientRect());for(let y=Math.max(0,Math.floor(b.y/H*rows));y<Math.min(rows,Math.ceil((b.y+b.height)/H*rows));y++)for(let x=Math.max(0,Math.floor(b.x/W*cols));x<Math.min(cols,Math.ceil((b.x+b.width)/W*cols));x++)grid[y][x]=true;
 }
 let best={area:0,x:0,y:0,width:0,height:0};
 for(let top=0;top<rows;top++){const empty=Array(cols).fill(true);for(let bottom=top;bottom<rows;bottom++){let start=0;for(let x=0;x<=cols;x++){if(x<cols)empty[x]=empty[x]&&!grid[bottom][x];if(x===cols||!empty[x]){const a=(x-start)*(bottom-top+1);if(a>best.area)best={area:a,x:start*W/cols,y:top*H/rows,width:(x-start)*W/cols,height:(bottom-top+1)*H/rows};start=x+1}}}}

 const readingMode=data.readingMode||meta.readingMode||'live';
 const bodyRuns=[];const clippedText=[];const paragraphLines=[];
 const walkBody=document.createTreeWalker(slide,NodeFilter.SHOW_TEXT);let bn;
 while(bn=walkBody.nextNode()){
  const e=bn.parentElement;if(!e||!bn.textContent.trim()||!shown(e)||e.closest('script,style,template,option'))continue;
  const style=getComputedStyle(e),range=document.createRange();range.selectNodeContents(bn);
  const raw=[...range.getClientRects()].filter(r=>r.width>0&&r.height>0);
  if(!e.closest('footer,figcaption,.g-footer,.c-foot,.studio-demo,[data-region="source"],[data-role="source"],h1,h2,h3')){
    for(const r of raw)bodyRuns.push({text:bn.textContent.trim().slice(0,90),chars:bn.textContent.trim().length/Math.max(1,raw.length),font:+style.fontSize.replace('px',''),box:box(r)});
  }
  if(!e.closest('[data-qa-text-clip]'))for(const r of raw){
    for(let p=e.parentElement;p&&p!==slide;p=p.parentElement){
      const st=getComputedStyle(p),b=p.getBoundingClientRect();
      if(['hidden','clip'].includes(st.overflowY)&&r.bottom>b.bottom+3*scale||['hidden','clip'].includes(st.overflowX)&&r.right>b.right+3*scale){
        clippedText.push({text:bn.textContent.trim().slice(0,90),container:p.id||p.tagName.toLowerCase(),message:'Text extends behind an overflow clip. Check truncation, not only slide boundaries.'});break;
      }
    }
  }
 }
 const charTotal=bodyRuns.reduce((a,r)=>a+r.chars,0);
 const tiny=bodyRuns.filter(r=>r.font*1280/W<(readingMode==='reference'?15:readingMode==='read'?18:22));
 const tinyFraction=charTotal?tiny.reduce((a,r)=>a+r.chars,0)/charTotal:0;
 const lastBodyY=Math.max(0,...bodyRuns.map(r=>r.box.y+r.box.height));
 const qualityHints=[];
 if(tinyFraction>.35&&charTotal>100)qualityHints.push({kind:'density',message:'Much of the body is small for the declared reading mode. Check the projected/read size; do not solve it by deleting essential conditions.',tinyFraction:+tinyFraction.toFixed(2)});
 if(tinyFraction>.35&&lastBodyY<H*.68&&charTotal>100)qualityHints.push({kind:'space-allocation',message:'Small text is concentrated high in the page while substantial lower space is unused. Reallocate the canvas before cutting content.',bodyBottom:+lastBodyY.toFixed(1)});
 if(headings.filter(h=>h.lines>=2).length>2)qualityHints.push({kind:'hierarchy',message:'Several multiline headings compete. Check whether eyebrow, title, subtitle and card titles all repeat the same message.'});
 for(const x of clippedText)qualityHints.push({kind:'text-clipping',...x});
 return {copyFindings:findings,copyBlocking:meta.mode!=='workshop'&&findings.some(f=>f.level==='error'&&!f.waived),readingMode,qualityHints,bodyDiagnostics:{characters:Math.round(charTotal),smallTextFraction:+tinyFraction.toFixed(2),lastBodyY:+lastBodyY.toFixed(1)},spaceDiagnostics:{headings,regions,svgBounds:svgs,occupancyEstimate:grid.flat().filter(Boolean).length/(cols*rows),largestEmptyRectangle:best,hints:[...new Set(hints)],limits:'Coarse geometry is not visual balance, aesthetics, accessibility or copy certification.'}};
}
