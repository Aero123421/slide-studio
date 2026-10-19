#!/usr/bin/env python3
"""Real Chromium regression tests. No API keys, screenshots or reports retained by default.
Use --out a JSON path to retain a compact machine-readable record outside the skill.
Use SLIDE_STUDIO_INLINE=1 only when file navigation is unavailable and HTML is self-contained.
"""
from pathlib import Path
import argparse,json,os,re,sys,hashlib,struct,math,subprocess
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
   def reset(kind):show(kind).locator('[data-w-reset]').click()
   # Expected values come from each study's own module (its widget config), computed here independently of the runtime.
   def study(name):return json.loads(subprocess.check_output(['node','--input-type=module','-e',f"import m from './assets/interactions/{name}.mjs';console.log(JSON.stringify(m.widgets[0]))"],cwd=ROOT,text=True))
   def label(cfg,key):return cfg['controls'][key]['label']
   check('page identity, content and registered 24 widgets',lambda:(expect('Interactive' in page.title() or 'Interaction' in page.title()),expect(page.locator('.slide').count()==24),expect(len(page.evaluate('SlideStudio.getState().widgets'))==24)))
   def parameter():
    cfg=study('parameter');c=cfg['data']['constants'];dose=cfg['initial']['dose'];r=show('parameter');before=state('parameter')['halfLife']
    el=r.get_by_label(label(cfg,'halfLife'),exact=True);el.focus();el.press('ArrowRight');expect(state('parameter')['halfLife']>before);expect(page.evaluate('SlideStudio.getState().current')==0)
    expect(r.locator('.w-plot svg path').count()>0);reset('parameter');expect(state('parameter')['halfLife']==before)
    # Peak after the last dose of a repeated IV bolus: sum of (dose/volume)·e^(−k(t−n·interval)) over the doses given so far.
    last=math.ceil(c['horizon']/c['interval']-1e-9)-1;k=math.log(2)/before
    peak=sum(dose/c['volume']*math.exp(-k*(last-n)*c['interval']) for n in range(last+1))
    expect(f'{peak:.1f}' in r.locator('.w-readout').inner_text(),'readout peak does not match the dosing formula')
   check('range keyboard changes parameter without advancing slide; reset; peak matches the model',parameter)
   def threshold():
    cfg=study('threshold');v=cfg['data']['values'];l=cfg['data']['labels']
    def counts(t):return {'tp':sum(1 for a,b in zip(v,l) if a>=t and b),'fp':sum(1 for a,b in zip(v,l) if a>=t and not b),'fn':sum(1 for a,b in zip(v,l) if a<t and b),'tn':sum(1 for a,b in zip(v,l) if a<t and not b)}
    r=show('threshold')
    for t in (3,7):value(r,label(cfg,'threshold'),t);expect(state('threshold')['counts']==counts(t),f'counts at {t}')
    reset('threshold');expect(state('threshold')['counts']==counts(cfg['initial']['threshold']))
   check('threshold counts recomputed exactly from the study\'s scores',threshold)
   def scrubber():
    cfg=study('scrubber');labels=cfg['data']['labels'];r=show('scrubber');value(r,label(cfg,'time'),len(labels)-1)
    expect(labels[-1] in r.locator('.w-status').inner_text());expect(state('scrubber')['time']==len(labels)-1);reset('scrubber')
   check('time scrubber reaches last observation',scrubber)
   def comparison():
    cfg=study('comparison');r=show('comparison');value(r,label(cfg,'split'),75);expect('25%' in r.locator('img').nth(1).get_attribute('style'))
    page.wait_for_function("!document.querySelector('#interaction-comparison-widget .w-status').textContent.includes('Measuring')")
    expect('L* ' in r.locator('.w-status').inner_text(),'lightness was not measured from the pixels');reset('comparison')
   check('registered image comparison changes clipping, not source identity; regions measured',comparison)
   def hotspots():
    cfg=study('hotspots');part=next(p for p in cfg['data']['parts'] if p['id']!=cfg['initial']['part'])
    r=show('hotspots');r.get_by_label(label(cfg,'part')).select_option(part['id']);expect(part['body'][:40] in r.inner_text());reset('hotspots')
   check('component inspection updates explanation',hotspots)
   def tabs():
    cfg=study('tabs');sec=cfg['data']['sections'][-1];r=show('tabs');r.get_by_label(sec['name'],exact=True).check()
    expect(sec['body'][0][:20] in r.inner_text());expect(state('tabs')['tab']==sec['id']);expect(('figure' in sec)==(r.locator('.w-reading-figure svg').count()==1),'a section draws its figure, and only then');reset('tabs')
   check('optional section changes actual content',tabs)
   def layers():
    cfg=study('layers');shown=[l for l in cfg['data']['layers'] if cfg['initial'].get(l['id'])]
    r=show('layers');r.locator('input[type=checkbox]').evaluate_all('(xs)=>xs.forEach(e=>{e.checked=false;e.dispatchEvent(new Event("change",{bubbles:true}))})')
    expect(r.locator('.w-plot svg rect,.w-plot svg line,.w-plot svg text').count()==0);reset('layers')
    expect(r.locator('.w-plot svg rect').count()==sum(l['svg'].count('<rect') for l in shown));expect(r.locator('.w-plot [data-layer]').count()==len(shown))
   check('all layers off clears stale drawing; reset restores it',layers)
   def table():
    cfg=study('table');d=cfg['data'];key=cfg['initial']['sortBy'];order=[x[d['id']] for x in sorted(d['rows'],key=lambda x:x[key])]
    r=show('table');expect(state('table')['order']==order);r.get_by_role('button',name=cfg['text']['reverse']).click();expect(state('table')['order']==order[::-1])
    # A column header is a sort button: Referrals sorts largest first (the column's declared default direction).
    col=d['columns'][1];r.get_by_role('button',name=col['name'],exact=True).click()
    expect(state('table')['order']==[x[d['id']] for x in sorted(d['rows'],key=lambda x:x[col['key']],reverse=not col.get('ascending',True))]);reset('table');expect(state('table')['order']==order)
   check('table sort changes numeric order and preserves row identity',table)
   def brush():
    cfg=study('brushing');r=show('brushing');value(r,label(cfg,'low'),cfg['controls']['low']['min']);value(r,label(cfg,'high'),cfg['controls']['high']['max'])
    expect(len(state('brushing')['selected'])==len(cfg['data']['points']));reset('brushing')
   check('linked selection conserves all observations at full range',brush)
   def histogram():
    cfg=study('histogram');opts=cfg['controls']['bins']['values'];r=show('histogram')
    for i,n in enumerate(opts):value(r,label(cfg,'bins'),i);expect(len(state('histogram')['counts'])==n);expect(sum(state('histogram')['counts'])==len(cfg['data']['values']))
    reset('histogram')
   check('histogram recomputes bins and conserves total count',histogram)
   def bootstrap():
    r=show('bootstrap');before=state('bootstrap')['mean'];r.get_by_role('button',name='Resample',exact=True).click();expect(state('bootstrap')['mean']!=before);reset('bootstrap');expect(state('bootstrap')['mean']==before)
   check('seeded resampling changes sample and resets deterministically',bootstrap)
   def ablation():
    cfg=study('ablation');m=cfg['data']['measured'];full='+'.join(c['id'] for c in cfg['data']['components'])
    r=show('ablation');r.locator('input[type=checkbox]').evaluate_all('(xs)=>xs.forEach(e=>{e.checked=false;e.dispatchEvent(new Event("change",{bubbles:true}))})');expect(state('ablation')['value']==m['none'])
    reset('ablation');expect(state('ablation')['value']==m[full])
   check('ablation looks up the measured score of the selected components',ablation)
   def quiz():
    cfg=study('quiz');d=cfg['data'];right=next(o for o in d['options'] if o['id']==d['answer']);wrong=next(o for o in d['options'] if o['id']!=d['answer'])
    r=show('quiz');r.get_by_label(wrong['label'],exact=True).check();r.get_by_role('button',name=cfg['text']['check']).click();expect(cfg['text']['wrongPrefix'] in r.inner_text())
    r.get_by_label(right['label'],exact=True).check();r.get_by_role('button',name=cfg['text']['check']).click();expect(cfg['text']['correctPrefix'] in r.inner_text());expect(right['feedback'] in r.inner_text());reset('quiz')
   check('local quiz supplies feedback without network',quiz)
   def decision():
    cfg=study('decision');q=cfg['data']['questions'][0];v=next(o[0] for o in q['options'] if o[0]!=cfg['initial'][q['id']])
    r=show('decision');r.get_by_label(q['label']).select_option(v);expect(state('decision')['result']==cfg['data']['tree']['branches'][v]['result']);reset('decision')
   check('decision branch follows actual selected condition',decision)
   def graph():
    cfg=study('graph');d=cfg['data'];ids=[n['id'] for n in d['nodes']]
    def reach(on):
     adj={i:[] for i in ids}
     for e in d['edges']:
      if not e.get('toggle') or on.get(e['toggle']):adj[e['from']].append(e['to']);adj[e['to']].append(e['from'])
     seen={d['origin']};todo=[d['origin']]
     while todo:
      for b in adj[todo.pop()]:
       if b not in seen:seen.add(b);todo.append(b)
     return sorted(ids.index(i) for i in seen)
    r=show('graph');on=dict(cfg['initial']);expect(state('graph')['reachable']==reach(on))
    for t in d['toggles']:r.get_by_text(t['label'],exact=True).click();on[t['key']]=not on[t['key']];expect(state('graph')['reachable']==reach(on),t['key'])
    reset('graph')
   check('graph recomputes reachability when links open or close',graph)
   def matrix():
    cfg=study('matrix');d=cfg['data'];row,col=len(d['rows']),len(d['columns'])-1
    r=show('matrix');r.get_by_label(label(cfg,'row')).select_option(str(row));r.get_by_label(label(cfg,'column')).select_option(str(col))
    expect(f"{d['values'][row-1][col-1]:,}{d['suffix']}" in r.locator('.w-status').inner_text());expect(state('matrix')['row']==row and state('matrix')['column']==col);reset('matrix')
   check('matrix control identifies exact row and column',matrix)
   def magnifier():
    cfg=study('magnifier');r=show('magnifier');value(r,label(cfg,'zoom'),2.5);expect('scale(2.5)' in r.locator('img').get_attribute('style'));reset('magnifier')
   check('image focus changes declared crop with unchanged pixels',magnifier)
   def video():
    cfg=study('video');to=cfg['data']['seekTo'];r=show('video');v=r.locator('video');page.wait_for_function("document.querySelector('#interaction-video-widget video').readyState>=2",timeout=15000);expect(not v.evaluate('(v)=>!v.paused'));expect(abs(v.evaluate('(v)=>v.duration')-5)<.15)
    first=v.screenshot();r.get_by_role('button',name=cfg['text']['seek']).click();page.wait_for_function(f"Math.abs(document.querySelector('#interaction-video-widget video').currentTime-{to})<.1");page.wait_for_timeout(120);second=v.screenshot();expect(first!=second,'video frames did not change');r.get_by_role('button',name=cfg['text']['playPause']).click();page.wait_for_function("!document.querySelector('#interaction-video-widget video').paused");show('audio');expect(v.evaluate('(v)=>v.paused'));reset('video');expect(v.evaluate('(v)=>v.currentTime')==0)
   check('real video duration, seek/frame change, play, leave-pause and reset',video)
   def audio():
    r=show('audio');v=r.locator('audio');page.wait_for_function("document.querySelector('#interaction-audio-widget audio').readyState>=2",timeout=15000);expect(abs(v.evaluate('(v)=>v.duration')-2)<.1);expect('330' in r.locator('.w-status').inner_text(),'pitch not measured from the samples')
    r.get_by_role('button',name='Play / pause').click();page.wait_for_function("!document.querySelector('#interaction-audio-widget audio').paused");show('parameter');expect(v.evaluate('(v)=>v.paused'));reset('audio')
   check('real audio duration, measured pitch, deliberate playback and leave-pause',audio)
   def orbit():
    cfg=study('cad-orbit');r=show('cad-orbit');cv=r.locator('canvas');before=cv.screenshot();value(r,label(cfg,'yaw'),90);expect(cv.screenshot()!=before);current=page.evaluate('SlideStudio.getState().current');cv.focus();cv.press('ArrowRight');expect(state('cad-orbit')['yaw']==95);expect(page.evaluate('SlideStudio.getState().current')==current)
    expect(r.locator('.w-mesh-labels text').count()>=2*len(cfg['data']['parts']),'parts are not labelled');reset('cad-orbit')
    # Posts in view at eye level, from the OBJ itself: a post is hidden when a nearer post covers its whole projected width.
    verts=[];group=None;pins=set()
    for ln in (ROOT/'assets/media/obj.obj').read_text().splitlines():
     p=ln.split()
     if not p:continue
     if p[0]=='v':verts.append(tuple(map(float,p[1:4])))
     elif p[0] in('g','o'):group=' '.join(p[1:])
     elif p[0]=='f' and group=='Pins':pins.update(int(t.split('/')[0])-1 for t in p[1:])
    mx=sum(verts[i][0] for i in pins)/len(pins);my=sum(verts[i][1] for i in pins)/len(pins);posts={}
    for i in pins:posts.setdefault((verts[i][0]>mx,verts[i][1]>my),[]).append(verts[i][:2])
    def in_view(yaw):
     a=math.radians(yaw);iv=[(min(x*math.cos(a)-y*math.sin(a) for x,y in q),max(x*math.cos(a)-y*math.sin(a) for x,y in q),sum(x*math.sin(a)+y*math.cos(a) for x,y in q)/len(q)) for q in posts.values()]
     return sum(1 for lo,hi,d in iv if not any(d2>d and lo2<=lo+1e-6 and hi2>=hi-1e-6 for lo2,hi2,d2 in iv))
    expect(len(posts)==4 and in_view(0)==2 and in_view(35)==4,'post fixture changed')
    for yaw in(0,35):
     value(r,label(cfg,'yaw'),yaw);value(r,label(cfg,'pitch'),90);expect(f'{in_view(yaw)} of {len(posts)} posts in view' in r.locator('.w-status').inner_text(),f'posts in view at {yaw} degrees')
    reset('cad-orbit')
   check('mesh vertex rendering responds to yaw and keyboard without slide leakage; parts labelled; posts in view counted',orbit)
   def explode():
    cfg=study('cad-explode');r=show('cad-explode');before=r.locator('canvas').screenshot();value(r,label(cfg,'explode'),.8);expect(r.locator('canvas').screenshot()!=before);reset('cad-explode')
   check('assembly groups actually separate',explode)
   def section():
    cfg=study('cad-section');r=show('cad-section');before=state('cad-section')['drawn'];value(r,label(cfg,'cut'),.2);expect(state('cad-section')['drawn']<before);reset('cad-section')
   check('cut plane clips actual triangles',section)
   def imports():
    r=show('cad-import');file=r.get_by_label('Open local mesh');file.set_input_files({'name':'triangle.obj','mimeType':'text/plain','buffer':b'v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3'});page.wait_for_function("SlideStudio.getWidgetState('interaction-cad-import-widget').triangles===1");expect('triangle.obj' in r.inner_text());buf=bytearray(134);struct.pack_into('<I',buf,80,1);struct.pack_into('<f',buf,108,1);struct.pack_into('<f',buf,124,1);file.set_input_files({'name':'triangle.stl','mimeType':'application/octet-stream','buffer':bytes(buf)});page.wait_for_function("SlideStudio.getWidgetState('interaction-cad-import-widget').filename==='triangle.stl'");expect(state('cad-import')['triangles']==1);file.set_input_files({'name':'bad.obj','mimeType':'text/plain','buffer':b'not a mesh'});page.wait_for_function("document.querySelector('#interaction-cad-import-widget .w-status').textContent.includes('No triangle')");expect(state('cad-import')['triangles']==1);reset('cad-import');expect(state('cad-import')['triangles']==328)
   check('local OBJ and binary STL import, invalid-file retention, fixture reset',imports)
   def ink():
    cfg=study('ink');t=cfg['text'];r=show('ink');r.get_by_role('button',name=t['preset']).click();expect(len(state('ink')['paths'])==1);reset('ink');expect(state('ink')['paths']==[]);r.get_by_role('button',name=t['preset']).click();r.get_by_role('button',name=t['clear']).click();expect(state('ink')['paths']==[])
   check('annotation reset does not mutate its initial array',ink)
   def reentry():
    cfg=study('threshold');r=show('threshold');value(r,label(cfg,'threshold'),7);before=state('threshold');show('parameter');show('threshold');expect(state('threshold')==before);page.evaluate('SlideStudio.prepareExport()');expect(page.evaluate('SlideStudio.getState().exporting'));expect(state('threshold')==before)
    # The static view shows the chosen setting in words where the inputs were.
    expect(f"{label(cfg,'threshold')}: 7 or above" in r.locator('.w-export-summary').inner_text());expect(not r.locator('.w-controls').is_visible());page.evaluate('SlideStudio.setExport(false)');reset('threshold')
   check('widget selection survives re-entry and static export mode',reentry)
   def config_paths():
    # controls[key]=false hides a control; text templates (with plurals) and readouts fill from derived values; plain years have no digit grouping.
    r=show('bootstrap');expect(r.get_by_label('Sample size').count()==0);expect(r.get_by_role('button',name='Draw 100 more').count()==1)
    r=show('brushing');expect(r.locator('.w-value').first.inner_text()=='1900');expect('homes' in r.locator('.w-status').inner_text())
    r=show('ablation');expect(r.locator('.w-readout b').count()==1);r=show('parameter');expect(r.locator('.w-readout .w-kpi').count()==2)
    r=show('threshold');expect('Sepsis' in r.locator('.w-plot svg text').evaluate_all('(xs)=>xs.map(x=>x.textContent)'),'named classes are not drawn')
   check('richer config: hidden controls, templates, readouts, plain numbers, named classes',config_paths)
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
    # Project-owned data replaces the study's scores: four patients on the study's 0–10 scale, alert at its starting threshold (5).
    source="import fs from 'node:fs/promises';import slide from './assets/interactions/threshold.mjs';import {renderCraft} from './scripts/craft-core.mjs';slide.widgets[0].data={values:[1,3,7,9],labels:[0,1,0,1],domain:[0,10],step:1};console.log(await renderCraft({title:'Data override test',mode:'workshop',slides:[slide],css:await fs.readFile('./assets/interactions/study.css','utf8')}));"
    content=subprocess.check_output(['node','--input-type=module','-e',source],cwd=ROOT,text=True)
    page.set_content(content,wait_until='load');expect(state('threshold')['counts']=={'tp':1,'fp':1,'fn':1,'tn':1})
   check('project-owned data overrides the study data and recomputes actual counts',custom_data)
   def defaults():
    # Decks that pass no data still get the original fixtures and behaviour (the widget contract before richer config).
    kinds={'parameter':{'frequency':2,'amplitude':.7},'threshold':{'threshold':.5},'scrubber':{'time':0},'hotspots':{'part':'source'},'tabs':{'tab':'method'},'layers':{'base':True,'labels':True,'path':True},
     'table':{'ascending':True},'brushing':{'low':20,'high':75},'histogram':{'bins':6},'bootstrap':{'seed':1,'n':12},'ablation':{'a':True,'b':True,'c':True},'quiz':{'choice':'none','checked':False},
     'decision':{'evidence':'yes','interactive':'yes'},'graph':{'bridge':True,'direct':False},'matrix':{'row':1,'column':1},'ink':{'paths':[]}}
    slides=[{'id':'d-'+k,'title':'Default '+k,'className':'st','content':f'<h1 class="st-head">Default {k}</h1><div class="widget" data-interactive id="d-{k}-w"><div class="w-plot"></div><div class="w-controls"></div><output aria-live="polite" class="w-status"></output></div>','widgets':[{'id':f'd-{k}-w','kind':k,'initial':v}]} for k,v in kinds.items()]
    source="import fs from 'node:fs/promises';import {renderCraft} from './scripts/craft-core.mjs';const slides="+json.dumps(slides)+";console.log(await renderCraft({title:'Default fixtures',mode:'workshop',slides,css:await fs.readFile('./assets/interactions/study.css','utf8')}));"
    page.set_content(subprocess.check_output(['node','--input-type=module','-e',source],cwd=ROOT,text=True),wait_until='load')
    def go(k):page.evaluate('(id)=>SlideStudio.show(SlideStudio.meta.slides.findIndex(s=>s.id===id))','d-'+k);return page.locator(f'#d-{k}-w')
    def st(k):return page.evaluate('(id)=>SlideStudio.getWidgetState(id)',f'd-{k}-w')
    def rs(k):go(k).locator('[data-w-reset]').click()
    expect(len(page.evaluate('SlideStudio.getState().widgets'))==len(kinds))
    r=go('parameter');el=r.get_by_label('Frequency',exact=True);el.focus();el.press('ArrowRight');expect(st('parameter')['frequency']>2,'defaults step 1');rs('parameter');expect(st('parameter')['frequency']==2,'defaults step 2')
    r=go('threshold');value(r,'Decision threshold',.35);expect(st('threshold')['counts']=={'tp':9,'fp':4,'fn':2,'tn':5},'defaults step 3');value(r,'Decision threshold',.65);expect(st('threshold')['counts']=={'tp':5,'fp':1,'fn':6,'tn':8},'defaults step 4');rs('threshold')
    r=go('scrubber');value(r,'Time index',27);expect('Sample 28 / 28' in r.inner_text(),'defaults step 5')
    r=go('hotspots');r.get_by_label('Inspect a component').select_option('detector');expect('records the output' in r.inner_text(),'defaults step 6')
    r=go('tabs');r.get_by_label('Limitations',exact=True).check();expect('Synthetic data cannot' in r.inner_text(),'defaults step 7')
    r=go('layers');r.locator('input[type=checkbox]').evaluate_all('(xs)=>xs.forEach(e=>{e.checked=false;e.dispatchEvent(new Event("change",{bubbles:true}))})');expect(r.locator('.w-plot svg rect,.w-plot svg line,.w-plot svg text').count()==0,'defaults step 8');rs('layers');expect(r.locator('.w-plot svg rect').count()==2,'defaults step 9')
    r=go('table');expect(st('table')['order']==['A','D','C','B'],'defaults step 10');r.get_by_role('button',name='Reverse sort').click();expect(st('table')['order']==['B','C','D','A'],'defaults step 11')
    r=go('brushing');value(r,'Lower bound',0);value(r,'Upper bound',100);expect(len(st('brushing')['selected'])==28,'defaults step 12')
    r=go('histogram')
    for n in [3,7,12]:value(r,'Number of bins',n);expect(len(st('histogram')['counts'])==n,'defaults step 13');expect(sum(st('histogram')['counts'])==20,'defaults step 14')
    r=go('bootstrap');before=st('bootstrap')['mean'];r.get_by_role('button',name='Resample',exact=True).click();expect(st('bootstrap')['mean']!=before,'defaults step 15');rs('bootstrap');expect(st('bootstrap')['mean']==before,'defaults step 16')
    r=go('ablation');r.locator('input[type=checkbox]').evaluate_all('(xs)=>xs.forEach(e=>{e.checked=false;e.dispatchEvent(new Event("change",{bubbles:true}))})');expect(st('ablation')['value']==40,'defaults step 17');rs('ablation');expect(st('ablation')['value']==75,'defaults step 18')
    r=go('quiz');r.get_by_label('Estimate with interval',exact=True).check();r.get_by_role('button',name='Check answer').click();expect('Correct:' in r.inner_text(),'defaults step 19')
    r=go('decision');r.get_by_label('Evidence available?').select_option('no');expect(st('decision')['result']=='Gather evidence','defaults step 20')
    r=go('graph');r.get_by_text('Enable bridge',exact=True).click();expect(st('graph')['reachable']==[0,1],'defaults step 21');r.get_by_text('Enable direct edge',exact=True).click();expect(st('graph')['reachable']==[0,1,3],'defaults step 22')
    r=go('matrix');value(r,'Row',4);value(r,'Column',5);expect('value 20' in r.inner_text(),'defaults step 23')
    r=go('ink');r.get_by_role('button',name='Add focus annotation').click();expect(len(st('ink')['paths'])==1,'defaults step 24');rs('ink');expect(st('ink')['paths']==[],'defaults step 25')
   check('default fixtures keep the original behaviour when a deck passes no data',defaults)
   def index_search():
    # Expected counts come from assets/catalog.json, each study's declared language and the index's example list, filtered here the way a reader searches.
    rows=json.loads((ROOT/'assets/catalog.json').read_text(encoding='utf-8'))['resources']
    index=ROOT/'gallery/index.html';page.set_content(index.read_text(encoding='utf-8'),wait_until='load') if os.environ.get('SLIDE_STUDIO_INLINE')=='1' else page.goto(index.resolve().as_uri(),wait_until='load');examples=page.evaluate('examples');cards=page.locator('#results .item')
    total=len(rows)+len(examples);expect(cards.count()==total,f'{cards.count()} cards for {total} entries')
    hrefs=set(cards.locator('a').evaluate_all('(xs)=>xs.map(a=>a.getAttribute("href"))'))
    expect(all(r['gallery'].removeprefix('gallery/') in hrefs for r in rows),'every catalog study has a card')
    thumbs=cards.locator('img').evaluate_all('(xs)=>xs.map(i=>i.getAttribute("src"))');expect(all((ROOT/'gallery'/t).exists() for t in thumbs),'every card has its thumbnail')
    def hay(r):return ' '.join([r.get('title',''),r['id'],r.get('purpose',''),*r.get('tags',[])]).lower()
    for r in rows:r['language']='ja' if re.search(r"language:\s*['\"]ja",(ROOT/r['source']).read_text(encoding='utf-8')) else 'en'
    def hits(q,kind='',lang=''):return sum(1 for r in [*rows,*[{**e,'kind':'examples'} for e in examples]] if (not kind or r['kind']==kind) and (not lang or r.get('language','en')==lang) and all(w in hay(r) for w in q.split()))
    box=page.get_by_label('Search the gallery')
    box.fill('error-bars');expect(cards.count()==hits('error-bars')==1,'search narrows to one study');expect(page.locator('#count').inner_text()==f'1 of {total}')
    box.fill('加重平均');expect(cards.count()==hits('加重平均')>0,'Japanese tags are searchable')
    box.fill('');page.locator('.kinds button[data-kind="interactions"]').click();expect(cards.count()==hits('',kind='interactions')==24,'kind filter')
    page.get_by_label('Language').select_option('ja');expect(cards.count()==hits('',kind='interactions',lang='ja')>0,'kind and language filters combine')
    page.locator('.kinds button[data-kind=""]').click();page.get_by_label('Language').select_option('');box.fill('zzzz-no-such-study');expect(cards.count()==0 and page.locator('#results .empty').count()==1,'an empty search explains itself')
   check('gallery index lists every study and filters by search, kind and language',index_search)
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
 report={'browser':version,'loadMode':'inline-self-contained' if os.environ.get('SLIDE_STUDIO_INLINE')=='1' else 'file-url','viewportChecks':[[1280,780],[390,844]],'checks':checks,'passed':all(c['passed'] for c in checks),'errors':errors,'blockedNetwork':blocked,'limits':['Chromium only.','Tests validate behavior, not artistic quality, native-speaker fluency or external-agent performance.','Screenshots used for frame-change comparisons were held in memory.']}
 text=json.dumps(report,indent=2,ensure_ascii=False)
 if args.out:Path(args.out).write_text(text,encoding='utf-8')
 print(text);return 0 if report['passed'] else 1
if __name__=='__main__':sys.exit(main())
