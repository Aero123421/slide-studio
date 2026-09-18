#!/usr/bin/env python3
"""Synthetic field-failure regressions. No user corpus or font binaries required.
Run with an environment containing Noto Sans/Serif CJK JP; skip claims are not passes.
"""
from pathlib import Path
import argparse,importlib.util,json,os,subprocess,sys,tempfile
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from playwright.sync_api import sync_playwright
from qa import launch,open_deck,guard_network
from font_audit import audit_fonts,load_contract,settle_fonts,print_text,pdf_postflight


def run():
    results=[]
    def expect(v,message='Expectation failed'):
        if not v:raise AssertionError(message)
    def test(name,fn):
        try:fn();results.append({'name':name,'passed':True})
        except Exception as e:results.append({'name':name,'passed':False,'error':str(e)[:1200]})
    with tempfile.TemporaryDirectory(prefix='studio-field-') as td:
        d=Path(td);source=d/'deck.mjs';html=d/'deck.html';pdf=d/'deck.pdf';contract=d/'fonts.json'
        source.write_text("""export default {title:'Font and layout regression',language:'ja',readingMode:'live',css:`
.slide{font-family:'Noto Sans CJK JP',sans-serif;padding:70px}h1{font-size:48px}p{font-size:28px}.second{font-family:'Noto Serif CJK JP',serif}.small{font-size:14px!important}.clip{height:12px;overflow:hidden;margin-top:20px}`,
slides:[{id:'a',title:'条件と結果',content:'<h1>条件と結果</h1><p>比較は500から650。差は150、変化率は30%。</p>'},
{id:'b',className:'second',title:'別の書体',content:'<h1>別の書体</h1><p>日本語の本文と Latin 123。</p>'}]};""",encoding='utf-8')
        build=subprocess.run(['node',str(ROOT/'scripts/craft.mjs'),'build',str(source),'--out',str(html)],capture_output=True,text=True)
        expect(build.returncode==0,build.stderr)
        c={'version':1,'status':'approved','rules':[{'selector':'.slide','families':['Noto Sans CJK JP']},{'selector':'.second','families':['Noto Serif CJK JP']}]}
        contract.write_text(json.dumps(c),encoding='utf-8')
        with sync_playwright() as pw:
            browser=launch(pw)
            try:
                page=browser.new_page(viewport={'width':1280,'height':780},service_workers='block',reduced_motion='reduce');blocked=[];guard_network(page,blocked)
                page.set_content(html.read_text(),wait_until='load');page.evaluate('()=>window.slideStudio.prepareExport()');page.emulate_media(media='print',reduced_motion='reduce');settle_fonts(page)
                report=audit_fonts(page,c)
                test('actual print faces satisfy reviewed CJK contract',lambda:expect(report['passed'],str(report['errors'])))
                test('font used only on second print page is actually inspected',lambda:expect('Noto Serif CJK JP' in report['actualFamilies']))
                test('CDP inspection preserves print emulation',lambda:expect(page.evaluate("matchMedia('print').matches")))
                test('CDP inspection preserves reduced motion',lambda:expect(page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")))
                expected=print_text(page)
                test('every print page has an expected text baseline',lambda:expect(len(expected)==2 and all(len(t)>10 for t in expected),repr(expected)))
                page.pdf(path=str(pdf),print_background=True,prefer_css_page_size=True)
                post=pdf_postflight(pdf,expected)
                test('two-page mixed-face PDF preserves text and page count',lambda:expect(post['passed'],repr(post['errors'])))
                test('lost text is rejected rather than silently accepted',lambda:expect(not pdf_postflight(pdf,[expected[0]+'Unexpected missing sentence',expected[1]])['passed']))
                test('unexpected PDF page count is rejected',lambda:expect(not pdf_postflight(pdf,expected[:1])['passed']))
                # A missing requested CSS family can still make fonts.check return true.
                page.add_style_tag(content=".slide{font-family:'StudioMissingFace123456','Noto Sans CJK JP',sans-serif!important}")
                settle_fonts(page);uncontracted=audit_fonts(page)
                test('missing first CSS family produces an actual-face warning',lambda:expect(any(w.get('declared')=='StudioMissingFace123456' for w in uncontracted['warnings'])))
                bad={'version':1,'status':'approved','rules':[{'selector':'.slide','families':['StudioMissingFace123456']}]}
                mismatch=audit_fonts(page,bad)
                test('matching CSS declaration cannot satisfy a missing actual font contract',lambda:expect(not mismatch['passed']))
                # Test density as advisory rather than an unconditional maximum count.
                page.emulate_media(media='screen');page.evaluate('()=>{slideStudio.setExport(false);slideStudio.show(0)}')
                page.eval_on_selector('#a',"e=>e.innerHTML='<h1>読みやすさ</h1><div style=\"position:absolute;left:80px;top:170px;width:1100px\"><p class=\"small\">'+('必要な比較条件と結果を同じ領域に並べて読む。'.repeat(15))+'</p></div>'")
                review=(ROOT/'assets/runtime/review-metrics.js').read_text()
                metrics=page.locator('#a').evaluate(review)
                test('small top-heavy text is reported for live reading',lambda:expect(any(h['kind']=='space-allocation' for h in metrics['qualityHints']),str(metrics['qualityHints'])))
                page.evaluate("slideStudio.meta.slides[0].readingMode='reference'")
                page.add_style_tag(content='.small{font-size:17px!important}')
                reference=page.locator('#a').evaluate(review)
                test('readable dense reference text is not condemned by a live-size rule',lambda:expect(not any(h['kind']=='density' for h in reference['qualityHints'])))
                page.eval_on_selector('#a',"e=>e.insertAdjacentHTML('beforeend','<div class=\"clip\"><p>切れている重要な本文</p></div>')")
                clipped=page.locator('#a').evaluate(review)
                test('text hidden behind an overflow clip is reported',lambda:expect(any(h['kind']=='text-clipping' for h in clipped['qualityHints'])))
                test('fixture runs without network requests',lambda:expect(not blocked,repr(blocked)))
            finally:browser.close()
        with sync_playwright() as pw:
            browser=launch(pw)
            try:
                page=browser.new_page(viewport={'width':1280,'height':780},service_workers='block');page.set_content((ROOT/'gallery/period-comparison.html').read_text(),wait_until='load')
                for months,winner,values in [(12,'B',[216,192,252]),(36,'C',[408,456,396]),(60,'C',[600,720,540]),(12,'B',[216,192,252])]:
                    page.click(f'[data-months="{months}"]')
                    def check_period(months=months,winner=winner,values=values):
                        expect(str(months)+'か月' in page.locator('#period-title').inner_text())
                        expect(winner+'案が最小' in page.locator('#period-title').inner_text())
                        expect([int(page.locator('#value-'+k).text_content()) for k in 'ABC']==values)
                        expect(all(abs(float(page.locator('#bar-'+k).get_attribute('width'))-value/800*790)<1e-6 for k,value in zip('ABC',values)))
                        expect('×'+str(months) in page.locator('#period-condition').inner_text())
                        expect(page.locator(f'[data-months="{months}"]').get_attribute('aria-pressed')=='true')
                    test(f'period {months}: title rank marks and conditions agree (including reverse selection)',check_period)
                page.focus('[data-months="36"]');page.keyboard.press('Enter')
                test('local period selector keeps native keyboard behavior',lambda:expect('36か月' in page.locator('#period-title').inner_text() and page.evaluate('slideStudio.getState().current')==0))
                page.evaluate('slideStudio.prepareExport()');page.emulate_media(media='print')
                test('static period output preserves selected values and removes dead controls',lambda:expect('36か月' in page.locator('#period-title').inner_text() and not page.locator('[data-months="36"]').is_visible()))
            finally:browser.close()
        # End-to-end atomic export rejection: preserve a previous destination.
        contract.write_text(json.dumps(bad));pdf.write_bytes(b'previous destination')
        env={**os.environ,'SLIDE_STUDIO_INLINE':'1','PYTHONDONTWRITEBYTECODE':'1'}
        cmd=[sys.executable,str(ROOT/'scripts/export.py'),str(html),str(pdf),'--force','--font-contract',str(contract),'--require-font-contract']
        rejected=subprocess.run(cmd,env=env,capture_output=True,text=True)
        test('font mismatch blocks export before replacing the old PDF',lambda:expect(rejected.returncode!=0 and pdf.read_bytes()==b'previous destination'))
        contract.write_text(json.dumps(c));accepted=subprocess.run(cmd,env=env,capture_output=True,text=True)
        test('approved contract passes the real export command',lambda:expect(accepted.returncode==0,accepted.stderr))
        test('export retains no standalone PNG review files',lambda:expect(not list(d.glob('*.png'))))
    return {'passed':all(r['passed'] for r in results),'checks':results,'limits':['Chromium on the tested environment only.','Synthetic regressions, not new multi-model generation results.','No aesthetic score is inferred from these passes.']}
if __name__=='__main__':
    a=argparse.ArgumentParser(description=__doc__);a.add_argument('--out');args=a.parse_args();r=run();s=json.dumps(r,ensure_ascii=False,indent=2)
    if args.out:Path(args.out).write_text(s,encoding='utf-8')
    print(s);sys.exit(0 if r['passed'] else 2)
