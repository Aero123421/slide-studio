import unittest,tempfile,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from audit import audit
SKILL='---\nname: demo-skill\ndescription: "Build demo decks."\n---\n\n# Demo\n\n## First part\n\nSee [guide](references/guide.md#second-part).\n'
GUIDE='# Guide\n\n## Second part\n\n```sh\n# not a heading\n```\n\nUses `scripts/tool.py`.\n'
def problems(report):return {(i['problem'],i.get('target')) for i in report['issues']}
class DistributionAudit(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
  (self.root/'references').mkdir();(self.root/'scripts').mkdir()
  (self.root/'SKILL.md').write_text(SKILL);(self.root/'references/guide.md').write_text(GUIDE)
  (self.root/'scripts/tool.py').write_text('')
 def tearDown(self):self.tmp.cleanup()
 def only_extra(self):
  return {p for p in problems(audit(self.root)) if p[0]!='Required release file missing'}
 def test_valid_links_anchors_and_paths_pass(self):
  self.assertEqual(self.only_extra(),set())
 def test_repository_itself_passes(self):
  self.assertEqual(audit(ROOT)['issues'],[])
 def test_broken_anchor_is_reported(self):
  (self.root/'SKILL.md').write_text(SKILL.replace('#second-part','#missing'))
  self.assertIn(('Broken documentation anchor','references/guide.md#missing'),self.only_extra())
 def test_heading_inside_code_block_is_not_an_anchor(self):
  (self.root/'SKILL.md').write_text(SKILL.replace('#second-part','#not-a-heading'))
  self.assertIn(('Broken documentation anchor','references/guide.md#not-a-heading'),self.only_extra())
 def test_missing_backticked_repository_path_is_reported(self):
  (self.root/'references/guide.md').write_text(GUIDE.replace('scripts/tool.py','scripts/gone.py'))
  self.assertIn(('Documented repository path does not exist','scripts/gone.py'),self.only_extra())
 def test_invalid_frontmatter_is_reported(self):
  (self.root/'SKILL.md').write_text(SKILL.replace('name: demo-skill','name: Demo_Skill'))
  self.assertIn(('Invalid skill name','Demo_Skill'),self.only_extra())
  (self.root/'SKILL.md').write_text(SKILL.replace('Build demo decks.','x'*1025))
  self.assertIn(('Description must be 1-1024 characters',1025),self.only_extra())
  (self.root/'SKILL.md').write_text('# No frontmatter\n')
  self.assertIn(('Missing YAML frontmatter',None),self.only_extra())
if __name__=='__main__':unittest.main()
