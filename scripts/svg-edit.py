#!/usr/bin/env python3
"""Inspect or derive a passive SVG by named-part changes. Original is never overwritten.
JSON patch: {"changes":[{"id":"node-a","attrs":{"x":"42"},"text":"A"}]}
Use --inspect to discover IDs/data-part names. Geometry/meaning still require review.
"""
import argparse,hashlib,json,re,sys,xml.etree.ElementTree as ET
from pathlib import Path
BLOCK=re.compile(r'<!DOCTYPE|<!ENTITY|<\s*(script|foreignObject|animate|animateTransform|animateMotion|set|style)\b|\bon\w+\s*=|javascript\s*:|@import',re.I)
def passive(text):
    if len(text)>4_000_000 or BLOCK.search(text):raise ValueError('Use a reviewed passive SVG; active content/entities/styles rejected')
    for m in re.finditer(r'(?:href|src)\s*=\s*([\'"])(.*?)\1',text,re.I):
        if not m[2].startswith('#'):raise ValueError('External SVG reference rejected')
    for m in re.finditer(r'url\(\s*[\'"]?([^\)\'"\s]+)',text,re.I):
        if not m[1].startswith('#'):raise ValueError('External CSS reference rejected')
    root=ET.fromstring(text)
    if root.tag.split('}')[-1]!='svg':raise ValueError('Expected SVG root')
    ids=[e.get('id') for e in root.iter() if e.get('id')]
    if len(ids)!=len(set(ids)):raise ValueError('Duplicate SVG IDs')
    return root
SAFE_ATTR=re.compile(r'^(?:x|y|x1|x2|y1|y2|cx|cy|r|rx|ry|width|height|viewBox|d|points|transform|fill|stroke|stroke-width|opacity|fill-opacity|stroke-opacity|font-size|font-weight|font-family|text-anchor|dominant-baseline|stroke-dasharray|stroke-dashoffset|visibility|aria-label)$')
def derive(text,patch):
    root=passive(text)
    if not isinstance(patch,dict) or not isinstance(patch.get('changes'),list):raise ValueError('Patch needs changes array')
    for c in patch['changes']:
        key='id' if 'id' in c else 'data-part';value=c.get(key)
        if not value:raise ValueError('Each change needs id or data-part')
        matches=[e for e in root.iter() if e.get(key)==value]
        if len(matches)!=1:raise ValueError('Target must match exactly once: '+value)
        e=matches[0]
        for k,v in c.get('attrs',{}).items():
            if not SAFE_ATTR.fullmatch(k) or not isinstance(v,(str,int,float)):raise ValueError('Unsafe attribute or value: '+k)
            e.set(k,str(v))
        if 'text' in c:
            if e.tag.split('}')[-1] not in {'text','tspan','title','desc'}:raise ValueError('Text replacement only on text/title/desc elements')
            if len(e):raise ValueError('Target contains child spans; patch a leaf instead')
            e.text=str(c['text'])
    ET.register_namespace('','http://www.w3.org/2000/svg');ET.register_namespace('xlink','http://www.w3.org/1999/xlink')
    result=ET.tostring(root,encoding='unicode');passive(result);return result

def main():
    a=argparse.ArgumentParser(description=__doc__);a.add_argument('input');a.add_argument('--inspect',action='store_true');a.add_argument('--patch');a.add_argument('--out');args=a.parse_args()
    try:
        source=Path(args.input);text=source.read_text(encoding='utf-8');root=passive(text)
        if args.inspect:print(json.dumps([{'tag':e.tag.split('}')[-1],**e.attrib} for e in root.iter() if e.get('id') or e.get('data-part')],ensure_ascii=False,indent=2));return 0
        if not args.patch or not args.out:raise ValueError('Specify --inspect or --patch PATCH.json --out NEW.svg')
        out=Path(args.out);prov=Path(str(out)+'.provenance.json')
        if out.resolve()==source.resolve() or out.exists() or prov.exists() or out.is_symlink() or prov.is_symlink():raise ValueError('Original/existing output protected')
        patch=json.loads(Path(args.patch).read_text(encoding='utf-8'));result=derive(text,patch);out.parent.mkdir(parents=True,exist_ok=True)
        out.write_text(result,encoding='utf-8')
        prov.write_text(json.dumps({'source':source.name,'sourceSha256':hashlib.sha256(text.encode()).hexdigest(),'outputSha256':hashlib.sha256(result.encode()).hexdigest(),'patch':patch,'status':'derived; visual and semantic review required'},ensure_ascii=False,indent=2),encoding='utf-8')
        print(out);return 0
    except Exception as e:print('SVG edit:',e,file=sys.stderr);return 1
if __name__=='__main__':sys.exit(main())
