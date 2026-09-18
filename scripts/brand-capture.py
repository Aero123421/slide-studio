#!/usr/bin/env python3
"""Read style evidence from an authorized PPTX, without copying text, notes or media.
The result is always a draft. It is not a faithful-import engine for arbitrary masters.
"""
from pathlib import Path
from collections import Counter
import argparse,json,zipfile,sys,xml.etree.ElementTree as ET
NS={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main'}
ROOT=Path(__file__).resolve().parents[1]
def capture(source,out):
    out=Path(out)
    if out.exists():raise ValueError('Output exists; choose a new private directory')
    if Path(source).stat().st_size>64*1024*1024:raise ValueError('Archive exceeds 64 MiB')
    with zipfile.ZipFile(source) as z:
        entries=z.infolist()
        if len(entries)>10000 or sum(i.file_size for i in entries)>128*1024*1024 or any(i.file_size>16*1024*1024 for i in entries if i.filename.endswith('.xml')):raise ValueError('Oversized archive')
        def xml(name):
            data=z.read(name)
            if b'<!DOCTYPE' in data or b'<!ENTITY' in data:raise ValueError('DTD/entity input rejected')
            return ET.fromstring(data)
        presentation=xml('ppt/presentation.xml');size=presentation.find('p:sldSz',NS)
        width=round(int(size.get('cx'))/9525);height=round(int(size.get('cy'))/9525)
        themes=[]
        for name in z.namelist():
            if name.startswith('ppt/theme/theme') and name.endswith('.xml'):
                t=xml(name);colors={}
                for e in t.findall('.//a:clrScheme/*',NS):
                    child=next(iter(e),None)
                    if child is not None:colors[e.tag.split('}')[-1]]=child.get('val') if child.tag.endswith('srgbClr') else child.get('lastClr')
                fonts=[e.get('typeface') for e in t.findall('.//a:fontScheme//a:latin',NS) if e.get('typeface')]
                themes.append({'colors':colors,'latinFamilies':fonts})
        slides=[];direct=Counter();font_counts=Counter()
        for name in sorted(n for n in z.namelist() if __import__('re').fullmatch(r'ppt/slides/slide\d+\.xml',n)):
            t=xml(name);boxes=[]
            for xf in t.findall('.//a:xfrm',NS):
                off=xf.find('a:off',NS);ext=xf.find('a:ext',NS)
                if off is not None and ext is not None:boxes.append({k:round(int(v)/9525,2) for k,v in [('x',off.get('x')),('y',off.get('y')),('width',ext.get('cx')),('height',ext.get('cy'))]})
            for e in t.findall('.//a:srgbClr',NS):direct[e.get('val','')]+=1
            for e in t.findall('.//a:latin',NS):font_counts[e.get('typeface','')]+=1
            slides.append({'index':len(slides)+1,'shapes':boxes})
    b=json.loads((ROOT/'assets/brands/example.json').read_text());b.update(name='Captured identity',status='draft',fictional=False);b['canvas']={'width':width,'height':height}
    if themes:
        c=themes[0]['colors']
        for role,token in [('background','lt1'),('text','dk1'),('accent','accent1')]:
            if c.get(token) and len(c[token])==6:b['colors'][role]='#'+c[token]
        families=themes[0]['latinFamilies']
        if families:
            b['typography']['heading']['family']=[families[0],'sans-serif'];b['typography']['body']['family']=[families[-1],'sans-serif'];b['typography']['caption']['family']=[families[-1],'sans-serif']
    b['rules']={'immutable':[],'flexible':[],'status':'Observed colors/families only. All inferred spacing/type sizes and secondary colors require review.'}
    out.mkdir(parents=True)
    (out/'brand.json').write_text(json.dumps(b,ensure_ascii=False,indent=2),encoding='utf-8')
    observations={'themes':themes,'directColors':dict(direct),'directFontFamilies':dict(font_counts),'slides':slides,'limits':['No source text, notes, source filename or media copied.','Not all layout inheritance or grouped coordinates resolved.','No automatic brand approval.']}
    (out/'observations.json').write_text(json.dumps(observations,ensure_ascii=False,indent=2),encoding='utf-8')
    (out/'RULES.md').write_text('# Private brand review\n\nInspect the source deck visually. Confirm observed choices versus accidental inconsistencies.\nRecord immutable rules, flexible composition choices, logo clear space and rights.\nSet approved only from authorized instructions or review. Keep this directory private.\n',encoding='utf-8')
    return {'slides':len(slides),'status':'draft','copiedContent':False}
if __name__=='__main__':
    a=argparse.ArgumentParser(description=__doc__);a.add_argument('source');a.add_argument('--out',required=True);args=a.parse_args()
    try:print(json.dumps(capture(args.source,args.out),indent=2))
    except Exception as e:print('Brand capture:',e,file=sys.stderr);sys.exit(1)
