import unittest,tempfile,json,sys,importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from review_workspace import ReviewWorkspace,MARKER,LOCK,OWNER
from editorial import lint
spec=importlib.util.spec_from_file_location('svg_edit',ROOT/'scripts/svg-edit.py');svg_edit=importlib.util.module_from_spec(spec);spec.loader.exec_module(svg_edit)
class ReviewSafety(unittest.TestCase):
 def setUp(self):self.tmp=tempfile.TemporaryDirectory();self.base=Path(self.tmp.name);self.p=self.base/'review'
 def tearDown(self):self.tmp.cleanup()
 def create(self):
  with ReviewWorkspace(self.p) as w:w.write('report.json','original');w.write('review.html','review')
 def test_reuse_only_unchanged_owned_files(self):
  self.create();(self.p/'notes.txt').write_text('mine')
  with ReviewWorkspace(self.p) as w:w.write('report.json','replacement')
  self.assertEqual((self.p/'notes.txt').read_text(),'mine');self.assertFalse((self.p/'review.html').exists())
 def test_modified_file_protects_every_entry(self):
  self.create();(self.p/'review.html').write_text('edited')
  with self.assertRaises(ValueError):
   with ReviewWorkspace(self.p):pass
  self.assertEqual((self.p/'report.json').read_text(),'original');self.assertFalse((self.p/LOCK).exists())
 def test_unmarked_nonempty_is_protected(self):
  self.p.mkdir();(self.p/'my.pdf').write_text('mine')
  with self.assertRaises(ValueError):
   with ReviewWorkspace(self.p):pass
  self.assertTrue((self.p/'my.pdf').exists())
 def test_unknown_collision_not_overwritten(self):
  self.create();(self.p/'frame-001-final.png').write_bytes(b'mine')
  with ReviewWorkspace(self.p) as w:
   with self.assertRaises(ValueError):w.write('frame-001-final.png',b'new')
  self.assertEqual((self.p/'frame-001-final.png').read_bytes(),b'mine')
 def test_lock_rejects_concurrent_use(self):
  with ReviewWorkspace(self.p):
   with self.assertRaises(FileExistsError):
    with ReviewWorkspace(self.p):pass
  self.assertFalse((self.p/LOCK).exists())
 def test_symlink_root_and_ancestor_rejected(self):
  (self.base/'real').mkdir();(self.base/'link').symlink_to(self.base/'real',target_is_directory=True)
  for p in [self.base/'link',self.base/'link'/'child']:
   with self.assertRaises(ValueError):ReviewWorkspace(p)
 def test_owned_symlink_rejected(self):
  self.create();(self.p/'report.json').unlink();target=self.base/'source';target.write_text('original');(self.p/'report.json').symlink_to(target)
  with self.assertRaises(ValueError):
   with ReviewWorkspace(self.p):pass
  self.assertEqual(target.read_text(),'original')
 def test_traversal_manifest_rejected(self):
  self.create();marker=self.p/MARKER;doc=json.loads(marker.read_text());doc['files']['../source']='0'*64;marker.write_text(json.dumps(doc))
  with self.assertRaises(ValueError):
   with ReviewWorkspace(self.p):pass
  self.assertTrue((self.p/'report.json').exists())
 def test_foreign_manifest_rejected(self):
  self.p.mkdir();(self.p/MARKER).write_text(json.dumps({'owner':'not-us','version':1,'files':{}}))
  with self.assertRaises(ValueError):
   with ReviewWorkspace(self.p):pass
 def test_dry_run_changes_nothing(self):
  self.create();before={p.name:p.read_bytes() for p in self.p.iterdir()};ReviewWorkspace(self.p).plan();self.assertEqual(before,{p.name:p.read_bytes() for p in self.p.iterdir()})
 def test_exception_releases_lock_and_tracks_outputs(self):
  with self.assertRaises(RuntimeError):
   with ReviewWorkspace(self.p) as w:w.write('report.json','x');raise RuntimeError('test')
  self.assertFalse((self.p/LOCK).exists());self.assertEqual(ReviewWorkspace(self.p).plan(),['report.json'])
 def test_invalid_output_name_rejected(self):
  with ReviewWorkspace(self.p) as w:
   for name in ['../deck.html','deck.pdf','source.py','/etc/test']:
    with self.assertRaises(ValueError):w.write(name,'x')
class Editorial(unittest.TestCase):
 def test_fact_requires_evidence(self):self.assertFalse(lint({'slides':[{'id':'x','job':'j','title':'T','status':'observed'}]})['passed'])
 def test_unknown_source_rejected(self):self.assertFalse(lint({'slides':[{'id':'x','job':'j','title':'T','status':'reported','evidence':['missing']}]})['passed'])
 def test_illustration_is_not_forced_to_invent_source(self):self.assertTrue(lint({'slides':[{'id':'x','job':'j','title':'T','status':'illustrative'}]})['passed'])
 def test_word_hint_does_not_become_fact_failure(self):
  r=lint({'slides':[{'id':'x','job':'j','title':'Revolutionary idea','status':'proposed'}]});self.assertTrue(r['passed']);self.assertTrue(r['warnings'])
class SVG(unittest.TestCase):
 svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text id="a" x="20" y="40">Old</text></svg>'
 def test_derivation_changes_target(self):
  out=svg_edit.derive(self.svg,{'changes':[{'id':'a','text':'New','attrs':{'x':50}}]});self.assertIn('New',out);self.assertIn('x="50"',out);self.assertIn('Old',self.svg)
 def test_missing_target_rejected(self):
  with self.assertRaises(ValueError):svg_edit.derive(self.svg,{'changes':[{'id':'none','text':'No'}]})
 def test_executable_patch_rejected(self):
  with self.assertRaises(ValueError):svg_edit.derive(self.svg,{'changes':[{'id':'a','attrs':{'onclick':'bad()'}}]})
 def test_entities_script_and_urls_rejected(self):
  for s in ['<!DOCTYPE svg>'+self.svg,self.svg.replace('Old','<script/>'),self.svg.replace('Old','<image href="https://example.org/a"/>')]:
   with self.assertRaises(ValueError):svg_edit.passive(s)
if __name__=='__main__':unittest.main()
