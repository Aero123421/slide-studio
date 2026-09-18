#!/usr/bin/env python3
"""Exercise Next-button and keyboard paths on every slide of a trusted local deck.
Compares stable state and tracked target styles. Does not certify motion aesthetics.
"""
from pathlib import Path
import argparse,json,sys
from playwright.sync_api import sync_playwright
from qa import launch,open_deck,guard_network

def inspect(file):
    results=[];errors=[];blocked=[]
    with sync_playwright() as p:
        b=launch(p)
        try:
            page=b.new_page(viewport={'width':1280,'height':780},service_workers='block');page.on('pageerror',lambda e:errors.append(str(e)));guard_network(page,blocked);open_deck(page,file)
            if page.evaluate("slideStudio.kind")!='craft':raise ValueError('Navigation check requires the craft player')
            count=page.locator('.slide').count()
            def state():return page.evaluate("()=>{const s=slideStudio.getState();return {current:s.current,step:s.step,styles:[...document.querySelectorAll('.slide.is-current [data-states],.slide.is-current [data-step]')].map(e=>[e.getAttribute('style'),e.dataset.studioHidden])}}")
            for i in range(count):
                page.evaluate('(i)=>{slideStudio.setExport(false);slideStudio.show(i,0)}',i);maximum=page.evaluate('slideStudio.getState().maxBuild')
                if not maximum and i==count-1:results.append({'slide':i+1,'tested':False,'reason':'terminal static slide; no forward transition'});continue
                for step in range(maximum or 1):
                    targets=[]
                    for mode in ['button','body-arrow','focused-arrow','focused-page','body-enter','body-space']:
                        page.evaluate('(x)=>{slideStudio.show(x.i,x.step);document.activeElement.blur()}',{'i':i,'step':step})
                        if mode=='button':page.locator('#studio-next').click()
                        else:
                            if mode.startswith('focused'):page.locator('#studio-next').focus()
                            key={'body-arrow':'ArrowRight','focused-arrow':'ArrowRight','focused-page':'PageDown','body-enter':'Enter','body-space':' '}[mode]
                            page.keyboard.press(key)
                        page.evaluate('slideStudio.finish()');targets.append(state())
                    expected={'current':i,'step':step+1} if maximum else {'current':i+1,'step':0}
                    passed=all(t==targets[0] for t in targets) and all(targets[0][k]==v for k,v in expected.items())
                    results.append({'slide':i+1,'fromStep':step,'tested':True,'paths':6,'passed':passed})
            version=b.version
        finally:b.close()
    return {'browser':version,'slides':count,'transitions':sum(r.get('tested',False) for r in results),'pathsPerTransition':6,'results':results,'errors':errors,'blockedNetwork':blocked,'passed':not errors and not blocked and all(r.get('passed',True) for r in results),'limits':['Tracked state/style equivalence only; inspect intermediate animation frames separately.','Native inputs deliberately retain their own keys.','Chromium only.']}
if __name__=='__main__':
    a=argparse.ArgumentParser(description=__doc__);a.add_argument('input');a.add_argument('--out');args=a.parse_args()
    try:
        result=inspect(args.input);text=json.dumps(result,indent=2)
        if args.out:Path(args.out).write_text(text,encoding='utf-8')
        print(text);sys.exit(0 if result['passed'] else 2)
    except Exception as e:print('Navigation QA:',e,file=sys.stderr);sys.exit(1)
