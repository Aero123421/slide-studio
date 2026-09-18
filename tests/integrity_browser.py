#!/usr/bin/env python3
"""Positive/negative rendered-state regressions using original synthetic fixtures.
No network, private benchmark decks, copyrighted photos or special fonts required.
"""
from pathlib import Path
import argparse,base64,json,os,subprocess,sys,tempfile
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from playwright.sync_api import sync_playwright
from qa import launch,css_preflight,render

def run():
    rows=[]
    def expect(ok,message='Unexpected observation'):
        if not ok:raise AssertionError(message)
    def test(name,fn):
        try:fn();rows.append({'name':name,'passed':True})
        except Exception as e:rows.append({'name':name,'passed':False,'error':str(e)[:1200]})
    def build(content,css=''):
        deck={'title':'Rendered integrity study','css':'.slide{background:#fff;color:#14232e;padding:64px;font:28px Arial}h1{font-size:48px}'+css,
              'slides':[{'id':'study','title':'Rendered integrity study','content':content}]}
        js="import {renderCraft} from './scripts/craft-core.mjs';process.stdout.write(await renderCraft("+json.dumps(deck)+"));"
        return subprocess.check_output(['node','--input-type=module','-e',js],cwd=ROOT,text=True)
    integrity=(ROOT/'assets/runtime/rendered-integrity.js').read_text()
    img='data:image/svg+xml;base64,'+base64.b64encode(b'<svg xmlns="http://www.w3.org/2000/svg" width="200" height="400"><rect width="200" height="400" fill="#abc"/><rect y="20" width="200" height="40" fill="#a21"/></svg>').decode()
    with sync_playwright() as pw:
        browser=launch(pw);page=browser.new_page(viewport={'width':1280,'height':780},service_workers='block')
        def inspect(content,css=''):
            page.set_content(build(content,css),wait_until='load');page.evaluate('document.fonts.ready')
            return page.locator('.slide').evaluate(integrity)
        def has(r,level,kind):return any(x['kind']==kind for x in r['renderedIntegrity'][level])
        def bad_contrast():
            r=inspect('<div class="light"><p>Keep the sample cold.</p></div>', '.light{background:#f4f5f0;color:#fff}')
            expect(has(r,'issues','text-contrast'),str(r))
        test('inherited white text on a pale card is a blocking defect',bad_contrast)
        test('readable dark text on a pale card is retained',lambda:expect(not inspect('<p>Keep the sample cold.</p>')['integrityBlocking']))
        def unknown(css):
            r=inspect('<div class="light"><p>Actual pixels matter.</p></div>',css)
            expect(not r['integrityBlocking'] and r['renderedIntegrity']['unmeasured'],str(r))
        test('gradient text needs pixel review, not a fabricated ratio',lambda:unknown('.light{background:linear-gradient(black,white);color:white}'))
        test('opacity compositing is explicitly unmeasured',lambda:unknown('.slide{opacity:.5}.light{background:#fff;color:white}'))
        test('intentionally inactive controls do not create contrast failures',lambda:expect(not inspect('<button disabled style="background:white;color:white">Unavailable choice</button>')['integrityBlocking']))
        test('SVG text uses a separate visual review rather than CSS color',lambda:expect(inspect('<svg width="400" height="100"><text x="10" y="50" fill="black">Source label</text></svg>')['renderedIntegrity']['unmeasured']))
        def mark(explicit=False,paint=''):
            return inspect('<div '+('data-qa-mark="bar"' if explicit else 'class="bar"')+' style="width:80px;height:200px;'+paint+'"><span>80</span></div>')
        test('unmarked legacy transparent bar gets an advisory',lambda:expect(has(mark(),'warnings','unpainted-mark')))
        test('explicit nonzero mark without paint blocks QA',lambda:expect(has(mark(True),'issues','unpainted-mark')))
        test('filled marks and outlined marks remain legitimate',lambda:expect(not mark(True,'background:#315e85')['integrityBlocking'] and not mark(True,'border:3px solid #315e85')['integrityBlocking']))
        test('wide-gamut and CSS-outline marks are not called unpainted',lambda:expect(not mark(True,'background:color(display-p3 0.2 0.4 0.7)')['integrityBlocking'] and not mark(True,'outline:2px solid #315e85')['integrityBlocking']))
        test('transparent wrappers with painted child geometry are not missing marks',lambda:expect(not inspect('<div data-qa-mark="bar"><div style="height:80px;width:20px;background:#315e85"></div></div>')['integrityBlocking']))
        test('zero-valued marks are not forced into false nonzero bars',lambda:expect(not inspect('<div data-qa-mark="bar" data-qa-value="0" style="width:20px;height:20px"></div>')['integrityBlocking']))
        test('computed layout expectation catches ignored declarations',lambda:expect(has(inspect('<div data-qa-style=\'{"display":"grid"}\'><p>Results</p></div>'),'issues','computed-style')))
        test('correct computed layout expectation passes',lambda:expect(not inspect('<div style="display:grid" data-qa-style=\'{"display":"grid"}\'><p>Results</p></div>')['integrityBlocking']))
        def crop(fit='cover',focus=True,position='50% 50%'):
            return inspect('<img alt="Synthetic color regions" src="'+img+'" '+('data-qa-focus="[0,0.05,1,0.1]"' if focus else '')+' style="width:400px;height:100px;object-fit:'+fit+';object-position:'+position+'">')
        test('cover crop that removes declared subject blocks QA',lambda:expect(has(crop(),'issues','cropped-focus')))
        test('repositioned subject and contained image pass',lambda:expect(not crop(position='50% 5%')['integrityBlocking'] and not crop('contain')['integrityBlocking']))
        test('unannotated artistic crop is an advisory, not an automatic failure',lambda:expect(has(crop(focus=False),'warnings','substantial-crop') and not crop(focus=False)['integrityBlocking']))
        test('complex object-position is left to image review',lambda:expect(crop(position='calc(50% + 10px) 50%')['renderedIntegrity']['unmeasured']))
        def occluded():
            r=inspect('<p style="position:absolute;left:90px;top:140px">A title must remain visible.</p><div style="position:absolute;left:80px;top:155px;width:700px;height:100px;background:#bbc;z-index:2"></div>')
            expect(has(r,'warnings','text-occlusion'),str(r))
        test('a text line hidden behind another element gets a stacking warning',occluded)
        version=browser.version;browser.close()
    test('QA uses the same CSS preflight as the build gate',lambda:expect(not css_preflight(['.x{color:red;.grid{display:grid}'])['passed']))
    with tempfile.TemporaryDirectory(prefix='studio-integrity-') as td:
        folder=Path(td).resolve();source=folder/'deck.html';source.write_text(build('<h1>Observed result</h1><p>The paired values differ.</p>'))
        args=argparse.Namespace(input=str(source),out=str(folder/'review'),width=1280,height=780,reduced_motion=True,states='all',review_states=True,keep='none',max_failures=6)
        good=render(args)
        test('real QA command covers final state without auto-approving design',lambda:expect(good['passed'] and not good['deliveryApproved'] and good['cssIntegrity']['passed'],str(good['errors'])))
        source.write_text(source.read_text().replace('</style>', '.broken{color:red;.grid{display:grid}</style>',1))
        args.out=str(folder/'broken-css');broken=render(args)
        test('syntactically broken stylesheet fails real QA even without pageerror',lambda:expect(not broken['passed'] and not broken['cssIntegrity']['passed']))
        source.write_text(build('<p style="background:#fff;color:#fff">Essential information.</p>'));args.out=str(folder/'broken-contrast');bad=render(args)
        test('severe rendered contrast failure reaches the QA exit gate',lambda:expect(not bad['passed'] and any(x['integrityBlocking'] for x in bad['results'])))
        if os.environ.get('SLIDE_STUDIO_INLINE')!='1':
            (folder/'sample.svg').write_bytes(base64.b64decode(img.split(',')[1]));(folder/'local.css').write_text(':root{--fixture:1}')
            source.write_text(build('<h1>Source regions</h1><img alt="Synthetic regions" width="100" height="200" src="sample.svg">').replace('</head>','<link rel="stylesheet" href="local.css"></head>'))
            args.out=str(folder/'linked');linked=render(args)
            test('file-URL QA fingerprints actual linked CSS and image resources',lambda:expect(linked['passed'] and {a['path'] for a in linked['localAssets']}=={'local.css','sample.svg'},str(linked['localAssets'])))
            command=[sys.executable,str(ROOT/'scripts/verify-review.py'),str(source),'--report',str(folder/'linked/report.json')]
            current=subprocess.run(command,capture_output=True,text=True)
            test('real final-review CLI accepts matching HTML and assets',lambda:expect(current.returncode==0,current.stdout+current.stderr))
            (folder/'local.css').write_text(':root{--fixture:2}')
            stale=subprocess.run(command,capture_output=True,text=True)
            test('real final-review CLI rejects changed CSS with unchanged HTML',lambda:expect(stale.returncode==2 and 'local.css' in stale.stdout,stale.stdout+stale.stderr))
        else:
            rows.append({'name':'linked file fingerprint tests require file-URL mode','passed':False,'error':'Not exercised with SLIDE_STUDIO_INLINE=1; rerun in an environment supporting file URLs.'})
    return {'passed':all(r['passed'] for r in rows),'browser':version,'checks':rows,
            'limits':['Synthetic Chromium regressions, not a new multi-model generation batch.','No factual, photographic, artistic or full accessibility certification.']}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--out');a=p.parse_args();r=run();s=json.dumps(r,ensure_ascii=False,indent=2)
    if a.out:Path(a.out).write_text(s,encoding='utf-8')
    print(s);sys.exit(0 if r['passed'] else 2)
