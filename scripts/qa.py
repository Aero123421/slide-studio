#!/usr/bin/env python3
"""Offline Chromium QA. Default: report.json + a single review.html, no loose images.
Every chosen state is measured and captured; review frames are embedded, not scattered.
This is geometric/functional evidence, not an automatic aesthetic or factual approval.
"""
from __future__ import annotations
import argparse,base64,hashlib,html,io,json,os,shutil,subprocess,sys
from urllib.parse import urlparse,unquote
from pathlib import Path
from review_workspace import ReviewWorkspace,safe_root
MEASURE=r"""(slide)=>{
 const b=slide.getBoundingClientRect(),scale=b.width/parseFloat(getComputedStyle(slide).width);const overflow=[],missingAlts=[],broken=[],small=[],waivers=[];
 const visible=e=>{if(!e.getClientRects().length)return false;for(let p=e;p&&p!==slide.parentElement;p=p.parentElement){const s=getComputedStyle(p);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false}return true};
 const clipped=(e,r)=>{let z={left:r.left,right:r.right,top:r.top,bottom:r.bottom};for(let p=e.parentElement;p&&p!==slide;p=p.parentElement){const c=getComputedStyle(p);if(['hidden','clip','scroll','auto'].includes(c.overflow)){const b=p.getBoundingClientRect();z={left:Math.max(z.left,b.left),right:Math.min(z.right,b.right),top:Math.max(z.top,b.top),bottom:Math.min(z.bottom,b.bottom)}}}return z};
 const ref=e=>e.id||e.getAttribute('data-role')||e.tagName.toLowerCase();
 for(const e of slide.querySelectorAll('h1,h2,h3,p,li,figcaption,label,button,input,select,output,svg,img,video,canvas,[data-check]')){
  if(!visible(e))continue;const r=clipped(e,e.getBoundingClientRect()),reason=e.closest('[data-qa-overflow]')?.getAttribute('data-qa-overflow');
  if(reason){waivers.push({element:ref(e),reason});continue}
  if(r.left<b.left-2||r.top<b.top-2||r.right>b.right+2||r.bottom>b.bottom+2)overflow.push({element:ref(e),text:(e.textContent||'').slice(0,70)});
  if(e.matches('h1,h2,h3,p,li,figcaption,label,output')&&parseFloat(getComputedStyle(e).fontSize)<15)small.push(ref(e));
 }
 for(const im of slide.querySelectorAll('img')){if(!im.hasAttribute('alt'))missingAlts.push(ref(im));if(visible(im)&&(!im.complete||!im.naturalWidth))broken.push(im.getAttribute('src')?.slice(0,60))}
 const rects=[];const walker=document.createTreeWalker(slide,NodeFilter.SHOW_TEXT);let n;
 while(n=walker.nextNode()){const e=n.parentElement;if(!n.textContent.trim()||!e||!visible(e)||e.closest('script,style,option,button,select,[data-qa-overlap]'))continue;
  const range=document.createRange();range.selectNodeContents(n);for(const raw of range.getClientRects()){const c=clipped(e,raw),r={left:c.left,top:c.top,right:c.right,bottom:c.bottom,x:c.left,y:c.top,width:c.right-c.left,height:c.bottom-c.top};if(r.width<1||r.height<1)continue;rects.push({x:r.x,y:r.y,w:r.width,h:r.height,text:n.textContent.trim().slice(0,50),parent:e});
  if(r.left<b.left-2||r.top<b.top-2||r.right>b.right+2||r.bottom>b.bottom+2)overflow.push({element:ref(e),text:n.textContent.trim().slice(0,60)})}
 }
 const overlaps=[];for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){const a=rects[i],c=rects[j];if(a.parent===c.parent||a.parent.contains(c.parent)||c.parent.contains(a.parent))continue;const w=Math.min(a.x+a.w,c.x+c.w)-Math.max(a.x,c.x),h=Math.min(a.y+a.h,c.y+c.h)-Math.max(a.y,c.y);if(w>3*scale&&h>4*scale)overlaps.push([a.text,c.text])}
 return {overflow,overlaps,missingAlts,broken,smallTextWarnings:[...new Set(small)],waivers};
}"""
def launch(p):
    executable=os.environ.get('SLIDE_STUDIO_CHROMIUM') or shutil.which('chromium') or shutil.which('chromium-browser')
    return p.chromium.launch(headless=True,**({'executable_path':executable} if executable else {}))
def open_deck(page,file):
    if os.environ.get('SLIDE_STUDIO_INLINE')=='1':page.set_content(Path(file).read_text(encoding='utf-8'),wait_until='load')
    else:page.goto(Path(file).resolve().as_uri(),wait_until='load')
    page.evaluate('document.fonts.ready')
    page.wait_for_function("window.slideStudio && (document.body.dataset.studioReady==='true' || !window.slideStudio.kind)",timeout=15000)
    page.evaluate("async()=>{await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))}")
def guard_network(page,blocked):
    def route(r):
        if r.request.url.startswith(('http://','https://')):
            blocked.append(r.request.url.split('?')[0]);r.abort()
        else:r.continue_()
    page.route('**/*',route)
    if hasattr(page,'route_web_socket'):page.route_web_socket('**/*',lambda ws:ws.close())
