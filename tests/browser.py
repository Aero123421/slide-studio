#!/usr/bin/env python3
"""Real Chromium regression tests. No API keys, screenshots or reports retained by default.
Use --out a JSON path to retain a compact machine-readable record outside the skill.
Use SLIDE_STUDIO_INLINE=1 only when file navigation is unavailable and HTML is self-contained.
"""
from pathlib import Path
import argparse,json,sys,hashlib,struct
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from qa import launch,open_deck,guard_network
from playwright.sync_api import sync_playwright

def main():
 a=argparse.ArgumentParser(description=__doc__);a.add_argument('--out');args=a.parse_args();checks=[];errors=[];blocked=[]
 def check(name,fn):
  try:fn();checks.append({'name':name,'passed':True});print('PASS '+name,flush=True)
  except Exception as e:checks.append({'name':name,'passed':False,'error':str(e)[:1600]});print('FAIL '+name+': '+str(e)[:200],flush=True)
 def expect(v,msg='Assertion failed'):
  if not v:raise AssertionError(msg)
 with sync_playwright() as pw:
  browser=launch(pw)
  try:
   page=browser.new_page(viewport={'width':1280,'height':780},service_workers='block');page.on('pageerror',lambda e:errors.append(str(e)));guard_network(page,blocked)
   page.set_default_timeout(3000)
   open_deck(page,ROOT/'gallery/interactions.html')
   def show(kind):
    page.evaluate('(id)=>{SlideStudio.setExport(false);SlideStudio.show(SlideStudio.meta.slides.findIndex(s=>s.id===id))}','interaction-'+kind)
    return page.locator('#interaction-'+kind+'-widget')
   def state(kind):return page.evaluate('(id)=>SlideStudio.getWidgetState(id)','interaction-'+kind+'-widget')
   def value(root,label,v):
    el=root.get_by_label(label,exact=True);el.evaluate('(el,v)=>{el.value=v;el.dispatchEvent(new Event("input",{bubbles:true}))}',str(v))
   def reset(kind):show(kind).get_by_role('button',name='Reset example',exact=True).click()
   check('page identity, content and registered 24 widgets',lambda:(expect('Interactive' in page.title() or 'Interaction' in page.title()),expect(page.locator('.slide').count()==24),expect(len(page.evaluate('SlideStudio.getState().widgets'))==24)))
   def parameter():
    r=show('parameter');before=state('parameter')['frequency'];el=r.get_by_label('Frequency',exact=True);el.focus();el.press('ArrowRight');expect(state('parameter')['frequency']>before);expect(page.evaluate('SlideStudio.getState().current')==0);expect(r.locator('polyline').get_attribute('points') is not None);reset('parameter');expect(state('parameter')['frequency']==before)
   check('range keyboard changes parameter without advancing slide; reset',parameter)
   def threshold():
    r=show('threshold');value(r,'Decision threshold',.35);s=state('threshold');expect(s['counts']=={'tp':9,'fp':4,'fn':2,'tn':5});value(r,'Decision threshold',.65);expect(state('threshold')['counts']=={'tp':5,'fp':1,'fn':6,'tn':8});reset('threshold')
   check('threshold counts recomputed exactly from 20 observations',threshold)
   def scrubber():
    r=show('scrubber');value(r,'Time index',27);expect('Sample 28 / 28' in r.inner_text());reset('scrubber')
   check('time scrubber reaches last observation',scrubber)
   def comparison():
    r=show('comparison');value(r,'Reveal original (%)',75);expect('25%' in r.locator('img').nth(1).get_attribute('style'));reset('comparison')
   check('registered image comparison changes clipping, not source identity',comparison)
   def hotspots():
    r=show('hotspots');r.get_by_label('Inspect a component').select_option('detector');expect('records the output' in r.inner_text());reset('hotspots')
   check('component inspection updates explanation',hotspots)
   def tabs():
    r=show('tabs');r.get_by_label('Read a section').select_option('limits');expect('Synthetic data cannot' in r.inner_text());reset('tabs')
   check('optional section changes actual content',tabs)
   def layers():
    r=show('layers');r.locator('input[type=checkbox]').evaluate_all('(xs)=>xs.forEach(e=>{e.checked=false;e.dispatchEvent(new Event("change",{bubbles:true}))})');expect(r.locator('.w-plot svg rect,.w-plot svg line,.w-plot svg text').count()==0);reset('layers');expect(r.locator('.w-plot svg rect').count()==2)
   check('all layers off clears stale drawing; reset restores it',layers)
   def table():
    r=show('table');expect(state('table')['order']==['A','D','C','B']);r.get_by_role('button',name='Reverse sort').click();expect(state('table')['order']==['B','C','D','A']);reset('table')
   check('table sort changes numeric order and preserves row identity',table)
   def brush():
    r=show('brushing');value(r,'Lower bound',0);value(r,'Upper bound',100);expect(len(state('brushing')['selected'])==28);reset('brushing')
   check('linked selection conserves all observations at full range',brush)
   def histogram():
    r=show('histogram')
    for n in [3,7,12]:value(r,'Number of bins',n);expect(len(state('histogram')['counts'])==n);expect(sum(state('histogram')['counts'])==20)
    reset('histogram')
   check('histogram recomputes bins and conserves total count',histogram)
   def bootstrap():
    r=show('bootstrap');before=state('bootstrap')['mean'];r.get_by_role('button',name='Resample',exact=True).click();expect(state('bootstrap')['mean']!=before);reset('bootstrap');expect(state('bootstrap')['mean']==before)
   check('seeded resampling changes sample and resets deterministically',bootstrap)
   def ablation():
    r=show('ablation');r.locator('input[type=checkbox]').evaluate_all('(xs)=>xs.forEach(e=>{e.checked=false;e.dispatchEvent(new Event("change",{bubbles:true}))})');expect(state('ablation')['value']==40);reset('ablation');expect(state('ablation')['value']==75)
   check('toy ablation computes from selected components',ablation)
   def quiz():
    r=show('quiz');r.get_by_label('Select an answer').select_option('range');r.get_by_role('button',name='Check answer').click();expect('Correct:' in r.inner_text());reset('quiz')
   check('local quiz supplies feedback without network',quiz)
   def decision():
    r=show('decision');r.get_by_label('Evidence available?').select_option('no');expect(state('decision')['result']=='Gather evidence');reset('decision')
   check('decision branch follows actual selected condition',decision)
   def graph():
    r=show('graph');r.get_by_text('Enable bridge',exact=True).click();expect(state('graph')['reachable']==[0,1]);r.get_by_text('Enable direct edge',exact=True).click();expect(state('graph')['reachable']==[0,1,3]);reset('graph')
   check('graph recomputes reachability when edges change',graph)
   def matrix():
    r=show('matrix');value(r,'Row',4);value(r,'Column',5);expect('value 20' in r.inner_text());reset('matrix')
   check('matrix control identifies exact row and column',matrix)
   def magnifier():
    r=show('magnifier');value(r,'Zoom',2.5);expect('scale(2.5)' in r.locator('img').get_attribute('style'));reset('magnifier')
   check('image focus changes declared crop with unchanged pixels',magnifier)
   def video():
    r=show('video');v=r.locator('video');page.wait_for_function("document.querySelector('#interaction-video-widget video').readyState>=2",timeout=15000);expect(not v.evaluate('(v)=>!v.paused'));expect(abs(v.evaluate('(v)=>v.duration')-5)<.15)
    first=v.screenshot();r.get_by_role('button',name='Seek to 2 seconds').click();page.wait_for_function("Math.abs(document.querySelector('#interaction-video-widget video').currentTime-2)<.1");page.wait_for_timeout(120);second=v.screenshot();expect(first!=second,'video frames did not change');r.get_by_role('button',name='Play / pause').click();page.wait_for_function("!document.querySelector('#interaction-video-widget video').paused");show('audio');expect(v.evaluate('(v)=>v.paused'));reset('video');expect(v.evaluate('(v)=>v.currentTime')==0)
   check('real video duration, seek/frame change, play, leave-pause and reset',video)
   def audio():
    r=show('audio');v=r.locator('audio');page.wait_for_function("document.querySelector('#interaction-audio-widget audio').readyState>=2",timeout=15000);expect(abs(v.evaluate('(v)=>v.duration')-2)<.1);r.get_by_role('button',name='Play / pause').click();page.wait_for_function("!document.querySelector('#interaction-audio-widget audio').paused");show('parameter');expect(v.evaluate('(v)=>v.paused'));reset('audio')
   check('real audio duration, deliberate playback and leave-pause',audio)
   def orbit():
    r=show('cad-orbit');cv=r.locator('canvas');before=cv.screenshot();value(r,'Yaw (degrees)',90);expect(cv.screenshot()!=before);current=page.evaluate('SlideStudio.getState().current');cv.focus();cv.press('ArrowRight');expect(state('cad-orbit')['yaw']==95);expect(page.evaluate('SlideStudio.getState().current')==current);reset('cad-orbit')
   check('mesh vertex rendering responds to yaw and keyboard without slide leakage',orbit)
   def explode():
    r=show('cad-explode');before=r.locator('canvas').screenshot();value(r,'Explode amount',.8);expect(r.locator('canvas').screenshot()!=before);reset('cad-explode')
   check('assembly groups actually separate',explode)
   def section():
    r=show('cad-section');before=state('cad-section')['drawn'];value(r,'Visible height fraction',.2);expect(state('cad-section')['drawn']<before);reset('cad-section')
   check('cut plane clips actual triangles',section)
   def imports():
    r=show('cad-import');file=r.get_by_label('Open local mesh');file.set_input_files({'name':'triangle.obj','mimeType':'text/plain','buffer':b'v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3'});page.wait_for_function("SlideStudio.getWidgetState('interaction-cad-import-widget').triangles===1");expect('triangle.obj' in r.inner_text());buf=bytearray(134);struct.pack_into('<I',buf,80,1);struct.pack_into('<f',buf,108,1);struct.pack_into('<f',buf,124,1);file.set_input_files({'name':'triangle.stl','mimeType':'application/octet-stream','buffer':bytes(buf)});page.wait_for_function("SlideStudio.getWidgetState('interaction-cad-import-widget').filename==='triangle.stl'");expect(state('cad-import')['triangles']==1);file.set_input_files({'name':'bad.obj','mimeType':'text/plain','buffer':b'not a mesh'});page.wait_for_function("document.querySelector('#interaction-cad-import-widget .w-status').textContent.includes('No triangle')");expect(state('cad-import')['triangles']==1);reset('cad-import');expect(state('cad-import')['triangles']==328)
   check('local OBJ and binary STL import, invalid-file retention, fixture reset',imports)
   def ink():
    r=show('ink');r.get_by_role('button',name='Add focus annotation').click();expect(len(state('ink')['paths'])==1);reset('ink');expect(state('ink')['paths']==[]);r.get_by_role('button',name='Add focus annotation').click();r.get_by_role('button',name='Clear annotations').click();expect(state('ink')['paths']==[])
   check('annotation reset does not mutate its initial array',ink)
   def reentry():
    r=show('threshold');value(r,'Decision threshold',.7);before=state('threshold');show('parameter');show('threshold');expect(state('threshold')==before);page.evaluate('SlideStudio.prepareExport()');expect(page.evaluate('SlideStudio.getState().exporting'));expect(state('threshold')==before);page.evaluate('SlideStudio.setExport(false)');reset('threshold')
   check('widget selection survives re-entry and static export mode',reentry)
   def overview():
    show('parameter');page.locator('#studio-overview').click();expect(page.locator('.studio-thumb').count()==24);page.locator('.studio-thumb').nth(4).focus();page.keyboard.press('Enter');expect(page.evaluate('SlideStudio.getState().current')==4);expect(page.locator('.studio-thumb').count()==0)
   check('overview is keyboard-operable and restores slide structure',overview)
   def notes():
    page.locator('#studio-notes-btn').click();expect(page.locator('#studio-notes-btn').get_attribute('aria-expanded')=='true');page.keyboard.press('Escape');expect(page.locator('#studio-notes-btn').get_attribute('aria-expanded')=='false')
   check('notes open/escape updates accessibility state',notes)
   def mobile():
    page.set_viewport_size({'width':390,'height':844});show('parameter');b=page.locator('.slide.is-current').bounding_box();expect(b['x']>=-1 and b['x']+b['width']<=391);expect(page.locator('#studio-next').is_visible());page.set_viewport_size({'width':1280,'height':780})
   check('390px viewport keeps fitted canvas and navigation in viewport',mobile)
   def custom_data():
    import subprocess
    source="import fs from 'node:fs/promises';import slide from './assets/interactions/threshold.mjs';import {renderCraft} from './scripts/craft-core.mjs';slide.widgets[0].data={values:[.1,.3,.7,.9],labels:[0,1,0,1]};console.log(await renderCraft({title:'Data override test',mode:'workshop',slides:[slide],css:await fs.readFile('./assets/interactions/study.css','utf8')}));"
    content=subprocess.check_output(['node','--input-type=module','-e',source],cwd=ROOT,text=True)
    page.set_content(content,wait_until='load');expect(state('threshold')['counts']=={'tp':1,'fp':1,'fn':1,'tn':1})
   check('project-owned data overrides toy fixture and recomputes actual counts',custom_data)
   def index_search():
    page.set_content((ROOT/'gallery/index.html').read_text(),wait_until='load');expect(page.locator('#results tr').count()==228);page.get_by_label('Search by explanatory purpose').fill('error-bars');expect(page.locator('#results tr').count()==1)
   check('offline workshop index filters actual source catalog',index_search)
   # Probe actual animated transitions for each source, then direct jumps and reverse states.
   open_deck(page,ROOT/'gallery/motion.html')
   def motion():
    total=page.locator('.slide').count();expect(total==64)
    for i in range(total):
     page.evaluate('(i)=>SlideStudio.show(i,0)',i);m=page.evaluate('SlideStudio.getState().maxBuild');page.evaluate('(m)=>SlideStudio.show(SlideStudio.getState().current,m,{animate:true})',m);page.wait_for_timeout(25);expect(page.evaluate('SlideStudio.getState().step')==m);page.evaluate('SlideStudio.finish()');a=page.locator('.slide.is-current').evaluate('(s)=>[...s.querySelectorAll("[data-states]")].map(e=>e.getAttribute("style"))');page.evaluate('(i)=>{SlideStudio.show(i,0);SlideStudio.show(i,999)}',i);b=page.locator('.slide.is-current').evaluate('(s)=>[...s.querySelectorAll("[data-states]")].map(e=>e.getAttribute("style"))');expect(a==b,f'Non-deterministic final state at {i+1}')
    expect(not page.evaluate('SlideStudio.getState().warnings'))
   check('64 motion studies: timed entry, finish, reverse and direct-final equivalence',motion)
   def reduced():
    page.emulate_media(reduced_motion='reduce');page.evaluate('SlideStudio.show(0,1,{animate:true})');expect(page.evaluate('SlideStudio.getState().reducedMotion'));expect(page.evaluate('document.getAnimations().length')==0);page.emulate_media(reduced_motion='no-preference')
   check('reduced motion reaches same state without active animations',reduced)
   def print_restore():
    page.evaluate('SlideStudio.show(2,0)');before=page.evaluate('SlideStudio.getState()');page.evaluate('dispatchEvent(new Event("beforeprint"))');expect(page.evaluate('SlideStudio.getState().exporting'));page.evaluate('dispatchEvent(new Event("afterprint"))');s=page.evaluate('SlideStudio.getState()');expect(s['current']==before['current'] and s['step']==before['step'] and not s['exporting'])
   check('print lifecycle restores slide/step after export',print_restore)
   check('no page errors, player warnings or external network requests',lambda:(expect(not errors,str(errors)),expect(not blocked,str(blocked))))
   version=browser.version
  finally:browser.close()
 import os
 report={'browser':version,'loadMode':'inline-self-contained' if os.environ.get('SLIDE_STUDIO_INLINE')=='1' else 'file-url','viewportChecks':[[1280,780],[390,844]],'checks':checks,'passed':all(c['passed'] for c in checks),'errors':errors,'blockedNetwork':blocked,'limits':['Chromium only.','Tests validate behavior, not artistic quality, native-speaker fluency or external-agent performance.','Screenshots used for frame-change comparisons were held in memory.']}
 text=json.dumps(report,indent=2,ensure_ascii=False)
 if args.out:Path(args.out).write_text(text,encoding='utf-8')
 print(text);return 0 if report['passed'] else 1
if __name__=='__main__':sys.exit(main())
