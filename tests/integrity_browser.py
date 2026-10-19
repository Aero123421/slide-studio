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
    def build(content,css='',script=None):
        deck={'title':'Rendered integrity study','css':'.slide{background:#fff;color:#14232e;padding:64px;font:28px Arial}h1{font-size:48px}'+css,
              'slides':[{'id':'study','title':'Rendered integrity study','content':content}],**({'script':script} if script else {})}
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
        def sr_only_sibling():
            r=inspect('<h1 style="position:relative;font-size:96px">6 hours<span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap">Six hours separate the two peaks</span></h1>')
            expect(not has(r,'warnings','text-occlusion'),str(r))
        test('visually hidden screen-reader text neither covers nor is covered',sr_only_sibling)
        def empty_container():
            r=inspect('<p style="position:absolute;left:90px;top:140px">Label text stays readable.</p><div style="position:absolute;left:80px;top:120px;width:700px;height:120px;z-index:2"><span data-step="1" style="visibility:hidden">Later</span></div>')
            expect(not has(r,'warnings','text-occlusion'),str(r))
        test('an empty, unpainted container over text is not an occlusion',empty_container)
        def over_sibling():
            r=inspect('<div style="position:relative;height:200px"><div style="position:absolute;left:0;top:0;width:500px;height:120px;background:#1d3557"></div><p style="position:absolute;left:20px;top:30px;color:#fff;margin:0">412,000 objects</p></div>')
            expect(not r['integrityBlocking'] and any('412,000' in x['text'] for x in r['renderedIntegrity']['unmeasured']),str(r))
        test('white text on a painted sibling shape is left to pixel review, not failed',over_sibling)
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
        long='This label runs far past the right edge of the slide'
        clips=('<svg style="position:absolute;left:880px;top:220px;overflow:visible" width="300" height="260"><svg width="300" height="120"><text x="60" y="70" font-size="28">'+long+'</text></svg>'
               '<defs><clipPath id="cp"><rect x="0" y="130" width="300" height="120"/></clipPath></defs><g clip-path="url(#cp)"><text x="60" y="200" font-size="28">'+long+'</text></g></svg>')
        source.write_text(build('<h1>Clipped labels</h1>'+clips));args.out=str(folder/'svg-clips');clipped_ok=render(args)
        test('text clipped by a nested SVG viewport or an SVG clip path is not off-slide',lambda:expect(not clipped_ok['results'][0]['overflow'],str(clipped_ok['results'][0]['overflow'])))
        source.write_text(build('<h1>Unclipped label</h1><svg style="position:absolute;left:880px;top:220px;overflow:visible" width="300" height="120"><text x="60" y="70" font-size="28">'+long+'</text></svg>'));args.out=str(folder/'svg-overflow');unclipped=render(args)
        test('the same text without a clip is still reported off-slide',lambda:expect(unclipped['results'][0]['overflow'],str(unclipped['results'][0])))
        source.write_text(build('<p style="font-size:220px;line-height:.9;margin:0">2.9</p><p style="margin:0;font-size:28px">kWh of heat per kWh of electricity</p>'));args.out=str(folder/'hero');hero=render(args)
        test('a tight-leaded hero numeral is measured by its line box, not its font box',lambda:expect(not hero['results'][0]['overlaps'],str(hero['results'][0]['overlaps'])))
        source.write_text(build('<p style="font-size:60px;margin:0">Overlapping line</p><p style="font-size:60px;margin:-50px 0 0">Second line on top</p>'));args.out=str(folder/'overlap');overlap=render(args)
        test('text that really overlaps is still reported',lambda:expect(overlap['results'][0]['overlaps'],str(overlap['results'][0])))
        # PDF text layer: Inter's alternates (figure punctuation, tabular digits) export as private-use
        # code points; export.py must still deliver a searchable PDF (via its text-layer fallback).
        source.write_text(build('<h1>Opening hours</h1><p style="font-family:Inter,Arial;font-variant-numeric:tabular-nums">Open 18:00 – 19:30, 1,234 visits, +12.5%</p>'))
        pdf_out=folder/'hours.pdf'
        exported=subprocess.run([sys.executable,str(ROOT/'scripts/export.py'),str(source),str(pdf_out),'--force'],capture_output=True,text=True)
        def searchable_pdf():
            expect(exported.returncode==0,exported.stdout[-600:]+exported.stderr[-600:])
            from pypdf import PdfReader
            text=PdfReader(str(pdf_out)).pages[0].extract_text()
            expect('18:00' in text and '1,234' in text and not any(0xE000<=ord(c)<=0xF8FF for c in text),repr(text))
        test('PDF export keeps figures and punctuation searchable when a font maps alternates to private use',searchable_pdf)
        # A widget redraws for print (its onExport runs on beforeprint), after the fallback has been applied:
        # the redrawn figures must be searchable too. The redraw keeps the same text, as a widget's does.
        redraw="const draw=()=>{document.getElementById('axis').innerHTML=\"<text x='10' y='50' font-size='28' style='font-family:Inter;font-variant-numeric:tabular-nums'>0.1 0.2 0.3 at 18:00</text>\"};draw();addEventListener('beforeprint',draw);"
        source.write_text(build("<h1>Axis drawn by a widget</h1><svg id='axis' width='900' height='80'></svg>",script=redraw));redraw_pdf=folder/'redraw.pdf'
        redrawn=subprocess.run([sys.executable,str(ROOT/'scripts/export.py'),str(source),str(redraw_pdf),'--force'],capture_output=True,text=True)
        def searchable_redraw():
            expect(redrawn.returncode==0,redrawn.stdout[-600:]+redrawn.stderr[-600:])
            from pypdf import PdfReader
            text=PdfReader(str(redraw_pdf)).pages[0].extract_text()
            expect('0.1 0.2 0.3' in text and '18:00' in text and not any(0xE000<=ord(c)<=0xF8FF for c in text),repr(text))
        test('PDF text stays searchable when a widget redraws its figure while the page prints',searchable_redraw)
        # CJK fonts that share one glyph between a radical and its ideograph make Chromium write ⽉/⻑
        # into the text layer; the export rewrites those entries so 月 and 長 can be searched.
        source.write_text(build('<h1 lang="ja">月次報告の作り方を見直す</h1><p lang="ja" style="font-family:\'Noto Sans CJK JP\',IPAPGothic,sans-serif">店長の時間を店に戻す。西宮店、長期、方針、見込み。</p>'))
        ja_pdf=folder/'ja.pdf'
        ja=subprocess.run([sys.executable,str(ROOT/'scripts/export.py'),str(source),str(ja_pdf),'--force'],capture_output=True,text=True)
        def searchable_ja():
            expect(ja.returncode==0,ja.stdout[-600:]+ja.stderr[-600:])
            from pypdf import PdfReader
            text=''.join(p.extract_text() for p in PdfReader(str(ja_pdf)).pages)
            expect(all(w in text for w in ['月次','方','見直','店長','西宮']) and not any(0x2E80<=ord(c)<=0x2FDF for c in text),repr(text))
        test('PDF export writes ideographs, not radical code points, so Japanese text can be searched',searchable_ja)
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
