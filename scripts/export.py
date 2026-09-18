#!/usr/bin/env python3
"""Static PDF or picture-based PPTX from authored HTML, without persistent PNGs.
Use export-pptx.mjs for the separate native text/shape scene route.
"""
import argparse,io,json,os,sys,tempfile
from pathlib import Path
from qa import launch,open_deck,guard_network
from font_audit import load_contract,settle_fonts,audit_fonts,print_text,pdf_postflight

def run(a):
    from playwright.sync_api import sync_playwright
    inp=Path(a.input).resolve();dest=a.output or a.out
    if not dest:raise ValueError('Specify OUTPUT or --out OUTPUT')
    if a.output and a.out:raise ValueError('Use OUTPUT or --out, not both')
    out=Path(dest).absolute()
    if out.exists() and not a.force:raise ValueError('Output exists. Use --force only to replace the requested file.')
    if out.is_symlink():raise ValueError('Symlink output rejected')
    if out==inp:raise ValueError('Output cannot replace input HTML')
    if out.suffix.lower() not in ['.pdf','.pptx']:raise ValueError('Output must end in .pdf or .pptx')
    contract=load_contract(getattr(a,'font_contract',None));font_report=None;postflight=None
    if getattr(a,'require_font_contract',False) and contract is None:raise ValueError('This delivery requires an approved --font-contract')
    errors=[];blocked=[];out.parent.mkdir(parents=True,exist_ok=True)
    fd,tmp=tempfile.mkstemp(prefix='.studio-export-',suffix=out.suffix,dir=out.parent);os.close(fd)
    try:
        with sync_playwright() as p:
            browser=launch(p)
            try:
                page=browser.new_page(viewport={'width':1280,'height':780},service_workers='block',reduced_motion='reduce');page.on('pageerror',lambda e:errors.append(str(e)));guard_network(page,blocked);open_deck(page,inp)
                meta=page.evaluate("window.slideStudio.meta || {width:1280,height:720,slides:[]}");w=meta.get('width',1280);h=meta.get('height',720)
                page.evaluate('()=>window.slideStudio.prepareExport?.() || window.slideStudio.showAllBuilds()')
                n=page.locator('.slide').count()
                if out.suffix.lower()=='.pdf':
                    page.emulate_media(media='print')
                    settle_fonts(page)
                    font_report=audit_fonts(page,contract)
                    if not font_report['passed']:raise ValueError('Unapproved print fonts: '+json.dumps(font_report['errors'],ensure_ascii=False))
                    expected=print_text(page)
                    page.pdf(path=tmp,print_background=True,prefer_css_page_size=True)
                    postflight=pdf_postflight(tmp,expected)
                    if not postflight['passed']:raise ValueError('PDF postflight failed: '+repr(postflight['errors']))
                else:
                    from pptx import Presentation
                    from pptx.util import Inches
                    prs=Presentation();prs.slide_width=Inches(w/96);prs.slide_height=Inches(h/96);prs.core_properties.author='';prs.core_properties.title=meta.get('title','Presentation')
                    for i in range(n):
                        page.evaluate('(i)=>window.slideStudio.show(i,99999)',i);page.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
                        image=page.locator('.slide').nth(i).screenshot(animations='disabled')
                        slide=prs.slides.add_slide(prs.slide_layouts[6]);slide.shapes.add_picture(io.BytesIO(image),0,0,width=prs.slide_width,height=prs.slide_height)
                        notes=meta.get('slides',[]);note=notes[i] if len(notes)>i else {}
                        slide.notes_slide.notes_text_frame.text=note.get('notes','')+'\n\nSources: '+json.dumps(note.get('sources',[]),ensure_ascii=False)+'\nStatic picture-based export. HTML interactivity and motion are not preserved.'
                    prs.save(tmp)
                if errors or blocked:raise ValueError('Export blocked by page errors or external assets: '+repr(errors+blocked))
            finally:browser.close()
        os.replace(tmp,out)
    finally:
        if os.path.exists(tmp):os.unlink(tmp)
    return {'output':str(out),'slides':n,'mode':'static PDF' if out.suffix.lower()=='.pdf' else 'fidelity PPTX (pictures; not native editable objects)','persistentPNG':0,'fontAudit':font_report,'pdfPostflight':postflight,'deliveryApproved':False,'limits':'Export/font/text integrity only. Review the rendered PDF and the underlying claims before delivery.'}
p=argparse.ArgumentParser(description=__doc__);p.add_argument('input');p.add_argument('output',nargs='?');p.add_argument('--out');p.add_argument('--force',action='store_true');p.add_argument('--font-contract');p.add_argument('--require-font-contract',action='store_true')
if __name__=='__main__':
    try:print(json.dumps(run(p.parse_args()),indent=2))
    except Exception as e:print('Export:',e,file=sys.stderr);sys.exit(1)
