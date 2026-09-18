#!/usr/bin/env python3
"""Real key events, native controls, IME, repeat, lifecycle and intermediate animation.
The fixture is synthetic. This suite validates controlled input routes; it is not an aesthetic review.
"""
from pathlib import Path
import argparse,json,subprocess,sys
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from qa import launch,guard_network
SOURCE=r'''import {renderCraft} from './scripts/craft-core.mjs';
const st=JSON.stringify({0:{transform:'translateX(0px)'},1:{transform:'translateX(300px)'},2:{transform:'translateX(650px)'}});
const deck={title:'Keyboard regression fixture',css:'.slide{padding:64px}h1{font:48px Arial}.moving{position:absolute;left:80px;top:250px;width:160px;height:90px;background:#245b72;color:white}.entry{font:36px Arial;margin-top:70px}',slides:[
{id:'steps',title:'State fixture',content:`<h1>Stable states</h1><div id="moving" class="moving" data-duration="900" data-states='${st}'>A</div><div id="life"></div>`},
{id:'entry',title:'Entry fixture',content:'<h1>Progressive evidence</h1><p id="entering" class="entry" data-step="1" data-motion="lift" data-duration="900">The detail becomes visible.</p>'},
{id:'inputs',title:'Native controls',content:'<h1>Local controls</h1><label>Parameter <input id="range" type="range" min="0" max="10" value="4"></label><label>Text <input id="text"></label><div contenteditable="true">Editable field</div><div data-interactive><button id="local">Local action</button></div>'}
],script:`window.enterCount=0;window.leaveCount=0;window.localCount=0;slideStudio.register('life',{onEnter(){enterCount++},onLeave(){leaveCount++}});document.querySelector('#local').onclick=()=>localCount++;`};console.log(await renderCraft(deck));'''
def run():
    html=subprocess.check_output(['node','--input-type=module','-e',SOURCE],cwd=ROOT,text=True);checks=[];errors=[];blocked=[]
    with sync_playwright() as p:
        browser=launch(p);page=browser.new_page(viewport={'width':1280,'height':780},service_workers='block');page.on('pageerror',lambda e:errors.append(str(e)));guard_network(page,blocked);page.set_content(html,wait_until='load')
        def check(name,fn):
            try:fn();checks.append({'name':name,'passed':True});print('PASS',name,flush=True)
            except Exception as e:checks.append({'name':name,'passed':False,'error':str(e)});print('FAIL',name,str(e),flush=True)
        def expect(x,msg='Assertion failed'):
            if not x:raise AssertionError(msg)
        def show(i=0,s=0):page.evaluate('(a)=>{slideStudio.setExport(false);slideStudio.show(...a);document.activeElement.blur()}',[i,s])
        def state():return page.evaluate('slideStudio.getState()')
        def step(n):expect(state()['step']==n,str(state()))
        def after_click():show();page.click('#studio-next');step(1);page.keyboard.press('ArrowRight');step(2)
        check('ArrowRight still works after clicking Next',after_click)
        def backwards():show(0,2);page.click('#studio-prev');step(1);page.keyboard.press('ArrowLeft');step(0)
        check('ArrowLeft still works after clicking Previous',backwards)
        def pages():show();page.focus('#studio-next');page.keyboard.press('PageDown');step(1);page.keyboard.press('PageUp');step(0)
        check('PageDown and PageUp retain navigation-button focus semantics',pages)
        def bodykeys():
            for key in ['ArrowRight','PageDown','Enter',' ']:show();page.keyboard.press(key);step(1)
        check('body Enter Space PageDown and ArrowRight use the same step transition',bodykeys)
        def native():
            for key in ['Enter',' ']:show();page.focus('#studio-next');page.keyboard.press(key);step(1)
        check('native button Enter and Space activate once, not twice',native)
        def ends():show();page.focus('#studio-next');page.keyboard.press('End');expect(state()['current']==2);page.focus('#studio-prev');page.keyboard.press('Home');expect(state()['current']==0)
        check('Home and End work from the control strip',ends)
        def controls():show(2);page.focus('#range');page.keyboard.press('ArrowRight');expect(page.input_value('#range')=='5');expect(state()['current']==2);page.focus('#text');page.keyboard.type('abc');page.keyboard.press('ArrowLeft');expect(page.input_value('#text')=='abc');expect(state()['current']==2)
        check('range and text inputs retain native keyboard behavior',controls)
        def local():show(2);page.focus('#local');page.keyboard.press('Enter');expect(page.evaluate('localCount')==1);expect(state()['current']==2)
        check('local widget button does not navigate the presentation',local)
        def ime():show();page.evaluate("document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,isComposing:true}))");step(0);page.evaluate("document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,keyCode:229}))");step(0)
        check('IME composition and legacy composition keycode are ignored',ime)
        def repeat():show();page.keyboard.press('ArrowRight');page.evaluate("document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',repeat:true,bubbles:true}))");step(1)
        check('a held key does not skip additional semantic steps',repeat)
        def middle():
            show();page.keyboard.press('ArrowRight');page.wait_for_timeout(80);x=page.eval_on_selector('#moving',"e=>new DOMMatrix(getComputedStyle(e).transform).m41");expect(0<x<300,str(x));expect(page.evaluate('document.getAnimations().length')>0);page.evaluate('slideStudio.finish()');expect(page.eval_on_selector('#moving',"e=>new DOMMatrix(getComputedStyle(e).transform).m41")==300)
        check('real keyboard input creates a measurable intermediate transform',middle)
        def equivalence():
            values=[]
            for mode in ['button','keyboard','api']:
                show()
                if mode=='button':page.click('#studio-next')
                elif mode=='keyboard':page.keyboard.press('ArrowRight')
                else:page.evaluate('slideStudio.next()')
                page.evaluate('slideStudio.finish()');values.append(page.locator('#moving').get_attribute('style'))
            expect(len(set(values))==1)
        check('button keyboard and API commit identical final styles',equivalence)
        def rapid():show();page.keyboard.press('ArrowRight');page.keyboard.press('ArrowRight');page.keyboard.press('ArrowLeft');page.wait_for_timeout(1000);step(1);expect(page.eval_on_selector('#moving',"e=>new DOMMatrix(getComputedStyle(e).transform).m41")==300)
        check('rapid next-next-previous has no stale animation overwrite',rapid)
        def entry():
            show(1);page.keyboard.press('ArrowRight');page.wait_for_timeout(80);opacity=page.eval_on_selector('#entering','e=>+getComputedStyle(e).opacity');expect(0<opacity<1,str(opacity));page.evaluate('slideStudio.finish()');page.keyboard.press('ArrowLeft');expect(page.locator('#entering').get_attribute('aria-hidden')=='true');page.keyboard.press('ArrowRight');expect(page.evaluate('document.getAnimations().length')>0)
        check('data-step entry animation works on keyboard and replay',entry)
        def lifecycle():show(2);show(0);before=page.evaluate('enterCount');page.keyboard.press('ArrowRight');page.keyboard.press('ArrowRight');expect(page.evaluate('enterCount')==before)
        check('onEnter is not called again for each intra-slide build',lifecycle)
        def reduced():show();page.emulate_media(reduced_motion='reduce');page.keyboard.press('ArrowRight');step(1);expect(page.evaluate('document.getAnimations().length')==0);page.emulate_media(reduced_motion='no-preference')
        check('reduced-motion input reaches the same stable state',reduced)
        def printed():show(0,1);page.evaluate('dispatchEvent(new Event("beforeprint"))');expect(state()['exporting']);page.evaluate('dispatchEvent(new Event("afterprint"))');expect(not state()['exporting']);step(1)
        check('print lifecycle restores selected page and step',printed)
        def overview():show(0,1);page.click('#studio-overview');page.keyboard.press('Escape');expect(not state()['overview']);step(1);expect(page.eval_on_selector('#moving',"e=>new DOMMatrix(getComputedStyle(e).transform).m41")==300)
        check('overview Escape restores the actual tracked state',overview)
        def notes():show();page.click('#studio-notes-btn');page.keyboard.press('Escape');expect(page.locator('#studio-notes-btn').get_attribute('aria-expanded')=='false')
        check('notes Escape is available from a focused control',notes)
        check('no errors player warnings or unexpected network',lambda:(expect(not errors,str(errors)),expect(not blocked,str(blocked)),expect(not state()['warnings'],str(state()['warnings']))))
        version=browser.version;browser.close()
    return {'checks':checks,'passed':all(c['passed'] for c in checks),'browser':version,'errors':errors,'loadMode':'self-contained inline fixture','limits':['Chromium only.','Synthetic regression scenarios; user-authored choreography requires separate review.']}
if __name__=='__main__':
    a=argparse.ArgumentParser(description=__doc__);a.add_argument('--out');args=a.parse_args();report=run();text=json.dumps(report,ensure_ascii=False,indent=2)
    if args.out:Path(args.out).write_text(text,encoding='utf-8')
    print(text);sys.exit(0 if report['passed'] else 2)
