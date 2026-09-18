/* Deterministic presentation states. Widgets own their content, not global navigation.
 * A transition never owns the final state: target styles are committed before animating.
 * Exports and reduced-motion enter the same stable states without cosmetic movement. */
(()=>{'use strict';
 const meta=JSON.parse(document.getElementById('slide-studio-meta').textContent);
 const slides=[...document.querySelectorAll('.slide')],mq=matchMedia('(prefers-reduced-motion: reduce)');
 const warnings=[],widgets=new Map(),tracks=new WeakMap(),animations=new Set(),lastSteps=Array(slides.length).fill(0);
 let current=0,step=0,exporting=new URLSearchParams(location.search).has('static'),overview=false,restore=null,enteredIndex=null;
 const $=id=>document.getElementById(id),warn=e=>{warnings.push(String(e));console.warn('[Slide Studio]',e)};
 const call=(widget,method,...args)=>{try{return widget?.[method]?.(...args)}catch(e){warn(`${method}: ${e.message}`)}};
 const max=i=>Math.max(0,...[...slides[i].querySelectorAll('[data-step],[data-states]')].flatMap(el=>{
  const v=[Number(el.dataset.step)||0];try{if(el.dataset.states)v.push(...Object.keys(JSON.parse(el.dataset.states)).map(Number))}catch{}return v.filter(Number.isFinite)}));
 for(const slide of slides)for(const el of slide.querySelectorAll('[data-states]')){
  try{const map=JSON.parse(el.dataset.states),keys=Object.keys(map).map(Number).sort((a,b)=>a-b);if(!map['0']||keys.some(k=>!Number.isInteger(k)||k<0))throw Error('state 0 and nonnegative integer keys required');const base={};for(const state of Object.values(map)){
   if(!state||typeof state!=='object'||Array.isArray(state))throw Error('CSS property map required');
   for(const key of Object.keys(state)){if(!(key in el.style)&&!key.startsWith('--'))throw Error(`unknown CSS property ${key}`);base[key]=key.startsWith('--')?el.style.getPropertyValue(key):el.style[key]||getComputedStyle(el)[key];}}
   tracks.set(el,{map,keys,base});
  }catch(e){warn(`${slide.id}: ${e.message}`)}
 }
 function finish(){for(const a of animations){try{a.finish();a.cancel()}catch{a.cancel()}}animations.clear()}
 function transition(el,to,animate,entryFrom=null){
  const from={};for(const [k,v]of Object.entries(to)){from[k]=k.startsWith('--')?getComputedStyle(el).getPropertyValue(k):getComputedStyle(el)[k];k.startsWith('--')?el.style.setProperty(k,String(v)):el.style[k]=String(v)}
  if(!animate||mq.matches||exporting||!el.animate)return;
  const requested=el.dataset.duration===undefined?500:Number(el.dataset.duration);const duration=Number.isFinite(requested)?Math.min(1600,Math.max(0,requested)):500;
  try{const a=el.animate([entryFrom||from,to],{duration,easing:el.dataset.easing||'cubic-bezier(.22,.68,.2,1)',fill:'none'});animations.add(a);a.finished.then(()=>{animations.delete(a);a.cancel()}).catch(()=>animations.delete(a))}catch(e){warn(e.message)}
 }
 // Entry effects are a decoration on a committed state, never a second navigator.
 const entryEffects={
  reveal:[{opacity:0},{opacity:1}],
  lift:[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0px)'}],
  slide:[{opacity:0,transform:'translateX(-28px)'},{opacity:1,transform:'translateX(0px)'}],
  wipe:[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)'}],
  trace:[{strokeDashoffset:'1'},{strokeDashoffset:'0'}],
  focus:[{opacity:0.2},{opacity:1}],
  settle:[{opacity:0,transform:'scale(.96)'},{opacity:1,transform:'scale(1)'}]
 };
 function context(i=current){return {slide:slides[i],index:i,step:i===current?step:lastSteps[i],exporting,reducedMotion:mq.matches,active:i===current&&!overview&&!exporting}}
 function apply(i,at,animate){
  const slide=slides[i];
  for(const el of slide.querySelectorAll('[data-step]')){
   const on=at>=Number(el.dataset.step)&&(el.dataset.until===undefined||at<=Number(el.dataset.until));
   const was=el.dataset.studioHidden==='false';
   el.dataset.studioHidden=String(!on);el.setAttribute('aria-hidden',String(!on));el.inert=!on;
   if(on&&el.dataset.motion&&!el.hasAttribute('data-states')){
    const effect=entryEffects[el.dataset.motion];
    if(effect)transition(el,effect[1],animate&&!was,effect[0]);
    else if(!el.dataset.motionWarned){warn('Unknown entry effect: '+el.dataset.motion);el.dataset.motionWarned='true'}
   }
  }
  for(const el of slide.querySelectorAll('[data-states]')){const track=tracks.get(el);if(!track)continue;const to={...track.base};for(const k of track.keys)if(k<=at)Object.assign(to,track.map[k]);transition(el,to,animate);const hidden=el.dataset.studioHidden==='true'||to.opacity===0||to.opacity==='0'||to.visibility==='hidden';el.setAttribute('aria-hidden',String(hidden));el.inert=hidden}
  lastSteps[i]=at;slide.dataset.currentStep=String(at);for(const [id,w] of widgets)if(slide.contains($(id)))call(w,'onStep',{...context(i),step:at});
 }
 function scale(){const bar=document.querySelector('.studio-controls').getBoundingClientRect().height;document.documentElement.style.setProperty('--studio-bar',bar+'px');const r=Math.min(innerWidth/meta.width,Math.max(1,innerHeight-bar)/meta.height);document.documentElement.style.setProperty('--studio-scale',String(r));if(overview)document.querySelectorAll('.studio-thumb').forEach(w=>w.style.setProperty('--thumb-scale',w.clientWidth/meta.width))}
 function pauseSlide(i){if(enteredIndex===i)enteredIndex=null;for(const el of slides[i].querySelectorAll('video,audio'))el.pause();for(const [id,w]of widgets)if(slides[i].contains($(id)))call(w,'onLeave',context(i))}
 function show(i,n=0,{animate=false}={}){
  finish();const previous=current;current=Math.max(0,Math.min(slides.length-1,Math.floor(Number(i)||0)));step=Math.max(0,Math.min(max(current),Math.floor(Number(n)||0)));if(exporting)step=max(current);
  if(previous!==current){pauseSlide(previous);for(const el of slides[current].querySelectorAll('[data-step]'))el.dataset.studioHidden='true'}document.body.dataset.export=String(exporting);
  slides.forEach((sl,j)=>{const active=j===current;sl.classList.toggle('is-current',active);sl.setAttribute('aria-hidden',String(!active));sl.inert=!active||overview;if(active||exporting)apply(j,exporting?max(j):step,animate&&active)});
  $('studio-position').textContent=`${current+1} / ${slides.length} · ${step} / ${max(current)}`;$('studio-prev').disabled=!current&&!step;$('studio-next').disabled=current===slides.length-1&&(exporting||step===max(current));
  const s=meta.slides[current];$('studio-notes').textContent=(s.notes||'')+(s.sources?.length?'\n\n'+s.sources.map(x=>typeof x==='string'?x:JSON.stringify(x)).join('\n'):'');$('studio-announcer').textContent=s.title;
  $('studio-jump').value=String(current);history.replaceState(null,'','#'+encodeURIComponent(s.id));
  for(const [id,w]of widgets)if(slides[current].contains($(id))){if(exporting)call(w,'onExport',context());else if(enteredIndex!==current&&!overview&&!document.hidden)call(w,'onEnter',context())}
  enteredIndex=(!exporting&&!overview&&!document.hidden)?current:null;
  window.dispatchEvent(new CustomEvent('studio:state',{detail:context()}));scale();
 }
 function next(){if(!exporting&&step<max(current))show(current,step+1,{animate:true});else if(current<slides.length-1)show(current+1,0,{animate:true})}
 function prev(){if(!exporting&&step>0)show(current,step-1,{animate:true});else if(current)show(current-1,max(current-1),{animate:true})}
 function toggleOverview(){
  overview=!overview;document.body.classList.toggle('overview',overview);finish();
  if(overview)pauseSlide(current);
  slides.forEach((sl,i)=>{let w=sl.parentElement;if(overview){w=document.createElement('div');w.className='studio-thumb';w.tabIndex=0;w.setAttribute('role','button');w.setAttribute('aria-label',meta.slides[i].title);sl.before(w);w.append(sl);sl.inert=true;apply(i,max(i),false);w.onclick=()=>{toggleOverview();show(i)};w.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleOverview();show(i)}}}else if(w.classList.contains('studio-thumb')){w.before(sl);w.remove()}});
  if(!overview)show(current,step);scale();
 }
 function setExport(on){exporting=!!on;if(overview)toggleOverview();if(exporting)for(let i=0;i<slides.length;i++)pauseSlide(i);show(current,step)}
 function prepareExport(){setExport(true);for(const [id,w] of widgets){const i=slides.findIndex(sl=>sl.contains($(id)));call(w,'onExport',context(i<0?current:i));}window.dispatchEvent(new CustomEvent('studio:export'))}
 function reset(){for(const [id,w]of widgets)if(slides[current].contains($(id)))call(w,'reset');show(current,0)}
 $('studio-prev').onclick=prev;$('studio-next').onclick=next;$('studio-overview').onclick=toggleOverview;$('studio-reset').onclick=reset;
 $('studio-jump').onchange=e=>show(Number(e.target.value));
 $('studio-notes-btn').onclick=()=>{const on=$('studio-notes').classList.toggle('open');$('studio-notes-btn').setAttribute('aria-expanded',String(on))};
 $('studio-full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{warn('Fullscreen unavailable')}};
 // Navigation buttons are not content widgets. Arrow/Page keys still navigate when
 // those buttons keep focus after a mouse click; Space/Enter retain native activation.
 document.addEventListener('keydown',e=>{
  if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||e.isComposing||e.keyCode===229)return;
  const target=e.composedPath().find(x=>x instanceof Element)||document.body;
  if(e.key==='Escape'){
   if(overview){e.preventDefault();toggleOverview();return}
   if($('studio-notes').classList.contains('open')){e.preventDefault();$('studio-notes').classList.remove('open');$('studio-notes-btn').setAttribute('aria-expanded','false');return}
  }
  const navigationKey=['ArrowRight','ArrowLeft','PageDown','PageUp',' ','Enter','Home','End'].includes(e.key);
  if(e.repeat&&navigationKey){
   // Do not steal a slider's held arrow key. Only suppress presentation navigation.
   if(!target.closest('input,textarea,select,[contenteditable],[data-interactive]'))e.preventDefault();
   return;
  }
  if(overview)return;
  const onNav=!!target.closest('.studio-controls');
  if(target.closest('input,textarea,select,video,audio,[contenteditable],[data-interactive],[role="slider"],[role="textbox"],[role="combobox"],[role="grid"]'))return;
  if(target.closest('button,a,summary,[role="button"]')&&(!onNav||[' ','Enter'].includes(e.key)))return;
  if(['ArrowRight','PageDown',' ','Enter'].includes(e.key)){e.preventDefault();next()}
  else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();prev()}
  else if(e.key==='Home'){e.preventDefault();show(0)}
  else if(e.key==='End'){e.preventDefault();show(slides.length-1,max(slides.length-1))}
  else if(e.key.toLowerCase()==='o'){e.preventDefault();toggleOverview()}
  else if(e.key.toLowerCase()==='r'){e.preventDefault();reset()}
  else if(e.key.toLowerCase()==='n'){e.preventDefault();$('studio-notes-btn').click()}
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseSlide(current);else show(current,step)});
 window.addEventListener('resize',scale);mq.addEventListener('change',()=>{finish();for(let i=0;i<slides.length;i++)pauseSlide(i);show(current,step)});
 window.addEventListener('beforeprint',()=>{restore={current,step,exporting,widgets:[...widgets].map(([id,w])=>[id,call(w,'snapshot')])};prepareExport()});
 window.addEventListener('afterprint',()=>{if(!restore)return;exporting=restore.exporting;for(const [id,s]of restore.widgets)call(widgets.get(id),'restore',s);show(restore.current,restore.step);restore=null});
 const api={kind:'craft',version:3,meta,show,next,prev,finish,reset,setExport,prepareExport,showAllBuilds:prepareExport,overview:toggleOverview,
  register(id,widget){if(widgets.has(id))throw Error('Duplicate widget ID: '+id);if(!$(id))throw Error('Missing widget root: '+id);widgets.set(id,widget);if(slides[current].contains($(id)))call(widget,exporting?'onExport':'onEnter',context());return()=>{call(widget,'dispose');widgets.delete(id)}},
  getWidgetState:id=>call(widgets.get(id),'snapshot'),getState:()=>({current,step,maxBuild:max(current),exporting,overview,reducedMotion:mq.matches,warnings:[...warnings],widgets:[...widgets.keys()]})};
 window.slideStudio=window.SlideStudio=api;let id='';try{id=decodeURIComponent(location.hash.slice(1))}catch{}const initial=meta.slides.findIndex(s=>s.id===id);show(initial<0?0:initial);document.body.dataset.studioReady='true';
})();