def css_preflight(styles):
    r=subprocess.run(['node',str(Path(__file__).with_name('css-check.mjs'))],input=json.dumps(styles),capture_output=True,text=True)
    if r.returncode not in (0,2):raise ValueError('CSS preflight could not run: '+r.stderr[:500])
    return json.loads(r.stdout)
def render(args):
    from playwright.sync_api import sync_playwright
    from PIL import Image
    inp=Path(args.input).resolve()
    if not inp.is_file():raise ValueError('Input HTML does not exist')
    root=safe_root(args.out)
    if inp==root or root in inp.parents:raise ValueError('Input cannot be inside the review output directory')
    errors=[];blocked=[];results=[];cards=[];kept=0;final_copy=[];styles=set();local_assets={}
    initial_sha=hashlib.sha256(inp.read_bytes()).hexdigest()
    def record_asset(response):
        url=urlparse(response.url)
        if url.scheme!='file':return
        file=Path(unquote(url.path)).resolve()
        if file==inp:return
        try:local_assets[os.path.relpath(file,inp.parent)]=hashlib.sha256(file.read_bytes()).hexdigest()
        except OSError as e:errors.append('Cannot fingerprint a loaded local asset: '+str(e))
    with ReviewWorkspace(root) as output,sync_playwright() as p:
        browser=launch(p)
        try:
            page=browser.new_page(viewport={'width':args.width,'height':args.height},device_scale_factor=1,reduced_motion='reduce' if args.reduced_motion else 'no-preference',service_workers='block')
            page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',record_asset);guard_network(page,blocked);open_deck(page,inp)
            styles.update(page.locator('style').all_text_contents())
            for rel in local_assets:
                if Path(rel).suffix.lower()=='.css':styles.add((inp.parent/rel).read_text(encoding='utf-8'))
            page.evaluate('(rules)=>window.__studioReviewCopyRules=rules',json.loads((Path(__file__).resolve().parents[1]/'assets/copy-rules.json').read_text(encoding='utf-8'))['rules'])
            count=page.locator('.slide').count();kind=page.evaluate("window.slideStudio.kind||'legacy'")
            duplicate_ids=page.evaluate("()=>{const a=[...document.querySelectorAll('[id]')].map(e=>e.id);return [...new Set(a.filter((id,i)=>a.indexOf(id)!==i))]}")
            for i in range(count):
                if kind=='craft':page.evaluate('()=>window.slideStudio.setExport(false)')
                page.evaluate('(i)=>window.slideStudio.show(i,0)',i)
                m=page.evaluate('window.slideStudio.getState().maxBuild||0')
                steps=list(range(m+1)) if args.states=='all' else sorted(set([0,m//2,m])) if args.states=='sampled' else []
                if kind!='craft':steps=[]
                for step in steps+['final']:
                    if kind=='craft':page.evaluate('(x)=>{window.slideStudio.setExport(x.final);window.slideStudio.show(x.i,x.s);window.slideStudio.finish()}',{'final':step=='final','i':i,'s':m if step=='final' else step})
                    else:page.evaluate('(i)=>{window.slideStudio.showAllBuilds();window.slideStudio.show(i,999)}',i)
                    page.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
                    sl=page.locator('.slide').nth(i);q=sl.evaluate(MEASURE);q.update(sl.evaluate((Path(__file__).resolve().parents[1]/'assets/runtime/review-metrics.js').read_text(encoding='utf-8')))
                    q.update(sl.evaluate((Path(__file__).resolve().parents[1]/'assets/runtime/rendered-integrity.js').read_text(encoding='utf-8')))
                    styles.update(page.locator('style').all_text_contents())
                    failed=any(q[k] for k in ['overflow','overlaps','missingAlts','broken']) or q['copyBlocking'] or q['integrityBlocking']
                    name=f'frame-{i+1:03d}-{step}';results.append({'slide':i+1,'state':step,**q,'passed':not failed})
                    if step=='final':
                        final_copy.append(sl.evaluate(r"""el=>{
                          const seen=e=>{for(let p=e;p&&p!==el.parentElement;p=p.parentElement){const c=getComputedStyle(p);if(c.display==='none'||c.visibility==='hidden'||+c.opacity===0)return false}return !!e.getClientRects().length};
                          const heading=[...el.querySelectorAll('h1,h2')].find(seen);
                          const texts=[];const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;
                          while(n=walk.nextNode())if(n.textContent.trim()&&seen(n.parentElement)&&!n.parentElement.closest('script,style,template,option,h1,h2,h3'))texts.push(n.textContent.trim());
                          return {id:el.id,title:heading?.textContent||'',body:texts.join(' '),language:el.lang||document.documentElement.lang};
                        }"""))
                    buf=sl.screenshot(animations='disabled')
                    # Explicit all-state review includes all states in ONE HTML file.
                    if args.review_states or step=='final' or failed:
                        image=Image.open(io.BytesIO(buf)).convert('RGB');image.thumbnail((960,540));stream=io.BytesIO();image.save(stream,'WEBP',quality=82)
                        encoded=base64.b64encode(stream.getvalue()).decode('ascii')
                        cards.append(f'<figure><figcaption>{name}{" — inspect" if failed else ""}</figcaption><img alt="{name}" src="data:image/webp;base64,{encoded}"></figure>')
                    if args.keep=='all' or (args.keep=='failures' and failed and kept<args.max_failures):output.write(name+'.png',buf);kept+=1
            editorial_source=(Path(__file__).resolve().parents[1]/'assets/runtime/editorial-review.mjs').read_text(encoding='utf-8').replace('export function','function')
            editorial_review=page.evaluate('(slides)=>{'+editorial_source+';return reviewCopy(slides)}',final_copy)
            warnings=page.evaluate('window.slideStudio.getState().warnings||[]');browser_version=browser.version
        finally:browser.close()
        report={'input':inp.name,'sha256':hashlib.sha256(inp.read_bytes()).hexdigest(),'browser':browser_version,'loadMode':'inline-self-contained' if os.environ.get('SLIDE_STUDIO_INLINE')=='1' else 'file-url','viewport':[args.width,args.height],'slides':count,'inspectedStates':len(results),'errors':errors,'blockedNetwork':blocked,'duplicateIds':duplicate_ids,'playerWarnings':warnings,'results':results,'passed':not (errors or blocked or duplicate_ids or warnings) and all(x['passed'] for x in results),'limits':['Geometry heuristics; not a factual, aesthetic, translation, or accessibility certification.','All rendered frames still need human/vision review.','This command exercises Chromium; other browser testing is separate.'],'retention':{'policy':args.keep,'looseFrames':kept,'failureCap':args.max_failures,'reviewFrames':len(cards)}}
        if count==0:errors.append('No slides inspected')
        if initial_sha!=report['sha256']:errors.append('Input changed during QA; rebuild and rerun')
        for rel,sha in local_assets.items():
            file=inp.parent/rel
            if not file.is_file() or hashlib.sha256(file.read_bytes()).hexdigest()!=sha:errors.append('Local asset changed during QA: '+rel)
        report['localAssets']=[{'path':rel,'sha256':sha} for rel,sha in sorted(local_assets.items())]
        report['qaVersion']='3.4.0'
        report['cssIntegrity']=css_preflight(sorted(styles))
        report['passed']=report['passed'] and not errors and report['cssIntegrity']['passed']
        report['limits'] += ['Structural CSS checks do not validate every selector or declaration.','Solid-color contrast is conservative; image, SVG and composited backgrounds require pixel review.','Widget choice branches are not exercised by --states all; that option covers declared slide builds.']
        report['editorialReview']=editorial_review
        report['automatedChecksPassed']=report['passed']
        report['deliveryApproved']=False
        report['reviewRequired']=['source version, table columns, claims and units','natural audience copy','diagram meaning','every meaningful widget choice','reading-mode density','visual hierarchy and image focal subjects','requested export']
        report['designHintCount']=sum(len(r.get('qualityHints',[])) for r in results)
        output.write('report.json',json.dumps(report,ensure_ascii=False,indent=2))
        output.write('review.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Rendered slide review</title><style>body{font:16px/1.5 sans-serif;background:#e9edf0;margin:24px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,480px),1fr));gap:24px}figure{margin:0}img{width:100%;height:auto;cursor:zoom-in}img:active{position:fixed;inset:3vh 3vw;width:94vw;height:94vh;object-fit:contain;background:#10151ddd;z-index:2}figcaption{padding:8px 0}</style><h1>'+html.escape(inp.name)+'</h1><p>Automated checks: '+('PASS' if report['passed'] else 'FAIL')+'. Visual and factual review still required. Press and hold a frame to enlarge. Inspect report.json for CSS, contrast, mark paint, crop, density, clipping and layout findings. Do not add blanket waivers to silence them.</p><main>'+''.join(cards)+'</main></html>')
    return report

def main():
    a=argparse.ArgumentParser(description=__doc__);a.add_argument('input');a.add_argument('--out',default='.studio-review/current');a.add_argument('--states',choices=['none','sampled','all'],default='sampled');a.add_argument('--keep',choices=['none','failures','all'],default='none');a.add_argument('--max-failures',type=int,default=6);a.add_argument('--width',type=int,default=1280);a.add_argument('--height',type=int,default=780);a.add_argument('--reduced-motion',action='store_true');a.add_argument('--review-states',action='store_true');a.add_argument('--check',action='store_true');args=a.parse_args()
    if not 0<=args.max_failures<=100:a.error('--max-failures must be 0..100')
    if min(args.width,args.height)<240:a.error('Viewport must be at least 240 pixels per side')
    try:
        r=render(args);print(json.dumps({k:r[k] for k in ['slides','inspectedStates','automatedChecksPassed','deliveryApproved','designHintCount','retention']},indent=2));return 2 if args.check and not r['passed'] else 0
    except Exception as e:print('QA:',e,file=sys.stderr);return 1
if __name__=='__main__':sys.exit(main())
