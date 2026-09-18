/* Small, inspectable interactions. No telemetry, storage, network requests or hidden polls.
 * Each widget has reset/snapshot/restore/onLeave/onExport hooks and stable local state.
 * Controls belong to the slide; arrow keys never leak into global deck navigation. */
(()=>{'use strict';
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg=(s,label='Illustrative interactive plot')=>`<svg viewBox="0 0 700 360" role="img" aria-label="${esc(label)}">${s}</svg>`;
const line=(x,y,a,b,c='#aebfc5',w=2)=>`<line x1="${x}" y1="${y}" x2="${a}" y2="${b}" stroke="${c}" stroke-width="${w}"/>`;
const rect=(x,y,w,h,c='#28617b')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const text=(x,y,s,size=19,anchor='start')=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="#17252d" text-anchor="${anchor}">${esc(s)}</text>`;
const circle=(x,y,r=6,c='#28617b')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const axis=()=>line(55,300,665,300,'#17252d')+line(55,45,55,300,'#17252d');
const poly=(points,c='#28617b')=>`<polyline points="${points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${c}" stroke-width="3"/>`;
const defaultValues=[.08,.12,.15,.21,.24,.28,.33,.37,.4,.43,.48,.51,.55,.62,.68,.7,.74,.8,.86,.93];
const defaultSeries=Array.from({length:28},(_,i)=>({x:i/27,y:.13+i/36+.13*Math.sin(i*2.1),group:i%3,id:i+1}));
function mount(config,defaultAssets){
 const assets={...defaultAssets,...(config.assets||{})};
 const vals=(config.data?.values||defaultValues).slice(),series=(config.data?.series||defaultSeries).map(v=>({...v}));
 if(!Array.isArray(vals)||!vals.length||vals.length>1000||vals.some(v=>!Number.isFinite(v)||v<0||v>1))throw Error('Example values must be 1..1000 finite normalized scores in [0,1]. Change the visual scale explicitly for other domains.');
 if(!Array.isArray(series)||!series.length||series.length>1000||series.some(v=>!Number.isFinite(v.x)||!Number.isFinite(v.y)))throw Error('Example series requires finite x/y objects.');
 if(config.data?.labels && (config.data.labels.length!==vals.length||config.data.labels.some(v=>v!==0&&v!==1)))throw Error('One binary label is required per score.');
 const root=document.getElementById(config.id),plot=root.querySelector('.w-plot'),panel=root.querySelector('.w-controls'),status=root.querySelector('.w-status');
 const abort=new AbortController(),on=(el,event,fn)=>el.addEventListener(event,fn,{signal:abort.signal});let state=JSON.parse(JSON.stringify(config.initial)),mesh=null;
 const slider=(key,title,min,max,step=1)=>{const label=document.createElement('label');label.innerHTML=`<span>${esc(title)}</span><input type="range" min="${min}" max="${max}" step="${step}" aria-label="${esc(title)}"><output></output>`;const el=label.querySelector('input');el.value=state[key];panel.append(label);on(el,'input',()=>{state[key]=Number(el.value);render()});return el};
 const select=(key,title,items)=>{const label=document.createElement('label');label.innerHTML=`<span>${esc(title)}</span><select aria-label="${esc(title)}">${items.map(([v,t])=>`<option value="${esc(v)}">${esc(t)}</option>`).join('')}</select>`;const el=label.querySelector('select');el.value=state[key];panel.append(label);on(el,'change',()=>{state[key]=el.value;render()});return el};
 const button=(title,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=title;panel.append(b);on(b,'click',fn);return b};
 const check=(key,title)=>{const l=document.createElement('label');l.className='w-check';l.innerHTML=`<input type="checkbox"><span>${esc(title)}</span>`;const input=l.querySelector('input');input.checked=!!state[key];panel.append(l);on(input,'change',()=>{state[key]=input.checked;render()});return input};
 const controls=[];let media;
 panel.dataset.static='hide';const summary=document.createElement('div');summary.dataset.static='show';summary.className='w-export-summary';summary.style.cssText='grid-column:2;grid-row:1;font:21px/1.5 Arial,sans-serif;padding:10px 0;color:#263f4b';panel.after(summary);
 const remember=(key,el)=>controls.push([key,el]);const S=(...a)=>remember(a[0],slider(...a));const C=(...a)=>remember(a[0],check(...a));const Q=(...a)=>remember(a[0],select(...a));
 switch(config.kind){
 case 'parameter':S('frequency','Frequency',1,6,.1);S('amplitude','Amplitude',.1,1,.05);break;
 case 'threshold':S('threshold','Decision threshold',.05,.95,.05);break;
 case 'scrubber':S('time','Time index',0,series.length-1);break;
 case 'comparison':S('split','Reveal original (%)',0,100);break;
 case 'hotspots':Q('part','Inspect a component',[['source','Source'],['sample','Sample'],['detector','Detector']]);break;
 case 'tabs':Q('tab','Read a section',[['method','Method'],['result','Result'],['limits','Limitations']]);break;
 case 'layers':C('base','Base geometry');C('labels','Labels');C('path','Connections');break;
 case 'table':button('Reverse sort',()=>{state.ascending=!state.ascending;render()});break;
 case 'brushing':S('low','Lower bound',0,80);S('high','Upper bound',20,100);break;
 case 'histogram':S('bins','Number of bins',3,12);break;
 case 'bootstrap':button('Resample',()=>{state.seed++;render()});S('n','Sample size',5,20);break;
 case 'ablation':C('a','Include component A');C('b','Include component B');C('c','Include component C');break;
 case 'quiz':Q('choice','Select an answer',[['none','Choose…'],['mean','The mean alone'],['range','Estimate with interval'],['decoration','More decoration']]);button('Check answer',()=>{state.checked=true;render()});break;
 case 'decision':Q('evidence','Evidence available?',[['yes','Yes'],['no','No']]);Q('interactive','Does inspection help?',[['yes','Yes'],['no','No']]);break;
 case 'graph':C('bridge','Enable bridge');C('direct','Enable direct edge');break;
 case 'matrix':S('row','Row',1,4);S('column','Column',1,5);break;
 case 'magnifier':S('zoom','Zoom',1,3,.1);S('x','Horizontal focus (%)',0,100);S('y','Vertical focus (%)',0,100);break;
 case 'video':
  plot.innerHTML=`<video data-static="hide" controls playsinline preload="metadata" poster="${assets.poster}" aria-label="Synthetic signal video"><source src="${assets.video}" type="video/webm"><track kind="captions" srclang="en" label="English" src="${assets.captions}" default></video><img data-static="show" src="${assets.poster}" alt="Selected static waveform frame">`;
  media=plot.querySelector('video');button('Play / pause',()=>media.paused?media.play().catch(()=>{status.textContent='Playback was blocked. Use the native play control.'}):media.pause());button('Seek to 2 seconds',()=>{media.currentTime=Math.min(2,Number.isFinite(media.duration)?media.duration:2)});on(media,'timeupdate',()=>{state.time=media.currentTime});break;
 case 'audio':
  plot.innerHTML=svg(axis()+poly(Array.from({length:100},(_,i)=>[55+i*6,175-65*Math.sin(i*.45)])))+`<audio controls preload="metadata" src="${assets.audio}" aria-label="Two-second synthetic tone"></audio>`;media=plot.querySelector('audio');button('Play / pause',()=>media.paused?media.play().catch(()=>{}):media.pause());break;
 case 'cad-orbit':case 'cad-explode':case 'cad-section':case 'cad-import':
  mesh=StudioMesh.parseOBJ(assets.obj);plot.innerHTML='<canvas width="700" height="360" tabindex="0" role="img" aria-label="Interactive triangle mesh. Drag to rotate, or use yaw and pitch sliders."></canvas>';S('yaw','Yaw (degrees)',-180,180);S('pitch','Pitch (degrees)',0,180);
  if(config.kind==='cad-explode')S('explode','Explode amount',0,1,.05);
  if(config.kind==='cad-section')S('cut','Visible height fraction',.05,1,.05);
  if(config.kind==='cad-import'){
   const l=document.createElement('label');l.innerHTML='<span>Local OBJ / STL (8 MiB maximum)</span><input type="file" accept=".obj,.stl" aria-label="Open local mesh">';panel.append(l);on(l.querySelector('input'),'change',async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>8*1024*1024)throw Error('File exceeds 8 MiB');const m=/\.obj$/i.test(f.name)?StudioMesh.parseOBJ(await f.text()):StudioMesh.parseSTL(await f.arrayBuffer());mesh=m;state.filename=f.name;render()}catch(err){status.textContent=err.message}})}
  const canvas=plot.querySelector('canvas');let drag=null;on(canvas,'pointerdown',e=>{drag={x:e.clientX,y:e.clientY,yaw:state.yaw,pitch:state.pitch};canvas.setPointerCapture(e.pointerId)});on(canvas,'pointermove',e=>{if(!drag)return;state.yaw=Math.max(-180,Math.min(180,drag.yaw+(e.clientX-drag.x)*.6));state.pitch=Math.max(0,Math.min(180,drag.pitch+(e.clientY-drag.y)*.6));render()});on(canvas,'pointerup',()=>drag=null);on(canvas,'pointercancel',()=>drag=null);on(canvas,'keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();state.yaw=Math.max(-180,Math.min(180,state.yaw+(e.key==='ArrowLeft'?-5:e.key==='ArrowRight'?5:0)));state.pitch=Math.max(0,Math.min(180,state.pitch+(e.key==='ArrowUp'?-5:e.key==='ArrowDown'?5:0)));render()}});break;
 case 'ink':
  plot.innerHTML='<canvas width="700" height="360" tabindex="0" role="img" aria-label="Annotation canvas. Choose a preset annotation for a keyboard alternative."></canvas>';button('Add focus annotation',()=>{state.paths.push([[190,120],[460,120],[460,240],[190,240],[190,120]]);render()});button('Clear annotations',()=>{state.paths=[];render()});let drawing=false;const cv=plot.querySelector('canvas');const point=e=>{const r=cv.getBoundingClientRect();return [(e.clientX-r.left)*700/r.width,(e.clientY-r.top)*360/r.height]};on(cv,'pointerdown',e=>{drawing=true;cv.setPointerCapture(e.pointerId);state.paths.push([point(e)]);render()});on(cv,'pointermove',e=>{if(drawing){state.paths.at(-1).push(point(e));render()}});on(cv,'pointerup',()=>drawing=false);on(cv,'pointercancel',()=>drawing=false);break;
 default:throw Error('Unknown widget kind '+config.kind);
 }
 const reset=()=>{state=JSON.parse(JSON.stringify(config.initial));if(config.kind.startsWith('cad-'))mesh=StudioMesh.parseOBJ(assets.obj);if(media){media.pause();media.currentTime=0}render()};button('Reset example',reset);
 function render(){
  for(const [key,el]of controls){if(el.type==='checkbox')el.checked=!!state[key];else el.value=state[key];const output=el.parentElement.querySelector('output');if(output)output.textContent=Number(state[key]).toLocaleString(config.locale||'en',{maximumFractionDigits:2})}
  let body='',message='';
  switch(config.kind){
   case 'parameter':body=axis()+poly(Array.from({length:121},(_,i)=>[55+i*5,175-100*state.amplitude*Math.sin(i/120*Math.PI*2*state.frequency)]));message=`Synthetic sine function · f = ${state.frequency.toFixed(1)}, amplitude = ${state.amplitude.toFixed(2)}`;break;
   case 'threshold':{const labels=config.data?.labels||vals.map((v,i)=>i%5===0?Number(v<.5):Number(v>.45));let tp=0,fp=0,fn=0,tn=0;vals.forEach((v,i)=>{if(v>=state.threshold)labels[i]?tp++:fp++;else labels[i]?fn++:tn++});body=axis()+vals.map((v,i)=>circle(55+v*610,130+(i%3)*50,9,v>=state.threshold?'#ae4f31':'#28617b')).join('')+line(55+state.threshold*610,60,55+state.threshold*610,295,'#ae4f31',3);message=`Synthetic labels · TP ${tp}, FP ${fp}, FN ${fn}, TN ${tn}`;state.counts={tp,fp,fn,tn};break}
   case 'scrubber':body=axis()+poly(series.map(s=>[55+s.x*610,300-s.y*250]))+line(55+series[state.time].x*610,45,55+series[state.time].x*610,300,'#ae4f31',3);message=`Sample ${state.time+1} / ${series.length}; y = ${series[state.time].y.toFixed(3)}`;break;
   case 'comparison':plot.innerHTML=`<div class="w-compare"><img src="${assets.photo}" alt="Coffee photograph in grayscale" style="filter:grayscale(1)"><img src="${assets.photo}" alt="Original color coffee photograph" style="clip-path:inset(0 ${100-state.split}% 0 0)"><div class="w-divider" style="left:${state.split}%"></div></div>`;message='Same photograph and registration; grayscale is a declared display transformation.';break;
   case 'hotspots':body=['source','sample','detector'].map((s,i)=>rect(75+i*220,100,160,130,state.part===s?'#c89965':'#dce6e8')+text(155+i*220,260,s,22,'middle')).join('');message={source:'Source: generates the input signal.',sample:'Sample: the object being examined.',detector:'Detector: records the output signal.'}[state.part];break;
   case 'tabs':plot.innerHTML=`<div class="w-reading"><h2>${esc({method:'Method',result:'Result',limits:'Limitations'}[state.tab])}</h2><p>${esc({method:'Change one parameter while keeping the input and scale fixed.',result:'The demonstration recomputes a toy function from the selected parameter. It is not a measured result.',limits:'Synthetic data cannot establish scientific or product performance. Replace it with verified evidence.'}[state.tab])}</p></div>`;message='Use sections when optional detail would distract from the main explanation.';break;
   case 'layers':body=(state.path?line(165,165,520,165,'#ae4f31',5):'')+(state.base?rect(80,95,170,145,'#dce6e8')+rect(440,95,170,145,'#dce6e8'):'')+(state.labels?text(165,280,'Input',22,'middle')+text(525,280,'Output',22,'middle'):'');message='Toggle layers without deleting their source geometry.';break;
   case 'table':{const data=[['A',12],['B',31],['C',24],['D',18]].sort((a,b)=>state.ascending?a[1]-b[1]:b[1]-a[1]);plot.innerHTML='<table><caption>Synthetic values · numeric sort</caption><thead><tr><th scope="col">Item</th><th scope="col">Value</th></tr></thead><tbody>'+data.map(([k,v])=>`<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('')+'</tbody></table>';message=state.ascending?'Ascending':'Descending';state.order=data.map(x=>x[0]);break}
   case 'brushing':{const lo=Math.min(state.low,state.high)/100,hi=Math.max(state.low,state.high)/100,picked=series.filter(v=>v.x>=lo&&v.x<=hi);body=axis()+rect(55+lo*610,50,(hi-lo)*610,250,'#e0cba9')+series.map(v=>circle(55+v.x*610,300-v.y*250,7,v.x>=lo&&v.x<=hi?'#ae4f31':'#28617b')).join('');state.selected=picked.map(v=>v.id);message=`Selected ${picked.length} / ${series.length} observations. Range changes both selection and count.`;break}
   case 'histogram':{const bins=Array(state.bins).fill(0);vals.forEach(v=>bins[Math.min(bins.length-1,Math.floor(v*bins.length))]++);body=axis()+bins.map((n,i)=>rect(60+i*600/bins.length,300-n*42,600/bins.length-5,n*42)).join('');state.counts=bins;message=`${bins.length} equal-width bins; total count ${bins.reduce((a,b)=>a+b,0)} is conserved.`;break}
   case 'bootstrap':{let seed=state.seed+1;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};const sample=Array.from({length:state.n},()=>vals[Math.floor(random()*vals.length)]),mean=sample.reduce((a,b)=>a+b,0)/sample.length;body=axis()+sample.map((v,i)=>circle(55+i*580/(sample.length-1),300-v*245,8)).join('')+line(55,300-mean*245,665,300-mean*245,'#ae4f31',3);state.mean=mean;message=`Seeded resample mean = ${mean.toFixed(3)}. One resample is not a confidence interval.`;break}
   case 'ablation':{const value=40+Number(state.a)*15+Number(state.b)*8+Number(state.c)*12;body=axis()+rect(140,300-value*2.7,420,value*2.7)+text(350,80,String(value),42,'middle');state.value=value;message='Toy additive score: 40 + 15A + 8B + 12C. Not a measured benchmark.';break}
   case 'quiz':plot.innerHTML='<div class="w-reading"><h2>What should accompany an estimate?</h2><p>Choose the option that helps the audience judge the strength of the evidence.</p></div>';message=state.checked?(state.choice==='range'?'Correct: show the estimate with its uncertainty and conditions.':state.choice==='none'?'Choose an answer first.':'Try again: visual polish cannot substitute for uncertainty.'):'Local practice only. No scores leave this page.';break;
   case 'decision':{const result=state.evidence==='no'?'Gather evidence':state.interactive==='yes'?'Use focused interaction':'Use a stable visual';body=rect(130,80,440,65,'#dce6e8')+text(350,122,'Audience question',25,'middle')+line(350,150,350,220,'#28617b',4)+rect(95,225,510,75,'#c6d8dc')+text(350,273,result,25,'middle');state.result=result;message='Choose interaction only when it helps inspect a meaningful alternative.';break}
   case 'graph':{const edges=[[0,1],[2,3],...(state.bridge?[[1,2]]:[]),...(state.direct?[[0,3]]:[])],seen=new Set([0]);let changed=true;while(changed){changed=false;for(const [a,b]of edges)if(seen.has(a)&&!seen.has(b)){seen.add(b);changed=true}}body=edges.map(([a,b])=>line(115+a*150,170,115+b*150,170,'#718594',4)).join('')+[0,1,2,3].map(i=>circle(115+i*150,170,28,seen.has(i)?'#28617b':'#b8c8ce')+text(115+i*150,235,String.fromCharCode(65+i),22,'middle')).join('');state.reachable=[...seen];message=`Reachable from A: ${[...seen].map(i=>String.fromCharCode(65+i)).join(', ')}`;break}
   case 'matrix':body=Array.from({length:20},(_,i)=>{const r=Math.floor(i/5)+1,c=i%5+1;return rect(115+(c-1)*98,45+(r-1)*68,90,60,r===state.row&&c===state.column?'#c89965':'#dce6e8')+text(160+(c-1)*98,84+(r-1)*68,r*c,21,'middle')}).join('');message=`Selected row ${state.row}, column ${state.column}; synthetic value ${state.row*state.column}`;break;
   case 'magnifier':plot.innerHTML=`<div class="w-magnifier"><img src="${assets.photo}" alt="Coffee photograph: user-selected crop" style="transform:scale(${state.zoom});transform-origin:${state.x}% ${state.y}%"></div>`;message='A declared crop changes framing, not the underlying photograph.';break;
   case 'video':message='5-second procedural clip · native controls · English captions · static poster fallback';break;
   case 'audio':message='2-second low-amplitude synthetic tone. No autoplay.';break;
   case 'cad-orbit':case 'cad-explode':case 'cad-section':case 'cad-import':{const data=StudioMesh.draw(plot.querySelector('canvas'),mesh,state);state.triangles=data.triangles;state.drawn=data.drawn;message=(state.filename?state.filename+' · ':'Original assembly · ')+`${data.triangles} triangles. `+(config.kind==='cad-section'?'Open cutaway, not a capped CAD solid.':'Units: mm for the supplied fixture; imported mesh units are not inferred.');break}
   case 'ink':{const cv=plot.querySelector('canvas'),ctx=cv.getContext('2d');ctx.fillStyle='#edf2f3';ctx.fillRect(0,0,700,360);ctx.strokeStyle='#28617b';ctx.lineWidth=3;ctx.strokeRect(150,95,350,180);ctx.font='28px sans-serif';ctx.fillStyle='#17252d';ctx.fillText('Annotate the evidence',185,195);ctx.strokeStyle='#ae4f31';ctx.lineWidth=5;for(const p of state.paths){ctx.beginPath();p.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke()}message='Pointer drawing has a keyboard-accessible preset and reset. Annotations are session-local.';break}
  }
  if(body || config.kind==='layers')plot.innerHTML=svg(body);status.textContent=message;root.dataset.state=JSON.stringify(state);
  summary.innerHTML='<div style="font-size:17px;margin-bottom:22px">Selected state · static view</div>'+controls.map(([key,el])=>{const title=el.parentElement.querySelector('span')?.textContent||key;const value=el.type==='checkbox'?(state[key]?'Included':'Excluded'):el.tagName==='SELECT'?el.selectedOptions[0]?.textContent:state[key];return '<div style="margin-bottom:17px">'+esc(title)+'<br><strong>'+esc(value)+'</strong></div>'}).join('');
 }
 render();const hooks={reset,snapshot:()=>JSON.parse(JSON.stringify(state)),restore:s=>{if(s){state=s;render()}},onEnter:()=>{},onStep:()=>{},onLeave:()=>{if(media)media.pause()},onExport:()=>{if(media)media.pause();render()},dispose:()=>{abort.abort();if(media)media.pause()}};
 SlideStudio.register(config.id,hooks);return hooks;
}
window.mountStudioWidgets=(configs,assets)=>configs.map(c=>mount(c,assets));
})();
