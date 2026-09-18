#!/usr/bin/env python3
"""Inspect fonts actually used by Chromium; optional explicit font contract.
No fonts are downloaded, installed, embedded or redistributed by this command.
CSS family declarations and document.fonts.check() are NOT proof of the actual face.
"""
from __future__ import annotations
import argparse,collections,json,re,sys,unicodedata
from pathlib import Path

TEXT_NODES=r'''()=>{
 const out=[];
 const visible=e=>{for(let p=e;p;p=p.parentElement){const s=getComputedStyle(p);if(s.display==='none'||s.visibility==='hidden'||+s.opacity===0)return false}return !!e.getClientRects().length};
 for(const e of document.querySelectorAll('.slide *')){
  if(e.closest('script,style,template,option')||!visible(e))continue;
  const text=[...e.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join('').trim();
  if(!text)continue;
  const s=getComputedStyle(e),key='font-'+out.length;e.setAttribute('data-studio-font-audit',key);
  out.push({key,slide:e.closest('.slide').id,text,language:e.closest('[lang]')?.lang||document.documentElement.lang,
   declared:s.fontFamily,size:s.fontSize,weight:s.fontWeight,style:s.fontStyle,
   // The last matching rule wins, so narrower rules can override the slide rule.
   matches:(window.__studioFontRules||[]).map((r,i)=>e.closest(r.selector)?i:-1).filter(i=>i>=0)});
 }
 return out;
}'''

def settle_fonts(page):
    """Call AFTER all print pages/states are made visible, not just initial load."""
    page.evaluate(r'''async()=>{
      await document.fonts.ready;
      const requests=new Map();
      for(const e of document.querySelectorAll('.slide *')){
        const s=getComputedStyle(e);
        if(!e.getClientRects().length||s.display==='none'||s.visibility==='hidden'||+s.opacity===0)continue;
        const text=[...e.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join('').trim();
        if(!text)continue;
        const font=`${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
        requests.set(font,(requests.get(font)||'')+text);
      }
      await Promise.all([...requests].map(([font,text])=>document.fonts.load(font,text)));
      await document.fonts.ready;
      await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    }''')

def load_contract(path):
    if path is None:return None
    c=json.loads(Path(path).read_text(encoding='utf-8'))
    if not isinstance(c,dict) or c.get('version')!=1:raise ValueError('Font contract version must be 1')
    if c.get('status')!='approved':raise ValueError('Review font choices before setting status=approved')
    rules=c.get('rules')
    if not isinstance(rules,list) or not rules:raise ValueError('Font contract requires rules')
    for r in rules:
        if not isinstance(r,dict) or not isinstance(r.get('selector'),str) or not r['selector'].strip():raise ValueError('Each font rule needs a CSS selector')
        if not isinstance(r.get('families'),list) or not r['families'] or any(not isinstance(f,str) or not f.strip() for f in r['families']):raise ValueError('Each font rule needs approved platform family names')
    return c

def family_key(name):return re.sub(r'[\s_\-]','',name).casefold()

