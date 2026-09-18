#!/usr/bin/env python3
"""Negative and positive browser checks for copy channels and space diagnostics."""
from pathlib import Path
import subprocess,sys,json,argparse
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from qa import launch

def run():
    cases=[
      ('runtime stage cue is blocked','<h1 id="t">Conditions A and B</h1>',"document.querySelector('#t').textContent='学会発表時切替'",None,True),
      ('valid condition labels are not blocked','<h1>条件A / 条件B</h1>','',None,False),
      ('speaker notes stay outside visible copy','<h1>Conditions A and B</h1>','',{'notes':'学会発表時切替'},False),
      ('exact reviewed quotation is not blocked','<h1>学会発表時切替</h1>','',{'copyWaivers':[{'rule':'ja-stage-direction','quote':'学会発表時切替','reason':'The study evaluates that exact interface label.'}]},False),
      ('quiet whitespace is diagnostic, never an automatic failure','<h1 style="font-size:72px;position:absolute;left:120px;top:230px">A scoped conclusion.</h1>','',None,False)
    ];rows=[]
    with sync_playwright() as p:
        browser=launch(p);page=browser.new_page(viewport={'width':1280,'height':780})
        for name,content,script,extra,blocking in cases:
            deck={'title':'Review fixture','slides':[{'id':'page','title':'Review fixture','content':content,**(extra or {})}],'script':script}
            js="import {renderCraft} from './scripts/craft-core.mjs';console.log(await renderCraft("+json.dumps(deck,ensure_ascii=False)+"));"
            page.set_content(subprocess.check_output(['node','--input-type=module','-e',js],cwd=ROOT,text=True),wait_until='load')
            r=page.locator('.slide').evaluate((ROOT/'assets/runtime/review-metrics.js').read_text())
            rows.append({'name':name,'passed':r['copyBlocking']==blocking and bool(r['spaceDiagnostics']['headings']),'observedBlocking':r['copyBlocking']})
        version=browser.version;browser.close()
    return {'browser':version,'checks':rows,'passed':all(r['passed'] for r in rows),'limits':['Heuristics are tested against explicit fixtures, not all languages or production phrasing.']}
if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('--out');args=a.parse_args();r=run();s=json.dumps(r,ensure_ascii=False,indent=2)
    if args.out:Path(args.out).write_text(s,encoding='utf-8')
    print(s);sys.exit(0 if r['passed'] else 2)
