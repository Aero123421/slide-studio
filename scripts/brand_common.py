"""Private identity validation shared by native-template and capture tools."""
from pathlib import Path
import json,math,re
ROLES=('background','text','muted','accent','line','surface')
def validate_brand(b,allow_draft=False):
    if not isinstance(b,dict) or not isinstance(b.get('name'),str) or not b['name'].strip():raise ValueError('Brand name required')
    if b.get('status') not in ('draft','approved') or (b['status']!='approved' and not allow_draft):raise ValueError('Brand is not approved; use --allow-draft for review')
    c=b.get('canvas',{})
    if not all(isinstance(c.get(k),int) and 240<=c[k]<=8192 for k in ('width','height')):raise ValueError('Invalid canvas')
    for k in ROLES:
        if not re.fullmatch(r'#[0-9a-fA-F]{6}',b.get('colors',{}).get(k,'')):raise ValueError('Invalid color: '+k)
    for k in ('heading','body','caption'):
        t=b.get('typography',{}).get(k,{})
        if not isinstance(t.get('family'),list) or not t['family'] or not all(isinstance(f,str) and f.strip() and not re.search(r'[{}<>;\\]',f) for f in t['family']):raise ValueError('Invalid font family')
        if not isinstance(t.get('size'),(int,float)) or not 10<=t['size']<=200 or not isinstance(t.get('lineHeight'),(int,float)) or not 1<=t['lineHeight']<=2.5:raise ValueError('Invalid type role')
    if not all(isinstance(b.get('spacing',{}).get(k),(int,float)) and 0<=b['spacing'][k]<=min(c.values())/3 for k in ('margin','gutter')):raise ValueError('Invalid spacing')
    if b.get('logo'):
        l=b['logo']
        if not l.get('file') or not l.get('alt') or not all(isinstance(l.get(k),(int,float)) and math.isfinite(l[k]) for k in ('x','y','width','height')):raise ValueError('Invalid logo')
        if min(l['x'],l['y'])<0 or min(l['width'],l['height'])<=0 or l['x']+l['width']>c['width'] or l['y']+l['height']>c['height']:raise ValueError('Logo outside canvas')
    return b

def local_logo(brand,base):
    if not brand.get('logo'):return None
    base=Path(base).resolve();p=(base/brand['logo']['file']).resolve()
    if base not in p.parents or not p.is_file() or p.suffix.lower() not in ('.png','.jpg','.jpeg','.webp'):raise ValueError('Logo must be an authorized local PNG/JPEG/WebP inside the brand directory')
    if p.stat().st_size>16*1024*1024:raise ValueError('Logo is too large')
    return p