def audit_fonts(page,contract=None):
    rules=contract['rules'] if contract else []
    page.evaluate('(r)=>window.__studioFontRules=r',rules)
    emulation=page.evaluate("({print:matchMedia('print').matches,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches})")
    session=page.context.new_cdp_session(page);rows=[];errors=[];warnings=[];matched=set()
    try:
        session.send('DOM.enable');session.send('CSS.enable')
        nodes=page.evaluate(TEXT_NODES)
        if len(nodes)>20000:raise ValueError('Too many text nodes for font audit; split the deck instead of silently sampling')
        root=session.send('DOM.getDocument',{'depth':0})['root']['nodeId']
        for n in nodes:
            node_id=session.send('DOM.querySelector',{'nodeId':root,'selector':f'[data-studio-font-audit="{n["key"]}"]'})['nodeId']
            fonts=session.send('CSS.getPlatformFontsForNode',{'nodeId':node_id})['fonts']
            n['actual']=[{'family':f['familyName'],'postScript':f.get('postScriptName',''),'glyphCount':f['glyphCount'],'custom':f['isCustomFont']} for f in fonts if f['glyphCount']]
            matches=n.pop('matches');index=matches[-1] if matches else None;matched.update(matches)
            if not n['actual']:(errors if contract else warnings).append({'slide':n['slide'],'text':n['text'][:60],'message':'No platform glyphs reported. Actual font use cannot be verified for this text.'})
            if rules:
                if index is None:errors.append({'slide':n['slide'],'text':n['text'][:60],'message':'Visible text is not covered by an approved font rule'})
                else:
                    allowed={family_key(f) for f in rules[index]['families']}
                    for f in n['actual']:
                        if family_key(f['family']) not in allowed:
                            errors.append({'slide':n['slide'],'text':n['text'][:60],'message':'Unapproved rendered font','actual':f['family'],'allowed':rules[index]['families']})
            else:
                first=n['declared'].split(',')[0].strip(' "\'')
                actual={family_key(f['family']) for f in n['actual']}
                if first not in ('sans-serif','serif','monospace','system-ui','cursive','fantasy') and family_key(first) not in actual:
                    warnings.append({'slide':n['slide'],'text':n['text'][:60],'message':'First CSS family is not the reported rendered family. Confirm an intentional fallback.','declared':first,'actual':[f['family'] for f in n['actual']]})
            n['text']=n['text'][:100];n.pop('key',None);rows.append(n)
        for i,r in enumerate(rules):
            if r.get('required',True) and i not in matched:errors.append({'message':'Required font selector matches no visible text','selector':r['selector']})
    finally:
        page.evaluate("()=>{document.querySelectorAll('[data-studio-font-audit]').forEach(e=>e.removeAttribute('data-studio-font-audit'));delete window.__studioFontRules}")
        session.detach()
        # Chromium can reset emulated media when a CDP inspection session detaches.
        # Restore it before taking expected text, geometry or the actual PDF.
        page.emulate_media(media='print' if emulation['print'] else 'screen',reduced_motion='reduce' if emulation['reduced'] else 'no-preference')
        settle_fonts(page)
    counts=collections.Counter()
    for r in rows:
        for f in r['actual']:counts[f['family']]+=f['glyphCount']
    return {'contractApplied':bool(contract),'passed':not errors,'actualFamilies':dict(counts),'errors':errors,'warnings':warnings,'nodes':rows,
            'limits':['Checks actual DOM text fonts in the selected browser state, not text drawn inside Canvas, images or opaque frames.','A matching family does not certify glyph shaping, language, weight or beauty; inspect the exported pages.','No automatic approval of fallback families.']}

def normalized(text):
    text=unicodedata.normalize('NFKC',text).casefold()
    return ''.join(c for c in text if not c.isspace() and unicodedata.category(c)!='Cf' and c not in ('\ufe0e','\ufe0f','\u00ad'))

def print_text(page):
    return page.locator('.slide').evaluate_all(r'''slides=>slides.map(slide=>{
      const result=[];const walk=document.createTreeWalker(slide,NodeFilter.SHOW_TEXT);let n;
      while(n=walk.nextNode()){
        const e=n.parentElement;if(!e||e.closest('script,style,template,option')||!n.textContent.trim())continue;
        let shown=!!e.getClientRects().length;
        for(let p=e;p&&p!==slide.parentElement;p=p.parentElement){const s=getComputedStyle(p);if(s.display==='none'||s.visibility==='hidden'||+s.opacity===0)shown=false}
        if(shown)result.push(n.textContent);
      }
      return result.join(' ');
    })''')

