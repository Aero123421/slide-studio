#!/usr/bin/env node
/** Two honest export routes:
 * editable: embedded scene -> text/shapes. SVG/image nodes stay images.
 * fidelity: rendered PNG pages -> full-slide pictures. No editability claim.
 * CSS animation does not become PowerPoint animation in either route.
 */
import fs from 'node:fs/promises';import path from 'node:path';import {dependency} from './deps.mjs';
const args=process.argv.slice(2),input=args[0],output=args[1];const val=k=>{const i=args.indexOf(k);return i<0?undefined:args[i+1]};const mode=val('--mode')||'editable',adapter=val('--adapter')||'pptxgenjs';
try{
 if(!input||!output)throw Error('Usage: node export-pptx.mjs deck.html deck.pptx [--adapter artifact|pptxgenjs] [--mode editable|fidelity] [--png-dir DIR] [--force]');
 if(!['editable','fidelity'].includes(mode))throw Error('Unknown export mode');if(!['artifact','pptxgenjs'].includes(adapter))throw Error('Unknown adapter');
 try{await fs.access(output);if(!args.includes('--force'))throw Error('Output exists; use --force only to replace this file.')}catch(e){if(e.code!=='ENOENT')throw e}
 const inputText=await fs.readFile(input,'utf8');let scene;if(input.endsWith('.json'))scene=JSON.parse(inputText);else {const match=inputText.match(/<script type="application\/json" id="slide-studio-scene">([\s\S]*?)<\/script>/);if(match)scene=JSON.parse(match[1]);}
 if(mode==='editable'&&!scene)throw Error('Editable export requires Slide Studio generated HTML or .scene.json. Use fidelity mode for arbitrary HTML.');
 let pictures=[];if(mode==='fidelity'){const dir=val('--png-dir');if(!dir)throw Error('fidelity mode needs --png-dir from render.mjs');pictures=(await fs.readdir(dir)).filter(n=>/^slide-\d+\.png$/.test(n)).sort((a,b)=>Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0])).map(n=>path.resolve(dir,n));if(!pictures.length)throw Error('No slide PNGs');if(scene&&pictures.length!==scene.slides.length)throw Error('PNG count does not match scene');}
 const slides=mode==='editable'?scene.slides:pictures.map((pic,i)=>({title:scene?.slides[i]?.title||'Slide '+(i+1),paper:'#FFFFFF',notes:scene?.slides[i]?.notes||'',sources:scene?.slides[i]?.sources||[],elements:[{type:'image',src:pic,x:0,y:0,w:1280,h:720,alt:'Full-slide rendering'}]}));
 const note=s=>s.notes+(s.sources?.length?'\n\n[Sources]\n'+s.sources.map(x=>typeof x==='string'?x:JSON.stringify(x)).join('\n'):'')+`\n\n[Export] ${mode}; HTML motion flattened. SVG/image elements remain pictures.`;
 await fs.mkdir(path.dirname(path.resolve(output)),{recursive:true});
 if(adapter==='artifact'){
  const {Presentation,PresentationFile}=await dependency('@oai/artifact-tool');const deck=Presentation.create({slideSize:{width:1280,height:720}});
  for(const s of slides){const slide=deck.slides.add();slide.background.fill=s.paper;slide.speakerNotes.textFrame.setText(note(s));for(const n of s.elements){const position={left:n.x,top:n.y,width:Math.max(n.w,.01),height:Math.max(n.h,.01)};
   if(n.type==='text'){const sh=slide.shapes.add({name:n.id,geometry:'textbox',position,fill:'none',line:{fill:'none',width:0}});sh.text=n.text;sh.text.style={fontSize:n.size,typeface:n.font,color:n.color,bold:n.weight>=600,alignment:n.align,verticalAlignment:'top',insets:{top:0,right:0,bottom:0,left:0},lineSpacing:n.lineHeight};}
   else if(n.type==='image'||n.type==='svg'){if(n.svg)slide.images.add({svg:n.svg,alt:n.alt||s.title,position,fit:n.fit||'contain'});else if(n.src.startsWith('data:')){const [head,data]=n.src.split(',');slide.images.add({blob:new Uint8Array(Buffer.from(data,'base64')),contentType:head.slice(5).split(';')[0],position,alt:n.alt||'',fit:n.fit||'contain'})}else slide.images.add({blob:new Uint8Array(await fs.readFile(n.src)),contentType:'image/png',position,alt:n.alt||'',fit:'contain'});}
   else if(n.type==='line'){const x1=n.x1??n.x,y1=n.y1??n.y,x2=n.x2??n.x+n.w,y2=n.y2??n.y+n.h;const len=Math.hypot(x2-x1,y2-y1);if(len>0)slide.shapes.add({name:n.id,geometry:'line',position:{left:(x1+x2-len)/2,top:(y1+y2)/2,width:len,height:0.01,rotation:(Math.atan2(y2-y1,x2-x1)*180/Math.PI+360)%360},fill:'none',line:{fill:n.stroke,width:n.strokeWidth}});}
   else slide.shapes.add({name:n.id,geometry:n.type==='ellipse'?'ellipse':n.radius?'roundRect':'rect',position,fill:n.fill,line:{fill:n.stroke,width:n.strokeWidth},...(n.radius?{borderRadius:n.radius}:{})});
  }}
  const pptx=await PresentationFile.exportPptx(deck);await pptx.save(output);
  if(val('--preview-dir')){const dir=val('--preview-dir');await fs.mkdir(dir,{recursive:true});for(const [i,s]of deck.slides.items.entries()){const b=await deck.export({slide:s,format:'png',scale:1});await fs.writeFile(path.join(dir,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await b.arrayBuffer()))}}
 }else{
  const mod=await dependency('pptxgenjs');const Pptx=mod.default;const deck=new Pptx();deck.defineLayout({name:'STUDIO',width:1280/96,height:720/96});deck.layout='STUDIO';deck.title=scene?.title||'HTML presentation';deck.author='';deck.subject='Created with Slide Studio';
  for(const s of slides){const slide=deck.addSlide();slide.background={color:s.paper.slice(1)};slide.addNotes(note(s));for(const n of s.elements){let p={x:n.x/96,y:n.y/96,w:n.w/96,h:n.h/96};if(n.type==='text')slide.addText(n.text,{...p,fontFace:n.font,fontSize:n.size*.75,color:n.color.slice(1),bold:n.weight>=600,align:n.align,vertAlign:'top',margin:0,breakLine:false,lineSpacingMultiple:n.lineHeight,paraSpaceAfterPt:0});else if(n.type==='svg'||n.type==='image'){const source=n.src.startsWith('data:')?{data:n.src}:{path:n.src};slide.addImage({...source,...p,altText:n.alt||s.title,sizing:{type:n.fit==='cover'?'cover':'contain',w:p.w,h:p.h}});}else{const fill=n.fill==='none'?{color:'FFFFFF',transparency:100}:{color:n.fill.slice(1)};const stroke=n.stroke==='none'?{color:'FFFFFF',transparency:100}:{color:n.stroke.slice(1),width:n.strokeWidth*.75};if(n.type==='line'){const x1=n.x1??n.x,y1=n.y1??n.y,x2=n.x2??n.x+n.w,y2=n.y2??n.y+n.h;const len=Math.hypot(x2-x1,y2-y1);if(len===0)continue;p={x:(x1+x2-len)/192,y:(y1+y2)/192,w:len/96,h:0,rotate:(Math.atan2(y2-y1,x2-x1)*180/Math.PI+360)%360};}slide.addShape(n.type==='ellipse'?deck.ShapeType.ellipse:n.type==='line'?deck.ShapeType.line:n.radius?deck.ShapeType.roundRect:deck.ShapeType.rect,{...p,fill,line:stroke,...(n.radius?{radius:n.radius/96}:{})});}}}
  await deck.writeFile({fileName:output});
 }
 console.log(JSON.stringify({output:path.resolve(output),slides:slides.length,adapter,mode,editable:mode==='editable'?'text, tables-as-text/shapes, basic vector charts; images/SVG remain pictures':'none (one picture per slide)',animations:'not preserved'},null,2));
}catch(e){console.error('PPTX:',e.message);process.exitCode=1}
