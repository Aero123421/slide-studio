"""Bounded review output with hash-protected ownership and explicit cleanup.
This protects ordinary project files, not against an attacker able to edit this process.
No recursive deletion. No symlink traversal. Never delete a modified or unowned file.
"""
from __future__ import annotations
import hashlib,json,os,re
from pathlib import Path
MARKER='.slide-studio-owned.json'
LOCK='.slide-studio-qa.lock'
OWNER='slide-studio-qa-v3'
SAFE=re.compile(r'^(report\.json|review\.html|frame-\d{3,5}-[a-z0-9-]+\.png)$')
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def safe_root(value):
    p=Path(os.path.abspath(value))
    for part in [p,*p.parents]:
        if part.is_symlink():raise ValueError('Symlink review path rejected')
    if p==Path(p.anchor):raise ValueError('Filesystem root is not a review directory')
    return p
class ReviewWorkspace:
    def __init__(self,value):self.root=safe_root(value);self.records={};self.locked=False
    def _load(self):
        marker=self.root/MARKER
        if marker.is_symlink():raise ValueError('Symlink ownership manifest rejected')
        if not marker.exists():
            others=[p for p in self.root.iterdir() if p.name!=LOCK] if self.root.exists() else []
            if others:raise ValueError('Nonempty, unmarked review directory: choose a new path')
            return {}
        doc=json.loads(marker.read_text(encoding='utf-8'))
        if doc.get('owner')!=OWNER or doc.get('version')!=1 or not isinstance(doc.get('files'),dict):raise ValueError('Invalid review ownership manifest')
        for name,sha in doc['files'].items():
            if not SAFE.fullmatch(name) or not re.fullmatch(r'[0-9a-f]{64}',sha):raise ValueError('Unsafe manifest entry')
            p=self.root/name
            if p.is_symlink():raise ValueError('Symlink owned file rejected')
            if p.exists() and (not p.is_file() or digest(p)!=sha):raise ValueError('Modified review file protected: '+name)
        return doc['files']
    def plan(self):return [name for name in self._load() if (self.root/name).exists()]
    def _manifest(self):
        # Small manifest write; a crash yields a conservative failure rather than cleanup.
        (self.root/MARKER).write_text(json.dumps({'owner':OWNER,'version':1,'files':self.records},indent=2),encoding='utf-8')
    def __enter__(self):
        self.root.mkdir(parents=True,exist_ok=True)
        fd=os.open(self.root/LOCK,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600);os.write(fd,str(os.getpid()).encode());os.close(fd);self.locked=True
        try:
            old=self._load() # Validate every entry before deleting any.
            for name in old:
                p=self.root/name
                if p.exists():p.unlink()
            self._manifest();return self
        except BaseException:
            self.__exit__(None,None,None);raise
    def write(self,name,data):
        if not self.locked or not SAFE.fullmatch(name):raise ValueError('Invalid owned output name')
        p=self.root/name
        if p.exists() or p.is_symlink():raise ValueError('Unowned output collision protected: '+name)
        payload=data.encode('utf-8') if isinstance(data,str) else data
        with p.open('xb') as f:f.write(payload)
        self.records[name]=hashlib.sha256(payload).hexdigest();self._manifest()
    def __exit__(self,*args):
        if self.locked:
            (self.root/LOCK).unlink(missing_ok=True);self.locked=False
