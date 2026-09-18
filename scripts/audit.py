#!/usr/bin/env python3
"""Distribution hygiene check, not a complete privacy/security/legal certification.
Checks local docs/catalog paths, archives/caches/font files, and likely secrets/home paths.
In a git work tree the distribution is the tracked-file set, so .git and local
caches/venvs never fail the audit; plain directories are walked with .git skipped.
Use --manifest to write a hash inventory after review; no files are deleted.
"""
from pathlib import Path
import argparse,hashlib,json,re,subprocess,sys
BLOCK_DIRS={'node_modules','.venv','__pycache__','.git','.studio-review','.slide-studio-cache'}
BLOCK_EXT={'.woff','.woff2','.ttf','.otf','.eot','.pyc','.zip','.log'}
SECRET=re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}|\bsk-[A-Za-z0-9_-]{24,}')
HOME=re.compile(r'(?:/Users/[^/\s]+/|/home/(?!USER/|user/)[^/\s]+/|[A-Z]:\\Users\\[^\\\s]+\\)')
def list_files(root):
 if (root/'.git').is_dir():
  try:
   out=subprocess.run(['git','-C',str(root),'ls-files','-z'],capture_output=True,check=True).stdout
   return sorted(root/p for p in out.decode('utf-8').split('\0') if p),True
  except Exception:pass
 return sorted(p for p in root.rglob('*') if not p.is_dir() and '.git' not in p.relative_to(root).parts),False
def audit(root):
 root=Path(root).resolve();issues=[];warnings=[];inventory=[]
 files,from_git=list_files(root)
 flagged=set()
 if not from_git:
  for p in sorted(root.rglob('*')):
   if '.git' in p.relative_to(root).parts:continue
   if p.is_dir() and p.name in BLOCK_DIRS:
    parts=p.relative_to(root).parts
    if not any(part in BLOCK_DIRS for part in parts[:-1]):
     flagged.add(p.relative_to(root).as_posix());issues.append({'file':p.relative_to(root).as_posix(),'problem':'Excluded cache/dependency directory'})
 for p in files:
  rel=p.relative_to(root).as_posix()
  parts=p.relative_to(root).parts
  if any(part in BLOCK_DIRS for part in parts[:-1]):
   if from_git:
    d=parts[0]
    if d not in flagged:flagged.add(d);issues.append({'file':d,'problem':'Excluded cache/dependency directory'})
   continue
  if p.is_symlink():issues.append({'file':rel,'problem':'Symlink not allowed in distribution'});continue
  if p.suffix.lower() in BLOCK_EXT:issues.append({'file':rel,'problem':'Unwanted build/cache/font/archive file'})
  data=p.read_bytes()
  if rel!='MANIFEST.json':inventory.append({'path':rel,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
  if p.suffix in {'.md','.mjs','.js','.json','.html','.css','.py','.yaml','.yml','.txt'}:
   text=data.decode('utf-8',errors='replace')
   if SECRET.search(text):issues.append({'file':rel,'problem':'Possible embedded secret'})
   if rel!='scripts/audit.py' and HOME.search(text):issues.append({'file':rel,'problem':'Nonportable personal home path'})
   if re.search(r'data:(?:font/|application/(?:font|x-font))',text,re.I):issues.append({'file':rel,'problem':'Embedded font data'})
   if p.suffix=='.md':
    for m in re.finditer(r'(?<!!)\[[^\]]+\]\(([^\s)]+)(?:\s+"[^"]*")?\)',text):
     href=m[1]
     if re.match(r'[a-z]+:|#',href,re.I):continue
     target=(p.parent/href.split('#')[0]).resolve()
     if not target.exists():issues.append({'file':rel,'problem':'Broken local documentation link','target':href})
 cat=root/'assets/catalog.json'
 if cat.exists():
  rows=json.loads(cat.read_text())['resources'];seen=set()
  for r in rows:
   if r['id'] in seen:issues.append({'file':'assets/catalog.json','problem':'Duplicate resource ID'})
   seen.add(r['id'])
   for k in ['source','css','gallery']:
    target=root/r[k].split('#')[0]
    if not target.is_file():issues.append({'file':'assets/catalog.json','problem':'Missing '+k,'target':r[k]})
 for required in ['SKILL.md','README.md','LICENSE','THIRD_PARTY_NOTICES.md','VERIFICATION.md','gallery/index.html']:
  if not (root/required).is_file():issues.append({'file':required,'problem':'Required release file missing'})
 return {'passed':not issues,'files':len(inventory),'bytes':sum(x['bytes'] for x in inventory),'issues':issues,'warnings':warnings,'limits':['Heuristic hygiene scan, not a complete secret/PII/license audit.','Media provenance and public-example suitability require human review.'],'inventory':inventory}
def main():
 a=argparse.ArgumentParser(description=__doc__);a.add_argument('root',nargs='?',default=Path(__file__).resolve().parents[1]);a.add_argument('--manifest',action='store_true');args=a.parse_args()
 try:
  report=audit(args.root);inventory=report.pop('inventory')
  if args.manifest:
   if not report['passed']:raise ValueError('Refusing manifest while release checks fail')
   (Path(args.root)/'MANIFEST.json').write_text(json.dumps({'version':(Path(args.root)/'VERSION').read_text().strip(),'algorithm':'SHA-256','excludes':['MANIFEST.json'],'files':inventory},indent=2),encoding='utf-8')
  print(json.dumps(report,ensure_ascii=False,indent=2));return 0 if report['passed'] else 2
 except Exception as e:print('Audit:',e,file=sys.stderr);return 1
if __name__=='__main__':sys.exit(main())