def pdf_postflight(file,expected_text):
    """Order-independent text coverage plus font resources using permissively licensed pypdf.
    This deliberately does not infer visual quality or glyph shaping from extraction.
    """
    try:from pypdf import PdfReader
    except ImportError as e:raise RuntimeError('PDF verification requires pypdf. Install the optional export dependencies; do not silently skip it.') from e
    errors=[];warnings=[];pages=[];font_types=collections.Counter();fonts={};seen_resources=set()
    def embedded(font):
        if str(font.get('/Subtype',''))=='/Type3':return bool(font.get('/CharProcs'))
        descendants=font.get('/DescendantFonts')
        if descendants:return all(embedded(f.get_object()) for f in descendants)
        descriptor=font.get('/FontDescriptor')
        return bool(descriptor and any(k in descriptor.get_object() for k in ['/FontFile','/FontFile2','/FontFile3']))
    def resource_fonts(resources):
        if not resources:return
        resources=resources.get_object();rid=id(resources)
        if rid in seen_resources:return
        seen_resources.add(rid)
        for key,ref in resources.get('/Font',{}).get_object().items() if resources.get('/Font') else []:
            font=ref.get_object();ident=(getattr(ref,'idnum',None),getattr(ref,'generation',None)) if hasattr(ref,'idnum') else ('direct',id(font))
            if ident in fonts:continue
            name=str(font.get('/BaseFont',key)).lstrip('/');kind=str(font.get('/Subtype','Unknown')).lstrip('/');present=embedded(font)
            fonts[ident]={'name':name,'type':kind,'embedded':present};font_types[kind]+=1
            if not present:warnings.append('PDF font not embedded: '+name)
        for ref in resources.get('/XObject',{}).get_object().values() if resources.get('/XObject') else []:
            obj=ref.get_object()
            if str(obj.get('/Subtype',''))=='/Form':resource_fonts(obj.get('/Resources'))
    with open(file,'rb') as stream:
        doc=PdfReader(stream)
        if len(doc.pages)!=len(expected_text):errors.append(f'Page count mismatch: HTML {len(expected_text)}, PDF {len(doc.pages)}')
        for i,p in enumerate(doc.pages):
            text=p.extract_text() or '';expected=expected_text[i] if i<len(expected_text) else ''
            missing=collections.Counter(normalized(expected))-collections.Counter(normalized(text));lost=sum(missing.values())
            if lost:errors.append(f'Page {i+1}: {lost} expected text characters not recoverable from PDF; inspect glyphs, clipping and font encoding')
            if '\ufffd' in text or '\x00' in text:errors.append(f'Page {i+1}: replacement/null characters in extracted text')
            pages.append({'page':i+1,'size':[float(p.mediabox.width),float(p.mediabox.height)],'expectedCharacters':len(normalized(expected)),
                          'extractedCharacters':len(normalized(text)),'missingCharacters':dict(missing),'passed':not lost and '\ufffd' not in text and '\x00' not in text})
            resource_fonts(p.get('/Resources'))
    return {'passed':not errors,'errors':errors,'warnings':warnings,'pages':pages,'fontTypes':dict(font_types),'fonts':list(fonts.values()),
            'limits':['Text character coverage is order-independent: it does not certify reading order or correct claims.',
                      'Type3 is not automatically a fault. Visual inspection is still required.',
                      'PDF text extraction can fail for legitimate complex-script encoding: inspect and use an explicit, documented acceptance process rather than ignoring it.']}

def main():
    from playwright.sync_api import sync_playwright
    from qa import launch,open_deck,guard_network
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('input');p.add_argument('--contract');p.add_argument('--screen',action='store_true');p.add_argument('--check',action='store_true');a=p.parse_args()
    try:
        contract=load_contract(a.contract)
        with sync_playwright() as pw:
            browser=launch(pw)
            try:
                page=browser.new_page(service_workers='block');blocked=[];guard_network(page,blocked);open_deck(page,Path(a.input))
                page.evaluate('()=>window.slideStudio.prepareExport()')
                if not a.screen:page.emulate_media(media='print')
                settle_fonts(page);r=audit_fonts(page,contract)
                if blocked:r['errors'].append({'message':'Blocked external requests','requests':blocked});r['passed']=False
            finally:browser.close()
        print(json.dumps(r,ensure_ascii=False,indent=2));return 2 if a.check and not r['passed'] else 0
    except Exception as e:print('Font audit:',e,file=sys.stderr);return 1
if __name__=='__main__':sys.exit(main())
